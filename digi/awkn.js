var allDigi = new Set(Object.keys(digi));
var selectedDigi = new Set();

function getBox(id) {
    return document.getElementById(id).children[1].children[0];
}

function addTapListener(e, f) {
    e.addEventListener("click", f);
    e.addEventListener("touchstart", f);
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
    selectedDigi.forEach(function (mon) {
        var clone = digi[mon].element.cloneNode(true);
        clone.className = "mon";
        addTapListener(clone, function () {
            deselectDigi(this.id);
        })
        selection.appendChild(clone);
    });

    allDigi.forEach(function (mon) {
        if (!selectedDigi.has(mon)) {
            digi[mon].element.classList.add("locked");
        }
    });
}

function getTree(mon) {
    var tree = new Set();
    next(mon).forEach(function (nextmon) {
        tree.add([mon, nextmon]);
    });
}

function intersection(t, u) { // TODO
    var c = new Set();
    a.forEach(function (mon) {
        if (b.has(mon)) {
            c.add(mon);
        }
    });
    return c;
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
        "S" + a.x + "," + (a.y + 16) +
        " " + (a.x + b.x) / 2 + "," + (a.y + 16) +
        "S" + b.x + "," + (a.y + 16) +
        " " + b.x + "," + b.y
    );
    path.setAttribute("stroke", color);
    path.setAttribute("stroke-width", width);
    path.setAttribute("fill", "none");
    var linelayer = document.getElementById("linelayer");
    linelayer.appendChild(path);
}

function branch(monA, monB, p, k) {
    var a = digi[monA].element;
    var b = digi[monB].element;
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
    linelayer.innerHTML += ""; // force update
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

var selection = [];
var visited = [];
function tree(mon, direction) {
    if (direction == 0) {
        visited = [];
        var linelayer = document.getElementById("linelayer");
        linelayer.innerHTML = "";
    }
    if (direction < 1) {
        var prevmons = prev(mon);
        for (var i = 0; i < prevmons.length; i++) {
            var prevmon = prevmons[i];
            var pair = prevmon + "+" + mon;
            if (!visited.includes(pair)) {
                tree(prevmon, -1)
            }
            visited.push(pair);
            selection.push(prevmon);
            selection.push(mon);
        }
    }
    if (direction > -1) {
        var nextmons = next(mon);
        for (var i = 0; i < nextmons.length; i++) {
            var nextmon = nextmons[i];
            var pair = mon + "+" + nextmon;
            if (!visited.includes(pair)) {
                tree(nextmon, 1);
            }
            visited.push(pair);
            selection.push(mon);
            selection.push(nextmon);
        }
    }
    if (direction == 0) {
        reset();
        hide();
        visited.forEach(function (pair) {
            var mons = pair.split("+");
            branch(mons[0], mons[1], "#000", 4);
        });
        visited.forEach(function (pair) {
            var mons = pair.split("+");
            branch(mons[0], mons[1], "#fff", 2);
        });
    }
}


function init() {
    var any = document.getElementById("any");
    var all = document.getElementById("all");
    addTapListener(any, function (e) {
        any.classList.add("selected");
        all.classList.remove("selected");
    });
    addTapListener(all, function (e) {
        any.classList.remove("selected");
        all.classList.add("selected");
    });
    any.click();

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
}

init();
