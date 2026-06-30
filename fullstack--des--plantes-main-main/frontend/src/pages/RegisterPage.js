import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const AUTH_VIDEO = `${process.env.PUBLIC_URL}/VIDEO/Bean%20Time.mp4`;

export default function RegisterPage() {
  const { register, loading } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await register(form);
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
          <p>Rejoignez la communauté des jardiniers intelligents</p>
        </div>
      </div>

      <div className="auth-right">
        <div className="auth-right-decor" aria-hidden="true" />
        <div className="auth-container">
          <div className="auth-card">
            <h2>Créer un compte</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="name">Nom complet</label>
                <input
                  id="name"
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Jean Dupont"
                  required
                />
              </div>
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
                  placeholder="Min. 8 car., maj., chiffre, spécial"
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="confirm">Confirmer le mot de passe</label>
                <input
                  id="confirm"
                  type="password"
                  value={form.confirmPassword}
                  onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                  placeholder="••••••••"
                  required
                />
              </div>
              {error && <p className="auth-error">{error}</p>}
              <button type="submit" className="btn-auth" disabled={loading}>
                {loading ? 'Création...' : "S'inscrire"}
              </button>
            </form>
            <p className="auth-switch">
              Déjà un compte ? <Link to="/">Se connecter</Link>
            </p>
            <p className="auth-note">🗄️ Vos données sont stockées dans MongoDB via le backend.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
