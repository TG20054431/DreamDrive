'use strict';

const express = require('express');
const router = express.Router();
const db = require('../db');
const { isAuthenticated } = require('../middleware/auth');

console.log('🚀 FILE PRENOTAZIONI.JS CARICATO');

// GET - Mostra il form di prenotazione
router.get('/', isAuthenticated, (req, res) => {
    const { service, auto: autoId } = req.query;
    
    console.log('=== ROUTE PRENOTAZIONI CHIAMATA ===');
    console.log('Service:', service);
    console.log('User:', req.user ? req.user.email : 'NON AUTENTICATO');
    
    // Query per ottenere tutte le auto disponibili
    const sqlAuto = `SELECT ID_auto, modello, marca, nazione, motore FROM AUTO ORDER BY marca, modello`;
    
    db.all(sqlAuto, [], (err, auto) => {
        if (err) {
            console.error('❌ Errore nel caricamento auto:', err);
            req.flash('error_msg', 'Errore nel caricamento delle auto disponibili');
            return res.redirect('/');
        }
        
        console.log('✅ Auto caricate dal DB:', auto ? auto.length : 0);
        
        res.render('pages/prenotazione', {
            title: 'Prenotazione',
            auto: auto || [],
            service: service || '',
            autoId: autoId || '',
            user: req.user,
            isAuth: req.isAuthenticated(),
            success_msg: req.flash('success_msg'),
            error_msg: req.flash('error_msg')
        });
    });
});

// POST - Elabora la prenotazione
router.post('/', isAuthenticated, (req, res) => {
    const { servizio, auto, data, ora, durata, circuito } = req.body;
    const userId = req.user.ID_utente;
    
    console.log('=== DATI PRENOTAZIONE RICEVUTI ===');
    console.log({ servizio, auto, data, ora, durata, circuito, userId });
    
    // Validazione base
    if (!servizio || !auto || !data || !ora) {
        req.flash('error_msg', 'Tutti i campi obbligatori devono essere compilati');
        return res.redirect('/prenotazioni');
    }
    
    // Converte il tipo servizio per il database
    let tipologiaDb = servizio === 'track-day' ? 'trackday' : servizio;
    const dataCompleta = `${data} ${ora}`;
    
    // Validazione specifica per trackday
    if (tipologiaDb === 'trackday' && !circuito) {
        req.flash('error_msg', 'Per il Track Day è obbligatorio selezionare un circuito');
        return res.redirect('/prenotazioni');
    }
    
    // Query per inserire la prenotazione
    const sqlInsert = `
        INSERT INTO PRENOTAZIONI (ID_utente, ID_auto, tipologia, data, circuito) 
        VALUES (?, ?, ?, ?, ?)
    `;
    
    const params = [userId, auto, tipologiaDb, dataCompleta, circuito || null];
    
    console.log('📝 INSERIMENTO NEL DATABASE...');
    
    db.run(sqlInsert, params, function(err) {
        if (err) {
            console.error('❌ ERRORE INSERIMENTO:', err);
            req.flash('error_msg', 'Errore durante il salvataggio: ' + err.message);
            return res.redirect('/prenotazioni');
        }
        
        console.log('✅ PRENOTAZIONE INSERITA - ID:', this.lastID);
        req.flash('success_msg', 'Prenotazione effettuata con successo!');
        res.redirect('/');
    });
});

module.exports = router;