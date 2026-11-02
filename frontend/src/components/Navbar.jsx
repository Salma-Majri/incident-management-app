import { useState, useEffect, useRef } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';

const ROLE_CONFIG = {
  ADMIN: {
    label: 'Administrateur',
    accent: '#c084fc',
    links: [{ to: '/admin', label: 'Tableau de bord', icon: 'grid' }],
  },
  TECHNICIAN: {
    label: 'Technicien',
    accent: '#fb923c',
    links: [{ to: '/technician', label: 'Incidents assignés', icon: 'wrench' }],
  },
  EMPLOYEE: {
    label: 'Employé',
    accent: '#34d399',
    links: [{ to: '/dashboard', label: 'Mes incidents', icon: 'list' }],
  },
};

const Icon = ({ name }) => {
  const props = {
    width: 16,
    height: 16,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 2,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
    'aria-hidden': true,
  };
  switch (name) {
    case 'grid':
      return (
        <svg {...props}>
          <rect x="3" y="3" width="7" height="7" rx="1.5" />
          <rect x="14" y="3" width="7" height="7" rx="1.5" />
          <rect x="3" y="14" width="7" height="7" rx="1.5" />
          <rect x="14" y="14" width="7" height="7" rx="1.5" />
        </svg>
      );
    case 'wrench':
      return (
        <svg {...props}>
          <path d="M14.7 6.3a4 4 0 0 0-5.4 5.4L3 18l3 3 6.3-6.3a4 4 0 0 0 5.4-5.4l-2.5 2.5-2.5-.5-.5-2.5z" />
        </svg>
      );
    case 'list':
      return (
        <svg {...props}>
          <path d="M8 6h13M8 12h13M8 18h13" />
          <circle cx="3.5" cy="6" r="1" />
          <circle cx="3.5" cy="12" r="1" />
          <circle cx="3.5" cy="18" r="1" />
        </svg>
      );
    case 'user':
      return (
        <svg {...props}>
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
          <circle cx="12" cy="7" r="4" />
        </svg>
      );
    case 'logout':
      return (
        <svg {...props}>
          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
          <path d="M16 17l5-5-5-5" />
          <path d="M21 12H9" />
        </svg>
      );
    case 'shield':
      return (
        <svg {...props} strokeWidth={2.2}>
          <path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6l8-3z" />
          <path d="M9 12l2 2 4-4" />
        </svg>
      );
    default:
      return null;
  }
};

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);

  const [fullName, setFullName] = useState(localStorage.getItem('fullName') || 'Utilisateur');
  const role = localStorage.getItem('role') || '';
  const initial = fullName.charAt(0).toUpperCase();
  const config = ROLE_CONFIG[role] || { label: role, accent: '#94a3b8', links: [] };
  const homePath = config.links[0]?.to || '/';

  useEffect(() => {
    const syncName = () => {
      setFullName(localStorage.getItem('fullName') || 'Utilisateur');
    };
    window.addEventListener('storage-local-update', syncName);
    window.addEventListener('storage', syncName);
    return () => {
      window.removeEventListener('storage-local-update', syncName);
      window.removeEventListener('storage', syncName);
    };
  }, []);

  useEffect(() => {
    const onClick = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setOpen(false);
    };
    const onKey = (e) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onClick);
      document.removeEventListener('keydown', onKey);
    };
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  return (
    <>
      <style>{css}</style>

      <header className="nb-wrap">
        <nav className="nb" style={{ '--accent': config.accent }}>
          <Link to={homePath} className="nb-brand">
            <span className="nb-logo">
              <Icon name="shield" />
            </span>
            <span className="nb-brand-text">
              <span className="nb-brand-name">
                Followly<span className="nb-brand-dot">.</span>
              </span>
              <span className="nb-brand-tagline">
                Follow every incident, from report to resolution.
              </span>
            </span>
          </Link>

          <div className="nb-links">
            {config.links.map((l) => {
              const active =
                location.pathname === l.to || location.pathname.startsWith(`${l.to}/`);
              return (
                <Link
                  key={l.to}
                  to={l.to}
                  className={`nb-link ${active ? 'is-active' : ''}`}
                  aria-current={active ? 'page' : undefined}
                >
                  <Icon name={l.icon} />
                  <span>{l.label}</span>
                </Link>
              );
            })}
          </div>

          <div className="nb-user" ref={menuRef}>
            <button
              type="button"
              className="nb-user-btn"
              onClick={() => setOpen((o) => !o)}
              aria-haspopup="menu"
              aria-expanded={open}
              aria-label="Menu utilisateur"
            >
              <span className="nb-avatar">{initial}</span>
              <span className="nb-user-info">
                <span className="nb-user-name">{fullName}</span>
                <span className="nb-user-role">{config.label}</span>
              </span>
              <svg
                className={`nb-chevron ${open ? 'is-open' : ''}`}
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M6 9l6 6 6-6" />
              </svg>
            </button>

            {open && (
              <div className="nb-menu" role="menu">
                <div className="nb-menu-head">
                  <span className="nb-avatar nb-avatar-lg">{initial}</span>
                  <div>
                    <div className="nb-menu-name">{fullName}</div>
                    <div className="nb-menu-role">
                      <span className="nb-role-dot" />
                      {config.label}
                    </div>
                  </div>
                </div>

                <Link to="/profile" className="nb-menu-item" role="menuitem">
                  <Icon name="user" />
                  Mon profil
                </Link>

                <button
                  type="button"
                  className="nb-menu-item nb-menu-logout"
                  onClick={handleLogout}
                  role="menuitem"
                >
                  <Icon name="logout" />
                  Déconnexion
                </button>
              </div>
            )}
          </div>
        </nav>
      </header>
    </>
  );
}

const css = `
  .nb-wrap {
    position: sticky;
    top: 0;
    z-index: 100;
    width: 100%;
    box-sizing: border-box;
    padding: 14px 20px 0;
    font-family: 'Inter', system-ui, -apple-system, sans-serif;
  }

  .nb {
    width: 100%;
    max-width: 100%;
    box-sizing: border-box;
    margin: 0 auto;
    display: grid;
    grid-template-columns: 1fr auto 1fr;
    align-items: center;
    gap: 16px;
    padding: 10px 14px 10px 16px;
    background: linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 20px;
    box-shadow:
      0 10px 30px -10px rgba(15, 23, 42, 0.5),
      inset 0 1px 0 rgba(255, 255, 255, 0.06);
  }

  .nb-brand {
    display: flex;
    align-items: center;
    gap: 10px;
    text-decoration: none;
    justify-self: start;
  }
  .nb-logo {
    display: grid;
    place-items: center;
    width: 36px;
    height: 36px;
    border-radius: 12px;
    color: #0f172a;
    background: linear-gradient(135deg, #67e8f9 0%, #a78bfa 100%);
    box-shadow: 0 0 20px rgba(103, 232, 249, 0.35);
    transition: transform 0.3s ease;
    flex-shrink: 0;
  }
  .nb-brand:hover .nb-logo { transform: rotate(-8deg) scale(1.06); }
  .nb-brand-text {
    display: flex;
    flex-direction: column;
    line-height: 1.15;
  }
  .nb-brand-name {
    font-size: 17px;
    font-weight: 800;
    letter-spacing: -0.4px;
    color: #f8fafc;
  }
  .nb-brand-dot { color: #67e8f9; }
  .nb-brand-tagline {
    margin-top: 2px;
    font-size: 10.5px;
    font-weight: 500;
    letter-spacing: 0.1px;
    color: #94a3b8;
    white-space: nowrap;
  }
  @media (max-width: 1100px) {
    .nb-brand-tagline { display: none; }
  }

  .nb-links {
    display: flex;
    justify-content: center;
    gap: 4px;
  }
  .nb-link {
    position: relative;
    display: flex;
    align-items: center;
    gap: 9px;
    padding: 12px 14px;
    font-size: 14px;
    font-weight: 600;
    text-decoration: none;
    white-space: nowrap;
    color: #94a3b8;
    transition: color 0.2s ease;
  }
  .nb-link svg { transition: color 0.2s ease; }
  .nb-link::after {
    content: '';
    position: absolute;
    left: 14px;
    right: 14px;
    bottom: 2px;
    height: 3px;
    border-radius: 3px;
    background: var(--accent);
    box-shadow: 0 0 12px var(--accent);
    transform: scaleX(0);
    transform-origin: center;
    transition: transform 0.25s ease;
  }
  .nb-link:hover { color: #f8fafc; }
  .nb-link:hover::after { transform: scaleX(0.35); }
  .nb-link.is-active { color: #f8fafc; }
  .nb-link.is-active svg { color: var(--accent); }
  .nb-link.is-active::after { transform: scaleX(1); }

  .nb-user { position: relative; justify-self: end; }
  .nb-user-btn {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 5px 10px 5px 5px;
    font-family: inherit;
    color: #e2e8f0;
    background: rgba(255, 255, 255, 0.06);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 999px;
    cursor: pointer;
    transition: background 0.2s ease, border-color 0.2s ease;
  }
  .nb-user-btn:hover {
    background: rgba(255, 255, 255, 0.11);
    border-color: rgba(255, 255, 255, 0.16);
  }
  .nb-avatar {
    display: grid;
    place-items: center;
    width: 34px;
    height: 34px;
    border-radius: 50%;
    font-size: 14px;
    font-weight: 800;
    color: #0f172a;
    background: var(--accent);
    box-shadow: 0 0 0 3px color-mix(in srgb, var(--accent) 25%, transparent);
    flex-shrink: 0;
  }
  .nb-avatar-lg { width: 42px; height: 42px; font-size: 17px; }
  .nb-user-info {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    line-height: 1.2;
  }
  .nb-user-name { font-size: 13px; font-weight: 700; color: #f8fafc; }
  .nb-user-role {
    font-size: 10.5px;
    font-weight: 600;
    letter-spacing: 0.4px;
    text-transform: uppercase;
    color: var(--accent);
  }
  .nb-chevron { color: #94a3b8; transition: transform 0.2s ease; }
  .nb-chevron.is-open { transform: rotate(180deg); }

  .nb-menu {
    position: absolute;
    right: 0;
    top: calc(100% + 10px);
    min-width: 240px;
    padding: 8px;
    background: #0f172a;
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 16px;
    box-shadow: 0 20px 40px -12px rgba(0, 0, 0, 0.5);
    animation: nb-pop 0.16s ease-out;
  }
  @keyframes nb-pop {
    from { opacity: 0; transform: translateY(-6px) scale(0.98); }
    to   { opacity: 1; transform: translateY(0) scale(1); }
  }
  .nb-menu-head {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 10px;
    margin-bottom: 6px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  }
  .nb-menu-name { font-size: 14px; font-weight: 700; color: #f8fafc; }
  .nb-menu-role {
    display: flex;
    align-items: center;
    gap: 6px;
    margin-top: 2px;
    font-size: 12px;
    color: #94a3b8;
  }
  .nb-role-dot {
    width: 7px;
    height: 7px;
    border-radius: 50%;
    background: var(--accent);
  }
  .nb-menu-item {
    display: flex;
    align-items: center;
    gap: 10px;
    width: 100%;
    padding: 10px 12px;
    box-sizing: border-box;
    font-family: inherit;
    font-size: 13.5px;
    font-weight: 600;
    color: #cbd5e1;
    background: transparent;
    border: none;
    border-radius: 10px;
    cursor: pointer;
    text-align: left;
    text-decoration: none;
    transition: background 0.15s ease, color 0.15s ease;
  }
  .nb-menu-item:hover { background: rgba(255, 255, 255, 0.08); color: #f8fafc; }
  .nb-menu-logout:hover { background: rgba(248, 113, 113, 0.12); color: #fca5a5; }

  @media (max-width: 720px) {
    .nb-wrap { padding: 10px 10px 0; }
    .nb {
      display: flex;
      flex-wrap: wrap;
      justify-content: space-between;
      border-radius: 18px;
    }
    .nb-brand-text, .nb-user-info, .nb-chevron { display: none; }
    .nb-user-btn { padding: 4px; }
    .nb-links { order: 3; width: 100%; }
  }
`;