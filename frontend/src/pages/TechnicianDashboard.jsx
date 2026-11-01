import { useState, useEffect } from 'react';
import API from '../api/axios';

const STATUS_OPTIONS = [
  { value: 'OPEN', label: 'Ouvert', color: '#64748b', bg: '#f1f5f9' },
  { value: 'ASSIGNED', label: 'Assigné', color: '#8b5cf6', bg: '#ede9fe' },
  { value: 'IN_PROGRESS', label: 'En cours', color: '#3b82f6', bg: '#dbeafe' },
  { value: 'RESOLVED', label: 'Résolu', color: '#10b981', bg: '#d1fae5' },
  { value: 'CLOSED', label: 'Fermé', color: '#4b5563', bg: '#e5e7eb' },
];

const PRIORITY_MAP = {
  CRITICAL: { label: 'Critique', tone: 'red' },
  HIGH: { label: 'Haute', tone: 'orange' },
  MEDIUM: { label: 'Moyenne', tone: 'slate' },
  LOW: { label: 'Basse', tone: 'slate' },
};

const formatDate = (value) =>
  value ? new Date(value).toLocaleDateString('fr-FR') : '—';

export default function TechnicianDashboard() {
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updatingId, setUpdatingId] = useState(null);

  useEffect(() => {
    fetchAssignedIncidents();
  }, []);

  const fetchAssignedIncidents = async () => {
    try {
      setLoading(true);
      const response = await API.get('/api/incidents/assigned');
      setIncidents(response.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors du chargement des incidents assignés');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (incidentId, newStatus) => {
    try {
      setUpdatingId(incidentId);
      await API.put(`/api/incidents/${incidentId}/status?status=${newStatus}`);
      setIncidents((prev) =>
        prev.map((inc) => (inc.id === incidentId ? { ...inc, status: newStatus } : inc))
      );
    } catch (err) {
      alert(err.response?.data?.message || 'Erreur lors du changement de statut');
    } finally {
      setUpdatingId(null);
    }
  };

  const total = incidents.length;
  const criticalCount = incidents.filter((i) => i.priority === 'CRITICAL').length;
  const inProgressCount = incidents.filter((i) => i.status === 'IN_PROGRESS').length;
  const resolvedCount = incidents.filter((i) => i.status === 'RESOLVED' || i.status === 'CLOSED').length;

  const pct = (value) => (total ? Math.round((value / total) * 100) : 0);

  const statCards = [
    { key: 'critical', label: 'Critiques', value: criticalCount, tone: 'red' },
    { key: 'progress', label: 'En cours', value: inProgressCount, tone: 'blue' },
    { key: 'resolved', label: 'Résolus', value: resolvedCount, tone: 'green' },
  ];

  return (
    <>
      <style>{css}</style>

      <div className="te-page">
        <div className="te-header">
          <p className="te-subtitle">
            Gérez et mettez à jour l'état des interventions qui vous sont attribuées.
          </p>
        </div>

        {error && <div className="te-alert">{error}</div>}

        {loading ? (
          <div className="te-loading">
            <span className="te-spinner" />
            Chargement des interventions...
          </div>
        ) : (
          <>
            <div className="te-stats">
              <div className="te-hero">
                <span className="te-hero-label">Incidents affectés</span>
                <span className="te-hero-value">{total}</span>
              </div>

              {statCards.map((c) => (
                <div key={c.key} className={`te-card te-tone-${c.tone}`}>
                  <div className="te-card-top">
                    <span className="te-card-label">{c.label}</span>
                    <span className="te-card-pct">{pct(c.value)}%</span>
                  </div>
                  <span className="te-card-value">{c.value}</span>
                  <div className="te-bar">
                    <div className="te-bar-fill" style={{ width: `${pct(c.value)}%` }} />
                  </div>
                </div>
              ))}
            </div>

            {incidents.length === 0 ? (
              <div className="te-empty">
                <div className="te-empty-icon">🛠️</div>
                Aucun incident ne vous a été assigné pour le moment.
              </div>
            ) : (
              <>
                <div className="te-section-head">
                  <h3 className="te-section-title">Mes interventions</h3>
                  <span className="te-count">{total}</span>
                </div>

                <div className="te-grid">
                  {incidents.map((inc) => {
                    const currentStatus =
                      STATUS_OPTIONS.find((s) => s.value === inc.status) || STATUS_OPTIONS[0];
                    const priority = PRIORITY_MAP[inc.priority] || {
                      label: inc.priority || '—',
                      tone: 'slate',
                    };
                    const requester = inc.createdBy?.fullName || 'N/A';
                    return (
                      <div
                        key={inc.id}
                        className={`te-incident ${inc.priority === 'CRITICAL' ? 'is-critical' : ''}`}
                      >
                        <div className="te-incident-top">
                          <span className={`te-pill te-pill-${priority.tone}`}>{priority.label}</span>
                          <span className="te-incident-date">{formatDate(inc.createdAt)}</span>
                        </div>

                        <h4 className="te-incident-title">{inc.title}</h4>
                        <p className="te-incident-desc">{inc.description}</p>

                        <div className="te-requester">
                          <span className="te-requester-avatar">
                            {requester.charAt(0).toUpperCase()}
                          </span>
                          <div className="te-requester-info">
                            <span className="te-requester-label">Demandeur</span>
                            <span className="te-requester-name">{requester}</span>
                          </div>
                        </div>

                        <div className="te-status">
                          <label className="te-status-label">Statut d'avancement</label>
                          <select
                            value={inc.status}
                            onChange={(e) => handleStatusChange(inc.id, e.target.value)}
                            disabled={updatingId === inc.id}
                            className="te-status-select"
                            style={{
                              borderColor: currentStatus.color,
                              color: currentStatus.color,
                              backgroundColor: currentStatus.bg,
                            }}
                          >
                            {STATUS_OPTIONS.map((opt) => (
                              <option
                                key={opt.value}
                                value={opt.value}
                                style={{ color: '#0f172a', backgroundColor: '#ffffff' }}
                              >
                                {opt.label}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </>
        )}
      </div>
    </>
  );
}

const css = `
  .te-page {
    max-width: 1200px;
    margin: 0 auto;
    padding: 32px 20px 56px;
    font-family: 'Inter', system-ui, -apple-system, sans-serif;
    color: #0f172a;
  }

  .te-header { margin-bottom: 28px; }
  .te-eyebrow {
    display: inline-block;
    padding: 4px 10px;
    margin-bottom: 10px;
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.8px;
    text-transform: uppercase;
    color: #c2410c;
    background: #ffedd5;
    border-radius: 999px;
  }
  .te-title { margin: 0; font-size: 30px; font-weight: 800; letter-spacing: -0.8px; }
  .te-subtitle { margin: 6px 0 0; font-size: 14.5px; color: #64748b; }

  .te-alert {
    padding: 12px 16px;
    margin-bottom: 20px;
    font-size: 14px;
    color: #991b1b;
    background: #fef2f2;
    border: 1px solid #fecaca;
    border-radius: 12px;
  }

  .te-loading {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 12px;
    padding: 60px;
    color: #64748b;
  }
  .te-spinner {
    width: 18px;
    height: 18px;
    border: 2px solid #e2e8f0;
    border-top-color: #fb923c;
    border-radius: 50%;
    animation: te-spin 0.7s linear infinite;
  }
  @keyframes te-spin { to { transform: rotate(360deg); } }

  .te-stats {
    display: grid;
    grid-template-columns: 1.3fr repeat(3, 1fr);
    gap: 16px;
    margin-bottom: 32px;
  }
  .te-hero {
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
  .te-hero::after {
    content: '';
    position: absolute;
    top: -60px;
    right: -40px;
    width: 180px;
    height: 180px;
    background: radial-gradient(circle, rgba(251, 146, 60, 0.35) 0%, transparent 70%);
    pointer-events: none;
  }
  .te-hero-label {
    font-size: 12px;
    font-weight: 600;
    letter-spacing: 0.6px;
    text-transform: uppercase;
    color: #94a3b8;
  }
  .te-hero-value { font-size: 46px; font-weight: 800; letter-spacing: -1.5px; line-height: 1.1; }
  .te-hero-note { margin-top: 6px; font-size: 12.5px; color: #cbd5e1; }

  .te-card {
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
  .te-card:hover { transform: translateY(-2px); box-shadow: 0 12px 24px -12px rgba(15, 23, 42, 0.18); }
  .te-tone-red { --tone: #ef4444; --tone-soft: #fee2e2; }
  .te-tone-blue { --tone: #3b82f6; --tone-soft: #dbeafe; }
  .te-tone-green { --tone: #10b981; --tone-soft: #d1fae5; }
  .te-card-top { display: flex; align-items: center; justify-content: space-between; }
  .te-card-label { font-size: 13px; font-weight: 600; color: #64748b; }
  .te-card-pct {
    padding: 2px 8px;
    font-size: 11px;
    font-weight: 700;
    color: var(--tone);
    background: var(--tone-soft);
    border-radius: 999px;
  }
  .te-card-value { font-size: 32px; font-weight: 800; letter-spacing: -1px; }
  .te-bar { height: 6px; overflow: hidden; background: #f1f5f9; border-radius: 999px; }
  .te-bar-fill { height: 100%; background: var(--tone); border-radius: 999px; transition: width 0.6s ease; }

  .te-section-head { display: flex; align-items: center; gap: 10px; margin-bottom: 16px; }
  .te-section-title { margin: 0; font-size: 17px; font-weight: 700; }
  .te-count {
    padding: 2px 10px;
    font-size: 12px;
    font-weight: 700;
    color: #c2410c;
    background: #ffedd5;
    border-radius: 999px;
  }

  .te-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
    gap: 20px;
  }
  .te-incident {
    position: relative;
    display: flex;
    flex-direction: column;
    padding: 20px;
    overflow: hidden;
    background: #ffffff;
    border: 1px solid #e2e8f0;
    border-radius: 20px;
    box-shadow: 0 1px 2px rgba(15, 23, 42, 0.04);
    transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease;
  }
  .te-incident::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: linear-gradient(90deg, #fb923c, #fdba74);
    opacity: 0;
    transition: opacity 0.2s ease;
  }
  .te-incident.is-critical::before { opacity: 1; background: linear-gradient(90deg, #ef4444, #f87171); }
  .te-incident:hover {
    transform: translateY(-2px);
    border-color: #fed7aa;
    box-shadow: 0 14px 26px -14px rgba(251, 146, 60, 0.4);
  }
  .te-incident:hover::before { opacity: 1; }
  .te-incident-top { display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px; }
  .te-incident-date { font-size: 12px; color: #94a3b8; }
  .te-incident-title { margin: 0 0 8px; font-size: 16px; font-weight: 700; }
  .te-incident-desc {
    flex: 1;
    margin: 0 0 16px;
    font-size: 14px;
    line-height: 1.5;
    color: #475569;
    display: -webkit-box;
    -webkit-line-clamp: 3;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  .te-pill {
    display: inline-flex;
    align-items: center;
    padding: 4px 10px;
    font-size: 12px;
    font-weight: 700;
    border-radius: 999px;
    white-space: nowrap;
  }
  .te-pill-red { color: #b91c1c; background: #fee2e2; }
  .te-pill-orange { color: #c2410c; background: #ffedd5; }
  .te-pill-slate { color: #475569; background: #f1f5f9; }

  .te-requester {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 12px 0;
    margin-bottom: 14px;
    border-top: 1px solid #f1f5f9;
  }
  .te-requester-avatar {
    display: grid;
    place-items: center;
    width: 32px;
    height: 32px;
    font-size: 13px;
    font-weight: 800;
    color: #9a3412;
    background: #ffedd5;
    border-radius: 50%;
    flex-shrink: 0;
  }
  .te-requester-info { display: flex; flex-direction: column; line-height: 1.25; }
  .te-requester-label { font-size: 11px; font-weight: 600; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.5px; }
  .te-requester-name { font-size: 13.5px; font-weight: 600; color: #1e293b; }

  .te-status { display: flex; flex-direction: column; gap: 6px; }
  .te-status-label { font-size: 12px; font-weight: 600; color: #334155; }
  .te-status-select {
    width: 100%;
    padding: 10px 12px;
    font-family: inherit;
    font-size: 13px;
    font-weight: 700;
    border: 1.5px solid;
    border-radius: 12px;
    outline: none;
    cursor: pointer;
    transition: box-shadow 0.15s ease, opacity 0.15s ease;
  }
  .te-status-select:focus { box-shadow: 0 0 0 3px rgba(251, 146, 60, 0.22); }
  .te-status-select:disabled { opacity: 0.6; cursor: wait; }

  .te-empty {
    padding: 56px 20px;
    text-align: center;
    color: #64748b;
    background: #ffffff;
    border: 1px dashed #cbd5e1;
    border-radius: 22px;
  }
  .te-empty-icon { margin-bottom: 8px; font-size: 32px; }

  @media (max-width: 960px) {
    .te-stats { grid-template-columns: repeat(2, 1fr); }
    .te-hero { grid-column: span 2; }
  }
  @media (max-width: 560px) {
    .te-title { font-size: 25px; }
    .te-stats { grid-template-columns: 1fr; }
    .te-hero { grid-column: span 1; }
    .te-grid { grid-template-columns: 1fr; }
  }
`;