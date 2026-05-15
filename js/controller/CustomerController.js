class CustomerController {
    constructor() {
        this.initElements();
        this.bindEvents();
        this.renderCustomers();
    }

    initElements() {
        this.tableBody          = document.getElementById('customers-table-body');
        this.btnAddCustomerMain = document.getElementById('btn-add-customer-main');
        this.addCustomerOverlay = document.getElementById('add-customer-overlay');
        this.addCustomerForm    = document.getElementById('add-customer-form');
        this.btnCancelCustomer  = document.getElementById('btn-cancel-customer');
        this.searchInput        = document.getElementById('customers-search-input');
        this.btnSearch          = document.getElementById('btn-search-customers');
    }

    bindEvents() {
        // Open Add Customer modal
        if (this.btnAddCustomerMain) {
            this.btnAddCustomerMain.addEventListener('click', () => {
                this.addCustomerOverlay.style.display = 'flex';
            });
        }

        // Close modal
        if (this.btnCancelCustomer) {
            this.btnCancelCustomer.addEventListener('click', () => {
                this.addCustomerOverlay.style.display = 'none';
                if (this.addCustomerForm) this.addCustomerForm.reset();
            });
        }

        // Add Customer — with validation
        if (this.addCustomerForm) {
            this.addCustomerForm.addEventListener('submit', (e) => {
                e.preventDefault();

                const nameEl    = document.getElementById('new-customer-name');
                const contactEl = document.getElementById('new-customer-contact');
                const addressEl = document.getElementById('new-customer-address');
                const emailEl   = document.getElementById('new-customer-email');

                const name    = nameEl    ? nameEl.value.trim()    : '';
                const contact = contactEl ? contactEl.value.trim() : '';
                const address = addressEl ? addressEl.value.trim() : '';
                const email   = emailEl   ? emailEl.value.trim()   : '';

                if (!name)    { NotificationService.showToast('Customer name is required.', 'error');   return; }
                if (!contact) { NotificationService.showToast('Contact number is required.', 'error'); return; }
                if (!address) { NotificationService.showToast('Address is required.', 'error');         return; }
                if (!email)   { NotificationService.showToast('Email is required.', 'error');           return; }

                DataStore.addCustomer(name, contact, address, email);
                NotificationService.showToast('Customer added successfully!', 'success');

                this.addCustomerOverlay.style.display = 'none';
                this.addCustomerForm.reset();
            });
        }

        // Real-time search: filter by ID or Name (case-insensitive)
        if (this.searchInput) {
            this.searchInput.addEventListener('input', () => this.applySearch());
        }
        if (this.btnSearch) {
            this.btnSearch.addEventListener('click', () => this.applySearch());
        }

        // Re-render on data changes
        window.addEventListener('dataUpdated', () => this.renderCustomers());

        // Delete via event delegation
        if (this.tableBody) {
            this.tableBody.addEventListener('click', (e) => {
                const trashIcon = e.target.closest('.action-icon[data-action="delete"]');
                if (trashIcon) {
                    const tr = trashIcon.closest('tr');
                    const id = tr ? tr.dataset.id : null;
                    if (id && confirm('Are you sure you want to delete this customer?')) {
                        DataStore.deleteCustomer(id);
                        NotificationService.showToast('Customer deleted.', 'success');
                    }
                }
            });
        }
    }

    applySearch() {
        if (!this.tableBody || !this.searchInput) return;
        const query = this.searchInput.value.trim().toLowerCase();
        const rows  = this.tableBody.querySelectorAll('tr[data-id]');

        rows.forEach(row => {
            const id   = (row.dataset.id   || '').toLowerCase();
            const name = (row.dataset.name || '').toLowerCase();
            const matches = !query || id.includes(query) || name.includes(query);
            row.style.display = matches ? '' : 'none';
        });
    }

    renderCustomers() {
        if (!this.tableBody) return;

        const customers = DataStore.getCustomers();

        if (customers.length === 0) {
            this.tableBody.innerHTML = `<tr><td colspan="6" style="text-align:center; padding: 20px; color: var(--color-text-light);">No customers found.</td></tr>`;
            return;
        }

        let html = '';
        customers.forEach(customer => {
            const name    = customer.name    || '';
            const contact = customer.contact || '';
            const address = customer.address || '-';
            const email   = customer.email   || '-';

            // Skip truly empty ghost entries
            if (!name && !contact) return;

            html += `
                <tr data-id="${customer.id}" data-name="${name.toLowerCase()}">
                    <td>${customer.id}</td>
                    <td>${name}</td>
                    <td>${address}</td>
                    <td>${contact}</td>
                    <td>${email}</td>
                    <td class="action-cell">
                        <i class="fa-regular fa-pen-to-square action-icon" title="Edit"></i>
                        <i class="fa-regular fa-trash-can action-icon" title="Delete"
                           data-action="delete" style="color: #d9534f;"></i>
                    </td>
                </tr>
            `;
        });

        this.tableBody.innerHTML = html || `<tr><td colspan="6" style="text-align:center; padding: 20px; color: var(--color-text-light);">No customers found.</td></tr>`;

        // Re-apply current search filter after re-render
        this.applySearch();
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new CustomerController();
});
