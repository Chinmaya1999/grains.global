const n = (v) => (Number.isFinite(+v) ? +v : 0);
const usd = (v) => `${v < 0 ? '-' : ''}$${Math.abs(Math.round(v)).toLocaleString('en-US')}`;
const f = (v, d = 2) => (+v).toLocaleString('en-US', { maximumFractionDigits: d });

export const CALCS = [
  {
    id: 'container', title: 'Container load', blurb: 'Tonnes and bags per shipment.',
    fields: [['containers', 'Containers', 1], ['mtPer', 'MT per container', 24, 'A 20 ft holds about 22–24 MT of rice'], ['bagKg', 'Bag size (kg)', 25]],
    compute: (v) => {
      const mt = n(v.containers) * n(v.mtPer);
      return [['Total weight', `${f(mt)} MT`, true], ['Bags', f(n(v.bagKg) ? (mt * 1000) / n(v.bagKg) : 0, 0)], ['Pallets (40 bags)', f(n(v.bagKg) ? (mt * 1000) / n(v.bagKg) / 40 : 0, 0)]];
    },
  },
  {
    id: 'moisture', title: 'Moisture shrinkage', blurb: 'Weight change when moisture shifts.',
    fields: [['w', 'Weight (MT)', 100], ['cur', 'Current moisture %', 14], ['tgt', 'Target moisture %', 12]],
    compute: (v) => {
      const fin = (n(v.w) * (100 - n(v.cur))) / Math.max(1, 100 - n(v.tgt));
      return [['Weight at target', `${f(fin)} MT`, true], ['Change', `${f(fin - n(v.w))} MT`], ['Change %', `${f(n(v.w) ? ((fin - n(v.w)) / n(v.w)) * 100 : 0)}%`]];
    },
  },
  {
    id: 'landed', title: 'Import landed cost', blurb: 'What a tonne really costs at your door.',
    fields: [['price', 'Price (USD/MT)', 987], ['qty', 'Quantity (MT)', 100], ['freight', 'Freight (USD/MT)', 45], ['ins', 'Insurance %', 0.5], ['duty', 'Import duty %', 5], ['other', 'Other costs (USD/MT)', 12]],
    compute: (v) => {
      const cif = (n(v.price) + n(v.freight)) * (1 + n(v.ins) / 100);
      const landed = cif + (cif * n(v.duty)) / 100 + n(v.other);
      return [['Landed per MT', usd(landed), true], ['Total', usd(landed * n(v.qty))], ['CIF value per MT', usd(cif)], ['Duty per MT', usd((cif * n(v.duty)) / 100)]];
    },
  },
  {
    id: 'lc', title: 'LC cost', blurb: 'Fees and interest on a letter of credit.',
    fields: [['amt', 'LC amount (USD)', 100000], ['days', 'Tenor (days)', 90], ['issue', 'Issuance fee % (flat)', 0.5], ['conf', 'Confirmation fee % p.a.', 1.2], ['disc', 'Discounting rate % p.a.', 8]],
    compute: (v) => {
      const a = n(v.amt), t = n(v.days) / 365;
      const issue = (a * n(v.issue)) / 100, conf = a * (n(v.conf) / 100) * t, disc = a * (n(v.disc) / 100) * t;
      const tot = issue + conf + disc;
      return [['Total cost', usd(tot), true], ['As % of LC', `${f(a ? (tot / a) * 100 : 0)}%`], ['Issuance', usd(issue)], ['Confirmation', usd(conf)], ['Discounting', usd(disc)]];
    },
  },
  {
    id: 'wc', title: 'Working capital need', blurb: 'Cash tied up between buying and getting paid.',
    fields: [['buy', 'Monthly purchases (USD)', 200000], ['inv', 'Inventory days', 30], ['rec', 'Receivable days', 45], ['pay', 'Payable days', 15]],
    compute: (v) => {
      const cycle = n(v.inv) + n(v.rec) - n(v.pay);
      return [['Funding needed', usd((n(v.buy) / 30) * cycle), true], ['Cash cycle', `${cycle} days`]];
    },
  },
  {
    id: 'margin', title: 'Deal margin', blurb: 'Margin on a deal, and a partner’s share.',
    fields: [['sell', 'Selling price (USD/MT)', 987], ['cost', 'Purchase price (USD/MT)', 900], ['proc', 'Processing (USD/MT)', 12], ['trans', 'Transport & handling (USD/MT)', 18], ['qty', 'Quantity (MT)', 100], ['share', 'Partner profit share %', 30.75, 'See the Partners page for the slab table']],
    compute: (v) => {
      const m = n(v.sell) - n(v.cost) - n(v.proc) - n(v.trans), tot = m * n(v.qty);
      return [['Margin per MT', usd(m), true], ['Total margin', usd(tot)], ['Margin % of price', `${f(n(v.sell) ? (m / n(v.sell)) * 100 : 0)}%`], ['Partner earns', usd((tot * n(v.share)) / 100)]];
    },
  },
  {
    id: 'export', title: 'Export pricing', blurb: 'Build FOB and CIF prices from cost.',
    fields: [['exw', 'Ex-works cost (USD/MT)', 850], ['inland', 'Inland freight (USD/MT)', 15], ['handling', 'Port, docs & handling (USD/MT)', 20], ['margin', 'Your margin %', 5], ['freight', 'Ocean freight (USD/MT)', 45], ['ins', 'Insurance %', 0.5, 'Applied to 110% of FOB + freight']],
    compute: (v) => {
      const fob = (n(v.exw) + n(v.inland) + n(v.handling)) * (1 + n(v.margin) / 100);
      const ins = (fob + n(v.freight)) * 1.1 * (n(v.ins) / 100);
      return [['FOB price per MT', usd(fob), true], ['CIF price per MT', usd(fob + n(v.freight) + ins)], ['Insurance per MT', usd(ins)]];
    },
  },
  {
    id: 'early', title: 'Early payment', blurb: 'What an early-payment discount is worth.',
    fields: [['amt', 'Invoice amount (USD)', 100000], ['disc', 'Discount offered %', 2], ['early', 'Pay within (days)', 10], ['term', 'Normal terms (days)', 60]],
    compute: (v) => {
      const d = n(v.disc), span = n(v.term) - n(v.early);
      const apr = span > 0 && d < 100 ? (d / (100 - d)) * (365 / span) * 100 : 0;
      return [['Equivalent annual rate', `${f(apr)}%`, true], ['You save', usd((n(v.amt) * d) / 100)], ['Pay early', usd(n(v.amt) * (1 - d / 100))]];
    },
  },
  {
    id: 'markup', title: 'Markup & wholesale', blurb: 'Set retail and wholesale prices.',
    fields: [['cost', 'Cost (USD per unit)', 100], ['markup', 'Retail markup %', 30], ['wdisc', 'Wholesale discount off retail %', 10]],
    compute: (v) => {
      const retail = n(v.cost) * (1 + n(v.markup) / 100), whole = retail * (1 - n(v.wdisc) / 100);
      return [['Retail price', usd(retail), true], ['Wholesale price', usd(whole)], ['Retail margin', `${f(retail ? ((retail - n(v.cost)) / retail) * 100 : 0)}%`], ['Wholesale margin', `${f(whole ? ((whole - n(v.cost)) / whole) * 100 : 0)}%`]];
    },
  },
  {
    id: 'shrink', title: 'Shrinkage & wastage', blurb: 'True cost per sellable tonne after losses.',
    fields: [['qty', 'Quantity bought (MT)', 100], ['price', 'Purchase price (USD/MT)', 900], ['handling', 'Handling loss %', 0.5], ['storage', 'Storage loss %', 1], ['process', 'Processing wastage %', 2]],
    compute: (v) => {
      const keep = (1 - n(v.handling) / 100) * (1 - n(v.storage) / 100) * (1 - n(v.process) / 100), net = n(v.qty) * keep;
      return [['Sellable quantity', `${f(net)} MT`, true], ['Total loss', `${f(n(v.qty) - net)} MT`], ['Cost per sellable MT', usd(keep ? n(v.price) / keep : 0)]];
    },
  },
  {
    id: 'bushel', title: 'Bushel converter', blurb: 'Bushels to tonnes and back.',
    fields: [['bu', 'Bushels', 1000], ['mt', 'Metric tonnes', 10], ['lb', 'Pounds per bushel', 60, 'Wheat/soy 60, corn 56, rice 45, barley 48, oats 32']],
    compute: (v) => {
      const lb = n(v.lb) || 60;
      return [['Bushels → tonnes', `${f((n(v.bu) * lb) / 2204.62, 3)} MT`, true], ['Tonnes → bushels', `${f((n(v.mt) * 2204.62) / lb, 1)} bu`]];
    },
  },
];

const LEVELS = [['None', 0], ['Basic', 0.4], ['Good', 0.75], ['Strong', 1]];
const grade = (s, bands) => bands.find(([min]) => s >= min)[1];

export const SCORES = [
  {
    id: 'trust', title: 'Trust score', blurb: 'Counterparty reliability, 0–100.', levels: LEVELS,
    groups: [
      ['Legal & regulatory', 20, 'Registered entity, licences, tax IDs'], ['Ownership & management', 20, 'Ownership disclosed, management experience'],
      ['Compliance', 20, 'AML / KYC / sanctions / litigation clear'], ['Trade history', 15, 'Years trading, annual volume, export record'],
      ['Digital presence', 10, 'Website age, corporate email'], ['Banking', 10, 'Bank relationship, LC / BG history'], ['References', 5, 'Verifiable trade references'],
    ],
    bands: [[80, 'Highly reliable'], [60, 'Reliable'], [40, 'Needs checks'], [0, 'High risk']],
    label: (s) => grade(s, [[80, 'Highly reliable'], [60, 'Reliable'], [40, 'Needs checks'], [0, 'High risk']]),
  },
  {
    id: 'credit', title: 'Credit readiness', blurb: 'Financial readiness, graded A–D.', levels: LEVELS,
    groups: [
      ['Profile', 20, 'Vintage, legal entity, promoter experience'], ['Financials', 30, 'Turnover, margin, current ratio, debt-to-equity'],
      ['Compliance', 25, 'GST, ITR, bank statements, FSSAI, UDYAM, audited accounts'], ['Operations', 25, 'Buyer concentration, assets, receivable days, hedging'],
    ],
    label: (s) => `Grade ${grade(s, [[75, 'A'], [55, 'B'], [35, 'C'], [0, 'D']])}`,
  },
];
