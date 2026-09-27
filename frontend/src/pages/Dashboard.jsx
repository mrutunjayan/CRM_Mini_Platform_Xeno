import { useEffect, useState } from 'react';
import { ArrowRight, BriefcaseBusiness, ContactRound, Plus, Trophy, XCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { api } from '../api.js';
import { useAuth } from '../context/AuthContext.jsx';
import PageHeader from '../components/PageHeader.jsx';
import { money } from '../utils.js';

export default function Dashboard() {
  const { user } = useAuth();
  const [summary, setSummary] = useState({ contacts: [], deals: [] });
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([api('/contacts'), api('/deals')])
      .then(([contacts, deals]) => setSummary({ contacts, deals }))
      .catch((requestError) => setError(requestError.message));
  }, []);

  const wonDeals = summary.deals.filter((deal) => deal.stage === 'Won');
  const lostDeals = summary.deals.filter((deal) => deal.stage === 'Lost');
  const metrics = [
    { label: 'Total contacts', value: summary.contacts.length, icon: ContactRound, tone: 'green' },
    { label: 'Total deals', value: summary.deals.length, icon: BriefcaseBusiness, tone: 'blue' },
    { label: 'Won deals', value: wonDeals.length, icon: Trophy, tone: 'yellow' },
    { label: 'Lost deals', value: lostDeals.length, icon: XCircle, tone: 'rose' }
  ];

  return <div className="page-wrap">
    <PageHeader eyebrow="YOUR WORKSPACE" title={`Good ${timeOfDay()}, ${user?.name?.split(' ')[0] || 'there'}.`} description="A clear view of the relationships you're building." action={<Link className="button button-primary" to="/contacts"><Plus size={17} /> Add contact</Link>} />
    {error && <div className="alert" role="alert">{error}</div>}
    <section className="metric-grid" aria-label="CRM summary">
      {metrics.map(({ label, value, icon: Icon, tone }) => <div className="metric" key={label}><div className={`metric-icon ${tone}`}><Icon size={18} /></div><div className="metric-value">{value}</div><div className="metric-label">{label}</div></div>)}
    </section>
    <section className="dashboard-lower">
      <div className="section-head"><div><div className="eyebrow">PIPELINE</div><h2>Recent deals</h2></div><Link className="text-link" to="/deals">View board <ArrowRight size={15} /></Link></div>
      {summary.deals.length ? <div className="recent-list">
        {summary.deals.slice(0, 5).map((deal) => <Link to="/deals" className="recent-row" key={deal._id}><div className="recent-mark"><BriefcaseBusiness size={17} /></div><div className="recent-main"><strong>{deal.title}</strong><span>{deal.contact?.name || 'Contact'} · {deal.stage}</span></div><strong className="recent-value">{money(deal.value)}</strong><ArrowRight className="recent-arrow" size={16} /></Link>)}
      </div> : <div className="empty-state compact"><div className="empty-mark"><BriefcaseBusiness size={21} /></div><strong>Your pipeline starts here</strong><p>Add a deal and keep every next step visible.</p><Link to="/deals" className="button button-secondary"><Plus size={16} /> Create a deal</Link></div>}
    </section>
  </div>;
}

function timeOfDay() {
  const hour = new Date().getHours();
  if (hour < 12) return 'morning';
  if (hour < 18) return 'afternoon';
  return 'evening';
}