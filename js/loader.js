// Loader Script
document.addEventListener('DOMContentLoaded', () => {
    // Set a fake minimum loading time of 3 seconds for better UX
    const minLoadTime = 3000; // 3 seconds
    const startTime = Date.now();
    
    // Get the loader elements
    const loaderContainer = document.querySelector('.loader-container');
    const progressBar = document.querySelector('.loader-progress-bar');
    
    // Simulate progress updates
    let progress = 0;
    const progressInterval = setInterval(() => {
        if (progress < 90) {
            progress += Math.random() * 10;
            progressBar.style.width = `${Math.min(progress, 90)}%`;
        }
    }, 300);
    
    // Function to hide the loader
    const hideLoader = () => {
        // Ensure the progress bar reaches 100%
        progressBar.style.width = '100%';
        
        // Add a small delay for the progress bar to reach 100% visually
        setTimeout(() => {
            loaderContainer.classList.add('hidden');
            
            // Remove the loader from the DOM after the transition
            setTimeout(() => {
                loaderContainer.remove();
                document.body.style.overflow = 'auto'; // Enable scrolling
            }, 600); // Same as the transition time in CSS
            
            clearInterval(progressInterval);
        }, 400);
    };
    
    // Handle page load completion
    window.addEventListener('load', () => {
        const loadTime = Date.now() - startTime;
        
        if (loadTime < minLoadTime) {
            // If the page loaded too quickly, wait until the minimum time is reached
            setTimeout(hideLoader, minLoadTime - loadTime);
        } else {
            // If loading took longer than the minimum time, hide immediately
            hideLoader();
        }
    });
    
    // Fallback - hide loader after 8 seconds even if page hasn't fully loaded
    setTimeout(() => {
        if (document.querySelector('.loader-container')) {
            hideLoader();
        }
    }, 8000);
});