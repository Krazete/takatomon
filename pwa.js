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
        // if (navigator.serviceWorker.controller) {
        //     console.log("[PWA Builder] Active service worker found, no need to register.");
        // }
        // else {
            navigator.serviceWorker.register("nullsw.js").then(function (e) {
                console.log("[PWA Builder] Service worker has been registered for scope: " + e.scope);
            });
        // }
    }

    if (Date.now() - pwatimer >= 31536000000) { /* don't ask for a year */
        window.addEventListener("beforeinstallprompt", showPrompt);
    }
}

window.addEventListener("load", initPWA);
