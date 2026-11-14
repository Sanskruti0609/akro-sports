// SQLite setup + seeding. Run `npm run reseed` to reload data/products.js (orders are kept).
const path = require('path');
const Database = require('better-sqlite3');
const seed = require('./data/products.js');

const db = new Database(path.join(__dirname, 'data', 'akro.db'));
db.pragma('journal_mode = WAL');

db.exec(`
CREATE TABLE IF NOT EXISTS products (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  sub TEXT DEFAULT '',
  category TEXT NOT NULL,
  type TEXT NOT NULL,
  price INTEGER NOT NULL,
  compare_at INTEGER,
  tag TEXT DEFAULT '',
  tagline TEXT DEFAULT '',
  description TEXT DEFAULT '',
  design TEXT NOT NULL,
  sizes TEXT NOT NULL,
  image TEXT,
  in_stock INTEGER NOT NULL DEFAULT 1,
  sort INTEGER NOT NULL DEFAULT 0
);
CREATE TABLE IF NOT EXISTS orders (
  id TEXT PRIMARY KEY,
  created_at TEXT NOT NULL,
  status TEXT NOT NULL,
  payment_method TEXT NOT NULL,
  payment_status TEXT NOT NULL,
  subtotal INTEGER NOT NULL,
  shipping INTEGER NOT NULL,
  cod_fee INTEGER NOT NULL DEFAULT 0,
  total INTEGER NOT NULL,
  customer TEXT NOT NULL,
  items TEXT NOT NULL,
  razorpay_order_id TEXT,
  razorpay_payment_id TEXT
);
`);

function reseed() {
  const upsert = db.prepare(`
    INSERT INTO products (slug,name,sub,category,type,price,compare_at,tag,tagline,description,design,sizes,image,sort)
    VALUES (@slug,@name,@sub,@category,@type,@price,@compareAt,@tag,@tagline,@desc,@design,@sizes,@image,@sort)
    ON CONFLICT(slug) DO UPDATE SET name=excluded.name, sub=excluded.sub, category=excluded.category, type=excluded.type,
      price=excluded.price, compare_at=excluded.compare_at, tag=excluded.tag, tagline=excluded.tagline,
      description=excluded.description, design=excluded.design, sizes=excluded.sizes, image=excluded.image, sort=excluded.sort`);
  const slugs = seed.map(p => p.slug);
  db.transaction(() => {
    seed.forEach((p, i) => upsert.run({ sub: '', tag: '', tagline: '', compareAt: null, image: null, ...p,
      design: JSON.stringify(p.design), sizes: JSON.stringify(p.sizes), sort: i }));
    // products removed from the seed file are hidden rather than deleted (old orders may reference them)
    db.prepare(`UPDATE products SET in_stock = 0 WHERE slug NOT IN (${slugs.map(() => '?').join(',')})`).run(...slugs);
  })();
  return seed.length;
}

if (db.prepare('SELECT COUNT(*) c FROM products').get().c === 0) reseed();
if (require.main === module) console.log(`Seeded ${reseed()} products.`);

module.exports = db;
module.exports.reseed = reseed;
