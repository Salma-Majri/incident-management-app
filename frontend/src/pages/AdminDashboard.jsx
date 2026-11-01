import { useState, useEffect } from 'react';
import API from '../api/axios';

const STATUS_MAP = {
  OPEN: { label: 'Ouvert', tone: 'blue' },
  ASSIGNED: { label: 'Assigné', tone: 'amber' },
  IN_PROGRESS: { label: 'En cours', tone: 'amber' },
  RESOLVED: { label: 'Résolu', tone: 'green' },
  CLOSED: { label: 'Clôturé', tone: 'green' },
};

const PRIORITY_MAP = {
  URGENT: { label: 'Urgente', tone: 'red' },
  HIGH: { label: 'Haute', tone: 'orange' },
  MEDIUM: { label: 'Moyenne', tone: 'slate' },
  LOW: { label: 'Basse', tone: 'slate' },
};

export default function AdminDashboard() {
  const [incidents, setIncidents] = useState([]);
  const [technicians, setTechnicians] = useState([]);
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

  const [selectedTechs, setSelectedTechs] = useState({});
  const [assigningId, setAssigningId] = useState(null);

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    try {
      setLoading(true);

      const incRes = await API.get('/api/incidents');
      const incsData = incRes.data || [];
      setIncidents(incsData);

      let usersData = [];
      try {
        const usersRes = await API.get('/api/admin/users');
        usersData = usersRes.data || [];
      } catch (e) {
        console.log("Impossible de charger la liste des utilisateurs pour les stats détaillées", e);
      }

      const totalIncidents = incsData.length;
      const openCount = incsData.filter(i => i.status === 'OPEN').length;
      const inProgressCount = incsData.filter(i => i.status === 'IN_PROGRESS' || i.status === 'ASSIGNED').length;
      const closedCount = incsData.filter(i => i.status === 'CLOSED' || i.status === 'RESOLVED').length;

      const totalUsers = usersData.length;
      const empCount = usersData.filter(u => u.role === 'EMPLOYEE').length;
      const techCount = usersData.filter(u => u.role === 'TECHNICIAN').length;

      const techList = usersData.filter(u => u.role === 'TECHNICIAN');
      setTechnicians(techList);

      setStats({
        totalUsers,
        employees: empCount,
        technicians: techCount,
        totalIncidents,
        open: openCount,
        inProgress: inProgressCount,
        closed: closedCount,
      });
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors du chargement des données administrateur');
    } finally {
      setLoading(false);
    }
  };

  const handleAssign = async (incidentId) => {
    const technicianId = selectedTechs[incidentId];
    if (!technicianId) {
      alert("Veuillez sélectionner un technicien.");
      return;
    }

    try {
      setAssigningId(incidentId);
      await API.put(`/api/incidents/${incidentId}/assign/${technicianId}`);
      alert("Incident assigné avec succès !");
      fetchAdminData();
    } catch (err) {
      alert(err.response?.data?.message || "Erreur lors de l'assignation");
    } finally {
      setAssigningId(null);
    }
  };

  const pct = (value) =>
    stats.totalIncidents ? Math.round((value / stats.totalIncidents) * 100) : 0;

  const statusCards = [
    { key: 'open', label: 'Ouverts', value: stats.open, tone: 'blue' },
    { key: 'progress', label: 'En cours / Assignés', value: stats.inProgress, tone: 'amber' },
    { key: 'closed', label: 'Clôturés / Résolus', value: stats.closed, tone: 'green' },
  ];

  return (
    <>
      <style>{css}</style>

      <div className="ad-page">
        <div className="ad-header">
          <span className="ad-eyebrow">Espace administrateur</span>
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

            <div className="ad-panel">
              <div className="ad-panel-head">
                <h3 className="ad-panel-title">Liste globale des incidents</h3>
                <span className="ad-count">{incidents.length}</span>
              </div>

              {incidents.length === 0 ? (
                <div className="ad-empty">Aucun incident enregistré dans le système.</div>
              ) : (
                <div className="ad-table-scroll">
                  <table className="ad-table">
                    <thead>
                      <tr>
                        <th>Titre</th>
                        <th>Priorité</th>
                        <th>Statut</th>
                        <th>Demandeur</th>
                        <th>Technicien</th>
                        <th aria-label="Action" />
                      </tr>
                    </thead>
                    <tbody>
                      {incidents.map((inc) => {
                        const status = STATUS_MAP[inc.status] || { label: inc.status, tone: 'slate' };
                        const priority = PRIORITY_MAP[inc.priority] || { label: inc.priority, tone: 'slate' };
                        const requester = inc.createdBy?.fullName || 'N/A';
                        return (
                          <tr key={inc.id}>
                            <td className="ad-cell-title">{inc.title}</td>
                            <td>
                              <span className={`ad-pill ad-pill-${priority.tone}`}>{priority.label}</span>
                            </td>
                            <td>
                              <span className={`ad-pill ad-pill-${status.tone} ad-pill-dot`}>
                                {status.label}
                              </span>
                            </td>
                            <td>
                              <div className="ad-user">
                                <span className="ad-user-avatar">{requester.charAt(0).toUpperCase()}</span>
                                <span>{requester}</span>
                              </div>
                            </td>
                            <td>
                              <select
                                className="ad-select"
                                value={selectedTechs[inc.id] || ''}
                                onChange={(e) =>
                                  setSelectedTechs({ ...selectedTechs, [inc.id]: e.target.value })
                                }
                              >
                                <option value="">Choisir un technicien</option>
                                {technicians.map((tech) => (
                                  <option key={tech.id} value={tech.id}>
                                    {tech.fullName || tech.username || `Technicien #${tech.id}`}
                                  </option>
                                ))}
                              </select>
                            </td>
                            <td className="ad-cell-action">
                              <button
                                type="button"
                                className="ad-btn"
                                onClick={() => handleAssign(inc.id)}
                                disabled={assigningId === inc.id}
                              >
                                {assigningId === inc.id ? 'Patientez...' : 'Assigner'}
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
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
  .ad-eyebrow {
    display: inline-block;
    padding: 4px 10px;
    margin-bottom: 10px;
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.8px;
    text-transform: uppercase;
    color: #7e22ce;
    background: #f3e8ff;
    border-radius: 999px;
  }
  .ad-title {
    margin: 0;
    font-size: 30px;
    font-weight: 800;
    letter-spacing: -0.8px;
  }
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

  .ad-panel {
    background: #ffffff;
    border: 1px solid #e2e8f0;
    border-radius: 22px;
    box-shadow: 0 10px 30px -18px rgba(15, 23, 42, 0.25);
    overflow: hidden;
  }
  .ad-panel-head {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 20px 24px;
    border-bottom: 1px solid #f1f5f9;
  }
  .ad-panel-title { margin: 0; font-size: 17px; font-weight: 700; }
  .ad-count {
    padding: 2px 10px;
    font-size: 12px;
    font-weight: 700;
    color: #7e22ce;
    background: #f3e8ff;
    border-radius: 999px;
  }
  .ad-empty { padding: 48px; text-align: center; color: #64748b; }

  .ad-table-scroll { overflow-x: auto; }
  .ad-table {
    width: 100%;
    min-width: 900px;
    border-collapse: collapse;
    text-align: left;
  }
  .ad-table th {
    padding: 12px 24px;
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.7px;
    text-transform: uppercase;
    color: #64748b;
    background: #f8fafc;
    border-bottom: 1px solid #e2e8f0;
  }
  .ad-table td {
    padding: 14px 24px;
    font-size: 14px;
    color: #1e293b;
    border-bottom: 1px solid #f1f5f9;
    vertical-align: middle;
  }
  .ad-table tbody tr { transition: background 0.15s ease; }
  .ad-table tbody tr:hover { background: #faf5ff; }
  .ad-table tbody tr:last-child td { border-bottom: none; }
  .ad-cell-title { font-weight: 600; max-width: 280px; }
  .ad-cell-action { text-align: right; }

  .ad-pill {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 4px 10px;
    font-size: 12px;
    font-weight: 700;
    border-radius: 999px;
    white-space: nowrap;
  }
  .ad-pill-dot::before {
    content: '';
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: currentColor;
  }
  .ad-pill-red { color: #b91c1c; background: #fee2e2; }
  .ad-pill-orange { color: #c2410c; background: #ffedd5; }
  .ad-pill-blue { color: #1d4ed8; background: #dbeafe; }
  .ad-pill-amber { color: #b45309; background: #fef3c7; }
  .ad-pill-green { color: #047857; background: #d1fae5; }
  .ad-pill-slate { color: #475569; background: #f1f5f9; }

  .ad-user { display: flex; align-items: center; gap: 10px; }
  .ad-user-avatar {
    display: grid;
    place-items: center;
    width: 30px;
    height: 30px;
    font-size: 12px;
    font-weight: 800;
    color: #5b21b6;
    background: #ede9fe;
    border-radius: 50%;
    flex-shrink: 0;
  }

  .ad-select {
    width: 210px;
    padding: 9px 12px;
    font-family: inherit;
    font-size: 13.5px;
    font-weight: 500;
    color: #0f172a;
    background: #f8fafc;
    border: 1px solid #e2e8f0;
    border-radius: 10px;
    outline: none;
    cursor: pointer;
    transition: border-color 0.15s ease, box-shadow 0.15s ease;
  }
  .ad-select:focus {
    border-color: #a855f7;
    box-shadow: 0 0 0 3px rgba(168, 85, 247, 0.18);
  }

  .ad-btn {
    padding: 9px 18px;
    font-family: inherit;
    font-size: 13px;
    font-weight: 700;
    color: #ffffff;
    background: linear-gradient(135deg, #a855f7 0%, #7c3aed 100%);
    border: none;
    border-radius: 10px;
    cursor: pointer;
    box-shadow: 0 6px 14px -6px rgba(124, 58, 237, 0.6);
    transition: transform 0.15s ease, box-shadow 0.15s ease, opacity 0.15s ease;
  }
  .ad-btn:hover:not(:disabled) {
    transform: translateY(-1px);
    box-shadow: 0 10px 18px -6px rgba(124, 58, 237, 0.65);
  }
  .ad-btn:disabled { opacity: 0.6; cursor: wait; }

  @media (max-width: 900px) {
    .ad-hero { grid-column: span 6; }
    .ad-card { grid-column: span 6; }
  }
  @media (min-width: 560px) and (max-width: 900px) {
    .ad-card { grid-column: span 2; }
    .ad-stats { grid-template-columns: repeat(6, 1fr); }
  }
  @media (max-width: 560px) {
    .ad-title { font-size: 25px; }
    .ad-hero-value { font-size: 38px; }
  }
`;