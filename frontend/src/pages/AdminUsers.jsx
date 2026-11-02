import { useState, useEffect, useMemo } from 'react';
import API from '../api/api';

const ROLE_MAP = {
  ADMIN: { label: 'Administrateur', tone: 'violet' },
  TECHNICIAN: { label: 'Technicien', tone: 'orange' },
  EMPLOYEE: { label: 'Employé', tone: 'green' },
};

const ROLE_FILTERS = [
  { value: 'ALL', label: 'Tous' },
  { value: 'ADMIN', label: 'Administrateurs' },
  { value: 'TECHNICIAN', label: 'Techniciens' },
  { value: 'EMPLOYEE', label: 'Employés' },
];

const STATUS_FILTERS = [
  { value: 'ALL', label: 'Tous les statuts' },
  { value: 'ACTIVE', label: 'Actifs' },
  { value: 'DISABLED', label: 'Désactivés' },
];

export default function AdminUsers({ embedded = false, onChange }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await API.get('/api/admin/users');
      setUsers(response.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors du chargement des utilisateurs');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (userId, currentStatus) => {
    const action = currentStatus ? 'disable' : 'enable';
    try {
      await API.put(`/api/admin/users/${userId}/${action}`);
      alert(`Utilisateur ${action === 'enable' ? 'activé' : 'désactivé'} avec succès !`);
      fetchUsers();
      if (onChange) onChange();
    } catch (err) {
      alert(err.response?.data?.message || "Erreur lors de la modification du statut");
    }
  };

  const roleCounts = useMemo(() => {
    const counts = { ALL: users.length, ADMIN: 0, TECHNICIAN: 0, EMPLOYEE: 0 };
    users.forEach((u) => {
      if (counts[u.role] !== undefined) counts[u.role] += 1;
    });
    return counts;
  }, [users]);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return users.filter((u) => {
      const matchesSearch =
        !term ||
        (u.fullName || '').toLowerCase().includes(term) ||
        (u.email || '').toLowerCase().includes(term);
      const matchesRole = roleFilter === 'ALL' || u.role === roleFilter;
      const matchesStatus =
        statusFilter === 'ALL' ||
        (statusFilter === 'ACTIVE' && u.enabled) ||
        (statusFilter === 'DISABLED' && !u.enabled);
      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [users, search, roleFilter, statusFilter]);

  const hasFilters = search || roleFilter !== 'ALL' || statusFilter !== 'ALL';

  const resetFilters = () => {
    setSearch('');
    setRoleFilter('ALL');
    setStatusFilter('ALL');
  };

  return (
    <>
      <style>{css}</style>

      <div className={`au-page ${embedded ? 'is-embedded' : ''}`}>
        {!embedded && (
          <div className="au-header">
            <span className="au-eyebrow">Espace administrateur</span>
            <h2 className="au-title">Gestion des utilisateurs</h2>
            <p className="au-subtitle">
              Liste de tous les comptes de l'entreprise et contrôle d'accès.
            </p>
          </div>
        )}

        {error && <div className="au-alert">{error}</div>}

        {loading ? (
          <div className="au-loading">
            <span className="au-spinner" />
            Chargement des utilisateurs...
          </div>
        ) : users.length === 0 ? (
          <div className="au-empty">
            <div className="au-empty-icon">👥</div>
            Aucun utilisateur trouvé.
          </div>
        ) : (
          <div className="au-panel">
            <div className="au-toolbar">
              <div className="au-toolbar-title">
                <h3 className="au-panel-title">Utilisateurs</h3>
                <span className="au-count">{filtered.length}</span>
              </div>

              <div className="au-search">
                <svg
                  className="au-search-icon"
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
                  className="au-search-input"
                  placeholder="Rechercher un nom ou un email..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
                {search && (
                  <button
                    type="button"
                    className="au-search-clear"
                    onClick={() => setSearch('')}
                    aria-label="Effacer la recherche"
                  >
                    ×
                  </button>
                )}
              </div>
            </div>

            <div className="au-filters">
              <div className="au-chips">
                {ROLE_FILTERS.map((f) => (
                  <button
                    key={f.value}
                    type="button"
                    className={`au-chip ${roleFilter === f.value ? 'is-active' : ''}`}
                    onClick={() => setRoleFilter(f.value)}
                  >
                    {f.label}
                    <span className="au-chip-count">{roleCounts[f.value]}</span>
                  </button>
                ))}
              </div>

              <div className="au-filters-right">
                <select
                  className="au-select"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  {STATUS_FILTERS.map((f) => (
                    <option key={f.value} value={f.value}>
                      {f.label}
                    </option>
                  ))}
                </select>
                {hasFilters && (
                  <button type="button" className="au-reset" onClick={resetFilters}>
                    Réinitialiser
                  </button>
                )}
              </div>
            </div>

            {filtered.length === 0 ? (
              <div className="au-no-result">
                <div className="au-empty-icon">🔍</div>
                Aucun utilisateur ne correspond à votre recherche.
              </div>
            ) : (
              <div className="au-table-scroll">
                <table className="au-table">
                  <thead>
                    <tr>
                      <th>Utilisateur</th>
                      <th>Rôle</th>
                      <th>Statut</th>
                      <th aria-label="Action" />
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((user) => {
                      const role = ROLE_MAP[user.role] || { label: user.role, tone: 'slate' };
                      const name = user.fullName || '—';
                      return (
                        <tr key={user.id}>
                          <td>
                            <div className="au-user">
                              <span className={`au-avatar au-avatar-${role.tone}`}>
                                {name.charAt(0).toUpperCase()}
                              </span>
                              <div className="au-user-info">
                                <span className="au-user-name">{name}</span>
                                <span className="au-user-email">{user.email}</span>
                              </div>
                            </div>
                          </td>
                          <td>
                            <span className={`au-pill au-pill-${role.tone}`}>{role.label}</span>
                          </td>
                          <td>
                            <span
                              className={`au-pill au-pill-dot ${user.enabled ? 'au-pill-green' : 'au-pill-red'}`}
                            >
                              {user.enabled ? 'Actif' : 'Désactivé'}
                            </span>
                          </td>
                          <td className="au-cell-action">
                            <button
                              type="button"
                              className={`au-btn ${user.enabled ? 'au-btn-danger' : 'au-btn-success'}`}
                              onClick={() => handleToggleStatus(user.id, user.enabled)}
                            >
                              {user.enabled ? 'Désactiver' : 'Activer'}
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
  .au-page {
    max-width: 1200px;
    margin: 0 auto;
    padding: 32px 20px 56px;
    font-family: 'Inter', system-ui, -apple-system, sans-serif;
    color: #0f172a;
  }

  .au-page.is-embedded { max-width: none; padding: 0; }
  .au-header { margin-bottom: 28px; }
  .au-eyebrow {
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
  .au-title { margin: 0; font-size: 30px; font-weight: 800; letter-spacing: -0.8px; }
  .au-subtitle { margin: 6px 0 0; font-size: 14.5px; color: #64748b; }

  .au-alert {
    padding: 12px 16px;
    margin-bottom: 20px;
    font-size: 14px;
    color: #991b1b;
    background: #fef2f2;
    border: 1px solid #fecaca;
    border-radius: 12px;
  }
  .au-loading {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 12px;
    padding: 60px;
    color: #64748b;
  }
  .au-spinner {
    width: 18px;
    height: 18px;
    border: 2px solid #e2e8f0;
    border-top-color: #a855f7;
    border-radius: 50%;
    animation: au-spin 0.7s linear infinite;
  }
  @keyframes au-spin { to { transform: rotate(360deg); } }

  .au-empty, .au-no-result {
    padding: 56px 20px;
    text-align: center;
    color: #64748b;
  }
  .au-empty {
    background: #ffffff;
    border: 1px dashed #cbd5e1;
    border-radius: 22px;
  }
  .au-empty-icon { margin-bottom: 8px; font-size: 32px; }

  .au-panel {
    overflow: hidden;
    background: #ffffff;
    border: 1px solid #e2e8f0;
    border-radius: 22px;
    box-shadow: 0 10px 30px -18px rgba(15, 23, 42, 0.25);
  }

  .au-toolbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    flex-wrap: wrap;
    padding: 20px 24px 14px;
  }
  .au-toolbar-title { display: flex; align-items: center; gap: 10px; }
  .au-panel-title { margin: 0; font-size: 17px; font-weight: 700; }
  .au-count {
    padding: 2px 10px;
    font-size: 12px;
    font-weight: 700;
    color: #7e22ce;
    background: #f3e8ff;
    border-radius: 999px;
  }

  .au-search {
    position: relative;
    flex: 1;
    max-width: 380px;
    min-width: 220px;
  }
  .au-search-icon {
    position: absolute;
    top: 50%;
    left: 14px;
    color: #94a3b8;
    transform: translateY(-50%);
    pointer-events: none;
  }
  .au-search-input {
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
  .au-search-input:focus {
    background: #ffffff;
    border-color: #a855f7;
    box-shadow: 0 0 0 3px rgba(168, 85, 247, 0.18);
  }
  .au-search-clear {
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
  .au-search-clear:hover { background: #cbd5e1; }

  .au-filters {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    flex-wrap: wrap;
    padding: 0 24px 18px;
    border-bottom: 1px solid #f1f5f9;
  }
  .au-chips { display: flex; flex-wrap: wrap; gap: 8px; }
  .au-chip {
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
  .au-chip:hover { border-color: #c4b5fd; color: #6d28d9; }
  .au-chip.is-active {
    color: #ffffff;
    background: linear-gradient(135deg, #a855f7 0%, #7c3aed 100%);
    border-color: transparent;
    box-shadow: 0 6px 14px -6px rgba(124, 58, 237, 0.6);
  }
  .au-chip-count {
    padding: 1px 7px;
    font-size: 11px;
    font-weight: 700;
    color: #64748b;
    background: #e2e8f0;
    border-radius: 999px;
  }
  .au-chip.is-active .au-chip-count { color: #ffffff; background: rgba(255, 255, 255, 0.25); }

  .au-filters-right { display: flex; align-items: center; gap: 10px; }
  .au-select {
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
  .au-select:focus {
    border-color: #a855f7;
    box-shadow: 0 0 0 3px rgba(168, 85, 247, 0.18);
  }
  .au-reset {
    padding: 8px 4px;
    font-family: inherit;
    font-size: 13px;
    font-weight: 600;
    color: #7c3aed;
    background: transparent;
    border: none;
    cursor: pointer;
  }
  .au-reset:hover { text-decoration: underline; }

  .au-table-scroll { overflow-x: auto; }
  .au-table {
    width: 100%;
    min-width: 720px;
    border-collapse: collapse;
    text-align: left;
  }
  .au-table th {
    padding: 12px 24px;
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.7px;
    text-transform: uppercase;
    color: #64748b;
    background: #f8fafc;
    border-bottom: 1px solid #e2e8f0;
  }
  .au-table td {
    padding: 14px 24px;
    font-size: 14px;
    color: #1e293b;
    border-bottom: 1px solid #f1f5f9;
    vertical-align: middle;
  }
  .au-table tbody tr { transition: background 0.15s ease; }
  .au-table tbody tr:hover { background: #faf5ff; }
  .au-table tbody tr:last-child td { border-bottom: none; }
  .au-cell-action { text-align: right; }

  .au-user { display: flex; align-items: center; gap: 12px; }
  .au-avatar {
    display: grid;
    place-items: center;
    width: 38px;
    height: 38px;
    font-size: 14px;
    font-weight: 800;
    border-radius: 50%;
    flex-shrink: 0;
  }
  .au-avatar-violet { color: #6d28d9; background: #ede9fe; }
  .au-avatar-orange { color: #c2410c; background: #ffedd5; }
  .au-avatar-green { color: #047857; background: #d1fae5; }
  .au-avatar-slate { color: #475569; background: #f1f5f9; }
  .au-user-info { display: flex; flex-direction: column; line-height: 1.3; min-width: 0; }
  .au-user-name { font-size: 14.5px; font-weight: 600; }
  .au-user-email { font-size: 12.5px; color: #64748b; }

  .au-pill {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 4px 11px;
    font-size: 12px;
    font-weight: 700;
    border-radius: 999px;
    white-space: nowrap;
  }
  .au-pill-dot::before {
    content: '';
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: currentColor;
  }
  .au-pill-violet { color: #6d28d9; background: #ede9fe; }
  .au-pill-orange { color: #c2410c; background: #ffedd5; }
  .au-pill-green { color: #047857; background: #d1fae5; }
  .au-pill-red { color: #b91c1c; background: #fee2e2; }
  .au-pill-slate { color: #475569; background: #f1f5f9; }

  .au-btn {
    padding: 8px 16px;
    font-family: inherit;
    font-size: 13px;
    font-weight: 700;
    border: 1px solid transparent;
    border-radius: 10px;
    cursor: pointer;
    transition: all 0.15s ease;
  }
  .au-btn-danger { color: #b91c1c; background: #fef2f2; border-color: #fecaca; }
  .au-btn-danger:hover { color: #ffffff; background: #dc2626; border-color: #dc2626; }
  .au-btn-success { color: #047857; background: #ecfdf5; border-color: #a7f3d0; }
  .au-btn-success:hover { color: #ffffff; background: #10b981; border-color: #10b981; }

  @media (max-width: 720px) {
    .au-title { font-size: 25px; }
    .au-toolbar { padding: 18px 16px 12px; }
    .au-filters { padding: 0 16px 16px; }
    .au-search { max-width: none; width: 100%; }
    .au-table th, .au-table td { padding-left: 16px; padding-right: 16px; }
  }
`;