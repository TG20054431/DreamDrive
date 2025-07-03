'use strict';

const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const dayjs = require('dayjs');
const bcrypt = require('bcrypt');
const utentiDAO = require('../models/dao/utenti-dao');
const middleware = require('../middleware/permessi');
const prenotazioniDAO = require('../models/dao/prenotazioni-dao');
const recensioniDAO = require('../models/dao/recensioni-dao');

// Applica middleware di controllo permessi utente
router.use(middleware.isUtente);

// Rotta di redirect alla dashboard principale
router.get('/dashboard', (req, res) => {
  res.redirect('/utente/dashboard/prenotazioni');
});

// Visualizza dashboard utente con sezioni (prenotazioni, noleggi, track-day, impostazioni)
router.get('/dashboard/:section', async (req, res) => {
  const section = req.params.section;
  const validSections = ['prenotazioni', 'noleggi', 'track-day', 'impostazioni'];

  if (!validSections.includes(section)) {
    return res.redirect('/utente/dashboard/prenotazioni');
  }

  let prenotazioni = [];
  let noleggi = [];
  let trackDay = [];
  let recensioni = [];

  try {
    if (section === 'prenotazioni') {
      prenotazioni = await prenotazioniDAO.getPrenotazioniByUserId(req.user.ID_utente);
    }

    if (section === 'noleggi') {
      // Se vuoi separare i noleggi, filtra le prenotazioni per tipologia
      noleggi = (await prenotazioniDAO.getPrenotazioniByUserId(req.user.ID_utente)).filter(p => p.tipologia === 'noleggio');
    }

    if (section === 'track-day') {
      trackDay = (await prenotazioniDAO.getPrenotazioniByUserId(req.user.ID_utente)).filter(p => p.tipologia === 'trackday');
    }

    if (section === 'impostazioni') {
      recensioni = await recensioniDAO.getRecensioniByUserId(req.user.ID_utente);
    }

    res.render('pages/utente', {
      title: 'DreamDrive - Dashboard Utente',
      user: req.user,
      isAuth: req.isAuthenticated(),
      prenotazioni: prenotazioni,
      noleggi: noleggi,
      trackDay: trackDay,
      recensioni: recensioni,
      currentSection: section,
    });
  } catch (err) {
    console.error('Errore nel rendering della pagina:', err);
    req.flash('error', 'Errore durante la visualizzazione della dashboard');
    res.redirect('/error');
  }
});

// Aggiorna dati profilo utente
router.post('/profilo/aggiorna', [
  check('nome').notEmpty().withMessage('Il nome è richiesto'),
  check('cognome').notEmpty().withMessage('Il cognome è richiesto'),
  check('data_nascita').notEmpty().withMessage('La data di nascita è richiesta')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    req.flash('error', errors.array().map(e => e.msg));
    return res.redirect('/utente/dashboard/impostazioni');
  }

  try {
    await utentiDAO.updateUserData(
      req.user.ID_utente,
      req.body.nome,
      req.body.cognome,
      req.body.data_nascita
    );
    
    req.flash('success', 'Profilo aggiornato con successo');
    res.redirect('/utente/dashboard/impostazioni');
  } catch (err) {
    console.error('Errore durante l\'aggiornamento del profilo:', err);
    req.flash('error', 'Errore durante l\'aggiornamento del profilo');
    res.redirect('/utente/dashboard/impostazioni');
  }
});

// Aggiorna password utente
router.post('/password/aggiorna', [
  check('current_password').notEmpty().withMessage('La password attuale è richiesta'),
  check('new_password').isLength({ min: 6 }).withMessage('La nuova password deve contenere almeno 6 caratteri'),
  check('confirm_password').custom((value, { req }) => {
    if (value !== req.body.new_password) {
      throw new Error('Le password non coincidono');
    }
    return true;
  })
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    req.flash('error', errors.array().map(e => e.msg));
    return res.redirect('/utente/dashboard/impostazioni');
  }

  try {
    // Verifica la password attuale
    const isMatch = await bcrypt.compare(req.body.current_password, req.user.password);
    if (!isMatch) {
      req.flash('error', 'La password attuale non è corretta');
      return res.redirect('/utente/dashboard/impostazioni');
    }

    // Hash e salva la nuova password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(req.body.new_password, salt);
    await utentiDAO.updatePassword(req.user.ID_utente, hashedPassword);

    req.flash('success', 'Password aggiornata con successo');
    res.redirect('/utente/dashboard/impostazioni');
  } catch (err) {
    console.error('Errore durante l\'aggiornamento della password:', err);
    req.flash('error', 'Errore durante l\'aggiornamento della password');
    res.redirect('/utente/dashboard/impostazioni');
  }
});

// Elimina account
router.delete('/account/elimina', async (req, res) => {
  try {
    await utentiDAO.deleteAccount(req.user.ID_utente);
    req.logout((err) => {
      if (err) {
        console.error('Errore durante il logout dopo eliminazione account:', err);
      }
      req.flash('success', 'Account eliminato con successo');
      res.redirect('/');
    });
  } catch (err) {
    console.error('Errore durante l\'eliminazione dell\'account:', err);
    req.flash('error', 'Errore durante l\'eliminazione dell\'account');
    res.redirect('/utente/dashboard/impostazioni');
  }
});

module.exports = router;
