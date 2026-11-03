import { useContext, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Reveal } from '../components/bits.jsx';
import { FAQ, Table } from '../components/Blocks.jsx';
import { TOOLS_FAQ, TRUST_VS } from '../lib/content.js';
import { CALCS, SCORES } from '../lib/tools.js';
import { ToolAccess } from '../lib/access.js';

function Calc({ tool }) {
  const [v, setV] = useState(() => Object.fromEntries(tool.fields.map(([k, , d]) => [k, d])));
  const rows = tool.compute(v);
  return (
    <div className="tool-body">
      <div className="fields">
        {tool.fields.map(([k, label, , hint]) => (
          <label key={k}>{label}<input type="number" step="any" min="0" value={v[k]} onChange={(e) => setV({ ...v, [k]: e.target.value })} />{hint && <small>{hint}</small>}</label>
        ))}
      </div>
      <dl className="out">{rows.map(([l, val, big]) => <div key={l} className={big ? 'big' : ''}><dt>{l}</dt><dd>{val}</dd></div>)}</dl>
    </div>
  );
}

function Score({ tool }) {
  const [v, setV] = useState(() => Object.fromEntries(tool.groups.map(([l]) => [l, 0])));
  const { total, parts } = useMemo(() => {
    const parts = tool.groups.map(([l, max]) => [l, max, Math.round(max * tool.levels[v[l]][1] * 10) / 10]);
    return { parts, total: Math.round(parts.reduce((a, p) => a + p[2], 0)) };
  }, [v, tool]);
  return (
    <div className="tool-body">
      <div className="fields">
        {tool.groups.map(([l, max, hint]) => (
          <label key={l}><span>{l} <em>/ {max}</em></span>
            <select value={v[l]} onChange={(e) => setV({ ...v, [l]: +e.target.value })}>{tool.levels.map(([n], k) => <option key={n} value={k}>{n}</option>)}</select>
            <small>{hint}</small>
          </label>
        ))}
      </div>
      <div className="out score">
        <div className="gauge" style={{ '--p': total }}><b>{total}</b><span>/100</span></div>
        <p className="verdict">{tool.label(total)}</p>
        <ul>{parts.map(([l, max, got]) => <li key={l}><span>{l}</span><i><u style={{ width: `${(got / max) * 100}%` }} /></i><em>{got}/{max}</em></li>)}</ul>
        <p className="note">Self-assessed and indicative only. Weights total exactly 100.</p>
      </div>
    </div>
  );
}

export default function Tools() {
  const allow = useContext(ToolAccess);
  const all = [...CALCS.map((t) => ({ ...t, kind: 'calc' })), ...SCORES.map((t) => ({ ...t, kind: 'score' }))].filter((t) => !allow || allow.includes(t.id));
  const [params] = useSearchParams();
  const [id, setId] = useState(all.some((t) => t.id === params.get('tool')) ? params.get('tool') : all[0].id);
  const tool = all.find((t) => t.id === id);
  return (
    <div className="page">
      <Reveal><p className="tag">TOOLS</p><h1 className="h1">Free. No sign-up.</h1></Reveal>
      <div className="tools">
        <div className="tool-list">
          {all.map((t) => <button key={t.id} className={t.id === id ? 'on' : ''} onClick={() => setId(t.id)}><b>{t.title}</b><small>{t.blurb}</small></button>)}
        </div>
        <section className="tool-panel" key={id}>
          <h2 className="h3">{tool.title}</h2>
          {tool.kind === 'calc' ? <Calc tool={tool} /> : <Score tool={tool} />}
        </section>
      </div>
      <h2 className="h3">Trust score vs credit score vs KYC</h2>
      <Table head={['Measure', 'What it tells you']} rows={TRUST_VS} />
      <h2 className="h3">Questions about the scorecards</h2>
      <FAQ items={TOOLS_FAQ} />
    </div>
  );
}
