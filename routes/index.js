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
      title: 'DreamDrive - Le nostre auto',
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

// Visualizza la pagina servizi
router.get('/servizi', (req, res) => {
  res.render('pages/servizi', {
    title: 'DreamDrive - Servizi',
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
    // Rimozione della validazione per il campo "nome"
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
        return res.redirect('/#contatti');
      }

      const { email, messaggio } = req.body; // Rimosso "nome" dall'estrazione
      await contattiDAO.insertContatto({ email, messaggio }); // Rimosso "nome" dal passaggio al DAO

      req.flash('success', 'Messaggio inviato con successo! Ti contatteremo presto.');
      res.redirect('/#contatti');
    } catch (error) {
      console.error('Errore durante l\'invio del messaggio:', error);
      req.flash('error', 'Si è verificato un errore durante l\'invio del messaggio.');
      res.redirect('/#contatti');
    }
  }
);

// Gestione invio nuove recensioni
router.post('/recensioni/invia', [
  check('valutazione').notEmpty().withMessage('La valutazione è obbligatoria')
    .isInt({ min: 1, max: 5 }).withMessage('La valutazione deve essere un numero da 1 a 5'),
  check('contenuto').notEmpty().withMessage('Il contenuto della recensione è obbligatorio')
    .isLength({ min: 10, max: 500 }).withMessage('Il contenuto deve essere tra 10 e 500 caratteri'),
  check('tipologia').notEmpty().withMessage('La tipologia di servizio è obbligatoria')
], async (req, res) => {
  // Verifica autenticazione
  if (!req.isAuthenticated()) {
    req.flash('error', 'Devi essere autenticato per lasciare una recensione');
    return res.redirect('/auth/login?redirect=/#recensioni');
  }

  // Validazione dei dati
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    req.flash('error', errors.array().map(e => e.msg));
    return res.redirect('/#recensioni');
  }

  try {
    const { valutazione, contenuto, tipologia } = req.body;
    
    // Preparazione dell'oggetto recensione - rimosso il campo nome
    const recensione = {
      ID_utente: req.user.ID_utente,
      tipologia: tipologia,
      valutazione: parseInt(valutazione, 10),
      contenuto: contenuto
    };
    
    // Salvataggio della recensione
    await recensioniDAO.insertRecensione(recensione);
    
    req.flash('success', 'Recensione inviata con successo! Grazie per il tuo feedback.');
    res.redirect('/#recensioni');
  } catch (error) {
    console.error('Errore durante l\'invio della recensione:', error);
    req.flash('error', 'Si è verificato un errore durante l\'invio della recensione.');
    res.redirect('/#recensioni');
  }
});

// Visualizza pagina di errore generica
router.get('/error', (req, res) => {
  res.render('pages/error', {
    title: 'DreamDrive - Errore',
    user: req.user || null,
    isAuth: req.isAuthenticated(),
    errorMessage: res.locals.error || 'Si è verificato un errore imprevisto.',
  });
});

// Visualizza la pagina prenota servizio
router.get('/servizi/prenota', (req, res) => {
  const tipo = req.query.tipo || '';
  
  // Check if user is authenticated
  if (!req.isAuthenticated()) {
    // Redirect to login with return URL
    req.flash('info', 'Accedi per prenotare un servizio');
    return res.redirect(`/auth/login?serviceRedirect=${encodeURIComponent(`/servizi/prenota?tipo=${tipo}`)}`);
  }
  
  // If authenticated, render the booking page
  res.render('pages/prenota', {
    title: 'DreamDrive - Prenota un servizio',
    user: req.user,
    isAuth: req.isAuthenticated(),
    tipoServizio: tipo
  });
});

// Process booking form submission
router.post('/servizi/prenota', [
  check('servizio').notEmpty().withMessage('Il tipo di servizio è obbligatorio'),
  check('auto').notEmpty().withMessage('Seleziona un\'auto'),
  check('data').notEmpty().withMessage('La data è obbligatoria')
], async (req, res) => {
  if (!req.isAuthenticated()) {
    return res.redirect('/auth/login');
  }

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    req.flash('error', errors.array().map(e => e.msg));
    return res.redirect('/servizi/prenota');
  }

  try {
    const { servizio, auto, data, ora, durata, circuito } = req.body;
    
    // TODO: Insert into database using DAO
    // For now just redirect with success message
    req.flash('success', 'Prenotazione effettuata con successo! Ti contatteremo per confermare.');
    res.redirect('/utente/dashboard');
  } catch (error) {
    console.error('Errore nella prenotazione:', error);
    req.flash('error', 'Si è verificato un errore durante la prenotazione.');
    res.redirect('/servizi/prenota');
  }
});

module.exports = router;
module.exports = router;
