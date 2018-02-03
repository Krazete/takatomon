var mons = Object.keys(digi).sort();
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
    document.getElementById(digi[mon].evol).getElementsByClassName("mons")[0].appendChild(div);
});

function evol(mon) {
    return digi[mon].evol;
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

var input = document.getElementById("in");
var output = document.getElementById("out");
input.addEventListener("touchstart", function () {
    input.focus();
});

function showmon(mon) {
    var div = document.createElement("div");
    div.className = "mon";
    div.addEventListener("click", function (e) {
        input.blur();
        output.innerHTML = "";
        showmon(mon);
        var p = document.createElement("p");
        p.innerHTML = "previous:";
        output.appendChild(p);
        prev(mon).forEach(showmon);
        var p = document.createElement("p");
        p.innerHTML = "next:";
        output.appendChild(p);
        next(mon).forEach(showmon);
    });
    div.addEventListener("touchstart", function (e) {
        input.blur();
        output.innerHTML = "";
        showmon(mon);
        var p = document.createElement("p");
        p.innerHTML = "previous:";
        output.appendChild(p);
        prev(mon).forEach(showmon);
        var p = document.createElement("p");
        p.innerHTML = "next:";
        output.appendChild(p);
        next(mon).forEach(showmon);
    });
    var img = document.createElement("img");
    img.src = "img/" + mon + ".png";
    img.alt = mon;
    div.appendChild(img);
    output.appendChild(div);
}

function autocomplete() {
    output.innerHTML = "";
    var mons = Object.keys(digi);
    mons.forEach(function (mon) {
        if (mon.startsWith(input.value.toLowerCase())) {
            showmon(mon);
        }
    });
}

input.addEventListener("input", autocomplete);

function line(a, b) {
    var aRect = a.getBoundingClientRect();
    var bRect = b.getBoundingClientRect();
    var aMid = {
        "x": (aRect.left + aRect.right) / 2,
        "y": (aRect.top + aRect.bottom) / 2
    };
    var bMid = {
        "x": (bRect.left + bRect.right) / 2,
        "y": (bRect.top + bRect.bottom) / 2
    };
    var linelayer = document.getElementById("linelayer");
    var path = document.createElement("path");
    path.setAttribute("d",
        "M" + aMid.x + "," + aMid.y +
        "C" + aMid.x + "," + bMid.y +
        " " + bMid.x + "," + aMid.y +
        " " + bMid.x + "," + bMid.y
    );
    path.setAttribute("stroke", "black");
    path.setAttribute("stroke-width", "5");
    path.setAttribute("fill", "none");
    linelayer.appendChild(path);
    linelayer.innerHTML += ""; // force update
}
