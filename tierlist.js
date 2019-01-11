var userIP, userID;

function setIP(json) {
    userIP = json.ip;
}

var config = {
    apiKey: "AIzaSyCDLf7DOm_cv8AQfMg_1O-3-OGXHYyOtTs",
    authDomain: "takatomon-tierlist.firebaseapp.com",
    databaseURL: "https://takatomon-tierlist.firebaseio.com",
    projectId: "takatomon-tierlist",
    storageBucket: "takatomon-tierlist.appspot.com",
    messagingSenderId: "58653453526"
};
firebase.initializeApp(config);

firebase.auth().onAuthStateChanged(function (user) {
    if (user) {
        var isAnonymous = user.isAnonymous;
        userID = user.uid;
        console.log("Authentication issued.")
    } else {
        console.log("Authentication revoked.")
    }
});
firebase.auth().signInAnonymously().catch(function (error) {
    var errorCode = error.code;
    var errorMessage = error.message;
    console.log(error.code, error.message);
});

database = firebase.database();

function rate() {
    var mon = this.parentElement.parentElement.id;
    var value = parseInt(this.dataset.value);
    firebase.database().ref([
        mon,
        userID
    ].join("/")).set({
        "ip": userIP,
        "vote": value
    });
    updateRating(mon);
}

function updateRating(mon) {
    var row = document.getElementById(mon);
    var cell = row.cells[2];

    try {
        firebase.database().ref(mon).once('value').then(function (snapshot) {
            var snapshot = snapshot.val();
            var total = 0;
            var weightedCount = 0;
            var count = 0;
            var userVote;
            var ipVotes = {};
            for (var id in snapshot) {
                if (snapshot[id].ip in ipVotes) {
                    ipVotes[snapshot[id].ip].subtotal += snapshot[id].vote;
                    ipVotes[snapshot[id].ip].subcount++;
                }
                else {
                    ipVotes[snapshot[id].ip] = {
                        "subtotal": snapshot[id].vote,
                        "subcount": 1
                    }
                }
                count++;
                if (id == userID) {
                    userVote = snapshot[id].vote;
                }
            }
            for (var ip in ipVotes) {
                var weight = Math.log(Math.E * ipVotes[ip].subcount);
                var subvote = ipVotes[ip].subtotal / ipVotes[ip].subcount;
                total += subvote * weight;
                weightedCount += weight;
            }
            if (userVote >= 0) {
                var passed = false;
                for (var star of cell.children) {
                    if (passed) {
                        star.classList.remove("underlined");
                    }
                    else {
                        star.classList.add("underlined");
                    }
                    if (star.dataset.value == userVote) {
                        passed = true;
                    }
                }
            }
            var passed = count <= 0;
            var ratio = total / weightedCount;
            var clip = (ratio % 1) * 100;
            for (var star of cell.children) {
                if (passed) {
                    star.children[1].style.opacity = 0;
                }
                else {
                    star.children[1].style = "";
                }
                if (star.dataset.value == Math.floor(ratio) + 1) {
                    passed = true;
                    if (clip > 0) {
                        star.children[1].style = [
                            "-webkit-clip-path: polygon(0 0, " + clip + "% 0, " + clip + "% 100%, 0 100%)",
                            "clip-path: polygon(0 0, " + clip + "% 0, " + clip + "% 100%, 0 100%)"
                        ].join(";");
                    }
                    else {
                        star.children[1].style.opacity = 0;
                    }
                }
            }
            row.dataset.value = ratio || 0;
            row.dataset.count = count;
        });
    }
    catch (e) {
        console.log(e);
    }
}

function insertMoniker(cell, mon) {
    for (var i in digi[mon].name) {
        var moniker = document.createElement("div");
        moniker.innerHTML = digi[mon].name[i];
        cell.appendChild(moniker);
    }
}

function insertPortrait(cell, mon) {
    for (var i of digi[mon].images) {
        var img = document.createElement("img");
        img.width = 24;
        img.src = "img/portrait/" + i + ".png";
        cell.appendChild(img);
    }
}

function insertStars(cell, mon) {
    for (var i = 0; i < 5; i++) {
        var star = document.createElement("span");
        star.className = "star";
        star.dataset.value = i;

        var shadow = document.createElement("img");
        shadow.className = "shadow";
        shadow.src = "img/birdramon.png";
        star.appendChild(shadow);

        var light = document.createElement("img");
        light.className = "light";
        light.src = "img/birdramon.png";
        star.appendChild(light);

        star.addEventListener("click", rate);
        cell.appendChild(star);
    }
}

function initTierlist() {
    var table = document.createElement("table");
    document.body.appendChild(table);
    for (var mon in digi) {
        if (digi[mon].evol >= 5) {
            var row = table.insertRow();
            row.id = mon;
            var cell0 = row.insertCell();
            insertMoniker(cell0, mon);
            var cell1 = row.insertCell();
            insertPortrait(cell1, mon);
            var cell2 = row.insertCell();
            insertStars(cell2, mon);
            updateRating(mon)
        }
    }
}

window.addEventListener("DOMContentLoaded", initTierlist)
