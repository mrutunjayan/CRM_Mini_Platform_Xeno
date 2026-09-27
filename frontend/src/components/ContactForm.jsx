import { useState } from 'react';

const emptyContact = { name: '', email: '', phone: '', company: '', notes: '' };

export default function ContactForm({ initialValue, onSave, onCancel, saving = false }) {
  const [form, setForm] = useState({ ...emptyContact, ...initialValue });

  function update(event) {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  }

  async function submit(event) {
    event.preventDefault();
    await onSave(form);
  }

  return (
    <form className="form-grid" onSubmit={submit}>
      <label>Full name<input name="name" value={form.name} onChange={update} maxLength="100" required autoFocus /></label>
      <label>Email<input name="email" type="email" value={form.email} onChange={update} maxLength="254" required /></label>
      <label>Phone<input name="phone" type="tel" value={form.phone} onChange={update} maxLength="40" /></label>
      <label>Company<input name="company" value={form.company} onChange={update} maxLength="120" /></label>
      <label className="field-wide">Notes<textarea name="notes" value={form.notes} onChange={update} maxLength="2000" rows="3" /></label>
      <div className="form-actions field-wide">
        <button className="button button-secondary" type="button" onClick={onCancel}>Cancel</button>
        <button className="button button-primary" disabled={saving}>{saving ? 'Saving…' : 'Save contact'}</button>
      </div>
    </form>
  );
}