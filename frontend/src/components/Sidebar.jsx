import { NavLink } from 'react-router-dom'

const links = [
  { to: '/',          icon: '📊', label: 'Dashboard'  },
  { to: '/products',  icon: '📦', label: 'Products'   },
  { to: '/customers', icon: '👥', label: 'Customers'  },
  { to: '/orders',    icon: '🛒', label: 'Orders'     },
]

export default function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <h1>InvenTrack</h1>
        <p>Inventory Manager</p>
      </div>
      <nav className="sidebar-nav">
        {links.map(({ to, icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
          >
            <span className="nav-icon">{icon}</span>
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  )
}
