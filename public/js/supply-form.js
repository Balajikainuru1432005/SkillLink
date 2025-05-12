document.addEventListener("DOMContentLoaded", function () {
    const productCountInput = document.getElementById("supply-product-count");
    const productTableBody = document.querySelector(".supply-table tbody");
    const submitButton = document.getElementById("supply-submit-btn");

    productCountInput.addEventListener("change", function () {
        const count = parseInt(this.value);
        productTableBody.innerHTML = ""; // Clear existing rows before adding new ones

        if (isNaN(count) || count < 1) return; // Prevent invalid selection

        for (let i = 1; i <= count; i++) {
            let row = document.createElement("tr");

            // S.No Column (Auto-numbered)
            let snoCell = document.createElement("td");
            snoCell.textContent = i;
            row.appendChild(snoCell);

            // Part Name Column
            let partNameCell = document.createElement("td");
            let partNameInput = document.createElement("input");
            partNameInput.type = "text";
            partNameInput.placeholder = "Enter Part Name";
            partNameInput.classList.add("part-name");
            partNameCell.appendChild(partNameInput);
            row.appendChild(partNameCell);

            // No. of Pieces Column (Default set to 1)
            let qtyCell = document.createElement("td");
            let qtyInput = document.createElement("input");
            qtyInput.type = "number";
            qtyInput.min = "1";
            qtyInput.value = "1";  // Default quantity set to 1
            qtyInput.classList.add("quantity");
            qtyCell.appendChild(qtyInput);
            row.appendChild(qtyCell);

            // Upload Image Column
            let imageCell = document.createElement("td");
            let fileUpload = document.createElement("input");
            fileUpload.type = "file";
            fileUpload.classList.add("upload-file");
            fileUpload.accept = "image/*, application/pdf"; // Allow images & PDFs
            fileUpload.addEventListener("change", function () {
                if (fileUpload.files.length > 0) {
                    partNameInput.required = false; // Make part name optional
                } else {
                    partNameInput.required = true;
                }
            });
            imageCell.appendChild(fileUpload);
            row.appendChild(imageCell);

            productTableBody.appendChild(row);
        }
    });

    submitButton.addEventListener("click", function (event) {
        let isValid = true;

        // Check if at least one category is selected
        let categoryChecked = document.querySelectorAll(".supply-checkbox-group input:checked").length;
        if (categoryChecked === 0) {
            alert("Error: Please select at least one category.");
            isValid = false;
        }

        // Validate table rows
        let rows = document.querySelectorAll(".supply-table tbody tr");
        rows.forEach((row, index) => {
            let partName = row.querySelector(".part-name").value.trim();
            let fileInput = row.querySelector(".upload-file").files.length;

            if (partName === "" && fileInput === 0) {
                alert(`Error: Please enter Part Name or upload an Image in Row ${index + 1}`);
                isValid = false;
            }
        });

        if (!isValid) {
            event.preventDefault(); // Stop form submission
        }
    });
});
