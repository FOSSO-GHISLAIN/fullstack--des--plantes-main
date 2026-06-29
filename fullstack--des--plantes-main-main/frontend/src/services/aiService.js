import { findPlantInLibrary } from '../data/plantLibrary';
import { getDaysSincePlanting } from './plantService';

function linearRegression(points) {
  const n = points.length;
  if (n < 2) return { slope: 0.5, intercept: points[0]?.y || 0 };

  let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0;
  points.forEach(({ x, y }) => {
    sumX += x; sumY += y; sumXY += x * y; sumX2 += x * x;
  });

  const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX) || 0.3;
  const intercept = (sumY - slope * sumX) / n;
  return { slope, intercept };
}

export function predictGrowth(plant) {
  const lib = findPlantInLibrary(plant.name);
  const history = plant.growthHistory || [];
  const daysSince = getDaysSincePlanting(plant.plantedDate);

  const points = history.map((h, i) => ({ x: i + 1, y: h.height }));
  const { slope } = linearRegression(points);
  const currentHeight = plant.height || history[history.length - 1]?.height || 0;
  const growthRate = slope > 0 ? slope : 0.3;

  const futureHeight30 = Math.round(currentHeight + growthRate * 30);
  const futureHeight60 = Math.round(currentHeight + growthRate * 60);
  const maxHeight = lib?.maxHeight || 100;

  const floweringDays = lib?.floweringDays || Math.round(daysSince + 30);
  const harvestDays = lib?.harvestDays || Math.round(daysSince + 60);
  const daysToFlower = Math.max(0, floweringDays - daysSince);
  const daysToHarvest = Math.max(0, harvestDays - daysSince);

  const floweringDate = new Date();
  floweringDate.setDate(floweringDate.getDate() + daysToFlower);

  const harvestDate = new Date();
  harvestDate.setDate(harvestDate.getDate() + daysToHarvest);

  const yieldEstimate = lib?.yieldPerPlant || `${Math.round(futureHeight60 * 0.05)} unités estimées`;

  return {
    currentHeight,
    futureHeight30: Math.min(futureHeight30, maxHeight),
    futureHeight60: Math.min(futureHeight60, maxHeight),
    growthRatePerDay: growthRate.toFixed(2),
    floweringDate: floweringDate.toLocaleDateString('fr-FR'),
    harvestDate: harvestDate.toLocaleDateString('fr-FR'),
    daysToFlower,
    daysToHarvest,
    yieldEstimate,
    maxHeight,
    confidence: history.length >= 3 ? 'Élevée' : history.length >= 1 ? 'Modérée' : 'Faible',
  };
}

const DISEASE_RULES = [
  {
    keywords: ['jaun', 'yellow', 'pâle', 'pale'],
    disease: 'Carence en azote',
    type: 'carence',
    severity: 'modérée',
    remedy: "Apport d'engrais azoté organique (compost mûr, purin d'ortie dilué 1/10).",
    diagnosis: "Feuilles jaunies indiquent souvent un manque d'azote ou un excès d'eau.",
  },
  {
    keywords: ['brun', 'tache', 'spot', 'marron', 'noir'],
    disease: 'Maladie fongique',
    type: 'maladie',
    severity: 'élevée',
    remedy: "Enlever les feuilles atteintes, traiter à la bouillie bordelaise, améliorer la circulation d'air.",
    diagnosis: "Taches brunes typiques d'une infection fongique (mildiou, alternariose).",
  },
  {
    keywords: ['trou', 'mangé', 'mange', 'insect', 'chenille'],
    disease: "Attaque d'insectes",
    type: 'parasite',
    severity: 'modérée',
    remedy: 'Inspection manuelle, bacillus thuringiensis pour chenilles, savon noir dilué contre pucerons.',
    diagnosis: 'Trous dans les feuilles causés par des insectes phytophages.',
  },
  {
    keywords: ['blanc', 'poudre', 'oïdium', 'oidium'],
    disease: 'Oïdium',
    type: 'maladie',
    severity: 'modérée',
    remedy: 'Bicarbonate de soude (1 c. à soupe/L), espacer les plants, arroser au pied.',
    diagnosis: "Poudre blanche caractéristique de l'oïdium.",
  },
  {
    keywords: ['flétri', 'fletriss', 'fané', 'fane', 'molle'],
    disease: 'Stress hydrique ou pourriture',
    type: 'maladie',
    severity: 'élevée',
    remedy: "Vérifier drainage, ajuster arrosage, traiter racines si pourriture confirmée.",
    diagnosis: "Flétrissement dû à un excès ou manque d'eau, ou infection racinaire.",
  },
  {
    keywords: ['nervure', 'vert clair', 'chlorose'],
    disease: 'Carence en fer',
    type: 'carence',
    severity: 'modérée',
    remedy: 'Chélates de fer foliaire, acidifier le sol si calcaire.',
    diagnosis: 'Jaunissement entre nervures vertes = chlorose ferrique.',
  },
];

export function detectDisease(symptoms, plantName) {
  const text = (symptoms || '').toLowerCase();
  const lib = findPlantInLibrary(plantName);
  const matches = [];

  DISEASE_RULES.forEach((rule) => {
    if (rule.keywords.some((kw) => text.includes(kw))) matches.push(rule);
  });

  if (lib) {
    lib.diseases.forEach((d) => {
      if (d.symptoms.toLowerCase().split(' ').some((w) => w.length > 4 && text.includes(w))) {
        matches.push({ disease: d.name, type: 'maladie', severity: 'modérée', remedy: d.remedy, diagnosis: d.diagnosis });
      }
    });
  }

  if (matches.length === 0) {
    return {
      detected: false,
      message: 'Aucune maladie évidente détectée. Continuez la surveillance et décrivez plus de symptômes.',
      recommendations: ['Photographier les feuilles atteintes', 'Vérifier arrosage et luminosité', 'Consulter la bibliothèque plantes'],
    };
  }

  const unique = matches.filter((m, i, arr) => arr.findIndex((x) => x.disease === m.disease) === i);
  return { detected: true, results: unique, message: `${unique.length} problème(s) potentiel(s) identifié(s).` };
}

const CHAT_RESPONSES = [
  { patterns: ['jaune', 'jaunir', 'jaunies'], answer: "Les feuilles jaunes peuvent indiquer une carence en azote, un excès d'eau ou un manque de lumière. Vérifiez l'arrosage (sol humide mais pas détrempé) et ajoutez du compost ou purin d'ortie dilué." },
  { patterns: ['engrais', 'fertil', 'nutriment'], answer: 'Privilégiez les engrais organiques : compost, fumier bien décomposé, purins (ortie pour azote, consoude pour potassium). En floraison/fructification, augmentez le potassium.' },
  { patterns: ['récolt', 'recolt', 'quand cueillir', 'matur'], answer: "La récolte dépend de l'espèce : basilic dès 15 cm, tomates quand elles colorent uniformément, fraises entièrement rouges. Consultez l'onglet Prédictions IA pour des dates estimées." },
  { patterns: ['arros', 'eau', 'hydrat'], answer: "Arrosez le matin au pied de la plante. Sol humide sur 5 cm de profondeur = suffisant. Réduisez en hiver, augmentez en floraison. Chaque plante a des besoins différents — voir la bibliothèque." },
  { patterns: ['sol', 'terre', 'substrat'], answer: 'Un bon sol est drainant et riche en humus. Tomates : profond et légèrement acide. Lavande : calcaire et pauvre. Basilic : léger et riche. Ajoutez du compost au printemps.' },
  { patterns: ['maladie', 'malade', 'tache', 'parasite'], answer: "Utilisez l'onglet Détection Maladies pour analyser vos symptômes. En général : enlever les parties atteintes, améliorer l'aération, éviter l'humidité sur le feuillage." },
  { patterns: ['bonjour', 'salut', 'hello', 'coucou'], answer: "Bonjour ! Je suis votre assistant agricole. Posez-moi des questions sur l'arrosage, les engrais, les maladies ou la récolte de vos plantes." },
];

function localChatFallback(message, plantContext) {
  const text = (message || '').toLowerCase();
  for (const rule of CHAT_RESPONSES) {
    if (rule.patterns.some((p) => text.includes(p))) return rule.answer;
  }
  if (plantContext) {
    return `Pour votre ${plantContext.name} (${plantContext.type}), je recommande de maintenir une température autour de ${plantContext.temperature}°C et une humidité de ${plantContext.humidity}%. Consultez la bibliothèque pour des conseils spécifiques à cette espèce.`;
  }
  return 'Je peux vous aider sur l\'arrosage, les engrais, les maladies et la récolte. Essayez : "Pourquoi mes feuilles jaunissent ?" ou "Quel engrais utiliser ?"';
}

export async function chatWithAssistant(message, plantContext, history = []) {
  const apiKey = process.env.REACT_APP_GROQ_API_KEY;

  if (!apiKey) {
    return localChatFallback(message, plantContext);
  }

  const systemInstruction = [
    "Tu es un expert en horticulture et agriculture, intégré dans l'application PlantTracker.",
    'Tu réponds UNIQUEMENT en français, de manière concise, bienveillante et pratique.',
    "Tu aides les utilisateurs à surveiller la croissance de leurs plantes, diagnostiquer des maladies et optimiser leurs soins.",
    plantContext
      ? `L'utilisateur parle actuellement de sa plante "${plantContext.name}" (type: ${plantContext.type || 'inconnu'}).`
      : "L'utilisateur pose une question générale sur ses plantes.",
  ].join(' ');

  const messages = [
    { role: 'system', content: systemInstruction },
    ...history.slice(-10).map((m) => ({ role: m.role === 'user' ? 'user' : 'assistant', content: m.text })),
    { role: 'user', content: message },
  ];

  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'llama-3.1-8b-instant',
        messages,
        temperature: 0.7,
        max_tokens: 512,
      }),
    });

    if (!response.ok) {
      const err = await response.json();
      console.error('Erreur Groq API:', err);
      return localChatFallback(message, plantContext);
    }

    const data = await response.json();
    return data?.choices?.[0]?.message?.content || localChatFallback(message, plantContext);
  } catch (error) {
    console.error('Erreur réseau Groq:', error.message);
    return localChatFallback(message, plantContext);
  }
}

export function analyzeEnvironmentalParams(plant) {
  const lib = findPlantInLibrary(plant.name);
  if (!lib) return { status: 'unknown', alerts: [] };

  const optimal = lib.optimalConditions;
  const alerts = [];
  const tempRange = optimal.temperature.match(/(\d+)-(\d+)/);
  const humRange = optimal.humidity.match(/(\d+)-(\d+)/);

  if (tempRange) {
    const [, minT, maxT] = tempRange.map(Number);
    if (plant.temperature < minT) alerts.push({ type: 'warning', msg: `Température basse (${plant.temperature}°C). Idéal : ${optimal.temperature}` });
    if (plant.temperature > maxT) alerts.push({ type: 'warning', msg: `Température élevée (${plant.temperature}°C). Idéal : ${optimal.temperature}` });
  }

  if (humRange) {
    const [, minH, maxH] = humRange.map(Number);
    if (plant.humidity < minH) alerts.push({ type: 'warning', msg: `Humidité basse (${plant.humidity}%). Idéal : ${optimal.humidity}` });
    if (plant.humidity > maxH) alerts.push({ type: 'warning', msg: `Humidité élevée (${plant.humidity}%). Risque fongique.` });
  }

  return { status: alerts.length ? 'warning' : 'healthy', alerts, optimal };
}

export async function analyzePlantImage(base64Data, mimeType, plantName) {
  const apiKey = process.env.REACT_APP_GROQ_API_KEY;

  if (!apiKey) {
    throw new Error('Clé API Groq manquante. Veuillez renseigner REACT_APP_GROQ_API_KEY dans votre fichier .env.');
  }

  const prompt = `Tu es un expert phytosanitaire et agronome. Analyse cette image de feuille de plante (${plantName || 'espèce inconnue'}) et identifie s'il y a une maladie, une carence ou un parasite.
Réponds UNIQUEMENT avec un JSON valide contenant exactement ces champs :
{"detected": true/false, "disease": "nom ou Aucune", "type": "carence|maladie|parasite|aucun", "severity": "légère|modérée|grave", "diagnosis": "description", "remedy": "traitement suggéré"}`;

  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'meta-llama/llama-4-scout-17b-16e-instruct',
      messages: [{
        role: 'user',
        content: [
          { type: 'text', text: prompt },
          { type: 'image_url', image_url: { url: `data:${mimeType || 'image/jpeg'};base64,${base64Data}` } },
        ],
      }],
      temperature: 0.2,
      max_tokens: 800,
    }),
  });

  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.error?.message || "Erreur lors de l'appel à l'API Groq");
  }

  const data = await response.json();
  const text = data?.choices?.[0]?.message?.content;
  if (!text) throw new Error("Aucune réponse reçue de l'intelligence artificielle.");

  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error("Format de réponse invalide.");
  return JSON.parse(jsonMatch[0]);
}
