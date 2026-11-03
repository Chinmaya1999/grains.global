import 'dotenv/config';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import fs from 'node:fs';
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { securityHeaders, sanitize, apiLimiter, corsOrigins, checkConfig } from './security.js';
import mongoose from 'mongoose';
import api from './routes/api.js';
import authRoutes from './routes/auth.js';
import adminRoutes from './routes/admin.js';
import { AuditLog } from './models/index.js';

checkConfig();
const app = express();
if (process.env.TRUST_PROXY) app.set('trust proxy', Number(process.env.TRUST_PROXY) || 1); // set when behind nginx / a load balancer
app.use(securityHeaders);
app.use(cors({ origin: corsOrigins, credentials: true }));
app.use(cookieParser());
app.use(express.json({ limit: '100kb' }));
app.use(sanitize);
app.use('/api', apiLimiter);
// Record every successful admin change (never the body's password).
app.use('/api/admin', (req, res, next) => {
  res.on('finish', () => {
    if (req.method === 'GET' || res.statusCode >= 400 || !req.user) return;
    const { password, data, ...rest } = req.body || {};
    const detail = JSON.stringify(data !== undefined ? { content: Object.keys(data).length ? 'edited' : 'empty' } : rest).slice(0, 300);
    AuditLog.create({ adminEmail: req.user.email, method: req.method, path: req.originalUrl.replace('/api', ''), detail: password !== undefined ? `${detail} (password set)` : detail }).catch(() => {});
  });
  next();
});
app.use('/api', api);
app.use('/api', authRoutes);
app.use('/api/admin', adminRoutes);

const dist = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../client/dist');
if (fs.existsSync(dist)) {
  app.use(express.static(dist));
  app.get('*', (_req, res) => res.sendFile(path.join(dist, 'index.html')));
}

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: 'Something went wrong' });
});

const port = process.env.PORT || 5050;
mongoose.connect(process.env.MONGODB_URI)
  .then(() => { console.log('MongoDB connected'); app.listen(port, () => console.log(`API on :${port}`)); })
  .catch((e) => { console.error('MongoDB connection failed:', e.message); process.exit(1); });
