function formatCurrency(value) {
    return value.toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL"
    })
}

function loadRecentStatement() {
    fetch("/recent-statement", {
        method: "GET"
    })
    .then(response => response.json())
    .then(data => {

        const transactionInfo = data

        const dashboardStatement = document.getElementById("dashboard-statement")
        document.querySelectorAll(".statement-card").forEach(card => {
            card.remove()
        })
        document.getElementById("statement-header")?.remove()

        const statement = document.querySelector("#dashboard-statement")
        for (let i = 0; i < transactionInfo.length; i++) {

            if (i === 0) {

                let statementHeader = document.createElement("div")
                statementHeader.id = "statement-header"

                statementHeader.style.borderTopRightRadius = "0.4rem"
                statementHeader.style.borderTopLeftRadius = "0.4rem"

                statementHeader.innerHTML = `
                <span class="statement-header-span">Tipo</span>
                <span class="statement-header-span">Descrição</span>
                <span class="statement-header-span">Valor</span>
                <span class="statement-header-span">Data</span>`

                dashboardStatement.appendChild(statementHeader)
            }

            let transactionType = transactionInfo[i].transaction_type
            let value = transactionInfo[i].value
            let date = transactionInfo[i].date

            let statementCard = document.createElement("div")
            statementCard.classList.add("statement-card")

            if (transactionInfo.length === 0) {

                statementCard.style.borderTopRightRadius = "0.4rem"
                statementCard.style.borderTopLeftRadius = "0.4rem"
            }
            else if (i === transactionInfo.length -1) {
                statementCard.style.borderBottomRightRadius = "0.4rem"
                statementCard.style.borderBottomLeftRadius = "0.4rem"
            }

            if (i%2 === 0) {
                statementCard.style.backgroundColor = "#02385E"
            }
            else {
                statementCard.style.backgroundColor = "#013253"
            }


            let statementImg 
            let valueClass
            if (transactionType === "Pagamento") {
                statementImg = "/static/images/down-arrow.png"

                valueClass = "expense"
            }
            else {
                statementImg = "/static/images/up-arrow.png"

                valueClass = "income"
            }
            statementCard.innerHTML = `
                <img class="statement-card-img" src="${statementImg}">

                <p class="statement-card-text">${transactionType}</p>
                <p class="statement-card-text ${valueClass}">${value}</p>
                <p class="statement-card-text">${date}</p> 
            `
            dashboardStatement.appendChild(statementCard)
        }
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
        loadRecentStatement()
    }
    )
})

document.addEventListener("DOMContentLoaded", () => {

    loadRecentStatement()

})