// app.js
import express from 'express';
import bodyParser from 'body-parser';
import { randomBytes } from 'crypto';
import fs from 'fs';
import path from 'path';
import ejs from 'ejs';
import multer from 'multer';  

// (Nur für ESM) __filename und __dirname definieren
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const upload = multer({ dest: 'data/' }); 

function generateRandomID(length = 15) {
  return randomBytes(length).toString('hex').slice(0, length);
}

// ================================
//  Express App
// ================================
const app = express();

// Statische Verzeichnisse (z.B. für index.html in public/)
app.use(express.static(path.join(__dirname, 'public')));
app.use('/js', express.static(path.join(__dirname, 'js')));
app.use('/scripts', express.static(path.join(__dirname, 'scripts')));


app.use(express.json({ limit: '10000kb' }));

app.use(
  bodyParser.text({
    type: ['text/csv', 'text/plain'],
    limit: '10000kb'
  })
);

// Views konfigurieren 
app.set('views', path.join(__dirname, 'public', 'views'));
app.engine('html', ejs.renderFile);
app.set('view engine', 'html');



// ================================
//  Routen
// ================================

app.get('/', (req, res) => {
  res.render('index.html');
});

// POST: experiment-data (CSV)
app.post('/experiment-data', (req, res) => {
  const experimentCSV = req.body;
  const subject_id = generateRandomID();
  const filename = `${subject_id}.csv`;

  const dataDir = path.join(__dirname, 'data');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir);
  }
  const filePath = path.join(dataDir, filename);
  fs.writeFile(filePath, experimentCSV, err => {
    if (err) {
      return res.status(500).send('Fehler beim Speichern der Experiment-Daten');
    }
    return res.status(200).send('Experiment-Daten erfolgreich gespeichert');
  });
});



// ================================
//  Serverstart
// ================================
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`[INFO] Server listening on port ${PORT}`);
});
