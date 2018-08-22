function next(mon) {
	return digi[mon].next;
}
function prev(mon) {
	if (typeof(digi[mon].prev) == "undefined") { // memoization
		var prevmons = [];
		for (prevmon in digi) {
			if (next(prevmon).includes(mon)) {
				prevmons.push(prevmon);
			}
		}
		digi[mon].prev = prevmons;
	}
	return digi[mon].prev;
}
var visited = new Set();
function dfs(mon) {
	if (!visited.has(mon)) {
		visited.add(mon);
		console.log(mon);
		for (var prevmon of prev(mon)) {
			if (!digi[prevmon].profile.classList.contains("hidden")) { // skip hidden profiles for efficiency
				dfs(prevmon);
			}
		}
		for (var nextmon of next(mon)) {
			if (!digi[nextmon].profile.classList.contains("hidden")) { // skip hidden profiles for efficiency
				dfs(nextmon);
			}
		}
		// var train = getTrain(digi[mon].evol);
		// train.appendChild(digi[mon].profile);
	}
}
for (var root in digi) {
	if (digi[root].evol == "in-training-i" && !digi[root].profile.classList.contains("hidden")) {
		console.log(root);
		dfs(root);
	}
}
for (var mon of visited) {
	console.log(mon);
	// var train = getTrain(digi[mon].evol);
	// train.appendChild(digi[mon].profile);
	digi[mon].profile.parentNode.appendChild(digi[mon].profile);
}
update();
