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

  // Elimina un utente e tutti i suoi dati correlati
  deleteUser(userId) {
    return new Promise((resolve, reject) => {
      console.log(`Tentativo di eliminazione utente con ID: ${userId}`);
      
      // Prima elimina tutte le recensioni dell'utente
      const deleteRecensioniSql = 'DELETE FROM RECENSIONI WHERE ID_utente = ?';
      
      this.db.run(deleteRecensioniSql, [userId], (err) => {
        if (err) {
          console.error('Errore nell\'eliminazione recensioni:', err);
          reject(err);
          return;
        }
        
        console.log('Recensioni dell\'utente eliminate');
        
        // Poi elimina tutte le prenotazioni dell'utente
        const deletePrenotazioniSql = 'DELETE FROM PRENOTAZIONI WHERE ID_utente = ?';
        
        this.db.run(deletePrenotazioniSql, [userId], (err) => {
          if (err) {
            console.error('Errore nell\'eliminazione prenotazioni:', err);
            reject(err);
            return;
          }
          
          console.log('Prenotazioni dell\'utente eliminate');
          
          // Infine elimina l'utente
          const deleteUserSql = 'DELETE FROM UTENTE WHERE ID_utente = ?';
          
          this.db.run(deleteUserSql, [userId], function(err) {
            if (err) {
              console.error('Errore nell\'eliminazione utente:', err);
              reject(err);
            } else {
              console.log(`Query eseguita. Righe modificate: ${this.changes}`);
              if (this.changes > 0) {
                console.log(`Utente con ID ${userId} eliminato con successo`);
                resolve(true);
              } else {
                console.log(`Nessun utente trovato con ID ${userId}`);
                resolve(false);
              }
            }
          });
        });
      });
    });
  }
}

module.exports = new UtentiDAO(db);
