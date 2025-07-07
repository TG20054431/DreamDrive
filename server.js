"use strict";

const express = require("express");
require("dotenv").config();
const session = require("express-session");
const passport = require("passport");
const morgan = require("morgan");
const flash = require("express-flash");

// Importazione delle rotte
const indexRouter = require('./routes/index');
const authRouter = require('./routes/auth');
const utenteRouter = require('./routes/utente');
const adminRouter = require('./routes/admin');

const PORT = process.env.PORT;
const app = express();

// Configurazione middleware di base
app.use(morgan("dev"));
app.use(express.static('public'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Configurazione per ambiente di produzione
const isProd = process.env.NODE_ENV === "production";
app.set('trust proxy', 1);

// Configurazione sessioni
app.use(session({
  secret: process.env.SECRET_SESSION,
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: isProd,
    sameSite: 'strict',
    maxAge: 60 * 60 * 1000 // 1 ora
  }
}));

// Configurazione del motore di template
app.set("view engine", "ejs");

// Configurazione middleware flash e Passport
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());

// Middleware per rendere disponibili i messaggi flash in tutte le viste
app.use((req, res, next) => {
  res.locals.messages = req.flash();
  res.locals.user = req.user || null;
  res.locals.isAuth = req.isAuthenticated();
  next();
});

// Configurazione delle rotte
app.use('/', indexRouter);
app.use('/auth', authRouter);
app.use('/utente', utenteRouter);
app.use('/admin', adminRouter);

// Avvio del server
app.listen(PORT, () => {
  console.log(`Server avviato su http://localhost:${PORT}`);
});
