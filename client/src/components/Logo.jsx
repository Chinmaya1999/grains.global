import { Link } from 'react-router-dom';

export function LogoMark({ size = 38 }) {
  return <img src="/logo-mark.png" width={size} height={size} alt="" aria-hidden="true" decoding="async" style={{ display: 'block', objectFit: 'contain' }} />;
}

export function Logo({ to = '/' }) {
  return (
    <Link to={to} className="logo" aria-label="Agri Global home">
      <LogoMark />
      <span className="lg"><b>AGRI</b><i>global</i></span>
    </Link>
  );
}
