import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import API from '../api/api';

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
          <h2 style={styles.title}>
            Followly<span style={styles.titleDot}>.</span>
          </h2>
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