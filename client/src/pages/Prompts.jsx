import { useState } from 'react';
import { Reveal } from '../components/bits.jsx';
import { PROMPTS } from '../lib/data.js';

const GROUPS = ['All', ...new Set(PROMPTS.map((p) => p[0]))];

export default function Prompts() {
  const [g, setG] = useState('All');
  const [copied, setCopied] = useState(null);
  // navigator.clipboard only exists on HTTPS / localhost, so on a plain-HTTP site fall back to the older copy command.
  async function copyText(text) {
    try { if (navigator.clipboard && window.isSecureContext) { await navigator.clipboard.writeText(text); return true; } } catch { /* fall through */ }
    try {
      const ta = document.createElement('textarea');
      ta.value = text; ta.setAttribute('readonly', ''); ta.style.cssText = 'position:fixed;top:-1000px;opacity:0';
      document.body.appendChild(ta); ta.select();
      const ok = document.execCommand('copy');
      ta.remove();
      return ok;
    } catch { return false; }
  }
  const copy = async (text, i) => {
    const ok = await copyText(text);
    setCopied(ok ? i : `fail-${i}`);
    setTimeout(() => setCopied(null), 2200);
  };
  return (
    <div className="page">
      <Reveal><p className="tag">PROMPT LIBRARY</p><h1 className="h1">Templates for your AI assistant.</h1>
        <p className="lede">Copy a template into any AI assistant and fill in the {'{braces}'}.</p></Reveal>
      <div className="chips">{GROUPS.map((x) => <button key={x} className={x === g ? 'on' : ''} onClick={() => setG(x)}>{x}</button>)}</div>
      <div className="spec-grid">
        {PROMPTS.map(([grp, title, text], i) => (g === 'All' || g === grp) && (
          <article className="spec prompt" key={title}>
            <small>{grp}</small><h3>{title}</h3><p className="prompt-text">{text}</p>
            <button className="btn ghost sm" onClick={() => copy(text, i)}>{copied === i ? 'Copied ✓' : copied === `fail-${i}` ? 'Press Ctrl+C to copy' : 'Copy'}</button>
          </article>
        ))}
      </div>
    </div>
  );
}
