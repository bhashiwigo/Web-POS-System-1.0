class DataStore {
    // Initialize default data if none exists
    static init() {
        if (!localStorage.getItem('categories')) {
            localStorage.setItem('categories', JSON.stringify([
                { name: 'Coffee', icon: 'fa-solid fa-mug-hot' },
                { name: 'Tea', icon: 'fa-solid fa-leaf' },
                { name: 'Snacks', icon: 'fa-solid fa-cookie-bite' },
                { name: 'Macha', icon: 'fa-solid fa-seedling' }
            ]));
        }

        if (!localStorage.getItem('users')) {
            localStorage.setItem('users', JSON.stringify([
                { username: 'admin', password: '1234', role: 'Manager', name: 'Bhashi', contact: '0712345678' }
            ]));
        }

        if (!localStorage.getItem('transactions')) {
            localStorage.setItem('transactions', JSON.stringify([
                // Mock some initial transactions
                { id: 'T001', amount: 15.00, user: 'Bhashi', timestamp: new Date().getTime() - 100000 },
                { id: 'T002', amount: 45.50, user: 'Bhashi', timestamp: new Date().getTime() - 50000 }
            ]));
        }

        const existingItems = JSON.parse(localStorage.getItem('items'));
        if (!existingItems || existingItems.length === 0 || existingItems[0].category === undefined) {
            localStorage.setItem('items', JSON.stringify([
                { id: 'I001', name: 'Espresso', sales: 120, price: 4.50, category: 'Coffee' },
                { id: 'I002', name: 'Latte', sales: 95, price: 5.00, category: 'Coffee' },
                { id: 'I003', name: 'Cappuccino', sales: 110, price: 5.50, category: 'Coffee' },
                { id: 'I004', name: 'Americano', sales: 150, price: 3.50, category: 'Coffee' },
                { id: 'I005', name: 'Green Tea', sales: 80, price: 3.00, category: 'Tea' },
                { id: 'I006', name: 'Black Tea', sales: 65, price: 2.50, category: 'Tea' },
                { id: 'I007', name: 'Matcha Latte', sales: 90, price: 5.50, category: 'Tea' },
                { id: 'I008', name: 'Chai Tea', sales: 45, price: 4.00, category: 'Tea' },
                { id: 'I009', name: 'Croissant', sales: 200, price: 3.50, category: 'Snacks' },
                { id: 'I010', name: 'Blueberry Muffin', sales: 85, price: 4.00, category: 'Snacks' },
                { id: 'I011', name: 'Chocolate Chip Cookie', sales: 150, price: 2.50, category: 'Snacks' },
                { id: 'I012', name: 'Club Sandwich', sales: 60, price: 7.50, category: 'Snacks' }
            ]));
        }

        if (!localStorage.getItem('customers')) {
            localStorage.setItem('customers', JSON.stringify([
                { id: 'C001', name: 'John Doe', contact: '123-456-7890' },
                { id: 'C002', name: 'Jane Smith', contact: '098-765-4321' }
            ]));
        }

        if (!localStorage.getItem('salesData')) {
            // Mock chart data (labels and data points)
            localStorage.setItem('salesData', JSON.stringify({
                labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
                revenue: [120, 190, 300, 250, 400, 350, 500]
            }));
        }

        if (!localStorage.getItem('settings')) {
            localStorage.setItem('settings', JSON.stringify({
                businessName: 'Serenity POS',
                contactInfo: 'info@gmail.com',
                timezone: 'UTC+5:30',
                currency: 'LKR',
                language: 'en',
                paymentMethods: {
                    cash: true,
                    card: true,
                    mobileWallet: true
                }
            }));
        }
    }

    // --- Users ---
    static getUsers() {
        return JSON.parse(localStorage.getItem('users')) || [];
    }
    
    static saveUsers(users) {
        localStorage.setItem('users', JSON.stringify(users));
        window.dispatchEvent(new Event('usersUpdated'));
    }

    static addUser(userObj) {
        const users = this.getUsers();
        if (users.find(u => u.username === userObj.username)) return false;
        users.push(userObj);
        this.saveUsers(users);
        return true;
    }

    static updateUser(originalUsername, updatedUserObj) {
        const users = this.getUsers();
        const index = users.findIndex(u => u.username === originalUsername);
        if (index === -1) return false;
        users[index] = updatedUserObj;
        this.saveUsers(users);
        return true;
    }

    static deleteUser(username) {
        let users = this.getUsers();
        users = users.filter(u => u.username !== username);
        this.saveUsers(users);
    }

    static getActiveUser() {
        return JSON.parse(localStorage.getItem('activeUser'));
    }

    static setActiveUser(user) {
        localStorage.setItem('activeUser', JSON.stringify(user));
    }

    static clearActiveUser() {
        localStorage.removeItem('activeUser');
    }

    // --- Transactions ---
    static getTransactions() {
        return JSON.parse(localStorage.getItem('transactions')) || [];
    }

    static getNextOrderId() {
        const transactions = this.getTransactions();
        return 'T' + String(transactions.length + 1).padStart(3, '0');
    }

    static addTransaction(amount, cartItems = []) {
        const transactions = this.getTransactions();
        const activeUser = this.getActiveUser();
        const userName = activeUser ? activeUser.name : 'Unknown';

        const newTx = {
            id: this.getNextOrderId(),
            amount: amount,
            user: userName,
            timestamp: new Date().getTime()
        };

        transactions.unshift(newTx); // Add to beginning
        localStorage.setItem('transactions', JSON.stringify(transactions));
        
        // Update item sales
        if (cartItems && cartItems.length > 0) {
            const allItems = this.getItems();
            cartItems.forEach(cartItem => {
                const itemIndex = allItems.findIndex(i => i.id === cartItem.item.id);
                if (itemIndex !== -1) {
                    allItems[itemIndex].sales = (allItems[itemIndex].sales || 0) + cartItem.quantity;
                }
            });
            localStorage.setItem('items', JSON.stringify(allItems));
            window.dispatchEvent(new Event('dataUpdated'));
        }

        // Notify listeners (Dashboard)
        window.dispatchEvent(new Event('transactionAdded'));
        return newTx;
    }

    static refundLastTransaction() {
        const transactions = this.getTransactions();
        if (transactions.length === 0) return null;

        // Remove the most recent transaction (first in array since we unshift)
        const refundedTx = transactions.shift();
        localStorage.setItem('transactions', JSON.stringify(transactions));

        // Deduct from sales data
        const data = this.getSalesData();
        data.revenue[data.revenue.length - 1] -= refundedTx.amount;
        // Ensure it doesn't go below 0 (for mockup purposes)
        if (data.revenue[data.revenue.length - 1] < 0) data.revenue[data.revenue.length - 1] = 0;
        localStorage.setItem('salesData', JSON.stringify(data));

        window.dispatchEvent(new Event('transactionAdded')); // Refresh lists
        window.dispatchEvent(new Event('chartDataUpdated')); // Refresh charts
        
        return refundedTx;
    }

    // --- Categories ---
    static getCategories() {
        return JSON.parse(localStorage.getItem('categories')) || [];
    }

    static addCategory(name, icon) {
        const categories = this.getCategories();
        const newCategory = { name, icon };
        categories.push(newCategory);
        localStorage.setItem('categories', JSON.stringify(categories));
        window.dispatchEvent(new Event('dataUpdated'));
        return newCategory;
    }

    // --- Items ---
    static getItems() {
        return JSON.parse(localStorage.getItem('items')) || [];
    }

    static addItem(name, price, category) {
        const items = this.getItems();
        const newItem = {
            id: 'I' + String(items.length + 1).padStart(3, '0'),
            name: name,
            sales: 0,
            price: parseFloat(price),
            category: category
        };
        items.push(newItem);
        localStorage.setItem('items', JSON.stringify(items));
        window.dispatchEvent(new Event('dataUpdated'));
        return newItem;
    }

    // --- Customers ---
    static getCustomers() {
        return JSON.parse(localStorage.getItem('customers')) || [];
    }

    static addCustomer(name, contact) {
        const customers = this.getCustomers();
        const newCustomer = {
            id: 'C' + String(customers.length + 1).padStart(3, '0'),
            name: name,
            contact: contact
        };
        customers.push(newCustomer);
        localStorage.setItem('customers', JSON.stringify(customers));
        window.dispatchEvent(new Event('dataUpdated'));
        return newCustomer;
    }

    static deleteCustomer(id) {
        let customers = this.getCustomers();
        customers = customers.filter(c => c.id !== id);
        localStorage.setItem('customers', JSON.stringify(customers));
        window.dispatchEvent(new Event('dataUpdated'));
    }

    // --- Chart Data ---
    static getSalesData() {
        return JSON.parse(localStorage.getItem('salesData'));
    }

    static addSaleToChart(amount) {
        const data = this.getSalesData();
        // Just arbitrarily add the amount to the last day for demonstration
        data.revenue[data.revenue.length - 1] += amount;
        localStorage.setItem('salesData', JSON.stringify(data));
        window.dispatchEvent(new Event('chartDataUpdated'));
    }

    // --- Settings ---
    static getSettings() {
        return JSON.parse(localStorage.getItem('settings'));
    }

    static saveSettings(settings) {
        localStorage.setItem('settings', JSON.stringify(settings));
        window.dispatchEvent(new Event('settingsUpdated'));
    }
}

// Initialize on load
DataStore.init();
