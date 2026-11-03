import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Hero, Sec, Cards, Checks, Table, Band } from '../components/Blocks.jsx';
import { estimatePartner } from '../api.js';
import { PARTNER } from '../lib/content.js';

const money = (n) => `$${(n ?? 0).toLocaleString('en-US')}`;

export default function Partner() {
  const [monthly, setMonthly] = useState(600000);
  const [margin, setMargin] = useState(6);
  const [est, setEst] = useState(null);
  useEffect(() => {
    const t = setTimeout(() => estimatePartner(monthly, margin).then(setEst), 150);
    return () => clearTimeout(t);
  }, [monthly, margin]);

  return (
    <>
      <Hero tag="GLOBAL TRADING PARTNERS" title="Upgrade from fixed commissions to flexible profit sharing." lede="You live in the buyer’s country, you own the relationship, you set the price. We handle sourcing, quality, documents and finance. Earn 25–40% of the margin per deal, plus a 5–15% performance bonus on top." actions={[['Apply as a partner', '/join?role=partner'], ['Deal margin calculator', '/tools?tool=margin', true]]} />

      <Sec tag="TRADE CHALLENGES" title="Is a trust deficit dragging your agri trade down?" lede="Trust deficit > (high costs + slow deals) = lost opportunities."><Checks items={PARTNER.challenges} /></Sec>

      <Sec alt tag="PARTNER ADVANTAGES" title="What do you get as a Global Trading Partner?"><Cards items={PARTNER.advantages} /></Sec>

      <Sec id="profit" tag="FLEXIBLE EARNING MODEL" title="Earn more as you trade more." lede="All your earnings come from the margin made together on every successful trade. Your profit share is calculated only on realised deal profit.">
        <div className="calc-wrap">
          <div className="panel calc">
            <label>Monthly business volume <b>{money(monthly)}</b>
              <input type="range" min="0" max="1200000" step="60000" value={monthly} onChange={(e) => setMonthly(+e.target.value)} /></label>
            <label>Deal margin <b>{margin}%</b>
              <input type="range" min="1" max="15" step="0.5" value={margin} onChange={(e) => setMargin(+e.target.value)} /></label>
            <dl className="out">
              <div><dt>Your margin share</dt><dd>{est ? `${est.sharePct}%` : '—'}</dd></div>
              <div className="big"><dt>Monthly earnings</dt><dd>{est ? money(est.monthlyEarnings) : '—'}</dd></div>
              <div><dt>Yearly bonus ({est ? est.bonusPct : '—'}% band)</dt><dd>{est ? money(est.yearlyBonus) : '—'}</dd></div>
            </dl>
            <p className="note">Estimate from the published slab tables. Below $120k a month there is no slab share.</p>
          </div>
        </div>
        <div className="two">
          <Table caption="Monthly volume → your margin share" head={['Monthly business volume (USD)', 'Profit sharing %']} rows={PARTNER.monthly} />
          <Table caption="Yearly volume → performance bonus on margin" head={['Yearly business volume', 'Performance bonus']} rows={PARTNER.yearly} />
        </div>
        <p className="note">Along with monthly profit sharing you earn a performance bonus based on yearly volume and overall efficiency: faster payments, higher margins and smooth operations unlock higher bonuses.</p>
      </Sec>

      <Sec alt tag="EARNINGS COMPARISON" title="Stop earning 2–3% commissions. Start earning from the real profit." lede="A $1,200,000 deal under each model:">
        <Table head={['Model', 'Basis', 'Your earning']} rows={PARTNER.compare} />
        <p className="note">A fixed commission at the upper end (3%) can beat profit sharing on a thin 6% margin. Profit sharing wins as margins and volume grow.</p>
      </Sec>

      <Sec tag="REASONS TO JOIN" title="Why join as a Global Trading Partner today?"><Cards cols={2} items={PARTNER.reasons} /></Sec>

      <Band title="Book a meeting with our co-founder, Sandip Chatterjee." actions={[['Apply as a partner', '/join?role=partner'], ['Contact us', '/contact', true]]} />
    </>
  );
}
