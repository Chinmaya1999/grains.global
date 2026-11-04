import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, Navigate, useLocation, useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../lib/auth.jsx';
import { request, getProducts, getOffers, postLead, estimatePartner, setAccess } from '../api.js';
import Tools from '../pages/Tools.jsx';
import Marketplace from '../pages/Marketplace.jsx';
import Partner from '../pages/Partner.jsx';
import { Finance, Lenders, Agropreneur, Trust, Fraud } from '../pages/Platform.jsx';
import { Livelihood, Sustainability } from '../pages/Company.jsx';
import { Counter } from '../components/bits.jsx';
import { ACCESS, ToolAccess, canOpen } from '../lib/access.js';
import { PublicRoutes } from '../App.jsx';
import { LogoMark } from '../components/Logo.jsx';
import { usd, ago, Badge, Empty } from '../admin/ui.jsx';
import '../admin/admin.css';
import './dashboard.css';
import '../admin/glass-motion.css';

const I = {
  home: 'M3 12l9-8 9 8M5 10v10h5v-6h4v6h5V10',
  tag: 'M4 7h16M4 12h16M4 17h10',
  doc: 'M7 3h7l5 5v13H7zM14 3v5h5M10 13h6M10 17h6',
  calc: 'M6 3h12v18H6zM9 7h6M9 12h2M13 12h2M9 16h2M13 16h2',
  chart: 'M5 20V10M12 20V4M19 20v-7',
  shield: 'M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z',
  user: 'M16 11a4 4 0 10-8 0 4 4 0 008 0zM4 21c0-4 4-6 8-6s8 2 8 6',
  lock: 'M6 11h12v10H6zM8 11V8a4 4 0 018 0v3',
  leaf: 'M12 3c4 3 6 7 6 11a6 6 0 01-12 0c0-4 2-8 6-11z',
  bank: 'M3 10l9-6 9 6M5 10v9M10 10v9M14 10v9M19 10v9M3 21h18',
};

// [key, label, icon] per role. Everyone ends with Verification + Security.
const COMMON = [['kyc', 'Verification', 'shield'], ['security', 'Security', 'lock']];
const NAV = {
  buyer: [['overview', 'Overview', 'home'], ['market', 'Live offers', 'tag'], ['catalogue', 'Marketplace', 'leaf'], ['rfq', 'Post a requirement', 'doc'], ['tools', 'Trade tools', 'calc'], ['finance', 'Trade finance', 'chart'], ...COMMON],
  seller: [['overview', 'Overview', 'home'], ['offers', 'My offers', 'tag'], ['catalogue', 'Marketplace', 'leaf'], ['tools', 'Pricing tools', 'calc'], ['finance', 'Trade finance', 'chart'], ...COMMON],
  partner: [['overview', 'Overview', 'home'], ['earnings', 'Earnings estimator', 'chart'], ['partner', 'Partnership program', 'user'], ['market', 'Live offers', 'tag'], ...COMMON],
  agropreneur: [['overview', 'Overview', 'home'], ['program', 'The program', 'leaf'], ['livelihood', 'Livelihood', 'user'], ['sustainability', 'Sustainability', 'leaf'], ['tools', 'Farm & trade tools', 'calc'], ...COMMON],
  bank: [['overview', 'Overview', 'home'], ['market', 'Deal flow', 'bank'], ['finance', 'Finance products', 'chart'], ['lenders', 'Banks & NBFCs', 'bank'], ['trust', 'Trust framework', 'shield'], ['fraud', 'Fraud prevention', 'lock'], ['tools', 'Finance tools', 'calc'], ...COMMON],
};
// Public pages that open inside the dashboard instead of leaving it: tab -> [public path, title, component]
const EMBED = {
  tools: ['/tools', 'Trade tools', Tools], catalogue: ['/marketplace', 'Marketplace', Marketplace], partner: ['/partner', 'Partnership program', Partner],
  finance: ['/finance', 'Finance products', Finance], lenders: ['/lenders', 'Banks & NBFCs', Lenders], program: ['/agropreneur', 'The program', Agropreneur],
  livelihood: ['/livelihood', 'Livelihood generation', Livelihood], sustainability: ['/sustainability', 'Sustainability', Sustainability],
  trust: ['/trust', 'Trust framework', Trust], fraud: ['/fraud-prevention', 'Fraud prevention', Fraud],
};
const PATH_TAB = Object.fromEntries(Object.entries(EMBED).map(([k, v]) => [v[0], k]));

const TITLE = { buyer: 'Buyer', seller: 'Seller', partner: 'Partner', agropreneur: 'AgroPreneur', bank: 'Bank / NBFC' };
const LEAD = {
  buyer: 'Source verified rice and compare offers from sellers.',
  seller: 'List offers and reach verified buyers worldwide.',
  partner: 'Own the buyer relationship and share the margin.',
  agropreneur: 'Your free training, funding and livelihood network.',
  bank: 'Deal-level intelligence and finance opportunities.',
};

function LinkCards({ items }) {
  return <div className="dcards">{items.map(([t, d, to]) => <Link key={t} to={to} className="glass dcard"><b>{t}</b><small>{d}</small><span>Open →</span></Link>)}</div>;
}

function Overview({ user, go }) {
  const [n, setN] = useState([]);
  useEffect(() => {
    if (user.role === 'seller') request('/my/offers').then((m) => setN([['My offers', m.length, '#c6ff3d'], ['Live', m.filter((o) => o.status === 'live').length, '#5ee0d1'], ['In review', m.filter((o) => o.status === 'review').length, '#ffc65c']])).catch(() => {});
    else if (['buyer', 'partner', 'bank'].includes(user.role)) getOffers().then((o) => setN([['Live offers', o.length, '#c6ff3d'], ['Tonnes listed', o.reduce((a, x) => a + (x.quantityMT || 0), 0).toLocaleString('en-US'), '#5ee0d1']]));
  }, [user.role]);
  const s = user.kyc?.status || 'none';
  return (
    <>
      <section className="glass card hero">
        <small>WELCOME BACK</small><h2>Hello, {user.name.split(' ')[0]}.</h2><p className="muted">{LEAD[user.role]}</p>
        <div className="hbtns">
          {(NAV[user.role] || []).filter(([k]) => k !== 'overview').slice(0, 3).map(([k, l], i) => <button key={k} className={`gbtn ${i ? '' : 'pri'}`} onClick={() => go(k)}>{l}</button>)}
        </div>
      </section>
      <div className="kpis">
        {n.map(([l, v, c]) => <div key={l} className="glass kpi" style={{ '--c': c }}><span>{l}</span><b>{typeof v === 'number' ? <Counter to={v} /> : v}</b><i /></div>)}
        <button className="glass kpi" style={{ '--c': s === 'verified' ? '#c6ff3d' : '#ffc65c' }} onClick={() => go('kyc')}><span>Verification</span><b style={{ fontSize: '1.7rem' }}>{s === 'none' ? 'Not started' : s}</b><small>{s === 'verified' ? 'You are fully verified' : 'Tap to complete'}</small><i /></button>
      </div>
    </>
  );
}

function Market({ title }) {
  const [rows, setRows] = useState(null);
  useEffect(() => { getOffers().then(setRows); }, []);
  if (!rows) return <Empty>Loading…</Empty>;
  if (!rows.length) return <Empty>No live offers right now.</Empty>;
  return (
    <section className="glass card"><header><h3>{title}</h3><Link className="link" to="/dashboard/catalogue">Full marketplace →</Link></header>
      <div className="tbl-wrap"><table className="tbl"><thead><tr><th>Variety</th><th>Seller</th><th>Route</th><th>Qty</th><th>Price</th></tr></thead>
        <tbody>{rows.map((o) => <tr key={o._id}><td><b>{o.product?.name}</b></td><td>{o.sellerCompany}</td><td>{o.origin} → {o.destination} · {o.incoterm}</td><td>{o.quantityMT} MT</td><td>{usd(o.priceUsdPerMT)}/MT</td></tr>)}</tbody></table></div>
    </section>
  );
}

function Rfq({ user, toast }) {
  const [products, setProducts] = useState([]);
  const [sent, setSent] = useState([]);
  useEffect(() => { getProducts().then(setProducts); }, []);
  async function submit(e) {
    e.preventDefault();
    const form = e.currentTarget; const b = Object.fromEntries(new FormData(form));
    try {
      await postLead({ role: 'buyer', name: user.name, email: user.email, company: user.company, ...b, quantityMT: +b.quantityMT });
      setSent((s) => [{ ...b, at: new Date() }, ...s]); form.reset(); toast('Requirement sent. Sellers will respond with quotes.');
    } catch (x) { toast(x.message, true); }
  }
  return (
    <div className="grid2">
      <form className="glass card dform" onSubmit={submit}>
        <header><h3>Post a requirement</h3></header>
        <label>Variety<select className="gin" name="productSlug">{products.map((p) => <option key={p.slug} value={p.slug}>{p.name}</option>)}</select></label>
        <label>Quantity (MT)<input className="gin" name="quantityMT" type="number" min="1" required /></label>
        <label>Destination<input className="gin" name="destination" required /></label>
        <label>Incoterm<select className="gin" name="incoterm"><option>CIF</option><option>FOB</option><option>CFR</option><option>EXW</option></select></label>
        <label>Notes<textarea className="gin" name="message" rows="3" /></label>
        <button className="gbtn pri">Send requirement</button>
      </form>
      <section className="glass card"><header><h3>Sent this session</h3></header>
        {!sent.length ? <Empty>Nothing sent yet</Empty> : sent.map((s, i) => <div className="row" key={i}><span><b>{s.productSlug}</b><small>{s.quantityMT} MT → {s.destination}</small></span><small>{ago(s.at)}</small></div>)}
      </section>
    </div>
  );
}

function Offers({ toast }) {
  const [products, setProducts] = useState([]);
  const [mine, setMine] = useState(null);
  const load = () => request('/my/offers').then(setMine).catch(() => setMine([]));
  useEffect(() => { getProducts().then(setProducts); load(); }, []);
  async function submit(e) {
    e.preventDefault();
    const form = e.currentTarget; const b = Object.fromEntries(new FormData(form));
    try {
      const o = await request('/my/offers', { method: 'POST', body: { ...b, quantityMT: +b.quantityMT, priceUsdPerMT: +b.priceUsdPerMT } });
      toast(o.status === 'live' ? 'Offer is live.' : 'Offer saved and waiting for review.'); load(); form.reset();
    } catch (x) { toast(x.message, true); }
  }
  return (
    <div className="grid2">
      <section className="glass card"><header><h3>My offers</h3></header>
        {!mine ? <Empty>Loading…</Empty> : !mine.length ? <Empty>No offers yet. Post your first one.</Empty> : (
          <div className="tbl-wrap"><table className="tbl"><thead><tr><th>Variety</th><th>Qty</th><th>Price</th><th>Status</th></tr></thead>
            <tbody>{mine.map((o) => <tr key={o._id}><td><b>{o.product?.name}</b><small>{o.origin} → {o.destination}</small></td><td>{o.quantityMT} MT</td><td>{usd(o.priceUsdPerMT)}</td><td><Badge v={o.status} /></td></tr>)}</tbody></table></div>)}
      </section>
      <form className="glass card dform" onSubmit={submit}>
        <header><h3>Post an offer</h3></header>
        <label>Variety<select className="gin" name="productSlug">{products.map((p) => <option key={p.slug} value={p.slug}>{p.name}</option>)}</select></label>
        <label>Origin port<input className="gin" name="origin" required /></label>
        <label>Destination<input className="gin" name="destination" required /></label>
        <label>Incoterm<select className="gin" name="incoterm"><option>FOB</option><option>CIF</option><option>CFR</option><option>EXW</option></select></label>
        <label>Quantity (MT)<input className="gin" name="quantityMT" type="number" min="1" required /></label>
        <label>Price (USD/MT)<input className="gin" name="priceUsdPerMT" type="number" min="1" required /></label>
        <button className="gbtn pri">Post offer</button>
      </form>
    </div>
  );
}

function Earnings() {
  const [monthly, setMonthly] = useState(100); const [margin, setMargin] = useState(40); const [r, setR] = useState(null);
  useEffect(() => { estimatePartner(monthly, margin).then(setR); }, [monthly, margin]);
  return (
    <section className="glass card dform">
      <header><h3>Partner earnings estimator</h3><Link className="link" to="/partner">How it works →</Link></header>
      <label>Monthly volume (MT)<input className="gin" type="number" min="1" value={monthly} onChange={(e) => setMonthly(+e.target.value || 1)} /></label>
      <label>Margin (USD/MT)<input className="gin" type="number" min="1" value={margin} onChange={(e) => setMargin(+e.target.value || 1)} /></label>
      <pre className="est">{r ? JSON.stringify(r, null, 2) : 'Estimate unavailable right now.'}</pre>
    </section>
  );
}

function Kyc({ user, setUser, toast }) {
  const s = user.kyc?.status || 'none';
  async function submit(e) {
    e.preventDefault();
    try { setUser((await request('/auth/kyc', { method: 'POST', body: Object.fromEntries(new FormData(e.currentTarget)) })).user); toast('Submitted for review.'); }
    catch (x) { toast(x.message, true); }
  }
  return (
    <section className="glass card dform"><header><h3>Verification (KYC / KYB)</h3><Badge v={s} /></header>
      {s === 'verified' && <p className="muted">You are verified. {user.role === 'seller' ? 'Offers go live immediately.' : 'Sellers and lenders can trust your profile.'}</p>}
      {s === 'pending' && <p className="muted">Submitted. Our team will review your details.</p>}
      {(s === 'none' || s === 'rejected') && <form onSubmit={submit} className="dform">
        <label>GSTIN<input className="gin" name="gstin" /></label><label>IEC number<input className="gin" name="iec" /></label><label>Country<input className="gin" name="country" /></label>
        <button className="gbtn pri">Submit for review</button></form>}
    </section>
  );
}

function Security({ toast }) {
  const { logout } = useAuth();
  const [sessions, setSessions] = useState([]);
  const load = () => request('/auth/sessions').then(setSessions).catch(() => {});
  useEffect(() => { load(); }, []);
  const device = (ua = '') => (/iPhone|iPad/.test(ua) ? 'iPhone / iPad' : /Android/.test(ua) ? 'Android' : /Mac/.test(ua) ? 'Mac' : /Windows/.test(ua) ? 'Windows' : /Linux/.test(ua) ? 'Linux' : 'Unknown device')
    + (/Edg\//.test(ua) ? ' · Edge' : /Chrome\//.test(ua) ? ' · Chrome' : /Safari\//.test(ua) ? ' · Safari' : /Firefox\//.test(ua) ? ' · Firefox' : '');
  async function changePassword(e) {
    e.preventDefault(); const form = e.currentTarget;
    try { const d = await request('/auth/password', { method: 'POST', body: Object.fromEntries(new FormData(form)) }); setAccess(d.token); form.reset(); toast('Password changed. Other devices were signed out.'); load(); }
    catch (x) { toast(x.message, true); }
  }
  return (
    <div className="grid2">
      <form className="glass card dform" onSubmit={changePassword}><header><h3>Change password</h3></header>
        <label>Current password<input className="gin" name="currentPassword" type="password" required autoComplete="current-password" /></label>
        <label>New password<input className="gin" name="newPassword" type="password" required minLength={8} maxLength={72} autoComplete="new-password" /><small>At least 8 characters, with a letter and a number.</small></label>
        <button className="gbtn pri">Change password</button></form>
      <section className="glass card"><header><h3>Where you're signed in</h3></header>
        {sessions.map((s) => <div className="row" key={s.id}><span><b>{device(s.userAgent)}{s.current && ' · this device'}</b><small>{s.ip} · {new Date(s.createdAt).toLocaleDateString()}</small></span>
          {!s.current && <button className="gbtn sm" onClick={() => request(`/auth/sessions/${s.id}`, { method: 'DELETE' }).then(load)}>Sign out</button>}</div>)}
        <button className="gbtn danger wide" onClick={async () => { if (confirm('Sign out of every device, including this one?')) { await request('/auth/logout-all', { method: 'POST' }).catch(() => {}); await logout(); } }}>Sign out of all devices</button>
      </section>
    </div>
  );
}

export default function Dashboard() {
  const { user, setUser, ready, logout } = useAuth();
  const rest = (useParams()['*'] || '').replace(/^dashboard\/?/, '');
  const { hash } = useLocation();
  const isPage = rest.startsWith('p/');           // /dashboard/p/<public path>: any other public page, shown inside the dashboard
  const tab = isPage ? 'p' : rest || 'overview';
  const [pageTitle, setPageTitle] = useState('');
  const nav = useNavigate();
  const [toasts, setToasts] = useState([]); const id = useRef(0);
  const toast = useCallback((text, bad = false) => {
    const k = ++id.current; setToasts((t) => [...t, { k, text, bad }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.k !== k)), 3200);
  }, []);
  useEffect(() => { document.querySelector('.adm .body')?.scrollTo(0, 0); document.querySelector('.adm')?.scrollTo(0, 0); }, [tab]);
  useEffect(() => {
    const t = setTimeout(() => {
      if (hash) document.getElementById(hash.slice(1))?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      if (isPage) setPageTitle(document.querySelector('.adm .demb h1')?.textContent?.trim().slice(0, 60) || '');
    }, 120);
    return () => clearTimeout(t);
  }, [rest, hash, isPage]);
  const shell = (c) => <div className="adm"><div className="orb o1" /><div className="orb o2" /><div className="orb o3" />{c}</div>;
  if (!ready) return shell(null);
  if (!user) return <Navigate to="/account?next=/dashboard" replace />;
  if (user.role === 'admin') return <Navigate to="/admin" replace />;

  const menu = NAV[user.role] || NAV.buyer;
  const cur = isPage ? ['p', pageTitle || 'Page'] : menu.find(([k]) => k === tab) || (EMBED[tab] && [tab, EMBED[tab][1]]) || menu[0];
  const go = (k) => nav(k === 'overview' ? '/dashboard' : `/dashboard/${k}`);
  const Page = !isPage && EMBED[cur[0]]?.[2];
  // links inside an embedded page stay in the dashboard when they point at another embedded page
  const keep = (e) => {
    const a = e.target.closest?.('a[href]');
    if (!a || e.metaKey || e.ctrlKey || e.shiftKey || a.target === '_blank') return;
    const u = new URL(a.href);
    if (u.origin !== location.origin) return;
    if (u.pathname.startsWith('/admin')) return;
    e.preventDefault(); e.stopPropagation();
    const t = PATH_TAB[u.pathname];
    if (u.pathname === '/' || u.pathname === '/account') return nav('/dashboard');
    nav(t ? `/dashboard/${t}${u.search}${u.hash}` : `/dashboard/p${u.pathname}${u.search}${u.hash}`);
  };
  const pubPath = isPage ? `/${rest.slice(2)}` : EMBED[cur[0]]?.[0];
  const blocked = pubPath && !canOpen(user.role, pubPath);
  const embed = blocked
    ? <section className="glass card nope"><h3>Not part of your {TITLE[user.role] || ''} dashboard</h3><p className="muted">This page is for another type of account. Your menu on the left shows everything you can use.</p><button className="gbtn pri" onClick={() => go('overview')}>Back to overview</button></section>
    : <div className="demb" data-role={user.role} onClickCapture={keep}><ToolAccess.Provider value={ACCESS[user.role]?.tools || []}>{isPage ? <PublicRoutes location={{ pathname: pubPath }} /> : <Page />}</ToolAccess.Provider></div>;
  const body = Page || isPage ? embed : {
    overview: <Overview user={user} go={go} />, market: <Market title={user.role === 'bank' ? 'Deal flow · live offers' : 'Live offers'} />, rfq: <Rfq user={user} toast={toast} />,
    offers: <Offers toast={toast} />, earnings: <Earnings />, kyc: <Kyc user={user} setUser={setUser} toast={toast} />, security: <Security toast={toast} />,
  }[cur[0]];

  return shell(
    <>
      <aside className="side glass">
        <Link to="/dashboard" className="brand"><LogoMark size={30} /><span>AGRI<em>{user.role}</em></span></Link>
        <nav>{menu.map(([k, label, ic]) => (
          <button key={k} className={k === cur[0] ? 'on' : ''} onClick={() => go(k)}><svg viewBox="0 0 24 24" aria-hidden><path d={I[ic] || I.home} /></svg>{label}</button>))}
        </nav>
        <div className="me"><b>{user.name}</b><small>{user.email}</small><button className="gbtn sm" onClick={async () => { await logout(); nav('/'); }}>Sign out</button></div>
      </aside>
      <section className="body">
        <header className="top"><div>{cur[0] !== 'overview' && <button className="gbtn back" onClick={() => (window.history.state?.idx > 0 ? nav(-1) : nav('/dashboard'))} aria-label="Go back">← Back</button>}<small>{TITLE[user.role] || 'Member'} DASHBOARD</small><h1>{cur[1]}</h1></div></header>
        <div key={cur[0]}>{body}</div>
      </section>
      <div className="toasts" aria-live="polite">{toasts.map((t) => <div key={t.k} className={`toast glass ${t.bad ? 'bad' : ''}`}>{t.text}</div>)}</div>
    </>,
  );
}
