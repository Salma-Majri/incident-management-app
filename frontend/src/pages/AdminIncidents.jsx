import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api/api';
import './AdminIncidents.css';

const STATUS_MAP = {
  OPEN: { label: 'Ouvert', tone: 'blue' },
  ASSIGNED: { label: 'Assigné', tone: 'amber' },
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

const STATUS_FILTERS = [
  { value: 'ALL', label: 'Tous' },
  { value: 'OPEN', label: 'Ouverts' },
  { value: 'PROGRESS', label: 'En cours / Assignés' },
  { value: 'DONE', label: 'Clôturés / Résolus' },
];

const PRIORITY_FILTERS = [
  { value: 'ALL', label: 'Toutes les priorités' },
  { value: 'CRITICAL', label: 'Critique' },
  { value: 'HIGH', label: 'Haute' },
  { value: 'MEDIUM', label: 'Moyenne' },
  { value: 'LOW', label: 'Basse' },
];

const matchesStatus = (status, filter) => {
  if (filter === 'ALL') return true;
  if (filter === 'OPEN') return status === 'OPEN';
  if (filter === 'PROGRESS') return status === 'ASSIGNED' || status === 'IN_PROGRESS';
  return status === 'RESOLVED' || status === 'CLOSED';
};

export default function AdminIncidents({ embedded = false, onChange }) {
  const navigate = useNavigate();
  const [incidents, setIncidents] = useState([]);
  const [technicians, setTechnicians] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedTechs, setSelectedTechs] = useState({});
  const [assigningId, setAssigningId] = useState(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [priorityFilter, setPriorityFilter] = useState('ALL');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const incRes = await API.get('/api/incidents');
      setIncidents(incRes.data || []);

      try {
        const usersRes = await API.get('/api/admin/users');
        const usersData = usersRes.data || [];
        setTechnicians(usersData.filter((u) => u.role === 'TECHNICIAN'));
      } catch (e) {
        console.log('Impossible de charger la liste des techniciens', e);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors du chargement des incidents');
    } finally {
      setLoading(false);
    }
  };

  const handleAssign = async (e, incidentId) => {
    e.stopPropagation(); 
    const technicianId = selectedTechs[incidentId];
    if (!technicianId) {
      alert('Veuillez sélectionner un technicien.');
      return;
    }

    try {
      setAssigningId(incidentId);
      await API.put(`/api/incidents/${incidentId}/assign/${technicianId}`);
      alert('Incident assigné avec succès !');
      fetchData();
      if (onChange) onChange();
    } catch (err) {
      alert(err.response?.data?.message || "Erreur lors de l'assignation");
    } finally {
      setAssigningId(null);
    }
  };

  const statusCounts = useMemo(
    () => ({
      ALL: incidents.length,
      OPEN: incidents.filter((i) => matchesStatus(i.status, 'OPEN')).length,
      PROGRESS: incidents.filter((i) => matchesStatus(i.status, 'PROGRESS')).length,
      DONE: incidents.filter((i) => matchesStatus(i.status, 'DONE')).length,
    }),
    [incidents]
  );

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return incidents.filter((inc) => {
      const matchesSearch =
        !term ||
        (inc.title || '').toLowerCase().includes(term) ||
        (inc.createdBy?.fullName || '').toLowerCase().includes(term);
      const okStatus = matchesStatus(inc.status, statusFilter);
      const okPriority = priorityFilter === 'ALL' || inc.priority === priorityFilter;
      return matchesSearch && okStatus && okPriority;
    });
  }, [incidents, search, statusFilter, priorityFilter]);

  const hasFilters = search || statusFilter !== 'ALL' || priorityFilter !== 'ALL';

  const resetFilters = () => {
    setSearch('');
    setStatusFilter('ALL');
    setPriorityFilter('ALL');
  };

  return (
    <div className={`ai-page ${embedded ? 'is-embedded' : ''}`}>
      {!embedded && (
        <div className="ai-header">
          <span className="ai-eyebrow">Espace administrateur</span>
          <h2 className="ai-title">Gestion des incidents</h2>
          <p className="ai-subtitle">
            Consultez tous les incidents et assignez-les aux techniciens.
          </p>
        </div>
      )}

      {error && <div className="ai-alert">{error}</div>}

      {loading ? (
        <div className="ai-loading">
          <span className="ai-spinner" />
          Chargement des incidents...
        </div>
      ) : incidents.length === 0 ? (
        <div className="ai-empty">
          <div className="ai-empty-icon">📭</div>
          Aucun incident enregistré dans le système.
        </div>
      ) : (
        <div className="ai-panel">
          <div className="ai-toolbar">
            <div className="ai-toolbar-title">
              <h3 className="ai-panel-title">Incidents</h3>
              <span className="ai-count">{filtered.length}</span>
            </div>

            <div className="ai-search">
              <svg
                className="ai-search-icon"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <circle cx="11" cy="11" r="7" />
                <path d="M21 21l-4.3-4.3" />
              </svg>
              <input
                type="text"
                className="ai-search-input"
                placeholder="Rechercher un titre ou un demandeur..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              {search && (
                <button
                  type="button"
                  className="ai-search-clear"
                  onClick={() => setSearch('')}
                  aria-label="Effacer la recherche"
                >
                  ×
                </button>
              )}
            </div>
          </div>

          <div className="ai-filters">
            <div className="ai-chips">
              {STATUS_FILTERS.map((f) => (
                <button
                  key={f.value}
                  type="button"
                  className={`ai-chip ${statusFilter === f.value ? 'is-active' : ''}`}
                  onClick={() => setStatusFilter(f.value)}
                >
                  {f.label}
                  <span className="ai-chip-count">{statusCounts[f.value]}</span>
                </button>
              ))}
            </div>

            <div className="ai-filters-right">
              <select
                className="ai-select-filter"
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
              >
                {PRIORITY_FILTERS.map((f) => (
                  <option key={f.value} value={f.value}>
                    {f.label}
                  </option>
                ))}
              </select>
              {hasFilters && (
                <button type="button" className="ai-reset" onClick={resetFilters}>
                  Réinitialiser
                </button>
              )}
            </div>
          </div>

          {filtered.length === 0 ? (
            <div className="ai-no-result">
              <div className="ai-empty-icon">🔍</div>
              Aucun incident ne correspond à votre recherche.
            </div>
          ) : (
            <div className="ai-table-scroll">
              <table className="ai-table">
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
                  {filtered.map((inc) => {
                    const status = STATUS_MAP[inc.status] || { label: inc.status, tone: 'slate' };
                    const priority = PRIORITY_MAP[inc.priority] || {
                      label: inc.priority,
                      tone: 'slate',
                    };
                    const requester = inc.createdBy?.fullName || 'N/A';
                    return (
                      <tr 
                        key={inc.id} 
                        onClick={() => navigate(`/incidents/${inc.id}`)}
                        style={{ cursor: 'pointer' }}
                        title="Cliquez pour voir les détails"
                      >
                        <td className="ai-cell-title">{inc.title}</td>
                        <td>
                          <span className={`ai-pill ai-pill-${priority.tone}`}>{priority.label}</span>
                        </td>
                        <td>
                          <span className={`ai-pill ai-pill-dot ai-pill-${status.tone}`}>
                            {status.label}
                          </span>
                        </td>
                        <td>
                          <div className="ai-user">
                            <span className="ai-user-avatar">{requester.charAt(0).toUpperCase()}</span>
                            <span>{requester}</span>
                          </div>
                        </td>
                        <td onClick={(e) => e.stopPropagation()}>
                          <select
                            className="ai-select"
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
                        <td className="ai-cell-action">
                          <button
                            type="button"
                            className="ai-btn"
                            onClick={(e) => handleAssign(e, inc.id)}
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
      )}
    </div>
  );
}