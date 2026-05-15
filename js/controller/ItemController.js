class ItemController {
    constructor() {
        this.activeCategory = null; // null = show all
        this.searchQuery = '';
        this.initElements();
        this.bindEvents();
        this.renderAll();
    }

    initElements() {
        this.btnAddCategory  = document.getElementById('btn-add-category');
        this.btnAddItem      = document.getElementById('btn-add-item');
        this.categoryOverlay = document.getElementById('add-category-overlay');
        this.itemOverlay     = document.getElementById('add-item-overlay');
        this.btnCancelCategory = document.getElementById('btn-cancel-category');
        this.btnCancelItem   = document.getElementById('btn-cancel-item');
        this.categoryForm    = document.getElementById('add-category-form');
        this.itemForm        = document.getElementById('add-item-form');
        this.categoryCarousel = document.querySelector('#items .category-carousel');
        this.itemsGrid       = document.getElementById('items-grid');
        this.categoryDropdown = document.getElementById('new-item-category');
        this.searchInput     = document.getElementById('items-search-input');
        this.btnSearch       = document.getElementById('btn-items-search');
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

        // Add Category submit
        if (this.categoryForm) {
            this.categoryForm.addEventListener('submit', (e) => {
                e.preventDefault();
                const name = document.getElementById('new-category-name').value.trim();
                const icon = document.getElementById('new-category-icon').value.trim() || 'fa-solid fa-tag';
                DataStore.addCategory(name, icon);
                NotificationService.showToast('Category added!', 'success');
                this.categoryOverlay.style.display = 'none';
                this.categoryForm.reset();
            });
        }

        // Add Item submit
        if (this.itemForm) {
            this.itemForm.addEventListener('submit', (e) => {
                e.preventDefault();
                const name     = document.getElementById('new-item-name').value.trim();
                const price    = document.getElementById('new-item-price').value;
                const category = document.getElementById('new-item-category').value;
                DataStore.addItem(name, price, category);
                NotificationService.showToast('Item added!', 'success');
                this.itemOverlay.style.display = 'none';
                this.itemForm.reset();
            });
        }

        // Real-time search
        if (this.searchInput) {
            this.searchInput.addEventListener('input', (e) => {
                this.searchQuery = e.target.value.trim().toLowerCase();
                this.renderItems();
            });
        }

        // Search button
        if (this.btnSearch) {
            this.btnSearch.addEventListener('click', () => {
                this.searchQuery = (this.searchInput?.value || '').trim().toLowerCase();
                this.renderItems();
            });
        }

        // Category card clicks + delete — event delegation on carousel
        if (this.categoryCarousel) {
            this.categoryCarousel.addEventListener('click', (e) => {
                const deleteBtn = e.target.closest('.btn-delete-category');
                if (deleteBtn) {
                    e.stopPropagation();
                    const catName = deleteBtn.dataset.category;
                    if (confirm(`Delete category "${catName}"?`)) {
                        DataStore.deleteCategory(catName);
                        if (this.activeCategory === catName) this.activeCategory = null;
                    }
                    return;
                }

                const card = e.target.closest('.category-card');
                if (card) {
                    this.activeCategory = card.dataset.category || null;
                    this.renderCategories();
                    this.renderItems();
                }
            });
        }

        // Item delete — event delegation on grid
        if (this.itemsGrid) {
            this.itemsGrid.addEventListener('click', (e) => {
                const deleteBtn = e.target.closest('.btn-delete-item');
                if (deleteBtn) {
                    e.stopPropagation();
                    const itemId = deleteBtn.dataset.id;
                    if (confirm('Delete this item?')) {
                        DataStore.deleteItem(itemId);
                    }
                }
            });
        }

        // Data updates
        window.addEventListener('dataUpdated', () => this.renderAll());
    }

    renderAll() {
        this.renderCategories();
        this.renderItems();
    }

    renderCategories() {
        if (!this.categoryCarousel) return;

        const categories = DataStore.getCategories();
        const items      = DataStore.getItems();

        let html = '';
        categories.forEach((cat) => {
            const count      = items.filter(i => i.category === cat.name).length;
            const isActive   = this.activeCategory === cat.name;
            const activeClass = isActive ? 'active-category' : '';

            html += `
                <div class="category-card ${activeClass}" data-category="${cat.name}" style="position: relative;">
                    <button class="btn-delete-category" data-category="${cat.name}" title="Delete category">
                        <i class="fa-solid fa-xmark"></i>
                    </button>
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

        this.categoryCarousel.innerHTML = html;
    }

    renderItems() {
        if (!this.itemsGrid) return;

        let items = DataStore.getItems();

        // Filter by active category
        if (this.activeCategory) {
            items = items.filter(i => i.category === this.activeCategory);
        }

        // Filter by search query
        if (this.searchQuery) {
            items = items.filter(i => i.name.toLowerCase().includes(this.searchQuery));
        }

        if (items.length === 0) {
            this.itemsGrid.innerHTML = `
                <div style="padding: 20px; color: var(--color-text-light); font-style: italic; grid-column: 1 / -1; text-align: center;">
                    No items found.
                </div>`;
            return;
        }

        let html = '';
        items.forEach(item => {
            const cat = DataStore.getCategories().find(c => c.name === item.category);
            const iconClass = cat ? cat.icon : 'fa-solid fa-box';

            html += `
                <div class="item-card" style="position: relative;">
                    <button class="btn-delete-item" data-id="${item.id}" title="Delete item">
                        <i class="fa-solid fa-xmark"></i>
                    </button>
                    <div class="item-placeholder"><i class="${iconClass}"></i></div>
                    <h3 class="item-name">${item.name}</h3>
                    <p class="item-price">$${item.price.toFixed(2)}</p>
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

document.addEventListener('DOMContentLoaded', () => {
    new ItemController();
});
