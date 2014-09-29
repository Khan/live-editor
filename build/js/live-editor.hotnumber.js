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

/**
 * Helper functionality for the Scratchpad auto suggest feature,
 * parameter information and live documentation.
 */
window.ScratchpadAutosuggest = {
    /**
     * Initializes the autosuggest functionality and adds/modifies the
     * completers to be applicable to KA.
     */
    init: function(editor) {
        this.initialized = true;
        this.editor = editor;
        this.enableLiveCompletion(true);
        var langTools = ace.require("ace/ext/language_tools");

        var customCompleters = [ScratchpadAutosuggestData._keywords,
            ScratchpadAutosuggestData._pjsFunctions,
            ScratchpadAutosuggestData._pjsVariables,
            ScratchpadAutosuggestData._pjsCallbacks,
            ScratchpadAutosuggestData._pjsObjectConstructors,
            ScratchpadAutosuggestData._pjsObjects];

        // Remove the default keywords completer, it includes a ton of
        // things we don't want to expose to the user like window,
        // document, etc...
        // Also remove the textCompleter. We'll use this wraped up in
        // our own completer for local variables.
        for (var i = editor.completers.length - 1; i >= 0; i--) {
            if (editor.completers[i] === langTools.keyWordCompleter) {
                editor.completers.splice(i, 1);
            } else if (editor.completers[i] === langTools.textCompleter) {
                this.internalTextCompleter = editor.completers[i];
                editor.completers.splice(i, 1);
            }
        }

        /*
        // Local completer is currently disabled because it doesn't work
        // perfectly, even with wrapping it.  I think implementing a custom
        // one before enabling would be best.

        // The internal local completer thinks numbers are identifiers
        // and suggests them if they are used, get rid of that by
        // wrapping the internal local completer in our own!
        this.localVariableCompleter = {
            getCompletions: function(editor, session, pos, prefix,
                                     callback) {
                if (prefix && isNaN(prefix[0])) {
                    this.internalTextCompleter.getCompletions(editor,
                        session, pos, prefix, callback);
                    return;
                }

                if (prefix.length === 0) {
                    callback(null, []);
                }
            }.bind(this)
        };
        langTools.addCompleter(this.localVariableCompleter);
        */

        // Completer for keywords and pjs
        this.customCompleter = {
            getCompletions: function(editor, session, pos, prefix, callback) {
                if (prefix.length === 0) {
                    callback(null, []);
                    return;
                }

                var completions = [];
                customCompleters.forEach(function(c) {
                    c.whitelist.forEach(function(o) {
                      // Completer entries can be simple strings or objects.
                      // If it's an object it usually has live documentation
                      // info inside of it.  Extract the name here.
                      var f = o;
                      if (_.isObject(o)) {
                          f = o.name;
                      }

                      // Only return a result if it's a prefix.
                      var funcName = f.split("(")[0];
                      if (funcName.indexOf(prefix) === -1) {
                          return;
                      }
                      completions.push({
                          // name can be anything unique
                          name: f + "-name",
                          // value is what's used for showing/autocompleting
                          value: funcName,
                          // We just rate everything the same for now. There's
                          // some basic internal matching based on keystrokes.
                          score: 299,
                          // The type to display next to the autosuggest
                          // This is a human readable short descriptive name
                          // such as: pjs function.
                          meta: c.type,
                      });
                    }.bind(this));
                }.bind(this));
                callback(null, completions);
            }
        };

        langTools.addCompleter(this.customCompleter);
    },
    /**
     * It's sometimes useful to not have live completion. So expose a way to
     * enable and disable it. This is used for example when entering text
     * within a comment. The hotnumber code tells us not to do autosuggest.
     * @param enable true to enable autosuggest
     */
    enableLiveCompletion: function(enable) {
        // Ignore enableLiveCompletion calls if we're not initialized
        if (!this.initialized) {
            return;
        }
        this.editor.setOptions({
          // enable live popping up of the autosuggest
          enableLiveAutocompletion: enable
        });
    },
    /**
     * Returns the list of parameters for the specified function
     * This is used for the parameter info popup within lookupParamsSafeHTML.
     * @param lookup The function to lookup
     */
    lookupParams: function(lookup) {
        // Ignore lookupParams calls if we're not initialized
        if (!this.initialized) {
            return;
        }
        var found =_.find(ScratchpadAutosuggestData
                        ._pjsFunctions.whitelist,function(o) {
            var f = o;
            if (_.isObject(o)) {
                f = o.name;
            }
            return f.split("(")[0] === lookup;
        });

        // If we don't have a funciton, check the keywords list
        // This feature isn't currently used but you can enable it
        // to give help for things like for loops by providing an
        // example of how it is used.
        if (!found) {
            found = _.find(ScratchpadAutosuggestData
                        ._keywords.whitelist, function(o) {
                if (_.isObject(o)) {
                    var f = o.name;
                    return f === lookup;
                }
                return false;
            });
        }

        if (!found) {
            return;
        }
        return found;
    },
    /**
     * Returns the list of parameters for the specified function in a safe
     * to present to user HTML formatted way.
     * @param f The function to lookup.
     * @param paramsToCursor The params specified so far. Used so the current
     *                       param can be marked up.
     */
    lookupParamsSafeHTML: function(f, paramsToCursor) {
        // Split up all the parameters the user specified sof far.
        var paramPositionLookup = paramsToCursor.split(",").length - 1;
        var found = this.lookupParams(f);
        if (!found) {
            return;
        }

        var f = found;
        var description, params, isFunction = true, exampleURL;
        var autosuggestDescription = $("<div class='autosuggest-info'/>")
                .hide();

        // Autosuggest functions can be objects or simple strings.
        // When it's an object it has the extra live documentation info.
        // Either can be used, so handle both cases here.
        if (_.isObject(found)) {
            f = found.name;
            description = found.description;
            exampleURL = found.exampleURL;
            params = found.params;
            if (!_.isUndefined(found.isFunction)) {
                isFunction = found.isFunction;
            }
        }

        // Small helper that's used at various places below.
        // It obtains the parameter indexed at i or an empty string if none.
        var getParamInfo = function(i) {
            if (!params || i >= params.length) {
                return "";
            }
            return params[i];
        };

        // Setup the function name and if there's an example URL for how to
        // use this function, link it up.
        var fnParts = f.split("(");
        var fnName = $("<span class='autosuggest-function'/>")
            .text(fnParts[0]);
        var descriptionElements = $();
        if (description) {
            descriptionElements = descriptionElements .add(
                fnName.data("param-info",
                    description).data("exampleURL", exampleURL));
        }

        // Get plain text params, if there aren't any bail out here.
        var plainParams = fnParts.length > 1 ?
            fnParts[1].substring(0, fnParts[1].length - 1) : "";
        if (_.isUndefined(plainParams)) {
            return;
        }

        var lookupParams = plainParams.split(",");
        var returnParams = $("<span/>");
        var extraError;

        // Add a warning if too many params were specified
        if (paramPositionLookup >= lookupParams.length &&
                fnName !== "debug") {
            paramPositionLookup = lookupParams.length - 1;
            extraError = $("  <span class='autosuggest-error'/>")
                            .text(" Too many arguments passed!");
        }

        // Add in the first params before the *current* one
        for (var i = 0; i < paramPositionLookup; i++) {
            if (returnParams.children().length) {
                returnParams.append($("<span/>").text(", "));
            }
            returnParams.append($("<span class='autosuggest-param-info'/>")
                        .text(lookupParams[i])
                        .data("param-info", getParamInfo(i)));
        }
        if (returnParams.children().length) {
            returnParams.append($("<span>").text(", "));
        }

        // Add in the *current* param
        returnParams
            .append($("<span class='current-param autosuggest-param-info'/>")
            .text(lookupParams[paramPositionLookup])
            .data("param-info", getParamInfo(i)));

        // Add in the params after the *current* param
        for (var i = paramPositionLookup + 1; i < lookupParams.length; i++) {
            if (returnParams.children().length) {
                returnParams.append($("<span/>").text(", "));
            }
            returnParams.append($("<span class='autosuggest-param-info'/>")
                        .text(lookupParams[i])
                        .data("param-info", getParamInfo(i)));
        }

        // For each param, add some data with parameter info
        returnParams.find(".autosuggest-param-info").each(function() {
            if ($(this).data("param-info")) {
                descriptionElements = descriptionElements.add($(this));
            }
        });

        // If they hover over the name of functions or params,
        // then show the description!
        descriptionElements.mouseenter(function(e) {
            var data = $(e.target).addClass("autosuggest-highlight")
                                  .data("param-info");
            autosuggestDescription.text("  " + data).show();
            $(".arrow").hide();
        }).mouseleave(function(e) {
            $(e.target).removeClass("autosuggest-highlight");
            autosuggestDescription.hide();
            $(".arrow").show();
        }).mousedown(function(e) {
            // If clicking on the function name, show the url in a new tab
            var exampleURL = $(e.target).addClass("autosuggest-highlight")
                                        .data("exampleURL");
            if (exampleURL) {
                window.open(exampleURL, "_blank");
            }
        });

        // Return the HTML desription popup
        return $("<span/>").append(fnName)
                           .append(isFunction ? $("<span/>").text("(") : null)
                           .append(returnParams)
                           .append(isFunction ? $("<span/>").text(")") : null)
                           .append(extraError)
                           .append(autosuggestDescription);
    }
};

// Helper functionality for the Scratchpad auto suggest feature
window.ScratchpadAutosuggestData = {
    _keywords: {
        type: $._("keyword"),
        whitelist: ["break", "case", "catch", "continue", "default", "delete",
            "do", "else", "finally",
            /*
             * This is possible, but some may find it too annoying
            {
                name: "for",
                description: "Example: for (var x = 0; x < 10; x++) { }",
                isFunction: false
            },
            */
            "for", "function", "if", "in", "instanceof", "new", "return",
            "switch", "this", "throw", "try", "typeof", "var", "void",
            "while", "with"]
    },
    _pjsFunctions: {
        type: $._("function"),
        whitelist: [
            {
                name: "rect(x, y, width, height, radius*)",
                exampleURL: "/cs/rectx-y-w-h/839496660",
                description: $._("Draws a rectangle, using the first two coordinates as the top left corner and the last two as the width/height. For alternate ways to position, see rectMode."),
                params: [
                    $._("x: the x-coordinate of the top left corner"),
                    $._("y: the y-coordinate of the top left corner"),
                    $._("width: the width of the rectangle"),
                    $._("height: the height of the rectangle"),
                    $._("radius:(Optional) the radius of the corners, to round the rectangle")
                ]
            },
            {
                name: "ellipse(x, y, w, h)",
                exampleURL: "/cs/ellipsex-y-w-h/839435680",
                description: $._("Draws an ellipse, using the first two parameters as the center coordinates and the last two as the width/height. For alternate ways to position, see ellipseMode."),
                params: [
                    $._("x: the x-coordinate of the center"),
                    $._("y: the y-coordinate of the center"),
                    $._("width: the width of the ellipse"),
                    $._("height: the height of the ellipse")
                ]
            },
            {
                name: "triangle(x1, y1, x2, y2, x3, y3)",
                exampleURL: "/cs/trianglex1-y1-x2-y2-x3-y3/839546599",
                description: $._("Draws a triangle"),
                params: [
                    $._("x: the x-coordinate of the first vertex"),
                    $._("y1: the y-coordinate of the first vertex"),
                    $._("x2: the x-coordinate of the second vertex"),
                    $._("y2: the y-coordinate of the second vertex"),
                    $._("x3: the x-coordinate of the third vertex"),
                    $._("y3: the y-coordinate of the third vertex")
                ]
            },
            {
                name: "line(x1, y1, x2, y2)",
                exampleURL: "/cs/linex1-y1-x2-y2/827916099",
                description:
                    $._("Draws a line from one point to another. The color of the line is determined by the most recent stroke() call. The thickness of the line is determined by the most recent strokeWeight() call. The line ending style can be changed using strokeCap()."),
                params: [
                    $._("x1: the x-coordinate of the first point"),
                    $._("y1: the y-coordinate of the first point"),
                    $._("x2: the x-coordinate of the second point"),
                    $._("y2: the y-coordinate of the second point")
                ]
            },
            {
                name: "point(x, y)",
                exampleURL: "/cs/pointx-y/827809834",
                description: $._("Draws a point. The color is determined by the most recent stroke() call and the thickness is determined by the most recent strokeWeight() call."),
                params: [
                    $._("x: the x-coordinate of the point"),
                    $._("y: the y-coordinate of the point")
                ]
            },
            {
                name: "arc(x, y, w, h, start, stop)",
                exampleURL: "/cs/arcx-y-w-h-start-stop/1903619297",
                description: $._("Draws an arc.   It is very similar to an ellipse(), except that the final two parameters, start and stop, decide how much of the ellipse to draw."),
                params: [
                    $._("x: The x-coordinate of the center of the complete ellipse derived from the arc"),
                    $._("y: The y-coordinate of the center of the complete ellipse derived from the arc"),
                    $._("width: The width of the complete ellipse formed by the partial arc"),
                    $._("height: The height of the complete ellipse formed by the partial arc"),
                    $._("start: The angle to start the arc at"),
                    $._("stop: The angle to stop the arc at")
                ]
            },
            {
                name: "bezier(x1, y1, cx1, cy1, cx2, cy2, x2, y2)",
                exampleURL: "/cs/bezierx1-y1-cx1-cy1-cx2-cy2-x2-y2/956920482",
                description: $._("Draws a bezier curve. To extract points and tangents after drawing the curve, use bezierPoint() and bezierTangent."),
                params: [
                    $._("x1: the x-coordinate of the first endpoint"),
                    $._("y1: the y-coordinate of the first endpoint"),
                    $._("cx1: the x-coordinate of the first control point"),
                    $._("cy1: the y-coordinate of the first control point"),
                    $._("cx2: the x-coordinate of the second control point"),
                    $._("cy2: the y-coordinate of the second control point"),
                    $._("x2: the x-coordinate of the second endpoint"),
                    $._("y2: the y-coordinate of the second endpoint")
                ]
            },
            {
                name: "quad(x1, y1, x2, y2, x3, y3, x4, y4)",
                exampleURL: "/cs/quadx1-y1-x2-y2-x3-y3-x4-y4/1907244018",
                description: $._("Draws any quadrilateral, with the points listed as parameters in a clockwise or counter-clockwise direction."),
                params: [
                    $._("x1: the x-coordinate of the first vertex"),
                    $._("y1: the y-coordinate of the first vertex"),
                    $._("x2: the x-coordinate of the second vertex"),
                    $._("y2: the y-coordinate of the second vertex"),
                    $._("x3: the x-coordinate of the third vertex"),
                    $._("y3: the y-coordinate of the third vertex"),
                    $._("x4: the x-coordinate of the fourth vertex"),
                    $._("y4: the y-coordinate of the fourth vertex")
                ]
            },
            {
                name: "image(image, x, y, width*, height*)",
                exampleURL: "/cs/imageimage-x-y/937672662",
                description: $._("Draw an image on the canvas. The only allowed images are those that popup in the image picker when you use the getImage() method. The image is positioned using the x/y as the upper left corner. For alternate ways to position images, see imageMode."),
                params: [
                    $._("image: an image returned by getImage()"),
                    $._("x: the x-coordinate of the top left corner"),
                    $._("y: the y-coordinate of the top left corner"),
                    $._("width: (Optional) the width of the drawn image"),
                    $._("height: (Optional) the height of the drawn image")
                ]
            },
            {
                name: "rectMode(MODE)",
                exampleURL: "/cs/rectmodemode/4556457341091840",
                description: $._("Modifies the location from which rectangles draw."),
                params: [
                    $._("MODE: The mode, either CORNER, CORNERS, CENTER, or RADIUS. The default is CORNER.")
                ]
            },
            {
                name: "ellipseMode(MODE)",
                exampleURL: "cs/ellipsemodemode/6709863212122112",
                description: $._("Changes how ellipses are drawn."),
                params: [
                    $._("MODE: The mode, either CORNER, CORNERS, CENTER, or RADIUS. The default is CENTER.")
                ]
            },
            {
                name: "imageMode(MODE)",
                exampleURL: "/cs/imagemodemode/5295050787389440",
                description: $._("Modifies the location from which images are drawn."),
                params: [
                    $._("MODE: Either CENTER, CORNERS, or CORNER. The default is CORNER.")
                ]
            },
            {
                name: "bezierPoint(a, b, c, d, t)",
                exampleURL: "/cs/bezierpointa-b-c-d-t/4551007698681856",
                description: $._("Evaluates the Bezier at point t for points a, b, c, d. The parameter t varies between 0 and 1, a and d are points on the curve, and b and c are the control points. This can be done once with the x coordinates and a second time with the y coordinates to get the location of a bezier curve at t."),
                params: [
                    $._("a: coordinate of first point on the curve"),
                    $._("b: coordinate of first control point"),
                    $._("c: coordinate of second control point"),
                    $._("d: coordinate of second point on the curve"),
                    $._("t: value between 0 and 1")
                ]
            },
            {
                name: "bezierTangent(a,b, c, d, t)",
                exampleURL: "/cs/beziertangenta-b-c-d-t/4736929853603840",
                description: $._("Calculates the tangent of a point on a bezier curve. The parameter t varies between 0 and 1, a and d are points on the curve, and b and c are the control points. This can be done once with the x coordinates and a second time with the y coordinates to get the tangent of a bezier curve at t."),
                params: [
                    $._("a: coordinate of first point on the curve"),
                    $._("b: coordinate of first control point"),
                    $._("c: coordinate of second control point"),
                    $._("d: coordinate of second point on the curve"),
                    $._("t: value between 0 and 1")
                ]
            },
            {
                name: "bezierVertex(cx1, cy1, cx2, cy2, x, y)",
                exampleURL: "/cs/beziervertexcx1-cy1-cx2-cy2-x-y/5085481683386368",
                description: $._("Used in conjunction with beginShape() and endShape() to draw shapes with bezier curves for sides. Each call to bezierVertex() defines the position of two control points and one anchor point of a Bezier curve, adding a new segment to a line or shape. The first time bezierVertex() is used within a beginShape() call, it must be prefaced with a call to vertex() to set the first anchor point. When using this function, do *not* specify a mode in beginShape()."),
                params: [
                    $._("cx1: The x-coordinate of 1st control point"),
                    $._("cy1: The y-coordinate of 1st control point"),
                    $._("cx2: The x-coordinate of 2nd control point"),
                    $._("cy2: The y-coordinate of 2nd control point"),
                    $._("x: The x-coordinate of anchor point"),
                    $._("y: The y-coordinate of anchor point")
                ]
            },
            {
                name: "curve(x1, y1, x2, y2, x3, y3, x4, y4)",
                exampleURL: "/cs/curve/5105742184972288",
                description: $._("Draws a curved line on the screen. The first and second parameters specify the first anchor point and the last two parameters specify the second anchor. The middle parameters specify the points for defining the shape of the curve. Longer curves can be created by putting a series of curve() functions together. An additional function called curveTightness() provides control for the visual quality of the curve. The curve() function is an implementation of Catmull-Rom splines."),
                params: [
                    $._("x1: the x coordinate of first anchor point"),
                    $._("y1: the y coordinate of first anchor point"),
                    $._("x2: the x coordinate of first point"),
                    $._("y2: the y coordinate of first point"),
                    $._("x3: the x coordinate of second point"),
                    $._("y3: the y coordinate of second point"),
                    $._("x4: the x coordinate of second anchor point"),
                    $._("y4: the y coordinate of second anchor point")
                ]
            },
            {
                name: "curvePoint(a, b, c, d, t)",
                exampleURL: "/cs/curvepointa-b-c-d-t/5879387094253568",
                description: $._("Evalutes the curve at point t for points a, b, c, d. The parameter t varies between 0 and 1, a and d are points on the curve, and b and c are the control points. This can be done once with the x coordinates and a second time with the y coordinates to get the location of a curve at t."),
                params: [
                    $._("a: the coordinate of the first point"),
                    $._("b: the coordinate of the first control point"),
                    $._("c: the coordinate of the second point"),
                    $._("d: the coordinate of the second point"),
                    $._("t: the a value between 0 and 1")
                ]
            },
            {
                name: "curveTangent(a, b, c, d, t)",
                exampleURL: "/cs/curvetangenta-b-c-d-t/4708940860358656",
                description: $._("Calculates the tangent at a point the curve. The parameter t varies between 0 and 1, a and d are points on the curve, and b and c are the control points. This can be done once with the x coordinates and a second time with the y coordinates to get the tangent of a curve at t."),
                params: [
                    $._("a: the coordinate of the first point"),
                    $._("b: the coordinate of the first control point"),
                    $._("c: the coordinate of the second point"),
                    $._("d: the coordinate of the second point"),
                    $._("t: the a value between 0 and 1")
                ]
            },
            {
                name: "curveTightness(tightness)",
                exampleURL: "/cs/curvetightnesssquishy/4792873740402688",
                description: $._("Modifies the quality of forms created with curve() and curveVertex(). The tightness parameter determines how the curve fits to the vertex points."),
                params: [
                    $._("tightness: amount of deformation from the original vertices")
                ]
            },
            {
                name: "curveVertex(x,y)",
                exampleURL: "/cs/curvevertexx-y/6499542019080192",
                description: $._("Used in conjunction with beginShape() and endShape() to draw shapes with bezier curves for sides. The first and last points in a series of curveVertex() lines will be used to guide the beginning and end of a the curve."),
                params: [
                    $._("x: the x-coordinate of the vertex"),
                    $._("y: the y-coordinate of the vertex")
                ]
            },
            {
                name: "beginShape(MODE*)",
                exampleURL: "/cs/beginshapeendshape/5462945756610560",
                description: $._("Using the beginShape() and endShape() functions allow creating more complex forms. To start a form, call beginShape(), then use the vertex() command, then call endShape() to stop. By default, it creates an irregular polygon, but you can control that by sending a mode to beginShape().  Transformations such as translate(), rotate(), and scale() do not work within beginShape(). It is also not possible to use other shapes, such as ellipse() or rect() within beginShape()."),
                params: [
                    $._("MODE: (Optional) Shape mode. Either POINTS, LINES, TRIANGLES, TRIANGLE_FAN, TRIANGLE_STRIP, QUADS, and QUAD_STRIP")
                ]
            },
            {
                name: "endShape(MODE*)",
                exampleURL: "/cs/beginshapeendshape/5462945756610560",
                description: $._("Using the beginShape() and endShape() functions allow creating more complex forms. To start a form, call beginShape(), then use the vertex() command, then call endShape() to stop. By default, it creates an irregular polygon, but you can control that by sending a mode to beginShape().  Transformations such as translate(), rotate(), and scale() do not work within beginShape(). It is also not possible to use other shapes, such as ellipse() or rect() within beginShape()."),
                params: [
                    $._("MODE: (Optional) Specify CLOSE to close the shape.")
                ]
            },
            {
                name: "vertex(x, y)",
                exampleURL: "/cs/beginshapeendshape/5462945756610560",
                description: $._("Using the beginShape() and endShape() functions allow creating more complex forms. To start a form, call beginShape(), then use the vertex() command, then call endShape() to stop. By default, it creates an irregular polygon, but you can control that by sending a mode to beginShape().  Transformations such as translate(), rotate(), and scale() do not work within beginShape(). It is also not possible to use other shapes, such as ellipse() or rect() within beginShape()."),
                params: [
                    $._("x: the x-coordinate of the vertex"),
                    $._("y: the y-coordinate of the vertex")
                ]
            },
            {
                name: "background(r, g, b, a*)",
                exampleURL: "/cs/backgroundr-g-b/839653892",
                description: $._("Sets the background color of the canvas. Note that calling this will color over anything drawn before the command."),
                params: [
                    $._("r: amount of red, ranges from 0 to 255"),
                    $._("g: amount of green, ranges from 0 to 255"),
                    $._("b: amount of blue, ranges from 0 to 255"),
                    $._("a: (Optional) transparency, ranges from 0 to 255")
                ]
            },
            {
                name: "fill(r, g, b, a*)",
                exampleURL: "/cs/fillr-g-b/839774957",
                description: $._("Sets the fill color for all shapes drawn after the function call."),
                params: [
                    $._("r: amount of red, ranges from 0 to 255"),
                    $._("g: amount of green, ranges from 0 to 255"),
                    $._("b: amount of blue, ranges from 0 to 255"),
                    $._("a: (Optional) transparency, ranges from 0 to 255")
                ]
            },
            {
                name: "stroke(r, g, b, a*)",
                exampleURL: "/cs/stroker-g-b/839545910",
                description: $._("Sets the outline color for all shapes drawn after the function call."),
                params: [
                    $._("r: amount of red, ranges from 0 to 255"),
                    $._("g: amount of green, ranges from 0 to 255"),
                    $._("b: amount of blue, ranges from 0 to 255"),
                    $._("a: (Optional) transparency, ranges from 0 to 255")
                ]
            },
            {
                name: "color(r, g, b, a*)",
                exampleURL: "/cs/colorr-g-b/957020020",
                description: $._("This function lets you store all three color components in a single variable. You can then pass that one variable to functions like background(), stroke(), and fill()."),
                params: [
                    $._("r: amount of red, ranges from 0 to 255"),
                    $._("g: amount of green, ranges from 0 to 255"),
                    $._("b: amount of blue, ranges from 0 to 255"),
                    $._("a: (Optional) transparency, ranges from 0 to 255")
                ]
            },
            {
                name: "noFill()",
                exampleURL: "/cs/nofill/877946290",
                description: $._("Makes all shapes drawn after this function call transparent.")
            },
            {
                name:"noStroke()",
                exampleURL: "/cs/nostroke/839859412",
                description: $._("Disables outlines for all shapes drawn after the function call.")
            },
            {
                name: "strokeWeight(thickness)",
                exampleURL: "/cs/strokeweightthickness/877859744",
                description: $._("Sets the thickness of all lines and outlines drawn after the function call."),
                params: [
                    $._("thickness: a number specifying the thickness")
                ]
            },
            {
                name: "strokeJoin(MODE)",
                exampleURL: "/cs/strokejoinmode/5662070842327040",
                description: $._("Sets the style of the joints which connect line segments drawn with vertex(). These joints are either mitered, beveled, or rounded and specified with the corresponding parameters MITER, BEVEL, and ROUND."),
                params: [
                    $._("MODE: Either MITER, BEVEL, or ROUND. The default is MITER.")
                ]
            },
            {
                name: "strokeCap(MODE)",
                exampleURL: "/cs/strokecapmode/5288182060941312",
                description: $._("Sets the style for rendering line endings. These ends are either squared, extended, or rounded and specified with the corresponding parameters SQUARE, PROJECT, and ROUND."),
                params: [
                    $._("MODE: Either SQUARE, PROJECT, or ROUND. The default is ROUND")
                ]
            },
            {
                name: "blendColor(c1, c2, MODE)",
                exampleURL: "/cs/blendcolorc1-c2-mode/4530750216994816",
                description: $._("Blends two color values together based on the blending mode given as the MODE parameter."),
                params: [
                    $._("c1: The first color to blend"),
                    $._("c2: The second color to blend"),
                    $._("MODE: Either BLEND, ADD, SUBTRACT, DARKEST, LIGHTEST, DIFFERENCE, EXCLUSION, MULTIPLY, SCREEN, OVERLAY, HARD_LIGHT, SOFT_LIGHT, DODGE, or BURN.")
                ]
            },
            {
                name: "lerpColor(c1, c2, amount)",
                exampleURL: "/cs/lerpcolorc1-c2-amount/4759935778816000",
                description: $._("Calculates a color or colors between two color at a specific increment. The amount parameter is the amount to interpolate between the two values where 0.0 equal to the first point, 0.1 is very near the first point, 0.5 is half-way in between, etc."),
                params: [
                    $._("c1: Interpolate from this color"),
                    $._("c2: Interpolate to this color")
                ]
            },
            {
                name: "colorMode(MODE)",
                exampleURL: "/cs/colormode/5833774306689024",
                description: $._("Changes the way that color values are interpreted when set by fill()/stroke()/background()."),
                params: [
                    $._("MODE: Either RGB or HSB. The default is RGB.")
                ]
            },
            {
                name: "red(color)",
                exampleURL: "/cs/redcolor/5102159326609408",
                description: $._("Extracts the red value from a color, scaled to match current colorMode()."),
                params: [
                    $._("color: Any color data type")
                ]
            },
            {
                name: "green(color)",
                exampleURL: "/cs/greencolor/5877638103040000",
                description: $._("Extracts the green value from a color, scaled to match current colorMode()."),
                params: [
                    $._("color: Any color data type")
                ]
            },
            {
                name: "blue(color)",
                exampleURL: "/cs/bluecolor/5177743654256640",
                description: $._("Extracts the blue value from a color, scaled to match current colorMode()."),
                params: [
                    $._("color: Any color data type")
                ]
            },
            {
                name: "alpha(color)",
                exampleURL: "/cs/alphacolor/6687311345483776",
                description: $._("Extracts the alpha value from a color."),
                params: [
                    $._("color: Any color data type")
                ]
            },
            {
                name: "hue(color)",
                exampleURL: "/cs/huecolor/6620387366404096",
                description: $._("Extracts the hue value from a color."),
                params: [
                    $._("color: Any color data type")
                ]
            },
            {
                name: "saturation(color)",
                exampleURL: "/cs/saturationcolor/6358678768713728",
                description: $._("Extracts the saturation value from a color."),
                params: [
                    $._("color: Any color data type")
                ]
            },
            {
                name: "brightness(color)",
                exampleURL: "/cs/brightnesscolor/5888575639912448",
                description: $._("Extracts the brightness value from a color."),
                params: [
                    $._("color: Any color data type")
                ]
            },
            {
                name: "text(message, x, y, width*, height*)",
                exampleURL: "/cs/texttext-x-y/937624625",
                description: $._("Draws a string of text at the specified location"),
                params: [
                    $._("message: the string of text to display"),
                    $._("x: the x-coordinate of the bottom left corner"),
                    $._("y: the y-coordinate of the bottom left corner"),
                    $._("width: (Optional) the width of the box for text to auto wrap inside"),
                    $._("height: (Optional) the height of the box for text to auto wrap inside")
                ]
            },
            {
                name: "textFont(font, size*)",
                exampleURL: "/cs/textfontfont-size/940030209",
                description: $._("Using textFont() with createFont(), it's possible to change the font of text drawn."),
                params: [
                    $._("font: A font returned by the createFont function"),
                    $._("size: (Optional) The size of the font, in pixels")
                ]
            },
            {
                name: "createFont(name, size*)",
                exampleURL: "/cs/textfontfont-size/940030209",
                description: $._("Using textFont() with createFont(), it's possible to change the font of text drawn."),
                params: [
                    $._("name: A font name, either \"sans-serif\", \"serif\", \"monospace\", \"fantasy\", or \"cursive\""),
                    $._("size: (Optional) The size of the font, in pixels")
                ]
            },
            {
                name: "textSize(size)",
                exampleURL: "/cs/textsizesize/937728198",
                description: $._("Changes the size of text being drawn."),
                params: [
                    $._("size: The size of the text, in pixels")
                ]
            },
            {
                name: "textWidth(str)",
                exampleURL: "/cs/textwidthstr/4799257177489408",
                description: $._("Calculates and returns the width of any string."),
                params: [
                    $._("str: The string to calculate the width of")
                ]
            },
            {
                name: "textAscent()",
                exampleURL: "/cs/textascent/5975406490419200",
                description: $._("Returns the ascent of the current font at its current size. This information is useful for determining the height of the font above the baseline. For example, adding the textAscent() and textDescent() values will give you the total height of the line.")
            },
            {
                name: "textDescent()",
                exampleURL: "/cs/textdescent/5638769772331008",
                description: $._("Returns descent of the current font at its current size. This information is useful for determining the height of the font below the baseline. For example, adding the textAscent() and textDescent() values will give you the total height of the line.")
            },
            {
                name: "textLeading(dist)",
                exampleURL: "/cs/textleadingdist/6369013500215296",
                description: $._("Sets the spacing between lines of text in units of pixels. This setting will be used in all subsequent calls to the text() function."),
                params: [
                    $._("dist: The size in pixels for spacing between lines")
                ]
            },
            {
                name: "textAlign(ALIGN, YALIGN)",
                exampleURL: "/cs/textalignalign-yalign/4508437190803456",
                description: $._("Sets the current alignment for drawing text. The first parameter is used to set the display characteristics of the letters in relation to the values for the x and y parameters of the text() function.  The second parameter is used to vertically align the text. BASELINE is the default setting, if textAlign is not used. The TOP and CENTER parameters are straightforward. The BOTTOM parameter offsets the line based on the current textDescent(). For multiple lines, the final line will be aligned to the bottom, with the previous lines appearing above it."),
                params: [
                    $._("ALIGN: Horizontal alignment, either LEFT, CENTER, or RIGHT"),
                    $._("YALIGN: Vertical alignment, either TOP, BOTTOM, CENTER, or BASELINE")
                ]
            },
            {
                name: "rotate(angle)",
                exampleURL: "/cs/rotateangle/6386091934351360",
                description: $._("Sets the rotation angle for any shapes drawn after the command. If called multiple times, the angle will be added to the previous angle (accumulative effect). To stop rotation, use pushMatrix()/popMatrix()."),
                params: [
                    $._("angle: The number of degrees to rotate by. To specify in radians, use the angleMode() function.")
                ]
            },
            {
                name: "scale(amount)",
                exampleURL: "/cs/scalex-y/6712922034143232",
                description: $._("Increases the size of shapes drawn after the command, by expanding and contracting vertices. For example, scale(2) makes it increase in size by 200%. If called multiple times, the sizes will multiply (accumulative effect). It can be called with one parameter to resize the same in both dimensions, or with two parameters to size differently in each dimension.  To stop resizing shapes, use pushMatrix()/popMatrix()."),
                params: [
                    $._("amount: The amount to scale object in \"x\" and \"y\" axis")
                ]
            },
            {
                name: "translate(x, y)",
                exampleURL: "/cs/translatex-y/6505693083336704",
                description: $._("Displaces the drawn shapes by a given amount in the x/y directions. If called multiple times, the offsets will be added to each other (accumulative effect). To stop translating shapes, use pushMatrix()/popMatrix()."),
                params: [
                    $._("x: The amount to translate left/right."),
                    $._("y: The amount to translate up/down.")
                ]
            },
            {
                name: "pushMatrix()",
                exampleURL: "/cs/pushmatrixpopmatrix/5505194477486080",
                description: $._("Remembers the current coordinate system (in the \"matrix stack\").")
            },
            {
                name: "popMatrix()",
                exampleURL: "/cs/pushmatrixpopmatrix/5505194477486080",
                description: $._("Restores the previous coordinate system (from the \"matrix stack\") - whatever was most recently pushed.")
            },
            {
                name: "resetMatrix()",
                exampleURL: "/cs/resetmatrix/4597705468805120",
                description: $._("Replaces the current transformation matrix with the identity matrix. This effectively clears all transformation functions set before it.")
            },
            {
                name: "printMatrix()",
                exampleURL: "/cs/printmatrix/5934612152844288",
                description: $._("Prints the current transformation matrix to the console.")
            },
            {
                name: "frameRate(fps)",
                exampleURL: "/cs/frameratefps/6427359154536448",
                description: $._("Specifies the number of frames to be displayed every second. If the processor is not fast enough to maintain the specified rate, it will not be achieved. For fluid animation, at least 24 frames per second is recommended."),
                params: [
                    $._("fps: A whole number, number of frames per second")
                ]
            },
            {
                name: "loop()",
                exampleURL: "/cs/loop/5519218351013888",
                description: $._("Causes the program to continuously execute the code within draw(). If noLoop() is called, the code in draw() stops executing.")
            },
            {
                name: "noLoop()",
                exampleURL: "/cs/noloop/6342789906300928",
                description: $._("Stops the program from continuously executing the code within draw(). If loop() is called, the code in draw() begin to run continuously again.")
            },
            {
                name: "random(low, high)",
                exampleURL: "/cs/randomlow-high/827911487",
                description: $._("Returns a random number between low and high."),
                params: [
                    $._("low: the lowest possible number returned"),
                    $._("high: the highest possible number returned")
                ]
            },
            {
                name: "dist(x1, y1, x2, y2)",
                exampleURL: "/cs/distx1-y1-x2-y2/1917352082",
                description: $._("Calculates the distance between two points, (x1, y1) and (x2, y2)."),
                params: [
                    $._("x1: the x-coordinate of the first point"),
                    $._("y1: the y-coordinate of the first point"),
                    $._("x2: the x-coordinate of the second point"),
                    $._("y2: the y-coordinate of the second point")
                ]
            },
            {
                name: "constrain(value, min, max)",
                exampleURL: "/cs/constrainvalue-min-max/5870136103796736",
                description: $._("Constrains a value to not exceed a maximum and minimum value."),
                params: [
                    $._("value: The value to constrain"),
                    $._("min: The minimum limit"),
                    $._("max: The maximum limit")
                ]
            },
            {
                name: "min(num1, num2)",
                exampleURL: "/cs/minnum1-num2/4693347713155072",
                description: $._("Returns the smallest value of all values passed in."),
                params: [
                    $._("num1: The first value to compare, any number."),
                    $._("num2: The second value to compare, any number.")
                ]
            },
            {
                name: "max(num1, num2)",
                exampleURL: "/cs/maxnum1-num2/4755409722146816",
                description: $._("Returns the greatest value of all values passed in."),
                params: [
                    $._("num1: The first value to compare, any number."),
                    $._("num2: The second value to compare, any number.")
                ]
            },
            {
                name: "abs(num)",
                exampleURL: "/cs/absnum/877930637",
                description: $._("Returns the absolute value of a number"),
                params: [
                    $._("num: The number to take the absolute value of")
                ]
            },
            {
                name: "log(num)",
                exampleURL: "/cs/lognum/877921884",
                description: $._("Returns the the natural logarithm (base-e) of a number."),
                params: [
                    $._("num: The number to take the log of")
                ]
            },
            {
                name: "pow(num, exponent)",
                exampleURL: "/cs/pownum-exponent/877858853",
                description: $._("Returns a number raised to an exponential power."),
                params: [
                    $._("num: The base of the exponential expression"),
                    $._("exponent: The power to which the num is raised")
                ]
            },
            {
                name: "sq(num)",
                exampleURL: "/cs/sqnum/6588187426160640",
                description: $._("Squares a number (multiplies a number by itself). The result is always a positive number, as multiplying two negative numbers always yields a positive result. For example, -1 * -1 = 1"),
                params: [
                    $._("num: Any numeric value")
                ]
            },
            {
                name: "sqrt(num)",
                exampleURL: "/cs/sqrtnum/6473360267542528",
                description: $._("Calculates the square root of a number. The square root of a number is always positive, even though there may be a valid negative root. The square root s of number a is such that s*s = a. It is the opposite of squaring."),
                params: [
                    $._("num: Any numeric value")
                ]
            },
            {
                name: "round(num)",
                exampleURL: "/cs/roundnum/5907281296228352",
                description: $._("Calculates the closest whole number that is closest to the value of the parameter."),
                params: [
                    $._("num: Any numeric value")
                ]
            },
            {
                name: "ceil(num)",
                exampleURL: "/cs/ceil/5491781646942208",
                description: $._("Calculates the closest whole number that is greater than or equal to the value of the parameter."),
                params: [
                    $._("num: Any numeric value")
                ]
            },
            {
                name: "floor(num)",
                exampleURL: "/cs/floornum/5703004061696000",
                description: $._("Calculates the closest whole number that is less than or equal to the value of the parameter."),
                params: [
                    $._("num: Any numeric value")
                ]
            },
            {
                name: "mag(x1, y1)",
                exampleURL: "/cs/magx1-y1-not-working-yet/5983219002376192",
                description: $._("Calculates the magnitude (or length) of a vector. A vector is a direction in space commonly used in computer graphics and linear algebra. Because it has no \"start\" position, the magnitude of a vector can be thought of as the distance from coordinate (0,0) to its (x,y) value. Therefore, mag() is a shortcut for writing dist(0, 0, x, y)."),
                params: [
                    $._("x: the x component"),
                    $._("y: the y component")
                ]
            },
            {
                name: "exp(num)",
                exampleURL: "/cs/expvalue/5228990398726144",
                description: $._("Returns Euler's number e (2.71828...) raised to the power of the value parameter."),
                params: [
                    $._("num: Any numeric value")
                ]
            },
            {
                name: "map(num, low1, high1, low2, high2)",
                exampleURL: "/cs/mapvalue-low1-high1-low2-high2/4587974079545344",
                description: $._("Re-maps a number from one range to another. Numbers outside the range are not clamped to 0 and 1, because out-of-range values are often intentional and useful."),
                params: [
                    $._("num: The incoming value to be converted"),
                    $._("low1: Lower bound of the value's current range"),
                    $._("high1: Upper bound of the value's current range"),
                    $._("low2: Lower bound of the value's target range"),
                    $._("high2: Upper bound of the value's target range")
                ]
            },
            {
                name: "norm(num, low, high)",
                exampleURL: "/cs/normvalue-low-high/6581050767572992",
                description: $._("Normalizes a number from another range into a value between 0 and 1. This is the same as using the map function with the last two parameters set to 0 and 1, i.e: map(value, low, high, 0, 1); Numbers outside the range are not clamped to 0 and 1, because out-of-range values are often intentional and useful."),
                params: [
                    $._("num: The incoming value to be converted"),
                    $._("low1: Lower bound of the value's current range"),
                    $._("high1: Upper bound of the value's current range")
                ]
            },
            {
                name: "lerp(num1, num2, amount)",
                exampleURL: "/cs/lerpvalue1-value2-amount/6456916012171264",
                description: $._("Calculates a number between two numbers at a specific increment."),
                params: [
                    $._("num1: The first number"),
                    $._("num2: The second number"),
                    $._("amount: A value between 0.0 and 1.0")
                ]
            },
            {
                name: "noise(x, y)",
                exampleURL: "/cs/noise/5618485581316096",
                description: $._("Returns the Perlin noise value at specified coordinates. The resulting value will always be between 0.0 and 1.0"),
                params: [
                    $._("x: the x-coordinate in noise space"),
                    $._("y: the y-coordinate in noise space (optional)")
                ]
            },
            {
                name: "noiseDetail(octaves, falloff)",
                exampleURL: "/cs/noisedetailoctaves-falloff/6549875814563840",
                description: $._("Adjusts the character and level of detail produced by the Perlin noise function."),
                params: [
                    $._("octaves: The number of octaves to be used by the noise() function"),
                    $._("falloff: The falloff factor for each octave")
                ]
            },
            {
                name: "sin(degrees)",
                exampleURL: "/cs/sindeg/948255306",
                description: $._("Return the sine of an angle."),
                params: [
                    $._("deg: The angle, in degrees")
                ]
            },
            {
                name: "cos(degrees)",
                exampleURL: "/cs/cosdeg/948226821",
                description: $._("Return the cosine of an angle."),
                params: [
                    $._("deg: The angle, in degrees")
                ]
            },
            {
                name: "tan(degrees)",
                exampleURL: "/cs/tandeg/948018680",
                description: $._("Return the tangent of an angle"),
                params: [
                    $._("deg: The angle, in degrees")
                ]
            },
            {
                name: "acos(val)",
                exampleURL: "/cs/acosval/4542953527705600",
                description: $._("Returns the arc cosine (inverse cosine) of a value. Depending on the angle mode, it returns values from 0-180 or 0-PI."),
                params: [
                    $._("val: The value whose arc cosine is to be returned.")
                ]
            },
            {
                name: "asin(val)",
                exampleURL: "/cs/asinval/5061655520083968",
                description: $._("Returns the arc sine (inverse sine) of a value. Depending on the angle mode, it returns values from -90 to 90 or -PI/2 to PI/2."),
                params: [
                    $._("val: The value whose arc sine is to be returned.")
                ]
            },
            {
                name: "atan(val)",
                exampleURL: "/cs/atanval/4869834059808768",
                description: $._("Returns the arc tangent (inverse tangent) of a value. Depending on the angle mode, it returns values from -90 to 90 or -PI/2 to PI/2."),
                params: [
                    $._("val: The value whose arc tangent is to be returned")
                ]
            },
            {
                name: "radians(angle)",
                exampleURL: "/cs/radiansangle/6628151023108096",
                description: $._("Converts a degree measurement to its corresponding value in radians."),
                params: [
                    $._("angle: The angle in degrees")
                ]
            },
            {
                name: "degrees(angle)",
                exampleURL: "/cs/degreesangle/6674991668002816",
                description: $._("Converts a radians measurement to its corresponding value in degrees."),
                params: [
                    $._("angle: The angle in radians")
                ]
            },
            {
                name: "day()",
                exampleURL: "/cs/day/4526347808407552",
                description: $._("Returns the current day of the month, between 1 and 31, according to the clock on the user's computer.")
            },
            {
                name: "month()",
                exampleURL: "/cs/month/5388987023753216",
                description: $._("Returns the current month of the year, between 1-12, according to the clock on the user's computer.")
            },
            {
                name: "year()",
                exampleURL: "/cs/year/6216887939629056",
                description: $._("Returns the current year according to the clock on the user's computer.")
            },
            {
                name: "hour()",
                exampleURL: "/cs/hour/5806957302644736",
                description: $._("Returns the current hour as a value from 0 - 23, based on the user's computer clock.")
            },
            {
                name: "minute()",
                exampleURL: "/cs/minute/6638408210317312",
                description: $._("Returns the current minute as a value from 0 - 59, based on the user's computer clock.")
            },
            {
                name: "second()",
                exampleURL: "/cs/second/5743886110556160",
                description: $._("Returns the current second as a value from 0 - 59, based on the user's computer clock.")
            },
            {
                name: "millis()",
                exampleURL: "/cs/millis/5970545493409792",
                description: $._("Returns the number of milliseconds (thousandths of a second) since starting the program. Useful for cyclic animations.")
            },
            {
                name: "debug(arg1, ...",
                exampleURL: "/cs/debugarg1-arg2/939146973",
                description: $._("Log out any number of values to the browser console."),
                params: [
                    $._("arg: The first value to log"),
                    $._("...: (Optional)* any amount of extra arguments")
                ]
            },
            {
                name: "println(data)",
                exampleURL: "/cs/printlndata/6120466259378176",
                description: $._("Prints a line of data to the console that pops up over the canvas. Click the X to close the console."),
                params: [
                    $._("data: The data to print")
                ]
            },
            {
                name: "print(data)",
                exampleURL: "/cs/printdata/5110798099677184",
                description: $._("Prints data to the console that pops up over the canvas, without creating a new line (like println does)."),
                params: [
                    $._("data: The data to print")
                ]
            }
        ]
    },
    _pjsObjectConstructors: {
        type: $._("object constructor"),
        whitelist: ["PVector(x,y)"]
    },
    _pjsObjects: {
        type: $._("object"),
        whitelist: ["Random"]
    },
    _pjsVariables: {
        type: $._("variable"),
        whitelist: ["width", "height", "mouseIsPressed", "keyIsPressed",
            "frameCount", "key", "keyCode", "mouseButton", "mouseX",
            "mouseY", "pmouseX", "pmouseY", "angleMode"]
    },
    _pjsCallbacks: {
        type: $._("callback"),
        whitelist: ["draw", "mouseClicked", "mousePressed", "mouseReleased",
            "mouseMoved", "mouseDragged", "mouseOver", "mouseOut",
            "keyPressed", "keyReleased", "keyTyped"]
    },
};

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
        if (text[i] === "(") {
            parenthesisDepth++;
        } else if (text[i] === ")") {
            parenthesisDepth--;
        }
    }
    return parenthesisDepth > 0;
};

// Returns true if we're inside a string
var isWithinString = function(text) {
    var withinString = false;
    var lastQuoteChar;
    for (var i = 0; i < text.length; i++) {
        if (withinString && text[i] === lastQuoteChar) {
            withinString = false;
        } else if (!withinString && text[i] === "'" || text[i] === "\"") {
            lastQuoteChar = text[i];
            withinString = true;
        }
    }
    return withinString;
};

// Returns true if we're inside a comment
// This isn't a perfect check, but it is close enough.
var isWithinComment = function(text) {
    // Comments typically start with a / or a * (for multiline C style)
    return text.length && (text[0] === "/" || text[0] === "*");
}

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
                _private.attachAutosuggest.call(this);
            }
        },
        onNumberCheck: function() {
            var editor = this.options.editor;
            var record = this.options.record;

            var pos = editor.selection.getCursor();
            var line = editor.session.getDocument().getLine(pos.row);
            var prefix = line.slice(0, pos.column);
            var lineCleanedUp = line.trim();
            // Get rid of live autocomplete and other pickers if we're within
            // a comment or string.
            if (isWithinComment(lineCleanedUp) ||
                    isWithinString(lineCleanedUp)) {
                ScratchpadAutosuggest.enableLiveCompletion(false);
                return;
            // We don't want autosuggest coming up when param info is displayed
            } else if (this.curPicker !== this.autosuggest) {
                ScratchpadAutosuggest.enableLiveCompletion(true);
            }

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
                        this.ignore = true;

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
                } else if (/(\b[^\d.-]+\s*\(\s*)([^\)]*)$/.test(prefix)) {
                    var functionCall = RegExp.$1.substring(0, RegExp.$1.length - 1)
                                                .split(" ").pop().trim();
                    var paramsPos = pos.column - RegExp.$2.length;
                    var paramsToCursor = RegExp.$2;
                    var lookupParams =
                        ScratchpadAutosuggest.lookupParamsSafeHTML(functionCall,
                            paramsToCursor);
                    ScratchpadAutosuggest.enableLiveCompletion(false);

                    if (lookupParams) {
                        this.autosuggest.find(".hotsuggest")
                                        .empty().append(lookupParams);
                        this.newPicker = this.autosuggest;
                    }
                }
            }
        },
        onUpdatePosition: function() {
            var editor = this.options.editor;

            var pos = editor.selection.getCursor();
            var editorBB = editor.renderer.scroller.getBoundingClientRect();
            var editorHeight = editorBB.height;
            var coords = editor.renderer.textToScreenCoordinates(pos.row,
                this.curPicker !== this.scrubber &&
                this.curPicker !== this.autosuggest ?
                editor.session.getDocument().getLine(pos.row).length : pos.column);
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

            // We set ignore so we can ignore events that come from the
            //  editor during this time, since we're causing those events
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
        attachAutosuggest: function() {
            if (this.autosuggest) {
                return;
            }
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
            this.autosuggest = $("<div class='hotnumber autosuggest'><div class='hotsuggest'></div><div class='arrow'></div></div>")
                .appendTo("body")
                .mousedown(function() {
                    this.autosuggest.hide();
                    editor.focus();
                }.bind(this)).hide();
            $(document).keyup(function(e) {
                if (e.which === 27 && this.autosuggest) {
                    this.autosuggest.hide();
                }
            }.bind(this));
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
            
            this.range = null;            
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

            if (this.curPicker === this.colorPicker) {
                var colors = this.oldValue.replace(/\s/, "").split(",");
                this.colorPicker.find(".picker").ColorPickerSetColor(
                    colors.length >= 3 ?
                    { r: parseFloat(colors[0]),
                      g: parseFloat(colors[1]),
                      b: parseFloat(colors[2]) } :
                    colors.length === 1 && !colors[0] ?
                    { r: 255, g: 0, b: 0 } :
                    { r: parseFloat(colors[0]),
                      g: parseFloat(colors[0]),
                      b: parseFloat(colors[0]) });
            }

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

this["Handlebars"] = this["Handlebars"] || {};
this["Handlebars"]["templates"] = this["Handlebars"]["templates"] || {};
this["Handlebars"]["templates"]["imagepicker"] = Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
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
  });;