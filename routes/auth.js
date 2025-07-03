'use strict';

const express = require('express');
const router = express.Router();
const passport = require('../middleware/passport');
const { check, validationResult } = require('express-validator');
const bcrypt = require('bcrypt');
const utentiDAO = require('../models/dao/utenti-dao');

// Visualizza pagina di login
router.get('/login', (req, res) => {
  if (req.isAuthenticated()) {
    if (req.user.ruolo === 'admin') {
      return res.redirect('/admin/dashboard');
    } else {
      return res.redirect('/utente/dashboard');
    }
  }

  res.render('pages/login', {
    title: 'DreamDrive - Login',
    serviceRedirect: req.query.serviceRedirect || '',
    user: null,
    isAuth: false
  });
});

// Gestisce il processo di login con validazione
router.post(
  '/login',
  [
    check('email').notEmpty().withMessage('Email richiesta').isEmail().withMessage('Email non valida'),
    check('password').notEmpty().withMessage('Password richiesta')
  ],
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const errorMessages = errors.array().map(error => error.msg);
      req.flash('error', errorMessages);
      return res.redirect('/auth/login');
    }

    // Autentica l'utente usando Passport
    passport.authenticate('local', (err, utente, info) => {
      if (err) {
        console.error("Errore durante l'autenticazione:", err);
        req.flash('error', "Si è verificato un errore durante l'accesso.");
        return res.redirect('/auth/login');
      }

      if (!utente) {
        req.flash('error', info && info.message ? info.message : "Credenziali non valide.");
        return res.redirect('/auth/login');
      }

      // Effettua il login e reindirizza in base al ruolo
      req.login(utente, (err) => {
        if (err) {
          console.error("Errore durante il login:", err);
          req.flash('error', 'Errore durante il login.');
          return res.redirect('/auth/login');
        }

        req.flash('success', 'Login effettuato con successo');
        
        // Gestisce il redirect a servizi specifici
        const serviceRedirect = req.body.serviceRedirect;
        if (serviceRedirect && serviceRedirect.trim() !== '') {
          return res.redirect(serviceRedirect);
        }
        
        if (utente.ruolo === 'admin') {
          return res.redirect('/admin/dashboard');
        } else {
          return res.redirect('/utente/dashboard');
        }
      });
    })(req, res, next);
  },
);

// Gestisce il logout dell'utente
router.get('/logout', (req, res) => {
  if (!req.isAuthenticated()) {
    return res.redirect('/auth/login');
  }
  req.logout((err) => {
    if (err) {
      console.error('Errore durante il logout:', err);
      req.flash('error', 'Si è verificato un errore durante il logout.');
      return res.redirect('/auth/login');
    }
    req.flash('success', 'Logout effettuato con successo.');
    res.redirect('/');
  });
});

// Visualizza pagina di registrazione
router.get('/register', (req, res) => {
  if (req.isAuthenticated()) {
    if (req.user.ruolo === 'admin') {
      return res.redirect('/admin/dashboard');
    } else {
      return res.redirect('/utente/dashboard');
    }
  }

  res.render('pages/register', {
    title: 'DreamDrive - Registrazione',
  });
});

// Gestisce il processo di registrazione
router.post(
  '/register',
  [
    check('nome').notEmpty().withMessage('Il nome è richiesto')
      .isLength({ min: 2 }).withMessage('Il nome deve contenere almeno 2 caratteri')
      .matches(/^[A-Za-zÀ-ÖØ-öø-ÿ\s]+$/).withMessage('Il nome deve contenere solo lettere'),
      
    check('cognome').notEmpty().withMessage('Il cognome è richiesto')
      .isLength({ min: 2 }).withMessage('Il cognome deve contenere almeno 2 caratteri')
      .matches(/^[A-Za-zÀ-ÖØ-öø-ÿ\s]+$/).withMessage('Il cognome deve contenere solo lettere'),
      
    check('email').notEmpty().withMessage('Email richiesta')
      .isEmail().withMessage('Inserire una email valida'),
      
    check('data_nascita').isDate().withMessage('Data di nascita richiesta'),
      
    check('password')
      .isLength({ min: 6 })
      .withMessage('La password deve contenere almeno 6 caratteri'),
      
    check('conferma_password').custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error('Le password non coincidono');
      }
      return true;
    }),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      // Gestire gli errori di validazione
      const errorMessages = errors.array().map((error) => error.msg);
      req.flash('error', errorMessages);
      return res.redirect('/auth/register');
    }

    try {
      // Controlla se l'email è già in uso
      const existingUser = await utentiDAO.getUser(req.body.email);
      if (existingUser) {
        req.flash('error', 'Email già registrata.');
        return res.redirect('/auth/register');
      }

      // Hash della password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(req.body.password, salt);

      // Crea il nuovo utente
      await utentiDAO.newUser(
        {
          nome: req.body.nome,
          cognome: req.body.cognome,
          email: req.body.email,
          data_nascita: req.body.data_nascita,
          ruolo: 'utente' // Imposta il ruolo predefinito come "utente"
        },
        hashedPassword,
      );

      req.flash('success', 'Registrazione completata! Ora puoi effettuare il login.');
      res.redirect('/auth/login');
    } catch (err) {
      console.error('Errore nella registrazione:', err);
      req.flash('error', 'Si è verificato un errore durante la registrazione.');
      res.redirect('/auth/register');
    }
  },
);

module.exports = router;
