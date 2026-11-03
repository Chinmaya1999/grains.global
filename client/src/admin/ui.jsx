import { useCallback, useEffect, useState } from 'react';
import { request } from '../api.js';

export function useList(path) {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const load = useCallback(() => request(path).then((d) => { setData(d); setError(''); }).catch((e) => setError(e.message)), [path]);
  useEffect(() => { setData(null); load(); }, [load]);
  return { data, error, reload: load };
}

export const ago = (d) => {
  const s = (Date.now() - new Date(d)) / 1000;
  if (s < 60) return 'just now';
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
};
export const usd = (n) => (n >= 1e6 ? `$${(n / 1e6).toFixed(2)}M` : `$${Math.round(n).toLocaleString('en-US')}`);

export const Badge = ({ v }) => <span className={`ab ${v}`}>{v}</span>;
export const Empty = ({ children }) => <div className="empty">{children}</div>;

export function Modal({ title, onClose, children }) {
  useEffect(() => {
    const k = (e) => e.key === 'Escape' && onClose();
    addEventListener('keydown', k);
    return () => removeEventListener('keydown', k);
  }, [onClose]);
  return (
    <div className="modal-bg" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal glass" role="dialog" aria-modal="true" aria-label={title}>
        <header><h3>{title}</h3><button className="x" onClick={onClose} aria-label="Close">×</button></header>
        {children}
      </div>
    </div>
  );
}

// fields: [{ k, label, type?, options?: [value,label][], step? }]
export function FormModal({ title, fields, initial = {}, onSave, onClose, cta = 'Save' }) {
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);
  async function submit(e) {
    e.preventDefault();
    setBusy(true); setErr('');
    const raw = Object.fromEntries(new FormData(e.currentTarget));
    fields.forEach((f) => { if (f.type === 'number' && raw[f.k] !== '') raw[f.k] = +raw[f.k]; });
    try { await onSave(raw); onClose(); } catch (x) { setErr(x.message); setBusy(false); }
  }
  return (
    <Modal title={title} onClose={onClose}>
      <form className="aform" onSubmit={submit}>
        {fields.map((f) => (
          <label key={f.k} className={f.wide ? 'wide' : ''}>{f.label}
            {f.options
              ? <select name={f.k} defaultValue={initial[f.k] ?? f.options[0][0]}>{f.options.map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select>
              : <input name={f.k} type={f.type || 'text'} step={f.step || 'any'} defaultValue={initial[f.k] ?? ''} required={f.required} />}
          </label>
        ))}
        {err && <p className="aerr wide" role="alert">{err}</p>}
        <div className="wide acts"><button type="button" className="gbtn" onClick={onClose}>Cancel</button><button className="gbtn pri" disabled={busy}>{busy ? 'Saving…' : cta}</button></div>
      </form>
    </Modal>
  );
}

export function Toolbar({ children, right }) {
  return <div className="toolbar"><div className="filters">{children}</div><div className="right">{right}</div></div>;
}
export const Search = ({ value, onChange, placeholder = 'Search…' }) => (
  <input className="gin" type="search" placeholder={placeholder} value={value} onChange={(e) => onChange(e.target.value)} aria-label={placeholder} />
);
export const Pills = ({ value, onChange, options }) => (
  <div className="pills">{options.map(([v, l]) => <button key={v} className={v === value ? 'on' : ''} onClick={() => onChange(v)}>{l}</button>)}</div>
);

// Debounced value for search boxes that hit the API.
export function useDebounced(v, ms = 250) {
  const [d, setD] = useState(v);
  useEffect(() => { const t = setTimeout(() => setD(v), ms); return () => clearTimeout(t); }, [v, ms]);
  return d;
}
