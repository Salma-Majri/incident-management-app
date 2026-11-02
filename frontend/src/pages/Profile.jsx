import { useState, useEffect } from 'react';
import API from '../api/api';
import './Profile.css';

const ROLE_CONFIG = {
  ADMIN: { label: 'Administrateur', accent: '#c084fc', soft: '#f3e8ff', ink: '#7e22ce' },
  TECHNICIAN: { label: 'Technicien', accent: '#fb923c', soft: '#ffedd5', ink: '#c2410c' },
  EMPLOYEE: { label: 'Employé', accent: '#34d399', soft: '#d1fae5', ink: '#047857' },
};

const formatDate = (value) => {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
};

const getStrength = (password) => {
  if (!password) return { score: 0, label: '' };
  let score = 0;
  if (password.length >= 8) score += 1;
  if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score += 1;
  if (/\d/.test(password)) score += 1;
  if (/[^A-Za-z0-9]/.test(password)) score += 1;
  const labels = ['Très faible', 'Faible', 'Moyen', 'Bon', 'Excellent'];
  return { score, label: labels[score] };
};

const EyeIcon = ({ off }) => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <circle cx="12" cy="12" r="3" />
    {off && <path d="M3 3l18 18" />}
  </svg>
);

const PasswordField = ({ label, name, value, onChange, show, onToggle, placeholder }) => (
  <div className="pf-field">
    <label className="pf-label" htmlFor={name}>
      {label}
    </label>
    <div className="pf-input-wrap">
      <input
        id={name}
        type={show ? 'text' : 'password'}
        name={name}
        value={value}
        onChange={onChange}
        required
        placeholder={placeholder}
        className="pf-input pf-input-has-action"
        autoComplete={name === 'oldPassword' ? 'current-password' : 'new-password'}
      />
      <button
        type="button"
        className="pf-eye"
        onClick={onToggle}
        aria-label={show ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
      >
        <EyeIcon off={show} />
      </button>
    </div>
  </div>
);

export default function Profile() {
  const [profile, setProfile] = useState({
    fullName: '',
    email: '',
    role: '',
    createdAt: '',
  });
  const [passwords, setPasswords] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [visible, setVisible] = useState({ old: false, next: false, confirm: false });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savingPass, setSavingPass] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [passSuccess, setPassSuccess] = useState('');
  const [passError, setPassError] = useState('');

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

  const handlePasswordChange = (e) => {
    setPasswords({ ...passwords, [e.target.name]: e.target.value });
  };

  const handleSubmitProfile = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      setSaving(true);
      const response = await API.put('/api/profile', {
        fullName: profile.fullName,
        email: profile.email,
      });
      const updatedName = response.data?.fullName || profile.fullName;
      localStorage.setItem('fullName', updatedName);
      window.dispatchEvent(new Event('storage-local-update'));
      setProfile((prev) => ({ ...prev, fullName: updatedName }));
      setSuccess('Profil mis à jour avec succès !');
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors de la mise à jour du profil');
    } finally {
      setSaving(false);
    }
  };

  const handleSubmitPassword = async (e) => {
    e.preventDefault();
    setPassError('');
    setPassSuccess('');

    if (passwords.newPassword !== passwords.confirmPassword) {
      setPassError('Les nouveaux mots de passe ne correspondent pas.');
      return;
    }

    try {
      setSavingPass(true);
      await API.put('/api/profile/password', {
        oldPassword: passwords.oldPassword,
        newPassword: passwords.newPassword,
      });
      
      setPassSuccess('Mot de passe modifié avec succès ! Redirection vers la connexion...');
      
      setTimeout(() => {
        localStorage.clear(); 
        window.location.href = '/login';
      }, 2000);

    } catch (err) {
      setPassError(
        err.response?.data?.message ||
          "Erreur lors du changement de mot de passe (vérifiez l'ancien mot de passe)"
      );
      setSavingPass(false); 
    }
  };

  const role = ROLE_CONFIG[profile.role] || {
    label: profile.role || 'Utilisateur',
    accent: '#94a3b8',
    soft: '#f1f5f9',
    ink: '#475569',
  };
  const initial = (profile.fullName || '?').trim().charAt(0).toUpperCase();
  const strength = getStrength(passwords.newPassword);
  const mismatch =
    passwords.confirmPassword && passwords.newPassword !== passwords.confirmPassword;

  if (loading) {
    return (
      <div className="pf-loading">
        <span className="pf-spinner" />
        Chargement du profil...
      </div>
    );
  }

  return (
    <div className="pf-page" style={{ '--accent': role.accent, '--accent-soft': role.soft, '--accent-ink': role.ink }}>
      <section className="pf-hero">
        <div className="pf-avatar">{initial}</div>
        <div className="pf-hero-text">
          <h1 className="pf-name">{profile.fullName || 'Utilisateur'}</h1>
          <span className="pf-email">{profile.email}</span>
          <div className="pf-hero-tags">
            <span className="pf-tag pf-tag-role">
              <i className="pf-dot" />
              {role.label}
            </span>
            <span className="pf-tag">Membre depuis le {formatDate(profile.createdAt)}</span>
          </div>
        </div>
      </section>

      <div className="pf-grid">
        <section className="pf-card">
          <header className="pf-card-head">
            <span className="pf-card-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
            </span>
            <div>
              <h2 className="pf-card-title">Informations personnelles</h2>
              <p className="pf-card-sub">Gérez vos informations de compte</p>
            </div>
          </header>

          {error && <div className="pf-alert pf-alert-error">{error}</div>}
          {success && <div className="pf-alert pf-alert-success">{success}</div>}

          <form onSubmit={handleSubmitProfile} className="pf-form">
            <div className="pf-field">
              <label className="pf-label" htmlFor="fullName">
                Nom complet
              </label>
              <input
                id="fullName"
                type="text"
                name="fullName"
                value={profile.fullName}
                onChange={handleChange}
                required
                className="pf-input"
              />
            </div>

            <div className="pf-field">
              <label className="pf-label" htmlFor="email">
                Adresse email
              </label>
              <input
                id="email"
                type="email"
                name="email"
                value={profile.email}
                onChange={handleChange}
                required
                className="pf-input"
              />
            </div>

            <div className="pf-field">
              <label className="pf-label" htmlFor="role">
                Rôle système
              </label>
              <input
                id="role"
                type="text"
                value={role.label}
                disabled
                className="pf-input pf-input-locked"
              />
              <span className="pf-hint">Le rôle ne peut pas être modifié manuellement.</span>
            </div>

            <button type="submit" className="pf-btn" disabled={saving}>
              {saving ? 'Enregistrement...' : 'Enregistrer les modifications'}
            </button>
          </form>
        </section>

        <section className="pf-card">
          <header className="pf-card-head">
            <span className="pf-card-icon pf-card-icon-violet">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <rect x="3" y="11" width="18" height="11" rx="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
            </span>
            <div>
              <h2 className="pf-card-title">Sécurité</h2>
              <p className="pf-card-sub">Modifiez votre mot de passe</p>
            </div>
          </header>

          {passError && <div className="pf-alert pf-alert-error">{passError}</div>}
          {passSuccess && <div className="pf-alert pf-alert-success">{passSuccess}</div>}

          <form onSubmit={handleSubmitPassword} className="pf-form">
            <PasswordField
              label="Ancien mot de passe"
              name="oldPassword"
              value={passwords.oldPassword}
              onChange={handlePasswordChange}
              show={visible.old}
              onToggle={() => setVisible((v) => ({ ...v, old: !v.old }))}
              placeholder="••••••••"
            />

            <PasswordField
              label="Nouveau mot de passe"
              name="newPassword"
              value={passwords.newPassword}
              onChange={handlePasswordChange}
              show={visible.next}
              onToggle={() => setVisible((v) => ({ ...v, next: !v.next }))}
              placeholder="••••••••"
            />

            {passwords.newPassword && (
              <div className="pf-strength" data-score={strength.score}>
                <div className="pf-strength-bars">
                  {[1, 2, 3, 4].map((n) => (
                    <span key={n} className={n <= strength.score ? 'is-on' : ''} />
                  ))}
                </div>
                <span className="pf-strength-label">{strength.label}</span>
              </div>
            )}

            <PasswordField
              label="Confirmer le nouveau mot de passe"
              name="confirmPassword"
              value={passwords.confirmPassword}
              onChange={handlePasswordChange}
              show={visible.confirm}
              onToggle={() => setVisible((v) => ({ ...v, confirm: !v.confirm }))}
              placeholder="••••••••"
            />
            {mismatch && <span className="pf-hint pf-hint-error">Les mots de passe ne correspondent pas.</span>}

            <button type="submit" className="pf-btn pf-btn-dark" disabled={savingPass}>
              {savingPass ? 'Mise à jour...' : 'Mettre à jour le mot de passe'}
            </button>
          </form>
        </section>
      </div>
    </div>
  );
}