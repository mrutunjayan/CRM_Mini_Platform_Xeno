import { useEffect, useState } from 'react';
import { ArrowRight, BriefcaseBusiness, Check, ChevronDown, Copy, Plus, Sparkles, Trash2 } from 'lucide-react';
import { api, sendJson } from '../api.js';
import Modal from '../components/Modal.jsx';
import PageHeader from '../components/PageHeader.jsx';
import { money, STAGES } from '../utils.js';

const emptyDeal = { title: '', contact: '', value: '', stage: 'New', notes: '' };

export default function Deals() {
  const [deals, setDeals] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyDeal);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [emailFor, setEmailFor] = useState(null);
  const [emailText, setEmailText] = useState('');
  const [generating, setGenerating] = useState(false);
  const [copied, setCopied] = useState(false);

  async function load() {
    try {
      const [nextDeals, nextContacts] = await Promise.all([api('/deals'), api('/contacts')]);
      setDeals(nextDeals);
      setContacts(nextContacts);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  async function createDeal(event) {
    event.preventDefault();
    setSaving(true);
    setError('');
    try {
      const deal = await api('/deals', sendJson('POST', { ...form, value: Number(form.value) || 0 }));
      setDeals((current) => [deal, ...current]);
      setForm(emptyDeal);
      setShowForm(false);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSaving(false);
    }
  }

  async function changeStage(deal, stage) {
    setError('');
    try {
      const updated = await api(`/deals/${deal._id}`, sendJson('PUT', { stage }));
      setDeals((current) => current.map((item) => item._id === deal._id ? updated : item));
    } catch (requestError) {
      setError(requestError.message);
    }
  }

  async function deleteDeal(deal) {
    if (!window.confirm(`Delete “${deal.title}”?`)) return;
    try {
      await api(`/deals/${deal._id}`, { method: 'DELETE' });
      setDeals((current) => current.filter((item) => item._id !== deal._id));
    } catch (requestError) {
      setError(requestError.message);
    }
  }

  async function generateEmail(deal) {
    setEmailFor(deal);
    setEmailText('');
    setCopied(false);
    setGenerating(true);
    setError('');
    try {
      const result = await api('/ai/follow-up', sendJson('POST', {
        contactName: deal.contact?.name,
        company: deal.contact?.company || '',
        notes: [deal.contact?.notes, deal.notes].filter(Boolean).join('\n'),
        dealTitle: deal.title,
        dealStage: deal.stage
      }));
      setEmailText(result.email);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setGenerating(false);
    }
  }

  async function copyEmail() {
    await navigator.clipboard.writeText(emailText);
    setCopied(true);
  }

  return <div className="page-wrap deals-page">
    <PageHeader eyebrow="SALES PIPELINE" title="Deals" description="Move every opportunity forward, one conversation at a time." action={<button className="button button-primary" onClick={() => setShowForm((open) => !open)}><Plus size={17} /> New deal</button>} />
    {error && <div className="alert" role="alert">{error}</div>}
    {showForm && <section className="deal-form-panel"><div className="section-head"><div><div className="eyebrow">NEW OPPORTUNITY</div><h2>Add a deal</h2></div></div><form className="deal-form" onSubmit={createDeal}>
      <label>Deal title<input value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} maxLength="160" required autoFocus /></label>
      <label>Contact<select value={form.contact} onChange={(event) => setForm({ ...form, contact: event.target.value })} required><option value="">Choose a contact</option>{contacts.map((contact) => <option value={contact._id} key={contact._id}>{contact.name}{contact.company ? ` · ${contact.company}` : ''}</option>)}</select></label>
      <label>Value<input type="number" min="0" step="1" value={form.value} onChange={(event) => setForm({ ...form, value: event.target.value })} placeholder="0" required /></label>
      <label>Stage<select value={form.stage} onChange={(event) => setForm({ ...form, stage: event.target.value })}>{STAGES.map((stage) => <option key={stage}>{stage}</option>)}</select></label>
      <label className="deal-notes-field">Notes<input value={form.notes} onChange={(event) => setForm({ ...form, notes: event.target.value })} maxLength="2000" placeholder="A detail worth remembering" /></label>
      <div className="form-actions"><button type="button" className="button button-secondary" onClick={() => setShowForm(false)}>Cancel</button><button className="button button-primary" disabled={saving || !contacts.length}>{saving ? 'Saving…' : 'Save deal'}</button></div>
      {!contacts.length && <p className="form-note">Add a contact before creating a deal.</p>}
    </form></section>}
    {loading ? <div className="loading-line">Loading deals…</div> : <div className="kanban-board">{STAGES.map((stage) => {
      const stageDeals = deals.filter((deal) => deal.stage === stage);
      return <section className={`kanban-column column-${stage.toLowerCase()}`} key={stage}>
        <div className="column-head"><div className="column-title"><span className="stage-dot" /><h2>{stage}</h2><span className="column-count">{stageDeals.length}</span></div><strong>{money(stageDeals.reduce((total, deal) => total + Number(deal.value), 0))}</strong></div>
        <div className="column-cards">{stageDeals.map((deal) => <article className="deal-card" key={deal._id}>
          <div className="deal-card-top"><span className={`stage-pill stage-${stage.toLowerCase()}`}>{stage}</span><button className="icon-button subtle" title="Delete deal" aria-label={`Delete ${deal.title}`} onClick={() => deleteDeal(deal)}><Trash2 size={15} /></button></div>
          <h3>{deal.title}</h3><p className="deal-contact">{deal.contact?.name || 'Contact'}{deal.contact?.company ? ` · ${deal.contact.company}` : ''}</p>
          <div className="deal-value">{money(deal.value)}</div>
          {deal.notes && <p className="deal-notes">{deal.notes}</p>}
          <div className="deal-card-bottom"><label className="stage-select-label" aria-label={`Move ${deal.title} to another stage`}><span>Move to</span><select value={stage} onChange={(event) => changeStage(deal, event.target.value)}>{STAGES.map((option) => <option key={option}>{option}</option>)}</select><ChevronDown size={14} /></label><button className="ai-button" title="Generate follow-up email" aria-label={`Generate follow-up email for ${deal.title}`} onClick={() => generateEmail(deal)}><Sparkles size={15} /></button></div>
        </article>)}</div>
        {!stageDeals.length && <div className="column-empty"><BriefcaseBusiness size={18} /><span>Nothing here yet</span></div>}
      </section>;
    })}</div>}
    {emailFor && <Modal title="Follow-up draft" onClose={() => setEmailFor(null)} wide><div className="email-context"><span className="eyebrow">{emailFor.title}</span><span>{emailFor.contact?.name} · {emailFor.stage}</span></div>{generating ? <div className="email-loading"><Sparkles size={20} /><span>Writing a thoughtful follow-up…</span></div> : emailText ? <><textarea className="email-draft" aria-label="Generated follow-up email" value={emailText} onChange={(event) => setEmailText(event.target.value)} rows="11" /><div className="form-actions"><span className="draft-hint">Review and edit the draft before sending.</span><button className="button button-primary" onClick={copyEmail}>{copied ? <Check size={16} /> : <Copy size={16} />}{copied ? 'Copied' : 'Copy email'}</button></div></> : <div className="alert">{error || 'No email was generated.'}</div>}</Modal>}
  </div>;
}