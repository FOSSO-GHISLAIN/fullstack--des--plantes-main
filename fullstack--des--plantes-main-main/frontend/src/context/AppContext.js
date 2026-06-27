import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import * as plantService from '../services/plantService';
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

  // ─── État des plantes malades ─────────────────────────────────────────────
  const [sickPlants, setSickPlants] = useState([]);
  const [sickPlantsLoading, setSickPlantsLoading] = useState(false);
  const [sickPlantsError, setSickPlantsError] = useState(null);
  const [apiOnline, setApiOnline] = useState(false);

  // ─── Récupérer le token JWT depuis le localStorage ────────────────────────
  const getToken = useCallback(() => {
    try {
      const session = JSON.parse(
        localStorage.getItem('plantes_app_session') || 'null'
      );
      return session?.token || null;
    } catch {
      return null;
    }
  }, []);

  // ─── Vérifier la disponibilité de l'API ──────────────────────────────────
  useEffect(() => {
    sickPlantApi.checkApiHealth().then(({ online }) => {
      setApiOnline(online);
    });
  }, []);

  // ─── Chargement des plantes malades depuis le backend ────────────────────
  const refreshSickPlants = useCallback(async () => {
    if (!user) return;
    const token = getToken();
    if (!token) {
      // Pas de token JWT → mode localStorage uniquement
      return;
    }
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
  }, [user, getToken]);

  // ─── Plantes saines — refresh ─────────────────────────────────────────────
  const refresh = useCallback(() => {
    if (!user) return;
    plantService.applyAutomaticDailyGrowth(user.id);
    setPlants(plantService.getPlants(user.id));
    setNotifications(plantService.getNotifications(user.id));
  }, [user]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  useEffect(() => {
    if (!user) return;
    const interval = setInterval(() => {
      plantService.applyAutomaticDailyGrowth(user.id);
      setPlants(plantService.getPlants(user.id));
      setNotifications(plantService.getNotifications(user.id));
    }, 60 * 60 * 1000);
    return () => clearInterval(interval);
  }, [user]);

  useEffect(() => {
    if (!user || plants.length === 0) return;
    syncNotificationsFromCalendar(user.id, plants);
    setNotifications(plantService.getNotifications(user.id));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, plants.length]);

  // Charger les plantes malades au démarrage
  useEffect(() => {
    if (user) {
      refreshSickPlants();
    }
  }, [user, refreshSickPlants]);

  // ─── Actions sur les plantes saines ──────────────────────────────────────
  const addPlant = useCallback(
    (data) => {
      if (!user) return null;
      const plant = plantService.addPlant(user.id, data);
      refresh();
      return plant;
    },
    [user, refresh]
  );

  const updatePlant = useCallback(
    (plantId, updates) => {
      if (!user) return;
      plantService.updatePlant(user.id, plantId, updates);
      refresh();
    },
    [user, refresh]
  );

  const addGrowthEntry = useCallback(
    (plantId, entry) => {
      if (!user) return;
      plantService.addGrowthEntry(user.id, plantId, entry);
      refresh();
    },
    [user, refresh]
  );

  const deletePlant = useCallback(
    (plantId) => {
      if (!user) return;
      plantService.deletePlant(user.id, plantId);
      refresh();
    },
    [user, refresh]
  );

  const markRead = useCallback(
    (notifId) => {
      if (!user) return;
      plantService.markNotificationRead(user.id, notifId);
      refresh();
    },
    [user, refresh]
  );

  // ─── Actions sur les plantes malades ─────────────────────────────────────

  /**
   * Ajouter une plante malade (via API backend → MongoDB)
   */
  const addSickPlant = useCallback(
    async (data) => {
      if (!user) return null;
      setSickPlantsError(null);

      const token = getToken();
      if (!token) {
        // Mode dégradé : stockage local si pas de token
        const localEntry = {
          _id: `local_${Date.now()}`,
          ...data,
          userId: user.id,
          createdAt: new Date().toISOString(),
          treatmentStatus: data.treatmentStatus || 'non_traité',
          severity: data.severity || 'modérée',
          isLocal: true,
        };
        setSickPlants((prev) => [localEntry, ...prev]);
        return localEntry;
      }

      try {
        const response = await sickPlantApi.createSickPlant(data, token);
        setSickPlants((prev) => [response.data, ...prev]);
        return response.data;
      } catch (err) {
        setSickPlantsError(err.message);
        throw err;
      }
    },
    [user, getToken]
  );

  /**
   * Mettre à jour une fiche plante malade
   */
  const editSickPlant = useCallback(
    async (id, data) => {
      if (!user) return;
      setSickPlantsError(null);

      const token = getToken();
      if (!token) {
        // Mode dégradé : mise à jour locale
        setSickPlants((prev) =>
          prev.map((sp) => (sp._id === id ? { ...sp, ...data } : sp))
        );
        return;
      }

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
    [user, getToken]
  );

  /**
   * Supprimer une fiche plante malade
   */
  const removeSickPlant = useCallback(
    async (id) => {
      if (!user) return;
      setSickPlantsError(null);

      const token = getToken();
      if (!token) {
        setSickPlants((prev) => prev.filter((sp) => sp._id !== id));
        return;
      }

      try {
        await sickPlantApi.deleteSickPlant(id, token);
        setSickPlants((prev) => prev.filter((sp) => sp._id !== id));
      } catch (err) {
        setSickPlantsError(err.message);
        throw err;
      }
    },
    [user, getToken]
  );

  // ─── Computed values ──────────────────────────────────────────────────────
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
        // Plantes saines
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
        // Plantes malades
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
