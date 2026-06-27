require('dotenv').config();
const mongoose = require('mongoose');
const app = require('./src/app');

const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/plants-app';

mongoose
  .connect(MONGODB_URI)
  .then(() => {
    console.log('✓ MongoDB connecté avec succès');
    app.listen(PORT, () => {
      console.log(`✓ Serveur backend lancé sur http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('✗ Erreur de connexion MongoDB :', err.message);
    process.exit(1);
  });
