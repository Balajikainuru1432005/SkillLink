document.addEventListener("DOMContentLoaded", function () {
   // Fetch and display earnings
function fetchEarnings() {
    fetch('/api/worker/earnings')
        .then(res => {
            if (!res.ok) throw new Error(`HTTP error! Status: ${res.status}`);
            return res.json();
        })
        .then(data => {
            if (data.success) {
                document.getElementById('total-earnings').textContent = `₹${data.earnings.total.toFixed(2)}`;
                document.getElementById('completed-earnings').textContent = `₹${data.earnings.completed.toFixed(2)}`;
                document.getElementById('pending-earnings').textContent = `₹${data.earnings.pending.toFixed(2)}`;
            } else {
                console.error('Error fetching earnings:', data.error);
                alert('Error fetching earnings: ' + data.error);
            }
        })
        .catch(err => {
            console.error('Error fetching earnings:', err);
            alert('Error fetching earnings: Network error');
        });
}

 // Fetch and display work history
function fetchWorkHistory() {
    fetch('/api/worker/work-history')
        .then(res => {
            if (!res.ok) throw new Error(`HTTP error! Status: ${res.status}`);
            return res.json();
        })
        .then(data => {
            const tbody = document.getElementById('work-history-body');
            tbody.innerHTML = '';
            if (data.success && data.workHistory.length > 0) {
                data.workHistory.forEach(work => {
                    const row = document.createElement('tr');
                    row.innerHTML = `
                        <td>${work.job}</td>
                        <td>${work.customer}</td>
                        <td>${work.date}</td>
                        <td>${work.price}</td>
                        <td>${work.rating || 'N/A'}</td>
                        <td>${work.feedback || 'N/A'}</td>
                    `;
                    tbody.appendChild(row);
                });
            } else {
                tbody.innerHTML = '<tr><td colspan="6">No work history available.</td></tr>';
            }
        })
        .catch(err => {
            console.error('Error fetching work history:', err);
            document.getElementById('work-history-body').innerHTML = '<tr><td colspan="6">Error loading work history.</td></tr>';
        });
}
// Fetch and display requests
function fetchRequests() {
    fetch('/api/worker/requests')
        .then(res => {
            if (!res.ok) throw new Error(`HTTP error! Status: ${res.status}`);
            return res.json();
        })
        .then(data => {
            const requestsList = document.getElementById('requests-list');
            requestsList.innerHTML = '';
            if (data.success && data.requests.length > 0) {
                data.requests.forEach(request => {
                    const requestItem = document.createElement('div');
                    requestItem.classList.add('job-card');
                    requestItem.setAttribute('data-job-id', request.id);
                    requestItem.innerHTML = `
                        <div class="job-header">${request.header}</div>
                        <p><span class="label">Customer:</span> ${request.customer}</p>
                        <p><span class="label">Location:</span> ${request.location || 'Not provided'}</p>
                        <p><span class="label">Time:</span> ${request.time || 'Not specified'}</p>
                        <p><span class="label">Description:</span> ${request.description || 'No description'}</p>
                        <p><span class="label">Status:</span> ${request.status}</p>
                        ${request.status === 'pending' ? `
                            <div class="job-actions">
                                <input type="number" class="price-input" placeholder="Set Price (₹)" min="1" step="1" required>
                                <button class="accept-btn">Accept</button>
                                <button class="reject-btn">Reject</button>
                            </div>
                        ` : ''}
                    `;
                    requestsList.appendChild(requestItem);
                });

                // Add event listeners for action buttons
                document.querySelectorAll('.accept-btn').forEach(button => {
                    button.addEventListener('click', function () {
                        const requestId = this.closest('.job-card').getAttribute('data-job-id');
                        const priceInput = this.closest('.job-actions').querySelector('.price-input');
                        const price = parseFloat(priceInput.value);
                        if (!price || price <= 0) {
                            alert('Please enter a valid price greater than 0.');
                            return;
                        }

                        fetch('/api/worker/accept-request', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ requestId, price })
                        })
                            .then(res => res.json())
                            .then(data => {
                                if (data.success) {
                                    alert('Request accepted successfully!');
                                    fetchRequests();
                                    fetchEarnings(); // Refresh earnings to reflect pending amount
                                } else {
                                    alert('Error accepting request: ' + data.error);
                                }
                            })
                            .catch(err => {
                                console.error('Error accepting request:', err);
                                alert('Error accepting request: Network error');
                            });
                    });
                });

                document.querySelectorAll('.reject-btn').forEach(button => {
                    button.addEventListener('click', function () {
                        const requestId = this.closest('.job-card').getAttribute('data-job-id');
                        fetch('/api/reject-job', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ jobId: requestId })
                        })
                            .then(res => res.json())
                            .then(data => {
                                if (data.success) {
                                    alert('Request rejected successfully!');
                                    fetchRequests();
                                } else {
                                    alert('Error rejecting request: ' + data.error);
                                }
                            })
                            .catch(err => {
                                console.error('Error rejecting request:', err);
                                alert('Error rejecting request: Network error');
                            });
                    });
                });
            } else {
                requestsList.innerHTML = '<p>No requests found.</p>';
            }
        })
        .catch(err => {
            console.error('Error fetching requests:', err);
            document.getElementById('requests-list').innerHTML = '<p>Error loading requests.</p>';
        });
}

// Add event listeners for server-side rendered job cards
document.querySelectorAll('.job-card .accept-btn').forEach(button => {
    button.addEventListener('click', function () {
        const jobId = this.closest('.job-card').getAttribute('data-job-id');
        const priceInput = this.closest('.job-actions').querySelector('.price-input');
        const price = parseFloat(priceInput.value);
        if (!price || price <= 0) {
            alert('Please enter a valid price greater than 0.');
            return;
        }

        fetch('/api/worker/accept-request', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ requestId: jobId, price })
        })
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    alert('Request accepted successfully!');
                    fetchRequests();
                    fetchEarnings();
                } else {
                    alert('Error accepting request: ' + data.error);
                }
            })
            .catch(err => {
                console.error('Error accepting request:', err);
                alert('Error accepting request: Network error');
            });
    });
});

document.querySelectorAll('.job-card .reject-btn').forEach(button => {
    button.addEventListener('click', function () {
        const jobId = this.closest('.job-card').getAttribute('data-job-id');
        fetch('/api/reject-job', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ jobId })
        })
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    alert('Request rejected successfully!');
                    fetchRequests();
                } else {
                    alert('Error rejecting request: ' + data.error);
                }
            })
            .catch(err => {
                console.error('Error rejecting request:', err);
                alert('Error rejecting request: Network error');
            });
    });
});

    // Sidebar Navigation
document.querySelectorAll(".menu-item").forEach(menu => {
    menu.addEventListener("click", function () {
        document.querySelectorAll(".menu-item").forEach(item => item.classList.remove("active"));
        menu.classList.add("active");
        document.querySelectorAll(".content-section").forEach(section => section.classList.remove("active"));
        const sectionId = menu.getAttribute("data-section");
        document.getElementById(sectionId).classList.add("active");
        if (sectionId === "earnings") {
            fetchEarnings();
        } else if (sectionId === "work-history") {
            fetchWorkHistory();
        } else if (sectionId === "requests") {
            fetchRequests();
        }
    });
});


    // Logout
    document.getElementById("logout-btn").addEventListener("click", function () {
        if (confirm("Are you sure you want to logout?")) window.location.href = "/logout";
    });

    // Initial load
    fetchEarnings();
    fetchRequests();
});