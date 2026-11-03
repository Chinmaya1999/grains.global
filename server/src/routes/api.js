import { Router } from 'express';
import { Product, Offer, Lead, Stat, Content } from '../models/index.js';
import { leadLimiter } from '../security.js';

const r = Router();
const wrap = (fn) => (req, res, next) => fn(req, res).catch(next);

r.get('/health', (_req, res) => res.json({ ok: true }));

r.get('/products', wrap(async (req, res) => {
  const q = {};
  if (req.query.family) q.family = String(req.query.family);
  res.json(await Product.find(q).sort({ family: 1, name: 1 }));
}));

r.get('/products/:slug', wrap(async (req, res) => {
  const p = await Product.findOne({ slug: String(req.params.slug) });
  if (!p) return res.status(404).json({ error: 'Product not found' });
  res.json(p);
}));

r.get('/offers', wrap(async (req, res) => {
  const f = { status: 'live' };
  if (req.query.product) {
    const p = await Product.findOne({ slug: String(req.query.product) });
    f.product = p ? p._id : null;
  }
  res.json(await Offer.find(f).populate('product', 'name slug family').sort({ createdAt: -1 }).limit(50));
}));

r.get('/content', wrap(async (_req, res) => {
  const rows = await Content.find();
  res.json(Object.fromEntries(rows.map((r) => [r.key, r.data])));
}));

r.get('/stats', wrap(async (_req, res) => {
  res.json(await Stat.find().sort({ order: 1 }));
}));

r.post('/leads', leadLimiter, wrap(async (req, res) => {
  const b = req.body || {};
  if (!b.role || !b.name || !/^\S+@\S+\.\S+$/.test(b.email || '')) {
    return res.status(400).json({ error: 'Role, name and a valid email are required.' });
  }
  const { role, name, company, email, phone, country, message, productSlug, quantityMT, incoterm, destination, packaging, paymentTerms, targetPriceUsd } = b;
  const lead = await Lead.create({ role, name, company, email, phone, country, message, productSlug, quantityMT, incoterm, destination, packaging, paymentTerms, targetPriceUsd });
  res.status(201).json({ id: lead._id, ok: true });
}));

// Global Trading Partner earnings from the published slab tables.
const SHARE = [[120e3, 24.75], [240e3, 26.5], [360e3, 28.25], [480e3, 30], [600e3, 30.75],
  [720e3, 33.5], [840e3, 35.25], [960e3, 37], [1.08e6, 38.75], [1.2e6, 40.5]];
const BONUS = [[10e6, 5.5], [20e6, 8.5], [40e6, 11.5], [Infinity, 15.5]];

r.get('/partner/estimate', (req, res) => {
  const monthly = Math.max(0, Number(req.query.monthly) || 0);
  const marginPct = Math.min(30, Math.max(0, Number(req.query.margin) || 0));
  let share = 0;
  for (const [vol, pct] of SHARE) if (monthly >= vol) share = pct;
  const yearly = monthly * 12;
  const bonus = (BONUS.find(([cap]) => yearly <= cap) || BONUS.at(-1))[1];
  const margin = monthly * (marginPct / 100);
  res.json({
    monthly, marginPct, sharePct: share, bonusPct: bonus,
    monthlyEarnings: Math.round(margin * (share / 100)),
    yearlyBonus: Math.round(margin * 12 * (bonus / 100)),
  });
});

export default r;
