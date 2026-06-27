import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { getEventsForDate, getEventTypeLabel, getEventTypeColor } from '../services/calendarService';
import { requestNotificationPermission } from '../services/notificationService';

export default function SmartCalendar() {
  const { calendarEvents, plants } = useApp();
  const today = new Date();
  const [selectedDate, setSelectedDate] = useState(today.toISOString().split('T')[0]);
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());

  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDay = new Date(currentYear, currentMonth, 1).getDay();
  const monthNames = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];

  const days = [];
  for (let i = 0; i < (firstDay === 0 ? 6 : firstDay - 1); i += 1) days.push(null);
  for (let d = 1; d <= daysInMonth; d += 1) days.push(d);

  const getDateStr = (day) => {
    const m = String(currentMonth + 1).padStart(2, '0');
    const d = String(day).padStart(2, '0');
    return `${currentYear}-${m}-${d}`;
  };

  const dayEvents = getEventsForDate(calendarEvents, selectedDate);

  const prevMonth = () => {
    if (currentMonth === 0) { setCurrentMonth(11); setCurrentYear(currentYear - 1); }
    else setCurrentMonth(currentMonth - 1);
  };

  const nextMonth = () => {
    if (currentMonth === 11) { setCurrentMonth(0); setCurrentYear(currentYear + 1); }
    else setCurrentMonth(currentMonth + 1);
  };

  return (
    <div className="calendar-section">
      <div className="section-header">
        <h2>📅 Calendrier agricole intelligent</h2>
        <p>Arrosage, fertilisation, traitements et récoltes automatiques</p>
        <button type="button" className="btn-secondary btn-sm" onClick={requestNotificationPermission}>
          🔔 Activer les notifications
        </button>
      </div>

      {!plants.length ? (
        <p className="section-empty">Ajoutez des plantes pour générer votre calendrier.</p>
      ) : (
        <div className="calendar-layout">
          <div className="calendar-widget">
            <div className="calendar-header">
              <button type="button" onClick={prevMonth}>◀</button>
              <h3>{monthNames[currentMonth]} {currentYear}</h3>
              <button type="button" onClick={nextMonth}>▶</button>
            </div>
            <div className="calendar-weekdays">
              {['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'].map((d) => (
                <span key={d}>{d}</span>
              ))}
            </div>
            <div className="calendar-days">
              {days.map((day, i) => {
                if (!day) return <div key={`e-${i}`} className="cal-day empty" />;
                const dateStr = getDateStr(day);
                const hasEvents = calendarEvents.some((e) => e.date === dateStr);
                const isSelected = dateStr === selectedDate;
                const isToday = dateStr === today.toISOString().split('T')[0];
                return (
                  <button
                    key={day}
                    type="button"
                    className={`cal-day ${hasEvents ? 'has-events' : ''} ${isSelected ? 'selected' : ''} ${isToday ? 'today' : ''}`}
                    onClick={() => setSelectedDate(dateStr)}
                  >
                    {day}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="calendar-events">
            <h3>Événements du {new Date(selectedDate).toLocaleDateString('fr-FR')}</h3>
            {dayEvents.length === 0 ? (
              <p className="no-events">Aucun événement ce jour.</p>
            ) : (
              dayEvents.map((event) => (
                <div
                  key={event.id}
                  className="cal-event"
                  style={{ borderLeftColor: getEventTypeColor(event.type) }}
                >
                  <span className="event-type">{getEventTypeLabel(event.type)}</span>
                  <h4>{event.title}</h4>
                  <p>{event.description}</p>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      <div className="upcoming-events">
        <h3>Prochains événements</h3>
        <div className="events-list">
          {calendarEvents.slice(0, 8).map((event) => (
            <div key={event.id} className="upcoming-item">
              <span className="event-date">{new Date(event.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}</span>
              <span>{getEventTypeLabel(event.type)} — {event.plantName}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
