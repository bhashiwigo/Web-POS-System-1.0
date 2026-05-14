class ItemController {
    constructor() {
        this.initElements();
        this.bindEvents();
        this.renderAll();
    }

    initElements() {
        // Buttons
        this.btnAddCategory = document.getElementById('btn-add-category');
        this.btnAddItem = document.getElementById('btn-add-item');
        
        // Overlays
        this.categoryOverlay = document.getElementById('add-category-overlay');
        this.itemOverlay = document.getElementById('add-item-overlay');

        // Cancel buttons
        this.btnCancelCategory = document.getElementById('btn-cancel-category');
        this.btnCancelItem = document.getElementById('btn-cancel-item');

        // Forms
        this.categoryForm = document.getElementById('add-category-form');
        this.itemForm = document.getElementById('add-item-form');

        // Containers
        this.categoryCarousel = document.querySelector('#items .category-carousel');
        this.itemsGrid = document.getElementById('items-grid');
        this.categoryDropdown = document.getElementById('new-item-category');
    }

    bindEvents() {
        // Open modals
        if (this.btnAddCategory) {
            this.btnAddCategory.addEventListener('click', () => {
                this.categoryOverlay.style.display = 'flex';
            });
        }
        
        if (this.btnAddItem) {
            this.btnAddItem.addEventListener('click', () => {
                this.populateCategoryDropdown();
                this.itemOverlay.style.display = 'flex';
            });
        }

        // Close modals
        if (this.btnCancelCategory) {
            this.btnCancelCategory.addEventListener('click', () => {
                this.categoryOverlay.style.display = 'none';
                this.categoryForm.reset();
            });
        }

        if (this.btnCancelItem) {
            this.btnCancelItem.addEventListener('click', () => {
                this.itemOverlay.style.display = 'none';
                this.itemForm.reset();
            });
        }

        // Form submissions
        if (this.categoryForm) {
            this.categoryForm.addEventListener('submit', (e) => {
                e.preventDefault();
                const name = document.getElementById('new-category-name').value;
                const icon = document.getElementById('new-category-icon').value;
                
                DataStore.addCategory(name, icon);
                NotificationService.show('Category added successfully!', 'success');
                
                this.categoryOverlay.style.display = 'none';
                this.categoryForm.reset();
            });
        }

        if (this.itemForm) {
            this.itemForm.addEventListener('submit', (e) => {
                e.preventDefault();
                const name = document.getElementById('new-item-name').value;
                const price = document.getElementById('new-item-price').value;
                const category = document.getElementById('new-item-category').value;
                
                DataStore.addItem(name, price, category);
                NotificationService.show('Item added successfully!', 'success');
                
                this.itemOverlay.style.display = 'none';
                this.itemForm.reset();
            });
        }

        // Listen for data updates
        window.addEventListener('dataUpdated', () => {
            this.renderAll();
        });
    }

    renderAll() {
        this.renderCategories();
        this.renderItems();
    }

    renderCategories() {
        if (!this.categoryCarousel) return;
        
        const categories = DataStore.getCategories();
        const items = DataStore.getItems();
        
        // We will keep the 'see-more-arrow' at the end
        let html = '';
        
        categories.forEach((cat, index) => {
            // Count items in category
            const count = items.filter(item => item.category === cat.name).length;
            const activeClass = index === 0 ? 'active-category' : '';
            
            html += `
                <div class="category-card ${activeClass}" data-category="${cat.name}">
                    <div class="category-info">
                        <h3 class="category-name">${cat.name}</h3>
                        <p class="category-count">${count} Items</p>
                        <span class="status-badge">Available</span>
                    </div>
                    <div class="category-image">
                        <i class="${cat.icon}" style="font-size: 28px; color: #5A1210; opacity: 0.65;"></i>
                    </div>
                </div>
            `;
        });
        
        html += `
            <div class="see-more-arrow" title="See more">
                <i class="fa-solid fa-angles-right"></i>
            </div>
        `;
        
        this.categoryCarousel.innerHTML = html;
    }

    renderItems() {
        if (!this.itemsGrid) return;
        
        const items = DataStore.getItems();
        let html = '';
        
        items.forEach(item => {
            // Pick a random icon based on category for placeholder if needed, or a default one
            let iconClass = 'fa-solid fa-box';
            const cat = DataStore.getCategories().find(c => c.name === item.category);
            if (cat) {
                iconClass = cat.icon;
            }
            
            html += `
                <div class="item-card">
                    <div class="item-placeholder"><i class="${iconClass}"></i></div>
                    <h3 class="item-name">${item.name}</h3>
                    <p style="font-size: 12px; color: #666; margin-top: 4px;">$${item.price.toFixed(2)}</p>
                </div>
            `;
        });
        
        this.itemsGrid.innerHTML = html;
    }

    populateCategoryDropdown() {
        if (!this.categoryDropdown) return;
        
        const categories = DataStore.getCategories();
        let html = '<option value="">Select Category</option>';
        
        categories.forEach(cat => {
            html += `<option value="${cat.name}">${cat.name}</option>`;
        });
        
        this.categoryDropdown.innerHTML = html;
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new ItemController();
});
