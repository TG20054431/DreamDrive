# 🏁 DreamDrive 

Applicazione web che permette la prenotazione di Noleggio Auto o Track-Day in circuiti autorizzati.

# Funzionalità principali

# 👁 Admin

L'admin dell'applicazione può visualizzare gli utenti registrati con le relative prenotazioni attive, visionare e cancellare le recenzioni, aggiungere auto al database e alla gallery dedicata, rispondere ai contatti Q&A, il tutto attraverso la **Dashborard Admin**.

# 📊 Dashboard Admin

La dashboard dell'admin permette di visualizzare le informazioni inerenti ai vari utenti registrati, come ad esempio nome utente, importo pagato, data prenotazione; è presente inoltre la possibilità di ricerca tramite filtri delle informazioni inerenti una cerchia di utenti più ristretta e dettagliata.

# 👨‍💻 Utente registrato

L'utente, una volta registrato può selezionare il servizio che più desidera, scegliendo l'auto e il numero di giorni per il noleggio o l'auto e il circuito in caso di track-day 

# 🪪 Profilo utente

All'interno del profilo utente sono disponibili le informazioni riguardo l'utente loggato, come email e prenotazioni attive con relativi importi e possibilità di cancellazione delle stesse. 
E' presente una dashboard utente che contiene il tutto; inoltre se non ci sono prenotazioni attive, è possibile effettuare la prima prenotazione direttamente dalla dashboard utente. 

# 👤 Utente non registrato 

L'utente non registrato ha la possibilità di navigare all'interno del sito per scoprire le tipologie di servizio, visionare una gallery dove sono contenute le varie auto disponibili con relativi prezzi calcolati in base al tipo di servizio, leggere le recensioni degli utenti e creare un nuovo account.

# 📥 Procedura di installazione
```bash
# Clonazione la repo di GitHub

git clone https://github.com/TG20054431/DreamDrive-Progetto.git

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
L'applicazione sarà disponibile al link:  *http://localhost:3000*

# Account di test

**Admin**

* Email: admin@dreamdrive.com 
* Password: admin 1234

**Utente**

* Email: claudio.rossi@gmail.com
* Password: claudio1234

# 🙋🏻‍♂️ Autore

Timothy Giolito, studente di Informatica presso l'Università del Piemonte Orientale, sede di Vercelli.
