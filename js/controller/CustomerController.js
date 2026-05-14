class CustomerController {
    constructor() {
        this.initElements();
        this.bindEvents();
        this.renderCustomers();
    }

    initElements() {
        this.tableBody = document.getElementById('customers-table-body');
        
        this.btnAddCustomerMain = document.getElementById('btn-add-customer-main');
        this.addCustomerOverlay = document.getElementById('add-customer-overlay');
        this.addCustomerForm = document.getElementById('add-customer-form');
        this.btnCancelCustomer = document.getElementById('btn-cancel-customer');
    }

    bindEvents() {
        // Open modal from main page
        if (this.btnAddCustomerMain) {
            this.btnAddCustomerMain.addEventListener('click', () => {
                this.addCustomerOverlay.style.display = 'flex';
            });
        }

        // Close modal
        if (this.btnCancelCustomer) {
            this.btnCancelCustomer.addEventListener('click', () => {
                this.addCustomerOverlay.style.display = 'none';
                if(this.addCustomerForm) this.addCustomerForm.reset();
            });
        }

        // Add Customer Form Submit
        if (this.addCustomerForm) {
            // Remove previous listeners if any to prevent duplicate submissions
            // A simple clone and replace helps if another controller attached something, 
            // but we'll assume this controller manages the main customer logic.
            this.addCustomerForm.addEventListener('submit', (e) => {
                e.preventDefault();
                const name = document.getElementById('new-customer-name').value;
                const contact = document.getElementById('new-customer-contact').value;
                
                DataStore.addCustomer(name, contact);
                NotificationService.show('Customer added successfully!', 'success');
                
                this.addCustomerOverlay.style.display = 'none';
                this.addCustomerForm.reset();
            });
        }

        // Listen for data updates to re-render table
        window.addEventListener('dataUpdated', () => {
            this.renderCustomers();
        });

        // Event delegation for delete buttons
        if (this.tableBody) {
            this.tableBody.addEventListener('click', (e) => {
                if (e.target.classList.contains('fa-trash-can')) {
                    const tr = e.target.closest('tr');
                    const id = tr.dataset.id;
                    if (id && confirm('Are you sure you want to delete this customer?')) {
                        DataStore.deleteCustomer(id);
                        NotificationService.show('Customer deleted.', 'success');
                    }
                }
            });
        }
    }

    renderCustomers() {
        if (!this.tableBody) return;
        
        const customers = DataStore.getCustomers();
        let html = '';
        
        if (customers.length === 0) {
            html = `<tr><td colspan="6" style="text-align:center;">No customers found.</td></tr>`;
        } else {
            customers.forEach(customer => {
                html += `
                    <tr data-id="${customer.id}">
                        <td>${customer.id}</td>
                        <td>${customer.name}</td>
                        <td>-</td>
                        <td>${customer.contact}</td>
                        <td>-</td>
                        <td class="action-cell">
                            <i class="fa-regular fa-pen-to-square action-icon" title="Edit"></i>
                            <i class="fa-regular fa-trash-can action-icon" title="Delete" style="color: #d9534f;"></i>
                        </td>
                    </tr>
                `;
            });
        }
        
        this.tableBody.innerHTML = html;
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new CustomerController();
});
