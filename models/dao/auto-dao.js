'use strict';

const db = require('../../db');

console.log('Auto DAO caricato');

// Ottieni tutte le auto
exports.getAllAuto = () => {
    return new Promise((resolve, reject) => {
        const sql = 'SELECT * FROM auto ORDER BY marca, modello';
        console.log('DAO: Eseguendo query getAllAuto:', sql);
        
        db.all(sql, [], (err, rows) => {
            if (err) {
                console.error('DAO ERRORE nel recupero delle auto:', err);
                reject(err);
            } else {
                console.log(`DAO: Trovate ${rows.length} auto nel database`);
                if (rows.length > 0) {
                    console.log('DAO: Prima auto trovata:', rows[0]);
                }
                resolve(rows);
            }
        });
    });
};

// Ottieni un'auto per ID
exports.getAutoById = (autoId) => {
    return new Promise((resolve, reject) => {
        const sql = 'SELECT * FROM auto WHERE ID_auto = ?';
        console.log('DAO: Eseguendo query getAutoById per ID:', autoId);
        
        db.get(sql, [autoId], (err, row) => {
            if (err) {
                console.error('DAO ERRORE nel recupero dell\'auto:', err);
                reject(err);
            } else {
                console.log('DAO: Auto trovata:', row);
                resolve(row);
            }
        });
    });
};

// Inserisci una nuova auto
exports.insertAuto = (auto) => {
    return new Promise((resolve, reject) => {
        const sql = 'INSERT INTO auto (marca, modello, nazione, motore, immagine) VALUES (?, ?, ?, ?, ?)';
        console.log('DAO: Inserimento auto:', auto);
        
        db.run(sql, [auto.marca, auto.modello, auto.nazione, auto.motore, auto.immagine || null], function(err) {
            if (err) {
                console.error('DAO ERRORE nell\'inserimento dell\'auto:', err);
                reject(err);
            } else {
                console.log('DAO: Auto inserita con ID:', this.lastID);
                resolve({ id: this.lastID, changes: this.changes });
            }
        });
    });
};

// Aggiorna un'auto - VERSIONE CORRETTA
exports.updateAuto = (autoId, auto) => {
    return new Promise((resolve, reject) => {
        // Se non viene passata una nuova immagine, mantieni quella esistente
        let sql, params;
        
        if (auto.immagine) {
            sql = 'UPDATE auto SET marca = ?, modello = ?, nazione = ?, motore = ?, immagine = ? WHERE ID_auto = ?';
            params = [auto.marca, auto.modello, auto.nazione, auto.motore, auto.immagine, autoId];
        } else {
            sql = 'UPDATE auto SET marca = ?, modello = ?, nazione = ?, motore = ? WHERE ID_auto = ?';
            params = [auto.marca, auto.modello, auto.nazione, auto.motore, autoId];
        }
        
        console.log('DAO: Aggiornamento auto ID:', autoId, 'con dati:', auto);
        
        db.run(sql, params, function(err) {
            if (err) {
                console.error('DAO ERRORE nell\'aggiornamento dell\'auto:', err);
                reject(err);
            } else {
                console.log('DAO: Auto aggiornata. Righe interessate:', this.changes);
                resolve(this.changes);
            }
        });
    });
};

// Elimina un'auto
exports.deleteAuto = (autoId) => {
    return new Promise((resolve, reject) => {
        const sql = 'DELETE FROM auto WHERE ID_auto = ?';
        console.log('DAO: Eliminazione auto ID:', autoId);
        
        db.run(sql, [autoId], function(err) {
            if (err) {
                console.error('DAO ERRORE nell\'eliminazione dell\'auto:', err);
                reject(err);
            } else {
                console.log('DAO: Auto eliminata. Righe interessate:', this.changes);
                resolve(this.changes);
            }
        });
    });
};