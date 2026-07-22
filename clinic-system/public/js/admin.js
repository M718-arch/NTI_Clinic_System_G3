document.addEventListener("DOMContentLoaded", () => {
    const wrapper = document.getElementById("adminWrapper");
    const sidebar = document.getElementById("adminSidebar");
    const overlay = document.getElementById("sidebarOverlay");

    const sidebarToggleBtn = document.getElementById("sidebarToggleBtn");

    const searchBtn = document.getElementById("searchToggleBtn");
    const searchBox = document.querySelector(".navbar-search-box");

    const themeBtn = document.getElementById("themeToggleBtn");

    /*==================================
        SIDEBAR
    ==================================*/

    function collapseSidebar() {
        wrapper.classList.add("sidebar-collapsed");

        localStorage.setItem("sidebarCollapsed", "true");
    }

    function expandSidebar() {
        wrapper.classList.remove("sidebar-collapsed");

        localStorage.setItem("sidebarCollapsed", "false");
    }

    if (localStorage.getItem("sidebarCollapsed") === "true") {
        collapseSidebar();
    }

    if (sidebarToggleBtn) {
        sidebarToggleBtn.addEventListener("click", () => {
            if (window.innerWidth <= 992) {
                sidebar.classList.toggle("show");

                overlay.classList.toggle("show");
            } else {
                wrapper.classList.toggle("sidebar-collapsed");

                localStorage.setItem(
                    "sidebarCollapsed",
                    wrapper.classList.contains("sidebar-collapsed"),
                );
            }
        });
    }

    /*==================================
        OVERLAY
    ==================================*/

    overlay?.addEventListener("click", () => {
        sidebar.classList.remove("show");

        overlay.classList.remove("show");
    });

    /*==================================
        RESIZE
    ==================================*/

    window.addEventListener("resize", () => {
        if (window.innerWidth > 992) {
            sidebar.classList.remove("show");

            overlay.classList.remove("show");
        }
    });

    /*==================================
        DROPDOWNS
    ==================================*/

    const dropdowns = document.querySelectorAll("[data-dropdown]");

    dropdowns.forEach((dropdown) => {
        const btn = dropdown.querySelector("[data-dropdown-toggle]");

        btn?.addEventListener("click", (e) => {
            e.stopPropagation();

            dropdowns.forEach((item) => {
                if (item !== dropdown) {
                    item.classList.remove("open");
                }
            });

            dropdown.classList.toggle("open");
        });
    });

    document.addEventListener("click", () => {
        dropdowns.forEach((dropdown) => {
            dropdown.classList.remove("open");
        });
    });

    /*==================================
        ESC
    ==================================*/

    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape") {
            dropdowns.forEach((dropdown) => {
                dropdown.classList.remove("open");
            });
        }
    });

    /*==================================
        SEARCH
    ==================================*/

    searchBtn?.addEventListener("click", () => {
        searchBox?.classList.toggle("show");
    });

    /*==================================
        CTRL + K
    ==================================*/

    document.addEventListener("keydown", (e) => {
        if (e.ctrlKey && e.key.toLowerCase() === "k") {
            e.preventDefault();

            document.querySelector(".navbar-search-input")?.focus();
        }
    });

    /*==================================
        THEME
    ==================================*/

    function setTheme(theme) {
        document.documentElement.setAttribute("data-theme", theme);

        localStorage.setItem("theme", theme);

        const icon = themeBtn?.querySelector("i");

        if (!icon) return;

        if (theme === "dark") {
            icon.className = "bi bi-sun-fill";
        } else {
            icon.className = "bi bi-moon-stars-fill";
        }
    }

    setTheme(localStorage.getItem("theme") || "light");

    themeBtn?.addEventListener("click", () => {
        const current = document.documentElement.getAttribute("data-theme");

        setTheme(current === "dark" ? "light" : "dark");
    });

    /*==================================
        TOOLTIPS
    ==================================*/

    document.querySelectorAll('[data-bs-toggle="tooltip"]').forEach((el) => {
        new bootstrap.Tooltip(el);
    });
});
