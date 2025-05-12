let pieChart;
let lineChart;
let barChart;

document.addEventListener("DOMContentLoaded", function () {
    showSection("dashboard");

    const menuItems = document.querySelectorAll('.menu-item');
    menuItems.forEach(item => {
        item.addEventListener('click', () => {
            menuItems.forEach(i => i.classList.remove('active'));
            item.classList.add('active');
            const sectionId = item.getAttribute('data-section');
            showSection(sectionId);
        });
    });

    drawPieChart();
    drawBarChart();
    drawLineChart();
});

function showSection(sectionId) {
    const sections = document.querySelectorAll('.content-section');
    sections.forEach(section => section.classList.remove('active'));
    const activeSection = document.getElementById(sectionId);
    if (activeSection) activeSection.classList.add('active');
    const pageTitle = document.getElementById('page-title');
    if (pageTitle) {
        pageTitle.textContent = sectionId.replace("-", " ").replace(/\b\w/g, char => char.toUpperCase());
    }
}

function showNotification(message) {
    const notification = document.getElementById("notification");
    notification.textContent = message;
    notification.classList.add("show");
    setTimeout(() => notification.classList.remove("show"), 3000);
}

function updateProfile() {
    showNotification("Redirecting to Profile Update...");
    setTimeout(() => window.location.href = "profile.html", 2000);
}

function updateInfo() {
    showNotification("Redirecting to Update Info Page...");
    setTimeout(() => window.location.href = "update_info.html", 2000);
}

function updateTotals(type) {
    const totalElement = document.getElementById(`total-${type}s`);
    let currentTotal = parseInt(totalElement.textContent);
    totalElement.textContent = currentTotal - 1;
    updatePieChart();
    updateBarChart();
}

function removeUser(email, type) {
    if (!confirm(`Are you sure you want to remove this ${type}? This action cannot be undone.`)) return;

    const endpointMap = {
        'customer': '/remove-customer',
        'worker': '/remove-worker',
        'seller': '/remove-seller'
    };
    const endpoint = endpointMap[type];

    if (!endpoint) {
        showNotification('Invalid user type.');
        return;
    }

    fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    })
    .then(data => {
        if (data.success) {
            showNotification(`${type.charAt(0).toUpperCase() + type.slice(1)} removed successfully!`);
            const row = document.querySelector(`tr[data-id="${email}"][data-type="${type}"]`);
            if (row) row.remove();
            updateTotals(type);
        } else {
            showNotification(`Error: ${data.error}`);
        }
    })
    .catch(error => {
        console.error('Error removing user:', error);
        showNotification('Error removing user. Please try again.');
    });
}

function drawPieChart() {
    const ctx = document.getElementById('chart-pie').getContext('2d');
    const initialData = {
        customers: parseInt(document.getElementById('total-customers').textContent),
        workers: parseInt(document.getElementById('total-workers').textContent),
        sellers: parseInt(document.getElementById('total-sellers').textContent)
    };

    pieChart = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: ['Customers', 'Workers', 'Sellers'],
            datasets: [{
                data: [initialData.customers, initialData.workers, initialData.sellers],
                backgroundColor: ['#FF6B6B', '#4ECDC4', '#45B7D1'], // Updated vibrant colors
                borderWidth: 1,
                borderColor: '#fff'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { 
                    position: 'bottom',
                    labels: { 
                        color: '#333',
                        font: { size: 14 }
                    }
                },
                title: {
                    display: true,
                    text: 'User Distribution',
                    color: '#2C3E50',
                    font: { size: 18 }
                }
            },
            animation: {
                animateScale: true,
                animateRotate: true
            }
        }
    });
}

function updatePieChart() {
    const updatedData = {
        customers: parseInt(document.getElementById('total-customers').textContent),
        workers: parseInt(document.getElementById('total-workers').textContent),
        sellers: parseInt(document.getElementById('total-sellers').textContent)
    };
    
    pieChart.data.datasets[0].data = [updatedData.customers, updatedData.workers, updatedData.sellers];
    pieChart.update();
}

function drawBarChart() {
    const ctx = document.getElementById('chart-bar').getContext('2d');
    const initialData = {
        customers: parseInt(document.getElementById('total-customers').textContent),
        workers: parseInt(document.getElementById('total-workers').textContent),
        sellers: parseInt(document.getElementById('total-sellers').textContent)
    };

    barChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Customers', 'Workers', 'Sellers'],
            datasets: [{
                label: 'Number of Users',
                data: [initialData.customers, initialData.workers, initialData.sellers],
                backgroundColor: ['#FF6B6B', '#4ECDC4', '#45B7D1'], // Updated vibrant colors
                borderWidth: 1,
                borderColor: '#fff'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: { 
                        color: '#333',
                        font: { size: 14 }
                    }
                },
                title: {
                    display: true,
                    text: 'User Counts',
                    color: '#2C3E50',
                    font: { size: 18 }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: { color: 'rgba(0, 0, 0, 0.1)' },
                    ticks: { color: '#333' }
                },
                x: {
                    grid: { display: false },
                    ticks: { color: '#333' }
                }
            }
        }
    });
}

function updateBarChart() {
    const updatedData = {
        customers: parseInt(document.getElementById('total-customers').textContent),
        workers: parseInt(document.getElementById('total-workers').textContent),
        sellers: parseInt(document.getElementById('total-sellers').textContent)
    };
    
    barChart.data.datasets[0].data = [updatedData.customers, updatedData.workers, updatedData.sellers];
    barChart.update();
}

function drawLineChart() {
    const ctx = document.getElementById('chart-line').getContext('2d');
    lineChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May'],
            datasets: [{
                label: 'Users',
                data: JSON.parse('<%= JSON.stringify(chartData.line) %>'),
                borderColor: '#2C3E50',
                backgroundColor: 'rgba(44, 62, 80, 0.1)',
                fill: true,
                borderWidth: 2,
                pointRadius: 4,
                pointBackgroundColor: '#2C3E50',
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    labels: { color: '#333' }
                },
                title: {
                    display: true,
                    text: 'User Growth Over Time',
                    color: '#2C3E50',
                    font: { size: 18 }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: { color: 'rgba(0, 0, 0, 0.1)' },
                    ticks: { color: '#333' }
                },
                x: {
                    grid: { display: false },
                    ticks: { color: '#333' }
                }
            }
        }
    });
}