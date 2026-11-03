// "Sella" is a processing style that cuts across the Basmati / Non-Basmati families.
export const inGroup = (p, g) => (g === 'All' ? true : g === 'Sella' ? /sella/i.test(p.processing || '') : p.family === g);
export const priceLabel = (p) => (p.avgPriceUsd ? `US$ ${p.avgPriceUsd} / MT` : 'Price on request');
export const lengthLabel = (p) => `${Number(p.grain?.length || 0).toFixed(2)} mm`;
