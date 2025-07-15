document.addEventListener('DOMContentLoaded', function() {
    console.log('Admin Dashboard JS caricato');

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
    const editAutoModal = document.getElementById('editAutoModal');
    
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

    // ========================================
    // GESTIONE ELIMINAZIONI CON MODAL
    // ========================================

    // Gestione eliminazione prenotazioni
    const deletePrenotazioneButtons = document.querySelectorAll('.delete-prenotazione');
    if (deletePrenotazioneButtons.length > 0) {
        const deletePrenotazioneModal = document.getElementById('deletePrenotazioneModal');
        if (deletePrenotazioneModal && typeof bootstrap !== 'undefined') {
            const modalInstance = new bootstrap.Modal(deletePrenotazioneModal);
            
            deletePrenotazioneButtons.forEach(button => {
                button.addEventListener('click', function(e) {
                    e.preventDefault();
                    const prenotazioneId = this.getAttribute('data-prenotazione-id');
                    const cliente = this.getAttribute('data-prenotazione-cliente');
                    const servizio = this.getAttribute('data-prenotazione-servizio');
                    
                    document.getElementById('delete_prenotazione_cliente').textContent = cliente;
                    document.getElementById('delete_prenotazione_servizio').textContent = servizio;
                    document.getElementById('deletePrenotazioneForm').action = `/admin/prenotazioni/${prenotazioneId}/elimina`;
                    
                    modalInstance.show();
                });
            });
        }
    }

    // Gestione eliminazione auto
    const deleteAutoButtons = document.querySelectorAll('.delete-auto');
    if (deleteAutoButtons.length > 0) {
        const deleteAutoModal = document.getElementById('deleteAutoModal');
        if (deleteAutoModal && typeof bootstrap !== 'undefined') {
            const modalInstance = new bootstrap.Modal(deleteAutoModal);
            
            deleteAutoButtons.forEach(button => {
                button.addEventListener('click', function(e) {
                    e.preventDefault();
                    const autoId = this.getAttribute('data-auto-id');
                    const autoNome = this.getAttribute('data-auto-nome');
                    
                    document.getElementById('delete_auto_nome').textContent = autoNome;
                    document.getElementById('deleteAutoForm').action = `/admin/auto/${autoId}/delete`;
                    
                    modalInstance.show();
                });
            });
        }
    }

    // Gestione eliminazione recensioni
    const deleteRecensioneButtons = document.querySelectorAll('.delete-recensione');
    if (deleteRecensioneButtons.length > 0) {
        const deleteRecensioneModal = document.getElementById('deleteRecensioneModal');
        if (deleteRecensioneModal && typeof bootstrap !== 'undefined') {
            const modalInstance = new bootstrap.Modal(deleteRecensioneModal);
            
            deleteRecensioneButtons.forEach(button => {
                button.addEventListener('click', function(e) {
                    e.preventDefault();
                    const recensioneId = this.getAttribute('data-recensione-id');
                    const utente = this.getAttribute('data-recensione-utente');
                    const contenuto = this.getAttribute('data-recensione-contenuto');
                    
                    document.getElementById('delete_recensione_utente').textContent = utente;
                    document.getElementById('delete_recensione_contenuto').textContent = contenuto;
                    document.getElementById('delete_recensione_id').value = recensioneId;
                    
                    modalInstance.show();
                });
            });
        }
    }

    // Gestione eliminazione contatti
    const deleteContattoButtons = document.querySelectorAll('.delete-contatto');
    if (deleteContattoButtons.length > 0) {
        const deleteContattoModal = document.getElementById('deleteContattoModal');
        if (deleteContattoModal && typeof bootstrap !== 'undefined') {
            const modalInstance = new bootstrap.Modal(deleteContattoModal);
            
            deleteContattoButtons.forEach(button => {
                button.addEventListener('click', function(e) {
                    e.preventDefault();
                    const contattoId = this.getAttribute('data-contatto-id');
                    const email = this.getAttribute('data-contatto-email');
                    const data = this.getAttribute('data-contatto-data');
                    
                    document.getElementById('delete_contatto_email').textContent = email;
                    document.getElementById('delete_contatto_data').textContent = data;
                    document.getElementById('deleteContattoForm').action = `/admin/contatti/${contattoId}/elimina`;
                    
                    modalInstance.show();
                });
            });
        }
    }

    // Gestione eliminazione utenti
    const deleteUserButtons = document.querySelectorAll('.delete-user');
    if (deleteUserButtons.length > 0) {
        const deleteUserModal = document.getElementById('deleteUserModal');
        if (deleteUserModal && typeof bootstrap !== 'undefined') {
            const modalInstance = new bootstrap.Modal(deleteUserModal);
            
            deleteUserButtons.forEach(button => {
                button.addEventListener('click', function(e) {
                    e.preventDefault();
                    const userId = this.getAttribute('data-user-id');
                    const userName = this.getAttribute('data-user-name');
                    
                    // Trova l'utente nella tabella per ottenere l'email
                    const userRow = this.closest('tr');
                    const userEmail = userRow.querySelector('td:nth-child(4)').textContent;
                    
                    document.getElementById('delete_user_name').textContent = userName;
                    document.getElementById('delete_user_email').textContent = userEmail;
                    document.getElementById('delete_user_id').value = userId;
                    
                    modalInstance.show();
                });
            });
        }
    }

    // ========================================
    // GESTIONE CONTATTI
    // ========================================
    
    // Mostra messaggio completo nel modal
    const showFullMessageButtons = document.querySelectorAll('.show-full-message');
    if (showFullMessageButtons.length > 0) {
        const messageModal = document.getElementById('messageModal');
        const fullMessageDiv = document.getElementById('fullMessage');
        
        if (messageModal && typeof bootstrap !== 'undefined') {
            const modalInstance = new bootstrap.Modal(messageModal);
            
            showFullMessageButtons.forEach(button => {
                button.addEventListener('click', function() {
                    const fullMessage = this.getAttribute('data-message');
                    if (fullMessageDiv) {
                        fullMessageDiv.innerHTML = fullMessage.replace(/\n/g, '<br>');
                    }
                    modalInstance.show();
                });
            });
        }
    }

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

    // Gestione cambio ruolo utente
    document.addEventListener('click', function(e) {
        if (e.target.closest('.change-role')) {
            const button = e.target.closest('.change-role');
            const userId = button.dataset.userId;
            const userName = button.dataset.userName;
            const currentRole = button.dataset.currentRole;
            
            document.getElementById('change_user_id').value = userId;
            document.getElementById('change_user_name').textContent = userName;
            
            // Preseleziona il ruolo opposto
            const newRoleSelect = document.getElementById('new_role');
            newRoleSelect.value = currentRole === 'admin' ? 'cliente' : 'admin';
            
            const modal = new bootstrap.Modal(document.getElementById('changeRoleModal'));
            modal.show();
        }
    });
});