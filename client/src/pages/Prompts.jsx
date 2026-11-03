import { useState } from 'react';
import { Reveal } from '../components/bits.jsx';
import { PROMPTS } from '../lib/data.js';

const GROUPS = ['All', ...new Set(PROMPTS.map((p) => p[0]))];

export default function Prompts() {
  const [g, setG] = useState('All');
  const [copied, setCopied] = useState(null);
  const copy = async (text, i) => {
    try { await navigator.clipboard.writeText(text); setCopied(i); setTimeout(() => setCopied(null), 1500); } catch { /* clipboard blocked */ }
  };
  return (
    <div className="page">
      <Reveal><p className="tag">PROMPT LIBRARY</p><h1 className="h1">Templates for your AI assistant.</h1>
        <p className="lede">Copy a template into any AI assistant and fill in the {'{braces}'}.</p></Reveal>
      <div className="chips">{GROUPS.map((x) => <button key={x} className={x === g ? 'on' : ''} onClick={() => setG(x)}>{x}</button>)}</div>
      <div className="spec-grid">
        {PROMPTS.map(([grp, title, text], i) => (g === 'All' || g === grp) && (
          <article className="spec prompt" key={title}>
            <small>{grp}</small><h3>{title}</h3><p>{text}</p>
            <button className="btn ghost sm" onClick={() => copy(text, i)}>{copied === i ? 'Copied ✓' : 'Copy'}</button>
          </article>
        ))}
      </div>
    </div>
  );
}
