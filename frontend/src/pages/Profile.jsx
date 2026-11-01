import { useState, useEffect } from 'react';
import API from '../api/axios';

export default function Profile() {
  const [profile, setProfile] = useState({
    fullName: '',
    email: '',
    role: '',
    createdAt: ''
  });
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await API.get('/api/profile');
      setProfile(response.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors de la récupération du profil');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      const response = await API.put('/api/profile', {
        fullName: profile.fullName,
        email: profile.email
      });
      const updatedName = response.data?.fullName || profile.fullName;
      localStorage.setItem('fullName', updatedName);
      window.dispatchEvent(new Event('storage-local-update'));
      setProfile((prev) => ({ ...prev, fullName: updatedName }));
      setSuccess('Profil mis à jour avec succès !');
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors de la mise à jour');
    }
  };

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '40px' }}>Chargement du profil...</div>;
  }

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.title}>Mon Profil</h2>
        <p style={styles.subtitle}>Gérez vos informations personnelles</p>

        {error && <div style={styles.errorBox}>{error}</div>}
        {success && <div style={styles.successBox}>{success}</div>}

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Nom complet</label>
            <input
              type="text"
              name="fullName"
              value={profile.fullName}
              onChange={handleChange}
              required
              style={styles.input}
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Adresse Email</label>
            <input
              type="email"
              name="email"
              value={profile.email}
              onChange={handleChange}
              required
              style={styles.input}
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Rôle système</label>
            <input
              type="text"
              value={profile.role}
              disabled
              style={{ ...styles.input, backgroundColor: '#f1f5f9', cursor: 'not-allowed', color: '#64748b' }}
            />
            <span style={styles.hint}>Le rôle ne peut pas être modifié manuellement.</span>
          </div>

          <button type="submit" style={styles.button}>
            Enregistrer les modifications
          </button>
        </form>
      </div>
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    justifyContent: 'center',
    padding: '40px 20px',
    fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
  },
  card: {
    width: '100%',
    maxWidth: '500px',
    padding: '30px',
    backgroundColor: '#ffffff',
    borderRadius: '16px',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -2px rgba(0, 0, 0, 0.05)',
    border: '1px solid #e2e8f0',
  },
  title: {
    fontSize: '22px',
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: '6px',
  },
  subtitle: {
    fontSize: '14px',
    color: '#64748b',
    marginBottom: '24px',
  },
  errorBox: {
    backgroundColor: '#fef2f2',
    color: '#991b1b',
    padding: '10px 14px',
    borderRadius: '8px',
    fontSize: '14px',
    marginBottom: '20px',
    border: '1px solid #fecaca',
  },
  successBox: {
    backgroundColor: '#f0fdf4',
    color: '#166534',
    padding: '10px 14px',
    borderRadius: '8px',
    fontSize: '14px',
    marginBottom: '20px',
    border: '1px solid #bbf7d0',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '18px',
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  label: {
    fontSize: '13px',
    fontWeight: '600',
    color: '#334155',
  },
  input: {
    width: '100%',
    padding: '10px 14px',
    fontSize: '14px',
    borderRadius: '8px',
    border: '1px solid #cbd5e1',
    outline: 'none',
    boxSizing: 'border-box',
    transition: 'border-color 0.2s',
  },
  hint: {
    fontSize: '11px',
    color: '#94a3b8',
    marginTop: '2px',
  },
  button: {
    width: '100%',
    padding: '11px',
    fontSize: '15px',
    fontWeight: '600',
    color: '#ffffff',
    backgroundColor: '#0284c7',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    marginTop: '10px',
    transition: 'background-color 0.2s',
  },
};