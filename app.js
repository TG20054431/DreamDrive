'use strict';

const express = require('express');
const session = require('express-session');
const flash = require('connect-flash');
const path = require('path');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const bcrypt = require('bcrypt');

// Import DAO
const utentiDAO = require('./models/dao/utenti-dao');

// Create Express app
const app = express();
const port = process.env.PORT || 3000;

// View engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// Middleware setup
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

// Session configuration
app.use(session({
  secret: 'dreamdrive-secret-key-2024',
  resave: false,
  saveUninitialized: false,
  cookie: { 
    secure: false,
    maxAge: 24 * 60 * 60 * 1000
  }
}));

// Flash messages
app.use(flash());

// Passport setup
app.use(passport.initialize());
app.use(passport.session());

// Passport Local Strategy
passport.use(new LocalStrategy({
  usernameField: 'email',
  passwordField: 'password'
}, async (email, password, done) => {
  try {
    const user = await utentiDAO.getUserByEmail(email);
    if (!user) {
      return done(null, false, { message: 'Email non trovata' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return done(null, false, { message: 'Password non corretta' });
    }

    return done(null, user);
  } catch (error) {
    return done(error);
  }
}));

passport.serializeUser((user, done) => {
  done(null, user.ID_utente);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await utentiDAO.getUserById(id);
    done(null, user);
  } catch (error) {
    done(error);
  }
});

// Global middleware
app.use((req, res, next) => {
  res.locals.user = req.user || null;
  res.locals.success_msg = req.flash('success');
  res.locals.error_msg = req.flash('error');
  res.locals.error = req.flash('error');
  next();
});

// AGGIUNGI QUESTO PRIMA DELLE ROUTE (per debug)
app.use((req, res, next) => {
    console.log(`${req.method} ${req.url}`);
    next();
});



// Import routes
const indexRouter = require('./routes/index');
const authRouter = require('./routes/auth');
const utenteRouter = require('./routes/utente');
const adminRouter = require('./routes/admin');

// AGGIUNGI QUESTO PER VERIFICARE CHE IL FILE ESISTA
console.log('📂 Caricamento route prenotazioni...');
const prenotazioniRouter = require('./routes/prenotazioni');
console.log('✅ Route prenotazioni caricate con successo');

// Route setup - ORDINE IMPORTANTE!
app.use('/', indexRouter);
app.use('/auth', authRouter);
app.use('/auto', require('./routes/auto'));
app.use('/admin', adminRouter);
app.use('/utente', utenteRouter);
app.use('/prenotazioni', prenotazioniRouter); 

// 404 error handler
app.use((req, res, next) => {
  res.status(404).send('Pagina non trovata');
});

// General error handler
app.use((err, req, res, next) => {
  console.error('Errore dell\'applicazione:', err);
  res.status(500).send('Errore del server');
});

// Reindirizza alla pagina di prenotazione corretta
app.get('/prenotazioni', (req, res) => {
    res.redirect('/servizi/prenota');
});

// Oppure renderizza direttamente la pagina
app.get('/prenotazioni', (req, res) => {
    res.render('pages/prenotazione', {
        service: req.query.service || null,
        auto: [], // Dati delle auto dal database
        autoId: req.query.autoId || null
    });
});

// Start server
app.listen(port, () => {
  console.log(`Server DreamDrive avviato su porta ${port}`);
  console.log(`Accedi a: http://localhost:${port}`);
});

module.exports = app;