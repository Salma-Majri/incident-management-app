import { useState, useEffect } from 'react';
import API from '../api/api';
import AdminUsers from './AdminUsers';
import AdminIncidents from './AdminIncidents';
import './AdminDashboard.css';

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
  );
}