import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api/api';
import './EmployeeDashboard.css';

const STATUS_MAP = {
  OPEN: { label: 'Ouvert', tone: 'blue' },
  ASSIGNED: { label: 'Assigné', tone: 'violet' },
  IN_PROGRESS: { label: 'En cours', tone: 'amber' },
  RESOLVED: { label: 'Résolu', tone: 'green' },
  CLOSED: { label: 'Clôturé', tone: 'green' },
};

const PRIORITY_MAP = {
  CRITICAL: { label: 'Critique', tone: 'red' },
  HIGH: { label: 'Haute', tone: 'orange' },
  MEDIUM: { label: 'Moyenne', tone: 'slate' },
  LOW: { label: 'Basse', tone: 'slate' },
};

const formatDate = (value) =>
  value ? new Date(value).toLocaleDateString('fr-FR') : '—';

export default function EmployeeDashboard() {
  const navigate = useNavigate();
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'MEDIUM',
  });

  useEffect(() => {
    fetchIncidents();
  }, []);

  const fetchIncidents = async () => {
    try {
      setLoading(true);
      const response = await API.get('/api/incidents/my');
      setIncidents(response.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors du chargement des incidents');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      await API.post('/api/incidents', formData);
      setSuccess('Incident déclaré avec succès !');
      setShowModal(false);
      setFormData({ title: '', description: '', priority: 'MEDIUM' });
      fetchIncidents();
    } catch (err) {
      setError(err.response?.data?.message || "Erreur lors de la création de l'incident");
    }
  };

  const sorted = [...incidents].sort(
    (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
  );
  const recent = sorted.slice(0, 5);

  const total = incidents.length;
  const openCount = incidents.filter((i) => i.status === 'OPEN').length;
  const inProgressCount = incidents.filter((i) => i.status === 'IN_PROGRESS').length;
  const doneCount = incidents.filter((i) => i.status === 'RESOLVED' || i.status === 'CLOSED').length;

  const pct = (value) => (total ? Math.round((value / total) * 100) : 0);

  const statCards = [
    { key: 'open', label: 'Ouverts', value: openCount, tone: 'blue' },
    { key: 'progress', label: 'En cours', value: inProgressCount, tone: 'amber' },
    { key: 'done', label: 'Résolus / Clôturés', value: doneCount, tone: 'green' },
  ];

  const renderPill = (map, key) => {
    const item = map[key] || { label: key || '—', tone: 'slate' };
    return item;
  };

  return (
    <div className="em-page">
      <div className="em-header">
        <div>
          <p className="em-subtitle">Suivez et déclarez vos problèmes techniques.</p>
        </div>
        <button type="button" className="em-btn" onClick={() => setShowModal(true)}>
          <span className="em-btn-plus">+</span> Déclarer un incident
        </button>
      </div>

      {error && <div className="em-alert em-alert-error">{error}</div>}
      {success && <div className="em-alert em-alert-success">{success}</div>}

      {loading ? (
        <div className="em-loading">
          <span className="em-spinner" />
          Chargement des incidents...
        </div>
      ) : (
        <>
          <div className="em-stats">
            <div className="em-hero">
              <span className="em-hero-label">Total de mes incidents</span>
              <span className="em-hero-value">{total}</span>
            </div>

            {statCards.map((c) => (
              <div key={c.key} className={`em-card em-tone-${c.tone}`}>
                <div className="em-card-top">
                  <span className="em-card-label">{c.label}</span>
                  <span className="em-card-pct">{pct(c.value)}%</span>
                </div>
                <span className="em-card-value">{c.value}</span>
                <div className="em-bar">
                  <div className="em-bar-fill" style={{ width: `${pct(c.value)}%` }} />
                </div>
              </div>
            ))}
          </div>

          {incidents.length === 0 ? (
            <div className="em-empty">
              <div className="em-empty-icon">📭</div>
              Aucun incident déclaré pour le moment.
            </div>
          ) : (
            <>
              <div className="em-panel">
                <div className="em-panel-head">
                  <h3 className="em-panel-title">Derniers incidents</h3>
                  <span className="em-count">{recent.length}</span>
                </div>
                <ul className="em-recent">
                  {recent.map((inc) => {
                    const status = renderPill(STATUS_MAP, inc.status);
                    const priority = renderPill(PRIORITY_MAP, inc.priority);
                    return (
                      <li
                        key={inc.id || inc._id}
                        className="em-recent-item"
                        onClick={() => navigate(`/incidents/${inc.id || inc._id}`)}
                      >
                        <span className={`em-recent-dot em-dot-${status.tone}`} />
                        <div className="em-recent-main">
                          <span className="em-recent-title">{inc.title}</span>
                          <span className="em-recent-date">{formatDate(inc.createdAt)}</span>
                        </div>
                        <span className={`em-pill em-pill-${priority.tone}`}>{priority.label}</span>
                        <span className={`em-pill em-pill-dot em-pill-${status.tone}`}>
                          {status.label}
                        </span>
                      </li>
                    );
                  })}
                </ul>
              </div>

              <div className="em-section-head">
                <h3 className="em-panel-title">Tous mes incidents</h3>
                <span className="em-count">{total}</span>
              </div>

              <div className="em-grid">
                {sorted.map((inc) => {
                  const status = renderPill(STATUS_MAP, inc.status || 'OPEN');
                  const priority = renderPill(PRIORITY_MAP, inc.priority);
                  return (
                    <div
                      key={inc.id || inc._id}
                      className="em-incident"
                      onClick={() => navigate(`/incidents/${inc.id || inc._id}`)}
                    >
                      <div className="em-incident-top">
                        <span className={`em-pill em-pill-${priority.tone}`}>{priority.label}</span>
                        <span className="em-incident-date">{formatDate(inc.createdAt)}</span>
                      </div>
                      <h4 className="em-incident-title">{inc.title}</h4>
                      <p className="em-incident-desc">{inc.description}</p>
                      <div className="em-incident-foot">
                        <span className="em-incident-foot-label">Statut</span>
                        <span className={`em-pill em-pill-dot em-pill-${status.tone}`}>
                          {status.label}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </>
      )}

      {showModal && (
        <div className="em-overlay" onClick={() => setShowModal(false)}>
          <div className="em-modal" onClick={(e) => e.stopPropagation()}>
            <div className="em-modal-head">
              <h3 className="em-modal-title">Déclarer un nouvel incident</h3>
              <button
                type="button"
                className="em-close"
                onClick={() => setShowModal(false)}
                aria-label="Fermer"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit} className="em-form">
              <div className="em-field">
                <label className="em-label">Titre</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  required
                  placeholder="Ex: Panne imprimante bureau 3"
                  className="em-input"
                />
              </div>

              <div className="em-field">
                <label className="em-label">Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  required
                  rows="4"
                  placeholder="Décrivez le problème en détail..."
                  className="em-input em-textarea"
                />
              </div>

              <div className="em-field">
                <label className="em-label">Priorité</label>
                <select
                  name="priority"
                  value={formData.priority}
                  onChange={handleChange}
                  className="em-input"
                >
                  <option value="LOW">Basse</option>
                  <option value="MEDIUM">Moyenne</option>
                  <option value="HIGH">Haute</option>
                  <option value="CRITICAL">Critique</option>
                </select>
              </div>

              <div className="em-actions">
                <button type="button" className="em-btn-ghost" onClick={() => setShowModal(false)}>
                  Annuler
                </button>
                <button type="submit" className="em-btn">
                  Envoyer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}