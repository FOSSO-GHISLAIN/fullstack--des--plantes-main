export const PLANT_LIBRARY = [
  {
    id: 'basilic',
    name: 'Basilic',
    type: 'Herbe aromatique',
    definition:
      'Plante aromatique méditerranéenne aux feuilles vertes brillantes, très utilisée en cuisine.',
    growthPeriod: '60-90 jours (graine à récolte)',
    growthStages: [
      { stage: 'Germination', days: '7-14', water: 'Humide, arrosage léger quotidien', soil: 'Léger, drainant, riche en matière organique', tasks: 'Maintenir chaud (20-25°C), éviter le surplus d\'eau' },
      { stage: 'Jeune plant', days: '15-30', water: '2-3 fois/semaine', soil: 'pH 6-7, compost bien décomposé', tasks: 'Pincer la tige pour favoriser la ramification' },
      { stage: 'Croissance active', days: '30-60', water: 'Régulier, sol humide sans excès', soil: 'Terreau enrichi, bon drainage', tasks: 'Récolter les feuilles, surveiller les pucerons' },
      { stage: 'Floraison', days: '60+', water: 'Modéré', soil: 'Même type', tasks: 'Couper les fleurs pour prolonger la récolte' },
    ],
    optimalConditions: { temperature: '20-25°C', humidity: '50-70%', light: 'Plein soleil 6-8h', waterPerWeek: '1-2 L/m²' },
    soilType: 'Léger, drainant, riche',
    waterNeeds: 'Modéré à élevé en été',
    diseases: [
      { name: 'Pourriture du collet', symptoms: 'Tige noircie à la base', diagnosis: 'Excès d\'humidité ou sol mal drainé', remedy: 'Réduire l\'arrosage, améliorer le drainage, traiter au fongicide biologique' },
      { name: 'Oïdium', symptoms: 'Feuilles blanchâtres poudreuses', diagnosis: 'Humidité élevée et mauvaise circulation d\'air', remedy: 'Espacer les plants, arroser au pied, bicarbonate de soude dilué' },
      { name: 'Carence en azote', symptoms: 'Feuilles jaunies', diagnosis: 'Sol pauvre en nutriments', remedy: 'Apport d\'engrais azoté organique (compost, purin d\'ortie)' },
    ],
    harvestDays: 75,
    floweringDays: 55,
    maxHeight: 45,
    yieldPerPlant: '200-400 g de feuilles/saison',
  },
  {
    id: 'tomate',
    name: 'Tomate',
    type: 'Légume fruit',
    definition: 'Légume-fruit très cultivé, riche en lycopène, nécessite chaleur et ensoleillement.',
    growthPeriod: '90-120 jours',
    growthStages: [
      { stage: 'Germination', days: '7-10', water: 'Humide constant', soil: 'Terreau semis, chaleur 22-25°C', tasks: 'Semis en intérieur, éclairage si nécessaire' },
      { stage: 'Repiquage', days: '30-45', water: '2 L/semaine/plant', soil: 'Riche, profond, bien drainé', tasks: 'Tuteurage, enlever les gourmands' },
      { stage: 'Floraison', days: '60-75', water: '3-4 L/semaine', soil: 'Enrichi en potassium', tasks: 'Pollinisation, fertilisation potassium' },
      { stage: 'Fructification', days: '75-120', water: '4-5 L/semaine en été', soil: 'Paillage recommandé', tasks: 'Récolte progressive, surveillance mildiou' },
    ],
    optimalConditions: { temperature: '18-28°C', humidity: '60-70%', light: 'Plein soleil 8h+', waterPerWeek: '15-25 L/plant' },
    soilType: 'Profond, riche, légèrement acide (pH 6-6.8)',
    waterNeeds: 'Élevé en période de fructification',
    diseases: [
      { name: 'Mildiou', symptoms: 'Taches brunes sur feuilles et fruits', diagnosis: 'Champignon Phytophthora, humidité', remedy: 'Bouillie bordelaise, espacer les plants, arroser le matin' },
      { name: 'Alternariose', symptoms: 'Taches brunes concentriques', diagnosis: 'Champignon Alternaria solani', remedy: 'Rotation des cultures, fongicide cuivre, enlever feuilles atteintes' },
      { name: 'Attaque de chenilles', symptoms: 'Trous dans feuilles et fruits', diagnosis: 'Noctuelle ou pyrale', remedy: 'Pièges à phéromones, bacillus thuringiensis' },
    ],
    harvestDays: 100,
    floweringDays: 65,
    maxHeight: 180,
    yieldPerPlant: '3-8 kg/saison',
  },
  {
    id: 'menthe',
    name: 'Menthe',
    type: 'Herbe aromatique',
    definition: 'Herbe vivace très aromatique, propagation rapide, idéale en pot pour contenir sa croissance.',
    growthPeriod: 'Perpétuelle (récolte dès 60 jours)',
    growthStages: [
      { stage: 'Installation', days: '0-20', water: 'Humide constant', soil: 'Frais, riche, légèrement humide', tasks: 'Planter en pot ou bordure contrôlée' },
      { stage: 'Croissance', days: '20-60', water: '2-3 L/semaine', soil: 'Terre humifère', tasks: 'Récolte régulière pour stimuler la pousse' },
      { stage: 'Pleine production', days: '60+', water: 'Modéré', soil: 'Enrichi au printemps', tasks: 'Diviser les touffes tous les 2-3 ans' },
    ],
    optimalConditions: { temperature: '15-25°C', humidity: '60-80%', light: 'Mi-ombre à soleil', waterPerWeek: '5-10 L/m²' },
    soilType: 'Frais, humifère, légèrement acide',
    waterNeeds: 'Élevé — sol toujours frais',
    diseases: [
      { name: 'Rouille', symptoms: 'Pustules orangées sous les feuilles', diagnosis: 'Champignon Puccinia menthae', remedy: 'Enlever feuilles atteintes, améliorer circulation d\'air' },
      { name: 'Carence en fer', symptoms: 'Feuilles jaunes avec nervures vertes', diagnosis: 'Sol calcaire ou mal drainé', remedy: 'Chélates de fer, acidifier le sol' },
    ],
    harvestDays: 60,
    floweringDays: 90,
    maxHeight: 60,
    yieldPerPlant: 'Illimité en saison',
  },
  {
    id: 'chene',
    name: 'Chêne',
    type: 'Arbre',
    definition: 'Grand arbre feuillu à croissance lente, symbole de force et longévité, essentiel aux écosystèmes forestiers.',
    growthPeriod: '20-50 ans (maturité)',
    growthStages: [
      { stage: 'Jeune plant', days: '0-365', water: '1-2 L/semaine', soil: 'Profond, calcaire ou neutre', tasks: 'Protection contre le gibier' },
      { stage: 'Arbrisseau', days: '1-5 ans', water: 'Naturel sauf sécheresse', soil: 'Sol forestier profond', tasks: 'Taille de formation légère' },
      { stage: 'Arbre jeune', days: '5-20 ans', water: 'Autonome', soil: 'Profond, bien structuré', tasks: 'Surveillance maladies du chêne' },
    ],
    optimalConditions: { temperature: '5-25°C', humidity: '50-70%', light: 'Plein soleil', waterPerWeek: '10-20 L (jeune plant)' },
    soilType: 'Profond, calcaire ou neutre, bien drainé',
    waterNeeds: 'Faible une fois établi',
    diseases: [
      { name: 'Flétrissement du chêne', symptoms: 'Feuilles qui flétrissent prématurément', diagnosis: 'Champignon ou stress hydrique', remedy: 'Améliorer drainage, traitement fongicide si confirmé' },
      { name: 'Galles', symptoms: 'Excrescences sur feuilles ou branches', diagnosis: 'Insectes ou champignons galligènes', remedy: 'Taille des parties atteintes, bon entretien sanitaire' },
    ],
    harvestDays: 7300,
    floweringDays: 3650,
    maxHeight: 2500,
    yieldPerPlant: 'N/A (arbre ornemental/forestier)',
  },
  {
    id: 'fraise',
    name: 'Fraisier',
    type: 'Fruitier',
    definition: 'Petit fruit rouge sucré, culture facile en pot ou en pleine terre, production estivale.',
    growthPeriod: '4-6 mois (première récolte)',
    growthStages: [
      { stage: 'Installation', days: '0-30', water: 'Régulier', soil: 'Léger, acide (pH 5.5-6.5)', tasks: 'Paillage, éviter contact fruits/sol' },
      { stage: 'Floraison', days: '30-60', water: '2-3 L/semaine', soil: 'Enrichi en potassium', tasks: 'Protection gel tardif' },
      { stage: 'Fructification', days: '60-120', water: '3-4 L/semaine', soil: 'Paillé', tasks: 'Récolte dès coloration rouge' },
    ],
    optimalConditions: { temperature: '15-25°C', humidity: '60-70%', light: 'Soleil 6h minimum', waterPerWeek: '8-12 L/m²' },
    soilType: 'Léger, acide, riche en humus',
    waterNeeds: 'Modéré à élevé en fructification',
    diseases: [
      { name: 'Botrytis (pourriture grise)', symptoms: 'Moisissure grise sur fruits', diagnosis: 'Humidité excessive', remedy: 'Paillage, espacer, enlever fruits atteints' },
      { name: 'Oïdium', symptoms: 'Feuilles recouvertes de poudre blanche', diagnosis: 'Humidité et chaleur', remedy: 'Soufre mouillable, circulation d\'air' },
    ],
    harvestDays: 90,
    floweringDays: 45,
    maxHeight: 25,
    yieldPerPlant: '500 g - 1 kg/saison',
  },
  {
    id: 'lavande',
    name: 'Lavande',
    type: 'Plante aromatique',
    definition: 'Plante méditerranéenne aux fleurs violettes parfumées, résistante à la sécheresse.',
    growthPeriod: '2-3 ans (maturité complète)',
    growthStages: [
      { stage: 'Installation', days: '0-60', water: 'Modéré', soil: 'Pauvre, calcaire, drainé', tasks: 'Éviter sol trop riche' },
      { stage: 'Croissance', days: '60-365', water: 'Faible', soil: 'Sec à modéré', tasks: 'Taille légère après floraison' },
      { stage: 'Floraison', days: '365+', water: 'Minimal', soil: 'Sec drainé', tasks: 'Récolte fleurs au début de floraison' },
    ],
    optimalConditions: { temperature: '15-30°C', humidity: '40-60%', light: 'Plein soleil', waterPerWeek: '2-5 L/m²' },
    soilType: 'Calcaire, pauvre, très drainé',
    waterNeeds: 'Faible — résiste à la sécheresse',
    diseases: [
      { name: 'Shab (maladie fongique)', symptoms: 'Branches qui sèchent de l\'intérieur', diagnosis: 'Champignon Phomopsis', remedy: 'Taille sanitaire, brûler déchets, variétés résistantes' },
      { name: 'Pourriture racinaire', symptoms: 'Flétrissement général', diagnosis: 'Sol trop humide', remedy: 'Améliorer drainage, réduire arrosage' },
    ],
    harvestDays: 730,
    floweringDays: 365,
    maxHeight: 80,
    yieldPerPlant: '200-500 g de fleurs séchées',
  },
];

export function findPlantInLibrary(nameOrId) {
  const search = (nameOrId || '').toLowerCase().trim();
  return PLANT_LIBRARY.find(
    (p) => p.id === search || p.name.toLowerCase() === search
  );
}

export function getGrowthStageInfo(plantName, daysSincePlanting) {
  const lib = findPlantInLibrary(plantName);
  if (!lib) return null;
  let cumulative = 0;
  for (const stage of lib.growthStages) {
    const [min, max] = stage.days.split('-').map((d) => parseInt(d.replace(/\D/g, ''), 10) || 0);
    cumulative = max || min;
    if (daysSincePlanting <= cumulative) return stage;
  }
  return lib.growthStages[lib.growthStages.length - 1];
}
