function factorial(n) {
	var m = n;
	for (var i = 1; i < n; i++)
		m *= i;
	return m;
}
function combination(n, k) {
	if (k == 0 || k == n)
		return 1;
	return factorial(n) / (factorial(k) * factorial(n - k));
}
function integral(f, a, b, epsilon) {
	if (epsilon > 0) {
		var c = 0;
		for (var i = a; i < b; i += epsilon)
			c += f(i) * epsilon;
		return c;
	}
	return NaN;
}
function Gamma(n) {
	return 0;
}
function Beta(n) {
	return 0;
}
var bernoulli = {
	"mass": function(p, i) {return i ? p : (1 - p)},
	"expectation": function(p) {return p},
	"variance": function(p) {return p * (1 - p)},
	"canvas": document.getElementById("bernoulli").getContext("2d"),
	"draw": function(p) {
		var w = 75;
		var e = this.expectation(p);
		var v = this.variance(p);
		this.canvas.fillRect((e + 0.5) * w, 0, 1, 150);
		this.canvas.fillRect((e + 0.5 - v) * w, 100, 1, 150);
		this.canvas.fillRect((e + 0.5 + v) * w, 100, 1, 150);
		for (var i = 0; i < 2; i++) {
			var m = this.mass(p, i);
			this.canvas.strokeRect(i * w, 150 * (1 - m), w, 150 * m);
		}
	}
};
var binomial = {
	"mass": function(n, p, i) {return combination(n, i) * Math.pow(p, i) * Math.pow(1 - p, n - i)},
	"expectation": function(n, p) {return n * p},
	"variance": function(n, p) {return n * p * (1 - p)},
	"canvas": document.getElementById("binomial").getContext("2d"),
	"draw": function(n, p) {
		var w = 150 / (n + 1); // width of each bar (canvas width / number of bars)
		var e = this.expectation(n, p);
		var v = this.variance(n, p);
		this.canvas.fillRect((e + 0.5) * w, 0, 1, 150); // expectation line
		this.canvas.fillRect((e + 0.5 - v) * w, 100, 1, 150); // left variance line
		this.canvas.fillRect((e + 0.5 + v) * w, 100, 1, 150); // right variance line
		for (var i = 0; i < n + 1; i++) { // probabilities
			var m = this.mass(n, p, i);
			this.canvas.strokeRect(i * w, 150 * (1 - m), w, 150 * m);
		}
	}
};
var geometric = {
	"mass": function(p, i) {return p * Math.pow(1 - p, i - 1)},
	"expectation": function(p) {return 1 / p},
	"variance": function(p) {return (1 - p) / Math.pow(p, 2)},
	"canvas": document.getElementById("geometric").getContext("2d"),
	"draw": function(p) {
		var w = 5;
		var e = this.expectation(p);
		var v = this.variance(p);
		this.canvas.fillRect((e + 0.5) * w, 0, 1, 150);
		this.canvas.fillRect((e + 0.5 - v) * w, 100, 1, 150);
		this.canvas.fillRect((e + 0.5 + v) * w, 100, 1, 150);
		for (var i = 1; i < 30; i++) {
			var m = this.mass(p, i);
			this.canvas.strokeRect(i * w, 150 * (1 - m), w, 150 * m);
		}
	}
};
var negative_binomial = {
	"mass": function(r, p, i) {return combination(i - 1, r - 1) * Math.pow(p, r) * Math.pow(1 - p, i - r)},
	"expectation": function(r, p) {return r / p},
	"variance": function(r, p) {return r * (1 - p) / Math.pow(p, 2)},
	"canvas": document.getElementById("negative_binomial").getContext("2d"),
	"draw": function(r, p) {
		var w = 5;
		var e = this.expectation(r, p);
		var v = this.variance(r, p);
		this.canvas.fillRect((e + 0.5) * w, 0, 1, 150);
		this.canvas.fillRect((e + 0.5 - v) * w, 100, 1, 150);
		this.canvas.fillRect((e + 0.5 + v) * w, 100, 1, 150);
		for (var i = 1; i < 30; i++) {
			var m = this.mass(r, p, i);
			this.canvas.strokeRect(i * w, 150 * (1 - m), w, 150 * m);
		}
	}
};
var poisson = {
	"mass": function(lambda, i) {return Math.pow(Math.E, -lambda) * Math.pow(lambda, i) / factorial(i)},
	"expectation": function(lambda) {return lambda},
	"variance": function(lambda) {return lambda},
	"canvas": document.getElementById("poisson").getContext("2d"),
	"draw": function(lambda) {
		var w = 5;
		var e = this.expectation(lambda);
		var v = this.variance(lambda);
		this.canvas.fillRect((e + 0.5) * w, 0, 1, 150);
		this.canvas.fillRect((e + 0.5 - v) * w, 100, 1, 150);
		this.canvas.fillRect((e + 0.5 + v) * w, 100, 1, 150);
		for (var i = 0; i < 30; i++) {
			var m = this.mass(lambda, i);
			this.canvas.fillRect(i * w, 150 * (1 - m), w, 150 * m);
		}
	}
};
var hypergeometric = {
	"mass": function(N, m, n, i) {return combination(m, i) * combination(N - m, n - i) / combination(N, n)},
	"expectation": function(N, m, n) {return n * (m / N)},
	"variance": function(N, m, n) {return n * (m / N) * (1 - (m / N)) * (N - n) / (N - 1)},
	"canvas": document.getElementById("hypergeometric").getContext("2d"),
	"draw": function(N, m, n) {
		var w = 5;
		var e = this.expectation(N, m, n);
		var v = this.variance(N, m, n);
		this.canvas.fillRect((e + 0.5) * w, 0, 1, 150);
		this.canvas.fillRect((e + 0.5 - v) * w, 100, 1, 150);
		this.canvas.fillRect((e + 0.5 + v) * w, 100, 1, 150);
		for (var i = 0; i < 30; i++) {
			var m = this.mass(N, m, n, i);
			this.canvas.fillRect(i * w, 150 * (1 - m), w, 150 * m);
		}
	}
};
var negative_hypergeometric = {
	"mass": function(n, m, r, k) {return combination(n, r - 1) * combination(m, k - r) * (n - r + 1) / (combination(n + m, k - 1) * (n + m - k + 1))},
	"expectation": function(n, m, r) {return r * (n + m + 1) / (n + 1)},
	"variance": function(n, m, r) {return m * r * (n + 1 - r) * (n + m + 1) / (Math.pow(n + 1, 2) * (n + 2))},
	"canvas": document.getElementById("negative_hypergeometric").getContext("2d"),
	"draw": function(n, m, r) {
		var w = 5;
		var e = this.expectation(n, m, r);
		var v = this.variance(n, m, r);
		this.canvas.fillRect((e + 0.5) * w, 0, 1, 150);
		this.canvas.fillRect((e + 0.5 - v) * w, 100, 1, 150);
		this.canvas.fillRect((e + 0.5 + v) * w, 100, 1, 150);
		for (var i = 0; i < 30; i++) {
			var m = this.mass(n, m, r, i);
			this.canvas.fillRect(i * w, 150 * (1 - m), w, 150 * m);
		}
	}
};
var uniform = {
	"density": function(a, b, x) {return a < x && x < b ? 1 / (b - a) : 0},
	"expectation": function(a, b) {return (a + b) / 2},
	"variance": function(a, b) {return Math.pow(b - a, 2) / 12},
	"canvas": document.getElementById("uniform").getContext("2d"),
	"draw": function(a, b) {
		var e = this.expectation(a, b);
		var v = this.variance(a, b);
		this.canvas.fillRect(e, 0, 1, 150);
		this.canvas.fillRect(e - v, 100, 1, 150);
		this.canvas.fillRect(e + v, 100, 1, 150);
		for (var i = 0; i < 150; i++) {
			var d = this.density(a, b, i);
			this.canvas.fillRect(i, 150 * (1 - d), 1, 150 * d);
		}
	}
};
var normal = {
	"density": function(mu, sigma2, x) {return Math.pow(Math.E, -Math.pow(x - mu, 2) / (2 * sigma2)) / Math.sqrt(2 * Math.PI * sigma2)},
	"expectation": function(mu, sigma2) {return mu},
	"variance": function(mu, sigma2) {return sigma2},
	"canvas": document.getElementById("normal").getContext("2d"),
	"draw": function(mu, sigma2) {
		var e = this.expectation(mu, sigma2);
		var v = this.variance(mu, sigma2);
		this.canvas.fillRect(e, 0, 1, 150);
		this.canvas.fillRect(e - v, 100, 1, 150);
		this.canvas.fillRect(e + v, 100, 1, 150);
		for (var i = 0; i < 150; i++) {
			var d = this.density(mu, sigma2, i);
			this.canvas.fillRect(i, 150 * (1 - d), 1, 150 * d);
		}
	}
};
var exponential = {
	"density": function(lambda, x) {return lambda * Math.pow(Math.E, -(lambda * x))},
	"expectation": function(lambda) {return 1 / lambda},
	"variance": function(lambda) {return 1 / Math.pow(lambda, 2)},
	"canvas": document.getElementById("exponential").getContext("2d"),
	"draw": function(lambda) {
		var e = this.expectation(lambda);
		var v = this.variance(lambda);
		this.canvas.fillRect(e, 0, 1, 150);
		this.canvas.fillRect(e - v, 100, 1, 150);
		this.canvas.fillRect(e + v, 100, 1, 150);
		for (var i = 0; i < 150; i++) {
			var d = this.density(lambda, i);
			this.canvas.fillRect(i, 150 * (1 - d), 1, 150 * d);
		}
	}
};
var gamma = {
	"density": function(alpha, lambda, t) {return lambda * Math.pow(Math.E, -(lambda * t)) * Math.pow(lambda * t, alpha - 1) / Gamma(alpha)},
	"expectation": function(alpha, lambda) {return alpha / lambda},
	"variance": function(alpha, lambda) {return alpha / Math.pow(lambda, 2)},
	"canvas": document.getElementById("gamma").getContext("2d"),
	"draw": function(alpha, lambda) {
		var e = this.expectation(alpha, lambda);
		var v = this.variance(alpha, lambda);
		this.canvas.fillRect(e, 0, 1, 150);
		this.canvas.fillRect(e - v, 100, 1, 150);
		this.canvas.fillRect(e + v, 100, 1, 150);
		for (var i = 0; i < 150; i++) {
			var d = this.density(alpha, lambda, i);
			this.canvas.fillRect(i, 150 * (1 - d), 1, 150 * d);
		}
	}
};
var beta = {
	"density": function(a, b, x) {return Math.pow(x, a - 1) * Math.pow(1 - x, b - 1) / Beta(a, b)},
	"expectation": function(a, b) {return a / (a + b)},
	"variance": function(a, b) {return a * b / (Math.pow(a + b, 2) * (a + b + 1))},
	"canvas": document.getElementById("beta").getContext("2d"),
	"draw": function(a, b) {
		var e = this.expectation(a, b);
		var v = this.variance(a, b);
		this.canvas.fillRect(e, 0, 1, 150);
		this.canvas.fillRect(e - v, 100, 1, 150);
		this.canvas.fillRect(e + v, 100, 1, 150);
		for (var i = 0; i < 150; i++) {
			var d = this.density(a, b, i);
			this.canvas.fillRect(i, 150 * (1 - d), 1, 150 * d);
		}
	}
};
var chi_squared = {
	"density": function(n, x) {return Math.pow(Math.E, -(x / 2)) * Math.pow(x, n / 2 - 1) / (Math.pow(2, n / 2) * Gamma(n / 2))},
	"expectation": function(n, x) {return x},
	"variance": function(n, x) {return 2 * x},
	"canvas": document.getElementById("chi_squared").getContext("2d"),
	"draw": function(n, x) {
		var e = this.expectation(n, x);
		var v = this.variance(n, x);
		this.canvas.fillRect(e, 0, 1, 150);
		this.canvas.fillRect(e - v, 100, 1, 150);
		this.canvas.fillRect(e + v, 100, 1, 150);
		for (var i = 0; i < 150; i++) {
			var d = this.density(n, i);
			this.canvas.fillRect(i, 150 * (1 - d), 1, 150 * d);
		}
	}
};
var cauchy = {
	"density": function(x) {return 1 / (Math.PI * (1 + Math.pow(x, 2)))},
	"expectation": function() {return 0},
	"variance": function() {return Infinity},
	"canvas": document.getElementById("cauchy").getContext("2d"),
	"draw": function() {
		var e = this.expectation();
		var v = this.variance();
		this.canvas.fillRect(e, 0, 1, 150);
		this.canvas.fillRect(e - v, 100, 1, 150);
		this.canvas.fillRect(e + v, 100, 1, 150);
		for (var i = 0; i < 150; i++) {
			var d = this.density(i);
			this.canvas.fillRect(i, 150 * (1 - d), 1, 150 * d);
		}
	}
};
var discrete = [bernoulli, binomial, geometric, negative_binomial, poisson, hypergeometric, negative_hypergeometric];
var continuous = [uniform, normal, exponential, gamma, beta, chi_squared, cauchy];
var distribution = discrete.concat(continuous);
for (var i = 0, e; e = distribution[i]; i++)
	e.canvas.strokeStyle = "#123456";
window.addEventListener("mousemove", function(e) {
	var nMax = 25;
	var n = Math.floor(nMax * e.clientX / innerWidth) + 1;
	var p = 1 - e.clientY / innerHeight;
	var width = 150 / (n + 1);

	for (var i = 0, e; e = distribution[i]; i++)
		e.canvas.clearRect(0, 0, 150, 150);

	bernoulli.draw(p);
	binomial.draw(n, p);
	geometric.draw(p);
	//negative_binomial.draw(n, p);
	poisson.draw(n * p);
	//hypergeometric.draw(n, n * p, p);
	//negative_hypergeometric.draw(Math.floor(n * p), Math.floor(n * (1 - p)), Math.max(1, Math.floor(n / 2)));
	uniform.draw(n * p, n);
	normal.draw(n * p * 6, n * p * (1 - p) * 6);
	exponential.draw(n * p);
	//gamma.draw(n, p);
	//beta.draw(n, p);
	//chi_squared.draw(n);
	//cauchy.draw();
});

var target;

function dragEnd(e) {
	window.removeEventListener("mousemove", drag);
	window.removeEventListener("mouseup", dragEnd);
	document.body.classList.remove("noselect");
}

function drag(e) {
	window.addEventListener("mouseup", dragEnd);
	target.style.left = e.clientX - 10 + "px";
	changeVariable(target);
}

function dragStart(e) {
	target = e.target;
	window.addEventListener("mousemove", drag);
	document.body.classList.add("noselect");
}

for (var i = 0, e; e = document.getElementsByClassName("variable")[i]; i++)
	e.addEventListener("mousedown", dragStart);

function changeVariable(e) {
	console.log(e.id, e.style.left);
}
