var canvas = document.createElement("canvas");
var context = canvas.getContext("2d");
document.body.appendChild(canvas);

function exportPlanner() {
    var chars = localStorage.planner;
    var codes = [];
    for (var i = 0; i < chars.length; i++) {
        var code = chars.charCodeAt(i);
        if (code < 255) {
            codes.push(code);
        }
        else {
            var multiplier = Math.floor(code / 256)
            codes.push(255);
            codes.push(multiplier);
            codes.push(code - 256 * multiplier);
        }
    }
    var size = Math.ceil(Math.sqrt(codes.length / 3));
    while (codes.length < 3 * Math.pow(size, 2)) {
    	codes.push(0);
    }

    canvas.width = size;
    canvas.height = size;
    var imageData = context.createImageData(size, size);
    var d = 0;
    for (var i = 0; i < Math.pow(size, 2) * 4; i++) {
    	imageData.data[i] = codes[i - d];
    	if (!((i + 1) % 4)) {
    		imageData.data[i] = 255;
            d++;
        }
    }
    context.putImageData(imageData, 0, 0);

    return {codes:codes, chars:chars};
}

function importPlanner() {
    function skipAlpha(value, index) {
        return (index + 1) % 4;
    }

    var imageData = context.getImageData(0, 0, canvas.width, canvas.height);
    var data = Array.from(imageData.data);
    var codes = data.filter(skipAlpha);
    var chars = "";
    for (var i = 0; i < codes.length; i++) {
        if (codes[i] < 255) {
            if (codes[i] > 0) {
                chars += String.fromCharCode(codes[i]);
            }
        }
        else {
            var code = 256 * codes[i + 1] + codes[i + 2];
            chars += String.fromCharCode(code);
            i += 2;
        }
    }

    return {codes:codes, chars:chars};
}

var exported = exportPlanner();
var imported = importPlanner();

var k = [0, 0, 0, [], []];
for (var i = 0; i < exported.codes.length; i++) {
    if (exported.codes[i] != imported.codes[i]) {
        k[i % 3] += 1;
        k[3].push(getChar(exported.codes[i]));
        k[4].push(getChar(imported.codes[i]));
    }
}
console.log(k);
console.log(exported.chars == imported.chars);
