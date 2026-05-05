document.addEventListener("DOMContentLoaded", () => {
    const forgotPasswordLink = document.getElementById("forgot-password-link");
    const overlay = document.getElementById("forgot-password-overlay");
    const cancelBtn = document.getElementById("btn-cancel-reset");
    const resetForm = document.getElementById("forgot-password-form");

    if (forgotPasswordLink && overlay && cancelBtn && resetForm) {
        
        // Open Modal
        forgotPasswordLink.addEventListener("click", (e) => {
            e.preventDefault();
            overlay.style.display = "flex";
        });

        // Close Modal
        cancelBtn.addEventListener("click", () => {
            overlay.style.display = "none";
            resetForm.reset();
        });

        // Handle Reset
        resetForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            
            const username = document.getElementById("reset-username").value;
            const newPassword = document.getElementById("reset-new-password").value;

            const success = await UserBO.resetPassword(username, newPassword);

            if (success) {
                NotificationService.showToast("Password reset successfully!", "success");
                overlay.style.display = "none";
                resetForm.reset();
            } else {
                NotificationService.showToast("Username not found.", "error");
            }
        });
    }
});
