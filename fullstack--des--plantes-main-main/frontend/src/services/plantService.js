import { getItem, setItem, getUserKey } from './storage';
import { findPlantInLibrary } from '../data/plantLibrary';

function plantsKey(userId) {
  return getUserKey(userId, 'plants');
}

function notificationsKey(userId) {
  return getUserKey(userId, 'notifications');
}

export function getPlants(userId) {
  return getItem(plantsKey(userId), []);
}

export function savePlants(userId, plants) {
  setItem(plantsKey(userId), plants);
}

export function addPlant(userId, plantData) {
  const plants = getPlants(userId);
  const lib = findPlantInLibrary(plantData.name);

  const plant = {
    id: `plant_${Date.now()}`,
    name: plantData.name,
    type: plantData.type || lib?.type || 'Autre',
    species: plantData.species || plantData.name,
    plantedDate: plantData.plantedDate || new Date().toISOString().split('T')[0],
    soilType: plantData.soilType || lib?.soilType || 'Universel',
    waterNeeds: plantData.waterNeeds || lib?.waterNeeds || 'Modéré',
    height: Number(plantData.height) || 0,
    leafCount: Number(plantData.leafCount) || 0,
    temperature: Number(plantData.temperature) || 22,
    humidity: Number(plantData.humidity) || 60,
    status: 'healthy',
    growthHistory: [
      {
        date: new Date().toISOString().split('T')[0],
        height: Number(plantData.height) || 0,
        leafCount: Number(plantData.leafCount) || 0,
        temperature: Number(plantData.temperature) || 22,
        humidity: Number(plantData.humidity) || 60,
      },
    ],
    createdAt: new Date().toISOString(),
  };

  plants.push(plant);
  savePlants(userId, plants);
  return plant;
}

export function updatePlant(userId, plantId, updates) {
  const plants = getPlants(userId);
  const index = plants.findIndex((p) => p.id === plantId);
  if (index === -1) throw new Error('Plante introuvable.');

  const updated = { ...plants[index], ...updates };
  plants[index] = updated;
  savePlants(userId, plants);
  return updated;
}

export function addGrowthEntry(userId, plantId, entry) {
  const plants = getPlants(userId);
  const index = plants.findIndex((p) => p.id === plantId);
  if (index === -1) throw new Error('Plante introuvable.');

  const record = {
    date: entry.date || new Date().toISOString().split('T')[0],
    height: Number(entry.height),
    leafCount: Number(entry.leafCount),
    temperature: Number(entry.temperature),
    humidity: Number(entry.humidity),
  };

  plants[index].height = record.height;
  plants[index].leafCount = record.leafCount;
  plants[index].temperature = record.temperature;
  plants[index].humidity = record.humidity;
  plants[index].growthHistory = [...(plants[index].growthHistory || []), record];
  savePlants(userId, plants);
  return plants[index];
}

export function deletePlant(userId, plantId) {
  const plants = getPlants(userId).filter((p) => p.id !== plantId);
  savePlants(userId, plants);
}

export function getNotifications(userId) {
  return getItem(notificationsKey(userId), []);
}

export function addNotification(userId, notification) {
  const list = getNotifications(userId);
  const item = {
    id: `notif_${Date.now()}`,
    read: false,
    createdAt: new Date().toISOString(),
    ...notification,
  };
  list.unshift(item);
  setItem(notificationsKey(userId), list.slice(0, 50));
  return item;
}

export function markNotificationRead(userId, notifId) {
  const list = getNotifications(userId).map((n) =>
    n.id === notifId ? { ...n, read: true } : n
  );
  setItem(notificationsKey(userId), list);
}

export function getDaysSincePlanting(plantedDate) {
  const planted = new Date(plantedDate);
  const now = new Date();
  return Math.max(0, Math.floor((now - planted) / (1000 * 60 * 60 * 24)));
}

export function getPlantStats(plants) {
  const growing = plants.filter((p) => p.height < 50).length;
  const mature = plants.filter((p) => p.height >= 50).length;
  const sick = plants.filter((p) => p.status === 'sick' || p.status === 'warning').length;
  return { total: plants.length, growing, mature, sick };
}

function getDailyGrowthRate(plant) {
  const lib = findPlantInLibrary(plant.name);
  if (lib?.maxHeight && lib?.harvestDays) {
    return Math.max(0.1, +(lib.maxHeight / lib.harvestDays).toFixed(2));
  }
  return 0.5;
}

function parseDateOnly(value) {
  const d = new Date(value);
  d.setHours(0, 0, 0, 0);
  return d;
}

function daysBetween(fromDate, toDate) {
  const from = parseDateOnly(fromDate);
  const to = parseDateOnly(toDate);
  return Math.max(0, Math.floor((to - from) / (1000 * 60 * 60 * 24)));
}

export function applyAutomaticDailyGrowth(userId) {
  const plants = getPlants(userId);
  if (!plants.length) return { changed: false, updatedPlants: [] };

  const today = parseDateOnly(new Date());
  let changed = false;
  const updatedPlants = [];

  const updated = plants.map((plant) => {
    const lib = findPlantInLibrary(plant.name);
    const maxHeight = lib?.maxHeight || 100;
    const dailyGrowth = getDailyGrowthRate(plant);
    const history = [...(plant.growthHistory || [])];

    const lastEntry = history[history.length - 1];
    const lastDate = parseDateOnly(lastEntry?.date || plant.plantedDate || plant.createdAt);
    const daysPassed = daysBetween(lastDate, today);

    if (daysPassed < 1 || plant.height >= maxHeight) return plant;

    changed = true;
    let newHeight = plant.height;
    let newLeafCount = plant.leafCount || 0;
    const newHistory = [...history];

    for (let d = 1; d <= daysPassed; d += 1) {
      const entryDate = new Date(lastDate);
      entryDate.setDate(entryDate.getDate() + d);
      const dateStr = entryDate.toISOString().split('T')[0];

      newHeight = Math.min(maxHeight, +(newHeight + dailyGrowth).toFixed(2));
      if (d % 3 === 0) newLeafCount += 1;

      newHistory.push({
        date: dateStr,
        height: newHeight,
        leafCount: newLeafCount,
        temperature: plant.temperature,
        humidity: plant.humidity,
        auto: true,
      });
    }

    const updatedPlant = {
      ...plant,
      height: newHeight,
      leafCount: newLeafCount,
      growthHistory: newHistory,
      lastAutoGrowth: today.toISOString().split('T')[0],
    };

    updatedPlants.push({ name: plant.name, addedCm: +(newHeight - plant.height).toFixed(2) });
    return updatedPlant;
  });

  if (changed) {
    savePlants(userId, updated);
    updatedPlants.forEach(({ name, addedCm }) => {
      if (addedCm > 0) {
        addNotification(userId, {
          type: 'growth',
          title: 'Croissance automatique',
          message: `${name} a grandi de ${addedCm} cm depuis votre dernière visite.`,
        });
      }
    });
  }

  return { changed, updatedPlants };
}
