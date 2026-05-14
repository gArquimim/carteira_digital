function goToHome() {
    window.location.href="/"
}

function showToast(messages) {
    const toast = document.getElementById("toast")
    toast.textContent = messages
    toast.classList.add("show")
    setTimeout(function() {
        toast.classList.remove("show")
    }, 3000)
}

const authForm = document.getElementById("auth-form")

authForm.addEventListener("submit", function(event) {
    event.preventDefault();

    const name = document.getElementById("name-input").value
    const email = document.getElementById("email-input").value
    const password = document.getElementById("password-input").value
    const passwordConfirm = document.getElementById("password-confirm-input").value
    
    fetch("/register", {
        method:"POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({  
            name,
            email,
            password,
            passwordConfirm,
        })
    })
    .then(response => response.json())
    .then(data => {        
        document.querySelectorAll(".small-message").forEach(function(element) {
            element.textContent=""
        })

        const errorFields = data.error_fields
        const messages = data.messages

        if (errorFields) {

            for (let i = 0; i < errorFields.length; i++) {
                document.getElementById([errorFields[i]]).textContent=messages[i]
            }
        }
        else {
            showToast(messages)
            authForm.reset()

        }
          
    })  
})


