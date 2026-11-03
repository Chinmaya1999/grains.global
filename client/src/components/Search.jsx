import { Fragment, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getProducts } from '../api.js';
import { priceLabel } from '../lib/format.js';
import { Icon } from './Art.jsx';

// [title, path, icon, keywords people might type]
const PAGES = [
  ['Trade finance', '/finance', 'bank', 'lc bg sblc invoice finance bank loan funding'],
  ['Calculators & scorecards', '/tools', 'calc', 'calculator tools landed cost moisture container bushel margin'],
  ['Landed-cost calculator', '/tools?tool=landed', 'calc', 'import cost duty freight insurance'],
  ['LC cost calculator', '/tools?tool=lc', 'calc', 'letter of credit fee usance'],
  ['Credit readiness score', '/tools?tool=credit', 'chart', 'credit score bank ready grade'],
  ['Trust score', '/tools?tool=trust', 'shield', 'trust score due diligence counterparty'],
  ['Partners & profit sharing', '/partner', 'handshake', 'global trading partner earn margin commission'],
  ['AgroPreneur program', '/agropreneur', 'sprout', 'women training farmers livelihood'],
  ['For buyers', '/for-buyers', 'cart', 'buy importer sourcing procurement'],
  ['For sellers', '/for-sellers', 'store', 'sell exporter list offer'],
  ['Banks & NBFCs', '/lenders', 'building', 'lender nbfc bank partner'],
  ['Digital Trade Corridor', '/corridor', 'compass', 'aim africa india middle east countries'],
  ['Trust framework', '/trust', 'lock', 'engineered trust verification kyc'],
  ['Fraud prevention', '/fraud-prevention', 'shield', 'fraud safety scam'],
  ['AI prompt library', '/prompts', 'doc', 'templates ai prompts chatgpt'],
  ['About us', '/about', 'building', 'company mission vision who we are'],
  ['Contact us', '/contact', 'mail', 'email whatsapp address office support help phone'],
  ['Create an account', '/account?mode=register', 'user', 'sign up register join'],
  ['Sign in', '/account', 'user', 'login log in account'],
];

const match = (hay, q) => q.toLowerCase().split(/\s+/).filter(Boolean).every((t) => hay.toLowerCase().includes(t));

export default function Search({ onClose }) {
  const nav = useNavigate();
  const [q, setQ] = useState('');
  const [products, setProducts] = useState([]);
  const [active, setActive] = useState(0);
  const [top, setTop] = useState(64);
  const input = useRef(null);

  useEffect(() => {
    getProducts().then(setProducts);
    input.current?.focus();
    const h = document.querySelector('.hdr')?.getBoundingClientRect();
    if (h) setTop(Math.max(8, h.bottom + 8));
  }, []);

  const items = useMemo(() => {
    const term = q.trim();
    const rice = (term ? products.filter((p) => match(`${p.name} ${p.family} ${p.processing} ${p.hsn} ${p.grain?.length}`, term)) : products.filter((p) => p.avgPriceUsd)).slice(0, term ? 6 : 4)
      .map((p) => ({ kind: 'Rice', icon: 'leaf', label: p.name, sub: `${p.family} · ${p.processing} · ${priceLabel(p)}`, to: `/rice/${p.slug}` }));
    const pages = (term ? PAGES.filter(([t, , , k]) => match(`${t} ${k}`, term)) : PAGES.slice(0, 5)).slice(0, 5)
      .map(([t, to, icon]) => ({ kind: 'Page', icon, label: t, sub: to.split('?')[0], to }));
    const all = term ? [{ kind: 'Search', icon: 'search', label: `Search all rice for “${term}”`, sub: 'Open the marketplace with this search', to: `/marketplace?q=${encodeURIComponent(term)}` }] : [];
    return [...all, ...rice, ...pages];
  }, [q, products]);

  useEffect(() => { setActive(0); }, [q]);
  const go = (it) => { if (it) { nav(it.to); onClose(); } };
  const key = (e) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); setActive((a) => Math.min(items.length - 1, a + 1)); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setActive((a) => Math.max(0, a - 1)); }
    else if (e.key === 'Enter') { e.preventDefault(); go(items[active]); }
    else if (e.key === 'Escape') { onClose(); }
  };
  useEffect(() => { document.getElementById(`sr-${active}`)?.scrollIntoView({ block: 'nearest' }); }, [active]);

  let lastKind = '';
  return (
    <>
      <div className="srch-bg" onMouseDown={onClose} />
      <div className="srch" style={{ top }} role="dialog" aria-label="Search the site" aria-modal="true">
        <div className="srch-in">
          <Icon n="search" size={20} />
          <input ref={input} value={q} onChange={(e) => setQ(e.target.value)} onKeyDown={key} placeholder="Search rice, tools, pages…" autoComplete="off" spellCheck="false"
            role="combobox" aria-expanded="true" aria-controls="srch-list" aria-activedescendant={`sr-${active}`} aria-label="Search" enterKeyHint="search" />
          {q && <button className="srch-clear" onClick={() => { setQ(''); input.current?.focus(); }} aria-label="Clear search"><Icon n="close" size={16} /></button>}
          <kbd>Esc</kbd>
        </div>
        <ul id="srch-list" role="listbox">
          {!q && <li className="srch-h" role="presentation">Popular</li>}
          {items.map((it, i) => {
            const head = it.kind !== lastKind && q ? <li className="srch-h" role="presentation" key={`h${i}`}>{it.kind === 'Search' ? '' : it.kind === 'Rice' ? 'Rice varieties' : 'Pages'}</li> : null;
            lastKind = it.kind;
            return (
              <Fragment key={it.to + it.label}>
                {head}
                <li role="presentation">
                  <div id={`sr-${i}`} role="option" aria-selected={i === active} className={`srch-it ${i === active ? 'on' : ''}`} onMouseEnter={() => setActive(i)} onMouseDown={(e) => { e.preventDefault(); go(it); }}>
                    <span className="srch-ic"><Icon n={it.icon} size={18} /></span>
                    <span className="srch-tx"><b>{it.label}</b><small>{it.sub}</small></span>
                    <Icon n="arrow" size={15} />
                  </div>
                </li>
              </Fragment>
            );
          })}
          {q && items.length <= 1 && <li className="srch-empty" role="presentation">No rice or pages match “{q}”. Try “basmati”, “sella” or “finance”.</li>}
        </ul>
        <div className="srch-foot"><span><kbd>↑</kbd><kbd>↓</kbd> to move</span><span><kbd>Enter</kbd> to open</span><span><kbd>/</kbd> to search anywhere</span></div>
      </div>
    </>
  );
}
