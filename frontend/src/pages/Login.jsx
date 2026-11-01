import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import API from '../api/axios';

export default function Login() {
  const [credentials, setCredentials] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setCredentials({ ...credentials, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      const response = await API.post('/auth/login', credentials);
      const { token, role, fullName } = response.data;

      localStorage.setItem('token', token);
      localStorage.setItem('role', role);
      localStorage.setItem('fullName', fullName);

      if (role === 'ADMIN') navigate('/admin');
      else if (role === 'TECHNICIAN') navigate('/technician');
      else navigate('/dashboard');

    } catch (err) {
      setError(err.response?.data?.message || 'Email ou mot de passe incorrect');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.header}>
          <h2 style={styles.title}>Incident Manager</h2>
          <p style={styles.subtitle}>Connectez-vous à votre espace</p>
        </div>

        {error && <div style={styles.errorBox}>{error}</div>}

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Adresse Email</label>
            <input
              type="email"
              name="email"
              placeholder="nom@exemple.com"
              value={credentials.email}
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
              value={credentials.password}
              onChange={handleChange}
              required
              autoComplete="current-password"
              style={styles.input}
            />
          </div>

          <button 
            type="submit" 
            disabled={loading} 
            style={{
              ...styles.button,
              opacity: loading ? 0.8 : 1,
              cursor: loading ? 'wait' : 'pointer'
            }}
          >
            {loading ? 'Connexion...' : 'Se connecter'}
          </button>
        </form>

        <p style={styles.footerText}>
          Pas encore de compte ? <Link to="/register" style={styles.link}>S'inscrire</Link>
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
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
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