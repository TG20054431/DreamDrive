'use strict';

const db = require('../../db');

class UtentiDAO {
  constructor(database) {
    this.db = database;
  }

  async getUser(email) {
    const sql = 'SELECT * FROM UTENTE WHERE email = ?';
    return new Promise((resolve, reject) => {
      this.db.get(sql, [email], (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve(row);
        }
      });
    });
  }

  async getUserById(id) {
    const sql = 'SELECT * FROM UTENTE WHERE ID_utente = ?';
    return new Promise((resolve, reject) => {
      this.db.get(sql, [id], (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve(row);
        }
      });
    });
  }
  
  async newUser(user, HashedPassword) {
    const sql =
      'INSERT INTO UTENTE (nome, cognome, email, password, data_nascita, ruolo) VALUES (?, ?, ?, ?, ?, ?)';
    const params = [
      user.nome,
      user.cognome,
      user.email,
      HashedPassword,
      user.data_nascita,
      'utente',
    ];

    return new Promise((resolve, reject) => {
      this.db.run(sql, params, function(err) {
        if (err) {
          reject(err);
        } else {
          resolve({ id: this.lastID });
        }
      });
    });
  }

  async getAllUtenti() {
    const sql = `SELECT ID_utente, nome, cognome, email, data_nascita
                 FROM UTENTE 
                 WHERE ruolo = 'utente'
                 ORDER BY cognome, nome`;

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

  async deleteAccount(utenteId) {
    const sql = 'DELETE FROM UTENTE WHERE ID_utente = ?';
    return new Promise((resolve, reject) => {
      this.db.run(sql, [utenteId], (err) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }

  async updateUserData(userId, nome, cognome, data_nascita) {
    const sql = `UPDATE UTENTE 
                 SET nome = ?, cognome = ?, data_nascita = ?
                 WHERE ID_utente = ?`;
    const params = [nome, cognome, data_nascita, userId];

    return new Promise((resolve, reject) => {
      this.db.run(sql, params, function(err) {
        if (err) {
          reject(err);
        } else {
          resolve(this.changes);
        }
      });
    });
  }

  async updatePassword(userId, newPassword) {
    const sql = `UPDATE UTENTE 
                 SET password = ?
                 WHERE ID_utente = ?`;

    return new Promise((resolve, reject) => {
      this.db.run(sql, [newPassword, userId], function(err) {
        if (err) {
          reject(err);
        } else {
          resolve(this.changes);
        }
      });
    });
  }

  async searchClienti(query) {
    const sql = `SELECT ID_utente, nome, cognome, email, data_nascita
               FROM UTENTE
               WHERE ruolo = 'utente' AND (nome LIKE ? OR cognome LIKE ?)
               ORDER BY cognome, nome`;

    return new Promise((resolve, reject) => {
      this.db.all(sql, [`%${query}%`, `%${query}%`], (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  }
}

module.exports = new UtentiDAO(db);
