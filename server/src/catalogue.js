// Product details from the two supplier catalogues (Nov 2026):
//   A = "Product Catalogue with Photos"   B = "Indian Agricultural Commodity Product Catalogue Specifications"
// All numbers are indicative; final limits are agreed in the buyer's specification.
// Existing rice SKUs only receive extra details (price and description are left alone). New products are created in full.

import { STOCK_PHOTOS } from './catalogue-photos.js';

const rows = (list) => list.map(([label, value]) => ({ label, value }));
const slug = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

/* ---------------- shared "general" parameters (B) ---------------- */
const BASMATI_GEN = [['Moisture', 'Typically maximum 12–14%; lower limits may be agreed for long storage'], ['Broken grains', 'Commonly 1–5% for premium grades'], ['Foreign matter', 'Typically maximum 0.1–0.5%, depending on grade'], ['Damaged / discoloured', 'Separate maximum; premium grades require tighter control']];
const NON_BASMATI_GEN = [['Moisture', 'Typically 14% maximum'], ['Broken grains', 'Commonly 5–25% depending on grade'], ['Foreign matter', 'Generally 0.5% maximum'], ['Damaged / discoloured', 'Controlled separately']];
const MAIZE_GEN = [['Moisture', 'Commonly 12–14%'], ['Foreign matter', 'Typically 1% maximum'], ['Damaged grains', 'Typically 3–5% maximum, depending on grade'], ['Mycotoxins', 'Aflatoxin and others tested to destination law and buyer limits'], ['Infestation / odour', 'No live insects; free from mould, heating and objectionable odour']];
const WHEAT_GEN = [['Moisture', 'Approximately 11–12.5%'], ['Protein', 'Commonly 10–13%'], ['Test weight', 'Around 75–80 kg/hl, subject to grade'], ['Foreign matter', 'Typically 1% maximum'], ['Damaged grains', 'Typically 2% maximum'], ['Condition', 'No live insects; free from mould, heating and objectionable odour']];
const PULSE_GEN = [['Moisture', 'Generally 10–12%'], ['Purity', 'Commonly 98–99.5%'], ['Foreign matter', 'Typically 0.5–1% maximum'], ['Damaged / discoloured', 'Often 1–2% maximum for premium whole pulses'], ['Broken grains', 'Often 1–2% maximum for whole pulses'], ['Infestation', 'No live insects, webbing or active infestation'], ['Food safety', 'Residues, mycotoxins and microbiology to destination and buyer requirements']];
const ONION_GEN = [['Size grades', '35–45, 45–55, 55–65 and 65 mm+ (other calibrations on request)'], ['Firmness', 'Firm, mature bulbs; not soft, spongy or water-soaked'], ['Outer skin', 'Dry, intact and sufficiently cured'], ['Sprouting', 'No visible sprouting in export-grade lots'], ['Rot / disease', 'Free from rotten bulbs, fungal decay and active disease'], ['Mechanical damage', 'No serious cuts, bruises, crushing or punctures'], ['Foreign matter', 'Free from soil, stones and plant debris']];

const RICE_PACK = ['5, 10, 20, 25, 40 and 50 kg food-grade bags', 'Retail packs or bulk'];
const BULK_PACK = ['25 / 50 kg bags', 'Jumbo bags or bulk shipment'];
const PULSE_PACK = ['500 g to 5 kg retail packs', '25 / 50 kg PP woven or laminated bulk bags'];
const ONION_PACK = ['5, 10, 20 or 25 kg ventilated mesh or jute bags', 'Net weight clearly marked'];
const OIL_PACK = ['25 / 50 kg bags with food-grade or moisture-barrier liners', 'Bulk where suitable'];

// General rows are added only where the product has no row of its own with the same name.
const merge = (own, general = []) => rows([...own, ...general.filter(([k]) => !own.some(([o]) => o === k))]);

const item = (category, name, blurb, own, general, packaging, extra = {}) => ({
  slug: slug(name), name, category, blurb, hsn: '', avgPriceUsd: 0, incoterms: ['FOB', 'CIF', 'CNF'], packaging,
  specs: merge(own, general), ...extra,
});
const rice = (family, name, blurb, own, extra = {}) =>
  item('Rice', name, blurb, own, family === 'Basmati' ? BASMATI_GEN : NON_BASMATI_GEN, RICE_PACK, { family, hsn: family === 'Basmati' ? '10063020' : '', ...extra });

/* ---------------- details for rice SKUs already on the site ---------------- */
const add = (slugs, details) => slugs.map((s) => ({ slug: s, ...details }));

const R1121 = {
  specs: merge([['Grain type', 'Extra-long, slender, aromatic'], ['Grain length (uncooked)', '8.3–8.4 mm and above'], ['Cooked length', 'Elongates 2.5–3 times, about 19–24 mm'], ['Texture (cooked)', 'Fluffy, light, non-sticky'], ['Aroma', 'Strong, rich natural basmati fragrance'], ['Moisture', 'Typically 12–13% maximum'], ['Broken grains', '1–2% maximum for premium grades'], ['Foreign matter', 'Usually 0.5% maximum']], BASMATI_GEN),
  nutrition: rows([['Calories', 'about 356 kcal'], ['Carbohydrates', 'about 80 g'], ['Protein', 'about 7 g'], ['Total fat', 'about 1 g'], ['Dietary fibre', 'about 1 g'], ['Sodium', '0 mg'], ['Glycaemic index', '50–58']]),
};
const R1509_SELLA = {
  specs: merge([['Grain type', 'Long-grain, slender, pointed basmati'], ['Grain length (average)', '8.30–8.45 mm'], ['Colour', 'Creamy white or golden, depending on parboiling'], ['Aroma', 'Natural basmati fragrance, milder than 1121'], ['Cooking', 'Separate, fluffy, non-sticky; elongates up to twice'], ['Moisture', '12–13% maximum'], ['Broken grains', '1–2% maximum'], ['Damaged / discoloured', '0.5–1% maximum'], ['Foreign matter', 'Nil to 0.5% maximum']]),
  features: ['Parboiled (sella) for firm grains that stay separate', 'Suited to biryani, pulao and layered rice dishes', 'Suited to large-scale food service'],
};
const R1509_STEAM = {
  specs: merge([['Grain length (average)', '8.30–8.45 mm'], ['Cooking', 'Elongates almost double; non-sticky and fluffy'], ['Purity', '92–96% minimum'], ['Broken grains', '1–2% maximum'], ['Moisture', '12.5–13% maximum'], ['Colour', 'White to creamy white'], ['Texture', 'Soft'], ['Aroma', 'Nutty and floral'], ['Origin', 'Punjab, Haryana and Uttar Pradesh'], ['Shelf life', '12–24 months'], ['Certifications', 'FSSAI, APEDA, Phytosanitary, US FDA (export quality)']]),
  features: ['Paddy is steamed before milling, giving a firm, non-sticky grain', 'Early-maturing Pusa Basmati 1509, harvested in about 115–120 days', 'Suited to biryani and pilaf'],
};
const R1718 = { specs: merge([['Grain type', 'Long, slender aromatic grain'], ['Grain length and elongation', 'As per grade'], ['Broken grains', 'Commonly 1–5%'], ['Condition', 'Clean, uniform and free from live insects']], BASMATI_GEN) };
const R1401 = { specs: merge([['Grain type', 'Aromatic long-grain'], ['Uniformity', 'Uniform grain length and slenderness'], ['Broken / admixture', 'Within agreed limits']], BASMATI_GEN) };
const SONA = {
  image: 'catalogue/sona-masoori-steam',
  specs: rows([['Grain type', 'Medium-grain, non-basmati'], ['Colour', 'Off-white or creamy white, fully polished'], ['Grain length (average)', '5.0–5.5 mm'], ['Texture (cooked)', 'Soft, non-sticky, slightly fluffy'], ['Aroma', 'Mild, natural'], ['Moisture', '13–14% maximum'], ['Broken grains', '2–5% maximum, by grade'], ['Purity', '95% minimum, about 5% natural admixture'], ['Foreign matter', 'Nil or 0.5% maximum'], ['Sortex', 'Typically 100% sortex cleaned'], ['Origin', 'Andhra Pradesh, Telangana and Karnataka']]),
  nutrition: rows([['Calories', 'about 360 kcal'], ['Carbohydrates', 'about 79 g'], ['Protein', 'about 7 g'], ['Total fat', 'about 0.5 g'], ['Dietary fibre', 'about 1 g'], ['Cholesterol / sodium', '0 mg / 1 mg']]),
  features: ['Steamed before milling for a firmer, less sticky grain', 'Light and easy to digest', 'Suited to daily meals, biryani, pulao, idli and curd rice', 'Gluten-free, non-GMO, no preservatives'],
};

export const DETAILS = [
  ...add(['1121-steam-basmati-rice-8-35-mm'], { ...R1121, image: 'catalogue/1121-basmati' }),
  ...add(['1121-golden-sella-basmati-rice-8-35-mm', '1121-white-sella-basmati-rice-8-35-mm'], R1121),
  ...add(['1509-golden-sella-basmati-rice-8-40-mm'], { ...R1509_SELLA, image: 'catalogue/1509-sella' }),
  ...add(['1509-white-sella-basmati-rice-8-40-mm'], R1509_SELLA),
  ...add(['1509-steam-basmati-rice-8-40-mm'], { ...R1509_STEAM, image: 'catalogue/1509-steam' }),
  ...add(['1718-steam-basmati-rice-8-40-mm', '1718-golden-sella-basmati-rice-8-35-mm', '1718-white-sella-basmati-rice-8-35-mm'], R1718),
  ...add(['1401-steam-basmati-rice-7-70-mm', '1401-white-sella-basmati-rice-7-70-mm'], R1401),
  ...add(['sona-masoori-steam-5-20-mm'], SONA),
];

/* ---------------- new rice ---------------- */
const NEW_RICE = [
  rice('Non-Basmati', 'IR64 Steam Rice', 'Popular long-grain non-basmati rice with a firm texture, well suited to bulk consumption and international trade.',
    [['Grain type', 'Long-grain, non-basmati'], ['Colour', 'Creamy white to light golden or pale yellow'], ['Grain length (average)', '5.8–6.2 mm; premium grades may be longer'], ['Texture (cooked)', 'Soft, firm, non-sticky, fluffy'], ['Aroma', 'Mild, natural'], ['Moisture', '14% maximum'], ['Broken grains', '5% maximum for premium; 10%, 25% and 100% broken available'], ['Purity', '95% minimum, by grade'], ['Foreign matter', 'Nil or 0.5% maximum'], ['Sortex', '100% sortex-cleaned available'], ['Milling', 'Well-milled, polished or double-polished'], ['Origin', 'Andhra Pradesh, Telangana, Karnataka and other regions']],
    {
      processing: 'Steam', image: 'catalogue/ir64-steam', packaging: ['25 / 50 kg PP woven bags', 'Customised packaging'],
      nutrition: rows([['Calories', '350–360 kcal'], ['Carbohydrates', '77–80 g'], ['Protein', '6–8 g'], ['Total fat', '0.5–1 g'], ['Dietary fibre', '1–2 g'], ['Cholesterol', '0 mg']]),
      features: ['Steaming or parboiling strengthens the grain and reduces breakage', 'Cooks firm and separate, suited to large-scale food service', 'Naturally gluten-free, vegetarian and vegan', 'Store cool and dry, away from sunlight'],
    }),
  rice('Basmati', 'Traditional Basmati Rice', 'Traditional long, slender basmati with a classic aromatic profile.', [['Grain type', 'Long, slender, traditional aromatic'], ['Authenticity', 'Variety, aroma, length, elongation and texture specified by grade']]),
  rice('Basmati', 'Basmati 386 Rice', 'Traditional commercial basmati variety.', [['Grain type', 'Traditional commercial basmati'], ['Uniformity', 'Uniform grain and aroma']]),
  rice('Basmati', 'Pusa Basmati 1885 / 1847 Rice', 'Improved basmati varieties, approved by the buyer before shipment.', [['Grain type', 'Improved basmati varieties'], ['Approval', 'Variety identity, grain profile, aroma and cooking quality approved before shipment']]),
  rice('Non-Basmati', 'IR36 Rice', 'Medium or slender non-basmati rice, raw or parboiled.', [['Grain type', 'Medium or slender; raw or parboiled'], ['Defects', 'Damaged, chalky and discoloured grains specified']]),
  rice('Non-Basmati', 'Swarna Rice', 'Medium to slender commercial non-basmati rice.', [['Grain type', 'Medium / slender commercial grain']]),
  rice('Non-Basmati', 'HMT / Ponni / Kolam Rice', 'Regional short and medium-grain rice varieties.', [['Grain type', 'Regional short or medium grain'], ['Approval', 'Variety identity and cooking characteristics to approved sample']]),
  rice('Non-Basmati', 'PR 11 / Parmal Rice', 'Commercial long or medium-grain non-basmati rice.', [['Grain type', 'Long or medium grain; raw or parboiled'], ['Specify', 'Grain length, form, moisture, broken percentage and chalkiness']]),
  rice('Non-Basmati', 'Jeera Samba / Gobindobhog / Kalanamak Rice', 'Speciality small and short-grain aromatic rice.', [['Grain type', 'Speciality short-grain aromatic'], ['Approval', 'Aroma, identity, purity and cooking characteristics to approved sample']]),
];

/* ---------------- grains: wheat and maize ---------------- */
const grains = (name, blurb, own, general, extra) => item('Grains', name, blurb, own, general, BULK_PACK, extra);
const GRAINS = [
  grains('Wheat (Gehu)', 'Food-grade Indian wheat for atta, maida, suji, bread, biscuits and other bakery products.',
    [['Grain type', 'Hard or medium-hard food-grade wheat'], ['Colour', 'Golden yellow to amber'], ['Grain shape', 'Oval to elongated, plump'], ['Grain length (average)', '5.5–7.0 mm'], ['Moisture', '12–12.5% maximum; up to 14% on buyer request'], ['Foreign matter', '0.5–1% maximum, by grade'], ['Other food grains', '1–2% maximum'], ['Weevilled grains', 'Nil or within buyer limits'], ['Purity', '98–99% sound grains (premium)'], ['Test weight', '75–80 kg/hl'], ['Processing', 'Cleaned, graded, machine-sorted'], ['Origin', 'Gujarat, Madhya Pradesh, Uttar Pradesh, Rajasthan, Punjab and Haryana']], WHEAT_GEN,
    {
      image: 'catalogue/wheat', packaging: ['25 / 50 kg PP woven bags', 'Bulk supply as required'],
      nutrition: rows([['Calories', '330–340 kcal'], ['Carbohydrates', '70–72 g'], ['Protein', '11–13 g'], ['Total fat', '1.5–2.5 g'], ['Dietary fibre', '10–12 g'], ['Cholesterol', '0 mg']]),
      features: ['Good water absorption, dough development and elasticity', 'Used by flour mills, bakeries, biscuit and pasta makers', 'Contains gluten; not suitable for coeliac disease or gluten intolerance', 'Pre-shipment inspection to agreed specification'],
      grades: ['Premium food-grade', 'Milling-grade', 'Medium-hard', 'Hard', 'FAQ / feed-grade (separate specification)'],
    }),
  grains('Sharbati Wheat', 'Milling and food-grade Sharbati wheat.', [['Specify', 'Protein, moisture, test weight, gluten, falling number and kernel defects']], WHEAT_GEN),
  grains('Lokwan Wheat', 'Commercial milling wheat.', [['Specify', 'Protein, moisture, test weight, foreign matter, damaged and shrivelled grains']], WHEAT_GEN),
  grains('HD-2967 / HD-3086 Wheat', 'Named wheat varieties supplied to buyer milling requirements.', [['Specify', 'Variety, moisture, protein, test weight and milling quality']], WHEAT_GEN),
  grains('PBW-343 / DBW-187 Wheat', 'Milling wheat varieties.', [['Test', 'Protein, moisture, test weight, falling number, gluten and defects']], WHEAT_GEN),
  grains('Yellow Maize', 'Yellow maize for feed, food and industrial use, to destination-country requirements.',
    [['Colour', 'Bright / golden yellow'], ['Moisture', '12–14% maximum'], ['Total aflatoxin', '20 ppb maximum'], ['Foreign matter', '1–2% maximum'], ['Broken kernels', '2–4% maximum'], ['Damaged kernels', '2–5% maximum'], ['Weevilled grains', '1–2% maximum'], ['Admixture', '2% maximum'], ['Purity', '98–99% minimum'], ['Protein', '7–9% minimum'], ['GMO status', 'Non-GMO options often available on request']], MAIZE_GEN,
    {
      image: 'catalogue/yellow-maize', packaging: ['50 kg new PP woven bags', 'Jumbo bags (1 t+) or bulk'],
      features: ['Feed-grade and food-grade specifications differ', 'Pesticide residue and mycotoxin limits follow the destination country', 'Certifications such as FSSAI, ISO and APEDA', 'Third-party quality and weight inspection (for example SGS)'],
    }),
  grains('White Maize', 'Uniform white or cream maize.', [['Colour', 'Uniform white / cream'], ['Moisture', '12–14%'], ['Foreign matter', '1% maximum']], MAIZE_GEN),
  grains('Flint Maize', 'Hard, vitreous maize kernels.', [['Kernels', 'Hard and vitreous'], ['Moisture', '12–14%']], MAIZE_GEN),
  grains('Animal-Feed Maize', 'Maize supplied to feed-buyer requirements.', [['Specify', 'Moisture, test weight, broken and damaged kernels, foreign matter, mycotoxins and residues']], MAIZE_GEN),
  grains('Food-Grade Maize', 'Maize with tighter food-safety requirements.', [['Requirements', 'Tighter control of cleanliness, odour, infestation, mycotoxins, residues and microbiology']], MAIZE_GEN),
  grains('Maize Grits / Flour', 'Processed maize products.', [['Specify', 'Particle size, moisture, colour, ash, microbiological quality and packaging']]),
];

/* ---------------- pulses ---------------- */
const pulse = ([name, form, spec]) => item('Pulses', name, form, [['Form', form], ['Product specification', spec]], PULSE_GEN, PULSE_PACK);
const PULSES = [
  ['Desi Chickpeas (Kala Chana)', 'Whole brown or dark brown chickpeas.', 'Moisture 10–12%; purity 98–99%; foreign matter 0.5–1% maximum; uniform size and colour'],
  ['Kabuli Chickpeas', 'Cream or ivory whole chickpeas, size-graded.', 'Moisture 10–12%; diameter or count per 100 g agreed; purity 98–99% minimum'],
  ['Pigeon Peas (Toor / Arhar)', 'Whole or split dal.', 'Moisture 10–12%; uniform colour; split dal low in husk and powder'],
  ['Green Gram (Whole Moong)', 'Whole green seed.', 'Moisture 10–12%; uniform green colour; low admixture and damage'],
  ['Split Green Gram (Moong Dal)', 'Split, dehulled.', 'Uniform yellow split; low powder, husk and broken fragments'],
  ['Black Gram (Whole Urad)', 'Whole black seed.', 'Moisture 10–12%; uniform black coat; low admixture'],
  ['Split Black Gram (Urad Dal)', 'White split, dehulled.', 'Uniform white or cream split; low husk and powder'],
  ['Red Lentils (Masoor)', 'Whole or split.', 'Moisture 10–12%; uniform red, orange or brown colour'],
  ['Green Lentils', 'Whole green lentils.', 'Moisture 10–12%; size, purity and damage limits by grade'],
  ['Yellow Peas', 'Whole dried peas.', 'Moisture 10–12%; uniform yellow colour and round shape'],
  ['White Peas', 'Whole dried white peas.', 'Moisture 10–12%; uniform white or cream colour'],
  ['Cowpeas (Lobia)', 'White, red and other types.', 'Moisture 10–12%; uniform colour and size'],
  ['Black-Eyed Peas (Chawli)', 'Cream seed with a dark eye.', 'Moisture 10–12%; uniform colour and eye marking'],
  ['Kidney Beans (Rajma)', 'Red, speckled or white beans.', 'Moisture 10–12%; uniform variety and colour; low splits'],
  ['Moth Beans (Matki)', 'Small brown beans.', 'Moisture 10–12%; clean, uniform seeds'],
  ['Horse Gram (Kulthi)', 'Brown or dark seeds.', 'Moisture 10–12%; uniform seed; low foreign matter'],
].map(pulse);

/* ---------------- oilseeds ---------------- */
const oil = (name, blurb, own, general = [], packaging = OIL_PACK) => item('Oilseeds', name, blurb, own, general, packaging);
const NUT = [['Moisture', 'Approximately 5–7%'], ['Foreign matter', 'Typically 0.5% maximum'], ['Damaged / discoloured', 'Commonly 1–2% maximum'], ['Oil content', 'Approximately 40–50%'], ['Aflatoxin', 'Tested to destination limits']];
const NUT_PACK = ['25 kg food-grade bags', 'Vacuum or barrier packaging'];
const SES = [['Moisture', 'Approximately 5–7%'], ['Purity', 'Often 98–99.95%'], ['Foreign matter', 'Commonly 0.1–0.5% maximum'], ['Oil content', 'Approximately 45–55%'], ['Food safety', 'Salmonella and residue limits to destination requirements']];
const SES_PACK = ['25 kg food-grade lined bags with moisture barrier'];
const OILSEEDS = [
  oil('Java Groundnut Kernels', 'Shelled Java type groundnut kernels.', [['Size', 'Size / count grade declared']], NUT, NUT_PACK),
  oil('Bold Groundnut Kernels', 'Larger groundnut kernel type.', [['Specify', 'Count per ounce or per 100 g, size uniformity, splits and skin condition']], NUT, NUT_PACK),
  oil('TJ / Spanish Groundnut Kernels', 'TJ and Spanish type kernels.', [['Specify', 'Kernel count, colour, size, splits and defect tolerances']], NUT, NUT_PACK),
  oil('Blanched Groundnut Kernels', 'Groundnut kernels with the skin removed.', [['Specify', 'Blanching quality, residual skin, splits and microbiological criteria']], NUT, NUT_PACK),
  oil('Natural White Sesame Seeds', 'White or ivory natural sesame.', [['Colour', 'White / ivory']], SES, SES_PACK),
  oil('Natural Black Sesame Seeds', 'Uniform black sesame.', [['Colour', 'Uniform black']], SES, SES_PACK),
  oil('Brown Sesame Seeds', 'Uniform brown sesame.', [['Colour', 'Uniform brown']], SES, SES_PACK),
  oil('Hulled Sesame Seeds', 'Sesame with the husk removed.', [['Specify', 'Colour, residual hull, microbiological status and seed integrity']], SES, SES_PACK),
  oil('Soybeans', 'Indian soybeans.', [['Moisture', 'Approximately 10–12%'], ['Protein', 'Approximately 35–40%'], ['Oil content', 'Approximately 18–20%'], ['Foreign matter', 'Typically 1% maximum'], ['GMO status', 'Declared and tested where required']]),
  oil('Yellow Mustard Seeds', 'Uniform yellow mustard seed.', [['Moisture', '7–9%'], ['Purity', 'Often 98–99%'], ['Foreign matter', '1% maximum'], ['Oil content', 'Around 35–40%']]),
  oil('Brown / Black Mustard Seeds', 'Brown and black mustard seed.', [['Moisture', '7–9%'], ['Oil content', 'Around 35–40%'], ['Purity / admixture', 'As agreed']]),
  oil('Rapeseed', 'Rapeseed to end-use requirements.', [['Moisture', '7–9%'], ['Oil profile', 'Oil content, erucic acid and glucosinolates as required']]),
  oil('Oil-Grade Sunflower Seeds', 'Sunflower seed for oil extraction.', [['Moisture', '7–9%'], ['Foreign matter', '1% maximum'], ['Oil content', 'Often 35–45%']]),
  oil('Confectionery Sunflower Seeds', 'Uniform large sunflower seed.', [['Specify', 'Kernel size, stripe colour, shell integrity, empty seeds, moisture and microbiology']]),
  oil('Flaxseed / Linseed', 'Golden or brown flaxseed.', [['Appearance', 'Golden or brown; clean and uniform'], ['Moisture', 'Approximately 7–9%'], ['Purity', 'Commonly 98–99%'], ['Foreign matter', 'Typically 1% maximum'], ['Oil content', 'Approximately 35–45%']]),
  oil('Castor Seeds', 'Dry, mature castor seed. Requires appropriate safety and handling controls.', [['Moisture', 'Commonly 6–8%'], ['Purity', 'Minimum purity and maximum foreign matter agreed'], ['Condition', 'Free from mould, heating and infestation'], ['Handling', 'Safety controls required for seed and by-products']]),
  oil('Niger Seeds', 'Indian niger seed.', [['Moisture', 'Commonly 7–9%'], ['Specify', 'Purity, oil content, foreign matter, colour and infestation']]),
  oil('Safflower Seeds', 'Oil, food or feed-grade safflower.', [['Specify', 'Grade, moisture, purity, oil content, foreign matter and damaged seeds']]),
  oil('Cottonseed', 'Fuzzy or delinted cottonseed.', [['Specify', 'Form, moisture, purity, oil content, trash and damaged seed']]),
];

/* ---------------- onions ---------------- */
const onion = (name, blurb, own, extra) => item('Onions', name, blurb, own, ONION_GEN, ONION_PACK, extra);
const ONIONS = [
  onion('Red Onion / Garva Onion', 'Grade A red and Garva (pink) onions, predominantly from the Nashik region of Maharashtra.',
    [['Quality grade', 'A grade; fresh, non-sprouted, firm, free from pests and disease'], ['Origin', 'Maharashtra, mainly Nashik'], ['Size / diameter', '25–80 mm+; common export grades 40–60, 50–70 and 60–80 mm'], ['Size grades', 'Other calibrations on request'], ['Colour', 'Red, pink or reddish-brown'], ['Flavour', 'Pungent (red) to sweet and mild (Garva)'], ['Shelf life', '30 days up to 2–3 months in cool, dry, ventilated storage'], ['Seasonality', 'Year-round from two crop cycles']],
    {
      image: 'catalogue/red-onion', packaging: ['Mesh / leno, jute or PP bags', '1, 2, 5, 10, 20, 25 and 50 kg', 'Cartons or crates for retail packs', 'Reefer or open dry containers'],
      features: ['Red onion: vibrant red skin, high pungency, for salads, curries and pickles', 'Garva (pink) onion: milder and sweeter; the name often refers to the summer crop'],
    }),
  ...[
    ['Nashik Red Onion', 'Red-skinned commercial onion.', 'Bulb size, firmness, dry neck, cured skin and colour uniformity'],
    ['Lasalgaon Red Onion', 'Commercial red onion type.', 'Uniform grading, dryness, firmness, sprouting and rot tolerance'],
    ['Bhima Red Onion', 'Red onion variety.', 'Bulb size, colour, firmness and storage condition'],
    ['Bhima Shakti / Bhima Super Onion', 'Red onion varieties.', 'Uniform size and shape; dry skin; no sprouting or rot'],
    ['Agrifound Dark Red Onion', 'Deep-red variety.', 'Deep-red colour, firm bulb, dry outer skin and size grading'],
    ['Agrifound Light Red Onion', 'Light-red variety.', 'Colour uniformity, firmness, curing and defect control'],
    ['Pusa Red Onion', 'Red onion variety.', 'Bulb size, shape, skin condition, curing and storage quality'],
    ['White Onion (Pusa White)', 'White-skinned onion.', 'White colour, firmness, dry outer skin, size and cleanliness'],
  ].map(([n, b, s]) => onion(n, b, [['Specification focus', s]])),
];

/* ---------------- spices ---------------- */
const SPICES = [
  item('Spices', 'Cumin Seeds (Jeera)', 'Indian whole cumin from Gujarat and Rajasthan with a warm, earthy aroma and natural essential oils.',
    [['Botanical name', 'Cuminum cyminum'], ['Colour', 'Greyish-brown to greenish-brown'], ['Seed shape', 'Elongated, narrow, slightly curved'], ['Seed length', '3–6 mm'], ['Flavour', 'Aromatic, slightly bitter, warm'], ['Moisture', '8–10% maximum'], ['Foreign matter', '0.5–1% maximum'], ['Purity', '98–99% minimum for premium export grades'], ['Insect infestation', 'Nil'], ['Essential oil', 'About 2–4%'], ['Processing', 'Cleaned, graded, machine-sorted; 100% sortex available'], ['Origin', 'India: Gujarat / Rajasthan']], [],
    ['25 / 50 kg PP woven bags', 'Customised packaging'],
    {
      image: 'catalogue/cumin-seeds',
      nutrition: rows([['Calories', 'about 375 kcal'], ['Carbohydrates', 'about 44 g'], ['Protein', 'about 18 g'], ['Total fat', 'about 22 g'], ['Dietary fibre', '10–11 g'], ['Iron', 'about 66 mg'], ['Calcium', 'about 930 mg'], ['Cholesterol', '0 mg']]),
      features: ['For spice blends, curry powders, pickles, seasoning mixes and bakery', 'Naturally gluten-free, vegetarian and vegan when pure', 'Store cool and dry, away from sunlight and strong odours', 'Pre-shipment inspection to agreed specification'],
      grades: ['Premium export quality', 'Singapore quality', 'Europe quality', 'Machine-cleaned', 'Sortex-cleaned', 'Bold (subject to availability)'],
    }),
];

// Supplier catalogue photos win; other products get a representative stock photo where one exists.
export const NEW_PRODUCTS = [...NEW_RICE, ...GRAINS, ...PULSES, ...OILSEEDS, ...ONIONS, ...SPICES]
  .map((p) => (!p.image && STOCK_PHOTOS[p.slug] ? { ...p, image: `catalogue/stock/${STOCK_PHOTOS[p.slug]}` } : p));

// Safe to run repeatedly: never deletes anything, and never overwrites a price or description someone has edited.
export async function importCatalogue(Product) {
  let created = 0, updated = 0;
  const missing = [];
  for (const { slug: s, ...details } of DETAILS) {
    const r = await Product.updateOne({ slug: s }, { $set: details });
    if (r.matchedCount) updated += 1; else missing.push(s);
  }
  for (const p of NEW_PRODUCTS) {
    const r = await Product.updateOne({ slug: p.slug }, { $setOnInsert: p }, { upsert: true, setDefaultsOnInsert: false });
    if (r.upsertedCount) created += 1;
    // products imported before they had a photo get one now; a photo already set is never replaced
    else if (p.image) await Product.updateOne({ slug: p.slug, image: null }, { $set: { image: p.image } });
  }
  return { created, updated, missing };
}
