/* run on http://growlmon.net/digivolvetree */

/* Digivolution Tree */
var digi = {};
var mons = Array.from(document.getElementsByClassName("blockListEl")).map(function (blockListEl) {
    return {
        "name": blockListEl.getElementsByTagName("a")[0].href.split("/")[4],
        "evol": blockListEl.getElementsByClassName("blockListStage")[0].innerHTML.toLowerCase().replace(/ /g, "-")
    };
});
mons.forEach(function (mon) {
    var monsRegistered = [];
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
            console.log(JSON.stringify(digi));
        }
    };
    xhr.send();
});

// run after the above process is complete
var a = document.createElement("a");
a.href = "data:application/json;charset=utf-8," + encodeURIComponent(JSON.stringify(digi));
a.setAttribute("download", "digi");
a.click();
// copy and paste output into digi.js

/* Digimon Thumbnails */
var digi = {};
var mons = Array.from(document.getElementsByClassName("blockListEl")).map(function (blockListEl) {
    return {
        "name": blockListEl.getElementsByTagName("a")[0].href.split("/")[4],
        "src": blockListEl.getElementsByClassName("blockListIco")[0].src
    };
});
mons.forEach(function (mon) {
    var a = document.createElement("a");
    a.href = mon.src;
    a.setAttribute("download", mon.name);
    a.click();
});
// reduce image size to 64x64 and put into img folder
