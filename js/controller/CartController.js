document.addEventListener("DOMContentLoaded", () => {
    
    // State
    let cartItems = []; // Array of { item: Object, quantity: Number }
    let allItems = [];
    let currentCategory = 'Coffee'; // Default
    
    // DOM Elements
    const itemsGrid = document.getElementById('cart-items-grid');
    const searchInput = document.getElementById('cart-search-input');
    const orderList = document.getElementById('cart-order-items-list');
    const cartCategoryCarousel = document.getElementById('cart-category-carousel');
    
    const elSubtotal = document.getElementById('cart-subtotal');
    const elDiscount = document.getElementById('cart-discount');
    const elDiscountVal = document.getElementById('cart-discount-val');
    const elNetTotal = document.getElementById('cart-net-total');
    const elPaid = document.getElementById('cart-paid');
    const elBalance = document.getElementById('cart-balance');

    const walkInCheckbox = document.getElementById('walk-in-checkbox');
    const customerSelect = document.getElementById('cart-customer-select');
    
    const orderIdLabel = document.getElementById('cart-order-id-label');
    const btnVoid = document.getElementById('btn-void-order');
    const btnPlaceOrder = document.getElementById('btn-place-order');
    const btnRefund = document.getElementById('btn-refund-order');

    // Modals
    const addCustomerBtn = document.getElementById('btn-add-customer');
    const customerOverlay = document.getElementById('add-customer-overlay');
    const cancelCustomerBtn = document.getElementById('btn-cancel-customer');
    const customerForm = document.getElementById('add-customer-form');

    // Notification Bell
    const bellIcon = document.getElementById('notification-bell');

    // --- Initialization ---
    function init() {
        if (orderIdLabel) orderIdLabel.textContent = "Order #" + DataStore.getNextOrderId().substring(1);
        loadCategories();
        loadItems();
        loadCustomers();
    }

    window.addEventListener('dataUpdated', () => {
        loadCategories();
        loadItems();
        loadCustomers();
    });

    // --- Items Display & Search & Filtering ---
    function loadItems() {
        allItems = DataStore.getItems();
        filterAndRenderItems();
    }

    function filterAndRenderItems(query = '') {
        let filtered = allItems.filter(item => item.category === currentCategory);
        
        if (query) {
            filtered = filtered.filter(item => item.name.toLowerCase().includes(query.toLowerCase()));
        }
        
        renderItemsGrid(filtered);
    }

    function renderItemsGrid(items) {
        if (!itemsGrid) return;
        itemsGrid.innerHTML = '';
        items.forEach(item => {
            const priceStr = item.price ? `$${item.price.toFixed(2)}` : '$0.00';
            itemsGrid.innerHTML += `
                <div class="item-card">
                    <div class="item-placeholder">
                         <img src="Assets/placeholder-item.jpg" alt="${item.name}" onerror="this.src='data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9IiNFQUQyRDIiLz48dGV4dCB4PSI1MCUiIHk9IjUwJSIgZm9udC1mYW1pbHk9InNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IiM4QjI2MjAiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5JbWFnZTwvdGV4dD48L3N2Zz4='">
                    </div>
                    <h3 class="item-name" style="margin-bottom: 5px;">${item.name}</h3>
                    <p style="font-size: 14px; margin-bottom: 15px; color: var(--color-text-dark); font-weight: bold;">${priceStr}</p>
                    <button class="btn-add-cart" data-id="${item.id}">Add To Cart</button>
                </div>
            `;
        });
    }

    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            filterAndRenderItems(e.target.value);
        });
    }

    function loadCategories() {
        if (!cartCategoryCarousel) return;
        const categories = DataStore.getCategories();
        const items = DataStore.getItems();
        
        let html = '';
        categories.forEach((cat, index) => {
            const count = items.filter(item => item.category === cat.name).length;
            // Set first category active if none selected
            if (index === 0 && !categories.find(c => c.name === currentCategory)) {
                currentCategory = cat.name;
            }
            const activeClass = cat.name === currentCategory ? 'active-category' : '';
            
            html += `
                <div class="category-card ${activeClass}" data-category="${cat.name}">
                    <div class="category-info">
                        <h3 class="category-name">${cat.name}</h3>
                        <p class="category-count">${count} Items</p>
                        <span class="status-badge">Available</span>
                    </div>
                    <div class="category-image">
                        <i class="${cat.icon}" style="font-size:28px;color:#5A1210;opacity:0.6;"></i>
                    </div>
                </div>
            `;
        });
        cartCategoryCarousel.innerHTML = html;
    }

    if (cartCategoryCarousel) {
        cartCategoryCarousel.addEventListener('click', (e) => {
            const card = e.target.closest('.category-card');
            if (!card) return;

            cartCategoryCarousel.querySelectorAll('.category-card').forEach(c => c.classList.remove('active-category'));
            card.classList.add('active-category');
            
            currentCategory = card.getAttribute('data-category');
            if (searchInput) searchInput.value = ''; // clear search on category change
            filterAndRenderItems();
        });
    }

    // Cart Add Logic
    function addToCart(itemId) {
        const item = allItems.find(i => i.id === itemId);
        if (!item) return;

        const existing = cartItems.find(c => c.item.id === itemId);
        if (existing) {
            existing.quantity += 1;
        } else {
            cartItems.push({ item: item, quantity: 1 });
        }

        renderCart();
        
        // Bell Animation
        if (bellIcon) {
            bellIcon.classList.remove('bell-flash');
            void bellIcon.offsetWidth; // trigger reflow
            bellIcon.classList.add('bell-flash');
        }
        
        NotificationService.showToast(`${item.name} added to cart!`, "success");
    }

    // Event Delegation for items grid
    if (itemsGrid) {
        itemsGrid.addEventListener('click', (e) => {
            if (e.target.classList.contains('btn-add-cart')) {
                const itemId = e.target.getAttribute('data-id');
                if (itemId) addToCart(itemId);
            }
        });
    }

    function renderCart() {
        if (!orderList) return;
        orderList.innerHTML = '';

        let subtotal = 0;

        cartItems.forEach((cartItem, index) => {
            const total = cartItem.item.price * cartItem.quantity;
            subtotal += total;

            orderList.innerHTML += `
                <div class="order-item-row" style="display:flex; justify-content:space-between; align-items:center;">
                    <div style="display:flex; flex-direction:column;">
                        <span class="order-item-name">${cartItem.item.name}</span>
                        <span style="font-size:12px; color:var(--color-text-light);">$${cartItem.item.price.toFixed(2)} x ${cartItem.quantity}</span>
                    </div>
                    <div style="font-weight:600;">$${total.toFixed(2)}</div>
                </div>
            `;
        });

        elSubtotal.textContent = subtotal.toFixed(2);
        calculateTotals();
    }

    function calculateTotals() {
        const subtotal = parseFloat(elSubtotal.textContent) || 0;
        
        // Validate Discount
        let discountPct = parseFloat(elDiscount.value) || 0;
        if (discountPct < 0) {
            discountPct = 0;
            elDiscount.value = 0;
        }
        if (discountPct > 100) {
            discountPct = 100;
            elDiscount.value = 100;
        }

        const discountAmt = subtotal * (discountPct / 100);
        elDiscountVal.textContent = discountAmt.toFixed(2);

        const netTotal = subtotal - discountAmt;
        elNetTotal.textContent = netTotal.toFixed(2);

        // Validate Paid Amount
        let paid = parseFloat(elPaid.value) || 0;
        if (paid < 0) {
            paid = 0;
            elPaid.value = 0;
        }

        const balance = paid - netTotal;
        elBalance.textContent = balance.toFixed(2);
        
        if (balance >= 0 && netTotal > 0) {
            elBalance.style.color = '#4CAF50'; // Green if fully paid
        } else if (netTotal > 0) {
            elBalance.style.color = '#F44336'; // Red if underpaid
        } else {
            elBalance.style.color = 'inherit';
        }
    }

    if (elDiscount) elDiscount.addEventListener('input', calculateTotals);
    if (elPaid) elPaid.addEventListener('input', calculateTotals);

    // --- Order Operations ---
    if (btnVoid) {
        btnVoid.addEventListener('click', () => {
            if (cartItems.length === 0) return;
            cartItems = [];
            if (elDiscount) elDiscount.value = 0;
            if (elPaid) elPaid.value = 0;
            renderCart();
            NotificationService.showToast("Order voided successfully.", "info");
        });
    }

    if (btnPlaceOrder) {
        btnPlaceOrder.addEventListener('click', () => {
            if (cartItems.length === 0) {
                NotificationService.showToast("Cart is empty!", "error");
                return;
            }

            const netTotal = parseFloat(elNetTotal.textContent) || 0;
            const balance = parseFloat(elBalance.textContent) || 0;
            
            // Basic validation for cash payments
            const isCash = document.querySelector('input[name="pay"]:checked')?.value === 'Cash';
            if (isCash && balance < 0) {
                NotificationService.showToast("Insufficient Paid Amount!", "error");
                return;
            }

            // Save Transaction
            DataStore.addTransaction(netTotal, cartItems);

            // Deduct stock qty for each cart item
            const allItems = DataStore.getItems();
            cartItems.forEach(cartItem => {
                const idx = allItems.findIndex(i => i.id === cartItem.item.id);
                if (idx !== -1) {
                    allItems[idx].qty = Math.max(0, (allItems[idx].qty || 0) - cartItem.quantity);
                }
            });
            localStorage.setItem('items', JSON.stringify(allItems));

            // Reset UI
            cartItems = [];
            if (elDiscount) elDiscount.value = 0;
            if (elPaid) elPaid.value = 0;
            renderCart();
            
            // Increment Order ID
            if (orderIdLabel) orderIdLabel.textContent = "Order #" + DataStore.getNextOrderId().substring(1);

            NotificationService.showToast("Order Placed Successfully!", "success");
        });
    }

    if (btnRefund) {
        btnRefund.addEventListener('click', () => {
            const refunded = DataStore.refundLastTransaction();
            if (refunded) {
                NotificationService.showToast(`Refunded Order ${refunded.id} ($${refunded.amount.toFixed(2)})`, "info");
                // Reset ID label if we rolled back
                if (orderIdLabel) orderIdLabel.textContent = "Order #" + DataStore.getNextOrderId().substring(1);
            } else {
                NotificationService.showToast("No transactions to refund.", "error");
            }
        });
    }

    // --- Customer Selection Logic ---
    function loadCustomers() {
        if (!customerSelect) return;
        const customers = DataStore.getCustomers();
        
        // Keep first option
        customerSelect.innerHTML = '<option value="">Select Customer</option>';
        
        customers.forEach(c => {
            customerSelect.innerHTML += `<option value="${c.id}">${c.name} (${c.contact})</option>`;
        });
    }

    if (walkInCheckbox && customerSelect) {
        walkInCheckbox.addEventListener('change', (e) => {
            if (e.target.checked) {
                customerSelect.disabled = true;
                customerSelect.value = '';
            } else {
                customerSelect.disabled = false;
            }
        });
    }

    // --- Add Customer Modal ---
    if (addCustomerBtn && customerOverlay && cancelCustomerBtn && customerForm) {
        addCustomerBtn.addEventListener('click', (e) => {
            e.preventDefault();
            customerOverlay.style.display = 'flex';
        });

        cancelCustomerBtn.addEventListener('click', () => {
            customerOverlay.style.display = 'none';
            customerForm.reset();
        });

        customerForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const name = document.getElementById('new-customer-name').value;
            const contact = document.getElementById('new-customer-contact').value;

            DataStore.addCustomer(name, contact);
            loadCustomers(); // refresh dropdown
            
            NotificationService.showToast(`Customer ${name} added successfully!`, "success");
            customerOverlay.style.display = 'none';
            customerForm.reset();
        });
    }

    // Trigger init
    init();
});
