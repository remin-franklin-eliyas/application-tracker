import { NavLink, Outlet } from 'react-router-dom';
import './Layout.css';

export default function Layout() {
  return (
    <div className="layout">
      <header className="topbar">
        <div className="topbar-brand">
          <span className="brand-flag" />
          <span className="brand-name">PitLane</span>
          <span className="brand-sub">Application Tracker</span>
        </div>
        <nav className="topbar-nav">
          <NavLink to="/dashboard" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
            Dashboard
          </NavLink>
          <NavLink to="/analyzer" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
            AI Analyzer
          </NavLink>
        </nav>
      </header>
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
}
