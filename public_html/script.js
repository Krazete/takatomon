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
	box.style.transform = "translate(-50%, -50%) translate3d(" + cx(n) * 512 + "px, 0px, " + cz(n) * 512 + "px) rotateY(" + cr(n) + "rad)";
	requestAnimationFrame(function() {
		animate((n + 0.001) % 1)
	});
}

animate(0);

var ddd = document.body.appendChild(document.createElement("a"));
ddd.innerHTML = "3D.js (drag to bookmarks)";
ddd.href = "javascript:var d3={nav:document.createElement(\"div\"),lim:document.createElement(\"input\"),gap:document.createElement(\"input\"),sag:document.createElement(\"input\"),fov:document.createElement(\"input\"),flo:document.createElement(\"input\"),off:document.createElement(\"input\"),non:document.createElement(\"input\"),tileStyle:document.createElement(\"style\"),styleTile:function(){if(d3.non.checked)d3.tileStyle.innerHTML=\"\";else if(d3.off.checked)d3.tileStyle.innerHTML=\"*{\t\t\t\ttransform-style:preserve-3d;\t\t\t}\";else{for(var a=0;document.querySelector(\"body\"+\">*\".repeat(a));a++);var b=d3.gap.value/a,c=-Math.PI*d3.sag.value/a;d3.tileStyle.innerHTML=\"\t\t\t*{\t\t\t\ttransform:translateZ(\"+b+\"px)rotateX(\"+c+\"rad);\t\t\t\ttransform-style:preserve-3d;\t\t\t\ttransition:transform 1s;\t\t\t\toutline:1px solid rgba(0,0,0,0.0625);\t\t\t\"+(d3.flo.checked?\"overflow:visible!important;\":\"\")+\"\t\t\t}\t\t\t*:hover{\t\t\t\ttransform:translateZ(\"+2*b+\"px)rotateX(\"+2*c+\"rad);\t\t\t\"+(d3.flo.checked?\"\":\"overflow:visible;\")+\"\t\t\t}\t\t\t\"}},mouse:{x:0,y:0},mouseMove:function(a){d3.mouse.x=a.clientX,d3.mouse.y=a.clientY,d3.mouseMoved()},mouseMoved:function(){var a=Math.cos(Math.PI*d3.mouse.y/innerHeight)*Math.PI*d3.lim.value,b=-Math.cos(Math.PI*d3.mouse.x/innerWidth)*Math.PI*d3.lim.value;document.body.style.transform=\"perspective(\"+Math.pow(2,d3.fov.value)+\"px)translateZ(-\"+d3.gap.value+\"px)rotateX(\"+a+\"rad)rotateY(\"+b+\"rad)\"},newRange:function(a,b,c,d,e,f,g){d3.nav.appendChild(document.createElement(\"span\")).innerHTML=b,d3.nav.appendChild(a),a.type=\"range\",a.min=c,a.max=d,a.step=e,a.value=f,a.addEventListener(\"input\",g)},newCheckbox:function(a,b,c){d3.nav.appendChild(document.createElement(\"span\")).innerHTML=b,d3.nav.appendChild(a),a.type=\"checkbox\",a.addEventListener(\"click\",c)},init:function(){document.body.parentNode.appendChild(d3.nav).className=\"d3Nav\",d3.newRange(d3.lim,\"limits\",0,1,.03125,.125,d3.mouseMoved),d3.newRange(d3.gap,\"gap / distance\",0,512,32,128,function(){d3.styleTile(),d3.mouseMoved()}),d3.newRange(d3.sag,\"sag\",-.25,.25,.03125,0,d3.styleTile),d3.newRange(d3.fov,\"perspective\",7,13,1,10,d3.mouseMoved),d3.newCheckbox(d3.flo,\"force overflow\",d3.styleTile),d3.newCheckbox(d3.off,\"flatten tiles\",d3.styleTile),d3.newCheckbox(d3.non,\"flatten everything\",d3.styleTile),document.body.parentNode.appendChild(document.createElement(\"style\")).innerHTML=\"\t\thtml,body{\t\t\ttransition-property:none;\t\t\theight:100%;\t\t\twidth:100%;\t\t}\t\thtml,html:hover,.d3Nav,.d3Nav:hover,.d3Nav>*,.d3Nav>*:hover{\t\t\ttransform:none;\t\t\toutline:none;\t\t\toverflow:auto!important;\t\t}\t\t.d3Nav{\t\t\tposition:fixed;\t\t\ttop:0;\t\t\tleft:0;\t\t\tbackground:rgba(0,0,0,0.5);\t\t\tcolor:#ffffff;\t\t\tborder-radius:0 0 16px 0;\t\t\tpadding:0 8px 8px 0;\t\t\ttransform:translate(-100%,-100%)translate(32px,32px);\t\t}\t\t.d3Nav:after{\t\t\tcontent:'\\\\2261';\t\t\tposition:absolute;\t\t\tbottom:8px;\t\t\tright:8px;\t\t}\t\t.d3Nav:hover{\t\t\ttransform:none;\t\t}\t\t.d3Nav>*{\t\t\tdisplay:block;\t\t}\t\t\",document.body.parentNode.appendChild(d3.tileStyle),d3.styleTile(),window.addEventListener(\"mousemove\",d3.mouseMove),window.addEventListener(\"scroll\",function(a){document.body.style.transformOrigin=innerWidth/2+pageXOffset+\"px \"+(innerHeight/2+pageYOffset)+\"px\"}),window.scrollBy(0,1)}};d3.init();";
