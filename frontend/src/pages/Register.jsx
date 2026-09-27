import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import AuthPage from './components/AuthPage.jsx';

export default function Register() {
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  function update(event) {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  }

  async function submit(event) {
    event.preventDefault();
    setError('');
    setLoading(true);
    try {
      await signIn('/auth/register', form);
      navigate('/', { replace: true });
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  }

  return <AuthPage title="Make it yours." subtitle="Create an account and keep every relationship in view.">
    <form className="auth-form" onSubmit={submit}>
      {error && <div className="alert" role="alert">{error}</div>}
      <label>Your name<input name="name" value={form.name} onChange={update} autoComplete="name" maxLength="80" required /></label>
      <label>Email address<input name="email" type="email" value={form.email} onChange={update} autoComplete="email" required /></label>
      <label>Password<input name="password" type="password" value={form.password} onChange={update} autoComplete="new-password" minLength="8" maxLength="72" required /><span className="field-hint">At least 8 characters</span></label>
      <button className="button button-primary button-full" disabled={loading}>{loading ? 'Creating account…' : 'Create account'}</button>
      <p className="auth-switch">Already have an account? <Link to="/login">Sign in</Link></p>
    </form>
  </AuthPage>;
}