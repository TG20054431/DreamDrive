// Admin Dashboard JavaScript

document.addEventListener('DOMContentLoaded', function() {
    // Sidebar navigation functionality
    const sidebarItems = document.querySelectorAll('.sidebar-item');
    const contentSections = document.querySelectorAll('.content-section');
    
    sidebarItems.forEach(item => {
        item.addEventListener('click', function() {
            // Remove active class from all sidebar items
            sidebarItems.forEach(i => i.classList.remove('active'));
            
            // Add active class to clicked item
            this.classList.add('active');
            
            // Show corresponding content section
            const targetSection = this.getAttribute('data-section');
            contentSections.forEach(section => {
                section.classList.remove('active');
                if (section.id === `${targetSection}-section`) {
                    section.classList.add('active');
                }
            });
        });
    });
    
    // Booking filters functionality
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
    
    // Approve booking functionality
    const approveButtons = document.querySelectorAll('.approve-booking');
    
    approveButtons.forEach(button => {
        button.addEventListener('click', function() {
            const bookingId = this.getAttribute('data-id');
            
            // Confirm before approving
            if (confirm('Confermare questa prenotazione?')) {
                // You would typically make an AJAX request to your server here
                fetch(`/admin/prenotazioni/${bookingId}/approva`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    }
                })
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        // Refresh the page or update the UI
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
    
    // View booking details functionality
    const viewButtons = document.querySelectorAll('.view-booking');
    
    viewButtons.forEach(button => {
        button.addEventListener('click', function() {
            const bookingId = this.getAttribute('data-id');
            
            // Here you would typically fetch the booking details and show them in a modal
            // This is a placeholder for that functionality
            alert(`Visualizzazione dettagli prenotazione ${bookingId}`);
        });
    });
});
