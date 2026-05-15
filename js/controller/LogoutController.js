document.addEventListener("DOMContentLoaded", () => {
    const logoutBtn        = document.getElementById("logout-btn");
    const logoutOverlay    = document.getElementById("logout-modal-overlay");
    const btnConfirmLogout = document.getElementById("btn-confirm-logout");
    const btnCancelLogout  = document.getElementById("btn-cancel-logout");

    // Open confirmation modal
    if (logoutBtn) {
        logoutBtn.addEventListener("click", () => {
            if (logoutOverlay) logoutOverlay.style.display = "flex";
        });
    }

    // Cancel — close modal, stay on page
    if (btnCancelLogout) {
        btnCancelLogout.addEventListener("click", () => {
            if (logoutOverlay) logoutOverlay.style.display = "none";
        });
    }

    // Close on backdrop click
    if (logoutOverlay) {
        logoutOverlay.addEventListener("click", (e) => {
            if (e.target === logoutOverlay) logoutOverlay.style.display = "none";
        });
    }

    // Confirm logout
    if (btnConfirmLogout) {
        btnConfirmLogout.addEventListener("click", () => {
            const isLoggedOut = UserBO.logout();

            if (isLoggedOut) {
                if (logoutOverlay) logoutOverlay.style.display = "none";

                const loginScreen = document.getElementById('login-screen');
                const mainAppView = document.getElementById('main-app-view');

                if (loginScreen && mainAppView) {
                    mainAppView.style.display = 'none';
                    loginScreen.style.display = 'flex';
                    loginScreen.classList.add('active');

                    // Reset nav to dashboard
                    document.querySelectorAll('.nav-btn[data-target]')
                            .forEach(b => b.classList.remove('active'));
                    const dashBtn = document.querySelector('.nav-btn[data-target="dashboard"]');
                    if (dashBtn) dashBtn.classList.add('active');

                    // Clear password field
                    const passwordField = document.getElementById("password");
                    if (passwordField) passwordField.value = "";
                }
            }
        });
    }
});
