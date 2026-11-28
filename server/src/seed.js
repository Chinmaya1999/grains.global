import 'dotenv/config';
import mongoose from 'mongoose';
import { Product, Offer, Stat } from './models/index.js';
import { importCatalogue, NEW_PRODUCTS } from './catalogue.js';

// The 22 rice SKUs listed in grains.global's sitemap. Grain lengths come from the SKU URLs.
// Average prices are only known for three of them (from their product pages); the rest are 0,
// which the site shows as "On request" rather than an invented number.
const BASMATI_HSN = '10063020';
const sku = (slug, name, family, processing, length, extra = {}) => ({
  slug, name, family, processing, hsn: extra.hsn ?? (family === 'Basmati' ? BASMATI_HSN : ''),
  avgPriceUsd: extra.price ?? 0,
  grain: { length, broken: 2, moisture: 12 },
  packaging: ['1, 5, 10 kg consumer packs', '25 / 50 kg bulk bags', 'Jumbo bags', 'Private label'],
  incoterms: ['FOB', 'CIF', 'CNF'],
  blurb: extra.blurb || `${name} from India, average grain length ${length.toFixed(2)} mm, export quality, sourced from ISO and HACCP-compliant mills.`,
});

const products = [
  sku('1121-steam-basmati-rice-8-35-mm', '1121 Steam Basmati Rice', 'Basmati', 'Steam', 8.35, { price: 900, blurb: '1121 Steam Basmati Rice is a premium long-grain rice known for exceptional length, aroma and consistent cooking performance. The parboiled steam process preserves nutrients, strengthens the grain and reduces breakage during cooking and transport.' }),
  sku('1121-golden-sella-basmati-rice-8-35-mm', '1121 Golden Sella Basmati Rice', 'Basmati', 'Golden Sella', 8.35),
  sku('1121-white-sella-basmati-rice-8-35-mm', '1121 White Sella Basmati Rice', 'Basmati', 'White Sella', 8.35),
  sku('1509-steam-basmati-rice-8-40-mm', '1509 Steam Basmati Rice', 'Basmati', 'Steam', 8.4),
  sku('1509-golden-sella-basmati-rice-8-40-mm', '1509 Golden Sella Basmati Rice', 'Basmati', 'Golden Sella', 8.4),
  sku('1509-white-sella-basmati-rice-8-40-mm', '1509 White Sella Basmati Rice', 'Basmati', 'White Sella', 8.4),
  sku('1718-steam-basmati-rice-8-40-mm', '1718 Steam Basmati Rice', 'Basmati', 'Steam', 8.4),
  sku('1718-golden-sella-basmati-rice-8-35-mm', '1718 Golden Sella Basmati Rice', 'Basmati', 'Golden Sella', 8.35),
  sku('1718-white-sella-basmati-rice-8-35-mm', '1718 White Sella Basmati Rice', 'Basmati', 'White Sella', 8.35),
  sku('1401-steam-basmati-rice-7-70-mm', '1401 Steam Basmati Rice', 'Basmati', 'Steam', 7.7),
  sku('1401-white-sella-basmati-rice-7-70-mm', '1401 White Sella Basmati Rice', 'Basmati', 'White Sella', 7.7),
  sku('pr-14-steam-6-90-mm', 'PR 14 Steam', 'Non-Basmati', 'Steam', 6.9, { price: 500, hsn: '10063010', blurb: 'PR 14 Steam Rice is a premium parboiled long-grain variety widely preferred in global bulk and institutional markets. Steaming retains nutrients, improves grain strength and gives excellent elongation after cooking.' }),
  sku('pr-14-white-sella-6-90-mm', 'PR 14 White Sella', 'Non-Basmati', 'White Sella', 6.9),
  sku('pr-14-golden-sella-6-80-mm', 'PR 14 Golden Sella', 'Non-Basmati', 'Golden Sella', 6.8),
  sku('sharbati-steam-7-10-mm', 'Sharbati Steam', 'Non-Basmati', 'Steam', 7.1),
  sku('sharbati-raw-7-10-mm', 'Sharbati Raw', 'Non-Basmati', 'Raw', 7.1),
  sku('sharbati-white-sella-7-10-mm', 'Sharbati White Sella', 'Non-Basmati', 'White Sella', 7.1),
  sku('sharbati-golden-sella-7-00-mm', 'Sharbati Golden Sella', 'Non-Basmati', 'Golden Sella', 7.0),
  sku('sugandha-steam-rice-7-90-mm', 'Sugandha Steam Rice', 'Non-Basmati', 'Steam', 7.9),
  sku('sugandha-white-sella-7-90-mm', 'Sugandha White Sella', 'Non-Basmati', 'White Sella', 7.9),
  sku('sugandha-golden-sella-7-85-mm', 'Sugandha Golden Sella', 'Non-Basmati', 'Golden Sella', 7.85),
  sku('sona-masoori-steam-5-20-mm', 'Sona Masoori Steam', 'Non-Basmati', 'Steam', 5.2, { price: 510, hsn: '10063090', blurb: 'Sona Masoori Steam is a popular lightweight rice known for softness, versatile cooking quality and a mild aroma, sourced from South Indian growing regions and processed with steam technology.' }),
  sku('matta-rosematta-rice-6-50-mm', 'Matta (Rosematta) Rice', 'Non-Basmati', 'Parboiled', 6.5, { hsn: '10063090', price: 450, blurb: 'Matta (Rosematta) Rice is a traditional red-bran parboiled rice from Kerala, prized for its earthy flavour, high fibre and hearty bite.' }),
  sku('brown-rice-whole-grain-6-80-mm', 'Brown Rice Whole Grain', 'Non-Basmati', 'Raw', 6.8, { hsn: '10062000', price: 465, blurb: 'Whole-grain brown rice with the bran layer intact, rich in fibre and minerals, for health-food and retail packing.' }),
  sku('brown-rice-medium-grain-5-50-mm', 'Brown Rice Medium Grain', 'Non-Basmati', 'Raw', 5.5, { hsn: '10062000', price: 480, blurb: 'Medium-grain brown rice with a soft, slightly chewy texture, popular for wholesome meals and meal-kit programmes.' }),
  sku('red-cargo-rice-6-60-mm', 'Red Cargo Rice', 'Non-Basmati', 'Raw', 6.6, { hsn: '10062000', price: 495, blurb: 'Red cargo rice keeps its natural red bran for a nutty flavour and high antioxidant content.' }),
  sku('black-rice-premium-6-00-mm', 'Black Rice Premium', 'Non-Basmati', 'Raw', 6.0, { hsn: '10063090', price: 510, blurb: 'Premium black (forbidden) rice, rich in anthocyanins, with a deep purple-black colour and a mild nutty taste.' }),
  sku('black-rice-regular-milled-5-90-mm', 'Black Rice Regular Milled', 'Non-Basmati', 'Raw', 5.9, { hsn: '10063090', price: 525, blurb: 'Regular milled black rice sold in bulk for retailers and food processors, graded for uniform size and colour.' }),
  sku('purple-rice-6-20-mm', 'Purple Rice', 'Non-Basmati', 'Raw', 6.2, { hsn: '10063090', price: 540, blurb: 'Purple rice with natural pigments, soft texture when cooked and a subtle floral aroma.' }),
  sku('tricolour-rice-blend-6-30-mm', 'Tricolour Rice Blend', 'Non-Basmati', 'Raw', 6.3, { hsn: '10063090', price: 555, blurb: 'A ready blend of white, red and black rice, packed for premium retail and gourmet channels.' }),
  sku('red-glutinous-rice-5-00-mm', 'Red Glutinous Rice', 'Non-Basmati', 'Raw', 5.0, { hsn: '10063090', price: 570, blurb: 'Short-grain red glutinous (sticky) rice used for traditional sweets, dumplings and festival dishes.' }),
  sku('marsi-red-parboiled-rice-6-00-mm', 'Marsi Red Parboiled Rice', 'Non-Basmati', 'Parboiled', 6.0, { hsn: '10063090', price: 585, blurb: 'Marsi red parboiled rice with a robust grain and rustic taste, widely used in regional cuisines.' }),
  sku('mixed-whole-grain-rice-6-20-mm', 'Mixed Whole Grain Rice', 'Non-Basmati', 'Raw', 6.2, { hsn: '10062000', price: 600, blurb: 'A multi-colour whole-grain rice mix, packed for health-conscious consumers and wellness brands.' }),
];

// 29 countries are listed on the corridor page (Egypt appears under both regions), plus India.
const stats = [
  ['corridor', 'Countries in the AIM corridor', 30, ''],
  ['skus', 'Rice varieties listed', products.length + NEW_PRODUCTS.filter((p) => p.category === 'Rice').length, ''],
  ['tools', 'Free calculators & scorecards', 13, ''],
  ['women', 'Women AgroPreneurs by our goal', 1, 'M'],
].map(([key, label, value, suffix], order) => ({ key, label, value, suffix, order }));

await mongoose.connect(process.env.MONGODB_URI);
await Promise.all([Product.deleteMany({}), Offer.deleteMany({}), Stat.deleteMany({})]);
const docs = await Product.insertMany(products);
await importCatalogue(Product);
const by = Object.fromEntries(docs.map((d) => [d.slug, d]));

// Illustrative sample offers so the marketplace is never empty.
await Offer.insertMany([
  ['1121-steam-basmati-rice-8-35-mm', 'Sample Exports, Karnal', 'Nhava Sheva', 'Jebel Ali', 'FOB', 100, 985],
  ['1121-steam-basmati-rice-8-35-mm', 'Sample Rice Mills, Amritsar', 'Mundra', 'Dammam', 'CIF', 250, 990],
  ['pr-14-steam-6-90-mm', 'Sample Traders, Ludhiana', 'Kandla', 'Dar es Salaam', 'CIF', 120, 524],
  ['sona-masoori-steam-5-20-mm', 'Sample Foods, Guntur', 'Kolkata', 'Lagos', 'FOB', 500, 529],
  ['1121-golden-sella-basmati-rice-8-35-mm', 'Sample Agro, Kaithal', 'Mundra', 'Mombasa', 'CNF', 60, 960],
].map(([s, c, o, d, i, q, p]) => ({
  product: by[s]._id, sellerCompany: c, origin: o, destination: d, incoterm: i, quantityMT: q, priceUsdPerMT: p, status: 'live',
})));
await Stat.insertMany(stats);
console.log(`Seeded ${await Product.countDocuments()} products, 5 sample offers, ${stats.length} stats`);
await mongoose.disconnect();
