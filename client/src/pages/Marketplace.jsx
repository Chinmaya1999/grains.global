import { useEffect, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Icon, ProductPhoto } from '../components/Art.jsx';
import LeadForm from '../components/LeadForm.jsx';
import { getProducts, getOffers } from '../api.js';
import { inGroup, priceAmount, isRange, productPath, kindLabel, categoryOf, isRice, CATEGORIES } from '../lib/format.js';
import { productImage } from '../lib/content.js';
import './marketplace.css';

const RICE_TYPES = ['Basmati', 'Non-Basmati', 'Sella'];
const GROUPS = ['All', ...CATEGORIES, ...RICE_TYPES];
const SORTS = [['default', 'Recommended'], ['name', 'Name A–Z'], ['low', 'Price: low to high'], ['high', 'Price: high to low']];
const PAGE = 24; // products added by each "Show more"
const PREVIEW = 4; // products per category on the "All" overview

// products without a price always go last when sorting by price
const byPrice = (dir) => (a, b) => (!a.avgPriceUsd) - (!b.avgPriceUsd) || dir * (a.avgPriceUsd - b.avgPriceUsd);
const SORTERS = { name: (a, b) => a.name.localeCompare(b.name), low: byPrice(1), high: byPrice(-1) };

const haystack = (p) => `${p.name} ${kindLabel(p)} ${isRice(p) ? 'rice' : ''} ${p.hsn || ''} ${p.grain?.length || ''}`.toLowerCase();

function Facts({ p }) {
  if (!p.grain?.length) return <p className="mkc-blurb">{p.blurb}</p>;
  return (
    <ul className="mkc-facts">
      <li>{Number(p.grain.length).toFixed(2)} mm</li>
      <li>&lt;{p.grain.broken}% broken</li>
      <li>&lt;{p.grain.moisture}% moisture</li>
    </ul>
  );
}

function Card({ p, onQuote }) {
  return (
    <article className="mkc">
      <ProductPhoto name={productImage(p)} alt={p.name} className="mkc-ph" />
      <div className="mkc-body">
        <small className="mkc-kind">{kindLabel(p)}</small>
        {/* the title link stretches over the whole card, so anywhere on it opens the product */}
        <h3><Link to={productPath(p)}>{p.name}</Link></h3>
        <Facts p={p} />
        <div className="mkc-foot">
          {p.avgPriceUsd
            ? <p className="mkc-price"><b>${priceAmount(p)}</b><span>{isRange(p) ? 'per MT' : 'per MT, average'}</span></p>
            : <p className="mkc-price none"><b>On request</b><span>Ask for today’s price</span></p>}
          <button type="button" onClick={() => onQuote(p)} aria-label={`Get a quote for ${p.name}`}>Get quote</button>
        </div>
      </div>
    </article>
  );
}

function QuoteFields() {
  return (
    <>
      <label>Quantity (MT)<input name="quantityMT" type="number" min="1" /></label>
      <label>Target price (USD/MT)<input name="targetPriceUsd" type="number" min="0" step="any" /></label>
      <label>Incoterm<select name="incoterm"><option>FOB</option><option>CIF</option><option>CNF</option><option>EXW</option></select></label>
      <label>Destination port / country<input name="destination" /></label>
      <label>Packaging<select name="packaging"><option>25 kg bags</option><option>50 kg bags</option><option>1 MT jumbo bags</option><option>1 / 5 / 10 kg consumer packs</option><option>20 ft container, bulk</option><option>Private label</option></select></label>
      <label>Payment terms<select name="paymentTerms"><option>LC at sight</option><option>LC 30 / 60 / 90 days</option><option>TT advance</option><option>TT against documents</option><option>Documents against payment (DP)</option><option>Open account</option></select></label>
    </>
  );
}

function QuoteDialog({ product, onClose }) {
  const ref = useRef(null);
  useEffect(() => { if (product && !ref.current.open) ref.current.showModal(); }, [product]);
  return (
    // a click on the dialog element itself is a click on the dimmed backdrop
    <dialog ref={ref} className="mk-dialog" onClose={onClose} onClick={(e) => e.target === ref.current && ref.current.close()} aria-label="Request a quote">
      {product && (
        <div className="mk-dialog-in">
          <header>
            <ProductPhoto name={productImage(product)} alt="" className="mk-dialog-ph" />
            <div><small>Request a quote</small><h2>{product.name}</h2><p>{product.avgPriceUsd ? `$${priceAmount(product)} per MT` : 'Price on request'}</p></div>
            <button type="button" onClick={() => ref.current.close()} aria-label="Close"><Icon n="close" size={18} /></button>
          </header>
          <LeadForm key={product.slug} role="buyer" cta="Send request" extra={<><input type="hidden" name="productSlug" value={product.slug} /><QuoteFields /></>} />
        </div>
      )}
    </dialog>
  );
}

export default function Marketplace() {
  const [products, setProducts] = useState(null);
  const [offers, setOffers] = useState([]);
  const [quote, setQuote] = useState(null);
  const [limit, setLimit] = useState(PAGE);
  const [stickyTop, setStickyTop] = useState(0);
  const [params, setParams] = useSearchParams();
  const results = useRef(null);

  useEffect(() => { getProducts().then(setProducts); getOffers().then(setOffers); }, []);
  useEffect(() => {
    // the toolbar sticks just below the site header, whose height differs between screens (the dashboard has none)
    const measure = () => setStickyTop(document.querySelector('.hdr')?.offsetHeight || 0);
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, []);

  // filters live in the address bar, so they can be shared and the Back button works
  const group = GROUPS.includes(params.get('family')) ? params.get('family') : 'All';
  const sort = SORTERS[params.get('sort')] ? params.get('sort') : 'default';
  const view = params.get('view') === 'list' ? 'list' : 'grid';
  const q = params.get('q') || '';

  const update = (changes, replace = true) => {
    const next = new URLSearchParams(params);
    Object.entries(changes).forEach(([k, v]) => (v ? next.set(k, v) : next.delete(k)));
    setParams(next, { replace, preventScrollReset: true });
    setLimit(PAGE);
  };
  const choose = (g) => {
    update({ family: g === 'All' ? '' : g }, false);
    // if the visitor has scrolled far down, bring the new results into view
    if (results.current?.getBoundingClientRect().top < 0) results.current.scrollIntoView({ behavior: 'smooth' });
  };
  const reset = () => update({ family: '', q: '', sort: '' }, false);

  const all = products || [];
  const terms = q.toLowerCase().split(/\s+/).filter(Boolean);
  const matching = all.filter((p) => terms.every((t) => haystack(p).includes(t)));
  const count = (g) => matching.filter((p) => inGroup(p, g)).length;
  const shown = matching.filter((p) => inGroup(p, group));
  if (sort !== 'default') shown.sort(SORTERS[sort]);
  const overview = group === 'All' && !q && sort === 'default';
  const riceOpen = group === 'Rice' || RICE_TYPES.includes(group);
  // a picture for each category button: its first product that has a photo
  const thumb = (g) => productImage(all.find((p) => inGroup(p, g) && productImage(p)) || {});

  const grid = (list) => <div className={`mk-grid ${view}`}>{list.map((p) => <Card key={p.slug} p={p} onQuote={setQuote} />)}</div>;
  const catButton = (g) => (
    <button key={g} type="button" className={group === g || (g === 'Rice' && riceOpen) ? 'on' : ''} aria-pressed={group === g} onClick={() => choose(g)}>
      <span className="mk-thumb">{g !== 'All' && all.length > 0 && thumb(g) ? <img src={`/images/${thumb(g)}.jpg`} alt="" loading="lazy" /> : <Icon n="leaf" size={18} />}</span>
      <span>{g === 'All' ? 'All products' : g}</span>
      <em>{count(g)}</em>
    </button>
  );

  return (
    <div className="mk">
      <section className="mk-head">
        <div className="mk-wrap">
          <p className="mk-tag">MARKETPLACE</p>
          <h1>Find your commodity</h1>
          <p className="mk-lede">{all.length ? `${all.length} products` : 'Products'} from India, priced per tonne. Pick one and ask for a quote.</p>
          <div className="mk-find">
            <Icon n="search" size={21} />
            <input type="search" value={q} onChange={(e) => update({ q: e.target.value })} placeholder="Search rice, wheat, chickpeas, sesame…" aria-label="Search products" enterKeyHint="search" />
            {q && <button type="button" onClick={() => update({ q: '' })} aria-label="Clear search"><Icon n="close" size={16} /></button>}
          </div>
          <nav className="mk-jump">
            {offers.length > 0 && <a href="#offers"><Icon n="tag" size={15} />{offers.length} live offers</a>}
            <a href="#rfq"><Icon n="doc" size={15} />Post a requirement</a>
          </nav>
        </div>
      </section>

      <div className="mk-wrap mk-layout" ref={results}>
        <aside className="mk-side" style={{ top: stickyTop + 16 }}>
          <h2>Categories</h2>
          <div className="mk-cats">
            {['All', ...CATEGORIES].map((g) => (
              g === 'Rice' ? (
                <div key={g}>
                  {catButton(g)}
                  {riceOpen && <div className="mk-sub">{RICE_TYPES.map((t) => <button key={t} type="button" className={group === t ? 'on' : ''} aria-pressed={group === t} onClick={() => choose(t)}><span>{t}</span><em>{count(t)}</em></button>)}</div>}
                </div>
              ) : catButton(g)
            ))}
          </div>
          <div className="mk-help">
            <b>Can’t find it?</b>
            <p>Tell us what you need and we will source it.</p>
            <a href="#rfq">Post a requirement</a>
          </div>
        </aside>

        <main className="mk-main">
          <div className="mk-tools" style={{ top: stickyTop }}>
            <div className="mk-tabs">
              {['All', ...CATEGORIES].map(catButton)}
            </div>
            {riceOpen && <div className="mk-types">{['Rice', ...RICE_TYPES].map((t) => <button key={t} type="button" className={group === t ? 'on' : ''} onClick={() => choose(t)}>{t === 'Rice' ? 'All rice' : t}</button>)}</div>}
            <div className="mk-row">
              <p aria-live="polite"><b>{group === 'All' ? 'All products' : group}</b> <span>{products ? `${shown.length} found` : 'Loading…'}</span></p>
              <label className="mk-sort"><span>Sort</span>
                <select value={sort} onChange={(e) => update({ sort: e.target.value === 'default' ? '' : e.target.value })}>{SORTS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select>
              </label>
              <div className="mk-view" role="group" aria-label="Layout">
                {['grid', 'list'].map((v) => <button key={v} type="button" className={view === v ? 'on' : ''} aria-pressed={view === v} onClick={() => update({ view: v === 'list' ? 'list' : '' })}>{v === 'grid' ? 'Grid' : 'List'}</button>)}
              </div>
            </div>
            {q && <div className="mk-active">Results for <b>“{q}”</b><button type="button" onClick={() => update({ q: '' })}>Clear</button></div>}
          </div>

          {!products && <div className="mk-grid" aria-hidden="true">{Array.from({ length: 8 }, (_, i) => <div key={i} className="mk-skel" />)}</div>}

          {products && shown.length === 0 && (
            <div className="mk-none">
              <b>No products match{q ? ` “${q}”` : ''}{group !== 'All' ? ` in ${group}` : ''}.</b>
              <p>Check the spelling, or try a broader search.</p>
              <div>
                {q && group !== 'All' && matching.length > 0
                  ? <button type="button" onClick={() => choose('All')}>See {matching.length} {matching.length === 1 ? 'match' : 'matches'} in all categories</button>
                  : <button type="button" onClick={reset}>Show all products</button>}<a href="#rfq">Post a requirement</a></div>
            </div>
          )}

          {products && overview && CATEGORIES.map((c) => {
            const list = shown.filter((p) => categoryOf(p) === c);
            if (!list.length) return null;
            return (
              <section key={c} className="mk-sec">
                <header><h2>{c}</h2><span>{list.length} {list.length === 1 ? 'product' : 'products'}</span>
                  {list.length > PREVIEW && <button type="button" onClick={() => choose(c)}>View all {list.length}<Icon n="arrow" size={14} /></button>}
                </header>
                {grid(list.slice(0, PREVIEW))}
              </section>
            );
          })}

          {products && !overview && shown.length > 0 && <>
            {grid(shown.slice(0, limit))}
            {shown.length > limit && <button type="button" className="mk-more" onClick={() => setLimit(limit + PAGE)}>Show more ({shown.length - limit} left)</button>}
          </>}
        </main>
      </div>

      <section className="mk-wrap mk-block" id="offers">
        <h2>Live offers</h2>
        {offers.length === 0 ? (
          <p className="muted">No live offers right now. Post a requirement below, or <Link className="link" to="/account">list your own as a seller</Link>.</p>
        ) : (
          <div className="mk-offers">
            {offers.map((o) => {
              const p = all.find((x) => x.slug === o.product?.slug);
              return (
                <article key={o._id}>
                  <h3>{p ? <Link to={productPath(p)}>{o.product?.name}</Link> : o.product?.name}</h3>
                  <small>{o.sellerCompany}</small>
                  <p>{o.origin} → {o.destination}</p>
                  <div><b>${o.priceUsdPerMT}<span>/MT</span></b><em>{o.quantityMT} MT · {o.incoterm}</em></div>
                </article>
              );
            })}
          </div>
        )}
        <p className="note">Offers from sellers named “Sample” are illustrative until real sellers go live.</p>
      </section>

      <section className="mk-wrap mk-block" id="rfq">
        <div className="panel">
          <h2 className="h3">Post a requirement</h2>
          <LeadForm role="buyer" cta="Request quotes" extra={<>
            <label>Product<select name="productSlug">{all.map((p) => <option key={p.slug} value={p.slug}>{p.name}</option>)}</select></label>
            <QuoteFields />
          </>} />
        </div>
      </section>

      <QuoteDialog product={quote} onClose={() => setQuote(null)} />
    </div>
  );
}
