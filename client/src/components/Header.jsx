import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../lib/auth.jsx';
import { Icon } from './Art.jsx';
import { Logo } from './Logo.jsx';
import Search from './Search.jsx';
import { SETTINGS } from '../lib/content.js';

// [label, items, columns, feature]; item = [title, path, icon, description]
// feature = { theme, icon, title, text, cta, to }: a coloured card beside the list, with its own accent colour.
const MENU = [
  ['Marketplace', [
    ['Browse offers', '/marketplace', 'tag', 'Live rice offers from verified sellers'],
    ['Rice catalogue', '/marketplace', 'leaf', 'Every variety with specs and pricing'],
    ['Post a requirement', '/marketplace#rfq', 'doc', 'Send an RFQ and compare quotes'],
    ['Trade toolkit', '/tools', 'calc', 'Landed cost, shrinkage, margins and more'],
  ]],
  ['Trade Finance', [
    ['Finance overview', '/finance', 'bank', 'LC, BG and invoice financing, explained'],
    ['Finance for buyers', '/finance#buyers', 'cart', 'Pick the right instrument for imports'],
    ['Finance for sellers', '/finance#sellers', 'store', 'Pre-shipment, LC and invoice finance'],
    ['LC cost calculator', '/tools?tool=lc', 'calc', 'Fees and interest on a letter of credit'],
    ['Credit readiness score', '/tools?tool=credit', 'chart', 'See how bank-ready your business is'],
    ['Banks & NBFCs', '/lenders', 'building', 'Deal-level intelligence for lenders'],
  ], 0, { theme: 'finance', icon: 'bank', title: 'Compare multi-bank quotes', text: 'One request, offers from banks and NBFCs for LC, BG, SBLC and invoice finance.', cta: 'Get finance quotes', to: '/finance' }],
  ['For Buyers', [
    ['Benefits for buyers', '/for-buyers', 'cart', 'Verified sellers, transparent pricing'],
    ['Why choose us', '/for-buyers#why', 'shield', 'Trusted, financed, risk-checked sourcing'],
    ['Join as a buyer', '/join?role=buyer', 'user', 'Create your buyer profile'],
    ['Landed-cost calculator', '/tools?tool=landed', 'calc', 'What a tonne costs at your door'],
  ], 0, { theme: 'buyers', icon: 'cart', title: 'Source verified rice', text: 'Post once and compare offers from verified sellers, with transparent pricing.', cta: 'Post a requirement', to: '/marketplace#rfq' }],
  ['For Sellers', [
    ['Benefits for sellers', '/for-sellers', 'store', 'Reach serious buyers worldwide'],
    ['List an offer', '/account', 'tag', 'Post offers once you are verified'],
    ['Join as a seller', '/join?role=seller', 'user', 'Create your seller profile'],
    ['Export pricing calculator', '/tools?tool=export', 'calc', 'Build FOB and CIF prices from cost'],
  ], 0, { theme: 'sellers', icon: 'store', title: 'Reach global buyers', text: 'List offers, get matched to verified buyers and access pre-shipment finance.', cta: 'Start selling', to: '/join?role=seller' }],
  ['Partners', [
    ['Partnership program', '/partner', 'handshake', 'Own the buyer relationship'],
    ['Profit sharing', '/partner#profit', 'chart', 'Earn up to 40.5% of the margin'],
    ['Apply as a partner', '/join?role=partner', 'user', 'Start in your own country'],
  ]],
  ['AgroPreneurs', [
    ['The program', '/agropreneur', 'sprout', 'Free 2-month training and funding'],
    ['Livelihood generation', '/livelihood', 'heart', 'How we create rural livelihoods'],
    ['Join the network', '/join?role=agropreneur', 'user', 'Register as an AgroPreneur'],
  ]],
  ['Platform', [
    ['Overview', '/platform', 'spark', 'Trade and finance on one platform'],
    ['Digital Trade Corridor', '/corridor', 'compass', 'Africa · India · Middle East'],
    ['Trust framework', '/trust', 'lock', 'Trust engineered into every stage'],
    ['Fraud prevention', '/fraud-prevention', 'shield', 'Layered checks, safer trades'],
    ['Technology', '/technology', 'cpu', 'AI, APIs and security'],
    ['Calculators & scorecards', '/tools', 'calc', '13 free trade and finance tools'],
    ['AI prompt library', '/prompts', 'doc', 'Ready-made templates for your AI'],
  ], 2],
  ['Company', [
    ['About us', '/about', 'building', 'Who we are and what we offer'],
    ['Why us', '/why-us', 'star', 'Why the world trades with us'],
    ['Our team', '/team', 'people', 'Founders, leaders and partners'],
    ['Manifesto', '/manifesto', 'book', 'Trusted trades, engineered trust'],
    ['Sustainability', '/sustainability', 'leaf', 'Our impact goals and SDGs'],
    ['Contact', '/contact', 'mail', 'Offices and a message form'],
  ], 2],
];

export default function Header() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();
  const [group, setGroup] = useState(null);
  const [searching, setSearching] = useState(false);
  const initial = (user?.name || '').trim().charAt(0).toUpperCase();
  const [last, setLast] = useState(pathname);
  if (last !== pathname) { setLast(pathname); setOpen(false); setGroup(null); setSearching(false); }
  // "/" or Ctrl/⌘+K opens search from anywhere (unless you are typing in a field)
  useEffect(() => {
    const onKey = (e) => {
      const typing = /^(INPUT|TEXTAREA|SELECT)$/.test(document.activeElement?.tagName) || document.activeElement?.isContentEditable;
      if ((e.key === '/' && !typing && !e.metaKey && !e.ctrlKey) || ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k')) { e.preventDefault(); setSearching(true); setOpen(false); }
    };
    addEventListener('keydown', onKey);
    return () => removeEventListener('keydown', onKey);
  }, []);
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  return (
    <>
    {SETTINGS.announcement && <div className="annc" role="status">{SETTINGS.announcement}</div>}
    <header className="hdr">
      <div className="hdr-in">
        <Logo to={user ? (user.role === 'admin' ? '/admin' : '/dashboard') : '/'} />
        <nav className={`menu ${open ? 'open' : ''}`} aria-label="Main">
          {MENU.map(([label, items, cols, feat], idx) => {
            const here = items.some((it) => it[1].split(/[?#]/)[0] === pathname && pathname !== '/account'); // /account is shared by sign-in links, so it doesn't mark one section
            return (
              <div className={`mi ${group === label ? 'open' : ''} ${idx >= MENU.length - 3 ? 'edge' : ''} ${feat ? feat.theme : ''}`} key={label}>
                <button className={`mb ${here ? 'cur' : ''}`} aria-haspopup="true" aria-expanded={group === label} onClick={() => setGroup(group === label ? null : label)}>{label}<Icon n="chev" size={14} /></button>
                <div className={`dd ${cols === 2 ? 'two' : ''} ${feat ? 'feat' : ''}`}>
                  {feat && (
                    <Link to={feat.to} className="dfeat">
                      <span className="dfi"><Icon n={feat.icon} size={26} /></span>
                      <b>{feat.title}</b><p>{feat.text}</p>
                      <span className="dfc">{feat.cta}<Icon n="arrow" size={15} /></span>
                    </Link>
                  )}
                  <div className="dlist">
                    {items.map(([t, to, ic, d]) => (
                      <NavLink key={t} to={to}>
                        <span className="di"><Icon n={ic} size={20} /></span>
                        <span className="dt"><b>{t}</b><small>{d}</small></span>
                      </NavLink>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
          {user?.role === 'admin' && <Link className="m-only" to="/admin">Admin console</Link>}
          <Link className="m-only" to="/account">{user ? 'My account' : 'Log In'}</Link>
        </nav>
        <div className="hdr-act">
          <button className="ib" aria-label="Search" aria-haspopup="dialog" onClick={() => { setSearching(true); setOpen(false); }}><Icon n="search" size={19} /></button>
          {user?.role === 'admin' && <Link to="/admin" className="adm-link" aria-label="Open the admin console"><Icon n="shield" size={16} /><span>Console</span></Link>}
          <Link to="/account" className={`login ${user ? 'me' : ''}`} aria-label={user ? `My account (${user.name})` : 'Log in'}>
            {user ? <><span className="av" aria-hidden>{initial}</span><span className="nm">{user.name.split(' ')[0]}</span></> : 'Log In'}
          </Link>
          <Link to="/account" className="ib acct" aria-label={user ? `My account (${user.name})` : 'Log in'}>
            {user ? <span className="av" aria-hidden>{initial}</span> : <Icon n="user" size={19} />}
          </Link>
          {!user && <Link to="/account?mode=register" className="cta">Get Started<Icon n="arrow" size={16} /></Link>}
          <button className="ib burger" onClick={() => setOpen(!open)} aria-label="Menu" aria-expanded={open}><Icon n={open ? 'close' : 'menu'} /></button>
        </div>
      </div>
    </header>
    {searching && <Search onClose={() => setSearching(false)} />}
    </>
  );
}
