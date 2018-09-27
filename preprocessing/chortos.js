// https://chortos.selfip.net/digimonlinks/monsters/

var monTitles = {};
for (var img of document.getElementsByTagName("img")) {
    var anchor = img.parentNode;
	var title = anchor.title;
	var hrefParts = anchor.href.split("/");
	var number = parseInt(hrefParts[hrefParts.length - 1]);
	monTitles[number] = title;
}
JSON.stringify(monTitles); // copy result

// https://chortos.selfip.net/digimonlinkz/monsters/

var monTitles = JSON.parse(pasted); // paste result
monTitles[240] = "Rapidmon (Gold)"; // because it's originally just Rapidmon
monTitles[292] = "Gumdramon";
monTitles[293] = "Arresterdramon";
monTitles[335] = "Omegamon X";
monTitles[341] = "Dynasmon X";
monTitles[343] = "Beelzemon X";
monTitles[346] = "Omegamon Alter S";
monTitles[347] = "Leopardmon X";
monTitles[347] = "Gumdramon";
// monTitles[6060] = "Creepymon (Mutant)";
// monTitles[6072] = "Belphemon SM (Mutant)";
// monTitles[6066] = "Lilithmon (Mutant)";
// monTitles[6073] = "Belphemon RM (Mutant)";
// monTitles[6078] = "Lucemon SM (Mutant)";
monTitles[285] = "KingSukamon";
monTitles[294] = "Pandamon";
monTitles[284] = "Jijimon";
monTitles[384] = "Cranimon X";
for (var img of document.getElementsByTagName("img")) {
    var anchor = img.parentNode;
    var title = anchor.title;
    var hrefParts = anchor.href.split("/");
    var number = parseInt(hrefParts[hrefParts.length - 1]);
    if (number in monTitles) {
        anchor.title = monTitles[number];
    }
    else {
        console.log(number, title, anchor);
    }
}

for (var img of document.getElementsByTagName("img")) {
    var anchor = img.parentNode;
    var name = anchor.title.toLowerCase()
        .replace(/\W+|special|anti|body/g, " ").trim().replace(/\s+/g, "-")
    	.replace(/s-/g, "s").replace("b-", "black").replace("super-versatile", "bal").replace("omni", "omega-")
    	.replace("enhanced-atk", "orange").replace("enhanced-def", "green").replace("balance", "white").replace("speed", "blue");
	var hrefParts = anchor.href.split("/");
	var number = parseInt(hrefParts[hrefParts.length - 1]);
    if (number in monTitles) {
        if (name in digi) {
            if (typeof digi[name].tempID == "undefined") {
                digi[name].tempID = number;
            }
            else {
                // console.log("Duplicate Digimon " + name + " found with numbers " + digi[name].tempID + " and " + number + ".");
            }
        }
        else {
            if (!(name.includes("mutant") || name.includes("digiegg"))) {
                console.log("Digimon " + name + " does not exist in digi.js.");
            }
        }
    }
    else {
        // console.log("Number " + number + " does not exist in monTitles.");
    }
}

for (var mon in digi) {
    var newNext = [];
    for (var nextmon of digi[mon].next) {
        newNext.push(digi[nextmon].tempID);
    }
    digi[mon].next = newNext;
}

JSON.stringify(digi);
