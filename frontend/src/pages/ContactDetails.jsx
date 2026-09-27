import { useEffect, useState } from 'react';
import { ArrowLeft, Building2, Mail, Pencil, Phone, Trash2 } from 'lucide-react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { api, sendJson } from '../api.js';
import ContactForm from '../components/ContactForm.jsx';
import Modal from '../components/Modal.jsx';
import PageHeader from '../components/PageHeader.jsx';
import { initials, money } from '../utils.js';

export default function ContactDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [contact, setContact] = useState(null);
  const [deals, setDeals] = useState([]);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([api('/contacts'), api('/deals')]).then(([contacts, allDeals]) => {
      setContact(contacts.find((item) => item._id === id) || null);
      setDeals(allDeals.filter((deal) => (deal.contact?._id || deal.contact) === id));
    }).catch((requestError) => setError(requestError.message));
  }, [id]);

  async function saveContact(form) {
    setSaving(true);
    setError('');
    try {
      setContact(await api(`/contacts/${id}`, sendJson('PUT', form)));
      setEditing(false);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSaving(false);
    }
  }

  async function deleteContact() {
    if (!window.confirm(`Delete ${contact.name}? This cannot be undone.`)) return;
    try {
      await api(`/contacts/${id}`, { method: 'DELETE' });
      navigate('/contacts', { replace: true });
    } catch (requestError) {
      setError(requestError.message);
    }
  }

  if (error && !contact) return <div className="page-wrap"><Link className="back-link" to="/contacts"><ArrowLeft size={16} /> Contacts</Link><div className="alert">{error}</div></div>;
  if (!contact) return <div className="page-wrap"><div className="loading-line">Loading contact…</div></div>;

  return <div className="page-wrap">
    <Link className="back-link" to="/contacts"><ArrowLeft size={16} /> All contacts</Link>
    <PageHeader eyebrow="CONTACT PROFILE" title={contact.name} description={contact.company || 'Personal contact'} action={<div className="button-row"><button className="button button-secondary" onClick={() => setEditing(true)}><Pencil size={16} /> Edit</button><button className="button button-danger" onClick={deleteContact}><Trash2 size={16} /> Delete</button></div>} />
    {error && <div className="alert" role="alert">{error}</div>}
    <div className="details-layout">
      <section className="profile-panel"><div className="profile-top"><div className="avatar profile-avatar">{initials(contact.name)}</div><div><h2>{contact.name}</h2><span>{contact.company || 'No company added'}</span></div></div>
        <div className="details-divider" /><div className="eyebrow">CONTACT INFORMATION</div>
        <div className="detail-line"><Mail size={17} /><div><span>Email</span><a href={`mailto:${contact.email}`}>{contact.email}</a></div></div>
        <div className="detail-line"><Phone size={17} /><div><span>Phone</span>{contact.phone ? <a href={`tel:${contact.phone}`}>{contact.phone}</a> : <p>Not added</p>}</div></div>
        <div className="detail-line"><Building2 size={17} /><div><span>Company</span><p>{contact.company || 'Not added'}</p></div></div>
        {contact.notes && <><div className="details-divider" /><div className="eyebrow">NOTES</div><p className="profile-notes">{contact.notes}</p></>}
      </section>
      <section className="related-section"><div className="section-head"><div><div className="eyebrow">OPPORTUNITIES</div><h2>Related deals</h2></div><Link to="/deals" className="text-link">Open board <ArrowLeft className="arrow-right" size={15} /></Link></div>
        {deals.length ? <div className="related-list">{deals.map((deal) => <Link to="/deals" className="related-deal" key={deal._id}><div><strong>{deal.title}</strong><span className={`stage-pill stage-${deal.stage.toLowerCase()}`}>{deal.stage}</span></div><strong>{money(deal.value)}</strong></Link>)}</div> : <div className="empty-state compact"><strong>No deals yet</strong><p>Deals for this contact will appear here.</p><Link to="/deals" className="text-link">Go to deals <ArrowLeft className="arrow-right" size={15} /></Link></div>}
      </section>
    </div>
    {editing && <Modal title="Edit contact" onClose={() => setEditing(false)}><ContactForm initialValue={contact} onSave={saveContact} onCancel={() => setEditing(false)} saving={saving} /></Modal>}
  </div>;
}