import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api/api';
import './TechnicianDashboard.css';

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
  const navigate = useNavigate();
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
                      onClick={() => navigate(`/incidents/${inc.id}`)}
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

                      <div className="te-status" onClick={(e) => e.stopPropagation()}>
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
  );
}