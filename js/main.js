document.addEventListener('DOMContentLoaded', function() {
    'use strict';

    // Handle contact form submission
    const contactForm = document.getElementById('contact-form');
    const formMessage = document.getElementById('form-message');

    if (contactForm) {
        contactForm.addEventListener('submit', async function(event) {
            event.preventDefault(); // Prevent default form submission

            // Get form data
            const formData = {
                name: document.getElementById('name').value.trim(),
                email: document.getElementById('email').value.trim(),
                subject: document.getElementById('subject').value.trim(),
                message: document.getElementById('message').value.trim()
            };

            // Validate form data
            if (!formData.name || !formData.email || !formData.subject || !formData.message) {
                formMessage.textContent = 'Please fill in all fields.';
                formMessage.style.color = '#ff4444';
                return;
            }

            // Show loading state
            formMessage.textContent = 'Submitting...';
            formMessage.style.color = '#ffffff';

            try {
                const response = await fetch('/api/contact', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(formData)
                });

                const result = await response.json();

                if (response.ok && result.success) {
                    formMessage.textContent = 'Message sent successfully!';
                    formMessage.style.color = '#00cc00';
                    contactForm.reset(); // Clear form
                } else {
                    throw new Error(result.error || 'Failed to send message.');
                }
            } catch (error) {
                console.error('Error submitting contact form:', error);
                formMessage.textContent = 'Error sending message. Please try again.';
                formMessage.style.color = '#ff4444';
            }
        });
    }

    // Update visitor count
    const visitorCountElement = document.getElementById('visitor-count');
    if (visitorCountElement) {
        fetch('/api/admin/total-visitors')
            .then(response => {
                if (!response.ok) throw new Error('Failed to fetch visitor count');
                return response.json();
            })
            .then(data => {
                visitorCountElement.textContent = data.count || 0;
            })
            .catch(error => {
                console.error('Error fetching visitor count:', error);
                visitorCountElement.textContent = 'N/A';
            });
    }

    // Track page view
    function trackPageView() {
        const pageData = {
            page: window.location.pathname,
            timestamp: new Date().toISOString()
        };

        fetch('/api/track-page', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(pageData)
        }).catch(error => console.error('Error tracking page view:', error));
    }

    // Track visitor
    function trackVisitor() {
        const visitorData = {
            id: generateUniqueId(), // Implement a unique ID generator or use UUID
            timestamp: new Date().toISOString(),
            visits: 1,
            browser: navigator.userAgent.match(/(Chrome|Firefox|Safari|Edge|Opera)/)?.[0] || 'Unknown',
            device: /Mobi|Android/i.test(navigator.userAgent) ? 'Mobile' : 'Desktop',
            screenSize: `${window.screen.width}x${window.screen.height}`
        };

        fetch('/api/track-visitor', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(visitorData)
        }).catch(error => console.error('Error tracking visitor:', error));
    }

    // Simple unique ID generator (replace with UUID if available)
    function generateUniqueId() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }

    // Initialize tracking
    trackPageView();
    trackVisitor();
});
