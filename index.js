/* DATA */

/* Indices */
var allDigi = new Set(Object.keys(digi));
var selectedDigi = new Set();

/* Digivolution Tree Navigator */
function next(mon) {
    return digi[mon].dvol;
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

/* Tree Data Structure */

function newTree() {
    return {
        "roots": new Set(),
        "leaves": new Set(),
        "branchesJSON": new Set(), // because an array isn't equal to itself
        "forEachBranch": function (f) {
            this.branchesJSON.forEach(function (branchJSON) { // TODO: maybe split branch variable into leaf0 and leaf1
                var branch = JSON.parse(branchJSON);
                f(branch, branchJSON); // TODO: remove branchJSON parameter if unneeded
            });
        }
    };
}

function getBranchesJSON(branches, mon, direction) { // must pass branches to avoid infinite recursion
    if (direction < 1) {
        prev(mon).forEach(function (prevmon) {
            var branch = [prevmon, mon];
            var branchJSON = JSON.stringify(branch);
            if (!branches.has(branchJSON)) {
                branches.add(branchJSON);
                getBranchesJSON(branches, prevmon, -1);
            }
        });
    }
    if (direction > -1) {
        next(mon).forEach(function (nextmon) {
            var branch = [mon, nextmon];
            var branchJSON = JSON.stringify(branch);
            if (!branches.has(branchJSON)) {
                branches.add(branchJSON);
                getBranchesJSON(branches, nextmon, 1);
            }
        });
    }
}

function memoize(obj, init) {
    if (typeof(obj) == "undefined") {
        init(obj);
    }
    return obj;
}

function getTree(mon) {
    if (typeof(digi[mon].tree) == "undefined") { // memoization
        var tree = newTree();
        tree.roots.add(mon);
        getBranchesJSON(tree.branchesJSON, mon, 0);
        tree.forEachBranch(function (branch, branchJSON) {
            tree.leaves.add(branch[0]);
            tree.leaves.add(branch[1]);
        });
        digi[mon].tree = tree;
    }
    return digi[mon].tree;
}

function union(trees) {
    var unionTree = newTree();
    trees.forEach(function (tree) {
        tree.roots.forEach(function (root) {
            unionTree.roots.add(root);
        });
        tree.forEachBranch(function (branch, branchJSON) {
            unionTree.leaves.add(branch[0]);
            unionTree.leaves.add(branch[1]);
            unionTree.branchesJSON.add(branchJSON);
        });
    });
    return unionTree;
}

function intersect(trees) {
    var intersectTree = newTree();
    intersectTree.leaves = new Set(allDigi);
    trees.forEach(function (tree) {
        tree.roots.forEach(function (root) {
            intersectTree.roots.add(root);
        });
        intersectTree.leaves.forEach(function (leaf) {
            if (!tree.leaves.has(leaf)) {
                intersectTree.leaves.delete(leaf);
            }
        });
    });
    // TODO: intermediate digimon??
    trees.forEach(function (tree) {
        tree.forEachBranch(function (branch, branchJSON) {
            if (intersectTree.leaves.has(branch[0]) && intersectTree.leaves.has(branch[1])) {
                intersectTree.branchesJSON.add(branchJSON);
            }
            if (intersectTree.roots.has(branch[0]) && intersectTree.leaves.has(branch[1])) { // TODO: combine with the above conditional
                intersectTree.branchesJSON.add(branchJSON);
            }
            if (intersectTree.leaves.has(branch[0]) && intersectTree.roots.has(branch[1])) { // TODO: combine with the above conditional
                intersectTree.branchesJSON.add(branchJSON);
            }
        });
    });
    return intersectTree;
}










/* Tree Visualization */

function update() {
    if (search.value) {
        return;
    }
    var selection = getBox("selection");
    selection.innerHTML = "";
    if (selectedDigi.size == 0) {
        allDigi.forEach(function (mon) {
            digi[mon].element.classList.remove("root");
            digi[mon].element.classList.remove("leaf");
            digi[mon].element.classList.remove("hidden");
        });
        linelayer.innerHTML = "";
    }
    else {
        var trees = [];
        selectedDigi.forEach(function (mon) {
            var clone = digi[mon].element.cloneNode(true);
            clone.className = "mon";
            addTapListener(clone, function () {
                deselectDigi(this.id);
            });
            selection.appendChild(clone);

            var tree = getTree(mon);
            trees.push(tree);
        });
        var chosenTree = chosen(trees);
        drawTree(chosenTree);
    }
}

function drawTree(tree) {
    drawLeaves(tree);
    drawBranches(tree);
}

function drawLeaves(tree) {
    allDigi.forEach(function (mon) { // reset elements
        digi[mon].element.classList.remove("root");
        digi[mon].element.classList.remove("leaf");
        digi[mon].element.classList.remove("hidden");
        if (tree.roots.has(mon)) {
            digi[mon].element.classList.add("root");
        }
        else if (tree.leaves.has(mon)) {
            digi[mon].element.classList.add("leaf");
        }
        else if (viewOptionSelected){
            digi[mon].element.classList.add("hidden");
        }
    });
}

function drawBranches(tree) {
    linelayer.innerHTML = ""; // refresh linelayer
    tree.forEachBranch(function (branch) {
        drawBranch(branch, "#000", 4);
    });
    tree.forEachBranch(function (branch) {
        drawBranch(branch, "#fff", 2);
    });
    linelayer.innerHTML += ""; // force update linelayer
}

function line(a, b, color, width) {
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

function drawBranch(branch, p, k) {
    var a = digi[branch[0]].element;
    var b = digi[branch[1]].element;
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
    line(aMid, bMid, p, k);
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

function getBox(id) {
    return document.getElementById(id).getElementsByClassName("box")[0];
}

function addTapListener(e, f) {
    e.addEventListener("click", f);
    e.addEventListener("touchstart", function () {}); // dunno why this works, but enables responsiveness without unwanted clicks
}

function hide() {
    var mons = Object.keys(digi);
    mons.forEach(function (mon) {
        if (!selection.includes(mon)) {
            digi[mon].element.classList.add("hidden");
        }
    });
}

function chosen(trees) {
    if (treeOptionSelected == 0) {
        return union(trees);
    }
    else if (treeOptionSelected == 1) {
        return intersect(trees);
    }
}

/* Initialization */

function initMons(AWKN) {
    var mons = Object.keys(digi); // sorting is done in growlmon.js
    mons.forEach(function (mon) {
        var div = document.createElement("div");
        div.className = "mon";
        div.id = mon;
        var img = document.createElement("img");
            img.className = "thumb";
            img.src = "img/awkn" + AWKN + "/" + mon + ".png";
            div.appendChild(img);
        var tribe = document.createElement("img");
            tribe.className = "tribe";
            tribe.src = "img/tribe/" + digi[mon].tribe + ".png";
            tribe.alt = digi[mon].tribe;
            div.appendChild(tribe);
        var nametag = document.createElement("div");
            nametag.className = "nametag";
            nametag.innerHTML = mon; // instead of digi[mon].name due to space
            div.appendChild(nametag);
        var skills = document.createElement("div");
            skills.className = "skills";
            digi[mon].skills.forEach(function (skill) {
                if (skill.length > 0) {
                    var dna = document.createElement("div");
                        var skilltribe = document.createElement("img");
                            skilltribe.className = "icon";
                            skilltribe.src = "img/tribe/" + skill[0] + ".png";
                            skilltribe.alt = skill[0];
                            dna.appendChild(skilltribe);
                        var skilltype = document.createElement("span");
                            skilltype.innerHTML = ["Support", "Single", "AoE"][skill[1]];
                            dna.appendChild(skilltype);
                            skills.appendChild(dna);
                        var tier = document.createElement("span");
                            tier.className = "tier";
                            tier.innerHTML = skill[2] ? ("[" + skill[2] + "]") : "";
                            dna.appendChild(tier);
                }
            });
            div.appendChild(skills);
        addTapListener(div, function (e) {
            search.value = "";
            selectDigi(this.id);
        });
        digi[mon].element = div;
        getBox(digi[mon].evol).appendChild(div);
    });
}

function initOptions() {
    var viewOption = document.getElementById("viewOption");
    var treeOption = document.getElementById("treeOption");
    addTapListener(viewOption, function (e) {
        if (viewOptionSelected) {
            viewOption.classList.remove("selected");
            viewOptionSelected = 0;
        }
        else {
            viewOption.classList.add("selected");
            viewOptionSelected = 1;
        }
        update();
    });
    addTapListener(treeOption, function (e) {
        if (treeOptionSelected) {
            treeOption.classList.remove("selected");
            treeOptionSelected = 0;
        }
        else {
            treeOption.classList.add("selected");
            treeOptionSelected = 1;
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
            allDigi.forEach(function (mon) {
                digi[mon].element.classList.add("hidden");
                if (digi[mon].element.innerText.toLowerCase().includes(search.value)) {
                    digi[mon].element.classList.remove("hidden");
                }
            });
        }
        else {
            update();
        }
    });
}

function initGrowlmon() {
    var growlmon = document.getElementById("growlmon-net");
    var net = "https://growlmon.net/digimon/"
    addTapListener(growlmon, function (e) {
        selectedDigi.forEach(function (mon) {
            open(net + mon);
        });
    });
}

function init() {
    Array.from(document.getElementsByClassName("evol")).forEach(function (evol) {
        addTapListener(evol, function (e) {
            selectedDigi.clear();
            Array.from(getBox(evol.parentElement.id).children).forEach(function (e) {
                if (!e.classList.contains("hidden")) {
                    selectedDigi.add(e.id);
                }
            });
            update();
        });
    });

    Array.from(document.getElementsByClassName("box-wrapper")).forEach(function (boxWrapper) {
        boxWrapper.addEventListener("scroll", update);
    });
    window.addEventListener("resize", update);

    Array.from(document.getElementById("toolbar").getElementsByTagName("span")).forEach(function (child, i) {
        addTapListener(child, function () {
            Array.from(document.getElementsByClassName("thumb")).forEach(function (thumb) {
                thumb.src = thumb.src.replace(/awkn\d+/, "awkn" + (i == 2 ? 1 : i));
            });
        });
    });

    initMons(0);
    initOptions();
    initSearch();
    initGrowlmon();
}

init();
