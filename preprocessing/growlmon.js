/* run on https://growlmon.net/digivolvetree */

/* Messages */

function warning(message) {
    console.log("%cWARNING: " + message, "background: #ff08; padding: 3px 13px;");
}

function error(message) {
    console.log("%cERROR: " + message, "background: #f008; padding: 3px 13px;");
}

/* Helpers */

var tribes = ["mirage", "blazing", "glacier", "electric", "earth", "bright", "abyss"];

function getLowerText(element) {
    return element.innerText.toLowerCase().trim();
}

function getTailBase(url) {
    var parts = url.split("/");
    var tail = parts[parts.length - 1];
    var base = tail.split(".")[0];
    if (base.includes("lavogaritomon")) { // remove if growlmon fixes this typo
        base = base.replace(/lavogaritomon/g, "lavogaritamon");
    }
    return base;
}

/* Digimon Portraits */

function getPortraits(awkn) { // skip awkn = 2 (+1 icons == +2 icons)
    var blocks = document.getElementsByClassName("blockListEl");
    for (var block of blocks) {
        var mon = getTailBase(block.getElementsByTagName("a")[0].href);
        var src = block.getElementsByClassName("blockListIco")[0].src;

        var a = document.createElement("a");
        if (awkn < 5) {
            a.href = src.replace(/-0/g, "-" + awkn);
        }
        else {
            a.href = "https://growlmon.net/img/digimon/v2/" + getTailBase(src.replace(/-0/g, "")) + ".png";
        }
        a.setAttribute("download", mon);
        a.click();
    }
} // put into preprocessing/img/mon/$awkn and run preprocessing/indexifyMon.m

/* Digivolution Tree */
var docs = [];
function getDigimonInfo() {
    var digi = {};
    var mons = [];
    var blocks = document.getElementsByClassName("blockListEl");
    Array.from(blocks).forEach(function (block) {
        var mon = getTailBase(block.getElementsByTagName("a")[0].href);
        if (mon.endsWith("-mutant")) { // remove when takatomon adds a mutant setting
            return;
        }
        var evol = getLowerText(block.getElementsByClassName("blockListStage")[0]).replace(/\s+/g, "-");
        var tribeIndex = getTailBase(block.getElementsByClassName("blockListType")[0].src);
        var tribe = tribes[tribeIndex - 1];

        var xhr = new XMLHttpRequest();
        xhr.open("GET", "https://growlmon.net/digimon/" + mon, true);
        xhr.onload = function () {
            if (this.readyState == 4 && this.status == 200) {
                var doc = document.createElement("div");
                doc.innerHTML = this.response;
                digi[mon] = new Digimon(mon, evol, tribe, doc);
                console.log("Digimon [" + mon + "] has been successfully registered.");
            }
            else {
                error("Digimon [" + mon + "] could not be registered.");
                digi[mon] = {
                    "name": "",
                    "evol": "", "tribe": "ERROR", "next": []};
            }
            mons.push(mon);
            if (mons.length == blocks.length) { // TODO: fix prettyJSON to allow subobjects
                var prettyJSON = "{\n\t" +
                    JSON.stringify(digi)
                    .slice(1, -2).split("},").sort().join("},\n\t")
                    .replace(/:/g, ": ").replace(/,/g, ", ").replace(/, \n/g, ",\n") +
                "}\n}";
                var data = encodeURIComponent("var digi = " + prettyJSON + ";\n");
                var a = document.createElement("a");
                a.href = "data:text/javascript;charset=utf-8," + data;
                a.setAttribute("download", "digi");
                a.click();
            }
        };
        xhr.send();
    });
    return digi;
} // check warnings and errors, double-check data, and put into root

function Digimon(mon, evol, tribe, doc) {
    var digiTopper = doc.getElementsByClassName("digiTopper")[0];
    var dvolveTable = doc.getElementsByClassName("dvolveTable")[0];
    var stattable = doc.getElementsByClassName("stattable")[0];

    this.name = digiTopper.children[1].innerHTML;
    this.evol = evol;
    this.tribe = tribe;
    this.next = [];
    for (var a of dvolveTable.rows[0].cells[2].getElementsByTagName("a")) {
        var nextmon = getTailBase(a.href);
        this.next.push(nextmon);
    }
    var modematch = getLowerText(dvolveTable).match(/mode change to (.+) by/);
    this.fragments = mon == "kimeramon" || mon == "meicrackmon-vm" || evol == "mega" && !mon.includes("volcanic") && (this.next.length || modematch == null); // TODO: figure out how to use this flag
    if (modematch != null) { // remove if growlmon ever decides to handle recursion
        var modemon = modematch[1];
        for (var a of dvolveTable.rows[0].cells[0].getElementsByTagName("a")) {
            console.log(getLowerText(a), modemon);
            if (getLowerText(a).includes(modemon)) {
                var prevmon = getTailBase(a.href);
                this.next.push(prevmon);
            }
        }
    }
    this.skills = getSkills(mon, doc);
    this.v2 = getLowerText(stattable).includes("version upgrade");
}

function getSkills(mon, doc) {
    var skills = [];
    for (var i = 1; i < 3; i++) {
        var movebox = doc.querySelector("#move" + i + "box");
        if (movebox) {
            var movedesc = movebox.getElementsByClassName("movedesc")[0];
            var img = movedesc.getElementsByTagName("img")[0];
            var rival = getRival(img.src);
            var effect = getEffect(mon, movedesc);
            var tier = getTier(mon, i, effect, doc.getElementsByTagName("table"));
            var skill = {"rival": rival, "effect": effect, "tier": tier};
            skills.push(skill);
        }
    }
    return skills;
}

function getRival(src) {
    var base = getTailBase(src);
    var bases = ["Null", "Fire", "Water", "Thunder", "Nature", "Light", "Darkness"];
    var bases2 = ["-", "Blazing", "Glacier", "Electric", "Earth", "Bright", "Abyss"]; // TODO: eliminate this if unneeded (comment out, check, then see)
    var index = bases.indexOf(base);
    if (index < 0) {
        warning("Detected alternate tribe name [" + base + "].")
        index = bases2.indexOf(base);
    }
    return tribes[index];
}

function getEffect(mon, movedesc) { // TODO: see if it's better to output strings
    var text = getLowerText(movedesc);
    if (text.includes("all enem")) {
        return 2;
    }
    else if (text.includes("single enem") || text.includes("no signature")) {
        return 1;
    }
    else if (["restore", "counter", "deflect", "invalidate"].some(term => text.includes(term))) { // TODO: find all keywords by removing this condition for a sec
        return 0;
    }
    else {
        warning("No skill type found for " + mon + " [" + text + "].");
        return -1;
    }
}

function getTier(mon, i, effect, tables) {
    if (mon == "examon" && i == 1) { // because examon's skill is weird
        effect = 1;
    }
    var table = tables[tables.length - 1];
    var labels = ["single target:", "area of effect:", "support:"];
    if (table && labels.every(term => getLowerText(table).includes(term))) { // NOTE: if takatomon ever adds mutants, put a mutant condition
        var cells = table.rows[(effect + 2) % 3].cells;
        var tier = getLowerText(cells[cells.length - 1]);
        if (tier == "" || tier == "-") { // TODO: see if this ever actually happens
            warning("The skill tier for " + mon + " was incorrectly assigned.");
        }
        return tier;
    }
    warning("No skill tier found for " + mon + ".");
    return;
}
