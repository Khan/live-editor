/**
 *
 * Color picker
 * Author: Stefan Petre www.eyecon.ro
 * 
 * Dual licensed under the MIT and GPL licenses
 * 
 */
(function ($) {
	var ColorPicker = function () {
		var
			ids = {},
			inAction,
			charMin = 65,
			visible,
			tpl = '<div class="colorpicker"><div class="colorpicker_color"><div><div></div></div></div><div class="colorpicker_hue"><div></div></div><div class="colorpicker_new_color"></div><div class="colorpicker_current_color"></div><div class="colorpicker_hex"><input type="text" maxlength="6" size="6" /></div><div class="colorpicker_rgb_r colorpicker_field"><input type="text" maxlength="3" size="3" /><span></span></div><div class="colorpicker_rgb_g colorpicker_field"><input type="text" maxlength="3" size="3" /><span></span></div><div class="colorpicker_rgb_b colorpicker_field"><input type="text" maxlength="3" size="3" /><span></span></div><div class="colorpicker_hsb_h colorpicker_field"><input type="text" maxlength="3" size="3" /><span></span></div><div class="colorpicker_hsb_s colorpicker_field"><input type="text" maxlength="3" size="3" /><span></span></div><div class="colorpicker_hsb_b colorpicker_field"><input type="text" maxlength="3" size="3" /><span></span></div><div class="colorpicker_submit"></div></div>',
			defaults = {
				eventName: 'click',
				onShow: function () {},
				onBeforeShow: function(){},
				onHide: function () {},
				onChange: function () {},
				onSubmit: function () {},
				color: 'ff0000',
				livePreview: true,
				flat: false
			},
			fillRGBFields = function  (hsb, cal) {
				var rgb = HSBToRGB(hsb);
				$(cal).data('colorpicker').fields
					.eq(1).val(rgb.r).end()
					.eq(2).val(rgb.g).end()
					.eq(3).val(rgb.b).end();
			},
			fillHSBFields = function  (hsb, cal) {
				$(cal).data('colorpicker').fields
					.eq(4).val(hsb.h).end()
					.eq(5).val(hsb.s).end()
					.eq(6).val(hsb.b).end();
			},
			fillHexFields = function (hsb, cal) {
				$(cal).data('colorpicker').fields
					.eq(0).val(HSBToHex(hsb)).end();
			},
			setSelector = function (hsb, cal) {
				$(cal).data('colorpicker').selector.css('backgroundColor', '#' + HSBToHex({h: hsb.h, s: 100, b: 100}));
				$(cal).data('colorpicker').selectorIndic.css({
					left: parseInt(150 * hsb.s/100, 10),
					top: parseInt(150 * (100-hsb.b)/100, 10)
				});
			},
			setHue = function (hsb, cal) {
				$(cal).data('colorpicker').hue.css('top', parseInt(150 - 150 * hsb.h/360, 10));
			},
			setCurrentColor = function (hsb, cal) {
				$(cal).data('colorpicker').currentColor.css('backgroundColor', '#' + HSBToHex(hsb));
			},
			setNewColor = function (hsb, cal) {
				$(cal).data('colorpicker').newColor.css('backgroundColor', '#' + HSBToHex(hsb));
			},
			keyDown = function (ev) {
				var pressedKey = ev.charCode || ev.keyCode || -1;
				if ((pressedKey > charMin && pressedKey <= 90) || pressedKey == 32) {
					return false;
				}
				var cal = $(this).parent().parent();
				if (cal.data('colorpicker').livePreview === true) {
					change.apply(this);
				}
			},
			change = function (ev) {
				var cal = $(this).parent().parent(), col;
				if (this.parentNode.className.indexOf('_hex') > 0) {
					cal.data('colorpicker').color = col = HexToHSB(fixHex(this.value));
				} else if (this.parentNode.className.indexOf('_hsb') > 0) {
					cal.data('colorpicker').color = col = fixHSB({
						h: parseInt(cal.data('colorpicker').fields.eq(4).val(), 10),
						s: parseInt(cal.data('colorpicker').fields.eq(5).val(), 10),
						b: parseInt(cal.data('colorpicker').fields.eq(6).val(), 10)
					});
				} else {
					cal.data('colorpicker').color = col = RGBToHSB(fixRGB({
						r: parseInt(cal.data('colorpicker').fields.eq(1).val(), 10),
						g: parseInt(cal.data('colorpicker').fields.eq(2).val(), 10),
						b: parseInt(cal.data('colorpicker').fields.eq(3).val(), 10)
					}));
				}
				if (ev) {
					fillRGBFields(col, cal.get(0));
					fillHexFields(col, cal.get(0));
					fillHSBFields(col, cal.get(0));
				}
				setSelector(col, cal.get(0));
				setHue(col, cal.get(0));
				setNewColor(col, cal.get(0));
				cal.data('colorpicker').onChange.apply(cal, [col, HSBToHex(col), HSBToRGB(col)]);
			},
			blur = function (ev) {
				var cal = $(this).parent().parent();
				cal.data('colorpicker').fields.parent().removeClass('colorpicker_focus');
			},
			focus = function () {
				charMin = this.parentNode.className.indexOf('_hex') > 0 ? 70 : 65;
				$(this).parent().parent().data('colorpicker').fields.parent().removeClass('colorpicker_focus');
				$(this).parent().addClass('colorpicker_focus');
			},
			downIncrement = function (ev) {
				var field = $(this).parent().find('input').focus();
				var current = {
					el: $(this).parent().addClass('colorpicker_slider'),
					max: this.parentNode.className.indexOf('_hsb_h') > 0 ? 360 : (this.parentNode.className.indexOf('_hsb') > 0 ? 100 : 255),
					y: ev.pageY,
					field: field,
					val: parseInt(field.val(), 10),
					preview: $(this).parent().parent().data('colorpicker').livePreview					
				};
				$(document).bind('mouseup', current, upIncrement);
				$(document).bind('mousemove', current, moveIncrement);
			},
			moveIncrement = function (ev) {
				ev.data.field.val(Math.max(0, Math.min(ev.data.max, parseInt(ev.data.val + ev.pageY - ev.data.y, 10))));
				if (ev.data.preview) {
					change.apply(ev.data.field.get(0), [true]);
				}
				return false;
			},
			upIncrement = function (ev) {
				change.apply(ev.data.field.get(0), [true]);
				ev.data.el.removeClass('colorpicker_slider').find('input').focus();
				$(document).unbind('mouseup', upIncrement);
				$(document).unbind('mousemove', moveIncrement);
				return false;
			},
			downHue = function (ev) {
				var current = {
					cal: $(this).parent(),
					y: $(this).offset().top
				};
				current.preview = current.cal.data('colorpicker').livePreview;
				$(document).bind('mouseup', current, upHue);
				$(document).bind('mousemove', current, moveHue);
			},
			moveHue = function (ev) {
				change.apply(
					ev.data.cal.data('colorpicker')
						.fields
						.eq(4)
						.val(parseInt(360*(150 - Math.max(0,Math.min(150,(ev.pageY - ev.data.y))))/150, 10))
						.get(0),
					[ev.data.preview]
				);
				return false;
			},
			upHue = function (ev) {
				moveHue(ev);
				fillRGBFields(ev.data.cal.data('colorpicker').color, ev.data.cal.get(0));
				fillHexFields(ev.data.cal.data('colorpicker').color, ev.data.cal.get(0));
				$(document).unbind('mouseup', upHue);
				$(document).unbind('mousemove', moveHue);
				return false;
			},
			downSelector = function (ev) {
				var current = {
					cal: $(this).parent(),
					pos: $(this).offset()
				};
				current.preview = current.cal.data('colorpicker').livePreview;
				$(document).bind('mouseup', current, upSelector);
				$(document).bind('mousemove', current, moveSelector);
			},
			moveSelector = function (ev) {
				change.apply(
					ev.data.cal.data('colorpicker')
						.fields
						.eq(6)
						.val(parseInt(100*(150 - Math.max(0,Math.min(150,(ev.pageY - ev.data.pos.top))))/150, 10))
						.end()
						.eq(5)
						.val(parseInt(100*(Math.max(0,Math.min(150,(ev.pageX - ev.data.pos.left))))/150, 10))
						.get(0),
					[ev.data.preview]
				);
				return false;
			},
			upSelector = function (ev) {
				moveSelector(ev);
				fillRGBFields(ev.data.cal.data('colorpicker').color, ev.data.cal.get(0));
				fillHexFields(ev.data.cal.data('colorpicker').color, ev.data.cal.get(0));
				$(document).unbind('mouseup', upSelector);
				$(document).unbind('mousemove', moveSelector);
				return false;
			},
			enterSubmit = function (ev) {
				$(this).addClass('colorpicker_focus');
			},
			leaveSubmit = function (ev) {
				$(this).removeClass('colorpicker_focus');
			},
			clickSubmit = function (ev) {
				var cal = $(this).parent();
				var col = cal.data('colorpicker').color;
				cal.data('colorpicker').origColor = col;
				setCurrentColor(col, cal.get(0));
				cal.data('colorpicker').onSubmit(col, HSBToHex(col), HSBToRGB(col), cal.data('colorpicker').el, cal.data('colorpicker').parent);
			},
			show = function (ev) {
				var cal = $('#' + $(this).data('colorpickerId'));
				cal.data('colorpicker').onBeforeShow.apply(this, [cal.get(0)]);
				var pos = $(this).offset();
				var viewPort = getViewport();
				var top = pos.top + this.offsetHeight;
				var left = pos.left;
				if (top + 176 > viewPort.t + viewPort.h) {
					top -= this.offsetHeight + 176;
				}
				if (left + 356 > viewPort.l + viewPort.w) {
					left -= 356;
				}
				cal.css({left: left + 'px', top: top + 'px'});
				if (cal.data('colorpicker').onShow.apply(this, [cal.get(0)]) != false) {
					cal.show();
				}
				$(document).bind('mousedown', {cal: cal}, hide);
				return false;
			},
			hide = function (ev) {
				if (!isChildOf(ev.data.cal.get(0), ev.target, ev.data.cal.get(0))) {
					if (ev.data.cal.data('colorpicker').onHide.apply(this, [ev.data.cal.get(0)]) != false) {
						ev.data.cal.hide();
					}
					$(document).unbind('mousedown', hide);
				}
			},
			isChildOf = function(parentEl, el, container) {
				if (parentEl == el) {
					return true;
				}
				if (parentEl.contains) {
					return parentEl.contains(el);
				}
				if ( parentEl.compareDocumentPosition ) {
					return !!(parentEl.compareDocumentPosition(el) & 16);
				}
				var prEl = el.parentNode;
				while(prEl && prEl != container) {
					if (prEl == parentEl)
						return true;
					prEl = prEl.parentNode;
				}
				return false;
			},
			getViewport = function () {
				var m = document.compatMode == 'CSS1Compat';
				return {
					l : window.pageXOffset || (m ? document.documentElement.scrollLeft : document.body.scrollLeft),
					t : window.pageYOffset || (m ? document.documentElement.scrollTop : document.body.scrollTop),
					w : window.innerWidth || (m ? document.documentElement.clientWidth : document.body.clientWidth),
					h : window.innerHeight || (m ? document.documentElement.clientHeight : document.body.clientHeight)
				};
			},
			fixHSB = function (hsb) {
				return {
					h: Math.min(360, Math.max(0, hsb.h)),
					s: Math.min(100, Math.max(0, hsb.s)),
					b: Math.min(100, Math.max(0, hsb.b))
				};
			}, 
			fixRGB = function (rgb) {
				return {
					r: Math.min(255, Math.max(0, rgb.r)),
					g: Math.min(255, Math.max(0, rgb.g)),
					b: Math.min(255, Math.max(0, rgb.b))
				};
			},
			fixHex = function (hex) {
				var len = 6 - hex.length;
				if (len > 0) {
					var o = [];
					for (var i=0; i<len; i++) {
						o.push('0');
					}
					o.push(hex);
					hex = o.join('');
				}
				return hex;
			}, 
			HexToRGB = function (hex) {
				var hex = parseInt(((hex.indexOf('#') > -1) ? hex.substring(1) : hex), 16);
				return {r: hex >> 16, g: (hex & 0x00FF00) >> 8, b: (hex & 0x0000FF)};
			},
			HexToHSB = function (hex) {
				return RGBToHSB(HexToRGB(hex));
			},
			RGBToHSB = function (rgb) {
				var hsb = {
					h: 0,
					s: 0,
					b: 0
				};
				var min = Math.min(rgb.r, rgb.g, rgb.b);
				var max = Math.max(rgb.r, rgb.g, rgb.b);
				var delta = max - min;
				hsb.b = max;
				if (max != 0) {
					
				}
				hsb.s = max != 0 ? 255 * delta / max : 0;
				if (hsb.s != 0) {
					if (rgb.r == max) {
						hsb.h = (rgb.g - rgb.b) / delta;
					} else if (rgb.g == max) {
						hsb.h = 2 + (rgb.b - rgb.r) / delta;
					} else {
						hsb.h = 4 + (rgb.r - rgb.g) / delta;
					}
				} else {
					hsb.h = -1;
				}
				hsb.h *= 60;
				if (hsb.h < 0) {
					hsb.h += 360;
				}
				hsb.s *= 100/255;
				hsb.b *= 100/255;
				return hsb;
			},
			HSBToRGB = function (hsb) {
				var rgb = {};
				var h = Math.round(hsb.h);
				var s = Math.round(hsb.s*255/100);
				var v = Math.round(hsb.b*255/100);
				if(s == 0) {
					rgb.r = rgb.g = rgb.b = v;
				} else {
					var t1 = v;
					var t2 = (255-s)*v/255;
					var t3 = (t1-t2)*(h%60)/60;
					if(h==360) h = 0;
					if(h<60) {rgb.r=t1;	rgb.b=t2; rgb.g=t2+t3}
					else if(h<120) {rgb.g=t1; rgb.b=t2;	rgb.r=t1-t3}
					else if(h<180) {rgb.g=t1; rgb.r=t2;	rgb.b=t2+t3}
					else if(h<240) {rgb.b=t1; rgb.r=t2;	rgb.g=t1-t3}
					else if(h<300) {rgb.b=t1; rgb.g=t2;	rgb.r=t2+t3}
					else if(h<360) {rgb.r=t1; rgb.g=t2;	rgb.b=t1-t3}
					else {rgb.r=0; rgb.g=0;	rgb.b=0}
				}
				return {r:Math.round(rgb.r), g:Math.round(rgb.g), b:Math.round(rgb.b)};
			},
			RGBToHex = function (rgb) {
				var hex = [
					rgb.r.toString(16),
					rgb.g.toString(16),
					rgb.b.toString(16)
				];
				$.each(hex, function (nr, val) {
					if (val.length == 1) {
						hex[nr] = '0' + val;
					}
				});
				return hex.join('');
			},
			HSBToHex = function (hsb) {
				return RGBToHex(HSBToRGB(hsb));
			},
			restoreOriginal = function () {
				var cal = $(this).parent();
				var col = cal.data('colorpicker').origColor;
				cal.data('colorpicker').color = col;
				fillRGBFields(col, cal.get(0));
				fillHexFields(col, cal.get(0));
				fillHSBFields(col, cal.get(0));
				setSelector(col, cal.get(0));
				setHue(col, cal.get(0));
				setNewColor(col, cal.get(0));
			};
		return {
			init: function (opt) {
				opt = $.extend({}, defaults, opt||{});
				if (typeof opt.color == 'string') {
					opt.color = HexToHSB(opt.color);
				} else if (opt.color.r != undefined && opt.color.g != undefined && opt.color.b != undefined) {
					opt.color = RGBToHSB(opt.color);
				} else if (opt.color.h != undefined && opt.color.s != undefined && opt.color.b != undefined) {
					opt.color = fixHSB(opt.color);
				} else {
					return this;
				}
				return this.each(function () {
					if (!$(this).data('colorpickerId')) {
						var options = $.extend({}, opt);
						options.origColor = opt.color;
						var id = 'collorpicker_' + parseInt(Math.random() * 1000);
						$(this).data('colorpickerId', id);
                        options.parent = $(this);
						var cal = $(tpl).attr('id', id).attr('data-parent', $(this).attr('id'));
						if (options.flat) {
							cal.appendTo(this).show();
						} else {
							cal.appendTo(document.body);
						}
						options.fields = cal
											.find('input')
												.bind('keyup', keyDown)
												.bind('change', change)
												.bind('blur', blur)
												.bind('focus', focus);
						cal
							.find('span').bind('mousedown', downIncrement).end()
							.find('>div.colorpicker_current_color').bind('click', restoreOriginal);
						options.selector = cal.find('div.colorpicker_color').bind('mousedown', downSelector);
						options.selectorIndic = options.selector.find('div div');
						options.el = this;
						options.hue = cal.find('div.colorpicker_hue div');
						cal.find('div.colorpicker_hue').bind('mousedown', downHue);
						options.newColor = cal.find('div.colorpicker_new_color');
						options.currentColor = cal.find('div.colorpicker_current_color');
						cal.data('colorpicker', options);
						cal.find('div.colorpicker_submit')
							.bind('mouseenter', enterSubmit)
							.bind('mouseleave', leaveSubmit)
							.bind('click', clickSubmit);
						fillRGBFields(options.color, cal.get(0));
						fillHSBFields(options.color, cal.get(0));
						fillHexFields(options.color, cal.get(0));
						setHue(options.color, cal.get(0));
						setSelector(options.color, cal.get(0));
						setCurrentColor(options.color, cal.get(0));
						setNewColor(options.color, cal.get(0));
						if (options.flat) {
							cal.css({
								position: 'relative',
								display: 'block'
							});
						} else {
							$(this).bind(options.eventName, show);
						}
					}
				});
			},
			showPicker: function() {
				return this.each( function () {
					if ($(this).data('colorpickerId')) {
						show.apply(this);
					}
				});
			},
			hidePicker: function() {
				return this.each( function () {
					if ($(this).data('colorpickerId')) {
						$('#' + $(this).data('colorpickerId')).hide();
					}
				});
			},
			setColor: function(col) {
				if (typeof col == 'string') {
					col = HexToHSB(col);
				} else if (col.r != undefined && col.g != undefined && col.b != undefined) {
					col = RGBToHSB(col);
				} else if (col.h != undefined && col.s != undefined && col.b != undefined) {
					col = fixHSB(col);
				} else {
					return this;
				}
				return this.each(function(){
					if ($(this).data('colorpickerId')) {
						var cal = $('#' + $(this).data('colorpickerId'));
						cal.data('colorpicker').color = col;
						cal.data('colorpicker').origColor = col;
						fillRGBFields(col, cal.get(0));
						fillHSBFields(col, cal.get(0));
						fillHexFields(col, cal.get(0));
						setHue(col, cal.get(0));
						setSelector(col, cal.get(0));
						setCurrentColor(col, cal.get(0));
						setNewColor(col, cal.get(0));
					}
				});
			}
		};
	}();
	$.fn.extend({
		ColorPicker: ColorPicker.init,
		ColorPickerHide: ColorPicker.hidePicker,
		ColorPickerShow: ColorPicker.showPicker,
		ColorPickerSetColor: ColorPicker.setColor
	});
})(jQuery);

(function(wndw) {

var defaultImage = "cute/Blank";

/**
 * Returns the number of decimal places shown in a string representation of
 * a number.
 */
var decimalCount = function(strNumber) {
    var decIndex = strNumber.indexOf(".");
    if (decIndex === -1) {
        return 0;
    } else {
        return strNumber.length - (decIndex + 1);
    }
};

// Returns true if we're inside an open parenthesis
var isInParenthesis = function(text) {
    var parenthesisDepth = 0;
    for (var i = 0; i < text.length; i++) {
        if (text[i] === '(') {
            parenthesisDepth++;
        } else if (text[i] === ')') {
            parenthesisDepth--;
        }
    }
    return parenthesisDepth > 0;
};


var HotNumberModule = function() {

    var aceEditor = {
        onInit: function() {
            // To store editor specific things
            var editor = this.options.editor;
            var record = this.options.record;

            var self = this;

            // A bit of a hack adding it to the editor object...
            editor.imagesDir = this.options.imagesDir;

            if (this.options.reload) {
                checkNumber(this.options);
            } else {
                var selection = editor.session.selection;
                selection.on("changeCursor", function() {
                    _private.checkNumber.call(self);
                });
                selection.on("changeSelection", function() {
                    _private.checkNumber.call(self);
                });

                editor.renderer.scrollBar.addEventListener("scroll", function() {
                    if (self.curPicker) {
                        _private.updatePos.call(self);
                    }
                });

                _private.attachScrubber.call(this);
                _private.attachColorPicker.call(this);
            }

            if (record) {
                record.handlers.hot = function(e) {
                    _private.checkNumber.call(self);
                    _private.updateEditor.call(e.hot);
                    _private.updatePos.call(self);
                };
            }
        },
        onNumberCheck: function() {
            var editor = this.options.editor;
            var record = this.options.record;

            var pos = editor.selection.getCursor();
            var line = editor.session.getDocument().getLine(pos.row);
            var prefix = line.slice(0, pos.column);

            if (/\b(background|fill|stroke|color)(\s*)\(\s*([\s\d,]*)\s*$/.test(prefix)) {
                var paramsPos = pos.column - RegExp.$3.length;
                // -1 because the open parenthesis is not included in the capture
                var funcPos = paramsPos - RegExp.$1.length - RegExp.$2.length - 1;
                var beforeFunction = prefix.substring(0, funcPos);
                var needsSemicolon = RegExp.$1 !== "color" ||
                    !isInParenthesis(beforeFunction);
                // Test a match for:
                // Capture group 1: r, g, b
                // followed by an optional ,a for alpha
                // Capture group 2: ) or empty
                if (/^\s*((?:\s*\d+,){0,2}(?:\s*\d+)?)(?:,\s*\d+)?\s*(\)|$)/.test(line.slice(paramsPos))) {
                    var Range = ace.require("ace/range").Range;

                    this.oldValue = RegExp.$1;
                    this.range = new Range(pos.row, paramsPos, pos.row, paramsPos + this.oldValue.length);

                    // Insert a); if one doesn't exist
                    // Makes it easier to quickly insert a color
                    // TODO: Maybe we should do this for more methods?
                    if (RegExp.$2.length === 0) {
                        ignore = true;

                        if (record) {
                            record.pauseLog();
                        }

                        editor.session.getDocument().insertInLine({ row: pos.row, column: line.length },
                            (this.oldValue ? "" : (this.oldValue = "255, 0, 0")) + ")" +
                            (needsSemicolon ? ";" : ""));
                        editor.selection.setSelectionRange(this.range);
                        editor.selection.clearSelection();

                        if (record) {
                            record.resumeLog();
                        }

                        this.ignore = false;
                    }

                    this.handle = function(value) {
                        _private.updateColorSlider.call(this, value);
                    };

                    this.newPicker = this.colorPicker;
                }

            } else if (/(\bgetImage\s*\(\s*)([^\)]*)$/.test(prefix)) {
                var paramsPos = pos.column - RegExp.$2.length;
                var beforeGetImage = prefix.substring(0, paramsPos - RegExp.$1.length);

                if (/^([^\s]*?)\s*(\)|$)/.test(line.slice(paramsPos))) {
                    var Range = ace.require("ace/range").Range;

                    this.oldValue = RegExp.$1;
                    this.range = new Range(pos.row, paramsPos, pos.row, paramsPos + this.oldValue.length);

                    // Insert a); if one doesn't exist
                    if (RegExp.$2.length === 0) {
                        this.ignore = true;

                        if (record) {
                            record.pauseLog();
                        }

                        editor.session.getDocument().insertInLine({ row: pos.row, column: line.length },
                            (this.oldValue ? "" : (this.oldValue = '"' + defaultImage + '"')) + ")" +
                            (isInParenthesis(beforeGetImage) ? "" : ";"));
                        editor.selection.setSelectionRange(this.range);
                        editor.selection.clearSelection();

                        if (record) {
                            record.resumeLog();
                        }

                        this.ignore = false;
                    }

                    this.handle = function(value) {
                        _private.updateImagePicker.call(this, value);
                    };

                    _private.attachImagePicker.call(this);
                    _private.updateImagePicker.call(this, this.oldValue);
                    this.newPicker = this.imagePicker;
                }

            } else {
                var before = pos.column - (/([\d.-]+)$/.test(prefix) ? RegExp.$1.length : 0);

                if (/^([\d.-]+)/.test(line.slice(before)) && !isNaN(parseFloat(RegExp.$1))) {
                    var Range = ace.require("ace/range").Range;

                    this.oldValue = RegExp.$1;
                    this.firstNumString = this.oldValue;
                    this.firstNum = parseFloat(this.oldValue);
                    this.range = new Range(pos.row, before, pos.row, before + this.oldValue.length);

                    // repeated
                    this.newPicker = this.scrubber;
                    this.handle = function(value) {
                        _private.updateNumberScrubber.call(this, value);
                    };
                }
            }

        },
        onUpdatePosition: function() {
            var editor = this.options.editor;

            var pos = editor.selection.getCursor();
            var editorBB = editor.renderer.scroller.getBoundingClientRect();
            var editorHeight = editorBB.height;
            var coords = editor.renderer.textToScreenCoordinates(pos.row,
                this.curPicker !== this.scrubber ? editor.session.getDocument().getLine(pos.row).length : pos.column);
            var relativePos = coords.pageY - editorBB.top;
            // repeated
            this.curPicker
                .css({ top: $(window).scrollTop() + coords.pageY, left: coords.pageX })
                .toggle(!(relativePos < 0 || relativePos >= editorHeight));
        },
        onNewNumber: function(newValue) {
            var range = this.range;
            var editor = this.options.editor;
            var record = this.options.record;

            if (!range) {
                return;
            }

            this.ignore = true;

            if (record) {
                record.pauseLog();
            }

            // Insert the new number
            range.end.column = range.start.column + this.oldValue.length;
            editor.session.replace(range, newValue);

            // Select and focus the updated number
            if (this.curPicker !== this.imagePicker) {
                range.end.column = range.start.column + newValue.length;
                editor.selection.setSelectionRange(range);
            }

            if (record) {
                record.resumeLog();
                record.log({ hot: newValue });
            }

            this.ignore = false;
            this.oldValue = newValue;
        }
    };


    var blocklyEditor = {
        onInit: function() {
            var blockly = this.options.blockly;

            var self = this;

            // We can't listen to change listener due to endless loop
            // Ideally, Blockly would fire something like a FieldSelected listener

            // Listen to mouseenter on input so we can turn number scrubber on
            // Delegate, since the input can come and go
            $(blockly.WidgetDiv.DIV).on("mouseenter", "input", function(e) {
                _private.checkNumber.call(self);
            });

            // Listen to click on SVG so we can turn pickers on/off
            $(blockly.svg).on("click", function(e) {
                // To check when they click elsewhere
                _private.checkNumber.call(self);
            });

            _private.attachScrubber.call(this);
        },
        onNumberCheck: function() {
            var selected = this.options.blockly.selected;

            if (!selected) {
                return;
            }
            if (selected.type === "image_picker") {
                var imageField = selected.inputList[0].fieldRow[0];
                var imageUrl = selected.getPathlessUrl();

                this.handle = function(value) {
                    _private.updateImagePicker.call(this, value);
                };
                _private.attachImagePicker.call(this);
                _private.updateImagePicker.call(this, imageUrl);

                this.newPicker = this.imagePicker;
                this.selectedNode = imageField.getRootElement();

            } else if (selected.type === "math_number") {
                var textField = selected.inputList[0].fieldRow[0];
                this.firstNum = parseFloat(textField.getValue(), 10);
                this.firstNumString = String(this.firstNum);

                // Repeated later
                this.handle = function(value) {
                    _private.updateNumberScrubber.call(this, value);
                };
                this.newPicker = this.scrubber;
                this.selectedNode = textField.getRootElement();
            }
        },
        onUpdatePosition: function() {
            var container = this.options.blockly.svg;
            var selected = this.options.blockly.selected;

            var coords = selected.getRelativeToSurfaceXY();
            var realLeft = selected.workspace.getMetrics().absoluteLeft;
            var fieldSize = selected.getHeightWidth();
            var editorHeight = $(container).height();
            var isOnScreen = !(coords.y < 0 || coords.y >= editorHeight);
            this.curPicker
                .css({ top: $(window).scrollTop() + coords.y + 10,
                       left: realLeft + coords.x + fieldSize.width/2})
                .toggle(isOnScreen);
        },
        onNewNumber: function(newValue) {
            var selected = this.options.blockly.selected;

            var input = this.options.blockly.FieldTextInput.htmlInput_;
            if (selected && selected.type === "image_picker") {
                var imageField = selected.inputList[0].fieldRow[0];
                imageField.setValue(newValue);
                selected.workspace.fireChangeEvent();
            } else if (input) {
                $(input).val(newValue);
                this.options.blockly.fireUiEventNow(input, 'keypress');
            }
        }
    };

    var _private = {
        defaults: {
            type: "ace",  // 'blockly' or 'ace',
            imagesDir: "./"
            // container, editor, record, depending on whether ACE or Blockly
        },
        getOrMakeHotNumber: function(elem, options) {
            var hotNumber = elem.hotNumberObj;

            if (hotNumber && hotNumber.constructor == HotNumber.prototype.constructor) {
                if (options) _private.customizeHotNumber.call(marquee, options);
                return hotNumber;
            } else {
                hotNumber = new HotNumber(elem, options);
                elem.hotNumberObj = hotNumber;
                return hotNumber;
            }
        },
        customizeHotNumber: function(options) {
            this.options = options || {};
            for (var optKey in _private.defaults) {
                if (!this.options[optKey]) {
                    this.options[optKey] = _private.defaults[optKey];
                }
            }
            if (options.type === "ace") {
                this.editor = aceEditor;
            } else if (options.type === "blockly") {
                this.editor = blocklyEditor;
            } else {
                console.warn("Unknown editor type");
                return;
            }
        },
        attachScrubber: function() {
            if (this.scrubber) {
                return;
            }

            var self = this;
            var scrubberHandle = $("<div class='scrubber-handle'/>")
                .text("◄ ◆ ►")
                .draggable({
                    axis: "x",
                    drag: function() {
                        self.scrubber.addClass("dragging");

                        var thisOffset = $(this).offset();
                        var parentOffset = $(this).parent().offset();
                        var dx = thisOffset.left - parentOffset.left;

                        // The interval of the scrubber is determined like so:
                        //
                        // If the original number contains no decimal point, the
                        // interval is 10^0 = 1.
                        //
                        // Otherwise, the interval corresponds to the least
                        // significant digit. So both 0.01 and 0.91 will operate
                        // on an interval of 10^-2 = 0.01.
                        var powerOfTen = -decimalCount(self.firstNumString);

                        if (powerOfTen < -5) {
                            powerOfTen = -5;
                        }

                        if (self.handle) {
                            self.handle(Math.round(dx / 2.0) * Math.pow(10, powerOfTen));
                        }
                    },
                    stop: function() {
                        self.scrubber.removeClass("dragging");

                        $(this).css({
                            left: 0,
                            top: 0
                        });
                        _private.checkNumber.call(self);
                    }
                });

            this.scrubber = $("<div class='hotnumber'><div class='scrubber'></div><div class='arrow'></div></div>")
                .appendTo("body")
                .find(".scrubber")
                    .append(scrubberHandle)
                    .end()
                .hide();
        },
        attachColorPicker: function() {
            if (this.colorPicker) {
                return;
            }

            var self = this;
            var editor = this.options.editor;
            var over = false, down = false;
            var reposition = function($picker) {
                var pos = editor.selection.getCursor(),
                    coords = editor.renderer.textToScreenCoordinates(
                        pos.row, editor.session.getDocument().getLine(
                            pos.row).length);

                $picker.css({
                    top: $(window).scrollTop() + coords.pageY,
                    left: coords.pageX
                });
            };

            this.colorPicker = $("<div class='hotnumber picker'><div id='hotpicker' class='picker'></div><div class='arrow'></div></div>")
                .appendTo("body")
                .find(".picker").ColorPicker({
                    flat: true,
                    onChange: function(hsb, hex, rgb) {
                        if (self.handle) {
                            self.handle(rgb);
                        }
                    }
                }).end()
                .bind("mouseenter", function() {
                    over = true;
                })
                .bind("mouseleave", function() {
                    over = false;
                    if (!down) {
                        reposition($(this));
                    }
                    editor.focus();
                })
                .mousedown(function() {
                    var $picker = $(this);
                    $picker.addClass("active");
                    down = true;

                    $(document).one("mouseup", function() {
                        $picker.removeClass("active");
                        down = false;
                        if (!over) {
                            reposition($picker);
                        }
                    });
                })
                .hide();
        },
        attachImagePicker: function() {
            if (!this.imagePicker) {
                var imagesDir = this.options.imagesDir;

                var tmpl = _public.getImagePickerTemplate();

                var results = tmpl({
                    imagesDir: imagesDir,
                    groups: _.map(OutputImages, function(data) {
                        data.imagesDir = imagesDir;
                        return data;
                    })
                });

                var self = this;
                this.imagePicker = $("<div class='hotnumber imagepicker'>" + results +
                        "<div class='arrow'></div></div>")
                    .appendTo("body")
                    .delegate(".image", "click", function() {
                        $(".imagepicker .active").removeClass("active");

                        if (self.handle) {
                            $(this).addClass("active");

                            self.handle($(this).attr("data-path"));
                        }
                    })
                    .bind("mouseleave", function() {
                        $(this).hide();

                        // This is to change the position with ACE
                        // TODO(pamela): move this out into ACE specific
                        var editor = self.options.editor;
                        if (editor) {
                            var pos = editor.selection.getCursor(),
                            coords = editor.renderer.textToScreenCoordinates(pos.row,
                                editor.session.getDocument().getLine(pos.row).length);

                            $(this).css({ top: $(window).scrollTop() + coords.pageY, left: coords.pageX });
                        }

                    })
                    .hide();
            }
        },
        checkNumber: function() {
            if (this.ignore) {
                return;
            }

            this.oldPicker = this.curPicker;
            this.newPicker = null;

            this.editor.onNumberCheck.call(this);

            if (this.oldPicker && this.oldPicker !== this.newPicker) {
                this.oldPicker.hide();
            }

            if (this.newPicker) {
                this.curPicker = this.newPicker;
                _private.updatePos.call(this);
            } else {
                this.curPicker = null;
            }
        },
        updatePos: function() {
            if (!this.curPicker) {
                return;
            }

            this.editor.onUpdatePosition.call(this);
        },
        updateColorSlider: function(rgb) {
            if (!this.range) {
                return;
            }

            // Replace the old color with the new one
            _private.updateEditor.call(this, rgb.r + ", " + rgb.g + ", " + rgb.b);
        },
        updateNumberScrubber: function(newNum) {
            if (this.firstNum === undefined) {
                return;
            }

            newNum = this.firstNum + newNum;

            var newNumString = newNum.toString();
            var fixed = newNum.toFixed(5);

            // Using a really small interval (1e-5), we start hitting float
            // precision issues during addition/subtraction, so cap the number of
            // digits after the decimal
            if (fixed.length < newNumString.length) {
                newNumString = fixed;
            }

            // Force the number of decimal places in the new number to match the
            // number of decimal places in the original number.
            var firstDecCount = decimalCount(this.firstNumString);
            var newDecCount = decimalCount(newNumString);

            if (newDecCount > firstDecCount) {
                // Truncate (assuming no rounding error, should first be removing
                // zeros)
                newNumString = newNumString.substr(0,
                    newNumString.length - (newDecCount - firstDecCount));
            } else if (newDecCount < firstDecCount) {
                // Pad with 0's, possibly preceded by a decimal place.
                if (newDecCount === 0) {
                    newNumString += ".";
                }
                newNumString += Array(1 + (firstDecCount - newDecCount)).join("0");
            }

            // Replace the old number with the new one
            _private.updateEditor.call(this, newNumString);
        },
        updateImagePicker: function(path) {
            // Remove old quotes
            path = path.replace(/"/g, "");

            var pathParts = path.split("/");
            var groupName = pathParts[0];
            var fileName = pathParts[1];
            var foundPath = defaultImage;

            _.each(OutputImages, function(group) {
                if (group.groupName === groupName) {
                    _.each(group.images, function(imageName) {
                        if (imageName === fileName) {
                            foundPath = path;
                        }
                    });
                }
            });

            path = foundPath;

            var fullPath = this.options.imagesDir + path + ".png";
            this.imagePicker.find(".current-image img")
                .attr("src", fullPath);

            // Update the old path with a new one
            _private.updateEditor.call(this, '"' + foundPath + '"');
        },
        updateEditor: function(newValue) {
            this.editor.onNewNumber.call(this, newValue);
        }
    };

    // The public constructor and methods
    var HotNumber = function(options) {
        _private.customizeHotNumber.call(this, options);
        this.editor.onInit.call(this, options);
    };

    var _public = function(el, options) {
        return _private.getOrMakeHotNumber(el, options);
    };

    _public.getImagePickerTemplate = function() {
        return Handlebars.templates.imagepicker;
    };

    return _public;
};

window.HotNumber = HotNumberModule();

})(window);
(function() {
  var template = Handlebars.template, templates = Handlebars.templates = Handlebars.templates || {};
templates['imagepicker'] = template(function (Handlebars,depth0,helpers,partials,data) {
  this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Handlebars.helpers); data = data || {};
  var buffer = "", stack1, helper, functionType="function", escapeExpression=this.escapeExpression, self=this;

function program1(depth0,data) {
  
  var buffer = "", stack1, helper;
  buffer += "\n<div class=\"image-group\">\n    <h3 class=\"image-group\">";
  if (helper = helpers.groupName) { stack1 = helper.call(depth0, {hash:{},data:data}); }
  else { helper = (depth0 && depth0.groupName); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
  buffer += escapeExpression(stack1)
    + "</h3>\n    ";
  stack1 = helpers['if'].call(depth0, (depth0 && depth0.cite), {hash:{},inverse:self.noop,fn:self.program(2, program2, data),data:data});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\n    ";
  stack1 = helpers.each.call(depth0, (depth0 && depth0.images), {hash:{},inverse:self.noop,fn:self.programWithDepth(4, program4, data, depth0),data:data});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\n</div>\n";
  return buffer;
  }
function program2(depth0,data) {
  
  var buffer = "", stack1, helper;
  buffer += "\n        <p><a href=\"";
  if (helper = helpers.citeLink) { stack1 = helper.call(depth0, {hash:{},data:data}); }
  else { helper = (depth0 && depth0.citeLink); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
  buffer += escapeExpression(stack1)
    + "\" target=\"_blank\">";
  if (helper = helpers.cite) { stack1 = helper.call(depth0, {hash:{},data:data}); }
  else { helper = (depth0 && depth0.cite); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
  buffer += escapeExpression(stack1)
    + "</a></p>\n    ";
  return buffer;
  }

function program4(depth0,data,depth1) {
  
  var buffer = "", stack1;
  buffer += "\n    <div class=\"image\" data-path=\""
    + escapeExpression(((stack1 = (depth1 && depth1.groupName)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
    + "/"
    + escapeExpression((typeof depth0 === functionType ? depth0.apply(depth0) : depth0))
    + "\">\n        <img src=\""
    + escapeExpression(((stack1 = (depth1 && depth1.imagesDir)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
    + escapeExpression(((stack1 = (depth1 && depth1.groupName)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
    + "/"
    + escapeExpression((typeof depth0 === functionType ? depth0.apply(depth0) : depth0))
    + ".png\"/>\n        <span class=\"name\">"
    + escapeExpression((typeof depth0 === functionType ? depth0.apply(depth0) : depth0))
    + "</span>\n    </div>\n    ";
  return buffer;
  }

  buffer += "<div class=\"current-image\"><img src=\"";
  if (helper = helpers.imagesDir) { stack1 = helper.call(depth0, {hash:{},data:data}); }
  else { helper = (depth0 && depth0.imagesDir); stack1 = typeof helper === functionType ? helper.call(depth0, {hash:{},data:data}) : helper; }
  buffer += escapeExpression(stack1)
    + "cute/Blank.png\"/></div>\n<div class=\"image-groups\">\n";
  stack1 = helpers.each.call(depth0, (depth0 && depth0.groups), {hash:{},inverse:self.noop,fn:self.program(1, program1, data),data:data});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\n</div>\n";
  return buffer;
  });
})();