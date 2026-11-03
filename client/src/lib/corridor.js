export const ORIGINS = { mundra: { name: 'Mundra', lonlat: [69.7, 22.8] }, kolkata: { name: 'Kolkata', lonlat: [88.3, 22.6] } };

// `days` are rough sea-transit figures for illustration only, not a quoted schedule.
export const DESTS = [
  { id: 'jebel', region: 'me', name: 'Jebel Ali', country: 'UAE', origin: 'mundra', lonlat: [55.0, 25.0], days: 4 },
  { id: 'dammam', region: 'me', name: 'Dammam', country: 'Saudi Arabia', origin: 'mundra', lonlat: [50.1, 26.4], days: 5 },
  { id: 'jeddah', region: 'me', name: 'Jeddah', country: 'Saudi Arabia', origin: 'mundra', lonlat: [39.2, 21.5], days: 7 },
  { id: 'mombasa', region: 'africa', name: 'Mombasa', country: 'Kenya', origin: 'mundra', lonlat: [39.7, -4.0], days: 9 },
  { id: 'dar', region: 'africa', name: 'Dar es Salaam', country: 'Tanzania', origin: 'kolkata', lonlat: [39.3, -6.8], days: 14 },
  { id: 'durban', region: 'africa', name: 'Durban', country: 'South Africa', origin: 'mundra', lonlat: [31.0, -29.9], days: 16 },
  { id: 'lagos', region: 'africa', name: 'Lagos', country: 'Nigeria', origin: 'kolkata', lonlat: [3.4, 6.4], days: 28 },
];

// Rough outlines (lon, lat) of the three corridor regions. Stylised, not cartographic.
export const REGIONS = [
  [[-17, 21], [-10, 35], [10, 37], [32, 31], [34, 28], [43, 12], [51, 12], [40, -4], [40, -15], [35, -25], [20, -35], [18, -33], [12, -17], [9, -1], [8, 4], [-8, 4], [-17, 14]],
  [[35, 29], [39, 17], [43, 13], [52, 16], [59, 22], [56, 26], [50, 26], [48, 30], [40, 32]],
  [[26, 40], [44, 38], [55, 37], [61, 26], [56, 26], [48, 30], [40, 32], [36, 36]],
  [[68, 23], [72, 34], [80, 35], [88, 28], [97, 28], [92, 22], [87, 21], [80, 13], [77, 8], [73, 17], [70, 21]],
];
