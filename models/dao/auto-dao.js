'use strict';

const db = require('../../db');

class AutoDAO {
  constructor(database) {
    this.db = database;
  }

  async getAllAuto() {
    const sql = `SELECT * FROM AUTO ORDER BY marca, modello`;
    return new Promise((resolve, reject) => {
      this.db.all(sql, [], (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  }

  async getAutoById(id) {
    const sql = `SELECT * FROM AUTO WHERE ID_auto = ?`;
    return new Promise((resolve, reject) => {
      this.db.get(sql, [id], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
  }
}

module.exports = new AutoDAO(db); 