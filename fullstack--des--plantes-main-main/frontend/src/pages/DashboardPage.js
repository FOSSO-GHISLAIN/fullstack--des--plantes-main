import React from 'react';
import { Sprout, TrendingUp, Star, AlertTriangle, Bell } from 'lucide-react';
import Layout from '../components/Layout';
import { useApp } from '../context/AppContext';
import GrowthDashboard from '../components/GrowthDashboard';
import GrowthPrediction from '../components/GrowthPrediction';
import DiseaseDetector from '../components/DiseaseDetector';
import ChatAssistant from '../components/ChatAssistant';
import SmartCalendar from '../components/SmartCalendar';
import PlantLibraryView from '../components/PlantLibraryView';
import NotificationPanel from '../components/NotificationPanel';
import PlantManager from '../components/PlantManager';

function OverviewStats({ stats, unreadCount }) {
  const cards = [
    { Icon: Sprout,        label: 'Total plantes', value: stats.total,   color: '#2e7d32' },
    { Icon: TrendingUp,    label: 'En croissance', value: stats.growing, color: '#43a047' },
    { Icon: Star,          label: 'Matures',       value: stats.mature,  color: '#1b5e20' },
    { Icon: AlertTriangle, label: 'Alertes',        value: stats.sick,    color: '#f57c00' },
    { Icon: Bell,          label: 'Notifications', value: unreadCount,   color: '#1976d2' },
  ];

  return (
    <div className="stats-row">
      {cards.map((c) => (
        <div key={c.label} className="stat-card-modern" style={{ '--accent': c.color }}>
          <span className="stat-icon" style={{ color: c.color }}>
            <c.Icon size={28} strokeWidth={1.8} />
          </span>
          <div>
            <p className="stat-value">{c.value}</p>
            <p className="stat-label">{c.label}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function DashboardPage() {
  const { activeSection, plants, stats, unreadCount } = useApp();

  const renderSection = () => {
    switch (activeSection) {
      case 'plants': return <PlantManager />;
      case 'predictions': return <GrowthPrediction />;
      case 'diseases': return <DiseaseDetector />;
      case 'assistant': return <ChatAssistant />;
      case 'calendar': return <SmartCalendar />;
      case 'library': return <PlantLibraryView />;
      case 'notifications': return <NotificationPanel />;
      default:
        return (
          <>
            <div className="page-header">
              <h1>Bienvenue sur PlantTracker 🌿</h1>
              <p>Votre assistant intelligent pour le suivi de croissance des plantes</p>
            </div>
            <OverviewStats stats={stats} unreadCount={unreadCount} />
            <GrowthDashboard plants={plants} />
          </>
        );
    }
  };

  return (
    <Layout>
      <div className={`page-content section-bg-${activeSection}`}>{renderSection()}</div>
    </Layout>
  );
}
