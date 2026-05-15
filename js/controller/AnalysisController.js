class AnalysisController {
    constructor() {
        this.barChartInstance = null;
        this.pieChartInstance = null;
        this.initElements();
        this.setDefaultDates();
        this.bindEvents();
        this.refresh();
    }

    initElements() {
        this.tableBody      = document.getElementById('analysis-table-body');
        this.dateFrom       = document.getElementById('analysis-date-from');
        this.dateTo         = document.getElementById('analysis-date-to');
        this.btnApply       = document.getElementById('btn-generate-report');
        this.btnReset       = document.getElementById('btn-reset-filter');
        this.elTotalRev     = document.getElementById('analysis-total-revenue');
        this.elTodayRev     = document.getElementById('analysis-today-revenue');
        this.elLowStock     = document.getElementById('analysis-low-stock');
    }

    setDefaultDates() {
        const today = new Date();
        const past7 = new Date();
        past7.setDate(today.getDate() - 6);

        const fmt = d => d.toISOString().split('T')[0];
        if (this.dateFrom && !this.dateFrom.value) this.dateFrom.value = fmt(past7);
        if (this.dateTo   && !this.dateTo.value)   this.dateTo.value   = fmt(today);
    }

    bindEvents() {
        if (this.btnApply) {
            this.btnApply.addEventListener('click', () => this.refresh());
        }

        if (this.btnReset) {
            this.btnReset.addEventListener('click', () => {
                if (this.dateFrom) this.dateFrom.value = '';
                if (this.dateTo)   this.dateTo.value   = '';
                this.refresh();
            });
        }

        window.addEventListener('transactionAdded', () => this.refresh());
    }

    /* ── Helpers ──────────────────────────────────────────────────── */

    getFilteredTransactions() {
        const all = DataStore.getTransactions();
        const fromVal = this.dateFrom ? this.dateFrom.value : '';
        const toVal   = this.dateTo   ? this.dateTo.value   : '';

        if (!fromVal && !toVal) return all;

        const fromTs = fromVal ? new Date(fromVal).setHours(0,0,0,0)  : -Infinity;
        const toTs   = toVal   ? new Date(toVal).setHours(23,59,59,999) : Infinity;

        return all.filter(tx => tx.timestamp >= fromTs && tx.timestamp <= toTs);
    }

    /* ── Main refresh ─────────────────────────────────────────────── */

    refresh() {
        this.updateMetrics();
        this.renderTransactions();
        this.renderBarChart();
        this.renderPieChart();
    }

    /* ── Metric Cards ─────────────────────────────────────────────── */

    updateMetrics() {
        const allTx = DataStore.getTransactions();
        const today0 = new Date(); today0.setHours(0,0,0,0);

        let totalRevenue = 0;
        let todayRevenue = 0;
        allTx.forEach(tx => {
            totalRevenue += tx.amount;
            if (tx.timestamp >= today0.getTime()) todayRevenue += tx.amount;
        });

        if (this.elTotalRev) this.elTotalRev.textContent = `$ ${totalRevenue.toFixed(2)}`;
        if (this.elTodayRev) this.elTodayRev.textContent = `$ ${todayRevenue.toFixed(2)}`;

        const items = DataStore.getItems();
        const lowStock = items.filter(i => (i.qty ?? 0) < 10).length;
        if (this.elLowStock) this.elLowStock.textContent = String(lowStock).padStart(2, '0');
    }

    /* ── Orders Table ─────────────────────────────────────────────── */

    renderTransactions() {
        if (!this.tableBody) return;

        const txs = this.getFilteredTransactions();

        if (txs.length === 0) {
            this.tableBody.innerHTML = `<tr><td colspan="7" style="text-align:center; padding:20px; color:var(--color-text-light);">No transactions found for this period.</td></tr>`;
            return;
        }

        let html = '';
        txs.forEach(tx => {
            const date     = new Date(tx.timestamp).toLocaleDateString('en-GB');
            const qty      = tx.items ? tx.items.reduce((s, i) => s + (i.quantity || 1), 0)
                                      : Math.max(1, Math.floor(tx.amount / 5));
            const revenue  = parseFloat(tx.amount);
            const profit   = revenue * 0.30;
            const cost     = revenue - profit;
            const custId   = tx.customerId || 'Walk-in';

            html += `
                <tr>
                    <td>${date}</td>
                    <td>${tx.id}</td>
                    <td>${custId}</td>
                    <td>${qty}</td>
                    <td>$${cost.toFixed(2)}</td>
                    <td>$${revenue.toFixed(2)}</td>
                    <td style="color: #5cb85c; font-weight: bold;">$${profit.toFixed(2)}</td>
                </tr>
            `;
        });

        this.tableBody.innerHTML = html;
    }

    /* ── Bar Chart ────────────────────────────────────────────────── */

    renderBarChart() {
        const ctx = document.getElementById('analysisSalesChart');
        if (!ctx) return;

        const txs = this.getFilteredTransactions();

        // Group by date label "12 May"
        const grouped = {};
        txs.forEach(tx => {
            const d   = new Date(tx.timestamp);
            const key = d.getDate() + ' ' + d.toLocaleString('en-US', { month: 'short' });
            grouped[key] = (grouped[key] || 0) + tx.amount;
        });

        const labels  = Object.keys(grouped);
        const revenue = Object.values(grouped);

        if (this.barChartInstance) this.barChartInstance.destroy();
        this.barChartInstance = new Chart(ctx, {
            type: 'bar',
            data: {
                labels,
                datasets: [{
                    label: 'Revenue ($)',
                    data: revenue,
                    backgroundColor: 'rgba(139, 38, 32, 0.7)',
                    borderColor: '#8B2620',
                    borderWidth: 1,
                    borderRadius: 6
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: {
                    y: { beginAtZero: true, grid: { color: 'rgba(0,0,0,0.05)' } },
                    x: { grid: { display: false } }
                }
            }
        });
    }

    /* ── Pie Chart ────────────────────────────────────────────────── */

    renderPieChart() {
        const ctx = document.getElementById('analysisPieChart');
        if (!ctx) return;

        const items      = DataStore.getItems();
        const categories = DataStore.getCategories();

        const catSales = {};
        categories.forEach(c => catSales[c.name] = 0);
        items.forEach(item => {
            if (catSales[item.category] !== undefined) {
                catSales[item.category] += item.sales;
            } else {
                catSales[item.category] = item.sales;
            }
        });

        const labels = Object.keys(catSales).filter(k => catSales[k] > 0);
        const data   = labels.map(k => catSales[k]);
        const colors = ['#8B2620', '#DFAFAF', '#3E2A23', '#C47A60', '#F5E4E4', '#5C3605'];

        if (this.pieChartInstance) this.pieChartInstance.destroy();
        this.pieChartInstance = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels,
                datasets: [{
                    data,
                    backgroundColor: labels.map((_, i) => colors[i % colors.length]),
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                layout: { padding: 4 },
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: { boxWidth: 12, padding: 10, font: { size: 11 } }
                    }
                },
                cutout: '65%'
            }
        });
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new AnalysisController();
});
