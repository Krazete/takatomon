var advent = {
    "boltmon":       [new Date("08-20-2018 02:00:00 PDT"), new Date("09-03-2018 01:59:59 PDT")],
    "metaletemon":   [new Date("08-20-2018 02:00:00 PDT"), new Date("09-03-2018 01:59:59 PDT")],
    "phoenixmon":    [new Date("08-27-2018 02:00:00 PDT"), new Date("09-10-2018 01:59:59 PDT")],
    "magnadramon":   [new Date("08-27-2018 02:00:00 PDT"), new Date("09-10-2018 01:59:59 PDT")],
    "groundlocomon": [new Date("09-03-2018 02:00:00 PDT"), new Date("09-17-2018 01:59:59 PDT")],
    "puppetmon":     [new Date("09-03-2018 02:00:00 PDT"), new Date("09-17-2018 01:59:59 PDT")],
    "kuzuhamon":     [new Date("09-10-2018 02:00:00 PDT"), new Date("09-24-2018 01:59:59 PDT")],
    "princemamemon": [new Date("09-10-2018 02:00:00 PDT"), new Date("09-24-2018 01:59:59 PDT")],
    "saberleomon":   [new Date("09-17-2018 02:00:00 PDT"), new Date("10-01-2018 01:59:59 PDT")],
    "megagargomon":  [new Date("09-17-2018 02:00:00 PDT"), new Date("10-01-2018 01:59:59 PDT")],
    "justimon":      [new Date("09-24-2018 02:00:00 PDT"), new Date("10-08-2018 01:59:59 PDT")],
    "minervamon":    [new Date("09-24-2018 02:00:00 PDT"), new Date("10-08-2018 01:59:59 PDT")],
    "ebemon":        [new Date("10-01-2018 02:00:00 PDT"), new Date("10-15-2018 01:59:59 PDT")],
    "titamon":       [new Date("10-01-2018 02:00:00 PDT"), new Date("10-15-2018 01:59:59 PDT")]
};

function initEntrylist() {
    "use strict";
    var entrylist = document.getElementById("entrylist");
    var entryadd = document.getElementById("entryadd");
    var plans = localStorage.getItem("planner") ? JSON.parse(localStorage.getItem("planner")) : [];

    function addEntry(i) {
        var entry = document.createElement("div");
            entry.className = "entry";
            entry.dataset.i = i;
            var x = document.createElement("div");
                x.className = "x";
                addTapListener(x, deleteEntry);
            entry.appendChild(x);
            var viewer = document.createElement("div");
                viewer.className = "viewer";
                for (var mon of plans[i].digi) {
                    var photo = document.createElement("img");
                        if (plans[i].awkn != 5 || digi[mon].v2) {
                            photo.src = "img/mon/" + [0, 1, 1, 3, 4, 5][plans[i].awkn] + "/" + mon + ".png";
                        }
                        else {
                            photo.src = "img/mon/" + [0, 1, 1, 3, 4, 4][plans[i].awkn] + "/" + mon + ".png";
                        }
                    viewer.appendChild(photo);
                }
                addTapListener(viewer, viewEntry);
            entry.appendChild(viewer);
            var awkn = document.createElement("div");
                awkn.className = "awkn";
                if (plans[i].awkn == 5) {
                    awkn.innerHTML = "+4/V2";
                }
                else {
                    awkn.innerHTML = "+" + plans[i].awkn;
                }
            entry.appendChild(awkn);
            var note = document.createElement("textarea");
                note.className = "note";
                note.placeholder = "Notes";
                note.value = plans[i].note;
                note.addEventListener("input", editNote);
            entry.appendChild(note);
            var handle = document.createElement("div");
                handle.className = "handle";
            entry.appendChild(handle);
        entrylist.appendChild(entry);
    }

    function deleteEntry() {
        var i = parseInt(this.parentNode.dataset.i);
        plans = plans.slice(0, i).concat(plans.slice(i + 1));
        for (var entry of document.getElementsByClassName("entry")) {
            if (entry.dataset.i > i) {
                entry.dataset.i -= 1;
            }
        }
        this.parentNode.remove();
    }

    function viewEntry() {
        var i = this.parentNode.dataset.i;
        selectedDigi = new Set(plans[i].digi);
        var awknSlide = document.getElementById("awkn");
        var x = (plans[i].awkn - settings.awkn + 6) % 6;
        for (var j = 0; j < x; j++) {
            awknSlide.click(); // TODO: change this hacky bullshit
        }
        update();
    }

    function editNote() {
        var message = this.value;
        var i = this.parentNode.dataset.i;
        plans[i].note = message;
    }

    function addSelection() {
        plans.push({
            "digi": Array.from(selectedDigi),
            "awkn": settings.awkn,
            "note": ""
        });
        addEntry(plans.length - 1);
        updateLines();
    }

    for (var i = 0; i < plans.length; i++) {
        addEntry(i);
    }
    addTapListener(entryadd, addSelection);
    window.addEventListener("beforeunload", function () {
        localStorage.setItem("planner", JSON.stringify(plans));
    });
}

window.addEventListener("DOMContentLoaded", initEntrylist);
