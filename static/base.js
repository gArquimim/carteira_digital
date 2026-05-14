const menuButton = document.getElementById("menu-button")
const menuSideBar = document.getElementById("menu-sidebar")

menuButton.addEventListener("click", () => {
    menuSideBar.classList.toggle("ocult")
})

function goToRegister () {
    window.location.href="/register"
}
function goToLogin () {
    window.location.href="/login"
}

function exitUser() {
    if (!confirm("Deseja sair?")) return
        fetch("/exit-user", {
            method: "POST"
        })
    .then( () => window.location.href="/")
}