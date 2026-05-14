document.addEventListener("DOMContentLoaded", () => {
    
    // --- Charts Initialization ---
    let salesChartInstance = null;
    let pieChartInstance = null;

    function initCharts() {
        const salesData = DataStore.getSalesData();
        if (!salesData) return;

        // Line Chart
        const ctxSales = document.getElementById('salesChart');
        if (ctxSales) {
            if (salesChartInstance) salesChartInstance.destroy();
            salesChartInstance = new Chart(ctxSales, {
                type: 'line',
                data: {
                    labels: salesData.labels,
                    datasets: [{
                        label: 'Revenue',
                        data: salesData.revenue,
                        borderColor: '#8B2620',
                        backgroundColor: 'rgba(139, 38, 32, 0.1)',
                        borderWidth: 2,
                        tension: 0.4,
                        fill: true
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: { display: false }
                    },
                    scales: {
                        y: { beginAtZero: true, grid: { color: 'rgba(0,0,0,0.05)' } },
                        x: { grid: { display: false } }
                    }
                }
            });
        }

        // Pie Chart
        const ctxPie = document.getElementById('pieChart');
        if (ctxPie) {
            const items = DataStore.getItems();
            const categories = DataStore.getCategories();
            
            const categorySales = {};
            categories.forEach(cat => categorySales[cat.name] = 0);
            
            items.forEach(item => {
                if (categorySales[item.category] !== undefined) {
                    categorySales[item.category] += item.sales; // based on quantity sold
                } else {
                    categorySales[item.category] = item.sales;
                }
            });

            const labels = Object.keys(categorySales);
            const data = Object.values(categorySales);
            
            const baseColors = ['#8B2620', '#DFAFAF', '#3E2A23', '#C47A60', '#F5E4E4', '#5C3605'];
            const bgColors = labels.map((_, i) => baseColors[i % baseColors.length]);

            if (pieChartInstance) pieChartInstance.destroy();
            pieChartInstance = new Chart(ctxPie, {
                type: 'doughnut',
                data: {
                    labels: labels,
                    datasets: [{
                        data: data,
                        backgroundColor: bgColors,
                        borderWidth: 0
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: { position: 'bottom' }
                    },
                    cutout: '70%'
                }
            });
        }
    }

    function updateTransactionsList() {
        const list = document.getElementById('dashboard-transactions-list');
        if (!list) return;
        
        const txs = DataStore.getTransactions();
        list.innerHTML = ''; 

        const startOfToday = new Date();
        startOfToday.setHours(0,0,0,0);
        const startOfTodayTime = startOfToday.getTime();

        const todayTxs = txs.filter(tx => tx.timestamp >= startOfTodayTime);
        const recent = todayTxs.slice(0, 10);
        
        if (recent.length === 0) {
             list.innerHTML = '<div style="padding:10px; color:var(--color-text-light);">No transactions today.</div>';
             return;
        }

        recent.forEach(tx => {
            const timeStr = new Date(tx.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
            list.innerHTML += `
                <div class="transaction-row" style="display:flex; justify-content:space-between; align-items:center; padding:10px; border-bottom:1px solid var(--color-card-border);">
                    <div>
                        <div style="font-weight:600; color:var(--color-text-dark);">${tx.id}</div>
                        <div style="font-size:12px; color:var(--color-text-light);">By: ${tx.user}</div>
                    </div>
                    <div style="text-align:right;">
                        <div style="font-weight:600; color:#4CAF50;">+$${tx.amount.toFixed(2)}</div>
                        <div style="font-size:12px; color:var(--color-text-light);">${timeStr}</div>
                    </div>
                </div>
            `;
        });
    }

    function updateFastMovingItems() {
        const grid = document.querySelector('.items-grid-mini');
        if (!grid) return;

        const items = DataStore.getItems();
        items.sort((a, b) => b.sales - a.sales);
        
        grid.innerHTML = '';
        const top10 = items.slice(0, 10);
        
        top10.forEach(item => {
            grid.innerHTML += `
                <div class="mini-item-box" title="${item.name} (${item.sales} sold)" style="display:flex; flex-direction:column; justify-content:center; align-items:center;">
                    <i class="fa-solid fa-box" style="margin-bottom: 4px;"></i>
                    <span style="font-size: 10px; text-align:center;">${item.name}</span>
                </div>
            `;
        });
    }

    function updateMetrics() {
        const elTotalRev = document.getElementById('metric-total-revenue');
        const elTodayRev = document.getElementById('metric-today-revenue');
        const elOnProg = document.getElementById('metric-on-progress');
        const elOnProgStat = document.getElementById('metric-on-progress-status');
        const elLowStock = document.getElementById('metric-low-stock');

        const txs = DataStore.getTransactions();
        let totalRevenue = 0;
        let todayRevenue = 0;
        let todayOrders = 0;

        const startOfToday = new Date();
        startOfToday.setHours(0,0,0,0);
        const startOfTodayTime = startOfToday.getTime();

        txs.forEach(tx => {
            totalRevenue += tx.amount;
            if (tx.timestamp >= startOfTodayTime) {
                todayRevenue += tx.amount;
                todayOrders++;
            }
        });

        if (elTotalRev) elTotalRev.textContent = `$ ${totalRevenue.toFixed(2)}`;
        if (elTodayRev) elTodayRev.textContent = `$ ${todayRevenue.toFixed(2)}`;
        if (elOnProg) elOnProg.innerHTML = `${todayOrders} <span class="subtitle">Orders</span>`;
        if (elOnProgStat) elOnProgStat.textContent = todayOrders > 0 ? "Good" : "Pending";

        let lowStockCount = 0;
        const items = DataStore.getItems();
        items.forEach(item => {
            // Mock low stock threshold (e.g. if we sold more than 100, we might be low)
            if (item.sales > 100) lowStockCount++; 
        });
        if (elLowStock) elLowStock.textContent = String(lowStockCount).padStart(2, '0');
    }

    // --- Event Listeners ---
    window.addEventListener('chartDataUpdated', initCharts);
    window.addEventListener('transactionAdded', () => {
        updateTransactionsList();
        updateFastMovingItems();
        updateMetrics();
        initCharts();
    });

    // Initial Load
    initCharts();
    updateTransactionsList();
    updateFastMovingItems();
    updateMetrics();

});
