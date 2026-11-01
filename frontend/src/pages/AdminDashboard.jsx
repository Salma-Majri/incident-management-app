import { useState, useEffect } from 'react';
import API from '../api/axios';
import AdminUsers from './AdminUsers';
import AdminIncidents from './Adminincidents';

const Icon = ({ name }) => {
  const props = {
    width: 22,
    height: 22,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 2,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
    'aria-hidden': true,
  };
  if (name === 'alert') {
    return (
      <svg {...props}>
        <path d="M10.3 3.9L1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z" />
        <path d="M12 9v4" />
        <path d="M12 17h.01" />
      </svg>
    );
  }
  return (
    <svg {...props}>
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.9" />
      <path d="M16 3.1a4 4 0 0 1 0 7.8" />
    </svg>
  );
};

export default function AdminDashboard() {
  const [view, setView] = useState('incidents');
  const [stats, setStats] = useState({
    totalUsers: 0,
    employees: 0,
    technicians: 0,
    totalIncidents: 0,
    open: 0,
    inProgress: 0,
    closed: 0,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async (silent = false) => {
    try {
      if (!silent) setLoading(true);

      const incRes = await API.get('/api/incidents');
      const incsData = incRes.data || [];

      let usersData = [];
      try {
        const usersRes = await API.get('/api/admin/users');
        usersData = usersRes.data || [];
      } catch (e) {
        console.log("Impossible de charger la liste des utilisateurs pour les stats détaillées", e);
      }

      setStats({
        totalUsers: usersData.length,
        employees: usersData.filter((u) => u.role === 'EMPLOYEE').length,
        technicians: usersData.filter((u) => u.role === 'TECHNICIAN').length,
        totalIncidents: incsData.length,
        open: incsData.filter((i) => i.status === 'OPEN').length,
        inProgress: incsData.filter((i) => i.status === 'IN_PROGRESS' || i.status === 'ASSIGNED').length,
        closed: incsData.filter((i) => i.status === 'CLOSED' || i.status === 'RESOLVED').length,
      });
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors du chargement des données administrateur');
    } finally {
      if (!silent) setLoading(false);
    }
  };

  const refreshStats = () => fetchAdminData(true);

  const pct = (value) =>
    stats.totalIncidents ? Math.round((value / stats.totalIncidents) * 100) : 0;

  const statusCards = [
    { key: 'open', label: 'Ouverts', value: stats.open, tone: 'blue' },
    { key: 'progress', label: 'En cours / Assignés', value: stats.inProgress, tone: 'amber' },
    { key: 'closed', label: 'Clôturés / Résolus', value: stats.closed, tone: 'green' },
  ];

  const views = [
    {
      key: 'incidents',
      icon: 'alert',
      title: 'Gestion des incidents',
      desc: 'Consulter, filtrer et assigner les incidents',
      count: stats.totalIncidents,
      unit: 'incidents',
    },
    {
      key: 'users',
      icon: 'users',
      title: 'Gestion des utilisateurs',
      desc: "Gérer les comptes et le contrôle d'accès",
      count: stats.totalUsers,
      unit: 'utilisateurs',
    },
  ];

  return (
    <>
      <style>{css}</style>

      <div className="ad-page">
        <div className="ad-header">
          <p className="ad-subtitle">
            Supervision globale, statistiques et assignation des interventions.
          </p>
        </div>

        {error && <div className="ad-error">{error}</div>}

        {loading ? (
          <div className="ad-loading">
            <span className="ad-spinner" />
            Chargement des données...
          </div>
        ) : (
          <>
            <div className="ad-stats">
              <div className="ad-hero">
                <span className="ad-hero-label">Utilisateurs</span>
                <span className="ad-hero-value">{stats.totalUsers}</span>
                <div className="ad-hero-tags">
                  <span className="ad-hero-tag">
                    <i className="ad-dot ad-dot-green" /> {stats.employees} employés
                  </span>
                  <span className="ad-hero-tag">
                    <i className="ad-dot ad-dot-orange" /> {stats.technicians} techniciens
                  </span>
                </div>
              </div>

              <div className="ad-hero">
                <span className="ad-hero-label">Incidents</span>
                <span className="ad-hero-value">{stats.totalIncidents}</span>
                <div className="ad-hero-tags">
                  <span className="ad-hero-tag">
                    <i className="ad-dot ad-dot-blue" /> {stats.open} ouverts
                  </span>
                  <span className="ad-hero-tag">
                    <i className="ad-dot ad-dot-green" /> {stats.closed} clôturés
                  </span>
                </div>
              </div>

              {statusCards.map((c) => (
                <div key={c.key} className={`ad-card ad-tone-${c.tone}`}>
                  <div className="ad-card-top">
                    <span className="ad-card-label">{c.label}</span>
                    <span className="ad-card-pct">{pct(c.value)}%</span>
                  </div>
                  <span className="ad-card-value">{c.value}</span>
                  <div className="ad-bar">
                    <div className="ad-bar-fill" style={{ width: `${pct(c.value)}%` }} />
                  </div>
                </div>
              ))}
            </div>

            <div className="ad-switch" role="tablist" aria-label="Section de gestion">
              {views.map((v) => (
                <button
                  key={v.key}
                  type="button"
                  role="tab"
                  aria-selected={view === v.key}
                  className={`ad-switch-btn ${view === v.key ? 'is-active' : ''}`}
                  onClick={() => setView(v.key)}
                >
                  <span className="ad-switch-icon">
                    <Icon name={v.icon} />
                  </span>
                  <span className="ad-switch-text">
                    <span className="ad-switch-title">{v.title}</span>
                    <span className="ad-switch-desc">{v.desc}</span>
                  </span>
                  <span className="ad-switch-count">
                    <strong>{v.count}</strong>
                    <small>{v.unit}</small>
                  </span>
                </button>
              ))}
            </div>

            <div className="ad-view" key={view}>
              {view === 'incidents' ? (
                <AdminIncidents embedded onChange={refreshStats} />
              ) : (
                <AdminUsers embedded onChange={refreshStats} />
              )}
            </div>
          </>
        )}
      </div>
    </>
  );
}

const css = `
  .ad-page {
    max-width: 1200px;
    margin: 0 auto;
    padding: 32px 20px 56px;
    font-family: 'Inter', system-ui, -apple-system, sans-serif;
    color: #0f172a;
  }

  .ad-header { margin-bottom: 28px; }
  .ad-subtitle {
    margin: 6px 0 0;
    font-size: 14.5px;
    color: #64748b;
  }

  .ad-error {
    padding: 12px 16px;
    margin-bottom: 20px;
    font-size: 14px;
    color: #991b1b;
    background: #fef2f2;
    border: 1px solid #fecaca;
    border-radius: 12px;
  }
  .ad-loading {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 12px;
    padding: 60px;
    color: #64748b;
  }
  .ad-spinner {
    width: 18px;
    height: 18px;
    border: 2px solid #e2e8f0;
    border-top-color: #a855f7;
    border-radius: 50%;
    animation: ad-spin 0.7s linear infinite;
  }
  @keyframes ad-spin { to { transform: rotate(360deg); } }

  .ad-stats {
    display: grid;
    grid-template-columns: repeat(6, 1fr);
    gap: 16px;
    margin-bottom: 28px;
  }
  .ad-hero { grid-column: span 3; }
  .ad-card { grid-column: span 2; }

  .ad-hero {
    position: relative;
    display: flex;
    flex-direction: column;
    gap: 4px;
    padding: 22px 24px;
    overflow: hidden;
    color: #f8fafc;
    background: linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 20px;
    box-shadow: 0 14px 30px -14px rgba(15, 23, 42, 0.55);
  }
  .ad-hero::after {
    content: '';
    position: absolute;
    top: -60px;
    right: -40px;
    width: 180px;
    height: 180px;
    background: radial-gradient(circle, rgba(192, 132, 252, 0.35) 0%, transparent 70%);
    pointer-events: none;
  }
  .ad-hero-label {
    font-size: 12px;
    font-weight: 600;
    letter-spacing: 0.6px;
    text-transform: uppercase;
    color: #94a3b8;
  }
  .ad-hero-value {
    font-size: 44px;
    font-weight: 800;
    letter-spacing: -1.5px;
    line-height: 1.1;
  }
  .ad-hero-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin-top: 10px;
  }
  .ad-hero-tag {
    display: inline-flex;
    align-items: center;
    gap: 7px;
    padding: 5px 11px;
    font-size: 12px;
    font-weight: 600;
    color: #e2e8f0;
    background: rgba(255, 255, 255, 0.08);
    border-radius: 999px;
  }
  .ad-dot {
    width: 7px;
    height: 7px;
    border-radius: 50%;
    display: inline-block;
  }
  .ad-dot-green { background: #34d399; }
  .ad-dot-orange { background: #fb923c; }
  .ad-dot-blue { background: #60a5fa; }

  .ad-card {
    --tone: #64748b;
    --tone-soft: #f1f5f9;
    display: flex;
    flex-direction: column;
    gap: 6px;
    padding: 18px 20px;
    background: #ffffff;
    border: 1px solid #e2e8f0;
    border-radius: 18px;
    box-shadow: 0 1px 2px rgba(15, 23, 42, 0.04);
    transition: transform 0.2s ease, box-shadow 0.2s ease;
  }
  .ad-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 12px 24px -12px rgba(15, 23, 42, 0.18);
  }
  .ad-tone-blue { --tone: #3b82f6; --tone-soft: #dbeafe; }
  .ad-tone-amber { --tone: #f59e0b; --tone-soft: #fef3c7; }
  .ad-tone-green { --tone: #10b981; --tone-soft: #d1fae5; }
  .ad-card-top {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
  .ad-card-label { font-size: 13px; font-weight: 600; color: #64748b; }
  .ad-card-pct {
    padding: 2px 8px;
    font-size: 11px;
    font-weight: 700;
    color: var(--tone);
    background: var(--tone-soft);
    border-radius: 999px;
  }
  .ad-card-value {
    font-size: 32px;
    font-weight: 800;
    letter-spacing: -1px;
    color: #0f172a;
  }
  .ad-bar {
    height: 6px;
    overflow: hidden;
    background: #f1f5f9;
    border-radius: 999px;
  }
  .ad-bar-fill {
    height: 100%;
    background: var(--tone);
    border-radius: 999px;
    transition: width 0.6s ease;
  }

  .ad-switch {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 16px;
    margin-bottom: 24px;
  }
  .ad-switch-btn {
    position: relative;
    display: flex;
    align-items: center;
    gap: 16px;
    padding: 20px 22px;
    overflow: hidden;
    font-family: inherit;
    text-align: left;
    color: #0f172a;
    background: #ffffff;
    border: 1.5px solid #e2e8f0;
    border-radius: 20px;
    cursor: pointer;
    transition: transform 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease, background 0.2s ease;
  }
  .ad-switch-btn:hover {
    transform: translateY(-2px);
    border-color: #c4b5fd;
    box-shadow: 0 14px 26px -16px rgba(124, 58, 237, 0.45);
  }
  .ad-switch-btn.is-active {
    color: #f8fafc;
    background: linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%);
    border-color: rgba(192, 132, 252, 0.55);
    box-shadow: 0 16px 32px -16px rgba(124, 58, 237, 0.7);
  }
  .ad-switch-btn.is-active::after {
    content: '';
    position: absolute;
    top: -50px;
    right: -30px;
    width: 160px;
    height: 160px;
    background: radial-gradient(circle, rgba(192, 132, 252, 0.35) 0%, transparent 70%);
    pointer-events: none;
  }
  .ad-switch-icon {
    display: grid;
    place-items: center;
    width: 48px;
    height: 48px;
    color: #7c3aed;
    background: #f3e8ff;
    border-radius: 14px;
    flex-shrink: 0;
    transition: all 0.2s ease;
  }
  .ad-switch-btn.is-active .ad-switch-icon {
    color: #0f172a;
    background: linear-gradient(135deg, #e9d5ff 0%, #c084fc 100%);
    box-shadow: 0 0 20px rgba(192, 132, 252, 0.45);
  }
  .ad-switch-text { display: flex; flex-direction: column; gap: 3px; flex: 1; min-width: 0; }
  .ad-switch-title { font-size: 16px; font-weight: 800; letter-spacing: -0.3px; }
  .ad-switch-desc { font-size: 13px; color: #64748b; }
  .ad-switch-btn.is-active .ad-switch-desc { color: #cbd5e1; }
  .ad-switch-count {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    line-height: 1.1;
  }
  .ad-switch-count strong { font-size: 26px; font-weight: 800; letter-spacing: -1px; }
  .ad-switch-count small { font-size: 11px; font-weight: 600; color: #94a3b8; }

  .ad-view { animation: ad-fade 0.22s ease-out; }
  @keyframes ad-fade {
    from { opacity: 0; transform: translateY(6px); }
    to { opacity: 1; transform: translateY(0); }
  }

  @media (max-width: 900px) {
    .ad-hero { grid-column: span 6; }
    .ad-card { grid-column: span 6; }
  }
  @media (min-width: 560px) and (max-width: 900px) {
    .ad-card { grid-column: span 2; }
    .ad-stats { grid-template-columns: repeat(6, 1fr); }
  }
  @media (max-width: 700px) {
    .ad-switch { grid-template-columns: 1fr; }
  }
  @media (max-width: 560px) {
    .ad-hero-value { font-size: 38px; }
    .ad-switch-desc { display: none; }
  }
`;