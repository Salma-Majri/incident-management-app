import { useNavigate } from 'react-router-dom';

export default function Unauthorized() {
  const navigate = useNavigate();

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '70vh',
      textAlign: 'center',
      padding: '20px',
      fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
      color: '#0f172a'
    }}>
      <div style={{
        fontSize: '72px',
        fontWeight: '800',
        color: '#ef4444',
        marginBottom: '10px',
        letterSpacing: '-2px'
      }}>
        403
      </div>
      <h2 style={{
        fontSize: '24px',
        fontWeight: '700',
        marginBottom: '8px'
      }}>
        Accès Interdit
      </h2>
      <p style={{
        fontSize: '14.5px',
        color: '#64748b',
        maxWidth: '400px',
        marginBottom: '24px',
        lineHeight: '1.5'
      }}>
        Désolé, vous n'avez pas les autorisations nécessaires pour accéder à cette page.
      </p>
      <button
        onClick={() => navigate(-1)}
        style={{
          padding: '10px 20px',
          fontSize: '14px',
          fontWeight: '600',
          color: '#ffffff',
          backgroundColor: '#0f172a',
          border: 'none',
          borderRadius: '12px',
          cursor: 'pointer',
          transition: 'background 0.2s ease'
        }}
      >
        Retourner en arrière
      </button>
    </div>
  );
}