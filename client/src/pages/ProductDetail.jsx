import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Hero, Sec, Checks, FAQ, Table, Band } from '../components/Blocks.jsx';
import { ProductPhoto } from '../components/Art.jsx';
import LeadForm from '../components/LeadForm.jsx';
import { request } from '../api.js';
import { RICE, productImage } from '../lib/content.js';
import { lengthLabel, isRice, categoryOf, kindLabel, productPath } from '../lib/format.js';
import { applySeo, productSeo, SITE } from '../lib/seo.js';

export default function ProductDetail() {
  const { slug } = useParams();
  const [p, setP] = useState(undefined);
  const [offers, setOffers] = useState([]);
  useEffect(() => {
    setP(undefined);
    request(`/products/${slug}`).then(setP).catch(() => setP(null));
    request(`/offers?product=${slug}`).then(setOffers).catch(() => setOffers([]));
  }, [slug]);

  useEffect(() => {
    if (!p) return undefined;
    const img = productImage(p) ? `/images/${productImage(p)}.jpg` : null;
    applySeo({ ...productSeo(p), image: img });
    const ld = document.createElement('script');
    ld.type = 'application/ld+json';
    ld.textContent = JSON.stringify({
      '@context': 'https://schema.org', '@type': 'Product', name: p.name, description: p.blurb, category: isRice(p) ? `${p.family} rice` : categoryOf(p),
      ...(img ? { image: SITE + img } : {}), brand: { '@type': 'Brand', name: 'Agri Global' },
      ...(p.avgPriceUsd ? { offers: { '@type': 'Offer', priceCurrency: 'USD', price: p.avgPriceUsd, priceSpecification: { '@type': 'UnitPriceSpecification', priceCurrency: 'USD', price: p.avgPriceUsd, unitCode: 'TNE' }, availability: 'https://schema.org/InStock', url: SITE + productPath(p) } } : {}),
    });
    document.head.appendChild(ld);
    return () => ld.remove();
  }, [p]);

  if (p === undefined) return <div className="page" />;
  if (p === null) return <div className="page"><h1 className="h1">Product not found.</h1><Link className="btn" to="/marketplace">Back to the catalogue</Link></div>;

  const rice = isRice(p);
  const specRows = p.specs?.length
    ? p.specs.map((s) => [s.label, s.value])
    : [['Variety', p.name], ['Processing', p.processing], ['Grain length (raw)', lengthLabel(p)], ['Broken grains', `Less than ${p.grain?.broken || 2}%, export quality`], ...RICE.specs.filter(([k]) => k !== 'Broken grains')];

  return (
    <>
      <Hero tag={kindLabel(p).toUpperCase()} title={p.name} lede={p.blurb}>
        <dl className="pfacts">
          <div><dt>Average price</dt><dd>{p.avgPriceUsd ? `$${p.avgPriceUsd}` : 'On request'}{p.avgPriceUsd ? <small> /MT</small> : null}</dd></div>
          {p.hsn && <div><dt>HSN code</dt><dd>{p.hsn}</dd></div>}
          {p.grain?.length ? <div><dt>Grain length</dt><dd>{lengthLabel(p)}</dd></div> : null}
          <div><dt>Origin</dt><dd>India</dd></div>
          <div><dt>Live offers</dt><dd>{offers.length}</dd></div>
        </dl>
      </Hero>

      <Sec tag="LIVE OFFERS" title={`Live offers for ${p.name}`}>
        {offers.length === 0 ? <p className="muted">No live offers yet. Request a quote below and our team will source one.</p> : (
          <Table head={['Seller', 'Lane', 'Qty', 'Price']} rows={offers.map((o) => [o.sellerCompany, `${o.origin} → ${o.destination} (${o.incoterm})`, `${o.quantityMT} MT`, `$${o.priceUsdPerMT}/MT`])} />
        )}
      </Sec>

      <Sec alt tag="SPECIFICATIONS" title="Key features & specifications.">
        <div className="two">
          <div>
            <Table head={['Parameter', 'Value']} rows={specRows} />
            <p className="note">Indicative values; confirm exact specification and grade in your offer or sample.</p>
          </div>
          <ProductPhoto name={productImage(p)} alt={p.name} className="pphoto" />
        </div>
      </Sec>

      {(p.features?.length > 0 || p.grades?.length > 0) && (
        <Sec tag="PRODUCT DETAILS" title="Characteristics & grades.">
          <div className="two">
            {p.features?.length > 0 && <div className="panelx"><h3>Key characteristics</h3><Checks items={p.features} /></div>}
            {p.grades?.length > 0 && <div className="panelx"><h3>Available grades</h3><Checks items={p.grades} /></div>}
          </div>
        </Sec>
      )}

      {p.nutrition?.length > 0 && (
        <Sec alt tag="NUTRITION" title="Approximate values per 100 g.">
          <Table head={['Nutrient', 'Amount']} rows={p.nutrition.map((n) => [n.label, n.value])} />
        </Sec>
      )}

      {rice && (
        <Sec tag="WHY BUYERS CHOOSE IT" title="Benefits & applications.">
          <div className="two"><div className="panelx"><h3>Benefits</h3><Checks items={RICE.benefits} /></div><div className="panelx"><h3>Applications</h3><Checks items={RICE.uses} /></div></div>
        </Sec>
      )}

      <Sec alt tag="PACKAGING & DELIVERY" title="Packaging & logistics.">
        <div className="two"><div className="panelx"><h3>Packaging options</h3><Checks items={!rice || p.specs?.length ? p.packaging : RICE.packaging} /></div><div className="panelx"><h3>Delivery & logistics</h3><Checks items={RICE.logistics} /></div></div>
      </Sec>

      {rice && <>
        <Sec tag="QUALITY ASSURANCE" title="Every batch is checked.">
          <p className="ilede dark">Every batch undergoes quality checks to meet international food-safety and export-quality standards.</p>
          <Checks items={RICE.quality} />
        </Sec>

        <Sec alt tag="COMMON QUESTIONS" title="Questions about this variety."><FAQ items={[...(p.grain?.length ? [[`What is the average grain length of ${p.name}?`, `About ${lengthLabel(p)}, ensuring good elongation and presentation.`]] : []), ...RICE.faq]} /></Sec>
      </>}

      <Sec id="quote" tag="CONTACT SELLER" title="Request a quote or samples.">
        <div className="panelx" style={{ maxWidth: 760 }}>
          <LeadForm role="buyer" cta="Request details" extra={<>
            <input type="hidden" name="productSlug" value={p.slug} />
            <label>Quantity (MT)<input name="quantityMT" type="number" min="1" defaultValue="500" /></label>
          </>} />
        </div>
      </Sec>
      <Band title="Ready to place a bulk order?" actions={[['Browse the catalogue', '/marketplace'], ['Calculate landed cost', '/tools?tool=landed', true]]} />
    </>
  );
}
