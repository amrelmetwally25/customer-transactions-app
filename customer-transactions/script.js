document.addEventListener('DOMContentLoaded', async () => {
    try {
        const response = await fetch('http://localhost:3000/customers');
        const customers = await response.json();

        const transactionsResponse = await fetch('http://localhost:3000/transactions');
        const transactions = await transactionsResponse.json();

        const tableBody = document.getElementById('table-body');
        const searchInput = document.getElementById('search');
        const transactionChart = document.getElementById('transactionChart').getContext('2d');
        let chart;

        function displayTable(filteredTransactions) {
            tableBody.innerHTML = '';
            filteredTransactions.forEach(transaction => {
                const customer = customers.find(c => c.id == transaction.customer_id);
                if (customer) {
                    const row = document.createElement('tr');
                    row.innerHTML = `
                        <td>${customer.name}</td>
                        <td>${transaction.date}</td>
                        <td>${transaction.amount}</td>
                    `;
                    row.addEventListener('click', () => displayChart(customer.id));
                    tableBody.appendChild(row);
                }
            });
        }

        function displayChart(customerId) {
            const customerTransactions = transactions.filter(t => t.customer_id == customerId);
            const dates = [...new Set(customerTransactions.map(t => t.date))].sort();
            const amounts = dates.map(date => {
                return customerTransactions
                    .filter(t => t.date === date)
                    .reduce((sum, t) => sum + t.amount, 0);
            });

            if (chart) chart.destroy();

            chart = new chart(transactionChart, {
                type: 'line',
                data: {
                    labels: dates,
                    datasets: [{
                        label: 'Total Transaction Amount',
                        data: amounts,
                        borderColor: 'rgba(75, 192, 192, 1)',
                        borderWidth: 1,
                        fill: false
                    }]
                },
                options: {
                    scales: {
                        y: {
                            beginAtZero: true
                        }
                    }
                }
            });
        }

        searchInput.addEventListener('input', () => {
            const searchTerm = searchInput.value.toLowerCase();
            const filteredTransactions = transactions.filter(t => {
                const customer = customers.find(c => c.id == t.customer_id);
                return customer && (customer.name.toLowerCase().includes(searchTerm) || t.amount.toString().includes(searchTerm));
            });
            displayTable(filteredTransactions);
        });

        displayTable(transactions);
    } catch (error) {
        console.error('Error fetching data:', error);
    }
});
