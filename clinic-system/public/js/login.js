/**
 * Clinic Management System — Auth Pages
 * Shared behavior for login.blade.php and register.blade.php
 */
(function () {
    "use strict";

    /* ---------------------------------------------------------
     Password visibility toggles
  --------------------------------------------------------- */
    function initPasswordToggles() {
        document
            .querySelectorAll("[data-password-toggle]")
            .forEach(function (btn) {
                btn.addEventListener("click", function () {
                    var targetId = btn.getAttribute("data-password-toggle");
                    var input = document.getElementById(targetId);
                    if (!input) return;

                    var isHidden = input.getAttribute("type") === "password";
                    input.setAttribute("type", isHidden ? "text" : "password");

                    var icon = btn.querySelector("i");
                    if (icon) {
                        icon.classList.toggle("bi-eye", !isHidden);
                        icon.classList.toggle("bi-eye-slash", isHidden);
                    }

                    btn.setAttribute(
                        "aria-label",
                        isHidden ? "Hide password" : "Show password",
                    );
                    btn.setAttribute("aria-pressed", String(isHidden));
                });
            });
    }

    /* ---------------------------------------------------------
     Role selection cards (register page)
     Keeps a hidden input[name="role"] in sync and supports
     keyboard activation (Enter / Space) for accessibility.
  --------------------------------------------------------- */
    function initRoleCards() {
        var cards = document.querySelectorAll(".role-card");
        if (!cards.length) return;

        var hiddenInput = document.getElementById("role-input");

        function selectCard(card) {
            cards.forEach(function (c) {
                c.classList.remove("selected");
                c.setAttribute("aria-checked", "false");
                c.setAttribute("tabindex", "-1");
            });

            card.classList.add("selected");
            card.setAttribute("aria-checked", "true");
            card.setAttribute("tabindex", "0");
            card.focus();

            if (hiddenInput) {
                var value = card.getAttribute("data-role-value");
                // Only "patient" or "doctor" are ever allowed values.
                if (value === "patient" || value === "doctor") {
                    hiddenInput.value = value;
                }
            }
        }

        cards.forEach(function (card) {
            card.addEventListener("click", function () {
                selectCard(card);
            });

            card.addEventListener("keydown", function (e) {
                if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    selectCard(card);
                }
                if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
                    e.preventDefault();
                    var idx = Array.prototype.indexOf.call(cards, card);
                    var nextIdx =
                        e.key === "ArrowRight"
                            ? (idx + 1) % cards.length
                            : (idx - 1 + cards.length) % cards.length;
                    selectCard(cards[nextIdx]);
                }
            });
        });

        // Restore previously selected role (e.g. after a validation error / old())
        if (hiddenInput && hiddenInput.value) {
            var preselected = document.querySelector(
                '.role-card[data-role-value="' + hiddenInput.value + '"]',
            );
            if (preselected) selectCard(preselected);
        }
    }

    /* ---------------------------------------------------------
     Submit button loading state
     Prevents double submissions and shows a spinner while
     the form posts to the server.
  --------------------------------------------------------- */
    function initSubmitLoading() {
        document
            .querySelectorAll("form[data-loading-form]")
            .forEach(function (form) {
                form.addEventListener("submit", function (e) {
                    var btn = form.querySelector("[data-loading-button]");
                    if (!btn) return;

                    if (btn.dataset.submitted === "true") {
                        e.preventDefault();
                        return;
                    }

                    // Native HTML5 validation still applies before we lock the button.
                    if (
                        typeof form.checkValidity === "function" &&
                        !form.checkValidity()
                    ) {
                        return;
                    }

                    btn.dataset.submitted = "true";
                    btn.classList.add("is-loading");
                    btn.setAttribute("disabled", "disabled");
                });
            });
    }

    /* ---------------------------------------------------------
     Mark inputs as "filled" for icon color state when a
     browser autofills a value without a focus event firing.
  --------------------------------------------------------- */
    function initFilledState() {
        document.querySelectorAll(".form-control").forEach(function (input) {
            var group = input.closest(".form-group");
            if (!group) return;

            var sync = function () {
                group.classList.toggle("filled", input.value.trim().length > 0);
            };

            sync();
            input.addEventListener("input", sync);
            input.addEventListener("blur", sync);
        });
    }

    document.addEventListener("DOMContentLoaded", function () {
        initPasswordToggles();
        initRoleCards();
        initSubmitLoading();
        initFilledState();
    });
})();
