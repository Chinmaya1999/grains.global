import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../lib/auth.jsx';
import { Icon, Photo } from '../components/Art.jsx';
import { LogoMark } from '../components/Logo.jsx';

const ROLES = [
  ['buyer', 'Buyer', 'cart', 'Source verified agri commodities from trusted origins with transparent pricing.'],
  ['seller', 'Seller', 'store', 'List offers and sell to verified global buyers.'],
  ['partner', 'Partner', 'handshake', 'Own the buyer relationship in your country and share the margin.'],
  ['agropreneur', 'AgroPreneur', 'sprout', 'Aggregate supply from farmers, with free training and funding.'],
  ['bank', 'Lender', 'bank', 'Quote finance on real, verified trades.'],
];
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const LEVELS = ['Too weak', 'Weak', 'Okay', 'Good', 'Strong'];

function passwordState(pw) {
  const rules = [['8 or more characters', pw.length >= 8], ['A letter', /[A-Za-z]/.test(pw)], ['A number', /\d/.test(pw)]];
  const met = rules.every(([, ok]) => ok);
  let score = rules.filter(([, ok]) => ok).length ? 1 : 0;
  if (met) { score = 2; if (pw.length >= 12) score++; if ((/[A-Z]/.test(pw) && /[a-z]/.test(pw)) || /[^A-Za-z0-9]/.test(pw)) score++; }
  return { rules, met, score: pw ? score : 0 };
}

function Field({ id, label, error, hint, children }) {
  return (
    <div className={`fld ${error ? 'bad' : ''}`}>
      <label htmlFor={id}>{label}</label>
      {children}
      {error ? <p className="fld-msg err" id={`${id}-msg`} role="alert">{error}</p> : hint ? <p className="fld-msg" id={`${id}-msg`}>{hint}</p> : null}
    </div>
  );
}

export default function Auth() {
  const { login, register } = useAuth();
  const nav = useNavigate();
  const [params, setParams] = useSearchParams();
  const mode = params.get('mode') === 'register' ? 'register' : 'login';
  const next = params.get('next');
  const safeNext = next && next.startsWith('/') && !next.startsWith('//') ? next : null; // never redirect off-site

  const [role, setRole] = useState(ROLES.some(([k]) => k === params.get('role')) ? params.get('role') : 'buyer');
  const [v, setV] = useState({ name: '', company: '', email: '', password: '' });
  const [touched, setTouched] = useState({});
  const [show, setShow] = useState(false);
  const [caps, setCaps] = useState(false);
  const [busy, setBusy] = useState(false);
  const [banner, setBanner] = useState('');
  const [emailTaken, setEmailTaken] = useState(false);
  const first = useRef(null);
  const pw = passwordState(v.password);

  useEffect(() => { setBanner(''); setEmailTaken(false); setTouched({}); first.current?.focus(); }, [mode]);

  const errors = {
    name: mode === 'register' && !v.name.trim() ? 'Tell us your name.' : '',
    email: !v.email.trim() ? 'Enter your email.' : !EMAIL.test(v.email.trim()) ? 'That doesn’t look like an email address.' : emailTaken ? 'That email already has an account.' : '',
    password: !v.password ? 'Enter your password.' : mode === 'register' && !pw.met ? 'Use at least 8 characters with a letter and a number.' : '',
  };
  const show_ = (k) => touched[k] && errors[k];
  const set = (k) => (e) => { setV({ ...v, [k]: e.target.value }); if (k === 'email') setEmailTaken(false); };
  const blur = (k) => () => setTouched((t) => ({ ...t, [k]: true }));
  const switchMode = (m) => { const p = new URLSearchParams(params); p.set('mode', m); setParams(p, { replace: true }); };

  async function submit(e) {
    e.preventDefault();
    setTouched({ name: true, email: true, password: true });
    const bad = ['name', 'email', 'password'].find((k) => errors[k]);
    if (bad) { document.getElementById(`f-${bad}`)?.focus(); return; }
    setBusy(true); setBanner('');
    try {
      if (mode === 'login') await login({ email: v.email.trim(), password: v.password });
      else await register({ name: v.name.trim(), company: v.company.trim(), email: v.email.trim(), password: v.password, role });
      nav(safeNext || '/account', { replace: true });
    } catch (x) {
      setBusy(false);
      if (x.status === 409) { setEmailTaken(true); setTouched((t) => ({ ...t, email: true })); document.getElementById('f-email')?.focus(); }
      else setBanner(x.message || 'Something went wrong. Please try again.');
    }
  }

  const eye = (
    <button type="button" className="eye" onClick={() => setShow(!show)} aria-label={show ? 'Hide password' : 'Show password'} aria-pressed={show}>
      <Icon n={show ? 'eyeoff' : 'eye'} size={19} />
    </button>
  );

  return (
    <section className="auth2">
      <aside className="auth-art">
        <Photo name="login-bg" scene="paddy" alt="" className="auth-bg2" />
        <div className="auth-art-in">
          <Link to="/" className="auth-brand"><LogoMark size={34} /><span><b>AGRI</b><i>global</i></span></Link>
          <div>
            <h2>From village fields to harbour, on one trusted platform.</h2>
            <ul>
              <li><Icon n="shield" size={20} />Every buyer and seller is verified before they trade</li>
              <li><Icon n="bank" size={20} />Compare finance quotes from banks and NBFCs</li>
              <li><Icon n="globe" size={20} />A global agri trade corridor, in one place</li>
            </ul>
            <p className="proof">Accredited by DPIIT and the ICC and SGCCI chambers of commerce</p>
          </div>
        </div>
      </aside>

      <div className="auth-panel">
        <div className={`auth-box ${mode === 'register' ? 'reg' : ''}`}>
          <div className="seg" role="tablist" aria-label="Sign in or create an account">
            <button role="tab" aria-selected={mode === 'login'} className={mode === 'login' ? 'on' : ''} onClick={() => switchMode('login')}>Sign in</button>
            <button role="tab" aria-selected={mode === 'register'} className={mode === 'register' ? 'on' : ''} onClick={() => switchMode('register')}>Create account</button>
          </div>

          <h1>{mode === 'login' ? 'Welcome back' : 'Join the harvest'}</h1>
          <p className="auth-sub">{mode === 'login' ? 'Sign in to manage your offers, verification and requests.' : 'Free to join. Trade, finance and grow on the AIM corridor.'}</p>

          <form onSubmit={submit} noValidate>
            {banner && <div className="banner" role="alert"><Icon n="alert" size={18} />{banner}</div>}

            {mode === 'register' && (
              <fieldset className="roles">
                <legend>I am a…</legend>
                <div className="pills">
                  {ROLES.map(([k, label, ic]) => (
                    <label key={k} className={role === k ? 'on' : ''}>
                      <input type="radio" name="role" value={k} checked={role === k} onChange={() => setRole(k)} />
                      <Icon n={ic} size={18} /><span>{label}</span>
                    </label>
                  ))}
                </div>
                <p className="role-desc" aria-live="polite">{ROLES.find(([k]) => k === role)[3]}</p>
              </fieldset>
            )}

            {mode === 'register' && (
              <div className="two-col">
                <Field id="f-name" label="Your name" error={show_('name')}>
                  <input id="f-name" ref={first} value={v.name} onChange={set('name')} onBlur={blur('name')} autoComplete="name" maxLength={100} aria-invalid={!!show_('name')} aria-describedby="f-name-msg" />
                </Field>
                <Field id="f-company" label="Company (optional)">
                  <input id="f-company" value={v.company} onChange={set('company')} autoComplete="organization" maxLength={150} />
                </Field>
              </div>
            )}

            <div className={mode === 'register' ? 'two-col' : 'stack'}>
              <Field id="f-email" label="Email" error={show_('email')}>
                <input id="f-email" ref={mode === 'login' ? first : null} type="email" inputMode="email" value={v.email} onChange={set('email')} onBlur={blur('email')} autoComplete="email" autoCapitalize="none" spellCheck="false" maxLength={254} aria-invalid={!!show_('email')} aria-describedby="f-email-msg" />
                {emailTaken && <p className="fld-msg"><button type="button" className="linkbtn" onClick={() => switchMode('login')}>Sign in instead →</button></p>}
              </Field>

              <Field id="f-password" label="Password" error={show_('password')}>
                <div className="pw">
                  <input id="f-password" type={show ? 'text' : 'password'} value={v.password} onChange={set('password')} onBlur={blur('password')} onKeyUp={(e) => setCaps(e.getModifierState?.('CapsLock') || false)}
                    autoComplete={mode === 'login' ? 'current-password' : 'new-password'} maxLength={72} aria-invalid={!!show_('password')} aria-describedby="f-password-msg" />
                  {eye}
                </div>
                {caps && <p className="fld-msg warn">Caps Lock is on.</p>}
                {mode === 'login' && <p className="fld-msg forgot">Forgot your password? <Link to="/contact" className="link">Contact us</Link> and we’ll reset it.</p>}
              </Field>
            </div>

            {mode === 'register' && (
              <div className={`pwcheck ${touched.password && !pw.met ? 'bad' : ''}`} aria-live="polite">
                <div className="meter" data-level={pw.score}><i /><i /><i /><i /></div>
                <span className="lvl">{v.password ? LEVELS[pw.score] : 'Choose a password'}</span>
                <ul>{pw.rules.map(([t, ok]) => <li key={t} className={ok ? 'ok' : ''}><Icon n={ok ? 'check' : 'dot'} size={14} />{t}</li>)}</ul>
              </div>
            )}

            <button className="authbtn" disabled={busy}>
              {busy ? <><span className="spin" aria-hidden />{mode === 'login' ? 'Signing in…' : 'Creating your account…'}</> : <>{mode === 'login' ? 'Sign in' : 'Create account'}<Icon n="arrow" size={18} /></>}
            </button>

            {mode === 'register' && <p className="legal">By creating an account you agree to our <Link to="/terms" className="link">Terms</Link> and <Link to="/privacy" className="link">Privacy policy</Link>.</p>}
          </form>

          <p className="swap">{mode === 'login' ? <>New to Agri Global? <button className="linkbtn" onClick={() => switchMode('register')}>Create an account</button></> : <>Already have an account? <button className="linkbtn" onClick={() => switchMode('login')}>Sign in</button></>}</p>
        </div>
      </div>
    </section>
  );
}
