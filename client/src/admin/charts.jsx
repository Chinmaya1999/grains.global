import { useId } from 'react';

// Smooth-ish area/line chart. series: [{ name, color, data: number[] }]
export function AreaChart({ labels, series, height = 220 }) {
  const id = useId().replace(/:/g, '');
  const W = 640, H = height, P = { l: 30, r: 10, t: 14, b: 26 };
  const max = Math.max(4, ...series.flatMap((s) => s.data));
  const x = (i) => P.l + (i / (labels.length - 1)) * (W - P.l - P.r);
  const y = (v) => H - P.b - (v / max) * (H - P.t - P.b);
  const line = (d) => d.map((v, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)} ${y(v).toFixed(1)}`).join(' ');
  const ticks = [0, Math.round(max / 2), max];
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="chart" role="img" aria-label="Activity over the last 14 days">
      <defs>{series.map((s, k) => (
        <linearGradient key={k} id={`${id}g${k}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={s.color} stopOpacity=".38" /><stop offset="1" stopColor={s.color} stopOpacity="0" />
        </linearGradient>))}
      </defs>
      {ticks.map((t) => <g key={t}><line x1={P.l} x2={W - P.r} y1={y(t)} y2={y(t)} stroke="rgba(255,255,255,.1)" strokeDasharray="3 5" /><text x={P.l - 8} y={y(t) + 4} textAnchor="end" className="ax">{t}</text></g>)}
      {labels.map((l, i) => (i % 3 === 0 || i === labels.length - 1) && <text key={l} x={x(i)} y={H - 6} textAnchor="middle" className="ax">{l.slice(5)}</text>)}
      {series.map((s, k) => (
        <g key={s.name}>
          <path d={`${line(s.data)} L${x(s.data.length - 1)} ${H - P.b} L${x(0)} ${H - P.b}Z`} fill={`url(#${id}g${k})`} />
          <path d={line(s.data)} fill="none" stroke={s.color} strokeWidth="2.2" strokeLinejoin="round" strokeLinecap="round" />
          {s.data.map((v, i) => <circle key={i} cx={x(i)} cy={y(v)} r="3.2" fill={s.color}><title>{`${s.name} · ${labels[i]}: ${v}`}</title></circle>)}
        </g>
      ))}
    </svg>
  );
}

export function Donut({ data, colors, label }) {
  const entries = Object.entries(data).filter(([, n]) => n > 0);
  const total = entries.reduce((a, [, n]) => a + n, 0);
  const R = 52, C = 2 * Math.PI * R;
  let acc = 0;
  return (
    <div className="donut">
      <svg viewBox="0 0 140 140" role="img" aria-label={label}>
        <circle cx="70" cy="70" r={R} fill="none" stroke="rgba(255,255,255,.08)" strokeWidth="16" />
        {entries.map(([k, n], i) => {
          const len = (n / total) * C;
          const el = <circle key={k} cx="70" cy="70" r={R} fill="none" stroke={colors[i % colors.length]} strokeWidth="16" strokeDasharray={`${Math.max(0, len - 3)} ${C}`} strokeDashoffset={-acc} transform="rotate(-90 70 70)"><title>{`${k}: ${n}`}</title></circle>;
          acc += len;
          return el;
        })}
        <text x="70" y="68" textAnchor="middle" className="dn">{total}</text>
        <text x="70" y="86" textAnchor="middle" className="ax">{label}</text>
      </svg>
      <ul>{entries.length === 0 ? <li className="muted">No data yet</li> : entries.map(([k, n], i) => <li key={k}><i style={{ background: colors[i % colors.length] }} />{k}<b>{n}</b></li>)}</ul>
    </div>
  );
}
