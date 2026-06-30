require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/plants-app';

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true, minlength: 8 },
    role: { type: String, enum: ['user', 'admin'], default: 'user' },
    isVerified: { type: Boolean, default: true },
    lastLogin: { type: Date, default: null },
  },
  { timestamps: true }
);

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

const growthEntrySchema = new mongoose.Schema(
  {
    date: String,
    height: Number,
    leafCount: Number,
    temperature: Number,
    humidity: Number,
    auto: { type: Boolean, default: false },
  },
  { _id: false }
);

const plantSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },
    name: { type: String, required: true },
    species: { type: String, required: true },
    type: { type: String, default: 'Légume' },
    plantedDate: String,
    soilType: String,
    waterNeeds: String,
    height: { type: Number, default: 0 },
    leafCount: { type: Number, default: 0 },
    temperature: { type: Number, default: 22 },
    humidity: { type: Number, default: 60 },
    status: { type: String, enum: ['healthy', 'warning', 'sick', 'dead'], default: 'healthy' },
    growthHistory: [growthEntrySchema],
    lastAutoGrowth: String,
    thresholds: { type: Object, default: {} },
  },
  { timestamps: true, versionKey: false }
);

const sickPlantSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },
    plantName: { type: String, required: true },
    species: String,
    symptoms: { type: String, required: true },
    severity: { type: String, enum: ['légère', 'modérée', 'grave'], default: 'modérée' },
    diagnosisDate: { type: Date, default: Date.now },
    treatment: String,
    treatmentStatus: { type: String, enum: ['non_traité', 'en_cours', 'guéri'], default: 'non_traité' },
    location: String,
    notes: String,
  },
  { timestamps: true, versionKey: false }
);

const appNotificationSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },
    type: {
      type: String,
      enum: ['watering', 'fertilizing', 'treatment', 'harvest', 'flowering', 'disease', 'growth', 'info'],
      default: 'info',
    },
    title: { type: String, required: true },
    message: { type: String, required: true },
    read: { type: Boolean, default: false },
    plantId: { type: String, default: null },
  },
  { timestamps: true, versionKey: false }
);

const User = mongoose.model('User', userSchema);
const Plant = mongoose.model('Plant', plantSchema);
const SickPlant = mongoose.model('SickPlant', sickPlantSchema);
const AppNotification = mongoose.model('AppNotification', appNotificationSchema);

function daysAgo(days) {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString().split('T')[0];
}

async function seed() {
  await mongoose.connect(MONGODB_URI);
  console.log('✓ Connecté à MongoDB');

  await Promise.all([
    User.deleteMany({}),
    Plant.deleteMany({}),
    SickPlant.deleteMany({}),
    AppNotification.deleteMany({}),
  ]);
  console.log('✓ Collections vidées');

  const demoUser = await User.create({
    name: 'Audrey Demo',
    email: 'demo@planttracker.fr',
    password: 'Demo123!',
    role: 'user',
    isVerified: true,
  });

  const adminUser = await User.create({
    name: 'Admin PlantTracker',
    email: 'admin@planttracker.fr',
    password: 'Admin123!',
    role: 'admin',
    isVerified: true,
  });

  console.log('✓ Utilisateurs créés');

  const demoPlants = await Plant.insertMany([
    {
      userId: demoUser._id,
      name: 'Basilic',
      species: 'Ocimum basilicum',
      type: 'Herbe aromatique',
      plantedDate: daysAgo(45),
      soilType: 'Léger et drainant',
      waterNeeds: 'Modéré',
      height: 18,
      leafCount: 24,
      temperature: 24,
      humidity: 55,
      status: 'healthy',
      growthHistory: [
        { date: daysAgo(45), height: 2, leafCount: 4, temperature: 22, humidity: 60 },
        { date: daysAgo(30), height: 8, leafCount: 12, temperature: 23, humidity: 58 },
        { date: daysAgo(15), height: 14, leafCount: 20, temperature: 24, humidity: 55 },
        { date: daysAgo(0), height: 18, leafCount: 24, temperature: 24, humidity: 55 },
      ],
    },
    {
      userId: demoUser._id,
      name: 'Tomate',
      species: 'Solanum lycopersicum',
      type: 'Légume',
      plantedDate: daysAgo(60),
      soilType: 'Riche en compost',
      waterNeeds: 'Élevé',
      height: 65,
      leafCount: 42,
      temperature: 26,
      humidity: 62,
      status: 'warning',
      growthHistory: [
        { date: daysAgo(60), height: 5, leafCount: 6, temperature: 22, humidity: 65 },
        { date: daysAgo(40), height: 25, leafCount: 18, temperature: 24, humidity: 63 },
        { date: daysAgo(20), height: 48, leafCount: 32, temperature: 25, humidity: 62 },
        { date: daysAgo(0), height: 65, leafCount: 42, temperature: 26, humidity: 62 },
      ],
    },
    {
      userId: demoUser._id,
      name: 'Menthe',
      species: 'Mentha spicata',
      type: 'Herbe aromatique',
      plantedDate: daysAgo(30),
      soilType: 'Humide',
      waterNeeds: 'Élevé',
      height: 22,
      leafCount: 30,
      temperature: 21,
      humidity: 70,
      status: 'healthy',
      growthHistory: [
        { date: daysAgo(30), height: 3, leafCount: 8, temperature: 20, humidity: 72 },
        { date: daysAgo(15), height: 12, leafCount: 18, temperature: 21, humidity: 71 },
        { date: daysAgo(0), height: 22, leafCount: 30, temperature: 21, humidity: 70 },
      ],
    },
    {
      userId: demoUser._id,
      name: 'Lavande',
      species: 'Lavandula angustifolia',
      type: 'Plante médicinale',
      plantedDate: daysAgo(120),
      soilType: 'Calcaire et sec',
      waterNeeds: 'Faible',
      height: 35,
      leafCount: 50,
      temperature: 23,
      humidity: 45,
      status: 'healthy',
      growthHistory: [
        { date: daysAgo(120), height: 5, leafCount: 10, temperature: 22, humidity: 50 },
        { date: daysAgo(60), height: 20, leafCount: 30, temperature: 23, humidity: 48 },
        { date: daysAgo(0), height: 35, leafCount: 50, temperature: 23, humidity: 45 },
      ],
    },
  ]);

  console.log(`✓ ${demoPlants.length} plantes saines créées`);

  await SickPlant.insertMany([
    {
      userId: demoUser._id,
      plantName: 'Tomate',
      species: 'Solanum lycopersicum',
      symptoms: 'Feuilles jaunissantes avec taches brunes, croissance ralentie',
      severity: 'modérée',
      diagnosisDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      treatment: 'Retirer les feuilles affectées, appliquer un fongicide bio, réduire l\'arrosage',
      treatmentStatus: 'en_cours',
      location: 'Serre principale',
      notes: 'Surveillance hebdomadaire recommandée',
    },
    {
      userId: demoUser._id,
      plantName: 'Basilic',
      species: 'Ocimum basilicum',
      symptoms: 'Petites taches noires sur les feuilles inférieures',
      severity: 'légère',
      diagnosisDate: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000),
      treatment: 'Améliorer la circulation d\'air, éviter les éclaboussures sur les feuilles',
      treatmentStatus: 'guéri',
      location: 'Balcon sud',
      notes: 'Guérison constatée après 10 jours',
    },
  ]);

  console.log('✓ Plantes malades créées');

  await AppNotification.insertMany([
    {
      userId: demoUser._id,
      type: 'watering',
      title: 'Arrosage du Basilic',
      message: 'Le basilic a besoin d\'être arrosé aujourd\'hui.',
      read: false,
      plantId: demoPlants[0]._id.toString(),
    },
    {
      userId: demoUser._id,
      type: 'disease',
      title: 'Alerte maladie — Tomate',
      message: 'La tomate présente des symptômes nécessitant une attention.',
      read: false,
      plantId: demoPlants[1]._id.toString(),
    },
    {
      userId: demoUser._id,
      type: 'growth',
      title: 'Croissance automatique',
      message: 'La menthe a grandi de 2.5 cm depuis votre dernière visite.',
      read: true,
      plantId: demoPlants[2]._id.toString(),
    },
    {
      userId: demoUser._id,
      type: 'harvest',
      title: 'Récolte proche — Lavande',
      message: 'La lavande sera prête à récolter dans environ 2 semaines.',
      read: false,
      plantId: demoPlants[3]._id.toString(),
    },
    {
      userId: demoUser._id,
      type: 'info',
      title: 'Bienvenue sur PlantTracker',
      message: 'Votre jardin virtuel est prêt. Explorez le tableau de bord !',
      read: true,
    },
  ]);

  console.log('✓ Notifications créées');

  console.log('\n══════════════════════════════════════════');
  console.log('  Base de données initialisée avec succès');
  console.log('══════════════════════════════════════════');
  console.log('\nComptes de démonstration :');
  console.log('  Email    : demo@planttracker.fr');
  console.log('  Mot de passe : Demo123!');
  console.log('\n  Email    : admin@planttracker.fr');
  console.log('  Mot de passe : Admin123!');
  console.log('\nDonnées :');
  console.log(`  - ${demoPlants.length} plantes saines`);
  console.log('  - 2 fiches plantes malades');
  console.log('  - 5 notifications');
  console.log('══════════════════════════════════════════\n');

  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error('✗ Erreur lors du seed :', err);
  process.exit(1);
});
