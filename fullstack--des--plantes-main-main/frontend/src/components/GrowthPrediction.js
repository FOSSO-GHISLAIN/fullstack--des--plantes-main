import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { predictGrowth } from '../services/aiService';

export default function GrowthPrediction() {
  const { plants } = useApp();
  const [selectedId, setSelectedId] = useState(plants[0]?.id || '');

  const plant = plants.find((p) => p.id === selectedId);
  const prediction = plant ? predictGrowth(plant) : null;

  if (!plants.length) {
    return (
      <div className="section-empty">
        <h2>🔮 Prédiction de croissance par IA</h2>
        <p>Ajoutez des plantes et des mesures pour obtenir des prévisions.</p>
      </div>
    );
  }

  return (
    <div className="predictions-section">
      <div className="section-header">
        <h2>🔮 Prédiction de croissance par IA</h2>
        <p>Taille future, floraison, récolte et rendement estimés</p>
      </div>

      <div className="form-row">
        <label>Sélectionner une plante</label>
        <select value={selectedId} onChange={(e) => setSelectedId(e.target.value)}>
          {plants.map((p) => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>
      </div>

      {prediction && (
        <div className="prediction-grid">
          <div className="prediction-card highlight">
            <span className="pred-icon">📏</span>
            <h3>Taille actuelle</h3>
            <p className="pred-value">{prediction.currentHeight} cm</p>
          </div>
          <div className="prediction-card">
            <span className="pred-icon">📈</span>
            <h3>Dans 30 jours</h3>
            <p className="pred-value">{prediction.futureHeight30} cm</p>
          </div>
          <div className="prediction-card">
            <span className="pred-icon">🌳</span>
            <h3>Dans 60 jours</h3>
            <p className="pred-value">{prediction.futureHeight60} cm</p>
            <small>Max espèce: {prediction.maxHeight} cm</small>
          </div>
          <div className="prediction-card">
            <span className="pred-icon">⚡</span>
            <h3>Taux de croissance</h3>
            <p className="pred-value">{prediction.growthRatePerDay} cm/jour</p>
            <small>Confiance: {prediction.confidence}</small>
          </div>
          <div className="prediction-card">
            <span className="pred-icon">🌸</span>
            <h3>Floraison estimée</h3>
            <p className="pred-value">{prediction.floweringDate}</p>
            <small>Dans {prediction.daysToFlower} jours</small>
          </div>
          <div className="prediction-card">
            <span className="pred-icon">🌾</span>
            <h3>Récolte estimée</h3>
            <p className="pred-value">{prediction.harvestDate}</p>
            <small>Dans {prediction.daysToHarvest} jours</small>
          </div>
          <div className="prediction-card wide">
            <span className="pred-icon">📦</span>
            <h3>Rendement potentiel</h3>
            <p className="pred-value">{prediction.yieldEstimate}</p>
          </div>
        </div>
      )}

      <div className="info-box">
        <h4>Saisir des données pour améliorer les prévisions</h4>
        <p>
          L&apos;IA analyse l&apos;historique (hauteur, feuilles, température, humidité) via une régression
          linéaire locale. Plus vous enregistrez de mesures, plus les prévisions sont précises.
        </p>
      </div>
    </div>
  );
}
