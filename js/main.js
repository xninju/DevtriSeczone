/*---------------------------------------------
 * Main JavaScript File
 * Handles core functionality of the website
 *--------------------------------------------*/

document.addEventListener('DOMContentLoaded', function() {
    'use strict';
    
    // Wait for window to load
    window.onload = function() {
        // Hide preloader once page is fully loaded
        const preloader = document.querySelector('.preloader');
        preloader.classList.add('hide');
        
        // Start animations
        initRevealAnimations();
        
        // Init skill progress bars
        initSkillBars();
        
        // Init stat counters
        initCounters();
    };
    
    // Get all DOM elements
    const header = document.getElementById('header');
    const hamburger = document.querySelector('.hamburger');
    const mobileNav = document.querySelector('.mobile-nav');
    const mobileNavLinks = document.querySelectorAll('.mobile-nav-link');
    const navLinks = document.querySelectorAll('.nav-link');
    const sections = document.querySelectorAll('section');
    const filterBtns = document.querySelectorAll('.filter-btn');
    const projectCards = document.querySelectorAll('.project-card');
    const contactForm = document.getElementById('contact-form');
    
    // Initialize custom cursor
    initCustomCursor();
    
    // Header scroll event
    window.addEventListener('scroll', function() {
        // Add sticky class to header on scroll
        if (window.scrollY > 100) {
            header.classList.add('sticky');
        } else {
            header.classList.remove('sticky');
        }
        
        // Highlight active nav link based on scroll position
        let current = '';
        
        sections.forEach((section) => {
            const sectionTop = section.offsetTop - 100;
            const sectionHeight = section.clientHeight;
            if (scrollY >= sectionTop) {
                current = section.getAttribute('id');
            }
        });
        
        navLinks.forEach((link) => {
            link.classList.remove('active');
            if (link.getAttribute('href').slice(1) === current) {
                link.classList.add('active');
            }
        });
    });
    
    // Mobile menu toggle
    hamburger.addEventListener('click', function() {
        hamburger.classList.toggle('active');
        mobileNav.classList.toggle('active');
        document.body.classList.toggle('no-scroll');
    });
    
    // Close mobile menu on nav link click
    mobileNavLinks.forEach(link => {
        link.addEventListener('click', function() {
            hamburger.classList.remove('active');
            mobileNav.classList.remove('active');
            document.body.classList.remove('no-scroll');
        });
    });
    
    // Smooth scrolling for all navigation links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            
            if (targetElement) {
                window.scrollTo({
                    top: targetElement.offsetTop - 70,
                    behavior: 'smooth'
                });
            }
        });
    });
    
    // Projects filter functionality
    filterBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            // Remove active class from all buttons
            filterBtns.forEach(btn => btn.classList.remove('active'));
            // Add active class to clicked button
            this.classList.add('active');
            
            const filterValue = this.getAttribute('data-filter');
            
            projectCards.forEach(card => {
                if (filterValue === 'all' || card.getAttribute('data-category') === filterValue) {
                    card.style.display = 'block';
                    setTimeout(() => {
                        card.style.opacity = '1';
                        card.style.transform = 'translateY(0)';
                    }, 100);
                } else {
                    card.style.opacity = '0';
                    card.style.transform = 'translateY(20px)';
                    setTimeout(() => {
                        card.style.display = 'none';
                    }, 300);
                }
            });
        });
    });
    
    // Form submission handling
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Get form data
            const formData = {
                name: document.getElementById('name').value,
                email: document.getElementById('email').value,
                subject: document.getElementById('subject').value,
                message: document.getElementById('message').value
            };
            
            // Validate form data
            if (!validateForm(formData)) {
                return;
            }
            
            // Show submit success message
            // In a real application, this would submit to a server
            showFormMessage('success', 'Your message has been sent successfully!');
            
            // Reset form
            contactForm.reset();
        });
    }
    
    // Initialize skill progress bars
    function initSkillBars() {
        const progressBars = document.querySelectorAll('.progress-bar');
        
        progressBars.forEach(bar => {
            const percent = bar.getAttribute('data-percent');
            
            // Use IntersectionObserver to trigger animation when bar is in view
            const observer = new IntersectionObserver(entries => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        setTimeout(() => {
                            bar.style.width = percent + '%';
                        }, 400);
                        observer.unobserve(bar);
                    }
                });
            }, { threshold: 0.5 });
            
            observer.observe(bar);
        });
    }
    
    // Initialize stat counters
    function initCounters() {
        const counters = document.querySelectorAll('.counter');
        
        counters.forEach(counter => {
            const target = +counter.getAttribute('data-target');
            
            // Use IntersectionObserver to trigger animation when counter is in view
            const observer = new IntersectionObserver(entries => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        counter.innerText = '0';
                        
                        const updateCounter = () => {
                            const c = +counter.innerText;
                            const increment = target / 20;
                            
                            if (c < target) {
                                counter.innerText = Math.ceil(c + increment);
                                setTimeout(updateCounter, 100);
                            } else {
                                counter.innerText = target;
                            }
                        };
                        
                        updateCounter();
                        observer.unobserve(counter);
                    }
                });
            }, { threshold: 0.5 });
            
            observer.observe(counter);
        });
    }
    
    // Form validation function
    function validateForm(data) {
        // Reset previous error messages
        const errorElements = document.querySelectorAll('.error-message');
        errorElements.forEach(el => el.remove());
        
        let isValid = true;
        
        // Validate name (at least 2 characters)
        if (data.name.trim().length < 2) {
            showInputError('name', 'Name must be at least 2 characters');
            isValid = false;
        }
        
        // Validate email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(data.email)) {
            showInputError('email', 'Please enter a valid email address');
            isValid = false;
        }
        
        // Validate subject (at least 3 characters)
        if (data.subject.trim().length < 3) {
            showInputError('subject', 'Subject must be at least 3 characters');
            isValid = false;
        }
        
        // Validate message (at least 10 characters)
        if (data.message.trim().length < 10) {
            showInputError('message', 'Message must be at least 10 characters');
            isValid = false;
        }
        
        return isValid;
    }
    
    // Show input error
    function showInputError(inputId, message) {
        const input = document.getElementById(inputId);
        const errorMessage = document.createElement('span');
        errorMessage.className = 'error-message';
        errorMessage.textContent = message;
        errorMessage.style.color = 'var(--error-color)';
        errorMessage.style.fontSize = '1.3rem';
        errorMessage.style.marginTop = '5px';
        errorMessage.style.display = 'block';
        
        input.parentNode.appendChild(errorMessage);
        input.style.boxShadow = '0 0 0 2px var(--error-color)';
        
        // Remove error on input focus
        input.addEventListener('focus', function() {
            input.style.boxShadow = '';
            if (errorMessage.parentNode) {
                errorMessage.parentNode.removeChild(errorMessage);
            }
        });
    }
    
    // Show form message
    function showFormMessage(type, message) {
        // Create message element
        const messageElement = document.createElement('div');
        messageElement.className = `form-message ${type}`;
        messageElement.textContent = message;
        
        // Style based on type
        if (type === 'success') {
            messageElement.style.backgroundColor = 'rgba(40, 167, 69, 0.1)';
            messageElement.style.borderLeft = '4px solid var(--success-color)';
        } else {
            messageElement.style.backgroundColor = 'rgba(220, 53, 69, 0.1)';
            messageElement.style.borderLeft = '4px solid var(--error-color)';
        }
        
        messageElement.style.padding = '15px';
        messageElement.style.marginTop = '20px';
        messageElement.style.borderRadius = '4px';
        
        // Add to the form
        contactForm.appendChild(messageElement);
        
        // Remove after 5 seconds
        setTimeout(() => {
            messageElement.style.opacity = '0';
            setTimeout(() => {
                if (messageElement.parentNode) {
                    messageElement.parentNode.removeChild(messageElement);
                }
            }, 300);
        }, 5000);
        
        messageElement.style.transition = 'opacity 0.3s ease';
    }
    
    // Initialize custom cursor
    function initCustomCursor() {
        const cursor = document.querySelector('.cursor');
        const cursorFollower = document.querySelector('.cursor-follower');
        
        // Only enable custom cursor on desktop
        if (window.innerWidth > 768) {
            // Hide default cursor
            document.body.style.cursor = 'none';
            
            // Move custom cursor with mouse
            document.addEventListener('mousemove', function(e) {
                cursor.style.left = e.clientX + 'px';
                cursor.style.top = e.clientY + 'px';
                
                // Follower with slight delay
                setTimeout(function() {
                    cursorFollower.style.left = e.clientX + 'px';
                    cursorFollower.style.top = e.clientY + 'px';
                }, 70);
            });
            
            // Cursor effects for links & buttons
            document.querySelectorAll('a, button, .project-card, .skill-item, .filter-btn, input, textarea').forEach(item => {
                item.addEventListener('mouseenter', function() {
                    cursor.style.width = '0';
                    cursor.style.height = '0';
                    cursorFollower.style.width = '40px';
                    cursorFollower.style.height = '40px';
                    cursorFollower.style.borderColor = 'var(--primary-color)';
                    cursorFollower.style.backgroundColor = 'rgba(157, 78, 221, 0.1)';
                });
                
                item.addEventListener('mouseleave', function() {
                    cursor.style.width = '10px';
                    cursor.style.height = '10px';
                    cursorFollower.style.width = '30px';
                    cursorFollower.style.height = '30px';
                    cursorFollower.style.borderColor = 'var(--primary-light)';
                    cursorFollower.style.backgroundColor = 'transparent';
                });
            });
        } else {
            // Hide custom cursor on mobile/tablet
            cursor.style.display = 'none';
            cursorFollower.style.display = 'none';
        }
    }
    
    // Initialize reveal animations
    function initRevealAnimations() {
        const revealElements = document.querySelectorAll('.reveal-text');
        
        const revealObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('active');
                    observer.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.15,
            rootMargin: '0px 0px -50px 0px'
        });
        
        revealElements.forEach(element => {
            revealObserver.observe(element);
        });
    }
});
