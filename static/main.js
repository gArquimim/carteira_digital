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
                    <span class="statement-header-span">Data</span>
                `

                dashboardStatement.appendChild(statementHeader)
            }

            let descriptionText = "description-text"+i
            let descriptionButton = "descriptionButton"+i

            let transactionId = transactionInfo[i].transaction_id
            let transactionType = transactionInfo[i].transaction_type
            let description = transactionInfo[i].description
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
                statementImg = "/static/images/down-arrow-icon.png"

                valueClass = "expense"
            }
            else {
                statementImg = "/static/images/up-arrow-icon.png"

                valueClass = "income"
            }
            statementCard.innerHTML = `
                <img class="statement-card-arrow" src="${statementImg}">

                <p class="statement-card-text">${transactionType}</p>
                <p class="statement-card-text" id="${descriptionText}">${description}</p>
                <p class="statement-card-text ${valueClass}">${value}</p>
                <p class="statement-card-text">${date}</p>
                <button class="statement-card-edition" onclick="editDescription(${i}, ${transactionId})" id="${descriptionButton}"></button>
            `
            dashboardStatement.appendChild(statementCard)
        }
    })
}

function editDescription(i, transactionId) {

    let descriptionText = document.getElementById("description-text"+i)
    descriptionText.contentEditable = descriptionText.contentEditable === "true" ? "false" : "true"

    let descriptionButton = document.getElementById("descriptionButton"+i)
    descriptionButton.style.backgroundImage = descriptionButton.style.backgroundImage.includes("/static/images/check-icon.png") ? 
    "url(static/images/pencil-icon.png)" : "url(/static/images/check-icon.png)"

    if (descriptionButton.style.backgroundImage.includes("check")) {

        descriptionButton.style.width = "3rem"
        descriptionButton.style.height = "3rem"
        descriptionButton.style.marginLeft = "10px"

        descriptionButton.addEventListener("click", function(event) {
            event.preventDefault()

            let description = descriptionText.textContent

            fetch("/statement-description", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    description,
                    transactionId,
                })
            })

        })
    }
    else {
        descriptionButton.style.width = "4rem"
        descriptionButton.style.height = "4rem"
        descriptionButton.style.marginLeft = "0"
    }
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