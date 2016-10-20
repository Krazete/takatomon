for (var depth = 0; document.querySelector("body" + " > *".repeat(depth)); depth++);
	
var gap = 64;

document.body.parentNode.appendChild(document.createElement("style")).innerHTML = "\
* {transform: translateZ(" + gap / depth + "px);}\
*:hover {transform: translateZ(" + 2 * gap / depth + "px);}\
";

window.addEventListener("mousemove", function(e) {
	var x = Math.cos(Math.PI * e.clientY / innerHeight) * Math.PI / 64;
	var y = -Math.cos(Math.PI * e.clientX / innerWidth) * Math.PI / 64;
	document.body.style.transform = "perspective(" + 1024 + "px) translateZ(-" + gap + "px) rotateX(" + x + "rad) rotateY(" + y + "rad)";
});

window.addEventListener("scroll", function(e) {
	document.body.style.transformOrigin = (innerWidth / 2 + pageXOffset) + "px " + (innerHeight / 2 + pageYOffset) + "px";
});
