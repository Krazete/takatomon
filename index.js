/* this script relies on digi.js, tree.js, and advent.js */

/* Globals */

var evols = ["in-training-i", "in-training-ii", "rookie", "champion", "ultimate", "mega", "selection"]; // TODO: add egg in the future?
var langs = ["en", "ko", "zh-TW", "ja"];

var blank;
var linelayer;
var linecontext;
var profileGroups;

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
    "attribute": new Set(),
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
    if (settings.sort == 3) {
        untangleProfiles();
    }
    else {
        updateLines();
    }
}

function updateClones() {
    var selection = profileGroups[6];
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
        dfs(parseInt(mon), 0, true);
    }
    for (var mon in digi) {
        visited.add(parseInt(mon));
    }
    sortProfiles(visited);
}

function sortProfiles(sortedDigi) {
    for (var mon of sortedDigi) {
        var profileGroup = profileGroups[digi[mon].evol];
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
    initProfileGroups();
    initProfiles();
    initAdvent();
    initFiltration();
    initVisualization();
    initPlanner();
    initFooter();
    initLineListeners();
    initParameter();
}

function initProfileGroups() {
    profileGroups = [];

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

    for (var evol of evols) {
        var section = document.getElementById(evol);
        var evolLabel = section.getElementsByClassName("evol-label")[0];
        var profileGroup = section.getElementsByClassName("profile-group")[0];
        if (evolLabel) {
            addTapListener(evolLabel, selectProfileGroup);
        }
        profileGroups.push(profileGroup);
    }
}

function initProfiles() {
    var date = new Date();
    var month = date.getMonth() + 1;
    var day = date.getDate();

    function newProfile(mon) {
        var profile = document.createElement("div");
            profile.className = "profile";
            profile.id = mon;
            if (!digi[mon].global) {
                profile.classList.add("unreleased");
            }
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
                var portraiture = document.createElement("div");
                    portraiture.className = "portraiture";
                    var evol = Math.max(1, digi[mon].evol);
                    var backing = document.createElement("img");
                        backing.className = "backing";
                        backing.src = "img/backing/" + evol + ".png";
                        backing.alt = "backing-" + evol;
                    portraiture.appendChild(backing);
                    var portrait = document.createElement("img");
                        portrait.className = "portrait";
                        portrait.src = "img/portrait/" + digi[mon].images[0] + ".png";
                        if (parseInt(mon) == 97) {
                            var r = Math.random();
                            if (r < 0.01) {
                                portrait.src = "img/birdramon.png";
                            }
                        }
                        if (month == 4 && day == 1) {
                            var r = Math.floor(4 * Math.random());
                            if (r > 0) {
                                portrait.style.transform = "rotate(" + (90 * r) + "deg)";
                            }
                        }
                        portrait.alt = mon + "+0";
                    portraiture.appendChild(portrait);
                    var frame = document.createElement("img");
                        frame.className = "frame";
                        frame.src = "img/frame/" + evol + ".png";
                        frame.alt = "frame-" + evol;
                    portraiture.appendChild(frame);
                card.appendChild(portraiture);
                var tribe = document.createElement("img");
                    tribe.className = "tribe";
                    tribe.src = "img/tribe/" + digi[mon].tribe + ".png";
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
                        var attribute = document.createElement("img");
                            attribute.className = "skill-icon";
                            attribute.src = "img/tribe/" + skill.attribute + ".png";
                            attribute.alt = skill.attribute;
                        signature.appendChild(attribute);
                        if (skill.physical) {
                            var physical = document.createElement("img");
                            physical.className = "skill-icon";
                            physical.src = "img/skill/physical.png";
                            physical.alt = "atk";
                            signature.appendChild(physical);
                        }
                        if (skill.magical) {
                            var magical = document.createElement("img");
                            magical.className = "skill-icon";
                            magical.src = "img/skill/magical.png";
                            magical.alt = "s-atk";
                            signature.appendChild(magical);
                        }
                        var effect = document.createElement("span");
                            effect.innerHTML = ["Support", "ST", "AoE"][skill.effect];
                        signature.appendChild(effect);
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
        save("fragCount", fragCount);
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
        profileGroups[digi[mon].evol].appendChild(profile);
    }
}

function initAdvent() {
    updateAdvent = function (repeat) { // NOTE: used in updateSearchResults
        var now = Date.now();
        for (var mon in advent) {
            var profile = document.getElementById(mon);
            var card = profile.getElementsByClassName("card")[0];
            for (var timespan of advent[mon]) {
                profile.classList.remove("advent");
                profile.classList.remove("ongoing");
                profile.classList.remove("coming");
                if (now < timespan[1]) { // event has not ended
                    profile.classList.add("advent");
                    if (timespan[0] <= now) { // event is ongoing
                        profile.classList.add("ongoing");
                        card.dataset.advent = getCountdown(now, timespan[1]);
                        break;
                    }
                    else { // event is coming
                        profile.classList.add("coming");
                        card.dataset.advent = getCountdown(now, timespan[0]);
                    }
                }
                else { // event has passed
                    card.removeAttribute("data-advent");
                }
            }
        }
        if (repeat) {
            setTimeout(function () { // check every minute
                requestAnimationFrame(updateAdvent);
            }, 60000);
        }
    }

    function getCountdown(now, later) {
        var timeDelta = later - now;
        var dayDelta = Math.floor(timeDelta / 86400000); // 24 * 60 * 60 * 1000
        var hourDelta = Math.floor(timeDelta / 3600000 - dayDelta * 24);
        var minuteDelta = Math.floor(timeDelta / 60000 - hourDelta * 60 - dayDelta * 1440);
        if (dayDelta > 0) {
            return dayDelta + "d";
        }
        else if (hourDelta > 0) {
            return hourDelta + "h";
        }
        else if (minuteDelta > 0) {
            return minuteDelta + "m";
        }
        return "???";
    }

    updateAdvent(true);
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
        filters.attribute.clear();
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
        var value = key == "special" ? splitId[1] : parseInt(splitId[1]);
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
            var okTerm = langs.some(function (lang) {
                if (lang in digi[mon].name) { // else return undefined
                    return digi[mon].name[lang].toLowerCase().includes(term);
                }
            });
            return okTerm;
        });
        var okTribe = !filters.tribe.size || filters.tribe.has(digi[mon].tribe);
        var okSkill = digi[mon].skills.some(function (skill) {
            var okAttribute = !filters.attribute.size || filters.attribute.has(skill.attribute);
            var okEffect = !filters.effect.size || filters.effect.has(skill.effect);
            return okAttribute && okEffect;
        });
        var okTree = !filters.special.has("tree") || [gemelCore, gemel][settings.tree].nodes.has(parseInt(mon));
        var okDNA2 = !filters.special.has("dna") || digi[mon].skills.length > 1;
        var okV2 = !filters.special.has("v2") || digi[mon].v2;
        var profile = document.getElementById(mon);
        var okAdvent = !filters.special.has("advent") || mon in advent;
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
        if (n == 3) {
            untangleProfiles();
        }
        else {
            var bases = [byDefault, byAlphabet, byTribe];
            var basis = bases[n];
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

    function byTribe(a, b) {
        var tribeComparison = digi[a].tribe - digi[b].tribe;
        return tribeComparison ? tribeComparison : byDefault(a, b);
    }

    function setPreview(n) {
        for (var mon in digi) {
            var profile = document.getElementById(mon);
            var card = profile.getElementsByClassName("card")[0];
            if (n == 0 || n == 1) {
                linelayer.classList.remove("hidden");
            }
            else { // should probably disable updateLines, but this works
                linelayer.classList.add("hidden");
            }
            if (n == 1 || n == 3) {
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
        for (var portrait of portraits) {
            var mon = portrait.parentNode.parentNode.parentNode.id;
            if (mon == "blank") {
                continue;
            }
            if (mon.endsWith("clone")) {
                mon = mon.slice(0, -6);
            }
            if (n < 5 || digi[mon].v2) {
                if (!portrait.src.includes("birdramon")) {
                    portrait.src = "img/portrait/" + digi[mon].images[n] + ".png";
                }
                portrait.alt = mon + "+" + n;
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
        var lang = langs[n];
        for (var profile of profiles) {
            if (profile.id != "blank") {
                var id = profile.id.replace("-clone", "");
                var moniker = profile.getElementsByClassName("moniker")[0];
                var info = profile.getElementsByClassName("info")[0];
                var anchor = info.getElementsByTagName("a")[0];
                if (lang in digi[id].name) {
                    if (lang == "en") {
                        moniker.innerHTML = digi[id].name[lang].replace(/([a-z])([A-Z]+|mon)/g, "$1&shy;$2");
                    }
                    else {
                        moniker.innerHTML = digi[id].name[lang];
                    }
                    if (lang == "ja" || !digi[id].global) {
                        anchor.href = anchor.href.replace(/digimonlink[sz]/, "digimonlinkz");
                    }
                    else {
                        anchor.href = anchor.href.replace(/digimonlink[sz]/, "digimonlinks");
                    }
                }
                else {
                    moniker.innerHTML = "???";
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
        save(key, settings[key]);
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
            "note": ""
        });
        newPlan(planner.length - 1);
        updateLines();
        noplan();
    }

    function byEvol(a, b) { // TODO: fix mega order and sort numerically secondarily
        return evols.indexOf(digi[a].evol) - evols.indexOf(digi[b].evol);
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
                        photo.className = "photo-" + Math.max(1, digi[mon].evol);
                        if (planner[n].awkn != 5 || digi[mon].v2) {
                            photo.src = "img/portrait/" + digi[mon].images[settings.awkn] + ".png";
                        }
                        else {
                            photo.src = "img/portrait/" + digi[mon].images[settings.awkn] + ".png";
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
        exitSearchMode();
    }

    // function toggleDeduction() { // TODO: this
    // }

    function editNote() {
        var message = this.value;
        var n = this.parentNode.dataset.n;
        planner[n].note = message;
        savePlanner();
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
        savePlanner();
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
        savePlanner();
    }

    function savePlanner() {
        save("planner", planner);
    }

    for (var i = 0; i < planner.length; i++) {
        newPlan(i);
    }
    noplan();
    addTapListener(addPlan, addSelection);
}

function initFooter() {
    var footAbout = document.getElementById("foot-about");
    var footFAQ = document.getElementById("foot-faq");
    var footTiers = document.getElementById("foot-tiers");
    var footPort = document.getElementById("foot-port");
    var footClose = document.getElementById("foot-close");
    var toeAbout = document.getElementById("toe-about");
    var toeFAQ = document.getElementById("toe-faq");
    var toeTiers = document.getElementById("toe-tiers");
    var toePort = document.getElementById("toe-port");
    var toeClose = document.getElementById("toe-close");
    var importer = document.getElementById("import");
    var exporter = document.getElementById("export");
    var deporter = document.getElementById("deport");
    var toeTile = document.getElementById("toe-tile");
    var tile = document.getElementById("tile");
    var reader = new FileReader();
    var input;

    function showTiers() {
        toeTiers.removeEventListener("click", showTiers);
        toeTiers.removeEventListener("touchstart", showTiers);

        var xhr = new XMLHttpRequest();
        xhr.open("GET", "tiers.json", true);
        xhr.onreadystatechange = function () {
            if (xhr.readyState == 4 && xhr.status == 200) {
                var tiers = JSON.parse(this.response);
                for (var mon in tiers) {
                    var profile = document.getElementById(mon);
                    var signatures = profile.getElementsByClassName("signature-set")[0].children;
                    for (var i = 0; i < tiers[mon].length; i++) {
                        var tierBadge = document.createElement("span");
                        tierBadge.style.float = "right";
                        tierBadge.innerHTML = tiers[mon][i];
                        signatures[i].appendChild(tierBadge);
                    }

                }
    			var div = document.createElement("div");
    			div.innerHTML = this.response;
    		}
    	};
    	xhr.send();
    }

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

        paintTile(canvas, true);
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
            paintTile(canvas, true);
            exitSearchMode();
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
            paintTile(canvas, false);
        }
    }

    function paintTile(canvas, valid) {
        var blobURL = canvasToBlobURL(canvas);
        tile.src = blobURL;
        toeTile.href = blobURL;
        if (valid) {
            var iso = new Date().toISOString().replace(/T.+|\D/g, "");
            tile.classList.add("nonon");
            toeTile.download = "memblock" + iso;
        }
        else {
            tile.classList.remove("nonon");
            toeTile.download = "invalid_memblock";
        }
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
        exitSearchMode();

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
        save("planner", planner);
        save("fragCount", fragCount);
    }

    addTapListener(toeTiers, showTiers);
    if (typeof toeTile.download == "undefined") { // for iOS safari
        addTapListener(toeTile, stay);
    }
    addTapListener(importer, importPlanFrag0);
    addTapListener(exporter, exportPlanFrag);
    addTapListener(deporter, deportLocalStorage);

    hide(footAbout);
    hide(footFAQ);
    hide(footTiers);
    hide(footPort);
    hide(footClose);
    addTapListener(toeAbout, function () {
        show(footAbout);
        hide(footFAQ);
        hide(footTiers);
        hide(footPort);
        show(footClose);
        updateLines();
    });
    addTapListener(toeFAQ, function () {
        hide(footAbout);
        show(footFAQ);
        hide(footTiers);
        hide(footPort);
        show(footClose);
        updateLines();
    });
    addTapListener(toeTiers, function () {
        hide(footAbout);
        hide(footFAQ);
        show(footTiers);
        hide(footPort);
        show(footClose);
        updateLines();
    });
    addTapListener(toePort, function () {
        hide(footAbout);
        hide(footFAQ);
        hide(footTiers);
        show(footPort);
        show(footClose);
        updateLines();
    });
    addTapListener(toeClose, function () {
        hide(footAbout);
        hide(footFAQ);
        hide(footTiers);
        hide(footPort);
        hide(footClose);
        updateLines();
    });
}

function initLineListeners() {
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
