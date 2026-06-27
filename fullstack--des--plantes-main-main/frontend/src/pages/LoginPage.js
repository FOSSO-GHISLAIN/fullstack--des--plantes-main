import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const AUTH_VIDEO = `${process.env.PUBLIC_URL}/VIDEO/Bean%20Time.mp4`;

export default function LoginPage() {
  const { login, loading } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await login(form);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="auth-page auth-split">
      <div className="auth-left">
        <video className="auth-side-video" autoPlay muted loop playsInline>
          <source src={AUTH_VIDEO} type="video/mp4" />
        </video>
        <div className="auth-left-overlay" />
        <div className="auth-left-decor" aria-hidden="true">
          <span className="decor-leaf decor-leaf-1">🌿</span>
          <span className="decor-leaf decor-leaf-2">🍃</span>
          <span className="decor-leaf decor-leaf-3">🌱</span>
          <span className="decor-circle decor-circle-1" />
          <span className="decor-circle decor-circle-2" />
        </div>
        <div className="auth-left-content">
          <span className="auth-logo">🌿</span>
          <h1>PlantTracker</h1>
          <p>Suivi intelligent de vos plantes avec IA</p>
          <div className="auth-features">
            <div>🔮 Prédictions IA</div>
            <div>🔬 Détection maladies</div>
            <div>📅 Calendrier intelligent</div>
          </div>
        </div>
      </div>

      <div className="auth-right">
        <div className="auth-right-decor" aria-hidden="true" />
        <div className="auth-container">
          <div className="auth-card">
            <h2>Connexion</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="email">Email</label>
                <input
                  id="email"
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="votre@email.com"
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="password">Mot de passe</label>
                <input
                  id="password"
                  type="password"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  placeholder="••••••••"
                  required
                />
              </div>
              {error && <p className="auth-error">{error}</p>}
              <button type="submit" className="btn-auth" disabled={loading}>
                {loading ? 'Connexion...' : 'Se connecter'}
              </button>
            </form>
            <p className="auth-switch">
              Pas encore de compte ? <Link to="/register">Créer un compte</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
