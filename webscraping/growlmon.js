/* run on http://growlmon.net/digivolvetree */

/* Messages */
function warning(message) {
    console.log("%cWARNING: " + message, "background: #ff08; padding: 3px 13px;");
}
function error(message) {
    console.log("%cERROR: " + message, "background: #f008; padding: 3px 13px;");
}

/* Tribe Labels (for getDigimonInfo and getTribeImages) */
function tribeFromSrc(src) {
    var index = src.match(/(\d+).png/)[1];
    return ["", "mirage", "blazing", "glacier", "electric", "earth", "bright", "abyss"][index];
}

/* Skill Assignment (for getDigimonInfo) */
function skillTribe(src) {
    var match = src.match(/\/([^\/]*).png/)[1];
    var index = ["Null", "Fire", "Water", "Thunder", "Nature", "Light", "Darkness"].indexOf(match);
    if (index < 0) {
        index = ["-", "Fire", "Water", "Electric", "Earth", "Light", "Darkness"].indexOf(match);
    }
    return ["mirage", "blazing", "glacier", "electric", "earth", "bright", "abyss"][index];
}
function skillType(mon, text) {
    var lower = text.toLowerCase();
    if (lower.includes("all enem") || mon.name == "omegamon-x") { // delete omegamon-x condition when he arrives
        return 2;
    }
    else if (lower.includes("single enem") || lower.includes("no signature")) {
        return 1;
    }
    else if (lower.includes("ally") || lower.includes("counter") || lower.includes("deflect") || lower.includes("invalidate")) {
        return 0;
    }
    else {
        warning("No skill type found for " + mon.name + ".");
        return -1;
    }
}
function skillTier(mon, type, tables) { /* NOTE: getting tier by using type as an identifier is erroneous (e.g. examon) */
    var table = tables[tables.length - 1];
    if (table) {
        var cells = table.rows[(type + 2) % 3].cells;
        var tier = cells[cells.length - 1].innerText;
        if (!tier.toLowerCase().includes("digi")) {
            return tier;
        }
    }
    warning("No skill tier found for " + mon.name + ".");
    return "";
}
function skillset(mon, content, released) {
    var skills = [];
    for (var i = 1; i < 3; i++) {
        var id = "#move" + i + "box";
        if (content.querySelector(id)) {
            var skill = [];
            var tribe = skillTribe(content.querySelectorAll(id + " .movedesc td > *")[0].src);
            skill.push(tribe);
            var type = skillType(mon, content.querySelectorAll(id + " .movedesc td > *")[1].innerHTML);
            skill.push(type);
            if (mon.evol == "mega" && released && mon.name != "lucemon-sm") {
                var tier = skillTier(mon, type, content.querySelectorAll("table"));
                if (tier != "") {
                    skill.push(tier);
                }
            }
            skills.push(skill);
        }
    }
    return skills;
}

/* Digimon Object Builder (for getDigimonInfo) */
function newDigimon(mon, content) {
    var name = content.getElementsByClassName("digiTopper")[0].children[1].innerHTML; // unused for now
    var evol = mon.evol;
    var dvol = Array.from(
        content.getElementsByClassName("dvolveTable")[0].rows[0].cells[2].getElementsByTagName("a")
    ).map(function (a) {
        return a.href.split("/")[4];
    });
    var tribe = mon.tribe;
    var released = content.getElementsByClassName("digidesc")[0].innerText.toLowerCase().includes("to be released") ? 0 : 1;
    var skills = skillset(mon, content, released);
    return {
        "name": name,
        "evol": evol,
        "dvol": dvol,
        "tribe": tribe,
        "released": released,
        "skills": skills
    };
}

/* Digivolution Tree */
function getDigimonInfo() {
    var digi = {};
    var mons = Array.from(document.getElementsByClassName("blockListEl")).map(function (blockListEl) {
        return {
            "name": blockListEl.getElementsByTagName("a")[0].href.split("/")[4],
            "evol": blockListEl.getElementsByClassName("blockListStage")[0].innerHTML.toLowerCase().replace(/ /g, "-"),
            "tribe": tribeFromSrc(blockListEl.getElementsByClassName("blockListType")[0].src)
        };
    }).filter(function (mon) {
        return !mon.name.endsWith("-mutant");
    });
    var monsRegistered = [];
    mons.forEach(function (mon) {
        var xhr = new XMLHttpRequest();
        xhr.open("GET", "http://growlmon.net/digimon/" + mon.name, true);
        xhr.onload = function () {
            if (this.readyState == 4 && this.status == 200) {
                var content = document.createElement("div");
                content.innerHTML = this.response;
                digi[mon.name] = newDigimon(mon, content);
                console.log("Digimon [" + mon.name + "] has been successfully registered.");
            }
            else {
                error("Digimon [" + mon.name + "] could not be registered.")
            }
            monsRegistered.push(mon.name);
            if (mons.length == monsRegistered.length) {
                digi["belphemon-rm"].dvol.push("belphemon-sm"); // delete if growlmon ever fixes this
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
} // add lavorvomon-spd-atk and put output into root folder

/* NOTE: THE FOLLOWING METHOD NO LONGER WORK. */
/* Using an autoclicker to rapidly download images must have been marked as a security flaw or something. :( */

/* Digimon Thumbnails */
function getDigimonImages(n) { // n = 2 returns nothing; +1 images == +2 images
    var mons = Array.from(document.getElementsByClassName("blockListEl")).map(function (blockListEl) {
        return {
            "name": blockListEl.getElementsByTagName("a")[0].href.split("/")[4],
            "src": blockListEl.getElementsByClassName("blockListIco")[0].src
        };
    }).filter(function (mon) {
        return !mon.name.endsWith("-mutant");
    });
    mons.forEach(function (mon) {
        var a = document.createElement("a");
        a.href = mon.src.replace(/-0/g, "-" + n);
        a.setAttribute("download", mon.name);
        a.click();
    });
} // resize to 64x64 and put into root/mon folder

/* Tribe Thumbnails */
function getTribeImages() {
    var tribes = new Set(
        Array.from(document.getElementsByClassName("blockListType")).map(function (blockListType) {
            return blockListType.src;
        })
    );
    tribes.forEach(function (src) {
        var a = document.createElement("a");
        a.href = src;
        a.setAttribute("download", tribeFromSrc(src));
        a.click();
    });
} // resize to 32x32 and put into root/tribe folder
