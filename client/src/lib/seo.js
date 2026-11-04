// Per-page SEO: browser-tab title, meta description, canonical URL, social tags and robots.
// Static defaults live in index.html; this updates them on every route change.
export const SITE = 'https://agriglobal.co.in';
export const BRAND = 'Agri Global';

const PAGES = {
  '/': ['Agri Global | Global Agri Commodity Trade & Finance Platform', 'Agri Global is a global B2B marketplace to buy, sell and finance agricultural commodities, starting with rice, with verified partners and trade finance across Asia, Africa and the Middle East.'],
  '/marketplace': ['Buy Rice Online: Basmati, PR 14, Sharbati, Sona Masoori', 'Browse 22 export-grade rice varieties with live offers, grain specs and per-tonne prices. Post a requirement and get quotes from verified sellers.'],
  '/finance': ['Trade Finance for Agri Exporters: LC, BG, SBLC & Invoice Financing', 'Compare trade finance quotes for letters of credit, bank guarantees, SBLCs and invoice financing from participating banks on Agri Global.'],
  '/lenders': ['For Banks & NBFCs: Agri Trade Finance Deal Flow', 'Reach verified agri-commodity traders and originate trade finance deals with AI-driven risk scoring on Agri Global.'],
  '/tools': ['Free Agri Trade Calculators & Counterparty Scorecards', 'Free rice export calculators, landed-cost tools and counterparty risk scorecards for buyers, sellers and traders.'],
  '/prompts': ['AI Prompts for Agri Trade, Sourcing & Finance', 'Ready-to-use AI prompts for sourcing rice, drafting offers, vetting counterparties and preparing trade finance requests.'],
  '/partner': ['Become a Trade Partner | Agri Global', 'Partner with Agri Global to bring buyers, sellers and financiers onto the platform across our global trade corridor.'],
  '/join': ['Join Agri Global as a Buyer, Seller or Partner', 'Create a free account to buy rice, list your stock, or join as a partner, AgroPreneur or lender.'],
  '/for-buyers': ['For Rice Buyers: Verified Suppliers & Transparent Pricing', 'Source rice and agri commodities from KYB-verified sellers with transparent pricing, digital documentation and optional trade finance.'],
  '/for-sellers': ['For Rice Sellers & Exporters: Reach Global Buyers', 'List your rice, reach buyers across Africa and the Middle East, and get paid with trade finance support on Agri Global.'],
  '/agropreneur': ['AgroPreneurs: Empowering Women in Agri Trade', 'Agri Global’s AgroPreneur programme equips women entrepreneurs with market access, training and trade tools.'],
  '/platform': ['The Agri Global Platform: Marketplace, Finance & Intelligence', 'One platform for agri-commodity trading, trade finance, market intelligence and verified counterparties.'],
  '/corridor': ['Global Digital Trade Corridor: Asia, Africa & Middle East', 'Trade rice and grains across 30 countries in the Asia – Africa – Middle East digital trade corridor.'],
  '/trust': ['Trust & Verification: KYB, KYC and AI Risk Scoring', 'How Agri Global verifies buyers and sellers with KYB and KYC checks and AI-driven risk scoring.'],
  '/fraud-prevention': ['Fraud Prevention in Agri Trade | Agri Global', 'Practical guidance and platform safeguards to avoid fraud in international agri-commodity trading.'],
  '/technology': ['Technology: AI-Driven Agri Trade Platform', 'The technology behind Agri Global: AI-driven matching, risk scoring, digital documentation and market intelligence.'],
  '/about': ['About Agri Global: Next-Generation Agri Trade & Finance', 'Agri Global, developed by Agrimaati Ecosystem Private Limited, simplifies cross-border agri-commodity trade and finance.'],
  '/why-us': ['Why Trade & Finance on Agri Global', 'Trust, trade and trade finance in one platform built for global agri-SMEs.'],
  '/team': ['Our Team | Agri Global', 'Meet the founders and leaders behind Agri Global.'],
  '/manifesto': ['Our Manifesto: The Future of Agriculture Is the System', 'Why Agri Global believes the future of agriculture is not just in the soil, but in the system.'],
  '/sustainability': ['Sustainability | Agri Global', 'How Agri Global supports sustainable, fair and inclusive agri trade for farmers and traders.'],
  '/livelihood': ['Farmer Livelihoods | Agri Global', 'Improving farmer livelihoods through fair market access and transparent pricing.'],
  '/contact': ['Contact Agri Global', 'Get in touch with Agri Global to buy or sell rice, request a quote or discuss trade finance. Registered office in Ahmedabad, Gujarat.'],
  '/documents': ['Company Registrations & Certificates | Agri Global', 'Registration details and certificates of Agrimaati Ecosystem Private Limited, which develops Agri Global.'],
  '/privacy': ['Privacy Policy | Agri Global', 'How Agri Global collects, uses and protects your personal data.'],
  '/terms': ['Terms & Conditions | Agri Global', 'The terms for using the Agri Global platform.'],
};
const PRIVATE = ['/admin', '/dashboard', '/account', '/login', '/register'];

function meta(attr, key, value) {
  let el = document.head.querySelector(`meta[${attr}="${key}"]`);
  if (!el) { el = document.createElement('meta'); el.setAttribute(attr, key); document.head.appendChild(el); }
  el.setAttribute('content', value);
}

export function applySeo({ title, description, path, image, noindex }) {
  const url = SITE + (path === '/' ? '/' : path.replace(/\/$/, ''));
  document.title = title;
  if (description) { meta('name', 'description', description); meta('property', 'og:description', description); meta('name', 'twitter:description', description); }
  meta('property', 'og:title', title); meta('name', 'twitter:title', title);
  meta('property', 'og:url', url);
  if (image) { meta('property', 'og:image', SITE + image); meta('name', 'twitter:image', SITE + image); }
  meta('name', 'robots', noindex ? 'noindex, nofollow' : 'index, follow, max-image-preview:large');
  let link = document.head.querySelector('link[rel="canonical"]');
  if (!link) { link = document.createElement('link'); link.rel = 'canonical'; document.head.appendChild(link); }
  link.href = url;
}

// Returns SEO for a path, or null when the page sets its own (product pages) or isn't known.
export function seoFor(path) {
  if (PRIVATE.some((p) => path === p || path.startsWith(`${p}/`))) return { title: `${BRAND}`, path, noindex: true };
  const hit = PAGES[path.replace(/\/$/, '') || '/'];
  return hit ? { title: hit[0], description: hit[1], path } : null;
}

export function productSeo(p) {
  const kind = p.family === 'Basmati' ? 'Basmati' : 'Non-Basmati';
  return {
    title: `${p.name} Export | ${kind} Rice ${p.grain?.length ? `${Number(p.grain.length).toFixed(2)} mm ` : ''}| ${BRAND}`.replace(/\s+\|/g, ' |'),
    description: `Buy ${p.name} (${kind}, ${p.processing}) from India. ${p.grain?.length ? `Average grain length ${Number(p.grain.length).toFixed(2)} mm, ` : ''}under ${p.grain?.broken ?? 2}% broken. FOB, CIF and CNF offers from verified exporters on ${BRAND}.`,
    path: `/rice/${p.slug}`,
  };
}
