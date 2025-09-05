document.addEventListener('DOMContentLoaded', function () {
    // Contact Form Submission
    const contactForm = document.getElementById('contact-form');
    const formMessage = document.getElementById('form-message');
    const reviewContainer = document.getElementById('review-container');

    if (contactForm) {
        contactForm.addEventListener('submit', async function (e) {
            e.preventDefault();
            const name = document.getElementById('name').value.trim();
            const email = document.getElementById('email').value.trim();
            const subject = document.getElementById('subject').value.trim();
            const message = document.getElementById('message').value.trim();

            if (!name || !email || !subject || !message) {
                formMessage.textContent = 'All fields are required.';
                formMessage.style.color = 'red';
                return;
            }

            try {
                const response = await fetch('/api/contact', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ name, email, subject, message })
                });
                const result = await response.json();

                if (response.ok && result.success) {
                    formMessage.textContent = 'Message sent successfully!';
                    formMessage.style.color = 'green';
                    contactForm.reset();

                    // Refresh reviews after submission
                    if (reviewContainer) {
                        await fetchReviews();
                    }
                } else {
                    formMessage.textContent = result.message || 'Failed to send message.';
                    formMessage.style.color = 'red';
                }
            } catch (error) {
                console.error('Error submitting form:', error);
                formMessage.textContent = 'Error sending message.';
                formMessage.style.color = 'red';
            }
        });
    }

    // Fetch and display reviews
    async function fetchReviews() {
        try {
            const response = await fetch('/api/reviews');
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            const reviews = await response.json();
            reviewContainer.innerHTML = '';

            if (reviews.length === 0) {
                reviewContainer.innerHTML = '<div class="col-12 text-center"><p>No reviews available yet.</p></div>';
                return;
            }

            reviews.forEach(review => {
                const reviewCard = document.createElement('div');
                reviewCard.className = 'col-md-3 mb-4';
                reviewCard.innerHTML = `
                    <div class="review-card">
                        <i class="fas fa-user-circle review-icon"></i>
                        <h4>${review.name || 'Anonymous'}</h4>
                        <p title="${review.message || ''}">${review.message && review.message.length > 100 ? review.message.substring(0, 100) + '...' : review.message || 'No message'}</p>
                    </div>
                `;
                reviewContainer.appendChild(reviewCard);
            });
        } catch (error) {
            console.error('Error fetching reviews:', error);
            reviewContainer.innerHTML = '<div class="col-12 text-center"><p>Error loading reviews.</p></div>';
        }
    }

    // Contact Toggle
    const contactButton = document.getElementById('contact-button');
    const overlay = document.getElementById('overlay');
    const contactSection = document.getElementById('contact');

    if (contactButton && overlay && contactSection) {
        contactButton.addEventListener('click', () => {
            contactSection.scrollIntoView({ behavior: 'smooth' });
            overlay.style.display = 'block';
            setTimeout(() => {
                overlay.style.display = 'none';
            }, 1000);
        });
    }

    // Visitor Counter
    const visitorCountElement = document.getElementById('visitor-count');
    if (visitorCountElement) {
        fetch('/api/visitors/count')
            .then(response => response.json())
            .then(data => {
                visitorCountElement.textContent = data.count || 0;
            })
            .catch(error => {
                console.error('Error fetching visitor count:', error);
                visitorCountElement.textContent = 'Error';
            });
    }
});
