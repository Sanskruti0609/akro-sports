// Akro Sports storefront server. Run: npm start  ->  http://localhost:3000
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// Tiny .env loader (no dependency, works on any Node version)
try {
  fs.readFileSync(path.join(__dirname, '.env'), 'utf8').split(/\r?\n/).forEach(line => {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/);
    if (m && !(m[1] in process.env)) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '');
  });
} catch { /* no .env, fine */ }

const express = require('express');
const db = require('./db');

const env = process.env;
const CFG = {
  port: Number(env.PORT) || 3000,
  whatsapp: (env.WHATSAPP_NUMBER || '919999999999').replace(/\D/g, ''),
  freeShipOver: Number(env.FREE_SHIPPING_OVER) || 1999,
  shipFee: env.SHIPPING_FEE !== undefined ? Number(env.SHIPPING_FEE) : 99,
  codFee: env.COD_FEE !== undefined ? Number(env.COD_FEE) : 50,
  customFee: env.CUSTOM_PRINT_FEE !== undefined ? Number(env.CUSTOM_PRINT_FEE) : 299,
  rzpKey: env.RAZORPAY_KEY_ID || '',
  rzpSecret: env.RAZORPAY_KEY_SECRET || '',
  adminKey: env.ADMIN_KEY || crypto.randomBytes(6).toString('hex'),
  adminKeyIsRandom: !env.ADMIN_KEY
};
const rzpEnabled = !!(CFG.rzpKey && CFG.rzpSecret);

const app = express();
app.disable('x-powered-by');
app.use(express.json({ limit: '50kb' }));
app.use(express.static(path.join(__dirname, 'public')));

// ---------- helpers ----------
const rowToProduct = r => ({
  slug: r.slug, name: r.name, sub: r.sub, category: r.category, type: r.type,
  price: r.price, compareAt: r.compare_at, tag: r.tag, tagline: r.tagline, desc: r.description,
  design: JSON.parse(r.design), sizes: JSON.parse(r.sizes), image: r.image, inStock: !!r.in_stock
});
const bad = (res, msg, code = 400) => res.status(code).json({ error: msg });
const rupees = n => '₹' + n.toLocaleString('en-IN');

// naive in-memory rate limit for order creation
const hits = new Map();
function limit(max, windowMs) {
  return (req, res, next) => {
    const now = Date.now(), k = req.ip;
    const arr = (hits.get(k) || []).filter(t => now - t < windowMs);
    if (arr.length >= max) return bad(res, 'Too many requests, please wait a minute.', 429);
    arr.push(now); hits.set(k, arr); next();
  };
}

// Prices are ALWAYS recomputed here; the browser's numbers are never trusted.
function priceCart(items, method) {
  if (!Array.isArray(items) || !items.length) throw new Error('Your bag is empty.');
  if (items.length > 30) throw new Error('Too many line items.');
  const get = db.prepare('SELECT * FROM products WHERE slug = ?');
  let subtotal = 0;
  const lines = items.map(it => {
    const row = get.get(String(it.slug));
    if (!row || !row.in_stock) throw new Error('An item in your bag is no longer available.');
    const p = rowToProduct(row);
    const size = String(it.size || '');
    if (!p.sizes.includes(size)) throw new Error(`Please choose a valid size for ${p.name}.`);
    const qty = Math.min(Math.max(parseInt(it.qty, 10) || 1, 1), 20);
    const cn = it.custom ? String(it.custom.name || '').trim().slice(0, 12).toUpperCase().replace(/[^A-Z0-9 .\-]/g, '') : '';
    const cnum = it.custom ? String(it.custom.number || '').trim().slice(0, 2).replace(/\D/g, '') : '';
    const custom = (cn || cnum) ? { name: cn, number: cnum } : null;
    const unit = p.price + (custom ? CFG.customFee : 0);
    subtotal += unit * qty;
    return { slug: p.slug, name: `${p.name} ${p.sub}`.trim(), size, qty, unit, custom };
  });
  const shipping = subtotal >= CFG.freeShipOver ? 0 : CFG.shipFee;
  const codFee = method === 'cod' ? CFG.codFee : 0;
  return { lines, subtotal, shipping, codFee, total: subtotal + shipping + codFee };
}

function cleanCustomer(c = {}) {
  const s = (v, n) => String(v || '').trim().slice(0, n);
  const phone = String(c.phone || '').replace(/\D/g, '').slice(-10);
  const out = { name: s(c.name, 80), phone, email: s(c.email, 120), address: s(c.address, 250),
    city: s(c.city, 60), state: s(c.state, 60), pincode: s(c.pincode, 6) };
  if (out.name.length < 2) throw new Error('Please enter your full name.');
  if (!/^[6-9]\d{9}$/.test(phone)) throw new Error('Enter a valid 10-digit Indian mobile number.');
  if (out.email && !/^\S+@\S+\.\S+$/.test(out.email)) throw new Error('That email address looks wrong.');
  if (out.address.length < 8) throw new Error('Please enter your full delivery address.');
  if (!out.city) throw new Error('Please enter your city.');
  if (!out.state) throw new Error('Please select your state.');
  if (!/^[1-9]\d{5}$/.test(out.pincode)) throw new Error('Enter a valid 6-digit PIN code.');
  return out;
}

const newId = () => 'AK-' + crypto.randomBytes(5).toString('hex').toUpperCase();

function whatsappLink(order) {
  const lines = order.items.map((l, i) =>
    `${i + 1}. ${l.name} | Size ${l.size} | x${l.qty}` +
    (l.custom ? ` | Print: ${[l.custom.name, l.custom.number].filter(Boolean).join(' ')}` : '') +
    ` | ${rupees(l.unit * l.qty)}`);
  const c = order.customer;
  const text = [`Hi Akro Sports! I'd like to place an order (ref ${order.id}):`, '', ...lines, '',
    `Shipping: ${order.shipping ? rupees(order.shipping) : 'Free'}`, `Total: ${rupees(order.total)}`, '',
    `Name: ${c.name}`, `Phone: ${c.phone}`, `Address: ${c.address}, ${c.city}, ${c.state} ${c.pincode}`].join('\n');
  return `https://wa.me/${CFG.whatsapp}?text=${encodeURIComponent(text)}`;
}

// ---------- public API ----------
app.get('/api/config', (req, res) => res.json({
  whatsapp: CFG.whatsapp, freeShipOver: CFG.freeShipOver, shipFee: CFG.shipFee, codFee: CFG.codFee,
  customFee: CFG.customFee, razorpay: rzpEnabled, razorpayKey: rzpEnabled ? CFG.rzpKey : null
}));

app.get('/api/products', (req, res) => {
  const { category } = req.query;
  const rows = category
    ? db.prepare('SELECT * FROM products WHERE in_stock = 1 AND category = ? ORDER BY sort').all(String(category))
    : db.prepare('SELECT * FROM products WHERE in_stock = 1 ORDER BY sort').all();
  res.json(rows.map(rowToProduct));
});

app.get('/api/products/:slug', (req, res) => {
  const row = db.prepare('SELECT * FROM products WHERE slug = ? AND in_stock = 1').get(req.params.slug);
  row ? res.json(rowToProduct(row)) : bad(res, 'Product not found', 404);
});

app.post('/api/orders', limit(10, 60_000), async (req, res) => {
  try {
    const { items, customer, method } = req.body || {};
    if (!['cod', 'whatsapp', 'razorpay'].includes(method)) return bad(res, 'Choose a payment method.');
    if (method === 'razorpay' && !rzpEnabled) return bad(res, 'Online payment is not switched on yet. Please choose Cash on Delivery or WhatsApp.');
    const cust = cleanCustomer(customer);
    const priced = priceCart(items, method);
    const id = newId();
    const order = {
      id, created_at: new Date().toISOString(), status: 'new', payment_method: method,
      payment_status: method === 'razorpay' ? 'awaiting_payment' : method === 'cod' ? 'cod_pending' : 'whatsapp_pending',
      subtotal: priced.subtotal, shipping: priced.shipping, cod_fee: priced.codFee, total: priced.total,
      customer: cust, items: priced.lines
    };

    let razorpay = null;
    if (method === 'razorpay') {
      const r = await fetch('https://api.razorpay.com/v1/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json',
          Authorization: 'Basic ' + Buffer.from(`${CFG.rzpKey}:${CFG.rzpSecret}`).toString('base64') },
        body: JSON.stringify({ amount: priced.total * 100, currency: 'INR', receipt: id })
      });
      const j = await r.json();
      if (!r.ok) { console.error('Razorpay error', j); return bad(res, 'Could not start the payment. Please try another method.', 502); }
      order.razorpay_order_id = j.id;
      razorpay = { key: CFG.rzpKey, orderId: j.id, amount: j.amount, currency: j.currency };
    }

    db.prepare(`INSERT INTO orders (id,created_at,status,payment_method,payment_status,subtotal,shipping,cod_fee,total,customer,items,razorpay_order_id)
      VALUES (@id,@created_at,@status,@payment_method,@payment_status,@subtotal,@shipping,@cod_fee,@total,@customer,@items,@razorpay_order_id)`)
      .run({ ...order, customer: JSON.stringify(cust), items: JSON.stringify(priced.lines), razorpay_order_id: order.razorpay_order_id || null });

    res.json({ orderId: id, total: priced.total, method, razorpay,
      whatsappUrl: method === 'whatsapp' ? whatsappLink({ ...order, items: priced.lines, customer: cust }) : null });
  } catch (e) {
    bad(res, e.message || 'Could not place the order.');
  }
});

app.post('/api/orders/:id/razorpay-verify', limit(20, 60_000), (req, res) => {
  const o = db.prepare('SELECT * FROM orders WHERE id = ?').get(req.params.id);
  if (!o || !o.razorpay_order_id) return bad(res, 'Order not found', 404);
  const { razorpay_payment_id: pid, razorpay_order_id: oid, razorpay_signature: sig } = req.body || {};
  if (oid !== o.razorpay_order_id || !pid || !sig) return bad(res, 'Payment details do not match this order.');
  const expected = crypto.createHmac('sha256', CFG.rzpSecret).update(`${oid}|${pid}`).digest('hex');
  const a = Buffer.from(expected), b = Buffer.from(String(sig));
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return bad(res, 'Payment could not be verified.', 400);
  db.prepare(`UPDATE orders SET payment_status = 'paid', razorpay_payment_id = ? WHERE id = ?`).run(pid, o.id);
  res.json({ ok: true });
});

// Limited public order status (no personal data)
app.get('/api/orders/:id', (req, res) => {
  const o = db.prepare('SELECT id,status,payment_method,payment_status,total FROM orders WHERE id = ?').get(req.params.id);
  o ? res.json(o) : bad(res, 'Order not found', 404);
});

// ---------- admin ----------
function admin(req, res, next) {
  const k = String(req.get('x-admin-key') || '');
  const a = Buffer.from(k), b = Buffer.from(CFG.adminKey);
  if (a.length === b.length && crypto.timingSafeEqual(a, b)) return next();
  bad(res, 'Wrong admin key', 401);
}
app.get('/api/admin/orders', admin, (req, res) => {
  res.json(db.prepare('SELECT * FROM orders ORDER BY created_at DESC LIMIT 500').all()
    .map(o => ({ ...o, customer: JSON.parse(o.customer), items: JSON.parse(o.items) })));
});
app.patch('/api/admin/orders/:id', admin, (req, res) => {
  const status = String((req.body || {}).status || '');
  if (!['new', 'confirmed', 'packed', 'shipped', 'delivered', 'cancelled'].includes(status)) return bad(res, 'Invalid status');
  const r = db.prepare('UPDATE orders SET status = ? WHERE id = ?').run(status, req.params.id);
  r.changes ? res.json({ ok: true }) : bad(res, 'Order not found', 404);
});

app.listen(CFG.port, () => {
  console.log(`\n  Akro Sports running at http://localhost:${CFG.port}`);
  console.log(`  Admin orders:      http://localhost:${CFG.port}/admin.html`);
  console.log(`  Admin key:         ${CFG.adminKey}${CFG.adminKeyIsRandom ? '   (random for this run, set ADMIN_KEY in .env to fix it)' : ''}`);
  console.log(`  Razorpay:          ${rzpEnabled ? 'ON' : 'OFF (add RAZORPAY_KEY_ID / RAZORPAY_KEY_SECRET to .env)'}`);
  if (CFG.whatsapp === '919999999999') console.log('  WhatsApp number:   placeholder, set WHATSAPP_NUMBER in .env (e.g. 919876543210)');
  console.log('');
});
