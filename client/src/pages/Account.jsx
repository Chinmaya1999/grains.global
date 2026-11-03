import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../lib/auth.jsx';
import { request, getProducts, setAccess } from '../api.js';
import { Reveal } from '../components/bits.jsx';
import { Photo } from '../components/Art.jsx';
import { LogoMark } from '../components/Logo.jsx';

function AuthForm() {
  const { login, register } = useAuth();
  const [mode, setMode] = useState('login');
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);
  async function submit(e) {
    e.preventDefault();
    setBusy(true); setErr('');
    const body = Object.fromEntries(new FormData(e.currentTarget));
    try { await (mode === 'login' ? login(body) : register(body)); }
    catch (x) { setErr(x.message); setBusy(false); }
  }
  return (
    <section className="auth">
      <Photo name="login-bg" scene="paddy" alt="" className="auth-bg" />
      <div className="auth-card">
        <LogoMark size={44} />
        <h1>{mode === 'login' ? 'Welcome back.' : 'Join the harvest.'}</h1>
        <p className="muted">{mode === 'login' ? 'Sign in to manage offers, verification and requests.' : 'Create an account to trade, finance and grow on the AIM corridor.'}</p>
        <div className="chips"><button className={mode === 'login' ? 'on' : ''} onClick={() => setMode('login')}>Sign in</button><button className={mode === 'register' ? 'on' : ''} onClick={() => setMode('register')}>Register</button></div>
        <form className="form one" onSubmit={submit}>
          {mode === 'register' && <>
            <label>Name<input name="name" required autoComplete="name" /></label>
            <label>Company<input name="company" autoComplete="organization" /></label>
            <label>I am a<select name="role"><option value="buyer">Buyer</option><option value="seller">Seller / exporter</option><option value="partner">Trading partner</option><option value="agropreneur">AgroPreneur</option><option value="bank">Bank / NBFC</option></select></label>
          </>}
          <label>Email<input name="email" type="email" required autoComplete="email" /></label>
          <label>Password<input name="password" type="password" required minLength={8} maxLength={72} autoComplete={mode === 'login' ? 'current-password' : 'new-password'} />
            {mode === 'register' && <small>At least 8 characters, with a letter and a number.</small>}</label>
          {err && <p className="err" role="alert">{err}</p>}
          <button className="btn lime" disabled={busy}>{busy ? 'Please wait…' : mode === 'login' ? 'Sign in' : 'Create account'}</button>
        </form>
      </div>
    </section>
  );
}

function Kyc({ user, setUser }) {
  const [err, setErr] = useState('');
  const s = user.kyc.status;
  async function submit(e) {
    e.preventDefault(); setErr('');
    try { setUser((await request('/auth/kyc', { method: 'POST', body: Object.fromEntries(new FormData(e.currentTarget)) })).user); }
    catch (x) { setErr(x.message); }
  }
  return (
    <div className="panel">
      <h2 className="h3">Verification (KYC / KYB) <span className={`badge ${s}`}>{s}</span></h2>
      {s === 'verified' && <p className="muted">You are verified. Seller offers go live immediately.</p>}
      {s === 'pending' && <p className="muted">Submitted. Our team will review your details.</p>}
      {(s === 'none' || s === 'rejected') && (
        <form className="form" onSubmit={submit}>
          <label>GSTIN<input name="gstin" /></label><label>IEC number<input name="iec" /></label><label>Country<input name="country" /></label>
          {err && <p className="err" role="alert">{err}</p>}
          <button className="btn">Submit for review</button>
        </form>
      )}
    </div>
  );
}

function Seller() {
  const [products, setProducts] = useState([]);
  const [mine, setMine] = useState([]);
  const [msg, setMsg] = useState('');
  const load = () => request('/my/offers').then(setMine).catch(() => {});
  useEffect(() => { getProducts().then(setProducts); load(); }, []);
  async function submit(e) {
    e.preventDefault(); setMsg('');
    const b = Object.fromEntries(new FormData(e.currentTarget));
    try {
      const o = await request('/my/offers', { method: 'POST', body: { ...b, quantityMT: +b.quantityMT, priceUsdPerMT: +b.priceUsdPerMT } });
      setMsg(o.status === 'live' ? 'Offer is live.' : 'Offer saved and waiting for review.'); load(); e.currentTarget.reset();
    } catch (x) { setMsg(x.message); }
  }
  return (
    <div className="panel">
      <h2 className="h3">Post an offer</h2>
      <form className="form" onSubmit={submit}>
        <label>Variety<select name="productSlug">{products.map((p) => <option key={p.slug} value={p.slug}>{p.name}</option>)}</select></label>
        <label>Origin port<input name="origin" required /></label><label>Destination<input name="destination" required /></label>
        <label>Incoterm<select name="incoterm"><option>FOB</option><option>CIF</option><option>CFR</option><option>EXW</option></select></label>
        <label>Quantity (MT)<input name="quantityMT" type="number" min="1" required /></label>
        <label>Price (USD/MT)<input name="priceUsdPerMT" type="number" min="1" required /></label>
        {msg && <p className="note wide">{msg}</p>}
        <button className="btn">Post offer</button>
      </form>
      {mine.length > 0 && <div className="table sm">{mine.map((o) => <div className="tr" key={o._id}><span>{o.product?.name}</span><span>{o.quantityMT} MT</span><span>${o.priceUsdPerMT}</span><span className={`badge ${o.status}`}>{o.status}</span></div>)}</div>}
    </div>
  );
}

function Admin() {
  const [q, setQ] = useState({ users: [], offers: [] });
  const load = () => request('/admin/queue').then(setQ).catch(() => {});
  useEffect(() => { load(); }, []);
  const act = (path, approve) => request(path, { method: 'POST', body: { approve } }).then(load);
  return (
    <div className="panel">
      <h2 className="h3">Review queue</h2>
      {!q.users.length && !q.offers.length && <p className="muted">Nothing waiting.</p>}
      {q.users.map((u) => (
        <div className="queue" key={u._id}><span><b>{u.name}</b> · {u.company} · GSTIN {u.kyc.gstin || '—'} · IEC {u.kyc.iec || '—'}</span>
          <button className="btn sm" onClick={() => act(`/admin/kyc/${u._id}`, true)}>Verify</button><button className="btn ghost sm" onClick={() => act(`/admin/kyc/${u._id}`, false)}>Reject</button></div>
      ))}
      {q.offers.map((o) => (
        <div className="queue" key={o._id}><span><b>{o.product?.name}</b> · {o.sellerCompany} · {o.quantityMT} MT @ ${o.priceUsdPerMT}</span>
          <button className="btn sm" onClick={() => act(`/admin/offers/${o._id}`, true)}>Approve</button><button className="btn ghost sm" onClick={() => act(`/admin/offers/${o._id}`, false)}>Reject</button></div>
      ))}
    </div>
  );
}


function Security({ toast }) {
  const { logout } = useAuth();
  const [sessions, setSessions] = useState([]);
  const [msg, setMsg] = useState({ text: '', bad: false });
  const load = () => request('/auth/sessions').then(setSessions).catch(() => {});
  useEffect(() => { load(); }, []);
  const device = (ua = '') => (/iPhone|iPad/.test(ua) ? 'iPhone / iPad' : /Android/.test(ua) ? 'Android' : /Mac/.test(ua) ? 'Mac' : /Windows/.test(ua) ? 'Windows' : /Linux/.test(ua) ? 'Linux' : 'Unknown device')
    + (/Edg\//.test(ua) ? ' · Edge' : /Chrome\//.test(ua) ? ' · Chrome' : /Safari\//.test(ua) ? ' · Safari' : /Firefox\//.test(ua) ? ' · Firefox' : '');

  async function changePassword(e) {
    e.preventDefault();
    const f = Object.fromEntries(new FormData(e.currentTarget));
    try {
      const d = await request('/auth/password', { method: 'POST', body: f });
      setAccess(d.token); e.currentTarget.reset(); setMsg({ text: 'Password changed. Your other devices were signed out.', bad: false }); load();
    } catch (x) { setMsg({ text: x.message, bad: true }); }
  }
  const revoke = (id) => request(`/auth/sessions/${id}`, { method: 'DELETE' }).then(load);
  const everywhere = async () => { if (confirm('Sign out of every device, including this one?')) { await request('/auth/logout-all', { method: 'POST' }).catch(() => {}); await logout(); } };

  return (
    <div className="panel">
      <h2 className="h3">Security</h2>
      <form className="form" onSubmit={changePassword}>
        <label>Current password<input name="currentPassword" type="password" required autoComplete="current-password" /></label>
        <label>New password<input name="newPassword" type="password" required minLength={8} maxLength={72} autoComplete="new-password" /><small>At least 8 characters, with a letter and a number.</small></label>
        {msg.text && <p className={msg.bad ? 'err' : 'note'} role="status">{msg.text}</p>}
        <button className="btn">Change password</button>
      </form>
      <h3 className="h3" style={{ fontSize: '1.05rem', marginTop: 28 }}>Where you're signed in</h3>
      <div className="table sm">
        {sessions.map((s) => (
          <div className="tr" key={s.id}>
            <span><b>{device(s.userAgent)}</b>{s.current && <small> · this device</small>}</span>
            <span><small>{s.ip || ''}</small></span>
            <span><small>{new Date(s.createdAt).toLocaleDateString()}</small></span>
            <span>{!s.current && <button className="btn ghost sm" style={{ margin: 0 }} onClick={() => revoke(s.id)}>Sign out</button>}</span>
          </div>
        ))}
      </div>
      <button className="btn ghost sm" onClick={everywhere}>Sign out of all devices</button>
    </div>
  );
}

export default function Account() {
  const { user, setUser, ready, logout } = useAuth();
  if (!ready) return <div className="page" />;
  if (!user) return <AuthForm />;
  return (
    <div className="page">
      <Reveal><p className="tag">DASHBOARD · {user.role.toUpperCase()}</p><h1 className="h1">Hello, {user.name.split(' ')[0]}.</h1>
        <div className="row">{user.role === 'admin' && <Link className="btn lime sm" to="/admin">Open admin console</Link>}<button className="btn ghost sm" onClick={logout}>Sign out</button></div></Reveal>
      <Kyc user={user} setUser={setUser} />
      <Security />
      {(user.role === 'seller' || user.role === 'admin') && <Seller />}
      {user.role === 'admin' && <Admin />}
    </div>
  );
}
