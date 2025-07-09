'use strict';

const db = require('../../db');

class ContattiDAO {
  constructor(database) {
    this.db = database;
  }

  async insertContatto(contatto) {
    const sql = `INSERT INTO CONTATTO (email, messaggio) VALUES (?, ?)`;
    const params = [contatto.email, contatto.messaggio];
    return new Promise((resolve, reject) => {
      this.db.run(sql, params, function(err) {
        if (err) reject(err);
        else resolve({ id: this.lastID });
      });
    });
  }

  // Aggiungi questo metodo per recuperare tutti i contatti
  async getAllContatti() {
    const sql = 'SELECT * FROM CONTATTO ORDER BY data DESC';
    return new Promise((resolve, reject) => {
      this.db.all(sql, [], (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  }

  // Aggiungi questo metodo per eliminare un contatto
  async deleteContatto(contattoId) {
    const sql = 'DELETE FROM CONTATTO WHERE ID_contatto = ?';
    return new Promise((resolve, reject) => {
      this.db.run(sql, [contattoId], function (err) {
        if (err) {
          reject(err);
        } else {
          resolve(this.changes);
        }
      });
    });
  }
}

module.exports = new ContattiDAO(db);
