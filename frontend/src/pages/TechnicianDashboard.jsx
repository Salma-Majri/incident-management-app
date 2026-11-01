import { useState, useEffect } from 'react';
import API from '../api/axios';

const STATUS_OPTIONS = [
  { value: 'OPEN', label: 'Ouvert', color: '#64748b', bg: '#f1f5f9' },
  { value: 'ASSIGNED', label: 'Assigné', color: '#8b5cf6', bg: '#ede9fe' },
  { value: 'IN_PROGRESS', label: 'En cours', color: '#3b82f6', bg: '#dbeafe' },
  { value: 'RESOLVED', label: 'Résolu', color: '#10b981', bg: '#d1fae5' },
  { value: 'CLOSED', label: 'Fermé', color: '#4b5563', bg: '#e5e7eb' },
];
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
      setIncidents(response.data);
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

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2 style={styles.title}>Incidents Assignés</h2>
        <p style={styles.subtitle}>Gérez et mettez à jour l'état des interventions qui vous sont attribuées.</p>
      </div>

      {error && <div style={styles.errorBox}>{error}</div>}

      {loading ? (
        <div style={styles.loading}>Chargement des interventions...</div>
      ) : incidents.length === 0 ? (
        <div style={styles.emptyState}>Aucun incident ne vous a été assigné pour le moment.</div>
      ) : (
        <div style={styles.grid}>
          {incidents.map((inc) => {
            const currentStatus = STATUS_OPTIONS.find((s) => s.value === inc.status) || STATUS_OPTIONS[0];
            return (
              <div key={inc.id} style={styles.card}>
                <div style={styles.cardHeader}>
                  <span
                    style={{
                      ...styles.priorityBadge,
                      backgroundColor:
                        inc.priority === 'URGENT' ? '#fee2e2' : inc.priority === 'HIGH' ? '#ffedd5' : '#f1f5f9',
                      color:
                        inc.priority === 'URGENT' ? '#dc2626' : inc.priority === 'HIGH' ? '#c2410c' : '#475569',
                    }}
                  >
                    {inc.priority}
                  </span>
                </div>

                <h4 style={styles.cardTitle}>{inc.title}</h4>
                <p style={styles.cardDesc}>{inc.description}</p>

                <div style={styles.metaInfo}>
                  <span><strong>Demandeur :</strong> {inc.createdBy?.fullName || 'N/A'}</span>
                  <span><strong>Date :</strong> {new Date(inc.createdAt).toLocaleDateString()}</span>
                </div>

                <div style={styles.statusSection}>
                  <label style={styles.statusLabel}>Statut d'avancement :</label>
                  <select
                    value={inc.status}
                    onChange={(e) => handleStatusChange(inc.id, e.target.value)}
                    disabled={updatingId === inc.id}
                    style={{
                      ...styles.statusSelect,
                      borderColor: currentStatus.color,
                      color: currentStatus.color,
                      backgroundColor: currentStatus.bg,
                    }}
                  >
                    {STATUS_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value} style={{ color: '#0f172a', backgroundColor: '#ffffff' }}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    maxWidth: '1000px',
    margin: '0 auto',
    fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
  },
  header: {
    marginBottom: '24px',
  },
  title: {
    fontSize: '24px',
    fontWeight: '700',
    color: '#0f172a',
  },
  subtitle: {
    fontSize: '14px',
    color: '#64748b',
    marginTop: '4px',
  },
  errorBox: {
    backgroundColor: '#fef2f2',
    color: '#991b1b',
    padding: '12px',
    borderRadius: '8px',
    fontSize: '14px',
    marginBottom: '20px',
    border: '1px solid #fecaca',
  },
  loading: {
    textAlign: 'center',
    padding: '40px',
    color: '#64748b',
  },
  emptyState: {
    textAlign: 'center',
    padding: '40px',
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    border: '1px solid #e2e8f0',
    color: '#64748b',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
    gap: '20px',
  },
  card: {
    backgroundColor: '#ffffff',
    padding: '20px',
    borderRadius: '16px',
    border: '1px solid #e2e8f0',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '12px',
  },
  incidentId: {
    fontSize: '12px',
    fontWeight: '700',
    color: '#64748b',
  },
  priorityBadge: {
    fontSize: '11px',
    fontWeight: '700',
    padding: '2px 8px',
    borderRadius: '6px',
    textTransform: 'uppercase',
  },
  cardTitle: {
    fontSize: '16px',
    fontWeight: '700',
    color: '#0f172a',
    margin: '0 0 8px 0',
  },
  cardDesc: {
    fontSize: '14px',
    color: '#475569',
    marginBottom: '16px',
    lineHeight: '1.4',
  },
  metaInfo: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
    fontSize: '12px',
    color: '#64748b',
    paddingTop: '12px',
    borderTop: '1px solid #f1f5f9',
    marginBottom: '16px',
  },
  statusSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  statusLabel: {
    fontSize: '12px',
    fontWeight: '600',
    color: '#334155',
  },
  statusSelect: {
    width: '100%',
    padding: '8px 12px',
    fontSize: '13px',
    fontWeight: '700',
    borderRadius: '8px',
    border: '1.5px solid',
    outline: 'none',
    cursor: 'pointer',
  },
};