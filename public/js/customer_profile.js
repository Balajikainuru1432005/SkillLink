document.addEventListener("DOMContentLoaded", function () {
    console.log("customer_profile.js loaded successfully");

    // Sidebar Navigation
    const menuItems = document.querySelectorAll(".menu-item");
    if (menuItems.length > 0) {
        menuItems.forEach(menu => {
            menu.addEventListener("click", function () {
                console.log("Menu clicked:", menu.getAttribute("data-section"));
                menuItems.forEach(item => item.classList.remove("active"));
                menu.classList.add("active");
                document.querySelectorAll(".content-section").forEach(section => section.classList.remove("active"));
                const sectionId = menu.getAttribute("data-section");
                document.getElementById(sectionId).classList.add("active");
                if (sectionId === "dashboard") {
                    window.location.href = "/customer_dashboard";
                }
            });
        });
    } else {
        console.error("No menu items found");
    }

    // Photo Upload
    const changePhotoBtn = document.getElementById('change-photo-btn');
    const photoInput = document.getElementById('profile-photo-input');
    const photoForm = document.getElementById('photo-upload-form');
    if (changePhotoBtn && photoInput && photoForm) {
        console.log("Photo upload elements found");
        changePhotoBtn.addEventListener('click', function () {
            console.log("Change photo button clicked");
            photoInput.click();
        });
        photoInput.addEventListener('change', async function () {
            console.log("Photo input changed, files:", photoInput.files);
            if (photoInput.files.length === 0) {
                console.error("No file selected");
                return;
            }
            const formData = new FormData(photoForm);
            try {
                console.log("Sending photo update request...");
                const response = await fetch('/update-customer-profile', {
                    method: 'POST',
                    body: formData
                });
                const data = await response.json();
                console.log("Photo update response:", data);
                if (data.success) {
                    document.querySelector('.profile-photo').src = data.profilePhoto;
                    document.getElementById('profile-pic').src = data.profilePhoto;
                    alert('Profile photo updated successfully!');
                } else {
                    alert('Error: ' + data.error);
                }
            } catch (error) {
                console.error('Photo upload error:', error);
                alert('Network error: Unable to update photo.');
            }
        });
    } else {
        console.error("Photo upload elements missing:", { changePhotoBtn, photoInput, photoForm });
    }

    // Address Modal
    const editProfileBtn = document.getElementById('edit-profile-btn');
    const addressModal = document.getElementById('address-modal');
    const cancelAddressBtn = document.getElementById('cancel-address-btn');
    const addressForm = document.getElementById('address-form');
    if (editProfileBtn && addressModal && cancelAddressBtn && addressForm) {
        console.log("Address modal elements found");
        editProfileBtn.addEventListener('click', function () {
            console.log("Edit profile button clicked");
            addressModal.style.display = 'flex';
        });
        cancelAddressBtn.addEventListener('click', function () {
            console.log("Cancel button clicked");
            addressModal.style.display = 'none';
        });
        addressModal.addEventListener('click', function (e) {
            if (e.target === addressModal) {
                console.log("Clicked outside modal, closing");
                addressModal.style.display = 'none';
            }
        });
        addressForm.addEventListener('submit', async function (e) {
            e.preventDefault();
            console.log("Address form submitted");
            const formData = new FormData(addressForm);
            const userProfile = <%- JSON.stringify(userProfile) %>;
            formData.append('firstName', userProfile.firstName);
            formData.append('lastName', userProfile.lastName);
            formData.append('email', userProfile.email);
            formData.append('phone', userProfile.phone);
            console.log("Form data:", Array.from(formData.entries()));
            try {
                console.log("Sending address update request...");
                const response = await fetch('/update-customer-profile', {
                    method: 'POST',
                    body: formData
                });
                const data = await response.json();
                console.log("Address update response:", data);
                if (data.success) {
                    alert('Address updated successfully!');
                    location.reload();
                } else {
                    alert('Error: ' + data.error);
                }
            } catch (error) {
                console.error('Address update error:', error);
                alert('Network error: Unable to update address.');
            }
        });
    } else {
        console.error("Address modal elements missing:", { editProfileBtn, addressModal, cancelAddressBtn, addressForm });
    }
});