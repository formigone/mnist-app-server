const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const fs = require('fs');

const jsonParser = bodyParser.json();
app.set('view engine', 'pug');
app.use('/public', express.static('public'));

const DEV = process.env.APP_ENV === 'development';

app.post('/v1', jsonParser, (req, res) => {
  console.log(`${new Date()}   POST /v1`);
  if (req.body) {
    fs.writeFile(`/home/rodrigo/mnist-app/img/${Date.now()}-${Math.random() * 100 | 0}-digit.json`, JSON.stringify(req.body), (err) => {
      if (err) {
        console.error(err);
        return;
      }
    });
  }
  res.setHeader('content-type', 'application/json');
  res.end(JSON.stringify({ status: 'success' }));
});

app.get('/digits', (req, res) => {
  if (DEV) {
    res.header('Access-Control-Allow-Origin', '*');
  }
  console.log(`${new Date()}   GET /digits`);
  fs.readdir(`${__dirname}/public/img`, function (err, files) {
    if (err) {
      throw err;
    }

    files = files.map(file => {
      const str = file.match(/(\d+-\d+)/);
      return str ? str[1] : null;
    }).filter(file => file);
    console.log(`${files.length} digits found`);
    res.end(JSON.stringify(files));
  });
});

app.get('/digit/:id', (req, res) => {
  console.log(`${new Date()}   GET /digit/id`);
  const id = String(req.params.id);
  if (!id.match(/\d+-\d+/)) {
    res.status(404);
    res.end(JSON.stringify({ error: 'Invalid digit ID.' }));
    return;
  }

  fs.readFile(`${__dirname}/public/img/${id}-digit.json`, 'utf8', (err, file) => {
    if (DEV) {
      res.header('Access-Control-Allow-Origin', '*');
    }
    if (err) {
      res.status(404);
      res.end(JSON.stringify({ error: 'Unable to load digit.' }));
      return;
    }
    res.end(JSON.stringify(JSON.parse(file)));
  });
});

app.get('/', (req, res) => {
  console.log(`${new Date()}   Request: ${req.url}`);
  res.render('index', {})
});

app.all('/*', (req, res) => {
  console.log(`${new Date()}   Request: ${req.url}`);
  res.setHeader('content-type', 'application/json');
  res.status(404);
  res.end(JSON.stringify({ status: 'error' }));
});

const PORT = process.env.PORT || 8088;
app.listen(PORT);
console.log(`${new Date()}  Server running on :${PORT}`);