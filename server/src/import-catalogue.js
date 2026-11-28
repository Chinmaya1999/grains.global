// Adds the catalogue products to the database in MONGODB_URI without deleting users, offers, leads or prices.
import 'dotenv/config';
import mongoose from 'mongoose';
import { Product, Stat } from './models/index.js';
import { importCatalogue } from './catalogue.js';

await mongoose.connect(process.env.MONGODB_URI);
const { created, updated, missing } = await importCatalogue(Product);
const riceCount = await Product.countDocuments({ category: { $in: ['Rice', null] } });
await Stat.updateOne({ key: 'skus' }, { $set: { value: riceCount } });
console.log(`Catalogue: ${created} products added, ${updated} existing products updated, ${riceCount} rice varieties listed.`);
if (missing.length) console.log(`Not found (skipped): ${missing.join(', ')}`);
await mongoose.disconnect();
