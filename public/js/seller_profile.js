document.addEventListener("DOMContentLoaded", function () {
    // Elements
    const displaySection = document.getElementById("profile-display");
    const editSection = document.getElementById("profile-edit");
    const editForm = document.getElementById("edit-form");
    const gallery = document.getElementById("shop-images-gallery");
    const sellerImage = document.getElementById("seller-image");
    const editSellerImage = document.getElementById("edit-seller-image");

    // Populate display (initially done by EJS, but we can update dynamically after changes)
    function updateDisplay(data) {
        sellerImage.src = data.profilePhoto || "/images/default-profile.png";
        document.getElementById("seller-name").textContent = `${data.firstName} ${data.lastName}`.trim();
        document.getElementById("shop-name").textContent = data.shopName;
        document.getElementById("shop-address").textContent = data.professionalAddress;
        document.getElementById("seller-address").textContent = data.personalAddress;
        document.getElementById("shop-contact").textContent = data.professionalPhone;
        document.getElementById("shop-email").textContent = data.professionalEmail;
        document.getElementById("parts-type").textContent = Array.isArray(data.shopTypes) ? data.shopTypes.join(", ") : "Not specified";

        gallery.innerHTML = "";
        if (data.shopImages && data.shopImages.length > 0) {
            data.shopImages.forEach((imageSrc, index) => {
                const div = document.createElement("div");
                div.classList.add("image-item");
                const img = document.createElement("img");
                img.src = imageSrc;
                img.alt = `Shop Image ${index + 1}`;
                const p = document.createElement("p");
                p.textContent = `Shop Image ${index + 1}`;
                div.appendChild(img);
                div.appendChild(p);
                gallery.appendChild(div);
            });
        } else {
            gallery.innerHTML = "<p>No shop images uploaded.</p>";
        }
    }

    // Edit button
    const editProfileBtn = document.getElementById("edit-profile-btn");
    if (editProfileBtn) {
        editProfileBtn.addEventListener("click", function () {
            displaySection.classList.add("hidden");
            editSection.classList.remove("hidden");

            // Populate edit form with current data
            editSellerImage.src = sellerImage.src;
            document.getElementById("edit-first-name").value = "<%= sellerProfile.firstName %>";
            document.getElementById("edit-last-name").value = "<%= sellerProfile.lastName %>";
            document.getElementById("edit-email").value = "<%= sellerProfile.email %>";
            document.getElementById("edit-phone").value = "<%= sellerProfile.phone %>";
            document.getElementById("edit-shop-name").value = "<%= sellerProfile.shopName %>";
            document.getElementById("edit-shop-address").value = "<%= sellerProfile.professionalAddress %>";
            document.getElementById("edit-seller-address").value = "<%= sellerProfile.personalAddress %>";
            document.getElementById("edit-shop-contact").value = "<%= sellerProfile.professionalPhone %>";
            document.getElementById("edit-shop-email").value = "<%= sellerProfile.professionalEmail %>";
            document.getElementById("edit-parts-type").value = "<% if (Array.isArray(sellerProfile.shopTypes)) { %><%= sellerProfile.shopTypes.join(', ') %><% } else { %>Not specified<% } %>";
        });
    } else {
        console.error("Edit Profile button not found!");
    }

    // Cancel button
    const cancelEditBtn = document.getElementById("cancel-edit-btn");
    if (cancelEditBtn) {
        cancelEditBtn.addEventListener("click", function () {
            editSection.classList.add("hidden");
            displaySection.classList.remove("hidden");
            document.getElementById("seller-image-upload").value = ""; // Clear file input
        });
    } else {
        console.error("Cancel button not found!");
    }

    // Save changes
    if (editForm) {
        editForm.addEventListener("submit", function (e) {
            e.preventDefault();

            const formData = new FormData();
            formData.append("firstName", document.getElementById("edit-first-name").value);
            formData.append("lastName", document.getElementById("edit-last-name").value);
            formData.append("email", document.getElementById("edit-email").value);
            formData.append("phone", document.getElementById("edit-phone").value);
            formData.append("shopName", document.getElementById("edit-shop-name").value);
            formData.append("professionalAddress", document.getElementById("edit-shop-address").value);
            formData.append("personalAddress", document.getElementById("edit-seller-address").value);
            formData.append("professionalPhone", document.getElementById("edit-shop-contact").value);
            formData.append("professionalEmail", document.getElementById("edit-shop-email").value);
            formData.append("shopTypes", JSON.stringify(document.getElementById("edit-parts-type").value.split(",").map(item => item.trim())));

            const sellerImageFile = document.getElementById("seller-image-upload").files[0];
            if (sellerImageFile) {
                formData.append("profilePhoto", sellerImageFile);
            }

            fetch('/update-seller-profile', {
                method: 'POST',
                body: formData
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    updateDisplay({
                        firstName: formData.get("firstName"),
                        lastName: formData.get("lastName"),
                        email: formData.get("email"),
                        phone: formData.get("phone"),
                        shopName: formData.get("shopName"),
                        professionalAddress: formData.get("professionalAddress"),
                        personalAddress: formData.get("personalAddress"),
                        professionalPhone: formData.get("professionalPhone"),
                        professionalEmail: formData.get("professionalEmail"),
                        shopTypes: JSON.parse(formData.get("shopTypes")),
                        profilePhoto: sellerImageFile ? URL.createObjectURL(sellerImageFile) : sellerImage.src,
                        shopImages: Array.from(document.querySelectorAll("#shop-images-gallery .image-item img")).map(img => img.src)
                    });
                    editSection.classList.add("hidden");
                    displaySection.classList.remove("hidden");
                    document.getElementById("seller-image-upload").value = ""; // Clear file input
                    alert("Profile updated successfully!");
                } else {
                    alert("Error updating profile: " + data.error);
                }
            })
            .catch(error => {
                console.error("Error updating profile:", error);
                alert("Error updating profile: " + error.message);
            });
        });
    } else {
        console.error("Edit form not found!");
    }

    // Shop images upload
    const uploadImagesBtn = document.getElementById("upload-images-btn");
    if (uploadImagesBtn) {
        uploadImagesBtn.addEventListener("click", function () {
            const files = document.getElementById("image-upload").files;
            if (files.length > 0) {
                const formData = new FormData();
                Array.from(files).forEach(file => {
                    formData.append("shopImages", file);
                });

                fetch('/upload-shop-images', {
                    method: 'POST',
                    body: formData
                })
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        const currentData = {
                            firstName: document.getElementById("seller-name").textContent.split(" ")[0],
                            lastName: document.getElementById("seller-name").textContent.split(" ").slice(1).join(" "),
                            email: document.getElementById("edit-email").value,
                            phone: document.getElementById("edit-phone").value,
                            shopName: document.getElementById("shop-name").textContent,
                            professionalAddress: document.getElementById("shop-address").textContent,
                            personalAddress: document.getElementById("seller-address").textContent,
                            professionalPhone: document.getElementById("shop-contact").textContent,
                            professionalEmail: document.getElementById("shop-email").textContent,
                            shopTypes: document.getElementById("parts-type").textContent.split(",").map(item => item.trim()),
                            profilePhoto: sellerImage.src,
                            shopImages: data.shopImages
                        };
                        updateDisplay(currentData);
                        alert("Shop images uploaded successfully!");
                        document.getElementById("image-upload").value = ""; // Clear input
                    } else {
                        alert("Error uploading images: " + data.error);
                    }
                })
                .catch(error => {
                    console.error("Error uploading images:", error);
                    alert("Error uploading images: " + error.message);
                });
            } else {
                alert("Please select at least one image to upload.");
            }
        });
    } else {
        console.error("Upload Images button not found!");
    }
});