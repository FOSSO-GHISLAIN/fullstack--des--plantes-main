const fs = require('fs');
const path = require('path');
const jimp = require('jimp');

const assetsDir = path.join(__dirname, 'src', 'assets');

async function compressImages() {
  const files = fs.readdirSync(assetsDir);
  
  for (const file of files) {
    if (file.toLowerCase().endsWith('.jpg') || file.toLowerCase().endsWith('.png') || file.toLowerCase().endsWith('.jpeg')) {
      const filePath = path.join(assetsDir, file);
      try {
        console.log(`Lecture de ${file}...`);
        const image = await jimp.read(filePath);
        
        // Redimensionner si l'image est plus grande que 1280px de large ou de haut
        if (image.bitmap.width > 1280 || image.bitmap.height > 1280) {
          image.scaleToFit(1280, 1280);
        }
        
        // Réduire la qualité à 70% pour les JPEG
        image.quality(70);
        
        await image.writeAsync(filePath);
        console.log(`✅ ${file} compressé avec succès !`);
      } catch (err) {
        console.error(`❌ Erreur avec ${file}:`, err.message);
      }
    }
  }
  console.log("Compression terminée !");
}

compressImages();
