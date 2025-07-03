'use strict';

const sqlite = require('sqlite3');
const DB_NAME = process.env.DB_NAME;

// Creazione della connessione al database SQLite
const db = new sqlite.Database('./' + DB_NAME, (err) => {
  if (err) {
    console.log('Errore nella connessione: ', err.message);
  } else {
    console.log('Connessione al database avvenuta con successo...');

    // Attiva i vincoli di chiave esterna per mantenere l'integrità referenziale
    db.run('PRAGMA foreign_keys = ON', (err) => {
      if (err) {
        console.error("Errore nell'attivazione dei vincoli di chiave esterna:", err.message);
      }
    });
  }
});

module.exports = db;
