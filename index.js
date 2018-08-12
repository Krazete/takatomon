/* NOTE: read "digi" as "nodeset" and "mon" as "node" */

/* DATA */

/* Name Collections */

var selectedDigi = new Set();

/* Tree Visualization */

function update() {
    if (search.value) {
        return;
    }
    var selection = getTrain("selection");
    selection.innerHTML = "";
    if (selectedDigi.size) {
        for (var mon of selectedDigi) {
            var clone = digi[mon].card.cloneNode(true);
            clone.className = "card"; // remove node and root class
            addTapListener(clone, function () {
                deselectDigi(this.id);
            });
            selection.appendChild(clone);
        }
        var gemel = new Gemel(selectedDigi); // TODO: don't call this every single time, store it somewhere globally
        drawTree(gemel);
    }
    else {
        for (var mon in digi) {
            digi[mon].card.classList.remove("root");
            digi[mon].card.classList.remove("node");
            digi[mon].card.classList.remove("hidden");
        }
        linelayer.innerHTML = "";
    }
}

function drawTree(gemel) {
    drawLeaves(gemel);
    drawEdges(gemel);
}

function drawLeaves(gemel) {
    var tree = gemel[treeOptionSelected]();
    for (var mon in digi) {
        digi[mon].card.classList.remove("root");
        digi[mon].card.classList.remove("node");
        digi[mon].card.classList.remove("hidden");
        if (gemel.roots.has(mon)) {
            digi[mon].card.classList.add("node");
            digi[mon].card.classList.add("root");
        }
        else if (tree.nodes.has(mon)) {
            digi[mon].card.classList.add("node");
        }
        else if (viewOptionSelected){
            digi[mon].card.classList.add("hidden");
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
    var a = digi[edge[0]].card.children[0];
    var b = digi[edge[1]].card.children[0];
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

var viewOptionSelected;
var treeOptionSelected;

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
    var card = document.createElement("div");
        card.className = "card";
        card.id = mon;
        var profile = document.createElement("div");
            profile.className = "profile";
            var portrait = document.createElement("img");
                portrait.className = "portrait";
                portrait.src = "img/awkn0/" + mon + ".png";
            profile.appendChild(portrait);
            var tribe = document.createElement("img");
                tribe.className = "tribe";
                tribe.src = "img/tribe/" + digi[mon].tribe + ".png";
                tribe.alt = digi[mon].tribe;
            profile.appendChild(tribe);
            var moniker = document.createElement("div");
                moniker.className = "moniker";
                moniker.innerHTML = digi[mon].name;
            profile.appendChild(moniker);
        card.appendChild(profile);
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
        card.appendChild(signatures);
    if (digi[mon].evol == "mega") {
        new Tree(mon);
        if (digi[mon].prev.some(e => digi[e].evol != "mega")) { // TODO: fix
            document.getElementById("mega").getElementsByClassName("train")[0].appendChild(card);
        }
        else if (digi[mon].prev.some(e => digi[e].prev.some(a => digi[a].evol != "mega" && a != mon))) {
            document.getElementById("mega").getElementsByClassName("train")[1].appendChild(card);
        }
        else {
            document.getElementById("mega").getElementsByClassName("train")[2].appendChild(card);
        }
    }
    else {
        getTrain(digi[mon].evol).appendChild(card);
    }
    addTapListener(profile, function () {
        search.value = "";
        selectDigi(this.parentElement.id);
    });
    digi[mon].card = card;
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
            for (var mon of allDigi) {
                digi[mon].card.classList.add("hidden");
                if (digi[mon].card.innerText.toLowerCase().includes(search.value)) {
                    digi[mon].card.classList.remove("hidden");
                }
            }
        }
        else {
            update();
        }
    });
}

function initGrowlmon() {
    var growlmon = document.getElementById("growlmon-net");
    var net = "https://growlmon.net/digimon/"
    addTapListener(growlmon, function () {
        for (var mon of selectedDigi) {
            open(net + mon);
        }
    });
}

function init() {
    for (var evol of document.getElementsByClassName("evol")) {
        addTapListener(evol, function () {
            selectedDigi.clear();
            for (var card of getTrain(this.parentElement.id).children) {
                if (!card.classList.contains("hidden")) {
                    selectedDigi.add(card.id);
                }
            }
            update();
        });
    }
    for (var track of document.getElementsByClassName("track")) {
        track.addEventListener("scroll", update);
    }
    window.addEventListener("resize", update);
    for (var child of document.getElementById("toolbar").getElementsByTagName("span")) {
        addTapListener(child, function () {
            for (var thumb of document.getElementsByClassName("thumb")) {
                var i = parseInt(this.innerHTML);
                thumb.src = thumb.src.replace(/awkn\d+/, "awkn" + (i == 2 ? 1 : i));
            }
        });
    }
    initCards();
    initOptions();
    initSearch();
    initGrowlmon();
    for (var mon in advent) {
        digi[mon].card.classList.add("advent");
    }
}

init();
