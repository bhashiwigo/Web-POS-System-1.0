class AnalysisController {
    constructor() {
        this.initElements();
        this.bindEvents();
        this.renderTransactions();
    }

    initElements() {
        this.tableBody = document.getElementById('analysis-table-body');
        this.btnGenerateReport = document.getElementById('btn-generate-report');
    }

    bindEvents() {
        // Listen for transaction updates
        window.addEventListener('transactionAdded', () => {
            this.renderTransactions();
        });

        // Generate Report Button (mock functionality)
        if (this.btnGenerateReport) {
            this.btnGenerateReport.addEventListener('click', () => {
                const dateFrom = document.getElementById('analysis-date-from').value;
                const dateTo = document.getElementById('analysis-date-to').value;
                NotificationService.show(`Generating report from ${dateFrom} to ${dateTo}...`, 'info');
                this.renderTransactions();
            });
        }
    }

    renderTransactions() {
        if (!this.tableBody) return;
        
        const transactions = DataStore.getTransactions();
        let html = '';
        
        if (transactions.length === 0) {
            html = `<tr><td colspan="7" style="text-align:center;">No transactions found.</td></tr>`;
        } else {
            transactions.forEach(tx => {
                // Mock details
                const date = new Date(tx.timestamp).toLocaleDateString();
                const qty = Math.max(1, Math.floor(tx.amount / 5)); // Mock quantity
                const revenue = parseFloat(tx.amount);
                const profit = revenue * 0.30; // 30% profit
                const totalCost = revenue - profit;

                html += `
                    <tr>
                        <td>${date}</td>
                        <td>${tx.id}</td>
                        <td>Walk-in</td>
                        <td>${qty}</td>
                        <td>$${totalCost.toFixed(2)}</td>
                        <td>$${revenue.toFixed(2)}</td>
                        <td style="color: #5cb85c; font-weight: bold;">$${profit.toFixed(2)}</td>
                    </tr>
                `;
            });
        }
        
        this.tableBody.innerHTML = html;
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new AnalysisController();
});
