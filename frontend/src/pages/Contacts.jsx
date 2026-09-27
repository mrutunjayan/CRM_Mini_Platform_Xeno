import { useEffect, useMemo, useState } from 'react';
import { Building2, ContactRound, Mail, Plus, Search } from 'lucide-react';
import { Link } from 'react-router-dom';
import { api, sendJson } from '../api.js';
import ContactForm from '../components/ContactForm.jsx';
import Modal from '../components/Modal.jsx';
import PageHeader from '../components/PageHeader.jsx';
import { initials } from '../utils.js';

export default function Contacts() {
  const [contacts, setContacts] = useState([]);
  const [query, setQuery] = useState('');
  const [adding, setAdding] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  async function loadContacts() {
    try {
      setContacts(await api('/contacts'));
    } catch (requestError) {
      setError(requestError.message);
    }
  }

  useEffect(() => { loadContacts(); }, []);

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return contacts;
    return contacts.filter((contact) => [contact.name, contact.email, contact.company, contact.phone]
      .some((value) => value?.toLowerCase().includes(needle)));
  }, [contacts, query]);

  async function saveContact(form) {
    setSaving(true);
    setError('');
    try {
      const saved = await api('/contacts', sendJson('POST', form));
      setContacts((current) => [...current, saved].sort((a, b) => a.name.localeCompare(b.name)));
      setAdding(false);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSaving(false);
    }
  }

  return <div className="page-wrap">
    <PageHeader eyebrow="RELATIONSHIPS" title="Contacts" description={`${contacts.length} ${contacts.length === 1 ? 'person' : 'people'} in your network.`} action={<button className="button button-primary" onClick={() => setAdding(true)}><Plus size={17} /> Add contact</button>} />
    {error && <div className="alert" role="alert">{error}</div>}
    <section className="table-section">
      <div className="table-toolbar"><div className="search-wrap"><Search size={17} /><input aria-label="Search contacts" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search name, company, email…" /><kbd>⌘ K</kbd></div><span className="results-count">{filtered.length} {filtered.length === 1 ? 'contact' : 'contacts'}</span></div>
      {filtered.length ? <div className="contact-table">
        <div className="contact-table-head"><span>NAME</span><span>COMPANY</span><span>EMAIL</span><span>PHONE</span></div>
        {filtered.map((contact) => <Link to={`/contacts/${contact._id}`} className="contact-row" key={contact._id}>
          <div className="contact-person"><div className="avatar contact-avatar">{initials(contact.name)}</div><div><strong>{contact.name}</strong><span>{contact.notes || 'No notes yet'}</span></div></div>
          <div className="contact-cell company-cell"><Building2 size={15} />{contact.company || '—'}</div>
          <div className="contact-cell email-cell"><Mail size={15} />{contact.email}</div>
          <div className="contact-cell phone-cell">{contact.phone || '—'}</div>
        </Link>)}
      </div> : <div className="empty-state"><div className="empty-mark"><ContactRound size={22} /></div><strong>{query ? 'No matches found' : 'A good relationship starts somewhere'}</strong><p>{query ? 'Try another name, company, or email.' : 'Add your first contact to start building your CRM.'}</p>{!query && <button className="button button-secondary" onClick={() => setAdding(true)}><Plus size={16} /> Add your first contact</button>}</div>}
    </section>
    {adding && <Modal title="Add a contact" onClose={() => setAdding(false)}><ContactForm onSave={saveContact} onCancel={() => setAdding(false)} saving={saving} /></Modal>}
  </div>;
}