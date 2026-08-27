/**
 * Seed the `Product` collection (used as the salon service menu) with the
 * exact service list / prices of Rafi Daham Hair Repair Studio.
 *
 * Run:  node scripts/seed-services.js
 */
require('dotenv').config({ path: __dirname + '/../.env' });
const { MongoClient } = require('mongodb');

// [title, price(USD), duration(minutes), description]
const CATALOG = [
  {
    cat: 'Featured',
    order: 1,
    items: [
      ['Curly Hair Style', 45, 45],
      ['Blow Dry', 25, 30],
      ['Wave Hair', 35, 40],
      ['Hair Cut', 50, 45],
    ],
  },
  {
    cat: 'Aesthetic & Makeup',
    order: 2,
    items: [
      [
        'Eye Make-Up',
        50,
        45,
        'Eye Makeup focuses exclusively on enhancing and defining the eyes. It includes eyeshadow, eyeliner, mascara and brow finishing.',
      ],
      ['Full Makeup', 85, 60],
    ],
  },
  {
    cat: 'Brides & Occasions',
    order: 3,
    items: [
      ['Engagement Hair On Location', 700, 90],
      ['Engagement Hair In Salon', 300, 60],
      ["Bride's Hair On Location", 1300, 120],
      ["Bride's Hair In Salon", 600, 90],
      ['Engagement Package (Hair + Makeup)', 400, 120],
      [
        'Bride Package (Hair + Makeup)',
        1000,
        180,
        'Experience the magic of flawless beauty on your special day. Our Bride Package includes expert hair and makeup services.',
      ],
      ['Retro Classic Style', 90, 60],
      ['Wet Look Style', 35, 40],
      ['Ponytail', 50, 45],
      ['Half Up', 50, 45],
      ['Wedding Up-Do', 70, 60],
      ['Curly Hair Style', 45, 45],
    ],
  },
  {
    cat: 'Healthy Hair Treatments',
    order: 4,
    items: [
      ['Blowout Treatment Long', 300, 180],
      ['Blowout Treatment Short', 200, 120],
      ['Exte BB Cream Long', 45, 45],
      ['Exte BB Cream Short', 35, 35],
      ['Crestal Treatment Long', 220, 150],
      ['Crestal Treatment Short', 150, 120],
      ['GTOX Treatment', 170, 120],
      ['Caviar Treatment', 25, 30],
      ['Rafi Daham Collagen', 100, 90],
    ],
  },
  {
    cat: 'Hair Coloring',
    order: 5,
    items: [
      ['Balayage with Toner', 120, 120],
      ['Color Project Long', 400, 180],
      ['Color Project Short', 250, 120],
      ['Scalp Bleach', 70, 90],
      ['Toner / Rinsage Long', 50, 50],
      ['Toner / Rinsage Short', 35, 40],
      ['Face Framing', 100, 90],
      ['Inoa Full Color Long', 90, 90],
      ['Igora Full Color Long', 80, 90],
      ['Igora Full Color', 70, 75],
      ['Inoa Roots', 70, 60],
      ['Igora Roots', 60, 60],
    ],
  },
  {
    cat: 'Hair Styling',
    order: 6,
    items: [
      ['Wave Long', 50, 50],
      ['Wave Hair', 35, 40],
      ['Simple Hairstyle', 50, 45],
    ],
  },
  {
    cat: 'Hair Cuts',
    order: 7,
    items: [
      ['Hair Trim', 35, 30],
      ["Kid's Cut", 35, 30],
      ['Fringe Cut', 25, 15],
      ['Hair Cut', 50, 45],
    ],
  },
  {
    cat: 'Hair Care',
    order: 8,
    items: [
      ['Blow Dry Long', 35, 40],
      ['Blow Dry with Extensions', 35, 40],
      ['Blow Dry', 25, 30],
      ['Hair Wash', 10, 15],
      ['Hair Machine', 100, 60],
    ],
  },
];

const slug = (s) =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

(async () => {
  const client = new MongoClient(process.env.DATABASE_URL, { family: 4 });
  await client.connect();
  const db = client.db('test');
  const col = db.collection('Product');

  const docs = [];
  CATALOG.forEach((group) => {
    group.items.forEach(([title, price, duration, description], i) => {
      docs.push({
        _id: `${slug(group.cat)}--${slug(title)}`,
        title,
        cat: group.cat,
        catOrder: group.order,
        order: i + 1,
        price: String(price),
        duration,
        description:
          description ||
          `${title} at Rafi Daham Hair Repair Studio, available to book online.`,
        active: true,
      });
    });
  });

  await col.deleteMany({});
  await col.insertMany(docs);

  console.log(`Seeded ${docs.length} services into "Product".`);
  await client.close();
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
