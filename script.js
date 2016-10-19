var box = document.getElementsByClassName("box")[0];

function cx(n) {
	return Math.cos(2 * Math.PI * n);
}

function cz(n) {
	return -Math.sin(2 * Math.PI * n);
}

function cr(n) {
	return 2 * Math.PI * (n + 0.25);
}

function animate(n){
	if (n < 0.5)
		box.innerHTML = "CELIS";
	else
		box.innerHTML = "TED";
	//var c = 2 * Math.sin(2 * Math.PI * n);
	//box.style.filter = "blur(" + c + "px)";
	box.style.transform = "translate(-50%, -50%) translate3d(" + cx(n) * 512 + "px, 0px, " + cz(n) * 512 + "px) rotateY(" + cr(n) + "rad)";
	requestAnimationFrame(function() {
		animate((n + 0.001) % 1)
	});
}

animate(0);
