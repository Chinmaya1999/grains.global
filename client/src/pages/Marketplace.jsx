import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Icon, Photo } from '../components/Art.jsx';
import { Reveal } from '../components/bits.jsx';
import LeadForm from '../components/LeadForm.jsx';
import { getProducts, getOffers } from '../api.js';
import { inGroup, priceLabel } from '../lib/format.js';
import { productImage } from '../lib/content.js';

const FAMILIES = ['All', 'Basmati', 'Non-Basmati', 'Sella'];

export default function Marketplace() {
  const [products, setProducts] = useState([]);
  const [offers, setOffers] = useState([]);
  const [params, setParams] = useSearchParams();
  const [family, setFamily] = useState(FAMILIES.includes(params.get('family')) ? params.get('family') : 'All');
  useEffect(() => { getProducts().then(setProducts); getOffers().then(setOffers); }, []);
  const q = params.get('q') || '';
  const terms = q.toLowerCase().split(/\s+/).filter(Boolean);
  const hay = (p) => `${p.name} ${p.family} ${p.processing} ${p.hsn || ''} ${p.grain?.length || ''}`.toLowerCase();
  const shown = products.filter((p) => inGroup(p, family) && terms.every((t) => hay(p).includes(t)));
  const setQ = (v) => { const next = new URLSearchParams(params); if (v) next.set('q', v); else next.delete('q'); setParams(next, { replace: true }); };

  return (
    <div className="page">
      <Reveal><p className="tag">MARKET</p><h1 className="h1">Rice, priced per tonne.</h1></Reveal>

      <h2 className="h3">Live offers</h2>
      {offers.length === 0 ? (
        <p className="muted">No live offers right now. Post a requirement below, or <Link className="link" to="/account">list your own as a seller</Link>.</p>
      ) : (
        <div className="table">
          <div className="th"><span>Variety</span><span>Lane</span><span>Qty</span><span>Price</span></div>
          {offers.map((o) => (
            <Reveal key={o._id} className="tr">
              <span><b>{o.product?.name}</b><small>{o.sellerCompany}</small></span>
              <span>{o.origin} → {o.destination}<small>{o.incoterm}</small></span>
              <span>{o.quantityMT} MT</span>
              <span className="hot">${o.priceUsdPerMT}<small>/MT</small></span>
            </Reveal>
          ))}
        </div>
      )}
      <p className="note">Offers from sellers named “Sample” are illustrative until real sellers go live.</p>

      <h2 className="h3">Catalogue</h2>
      <div className="mk-bar">
        <div className="mk-search">
          <Icon n="search" size={19} />
          <input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search varieties, e.g. 1121, sella, PR 14" aria-label="Search varieties" />
          {q && <button onClick={() => setQ('')} aria-label="Clear search"><Icon n="close" size={16} /></button>}
        </div>
        <p className="mk-count" aria-live="polite">{products.length ? `${shown.length} of ${products.length} varieties` : ''}</p>
      </div>
      <div className="chips">{FAMILIES.map((f) => <button key={f} className={f === family ? 'on' : ''} onClick={() => setFamily(f)}>{f}</button>)}</div>
      {products.length > 0 && shown.length === 0 && (
        <div className="mk-empty"><b>No varieties match{q ? ` “${q}”` : ''}{family !== 'All' ? ` in ${family}` : ''}.</b><p>Check the spelling, or try a broader search.</p>
          <div className="row"><button className="btn sm" onClick={() => { setQ(''); setFamily('All'); }}>Show all varieties</button><a className="btn ghost sm" href="#rfq">Can’t find it? Post a requirement</a></div></div>
      )}
      <div className="spec-grid">
        {shown.map((p) => (
          <Link className="spec" key={p.slug} to={`/rice/${p.slug}`}>
            <Photo name={productImage(p)} scene="rice" alt={p.name} className="spec-ph" />
            <small>{p.family} · {p.processing}</small>
            <h3>{p.name}</h3>
            <div className="bar"><i style={{ width: `${(p.grain.length / 8.6) * 100}%` }} /></div>
            <p>{Number(p.grain.length).toFixed(2)} mm · &lt;{p.grain.broken}% broken · &lt;{p.grain.moisture}% moisture</p>
            <b className="hot">{p.avgPriceUsd ? <>${p.avgPriceUsd}<small>/MT avg</small></> : <small>Price on request</small>}</b>
          </Link>
        ))}
      </div>

      <div className="panel" id="rfq">
        <h2 className="h3">Post a requirement</h2>
        <LeadForm role="buyer" cta="Request quotes" extra={<>
          <label>Variety<select name="productSlug">{products.map((p) => <option key={p.slug} value={p.slug}>{p.name}</option>)}</select></label>
          <label>Quantity (MT)<input name="quantityMT" type="number" min="1" /></label>
          <label>Target price (USD/MT)<input name="targetPriceUsd" type="number" min="0" step="any" /></label>
          <label>Incoterm<select name="incoterm"><option>FOB</option><option>CIF</option><option>CNF</option><option>EXW</option></select></label>
          <label>Destination port / country<input name="destination" /></label>
          <label>Packaging<select name="packaging"><option>25 kg bags</option><option>50 kg bags</option><option>1 MT jumbo bags</option><option>1 / 5 / 10 kg consumer packs</option><option>20 ft container, bulk</option><option>Private label</option></select></label>
          <label>Payment terms<select name="paymentTerms"><option>LC at sight</option><option>LC 30 / 60 / 90 days</option><option>TT advance</option><option>TT against documents</option><option>Documents against payment (DP)</option><option>Open account</option></select></label>
        </>} />
      </div>
    </div>
  );
}
