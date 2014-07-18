var xmlMap = (function() {
var default_tag_name = 'row';
var exports = {};

exports.dump = function(obj, options) {
  options = options || {};

	if (typeof obj != "object") return obj;
	//    if (typeof xw != XMLWriter) 
	var	xw = new XMLWriter(options.indent);


	var getype = function(o) {
		if (!o)
			return 'undefined';
		else if (Array.isArray(o))
			return 'array';
		else
			return typeof o;
	}

	var getval = function(o) {
		return ''+o; // !TODO 
	}

	var getname = function(n) {
		return n.replace('$', ':');
	}

	var sortKeys = function(o) {
		var keys = [];
		for(var key in o) {
			if (o.hasOwnProperty(key) && o[key] != null && o[key] != undefined){
				keys.push(key);
			}
		}
		function keyComparator(a, b) {
			var a0 = a.charAt(0);
			var b0 = b.charAt(0);
			var compA = typeof o[a] === 'object' ? 1 : -1;
			var compB = typeof o[b] === 'object' ? 1 : -1;
			if (compA - compB !== 0) {
				return compA - compB;
			}
			compA = a0 === '$' || a0 === '#' ? 1 : -1;
			compB = b0 === '$' || b0 === '#' ? 1 : -1;
			return compA - compB;
		}
		keys.sort(keyComparator);
		return keys;
	};

	var parse = function(o) {
		if (getype(o) != 'object') return;
		var keys = sortKeys(o);
		for(var index in keys) {
			var key = keys[index];
			var val = o[key];
			var type1 = getype(val);
			if (type1 == 'object') {
				xw.startElement(getname(key));
				parse(val);
				xw.endElement();
			}
			else if (type1 == 'array' && val.length <= 0) {
				xw.startElement(getname(key)).endElement();
			}
			else if (type1 == 'array' && val.length > 0) {
				var type2 = getype(val[0]);
				if (type2 == 'object') {
					val.forEach(function(item, index) {
							if (key == '$element' || key == '$e' || key == '#element') {
								parse(item);
							}
							else {
								xw.startElement(getname(key));
								parse(item);
								xw.endElement();
							}
					});
				}
				else {
					val.forEach(function(item, index) {
							if (key == '$element' || key == '$e' || key == '#element') {
								xw.startCData().text(getval(item)).endCData();
							}
							else {
								xw.startElement(getname(key));
								xw.startCData().text(getval(item)).endCData();
								xw.endElement();
							}
					});
				}
			}
			else {
				if (key == '$text' || key == '$t' || key == '#text') {
					xw.text(getval(val));
				}
				else if (key == '$comment' || key == '$c' || key == '#comment') {
					xw.startComment().text(getval(val)).endComment();
				}
				else if (key == '$cdata' || key == '$cd' || key == '#cdata' || key == '#cd') {
					xw.startCData().text(getval(val)).endCData();
				}
				else  {
					xw.startAttribute(getname(key)).text(getval(val)).endAttribute();
				}
			}
		}
	}
	var o= {};
	if (Object.keys(obj).length == 1) {
		o = obj;
	}
	else {
		o[default_tag_name] = obj;
	}
	parse(o);

	return xw.toString();

};
exports.load = function(str, options) {
	options = options || {};
	if (typeof str != "string") {
    if (options.throwErrors) {
      throw new Error("Input was "+(typeof str)+", expected a string");
    }
    return str;
  }

	var parser = require("sax").parser(true, {trim:true, xmlns:false});
	var result = {}, 
		stack = [], 
		cdata = '';

	function cvalue(n, v) {
		n = n.replace(':', '$');
		var o = stack[stack.length-1];
		if (o == undefined) {
			o = {};
			o[n] = v;
			return o[n];
		}
		else if (o[n] == undefined) {
			o[n] = v;
			return o[n];
		}
		else if (!Array.isArray(o[n])) {
			var x = o[n];
			o[n] = new Array(x, v);
			return o[n][1];
		}
		else {
			var i = o[n].push(v);
			return o[n][i-1];
		}
	}
	function cattr(o) {
		var r = {};
		for(var key in o) {
			if (o.hasOwnProperty(key) && o[key]) {
				r[key.replace(':', '$')] = o[key];
			}
		}
		return r;
	}


	if (!options.throwErrors) {
		parser.onerror = function (e) {
			// an error happened.
		};
  }
	parser.onprocessinginstruction = function (pi) {
	};
	parser.ontext = function (v) {
		cvalue('$t', v);
	};
	parser.oncomment = function (v) {
		cvalue('$c', v);
	};
	parser.oncdata = function (v) {
		cdata += v;
	};
	parser.onopencdata = function () {
		cdata = '';
	};
	parser.onclosecdata = function () {
		cvalue('$cd', cdata);
		cdata = '';
	};
	parser.onopentag = function (node) {
//        console.log(stack);
		if (stack.length == 1 && node.name == default_tag_name) {
			result = cattr(node.attributes);
			stack.push(result);
		}
		else {
			stack.push(cvalue(node.name, cattr(node.attributes)));
		}
	};
	parser.onclosetag = function () {
		stack.pop();
	};
	parser.onready = function () {
	};
	parser.onend = function () {
	};

	if (options.throwErrors) {
		stack.push(result);
		parser.write(str);
		var line = parser.line;
		var column = parser.column;
		parser.close();
		stack.pop();

		if (stack.length !== 0) {
			var er = "Unexpected end of input";
			er += "\nLine: "+line+
				"\nColumn: "+column+
				"\nChar: null";
			throw new Error(er);
		}
	} else {
		stack.push(result);
		try {
			parser.write(str).close();
		}
		catch(e) {
			return str;
		}
		stack.pop();
	}
	
	return result;
}

exports.toxml = exports.dump;
exports.tojson = exports.load;

return exports;
})();
