document.addEventListener('DOMContentLoaded', function() {
    console.log('Admin Dashboard JS caricato');

    // ========================================
    // GESTIONE FILTRI PRENOTAZIONI
    // ========================================
    const statusFilter = document.getElementById('status-filter');
    const serviceFilter = document.getElementById('service-filter');
    const bookingSearch = document.getElementById('booking-search');
    
    if (statusFilter && serviceFilter && bookingSearch) {
        const filterBookings = () => {
            const statusValue = statusFilter.value;
            const serviceValue = serviceFilter.value;
            const searchValue = bookingSearch.value.toLowerCase();
            
            const bookingRows = document.querySelectorAll('tbody tr');
            
            bookingRows.forEach(row => {
                const status = row.getAttribute('data-status');
                const service = row.getAttribute('data-service');
                const rowText = row.textContent.toLowerCase();
                
                const matchesStatus = statusValue === 'all' || status === statusValue;
                const matchesService = serviceValue === 'all' || service === serviceValue;
                const matchesSearch = searchValue === '' || rowText.includes(searchValue);
                
                if (matchesStatus && matchesService && matchesSearch) {
                    row.style.display = '';
                } else {
                    row.style.display = 'none';
                }
            });
        };
        
        statusFilter.addEventListener('change', filterBookings);
        serviceFilter.addEventListener('change', filterBookings);
        bookingSearch.addEventListener('input', filterBookings);
    }
    
    // ========================================
    // GESTIONE PRENOTAZIONI
    // ========================================
    const approveButtons = document.querySelectorAll('.approve-booking');
    approveButtons.forEach(button => {
        button.addEventListener('click', function() {
            const bookingId = this.getAttribute('data-id');
            
            if (confirm('Confermare questa prenotazione?')) {
                fetch(`/admin/prenotazioni/${bookingId}/approva`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    }
                })
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        location.reload();
                    } else {
                        alert('Errore durante l\'approvazione della prenotazione');
                    }
                })
                .catch(error => {
                    console.error('Error:', error);
                    alert('Si è verificato un errore');
                });
            }
        });
    });

    // ========================================
    // GESTIONE AUTO - MODAL E FORM
    // ========================================

    // Funzioni helper per modal manuali
    function showModalManually(modal) {
        modal.style.display = 'block';
        modal.classList.add('show');
        document.body.classList.add('modal-open');
        
        const backdrop = document.createElement('div');
        backdrop.className = 'modal-backdrop fade show';
        document.body.appendChild(backdrop);
    }

    function hideModalManually(modal) {
        modal.style.display = 'none';
        modal.classList.remove('show');
        document.body.classList.remove('modal-open');
        
        const backdrop = document.querySelector('.modal-backdrop');
        if (backdrop) {
            backdrop.remove();
        }
    }

    // Modal "Aggiungi Auto"
    const addAutoButton = document.querySelector('button[data-bs-target="#addAutoModal"]');
    const addAutoModal = document.getElementById('addAutoModal');
    
    if (addAutoButton && addAutoModal) {
        addAutoButton.addEventListener('click', function(e) {
            e.preventDefault();
            console.log('Pulsante Aggiungi Auto cliccato');
            
            if (typeof bootstrap !== 'undefined') {
                const modalInstance = new bootstrap.Modal(addAutoModal);
                modalInstance.show();
            } else {
                showModalManually(addAutoModal);
            }
        });
    }

    // Anteprima immagine AGGIUNTA auto
    const imgInput = document.getElementById('immagine');
    const imgPreview = document.getElementById('imagePreview');
    const previewContainer = document.getElementById('imagePreviewContainer');
    
    if (imgInput && imgPreview && previewContainer) {
        imgInput.addEventListener('change', function() {
            const file = this.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    imgPreview.src = e.target.result;
                    previewContainer.style.display = 'block';
                }
                reader.readAsDataURL(file);
            } else {
                previewContainer.style.display = 'none';
            }
        });
    }

    // Pulsanti MODIFICA Auto
    const editAutoButtons = document.querySelectorAll('.edit-auto');
    editAutoButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            console.log('Pulsante Modifica Auto cliccato');
            
            try {
                const autoData = JSON.parse(this.getAttribute('data-auto'));
                console.log('Dati auto:', autoData);
                
                // Popola il form
                const fields = ['edit_id_auto', 'edit_marca', 'edit_modello', 'edit_nazione', 'edit_motore'];
                const values = [autoData.ID_auto, autoData.marca, autoData.modello, autoData.nazione, autoData.motore];
                
                fields.forEach((fieldId, index) => {
                    const field = document.getElementById(fieldId);
                    if (field) field.value = values[index] || '';
                });
                
                // Mostra immagine attuale
                const currentImage = document.getElementById('current_image');
                if (currentImage && autoData.immagine) {
                    currentImage.src = `/uploads/auto/${autoData.immagine}`;
                    currentImage.style.display = 'block';
                } else if (currentImage) {
                    currentImage.style.display = 'none';
                }
                
                // Reset anteprima nuova immagine
                const editPreviewContainer = document.getElementById('editImagePreviewContainer');
                const editImgInput = document.getElementById('edit_immagine');
                
                if (editPreviewContainer) editPreviewContainer.style.display = 'none';
                if (editImgInput) editImgInput.value = '';
                
                // Apri modal
                const editAutoModal = document.getElementById('editAutoModal');
                if (editAutoModal) {
                    if (typeof bootstrap !== 'undefined') {
                        const modalInstance = new bootstrap.Modal(editAutoModal);
                        modalInstance.show();
                    } else {
                        showModalManually(editAutoModal);
                    }
                }
            } catch (error) {
                console.error('Errore nel parsing dei dati auto:', error);
                alert('Errore nel caricamento dei dati dell\'auto');
            }
        });
    });

    // Anteprima immagine MODIFICA auto
    const editImgInput = document.getElementById('edit_immagine');
    const editImgPreview = document.getElementById('editImagePreview');
    const editPreviewContainer = document.getElementById('editImagePreviewContainer');

    if (editImgInput && editImgPreview && editPreviewContainer) {
        editImgInput.addEventListener('change', function() {
            const file = this.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    editImgPreview.src = e.target.result;
                    editPreviewContainer.style.display = 'block';
                }
                reader.readAsDataURL(file);
            } else {
                editPreviewContainer.style.display = 'none';
            }
        });
    }

    // Pulsanti ELIMINA Auto
    const deleteAutoButtons = document.querySelectorAll('.delete-auto');
    deleteAutoButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            console.log('Pulsante Elimina Auto cliccato');
            
            const autoId = this.getAttribute('data-auto-id');
            const autoNome = this.getAttribute('data-auto-nome') || 'questa auto';
            
            if (confirm(`Sei sicuro di voler eliminare ${autoNome}? Questa azione non può essere annullata.`)) {
                const form = document.createElement('form');
                form.method = 'POST';
                form.action = `/admin/auto/${autoId}/delete`;
                
                document.body.appendChild(form);
                form.submit();
            }
        });
    });

    // ========================================
    // GESTIONE CHIUSURA MODAL
    // ========================================
    const allModals = document.querySelectorAll('.modal');
    allModals.forEach(modal => {
        const closeButtons = modal.querySelectorAll('.btn-close, [data-bs-dismiss="modal"]');
        closeButtons.forEach(button => {
            button.addEventListener('click', function() {
                if (typeof bootstrap !== 'undefined') {
                    const modalInstance = bootstrap.Modal.getInstance(modal);
                    if (modalInstance) {
                        modalInstance.hide();
                    }
                } else {
                    hideModalManually(modal);
                }
            });
        });

        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                if (typeof bootstrap !== 'undefined') {
                    const modalInstance = bootstrap.Modal.getInstance(modal);
                    if (modalInstance) {
                        modalInstance.hide();
                    }
                } else {
                    hideModalManually(modal);
                }
            }
        });
    });

    console.log('Admin Dashboard JS inizializzato correttamente');
});
