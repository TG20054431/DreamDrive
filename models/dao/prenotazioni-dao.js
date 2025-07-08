'use strict';

const db = require('../../db');

class PrenotazioniDAO {
  constructor(database) {
    this.db = database;
  }

  async getPrenotazioniByUserId(userId) {
    const sql = `SELECT * FROM PRENOTAZIONI WHERE ID_utente = ? ORDER BY data DESC`;
    return new Promise((resolve, reject) => {
      this.db.all(sql, [userId], (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  }

  async getPrenotazioneById(id) {
    const sql = `SELECT * FROM PRENOTAZIONI WHERE ID_prenotazione = ?`;
    return new Promise((resolve, reject) => {
      this.db.get(sql, [id], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
  }

  async insertPrenotazione(prenotazione) {
    const sql = `INSERT INTO PRENOTAZIONI (ID_utente, ID_auto, tipologia, data, circuito) VALUES (?, ?, ?, ?, ?)`;
    const params = [prenotazione.ID_utente, prenotazione.ID_auto, prenotazione.tipologia, prenotazione.data, prenotazione.circuito];
    return new Promise((resolve, reject) => {
      this.db.run(sql, params, function(err) {
        if (err) reject(err);
        else resolve({ id: this.lastID });
      });
    });
  }

  async deletePrenotazione(id) {
    const sql = `DELETE FROM PRENOTAZIONI WHERE ID_prenotazione = ?`;
    return new Promise((resolve, reject) => {
      this.db.run(sql, [id], (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
  }

  async getAllPrenotazioni() {
    const sql = `SELECT * FROM PRENOTAZIONI ORDER BY data DESC`;
    return new Promise((resolve, reject) => {
      this.db.all(sql, [], (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  }
}

module.exports = new PrenotazioniDAO(db);