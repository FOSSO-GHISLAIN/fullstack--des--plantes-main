import React, { useState, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { detectDisease, analyzePlantImage } from '../services/aiService';

const SYMPTOM_SUGGESTIONS = [
  'Feuilles jaunies',
  'Taches brunes sur les feuilles',
  'Trous dans les feuilles',
  'Feuilles flétries',
  'Poudre blanche sur les feuilles',
  'Feuilles jaunes avec nervures vertes',
];

export default function DiseaseDetector() {
  const { plants, updatePlant } = useApp();
  const [plantId, setPlantId] = useState(plants[0]?.id || '');
  const [symptoms, setSymptoms] = useState('');
  const [result, setResult] = useState(null);

  // Nouveaux états pour le mode d'analyse par image
  const [analysisMode, setAnalysisMode] = useState('image'); // Par défaut image, ou 'text'
  const [selectedImage, setSelectedImage] = useState(null);
  const [base64Image, setBase64Image] = useState(null);
  const [imageMimeType, setImageMimeType] = useState('image/jpeg');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  const plant = plants.find((p) => p.id === plantId);

  const handleAnalyzeText = () => {
    if (!symptoms.trim()) return;
    setLoading(true);
    setError('');
    setResult(null);
    try {
      const analysis = detectDisease(symptoms, plant?.name);
      setResult(analysis);

      if (analysis.detected && plant) {
        updatePlant(plant.id, { status: 'warning' });
      }
    } catch (err) {
      setError(err.message || 'Erreur lors de l’analyse');
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Veuillez sélectionner un fichier image valide (JPG, PNG).');
      return;
    }

    setImageMimeType(file.type);
    setSelectedImage(URL.createObjectURL(file));

    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result.split(',')[1];
      setBase64Image(base64);
    };
    reader.readAsDataURL(file);
  };

  const handleAnalyzeImage = async () => {
    if (!base64Image) {
      alert('Veuillez d’abord prendre une photo ou importer une image.');
      return;
    }

    setLoading(true);
    setError('');
    setResult(null);

    try {
      const apiResult = await analyzePlantImage(base64Image, imageMimeType, plant?.name);
      
      if (apiResult.detected) {
        setResult({
          detected: true,
          message: `IA Diagnostic : ${apiResult.disease}`,
          results: [
            {
              severity: apiResult.severity || 'modérée',
              type: apiResult.type || 'maladie',
              disease: apiResult.disease,
              diagnosis: apiResult.diagnosis,
              remedy: apiResult.remedy,
            }
          ]
        });

        if (plant) {
          updatePlant(plant.id, { status: 'warning' });
        }
      } else {
        setResult({
          detected: false,
          message: 'Aucune anomalie évidente détectée par l’IA.',
          recommendations: [
            apiResult.diagnosis || 'La plante semble être en bonne santé.',
            'Continuer à arroser selon les besoins habituels.',
            apiResult.remedy || 'Aucun traitement phytosanitaire requis.'
          ]
        });
      }
    } catch (err) {
      setError(err.message || 'Erreur de communication avec l’IA Gemini.');
    } finally {
      setLoading(false);
    }
  };

  const addSuggestion = (s) => {
    setSymptoms((prev) => (prev ? `${prev}, ${s}` : s));
  };

  const triggerFileSelect = () => {
    fileInputRef.current.click();
  };

  const resetImage = () => {
    setSelectedImage(null);
    setBase64Image(null);
    setResult(null);
    setError('');
  };

  return (
    <div className="disease-section">
      <div className="section-header">
        <h2>🔬 Détection précoce des maladies</h2>
        <p>Prenez en photo votre plante ou décrivez ses symptômes pour obtenir un diagnostic instantané par IA</p>
      </div>

      {/* Onglets de bascule */}
      <div className="plants-tabs" style={{ marginBottom: '20px' }}>
        <button
          type="button"
          className={`tab-btn ${analysisMode === 'image' ? 'active' : ''}`}
          onClick={() => { setAnalysisMode('image'); setResult(null); setError(''); }}
        >
          📷 Analyse par Photo
        </button>
        <button
          type="button"
          className={`tab-btn ${analysisMode === 'text' ? 'active' : ''}`}
          onClick={() => { setAnalysisMode('text'); setResult(null); setError(''); }}
        >
          ✍️ Description des symptômes
        </button>
      </div>

      <div className="disease-form">
        <div className="form-row">
          <label>Plante concernée</label>
          <select value={plantId} onChange={(e) => setPlantId(e.target.value)}>
            <option value="">— Sélectionner —</option>
            {plants.map((p) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </div>

        {/* ─── Mode d'analyse Image ─── */}
        {analysisMode === 'image' && (
          <div className="image-analysis-container">
            <input
              type="file"
              accept="image/*"
              capture="environment"
              ref={fileInputRef}
              onChange={handleImageChange}
              style={{ display: 'none' }}
            />

            {!selectedImage ? (
              <div className="image-dropzone" onClick={triggerFileSelect}>
                <span className="dropzone-icon">📸</span>
                <p>Cliquez pour prendre une photo ou importer un fichier</p>
                <small className="dropzone-sub">Supporte JPG, PNG</small>
              </div>
            ) : (
              <div className="image-preview-wrapper">
                <img src={selectedImage} alt="Plante à analyser" className="image-preview-img" />
                <div className="image-preview-actions">
                  <button type="button" className="btn-sm btn-secondary" onClick={triggerFileSelect}>
                    Changer de photo
                  </button>
                  <button type="button" className="btn-sm btn-danger" onClick={resetImage}>
                    Supprimer
                  </button>
                </div>
              </div>
            )}

            {selectedImage && !loading && (
              <button
                type="button"
                className="btn-primary"
                onClick={handleAnalyzeImage}
                style={{ marginTop: '16px', width: '100%' }}
              >
                🔍 Lancer le diagnostic photo par IA
              </button>
            )}
          </div>
        )}

        {/* ─── Mode d'analyse Texte ─── */}
        {analysisMode === 'text' && (
          <>
            <div className="form-row">
              <label>Décrivez les symptômes observés</label>
              <textarea
                rows={4}
                value={symptoms}
                onChange={(e) => setSymptoms(e.target.value)}
                placeholder="Ex: feuilles jaunies, taches brunes, trous..."
              />
            </div>

            <div className="symptom-chips">
              {SYMPTOM_SUGGESTIONS.map((s) => (
                <button key={s} type="button" className="chip" onClick={() => addSuggestion(s)}>
                  {s}
                </button>
              ))}
            </div>

            {!loading && (
              <button type="button" className="btn-primary" onClick={handleAnalyzeText} style={{ width: '100%' }}>
                Analyser les symptômes par l&apos;IA
              </button>
            )}
          </>
        )}

        {/* ─── État de chargement et d'erreurs ─── */}
        {loading && (
          <div className="sick-loading" style={{ padding: '20px 0' }}>
            <div className="sick-spinner" />
            <p>Analyse en cours par l&apos;IA de Google Gemini...</p>
          </div>
        )}

        {error && (
          <div className="sick-form-error" style={{ marginTop: '16px' }}>
            ⚠️ {error}
          </div>
        )}
      </div>

      {/* ─── Affichage des résultats ─── */}
      {result && (
        <div className={`analysis-result ${result.detected ? 'detected' : 'clear'}`} style={{ animation: 'fadeIn 0.3s ease' }}>
          <h3>{result.message}</h3>
          {result.detected ? (
            <div className="results-list">
              {result.results.map((r, i) => (
                <div key={i} className="result-card">
                  <div className="result-header">
                    <span className={`severity severity-${r.severity?.replace('é', 'e')}`}>{r.severity}</span>
                    <span className="result-type">{r.type}</span>
                  </div>
                  <h4>{r.disease}</h4>
                  <p><strong>Diagnostic :</strong> {r.diagnosis}</p>
                  <p><strong>Remède recommandé :</strong> {r.remedy}</p>
                </div>
              ))}
            </div>
          ) : (
            <ul>
              {result.recommendations?.map((r, i) => <li key={i}>{r}</li>)}
            </ul>
          )}
        </div>
      )}

      <div className="examples-box">
        <h4>Exemples de diagnostics pris en charge</h4>
        <div className="example-grid">
          <div className="example-item">🟡 Chlorose & Carences nutritionnelles</div>
          <div className="example-item">🟤 Mildiou, Oïdium & Maladies fongiques</div>
          <div className="example-item">🕳️ Parasites (pucerons, chenilles, etc.)</div>
        </div>
      </div>
    </div>
  );
}
