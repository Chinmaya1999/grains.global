import { Hero, Sec, Cards, Checks, Steps, FAQ, Table, Band } from '../components/Blocks.jsx';
import { Reveal } from '../components/bits.jsx';
import { PLATFORM, DTC, CORRIDOR, TRUST, FRAUD, TECH, BUYER, SELLER, AGRO, FINANCE, LENDERS } from '../lib/content.js';

const unique = [...new Set([...CORRIDOR.middleEast, ...CORRIDOR.africa])];

export function Platform() {
  return (
    <>
      <Hero tag="PLATFORM" title="Agri trade & trade finance, all in one transparent, trusted digital AI platform." lede="One digital ecosystem that unites traders, banks and buyers." actions={[['Join as a buyer', '/join?role=buyer'], ['Join as a seller', '/join?role=seller', true]]} />
      <Sec tag="STREAMLINE YOUR PROCESSES" title="Built for the whole trade."><Cards items={PLATFORM.features} /></Sec>
      <Sec alt tag="EXPAND YOUR HORIZONS" title="Trade & finance; one platform, infinite opportunities."><Cards items={PLATFORM.horizons} /></Sec>
      <Sec tag="FAQ" title="Platform questions."><FAQ items={PLATFORM.faq} /></Sec>
      <Band title="Technology that powers global trade, simply, securely, smartly." actions={[['Technology', '/technology'], ['Digital trade corridor', '/corridor', true]]} />
    </>
  );
}

export function Corridor() {
  return (
    <>
      <Hero tag="DIGITAL TRADE CORRIDOR" title="The Digital Trade Corridor for trusted global trade." lede="Where trust is engineered, risk is measured, and global trade becomes finance-ready." actions={[['Sign up for trade', '/join?role=buyer'], ['Sign up for finance', '/join?role=bank', true]]} />
      <Sec tag="THE PROBLEM" title="Cross-border trade challenges."><Cards items={DTC.frictions} cols={4} /></Sec>
      <Sec alt tag="THE SOLUTION" title="Four pillars of one corridor.">
        <div className="icards" style={{ '--cols': 4 }}>{DTC.pillars.map(([t, items]) => <Reveal key={t} className="icard"><h3>{t}</h3><Checks items={items} /></Reveal>)}</div>
      </Sec>
      <Sec tag="THE TRUST ARCHITECTURE" title="Six ideas, one system."><Cards items={DTC.terms} /></Sec>
      <Sec alt tag="AFRICA · INDIA · MIDDLE EAST" title="One trade corridor." lede={`The AIM corridor lists ${unique.length} countries in the Middle East and Africa, plus India.`}>
        <div className="two">
          <Reveal className="panelx"><h3>Middle East ({CORRIDOR.middleEast.length})</h3><p className="tags">{CORRIDOR.middleEast.map((c) => <span key={c}>{c}</span>)}</p></Reveal>
          <Reveal className="panelx"><h3>Africa ({CORRIDOR.africa.length})</h3><p className="tags">{CORRIDOR.africa.map((c) => <span key={c}>{c}</span>)}</p></Reveal>
        </div>
        <p className="note">Egypt appears in both regions.</p>
      </Sec>
      <Band title="Trade doesn’t need more intermediaries. It needs a digital corridor." actions={[['Explore the marketplace', '/marketplace'], ['Trust framework', '/trust', true]]} />
    </>
  );
}

export function Trust() {
  return (
    <>
      <Hero tag="TRUST FRAMEWORK" title="Trust is not assumed here; it’s engineered into every stage." lede="A unified trust and transparency framework: every stage of the trade is secured by design." actions={[['Explore trusted trades', '/marketplace'], ['Fraud prevention', '/fraud-prevention', true]]} />
      <Sec tag="SIX STAGES" title="From onboarding to settlement."><Steps items={TRUST.stages} />{TRUST.stages.some((s) => s[2]) && <p className="note">Items marked “Roadmap” are planned, not yet live.</p>}</Sec>
      <Sec alt tag="ENGINEERED TRUST" title="From subjective belief to objective trust scores.">
        <Table head={['Traditional trade', 'Engineered trust']} rows={TRUST.compare} />
      </Sec>
      <Sec tag="A GLOBAL RULEBOOK" title="Three pillars."><Cards items={TRUST.pillars} /></Sec>
      <Sec alt tag="THE BANK VAULT ANALOGY" title="Trust as a mechanism."><p className="ilede dark">{TRUST.vault}</p></Sec>
      <Band title="Trust you can measure. Trade you can scale." actions={[['Check your trust score', '/tools?tool=trust']]} />
    </>
  );
}

export function Fraud() {
  return (
    <>
      <Hero tag="FRAUD PREVENTION" title="Safeguarding your trades. Built to prevent fraud, so you can trade safely." lede="Layered verification, AI risk intelligence and transparent execution." />
      <Sec tag="CORE STRATEGY" title="Four commitments."><Checks items={FRAUD.strategy} /></Sec>
      <Sec alt tag="SIX STAGES" title="How each stage prevents fraud.">
        <div className="icards" style={{ '--cols': 3 }}>{FRAUD.stages.map(([t, d, r], i) => <Reveal key={t} delay={(i % 3) * 0.06} className="icard"><small className="itag">STAGE {i + 1}</small><h3>{t}</h3><p>{d}</p><p className="result">{r}</p></Reveal>)}</div>
      </Sec>
      <Sec tag="YOUR ROLE" title="You are part of the defence."><Checks items={FRAUD.yourRole} /></Sec>
    </>
  );
}

export function Technology() {
  return (
    <>
      <Hero tag="TECHNOLOGY" title="Built for global trade, finance & discovery." lede="Engineered technology for secure, dependable trade." />
      <Sec tag="CORE FEATURES" title="What powers the platform.">
        <div className="icards" style={{ '--cols': 3 }}>{TECH.map(([t, items]) => <Reveal key={t} className="icard"><h3>{t}</h3><Checks items={items} /></Reveal>)}</div>
      </Sec>
      <Sec alt tag="SECURITY & COMPLIANCE" title="Engineered in.">
        <Cards cols={2} items={[['End-to-end data protection', 'Encryption in transit and at rest, with role-based permissions.'], ['Auditability and compliance controls', 'A tamper-evident audit trail for every action, with built-in financial data standards.']]} />
      </Sec>
    </>
  );
}

export function ForBuyers() {
  return (
    <>
      <Hero tag="FOR BUYERS" title="Empowering buyers." lede="Get the best rates with distributed sourcing and transparent pricing from verified partners." actions={[['Join as a buyer', '/join?role=buyer'], ['Post a requirement', '/marketplace', true]]} />
      <Sec tag="GLOBAL MARKETPLACE ACCESS" title="Buy better, grow faster."><Cards items={BUYER.access} /></Sec>
      <Sec alt tag="STABILISING YOUR BUSINESS" title="Plan with confidence."><Cards items={BUYER.stabilise} /></Sec>
      <Sec id="why" tag="WHY CHOOSE US" title="Your gateway to trusted global agri supply.">
        <div className="icards" style={{ '--cols': 3 }}>{BUYER.why.map(([t, items], i) => <Reveal key={t} delay={i * 0.07} className="icard"><small className="itag">0{i + 1}</small><h3>{t}</h3><Checks items={items} /></Reveal>)}</div>
      </Sec>
      <Sec alt tag="BUILDING RELATIONSHIPS" title="Questions buyers ask."><FAQ items={BUYER.faq} /></Sec>
      <Band title="Everything you need to buy smarter, in one place." actions={[['Join as a buyer', '/join?role=buyer'], ['Calculate landed cost', '/tools?tool=landed', true]]} />
    </>
  );
}

export function ForSellers() {
  return (
    <>
      <Hero tag="FOR SELLERS" title="Your gateway to global buyers." lede="A digitally engineered trade corridor for secure, transparent cross-border commodity selling: sellers reach serious global buyers with confidence, price clarity and faster deal closure." actions={[['Join as a seller', '/join?role=seller'], ['Export income calculator', '/tools?tool=export', true]]} />
      <Sec tag="WHY CHOOSE US" title="Sell internationally with confidence.">
        <div className="icards" style={{ '--cols': 3 }}>{SELLER.why.map(([t, items], i) => <Reveal key={t} delay={i * 0.07} className="icard"><small className="itag">0{i + 1}</small><h3>{t}</h3><Checks items={items} /></Reveal>)}</div>
      </Sec>
      <Sec alt id="finance" tag="FINANCE FOR SELLERS" title="Choose the right product."><Table head={['Your situation', 'Suggested product']} rows={FINANCE.sellerGuide} /></Sec>
      <Band title="Agri Global empowers sellers to expand beyond traditional networks." actions={[['Join as a seller', '/join?role=seller']]} />
    </>
  );
}

export function Agropreneur() {
  return (
    <>
      <Hero tag="AGROPRENEUR PROGRAM" title="Your gateway to global markets." lede="We simplify the challenges of selling agricultural commodities with trusted global connections. Learn agricultural entrepreneurship with our 2-month free training." actions={[['Sign up', '/join?role=agropreneur'], ['Export income calculator', '/tools?tool=export', true]]} />
      <Sec tag="WHAT YOU GET" title="Training, setup and funding."><Cards items={AGRO.features} /></Sec>
      <Sec alt tag="FOR YOU?" title="Join India’s export revolution." lede="Sell your local produce globally, store and process it, and become an agricultural exporter. The program is built for women entrepreneurs in agriculture."><p className="note">{AGRO.note}</p></Sec>
      <Sec tag="FAQ" title="Frequently asked questions."><FAQ items={AGRO.faq} /></Sec>
      <Band title="Sell your local produce globally." actions={[['Join as an AgroPreneur', '/join?role=agropreneur']]} />
    </>
  );
}

export function Finance() {
  return (
    <>
      <Hero tag="TRADE FINANCE" title="Finance easily with multi-bank quotes. Get approvals with smart credit & trust scoring." lede="Compare offers from banks, unlock faster funding and trade with confidence backed by credit insight." actions={[['Join as a buyer', '/join?role=buyer'], ['Join as a seller', '/join?role=seller', true]]} />
      <Sec tag="KEY FEATURES" title="Everything finance needs from a trade."><Cards items={FINANCE.features} /></Sec>
      <Sec alt tag="USER BENEFITS" title="Built on trust. Verified by data."><Cards items={FINANCE.benefits} /></Sec>
      <Sec tag="HOW IT WORKS" title="Finance your trade in 3 simple steps."><Steps items={FINANCE.steps} /></Sec>
      <Sec alt id="buyers" tag="FINANCE FOR BUYERS" title="Choose the right product."><Table head={['Your situation', 'Suggested product']} rows={FINANCE.buyerGuide} /></Sec>
      <Sec id="sellers" tag="FINANCE FOR SELLERS" title="Choose the right product."><Table head={['Your situation', 'Suggested product']} rows={FINANCE.sellerGuide} /></Sec>
      <Sec alt tag="FAQ" title="Finance questions."><FAQ items={FINANCE.faq} /></Sec>
      <Band title="From verified deals to credit that works for you." actions={[['Cost an LC', '/tools?tool=lc'], ['For banks & NBFCs', '/lenders', true]]} />
    </>
  );
}

export function Lenders() {
  return (
    <>
      <Hero tag="BANKS & NBFCs" title="Trade finance lacked deal-level intelligence. Until now." lede="Enabling lenders to move from borrower-centric risk to deal-level assessment." actions={[['Join as an early finance partner', '/join?role=bank']]} />
      <Sec tag="CAPITAL DEPLOYMENT CHALLENGES" title="Is a lack of deal-level intelligence slowing you down?"><Cards items={LENDERS.challenges.map(([t]) => [t])} /></Sec>
      <Sec alt tag="NEW-WORLD SOLUTIONS" title="Move to deal-intelligent trade finance."><Cards items={LENDERS.solutions.map(([t]) => [t])} /></Sec>
      <Sec tag="CLEAR BENEFITS" title="Look beyond balance sheets. Look inside the trades.">
        <div className="icards" style={{ '--cols': 3 }}>{LENDERS.benefits.map(([t, items]) => <Reveal key={t} className="icard"><h3>{t}</h3><Checks items={items} /></Reveal>)}</div>
      </Sec>
      <Band title="Power SME trade with smarter capital deployment." actions={[['Join as an early finance partner', '/join?role=bank']]} />
    </>
  );
}
