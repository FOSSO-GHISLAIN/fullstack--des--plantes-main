import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import * as plantService from '../services/plantService';
import { getToken } from '../services/authService';
import { generateCalendarEvents } from '../services/calendarService';
import { syncNotificationsFromCalendar } from '../services/notificationService';
import * as sickPlantApi from '../services/sickPlantApiService';

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const { user } = useAuth();
  const [plants, setPlants] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [activeSection, setActiveSection] = useState('dashboard');
  const [selectedPlantId, setSelectedPlantId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [sickPlants, setSickPlants] = useState([]);
  const [sickPlantsLoading, setSickPlantsLoading] = useState(false);
  const [sickPlantsError, setSickPlantsError] = useState(null);
  const [apiOnline, setApiOnline] = useState(false);

  useEffect(() => {
    sickPlantApi.checkApiHealth().then(({ online }) => {
      setApiOnline(online);
    });
  }, []);

  const refreshSickPlants = useCallback(async () => {
    const token = getToken();
    if (!user || !token) return;

    setSickPlantsLoading(true);
    setSickPlantsError(null);
    try {
      const response = await sickPlantApi.getSickPlants(token);
      setSickPlants(response.data || []);
    } catch (err) {
      setSickPlantsError(err.message);
    } finally {
      setSickPlantsLoading(false);
    }
  }, [user]);

  const refresh = useCallback(async () => {
    const token = getToken();
    if (!user || !token) return;

    setLoading(true);
    setError(null);
    try {
      await plantService.applyAutomaticDailyGrowth();
      // Vérifier les rappels de traitement des plantes malades
      await sickPlantApi.checkTreatmentReminders(token).catch(() => {});
      const [plantsData, notificationsData] = await Promise.all([
        plantService.getPlants(),
        plantService.getNotifications(),
      ]);
      setPlants(plantsData);
      setNotifications(notificationsData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    refresh();
    refreshSickPlants();
  }, [refresh, refreshSickPlants]);

  useEffect(() => {
    if (!user || plants.length === 0) return;

    syncNotificationsFromCalendar(plants)
      .then(() => plantService.getNotifications())
      .then(setNotifications)
      .catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, plants.length]);

  const addPlant = useCallback(
    async (data) => {
      if (!user) return null;
      try {
        const plant = await plantService.addPlant(data);
        await refresh();
        return plant;
      } catch (err) {
        setError(err.message);
        throw err;
      }
    },
    [user, refresh]
  );

  const updatePlant = useCallback(
    async (plantId, updates) => {
      if (!user) return;
      try {
        await plantService.updatePlant(plantId, updates);
        await refresh();
      } catch (err) {
        setError(err.message);
        throw err;
      }
    },
    [user, refresh]
  );

  const addGrowthEntry = useCallback(
    async (plantId, entry) => {
      if (!user) return;
      try {
        await plantService.addGrowthEntry(plantId, entry);
        await refresh();
      } catch (err) {
        setError(err.message);
        throw err;
      }
    },
    [user, refresh]
  );

  const deletePlant = useCallback(
    async (plantId) => {
      if (!user) return;
      try {
        await plantService.deletePlant(plantId);
        await refresh();
      } catch (err) {
        setError(err.message);
        throw err;
      }
    },
    [user, refresh]
  );

  const markRead = useCallback(
    async (notifId) => {
      if (!user) return;
      try {
        await plantService.markNotificationRead(notifId);
        await refresh();
      } catch (err) {
        setError(err.message);
        throw err;
      }
    },
    [user, refresh]
  );

  const addSickPlant = useCallback(
    async (data) => {
      const token = getToken();
      if (!user || !token) throw new Error('Session expirée, veuillez vous reconnecter.');

      setSickPlantsError(null);
      try {
        const response = await sickPlantApi.createSickPlant(data, token);
        setSickPlants((prev) => [response.data, ...prev]);
        return response.data;
      } catch (err) {
        setSickPlantsError(err.message);
        throw err;
      }
    },
    [user]
  );

  const editSickPlant = useCallback(
    async (id, data) => {
      const token = getToken();
      if (!user || !token) throw new Error('Session expirée, veuillez vous reconnecter.');

      setSickPlantsError(null);
      try {
        const response = await sickPlantApi.updateSickPlant(id, data, token);
        setSickPlants((prev) =>
          prev.map((sp) => (sp._id === id ? response.data : sp))
        );
        return response.data;
      } catch (err) {
        setSickPlantsError(err.message);
        throw err;
      }
    },
    [user]
  );

  const removeSickPlant = useCallback(
    async (id) => {
      const token = getToken();
      if (!user || !token) throw new Error('Session expirée, veuillez vous reconnecter.');

      setSickPlantsError(null);
      try {
        await sickPlantApi.deleteSickPlant(id, token);
        setSickPlants((prev) => prev.filter((sp) => sp._id !== id));
      } catch (err) {
        setSickPlantsError(err.message);
        throw err;
      }
    },
    [user]
  );

  const calendarEvents = user ? generateCalendarEvents(plants) : [];
  const selectedPlant = plants.find((p) => p.id === selectedPlantId) || null;
  const stats = plantService.getPlantStats(plants);
  const unreadCount = notifications.filter((n) => !n.read).length;

  const sickPlantStats = {
    total: sickPlants.length,
    grave: sickPlants.filter((sp) => sp.severity === 'grave').length,
    guéri: sickPlants.filter((sp) => sp.treatmentStatus === 'guéri').length,
    en_cours: sickPlants.filter((sp) => sp.treatmentStatus === 'en_cours').length,
  };

  return (
    <AppContext.Provider
      value={{
        plants,
        notifications,
        stats,
        calendarEvents,
        selectedPlant,
        selectedPlantId,
        setSelectedPlantId,
        activeSection,
        setActiveSection,
        addPlant,
        updatePlant,
        addGrowthEntry,
        deletePlant,
        markRead,
        refresh,
        unreadCount,
        loading,
        error,
        sickPlants,
        sickPlantsLoading,
        sickPlantsError,
        sickPlantStats,
        apiOnline,
        addSickPlant,
        editSickPlant,
        removeSickPlant,
        refreshSickPlants,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
