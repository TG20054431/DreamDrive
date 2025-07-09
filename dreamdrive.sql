-- UTENTE
CREATE TABLE UTENTE (
    ID_utente INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT NOT NULL,
    cognome TEXT NOT NULL,
    data_nascita TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    ruolo TEXT NOT NULL CHECK (ruolo IN ('admin', 'utente'))
);

-- AUTO
CREATE TABLE AUTO (
    ID_auto INTEGER PRIMARY KEY AUTOINCREMENT,
    modello TEXT NOT NULL,
    marca TEXT NOT NULL,
    nazione TEXT NOT NULL,
    motore TEXT NOT NULL
);

-- PRENOTAZIONI 
CREATE TABLE PRENOTAZIONI (
    ID_prenotazione INTEGER PRIMARY KEY AUTOINCREMENT,
    ID_utente INTEGER NOT NULL,
    ID_auto INTEGER NOT NULL,
    tipologia TEXT NOT NULL CHECK (tipologia IN ('noleggio', 'trackday')),
    data TEXT NOT NULL,                 -- data noleggio o evento
    circuito TEXT,                      -- obbligatorio solo se tipologia = 'trackday'
    FOREIGN KEY (ID_utente) REFERENCES UTENTE(ID_utente) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (ID_auto) REFERENCES AUTO(ID_auto) ON DELETE CASCADE ON UPDATE CASCADE
);

-- RECENSIONI
CREATE TABLE RECENSIONI (
    ID_recensione INTEGER PRIMARY KEY AUTOINCREMENT,
    ID_utente INTEGER NOT NULL,
    tipologia TEXT NOT NULL CHECK (tipologia IN ('noleggio', 'trackday')),
    valutazione INTEGER NOT NULL CHECK (valutazione BETWEEN 1 AND 5),
    contenuto TEXT NOT NULL,
    data_creazione TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (ID_utente) REFERENCES UTENTE(ID_utente) ON DELETE CASCADE ON UPDATE CASCADE
);

-- RICHIESTA DI CONTATTO
CREATE TABLE CONTATTO (
    ID_contatto INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT NOT NULL,
    messaggio TEXT NOT NULL,
    data TEXT DEFAULT (datetime('now'))
);
