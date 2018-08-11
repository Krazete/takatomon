"use strict";
/* this script relies on digi.js */

function Tree(root) {
    this.root = root;
    this.nodes = new Set();
    this.JSONedges = new Set(); // identical arrays aren't equal, so stringify them
    if (typeof root != "undefined") {
        // pointers for initialization
        var nodes = this.nodes;
        var JSONedges = this.JSONedges;
        // initialization
        nodes.add(root);
        function next(mon) {
            return digi[mon].next;
        }
        function prev(mon) {
            if (typeof(digi[mon].prev) == "undefined") { // memoization
                var prevmons = [];
                for (var prevmon in digi) {
                    if (next(prevmon).includes(mon)) {
                        prevmons.push(prevmon);
                    }
                }
                digi[mon].prev = prevmons;
            }
            return digi[mon].prev;
        }
        function init(mon, direction) {
            if (direction < 1) {
                for (var prevmon of prev(mon)) {
                    nodes.add(prevmon);
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
                    nodes.add(nextmon);
                    var edge = [mon, nextmon];
                    var JSONedge = JSON.stringify(edge);
                    if (!JSONedges.has(JSONedge)) {
                        JSONedges.add(JSONedge);
                        init(nextmon, 1);
                    }
                }
            }
        }
        init(root, 0);
    }
}
Tree.prototype.forEachEdge = function (f) {
    for (var JSONedge of this.JSONedges) {
        var edge = JSON.parse(JSONedge);
        f(edge, JSONedge);
    }
};
Tree.prototype.sortedLeaves = function () {
    return true; // TODO: this
};

function Gemel(roots) {
    this.roots = new Set(roots);
    this.trees = new Set();
    for (var root of roots) {
        if (typeof(digi[root].tree) == "undefined") { // memoization
            digi[root].tree = new Tree(root);
        };
        this.trees.add(digi[root].tree);
    }
}
Gemel.prototype.union = function () {
    var unionTree = new Tree();
    for (var tree of this.trees) {
        tree.forEachEdge(function (edge, JSONedge) {
            unionTree.nodes.add(edge[0]);
            unionTree.nodes.add(edge[1]);
            unionTree.JSONedges.add(JSONedge);
        });
    }
    return unionTree;
};
Gemel.prototype.intersection = function () {
    var intersectionTree = new Tree();
    intersectionTree.nodes = new Set(Object.keys(digi));
    for (var tree of this.trees) {
        for (var node of intersectionTree.nodes) {
            if (!tree.nodes.has(node) && !this.roots.has(node)) {
                intersectionTree.nodes.delete(node);
            }
        }
    }
    for (var tree of this.trees) {
        tree.forEachEdge(function (edge, JSONedge) {
            if (intersectionTree.nodes.has(edge[0]) && intersectionTree.nodes.has(edge[1])) {
                intersectionTree.JSONedges.add(JSONedge);
            }
        });
    }
    return intersectionTree;
};
