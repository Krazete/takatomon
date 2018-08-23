/* NOTE: read "digi" as "nodeset" and "mon" as "node" */

/* DATA */

/* Name Collections */

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
    var selection = getTrain("selection");
    selection.innerHTML = "";
    if (selectedDigi.size) {
        for (var mon of selectedDigi) {
            var clone = digi[mon].profile.cloneNode(true);
            clone.className = "profile"; // remove node and root class
            var card = clone.getElementsByClassName("card")[0];
            addTapListener(card, function () {
                deselectDigi(this.parentNode.id);
            });
            selection.appendChild(clone);
        }
        var gemel = new Gemel(selectedDigi); // TODO: don't call this every single time, store it somewhere globally
        drawTree(gemel);
    }
    else {
        for (var mon in digi) {
            digi[mon].profile.classList.remove("root");
            digi[mon].profile.classList.remove("node");
            digi[mon].profile.classList.remove("hidden");
            if (filterIncludes(mon)) {
                digi[mon].profile.classList.add("hidden");
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
    drawLeaves(gemel);
    drawEdges(gemel);
}

function drawLeaves(gemel) {
    var tree = gemel[treeOptionSelected]();
    for (var mon in digi) {
        digi[mon].profile.classList.remove("root");
        digi[mon].profile.classList.remove("node");
        digi[mon].profile.classList.remove("hidden");
        if (gemel.roots.has(mon)) {
            digi[mon].profile.classList.add("node");
            digi[mon].profile.classList.add("root");
        }
        else if (tree.nodes.has(mon)) {
            digi[mon].profile.classList.add("node");
        }
        else if (viewOptionSelected){
            digi[mon].profile.classList.add("hidden");
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
    var a = digi[edge[0]].profile.children[0];
    var b = digi[edge[1]].profile.children[0];
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

function getTrain(id) {
    return document.getElementById(id).getElementsByClassName("train")[0];
}

function addTapListener(e, f) {
    e.addEventListener("click", f);
    e.addEventListener("touchstart", function () {}); // dunno why this works, but enables responsiveness without unwanted clicks
}

/* Initialization */

function initCard(mon) {
    var profile = document.createElement("div");
        profile.className = "profile";
        profile.id = mon;
        var card = document.createElement("div");
            card.className = "card";
            var portrait = document.createElement("img");
                portrait.className = "portrait";
                portrait.src = "img/mon/0/" + mon + ".png";
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
    // if (digi[mon].evol == "mega") {
    //     new Tree(mon);
    //     if (digi[mon].prev.some(e => digi[e].evol != "mega")) {
    //         document.getElementById("mega").getElementsByClassName("train")[0].appendChild(profile);
    //     }
    //     else if (digi[mon].prev.some(e => digi[e].prev.some(a => digi[a].evol != "mega" && a != mon))) {
    //         document.getElementById("mega").getElementsByClassName("train")[1].appendChild(profile);
    //     }
    //     else {
    //         document.getElementById("mega").getElementsByClassName("train")[2].appendChild(profile);
    //     }
    // }
    // else {
    //     getTrain(digi[mon].evol).appendChild(profile);
    // }
    getTrain(digi[mon].evol).appendChild(profile);
    addTapListener(card, function () {
        search.value = "";
        selectDigi(this.parentElement.id);
    });
    digi[mon].profile = profile;
}

function initCards() {
    for (var mon in digi) {
        initCard(mon);
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

function initSearch() {
    var search = document.getElementById("search");
    search.addEventListener("input", function (e) {
        search.value = search.value.toLowerCase().replace(/\s/g, "");
        if (search.value != "") {
            linelayer.innerHTML = "";
            for (var mon in digi) {
                digi[mon].profile.classList.add("hidden");
                if (digi[mon].profile.innerText.toLowerCase().includes(search.value)) {
                    digi[mon].profile.classList.remove("hidden");
                }
            }
        }
        else {
            update();
        }
    });
}

function init() {
    for (var evol of document.getElementsByClassName("evol")) {
        addTapListener(evol, function () {
            selectedDigi.clear();
            for (var profile of getTrain(this.parentElement.id).children) {
                if (!profile.classList.contains("hidden")) {
                    selectedDigi.add(profile.id);
                }
            }
            update();
        });
    }
    for (var track of document.getElementsByClassName("track")) {
        track.addEventListener("scroll", update);
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
    initCards();
    initSearch();
    initFilters();
    initOptions();
    for (var mon in advent) {
        digi[mon].profile.classList.add("advent");
    }
}

init();

function initFilters() {
    var ids = [
        "event-ongoing",
        "tribe-mirage", "tribe-blazing", "tribe-glacier", "tribe-electric", "tribe-earth", "tribe-bright", "tribe-abyss",
        "rival-mirage", "rival-blazing", "rival-glacier", "rival-electric", "rival-earth", "rival-bright", "rival-abyss",
        "effect-aoe", "effect-st", "effect-sup"
    ];
    for (var id of ids) {
        var button = document.getElementById(id);
        addTapListener(button, function () {
            var idPart = this.id.split("-");
            if (this.classList.contains("selected")) {
                filter[idPart[0]].delete(idPart[1]);
                this.classList.remove("selected");
            }
            else {
                filter[idPart[0]].add(idPart[1]);
                this.classList.add("selected");
            }
            update();
        });
    }
}
