'use strict';

const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const dayjs = require('dayjs');
const bcrypt = require('bcrypt');
const utentiDAO = require('../models/dao/utenti-dao');
const middleware = require('../middleware/permessi');
const prenotazioniDAO = require('../models/dao/prenotazioni-dao');

// Applica middleware di controllo permessi admin
router.use(middleware.isAdmin);

// Rotta di redirect alla dashboard principale
router.get('/dashboard', (req, res) => {
  res.redirect('/admin/dashboard/utenti');
});

// Visualizza dashboard admin con sezioni diverse
router.get('/dashboard/:section', async (req, res) => {
  const section = req.params.section;
  const validSections = [
    'utenti',
    'prenotazioni',
    'noleggi',
    'track-day',
    'impostazioni',
  ];

  if (!validSections.includes(section)) {
    return res.redirect('/admin/dashboard/utenti');
  }

  let utentiFormattati = [];
  let prenotazioni = [];
  let noleggi = [];
  let trackDay = [];

  try {
    if (section === 'utenti') {
      const utenti = await utentiDAO.getAllUtenti();
      utentiFormattati = utenti.map((utente) => {
        utente.data_formattata = dayjs(utente.data_nascita).format('DD/MM/YYYY');
        return utente;
      });
    }

    if (section === 'prenotazioni') {
      prenotazioni = (await prenotazioniDAO.getAllPrenotazioni()) || [];
    }

    if (section === 'noleggi') {
      noleggi = (await prenotazioniDAO.getAllPrenotazioni()).filter(p => p.tipologia === 'noleggio');
    }

    if (section === 'track-day') {
      trackDay = (await prenotazioniDAO.getAllPrenotazioni()).filter(p => p.tipologia === 'trackday');
    }

    res.render('pages/dashboard_admin', {
      title: 'DreamDrive - Dashboard Admin',
      user: req.user,
      utenti: utentiFormattati,
      prenotazioni: prenotazioni,
      noleggi: noleggi,
      trackDay: trackDay,
      utenteSelezionato: null,
      isAuth: req.isAuthenticated(),
      currentSection: section,
    });
  } catch (err) {
    console.error('Errore nel rendering della pagina:', err);
    req.flash('error', 'Errore durante la visualizzazione della dashboard');
    res.redirect('/error');
  }
});

// Visualizza prenotazioni di un utente specifico
router.get('/dashboard/utenti/:utenteId/prenotazioni', async (req, res) => {
  const utenteId = req.params.utenteId;

  try {
    const utenteSelezionato = await utentiDAO.getUserById(utenteId);

    if (!utenteSelezionato) {
      req.flash('error', 'Utente non trovato');
      return res.redirect('/admin/dashboard/utenti');
    }

    const prenotazioni = await prenotazioniDAO.getPrenotazioniByUserId(utenteId);
    utenteSelezionato.prenotazioni = prenotazioni;

    res.render('pages/dashboard_admin', {
      title: 'DreamDrive - Dashboard Admin',
      user: req.user,
      utenteSelezionato: utenteSelezionato,
      isAuth: req.isAuthenticated(),
      currentSection: 'prenotazioni-utente',
    });
  } catch (err) {
    console.error('Errore nel recupero delle prenotazioni:', err);
    req.flash('error', 'Errore nel caricamento delle prenotazioni dell\'utente');
    res.redirect('/admin/dashboard/utenti');
  }
});

// Ricerca utenti
router.get('/dashboard/utenti/ricerca', async (req, res) => {
  const query = req.query.q || '';
  try {
    const utenti = await utentiDAO.searchUtenti(query);
    res.render('pages/dashboard_admin', {
      title: 'DreamDrive - Dashboard Admin',
      user: req.user,
      utenti: utenti,
      isAuth: req.isAuthenticated(),
      currentSection: 'utenti',
    });
  } catch (err) {
    req.flash('error', 'Errore durante la ricerca utenti');
    res.redirect('/admin/dashboard/utenti');
  }
});

// Cerca clienti
router.get('/cerca-clienti', async (req, res) => {
  const query = req.query.q;
  if (!query || query.trim() === '') {
    return res.json([]);
  }

  try {
    const clienti = await utentiDAO.searchClienti(query);
    const clientiFormattati = clienti.map((cliente) => {
      cliente.data_formattata = dayjs(cliente.data_nascita).format('DD/MM/YYYY');
      return cliente;
    });
    res.json(clientiFormattati);
  } catch (err) {
    console.error('Errore nella ricerca dei clienti:', err);
    res.status(500).json({ error: 'Errore nella ricerca dei clienti' });
  }
});

module.exports = router;
