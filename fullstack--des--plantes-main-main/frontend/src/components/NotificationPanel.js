import React from 'react';
import { useApp } from '../context/AppContext';
import { getNotificationIcon } from '../services/notificationService';

export default function NotificationPanel() {
  const { notifications, markRead, unreadCount } = useApp();

  return (
    <div className="notifications-section">
      <div className="section-header">
        <h2>🔔 Notifications</h2>
        <p>{unreadCount} non lue(s) — Rappels d&apos;arrosage, fertilisation et récolte</p>
      </div>

      {notifications.length === 0 ? (
        <div className="section-empty">
          <p>Aucune notification pour le moment.</p>
          <p className="hint">Les rappels apparaîtront automatiquement selon votre calendrier agricole.</p>
        </div>
      ) : (
        <div className="notifications-list">
          {notifications.map((notif) => (
            <div
              key={notif.id}
              className={`notification-item ${notif.read ? 'read' : 'unread'}`}
              onClick={() => !notif.read && markRead(notif.id)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && !notif.read && markRead(notif.id)}
            >
              <span className="notif-icon">{getNotificationIcon(notif.type)}</span>
              <div className="notif-content">
                <h4>{notif.title}</h4>
                <p>{notif.message}</p>
                <small>{new Date(notif.createdAt).toLocaleString('fr-FR')}</small>
              </div>
              {!notif.read && <span className="unread-dot" />}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
