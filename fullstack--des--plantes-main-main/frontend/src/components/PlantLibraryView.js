import React, { useState } from 'react';
import { PLANT_LIBRARY } from '../data/plantLibrary';

export default function PlantLibraryView() {
  const [selected, setSelected] = useState(PLANT_LIBRARY[0]);
  const [search, setSearch] = useState('');

  const filtered = PLANT_LIBRARY.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.type.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="library-section">
      <div className="section-header">
        <h2>📚 Bibliothèque des plantes</h2>
        <p>Documentation complète : définition, croissance, maladies et remèdes</p>
      </div>

      <input
        type="search"
        className="search-input"
        placeholder="Rechercher une plante..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      <div className="library-layout">
        <div className="library-list">
          {filtered.map((plant) => (
            <button
              key={plant.id}
              type="button"
              className={`library-item ${selected?.id === plant.id ? 'active' : ''}`}
              onClick={() => setSelected(plant)}
            >
              <span className="lib-icon">🌿</span>
              <div>
                <strong>{plant.name}</strong>
                <small>{plant.type}</small>
              </div>
            </button>
          ))}
        </div>

        {selected && (
          <div className="library-detail">
            <h3>{selected.name}</h3>
            <span className="plant-type-badge">{selected.type}</span>

            <div className="detail-block">
              <h4>📖 Définition</h4>
              <p>{selected.definition}</p>
            </div>

            <div className="detail-block">
              <h4>⏱️ Période de croissance</h4>
              <p>{selected.growthPeriod}</p>
            </div>

            <div className="detail-grid">
              <div className="detail-mini">
                <span>🌍 Sol</span>
                <p>{selected.soilType}</p>
              </div>
              <div className="detail-mini">
                <span>💧 Eau</span>
                <p>{selected.waterNeeds}</p>
              </div>
              <div className="detail-mini">
                <span>🌡️ Température</span>
                <p>{selected.optimalConditions.temperature}</p>
              </div>
              <div className="detail-mini">
                <span>💨 Humidité</span>
                <p>{selected.optimalConditions.humidity}</p>
              </div>
            </div>

            <div className="detail-block">
              <h4>📈 Niveaux de croissance</h4>
              <div className="stages-timeline">
                {selected.growthStages.map((stage, i) => (
                  <div key={i} className="stage-item">
                    <div className="stage-marker">{i + 1}</div>
                    <div className="stage-content">
                      <h5>{stage.stage} <small>({stage.days} jours)</small></h5>
                      <p><strong>Arrosage :</strong> {stage.water}</p>
                      <p><strong>Sol :</strong> {stage.soil}</p>
                      <p><strong>À faire :</strong> {stage.tasks}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="detail-block">
              <h4>🦠 Maladies, diagnostic et remèdes</h4>
              {selected.diseases.map((d, i) => (
                <div key={i} className="disease-doc">
                  <h5>{d.name}</h5>
                  <p><strong>Symptômes :</strong> {d.symptoms}</p>
                  <p><strong>Diagnostic :</strong> {d.diagnosis}</p>
                  <p><strong>Remède :</strong> {d.remedy}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
