import { NextResponse } from 'next/server';
import crypto from 'crypto';
import clientPromise from '../../lib/mongodb';

/**
 * POST /api/translate  { texts: string[], target: 'ar' | 'fr', source?: 'en' }
 *  → { translations: string[] }  (same order; the original text when every
 *    provider fails, so the page never breaks)
 *
 * Free providers are tried in order. A provider that errors or hits its quota
 * is put on a cooldown and the next one takes over:
 *
 *   0. Optional keyed free tiers, used first when their env var is set:
 *        AZURE_TRANSLATOR_KEY (+ AZURE_TRANSLATOR_REGION)  2M chars / month free
 *        DEEPL_API_KEY  (DeepL API Free, key ends with ":fx")  500k chars / month
 *        GOOGLE_TRANSLATE_KEY  (Cloud Translation)            500k chars / month
 *   1. Google Translate web endpoint (gtx)          – no key
 *   2. Microsoft Edge translator                    – no key
 *   3. Lingva (Google proxy, several instances)     – no key
 *   4. MyMemory                                     – no key (MYMEMORY_EMAIL raises the quota)
 *   5. LibreTranslate public instances              – no key (LIBRETRANSLATE_URL/KEY to add your own)
 *
 * Every translation is cached in memory and in MongoDB (collection
 * "Translation"), so each sentence is only ever sent to a provider once —
 * that is what keeps the whole site within the free quotas.
 */

export const dynamic = 'force-dynamic';

const TARGETS = ['ar', 'fr'];
const MAX_TEXTS = 80;
const MAX_LEN = 4000;
const COOLDOWN_MS = 10 * 60 * 1000;
const TIMEOUT_MS = 8000;

const memory = new Map(); // `${target}:${hash}` → translation
const cooldown = new Map(); // provider name → time it may be used again

const hash = (s) => crypto.createHash('sha1').update(s).digest('hex');

/**
 * Some providers send HTML entities back ("&#10;" for a line break,
 * "&#39;", "&quot;", "&amp;"…). Turn them into the real characters.
 */
const NAMED = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: '\u00a0', laquo: '«', raquo: '»', rsquo: '’', lsquo: '‘', hellip: '…' };
function decodeEntities(str) {
  let out = String(str ?? '');
  // twice, for double-encoded text such as "&amp;#10;"
  for (let i = 0; i < 2; i += 1) {
    out = out
      .replace(/&#(\d+);?/g, (_, n) => String.fromCodePoint(Number(n)))
      .replace(/&#x([0-9a-f]+);?/gi, (_, n) => String.fromCodePoint(parseInt(n, 16)))
      .replace(/&([a-z]+);/gi, (m, name) => NAMED[name.toLowerCase()] ?? m);
  }
  return out;
}

/** The translation, cleaned, keeping the original's line breaks style. */
const clean = (original, translated) => {
  let out = decodeEntities(translated);
  // A text node without line breaks must not get any (they render as gaps)
  if (!/\n/.test(original)) out = out.replace(/\s*\n+\s*/g, ' ');
  return out;
};

async function fetchJson(url, options = {}) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(url, { ...options, signal: ctrl.signal, cache: 'no-store' });
    if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
    return await res.json();
  } finally {
    clearTimeout(timer);
  }
}

/** Runs `fn` over `items` with at most `limit` at once. */
async function pool(items, limit, fn) {
  const out = new Array(items.length);
  let i = 0;
  const workers = Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (i < items.length) {
      const idx = i++;
      out[idx] = await fn(items[idx], idx);
    }
  });
  await Promise.all(workers);
  return out;
}

/* ---------------------------------------------------------------- providers */

const providers = [
  {
    name: 'azure',
    enabled: () => !!process.env.AZURE_TRANSLATOR_KEY,
    async translate(texts, target, source) {
      const headers = {
        'Content-Type': 'application/json',
        'Ocp-Apim-Subscription-Key': process.env.AZURE_TRANSLATOR_KEY,
      };
      if (process.env.AZURE_TRANSLATOR_REGION)
        headers['Ocp-Apim-Subscription-Region'] = process.env.AZURE_TRANSLATOR_REGION;
      const json = await fetchJson(
        `https://api.cognitive.microsofttranslator.com/translate?api-version=3.0&from=${source}&to=${target}`,
        { method: 'POST', headers, body: JSON.stringify(texts.map((Text) => ({ Text }))) }
      );
      return json.map((r) => r.translations[0].text);
    },
  },
  {
    name: 'deepl',
    enabled: () => !!process.env.DEEPL_API_KEY,
    async translate(texts, target, source) {
      const key = process.env.DEEPL_API_KEY;
      const host = key.endsWith(':fx') ? 'api-free.deepl.com' : 'api.deepl.com';
      const json = await fetchJson(`https://${host}/v2/translate`, {
        method: 'POST',
        headers: { Authorization: `DeepL-Auth-Key ${key}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: texts, target_lang: target.toUpperCase(), source_lang: source.toUpperCase() }),
      });
      return json.translations.map((t) => t.text);
    },
  },
  {
    name: 'google-cloud',
    enabled: () => !!process.env.GOOGLE_TRANSLATE_KEY,
    async translate(texts, target, source) {
      const json = await fetchJson(
        `https://translation.googleapis.com/language/translate/v2?key=${process.env.GOOGLE_TRANSLATE_KEY}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ q: texts, target, source, format: 'text' }),
        }
      );
      return json.data.translations.map((t) => t.translatedText);
    },
  },
  {
    name: 'google-gtx',
    enabled: () => true,
    async translate(texts, target, source) {
      return pool(texts, 6, async (q) => {
        const json = await fetchJson(
          `https://translate.googleapis.com/translate_a/single?client=gtx&dt=t&sl=${source}&tl=${target}&q=${encodeURIComponent(q)}`
        );
        const out = (json?.[0] || []).map((part) => part?.[0] || '').join('');
        if (!out) throw new Error('empty');
        return out;
      });
    },
  },
  {
    name: 'microsoft-edge',
    enabled: () => true,
    token: null,
    tokenAt: 0,
    async translate(texts, target, source) {
      if (!this.token || Date.now() - this.tokenAt > 8 * 60 * 1000) {
        const ctrl = new AbortController();
        const timer = setTimeout(() => ctrl.abort(), TIMEOUT_MS);
        try {
          const res = await fetch('https://edge.microsoft.com/translate/auth', { signal: ctrl.signal, cache: 'no-store' });
          if (!res.ok) throw new Error(`auth ${res.status}`);
          this.token = await res.text();
          this.tokenAt = Date.now();
        } finally {
          clearTimeout(timer);
        }
      }
      const json = await fetchJson(
        `https://api-edge.cognitive.microsofttranslator.com/translate?api-version=3.0&from=${source}&to=${target}`,
        {
          method: 'POST',
          headers: { Authorization: `Bearer ${this.token}`, 'Content-Type': 'application/json' },
          body: JSON.stringify(texts.map((Text) => ({ Text }))),
        }
      );
      return json.map((r) => r.translations[0].text);
    },
  },
  {
    name: 'lingva',
    enabled: () => true,
    hosts: ['https://lingva.ml', 'https://lingva.lunar.icu', 'https://translate.plausibility.cloud'],
    async translate(texts, target, source) {
      let lastErr;
      for (const host of this.hosts) {
        try {
          return await pool(texts, 4, async (q) => {
            const json = await fetchJson(
              `${host}/api/v1/${source}/${target}/${encodeURIComponent(q)}`
            );
            if (!json?.translation) throw new Error('empty');
            return json.translation;
          });
        } catch (e) {
          lastErr = e;
        }
      }
      throw lastErr;
    },
  },
  {
    name: 'mymemory',
    enabled: () => true,
    async translate(texts, target, source) {
      const de = process.env.MYMEMORY_EMAIL ? `&de=${encodeURIComponent(process.env.MYMEMORY_EMAIL)}` : '';
      return pool(texts, 4, async (q) => {
        // MyMemory accepts up to 500 bytes per request
        if (Buffer.byteLength(q) > 500) throw new Error('too long');
        const json = await fetchJson(
          `https://api.mymemory.translated.net/get?q=${encodeURIComponent(q)}&langpair=${source}|${target}${de}`
        );
        if (json?.responseStatus !== 200 || /MYMEMORY WARNING/i.test(json?.responseData?.translatedText || ''))
          throw new Error(json?.responseDetails || 'quota');
        return json.responseData.translatedText;
      });
    },
  },
  {
    name: 'libretranslate',
    enabled: () => true,
    async translate(texts, target, source) {
      const hosts = [
        process.env.LIBRETRANSLATE_URL,
        'https://translate.fedilab.app',
        'https://libretranslate.de',
      ].filter(Boolean);
      let lastErr;
      for (const host of hosts) {
        try {
          const json = await fetchJson(`${host.replace(/\/$/, '')}/translate`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              q: texts,
              source,
              target,
              format: 'text',
              ...(process.env.LIBRETRANSLATE_KEY ? { api_key: process.env.LIBRETRANSLATE_KEY } : {}),
            }),
          });
          const out = json.translatedText;
          if (!Array.isArray(out) || out.length !== texts.length) throw new Error('bad response');
          return out;
        } catch (e) {
          lastErr = e;
        }
      }
      throw lastErr;
    },
  },
];

/** Translates with the first provider that works; null when all fail. */
async function translateWithFallback(texts, target, source) {
  for (const p of providers) {
    if (!p.enabled()) continue;
    if ((cooldown.get(p.name) || 0) > Date.now()) continue;
    try {
      const out = await p.translate(texts, target, source);
      if (Array.isArray(out) && out.length === texts.length) return out.map((t, i) => clean(texts[i], t));
      throw new Error('length mismatch');
    } catch (e) {
      console.warn(`[translate] ${p.name} failed: ${e?.message || e}`);
      cooldown.set(p.name, Date.now() + COOLDOWN_MS);
    }
  }
  return null;
}

async function cacheCollection() {
  try {
    const client = await clientPromise;
    return client.db('test').collection('Translation');
  } catch {
    return null;
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const target = String(body?.target || '');
    const source = body?.source === 'fr' || body?.source === 'ar' ? body.source : 'en';
    if (!TARGETS.includes(target) || target === source) {
      return NextResponse.json({ error: 'Unsupported language' }, { status: 400 });
    }

    const texts = (Array.isArray(body?.texts) ? body.texts : [])
      .slice(0, MAX_TEXTS)
      .map((t) => String(t ?? '').slice(0, MAX_LEN));

    const keys = texts.map((t) => `${target}:${hash(t)}`);
    const result = texts.map((t, i) => memory.get(keys[i]) ?? null);

    // 1. MongoDB cache
    const missing = () => result.map((r, i) => (r === null ? i : -1)).filter((i) => i >= 0);
    const col = await cacheCollection();
    if (col && missing().length) {
      const ids = [...new Set(missing().map((i) => keys[i]))];
      const docs = await col.find({ _id: { $in: ids } }).toArray().catch(() => []);
      const found = new Map(docs.map((d) => [d._id, d.out]));
      missing().forEach((i) => {
        if (found.has(keys[i])) {
          result[i] = clean(texts[i], found.get(keys[i]));
          memory.set(keys[i], result[i]);
        }
      });
    }

    // 2. Providers, for whatever is still missing (unique texts only)
    const todo = [...new Set(missing().map((i) => texts[i]))];
    if (todo.length) {
      const translated = await translateWithFallback(todo, target, source);
      if (translated) {
        const byText = new Map(todo.map((t, i) => [t, translated[i]]));
        const writes = [];
        missing().forEach((i) => {
          result[i] = byText.get(texts[i]);
          memory.set(keys[i], result[i]);
        });
        todo.forEach((t) => {
          writes.push({
            updateOne: {
              filter: { _id: `${target}:${hash(t)}` },
              update: { $set: { text: t, lang: target, out: byText.get(t), at: new Date() } },
              upsert: true,
            },
          });
        });
        if (col && writes.length) col.bulkWrite(writes, { ordered: false }).catch(() => {});
      }
    }

    return NextResponse.json({
      translations: result.map((r, i) => (r === null ? texts[i] : r)),
    });
  } catch (error) {
    console.error('Translate error:', error);
    return NextResponse.json({ error: 'Translation failed' }, { status: 500 });
  }
}
