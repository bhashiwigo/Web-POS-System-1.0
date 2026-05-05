document.addEventListener("DOMContentLoaded", () => {
    const logoutBtn = document.getElementById("logout-btn");

    if (logoutBtn) {
        logoutBtn.addEventListener("click", () => {
            // Call BO to handle session clearing
            const isLoggedOut = UserBO.logout();

            if (isLoggedOut) {
                // UI Transition
                const loginScreen = document.getElementById('login-screen');
                const mainAppView = document.getElementById('main-app-view');

                if (loginScreen && mainAppView) {
                    // Hide main app
                    mainAppView.style.display = 'none';
                    
                    // Show login screen
                    loginScreen.style.display = 'flex';
                    loginScreen.classList.add('active');

                    // Reset any active state in the navigation to default (dashboard)
                    const navButtons = document.querySelectorAll('.nav-btn[data-target]');
                    navButtons.forEach(b => b.classList.remove('active'));
                    const dashboardBtn = document.querySelector('.nav-btn[data-target="dashboard"]');
                    if (dashboardBtn) {
                        dashboardBtn.classList.add('active');
                    }
                    
                    // Optional: Clear username/password fields if they aren't already cleared
                    const passwordField = document.getElementById("password");
                    if (passwordField) passwordField.value = "";
                }
            }
        });
    }
});
