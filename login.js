// Page eka sampurnayen load wunata passe JS code eka run wenna meka danawa
document.addEventListener("DOMContentLoaded", () => {
    
    // HTML eke thiyena form eka select karagannawa
    const loginForm = document.getElementById("login-form");

    // Form eka submit karaddi (Log in button eka click karaddi) wena de
    loginForm.addEventListener("submit", (e) => {
        // Form eka submit wela page eka auto reload wena eka meken nawaththanawa
        e.preventDefault(); 

        // User type karapu username ekayi password ekayi gannawa
        const usernameInput = document.getElementById("username").value;
        const passwordInput = document.getElementById("password").value;

        // ==========================================
        // DUMMY AUTHENTICATION (Testing walata)
        // Username eka 'admin' saha password eka '1234' nam witharak login wenna denawa
        // ==========================================
        
        if (usernameInput === "admin" && passwordInput === "1234") {
            // Login eka success nam
            alert("Login Successful! Welcome " + usernameInput);
            
            // Login wunata passe pradhana system ekata (Dashboard ekata) redirect karanawa
            // 'index.html' kiyanne api eelangata hadana main system eke file eka kiyala hithamu.
            window.location.href = "index.html"; 
            
        } else {
            // Username hari password hari waradi nam
            alert("❌ Invalid Username or Password! Please try again.");
            
            // Password box eka his karanawa waradunaama
            document.getElementById("password").value = "";
        }
    });

});









