import { useEffect } from 'react';
import { Routes, Route, Link, NavLink, useLocation } from 'react-router-dom';
import { AuthProvider } from './lib/auth.jsx';
import Header from './components/Header.jsx';
import { Logo } from './components/Logo.jsx';
import { Icon } from './components/Art.jsx';
import Home from './pages/Home.jsx';
import Marketplace from './pages/Marketplace.jsx';
import Tools from './pages/Tools.jsx';
import Partner from './pages/Partner.jsx';
import Prompts from './pages/Prompts.jsx';
import Join from './pages/Join.jsx';
import Account from './pages/Account.jsx';
import Admin from './admin/Admin.jsx';
import ProductDetail from './pages/ProductDetail.jsx';
import { About, WhyUs, Team, Manifesto, Sustainability, Livelihood, Contact, Privacy, Terms, Documents } from './pages/Company.jsx';
import { Platform, Corridor, Trust, Fraud, Technology, ForBuyers, ForSellers, Agropreneur, Finance, Lenders } from './pages/Platform.jsx';
import { COMPANY, SETTINGS } from './lib/content.js';
import { ContentProvider } from './lib/contentStore.jsx';

const TABS = [['/', 'Home', 'home'], ['/marketplace', 'Market', 'store'], ['/tools', 'Tools', 'calc'], ['/partner', 'Partners', 'handshake'], ['/account', 'Account', 'user']];

function TabBar() {
  return (
    <nav className="tabbar" aria-label="Quick navigation">
      {TABS.map(([to, label, ic]) => <NavLink key={to} to={to} end={to === '/'}><Icon n={ic} size={22} /><span>{label}</span></NavLink>)}
    </nav>
  );
}

function Shell() {
  const { pathname } = useLocation();
  const isAdmin = pathname.startsWith('/admin');
  const { hash } = useLocation();
  useEffect(() => {
    if (hash) {
      const t = setTimeout(() => document.getElementById(hash.slice(1))?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 60);
      return () => clearTimeout(t);
    }
    scrollTo(0, 0);
  }, [pathname, hash]);
  if (isAdmin) return <Routes><Route path="/admin/:tab?" element={<Admin />} /></Routes>;

  return (
    <>
      <Header />
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/marketplace" element={<Marketplace />} />
          <Route path="/tools" element={<Tools />} />
          <Route path="/partner" element={<Partner />} />
          <Route path="/prompts" element={<Prompts />} />
          <Route path="/join" element={<Join />} />
          <Route path="/account" element={<Account />} />
          <Route path="/rice/:slug" element={<ProductDetail />} />
          <Route path="/about" element={<About />} /><Route path="/why-us" element={<WhyUs />} /><Route path="/team" element={<Team />} />
          <Route path="/manifesto" element={<Manifesto />} /><Route path="/sustainability" element={<Sustainability />} /><Route path="/livelihood" element={<Livelihood />} />
          <Route path="/contact" element={<Contact />} /><Route path="/privacy" element={<Privacy />} /><Route path="/terms" element={<Terms />} /><Route path="/documents" element={<Documents />} />
          <Route path="/platform" element={<Platform />} /><Route path="/corridor" element={<Corridor />} /><Route path="/trust" element={<Trust />} />
          <Route path="/fraud-prevention" element={<Fraud />} /><Route path="/technology" element={<Technology />} />
          <Route path="/for-buyers" element={<ForBuyers />} /><Route path="/for-sellers" element={<ForSellers />} /><Route path="/agropreneur" element={<Agropreneur />} />
          <Route path="/finance" element={<Finance />} /><Route path="/lenders" element={<Lenders />} />
          <Route path="*" element={<div className="page"><h1 className="h1">Off the map.</h1><Link className="btn" to="/">Back home</Link></div>} />
        </Routes>
        <footer className="foot">
          <div className="foot-in">
            <div><Logo /><p>{COMPANY.legalName}<br />Registered office: {COMPANY.registered}</p><p>Corporate office: {COMPANY.corporate}</p></div>
            <div><b>Platform</b><Link to="/marketplace">Marketplace</Link><Link to="/finance">Trade finance</Link><Link to="/tools">Tools</Link><Link to="/prompts">AI prompts</Link><Link to="/corridor">Digital Trade Corridor</Link><Link to="/trust">Trust framework</Link></div>
            <div><b>Join</b><Link to="/for-buyers">Buyers</Link><Link to="/for-sellers">Sellers</Link><Link to="/partner">Partners</Link><Link to="/agropreneur">AgroPreneurs</Link><Link to="/lenders">Banks &amp; NBFCs</Link></div>
            <div><b>Company</b><Link to="/about">About us</Link><Link to="/team">Our team</Link><Link to="/sustainability">Sustainability</Link><Link to="/contact">Contact</Link><Link to="/privacy">Privacy policy</Link><Link to="/terms">Terms &amp; conditions</Link><Link to="/documents">Documents</Link></div>
          </div>
          <div className="foot-ids">
            {COMPANY.ids.map(([k, v]) => <span key={k}>{k}: {v}</span>)}
          </div>
          <div className="foot-bar"><span>© 2026 Grains Global · {COMPANY.legalName}</span><span className="socials">
            {SETTINGS.contactEmail && <a href={`mailto:${SETTINGS.contactEmail}`}>{SETTINGS.contactEmail}</a>}
            {SETTINGS.whatsapp && <a href={`https://wa.me/${SETTINGS.whatsapp.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer">WhatsApp</a>}
            {COMPANY.social.map(([n, u]) => <a key={n} href={u} target="_blank" rel="noopener noreferrer">{n}</a>)}</span></div>
        </footer>
      </main>
      <TabBar />
    </>
  );
}

export default function App() {
  return <AuthProvider><ContentProvider><Shell /></ContentProvider></AuthProvider>;
}
