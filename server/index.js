const compression = require('compression');
const morgan = require('morgan');
const express = require('express');
const http = require('http');
const https = require('https');
const bodyParser = require('body-parser');
const session = require('express-session');
const fs = require('fs');
const GoogleAuth = require('google-auth-library');

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
const APP_LINKS_CERT = `${__dirname}/.well-known/assetlinks.json`;

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
  fs.readdir(DIGITS_PATH, function (err, files) {
    if (err) {
      res.status(404);
      res.end(JSON.stringify({ error: 'Could not find digits map.' }));
    }

    files = files.map(file => {
      const str = file.match(/(\d+-\d+)/);
      return str ? str[1] : null;
    }).filter(file => file);
    console.log(`${files.length} digits found`);
    files = files.reverse();
    res.setHeader('content-type', 'application/json');
    res.end(JSON.stringify(files));
  });
});

function deleteFiles(files, callback){
  const file = files.pop();
  if (!file) {
    callback();
  } else {
    console.log(`Deleting ${file}`);
    fs.unlink(file, (error) => {
      if (error) {
        console.error(error);
        callback(error);
      } else {
        deleteFiles(files, callback);
      }
    });
  }
}

app.delete('/digit', jsonParser, (req, res) => {
  res.setHeader('content-type', 'application/json');
  if (!req.session.user.admin) {
    res.status(403);
    res.end(JSON.stringify({ error: 'Unauthorized action.' }));
    return;
  }

  const files = (req.body || [])
    .filter((file) => file.replace(/[^\d-]/g, ''))
    .filter((file) => file)
    .map((file) => `${DIGITS_PATH}/${file}-digit.json`);

  if (files.length === 0) {
    res.status(400);
    res.end(JSON.stringify({ error: 'Invalid items.' }));
    return;
  }

  deleteFiles(files, (error) => {
    if (error) {
      res.status(500);
      res.end(JSON.stringify({ error: 'Could not delete file(s).' }));
      return;
    }

    res.end(JSON.stringify({ success: `Deleted ${req.body.length} item(s)` }));
  });
});

app.put('/digit', jsonParser, (req, res) => {
  res.setHeader('content-type', 'application/json');
  if (!req.session.user.admin) {
    res.status(403);
    res.end(JSON.stringify({ error: 'Unauthorized action.' }));
    return;
  }

  const { id, correct } = req.body;
  if (!id.match(/\d+-\d+/)) {
    res.status(404);
    res.end(JSON.stringify({ error: 'Invalid digit ID.' }));
    return;
  }

  if (correct === undefined) {
    res.status(400);
    res.end(JSON.stringify({ error: 'Missing required parameter "correct"' }));
    return;
  }

  console.log(`Updating digit ${DIGITS_PATH}/${id}-digit.json`);
  fs.readFile(`${DIGITS_PATH}/${id}-digit.json`, 'utf8', (err, file) => {
    if (err) {
      res.status(404);
      res.end(JSON.stringify({ error: 'Unable to load digit.' }));
      return;
    }

    const digit = JSON.parse(file);
    digit.correct = correct;

    fs.writeFile(`${DIGITS_PATH}/${id}-digit.json`, JSON.stringify(digit), (err) => {
      if (err) {
        res.status(404);
        res.end(JSON.stringify({ error: 'Unable to save digit.' }));
        return;
      }

      res.setHeader('content-type', 'application/json');
      res.end(JSON.stringify({ success: true, digit }));
    });
  });
});

app.put('/digits', jsonParser, (req, res) => {
  res.setHeader('content-type', 'application/json');
  // if (!req.session.user.admin) {
  //   res.status(403);
  //   res.end(JSON.stringify({ error: 'Unauthorized action.' }));
  //   return;
  // }

  const { digits, token } = req.body;

  if (!Array.isArray(digits)) {
    res.status(400);
    res.end(JSON.stringify({ error: 'Invalid payload format.' }));
    return;
  }

  if (!id.match(/\d+-\d+/)) {
    res.status(404);
    res.end(JSON.stringify({ error: 'Invalid digit ID.' }));
    return;
  }

  if (correct === undefined) {
    res.status(400);
    res.end(JSON.stringify({ error: 'Missing required parameter "correct"' }));
    return;
  }

  console.log(`Updating digit ${DIGITS_PATH}/${id}-digit.json`);
  fs.readFile(`${DIGITS_PATH}/${id}-digit.json`, 'utf8', (err, file) => {
    if (err) {
      res.status(404);
      res.end(JSON.stringify({ error: 'Unable to load digit.' }));
      return;
    }

    const digit = JSON.parse(file);
    digit.correct = correct;

    fs.writeFile(`${DIGITS_PATH}/${id}-digit.json`, JSON.stringify(digit), (err) => {
      if (err) {
        res.status(404);
        res.end(JSON.stringify({ error: 'Unable to save digit.' }));
        return;
      }

      res.setHeader('content-type', 'application/json');
      res.end(JSON.stringify({ success: true, digit }));
    });
  });
});

app.get('/digit/:id', (req, res) => {
  const id = String(req.params.id);
  if (!id.match(/\d+-\d+/)) {
    res.status(404);
    res.end(JSON.stringify({ error: 'Invalid digit ID.' }));
    return;
  }

  fs.readFile(`${DIGITS_PATH}/${id}-digit.json`, 'utf8', (err, file) => {
    if (err) {
      res.status(404);
      res.end(JSON.stringify({ error: 'Unable to load digit.' }));
      return;
    }
    res.setHeader('content-type', 'application/json');
    res.end(JSON.stringify(JSON.parse(file)));
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

      console.log(' >> USER: ', user);
      console.log(' >> VM: ', VM);
      console.log(' >> PORT: ', PORT);
  res.render('index', {
    isAndroid: DEV || Boolean(req.headers['user-agent'].match(/android/i)),
    user: JSON.stringify(user),
    app: (DEV && !IS_VM) ? 'http://localhost:2001/main.min.js' : `/public/js/${BUNDLE['main.min.js']}`,
    GOOG,
    dev: DEV,
    API_HOST: ''
  });
});

app.get('/.well-known/assetlinks.json', (req, res) => {
  res.setHeader('content-type', 'application/json');
  fs.readFile(APP_LINKS_CERT, function (err, cert) {
    if (err) {
      res.status(404);
      console.error(err);
      res.end(JSON.stringify({ error: 'Cert not found.' }));
    }

    res.end(cert);
  });
});

app.all('/*', (req, res) => {
  res.setHeader('content-type', 'application/json');
  res.status(404);
  res.end(JSON.stringify({ status: 'error' }));
});

const PORT = Number(process.env.PORT) || 8088;

const sslOptions = {
  key: fs.readFileSync(`${__dirname}/ssl/private.key`),
  cert: fs.readFileSync(`${__dirname}/ssl/certificate.crt`),
};

if (DEV) {
  app.listen(PORT);
} else {
  https.createServer(sslOptions, app).listen(PORT);
}
console.log(`${new Date()}  Server running on :${PORT}`);