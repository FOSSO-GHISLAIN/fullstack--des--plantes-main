import React, { useState } from "react";
import axios from "axios";
import "./Dashboard.css";

// Liste des plantes
const initialPlants = [
  { id: 1, name: "Basilic", type: "Herbe", size: 100, date: "2025-01-01" },
  { id: 2, name: "Tomate", type: "Légume", size: 80, date: "2025-01-05" },
  { id: 3, name: "Menthe", type: "Herbe", size: 120, date: "2025-01-10" },
  { id: 4, name: "Chêne", type: "Arbre", size: 150, date: "2025-01-15" },
];

function Dashboard() {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [message, setMessage] = useState("");
  const [isMenuOpen, setIsMenuOpen] = useState(false); // Contrôle du menu
  const [isModalOpen, setIsModalOpen] = useState(false); // Contrôle du modal
  const [plants, setPlants] = useState(initialPlants);
  const [isPlantModalOpen, setIsPlantModalOpen] = useState(false);
  const [newPlant, setNewPlant] = useState({
    name: "",
    type: "",
    size: "",
    date: "",
  });
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [currentPlant, setCurrentPlant] = useState(null);
  const openEditModal = (plant) => {
    setCurrentPlant(plant);
    setIsEditModalOpen(true);
  };

  const closeEditModal = () => {
    setIsEditModalOpen(false);
    setCurrentPlant(null);
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setCurrentPlant((prevPlant) => ({
      ...prevPlant,
      [name]: value,
    }));
  };

  const updatePlant = () => {
    if (!currentPlant.name || !currentPlant.type || !currentPlant.size || !currentPlant.date) {
      alert("Tous les champs sont obligatoires !");
      return;
    }
    setPlants((prevPlants) =>
      prevPlants.map((plant) => (plant.id === currentPlant.id ? currentPlant : plant))
    );
    closeEditModal();
  };
  const togglePlantModal = () => {
    setIsPlantModalOpen((prev) => !prev);
  };

  const handlePlantChange = (e) => {
    const { name, value } = e.target;
    setNewPlant((prevPlant) => ({
      ...prevPlant,
      [name]: value,
    }));
  };

  const addNewPlant = () => {
    // Vérification des champs
    if (!newPlant.name || !newPlant.type || !newPlant.size || !newPlant.date) {
      alert("Tous les champs sont obligatoires !");
      return;
    }

    // Ajout de la nouvelle plante à la liste
    setPlants((prevPlants) => [
      ...prevPlants,
      { ...newPlant, id: Date.now(), size: parseInt(newPlant.size) },
    ]);
    setNewPlant({ name: "", type: "", size: "", date: "" }); // Réinitialiser le formulaire
    setIsPlantModalOpen(false); // Fermer le modal
  };
  const deletePlant = (id) => {
    setPlants((prevPlants) => prevPlants.filter((plant) => plant.id !== id));
  };

  const totalPlants = plants.length;
  const growingPlants = plants.filter((plant) => plant.size < 70).length;
  const maturePlants = plants.filter((plant) => plant.size >= 50).length;
  

  const toggleMenu = () => {
    setIsMenuOpen((prev) => !prev);
  };

  const toggleModal = () => {
    setIsModalOpen((prev) => !prev);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleRegister = async () => {
    try {
      const response = await axios.post("http://localhost:5000/api/register", formData);
      setMessage(response.data.message);
      setIsModalOpen(false); // Fermer le modal après succès
    } catch (error) {
      setMessage(error.response?.data?.message || "Erreur lors de l'enregistrement.");
    }
  };

  return (
    <div className="dashboard-container"  style={{ backgroundImage: `url(${require('./assets/iStock-2193385684.jpg')})`, backgroundSize: 'cover', backgroundPosition: 'center' }}>
      {/* Menu Hamburger */}
      <div className="menu-hamburger">
        <button onClick={toggleMenu} className="hamburger-button">
          ☰
        </button>
        {isMenuOpen && (
          <div className="menu-dropdown">
            <button onClick={toggleModal} className="menu-item">
              Ajouter un utilisateur
            </button>
          </div>
        )}
      </div>

      <header className="header">
        <h1>Suivi de Croissance des Plantes</h1>
      </header>

      <main className="content">
        {/* Section Statistiques */}
        <section className="stats">
          <div className="stat-card">
            <span role="img" aria-label="total">
              🌱
            </span>
            <h2>Total des Plantes : {totalPlants}</h2>
          </div>
          <div className="stat-card">
            <span role="img" aria-label="growing">
              🌿
            </span>
            <h2>En Croissance : {growingPlants}</h2>
          </div>
          <div className="stat-card">
            <span role="img" aria-label="mature">
              🌳
            </span>
            <h2>Matures : {maturePlants}</h2>
          </div>
        </section>

        {/* Section Graphique */}
        <section className="chart">
          <h2>Graphique de Croissance des Plantes</h2>
          <div className="bar-chart">
            {plants.map((plant) => (
              <div
                key={plant.name}
                className="bar"
                style={{ height: `${plant.size}px` }}
              >
                {plant.name}
              </div>
            ))}
          </div>
        </section>

        {/* Section Tableau */}
        <section className="table">
          <h2>Table des Plantes</h2>
          <table>
            <thead>
              <tr>
                <th>Nom</th>
                <th>Type</th>
                <th>temps de croissance (mois)</th>
                <th>Date de mise en culture</th>
                <th>PARAMETRES</th>
              </tr>
            </thead>
            <tbody>
            {plants.map((plant) => (
              <tr key={plant.id}>
                 
                <td>{plant.name}</td>
                <td>{plant.type}</td>
                <td>{plant.size}</td>
                <td>{plant.date}</td>
                <td>
                  <button onClick={() => openEditModal(plant)}>Modifier</button>
                  <button onClick={() => deletePlant(plant.id)}>Supprimer</button>
                </td>
              </tr>
            ))}
          </tbody>
          </table>
          <button onClick={togglePlantModal} className="btn btn-primary">
            Ajouter une nouvelle plante
          </button>
        </section>
      </main>
      {/* Modal pour Ajouter une plante */}
      {isPlantModalOpen && (
        <div className="modal">
          <div className="modal-content">
            <h2>Ajouter une Nouvelle Plante</h2>
            <div className="form-group">
              <label>Nom :</label>
              <input
                type="text"
                name="name"
                value={newPlant.name}
                onChange={handlePlantChange}
                required
              />
            </div>
            <div className="form-group">
              <label>Type :</label>
              <input
                type="text"
                name="type"
                value={newPlant.type}
                onChange={handlePlantChange}
                required
              />
            </div>
            <div className="form-group">
              <label>Taille (cm) :</label>
              <input
                type="number"
                name="size"
                value={newPlant.size}
                onChange={handlePlantChange}
                required
              />
            </div>
            <div className="form-group">
              <label>Date de mise en culture :</label>
              <input
                type="date"
                name="date"
                value={newPlant.date}
                onChange={handlePlantChange}
                required
              />
            </div>
            <button onClick={addNewPlant} className="btn btn-primary">
              Enregistrer
            </button>
            <button onClick={togglePlantModal}className="btn btn-secondary"
            >
              Fermer
            </button>
          </div>
        </div>
      )}

      {/* Modal pour Ajouter un utilisateur */}
      {isModalOpen && (
        <div className="modal">
          <div className="modal-content">
            <h2>Ajouter un utilisateur</h2>
            <div className="form-group">
              <label>Email :</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label>Mot de passe :</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>
            <button onClick={handleRegister} className="btn btn-primary">
              Enregistrer
            </button>
            <button onClick={toggleModal} className="btn btn-secondary">
              Fermer
            </button>
            {message && <p className="message">{message}</p>}
          </div>
        </div>
      )}
      {isEditModalOpen && (
        <div className="modal">
          <div className="modal-content">
            <h2>Modifier la Plante</h2>
            <div className="form-group">
              <label>Nom :</label>
              <input type="text" name="name" value={currentPlant.name} onChange={handleEditChange} />
            </div>
            <div className="form-group">
              <label>Type :</label>
              <input type="text" name="type" value={currentPlant.type} onChange={handleEditChange} />
            </div>
            <div className="form-group">
              <label>Taille (cm) :</label>
              <input type="number" name="size" value={currentPlant.size} onChange={handleEditChange} />
            </div>
            <div className="form-group">
              <label>Date de mise en culture :</label>
              <input type="date" name="date" value={currentPlant.date} onChange={handleEditChange} />
            </div>
            <button onClick={updatePlant} className="btn btn-primary">Mettre à Jour</button>
            <button onClick={closeEditModal} className="btn btn-secondary">Fermer</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Dashboard;
