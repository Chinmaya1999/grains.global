import { Fragment, useMemo, useState } from 'react';
import { request, getProducts } from '../api.js';
import { Counter } from '../components/bits.jsx';
import { AreaChart, Donut } from './charts.jsx';
import { REGISTRY, DEFAULTS, CONTENT_META, SETTINGS } from '../lib/content.js';
import { replaceInPlace } from '../lib/contentStore.jsx';
import { useList, useDebounced, ago, usd, Badge, Empty, FormModal, Toolbar, Search, Pills } from './ui.jsx';

const ROLES = ['buyer', 'seller', 'partner', 'agropreneur', 'bank', 'admin'];
const ROLE_OPTS = ROLES.map((r) => [r, r]);
const COLORS = ['#c6ff3d', '#ff6a2b', '#5ee0d1', '#b794ff', '#ffc65c', '#ff7aa8'];
const qs = (o) => Object.entries(o).filter(([, v]) => v).map(([k, v]) => `${k}=${encodeURIComponent(v)}`).join('&');

const Err = ({ e }) => (e ? <Empty>{e}</Empty> : null);
const Loading = () => <Empty>Loading…</Empty>;

/* ---------------------------------------------------------------- overview */
export function Overview({ toast, go, me }) {
  const { data: d, error, reload } = useList('/admin/overview');
  if (error) return <Err e={error} />;
  if (!d) return <Loading />;
  const t = d.totals;
  const kpis = [
    ['Users', t.users, '', `${d.kycByStatus.pending || 0} awaiting KYC`, '#c6ff3d', 'users'],
    ['Live offers', d.offersByStatus.live || 0, '', `${d.offersByStatus.review || 0} in review`, '#5ee0d1', 'offers'],
    ['New leads', d.leadsByStatus.new || 0, '', `${t.leads} total`, '#ff6a2b', 'leads'],
    ['Live offer value', null, usd(t.liveValueUsd), `${t.liveMT.toLocaleString('en-US')} MT listed`, '#b794ff', 'offers'],
  ];
  const act = (path, approve, msg) => request(path, { method: 'POST', body: { approve } }).then(() => { toast(msg); reload(); }).catch((e) => toast(e.message, true));
  const todo = (d.kycByStatus.pending || 0) + (d.offersByStatus.review || 0) + (d.leadsByStatus.new || 0);
  return (
    <>
      <section className="glass card ahero">
        <div><small>{new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' }).toUpperCase()}</small>
          <h2>Welcome back, {(me?.name || 'Admin').split(' ')[0]}.</h2>
          <p className="muted">{todo ? `${todo} item(s) need attention: ${d.kycByStatus.pending || 0} KYC, ${d.offersByStatus.review || 0} offers, ${d.leadsByStatus.new || 0} new leads.` : 'Everything is up to date.'}</p></div>
        <div className="aquick">
          <button className="gbtn pri" onClick={() => go('users')}>Manage users</button>
          <button className="gbtn" onClick={() => go('offers')}>Review offers</button>
          <button className="gbtn" onClick={() => go('leads')}>Open leads</button>
          <button className="gbtn" onClick={() => go('content')}>Edit site</button>
        </div>
      </section>
      <div className="kpis">
        {kpis.map(([l, n, text, sub, c, tab]) => (
          <button key={l} className="glass kpi" style={{ '--c': c }} onClick={() => go(tab)}>
            <span>{l}</span><b>{n === null ? text : <Counter to={n} />}</b><small>{sub}</small><i />
          </button>
        ))}
      </div>
      <div className="grid2">
        <section className="glass card">
          <header><h3>Activity · last 14 days</h3><div className="legend"><i style={{ background: '#c6ff3d' }} />Leads<i style={{ background: '#5ee0d1' }} />Sign-ups</div></header>
          <AreaChart labels={d.leadSeries.map((x) => x.date)} series={[{ name: 'Leads', color: '#c6ff3d', data: d.leadSeries.map((x) => x.n) }, { name: 'Sign-ups', color: '#5ee0d1', data: d.userSeries.map((x) => x.n) }]} />
        </section>
        <section className="glass card"><header><h3>Users by role</h3></header><Donut data={d.usersByRole} colors={COLORS} label="users" /></section>
      </div>
      <div className="grid3">
        <section className="glass card"><header><h3>Offers by status</h3></header><Donut data={d.offersByStatus} colors={['#c6ff3d', '#ffc65c', '#ff6a2b']} label="offers" /></section>
        <section className="glass card">
          <header><h3>Needs your attention</h3></header>
          {d.pendingKyc.length === 0 && (d.offersByStatus.review || 0) === 0 ? <Empty>All clear ✓</Empty> : null}
          {d.pendingKyc.map((u) => (
            <div className="row" key={u._id}><span><b>{u.name}</b><small>KYC · {u.company || u.email}</small></span>
              <button className="gbtn pri sm" onClick={() => act(`/admin/kyc/${u._id}`, true, 'User verified')}>Verify</button>
              <button className="gbtn sm" onClick={() => act(`/admin/kyc/${u._id}`, false, 'KYC rejected')}>Reject</button></div>
          ))}
          {(d.offersByStatus.review || 0) > 0 && <button className="gbtn wide" onClick={() => go('offers')}>Review {d.offersByStatus.review} pending offer(s) →</button>}
        </section>
        <section className="glass card">
          <header><h3>Latest leads</h3><button className="link" onClick={() => go('leads')}>All →</button></header>
          {d.recentLeads.length === 0 ? <Empty>No leads yet</Empty> : d.recentLeads.map((l) => (
            <div className="row" key={l._id}><span><b>{l.name}</b><small>{l.role} · {l.company || l.email}</small></span><small>{ago(l.createdAt)}</small></div>
          ))}
        </section>
      </div>
    </>
  );
}

/* ------------------------------------------------------------------- users */
export function Users({ toast, me }) {
  const [modal, setModal] = useState(null);
  const [q, setQ] = useState(''); const [role, setRole] = useState(''); const [kyc, setKyc] = useState('');
  const dq = useDebounced(q);
  const { data, error, reload } = useList(`/admin/users?${qs({ q: dq, role, kyc })}`);
  const patch = (id, body, msg) => request(`/admin/users/${id}`, { method: 'PATCH', body }).then(() => { toast(msg); reload(); }).catch((e) => toast(e.message, true));
  const del = (u) => confirm(`Delete ${u.email}? This can't be undone.`) && request(`/admin/users/${u._id}`, { method: 'DELETE' }).then(() => { toast('User deleted'); reload(); }).catch((e) => toast(e.message, true));
  return (
    <>
      <Toolbar right={<><span className="count">{data ? `${data.length} users` : ''}</span><button className="gbtn pri" onClick={() => setModal({ type: 'new' })}>+ New user</button></>}>
        <Search value={q} onChange={setQ} placeholder="Search name, email, company" />
        <select className="gin" value={role} onChange={(e) => setRole(e.target.value)} aria-label="Filter by role"><option value="">All roles</option>{ROLE_OPTS.map(([v]) => <option key={v}>{v}</option>)}</select>
        <select className="gin" value={kyc} onChange={(e) => setKyc(e.target.value)} aria-label="Filter by KYC"><option value="">Any KYC</option>{['none', 'pending', 'verified', 'rejected'].map((v) => <option key={v}>{v}</option>)}</select>
      </Toolbar>
      <Err e={error} />
      {!data ? <Loading /> : data.length === 0 ? <Empty>No users match.</Empty> : (
        <div className="glass tbl-wrap"><table>
          <thead><tr><th>User</th><th>Role</th><th>KYC</th><th>Joined</th><th /></tr></thead>
          <tbody>{data.map((u) => (
            <tr key={u._id}>
              <td><b>{u.name}</b><small>{u.email}{u.company ? ` · ${u.company}` : ''}</small></td>
              <td><select className="gin sm" value={u.role} disabled={u._id === me.id} onChange={(e) => patch(u._id, { role: e.target.value }, 'Role updated')} aria-label={`Role for ${u.name}`}>{ROLE_OPTS.map(([v]) => <option key={v}>{v}</option>)}</select></td>
              <td><Badge v={u.kyc?.status || 'none'} />{u.kyc?.gstin || u.kyc?.iec ? <small>GST {u.kyc.gstin || '—'} · IEC {u.kyc.iec || '—'}</small> : null}</td>
              <td><small>{ago(u.createdAt)}</small></td>
              <td className="acts">
                {u.kyc?.status !== 'verified' && <button className="gbtn pri sm" onClick={() => patch(u._id, { kycStatus: 'verified' }, 'Verified')}>Verify</button>}
                {u.kyc?.status !== 'rejected' && u.kyc?.status !== 'none' && <button className="gbtn sm" onClick={() => patch(u._id, { kycStatus: 'rejected' }, 'Rejected')}>Reject</button>}
                <button className="gbtn sm" onClick={() => setModal({ type: 'pw', user: u })}>Password</button>
                {u._id !== me.id && <button className="gbtn danger sm" onClick={() => del(u)}>Delete</button>}
              </td>
            </tr>))}</tbody>
        </table></div>
      )}
          {modal?.type === 'new' && <FormModal title="New user" cta="Create user" onClose={() => setModal(null)}
        fields={[{ k: 'name', label: 'Name', required: true }, { k: 'email', label: 'Email', type: 'email', required: true }, { k: 'password', label: 'Password (8+ characters)', type: 'password', required: true },
          { k: 'company', label: 'Company' }, { k: 'role', label: 'Role', options: ROLE_OPTS }]}
        onSave={async (b) => { await request('/admin/users', { method: 'POST', body: b }); toast('User created'); reload(); }} />}
      {modal?.type === 'pw' && <FormModal title={`Set password for ${modal.user.email}`} cta="Set password" onClose={() => setModal(null)}
        fields={[{ k: 'password', label: 'New password (8+ characters)', type: 'password', required: true, wide: true }]}
        onSave={async (b) => { await request(`/admin/users/${modal.user._id}`, { method: 'PATCH', body: { password: b.password } }); toast('Password updated'); }} />}
    </>
  );
}

/* ------------------------------------------------------------------ offers */
export function Offers({ toast }) {
  const [status, setStatus] = useState('');
  const { data, error, reload } = useList(`/admin/offers?${qs({ status })}`);
  const { data: products } = useList('/products');
  const [modal, setModal] = useState(null);
  const call = (path, method, body, msg) => request(path, { method, body }).then(() => { toast(msg); reload(); }).catch((e) => toast(e.message, true));
  const fields = [
    { k: 'productSlug', label: 'Variety', options: (products || []).map((p) => [p.slug, p.name]) },
    { k: 'sellerCompany', label: 'Seller company', required: true }, { k: 'origin', label: 'Origin port' }, { k: 'destination', label: 'Destination' },
    { k: 'incoterm', label: 'Incoterm', options: ['FOB', 'CIF', 'CFR', 'EXW'].map((v) => [v, v]) },
    { k: 'quantityMT', label: 'Quantity (MT)', type: 'number', required: true }, { k: 'priceUsdPerMT', label: 'Price (USD/MT)', type: 'number', required: true },
    { k: 'status', label: 'Status', options: [['live', 'live'], ['review', 'review'], ['closed', 'closed']] },
  ];
  return (
    <>
      <Toolbar right={<button className="gbtn pri" onClick={() => setModal({})}>+ New offer</button>}>
        <Pills value={status} onChange={setStatus} options={[['', 'All'], ['review', 'In review'], ['live', 'Live'], ['closed', 'Closed']]} />
      </Toolbar>
      <Err e={error} />
      {!data ? <Loading /> : data.length === 0 ? <Empty>No offers here.</Empty> : (
        <div className="glass tbl-wrap"><table>
          <thead><tr><th>Variety</th><th>Lane</th><th>Qty</th><th>Price</th><th>Status</th><th /></tr></thead>
          <tbody>{data.map((o) => (
            <tr key={o._id}>
              <td><b>{o.product?.name || '—'}</b><small>{o.sellerCompany} · {ago(o.createdAt)}</small></td>
              <td>{o.origin} → {o.destination}<small>{o.incoterm}</small></td>
              <td>{o.quantityMT} MT</td><td className="hot">${o.priceUsdPerMT}</td><td><Badge v={o.status} /></td>
              <td className="acts">
                {o.status !== 'live' && <button className="gbtn pri sm" onClick={() => call(`/admin/offers/${o._id}`, 'PATCH', { status: 'live' }, 'Offer is live')}>Approve</button>}
                {o.status === 'live' && <button className="gbtn sm" onClick={() => call(`/admin/offers/${o._id}`, 'PATCH', { status: 'closed' }, 'Offer closed')}>Close</button>}
                <button className="gbtn sm" onClick={() => setModal({ ...o, productSlug: o.product?.slug })}>Edit</button>
                <button className="gbtn danger sm" onClick={() => confirm('Delete this offer?') && call(`/admin/offers/${o._id}`, 'DELETE', undefined, 'Offer deleted')}>Delete</button>
              </td>
            </tr>))}</tbody>
        </table></div>
      )}
      {modal && <FormModal title={modal._id ? 'Edit offer' : 'New offer'} fields={fields} initial={modal} onClose={() => setModal(null)}
        onSave={async (b) => { await request(modal._id ? `/admin/offers/${modal._id}` : '/admin/offers', { method: modal._id ? 'PATCH' : 'POST', body: b }); toast('Offer saved'); reload(); }} />}
    </>
  );
}

/* ---------------------------------------------------------------- products */
export function Products({ toast }) {
  const { data, error, reload } = useList('/products');
  const [modal, setModal] = useState(null);
  const fields = [
    { k: 'name', label: 'Name', required: true, wide: true },
    { k: 'family', label: 'Family', options: ['Basmati', 'Sella', 'Non-Basmati'].map((v) => [v, v]) },
    { k: 'processing', label: 'Processing', options: ['Steam', 'Raw', 'White', 'Golden Sella'].map((v) => [v, v]) },
    { k: 'length', label: 'Grain length (mm)', type: 'number' }, { k: 'broken', label: 'Broken %', type: 'number' },
    { k: 'moisture', label: 'Moisture %', type: 'number' }, { k: 'avgPriceUsd', label: 'Avg price (USD/MT, 0 = on request)', type: 'number' },
    { k: 'hsn', label: 'HSN code' },
  ];
  const flat = (p) => ({ ...p, length: p.grain?.length, broken: p.grain?.broken, moisture: p.grain?.moisture });
  return (
    <>
      <Toolbar right={<button className="gbtn pri" onClick={() => setModal({})}>+ New variety</button>}><span className="count">{data ? `${data.length} varieties` : ''}</span></Toolbar>
      <Err e={error} />
      {!data ? <Loading /> : (
        <div className="glass tbl-wrap"><table>
          <thead><tr><th>Variety</th><th>Spec</th><th>Avg price</th><th /></tr></thead>
          <tbody>{data.map((p) => (
            <tr key={p._id || p.slug}>
              <td><b>{p.name}</b><small>{p.family} · {p.processing} · HSN {p.hsn}</small></td>
              <td>{p.grain?.length} mm · ≤{p.grain?.broken}% broken · {p.grain?.moisture}% moisture</td>
              <td className="hot">{p.avgPriceUsd ? `$${p.avgPriceUsd}` : <small>on request</small>}</td>
              <td className="acts">{p._id && <>
                <button className="gbtn sm" onClick={() => setModal(flat(p))}>Edit</button>
                <button className="gbtn danger sm" onClick={() => confirm(`Delete ${p.name}?`) && request(`/admin/products/${p._id}`, { method: 'DELETE' }).then(() => { toast('Variety deleted'); reload(); }).catch((e) => toast(e.message, true))}>Delete</button></>}</td>
            </tr>))}</tbody>
        </table></div>
      )}
      {modal && <FormModal title={modal._id ? 'Edit variety' : 'New variety'} fields={fields} initial={modal} onClose={() => setModal(null)}
        onSave={async (b) => { await request(modal._id ? `/admin/products/${modal._id}` : '/admin/products', { method: modal._id ? 'PATCH' : 'POST', body: b }); toast('Variety saved'); reload(); }} />}
    </>
  );
}

/* ------------------------------------------------------------------- leads */
function csv(rows) {
  const cols = ['createdAt', 'role', 'name', 'company', 'email', 'phone', 'country', 'productSlug', 'quantityMT', 'status', 'message'];
  const cell = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`;
  return [cols.join(','), ...rows.map((r) => cols.map((c) => cell(r[c])).join(','))].join('\n');
}

export function Leads({ toast }) {
  const [q, setQ] = useState(''); const [role, setRole] = useState(''); const [status, setStatus] = useState('');
  const [open, setOpen] = useState(null);
  const dq = useDebounced(q);
  const { data, error, reload } = useList(`/admin/leads?${qs({ q: dq, role, status })}`);
  const patch = (id, body, msg) => request(`/admin/leads/${id}`, { method: 'PATCH', body }).then(() => { if (msg) toast(msg); reload(); }).catch((e) => toast(e.message, true));
  const download = () => {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([csv(data)], { type: 'text/csv' }));
    a.download = `leads-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click(); URL.revokeObjectURL(a.href);
  };
  return (
    <>
      <Toolbar right={<button className="gbtn" disabled={!data?.length} onClick={download}>Export CSV</button>}>
        <Search value={q} onChange={setQ} placeholder="Search leads" />
        <select className="gin" value={role} onChange={(e) => setRole(e.target.value)} aria-label="Filter by role"><option value="">All roles</option>{['buyer', 'seller', 'partner', 'agropreneur', 'bank'].map((v) => <option key={v}>{v}</option>)}</select>
        <Pills value={status} onChange={setStatus} options={[['', 'All'], ['new', 'New'], ['contacted', 'Contacted'], ['closed', 'Closed']]} />
      </Toolbar>
      <Err e={error} />
      {!data ? <Loading /> : data.length === 0 ? <Empty>No leads match.</Empty> : (
        <div className="glass tbl-wrap"><table>
          <thead><tr><th>Lead</th><th>Interest</th><th>Status</th><th>Received</th><th /></tr></thead>
          <tbody>{data.map((l) => (
            <Fragment key={l._id}>
              <tr className="click" onClick={() => setOpen(open === l._id ? null : l._id)}>
                <td><b>{l.name}</b><small>{l.email}{l.company ? ` · ${l.company}` : ''}</small></td>
                <td><Badge v={l.role} />{l.productSlug ? <small>{l.productSlug} · {l.quantityMT || '?'} MT</small> : null}</td>
                <td onClick={(e) => e.stopPropagation()}><select className="gin sm" value={l.status || 'new'} onChange={(e) => patch(l._id, { status: e.target.value }, 'Status updated')} aria-label={`Status for ${l.name}`}>{['new', 'contacted', 'closed'].map((v) => <option key={v}>{v}</option>)}</select></td>
                <td><small>{ago(l.createdAt)}</small></td>
                <td className="acts" onClick={(e) => e.stopPropagation()}><button className="gbtn danger sm" onClick={() => confirm('Delete this lead?') && request(`/admin/leads/${l._id}`, { method: 'DELETE' }).then(() => { toast('Lead deleted'); reload(); })}>Delete</button></td>
              </tr>
              {open === l._id && <tr className="detail"><td colSpan="5">
                <p>{l.message || <em className="muted">No message.</em>}</p>
                <small>{[l.phone, l.country].filter(Boolean).join(' · ')}</small>
                {(l.incoterm || l.destination || l.packaging || l.paymentTerms || l.targetPriceUsd) && <dl className="rfq">
                  {l.productSlug && <div><dt>Variety</dt><dd>{l.productSlug}</dd></div>}{l.quantityMT && <div><dt>Quantity</dt><dd>{l.quantityMT} MT</dd></div>}
                  {l.targetPriceUsd && <div><dt>Target price</dt><dd>${l.targetPriceUsd}/MT</dd></div>}{l.incoterm && <div><dt>Incoterm</dt><dd>{l.incoterm}</dd></div>}
                  {l.destination && <div><dt>Destination</dt><dd>{l.destination}</dd></div>}{l.packaging && <div><dt>Packaging</dt><dd>{l.packaging}</dd></div>}
                  {l.paymentTerms && <div><dt>Payment</dt><dd>{l.paymentTerms}</dd></div>}</dl>}
                <form onSubmit={(e) => { e.preventDefault(); patch(l._id, { note: new FormData(e.currentTarget).get('note') }, 'Note saved'); }}>
                  <input className="gin" name="note" defaultValue={l.note || ''} placeholder="Internal note…" aria-label="Internal note" /><button className="gbtn sm">Save note</button>
                </form>
              </td></tr>}
            </Fragment>))}</tbody>
        </table></div>
      )}
    </>
  );
}

/* ------------------------------------------------------------------- stats */
export function SiteStats({ toast }) {
  const { data, error, reload } = useList('/admin/stats');
  const [adding, setAdding] = useState(false);
  const save = (key, body) => request(`/admin/stats/${key}`, { method: 'PUT', body }).then(() => { toast('Saved — shown on the homepage'); reload(); }).catch((e) => toast(e.message, true));
  return (
    <>
      <Toolbar right={<button className="gbtn pri" onClick={() => setAdding(true)}>+ New stat</button>}><span className="muted">These numbers appear on the homepage. Only publish figures you can back up.</span></Toolbar>
      <Err e={error} />
      {!data ? <Loading /> : (
        <div className="stat-rows">{data.map((s) => (
          <form key={s.key} className="glass srow" onSubmit={(e) => { e.preventDefault(); const f = new FormData(e.currentTarget); save(s.key, { label: f.get('label'), value: f.get('value'), suffix: f.get('suffix') }); }}>
            <input className="gin" name="label" defaultValue={s.label} aria-label="Label" /><input className="gin n" name="value" type="number" defaultValue={s.value} aria-label="Value" /><input className="gin n" name="suffix" defaultValue={s.suffix} placeholder="unit" aria-label="Suffix" />
            <button className="gbtn pri sm">Save</button>
            <button type="button" className="gbtn danger sm" onClick={() => confirm('Delete this stat?') && request(`/admin/stats/${s.key}`, { method: 'DELETE' }).then(() => { toast('Stat deleted'); reload(); })}>Delete</button>
          </form>))}</div>
      )}
      {adding && <FormModal title="New stat" fields={[{ k: 'key', label: 'Key (letters, e.g. ports)', required: true }, { k: 'label', label: 'Label', required: true, wide: true }, { k: 'value', label: 'Value', type: 'number', required: true }, { k: 'suffix', label: 'Suffix (e.g. M, +)' }]}
        onClose={() => setAdding(false)} onSave={async (b) => { await request(`/admin/stats/${b.key}`, { method: 'PUT', body: b }); toast('Stat added'); reload(); }} />}
    </>
  );
}


/* ------------------------------------------------------------ site content */
export function SiteContent({ toast }) {
  const { data: saved, reload } = useList('/admin/content');
  const keys = Object.keys(CONTENT_META).filter((k) => k !== 'SETTINGS');
  const [key, setKey] = useState(keys[0]);
  const [text, setText] = useState(() => JSON.stringify(REGISTRY[keys[0]], null, 2));
  const [err, setErr] = useState('');
  const isEdited = (k) => saved?.some((r) => r.key === k);
  const pick = (k) => { setKey(k); setText(JSON.stringify(REGISTRY[k], null, 2)); setErr(''); };

  async function save() {
    setErr('');
    let data;
    try { data = JSON.parse(text); } catch (e) { return setErr(`That isn't valid JSON: ${e.message}`); }
    if (Array.isArray(data) !== Array.isArray(DEFAULTS[key])) return setErr(`This block must be a JSON ${Array.isArray(DEFAULTS[key]) ? 'list [ … ]' : 'object { … }'}.`);
    try {
      await request(`/admin/content/${key}`, { method: 'PUT', body: { data } });
      replaceInPlace(key, data); toast('Saved. Reload the site to see it.'); reload();
    } catch (e) { setErr(e.message); }
  }
  async function reset() {
    if (!confirm('Restore the built-in text for this block?')) return;
    try {
      await request(`/admin/content/${key}`, { method: 'DELETE' });
      replaceInPlace(key, DEFAULTS[key]); setText(JSON.stringify(DEFAULTS[key], null, 2)); toast('Restored to the built-in text'); reload();
    } catch (e) { setErr(e.message); }
  }

  return (
    <div className="cms">
      <aside className="glass cms-list" aria-label="Content blocks">
        {keys.map((k) => (
          <button key={k} className={k === key ? 'on' : ''} onClick={() => pick(k)}>
            <span>{CONTENT_META[k][0]}</span>{isEdited(k) && <i className="ab pending">edited</i>}
          </button>
        ))}
      </aside>
      <section className="glass cms-edit">
        <header>
          <div><h3>{CONTENT_META[key][0]}</h3><small>Shown on <a className="link" href={CONTENT_META[key][1]} target="_blank" rel="noreferrer">{CONTENT_META[key][1]}</a></small></div>
          <div className="acts"><button className="gbtn sm" onClick={() => { try { setText(JSON.stringify(JSON.parse(text), null, 2)); setErr(''); } catch (e) { setErr(`Not valid JSON: ${e.message}`); } }}>Format</button>
            <button className="gbtn danger sm" onClick={reset} disabled={!isEdited(key)}>Restore default</button>
            <button className="gbtn pri sm" onClick={save}>Save changes</button></div>
        </header>
        <p className="cms-hint">Edit the text inside the quotes. Keep the brackets, commas and quotation marks. “Format” checks that it is still valid. Changes apply site-wide.</p>
        <textarea className="cms-area" spellCheck="false" value={text} onChange={(e) => setText(e.target.value)} aria-label={`Content for ${CONTENT_META[key][0]}`} />
        {err && <p className="aerr" role="alert">{err}</p>}
      </section>
    </div>
  );
}

/* ---------------------------------------------------------------- settings */
export function Settings({ toast }) {
  const [v, setV] = useState({ ...SETTINGS });
  const [err, setErr] = useState('');
  async function save(e) {
    e.preventDefault(); setErr('');
    const data = { announcement: v.announcement.trim(), contactEmail: v.contactEmail.trim(), whatsapp: v.whatsapp.trim() };
    if (data.contactEmail && !/^\S+@\S+\.\S+$/.test(data.contactEmail)) return setErr('Enter a valid contact email.');
    try { await request('/admin/content/SETTINGS', { method: 'PUT', body: { data } }); replaceInPlace('SETTINGS', data); toast('Settings saved. Reload the site to see them.'); }
    catch (x) { setErr(x.message); }
  }
  return (
    <form className="glass card settings" onSubmit={save}>
      <header><h3>Site settings</h3></header>
      <label>Announcement banner<input className="gin" value={v.announcement} onChange={(e) => setV({ ...v, announcement: e.target.value })} placeholder="e.g. New: AIM corridor shipments from Mundra to Jebel Ali" /><small>Shown in a green bar above the header on every page. Leave empty to hide it.</small></label>
      <label>Public contact email<input className="gin" type="email" value={v.contactEmail} onChange={(e) => setV({ ...v, contactEmail: e.target.value })} placeholder="hello@yourdomain.com" /><small>Shown in the footer and on the Contact page.</small></label>
      <label>WhatsApp number<input className="gin" value={v.whatsapp} onChange={(e) => setV({ ...v, whatsapp: e.target.value })} placeholder="+91 98765 43210" /><small>Include the country code. Adds a WhatsApp link in the footer and on the Contact page.</small></label>
      {err && <p className="aerr" role="alert">{err}</p>}
      <div><button className="gbtn pri">Save settings</button></div>
    </form>
  );
}

/* ------------------------------------------------------------ activity log */
export function Activity() {
  const { data, error, reload } = useList('/admin/audit');
  return (
    <>
      <Toolbar right={<button className="gbtn" onClick={reload}>Refresh</button>}><span className="muted">The last 200 changes made by administrators.</span></Toolbar>
      <Err e={error} />
      {!data ? <Loading /> : data.length === 0 ? <Empty>No admin activity recorded yet.</Empty> : (
        <div className="glass tbl-wrap"><table>
          <thead><tr><th>When</th><th>Admin</th><th>Action</th><th>Details</th></tr></thead>
          <tbody>{data.map((a) => (
            <tr key={a._id}><td><small>{ago(a.createdAt)}</small></td><td>{a.adminEmail}</td><td><span className="ab">{a.method}</span> <small>{a.path}</small></td><td><small>{a.detail}</small></td></tr>
          ))}</tbody>
        </table></div>
      )}
    </>
  );
}
