document.addEventListener('DOMContentLoaded', function() {
    const contactForm = document.getElementById('contactForm');
    const formMessage = document.getElementById('formMessage');

    if (contactForm) {
        contactForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            try {
                const formData = new FormData(this);
                const response = await fetch('process_order.php', {
                    method: 'POST',
                    body: formData
                });
                
                const data = await response.json();
                
                if (data.success) {
                    showMessage('Message sent successfully! We will contact you soon.', 'success');
                    contactForm.reset();
                    
                    // Redirect to profile page after 2 seconds
                    setTimeout(() => {
                        window.location.href = 'profile.html#orders-section';
                    }, 2000);
                } else {
                    showMessage(data.message || 'Error sending message. Please try again.', 'error');
                }
            } catch (error) {
                console.error('Error:', error);
                showMessage('Error sending message. Please try again.', 'error');
            }
        });
    }

    function showMessage(message, type) {
        formMessage.textContent = message;
        formMessage.className = 'form-message ' + type;
        
        // Hide message after 5 seconds
        setTimeout(() => {
            formMessage.style.display = 'none';
        }, 5000);
    }
});
