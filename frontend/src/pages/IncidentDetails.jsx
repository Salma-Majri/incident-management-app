import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../api/axios';
import './IncidentDetails.css';

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

export default function IncidentDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [incident, setIncident] = useState(null);
  const [history, setHistory] = useState([]);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  
  const [loading, setLoading] = useState(true);
  const [submittingComment, setSubmittingComment] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [error, setError] = useState('');

  const userRole = localStorage.getItem('role');

  useEffect(() => {
    fetchIncidentData();
  }, [id]);

  const fetchIncidentData = async () => {
    try {
      setLoading(true);
      const incRes = await API.get(`/api/incidents/${id}`);
      setIncident(incRes.data);

      try {
        const histRes = await API.get(`/api/incidents/${id}/history`);
        setHistory(histRes.data || []);
      } catch (e) {
        console.log("Historique non disponible", e);
      }

      try {
        const commRes = await API.get(`/api/incidents/${id}/comments`);
        setComments(commRes.data || []);
      } catch (e) {
        console.log("Commentaires non disponibles", e);
      }

    } catch (err) {
      setError(err.response?.data?.message || "Erreur lors du chargement de l'incident");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (newStatus) => {
    try {
      setUpdatingStatus(true);
      await API.put(`/api/incidents/${id}/status?status=${newStatus}`);
      fetchIncidentData();
    } catch (err) {
      alert(err.response?.data?.message || "Erreur lors de la mise à jour du statut");
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    try {
      setSubmittingComment(true);
      await API.post(`/api/incidents/${id}/comments`, { content: newComment });
      setNewComment('');
      fetchIncidentData();
    } catch (err) {
      alert(err.response?.data?.message || "Erreur lors de l'ajout du commentaire");
    } finally {
      setSubmittingComment(false);
    }
  };

  if (loading) {
    return (
      <div className="id-loading">
        <span className="id-spinner" />
        Chargement des détails de l'incident...
      </div>
    );
  }

  if (error || !incident) {
    return (
      <div className="id-error-page">
        <p>{error || "Incident introuvable."}</p>
        <button onClick={() => navigate(-1)} className="id-back-btn">Retour</button>
      </div>
    );
  }

  const status = STATUS_MAP[incident.status] || { label: incident.status, tone: 'slate' };
  const priority = PRIORITY_MAP[incident.priority] || { label: incident.priority, tone: 'slate' };

  return (
    <div className="id-page">
      <button onClick={() => navigate(-1)} className="id-back-button">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M19 12H5M12 19l-7-7 7-7" />
        </svg>
        <span>Retour</span>
      </button>

      <div className="id-header">
        <div className="id-header-top">
          <span className={`id-pill id-pill-${priority.tone}`}>Priorité : {priority.label}</span>
          <span className={`id-pill id-pill-dot id-pill-${status.tone}`}>{status.label}</span>
        </div>
        <h1 className="id-title">{incident.title}</h1>
        <p className="id-meta">
          Créé par <strong>{incident.createdBy?.fullName || 'N/A'}</strong> le {new Date(incident.createdAt).toLocaleDateString('fr-FR')}
        </p>
      </div>

      <div className="id-grid">
        <div className="id-main-col">
          <section className="id-card">
            <h2>Description de l'incident</h2>
            <p className="id-desc">{incident.description || "Aucune description fournie."}</p>
          </section>

          {(userRole === 'TECHNICIAN' || userRole === 'ADMIN') && (
            <section className="id-card">
              <h2>Mettre à jour le statut</h2>
              <div className="id-status-actions">
                {['IN_PROGRESS', 'RESOLVED', 'CLOSED'].map((st) => (
                  <button
                    key={st}
                    type="button"
                    disabled={updatingStatus || incident.status === st}
                    className={`id-status-btn ${incident.status === st ? 'is-current' : ''}`}
                    onClick={() => handleStatusChange(st)}
                  >
                    {STATUS_MAP[st]?.label || st}
                  </button>
                ))}
              </div>
            </section>
          )}

          <section className="id-card">
            <h2>Commentaires & Échanges</h2>
            
            <div className="id-comments-list">
              {comments.length === 0 ? (
                <p className="id-empty-text">Aucun commentaire pour le moment.</p>
              ) : (
                comments.map((comm) => (
                  <div key={comm.id} className="id-comment-item">
                    <div className="id-comment-header">
                      <strong>{comm.user?.fullName || 'Utilisateur'}</strong>
                      <small>{new Date(comm.createdAt).toLocaleString('fr-FR')}</small>
                    </div>
                    <p>{comm.content}</p>
                  </div>
                ))
              )}
            </div>

            <form onSubmit={handleAddComment} className="id-comment-form">
              <textarea
                rows="3"
                placeholder="Écrire un commentaire..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                required
                className="id-textarea"
              />
              <button type="submit" className="id-submit-btn" disabled={submittingComment}>
                {submittingComment ? 'Envoi...' : 'Envoyer le commentaire'}
              </button>
            </form>
          </section>
        </div>

        <div className="id-side-col">
          <section className="id-card">
            <h2>Informations</h2>
            <ul className="id-info-list">
              <li>
                <span>Technicien assigné :</span>
                <strong>{incident.assignedTo?.fullName || 'Non assigné'}</strong>
              </li>
              <li>
                <span>Dernière mise à jour :</span>
                <strong>{incident.updatedAt ? new Date(incident.updatedAt).toLocaleDateString('fr-FR') : '—'}</strong>
              </li>
            </ul>
          </section>

          <section className="id-card">
            <h2>Historique</h2>
            <div className="timeline">
              {(!history || history.length === 0) ? (
                <p className="emptyText">Aucun historique disponible.</p>
              ) : (
                history.map((hist, idx) => (
                  <div key={hist.id || idx} className="timelineItem">
                    <span className="dot" />
                    <div className="content">
                      <p className="description">
                        {hist.description || hist.action || 'Modification du statut'}
                      </p>
                      <small className="date">
                        {hist.createdAt
                          ? new Date(hist.createdAt).toLocaleString('fr-FR')
                          : 'Date inconnue'}
                      </small>
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}