import { createContext } from 'react';

// What each signed-in role may open inside its dashboard. Anything else shows "not part of your dashboard".
// Public paths are matched exactly or as a prefix (/rice also covers /rice/<slug>).
const INFO = ['/platform', '/corridor', '/trust', '/fraud-prevention', '/technology', '/about', '/why-us', '/team', '/manifesto', '/sustainability', '/contact', '/privacy', '/terms', '/documents'];
export const ACCESS = {
  buyer: { pages: ['/marketplace', '/rice', '/finance', '/for-buyers', '/tools', '/prompts'], tools: ['container', 'moisture', 'landed', 'lc', 'wc', 'early', 'bushel', 'trust', 'credit'], rfq: true },
  seller: { pages: ['/marketplace', '/rice', '/finance', '/for-sellers', '/tools', '/prompts'], tools: ['container', 'moisture', 'export', 'wc', 'margin', 'early', 'markup', 'shrink', 'bushel', 'trust', 'credit'] },
  partner: { pages: ['/partner', '/marketplace', '/rice', '/tools', '/prompts'], tools: ['container', 'landed', 'export', 'margin', 'markup', 'trust'] },
  agropreneur: { pages: ['/agropreneur', '/livelihood', '/tools', '/rice'], tools: ['moisture', 'shrink', 'markup', 'bushel', 'export', 'margin', 'credit'] },
  bank: { pages: ['/finance', '/lenders', '/marketplace', '/rice', '/tools'], tools: ['lc', 'wc', 'credit', 'trust', 'margin'] },
};
const hit = (list, path) => list.some((p) => path === p || path.startsWith(`${p}/`));
export const canOpen = (role, path) => !!ACCESS[role] && (hit(ACCESS[role].pages, path) || hit(INFO, path));

// Tools page reads this to show only the calculators this role needs (null = all, i.e. the public site)
export const ToolAccess = createContext(null);
