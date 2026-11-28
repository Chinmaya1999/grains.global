// "Sella" is a processing style that cuts across the Basmati / Non-Basmati families.
export const CATEGORIES = ['Rice', 'Grains', 'Pulses', 'Oilseeds', 'Onions', 'Spices'];
export const categoryOf = (p) => p.category || 'Rice';
export const isRice = (p) => categoryOf(p) === 'Rice';
export const productPath = (p) => `${isRice(p) ? '/rice' : '/products'}/${p.slug}`;
export const kindLabel = (p) => [isRice(p) ? p.family : categoryOf(p), p.processing].filter(Boolean).join(' · ');
export const inGroup = (p, g) => (g === 'All' ? true : g === 'Sella' ? /sella/i.test(p.processing || '') : CATEGORIES.includes(g) ? categoryOf(p) === g : p.family === g);
export const isRange = (p) => p.avgPriceUsd > 0 && p.avgPriceMaxUsd > p.avgPriceUsd;
const num = (n) => Number(n).toLocaleString('en-US');
export const priceAmount = (p) => (isRange(p) ? `${num(p.avgPriceUsd)}–${num(p.avgPriceMaxUsd)}` : num(p.avgPriceUsd)); // use only when avgPriceUsd > 0
export const priceLabel = (p) => (p.avgPriceUsd ? `US$ ${priceAmount(p)} / MT` : 'Price on request');
export const lengthLabel = (p) => (p.grain?.length ? `${Number(p.grain.length).toFixed(2)} mm` : '—');
