/**
 * Custom loader with smooth transition to content
 */
document.addEventListener('DOMContentLoaded', () => {
    const loaderContainer = document.querySelector('.loader-container');
    const progressBar = document.querySelector('.loader-progress-bar');
    const content = document.querySelector('main');
    const header = document.querySelector('header');
    const mobileNav = document.querySelector('.mobile-nav');
    const cursor = document.querySelector('.cursor');
    const cursorFollower = document.querySelector('.cursor-follower');
    const helpBot = document.querySelector('.help-bot');
    
    // Make sure content elements are visible (but hidden by loader overlay)
    if (content) content.style.opacity = '1';
    if (header) header.style.opacity = '1';
    if (mobileNav) mobileNav.style.opacity = '1';
    if (cursor) cursor.style.opacity = '1';
    if (cursorFollower) cursorFollower.style.opacity = '1';
    if (helpBot) helpBot.style.opacity = '1';
    
    // Simulate faster loading progress
    let progress = 0;
    const interval = setInterval(() => {
        progress += Math.random() * 15; // Faster progress
        if (progress > 100) progress = 100;
        
        if (progressBar) {
            progressBar.style.width = `${progress}%`;
        }
        
        if (progress === 100) {
            clearInterval(interval);
            
            // Add a small delay before showing content
            setTimeout(() => {
                // Fade out loader
                if (loaderContainer) {
                    loaderContainer.classList.add('fade-out');
                }
                
                // After short loader animation, show content
                setTimeout(() => {
                    if (loaderContainer) loaderContainer.style.display = 'none';
                    
                    // Make sure all content is visible and animated
                    document.body.classList.add('content-loaded');
                    
                    // Trigger any animations that depend on content being visible
                    if (typeof initParticleBackground === 'function') {
                        initParticleBackground();
                    }
                    if (typeof initRevealAnimations === 'function') {
                        initRevealAnimations();
                    }
                }, 700); // Shorter transition time
            }, 200); // Very small delay after reaching 100%
        }
    }, 50); // Update progress faster
});