document.addEventListener("DOMContentLoaded", function() {
    // Worker details data (profile image is now in HTML)
    const workerDetails = {
        john: {
            name: "John Doe",
            rating: "4.8/5 (20 reviews)",
            price: "$75",
            experience: "5 years",
            skills: "Electrical Wiring, Fan Installation, Lighting Repair",
            availability: "March 18, 2025, 2:00 PM",
            bio: "Certified electrician with a focus on residential repairs.",
            requestSent: false
        },
        jane: {
            name: "Jane Wilson",
            rating: "4.5/5 (15 reviews)",
            price: "$80",
            experience: "3 years",
            skills: "Wiring, Outlet Installation, Circuit Troubleshooting",
            availability: "March 18, 2025, 3:00 PM",
            bio: "Detail-oriented worker with excellent customer feedback.",
            requestSent: false
        },
        mike: {
            name: "Mike Brown",
            rating: "4.9/5 (25 reviews)",
            price: "$70",
            experience: "7 years",
            skills: "Wiring Fixes, Home Automation, Electrical Inspections",
            availability: "March 18, 2025, 1:00 PM",
            bio: "Highly experienced and reliable electrician.",
            requestSent: false
        }
    };

    // Handle worker card clicks
    document.querySelectorAll(".worker-card").forEach(card => {
        card.addEventListener("click", function(e) {
            e.stopPropagation();

            const workerId = this.getAttribute("data-worker");
            const detailsElement = document.getElementById(`details-${workerId}`);
            const details = workerDetails[workerId];

            // Toggle visibility of details for this card
            if (detailsElement.classList.contains("active")) {
                detailsElement.classList.remove("active");
                detailsElement.innerHTML = "";
            } else {
                // If request has been sent, show simplified details
                if (details.requestSent) {
                    detailsElement.innerHTML = `
                        <p class="request-sent">Request Sent</p>
                        <p><strong>Availability:</strong> ${details.availability}</p>
                        <p><strong>Bio:</strong> ${details.bio}</p>
                    `;
                } else {
                    // Show full details with submit button if request not sent
                    detailsElement.innerHTML = `
                        <p><strong>Experience:</strong> ${details.experience}</p>
                        <p><strong>Skills:</strong> ${details.skills}</p>
                        <p><strong>Availability:</strong> ${details.availability}</p>
                        <p><strong>Bio:</strong> ${details.bio}</p>
                        <button class="submit-request-btn">Submit Request</button>
                    `;

                    // Handle submit request button click
                    detailsElement.querySelector(".submit-request-btn").addEventListener("click", function(e) {
                        e.stopPropagation();

                        // Show alert and update card after clicking "OK"
                        alert(`Request submitted to ${details.name} for Wiring Fix at ${details.price}!`);

                        // Mark request as sent and update summary
                        details.requestSent = true;
                        const summaryText = card.querySelector(".summary-text");
                        summaryText.innerHTML = `
                            <p><strong>Worker:</strong> ${details.name}</p>
                            <p><strong>Status:</strong> Request Sent</p>
                        `;
                        card.classList.add("disabled");
                        detailsElement.classList.remove("active"); // Collapse details
                        detailsElement.innerHTML = ""; // Clear details
                    });
                }
                detailsElement.classList.add("active");
            }
        });
    });
});