import { Link } from 'react-router-dom';

// Eight grains in a ring, clockwise from the top.
const COLORS = ['#5f8a2a', '#7fae3c', '#a4cf3c', '#bdd281', '#ffc20e', '#ff7f27', '#dc5a0f', '#9a3a0c'];

export function LogoMark({ size = 38 }) {
  return (
    <svg viewBox="0 0 100 100" width={size} height={size} aria-hidden>
      {COLORS.map((c, i) => {
        const a = i * 45, r = (a * Math.PI) / 180;
        const cx = 50 + 37.5 * Math.sin(r), cy = 50 - 37.5 * Math.cos(r);
        return <ellipse key={i} cx={cx} cy={cy} rx="7.9" ry="12.5" fill={c} transform={`rotate(${a} ${cx} ${cy})`} />;
      })}
    </svg>
  );
}

export function Logo({ to = '/' }) {
  return (
    <Link to={to} className="logo" aria-label="Grains Global home">
      <LogoMark />
      <span className="lg"><b>GRAINS</b><i>global</i></span>
    </Link>
  );
}
