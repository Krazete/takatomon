window.addEventListener("mousemove", function(e) {
	for (var i = 0, tile; tile = document.getElementsByClassName("tile")[i]; i++) {
		var tilebox = tile.getBoundingClientRect();
		var tilex = (tilebox.left + tilebox.right) / 2;
		var tiley = (tilebox.top + tilebox.bottom) / 2;
		var x = (e.clientX - tilex) / innerWidth;
		var y = (e.clientY - tiley) / innerHeight;
		var wha = Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2));
		tile.style.transform = "translateZ(" + -100 * wha + "px) rotateX(" + -(90 * y) + "deg) rotateY(" + (90 * x) + "deg) rotateZ(" + (90 * x * y) + "deg)";
		tile.style.transformOrigin = "50% 50% " + -100 * wha + "px";
	}
});
