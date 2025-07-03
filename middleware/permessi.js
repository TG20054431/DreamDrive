'use strict';

// Middleware per verificare se l'utente è admin
exports.isAdmin = (req, res, next) => {
  // Verifica se l'utente è autenticato
  if (!req.isAuthenticated()) {
    req.flash('error', 'Effettuare il login per accedere a questa pagina.');
    return res.redirect('/auth/login');
  }

  // Verifica se l'utente ha ruolo admin
  if (req.user.ruolo === 'admin') {
    return next();
  }

  req.flash('error', 'Non hai i permessi necessari per accedere a questa pagina.');
  res.redirect('/error');
};

// Middleware per verificare se l'utente è utente
exports.isUtente = (req, res, next) => {
  if (req.isAuthenticated() && req.user.ruolo === 'utente') {
    return next();
  } else {
    req.flash('error', 'Accesso riservato agli utenti.');
    res.redirect('/auth/login');
  }
};
