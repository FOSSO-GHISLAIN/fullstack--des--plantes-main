const express = require('express');
const cors = require('cors');
const AppError = require('./shared/utils/app-error');
const { authRouter, initAuthModule } = require('./modules/auth');
const { monitoringRouter, initMonitoringModule } = require('./modules/monitoring');
const { sickPlantRouter, initSickPlantModule } = require('./modules/sick-plant');

const app = express();

// ─── Middlewares globaux ──────────────────────────────────────────────────────
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ─── Initialisation des modules ───────────────────────────────────────────────
initAuthModule();
initMonitoringModule();
initSickPlantModule();

// ─── Routes ───────────────────────────────────────────────────────────────────
app.use('/api', authRouter);
app.use('/api', monitoringRouter);
app.use('/api/sick-plants', sickPlantRouter);

// Route de santé
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'API PlantTracker opérationnelle ✅',
    timestamp: new Date().toISOString(),
  });
});

// ─── Gestion des routes inexistantes ─────────────────────────────────────────
app.all('*', (req, res, next) => {
  next(new AppError(`Route ${req.originalUrl} non trouvée`, 404));
});

// ─── Gestionnaire d'erreurs global ────────────────────────────────────────────
app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Erreur interne du serveur';

  if (process.env.NODE_ENV !== 'production') {
    console.error('[ERROR]', err);
  }

  res.status(statusCode).json({
    status: 'error',
    statusCode,
    message,
  });
});

module.exports = app;
