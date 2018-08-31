/* this script relies on digi.js, tree.js, and advent.js */

/* Globals */

var lastUpdate = new Date("08-30-2018 00:00:00 GMT+0800");

var blank;
var linelayer;
var linecontext;

var selectedDigi = new Set();
var gemel = new Gemel();
var gemelCore = gemel.intersection();

var searchMode;
var cancelSearch;
var filters = { // global because initProfile and initSettings needs filters.special
    "query": new Set(),
    "tribe": new Set(),
    "rival": new Set(),
    "effect": new Set(),
    "special": new Set()
};
var settings = {
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

function isAdvent(mon, now) {
    if (mon in advent) {
        var start = advent[mon][0] - 43200000; // show advents half a day ahead of schedule
        var end = advent[mon][1];
        return start <= now && now <= end;
    }
    return false;
}

/* Filtration Updater */

function updateSearch() {
    for (var mon in digi) {
        var profile = document.getElementById(mon);
        profile.classList.remove("hidden");
        if (!okFilters(mon)) {
            profile.classList.add("hidden");
        }
    }
}

function okFilters(mon) {
    var okQuery = !filters.query.size || Array.from(filters.query).every(function (term) {
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
    var okTribe = !filters.tribe.size || filters.tribe.has(digi[mon].tribe);
    var okSkill = digi[mon].skills.some(function (skill) {
        var okRival = !filters.rival.size || filters.rival.has(skill[0]);
        var effect = ["support", "st", "aoe"][skill[1]];
        var okEffect = !filters.effect.size || filters.effect.has(effect);
        return okRival && okEffect;
    });
    var okTree = !filters.special.has("tree") || [gemelCore, gemel][settings.tree].nodes.has(mon);
    var okDNA2 = !filters.special.has("dna") || digi[mon].skills.length > 1;
    var okV2 = !filters.special.has("v2") || digi[mon].v2;
    var okAdvent = !filters.special.has("advent") || isAdvent(mon, Date.now());
    var okSpecial = okTree && okDNA2 && okV2 && okAdvent;
    return okQuery && okTribe && okSkill && okSpecial;
}

/* Tree Visualization */

function update() {
    gemel = new Gemel(selectedDigi);
    gemelCore = gemel.intersection();
    updateClones(); // wanted to call updateLines on portrait load, but that creates new problems
    updateProfiles();
    if (settings.sort == 2) {
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
            else if (settings.tree && gemel.nodes.has(mon)) {
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
            var gem = [gemelCore, gemel][settings.tree];
            visited.add(mon);
            if (d <= 0) {
                for (var prevmon of prev(mon)) {
                    var profile = document.getElementById(prevmon);
                    if (gem.nodes.has(prevmon)) {
                        dfs(prevmon, -1, false);
                    }
                }
            }
            if (d >= 0) {
                for (var nextmon of next(mon)) {
                    var profile = document.getElementById(nextmon);
                    if (gem.nodes.has(nextmon)) {
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
    linecontext.clearRect(0, 0, linelayer.width, linelayer.height);
    if (!searchMode) {
        linelayer.width = 2 * window.innerWidth;
        linelayer.height = 2 * document.body.getBoundingClientRect().height; // body is taller than window
        linecontext.scale(2, 2);
        if (settings.tree) {
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
    }
}

function drawEdge(edge, color, width) {
    var a = getPoint(edge[0], "bottom");
    var b = getPoint(edge[1], "top");
    drawLine(a, b, color, width);
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
    linecontext.beginPath();
    linecontext.moveTo(a.x, a.y);
    if (a.y < b.y) {
        linecontext.quadraticCurveTo(
            a.x, (0.75 * a.y + 0.25 * b.y),
            0.5 * a.x + 0.5 * b.x, 0.5 * a.y + 0.5 * b.y
        );
        linecontext.quadraticCurveTo(
            b.x, (0.25 * a.y + 0.75 * b.y),
            b.x, b.y
        );
    }
    else {
        var sign = b.x - a.x >= 0 ? 1 : -1;
        var dx = sign * [32, 40, 24][settings.size];
        var dy = [10, 12, 8][settings.size];
        linecontext.bezierCurveTo(
            a.x, a.y + dy,
            a.x + dx, a.y + dy,
            0.5 * a.x + 0.5 * b.x, 0.5 * a.y + 0.5 * b.y
        );
        linecontext.bezierCurveTo(
            b.x - dx, b.y - dy,
            b.x, b.y - dy,
            b.x, b.y
        );
    }
    linecontext.strokeStyle = color;
    linecontext.lineWidth = width;
    linecontext.stroke();
    linecontext.closePath();
}

/* Initialization */

function init() {
    blank = document.getElementById("blank");
    linelayer = document.getElementById("linelayer");
    linecontext = linelayer.getContext("2d");
    initProfiles();
    initBoxLabels();
    initFiltration();
    initVisualization();
    initLineListeners();
    initFooter();
    updateAdvent();
    initLocalStorage(); // called last in case localStorage is bugged
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
        filters.query.clear();
        filters.tribe.clear();
        filters.rival.clear();
        filters.effect.clear();
        filters.special.clear();
        searchMode = 0;
        update();
    }

    function parseQuery() {
        var lower = this.value.toLowerCase();
        var parsed = lower.split(/[^a-z]+/);
        // var parsed = lower.split(/[^a-z\[*\]]+/); // for tier search, excluded for confusingness
        filters.query = new Set(parsed);
        filters.query.delete("");
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
            filters[key].delete(value);
        }
        else {
            this.classList.add("selected");
            filters[key].add(value);
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

function initVisualization() {
    var visualization = document.getElementById("visualization");
    var slideGroups = visualization.getElementsByClassName("slide-group");
    var settingsFunction = {
        "tree": function () {
            update();
            if (searchMode) {
                updateSearch();
            }
        },
        "sort": function () {
            if (settings.sort == 2) {
                untangleProfiles();
            }
            else {
                var basis = settings.sort ? byTribe : byAlphabet;
                var keys = Object.keys(digi);
                keys.sort(basis);
                sortProfiles(keys);
            }
        },
        "size": function () {
            var profiles = document.getElementsByClassName("profile");
            var size = ["", "large", "small"][settings.size];
            for (var profile of profiles) {
                profile.classList.remove("large");
                profile.classList.remove("small");
                if (settings.size) {
                    profile.classList.add(size);
                }
            }
            updateLines();
        },
        "awkn": function () {
            var portraits = document.getElementsByClassName("portrait");
            var awkn = [0, 1, 3, 4, 5][settings.awkn];
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
                if (settings.preview) {
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
                if (settings.skill) {
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
        settings[this.id] = i;
        settingsFunction[this.id]();
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

function initFooter() {
    var about = document.getElementById("about");
    var qa = document.getElementById("qa");
    var calculate = document.getElementById("calculate");
    var close = document.getElementById("close");
    var timestamp = document.getElementById("timestamp");
    var closeFoot = document.getElementById("foot-close");
    var aboutFoot = document.getElementById("foot-about");
    var qaFoot = document.getElementById("foot-qa");
    var calculateFoot = document.getElementById("foot-calculate");

    function initTimestamp() {
        var months = [
            "January", "February", "March", "April", "May", "June",
            "July", "August", "September", "October", "November", "December"
        ];
        var month = months[lastUpdate.getMonth()];
        var date = lastUpdate.getDate();
        var year = lastUpdate.getFullYear();
        timestamp.innerHTML = month + " " + date + ", " + year;
    }

    function isRelated(mon0, mon1) {
        var monTree0 = new Gemel(mon0);
        var monTree1 = new Gemel(mon1);
        return monTree0.nodes.has(mon1) || monTree1.nodes.has(mon0);
    }

    function costPlugins() {
        var plugins = [
            {
                "champion": [8, 3, 0, 0],
                "ultimate": [24, 20, 7, 6],
                "mega": [0, 0, 20, 17]
            },
            {
                "champion": [12, 5, 0, 0],
                "ultimate": [36, 30, 11, 9],
                "mega": [0, 0, 30, 26]
            },
            {
                "champion": [16, 6, 0, 0],
                "ultimate": [48, 40, 14, 12],
                "mega": [0, 0, 40, 34]
            },
            {
                "champion": [24, 9, 0, 0],
                "ultimate": [72, 60, 21, 18],
                "mega": [0, 0, 60, 51]
            },
            {
                "champion": [24, 9, 0, 0],
                "ultimate": [72, 60, 21, 18],
                "mega": [0, 0, 60, 51]
            },
            {
                "mega": [0, 0, 100, 85]
            }
        ];

        var gem = [gemelCore, gemel][settings.tree];
        var evols = ["in-training-i", "in-training-ii", "rookie", "champion", "ultimate", "mega"];
        var youngestIndex = 6;
        var oldestIndex = -1;
        var youngestMon = "";
        var oldestMon = "";
        var oldestMega = "";

        for (var root of gem.roots) {
            var evol = digi[root].evol;
            var evolIndex = evols.indexOf(evol);
            if (evolIndex < youngestIndex) {
                youngestIndex = evolIndex;
                youngestMon = root;
            }
            if (evolIndex > oldestIndex) {
                oldestIndex = evolIndex;
                oldestMon = root;
            }
            if (evol == "mega") {
                if (oldestMega == "") {
                    oldestMega = root;
                }
                else if (oldestMega != root) {
                    var oldestMegaTree = new Gemel(oldestMega);
                    if (oldestMegaTree.nodes.has(root)) {
                        var rootTree = new Gemel(root);
                        if (rootTree.nodes.size > oldestMegaTree.nodes.size) {
                            oldestMega = root;
                        }
                    }
                    else {
                        calculate.innerHTML = "Please narrow your selection to eliminate conflicting megas.";
                        return true;
                    }
                }
            }
        }
        var selectedEvols = evols.slice(youngestIndex + 1, oldestIndex + 1);
        console.log(selectedEvols);
        var selectedMegas = oldestMega == "" ? [] : [oldestMega];
        for (var mega of selectedMegas) {
            for (var prevmon of prev(mega)) {
                if (gem.nodes.has(prevmon) && !selectedMegas.includes(prevmon) && digi[prevmon].evol == "mega") {
                    selectedMegas.push(prevmon);
                }
            }
        }
        console.log(selectedMegas);
        if (selectedEvols.length == 0 && selectedMegas.length < 2) {
            calculate.innerHTML = "Please selected at least two Digimon.";
            return true;
        }

        var selectedTribe = {
            "in-training-i": "",
            "in-training-ii": "",
            "rookie": "",
            "champion": "",
            "ultimate": ""
        };
        for (var node of gem.nodes) {
            var evol = digi[node].evol;
            if (evol != "mega" && selectedEvols.includes(evol)) {
                var tribe = digi[node].tribe;
                if (selectedTribe[evol] == "") {
                    selectedTribe[evol] = tribe;
                }
                else if (selectedTribe[evol] != tribe) {
                    calculate.innerHTML = "Please narrow your selection to eliminate conflicting tribes.";
                    return true;
                }
            }
        }

        var selectedPlugins = {
            "mirage": [0, 0, 0, 0],
            "blazing": [0, 0, 0, 0],
            "glacier": [0, 0, 0, 0],
            "electric": [0, 0, 0, 0],
            "earth": [0, 0, 0, 0],
            "bright": [0, 0, 0, 0],
            "abyss": [0, 0, 0, 0]
        };
        var pluginCosts = plugins[settings.awkn];
        for (var evol of selectedEvols) {
            if (evol != "mega" && evol in pluginCosts) {
                for (var i = 0; i < 4; i++) {
                    selectedPlugins[selectedTribe[evol]][i] += pluginCosts[evol][i];
                }
            }
        }
        for (var mega of selectedMegas) {
            for (var i = 0; i < 4; i++) {
                selectedPlugins[digi[mega].tribe][i] += pluginCosts["mega"][i];
            }
        }

        calculate.innerHTML = "This route (" + (digi[youngestMon].name) + " → " + (digi[oldestMega == "" ? oldestMon : oldestMega].name) + ") at awakening +" + settings.awkn + " costs<br>";
        for (var evol in selectedPlugins) {
            for (var i = 0; i < 4; i++) {
                if (selectedPlugins[evol][i]) {
                    calculate.innerHTML += selectedPlugins[evol][i] + " " + evol + " " + (i + 1) + ".0 plugins,<br>";
                }
            }
        }
        calculate.innerHTML += "and maybe some other stuff (this thing only calculates plugins, and it's inaccurate for multiple megas).";
    }

    initTimestamp();
    addTapListener(aboutFoot, function () {
        about.classList.remove("hidden");
        qa.classList.add("hidden");
        calculate.classList.add("hidden");
        close.classList.remove("hidden");
        updateLines();
    });
    addTapListener(qaFoot, function () {
        about.classList.add("hidden");
        qa.classList.remove("hidden");
        calculate.classList.add("hidden");
        close.classList.remove("hidden");
        updateLines();
    });
    addTapListener(calculateFoot, function () {
        costPlugins();
        about.classList.add("hidden");
        qa.classList.add("hidden");
        calculate.classList.remove("hidden");
        close.classList.remove("hidden");
        updateLines();
    });
    addTapListener(closeFoot, function () {
        about.classList.add("hidden");
        qa.classList.add("hidden");
        calculate.classList.add("hidden");
        close.classList.add("hidden");
        updateLines();
    });
}

function updateAdvent() {
    var now = Date.now();
    for (var mon in advent) {
        var profile = document.getElementById(mon);
        if (isAdvent(mon, now)) {
            profile.classList.add("advent");
            if (filters.special.has("advent")) {
                profile.classList.remove("hidden");
            }
        }
        else {
            profile.classList.remove("advent");
            if (filters.special.has("advent")) {
                profile.classList.add("hidden");
            }
        }
    }
    setTimeout(function () { // check every minute
        requestAnimationFrame(updateAdvent);
    }, 60000);
}

function initLocalStorage() {
    function loadSettings() {
        return {
            "tree": window.localStorage.getItem("tree"),
            "sort": window.localStorage.getItem("sort"),
            "preview": window.localStorage.getItem("preview"),
            "size": window.localStorage.getItem("size"),
            "awkn": window.localStorage.getItem("awkn"),
            "skill": window.localStorage.getItem("skill")
        };
    }

    function saveSettings() {
        window.localStorage.setItem("tree", settings.tree);
        window.localStorage.setItem("sort", settings.sort);
        window.localStorage.setItem("preview", settings.preview);
        window.localStorage.setItem("size", settings.size);
        window.localStorage.setItem("awkn", settings.awkn);
        window.localStorage.setItem("skill", settings.skill);
    }

    var storedSettings = loadSettings();
    for (var id in window.localStorage) {
        var slideBox = document.getElementById(id);
        for (var i = 0; i < storedSettings[id]; i++) {
            slideBox.click();
        }
    }
    window.addEventListener("beforeunload", saveSettings);
}

window.addEventListener("DOMContentLoaded", init);
