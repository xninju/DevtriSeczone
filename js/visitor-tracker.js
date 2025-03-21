/*---------------------------------------------
 * Visitor Tracking JavaScript
 * Records site visitors and page views
 *--------------------------------------------*/

document.addEventListener('DOMContentLoaded', function() {
    'use strict';
    
    // DOM elements
    const visitorCountElement = document.getElementById('visitor-count');
    
    // Initialize tracking
    initVisitorTracking();
    
    /**
     * Initialize visitor tracking
     */
    function initVisitorTracking() {
        // Generate or retrieve visitor ID
        const visitorId = getVisitorId();
        
        // Record this visit
        recordVisit(visitorId);
        
        // Update visitor count in the UI
        updateVisitorCount();
        
        // Start session timer
        startSessionTimer();
        
        // Record page view
        recordPageView(visitorId);
    }
    
    /**
     * Generate or retrieve a unique visitor ID
     */
    function getVisitorId() {
        // Check if visitor already has an ID in localStorage
        let visitorId = localStorage.getItem('portfolio_visitor_id');
        
        // If no ID exists, generate a new one
        if (!visitorId) {
            visitorId = generateUUID();
            localStorage.setItem('portfolio_visitor_id', visitorId);
        }
        
        return visitorId;
    }
    
    /**
     * Generate a UUID v4 (random)
     */
    function generateUUID() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            const r = Math.random() * 16 | 0;
            const v = c === 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }
    
    /**
     * Record a visitor in localStorage
     */
    function recordVisit(visitorId) {
        // Get existing visitors array from localStorage
        const visitors = JSON.parse(localStorage.getItem('portfolio_visitors')) || [];
        
        // Check if this visitor is already recorded
        const existingVisitor = visitors.find(visitor => visitor.id === visitorId);
        
        // Get browser and device info
        const browserInfo = detectBrowser();
        const deviceInfo = detectDevice();
        const screenSize = window.innerWidth + 'x' + window.innerHeight;
        
        // If visitor exists, update last visit
        if (existingVisitor) {
            existingVisitor.timestamp = new Date().getTime();
            existingVisitor.visits++;
            existingVisitor.browser = browserInfo;
            existingVisitor.device = deviceInfo;
            existingVisitor.screenSize = screenSize;
        } else {
            // Otherwise add a new visitor
            visitors.push({
                id: visitorId,
                timestamp: new Date().getTime(),
                visits: 1,
                browser: browserInfo,
                device: deviceInfo,
                screenSize: screenSize
            });
        }
        
        // Save back to localStorage
        localStorage.setItem('portfolio_visitors', JSON.stringify(visitors));
    }
    
    /**
     * Update the visitor count in UI
     */
    function updateVisitorCount() {
        // Get visitor count from localStorage
        const visitors = JSON.parse(localStorage.getItem('portfolio_visitors')) || [];
        
        // Update UI
        if (visitorCountElement) {
            visitorCountElement.textContent = visitors.length;
            
            // Add animation effect to the count
            visitorCountElement.classList.add('pulse');
            setTimeout(() => {
                visitorCountElement.classList.remove('pulse');
            }, 1000);
        }
    }
    
    /**
     * Start a session timer to record visit duration
     */
    function startSessionTimer() {
        // Record session start time
        const sessionStart = new Date().getTime();
        localStorage.setItem('portfolio_session_start', sessionStart);
        
        // Set up event listener for when user leaves the page
        window.addEventListener('beforeunload', function() {
            // Calculate session duration
            const sessionEnd = new Date().getTime();
            const sessionDuration = (sessionEnd - sessionStart) / 1000; // in seconds
            
            // Only record if session was at least 5 seconds (avoid bounces)
            if (sessionDuration >= 5) {
                // Get existing durations
                const sessionDurations = JSON.parse(localStorage.getItem('portfolio_sessionDurations')) || [];
                
                // Add this session duration
                sessionDurations.push(sessionDuration);
                
                // Save back to localStorage
                localStorage.setItem('portfolio_sessionDurations', JSON.stringify(sessionDurations));
            }
        });
    }
    
    /**
     * Record a page view
     */
    function recordPageView(visitorId) {
        // Get current page
        const currentPage = window.location.pathname;
        
        // Get existing page views
        const pageViews = JSON.parse(localStorage.getItem('portfolio_pageviews')) || [];
        
        // Add this page view
        pageViews.push({
            visitorId: visitorId,
            page: currentPage,
            timestamp: new Date().getTime()
        });
        
        // Save back to localStorage
        localStorage.setItem('portfolio_pageviews', JSON.stringify(pageViews));
    }
    
    /**
     * Detect browser information
     */
    function detectBrowser() {
        const userAgent = navigator.userAgent;
        let browserName = "Unknown";
        
        if (userAgent.indexOf("Firefox") > -1) {
            browserName = "Firefox";
        } else if (userAgent.indexOf("Opera") > -1 || userAgent.indexOf("OPR") > -1) {
            browserName = "Opera";
        } else if (userAgent.indexOf("Trident") > -1) {
            browserName = "Internet Explorer";
        } else if (userAgent.indexOf("Edge") > -1) {
            browserName = "Edge";
        } else if (userAgent.indexOf("Chrome") > -1) {
            browserName = "Chrome";
        } else if (userAgent.indexOf("Safari") > -1) {
            browserName = "Safari";
        }
        
        return browserName;
    }
    
    /**
     * Detect device type
     */
    function detectDevice() {
        const userAgent = navigator.userAgent;
        
        if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent)) {
            if (/iPad|tablet|Tablet/i.test(userAgent)) {
                return "Tablet";
            }
            return "Mobile";
        }
        
        return "Desktop";
    }
    
    // Add CSS animation
    const style = document.createElement('style');
    style.textContent = `
        @keyframes pulse {
            0% { transform: scale(1); }
            50% { transform: scale(1.2); }
            100% { transform: scale(1); }
        }
        
        .pulse {
            animation: pulse 1s ease-in-out;
        }
    `;
    document.head.appendChild(style);
});