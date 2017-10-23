const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const session = require('express-session');
const fs = require('fs');
const GoogleAuth = require('google-auth-library');

const GOOG = JSON.parse(fs.readFileSync(`${__dirname}/goog.json`));
const BUNDLE = JSON.parse(fs.readFileSync(`${__dirname}/configs/bundles.json`));

const jsonParser = bodyParser.json();
app.set('view engine', 'pug');
app.use('/public', express.static('public'));
app.use(session({
  secret: 'Xrogw5EuoSoFiw8IURirMUHkUO7pIKTq1hxwZvp5',
  resave: false,
  saveUninitialized: false,
}));

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

app.all('/login', jsonParser, (req, res) => {
  if (DEV) {
    res.header('Access-Control-Allow-Origin', '*');
  }

  res.setHeader('content-type', 'application/json');

  if (req.body && req.body.token) {
    const auth = new GoogleAuth();
    const client = new auth.OAuth2(GOOG.clientId, '', '');
    client.verifyIdToken(
      req.body.token,
      GOOG.clientId,
      (e, login) => {
        const payload = login.getPayload();
        const user = {
          email: payload.email,
          picture: payload.picture,
          admin: GOOG.whitelist.indexOf(payload.email) >= 0,
        };
        req.session.user = user;
        res.end(JSON.stringify(user));
      });
  } else {
    res.status(400);
    res.end(JSON.stringify({ error: 'Token not found.', body: req.body }));
  }
});

app.get('/', (req, res) => {
  console.log(`${new Date()}   Request: ${req.url}  User: ${req.session.user}`);
  res.render('index', { user: JSON.stringify(req.session.user || {}), app: BUNDLE['main.min.js'], GOOG });
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