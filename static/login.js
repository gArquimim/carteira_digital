function goToHome() {
    window.location.href="/"
}

function showToast(messages) {
    const toast = document.getElementById("toast")
    toast.textContent = messages
    toast.classList.add("show")
    setTimeout(function() {
        toast.classList.remove("show")
    }, 1200)
}

const authForm = document.getElementById("auth-form")
console.log("line 10")
authForm.addEventListener("submit", function(event) {
    event.preventDefault();

    const email = document.getElementById("email-input").value
    const password = document.getElementById("password-input").value

    console.log("line 15")
    fetch("/login", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            email,
            password, 
        })
    })

    .then(response => response.json())
    .then(data => {
        console.log(data)
        document.querySelectorAll(".small-message").forEach(function(element) {
            element.textContent=""})

        const errorField = data.error_field
        const message = data.message

        if (data.logged) {
            showToast(message)
            authForm.reset()
            setTimeout(() => {
                window.location.href="/"
            },1500)
        }
        else {
            document.getElementById(errorField).textContent=message
        }

    })
})

