/* this script relies on digi.js, tree.js, and advent.js */

/* Globals */

var blank;
var linelayer;

var selectedDigi = new Set();
var gemel = new Gemel();
var gemelCore = gemel.intersection();

var searchMode;
var cancelSearch;
var filter = { // global because initSetting needs filter.special
    "query": new Set(),
    "tribe": new Set(),
    "rival": new Set(),
    "effect": new Set(),
    "special": new Set()
};
var setting = {
    "tree": 0,
    "sort": 0,
    "preview": 0,
    "size": 0,
    "awkn": 0,
    "skill": 0
};

/* Helpers */

function addTapListener(e, f) {
    e.addEventListener("click", f);
    e.addEventListener("touchstart", function () {}); // somehow enables mobile responsiveness (no double tap)
}

function getProfileGroup(id) {
    var box = document.getElementById(id);
    var profileGroup = box.getElementsByClassName("profile-group")[0];
    return profileGroup;
}

function isAdvent(mon) {
    if (mon in advent) {
        var now = Date.now(); // TODO: check if this is the best method to use
        if (advent[mon][0] <= now && now <= advent[mon][1]) {
            return true;
        }
    }
    return false;
}

/* Tree Visualization */

function update() {
    gemel = new Gemel(selectedDigi);
    gemelCore = gemel.intersection();
    updateClones(); // TODO: maybe put updateLines as a clone portrait onload callback
    updateProfiles();
    if (setting.sort == 2) {
        untangleProfiles();
    }
    else {
        updateLines();
    }
}

function updateClones() {
    var selection = getProfileGroup("selection");
    selection.innerHTML = "";
    if (selectedDigi.size) {
        function deselectClone() {
            selectedDigi.delete(this.parentNode.id.slice(0, -6));
            update();
        }
        for (var mon of selectedDigi) {
            var profile = document.getElementById(mon);
            var clone = profile.cloneNode(true);
            clone.classList.remove("root");
            clone.classList.remove("core-node");
            clone.classList.remove("node");
            clone.classList.remove("hidden");
            clone.classList.remove("preview");
            clone.id = mon + "-clone";
            var card = clone.getElementsByClassName("card")[0];
            addTapListener(card, deselectClone);
            selection.appendChild(clone);
        }
    }
    else {
        selection.appendChild(blank);
    }
}

function updateProfiles() {
    for (var mon in digi) {
        document.getElementById(mon).classList.remove("root");
        document.getElementById(mon).classList.remove("core-node");
        document.getElementById(mon).classList.remove("node");
        document.getElementById(mon).classList.remove("hidden");
        document.getElementById(mon).classList.remove("preview");
        if (selectedDigi.size) {
            if (gemel.roots.has(mon)) {
                document.getElementById(mon).classList.add("root");
            }
            else if (gemelCore.nodes.has(mon)) {
                document.getElementById(mon).classList.add("core-node");
            }
            else if (setting.tree && gemel.nodes.has(mon)) {
                document.getElementById(mon).classList.add("node");
            }
            else {
                document.getElementById(mon).classList.add("hidden");
            }
        }
    }
}

function untangleProfiles() { // TODO: improve this algorithm
    var visited = new Set();

    function dfs(mon, d, repeat) {
        if (!visited.has(mon) || repeat) {
            visited.add(mon);
            if (d <= 0) {
                for (var prevmon of prev(mon)) {
                    var profile = document.getElementById(prevmon);
                    if (!profile.classList.contains("hidden")) {
                        dfs(prevmon, -1, false);
                    }
                }
            }
            if (d >= 0) {
                for (var nextmon of next(mon)) {
                    var profile = document.getElementById(nextmon);
                    if (!profile.classList.contains("hidden")) {
                        dfs(nextmon, 1, false);
                    }
                }
            }
        }
    }

    for (var mon of selectedDigi) {
        dfs(mon, 0, true);
    }
    for (var mon in digi) {
        visited.add(mon);
    }
    sortProfiles(visited);
}

function sortProfiles(sortedDigi) {
    for (var mon of sortedDigi) {
        var profileGroup = getProfileGroup(digi[mon].evol);
        var profile = document.getElementById(mon);
        profileGroup.appendChild(profile);
    }
    updateLines();
}

function updateLines() { // cannot update individually because of line borders
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
        var dx = sign * [32, 40, 24][setting.size];
        var dy = [10, 12, 8][setting.size];
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

/* Initialization */

function init() {
    blank = document.getElementById("blank");
    linelayer = document.getElementById("linelayer");
    initProfiles();
    initBoxLabels();
    initFiltration();
    initVisualization();
    initLineListeners();
    initCookies();
    update();
}

function initProfiles() {
    function newProfile(mon) {
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
        return profile;
    }

    function selectCard() {
        selectedDigi.add(this.parentNode.id);
        if (searchMode) {
            cancelSearch();
        }
        else {
            update();
        }
    }

    for (var mon in digi) { // skip sorting step, growlmon.js alphabetizes digi.js in preprocessing
        var profile = newProfile(mon);
        var card = profile.getElementsByClassName("card")[0];
        if (isAdvent(mon)) {
            profile.classList.add("advent"); // TODO: add a timer to expire advents
        }
        addTapListener(card, selectCard);
        getProfileGroup(digi[mon].evol).appendChild(profile);
        // below is for a triple-stacked mega row, which was abandoned
        // if (digi[mon].evol == "mega") {
        //     var mega = document.getElementById("mega");
        //     var profileGroups = mega.getElementsByClassName("profile-group");
        //     if (prev(mon).some(prevmon => digi[prevmon].evol != "mega")) {
        //         profileGroups[0].appendChild(profile);
        //     }
        //     else if (prev(mon).some(prevmon => prev(prevmon).some(prevprevmon => digi[prevprevmon].evol != "mega" && prevprevmon != mon))) {
        //         profileGroups[1].appendChild(profile);
        //     }
        //     else {
        //         profileGroups[2].appendChild(profile);
        //     }
        // }
        // else {
        //     getProfileGroup(digi[mon].evol).appendChild(profile);
        // }
    }
}

function initBoxLabels() {
    var boxLabels = document.getElementsByClassName("box-label");

    function selectBox() {
        var box = this.parentNode.parentNode;
        var profiles = box.getElementsByClassName("profile");
        selectedDigi.clear();
        for (var profile of profiles) {
            if (!profile.classList.contains("hidden")) {
                selectedDigi.add(profile.id);
            }
        }
        if (searchMode) {
            cancelSearch();
        }
        else {
            update();
        }
    }

    for (var boxLabel of boxLabels) {
        addTapListener(boxLabel, selectBox);
    }
}

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
        searchMode = 1;
        updateLines();
        updateSearch();
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
        searchMode = 0;
        update();
    }

    function parseQuery() {
        var lower = this.value.toLowerCase();
        var parsed = lower.split(/[^a-z]+/);
        // var parsed = lower.split(/[^a-z\[*\]]+/); // for tier search, excluded for confusingness
        filter.query = new Set(parsed);
        filter.query.delete("");
        updateSearch();
    }

    function enterBlur(e) {
        if (e.keyCode == 13 || e.key == "Enter" || e.code == "Enter") {
            search.blur();
        }
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
        updateSearch();
    }

    addTapListener(blank, enterSearchMode);
    addTapListener(enterSearch, enterSearchMode);
    addTapListener(exitSearch, exitSearchMode);
    search.addEventListener("input", parseQuery);
    search.addEventListener("keydown", enterBlur);
    for (var s of switches) {
        addTapListener(s, flipSwitch);
    }
    cancelSearch = exitSearchMode;
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
    var okAdvent = !filter.special.has("advent") || isAdvent(mon);
    var okSpecial = okTree && okDNA2 && okV2 && okAdvent;
    return okQuery && okTribe && okSkill && okSpecial;
}

function updateSearch() {
    for (var mon in digi) {
        document.getElementById(mon).classList.remove("hidden");
        if (!okFilter(mon)) {
            document.getElementById(mon).classList.add("hidden");
        }
    }
}

function initVisualization() {
    var visualization = document.getElementById("visualization");
    var slideGroups = visualization.getElementsByClassName("slide-group");
    var settingFunction = {
        "tree": function () {
            update();
            if (searchMode) {
                updateSearch();
            }
        },
        "sort": function () {
            if (setting.sort == 2) {
                untangleProfiles();
            }
            else {
                var basis = setting.sort ? byTribe : byAlphabet;
                var keys = Object.keys(digi);
                keys.sort(basis);
                sortProfiles(keys);
            }
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
        "preview": function () {
            for (var mon in digi) {
                var profile = document.getElementById(mon);
                var card = profile.getElementsByClassName("card")[0];
                if (setting.preview) {
                    card.addEventListener("mouseover", previewGemel);
                    card.addEventListener("mouseout", deviewGemel);
                }
                else {
                    card.removeEventListener("mouseover", previewGemel);
                    card.removeEventListener("mouseout", deviewGemel);
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

    function byAlphabet(a, b) {
        return a < b ? -1 : a > b ? 1 : 0;
    }

    function byTribe(a, b) {
        var tribes = ["mirage", "blazing", "glacier", "electric", "earth", "bright", "abyss"];
        var tribeComparison = tribes.indexOf(digi[a].tribe) - tribes.indexOf(digi[b].tribe);
        return tribeComparison ? tribeComparison : byAlphabet(a, b);
    }

    function previewGemel() {
        if (!searchMode) {
            var tree = new Gemel(this.parentNode.id);
            for (var node of tree.nodes) {
                document.getElementById(node).classList.add("preview");
            }
            tree.forEachEdge(function (edge, JSONedge) {
                var profile0 = document.getElementById(edge[0]);
                var profile1 = document.getElementById(edge[1]);
                if (!profile0.classList.contains("hidden") && !profile1.classList.contains("hidden")) {
                    drawEdge(edge, "#000", 4);
                }
            });
            linelayer.innerHTML += "";
        }
    }

    function deviewGemel() {
        if (!searchMode) {
            updateProfiles();
            updateLines();
        }
    }

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

function initLineListeners() {
    var scrollers = document.getElementsByClassName("scroller");
    for (var scroller of scrollers) {
        scroller.addEventListener("scroll", updateLines);
    }
    window.addEventListener("resize", updateLines);
}

function initCookies() { // TODO: this
    var mockCookies = {
        "tree": 1,
        "sort": 2,
        "preview": 1,
        "size": 2,
        "awkn": 4,
        "skill": 0
    };
    for (var id in mockCookies) {
        var slideBox = document.getElementById(id);
        for (var i = 0; i < mockCookies[id]; i++) {
            slideBox.click();
        }
    }
}

window.addEventListener("DOMContentLoaded", init);
