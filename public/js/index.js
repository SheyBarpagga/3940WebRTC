document.getElementById("loginBtn").addEventListener("click", () => {
    let username = document.getElementById("username").value;
    if (username == "") {
        document.getElementById("errorMessage").innerHTML = "Please fill in the username field.";

    } else {
        localStorage.setItem('USER', username);
        window.location.replace("/main.html");
    }

})
