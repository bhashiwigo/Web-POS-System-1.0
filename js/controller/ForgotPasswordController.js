document.addEventListener("DOMContentLoaded", () => {
    const forgotPasswordLink = document.getElementById("forgot-password-link");
    const overlay = document.getElementById("forgot-password-overlay");
    const resetForm = document.getElementById("forgot-password-form");

    if (forgotPasswordLink && overlay && resetForm) {
        
        // Open Modal
        forgotPasswordLink.addEventListener("click", (e) => {
            e.preventDefault();
            overlay.style.display = "flex";
        });

        const step1 = document.getElementById("fp-step-1");
        const step2 = document.getElementById("fp-step-2");
        const step3 = document.getElementById("fp-step-3");
        
        const usernameInput = document.getElementById("reset-username");
        const otpInput = document.getElementById("reset-otp");
        const newPasswordInput = document.getElementById("reset-new-password");

        const btnSendOtp = document.getElementById("btn-send-otp");
        const btnVerifyOtp = document.getElementById("btn-verify-otp");
        const btnResetPassword = document.getElementById("btn-reset-password");
        const cancelBtns = document.querySelectorAll(".btn-cancel-reset");

        let currentMockOTP = "";
        let currentUsername = "";

        function resetModalState() {
            if (step1) step1.style.display = "block";
            if (step2) step2.style.display = "none";
            if (step3) step3.style.display = "none";
            if (btnSendOtp) {
                btnSendOtp.textContent = "Send OTP";
                btnSendOtp.disabled = false;
            }
            currentMockOTP = "";
            currentUsername = "";
        }

        // Close Modal Handlers
        cancelBtns.forEach(btn => {
            btn.addEventListener("click", () => {
                overlay.style.display = "none";
                resetForm.reset();
                resetModalState();
            });
        });

        // Prevent default form submission from reloading page if enter is pressed
        resetForm.addEventListener("submit", (e) => {
            e.preventDefault();
        });

        // Step 1: Send OTP
        if (btnSendOtp) {
            btnSendOtp.addEventListener("click", async () => {
                const username = usernameInput.value.trim();
                if (!username) {
                    NotificationService.showToast("Please enter a username.", "error");
                    return;
                }

                const users = DataStore.getUsers();
                const user = users.find(u => u.username === username);
                
                if (!user) {
                    NotificationService.showToast("Username not found.", "error");
                    return;
                }

                if (!user.email) {
                    NotificationService.showToast("No registered email found for this user.", "error");
                    return;
                }

                currentUsername = username;
                currentMockOTP = Math.floor(1000 + Math.random() * 9000).toString();
                
                btnSendOtp.textContent = "Sending...";
                btnSendOtp.disabled = true;

                try {
                    const templateParams = {
                        to_name: user.name || user.username,
                        to_email: user.email,
                        otp_code: currentMockOTP
                    };
                    
                    // Replace YOUR_SERVICE_ID and YOUR_TEMPLATE_ID with actual keys
                    await emailjs.send("YOUR_SERVICE_ID", "YOUR_TEMPLATE_ID", templateParams);

                    NotificationService.showToast(`OTP sent to ${user.email}.`, "success");
                    
                    if (step1) step1.style.display = "none";
                    if (step2) step2.style.display = "block";
                    
                } catch (error) {
                    console.error("EmailJS Error:", error);
                    NotificationService.showToast("Failed to send OTP email.", "error");
                    btnSendOtp.textContent = "Send OTP";
                    btnSendOtp.disabled = false;
                }
            });
        }

        // Step 2: Verify OTP
        if (btnVerifyOtp) {
            btnVerifyOtp.addEventListener("click", () => {
                const otp = otpInput ? otpInput.value.trim() : "";
                
                if (!otp) {
                    NotificationService.showToast("Please enter the OTP.", "error");
                    return;
                }

                if (otp !== currentMockOTP) {
                    NotificationService.showToast("Invalid OTP. Try again.", "error");
                    return;
                }

                NotificationService.showToast("OTP Verified!", "success");
                if (step2) step2.style.display = "none";
                if (step3) step3.style.display = "block";
            });
        }

        // Step 3: Reset Password
        if (btnResetPassword) {
            btnResetPassword.addEventListener("click", async () => {
                const newPassword = newPasswordInput.value;
                
                if (!newPassword) {
                    NotificationService.showToast("Please enter a new password.", "error");
                    return;
                }

                const success = await UserBO.resetPassword(currentUsername, newPassword);

                if (success) {
                    NotificationService.showToast("Password reset successfully!", "success");
                    overlay.style.display = "none";
                    resetForm.reset();
                    resetModalState();
                } else {
                    NotificationService.showToast("Failed to reset password.", "error");
                    resetModalState();
                }
            });
        }
    }
});
