'use strict';

const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const dayjs = require('dayjs');
const bcrypt = require('bcrypt');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const utentiDAO = require('../models/dao/utenti-dao');
const middleware = require('../middleware/permessi');
const prenotazioniDAO = require('../models/dao/prenotazioni-dao');
const autoDAO = require('../models/dao/auto-dao');
const recensioniDAO = require('../models/dao/recensioni-dao');
const contattiDAO = require('../models/dao/contatti-dao');

// Configurazione di Multer per il caricamento delle immagini
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = path.join(__dirname, '../public/uploads/auto');
    
    // Crea la directory se non esiste
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    // Genera un nome file univoco con timestamp
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, 'auto-' + uniqueSuffix + ext);
  }
});

// Filtra i tipi di file accettati (solo immagini)
const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Tipo di file non supportato. Accettiamo solo JPG, PNG e WEBP.'), false);
  }
};

const upload = multer({ 
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // Limite di 5MB
  }
});

// Applica middleware di controllo permessi admin
router.use(middleware.isAdmin);

// Rotta di redirect alla dashboard principale
router.get('/dashboard', (req, res) => {
  res.redirect('/admin/dashboard/prenotazioni');
});

// Visualizza dashboard admin con sezioni diverse
router.get('/dashboard/:section', async (req, res) => {
  const section = req.params.section;
  const validSections = [
    'prenotazioni',
    'auto',
    'recensioni',
    'utenti',
    'impostazioni',
    'contatti'
  ];

  if (!validSections.includes(section)) {
    return res.redirect('/admin/dashboard/prenotazioni');
  }

  let utentiFormattati = [];
  let prenotazioni = [];
  let autos = [];
  let recensioni = [];
  let contatti = [];

  try {
    if (section === 'utenti') {
      const utenti = await utentiDAO.getAllUtenti();
      utentiFormattati = utenti.map((utente) => {
        utente.data_formattata = dayjs(utente.data_nascita).format('DD/MM/YYYY');
        return utente;
      });
    }

    if (section === 'prenotazioni') {
      try {
        prenotazioni = await prenotazioniDAO.getAllPrenotazioni();
        console.log('Prenotazioni caricate:', prenotazioni.length);
      } catch (error) {
        console.error('Errore nel caricamento prenotazioni:', error);
        prenotazioni = [];
      }
    }

    if (section === 'auto') {
      console.log('Caricamento sezione auto...');
      autos = await autoDAO.getAllAuto();
      console.log('Auto caricate:', autos.length);
    }

    if (section === 'recensioni') {
      console.log('Caricamento sezione recensioni...');
      recensioni = await recensioniDAO.getAllRecensioni();
      console.log('Recensioni caricate:', recensioni.length);
    }

    if (section === 'contatti') {
      console.log('Caricamento sezione contatti...');
      contatti = await contattiDAO.getAllContatti();
      console.log('Contatti caricati:', contatti.length);
    }

    // Render unico per tutte le sezioni
    res.render('pages/dashboard_admin', {
      title: 'DreamDrive - Dashboard Admin',
      user: req.user,
      utenti: utentiFormattati,
      prenotazioni: prenotazioni,
      autos: autos,
      recensioni: recensioni,
      contatti: contatti,
      utenteSelezionato: null,
      isAuth: req.isAuthenticated(),
      currentSection: section,
    });
  } catch (err) {
    console.error('Errore nel rendering della pagina:', err);
    req.flash('error', 'Errore durante la visualizzazione della dashboard');
    res.redirect('/error');
  }
});

// Visualizza prenotazioni di un utente specifico
router.get('/dashboard/utenti/:utenteId/prenotazioni', async (req, res) => {
  const utenteId = req.params.utenteId;

  try {
    const utenteSelezionato = await utentiDAO.getUserById(utenteId);

    if (!utenteSelezionato) {
      req.flash('error', 'Utente non trovato');
      return res.redirect('/admin/dashboard/utenti');
    }

    const prenotazioni = await prenotazioniDAO.getPrenotazioniByUserId(utenteId);
    utenteSelezionato.prenotazioni = prenotazioni;

    res.render('pages/dashboard_admin', {
      title: 'DreamDrive - Dashboard Admin',
      user: req.user,
      utenteSelezionato: utenteSelezionato,
      isAuth: req.isAuthenticated(),
      currentSection: 'prenotazioni-utente',
    });
  } catch (err) {
    console.error('Errore nel recupero delle prenotazioni:', err);
    req.flash('error', 'Errore nel caricamento delle prenotazioni dell\'utente');
    res.redirect('/admin/dashboard/utenti');
  }
});

// Ricerca utenti
router.get('/dashboard/utenti/ricerca', async (req, res) => {
  const query = req.query.q || '';
  try {
    const utenti = await utentiDAO.searchUtenti(query);
    res.render('pages/dashboard_admin', {
      title: 'DreamDrive - Dashboard Admin',
      user: req.user,
      utenti: utenti,
      isAuth: req.isAuthenticated(),
      currentSection: 'utenti',
    });
  } catch (err) {
    req.flash('error', 'Errore durante la ricerca utenti');
    res.redirect('/admin/dashboard/utenti');
  }
});

// Cerca clienti
router.get('/cerca-clienti', async (req, res) => {
  const query = req.query.q;
  if (!query || query.trim() === '') {
    return res.json([]);
  }

  try {
    const clienti = await utentiDAO.searchClienti(query);
    const clientiFormattati = clienti.map((cliente) => {
      cliente.data_formattata = dayjs(cliente.data_nascita).format('DD/MM/YYYY');
      return cliente;
    });
    res.json(clientiFormattati);
  } catch (err) {
    console.error('Errore nella ricerca dei clienti:', err);
    res.status(500).json({ error: 'Errore nella ricerca dei clienti' });
  }
});

// ROTTE PER GESTIONE AUTO

// Aggiunta di una nuova auto
router.post('/auto/add', upload.single('immagine'), async (req, res) => {
  try {
    // Estrai il nome del file dall'upload
    const immagineFilename = req.file.filename;
    
    // Crea oggetto auto
    const nuovaAuto = {
      marca: req.body.marca,
      modello: req.body.modello,
      nazione: req.body.nazione,
      motore: req.body.motore,
      immagine: immagineFilename
    };
    
    // Salva nel database
    await autoDAO.insertAuto(nuovaAuto);
    
    req.flash('success', 'Auto aggiunta con successo!');
    res.redirect('/admin/dashboard/auto');
  } catch (error) {
    console.error('Errore nell\'aggiunta dell\'auto:', error);
    req.flash('error', 'Errore nell\'aggiunta dell\'auto');
    res.redirect('/admin/dashboard/auto');
  }
});

// Modifica di un'auto esistente
router.post('/auto/edit', upload.single('immagine'), async (req, res) => {
  try {
    const autoId = req.body.id_auto;
    const autoEsistente = await autoDAO.getAutoById(autoId);
    
    if (!autoEsistente) {
      req.flash('error', 'Auto non trovata');
      return res.redirect('/admin/dashboard/auto');
    }
    
    // Crea oggetto con i dati aggiornati
    const autoAggiornata = {
      marca: req.body.marca,
      modello: req.body.modello,
      nazione: req.body.nazione,
      motore: req.body.motore,
    };
    
    // Se è stata caricata una nuova immagine
    if (req.file) {
      autoAggiornata.immagine = req.file.filename;
      
      // Elimina il vecchio file immagine se esiste
      if (autoEsistente.immagine) {
        const vecchioFile = path.join(__dirname, '../public/uploads/auto', autoEsistente.immagine);
        if (fs.existsSync(vecchioFile)) {
          fs.unlinkSync(vecchioFile);
        }
      }
    }
    
    // Aggiorna nel database
    await autoDAO.updateAuto(autoId, autoAggiornata);
    
    req.flash('success', 'Auto aggiornata con successo!');
    res.redirect('/admin/dashboard/auto');
  } catch (error) {
    console.error('Errore nell\'aggiornamento dell\'auto:', error);
    req.flash('error', 'Errore nell\'aggiornamento dell\'auto');
    res.redirect('/admin/dashboard/auto');
  }
});

// Eliminazione di un'auto
router.post('/auto/:id/delete', async (req, res) => {
  try {
    const autoId = req.params.id;
    const autoEsistente = await autoDAO.getAutoById(autoId);
    
    if (!autoEsistente) {
      req.flash('error', 'Auto non trovata');
      return res.redirect('/admin/dashboard/auto');
    }
    
    // Elimina l'immagine dal filesystem
    if (autoEsistente.immagine) {
      const filePath = path.join(__dirname, '../public/uploads/auto', autoEsistente.immagine);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }
    
    // Elimina dal database
    await autoDAO.deleteAuto(autoId);
    
    req.flash('success', 'Auto eliminata con successo!');
    res.redirect('/admin/dashboard/auto');
  } catch (error) {
    console.error('Errore nell\'eliminazione dell\'auto:', error);
    req.flash('error', 'Errore nell\'eliminazione dell\'auto');
    res.redirect('/admin/dashboard/auto');
  }
});

// ROTTE PER GESTIONE RECENSIONI

// Eliminazione di una recensione - cambiata da DELETE a POST
router.post('/recensioni/elimina', async (req, res) => {
  try {
    const { recensioneId } = req.body;
    console.log('Eliminazione recensione ID:', recensioneId);
    
    if (!recensioneId) {
      req.flash('error', 'ID recensione mancante');
      return res.redirect('/admin/dashboard/recensioni');
    }
    
    await recensioniDAO.deleteRecensione(recensioneId);
    req.flash('success', 'Recensione eliminata con successo.');
    res.redirect('/admin/dashboard/recensioni');
  } catch (error) {
    console.error("Errore durante l'eliminazione della recensione:", error);
    req.flash('error', "Errore durante l'eliminazione della recensione.");
    res.redirect('/admin/dashboard/recensioni');
  }
});

// ROTTE PER GESTIONE PRENOTAZIONI

// Approvazione prenotazione
router.post('/prenotazioni/:id/approva', async (req, res) => {
  try {
    const prenotazioneId = req.params.id;
    await prenotazioniDAO.approvaPrenotazione(prenotazioneId);
    res.json({ success: true });
  } catch (error) {
    console.error('Errore nell\'approvazione della prenotazione:', error);
    res.json({ success: false });
  }
});

// Eliminazione prenotazione
router.post('/prenotazioni/:id/elimina', async (req, res) => {
  try {
    const prenotazioneId = req.params.id;
    await prenotazioniDAO.deletePrenotazione(prenotazioneId);
    req.flash('success', 'Prenotazione eliminata con successo');
    res.redirect('/admin/dashboard/prenotazioni');
  } catch (error) {
    console.error('Errore nell\'eliminazione della prenotazione:', error);
    req.flash('error', 'Errore nell\'eliminazione della prenotazione');
    res.redirect('/admin/dashboard/prenotazioni');
  }
});

// Cambio password dell'admin
router.put('/account/cambia-password', [
  check('password_attuale').notEmpty().withMessage('La password attuale è obbligatoria'),
  check('nuova_password')
    .notEmpty()
    .withMessage('La nuova password è obbligatoria')
    .isLength({ min: 8 })
    .withMessage('La password deve essere lunga almeno 8 caratteri'),
  check('conferma_password')
    .notEmpty()
    .withMessage('La conferma password è obbligatoria')
    .custom((value, { req }) => {
      if (value !== req.body.nuova_password) {
        throw new Error('Le password non coincidono');
      }
      return true;
    }),
], async (req, res) => {
  const { password_attuale, nuova_password } = req.body;
  const errors = validationResult(req);
  
  try {
    if (!errors.isEmpty()) {
      req.flash('error', errors.array());
      return res.redirect('/admin/dashboard/impostazioni');
    }
    
    const user = await utentiDAO.getUserById(req.user.id);
    const isMatch = await bcrypt.compare(password_attuale, user.password);
    
    if (!isMatch) {
      req.flash('error', 'La password attuale non è corretta');
      return res.redirect('/admin/dashboard/impostazioni');
    }
    
    const hashedPassword = await bcrypt.hash(nuova_password, 10);
    await utentiDAO.updatePassword(req.user.id, hashedPassword);
    
    req.flash('success', 'Password aggiornata con successo');
    res.redirect('/admin/dashboard/impostazioni');
  } catch (error) {
    console.error('Errore durante il cambio password:', error);
    req.flash('error', 'Si è verificato un errore durante il cambio password');
    res.redirect('/admin/dashboard/impostazioni');
  }
});

// Nuova rotta per prenotazioni
router.get('/dashboard/prenotazioni', async (req, res) => {
    try {
        // Verifica che sia admin
        if (!req.session.user || req.session.user.ruolo !== 'admin') {
            req.flash('error', 'Accesso negato');
            return res.redirect('/auth/login');
        }

        // Recupera tutte le prenotazioni
        const prenotazioni = await prenotazioniDAO.getAllPrenotazioniForAdmin();
        
        res.render('pages/dashboard_admin', {
            user: req.session.user,
            isAuth: true,
            currentSection: 'prenotazioni',
            prenotazioni: prenotazioni
        });
        
    } catch (error) {
        console.error('Errore nel caricamento prenotazioni admin:', error);
        req.flash('error', 'Errore nel caricamento delle prenotazioni');
        res.redirect('/admin/dashboard');
    }
});

// ROTTE PER GESTIONE CONTATTI

// Eliminazione di un contatto
router.post('/contatti/:id/elimina', async (req, res) => {
  try {
    const contattoId = req.params.id;
    await contattiDAO.deleteContatto(contattoId);
    req.flash('success', 'Contatto eliminato con successo');
    res.redirect('/admin/dashboard/contatti');
  } catch (error) {
    console.error('Errore nell\'eliminazione del contatto:', error);
    req.flash('error', 'Errore nell\'eliminazione del contatto');
    res.redirect('/admin/dashboard/contatti');
  }
});

// Eliminazione di un utente
router.post('/utenti/elimina', middleware.isAdmin, async (req, res) => {
    const redirectUrl = req.body.redirect || '/admin/dashboard/utenti';
    
    try {
        const userId = req.body.userId;
        
        console.log('Request body:', req.body); // Debug
        console.log('User ID da eliminare:', userId);
        console.log('Redirect URL:', redirectUrl);
        
        if (!userId) {
            req.flash('error', 'ID utente mancante');
            return res.redirect(redirectUrl);
        }

        // Verifica che l'utente non stia eliminando se stesso
        if (userId == req.user.ID_utente) {
            req.flash('error', 'Non puoi eliminare il tuo stesso account');
            return res.redirect(redirectUrl);
        }

        // Usa il DAO per eliminare l'utente (che gestisce automaticamente i record correlati)
        const result = await utentiDAO.deleteUser(userId);
        
        if (result) {
            req.flash('success', 'Utente eliminato con successo');
        } else {
            req.flash('error', 'Utente non trovato');
        }
        
    } catch (error) {
        console.error('Errore durante eliminazione utente:', error);
        req.flash('error', 'Errore durante l\'eliminazione dell\'utente');
    }
    
    res.redirect(redirectUrl);
});

module.exports = router;
