document.addEventListener('DOMContentLoaded', () => {
    const navButtons = document.querySelectorAll('.nav-btn[data-target]');
    const viewSections = document.querySelectorAll('.view-section');
    const pageTitle = document.getElementById('pageTitle');

    // Title mapping
    const titleMap = {
        'dashboard': 'Dashboard',
        'cart': 'Cart',
        'items': 'Item',
        'customers': 'Customer',
        'analysis': 'Analysis',
        'users': 'User Management',
        'settings': 'Setting'
    };

    navButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            // Remove active class from all buttons
            navButtons.forEach(b => b.classList.remove('active'));
            // Add active class to clicked button
            btn.classList.add('active');

            const targetId = btn.getAttribute('data-target');
            
            // Hide all sections
            viewSections.forEach(section => {
                section.classList.remove('active');
            });

            // Show target section
            const targetSection = document.getElementById(targetId);
            if (targetSection) {
                targetSection.classList.add('active');
            }

            // Update Page Title
            if (titleMap[targetId]) {
                pageTitle.textContent = titleMap[targetId];
            }
        });
    });

    // --- Live Clock ---
    const datePill = document.querySelector('.date-pill');
    function updateClock() {
        if (!datePill) return;
        const now = new Date();
        const options = { weekday: 'long', day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit', second: '2-digit' };
        datePill.textContent = now.toLocaleDateString('en-US', options);
    }
    setInterval(updateClock, 1000);
    updateClock(); // Initial call

    // --- Header User Info ---
    window.updateHeaderUserInfo = function() {
        const user = DataStore.getActiveUser();
        if (user) {
            const nameEl = document.querySelector('.user-name');
            const roleEl = document.querySelector('.user-role');
            if (nameEl) nameEl.textContent = user.name;
            if (roleEl) roleEl.textContent = user.role;
        }
    };
    
    // Initial check if already logged in (for dev/reload purposes)
    if (DataStore.getActiveUser()) {
        window.updateHeaderUserInfo();
    }
});
