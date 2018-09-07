var canvas = document.createElement("canvas");
var context = canvas.getContext("2d");
document.body.appendChild(canvas);

var JSONplans = localStorage.planner;
var codes = Array.from(JSONplans).map(getCode);
var size = Math.ceil(Math.sqrt(codes.length / 3));
var imageData = context.createImageData(size, size);

function getCode(char) {
    return char.charCodeAt(0);
}
function getChar(code) {
    return String.fromCharCode(code);
}

while (codes.length < 3 * Math.pow(size, 2)) {
	codes.push(0);
}
var d = 0;
for (var i = 0; i < Math.pow(size, 2) * 4; i++) {
	imageData.data[i] = codes[i - d];
	if (!((i + 1) % 4)) {
		imageData.data[i] = 255;
        d++;
    }
}
canvas.width = size;
canvas.height = size;
context.putImageData(imageData, 0, 0);

var imageData = context.getImageData(0, 0, size, size);
var data = Array.from(imageData.data).filter((e, i) => (i + 1) % 4);
var JSONplanGOT = data.map(getChar).join("");
console.log(JSONplanGOT);

var k = [0, 0, 0, [], []];
for (var i = 0; i < codes.length; i++) {
    if (codes[i] != data[i]) {
        k[i % 3] += 1;
        k[3].push(getChar(codes[i]));
        k[4].push(getChar(data[i]));
    }
}
console.log(k);
