import React from 'react';
import {
  LayoutDashboard,
  Leaf,
  Sparkles,
  Bug,
  Bot,
  Calendar,
  BookOpen,
  Bell,
  LogOut,
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';

const NAV_ITEMS = [
  { id: 'dashboard',     Icon: LayoutDashboard, label: 'Tableau de bord' },
  { id: 'plants',        Icon: Leaf,             label: 'Mes Plantes' },
  { id: 'predictions',   Icon: Sparkles,         label: 'Prédictions IA' },
  { id: 'diseases',      Icon: Bug,              label: 'Détection Maladies' },
  { id: 'assistant',     Icon: Bot,              label: 'Assistant IA' },
  { id: 'calendar',      Icon: Calendar,         label: 'Calendrier' },
  { id: 'library',       Icon: BookOpen,         label: 'Bibliothèque' },
  { id: 'notifications', Icon: Bell,             label: 'Notifications' },
];

export default function Layout({ children }) {
  const { user, logout } = useAuth();
  const { activeSection, setActiveSection, unreadCount } = useApp();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = React.useState(true);
  const [mobileOpen, setMobileOpen] = React.useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleNavClick = (id) => {
    setActiveSection(id);
    setMobileOpen(false); // ferme la sidebar mobile après sélection
  };

  return (
    <div className="app-layout">

      {/* Bouton hamburger — visible uniquement sur mobile */}
      <button
        type="button"
        className="mobile-hamburger"
        onClick={() => setMobileOpen(true)}
        aria-label="Ouvrir le menu"
      >
        <Menu size={22} />
      </button>

      {/* Overlay sombre — ferme la sidebar mobile en cliquant à côté */}
      {mobileOpen && (
        <div className="sidebar-overlay" onClick={() => setMobileOpen(false)} />
      )}

      <aside className={`sidebar ${sidebarOpen ? 'open' : 'collapsed'} ${mobileOpen ? 'mobile-visible' : ''}`}>
        {/* Bouton fermer — visible uniquement sur mobile dans la sidebar */}
        <button
          type="button"
          className="mobile-close-btn"
          onClick={() => setMobileOpen(false)}
          aria-label="Fermer le menu"
        >
          <X size={20} />
        </button>

        <div className="sidebar-brand">
          <span className="brand-icon">🌿</span>
          {sidebarOpen && <span className="brand-text">PlantTracker</span>}
        </div>

        <nav className="sidebar-nav">
          {NAV_ITEMS.map(({ id, Icon, label }) => (
            <button
              key={id}
              type="button"
              className={`nav-item ${activeSection === id ? 'active' : ''}`}
              data-nav={id}
              onClick={() => handleNavClick(id)}
            >
              <span className="nav-icon">
                <Icon size={20} strokeWidth={1.8} />
              </span>
              {sidebarOpen && (
                <span className="nav-label">
                  {label}
                  {id === 'notifications' && unreadCount > 0 && (
                    <span className="badge">{unreadCount}</span>
                  )}
                </span>
              )}
            </button>
          ))}
        </nav>

        <div className="sidebar-footer">
          {sidebarOpen && (
            <div className="user-info">
              <span className="user-avatar">{user?.name?.[0]?.toUpperCase() || 'U'}</span>
              <div>
                <p className="user-name">{user?.name}</p>
                <p className="user-email">{user?.email}</p>
              </div>
            </div>
          )}
          <button type="button" className="btn-logout" onClick={handleLogout}>
            <LogOut size={16} />
            {sidebarOpen && <span>Déconnexion</span>}
          </button>
        </div>

        {/* Bouton toggle collapse — visible uniquement sur desktop */}
        <button
          type="button"
          className="sidebar-toggle"
          onClick={() => setSidebarOpen(!sidebarOpen)}
          aria-label="Toggle sidebar"
        >
          {sidebarOpen ? <ChevronLeft size={14} /> : <ChevronRight size={14} />}
        </button>
      </aside>

      <main className={`main-content ${sidebarOpen ? '' : 'sidebar-collapsed'}`}>
        {children}
      </main>
    </div>
  );
}
