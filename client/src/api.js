import { FALLBACK_VARIETIES } from './lib/data.js';

const FALLBACK_STATS = [
  { key: 'corridor', label: 'Countries in the AIM corridor', value: 31, suffix: '' },
  { key: 'skus', label: 'Rice varieties listed', value: 24, suffix: '' },
  { key: 'tools', label: 'Free calculators & scorecards', value: 7, suffix: '' },
  { key: 'women', label: 'Women AgroPreneurs by our goal', value: 1, suffix: 'M' },
];

// The short-lived access token lives only in memory (never localStorage), so injected scripts can't steal a
// long-lived credential. The session survives reloads through an HttpOnly refresh cookie the page can't read.
let access = null;
let refreshing = null;
try { localStorage.removeItem('gg_token'); } catch { /* storage blocked */ } // remove the old, insecure token storage

export const hasSession = () => !!access;
export const setAccess = (t) => { access = t; };

function refreshAccess() {
  if (!refreshing) {
    refreshing = fetch('/api/auth/refresh', { method: 'POST', credentials: 'same-origin' })
      .then(async (res) => { if (!res.ok) { access = null; return null; } const d = await res.json(); access = d.token; return d; })
      .catch(() => null)
      .finally(() => { refreshing = null; });
  }
  return refreshing;
}
export const restoreSession = () => refreshAccess();

const NO_RETRY = ['/auth/login', '/auth/register', '/auth/refresh', '/auth/password', '/auth/logout'];
const send = (path, { method = 'GET', body } = {}) => fetch(`/api${path}`, {
  method, credentials: 'same-origin',
  headers: { 'Content-Type': 'application/json', ...(access ? { Authorization: `Bearer ${access}` } : {}) },
  body: body ? JSON.stringify(body) : undefined,
});

export async function request(path, opts = {}) {
  let res = await send(path, opts);
  // An expired access token is renewed once, transparently, then the call is retried.
  if (res.status === 401 && access && !NO_RETRY.includes(path)) {
    if (await refreshAccess()) res = await send(path, opts);
    else window.dispatchEvent(new Event('gg:signed-out'));
  }
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw Object.assign(new Error(data.error || 'Request failed'), { status: res.status });
  return data;
}

const soft = (path, fallback) => request(path).then((d) => (Array.isArray(d) && !d.length ? fallback : d)).catch(() => fallback);
export const getStats = () => soft('/stats', FALLBACK_STATS);
export const getProducts = () => soft('/products', FALLBACK_VARIETIES);
export const getOffers = () => soft('/offers', []);
export const estimatePartner = (monthly, margin) => request(`/partner/estimate?monthly=${monthly}&margin=${margin}`).catch(() => null);
export const postLead = (body) => request('/leads', { method: 'POST', body });
