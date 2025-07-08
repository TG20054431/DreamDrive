'use strict';

const express = require('express');
const router = express.Router();
const autoDAO = require('../models/dao/auto-dao');
const prenotazioniDAO = require('../models/dao/prenotazioni-dao');

console.log('Route prenotazioni caricata');

// Middleware di controllo autenticazione
function isAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  req.session.returnTo = req.originalUrl;
  req.flash('error', 'Devi effettuare il login per prenotare');
  res.redirect('/auth/login');
}

// Route GET per visualizzare la pagina di prenotazione
router.get('/', async (req, res) => {
  try {
    console.log('=== ACCESSO PAGINA PRENOTAZIONI ===');
    console.log('Query params:', req.query);
    console.log('User:', req.user ? req.user.email : 'Non loggato');
    
    // Carica tutte le auto dal database
    const auto = await autoDAO.getAllAuto();
    console.log('Auto caricate:', auto.length);
    
    if (auto && auto.length > 0) {
      console.log('Prima auto:', auto[0]);
    }
    
    // Rendering della pagina prenotazione
    res.render('pages/prenotazione', {
      title: 'DreamDrive | Prenotazione',
      auto: auto,
      service: req.query.service || '',
      autoId: req.query.auto || '',
      user: req.user || null
    });
    
    console.log('Template renderizzato con successo');
    console.log('=====================================');
    
  } catch (error) {
    console.error('ERRORE nel caricamento delle auto:', error);
    res.render('pages/prenotazione', {
      title: 'DreamDrive | Prenotazione',
      auto: [],
      service: req.query.service || '',
      autoId: req.query.auto || '',
      user: req.user || null,
      error: 'Errore nel caricamento delle auto'
    });
  }
});

// Route POST per creare una prenotazione
router.post('/', isAuthenticated, async (req, res) => {
  try {
    console.log('=== CREAZIONE PRENOTAZIONE ===');
    console.log('Dati ricevuti:', req.body);
    
    const { servizio, auto, data, ora, durata, circuito } = req.body;
    
    // Validazione
    if (!servizio || !auto || !data || !ora) {
      req.flash('error', 'Tutti i campi obbligatori devono essere compilati');
      return res.redirect('/prenotazioni');
    }

    // Verifica che l'auto esista
    const autoData = await autoDAO.getAutoById(auto);
    if (!autoData) {
      req.flash('error', 'Auto selezionata non valida');
      return res.redirect('/prenotazioni');
    }

    // Crea la prenotazione
    const nuovaPrenotazione = {
      ID_utente: req.user.ID_utente,
      ID_auto: parseInt(auto),
      tipologia: servizio,
      data: data,
      ora: ora,
      durata: durata || null,
      circuito: circuito || null,
      stato: 'in_attesa'
    };

    const result = await prenotazioniDAO.insertPrenotazione(nuovaPrenotazione);
    console.log('Prenotazione creata:', result);
    
    req.flash('success', 'Prenotazione effettuata con successo!');
    res.redirect('/utente/dashboard');
    
  } catch (error) {
    console.error('Errore nella creazione della prenotazione:', error);
    req.flash('error', 'Errore nella creazione della prenotazione');
    res.redirect('/prenotazioni');
  }
});

module.exports = router;