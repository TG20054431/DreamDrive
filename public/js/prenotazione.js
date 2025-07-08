document.addEventListener('DOMContentLoaded', function() {
    console.log('Script prenotazione caricato');
    
    // Get URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const serviceParam = urlParams.get('service');
    const autoParam = urlParams.get('auto');

    // Get form elements
    const servizioSelect = document.getElementById('servizio');
    const autoSelect = document.getElementById('auto');
    const durataContainer = document.getElementById('durata-container');
    const durataSelect = document.getElementById('durata');
    const circuitoContainer = document.getElementById('circuito-container');
    const circuitoSelect = document.getElementById('circuito');

    // Pre-select service and car if parameters exist
    if (serviceParam && servizioSelect) {
        servizioSelect.value = serviceParam;
        handleServiceChange(serviceParam);
    }

    if (autoParam && autoSelect) {
        autoSelect.value = autoParam;
    }

    // Funzione per gestire il cambio di servizio
    function handleServiceChange(serviceType) {
        if (serviceType === 'noleggio') {
            if (durataContainer) {
                durataContainer.style.display = 'block';
                if (durataSelect) durataSelect.required = true;
            }
            if (circuitoContainer) {
                circuitoContainer.style.display = 'none';
                if (circuitoSelect) {
                    circuitoSelect.required = false;
                    circuitoSelect.value = '';
                }
            }
        } else if (serviceType === 'track-day') {
            if (durataContainer) {
                durataContainer.style.display = 'none';
                if (durataSelect) {
                    durataSelect.required = false;
                    durataSelect.value = '';
                }
            }
            if (circuitoContainer) {
                circuitoContainer.style.display = 'block';
                if (circuitoSelect) circuitoSelect.required = true;
            }
        } else {
            if (durataContainer) durataContainer.style.display = 'none';
            if (circuitoContainer) circuitoContainer.style.display = 'none';
            if (durataSelect) {
                durataSelect.required = false;
                durataSelect.value = '';
            }
            if (circuitoSelect) {
                circuitoSelect.required = false;
                circuitoSelect.value = '';
            }
        }
    }

    // Event listener per il cambio di servizio
    if (servizioSelect) {
        servizioSelect.addEventListener('change', function() {
            handleServiceChange(this.value);
        });
    }

    // Gestione date picker
    const dataInput = document.getElementById('data');
    if (dataInput) {
        const today = new Date().toISOString().split('T')[0];
        dataInput.setAttribute('min', today);
    }

    console.log('Script prenotazione inizializzato');
});
