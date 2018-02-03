/* run on http://growlmon.net/digivolvetree */

/* Digivolution Tree */
function getDigimonInfo() {
    var digi = {};
    var mons = Array.from(document.getElementsByClassName("blockListEl")).map(function (blockListEl) {
        return {
            "name": blockListEl.getElementsByTagName("a")[0].href.split("/")[4],
            "evol": blockListEl.getElementsByClassName("blockListStage")[0].innerHTML.toLowerCase().replace(/ /g, "-")
        };
    }).filter(function (mon) {
        return !mon.name.endsWith("-mutant");
    });
    var monsRegistered = [];
    mons.forEach(function (mon) {
        var xhr = new XMLHttpRequest();
        xhr.open("GET", "http://growlmon.net/digimon/" + mon.name, true);
        xhr.onload = function () {
            var content = document.createElement("div");
            content.innerHTML = this.response;
            digi[mon.name] = {
                "evol": mon.evol,
                "dvol": Array.from(
                    content.getElementsByClassName("dvolveTable")[0].rows[0].cells[2].getElementsByTagName("a")
                ).map(function (a) {
                    return a.href.split("/")[4];
                })
            };
            monsRegistered.push(mon.name);
            console.log("Digimon [" + mon.name + "] has been successfully registered.");
            if (mons.length == monsRegistered.length) {
                digi["belphemon-rm"].dvol.push("belphemon-sm"); // delete if growlmon.net ever fixes this
                var prettyJSON = "{\n\t" +
                    JSON.stringify(digi)
                    .slice(1, -2).split("},").sort().join("},\n\t")
                    .replace(/:/g, ": ").replace(/,/g, ", ") +
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
} // put output into digi folder

/* Digimon Thumbnails */
function getDigimonImages() {
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
        a.href = mon.src;
        a.setAttribute("download", mon.name);
        a.click();
    });
} // resize to 64x64 and put into digi folder

/* Tribe Thumbnails */
function getTribeImages() {
    var tribes = new Set(
        Array.from(document.getElementsByClassName("blockListType")).map(function (blockListType) {
            return blockListType.src;
        })
    );
    tribes.forEach(function (tribe) {
        var a = document.createElement("a");
        a.href = tribe;
        a.setAttribute("download", "");
        a.click();
    });
} // resize to 32x32 and put into digi folder
