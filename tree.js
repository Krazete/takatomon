"use strict";
/* this script relies on digi.js */

function next(mon) {
    return digi[mon].next;
}

function prev(mon) {
    if (typeof digi[mon].prev == "undefined") { // memoization
        digi[mon].prev = [];
        for (var prevmon in digi) {
            if (next(prevmon).includes(mon)) {
                digi[mon].prev.push(parseInt(prevmon));
            }
        }
    }
    return digi[mon].prev;
}

function Gemel(roots) { // gemels are unions of trees
    if (typeof roots == "string" || typeof roots == "number") { // single-root gemels are just trees
        if (typeof digi[roots].tree == "undefined") { // memoization
            roots = [roots];
        }
        else {
            return digi[roots].tree;
        }
    }
    if (typeof roots != "undefined") {
        var parsedRoots = [];
        for (var root of roots) {
            parsedRoots.push(parseInt(root));
        }
    }
    this.roots = new Set(parsedRoots);
    this.nodes = new Set();
    this.JSONedges = new Set(); // stringify edges because [] != [] but "" == ""

    function init(mon, direction) {
        nodes.add(mon);
        if (direction < 1) {
            for (var prevmon of prev(mon)) {
                var edge = [prevmon, mon];
                var JSONedge = JSON.stringify(edge);
                if (!JSONedges.has(JSONedge)) {
                    JSONedges.add(JSONedge);
                    init(prevmon, -1);
                }
            }
        }
        if (direction > -1) {
            for (var nextmon of next(mon)) {
                var edge = [mon, nextmon];
                var JSONedge = JSON.stringify(edge);
                if (!JSONedges.has(JSONedge)) {
                    JSONedges.add(JSONedge);
                    init(nextmon, 1);
                }
            }
        }
    }
    if (typeof roots == "object") {
        // pointers for initialization
        var nodes = this.nodes;
        var JSONedges = this.JSONedges;
        // initialization
        for (var root of roots) {
            init(parseInt(root), 0);
        }
    }
    if (this.roots.size == 1) { // memoization
        for (var root of this.roots) {
            digi[root].tree = this;
        }
    }
}
Gemel.prototype.forEachEdge = function (f) {
    for (var JSONedge of this.JSONedges) {
        var edge = JSON.parse(JSONedge);
        f(edge, JSONedge);
    }
};
Gemel.prototype.clone = function () {
    var clone = new Gemel();
    clone.roots = new Set(this.roots);
    clone.nodes = new Set(this.nodes);
    clone.JSONedges = new Set(this.JSONedges);
    return clone;
}
Gemel.prototype.intersect = function (that) {
    for (var root of this.roots) {
        if (!that.roots.has(root)) {
            this.roots.delete(root);
        }
    }
    for (var node of this.nodes) {
        if (!that.nodes.has(node)) {
            this.nodes.delete(node);
        }
    }
    for (var JSONedge of this.JSONedges) {
        if (!that.JSONedges.has(JSONedge)) {
            this.JSONedges.delete(JSONedge);
        }
    }
};
Gemel.prototype.intersection = function () {
    var clone = this.clone();
    for (var root of this.roots) {
        var tree = new Gemel(root);
        clone.intersect(tree);
    }
    for (var root of this.roots) {
        clone.roots.add(root);
        clone.nodes.add(root);
    }
    this.forEachEdge(function (edge, JSONedge) {
        if (clone.nodes.has(edge[0]) && clone.nodes.has(edge[1])) {
            clone.JSONedges.add(JSONedge);
        }
    });
    return clone;
};
