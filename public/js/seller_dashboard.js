document.addEventListener("DOMContentLoaded", function () {
    console.log("Seller Dashboard Loaded!");

    // ✅ Sidebar Navigation Handling
    document.querySelectorAll(".menu-item").forEach(menu => {
        menu.addEventListener("click", function () {
            // Remove "active" class from all menu items
            document.querySelectorAll(".menu-item").forEach(item => item.classList.remove("active"));
            menu.classList.add("active");

            // Hide all content sections
            document.querySelectorAll(".content-section").forEach(section => section.classList.remove("active"));

            // Show the selected section
            const sectionId = menu.getAttribute("data-section");
            const section = document.getElementById(sectionId);
            if (section) {
                section.classList.add("active");
            } else {
                console.error(`Section not found: ${sectionId}`);
            }
        });
    });

    // ✅ Ensure the default active section is set
    const defaultSection = document.querySelector(".menu-item.active")?.getAttribute("data-section");
    if (defaultSection) {
        document.getElementById(defaultSection)?.classList.add("active");
    }

    let selectedRequest = null;

    // ✅ Function to update pending count (Fixed template string issue)
    function updatePendingCount() {
        const requestsSection = document.getElementById("requests");
        const pendingCount = requestsSection ? requestsSection.querySelectorAll(".request-container").length : 0;
        const badge = document.getElementById("pending-count");
        if (badge) {
            badge.textContent = `${pendingCount} Pending`;
            badge.style.display = pendingCount === 0 ? "none" : "inline-block";
        }
    }

    // ✅ Initial count update
    updatePendingCount();

    // ✅ Show Part Request Form Below Clicked Request
    window.showParts = function (element) {
        document.querySelectorAll(".parts-form").forEach(form => form.remove());

        selectedRequest = element;

        const customer = element.getAttribute("data-customer");
        const location = element.getAttribute("data-location");
        const type = element.getAttribute("data-type");
        const parts = element.getAttribute("data-parts").split(", ");
        const units = element.getAttribute("data-units").split(", ");

        const partsForm = document.createElement("div");
        partsForm.classList.add("parts-form");
        partsForm.innerHTML = `
            <h4>Confirm Parts Availability</h4>
            <p><strong>Name:</strong> ${customer}</p>
            <p><strong>Location:</strong> ${location}</p>
            <p><strong>Type:</strong> ${type}</p>

            <table class="parts-table">
                <thead>
                    <tr>
                        <th>#</th>
                        <th>Part Name</th>
                        <th>Units Required</th>
                        <th>Availability</th>
                        <th>Price</th>
                    </tr>
                </thead>
                <tbody>
                    ${parts.map((part, index) => `
                        <tr>
                            <td>${index + 1}</td>
                            <td>${part}</td>
                            <td>${units[index]}</td>
                            <td><input type="checkbox" class="availability-checkbox"></td>
                            <td><input type="number" class="price-input" placeholder="Enter price"></td>
                        </tr>
                    `).join("")}
                </tbody>
            </table>

            <button class="confirm-btn">Send Response</button>
        `;

        element.after(partsForm);

        // ✅ Handle "Send Response" Click
        partsForm.querySelector(".confirm-btn").addEventListener("click", function () {
            let valid = true;
            let atLeastOneAvailable = false;

            partsForm.querySelectorAll("tbody tr").forEach(row => {
                const checkbox = row.querySelector(".availability-checkbox");
                const priceInput = row.querySelector(".price-input");

                if (checkbox.checked) {
                    atLeastOneAvailable = true;
                    if (!priceInput.value || priceInput.value <= 0) {
                        valid = false;
                    }
                }
            });

            if (!valid) {
                alert("Please enter valid prices for all available parts.");
            } else if (!atLeastOneAvailable) {
                alert("Please mark at least one part as available before sending a response.");
            } else {
                alert("Response sent to customer!");

                if (selectedRequest) {
                    selectedRequest.remove();
                    selectedRequest = null;
                }

                partsForm.remove();
                updatePendingCount(); // Update count after removal
            }
        });
    };

    // ✅ Redirect to seller profile on clicking "Update Your Profile"
    const updateBtn = document.getElementById("update-profile-btn");
    if (updateBtn) {
        updateBtn.addEventListener("click", () => {
            window.location.href = "/seller_profile";
        });
    }

    // ✅ Logout Handling
    const logoutBtn = document.getElementById("logout-btn");
    if (logoutBtn) {
        logoutBtn.addEventListener("click", function () {
            if (confirm("Are you sure you want to logout?")) {
                window.location.href = "/";
            }
        });
    }
});