/* NOTE: read "digi" as "nodeset" and "mon" as "node" */

/* DATA */

/* Name Collections */

var blank;

var selectedDigi = new Set();
var treeOptionSelected = "intersection";
var viewOptionSelected = 1;
var filter = {
    "filter": new Set(),
    "tribe": new Set(),
    "rival": new Set(),
    "effect": new Set(),
    "event": new Set()
};

/* Tree Visualization */

function update() {
    if (search.value) {
        return;
    }
    var selection = getProfiles("selection");
    var childs = Array.from(selection.children);
    for (var child of childs) {
        if (child != blank) {
            child.remove();
        }
    }
    if (selectedDigi.size) {
        blank.classList.add("hidden");
        for (var mon of selectedDigi) {
            var clone = document.getElementById(mon).cloneNode(true);
            clone.className = "profile"; // remove node and root class
            clone.id = mon + "-clone";
            var card = clone.getElementsByClassName("card")[0];
            addTapListener(card, function () {
                deselectDigi(this.parentNode.id.slice(0, -6));
            });
            selection.appendChild(clone);
        }
        var gemel = new Gemel(selectedDigi); // TODO: don't call this every single time, store it somewhere globally
        drawTree(gemel);
    }
    else {
        blank.classList.remove("hidden");
        for (var mon in digi) {
            document.getElementById(mon).classList.remove("root");
            document.getElementById(mon).classList.remove("node");
            document.getElementById(mon).classList.remove("hidden");
            if (filterIncludes(mon)) {
                document.getElementById(mon).classList.add("hidden");
            }
        }
        linelayer.innerHTML = "";
    }
}

function filterIncludes(mon) {
    var tribeIncludes = filter.tribe.size && !filter.tribe.has(digi[mon].tribe);
    var rivalIncludes = filter.rival.size && !digi[mon].skills.some(skill => filter.rival.has(skill[0]));
    var effectIncludes = filter.effect.size && !digi[mon].skills.some(skill => filter.effect.has(["sup", "st", "aoe"][skill[1]]));
    return tribeIncludes || rivalIncludes || effectIncludes;
}

function drawTree(gemel) {
    drawNodes(gemel);
    drawEdges(gemel);
}

function drawNodes(gemel) {
    var tree = gemel[treeOptionSelected]();
    for (var mon in digi) {
        document.getElementById(mon).classList.remove("root");
        document.getElementById(mon).classList.remove("node");
        document.getElementById(mon).classList.remove("hidden");
        if (gemel.roots.has(mon)) {
            document.getElementById(mon).classList.add("node");
            document.getElementById(mon).classList.add("root");
        }
        else if (tree.nodes.has(mon)) {
            document.getElementById(mon).classList.add("node");
        }
        else if (viewOptionSelected){
            document.getElementById(mon).classList.add("hidden");
        }
    }
}

function drawLine(a, b, color, width) {
    var path = document.createElement("path");
    if (a.y < b.y) {
        path.setAttribute("d",
            "M" + a.x + "," + a.y +
            "S" + a.x + "," + (0.75 * a.y + 0.25 * b.y) +
            " " + (0.5 * a.x + 0.5 * b.x) + "," + (0.5 * a.y + 0.5 * b.y) +
            "M" + b.x + "," + b.y +
            "S" + b.x + "," + (0.25 * a.y + 0.75 * b.y) +
            " " + (0.5 * a.x + 0.5 * b.x) + "," + (0.5 * a.y + 0.5 * b.y)
        );
    }
    else {
        var sign = b.x - a.x >= 0 ? 1 : -1;
        var dx = sign * 32;
        var dy = 16;
        path.setAttribute("d",
            "M" + a.x + "," + a.y +
            "C" + a.x + "," + (a.y + dy) +
            " " + (a.x + dx) + "," + (a.y + dy) +
            " " + (0.5 * a.x + 0.5 * b.x) + "," + (0.5 * a.y + 0.5 * b.y) +
            "M" + b.x + "," + b.y +
            "C" + b.x + "," + (b.y - dy) +
            " " + (b.x - dx) + "," + (b.y - dy) +
            " " + (0.5 * a.x + 0.5 * b.x) + "," + (0.5 * a.y + 0.5 * b.y)
        );
    }
    path.setAttribute("stroke", color);
    path.setAttribute("stroke-width", width);
    path.setAttribute("fill", "none");
    var linelayer = document.getElementById("linelayer");
    linelayer.appendChild(path);
}

function drawEdge(edge, color, width) {
    var a = document.getElementById(edge[0]).children[0];
    var b = document.getElementById(edge[1]).children[0];
    var aRect = a.getBoundingClientRect();
    var bRect = b.getBoundingClientRect();
    var aMid = {
        "x": window.scrollX + (aRect.left + aRect.right) / 2,
        "y": window.scrollY + aRect.bottom - 1
    };
    var bMid = {
        "x": window.scrollX + (bRect.left + bRect.right) / 2,
        "y": window.scrollY + bRect.top + 1
    };
    var linelayer = document.getElementById("linelayer");
    drawLine(aMid, bMid, color, width);
}

function drawEdges(gemel) {
    var tree = gemel[treeOptionSelected]();
    linelayer.innerHTML = ""; // refresh linelayer
    tree.forEachEdge(function (edge) {
        drawEdge(edge, "#000", 4);
    });
    tree.forEachEdge(function (edge) {
        drawEdge(edge, "#fff", 2);
    });
    linelayer.innerHTML += ""; // force-update linelayer
}

/* HTML */

function selectDigi(mon) {
    selectedDigi.add(mon);
    update();
    return selectedDigi;
}

function deselectDigi(mon) {
    selectedDigi.delete(mon);
    update();
    return selectedDigi;
}

function getProfiles(id) {
    return document.getElementById(id).getElementsByClassName("profiles")[0];
}

function addTapListener(e, f) {
    e.addEventListener("click", f);
    e.addEventListener("touchstart", function () {}); // somehow enables mobile responsiveness (no double tap)
}

/* Initialization */

function initProfile(mon) {
    var profile = document.createElement("div");
        profile.className = "profile";
        profile.id = mon;
        var card = document.createElement("div");
            card.className = "card";
            var portrait = document.createElement("img");
                portrait.className = "portrait";
                portrait.src = "img/mon/0/" + mon + ".png";
                if (mon == "birdramon") {
                    var r = Math.random();
                    if (r < 0.0001) {
                        portrait.src = "img/mon/birdramon.png";
                    }
                }
                portrait.alt = mon;
            card.appendChild(portrait);
            var tribe = document.createElement("img");
                tribe.className = "tribe";
                tribe.src = "img/tribe/" + digi[mon].tribe + ".png";
                tribe.alt = digi[mon].tribe;
            card.appendChild(tribe);
            var moniker = document.createElement("div");
                moniker.className = "moniker";
                moniker.innerHTML = digi[mon].name.replace(/([a-z])([A-Z]+|mon)/g, "$1&shy;$2");
            card.appendChild(moniker);
        profile.appendChild(card);
        var signatures = document.createElement("div");
            signatures.className = "signatures";
            for (var skill of digi[mon].skills) {
                var signature = document.createElement("div");
                    var rival = document.createElement("img");
                        rival.className = "rival";
                        rival.src = "img/tribe/" + skill[0] + ".png";
                        rival.alt = skill[0];
                    signature.appendChild(rival);
                    var effect = document.createElement("span");
                        effect.innerHTML = ["Spt", "ST", "AoE"][skill[1]];
                    signature.appendChild(effect);
                    var tier = document.createElement("span");
                        tier.className = "tier";
                        tier.innerHTML = skill[2] ? ("[" + skill[2] + "]") : "";
                    signature.appendChild(tier);
                signatures.appendChild(signature);
            }
        profile.appendChild(signatures);
        var growlmon = document.createElement("div");
            growlmon.className = "growlmon";
            var anchor = document.createElement("a");
                anchor.href = "http://growlmon.net/digimon/" + mon;
                anchor.target = "_blank";
                anchor.innerHTML = "Growlmon.Net";
            growlmon.appendChild(anchor);
        profile.appendChild(growlmon);
    getProfiles(digi[mon].evol).appendChild(profile);
    // if (digi[mon].evol == "mega") {
    //     new Tree(mon);
    //     if (digi[mon].prev.some(e => digi[e].evol != "mega")) {
    //         document.getElementById("mega").getElementsByClassName("profiles")[0].appendChild(profile);
    //     }
    //     else if (digi[mon].prev.some(e => digi[e].prev.some(a => digi[a].evol != "mega" && a != mon))) {
    //         document.getElementById("mega").getElementsByClassName("profiles")[1].appendChild(profile);
    //     }
    //     else {
    //         document.getElementById("mega").getElementsByClassName("profiles")[2].appendChild(profile);
    //     }
    // }
    // else {
    //     getProfiles(digi[mon].evol).appendChild(profile);
    // }
    addTapListener(card, function () {
        search.value = "";
        selectDigi(this.parentElement.id);
    });
}

function initProfiles() {
    for (var mon in digi) {
        initProfile(mon);
    }
}

function initOptions() {
    var viewOption = document.getElementById("viewOption");
    var treeOption = document.getElementById("treeOption");
    addTapListener(viewOption, function () {
        if (this.classList.contains("selected")) {
            this.classList.remove("selected");
            viewOptionSelected = 0;
        }
        else {
            this.classList.add("selected");
            viewOptionSelected = 1;
        }
        update();
    });
    addTapListener(treeOption, function () {
        if (this.classList.contains("selected")) {
            this.classList.remove("selected");
            treeOptionSelected = "union";
        }
        else {
            this.classList.add("selected");
            treeOptionSelected = "intersection";
        }
        update();
    });
    viewOption.click();
    treeOption.click();
}


function init() {
    blank = document.getElementById("blank");
    for (var evol of document.getElementsByClassName("box-name")) {
        addTapListener(evol, function () {
            selectedDigi.clear();
            for (var profile of getProfiles(this.parentElement.id).children) {
                if (!profile.classList.contains("hidden")) {
                    selectedDigi.add(profile.id);
                }
            }
            update();
        });
    }
    for (var scroller of document.getElementsByClassName("scroller")) {
        scroller.addEventListener("scroll", update);
    }
    window.addEventListener("resize", update);
    for (var child of document.getElementById("filtration").getElementsByTagName("span")) {
        addTapListener(child, function () {
            for (var thumb of document.getElementsByClassName("thumb")) {
                var i = parseInt(this.innerHTML);
                thumb.src = thumb.src.replace(/mon\/\d+/, "mon/" + (i == 2 ? 1 : i));
            }
        });
    }
    initProfiles();
    initSearch();
    // initOptions();
    for (var mon in advent) {
        document.getElementById(mon).classList.add("advent");
    }
}

init();















// var blank;
// var linelayer;

var filter = {
    "query": new Set(),
    "tribe": new Set(),
    "rival": new Set(),
    "effect": new Set()
};

function initSearch() {
    var selection = document.getElementById("selection");
    var filtration = document.getElementById("filtration");
    var enterSearchButton = document.getElementById("enter-search");
    var exitSearchButton = document.getElementById("exit-search");
    var search = document.getElementById("search");
    var switchIds = [
        "tribe-mirage", "tribe-blazing", "tribe-glacier", "tribe-electric", "tribe-earth", "tribe-bright", "tribe-abyss",
        "rival-mirage", "rival-blazing", "rival-glacier", "rival-electric", "rival-earth", "rival-bright", "rival-abyss",
        "effect-aoe", "effect-st", "effect-sup"
    ];

    function enterSearch() {
        selection.classList.add("hidden");
        filtration.classList.remove("hidden");
        search.focus();
    }

    function exitSearch() {
        selection.classList.remove("hidden");
        filtration.classList.add("hidden");
        search.value = "";
        for (var switchId of switchIds) {
            var switchButton = document.getElementById(switchId);
            switchButton.classList.remove("selected");
        }
        filter.query.clear();
        filter.tribe.clear();
        filter.rival.clear();
        filter.effect.clear();
    }

    function parseQuery() {
        var lower = this.value.toLowerCase();
        var parsed = lower.split(/[^a-z]+/);
        filter.query = new Set(parsed);
        filter.query.delete("");
    }

    function toggleSwitch() {
        var splitId = this.id.split("-");
        var key = splitId[0];
        var value = splitId[1];
        if (this.classList.contains("selected")) {
            this.classList.remove("selected");
            filter[key].delete(value);
        }
        else {
            this.classList.add("selected");
            filter[key].add(value);
        }
    }

    addTapListener(blank, enterSearch);
    addTapListener(enterSearchButton, enterSearch);
    addTapListener(exitSearchButton, exitSearch);
    search.addEventListener("input", parseQuery);
    for (var switchId of switchIds) {
        var switchButton = document.getElementById(switchId);
        addTapListener(switchButton, toggleSwitch);
    }
}
