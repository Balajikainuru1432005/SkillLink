document.addEventListener("DOMContentLoaded", function () {
    const form = document.querySelector(".supply-form-right form");
    const nextButton = document.getElementById("next-btn");

    form.addEventListener("submit", async function (event) {
        event.preventDefault(); // Stop default form submission

        let firstName = document.getElementById("first-name").value.trim();
        let lastName = document.getElementById("last-name").value.trim();
        let phone = document.getElementById("phone").value.trim();
        let email = document.getElementById("email").value.trim();
        let address = document.getElementById("address").value.trim();

        // Name Validation (Only letters)
        let nameRegex = /^[A-Za-z]+$/;
        if (!nameRegex.test(firstName) || !nameRegex.test(lastName)) {
            alert("Name should contain only letters.");
            return;
        }

        // Phone Number Validation (Exactly 10 digits)
        let phoneRegex = /^[0-9]{10}$/;
        if (!phoneRegex.test(phone)) {
            alert("Phone number must be exactly 10 digits.");
            return;
        }

        // Email Validation
        let emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            alert("Enter a valid email address.");
            return;
        }

        // Address Validation (Cannot be empty)
        if (address.length === 0) {
            alert("Address cannot be empty.");
            return;
        }

        // Store form data in session (optional)
        const formData = { firstName, lastName, phone, email, address };
        try {
            const response = await fetch('/save-supply-form1', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            const data = await response.json();
            if (data.success) {
                console.log("Form data saved:", formData);
                window.location.href = "/suppliesform2";
            } else {
                alert("Error saving form data: " + data.error);
            }
        } catch (error) {
            console.error("Error submitting form:", error);
            alert("Network error: Unable to save form data.");
        }
    });

    // Trigger validation on "Next" button click
    nextButton.addEventListener("click", function (event) {
        event.preventDefault();
        form.dispatchEvent(new Event("submit"));
    });
});