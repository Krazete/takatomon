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
            digi[mon].element.classList.remove("locked");
            digi[mon].element.classList.remove("hidden");
        });
    }
    else {
        var trees = [];
        selectedDigi.forEach(function (mon) {
            var clone = digi[mon].element.cloneNode(true);
            clone.className = "mon";
            addTapListener(clone, function () {
                deselectDigi(this.id);
            })
            selection.appendChild(clone);

            var tree = new Set();
            growTree(tree, mon, 0);
            trees.push(tree);
        });

        allDigi.forEach(function (mon) {
            digi[mon].element.classList.remove("locked");
            digi[mon].element.classList.add("hidden");
        });

        linelayer.innerHTML = "";
        var chosenTree = chosen(trees);
        chosenTree.forEach(function (branchJSON) {
            var branch = JSON.parse(branchJSON);
            digi[branch[0]].element.classList.remove("hidden");
            digi[branch[1]].element.classList.remove("hidden");
        });
        chosenTree.forEach(function (branchJSON) {
            var branch = JSON.parse(branchJSON);
            drawBranch(branch, "#000", 4);
        });
        chosenTree.forEach(function (branchJSON) {
            var branch = JSON.parse(branchJSON);
            drawBranch(branch, "#fff", 2);
        });
        linelayer.innerHTML += ""; // force linelayer to update
    }
}

function growTree(tree, mon, direction) {
    if (direction < 1) {
        prev(mon).forEach(function (prevmon) {
            var branch = [prevmon, mon];
            var branchJSON = JSON.stringify(branch);
            if (!tree.has(branchJSON)) {
                tree.add(branchJSON);
                growTree(tree, prevmon, -1);
            }
        });
    }
    if (direction > -1) {
        next(mon).forEach(function (nextmon) {
            var branch = [mon, nextmon];
            var branchJSON = JSON.stringify(branch);
            if (!tree.has(branchJSON)) {
                tree.add(branchJSON);
                growTree(tree, nextmon, 1);
            }
        });
    }
    return tree;
}

function union(trees) {
    var unionTree = new Set();
    trees.forEach(function (tree) {
        tree.forEach(function (branch) {
            unionTree.add(branch);
        });
    });
    return unionTree;
}

function intersect(trees) {
    var intersectTree = new Set();

    var intersectLeaves = allDigi;
    trees.forEach(function (tree) {
        var leaves = new Set();
        tree.forEach(function (branchJSON) {
            var branch = JSON.parse(branchJSON);
            if (intersectLeaves.has(branch[0])) {
                leaves.add(branch[0]);
            }
            if (intersectLeaves.has(branch[1])) {
                leaves.add(branch[1]);
            }
        });
        intersectLeaves = leaves;
    });
    console.log(intersectLeaves);
    trees.forEach(function (tree) {
        tree.forEach(function (branchJSON) {
            var branch = JSON.parse(branchJSON);
            if (intersectLeaves.has(branch[0]) && intersectLeaves.has(branch[1])) {
                intersectTree.add(branchJSON);
            }
        });
    });

    var p = [intersectTree];
    selectedDigi.forEach(function (mon) {
        p.push(growTree(new Set(), mon, 1));
    })
    return union(p);
}

function chosen(trees) {
    var any = document.getElementById("any");
    var all = document.getElementById("all");
    if (any.classList.contains("selected")) {
        return union(trees);
    }
    if (all.classList.contains("selected")) {
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
        "L" + b.x + "," + b.y
        // "S" + a.x + "," + (a.y + 16) +
        // " " + (a.x + b.x) / 2 + "," + (a.y + 16) +
        // "S" + b.x + "," + (a.y + 16) +
        // " " + b.x + "," + b.y
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
    a.classList.add("locked");
    b.classList.add("locked");
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
        digi[mon].element.classList.remove("locked");
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
        addTapListener(evol, function () {
            selectedDigi.clear();
            Array.from(getBox(evol.parentElement.id).children).forEach(function (e) {
                if (!e.classList.contains("hidden")) {
                    selectedDigi.add(e.id);
                }
            });
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

    var any = document.getElementById("any");
    var all = document.getElementById("all");
    addTapListener(any, function (e) {
        any.classList.add("selected");
        all.classList.remove("selected");
        update();
    });
    addTapListener(all, function (e) {
        any.classList.remove("selected");
        all.classList.add("selected");
        update();
    });
    any.click();
}

init();
