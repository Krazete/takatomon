/* this script relies on digi.js, tree.js, and advent.js */

/* Globals */

var blank;
var linelayer;
var linecontext;

var selectedDigi = new Set();
var gemel = new Gemel();
var gemelCore = gemel.intersection();

var fragCount = load("fragCount", {});
var planner = load("planner", []);
var styleFragments, newPlan;

var searchMode;
var filters = { // only global because of advent
    "query": new Set(),
    "tribe": new Set(),
    "rival": new Set(),
    "effect": new Set(),
    "special": new Set() // NOTE: used in updateAdvent
};
var exitSearchMode;
var updateSearchResults;

var settings = {
    "tree": 0,
    "sort": load("sort", 0),
    "preview": load("preview", 0),
    "frag": load("frag", 0),
    "awkn": load("awkn", 0),
    "size": load("size", 0),
    "lang": load("lang", 0),
    "skill": load("skill", 0)
};
var setSlide, updateAdvent;

/* Helpers */

function addTapListener(e, f) {
    e.addEventListener("click", f);
    e.addEventListener("touchstart", function () {}); // somehow enables mobile responsiveness (no double tap)
}

function getProfileGroup(id) {
    var section = document.getElementById(id);
    var profileGroup = section.getElementsByClassName("profile-group")[0];
    return profileGroup;
}

function hide(element) {
    element.classList.add("hidden");
}

function show(element) {
    element.classList.remove("hidden");
}

function save(key, value) {
    try {
        var valueJSON = JSON.stringify(value);
        window.localStorage.setItem(key, valueJSON);
    }
    catch (e) {
        console.log(e);
    }
}

function addUnloadListener(f) {
    function fNull() {
        f();
        return null;
    }
    window.addEventListener("beforeunload", fNull);
    window.addEventListener("pagehide", fNull);
    document.addEventListener("visibilitychange", fNull);
}

function load(key, defaultValue) {
    try {
        var valueJSON = window.localStorage.getItem(key);
        var value = JSON.parse(valueJSON);
        if (value != null) {
            return value;
        }
    }
    catch (e) {
        console.log(e);
    }
    return defaultValue;
}

/* Tree Visualization */

function update() {
    var profileGroups = Array.from(document.getElementsByClassName("profile-group"));

    gemel = new Gemel(selectedDigi);
    gemelCore = gemel.intersection();
    updateClones(); // wanted to call updateLines on portrait load, but that creates new problems
    updateProfiles();
    for (var profileGroup of profileGroups) { // for safari
        var rect = profileGroup.getBoundingClientRect();
        if (rect.width < window.innerWidth) {
            profileGroup.parentNode.scrollLeft = 0;
        }
    }
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

    function deselectProfile() {
        selectedDigi.delete(this.parentNode.id.slice(0, -6));
        update();
    }
    if (selectedDigi.size) {
        for (var mon of selectedDigi) {
            var profile = document.getElementById(mon);
            var clone = profile.cloneNode(true);
            clone.classList.remove("root");
            clone.classList.remove("core-node");
            clone.classList.remove("node");
            clone.classList.remove("preview");
            show(clone);
            clone.id = mon + "-clone";
            var card = clone.getElementsByClassName("card")[0];
            addTapListener(card, deselectProfile);
            selection.appendChild(clone);
        }
    }
    else {
        selection.appendChild(blank);
    }
}

function updateProfiles() {
    for (var mon in digi) {
        var profile = document.getElementById(mon);
        profile.classList.remove("root");
        profile.classList.remove("core-node");
        profile.classList.remove("node");
        show(profile);
        if (selectedDigi.size) {
            if (gemel.roots.has(parseInt(mon))) {
                profile.classList.add("root");
            }
            else if (gemelCore.nodes.has(parseInt(mon))) {
                profile.classList.add("core-node");
            }
            else if (settings.tree && gemel.nodes.has(parseInt(mon))) { // TODO: find a better way to handle these IDs
                profile.classList.add("node");
            }
            else {
                hide(profile);
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
                    if (gem.nodes.has(parseInt(prevmon))) {
                        dfs(prevmon, -1, false);
                    }
                }
            }
            if (d >= 0) {
                for (var nextmon of next(mon)) {
                    if (gem.nodes.has(parseInt(nextmon))) {
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
    var scale = 2;
    linecontext.clearRect(0, 0, linelayer.width, linelayer.height);
    if (!searchMode) {
        linelayer.width = scale * window.innerWidth;
        linelayer.height = scale * document.body.getBoundingClientRect().height; // body is taller than window
        linecontext.scale(scale, scale);
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
    initAdvent();
    initEvolLabels();
    initFiltration();
    initVisualization();
    initPlanner();
    initFooter();
    initLineListeners();
    initParameter();
}

function initProfiles() {
    function newProfile(mon) {
        var profile = document.createElement("div");
            profile.className = "profile";
            profile.id = mon;
            if (digi[mon].fragments) {
                var fragCounter = document.createElement("input");
                    fragCounter.className = "frag-counter";
                    fragCounter.type = "number";
                    fragCounter.placeholder = "0";
                    fragCounter.min = "0";
                    fragCounter.max = "999";
                profile.appendChild(fragCounter);
            }
            var card = document.createElement("div");
                card.className = "card";
                var portrait = document.createElement("img");
                    portrait.className = "portrait";
                    if (typeof digi[mon].tempID == "undefined") console.log(mon);
                    portrait.src = "img/mon/0/" + digi[mon].tempID + ".png";
                    if (mon == "birdramon") {
                        var r = Math.random();
                        if (r < 0.001) {
                            portrait.src = "img/mon/birdramon.png";
                        }
                    }
                    portrait.alt = mon + "+0";
                card.appendChild(portrait);
                var tribe = document.createElement("img");
                    tribe.className = "tribe";
                    tribe.src = "img/tribes/" + digi[mon].tribe + ".png";
                    tribe.alt = digi[mon].tribe;
                card.appendChild(tribe);
                var moniker = document.createElement("div");
                    moniker.className = "moniker";
                    moniker.innerHTML = digi[mon].name.en.replace(/([a-z])([A-Z]+|mon)/g, "$1&shy;$2");
                card.appendChild(moniker);
            profile.appendChild(card);
            var signatureSet = document.createElement("div");
                signatureSet.className = "signature-set";
                for (var skill of digi[mon].skills) {
                    var signature = document.createElement("div");
                        var rival = document.createElement("img");
                            rival.className = "rival";
                            rival.src = "img/tribes/" + skill.rival + ".png";
                            rival.alt = skill.rival;
                        signature.appendChild(rival);
                        var effect = document.createElement("span");
                            effect.innerHTML = ["Support", "ST", "AoE"][skill.effect];
                        signature.appendChild(effect);
                        var tier = document.createElement("span");
                            tier.className = "tier";
                            tier.innerHTML = skill.tier ? ("[" + skill.tier + "]") : "";
                        signature.appendChild(tier);
                    signatureSet.appendChild(signature);
                }
            profile.appendChild(signatureSet);
            var info = document.createElement("div");
                info.className = "info";
                var anchor = document.createElement("a");
                    anchor.href = "https://chortos.selfip.net/digimonlinks/monsters/" + mon;
                    anchor.target = "_blank";
                    anchor.innerHTML = "More Info";
                info.appendChild(anchor);
            profile.appendChild(info);
        return profile;
    }

    function selectProfile() {
        selectedDigi.add(this.parentNode.id);
        if (searchMode) {
            exitSearchMode();
        }
        else {
            update();
        }
    }

    function setFragments() {
        var mon = this.parentNode.id;
        if (this.value == "" || this.value <= 0) {
            this.value = "";
            delete fragCount[mon];
        }
        else {
            if (this.value > 999) {
                this.value = 999;
            }
            fragCount[mon] = parseInt(this.value);
        }
        styleFragments(this);
    }

    styleFragments = function (element) { // NOTE: used in updatePlanFrag
        element.classList.remove("n");
        element.classList.remove("vii");
        element.classList.remove("xi");
        element.classList.remove("xiv");
        element.classList.remove("xxi");
        element.classList.remove("xxxv");
        if (element.value >= 35) {
            element.classList.add("xxxv");
        }
        else if (element.value >= 21) {
            element.classList.add("xxi");
        }
        else if (element.value >= 14) {
            element.classList.add("xiv");
        }
        else if (element.value >= 11) {
            element.classList.add("xi");
        }
        else if (element.value >= 7) {
            element.classList.add("vii");
        }
        else if (element.value >= 1) {
            element.classList.add("n");
        }
    }

    function saveFragCount() {
        save("fragCount", fragCount);
    }

    for (var mon in digi) { // digi.js should already be sorted numerically
        var profile = newProfile(mon);
        var fragCounters = Array.from(profile.getElementsByClassName("frag-counter"));
        var card = profile.getElementsByClassName("card")[0];
        if (fragCounters.length) {
            var fragCounter = fragCounters[0];
            if (fragCount[mon]) {
                fragCounter.value = fragCount[mon];
                styleFragments(fragCounter);
            }
            fragCounter.addEventListener("input", setFragments);
        }
        addTapListener(card, selectProfile);
        getProfileGroup(digi[mon].evol).appendChild(profile);
    }
    addUnloadListener(saveFragCount);
}

function initAdvent() {
    updateAdvent = function (repeat) { // NOTE: used in updateSearchResults
        var now = Date.now();
        for (var mon in advent) {
            var profile = document.getElementById(mon);
            if (isAdvent(mon, now)) {
                profile.classList.add("advent");
                if (filters.special.has("advent")) {
                    show(profile);
                }
            }
            else {
                profile.classList.remove("advent");
                if (filters.special.has("advent")) {
                    hide(profile);
                }
            }
        }
        if (repeat) {
            setTimeout(function () { // check every minute
                requestAnimationFrame(updateAdvent);
            }, 60000);
        }
    }

    function isAdvent(mon, now) {
        if (mon in advent) {
            var start = advent[mon][0] - 43200000; // show advents half a day ahead of schedule
            var end = advent[mon][1];
            return start <= now && now <= end;
        }
        return false;
    }

    updateAdvent(true);
}

function initEvolLabels() {
    var evolLabels = Array.from(document.getElementsByClassName("evol-label"));

    function selectProfileGroup() {
        var section = this.parentNode.parentNode;
        var profiles = Array.from(section.getElementsByClassName("profile"));
        selectedDigi.clear();
        for (var profile of profiles) {
            if (!profile.classList.contains("hidden")) {
                selectedDigi.add(profile.id);
            }
        }
        if (searchMode) {
            exitSearchMode();
        }
        else {
            update();
        }
    }

    for (var evolLabel of evolLabels) {
        addTapListener(evolLabel, selectProfileGroup);
    }
}

function initFiltration() {
    var selection = document.getElementById("selection");
    var filtration = document.getElementById("filtration");
    var enterSearch = document.getElementById("enter-search");
    var exitSearch = document.getElementById("exit-search");
    var search = document.getElementById("search");
    var switches = Array.from(filtration.getElementsByClassName("switch"));

    function enterSearchMode() {
        hide(selection);
        show(filtration);
        search.focus();
        searchMode = true;
        updateLines();
        updateSearchResults();
    }

    exitSearchMode = function() { // NOTE: used in selectProfile and selectEvolLabel
        show(selection);
        hide(filtration);
        search.value = "";
        for (var s of switches) {
            s.classList.remove("selected");
        }
        filters.query.clear();
        filters.tribe.clear();
        filters.rival.clear();
        filters.effect.clear();
        filters.special.clear();
        searchMode = false;
        update();
    }

    function setQuery() {
        var lower = this.value.toLowerCase();
        var parsed = lower.split(/\s+/);
        filters.query = new Set(parsed);
        filters.query.delete("");
        updateSearchResults();
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
        updateSearchResults();
    }

    updateSearchResults = function() { // NOTE: used in setTree
        updateAdvent(false);
        for (var mon in digi) {
            var profile = document.getElementById(mon);
            show(profile);
            if (!okFilters(mon)) {
                hide(profile);
            }
        }
    }

    function okFilters(mon) {
        var okQuery = !filters.query.size || Array.from(filters.query).every(function (term) {
            var en = digi[mon].name.en.toLowerCase().replace(/\W+/, "-");
            var jp = digi[mon].name.jp.toLowerCase();
            return en.includes(term) || jp.includes(term);
        });
        var okTribe = !filters.tribe.size || filters.tribe.has(digi[mon].tribe);
        var okSkill = digi[mon].skills.some(function (skill) {
            var okRival = !filters.rival.size || filters.rival.has(skill.rival);
            var effect = ["support", "st", "aoe"][skill.effect];
            var okEffect = !filters.effect.size || filters.effect.has(effect);
            return okRival && okEffect;
        });
        var okTree = !filters.special.has("tree") || [gemelCore, gemel][settings.tree].nodes.has(parseInt(mon));
        var okDNA2 = !filters.special.has("dna") || digi[mon].skills.length > 1;
        var okV2 = !filters.special.has("v2") || digi[mon].v2;
        var profile = document.getElementById(mon);
        var okAdvent = !filters.special.has("advent") || profile.classList.contains("advent");
        var okSpecial = okTree && okDNA2 && okV2 && okAdvent;
        return okQuery && okTribe && okSkill && okSpecial;
    }

    addTapListener(blank, enterSearchMode);
    addTapListener(enterSearch, enterSearchMode);
    addTapListener(exitSearch, exitSearchMode);
    search.addEventListener("input", setQuery);
    search.addEventListener("keydown", enterBlur);
    for (var s of switches) {
        addTapListener(s, flipSwitch);
    }

    exitSearchMode();
}

function initVisualization() {
    var visualization = document.getElementById("visualization");
    var slideSets = Array.from(visualization.getElementsByClassName("slide-set"));
    var setters = {
        "tree": setTree,
        "sort": setSort,
        "preview": setPreview,
        "frag": setFrag,
        "awkn": setAwkn,
        "size": setSize,
        "lang": setLang,
        "skill": setSkill
    };

    function setTree(n) {
        update();
        if (searchMode) {
            updateSearchResults();
        }
    }

    function setSort(n) {
        if (n == 2) {
            untangleProfiles();
        }
        else {
            var basis = n ? byAlphabet : byDefault;
            var keys = Object.keys(digi);
            keys.sort(basis);
            sortProfiles(keys);
        }
    }

    function byAlphabet(a, b) {
        var aName = digi[a].name.en.toLowerCase();
        var bName = digi[b].name.en.toLowerCase();
        return aName < bName ? -1 : aName > bName ? 1 : 0;
    }

    function byDefault(a, b) {
        var a = parseInt(a);
        var b = parseInt(b);
        return a - b;
    }

    // function byTribe(a, b) { // TODO: delete this eventually
    //     var tribes = ["mirage", "blazing", "glacier", "electric", "earth", "bright", "abyss"];
    //     var tribeComparison = tribes.indexOf(digi[a].tribe) - tribes.indexOf(digi[b].tribe);
    //     return tribeComparison ? tribeComparison : byAlphabet(a, b);
    // }

    function setPreview(n) {
        for (var mon in digi) {
            var profile = document.getElementById(mon);
            var card = profile.getElementsByClassName("card")[0];
            if (n) {
                card.addEventListener("mouseover", previewGemel);
                card.addEventListener("touchstart", previewGemel);
                card.addEventListener("mouseout", deviewGemel);
                card.addEventListener("touchend", deviewGemel);
            }
            else {
                card.removeEventListener("mouseover", previewGemel);
                card.removeEventListener("touchstart", previewGemel);
                card.removeEventListener("mouseout", deviewGemel);
                card.removeEventListener("touchend", deviewGemel);
            }
        }
    }

    function previewGemel() {
        if (selectedDigi.size == 0) { // initialize linelayer
            updateLines();
        }
        if (!searchMode) {
            var tree = new Gemel(this.parentNode.id);
            for (var node of tree.nodes) {
                var profile = document.getElementById(node);
                profile.classList.add("preview");
                var card = profile.getElementsByClassName("card")[0];
                var rect = card.getBoundingClientRect();
                linecontext.clearRect(
                    rect.left + window.scrollX + 1,
                    rect.top + window.scrollY + 1,
                    rect.width - 2,
                    rect.height - 2
                );
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
            var tree = new Gemel(this.parentNode.id);
            for (var node of tree.nodes) {
                var profile = document.getElementById(node);
                profile.classList.remove("preview");
            }
            updateLines();
        }
    }

    function setFrag(n) {
        var fragCounters = Array.from(document.getElementsByClassName("frag-counter"));
        for (var fragCounter of fragCounters) {
            if (n) {
                show(fragCounter);
            }
            else {
                hide(fragCounter);
            }
        }
    }

    function setAwkn(n) {
        var portraits = Array.from(document.getElementsByClassName("portrait"));
        var awkn = n == 2 ? 1 : n;
        for (var portrait of portraits) {
            var mon = portrait.parentNode.parentNode.id;
            if (mon == "blank") {
                continue;
            }
            if (mon.endsWith("clone")) {
                mon = mon.slice(0, -6);
            }
            if (awkn != 5 || digi[mon].v2) {
                portrait.src = portrait.src.replace(/mon\/[01345]/, "mon/" + awkn);
                portrait.alt = portrait.alt.replace(/\+[01345]/, "+" + awkn);
            }
        }
    }

    function setSize(n) {
        var profiles = Array.from(document.getElementsByClassName("profile"));
        profiles.push(blank);
        var size = ["", "large", "small"][n];
        for (var profile of profiles) {
            profile.classList.remove("large");
            profile.classList.remove("small");
            if (settings.size) {
                profile.classList.add(size);
            }
        }
        updateLines();
    }

    function setLang(n) {
        var profiles = Array.from(document.getElementsByClassName("profile"));
        // TODO: find out what the word for "blank" is in Japanese
        var code = ["en", "jp"][n];
        for (var profile of profiles) {
            if (profile.id != "blank") {
                var id = profile.id.replace("-clone", "");
                var moniker = profile.getElementsByClassName("moniker")[0];
                var info = profile.getElementsByClassName("info")[0];
                var anchor = info.getElementsByTagName("a")[0];
                if (code == "en") {
                    moniker.innerHTML = digi[id].name.en.replace(/([a-z])([A-Z]+|mon)/g, "$1&shy;$2");
                    anchor.href = anchor.href.replace(/digimonlink[s|z]/, "digimonlinks");
                }
                else if (code == "jp") {
                    moniker.innerHTML = digi[id].name.jp;
                    anchor.href = anchor.href.replace(/digimonlink[s|z]/, "digimonlinkz");
                }
            }
        }
        updateLines();
    }

    function setSkill(n) {
        var signatureSets = Array.from(document.getElementsByClassName("signature-set"));
        for (var signatureSet of signatureSets) {
            if (n) {
                signatureSet.style.display = "block";
            }
            else {
                signatureSet.removeAttribute("style");
            }
        }
        updateLines();
    }

    setSlide = function (key, value) {
        var slideSet = document.getElementById(key);
        var slides = Array.from(slideSet.getElementsByClassName("slide"));
        for (var slide of slides) {
            hide(slide);
            if (slide == slides[value]) {
                show(slide);
            }
        }
        settings[key] = value;
        setters[key](value);
    }

    function advanceSlide() {
        var key = this.id;
        var slides = Array.from(this.getElementsByClassName("slide"));
        var value = (settings[key] + 1) % slides.length;
        setSlide(key, value);
    }

    function hideUselessSettings() {
        var uselessSettings = ["skill"];
        for (var uselessSetting of uselessSettings) {
            var slideSet = document.getElementById(uselessSetting);
            var slidebox = slideSet.parentNode;
            hide(slidebox);
        }
    }

    function saveSettings() {
        save("sort", settings.sort);
        save("preview", settings.preview);
        save("frag", settings.frag);
        save("awkn", settings.awkn);
        save("size", settings.size);
        save("lang", settings.lang);
        save("skill", settings.skill);
    }

    function deleteLegacyLocalStorage() { // TODO: delete this in the next version?
        try {
            window.localStorage.removeItem("tree");
            window.localStorage.removeItem("awkn");
            window.localStorage.removeItem("skill");
        }
        catch (e) {
            console.log(e);
        }
    }

    hideUselessSettings();
    for (var slideSet of slideSets) {
        var key = slideSet.id;
        var value = settings[key];
        setSlide(key, value)
        addTapListener(slideSet, advanceSlide);
    }
    addUnloadListener(saveSettings);
    deleteLegacyLocalStorage();
}

function initPlanner() {
    var planGroup = document.getElementById("plan-group");
    var addPlan = document.getElementById("add-plan");
    var planA, x0, nA, nB;

    function addSelection() {
        planner.push({
            "digi": Array.from(selectedDigi).sort(byEvol),
            "awkn": settings.awkn,
            // "deduct": true,
            "note": ""
        });
        newPlan(planner.length - 1);
        updateLines();
        noplan();
    }

    function byEvol(a, b) { // TODO: fix mega order and sort numerically secondarily
        var evols = ["in-training-i", "in-training-ii", "rookie", "champion", "ultimate", "mega"];
        var rank = evols.indexOf(digi[a].evol) - evols.indexOf(digi[b].evol);
        return rank;
    }

    newPlan = function (n) {
        var entry = document.createElement("div");
            entry.className = "plan";
            entry.dataset.n = n;
            var x = document.createElement("div");
                x.className = "x";
                addTapListener(x, deleteEntry);
            entry.appendChild(x);
            var awkn = document.createElement("div");
                awkn.className = "awkn";
                if (planner[n].awkn == 5) {
                    awkn.innerHTML = "+4/V2";
                }
                else {
                    awkn.innerHTML = "+" + planner[n].awkn;
                }
            entry.appendChild(awkn);
            var viewer = document.createElement("div");
                viewer.className = "viewer";
                for (var mon of planner[n].digi) {
                    var photo = document.createElement("img");
                        if (planner[n].awkn != 5 || digi[mon].v2) {
                            photo.src = "img/mon/" + [0, 1, 1, 3, 4, 5][planner[n].awkn] + "/" + digi[mon].tempID + ".png";
                        }
                        else {
                            photo.src = "img/mon/" + [0, 1, 1, 3, 4, 4][planner[n].awkn] + "/" + digi[mon].tempID + ".png";
                        }
                    viewer.appendChild(photo);
                }
                addTapListener(viewer, viewEntry);
            entry.appendChild(viewer);
            // var deduct = document.createElement("div");
            //     deduct.className = "deduct";
            //     deduct.innerHTML = "Deducted";
            //     addTapListener(deduct, toggleDeduction);
            // entry.appendChild(deduct);
            var note = document.createElement("textarea");
                note.className = "note";
                note.placeholder = "Notes";
                note.value = planner[n].note;
                note.addEventListener("input", editNote);
            entry.appendChild(note);
            var handle = document.createElement("div");
                handle.className = "handle";
                handle.addEventListener("mousedown", startDrag);
                handle.addEventListener("touchstart", startDrag);
            entry.appendChild(handle);
        planGroup.appendChild(entry);
    }

    function deleteEntry() {
        var n = parseInt(this.parentNode.dataset.n);
        planner = planner.slice(0, n).concat(planner.slice(n + 1));
        for (var plan of Array.from(document.getElementsByClassName("plan"))) {
            if (plan.dataset.n > n) {
                plan.dataset.n -= 1;
            }
        }
        this.parentNode.remove();
        updateLines();
        noplan();
    }

    function viewEntry() {
        var n = this.parentNode.dataset.n;
        var plan = planner[n];
        selectedDigi = new Set(plan.digi);
        setSlide("awkn", plan.awkn);
        update();
    }

    // function toggleDeduction() { // TODO: this
    // }

    function editNote() {
        var message = this.value;
        var n = this.parentNode.dataset.n;
        planner[n].note = message;
    }

    function startDrag(e) {
        x0 = getX(e);
        planA = this.parentNode;
        nA = parseInt(planA.dataset.n);
        nB = nA;
        planA.classList.add("drag");
        document.body.classList.add("drag");
        window.addEventListener("mousemove", drag);
        window.addEventListener("touchmove", drag);
        window.addEventListener("mouseup", stopDrag);
        window.addEventListener("touchend", stopDrag);
    }

    function drag(e) {
        var x1 = getX(e);
        planA.style.transform = "translateX(" + (x1 - x0) + "px)";

        var plans = Array.from(document.getElementsByClassName("plan"));
        nB = nA;
        for (var planB of plans) {
            if (planA != planB) {
                var xA = getMidX(planA);
                var xB = getMidX(planB);
                var mB = parseInt(planB.dataset.n);
                planB.removeAttribute("style");
                if (nA < mB) {
                    if (xA > xB) {
                        if (nB < mB) {
                            nB = mB;
                        }
                        planB.style.transform = "translateX(-66px)";
                    }
                }
                else if (xA < xB) {
                    if (nB > mB) {
                        nB = mB;
                    }
                    planB.style.transform = "translateX(66px)";
                }
            }
        }
    }

    function stopDrag() {
        var planGroup = document.getElementById("plan-group");
        var plans = planGroup.getElementsByClassName("plan"); // TODO: fix how DOM plans are appended
        var newPlanner = [];
        var d = 0;
        for (var i = 0; i < planner.length; i++) {
            if (i == nB) {
                newPlanner.push(planner[nA]);
                d--;
            }
            else {
                if (i + d == nA) {
                    d++;
                }
                newPlanner.push(planner[i + d]);
            }
            if (nA < nB) {
                planGroup.appendChild(plans[d]);
            }
            else {
                if (i == nB) {
                    planGroup.appendChild(plans[nA - i]);
                }
                else {
                    planGroup.appendChild(plans[0]);
                }
            }
            plans[plans.length - 1].dataset.n = i;
        }
        planner = newPlanner;

        for (var plan of Array.from(plans)) {
            plan.removeAttribute("style");
        }
        planA.classList.remove("drag");
        document.body.classList.remove("drag");
        window.removeEventListener("mousemove", drag);
        window.removeEventListener("touchmove", drag);
        window.removeEventListener("mouseup", stopDrag);
        window.removeEventListener("touchend", stopDrag);
    }

    function getX(e) {
        if (e.touches) {
            if (e.touches.length > 0) {
                return e.touches[0].clientX;
            }
        }
        return e.clientX;
    }

    function getMidX(element) {
        var rect = element.getBoundingClientRect();
        var x = window.scrollX + (rect.left + rect.right) / 2;
        return x;
    }

    function noplan() {
        if (planner.length) {
            addPlan.classList.remove("noplan");
        }
        else {
            addPlan.classList.add("noplan");
        }
    }

    function savePlanner() {
        save("planner", planner);
    }

    for (var i = 0; i < planner.length; i++) {
        newPlan(i);
    }
    noplan();
    addTapListener(addPlan, addSelection);
    addUnloadListener(savePlanner);
}

function initFooter() {
    var footAbout = document.getElementById("foot-about");
    var footFAQ = document.getElementById("foot-faq");
    var footPort = document.getElementById("foot-port");
    var footClose = document.getElementById("foot-close");
    var toeAbout = document.getElementById("toe-about");
    var toeFAQ = document.getElementById("toe-faq");
    var toePort = document.getElementById("toe-port");
    var toeClose = document.getElementById("toe-close");
    var importer = document.getElementById("import");
    var exporter = document.getElementById("export");
    var deporter = document.getElementById("deport");
    var toeTile = document.getElementById("toe-tile");
    var tile = document.getElementById("tile");
    var reader = new FileReader();
    var input;

    function exportPlanFrag() {
        var planfrag = {
            "planner": planner,
            "fragCount": fragCount
        };
        var chars = JSON.stringify(planfrag);
        var codes = [];
        for (var i = 0; i < chars.length; i++) {
            var code = chars.charCodeAt(i);
            if (code < 255) {
                codes.push(code);
            }
            else {
                var multiplier = Math.floor(code / 256)
                codes.push(255);
                codes.push(multiplier);
                codes.push(code - 256 * multiplier);
            }
        }
        var size = Math.ceil(Math.sqrt(codes.length / 3));
        while (codes.length < 3 * Math.pow(size, 2)) {
        	codes.push(0);
        }

        var canvas = document.createElement("canvas");
        var context = canvas.getContext("2d");
        canvas.width = size;
        canvas.height = size;
        var imageData = context.createImageData(size, size);
        var d = 0;
        for (var i = 0; i < Math.pow(size, 2) * 4; i++) {
        	imageData.data[i] = codes[i - d];
        	if (!((i + 1) % 4)) {
        		imageData.data[i] = 255;
                d++;
            }
        }
        context.putImageData(imageData, 0, 0);

        var blobURL = canvasToBlobURL(canvas);
        tile.src = blobURL;
        toeTile.href = blobURL;
        toeTile.click();
    }

    function stay(e) {
        e.preventDefault();
        toeTile.parentNode.classList.add("iOS-tile");
    }

    function importPlanFrag0() {
        input = document.createElement("input");
        input.type = "file";
        input.accept = "image/png";
        input.addEventListener("change", importPlanFrag1);
        document.body.appendChild(input); // because iOS can't click on elements outside of DOM
        input.click();
        input.remove();
    }

    function importPlanFrag1() {
        var file = this.files[0];
        if (file) {
            var reader = new FileReader();
            reader.addEventListener("load", importPlanFrag2);
            reader.readAsDataURL(file);
        }
    }

    function importPlanFrag2() {
        var image = new Image();
        image.addEventListener("load", importPlanFrag3);
        image.src = this.result;
    }

    function importPlanFrag3() {
        var canvas = document.createElement("canvas");
        var context = canvas.getContext("2d");
        canvas.width = this.width;
        canvas.height = this.height;
        context.drawImage(this, 0, 0, this.width, this.height);
        if (this.width == this.height || this.width < 2048) { // TODO: maybe decrease the size limit?
            var imageData = context.getImageData(0, 0, canvas.width, canvas.height);
            var data = Array.from(imageData.data);
            var codes = data.filter(skipAlpha);
            var chars = "";
            for (var i = 0; i < codes.length; i++) {
                if (codes[i] < 255) {
                    if (codes[i] > 0) {
                        chars += String.fromCharCode(codes[i]);
                    }
                }
                else {
                    var code = 256 * codes[i + 1] + codes[i + 2];
                    chars += String.fromCharCode(code);
                    i += 2;
                }
            }
        }
        try {
            var planfrag = JSON.parse(chars);
            planner = planfrag.planner;
            fragCount = planfrag.fragCount;
            updatePlanFrag();
        }
        catch (e) {
            console.log("Invalid memblock.");
            console.log(e);
            context.moveTo(0, 0);
            context.lineTo(canvas.width, canvas.height);
            context.moveTo(0, canvas.height);
            context.lineTo(canvas.width, 0);
            context.lineWidth = Math.min(canvas.width, canvas.height) / 16;
            context.strokeStyle = "#fff";
            context.stroke();
        }
        var blobURL = canvasToBlobURL(canvas);
        tile.src = blobURL;
    }

    function canvasToBlobURL(canvas) {
        var dataURL = canvas.toDataURL("image/png");
        var dataString = dataURL.split(",")[1];
        var data = atob(dataString);
        var dataArray = new Uint8Array(data.length);
        for (var i = 0; i < data.length; i++) {
            dataArray[i] = data.charCodeAt(i);
        }
        var blob = new Blob([dataArray.buffer], {type: "image/png"});
        var blobURL = window.URL.createObjectURL(blob);
        return blobURL;
    }

    function skipAlpha(value, index) {
        return (index + 1) % 4;
    }

    function deportLocalStorage() {
        exportPlanFrag();

        setSlide("tree", 0);
        setSlide("sort", 0);
        setSlide("preview", 0);
        setSlide("frag", 0);
        setSlide("awkn", 0);
        setSlide("size", 0);
        setSlide("lang", 0);
        setSlide("skill", 0);
        selectedDigi = new Set();
        planner = [];
        fragCount = {};
        updatePlanFrag();

        try {
            localStorage.clear();
        }
        catch (e) {
            console.log(e);
        }
    }

    function updatePlanFrag() { // call after setting planner and fragCount
        var planGroup = document.getElementById("plan-group");
        var addPlan = document.getElementById("add-plan");
        planGroup.innerHTML = "";
        if (planner.length) {
            for (var i = 0; i < planner.length; i++) {
                newPlan(i);
            }
            addPlan.classList.remove("noplan");
        }
        else {
            addPlan.classList.add("noplan");
        }
        update();
        for (var mon in digi) {
            if (digi[mon].fragments) {
                var profile = document.getElementById(mon);
                var fragCounter = profile.getElementsByClassName("frag-counter")[0];
                if (fragCount[mon]) {
                    fragCounter.value = fragCount[mon];
                }
                else {
                    fragCounter.value = "";
                }
                styleFragments(fragCounter);
            }
        }
    }

    tile.id = "tile";
    if (toeTile.download != "memblock") { // for iOS safari
        addTapListener(toeTile, stay);
    }
    addTapListener(importer, importPlanFrag0);
    addTapListener(exporter, exportPlanFrag);
    addTapListener(deporter, deportLocalStorage);
    hide(footAbout);
    hide(footFAQ);
    hide(footPort);
    hide(footClose);
    addTapListener(toeAbout, function () {
        show(footAbout);
        hide(footFAQ);
        hide(footPort);
        show(footClose);
        updateLines();
    });
    addTapListener(toeFAQ, function () {
        hide(footAbout);
        show(footFAQ);
        hide(footPort);
        show(footClose);
        updateLines();
    });
    addTapListener(toePort, function () {
        hide(footAbout);
        hide(footFAQ);
        show(footPort);
        show(footClose);
        updateLines();
    });
    addTapListener(toeClose, function () {
        hide(footAbout);
        hide(footFAQ);
        hide(footPort);
        hide(footClose);
        updateLines();
    });
}

function initLineListeners() {
    var profileGroups = Array.from(document.getElementsByClassName("profile-group"));
    for (var profileGroup of profileGroups) {
        var scroller = profileGroup.parentNode;
        scroller.addEventListener("scroll", updateLines);
    }
    window.addEventListener("resize", updateLines);
}

function initParameter() { // fake ?key=value format
    var kvs = window.decodeURIComponent(location.search).split(/\?|\&/);
    for (var kv of kvs) {
        var kvSplit = kv.split("=");
        var key = kvSplit[0];
        var value = kvSplit[1];
        if (key == "sd") {
            var mons = value.split(",");
            for (var mon of mons) {
                if (mon in digi) {
                    selectedDigi.add(mon);
                }
            }
            update();
        }
        else if (key == "fc") {
            var mcs = value.split(",");
            for (var mc of mcs) {
                var mcSplit = mc.split(":");
                var mon = mcSplit[0];
                var profile = document.getElementById(mon);
                var fragCounter = profile.getElementsByClassName("frag-counter")[0];
                if (typeof fragCounter != "undefined") {
                    var count = parseInt(mcSplit[1]);
                    var boundedCount = Math.max(0, Math.min(count, 999));
                    fragCount[mon] = boundedCount;
                    fragCounter.value = boundedCount;
                    styleFragments(fragCounter);
                }
            }
        }
    }
    history.replaceState({}, document.title, "/");
}

window.addEventListener("DOMContentLoaded", init);
