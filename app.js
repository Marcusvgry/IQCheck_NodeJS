import express from 'express';
import bodyParser from 'body-parser';
import { randomBytes } from 'crypto';
import fs from 'fs';
import path from 'path';
import ejs from 'ejs';
import multer from 'multer';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);

// Für etwaige Datei-Uploads (falls benötigt)
const upload = multer({ dest: 'data/' });

function generateRandomID(length = 15) {
  return randomBytes(length).toString('hex').slice(0, length);
}

function getCsvFilename(requestedFilename) {
  if (
    typeof requestedFilename === 'string' &&
    /^[a-zA-Z0-9_-]+(?:_lab)?\.csv$/.test(requestedFilename)
  ) {
    return requestedFilename;
  }

  return `${generateRandomID()}.csv`;
}

const app = express();

// Statische Assets
app.use(express.static(path.join(__dirname, 'public')));
app.use('/js',      express.static(path.join(__dirname, 'js')));
app.use('/scripts', express.static(path.join(__dirname, 'scripts')));

// JSON-Body (falls Du mal JSON brauchst)
app.use(express.json({ limit: '10000kb' }));
// CSV- oder Plain-Text-Body
app.use(bodyParser.text({
  type: ['text/csv','text/plain'],
  limit: '10000kb'
}));

// EJS-Templates für index.html
app.set('views', path.join(__dirname, 'public', 'views'));
app.engine('html', ejs.renderFile);
app.set('view engine', 'html');

// Startseite
app.get('/', (req, res) => {
  res.render('index.html');
});

// POST-Endpoint zum Speichern der Experiment-Daten als CSV
app.post('/experiment-data', (req, res) => {
  const experimentCSV = req.body;
  const filename = getCsvFilename(req.get('X-Experiment-Filename'));

  const dataDir = path.join(__dirname, 'data');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  const filePath = path.join(dataDir, filename);
  fs.writeFile(filePath, experimentCSV, err => {
    if (err) {
      console.error('Error saving CSV:', err);
      return res.status(500).send('Fehler beim Speichern der Experiment-Daten');
    }
    res.status(200).send(`Experiment-Daten erfolgreich gespeichert: ${filename}`);
  });
});

// Server starten
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`[INFO] Server listening on port ${PORT}`);
});
