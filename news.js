function initNews() {
    var news = document.getElementById("news");
    var versionRead = localStorage.getItem("versionRead");
    var newsData = {
        "version": "perma", // for simplicity, keep this as a string
        "title": "Update Log (Nov 9)",
        "log": [
            "Added button to copy permalink of current selection.",
            [
                "Desktop only."
            ],
            "[old] Fixed autosave on mobile.",
            [
                "In case anyone uses the planner/fragment counters on mobile.",
                "This update log is still buggy though."
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
