var fullOption;
var viewOption;

var allDigi = new Set(Object.keys(digi));
var selectedDigi = new Set();

function getBox(id) {
    return document.getElementById(id).children[1].children[0];
}

function addTapListener(e, f) {
    e.addEventListener("click", f);
    e.addEventListener("touchstart", function () {}); // dunno why this works, but enables responsiveness without unwanted clicks
}

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

function update() {
    var selection = getBox("selection");
    selection.innerHTML = "";
    if (selectedDigi.size == 0) {
        allDigi.forEach(function (mon) {
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
        else if (!fullOption){
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

function getTree(mon) {
    var tree = newTree();
    tree.roots.add(mon);
    getBranchesJSON(tree.branchesJSON, mon, 0);
    tree.forEachBranch(function (branch, branchJSON) {
        tree.leaves.add(branch[0]);
        tree.leaves.add(branch[1]);
    });
    return tree;
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
        });
    });
    return intersectTree;
}

function chosen(trees) {
    if (viewOption == "any") {
        return union(trees);
    }
    else if (viewOption == "all") {
        return intersect(trees);
    }
}











function next(mon) {
    return digi[mon].dvol;
}

function prev(mon) {
    var prevmons = [];
    for (prevmon in digi) {
        if (next(prevmon).includes(mon)) {
            prevmons.push(prevmon);
        }
    }
    return prevmons;
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

function reset() {
    var mons = Object.keys(digi);
    mons.forEach(function (mon) {
        digi[mon].element.classList.remove("leaf");
        digi[mon].element.classList.remove("hidden");
    });
}

function hide() {
    var mons = Object.keys(digi);
    mons.forEach(function (mon) {
        if (!selection.includes(mon)) {
            digi[mon].element.classList.add("hidden");
        }
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
        boxWrapper.addEventListener("scroll", function (e) {
            update();
        });
    });

    var mons = Object.keys(digi).sort(); // sort is redundant, but just in case
    mons.forEach(function (mon) {
        var div = document.createElement("div");
        div.className = "mon";
        div.id = mon;
            var img = document.createElement("img");
            img.className = "thumb";
            img.src = "mon/" + mon + ".png";
        div.appendChild(img);
            var a = document.createElement("a");
            a.className = "alt";
            a.href = "http://growlmon.net/digimon/" + mon;
            a.target = "_blank";
            a.innerHTML = mon;
        div.appendChild(a);
        addTapListener(div, function (mouse) {
            selectDigi(this.id);
        });
        digi[mon].element = div;
        getBox(digi[mon].evol).appendChild(div);
    });

    var full = document.getElementById("full");
    var any = document.getElementById("any");
    var all = document.getElementById("all");
    addTapListener(full, function (e) {
        full.classList.add("selected");
        any.classList.remove("selected");
        all.classList.remove("selected");
        fullOption = true;
        update();
    });
    addTapListener(any, function (e) {
        full.classList.remove("selected");
        any.classList.add("selected");
        all.classList.remove("selected");
        fullOption = false;
        viewOption = "any";
        update();
    });
    addTapListener(all, function (e) {
        full.classList.remove("selected");
        any.classList.remove("selected");
        all.classList.add("selected");
        fullOption = false;
        viewOption = "all";
        update();
    });
    any.click();
}

init();
