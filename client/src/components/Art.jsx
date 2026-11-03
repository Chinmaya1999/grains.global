import { useMemo, useState } from 'react';

// ---- icons (24px stroke set) ----
const ICONS = {
  cart: 'M3 4h2l2.4 11h10.2L20 7H6.2M9 20a1 1 0 100-2 1 1 0 000 2zm8 0a1 1 0 100-2 1 1 0 000 2z',
  tag: 'M3 12V4h8l10 10-8 8L3 12zm5-5h.01',
  bank: 'M3 10l9-6 9 6M5 10v8M9 10v8M15 10v8M19 10v8M3 20h18',
  people: 'M9 11a3.5 3.5 0 100-7 3.5 3.5 0 000 7zM2 20c0-3.5 3-5.5 7-5.5s7 2 7 5.5M17 5.5a3 3 0 010 6M19 15c2 .7 3 2.2 3 5',
  search: 'M11 18a7 7 0 100-14 7 7 0 000 14zm9 3l-4.5-4.5',
  globe: 'M12 21a9 9 0 100-18 9 9 0 000 18zM3 12h18M12 3c3 3 3 15 0 18M12 3c-3 3-3 15 0 18',
  leaf: 'M5 19c0-9 5-14 15-14 0 10-5 15-14 15M5 19c3-5 6-8 10-10',
  calc: 'M6 3h12v18H6zM9 7h6M9 12h.01M12 12h.01M15 12h.01M9 16h.01M12 16h.01M15 16h.01',
  spark: 'M12 3v5M12 16v5M3 12h5M16 12h5M6 6l3 3M15 15l3 3M18 6l-3 3M9 15l-3 3',
  check: 'M5 12.5l4.5 4.5L19 7',
  arrow: 'M5 12h14M13 6l6 6-6 6',
  chev: 'M6 9l6 6 6-6',
  home: 'M3 11l9-8 9 8M5 10v10h5v-6h4v6h5V10',
  shield: 'M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6l8-3zM9 12l2 2 4-4',
  eye: 'M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12zM12 15a3 3 0 100-6 3 3 0 000 6z',
  eyeoff: 'M3 3l18 18M10.6 6.2A9.7 9.7 0 0112 6c6.4 0 10 6 10 6a17 17 0 01-3.2 3.9M6.6 7.6A16.6 16.6 0 002 12s3.6 7 10 7a9.6 9.6 0 004-.9M9.9 9.9a3 3 0 004.2 4.2',
  alert: 'M12 3l10 18H2L12 3zM12 10v5M12 18h.01',
  dot: 'M12 8.5a3.5 3.5 0 100 7 3.5 3.5 0 000-7z',
  doc: 'M7 3h7l5 5v13H7zM14 3v5h5M10 13h6M10 17h6',
  chart: 'M4 20V4M4 20h16M8 16v-5M12 16V8M16 16v-3',
  book: 'M4 5a2 2 0 012-2h13v16H6a2 2 0 00-2 2V5zM4 19a2 2 0 012-2h13',
  mail: 'M3 6h18v12H3zM3 7l9 7 9-7',
  cpu: 'M6 6h12v12H6zM9 9h6v6H9zM4 9h2M4 15h2M18 9h2M18 15h2M9 4v2M15 4v2M9 18v2M15 18v2',
  heart: 'M12 20s-7-4.5-7-10a4 4 0 017-2.5A4 4 0 0119 10c0 5.5-7 10-7 10z',
  building: 'M5 21V5l7-2 7 2v16M9 9h2M13 9h2M9 13h2M13 13h2M10 21v-4h4v4',
  compass: 'M12 21a9 9 0 100-18 9 9 0 000 18zM15.5 8.5l-2 5-5 2 2-5 5-2z',
  lock: 'M6 11h12v9H6zM8 11V8a4 4 0 018 0v3',
  star: 'M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9z',
  user: 'M12 12a4 4 0 100-8 4 4 0 000 8zM4 21c0-4 4-6 8-6s8 2 8 6',
  menu: 'M4 7h16M4 12h16M4 17h16',
  close: 'M6 6l12 12M18 6L6 18',
  handshake: 'M3 12l4-4 4 2 4-2 6 5-5 5-3-1-3 2-7-6zM7 8L3 12',
  sprout: 'M12 21v-9M12 12c0-4-3-6-7-6 0 4 3 6 7 6zM12 14c0-3 2-5 6-5 0 3-2 5-6 5z',
  store: 'M4 9l1-5h14l1 5M4 9a2.5 2.5 0 005 0 2.5 2.5 0 006 0 2.5 2.5 0 005 0M5 11v9h14v-9M10 20v-5h4v5',
};
export function Icon({ n, size = 22, className = '' }) {
  return (
    <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d={ICONS[n]} />
    </svg>
  );
}

// ---- fallback scenes, drawn in SVG, used until real photos are added to /public/images ----
const Sky = ({ id }) => (
  <defs>
    <linearGradient id={`${id}s`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#bfe0f0" /><stop offset="1" stopColor="#f7f3d8" /></linearGradient>
    <linearGradient id={`${id}f`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#8cc356" /><stop offset="1" stopColor="#3c8a30" /></linearGradient>
  </defs>
);
const Paddy = ({ id, y = 150 }) => (
  <g>
    <rect x="0" y={y} width="400" height={240 - y} fill={`url(#${id}f)`} />
    {Array.from({ length: 9 }, (_, i) => <path key={i} d={`M${200 + (i - 4) * 12} ${y} L${(i - 4) * 90 + 200} 240`} stroke="#2f7a28" strokeOpacity=".45" strokeWidth="2" />)}
  </g>
);
const Blades = () => (
  <g fill="#2e7d2b">{Array.from({ length: 16 }, (_, i) => <path key={i} d={`M${i * 26 + 4} 240 Q${i * 26 + 10} ${190 - (i % 4) * 10} ${i * 26 + 24} ${176 - (i % 3) * 14} Q${i * 26 + 14} ${200} ${i * 26 + 14} 240Z`} opacity=".85" />)}</g>
);


// ---- rice-planting sunrise (login / register background) ----
const SUN = [900, 250];
const rng = (seed) => { let x = seed; return () => ((x = (x * 16807) % 2147483647) - 1) / 2147483646; };

function Planter({ x, y, k = 1, flip = false }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${flip ? -k : k} ${k})`}>
      <ellipse cx="14" cy="4" rx="46" ry="6" fill="#2b5b57" opacity=".35" />
      <path d="M26 -8 L16 4 M42 -6 L40 4" stroke="#3b4a2a" strokeWidth="9" strokeLinecap="round" />
      <path d="M-2 -52 Q18 -44 34 -16" stroke="#46692f" strokeWidth="19" strokeLinecap="round" fill="none" />
      <path d="M-4 -50 L-20 -6" stroke="#46692f" strokeWidth="8" strokeLinecap="round" />
      <circle cx="-6" cy="-60" r="10" fill="#7a5233" />
      <path d="M-34 -64 L-6 -92 L22 -64 Q-6 -58 -34 -64Z" fill="#d9b25a" stroke="#a7822f" strokeWidth="2" />
      <path d="M-20 -6 q-4 -8 2 -16" stroke="#2f7d2e" strokeWidth="3" fill="none" strokeLinecap="round" />
    </g>
  );
}

function PaddyScene() {
  const { dark, light, stalks } = useMemo(() => {
    let dark = '', light = '';
    // Seedling rows fill the full width at every depth; spacing grows toward the viewer.
    for (let k = 0; k < 18; k++) {
      const t = Math.pow((k + 1) / 18, 1.9), y = 420 + 480 * t, sc = 0.05 + t * 1.05, sz = 4 + 34 * sc;
      const N = Math.round(46 + 44 * (1 - sc)), span = 2100 * (0.78 + 0.42 * sc);
      for (let n = 0; n < N; n++) {
        const x = 800 + ((n + 0.5 + (k % 2) * 0.5) / N - 0.5) * span;
        if (x < -40 || x > 1640) continue;
        const f = (v) => v.toFixed(1);
        const d = `M${f(x)} ${f(y)}q${f(-sz * 0.15)} ${f(-sz * 0.7)} ${f(-sz * 0.5)} ${f(-sz)}M${f(x)} ${f(y)}q${f(sz * 0.02)} ${f(-sz * 0.8)} ${f(sz * 0.05)} ${f(-sz * 1.15)}M${f(x)} ${f(y)}q${f(sz * 0.15)} ${f(-sz * 0.7)} ${f(sz * 0.5)} ${f(-sz)}`;
        if (n % 2) light += d; else dark += d;
      }
    }
    const rand = rng(41);
    const stalks = Array.from({ length: 34 }, (_, i) => {
      const x = (i / 34) * 1700 - 50 + rand() * 40, h = 190 + rand() * 260, dx = (rand() - 0.5) * 90;
      return { x, h, dx, dur: 3.2 + rand() * 2.6, delay: -rand() * 5, big: h > 330 };
    });
    return { dark, light, stalks };
  }, []);

  return (
    <svg viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid slice" aria-hidden className="paddy">
      <defs>
        <linearGradient id="pk" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#7cc4ec" /><stop offset=".5" stopColor="#ffe3a0" /><stop offset="1" stopColor="#ffb85c" /></linearGradient>
        <radialGradient id="pg"><stop offset="0" stopColor="#fff6c4" stopOpacity="1" /><stop offset=".25" stopColor="#ffe48a" stopOpacity=".7" /><stop offset="1" stopColor="#ffc060" stopOpacity="0" /></radialGradient>
        <radialGradient id="ps"><stop offset="0" stopColor="#fffbe0" /><stop offset="1" stopColor="#ffd75e" /></radialGradient>
        <linearGradient id="pw" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#ffd990" /><stop offset=".35" stopColor="#a6d2d2" /><stop offset="1" stopColor="#3f8a82" /></linearGradient>
        <linearGradient id="pm" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#fff0c8" stopOpacity="0" /><stop offset="1" stopColor="#fff0c8" stopOpacity=".75" /></linearGradient>
      </defs>
      <rect width="1600" height="900" fill="url(#pk)" />
      <circle cx={SUN[0]} cy={SUN[1]} r="330" fill="url(#pg)" />
      <g className="rays" style={{ transformOrigin: `${SUN[0]}px ${SUN[1]}px`, transformBox: 'view-box' }}>
        {Array.from({ length: 18 }, (_, i) => {
          const a = (i / 18) * Math.PI * 2, w = 0.07, R1 = 110, R2 = 700;
          const p = (r, da) => `${SUN[0] + r * Math.cos(a + da)},${SUN[1] + r * Math.sin(a + da)}`;
          return <polygon key={i} points={`${p(R1, -w / 6)} ${p(R2, -w)} ${p(R2, w)} ${p(R1, w / 6)}`} fill="#fff3b8" opacity=".16" />;
        })}
      </g>
      <circle cx={SUN[0]} cy={SUN[1]} r="82" fill="url(#ps)" />
      <g fill="#fff" opacity=".7">
        <ellipse className="cloud c1" cx="300" cy="140" rx="150" ry="26" /><ellipse className="cloud c1" cx="390" cy="118" rx="90" ry="24" />
        <ellipse className="cloud c2" cx="1320" cy="120" rx="170" ry="24" /><ellipse className="cloud c2" cx="1230" cy="100" rx="90" ry="22" />
        <ellipse className="cloud c3" cx="640" cy="60" rx="110" ry="16" />
      </g>
      <g stroke="#2d4a3a" strokeWidth="3" fill="none" strokeLinecap="round" opacity=".6">
        {[0, 1, 2].map((i) => <path key={i} className="bird" style={{ animationDelay: `${-i * 4}s` }} d={`M${520 + i * 46} ${170 + i * 22}q10 -12 20 0q10 -12 20 0`} />)}
      </g>
      <path d="M0 390L140 300 300 360 480 262 660 350 860 292 1060 362 1260 276 1440 340 1600 296V440H0Z" fill="#a6c98f" opacity=".85" />
      <path d="M0 410Q200 340 420 395T820 385T1240 392T1600 372V440H0Z" fill="#6fa56a" />
      <rect y="340" width="1600" height="110" fill="url(#pm)" />
      <path d="M0 425Q300 405 600 424T1200 420T1600 426V450H0Z" fill="#8cc35f" />
      <rect y="440" width="1600" height="460" fill="url(#pw)" />
      {[0, 1, 2, 3, 4, 5, 6].map((i) => (
        <ellipse key={i} className="shimmer" style={{ animationDelay: `${-i * 0.5}s` }} cx={SUN[0] + (i % 2 ? 8 : -8)} cy={462 + i * 44} rx={30 + i * 26} ry={3 + i * 0.5} fill="#fff4b8" opacity=".55" />
      ))}
      <path d={dark} stroke="#2f7d2e" strokeWidth="2.4" fill="none" strokeLinecap="round" />
      <path d={light} stroke="#63b53c" strokeWidth="2.4" fill="none" strokeLinecap="round" />
      <Planter x={640} y={540} k={0.62} /><Planter x={760} y={574} k={0.78} flip /><Planter x={1010} y={500} k={0.4} />
      {stalks.map((st, i) => {
        const tx = st.x + st.dx * 1.8, ty = 900 - st.h, ang = Math.atan2(st.dx * 0.9, st.h * 0.5) * (180 / Math.PI);
        return (
          <g key={i} className="sway" style={{ animationDuration: `${st.dur}s`, animationDelay: `${st.delay}s`, transformOrigin: `${st.x}px 900px`, transformBox: 'view-box' }}>
            <path d={`M${st.x} 900Q${st.x + st.dx} ${900 - st.h * 0.55} ${tx} ${ty}`} stroke={st.big ? '#2f8a2c' : '#3f9a35'} strokeWidth={st.big ? 6 : 4.5} fill="none" strokeLinecap="round" />
            <path d={`M${st.x + 2} ${900 - st.h * 0.3}q${st.dx * 0.3 - 40} ${-st.h * 0.2} ${st.dx * 0.4 - 90} ${-st.h * 0.3}`} stroke="#4aa83b" strokeWidth="4" fill="none" strokeLinecap="round" />
            <g transform={`translate(${tx} ${ty}) rotate(${ang})`}>
              {[0, 1, 2, 3, 4, 5, 6].map((j) => <g key={j}><ellipse cx="-4" cy={j * 11} rx="4.5" ry="9" fill={j % 2 ? '#e8bb3a' : '#d9a22a'} transform={`rotate(-24 -4 ${j * 11})`} /><ellipse cx="4" cy={j * 11 + 5} rx="4.5" ry="9" fill={j % 2 ? '#d9a22a' : '#ecc24a'} transform={`rotate(24 4 ${j * 11 + 5})`} /></g>)}
            </g>
          </g>
        );
      })}
    </svg>
  );
}

function Scene({ kind, tone }) {
  if (kind === 'paddy') return <PaddyScene />;
  const id = `a${kind}`;
  if (kind === 'port') return (
    <svg viewBox="0 0 400 240" preserveAspectRatio="xMidYMid slice" aria-hidden>
      <Sky id={id} /><rect width="400" height="240" fill={`url(#${id}s)`} />
      <rect y="150" width="400" height="90" fill="#2a7aa0" /><rect y="150" width="400" height="6" fill="#5aa7c7" />
      {[[210, '#c0392b'], [238, '#2f7d5b'], [266, '#e0a030'], [294, '#2d5d8a'], [322, '#b85a2b']].map(([x, c], i) => (
        <g key={i}>{[0, 1, 2].map((r) => <rect key={r} x={x} y={118 - r * 14 + (i % 2) * 6} width="26" height="13" fill={c} stroke="#0003" />)}</g>
      ))}
      <path d="M170 150h210l-18 22H190z" fill="#1c2b36" />
      <g stroke="#e8902c" strokeWidth="4" fill="none"><path d="M40 150V50h120M40 60l60-18M100 42v-14M150 52v40" /></g>
      <g stroke="#e8902c" strokeWidth="2.5"><path d="M60 150V70M120 150V70M40 90h80" /></g>
    </svg>
  );
  if (kind === 'rice') {
    const grain = tone || '#fffdf4';
    return (
      <svg viewBox="0 0 400 240" preserveAspectRatio="xMidYMid slice" aria-hidden>
        <Sky id={id} /><rect width="400" height="240" fill="#e9efd8" />
        <Paddy id={id} y={40} /><rect y="40" width="400" height="200" fill="#e9efd8" opacity=".55" />
        <ellipse cx="200" cy="170" rx="132" ry="42" fill="#7a4a24" /><ellipse cx="200" cy="160" rx="128" ry="36" fill="#a8703a" />
        <path d="M80 160Q100 70 200 66Q300 70 320 160Q200 200 80 160Z" fill={grain} />
        {Array.from({ length: 60 }, (_, i) => <ellipse key={i} cx={110 + ((i * 53) % 180)} cy={92 + ((i * 29) % 64)} rx="9" ry="2.6" fill="#0001" transform={`rotate(${(i * 47) % 180} ${110 + ((i * 53) % 180)} ${92 + ((i * 29) % 64)})`} />)}
      </svg>
    );
  }
  if (kind === 'people') return (
    <svg viewBox="0 0 400 240" preserveAspectRatio="xMidYMid slice" aria-hidden>
      <Sky id={id} /><rect width="400" height="240" fill={`url(#${id}s)`} /><Paddy id={id} y={150} />
      {tone === 'woman' ? (
        <g><path d="M240 240c0-50 20-80 60-80s60 30 60 80z" fill="#1f8a52" /><circle cx="300" cy="122" r="26" fill="#b9805a" /><path d="M272 122c0-28 56-28 56 0v-6c0-32-56-32-56 0z" fill="#1f8a52" />
          <g stroke="#d8aa2a" strokeWidth="3" fill="#d8aa2a">{[0, 1, 2, 3, 4].map((i) => <path key={i} d={`M${250 + i * 8} 220 Q${240 + i * 12} 170 ${232 + i * 16} 130`} fill="none" />)}</g></g>
      ) : (
        <g><path d="M120 240c0-40 14-64 48-64s48 24 48 64z" fill="#243447" /><circle cx="168" cy="146" r="22" fill="#c68b64" />
          <path d="M224 240c0-40 14-64 48-64s48 24 48 64z" fill="#1b2a3a" /><circle cx="272" cy="146" r="22" fill="#a9724c" /><path d="M200 210h40" stroke="#c68b64" strokeWidth="14" strokeLinecap="round" /></g>
      )}
      <Blades />
    </svg>
  );
  // default: hero landscape
  return (
    <svg viewBox="0 0 400 240" preserveAspectRatio="xMidYMid slice" aria-hidden>
      <Sky id={id} /><rect width="400" height="240" fill={`url(#${id}s)`} />
      <path d="M0 140Q80 110 170 130T400 120V160H0z" fill="#a9cf86" /><Paddy id={id} y={148} /><Blades />
    </svg>
  );
}

// Shows /images/<name>.jpg when it exists, otherwise the drawn scene.
export function Photo({ name, alt = '', scene, tone, className = '' }) {
  const [failed, setFailed] = useState(false);
  return (
    <div className={`photo ${className}`}>
      {failed
        ? <div className="photo-art" role="img" aria-label={alt}><Scene kind={scene || name} tone={tone} /></div>
        : <img src={`/images/${name}.jpg`} alt={alt} loading="lazy" onError={() => setFailed(true)} />}
    </div>
  );
}
