import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import API from '../api/api';

export default function Register() {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    
    try {
      await API.post('/auth/register', formData);
      setSuccess('Compte créé avec succès ! Redirection vers le login...');
      
      // Redirection mn be3d 2 secondes
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors de l’inscription');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.header}>
          <h2 style={styles.title}>Créer un compte</h2>
          <p style={styles.subtitle}>Rejoignez Incident Manager</p>
        </div>

        {error && <div style={styles.errorBox}>{error}</div>}
        {success && <div style={styles.successBox}>{success}</div>}
        
        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Nom complet</label>
            <input
              type="text"
              name="fullName"
              placeholder="Ex: Salma Majri"
              value={formData.fullName}
              onChange={handleChange}
              required
              autoComplete="name"
              style={styles.input}
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Adresse Email</label>
            <input
              type="email"
              name="email"
              placeholder="nom@exemple.com"
              value={formData.email}
              onChange={handleChange}
              required
              autoComplete="email"
              style={styles.input}
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Mot de passe</label>
            <input
              type="password"
              name="password"
              placeholder="••••••••"
              value={formData.password}
              onChange={handleChange}
              required
              autoComplete="new-password"
              style={styles.input}
            />
          </div>

          <button 
            type="submit" 
            disabled={loading || success !== ''} 
            style={{
              ...styles.button,
              opacity: (loading || success !== '') ? 0.7 : 1,
              cursor: (loading || success !== '') ? 'not-allowed' : 'pointer'
            }}
          >
            {loading ? 'Création en cours...' : "S'inscrire"}
          </button>
        </form>

        <p style={styles.footerText}>
          Déjà un compte ? <Link to="/login" style={styles.link}>Se connecter</Link>
        </p>
      </div>
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100vh',
    backgroundColor: '#f1f5f9',
    fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
    padding: '20px',
  },
  card: {
    width: '100%',
    maxWidth: '420px',
    padding: '48px 40px',
    backgroundColor: '#ffffff',
    borderRadius: '24px',
    boxShadow: '0 20px 40px -15px rgba(0, 0, 0, 0.1)',
    border: '1px solid #e2e8f0',
  },
  header: {
    textAlign: 'center',
    marginBottom: '32px',
  },
  title: {
    fontSize: '28px',
    fontWeight: '800',
    color: '#0f172a',
    marginBottom: '8px',
    letterSpacing: '-0.5px',
  },
  subtitle: {
    fontSize: '15px',
    color: '#64748b',
  },
  errorBox: {
    backgroundColor: '#fff1f2',
    color: '#e11d48',
    padding: '14px',
    borderRadius: '12px',
    fontSize: '14px',
    fontWeight: '500',
    marginBottom: '24px',
    border: '1px solid #fecdd3',
    textAlign: 'center',
  },
  successBox: {
    backgroundColor: '#f0fdf4',
    color: '#166534',
    padding: '14px',
    borderRadius: '12px',
    fontSize: '14px',
    fontWeight: '500',
    marginBottom: '24px',
    border: '1px solid #bbf7d0',
    textAlign: 'center',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  label: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#334155',
  },
  input: {
    width: '100%',
    padding: '14px 16px',
    fontSize: '16px',
    color: '#0f172a', 
    borderRadius: '12px',
    border: '2px solid #e2e8f0',
    outline: 'none',
    transition: 'all 0.2s ease',
    backgroundColor: '#f8fafc',
    boxSizing: 'border-box',
  },
  button: {
    width: '100%',
    padding: '16px',
    fontSize: '16px',
    fontWeight: '700',
    color: '#ffffff',
    background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
    border: 'none',
    borderRadius: '12px',
    cursor: 'pointer',
    transition: 'transform 0.1s ease, box-shadow 0.2s ease',
    boxShadow: '0 4px 12px rgba(37, 99, 235, 0.3)',
    marginTop: '8px',
  },
  footerText: {
    marginTop: '32px',
    textAlign: 'center',
    fontSize: '14px',
    color: '#64748b',
  },
  link: {
    color: '#2563eb',
    fontWeight: '600',
    textDecoration: 'none',
  }
};