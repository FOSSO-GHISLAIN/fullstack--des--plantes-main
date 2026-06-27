import { findPlantInLibrary, getGrowthStageInfo } from '../data/plantLibrary';
import { getDaysSincePlanting } from './plantService';

export function generateCalendarEvents(plants) {
  const events = [];
  const today = new Date();

  plants.forEach((plant) => {
    const lib = findPlantInLibrary(plant.name);
    const daysSince = getDaysSincePlanting(plant.plantedDate);
    const stageInfo = getGrowthStageInfo(plant.name, daysSince);

    const addEvent = (daysOffset, type, title, description) => {
      const date = new Date(today);
      date.setDate(date.getDate() + daysOffset);
      events.push({
        id: `${plant.id}_${type}_${daysOffset}`,
        plantId: plant.id,
        plantName: plant.name,
        date: date.toISOString().split('T')[0],
        type,
        title,
        description,
      });
    };

    addEvent(0, 'watering', `Arrosage — ${plant.name}`, stageInfo?.water || plant.waterNeeds || 'Arrosage régulier');
    addEvent(2, 'watering', `Arrosage — ${plant.name}`, 'Vérifier l\'humidité du sol');
    addEvent(7, 'watering', `Arrosage — ${plant.name}`, 'Arrosage hebdomadaire');

    if (daysSince % 14 < 7) {
      addEvent(14, 'fertilizing', `Fertilisation — ${plant.name}`, 'Apport d\'engrais organique ou compost');
    }

    addEvent(21, 'treatment', `Inspection phytosanitaire — ${plant.name}`, 'Vérifier feuilles, tiges et parasites');

    if (lib) {
      const daysToHarvest = Math.max(0, lib.harvestDays - daysSince);
      if (daysToHarvest <= 30) {
        addEvent(daysToHarvest, 'harvest', `Récolte estimée — ${plant.name}`, `Rendement estimé : ${lib.yieldPerPlant}`);
      }
      const daysToFlower = Math.max(0, lib.floweringDays - daysSince);
      if (daysToFlower <= 21) {
        addEvent(daysToFlower, 'flowering', `Floraison — ${plant.name}`, 'Période de floraison approchante');
      }
    }
  });

  return events.sort((a, b) => a.date.localeCompare(b.date));
}

export function getUpcomingEvents(events, days = 14) {
  const today = new Date();
  const limit = new Date();
  limit.setDate(limit.getDate() + days);

  return events.filter((e) => {
    const d = new Date(e.date);
    return d >= today && d <= limit;
  });
}

export function getEventsForDate(events, dateStr) {
  return events.filter((e) => e.date === dateStr);
}

export function getEventTypeLabel(type) {
  const labels = {
    watering: '💧 Arrosage',
    fertilizing: '🌿 Fertilisation',
    treatment: '🛡️ Traitement',
    harvest: '🌾 Récolte',
    flowering: '🌸 Floraison',
  };
  return labels[type] || type;
}

export function getEventTypeColor(type) {
  const colors = {
    watering: '#2196F3',
    fertilizing: '#4CAF50',
    treatment: '#FF9800',
    harvest: '#8BC34A',
    flowering: '#E91E63',
  };
  return colors[type] || '#607D8B';
}
