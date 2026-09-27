import { Sparkles } from 'lucide-react';

export default function AuthPage({ title, subtitle, children }) {
  return (
    <main className="auth-page">
      <div className="auth-art" aria-hidden="true">
        <div className="auth-art-brand"><span className="brand-mark"><Sparkles size={18} /></span>mini<span className="brand-light">crm</span></div>
        <div className="art-copy"><div className="eyebrow">A LITTLE MORE HUMAN</div><h2>Good work<br />starts with<br /><em>good follow-up.</em></h2><div className="art-rule" /><p>Your relationships, your deals, all in one calm place.</p></div>
        <div className="art-orbit orbit-one" /><div className="art-orbit orbit-two" />
      </div>
      <section className="auth-panel">
        <div className="auth-box"><div className="eyebrow">YOUR WORKSPACE</div><h1>{title}</h1><p className="auth-subtitle">{subtitle}</p>{children}</div>
        <footer>MINI CRM <span>·</span> BUILT FOR THE DETAILS</footer>
      </section>
    </main>
  );
}