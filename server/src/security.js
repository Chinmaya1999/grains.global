import crypto from 'node:crypto';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { User, RefreshToken } from './models/index.js';

const PROD = process.env.NODE_ENV === 'production';
// Secure cookies need HTTPS. Defaults to on in production; set COOKIE_SECURE=false only while the site is served over plain HTTP.
const SECURE = process.env.COOKIE_SECURE ? process.env.COOKIE_SECURE === 'true' : PROD;
const COOKIE = 'gg_rt';
const REFRESH_MS = 7 * 24 * 3600 * 1000;
export const ACCESS_TTL = '15m';

// ---------- startup checks ----------
export function checkConfig() {
  const s = process.env.JWT_SECRET || '';
  if (s.length < 32) { console.error('JWT_SECRET must be set to a random string of at least 32 characters.'); process.exit(1); }
}

// ---------- passwords ----------
// bcrypt only reads the first 72 bytes, so longer passwords are rejected rather than silently truncated.
export function passwordProblem(pw) {
  if (typeof pw !== 'string') return 'Password is required.';
  if (pw.length < 8) return 'Password must be at least 8 characters.';
  if (Buffer.byteLength(pw) > 72) return 'Password must be 72 characters or fewer.';
  if (!/[A-Za-z]/.test(pw) || !/\d/.test(pw)) return 'Password must include at least one letter and one number.';
  return null;
}
export const hashPassword = (pw) => bcrypt.hash(pw, 11);
// Compared against when the email is unknown, so response time doesn't reveal which emails exist.
export const DUMMY_HASH = bcrypt.hashSync('not-a-real-password-1', 11);

// ---------- request hardening ----------
export const securityHeaders = helmet({
  contentSecurityPolicy: {
    useDefaults: false,
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
      fontSrc: ["'self'", 'https://fonts.gstatic.com'],
      imgSrc: ["'self'", 'data:', 'blob:', 'https://*.arcgisonline.com'],
      connectSrc: ["'self'"],
      objectSrc: ["'none'"], baseUri: ["'self'"], frameAncestors: ["'none'"], formAction: ["'self'"],
    },
  },
  crossOriginEmbedderPolicy: false,
  hsts: SECURE ? { maxAge: 15552000, includeSubDomains: true } : false,
});

// Stop NoSQL operator injection: drop any key that starts with "$" or contains "." from user input.
const clean = (o) => {
  if (Array.isArray(o)) o.forEach(clean);
  else if (o && typeof o === 'object') for (const k of Object.keys(o)) { if (k.startsWith('$') || k.includes('.')) delete o[k]; else clean(o[k]); }
};
export const sanitize = (req, _res, next) => { clean(req.body); clean(req.params); clean(req.query); next(); };

const limit = (windowMs, max, error) => rateLimit({ windowMs, limit: max, standardHeaders: 'draft-7', legacyHeaders: false, message: { error } });
export const apiLimiter = limit(15 * 60e3, 600, 'Too many requests. Please slow down.');
export const loginLimiter = limit(15 * 60e3, 10, 'Too many sign-in attempts. Please try again in 15 minutes.');
export const registerLimiter = limit(60 * 60e3, 10, 'Too many sign-ups from this address. Please try again later.');
export const refreshLimiter = limit(15 * 60e3, 120, 'Too many session checks. Please slow down.');
export const leadLimiter = limit(60 * 60e3, 20, 'Too many submissions. Please try again later.');

// Cookie-based endpoints only accept requests from our own site (blocks cross-site requests).
const allowed = (process.env.CLIENT_ORIGIN || 'http://localhost:5173,http://127.0.0.1:5173').split(',').map((s) => s.trim());
export const corsOrigins = allowed;
export const sameOrigin = (req, res, next) => {
  const o = req.headers.origin;
  if (!o) return next();
  let host = '';
  try { host = new URL(o).host; } catch { /* malformed */ }
  if (allowed.includes(o) || host === req.headers.host) return next();
  res.status(403).json({ error: 'Origin not allowed.' });
};

// ---------- tokens ----------
const sha = (s) => crypto.createHash('sha256').update(s).digest('hex');
const cookieOpts = { httpOnly: true, sameSite: 'strict', secure: SECURE, path: '/api/auth' };

export const signAccess = (u) => jwt.sign({ sub: String(u._id), tv: u.tokenVersion || 0 }, process.env.JWT_SECRET, { algorithm: 'HS256', expiresIn: ACCESS_TTL });

// Start a session: a 15-minute access token in the response, a 7-day refresh token in an HttpOnly cookie.
export async function startSession(u, req, res) {
  const raw = crypto.randomBytes(48).toString('base64url');
  await RefreshToken.create({ user: u._id, tokenHash: sha(raw), expiresAt: new Date(Date.now() + REFRESH_MS), ip: req.ip, userAgent: String(req.headers['user-agent'] || '').slice(0, 200) });
  res.cookie(COOKIE, raw, { ...cookieOpts, maxAge: REFRESH_MS });
  return signAccess(u);
}
export const clearSessionCookie = (res) => res.clearCookie(COOKIE, cookieOpts);
export const revokeAllSessions = (userId) => RefreshToken.updateMany({ user: userId, revokedAt: null }, { revokedAt: new Date() });
export const currentSessionHash = (req) => (req.cookies?.[COOKIE] ? sha(req.cookies[COOKIE]) : null);

// Swap the refresh token for a new one. Presenting an already-used token means it was stolen,
// so every session for that user is revoked.
export async function rotateSession(req, res) {
  const raw = req.cookies?.[COOKIE];
  if (!raw) return null;
  const row = await RefreshToken.findOne({ tokenHash: sha(raw) });
  if (!row) { clearSessionCookie(res); return null; }
  if (row.revokedAt) {
    // Two tabs refreshing at the same instant both present the same token. Within a few seconds that is a race,
    // not theft, so just hand out an access token and leave the (already rotated) cookie alone.
    if (Date.now() - row.revokedAt < 10_000) {
      const u = await User.findById(row.user);
      return u ? { user: u, token: signAccess(u) } : null;
    }
    await revokeAllSessions(row.user); clearSessionCookie(res); return null; // an old token came back: assume it was stolen
  }
  if (row.expiresAt < new Date()) { clearSessionCookie(res); return null; }
  const user = await User.findById(row.user);
  if (!user) { clearSessionCookie(res); return null; }
  row.revokedAt = new Date();
  await row.save();
  return { user, token: await startSession(user, req, res) };
}

// ---------- authentication + authorization ----------
export const auth = async (req, res, next) => {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : '';
  let expired = false;
  try {
    const p = jwt.verify(token, process.env.JWT_SECRET, { algorithms: ['HS256'] });
    const u = await User.findById(p.sub);
    if (u && (u.tokenVersion || 0) === p.tv) req.user = u;
  } catch (e) { expired = e?.name === 'TokenExpiredError'; }
  if (!req.user) return res.status(401).json({ error: 'Please sign in.', code: expired ? 'expired' : 'invalid' });
  next();
};
export const requireRole = (...roles) => (req, res, next) => (roles.includes(req.user?.role) ? next() : res.status(403).json({ error: 'You do not have permission to do that.' }));
export const admin = requireRole('admin');
