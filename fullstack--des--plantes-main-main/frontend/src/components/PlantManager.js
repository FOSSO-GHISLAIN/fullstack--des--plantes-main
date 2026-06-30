import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { PLANT_LIBRARY } from '../data/plantLibrary';
import { getDaysSincePlanting } from '../services/plantService';
import { getGrowthStageInfo } from '../data/plantLibrary';

// ─── Constantes ────────────────────────────────────────────────────────────────
const SEVERITY_LABELS = {
  légère: { label: 'Légère', icon: '🟡', color: '#f59e0b' },
  modérée: { label: 'Modérée', icon: '🟠', color: '#f97316' },
  grave: { label: 'Grave', icon: '🔴', color: '#ef4444' },
};

const TREATMENT_STATUS_LABELS = {
  non_traité: { label: 'Non traité', icon: '⏳', color: '#6b7280' },
  en_cours: { label: 'En cours', icon: '💊', color: '#3b82f6' },
  guéri: { label: 'Guéri ✓', icon: '💚', color: '#22c55e' },
};

const SYMPTOM_CHIPS = [
  'Feuilles jaunies',
  'Taches brunes',
  'Trous dans les feuilles',
  'Feuilles flétries',
  'Poudre blanche',
  'Racines pourries',
  'Insectes visibles',
  'Moisissures',
];

// ─── Formulaire plante saine ───────────────────────────────────────────────────
const INITIAL_PLANT_FORM = {
  name: '', type: '', plantedDate: '', soilType: '', waterNeeds: '',
  height: '', leafCount: '', temperature: '22', humidity: '60',
};

// ─── Formulaire plante malade ──────────────────────────────────────────────────
const INITIAL_SICK_FORM = {
  plantName: '',
  species: '',
  symptoms: '',
  severity: 'modérée',
  diagnosisDate: new Date().toISOString().split('T')[0],
  treatment: '',
  treatmentStatus: 'non_traité',
  location: '',
  notes: '',
  photos: [],
};

export default function PlantManager() {
  const {
    plants, addPlant, updatePlant, addGrowthEntry, deletePlant,
    sickPlants, sickPlantsLoading, sickPlantsError,
    addSickPlant, editSickPlant, removeSickPlant,
    sickPlantStats, apiOnline,
  } = useApp();

  // ─── État onglets ────────────────────────────────────────────────────────
  const [activeTab, setActiveTab] = useState('healthy'); // 'healthy' | 'sick'

  // ─── Plantes saines ──────────────────────────────────────────────────────
  const [showForm, setShowForm] = useState(false);
  const [showGrowth, setShowGrowth] = useState(null);
  const [editPlant, setEditPlant] = useState(null);
  const [form, setForm] = useState(INITIAL_PLANT_FORM);
  const [growthForm, setGrowthForm] = useState({
    height: '', leafCount: '', temperature: '22', humidity: '60',
    date: new Date().toISOString().split('T')[0],
  });

  // ─── Plantes malades ─────────────────────────────────────────────────────
  const [showSickForm, setShowSickForm] = useState(false);
  const [editingSickPlant, setEditingSickPlant] = useState(null);
  const [sickForm, setSickForm] = useState(INITIAL_SICK_FORM);
  const [sickFormLoading, setSickFormLoading] = useState(false);
  const [sickFormError, setSickFormError] = useState('');

  // ─── Handlers plantes saines ─────────────────────────────────────────────
  const resetForm = () => {
    setForm(INITIAL_PLANT_FORM);
    setEditPlant(null);
    setShowForm(false);
  };

  const selectFromLibrary = (libPlant) => {
    setForm((f) => ({
      ...f,
      name: libPlant.name,
      type: libPlant.type,
      soilType: libPlant.soilType,
      waterNeeds: libPlant.waterNeeds,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmedName = form.name?.trim();
    if (!trimmedName) return alert('Le nom est requis.');
    if (editPlant) {
      updatePlant(editPlant.id, { ...form, name: trimmedName, height: Number(form.height) || 0, leafCount: Number(form.leafCount) || 0 });
    } else {
      addPlant({ ...form, name: trimmedName });
    }
    resetForm();
  };

  const handleGrowthSubmit = (e) => {
    e.preventDefault();
    addGrowthEntry(showGrowth, growthForm);
    setShowGrowth(null);
    setGrowthForm({ height: '', leafCount: '', temperature: '22', humidity: '60', date: new Date().toISOString().split('T')[0] });
  };

  const startEdit = (plant) => {
    setEditPlant(plant);
    setForm({ ...plant, height: String(plant.height), leafCount: String(plant.leafCount) });
    setShowForm(true);
  };

  // ─── Handlers plantes malades ─────────────────────────────────────────────
  const resetSickForm = () => {
    setSickForm(INITIAL_SICK_FORM);
    setEditingSickPlant(null);
    setShowSickForm(false);
    setSickFormError('');
  };

  const addSymptomChip = (chip) => {
    setSickForm((f) => ({
      ...f,
      symptoms: f.symptoms ? `${f.symptoms}, ${chip}` : chip,
    }));
  };

  const handlePhotoUpload = (e) => {
    const files = Array.from(e.target.files);
    const remaining = 2 - sickForm.photos.length;
    if (remaining <= 0) return;

    const toRead = files.slice(0, remaining);
    toRead.forEach((file) => {
      if (!['image/jpeg', 'image/png'].includes(file.type)) {
        alert('Seules les images JPG et PNG sont acceptées.');
        return;
      }

      const reader = new FileReader();
      reader.onload = (ev) => {
        const img = new Image();
        img.onload = () => {
          // Redimensionner à max 800px en gardant le ratio
          const MAX = 800;
          let { width, height } = img;
          if (width > MAX || height > MAX) {
            if (width > height) { height = Math.round((height * MAX) / width); width = MAX; }
            else { width = Math.round((width * MAX) / height); height = MAX; }
          }
          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);
          // Compression JPEG 70%
          const compressed = canvas.toDataURL('image/jpeg', 0.7);
          setSickForm((f) => ({
            ...f,
            photos: [...f.photos, compressed].slice(0, 2),
          }));
        };
        img.src = ev.target.result;
      };
      reader.readAsDataURL(file);
    });
    e.target.value = '';
  };

  const removePhoto = (index) => {
    setSickForm((f) => ({
      ...f,
      photos: f.photos.filter((_, i) => i !== index),
    }));
  };

  const handleSickSubmit = async (e) => {
    e.preventDefault();
    if (!sickForm.plantName.trim()) {
      setSickFormError('Le nom de la plante est requis.');
      return;
    }
    if (!sickForm.symptoms.trim() || sickForm.symptoms.length < 5) {
      setSickFormError('Veuillez décrire les symptômes (minimum 5 caractères).');
      return;
    }

    setSickFormLoading(true);
    setSickFormError('');

    try {
      if (editingSickPlant) {
        await editSickPlant(editingSickPlant._id, sickForm);
      } else {
        await addSickPlant(sickForm);
      }

      // Si le traitement est défini à guéri, déplacer/mettre à jour la plante dans le dashboard sain
      if (sickForm.treatmentStatus === 'guéri') {
        const plantName = sickForm.plantName?.trim();
        if (plantName) {
          const existingPlant = plants.find(
            (p) => p.name.toLowerCase() === plantName.toLowerCase()
          );
          if (existingPlant) {
            updatePlant(existingPlant.id, { status: 'healthy' });
          } else {
            addPlant({
              name: plantName,
              species: sickForm.species?.trim() || plantName,
              type: sickForm.species?.trim() || 'Autre',
              status: 'healthy',
              height: 0,
              leafCount: 0,
              temperature: 22,
              humidity: 60,
            });
          }
        }
      }
      resetSickForm();
    } catch (err) {
      setSickFormError(err.message || 'Une erreur est survenue.');
    } finally {
      setSickFormLoading(false);
    }
  };

  const startEditSick = (sp) => {
    setEditingSickPlant(sp);
    setSickForm({
      plantName: sp.plantName || '',
      species: sp.species || '',
      symptoms: sp.symptoms || '',
      severity: sp.severity || 'modérée',
      diagnosisDate: sp.diagnosisDate
        ? new Date(sp.diagnosisDate).toISOString().split('T')[0]
        : new Date().toISOString().split('T')[0],
      treatment: sp.treatment || '',
      treatmentStatus: sp.treatmentStatus || 'non_traité',
      location: sp.location || '',
      notes: sp.notes || '',
      photos: sp.photos || [],
    });
    setShowSickForm(true);
  };

  const handleDeleteSick = async (id) => {
    if (!window.confirm('Supprimer cette fiche de plante malade ?')) return;
    try {
      await removeSickPlant(id);
    } catch (err) {
      alert(err.message || 'Erreur lors de la suppression.');
    }
  };

  const handleMarkHealed = async (sp) => {
    try {
      await editSickPlant(sp._id, { treatmentStatus: 'guéri' });

      // Déplacement automatique vers le dashboard des plantes saines
      const plantName = sp.plantName?.trim();
      if (plantName) {
        const existingPlant = plants.find(
          (p) => p.name.toLowerCase() === plantName.toLowerCase()
        );
        if (existingPlant) {
          updatePlant(existingPlant.id, { status: 'healthy' });
        } else {
          addPlant({
            name: plantName,
            species: sp.species?.trim() || plantName,
            type: sp.species?.trim() || 'Autre',
            status: 'healthy',
            height: 0,
            leafCount: 0,
            temperature: 22,
            humidity: 60,
          });
        }
      }
    } catch (err) {
      alert(err.message || 'Erreur lors de la mise à jour.');
    }
  };

  // ─── Rendu ────────────────────────────────────────────────────────────────
  return (
    <div className="plants-section">

      {/* ─── En-tête ─────────────────────────────────────────────────────── */}
      <div className="section-header row">
        <div>
          <h2>🌱 Mes Plantes</h2>
          <p>Gérez vos plantes saines et suivez les plantes malades</p>
        </div>
        <div className="plants-header-actions">
          <button
            type="button"
            className="btn-primary"
            onClick={() => { resetForm(); setActiveTab('healthy'); setShowForm(true); }}
          >
            + Ajouter une plante
          </button>
          <button
            type="button"
            className="btn-danger-outline"
            onClick={() => { resetSickForm(); setActiveTab('sick'); setShowSickForm(true); }}
          >
            🤒 Signaler malade
          </button>
        </div>
      </div>

      {/* ─── Onglets ──────────────────────────────────────────────────────── */}
      <div className="plants-tabs">
        <button
          className={`tab-btn ${activeTab === 'healthy' ? 'active' : ''}`}
          onClick={() => setActiveTab('healthy')}
        >
          🌿 Plantes saines
          <span className="tab-count">{plants.length}</span>
        </button>
        <button
          className={`tab-btn tab-btn-sick ${activeTab === 'sick' ? 'active' : ''}`}
          onClick={() => setActiveTab('sick')}
        >
          🤒 Plantes malades
          <span className="tab-count tab-count-sick">
            {sickPlants.filter((sp) => sp.treatmentStatus !== 'guéri').length}
          </span>
        </button>
      </div>

      {/* ─── Statistiques plantes malades ─────────────────────────────────── */}
      {activeTab === 'sick' && sickPlants.length > 0 && (
        <div className="sick-stats-row">
          <div className="sick-stat-card" style={{ '--sc': '#ef4444' }}>
            <span>🔴</span>
            <div>
              <p className="sick-stat-value">{sickPlantStats.grave}</p>
              <p className="sick-stat-label">Graves</p>
            </div>
          </div>
          <div className="sick-stat-card" style={{ '--sc': '#3b82f6' }}>
            <span>💊</span>
            <div>
              <p className="sick-stat-value">{sickPlantStats.en_cours}</p>
              <p className="sick-stat-label">En traitement</p>
            </div>
          </div>
          <div className="sick-stat-card" style={{ '--sc': '#22c55e' }}>
            <span>💚</span>
            <div>
              <p className="sick-stat-value">{sickPlantStats.guéri}</p>
              <p className="sick-stat-label">Guéries</p>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/*  MODAL — Formulaire plante SAINE                                   */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      {showForm && (
        <div className="modal-overlay" onClick={resetForm}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <h3>{editPlant ? '✏️ Modifier la plante' : '🌱 Nouvelle plante'}</h3>
            <div className="library-quick">
              {PLANT_LIBRARY.slice(0, 4).map((p) => (
                <button key={p.id} type="button" className="chip" onClick={() => selectFromLibrary(p)}>
                  {p.name}
                </button>
              ))}
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-grid">
                <div className="form-row"><label>Nom *</label><input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required /></div>
                <div className="form-row"><label>Type</label><input value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} /></div>
                <div className="form-row"><label>Date plantation</label><input type="date" value={form.plantedDate} onChange={(e) => setForm({ ...form, plantedDate: e.target.value })} /></div>
                <div className="form-row"><label>Type de sol</label><input value={form.soilType} onChange={(e) => setForm({ ...form, soilType: e.target.value })} /></div>
                <div className="form-row"><label>Besoins en eau</label><input value={form.waterNeeds} onChange={(e) => setForm({ ...form, waterNeeds: e.target.value })} /></div>
                <div className="form-row"><label>Hauteur (cm)</label><input type="number" value={form.height} onChange={(e) => setForm({ ...form, height: e.target.value })} /></div>
                <div className="form-row"><label>Nb feuilles</label><input type="number" value={form.leafCount} onChange={(e) => setForm({ ...form, leafCount: e.target.value })} /></div>
                <div className="form-row"><label>Température °C</label><input type="number" value={form.temperature} onChange={(e) => setForm({ ...form, temperature: e.target.value })} /></div>
                <div className="form-row"><label>Humidité %</label><input type="number" value={form.humidity} onChange={(e) => setForm({ ...form, humidity: e.target.value })} /></div>
              </div>
              <div className="modal-actions">
                <button type="submit" className="btn-primary">{editPlant ? 'Mettre à jour' : 'Enregistrer'}</button>
                <button type="button" className="btn-secondary" onClick={resetForm}>Annuler</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── Modal croissance ──────────────────────────────────────────────── */}
      {showGrowth && (
        <div className="modal-overlay" onClick={() => setShowGrowth(null)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <h3>📊 Nouvelle mesure de croissance</h3>
            <form onSubmit={handleGrowthSubmit}>
              <div className="form-grid">
                <div className="form-row"><label>Date</label><input type="date" value={growthForm.date} onChange={(e) => setGrowthForm({ ...growthForm, date: e.target.value })} /></div>
                <div className="form-row"><label>Hauteur (cm)</label><input type="number" required value={growthForm.height} onChange={(e) => setGrowthForm({ ...growthForm, height: e.target.value })} /></div>
                <div className="form-row"><label>Nb feuilles</label><input type="number" required value={growthForm.leafCount} onChange={(e) => setGrowthForm({ ...growthForm, leafCount: e.target.value })} /></div>
                <div className="form-row"><label>Température °C</label><input type="number" value={growthForm.temperature} onChange={(e) => setGrowthForm({ ...growthForm, temperature: e.target.value })} /></div>
                <div className="form-row"><label>Humidité %</label><input type="number" value={growthForm.humidity} onChange={(e) => setGrowthForm({ ...growthForm, humidity: e.target.value })} /></div>
              </div>
              <div className="modal-actions">
                <button type="submit" className="btn-primary">Enregistrer la mesure</button>
                <button type="button" className="btn-secondary" onClick={() => setShowGrowth(null)}>Annuler</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/*  MODAL — 2ème FORMULAIRE : Plante MALADE                           */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      {showSickForm && (
        <div className="modal-overlay" onClick={resetSickForm}>
          <div className="modal-card modal-card-sick" onClick={(e) => e.stopPropagation()}>
            <div className="sick-modal-header">
              <h3>🤒 {editingSickPlant ? 'Modifier la fiche' : 'Signaler une plante malade'}</h3>
              <p>Enregistrez les symptômes et le traitement dans la base de données</p>
            </div>

            {sickFormError && (
              <div className="sick-form-error">⚠️ {sickFormError}</div>
            )}

            <form onSubmit={handleSickSubmit}>
              <div className="form-grid">

                {/* Nom de la plante */}
                <div className="form-row form-row-full">
                  <label>🌿 Nom de la plante *</label>
                  <input
                    value={sickForm.plantName}
                    onChange={(e) => setSickForm({ ...sickForm, plantName: e.target.value })}
                    placeholder="Ex: Basilic, Tomate..."
                    required
                  />
                </div>

                {/* Espèce */}
                <div className="form-row">
                  <label>🔬 Espèce</label>
                  <input
                    value={sickForm.species}
                    onChange={(e) => setSickForm({ ...sickForm, species: e.target.value })}
                    placeholder="Ex: Ocimum basilicum"
                  />
                </div>

                {/* Localisation */}
                <div className="form-row">
                  <label>📍 Localisation</label>
                  <input
                    value={sickForm.location}
                    onChange={(e) => setSickForm({ ...sickForm, location: e.target.value })}
                    placeholder="Ex: Jardin, Balcon, Serre..."
                  />
                </div>

                {/* Date de diagnostic */}
                <div className="form-row">
                  <label>📅 Date de diagnostic *</label>
                  <input
                    type="date"
                    value={sickForm.diagnosisDate}
                    onChange={(e) => setSickForm({ ...sickForm, diagnosisDate: e.target.value })}
                    required
                  />
                </div>

                {/* Gravité */}
                <div className="form-row">
                  <label>⚠️ Gravité *</label>
                  <select
                    value={sickForm.severity}
                    onChange={(e) => setSickForm({ ...sickForm, severity: e.target.value })}
                    className={`severity-select severity-${sickForm.severity.replace('é', 'e')}`}
                  >
                    <option value="légère">🟡 Légère</option>
                    <option value="modérée">🟠 Modérée</option>
                    <option value="grave">🔴 Grave</option>
                  </select>
                </div>

                {/* Symptômes */}
                <div className="form-row form-row-full">
                  <label>🔍 Symptômes observés *</label>
                  <div className="symptom-chips-row">
                    {SYMPTOM_CHIPS.map((chip) => (
                      <button
                        key={chip}
                        type="button"
                        className="chip chip-symptom"
                        onClick={() => addSymptomChip(chip)}
                      >
                        {chip}
                      </button>
                    ))}
                  </div>
                  <textarea
                    rows={3}
                    value={sickForm.symptoms}
                    onChange={(e) => setSickForm({ ...sickForm, symptoms: e.target.value })}
                    placeholder="Décrivez les symptômes observés sur la plante..."
                    required
                  />
                </div>

                {/* Traitement */}
                <div className="form-row form-row-full">
                  <label>💊 Traitement appliqué</label>
                  <textarea
                    rows={2}
                    value={sickForm.treatment}
                    onChange={(e) => setSickForm({ ...sickForm, treatment: e.target.value })}
                    placeholder="Ex: Fongicide, Insecticide, Taille des parties malades..."
                  />
                </div>

                {/* Statut du traitement */}
                <div className="form-row">
                  <label>📋 Statut du traitement</label>
                  <select
                    value={sickForm.treatmentStatus}
                    onChange={(e) => setSickForm({ ...sickForm, treatmentStatus: e.target.value })}
                    className={`treatment-select`}
                  >
                    <option value="non_traité">⏳ Non traité</option>
                    <option value="en_cours">💊 En cours</option>
                    <option value="guéri">💚 Guéri</option>
                  </select>
                </div>

                {/* Notes */}
                <div className="form-row form-row-full">
                  <label>📝 Notes supplémentaires</label>
                  <textarea
                    rows={2}
                    value={sickForm.notes}
                    onChange={(e) => setSickForm({ ...sickForm, notes: e.target.value })}
                    placeholder="Observations, évolution, photos à prendre..."
                  />
                </div>

                {/* Photos */}
                <div className="form-row form-row-full">
                  <label>📸 Photos des symptômes (max 2 — JPG/PNG)</label>
                  {sickForm.photos.length < 2 && (
                    <label className="photo-upload-btn">
                      + Ajouter une photo
                      <input
                        type="file"
                        accept="image/jpeg,image/png"
                        multiple
                        style={{ display: 'none' }}
                        onChange={handlePhotoUpload}
                      />
                    </label>
                  )}
                  {sickForm.photos.length > 0 && (
                    <div className="photo-preview-row">
                      {sickForm.photos.map((src, i) => (
                        <div key={i} className="photo-preview-item">
                          <img src={src} alt={`symptome-${i + 1}`} className="photo-preview-img" />
                          <button
                            type="button"
                            className="photo-remove-btn"
                            onClick={() => removePhoto(i)}
                            title="Supprimer la photo"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

              </div>

              <div className="modal-actions">
                <button
                  type="submit"
                  className="btn-danger"
                  disabled={sickFormLoading}
                >
                  {sickFormLoading
                    ? '⏳ Enregistrement...'
                    : editingSickPlant
                    ? '💾 Mettre à jour'
                    : '🤒 Enregistrer la plante malade'}
                </button>
                <button type="button" className="btn-secondary" onClick={resetSickForm}>
                  Annuler
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/*  CONTENU — Onglet Plantes SAINES                                   */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      {activeTab === 'healthy' && (
        <div className="plants-grid">
          {plants.map((plant) => {
            const days = getDaysSincePlanting(plant.plantedDate);
            const stage = getGrowthStageInfo(plant.name, days);
            return (
              <div key={plant.id} className={`plant-card status-${plant.status}`}>
                <div className="plant-card-header">
                  <span className="plant-emoji">🌿</span>
                  <div>
                    <h3>{plant.name}</h3>
                    <span className="plant-type">{plant.type}</span>
                  </div>
                  <span className={`status-badge ${plant.status}`}>
                    {plant.status === 'healthy' ? 'Saine' : plant.status === 'warning' ? 'Alerte' : 'Malade'}
                  </span>
                </div>
                <div className="plant-metrics">
                  <div><span>📏</span> {plant.height} cm</div>
                  <div><span>🍃</span> {plant.leafCount} feuilles</div>
                  <div><span>🌡️</span> {plant.temperature}°C</div>
                  <div><span>💧</span> {plant.humidity}%</div>
                </div>
                <div className="plant-info-row">
                  <small>🌍 {plant.soilType}</small>
                  <small>💧 {plant.waterNeeds}</small>
                </div>
                {stage && (
                  <div className="stage-reminder">
                    <strong>{stage.stage}</strong>
                    <p>{stage.tasks}</p>
                  </div>
                )}
                <div className="plant-actions">
                  <button type="button" className="btn-sm btn-primary" onClick={() => setShowGrowth(plant.id)}>+ Mesure</button>
                  <button type="button" className="btn-sm btn-secondary" onClick={() => startEdit(plant)}>Modifier</button>
                  <button type="button" className="btn-sm btn-danger" onClick={() => window.confirm('Supprimer ?') && deletePlant(plant.id)}>Supprimer</button>
                </div>
              </div>
            );
          })}
          {plants.length === 0 && (
            <div className="section-empty">
              <p>Aucune plante enregistrée. Commencez par en ajouter une !</p>
            </div>
          )}
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/*  CONTENU — Onglet Plantes MALADES                                  */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      {activeTab === 'sick' && (
        <div>
          {sickPlantsLoading && (
            <div className="sick-loading">
              <div className="sick-spinner" />
              <p>Chargement des données depuis MongoDB...</p>
            </div>
          )}

          {sickPlantsError && (
            <div className="sick-error-banner">
              ⚠️ Erreur de connexion : {sickPlantsError}
              <br />
              <small>Les données sont affichées en mode local.</small>
            </div>
          )}

          <div className="sick-plants-grid">
            {sickPlants.filter((sp) => sp.treatmentStatus !== 'guéri').map((sp) => {
              const sev = SEVERITY_LABELS[sp.severity] || SEVERITY_LABELS['modérée'];
              const trt = TREATMENT_STATUS_LABELS[sp.treatmentStatus] || TREATMENT_STATUS_LABELS['non_traité'];
              const isHealed = sp.treatmentStatus === 'guéri';
              return (
                <div
                  key={sp._id}
                  className={`sick-plant-card sick-${sp.severity?.replace('é', 'e') || 'moderee'} ${isHealed ? 'sick-healed' : ''}`}
                >
                  {/* En-tête carte */}
                  <div className="sick-card-header">
                    <div className="sick-card-title">
                      <span className="sick-plant-icon">🤒</span>
                      <div>
                        <h3>{sp.plantName}</h3>
                        {sp.species && <span className="sick-species">{sp.species}</span>}
                      </div>
                    </div>
                    <div className="sick-badges">
                      <span
                        className="severity-badge"
                        style={{ backgroundColor: sev.color + '22', color: sev.color, borderColor: sev.color + '44' }}
                      >
                        {sev.icon} {sev.label}
                      </span>
                      <span
                        className="treatment-badge"
                        style={{ backgroundColor: trt.color + '22', color: trt.color, borderColor: trt.color + '44' }}
                      >
                        {trt.icon} {trt.label}
                      </span>
                    </div>
                  </div>

                  {/* Méta-infos */}
                  <div className="sick-card-meta">
                    {sp.diagnosisDate && (
                      <span>📅 {new Date(sp.diagnosisDate).toLocaleDateString('fr-FR')}</span>
                    )}
                    {sp.location && <span>📍 {sp.location}</span>}
                  </div>

                  {/* Symptômes */}
                  <div className="sick-symptoms">
                    <strong>🔍 Symptômes :</strong>
                    <p>{sp.symptoms}</p>
                  </div>

                  {/* Traitement */}
                  {sp.treatment && (
                    <div className="sick-treatment">
                      <strong>💊 Traitement :</strong>
                      <p>{sp.treatment}</p>
                    </div>
                  )}

                  {/* Notes */}
                  {sp.notes && (
                    <div className="sick-notes">
                      <strong>📝 Notes :</strong>
                      <p>{sp.notes}</p>
                    </div>
                  )}

                  {/* Photos */}
                  {sp.photos && sp.photos.length > 0 && (
                    <div className="sick-photos">
                      <strong>📸 Photos :</strong>
                      <div className="sick-photos-row">
                        {sp.photos.map((src, i) => (
                          <img
                            key={i}
                            src={src}
                            alt={`symptome-${i + 1}`}
                            className="sick-photo-thumb"
                            onClick={() => window.open(src, '_blank')}
                            title="Cliquer pour agrandir"
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Date de création */}
                  <div className="sick-card-footer">
                    <small>Enregistré le {new Date(sp.createdAt).toLocaleDateString('fr-FR')}</small>
                    {sp.isLocal && <span className="local-badge">📱 Local</span>}
                  </div>

                  {/* Actions */}
                  <div className="plant-actions">
                    {!isHealed && (
                      <button
                        type="button"
                        className="btn-sm btn-heal"
                        onClick={() => handleMarkHealed(sp)}
                        title="Marquer comme guéri"
                      >
                        💚 Guéri
                      </button>
                    )}
                    <button
                      type="button"
                      className="btn-sm btn-secondary"
                      onClick={() => startEditSick(sp)}
                    >
                      ✏️ Modifier
                    </button>
                    <button
                      type="button"
                      className="btn-sm btn-danger"
                      onClick={() => handleDeleteSick(sp._id)}
                    >
                      🗑️ Supprimer
                    </button>
                  </div>
                </div>
              );
            })}

            {sickPlants.filter((sp) => sp.treatmentStatus !== 'guéri').length === 0 && !sickPlantsLoading && (
              <div className="section-empty sick-empty">
                <span className="sick-empty-icon">🌿</span>
                <p>Aucune plante malade enregistrée.</p>
                <p className="sick-empty-sub">
                  Utilisez le bouton{' '}
                  <strong>"🤒 Signaler malade"</strong> pour créer une fiche.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
