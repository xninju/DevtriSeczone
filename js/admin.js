/*---------------------------------------------
 * Admin Dashboard JavaScript
 * Handles visitor analytics and dashboard
 *--------------------------------------------*/

document.addEventListener('DOMContentLoaded', function() {
    'use strict';
    
    // References to DOM elements
    const totalVisitorsCount = document.getElementById('total-visitors-count');
    const currentSessionCount = document.getElementById('current-session-count');
    const pageViewsCount = document.getElementById('page-views-count');
    const avgTimeCount = document.getElementById('avg-time-count');
    const visitorsTableBody = document.getElementById('visitors-table-body');
    
    // Load visitors data from localStorage
    const visitors = JSON.parse(localStorage.getItem('portfolio_visitors')) || [];
    const pageViews = JSON.parse(localStorage.getItem('portfolio_pageviews')) || [];
    const sessionDurations = JSON.parse(localStorage.getItem('portfolio_sessionDurations')) || [];
    
    // Update stats in the UI
    updateStats();
    
    // Populate visitors table
    populateVisitorsTable();
    
    // Initialize charts
    initCharts();
    
    // Function to update the dashboard stats
    function updateStats() {
        // Total unique visitors
        totalVisitorsCount.textContent = visitors.length;
        
        // Current session count (visitors in last 15 minutes)
        const recentVisitors = visitors.filter(visitor => {
            return (new Date().getTime() - visitor.timestamp) < 15 * 60 * 1000;
        });
        currentSessionCount.textContent = recentVisitors.length;
        
        // Total page views
        pageViewsCount.textContent = pageViews.length;
        
        // Average session duration
        const avgDuration = sessionDurations.length > 0 
            ? sessionDurations.reduce((acc, duration) => acc + duration, 0) / sessionDurations.length 
            : 0;
        avgTimeCount.textContent = Math.round(avgDuration / 60) + ' min';
    }
    
    // Function to populate the visitors table
    function populateVisitorsTable() {
        // Clear existing rows
        visitorsTableBody.innerHTML = '';
        
        // Sort visitors by timestamp (latest first)
        const sortedVisitors = [...visitors].sort((a, b) => b.timestamp - a.timestamp);
        
        // Show only the latest 10 visitors
        const recentVisitors = sortedVisitors.slice(0, 10);
        
        // Add rows for each visitor
        recentVisitors.forEach(visitor => {
            const row = document.createElement('tr');
            
            // Create visitor ID cell
            const idCell = document.createElement('td');
            idCell.textContent = visitor.id.substring(0, 8) + '...'; // Truncate ID for display
            row.appendChild(idCell);
            
            // Create visit time cell
            const timeCell = document.createElement('td');
            const visitDate = new Date(visitor.timestamp);
            timeCell.textContent = formatDate(visitDate);
            row.appendChild(timeCell);
            
            // Create browser cell
            const browserCell = document.createElement('td');
            browserCell.textContent = visitor.browser || 'Unknown';
            row.appendChild(browserCell);
            
            // Create device cell
            const deviceCell = document.createElement('td');
            deviceCell.textContent = visitor.device || 'Unknown';
            row.appendChild(deviceCell);
            
            // Create screen size cell
            const screenCell = document.createElement('td');
            screenCell.textContent = visitor.screenSize || 'Unknown';
            row.appendChild(screenCell);
            
            // Add the row to the table
            visitorsTableBody.appendChild(row);
        });
        
        // If no visitors, show a message
        if (recentVisitors.length === 0) {
            const row = document.createElement('tr');
            const cell = document.createElement('td');
            cell.setAttribute('colspan', '5');
            cell.textContent = 'No visitor data available yet.';
            cell.style.textAlign = 'center';
            cell.style.padding = '20px';
            row.appendChild(cell);
            visitorsTableBody.appendChild(row);
        }
    }
    
    // Function to format date for display
    function formatDate(date) {
        const now = new Date();
        const diff = now - date;
        
        // If less than a day
        if (diff < 24 * 60 * 60 * 1000) {
            return date.toLocaleTimeString();
        }
        
        // Otherwise show full date
        return date.toLocaleString();
    }
    
    // Function to initialize charts
    function initCharts() {
        // Traffic over time chart
        initTrafficChart();
        
        // Device distribution chart
        initDeviceChart();
    }
    
    // Initialize traffic chart
    function initTrafficChart() {
        const ctx = document.getElementById('traffic-chart').getContext('2d');
        
        // Group pageviews by hour
        const hourlyData = {};
        const now = new Date();
        
        // Initialize last 24 hours with 0 views
        for (let i = 23; i >= 0; i--) {
            const hour = new Date(now.getTime() - i * 60 * 60 * 1000).getHours();
            hourlyData[hour] = 0;
        }
        
        // Count pageviews for each hour in the last 24 hours
        pageViews.forEach(view => {
            const viewDate = new Date(view.timestamp);
            if (now.getTime() - viewDate.getTime() < 24 * 60 * 60 * 1000) {
                const hour = viewDate.getHours();
                hourlyData[hour] = (hourlyData[hour] || 0) + 1;
            }
        });
        
        // Prepare labels and data for the chart
        const hours = Object.keys(hourlyData).sort((a, b) => a - b);
        const formattedHours = hours.map(hour => {
            const hourInt = parseInt(hour);
            return hourInt === 0 ? '12 AM' : 
                   hourInt === 12 ? '12 PM' :
                   hourInt < 12 ? `${hourInt} AM` : `${hourInt - 12} PM`;
        });
        const viewCounts = hours.map(hour => hourlyData[hour]);
        
        // Create the chart
        new Chart(ctx, {
            type: 'line',
            data: {
                labels: formattedHours,
                datasets: [{
                    label: 'Page Views',
                    data: viewCounts,
                    backgroundColor: 'rgba(157, 78, 221, 0.2)',
                    borderColor: 'rgba(157, 78, 221, 1)',
                    borderWidth: 2,
                    tension: 0.4,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: {
                            color: 'rgba(255, 255, 255, 0.05)'
                        },
                        ticks: {
                            color: 'rgba(255, 255, 255, 0.7)'
                        }
                    },
                    x: {
                        grid: {
                            color: 'rgba(255, 255, 255, 0.05)'
                        },
                        ticks: {
                            color: 'rgba(255, 255, 255, 0.7)',
                            maxRotation: 45,
                            minRotation: 45
                        }
                    }
                },
                plugins: {
                    legend: {
                        labels: {
                            color: 'rgba(255, 255, 255, 0.7)'
                        }
                    }
                }
            }
        });
    }
    
    // Initialize device chart
    function initDeviceChart() {
        const ctx = document.getElementById('device-chart').getContext('2d');
        
        // Count devices
        const deviceCounts = {};
        visitors.forEach(visitor => {
            const device = visitor.device || 'Unknown';
            deviceCounts[device] = (deviceCounts[device] || 0) + 1;
        });
        
        // Prepare data for the chart
        const devices = Object.keys(deviceCounts);
        const counts = devices.map(device => deviceCounts[device]);
        
        // Define colors for the chart
        const backgroundColors = [
            'rgba(157, 78, 221, 0.7)',
            'rgba(33, 150, 243, 0.7)',
            'rgba(76, 175, 80, 0.7)',
            'rgba(255, 152, 0, 0.7)',
            'rgba(156, 39, 176, 0.7)'
        ];
        
        // Create the chart
        new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: devices,
                datasets: [{
                    data: counts,
                    backgroundColor: backgroundColors,
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'right',
                        labels: {
                            color: 'rgba(255, 255, 255, 0.7)'
                        }
                    }
                }
            }
        });
    }
    
    // Update data periodically to keep the dashboard current
    setInterval(updateStats, 60000); // Update every minute
});