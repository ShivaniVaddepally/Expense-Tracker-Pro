const form = document.getElementById("expense-form");
const transactionsList = document.getElementById("transactions");
const balanceDisplay = document.getElementById("balance");
const exportBtn = document.getElementById("exportCSV");
const clearBtn = document.getElementById("clearAll");

let transactions = JSON.parse(localStorage.getItem("transactions")) || [];

function updateLocalStorage() {
    localStorage.setItem("transactions", JSON.stringify(transactions));
}

function renderTransactions() {
    transactionsList.innerHTML = "";
    let balance = 0;

    transactions.forEach((t, index) => {
        balance += t.amount;

        const li = document.createElement("li");
        li.innerHTML = `
            <span>${t.date} - ${t.description} (${t.category})</span>
            <span>₹${t.amount}</span>
            <button onclick="deleteTransaction(${index})">❌</button>
        `;
        transactionsList.appendChild(li);
    });

    balanceDisplay.textContent = balance;
    updateChart();
}

function deleteTransaction(index) {
    transactions.splice(index, 1);
    updateLocalStorage();
    renderTransactions();
}

form.addEventListener("submit", e => {
    e.preventDefault();
    const description = document.getElementById("description").value;
    const amount = parseFloat(document.getElementById("amount").value);
    const category = document.getElementById("category").value;
    const date = document.getElementById("date").value;

    transactions.push({ description, amount, category, date });
    updateLocalStorage();
    renderTransactions();
    form.reset();
});

exportBtn.addEventListener("click", () => {
    let csvContent = "data:text/csv;charset=utf-8,Description,Amount,Category,Date\n";
    transactions.forEach(t => {
        csvContent += `${t.description},${t.amount},${t.category},${t.date}\n`;
    });
    const link = document.createElement("a");
    link.href = encodeURI(csvContent);
    link.download = "expenses.csv";
    link.click();
});

clearBtn.addEventListener("click", () => {
    if (confirm("Clear all expenses?")) {
        transactions = [];
        updateLocalStorage();
        renderTransactions();
    }
});

let chart;
function updateChart() {
    const categoryTotals = {};
    transactions.forEach(t => {
        categoryTotals[t.category] = (categoryTotals[t.category] || 0) + t.amount;
    });

    const ctx = document.getElementById("expenseChart").getContext("2d");
    if (chart) chart.destroy();
    chart = new Chart(ctx, {
        type: "pie",
        data: {
            labels: Object.keys(categoryTotals),
            datasets: [{
                data: Object.values(categoryTotals),
                backgroundColor: ["#ff7e5f", "#feb47b", "#6a89cc", "#38ada9"]
            }]
        }
    });
}

renderTransactions();
