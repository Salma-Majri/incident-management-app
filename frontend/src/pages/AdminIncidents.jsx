import { useState, useEffect, useMemo } from 'react';
import API from '../api/axios';

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

  const handleAssign = async (incidentId) => {
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
    <>
      <style>{css}</style>

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
                        <tr key={inc.id}>
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
                          <td>
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
        )}
      </div>
    </>
  );
}

const css = `
  .ai-page {
    max-width: 1200px;
    margin: 0 auto;
    padding: 32px 20px 56px;
    font-family: 'Inter', system-ui, -apple-system, sans-serif;
    color: #0f172a;
  }

  .ai-page.is-embedded { max-width: none; padding: 0; }
  .ai-header { margin-bottom: 28px; }
  .ai-eyebrow {
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
  .ai-title { margin: 0; font-size: 30px; font-weight: 800; letter-spacing: -0.8px; }
  .ai-subtitle { margin: 6px 0 0; font-size: 14.5px; color: #64748b; }

  .ai-alert {
    padding: 12px 16px;
    margin-bottom: 20px;
    font-size: 14px;
    color: #991b1b;
    background: #fef2f2;
    border: 1px solid #fecaca;
    border-radius: 12px;
  }
  .ai-loading {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 12px;
    padding: 60px;
    color: #64748b;
  }
  .ai-spinner {
    width: 18px;
    height: 18px;
    border: 2px solid #e2e8f0;
    border-top-color: #a855f7;
    border-radius: 50%;
    animation: ai-spin 0.7s linear infinite;
  }
  @keyframes ai-spin { to { transform: rotate(360deg); } }

  .ai-empty, .ai-no-result { padding: 56px 20px; text-align: center; color: #64748b; }
  .ai-empty {
    background: #ffffff;
    border: 1px dashed #cbd5e1;
    border-radius: 22px;
  }
  .ai-empty-icon { margin-bottom: 8px; font-size: 32px; }

  .ai-panel {
    overflow: hidden;
    background: #ffffff;
    border: 1px solid #e2e8f0;
    border-radius: 22px;
    box-shadow: 0 10px 30px -18px rgba(15, 23, 42, 0.25);
  }

  .ai-toolbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    flex-wrap: wrap;
    padding: 20px 24px 14px;
  }
  .ai-toolbar-title { display: flex; align-items: center; gap: 10px; }
  .ai-panel-title { margin: 0; font-size: 17px; font-weight: 700; }
  .ai-count {
    padding: 2px 10px;
    font-size: 12px;
    font-weight: 700;
    color: #7e22ce;
    background: #f3e8ff;
    border-radius: 999px;
  }

  .ai-search { position: relative; flex: 1; max-width: 380px; min-width: 220px; }
  .ai-search-icon {
    position: absolute;
    top: 50%;
    left: 14px;
    color: #94a3b8;
    transform: translateY(-50%);
    pointer-events: none;
  }
  .ai-search-input {
    width: 100%;
    padding: 11px 38px 11px 40px;
    box-sizing: border-box;
    font-family: inherit;
    font-size: 14px;
    color: #0f172a;
    background: #f8fafc;
    border: 1px solid #e2e8f0;
    border-radius: 12px;
    outline: none;
    transition: border-color 0.15s ease, box-shadow 0.15s ease, background 0.15s ease;
  }
  .ai-search-input:focus {
    background: #ffffff;
    border-color: #a855f7;
    box-shadow: 0 0 0 3px rgba(168, 85, 247, 0.18);
  }
  .ai-search-clear {
    position: absolute;
    top: 50%;
    right: 10px;
    display: grid;
    place-items: center;
    width: 22px;
    height: 22px;
    font-size: 16px;
    line-height: 1;
    color: #64748b;
    background: #e2e8f0;
    border: none;
    border-radius: 50%;
    cursor: pointer;
    transform: translateY(-50%);
  }
  .ai-search-clear:hover { background: #cbd5e1; }

  .ai-filters {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    flex-wrap: wrap;
    padding: 0 24px 18px;
    border-bottom: 1px solid #f1f5f9;
  }
  .ai-chips { display: flex; flex-wrap: wrap; gap: 8px; }
  .ai-chip {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 7px 14px;
    font-family: inherit;
    font-size: 13px;
    font-weight: 600;
    color: #475569;
    background: #f8fafc;
    border: 1px solid #e2e8f0;
    border-radius: 999px;
    cursor: pointer;
    transition: all 0.15s ease;
  }
  .ai-chip:hover { border-color: #c4b5fd; color: #6d28d9; }
  .ai-chip.is-active {
    color: #ffffff;
    background: linear-gradient(135deg, #a855f7 0%, #7c3aed 100%);
    border-color: transparent;
    box-shadow: 0 6px 14px -6px rgba(124, 58, 237, 0.6);
  }
  .ai-chip-count {
    padding: 1px 7px;
    font-size: 11px;
    font-weight: 700;
    color: #64748b;
    background: #e2e8f0;
    border-radius: 999px;
  }
  .ai-chip.is-active .ai-chip-count { color: #ffffff; background: rgba(255, 255, 255, 0.25); }

  .ai-filters-right { display: flex; align-items: center; gap: 10px; }
  .ai-select-filter {
    padding: 8px 12px;
    font-family: inherit;
    font-size: 13px;
    font-weight: 600;
    color: #334155;
    background: #f8fafc;
    border: 1px solid #e2e8f0;
    border-radius: 10px;
    outline: none;
    cursor: pointer;
  }
  .ai-select-filter:focus {
    border-color: #a855f7;
    box-shadow: 0 0 0 3px rgba(168, 85, 247, 0.18);
  }
  .ai-reset {
    padding: 8px 4px;
    font-family: inherit;
    font-size: 13px;
    font-weight: 600;
    color: #7c3aed;
    background: transparent;
    border: none;
    cursor: pointer;
  }
  .ai-reset:hover { text-decoration: underline; }

  .ai-table-scroll { overflow-x: auto; }
  .ai-table {
    width: 100%;
    min-width: 900px;
    border-collapse: collapse;
    text-align: left;
  }
  .ai-table th {
    padding: 12px 24px;
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.7px;
    text-transform: uppercase;
    color: #64748b;
    background: #f8fafc;
    border-bottom: 1px solid #e2e8f0;
  }
  .ai-table td {
    padding: 14px 24px;
    font-size: 14px;
    color: #1e293b;
    border-bottom: 1px solid #f1f5f9;
    vertical-align: middle;
  }
  .ai-table tbody tr { transition: background 0.15s ease; }
  .ai-table tbody tr:hover { background: #faf5ff; }
  .ai-table tbody tr:last-child td { border-bottom: none; }
  .ai-cell-title { font-weight: 600; max-width: 280px; }
  .ai-cell-action { text-align: right; }

  .ai-pill {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 4px 10px;
    font-size: 12px;
    font-weight: 700;
    border-radius: 999px;
    white-space: nowrap;
  }
  .ai-pill-dot::before {
    content: '';
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: currentColor;
  }
  .ai-pill-red { color: #b91c1c; background: #fee2e2; }
  .ai-pill-orange { color: #c2410c; background: #ffedd5; }
  .ai-pill-blue { color: #1d4ed8; background: #dbeafe; }
  .ai-pill-amber { color: #b45309; background: #fef3c7; }
  .ai-pill-green { color: #047857; background: #d1fae5; }
  .ai-pill-slate { color: #475569; background: #f1f5f9; }

  .ai-user { display: flex; align-items: center; gap: 10px; }
  .ai-user-avatar {
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

  .ai-select {
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
  .ai-select:focus {
    border-color: #a855f7;
    box-shadow: 0 0 0 3px rgba(168, 85, 247, 0.18);
  }

  .ai-btn {
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
  .ai-btn:hover:not(:disabled) {
    transform: translateY(-1px);
    box-shadow: 0 10px 18px -6px rgba(124, 58, 237, 0.65);
  }
  .ai-btn:disabled { opacity: 0.6; cursor: wait; }

  @media (max-width: 720px) {
    .ai-title { font-size: 25px; }
    .ai-toolbar { padding: 18px 16px 12px; }
    .ai-filters { padding: 0 16px 16px; }
    .ai-search { max-width: none; width: 100%; }
    .ai-table th, .ai-table td { padding-left: 16px; padding-right: 16px; }
  }
`;