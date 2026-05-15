class UserController {
    constructor() {
        this.initElements();
        this.bindEvents();
        this.renderUsers();
    }

    initElements() {
        this.tableBody  = document.getElementById('users-table-body');

        // Buttons
        this.btnAddUser = document.getElementById('btn-show-add-user');

        // Modal
        this.modalOverlay          = document.getElementById('user-modal-overlay');
        this.modalTitle            = document.getElementById('user-modal-title');
        this.userForm              = document.getElementById('user-form');
        this.btnCancel             = document.getElementById('btn-cancel-user');

        // Inputs
        this.originalUsernameInput = document.getElementById('user-original-username');
        this.nameInput             = document.getElementById('user-name');
        this.usernameInput         = document.getElementById('user-username');
        this.emailInput            = document.getElementById('user-email');
        this.passwordInput         = document.getElementById('user-password');
        this.contactInput          = document.getElementById('user-contact');
        this.roleInput             = document.getElementById('user-role');
    }

    bindEvents() {
        // Show Add Modal
        if (this.btnAddUser) {
            this.btnAddUser.addEventListener('click', () => {
                this.modalTitle.textContent = "Add User";
                this.userForm.reset();
                this.originalUsernameInput.value = "";
                this.usernameInput.disabled = false; // Allow username entry
                this.modalOverlay.style.display = "flex";
            });
        }

        // Hide Modal
        if (this.btnCancel) {
            this.btnCancel.addEventListener('click', () => {
                this.modalOverlay.style.display = "none";
                this.userForm.reset();
            });
        }

        // Form Submit
        if (this.userForm) {
            this.userForm.addEventListener('submit', (e) => {
                e.preventDefault();

                const name     = this.nameInput     ? this.nameInput.value.trim()     : '';
                const username = this.usernameInput ? this.usernameInput.value.trim() : '';
                const email    = this.emailInput    ? this.emailInput.value.trim()    : '';
                const password = this.passwordInput ? this.passwordInput.value        : '';
                const contact  = this.contactInput  ? this.contactInput.value.trim()  : '';
                const role     = this.roleInput     ? this.roleInput.value            : '';

                // Mandatory email validation
                if (!email) {
                    NotificationService.showToast("Email is required.", "error");
                    if (this.emailInput) this.emailInput.focus();
                    return;
                }

                const userObj = { name, username, email, password, contact, role };
                const originalUsername = this.originalUsernameInput.value;

                if (originalUsername) {
                    const success = DataStore.updateUser(originalUsername, userObj);
                    if (success) {
                        NotificationService.showToast("User updated successfully!", "success");
                        this.modalOverlay.style.display = "none";
                    } else {
                        NotificationService.showToast("Failed to update user.", "error");
                    }
                } else {
                    const success = DataStore.addUser(userObj);
                    if (success) {
                        NotificationService.showToast("User added successfully!", "success");
                        this.modalOverlay.style.display = "none";
                    } else {
                        NotificationService.showToast("Username already exists!", "error");
                    }
                }
            });
        }

        // Table actions (Edit / Delete) — event delegation
        if (this.tableBody) {
            this.tableBody.addEventListener('click', (e) => {
                const editIcon   = e.target.closest('.action-icon[data-action="edit"]');
                const deleteIcon = e.target.closest('.action-icon[data-action="delete"]');

                if (editIcon) {
                    this.editUser(editIcon.dataset.username);
                } else if (deleteIcon) {
                    this.deleteUser(deleteIcon.dataset.username);
                }
            });
        }

        // Real-time update listener
        window.addEventListener('usersUpdated', () => this.renderUsers());
    }

    editUser(username) {
        const users = DataStore.getUsers();
        const user = users.find(u => u.username === username);
        if (!user) return;

        this.modalTitle.textContent = "Edit User";
        this.originalUsernameInput.value = user.username;
        this.nameInput.value = user.name;
        this.usernameInput.value = user.username;
        this.usernameInput.disabled = true; // Prevent changing username
        if (this.emailInput) this.emailInput.value = user.email || "";
        this.passwordInput.value = user.password;
        this.contactInput.value = user.contact || "";
        this.roleInput.value = user.role;

        this.modalOverlay.style.display = "flex";
    }

    deleteUser(username) {
        if (confirm(`Are you sure you want to delete user '${username}'?`)) {
            const activeUser = DataStore.getActiveUser();
            if (activeUser && activeUser.username === username) {
                NotificationService.showToast("You cannot delete the currently logged in user.", "error");
                return;
            }
            DataStore.deleteUser(username);
            NotificationService.showToast("User deleted successfully!", "success");
        }
    }

    renderUsers() {
        if (!this.tableBody) return;

        const users = DataStore.getUsers();
        this.tableBody.innerHTML = '';

        if (users.length === 0) {
            this.tableBody.innerHTML = `<tr><td colspan="6" style="text-align:center; padding:20px; color:var(--color-text-light);">No users found.</td></tr>`;
            return;
        }

        users.forEach(user => {
            const contact = user.contact || '-';
            const email   = user.email   || '-';
            this.tableBody.innerHTML += `
                <tr>
                    <td>${user.name}</td>
                    <td>${user.username}</td>
                    <td>${email}</td>
                    <td><span class="status-badge">${user.role}</span></td>
                    <td>${contact}</td>
                    <td class="action-cell">
                        <i class="fa-regular fa-pen-to-square action-icon"
                           data-action="edit" data-username="${user.username}" title="Edit User"></i>
                        <i class="fa-regular fa-trash-can action-icon"
                           data-action="delete" data-username="${user.username}" title="Delete User"
                           style="color: #d9534f;"></i>
                    </td>
                </tr>
            `;
        });
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new UserController();
});
