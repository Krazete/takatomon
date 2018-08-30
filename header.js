/* [meat, plugin1, plugin2, plugin3, plugin4, fragments, clusters, pluginV2] */
function meat(awkn, evol) {
    switch (awkn) {
        case 0: switch (evol) {
            case "rookie": return 23;
            case "champion": return 229;
            case "ultimate": return 786;
            case "mega": return 1763;
        };
        case 1:
        case 2: switch (evol) {
            case "rookie": return 52;
            case "champion": return 333;
            case "ultimate": return 995;
            case "mega": return 2070;
        };
        case 3:
        case 4: switch (evol) {
            case "rookie": return 90;
            case "champion": return 454;
            case "ultimate": return 1227;
            case "mega": return 2419;
        };
        case 5: return 10000000000000;
    };
    return -1;
}
function plugins(awkn, evol) {
    switch (awkn) {
        case 0:
        default:
    }
}










var plugins = [
    {
        "champion": [8, 3, 0, 0],
        "ultimate": [24, 20, 7, 6],
        "mega": [0, 0, 20, 17]
    },
    {
        "champion": [12, 5, 0, 0],
        "ultimate": [36, 30, 11, 9],
        "mega": [0, 0, 30, 26]
    },
    {
        "champion": [16, 6, 0, 0],
        "ultimate": [48, 40, 14, 12],
        "mega": [0, 0, 40, 34]
    },
    {
        "champion": [24, 9, 0, 0],
        "ultimate": [72, 60, 21, 18],
        "mega": [0, 0, 60, 51]
    },
    {
        "champion": [24, 9, 0, 0],
        "ultimate": [72, 60, 21, 18],
        "mega": [0, 0, 60, 51]
    },
    {
        "mega": [0, 0, 100, 85]
    }
];

var gem = [gemelCore, gemel][settings.tree];
var evols = ["in-training-i", "in-training-ii", "rookie", "champion", "ultimate", "mega"];
var youngestIndex = 5;
var oldestIndex = 0;
var oldestMega = "";
for (var root of gem.roots) {
    var evol = digi[root].evol;
    var evol = evols.indexOf(evol);
    if (evol < youngestIndex) {
        youngestIndex = evol;
    }
    if (evol > oldestIndex) {
        oldestIndex = evol;
    }
    if (evol == "mega") {
        if (oldestMega == "") {
            oldestMega = root;
        }
        else if (oldestMega != root) {
            var oldestMegaTree = new Gemel(oldestMega);
            if (root in tree.nodes) {
                var rootTree = new Gemel(root);
                if (rootTree.nodes.size > oldestMegaTree.nodes.size) {
                    oldestMega = root;
                }
            }
            else {
                console.log("Please alter your selection to eliminate conflicting megas.");
                return false;
            }
        }
    }
}
var selectedEvols = evols.slice(youngestIndex + 1, oldestIndex + 1);

var selectedTribe = {
    "in-training-i": "",
    "in-training-ii": "",
    "rookie": "",
    "champion": "",
    "ultimate": "",
    "mega": ""
};
for (var node of gem.nodes) {
    var evol = digi[node].evol;
    if (selectedEvols.includes(evol)) {
        var tribe = digi[node].tribe;
        if (selectedTribe[evol] == "") {
            selectedTribe[evol] = tribe;
        }
        else if (selectedTribe[evol] != tribe) {
            console.log("Please alter your selection to eliminate conflicting tribes.");
            return false;
        }
    }
}

var selectedPlugins = [0, 0, 0, 0];
for (var evol of selectedEvols) {
    var pluginCosts = plugins[settings.awkn];
    if (evol in pluginCosts) {
        for (var i = 0; i < 4; i++) {
            selectedPlugins[i] += pluginCosts[evol][i];
        }
    }
}
header.innerHTML = selectedPlugins;










functino getFragments(mon) {
    var fragments = [mon];
    for (prevmon in prev(mon)) {
        if (digi[prevmon].evol == "mega" || prevmon in special) {
            fragments.push(mon);
            getFragments(prevmon);
        }
    }
    return mon;
}

if (oldestMega != "") {
    var x = getFragments();
}

x;
