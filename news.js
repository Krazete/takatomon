function initNews() {
    var news = document.getElementById("news");
    var versionRead = localStorage.getItem("versionRead");
    var newsData = {
        "version": "fixedcache", // for simplicity, keep this as a string
        "title": "Update Log (Oct 27)",
        "log": [
            "Added fragment count filter to search menu.",
            "<b>Fixed autosave issues on mobile devices.</b>",
            [
                "This affected the planner, fragment counters, and settings."
            ],
            "Replaced advent indicators with advent countdowns.",
            "The search menu advent filter now shows all advent Digimon (not just ongoing quests).",
            "Added an update log. Here are some several-week-old updates:",
            [
                "Fixed Chortos links (shouldnt lead to 404 pages anymore).",
                "Fixed search menu bugs.",
                "Removed tiers (click \"Old Tiers\" above if you need it).",
                "Added physical/magical skill indicators.",
                "Reduced opacity of Digimon unavailable in global Links.",
                "Made untangle-sort work again.",
                "Restored sort-by-tribe option.",
                "Replaced Preview setting with Connections."
            ]
        ]
    };

    function log2ul(list) {
        var ul = document.createElement("ul");
        for (var item of list) {
            if (typeof item == "string") {
                var li = document.createElement("li");
                li.innerHTML = item;
                ul.appendChild(li);
            }
            else {
                var subul = log2ul(item);
                ul.appendChild(subul);
            }
        }
        return ul;
    }

    function markAsRead() {
        localStorage.setItem("versionRead", newsData.version);
        news.classList.add("hidden");
        updateLines();
    }

    if (versionRead == newsData.version) {
        markAsRead();
    }
    else {
        var div = document.createElement("div");
            div.innerHTML = newsData.title;
            var ul = log2ul(newsData.log);
            div.appendChild(ul);
            div.innerHTML += "Click to close."
        news.appendChild(div);
    }
    addTapListener(news, markAsRead);
}

window.addEventListener("DOMContentLoaded", initNews);
