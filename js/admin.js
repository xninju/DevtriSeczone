document.addEventListener('DOMContentLoaded', function() {
    'use strict';

    // Debug mode for detailed logging
    const DEBUG = true;

    // DOM elements
    const elements = {
        totalVisitors: document.getElementById('total-visitors'),
        totalPageViews: document.getElementById('total-page-views'),
        mobileUsers: document.getElementById('mobile-users'),
        pcUsers: document.getElementById('pc-users'),
        visitorsTableBody: document.getElementById('visitors-table-body'),
        contactLogsTableBody: document.getElementById('contact-logs-table-body'),
        browserStats: document.getElementById('browser-stats'),
        pageStats: document.getElementById('page-stats'),
        deviceChart: document.getElementById('device-chart'),
        sessionChart: document.getElementById('session-chart')
    };

    // Check for missing DOM elements
    Object.entries(elements).forEach(([key, element]) => {
        if (!element && DEBUG) {
            console.warn(`Element #${key} not found in admin.html`);
        }
    });

    // API endpoint
    const API_BASE_URL = '/api';

    // Initialize dashboard
    updateStats();

    // Set up auto-refresh every 30 seconds
    setInterval(updateStats, 30000);

    // Set up navigation
    const navItems = document.querySelectorAll('.admin-nav li');
    const adminPanels = document.querySelectorAll('.admin-panel');
    navItems.forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            navItems.forEach(navItem => navItem.classList.remove('active'));
            this.classList.add('active');
            const targetId = this.querySelector('a').getAttribute('href').substring(1);
            adminPanels.forEach(panel => {
                panel.classList.remove('active');
                if (panel.id === targetId) {
                    panel.classList.add('active');
                }
            });
        });
    });

    // Mobile sidebar toggle
    const sidebarToggle = document.querySelector('.sidebar-toggle');
    const sidebar = document.querySelector('.admin-sidebar');
    if (sidebarToggle && sidebar) {
        sidebarToggle.addEventListener('click', function() {
            sidebar.classList.toggle('active');
        });
    }

    /**
     * Update all statistics
     */
    async function updateStats() {
        // Show loading state
        if (elements.totalVisitors) elements.totalVisitors.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
        if (elements.totalPageViews) elements.totalPageViews.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
        if (elements.mobileUsers) elements.mobileUsers.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
        if (elements.pcUsers) elements.pcUsers.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
        if (elements.visitorsTableBody) elements.visitorsTableBody.innerHTML = '<tr><td colspan="6"><i class="fas fa-spinner fa-spin"></i> Loading...</td></tr>';
        if (elements.contactLogsTableBody) elements.contactLogsTableBody.innerHTML = '<tr><td colspan="6"><i class="fas fa-spinner fa-spin"></i> Loading...</td></tr>';
        if (elements.browserStats) elements.browserStats.innerHTML = '<p><i class="fas fa-spinner fa-spin"></i> Loading...</p>';
        if (elements.pageStats) elements.pageStats.innerHTML = '<p><i class="fas fa-spinner fa-spin"></i> Loading...</p>';

        // API endpoints
        const endpoints = [
            { url: `${API_BASE_URL}/admin/total-visitors`, key: 'totalVisitors', default: { count: 0 } },
            { url: `${API_BASE_URL}/admin/total-page-views`, key: 'totalPageViews', default: { count: 0 } },
            { url: `${API_BASE_URL}/admin/mobile-users`, key: 'mobileUsers', default: { percentage: 0 } },
            { url: `${API_BASE_URL}/admin/pc-users`, key: 'pcUsers', default: { percentage: 0 } },
            { url: `${API_BASE_URL}/admin/recent-visitors`, key: 'recentVisitors', default: [] },
            { url: `${API_BASE_URL}/admin/browser-stats`, key: 'browserStats', default: [] },
            { url: `${API_BASE_URL}/admin/page-stats`, key: 'pageStats', default: [] },
            { url: `${API_BASE_URL}/admin/device-stats`, key: 'deviceStats', default: [] },
            { url: `${API_BASE_URL}/admin/session-buckets`, key: 'sessionBuckets', default: [] },
            { url: `${API_BASE_URL}/admin/contact-logs`, key: 'contactLogs', default: [] }
        ];

        const results = {};
        const fetchPromises = endpoints.map(async ({ url, key, default: defaultValue }) => {
            try {
                const response = await fetch(url);
                if (!response.ok) {
                    throw new Error(`HTTP ${response.status} for ${url}`);
                }
                const data = await response.json();
                results[key] = data || defaultValue;
                if (DEBUG) console.log(`Fetched ${url}:`, data);
            } catch (error) {
                console.error(`Error fetching ${url}:`, error);
                results[key] = defaultValue;
            }
        });

        await Promise.all(fetchPromises);

        // Fallback to localStorage for contact logs
        if (results.contactLogs.length === 0) {
            const contactLogs = JSON.parse(localStorage.getItem('portfolio_contact_logs')) || [];
            if (contactLogs.length > 0) {
                results.contactLogs = contactLogs;
                if (DEBUG) console.log('Using localStorage for contact logs:', contactLogs);
            }
        }

        // Update UI
        updateDashboardWithData(
            results.totalVisitors.count || 0,
            results.totalPageViews.count || 0,
            results.mobileUsers.percentage || 0,
            results.pcUsers.percentage || 0,
            results.recentVisitors || [],
            results.browserStats || [],
            results.pageStats || [],
            results.deviceStats || [],
            results.sessionBuckets || [],
            results.contactLogs || []
        );
    }

    /**
     * Update dashboard with data
     */
    function updateDashboardWithData(totalVisitors, totalPageViews, mobilePercentage, pcPercentage, visitors, browserStats, pageStats, deviceStats, sessionBuckets, contactLogs) {
        if (elements.totalVisitors) {
            elements.totalVisitors.textContent = totalVisitors;
            elements.totalVisitors.closest('.stats-card')?.classList.add('pulse');
            setTimeout(() => elements.totalVisitors.closest('.stats-card')?.classList.remove('pulse'), 1000);
        }

        if (elements.totalPageViews) {
            elements.totalPageViews.textContent = totalPageViews;
            elements.totalPageViews.closest('.stats-card')?.classList.add('pulse');
            setTimeout(() => elements.totalPageViews.closest('.stats-card')?.classList.remove('pulse'), 1000);
        }

        if (elements.mobileUsers) {
            elements.mobileUsers.textContent = `${mobilePercentage}%`;
            elements.mobileUsers.closest('.stats-card')?.classList.add('pulse');
            setTimeout(() => elements.mobileUsers.closest('.stats-card')?.classList.remove('pulse'), 1000);
        }

        if (elements.pcUsers) {
            elements.pcUsers.textContent = `${pcPercentage}%`;
            elements.pcUsers.closest('.stats-card')?.classList.add('pulse');
            setTimeout(() => elements.pcUsers.closest('.stats-card')?.classList.remove('pulse'), 1000);
        }

        if (elements.visitorsTableBody) {
            populateVisitorsTable(visitors);
        }

        if (elements.contactLogsTableBody) {
            populateContactLogsTable(contactLogs);
        }

        if (elements.browserStats) {
            updateBrowserStats(browserStats);
        }

        if (elements.pageStats) {
            updatePageStats(pageStats);
        }

        if (elements.deviceChart || elements.sessionChart) {
            initCharts(deviceStats, sessionBuckets);
        }
    }

    /**
     * Format date
     */
    function formatDate(timestamp) {
        try {
            const date = new Date(timestamp);
            if (isNaN(date.getTime())) throw new Error('Invalid timestamp');
            return date.toLocaleString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch (error) {
            console.error('Error formatting date:', error);
            return 'Invalid Date';
        }
    }

    /**
     * Initialize charts
     */
    function initCharts(deviceStats, sessionBuckets) {
        if (typeof Chart === 'undefined') {
            console.error('Chart.js not loaded');
            return;
        }

        if (elements.deviceChart) {
            initDeviceChart(deviceStats);
        }

        if (elements.sessionChart) {
            initSessionChart(sessionBuckets);
        }
    }

    /**
     * Device distribution chart
     */
    function initDeviceChart(deviceStats) {
        const ctx = elements.deviceChart.getContext('2d');
        new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: deviceStats.map(stat => stat.device || 'Unknown'),
                datasets: [{
                    data: deviceStats.map(stat => stat.count || 0),
                    backgroundColor: ['#9D4EDD', '#C4A1FF', '#5A189A'],
                    borderColor: '#121212',
                    borderWidth: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: { color: '#CCCCCC', padding: 15 }
                    }
                }
            }
        });
    }

    /**
     * Session duration chart
     */
    function initSessionChart(sessionBuckets) {
        const ctx = elements.sessionChart.getContext('2d');
        new Chart(ctx, {
            type: 'bar',
            data: {
                labels: sessionBuckets.map(stat => stat.bucket || 'Unknown'),
                datasets: [{
                    label: 'Number of Sessions',
                    data: sessionBuckets.map(stat => stat.count || 0),
                    backgroundColor: '#9D4EDD',
                    borderColor: '#5A189A',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: { beginAtZero: true, ticks: { color: '#CCCCCC' }, grid: { color: 'rgba(255, 255, 255, 0.05)' } },
                    x: { ticks: { color: '#CCCCCC' }, grid: { color: 'rgba(255, 255, 255, 0.05)' } }
                },
                plugins: { legend: { labels: { color: '#CCCCCC' } } }
            }
        });
    }

    /**
     * Populate visitors table
     */
    function populateVisitorsTable(visitors) {
        elements.visitorsTableBody.innerHTML = '';

        if (!visitors || visitors.length === 0) {
            elements.visitorsTableBody.innerHTML = '<tr><td colspan="6">No visitor data available</td></tr>';
            return;
        }

        const sortedVisitors = [...visitors].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        sortedVisitors.forEach(visitor => {
            const row = document.createElement('tr');

            row.innerHTML = `
                <td>${visitor.id?.substring(0, 8) + '...' || 'N/A'}</td>
                <td>${formatDate(visitor.timestamp)}</td>
                <td>${visitor.visits || 0}</td>
                <td>${visitor.browser || 'Unknown'}</td>
                <td>${visitor.device || 'Unknown'}</td>
                <td>${visitor.screenSize || 'Unknown'}</td>
            `;

            elements.visitorsTableBody.appendChild(row);
        });
    }

    /**
     * Populate contact logs table
     */
    function populateContactLogsTable(contactLogs) {
        elements.contactLogsTableBody.innerHTML = '';

        if (!contactLogs || contactLogs.length === 0) {
            elements.contactLogsTableBody.innerHTML = '<tr><td colspan="6">No contact submissions available</td></tr>';
            return;
        }

        const sortedLogs = [...contactLogs].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        sortedLogs.forEach(log => {
            const row = document.createElement('tr');

            row.innerHTML = `
                <td>${log.id?.substring(0, 8) + '...' || 'N/A'}</td>
                <td>${log.name || 'N/A'}</td>
                <td>${log.email || 'N/A'}</td>
                <td title="${log.subject || ''}">${log.subject && log.subject.length > 30 ? log.subject.substring(0, 30) + '...' : log.subject || 'N/A'}</td>
                <td title="${log.message || ''}">${log.message && log.message.length > 30 ? log.message.substring(0, 30) + '...' : log.message || 'N/A'}</td>
                <td>${formatDate(log.timestamp)}</td>
            `;

            elements.contactLogsTableBody.appendChild(row);
        });
    }

    /**
     * Update browser stats
     */
    function updateBrowserStats(browserStats) {
        elements.browserStats.innerHTML = '';

        if (!browserStats || browserStats.length === 0) {
            elements.browserStats.innerHTML = '<p>No browser data available</p>';
            return;
        }

        const total = browserStats.reduce((sum, stat) => sum + (stat.count || 0), 0);
        browserStats.forEach(stat => {
            const percentage = total > 0 ? Math.round((stat.count / total) * 100) : 0;
            const statItem = document.createElement('div');
            statItem.className = 'stat-item';
            let iconClass = 'fas fa-globe';
            if (stat.browser === 'Chrome') iconClass = 'fab fa-chrome';
            else if (stat.browser === 'Firefox') iconClass = 'fab fa-firefox';
            else if (stat.browser === 'Safari') iconClass = 'fab fa-safari';
            else if (stat.browser === 'Edge') iconClass = 'fab fa-edge';
            else if (stat.browser === 'Opera') iconClass = 'fab fa-opera';
            else if (stat.browser === 'Internet Explorer') iconClass = 'fab fa-internet-explorer';
            statItem.innerHTML = `
                <div class="stat-name"><i class="${iconClass}"></i> ${stat.browser || 'Unknown'}</div>
                <div class="stat-value">${percentage}%</div>
                <div class="progress-container"><div class="progress-bar" style="width: ${percentage}%"></div></div>
            `;
            elements.browserStats.appendChild(statItem);
        });
    }

    /**
     * Update page stats
     */
    function updatePageStats(pageStats) {
        elements.pageStats.innerHTML = '';

        if (!pageStats || pageStats.length === 0) {
            elements.pageStats.innerHTML = '<p>No page data available</p>';
            return;
        }

        const total = pageStats.reduce((sum, stat) => sum + (stat.count || 0), 0);
        pageStats.forEach(stat => {
            const percentage = total > 0 ? Math.round((stat.count / total) * 100) : 0;
            const statItem = document.createElement('div');
            statItem.className = 'stat-item';
            let pageName = stat.page === '/' ? 'Home' : stat.page?.split('/').pop()?.split('.')[0] || 'Unknown';
            pageName = pageName.charAt(0).toUpperCase() + pageName.slice(1);
            statItem.innerHTML = `
                <div class="stat-name"><i class="fas fa-file"></i> ${pageName}</div>
                <div class="stat-value">${stat.count} views</div>
                <div class="progress-container"><div class="progress-bar" style="width: ${percentage}%"></div></div>
            `;
            elements.pageStats.appendChild(statItem);
        });
    }

    /**
     * Clean up old data
     */
    window.cleanupOldData = async function() {
        try {
            const response = await fetch(`${API_BASE_URL}/admin/cleanup`, { method: 'POST' });
            const data = await response.json();
            if (data.success) {
                alert('Old data cleaned up successfully');
                updateStats();
            } else {
                alert('Failed to clean up data');
            }
        } catch (error) {
            console.error('Error cleaning up data:', error);
            alert('Error cleaning up data');
        }
    };
});
