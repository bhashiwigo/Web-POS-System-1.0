class SettingsController {
    constructor() {
        this.initElements();
        this.bindEvents();
        this.loadSettings();
        this.loadUsers();
        this.loadPaymentSettings();
    }

    initElements() {
        // General Settings Elements
        this.businessNameInput = document.getElementById('settings-business-name');
        this.contactInput = document.getElementById('settings-contact');
        this.timezoneSelect = document.getElementById('settings-timezone');
        this.currencySelect = document.getElementById('settings-currency');
        this.languageSelect = document.getElementById('settings-language');
        this.btnSaveGeneral = document.getElementById('btn-save-general');
        this.btnLogoUpload = document.getElementById('settings-logo-upload');

        // User Management Elements
        this.userListContainer = document.querySelector('.user-list');
        this.btnAddUser = document.getElementById('btn-add-user');
        this.btnSaveUsers = document.getElementById('btn-save-users');

        // Payment Settings Elements
        this.paymentSettingsList = document.querySelector('.payment-settings-list');
    }

    bindEvents() {
        // Save General Settings
        if (this.btnSaveGeneral) {
            this.btnSaveGeneral.addEventListener('click', () => {
                const currentSettings = DataStore.getSettings() || {};
                
                currentSettings.businessName = this.businessNameInput.value;
                currentSettings.contactInfo = this.contactInput.value;
                currentSettings.timezone = this.timezoneSelect.value;
                currentSettings.currency = this.currencySelect.value;
                currentSettings.language = this.languageSelect.value;

                DataStore.saveSettings(currentSettings);
                NotificationService.show('General settings saved successfully!', 'success');
            });
        }

        // Mock Logo Upload
        if (this.btnLogoUpload) {
            this.btnLogoUpload.addEventListener('click', () => {
                NotificationService.show('Logo upload prompt mocked.', 'info');
            });
        }

        // Add User Mock
        if (this.btnAddUser) {
            this.btnAddUser.addEventListener('click', () => {
                const name = prompt("Enter new user's name:");
                if (name) {
                    const users = DataStore.getUsers();
                    users.push({ username: name.toLowerCase(), password: '123', role: 'Staff', name: name, active: true });
                    DataStore.saveUsers(users);
                    this.loadUsers();
                    NotificationService.show('User added successfully!', 'success');
                }
            });
        }

        // Save Users toggles
        if (this.btnSaveUsers) {
            this.btnSaveUsers.addEventListener('click', () => {
                const toggles = this.userListContainer.querySelectorAll('input[type="checkbox"]');
                const users = DataStore.getUsers();
                
                toggles.forEach(toggle => {
                    const index = parseInt(toggle.dataset.index);
                    if (!isNaN(index) && users[index]) {
                        users[index].active = toggle.checked;
                    }
                });
                
                DataStore.saveUsers(users);
                NotificationService.show('User settings saved successfully!', 'success');
            });
        }

        // Event delegation for payment settings (since they are generated dynamically)
        if (this.paymentSettingsList) {
            this.paymentSettingsList.addEventListener('change', (e) => {
                if (e.target.type === 'checkbox') {
                    const key = e.target.dataset.key;
                    if (key) {
                        const settings = DataStore.getSettings();
                        if (!settings.paymentMethods) settings.paymentMethods = {};
                        settings.paymentMethods[key] = e.target.checked;
                        DataStore.saveSettings(settings);
                        NotificationService.show('Payment settings updated!', 'success');
                    }
                }
            });
        }
        
        window.addEventListener('settingsUpdated', () => {
            // Can update UI based on new settings here
        });
    }

    loadSettings() {
        const settings = DataStore.getSettings();
        if (!settings) return;

        if (this.businessNameInput) this.businessNameInput.value = settings.businessName || '';
        if (this.contactInput) this.contactInput.value = settings.contactInfo || '';
        if (this.timezoneSelect) this.timezoneSelect.value = settings.timezone || '';
        if (this.currencySelect) this.currencySelect.value = settings.currency || '';
        if (this.languageSelect) this.languageSelect.value = settings.language || '';
    }

    loadUsers() {
        if (!this.userListContainer) return;
        const users = DataStore.getUsers();
        let html = '';

        users.forEach((user, index) => {
            // default active true if not set
            const isActive = user.active !== false; 
            html += `
                <div class="user-row">
                    <span>${user.name} (${user.role})</span>
                    <label class="toggle-switch">
                        <input type="checkbox" data-index="${index}" ${isActive ? 'checked' : ''}>
                        <span class="slider round"></span>
                    </label>
                </div>
            `;
        });

        this.userListContainer.innerHTML = html;
    }

    loadPaymentSettings() {
        if (!this.paymentSettingsList) return;
        const settings = DataStore.getSettings();
        const paymentMethods = settings?.paymentMethods || { cash: true, card: true, mobileWallet: true };
        
        let html = `
            <div class="payment-row">
                <span>Payment Method Master</span>
                <label class="toggle-switch">
                    <input type="checkbox" checked disabled title="Master toggle is fixed">
                    <span class="slider round"></span>
                </label>
            </div>
            <div class="payment-row">
                <span>Cash</span>
                <label class="toggle-switch">
                    <input type="checkbox" data-key="cash" ${paymentMethods.cash ? 'checked' : ''}>
                    <span class="slider round"></span>
                </label>
            </div>
            <div class="payment-row">
                <span>Card</span>
                <label class="toggle-switch">
                    <input type="checkbox" data-key="card" ${paymentMethods.card ? 'checked' : ''}>
                    <span class="slider round"></span>
                </label>
            </div>
            <div class="payment-row">
                <span>Mobile Wallet</span>
                <label class="toggle-switch">
                    <input type="checkbox" data-key="mobileWallet" ${paymentMethods.mobileWallet ? 'checked' : ''}>
                    <span class="slider round"></span>
                </label>
            </div>
        `;

        this.paymentSettingsList.innerHTML = html;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new SettingsController();
});
