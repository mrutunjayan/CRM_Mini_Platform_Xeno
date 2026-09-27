import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import AuthPage from './components/AuthPage.jsx';

export default function Login() {
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function submit(event) {
    event.preventDefault();
    setError('');
    setLoading(true);
    try {
      await signIn('/auth/login', { email, password });
      navigate('/', { replace: true });
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  }

  return <AuthPage title="Good to see you." subtitle="Sign in to pick up where you left off.">
    <form className="auth-form" onSubmit={submit}>
      {error && <div className="alert" role="alert">{error}</div>}
      <label>Email address<input type="email" value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="email" required /></label>
      <label>Password<input type="password" value={password} onChange={(event) => setPassword(event.target.value)} autoComplete="current-password" required /></label>
      <button className="button button-primary button-full" disabled={loading}>{loading ? 'Signing in…' : 'Sign in'}</button>
      <p className="auth-switch">New to Mini CRM? <Link to="/register">Create an account</Link></p>
    </form>
  </AuthPage>;
}