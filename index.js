/* DATA */

/* Name Collections */

var allDigi = new Set(Object.keys(digi));
var selectedDigi = new Set();

/* Tree Structure */

function Tree(root) {
    this.roots = new Set(); // allow multiple roots for Forest
    this.leaves = new Set();
    this.JSONbranches = new Set(); // store as JSON strings because identical arrays aren't equal
    if (typeof root != "undefined") {
        // pointers for initialization
        var leaves = this.leaves;
        var JSONbranches = this.JSONbranches;
        // initialization
        this.roots.add(root);
        this.leaves.add(root);
        function next(mon) {
            return digi[mon].next;
        }
        function prev(mon) {
            if (typeof(digi[mon].prev) == "undefined") { // memoization
                var prevmons = [];
                for (prevmon in digi) {
                    if (next(prevmon).includes(mon)) {
                        prevmons.push(prevmon);
                    }
                }
                digi[mon].prev = prevmons;
            }
            return digi[mon].prev;
        }
        function init(mon, direction) {
            if (direction < 1) {
                for (var prevmon of prev(mon)) {
                    leaves.add(prevmon);
                    var branch = [prevmon, mon];
                    var JSONbranch = JSON.stringify(branch);
                    if (!JSONbranches.has(JSONbranch)) {
                        JSONbranches.add(JSONbranch);
                        init(prevmon, -1);
                    }
                }
            }
            if (direction > -1) {
                for (var nextmon of next(mon)) {
                    leaves.add(nextmon);
                    var branch = [mon, nextmon];
                    var JSONbranch = JSON.stringify(branch);
                    if (!JSONbranches.has(JSONbranch)) {
                        JSONbranches.add(JSONbranch);
                        init(nextmon, 1);
                    }
                }
            }
        }
        init(root, 0);
    }
}
Tree.prototype.forEachBranch = function (f) {
    for (var JSONbranch of this.JSONbranches) {
        var branch = JSON.parse(JSONbranch);
        f(branch, JSONbranch);
    }
};
function getTree(mon) {
    if (typeof(digi[mon].tree) == "undefined") { // memoization
        digi[mon].tree = new Tree(mon);
    }
    return digi[mon].tree;
}

/* Tree Collection */

function Forest(roots) {
    this.trees = new Set();
    for (root of roots) {
        var tree = getTree(root);
        this.trees.add(tree);
    }
}
Forest.prototype.union = function () {
    var unionTree = new Tree();
    for (var tree of this.trees) {
        for (var root of tree.roots) { // should only have one root
            unionTree.roots.add(root);
        }
        tree.forEachBranch(function (branch, JSONbranch) {
            unionTree.leaves.add(branch[0]);
            unionTree.leaves.add(branch[1]);
            unionTree.JSONbranches.add(JSONbranch);
        });
    }
    return unionTree;
};
Forest.prototype.intersection = function () {
    var intersectionTree = new Tree();
    intersectionTree.leaves = new Set(allDigi);
    for (var tree of this.trees) {
        for (var root of tree.roots) { // should only have one root
            intersectionTree.roots.add(root);
        }
    }
    for (var tree of this.trees) {
        for (var leaf of intersectionTree.leaves) {
            if (!(tree.leaves.has(leaf) || intersectionTree.roots.has(leaf))) {
                intersectionTree.leaves.delete(leaf);
            }
        }
    }
    for (var tree of this.trees) {
        tree.forEachBranch(function (branch, JSONbranch) {
            if (intersectionTree.leaves.has(branch[0]) && intersectionTree.leaves.has(branch[1])) {
                intersectionTree.JSONbranches.add(JSONbranch);
            }
        });
    }
    return intersectionTree;
};

/* Tree Visualization */

function update() {
    if (search.value) {
        return;
    }
    var selection = getTrain("selection");
    selection.innerHTML = "";
    if (selectedDigi.size == 0) {
        for (var mon of allDigi) {
            digi[mon].card.classList.remove("root");
            digi[mon].card.classList.remove("leaf");
            digi[mon].card.classList.remove("hidden");
        }
        linelayer.innerHTML = "";
    }
    else {
        for (var mon of selectedDigi) {
            var clone = digi[mon].card.cloneNode(true);
            clone.className = "card"; // remove leaf and root class
            addTapListener(clone, function () {
                deselectDigi(this.id);
            });
            selection.appendChild(clone);
        }
        var forest = new Forest(selectedDigi);
        var chosenTree = forest[treeOptionSelected]();
        drawTree(chosenTree);
    }
}

function drawTree(tree) {
    drawLeaves(tree);
    drawBranches(tree);
}

function drawLeaves(tree) {
    for (var mon of allDigi) {
        digi[mon].card.classList.remove("root");
        digi[mon].card.classList.remove("leaf");
        digi[mon].card.classList.remove("hidden");
        if (tree.roots.has(mon)) {
            digi[mon].card.classList.add("root");
        }
        else if (tree.leaves.has(mon)) {
            digi[mon].card.classList.add("leaf");
        }
        else if (viewOptionSelected){
            digi[mon].card.classList.add("hidden");
        }
    }
}

function drawLine(a, b, color, width) {
    var path = document.createElement("path");
    path.setAttribute("d",
        "M" + a.x + "," + a.y +
        // "L" + b.x + "," + b.y
        "S" + a.x + "," + (0.75 * a.y + 0.25 * b.y) +
        " " + (0.5 * a.x + 0.5 * b.x) + "," + (0.5 * a.y + 0.5 * b.y) +
        "S" + b.x + "," + (0.25 * a.y + 0.75 * b.y) +
        " " + b.x + "," + b.y
    );
    path.setAttribute("stroke", color);
    path.setAttribute("stroke-width", width);
    path.setAttribute("fill", "none");
    var linelayer = document.getElementById("linelayer");
    linelayer.appendChild(path);
}

function drawBranch(branch, color, width) {
    var a = digi[branch[0]].card.children[0];
    var b = digi[branch[1]].card.children[0];
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

function drawBranches(tree) {
    linelayer.innerHTML = ""; // refresh linelayer
    tree.forEachBranch(function (branch) {
        drawBranch(branch, "#000", 4);
    });
    tree.forEachBranch(function (branch) {
        drawBranch(branch, "#fff", 2);
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
    getTrain(digi[mon].evol).appendChild(card);
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
