document.addEventListener('DOMContentLoaded', function () {
    const sidebar = document.getElementById('sidebar');
    const sidebarToggle = document.getElementById('sidebar-toggle');
    const navLinks = document.querySelectorAll('.admin-nav a');
    const panels = document.querySelectorAll('.admin-panel');
    const cleanupBtn = document.getElementById('cleanup-btn');

    // Sidebar Toggle for Mobile
    if (sidebarToggle) {
        sidebarToggle.addEventListener('click', () => {
            sidebar.classList.toggle('active');
        });
    }

    // Navigation
    navLinks.forEach(link => {
        link.addEventListener('click', function (e) {
            e.preventDefault();
            const target = this.getAttribute('href').substring(1);
            panels.forEach(panel => {
                panel.classList.toggle('active', panel.id === target);
            });
            navLinks.forEach(nav => {
                nav.parentElement.classList.toggle('active', nav.getAttribute('href').substring(1) === target);
            });
            if (window.innerWidth <= 768) {
                sidebar.classList.remove('active');
            }
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    });

    // Fetch Stats
    async function fetchStats() {
        try {
            const [totalVisitors, totalPageViews, mobileUsers, pcUsers] = await Promise.all([
                fetch('/api/admin/total-visitors').then(res => res.json()),
                fetch('/api/admin/total-page-views').then(res => res.json()),
                fetch('/api/admin/mobile-users').then(res => res.json()),
                fetch('/api/admin/pc-users').then(res => res.json())
            ]);

            document.getElementById('total-visitors').textContent = totalVisitors.count || 0;
            document.getElementById('total-page-views').textContent = totalPageViews.count || 0;
            document.getElementById('mobile-users').textContent = `${(mobileUsers.percentage || 0).toFixed(1)}%`;
            document.getElementById('pc-users').textContent = `${(pcUsers.percentage || 0).toFixed(1)}%`;

            document.querySelectorAll('.stats-card').forEach(card => card.classList.add('pulse'));
            setTimeout(() => document.querySelectorAll('.stats-card').forEach(card => card.classList.remove('pulse')), 500);
        } catch (error) {
            console.error('Error fetching stats:', error);
        }
    }

    // Fetch Recent Visitors
    async function fetchRecentVisitors() {
        try {
            const response = await fetch('/api/admin/recent-visitors');
            const visitors = await response.json();
            const tableBody = document.getElementById('recent-visitors-table');
            tableBody.innerHTML = '';
            visitors.forEach(visitor => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${visitor.id}</td>
                    <td>${new Date(visitor.timestamp).toLocaleString()}</td>
                    <td>${visitor.visits}</td>
                    <td>${visitor.browser || 'Unknown'}</td>
                    <td>${visitor.device || 'Unknown'}</td>
                    <td>${visitor.screen_size || 'Unknown'}</td>
                `;
                tableBody.appendChild(row);
            });
        } catch (error) {
            console.error('Error fetching recent visitors:', error);
        }
    }

    // Fetch Contact Logs
    async function fetchContactLogs() {
        try {
            const response = await fetch('/api/admin/contact-logs');
            const logs = await response.json();
            const container = document.getElementById('contact-logs-container');
            container.innerHTML = '';

            if (logs.length === 0) {
                container.innerHTML = '<div class="col-12 text-center"><p>No contact submissions available.</p></div>';
                return;
            }

            logs.forEach(log => {
                const card = document.createElement('div');
                card.className = 'col-md-3 mb-4';
                card.innerHTML = `
                    <div class="contact-card">
                        <i class="fas fa-user-circle contact-icon"></i>
                        <h4>${log.name || 'Anonymous'}</h4>
                        <p><strong>Email:</strong> ${log.email || 'N/A'}</p>
                        <p><strong>Subject:</strong> ${log.subject || 'N/A'}</p>
                        <p class="message" title="${log.message || ''}">${log.message && log.message.length > 100 ? log.message.substring(0, 100) + '...' : log.message || 'No message'}</p>
                        <button class="delete-btn" data-id="${log.id}">Delete</button>
                    </div>
                `;
                container.appendChild(card);
            });

            // Add event listeners to delete buttons
            document.querySelectorAll('.delete-btn').forEach(button => {
                button.addEventListener('click', async function () {
                    const id = this.getAttribute('data-id');
                    if (confirm('Are you sure you want to delete this submission?')) {
                        try {
                            const response = await fetch(`/api/contact/delete/${id}`, {
                                method: 'DELETE'
                            });
                            if (response.ok) {
                                alert('Submission deleted successfully.');
                                await fetchContactLogs(); // Refresh logs
                            } else {
                                const result = await response.json();
                                alert(result.message || 'Failed to delete submission.');
                            }
                        } catch (error) {
                            console.error('Error deleting submission:', error);
                            alert('Error deleting submission.');
                        }
                    }
                });
            });
        } catch (error) {
            console.error('Error fetching contact logs:', error);
            document.getElementById('contact-logs-container').innerHTML = '<div class="col-12 text-center"><p>Error loading contact logs.</p></div>';
        }
    }

    // Chart.js Configurations
    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { labels: { color: '#ffffff' } } },
        scales: {
            x: { ticks: { color: '#cccccc' }, grid: { color: 'rgba(255,255,255,0.1)' } },
            y: { ticks: { color: '#cccccc' }, grid: { color: 'rgba(255,255,255,0.1)' } }
        }
    };

    async function fetchBrowserStats() {
        try {
            const response = await fetch('/api/admin/browser-stats');
            const data = await response.json();
            const statsContainer = document.getElementById('browser-stats');
            statsContainer.innerHTML = '';
            const total = data.reduce((sum, item) => sum + parseInt(item.count), 0);
            data.forEach(item => {
                const percentage = ((item.count / total) * 100).toFixed(1);
                const stat = document.createElement('div');
                stat.className = 'stat-item';
                stat.innerHTML = `
                    <div class="stat-name"><i class="fas fa-globe"></i> ${item.browser || 'Unknown'}</div>
                    <div class="stat-value">${item.count} (${percentage}%)</div>
                    <div class="progress-container"><div class="progress-bar" style="width: ${percentage}%"></div></div>
                `;
                statsContainer.appendChild(stat);
            });

            new Chart(document.getElementById('browser-chart'), {
                type: 'pie',
                data: {
                    labels: data.map(item => item.browser || 'Unknown'),
                    datasets: [{
                        data: data.map(item => item.count),
                        backgroundColor: ['#007bff', '#28a745', '#dc3545', '#ffc107', '#17a2b8', '#6f42c1']
                    }]
                },
                options: { ...chartOptions, plugins: { legend: { position: 'bottom' } } }
            });
        } catch (error) {
            console.error('Error fetching browser stats:', error);
        }
    }

    async function fetchPageStats() {
        try {
            const response = await fetch('/api/admin/page-stats');
            const data = await response.json();
            const statsContainer = document.getElementById('page-stats');
            statsContainer.innerHTML = '';
            const total = data.reduce((sum, item) => sum + parseInt(item.count), 0);
            data.forEach(item => {
                const percentage = ((item.count / total) * 100).toFixed(1);
                const stat = document.createElement('div');
                stat.className = 'stat-item';
                stat.innerHTML = `
                    <div class="stat-name"><i class="fas fa-file-alt"></i> ${item.page}</div>
                    <div class="stat-value">${item.count} (${percentage}%)</div>
                    <div class="progress-container"><div class="progress-bar" style="width: ${percentage}%"></div></div>
                `;
                statsContainer.appendChild(stat);
            });

            new Chart(document.getElementById('page-chart'), {
                type: 'bar',
                data: {
                    labels: data.map(item => item.page),
                    datasets: [{
                        label: 'Page Views',
                        data: data.map(item => item.count),
                        backgroundColor: '#007bff'
                    }]
                },
                options: chartOptions
            });
        } catch (error) {
            console.error('Error fetching page stats:', error);
        }
    }

    async function fetchDeviceStats() {
        try {
            const response = await fetch('/api/admin/device-stats');
            const data = await response.json();
            const statsContainer = document.getElementById('device-stats');
            statsContainer.innerHTML = '';
            const total = data.reduce((sum, item) => sum + parseInt(item.count), 0);
            data.forEach(item => {
                const percentage = ((item.count / total) * 100).toFixed(1);
                const stat = document.createElement('div');
                stat.className = 'stat-item';
                stat.innerHTML = `
                    <div class="stat-name"><i class="fas fa-mobile-alt"></i> ${item.device}</div>
                    <div class="stat-value">${item.count} (${percentage}%)</div>
                    <div class="progress-container"><div class="progress-bar" style="width: ${percentage}%"></div></div>
                `;
                statsContainer.appendChild(stat);
            });

            new Chart(document.getElementById('device-chart'), {
                type: 'doughnut',
                data: {
                    labels: data.map(item => item.device),
                    datasets: [{
                        data: data.map(item => item.count),
                        backgroundColor: ['#007bff', '#28a745', '#dc3545', '#ffc107']
                    }]
                },
                options: { ...chartOptions, plugins: { legend: { position: 'bottom' } } }
            });
        } catch (error) {
            console.error('Error fetching device stats:', error);
        }
    }

    async function fetchSessionStats() {
        try {
            const response = await fetch('/api/admin/session-buckets');
            const data = await response.json();

            new Chart(document.getElementById('session-chart'), {
                type: 'bar',
                data: {
                    labels: data.map(item => item.bucket),
                    datasets: [{
                        label: 'Sessions',
                        data: data.map(item => item.count),
                        backgroundColor: '#007bff'
                    }]
                },
                options: chartOptions
            });
        } catch (error) {
            console.error('Error fetching session stats:', error);
        }
    }

    // Cleanup Old Data
    if (cleanupBtn) {
        cleanupBtn.addEventListener('click', async () => {
            if (confirm('Are you sure you want to delete data older than 30 days?')) {
                try {
                    const response = await fetch('/api/admin/cleanup', { method: 'POST' });
                    if (response.ok) {
                        alert('Old data cleaned up successfully.');
                        fetchStats();
                        fetchRecentVisitors();
                        fetchBrowserStats();
                        fetchPageStats();
                        fetchDeviceStats();
                        fetchSessionStats();
                        fetchContactLogs();
                    } else {
                        alert('Failed to clean up old data.');
                    }
                } catch (error) {
                    console.error('Error cleaning up data:', error);
                    alert('Error cleaning up data.');
                }
            }
        });
    }

    // Initialize
    fetchStats();
    fetchRecentVisitors();
    fetchBrowserStats();
    fetchPageStats();
    fetchDeviceStats();
    fetchSessionStats();
    fetchContactLogs();
});
