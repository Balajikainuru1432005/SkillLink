document.addEventListener("DOMContentLoaded", function() {
    // Seller details data (profile image is in HTML)
    const sellerDetails = {
        abc: {
            name: "ABC Hardware Store",
            rating: "4.7/5 (30 reviews)",
            totalPrice: "$95",
            location: "123 Main St, New York, NY 10001",
            parts: [
                { name: "Wire", price: "$10", quantity: 5 },
                { name: "Socket", price: "$5", quantity: 3 },
                { name: "Bulb", price: "$3", quantity: 10 }
            ],
            bio: "Trusted hardware store with a wide range of electrical supplies."
        },
        xyz: {
            name: "XYZ Supplies",
            rating: "4.5/5 (25 reviews)",
            totalPrice: "$100",
            location: "456 Elm St, Boston, MA 02108",
            parts: [
                { name: "Wire", price: "$12", quantity: 5 },
                { name: "Socket", price: "$6", quantity: 3 },
                { name: "Bulb", price: "$2", quantity: 10 }
            ],
            bio: "Reliable supplier for electrical components."
        },
        pqr: {
            name: "PQR Tools",
            rating: "4.8/5 (35 reviews)",
            totalPrice: "$90",
            location: "789 Oak St, Chicago, IL 60601",
            parts: [
                { name: "Wire", price: "$9", quantity: 5 },
                { name: "Socket", price: "$5", quantity: 3 },
                { name: "Bulb", price: "$3", quantity: 10 }
            ],
            bio: "Specializes in quality parts and excellent service."
        }
    };

    // Handle seller card clicks
    document.querySelectorAll(".seller-card").forEach(card => {
        card.addEventListener("click", function(e) {
            e.stopPropagation();

            const sellerId = this.getAttribute("data-seller");
            const detailsElement = document.getElementById(`details-${sellerId}`);

            // Toggle visibility of details for this card only
            if (detailsElement.classList.contains("active")) {
                detailsElement.classList.remove("active");
                detailsElement.innerHTML = "";
            } else {
                // Populate seller details with individual prices and exact location
                const details = sellerDetails[sellerId];
                detailsElement.innerHTML = `
                    <p><strong>Location:</strong> ${details.location}</p>
                    <p><strong>Parts Offered:</strong></p>
                    <ul>
                        ${details.parts.map(part => `
                            <li>${part.name}: ${part.price} x ${part.quantity} = $${parseFloat(part.price.replace('$', '')) * part.quantity}</li>
                        `).join('')}
                    </ul>
                    <p><strong>Bio:</strong> ${details.bio}</p>
                `;
                detailsElement.classList.add("active");
            }
        });
    });
});