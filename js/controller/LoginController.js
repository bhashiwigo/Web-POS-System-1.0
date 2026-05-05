document.addEventListener("DOMContentLoaded", () => {
    const loginForm = document.getElementById("login-form");

    if (loginForm) {
        loginForm.addEventListener("submit", async (e) => {
            e.preventDefault(); 

            const usernameInput = document.getElementById("username").value;
            const passwordInput = document.getElementById("password").value;

            // Create DTO
            const userDTO = new UserDTO(usernameInput, passwordInput);

            // Change button state
            const loginBtn = document.querySelector('.login-btn');
            const originalText = loginBtn.textContent;
            loginBtn.textContent = 'Logging in...';
            loginBtn.disabled = true;

            // Call BO to authenticate
            const isAuthenticated = await UserBO.authenticate(userDTO);

            loginBtn.textContent = originalText;
            loginBtn.disabled = false;

            if (isAuthenticated) {
                // Login successful
                NotificationService.showToast(`Login Successful! Welcome ${userDTO.getUsername()}`, 'success');
                
                // Update topbar UI
                if (window.updateHeaderUserInfo) window.updateHeaderUserInfo();
                
                // Hide login screen and show main app
                const loginScreen = document.getElementById('login-screen');
                const mainAppView = document.getElementById('main-app-view');
                
                if (loginScreen && mainAppView) {
                    loginScreen.classList.remove('active');
                    loginScreen.style.display = 'none'; // Ensure it's hidden
                    mainAppView.style.display = 'block';
                    
                    // Trigger the dashboard tab
                    const dashboardBtn = document.querySelector('.nav-btn[data-target="dashboard"]');
                    if (dashboardBtn) {
                        dashboardBtn.click();
                    }
                }
                
            } else {
                // Authentication failed
                alert("❌ Invalid Username or Password! Please try again.");
                document.getElementById("password").value = "";
            }
        });
    }
});
