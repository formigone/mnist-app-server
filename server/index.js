const compression = require('compression');
const morgan = require('morgan');
const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const fs = require('fs');
const GoogleAuth = require('google-auth-library');

const { fetchSummaries, fetchDigit, deleteDigits, updateDigit } = require('./db');

const app = express();

const GOOG = JSON.parse(fs.readFileSync(`${__dirname}/../goog.json`));
const BUNDLE = JSON.parse(fs.readFileSync(`${__dirname}/../configs/bundles.json`));

const jsonParser = bodyParser.json();

app.use(compression());
app.use(morgan('combined'));
app.set('view engine', 'pug');
app.use('/public', express.static('public'));
app.use(session({
  secret: 'Xrogw5EuoSoFiw8IURirMUHkUO7pIKTq1hxwZvp5',
  resave: false,
  saveUninitialized: false,
}));

const DEV = process.env.APP_ENV === 'development';
const IS_VM = process.env.IS_VM;
const DIGITS_PATH = `${__dirname}/../public/img`;
const BATCH_SIZE = 25;

app.post('/v1', jsonParser, (req, res) => {
  let filename = `${Date.now()}-${Math.random() * 100 | 0}`;
  const body = req.body;
  if (body) {
    if (!Array.isArray(body.digits)) {
      body.digits = [Object.assign({}, body)];
    }

    body.digits.forEach((digit, i) => {
      if (i > 0) {
        filename = `${Date.now()}-${Math.random() * 100 | 0}`;
      }

      fs.writeFile(`${DIGITS_PATH}/${filename}-digit.json`, JSON.stringify(digit), (err) => {
        if (err) {
          console.error(err);
        }
      });
    });
  }
  res.setHeader('content-type', 'application/json');
  res.end(JSON.stringify({ status: 'success', key: filename }));
});

app.get('/digits', (req, res) => {
  res.setHeader('content-type', 'application/json');
  fetchSummaries()
    .then((digits) => {
      res.end(JSON.stringify(digits));
    })
    .catch((error) => {
      console.error(error);
      res.status(500);
      res.end(JSON.stringify({ error: 'Something went wrong.'}));
    })
});

app.delete('/digit', jsonParser, (req, res) => {
  res.setHeader('content-type', 'application/json');
  if (!req.session.user.admin) {
    res.status(403);
    res.end(JSON.stringify({ error: 'Unauthorized action.' }));
    return;
  }

  const ids = (req.body || []).map((id) => Number(id || 0));
  if (ids.length === 0) {
    res.status(400);
    res.end(JSON.stringify({ error: 'Invalid items.' }));
    return;
  }

  deleteDigits(ids)
    .then(() => {
      res.end(JSON.stringify({ success: `Deleted ${ids.length} item(s)` }));
    })
    .catch((error) => {
      console.error(error);
      res.status(500);
      res.end(JSON.stringify({ error: 'Could not delete file(s).' }));
    });
});

app.put('/digit', jsonParser, (req, res) => {
  res.setHeader('content-type', 'application/json');
  if (!req.session.user.admin) {
    res.status(403);
    res.end(JSON.stringify({ error: 'Unauthorized action.' }));
    return;
  }

  const id = Number(req.body.id || 0);
  const actual = Number(req.body.actual || 0);

  updateDigit(id, actual)
    .then(() => res.end(JSON.stringify({ success: true })))
    .catch((error) => {
      console.error(error);
      res.status(404);
      res.end(JSON.stringify({ error: 'Unable to update digit.' }));
    });
});

app.get('/digit/:id', (req, res) => {
  res.setHeader('content-type', 'application/json');
  const id = Number(req.params.id || 0);

  fetchDigit(id)
    .then((digit) => res.end(JSON.stringify(digit)))
    .catch((error) => {
      console.error(error);
      res.status(404);
      res.end(JSON.stringify({ error: 'Digit not found.' }));
    });
});

app.all('/logout', (req, res) => {
  req.session.user = {};
  req.session.destroy((err) => {
    res.setHeader('content-type', 'application/json');
    res.end(JSON.stringify({ user: req.session }));
  });
});

app.all('/login', jsonParser, (req, res) => {
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
  const VM = PORT === 8089;
  const user = VM ? {
      "email": "rsilveira@deseretdigital.com",
      "picture": "https://lh4.googleusercontent.com/-28Ei_gtCvTY/AAAAAAAAAAI/AAAAAAAAF-g/H6FcFwZDRMc/s96-c/photo.jpg",
      "admin": true
    } : (req.session.user || {});

  res.render('index', {
    isAndroid: DEV || Boolean(req.headers['user-agent'].match(/android/i)),
    user: JSON.stringify(user),
    app: (DEV && !IS_VM) ? 'http://localhost:2001/main.min.js' : `/public/js/${BUNDLE['main.min.js']}`,
    GOOG,
    dev: DEV,
    API_HOST: ''
  });
});

app.all('/*', (req, res) => {
  res.setHeader('content-type', 'application/json');
  res.status(404);
  res.end(JSON.stringify({ status: 'error' }));
});

const PORT = Number(process.env.PORT) || 8088;

app.listen(PORT);
console.log(`${new Date()}  Server running on :${PORT}`);
