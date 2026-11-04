import { Link } from 'react-router-dom';
import { Hero, Sec, Cards, Checks, Band, Prose, Table } from '../components/Blocks.jsx';
import { Reveal } from '../components/bits.jsx';
import LeadForm from '../components/LeadForm.jsx';
import { COMPANY, SETTINGS, ABOUT, WHY, TEAM, MANIFESTO, SUSTAIN, LIVELIHOOD, PRIVACY, TERMS } from '../lib/content.js';

const initials = (n) => n.split(' ').map((w) => w[0]).slice(0, 2).join('');

export function About() {
  return (
    <>
      <Hero tag="ABOUT US" title="We’re the world’s 1st integrated platform for agri-commodity trading & trade finance." lede="One seamless ecosystem where SMEs can trade, finance and grow, all in one place. Verified buyers, transparent pricing, instant RFQs and competitive LC / BG / invoice-finance quotes, powered by AI-driven trust, speed and transparency." actions={[['Why the world trades with us', '/why-us'], ['Explore the platform', '/platform', true]]} />
      <Sec tag="WHAT WE OFFER" title="Better markets, better finance, better liquidity."><Cards items={ABOUT.offer} /></Sec>
      <Sec alt tag="MISSION & VISION" title="Fair, transparent, inclusive trade.">
        <div className="two"><Reveal className="panelx"><h3>Our mission</h3>{ABOUT.mission.map((p) => <p key={p}>{p}</p>)}</Reveal><Reveal className="panelx"><h3>Our vision</h3>{ABOUT.vision.map((p) => <p key={p}>{p}</p>)}</Reveal></div>
      </Sec>
      <Sec tag="THE TRUST ADVANTAGE" title="Transforming global agri-trade with technology." lede="Agri Global is a next-generation digital platform that simplifies how agricultural commodities are traded and financed across borders. It brings traders, exporters, banks and global buyers onto one ecosystem, reducing friction, increasing transparency and enabling faster, more efficient trade." />
      <Sec alt tag="OFFICES" title="Where to find us.">
        <div className="two"><Reveal className="panelx"><h3>Registered office</h3><p>{COMPANY.registered}</p></Reveal></div>
      </Sec>
      <Band title="Every trade is a relationship here, built on trust." actions={[['Trade with trust', '/marketplace'], ['Contact us', '/contact', true]]} />
    </>
  );
}

export function WhyUs() {
  return (
    <>
      <Hero tag="WHY US" title="Why the world trades & finances with confidence on Agri Global." lede="The only platform that unifies trust, trade and trade finance for global agri-SMEs: powered by AI, backed by real partners, and built for transparent cross-border trade." actions={[['Understand the platform', '/platform']]} />
      <Sec tag="THE CHALLENGE" title="The global agri-trade system is broken." lede="Cross-border agri trade is slow and opaque; critical data is missing at every stage. Lack of data leads directly to lack of financing, and that makes for slow deals. The problem is trust, or the lack of it."><Checks items={WHY.broken} /></Sec>
      <Sec alt tag="OUR APPROACH" title="We bring trust back into trading."><Checks items={WHY.approach} /></Sec>
      <Sec tag="VALUE FOR EVERY ROLE" title="Why buyers, sellers, partners & banks choose us.">
        <div className="two">{WHY.roles.map(([r, items]) => <Reveal key={r} className="panelx"><h3>{r}</h3><Checks items={items} /></Reveal>)}</div>
      </Sec>
      <Sec alt tag="BACKED BY EXCELLENCE" title="Accredited by India’s oldest and most influential chambers of commerce.">
        <Cards items={WHY.chambers} cols={2} />
      </Sec>
      <Band title="Trust is not assumed here. It’s engineered." actions={[['Trade with trust', '/marketplace'], ['See our trust framework', '/trust', true]]} />
    </>
  );
}

export function Team() {
  const Person = ({ n, t }) => <Reveal className="person"><span>{initials(n)}</span><h3>{n}</h3>{t && <p>{t}</p>}</Reveal>;
  return (
    <>
      <Hero tag="OUR TEAM" title="The team behind it." lede="The founders and leaders behind the vision of Agri Global." />
      <Sec tag="FOUNDERS" title="Brains behind the vision."><div className="people">{TEAM.founders.map(([n]) => <Person key={n} n={n} t="Founder" />)}</div></Sec>
      <Sec alt tag="LEADERSHIP" title="Behind the scenes, our real superheroes."><div className="people">{TEAM.leaders.map(([n, t]) => <Person key={n} n={n} t={t} />)}</div></Sec>
      <Sec tag="PARTNERS" title="Fuelling the journey of Agri Global."><div className="people">{TEAM.partners.map(([n, t]) => <Person key={n} n={n} t={t} />)}</div></Sec>
    </>
  );
}

export function Manifesto() {
  return (
    <>
      <Hero tag="MANIFESTO" title="Trusted trades, engineered trust." />
      <Sec><Prose>{MANIFESTO.map((p, i) => <p key={i} className={i === 0 ? 'lead' : ''}>{p}</p>)}</Prose></Sec>
      <Band title="Cultivate the future." actions={[['Join the corridor', '/join']]} />
    </>
  );
}

export function Sustainability() {
  return (
    <>
      <Hero tag="SUSTAINABILITY" title="Sustainability is the impact we leave behind. Nothing less." lede="We care and act for communities and the planet today for a better tomorrow." actions={[['Livelihood generation', '/livelihood'], ['Join as a partner', '/join?role=partner', true]]} />
      <Sec tag="REDEFINING FOOD SUPPLY" title="Feeding 9.7 billion by 2050."><p className="ilede dark">{SUSTAIN.intro}</p></Sec>
      <Sec alt tag="TRUE IMPACT" title="For people, for planet, for progress." lede="We aim to build a sustainable future aligned with the United Nations’ Sustainable Development Goals."><Cards items={SUSTAIN.sdgs.map(([g, h, d]) => [`${g}: ${h}`, d])} /></Sec>
      <Sec tag="OUR CORE PHILOSOPHY" title="Sustainability is not just a goal, it’s a commitment."><Checks items={SUSTAIN.philosophy} /></Sec>
      <Sec alt tag="OUR GOALS" title="Building opportunities, transforming lives." lede="These are ambitions we are working toward, not results achieved to date.">
        <div className="goals">{SUSTAIN.goals.map(([n, l]) => <Reveal key={l} className="goal"><b>{n}</b><span>{l}</span></Reveal>)}</div>
      </Sec>
      <Band title="Small action. Big change." actions={[['Join as a partner', '/join?role=partner'], ['Become an AgroPreneur', '/join?role=agropreneur', true]]} />
    </>
  );
}

export function Livelihood() {
  return (
    <>
      <Hero tag="LIVELIHOOD GENERATION" title="Your growth, your livelihood. That’s what our AI delivers." lede="We’re here for every business, buyer and changemaker seeking a better way to do trusted trade and connect the world through a people-powered purpose." actions={[['Sign up', '/join'], ['Our sustainability goals', '/sustainability', true]]} />
      <Sec tag="FROM LOCAL ROOTS TO GLOBAL REACH" title="When individuals grow, the entire community grows." lede={`${LIVELIHOOD.intro} Our goal is to support 1 million AgroPreneurs, guided by trained managers and backed by a global network of trading partners.`} />
      <Sec alt tag="HOW WE HELP" title="Six pillars from farm to shipment."><Cards items={LIVELIHOOD.pillars} /></Sec>
      <Band title="Connect. Cultivate. Create a lasting impact right from where you are." actions={[['Join us today', '/join?role=agropreneur']]} />
    </>
  );
}

export function Contact() {
  return (
    <>
      <Hero tag="CONTACT" title="Let’s talk." lede="Tell us what you are trading, financing or building and our team will reply by email or WhatsApp." />
      <Sec>
        <div className="two wide-l">
          <Reveal className="panelx"><h3>Send a message</h3><LeadForm role="contact" cta="Send message" /></Reveal>
          <div>
            {(SETTINGS.contactEmail || SETTINGS.whatsapp) && <Reveal className="panelx"><h3>Reach us directly</h3><p className="socials">
              {SETTINGS.contactEmail && <a href={`mailto:${SETTINGS.contactEmail}`}>{SETTINGS.contactEmail}</a>}
              {SETTINGS.whatsapp && <a href={`https://wa.me/${SETTINGS.whatsapp.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer">WhatsApp {SETTINGS.whatsapp}</a>}</p></Reveal>}
            <Reveal className="panelx"><h3>Registered office</h3><p>{COMPANY.registered}</p></Reveal>
            <Reveal className="panelx"><h3>Follow us</h3><p className="socials">{COMPANY.social.map(([n, u]) => <a key={n} href={u} target="_blank" rel="noopener noreferrer">{n}</a>)}</p></Reveal>
          </div>
        </div>
      </Sec>
    </>
  );
}

const Legal = ({ title, tag, items }) => (
  <>
    <Hero tag={tag} title={title} />
    <Sec><Prose>{items.map(([h, p], i) => <section key={h}><h2>{i + 1}. {h}</h2><p>{p}</p></section>)}</Prose></Sec>
  </>
);
export const Privacy = () => <Legal tag="LEGAL" title="Privacy policy" items={PRIVACY} />;
export const Terms = () => <Legal tag="LEGAL" title="Terms & conditions" items={TERMS} />;

export function Documents() {
  return (
    <>
      <Hero tag="DOCUMENTS" title="Registrations & certificates." lede={`${COMPANY.legalName} develops Agri Global.`} />
      <Sec tag="REGISTRATION NUMBERS" title="Our identifiers."><Table head={['Registration', 'Number']} rows={COMPANY.ids} /></Sec>
      <Sec alt tag="CERTIFICATES" title="Available on request." lede="Copies of the certificates below are available to verified counterparties. Contact us to request them."><Checks items={COMPANY.documents} /><p style={{ marginTop: 22 }}><Link className="link" to="/contact">Request documents →</Link></p></Sec>
    </>
  );
}
