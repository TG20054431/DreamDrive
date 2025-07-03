'use strict';

const db = require('../../db');

class ContattiDAO {
  constructor(database) {
    this.db = database;
  }

  async insertContatto(contatto) {
    const sql = `INSERT INTO contatti (nome, email, messaggio) VALUES (?, ?, ?)`;
    const params = [contatto.nome, contatto.email, contatto.messaggio];
    return new Promise((resolve, reject) => {
      this.db.run(sql, params, function(err) {
        if (err) reject(err);
        else resolve({ id: this.lastID });
      });
    });
  }
}

module.exports = new ContattiDAO(db);
