import { useSearchParams } from 'react-router-dom';
import { Reveal } from '../components/bits.jsx';
import LeadForm from '../components/LeadForm.jsx';

const TABS = [['buyer', 'Buyer'], ['seller', 'Seller'], ['partner', 'Partner'], ['bank', 'Bank / NBFC'], ['agropreneur', 'AgroPreneur']];

export default function Join() {
  const [params, setParams] = useSearchParams();
  const role = TABS.some(([k]) => k === params.get('role')) ? params.get('role') : 'buyer';
  return (
    <div className="page">
      <Reveal><p className="tag">JOIN</p><h1 className="h1">Tell us your seat at the table.</h1></Reveal>
      <div className="chips">{TABS.map(([k, l]) => <button key={k} className={k === role ? 'on' : ''} onClick={() => setParams({ role: k })}>{l}</button>)}</div>
      <div className="panel"><LeadForm key={role} role={role} cta="Send my details" /></div>
    </div>
  );
}
