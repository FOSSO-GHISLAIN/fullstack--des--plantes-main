import React from 'react';
import { findPlantInLibrary } from '../data/plantLibrary';
import { analyzeEnvironmentalParams } from '../services/aiService';

function LineChart({ data, width = 600, height = 200, color = '#2e7d32' }) {
  if (!data.length) {
    return <p className="empty-chart">Ajoutez des données de croissance pour voir le graphique.</p>;
  }

  const padding = { top: 20, right: 20, bottom: 40, left: 50 };
  const chartW = width - padding.left - padding.right;
  const chartH = height - padding.top - padding.bottom;

  const maxY = Math.max(...data.map((d) => d.height), 10) * 1.2;
  const points = data.map((d, i) => {
    const x = padding.left + (i / Math.max(data.length - 1, 1)) * chartW;
    const y = padding.top + chartH - (d.height / maxY) * chartH;
    return { x, y, ...d };
  });

  const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="growth-svg-chart">
      {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
        const y = padding.top + chartH * (1 - ratio);
        const val = Math.round(maxY * ratio);
        return (
          <g key={ratio}>
            <line x1={padding.left} y1={y} x2={width - padding.right} y2={y} stroke="#e0e0e0" strokeDasharray="4" />
            <text x={padding.left - 8} y={y + 4} textAnchor="end" fontSize="10" fill="#888">{val}cm</text>
          </g>
        );
      })}
      <path d={linePath} fill="none" stroke={color} strokeWidth="3" strokeLinecap="round" />
      {points.map((p, i) => (
        <g key={i}>
          <circle cx={p.x} cy={p.y} r="5" fill={color} />
          <text x={p.x} y={height - 10} textAnchor="middle" fontSize="9" fill="#666">{p.date?.slice(5)}</text>
        </g>
      ))}
    </svg>
  );
}

function BarChart({ plants }) {
  if (!plants.length) return null;
  const maxH = Math.max(...plants.map((p) => p.height), 10);

  return (
    <div className="bar-chart-modern">
      {plants.map((plant) => (
        <div key={plant.id} className="bar-item">
          <div
            className="bar-fill"
            style={{ height: `${(plant.height / maxH) * 100}%` }}
            title={`${plant.height} cm`}
          />
          <span className="bar-label">{plant.name}</span>
          <span className="bar-value">{plant.height}cm</span>
        </div>
      ))}
    </div>
  );
}

export default function GrowthDashboard({ plants }) {
  const allHistory = plants.flatMap((p) =>
    (p.growthHistory || []).map((h) => ({ ...h, plantName: p.name }))
  );

  const combinedByDate = {};
  plants.forEach((p) => {
    (p.growthHistory || []).forEach((h) => {
      if (!combinedByDate[h.date] || combinedByDate[h.date].height < h.height) {
        combinedByDate[h.date] = { date: h.date, height: h.height };
      }
    });
  });
  const timelineData = Object.values(combinedByDate).sort((a, b) => a.date.localeCompare(b.date));

  return (
    <div className="growth-dashboard">
      <div className="section-header">
        <h2>📈 Tableau de bord de croissance</h2>
        <p>Évolution quotidienne, taux de croissance et paramètres environnementaux</p>
      </div>

      <div className="charts-grid">
        <div className="chart-card">
          <h3>Croissance globale (hauteur cm)</h3>
          <LineChart data={timelineData} />
        </div>
        <div className="chart-card">
          <h3>Comparaison par plante</h3>
          <BarChart plants={plants} />
        </div>
      </div>

      <div className="env-grid">
        {plants.map((plant) => {
          const analysis = analyzeEnvironmentalParams(plant);
          const lib = findPlantInLibrary(plant.name);
          return (
            <div key={plant.id} className={`env-card status-${analysis.status}`}>
              <h4>{plant.name}</h4>
              <div className="env-metrics">
                <div className="metric">
                  <span>🌡️ Temp.</span>
                  <strong>{plant.temperature}°C</strong>
                  {lib && <small>Optimal: {lib.optimalConditions.temperature}</small>}
                </div>
                <div className="metric">
                  <span>💧 Humidité</span>
                  <strong>{plant.humidity}%</strong>
                  {lib && <small>Optimal: {lib.optimalConditions.humidity}</small>}
                </div>
                <div className="metric">
                  <span>📏 Hauteur</span>
                  <strong>{plant.height} cm</strong>
                </div>
                <div className="metric">
                  <span>🍃 Feuilles</span>
                  <strong>{plant.leafCount}</strong>
                </div>
              </div>
              {analysis.alerts.map((a, i) => (
                <div key={i} className="env-alert">{a.msg}</div>
              ))}
            </div>
          );
        })}
      </div>

      {allHistory.length === 0 && (
        <p className="hint">Enregistrez des mesures dans « Mes Plantes » pour alimenter les graphiques.</p>
      )}
    </div>
  );
}
