"use strict";

const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcrypt');
const utentiDAO = require('../models/dao/utenti-dao');

// Configurazione della strategia di autenticazione locale
passport.use(new LocalStrategy({
  usernameField: 'email',
  passwordField: 'password'
}, async (email, password, done) => {
  try {
    // Cerca l'utente nel database
    const user = await utentiDAO.getUser(email);

    // Se non è stato trovato alcun utente con quell'email
    if (!user) {
      return done(null, false, { message: 'Email non registrata.' });
    }

    // Confronta la password
    const match = await bcrypt.compare(password, user.password);

    if (!match) {
      return done(null, false, { message: 'Password errata.' });
    }

    // Restituisce l'utente se ha successo
    return done(null, user);
  } catch (err) {
    return done(err);
  }
}));

// Configurazione della serializzazione/deserializzazione di Passport
passport.serializeUser((user, done) => {
  done(null, user.ID_utente);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await utentiDAO.getUserById(id);
    done(null, user);
  } catch (err) {
    done(err);
  }
});

module.exports = passport;
