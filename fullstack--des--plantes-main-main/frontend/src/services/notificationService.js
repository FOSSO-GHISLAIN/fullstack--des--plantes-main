import { addNotification } from './plantService';
import { generateCalendarEvents, getUpcomingEvents } from './calendarService';

export function requestNotificationPermission() {
  if ('Notification' in window && Notification.permission === 'default') {
    Notification.requestPermission();
  }
}

export function showBrowserNotification(title, body) {
  if ('Notification' in window && Notification.permission === 'granted') {
    new Notification(title, { body, icon: '/favicon.ico' });
  }
}

export function syncNotificationsFromCalendar(userId, plants) {
  const events = generateCalendarEvents(plants);
  const upcoming = getUpcomingEvents(events, 3);
  const today = new Date().toISOString().split('T')[0];

  upcoming.forEach((event) => {
    if (event.date === today) {
      addNotification(userId, {
        type: event.type,
        title: event.title,
        message: event.description,
        plantId: event.plantId,
      });
      showBrowserNotification(event.title, event.description);
    }
  });
}

export function getNotificationIcon(type) {
  const icons = {
    watering: '💧',
    fertilizing: '🌿',
    treatment: '🛡️',
    harvest: '🌾',
    flowering: '🌸',
    disease: '⚠️',
    info: 'ℹ️',
  };
  return icons[type] || '🔔';
}
