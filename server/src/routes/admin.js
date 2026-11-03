import { Router } from 'express';
import { User, Offer, Product, Lead, Stat, Content, AuditLog } from '../models/index.js';
import { auth, admin, passwordProblem, hashPassword, revokeAllSessions } from '../security.js';

const r = Router();
r.use(auth, admin);
const wrap = (fn) => (req, res, next) => fn(req, res).catch(next);
const esc = (s) => String(s).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const pick = (o, keys) => Object.fromEntries(keys.filter((k) => o[k] !== undefined).map((k) => [k, o[k]]));
const slugify = (s) => String(s).toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

// ---------- overview ----------
const DAYS = 14;
async function daily(Model) {
  const since = new Date(Date.now() - (DAYS - 1) * 864e5);
  since.setUTCHours(0, 0, 0, 0);
  const rows = await Model.aggregate([
    { $match: { createdAt: { $gte: since } } },
    { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, n: { $sum: 1 } } },
  ]);
  const map = Object.fromEntries(rows.map((x) => [x._id, x.n]));
  return Array.from({ length: DAYS }, (_, i) => {
    const date = new Date(since.getTime() + i * 864e5).toISOString().slice(0, 10);
    return { date, n: map[date] || 0 };
  });
}
const countBy = async (Model, field, match = {}) =>
  Object.fromEntries((await Model.aggregate([{ $match: match }, { $group: { _id: `$${field}`, n: { $sum: 1 } } }])).map((x) => [x._id, x.n]));

r.get('/overview', wrap(async (_req, res) => {
  const [users, offers, products, leads, usersByRole, offersByStatus, leadsByStatus, kycByStatus, liveValue, leadSeries, userSeries, recentLeads, pendingKyc] = await Promise.all([
    User.countDocuments(), Offer.countDocuments(), Product.countDocuments(), Lead.countDocuments(),
    countBy(User, 'role'), countBy(Offer, 'status'), countBy(Lead, 'status'), countBy(User, 'kyc.status'),
    Offer.aggregate([{ $match: { status: 'live' } }, { $group: { _id: null, v: { $sum: { $multiply: ['$quantityMT', '$priceUsdPerMT'] } }, mt: { $sum: '$quantityMT' } } }]),
    daily(Lead), daily(User),
    Lead.find().sort({ createdAt: -1 }).limit(6),
    User.find({ 'kyc.status': 'pending' }).select('-passwordHash').limit(6),
  ]);
  res.json({
    totals: { users, offers, products, leads, liveValueUsd: liveValue[0]?.v || 0, liveMT: liveValue[0]?.mt || 0 },
    usersByRole, offersByStatus, leadsByStatus, kycByStatus, leadSeries, userSeries, recentLeads, pendingKyc,
  });
}));

// ---------- users ----------
r.get('/users', wrap(async (req, res) => {
  const { q, role, kyc } = req.query;
  const f = {};
  if (role) f.role = String(role);
  if (kyc) f['kyc.status'] = String(kyc);
  if (q) f.$or = ['name', 'email', 'company'].map((k) => ({ [k]: new RegExp(esc(q), 'i') }));
  res.json(await User.find(f).select('-passwordHash').sort({ createdAt: -1 }).limit(300));
}));
const ROLES = ['buyer', 'seller', 'partner', 'agropreneur', 'bank', 'admin'];
r.post('/users', wrap(async (req, res) => {
  const { name, email, password, role, company } = req.body || {};
  if (!name || !/^\S+@\S+\.\S+$/.test(email || '')) return res.status(400).json({ error: 'A name and a valid email are required.' });
  if (passwordProblem(password)) return res.status(400).json({ error: passwordProblem(password) });
  if (await User.findOne({ email: String(email).toLowerCase() })) return res.status(409).json({ error: 'That email is already registered.' });
  const u = await User.create({ name, email, company, role: ROLES.includes(role) ? role : 'buyer', passwordHash: await hashPassword(password) });
  res.status(201).json({ id: u._id });
}));

r.patch('/users/:id', wrap(async (req, res) => {
  const b = req.body || {};
  const set = pick(b, ['name', 'company']);
  if (b.password !== undefined) {
    if (passwordProblem(b.password)) return res.status(400).json({ error: passwordProblem(b.password) });
    set.passwordHash = await hashPassword(b.password);
    set.$inc = { tokenVersion: 1 }; // signs the user out everywhere
    await revokeAllSessions(req.params.id);
  }
  if (b.role) {
    if (String(req.params.id) === String(req.user._id) && b.role !== 'admin') return res.status(400).json({ error: "You can't remove your own admin role." });
    set.role = b.role;
  }
  if (b.kycStatus) set['kyc.status'] = b.kycStatus;
  const u = await User.findByIdAndUpdate(req.params.id, set, { new: true, runValidators: true }).select('-passwordHash');
  if (!u) return res.status(404).json({ error: 'User not found.' });
  res.json(u);
}));
r.delete('/users/:id', wrap(async (req, res) => {
  if (String(req.params.id) === String(req.user._id)) return res.status(400).json({ error: "You can't delete yourself." });
  await Offer.deleteMany({ owner: req.params.id, status: { $ne: 'live' } });
  await revokeAllSessions(req.params.id);
  await User.findByIdAndDelete(req.params.id);
  res.json({ ok: true });
}));

// ---------- offers ----------
const OFFER_KEYS = ['sellerCompany', 'origin', 'destination', 'incoterm', 'quantityMT', 'priceUsdPerMT', 'status'];
r.get('/offers', wrap(async (req, res) => {
  const f = req.query.status ? { status: String(req.query.status) } : {};
  res.json(await Offer.find(f).populate('product', 'name slug').sort({ createdAt: -1 }).limit(300));
}));
r.post('/offers', wrap(async (req, res) => {
  const b = req.body || {};
  const product = await Product.findOne({ slug: String(b.productSlug) });
  if (!product) return res.status(400).json({ error: 'Choose a valid variety.' });
  const offer = await Offer.create({ ...pick(b, OFFER_KEYS), product: product._id, status: b.status || 'live' });
  res.status(201).json(offer);
}));
r.patch('/offers/:id', wrap(async (req, res) => {
  const set = pick(req.body || {}, OFFER_KEYS);
  if (req.body?.productSlug) {
    const p = await Product.findOne({ slug: String(req.body.productSlug) });
    if (p) set.product = p._id;
  }
  const o = await Offer.findByIdAndUpdate(req.params.id, set, { new: true, runValidators: true });
  if (!o) return res.status(404).json({ error: 'Offer not found.' });
  res.json(o);
}));
r.delete('/offers/:id', wrap(async (req, res) => { await Offer.findByIdAndDelete(req.params.id); res.json({ ok: true }); }));

// ---------- products ----------
const grain = (b) => ({ length: +b.length || 0, broken: +b.broken || 0, moisture: +b.moisture || 12 });
r.post('/products', wrap(async (req, res) => {
  const b = req.body || {};
  if (!b.name || !b.family) return res.status(400).json({ error: 'Name and family are required.' });
  const p = await Product.create({
    slug: slugify(b.slug || b.name), name: b.name, family: b.family, processing: b.processing, hsn: b.hsn || '10063020',
    avgPriceUsd: +b.avgPriceUsd || 0, grain: grain(b),
    packaging: ['25 kg PP', '50 kg PP', 'Jumbo bag', 'Private label'], incoterms: ['FOB', 'CIF', 'CFR'],
    blurb: b.blurb || `${b.name} from India.`,
  });
  res.status(201).json(p);
}));
r.patch('/products/:id', wrap(async (req, res) => {
  const b = req.body || {};
  const set = pick(b, ['name', 'family', 'processing', 'hsn', 'blurb']);
  if (b.avgPriceUsd !== undefined) set.avgPriceUsd = +b.avgPriceUsd;
  if (b.length !== undefined) set.grain = grain(b);
  const p = await Product.findByIdAndUpdate(req.params.id, set, { new: true, runValidators: true });
  if (!p) return res.status(404).json({ error: 'Product not found.' });
  res.json(p);
}));
r.delete('/products/:id', wrap(async (req, res) => {
  if (await Offer.exists({ product: req.params.id })) return res.status(409).json({ error: 'This variety has offers. Delete or move them first.' });
  await Product.findByIdAndDelete(req.params.id);
  res.json({ ok: true });
}));

// ---------- leads ----------
r.get('/leads', wrap(async (req, res) => {
  const { q, role, status } = req.query;
  const f = {};
  if (role) f.role = String(role);
  if (status) f.status = String(status);
  if (q) f.$or = ['name', 'email', 'company', 'message'].map((k) => ({ [k]: new RegExp(esc(q), 'i') }));
  res.json(await Lead.find(f).sort({ createdAt: -1 }).limit(500));
}));
r.patch('/leads/:id', wrap(async (req, res) => {
  const l = await Lead.findByIdAndUpdate(req.params.id, pick(req.body || {}, ['status', 'note']), { new: true, runValidators: true });
  if (!l) return res.status(404).json({ error: 'Lead not found.' });
  res.json(l);
}));
r.delete('/leads/:id', wrap(async (req, res) => { await Lead.findByIdAndDelete(req.params.id); res.json({ ok: true }); }));

// ---------- site content (admin-edited text overrides) ----------
export const CONTENT_KEYS = ['SETTINGS', 'COMPANY', 'ABOUT', 'WHY', 'TEAM', 'MANIFESTO', 'SUSTAIN', 'LIVELIHOOD', 'PLATFORM', 'DTC', 'TRUST', 'FRAUD', 'TECH',
  'BUYER', 'SELLER', 'PARTNER', 'AGRO', 'FINANCE', 'LENDERS', 'RICE', 'TOOLS_FAQ', 'TRUST_VS', 'PRIVACY', 'TERMS', 'CORRIDOR'];

r.get('/content', wrap(async (_req, res) => {
  const rows = await Content.find().select('key updatedAt updatedBy');
  res.json(rows);
}));
r.put('/content/:key', wrap(async (req, res) => {
  const key = String(req.params.key);
  const data = req.body?.data;
  if (!CONTENT_KEYS.includes(key)) return res.status(400).json({ error: 'Unknown content block.' });
  if (data === null || typeof data !== 'object') return res.status(400).json({ error: 'Content must be a JSON object or array.' });
  if (JSON.stringify(data).length > 200_000) return res.status(413).json({ error: 'Content is too large.' });
  await Content.findOneAndUpdate({ key }, { data, updatedBy: req.user.email }, { upsert: true, new: true });
  res.json({ ok: true });
}));
r.delete('/content/:key', wrap(async (req, res) => { await Content.deleteOne({ key: String(req.params.key) }); res.json({ ok: true }); }));

// ---------- activity log ----------
r.get('/audit', wrap(async (_req, res) => { res.json(await AuditLog.find().sort({ createdAt: -1 }).limit(200)); }));

// ---------- site stats ----------
r.get('/stats', wrap(async (_req, res) => res.json(await Stat.find().sort({ order: 1 }))));
r.put('/stats/:key', wrap(async (req, res) => {
  const last = await Stat.findOne().sort({ order: -1 });
  const s = await Stat.findOneAndUpdate(
    { key: slugify(req.params.key) },
    { ...pick(req.body || {}, ['label', 'suffix']), value: +req.body?.value || 0, $setOnInsert: { order: (last?.order ?? -1) + 1 } },
    { upsert: true, new: true },
  );
  res.json(s);
}));
r.delete('/stats/:key', wrap(async (req, res) => { await Stat.deleteOne({ key: req.params.key }); res.json({ ok: true }); }));

export default r;
