'use strict';

const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const autoDAO = require('../models/dao/auto-dao');
const recensioniDAO = require('../models/dao/recensioni-dao');
const contattiDAO = require('../models/dao/contatti-dao');

// Visualizza la pagina home del sito
router.get('/', async (req, res) => {
  try {
    // Ottiene le recensioni più recenti per la homepage
    const recensioni = await recensioniDAO.getAllRecensioni();
    
    res.render('pages/index', {
      title: 'DreamDrive - Home',
      user: req.user || null,
      isAuth: req.isAuthenticated(),
      recensioni: recensioni
    });
  } catch (err) {
    console.error('Errore nel caricamento delle recensioni per la homepage:', err);
    res.render('pages/index', {
      title: 'DreamDrive - Home',
      user: req.user || null,
      isAuth: req.isAuthenticated(),
      recensioni: []
    });
  }
});

// Visualizza la pagina auto
router.get('/auto', async (req, res) => {
  try {
    const autoList = await autoDAO.getAllAuto();
    res.render('pages/auto', {
      title: 'DreamDrive - Le Nostre Auto',
      user: req.user || null,
      isAuth: req.isAuthenticated(),
      autoList: autoList
    });
  } catch (err) {
    console.error('Errore nel caricamento delle auto:', err);
    req.flash('error', 'Errore durante il caricamento delle auto');
    res.redirect('/error');
  }
});

// Visualizza la pagina dettaglio auto
router.get('/auto/:id', async (req, res) => {
  const autoId = req.params.id;
  try {
    const auto = await autoDAO.getAutoById(autoId);
    if (!auto) {
      req.flash('error', 'Auto non trovata');
      return res.redirect('/auto');
    }
    res.render('pages/dettaglio-auto', {
      title: `DreamDrive - ${auto.marca} ${auto.modello}`,
      user: req.user || null,
      isAuth: req.isAuthenticated(),
      auto: auto
    });
  } catch (err) {
    console.error('Errore nel caricamento del dettaglio auto:', err);
    req.flash('error', 'Errore durante il caricamento del dettaglio auto');
    res.redirect('/auto');
  }
});

// Visualizza la pagina noleggio
router.get('/noleggio', (req, res) => {
  res.render('pages/noleggio', {
    title: 'DreamDrive - Noleggio',
    user: req.user || null,
    isAuth: req.isAuthenticated(),
  });
});

// Visualizza la pagina track-day
router.get('/track-day', (req, res) => {
  res.render('pages/track-day', {
    title: 'DreamDrive - Track Day',
    user: req.user || null,
    isAuth: req.isAuthenticated(),
  });
});

// Visualizza la pagina servizi
router.get('/servizi', (req, res) => {
  res.render('pages/servizi', {
    title: 'DreamDrive - Servizi',
    user: req.user || null,
    isAuth: req.isAuthenticated(),
  });
});

// Visualizza la pagina contatti
router.get('/contatti', (req, res) => {
  res.render('pages/contatti', {
    title: 'DreamDrive - Contatti',
    user: req.user || null,
    isAuth: req.isAuthenticated(),
  });
});

// Visualizza tutte le recensioni pubbliche
router.get('/recensioni', async (req, res) => {
  try {
    const recensioni = await recensioniDAO.getAllRecensioni();
    res.render('pages/recensioni', {
      title: 'DreamDrive - Recensioni',
      recensioni,
      user: req.user || null,
      isAuth: req.isAuthenticated(),
    });
  } catch (error) {
    console.error('Errore durante il recupero delle recensioni:', error);
    req.flash('error', 'Errore durante il recupero delle recensioni');
    res.redirect('/error');
  }
});

// Gestisce l'invio di messaggi di contatto con validazione
router.post(
  '/contatti/invia',
  [
    check('nome')
      .notEmpty()
      .withMessage('Il nome è obbligatorio')
      .isLength({ min: 3 })
      .withMessage('Il nome deve contenere almeno 3 caratteri')
      .matches(/^[A-Za-zÀ-ÖØ-öø-ÿ]+(['\s-][A-Za-zÀ-ÖØ-öø-ÿ]+)*$/)
      .withMessage('Il nome deve contenere solo lettere, spazi e apostrofi'),

    check('email')
      .notEmpty()
      .withMessage("L'email è obbligatoria")
      .isEmail()
      .withMessage('Inserisci un indirizzo email valido'),

    check('messaggio')
      .notEmpty()
      .withMessage('Il messaggio è obbligatorio')
      .custom((value) => {
        if (value.trim().length === 0) {
          throw new Error('Il messaggio non può essere composto solo da spazi');
        }
        return true;
      })
      .isLength({ max: 500 })
      .withMessage('Il messaggio non può superare i 500 caratteri'),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        req.flash('error', errors.array());
        return res.redirect('/contatti');
      }

      // Salva il messaggio nel database
      await contattiDAO.insertContatto({
        nome: req.body.nome,
        email: req.body.email,
        messaggio: req.body.messaggio
      });
      req.flash('success', 'Messaggio inviato con successo! Ti contatteremo presto.');
      res.redirect('/contatti');
    } catch (error) {
      console.error('Errore durante l\'invio del messaggio:', error);
      req.flash('error', 'Si è verificato un errore durante l\'invio del messaggio.');
      res.redirect('/contatti');
    }
  }
);

// Visualizza pagina di errore generica
router.get('/error', (req, res) => {
  res.render('pages/error', {
    title: 'DreamDrive - Errore',
    user: req.user || null,
    isAuth: req.isAuthenticated(),
  });
});

module.exports = router;
