/* this script relies on digi.js and tree.js */

/* HTML Elements */

var blank;
var linelayer;

/* Data Storage */

var selectedDigi = new Set();
var gemel;
var gemelCore;

var searchMode = false;

/* Gemel Visualization */

function update() {
    gemel = new Gemel(selectedDigi);
    gemelCore = gemel.intersection();
    updateClones();
    updateProfiles();
    updateLines();
}

function updateClones() {
    var selection = getProfileGroup("selection");
    selection.innerHTML = "";
    if (selectedDigi.size) {
        for (var mon of selectedDigi) {
            var profile = document.getElementById(mon);
            var clone = profile.cloneNode(true);
            clone.classList.remove("root");
            clone.classList.remove("node");
            clone.classList.remove("hidden");
            clone.id = mon + "-clone";
            var card = clone.getElementsByClassName("card")[0];
            addTapListener(card, function () {
                deselectDigi(this.parentNode.id.slice(0, -6));
            });
            selection.appendChild(clone);
        }
    }
    else {
        selection.appendChild(blank);
    }
}

function okFilter(mon) {
    var okQuery = !filter.query.size || Array.from(filter.query).every(function (term) {
        return mon.includes(term);
        // below allows tier search, excluded for confusingness
        // var okName = mon.includes(term);
        // var okTier = term.match(/[\[*\]]/) && digi[mon].skills.some(function (skill) {
        //     if (typeof skill[2] != "undefined") {
        //         var tier = "[" + skill[2].toLowerCase() + "]";
        //         return tier.includes(term);
        //     }
        //     return false;
        // });
        // return okName || okTier;
    });
    var okTribe = !filter.tribe.size || filter.tribe.has(digi[mon].tribe);
    var okSkill = digi[mon].skills.some(function (skill) {
        var okRival = !filter.rival.size || filter.rival.has(skill[0]);
        var effect = ["support", "st", "aoe"][skill[1]];
        var okEffect = !filter.effect.size || filter.effect.has(effect);
        return okRival && okEffect;
    });
    var okTree = !filter.special.has("tree") || [gemelCore, gemel][setting.tree].nodes.has(mon);
    var okDNA2 = !filter.special.has("dna") || digi[mon].skills.length > 1;
    var okV2 = !filter.special.has("v2") || digi[mon].v2;
    var okEvent = !filter.special.has("event") || mon in advent; // TODO: change this after changing advent.js and such
    var okSpecial = okTree && okDNA2 && okV2 && okEvent;
    return okQuery && okTribe && okSkill && okSpecial;
}

function updateProfiles() {
    if (setting.sort == 2) {
        // untangle digimon
        // TODO: this
    }
    var tree = setting.tree ? gemel : gemelCore;
    for (var mon in digi) {
        document.getElementById(mon).classList.remove("root");
        document.getElementById(mon).classList.remove("node");
        document.getElementById(mon).classList.remove("hidden");
        if (selectedDigi.size) {
            if (tree.roots.has(mon)) {
                document.getElementById(mon).classList.add("root");
            }
            else if (tree.nodes.has(mon)) {
                document.getElementById(mon).classList.add("node");
            }
            else if (!searchMode) {
                document.getElementById(mon).classList.add("hidden");
            }
        }
        if (!okFilter(mon)) { // TODO: add "in search mode" condition
            document.getElementById(mon).classList.add("hidden");
        }
    }
}

function updateLines() { // cannot update individually because of line border
    linelayer.innerHTML = ""; // refresh linelayer
    if (!searchMode) {
        if (setting.tree) {
            gemel.forEachEdge(function (edge, JSONedge) {
                if (!gemelCore.JSONedges.has(JSONedge)) {
                    drawEdge(edge, "#000", 4);
                }
            });
            gemel.forEachEdge(function (edge, JSONedge) {
                if (!gemelCore.JSONedges.has(JSONedge)) {
                    drawEdge(edge, "#aaa", 2);
                }
            });
        }
        gemelCore.forEachEdge(function (edge, JSONedge) {
            drawEdge(edge, "#000", 4);
        });
        gemelCore.forEachEdge(function (edge, JSONedge) {
            drawEdge(edge, "#fff", 2);
        });
        linelayer.innerHTML += ""; // force-update linelayer
    }
}

function drawEdge(edge, color, width) {
    var a = getPoint(edge[0], "bottom");
    var b = getPoint(edge[1], "top");
    drawLine(a, b, color, width);
    // below is side-trimming, likely redundant (browser probably covers it)
    // var tooLeft = a.x < window.scrollX && b.x < window.scrollX;
    // var tooRight = a.x > (window.scrollX + window.innerWidth) && b.x > (window.scrollX > window).innerWidth;
    // if (!tooLeft && !tooRight) {
    //     drawLine(a, b, color, width);
    // }
}

function getPoint(mon, side) {
    var profile = document.getElementById(mon);
    var card = profile.getElementsByClassName("card")[0];
    var rect = card.getBoundingClientRect();
    var dy = {
        "top": 1,
        "bottom": -1
    };
    var point = {
        "x": window.scrollX + (rect.left + rect.right) / 2,
        "y": window.scrollY + rect[side] + dy[side]
    };
    return point;
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
    linelayer.appendChild(path);
}

/* HTML */

function selectDigi(mon) {
    selectedDigi.add(mon);
    if (searchMode) {
        document.getElementById("exit-search").click(); // TODO: not this
    }
    else {
        update();
    }
}

function deselectDigi(mon) {
    selectedDigi.delete(mon);
    update();
}

function getProfileGroup(id) {
    var box = document.getElementById(id);
    var profileGroup = box.getElementsByClassName("profile-group")[0];
    return profileGroup;
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
                portrait.alt = mon + "+0";
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
        var signatureGroup = document.createElement("div");
            signatureGroup.className = "signature-group";
            for (var skill of digi[mon].skills) {
                var signature = document.createElement("div");
                    var rival = document.createElement("img");
                        rival.className = "rival";
                        rival.src = "img/tribe/" + skill[0] + ".png";
                        rival.alt = skill[0];
                    signature.appendChild(rival);
                    var effect = document.createElement("span");
                        effect.innerHTML = ["Support", "ST", "AoE"][skill[1]];
                    signature.appendChild(effect);
                    var tier = document.createElement("span");
                        tier.className = "tier";
                        tier.innerHTML = skill[2] ? ("[" + skill[2] + "]") : "";
                    signature.appendChild(tier);
                signatureGroup.appendChild(signature);
            }
        profile.appendChild(signatureGroup);
        var growlmon = document.createElement("div");
            growlmon.className = "growlmon";
            var anchor = document.createElement("a");
                anchor.href = "http://growlmon.net/digimon/" + mon;
                anchor.target = "_blank";
                anchor.innerHTML = "Growlmon.Net";
            growlmon.appendChild(anchor);
        profile.appendChild(growlmon);
    getProfileGroup(digi[mon].evol).appendChild(profile);
    // if (digi[mon].evol == "mega") {
    //     var mega = document.getElementById("mega");
    //     var profileGroups = mega.getElementsByClassName("profile-group");
    //     new Tree(mon);
    //     if (digi[mon].prev.some(e => digi[e].evol != "mega")) {
    //         profileGroups[0].appendChild(profile);
    //     }
    //     else if (digi[mon].prev.some(e => digi[e].prev.some(a => digi[a].evol != "mega" && a != mon))) {
    //         profileGroups[1].appendChild(profile);
    //     }
    //     else {
    //         profileGroups[2].appendChild(profile);
    //     }
    // }
    // else {
    //     getProfileGroup(digi[mon].evol).appendChild(profile);
    // }
    addTapListener(card, function () {
        search.value = "";
        selectDigi(this.parentElement.id);
    });
}

function initProfiles() {
    // skip sorting step, growlmon.js already alphebetized digi.js
    for (var mon in digi) {
        initProfile(mon);
    }
}

function init() {
    blank = document.getElementById("blank");
    linelayer = document.getElementById("linelayer");
    for (var evol of document.getElementsByClassName("box-name")) {
        addTapListener(evol, function () {
            selectedDigi.clear();
            for (var profile of getProfileGroup(this.parentElement.id).children) {
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
    initFiltration();
    initVisualization();
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
    "effect": new Set(),
    "special": new Set()
};

function initFiltration() {
    var selection = document.getElementById("selection");
    var filtration = document.getElementById("filtration");
    var enterSearch = document.getElementById("enter-search");
    var exitSearch = document.getElementById("exit-search");
    var search = document.getElementById("search");
    var switches = filtration.getElementsByClassName("switch");

    function enterSearchMode() {
        selection.classList.add("hidden");
        filtration.classList.remove("hidden");
        search.focus();
        searchMode = true;
        update();
    }

    function exitSearchMode() {
        selection.classList.remove("hidden");
        filtration.classList.add("hidden");
        search.value = "";
        for (var s of switches) {
            s.classList.remove("selected");
        }
        filter.query.clear();
        filter.tribe.clear();
        filter.rival.clear();
        filter.effect.clear();
        filter.special.clear();
        searchMode = false;
        update();
    }

    function parseQuery() {
        var lower = this.value.toLowerCase();
        var parsed = lower.split(/[^a-z]+/);
        // var parsed = lower.split(/[^a-z\[*\]]+/); // for tier search, excluded for confusingness
        filter.query = new Set(parsed);
        filter.query.delete("");
        update();
    }

    function flipSwitch() {
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
        update();
    }

    addTapListener(blank, enterSearchMode);
    addTapListener(enterSearch, enterSearchMode);
    addTapListener(exitSearch, exitSearchMode);
    search.addEventListener("input", parseQuery);
    for (var s of switches) {
        addTapListener(s, flipSwitch);
    }
}

var setting = {
    "tree": 0,
    "sort": 0,
    "size": 0,
    "skill": 0,
    "awkn": 0
};

function byAlphabet(a, b) {
    return a < b ? -1 : a > b ? 1 : 0;
}

function byTribe(a, b) {
    var tribes = ["mirage", "blazing", "glacier", "electric", "earth", "bright", "abyss"];
    var tribeComparison = tribes.indexOf(digi[a].tribe) - tribes.indexOf(digi[b].tribe);
    return tribeComparison ? tribeComparison : byAlphabet(a, b);
}

function untangledDigi() {
    var visited = new Set();
    function dfs(mon, d) {
        if (!visited.has(mon)) {
            visited.add(mon);
            if (d <= 0) {
                for (var prevmon of prev(mon)) {
                    if (!document.getElementById(prevmon).classList.contains("hidden")) {
                        dfs(prevmon, -1);
                    }
                }
            }
            if (d >= 0) {
                for (var nextmon of next(mon)) {
                    if (!document.getElementById(nextmon).classList.contains("hidden")) {
                        dfs(nextmon, 1);
                    }
                }
            }
        }
    }
    for (var mon of selectedDigi) {
        dfs(mon, 0);
    }
    for (var mon in digi) {
        visited.add(mon);
    }
    return Array.from(visited);
}

function initVisualization() {
    var visualization = document.getElementById("visualization");
    var slideGroups = visualization.getElementsByClassName("slide-group");
    var settingFunction = {
        "tree": update,
        "sort": function () { // TODO: always sort by "is a gemel node" first
            var keys = Object.keys(digi);
            if (setting.sort == 0) {
                keys.sort(byAlphabet);
            }
            else if (setting.sort == 1) {
                keys.sort(byTribe);
            }
            else if (setting.sort == 2) {
                keys = untangledDigi();
            }
            for (var mon of keys) {
                var profileGroup = getProfileGroup(digi[mon].evol);
                var profile = document.getElementById(mon);
                profileGroup.appendChild(profile);
            }
            updateLines();
        },
        "size": function () {
            var profiles = document.getElementsByClassName("profile");
            var size = ["", "large", "small"][setting.size];
            for (var profile of profiles) {
                profile.classList.remove("large");
                profile.classList.remove("small");
                if (setting.size) {
                    profile.classList.add(size);
                }
            }
            updateLines();
        },
        "awkn": function () {
            var portraits = document.getElementsByClassName("portrait");
            var awkn = [0, 1, 3, 4, 5][setting.awkn];
            for (var portrait of portraits) {
                var mon = portrait.parentNode.parentNode.id;
                if (awkn != 5 || mon != "blank" && !mon.endsWith("-clone") && digi[mon].v2) {
                    portrait.src = portrait.src.replace(/mon\/[01345]/, "mon/" + awkn);
                    portrait.alt = portrait.alt.replace(/\+[01345]/, "+" + awkn);
                }
            }
        },
        "skill": function () {
            var signatureGroups = document.getElementsByClassName("signature-group");
            for (var signatureGroup of signatureGroups) {
                if (setting.skill) {
                    signatureGroup.style.display = "block";
                }
                else {
                    signatureGroup.removeAttribute("style");
                }
            }
            updateLines();
        }
    };

    function advanceSlide() {
        var slides = this.getElementsByClassName("slide");
        var i = 0;
        for (var slide of slides) {
            i++;
            if (!slide.classList.contains("hidden")) {
                slide.classList.add("hidden");
                break;
            }
        }
        i %= slides.length;
        slides[i].classList.remove("hidden");
        setting[this.id] = i;
        settingFunction[this.id]();
    }

    for (var slideGroup of slideGroups) {
        addTapListener(slideGroup, advanceSlide);
    }
}
