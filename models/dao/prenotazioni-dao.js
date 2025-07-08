'use strict';

const db = require('../../db');

// Inserisce una nuova prenotazione
const insertPrenotazione = (prenotazione) => {
    return new Promise((resolve, reject) => {
        const sql = `
            INSERT INTO PRENOTAZIONI (ID_utente, ID_auto, tipologia, data, circuito)
            VALUES (?, ?, ?, ?, ?)
        `;
        
        const params = [
            prenotazione.ID_utente,
            prenotazione.ID_auto,
            prenotazione.tipologia,
            prenotazione.data,
            prenotazione.circuito
        ];
        
        db.run(sql, params, function(err) {
            if (err) {
                console.error('Errore nell\'inserimento della prenotazione:', err);
                reject(err);
            } else {
                console.log('Prenotazione inserita con ID:', this.lastID);
                resolve(this.lastID);
            }
        });
    });
};

// Ottiene tutte le prenotazioni
const getAllPrenotazioni = () => {
    return new Promise((resolve, reject) => {
        const sql = `
            SELECT 
                p.ID_prenotazione,
                p.tipologia,
                p.data,
                p.circuito,
                p.stato,
                u.nome as nome_utente,
                u.cognome as cognome_utente,
                u.email,
                a.marca,
                a.modello,
                a.nazione
            FROM PRENOTAZIONI p
            JOIN UTENTI u ON p.ID_utente = u.ID_utente
            JOIN AUTO a ON p.ID_auto = a.ID_auto
            ORDER BY p.data DESC
        `;
        
        db.all(sql, [], (err, rows) => {
            if (err) {
                console.error('Errore nel recupero delle prenotazioni:', err);
                reject(err);
            } else {
                resolve(rows);
            }
        });
    });
};

// Ottiene le prenotazioni per un utente specifico
const getPrenotazioniByUserId = (userId) => {
    return new Promise((resolve, reject) => {
        const sql = `
            SELECT 
                p.ID_prenotazione,
                p.tipologia,
                p.data,
                p.circuito,
                p.stato,
                a.marca,
                a.modello,
                a.nazione
            FROM PRENOTAZIONI p
            JOIN AUTO a ON p.ID_auto = a.ID_auto
            WHERE p.ID_utente = ?
            ORDER BY p.data DESC
        `;
        
        db.all(sql, [userId], (err, rows) => {
            if (err) {
                console.error('Errore nel recupero delle prenotazioni utente:', err);
                reject(err);
            } else {
                resolve(rows);
            }
        });
    });
};

// Elimina una prenotazione
const deletePrenotazione = (prenotazioneId) => {
    return new Promise((resolve, reject) => {
        const sql = 'DELETE FROM PRENOTAZIONI WHERE ID_prenotazione = ?';
        
        db.run(sql, [prenotazioneId], function(err) {
            if (err) {
                console.error('Errore nell\'eliminazione della prenotazione:', err);
                reject(err);
            } else {
                resolve(this.changes);
            }
        });
    });
};

// Approva una prenotazione
const approvaPrenotazione = (prenotazioneId) => {
    return new Promise((resolve, reject) => {
        const sql = 'UPDATE PRENOTAZIONI SET stato = ? WHERE ID_prenotazione = ?';
        
        db.run(sql, ['confermata', prenotazioneId], function(err) {
            if (err) {
                console.error('Errore nell\'approvazione della prenotazione:', err);
                reject(err);
            } else {
                resolve(this.changes);
            }
        });
    });
};

module.exports = {
    insertPrenotazione,
    getAllPrenotazioni,
    getPrenotazioniByUserId,
    deletePrenotazione,
    approvaPrenotazione
};