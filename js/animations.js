/*---------------------------------------------
 * Animations JavaScript File
 * Handles special animations and effects
 *--------------------------------------------*/

document.addEventListener('DOMContentLoaded', function() {
    'use strict';
    
    // Initialize particle background
    initParticleBackground();
    
    // Handle hover effects for project cards
    initProjectHoverEffects();
    
    // Initialize type animation
    initTypeAnimation();
    
    // Initialize tilt effect
    initTiltEffect();
    
    /**
     * Create and animate background particles
     */
    function initParticleBackground() {
        const hero = document.querySelector('.hero');
        
        // Only create particles if hero section exists
        if (!hero) return;
        
        // Create canvas element
        const canvas = document.createElement('canvas');
        canvas.className = 'particles-canvas';
        canvas.style.position = 'absolute';
        canvas.style.top = '0';
        canvas.style.left = '0';
        canvas.style.width = '100%';
        canvas.style.height = '100%';
        canvas.style.pointerEvents = 'none';
        canvas.style.zIndex = '0';
        hero.insertBefore(canvas, hero.firstChild);
        
        // Get canvas context
        const ctx = canvas.getContext('2d');
        
        // Set canvas dimensions
        canvas.width = hero.offsetWidth;
        canvas.height = hero.offsetHeight;
        
        // Particle settings
        const particlesArray = [];
        const numberOfParticles = 50;
        
        // Resize event listener
        window.addEventListener('resize', function() {
            canvas.width = hero.offsetWidth;
            canvas.height = hero.offsetHeight;
        });
        
        // Particle class
        class Particle {
            constructor() {
                this.size = Math.random() * 3 + 1;
                this.x = Math.random() * canvas.width;
                this.y = Math.random() * canvas.height;
                this.speedX = Math.random() * 1 - 0.5;
                this.speedY = Math.random() * 1 - 0.5;
                this.color = `rgba(157, 78, 221, ${Math.random() * 0.5 + 0.2})`;
            }
            
            update() {
                this.x += this.speedX;
                this.y += this.speedY;
                
                // Bounce off edges
                if (this.x > canvas.width || this.x < 0) {
                    this.speedX = -this.speedX;
                }
                
                if (this.y > canvas.height || this.y < 0) {
                    this.speedY = -this.speedY;
                }
            }
            
            draw() {
                ctx.fillStyle = this.color;
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.fill();
            }
        }
        
        // Create particles
        function init() {
            for (let i = 0; i < numberOfParticles; i++) {
                particlesArray.push(new Particle());
            }
        }
        
        // Animate particles
        function animate() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            for (let i = 0; i < particlesArray.length; i++) {
                particlesArray[i].update();
                particlesArray[i].draw();
                
                // Connect particles with lines
                for (let j = i; j < particlesArray.length; j++) {
                    const dx = particlesArray[i].x - particlesArray[j].x;
                    const dy = particlesArray[i].y - particlesArray[j].y;
                    const distance = Math.sqrt(dx * dx + dy * dy);
                    
                    if (distance < 120) {
                        ctx.beginPath();
                        ctx.strokeStyle = `rgba(157, 78, 221, ${0.1 - distance/1200})`;
                        ctx.lineWidth = 0.5;
                        ctx.moveTo(particlesArray[i].x, particlesArray[i].y);
                        ctx.lineTo(particlesArray[j].x, particlesArray[j].y);
                        ctx.stroke();
                    }
                }
            }
            
            requestAnimationFrame(animate);
        }
        
        // Initialize and animate particles
        init();
        animate();
    }
    
    /**
     * Project hover effects
     */
    function initProjectHoverEffects() {
        const projectCards = document.querySelectorAll('.project-card');
        
        projectCards.forEach(card => {
            card.addEventListener('mouseenter', function() {
                // Add hover class for CSS transitions
                this.classList.add('hovered');
                
                // Add glossy reflection effect
                if (!this.querySelector('.reflection')) {
                    const reflection = document.createElement('div');
                    reflection.className = 'reflection';
                    reflection.style.position = 'absolute';
                    reflection.style.top = '0';
                    reflection.style.left = '0';
                    reflection.style.width = '100%';
                    reflection.style.height = '100%';
                    reflection.style.background = 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 60%)';
                    reflection.style.pointerEvents = 'none';
                    reflection.style.zIndex = '1';
                    reflection.style.opacity = '0';
                    reflection.style.transition = 'opacity 0.3s ease';
                    
                    this.style.position = 'relative';
                    this.style.overflow = 'hidden';
                    this.appendChild(reflection);
                    
                    // Fade in reflection
                    setTimeout(() => {
                        reflection.style.opacity = '1';
                    }, 50);
                }
            });
            
            card.addEventListener('mouseleave', function() {
                this.classList.remove('hovered');
                
                // Remove reflection on mouse leave
                const reflection = this.querySelector('.reflection');
                if (reflection) {
                    reflection.style.opacity = '0';
                    setTimeout(() => {
                        if (reflection.parentNode === this) {
                            this.removeChild(reflection);
                        }
                    }, 300);
                }
            });
            
            // Mouse move effect within the card
            card.addEventListener('mousemove', function(e) {
                const reflection = this.querySelector('.reflection');
                
                if (reflection) {
                    // Calculate mouse position relative to the card
                    const rect = this.getBoundingClientRect();
                    const x = e.clientX - rect.left;
                    const y = e.clientY - rect.top;
                    
                    // Move reflection with mouse
                    reflection.style.background = `radial-gradient(circle at ${x}px ${y}px, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0) 70%)`;
                }
            });
        });
    }
    
    /**
     * Type animation for hero text
     */
    function initTypeAnimation() {
        const heroHeading = document.querySelector('.hero-text h2');
        
        if (!heroHeading) return;
        
        // Get the original text
        const originalText = heroHeading.textContent;
        
        // Clear the text
        heroHeading.textContent = '';
        
        // Create a span with cursor
        const textSpan = document.createElement('span');
        const cursorSpan = document.createElement('span');
        cursorSpan.textContent = '|';
        cursorSpan.className = 'typing-cursor';
        cursorSpan.style.animation = 'cursor-blink 1s infinite';
        
        // Add spans to heading
        heroHeading.appendChild(textSpan);
        heroHeading.appendChild(cursorSpan);
        
        // Add style for cursor
        const style = document.createElement('style');
        style.textContent = `
            @keyframes cursor-blink {
                0%, 100% { opacity: 1; }
                50% { opacity: 0; }
            }
        `;
        document.head.appendChild(style);
        
        // Type animation
        let charIndex = 0;
        function typeText() {
            if (charIndex < originalText.length) {
                textSpan.textContent += originalText.charAt(charIndex);
                charIndex++;
                setTimeout(typeText, 100);
            }
        }
        
        // Start typing after a delay
        setTimeout(typeText, 1000);
    }
    
    /**
     * Tilt effect for skill items and contact cards
     */
    function initTiltEffect() {
        const tiltElements = document.querySelectorAll('.skill-item, .contact-card');
        
        tiltElements.forEach(element => {
            element.addEventListener('mousemove', function(e) {
                // Check if we're on mobile/tablet - don't apply tilt
                if (window.innerWidth <= 768) return;
                
                const rect = this.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                
                // Calculate tilt angles (max 10 degrees)
                const tiltX = ((y / rect.height) * 20) - 10;
                const tiltY = (((x / rect.width) * 20) - 10) * -1;
                
                // Apply transform
                this.style.transform = `perspective(1000px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) scale3d(1.05, 1.05, 1.05)`;
                this.style.transition = 'transform 0.1s ease';
            });
            
            element.addEventListener('mouseleave', function() {
                // Reset transform on mouse leave
                this.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) scale3d(1, 1, 1)';
                this.style.transition = 'transform 0.5s ease';
            });
        });
    }
});
