var ijvm = [];
var data = {};
var dataRec = {};

var val = {
	"MAR": undefined,
	"MBR": undefined,
	"MBRU": undefined,
	"MDR": undefined,
	"SP": undefined,
	"TOS": undefined,
	"LV": undefined,
	"H": undefined,
	"N": undefined,
	"Z": undefined,
	"PC": undefined,
	"OPC": undefined,
	"CPP": undefined
}

var rec = {
	"MAR": [undefined],
	"MBR": [undefined],
	"MBRU": [undefined],
	"MDR": [undefined],
	"SP": [undefined],
	"TOS": [undefined],
	"LV": [undefined],
	"H": [undefined],
	"N": [undefined],
	"Z": [undefined],
	"PC": [undefined],
	"OPC": [undefined],
	"CPP": [undefined]
}

var l = 4;

function hex(n) {
	if (typeof(n) == "number") {
		var digit = "0123456789ABCDEF";
		var b = 16;
		var m = "";
		while (n > 0) {
			var r = n % b;
			m = digit[r] + m;
			n -= r;
			n /= b;
		}
		if (m == "")
			m = "0";
		return "0x" + m;
	}
	return NaN;
}

function init(SP, LV, vars, PC, hexcode) {
	set("SP", SP);
	setData(SP, undefined);
	set("LV", LV);
	for (var i = 0; i < vars.length; i++)
		setData(LV + i * l, vars[i]);
	set("PC", PC);
	ijvm = Array(PC).concat(hexcode);
}

var inc;

function run() {
	var sp = Number(document.getElementById("sp").value);
	var lv = Number(document.getElementById("lv").value);
	var vars = document.getElementById("vars").value.split(/ /g).filter(e => e != "").map(e => Number(e));
	var pc = Number(document.getElementById("pc").value);
	var hexcode = document.getElementById("hexcode").value.split(/ /g).filter(e => e != "").map(e => Number(e));
	inc = Number(document.getElementById("delay").value);
	print("<span class='gray'>[initialization]</span>");
	init(sp, lv, vars, pc, hexcode);
	print("<span class='gray'>[start]</span>");
	goto("Main1");
	print("<span class='gray'>[end]</span>");
	if (result == undefined)
		result = document.getElementById("result");
	setTimeout(function() {
		result.innerHTML += "Initialization<br>";
		result.innerHTML += "SP:\t\t" + hex(sp) + "<br>";
		result.innerHTML += "LV:\t\t" + hex(lv) + "<br>";
		result.innerHTML += "Variables:\t" + vars.join(" ") + "<br>";
		result.innerHTML += "PC:\t\t" + hex(pc) + "<br>";
		result.innerHTML += "IJVM Hex Code:\t" + hexcode.map(e => hex(e)).join(" ") + "<br>";
		result.innerHTML += "<br>Stack and Local Variables (in base 10)<br>";
		var d = Object.keys(dataRec);
		for (var i = 0, e; e = Number(d[i]); i++)
			result.innerHTML += hex(e) + ":\t" + dataRec[e].join(" / ") + "<br>";
		result.innerHTML += "<br>Registers (in base 16)<br>";
		var r = Object.keys(rec);
		for (var i = 0, e; e = r[i]; i++)
			result.innerHTML += e + ":\t" + rec[e].map(n => hex(n)).join(" / ") + "<br>";
		result.innerHTML += "<br>(old_value / new_value)";
		delay = 0;
	}, delay);
	Array.from(document.getElementsByTagName("input")).forEach(e => e.style.display = "none");
}

function rd() {
	print("<span class='gray'>[rd start]</span>");
	set("MDR", data[val["MAR"]]);
	print("<span class='gray'>[rd end]</span>");
}

function wr() {
	print("<span class='gray'>[wr start]</span>");
	setData(val["MAR"], val["MDR"])
	print("<span class='gray'>[wr end]</span>");
}

function fetch() {
	print("<span class='gray'>[fetch start]</span>");
	set("MBR", ijvm[val["PC"] - 1]);
	set("MBRU", ijvm[val["PC"]]);
	print("<span class='gray'>[fetch end]</span>");
}

var delay = 0;
var out;
var result;

function print(m) {
	if (out == undefined)
		out = document.getElementById("out");
	setTimeout(e => out.innerHTML = m + "<br>" + out.innerHTML, delay);
	delay += inc;
}

function set(n, m) {
	if (typeof(n) == "string") {
		val[n] = m;
		rec[n].push(m);
		print(n + " = " + hex(m));
	}
	else {
		for (var i = 0, e; e = n[i]; i++) {
			val[e] = m;
			rec[e].push(m);
		}
		print(n.join(" = ") + " = " + hex(m));
	}
}

function setData(n, m) {
	data[n] = m;
	if (!dataRec[n])
		dataRec[n] = [NaN];
	if (m == undefined)
		m = NaN;
	dataRec[n].push(m);
	print("data[" + hex(n) + "] = " + m);
}

function goto(n) {
	switch(n) {
		case "Main1":			print("<span class='red'>Main1</span>");				set("PC", val["PC"] + 1); fetch(); goto(val["MBR"]);
								break;
		case 0x00:				print("<span class='red'>NOP</span>");
		case "nop1":			print("<span class='red'>nop1</span>");					goto("Main1");
								break;
		case 0x60:				print("<span class='red'>IADD</span>");
		case "iadd1":			print("<span class='red'>iadd1</span>");				set(["MAR", "SP"], val["SP"] - l); rd();
		case "iadd2":			print("<span class='red'>iadd2</span>");				set("H", val["TOS"]);
		case "iadd3":			print("<span class='red'>iadd3</span>");				set(["MDR", "TOS"], val["MDR"] + val["H"]); wr(); goto("Main1");
								break;
		case 0x64:				print("<span class='red'>ISUB</span>");
		case "isub1":			print("<span class='red'>isub1</span>");				set(["MAR", "SP"], val["SP"] - l); rd();
		case "isub2":			print("<span class='red'>isub2</span>");				set("H", val["TOS"]);
		case "isub3":			print("<span class='red'>isub3</span>");				set(["MDR", "TOS"], val["MDR"] - val["H"]); wr(); goto("Main1");
								break;
		case 0x7E:				print("<span class='red'>IAND</span>");
		case "iand1":			print("<span class='red'>iand1</span>");				set(["MAR", "SP"], val["SP"] - l); rd();
		case "iand2":			print("<span class='red'>iand2</span>");				set("H", val["TOS"]);
		case "iand3":			print("<span class='red'>iand3</span>");				set(["MDR", "TOS"], val["MDR"] & val["H"]); wr(); goto("Main1");
								break;
		case 0x80:				print("<span class='red'>IOR</span>");
		case "ior1":			print("<span class='red'>ior1</span>");					set(["MAR", "SP"], val["SP"] - l); rd();
		case "ior2":			print("<span class='red'>ior2</span>");					set("H", val["TOS"]);
		case "ior3":			print("<span class='red'>ior3</span>");					set(["MDR", "TOS"], val["MDR"] | val["H"]); wr(); goto("Main1");
								break;
		case 0x59:				print("<span class='red'>DUP</span>");
		case "dup1":			print("<span class='red'>dup1</span>");					set(["MAR", "SP"], val["SP"] + l);
		case "dup2":			print("<span class='red'>dup2</span>");					set("MDR", val["TOS"]); wr(); goto("Main1");
								break;
		case 0x57:				print("<span class='red'>POP</span>");
		case "pop1":			print("<span class='red'>pop1</span>");					set(["MAR", "SP"], val["SP"] - l); rd();
		case "pop2":			print("<span class='red'>pop2</span>");					
		case "pop3":			print("<span class='red'>pop3</span>");					set("TOS", val["MDR"]); goto("Main1");
								break;
		case 0x5F:				print("<span class='red'>SWAP</span>");
		case "swap1":			print("<span class='red'>swap1</span>");				set("MAR", val["SP"] - l); rd();
		case "swap2":			print("<span class='red'>swap2</span>");				set("MAR", val["SP"]);
		case "swap3":			print("<span class='red'>swap3</span>");				set("H", val["MDR"]); wr();
		case "swap4":			print("<span class='red'>swap4</span>");				set("MDR", val["TOS"]);
		case "swap5":			print("<span class='red'>swap5</span>");				set("MAR", val["SP"] - l); wr();
		case "swap6":			print("<span class='red'>swap6</span>");				set("TOS", val["H"]); goto("Main1");
								break;
		case 0x10:				print("<span class='red'>BIPUSH <span class='gray'>byte</span></span>");
		case "bipush1":			print("<span class='red'>bipush1</span>");				set(["SP", "MAR"], val["SP"] + l);
		case "bipush2":			print("<span class='red'>bipush2</span>");				set("PC", val["PC"] + 1); fetch();
		case "bipush3":			print("<span class='red'>bipush3</span>");				set(["MDR", "TOS"], val["MBR"]); wr(); goto("Main1");
								break;
		case 0x15:				print("<span class='red'>ILOAD <span class='gray'>varnum</span></span>");
		case "iload1":			print("<span class='red'>iload1</span>");				set("H", val["LV"]);
		case "iload2":			print("<span class='red'>iload2</span>");				set("MAR", val["MBRU"] * l + val["H"]); rd();
		case "iload3":			print("<span class='red'>iload3</span>");				set(["MAR", "SP"], val["SP"] + l);
		case "iload4":			print("<span class='red'>iload4</span>");				set("PC", val["PC"] + 1); fetch(); wr();
		case "iload5":			print("<span class='red'>iload5</span>");				set("TOS", val["MDR"]); goto("Main1");
								break;
		case 0x36:				print("<span class='red'>ISTORE <span class='gray'>varnum</span></span>");
		case "istore1":			print("<span class='red'>istore1</span>");				set("H", val["LV"]);
		case "istore2":			print("<span class='red'>istore2</span>");				set("MAR", val["MBRU"] * l + val["H"]);
		case "istore3":			print("<span class='red'>istore3</span>");				set("MDR", val["TOS"]); wr();
		case "istore4":			print("<span class='red'>istore4</span>");				set(["SP", "MAR"], val["SP"] - l); rd();
		case "istore5":			print("<span class='red'>istore5</span>");				set("PC", val["PC"] + 1); fetch();
		case "istore6":			print("<span class='red'>istore6</span>");				set("TOS", val["MDR"]); goto("Main1");
								break;
		case 0xC4:				print("<span class='red'>WIDE <span class='gray'>opcode varnum</span></span></span>");
		case "wide1":			print("<span class='red'>wide1</span>");				set("PC", val["PC"] + 1); fetch();
		case "wide2":			print("<span class='red'>wide2</span>");				goto(val["MBR"] | 0x100);
								break;
		case 0x115:				print("<span class='red'>WIDE ILOAD <span class='gray'>varnum</span></span></span>");
		case "wide_iload1":		print("<span class='red'>wide_iload1</span>");			set("PC", val["PC"] + 1); fetch();
		case "wide_iload2":		print("<span class='red'>wide_iload2</span>");			set("H", val["MBRU"] << 8);
		case "wide_iload3":		print("<span class='red'>wide_iload3</span>");			set("H", val["MBRU"] | val["H"]);
		case "wide_iload4":		print("<span class='red'>wide_iload4</span>");			set("MAR", val["LV"] + val["H"]); rd(); goto("iload3");
								break;
		case 0x136:				print("<span class='red'>WIDE ISTORE <span class='gray'>varnum</span></span></span>");
		case "wide_istore1":	print("<span class='red'>wide_istore1</span>");			set("PC", val["PC"] + 1); fetch();
		case "wide_istore2":	print("<span class='red'>wide_istore2</span>");			set("H", val["MBRU"] << 8);
		case "wide_istore3":	print("<span class='red'>wide_istore3</span>");			set("H", val["MBRU"] | val["H"]);
		case "wide_istore4":	print("<span class='red'>wide_istore4</span>");			set("MAR", val["LV"] + val["H"]); goto("istore3");
								break;
		case 0x13:				print("<span class='red'>LDC_W <span class='gray'>index</span></span>");
		case "ldc_w1":			print("<span class='red'>ldc_w1</span>");				set("PC", val["PC"] + 1); fetch();
		case "ldc_w2":			print("<span class='red'>ldc_w2</span>");				set("H", val["MBRU"] << 8);
		case "ldc_w3":			print("<span class='red'>ldc_w3</span>");				set("H", val["MBRU"] | val["H"]);
		case "ldc_w4":			print("<span class='red'>ldc_w4</span>");				set("MAR", val["H"] + val["CPP"]); rd(); goto("iload3");
								break;
		case 0x84:				print("<span class='red'>IINC <span class='gray'>varnum const</span></span>");
		case "iinc1":			print("<span class='red'>iinc1</span>");				set("H", val["LV"]);
		case "iinc2":			print("<span class='red'>iinc2</span>");				set("MAR", val["MBRU"] * l + val["H"]); rd();
		case "iinc3":			print("<span class='red'>iinc3</span>");				set("PC", val["PC"] + 1); fetch();
		case "iinc4":			print("<span class='red'>iinc4</span>");				set("H", val["MDR"]);
		case "iinc5":			print("<span class='red'>iinc5</span>");				set("PC", val["PC"] + 1); fetch();
		case "iinc6":			print("<span class='red'>iinc6</span>");				set("MDR", val["MBR"] + val["H"]); wr(); goto("Main1");
								break;
		case 0xA7:				print("<span class='red'>GOTO <span class='gray'>offset</span></span>");
		case "goto1":			print("<span class='red'>goto1</span>");				set("OPC", val["PC"] - 1);
		case "goto2":			print("<span class='red'>goto2</span>");				set("PC", val["PC"] + 1); fetch();
		case "goto3":			print("<span class='red'>goto3</span>");				set("H", val["MBR"] << 8);
		case "goto4":			print("<span class='red'>goto4</span>");				set("H", val["MBRU"] | val["H"]);
		case "goto5":			print("<span class='red'>goto5</span>");				set("PC", val["OPC"] + val["H"]); fetch();
		case "goto6":			print("<span class='red'>goto6</span>");				goto("Main1");
								break;
		case 0x9B:				print("<span class='red'>IFLT <span class='gray'>offset</span></span>");
		case "caps1":			print("<span class='red'>caps1</span>");				set(["MAR", "SP"], val["SP"] - 1); rd();
		case "caps2":			print("<span class='red'>caps2</span>");				set("OPC", val["TOS"]);
		case "caps3":			print("<span class='red'>caps3</span>");				set("TOS", val["MDR"]);
		case "caps4":			print("<span class='red'>caps4</span>");				set("N", val["OPC"]); val["N"] ? goto("T") : goto("F");
								break;
		case 0x99:				print("<span class='red'>IFEQ <span class='gray'>offset</span></span>");
		case "ifeq1":			print("<span class='red'>ifeq1</span>");				set(["MAR", "SP"], val["SP"] - 1); rd();
		case "ifeq2":			print("<span class='red'>ifeq2</span>");				set("OPC", val["TOS"]);
		case "ifeq3":			print("<span class='red'>ifeq3</span>");				set("TOS", val["MDR"]);
		case "ifeq4":			print("<span class='red'>ifeq4</span>");				set("Z", val["OPC"]); val["Z"] ? goto("T") : goto("F");
								break;
		case 0x9F:				print("<span class='red'>IF_ICMPEQ <span class='gray'>offset</span></span>");
		case "if_icmpeq1":		print("<span class='red'>if_icmpeq1</span>");			set(["MAR", "SP"], val["SP"] - 1); rd();
		case "if_icmpeq2":		print("<span class='red'>if_icmpeq2</span>");			set(["MAR", "SP"], val["SP"] - 1);
		case "if_icmpeq3":		print("<span class='red'>if_icmpeq3</span>");			set("H", val["MDR"]); rd();
		case "if_icmpeq4":		print("<span class='red'>if_icmpeq4</span>");			set("OPC", val["TOS"]);
		case "if_icmpeq5":		print("<span class='red'>if_icmpeq5</span>");			set("TOS", val["MDR"]);
		case "if_icmpeq6":		print("<span class='red'>if_icmpeq6</span>");			set("Z", val["OPC"] - val["H"]); val["Z"] ? goto("T") : goto("F");
								break;
		case "T":				print("<span class='red'>T</span>");					set("OPC", val["PC"] - 1); goto("goto2");
								break;
		case "F":				print("<span class='red'>F</span>");					set("PC", val["PC"] + 1);
		case "F2":				print("<span class='red'>F2</span>");					set("PC", val["PC"] + 1); fetch();
		case "F3":				print("<span class='red'>F3</span>");					goto("Main1");
								break;
		case 0xB6:				print("<span class='red'>INVOKEVIRTUAL <span class='gray'>disp</span></span>");
		case "invokevirtual1":	print("<span class='red'>invokevirtual1</span>");		set("PC", val["PC"] + 1); fetch();
		case "invokevirtual2":	print("<span class='red'>invokevirtual2</span>");		set("H", val["MBRU"] << 8);
		case "invokevirtual3":	print("<span class='red'>invokevirtual3</span>");		set("H", val["MBRU"] | val["H"]);
		case "invokevirtual4":	print("<span class='red'>invokevirtual4</span>");		set("MAR", val["CPP"] + val["H"]); rd();
		case "invokevirtual5":	print("<span class='red'>invokevirtual5</span>");		set("PC", val["PC"] + 1);
		case "invokevirtual6":	print("<span class='red'>invokevirtual6</span>");		set("PC", val["MDR"]); fetch();
		case "invokevirtual7":	print("<span class='red'>invokevirtual7</span>");		set("PC", val["PC"] + 1); fetch();
		case "invokevirtual8":	print("<span class='red'>invokevirtual8</span>");		set("H", val["MBRU"] << 8);
		case "invokevirtual9":	print("<span class='red'>invokevirtual9</span>");		set("H", val["MBRU"] | val["H"]);
		case "invokevirtual10":	print("<span class='red'>invokevirtual10</span>");		set("PC", val["PC"] + 1); fetch();
		case "invokevirtual11":	print("<span class='red'>invokevirtual11</span>");		set("TOS", val["SP"] - val["H"]);
		case "invokevirtual12":	print("<span class='red'>invokevirtual12</span>");		set(["TOS", "MAR"], val["TOS"] + 1);
		case "invokevirtual13":	print("<span class='red'>invokevirtual13</span>");		set("PC", val["PC"] + 1); fetch();
		case "invokevirtual14":	print("<span class='red'>invokevirtual14</span>");		set("H", val["MBRU"] << 8);
		case "invokevirtual15":	print("<span class='red'>invokevirtual15</span>");		set("H", val["MBRU"] | val["H"]);
		case "invokevirtual16":	print("<span class='red'>invokevirtual16</span>");		set("MDR", val["SP"] + val["H"] + 1); wr();
		case "invokevirtual17":	print("<span class='red'>invokevirtual17</span>");		set(["MAR", "SP"], val["MDR"]);
		case "invokevirtual18":	print("<span class='red'>invokevirtual18</span>");		set("MDR", val["OPC"]); wr();
		case "invokevirtual19":	print("<span class='red'>invokevirtual19</span>");		set(["MAR", "SP"], val["SP"] + 1);
		case "invokevirtual20":	print("<span class='red'>invokevirtual20</span>");		set("MDR", val["LV"]); wr();
		case "invokevirtual21":	print("<span class='red'>invokevirtual21</span>");		set("PC", val["PC"] + 1); fetch();
		case "invokevirtual22":	print("<span class='red'>invokevirtual22</span>");		set("LV", val["TOS"]); goto("Main1");
								break;
		case 0xAC:				print("<span class='red'>IRETURN</span>");
		case "ireturn1":		print("<span class='red'>ireturn1</span>");				set(["MAR", "SP"], val["LV"]); rd();
		case "ireturn2":		print("<span class='red'>ireturn2</span>");				
		case "ireturn3":		print("<span class='red'>ireturn3</span>");				set(["LV", "MAR"], val["MDR"]); rd();
		case "ireturn4":		print("<span class='red'>ireturn4</span>");				set("MAR", val["LV"] + 1);
		case "ireturn5":		print("<span class='red'>ireturn5</span>");				set("PC", val["MDR"]); rd(); fetch();
		case "ireturn6":		print("<span class='red'>ireturn6</span>");				set("MAR", val["SP"]);
		case "ireturn7":		print("<span class='red'>ireturn7</span>");				set("LV", val["MDR"]);
		case "ireturn8":		print("<span class='red'>ireturn8</span>");				set("MDR", val["TOS"]); wr(); goto("Main1");
								break;
		default:
								break;
	}
}