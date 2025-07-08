console.log('Avvio test debug auto...');

try {
    const path = require('path');
    console.log('Path corrente:', __dirname);
    
    const db = require('./db');
    console.log('Database caricato:', typeof db);
    
    const autoDAO = require('./models/dao/auto-dao');
    console.log('AutoDAO caricato:', typeof autoDAO);
    console.log('Metodi disponibili:', Object.keys(autoDAO));
    
    // Test diretto del database
    db.all('SELECT * FROM auto', [], (err, rows) => {
        if (err) {
            console.error('ERRORE query diretta:', err);
        } else {
            console.log('Query diretta - Auto trovate:', rows.length);
            console.log('Prima auto (query diretta):', rows[0]);
        }
        
        // Test tramite DAO
        autoDAO.getAllAuto()
            .then(auto => {
                console.log('=== TEST DAO ===');
                console.log('Auto tramite DAO:', auto.length);
                console.log('Dati:', auto);
                process.exit(0);
            })
            .catch(error => {
                console.error('Errore DAO:', error);
                process.exit(1);
            });
    });
    
} catch (error) {
    console.error('Errore nel caricamento moduli:', error);
    process.exit(1);
}