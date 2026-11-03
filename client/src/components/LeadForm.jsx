import { useState } from 'react';
import { postLead } from '../api.js';

export default function LeadForm({ role, extra, cta = 'Send' }) {
  const [state, setState] = useState({ status: 'idle', error: '' });
  async function submit(e) {
    e.preventDefault();
    const body = { role, ...Object.fromEntries(new FormData(e.currentTarget)) };
    if (body.quantityMT) body.quantityMT = Number(body.quantityMT);
    if (body.targetPriceUsd) body.targetPriceUsd = Number(body.targetPriceUsd); else delete body.targetPriceUsd;
    setState({ status: 'sending', error: '' });
    try { await postLead(body); setState({ status: 'done', error: '' }); }
    catch (err) { setState({ status: 'idle', error: err.message }); }
  }
  if (state.status === 'done') return <div className="thanks"><b>✓</b><h3>Received.</h3><p>Our team will reply by email or WhatsApp.</p></div>;
  return (
    <form className="form" onSubmit={submit}>
      <label>Name<input name="name" required autoComplete="name" /></label>
      <label>Business email<input name="email" type="email" required autoComplete="email" /></label>
      <label>Company<input name="company" autoComplete="organization" /></label>
      <label>Phone / WhatsApp<input name="phone" autoComplete="tel" /></label>
      <label>Country<input name="country" /></label>
      {extra}
      <label className="wide">Message<textarea name="message" rows="3" /></label>
      {state.error && <p className="err" role="alert">{state.error}</p>}
      <button className="btn" disabled={state.status === 'sending'}>{state.status === 'sending' ? 'Sending…' : cta}</button>
    </form>
  );
}
