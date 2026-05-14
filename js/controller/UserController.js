class UserController {
    constructor() {
        this.initElements();
        this.bindEvents();
        this.renderUsers();
    }

    initElements() {
        // Table and search
        this.tableBody = document.getElementById('users-table-body');
        this.searchInput = document.getElementById('users-search-input');
        
        // Buttons
        this.btnAddUser = document.getElementById('btn-show-add-user');
        
        // Modal
        this.modalOverlay = document.getElementById('user-modal-overlay');
        this.modalTitle = document.getElementById('user-modal-title');
        this.userForm = document.getElementById('user-form');
        this.btnCancel = document.getElementById('btn-cancel-user');
        
        // Inputs
        this.originalUsernameInput = document.getElementById('user-original-username');
        this.nameInput = document.getElementById('user-name');
        this.usernameInput = document.getElementById('user-username');
        this.passwordInput = document.getElementById('user-password');
        this.contactInput = document.getElementById('user-contact');
        this.roleInput = document.getElementById('user-role');
    }

    bindEvents() {
        // Search
        if (this.searchInput) {
            this.searchInput.addEventListener('input', (e) => {
                this.renderUsers(e.target.value);
            });
        }

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
                
                const userObj = {
                    name: this.nameInput.value,
                    username: this.usernameInput.value,
                    password: this.passwordInput.value,
                    contact: this.contactInput.value,
                    role: this.roleInput.value
                };

                const originalUsername = this.originalUsernameInput.value;

                if (originalUsername) {
                    // Update
                    const success = DataStore.updateUser(originalUsername, userObj);
                    if (success) {
                        NotificationService.showToast("User updated successfully!", "success");
                        this.modalOverlay.style.display = "none";
                    } else {
                        NotificationService.showToast("Failed to update user.", "error");
                    }
                } else {
                    // Add
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

        // Table actions (Edit / Delete)
        if (this.tableBody) {
            this.tableBody.addEventListener('click', (e) => {
                const target = e.target.closest('button');
                if (!target) return;

                const username = target.getAttribute('data-username');
                
                if (target.classList.contains('btn-edit')) {
                    this.editUser(username);
                } else if (target.classList.contains('btn-delete')) {
                    this.deleteUser(username);
                }
            });
        }

        // Global Event for Real-time update
        window.addEventListener('usersUpdated', () => {
            if (this.searchInput) {
                this.renderUsers(this.searchInput.value);
            } else {
                this.renderUsers();
            }
        });
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

    renderUsers(query = '') {
        if (!this.tableBody) return;
        
        let users = DataStore.getUsers();

        if (query) {
            const q = query.toLowerCase();
            users = users.filter(u => 
                u.name.toLowerCase().includes(q) || 
                u.username.toLowerCase().includes(q) ||
                u.role.toLowerCase().includes(q)
            );
        }

        this.tableBody.innerHTML = '';
        users.forEach(user => {
            const contact = user.contact || '-';
            this.tableBody.innerHTML += `
                <tr>
                    <td>${user.name}</td>
                    <td>${user.username}</td>
                    <td><span class="status-badge">${user.role}</span></td>
                    <td>${contact}</td>
                    <td style="text-align: right;">
                        <button class="icon-btn btn-edit" data-username="${user.username}" title="Edit User">
                            <i class="fa-solid fa-pen" style="color: var(--color-primary);"></i>
                        </button>
                        <button class="icon-btn btn-delete" data-username="${user.username}" title="Delete User">
                            <i class="fa-solid fa-trash" style="color: var(--color-danger);"></i>
                        </button>
                    </td>
                </tr>
            `;
        });
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new UserController();
});
