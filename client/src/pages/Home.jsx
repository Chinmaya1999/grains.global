import { lazy, Suspense, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Reveal, Counter } from '../components/bits.jsx';
import { Icon, Photo } from '../components/Art.jsx';

const SatelliteMap = lazy(() => import('../components/SatelliteMap.jsx'));
import { getStats, getProducts } from '../api.js';
import { STEPS, ROLES, PROMPTS, FALLBACK_VARIETIES } from '../lib/data.js';
import { CALCS, SCORES } from '../lib/tools.js';
import { inGroup, priceLabel } from '../lib/format.js';
import { productImage } from '../lib/content.js';

// Each tab changes what the bar asks and where the button goes; nothing navigates until you press the button.
const TABS = [
  ['Buy (RFQ)', 'cart', 'Search commodity, variety (e.g., 1121 Basmati)', (q) => (q ? `/marketplace?q=${encodeURIComponent(q)}` : '/marketplace'), 'Search the marketplace'],
  ['Sell (Offer)', 'tag', 'What do you want to sell? (e.g., 1121 Basmati)', () => '/account?mode=register&role=seller', 'Start selling'],
  ['Find Finance', 'bank', 'Which instrument? (LC, BG, invoice finance)', () => '/finance', 'See finance options'],
  ['Find a Partner', 'people', 'Which country do you trade in?', () => '/partner', 'See the partner program'],
];
const FAMILIES = ['Basmati', 'Non-Basmati', 'Sella'];

function Finder() {
  const nav = useNavigate();
  const [tab, setTab] = useState(0);
  const [q, setQ] = useState('');
  const [, , placeholder, route, label] = TABS[tab];
  const go = (e) => { e.preventDefault(); nav(route(q.trim())); };
  return (
    <form className="finder" onSubmit={go} role="search">
      <div className="ftabs" role="tablist" aria-label="What would you like to do?">
        {TABS.map(([l, ic], i) => (
          <button type="button" key={l} role="tab" aria-selected={i === tab} className={i === tab ? 'on' : ''} onClick={() => setTab(i)}><Icon n={ic} size={20} />{l}</button>
        ))}
      </div>
      <div className="fsearch">
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={placeholder} aria-label={placeholder} />
        <button aria-label={label} title={label}><Icon n="search" size={22} /></button>
      </div>
    </form>
  );
}

export default function Home() {
  const [stats, setStats] = useState([]);
  const [items, setItems] = useState(FALLBACK_VARIETIES);
  const [fam, setFam] = useState('Basmati');
  useEffect(() => { getStats().then(setStats); getProducts().then((p) => p.length && setItems(p)); }, []);
  const stat = (k, d) => stats.find((s) => s.key === k) || d;
  const corridor = stat('corridor', { value: 31 }), women = stat('women', { value: 1, suffix: 'M' });
  const count = (f) => items.filter((p) => inGroup(p, f)).length;
  const shown = items.filter((p) => inGroup(p, fam)).slice(0, 4);

  const strip = [
    ['leaf', items.length, '', 'Rice varieties'], ['globe', corridor.value, '', 'AIM countries'], ['people', ROLES.length, '', 'Stakeholder types'],
    ['calc', CALCS.length + SCORES.length, '', 'Free tools'], ['spark', PROMPTS.length, '', 'AI prompt templates'], ['sprout', women.value, women.suffix || 'M', 'Women AgroPreneurs (target)'],
  ];
  const audience = [
    ['For Buyers', 'cart', 'Source verified Indian rice with transparent pricing & finance.', '/join?role=buyer', 'port', 'port'],
    ['For Sellers', 'store', 'Access global buyers and get pre/post-shipment finance.', '/join?role=seller', 'sellers', 'rice'],
    ['For Global Partners', 'handshake', 'Own the buyer relationship and earn 25–40.5% margin.', '/partner', 'partners', 'people'],
    ['For AgroPreneurs', 'sprout', 'Aggregate from farmers, get training, finance and market linkage.', '/join?role=agropreneur', 'agropreneur', 'people'],
  ];

  return (
    <>
      <section className="hero2">
        <Photo name="hero" scene="hero" alt="" className="hero-bg" />
        <div className="hero-map">
          <Suspense fallback={null}><SatelliteMap /></Suspense>
          {/* on phones the map sits in the middle of the page, so the AIM card lives on it (the desktop card is hidden there) */}
          <div className="aim aim-m"><Icon n="globe" size={34} /><div><b>AIM Corridor</b><span>India ↔ Africa ↔ Middle East</span><small>{corridor.value} Countries • Growing</small></div></div>
        </div>
        <Photo name="hero-port" scene="port" alt="" className="hero-port" />
        <div className="hero-in">
          <div className="hero-copy2">
            <p className="kick">The AI-Powered Global Agri Trade &amp; Finance Platform</p>
            <h1>From Indian Farms to Global Markets</h1>
            <p className="sub">Trade, Finance, Source and Grow — all in one platform for agricultural commodities, starting with Indian Rice.</p>
            <div className="cta-row">
              <Link to="/marketplace" className="hbtn solid">Explore Marketplace<Icon n="arrow" size={18} /></Link>
              <Link to="/join?role=partner" className="hbtn light">Join as Partner</Link>
            </div>
            <ul className="checks"><li><Icon n="check" size={14} />Verified Buyers &amp; Sellers</li><li><Icon n="check" size={14} />Trade Finance (LC, BG, SBLC)</li><li><Icon n="check" size={14} />End-to-End Trade Support</li></ul>
          </div>
          <div className="hero-woman"><Photo name="hero-woman" scene="people" tone="woman" alt="Smiling woman farmer holding freshly harvested rice" /></div>
        </div>
        <div className="aim"><Icon n="globe" size={34} /><div><b>AIM Corridor</b><span>India ↔ Africa ↔ Middle East</span><small>{corridor.value} Countries • Growing</small></div></div>
      </section>

      <Finder />

      <section className="strip" aria-label="Platform at a glance">
        {strip.map(([ic, n, suf, label]) => (
          <div key={label}><Icon n={ic} size={38} /><span><b><Counter to={n} suffix={suf} /></b><small>{label}</small></span></div>
        ))}
      </section>

      <section className="feat">
        <div className="fv">
          <header>
            <h2>Featured Rice Varieties</h2>
            <div className="ptabs">
              {FAMILIES.map((f) => <button key={f} className={fam === f ? 'on' : ''} onClick={() => setFam(f)}>{f} ({count(f)})</button>)}
              <button className={fam === 'All' ? 'on' : ''} onClick={() => setFam('All')}>All SKUs ({items.length})</button>
            </div>
            <Link to="/marketplace" className="va">View All Products <Icon n="arrow" size={14} /></Link>
          </header>
          <div className="vgrid">
            {shown.map((p, i) => (
              <Link to={`/rice/${p.slug}`} className="vcard" key={p.slug}>
                <div className="vph">{i === 0 && fam === 'Basmati' && <em>Bestseller</em>}<Photo name={productImage(p)} scene="rice" alt={p.name} /></div>
                <h3>{p.name}</h3><small>HSN: {p.hsn}</small>
                <p>{p.avgPriceUsd ? <>Avg. Price: <b>{priceLabel(p)}</b></> : <b>Price on request</b>}<span className="go"><Icon n="arrow" size={16} /></span></p>
              </Link>
            ))}
          </div>
        </div>
        <aside className="tf">
          <Photo name="trade-finance" scene="port" alt="" className="tf-bg" />
          <div className="tf-in">
            <h2>Trade + Finance<br />in One Place</h2>
            <ul>
              {[['tag', 'Post / Browse Offers'], ['bank', 'Get Trade Finance (LC, BG, SBLC)'], ['handshake', 'Work with Local Global Partners'], ['check', 'End-to-End Trade Execution']].map(([ic, t]) => <li key={t}><span><Icon n={ic} size={15} /></span>{t}</li>)}
            </ul>
          </div>
        </aside>
      </section>

      <section className="aud">
        {audience.map(([t, ic, d, to, img, scene]) => (
          <Link to={to} className="acard" key={t}>
            <div><Icon n={ic} size={30} /><h3>{t}</h3><p>{d}</p><span>Explore <Icon n="arrow" size={14} /></span></div>
            <Photo name={img} scene={scene} tone={img === 'agropreneur' ? 'woman' : undefined} alt="" className="aph" />
          </Link>
        ))}
      </section>

      <section className="flow2">
        <Reveal><h2>How a deal flows</h2><p className="muted">Seven handoffs, one audit trail — from village to harbour.</p></Reveal>
        <ol>{STEPS.map(([t, d], i) => <li key={t}><b>{i + 1}</b><h3>{t}</h3><p>{d}</p></li>)}</ol>
      </section>

      <section className="home-trust">
        <Reveal><p className="itag">ENGINEERED TRUST</p><h2>Trust, engineered into every stage of the trade.</h2><p className="muted">From counterparty risk to the entire trade lifecycle, risk is assessed, verified and monitored before, during and after every trade.</p></Reveal>
        <div className="trust3">
          {[['Counterparty intelligence', 'Know who you’re trading with', 'Multi-layer KYC and KYB, trade behaviour and jurisdictional risk checks mean you never trade blind.'], ['Trade lifecycle security', 'Protection from RFQ to settlement', 'Structured RFQs, document verification, shipment tracking and dispute-ready audit trails.'], ['Integrated trade & finance', 'Finance that understands the trade', 'Banks see verified trades, validated documents and real transaction data, so approvals are faster.']].map(([k, t, d]) => (
            <Reveal key={k} className="t3"><small>{k}</small><h3>{t}</h3><p>{d}</p></Reveal>
          ))}
        </div>
        <div className="scores2">
          <Link to="/tools?tool=trust" className="sc"><Icon n="check" size={26} /><div><h3>Trust Score</h3><p>A clear, explainable view of who you’re trading with.</p></div><span>Assess your Trust Score →</span></Link>
          <Link to="/tools?tool=credit" className="sc"><Icon n="bank" size={26} /><div><h3>Credit Score</h3><p>A transparent view of trade-level financial readiness.</p></div><span>Assess your Credit Score →</span></Link>
        </div>
        <p className="accred">Accredited by <b>DPIIT</b>, <b>MCA</b> and India’s oldest chambers of commerce: <b>ICC</b> and <b>SGCCI</b>.</p>
      </section>

      <section className="mission">
        <Icon n="sprout" size={44} />
        <h2>Our Mission</h2>
        <p>Empower 1 Million Women AgroPreneurs <i>•</i> Build a Trusted AIM Trade Corridor <i>•</i> Make Agri Trade Simple, Inclusive &amp; Transparent.</p>
        <Link to="/join?role=agropreneur" className="hbtn light">Learn About Our Impact<Icon n="arrow" size={16} /></Link>
      </section>
    </>
  );
}
