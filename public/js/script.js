document.addEventListener("DOMContentLoaded", function () {
    // Dropdown logic
    let dropdowns = document.querySelectorAll(".dropdown");
    dropdowns.forEach(dropdown => {
        let dropdownBtn = dropdown.querySelector(".dropbtn");
        let dropdownContent = dropdown.querySelector(".dropdown-content");

        dropdownBtn.addEventListener("click", function (event) {
            event.stopPropagation();
            closeAllDropdowns();
            dropdownContent.style.display = (dropdownContent.style.display === "block") ? "none" : "block";
        });
    });

    document.addEventListener("click", function () {
        closeAllDropdowns();
    });

    function closeAllDropdowns() {
        document.querySelectorAll(".dropdown-content").forEach(content => {
            content.style.display = "none";
        });
    }

    // Search Suggestions
    const searchBar = document.getElementById("search-bar");
    const suggestionsBox = document.getElementById("search-suggestions");

    if (searchBar && suggestionsBox) {
        const services = [
            "General Electrician", "Appliance Electrician", "Plumbing",
            "Carpentry", "Mechanic", "Painting", "Driver"
        ];

        searchBar.addEventListener("keyup", function () {
            const input = searchBar.value.toLowerCase();
            suggestionsBox.innerHTML = "";
            if (input.length === 0) {
                suggestionsBox.style.display = "none";
                return;
            }

            let matches = services.filter(service => service.toLowerCase().includes(input));
            if (matches.length > 0) {
                suggestionsBox.style.display = "block";
                matches.forEach(match => {
                    let suggestionItem = document.createElement("div");
                    suggestionItem.textContent = match;
                    suggestionItem.classList.add("suggestion-item");
                    suggestionItem.onclick = function () {
                        searchBar.value = match;
                        suggestionsBox.style.display = "none";
                        showCategory(match.toLowerCase().replace(/\s+/g, "-"));
                    };
                    suggestionsBox.appendChild(suggestionItem);
                });
            } else {
                suggestionsBox.style.display = "none";
            }
        });

        document.addEventListener("click", function (e) {
            if (!searchBar.contains(e.target) && !suggestionsBox.contains(e.target)) {
                suggestionsBox.style.display = "none";
            }
        });
    }
});

// Category display function
window.showCategory = function (categoryId) {
    const sections = document.querySelectorAll(".right-servicesection section");
    sections.forEach(section => {
        section.style.display = "none";
    });

    let selectedCategory = document.getElementById(categoryId);
    if (selectedCategory) {
        selectedCategory.style.display = "block";
        selectedCategory.scrollIntoView({ behavior: "smooth", block: "start" });
    }
};

// Service details function
function showDetails(serviceId) {
    document.querySelectorAll(".service-info").forEach(info => {
        info.classList.remove("active");
    });

    document.getElementById(serviceId).classList.add("active");
}