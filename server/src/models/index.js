import mongoose from 'mongoose';
const { Schema, model } = mongoose;

export const Product = model('Product', new Schema({
  slug: { type: String, unique: true, required: true },
  name: { type: String, required: true },
  family: { type: String, enum: ['Basmati', 'Non-Basmati', 'Sella'], required: true },
  processing: String,
  hsn: { type: String, default: '10063020' },
  avgPriceUsd: Number,
  grain: { length: Number, broken: Number, moisture: Number },
  packaging: [String],
  incoterms: [String],
  blurb: String,
}, { timestamps: true }));

export const Offer = model('Offer', new Schema({
  product: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
  sellerCompany: { type: String, required: true },
  origin: String,
  destination: String,
  incoterm: { type: String, default: 'FOB' },
  quantityMT: { type: Number, required: true, min: 1 },
  priceUsdPerMT: { type: Number, required: true, min: 1 },
  status: { type: String, enum: ['review', 'live', 'closed'], default: 'review' },
  owner: { type: Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true }));

export const Lead = model('Lead', new Schema({
  role: { type: String, enum: ['buyer', 'seller', 'partner', 'agropreneur', 'bank', 'contact'], required: true },
  name: { type: String, required: true, trim: true },
  company: { type: String, trim: true },
  email: { type: String, required: true, trim: true, lowercase: true },
  phone: String,
  country: String,
  message: String,
  productSlug: String,
  quantityMT: Number,
  incoterm: String,
  destination: String,
  packaging: String,
  paymentTerms: String,
  targetPriceUsd: Number,
  status: { type: String, enum: ['new', 'contacted', 'closed'], default: 'new' },
  note: String,
}, { timestamps: true }));

export const Stat = model('Stat', new Schema({
  key: { type: String, unique: true },
  label: String,
  value: Number,
  suffix: String,
  order: Number,
}));

export const User = model('User', new Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  passwordHash: { type: String, required: true },
  role: { type: String, enum: ['buyer', 'seller', 'partner', 'agropreneur', 'bank', 'admin'], default: 'buyer' },
  company: String,
  tokenVersion: { type: Number, default: 0 },   // bumping this invalidates every access token for the user
  failedLogins: { type: Number, default: 0 },
  lockUntil: Date,
  lastLoginAt: Date,
  kyc: {
    status: { type: String, enum: ['none', 'pending', 'verified', 'rejected'], default: 'none' },
    gstin: String, iec: String, country: String, submittedAt: Date,
  },
}, { timestamps: true }));

// Admin-edited overrides for the site's text content (keyed by content block name).
export const Content = model('Content', new Schema({
  key: { type: String, unique: true, required: true },
  data: Schema.Types.Mixed,
  updatedBy: String,
}, { timestamps: true }));

export const AuditLog = model('AuditLog', new Schema({
  adminEmail: String,
  method: String,
  path: String,
  detail: String,
}, { timestamps: true }));

// One row per signed-in device. Only a hash of the token is stored, so a database leak can't be replayed.
const refresh = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User', index: true, required: true },
  tokenHash: { type: String, unique: true, required: true },
  expiresAt: { type: Date, required: true },
  revokedAt: Date,
  ip: String,
  userAgent: String,
}, { timestamps: true });
refresh.index({ expiresAt: 1 }, { expireAfterSeconds: 0 }); // expired rows are deleted automatically
export const RefreshToken = model('RefreshToken', refresh);
