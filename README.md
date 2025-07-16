# 🏁 DreamDrive 

Sviluppo applicazione web che permette la prenotazione di Noleggio Auto o Track-Day in circuiti autorizzati.

# Funzionalità principali

# 👁 Admin

L'admin dell'applicazione può visualizzare gli utenti registrati con le relative prenotazioni attive, visionare e cancellare le recensioni, aggiungere auto al database e alla gallery dedicata, rispondere ai contatti Q&A e eliminare account di utenti, il tutto attraverso la **Dashborard Admin**.

# 📊 Dashboard Admin

La dashboard admin presenta una sidebar con 5 pulsanti (Prenotazioni, Auto, Utenti, Recensioni, Contatti) dove:

* Prenotazioni: permette all'admin di controllare il numero totale di prenotazioni, ID dell'utente con relativa mail, tipo di servizio, auto scelta e data prevista dell'evento, dando anche la possibilità di cancellarle.

* Auto: permette all'admin di aggiungere, eliminare o modificare un auto. E' possibile caricare immagini andando a riempire campi descrittivi inerenti a marca, modello, nazione e motore.
  
* Utenti: permette all'admin di visionare gli utenti registrati, dando anche la possibilità di eliminarli ( a propria discrezione ).

* Recensioni: permette all'admin di visionare le varie recensioni, dando la possibilità di eliminarle.

* Contatti: permette all'admin di leggere i vari messaggi lasciati dagli utenti nel form dedicato, potendo anche rispondere o cancellarli.

# 👨‍💻 Utente registrato

L'utente, una volta registrato può selezionare il servizio che più desidera, scegliendo l'auto e il numero di giorni per il noleggio o l'auto e il circuito in caso di track-day 

# 🪪 Dashboard Utente

All'interno del profilo utente sono disponibili le informazioni riguardo l'utente loggato, come email e prenotazioni attive con relativi importi e possibilità di cancellazione delle stesse. 
E' presente una dashboard utente che contiene il tutto; inoltre se non ci sono prenotazioni attive, è possibile effettuare la prima prenotazione direttamente dalla dashboard utente. 

# 👤 Utente non registrato 

L'utente non registrato ha la possibilità di navigare all'interno del sito per scoprire le tipologie di servizio, visionare una gallery dove sono contenute le varie auto disponibili con relativi prezzi calcolati in base al tipo di servizio, leggere le recensioni degli utenti e creare un nuovo account.

# 📥 Procedura di installazione

```bash
# Clonazione la repo di GitHub

git clone https://github.com/TG20054431/DreamDrive.git

# Entrare nella directory del progetto

cd DreamDrive

# In caso non fosse presente, bisogna configurare un file .env

PORT=3000
DB_NAME="dreamdrive.db"
SECRET_SESSION="dreamdrive"
NODE_ENV="development"

# Installazione delle dipendenze

npm install

# Avvio applicazione

npm run dev

```

L'applicazione sarà disponibile, in locale,  al link:  *http://localhost:3000*

# Struttura cartelle

DreamDrive
|
|_ middleware
|     |
|     |_auth.js
|     |_passport.js
|     |_permessi.js
|
|_ models\dao
|     |
|     |_auto-dao.js
|     |_contatti-dao.js
|     |_prenotazioni-dao.js
|     |_recensioni-dao.js
|     |_utenti-dao.js
|     
|_public
|     |
|     |_css
|     |   |
|     |   |_admin-dashboard.css
|     |
|     |_images
|     |   |
|     |   |_logo_bianco.jpg
|     |   |_wallpaper.jpg
|     |
|     |_js
|     |   |
|     |   |_admin-dashboard.js
|     |   |_auto.js
|     |   |_date-time-validation.js
|     |   |_dateTimeValidator.js
|     |   |_dettaglio-auto.js
|     |   |_index.js
|     |   |_main.js
|     |   |_noleggio.js
|     |   |_track-day.js
|     |   |_utility.js
|     |
|     |_stylesheets
|     |   |
|     |   |_style.css
|     |
|     |_uploads
|         |
|         |_\auto
|
|_routes
|     |
|     |_admin.js
|     |_auth.js
|     |_index.js
|     |_utente.js
|
|_views
|     |
|     |_pages
|     |  |
|     |  |_auto.ejs
|     |  |_dashboard_admin.ejs
|     |  |_dashboard_utente.ejs
|     |  |_error.ejs
|     |  |_index.ejs
|     |  |_login.ejs
|     |  |_prenotazioni.ejs
|     |  |_recensioni.ejs
|     |  |_register.ejs
|     |
|     |_partials
|         |
|         |_modals
|         |    |
|         |    |_elimina-account-modal.ejs
|         |    |_logout-modal.ejs
|         |
|         |_alerts.ejs
|         |_footer.ejs
|         |_head.ejs
|         |_nav.ejs
|         |_scripts.ejs
|         |_toast.ejs   
|     
|_.env
|_.gitignore
|_app.js
|_db.js
|_dreamdrive.db
|_dreamdrive.sql
|_package-lock.json
|_package.json
|_README.md
|_server.js

# 🛠 Account di test

**Admin**

* Email: admin@dreamdrive.com 
* Password: admin 1234

**Utente**

* Email: marco.rossi@gmail.com
* Password: marco1234

# 📼 Link al video di presentazione

https://youtu.be/71yw4ih7IfA

# 🌐 Link deploy 

https://dreamdrive-motorsport-rent.up.railway.app

# 🙋🏻‍♂️ Autore

Timothy Giolito, studente di Informatica presso l'Università del Piemonte Orientale, sede di Vercelli.
