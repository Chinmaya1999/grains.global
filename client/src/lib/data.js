// Used when the API/database is unreachable so the lab and ticker still work.
export const FALLBACK_VARIETIES = [
  { slug: '1121-steam-basmati', name: '1121 Steam Basmati', family: 'Basmati', processing: 'Steam', hsn: '10063020', avgPriceUsd: 987, grain: { length: 8.3, broken: 1, moisture: 12 } },
  { slug: '1509-steam-basmati', name: '1509 Steam Basmati', family: 'Basmati', processing: 'Steam', hsn: '10063020', avgPriceUsd: 905, grain: { length: 8.2, broken: 1, moisture: 12 } },
  { slug: 'sharbati-steam', name: 'Sharbati Steam', family: 'Basmati', processing: 'Steam', hsn: '10063020', avgPriceUsd: 780, grain: { length: 7.6, broken: 2, moisture: 12 } },
  { slug: 'pr14-sella', name: 'PR-14 Golden Sella', family: 'Sella', processing: 'Golden Sella', hsn: '10063020', avgPriceUsd: 610, grain: { length: 6.6, broken: 2, moisture: 12 } },
  { slug: 'sona-masoori-raw', name: 'Sona Masoori Raw', family: 'Non-Basmati', processing: 'Raw', hsn: '10063020', avgPriceUsd: 560, grain: { length: 5.2, broken: 5, moisture: 12 } },
];

export const STEPS = [
  ['Grown', 'AgroPreneurs aggregate crop from about 50 farmers each, with pre-harvest quality checks.'],
  ['Milled', 'ISO / HACCP mills process, sort and bag to spec: length, moisture, broken percentage.'],
  ['Listed', 'Sellers post product, HSN, Incoterm, tonnes and USD/MT. Buyers post an RFQ.'],
  ['Priced', 'A local Global Trading Partner sees the full cost build-up and sets the final price.'],
  ['Financed', 'Banks and NBFCs quote LC, BG, SBLC and invoice finance on the actual deal.'],
  ['Shipped', 'Bill of lading, phytosanitary, certificate of origin and fumigation travel with the cargo.'],
  ['Settled', 'Payment lands, margin is split with your partner, and trust scores update.'],
];

export const ROLES = [
  { k: 'buyer', color: '#e9c46a', t: 'Buyers', d: 'Importers, wholesalers, HORECA. Verified sellers and one local partner as your contact.' },
  { k: 'seller', color: '#ff8a4c', t: 'Sellers', d: 'Exporters and mills. Reach global buyers, with pre- and post-shipment finance.' },
  { k: 'partner', color: '#8fe388', t: 'Partners', d: 'Own the buyer relationship in your country and share the deal margin.', to: '/partner' },
  { k: 'bank', color: '#5ee0d1', t: 'Lenders', d: 'Quote on deal-level risk with pre-verified KYC/AML and documents in one place.' },
  { k: 'agropreneur', color: '#ff7aa8', t: 'AgroPreneurs', d: 'Rural women running village sourcing, with free training and pre-shipment funding.' },
];

export const PROMPTS = [
  ['Buyer', 'Draft an RFQ', 'Write an RFQ for {quantity} MT of {variety} rice, {incoterm} {port}, payment by {terms}. Include specs for grain length, broken %, moisture and packing, and ask for validity, sample policy and lead time.'],
  ['Buyer', 'Compare supplier quotes', 'Compare these supplier quotes for {variety}: {paste quotes}. Normalise to the same Incoterm, flag hidden costs, rank by landed cost and by risk, and suggest negotiation points.'],
  ['Seller', 'Write an offer listing', 'Write a concise offer for {variety} ({hsn}), {quantity} MT, {price} USD/MT {incoterm} {port}. Mention packing, shipment window, certificates available and payment terms.'],
  ['Seller', 'Reply to a price objection', 'A buyer says my {variety} price of {price} USD/MT is too high versus a competitor. Write a polite reply that defends the price on quality and reliability, and offers a volume-slab option.'],
  ['Finance', 'LC checklist', 'List the documents and checks needed for a letter of credit on a rice export of {amount} USD to {country}. Flag the most common discrepancies that cause rejection.'],
  ['Finance', 'Explain LC vs SBLC', 'Explain in plain language when a rice exporter should use an LC versus a standby LC (SBLC), with costs, risks and a recommendation for a {amount} USD, {tenor}-day deal.'],
  ['Finance', 'Pre-shipment finance pitch', 'Draft a one-page request to an NBFC for pre-shipment finance of {amount} USD against a confirmed order from {buyer}. Include deal summary, repayment source and risk mitigants.'],
  ['Partner', 'Intro to local buyers', 'Write a short WhatsApp message in {language} from a trading partner introducing Indian {variety} rice to a wholesaler in {country}, with a call to action for samples.'],
  ['Partner', 'Margin explainer', 'Explain to a new trading partner how a {margin}% deal margin on {volume} USD monthly volume turns into earnings at a {share}% share, using a worked example.'],
  ['Operations', 'Shipment document check', 'Review this document list for a rice shipment to {country}: {paste list}. Identify missing or inconsistent items (BL, phyto, CoO, fumigation, packing list, invoice).'],
  ['Operations', 'Quality dispute response', 'A buyer reports {issue} on a {quantity} MT shipment of {variety}. Draft a calm, factual response asking for lab reports and photos, and outlining the claim process.'],
  ['AgroPreneur', 'Farmer meeting script', 'Write a simple script in {language} for an AgroPreneur to explain pre-harvest quality checks and the pricing timeline to a group of farmers.'],
];
