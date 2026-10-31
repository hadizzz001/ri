/**
 * Every country, for the booking page's "Your country" field (where the
 * client is from — different from the appointment country, which is one of
 * the countries managed from the dashboard). Stored by English name; labels
 * come from the browser / Node in the page's language.
 */
const CODES = (
  'AD AE AF AG AI AL AM AO AR AS AT AU AW AX AZ BA BB BD BE BF BG BH BI BJ BL BM BN BO BQ BR BS BT BW BY BZ ' +
  'CA CC CD CF CG CH CI CK CL CM CN CO CR CU CV CW CX CY CZ DE DJ DK DM DO DZ EC EE EG EH ER ES ET FI FJ FK FM ' +
  'FO FR GA GB GD GE GF GG GH GI GL GM GN GP GQ GR GT GU GW GY HK HN HR HT HU ID IE IN IQ IR IS IT JE JM ' +
  'JO JP KE KG KH KI KM KN KP KR KW KY KZ LA LB LC LI LK LR LS LT LU LV LY MA MC MD ME MF MG MH MK ML MM MN ' +
  'MO MP MQ MR MS MT MU MV MW MX MY MZ NA NC NE NF NG NI NL NO NP NR NU NZ OM PA PE PF PG PH PK PL PM PN PR ' +
  'PS PT PW PY QA RE RO RS RU RW SA SB SC SD SE SG SH SI SK SL SM SN SO SR SS ST SV SX SY SZ TC TD TG TH TJ ' +
  'TK TL TM TN TO TR TT TV TW TZ UA UG US UY UZ VA VC VE VG VI VN VU WF WS XK YE YT ZA ZM ZW'
).split(' ');

const names = (lang) => {
  try {
    const dn = new Intl.DisplayNames([lang], { type: 'region' });
    return (code) => dn.of(code) || code;
  } catch {
    return (code) => code;
  }
};

const EN = names('en');
export const WORLD_COUNTRIES = CODES.map((code) => EN(code));
const SET = new Set(WORLD_COUNTRIES);

export const isCountryName = (name) => SET.has(String(name || ''));

/** [{ value: English name, label: name in `lang` }], sorted by label. */
export function worldCountryOptions(lang = 'en') {
  const local = names(lang === 'ar' ? 'ar' : lang === 'fr' ? 'fr' : 'en');
  const opts = CODES.map((code) => ({ value: EN(code), label: local(code) }));
  return opts.sort((a, b) => a.label.localeCompare(b.label, lang));
}
