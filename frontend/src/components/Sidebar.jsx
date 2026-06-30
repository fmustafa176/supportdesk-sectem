import { NavLink } from 'react-router-dom';

function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <h1>SupportDesk</h1>
        <span>ticket management</span>
      </div>
      <nav className="sidebar-nav">
        <NavLink to="/" end className={({ isActive }) => isActive ? 'active' : ''}>
          Dashboard
        </NavLink>
        <NavLink to="/tickets" className={({ isActive }) => isActive ? 'active' : ''}>
          Tickets
        </NavLink>
        <NavLink to="/tickets/new" className={({ isActive }) => isActive ? 'active' : ''}>
          New Ticket
        </NavLink>
      </nav>
    </aside>
  );
}

export default Sidebar;
