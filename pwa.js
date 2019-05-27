function initPWA() {
    var pwa = document.getElementById("pwa");
    var installer;
    var pwatimer = localStorage.getItem("pwatimer") || 0;

    function endPrompt(choice) {
        if (choice.outcome == "accepted") {
            console.log("A2HS prompt accepted.");
        }
        else {
            console.log("A2HS prompt dismissed.");
        }
        installer = null;
        window.removeEventListener("beforeinstallprompt", showPrompt);
        localStorage.setItem("pwatimer", Date.now());
    }

    function clickPrompt() {
        pwa.classList.add("hidden");
        installer.prompt();
        installer.userChoice.then(endPrompt);
    }

    function showPrompt(e) {
        e.preventDefault();
        installer = e;
        pwa.classList.remove("hidden");
        pwa.addEventListener("click", clickPrompt);
    }

    if ("serviceWorker" in navigator) {
        navigator.serviceWorker.register("nullsw.js").then(function (e) {
            console.log("[PWA] Service Worker registered for " + e.scope + ".");
        });
    }

    if (Date.now() - pwatimer >= 31536000000) { /* don't ask for a year */
        window.addEventListener("beforeinstallprompt", showPrompt);
    }
}

window.addEventListener("load", initPWA);
