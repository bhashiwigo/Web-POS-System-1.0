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

        let resetStep = 1;
        const step1 = document.getElementById("fp-step-1");
        const step2 = document.getElementById("fp-step-2");
        const step3 = document.getElementById("fp-step-3");
        
        const otpInput = document.getElementById("reset-otp");
        const btnReset = document.getElementById("btn-reset-password");
        let currentMockOTP = "1234";

        function resetModalState() {
            resetStep = 1;
            if (step1) step1.style.display = "block";
            if (step2) step2.style.display = "none";
            if (step3) step3.style.display = "none";
            if (btnReset) btnReset.textContent = "Next";
        }

        // Close Modal
        cancelBtn.addEventListener("click", () => {
            overlay.style.display = "none";
            resetForm.reset();
            resetModalState();
        });

        // Handle Reset
        resetForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            
            const username = document.getElementById("reset-username").value;
            const newPassword = document.getElementById("reset-new-password").value;

            if (resetStep === 1) {
                // Check if user exists to simulate OTP
                const users = DataStore.getUsers();
                const user = users.find(u => u.username === username);
                
                if (!user) {
                    NotificationService.showToast("Username not found.", "error");
                    return;
                }

                const contact = user.contact || "Unknown Number";
                currentMockOTP = Math.floor(1000 + Math.random() * 9000).toString(); // Generate random 4-digit OTP
                
                NotificationService.showToast(`OTP sent to ${contact}. Mock OTP: ${currentMockOTP}`, "info");
                
                if (step1) step1.style.display = "none";
                if (step2) step2.style.display = "block";
                if (otpInput) otpInput.required = true;
                if (btnReset) btnReset.textContent = "Verify";
                resetStep = 2;
                return;
            }

            if (resetStep === 2) {
                const otp = otpInput ? otpInput.value : "";
                if (otp !== currentMockOTP) {
                    NotificationService.showToast("Invalid OTP. Try again.", "error");
                    return;
                }

                NotificationService.showToast("OTP Verified!", "success");
                if (step2) step2.style.display = "none";
                if (step3) step3.style.display = "block";
                if (otpInput) otpInput.required = false;
                if (btnReset) btnReset.textContent = "Reset";
                resetStep = 3;
                return;
            }

            if (resetStep === 3) {
                const success = await UserBO.resetPassword(username, newPassword);

                if (success) {
                    NotificationService.showToast("Password reset successfully!", "success");
                    overlay.style.display = "none";
                    resetForm.reset();
                    resetModalState();
                } else {
                    NotificationService.showToast("Failed to reset password.", "error");
                    resetModalState();
                }
            }
        });
    }
});
