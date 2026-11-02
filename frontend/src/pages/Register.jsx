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
          <h2 style={styles.title}>
            Followly<span style={styles.titleDot}>.</span>
          </h2>
          <p style={styles.subtitle}>Créez votre compte</p>
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
    width: '100%',
    minHeight: '100vh',
    backgroundColor: '#f1f5f9',
    fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
    padding: '20px',
    boxSizing: 'border-box',
  },
  card: {
    width: '100%',
    maxWidth: '520px',
    padding: '60px 56px',
    background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%)',
    borderRadius: '28px',
    boxShadow: '0 24px 48px -15px rgba(15, 23, 42, 0.6), inset 0 1px 0 rgba(255, 255, 255, 0.06)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    boxSizing: 'border-box',
  },
  header: {
    textAlign: 'center',
    marginBottom: '40px',
  },
  title: {
    fontSize: '38px',
    fontWeight: '800',
    color: '#f8fafc',
    marginBottom: '10px',
    letterSpacing: '-0.5px',
  },
  titleDot: {
    color: '#67e8f9',
  },
  subtitle: {
    fontSize: '16px',
    color: '#94a3b8',
  },
  errorBox: {
    backgroundColor: 'rgba(225, 29, 72, 0.15)',
    color: '#fca5a5',
    padding: '16px',
    borderRadius: '14px',
    fontSize: '15px',
    fontWeight: '500',
    marginBottom: '28px',
    border: '1px solid rgba(225, 29, 72, 0.3)',
    textAlign: 'center',
  },
  successBox: {
    backgroundColor: 'rgba(34, 197, 94, 0.15)',
    color: '#86efac',
    padding: '16px',
    borderRadius: '14px',
    fontSize: '15px',
    fontWeight: '500',
    marginBottom: '28px',
    border: '1px solid rgba(34, 197, 94, 0.3)',
    textAlign: 'center',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '28px',
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  label: {
    fontSize: '15px',
    fontWeight: '600',
    color: '#cbd5e1',
  },
  input: {
    width: '100%',
    padding: '16px 18px',
    fontSize: '17px',
    color: '#f8fafc',
    borderRadius: '14px',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    outline: 'none',
    transition: 'all 0.2s ease',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    boxSizing: 'border-box',
  },
  button: {
    width: '100%',
    padding: '18px',
    fontSize: '17px',
    fontWeight: '700',
    color: '#0f172a',
    background: 'linear-gradient(135deg, #67e8f9 0%, #a78bfa 100%)',
    border: 'none',
    borderRadius: '14px',
    cursor: 'pointer',
    transition: 'transform 0.1s ease, box-shadow 0.2s ease',
    boxShadow: '0 4px 15px rgba(103, 232, 249, 0.3)',
    marginTop: '12px',
  },
  footerText: {
    marginTop: '36px',
    textAlign: 'center',
    fontSize: '15px',
    color: '#94a3b8',
  },
  link: {
    color: '#67e8f9',
    fontWeight: '600',
    textDecoration: 'none',
  }
};