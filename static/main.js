function formatCurrency(value) {
    return value.toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL"
    })
}

const balanceEl = document.getElementById("balance-value")
balanceEl.textContent = formatCurrency(parseFloat(balanceEl.textContent))


const transactionForm = document.getElementById("transaction-form")
transactionForm.addEventListener("submit", function(event) {
    event.preventDefault()

    const transactionType = document.getElementById("transaction-type").value
    const amount = document.getElementById("transaction-amount").value

    fetch("/transaction", {
        method:"POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            transactionType,
            amount,
        })
    })

    .then(response => response.json())
    .then(data => {
        console.log(data)
        const message = data.message

        if (data.error) {
            document.getElementById("transaction-message").style.color="#b42121"
            document.getElementById("transaction-message").textContent=message
        }

        else {
            transactionForm.reset()

            document.getElementById("transaction-message").style.color="#4caf50"
            document.getElementById("transaction-message").textContent=message

            const formatedBalance = formatCurrency(data.balance)
            document.getElementById("balance-value").textContent=formatedBalance
        }
        setTimeout(() => {
            document.getElementById("transaction-message").textContent=""
        },3000)
    }
    )
})