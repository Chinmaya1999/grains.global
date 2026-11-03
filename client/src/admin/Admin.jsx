import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../lib/auth.jsx';
import { Overview, Users, Offers, Products, Leads, SiteStats, SiteContent, Settings, Activity } from './sections.jsx';
import { LogoMark } from '../components/Logo.jsx';
import './admin.css';
import '../admin/glass-motion.css';

const TABS = [
  ['overview', 'Overview', 'M3 12l9-8 9 8M5 10v10h5v-6h4v6h5V10'],
  ['users', 'Users & KYC', 'M16 11a4 4 0 10-8 0 4 4 0 008 0zM4 21c0-4 4-6 8-6s8 2 8 6'],
  ['offers', 'Offers', 'M4 7h16M4 12h16M4 17h10'],
  ['products', 'Varieties', 'M12 3c4 3 6 7 6 11a6 6 0 01-12 0c0-4 2-8 6-11z'],
  ['leads', 'Leads', 'M3 6l9 7 9-7M3 6v12h18V6'],
  ['stats', 'Site stats', 'M5 20V10M12 20V4M19 20v-7'],
  ['content', 'Site content', 'M7 3h7l5 5v13H7zM14 3v5h5M10 13h6M10 17h6'],
  ['settings', 'Settings', 'M12 15a3 3 0 100-6 3 3 0 000 6zM4 12h2M18 12h2M12 4v2M12 18v2M6.3 6.3l1.4 1.4M16.3 16.3l1.4 1.4M17.7 6.3l-1.4 1.4M7.7 16.3l-1.4 1.4'],
  ['activity', 'Activity log', 'M12 21a9 9 0 100-18 9 9 0 000 18zM12 7v5l3 2'],
];

export default function Admin() {
  const { user, ready, logout } = useAuth();
  const { tab = 'overview' } = useParams();
  const nav = useNavigate();
  const [toasts, setToasts] = useState([]);
  const id = useRef(0);
  const toast = useCallback((text, bad = false) => {
    const k = ++id.current;
    setToasts((t) => [...t, { k, text, bad }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.k !== k)), 3200);
  }, []);

  useEffect(() => { document.querySelector('.adm .body')?.scrollTo(0, 0); document.querySelector('.adm')?.scrollTo(0, 0); }, [tab]);
  const shell = (children) => <div className="adm"><div className="orb o1" /><div className="orb o2" /><div className="orb o3" />{children}</div>;
  if (!ready) return shell(null);
  if (!user || user.role !== 'admin') {
    return shell(
      <div className="gate glass"><h1>Admin access only</h1><p>{user ? 'Your account is not an administrator.' : 'Sign in with the admin account to continue.'}</p>
        <Link className="gbtn pri" to="/account?next=/admin">{user ? 'Go to your account' : 'Sign in'}</Link><Link className="gbtn" to="/">Back to site</Link></div>,
    );
  }

  const current = TABS.find(([k]) => k === tab) || TABS[0];
  const go = (k) => nav(k === 'overview' ? '/admin' : `/admin/${k}`);
  const props = { toast, go, me: user };
  const View = { overview: Overview, users: Users, offers: Offers, products: Products, leads: Leads, stats: SiteStats, content: SiteContent, settings: Settings, activity: Activity }[current[0]];

  return shell(
    <>
      <aside className="side glass">
        <Link to="/admin" className="brand"><LogoMark size={30} /><span>GRAINS<em>admin</em></span></Link>
        <nav>{TABS.map(([k, label, d]) => (
          <button key={k} className={k === current[0] ? 'on' : ''} onClick={() => go(k)}>
            <svg viewBox="0 0 24 24" aria-hidden><path d={d} /></svg>{label}
          </button>))}
        </nav>
        <div className="me"><b>{user.name}</b><small>{user.email}</small><button className="gbtn sm" onClick={async () => { await logout(); nav('/'); }}>Sign out</button></div>
      </aside>
      <section className="body">
        <header className="top">
          <div>{current[0] !== 'overview' && <button className="gbtn back" onClick={() => (window.history.state?.idx > 0 ? nav(-1) : nav('/admin'))} aria-label="Go back">← Back</button>}<small>ADMIN CONSOLE</small><h1>{current[1]}</h1></div>
        </header>
        <View key={current[0]} {...props} />
      </section>
      <div className="toasts" aria-live="polite">{toasts.map((t) => <div key={t.k} className={`toast glass ${t.bad ? 'bad' : ''}`}>{t.text}</div>)}</div>
    </>,
  );
}
