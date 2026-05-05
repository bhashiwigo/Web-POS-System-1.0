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
            if (pieChartInstance) pieChartInstance.destroy();
            pieChartInstance = new Chart(ctxPie, {
                type: 'doughnut',
                data: {
                    labels: ['Coffee', 'Tea', 'Snacks'],
                    datasets: [{
                        data: [55, 30, 15],
                        backgroundColor: ['#8B2620', '#DFAFAF', '#3E2A23'],
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

    // --- Tables and Grids ---
    function updateTransactionsList() {
        const list = document.getElementById('dashboard-transactions-list');
        if (!list) return;
        
        const txs = DataStore.getTransactions();
        list.innerHTML = ''; // Clear current

        // Take top 6
        const recent = txs.slice(0, 6);
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
        // Sort by sales descending
        items.sort((a, b) => b.sales - a.sales);
        
        grid.innerHTML = '';
        const top10 = items.slice(0, 10);
        
        top10.forEach(item => {
            grid.innerHTML += `
                <div class="mini-item-box" title="${item.name} (${item.sales} sold)" style="display:flex; flex-direction:column; justify-content:center; align-items:center;">
                    <i class="fa-solid fa-box" style="margin-bottom: 4px;"></i>
                    <span style="font-size: 10px;">${item.name}</span>
                </div>
            `;
        });
    }

    // --- Event Listeners ---
    window.addEventListener('chartDataUpdated', initCharts);
    window.addEventListener('transactionAdded', updateTransactionsList);

    // Initial Load
    initCharts();
    updateTransactionsList();
    updateFastMovingItems();

    // Dev Sim Button
    const simBtn = document.getElementById('dev-add-sale-btn');
    if (simBtn) {
        simBtn.addEventListener('click', () => {
            // Only allow if logged in
            if (!DataStore.getActiveUser()) {
                NotificationService.showToast("Please log in to make a sale.", "error");
                return;
            }
            
            const randomAmount = Math.floor(Math.random() * 50) + 10; // $10 - $60
            DataStore.addTransaction(randomAmount);
            DataStore.addSaleToChart(randomAmount);
            NotificationService.showToast(`New sale processed: $${randomAmount.toFixed(2)}`, "success");
        });
    }
});
