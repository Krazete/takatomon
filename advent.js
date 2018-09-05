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
                        photo.src = "img/mon/" + settings.awkn + "/" + mon + ".png";
                    viewer.appendChild(photo);
                }
                addTapListener(viewer, viewEntry);
            entry.appendChild(viewer);
            var note = document.createElement("input");
                note.className = "note";
                note.value = plans[i].note;
                note.addEventListener("input", editNote);
            entry.appendChild(note);
            var include = document.createElement("div");
                include.className = "include";
            entry.appendChild(include);
            var edit = document.createElement("div");
                edit.className = "edit";
            entry.appendChild(edit);
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
        selectedDigi = new Set(plans[this.parentNode.dataset.i].digi);
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
