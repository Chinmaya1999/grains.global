import { Link } from 'react-router-dom';
import { Reveal } from './bits.jsx';
import { Icon } from './Art.jsx';

export function Hero({ tag, title, lede, actions = [], children }) {
  return (
    <header className="ihero">
      <div className="ihero-in">
        <Reveal>
          {tag && <p className="itag">{tag}</p>}
          <h1>{title}</h1>
          {lede && <p className="ilede">{lede}</p>}
          {actions.length > 0 && <div className="cta-row">{actions.map(([l, to, ghost]) => <Link key={l} to={to} className={`hbtn ${ghost ? 'light' : 'solid'}`}>{l}<Icon n="arrow" size={16} /></Link>)}</div>}
          {children}
        </Reveal>
      </div>
    </header>
  );
}

export function Sec({ id, tag, title, lede, alt, children }) {
  return (
    <section id={id} className={`isec ${alt ? 'alt' : ''}`}>
      <div className="isec-in">
        {(tag || title) && <Reveal className="ihead">{tag && <p className="itag">{tag}</p>}{title && <h2>{title}</h2>}{lede && <p className="ilede dark">{lede}</p>}</Reveal>}
        {children}
      </div>
    </section>
  );
}

export function Cards({ items, cols = 3 }) {
  return (
    <div className="icards" style={{ '--cols': cols }}>
      {items.map(([t, d, badge], i) => (
        <Reveal key={t} delay={(i % cols) * 0.06} className="icard">
          {badge && <span className="roadmap">{badge}</span>}
          <h3>{t}</h3>{d && <p>{d}</p>}
        </Reveal>
      ))}
    </div>
  );
}

export function Checks({ items }) {
  return <ul className="ichecks">{items.map((x) => <li key={x}><Icon n="check" size={16} />{x}</li>)}</ul>;
}

export function Steps({ items }) {
  return (
    <ol className="isteps">
      {items.map(([t, d], i) => <Reveal key={t} delay={i * 0.07}><li><b>{i + 1}</b><h3>{t}</h3><p>{d}</p></li></Reveal>)}
    </ol>
  );
}

export function FAQ({ items }) {
  return (
    <div className="faq">
      {items.map(([q, a]) => <details key={q}><summary>{q}<Icon n="chev" size={18} /></summary><p>{a}</p></details>)}
    </div>
  );
}

export function Table({ head, rows, caption }) {
  return (
    <div className="dtable-wrap">
      <table className="dtable">
        {caption && <caption>{caption}</caption>}
        <thead><tr>{head.map((h) => <th key={h}>{h}</th>)}</tr></thead>
        <tbody>{rows.map((r, i) => <tr key={i}>{r.map((c, j) => <td key={j}>{c}</td>)}</tr>)}</tbody>
      </table>
    </div>
  );
}

export function Band({ title, actions = [] }) {
  return (
    <section className="iband">
      <h2>{title}</h2>
      <div className="cta-row">{actions.map(([l, to, ghost]) => <Link key={l} to={to} className={`hbtn ${ghost ? 'light' : 'solid lime'}`}>{l}<Icon n="arrow" size={16} /></Link>)}</div>
    </section>
  );
}

export function Prose({ children }) { return <div className="prose">{children}</div>; }
