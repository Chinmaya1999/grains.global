import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { User, Offer, Product, RefreshToken } from '../models/index.js';
import {
  auth, admin, requireRole, passwordProblem, hashPassword, DUMMY_HASH, startSession, rotateSession, clearSessionCookie,
  revokeAllSessions, currentSessionHash, loginLimiter, registerLimiter, refreshLimiter, sameOrigin,
} from '../security.js';

const r = Router();
const wrap = (fn) => (req, res, next) => fn(req, res).catch(next);
const ROLES = ['buyer', 'seller', 'partner', 'agropreneur', 'bank'];
const MAX_FAILS = 5, LOCK_MS = 15 * 60e3;
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const str = (v, max = 200) => (typeof v === 'string' ? v.trim().slice(0, max) : '');

const pub = (u) => ({ id: u._id, name: u.name, email: u.email, role: u.role, company: u.company, kyc: u.kyc });
export { auth, admin };

r.post('/auth/register', registerLimiter, sameOrigin, wrap(async (req, res) => {
  const name = str(req.body?.name, 100), email = str(req.body?.email, 254).toLowerCase(), company = str(req.body?.company, 150);
  const problem = passwordProblem(req.body?.password);
  if (!name || !EMAIL.test(email)) return res.status(400).json({ error: 'A name and a valid email are required.' });
  if (problem) return res.status(400).json({ error: problem });
  if (await User.findOne({ email })) return res.status(409).json({ error: 'That email is already registered.' });
  const isAdmin = process.env.ADMIN_EMAIL && email === process.env.ADMIN_EMAIL.toLowerCase();
  const role = isAdmin ? 'admin' : ROLES.includes(req.body?.role) ? req.body.role : 'buyer';
  const u = await User.create({ name, email, company, role, passwordHash: await hashPassword(req.body.password) });
  res.status(201).json({ token: await startSession(u, req, res), user: pub(u) });
}));

r.post('/auth/login', loginLimiter, sameOrigin, wrap(async (req, res) => {
  const email = str(req.body?.email, 254).toLowerCase(), password = typeof req.body?.password === 'string' ? req.body.password : '';
  const u = email ? await User.findOne({ email }) : null;
  if (u?.lockUntil && u.lockUntil > new Date()) {
    return res.status(423).json({ error: `Too many failed attempts. Try again in ${Math.ceil((u.lockUntil - Date.now()) / 60e3)} minute(s).` });
  }
  const ok = await bcrypt.compare(password, u ? u.passwordHash : DUMMY_HASH); // always hash, so timing doesn't reveal unknown emails
  if (!u || !ok) {
    if (u) {
      u.failedLogins = (u.failedLogins || 0) + 1;
      if (u.failedLogins >= MAX_FAILS) { u.lockUntil = new Date(Date.now() + LOCK_MS); u.failedLogins = 0; }
      await u.save();
    }
    return res.status(401).json({ error: 'Email or password is incorrect.' });
  }
  u.failedLogins = 0; u.lockUntil = undefined; u.lastLoginAt = new Date();
  await u.save();
  res.json({ token: await startSession(u, req, res), user: pub(u) });
}));

// Restore a session from the HttpOnly cookie; issues a fresh access token and rotates the refresh token.
r.post('/auth/refresh', refreshLimiter, sameOrigin, wrap(async (req, res) => {
  const s = await rotateSession(req, res);
  if (!s) return res.status(401).json({ error: 'Please sign in.' });
  res.json({ token: s.token, user: pub(s.user) });
}));

r.post('/auth/logout', sameOrigin, wrap(async (req, res) => {
  const h = currentSessionHash(req);
  if (h) await RefreshToken.updateOne({ tokenHash: h, revokedAt: null }, { revokedAt: new Date() });
  clearSessionCookie(res);
  res.json({ ok: true });
}));

r.post('/auth/logout-all', auth, wrap(async (req, res) => {
  req.user.tokenVersion = (req.user.tokenVersion || 0) + 1; // kills every access token immediately
  await req.user.save();
  await revokeAllSessions(req.user._id);
  clearSessionCookie(res);
  res.json({ ok: true });
}));

r.post('/auth/password', auth, loginLimiter, sameOrigin, wrap(async (req, res) => {
  const { currentPassword, newPassword } = req.body || {};
  if (typeof currentPassword !== 'string' || !(await bcrypt.compare(currentPassword, req.user.passwordHash))) return res.status(401).json({ error: 'Your current password is incorrect.' });
  const problem = passwordProblem(newPassword);
  if (problem) return res.status(400).json({ error: problem });
  req.user.passwordHash = await hashPassword(newPassword);
  req.user.tokenVersion = (req.user.tokenVersion || 0) + 1;
  await req.user.save();
  await revokeAllSessions(req.user._id);
  res.json({ token: await startSession(req.user, req, res), user: pub(req.user) }); // this device stays signed in
}));

r.get('/auth/sessions', auth, wrap(async (req, res) => {
  const mine = currentSessionHash(req);
  const rows = await RefreshToken.find({ user: req.user._id, revokedAt: null, expiresAt: { $gt: new Date() } }).sort({ createdAt: -1 });
  res.json(rows.map((x) => ({ id: x._id, createdAt: x.createdAt, ip: x.ip, userAgent: x.userAgent, current: x.tokenHash === mine })));
}));
r.delete('/auth/sessions/:id', auth, wrap(async (req, res) => {
  await RefreshToken.updateOne({ _id: req.params.id, user: req.user._id }, { revokedAt: new Date() });
  res.json({ ok: true });
}));

r.get('/auth/me', auth, (req, res) => res.json({ user: pub(req.user) }));

r.post('/auth/kyc', auth, wrap(async (req, res) => {
  const { gstin, iec, country } = req.body || {};
  if (!gstin && !iec) return res.status(400).json({ error: 'Provide a GSTIN or an IEC number.' });
  req.user.kyc = { status: 'pending', gstin, iec, country, submittedAt: new Date() };
  await req.user.save();
  res.json({ user: pub(req.user) });
}));

// Sellers post offers; verified sellers go live immediately, others wait for review.
r.post('/my/offers', auth, requireRole('seller', 'admin'), wrap(async (req, res) => {
  const { productSlug, origin, destination, incoterm, quantityMT, priceUsdPerMT } = req.body || {};
  const product = await Product.findOne({ slug: String(productSlug) });
  if (!product || !(quantityMT > 0) || !(priceUsdPerMT > 0)) return res.status(400).json({ error: 'Choose a variety and enter positive quantity and price.' });
  const offer = await Offer.create({
    product: product._id, sellerCompany: req.user.company || req.user.name, origin, destination,
    incoterm: ['FOB', 'CIF', 'CFR', 'EXW'].includes(incoterm) ? incoterm : 'FOB',
    quantityMT, priceUsdPerMT, owner: req.user._id,
    status: req.user.kyc.status === 'verified' || req.user.role === 'admin' ? 'live' : 'review',
  });
  res.status(201).json(offer);
}));
r.get('/my/offers', auth, wrap(async (req, res) => {
  res.json(await Offer.find({ owner: req.user._id }).populate('product', 'name').sort({ createdAt: -1 }));
}));

r.get('/admin/queue', auth, admin, wrap(async (_req, res) => {
  const [users, offers] = await Promise.all([
    User.find({ 'kyc.status': 'pending' }).select('-passwordHash'),
    Offer.find({ status: 'review' }).populate('product', 'name'),
  ]);
  res.json({ users, offers });
}));
r.post('/admin/kyc/:id', auth, admin, wrap(async (req, res) => {
  const status = req.body?.approve ? 'verified' : 'rejected';
  const u = await User.findByIdAndUpdate(req.params.id, { 'kyc.status': status }, { new: true });
  res.json({ ok: !!u });
}));
r.post('/admin/offers/:id', auth, admin, wrap(async (req, res) => {
  await Offer.findByIdAndUpdate(req.params.id, { status: req.body?.approve ? 'live' : 'closed' });
  res.json({ ok: true });
}));

export default r;
