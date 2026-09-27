import { BriefcaseBusiness, ContactRound, LayoutDashboard, LogOut, Sparkles } from 'lucide-react';
import { NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { initials } from '../utils.js';

export default function AppLayout() {
  const { user, signOut } = useAuth();

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <NavLink to="/" className="brand" aria-label="Mini CRM home">
          <span className="brand-mark"><Sparkles size={18} strokeWidth={2.4} /></span>
          <span>mini<span className="brand-light">crm</span></span>
        </NavLink>
        <div className="nav-label">WORKSPACE</div>
        <nav className="main-nav" aria-label="Main navigation">
          <NavLink to="/" end className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>
            <LayoutDashboard size={18} /> Overview
          </NavLink>
          <NavLink to="/contacts" className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>
            <ContactRound size={18} /> Contacts
          </NavLink>
          <NavLink to="/deals" className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>
            <BriefcaseBusiness size={18} /> Deals
          </NavLink>
          <button className="nav-link mobile-signout" onClick={signOut}><LogOut size={18} /> Sign out</button>
        </nav>
        <div className="sidebar-bottom">
          <div className="user-block">
            <div className="avatar">{initials(user?.name)}</div>
            <div className="user-copy"><strong>{user?.name}</strong><span>{user?.email}</span></div>
          </div>
          <button className="signout-button" onClick={signOut}><LogOut size={16} /> Sign out</button>
        </div>
      </aside>
      <main className="main-area"><Outlet /></main>
    </div>
  );
}