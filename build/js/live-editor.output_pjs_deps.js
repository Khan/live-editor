/*! p5.js v0.3.16 January 26, 2015 */
(function (root, factory) {
  if (typeof define === 'function' && define.amd)
    define('p5', [], function () { return (root.returnExportsGlobal = factory());});
  else if (typeof exports === 'object')
    module.exports = factory();
  else
    root['p5'] = factory();
}(this, function () {
var amdclean = {};
amdclean['shim'] = function (require) {
  window.requestDraw = function () {
    return window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.oRequestAnimationFrame || window.msRequestAnimationFrame || function (callback, element) {
      window.setTimeout(callback, 1000 / 60);
    };
  }();
}({});
amdclean['constants'] = function (require) {
  var PI = Math.PI;
  return {
    ARROW: 'default',
    CROSS: 'crosshair',
    HAND: 'pointer',
    MOVE: 'move',
    TEXT: 'text',
    WAIT: 'wait',
    HALF_PI: PI / 2,
    PI: PI,
    QUARTER_PI: PI / 4,
    TAU: PI * 2,
    TWO_PI: PI * 2,
    DEGREES: 'degrees',
    RADIANS: 'radians',
    CORNER: 'corner',
    CORNERS: 'corners',
    RADIUS: 'radius',
    RIGHT: 'right',
    LEFT: 'left',
    CENTER: 'center',
    TOP: 'top',
    BOTTOM: 'bottom',
    BASELINE: 'alphabetic',
    POINTS: 'points',
    LINES: 'lines',
    TRIANGLES: 'triangles',
    TRIANGLE_FAN: 'triangles_fan',
    TRIANGLE_STRIP: 'triangles_strip',
    QUADS: 'quads',
    QUAD_STRIP: 'quad_strip',
    CLOSE: 'close',
    OPEN: 'open',
    CHORD: 'chord',
    PIE: 'pie',
    PROJECT: 'square',
    SQUARE: 'butt',
    ROUND: 'round',
    BEVEL: 'bevel',
    MITER: 'miter',
    RGB: 'rgb',
    HSB: 'hsb',
    AUTO: 'auto',
    ALT: 18,
    BACKSPACE: 8,
    CONTROL: 17,
    DELETE: 46,
    DOWN_ARROW: 40,
    ENTER: 13,
    ESCAPE: 27,
    LEFT_ARROW: 37,
    OPTION: 18,
    RETURN: 13,
    RIGHT_ARROW: 39,
    SHIFT: 16,
    TAB: 9,
    UP_ARROW: 38,
    BLEND: 'normal',
    ADD: 'lighter',
    DARKEST: 'darken',
    LIGHTEST: 'lighten',
    DIFFERENCE: 'difference',
    EXCLUSION: 'exclusion',
    MULTIPLY: 'multiply',
    SCREEN: 'screen',
    REPLACE: 'source-over',
    OVERLAY: 'overlay',
    HARD_LIGHT: 'hard-light',
    SOFT_LIGHT: 'soft-light',
    DODGE: 'color-dodge',
    BURN: 'color-burn',
    NORMAL: 'normal',
    ITALIC: 'italic',
    BOLD: 'bold',
    LINEAR: 'linear',
    QUADRATIC: 'quadratic',
    BEZIER: 'bezier',
    CURVE: 'curve'
  };
}({});
amdclean['core'] = function (require, shim, constants) {
  'use strict';
  var constants = constants;
  var p5 = function (sketch, node, sync) {
    if (arguments.length === 2 && typeof node === 'boolean') {
      sync = node;
      node = undefined;
    }
    this._setupDone = false;
    this._pixelDensity = window.devicePixelRatio || 1;
    this._startTime = new Date().getTime();
    this._userNode = node;
    this._curElement = null;
    this._elements = [];
    this._preloadCount = 0;
    this._updateInterval = 0;
    this._isGlobal = false;
    this._loop = true;
    this._styles = [];
    this._defaultCanvasSize = {
      width: 100,
      height: 100
    };
    this._events = {
      'mousemove': null,
      'mousedown': null,
      'mouseup': null,
      'click': null,
      'mousewheel': null,
      'mouseover': null,
      'mouseout': null,
      'keydown': null,
      'keyup': null,
      'keypress': null,
      'touchstart': null,
      'touchmove': null,
      'touchend': null,
      'resize': null,
      'blur': null
    };
    this._loadingScreenId = 'p5_loading';
    this._start = function () {
      if (this._userNode) {
        if (typeof this._userNode === 'string') {
          this._userNode = document.getElementById(this._userNode);
        }
      }
      this._loadingScreen = document.getElementById(this._loadingScreenId);
      if (!this._loadingScreen) {
        this._loadingScreen = document.createElement('loadingDiv');
        this._loadingScreen.innerHTML = 'loading...';
        this._loadingScreen.style.position = 'absolute';
        var node = this._userNode || document.body;
        node.appendChild(this._loadingScreen);
      }
      this.createCanvas(this._defaultCanvasSize.width, this._defaultCanvasSize.height, true);
      var userPreload = this.preload || window.preload;
      var context = this._isGlobal ? window : this;
      if (userPreload) {
        this._preloadMethods.forEach(function (f) {
          context[f] = function (path) {
            return context._preload(f, path);
          };
        });
        userPreload();
        if (this._preloadCount === 0) {
          this._setup();
          this._runFrames();
          this._draw();
        }
      } else {
        this._setup();
        this._runFrames();
        this._draw();
      }
    }.bind(this);
    this._preload = function (func, path) {
      var context = this._isGlobal ? window : this;
      context._setProperty('_preloadCount', context._preloadCount + 1);
      return p5.prototype[func].call(context, path, function (resp) {
        context._setProperty('_preloadCount', context._preloadCount - 1);
        if (context._preloadCount === 0) {
          context._setup();
          context._runFrames();
          context._draw();
        }
      });
    }.bind(this);
    this._setup = function () {
      var context = this._isGlobal ? window : this;
      if (typeof context.preload === 'function') {
        this._preloadMethods.forEach(function (f) {
          context[f] = p5.prototype[f];
        });
      }
      if (typeof context.setup === 'function') {
        context.setup();
      }
      this.canvas.style.visibility = '';
      this.canvas.className = this.canvas.className.replace('p5_hidden', '');
      this._setupDone = true;
      this._loadingScreen.parentNode.removeChild(this._loadingScreen);
    }.bind(this);
    this._draw = function () {
      var now = new Date().getTime();
      this._frameRate = 1000 / (now - this._lastFrameTime);
      this._lastFrameTime = now;
      if (this._loop) {
        if (this._drawInterval) {
          clearInterval(this._drawInterval);
        }
        this._drawInterval = setTimeout(function () {
          window.requestDraw(this._draw.bind(this));
        }.bind(this), 1000 / this._targetFrameRate);
      }
      this.redraw();
      this._updatePMouseCoords();
      this._updatePTouchCoords();
    }.bind(this);
    this._runFrames = function () {
      if (this._updateInterval) {
        clearInterval(this._updateInterval);
      }
      this._updateInterval = setInterval(function () {
        this._setProperty('frameCount', this.frameCount + 1);
      }.bind(this), 1000 / this._targetFrameRate);
    }.bind(this);
    this._setProperty = function (prop, value) {
      this[prop] = value;
      if (this._isGlobal) {
        window[prop] = value;
      }
    }.bind(this);
    this.remove = function () {
      if (this._curElement) {
        this._loop = false;
        if (this._drawInterval) {
          clearTimeout(this._drawInterval);
        }
        if (this._updateInterval) {
          clearTimeout(this._updateInterval);
        }
        for (var ev in this._events) {
          window.removeEventListener(ev, this._events[ev]);
        }
        for (var i = 0; i < this._elements.length; i++) {
          var e = this._elements[i];
          if (e.elt.parentNode) {
            e.elt.parentNode.removeChild(e.elt);
          }
          for (var elt_ev in e._events) {
            e.elt.removeEventListener(elt_ev, e._events[elt_ev]);
          }
        }
        var self = this;
        this._registeredMethods.remove.forEach(function (f) {
          if (typeof f !== 'undefined') {
            f.call(self);
          }
        });
        if (this._isGlobal) {
          for (var p in p5.prototype) {
            try {
              delete window[p];
            } catch (x) {
              window[p] = undefined;
            }
          }
          for (var p2 in this) {
            if (this.hasOwnProperty(p2)) {
              try {
                delete window[p2];
              } catch (x) {
                window[p2] = undefined;
              }
            }
          }
        }
      }
    }.bind(this);
    for (var k in constants) {
      p5.prototype[k] = constants[k];
    }
    if (!sketch) {
      this._isGlobal = true;
      for (var p in p5.prototype) {
        if (typeof p5.prototype[p] === 'function') {
          var ev = p.substring(2);
          if (!this._events.hasOwnProperty(ev)) {
            window[p] = p5.prototype[p].bind(this);
          }
        } else {
          window[p] = p5.prototype[p];
        }
      }
      for (var p2 in this) {
        if (this.hasOwnProperty(p2)) {
          window[p2] = this[p2];
        }
      }
    } else {
      sketch(this);
    }
    for (var e in this._events) {
      var f = this['on' + e];
      if (f) {
        var m = f.bind(this);
        window.addEventListener(e, m);
        this._events[e] = m;
      }
    }
    var self = this;
    window.addEventListener('focus', function () {
      self._setProperty('focused', true);
    });
    window.addEventListener('blur', function () {
      self._setProperty('focused', false);
    });
    if (sync) {
      this._start();
    } else {
      if (document.readyState === 'complete') {
        this._start();
      } else {
        window.addEventListener('load', this._start.bind(this), false);
      }
    }
  };
  p5.prototype._preloadMethods = [
    'loadJSON',
    'loadImage',
    'loadStrings',
    'loadXML',
    'loadShape',
    'loadTable'
  ];
  p5.prototype._registeredMethods = {
    pre: [],
    post: [],
    remove: []
  };
  p5.prototype.registerPreloadMethod = function (m) {
    p5.prototype._preloadMethods.push(m);
  }.bind(this);
  p5.prototype.registerMethod = function (name, m) {
    if (!p5.prototype._registeredMethods.hasOwnProperty(name)) {
      p5.prototype._registeredMethods[name] = [];
    }
    p5.prototype._registeredMethods[name].push(m);
  }.bind(this);
  return p5;
}({}, amdclean['shim'], amdclean['constants']);
amdclean['p5Color'] = function (require, core, constants) {
  var p5 = core;
  var constants = constants;
  p5.Color = function (pInst, vals) {
    if (vals instanceof Array) {
      this.rgba = vals;
    } else {
      var formatted = p5.Color._getFormattedColor.apply(pInst, vals);
      if (pInst._colorMode === constants.HSB) {
        this.hsba = formatted;
        this.rgba = p5.Color._getRGB(formatted);
      } else {
        this.rgba = formatted;
      }
    }
    var c = p5.Color._normalizeColorArray.call(pInst, this.rgba);
    this.colorString = p5.Color._getColorString(c);
    return this;
  };
  p5.Color._getFormattedColor = function () {
    if (arguments[0] instanceof Array) {
      return p5.Color.getNormalizedColor.apply(this, arguments[0]);
    }
    var r, g, b, a;
    if (arguments.length >= 3) {
      r = arguments[0];
      g = arguments[1];
      b = arguments[2];
      a = typeof arguments[3] === 'number' ? arguments[3] : 255;
    } else {
      if (this._colorMode === constants.RGB) {
        r = g = b = arguments[0];
      } else {
        r = b = arguments[0];
        g = 0;
      }
      a = typeof arguments[1] === 'number' ? arguments[1] : 255;
    }
    return [
      r,
      g,
      b,
      a
    ];
  };
  p5.Color._normalizeColorArray = function (arr) {
    var isRGB = this._colorMode === constants.RGB;
    var maxArr = isRGB ? this._maxRGB : this._maxHSB;
    arr[0] *= 255 / maxArr[0];
    arr[1] *= 255 / maxArr[1];
    arr[2] *= 255 / maxArr[2];
    arr[3] *= 255 / maxArr[3];
    return arr;
  };
  p5.Color._getRGB = function (hsba) {
    var h = hsba[0];
    var s = hsba[1];
    var v = hsba[2];
    h /= 255;
    s /= 255;
    v /= 255;
    var RGBA = [];
    if (s === 0) {
      RGBA = [
        Math.round(v * 255),
        Math.round(v * 255),
        Math.round(v * 255),
        hsba[3]
      ];
    } else {
      var var_h = h * 6;
      if (var_h === 6) {
        var_h = 0;
      }
      var var_i = Math.floor(var_h);
      var var_1 = v * (1 - s);
      var var_2 = v * (1 - s * (var_h - var_i));
      var var_3 = v * (1 - s * (1 - (var_h - var_i)));
      var var_r;
      var var_g;
      var var_b;
      if (var_i === 0) {
        var_r = v;
        var_g = var_3;
        var_b = var_1;
      } else if (var_i === 1) {
        var_r = var_2;
        var_g = v;
        var_b = var_1;
      } else if (var_i === 2) {
        var_r = var_1;
        var_g = v;
        var_b = var_3;
      } else if (var_i === 3) {
        var_r = var_1;
        var_g = var_2;
        var_b = v;
      } else if (var_i === 4) {
        var_r = var_3;
        var_g = var_1;
        var_b = v;
      } else {
        var_r = v;
        var_g = var_1;
        var_b = var_2;
      }
      RGBA = [
        Math.round(var_r * 255),
        Math.round(var_g * 255),
        Math.round(var_b * 255),
        hsba[3]
      ];
    }
    return RGBA;
  };
  p5.Color._getHSB = function (rgba) {
    var var_R = rgba[0] / 255;
    var var_G = rgba[1] / 255;
    var var_B = rgba[2] / 255;
    var var_Min = Math.min(var_R, var_G, var_B);
    var var_Max = Math.max(var_R, var_G, var_B);
    var del_Max = var_Max - var_Min;
    var H;
    var S;
    var V = var_Max;
    if (del_Max === 0) {
      H = 0;
      S = 0;
    } else {
      S = del_Max / var_Max;
      var del_R = ((var_Max - var_R) / 6 + del_Max / 2) / del_Max;
      var del_G = ((var_Max - var_G) / 6 + del_Max / 2) / del_Max;
      var del_B = ((var_Max - var_B) / 6 + del_Max / 2) / del_Max;
      if (var_R === var_Max) {
        H = del_B - del_G;
      } else if (var_G === var_Max) {
        H = 1 / 3 + del_R - del_B;
      } else if (var_B === var_Max) {
        H = 2 / 3 + del_G - del_R;
      }
      if (H < 0) {
        H += 1;
      }
      if (H > 1) {
        H -= 1;
      }
    }
    return [
      Math.round(H * 255),
      Math.round(S * 255),
      Math.round(V * 255),
      rgba[3]
    ];
  };
  p5.Color._getColorString = function (a) {
    for (var i = 0; i < 3; i++) {
      a[i] = Math.floor(a[i]);
    }
    var alpha = typeof a[3] !== 'undefined' ? a[3] / 255 : 1;
    return 'rgba(' + a[0] + ',' + a[1] + ',' + a[2] + ',' + alpha + ')';
  };
  p5.Color._getCanvasColor = function () {
    if (arguments[0] instanceof p5.Color) {
      if (arguments.length === 1) {
        return arguments[0].colorString;
      } else {
        var c = arguments[0].rgba;
        c[3] = arguments[1];
        c = p5.Color._normalizeColorArray.call(this, c);
        return p5.Color._getColorString(c);
      }
    } else if (arguments[0] instanceof Array) {
      if (arguments.length === 1) {
        return p5.Color._getColorString(arguments[0]);
      } else {
        var isRGB = this._colorMode === constants.RGB;
        var maxA = isRGB ? this._maxRGB[3] : this._maxHSB[3];
        arguments[0][3] = 255 * arguments[1] / maxA;
        return p5.Color._getColorString(arguments[0]);
      }
    } else {
      var e = p5.Color._getFormattedColor.apply(this, arguments);
      e = p5.Color._normalizeColorArray.call(this, e);
      if (this._colorMode === constants.HSB) {
        e = p5.Color._getRGB(e);
      }
      return p5.Color._getColorString(e);
    }
  };
  return p5.Color;
}({}, amdclean['core'], amdclean['constants']);
amdclean['p5Element'] = function (require, core) {
  var p5 = core;
  p5.Element = function (elt, pInst) {
    this.elt = elt;
    this._pInst = pInst;
    this._events = {};
    this.width = this.elt.offsetWidth;
    this.height = this.elt.offsetHeight;
  };
  p5.Element.prototype.parent = function (p) {
    if (typeof p === 'string') {
      p = document.getElementById(p);
    } else if (p instanceof p5.Element) {
      p = p.elt;
    }
    p.appendChild(this.elt);
    return this;
  };
  p5.Element.prototype.id = function (id) {
    this.elt.id = id;
    return this;
  };
  p5.Element.prototype.class = function (c) {
    this.elt.className += ' ' + c;
    return this;
  };
  p5.Element.prototype.mousePressed = function (fxn) {
    attachListener('mousedown', fxn, this);
    attachListener('touchstart', fxn, this);
    return this;
  };
  p5.Element.prototype.mouseWheel = function (fxn) {
    attachListener('mousewheel', fxn, this);
    return this;
  };
  p5.Element.prototype.mouseReleased = function (fxn) {
    attachListener('mouseup', fxn, this);
    attachListener('touchend', fxn, this);
    return this;
  };
  p5.Element.prototype.mouseClicked = function (fxn) {
    attachListener('click', fxn, this);
    return this;
  };
  p5.Element.prototype.mouseMoved = function (fxn) {
    attachListener('mousemove', fxn, this);
    attachListener('touchmove', fxn, this);
    return this;
  };
  p5.Element.prototype.mouseOver = function (fxn) {
    attachListener('mouseover', fxn, this);
    return this;
  };
  p5.Element.prototype.mouseOut = function (fxn) {
    attachListener('mouseout', fxn, this);
    return this;
  };
  p5.Element.prototype.touchStarted = function (fxn) {
    attachListener('touchstart', fxn, this);
    attachListener('mousedown', fxn, this);
    return this;
  };
  p5.Element.prototype.touchMoved = function (fxn) {
    attachListener('touchmove', fxn, this);
    attachListener('mousemove', fxn, this);
    return this;
  };
  p5.Element.prototype.touchEnded = function (fxn) {
    attachListener('touchend', fxn, this);
    attachListener('mouseup', fxn, this);
    return this;
  };
  function attachListener(ev, fxn, ctx) {
    var f = fxn.bind(ctx);
    ctx.elt.addEventListener(ev, f, false);
    ctx._events[ev] = f;
  }
  p5.Element.prototype._setProperty = function (prop, value) {
    this[prop] = value;
  };
  return p5.Element;
}({}, amdclean['core']);
amdclean['p5Graphics'] = function (require, core, constants) {
  var p5 = core;
  var constants = constants;
  p5.Graphics = function (elt, pInst, isMainCanvas) {
    p5.Element.call(this, elt, pInst);
    this.canvas = elt;
    this.drawingContext = this.canvas.getContext('2d');
    this._pInst = pInst;
    if (isMainCanvas) {
      this._isMainCanvas = true;
      this._pInst._setProperty('_curElement', this);
      this._pInst._setProperty('canvas', this.canvas);
      this._pInst._setProperty('drawingContext', this.drawingContext);
      this._pInst._setProperty('width', this.width);
      this._pInst._setProperty('height', this.height);
    } else {
      this.canvas.style.display = 'none';
      this._styles = [];
    }
  };
  p5.Graphics.prototype = Object.create(p5.Element.prototype);
  p5.Graphics.prototype._applyDefaults = function () {
    this.drawingContext.fillStyle = '#FFFFFF';
    this.drawingContext.strokeStyle = '#000000';
    this.drawingContext.lineCap = constants.ROUND;
    this.drawingContext.font = 'normal 12px sans-serif';
  };
  p5.Graphics.prototype.resize = function (w, h) {
    this.width = w;
    this.height = h;
    this.elt.width = w * this._pInst._pixelDensity;
    this.elt.height = h * this._pInst._pixelDensity;
    this.elt.style.width = w + 'px';
    this.elt.style.height = h + 'px';
    if (this._isMainCanvas) {
      this._pInst._setProperty('width', this.width);
      this._pInst._setProperty('height', this.height);
    }
    this.drawingContext.scale(this._pInst._pixelDensity, this._pInst._pixelDensity);
  };
  return p5.Graphics;
}({}, amdclean['core'], amdclean['constants']);
amdclean['filters'] = function (require) {
  'use strict';
  var Filters = {};
  Filters._toPixels = function (canvas) {
    if (canvas instanceof ImageData) {
      return canvas.data;
    } else {
      return canvas.getContext('2d').getImageData(0, 0, canvas.width, canvas.height).data;
    }
  };
  Filters._getARGB = function (data, i) {
    var offset = i * 4;
    return data[offset + 3] << 24 & 4278190080 | data[offset] << 16 & 16711680 | data[offset + 1] << 8 & 65280 | data[offset + 2] & 255;
  };
  Filters._setPixels = function (pixels, data) {
    var offset = 0;
    for (var i = 0, al = pixels.length; i < al; i++) {
      offset = i * 4;
      pixels[offset + 0] = (data[i] & 16711680) >>> 16;
      pixels[offset + 1] = (data[i] & 65280) >>> 8;
      pixels[offset + 2] = data[i] & 255;
      pixels[offset + 3] = (data[i] & 4278190080) >>> 24;
    }
  };
  Filters._toImageData = function (canvas) {
    if (canvas instanceof ImageData) {
      return canvas;
    } else {
      return canvas.getContext('2d').getImageData(0, 0, canvas.width, canvas.height);
    }
  };
  Filters._createImageData = function (width, height) {
    Filters._tmpCanvas = document.createElement('canvas');
    Filters._tmpCtx = Filters._tmpCanvas.getContext('2d');
    return this._tmpCtx.createImageData(width, height);
  };
  Filters.apply = function (canvas, func, filterParam) {
    var ctx = canvas.getContext('2d');
    var imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    var newImageData = func(imageData, filterParam);
    if (newImageData instanceof ImageData) {
      ctx.putImageData(newImageData, 0, 0, 0, 0, canvas.width, canvas.height);
    } else {
      ctx.putImageData(imageData, 0, 0, 0, 0, canvas.width, canvas.height);
    }
  };
  Filters.threshold = function (canvas, level) {
    var pixels = Filters._toPixels(canvas);
    if (level === undefined) {
      level = 0.5;
    }
    var thresh = Math.floor(level * 255);
    for (var i = 0; i < pixels.length; i += 4) {
      var r = pixels[i];
      var g = pixels[i + 1];
      var b = pixels[i + 2];
      var grey = 0.2126 * r + 0.7152 * g + 0.0722 * b;
      var val;
      if (grey >= thresh) {
        val = 255;
      } else {
        val = 0;
      }
      pixels[i] = pixels[i + 1] = pixels[i + 2] = val;
    }
  };
  Filters.gray = function (canvas) {
    var pixels = Filters._toPixels(canvas);
    for (var i = 0; i < pixels.length; i += 4) {
      var r = pixels[i];
      var g = pixels[i + 1];
      var b = pixels[i + 2];
      var gray = 0.2126 * r + 0.7152 * g + 0.0722 * b;
      pixels[i] = pixels[i + 1] = pixels[i + 2] = gray;
    }
  };
  Filters.opaque = function (canvas) {
    var pixels = Filters._toPixels(canvas);
    for (var i = 0; i < pixels.length; i += 4) {
      pixels[i + 3] = 255;
    }
    return pixels;
  };
  Filters.invert = function (canvas) {
    var pixels = Filters._toPixels(canvas);
    for (var i = 0; i < pixels.length; i += 4) {
      pixels[i] = 255 - pixels[i];
      pixels[i + 1] = 255 - pixels[i + 1];
      pixels[i + 2] = 255 - pixels[i + 2];
    }
  };
  Filters.posterize = function (canvas, level) {
    var pixels = Filters._toPixels(canvas);
    if (level < 2 || level > 255) {
      throw new Error('Level must be greater than 2 and less than 255 for posterize');
    }
    var levels1 = level - 1;
    for (var i = 0; i < pixels.length; i += 4) {
      var rlevel = pixels[i];
      var glevel = pixels[i + 1];
      var blevel = pixels[i + 2];
      pixels[i] = (rlevel * level >> 8) * 255 / levels1;
      pixels[i + 1] = (glevel * level >> 8) * 255 / levels1;
      pixels[i + 2] = (blevel * level >> 8) * 255 / levels1;
    }
  };
  Filters.dilate = function (canvas) {
    var pixels = Filters._toPixels(canvas);
    var currIdx = 0;
    var maxIdx = pixels.length ? pixels.length / 4 : 0;
    var out = new Int32Array(maxIdx);
    var currRowIdx, maxRowIdx, colOrig, colOut, currLum;
    var idxRight, idxLeft, idxUp, idxDown, colRight, colLeft, colUp, colDown, lumRight, lumLeft, lumUp, lumDown;
    while (currIdx < maxIdx) {
      currRowIdx = currIdx;
      maxRowIdx = currIdx + canvas.width;
      while (currIdx < maxRowIdx) {
        colOrig = colOut = Filters._getARGB(pixels, currIdx);
        idxLeft = currIdx - 1;
        idxRight = currIdx + 1;
        idxUp = currIdx - canvas.width;
        idxDown = currIdx + canvas.width;
        if (idxLeft < currRowIdx) {
          idxLeft = currIdx;
        }
        if (idxRight >= maxRowIdx) {
          idxRight = currIdx;
        }
        if (idxUp < 0) {
          idxUp = 0;
        }
        if (idxDown >= maxIdx) {
          idxDown = currIdx;
        }
        colUp = Filters._getARGB(pixels, idxUp);
        colLeft = Filters._getARGB(pixels, idxLeft);
        colDown = Filters._getARGB(pixels, idxDown);
        colRight = Filters._getARGB(pixels, idxRight);
        currLum = 77 * (colOrig >> 16 & 255) + 151 * (colOrig >> 8 & 255) + 28 * (colOrig & 255);
        lumLeft = 77 * (colLeft >> 16 & 255) + 151 * (colLeft >> 8 & 255) + 28 * (colLeft & 255);
        lumRight = 77 * (colRight >> 16 & 255) + 151 * (colRight >> 8 & 255) + 28 * (colRight & 255);
        lumUp = 77 * (colUp >> 16 & 255) + 151 * (colUp >> 8 & 255) + 28 * (colUp & 255);
        lumDown = 77 * (colDown >> 16 & 255) + 151 * (colDown >> 8 & 255) + 28 * (colDown & 255);
        if (lumLeft > currLum) {
          colOut = colLeft;
          currLum = lumLeft;
        }
        if (lumRight > currLum) {
          colOut = colRight;
          currLum = lumRight;
        }
        if (lumUp > currLum) {
          colOut = colUp;
          currLum = lumUp;
        }
        if (lumDown > currLum) {
          colOut = colDown;
          currLum = lumDown;
        }
        out[currIdx++] = colOut;
      }
    }
    Filters._setPixels(pixels, out);
  };
  Filters.erode = function (canvas) {
    var pixels = Filters._toPixels(canvas);
    var currIdx = 0;
    var maxIdx = pixels.length ? pixels.length / 4 : 0;
    var out = new Int32Array(maxIdx);
    var currRowIdx, maxRowIdx, colOrig, colOut, currLum;
    var idxRight, idxLeft, idxUp, idxDown, colRight, colLeft, colUp, colDown, lumRight, lumLeft, lumUp, lumDown;
    while (currIdx < maxIdx) {
      currRowIdx = currIdx;
      maxRowIdx = currIdx + canvas.width;
      while (currIdx < maxRowIdx) {
        colOrig = colOut = Filters._getARGB(pixels, currIdx);
        idxLeft = currIdx - 1;
        idxRight = currIdx + 1;
        idxUp = currIdx - canvas.width;
        idxDown = currIdx + canvas.width;
        if (idxLeft < currRowIdx) {
          idxLeft = currIdx;
        }
        if (idxRight >= maxRowIdx) {
          idxRight = currIdx;
        }
        if (idxUp < 0) {
          idxUp = 0;
        }
        if (idxDown >= maxIdx) {
          idxDown = currIdx;
        }
        colUp = Filters._getARGB(pixels, idxUp);
        colLeft = Filters._getARGB(pixels, idxLeft);
        colDown = Filters._getARGB(pixels, idxDown);
        colRight = Filters._getARGB(pixels, idxRight);
        currLum = 77 * (colOrig >> 16 & 255) + 151 * (colOrig >> 8 & 255) + 28 * (colOrig & 255);
        lumLeft = 77 * (colLeft >> 16 & 255) + 151 * (colLeft >> 8 & 255) + 28 * (colLeft & 255);
        lumRight = 77 * (colRight >> 16 & 255) + 151 * (colRight >> 8 & 255) + 28 * (colRight & 255);
        lumUp = 77 * (colUp >> 16 & 255) + 151 * (colUp >> 8 & 255) + 28 * (colUp & 255);
        lumDown = 77 * (colDown >> 16 & 255) + 151 * (colDown >> 8 & 255) + 28 * (colDown & 255);
        if (lumLeft < currLum) {
          colOut = colLeft;
          currLum = lumLeft;
        }
        if (lumRight < currLum) {
          colOut = colRight;
          currLum = lumRight;
        }
        if (lumUp < currLum) {
          colOut = colUp;
          currLum = lumUp;
        }
        if (lumDown < currLum) {
          colOut = colDown;
          currLum = lumDown;
        }
        out[currIdx++] = colOut;
      }
    }
    Filters._setPixels(pixels, out);
  };
  var blurRadius;
  var blurKernelSize;
  var blurKernel;
  var blurMult;
  function buildBlurKernel(r) {
    var radius = r * 3.5 | 0;
    radius = radius < 1 ? 1 : radius < 248 ? radius : 248;
    if (blurRadius !== radius) {
      blurRadius = radius;
      blurKernelSize = 1 + blurRadius << 1;
      blurKernel = new Int32Array(blurKernelSize);
      blurMult = new Array(blurKernelSize);
      for (var l = 0; l < blurKernelSize; l++) {
        blurMult[l] = new Int32Array(256);
      }
      var bk, bki;
      var bm, bmi;
      for (var i = 1, radiusi = radius - 1; i < radius; i++) {
        blurKernel[radius + i] = blurKernel[radiusi] = bki = radiusi * radiusi;
        bm = blurMult[radius + i];
        bmi = blurMult[radiusi--];
        for (var j = 0; j < 256; j++) {
          bm[j] = bmi[j] = bki * j;
        }
      }
      bk = blurKernel[radius] = radius * radius;
      bm = blurMult[radius];
      for (var k = 0; k < 256; k++) {
        bm[k] = bk * k;
      }
    }
  }
  function blurARGB(canvas, radius) {
    var pixels = Filters._toPixels(canvas);
    var width = canvas.width;
    var height = canvas.height;
    var numPackedPixels = width * height;
    var argb = new Int32Array(numPackedPixels);
    for (var j = 0; j < numPackedPixels; j++) {
      argb[j] = Filters._getARGB(pixels, j);
    }
    var sum, cr, cg, cb, ca;
    var read, ri, ym, ymi, bk0;
    var a2 = new Int32Array(numPackedPixels);
    var r2 = new Int32Array(numPackedPixels);
    var g2 = new Int32Array(numPackedPixels);
    var b2 = new Int32Array(numPackedPixels);
    var yi = 0;
    buildBlurKernel(radius);
    var x, y, i;
    var bm;
    for (y = 0; y < height; y++) {
      for (x = 0; x < width; x++) {
        cb = cg = cr = ca = sum = 0;
        read = x - blurRadius;
        if (read < 0) {
          bk0 = -read;
          read = 0;
        } else {
          if (read >= width) {
            break;
          }
          bk0 = 0;
        }
        for (i = bk0; i < blurKernelSize; i++) {
          if (read >= width) {
            break;
          }
          var c = argb[read + yi];
          bm = blurMult[i];
          ca += bm[(c & -16777216) >>> 24];
          cr += bm[(c & 16711680) >> 16];
          cg += bm[(c & 65280) >> 8];
          cb += bm[c & 255];
          sum += blurKernel[i];
          read++;
        }
        ri = yi + x;
        a2[ri] = ca / sum;
        r2[ri] = cr / sum;
        g2[ri] = cg / sum;
        b2[ri] = cb / sum;
      }
      yi += width;
    }
    yi = 0;
    ym = -blurRadius;
    ymi = ym * width;
    for (y = 0; y < height; y++) {
      for (x = 0; x < width; x++) {
        cb = cg = cr = ca = sum = 0;
        if (ym < 0) {
          bk0 = ri = -ym;
          read = x;
        } else {
          if (ym >= height) {
            break;
          }
          bk0 = 0;
          ri = ym;
          read = x + ymi;
        }
        for (i = bk0; i < blurKernelSize; i++) {
          if (ri >= height) {
            break;
          }
          bm = blurMult[i];
          ca += bm[a2[read]];
          cr += bm[r2[read]];
          cg += bm[g2[read]];
          cb += bm[b2[read]];
          sum += blurKernel[i];
          ri++;
          read += width;
        }
        argb[x + yi] = ca / sum << 24 | cr / sum << 16 | cg / sum << 8 | cb / sum;
      }
      yi += width;
      ymi += width;
      ym++;
    }
    Filters._setPixels(pixels, argb);
  }
  Filters.blur = function (canvas, radius) {
    blurARGB(canvas, radius);
  };
  return Filters;
}({});
amdclean['p5Image'] = function (require, core, filters) {
  'use strict';
  var p5 = core;
  var Filters = filters;
  p5.Image = function (width, height) {
    this.width = width;
    this.height = height;
    this.canvas = document.createElement('canvas');
    this.canvas.width = this.width;
    this.canvas.height = this.height;
    this.drawingContext = this.canvas.getContext('2d');
    this.pixels = [];
  };
  p5.Image.prototype._setProperty = function (prop, value) {
    this[prop] = value;
  };
  p5.Image.prototype.loadPixels = function () {
    p5.prototype.loadPixels.call(this);
  };
  p5.Image.prototype.updatePixels = function (x, y, w, h) {
    p5.prototype.updatePixels.call(this, x, y, w, h);
  };
  p5.Image.prototype.get = function (x, y, w, h) {
    return p5.prototype.get.call(this, x, y, w, h);
  };
  p5.Image.prototype.set = function (x, y, imgOrCol) {
    p5.prototype.set.call(this, x, y, imgOrCol);
  };
  p5.Image.prototype.resize = function (width, height) {
    width = width || this.canvas.width;
    height = height || this.canvas.height;
    var tempCanvas = document.createElement('canvas');
    tempCanvas.width = width;
    tempCanvas.height = height;
    tempCanvas.getContext('2d').drawImage(this.canvas, 0, 0, this.canvas.width, this.canvas.height, 0, 0, tempCanvas.width, tempCanvas.height);
    this.canvas.width = this.width = width;
    this.canvas.height = this.height = height;
    this.drawingContext.drawImage(tempCanvas, 0, 0, width, height, 0, 0, width, height);
    if (this.pixels.length > 0) {
      this.loadPixels();
    }
  };
  p5.Image.prototype.copy = function () {
    p5.prototype.copy.apply(this, arguments);
  };
  p5.Image.prototype.mask = function (p5Image) {
    if (p5Image === undefined) {
      p5Image = this;
    }
    var currBlend = this.drawingContext.globalCompositeOperation;
    var scaleFactor = 1;
    if (p5Image instanceof p5.Graphics) {
      scaleFactor = p5Image._pInst._pixelDensity;
    }
    var copyArgs = [
        p5Image,
        0,
        0,
        scaleFactor * p5Image.width,
        scaleFactor * p5Image.height,
        0,
        0,
        this.width,
        this.height
      ];
    this.drawingContext.globalCompositeOperation = 'destination-out';
    this.copy.apply(this, copyArgs);
    this.drawingContext.globalCompositeOperation = currBlend;
  };
  p5.Image.prototype.filter = function (operation, value) {
    Filters.apply(this.canvas, Filters[operation.toLowerCase()], value);
  };
  p5.Image.prototype.blend = function () {
    p5.prototype.blend.apply(this, arguments);
  };
  p5.Image.prototype.save = function (filename, extension) {
    var mimeType;
    if (!extension) {
      extension = 'png';
      mimeType = 'image/png';
    } else {
      switch (extension.toLowerCase()) {
      case 'png':
        mimeType = 'image/png';
        break;
      case 'jpeg':
        mimeType = 'image/jpeg';
        break;
      case 'jpg':
        mimeType = 'image/jpeg';
        break;
      default:
        mimeType = 'image/png';
        break;
      }
    }
    var downloadMime = 'image/octet-stream';
    var imageData = this.canvas.toDataURL(mimeType);
    imageData = imageData.replace(mimeType, downloadMime);
    p5.prototype.downloadFile(imageData, filename, extension);
  };
  return p5.Image;
}({}, amdclean['core'], amdclean['filters']);
amdclean['polargeometry'] = function (require) {
  return {
    degreesToRadians: function (x) {
      return 2 * Math.PI * x / 360;
    },
    radiansToDegrees: function (x) {
      return 360 * x / (2 * Math.PI);
    }
  };
}({});
amdclean['p5Vector'] = function (require, core, polargeometry, constants) {
  'use strict';
  var p5 = core;
  var polarGeometry = polargeometry;
  var constants = constants;
  p5.Vector = function () {
    var x, y, z;
    if (arguments[0] instanceof p5) {
      this.p5 = arguments[0];
      x = arguments[1][0] || 0;
      y = arguments[1][1] || 0;
      z = arguments[1][2] || 0;
    } else {
      x = arguments[0] || 0;
      y = arguments[1] || 0;
      z = arguments[2] || 0;
    }
    this.x = x;
    this.y = y;
    this.z = z;
  };
  p5.Vector.prototype.set = function (x, y, z) {
    if (x instanceof p5.Vector) {
      this.x = x.x || 0;
      this.y = x.y || 0;
      this.z = x.z || 0;
      return this;
    }
    if (x instanceof Array) {
      this.x = x[0] || 0;
      this.y = x[1] || 0;
      this.z = x[2] || 0;
      return this;
    }
    this.x = x || 0;
    this.y = y || 0;
    this.z = z || 0;
    return this;
  };
  p5.Vector.prototype.get = function () {
    if (this.p5) {
      return new p5.Vector(this.p5, [
        this.x,
        this.y,
        this.z
      ]);
    } else {
      return new p5.Vector(this.x, this.y, this.z);
    }
  };
  p5.Vector.prototype.add = function (x, y, z) {
    if (x instanceof p5.Vector) {
      this.x += x.x || 0;
      this.y += x.y || 0;
      this.z += x.z || 0;
      return this;
    }
    if (x instanceof Array) {
      this.x += x[0] || 0;
      this.y += x[1] || 0;
      this.z += x[2] || 0;
      return this;
    }
    this.x += x || 0;
    this.y += y || 0;
    this.z += z || 0;
    return this;
  };
  p5.Vector.prototype.sub = function (x, y, z) {
    if (x instanceof p5.Vector) {
      this.x -= x.x || 0;
      this.y -= x.y || 0;
      this.z -= x.z || 0;
      return this;
    }
    if (x instanceof Array) {
      this.x -= x[0] || 0;
      this.y -= x[1] || 0;
      this.z -= x[2] || 0;
      return this;
    }
    this.x -= x || 0;
    this.y -= y || 0;
    this.z -= z || 0;
    return this;
  };
  p5.Vector.prototype.mult = function (n) {
    this.x *= n || 0;
    this.y *= n || 0;
    this.z *= n || 0;
    return this;
  };
  p5.Vector.prototype.div = function (n) {
    this.x /= n;
    this.y /= n;
    this.z /= n;
    return this;
  };
  p5.Vector.prototype.mag = function () {
    return Math.sqrt(this.magSq());
  };
  p5.Vector.prototype.magSq = function () {
    var x = this.x, y = this.y, z = this.z;
    return x * x + y * y + z * z;
  };
  p5.Vector.prototype.dot = function (x, y, z) {
    if (x instanceof p5.Vector) {
      return this.dot(x.x, x.y, x.z);
    }
    return this.x * (x || 0) + this.y * (y || 0) + this.z * (z || 0);
  };
  p5.Vector.prototype.cross = function (v) {
    var x = this.y * v.z - this.z * v.y;
    var y = this.z * v.x - this.x * v.z;
    var z = this.x * v.y - this.y * v.x;
    if (this.p5) {
      return new p5.Vector(this.p5, [
        x,
        y,
        z
      ]);
    } else {
      return new p5.Vector(x, y, z);
    }
  };
  p5.Vector.prototype.dist = function (v) {
    var d = v.get().sub(this);
    return d.mag();
  };
  p5.Vector.prototype.normalize = function () {
    return this.div(this.mag());
  };
  p5.Vector.prototype.limit = function (l) {
    var mSq = this.magSq();
    if (mSq > l * l) {
      this.div(Math.sqrt(mSq));
      this.mult(l);
    }
    return this;
  };
  p5.Vector.prototype.setMag = function (n) {
    return this.normalize().mult(n);
  };
  p5.Vector.prototype.heading = function () {
    var h = Math.atan2(this.y, this.x);
    if (this.p5) {
      if (this.p5._angleMode === constants.RADIANS) {
        return h;
      } else {
        return polarGeometry.radiansToDegrees(h);
      }
    } else {
      return h;
    }
  };
  p5.Vector.prototype.rotate = function (a) {
    if (this.p5) {
      if (this.p5._angleMode === constants.DEGREES) {
        a = polarGeometry.degreesToRadians(a);
      }
    }
    var newHeading = this.heading() + a;
    var mag = this.mag();
    this.x = Math.cos(newHeading) * mag;
    this.y = Math.sin(newHeading) * mag;
    return this;
  };
  p5.Vector.prototype.lerp = function (x, y, z, amt) {
    if (x instanceof p5.Vector) {
      return this.lerp(x.x, x.y, x.z, y);
    }
    this.x += (x - this.x) * amt || 0;
    this.y += (y - this.y) * amt || 0;
    this.z += (z - this.z) * amt || 0;
    return this;
  };
  p5.Vector.prototype.array = function () {
    return [
      this.x || 0,
      this.y || 0,
      this.z || 0
    ];
  };
  p5.Vector.fromAngle = function (angle) {
    if (this.p5) {
      if (this.p5._angleMode === constants.DEGREES) {
        angle = polarGeometry.degreesToRadians(angle);
      }
    }
    if (this.p5) {
      return new p5.Vector(this.p5, [
        Math.cos(angle),
        Math.sin(angle),
        0
      ]);
    } else {
      return new p5.Vector(Math.cos(angle), Math.sin(angle), 0);
    }
  };
  p5.Vector.random2D = function () {
    var angle;
    if (this.p5) {
      if (this.p5._angleMode === constants.DEGREES) {
        angle = this.p5.random(360);
      } else {
        angle = this.p5.random(constants.TWO_PI);
      }
    } else {
      angle = Math.random() * Math.PI * 2;
    }
    return this.fromAngle(angle);
  };
  p5.Vector.random3D = function () {
    var angle, vz;
    if (this.p5) {
      angle = this.p5.random(0, constants.TWO_PI);
      vz = this.p5.random(-1, 1);
    } else {
      angle = Math.random() * Math.PI * 2;
      vz = Math.random() * 2 - 1;
    }
    var vx = Math.sqrt(1 - vz * vz) * Math.cos(angle);
    var vy = Math.sqrt(1 - vz * vz) * Math.sin(angle);
    if (this.p5) {
      return new p5.Vector(this.p5, [
        vx,
        vy,
        vz
      ]);
    } else {
      return new p5.Vector(vx, vy, vz);
    }
  };
  p5.Vector.add = function (v1, v2) {
    return v1.get().add(v2);
  };
  p5.Vector.sub = function (v1, v2) {
    return v1.get().sub(v2);
  };
  p5.Vector.mult = function (v, n) {
    return v.get().mult(n);
  };
  p5.Vector.div = function (v, n) {
    return v.get().div(n);
  };
  p5.Vector.dot = function (v1, v2) {
    return v1.dot(v2);
  };
  p5.Vector.cross = function (v1, v2) {
    return v1.cross(v2);
  };
  p5.Vector.dist = function (v1, v2) {
    return v1.dist(v2);
  };
  p5.Vector.lerp = function (v1, v2, amt) {
    return v1.get().lerp(v2, amt);
  };
  p5.Vector.angleBetween = function (v1, v2) {
    var angle = Math.acos(v1.dot(v2) / (v1.mag() * v2.mag()));
    if (this.p5) {
      if (this.p5._angleMode === constants.DEGREES) {
        angle = polarGeometry.radiansToDegrees(angle);
      }
    }
    return angle;
  };
  return p5.Vector;
}({}, amdclean['core'], amdclean['polargeometry'], amdclean['constants']);
amdclean['p5TableRow'] = function (require, core) {
  'use strict';
  var p5 = core;
  p5.TableRow = function (str, separator) {
    var arr = [];
    var obj = {};
    if (str) {
      separator = separator || ',';
      arr = str.split(separator);
    }
    for (var i = 0; i < arr.length; i++) {
      var key = i;
      var val = arr[i];
      obj[key] = val;
    }
    this.arr = arr;
    this.obj = obj;
    this.table = null;
  };
  p5.TableRow.prototype.set = function (column, value) {
    if (typeof column === 'string') {
      var cPos = this.table.columns.indexOf(column);
      if (cPos >= 0) {
        this.obj[column] = value;
        this.arr[cPos] = value;
      } else {
        throw 'This table has no column named "' + column + '"';
      }
    } else {
      if (column < this.table.columns.length) {
        this.arr[column] = value;
        var cTitle = this.table.columns[column];
        this.obj[cTitle] = value;
      } else {
        throw 'Column #' + column + ' is out of the range of this table';
      }
    }
  };
  p5.TableRow.prototype.setNum = function (column, value) {
    var floatVal = parseFloat(value, 10);
    this.set(column, floatVal);
  };
  p5.TableRow.prototype.setString = function (column, value) {
    var stringVal = value.toString();
    this.set(column, stringVal);
  };
  p5.TableRow.prototype.get = function (column) {
    if (typeof column === 'string') {
      return this.obj[column];
    } else {
      return this.arr[column];
    }
  };
  p5.TableRow.prototype.getNum = function (column) {
    var ret;
    if (typeof column === 'string') {
      ret = parseFloat(this.obj[column], 10);
    } else {
      ret = parseFloat(this.arr[column], 10);
    }
    if (ret.toString() === 'NaN') {
      throw 'Error: ' + this.obj[column] + ' is NaN (Not a Number)';
    }
    return ret;
  };
  p5.TableRow.prototype.getString = function (column) {
    if (typeof column === 'string') {
      return this.obj[column].toString();
    } else {
      return this.arr[column].toString();
    }
  };
  return p5.TableRow;
}({}, amdclean['core']);
amdclean['p5Table'] = function (require, core) {
  'use strict';
  var p5 = core;
  p5.Table = function (rows) {
    this.columns = [];
    this.rows = [];
  };
  p5.Table.prototype.addRow = function (row) {
    var r = row || new p5.TableRow();
    if (typeof r.arr === 'undefined' || typeof r.obj === 'undefined') {
      throw 'invalid TableRow: ' + r;
    }
    r.table = this;
    this.rows.push(r);
    return r;
  };
  p5.Table.prototype.removeRow = function (id) {
    this.rows[id].table = null;
    var chunk = this.rows.splice(id + 1, this.rows.length);
    this.rows.pop();
    this.rows = this.rows.concat(chunk);
  };
  p5.Table.prototype.getRow = function (r) {
    return this.rows[r];
  };
  p5.Table.prototype.getRows = function () {
    return this.rows;
  };
  p5.Table.prototype.findRow = function (value, column) {
    if (typeof column === 'string') {
      for (var i = 0; i < this.rows.length; i++) {
        if (this.rows[i].obj[column] === value) {
          return this.rows[i];
        }
      }
    } else {
      for (var j = 0; j < this.rows.length; j++) {
        if (this.rows[j].arr[column] === value) {
          return this.rows[j];
        }
      }
    }
    return null;
  };
  p5.Table.prototype.findRows = function (value, column) {
    var ret = [];
    if (typeof column === 'string') {
      for (var i = 0; i < this.rows.length; i++) {
        if (this.rows[i].obj[column] === value) {
          ret.push(this.rows[i]);
        }
      }
    } else {
      for (var j = 0; j < this.rows.length; j++) {
        if (this.rows[j].arr[column] === value) {
          ret.push(this.rows[j]);
        }
      }
    }
    return ret;
  };
  p5.Table.prototype.matchRow = function (regexp, column) {
    if (typeof column === 'number') {
      for (var j = 0; j < this.rows.length; j++) {
        if (this.rows[j].arr[column].match(regexp)) {
          return this.rows[j];
        }
      }
    } else {
      for (var i = 0; i < this.rows.length; i++) {
        if (this.rows[i].obj[column].match(regexp)) {
          return this.rows[i];
        }
      }
    }
    return null;
  };
  p5.Table.prototype.matchRows = function (regexp, column) {
    var ret = [];
    if (typeof column === 'number') {
      for (var j = 0; j < this.rows.length; j++) {
        if (this.rows[j].arr[column].match(regexp)) {
          ret.push(this.rows[j]);
        }
      }
    } else {
      for (var i = 0; i < this.rows.length; i++) {
        if (this.rows[i].obj[column].match(regexp)) {
          ret.push(this.rows[i]);
        }
      }
    }
    return ret;
  };
  p5.Table.prototype.getColumn = function (value) {
    var ret = [];
    if (typeof value === 'string') {
      for (var i = 0; i < this.rows.length; i++) {
        ret.push(this.rows[i].obj[value]);
      }
    } else {
      for (var j = 0; j < this.rows.length; j++) {
        ret.push(this.rows[j].arr[value]);
      }
    }
    return ret;
  };
  p5.Table.prototype.clearRows = function () {
    delete this.rows;
    this.rows = [];
  };
  p5.Table.prototype.addColumn = function (title) {
    var t = title || null;
    this.columns.push(t);
  };
  p5.Table.prototype.getColumnCount = function () {
    return this.columns.length;
  };
  p5.Table.prototype.getRowCount = function () {
    return this.rows.length;
  };
  p5.Table.prototype.removeTokens = function (chars, column) {
    var escape = function (s) {
      return s.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
    };
    var charArray = [];
    for (var i = 0; i < chars.length; i++) {
      charArray.push(escape(chars.charAt(i)));
    }
    var regex = new RegExp(charArray.join('|'), 'g');
    if (typeof column === 'undefined') {
      for (var c = 0; c < this.columns.length; c++) {
        for (var d = 0; d < this.rows.length; d++) {
          var s = this.rows[d].arr[c];
          s = s.replace(regex, '');
          this.rows[d].arr[c] = s;
          this.rows[d].obj[this.columns[c]] = s;
        }
      }
    } else if (typeof column === 'string') {
      for (var j = 0; j < this.rows.length; j++) {
        var val = this.rows[j].obj[column];
        val = val.replace(regex, '');
        this.rows[j].obj[column] = val;
        var pos = this.columns.indexOf(column);
        this.rows[j].arr[pos] = val;
      }
    } else {
      for (var k = 0; k < this.rows.length; k++) {
        var str = this.rows[k].arr[column];
        str = str.replace(regex, '');
        this.rows[k].arr[column] = str;
        this.rows[k].obj[this.columns[column]] = str;
      }
    }
  };
  p5.Table.prototype.trim = function (column) {
    var regex = new RegExp(' ', 'g');
    if (typeof column === 'undefined') {
      for (var c = 0; c < this.columns.length; c++) {
        for (var d = 0; d < this.rows.length; d++) {
          var s = this.rows[d].arr[c];
          s = s.replace(regex, '');
          this.rows[d].arr[c] = s;
          this.rows[d].obj[this.columns[c]] = s;
        }
      }
    } else if (typeof column === 'string') {
      for (var j = 0; j < this.rows.length; j++) {
        var val = this.rows[j].obj[column];
        val = val.replace(regex, '');
        this.rows[j].obj[column] = val;
        var pos = this.columns.indexOf(column);
        this.rows[j].arr[pos] = val;
      }
    } else {
      for (var k = 0; k < this.rows.length; k++) {
        var str = this.rows[k].arr[column];
        str = str.replace(regex, '');
        this.rows[k].arr[column] = str;
        this.rows[k].obj[this.columns[column]] = str;
      }
    }
  };
  p5.Table.prototype.removeColumn = function (c) {
    var cString;
    var cNumber;
    if (typeof c === 'string') {
      cString = c;
      cNumber = this.columns.indexOf(c);
      console.log('string');
    } else {
      cNumber = c;
      cString = this.columns[c];
    }
    var chunk = this.columns.splice(cNumber + 1, this.columns.length);
    this.columns.pop();
    this.columns = this.columns.concat(chunk);
    for (var i = 0; i < this.rows.length; i++) {
      var tempR = this.rows[i].arr;
      var chip = tempR.splice(cNumber + 1, tempR.length);
      tempR.pop();
      this.rows[i].arr = tempR.concat(chip);
      delete this.rows[i].obj[cString];
    }
  };
  return p5.Table;
}({}, amdclean['core']);
amdclean['colorcreating_reading'] = function (require, core, p5Color) {
  'use strict';
  var p5 = core;
  p5.prototype.alpha = function (c) {
    if (c instanceof p5.Color) {
      return c.rgba[3];
    } else if (c instanceof Array) {
      return c[3];
    } else {
      throw new Error('Needs p5.Color or pixel array as argument.');
    }
  };
  p5.prototype.blue = function (c) {
    if (c instanceof Array) {
      return c[2];
    } else if (c instanceof p5.Color) {
      return c.rgba[2];
    } else {
      throw new Error('Needs p5.Color or pixel array as argument.');
    }
  };
  p5.prototype.brightness = function (c) {
    if (!c instanceof p5.Color) {
      throw new Error('Needs p5.Color as argument.');
    }
    if (!c.hsba) {
      c.hsba = p5.Color.getRGB(c.rgba);
      c.hsba = c.hsba.concat(c.rgba[3]);
    }
    return c.hsba[2];
  };
  p5.prototype.color = function () {
    if (arguments[0] instanceof Array) {
      return new p5.Color(this, arguments[0], true);
    } else {
      return new p5.Color(this, arguments);
    }
  };
  p5.prototype.green = function (c) {
    if (c instanceof Array) {
      return c[1];
    } else if (c instanceof p5.Color) {
      return c.rgba[1];
    } else {
      throw new Error('Needs p5.Color or pixel array as argument.');
    }
  };
  p5.prototype.hue = function (c) {
    if (!c instanceof p5.Color) {
      throw new Error('Needs p5.Color as argument.');
    }
    if (!c.hsba) {
      c.hsba = p5.Color.getRGB(c.rgba);
    }
    return c.hsba[0];
  };
  p5.prototype.lerpColor = function (c1, c2, amt) {
    if (c1 instanceof Array) {
      var c = [];
      for (var i = 0; i < c1.length; i++) {
        c.push(p5.prototype.lerp(c1[i], c2[i], amt));
      }
      return c;
    } else if (c1 instanceof p5.Color) {
      var pc = [];
      for (var j = 0; j < 4; j++) {
        pc.push(p5.prototype.lerp(c1.rgba[j], c2.rgba[j], amt));
      }
      return new p5.Color(this, pc);
    } else {
      return p5.prototype.lerp(c1, c2, amt);
    }
  };
  p5.prototype.red = function (c) {
    if (c instanceof Array) {
      return c[0];
    } else if (c instanceof p5.Color) {
      return c.rgba[0];
    } else {
      throw new Error('Needs p5.Color or pixel array as argument.');
    }
  };
  p5.prototype.saturation = function (c) {
    if (!c instanceof p5.Color) {
      throw new Error('Needs p5.Color as argument.');
    }
    if (!c.hsba) {
      c.hsba = p5.Color.getRGB(c.rgba);
      c.hsba = c.hsba.concat(c.rgba[3]);
    }
    return c.hsba[1];
  };
  return p5;
}({}, amdclean['core'], amdclean['p5Color']);
amdclean['colorsetting'] = function (require, core, constants, p5Color) {
  'use strict';
  var p5 = core;
  var constants = constants;
  p5.prototype._doStroke = true;
  p5.prototype._doFill = true;
  p5.prototype._colorMode = constants.RGB;
  p5.prototype._maxRGB = [
    255,
    255,
    255,
    255
  ];
  p5.prototype._maxHSB = [
    255,
    255,
    255,
    255
  ];
  p5.prototype.background = function () {
    this.drawingContext.save();
    this.drawingContext.setTransform(1, 0, 0, 1, 0, 0);
    this.drawingContext.scale(this._pixelDensity, this._pixelDensity);
    if (arguments[0] instanceof p5.Image) {
      this.image(arguments[0], 0, 0, this.width, this.height);
    } else {
      var curFill = this.drawingContext.fillStyle;
      var newFill = p5.Color._getCanvasColor.apply(this, arguments);
      this.drawingContext.fillStyle = newFill;
      this.drawingContext.fillRect(0, 0, this.width, this.height);
      this.drawingContext.fillStyle = curFill;
    }
    this.drawingContext.restore();
  };
  p5.prototype.clear = function () {
    this.drawingContext.clearRect(0, 0, this.width, this.height);
  };
  p5.prototype.colorMode = function () {
    if (arguments[0] === constants.RGB || arguments[0] === constants.HSB) {
      this._colorMode = arguments[0];
      var isRGB = this._colorMode === constants.RGB;
      var maxArr = isRGB ? this._maxRGB : this._maxHSB;
      if (arguments.length === 2) {
        maxArr[0] = arguments[1];
        maxArr[1] = arguments[1];
        maxArr[2] = arguments[1];
      } else if (arguments.length > 2) {
        maxArr[0] = arguments[1];
        maxArr[1] = arguments[2];
        maxArr[2] = arguments[3];
      }
      if (arguments.length === 5) {
        maxArr[3] = arguments[4];
      }
    }
  };
  p5.prototype.fill = function () {
    this._setProperty('_doFill', true);
    var ctx = this.drawingContext;
    ctx.fillStyle = p5.Color._getCanvasColor.apply(this, arguments);
  };
  p5.prototype.noFill = function () {
    this._setProperty('_doFill', false);
  };
  p5.prototype.noStroke = function () {
    this._setProperty('_doStroke', false);
  };
  p5.prototype.stroke = function () {
    this._setProperty('_doStroke', true);
    var ctx = this.drawingContext;
    ctx.strokeStyle = p5.Color._getCanvasColor.apply(this, arguments);
  };
  return p5;
}({}, amdclean['core'], amdclean['constants'], amdclean['p5Color']);
amdclean['dataconversion'] = function (require, core) {
  'use strict';
  var p5 = core;
  p5.prototype.float = function (str) {
    return parseFloat(str);
  };
  p5.prototype.int = function (n, radix) {
    if (typeof n === 'string') {
      radix = radix || 10;
      return parseInt(n, radix);
    } else if (typeof n === 'number') {
      return n | 0;
    } else if (typeof n === 'boolean') {
      return n ? 1 : 0;
    } else if (n instanceof Array) {
      return n.map(p5.prototype.int);
    }
  };
  return p5;
}({}, amdclean['core']);
amdclean['dataarray_functions'] = function (require, core) {
  'use strict';
  var p5 = core;
  p5.prototype.append = function (array, value) {
    array.push(value);
    return array;
  };
  p5.prototype.arrayCopy = function (src, srcPosition, dst, dstPosition, length) {
    var start, end;
    if (typeof length !== 'undefined') {
      end = Math.min(length, src.length);
      start = dstPosition;
      src = src.slice(srcPosition, end + srcPosition);
    } else {
      if (typeof dst !== 'undefined') {
        end = dst;
        end = Math.min(end, src.length);
      } else {
        end = src.length;
      }
      start = 0;
      dst = srcPosition;
      src = src.slice(0, end);
    }
    Array.prototype.splice.apply(dst, [
      start,
      end
    ].concat(src));
  };
  p5.prototype.concat = function (list0, list1) {
    return list0.concat(list1);
  };
  p5.prototype.reverse = function (list) {
    return list.reverse();
  };
  p5.prototype.shorten = function (list) {
    list.pop();
    return list;
  };
  p5.prototype.sort = function (list, count) {
    var arr = count ? list.slice(0, Math.min(count, list.length)) : list;
    var rest = count ? list.slice(Math.min(count, list.length)) : [];
    if (typeof arr[0] === 'string') {
      arr = arr.sort();
    } else {
      arr = arr.sort(function (a, b) {
        return a - b;
      });
    }
    return arr.concat(rest);
  };
  p5.prototype.splice = function (list, value, index) {
    Array.prototype.splice.apply(list, [
      index,
      0
    ].concat(value));
    return list;
  };
  p5.prototype.subset = function (list, start, count) {
    if (typeof count !== 'undefined') {
      return list.slice(start, start + count);
    } else {
      return list.slice(start, list.length);
    }
  };
  return p5;
}({}, amdclean['core']);
amdclean['datastring_functions'] = function (require, core) {
  'use strict';
  var p5 = core;
  p5.prototype.join = function (list, separator) {
    return list.join(separator);
  };
  p5.prototype.match = function (str, reg) {
    return str.match(reg);
  };
  p5.prototype.matchAll = function (str, reg) {
    var re = new RegExp(reg, 'g');
    var match = re.exec(str);
    var matches = [];
    while (match !== null) {
      matches.push(match);
      match = re.exec(str);
    }
    return matches;
  };
  p5.prototype.nf = function () {
    if (arguments[0] instanceof Array) {
      var a = arguments[1];
      var b = arguments[2];
      return arguments[0].map(function (x) {
        return doNf(x, a, b);
      });
    } else {
      return doNf.apply(this, arguments);
    }
  };
  function doNf() {
    var num = arguments[0];
    var neg = num < 0;
    var n = neg ? num.toString().substring(1) : num.toString();
    var decimalInd = n.indexOf('.');
    var intPart = decimalInd !== -1 ? n.substring(0, decimalInd) : n;
    var decPart = decimalInd !== -1 ? n.substring(decimalInd + 1) : '';
    var str = neg ? '-' : '';
    if (arguments.length === 3) {
      for (var i = 0; i < arguments[1] - intPart.length; i++) {
        str += '0';
      }
      str += intPart;
      str += '.';
      str += decPart;
      for (var j = 0; j < arguments[2] - decPart.length; j++) {
        str += '0';
      }
      return str;
    } else {
      for (var k = 0; k < Math.max(arguments[1] - intPart.length, 0); k++) {
        str += '0';
      }
      str += n;
      return str;
    }
  }
  p5.prototype.nfc = function () {
    if (arguments[0] instanceof Array) {
      var a = arguments[1];
      return arguments[0].map(function (x) {
        return doNfc(x, a);
      });
    } else {
      return doNfc.apply(this, arguments);
    }
  };
  function doNfc() {
    var num = arguments[0].toString();
    var dec = num.indexOf('.');
    var rem = dec !== -1 ? num.substring(dec) : '';
    var n = dec !== -1 ? num.substring(0, dec) : num;
    n = n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    if (arguments[1] === 0) {
      rem = '';
    }
    if (arguments.length > 1) {
      rem = rem.substring(0, arguments[1] + 1);
    }
    return n + rem;
  }
  p5.prototype.nfp = function () {
    var nfRes = this.nf(arguments);
    if (nfRes instanceof Array) {
      return nfRes.map(addNfp);
    } else {
      return addNfp(nfRes);
    }
  };
  function addNfp() {
    return parseFloat(arguments[0]) > 0 ? '+' + arguments[0].toString() : arguments[0].toString();
  }
  p5.prototype.nfs = function () {
    var nfRes = this.nf(arguments);
    if (nfRes instanceof Array) {
      return nfRes.map(addNfs);
    } else {
      return addNfs(nfRes);
    }
  };
  function addNfs() {
    return parseFloat(arguments[0]) > 0 ? ' ' + arguments[0].toString() : arguments[0].toString();
  }
  p5.prototype.split = function (str, delim) {
    return str.split(delim);
  };
  p5.prototype.splitTokens = function () {
    var d = arguments.length > 0 ? arguments[1] : /\s/g;
    return arguments[0].split(d).filter(function (n) {
      return n;
    });
  };
  p5.prototype.trim = function (str) {
    if (str instanceof Array) {
      return str.map(this.trim);
    } else {
      return str.trim();
    }
  };
  return p5;
}({}, amdclean['core']);
amdclean['environment'] = function (require, core, constants) {
  'use strict';
  var p5 = core;
  var C = constants;
  var standardCursors = [
      C.ARROW,
      C.CROSS,
      C.HAND,
      C.MOVE,
      C.TEXT,
      C.WAIT
    ];
  p5.prototype._frameRate = 0;
  p5.prototype._lastFrameTime = new Date().getTime();
  p5.prototype._targetFrameRate = 60;
  p5.prototype.frameCount = 0;
  p5.prototype.focused = true;
  p5.prototype.cursor = function (type, x, y) {
    var cursor = 'auto';
    var canvas = this._curElement.elt;
    if (standardCursors.indexOf(type) > -1) {
      cursor = type;
    } else if (typeof type === 'string') {
      var coords = '';
      if (x && y && (typeof x === 'number' && typeof y === 'number')) {
        coords = x + ' ' + y;
      }
      if (type.substring(0, 6) !== 'http://') {
        cursor = 'url(' + type + ') ' + coords + ', auto';
      } else if (/\.(cur|jpg|jpeg|gif|png|CUR|JPG|JPEG|GIF|PNG)$/.test(type)) {
        cursor = 'url(' + type + ') ' + coords + ', auto';
      } else {
        cursor = type;
      }
    }
    canvas.style.cursor = cursor;
  };
  p5.prototype.frameRate = function (fps) {
    if (typeof fps === 'undefined') {
      return this._frameRate;
    } else {
      this._setProperty('_targetFrameRate', fps);
      this._runFrames();
      return this;
    }
  };
  p5.prototype.getFrameRate = function () {
    return this.frameRate();
  };
  p5.prototype.setFrameRate = function (fps) {
    return this.frameRate(fps);
  };
  p5.prototype.noCursor = function () {
    this._curElement.elt.style.cursor = 'none';
  };
  p5.prototype.displayWidth = screen.width;
  p5.prototype.displayHeight = screen.height;
  p5.prototype.windowWidth = window.innerWidth;
  p5.prototype.windowHeight = window.innerHeight;
  p5.prototype.onresize = function (e) {
    this._setProperty('windowWidth', window.innerWidth);
    this._setProperty('windowHeight', window.innerHeight);
    var context = this._isGlobal ? window : this;
    var executeDefault;
    if (typeof context.windowResized === 'function') {
      executeDefault = context.windowResized(e);
      if (executeDefault !== undefined && !executeDefault) {
        e.preventDefault();
      }
    }
  };
  p5.prototype.width = 0;
  p5.prototype.height = 0;
  p5.prototype.fullscreen = function (val) {
    if (typeof val === 'undefined') {
      return document.fullscreenElement || document.webkitFullscreenElement || document.mozFullScreenElement || document.msFullscreenElement;
    } else {
      if (val) {
        launchFullscreen(document.documentElement);
      } else {
        exitFullscreen();
      }
    }
  };
  p5.prototype.devicePixelScaling = function (val) {
    if (val) {
      this._pixelDensity = window.devicePixelRatio || 1;
    } else {
      this._pixelDensity = 1;
    }
    this.resizeCanvas(this.width, this.height, true);
  };
  function launchFullscreen(element) {
    var enabled = document.fullscreenEnabled || document.webkitFullscreenEnabled || document.mozFullScreenEnabled || document.msFullscreenEnabled;
    if (!enabled) {
      throw new Error('Fullscreen not enabled in this browser.');
    }
    if (element.requestFullscreen) {
      element.requestFullscreen();
    } else if (element.mozRequestFullScreen) {
      element.mozRequestFullScreen();
    } else if (element.webkitRequestFullscreen) {
      element.webkitRequestFullscreen();
    } else if (element.msRequestFullscreen) {
      element.msRequestFullscreen();
    }
  }
  function exitFullscreen() {
    if (document.exitFullscreen) {
      document.exitFullscreen();
    } else if (document.mozCancelFullScreen) {
      document.mozCancelFullScreen();
    } else if (document.webkitExitFullscreen) {
      document.webkitExitFullscreen();
    }
  }
  p5.prototype.getURL = function () {
    return location.href;
  };
  p5.prototype.getURLPath = function () {
    return location.pathname.split('/').filter(function (v) {
      return v !== '';
    });
  };
  p5.prototype.getURLParams = function () {
    var re = /[?&]([^&=]+)(?:[&=])([^&=]+)/gim;
    var m;
    var v = {};
    while ((m = re.exec(location.search)) != null) {
      if (m.index === re.lastIndex) {
        re.lastIndex++;
      }
      v[m[1]] = m[2];
    }
    return v;
  };
  return p5;
}({}, amdclean['core'], amdclean['constants']);
amdclean['imageimage'] = function (require, core, constants) {
  'use strict';
  var p5 = core;
  var constants = constants;
  p5.prototype._imageMode = constants.CORNER;
  p5.prototype._tint = null;
  p5.prototype.createImage = function (width, height) {
    return new p5.Image(width, height);
  };
  return p5;
}({}, amdclean['core'], amdclean['constants']);
amdclean['canvas'] = function (require, constants) {
  var constants = constants;
  return {
    modeAdjust: function (a, b, c, d, mode) {
      if (mode === constants.CORNER) {
        return {
          x: a,
          y: b,
          w: c,
          h: d
        };
      } else if (mode === constants.CORNERS) {
        return {
          x: a,
          y: b,
          w: c - a,
          h: d - b
        };
      } else if (mode === constants.RADIUS) {
        return {
          x: a - c,
          y: b - d,
          w: 2 * c,
          h: 2 * d
        };
      } else if (mode === constants.CENTER) {
        return {
          x: a - c * 0.5,
          y: b - d * 0.5,
          w: c,
          h: d
        };
      }
    },
    arcModeAdjust: function (a, b, c, d, mode) {
      if (mode === constants.CORNER) {
        return {
          x: a + c * 0.5,
          y: b + d * 0.5,
          w: c,
          h: d
        };
      } else if (mode === constants.CORNERS) {
        return {
          x: a,
          y: b,
          w: c + a,
          h: d + b
        };
      } else if (mode === constants.RADIUS) {
        return {
          x: a,
          y: b,
          w: 2 * c,
          h: 2 * d
        };
      } else if (mode === constants.CENTER) {
        return {
          x: a,
          y: b,
          w: c,
          h: d
        };
      }
    }
  };
}({}, amdclean['constants']);
amdclean['imageloading_displaying'] = function (require, core, filters, canvas, constants) {
  'use strict';
  var p5 = core;
  var Filters = filters;
  var canvas = canvas;
  var constants = constants;
  p5.prototype.loadImage = function (path, successCallback, failureCallback) {
    var img = new Image();
    var pImg = new p5.Image(1, 1, this);
    img.onload = function () {
      pImg.width = pImg.canvas.width = img.width;
      pImg.height = pImg.canvas.height = img.height;
      pImg.canvas.getContext('2d').drawImage(img, 0, 0);
      if (typeof successCallback === 'function') {
        successCallback(pImg);
      }
    };
    img.onerror = function (e) {
      if (typeof failureCallback === 'function') {
        failureCallback(e);
      }
    };
    if (path.indexOf('data:image/') !== 0) {
      img.crossOrigin = 'Anonymous';
    }
    img.src = path;
    return pImg;
  };
  p5.prototype.image = function (img, x, y, width, height) {
    var frame = img.canvas || img.elt;
    x = x || 0;
    y = y || 0;
    width = width || img.width;
    height = height || img.height;
    var vals = canvas.modeAdjust(x, y, width, height, this._imageMode);
    if (this._tint && img.canvas) {
      this.drawingContext.drawImage(this._getTintedImageCanvas(img), vals.x, vals.y, vals.w, vals.h);
    } else {
      this.drawingContext.drawImage(frame, vals.x, vals.y, vals.w, vals.h);
    }
  };
  p5.prototype.tint = function () {
    var c = p5.Color._getFormattedColor.apply(this, arguments);
    c = p5.Color._normalizeColorArray.call(this, c);
    this._tint = c;
  };
  p5.prototype.noTint = function () {
    this._tint = null;
  };
  p5.prototype._getTintedImageCanvas = function (img) {
    if (!img.canvas) {
      return img;
    }
    var pixels = Filters._toPixels(img.canvas);
    var tmpCanvas = document.createElement('canvas');
    tmpCanvas.width = img.canvas.width;
    tmpCanvas.height = img.canvas.height;
    var tmpCtx = tmpCanvas.getContext('2d');
    var id = tmpCtx.createImageData(img.canvas.width, img.canvas.height);
    var newPixels = id.data;
    for (var i = 0; i < pixels.length; i += 4) {
      var r = pixels[i];
      var g = pixels[i + 1];
      var b = pixels[i + 2];
      var a = pixels[i + 3];
      newPixels[i] = r * this._tint[0] / 255;
      newPixels[i + 1] = g * this._tint[1] / 255;
      newPixels[i + 2] = b * this._tint[2] / 255;
      newPixels[i + 3] = a * this._tint[3] / 255;
    }
    tmpCtx.putImageData(id, 0, 0);
    return tmpCanvas;
  };
  p5.prototype.imageMode = function (m) {
    if (m === constants.CORNER || m === constants.CORNERS || m === constants.CENTER) {
      this._imageMode = m;
    }
  };
  return p5;
}({}, amdclean['core'], amdclean['filters'], amdclean['canvas'], amdclean['constants']);
amdclean['imagepixels'] = function (require, core, filters, p5Color) {
  'use strict';
  var p5 = core;
  var Filters = filters;
  p5.prototype.pixels = [];
  p5.prototype.blend = function () {
    var currBlend = this.drawingContext.globalCompositeOperation;
    var blendMode = arguments[arguments.length - 1];
    var copyArgs = Array.prototype.slice.call(arguments, 0, arguments.length - 1);
    this.drawingContext.globalCompositeOperation = blendMode;
    this.copy.apply(this, copyArgs);
    this.drawingContext.globalCompositeOperation = currBlend;
  };
  p5.prototype.copy = function () {
    var srcImage, sx, sy, sw, sh, dx, dy, dw, dh;
    if (arguments.length === 9) {
      srcImage = arguments[0];
      sx = arguments[1];
      sy = arguments[2];
      sw = arguments[3];
      sh = arguments[4];
      dx = arguments[5];
      dy = arguments[6];
      dw = arguments[7];
      dh = arguments[8];
    } else if (arguments.length === 8) {
      sx = arguments[0];
      sy = arguments[1];
      sw = arguments[2];
      sh = arguments[3];
      dx = arguments[4];
      dy = arguments[5];
      dw = arguments[6];
      dh = arguments[7];
      srcImage = this;
    } else {
      throw new Error('Signature not supported');
    }
    var s = srcImage.canvas.width / srcImage.width;
    this.drawingContext.drawImage(srcImage.canvas, s * sx, s * sy, s * sw, s * sh, dx, dy, dw, dh);
  };
  p5.prototype.filter = function (operation, value) {
    Filters.apply(this.canvas, Filters[operation.toLowerCase()], value);
  };
  p5.prototype.get = function (x, y, w, h) {
    if (x === undefined && y === undefined && w === undefined && h === undefined) {
      x = 0;
      y = 0;
      w = this.width;
      h = this.height;
    } else if (w === undefined && h === undefined) {
      w = 1;
      h = 1;
    }
    if (x > this.width || y > this.height || x < 0 || y < 0) {
      return [
        0,
        0,
        0,
        255
      ];
    }
    var imageData = this.drawingContext.getImageData(x, y, w, h);
    var data = imageData.data;
    if (w === 1 && h === 1) {
      var pixels = [];
      for (var i = 0; i < data.length; i += 4) {
        pixels.push(data[i], data[i + 1], data[i + 2], data[i + 3]);
      }
      return pixels;
    } else {
      w = Math.min(w, this.width);
      h = Math.min(h, this.height);
      var region = new p5.Image(w, h);
      region.canvas.getContext('2d').putImageData(imageData, 0, 0, 0, 0, w, h);
      return region;
    }
  };
  p5.prototype.loadPixels = function () {
    var width = this.width;
    var height = this.height;
    var imageData = this.drawingContext.getImageData(0, 0, width, height);
    this._setProperty('imageData', imageData);
    this._setProperty('pixels', imageData.data);
  };
  p5.prototype.set = function (x, y, imgOrCol) {
    if (imgOrCol instanceof p5.Image) {
      this.drawingContext.save();
      this.drawingContext.setTransform(1, 0, 0, 1, 0, 0);
      this.drawingContext.scale(this._pixelDensity, this._pixelDensity);
      this.drawingContext.drawImage(imgOrCol.canvas, x, y);
      this.loadPixels.call(this);
      this.drawingContext.restore();
    } else {
      var idx = 4 * (y * this.width + x);
      if (!this.imageData) {
        this.loadPixels.call(this);
      }
      if (typeof imgOrCol === 'number') {
        if (idx < this.pixels.length) {
          this.pixels[idx] = imgOrCol;
          this.pixels[idx + 1] = imgOrCol;
          this.pixels[idx + 2] = imgOrCol;
          this.pixels[idx + 3] = 255;
        }
      } else if (imgOrCol instanceof Array) {
        if (imgOrCol.length < 4) {
          throw new Error('pixel array must be of the form [R, G, B, A]');
        }
        if (idx < this.pixels.length) {
          this.pixels[idx] = imgOrCol[0];
          this.pixels[idx + 1] = imgOrCol[1];
          this.pixels[idx + 2] = imgOrCol[2];
          this.pixels[idx + 3] = imgOrCol[3];
        }
      } else if (imgOrCol instanceof p5.Color) {
        if (idx < this.pixels.length) {
          this.pixels[idx] = imgOrCol.rgba[0];
          this.pixels[idx + 1] = imgOrCol.rgba[1];
          this.pixels[idx + 2] = imgOrCol.rgba[2];
          this.pixels[idx + 3] = imgOrCol.rgba[3];
        }
      }
    }
  };
  p5.prototype.updatePixels = function (x, y, w, h) {
    if (x === undefined && y === undefined && w === undefined && h === undefined) {
      x = 0;
      y = 0;
      w = this.width;
      h = this.height;
    }
    this.drawingContext.putImageData(this.imageData, x, y, 0, 0, w, h);
  };
  return p5;
}({}, amdclean['core'], amdclean['filters'], amdclean['p5Color']);
!function (name, context, definition) {
  if (typeof module != 'undefined' && module.exports)
    module.exports = definition();
  else if (typeof define == 'function' && define.amd)
    define('reqwest', definition);
  else
    context[name] = definition();
}('reqwest', amdclean, function () {
  var win = window, doc = document, twoHundo = /^(20\d|1223)$/, byTag = 'getElementsByTagName', readyState = 'readyState', contentType = 'Content-Type', requestedWith = 'X-Requested-With', head = doc[byTag]('head')[0], uniqid = 0, callbackPrefix = 'reqwest_' + +new Date(), lastValue, xmlHttpRequest = 'XMLHttpRequest', xDomainRequest = 'XDomainRequest', noop = function () {
    }, isArray = typeof Array.isArray == 'function' ? Array.isArray : function (a) {
      return a instanceof Array;
    }, defaultHeaders = {
      'contentType': 'application/x-www-form-urlencoded',
      'requestedWith': xmlHttpRequest,
      'accept': {
        '*': 'text/javascript, text/html, application/xml, text/xml, */*',
        'xml': 'application/xml, text/xml',
        'html': 'text/html',
        'text': 'text/plain',
        'json': 'application/json, text/javascript',
        'js': 'application/javascript, text/javascript'
      }
    }, xhr = function (o) {
      if (o['crossOrigin'] === true) {
        var xhr = win[xmlHttpRequest] ? new XMLHttpRequest() : null;
        if (xhr && 'withCredentials' in xhr) {
          return xhr;
        } else if (win[xDomainRequest]) {
          return new XDomainRequest();
        } else {
          throw new Error('Browser does not support cross-origin requests');
        }
      } else if (win[xmlHttpRequest]) {
        return new XMLHttpRequest();
      } else {
        return new ActiveXObject('Microsoft.XMLHTTP');
      }
    }, globalSetupOptions = {
      dataFilter: function (data) {
        return data;
      }
    };
  function handleReadyState(r, success, error) {
    return function () {
      if (r._aborted)
        return error(r.request);
      if (r.request && r.request[readyState] == 4) {
        r.request.onreadystatechange = noop;
        if (twoHundo.test(r.request.status))
          success(r.request);
        else
          error(r.request);
      }
    };
  }
  function setHeaders(http, o) {
    var headers = o['headers'] || {}, h;
    headers['Accept'] = headers['Accept'] || defaultHeaders['accept'][o['type']] || defaultHeaders['accept']['*'];
    if (!o['crossOrigin'] && !headers[requestedWith])
      headers[requestedWith] = defaultHeaders['requestedWith'];
    if (!headers[contentType])
      headers[contentType] = o['contentType'] || defaultHeaders['contentType'];
    for (h in headers)
      headers.hasOwnProperty(h) && 'setRequestHeader' in http && http.setRequestHeader(h, headers[h]);
  }
  function setCredentials(http, o) {
    if (typeof o['withCredentials'] !== 'undefined' && typeof http.withCredentials !== 'undefined') {
      http.withCredentials = !!o['withCredentials'];
    }
  }
  function generalCallback(data) {
    lastValue = data;
  }
  function urlappend(url, s) {
    return url + (/\?/.test(url) ? '&' : '?') + s;
  }
  function handleJsonp(o, fn, err, url) {
    var reqId = uniqid++, cbkey = o['jsonpCallback'] || 'callback', cbval = o['jsonpCallbackName'] || reqwest.getcallbackPrefix(reqId), cbreg = new RegExp('((^|\\?|&)' + cbkey + ')=([^&]+)'), match = url.match(cbreg), script = doc.createElement('script'), loaded = 0, isIE10 = navigator.userAgent.indexOf('MSIE 10.0') !== -1;
    if (match) {
      if (match[3] === '?') {
        url = url.replace(cbreg, '$1=' + cbval);
      } else {
        cbval = match[3];
      }
    } else {
      url = urlappend(url, cbkey + '=' + cbval);
    }
    win[cbval] = generalCallback;
    script.type = 'text/javascript';
    script.src = url;
    script.async = true;
    if (typeof script.onreadystatechange !== 'undefined' && !isIE10) {
      script.event = 'onclick';
      script.htmlFor = script.id = '_reqwest_' + reqId;
    }
    script.onload = script.onreadystatechange = function () {
      if (script[readyState] && script[readyState] !== 'complete' && script[readyState] !== 'loaded' || loaded) {
        return false;
      }
      script.onload = script.onreadystatechange = null;
      script.onclick && script.onclick();
      fn(lastValue);
      lastValue = undefined;
      head.removeChild(script);
      loaded = 1;
    };
    head.appendChild(script);
    return {
      abort: function () {
        script.onload = script.onreadystatechange = null;
        err({}, 'Request is aborted: timeout', {});
        lastValue = undefined;
        head.removeChild(script);
        loaded = 1;
      }
    };
  }
  function getRequest(fn, err) {
    var o = this.o, method = (o['method'] || 'GET').toUpperCase(), url = typeof o === 'string' ? o : o['url'], data = o['processData'] !== false && o['data'] && typeof o['data'] !== 'string' ? reqwest.toQueryString(o['data']) : o['data'] || null, http, sendWait = false;
    if ((o['type'] == 'jsonp' || method == 'GET') && data) {
      url = urlappend(url, data);
      data = null;
    }
    if (o['type'] == 'jsonp')
      return handleJsonp(o, fn, err, url);
    http = o.xhr && o.xhr(o) || xhr(o);
    http.open(method, url, o['async'] === false ? false : true);
    setHeaders(http, o);
    setCredentials(http, o);
    if (win[xDomainRequest] && http instanceof win[xDomainRequest]) {
      http.onload = fn;
      http.onerror = err;
      http.onprogress = function () {
      };
      sendWait = true;
    } else {
      http.onreadystatechange = handleReadyState(this, fn, err);
    }
    o['before'] && o['before'](http);
    if (sendWait) {
      setTimeout(function () {
        http.send(data);
      }, 200);
    } else {
      http.send(data);
    }
    return http;
  }
  function Reqwest(o, fn) {
    this.o = o;
    this.fn = fn;
    init.apply(this, arguments);
  }
  function setType(url) {
    var m = url.match(/\.(json|jsonp|html|xml)(\?|$)/);
    return m ? m[1] : 'js';
  }
  function init(o, fn) {
    this.url = typeof o == 'string' ? o : o['url'];
    this.timeout = null;
    this._fulfilled = false;
    this._successHandler = function () {
    };
    this._fulfillmentHandlers = [];
    this._errorHandlers = [];
    this._completeHandlers = [];
    this._erred = false;
    this._responseArgs = {};
    var self = this, type = o['type'] || setType(this.url);
    fn = fn || function () {
    };
    if (o['timeout']) {
      this.timeout = setTimeout(function () {
        self.abort();
      }, o['timeout']);
    }
    if (o['success']) {
      this._successHandler = function () {
        o['success'].apply(o, arguments);
      };
    }
    if (o['error']) {
      this._errorHandlers.push(function () {
        o['error'].apply(o, arguments);
      });
    }
    if (o['complete']) {
      this._completeHandlers.push(function () {
        o['complete'].apply(o, arguments);
      });
    }
    function complete(resp) {
      o['timeout'] && clearTimeout(self.timeout);
      self.timeout = null;
      while (self._completeHandlers.length > 0) {
        self._completeHandlers.shift()(resp);
      }
    }
    function success(resp) {
      resp = type !== 'jsonp' ? self.request : resp;
      var filteredResponse = globalSetupOptions.dataFilter(resp.responseText, type), r = filteredResponse;
      try {
        resp.responseText = r;
      } catch (e) {
      }
      if (r) {
        switch (type) {
        case 'json':
          try {
            resp = win.JSON ? win.JSON.parse(r) : eval('(' + r + ')');
          } catch (err) {
            return error(resp, 'Could not parse JSON in response', err);
          }
          break;
        case 'js':
          resp = eval(r);
          break;
        case 'html':
          resp = r;
          break;
        case 'xml':
          resp = resp.responseXML && resp.responseXML.parseError && resp.responseXML.parseError.errorCode && resp.responseXML.parseError.reason ? null : resp.responseXML;
          break;
        }
      }
      self._responseArgs.resp = resp;
      self._fulfilled = true;
      fn(resp);
      self._successHandler(resp);
      while (self._fulfillmentHandlers.length > 0) {
        resp = self._fulfillmentHandlers.shift()(resp);
      }
      complete(resp);
    }
    function error(resp, msg, t) {
      resp = self.request;
      self._responseArgs.resp = resp;
      self._responseArgs.msg = msg;
      self._responseArgs.t = t;
      self._erred = true;
      while (self._errorHandlers.length > 0) {
        self._errorHandlers.shift()(resp, msg, t);
      }
      complete(resp);
    }
    this.request = getRequest.call(this, success, error);
  }
  Reqwest.prototype = {
    abort: function () {
      this._aborted = true;
      this.request.abort();
    },
    retry: function () {
      init.call(this, this.o, this.fn);
    },
    then: function (success, fail) {
      success = success || function () {
      };
      fail = fail || function () {
      };
      if (this._fulfilled) {
        this._responseArgs.resp = success(this._responseArgs.resp);
      } else if (this._erred) {
        fail(this._responseArgs.resp, this._responseArgs.msg, this._responseArgs.t);
      } else {
        this._fulfillmentHandlers.push(success);
        this._errorHandlers.push(fail);
      }
      return this;
    },
    always: function (fn) {
      if (this._fulfilled || this._erred) {
        fn(this._responseArgs.resp);
      } else {
        this._completeHandlers.push(fn);
      }
      return this;
    },
    fail: function (fn) {
      if (this._erred) {
        fn(this._responseArgs.resp, this._responseArgs.msg, this._responseArgs.t);
      } else {
        this._errorHandlers.push(fn);
      }
      return this;
    }
  };
  function reqwest(o, fn) {
    return new Reqwest(o, fn);
  }
  function normalize(s) {
    return s ? s.replace(/\r?\n/g, '\r\n') : '';
  }
  function serial(el, cb) {
    var n = el.name, t = el.tagName.toLowerCase(), optCb = function (o) {
        if (o && !o['disabled'])
          cb(n, normalize(o['attributes']['value'] && o['attributes']['value']['specified'] ? o['value'] : o['text']));
      }, ch, ra, val, i;
    if (el.disabled || !n)
      return;
    switch (t) {
    case 'input':
      if (!/reset|button|image|file/i.test(el.type)) {
        ch = /checkbox/i.test(el.type);
        ra = /radio/i.test(el.type);
        val = el.value;
        (!(ch || ra) || el.checked) && cb(n, normalize(ch && val === '' ? 'on' : val));
      }
      break;
    case 'textarea':
      cb(n, normalize(el.value));
      break;
    case 'select':
      if (el.type.toLowerCase() === 'select-one') {
        optCb(el.selectedIndex >= 0 ? el.options[el.selectedIndex] : null);
      } else {
        for (i = 0; el.length && i < el.length; i++) {
          el.options[i].selected && optCb(el.options[i]);
        }
      }
      break;
    }
  }
  function eachFormElement() {
    var cb = this, e, i, serializeSubtags = function (e, tags) {
        var i, j, fa;
        for (i = 0; i < tags.length; i++) {
          fa = e[byTag](tags[i]);
          for (j = 0; j < fa.length; j++)
            serial(fa[j], cb);
        }
      };
    for (i = 0; i < arguments.length; i++) {
      e = arguments[i];
      if (/input|select|textarea/i.test(e.tagName))
        serial(e, cb);
      serializeSubtags(e, [
        'input',
        'select',
        'textarea'
      ]);
    }
  }
  function serializeQueryString() {
    return reqwest.toQueryString(reqwest.serializeArray.apply(null, arguments));
  }
  function serializeHash() {
    var hash = {};
    eachFormElement.apply(function (name, value) {
      if (name in hash) {
        hash[name] && !isArray(hash[name]) && (hash[name] = [hash[name]]);
        hash[name].push(value);
      } else
        hash[name] = value;
    }, arguments);
    return hash;
  }
  reqwest.serializeArray = function () {
    var arr = [];
    eachFormElement.apply(function (name, value) {
      arr.push({
        name: name,
        value: value
      });
    }, arguments);
    return arr;
  };
  reqwest.serialize = function () {
    if (arguments.length === 0)
      return '';
    var opt, fn, args = Array.prototype.slice.call(arguments, 0);
    opt = args.pop();
    opt && opt.nodeType && args.push(opt) && (opt = null);
    opt && (opt = opt.type);
    if (opt == 'map')
      fn = serializeHash;
    else if (opt == 'array')
      fn = reqwest.serializeArray;
    else
      fn = serializeQueryString;
    return fn.apply(null, args);
  };
  reqwest.toQueryString = function (o, trad) {
    var prefix, i, traditional = trad || false, s = [], enc = encodeURIComponent, add = function (key, value) {
        value = 'function' === typeof value ? value() : value == null ? '' : value;
        s[s.length] = enc(key) + '=' + enc(value);
      };
    if (isArray(o)) {
      for (i = 0; o && i < o.length; i++)
        add(o[i]['name'], o[i]['value']);
    } else {
      for (prefix in o) {
        if (o.hasOwnProperty(prefix))
          buildParams(prefix, o[prefix], traditional, add);
      }
    }
    return s.join('&').replace(/%20/g, '+');
  };
  function buildParams(prefix, obj, traditional, add) {
    var name, i, v, rbracket = /\[\]$/;
    if (isArray(obj)) {
      for (i = 0; obj && i < obj.length; i++) {
        v = obj[i];
        if (traditional || rbracket.test(prefix)) {
          add(prefix, v);
        } else {
          buildParams(prefix + '[' + (typeof v === 'object' ? i : '') + ']', v, traditional, add);
        }
      }
    } else if (obj && obj.toString() === '[object Object]') {
      for (name in obj) {
        buildParams(prefix + '[' + name + ']', obj[name], traditional, add);
      }
    } else {
      add(prefix, obj);
    }
  }
  reqwest.getcallbackPrefix = function () {
    return callbackPrefix;
  };
  reqwest.compat = function (o, fn) {
    if (o) {
      o['type'] && (o['method'] = o['type']) && delete o['type'];
      o['dataType'] && (o['type'] = o['dataType']);
      o['jsonpCallback'] && (o['jsonpCallbackName'] = o['jsonpCallback']) && delete o['jsonpCallback'];
      o['jsonp'] && (o['jsonpCallback'] = o['jsonp']);
    }
    return new Reqwest(o, fn);
  };
  reqwest.ajaxSetup = function (options) {
    options = options || {};
    for (var k in options) {
      globalSetupOptions[k] = options[k];
    }
  };
  return reqwest;
});
amdclean['inputfiles'] = function (require, core, reqwest) {
  'use strict';
  var p5 = core;
  var reqwest = reqwest;
  p5.prototype.createInput = function () {
    throw 'not yet implemented';
  };
  p5.prototype.createReader = function () {
    throw 'not yet implemented';
  };
  p5.prototype.loadBytes = function () {
    throw 'not yet implemented';
  };
  p5.prototype.loadJSON = function () {
    var path = arguments[0];
    var callback = arguments[1];
    var ret = [];
    var t = path.indexOf('http') === -1 ? 'json' : 'jsonp';
    if (typeof arguments[2] === 'string') {
      if (arguments[2] === 'jsonp' || arguments[2] === 'json') {
        t = arguments[2];
      }
    }
    reqwest({
      url: path,
      type: t,
      crossOrigin: true
    }).then(function (resp) {
      for (var k in resp) {
        ret[k] = resp[k];
      }
      if (typeof callback !== 'undefined') {
        callback(resp);
      }
    });
    return ret;
  };
  p5.prototype.loadStrings = function (path, callback) {
    var ret = [];
    var req = new XMLHttpRequest();
    req.open('GET', path, true);
    req.onreadystatechange = function () {
      if (req.readyState === 4 && (req.status === 200 || req.status === 0)) {
        var arr = req.responseText.match(/[^\r\n]+/g);
        for (var k in arr) {
          ret[k] = arr[k];
        }
        if (typeof callback !== 'undefined') {
          callback(ret);
        }
      }
    };
    req.send(null);
    return ret;
  };
  p5.prototype.loadTable = function (path) {
    var callback = null;
    var options = [];
    var header = false;
    var sep = ',';
    for (var i = 1; i < arguments.length; i++) {
      if (typeof arguments[i] === 'function') {
        callback = arguments[i];
      } else if (typeof arguments[i] === 'string') {
        options.push(arguments[i]);
        if (arguments[i] === 'header') {
          header = true;
        }
        if (arguments[i] === 'csv') {
          sep = ',';
        } else if (arguments[i] === 'tsv') {
          sep = '\t';
        }
      }
    }
    var ret = [];
    var t = new p5.Table();
    var req = new XMLHttpRequest();
    req.open('GET', path, true);
    req.onreadystatechange = function () {
      if (req.readyState === 4 && (req.status === 200 || req.status === 0)) {
        var arr = req.responseText.match(/[^\r\n]+/g);
        for (var k in arr) {
          ret[k] = arr[k];
        }
        if (typeof callback !== 'undefined') {
          var i, row;
          if (header) {
            t.columns = new p5.TableRow(ret[0]).arr;
            for (i = 1; i < ret.length; i++) {
              row = new p5.TableRow(ret[i], sep);
              row.obj = makeObject(row.arr, t.columns);
              t.addRow(row);
            }
          } else {
            for (i = 0; i < ret[0].split(sep).length; i++) {
              t.columns[i] = i.toString();
            }
            for (i = 0; i < ret.length; i++) {
              row = new p5.TableRow(ret[i], sep);
              t.addRow(row);
            }
          }
          callback(t);
        }
      }
    };
    req.send(null);
    return t;
  };
  function makeObject(row, headers) {
    var ret = {};
    headers = headers || [];
    if (typeof headers === 'undefined') {
      for (var j = 0; j < row.length; j++) {
        headers[j.toString()] = j;
      }
    }
    for (var i = 0; i < headers.length; i++) {
      var key = headers[i];
      var val = row[i];
      ret[key] = val;
    }
    return ret;
  }
  p5.prototype.loadXML = function (path, callback) {
    var ret = [];
    reqwest({
      url: path,
      type: 'xml',
      crossOrigin: true
    }).then(function (resp) {
      callback(resp);
    });
    return ret;
  };
  p5.prototype.parseXML = function () {
    throw 'not yet implemented';
  };
  p5.prototype.selectFolder = function () {
    throw 'not yet implemented';
  };
  p5.prototype.selectInput = function () {
    throw 'not yet implemented';
  };
  p5.prototype.httpGet = function () {
    var args = Array.prototype.slice.call(arguments);
    args.push('GET');
    p5.prototype.httpDo.apply(this, args);
  };
  p5.prototype.httpPost = function () {
    var args = Array.prototype.slice.call(arguments);
    args.push('POST');
    p5.prototype.httpDo.apply(this, args);
  };
  p5.prototype.httpDo = function () {
    var method = 'GET';
    var path = arguments[0];
    var data = {};
    var type = '';
    var callback;
    for (var i = 1; i < arguments.length; i++) {
      var a = arguments[i];
      if (typeof a === 'string') {
        if (a === 'GET' || a === 'POST' || a === 'PUT') {
          method = a;
        } else {
          type = a;
        }
      } else if (typeof a === 'object') {
        data = a;
      } else if (typeof a === 'function') {
        callback = a;
      }
    }
    if (type === '') {
      if (path.indexOf('json') !== -1) {
        type = 'json';
      } else if (path.indexOf('xml') !== -1) {
        type = 'xml';
      } else {
        type = 'text';
      }
    }
    reqwest({
      url: path,
      method: method,
      data: data,
      type: type,
      crossOrigin: true,
      success: function (resp) {
        if (typeof callback !== 'undefined') {
          if (type === 'text') {
            callback(resp.response);
          } else {
            callback(resp);
          }
        }
      }
    });
  };
  return p5;
}({}, amdclean['core'], amdclean['reqwest']);
amdclean['inputkeyboard'] = function (require, core) {
  'use strict';
  var p5 = core;
  var downKeys = {};
  p5.prototype.isKeyPressed = false;
  p5.prototype.keyIsPressed = false;
  p5.prototype.key = '';
  p5.prototype.keyCode = 0;
  p5.prototype.onkeydown = function (e) {
    this._setProperty('isKeyPressed', true);
    this._setProperty('keyIsPressed', true);
    this._setProperty('keyCode', e.which);
    downKeys[e.which] = true;
    var key = String.fromCharCode(e.which);
    if (!key) {
      key = e.which;
    }
    this._setProperty('key', key);
    var keyPressed = this.keyPressed || window.keyPressed;
    if (typeof keyPressed === 'function' && !e.charCode) {
      var executeDefault = keyPressed(e);
      if (executeDefault === false) {
        e.preventDefault();
      }
    }
  };
  p5.prototype.onkeyup = function (e) {
    var keyReleased = this.keyReleased || window.keyReleased;
    this._setProperty('isKeyPressed', false);
    this._setProperty('keyIsPressed', false);
    downKeys[e.which] = false;
    var key = String.fromCharCode(e.which);
    if (!key) {
      key = e.which;
    }
    this._setProperty('key', key);
    this._setProperty('keyCode', e.which);
    if (typeof keyReleased === 'function') {
      var executeDefault = keyReleased(e);
      if (executeDefault === false) {
        e.preventDefault();
      }
    }
  };
  p5.prototype.onkeypress = function (e) {
    this._setProperty('keyCode', e.which);
    this._setProperty('key', String.fromCharCode(e.which));
    var keyTyped = this.keyTyped || window.keyTyped;
    if (typeof keyTyped === 'function') {
      var executeDefault = keyTyped(e);
      if (executeDefault === false) {
        e.preventDefault();
      }
    }
  };
  p5.prototype.onblur = function (e) {
    downKeys = {};
  };
  p5.prototype.keyIsDown = function (code) {
    return downKeys[code];
  };
  return p5;
}({}, amdclean['core']);
amdclean['inputmouse'] = function (require, core, constants) {
  'use strict';
  var p5 = core;
  var constants = constants;
  p5.prototype.mouseX = 0;
  p5.prototype.mouseY = 0;
  p5.prototype.pmouseX = 0;
  p5.prototype.pmouseY = 0;
  p5.prototype.winMouseX = 0;
  p5.prototype.winMouseY = 0;
  p5.prototype.pwinMouseX = 0;
  p5.prototype.pwinMouseY = 0;
  p5.prototype.mouseButton = 0;
  p5.prototype.mouseIsPressed = false;
  p5.prototype.isMousePressed = false;
  p5.prototype._updateMouseCoords = function (e) {
    if (e.type === 'touchstart' || e.type === 'touchmove' || e.type === 'touchend') {
      this._setProperty('mouseX', this.touchX);
      this._setProperty('mouseY', this.touchY);
    } else {
      if (this._curElement !== null) {
        var mousePos = getMousePos(this._curElement.elt, e);
        this._setProperty('mouseX', mousePos.x);
        this._setProperty('mouseY', mousePos.y);
      }
    }
    this._setProperty('winMouseX', e.pageX);
    this._setProperty('winMouseY', e.pageY);
  };
  p5.prototype._updatePMouseCoords = function (e) {
    this._setProperty('pmouseX', this.mouseX);
    this._setProperty('pmouseY', this.mouseY);
    this._setProperty('pwinMouseX', this.winMouseX);
    this._setProperty('pwinMouseY', this.winMouseY);
  };
  function getMousePos(canvas, evt) {
    var rect = canvas.getBoundingClientRect();
    return {
      x: evt.clientX - rect.left,
      y: evt.clientY - rect.top
    };
  }
  p5.prototype._setMouseButton = function (e) {
    if (e.button === 1) {
      this._setProperty('mouseButton', constants.CENTER);
    } else if (e.button === 2) {
      this._setProperty('mouseButton', constants.RIGHT);
    } else {
      this._setProperty('mouseButton', constants.LEFT);
      if (e.type === 'touchstart' || e.type === 'touchmove') {
        this._setProperty('mouseX', this.touchX);
        this._setProperty('mouseY', this.touchY);
      }
    }
  };
  p5.prototype.onmousemove = function (e) {
    var context = this._isGlobal ? window : this;
    var executeDefault;
    this._updateMouseCoords(e);
    if (!this.isMousePressed) {
      if (typeof context.mouseMoved === 'function') {
        executeDefault = context.mouseMoved(e);
        if (executeDefault === false) {
          e.preventDefault();
        }
      }
    } else {
      if (typeof context.mouseDragged === 'function') {
        executeDefault = context.mouseDragged(e);
        if (executeDefault === false) {
          e.preventDefault();
        }
      } else if (typeof context.touchMoved === 'function') {
        executeDefault = context.touchMoved(e);
        if (executeDefault === false) {
          e.preventDefault();
        }
        this._updateTouchCoords(e);
      }
    }
  };
  p5.prototype.onmousedown = function (e) {
    var context = this._isGlobal ? window : this;
    var executeDefault;
    this._setProperty('isMousePressed', true);
    this._setProperty('mouseIsPressed', true);
    this._setMouseButton(e);
    this._updateMouseCoords(e);
    if (typeof context.mousePressed === 'function') {
      executeDefault = context.mousePressed(e);
      if (executeDefault === false) {
        e.preventDefault();
      }
    } else if (typeof context.touchStarted === 'function') {
      executeDefault = context.touchStarted(e);
      if (executeDefault === false) {
        e.preventDefault();
      }
      this._updateTouchCoords(e);
    }
  };
  p5.prototype.onmouseup = function (e) {
    var context = this._isGlobal ? window : this;
    var executeDefault;
    this._setProperty('isMousePressed', false);
    this._setProperty('mouseIsPressed', false);
    if (typeof context.mouseReleased === 'function') {
      executeDefault = context.mouseReleased(e);
      if (executeDefault === false) {
        e.preventDefault();
      }
    } else if (typeof context.touchEnded === 'function') {
      executeDefault = context.touchEnded(e);
      if (executeDefault === false) {
        e.preventDefault();
      }
      this._updateTouchCoords(e);
    }
  };
  p5.prototype.onclick = function (e) {
    var context = this._isGlobal ? window : this;
    if (typeof context.mouseClicked === 'function') {
      var executeDefault = context.mouseClicked(e);
      if (executeDefault === false) {
        e.preventDefault();
      }
    }
  };
  p5.prototype.onmousewheel = function (e) {
    var context = this._isGlobal ? window : this;
    if (typeof context.mouseWheel === 'function') {
      var executeDefault = context.mouseWheel(e);
      if (executeDefault === false) {
        e.preventDefault();
      }
    }
  };
  return p5;
}({}, amdclean['core'], amdclean['constants']);
amdclean['inputtime_date'] = function (require, core) {
  'use strict';
  var p5 = core;
  p5.prototype.day = function () {
    return new Date().getDate();
  };
  p5.prototype.hour = function () {
    return new Date().getHours();
  };
  p5.prototype.minute = function () {
    return new Date().getMinutes();
  };
  p5.prototype.millis = function () {
    return new Date().getTime() - this._startTime;
  };
  p5.prototype.month = function () {
    return new Date().getMonth() + 1;
  };
  p5.prototype.second = function () {
    return new Date().getSeconds();
  };
  p5.prototype.year = function () {
    return new Date().getFullYear();
  };
  return p5;
}({}, amdclean['core']);
amdclean['inputtouch'] = function (require, core) {
  'use strict';
  var p5 = core;
  p5.prototype.touchX = 0;
  p5.prototype.touchY = 0;
  p5.prototype.ptouchX = 0;
  p5.prototype.ptouchY = 0;
  p5.prototype.touches = [];
  p5.prototype._updateTouchCoords = function (e) {
    if (e.type === 'mousedown' || e.type === 'mousemove' || e.type === 'mouseup') {
      this._setProperty('touchX', this.mouseX);
      this._setProperty('touchY', this.mouseY);
    } else {
      var touchPos = getTouchPos(this._curElement.elt, e, 0);
      this._setProperty('touchX', touchPos.x);
      this._setProperty('touchY', touchPos.y);
      var touches = [];
      for (var i = 0; i < e.changedTouches.length; i++) {
        var pos = getTouchPos(this._curElement.elt, e, i);
        touches[i] = {
          x: pos.x,
          y: pos.y
        };
      }
      this._setProperty('touches', touches);
    }
  };
  p5.prototype._updatePTouchCoords = function () {
    this._setProperty('ptouchX', this.touchX);
    this._setProperty('ptouchY', this.touchY);
  };
  function getTouchPos(canvas, e, i) {
    i = i || 0;
    var rect = canvas.getBoundingClientRect();
    return {
      x: e.changedTouches[i].pageX - rect.left,
      y: e.changedTouches[i].pageY - rect.top
    };
  }
  p5.prototype.ontouchstart = function (e) {
    var context = this._isGlobal ? window : this;
    var executeDefault;
    this._updateTouchCoords(e);
    if (typeof context.touchStarted === 'function') {
      executeDefault = context.touchStarted(e);
      if (executeDefault === false) {
        e.preventDefault();
      }
    } else if (typeof context.mousePressed === 'function') {
      executeDefault = context.mousePressed(e);
      if (executeDefault === false) {
        e.preventDefault();
      }
    }
  };
  p5.prototype.ontouchmove = function (e) {
    var context = this._isGlobal ? window : this;
    var executeDefault;
    this._updateTouchCoords(e);
    if (typeof context.touchMoved === 'function') {
      executeDefault = context.touchMoved(e);
      if (executeDefault === false) {
        e.preventDefault();
      }
    } else if (typeof context.mouseDragged === 'function') {
      executeDefault = context.mouseDragged(e);
      if (executeDefault === false) {
        e.preventDefault();
      }
      this._updateMouseCoords(e);
    }
  };
  p5.prototype.ontouchend = function (e) {
    this._updateTouchCoords(e);
    var context = this._isGlobal ? window : this;
    var executeDefault;
    if (typeof context.touchEnded === 'function') {
      executeDefault = context.touchEnded(e);
      if (executeDefault === false) {
        e.preventDefault();
      }
    } else if (typeof context.mouseReleased === 'function') {
      executeDefault = context.mouseReleased(e);
      if (executeDefault === false) {
        e.preventDefault();
      }
      this._updateMouseCoords(e);
    }
  };
  return p5;
}({}, amdclean['core']);
amdclean['mathmath'] = function (require, core) {
  'use strict';
  var p5 = core;
  p5.prototype.createVector = function () {
    return new p5.Vector(this, arguments);
  };
  return p5;
}({}, amdclean['core']);
amdclean['mathcalculation'] = function (require, core) {
  'use strict';
  var p5 = core;
  p5.prototype.abs = Math.abs;
  p5.prototype.ceil = Math.ceil;
  p5.prototype.constrain = function (n, low, high) {
    return Math.max(Math.min(n, high), low);
  };
  p5.prototype.dist = function (x1, y1, x2, y2) {
    return Math.sqrt((x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1));
  };
  p5.prototype.exp = Math.exp;
  p5.prototype.floor = Math.floor;
  p5.prototype.lerp = function (start, stop, amt) {
    return amt * (stop - start) + start;
  };
  p5.prototype.log = Math.log;
  p5.prototype.mag = function (x, y) {
    return Math.sqrt(x * x + y * y);
  };
  p5.prototype.map = function (n, start1, stop1, start2, stop2) {
    return (n - start1) / (stop1 - start1) * (stop2 - start2) + start2;
  };
  p5.prototype.max = function () {
    if (arguments[0] instanceof Array) {
      return Math.max.apply(null, arguments[0]);
    } else {
      return Math.max.apply(null, arguments);
    }
  };
  p5.prototype.min = function () {
    if (arguments[0] instanceof Array) {
      return Math.min.apply(null, arguments[0]);
    } else {
      return Math.min.apply(null, arguments);
    }
  };
  p5.prototype.norm = function (n, start, stop) {
    return this.map(n, start, stop, 0, 1);
  };
  p5.prototype.pow = Math.pow;
  p5.prototype.round = Math.round;
  p5.prototype.sq = function (n) {
    return n * n;
  };
  p5.prototype.sqrt = Math.sqrt;
  return p5;
}({}, amdclean['core']);
amdclean['mathrandom'] = function (require, core) {
  'use strict';
  var p5 = core;
  var seeded = false;
  var lcg = function () {
      var m = 4294967296, a = 1664525, c = 1013904223, seed, z;
      return {
        setSeed: function (val) {
          z = seed = (val == null ? Math.random() * m : val) >>> 0;
        },
        getSeed: function () {
          return seed;
        },
        rand: function () {
          z = (a * z + c) % m;
          return z / m;
        }
      };
    }();
  p5.prototype.randomSeed = function (seed) {
    lcg.setSeed(seed);
    seeded = true;
  };
  p5.prototype.random = function (min, max) {
    var rand;
    if (seeded) {
      rand = lcg.rand();
    } else {
      rand = Math.random();
    }
    if (arguments.length === 0) {
      return rand;
    } else if (arguments.length === 1) {
      return rand * min;
    } else {
      if (min > max) {
        var tmp = min;
        min = max;
        max = tmp;
      }
      return rand * (max - min) + min;
    }
  };
  var y2;
  var previous = false;
  p5.prototype.randomGaussian = function (mean, sd) {
    var y1, x1, x2, w;
    if (previous) {
      y1 = y2;
      previous = false;
    } else {
      do {
        x1 = this.random(2) - 1;
        x2 = this.random(2) - 1;
        w = x1 * x1 + x2 * x2;
      } while (w >= 1);
      w = Math.sqrt(-2 * Math.log(w) / w);
      y1 = x1 * w;
      y2 = x2 * w;
      previous = true;
    }
    var m = mean || 0;
    var s = sd || 1;
    return y1 * s + m;
  };
  return p5;
}({}, amdclean['core']);
amdclean['mathnoise'] = function (require, core) {
  'use strict';
  var p5 = core;
  var PERLIN_YWRAPB = 4;
  var PERLIN_YWRAP = 1 << PERLIN_YWRAPB;
  var PERLIN_ZWRAPB = 8;
  var PERLIN_ZWRAP = 1 << PERLIN_ZWRAPB;
  var PERLIN_SIZE = 4095;
  var perlin_octaves = 4;
  var perlin_amp_falloff = 0.5;
  var SINCOS_PRECISION = 0.5;
  var SINCOS_LENGTH = Math.floor(360 / SINCOS_PRECISION);
  var sinLUT = new Array(SINCOS_LENGTH);
  var cosLUT = new Array(SINCOS_LENGTH);
  var DEG_TO_RAD = Math.PI / 180;
  for (var i = 0; i < SINCOS_LENGTH; i++) {
    sinLUT[i] = Math.sin(i * DEG_TO_RAD * SINCOS_PRECISION);
    cosLUT[i] = Math.cos(i * DEG_TO_RAD * SINCOS_PRECISION);
  }
  var perlin_PI = SINCOS_LENGTH;
  perlin_PI >>= 1;
  var perlin;
  p5.prototype.noise = function (x, y, z) {
    y = y || 0;
    z = z || 0;
    if (perlin == null) {
      perlin = new Array(PERLIN_SIZE + 1);
      for (var i = 0; i < PERLIN_SIZE + 1; i++) {
        perlin[i] = Math.random();
      }
    }
    if (x < 0) {
      x = -x;
    }
    if (y < 0) {
      y = -y;
    }
    if (z < 0) {
      z = -z;
    }
    var xi = Math.floor(x), yi = Math.floor(y), zi = Math.floor(z);
    var xf = x - xi;
    var yf = y - yi;
    var zf = z - zi;
    var rxf, ryf;
    var r = 0;
    var ampl = 0.5;
    var n1, n2, n3;
    var noise_fsc = function (i) {
      return 0.5 * (1 - cosLUT[Math.floor(i * perlin_PI) % SINCOS_LENGTH]);
    };
    for (var o = 0; o < perlin_octaves; o++) {
      var of = xi + (yi << PERLIN_YWRAPB) + (zi << PERLIN_ZWRAPB);
      rxf = noise_fsc(xf);
      ryf = noise_fsc(yf);
      n1 = perlin[of & PERLIN_SIZE];
      n1 += rxf * (perlin[of + 1 & PERLIN_SIZE] - n1);
      n2 = perlin[of + PERLIN_YWRAP & PERLIN_SIZE];
      n2 += rxf * (perlin[of + PERLIN_YWRAP + 1 & PERLIN_SIZE] - n2);
      n1 += ryf * (n2 - n1);
      of += PERLIN_ZWRAP;
      n2 = perlin[of & PERLIN_SIZE];
      n2 += rxf * (perlin[of + 1 & PERLIN_SIZE] - n2);
      n3 = perlin[of + PERLIN_YWRAP & PERLIN_SIZE];
      n3 += rxf * (perlin[of + PERLIN_YWRAP + 1 & PERLIN_SIZE] - n3);
      n2 += ryf * (n3 - n2);
      n1 += noise_fsc(zf) * (n2 - n1);
      r += n1 * ampl;
      ampl *= perlin_amp_falloff;
      xi <<= 1;
      xf *= 2;
      yi <<= 1;
      yf *= 2;
      zi <<= 1;
      zf *= 2;
      if (xf >= 1) {
        xi++;
        xf--;
      }
      if (yf >= 1) {
        yi++;
        yf--;
      }
      if (zf >= 1) {
        zi++;
        zf--;
      }
    }
    return r;
  };
  p5.prototype.noiseDetail = function (lod, falloff) {
    if (lod > 0) {
      perlin_octaves = lod;
    }
    if (falloff > 0) {
      perlin_amp_falloff = falloff;
    }
  };
  p5.prototype.noiseSeed = function (seed) {
    var lcg = function () {
        var m = 4294967296, a = 1664525, c = 1013904223, seed, z;
        return {
          setSeed: function (val) {
            z = seed = (val == null ? Math.random() * m : val) >>> 0;
          },
          getSeed: function () {
            return seed;
          },
          rand: function () {
            z = (a * z + c) % m;
            return z / m;
          }
        };
      }();
    lcg.setSeed(seed);
    perlin = new Array(PERLIN_SIZE + 1);
    for (var i = 0; i < PERLIN_SIZE + 1; i++) {
      perlin[i] = lcg.rand();
    }
  };
  return p5;
}({}, amdclean['core']);
amdclean['mathtrigonometry'] = function (require, core, polargeometry, constants) {
  'use strict';
  var p5 = core;
  var polarGeometry = polargeometry;
  var constants = constants;
  p5.prototype._angleMode = constants.RADIANS;
  p5.prototype.acos = function (ratio) {
    if (this._angleMode === constants.RADIANS) {
      return Math.acos(ratio);
    } else {
      return polarGeometry.radiansToDegrees(Math.acos(ratio));
    }
  };
  p5.prototype.asin = function (ratio) {
    if (this._angleMode === constants.RADIANS) {
      return Math.asin(ratio);
    } else {
      return polarGeometry.radiansToDegrees(Math.asin(ratio));
    }
  };
  p5.prototype.atan = function (ratio) {
    if (this._angleMode === constants.RADIANS) {
      return Math.atan(ratio);
    } else {
      return polarGeometry.radiansToDegrees(Math.atan(ratio));
    }
  };
  p5.prototype.atan2 = function (y, x) {
    if (this._angleMode === constants.RADIANS) {
      return Math.atan2(y, x);
    } else {
      return polarGeometry.radiansToDegrees(Math.atan2(y, x));
    }
  };
  p5.prototype.cos = function (angle) {
    if (this._angleMode === constants.RADIANS) {
      return Math.cos(angle);
    } else {
      return Math.cos(this.radians(angle));
    }
  };
  p5.prototype.sin = function (angle) {
    if (this._angleMode === constants.RADIANS) {
      return Math.sin(angle);
    } else {
      return Math.sin(this.radians(angle));
    }
  };
  p5.prototype.tan = function (angle) {
    if (this._angleMode === constants.RADIANS) {
      return Math.tan(angle);
    } else {
      return Math.tan(this.radians(angle));
    }
  };
  p5.prototype.degrees = function (angle) {
    return polarGeometry.radiansToDegrees(angle);
  };
  p5.prototype.radians = function (angle) {
    return polarGeometry.degreesToRadians(angle);
  };
  p5.prototype.angleMode = function (mode) {
    if (mode === constants.DEGREES || mode === constants.RADIANS) {
      this._angleMode = mode;
    }
  };
  return p5;
}({}, amdclean['core'], amdclean['polargeometry'], amdclean['constants']);
amdclean['outputfiles'] = function (require, core) {
  'use strict';
  var p5 = core;
  window.URL = window.URL || window.webkitURL;
  p5.prototype._pWriters = [];
  p5.prototype.beginRaw = function () {
    throw 'not yet implemented';
  };
  p5.prototype.beginRecord = function () {
    throw 'not yet implemented';
  };
  p5.prototype.createOutput = function () {
    throw 'not yet implemented';
  };
  p5.prototype.createWriter = function (name, extension) {
    var newPW;
    for (var i in p5.prototype._pWriters) {
      if (p5.prototype._pWriters[i].name === name) {
        newPW = new p5.PrintWriter(name + window.millis(), extension);
        p5.prototype._pWriters.push(newPW);
        return newPW;
      }
    }
    newPW = new p5.PrintWriter(name, extension);
    p5.prototype._pWriters.push(newPW);
    return newPW;
  };
  p5.prototype.endRaw = function () {
    throw 'not yet implemented';
  };
  p5.prototype.endRecord = function () {
    throw 'not yet implemented';
  };
  p5.PrintWriter = function (filename, extension) {
    var self = this;
    this.name = filename;
    this.content = '';
    this.print = function (data) {
      this.content += data;
    };
    this.println = function (data) {
      this.content += data + '\n';
    };
    this.flush = function () {
      this.content = '';
    };
    this.close = function () {
      var arr = [];
      arr.push(this.content);
      p5.prototype.writeFile(arr, filename, extension);
      for (var i in p5.prototype._pWriters) {
        if (p5.prototype._pWriters[i].name === this.name) {
          p5.prototype._pWriters.splice(i, 1);
        }
      }
      self.flush();
      self = {};
    };
  };
  p5.prototype.saveBytes = function () {
    throw 'not yet implemented';
  };
  p5.prototype.save = function (object, _filename, _options) {
    var args = arguments;
    var cnv = this._curElement.elt;
    if (args.length === 0) {
      p5.prototype.saveCanvas(cnv);
      return;
    } else if (args[0] instanceof p5.Graphics) {
      p5.prototype.saveCanvas(args[0].elt, args[1], args[2]);
      return;
    } else if (typeof args[0] === 'string') {
      p5.prototype.saveCanvas(cnv, args[0]);
    } else {
      var extension = _checkFileExtension(args[1], args[2])[1];
      switch (extension) {
      case 'json':
        p5.prototype.saveJSON(args[0], args[1], args[2]);
        break;
      case 'txt':
        p5.prototype.saveStrings(args[0], args[1], args[2]);
        break;
      default:
        if (args[0] instanceof Array) {
          p5.prototype.saveStrings(args[0], args[1], args[2]);
        } else if (args[0] instanceof p5.Table) {
          p5.prototype.saveTable(args[0], args[1], args[2], args[3]);
        } else if (args[0] instanceof p5.Image) {
          p5.prototype.saveCanvas(args[0].canvas, args[1]);
        } else if (args[0] instanceof p5.SoundFile) {
          p5.prototype.saveSound(args[0], args[1], args[2], args[3]);
        } else if (args[0] instanceof Object) {
          p5.prototype.saveJSON(args[0], args[1], args[2]);
        }
      }
    }
  };
  p5.prototype.saveJSON = function (json, filename, opt) {
    var stringify;
    if (opt) {
      stringify = JSON.stringify(json);
    } else {
      stringify = JSON.stringify(json, undefined, 2);
    }
    this.saveStrings(stringify.split('\n'), filename, 'json');
  };
  p5.prototype.saveJSONObject = p5.prototype.saveJSON;
  p5.prototype.saveJSONArray = p5.prototype.saveJSON;
  p5.prototype.saveStream = function () {
    throw 'not yet implemented';
  };
  p5.prototype.saveStrings = function (list, filename, extension) {
    var ext = extension || 'txt';
    var pWriter = this.createWriter(filename, ext);
    for (var i in list) {
      if (i < list.length - 1) {
        pWriter.println(list[i]);
      } else {
        pWriter.print(list[i]);
      }
    }
    pWriter.close();
    pWriter.flush();
  };
  p5.prototype.saveXML = function () {
    throw 'not yet implemented';
  };
  p5.prototype.selectOutput = function () {
    throw 'not yet implemented';
  };
  p5.prototype.saveTable = function (table, filename, options) {
    var pWriter = this.createWriter(filename, options);
    var header = table.columns;
    var sep = ',';
    if (options === 'tsv') {
      sep = '\t';
    }
    if (options !== 'html') {
      if (header[0] !== '0') {
        for (var h = 0; h < header.length; h++) {
          if (h < header.length - 1) {
            pWriter.print(header[h] + sep);
          } else {
            pWriter.println(header[h]);
          }
        }
      }
      for (var i = 0; i < table.rows.length; i++) {
        var j;
        for (j = 0; j < table.rows[i].arr.length; j++) {
          if (j < table.rows[i].arr.length - 1) {
            pWriter.print(table.rows[i].arr[j] + sep);
          } else if (i < table.rows.length - 1) {
            pWriter.println(table.rows[i].arr[j]);
          } else {
            pWriter.print(table.rows[i].arr[j]);
          }
        }
      }
    } else {
      pWriter.println('<html>');
      pWriter.println('<head>');
      var str = '  <meta http-equiv="content-type" content';
      str += '="text/html;charset=utf-8" />';
      pWriter.println(str);
      pWriter.println('</head>');
      pWriter.println('<body>');
      pWriter.println('  <table>');
      if (header[0] !== '0') {
        pWriter.println('    <tr>');
        for (var k = 0; k < header.length; k++) {
          var e = escapeHelper(header[k]);
          pWriter.println('      <td>' + e);
          pWriter.println('      </td>');
        }
        pWriter.println('    </tr>');
      }
      for (var row = 0; row < table.rows.length; row++) {
        pWriter.println('    <tr>');
        for (var col = 0; col < table.columns.length; col++) {
          var entry = table.rows[row].getString(col);
          var htmlEntry = escapeHelper(entry);
          pWriter.println('      <td>' + htmlEntry);
          pWriter.println('      </td>');
        }
        pWriter.println('    </tr>');
      }
      pWriter.println('  </table>');
      pWriter.println('</body>');
      pWriter.print('</html>');
    }
    pWriter.close();
    pWriter.flush();
  };
  var escapeHelper = function (content) {
    return content.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;');
  };
  p5.prototype.writeFile = function (dataToDownload, filename, extension) {
    var type = 'application/octet-stream';
    if (p5.prototype._isSafari()) {
      type = 'text/plain';
    }
    var blob = new Blob(dataToDownload, { 'type': type });
    var href = window.URL.createObjectURL(blob);
    p5.prototype.downloadFile(href, filename, extension);
  };
  p5.prototype.downloadFile = function (href, fName, extension) {
    var fx = _checkFileExtension(fName, extension);
    var filename = fx[0];
    var ext = fx[1];
    var a = document.createElement('a');
    a.href = href;
    a.download = filename;
    a.onclick = destroyClickedElement;
    a.style.display = 'none';
    document.body.appendChild(a);
    if (p5.prototype._isSafari()) {
      var aText = 'Hello, Safari user! To download this file...\n';
      aText += '1. Go to File --> Save As.\n';
      aText += '2. Choose "Page Source" as the Format.\n';
      aText += '3. Name it with this extension: ."' + ext + '"';
      alert(aText);
    }
    a.click();
    href = null;
  };
  function _checkFileExtension(filename, extension) {
    if (!extension) {
      extension = '';
    }
    if (!filename) {
      filename = 'untitled';
    }
    var ext = '';
    if (filename && filename.indexOf('.') > -1) {
      ext = filename.split('.').pop();
    }
    if (extension) {
      if (ext !== extension) {
        ext = extension;
        filename = filename + '.' + ext;
      }
    }
    return [
      filename,
      ext
    ];
  }
  p5.prototype._checkFileExtension = _checkFileExtension;
  p5.prototype._isSafari = function () {
    var x = Object.prototype.toString.call(window.HTMLElement);
    return x.indexOf('Constructor') > 0;
  };
  function destroyClickedElement(event) {
    document.body.removeChild(event.target);
  }
  return p5;
}({}, amdclean['core']);
amdclean['outputimage'] = function (require, core) {
  'use strict';
  var p5 = core;
  var frames = [];
  p5.prototype.saveCanvas = function (_cnv, filename, extension) {
    if (!extension) {
      extension = p5.prototype._checkFileExtension(filename, extension)[1];
      if (extension === '') {
        extension = 'png';
      }
    }
    var cnv;
    if (_cnv) {
      cnv = _cnv;
    } else if (this._curElement && this._curElement.elt) {
      cnv = this._curElement.elt;
    }
    if (p5.prototype._isSafari()) {
      var aText = 'Hello, Safari user!\n';
      aText += 'Now capturing a screenshot...\n';
      aText += 'To save this image,\n';
      aText += 'go to File --> Save As.\n';
      alert(aText);
      window.location.href = cnv.toDataURL();
    } else {
      var mimeType;
      if (typeof extension === 'undefined') {
        extension = 'png';
        mimeType = 'image/png';
      } else {
        switch (extension) {
        case 'png':
          mimeType = 'image/png';
          break;
        case 'jpeg':
          mimeType = 'image/jpeg';
          break;
        case 'jpg':
          mimeType = 'image/jpeg';
          break;
        default:
          mimeType = 'image/png';
          break;
        }
      }
      var downloadMime = 'image/octet-stream';
      var imageData = cnv.toDataURL(mimeType);
      imageData = imageData.replace(mimeType, downloadMime);
      p5.prototype.downloadFile(imageData, filename, extension);
    }
  };
  p5.prototype.saveFrames = function (fName, ext, _duration, _fps, callback) {
    var duration = _duration || 3;
    duration = p5.prototype.constrain(duration, 0, 15);
    duration = duration * 1000;
    var fps = _fps || 15;
    fps = p5.prototype.constrain(fps, 0, 22);
    var count = 0;
    var makeFrame = p5.prototype._makeFrame;
    var cnv = this._curElement.elt;
    var frameFactory = setInterval(function () {
        makeFrame(fName + count, ext, cnv);
        count++;
      }, 1000 / fps);
    setTimeout(function () {
      clearInterval(frameFactory);
      if (callback) {
        callback(frames);
      } else {
        for (var i = 0; i < frames.length; i++) {
          var f = frames[i];
          p5.prototype.downloadFile(f.imageData, f.filename, f.ext);
        }
      }
      frames = [];
    }, duration + 0.01);
  };
  p5.prototype._makeFrame = function (filename, extension, _cnv) {
    var cnv;
    if (this) {
      cnv = this._curElement.elt;
    } else {
      cnv = _cnv;
    }
    var mimeType;
    if (!extension) {
      extension = 'png';
      mimeType = 'image/png';
    } else {
      switch (extension.toLowerCase()) {
      case 'png':
        mimeType = 'image/png';
        break;
      case 'jpeg':
        mimeType = 'image/jpeg';
        break;
      case 'jpg':
        mimeType = 'image/jpeg';
        break;
      default:
        mimeType = 'image/png';
        break;
      }
    }
    var downloadMime = 'image/octet-stream';
    var imageData = cnv.toDataURL(mimeType);
    imageData = imageData.replace(mimeType, downloadMime);
    var thisFrame = {};
    thisFrame.imageData = imageData;
    thisFrame.filename = filename;
    thisFrame.ext = extension;
    frames.push(thisFrame);
  };
  return p5;
}({}, amdclean['core']);
amdclean['outputtext_area'] = function (require, core) {
  'use strict';
  var p5 = core;
  if (window.console && console.log) {
    p5.prototype.print = console.log.bind(console);
  } else {
    p5.prototype.print = function () {
    };
  }
  p5.prototype.println = p5.prototype.print;
  return p5;
}({}, amdclean['core']);
amdclean['renderingrendering'] = function (require, core, constants) {
  var p5 = core;
  var constants = constants;
  p5.prototype.createCanvas = function (w, h, isDefault) {
    var c;
    if (isDefault) {
      c = document.createElement('canvas');
      c.id = 'defaultCanvas';
    } else {
      c = this.canvas;
    }
    if (!this._setupDone) {
      c.className += ' p5_hidden';
      c.style.visibility = 'hidden';
    }
    if (this._userNode) {
      this._userNode.appendChild(c);
    } else {
      document.body.appendChild(c);
    }
    if (!this._defaultGraphics) {
      this._defaultGraphics = new p5.Graphics(c, this, true);
      this._elements.push(this._defaultGraphics);
    }
    this._defaultGraphics.resize(w, h);
    this._defaultGraphics._applyDefaults();
    return this._defaultGraphics;
  };
  p5.prototype.resizeCanvas = function (w, h, noRedraw) {
    if (this._defaultGraphics) {
      this._defaultGraphics.resize(w, h);
      this._defaultGraphics._applyDefaults();
      if (!noRedraw) {
        this.redraw();
      }
    }
  };
  p5.prototype.noCanvas = function () {
    if (this.canvas) {
      this.canvas.parentNode.removeChild(this.canvas);
    }
  };
  p5.prototype.createGraphics = function (w, h) {
    var c = document.createElement('canvas');
    var node = this._userNode || document.body;
    node.appendChild(c);
    var pg = new p5.Graphics(c, this, false);
    this._elements.push(pg);
    for (var p in p5.prototype) {
      if (!pg.hasOwnProperty(p)) {
        if (typeof p5.prototype[p] === 'function') {
          pg[p] = p5.prototype[p].bind(pg);
        } else {
          pg[p] = p5.prototype[p];
        }
      }
    }
    pg.resize(w, h);
    pg._applyDefaults();
    return pg;
  };
  p5.prototype.blendMode = function (mode) {
    if (mode === constants.BLEND || mode === constants.DARKEST || mode === constants.LIGHTEST || mode === constants.DIFFERENCE || mode === constants.MULTIPLY || mode === constants.EXCLUSION || mode === constants.SCREEN || mode === constants.REPLACE || mode === constants.OVERLAY || mode === constants.HARD_LIGHT || mode === constants.SOFT_LIGHT || mode === constants.DODGE || mode === constants.BURN || mode === constants.ADD || mode === constants.NORMAL) {
      this.drawingContext.globalCompositeOperation = mode;
    } else {
      throw new Error('Mode ' + mode + ' not recognized.');
    }
  };
  return p5;
}({}, amdclean['core'], amdclean['constants']);
amdclean['shape2d_primitives'] = function (require, core, canvas, constants) {
  'use strict';
  var p5 = core;
  var canvas = canvas;
  var constants = constants;
  p5.prototype.arc = function (x, y, width, height, start, stop, mode) {
    if (!this._doStroke && !this._doFill) {
      return;
    }
    if (this._angleMode === constants.DEGREES) {
      start = this.radians(start);
      stop = this.radians(stop);
    }
    var ctx = this.drawingContext;
    var vals = canvas.arcModeAdjust(x, y, width, height, this._ellipseMode);
    var radius = vals.h > vals.w ? vals.h / 2 : vals.w / 2, xScale = vals.h > vals.w ? vals.w / vals.h : 1, yScale = vals.h > vals.w ? 1 : vals.h / vals.w;
    ctx.save();
    ctx.scale(xScale, yScale);
    ctx.beginPath();
    ctx.arc(vals.x, vals.y, radius, start, stop);
    if (this._doStroke) {
      ctx.stroke();
    }
    if (mode === constants.CHORD || mode === constants.OPEN) {
      ctx.closePath();
    } else if (mode === constants.PIE || mode === undefined) {
      ctx.lineTo(vals.x, vals.y);
      ctx.closePath();
    }
    if (this._doFill) {
      ctx.fill();
    }
    if (this._doStroke && mode !== constants.OPEN && mode !== undefined) {
      ctx.stroke();
    }
    ctx.restore();
    return this;
  };
  p5.prototype.ellipse = function (x, y, w, h) {
    if (!this._doStroke && !this._doFill) {
      return;
    }
    w = Math.abs(w);
    h = Math.abs(h);
    var ctx = this.drawingContext;
    var vals = canvas.modeAdjust(x, y, w, h, this._ellipseMode);
    ctx.beginPath();
    if (w === h) {
      ctx.arc(vals.x + vals.w / 2, vals.y + vals.w / 2, vals.w / 2, 0, 2 * Math.PI, false);
    } else {
      var kappa = 0.5522848, ox = vals.w / 2 * kappa, oy = vals.h / 2 * kappa, xe = vals.x + vals.w, ye = vals.y + vals.h, xm = vals.x + vals.w / 2, ym = vals.y + vals.h / 2;
      ctx.moveTo(vals.x, ym);
      ctx.bezierCurveTo(vals.x, ym - oy, xm - ox, vals.y, xm, vals.y);
      ctx.bezierCurveTo(xm + ox, vals.y, xe, ym - oy, xe, ym);
      ctx.bezierCurveTo(xe, ym + oy, xm + ox, ye, xm, ye);
      ctx.bezierCurveTo(xm - ox, ye, vals.x, ym + oy, vals.x, ym);
      ctx.closePath();
    }
    if (this._doFill) {
      ctx.fill();
    }
    if (this._doStroke) {
      ctx.stroke();
    }
    return this;
  };
  p5.prototype.line = function (x1, y1, x2, y2) {
    if (!this._doStroke) {
      return;
    }
    var ctx = this.drawingContext;
    if (ctx.strokeStyle === 'rgba(0,0,0,0)') {
      return;
    }
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
    return this;
  };
  p5.prototype.point = function (x, y) {
    if (!this._doStroke) {
      return;
    }
    var ctx = this.drawingContext;
    var s = ctx.strokeStyle;
    var f = ctx.fillStyle;
    if (s === 'rgba(0,0,0,0)') {
      return;
    }
    x = Math.round(x);
    y = Math.round(y);
    ctx.fillStyle = s;
    if (ctx.lineWidth > 1) {
      ctx.beginPath();
      ctx.arc(x, y, ctx.lineWidth / 2, 0, constants.TWO_PI, false);
      ctx.fill();
    } else {
      ctx.fillRect(x, y, 1, 1);
    }
    ctx.fillStyle = f;
    return this;
  };
  p5.prototype.quad = function (x1, y1, x2, y2, x3, y3, x4, y4) {
    if (!this._doStroke && !this._doFill) {
      return;
    }
    var ctx = this.drawingContext;
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.lineTo(x3, y3);
    ctx.lineTo(x4, y4);
    ctx.closePath();
    if (this._doFill) {
      ctx.fill();
    }
    if (this._doStroke) {
      ctx.stroke();
    }
    return this;
  };
  p5.prototype.rect = function (a, b, c, d) {
    if (!this._doStroke && !this._doFill) {
      return;
    }
    var vals = canvas.modeAdjust(a, b, c, d, this._rectMode);
    var ctx = this.drawingContext;
    if (this._doStroke && ctx.lineWidth % 2 === 1) {
      ctx.translate(0.5, 0.5);
    }
    ctx.beginPath();
    ctx.rect(vals.x, vals.y, vals.w, vals.h);
    if (this._doFill) {
      ctx.fill();
    }
    if (this._doStroke) {
      ctx.stroke();
    }
    if (this._doStroke && ctx.lineWidth % 2 === 1) {
      ctx.translate(-0.5, -0.5);
    }
    return this;
  };
  p5.prototype.triangle = function (x1, y1, x2, y2, x3, y3) {
    if (!this._doStroke && !this._doFill) {
      return;
    }
    var ctx = this.drawingContext;
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.lineTo(x3, y3);
    ctx.closePath();
    if (this._doFill) {
      ctx.fill();
    }
    if (this._doStroke) {
      ctx.stroke();
    }
    return this;
  };
  return p5;
}({}, amdclean['core'], amdclean['canvas'], amdclean['constants']);
amdclean['shapeattributes'] = function (require, core, constants) {
  'use strict';
  var p5 = core;
  var constants = constants;
  p5.prototype._rectMode = constants.CORNER;
  p5.prototype._ellipseMode = constants.CENTER;
  p5.prototype.ellipseMode = function (m) {
    if (m === constants.CORNER || m === constants.CORNERS || m === constants.RADIUS || m === constants.CENTER) {
      this._ellipseMode = m;
    }
    return this;
  };
  p5.prototype.noSmooth = function () {
    this.drawingContext.mozImageSmoothingEnabled = false;
    this.drawingContext.webkitImageSmoothingEnabled = false;
    return this;
  };
  p5.prototype.rectMode = function (m) {
    if (m === constants.CORNER || m === constants.CORNERS || m === constants.RADIUS || m === constants.CENTER) {
      this._rectMode = m;
    }
    return this;
  };
  p5.prototype.smooth = function () {
    this.drawingContext.mozImageSmoothingEnabled = true;
    this.drawingContext.webkitImageSmoothingEnabled = true;
    return this;
  };
  p5.prototype.strokeCap = function (cap) {
    if (cap === constants.ROUND || cap === constants.SQUARE || cap === constants.PROJECT) {
      this.drawingContext.lineCap = cap;
    }
    return this;
  };
  p5.prototype.strokeJoin = function (join) {
    if (join === constants.ROUND || join === constants.BEVEL || join === constants.MITER) {
      this.drawingContext.lineJoin = join;
    }
    return this;
  };
  p5.prototype.strokeWeight = function (w) {
    if (typeof w === 'undefined' || w === 0) {
      this.drawingContext.lineWidth = 0.0001;
    } else {
      this.drawingContext.lineWidth = w;
    }
    return this;
  };
  return p5;
}({}, amdclean['core'], amdclean['constants']);
amdclean['shapecurves'] = function (require, core) {
  'use strict';
  var p5 = core;
  var bezierDetail = 20;
  var curveDetail = 20;
  p5.prototype._curveTightness = 0;
  p5.prototype.bezier = function (x1, y1, x2, y2, x3, y3, x4, y4) {
    if (!this._doStroke) {
      return;
    }
    this.beginShape();
    this.vertex(x1, y1);
    this.bezierVertex(x2, y2, x3, y3, x4, y4);
    this.endShape();
    this.stroke();
    return this;
  };
  p5.prototype.bezierDetail = function (d) {
    bezierDetail = d;
    return this;
  };
  p5.prototype.bezierPoint = function (a, b, c, d, t) {
    var adjustedT = 1 - t;
    return Math.pow(adjustedT, 3) * a + 3 * Math.pow(adjustedT, 2) * t * b + 3 * adjustedT * Math.pow(t, 2) * c + Math.pow(t, 3) * d;
  };
  p5.prototype.bezierTangent = function (a, b, c, d, t) {
    var adjustedT = 1 - t;
    return 3 * d * Math.pow(t, 2) - 3 * c * Math.pow(t, 2) + 6 * c * adjustedT * t - 6 * b * adjustedT * t + 3 * b * Math.pow(adjustedT, 2) - 3 * a * Math.pow(adjustedT, 2);
  };
  p5.prototype.curve = function (x1, y1, x2, y2, x3, y3, x4, y4) {
    if (!this._doStroke) {
      return;
    }
    this.beginShape();
    this.curveVertex(x1, y1);
    this.curveVertex(x2, y2);
    this.curveVertex(x3, y3);
    this.curveVertex(x4, y4);
    this.endShape();
    this.stroke();
    return this;
  };
  p5.prototype.curveDetail = function (d) {
    curveDetail = d;
    return this;
  };
  p5.prototype.curveTightness = function (t) {
    this._setProperty('_curveTightness', t);
  };
  p5.prototype.curvePoint = function (a, b, c, d, t) {
    var t3 = t * t * t, t2 = t * t, f1 = -0.5 * t3 + t2 - 0.5 * t, f2 = 1.5 * t3 - 2.5 * t2 + 1, f3 = -1.5 * t3 + 2 * t2 + 0.5 * t, f4 = 0.5 * t3 - 0.5 * t2;
    return a * f1 + b * f2 + c * f3 + d * f4;
  };
  p5.prototype.curveTangent = function (a, b, c, d, t) {
    var t2 = t * t, f1 = -3 * t2 / 2 + 2 * t - 0.5, f2 = 9 * t2 / 2 - 5 * t, f3 = -9 * t2 / 2 + 4 * t + 0.5, f4 = 3 * t2 / 2 - t;
    return a * f1 + b * f2 + c * f3 + d * f4;
  };
  p5.prototype.curveTightness = function () {
    throw 'not yet implemented';
  };
  return p5;
}({}, amdclean['core']);
amdclean['shapevertex'] = function (require, core, constants) {
  'use strict';
  var p5 = core;
  var constants = constants;
  var shapeKind = null;
  var vertices = [];
  var contourVertices = [];
  var isBezier = false;
  var isCurve = false;
  var isQuadratic = false;
  var isContour = false;
  p5.prototype._doFillStrokeClose = function () {
    if (this._doFill) {
      this.drawingContext.fill();
    }
    if (this._doStroke) {
      this.drawingContext.stroke();
    }
    this.drawingContext.closePath();
  };
  p5.prototype.beginContour = function () {
    contourVertices = [];
    isContour = true;
    return this;
  };
  p5.prototype.beginShape = function (kind) {
    if (kind === constants.POINTS || kind === constants.LINES || kind === constants.TRIANGLES || kind === constants.TRIANGLE_FAN || kind === constants.TRIANGLE_STRIP || kind === constants.QUADS || kind === constants.QUAD_STRIP) {
      shapeKind = kind;
    } else {
      shapeKind = null;
    }
    vertices = [];
    contourVertices = [];
    return this;
  };
  p5.prototype.bezierVertex = function (x2, y2, x3, y3, x4, y4) {
    if (vertices.length === 0) {
      throw 'vertex() must be used once before calling bezierVertex()';
    } else {
      isBezier = true;
      var vert = [];
      for (var i = 0; i < arguments.length; i++) {
        vert[i] = arguments[i];
      }
      vert.isVert = false;
      if (isContour) {
        contourVertices.push(vert);
      } else {
        vertices.push(vert);
      }
    }
    return this;
  };
  p5.prototype.curveVertex = function (x, y) {
    isCurve = true;
    this.vertex(x, y);
    return this;
  };
  p5.prototype.endContour = function () {
    var vert = contourVertices[0].slice();
    vert.isVert = contourVertices[0].isVert;
    vert.moveTo = false;
    contourVertices.push(vert);
    vertices.push(vertices[0]);
    for (var i = 0; i < contourVertices.length; i++) {
      vertices.push(contourVertices[i]);
    }
    return this;
  };
  p5.prototype.endShape = function (mode) {
    if (vertices.length === 0) {
      return this;
    }
    if (!this._doStroke && !this._doFill) {
      return this;
    }
    var closeShape = mode === constants.CLOSE;
    var v;
    if (closeShape && !isContour) {
      vertices.push(vertices[0]);
    }
    var i, j;
    var numVerts = vertices.length;
    if (isCurve && (shapeKind === constants.POLYGON || shapeKind === null)) {
      if (numVerts > 3) {
        var b = [], s = 1 - this._curveTightness;
        this.drawingContext.beginPath();
        this.drawingContext.moveTo(vertices[1][0], vertices[1][1]);
        for (i = 1; i + 2 < numVerts; i++) {
          v = vertices[i];
          b[0] = [
            v[0],
            v[1]
          ];
          b[1] = [
            v[0] + (s * vertices[i + 1][0] - s * vertices[i - 1][0]) / 6,
            v[1] + (s * vertices[i + 1][1] - s * vertices[i - 1][1]) / 6
          ];
          b[2] = [
            vertices[i + 1][0] + (s * vertices[i][0] - s * vertices[i + 2][0]) / 6,
            vertices[i + 1][1] + (s * vertices[i][1] - s * vertices[i + 2][1]) / 6
          ];
          b[3] = [
            vertices[i + 1][0],
            vertices[i + 1][1]
          ];
          this.drawingContext.bezierCurveTo(b[1][0], b[1][1], b[2][0], b[2][1], b[3][0], b[3][1]);
        }
        if (closeShape) {
          this.drawingContext.lineTo(vertices[i + 1][0], vertices[i + 1][1]);
        }
        this._doFillStrokeClose();
      }
    } else if (isBezier && (shapeKind === constants.POLYGON || shapeKind === null)) {
      this.drawingContext.beginPath();
      for (i = 0; i < numVerts; i++) {
        if (vertices[i].isVert) {
          if (vertices[i].moveTo) {
            this.drawingContext.moveTo(vertices[i][0], vertices[i][1]);
          } else {
            this.drawingContext.lineTo(vertices[i][0], vertices[i][1]);
          }
        } else {
          this.drawingContext.bezierCurveTo(vertices[i][0], vertices[i][1], vertices[i][2], vertices[i][3], vertices[i][4], vertices[i][5]);
        }
      }
      this._doFillStrokeClose();
    } else if (isQuadratic && (shapeKind === constants.POLYGON || shapeKind === null)) {
      this.drawingContext.beginPath();
      for (i = 0; i < numVerts; i++) {
        if (vertices[i].isVert) {
          if (vertices[i].moveTo) {
            this.drawingContext.moveTo([0], vertices[i][1]);
          } else {
            this.drawingContext.lineTo(vertices[i][0], vertices[i][1]);
          }
        } else {
          this.drawingContext.quadraticCurveTo(vertices[i][0], vertices[i][1], vertices[i][2], vertices[i][3]);
        }
      }
      this._doFillStrokeClose();
    } else {
      if (shapeKind === constants.POINTS) {
        for (i = 0; i < numVerts; i++) {
          v = vertices[i];
          if (this._doStroke) {
            this.stroke(v[6]);
          }
          this.point(v[0], v[1]);
        }
      } else if (shapeKind === constants.LINES) {
        for (i = 0; i + 1 < numVerts; i += 2) {
          v = vertices[i];
          if (this._doStroke) {
            this.stroke(vertices[i + 1][6]);
          }
          this.line(v[0], v[1], vertices[i + 1][0], vertices[i + 1][1]);
        }
      } else if (shapeKind === constants.TRIANGLES) {
        for (i = 0; i + 2 < numVerts; i += 3) {
          v = vertices[i];
          this.drawingContext.beginPath();
          this.drawingContext.moveTo(v[0], v[1]);
          this.drawingContext.lineTo(vertices[i + 1][0], vertices[i + 1][1]);
          this.drawingContext.lineTo(vertices[i + 2][0], vertices[i + 2][1]);
          this.drawingContext.lineTo(v[0], v[1]);
          if (this._doFill) {
            this.fill(vertices[i + 2][5]);
            this.drawingContext.fill();
          }
          if (this._doStroke) {
            this.stroke(vertices[i + 2][6]);
            this.drawingContext.stroke();
          }
          this.drawingContext.closePath();
        }
      } else if (shapeKind === constants.TRIANGLE_STRIP) {
        for (i = 0; i + 1 < numVerts; i++) {
          v = vertices[i];
          this.drawingContext.beginPath();
          this.drawingContext.moveTo(vertices[i + 1][0], vertices[i + 1][1]);
          this.drawingContext.lineTo(v[0], v[1]);
          if (this._doStroke) {
            this.stroke(vertices[i + 1][6]);
          }
          if (this._doFill) {
            this.fill(vertices[i + 1][5]);
          }
          if (i + 2 < numVerts) {
            this.drawingContext.lineTo(vertices[i + 2][0], vertices[i + 2][1]);
            if (this._doStroke) {
              this.stroke(vertices[i + 2][6]);
            }
            if (this._doFill) {
              this.fill(vertices[i + 2][5]);
            }
          }
          this._doFillStrokeClose();
        }
      } else if (shapeKind === constants.TRIANGLE_FAN) {
        if (numVerts > 2) {
          this.drawingContext.beginPath();
          this.drawingContext.moveTo(vertices[0][0], vertices[0][1]);
          this.drawingContext.lineTo(vertices[1][0], vertices[1][1]);
          this.drawingContext.lineTo(vertices[2][0], vertices[2][1]);
          if (this._doFill) {
            this.fill(vertices[2][5]);
          }
          if (this._doStroke) {
            this.stroke(vertices[2][6]);
          }
          this._doFillStrokeClose();
          for (i = 3; i < numVerts; i++) {
            v = vertices[i];
            this.drawingContext.beginPath();
            this.drawingContext.moveTo(vertices[0][0], vertices[0][1]);
            this.drawingContext.lineTo(vertices[i - 1][0], vertices[i - 1][1]);
            this.drawingContext.lineTo(v[0], v[1]);
            if (this._doFill) {
              this.fill(v[5]);
            }
            if (this._doStroke) {
              this.stroke(v[6]);
            }
            this._doFillStrokeClose();
          }
        }
      } else if (shapeKind === constants.QUADS) {
        for (i = 0; i + 3 < numVerts; i += 4) {
          v = vertices[i];
          this.drawingContext.beginPath();
          this.drawingContext.moveTo(v[0], v[1]);
          for (j = 1; j < 4; j++) {
            this.drawingContext.lineTo(vertices[i + j][0], vertices[i + j][1]);
          }
          this.drawingContext.lineTo(v[0], v[1]);
          if (this._doFill) {
            this.fill(vertices[i + 3][5]);
          }
          if (this._doStroke) {
            this.stroke(vertices[i + 3][6]);
          }
          this._doFillStrokeClose();
        }
      } else if (shapeKind === constants.QUAD_STRIP) {
        if (numVerts > 3) {
          for (i = 0; i + 1 < numVerts; i += 2) {
            v = vertices[i];
            this.drawingContext.beginPath();
            if (i + 3 < numVerts) {
              this.drawingContext.moveTo(vertices[i + 2][0], vertices[i + 2][1]);
              this.drawingContext.lineTo(v[0], v[1]);
              this.drawingContext.lineTo(vertices[i + 1][0], vertices[i + 1][1]);
              this.drawingContext.lineTo(vertices[i + 3][0], vertices[i + 3][1]);
              if (this._doFill) {
                this.fill(vertices[i + 3][5]);
              }
              if (this._doStroke) {
                this.stroke(vertices[i + 3][6]);
              }
            } else {
              this.drawingContext.moveTo(v[0], v[1]);
              this.drawingContext.lineTo(vertices[i + 1][0], vertices[i + 1][1]);
            }
            this._doFillStrokeClose();
          }
        }
      } else {
        this.drawingContext.beginPath();
        this.drawingContext.moveTo(vertices[0][0], vertices[0][1]);
        for (i = 1; i < numVerts; i++) {
          v = vertices[i];
          if (v.isVert) {
            if (v.moveTo) {
              this.drawingContext.moveTo(v[0], v[1]);
            } else {
              this.drawingContext.lineTo(v[0], v[1]);
            }
          }
        }
        this._doFillStrokeClose();
      }
    }
    isCurve = false;
    isBezier = false;
    isQuadratic = false;
    isContour = false;
    if (closeShape) {
      vertices.pop();
    }
    return this;
  };
  p5.prototype.quadraticVertex = function (cx, cy, x3, y3) {
    if (this._contourInited) {
      var pt = {};
      pt.x = cx;
      pt.y = cy;
      pt.x3 = x3;
      pt.y3 = y3;
      pt.type = constants.QUADRATIC;
      this._contourVertices.push(pt);
      return this;
    }
    if (vertices.length > 0) {
      isQuadratic = true;
      var vert = [];
      for (var i = 0; i < arguments.length; i++) {
        vert[i] = arguments[i];
      }
      vert.isVert = false;
      if (isContour) {
        contourVertices.push(vert);
      } else {
        vertices.push(vert);
      }
    } else {
      throw 'vertex() must be used once before calling quadraticVertex()';
    }
    return this;
  };
  p5.prototype.vertex = function (x, y, moveTo) {
    var vert = [];
    vert.isVert = true;
    vert[0] = x;
    vert[1] = y;
    vert[2] = 0;
    vert[3] = 0;
    vert[4] = 0;
    vert[5] = this.drawingContext.fillStyle;
    vert[6] = this.drawingContext.strokeStyle;
    if (moveTo) {
      vert.moveTo = moveTo;
    }
    if (isContour) {
      if (contourVertices.length === 0) {
        vert.moveTo = true;
      }
      contourVertices.push(vert);
    } else {
      vertices.push(vert);
    }
    return this;
  };
  return p5;
}({}, amdclean['core'], amdclean['constants']);
amdclean['structure'] = function (require, core) {
  'use strict';
  var p5 = core;
  p5.prototype.exit = function () {
    throw 'exit() not implemented, see remove()';
  };
  p5.prototype.noLoop = function () {
    this._loop = false;
    if (this._drawInterval) {
      clearInterval(this._drawInterval);
    }
  };
  p5.prototype.loop = function () {
    this._loop = true;
    this._draw();
  };
  p5.prototype.push = function () {
    this.drawingContext.save();
    this._styles.push({
      doStroke: this._doStroke,
      doFill: this._doFill,
      tint: this._tint,
      imageMode: this._imageMode,
      rectMode: this._rectMode,
      ellipseMode: this._ellipseMode,
      colorMode: this._colorMode,
      textFont: this.textFont,
      textLeading: this.textLeading,
      textSize: this.textSize,
      textStyle: this.textStyle
    });
  };
  p5.prototype.pop = function () {
    this.drawingContext.restore();
    var lastS = this._styles.pop();
    this._doStroke = lastS.doStroke;
    this._doFill = lastS.doFill;
    this._tint = lastS.tint;
    this._imageMode = lastS.imageMode;
    this._rectMode = lastS.rectMode;
    this._ellipseMode = lastS.ellipseMode;
    this._colorMode = lastS.colorMode;
    this.textFont = lastS.textFont;
    this.textLeading = lastS.textLeading;
    this.textSize = lastS.textSize;
    this.textStyle = lastS.textStyle;
  };
  p5.prototype.pushStyle = function () {
    throw new Error('pushStyle() not used, see push()');
  };
  p5.prototype.popStyle = function () {
    throw new Error('popStyle() not used, see pop()');
  };
  p5.prototype.redraw = function () {
    var userSetup = this.setup || window.setup;
    var userDraw = this.draw || window.draw;
    if (typeof userDraw === 'function') {
      this.push();
      if (typeof userSetup === 'undefined') {
        this.scale(this._pixelDensity, this._pixelDensity);
      }
      this._registeredMethods.pre.forEach(function (f) {
        f.call(this);
      });
      userDraw();
      this._registeredMethods.post.forEach(function (f) {
        f.call(this);
      });
      this.pop();
    }
  };
  p5.prototype.size = function () {
    throw 'size() not implemented, see createCanvas()';
  };
  return p5;
}({}, amdclean['core']);
amdclean['transform'] = function (require, core, constants, outputtext_area) {
  'use strict';
  var p5 = core;
  var constants = constants;
  p5.prototype.applyMatrix = function (n00, n01, n02, n10, n11, n12) {
    this.drawingContext.transform(n00, n01, n02, n10, n11, n12);
    return this;
  };
  p5.prototype.popMatrix = function () {
    throw new Error('popMatrix() not used, see pop()');
  };
  p5.prototype.printMatrix = function () {
    throw new Error('printMatrix() not implemented');
  };
  p5.prototype.pushMatrix = function () {
    throw new Error('pushMatrix() not used, see push()');
  };
  p5.prototype.resetMatrix = function () {
    this.drawingContext.setTransform(1, 0, 0, 1, 0, 0);
    return this;
  };
  p5.prototype.rotate = function (r) {
    if (this._angleMode === constants.DEGREES) {
      r = this.radians(r);
    }
    this.drawingContext.rotate(r);
    return this;
  };
  p5.prototype.rotateX = function () {
    throw 'not yet implemented';
  };
  p5.prototype.rotateY = function () {
    throw 'not yet implemented';
  };
  p5.prototype.scale = function () {
    var x = 1, y = 1;
    if (arguments.length === 1) {
      x = y = arguments[0];
    } else {
      x = arguments[0];
      y = arguments[1];
    }
    this.drawingContext.scale(x, y);
    return this;
  };
  p5.prototype.shearX = function (angle) {
    if (this._angleMode === constants.DEGREES) {
      angle = this.radians(angle);
    }
    this.drawingContext.transform(1, 0, this.tan(angle), 1, 0, 0);
    return this;
  };
  p5.prototype.shearY = function (angle) {
    if (this._angleMode === constants.DEGREES) {
      angle = this.radians(angle);
    }
    this.drawingContext.transform(1, this.tan(angle), 0, 1, 0, 0);
    return this;
  };
  p5.prototype.translate = function (x, y) {
    this.drawingContext.translate(x, y);
    return this;
  };
  return p5;
}({}, amdclean['core'], amdclean['constants'], amdclean['outputtext_area']);
amdclean['typographyattributes'] = function (require, core, constants) {
  'use strict';
  var p5 = core;
  var constants = constants;
  p5.prototype._textLeading = 15;
  p5.prototype._textFont = 'sans-serif';
  p5.prototype._textSize = 12;
  p5.prototype._textStyle = constants.NORMAL;
  p5.prototype._textAscent = null;
  p5.prototype._textDescent = null;
  p5.prototype.textAlign = function (h, v) {
    if (h === constants.LEFT || h === constants.RIGHT || h === constants.CENTER) {
      this.drawingContext.textAlign = h;
    }
    if (v === constants.TOP || v === constants.BOTTOM || v === constants.CENTER || v === constants.BASELINE) {
      this.drawingContext.textBaseline = v;
    }
  };
  p5.prototype.textLeading = function (l) {
    this._setProperty('_textLeading', l);
  };
  p5.prototype.textSize = function (s) {
    this._setProperty('_textSize', s);
    this._setProperty('_textLeading', s*1.5);
    this._applyTextProperties();
  };
  p5.prototype.textStyle = function (s) {
    if (s === constants.NORMAL || s === constants.ITALIC || s === constants.BOLD) {
      this._setProperty('_textStyle', s);
      this._applyTextProperties();
    }
  };
  p5.prototype.textWidth = function (s) {
    return this.drawingContext.measureText(s).width;
  };
  p5.prototype.textAscent = function () {
    if (this._textAscent == null) {
      this._updateTextMetrics();
    }
    return this._textAscent;
  };
  p5.prototype.textDescent = function () {
    if (this._textDescent == null) {
      this._updateTextMetrics();
    }
    return this._textDescent;
  };
  p5.prototype._applyTextProperties = function () {
    this._setProperty('_textAscent', null);
    this._setProperty('_textDescent', null);
    var str = this._textStyle + ' ' + this._textSize + 'px ' + this._textFont;
    this.drawingContext.font = str;
  };
  p5.prototype._updateTextMetrics = function () {
    var text = document.createElement('span');
    text.style.fontFamily = this._textFont;
    text.style.fontSize = this._textSize + 'px';
    text.innerHTML = 'ABCjgq|';
    var block = document.createElement('div');
    block.style.display = 'inline-block';
    block.style.width = '1px';
    block.style.height = '0px';
    var container = document.createElement('div');
    container.appendChild(text);
    container.appendChild(block);
    container.style.height = '0px';
    container.style.overflow = 'hidden';
    document.body.appendChild(container);
    block.style.verticalAlign = 'baseline';
    var blockOffset = this._calculateOffset(block);
    var textOffset = this._calculateOffset(text);
    var ascent = blockOffset[1] - textOffset[1];
    block.style.verticalAlign = 'bottom';
    blockOffset = this._calculateOffset(block);
    textOffset = this._calculateOffset(text);
    var height = blockOffset[1] - textOffset[1];
    var descent = height - ascent;
    document.body.removeChild(container);
    this._setProperty('_textAscent', ascent);
    this._setProperty('_textDescent', descent);
  };
  p5.prototype._calculateOffset = function (object) {
    var currentLeft = 0, currentTop = 0;
    if (object.offsetParent) {
      do {
        currentLeft += object.offsetLeft;
        currentTop += object.offsetTop;
      } while (object = object.offsetParent);
    } else {
      currentLeft += object.offsetLeft;
      currentTop += object.offsetTop;
    }
    return [
      currentLeft,
      currentTop
    ];
  };
  return p5;
}({}, amdclean['core'], amdclean['constants']);
amdclean['typographyloading_displaying'] = function (require, core) {
  'use strict';
  var p5 = core;
  p5.prototype.text = function (str, x, y, maxWidth, maxHeight) {
    if (typeof str !== 'string') {
      return;
    }
    if (typeof maxWidth !== 'undefined') {
      y += this._textLeading;
      maxHeight += y;
    }
    str = str.replace(/(\t)/g, '  ');
    var cars = str.split('\n');
    for (var ii = 0; ii < cars.length; ii++) {
      var line = '';
      var words = cars[ii].split(' ');
      for (var n = 0; n < words.length; n++) {
        if (y + this._textLeading <= maxHeight || typeof maxHeight === 'undefined') {
          var testLine = line + words[n] + ' ';
          var metrics = this.drawingContext.measureText(testLine);
          var testWidth = metrics.width;
          if (typeof maxWidth !== 'undefined' && testWidth > maxWidth) {
            if (this._doFill) {
              this.drawingContext.fillText(line, x, y);
            }
            if (this._doStroke) {
              this.drawingContext.strokeText(line, x, y);
            }
            line = words[n] + ' ';
            y += this._textLeading;
          } else {
            line = testLine;
          }
        }
      }
      if (this._doFill) {
        this.drawingContext.fillText(line, x, y);
      }
      if (this._doStroke) {
        this.drawingContext.strokeText(line, x, y);
      }
      y += this._textLeading;
    }
  };
  p5.prototype.textFont = function (str) {
    this._setProperty('_textFont', str);
    this._applyTextProperties();
  };
  return p5;
}({}, amdclean['core']);
amdclean['src_app'] = function (require, core, p5Color, p5Element, p5Graphics, p5Image, p5Vector, p5TableRow, p5Table, colorcreating_reading, colorsetting, constants, dataconversion, dataarray_functions, datastring_functions, environment, imageimage, imageloading_displaying, imagepixels, inputfiles, inputkeyboard, inputmouse, inputtime_date, inputtouch, mathmath, mathcalculation, mathrandom, mathnoise, mathtrigonometry, outputfiles, outputimage, outputtext_area, renderingrendering, shape2d_primitives, shapeattributes, shapecurves, shapevertex, structure, transform, typographyattributes, typographyloading_displaying) {
  'use strict';
  var p5 = core;
  var _globalInit = function () {
    if (!window.PHANTOMJS) {
      if (window.setup && typeof window.setup === 'function' || window.draw && typeof window.draw === 'function') {
        new p5();
      }
    }
  };
  if (document.readyState === 'complete') {
    _globalInit();
  } else {
    window.addEventListener('load', _globalInit, false);
  }
  return p5;
}({}, amdclean['core'], amdclean['p5Color'], amdclean['p5Element'], amdclean['p5Graphics'], amdclean['p5Image'], amdclean['p5Vector'], amdclean['p5TableRow'], amdclean['p5Table'], amdclean['colorcreating_reading'], amdclean['colorsetting'], amdclean['constants'], amdclean['dataconversion'], amdclean['dataarray_functions'], amdclean['datastring_functions'], amdclean['environment'], amdclean['imageimage'], amdclean['imageloading_displaying'], amdclean['imagepixels'], amdclean['inputfiles'], amdclean['inputkeyboard'], amdclean['inputmouse'], amdclean['inputtime_date'], amdclean['inputtouch'], amdclean['mathmath'], amdclean['mathcalculation'], amdclean['mathrandom'], amdclean['mathnoise'], amdclean['mathtrigonometry'], amdclean['outputfiles'], amdclean['outputimage'], amdclean['outputtext_area'], amdclean['renderingrendering'], amdclean['shape2d_primitives'], amdclean['shapeattributes'], amdclean['shapecurves'], amdclean['shapevertex'], amdclean['structure'], amdclean['transform'], amdclean['typographyattributes'], amdclean['typographyloading_displaying']);
return amdclean['src_app'];
}));
// 2.1.11
var JSHINT;
if (typeof window === 'undefined') window = {};
(function () {
var require;
require=(function(e,t,n){function i(n,s){if(!t[n]){if(!e[n]){var o=typeof require=="function"&&require;if(!s&&o)return o(n,!0);if(r)return r(n,!0);throw new Error("Cannot find module '"+n+"'")}var u=t[n]={exports:{}};e[n][0].call(u.exports,function(t){var r=e[n][1][t];return i(r?r:t)},u,u.exports)}return t[n].exports}var r=typeof require=="function"&&require;for(var s=0;s<n.length;s++)i(n[s]);return i})({1:[function(require,module,exports){
// shim for using process in browser

var process = module.exports = {};

process.nextTick = (function () {
    var canSetImmediate = typeof window !== 'undefined'
    && window.setImmediate;
    var canPost = typeof window !== 'undefined'
    && window.postMessage && window.addEventListener
    ;

    if (canSetImmediate) {
        return function (f) { return window.setImmediate(f) };
    }

    if (canPost) {
        var queue = [];
        window.addEventListener('message', function (ev) {
            if (ev.source === window && ev.data === 'process-tick') {
                ev.stopPropagation();
                if (queue.length > 0) {
                    var fn = queue.shift();
                    fn();
                }
            }
        }, true);

        return function nextTick(fn) {
            queue.push(fn);
            window.postMessage('process-tick', '*');
        };
    }

    return function nextTick(fn) {
        setTimeout(fn, 0);
    };
})();

process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];

process.binding = function (name) {
    throw new Error('process.binding is not supported');
}

// TODO(shtylman)
process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};

},{}],2:[function(require,module,exports){
(function(process){if (!process.EventEmitter) process.EventEmitter = function () {};

var EventEmitter = exports.EventEmitter = process.EventEmitter;
var isArray = typeof Array.isArray === 'function'
    ? Array.isArray
    : function (xs) {
        return Object.prototype.toString.call(xs) === '[object Array]'
    }
;
function indexOf (xs, x) {
    if (xs.indexOf) return xs.indexOf(x);
    for (var i = 0; i < xs.length; i++) {
        if (x === xs[i]) return i;
    }
    return -1;
}

// By default EventEmitters will print a warning if more than
// 10 listeners are added to it. This is a useful default which
// helps finding memory leaks.
//
// Obviously not all Emitters should be limited to 10. This function allows
// that to be increased. Set to zero for unlimited.
var defaultMaxListeners = 10;
EventEmitter.prototype.setMaxListeners = function(n) {
  if (!this._events) this._events = {};
  this._events.maxListeners = n;
};


EventEmitter.prototype.emit = function(type) {
  // If there is no 'error' event listener then throw.
  if (type === 'error') {
    if (!this._events || !this._events.error ||
        (isArray(this._events.error) && !this._events.error.length))
    {
      if (arguments[1] instanceof Error) {
        throw arguments[1]; // Unhandled 'error' event
      } else {
        throw new Error("Uncaught, unspecified 'error' event.");
      }
      return false;
    }
  }

  if (!this._events) return false;
  var handler = this._events[type];
  if (!handler) return false;

  if (typeof handler == 'function') {
    switch (arguments.length) {
      // fast cases
      case 1:
        handler.call(this);
        break;
      case 2:
        handler.call(this, arguments[1]);
        break;
      case 3:
        handler.call(this, arguments[1], arguments[2]);
        break;
      // slower
      default:
        var args = Array.prototype.slice.call(arguments, 1);
        handler.apply(this, args);
    }
    return true;

  } else if (isArray(handler)) {
    var args = Array.prototype.slice.call(arguments, 1);

    var listeners = handler.slice();
    for (var i = 0, l = listeners.length; i < l; i++) {
      listeners[i].apply(this, args);
    }
    return true;

  } else {
    return false;
  }
};

// EventEmitter is defined in src/node_events.cc
// EventEmitter.prototype.emit() is also defined there.
EventEmitter.prototype.addListener = function(type, listener) {
  if ('function' !== typeof listener) {
    throw new Error('addListener only takes instances of Function');
  }

  if (!this._events) this._events = {};

  // To avoid recursion in the case that type == "newListeners"! Before
  // adding it to the listeners, first emit "newListeners".
  this.emit('newListener', type, listener);

  if (!this._events[type]) {
    // Optimize the case of one listener. Don't need the extra array object.
    this._events[type] = listener;
  } else if (isArray(this._events[type])) {

    // Check for listener leak
    if (!this._events[type].warned) {
      var m;
      if (this._events.maxListeners !== undefined) {
        m = this._events.maxListeners;
      } else {
        m = defaultMaxListeners;
      }

      if (m && m > 0 && this._events[type].length > m) {
        this._events[type].warned = true;
        console.error('(node) warning: possible EventEmitter memory ' +
                      'leak detected. %d listeners added. ' +
                      'Use emitter.setMaxListeners() to increase limit.',
                      this._events[type].length);
        console.trace();
      }
    }

    // If we've already got an array, just append.
    this._events[type].push(listener);
  } else {
    // Adding the second element, need to change to array.
    this._events[type] = [this._events[type], listener];
  }

  return this;
};

EventEmitter.prototype.on = EventEmitter.prototype.addListener;

EventEmitter.prototype.once = function(type, listener) {
  var self = this;
  self.on(type, function g() {
    self.removeListener(type, g);
    listener.apply(this, arguments);
  });

  return this;
};

EventEmitter.prototype.removeListener = function(type, listener) {
  if ('function' !== typeof listener) {
    throw new Error('removeListener only takes instances of Function');
  }

  // does not use listeners(), so no side effect of creating _events[type]
  if (!this._events || !this._events[type]) return this;

  var list = this._events[type];

  if (isArray(list)) {
    var i = indexOf(list, listener);
    if (i < 0) return this;
    list.splice(i, 1);
    if (list.length == 0)
      delete this._events[type];
  } else if (this._events[type] === listener) {
    delete this._events[type];
  }

  return this;
};

EventEmitter.prototype.removeAllListeners = function(type) {
  if (arguments.length === 0) {
    this._events = {};
    return this;
  }

  // does not use listeners(), so no side effect of creating _events[type]
  if (type && this._events && this._events[type]) this._events[type] = null;
  return this;
};

EventEmitter.prototype.listeners = function(type) {
  if (!this._events) this._events = {};
  if (!this._events[type]) this._events[type] = [];
  if (!isArray(this._events[type])) {
    this._events[type] = [this._events[type]];
  }
  return this._events[type];
};

})(require("__browserify_process"))
},{"__browserify_process":1}],3:[function(require,module,exports){
(function(){// jshint -W001

"use strict";

// Identifiers provided by the ECMAScript standard.

exports.reservedVars = {
  arguments : false,
  NaN       : false
};

exports.ecmaIdentifiers = {
  Array              : false,
  Boolean            : false,
  Date               : false,
  decodeURI          : false,
  decodeURIComponent : false,
  encodeURI          : false,
  encodeURIComponent : false,
  Error              : false,
  "eval"             : false,
  EvalError          : false,
  Function           : false,
  hasOwnProperty     : false,
  isFinite           : false,
  isNaN              : false,
  JSON               : false,
  Math               : false,
  Map                : false,
  Number             : false,
  Object             : false,
  parseInt           : false,
  parseFloat         : false,
  RangeError         : false,
  ReferenceError     : false,
  RegExp             : false,
  Set                : false,
  String             : false,
  SyntaxError        : false,
  TypeError          : false,
  URIError           : false,
  WeakMap            : false
};

// Global variables commonly provided by a web browser environment.

exports.browser = {
  Audio                : false,
  Blob                 : false,
  addEventListener     : false,
  applicationCache     : false,
  atob                 : false,
  blur                 : false,
  btoa                 : false,
  clearInterval        : false,
  clearTimeout         : false,
  close                : false,
  closed               : false,
  CustomEvent          : false,
  DOMParser            : false,
  defaultStatus        : false,
  document             : false,
  Element              : false,
  ElementTimeControl   : false,
  event                : false,
  FileReader           : false,
  FormData             : false,
  focus                : false,
  frames               : false,
  getComputedStyle     : false,
  HTMLElement          : false,
  HTMLAnchorElement    : false,
  HTMLBaseElement      : false,
  HTMLBlockquoteElement: false,
  HTMLBodyElement      : false,
  HTMLBRElement        : false,
  HTMLButtonElement    : false,
  HTMLCanvasElement    : false,
  HTMLDirectoryElement : false,
  HTMLDivElement       : false,
  HTMLDListElement     : false,
  HTMLFieldSetElement  : false,
  HTMLFontElement      : false,
  HTMLFormElement      : false,
  HTMLFrameElement     : false,
  HTMLFrameSetElement  : false,
  HTMLHeadElement      : false,
  HTMLHeadingElement   : false,
  HTMLHRElement        : false,
  HTMLHtmlElement      : false,
  HTMLIFrameElement    : false,
  HTMLImageElement     : false,
  HTMLInputElement     : false,
  HTMLIsIndexElement   : false,
  HTMLLabelElement     : false,
  HTMLLayerElement     : false,
  HTMLLegendElement    : false,
  HTMLLIElement        : false,
  HTMLLinkElement      : false,
  HTMLMapElement       : false,
  HTMLMenuElement      : false,
  HTMLMetaElement      : false,
  HTMLModElement       : false,
  HTMLObjectElement    : false,
  HTMLOListElement     : false,
  HTMLOptGroupElement  : false,
  HTMLOptionElement    : false,
  HTMLParagraphElement : false,
  HTMLParamElement     : false,
  HTMLPreElement       : false,
  HTMLQuoteElement     : false,
  HTMLScriptElement    : false,
  HTMLSelectElement    : false,
  HTMLStyleElement     : false,
  HTMLTableCaptionElement: false,
  HTMLTableCellElement : false,
  HTMLTableColElement  : false,
  HTMLTableElement     : false,
  HTMLTableRowElement  : false,
  HTMLTableSectionElement: false,
  HTMLTextAreaElement  : false,
  HTMLTitleElement     : false,
  HTMLUListElement     : false,
  HTMLVideoElement     : false,
  history              : false,
  Image                : false,
  length               : false,
  localStorage         : false,
  location             : false,
  MessageChannel       : false,
  MessageEvent         : false,
  MessagePort          : false,
  MouseEvent           : false,
  moveBy               : false,
  moveTo               : false,
  MutationObserver     : false,
  name                 : false,
  Node                 : false,
  NodeFilter           : false,
  navigator            : false,
  onbeforeunload       : true,
  onblur               : true,
  onerror              : true,
  onfocus              : true,
  onload               : true,
  onresize             : true,
  onunload             : true,
  open                 : false,
  openDatabase         : false,
  opener               : false,
  Option               : false,
  parent               : false,
  print                : false,
  removeEventListener  : false,
  resizeBy             : false,
  resizeTo             : false,
  screen               : false,
  scroll               : false,
  scrollBy             : false,
  scrollTo             : false,
  sessionStorage       : false,
  setInterval          : false,
  setTimeout           : false,
  SharedWorker         : false,
  status               : false,
  SVGAElement          : false,
  SVGAltGlyphDefElement: false,
  SVGAltGlyphElement   : false,
  SVGAltGlyphItemElement: false,
  SVGAngle             : false,
  SVGAnimateColorElement: false,
  SVGAnimateElement    : false,
  SVGAnimateMotionElement: false,
  SVGAnimateTransformElement: false,
  SVGAnimatedAngle     : false,
  SVGAnimatedBoolean   : false,
  SVGAnimatedEnumeration: false,
  SVGAnimatedInteger   : false,
  SVGAnimatedLength    : false,
  SVGAnimatedLengthList: false,
  SVGAnimatedNumber    : false,
  SVGAnimatedNumberList: false,
  SVGAnimatedPathData  : false,
  SVGAnimatedPoints    : false,
  SVGAnimatedPreserveAspectRatio: false,
  SVGAnimatedRect      : false,
  SVGAnimatedString    : false,
  SVGAnimatedTransformList: false,
  SVGAnimationElement  : false,
  SVGCSSRule           : false,
  SVGCircleElement     : false,
  SVGClipPathElement   : false,
  SVGColor             : false,
  SVGColorProfileElement: false,
  SVGColorProfileRule  : false,
  SVGComponentTransferFunctionElement: false,
  SVGCursorElement     : false,
  SVGDefsElement       : false,
  SVGDescElement       : false,
  SVGDocument          : false,
  SVGElement           : false,
  SVGElementInstance   : false,
  SVGElementInstanceList: false,
  SVGEllipseElement    : false,
  SVGExternalResourcesRequired: false,
  SVGFEBlendElement    : false,
  SVGFEColorMatrixElement: false,
  SVGFEComponentTransferElement: false,
  SVGFECompositeElement: false,
  SVGFEConvolveMatrixElement: false,
  SVGFEDiffuseLightingElement: false,
  SVGFEDisplacementMapElement: false,
  SVGFEDistantLightElement: false,
  SVGFEFloodElement    : false,
  SVGFEFuncAElement    : false,
  SVGFEFuncBElement    : false,
  SVGFEFuncGElement    : false,
  SVGFEFuncRElement    : false,
  SVGFEGaussianBlurElement: false,
  SVGFEImageElement    : false,
  SVGFEMergeElement    : false,
  SVGFEMergeNodeElement: false,
  SVGFEMorphologyElement: false,
  SVGFEOffsetElement   : false,
  SVGFEPointLightElement: false,
  SVGFESpecularLightingElement: false,
  SVGFESpotLightElement: false,
  SVGFETileElement     : false,
  SVGFETurbulenceElement: false,
  SVGFilterElement     : false,
  SVGFilterPrimitiveStandardAttributes: false,
  SVGFitToViewBox      : false,
  SVGFontElement       : false,
  SVGFontFaceElement   : false,
  SVGFontFaceFormatElement: false,
  SVGFontFaceNameElement: false,
  SVGFontFaceSrcElement: false,
  SVGFontFaceUriElement: false,
  SVGForeignObjectElement: false,
  SVGGElement          : false,
  SVGGlyphElement      : false,
  SVGGlyphRefElement   : false,
  SVGGradientElement   : false,
  SVGHKernElement      : false,
  SVGICCColor          : false,
  SVGImageElement      : false,
  SVGLangSpace         : false,
  SVGLength            : false,
  SVGLengthList        : false,
  SVGLineElement       : false,
  SVGLinearGradientElement: false,
  SVGLocatable         : false,
  SVGMPathElement      : false,
  SVGMarkerElement     : false,
  SVGMaskElement       : false,
  SVGMatrix            : false,
  SVGMetadataElement   : false,
  SVGMissingGlyphElement: false,
  SVGNumber            : false,
  SVGNumberList        : false,
  SVGPaint             : false,
  SVGPathElement       : false,
  SVGPathSeg           : false,
  SVGPathSegArcAbs     : false,
  SVGPathSegArcRel     : false,
  SVGPathSegClosePath  : false,
  SVGPathSegCurvetoCubicAbs: false,
  SVGPathSegCurvetoCubicRel: false,
  SVGPathSegCurvetoCubicSmoothAbs: false,
  SVGPathSegCurvetoCubicSmoothRel: false,
  SVGPathSegCurvetoQuadraticAbs: false,
  SVGPathSegCurvetoQuadraticRel: false,
  SVGPathSegCurvetoQuadraticSmoothAbs: false,
  SVGPathSegCurvetoQuadraticSmoothRel: false,
  SVGPathSegLinetoAbs  : false,
  SVGPathSegLinetoHorizontalAbs: false,
  SVGPathSegLinetoHorizontalRel: false,
  SVGPathSegLinetoRel  : false,
  SVGPathSegLinetoVerticalAbs: false,
  SVGPathSegLinetoVerticalRel: false,
  SVGPathSegList       : false,
  SVGPathSegMovetoAbs  : false,
  SVGPathSegMovetoRel  : false,
  SVGPatternElement    : false,
  SVGPoint             : false,
  SVGPointList         : false,
  SVGPolygonElement    : false,
  SVGPolylineElement   : false,
  SVGPreserveAspectRatio: false,
  SVGRadialGradientElement: false,
  SVGRect              : false,
  SVGRectElement       : false,
  SVGRenderingIntent   : false,
  SVGSVGElement        : false,
  SVGScriptElement     : false,
  SVGSetElement        : false,
  SVGStopElement       : false,
  SVGStringList        : false,
  SVGStylable          : false,
  SVGStyleElement      : false,
  SVGSwitchElement     : false,
  SVGSymbolElement     : false,
  SVGTRefElement       : false,
  SVGTSpanElement      : false,
  SVGTests             : false,
  SVGTextContentElement: false,
  SVGTextElement       : false,
  SVGTextPathElement   : false,
  SVGTextPositioningElement: false,
  SVGTitleElement      : false,
  SVGTransform         : false,
  SVGTransformList     : false,
  SVGTransformable     : false,
  SVGURIReference      : false,
  SVGUnitTypes         : false,
  SVGUseElement        : false,
  SVGVKernElement      : false,
  SVGViewElement       : false,
  SVGViewSpec          : false,
  SVGZoomAndPan        : false,
  TimeEvent            : false,
  top                  : false,
  WebSocket            : false,
  window               : false,
  Worker               : false,
  XMLHttpRequest       : false,
  XMLSerializer        : false,
  XPathEvaluator       : false,
  XPathException       : false,
  XPathExpression      : false,
  XPathNamespace       : false,
  XPathNSResolver      : false,
  XPathResult          : false
};

exports.devel = {
  alert  : false,
  confirm: false,
  console: false,
  Debug  : false,
  opera  : false,
  prompt : false
};

exports.worker = {
  importScripts: true,
  postMessage  : true,
  self         : true
};

// Widely adopted global names that are not part of ECMAScript standard
exports.nonstandard = {
  escape  : false,
  unescape: false
};

// Globals provided by popular JavaScript environments.

exports.couch = {
  "require" : false,
  respond   : false,
  getRow    : false,
  emit      : false,
  send      : false,
  start     : false,
  sum       : false,
  log       : false,
  exports   : false,
  module    : false,
  provides  : false
};

exports.node = {
  __filename    : false,
  __dirname     : false,
  Buffer        : false,
  console       : false,
  exports       : true,  // In Node it is ok to exports = module.exports = foo();
  GLOBAL        : false,
  global        : false,
  module        : false,
  process       : false,
  require       : false,
  setTimeout    : false,
  clearTimeout  : false,
  setInterval   : false,
  clearInterval : false,
  setImmediate  : false, // v0.9.1+
  clearImmediate: false  // v0.9.1+
};

exports.phantom = {
  phantom      : true,
  require      : true,
  WebPage      : true,
  console      : true, // in examples, but undocumented
  exports      : true  // v1.7+
};

exports.rhino = {
  defineClass  : false,
  deserialize  : false,
  gc           : false,
  help         : false,
  importPackage: false,
  "java"       : false,
  load         : false,
  loadClass    : false,
  print        : false,
  quit         : false,
  readFile     : false,
  readUrl      : false,
  runCommand   : false,
  seal         : false,
  serialize    : false,
  spawn        : false,
  sync         : false,
  toint32      : false,
  version      : false
};

exports.shelljs = {
  target       : false,
  echo         : false,
  exit         : false,
  cd           : false,
  pwd          : false,
  ls           : false,
  find         : false,
  cp           : false,
  rm           : false,
  mv           : false,
  mkdir        : false,
  test         : false,
  cat          : false,
  sed          : false,
  grep         : false,
  which        : false,
  dirs         : false,
  pushd        : false,
  popd         : false,
  env          : false,
  exec         : false,
  chmod        : false,
  config       : false,
  error        : false,
  tempdir      : false
};

exports.typed = {
  ArrayBuffer         : false,
  ArrayBufferView     : false,
  DataView            : false,
  Float32Array        : false,
  Float64Array        : false,
  Int16Array          : false,
  Int32Array          : false,
  Int8Array           : false,
  Uint16Array         : false,
  Uint32Array         : false,
  Uint8Array          : false,
  Uint8ClampedArray   : false
};

exports.wsh = {
  ActiveXObject            : true,
  Enumerator               : true,
  GetObject                : true,
  ScriptEngine             : true,
  ScriptEngineBuildVersion : true,
  ScriptEngineMajorVersion : true,
  ScriptEngineMinorVersion : true,
  VBArray                  : true,
  WSH                      : true,
  WScript                  : true,
  XDomainRequest           : true
};

// Globals provided by popular JavaScript libraries.

exports.dojo = {
  dojo     : false,
  dijit    : false,
  dojox    : false,
  define   : false,
  "require": false
};

exports.jquery = {
  "$"    : false,
  jQuery : false
};

exports.mootools = {
  "$"           : false,
  "$$"          : false,
  Asset         : false,
  Browser       : false,
  Chain         : false,
  Class         : false,
  Color         : false,
  Cookie        : false,
  Core          : false,
  Document      : false,
  DomReady      : false,
  DOMEvent      : false,
  DOMReady      : false,
  Drag          : false,
  Element       : false,
  Elements      : false,
  Event         : false,
  Events        : false,
  Fx            : false,
  Group         : false,
  Hash          : false,
  HtmlTable     : false,
  Iframe        : false,
  IframeShim    : false,
  InputValidator: false,
  instanceOf    : false,
  Keyboard      : false,
  Locale        : false,
  Mask          : false,
  MooTools      : false,
  Native        : false,
  Options       : false,
  OverText      : false,
  Request       : false,
  Scroller      : false,
  Slick         : false,
  Slider        : false,
  Sortables     : false,
  Spinner       : false,
  Swiff         : false,
  Tips          : false,
  Type          : false,
  typeOf        : false,
  URI           : false,
  Window        : false
};

exports.prototypejs = {
  "$"               : false,
  "$$"              : false,
  "$A"              : false,
  "$F"              : false,
  "$H"              : false,
  "$R"              : false,
  "$break"          : false,
  "$continue"       : false,
  "$w"              : false,
  Abstract          : false,
  Ajax              : false,
  Class             : false,
  Enumerable        : false,
  Element           : false,
  Event             : false,
  Field             : false,
  Form              : false,
  Hash              : false,
  Insertion         : false,
  ObjectRange       : false,
  PeriodicalExecuter: false,
  Position          : false,
  Prototype         : false,
  Selector          : false,
  Template          : false,
  Toggle            : false,
  Try               : false,
  Autocompleter     : false,
  Builder           : false,
  Control           : false,
  Draggable         : false,
  Draggables        : false,
  Droppables        : false,
  Effect            : false,
  Sortable          : false,
  SortableObserver  : false,
  Sound             : false,
  Scriptaculous     : false
};

exports.yui = {
  YUI       : false,
  Y         : false,
  YUI_config: false
};


})()
},{}],4:[function(require,module,exports){
(function(){"use strict";

// XXX(jeresig): Used for i18n string extraction
var $ = { _: function (msg) { return msg; } };

var errors = {
  // JSHint options
  E001: $._("Bad option: '{a}'."),
  E002: $._("Bad option value."),

  // JSHint input
  E003: $._("Expected a JSON value."),
  E004: $._("Input is neither a string nor an array of strings."),
  E005: $._("Input is empty."),
  E006: $._("Unexpected early end of program."),

  // Strict mode
  E007: $._("Missing \"use strict\" statement."),
  E008: $._("Strict violation."),
  E009: $._("Option 'validthis' can't be used in a global scope."),
  E010: $._("'with' is not allowed in strict mode."),

  // Constants
  E011: $._("const '{a}' has already been declared."),
  E012: $._("const '{a}' is initialized to 'undefined'."),
  E013: $._("Attempting to override '{a}' which is a constant."),

  // Regular expressions
  E014: $._("A regular expression literal can be confused with '/='."),
  E015: $._("Unclosed regular expression."),
  E016: $._("Invalid regular expression."),

  // Tokens
  E017: $._("It looks like your comment isn't closed. Use \"*/\" to end a multi-line comment."),
  E018: $._("It looks like you never started your comment. Use \"/*\" to start a multi-line comment."),
  E019: $._("Unmatched \"{a}\"."),
  E020: $._("I thought you were going to type \"{a}\" to match \"{b}\" from line {c} but you typed \"{d}\""),
  E021: $._("I thought you were going to type \"{a}\" but you typed \"{b}\"!"),
  E022: $._("Line breaking error '{a}'."),
  E023: $._("I think you're missing a \"{a}\"!"),
  E024: $._("Unexpected \"{a}\"."),
  E025: $._("I think you're missing ':' on a case clause."),
  E026: $._("I think you're missing a '}' to match '{' from line {a}."),
  E027: $._("I think you're missing a ']' to match '[' from line {a}."),
  E028: $._("Illegal comma."),
  E029: $._("Unclosed string! Make sure you end your string with a quote."),

  // Everything else
  E030: $._("I thought you were going to type an identifier but you typed '{a}'."),
  E031: $._("The left side of an assignment must be a single variable name, not an expression."), // FIXME: Rephrase
  E032: $._("I thought you were going to type a number or 'false' but you typed '{a}'."),
  E033: $._("I thought you were going to type an operator but you typed '{a}'."),
  E034: $._("get/set are ES5 features."),
  E035: $._("I think you're missing a property name."),
  E036: $._("I thought you were going to type a statement but you typed a block instead."),
  E037: null, // Vacant
  E038: null, // Vacant
  E039: $._("Function declarations are not invocable. Wrap the whole function invocation in parens."),
  E040: $._("Each value should have its own case label."),
  E041: $._("Unrecoverable syntax error."),
  E042: $._("Stopping."),
  E043: $._("Too many errors."),
  E044: $._("'{a}' is already defined and can't be redefined."),
  E045: $._("Invalid for each loop."),
  E046: $._("A yield statement shall be within a generator function (with syntax: `function*`)"),
  E047: $._("A generator function shall contain a yield statement."),
  E048: $._("Let declaration not directly within block."),
  E049: $._("A {a} cannot be named '{b}'."),
  E050: $._("Mozilla requires the yield expression to be parenthesized here."),
  E051: $._("Regular parameters cannot come after default parameters."),
  E052: $._("I think you meant to type a value or variable name before that comma?"),
  E053: $._("I think you either have an extra comma or a missing argument?")
};

var warnings = {
  W001: $._("'hasOwnProperty' is a really bad name."),
  W002: $._("Value of '{a}' may be overwritten in IE 8 and earlier."),
  W003: $._("'{a}' was used before it was defined."),
  W004: $._("'{a}' is already defined."),
  W005: $._("A dot following a number can be confused with a decimal point."),
  W006: $._("Confusing minuses."),
  W007: $._("Confusing pluses."),
  W008: $._("Please put a 0 in front of the decimal point: \"{a}\"!"),
  W009: $._("The array literal notation [] is preferrable."),
  W010: $._("The object literal notation {} is preferrable."),
  W011: $._("Unexpected space after '{a}'."),
  W012: $._("Unexpected space before '{a}'."),
  W013: $._("I think you're missing a space after \"{a}\"."),
  W014: $._("Bad line breaking before '{a}'."),
  W015: $._("Expected '{a}' to have an indentation at {b} instead at {c}."),
  W016: $._("Unexpected use of '{a}'."),
  W017: $._("Bad operand."),
  W018: $._("Confusing use of '{a}'."),
  W019: $._("Use the isNaN function to compare with NaN."),
  W020: $._("Read only."),
  W021: $._("'{a}' is a function."),
  W022: $._("Do not assign to the exception parameter."),
  W023: $._("I thought you were going to type an identifier in an assignment but you typed a function invocation instead."),
  W024: $._("I thought you were going to type an identifier but you typed '{a}' (a reserved word)."),
  W025: $._("I think you're missing the name in your function declaration."),
  W026: $._("Inner functions should be listed at the top of the outer function."),
  W027: $._("Unreachable '{a}' after '{b}'."),
  W028: $._("Label '{a}' on {b} statement."),
  W030: $._("I thought you were going to type an assignment or function call but you typed an expression instead."),
  W031: $._("Do not use 'new' for side effects."),
  W032: $._("It looks like you have an unnecessary semicolon."),
  W033: $._("It looks like you're missing a semicolon."),
  W034: $._("Unnecessary directive \"{a}\"."),
  W035: $._("Empty block."),
  W036: $._("Unexpected /*member '{a}'."),
  W037: $._("'{a}' is a statement label."),
  W038: $._("'{a}' used out of scope."),
  W039: $._("'{a}' is not allowed."),
  W040: $._("Possible strict violation."),
  W041: $._("Use '{a}' to compare with '{b}'."),
  W042: $._("Avoid EOL escaping."),
  W043: $._("Bad escaping of EOL. Use option multistr if needed."),
  W044: $._("Bad or unnecessary escaping."),
  W045: $._("Bad number '{a}'."),
  W046: $._("Don't use extra leading zeros \"{a}\"."),
  W047: $._("A trailing decimal point can be confused with a dot: '{a}'."),
  W048: $._("Unexpected control character in regular expression."),
  W049: $._("Unexpected escaped character '{a}' in regular expression."),
  W050: $._("JavaScript URL."),
  W051: $._("Variables should not be deleted."),
  W052: $._("Unexpected '{a}'."),
  W053: $._("Do not use {a} as a constructor."),
  W054: $._("The Function constructor is a form of eval."),
  W055: $._("A constructor name should start with an uppercase letter."),
  W056: $._("Bad constructor."),
  W057: $._("Weird construction. Is 'new' necessary?"),
  W058: $._("I think you're missing the \"()\" to invoke the constructor."),
  W059: $._("Avoid arguments.{a}."),
  W060: $._("document.write can be a form of eval."),
  W061: $._("eval can be harmful."),
  W062: $._("Wrap an immediate function invocation in parens " +
    "to assist the reader in understanding that the expression " +
    "is the result of a function, and not the function itself."),
  W063: $._("Math is not a function."),
  W064: $._("I think you're missing using 'new' to call a constructor."),
  W065: $._("It looks like you're missing a radix parameter."),
  W066: $._("Implied eval. Consider passing a function instead of a string."),
  W067: $._("Bad invocation."),
  W068: $._("Wrapping non-IIFE function literals in parens is unnecessary."),
  W069: $._("['{a}'] is better written in dot notation."),
  W070: $._("Extra comma. (it breaks older versions of IE)"),
  W071: $._("This function has too many statements. ({a})"),
  W072: $._("This function has too many parameters. ({a})"),
  W073: $._("Blocks are nested too deeply. ({a})"),
  W074: $._("This function's cyclomatic complexity is too high. ({a})"),
  W075: $._("Duplicate key '{a}'."),
  W076: $._("Unexpected parameter '{a}' in get {b} function."),
  W077: $._("Expected a single parameter in set {a} function."),
  W078: $._("Setter is defined without getter."),
  W079: $._("Redefinition of '{a}'."),
  W080: $._("It's not necessary to initialize '{a}' to 'undefined'."),
  W081: $._("Too many var statements."),
  W082: $._("Function declarations should not be placed in blocks. " +
    "Use a function expression or move the statement to the top of " +
    "the outer function."),
  W083: $._("It's not a good idea to define functions within a loop. Can you define them outside instead?"),
  W084: $._("I thought you were going to type a conditional expression but you typed an assignment instead."),
  W085: $._("Don't use 'with'."),
  W086: $._("Did you forget a 'break' statement before '{a}'?"),
  W087: $._("Forgotten 'debugger' statement?"),
  W088: $._("Creating global 'for' variable. Should be 'for (var {a} ...'."),
  W089: $._("The body of a for in should be wrapped in an if statement to filter " +
    "unwanted properties from the prototype."),
  W090: $._("'{a}' is not a statement label."),
  W091: $._("'{a}' is out of scope."),
  W092: $._("Wrap the /regexp/ literal in parens to disambiguate the slash operator."),
  W093: $._("Did you mean to return a conditional instead of an assignment?"),
  W094: $._("Unexpected comma."),
  W095: $._("I thought you were going to type a string but you typed {a}."),
  W096: $._("The '{a}' key may produce unexpected results."),
  W097: $._("Use the function form of \"use strict\"."),
  W098: $._("'{a}' is defined but never used."),
  W099: $._("Mixed spaces and tabs."),
  W100: $._("This character may get silently deleted by one or more browsers."),
  W101: $._("Line is too long."),
  W102: $._("Trailing whitespace."),
  W103: $._("The '{a}' property is deprecated."),
  W104: $._("'{a}' is only available in JavaScript 1.7."),
  W105: $._("Unexpected {a} in '{b}'."),
  W106: $._("Identifier '{a}' is not in camel case."),
  W107: $._("Script URL."),
  W108: $._("Strings must use doublequote."),
  W109: $._("Strings must use singlequote."),
  W110: $._("Mixed double and single quotes."),
  W112: $._("Unclosed string! Make sure you end your string with a quote."),
  W113: $._("Control character in string: {a}."),
  W114: $._("Avoid {a}."),
  W115: $._("Octal literals are not allowed in strict mode."),
  W116: $._("I thought you were going to type \"{a}\" but you typed \"{b}\"."),
  W117: $._("\"{a}\" is not defined. Make sure you're spelling it correctly and that you declared it."),
  W118: $._("'{a}' is only available in Mozilla JavaScript extensions (use moz option)."),
  W119: $._("'{a}' is only available in ES6 (use esnext option)."),
  W120: $._("You might be leaking a variable ({a}) here."),
  W121: $._("I thought you were going to type a conditional expression but you typed an assignment instead. Maybe you meant to type === instead of =?"),
  
};

var info = {
  I001: $._("Comma warnings can be turned off with 'laxcomma'."),
  I002: $._("Reserved words as properties can be used under the 'es5' option."),
  I003: $._("ES5 option is now set per default")
};

exports.errors = {};
exports.warnings = {};
exports.info = {};

for (var code in errors) {
  exports.errors[code] = { code: code, desc: errors[code] };
}

for (var code in warnings) {
  exports.warnings[code] = { code: code, desc: warnings[code] };
}

for (var code in info) {
  exports.info[code] = { code: code, desc: info[code] };
}

})()
},{}],5:[function(require,module,exports){
/*
 * Regular expressions. Some of these are stupidly long.
 */

/*jshint maxlen:1000 */

"use string";

// Unsafe comment or string (ax)
exports.unsafeString =
  /@cc|<\/?|script|\]\s*\]|<\s*!|&lt/i;

// Unsafe characters that are silently deleted by one or more browsers (cx)
exports.unsafeChars =
  /[\u0000-\u001f\u007f-\u009f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/;

// Characters in strings that need escaping (nx and nxg)
exports.needEsc =
  /[\u0000-\u001f&<"\/\\\u007f-\u009f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/;

exports.needEscGlobal =
  /[\u0000-\u001f&<"\/\\\u007f-\u009f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g;

// Star slash (lx)
exports.starSlash = /\*\//;

// Identifier (ix)
exports.identifier = /^([a-zA-Z_$][a-zA-Z0-9_$]*)$/;

// JavaScript URL (jx)
exports.javascriptURL = /^(?:javascript|jscript|ecmascript|vbscript|mocha|livescript)\s*:/i;

// Catches /* falls through */ comments (ft)
exports.fallsThrough = /^\s*\/\*\s*falls?\sthrough\s*\*\/\s*$/;

},{}],6:[function(require,module,exports){
"use strict";

var state = {
  syntax: {},

  reset: function () {
    this.tokens = {
      prev: null,
      next: null,
      curr: null
    };

    this.option = {};
    this.ignored = {};
    this.directive = {};
    this.jsonMode = false;
    this.jsonWarnings = [];
    this.lines = [];
    this.tab = "";
    this.cache = {}; // Node.JS doesn't have Map. Sniff.
  }
};

exports.state = state;

},{}],7:[function(require,module,exports){
(function(){"use strict";

exports.register = function (linter) {
  // Check for properties named __proto__. This special property was
  // deprecated and then re-introduced for ES6.

  linter.on("Identifier", function style_scanProto(data) {
    if (linter.getOption("proto")) {
      return;
    }

    if (data.name === "__proto__") {
      linter.warn("W103", {
        line: data.line,
        char: data.char,
        data: [ data.name ]
      });
    }
  });

  // Check for properties named __iterator__. This is a special property
  // available only in browsers with JavaScript 1.7 implementation.

  linter.on("Identifier", function style_scanIterator(data) {
    if (linter.getOption("iterator")) {
      return;
    }

    if (data.name === "__iterator__") {
      linter.warn("W104", {
        line: data.line,
        char: data.char,
        data: [ data.name ]
      });
    }
  });

  // Check for dangling underscores.

  linter.on("Identifier", function style_scanDangling(data) {
    if (!linter.getOption("nomen")) {
      return;
    }

    // Underscore.js
    if (data.name === "_") {
      return;
    }

    // In Node, __dirname and __filename should be ignored.
    if (linter.getOption("node")) {
      if (/^(__dirname|__filename)$/.test(data.name) && !data.isProperty) {
        return;
      }
    }

    if (/^(_+.*|.*_+)$/.test(data.name)) {
      linter.warn("W105", {
        line: data.line,
        char: data.from,
        data: [ "dangling '_'", data.name ]
      });
    }
  });

  // Check that all identifiers are using camelCase notation.
  // Exceptions: names like MY_VAR and _myVar.

  linter.on("Identifier", function style_scanCamelCase(data) {
    if (!linter.getOption("camelcase")) {
      return;
    }

    if (data.name.replace(/^_+/, "").indexOf("_") > -1 && !data.name.match(/^[A-Z0-9_]*$/)) {
      linter.warn("W106", {
        line: data.line,
        char: data.from,
        data: [ data.name ]
      });
    }
  });

  // Enforce consistency in style of quoting.

  linter.on("String", function style_scanQuotes(data) {
    var quotmark = linter.getOption("quotmark");
    var code;

    if (!quotmark) {
      return;
    }

    // If quotmark is set to 'single' warn about all double-quotes.

    if (quotmark === "single" && data.quote !== "'") {
      code = "W109";
    }

    // If quotmark is set to 'double' warn about all single-quotes.

    if (quotmark === "double" && data.quote !== "\"") {
      code = "W108";
    }

    // If quotmark is set to true, remember the first quotation style
    // and then warn about all others.

    if (quotmark === true) {
      if (!linter.getCache("quotmark")) {
        linter.setCache("quotmark", data.quote);
      }

      if (linter.getCache("quotmark") !== data.quote) {
        code = "W110";
      }
    }

    if (code) {
      linter.warn(code, {
        line: data.line,
        char: data.char,
      });
    }
  });

  linter.on("Number", function style_scanNumbers(data) {
    if (data.value.charAt(0) === ".") {
      // Warn about a leading decimal point.
      linter.warn("W008", {
        line: data.line,
        char: data.char,
        data: [ data.value ]
      });
    }

    if (data.value.substr(data.value.length - 1) === ".") {
      // Warn about a trailing decimal point.
      linter.warn("W047", {
        line: data.line,
        char: data.char,
        data: [ data.value ]
      });
    }

    if (/^00+/.test(data.value)) {
      // Multiple leading zeroes.
      linter.warn("W046", {
        line: data.line,
        char: data.char,
        data: [ data.value ]
      });
    }
  });

  // Warn about script URLs.

  linter.on("String", function style_scanJavaScriptURLs(data) {
    var re = /^(?:javascript|jscript|ecmascript|vbscript|mocha|livescript)\s*:/i;

    if (linter.getOption("scripturl")) {
      return;
    }

    if (re.test(data.value)) {
      linter.warn("W107", {
        line: data.line,
        char: data.char
      });
    }
  });
};
})()
},{}],8:[function(require,module,exports){
(function(){/*
 * Lexical analysis and token construction.
 */

"use strict";

var events = require("events");
var reg    = require("./reg.js");
var state  = require("./state.js").state;

// Some of these token types are from JavaScript Parser API
// while others are specific to JSHint parser.
// JS Parser API: https://developer.mozilla.org/en-US/docs/SpiderMonkey/Parser_API

var Token = {
  Identifier: 1,
  Punctuator: 2,
  NumericLiteral: 3,
  StringLiteral: 4,
  Comment: 5,
  Keyword: 6,
  NullLiteral: 7,
  BooleanLiteral: 8,
  RegExp: 9
};

// This is auto generated from the unicode tables.
// The tables are at:
// http://www.fileformat.info/info/unicode/category/Lu/list.htm
// http://www.fileformat.info/info/unicode/category/Ll/list.htm
// http://www.fileformat.info/info/unicode/category/Lt/list.htm
// http://www.fileformat.info/info/unicode/category/Lm/list.htm
// http://www.fileformat.info/info/unicode/category/Lo/list.htm
// http://www.fileformat.info/info/unicode/category/Nl/list.htm

var unicodeLetterTable = [
  170, 170, 181, 181, 186, 186, 192, 214,
  216, 246, 248, 705, 710, 721, 736, 740, 748, 748, 750, 750,
  880, 884, 886, 887, 890, 893, 902, 902, 904, 906, 908, 908,
  910, 929, 931, 1013, 1015, 1153, 1162, 1319, 1329, 1366,
  1369, 1369, 1377, 1415, 1488, 1514, 1520, 1522, 1568, 1610,
  1646, 1647, 1649, 1747, 1749, 1749, 1765, 1766, 1774, 1775,
  1786, 1788, 1791, 1791, 1808, 1808, 1810, 1839, 1869, 1957,
  1969, 1969, 1994, 2026, 2036, 2037, 2042, 2042, 2048, 2069,
  2074, 2074, 2084, 2084, 2088, 2088, 2112, 2136, 2308, 2361,
  2365, 2365, 2384, 2384, 2392, 2401, 2417, 2423, 2425, 2431,
  2437, 2444, 2447, 2448, 2451, 2472, 2474, 2480, 2482, 2482,
  2486, 2489, 2493, 2493, 2510, 2510, 2524, 2525, 2527, 2529,
  2544, 2545, 2565, 2570, 2575, 2576, 2579, 2600, 2602, 2608,
  2610, 2611, 2613, 2614, 2616, 2617, 2649, 2652, 2654, 2654,
  2674, 2676, 2693, 2701, 2703, 2705, 2707, 2728, 2730, 2736,
  2738, 2739, 2741, 2745, 2749, 2749, 2768, 2768, 2784, 2785,
  2821, 2828, 2831, 2832, 2835, 2856, 2858, 2864, 2866, 2867,
  2869, 2873, 2877, 2877, 2908, 2909, 2911, 2913, 2929, 2929,
  2947, 2947, 2949, 2954, 2958, 2960, 2962, 2965, 2969, 2970,
  2972, 2972, 2974, 2975, 2979, 2980, 2984, 2986, 2990, 3001,
  3024, 3024, 3077, 3084, 3086, 3088, 3090, 3112, 3114, 3123,
  3125, 3129, 3133, 3133, 3160, 3161, 3168, 3169, 3205, 3212,
  3214, 3216, 3218, 3240, 3242, 3251, 3253, 3257, 3261, 3261,
  3294, 3294, 3296, 3297, 3313, 3314, 3333, 3340, 3342, 3344,
  3346, 3386, 3389, 3389, 3406, 3406, 3424, 3425, 3450, 3455,
  3461, 3478, 3482, 3505, 3507, 3515, 3517, 3517, 3520, 3526,
  3585, 3632, 3634, 3635, 3648, 3654, 3713, 3714, 3716, 3716,
  3719, 3720, 3722, 3722, 3725, 3725, 3732, 3735, 3737, 3743,
  3745, 3747, 3749, 3749, 3751, 3751, 3754, 3755, 3757, 3760,
  3762, 3763, 3773, 3773, 3776, 3780, 3782, 3782, 3804, 3805,
  3840, 3840, 3904, 3911, 3913, 3948, 3976, 3980, 4096, 4138,
  4159, 4159, 4176, 4181, 4186, 4189, 4193, 4193, 4197, 4198,
  4206, 4208, 4213, 4225, 4238, 4238, 4256, 4293, 4304, 4346,
  4348, 4348, 4352, 4680, 4682, 4685, 4688, 4694, 4696, 4696,
  4698, 4701, 4704, 4744, 4746, 4749, 4752, 4784, 4786, 4789,
  4792, 4798, 4800, 4800, 4802, 4805, 4808, 4822, 4824, 4880,
  4882, 4885, 4888, 4954, 4992, 5007, 5024, 5108, 5121, 5740,
  5743, 5759, 5761, 5786, 5792, 5866, 5870, 5872, 5888, 5900,
  5902, 5905, 5920, 5937, 5952, 5969, 5984, 5996, 5998, 6000,
  6016, 6067, 6103, 6103, 6108, 6108, 6176, 6263, 6272, 6312,
  6314, 6314, 6320, 6389, 6400, 6428, 6480, 6509, 6512, 6516,
  6528, 6571, 6593, 6599, 6656, 6678, 6688, 6740, 6823, 6823,
  6917, 6963, 6981, 6987, 7043, 7072, 7086, 7087, 7104, 7141,
  7168, 7203, 7245, 7247, 7258, 7293, 7401, 7404, 7406, 7409,
  7424, 7615, 7680, 7957, 7960, 7965, 7968, 8005, 8008, 8013,
  8016, 8023, 8025, 8025, 8027, 8027, 8029, 8029, 8031, 8061,
  8064, 8116, 8118, 8124, 8126, 8126, 8130, 8132, 8134, 8140,
  8144, 8147, 8150, 8155, 8160, 8172, 8178, 8180, 8182, 8188,
  8305, 8305, 8319, 8319, 8336, 8348, 8450, 8450, 8455, 8455,
  8458, 8467, 8469, 8469, 8473, 8477, 8484, 8484, 8486, 8486,
  8488, 8488, 8490, 8493, 8495, 8505, 8508, 8511, 8517, 8521,
  8526, 8526, 8544, 8584, 11264, 11310, 11312, 11358,
  11360, 11492, 11499, 11502, 11520, 11557, 11568, 11621,
  11631, 11631, 11648, 11670, 11680, 11686, 11688, 11694,
  11696, 11702, 11704, 11710, 11712, 11718, 11720, 11726,
  11728, 11734, 11736, 11742, 11823, 11823, 12293, 12295,
  12321, 12329, 12337, 12341, 12344, 12348, 12353, 12438,
  12445, 12447, 12449, 12538, 12540, 12543, 12549, 12589,
  12593, 12686, 12704, 12730, 12784, 12799, 13312, 13312,
  19893, 19893, 19968, 19968, 40907, 40907, 40960, 42124,
  42192, 42237, 42240, 42508, 42512, 42527, 42538, 42539,
  42560, 42606, 42623, 42647, 42656, 42735, 42775, 42783,
  42786, 42888, 42891, 42894, 42896, 42897, 42912, 42921,
  43002, 43009, 43011, 43013, 43015, 43018, 43020, 43042,
  43072, 43123, 43138, 43187, 43250, 43255, 43259, 43259,
  43274, 43301, 43312, 43334, 43360, 43388, 43396, 43442,
  43471, 43471, 43520, 43560, 43584, 43586, 43588, 43595,
  43616, 43638, 43642, 43642, 43648, 43695, 43697, 43697,
  43701, 43702, 43705, 43709, 43712, 43712, 43714, 43714,
  43739, 43741, 43777, 43782, 43785, 43790, 43793, 43798,
  43808, 43814, 43816, 43822, 43968, 44002, 44032, 44032,
  55203, 55203, 55216, 55238, 55243, 55291, 63744, 64045,
  64048, 64109, 64112, 64217, 64256, 64262, 64275, 64279,
  64285, 64285, 64287, 64296, 64298, 64310, 64312, 64316,
  64318, 64318, 64320, 64321, 64323, 64324, 64326, 64433,
  64467, 64829, 64848, 64911, 64914, 64967, 65008, 65019,
  65136, 65140, 65142, 65276, 65313, 65338, 65345, 65370,
  65382, 65470, 65474, 65479, 65482, 65487, 65490, 65495,
  65498, 65500, 65536, 65547, 65549, 65574, 65576, 65594,
  65596, 65597, 65599, 65613, 65616, 65629, 65664, 65786,
  65856, 65908, 66176, 66204, 66208, 66256, 66304, 66334,
  66352, 66378, 66432, 66461, 66464, 66499, 66504, 66511,
  66513, 66517, 66560, 66717, 67584, 67589, 67592, 67592,
  67594, 67637, 67639, 67640, 67644, 67644, 67647, 67669,
  67840, 67861, 67872, 67897, 68096, 68096, 68112, 68115,
  68117, 68119, 68121, 68147, 68192, 68220, 68352, 68405,
  68416, 68437, 68448, 68466, 68608, 68680, 69635, 69687,
  69763, 69807, 73728, 74606, 74752, 74850, 77824, 78894,
  92160, 92728, 110592, 110593, 119808, 119892, 119894, 119964,
  119966, 119967, 119970, 119970, 119973, 119974, 119977, 119980,
  119982, 119993, 119995, 119995, 119997, 120003, 120005, 120069,
  120071, 120074, 120077, 120084, 120086, 120092, 120094, 120121,
  120123, 120126, 120128, 120132, 120134, 120134, 120138, 120144,
  120146, 120485, 120488, 120512, 120514, 120538, 120540, 120570,
  120572, 120596, 120598, 120628, 120630, 120654, 120656, 120686,
  120688, 120712, 120714, 120744, 120746, 120770, 120772, 120779,
  131072, 131072, 173782, 173782, 173824, 173824, 177972, 177972,
  177984, 177984, 178205, 178205, 194560, 195101
];

var identifierStartTable = [];

for (var i = 0; i < 128; i++) {
  identifierStartTable[i] =
    i === 36 ||           // $
    i >= 65 && i <= 90 || // A-Z
    i === 95 ||           // _
    i >= 97 && i <= 122;  // a-z
}

var identifierPartTable = [];

for (var i = 0; i < 128; i++) {
  identifierPartTable[i] =
    identifierStartTable[i] || // $, _, A-Z, a-z
    i >= 48 && i <= 57;        // 0-9
}

// Object that handles postponed lexing verifications that checks the parsed
// environment state.

function asyncTrigger() {
  var _checks = [];

  return {
    push: function (fn) {
      _checks.push(fn);
    },

    check: function () {
      for (var check = 0; check < _checks.length; ++check) {
        _checks[check]();
      }

      _checks.splice(0, _checks.length);
    }
  };
}

/*
 * Lexer for JSHint.
 *
 * This object does a char-by-char scan of the provided source code
 * and produces a sequence of tokens.
 *
 *   var lex = new Lexer("var i = 0;");
 *   lex.start();
 *   lex.token(); // returns the next token
 *
 * You have to use the token() method to move the lexer forward
 * but you don't have to use its return value to get tokens. In addition
 * to token() method returning the next token, the Lexer object also
 * emits events.
 *
 *   lex.on("Identifier", function (data) {
 *     if (data.name.indexOf("_") >= 0) {
 *       // Produce a warning.
 *     }
 *   });
 *
 * Note that the token() method returns tokens in a JSLint-compatible
 * format while the event emitter uses a slightly modified version of
 * Mozilla's JavaScript Parser API. Eventually, we will move away from
 * JSLint format.
 */
function Lexer(source) {
  var lines = source;

  if (typeof lines === "string") {
    lines = lines
      .replace(/\r\n/g, "\n")
      .replace(/\r/g, "\n")
      .split("\n");
  }

  // If the first line is a shebang (#!), make it a blank and move on.
  // Shebangs are used by Node scripts.

  if (lines[0] && lines[0].substr(0, 2) === "#!") {
    lines[0] = "";
  }

  this.emitter = new events.EventEmitter();
  this.source = source;
  this.setLines(lines);
  this.prereg = true;

  this.line = 0;
  this.char = 1;
  this.from = 1;
  this.input = "";

  for (var i = 0; i < state.option.indent; i += 1) {
    state.tab += " ";
  }
}

Lexer.prototype = {
  _lines: [],

  getLines: function () {
    this._lines = state.lines;
    return this._lines;
  },

  setLines: function (val) {
    this._lines = val;
    state.lines = this._lines;
  },

  /*
   * Return the next i character without actually moving the
   * char pointer.
   */
  peek: function (i) {
    return this.input.charAt(i || 0);
  },

  /*
   * Move the char pointer forward i times.
   */
  skip: function (i) {
    i = i || 1;
    this.char += i;
    this.input = this.input.slice(i);
  },

  /*
   * Subscribe to a token event. The API for this method is similar
   * Underscore.js i.e. you can subscribe to multiple events with
   * one call:
   *
   *   lex.on("Identifier Number", function (data) {
   *     // ...
   *   });
   */
  on: function (names, listener) {
    names.split(" ").forEach(function (name) {
      this.emitter.on(name, listener);
    }.bind(this));
  },

  /*
   * Trigger a token event. All arguments will be passed to each
   * listener.
   */
  trigger: function () {
    this.emitter.emit.apply(this.emitter, Array.prototype.slice.call(arguments));
  },

  /*
   * Postpone a token event. the checking condition is set as
   * last parameter, and the trigger function is called in a
   * stored callback. To be later called using the check() function
   * by the parser. This avoids parser's peek() to give the lexer
   * a false context.
   */
  triggerAsync: function (type, args, checks, fn) {
    checks.push(function () {
      if (fn()) {
        this.trigger(type, args);
      }
    }.bind(this));
  },

  /*
   * Extract a punctuator out of the next sequence of characters
   * or return 'null' if its not possible.
   *
   * This method's implementation was heavily influenced by the
   * scanPunctuator function in the Esprima parser's source code.
   */
  scanPunctuator: function () {
    var ch1 = this.peek();
    var ch2, ch3, ch4;

    switch (ch1) {
    // Most common single-character punctuators
    case ".":
      if ((/^[0-9]$/).test(this.peek(1))) {
        return null;
      }
      if (this.peek(1) === "." && this.peek(2) === ".") {
        return {
          type: Token.Punctuator,
          value: "..."
        };
      }
      /* falls through */
    case "(":
    case ")":
    case ";":
    case ",":
    case "{":
    case "}":
    case "[":
    case "]":
    case ":":
    case "~":
    case "?":
      return {
        type: Token.Punctuator,
        value: ch1
      };

    // A pound sign (for Node shebangs)
    case "#":
      return {
        type: Token.Punctuator,
        value: ch1
      };

    // We're at the end of input
    case "":
      return null;
    }

    // Peek more characters

    ch2 = this.peek(1);
    ch3 = this.peek(2);
    ch4 = this.peek(3);

    // 4-character punctuator: >>>=

    if (ch1 === ">" && ch2 === ">" && ch3 === ">" && ch4 === "=") {
      return {
        type: Token.Punctuator,
        value: ">>>="
      };
    }

    // 3-character punctuators: === !== >>> <<= >>=

    if (ch1 === "=" && ch2 === "=" && ch3 === "=") {
      return {
        type: Token.Punctuator,
        value: "==="
      };
    }

    if (ch1 === "!" && ch2 === "=" && ch3 === "=") {
      return {
        type: Token.Punctuator,
        value: "!=="
      };
    }

    if (ch1 === ">" && ch2 === ">" && ch3 === ">") {
      return {
        type: Token.Punctuator,
        value: ">>>"
      };
    }

    if (ch1 === "<" && ch2 === "<" && ch3 === "=") {
      return {
        type: Token.Punctuator,
        value: "<<="
      };
    }

    if (ch1 === ">" && ch2 === ">" && ch3 === "=") {
      return {
        type: Token.Punctuator,
        value: ">>="
      };
    }

    // Fat arrow punctuator
    if (ch1 === "=" && ch2 === ">") {
      return {
        type: Token.Punctuator,
        value: ch1 + ch2
      };
    }

    // 2-character punctuators: <= >= == != ++ -- << >> && ||
    // += -= *= %= &= |= ^= (but not /=, see below)
    if (ch1 === ch2 && ("+-<>&|".indexOf(ch1) >= 0)) {
      return {
        type: Token.Punctuator,
        value: ch1 + ch2
      };
    }

    if ("<>=!+-*%&|^".indexOf(ch1) >= 0) {
      if (ch2 === "=") {
        return {
          type: Token.Punctuator,
          value: ch1 + ch2
        };
      }

      return {
        type: Token.Punctuator,
        value: ch1
      };
    }

    // Special case: /=. We need to make sure that this is an
    // operator and not a regular expression.

    if (ch1 === "/") {
      if (ch2 === "=" && /\/=(?!(\S*\/[gim]?))/.test(this.input)) {
        // /= is not a part of a regular expression, return it as a
        // punctuator.
        return {
          type: Token.Punctuator,
          value: "/="
        };
      }

      return {
        type: Token.Punctuator,
        value: "/"
      };
    }

    return null;
  },

  /*
   * Extract a comment out of the next sequence of characters and/or
   * lines or return 'null' if its not possible. Since comments can
   * span across multiple lines this method has to move the char
   * pointer.
   *
   * In addition to normal JavaScript comments (// and /*) this method
   * also recognizes JSHint- and JSLint-specific comments such as
   * /*jshint, /*jslint, /*globals and so on.
   */
  scanComments: function () {
    var ch1 = this.peek();
    var ch2 = this.peek(1);
    var rest = this.input.substr(2);
    var startLine = this.line;
    var startChar = this.char;

    // Create a comment token object and make sure it
    // has all the data JSHint needs to work with special
    // comments.

    function commentToken(label, body, opt) {
      var special = ["jshint", "jslint", "members", "member", "globals", "global", "exported"];
      var isSpecial = false;
      var value = label + body;
      var commentType = "plain";
      opt = opt || {};

      if (opt.isMultiline) {
        value += "*/";
      }

      special.forEach(function (str) {
        if (isSpecial) {
          return;
        }

        // Don't recognize any special comments other than jshint for single-line
        // comments. This introduced many problems with legit comments.
        if (label === "//" && str !== "jshint") {
          return;
        }

        if (body.substr(0, str.length) === str) {
          isSpecial = true;
          label = label + str;
          body = body.substr(str.length);
        }

        if (!isSpecial && body.charAt(0) === " " && body.substr(1, str.length) === str) {
          isSpecial = true;
          label = label + " " + str;
          body = body.substr(str.length + 1);
        }

        if (!isSpecial) {
          return;
        }

        switch (str) {
        case "member":
          commentType = "members";
          break;
        case "global":
          commentType = "globals";
          break;
        default:
          commentType = str;
        }
      });

      return {
        type: Token.Comment,
        commentType: commentType,
        value: value,
        body: body,
        isSpecial: isSpecial,
        isMultiline: opt.isMultiline || false,
        isMalformed: opt.isMalformed || false
      };
    }

    // End of unbegun comment. Raise an error and skip that input.
    if (ch1 === "*" && ch2 === "/") {
      this.trigger("error", {
        code: "E018",
        line: startLine,
        character: startChar
      });

      this.skip(2);
      return null;
    }

    // Comments must start either with // or /*
    if (ch1 !== "/" || (ch2 !== "*" && ch2 !== "/")) {
      return null;
    }

    // One-line comment
    if (ch2 === "/") {
      this.skip(this.input.length); // Skip to the EOL.
      return commentToken("//", rest);
    }

    var body = "";

    /* Multi-line comment */
    if (ch2 === "*") {
      this.skip(2);

      while (this.peek() !== "*" || this.peek(1) !== "/") {
        if (this.peek() === "") { // End of Line
          body += "\n";

          // If we hit EOF and our comment is still unclosed,
          // trigger an error and end the comment implicitly.
          if (!this.nextLine()) {
            this.trigger("error", {
              code: "E017",
              line: startLine,
              character: startChar
            });

            return commentToken("/*", body, {
              isMultiline: true,
              isMalformed: true
            });
          }
        } else {
          body += this.peek();
          this.skip();
        }
      }

      this.skip(2);
      return commentToken("/*", body, { isMultiline: true });
    }
  },

  /*
   * Extract a keyword out of the next sequence of characters or
   * return 'null' if its not possible.
   */
  scanKeyword: function () {
    var result = /^[a-zA-Z_$][a-zA-Z0-9_$]*/.exec(this.input);
    var keywords = [
      "if", "in", "do", "var", "for", "new",
      "try", "let", "this", "else", "case",
      "void", "with", "enum", "while", "break",
      "catch", "throw", "const", "yield", "class",
      "super", "return", "typeof", "delete",
      "switch", "export", "import", "default",
      "finally", "extends", "function", "continue",
      "debugger", "instanceof"
    ];

    if (result && keywords.indexOf(result[0]) >= 0) {
      return {
        type: Token.Keyword,
        value: result[0]
      };
    }

    return null;
  },

  /*
   * Extract a JavaScript identifier out of the next sequence of
   * characters or return 'null' if its not possible. In addition,
   * to Identifier this method can also produce BooleanLiteral
   * (true/false) and NullLiteral (null).
   */
  scanIdentifier: function () {
    var id = "";
    var index = 0;
    var type, char;

    // Detects any character in the Unicode categories "Uppercase
    // letter (Lu)", "Lowercase letter (Ll)", "Titlecase letter
    // (Lt)", "Modifier letter (Lm)", "Other letter (Lo)", or
    // "Letter number (Nl)".
    //
    // Both approach and unicodeLetterTable were borrowed from
    // Google's Traceur.

    function isUnicodeLetter(code) {
      for (var i = 0; i < unicodeLetterTable.length;) {
        if (code < unicodeLetterTable[i++]) {
          return false;
        }

        if (code <= unicodeLetterTable[i++]) {
          return true;
        }
      }

      return false;
    }

    function isHexDigit(str) {
      return (/^[0-9a-fA-F]$/).test(str);
    }

    var readUnicodeEscapeSequence = function () {
      /*jshint validthis:true */
      index += 1;

      if (this.peek(index) !== "u") {
        return null;
      }

      var ch1 = this.peek(index + 1);
      var ch2 = this.peek(index + 2);
      var ch3 = this.peek(index + 3);
      var ch4 = this.peek(index + 4);
      var code;

      if (isHexDigit(ch1) && isHexDigit(ch2) && isHexDigit(ch3) && isHexDigit(ch4)) {
        code = parseInt(ch1 + ch2 + ch3 + ch4, 16);

        if (isUnicodeLetter(code)) {
          index += 5;
          return "\\u" + ch1 + ch2 + ch3 + ch4;
        }

        return null;
      }

      return null;
    }.bind(this);

    var getIdentifierStart = function () {
      /*jshint validthis:true */
      var chr = this.peek(index);
      var code = chr.charCodeAt(0);

      if (code === 92) {
        return readUnicodeEscapeSequence();
      }

      if (code < 128) {
        if (identifierStartTable[code]) {
          index += 1;
          return chr;
        }

        return null;
      }

      if (isUnicodeLetter(code)) {
        index += 1;
        return chr;
      }

      return null;
    }.bind(this);

    var getIdentifierPart = function () {
      /*jshint validthis:true */
      var chr = this.peek(index);
      var code = chr.charCodeAt(0);

      if (code === 92) {
        return readUnicodeEscapeSequence();
      }

      if (code < 128) {
        if (identifierPartTable[code]) {
          index += 1;
          return chr;
        }

        return null;
      }

      if (isUnicodeLetter(code)) {
        index += 1;
        return chr;
      }

      return null;
    }.bind(this);

    char = getIdentifierStart();
    if (char === null) {
      return null;
    }

    id = char;
    for (;;) {
      char = getIdentifierPart();

      if (char === null) {
        break;
      }

      id += char;
    }

    switch (id) {
    case "true":
    case "false":
      type = Token.BooleanLiteral;
      break;
    case "null":
      type = Token.NullLiteral;
      break;
    default:
      type = Token.Identifier;
    }

    return {
      type: type,
      value: id
    };
  },

  /*
   * Extract a numeric literal out of the next sequence of
   * characters or return 'null' if its not possible. This method
   * supports all numeric literals described in section 7.8.3
   * of the EcmaScript 5 specification.
   *
   * This method's implementation was heavily influenced by the
   * scanNumericLiteral function in the Esprima parser's source code.
   */
  scanNumericLiteral: function () {
    var index = 0;
    var value = "";
    var length = this.input.length;
    var char = this.peek(index);
    var bad;

    function isDecimalDigit(str) {
      return (/^[0-9]$/).test(str);
    }

    function isOctalDigit(str) {
      return (/^[0-7]$/).test(str);
    }

    function isHexDigit(str) {
      return (/^[0-9a-fA-F]$/).test(str);
    }

    function isIdentifierStart(ch) {
      return (ch === "$") || (ch === "_") || (ch === "\\") ||
        (ch >= "a" && ch <= "z") || (ch >= "A" && ch <= "Z");
    }

    // Numbers must start either with a decimal digit or a point.

    if (char !== "." && !isDecimalDigit(char)) {
      return null;
    }

    if (char !== ".") {
      value = this.peek(index);
      index += 1;
      char = this.peek(index);

      if (value === "0") {
        // Base-16 numbers.
        if (char === "x" || char === "X") {
          index += 1;
          value += char;

          while (index < length) {
            char = this.peek(index);
            if (!isHexDigit(char)) {
              break;
            }
            value += char;
            index += 1;
          }

          if (value.length <= 2) { // 0x
            return {
              type: Token.NumericLiteral,
              value: value,
              isMalformed: true
            };
          }

          if (index < length) {
            char = this.peek(index);
            if (isIdentifierStart(char)) {
              return null;
            }
          }

          return {
            type: Token.NumericLiteral,
            value: value,
            base: 16,
            isMalformed: false
          };
        }

        // Base-8 numbers.
        if (isOctalDigit(char)) {
          index += 1;
          value += char;
          bad = false;

          while (index < length) {
            char = this.peek(index);

            // Numbers like '019' (note the 9) are not valid octals
            // but we still parse them and mark as malformed.

            if (isDecimalDigit(char)) {
              bad = true;
            } else if (!isOctalDigit(char)) {
              break;
            }
            value += char;
            index += 1;
          }

          if (index < length) {
            char = this.peek(index);
            if (isIdentifierStart(char)) {
              return null;
            }
          }

          return {
            type: Token.NumericLiteral,
            value: value,
            base: 8,
            isMalformed: false
          };
        }

        // Decimal numbers that start with '0' such as '09' are illegal
        // but we still parse them and return as malformed.

        if (isDecimalDigit(char)) {
          index += 1;
          value += char;
        }
      }

      while (index < length) {
        char = this.peek(index);
        if (!isDecimalDigit(char)) {
          break;
        }
        value += char;
        index += 1;
      }
    }

    // Decimal digits.

    if (char === ".") {
      value += char;
      index += 1;

      while (index < length) {
        char = this.peek(index);
        if (!isDecimalDigit(char)) {
          break;
        }
        value += char;
        index += 1;
      }
    }

    // Exponent part.

    if (char === "e" || char === "E") {
      value += char;
      index += 1;
      char = this.peek(index);

      if (char === "+" || char === "-") {
        value += this.peek(index);
        index += 1;
      }

      char = this.peek(index);
      if (isDecimalDigit(char)) {
        value += char;
        index += 1;

        while (index < length) {
          char = this.peek(index);
          if (!isDecimalDigit(char)) {
            break;
          }
          value += char;
          index += 1;
        }
      } else {
        return null;
      }
    }

    if (index < length) {
      char = this.peek(index);
      if (isIdentifierStart(char)) {
        return null;
      }
    }

    return {
      type: Token.NumericLiteral,
      value: value,
      base: 10,
      isMalformed: !isFinite(value)
    };
  },

  /*
   * Extract a string out of the next sequence of characters and/or
   * lines or return 'null' if its not possible. Since strings can
   * span across multiple lines this method has to move the char
   * pointer.
   *
   * This method recognizes pseudo-multiline JavaScript strings:
   *
   *   var str = "hello\
   *   world";
   */
  scanStringLiteral: function (checks) {
    /*jshint loopfunc:true */
    var quote = this.peek();

    // String must start with a quote.
    if (quote !== "\"" && quote !== "'") {
      return null;
    }

    // In JSON strings must always use double quotes.
    this.triggerAsync("warning", {
      code: "W108",
      line: this.line,
      character: this.char // +1?
    }, checks, function () { return state.jsonMode && quote !== "\""; });

    var value = "";
    var startLine = this.line;
    var startChar = this.char;
    var allowNewLine = false;

    this.skip();

    while (this.peek() !== quote) {
      while (this.peek() === "") { // End Of Line

        // If an EOL is not preceded by a backslash, show a warning
        // and proceed like it was a legit multi-line string where
        // author simply forgot to escape the newline symbol.
        //
        // Another approach is to implicitly close a string on EOL
        // but it generates too many false positives.

        if (!allowNewLine) {
          this.trigger("warning", {
            code: "W112",
            line: this.line,
            character: this.char
          });
        } else {
          allowNewLine = false;

          // Otherwise show a warning if multistr option was not set.
          // For JSON, show warning no matter what.

          this.triggerAsync("warning", {
            code: "W043",
            line: this.line,
            character: this.char
          }, checks, function () { return !state.option.multistr; });

          this.triggerAsync("warning", {
            code: "W042",
            line: this.line,
            character: this.char
          }, checks, function () { return state.jsonMode && state.option.multistr; });
        }

        // If we get an EOF inside of an unclosed string, show an
        // error and implicitly close it at the EOF point.

        if (!this.nextLine()) {
          this.trigger("error", {
            code: "E029",
            line: startLine,
            character: startChar
          });

          return {
            type: Token.StringLiteral,
            value: value,
            isUnclosed: true,
            quote: quote
          };
        }
      }

      allowNewLine = false;
      var char = this.peek();
      var jump = 1; // A length of a jump, after we're done
                    // parsing this character.

      if (char < " ") {
        // Warn about a control character in a string.
        this.trigger("warning", {
          code: "W113",
          line: this.line,
          character: this.char,
          data: [ "<non-printable>" ]
        });
      }

      // Special treatment for some escaped characters.

      if (char === "\\") {
        this.skip();
        char = this.peek();

        switch (char) {
        case "'":
          this.triggerAsync("warning", {
            code: "W114",
            line: this.line,
            character: this.char,
            data: [ "\\'" ]
          }, checks, function () {return state.jsonMode; });
          break;
        case "b":
          char = "\b";
          break;
        case "f":
          char = "\f";
          break;
        case "n":
          char = "\n";
          break;
        case "r":
          char = "\r";
          break;
        case "t":
          char = "\t";
          break;
        case "0":
          char = "\0";

          // Octal literals fail in strict mode.
          // Check if the number is between 00 and 07.
          var n = parseInt(this.peek(1), 10);
          this.triggerAsync("warning", {
            code: "W115",
            line: this.line,
            character: this.char
          }, checks,
          function () { return n >= 0 && n <= 7 && state.directive["use strict"]; });
          break;
        case "u":
          char = String.fromCharCode(parseInt(this.input.substr(1, 4), 16));
          jump = 5;
          break;
        case "v":
          this.triggerAsync("warning", {
            code: "W114",
            line: this.line,
            character: this.char,
            data: [ "\\v" ]
          }, checks, function () { return state.jsonMode; });

          char = "\v";
          break;
        case "x":
          var x = parseInt(this.input.substr(1, 2), 16);

          this.triggerAsync("warning", {
            code: "W114",
            line: this.line,
            character: this.char,
            data: [ "\\x-" ]
          }, checks, function () { return state.jsonMode; });

          char = String.fromCharCode(x);
          jump = 3;
          break;
        case "\\":
        case "\"":
        case "/":
          break;
        case "":
          allowNewLine = true;
          char = "";
          break;
        case "!":
          if (value.slice(value.length - 2) === "<") {
            break;
          }

          /*falls through */
        default:
          // Weird escaping.
          this.trigger("warning", {
            code: "W044",
            line: this.line,
            character: this.char
          });
        }
      }

      value += char;
      this.skip(jump);
    }

    this.skip();
    return {
      type: Token.StringLiteral,
      value: value,
      isUnclosed: false,
      quote: quote
    };
  },

  /*
   * Extract a regular expression out of the next sequence of
   * characters and/or lines or return 'null' if its not possible.
   *
   * This method is platform dependent: it accepts almost any
   * regular expression values but then tries to compile and run
   * them using system's RegExp object. This means that there are
   * rare edge cases where one JavaScript engine complains about
   * your regular expression while others don't.
   */
  scanRegExp: function () {
    var index = 0;
    var length = this.input.length;
    var char = this.peek();
    var value = char;
    var body = "";
    var flags = [];
    var malformed = false;
    var isCharSet = false;
    var terminated;

    var scanUnexpectedChars = function () {
      // Unexpected control character
      if (char < " ") {
        malformed = true;
        this.trigger("warning", {
          code: "W048",
          line: this.line,
          character: this.char
        });
      }

      // Unexpected escaped character
      if (char === "<") {
        malformed = true;
        this.trigger("warning", {
          code: "W049",
          line: this.line,
          character: this.char,
          data: [ char ]
        });
      }
    }.bind(this);

    // Regular expressions must start with '/'
    if (!this.prereg || char !== "/") {
      return null;
    }

    index += 1;
    terminated = false;

    // Try to get everything in between slashes. A couple of
    // cases aside (see scanUnexpectedChars) we don't really
    // care whether the resulting expression is valid or not.
    // We will check that later using the RegExp object.

    while (index < length) {
      char = this.peek(index);
      value += char;
      body += char;

      if (isCharSet) {
        if (char === "]") {
          if (this.peek(index - 1) !== "\\" || this.peek(index - 2) === "\\") {
            isCharSet = false;
          }
        }

        if (char === "\\") {
          index += 1;
          char = this.peek(index);
          body += char;
          value += char;

          scanUnexpectedChars();
        }

        index += 1;
        continue;
      }

      if (char === "\\") {
        index += 1;
        char = this.peek(index);
        body += char;
        value += char;

        scanUnexpectedChars();

        if (char === "/") {
          index += 1;
          continue;
        }

        if (char === "[") {
          index += 1;
          continue;
        }
      }

      if (char === "[") {
        isCharSet = true;
        index += 1;
        continue;
      }

      if (char === "/") {
        body = body.substr(0, body.length - 1);
        terminated = true;
        index += 1;
        break;
      }

      index += 1;
    }

    // A regular expression that was never closed is an
    // error from which we cannot recover.

    if (!terminated) {
      this.trigger("error", {
        code: "E015",
        line: this.line,
        character: this.from
      });

      return void this.trigger("fatal", {
        line: this.line,
        from: this.from
      });
    }

    // Parse flags (if any).

    while (index < length) {
      char = this.peek(index);
      if (!/[gim]/.test(char)) {
        break;
      }
      flags.push(char);
      value += char;
      index += 1;
    }

    // Check regular expression for correctness.

    try {
      new RegExp(body, flags.join(""));
    } catch (err) {
      malformed = true;
      this.trigger("error", {
        code: "E016",
        line: this.line,
        character: this.char,
        data: [ err.message ] // Platform dependent!
      });
    }

    return {
      type: Token.RegExp,
      value: value,
      flags: flags,
      isMalformed: malformed
    };
  },

  /*
   * Scan for any occurence of mixed tabs and spaces. If smarttabs option
   * is on, ignore tabs followed by spaces.
   *
   * Tabs followed by one space followed by a block comment are allowed.
   */
  scanMixedSpacesAndTabs: function () {
    var at, match;

    if (state.option.smarttabs) {
      // Negative look-behind for "//"
      match = this.input.match(/(\/\/|^\s?\*)? \t/);
      at = match && !match[1] ? 0 : -1;
    } else {
      at = this.input.search(/ \t|\t [^\*]/);
    }

    return at;
  },

  /*
   * Scan for characters that get silently deleted by one or more browsers.
   */
  scanUnsafeChars: function () {
    return this.input.search(reg.unsafeChars);
  },

  /*
   * Produce the next raw token or return 'null' if no tokens can be matched.
   * This method skips over all space characters.
   */
  next: function (checks) {
    this.from = this.char;

    // Move to the next non-space character.
    var start;
    if (/\s/.test(this.peek())) {
      start = this.char;

      while (/\s/.test(this.peek())) {
        this.from += 1;
        this.skip();
      }

      if (this.peek() === "") { // EOL
        if (!/^\s*$/.test(this.getLines()[this.line - 1]) && state.option.trailing) {
          this.trigger("warning", { code: "W102", line: this.line, character: start });
        }
      }
    }

    // Methods that work with multi-line structures and move the
    // character pointer.

    var match = this.scanComments() ||
      this.scanStringLiteral(checks);

    if (match) {
      return match;
    }

    // Methods that don't move the character pointer.

    match =
      this.scanRegExp() ||
      this.scanPunctuator() ||
      this.scanKeyword() ||
      this.scanIdentifier() ||
      this.scanNumericLiteral();

    if (match) {
      this.skip(match.value.length);
      return match;
    }

    // No token could be matched, give up.

    return null;
  },

  /*
   * Switch to the next line and reset all char pointers. Once
   * switched, this method also checks for mixed spaces and tabs
   * and other minor warnings.
   */
  nextLine: function () {
    var char;

    if (this.line >= this.getLines().length) {
      return false;
    }

    this.input = this.getLines()[this.line];
    this.line += 1;
    this.char = 1;
    this.from = 1;

    char = this.scanMixedSpacesAndTabs();
    if (char >= 0) {
      this.trigger("warning", { code: "W099", line: this.line, character: char + 1 });
    }

    this.input = this.input.replace(/\t/g, state.tab);
    char = this.scanUnsafeChars();

    if (char >= 0) {
      this.trigger("warning", { code: "W100", line: this.line, character: char });
    }

    // If there is a limit on line length, warn when lines get too
    // long.

    if (state.option.maxlen && state.option.maxlen < this.input.length) {
      this.trigger("warning", { code: "W101", line: this.line, character: this.input.length });
    }

    return true;
  },

  /*
   * This is simply a synonym for nextLine() method with a friendlier
   * public name.
   */
  start: function () {
    this.nextLine();
  },

  /*
   * Produce the next token. This function is called by advance() to get
   * the next token. It retuns a token in a JSLint-compatible format.
   */
  token: function () {
    /*jshint loopfunc:true */
    var checks = asyncTrigger();
    var token;


    function isReserved(token, isProperty) {
      if (!token.reserved) {
        return false;
      }
      var meta = token.meta;

      if (meta && meta.isFutureReservedWord && state.option.inES5()) {
        // ES3 FutureReservedWord in an ES5 environment.
        if (!meta.es5) {
          return false;
        }

        // Some ES5 FutureReservedWord identifiers are active only
        // within a strict mode environment.
        if (meta.strictOnly) {
          if (!state.option.strict && !state.directive["use strict"]) {
            return false;
          }
        }

        if (isProperty) {
          return false;
        }
      }

      return true;
    }

    // Produce a token object.
    var create = function (type, value, isProperty) {
      /*jshint validthis:true */
      var obj;

      if (type !== "(endline)" && type !== "(end)") {
        this.prereg = false;
      }

      if (type === "(punctuator)") {
        switch (value) {
        case ".":
        case ")":
        case "~":
        case "#":
        case "]":
          this.prereg = false;
          break;
        default:
          this.prereg = true;
        }

        obj = Object.create(state.syntax[value] || state.syntax["(error)"]);
      }

      if (type === "(identifier)") {
        if (value === "return" || value === "case" || value === "typeof") {
          this.prereg = true;
        }

        if (state.syntax.hasOwnProperty(value)) {
          obj = Object.create(state.syntax[value] || state.syntax["(error)"]);

          // If this can't be a reserved keyword, reset the object.
          if (!isReserved(obj, isProperty && type === "(identifier)")) {
            obj = null;
          }
        }
      }

      if (!obj) {
        obj = Object.create(state.syntax[type]);
      }

      obj.identifier = (type === "(identifier)");
      obj.type = obj.type || type;
      obj.value = value;
      obj.line = this.line;
      obj.character = this.char;
      obj.from = this.from;

      if (isProperty && obj.identifier) {
        obj.isProperty = isProperty;
      }

      obj.check = checks.check;

      return obj;
    }.bind(this);

    for (;;) {
      if (!this.input.length) {
        return create(this.nextLine() ? "(endline)" : "(end)", "");
      }

      token = this.next(checks);

      if (!token) {
        if (this.input.length) {
          // Unexpected character.
          this.trigger("error", {
            code: "E024",
            line: this.line,
            character: this.char,
            data: [ this.peek() ]
          });

          this.input = "";
        }

        continue;
      }

      switch (token.type) {
      case Token.StringLiteral:
        this.triggerAsync("String", {
          line: this.line,
          char: this.char,
          from: this.from,
          value: token.value,
          quote: token.quote
        }, checks, function () { return true; });

        return create("(string)", token.value);
      case Token.Identifier:
        this.trigger("Identifier", {
          line: this.line,
          char: this.char,
          from: this.form,
          name: token.value,
          isProperty: state.tokens.curr.id === "."
        });

        /* falls through */
      case Token.Keyword:
      case Token.NullLiteral:
      case Token.BooleanLiteral:
        return create("(identifier)", token.value, state.tokens.curr.id === ".");

      case Token.NumericLiteral:
        if (token.isMalformed) {
          this.trigger("warning", {
            code: "W045",
            line: this.line,
            character: this.char,
            data: [ token.value ]
          });
        }

        this.triggerAsync("warning", {
          code: "W114",
          line: this.line,
          character: this.char,
          data: [ "0x-" ]
        }, checks, function () { return token.base === 16 && state.jsonMode; });

        this.triggerAsync("warning", {
          code: "W115",
          line: this.line,
          character: this.char
        }, checks, function () {
          return state.directive["use strict"] && token.base === 8;
        });

        this.trigger("Number", {
          line: this.line,
          char: this.char,
          from: this.from,
          value: token.value,
          base: token.base,
          isMalformed: token.malformed
        });

        return create("(number)", token.value);

      case Token.RegExp:
        return create("(regexp)", token.value);

      case Token.Comment:
        state.tokens.curr.comment = true;

        if (token.isSpecial) {
          return {
            id: '(comment)',
            value: token.value,
            body: token.body,
            type: token.commentType,
            isSpecial: token.isSpecial,
            line: this.line,
            character: this.char,
            from: this.from
          };
        }

        break;

      case "":
        break;

      default:
        return create("(punctuator)", token.value);
      }
    }
  }
};

exports.Lexer = Lexer;

})()
},{"events":2,"./reg.js":5,"./state.js":6}],"jshint":[function(require,module,exports){
module.exports=require('FD4Lxs');
},{}],"FD4Lxs":[function(require,module,exports){
(function(){/*!
 * JSHint, by JSHint Community.
 *
 * This file (and this file only) is licensed under the same slightly modified
 * MIT license that JSLint is. It stops evil-doers everywhere:
 *
 *   Copyright (c) 2002 Douglas Crockford  (www.JSLint.com)
 *
 *   Permission is hereby granted, free of charge, to any person obtaining
 *   a copy of this software and associated documentation files (the "Software"),
 *   to deal in the Software without restriction, including without limitation
 *   the rights to use, copy, modify, merge, publish, distribute, sublicense,
 *   and/or sell copies of the Software, and to permit persons to whom
 *   the Software is furnished to do so, subject to the following conditions:
 *
 *   The above copyright notice and this permission notice shall be included
 *   in all copies or substantial portions of the Software.
 *
 *   The Software shall be used for Good, not Evil.
 *
 *   THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 *   IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 *   FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 *   AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 *   LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 *   FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
 *   DEALINGS IN THE SOFTWARE.
 *
 */

/*jshint quotmark:double */
/*global console:true */
/*exported console */

var events   = require("events");
var vars     = require("./vars.js");
var messages = require("./messages.js");
var Lexer    = require("./lex.js").Lexer;
var reg      = require("./reg.js");
var state    = require("./state.js").state;
var style    = require("./style.js");

// We need this module here because environments such as IE and Rhino
// don't necessarilly expose the 'console' API and browserify uses
// it to log things. It's a sad state of affair, really.
var console = require("console-browserify");

// We build the application inside a function so that we produce only a singleton
// variable. That function will be invoked immediately, and its return value is
// the JSHINT function itself.

var JSHINT = (function () {
  "use strict";

  var anonname, // The guessed name for anonymous functions.
    api, // Extension API

    // These are operators that should not be used with the ! operator.
    bang = {
      "<"  : true,
      "<=" : true,
      "==" : true,
      "===": true,
      "!==": true,
      "!=" : true,
      ">"  : true,
      ">=" : true,
      "+"  : true,
      "-"  : true,
      "*"  : true,
      "/"  : true,
      "%"  : true
    },

    // These are the JSHint boolean options.
    boolOptions = {
      asi         : true, // if automatic semicolon insertion should be tolerated
      bitwise     : true, // if bitwise operators should not be allowed
      boss        : true, // if advanced usage of assignments should be allowed
      browser     : true, // if the standard browser globals should be predefined
      camelcase   : true, // if identifiers should be required in camel case
      couch       : true, // if CouchDB globals should be predefined
      curly       : true, // if curly braces around all blocks should be required
      debug       : true, // if debugger statements should be allowed
      devel       : true, // if logging globals should be predefined (console, alert, etc.)
      dojo        : true, // if Dojo Toolkit globals should be predefined
      eqeqeq      : true, // if === should be required
      eqnull      : true, // if == null comparisons should be tolerated
      es3         : true, // if ES3 syntax should be allowed
      es5         : true, // if ES5 syntax should be allowed (is now set per default)
      esnext      : true, // if es.next specific syntax should be allowed
      moz         : true, // if mozilla specific syntax should be allowed
      evil        : true, // if eval should be allowed
      expr        : true, // if ExpressionStatement should be allowed as Programs
      forin       : true, // if for in statements must filter
      funcscope   : true, // if only function scope should be used for scope tests
      gcl         : true, // if JSHint should be compatible with Google Closure Linter
      globalstrict: true, // if global "use strict"; should be allowed (also enables 'strict')
      immed       : true, // if immediate invocations must be wrapped in parens
      iterator    : true, // if the `__iterator__` property should be allowed
      jquery      : true, // if jQuery globals should be predefined
      lastsemic   : true, // if semicolons may be ommitted for the trailing
                          // statements inside of a one-line blocks.
      laxbreak    : true, // if line breaks should not be checked
      laxcomma    : true, // if line breaks should not be checked around commas
      loopfunc    : true, // if functions should be allowed to be defined within
                          // loops
      mootools    : true, // if MooTools globals should be predefined
      multistr    : true, // allow multiline strings
      newcap      : true, // if constructor names must be capitalized
      noarg       : true, // if arguments.caller and arguments.callee should be
                          // disallowed
      node        : true, // if the Node.js environment globals should be
                          // predefined
      noempty     : true, // if empty blocks should be disallowed
      nonew       : true, // if using `new` for side-effects should be disallowed
      nonstandard : true, // if non-standard (but widely adopted) globals should
                          // be predefined
      nomen       : true, // if names should be checked
      onevar      : true, // if only one var statement per function should be
                          // allowed
      passfail    : true, // if the scan should stop on first error
      phantom     : true, // if PhantomJS symbols should be allowed
      plusplus    : true, // if increment/decrement should not be allowed
      proto       : true, // if the `__proto__` property should be allowed
      prototypejs : true, // if Prototype and Scriptaculous globals should be
                          // predefined
      rhino       : true, // if the Rhino environment globals should be predefined
      shelljs     : true, // if ShellJS globals should be predefined
      typed       : true, // if typed array globals should be predefined
      undef       : true, // if variables should be declared before used
      scripturl   : true, // if script-targeted URLs should be tolerated
      shadow      : true, // if variable shadowing should be tolerated
      smarttabs   : true, // if smarttabs should be tolerated
                          // (http://www.emacswiki.org/emacs/SmartTabs)
      strict      : true, // require the "use strict"; pragma
      sub         : true, // if all forms of subscript notation are tolerated
      supernew    : true, // if `new function () { ... };` and `new Object;`
                          // should be tolerated
      trailing    : true, // if trailing whitespace rules apply
      validthis   : true, // if 'this' inside a non-constructor function is valid.
                          // This is a function scoped option only.
      withstmt    : true, // if with statements should be allowed
      white       : true, // if strict whitespace rules apply
      worker      : true, // if Web Worker script symbols should be allowed
      wsh         : true, // if the Windows Scripting Host environment globals
                          // should be predefined
      yui         : true, // YUI variables should be predefined

      // Obsolete options
      onecase     : true, // if one case switch statements should be allowed
      regexp      : true, // if the . should not be allowed in regexp literals
      regexdash   : true  // if unescaped first/last dash (-) inside brackets
                          // should be tolerated
    },

    // These are the JSHint options that can take any value
    // (we use this object to detect invalid options)
    valOptions = {
      maxlen       : false,
      indent       : false,
      maxerr       : false,
      predef       : false,
      quotmark     : false, //'single'|'double'|true
      scope        : false,
      maxstatements: false, // {int} max statements per function
      maxdepth     : false, // {int} max nested block depth per function
      maxparams    : false, // {int} max params per function
      maxcomplexity: false, // {int} max cyclomatic complexity per function
      unused       : true,  // warn if variables are unused. Available options:
                            //   false    - don't check for unused variables
                            //   true     - "vars" + check last function param
                            //   "vars"   - skip checking unused function params
                            //   "strict" - "vars" + check all function params
      latedef      : false  // warn if the variable is used before its definition
                            //   false    - don't emit any warnings
                            //   true     - warn if any variable is used before its definition
                            //   "nofunc" - warn for any variable but function declarations
    },

    // These are JSHint boolean options which are shared with JSLint
    // where the definition in JSHint is opposite JSLint
    invertedOptions = {
      bitwise : true,
      forin   : true,
      newcap  : true,
      nomen   : true,
      plusplus: true,
      regexp  : true,
      undef   : true,
      white   : true,

      // Inverted and renamed, use JSHint name here
      eqeqeq  : true,
      onevar  : true,
      strict  : true
    },

    // These are JSHint boolean options which are shared with JSLint
    // where the name has been changed but the effect is unchanged
    renamedOptions = {
      eqeq   : "eqeqeq",
      vars   : "onevar",
      windows: "wsh",
      sloppy : "strict"
    },

    declared, // Globals that were declared using /*global ... */ syntax.
    exported, // Variables that are used outside of the current file.

    functionicity = [
      "closure", "exception", "global", "label",
      "outer", "unused", "var"
    ],

    funct, // The current function
    functions, // All of the functions

    global, // The global scope
    implied, // Implied globals
    inblock,
    indent,
    lookahead,
    lex,
    member,
    membersOnly,
    noreach,
    predefined,   // Global variables defined by option

    scope,  // The current scope
    stack,
    unuseds,
    urls,
    warnings,

    extraModules = [],
    emitter = new events.EventEmitter(),
        
    hasOwnProperty = Object.prototype.hasOwnProperty,
    _ = {};

  _.has = function(obj, key) {
    return hasOwnProperty.call(obj, key);
  };

  _.contains = function(obj, target) {
    if (obj === null || obj === undefined) {
      return false;
    }
    return obj.indexOf(target) !== -1;
  };

  function checkOption(name, t) {
    name = name.trim();

    if (/^[+-]W\d{3}$/g.test(name)) {
      return true;
    }

    if (valOptions[name] === undefined && boolOptions[name] === undefined) {
      if (t.type !== "jslint") {
        error("E001", t, name);
        return false;
      }
    }

    return true;
  }

  function isString(obj) {
    return Object.prototype.toString.call(obj) === "[object String]";
  }

  function isIdentifier(tkn, value) {
    if (!tkn)
      return false;

    if (!tkn.identifier || tkn.value !== value)
      return false;

    return true;
  }

  function isReserved(token) {
    if (!token.reserved) {
      return false;
    }
    var meta = token.meta;

    if (meta && meta.isFutureReservedWord && state.option.inES5()) {
      // ES3 FutureReservedWord in an ES5 environment.
      if (!meta.es5) {
        return false;
      }

      // Some ES5 FutureReservedWord identifiers are active only
      // within a strict mode environment.
      if (meta.strictOnly) {
        if (!state.option.strict && !state.directive["use strict"]) {
          return false;
        }
      }

      if (token.isProperty) {
        return false;
      }
    }

    return true;
  }

  function supplant(str, data) {
    return str.replace(/\{([^{}]*)\}/g, function (a, b) {
      var r = data[b];
      return typeof r === "string" || typeof r === "number" ? r : a;
    });
  }

  function combine(t, o) {
    var n;
    for (n in o) {
      if (_.has(o, n) && !_.has(JSHINT.blacklist, n)) {
        t[n] = o[n];
      }
    }
  }

  function updatePredefined() {
    Object.keys(JSHINT.blacklist).forEach(function (key) {
      delete predefined[key];
    });
  }

  function assume() {
    if (state.option.es5) {
      warning("I003");
    }
    if (state.option.couch) {
      combine(predefined, vars.couch);
    }

    if (state.option.rhino) {
      combine(predefined, vars.rhino);
    }

    if (state.option.shelljs) {
      combine(predefined, vars.shelljs);
      combine(predefined, vars.node);
    }
    if (state.option.typed) {
      combine(predefined, vars.typed);
    }

    if (state.option.phantom) {
      combine(predefined, vars.phantom);
    }

    if (state.option.prototypejs) {
      combine(predefined, vars.prototypejs);
    }

    if (state.option.node) {
      combine(predefined, vars.node);
      combine(predefined, vars.typed);
    }

    if (state.option.devel) {
      combine(predefined, vars.devel);
    }

    if (state.option.dojo) {
      combine(predefined, vars.dojo);
    }

    if (state.option.browser) {
      combine(predefined, vars.browser);
      combine(predefined, vars.typed);
    }

    if (state.option.nonstandard) {
      combine(predefined, vars.nonstandard);
    }

    if (state.option.jquery) {
      combine(predefined, vars.jquery);
    }

    if (state.option.mootools) {
      combine(predefined, vars.mootools);
    }

    if (state.option.worker) {
      combine(predefined, vars.worker);
    }

    if (state.option.wsh) {
      combine(predefined, vars.wsh);
    }

    if (state.option.globalstrict && state.option.strict !== false) {
      state.option.strict = true;
    }

    if (state.option.yui) {
      combine(predefined, vars.yui);
    }

    // Let's assume that chronologically ES3 < ES5 < ES6/ESNext < Moz

    state.option.inMoz = function (strict) {
      if (strict) {
        return state.option.moz && !state.option.esnext;
      }
      return state.option.moz;
    };

    state.option.inESNext = function (strict) {
      if (strict) {
        return !state.option.moz && state.option.esnext;
      }
      return state.option.moz || state.option.esnext;
    };

    state.option.inES5 = function (/* strict */) {
      return !state.option.es3;
    };

    state.option.inES3 = function (strict) {
      if (strict) {
        return !state.option.moz && !state.option.esnext && state.option.es3;
      }
      return state.option.es3;
    };
  }

  // Produce an error warning.
  function quit(code, line, chr) {
    var percentage = Math.floor((line / state.lines.length) * 100);
    var message = messages.errors[code].desc;

    throw {
      name: "JSHintError",
      line: line,
      character: chr,
      message: message + " (" + percentage + "% scanned).",
      raw: message,
      code: code
    };
  }

  function isundef(scope, code, token, a) {
    return JSHINT.undefs.push([scope, code, token, a]);
  }

  function warning(code, t, a, b, c, d) {
    var ch, l, w, msg;

    if (/^W\d{3}$/.test(code)) {
      if (state.ignored[code])
        return;

      msg = messages.warnings[code];
    } else if (/E\d{3}/.test(code)) {
      msg = messages.errors[code];
    } else if (/I\d{3}/.test(code)) {
      msg = messages.info[code];
    }

    t = t || state.tokens.next;
    if (t.id === "(end)") {  // `~
      t = state.tokens.curr;
    }

    l = t.line || 0;
    ch = t.from || 0;

    w = {
      id: "(error)",
      raw: msg.desc,
      code: msg.code,
      evidence: state.lines[l - 1] || "",
      line: l,
      character: ch,
      scope: JSHINT.scope,
      a: a,
      b: b,
      c: c,
      d: d
    };

    w.reason = supplant(msg.desc, w);
    JSHINT.errors.push(w);

    if (state.option.passfail) {
      quit("E042", l, ch);
    }

    warnings += 1;
    if (warnings >= state.option.maxerr) {
      quit("E043", l, ch);
    }

    return w;
  }

  function warningAt(m, l, ch, a, b, c, d) {
    return warning(m, {
      line: l,
      from: ch
    }, a, b, c, d);
  }

  function error(m, t, a, b, c, d) {
    warning(m, t, a, b, c, d);
  }

  function errorAt(m, l, ch, a, b, c, d) {
    return error(m, {
      line: l,
      from: ch
    }, a, b, c, d);
  }

  // Tracking of "internal" scripts, like eval containing a static string
  function addInternalSrc(elem, src) {
    var i;
    i = {
      id: "(internal)",
      elem: elem,
      value: src
    };
    JSHINT.internals.push(i);
    return i;
  }

  function addlabel(t, type, tkn, islet) {
    // Define t in the current function in the current scope.
    if (type === "exception") {
      if (_.has(funct["(context)"], t)) {
        if (funct[t] !== true && !state.option.node) {
          warning("W002", state.tokens.next, t);
        }
      }
    }

    if (_.has(funct, t) && !funct["(global)"]) {
      if (funct[t] === true) {
        if (state.option.latedef) {
          if ((state.option.latedef === true && _.contains([funct[t], type], "unction")) ||
              !_.contains([funct[t], type], "unction")) {
            warning("W003", state.tokens.next, t);
          }
        }
      } else {
        if (!state.option.shadow && type !== "exception" ||
              (funct["(blockscope)"].getlabel(t))) {
          warning("W004", state.tokens.next, t);
        }
      }
    }

    // a double definition of a let variable in same block throws a TypeError
    if (funct["(blockscope)"] && funct["(blockscope)"].current.has(t)) {
      error("E044", state.tokens.next, t);
    }

    // if the identifier is from a let, adds it only to the current blockscope
    if (islet) {
      funct["(blockscope)"].current.add(t, type, state.tokens.curr);
    } else {

      funct[t] = type;

      if (tkn) {
        funct["(tokens)"][t] = tkn;
      }

      if (funct["(global)"]) {
        global[t] = funct;
        if (_.has(implied, t)) {
          if (state.option.latedef) {
            if ((state.option.latedef === true && _.contains([funct[t], type], "unction")) ||
                !_.contains([funct[t], type], "unction")) {
              warning("W003", state.tokens.next, t);
            }
          }

          delete implied[t];
        }
      } else {
        scope[t] = funct;
      }
    }
  }

  function doOption() {
    var nt = state.tokens.next;
    var body = nt.body.split(",").map(function (s) { return s.trim(); });
    var predef = {};

    if (nt.type === "globals") {
      body.forEach(function (g) {
        g = g.split(":");
        var key = (g[0] || "").trim();
        var val = (g[1] || "").trim();

        if (key.charAt(0) === "-") {
          key = key.slice(1);
          val = false;

          JSHINT.blacklist[key] = key;
          updatePredefined();
        } else {
          predef[key] = (val === "true");
        }
      });

      combine(predefined, predef);

      for (var key in predef) {
        if (_.has(predef, key)) {
          declared[key] = nt;
        }
      }
    }

    if (nt.type === "exported") {
      body.forEach(function (e) {
        exported[e] = true;
      });
    }

    if (nt.type === "members") {
      membersOnly = membersOnly || {};

      body.forEach(function (m) {
        var ch1 = m.charAt(0);
        var ch2 = m.charAt(m.length - 1);

        if (ch1 === ch2 && (ch1 === "\"" || ch1 === "'")) {
          m = m
            .substr(1, m.length - 2)
            .replace("\\b", "\b")
            .replace("\\t", "\t")
            .replace("\\n", "\n")
            .replace("\\v", "\v")
            .replace("\\f", "\f")
            .replace("\\r", "\r")
            .replace("\\\\", "\\")
            .replace("\\\"", "\"");
        }

        membersOnly[m] = false;
      });
    }

    var numvals = [
      "maxstatements",
      "maxparams",
      "maxdepth",
      "maxcomplexity",
      "maxerr",
      "maxlen",
      "indent"
    ];

    if (nt.type === "jshint" || nt.type === "jslint") {
      body.forEach(function (g) {
        g = g.split(":");
        var key = (g[0] || "").trim();
        var val = (g[1] || "").trim();

        if (!checkOption(key, nt)) {
          return;
        }

        if (numvals.indexOf(key) >= 0) {

          // GH988 - numeric options can be disabled by setting them to `false`
          if (val !== "false") {
            val = +val;

            if (typeof val !== "number" || !isFinite(val) || val <= 0 || Math.floor(val) !== val) {
              error("E032", nt, g[1].trim());
              return;
            }

            if (key === "indent") {
              state.option["(explicitIndent)"] = true;
            }
            state.option[key] = val;
          } else {
            if (key === "indent") {
              state.option["(explicitIndent)"] = false;
            } else {
              state.option[key] = false;
            }
          }

          return;
        }

        if (key === "validthis") {
          // `validthis` is valid only within a function scope.
          if (funct["(global)"]) {
            error("E009");
          } else {
            if (val === "true" || val === "false") {
              state.option.validthis = (val === "true");
            } else {
              error("E002", nt);
            }
          }
          return;
        }

        if (key === "quotmark") {
          switch (val) {
          case "true":
          case "false":
            state.option.quotmark = (val === "true");
            break;
          case "double":
          case "single":
            state.option.quotmark = val;
            break;
          default:
            error("E002", nt);
          }
          return;
        }

        if (key === "unused") {
          switch (val) {
          case "true":
            state.option.unused = true;
            break;
          case "false":
            state.option.unused = false;
            break;
          case "vars":
          case "strict":
            state.option.unused = val;
            break;
          default:
            error("E002", nt);
          }
          return;
        }

        if (key === "latedef") {
          switch (val) {
          case "true":
            state.option.latedef = true;
            break;
          case "false":
            state.option.latedef = false;
            break;
          case "nofunc":
            state.option.latedef = "nofunc";
            break;
          default:
            error("E002", nt);
          }
          return;
        }

        var match = /^([+-])(W\d{3})$/g.exec(key);
        if (match) {
          // ignore for -W..., unignore for +W...
          state.ignored[match[2]] = (match[1] === "-");
          return;
        }

        var tn;
        if (val === "true" || val === "false") {
          if (nt.type === "jslint") {
            tn = renamedOptions[key] || key;
            state.option[tn] = (val === "true");

            if (invertedOptions[tn] !== undefined) {
              state.option[tn] = !state.option[tn];
            }
          } else {
            state.option[key] = (val === "true");
          }

          if (key === "newcap") {
            state.option["(explicitNewcap)"] = true;
          }
          return;
        }

        error("E002", nt);
      });

      assume();
    }
  }

  // We need a peek function. If it has an argument, it peeks that much farther
  // ahead. It is used to distinguish
  //     for ( var i in ...
  // from
  //     for ( var i = ...

  function peek(p) {
    var i = p || 0, j = 0, t;

    while (j <= i) {
      t = lookahead[j];
      if (!t) {
        t = lookahead[j] = lex.token();
      }
      j += 1;
    }
    return t;
  }

  // Produce the next token. It looks for programming errors.

  function advance(id, t) {
    switch (state.tokens.curr.id) {
    case "(number)":
      if (state.tokens.next.id === ".") {
        warning("W005", state.tokens.curr);
      }
      break;
    case "-":
      if (state.tokens.next.id === "-" || state.tokens.next.id === "--") {
        warning("W006");
      }
      break;
    case "+":
      if (state.tokens.next.id === "+" || state.tokens.next.id === "++") {
        warning("W007");
      }
      break;
    }

    if (state.tokens.curr.type === "(string)" || state.tokens.curr.identifier) {
      anonname = state.tokens.curr.value;
    }

    if (id && state.tokens.next.id !== id) {
      if (t) {
        if (state.tokens.next.id === "(end)") {
          error("E019", t, t.id);
        } else {
          error("E020", state.tokens.next, id, t.id, t.line, state.tokens.next.value);
        }
      } else if (state.tokens.next.type !== "(identifier)" || state.tokens.next.value !== id) {
        warning("W116", state.tokens.next, id, state.tokens.next.value);
      }
    }

    state.tokens.prev = state.tokens.curr;
    state.tokens.curr = state.tokens.next;
    for (;;) {
      state.tokens.next = lookahead.shift() || lex.token();

      if (!state.tokens.next) { // No more tokens left, give up
        quit("E041", state.tokens.curr.line);
      }

      if (state.tokens.next.id === "(end)" || state.tokens.next.id === "(error)") {
        return;
      }

      if (state.tokens.next.check) {
        state.tokens.next.check();
      }

      if (state.tokens.next.isSpecial) {
        doOption();
      } else {
        if (state.tokens.next.id !== "(endline)") {
          break;
        }
      }
    }
  }

  function isInfix(token) {
    return token.infix || (!token.identifier && !!token.led);
  }

  function isEndOfExpr() {
    var curr = state.tokens.curr;
    var next = state.tokens.next;
    if (next.id === ";" || next.id === "}" || next.id === ":") {
      return true;
    }
    if (isInfix(next) === isInfix(curr) || (curr.id === "yield" && state.option.inMoz(true))) {
      return curr.line !== next.line;
    }
    return false;
  }

  // This is the heart of JSHINT, the Pratt parser. In addition to parsing, it
  // is looking for ad hoc lint patterns. We add .fud to Pratt's model, which is
  // like .nud except that it is only used on the first token of a statement.
  // Having .fud makes it much easier to define statement-oriented languages like
  // JavaScript. I retained Pratt's nomenclature.

  // .nud  Null denotation
  // .fud  First null denotation
  // .led  Left denotation
  //  lbp  Left binding power
  //  rbp  Right binding power

  // They are elements of the parsing method called Top Down Operator Precedence.

  function expression(rbp, initial) {
    var left, isArray = false, isObject = false, isLetExpr = false;

    // if current expression is a let expression
    if (!initial && state.tokens.next.value === "let" && peek(0).value === "(") {
      if (!state.option.inMoz(true)) {
        warning("W118", state.tokens.next, "let expressions");
      }
      isLetExpr = true;
      // create a new block scope we use only for the current expression
      funct["(blockscope)"].stack();
      advance("let");
      advance("(");
      state.syntax["let"].fud.call(state.syntax["let"].fud, false);
      advance(")");
    }

    if (state.tokens.next.id === "(end)")
      error("E006", state.tokens.curr);

    advance();

    if (initial) {
      anonname = "anonymous";
      funct["(verb)"] = state.tokens.curr.value;
    }

    if (initial === true && state.tokens.curr.fud) {
      left = state.tokens.curr.fud();
    } else {
      if (state.tokens.curr.nud) {
        left = state.tokens.curr.nud();
      } else {
        if (state.tokens.curr.value === ",") {
          error("E052", state.tokens.curr, state.tokens.curr.id);
        } else {
          error("E030", state.tokens.curr, state.tokens.curr.id);
        }
      }

      while (rbp < state.tokens.next.lbp && !isEndOfExpr()) {
        isArray = state.tokens.curr.value === "Array";
        isObject = state.tokens.curr.value === "Object";

        // #527, new Foo.Array(), Foo.Array(), new Foo.Object(), Foo.Object()
        // Line breaks in IfStatement heads exist to satisfy the checkJSHint
        // "Line too long." error.
        if (left && (left.value || (left.first && left.first.value))) {
          // If the left.value is not "new", or the left.first.value is a "."
          // then safely assume that this is not "new Array()" and possibly
          // not "new Object()"...
          if (left.value !== "new" ||
            (left.first && left.first.value && left.first.value === ".")) {
            isArray = false;
            // ...In the case of Object, if the left.value and state.tokens.curr.value
            // are not equal, then safely assume that this not "new Object()"
            if (left.value !== state.tokens.curr.value) {
              isObject = false;
            }
          }
        }

        advance();

        if (isArray && state.tokens.curr.id === "(" && state.tokens.next.id === ")") {
          warning("W009", state.tokens.curr);
        }

        if (isObject && state.tokens.curr.id === "(" && state.tokens.next.id === ")") {
          warning("W010", state.tokens.curr);
        }

        if (left && state.tokens.curr.led) {
          left = state.tokens.curr.led(left);
        } else {
          error("E033", state.tokens.curr, state.tokens.curr.id);
        }
      }
    }
    if (isLetExpr) {
      funct["(blockscope)"].unstack();
    }
    return left;
  }


// Functions for conformance of style.

  function adjacent(left, right) {
    left = left || state.tokens.curr;
    right = right || state.tokens.next;
    if (state.option.white) {
      if (left.character !== right.from && left.line === right.line) {
        left.from += (left.character - left.from);
        warning("W011", left, left.value);
      }
    }
  }

  function nobreak(left, right) {
    left = left || state.tokens.curr;
    right = right || state.tokens.next;
    if (state.option.white && (left.character !== right.from || left.line !== right.line)) {
      warning("W012", right, right.value);
    }
  }

  function nospace(left, right) {
    left = left || state.tokens.curr;
    right = right || state.tokens.next;
    if (state.option.white && !left.comment) {
      if (left.line === right.line) {
        adjacent(left, right);
      }
    }
  }

  function nonadjacent(left, right) {
    if (state.option.white) {
      left = left || state.tokens.curr;
      right = right || state.tokens.next;

      if (left.value === ";" && right.value === ";") {
        return;
      }

      if (left.line === right.line && left.character === right.from) {
        left.from += (left.character - left.from);
        warning("W013", left, left.value);
      }
    }
  }

  function nobreaknonadjacent(left, right) {
    left = left || state.tokens.curr;
    right = right || state.tokens.next;
    if (!state.option.laxbreak && left.line !== right.line) {
      warning("W014", right, right.value);
    } else if (state.option.white) {
      left = left || state.tokens.curr;
      right = right || state.tokens.next;
      if (left.character === right.from) {
        left.from += (left.character - left.from);
        warning("W013", left, left.value);
      }
    }
  }

  function indentation(bias) {
    if (!state.option.white && !state.option["(explicitIndent)"]) {
      return;
    }

    if (state.tokens.next.id === "(end)") {
      return;
    }

    var i = indent + (bias || 0);
    if (state.tokens.next.from !== i) {
      warning("W015", state.tokens.next, state.tokens.next.value, i, state.tokens.next.from);
    }
  }

  function nolinebreak(t) {
    t = t || state.tokens.curr;
    if (t.line !== state.tokens.next.line) {
      warning("E022", t, t.value);
    }
  }

  function nobreakcomma(left, right) {
    if (left.line !== right.line) {
      if (!state.option.laxcomma) {
        if (comma.first) {
          warning("I001");
          comma.first = false;
        }
        warning("W014", left, right.value);
      }
    } else if (!left.comment && left.character !== right.from && state.option.white) {
      left.from += (left.character - left.from);
      warning("W011", left, left.value);
    }
  }

  function comma(opts) {
    opts = opts || {};

    if (!opts.peek) {
      nobreakcomma(state.tokens.curr, state.tokens.next);
      advance(",");
    } else {
      nobreakcomma(state.tokens.prev, state.tokens.curr);
    }

    // TODO: This is a temporary solution to fight against false-positives in
    // arrays and objects with trailing commas (see GH-363). The best solution
    // would be to extract all whitespace rules out of parser.

    if (state.tokens.next.value !== "]" && state.tokens.next.value !== "}") {
      nonadjacent(state.tokens.curr, state.tokens.next);
    }

    if (state.tokens.next.identifier && !(opts.property && state.option.inES5())) {
      // Keywords that cannot follow a comma operator.
      switch (state.tokens.next.value) {
      case "break":
      case "case":
      case "catch":
      case "continue":
      case "default":
      case "do":
      case "else":
      case "finally":
      case "for":
      case "if":
      case "in":
      case "instanceof":
      case "return":
      case "switch":
      case "throw":
      case "try":
      case "var":
      case "let":
      case "while":
      case "with":
        error("E024", state.tokens.next, state.tokens.next.value);
        return false;
      }
    }

    if (state.tokens.next.type === "(punctuator)") {
      switch (state.tokens.next.value) {
      case "}":
      case "]":
      case ",":
        if (opts.allowTrailing) {
          return true;
        }

        /* falls through */
      case ")":
        var errorCode = "E024";
        if (state.tokens.next.value === ")") {
          errorCode = "E053";
        } else if (state.tokens.next.value === ",") {
          errorCode = "E052";
        }
        error(errorCode, state.tokens.next, state.tokens.next.value);
        return false;
      }
    }
    return true;
  }

  // Functional constructors for making the symbols that will be inherited by
  // tokens.

  function symbol(s, p) {
    var x = state.syntax[s];
    if (!x || typeof x !== "object") {
      state.syntax[s] = x = {
        id: s,
        lbp: p,
        value: s
      };
    }
    return x;
  }

  function delim(s) {
    return symbol(s, 0);
  }

  function stmt(s, f) {
    var x = delim(s);
    x.identifier = x.reserved = true;
    x.fud = f;
    return x;
  }

  function blockstmt(s, f) {
    var x = stmt(s, f);
    x.block = true;
    return x;
  }

  function reserveName(x) {
    var c = x.id.charAt(0);
    if ((c >= "a" && c <= "z") || (c >= "A" && c <= "Z")) {
      x.identifier = x.reserved = true;
    }
    return x;
  }

  function prefix(s, f) {
    var x = symbol(s, 150);
    reserveName(x);
    x.nud = (typeof f === "function") ? f : function () {
      this.right = expression(150);
      this.arity = "unary";
      if (this.id === "++" || this.id === "--") {
        if (state.option.plusplus) {
          warning("W016", this, this.id);
        } else if ((!this.right.identifier || isReserved(this.right)) &&
            this.right.id !== "." && this.right.id !== "[") {
          warning("W017", this);
        }
      }
      return this;
    };
    return x;
  }

  function type(s, f) {
    var x = delim(s);
    x.type = s;
    x.nud = f;
    return x;
  }

  function reserve(name, func) {
    var x = type(name, func);
    x.identifier = true;
    x.reserved = true;
    return x;
  }

  function FutureReservedWord(name, meta) {
    var x = type(name, (meta && meta.nud) || function () {
      return this;
    });

    meta = meta || {};
    meta.isFutureReservedWord = true;

    x.value = name;
    x.identifier = true;
    x.reserved = true;
    x.meta = meta;

    return x;
  }

  function reservevar(s, v) {
    return reserve(s, function () {
      if (typeof v === "function") {
        v(this);
      }
      return this;
    });
  }

  function infix(s, f, p, w) {
    var x = symbol(s, p);
    reserveName(x);
    x.infix = true;
    x.led = function (left) {
      if (!w) {
        nobreaknonadjacent(state.tokens.prev, state.tokens.curr);
        nonadjacent(state.tokens.curr, state.tokens.next);
      }
      if (s === "in" && left.id === "!") {
        warning("W018", left, "!");
      }
      if (typeof f === "function") {
        return f(left, this);
      } else {
        this.left = left;
        this.right = expression(p);
        return this;
      }
    };
    return x;
  }


  function application(s) {
    var x = symbol(s, 42);

    x.led = function (left) {
      if (!state.option.inESNext()) {
        warning("W104", state.tokens.curr, "arrow function syntax (=>)");
      }

      nobreaknonadjacent(state.tokens.prev, state.tokens.curr);
      nonadjacent(state.tokens.curr, state.tokens.next);

      this.left = left;
      this.right = doFunction(undefined, undefined, false, left);
      return this;
    };
    return x;
  }

  function relation(s, f) {
    var x = symbol(s, 100);

    x.led = function (left) {
      nobreaknonadjacent(state.tokens.prev, state.tokens.curr);
      nonadjacent(state.tokens.curr, state.tokens.next);
      var right = expression(100);

      if (isIdentifier(left, "NaN") || isIdentifier(right, "NaN")) {
        warning("W019", this);
      } else if (f) {
        f.apply(this, [left, right]);
      }

      if (!left || !right) {
        quit("E041", state.tokens.curr.line);
      }

      if (left.id === "!") {
        warning("W018", left, "!");
      }

      if (right.id === "!") {
        warning("W018", right, "!");
      }

      this.left = left;
      this.right = right;
      return this;
    };
    return x;
  }

  function isPoorRelation(node) {
    return node &&
        ((node.type === "(number)" && +node.value === 0) ||
         (node.type === "(string)" && node.value === "") ||
         (node.type === "null" && !state.option.eqnull) ||
        node.type === "true" ||
        node.type === "false" ||
        node.type === "undefined");
  }

  function assignop(s, f, p) {
    var x = infix(s, typeof f === "function" ? f : function (left, that) {
      that.left = left;

      if (left) {
        if (predefined[left.value] === false &&
            scope[left.value]["(global)"] === true) {
          warning("W020", left);
        } else if (left["function"]) {
          warning("W021", left, left.value);
        }

        if (funct[left.value] === "const") {
          error("E013", left, left.value);
        }

        if (left.id === ".") {
          if (!left.left) {
            warning("E031", that);
          } else if (left.left.value === "arguments" && !state.directive["use strict"]) {
            warning("E031", that);
          }

          that.right = expression(10);
          return that;
        } else if (left.id === "[") {
          if (state.tokens.curr.left.first) {
            state.tokens.curr.left.first.forEach(function (t) {
              if (funct[t.value] === "const") {
                error("E013", t, t.value);
              }
            });
          } else if (!left.left) {
            warning("E031", that);
          } else if (left.left.value === "arguments" && !state.directive["use strict"]) {
            warning("E031", that);
          }
          that.right = expression(10);
          return that;
        } else if (left.identifier && !isReserved(left)) {
          if (funct[left.value] === "exception") {
            warning("W022", left);
          }
          that.right = expression(10);
          return that;
        }

        if (left === state.syntax["function"]) {
          warning("W023", state.tokens.curr);
        }
      }

      error("E031", that);
    }, p);

    x.exps = true;
    x.assign = true;
    return x;
  }


  function bitwise(s, f, p) {
    var x = symbol(s, p);
    reserveName(x);
    x.led = (typeof f === "function") ? f : function (left) {
      if (state.option.bitwise) {
        warning("W016", this, this.id);
      }
      this.left = left;
      this.right = expression(p);
      return this;
    };
    return x;
  }


  function bitwiseassignop(s) {
    return assignop(s, function (left, that) {
      if (state.option.bitwise) {
        warning("W016", that, that.id);
      }
      nonadjacent(state.tokens.prev, state.tokens.curr);
      nonadjacent(state.tokens.curr, state.tokens.next);
      if (left) {
        if (left.id === "." || left.id === "[" ||
            (left.identifier && !isReserved(left))) {
          expression(10);
          return that;
        }
        if (left === state.syntax["function"]) {
          warning("W023", state.tokens.curr);
        }
        return that;
      }
      error("E031", that);
    }, 20);
  }


  function suffix(s) {
    var x = symbol(s, 150);

    x.led = function (left) {
      if (state.option.plusplus) {
        warning("W016", this, this.id);
      } else if ((!left.identifier || isReserved(left)) && left.id !== "." && left.id !== "[") {
        warning("W017", this);
      }

      this.left = left;
      return this;
    };
    return x;
  }

  // fnparam means that this identifier is being defined as a function
  // argument (see identifier())
  // prop means that this identifier is that of an object property

  function optionalidentifier(fnparam, prop) {
    if (!state.tokens.next.identifier) {
      return;
    }

    advance();

    var curr = state.tokens.curr;
    var val  = state.tokens.curr.value;

    if (!isReserved(curr)) {
      return val;
    }

    if (prop) {
      if (state.option.inES5()) {
        return val;
      }
    }

    if (fnparam && val === "undefined") {
      return val;
    }

    // Display an info message about reserved words as properties
    // and ES5 but do it only once.
    if (prop && !api.getCache("displayed:I002")) {
      api.setCache("displayed:I002", true);
      warning("I002");
    }

    warning("W024", state.tokens.curr, state.tokens.curr.id);
    return val;
  }

  // fnparam means that this identifier is being defined as a function
  // argument
  // prop means that this identifier is that of an object property
  function identifier(fnparam, prop) {
    var i = optionalidentifier(fnparam, prop);
    if (i) {
      return i;
    }
    if (state.tokens.curr.id === "function" && state.tokens.next.id === "(") {
      warning("W025");
    } else {
      error("E030", state.tokens.next, state.tokens.next.value);
    }
  }


  function reachable(s) {
    var i = 0, t;
    if (state.tokens.next.id !== ";" || noreach) {
      return;
    }
    for (;;) {
      do {
        t = peek(i);
        i += 1;
      } while (t.id != "(end)" && t.id === "(comment)");

      if (t.reach) {
        return;
      }
      if (t.id !== "(endline)") {
        if (t.id === "function") {
          if (!state.option.latedef) {
            break;
          }

          warning("W026", t);
          break;
        }

        warning("W027", t, t.value, s);
        break;
      }
    }
  }


  function statement(noindent) {
    var values;
    var i = indent, r, s = scope, t = state.tokens.next;

    if (t.id === ";") {
      advance(";");
      return;
    }

    // Is this a labelled statement?
    var res = isReserved(t);

    // We're being more tolerant here: if someone uses
    // a FutureReservedWord as a label, we warn but proceed
    // anyway.

    if (res && t.meta && t.meta.isFutureReservedWord && peek().id === ":") {
      warning("W024", t, t.id);
      res = false;
    }

    // detect a destructuring assignment
    if (_.has(["[", "{"], t.value)) {
      if (lookupBlockType().isDestAssign) {
        if (!state.option.inESNext()) {
          warning("W104", state.tokens.curr, "destructuring expression");
        }
        values = destructuringExpression();
        values.forEach(function (tok) {
          isundef(funct, "W117", tok.token, tok.id);
        });
        advance("=");
        destructuringExpressionMatch(values, expression(10, true));
        advance(";");
        return;
      }
    }
    if (t.identifier && !res && peek().id === ":") {
      advance();
      advance(":");
      scope = Object.create(s);
      addlabel(t.value, "label");

      if (!state.tokens.next.labelled && state.tokens.next.value !== "{") {
        warning("W028", state.tokens.next, t.value, state.tokens.next.value);
      }

      state.tokens.next.label = t.value;
      t = state.tokens.next;
    }

    // Is it a lonely block?

    if (t.id === "{") {
      block(true, true);
      return;
    }

    // Parse the statement.

    if (!noindent) {
      indentation();
    }
    r = expression(0, true);

    // Look for the final semicolon.

    if (!t.block) {
      if (!state.option.expr && (!r || !r.exps)) {
        warning("W030", state.tokens.curr);
      } else if (state.option.nonew && r && r.left && r.id === "(" && r.left.id === "new") {
        warning("W031", t);
      }

      if (state.tokens.next.id !== ";") {
        if (!state.option.asi) {
          // If this is the last statement in a block that ends on
          // the same line *and* option lastsemic is on, ignore the warning.
          // Otherwise, complain about missing semicolon.
          if (!state.option.lastsemic || state.tokens.next.id !== "}" ||
            state.tokens.next.line !== state.tokens.curr.line) {
            warningAt("W033", state.tokens.curr.line, state.tokens.curr.character);
          }
        }
      } else {
        adjacent(state.tokens.curr, state.tokens.next);
        advance(";");
        nonadjacent(state.tokens.curr, state.tokens.next);
      }
    }

    // Restore the indentation.

    indent = i;
    scope = s;
    return r;
  }


  function statements(startLine) {
    var a = [], p;

    while (!state.tokens.next.reach && state.tokens.next.id !== "(end)") {
      if (state.tokens.next.id === ";") {
        p = peek();

        if (!p || (p.id !== "(" && p.id !== "[")) {
          warning("W032");
        }

        advance(";");
      } else {
        a.push(statement(startLine === state.tokens.next.line));
      }
    }
    return a;
  }


  /*
   * read all directives
   * recognizes a simple form of asi, but always
   * warns, if it is used
   */
  function directives() {
    var i, p, pn;

    for (;;) {
      if (state.tokens.next.id === "(string)") {
        p = peek(0);
        if (p.id === "(endline)") {
          i = 1;
          do {
            pn = peek(i);
            i = i + 1;
          } while (pn.id === "(endline)");

          if (pn.id !== ";") {
            if (pn.id !== "(string)" && pn.id !== "(number)" &&
              pn.id !== "(regexp)" && pn.identifier !== true &&
              pn.id !== "}") {
              break;
            }
            warning("W033", state.tokens.next);
          } else {
            p = pn;
          }
        } else if (p.id === "}") {
          // Directive with no other statements, warn about missing semicolon
          warning("W033", p);
        } else if (p.id !== ";") {
          break;
        }

        indentation();
        advance();
        if (state.directive[state.tokens.curr.value]) {
          warning("W034", state.tokens.curr, state.tokens.curr.value);
        }

        if (state.tokens.curr.value === "use strict") {
          if (!state.option["(explicitNewcap)"])
            state.option.newcap = true;
          state.option.undef = true;
        }

        // there's no directive negation, so always set to true
        state.directive[state.tokens.curr.value] = true;

        if (p.id === ";") {
          advance(";");
        }
        continue;
      }
      break;
    }
  }


  /*
   * Parses a single block. A block is a sequence of statements wrapped in
   * braces.
   *
   * ordinary - true for everything but function bodies and try blocks.
   * stmt   - true if block can be a single statement (e.g. in if/for/while).
   * isfunc - true if block is a function body
   */
  function block(ordinary, stmt, isfunc, isfatarrow) {
    var a,
      b = inblock,
      old_indent = indent,
      m,
      s = scope,
      t,
      line,
      d;

    inblock = ordinary;

    if (!ordinary || !state.option.funcscope)
      scope = Object.create(scope);

    nonadjacent(state.tokens.curr, state.tokens.next);
    t = state.tokens.next;

    var metrics = funct["(metrics)"];
    metrics.nestedBlockDepth += 1;
    metrics.verifyMaxNestedBlockDepthPerFunction();

    if (state.tokens.next.id === "{") {
      advance("{");

      // create a new block scope
      funct["(blockscope)"].stack();

      line = state.tokens.curr.line;
      if (state.tokens.next.id !== "}") {
        indent += state.option.indent;
        while (!ordinary && state.tokens.next.from > indent) {
          indent += state.option.indent;
        }

        if (isfunc) {
          m = {};
          for (d in state.directive) {
            if (_.has(state.directive, d)) {
              m[d] = state.directive[d];
            }
          }
          directives();

          if (state.option.strict && funct["(context)"]["(global)"]) {
            if (!m["use strict"] && !state.directive["use strict"]) {
              warning("E007");
            }
          }
        }

        a = statements(line);

        metrics.statementCount += a.length;

        if (isfunc) {
          state.directive = m;
        }

        indent -= state.option.indent;
        if (line !== state.tokens.next.line) {
          indentation();
        }
      } else if (line !== state.tokens.next.line) {
        indentation();
      }
      advance("}", t);

      funct["(blockscope)"].unstack();

      indent = old_indent;
    } else if (!ordinary) {
      if (isfunc) {
        m = {};
        if (stmt && !isfatarrow && !state.option.inMoz(true)) {
          error("W118", state.tokens.curr, "function closure expressions");
        }

        if (!stmt) {
          for (d in state.directive) {
            if (_.has(state.directive, d)) {
              m[d] = state.directive[d];
            }
          }
        }
        expression(10);

        if (state.option.strict && funct["(context)"]["(global)"]) {
          if (!m["use strict"] && !state.directive["use strict"]) {
            warning("E007");
          }
        }
      } else {
        error("E021", state.tokens.next, "{", state.tokens.next.value);
      }
    } else {

      // check to avoid let declaration not within a block
      funct["(nolet)"] = true;

      if (!stmt || state.option.curly) {
        warning("W116", state.tokens.next, "{", state.tokens.next.value);
      }

      noreach = true;
      indent += state.option.indent;
      // test indentation only if statement is in new line
      a = [statement(state.tokens.next.line === state.tokens.curr.line)];
      indent -= state.option.indent;
      noreach = false;

      delete funct["(nolet)"];
    }
    funct["(verb)"] = null;
    if (!ordinary || !state.option.funcscope) scope = s;
    inblock = b;
    if (ordinary && state.option.noempty && (!a || a.length === 0)) {
      warning("W035");
    }
    metrics.nestedBlockDepth -= 1;
    return a;
  }


  function countMember(m) {
    if (membersOnly && typeof membersOnly[m] !== "boolean") {
      warning("W036", state.tokens.curr, m);
    }
    if (typeof member[m] === "number") {
      member[m] += 1;
    } else {
      member[m] = 1;
    }
  }


  function note_implied(tkn) {
    var name = tkn.value, line = tkn.line, a = implied[name];
    if (typeof a === "function") {
      a = false;
    }

    if (!a) {
      a = [line];
      implied[name] = a;
    } else if (a[a.length - 1] !== line) {
      a.push(line);
    }
  }


  // Build the syntax table by declaring the syntactic elements of the language.

  type("(number)", function () {
    return this;
  });

  type("(string)", function () {
    return this;
  });

  state.syntax["(identifier)"] = {
    type: "(identifier)",
    lbp: 0,
    identifier: true,
    nud: function () {
      var v = this.value,
        s = scope[v],
        f;

      if (typeof s === "function") {
        // Protection against accidental inheritance.
        s = undefined;
      } else if (typeof s === "boolean") {
        f = funct;
        funct = functions[0];
        addlabel(v, "var");
        s = funct;
        funct = f;
      }
      var block;
      if (_.has(funct, "(blockscope)")) {
        block = funct["(blockscope)"].getlabel(v);
      }

      // The name is in scope and defined in the current function.
      if (funct === s || block) {
        // Change 'unused' to 'var', and reject labels.
        // the name is in a block scope
        switch (block ? block[v]["(type)"] : funct[v]) {
        case "unused":
          if (block) block[v]["(type)"] = "var";
          else funct[v] = "var";
          break;
        case "unction":
          if (block) block[v]["(type)"] = "function";
          else funct[v] = "function";
          this["function"] = true;
          break;
        case "function":
          this["function"] = true;
          break;
        case "label":
          warning("W037", state.tokens.curr, v);
          break;
        }
      } else if (funct["(global)"]) {
        // The name is not defined in the function.  If we are in the global
        // scope, then we have an undefined variable.
        //
        // Operators typeof and delete do not raise runtime errors even if
        // the base object of a reference is null so no need to display warning
        // if we're inside of typeof or delete.

        if (typeof predefined[v] !== "boolean") {
          // Attempting to subscript a null reference will throw an
          // error, even within the typeof and delete operators
          if (!(anonname === "typeof" || anonname === "delete") ||
            (state.tokens.next && (state.tokens.next.value === "." ||
              state.tokens.next.value === "["))) {

            // if we're in a list comprehension, variables are declared
            // locally and used before being defined. So we check
            // the presence of the given variable in the comp array
            // before declaring it undefined.

            if (!funct["(comparray)"].check(v)) {
              isundef(funct, "W117", state.tokens.curr, v);
            }
          }
        }

        note_implied(state.tokens.curr);
      } else {
        // If the name is already defined in the current
        // function, but not as outer, then there is a scope error.

        switch (funct[v]) {
        case "closure":
        case "function":
        case "var":
        case "unused":
          warning("W038", state.tokens.curr, v);
          break;
        case "label":
          warning("W037", state.tokens.curr, v);
          break;
        case "outer":
        case "global":
          break;
        default:
          // If the name is defined in an outer function, make an outer entry,
          // and if it was unused, make it var.
          if (s === true) {
            funct[v] = true;
          } else if (s === null) {
            warning("W039", state.tokens.curr, v);
            note_implied(state.tokens.curr);
          } else if (typeof s !== "object") {
            // Operators typeof and delete do not raise runtime errors even
            // if the base object of a reference is null so no need to
            //
            // display warning if we're inside of typeof or delete.
            // Attempting to subscript a null reference will throw an
            // error, even within the typeof and delete operators
            if (!(anonname === "typeof" || anonname === "delete") ||
              (state.tokens.next &&
                (state.tokens.next.value === "." || state.tokens.next.value === "["))) {

              isundef(funct, "W117", state.tokens.curr, v);
            }
            funct[v] = true;
            note_implied(state.tokens.curr);
          } else {
            switch (s[v]) {
            case "function":
            case "unction":
              this["function"] = true;
              s[v] = "closure";
              funct[v] = s["(global)"] ? "global" : "outer";
              break;
            case "var":
            case "unused":
              s[v] = "closure";
              funct[v] = s["(global)"] ? "global" : "outer";
              break;
            case "closure":
              funct[v] = s["(global)"] ? "global" : "outer";
              break;
            case "label":
              warning("W037", state.tokens.curr, v);
            }
          }
        }
      }
      return this;
    },
    led: function () {
      error("E033", state.tokens.next, state.tokens.next.value);
    }
  };

  type("(regexp)", function () {
    return this;
  });

  // ECMAScript parser

  delim("(endline)");
  delim("(begin)");
  delim("(end)").reach = true;
  delim("(error)").reach = true;
  delim("}").reach = true;
  delim(")");
  delim("]");
  delim("\"").reach = true;
  delim("'").reach = true;
  delim(";");
  delim(":").reach = true;
  delim("#");

  reserve("else");
  reserve("case").reach = true;
  reserve("catch");
  reserve("default").reach = true;
  reserve("finally");
  reservevar("arguments", function (x) {
    if (state.directive["use strict"] && funct["(global)"]) {
      warning("E008", x);
    }
  });
  reservevar("eval");
  reservevar("false");
  reservevar("Infinity");
  reservevar("null");
  reservevar("this", function (x) {
    if (state.directive["use strict"] && !state.option.validthis && ((funct["(statement)"] &&
        funct["(name)"].charAt(0) > "Z") || funct["(global)"])) {
      warning("W040", x);
    }
  });
  reservevar("true");
  reservevar("undefined");

  assignop("=", "assign", 20);
  assignop("+=", "assignadd", 20);
  assignop("-=", "assignsub", 20);
  assignop("*=", "assignmult", 20);
  assignop("/=", "assigndiv", 20).nud = function () {
    error("E014");
  };
  assignop("%=", "assignmod", 20);

  bitwiseassignop("&=", "assignbitand", 20);
  bitwiseassignop("|=", "assignbitor", 20);
  bitwiseassignop("^=", "assignbitxor", 20);
  bitwiseassignop("<<=", "assignshiftleft", 20);
  bitwiseassignop(">>=", "assignshiftright", 20);
  bitwiseassignop(">>>=", "assignshiftrightunsigned", 20);
  infix(",", function (left, that) {
    var expr;
    that.exprs = [left];
    if (!comma({peek: true})) {
      return that;
    }
    while (true) {
      if (!(expr = expression(10)))  {
        break;
      }
      that.exprs.push(expr);
      if (state.tokens.next.value !== "," || !comma()) {
        break;
      }
    }
    return that;
  }, 10, true);

  infix("?", function (left, that) {
    increaseComplexityCount();
    that.left = left;
    that.right = expression(10);
    advance(":");
    that["else"] = expression(10);
    return that;
  }, 30);

  var orPrecendence = 40;
  infix("||", function (left, that) {
    increaseComplexityCount();
    that.left = left;
    that.right = expression(orPrecendence);
    return that;
  }, orPrecendence);
  infix("&&", "and", 50);
  bitwise("|", "bitor", 70);
  bitwise("^", "bitxor", 80);
  bitwise("&", "bitand", 90);
  relation("==", function (left, right) {
    var eqnull = state.option.eqnull && (left.value === "null" || right.value === "null");

    if (!eqnull && state.option.eqeqeq)
      warning("W116", this, "===", "==");
    else if (isPoorRelation(left))
      warning("W041", this, "===", left.value);
    else if (isPoorRelation(right))
      warning("W041", this, "===", right.value);

    return this;
  });
  relation("===");
  relation("!=", function (left, right) {
    var eqnull = state.option.eqnull &&
        (left.value === "null" || right.value === "null");

    if (!eqnull && state.option.eqeqeq) {
      warning("W116", this, "!==", "!=");
    } else if (isPoorRelation(left)) {
      warning("W041", this, "!==", left.value);
    } else if (isPoorRelation(right)) {
      warning("W041", this, "!==", right.value);
    }
    return this;
  });
  relation("!==");
  relation("<");
  relation(">");
  relation("<=");
  relation(">=");
  bitwise("<<", "shiftleft", 120);
  bitwise(">>", "shiftright", 120);
  bitwise(">>>", "shiftrightunsigned", 120);
  infix("in", "in", 120);
  infix("instanceof", "instanceof", 120);
  infix("+", function (left, that) {
    var right = expression(130);
    if (left && right && left.id === "(string)" && right.id === "(string)") {
      left.value += right.value;
      left.character = right.character;
      if (!state.option.scripturl && reg.javascriptURL.test(left.value)) {
        warning("W050", left);
      }
      return left;
    }
    that.left = left;
    that.right = right;
    return that;
  }, 130);
  prefix("+", "num");
  prefix("+++", function () {
    warning("W007");
    this.right = expression(150);
    this.arity = "unary";
    return this;
  });
  infix("+++", function (left) {
    warning("W007");
    this.left = left;
    this.right = expression(130);
    return this;
  }, 130);
  infix("-", "sub", 130);
  prefix("-", "neg");
  prefix("---", function () {
    warning("W006");
    this.right = expression(150);
    this.arity = "unary";
    return this;
  });
  infix("---", function (left) {
    warning("W006");
    this.left = left;
    this.right = expression(130);
    return this;
  }, 130);
  infix("*", "mult", 140);
  infix("/", "div", 140);
  infix("%", "mod", 140);

  suffix("++", "postinc");
  prefix("++", "preinc");
  state.syntax["++"].exps = true;

  suffix("--", "postdec");
  prefix("--", "predec");
  state.syntax["--"].exps = true;
  prefix("delete", function () {
    var p = expression(10);
    if (!p || (p.id !== "." && p.id !== "[")) {
      warning("W051");
    }
    this.first = p;
    return this;
  }).exps = true;

  prefix("~", function () {
    if (state.option.bitwise) {
      warning("W052", this, "~");
    }
    expression(150);
    return this;
  });

  prefix("...", function () {
    if (!state.option.inESNext()) {
      warning("W104", this, "spread/rest operator");
    }
    if (!state.tokens.next.identifier) {
      error("E030", state.tokens.next, state.tokens.next.value);
    }
    expression(150);
    return this;
  });

  prefix("!", function () {
    this.right = expression(150);
    this.arity = "unary";

    if (!this.right) { // '!' followed by nothing? Give up.
      quit("E041", this.line || 0);
    }

    if (bang[this.right.id] === true) {
      warning("W018", this, "!");
    }
    return this;
  });

  prefix("typeof", "typeof");
  prefix("new", function () {
    var c = expression(155), i;
    if (c && c.id !== "function") {
      if (c.identifier) {
        c["new"] = true;
        switch (c.value) {
        case "Number":
        case "String":
        case "Boolean":
        case "Math":
        case "JSON":
          warning("W053", state.tokens.prev, c.value);
          break;
        case "Function":
          if (!state.option.evil) {
            warning("W054");
          }
          break;
        case "Date":
        case "RegExp":
          break;
        default:
          if (c.id !== "function") {
            i = c.value.substr(0, 1);
            if (state.option.newcap && (i < "A" || i > "Z") && !_.has(global, c.value)) {
              warning("W055", state.tokens.curr);
            }
          }
        }
      } else {
        if (c.id !== "." && c.id !== "[" && c.id !== "(") {
          warning("W056", state.tokens.curr);
        }
      }
    } else {
      if (!state.option.supernew)
        warning("W057", this);
    }
    adjacent(state.tokens.curr, state.tokens.next);
    if (state.tokens.next.id !== "(" && !state.option.supernew) {
      warning("W058", state.tokens.curr, state.tokens.curr.value);
    }
    this.first = c;
    return this;
  });
  state.syntax["new"].exps = true;

  prefix("void").exps = true;

  infix(".", function (left, that) {
    adjacent(state.tokens.prev, state.tokens.curr);
    nobreak();
    var m = identifier(false, true);

    if (typeof m === "string") {
      countMember(m);
    }

    that.left = left;
    that.right = m;

    if (m && m === "hasOwnProperty" && state.tokens.next.value === "=") {
      warning("W001");
    }

    if (left && left.value === "arguments" && (m === "callee" || m === "caller")) {
      if (state.option.noarg)
        warning("W059", left, m);
      else if (state.directive["use strict"])
        error("E008");
    } else if (!state.option.evil && left && left.value === "document" &&
        (m === "write" || m === "writeln")) {
      warning("W060", left);
    }

    if (!state.option.evil && (m === "eval" || m === "execScript")) {
      warning("W061");
    }

    return that;
  }, 160, true);

  infix("(", function (left, that) {
    if (state.tokens.prev.id !== "}" && state.tokens.prev.id !== ")") {
      nobreak(state.tokens.prev, state.tokens.curr);
    }

    nospace();
    if (state.option.immed && left && !left.immed && left.id === "function") {
      warning("W062");
    }

    var n = 0;
    var p = [];

    if (left) {
      if (left.type === "(identifier)") {
        if (left.value.match(/^[A-Z]([A-Z0-9_$]*[a-z][A-Za-z0-9_$]*)?$/)) {
          if ("Number String Boolean Date Object".indexOf(left.value) === -1) {
            if (left.value === "Math") {
              warning("W063", left);
            } else if (state.option.newcap) {
              warning("W064", left);
            }
          }
        }
      }
    }

    if (state.tokens.next.id !== ")") {
      for (;;) {
        p[p.length] = expression(10);
        n += 1;
        if (state.tokens.next.id !== ",") {
          break;
        }
        comma();
      }
    }

    advance(")");
    nospace(state.tokens.prev, state.tokens.curr);

    if (typeof left === "object") {
      if (left.value === "parseInt" && n === 1) {
        warning("W065", state.tokens.curr);
      }
      if (!state.option.evil) {
        if (left.value === "eval" || left.value === "Function" ||
            left.value === "execScript") {
          warning("W061", left);

          if (p[0] && [0].id === "(string)") {
            addInternalSrc(left, p[0].value);
          }
        } else if (p[0] && p[0].id === "(string)" &&
             (left.value === "setTimeout" ||
            left.value === "setInterval")) {
          warning("W066", left);
          addInternalSrc(left, p[0].value);

        // window.setTimeout/setInterval
        } else if (p[0] && p[0].id === "(string)" &&
             left.value === "." &&
             left.left.value === "window" &&
             (left.right === "setTimeout" ||
            left.right === "setInterval")) {
          warning("W066", left);
          addInternalSrc(left, p[0].value);
        }
      }
      if (!left.identifier && left.id !== "." && left.id !== "[" &&
          left.id !== "(" && left.id !== "&&" && left.id !== "||" &&
          left.id !== "?") {
        warning("W067", left);
      }
    }

    that.left = left;
    return that;
  }, 155, true).exps = true;

  prefix("(", function () {
    nospace();
    var bracket, brackets = [];
    var pn, pn1, i = 0;
    var ret;

    do {
      pn = peek(i);
      i += 1;
      pn1 = peek(i);
      i += 1;
    } while (pn.value !== ")" && pn1.value !== "=>" && pn1.value !== ";" && pn1.type !== "(end)");

    if (state.tokens.next.id === "function") {
      state.tokens.next.immed = true;
    }

    var exprs = [];

    if (state.tokens.next.id !== ")") {
      for (;;) {
        if (pn1.value === "=>" && state.tokens.next.value === "{") {
          bracket = state.tokens.next;
          bracket.left = destructuringExpression();
          brackets.push(bracket);
          for (var t in bracket.left) {
            exprs.push(bracket.left[t].token);
          }
        } else {
          exprs.push(expression(10));
        }
        if (state.tokens.next.id !== ",") {
          break;
        }
        comma();
      }
    }

    advance(")", this);
    nospace(state.tokens.prev, state.tokens.curr);
    if (state.option.immed && exprs[0] && exprs[0].id === "function") {
      if (state.tokens.next.id !== "(" &&
        (state.tokens.next.id !== "." || (peek().value !== "call" && peek().value !== "apply"))) {
        warning("W068", this);
      }
    }

    if (state.tokens.next.value === "=>") {
      return exprs;
    }
    if (!exprs.length) {
      return;
    }
    if (exprs.length > 1) {
      ret = Object.create(state.syntax[","]);
      ret.exprs = exprs;
    } else {
      ret = exprs[0];
    }
    if (ret) {
      ret.paren = true;
    }
    return ret;
  });

  application("=>");

  infix("[", function (left, that) {
    nobreak(state.tokens.prev, state.tokens.curr);
    nospace();
    var e = expression(10), s;
    if (e && e.type === "(string)") {
      if (!state.option.evil && (e.value === "eval" || e.value === "execScript")) {
        warning("W061", that);
      }

      countMember(e.value);
      if (!state.option.sub && reg.identifier.test(e.value)) {
        s = state.syntax[e.value];
        if (!s || !isReserved(s)) {
          warning("W069", state.tokens.prev, e.value);
        }
      }
    }
    advance("]", that);

    if (e && e.value === "hasOwnProperty" && state.tokens.next.value === "=") {
      warning("W001");
    }

    nospace(state.tokens.prev, state.tokens.curr);
    that.left = left;
    that.right = e;
    return that;
  }, 160, true);

  function comprehensiveArrayExpression() {
    var res = {};
    res.exps = true;
    funct["(comparray)"].stack();

    // Handle reversed for expressions, used in spidermonkey
    var reversed = false;
    if (state.tokens.next.value !== "for") {
      reversed = true;
      if (!state.option.inMoz(true)) {
        warning("W116", state.tokens.next, "for", state.tokens.next.value);
      }
      funct["(comparray)"].setState("use");
      res.right = expression(10);
    }

    advance("for");
    if (state.tokens.next.value === "each") {
      advance("each");
      if (!state.option.inMoz(true)) {
        warning("W118", state.tokens.curr, "for each");
      }
    }
    advance("(");
    funct["(comparray)"].setState("define");
    res.left = expression(130);
    if (_.contains(["in", "of"], state.tokens.next.value)) {
      advance();
    } else {
      error("E045", state.tokens.curr);
    }
    funct["(comparray)"].setState("generate");
    expression(10);

    advance(")");
    if (state.tokens.next.value === "if") {
      advance("if");
      advance("(");
      funct["(comparray)"].setState("filter");
      res.filter = expression(10);
      advance(")");
    }

    if (!reversed) {
      funct["(comparray)"].setState("use");
      res.right = expression(10);
    }

    advance("]");
    funct["(comparray)"].unstack();
    return res;
  }

  prefix("[", function () {
    var blocktype = lookupBlockType(true);
    if (blocktype.isCompArray) {
      if (!state.option.inESNext()) {
        warning("W119", state.tokens.curr, "array comprehension");
      }
      return comprehensiveArrayExpression();
    } else if (blocktype.isDestAssign && !state.option.inESNext()) {
      warning("W104", state.tokens.curr, "destructuring assignment");
    }
    var b = state.tokens.curr.line !== state.tokens.next.line;
    this.first = [];
    if (b) {
      indent += state.option.indent;
      if (state.tokens.next.from === indent + state.option.indent) {
        indent += state.option.indent;
      }
    }
    while (state.tokens.next.id !== "(end)") {
      while (state.tokens.next.id === ",") {
        if (!state.option.inES5())
          warning("W070");
        advance(",");
      }
      if (state.tokens.next.id === "]") {
        break;
      }
      if (b && state.tokens.curr.line !== state.tokens.next.line) {
        indentation();
      }
      this.first.push(expression(10));
      if (state.tokens.next.id === ",") {
        comma({ allowTrailing: true });
        if (state.tokens.next.id === "]" && !state.option.inES5(true)) {
          warning("W070", state.tokens.curr);
          break;
        }
      } else {
        break;
      }
    }
    if (b) {
      indent -= state.option.indent;
      indentation();
    }
    advance("]", this);
    return this;
  }, 160);


  function property_name() {
    var id = optionalidentifier(false, true);

    if (!id) {
      if (state.tokens.next.id === "(string)") {
        id = state.tokens.next.value;
        advance();
      } else if (state.tokens.next.id === "(number)") {
        id = state.tokens.next.value.toString();
        advance();
      }
    }

    if (id === "hasOwnProperty") {
      warning("W001");
    }

    return id;
  }


  function functionparams(parsed) {
    var curr, next;
    var params = [];
    var ident;
    var tokens = [];
    var t;
    var pastDefault = false;

    if (parsed) {
      if (parsed instanceof Array) {
        for (var i in parsed) {
          curr = parsed[i];
          if (_.contains(["{", "["], curr.id)) {
            for (t in curr.left) {
              t = tokens[t];
              if (t.id) {
                params.push(t.id);
                addlabel(t.id, "unused", t.token);
              }
            }
          } else if (curr.value === "...") {
            if (!state.option.inESNext()) {
              warning("W104", curr, "spread/rest operator");
            }
            continue;
          } else {
            addlabel(curr.value, "unused", curr);
          }
        }
        return params;
      } else {
        if (parsed.identifier === true) {
          addlabel(parsed.value, "unused", parsed);
          return [parsed];
        }
      }
    }

    next = state.tokens.next;

    advance("(");
    nospace();

    if (state.tokens.next.id === ")") {
      advance(")");
      return;
    }

    for (;;) {
      if (_.contains(["{", "["], state.tokens.next.id)) {
        tokens = destructuringExpression();
        for (t in tokens) {
          t = tokens[t];
          if (t.id) {
            params.push(t.id);
            addlabel(t.id, "unused", t.token);
          }
        }
      } else if (state.tokens.next.value === "...") {
        if (!state.option.inESNext()) {
          warning("W104", state.tokens.next, "spread/rest operator");
        }
        advance("...");
        nospace();
        ident = identifier(true);
        params.push(ident);
        addlabel(ident, "unused", state.tokens.curr);
      } else {
        ident = identifier(true);
        params.push(ident);
        addlabel(ident, "unused", state.tokens.curr);
      }

      // it is a syntax error to have a regular argument after a default argument
      if (pastDefault) {
        if (state.tokens.next.id !== "=") {
          error("E051", state.tokens.current);
        }
      }
      if (state.tokens.next.id === "=") {
        if (!state.option.inESNext()) {
          warning("W119", state.tokens.next, "default parameters");
        }
        advance("=");
        pastDefault = true;
        expression(10);
      }
      if (state.tokens.next.id === ",") {
        comma();
      } else {
        advance(")", next);
        nospace(state.tokens.prev, state.tokens.curr);
        return params;
      }
    }
  }


  function doFunction(name, statement, generator, fatarrowparams) {
    var f;
    var oldOption = state.option;
    var oldIgnored = state.ignored;
    var oldScope  = scope;

    state.option = Object.create(state.option);
    state.ignored = Object.create(state.ignored);
    scope  = Object.create(scope);

    funct = {
      "(name)"      : name || "\"" + anonname + "\"",
      "(line)"      : state.tokens.next.line,
      "(character)" : state.tokens.next.character,
      "(context)"   : funct,
      "(breakage)"  : 0,
      "(loopage)"   : 0,
      "(metrics)"   : createMetrics(state.tokens.next),
      "(scope)"     : scope,
      "(statement)" : statement,
      "(tokens)"    : {},
      "(blockscope)": funct["(blockscope)"],
      "(comparray)" : funct["(comparray)"]
    };

    if (generator) {
      funct["(generator)"] = true;
    }

    f = funct;
    state.tokens.curr.funct = funct;

    functions.push(funct);

    if (name) {
      addlabel(name, "function");
    }

    funct["(params)"] = functionparams(fatarrowparams);
    funct["(metrics)"].verifyMaxParametersPerFunction(funct["(params)"]);

    block(false, true, true, fatarrowparams ? true:false);

    if (generator && funct["(generator)"] !== "yielded") {
      error("E047", state.tokens.curr);
    }

    funct["(metrics)"].verifyMaxStatementsPerFunction();
    funct["(metrics)"].verifyMaxComplexityPerFunction();
    funct["(unusedOption)"] = state.option.unused;

    scope = oldScope;
    state.option = oldOption;
    state.ignored = oldIgnored;
    funct["(last)"] = state.tokens.curr.line;
    funct["(lastcharacter)"] = state.tokens.curr.character;
    funct = funct["(context)"];

    return f;
  }

  function createMetrics(functionStartToken) {
    return {
      statementCount: 0,
      nestedBlockDepth: -1,
      ComplexityCount: 1,

      verifyMaxStatementsPerFunction: function () {
        if (state.option.maxstatements &&
          this.statementCount > state.option.maxstatements) {
          warning("W071", functionStartToken, this.statementCount);
        }
      },

      verifyMaxParametersPerFunction: function (params) {
        params = params || [];

        if (state.option.maxparams && params.length > state.option.maxparams) {
          warning("W072", functionStartToken, params.length);
        }
      },

      verifyMaxNestedBlockDepthPerFunction: function () {
        if (state.option.maxdepth &&
          this.nestedBlockDepth > 0 &&
          this.nestedBlockDepth === state.option.maxdepth + 1) {
          warning("W073", null, this.nestedBlockDepth);
        }
      },

      verifyMaxComplexityPerFunction: function () {
        var max = state.option.maxcomplexity;
        var cc = this.ComplexityCount;
        if (max && cc > max) {
          warning("W074", functionStartToken, cc);
        }
      }
    };
  }

  function increaseComplexityCount() {
    funct["(metrics)"].ComplexityCount += 1;
  }

  // Parse assignments that were found instead of conditionals.
  // For example: if (a = 1) { ... }

  function checkCondAssignment(expr) {
    var id, paren;
    if (expr) {
      id = expr.id;
      paren = expr.paren;
      if (id === "," && (expr = expr.exprs[expr.exprs.length - 1])) {
        id = expr.id;
        paren = paren || expr.paren;
      }
    }
    switch (id) {
    case "=":
      if (!paren && !state.option.boss) {
        warning("W121");
        break;
      }
    case "+=":
    case "-=":
    case "*=":
    case "%=":
    case "&=":
    case "|=":
    case "^=":
    case "/=":
      if (!paren && !state.option.boss) {
        warning("W084");
      }
    }
  }


  (function (x) {
    x.nud = function (isclassdef) {
      var b, f, i, p, t, g;
      var props = {}; // All properties, including accessors
      var tag = "";

      function saveProperty(name, tkn) {
        if (props[name] && _.has(props, name))
          warning("W075", state.tokens.next, i);
        else
          props[name] = {};

        props[name].basic = true;
        props[name].basictkn = tkn;
      }

      function saveSetter(name, tkn) {
        if (props[name] && _.has(props, name)) {
          if (props[name].basic || props[name].setter)
            warning("W075", state.tokens.next, i);
        } else {
          props[name] = {};
        }

        props[name].setter = true;
        props[name].setterToken = tkn;
      }

      function saveGetter(name) {
        if (props[name] && _.has(props, name)) {
          if (props[name].basic || props[name].getter)
            warning("W075", state.tokens.next, i);
        } else {
          props[name] = {};
        }

        props[name].getter = true;
        props[name].getterToken = state.tokens.curr;
      }

      b = state.tokens.curr.line !== state.tokens.next.line;
      if (b) {
        indent += state.option.indent;
        if (state.tokens.next.from === indent + state.option.indent) {
          indent += state.option.indent;
        }
      }

      for (;;) {
        if (state.tokens.next.id === "}") {
          break;
        }

        if (b) {
          indentation();
        }

        if (isclassdef && state.tokens.next.value === "static") {
          advance("static");
          tag = "static ";
        }

        if (state.tokens.next.value === "get" && peek().id !== ":") {
          advance("get");

          if (!state.option.inES5(!isclassdef)) {
            error("E034");
          }

          i = property_name();
          if (!i) {
            error("E035");
          }

          // It is a Syntax Error if PropName of MethodDefinition is
          // "constructor" and SpecialMethod of MethodDefinition is true.
          if (isclassdef && i === "constructor") {
            error("E049", state.tokens.next, "class getter method", i);
          }

          saveGetter(tag + i);
          t = state.tokens.next;
          adjacent(state.tokens.curr, state.tokens.next);
          f = doFunction();
          p = f["(params)"];

          if (p) {
            warning("W076", t, p[0], i);
          }

          adjacent(state.tokens.curr, state.tokens.next);
        } else if (state.tokens.next.value === "set" && peek().id !== ":") {
          advance("set");

          if (!state.option.inES5(!isclassdef)) {
            error("E034");
          }

          i = property_name();
          if (!i) {
            error("E035");
          }

          // It is a Syntax Error if PropName of MethodDefinition is
          // "constructor" and SpecialMethod of MethodDefinition is true.
          if (isclassdef && i === "constructor") {
            error("E049", state.tokens.next, "class setter method", i);
          }

          saveSetter(tag + i, state.tokens.next);
          t = state.tokens.next;
          adjacent(state.tokens.curr, state.tokens.next);
          f = doFunction();
          p = f["(params)"];

          if (!p || p.length !== 1) {
            warning("W077", t, i);
          }
        } else {
          g = false;
          if (state.tokens.next.value === "*" && state.tokens.next.type === "(punctuator)") {
            if (!state.option.inESNext()) {
              warning("W104", state.tokens.next, "generator functions");
            }
            advance("*");
            g = true;
          }
          i = property_name();
          saveProperty(tag + i, state.tokens.next);

          if (typeof i !== "string") {
            break;
          }

          if (state.tokens.next.value === "(") {
            if (!state.option.inESNext()) {
              warning("W104", state.tokens.curr, "concise methods");
            }
            doFunction(i, undefined, g);
          } else if (!isclassdef) {
            advance(":");
            nonadjacent(state.tokens.curr, state.tokens.next);
            expression(10);
          }
        }
        // It is a Syntax Error if PropName of MethodDefinition is "prototype".
        if (isclassdef && i === "prototype") {
          error("E049", state.tokens.next, "class method", i);
        }

        countMember(i);
        if (isclassdef) {
          tag = "";
          continue;
        }
        if (state.tokens.next.id === ",") {
          comma({ allowTrailing: true, property: true });
          if (state.tokens.next.id === ",") {
            warning("W070", state.tokens.curr);
          } else if (state.tokens.next.id === "}" && !state.option.inES5(true)) {
            warning("W070", state.tokens.curr);
          }
        } else {
          break;
        }
      }
      if (b) {
        indent -= state.option.indent;
        indentation();
      }
      advance("}", this);

      // Check for lonely setters if in the ES5 mode.
      if (state.option.inES5()) {
        for (var name in props) {
          if (_.has(props, name) && props[name].setter && !props[name].getter) {
            warning("W078", props[name].setterToken);
          }
        }
      }
      return this;
    };
    x.fud = function () {
      error("E036", state.tokens.curr);
    };
  }(delim("{")));

  function destructuringExpression() {
    var id, ids;
    var identifiers = [];
    if (!state.option.inESNext()) {
      warning("W104", state.tokens.curr, "destructuring expression");
    }
    var nextInnerDE = function () {
      var ident;
      if (_.contains(["[", "{"], state.tokens.next.value)) {
        ids = destructuringExpression();
        for (var id in ids) {
          id = ids[id];
          identifiers.push({ id: id.id, token: id.token });
        }
      } else if (state.tokens.next.value === ",") {
        identifiers.push({ id: null, token: state.tokens.curr });
      } else {
        ident = identifier();
        if (ident)
          identifiers.push({ id: ident, token: state.tokens.curr });
      }
    };
    if (state.tokens.next.value === "[") {
      advance("[");
      nextInnerDE();
      while (state.tokens.next.value !== "]") {
        advance(",");
        nextInnerDE();
      }
      advance("]");
    } else if (state.tokens.next.value === "{") {
      advance("{");
      id = identifier();
      if (state.tokens.next.value === ":") {
        advance(":");
        nextInnerDE();
      } else {
        identifiers.push({ id: id, token: state.tokens.curr });
      }
      while (state.tokens.next.value !== "}") {
        advance(",");
        id = identifier();
        if (state.tokens.next.value === ":") {
          advance(":");
          nextInnerDE();
        } else {
          identifiers.push({ id: id, token: state.tokens.curr });
        }
      }
      advance("}");
    }
    return identifiers;
  }
  function destructuringExpressionMatch(tokens, value) {
    if (value.first) {
      for (var i = 0; i < tokens.length && i < value.first.length; i++) {
        var token = tokens[i];
        var val = value.first[i];
        if (token && val) {
          token.first = val;
        } else if (token && token.first && !val) {
          warning("W080", token.first, token.first.value);
        } /* else {
          XXX value is discarded: wouldn't it need a warning ?
        } */
      }
    }
  }

  var conststatement = stmt("const", function (prefix) {
    var tokens, value;
    // state variable to know if it is a lone identifier, or a destructuring statement.
    var lone;

    if (!state.option.inESNext()) {
      warning("W104", state.tokens.curr, "const");
    }

    this.first = [];
    for (;;) {
      var names = [];
      nonadjacent(state.tokens.curr, state.tokens.next);
      if (_.contains(["{", "["], state.tokens.next.value)) {
        tokens = destructuringExpression();
        lone = false;
      } else {
        tokens = [ { id: identifier(), token: state.tokens.curr } ];
        lone = true;
      }
      for (var t in tokens) {
        t = tokens[t];
        if (funct[t.id] === "const") {
          warning("E011", null, t.id);
        }
        if (funct["(global)"] && predefined[t.id] === false) {
          warning("W079", t.token, t.id);
        }
        if (t.id) {
          addlabel(t.id, "const");
          names.push(t.token);
        }
      }
      if (prefix) {
        break;
      }

      this.first = this.first.concat(names);

      if (state.tokens.next.id !== "=") {
        warning("E012", state.tokens.curr, state.tokens.curr.value);
      }

      if (state.tokens.next.id === "=") {
        nonadjacent(state.tokens.curr, state.tokens.next);
        advance("=");
        nonadjacent(state.tokens.curr, state.tokens.next);
        if (state.tokens.next.id === "undefined") {
          warning("W080", state.tokens.prev, state.tokens.prev.value);
        }
        if (peek(0).id === "=" && state.tokens.next.identifier) {
          warning("W120", state.tokens.next, state.tokens.next.value);
        }
        value = expression(10);
        if (lone) {
          tokens[0].first = value;
        } else {
          destructuringExpressionMatch(names, value);
        }
      }

      if (state.tokens.next.id !== ",") {
        break;
      }
      comma();
    }
    return this;
  });
  conststatement.exps = true;
  var varstatement = stmt("var", function (prefix) {
    // JavaScript does not have block scope. It only has function scope. So,
    // declaring a variable in a block can have unexpected consequences.
    var tokens, lone, value;

    if (funct["(onevar)"] && state.option.onevar) {
      warning("W081");
    } else if (!funct["(global)"]) {
      funct["(onevar)"] = true;
    }

    this.first = [];
    for (;;) {
      var names = [];
      nonadjacent(state.tokens.curr, state.tokens.next);
      if (_.contains(["{", "["], state.tokens.next.value)) {
        tokens = destructuringExpression();
        lone = false;
      } else {
        tokens = [ { id: identifier(), token: state.tokens.curr } ];
        lone = true;
      }
      for (var t in tokens) {
        t = tokens[t];
        if (state.option.inESNext() && funct[t.id] === "const") {
          warning("E011", null, t.id);
        }
        if (funct["(global)"] && predefined[t.id] === false) {
          warning("W079", t.token, t.id);
        }
        if (t.id) {
          addlabel(t.id, "unused", t.token);
          names.push(t.token);
        }
      }
      if (prefix) {
        break;
      }

      this.first = this.first.concat(names);

      if (state.tokens.next.id === "=") {
        nonadjacent(state.tokens.curr, state.tokens.next);
        advance("=");
        nonadjacent(state.tokens.curr, state.tokens.next);
        if (state.tokens.next.id === "undefined") {
          warning("W080", state.tokens.prev, state.tokens.prev.value);
        }
        if (peek(0).id === "=" && state.tokens.next.identifier) {
          warning("W120", state.tokens.next, state.tokens.next.value);
        }
        value = expression(10);
        if (lone) {
          tokens[0].first = value;
        } else {
          destructuringExpressionMatch(names, value);
        }
      }

      if (state.tokens.next.id !== ",") {
        break;
      }
      comma();
    }
    return this;
  });
  varstatement.exps = true;
  var letstatement = stmt("let", function (prefix) {
    var tokens, lone, value, letblock;

    if (!state.option.inESNext()) {
      warning("W104", state.tokens.curr, "let");
    }

    if (state.tokens.next.value === "(") {
      if (!state.option.inMoz(true)) {
        warning("W118", state.tokens.next, "let block");
      }
      advance("(");
      funct["(blockscope)"].stack();
      letblock = true;
    } else if (funct["(nolet)"]) {
      error("E048", state.tokens.curr);
    }

    if (funct["(onevar)"] && state.option.onevar) {
      warning("W081");
    } else if (!funct["(global)"]) {
      funct["(onevar)"] = true;
    }

    this.first = [];
    for (;;) {
      var names = [];
      nonadjacent(state.tokens.curr, state.tokens.next);
      if (_.contains(["{", "["], state.tokens.next.value)) {
        tokens = destructuringExpression();
        lone = false;
      } else {
        tokens = [ { id: identifier(), token: state.tokens.curr.value } ];
        lone = true;
      }
      for (var t in tokens) {
        t = tokens[t];
        if (state.option.inESNext() && funct[t.id] === "const") {
          warning("E011", null, t.id);
        }
        if (funct["(global)"] && predefined[t.id] === false) {
          warning("W079", t.token, t.id);
        }
        if (t.id && !funct["(nolet)"]) {
          addlabel(t.id, "unused", t.token, true);
          names.push(t.token);
        }
      }
      if (prefix) {
        break;
      }

      this.first = this.first.concat(names);

      if (state.tokens.next.id === "=") {
        nonadjacent(state.tokens.curr, state.tokens.next);
        advance("=");
        nonadjacent(state.tokens.curr, state.tokens.next);
        if (state.tokens.next.id === "undefined") {
          warning("W080", state.tokens.prev, state.tokens.prev.value);
        }
        if (peek(0).id === "=" && state.tokens.next.identifier) {
          warning("W120", state.tokens.next, state.tokens.next.value);
        }
        value = expression(10);
        if (lone) {
          tokens[0].first = value;
        } else {
          destructuringExpressionMatch(names, value);
        }
      }

      if (state.tokens.next.id !== ",") {
        break;
      }
      comma();
    }
    if (letblock) {
      advance(")");
      block(true, true);
      this.block = true;
      funct["(blockscope)"].unstack();
    }

    return this;
  });
  letstatement.exps = true;

  blockstmt("class", function () {
    return classdef.call(this, true);
  });

  function classdef(stmt) {
    /*jshint validthis:true */
    if (!state.option.inESNext()) {
      warning("W104", state.tokens.curr, "class");
    }
    if (stmt) {
      // BindingIdentifier
      this.name = identifier();
      addlabel(this.name, "unused", state.tokens.curr);
    } else if (state.tokens.next.identifier && state.tokens.next.value !== "extends") {
      // BindingIdentifier(opt)
      this.name = identifier();
    }
    classtail(this);
    return this;
  }

  function classtail(c) {
    var strictness = state.directive["use strict"];

    // ClassHeritage(opt)
    if (state.tokens.next.value === "extends") {
      advance("extends");
      c.heritage = expression(10);
    }

    // A ClassBody is always strict code.
    state.directive["use strict"] = true;
    advance("{");
    // ClassBody(opt)
    c.body = state.syntax["{"].nud(true);
    state.directive["use strict"] = strictness;
  }

  blockstmt("function", function () {
    var generator = false;
    if (state.tokens.next.value === "*") {
      advance("*");
      if (state.option.inESNext(true)) {
        generator = true;
      } else {
        warning("W119", state.tokens.curr, "function*");
      }
    }
    if (inblock) {
      warning("W082", state.tokens.curr);

    }
    var i = identifier();
    if (funct[i] === "const") {
      warning("E011", null, i);
    }
    adjacent(state.tokens.curr, state.tokens.next);
    addlabel(i, "unction", state.tokens.curr);

    doFunction(i, { statement: true }, generator);
    if (state.tokens.next.id === "(" && state.tokens.next.line === state.tokens.curr.line) {
      error("E039");
    }
    return this;
  });

  prefix("function", function () {
    var generator = false;
    if (state.tokens.next.value === "*") {
      if (!state.option.inESNext()) {
        warning("W119", state.tokens.curr, "function*");
      }
      advance("*");
      generator = true;
    }
    var i = optionalidentifier();
    if (i || state.option.gcl) {
      adjacent(state.tokens.curr, state.tokens.next);
    } else {
      nonadjacent(state.tokens.curr, state.tokens.next);
    }
    doFunction(i, undefined, generator);
    if (!state.option.loopfunc && funct["(loopage)"]) {
      warning("W083");
    }
    return this;
  });

  blockstmt("if", function () {
    var t = state.tokens.next;
    increaseComplexityCount();
    state.condition = true;
    advance("(");
    nonadjacent(this, t);
    nospace();
    checkCondAssignment(expression(0));
    advance(")", t);
    state.condition = false;
    nospace(state.tokens.prev, state.tokens.curr);
    block(true, true);
    if (state.tokens.next.id === "else") {
      nonadjacent(state.tokens.curr, state.tokens.next);
      advance("else");
      if (state.tokens.next.id === "if" || state.tokens.next.id === "switch") {
        statement(true);
      } else {
        block(true, true);
      }
    }
    return this;
  });

  blockstmt("try", function () {
    var b;

    function doCatch() {
      var oldScope = scope;
      var e;

      advance("catch");
      nonadjacent(state.tokens.curr, state.tokens.next);
      advance("(");

      scope = Object.create(oldScope);

      e = state.tokens.next.value;
      if (state.tokens.next.type !== "(identifier)") {
        e = null;
        warning("E030", state.tokens.next, e);
      }

      advance();

      funct = {
        "(name)"     : "(catch)",
        "(line)"     : state.tokens.next.line,
        "(character)": state.tokens.next.character,
        "(context)"  : funct,
        "(breakage)" : funct["(breakage)"],
        "(loopage)"  : funct["(loopage)"],
        "(scope)"    : scope,
        "(statement)": false,
        "(metrics)"  : createMetrics(state.tokens.next),
        "(catch)"    : true,
        "(tokens)"   : {},
        "(blockscope)": funct["(blockscope)"],
        "(comparray)": funct["(comparray)"]
      };

      if (e) {
        addlabel(e, "exception");
      }

      if (state.tokens.next.value === "if") {
        if (!state.option.inMoz(true)) {
          warning("W118", state.tokens.curr, "catch filter");
        }
        advance("if");
        expression(0);
      }

      advance(")");

      state.tokens.curr.funct = funct;
      functions.push(funct);

      block(false);

      scope = oldScope;

      funct["(last)"] = state.tokens.curr.line;
      funct["(lastcharacter)"] = state.tokens.curr.character;
      funct = funct["(context)"];
    }

    block(false);

    while (state.tokens.next.id === "catch") {
      increaseComplexityCount();
      if (b && (!state.option.inMoz(true))) {
        warning("W118", state.tokens.next, "multiple catch blocks");
      }
      doCatch();
      b = true;
    }

    if (state.tokens.next.id === "finally") {
      advance("finally");
      block(false);
      return;
    }

    if (!b) {
      error("E021", state.tokens.next, "catch", state.tokens.next.value);
    }

    return this;
  });

  blockstmt("while", function () {
    var t = state.tokens.next;
    funct["(breakage)"] += 1;
    funct["(loopage)"] += 1;
    increaseComplexityCount();
    advance("(");
    nonadjacent(this, t);
    nospace();
    checkCondAssignment(expression(0));
    advance(")", t);
    nospace(state.tokens.prev, state.tokens.curr);
    block(true, true);
    funct["(breakage)"] -= 1;
    funct["(loopage)"] -= 1;
    return this;
  }).labelled = true;

  blockstmt("with", function () {
    var t = state.tokens.next;
    if (state.directive["use strict"]) {
      error("E010", state.tokens.curr);
    } else if (!state.option.withstmt) {
      warning("W085", state.tokens.curr);
    }

    advance("(");
    nonadjacent(this, t);
    nospace();
    expression(0);
    advance(")", t);
    nospace(state.tokens.prev, state.tokens.curr);
    block(true, true);

    return this;
  });

  blockstmt("switch", function () {
    var t = state.tokens.next,
      g = false;
    funct["(breakage)"] += 1;
    advance("(");
    nonadjacent(this, t);
    nospace();
    checkCondAssignment(expression(0));
    advance(")", t);
    nospace(state.tokens.prev, state.tokens.curr);
    nonadjacent(state.tokens.curr, state.tokens.next);
    t = state.tokens.next;
    advance("{");
    nonadjacent(state.tokens.curr, state.tokens.next);
    indent += state.option.indent;
    this.cases = [];

    for (;;) {
      switch (state.tokens.next.id) {
      case "case":
        switch (funct["(verb)"]) {
        case "yield":
        case "break":
        case "case":
        case "continue":
        case "return":
        case "switch":
        case "throw":
          break;
        default:
          // You can tell JSHint that you don't use break intentionally by
          // adding a comment /* falls through */ on a line just before
          // the next `case`.
          if (!reg.fallsThrough.test(state.lines[state.tokens.next.line - 2])) {
            warning("W086", state.tokens.curr, "case");
          }
        }
        indentation(-state.option.indent);
        advance("case");
        this.cases.push(expression(20));
        increaseComplexityCount();
        g = true;
        advance(":");
        funct["(verb)"] = "case";
        break;
      case "default":
        switch (funct["(verb)"]) {
        case "yield":
        case "break":
        case "continue":
        case "return":
        case "throw":
          break;
        default:
          // Do not display a warning if 'default' is the first statement or if
          // there is a special /* falls through */ comment.
          if (this.cases.length) {
            if (!reg.fallsThrough.test(state.lines[state.tokens.next.line - 2])) {
              warning("W086", state.tokens.curr, "default");
            }
          }
        }
        indentation(-state.option.indent);
        advance("default");
        g = true;
        advance(":");
        break;
      case "}":
        indent -= state.option.indent;
        indentation();
        advance("}", t);
        funct["(breakage)"] -= 1;
        funct["(verb)"] = undefined;
        return;
      case "(end)":
        error("E023", state.tokens.next, "}");
        return;
      default:
        if (g) {
          switch (state.tokens.curr.id) {
          case ",":
            error("E040");
            return;
          case ":":
            g = false;
            statements();
            break;
          default:
            error("E025", state.tokens.curr);
            return;
          }
        } else {
          if (state.tokens.curr.id === ":") {
            advance(":");
            error("E024", state.tokens.curr, ":");
            statements();
          } else {
            error("E021", state.tokens.next, "case", state.tokens.next.value);
            return;
          }
        }
      }
    }
  }).labelled = true;

  stmt("debugger", function () {
    if (!state.option.debug) {
      warning("W087", this);
    }
    return this;
  }).exps = true;

  (function () {
    var x = stmt("do", function () {
      funct["(breakage)"] += 1;
      funct["(loopage)"] += 1;
      increaseComplexityCount();

      this.first = block(true, true);
      advance("while");
      var t = state.tokens.next;
      nonadjacent(state.tokens.curr, t);
      advance("(");
      nospace();
      checkCondAssignment(expression(0));
      advance(")", t);
      nospace(state.tokens.prev, state.tokens.curr);
      funct["(breakage)"] -= 1;
      funct["(loopage)"] -= 1;
      return this;
    });
    x.labelled = true;
    x.exps = true;
  }());

  blockstmt("for", function () {
    var s, t = state.tokens.next;
    var letscope = false;
    var foreachtok = null;

    if (t.value === "each") {
      foreachtok = t;
      advance("each");
      if (!state.option.inMoz(true)) {
        warning("W118", state.tokens.curr, "for each");
      }
    }

    funct["(breakage)"] += 1;
    funct["(loopage)"] += 1;
    increaseComplexityCount();
    advance("(");
    nonadjacent(this, t);
    nospace();

    // what kind of for(…) statement it is? for(…of…)? for(…in…)? for(…;…;…)?
    var nextop; // contains the token of the "in" or "of" operator
    var i = 0;
    var inof = ["in", "of"];
    do {
      nextop = peek(i);
      ++i;
    } while (!_.contains(inof, nextop.value) && nextop.value !== ";" &&
          nextop.type !== "(end)");

    // if we're in a for (… in|of …) statement
    if (_.contains(inof, nextop.value)) {
      if (!state.option.inESNext() && nextop.value === "of") {
        error("W104", nextop, "for of");
      }
      if (state.tokens.next.id === "var") {
        advance("var");
        state.syntax["var"].fud.call(state.syntax["var"].fud, true);
      } else if (state.tokens.next.id === "let") {
        advance("let");
        // create a new block scope
        letscope = true;
        funct["(blockscope)"].stack();
        state.syntax["let"].fud.call(state.syntax["let"].fud, true);
      } else {
        switch (funct[state.tokens.next.value]) {
        case "unused":
          funct[state.tokens.next.value] = "var";
          break;
        case "var":
          break;
        default:
          if (!funct["(blockscope)"].getlabel(state.tokens.next.value))
            warning("W088", state.tokens.next, state.tokens.next.value);
        }
        advance();
      }
      advance(nextop.value);
      expression(20);
      advance(")", t);
      s = block(true, true);
      if (state.option.forin && s && (s.length > 1 || typeof s[0] !== "object" ||
          s[0].value !== "if")) {
        warning("W089", this);
      }
      funct["(breakage)"] -= 1;
      funct["(loopage)"] -= 1;
    } else {
      if (foreachtok) {
        error("E045", foreachtok);
      }
      if (state.tokens.next.id !== ";") {
        if (state.tokens.next.id === "var") {
          advance("var");
          state.syntax["var"].fud.call(state.syntax["var"].fud);
        } else if (state.tokens.next.id === "let") {
          advance("let");
          // create a new block scope
          letscope = true;
          funct["(blockscope)"].stack();
          state.syntax["let"].fud.call(state.syntax["let"].fud);
        } else {
          for (;;) {
            expression(0, "for");
            if (state.tokens.next.id !== ",") {
              break;
            }
            comma();
          }
        }
      }
      nolinebreak(state.tokens.curr);
      advance(";");
      if (state.tokens.next.id !== ";") {
        checkCondAssignment(expression(0));
      }
      nolinebreak(state.tokens.curr);
      advance(";");
      if (state.tokens.next.id === ";") {
        error("E021", state.tokens.next, ")", ";");
      }
      if (state.tokens.next.id !== ")") {
        for (;;) {
          expression(0, "for");
          if (state.tokens.next.id !== ",") {
            break;
          }
          comma();
        }
      }
      advance(")", t);
      nospace(state.tokens.prev, state.tokens.curr);
      block(true, true);
      funct["(breakage)"] -= 1;
      funct["(loopage)"] -= 1;

    }
    // unstack loop blockscope
    if (letscope) {
      funct["(blockscope)"].unstack();
    }
    return this;
  }).labelled = true;


  stmt("break", function () {
    var v = state.tokens.next.value;

    if (funct["(breakage)"] === 0)
      warning("W052", state.tokens.next, this.value);

    if (!state.option.asi)
      nolinebreak(this);

    if (state.tokens.next.id !== ";" && !state.tokens.next.reach) {
      if (state.tokens.curr.line === state.tokens.next.line) {
        if (funct[v] !== "label") {
          warning("W090", state.tokens.next, v);
        } else if (scope[v] !== funct) {
          warning("W091", state.tokens.next, v);
        }
        this.first = state.tokens.next;
        advance();
      }
    }
    reachable("break");
    return this;
  }).exps = true;


  stmt("continue", function () {
    var v = state.tokens.next.value;

    if (funct["(breakage)"] === 0)
      warning("W052", state.tokens.next, this.value);

    if (!state.option.asi)
      nolinebreak(this);

    if (state.tokens.next.id !== ";" && !state.tokens.next.reach) {
      if (state.tokens.curr.line === state.tokens.next.line) {
        if (funct[v] !== "label") {
          warning("W090", state.tokens.next, v);
        } else if (scope[v] !== funct) {
          warning("W091", state.tokens.next, v);
        }
        this.first = state.tokens.next;
        advance();
      }
    } else if (!funct["(loopage)"]) {
      warning("W052", state.tokens.next, this.value);
    }
    reachable("continue");
    return this;
  }).exps = true;


  stmt("return", function () {
    if (this.line === state.tokens.next.line) {
      if (state.tokens.next.id === "(regexp)")
        warning("W092");

      if (state.tokens.next.id !== ";" && !state.tokens.next.reach) {
        nonadjacent(state.tokens.curr, state.tokens.next);
        this.first = expression(0);

        if (this.first &&
            this.first.type === "(punctuator)" && this.first.value === "=" && !state.option.boss) {
          warningAt("W093", this.first.line, this.first.character);
        }
      }
    } else {
      if (state.tokens.next.type === "(punctuator)" &&
        ["[", "{", "+", "-"].indexOf(state.tokens.next.value) > -1) {
        nolinebreak(this); // always warn (Line breaking error)
      }
    }
    reachable("return");
    return this;
  }).exps = true;

  (function (x) {
    x.exps = true;
    x.lbp = 25;
  }(prefix("yield", function () {
    var prev = state.tokens.prev;
    if (state.option.inESNext(true) && !funct["(generator)"]) {
      error("E046", state.tokens.curr, "yield");
    } else if (!state.option.inESNext()) {
      warning("W104", state.tokens.curr, "yield");
    }
    funct["(generator)"] = "yielded";
    if (this.line === state.tokens.next.line || !state.option.inMoz(true)) {
      if (state.tokens.next.id === "(regexp)")
        warning("W092");

      if (state.tokens.next.id !== ";" && !state.tokens.next.reach && state.tokens.next.nud) {
        nobreaknonadjacent(state.tokens.curr, state.tokens.next);
        this.first = expression(10);

        if (this.first.type === "(punctuator)" && this.first.value === "=" && !state.option.boss) {
          warningAt("W093", this.first.line, this.first.character);
        }
      }

      if (state.option.inMoz(true) && state.tokens.next.id !== ")" &&
          (prev.lbp > 30 || (!prev.assign && !isEndOfExpr()) || prev.id === "yield")) {
        error("E050", this);
      }
    } else if (!state.option.asi) {
      nolinebreak(this); // always warn (Line breaking error)
    }
    return this;
  })));


  stmt("throw", function () {
    nolinebreak(this);
    nonadjacent(state.tokens.curr, state.tokens.next);
    this.first = expression(20);
    reachable("throw");
    return this;
  }).exps = true;

  stmt("import", function () {
    if (!state.option.inESNext()) {
      warning("W119", state.tokens.curr, "import");
    }

    if (state.tokens.next.identifier) {
      this.name = identifier();
      addlabel(this.name, "unused", state.tokens.curr);
    } else {
      advance("{");
      for (;;) {
        var importName;
        if (state.tokens.next.type === "default") {
          importName = "default";
          advance("default");
        } else {
          importName = identifier();
        }
        if (state.tokens.next.value === "as") {
          advance("as");
          importName = identifier();
        }
        addlabel(importName, "unused", state.tokens.curr);

        if (state.tokens.next.value === ",") {
          advance(",");
        } else if (state.tokens.next.value === "}") {
          advance("}");
          break;
        } else {
          error("E024", state.tokens.next, state.tokens.next.value);
          break;
        }
      }
    }

    advance("from");
    advance("(string)");
    return this;
  }).exps = true;

  stmt("export", function () {
    if (!state.option.inESNext()) {
      warning("W119", state.tokens.curr, "export");
    }

    if (state.tokens.next.type === "default") {
      advance("default");
      if (state.tokens.next.id === "function" || state.tokens.next.id === "class") {
        this.block = true;
      }
      this.exportee = expression(10);

      return this;
    }

    if (state.tokens.next.value === "{") {
      advance("{");
      for (;;) {
        identifier();

        if (state.tokens.next.value === ",") {
          advance(",");
        } else if (state.tokens.next.value === "}") {
          advance("}");
          break;
        } else {
          error("E024", state.tokens.next, state.tokens.next.value);
          break;
        }
      }
      return this;
    }

    if (state.tokens.next.id === "var") {
      advance("var");
      state.syntax["var"].fud.call(state.syntax["var"].fud);
    } else if (state.tokens.next.id === "let") {
      advance("let");
      state.syntax["let"].fud.call(state.syntax["let"].fud);
    } else if (state.tokens.next.id === "const") {
      advance("const");
      state.syntax["const"].fud.call(state.syntax["const"].fud);
    } else if (state.tokens.next.id === "function") {
      this.block = true;
      advance("function");
      state.syntax["function"].fud();
    } else if (state.tokens.next.id === "class") {
      this.block = true;
      advance("class");
      state.syntax["class"].fud();
    } else {
      error("E024", state.tokens.next, state.tokens.next.value);
    }

    return this;
  }).exps = true;

  // Future Reserved Words

  FutureReservedWord("abstract");
  FutureReservedWord("boolean");
  FutureReservedWord("byte");
  FutureReservedWord("char");
  FutureReservedWord("class", { es5: true, nud: classdef });
  FutureReservedWord("double");
  FutureReservedWord("enum", { es5: true });
  FutureReservedWord("export", { es5: true });
  FutureReservedWord("extends", { es5: true });
  FutureReservedWord("final");
  FutureReservedWord("float");
  FutureReservedWord("goto");
  FutureReservedWord("implements", { es5: true, strictOnly: true });
  FutureReservedWord("import", { es5: true });
  FutureReservedWord("int");
  FutureReservedWord("interface", { es5: true, strictOnly: true });
  FutureReservedWord("long");
  FutureReservedWord("native");
  FutureReservedWord("package", { es5: true, strictOnly: true });
  FutureReservedWord("private", { es5: true, strictOnly: true });
  FutureReservedWord("protected", { es5: true, strictOnly: true });
  FutureReservedWord("public", { es5: true, strictOnly: true });
  FutureReservedWord("short");
  FutureReservedWord("static", { es5: true, strictOnly: true });
  FutureReservedWord("super", { es5: true });
  FutureReservedWord("synchronized");
  FutureReservedWord("throws");
  FutureReservedWord("transient");
  FutureReservedWord("volatile");

  // this function is used to determine wether a squarebracket or a curlybracket
  // expression is a comprehension array, destructuring assignment or a json value.

  var lookupBlockType = function () {
    var pn, pn1;
    var i = -1;
    var bracketStack = 0;
    var ret = {};
    if (_.contains(["[", "{"], state.tokens.curr.value))
      bracketStack += 1;
    do {
      pn = (i === -1) ? state.tokens.next : peek(i);
      pn1 = peek(i + 1);
      i = i + 1;
      if (_.contains(["[", "{"], pn.value)) {
        bracketStack += 1;
      } else if (_.contains(["]", "}"], pn.value)) {
        bracketStack -= 1;
      }
      if (pn.identifier && pn.value === "for" && bracketStack === 1) {
        ret.isCompArray = true;
        ret.notJson = true;
        break;
      }
      if (_.contains(["}", "]"], pn.value) && pn1.value === "=" && bracketStack === 0) {
        ret.isDestAssign = true;
        ret.notJson = true;
        break;
      }
      if (pn.value === ";") {
        ret.isBlock = true;
        ret.notJson = true;
      }
    } while (bracketStack > 0 && pn.id !== "(end)" && i < 15);
    return ret;
  };

  // Check whether this function has been reached for a destructuring assign with undeclared values
  function destructuringAssignOrJsonValue() {
    // lookup for the assignment (esnext only)
    // if it has semicolons, it is a block, so go parse it as a block
    // or it's not a block, but there are assignments, check for undeclared variables

    var block = lookupBlockType();
    if (block.notJson) {
      if (!state.option.inESNext() && block.isDestAssign) {
        warning("W104", state.tokens.curr, "destructuring assignment");
      }
      statements();
    // otherwise parse json value
    } else {
      state.option.laxbreak = true;
      state.jsonMode = true;
      jsonValue();
    }
  }

  // array comprehension parsing function
  // parses and defines the three states of the list comprehension in order
  // to avoid defining global variables, but keeping them to the list comprehension scope
  // only. The order of the states are as follows:
  //  * "use" which will be the returned iterative part of the list comprehension
  //  * "define" which will define the variables local to the list comprehension
  //  * "filter" which will help filter out values

  var arrayComprehension = function () {
    var CompArray = function () {
      this.mode = "use";
      this.variables = [];
    };
    var _carrays = [];
    var _current;
    function declare(v) {
      var l = _current.variables.filter(function (elt) {
        // if it has, change its undef state
        if (elt.value === v) {
          elt.undef = false;
          return v;
        }
      }).length;
      return l !== 0;
    }
    function use(v) {
      var l = _current.variables.filter(function (elt) {
        // and if it has been defined
        if (elt.value === v && !elt.undef) {
          if (elt.unused === true) {
            elt.unused = false;
          }
          return v;
        }
      }).length;
      // otherwise we warn about it
      return (l === 0);
    }
    return {stack: function () {
          _current = new CompArray();
          _carrays.push(_current);
        },
        unstack: function () {
          _current.variables.filter(function (v) {
            if (v.unused)
              warning("W098", v.token, v.value);
            if (v.undef)
              isundef(v.funct, "W117", v.token, v.value);
          });
          _carrays.splice(-1, 1);
          _current = _carrays[_carrays.length - 1];
        },
        setState: function (s) {
          if (_.contains(["use", "define", "generate", "filter"], s))
            _current.mode = s;
        },
        check: function (v) {
          if (!_current) {
            return;
          }
          // When we are in "use" state of the list comp, we enqueue that var
          if (_current && _current.mode === "use") {
            if (use(v)) {
              _current.variables.push({
                funct: funct,
                token: state.tokens.curr,
                value: v,
                undef: true,
                unused: false
              });
            }
            return true;
          // When we are in "define" state of the list comp,
          } else if (_current && _current.mode === "define") {
            // check if the variable has been used previously
            if (!declare(v)) {
              _current.variables.push({
                funct: funct,
                token: state.tokens.curr,
                value: v,
                undef: false,
                unused: true
              });
            }
            return true;
          // When we are in the "generate" state of the list comp,
          } else if (_current && _current.mode === "generate") {
            isundef(funct, "W117", state.tokens.curr, v);
            return true;
          // When we are in "filter" state,
          } else if (_current && _current.mode === "filter") {
            // we check whether current variable has been declared
            if (use(v)) {
              // if not we warn about it
              isundef(funct, "W117", state.tokens.curr, v);
            }
            return true;
          }
          return false;
        }
        };
  };


  // Parse JSON

  function jsonValue() {

    function jsonObject() {
      var o = {}, t = state.tokens.next;
      advance("{");
      if (state.tokens.next.id !== "}") {
        for (;;) {
          if (state.tokens.next.id === "(end)") {
            error("E026", state.tokens.next, t.line);
          } else if (state.tokens.next.id === "}") {
            warning("W094", state.tokens.curr);
            break;
          } else if (state.tokens.next.id === ",") {
            error("E028", state.tokens.next);
          } else if (state.tokens.next.id !== "(string)") {
            warning("W095", state.tokens.next, state.tokens.next.value);
          }
          if (o[state.tokens.next.value] === true) {
            warning("W075", state.tokens.next, state.tokens.next.value);
          } else if ((state.tokens.next.value === "__proto__" &&
            !state.option.proto) || (state.tokens.next.value === "__iterator__" &&
            !state.option.iterator)) {
            warning("W096", state.tokens.next, state.tokens.next.value);
          } else {
            o[state.tokens.next.value] = true;
          }
          advance();
          advance(":");
          jsonValue();
          if (state.tokens.next.id !== ",") {
            break;
          }
          advance(",");
        }
      }
      advance("}");
    }

    function jsonArray() {
      var t = state.tokens.next;
      advance("[");
      if (state.tokens.next.id !== "]") {
        for (;;) {
          if (state.tokens.next.id === "(end)") {
            error("E027", state.tokens.next, t.line);
          } else if (state.tokens.next.id === "]") {
            warning("W094", state.tokens.curr);
            break;
          } else if (state.tokens.next.id === ",") {
            error("E028", state.tokens.next);
          }
          jsonValue();
          if (state.tokens.next.id !== ",") {
            break;
          }
          advance(",");
        }
      }
      advance("]");
    }

    switch (state.tokens.next.id) {
    case "{":
      jsonObject();
      break;
    case "[":
      jsonArray();
      break;
    case "true":
    case "false":
    case "null":
    case "(number)":
    case "(string)":
      advance();
      break;
    case "-":
      advance("-");
      if (state.tokens.curr.character !== state.tokens.next.from) {
        warning("W011", state.tokens.curr);
      }
      adjacent(state.tokens.curr, state.tokens.next);
      advance("(number)");
      break;
    default:
      error("E003", state.tokens.next);
    }
  }

  var blockScope = function () {
    var _current = {};
    var _variables = [_current];

    function _checkBlockLabels() {
      for (var t in _current) {
        if (_current[t]["(type)"] === "unused") {
          if (state.option.unused) {
            var tkn = _current[t]["(token)"];
            var line = tkn.line;
            var chr  = tkn.character;
            warningAt("W098", line, chr, t);
          }
        }
      }
    }

    return {
      stack: function () {
        _current = {};
        _variables.push(_current);
      },

      unstack: function () {
        _checkBlockLabels();
        _variables.splice(_variables.length - 1, 1);
        _current = _variables[_variables.length - 1];
      },

      getlabel: function (l) {
        for (var i = _variables.length - 1 ; i >= 0; --i) {
          if (_.has(_variables[i], l)) {
            return _variables[i];
          }
        }
      },

      current: {
        has: function (t) {
          return _.has(_current, t);
        },
        add: function (t, type, tok) {
          _current[t] = { "(type)" : type,
                  "(token)": tok };
        }
      }
    };
  };

  // The actual JSHINT function itself.
  var itself = function (s, o, g) {
    var i, k, x;
    var optionKeys;
    var newOptionObj = {};
    var newIgnoredObj = {};

    state.reset();

    if (o && o.scope) {
      JSHINT.scope = o.scope;
    } else {
      JSHINT.errors = [];
      JSHINT.undefs = [];
      JSHINT.internals = [];
      JSHINT.blacklist = {};
      JSHINT.scope = "(main)";
    }

    predefined = Object.create(null);
    combine(predefined, vars.ecmaIdentifiers);
    combine(predefined, vars.reservedVars);

    combine(predefined, g || {});

    declared = Object.create(null);
    exported = Object.create(null);

    function each(obj, cb) {
      if (!obj)
        return;

      if (!Array.isArray(obj) && typeof obj === "object")
        obj = Object.keys(obj);

      obj.forEach(cb);
    }

    if (o) {
      each(o.predef || null, function (item) {
        var slice, prop;

        if (item[0] === "-") {
          slice = item.slice(1);
          JSHINT.blacklist[slice] = slice;
        } else {
          prop = Object.getOwnPropertyDescriptor(o.predef, item);
          predefined[item] = prop ? prop.value : false;
        }
      });

      each(o.exported || null, function (item) {
        exported[item] = true;
      });

      delete o.predef;
      delete o.exported;

      optionKeys = Object.keys(o);
      for (x = 0; x < optionKeys.length; x++) {
        if (/^-W\d{3}$/g.test(optionKeys[x])) {
          newIgnoredObj[optionKeys[x].slice(1)] = true;
        } else {
          newOptionObj[optionKeys[x]] = o[optionKeys[x]];

          if (optionKeys[x] === "newcap" && o[optionKeys[x]] === false)
            newOptionObj["(explicitNewcap)"] = true;

          if (optionKeys[x] === "indent")
            newOptionObj["(explicitIndent)"] = o[optionKeys[x]] === false ? false : true;
        }
      }
    }

    state.option = newOptionObj;
    state.ignored = newIgnoredObj;

    state.option.indent = state.option.indent || 4;
    state.option.maxerr = state.option.maxerr || 50;

    indent = 1;
    global = Object.create(predefined);
    scope = global;
    funct = {
      "(global)":   true,
      "(name)":   "(global)",
      "(scope)":    scope,
      "(breakage)": 0,
      "(loopage)":  0,
      "(tokens)":   {},
      "(metrics)":   createMetrics(state.tokens.next),
      "(blockscope)": blockScope(),
      "(comparray)": arrayComprehension()
    };
    functions = [funct];
    urls = [];
    stack = null;
    member = {};
    membersOnly = null;
    implied = {};
    inblock = false;
    lookahead = [];
    warnings = 0;
    unuseds = [];

    if (!isString(s) && !Array.isArray(s)) {
      errorAt("E004", 0);
      return false;
    }

    api = {
      get isJSON() {
        return state.jsonMode;
      },

      getOption: function (name) {
        return state.option[name] || null;
      },

      getCache: function (name) {
        return state.cache[name];
      },

      setCache: function (name, value) {
        state.cache[name] = value;
      },

      warn: function (code, data) {
        warningAt.apply(null, [ code, data.line, data.char ].concat(data.data));
      },

      on: function (names, listener) {
        names.split(" ").forEach(function (name) {
          emitter.on(name, listener);
        }.bind(this));
      }
    };

    emitter.removeAllListeners();
    (extraModules || []).forEach(function (func) {
      func(api);
    });

    state.tokens.prev = state.tokens.curr = state.tokens.next = state.syntax["(begin)"];

    lex = new Lexer(s);

    lex.on("warning", function (ev) {
      warningAt.apply(null, [ ev.code, ev.line, ev.character].concat(ev.data));
    });

    lex.on("error", function (ev) {
      errorAt.apply(null, [ ev.code, ev.line, ev.character ].concat(ev.data));
    });

    lex.on("fatal", function (ev) {
      quit("E041", ev.line, ev.from);
    });

    lex.on("Identifier", function (ev) {
      emitter.emit("Identifier", ev);
    });

    lex.on("String", function (ev) {
      emitter.emit("String", ev);
    });

    lex.on("Number", function (ev) {
      emitter.emit("Number", ev);
    });

    lex.start();

    // Check options
    for (var name in o) {
      if (_.has(o, name)) {
        checkOption(name, state.tokens.curr);
      }
    }

    assume();

    // combine the passed globals after we've assumed all our options
    combine(predefined, g || {});

    //reset values
    comma.first = true;

    try {
      advance();
      switch (state.tokens.next.id) {
      case "{":
      case "[":
        destructuringAssignOrJsonValue();
        break;
      default:
        directives();

        if (state.directive["use strict"]) {
          if (!state.option.globalstrict && !(state.option.node || state.option.phantom)) {
            warning("W097", state.tokens.prev);
          }
        }

        statements();
      }
      advance((state.tokens.next && state.tokens.next.value !== ".")  ? "(end)" : undefined);
      funct["(blockscope)"].unstack();

      var markDefined = function (name, context) {
        do {
          if (typeof context[name] === "string") {
            // JSHINT marks unused variables as 'unused' and
            // unused function declaration as 'unction'. This
            // code changes such instances back 'var' and
            // 'closure' so that the code in JSHINT.data()
            // doesn't think they're unused.

            if (context[name] === "unused")
              context[name] = "var";
            else if (context[name] === "unction")
              context[name] = "closure";

            return true;
          }

          context = context["(context)"];
        } while (context);

        return false;
      };

      var clearImplied = function (name, line) {
        if (!implied[name])
          return;

        var newImplied = [];
        for (var i = 0; i < implied[name].length; i += 1) {
          if (implied[name][i] !== line)
            newImplied.push(implied[name][i]);
        }

        if (newImplied.length === 0)
          delete implied[name];
        else
          implied[name] = newImplied;
      };

      var warnUnused = function (name, tkn, type, unused_opt) {
        var line = tkn.line;
        var chr  = tkn.character;

        if (unused_opt === undefined) {
          unused_opt = state.option.unused;
        }

        if (unused_opt === true) {
          unused_opt = "last-param";
        }

        var warnable_types = {
          "vars": ["var"],
          "last-param": ["var", "param"],
          "strict": ["var", "param", "last-param"]
        };

        if (unused_opt) {
          if (warnable_types[unused_opt] && warnable_types[unused_opt].indexOf(type) !== -1) {
            warningAt("W098", line, chr, name);
          }
        }

        unuseds.push({
          name: name,
          line: line,
          character: chr
        });
      };

      var checkUnused = function (func, key) {
        var type = func[key];
        var tkn = func["(tokens)"][key];

        if (key.charAt(0) === "(")
          return;

        if (type !== "unused" && type !== "unction")
          return;

        // Params are checked separately from other variables.
        if (func["(params)"] && func["(params)"].indexOf(key) !== -1)
          return;

        // Variable is in global scope and defined as exported.
        if (func["(global)"] && _.has(exported, key)) {
          return;
        }

        warnUnused(key, tkn, "var");
      };

      // Check queued 'x is not defined' instances to see if they're still undefined.
      for (i = 0; i < JSHINT.undefs.length; i += 1) {
        k = JSHINT.undefs[i].slice(0);

        if (markDefined(k[2].value, k[0])) {
          clearImplied(k[2].value, k[2].line);
        } else if (state.option.undef) {
          warning.apply(warning, k.slice(1));
        }
      }

      functions.forEach(function (func) {
        if (func["(unusedOption)"] === false) {
          return;
        }

        for (var key in func) {
          if (_.has(func, key)) {
            checkUnused(func, key);
          }
        }

        if (!func["(params)"])
          return;

        var params = func["(params)"].slice();
        var param  = params.pop();
        var type, unused_opt;

        while (param) {
          type = func[param];
          unused_opt = func["(unusedOption)"] || state.option.unused;
          unused_opt = unused_opt === true ? "last-param" : unused_opt;

          // 'undefined' is a special case for (function (window, undefined) { ... })();
          // patterns.

          if (param === "undefined")
            return;

          if (type === "unused" || type === "unction") {
            warnUnused(param, func["(tokens)"][param], "param", func["(unusedOption)"]);
          } else if (unused_opt === "last-param") {
            return;
          }

          param = params.pop();
        }
      });

      for (var key in declared) {
        if (_.has(declared, key) && !_.has(global, key)) {
          warnUnused(key, declared[key], "var");
        }
      }

    } catch (err) {
      if (err && err.name === "JSHintError") {
        var nt = state.tokens.next || {};
        JSHINT.errors.push({
          scope     : "(main)",
          raw       : err.raw,
          code      : err.code,
          reason    : err.message,
          line      : err.line || nt.line,
          character : err.character || nt.from
        }, null);
      } else {
        throw err;
      }
    }

    // Loop over the listed "internals", and check them as well.

    if (JSHINT.scope === "(main)") {
      o = o || {};

      for (i = 0; i < JSHINT.internals.length; i += 1) {
        k = JSHINT.internals[i];
        o.scope = k.elem;
        itself(k.value, o, g);
      }
    }

    return JSHINT.errors.length === 0;
  };

  // Modules.
  itself.addModule = function (func) {
    extraModules.push(func);
  };

  itself.addModule(style.register);

  // Data summary.
  itself.data = function () {
    var data = {
      functions: [],
      options: state.option
    };

    var implieds = [];
    var members = [];
    var fu, f, i, j, n, globals;

    if (itself.errors.length) {
      data.errors = itself.errors;
    }

    if (state.jsonMode) {
      data.json = true;
    }

    for (n in implied) {
      if (_.has(implied, n)) {
        implieds.push({
          name: n,
          line: implied[n]
        });
      }
    }

    if (implieds.length > 0) {
      data.implieds = implieds;
    }

    if (urls.length > 0) {
      data.urls = urls;
    }

    globals = Object.keys(scope);
    if (globals.length > 0) {
      data.globals = globals;
    }

    for (i = 1; i < functions.length; i += 1) {
      f = functions[i];
      fu = {};

      for (j = 0; j < functionicity.length; j += 1) {
        fu[functionicity[j]] = [];
      }

      for (j = 0; j < functionicity.length; j += 1) {
        if (fu[functionicity[j]].length === 0) {
          delete fu[functionicity[j]];
        }
      }

      fu.name = f["(name)"];
      fu.param = f["(params)"];
      fu.line = f["(line)"];
      fu.character = f["(character)"];
      fu.last = f["(last)"];
      fu.lastcharacter = f["(lastcharacter)"];

      fu.metrics = {
        complexity: f["(metrics)"].ComplexityCount,
        parameters: (f["(params)"] || []).length,
        statements: f["(metrics)"].statementCount
      };

      data.functions.push(fu);
    }

    if (unuseds.length > 0) {
      data.unused = unuseds;
    }

    members = [];
    for (n in member) {
      if (typeof member[n] === "number") {
        data.member = member;
        break;
      }
    }

    return data;
  };

  itself.jshint = itself;

  return itself;
}());

// Make JSHINT a Node module, if possible.
if (typeof exports === "object" && exports) {
  exports.JSHINT = JSHINT;
}

})()
},{"events":2,"./vars.js":3,"./messages.js":4,"./lex.js":8,"./reg.js":5,"./state.js":6,"./style.js":7,"console-browserify":9}],9:[function(require,module,exports){
(function(global){/*global window, global*/
var util = require("util")
var assert = require("assert")

var slice = Array.prototype.slice
var console
var times = {}

if (typeof global !== "undefined" && global.console) {
    console = global.console
} else if (typeof window !== "undefined" && window.console) {
    console = window.console
} else {
    console = window.console = {}
}

var functions = [
    [log, "log"]
    , [info, "info"]
    , [warn, "warn"]
    , [error, "error"]
    , [time, "time"]
    , [timeEnd, "timeEnd"]
    , [trace, "trace"]
    , [dir, "dir"]
    , [assert, "assert"]
]

for (var i = 0; i < functions.length; i++) {
    var tuple = functions[i]
    var f = tuple[0]
    var name = tuple[1]

    if (!console[name]) {
        console[name] = f
    }
}

module.exports = console

function log() {}

function info() {
    console.log.apply(console, arguments)
}

function warn() {
    console.log.apply(console, arguments)
}

function error() {
    console.warn.apply(console, arguments)
}

function time(label) {
    times[label] = Date.now()
}

function timeEnd(label) {
    var time = times[label]
    if (!time) {
        throw new Error("No such label: " + label)
    }

    var duration = Date.now() - time
    console.log(label + ": " + duration + "ms")
}

function trace() {
    var err = new Error()
    err.name = "Trace"
    err.message = util.format.apply(null, arguments)
    console.error(err.stack)
}

function dir(object) {
    console.log(util.inspect(object) + "\n")
}

function assert(expression) {
    if (!expression) {
        var arr = slice.call(arguments, 1)
        assert.ok(false, util.format.apply(null, arr))
    }
}

})(window)
},{"util":10,"assert":11}],10:[function(require,module,exports){
var events = require('events');

exports.isArray = isArray;
exports.isDate = function(obj){return Object.prototype.toString.call(obj) === '[object Date]'};
exports.isRegExp = function(obj){return Object.prototype.toString.call(obj) === '[object RegExp]'};


exports.print = function () {};
exports.puts = function () {};
exports.debug = function() {};

exports.inspect = function(obj, showHidden, depth, colors) {
  var seen = [];

  var stylize = function(str, styleType) {
    // http://en.wikipedia.org/wiki/ANSI_escape_code#graphics
    var styles =
        { 'bold' : [1, 22],
          'italic' : [3, 23],
          'underline' : [4, 24],
          'inverse' : [7, 27],
          'white' : [37, 39],
          'grey' : [90, 39],
          'black' : [30, 39],
          'blue' : [34, 39],
          'cyan' : [36, 39],
          'green' : [32, 39],
          'magenta' : [35, 39],
          'red' : [31, 39],
          'yellow' : [33, 39] };

    var style =
        { 'special': 'cyan',
          'number': 'blue',
          'boolean': 'yellow',
          'undefined': 'grey',
          'null': 'bold',
          'string': 'green',
          'date': 'magenta',
          // "name": intentionally not styling
          'regexp': 'red' }[styleType];

    if (style) {
      return '\033[' + styles[style][0] + 'm' + str +
             '\033[' + styles[style][1] + 'm';
    } else {
      return str;
    }
  };
  if (! colors) {
    stylize = function(str, styleType) { return str; };
  }

  function format(value, recurseTimes) {
    // Provide a hook for user-specified inspect functions.
    // Check that value is an object with an inspect function on it
    if (value && typeof value.inspect === 'function' &&
        // Filter out the util module, it's inspect function is special
        value !== exports &&
        // Also filter out any prototype objects using the circular check.
        !(value.constructor && value.constructor.prototype === value)) {
      return value.inspect(recurseTimes);
    }

    // Primitive types cannot have properties
    switch (typeof value) {
      case 'undefined':
        return stylize('undefined', 'undefined');

      case 'string':
        var simple = '\'' + JSON.stringify(value).replace(/^"|"$/g, '')
                                                 .replace(/'/g, "\\'")
                                                 .replace(/\\"/g, '"') + '\'';
        return stylize(simple, 'string');

      case 'number':
        return stylize('' + value, 'number');

      case 'boolean':
        return stylize('' + value, 'boolean');
    }
    // For some reason typeof null is "object", so special case here.
    if (value === null) {
      return stylize('null', 'null');
    }

    // Look up the keys of the object.
    var visible_keys = Object_keys(value);
    var keys = showHidden ? Object_getOwnPropertyNames(value) : visible_keys;

    // Functions without properties can be shortcutted.
    if (typeof value === 'function' && keys.length === 0) {
      if (isRegExp(value)) {
        return stylize('' + value, 'regexp');
      } else {
        var name = value.name ? ': ' + value.name : '';
        return stylize('[Function' + name + ']', 'special');
      }
    }

    // Dates without properties can be shortcutted
    if (isDate(value) && keys.length === 0) {
      return stylize(value.toUTCString(), 'date');
    }

    var base, type, braces;
    // Determine the object type
    if (isArray(value)) {
      type = 'Array';
      braces = ['[', ']'];
    } else {
      type = 'Object';
      braces = ['{', '}'];
    }

    // Make functions say that they are functions
    if (typeof value === 'function') {
      var n = value.name ? ': ' + value.name : '';
      base = (isRegExp(value)) ? ' ' + value : ' [Function' + n + ']';
    } else {
      base = '';
    }

    // Make dates with properties first say the date
    if (isDate(value)) {
      base = ' ' + value.toUTCString();
    }

    if (keys.length === 0) {
      return braces[0] + base + braces[1];
    }

    if (recurseTimes < 0) {
      if (isRegExp(value)) {
        return stylize('' + value, 'regexp');
      } else {
        return stylize('[Object]', 'special');
      }
    }

    seen.push(value);

    var output = keys.map(function(key) {
      var name, str;
      if (value.__lookupGetter__) {
        if (value.__lookupGetter__(key)) {
          if (value.__lookupSetter__(key)) {
            str = stylize('[Getter/Setter]', 'special');
          } else {
            str = stylize('[Getter]', 'special');
          }
        } else {
          if (value.__lookupSetter__(key)) {
            str = stylize('[Setter]', 'special');
          }
        }
      }
      if (visible_keys.indexOf(key) < 0) {
        name = '[' + key + ']';
      }
      if (!str) {
        if (seen.indexOf(value[key]) < 0) {
          if (recurseTimes === null) {
            str = format(value[key]);
          } else {
            str = format(value[key], recurseTimes - 1);
          }
          if (str.indexOf('\n') > -1) {
            if (isArray(value)) {
              str = str.split('\n').map(function(line) {
                return '  ' + line;
              }).join('\n').substr(2);
            } else {
              str = '\n' + str.split('\n').map(function(line) {
                return '   ' + line;
              }).join('\n');
            }
          }
        } else {
          str = stylize('[Circular]', 'special');
        }
      }
      if (typeof name === 'undefined') {
        if (type === 'Array' && key.match(/^\d+$/)) {
          return str;
        }
        name = JSON.stringify('' + key);
        if (name.match(/^"([a-zA-Z_][a-zA-Z_0-9]*)"$/)) {
          name = name.substr(1, name.length - 2);
          name = stylize(name, 'name');
        } else {
          name = name.replace(/'/g, "\\'")
                     .replace(/\\"/g, '"')
                     .replace(/(^"|"$)/g, "'");
          name = stylize(name, 'string');
        }
      }

      return name + ': ' + str;
    });

    seen.pop();

    var numLinesEst = 0;
    var length = output.reduce(function(prev, cur) {
      numLinesEst++;
      if (cur.indexOf('\n') >= 0) numLinesEst++;
      return prev + cur.length + 1;
    }, 0);

    if (length > 50) {
      output = braces[0] +
               (base === '' ? '' : base + '\n ') +
               ' ' +
               output.join(',\n  ') +
               ' ' +
               braces[1];

    } else {
      output = braces[0] + base + ' ' + output.join(', ') + ' ' + braces[1];
    }

    return output;
  }
  return format(obj, (typeof depth === 'undefined' ? 2 : depth));
};


function isArray(ar) {
  return ar instanceof Array ||
         Array.isArray(ar) ||
         (ar && ar !== Object.prototype && isArray(ar.__proto__));
}


function isRegExp(re) {
  return re instanceof RegExp ||
    (typeof re === 'object' && Object.prototype.toString.call(re) === '[object RegExp]');
}


function isDate(d) {
  if (d instanceof Date) return true;
  if (typeof d !== 'object') return false;
  var properties = Date.prototype && Object_getOwnPropertyNames(Date.prototype);
  var proto = d.__proto__ && Object_getOwnPropertyNames(d.__proto__);
  return JSON.stringify(proto) === JSON.stringify(properties);
}

function pad(n) {
  return n < 10 ? '0' + n.toString(10) : n.toString(10);
}

var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep',
              'Oct', 'Nov', 'Dec'];

// 26 Feb 16:19:34
function timestamp() {
  var d = new Date();
  var time = [pad(d.getHours()),
              pad(d.getMinutes()),
              pad(d.getSeconds())].join(':');
  return [d.getDate(), months[d.getMonth()], time].join(' ');
}

exports.log = function (msg) {};

exports.pump = null;

var Object_keys = Object.keys || function (obj) {
    var res = [];
    for (var key in obj) res.push(key);
    return res;
};

var Object_getOwnPropertyNames = Object.getOwnPropertyNames || function (obj) {
    var res = [];
    for (var key in obj) {
        if (Object.hasOwnProperty.call(obj, key)) res.push(key);
    }
    return res;
};

var Object_create = Object.create || function (prototype, properties) {
    // from es5-shim
    var object;
    if (prototype === null) {
        object = { '__proto__' : null };
    }
    else {
        if (typeof prototype !== 'object') {
            throw new TypeError(
                'typeof prototype[' + (typeof prototype) + '] != \'object\''
            );
        }
        var Type = function () {};
        Type.prototype = prototype;
        object = new Type();
        object.__proto__ = prototype;
    }
    if (typeof properties !== 'undefined' && Object.defineProperties) {
        Object.defineProperties(object, properties);
    }
    return object;
};

exports.inherits = function(ctor, superCtor) {
  ctor.super_ = superCtor;
  ctor.prototype = Object_create(superCtor.prototype, {
    constructor: {
      value: ctor,
      enumerable: false,
      writable: true,
      configurable: true
    }
  });
};

var formatRegExp = /%[sdj%]/g;
exports.format = function(f) {
  if (typeof f !== 'string') {
    var objects = [];
    for (var i = 0; i < arguments.length; i++) {
      objects.push(exports.inspect(arguments[i]));
    }
    return objects.join(' ');
  }

  var i = 1;
  var args = arguments;
  var len = args.length;
  var str = String(f).replace(formatRegExp, function(x) {
    if (x === '%%') return '%';
    if (i >= len) return x;
    switch (x) {
      case '%s': return String(args[i++]);
      case '%d': return Number(args[i++]);
      case '%j': return JSON.stringify(args[i++]);
      default:
        return x;
    }
  });
  for(var x = args[i]; i < len; x = args[++i]){
    if (x === null || typeof x !== 'object') {
      str += ' ' + x;
    } else {
      str += ' ' + exports.inspect(x);
    }
  }
  return str;
};

},{"events":2}],11:[function(require,module,exports){
(function(){// UTILITY
var util = require('util');
var Buffer = require("buffer").Buffer;
var pSlice = Array.prototype.slice;

function objectKeys(object) {
  if (Object.keys) return Object.keys(object);
  var result = [];
  for (var name in object) {
    if (Object.prototype.hasOwnProperty.call(object, name)) {
      result.push(name);
    }
  }
  return result;
}

// 1. The assert module provides functions that throw
// AssertionError's when particular conditions are not met. The
// assert module must conform to the following interface.

var assert = module.exports = ok;

// 2. The AssertionError is defined in assert.
// new assert.AssertionError({ message: message,
//                             actual: actual,
//                             expected: expected })

assert.AssertionError = function AssertionError(options) {
  this.name = 'AssertionError';
  this.message = options.message;
  this.actual = options.actual;
  this.expected = options.expected;
  this.operator = options.operator;
  var stackStartFunction = options.stackStartFunction || fail;

  if (Error.captureStackTrace) {
    Error.captureStackTrace(this, stackStartFunction);
  }
};
util.inherits(assert.AssertionError, Error);

function replacer(key, value) {
  if (value === undefined) {
    return '' + value;
  }
  if (typeof value === 'number' && (isNaN(value) || !isFinite(value))) {
    return value.toString();
  }
  if (typeof value === 'function' || value instanceof RegExp) {
    return value.toString();
  }
  return value;
}

function truncate(s, n) {
  if (typeof s == 'string') {
    return s.length < n ? s : s.slice(0, n);
  } else {
    return s;
  }
}

assert.AssertionError.prototype.toString = function() {
  if (this.message) {
    return [this.name + ':', this.message].join(' ');
  } else {
    return [
      this.name + ':',
      truncate(JSON.stringify(this.actual, replacer), 128),
      this.operator,
      truncate(JSON.stringify(this.expected, replacer), 128)
    ].join(' ');
  }
};

// assert.AssertionError instanceof Error

assert.AssertionError.__proto__ = Error.prototype;

// At present only the three keys mentioned above are used and
// understood by the spec. Implementations or sub modules can pass
// other keys to the AssertionError's constructor - they will be
// ignored.

// 3. All of the following functions must throw an AssertionError
// when a corresponding condition is not met, with a message that
// may be undefined if not provided.  All assertion methods provide
// both the actual and expected values to the assertion error for
// display purposes.

function fail(actual, expected, message, operator, stackStartFunction) {
  throw new assert.AssertionError({
    message: message,
    actual: actual,
    expected: expected,
    operator: operator,
    stackStartFunction: stackStartFunction
  });
}

// EXTENSION! allows for well behaved errors defined elsewhere.
assert.fail = fail;

// 4. Pure assertion tests whether a value is truthy, as determined
// by !!guard.
// assert.ok(guard, message_opt);
// This statement is equivalent to assert.equal(true, guard,
// message_opt);. To test strictly for the value true, use
// assert.strictEqual(true, guard, message_opt);.

function ok(value, message) {
  if (!!!value) fail(value, true, message, '==', assert.ok);
}
assert.ok = ok;

// 5. The equality assertion tests shallow, coercive equality with
// ==.
// assert.equal(actual, expected, message_opt);

assert.equal = function equal(actual, expected, message) {
  if (actual != expected) fail(actual, expected, message, '==', assert.equal);
};

// 6. The non-equality assertion tests for whether two objects are not equal
// with != assert.notEqual(actual, expected, message_opt);

assert.notEqual = function notEqual(actual, expected, message) {
  if (actual == expected) {
    fail(actual, expected, message, '!=', assert.notEqual);
  }
};

// 7. The equivalence assertion tests a deep equality relation.
// assert.deepEqual(actual, expected, message_opt);

assert.deepEqual = function deepEqual(actual, expected, message) {
  if (!_deepEqual(actual, expected)) {
    fail(actual, expected, message, 'deepEqual', assert.deepEqual);
  }
};

function _deepEqual(actual, expected) {
  // 7.1. All identical values are equivalent, as determined by ===.
  if (actual === expected) {
    return true;

  } else if (Buffer.isBuffer(actual) && Buffer.isBuffer(expected)) {
    if (actual.length != expected.length) return false;

    for (var i = 0; i < actual.length; i++) {
      if (actual[i] !== expected[i]) return false;
    }

    return true;

  // 7.2. If the expected value is a Date object, the actual value is
  // equivalent if it is also a Date object that refers to the same time.
  } else if (actual instanceof Date && expected instanceof Date) {
    return actual.getTime() === expected.getTime();

  // 7.3. Other pairs that do not both pass typeof value == 'object',
  // equivalence is determined by ==.
  } else if (typeof actual != 'object' && typeof expected != 'object') {
    return actual == expected;

  // 7.4. For all other Object pairs, including Array objects, equivalence is
  // determined by having the same number of owned properties (as verified
  // with Object.prototype.hasOwnProperty.call), the same set of keys
  // (although not necessarily the same order), equivalent values for every
  // corresponding key, and an identical 'prototype' property. Note: this
  // accounts for both named and indexed properties on Arrays.
  } else {
    return objEquiv(actual, expected);
  }
}

function isUndefinedOrNull(value) {
  return value === null || value === undefined;
}

function isArguments(object) {
  return Object.prototype.toString.call(object) == '[object Arguments]';
}

function objEquiv(a, b) {
  if (isUndefinedOrNull(a) || isUndefinedOrNull(b))
    return false;
  // an identical 'prototype' property.
  if (a.prototype !== b.prototype) return false;
  //~~~I've managed to break Object.keys through screwy arguments passing.
  //   Converting to array solves the problem.
  if (isArguments(a)) {
    if (!isArguments(b)) {
      return false;
    }
    a = pSlice.call(a);
    b = pSlice.call(b);
    return _deepEqual(a, b);
  }
  try {
    var ka = objectKeys(a),
        kb = objectKeys(b),
        key, i;
  } catch (e) {//happens when one is a string literal and the other isn't
    return false;
  }
  // having the same number of owned properties (keys incorporates
  // hasOwnProperty)
  if (ka.length != kb.length)
    return false;
  //the same set of keys (although not necessarily the same order),
  ka.sort();
  kb.sort();
  //~~~cheap key test
  for (i = ka.length - 1; i >= 0; i--) {
    if (ka[i] != kb[i])
      return false;
  }
  //equivalent values for every corresponding key, and
  //~~~possibly expensive deep test
  for (i = ka.length - 1; i >= 0; i--) {
    key = ka[i];
    if (!_deepEqual(a[key], b[key])) return false;
  }
  return true;
}

// 8. The non-equivalence assertion tests for any deep inequality.
// assert.notDeepEqual(actual, expected, message_opt);

assert.notDeepEqual = function notDeepEqual(actual, expected, message) {
  if (_deepEqual(actual, expected)) {
    fail(actual, expected, message, 'notDeepEqual', assert.notDeepEqual);
  }
};

// 9. The strict equality assertion tests strict equality, as determined by ===.
// assert.strictEqual(actual, expected, message_opt);

assert.strictEqual = function strictEqual(actual, expected, message) {
  if (actual !== expected) {
    fail(actual, expected, message, '===', assert.strictEqual);
  }
};

// 10. The strict non-equality assertion tests for strict inequality, as
// determined by !==.  assert.notStrictEqual(actual, expected, message_opt);

assert.notStrictEqual = function notStrictEqual(actual, expected, message) {
  if (actual === expected) {
    fail(actual, expected, message, '!==', assert.notStrictEqual);
  }
};

function expectedException(actual, expected) {
  if (!actual || !expected) {
    return false;
  }

  if (expected instanceof RegExp) {
    return expected.test(actual);
  } else if (actual instanceof expected) {
    return true;
  } else if (expected.call({}, actual) === true) {
    return true;
  }

  return false;
}

function _throws(shouldThrow, block, expected, message) {
  var actual;

  if (typeof expected === 'string') {
    message = expected;
    expected = null;
  }

  try {
    block();
  } catch (e) {
    actual = e;
  }

  message = (expected && expected.name ? ' (' + expected.name + ').' : '.') +
            (message ? ' ' + message : '.');

  if (shouldThrow && !actual) {
    fail('Missing expected exception' + message);
  }

  if (!shouldThrow && expectedException(actual, expected)) {
    fail('Got unwanted exception' + message);
  }

  if ((shouldThrow && actual && expected &&
      !expectedException(actual, expected)) || (!shouldThrow && actual)) {
    throw actual;
  }
}

// 11. Expected to throw an error:
// assert.throws(block, Error_opt, message_opt);

assert.throws = function(block, /*optional*/error, /*optional*/message) {
  _throws.apply(this, [true].concat(pSlice.call(arguments)));
};

// EXTENSION! This is annoying to write outside this module.
assert.doesNotThrow = function(block, /*optional*/error, /*optional*/message) {
  _throws.apply(this, [false].concat(pSlice.call(arguments)));
};

assert.ifError = function(err) { if (err) {throw err;}};

})()
},{"util":10,"buffer":12}],13:[function(require,module,exports){
exports.readIEEE754 = function(buffer, offset, isBE, mLen, nBytes) {
  var e, m,
      eLen = nBytes * 8 - mLen - 1,
      eMax = (1 << eLen) - 1,
      eBias = eMax >> 1,
      nBits = -7,
      i = isBE ? 0 : (nBytes - 1),
      d = isBE ? 1 : -1,
      s = buffer[offset + i];

  i += d;

  e = s & ((1 << (-nBits)) - 1);
  s >>= (-nBits);
  nBits += eLen;
  for (; nBits > 0; e = e * 256 + buffer[offset + i], i += d, nBits -= 8);

  m = e & ((1 << (-nBits)) - 1);
  e >>= (-nBits);
  nBits += mLen;
  for (; nBits > 0; m = m * 256 + buffer[offset + i], i += d, nBits -= 8);

  if (e === 0) {
    e = 1 - eBias;
  } else if (e === eMax) {
    return m ? NaN : ((s ? -1 : 1) * Infinity);
  } else {
    m = m + Math.pow(2, mLen);
    e = e - eBias;
  }
  return (s ? -1 : 1) * m * Math.pow(2, e - mLen);
};

exports.writeIEEE754 = function(buffer, value, offset, isBE, mLen, nBytes) {
  var e, m, c,
      eLen = nBytes * 8 - mLen - 1,
      eMax = (1 << eLen) - 1,
      eBias = eMax >> 1,
      rt = (mLen === 23 ? Math.pow(2, -24) - Math.pow(2, -77) : 0),
      i = isBE ? (nBytes - 1) : 0,
      d = isBE ? -1 : 1,
      s = value < 0 || (value === 0 && 1 / value < 0) ? 1 : 0;

  value = Math.abs(value);

  if (isNaN(value) || value === Infinity) {
    m = isNaN(value) ? 1 : 0;
    e = eMax;
  } else {
    e = Math.floor(Math.log(value) / Math.LN2);
    if (value * (c = Math.pow(2, -e)) < 1) {
      e--;
      c *= 2;
    }
    if (e + eBias >= 1) {
      value += rt / c;
    } else {
      value += rt * Math.pow(2, 1 - eBias);
    }
    if (value * c >= 2) {
      e++;
      c /= 2;
    }

    if (e + eBias >= eMax) {
      m = 0;
      e = eMax;
    } else if (e + eBias >= 1) {
      m = (value * c - 1) * Math.pow(2, mLen);
      e = e + eBias;
    } else {
      m = value * Math.pow(2, eBias - 1) * Math.pow(2, mLen);
      e = 0;
    }
  }

  for (; mLen >= 8; buffer[offset + i] = m & 0xff, i += d, m /= 256, mLen -= 8);

  e = (e << mLen) | m;
  eLen += mLen;
  for (; eLen > 0; buffer[offset + i] = e & 0xff, i += d, e /= 256, eLen -= 8);

  buffer[offset + i - d] |= s * 128;
};

},{}],12:[function(require,module,exports){
(function(){function SlowBuffer (size) {
    this.length = size;
};

var assert = require('assert');

exports.INSPECT_MAX_BYTES = 50;


function toHex(n) {
  if (n < 16) return '0' + n.toString(16);
  return n.toString(16);
}

function utf8ToBytes(str) {
  var byteArray = [];
  for (var i = 0; i < str.length; i++)
    if (str.charCodeAt(i) <= 0x7F)
      byteArray.push(str.charCodeAt(i));
    else {
      var h = encodeURIComponent(str.charAt(i)).substr(1).split('%');
      for (var j = 0; j < h.length; j++)
        byteArray.push(parseInt(h[j], 16));
    }

  return byteArray;
}

function asciiToBytes(str) {
  var byteArray = []
  for (var i = 0; i < str.length; i++ )
    // Node's code seems to be doing this and not & 0x7F..
    byteArray.push( str.charCodeAt(i) & 0xFF );

  return byteArray;
}

function base64ToBytes(str) {
  return require("base64-js").toByteArray(str);
}

SlowBuffer.byteLength = function (str, encoding) {
  switch (encoding || "utf8") {
    case 'hex':
      return str.length / 2;

    case 'utf8':
    case 'utf-8':
      return utf8ToBytes(str).length;

    case 'ascii':
    case 'binary':
      return str.length;

    case 'base64':
      return base64ToBytes(str).length;

    default:
      throw new Error('Unknown encoding');
  }
};

function blitBuffer(src, dst, offset, length) {
  var pos, i = 0;
  while (i < length) {
    if ((i+offset >= dst.length) || (i >= src.length))
      break;

    dst[i + offset] = src[i];
    i++;
  }
  return i;
}

SlowBuffer.prototype.utf8Write = function (string, offset, length) {
  var bytes, pos;
  return SlowBuffer._charsWritten =  blitBuffer(utf8ToBytes(string), this, offset, length);
};

SlowBuffer.prototype.asciiWrite = function (string, offset, length) {
  var bytes, pos;
  return SlowBuffer._charsWritten =  blitBuffer(asciiToBytes(string), this, offset, length);
};

SlowBuffer.prototype.binaryWrite = SlowBuffer.prototype.asciiWrite;

SlowBuffer.prototype.base64Write = function (string, offset, length) {
  var bytes, pos;
  return SlowBuffer._charsWritten = blitBuffer(base64ToBytes(string), this, offset, length);
};

SlowBuffer.prototype.base64Slice = function (start, end) {
  var bytes = Array.prototype.slice.apply(this, arguments)
  return require("base64-js").fromByteArray(bytes);
}

function decodeUtf8Char(str) {
  try {
    return decodeURIComponent(str);
  } catch (err) {
    return String.fromCharCode(0xFFFD); // UTF 8 invalid char
  }
}

SlowBuffer.prototype.utf8Slice = function () {
  var bytes = Array.prototype.slice.apply(this, arguments);
  var res = "";
  var tmp = "";
  var i = 0;
  while (i < bytes.length) {
    if (bytes[i] <= 0x7F) {
      res += decodeUtf8Char(tmp) + String.fromCharCode(bytes[i]);
      tmp = "";
    } else
      tmp += "%" + bytes[i].toString(16);

    i++;
  }

  return res + decodeUtf8Char(tmp);
}

SlowBuffer.prototype.asciiSlice = function () {
  var bytes = Array.prototype.slice.apply(this, arguments);
  var ret = "";
  for (var i = 0; i < bytes.length; i++)
    ret += String.fromCharCode(bytes[i]);
  return ret;
}

SlowBuffer.prototype.binarySlice = SlowBuffer.prototype.asciiSlice;

SlowBuffer.prototype.inspect = function() {
  var out = [],
      len = this.length;
  for (var i = 0; i < len; i++) {
    out[i] = toHex(this[i]);
    if (i == exports.INSPECT_MAX_BYTES) {
      out[i + 1] = '...';
      break;
    }
  }
  return '<SlowBuffer ' + out.join(' ') + '>';
};


SlowBuffer.prototype.hexSlice = function(start, end) {
  var len = this.length;

  if (!start || start < 0) start = 0;
  if (!end || end < 0 || end > len) end = len;

  var out = '';
  for (var i = start; i < end; i++) {
    out += toHex(this[i]);
  }
  return out;
};


SlowBuffer.prototype.toString = function(encoding, start, end) {
  encoding = String(encoding || 'utf8').toLowerCase();
  start = +start || 0;
  if (typeof end == 'undefined') end = this.length;

  // Fastpath empty strings
  if (+end == start) {
    return '';
  }

  switch (encoding) {
    case 'hex':
      return this.hexSlice(start, end);

    case 'utf8':
    case 'utf-8':
      return this.utf8Slice(start, end);

    case 'ascii':
      return this.asciiSlice(start, end);

    case 'binary':
      return this.binarySlice(start, end);

    case 'base64':
      return this.base64Slice(start, end);

    case 'ucs2':
    case 'ucs-2':
      return this.ucs2Slice(start, end);

    default:
      throw new Error('Unknown encoding');
  }
};


SlowBuffer.prototype.hexWrite = function(string, offset, length) {
  offset = +offset || 0;
  var remaining = this.length - offset;
  if (!length) {
    length = remaining;
  } else {
    length = +length;
    if (length > remaining) {
      length = remaining;
    }
  }

  // must be an even number of digits
  var strLen = string.length;
  if (strLen % 2) {
    throw new Error('Invalid hex string');
  }
  if (length > strLen / 2) {
    length = strLen / 2;
  }
  for (var i = 0; i < length; i++) {
    var byte = parseInt(string.substr(i * 2, 2), 16);
    if (isNaN(byte)) throw new Error('Invalid hex string');
    this[offset + i] = byte;
  }
  SlowBuffer._charsWritten = i * 2;
  return i;
};


SlowBuffer.prototype.write = function(string, offset, length, encoding) {
  // Support both (string, offset, length, encoding)
  // and the legacy (string, encoding, offset, length)
  if (isFinite(offset)) {
    if (!isFinite(length)) {
      encoding = length;
      length = undefined;
    }
  } else {  // legacy
    var swap = encoding;
    encoding = offset;
    offset = length;
    length = swap;
  }

  offset = +offset || 0;
  var remaining = this.length - offset;
  if (!length) {
    length = remaining;
  } else {
    length = +length;
    if (length > remaining) {
      length = remaining;
    }
  }
  encoding = String(encoding || 'utf8').toLowerCase();

  switch (encoding) {
    case 'hex':
      return this.hexWrite(string, offset, length);

    case 'utf8':
    case 'utf-8':
      return this.utf8Write(string, offset, length);

    case 'ascii':
      return this.asciiWrite(string, offset, length);

    case 'binary':
      return this.binaryWrite(string, offset, length);

    case 'base64':
      return this.base64Write(string, offset, length);

    case 'ucs2':
    case 'ucs-2':
      return this.ucs2Write(string, offset, length);

    default:
      throw new Error('Unknown encoding');
  }
};


// slice(start, end)
SlowBuffer.prototype.slice = function(start, end) {
  if (end === undefined) end = this.length;

  if (end > this.length) {
    throw new Error('oob');
  }
  if (start > end) {
    throw new Error('oob');
  }

  return new Buffer(this, end - start, +start);
};

SlowBuffer.prototype.copy = function(target, targetstart, sourcestart, sourceend) {
  var temp = [];
  for (var i=sourcestart; i<sourceend; i++) {
    assert.ok(typeof this[i] !== 'undefined', "copying undefined buffer bytes!");
    temp.push(this[i]);
  }

  for (var i=targetstart; i<targetstart+temp.length; i++) {
    target[i] = temp[i-targetstart];
  }
};

SlowBuffer.prototype.fill = function(value, start, end) {
  if (end > this.length) {
    throw new Error('oob');
  }
  if (start > end) {
    throw new Error('oob');
  }

  for (var i = start; i < end; i++) {
    this[i] = value;
  }
}

function coerce(length) {
  // Coerce length to a number (possibly NaN), round up
  // in case it's fractional (e.g. 123.456) then do a
  // double negate to coerce a NaN to 0. Easy, right?
  length = ~~Math.ceil(+length);
  return length < 0 ? 0 : length;
}


// Buffer

function Buffer(subject, encoding, offset) {
  if (!(this instanceof Buffer)) {
    return new Buffer(subject, encoding, offset);
  }

  var type;

  // Are we slicing?
  if (typeof offset === 'number') {
    this.length = coerce(encoding);
    this.parent = subject;
    this.offset = offset;
  } else {
    // Find the length
    switch (type = typeof subject) {
      case 'number':
        this.length = coerce(subject);
        break;

      case 'string':
        this.length = Buffer.byteLength(subject, encoding);
        break;

      case 'object': // Assume object is an array
        this.length = coerce(subject.length);
        break;

      default:
        throw new Error('First argument needs to be a number, ' +
                        'array or string.');
    }

    if (this.length > Buffer.poolSize) {
      // Big buffer, just alloc one.
      this.parent = new SlowBuffer(this.length);
      this.offset = 0;

    } else {
      // Small buffer.
      if (!pool || pool.length - pool.used < this.length) allocPool();
      this.parent = pool;
      this.offset = pool.used;
      pool.used += this.length;
    }

    // Treat array-ish objects as a byte array.
    if (isArrayIsh(subject)) {
      for (var i = 0; i < this.length; i++) {
        if (subject instanceof Buffer) {
          this.parent[i + this.offset] = subject.readUInt8(i);
        }
        else {
          this.parent[i + this.offset] = subject[i];
        }
      }
    } else if (type == 'string') {
      // We are a string
      this.length = this.write(subject, 0, encoding);
    }
  }

}

function isArrayIsh(subject) {
  return Array.isArray(subject) || Buffer.isBuffer(subject) ||
         subject && typeof subject === 'object' &&
         typeof subject.length === 'number';
}

exports.SlowBuffer = SlowBuffer;
exports.Buffer = Buffer;

Buffer.poolSize = 8 * 1024;
var pool;

function allocPool() {
  pool = new SlowBuffer(Buffer.poolSize);
  pool.used = 0;
}


// Static methods
Buffer.isBuffer = function isBuffer(b) {
  return b instanceof Buffer || b instanceof SlowBuffer;
};

Buffer.concat = function (list, totalLength) {
  if (!Array.isArray(list)) {
    throw new Error("Usage: Buffer.concat(list, [totalLength])\n \
      list should be an Array.");
  }

  if (list.length === 0) {
    return new Buffer(0);
  } else if (list.length === 1) {
    return list[0];
  }

  if (typeof totalLength !== 'number') {
    totalLength = 0;
    for (var i = 0; i < list.length; i++) {
      var buf = list[i];
      totalLength += buf.length;
    }
  }

  var buffer = new Buffer(totalLength);
  var pos = 0;
  for (var i = 0; i < list.length; i++) {
    var buf = list[i];
    buf.copy(buffer, pos);
    pos += buf.length;
  }
  return buffer;
};

// Inspect
Buffer.prototype.inspect = function inspect() {
  var out = [],
      len = this.length;

  for (var i = 0; i < len; i++) {
    out[i] = toHex(this.parent[i + this.offset]);
    if (i == exports.INSPECT_MAX_BYTES) {
      out[i + 1] = '...';
      break;
    }
  }

  return '<Buffer ' + out.join(' ') + '>';
};


Buffer.prototype.get = function get(i) {
  if (i < 0 || i >= this.length) throw new Error('oob');
  return this.parent[this.offset + i];
};


Buffer.prototype.set = function set(i, v) {
  if (i < 0 || i >= this.length) throw new Error('oob');
  return this.parent[this.offset + i] = v;
};


// write(string, offset = 0, length = buffer.length-offset, encoding = 'utf8')
Buffer.prototype.write = function(string, offset, length, encoding) {
  // Support both (string, offset, length, encoding)
  // and the legacy (string, encoding, offset, length)
  if (isFinite(offset)) {
    if (!isFinite(length)) {
      encoding = length;
      length = undefined;
    }
  } else {  // legacy
    var swap = encoding;
    encoding = offset;
    offset = length;
    length = swap;
  }

  offset = +offset || 0;
  var remaining = this.length - offset;
  if (!length) {
    length = remaining;
  } else {
    length = +length;
    if (length > remaining) {
      length = remaining;
    }
  }
  encoding = String(encoding || 'utf8').toLowerCase();

  var ret;
  switch (encoding) {
    case 'hex':
      ret = this.parent.hexWrite(string, this.offset + offset, length);
      break;

    case 'utf8':
    case 'utf-8':
      ret = this.parent.utf8Write(string, this.offset + offset, length);
      break;

    case 'ascii':
      ret = this.parent.asciiWrite(string, this.offset + offset, length);
      break;

    case 'binary':
      ret = this.parent.binaryWrite(string, this.offset + offset, length);
      break;

    case 'base64':
      // Warning: maxLength not taken into account in base64Write
      ret = this.parent.base64Write(string, this.offset + offset, length);
      break;

    case 'ucs2':
    case 'ucs-2':
      ret = this.parent.ucs2Write(string, this.offset + offset, length);
      break;

    default:
      throw new Error('Unknown encoding');
  }

  Buffer._charsWritten = SlowBuffer._charsWritten;

  return ret;
};


// toString(encoding, start=0, end=buffer.length)
Buffer.prototype.toString = function(encoding, start, end) {
  encoding = String(encoding || 'utf8').toLowerCase();

  if (typeof start == 'undefined' || start < 0) {
    start = 0;
  } else if (start > this.length) {
    start = this.length;
  }

  if (typeof end == 'undefined' || end > this.length) {
    end = this.length;
  } else if (end < 0) {
    end = 0;
  }

  start = start + this.offset;
  end = end + this.offset;

  switch (encoding) {
    case 'hex':
      return this.parent.hexSlice(start, end);

    case 'utf8':
    case 'utf-8':
      return this.parent.utf8Slice(start, end);

    case 'ascii':
      return this.parent.asciiSlice(start, end);

    case 'binary':
      return this.parent.binarySlice(start, end);

    case 'base64':
      return this.parent.base64Slice(start, end);

    case 'ucs2':
    case 'ucs-2':
      return this.parent.ucs2Slice(start, end);

    default:
      throw new Error('Unknown encoding');
  }
};


// byteLength
Buffer.byteLength = SlowBuffer.byteLength;


// fill(value, start=0, end=buffer.length)
Buffer.prototype.fill = function fill(value, start, end) {
  value || (value = 0);
  start || (start = 0);
  end || (end = this.length);

  if (typeof value === 'string') {
    value = value.charCodeAt(0);
  }
  if (!(typeof value === 'number') || isNaN(value)) {
    throw new Error('value is not a number');
  }

  if (end < start) throw new Error('end < start');

  // Fill 0 bytes; we're done
  if (end === start) return 0;
  if (this.length == 0) return 0;

  if (start < 0 || start >= this.length) {
    throw new Error('start out of bounds');
  }

  if (end < 0 || end > this.length) {
    throw new Error('end out of bounds');
  }

  return this.parent.fill(value,
                          start + this.offset,
                          end + this.offset);
};


// copy(targetBuffer, targetStart=0, sourceStart=0, sourceEnd=buffer.length)
Buffer.prototype.copy = function(target, target_start, start, end) {
  var source = this;
  start || (start = 0);
  end || (end = this.length);
  target_start || (target_start = 0);

  if (end < start) throw new Error('sourceEnd < sourceStart');

  // Copy 0 bytes; we're done
  if (end === start) return 0;
  if (target.length == 0 || source.length == 0) return 0;

  if (target_start < 0 || target_start >= target.length) {
    throw new Error('targetStart out of bounds');
  }

  if (start < 0 || start >= source.length) {
    throw new Error('sourceStart out of bounds');
  }

  if (end < 0 || end > source.length) {
    throw new Error('sourceEnd out of bounds');
  }

  // Are we oob?
  if (end > this.length) {
    end = this.length;
  }

  if (target.length - target_start < end - start) {
    end = target.length - target_start + start;
  }

  return this.parent.copy(target.parent,
                          target_start + target.offset,
                          start + this.offset,
                          end + this.offset);
};


// slice(start, end)
Buffer.prototype.slice = function(start, end) {
  if (end === undefined) end = this.length;
  if (end > this.length) throw new Error('oob');
  if (start > end) throw new Error('oob');

  return new Buffer(this.parent, end - start, +start + this.offset);
};


// Legacy methods for backwards compatibility.

Buffer.prototype.utf8Slice = function(start, end) {
  return this.toString('utf8', start, end);
};

Buffer.prototype.binarySlice = function(start, end) {
  return this.toString('binary', start, end);
};

Buffer.prototype.asciiSlice = function(start, end) {
  return this.toString('ascii', start, end);
};

Buffer.prototype.utf8Write = function(string, offset) {
  return this.write(string, offset, 'utf8');
};

Buffer.prototype.binaryWrite = function(string, offset) {
  return this.write(string, offset, 'binary');
};

Buffer.prototype.asciiWrite = function(string, offset) {
  return this.write(string, offset, 'ascii');
};

Buffer.prototype.readUInt8 = function(offset, noAssert) {
  var buffer = this;

  if (!noAssert) {
    assert.ok(offset !== undefined && offset !== null,
        'missing offset');

    assert.ok(offset < buffer.length,
        'Trying to read beyond buffer length');
  }

  if (offset >= buffer.length) return;

  return buffer.parent[buffer.offset + offset];
};

function readUInt16(buffer, offset, isBigEndian, noAssert) {
  var val = 0;


  if (!noAssert) {
    assert.ok(typeof (isBigEndian) === 'boolean',
        'missing or invalid endian');

    assert.ok(offset !== undefined && offset !== null,
        'missing offset');

    assert.ok(offset + 1 < buffer.length,
        'Trying to read beyond buffer length');
  }

  if (offset >= buffer.length) return 0;

  if (isBigEndian) {
    val = buffer.parent[buffer.offset + offset] << 8;
    if (offset + 1 < buffer.length) {
      val |= buffer.parent[buffer.offset + offset + 1];
    }
  } else {
    val = buffer.parent[buffer.offset + offset];
    if (offset + 1 < buffer.length) {
      val |= buffer.parent[buffer.offset + offset + 1] << 8;
    }
  }

  return val;
}

Buffer.prototype.readUInt16LE = function(offset, noAssert) {
  return readUInt16(this, offset, false, noAssert);
};

Buffer.prototype.readUInt16BE = function(offset, noAssert) {
  return readUInt16(this, offset, true, noAssert);
};

function readUInt32(buffer, offset, isBigEndian, noAssert) {
  var val = 0;

  if (!noAssert) {
    assert.ok(typeof (isBigEndian) === 'boolean',
        'missing or invalid endian');

    assert.ok(offset !== undefined && offset !== null,
        'missing offset');

    assert.ok(offset + 3 < buffer.length,
        'Trying to read beyond buffer length');
  }

  if (offset >= buffer.length) return 0;

  if (isBigEndian) {
    if (offset + 1 < buffer.length)
      val = buffer.parent[buffer.offset + offset + 1] << 16;
    if (offset + 2 < buffer.length)
      val |= buffer.parent[buffer.offset + offset + 2] << 8;
    if (offset + 3 < buffer.length)
      val |= buffer.parent[buffer.offset + offset + 3];
    val = val + (buffer.parent[buffer.offset + offset] << 24 >>> 0);
  } else {
    if (offset + 2 < buffer.length)
      val = buffer.parent[buffer.offset + offset + 2] << 16;
    if (offset + 1 < buffer.length)
      val |= buffer.parent[buffer.offset + offset + 1] << 8;
    val |= buffer.parent[buffer.offset + offset];
    if (offset + 3 < buffer.length)
      val = val + (buffer.parent[buffer.offset + offset + 3] << 24 >>> 0);
  }

  return val;
}

Buffer.prototype.readUInt32LE = function(offset, noAssert) {
  return readUInt32(this, offset, false, noAssert);
};

Buffer.prototype.readUInt32BE = function(offset, noAssert) {
  return readUInt32(this, offset, true, noAssert);
};


/*
 * Signed integer types, yay team! A reminder on how two's complement actually
 * works. The first bit is the signed bit, i.e. tells us whether or not the
 * number should be positive or negative. If the two's complement value is
 * positive, then we're done, as it's equivalent to the unsigned representation.
 *
 * Now if the number is positive, you're pretty much done, you can just leverage
 * the unsigned translations and return those. Unfortunately, negative numbers
 * aren't quite that straightforward.
 *
 * At first glance, one might be inclined to use the traditional formula to
 * translate binary numbers between the positive and negative values in two's
 * complement. (Though it doesn't quite work for the most negative value)
 * Mainly:
 *  - invert all the bits
 *  - add one to the result
 *
 * Of course, this doesn't quite work in Javascript. Take for example the value
 * of -128. This could be represented in 16 bits (big-endian) as 0xff80. But of
 * course, Javascript will do the following:
 *
 * > ~0xff80
 * -65409
 *
 * Whoh there, Javascript, that's not quite right. But wait, according to
 * Javascript that's perfectly correct. When Javascript ends up seeing the
 * constant 0xff80, it has no notion that it is actually a signed number. It
 * assumes that we've input the unsigned value 0xff80. Thus, when it does the
 * binary negation, it casts it into a signed value, (positive 0xff80). Then
 * when you perform binary negation on that, it turns it into a negative number.
 *
 * Instead, we're going to have to use the following general formula, that works
 * in a rather Javascript friendly way. I'm glad we don't support this kind of
 * weird numbering scheme in the kernel.
 *
 * (BIT-MAX - (unsigned)val + 1) * -1
 *
 * The astute observer, may think that this doesn't make sense for 8-bit numbers
 * (really it isn't necessary for them). However, when you get 16-bit numbers,
 * you do. Let's go back to our prior example and see how this will look:
 *
 * (0xffff - 0xff80 + 1) * -1
 * (0x007f + 1) * -1
 * (0x0080) * -1
 */
Buffer.prototype.readInt8 = function(offset, noAssert) {
  var buffer = this;
  var neg;

  if (!noAssert) {
    assert.ok(offset !== undefined && offset !== null,
        'missing offset');

    assert.ok(offset < buffer.length,
        'Trying to read beyond buffer length');
  }

  if (offset >= buffer.length) return;

  neg = buffer.parent[buffer.offset + offset] & 0x80;
  if (!neg) {
    return (buffer.parent[buffer.offset + offset]);
  }

  return ((0xff - buffer.parent[buffer.offset + offset] + 1) * -1);
};

function readInt16(buffer, offset, isBigEndian, noAssert) {
  var neg, val;

  if (!noAssert) {
    assert.ok(typeof (isBigEndian) === 'boolean',
        'missing or invalid endian');

    assert.ok(offset !== undefined && offset !== null,
        'missing offset');

    assert.ok(offset + 1 < buffer.length,
        'Trying to read beyond buffer length');
  }

  val = readUInt16(buffer, offset, isBigEndian, noAssert);
  neg = val & 0x8000;
  if (!neg) {
    return val;
  }

  return (0xffff - val + 1) * -1;
}

Buffer.prototype.readInt16LE = function(offset, noAssert) {
  return readInt16(this, offset, false, noAssert);
};

Buffer.prototype.readInt16BE = function(offset, noAssert) {
  return readInt16(this, offset, true, noAssert);
};

function readInt32(buffer, offset, isBigEndian, noAssert) {
  var neg, val;

  if (!noAssert) {
    assert.ok(typeof (isBigEndian) === 'boolean',
        'missing or invalid endian');

    assert.ok(offset !== undefined && offset !== null,
        'missing offset');

    assert.ok(offset + 3 < buffer.length,
        'Trying to read beyond buffer length');
  }

  val = readUInt32(buffer, offset, isBigEndian, noAssert);
  neg = val & 0x80000000;
  if (!neg) {
    return (val);
  }

  return (0xffffffff - val + 1) * -1;
}

Buffer.prototype.readInt32LE = function(offset, noAssert) {
  return readInt32(this, offset, false, noAssert);
};

Buffer.prototype.readInt32BE = function(offset, noAssert) {
  return readInt32(this, offset, true, noAssert);
};

function readFloat(buffer, offset, isBigEndian, noAssert) {
  if (!noAssert) {
    assert.ok(typeof (isBigEndian) === 'boolean',
        'missing or invalid endian');

    assert.ok(offset + 3 < buffer.length,
        'Trying to read beyond buffer length');
  }

  return require('./buffer_ieee754').readIEEE754(buffer, offset, isBigEndian,
      23, 4);
}

Buffer.prototype.readFloatLE = function(offset, noAssert) {
  return readFloat(this, offset, false, noAssert);
};

Buffer.prototype.readFloatBE = function(offset, noAssert) {
  return readFloat(this, offset, true, noAssert);
};

function readDouble(buffer, offset, isBigEndian, noAssert) {
  if (!noAssert) {
    assert.ok(typeof (isBigEndian) === 'boolean',
        'missing or invalid endian');

    assert.ok(offset + 7 < buffer.length,
        'Trying to read beyond buffer length');
  }

  return require('./buffer_ieee754').readIEEE754(buffer, offset, isBigEndian,
      52, 8);
}

Buffer.prototype.readDoubleLE = function(offset, noAssert) {
  return readDouble(this, offset, false, noAssert);
};

Buffer.prototype.readDoubleBE = function(offset, noAssert) {
  return readDouble(this, offset, true, noAssert);
};


/*
 * We have to make sure that the value is a valid integer. This means that it is
 * non-negative. It has no fractional component and that it does not exceed the
 * maximum allowed value.
 *
 *      value           The number to check for validity
 *
 *      max             The maximum value
 */
function verifuint(value, max) {
  assert.ok(typeof (value) == 'number',
      'cannot write a non-number as a number');

  assert.ok(value >= 0,
      'specified a negative value for writing an unsigned value');

  assert.ok(value <= max, 'value is larger than maximum value for type');

  assert.ok(Math.floor(value) === value, 'value has a fractional component');
}

Buffer.prototype.writeUInt8 = function(value, offset, noAssert) {
  var buffer = this;

  if (!noAssert) {
    assert.ok(value !== undefined && value !== null,
        'missing value');

    assert.ok(offset !== undefined && offset !== null,
        'missing offset');

    assert.ok(offset < buffer.length,
        'trying to write beyond buffer length');

    verifuint(value, 0xff);
  }

  if (offset < buffer.length) {
    buffer.parent[buffer.offset + offset] = value;
  }
};

function writeUInt16(buffer, value, offset, isBigEndian, noAssert) {
  if (!noAssert) {
    assert.ok(value !== undefined && value !== null,
        'missing value');

    assert.ok(typeof (isBigEndian) === 'boolean',
        'missing or invalid endian');

    assert.ok(offset !== undefined && offset !== null,
        'missing offset');

    assert.ok(offset + 1 < buffer.length,
        'trying to write beyond buffer length');

    verifuint(value, 0xffff);
  }

  for (var i = 0; i < Math.min(buffer.length - offset, 2); i++) {
    buffer.parent[buffer.offset + offset + i] =
        (value & (0xff << (8 * (isBigEndian ? 1 - i : i)))) >>>
            (isBigEndian ? 1 - i : i) * 8;
  }

}

Buffer.prototype.writeUInt16LE = function(value, offset, noAssert) {
  writeUInt16(this, value, offset, false, noAssert);
};

Buffer.prototype.writeUInt16BE = function(value, offset, noAssert) {
  writeUInt16(this, value, offset, true, noAssert);
};

function writeUInt32(buffer, value, offset, isBigEndian, noAssert) {
  if (!noAssert) {
    assert.ok(value !== undefined && value !== null,
        'missing value');

    assert.ok(typeof (isBigEndian) === 'boolean',
        'missing or invalid endian');

    assert.ok(offset !== undefined && offset !== null,
        'missing offset');

    assert.ok(offset + 3 < buffer.length,
        'trying to write beyond buffer length');

    verifuint(value, 0xffffffff);
  }

  for (var i = 0; i < Math.min(buffer.length - offset, 4); i++) {
    buffer.parent[buffer.offset + offset + i] =
        (value >>> (isBigEndian ? 3 - i : i) * 8) & 0xff;
  }
}

Buffer.prototype.writeUInt32LE = function(value, offset, noAssert) {
  writeUInt32(this, value, offset, false, noAssert);
};

Buffer.prototype.writeUInt32BE = function(value, offset, noAssert) {
  writeUInt32(this, value, offset, true, noAssert);
};


/*
 * We now move onto our friends in the signed number category. Unlike unsigned
 * numbers, we're going to have to worry a bit more about how we put values into
 * arrays. Since we are only worrying about signed 32-bit values, we're in
 * slightly better shape. Unfortunately, we really can't do our favorite binary
 * & in this system. It really seems to do the wrong thing. For example:
 *
 * > -32 & 0xff
 * 224
 *
 * What's happening above is really: 0xe0 & 0xff = 0xe0. However, the results of
 * this aren't treated as a signed number. Ultimately a bad thing.
 *
 * What we're going to want to do is basically create the unsigned equivalent of
 * our representation and pass that off to the wuint* functions. To do that
 * we're going to do the following:
 *
 *  - if the value is positive
 *      we can pass it directly off to the equivalent wuint
 *  - if the value is negative
 *      we do the following computation:
 *         mb + val + 1, where
 *         mb   is the maximum unsigned value in that byte size
 *         val  is the Javascript negative integer
 *
 *
 * As a concrete value, take -128. In signed 16 bits this would be 0xff80. If
 * you do out the computations:
 *
 * 0xffff - 128 + 1
 * 0xffff - 127
 * 0xff80
 *
 * You can then encode this value as the signed version. This is really rather
 * hacky, but it should work and get the job done which is our goal here.
 */

/*
 * A series of checks to make sure we actually have a signed 32-bit number
 */
function verifsint(value, max, min) {
  assert.ok(typeof (value) == 'number',
      'cannot write a non-number as a number');

  assert.ok(value <= max, 'value larger than maximum allowed value');

  assert.ok(value >= min, 'value smaller than minimum allowed value');

  assert.ok(Math.floor(value) === value, 'value has a fractional component');
}

function verifIEEE754(value, max, min) {
  assert.ok(typeof (value) == 'number',
      'cannot write a non-number as a number');

  assert.ok(value <= max, 'value larger than maximum allowed value');

  assert.ok(value >= min, 'value smaller than minimum allowed value');
}

Buffer.prototype.writeInt8 = function(value, offset, noAssert) {
  var buffer = this;

  if (!noAssert) {
    assert.ok(value !== undefined && value !== null,
        'missing value');

    assert.ok(offset !== undefined && offset !== null,
        'missing offset');

    assert.ok(offset < buffer.length,
        'Trying to write beyond buffer length');

    verifsint(value, 0x7f, -0x80);
  }

  if (value >= 0) {
    buffer.writeUInt8(value, offset, noAssert);
  } else {
    buffer.writeUInt8(0xff + value + 1, offset, noAssert);
  }
};

function writeInt16(buffer, value, offset, isBigEndian, noAssert) {
  if (!noAssert) {
    assert.ok(value !== undefined && value !== null,
        'missing value');

    assert.ok(typeof (isBigEndian) === 'boolean',
        'missing or invalid endian');

    assert.ok(offset !== undefined && offset !== null,
        'missing offset');

    assert.ok(offset + 1 < buffer.length,
        'Trying to write beyond buffer length');

    verifsint(value, 0x7fff, -0x8000);
  }

  if (value >= 0) {
    writeUInt16(buffer, value, offset, isBigEndian, noAssert);
  } else {
    writeUInt16(buffer, 0xffff + value + 1, offset, isBigEndian, noAssert);
  }
}

Buffer.prototype.writeInt16LE = function(value, offset, noAssert) {
  writeInt16(this, value, offset, false, noAssert);
};

Buffer.prototype.writeInt16BE = function(value, offset, noAssert) {
  writeInt16(this, value, offset, true, noAssert);
};

function writeInt32(buffer, value, offset, isBigEndian, noAssert) {
  if (!noAssert) {
    assert.ok(value !== undefined && value !== null,
        'missing value');

    assert.ok(typeof (isBigEndian) === 'boolean',
        'missing or invalid endian');

    assert.ok(offset !== undefined && offset !== null,
        'missing offset');

    assert.ok(offset + 3 < buffer.length,
        'Trying to write beyond buffer length');

    verifsint(value, 0x7fffffff, -0x80000000);
  }

  if (value >= 0) {
    writeUInt32(buffer, value, offset, isBigEndian, noAssert);
  } else {
    writeUInt32(buffer, 0xffffffff + value + 1, offset, isBigEndian, noAssert);
  }
}

Buffer.prototype.writeInt32LE = function(value, offset, noAssert) {
  writeInt32(this, value, offset, false, noAssert);
};

Buffer.prototype.writeInt32BE = function(value, offset, noAssert) {
  writeInt32(this, value, offset, true, noAssert);
};

function writeFloat(buffer, value, offset, isBigEndian, noAssert) {
  if (!noAssert) {
    assert.ok(value !== undefined && value !== null,
        'missing value');

    assert.ok(typeof (isBigEndian) === 'boolean',
        'missing or invalid endian');

    assert.ok(offset !== undefined && offset !== null,
        'missing offset');

    assert.ok(offset + 3 < buffer.length,
        'Trying to write beyond buffer length');

    verifIEEE754(value, 3.4028234663852886e+38, -3.4028234663852886e+38);
  }

  require('./buffer_ieee754').writeIEEE754(buffer, value, offset, isBigEndian,
      23, 4);
}

Buffer.prototype.writeFloatLE = function(value, offset, noAssert) {
  writeFloat(this, value, offset, false, noAssert);
};

Buffer.prototype.writeFloatBE = function(value, offset, noAssert) {
  writeFloat(this, value, offset, true, noAssert);
};

function writeDouble(buffer, value, offset, isBigEndian, noAssert) {
  if (!noAssert) {
    assert.ok(value !== undefined && value !== null,
        'missing value');

    assert.ok(typeof (isBigEndian) === 'boolean',
        'missing or invalid endian');

    assert.ok(offset !== undefined && offset !== null,
        'missing offset');

    assert.ok(offset + 7 < buffer.length,
        'Trying to write beyond buffer length');

    verifIEEE754(value, 1.7976931348623157E+308, -1.7976931348623157E+308);
  }

  require('./buffer_ieee754').writeIEEE754(buffer, value, offset, isBigEndian,
      52, 8);
}

Buffer.prototype.writeDoubleLE = function(value, offset, noAssert) {
  writeDouble(this, value, offset, false, noAssert);
};

Buffer.prototype.writeDoubleBE = function(value, offset, noAssert) {
  writeDouble(this, value, offset, true, noAssert);
};

SlowBuffer.prototype.readUInt8 = Buffer.prototype.readUInt8;
SlowBuffer.prototype.readUInt16LE = Buffer.prototype.readUInt16LE;
SlowBuffer.prototype.readUInt16BE = Buffer.prototype.readUInt16BE;
SlowBuffer.prototype.readUInt32LE = Buffer.prototype.readUInt32LE;
SlowBuffer.prototype.readUInt32BE = Buffer.prototype.readUInt32BE;
SlowBuffer.prototype.readInt8 = Buffer.prototype.readInt8;
SlowBuffer.prototype.readInt16LE = Buffer.prototype.readInt16LE;
SlowBuffer.prototype.readInt16BE = Buffer.prototype.readInt16BE;
SlowBuffer.prototype.readInt32LE = Buffer.prototype.readInt32LE;
SlowBuffer.prototype.readInt32BE = Buffer.prototype.readInt32BE;
SlowBuffer.prototype.readFloatLE = Buffer.prototype.readFloatLE;
SlowBuffer.prototype.readFloatBE = Buffer.prototype.readFloatBE;
SlowBuffer.prototype.readDoubleLE = Buffer.prototype.readDoubleLE;
SlowBuffer.prototype.readDoubleBE = Buffer.prototype.readDoubleBE;
SlowBuffer.prototype.writeUInt8 = Buffer.prototype.writeUInt8;
SlowBuffer.prototype.writeUInt16LE = Buffer.prototype.writeUInt16LE;
SlowBuffer.prototype.writeUInt16BE = Buffer.prototype.writeUInt16BE;
SlowBuffer.prototype.writeUInt32LE = Buffer.prototype.writeUInt32LE;
SlowBuffer.prototype.writeUInt32BE = Buffer.prototype.writeUInt32BE;
SlowBuffer.prototype.writeInt8 = Buffer.prototype.writeInt8;
SlowBuffer.prototype.writeInt16LE = Buffer.prototype.writeInt16LE;
SlowBuffer.prototype.writeInt16BE = Buffer.prototype.writeInt16BE;
SlowBuffer.prototype.writeInt32LE = Buffer.prototype.writeInt32LE;
SlowBuffer.prototype.writeInt32BE = Buffer.prototype.writeInt32BE;
SlowBuffer.prototype.writeFloatLE = Buffer.prototype.writeFloatLE;
SlowBuffer.prototype.writeFloatBE = Buffer.prototype.writeFloatBE;
SlowBuffer.prototype.writeDoubleLE = Buffer.prototype.writeDoubleLE;
SlowBuffer.prototype.writeDoubleBE = Buffer.prototype.writeDoubleBE;

})()
},{"assert":11,"./buffer_ieee754":13,"base64-js":14}],14:[function(require,module,exports){
(function (exports) {
  'use strict';

  var lookup = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

  function b64ToByteArray(b64) {
    var i, j, l, tmp, placeHolders, arr;
  
    if (b64.length % 4 > 0) {
      throw 'Invalid string. Length must be a multiple of 4';
    }

    // the number of equal signs (place holders)
    // if there are two placeholders, than the two characters before it
    // represent one byte
    // if there is only one, then the three characters before it represent 2 bytes
    // this is just a cheap hack to not do indexOf twice
    placeHolders = b64.indexOf('=');
    placeHolders = placeHolders > 0 ? b64.length - placeHolders : 0;

    // base64 is 4/3 + up to two characters of the original data
    arr = [];//new Uint8Array(b64.length * 3 / 4 - placeHolders);

    // if there are placeholders, only get up to the last complete 4 chars
    l = placeHolders > 0 ? b64.length - 4 : b64.length;

    for (i = 0, j = 0; i < l; i += 4, j += 3) {
      tmp = (lookup.indexOf(b64[i]) << 18) | (lookup.indexOf(b64[i + 1]) << 12) | (lookup.indexOf(b64[i + 2]) << 6) | lookup.indexOf(b64[i + 3]);
      arr.push((tmp & 0xFF0000) >> 16);
      arr.push((tmp & 0xFF00) >> 8);
      arr.push(tmp & 0xFF);
    }

    if (placeHolders === 2) {
      tmp = (lookup.indexOf(b64[i]) << 2) | (lookup.indexOf(b64[i + 1]) >> 4);
      arr.push(tmp & 0xFF);
    } else if (placeHolders === 1) {
      tmp = (lookup.indexOf(b64[i]) << 10) | (lookup.indexOf(b64[i + 1]) << 4) | (lookup.indexOf(b64[i + 2]) >> 2);
      arr.push((tmp >> 8) & 0xFF);
      arr.push(tmp & 0xFF);
    }

    return arr;
  }

  function uint8ToBase64(uint8) {
    var i,
      extraBytes = uint8.length % 3, // if we have 1 byte left, pad 2 bytes
      output = "",
      temp, length;

    function tripletToBase64 (num) {
      return lookup[num >> 18 & 0x3F] + lookup[num >> 12 & 0x3F] + lookup[num >> 6 & 0x3F] + lookup[num & 0x3F];
    };

    // go through the array every three bytes, we'll deal with trailing stuff later
    for (i = 0, length = uint8.length - extraBytes; i < length; i += 3) {
      temp = (uint8[i] << 16) + (uint8[i + 1] << 8) + (uint8[i + 2]);
      output += tripletToBase64(temp);
    }

    // pad the end with zeros, but make sure to not forget the extra bytes
    switch (extraBytes) {
      case 1:
        temp = uint8[uint8.length - 1];
        output += lookup[temp >> 2];
        output += lookup[(temp << 4) & 0x3F];
        output += '==';
        break;
      case 2:
        temp = (uint8[uint8.length - 2] << 8) + (uint8[uint8.length - 1]);
        output += lookup[temp >> 10];
        output += lookup[(temp >> 4) & 0x3F];
        output += lookup[(temp << 2) & 0x3F];
        output += '=';
        break;
    }

    return output;
  }

  module.exports.toByteArray = b64ToByteArray;
  module.exports.fromByteArray = uint8ToBase64;
}());

},{}]},{},["FD4Lxs"])
;
JSHINT = require('jshint').JSHINT;
}());
/*
  Copyright (C) 2013 Ariya Hidayat <ariya.hidayat@gmail.com>
  Copyright (C) 2013 Thaddee Tyl <thaddee.tyl@gmail.com>
  Copyright (C) 2012 Ariya Hidayat <ariya.hidayat@gmail.com>
  Copyright (C) 2012 Mathias Bynens <mathias@qiwi.be>
  Copyright (C) 2012 Joost-Wim Boekesteijn <joost-wim@boekesteijn.nl>
  Copyright (C) 2012 Kris Kowal <kris.kowal@cixar.com>
  Copyright (C) 2012 Yusuke Suzuki <utatane.tea@gmail.com>
  Copyright (C) 2012 Arpad Borsos <arpad.borsos@googlemail.com>
  Copyright (C) 2011 Ariya Hidayat <ariya.hidayat@gmail.com>

  Redistribution and use in source and binary forms, with or without
  modification, are permitted provided that the following conditions are met:

    * Redistributions of source code must retain the above copyright
      notice, this list of conditions and the following disclaimer.
    * Redistributions in binary form must reproduce the above copyright
      notice, this list of conditions and the following disclaimer in the
      documentation and/or other materials provided with the distribution.

  THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
  AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
  IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
  ARE DISCLAIMED. IN NO EVENT SHALL <COPYRIGHT HOLDER> BE LIABLE FOR ANY
  DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
  (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
  LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
  ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
  (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF
  THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
*/

/*jslint bitwise:true plusplus:true */
/*global esprima:true, define:true, exports:true, window: true,
createLocationMarker: true,
throwError: true, generateStatement: true, peek: true,
parseAssignmentExpression: true, parseBlock: true, parseExpression: true,
parseFunctionDeclaration: true, parseFunctionExpression: true,
parseFunctionSourceElements: true, parseVariableIdentifier: true,
parseLeftHandSideExpression: true,
parseUnaryExpression: true,
parseStatement: true, parseSourceElement: true */

(function (root, factory) {
    'use strict';

    // Universal Module Definition (UMD) to support AMD, CommonJS/Node.js,
    // Rhino, and plain browser loading.
    if (typeof define === 'function' && define.amd) {
        define(['exports'], factory);
    } else if (typeof exports !== 'undefined') {
        factory(exports);
    } else {
        factory((root.esprima = {}));
    }
}(this, function (exports) {
    'use strict';

    var Token,
        TokenName,
        FnExprTokens,
        Syntax,
        PropertyKind,
        Messages,
        Regex,
        SyntaxTreeDelegate,
        source,
        strict,
        index,
        lineNumber,
        lineStart,
        length,
        delegate,
        lookahead,
        state,
        extra;

    Token = {
        BooleanLiteral: 1,
        EOF: 2,
        Identifier: 3,
        Keyword: 4,
        NullLiteral: 5,
        NumericLiteral: 6,
        Punctuator: 7,
        StringLiteral: 8,
        RegularExpression: 9
    };

    TokenName = {};
    TokenName[Token.BooleanLiteral] = 'Boolean';
    TokenName[Token.EOF] = '<end>';
    TokenName[Token.Identifier] = 'Identifier';
    TokenName[Token.Keyword] = 'Keyword';
    TokenName[Token.NullLiteral] = 'Null';
    TokenName[Token.NumericLiteral] = 'Numeric';
    TokenName[Token.Punctuator] = 'Punctuator';
    TokenName[Token.StringLiteral] = 'String';
    TokenName[Token.RegularExpression] = 'RegularExpression';

    // A function following one of those tokens is an expression.
    FnExprTokens = ['(', '{', '[', 'in', 'typeof', 'instanceof', 'new',
                    'return', 'case', 'delete', 'throw', 'void',
                    // assignment operators
                    '=', '+=', '-=', '*=', '/=', '%=', '<<=', '>>=', '>>>=',
                    '&=', '|=', '^=', ',',
                    // binary/unary operators
                    '+', '-', '*', '/', '%', '++', '--', '<<', '>>', '>>>', '&',
                    '|', '^', '!', '~', '&&', '||', '?', ':', '===', '==', '>=',
                    '<=', '<', '>', '!=', '!=='];

    Syntax = {
        AssignmentExpression: 'AssignmentExpression',
        ArrayExpression: 'ArrayExpression',
        BlockStatement: 'BlockStatement',
        BinaryExpression: 'BinaryExpression',
        BreakStatement: 'BreakStatement',
        CallExpression: 'CallExpression',
        CatchClause: 'CatchClause',
        ConditionalExpression: 'ConditionalExpression',
        ContinueStatement: 'ContinueStatement',
        DoWhileStatement: 'DoWhileStatement',
        DebuggerStatement: 'DebuggerStatement',
        EmptyStatement: 'EmptyStatement',
        ExpressionStatement: 'ExpressionStatement',
        ForStatement: 'ForStatement',
        ForInStatement: 'ForInStatement',
        FunctionDeclaration: 'FunctionDeclaration',
        FunctionExpression: 'FunctionExpression',
        Identifier: 'Identifier',
        IfStatement: 'IfStatement',
        Literal: 'Literal',
        LabeledStatement: 'LabeledStatement',
        LogicalExpression: 'LogicalExpression',
        MemberExpression: 'MemberExpression',
        NewExpression: 'NewExpression',
        ObjectExpression: 'ObjectExpression',
        Program: 'Program',
        Property: 'Property',
        ReturnStatement: 'ReturnStatement',
        SequenceExpression: 'SequenceExpression',
        SwitchStatement: 'SwitchStatement',
        SwitchCase: 'SwitchCase',
        ThisExpression: 'ThisExpression',
        ThrowStatement: 'ThrowStatement',
        TryStatement: 'TryStatement',
        UnaryExpression: 'UnaryExpression',
        UpdateExpression: 'UpdateExpression',
        VariableDeclaration: 'VariableDeclaration',
        VariableDeclarator: 'VariableDeclarator',
        WhileStatement: 'WhileStatement',
        WithStatement: 'WithStatement'
    };

    PropertyKind = {
        Data: 1,
        Get: 2,
        Set: 4
    };

    // Error messages should be identical to V8.
    Messages = {
        UnexpectedToken:  'Unexpected token %0',
        UnexpectedNumber:  'Unexpected number',
        UnexpectedString:  'Unexpected string',
        UnexpectedIdentifier:  'Unexpected identifier',
        UnexpectedReserved:  'Unexpected reserved word',
        UnexpectedEOS:  'Unexpected end of input',
        NewlineAfterThrow:  'Illegal newline after throw',
        InvalidRegExp: 'Invalid regular expression',
        UnterminatedRegExp:  'Invalid regular expression: missing /',
        InvalidLHSInAssignment:  'Invalid left-hand side in assignment',
        InvalidLHSInForIn:  'Invalid left-hand side in for-in',
        MultipleDefaultsInSwitch: 'More than one default clause in switch statement',
        NoCatchOrFinally:  'Missing catch or finally after try',
        UnknownLabel: 'Undefined label \'%0\'',
        Redeclaration: '%0 \'%1\' has already been declared',
        IllegalContinue: 'Illegal continue statement',
        IllegalBreak: 'Illegal break statement',
        IllegalReturn: 'Illegal return statement',
        StrictModeWith:  'Strict mode code may not include a with statement',
        StrictCatchVariable:  'Catch variable may not be eval or arguments in strict mode',
        StrictVarName:  'Variable name may not be eval or arguments in strict mode',
        StrictParamName:  'Parameter name eval or arguments is not allowed in strict mode',
        StrictParamDupe: 'Strict mode function may not have duplicate parameter names',
        StrictFunctionName:  'Function name may not be eval or arguments in strict mode',
        StrictOctalLiteral:  'Octal literals are not allowed in strict mode.',
        StrictDelete:  'Delete of an unqualified identifier in strict mode.',
        StrictDuplicateProperty:  'Duplicate data property in object literal not allowed in strict mode',
        AccessorDataProperty:  'Object literal may not have data and accessor property with the same name',
        AccessorGetSet:  'Object literal may not have multiple get/set accessors with the same name',
        StrictLHSAssignment:  'Assignment to eval or arguments is not allowed in strict mode',
        StrictLHSPostfix:  'Postfix increment/decrement may not have eval or arguments operand in strict mode',
        StrictLHSPrefix:  'Prefix increment/decrement may not have eval or arguments operand in strict mode',
        StrictReservedWord:  'Use of future reserved word in strict mode'
    };

    // See also tools/generate-unicode-regex.py.
    Regex = {
        NonAsciiIdentifierStart: new RegExp('[\xaa\xb5\xba\xc0-\xd6\xd8-\xf6\xf8-\u02c1\u02c6-\u02d1\u02e0-\u02e4\u02ec\u02ee\u0370-\u0374\u0376\u0377\u037a-\u037d\u0386\u0388-\u038a\u038c\u038e-\u03a1\u03a3-\u03f5\u03f7-\u0481\u048a-\u0527\u0531-\u0556\u0559\u0561-\u0587\u05d0-\u05ea\u05f0-\u05f2\u0620-\u064a\u066e\u066f\u0671-\u06d3\u06d5\u06e5\u06e6\u06ee\u06ef\u06fa-\u06fc\u06ff\u0710\u0712-\u072f\u074d-\u07a5\u07b1\u07ca-\u07ea\u07f4\u07f5\u07fa\u0800-\u0815\u081a\u0824\u0828\u0840-\u0858\u08a0\u08a2-\u08ac\u0904-\u0939\u093d\u0950\u0958-\u0961\u0971-\u0977\u0979-\u097f\u0985-\u098c\u098f\u0990\u0993-\u09a8\u09aa-\u09b0\u09b2\u09b6-\u09b9\u09bd\u09ce\u09dc\u09dd\u09df-\u09e1\u09f0\u09f1\u0a05-\u0a0a\u0a0f\u0a10\u0a13-\u0a28\u0a2a-\u0a30\u0a32\u0a33\u0a35\u0a36\u0a38\u0a39\u0a59-\u0a5c\u0a5e\u0a72-\u0a74\u0a85-\u0a8d\u0a8f-\u0a91\u0a93-\u0aa8\u0aaa-\u0ab0\u0ab2\u0ab3\u0ab5-\u0ab9\u0abd\u0ad0\u0ae0\u0ae1\u0b05-\u0b0c\u0b0f\u0b10\u0b13-\u0b28\u0b2a-\u0b30\u0b32\u0b33\u0b35-\u0b39\u0b3d\u0b5c\u0b5d\u0b5f-\u0b61\u0b71\u0b83\u0b85-\u0b8a\u0b8e-\u0b90\u0b92-\u0b95\u0b99\u0b9a\u0b9c\u0b9e\u0b9f\u0ba3\u0ba4\u0ba8-\u0baa\u0bae-\u0bb9\u0bd0\u0c05-\u0c0c\u0c0e-\u0c10\u0c12-\u0c28\u0c2a-\u0c33\u0c35-\u0c39\u0c3d\u0c58\u0c59\u0c60\u0c61\u0c85-\u0c8c\u0c8e-\u0c90\u0c92-\u0ca8\u0caa-\u0cb3\u0cb5-\u0cb9\u0cbd\u0cde\u0ce0\u0ce1\u0cf1\u0cf2\u0d05-\u0d0c\u0d0e-\u0d10\u0d12-\u0d3a\u0d3d\u0d4e\u0d60\u0d61\u0d7a-\u0d7f\u0d85-\u0d96\u0d9a-\u0db1\u0db3-\u0dbb\u0dbd\u0dc0-\u0dc6\u0e01-\u0e30\u0e32\u0e33\u0e40-\u0e46\u0e81\u0e82\u0e84\u0e87\u0e88\u0e8a\u0e8d\u0e94-\u0e97\u0e99-\u0e9f\u0ea1-\u0ea3\u0ea5\u0ea7\u0eaa\u0eab\u0ead-\u0eb0\u0eb2\u0eb3\u0ebd\u0ec0-\u0ec4\u0ec6\u0edc-\u0edf\u0f00\u0f40-\u0f47\u0f49-\u0f6c\u0f88-\u0f8c\u1000-\u102a\u103f\u1050-\u1055\u105a-\u105d\u1061\u1065\u1066\u106e-\u1070\u1075-\u1081\u108e\u10a0-\u10c5\u10c7\u10cd\u10d0-\u10fa\u10fc-\u1248\u124a-\u124d\u1250-\u1256\u1258\u125a-\u125d\u1260-\u1288\u128a-\u128d\u1290-\u12b0\u12b2-\u12b5\u12b8-\u12be\u12c0\u12c2-\u12c5\u12c8-\u12d6\u12d8-\u1310\u1312-\u1315\u1318-\u135a\u1380-\u138f\u13a0-\u13f4\u1401-\u166c\u166f-\u167f\u1681-\u169a\u16a0-\u16ea\u16ee-\u16f0\u1700-\u170c\u170e-\u1711\u1720-\u1731\u1740-\u1751\u1760-\u176c\u176e-\u1770\u1780-\u17b3\u17d7\u17dc\u1820-\u1877\u1880-\u18a8\u18aa\u18b0-\u18f5\u1900-\u191c\u1950-\u196d\u1970-\u1974\u1980-\u19ab\u19c1-\u19c7\u1a00-\u1a16\u1a20-\u1a54\u1aa7\u1b05-\u1b33\u1b45-\u1b4b\u1b83-\u1ba0\u1bae\u1baf\u1bba-\u1be5\u1c00-\u1c23\u1c4d-\u1c4f\u1c5a-\u1c7d\u1ce9-\u1cec\u1cee-\u1cf1\u1cf5\u1cf6\u1d00-\u1dbf\u1e00-\u1f15\u1f18-\u1f1d\u1f20-\u1f45\u1f48-\u1f4d\u1f50-\u1f57\u1f59\u1f5b\u1f5d\u1f5f-\u1f7d\u1f80-\u1fb4\u1fb6-\u1fbc\u1fbe\u1fc2-\u1fc4\u1fc6-\u1fcc\u1fd0-\u1fd3\u1fd6-\u1fdb\u1fe0-\u1fec\u1ff2-\u1ff4\u1ff6-\u1ffc\u2071\u207f\u2090-\u209c\u2102\u2107\u210a-\u2113\u2115\u2119-\u211d\u2124\u2126\u2128\u212a-\u212d\u212f-\u2139\u213c-\u213f\u2145-\u2149\u214e\u2160-\u2188\u2c00-\u2c2e\u2c30-\u2c5e\u2c60-\u2ce4\u2ceb-\u2cee\u2cf2\u2cf3\u2d00-\u2d25\u2d27\u2d2d\u2d30-\u2d67\u2d6f\u2d80-\u2d96\u2da0-\u2da6\u2da8-\u2dae\u2db0-\u2db6\u2db8-\u2dbe\u2dc0-\u2dc6\u2dc8-\u2dce\u2dd0-\u2dd6\u2dd8-\u2dde\u2e2f\u3005-\u3007\u3021-\u3029\u3031-\u3035\u3038-\u303c\u3041-\u3096\u309d-\u309f\u30a1-\u30fa\u30fc-\u30ff\u3105-\u312d\u3131-\u318e\u31a0-\u31ba\u31f0-\u31ff\u3400-\u4db5\u4e00-\u9fcc\ua000-\ua48c\ua4d0-\ua4fd\ua500-\ua60c\ua610-\ua61f\ua62a\ua62b\ua640-\ua66e\ua67f-\ua697\ua6a0-\ua6ef\ua717-\ua71f\ua722-\ua788\ua78b-\ua78e\ua790-\ua793\ua7a0-\ua7aa\ua7f8-\ua801\ua803-\ua805\ua807-\ua80a\ua80c-\ua822\ua840-\ua873\ua882-\ua8b3\ua8f2-\ua8f7\ua8fb\ua90a-\ua925\ua930-\ua946\ua960-\ua97c\ua984-\ua9b2\ua9cf\uaa00-\uaa28\uaa40-\uaa42\uaa44-\uaa4b\uaa60-\uaa76\uaa7a\uaa80-\uaaaf\uaab1\uaab5\uaab6\uaab9-\uaabd\uaac0\uaac2\uaadb-\uaadd\uaae0-\uaaea\uaaf2-\uaaf4\uab01-\uab06\uab09-\uab0e\uab11-\uab16\uab20-\uab26\uab28-\uab2e\uabc0-\uabe2\uac00-\ud7a3\ud7b0-\ud7c6\ud7cb-\ud7fb\uf900-\ufa6d\ufa70-\ufad9\ufb00-\ufb06\ufb13-\ufb17\ufb1d\ufb1f-\ufb28\ufb2a-\ufb36\ufb38-\ufb3c\ufb3e\ufb40\ufb41\ufb43\ufb44\ufb46-\ufbb1\ufbd3-\ufd3d\ufd50-\ufd8f\ufd92-\ufdc7\ufdf0-\ufdfb\ufe70-\ufe74\ufe76-\ufefc\uff21-\uff3a\uff41-\uff5a\uff66-\uffbe\uffc2-\uffc7\uffca-\uffcf\uffd2-\uffd7\uffda-\uffdc]'),
        NonAsciiIdentifierPart: new RegExp('[\xaa\xb5\xba\xc0-\xd6\xd8-\xf6\xf8-\u02c1\u02c6-\u02d1\u02e0-\u02e4\u02ec\u02ee\u0300-\u0374\u0376\u0377\u037a-\u037d\u0386\u0388-\u038a\u038c\u038e-\u03a1\u03a3-\u03f5\u03f7-\u0481\u0483-\u0487\u048a-\u0527\u0531-\u0556\u0559\u0561-\u0587\u0591-\u05bd\u05bf\u05c1\u05c2\u05c4\u05c5\u05c7\u05d0-\u05ea\u05f0-\u05f2\u0610-\u061a\u0620-\u0669\u066e-\u06d3\u06d5-\u06dc\u06df-\u06e8\u06ea-\u06fc\u06ff\u0710-\u074a\u074d-\u07b1\u07c0-\u07f5\u07fa\u0800-\u082d\u0840-\u085b\u08a0\u08a2-\u08ac\u08e4-\u08fe\u0900-\u0963\u0966-\u096f\u0971-\u0977\u0979-\u097f\u0981-\u0983\u0985-\u098c\u098f\u0990\u0993-\u09a8\u09aa-\u09b0\u09b2\u09b6-\u09b9\u09bc-\u09c4\u09c7\u09c8\u09cb-\u09ce\u09d7\u09dc\u09dd\u09df-\u09e3\u09e6-\u09f1\u0a01-\u0a03\u0a05-\u0a0a\u0a0f\u0a10\u0a13-\u0a28\u0a2a-\u0a30\u0a32\u0a33\u0a35\u0a36\u0a38\u0a39\u0a3c\u0a3e-\u0a42\u0a47\u0a48\u0a4b-\u0a4d\u0a51\u0a59-\u0a5c\u0a5e\u0a66-\u0a75\u0a81-\u0a83\u0a85-\u0a8d\u0a8f-\u0a91\u0a93-\u0aa8\u0aaa-\u0ab0\u0ab2\u0ab3\u0ab5-\u0ab9\u0abc-\u0ac5\u0ac7-\u0ac9\u0acb-\u0acd\u0ad0\u0ae0-\u0ae3\u0ae6-\u0aef\u0b01-\u0b03\u0b05-\u0b0c\u0b0f\u0b10\u0b13-\u0b28\u0b2a-\u0b30\u0b32\u0b33\u0b35-\u0b39\u0b3c-\u0b44\u0b47\u0b48\u0b4b-\u0b4d\u0b56\u0b57\u0b5c\u0b5d\u0b5f-\u0b63\u0b66-\u0b6f\u0b71\u0b82\u0b83\u0b85-\u0b8a\u0b8e-\u0b90\u0b92-\u0b95\u0b99\u0b9a\u0b9c\u0b9e\u0b9f\u0ba3\u0ba4\u0ba8-\u0baa\u0bae-\u0bb9\u0bbe-\u0bc2\u0bc6-\u0bc8\u0bca-\u0bcd\u0bd0\u0bd7\u0be6-\u0bef\u0c01-\u0c03\u0c05-\u0c0c\u0c0e-\u0c10\u0c12-\u0c28\u0c2a-\u0c33\u0c35-\u0c39\u0c3d-\u0c44\u0c46-\u0c48\u0c4a-\u0c4d\u0c55\u0c56\u0c58\u0c59\u0c60-\u0c63\u0c66-\u0c6f\u0c82\u0c83\u0c85-\u0c8c\u0c8e-\u0c90\u0c92-\u0ca8\u0caa-\u0cb3\u0cb5-\u0cb9\u0cbc-\u0cc4\u0cc6-\u0cc8\u0cca-\u0ccd\u0cd5\u0cd6\u0cde\u0ce0-\u0ce3\u0ce6-\u0cef\u0cf1\u0cf2\u0d02\u0d03\u0d05-\u0d0c\u0d0e-\u0d10\u0d12-\u0d3a\u0d3d-\u0d44\u0d46-\u0d48\u0d4a-\u0d4e\u0d57\u0d60-\u0d63\u0d66-\u0d6f\u0d7a-\u0d7f\u0d82\u0d83\u0d85-\u0d96\u0d9a-\u0db1\u0db3-\u0dbb\u0dbd\u0dc0-\u0dc6\u0dca\u0dcf-\u0dd4\u0dd6\u0dd8-\u0ddf\u0df2\u0df3\u0e01-\u0e3a\u0e40-\u0e4e\u0e50-\u0e59\u0e81\u0e82\u0e84\u0e87\u0e88\u0e8a\u0e8d\u0e94-\u0e97\u0e99-\u0e9f\u0ea1-\u0ea3\u0ea5\u0ea7\u0eaa\u0eab\u0ead-\u0eb9\u0ebb-\u0ebd\u0ec0-\u0ec4\u0ec6\u0ec8-\u0ecd\u0ed0-\u0ed9\u0edc-\u0edf\u0f00\u0f18\u0f19\u0f20-\u0f29\u0f35\u0f37\u0f39\u0f3e-\u0f47\u0f49-\u0f6c\u0f71-\u0f84\u0f86-\u0f97\u0f99-\u0fbc\u0fc6\u1000-\u1049\u1050-\u109d\u10a0-\u10c5\u10c7\u10cd\u10d0-\u10fa\u10fc-\u1248\u124a-\u124d\u1250-\u1256\u1258\u125a-\u125d\u1260-\u1288\u128a-\u128d\u1290-\u12b0\u12b2-\u12b5\u12b8-\u12be\u12c0\u12c2-\u12c5\u12c8-\u12d6\u12d8-\u1310\u1312-\u1315\u1318-\u135a\u135d-\u135f\u1380-\u138f\u13a0-\u13f4\u1401-\u166c\u166f-\u167f\u1681-\u169a\u16a0-\u16ea\u16ee-\u16f0\u1700-\u170c\u170e-\u1714\u1720-\u1734\u1740-\u1753\u1760-\u176c\u176e-\u1770\u1772\u1773\u1780-\u17d3\u17d7\u17dc\u17dd\u17e0-\u17e9\u180b-\u180d\u1810-\u1819\u1820-\u1877\u1880-\u18aa\u18b0-\u18f5\u1900-\u191c\u1920-\u192b\u1930-\u193b\u1946-\u196d\u1970-\u1974\u1980-\u19ab\u19b0-\u19c9\u19d0-\u19d9\u1a00-\u1a1b\u1a20-\u1a5e\u1a60-\u1a7c\u1a7f-\u1a89\u1a90-\u1a99\u1aa7\u1b00-\u1b4b\u1b50-\u1b59\u1b6b-\u1b73\u1b80-\u1bf3\u1c00-\u1c37\u1c40-\u1c49\u1c4d-\u1c7d\u1cd0-\u1cd2\u1cd4-\u1cf6\u1d00-\u1de6\u1dfc-\u1f15\u1f18-\u1f1d\u1f20-\u1f45\u1f48-\u1f4d\u1f50-\u1f57\u1f59\u1f5b\u1f5d\u1f5f-\u1f7d\u1f80-\u1fb4\u1fb6-\u1fbc\u1fbe\u1fc2-\u1fc4\u1fc6-\u1fcc\u1fd0-\u1fd3\u1fd6-\u1fdb\u1fe0-\u1fec\u1ff2-\u1ff4\u1ff6-\u1ffc\u200c\u200d\u203f\u2040\u2054\u2071\u207f\u2090-\u209c\u20d0-\u20dc\u20e1\u20e5-\u20f0\u2102\u2107\u210a-\u2113\u2115\u2119-\u211d\u2124\u2126\u2128\u212a-\u212d\u212f-\u2139\u213c-\u213f\u2145-\u2149\u214e\u2160-\u2188\u2c00-\u2c2e\u2c30-\u2c5e\u2c60-\u2ce4\u2ceb-\u2cf3\u2d00-\u2d25\u2d27\u2d2d\u2d30-\u2d67\u2d6f\u2d7f-\u2d96\u2da0-\u2da6\u2da8-\u2dae\u2db0-\u2db6\u2db8-\u2dbe\u2dc0-\u2dc6\u2dc8-\u2dce\u2dd0-\u2dd6\u2dd8-\u2dde\u2de0-\u2dff\u2e2f\u3005-\u3007\u3021-\u302f\u3031-\u3035\u3038-\u303c\u3041-\u3096\u3099\u309a\u309d-\u309f\u30a1-\u30fa\u30fc-\u30ff\u3105-\u312d\u3131-\u318e\u31a0-\u31ba\u31f0-\u31ff\u3400-\u4db5\u4e00-\u9fcc\ua000-\ua48c\ua4d0-\ua4fd\ua500-\ua60c\ua610-\ua62b\ua640-\ua66f\ua674-\ua67d\ua67f-\ua697\ua69f-\ua6f1\ua717-\ua71f\ua722-\ua788\ua78b-\ua78e\ua790-\ua793\ua7a0-\ua7aa\ua7f8-\ua827\ua840-\ua873\ua880-\ua8c4\ua8d0-\ua8d9\ua8e0-\ua8f7\ua8fb\ua900-\ua92d\ua930-\ua953\ua960-\ua97c\ua980-\ua9c0\ua9cf-\ua9d9\uaa00-\uaa36\uaa40-\uaa4d\uaa50-\uaa59\uaa60-\uaa76\uaa7a\uaa7b\uaa80-\uaac2\uaadb-\uaadd\uaae0-\uaaef\uaaf2-\uaaf6\uab01-\uab06\uab09-\uab0e\uab11-\uab16\uab20-\uab26\uab28-\uab2e\uabc0-\uabea\uabec\uabed\uabf0-\uabf9\uac00-\ud7a3\ud7b0-\ud7c6\ud7cb-\ud7fb\uf900-\ufa6d\ufa70-\ufad9\ufb00-\ufb06\ufb13-\ufb17\ufb1d-\ufb28\ufb2a-\ufb36\ufb38-\ufb3c\ufb3e\ufb40\ufb41\ufb43\ufb44\ufb46-\ufbb1\ufbd3-\ufd3d\ufd50-\ufd8f\ufd92-\ufdc7\ufdf0-\ufdfb\ufe00-\ufe0f\ufe20-\ufe26\ufe33\ufe34\ufe4d-\ufe4f\ufe70-\ufe74\ufe76-\ufefc\uff10-\uff19\uff21-\uff3a\uff3f\uff41-\uff5a\uff66-\uffbe\uffc2-\uffc7\uffca-\uffcf\uffd2-\uffd7\uffda-\uffdc]')
    };

    // Ensure the condition is true, otherwise throw an error.
    // This is only to have a better contract semantic, i.e. another safety net
    // to catch a logic error. The condition shall be fulfilled in normal case.
    // Do NOT use this to enforce a certain condition on any user input.

    function assert(condition, message) {
        if (!condition) {
            throw new Error('ASSERT: ' + message);
        }
    }

    function isDecimalDigit(ch) {
        return (ch >= 48 && ch <= 57);   // 0..9
    }

    function isHexDigit(ch) {
        return '0123456789abcdefABCDEF'.indexOf(ch) >= 0;
    }

    function isOctalDigit(ch) {
        return '01234567'.indexOf(ch) >= 0;
    }


    // 7.2 White Space

    function isWhiteSpace(ch) {
        return (ch === 32) ||  // space
            (ch === 9) ||      // tab
            (ch === 0xB) ||
            (ch === 0xC) ||
            (ch === 0xA0) ||
            (ch >= 0x1680 && '\u1680\u180E\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200A\u202F\u205F\u3000\uFEFF'.indexOf(String.fromCharCode(ch)) > 0);
    }

    // 7.3 Line Terminators

    function isLineTerminator(ch) {
        return (ch === 10) || (ch === 13) || (ch === 0x2028) || (ch === 0x2029);
    }

    // 7.6 Identifier Names and Identifiers

    function isIdentifierStart(ch) {
        return (ch === 36) || (ch === 95) ||  // $ (dollar) and _ (underscore)
            (ch >= 65 && ch <= 90) ||         // A..Z
            (ch >= 97 && ch <= 122) ||        // a..z
            (ch === 92) ||                    // \ (backslash)
            ((ch >= 0x80) && Regex.NonAsciiIdentifierStart.test(String.fromCharCode(ch)));
    }

    function isIdentifierPart(ch) {
        return (ch === 36) || (ch === 95) ||  // $ (dollar) and _ (underscore)
            (ch >= 65 && ch <= 90) ||         // A..Z
            (ch >= 97 && ch <= 122) ||        // a..z
            (ch >= 48 && ch <= 57) ||         // 0..9
            (ch === 92) ||                    // \ (backslash)
            ((ch >= 0x80) && Regex.NonAsciiIdentifierPart.test(String.fromCharCode(ch)));
    }

    // 7.6.1.2 Future Reserved Words

    function isFutureReservedWord(id) {
        switch (id) {
        case 'class':
        case 'enum':
        case 'export':
        case 'extends':
        case 'import':
        case 'super':
            return true;
        default:
            return false;
        }
    }

    function isStrictModeReservedWord(id) {
        switch (id) {
        case 'implements':
        case 'interface':
        case 'package':
        case 'private':
        case 'protected':
        case 'public':
        case 'static':
        case 'yield':
        case 'let':
            return true;
        default:
            return false;
        }
    }

    function isRestrictedWord(id) {
        return id === 'eval' || id === 'arguments';
    }

    // 7.6.1.1 Keywords

    function isKeyword(id) {
        if (strict && isStrictModeReservedWord(id)) {
            return true;
        }

        // 'const' is specialized as Keyword in V8.
        // 'yield' and 'let' are for compatiblity with SpiderMonkey and ES.next.
        // Some others are from future reserved words.

        switch (id.length) {
        case 2:
            return (id === 'if') || (id === 'in') || (id === 'do');
        case 3:
            return (id === 'var') || (id === 'for') || (id === 'new') ||
                (id === 'try') || (id === 'let');
        case 4:
            return (id === 'this') || (id === 'else') || (id === 'case') ||
                (id === 'void') || (id === 'with') || (id === 'enum');
        case 5:
            return (id === 'while') || (id === 'break') || (id === 'catch') ||
                (id === 'throw') || (id === 'const') || (id === 'yield') ||
                (id === 'class') || (id === 'super');
        case 6:
            return (id === 'return') || (id === 'typeof') || (id === 'delete') ||
                (id === 'switch') || (id === 'export') || (id === 'import');
        case 7:
            return (id === 'default') || (id === 'finally') || (id === 'extends');
        case 8:
            return (id === 'function') || (id === 'continue') || (id === 'debugger');
        case 10:
            return (id === 'instanceof');
        default:
            return false;
        }
    }

    // 7.4 Comments

    function addComment(type, value, start, end, loc) {
        var comment;

        assert(typeof start === 'number', 'Comment must have valid position');

        // Because the way the actual token is scanned, often the comments
        // (if any) are skipped twice during the lexical analysis.
        // Thus, we need to skip adding a comment if the comment array already
        // handled it.
        if (state.lastCommentStart >= start) {
            return;
        }
        state.lastCommentStart = start;

        comment = {
            type: type,
            value: value
        };
        if (extra.range) {
            comment.range = [start, end];
        }
        if (extra.loc) {
            comment.loc = loc;
        }
        extra.comments.push(comment);
    }

    function skipSingleLineComment() {
        var start, loc, ch, comment;

        start = index - 2;
        loc = {
            start: {
                line: lineNumber,
                column: index - lineStart - 2
            }
        };

        while (index < length) {
            ch = source.charCodeAt(index);
            ++index;
            if (isLineTerminator(ch)) {
                if (extra.comments) {
                    comment = source.slice(start + 2, index - 1);
                    loc.end = {
                        line: lineNumber,
                        column: index - lineStart - 1
                    };
                    addComment('Line', comment, start, index - 1, loc);
                }
                if (ch === 13 && source.charCodeAt(index) === 10) {
                    ++index;
                }
                ++lineNumber;
                lineStart = index;
                return;
            }
        }

        if (extra.comments) {
            comment = source.slice(start + 2, index);
            loc.end = {
                line: lineNumber,
                column: index - lineStart
            };
            addComment('Line', comment, start, index, loc);
        }
    }

    function skipMultiLineComment() {
        var start, loc, ch, comment;

        if (extra.comments) {
            start = index - 2;
            loc = {
                start: {
                    line: lineNumber,
                    column: index - lineStart - 2
                }
            };
        }

        while (index < length) {
            ch = source.charCodeAt(index);
            if (isLineTerminator(ch)) {
                if (ch === 13 && source.charCodeAt(index + 1) === 10) {
                    ++index;
                }
                ++lineNumber;
                ++index;
                lineStart = index;
                if (index >= length) {
                    throwError({}, Messages.UnexpectedToken, 'ILLEGAL');
                }
            } else if (ch === 42) {
                // Block comment ends with '*/' (char #42, char #47).
                if (source.charCodeAt(index + 1) === 47) {
                    ++index;
                    ++index;
                    if (extra.comments) {
                        comment = source.slice(start + 2, index - 2);
                        loc.end = {
                            line: lineNumber,
                            column: index - lineStart
                        };
                        addComment('Block', comment, start, index, loc);
                    }
                    return;
                }
                ++index;
            } else {
                ++index;
            }
        }

        throwError({}, Messages.UnexpectedToken, 'ILLEGAL');
    }

    function skipComment() {
        var ch;

        while (index < length) {
            ch = source.charCodeAt(index);

            if (isWhiteSpace(ch)) {
                ++index;
            } else if (isLineTerminator(ch)) {
                ++index;
                if (ch === 13 && source.charCodeAt(index) === 10) {
                    ++index;
                }
                ++lineNumber;
                lineStart = index;
            } else if (ch === 47) { // 47 is '/'
                ch = source.charCodeAt(index + 1);
                if (ch === 47) {
                    ++index;
                    ++index;
                    skipSingleLineComment();
                } else if (ch === 42) {  // 42 is '*'
                    ++index;
                    ++index;
                    skipMultiLineComment();
                } else {
                    break;
                }
            } else {
                break;
            }
        }
    }

    function scanHexEscape(prefix) {
        var i, len, ch, code = 0;

        len = (prefix === 'u') ? 4 : 2;
        for (i = 0; i < len; ++i) {
            if (index < length && isHexDigit(source[index])) {
                ch = source[index++];
                code = code * 16 + '0123456789abcdef'.indexOf(ch.toLowerCase());
            } else {
                return '';
            }
        }
        return String.fromCharCode(code);
    }

    function getEscapedIdentifier() {
        var ch, id;

        ch = source.charCodeAt(index++);
        id = String.fromCharCode(ch);

        // '\u' (char #92, char #117) denotes an escaped character.
        if (ch === 92) {
            if (source.charCodeAt(index) !== 117) {
                throwError({}, Messages.UnexpectedToken, 'ILLEGAL');
            }
            ++index;
            ch = scanHexEscape('u');
            if (!ch || ch === '\\' || !isIdentifierStart(ch.charCodeAt(0))) {
                throwError({}, Messages.UnexpectedToken, 'ILLEGAL');
            }
            id = ch;
        }

        while (index < length) {
            ch = source.charCodeAt(index);
            if (!isIdentifierPart(ch)) {
                break;
            }
            ++index;
            id += String.fromCharCode(ch);

            // '\u' (char #92, char #117) denotes an escaped character.
            if (ch === 92) {
                id = id.substr(0, id.length - 1);
                if (source.charCodeAt(index) !== 117) {
                    throwError({}, Messages.UnexpectedToken, 'ILLEGAL');
                }
                ++index;
                ch = scanHexEscape('u');
                if (!ch || ch === '\\' || !isIdentifierPart(ch.charCodeAt(0))) {
                    throwError({}, Messages.UnexpectedToken, 'ILLEGAL');
                }
                id += ch;
            }
        }

        return id;
    }

    function getIdentifier() {
        var start, ch;

        start = index++;
        while (index < length) {
            ch = source.charCodeAt(index);
            if (ch === 92) {
                // Blackslash (char #92) marks Unicode escape sequence.
                index = start;
                return getEscapedIdentifier();
            }
            if (isIdentifierPart(ch)) {
                ++index;
            } else {
                break;
            }
        }

        return source.slice(start, index);
    }

    function scanIdentifier() {
        var start, id, type;

        start = index;

        // Backslash (char #92) starts an escaped character.
        id = (source.charCodeAt(index) === 92) ? getEscapedIdentifier() : getIdentifier();

        // There is no keyword or literal with only one character.
        // Thus, it must be an identifier.
        if (id.length === 1) {
            type = Token.Identifier;
        } else if (isKeyword(id)) {
            type = Token.Keyword;
        } else if (id === 'null') {
            type = Token.NullLiteral;
        } else if (id === 'true' || id === 'false') {
            type = Token.BooleanLiteral;
        } else {
            type = Token.Identifier;
        }

        return {
            type: type,
            value: id,
            lineNumber: lineNumber,
            lineStart: lineStart,
            range: [start, index]
        };
    }


    // 7.7 Punctuators

    function scanPunctuator() {
        var start = index,
            code = source.charCodeAt(index),
            code2,
            ch1 = source[index],
            ch2,
            ch3,
            ch4;

        switch (code) {

        // Check for most common single-character punctuators.
        case 46:   // . dot
        case 40:   // ( open bracket
        case 41:   // ) close bracket
        case 59:   // ; semicolon
        case 44:   // , comma
        case 123:  // { open curly brace
        case 125:  // } close curly brace
        case 91:   // [
        case 93:   // ]
        case 58:   // :
        case 63:   // ?
        case 126:  // ~
            ++index;
            if (extra.tokenize) {
                if (code === 40) {
                    extra.openParenToken = extra.tokens.length;
                } else if (code === 123) {
                    extra.openCurlyToken = extra.tokens.length;
                }
            }
            return {
                type: Token.Punctuator,
                value: String.fromCharCode(code),
                lineNumber: lineNumber,
                lineStart: lineStart,
                range: [start, index]
            };

        default:
            code2 = source.charCodeAt(index + 1);

            // '=' (char #61) marks an assignment or comparison operator.
            if (code2 === 61) {
                switch (code) {
                case 37:  // %
                case 38:  // &
                case 42:  // *:
                case 43:  // +
                case 45:  // -
                case 47:  // /
                case 60:  // <
                case 62:  // >
                case 94:  // ^
                case 124: // |
                    index += 2;
                    return {
                        type: Token.Punctuator,
                        value: String.fromCharCode(code) + String.fromCharCode(code2),
                        lineNumber: lineNumber,
                        lineStart: lineStart,
                        range: [start, index]
                    };

                case 33: // !
                case 61: // =
                    index += 2;

                    // !== and ===
                    if (source.charCodeAt(index) === 61) {
                        ++index;
                    }
                    return {
                        type: Token.Punctuator,
                        value: source.slice(start, index),
                        lineNumber: lineNumber,
                        lineStart: lineStart,
                        range: [start, index]
                    };
                default:
                    break;
                }
            }
            break;
        }

        // Peek more characters.

        ch2 = source[index + 1];
        ch3 = source[index + 2];
        ch4 = source[index + 3];

        // 4-character punctuator: >>>=

        if (ch1 === '>' && ch2 === '>' && ch3 === '>') {
            if (ch4 === '=') {
                index += 4;
                return {
                    type: Token.Punctuator,
                    value: '>>>=',
                    lineNumber: lineNumber,
                    lineStart: lineStart,
                    range: [start, index]
                };
            }
        }

        // 3-character punctuators: === !== >>> <<= >>=

        if (ch1 === '>' && ch2 === '>' && ch3 === '>') {
            index += 3;
            return {
                type: Token.Punctuator,
                value: '>>>',
                lineNumber: lineNumber,
                lineStart: lineStart,
                range: [start, index]
            };
        }

        if (ch1 === '<' && ch2 === '<' && ch3 === '=') {
            index += 3;
            return {
                type: Token.Punctuator,
                value: '<<=',
                lineNumber: lineNumber,
                lineStart: lineStart,
                range: [start, index]
            };
        }

        if (ch1 === '>' && ch2 === '>' && ch3 === '=') {
            index += 3;
            return {
                type: Token.Punctuator,
                value: '>>=',
                lineNumber: lineNumber,
                lineStart: lineStart,
                range: [start, index]
            };
        }

        // Other 2-character punctuators: ++ -- << >> && ||

        if (ch1 === ch2 && ('+-<>&|'.indexOf(ch1) >= 0)) {
            index += 2;
            return {
                type: Token.Punctuator,
                value: ch1 + ch2,
                lineNumber: lineNumber,
                lineStart: lineStart,
                range: [start, index]
            };
        }

        if ('<>=!+-*%&|^/'.indexOf(ch1) >= 0) {
            ++index;
            return {
                type: Token.Punctuator,
                value: ch1,
                lineNumber: lineNumber,
                lineStart: lineStart,
                range: [start, index]
            };
        }

        throwError({}, Messages.UnexpectedToken, 'ILLEGAL');
    }

    // 7.8.3 Numeric Literals

    function scanHexLiteral(start) {
        var number = '';

        while (index < length) {
            if (!isHexDigit(source[index])) {
                break;
            }
            number += source[index++];
        }

        if (number.length === 0) {
            throwError({}, Messages.UnexpectedToken, 'ILLEGAL');
        }

        if (isIdentifierStart(source.charCodeAt(index))) {
            throwError({}, Messages.UnexpectedToken, 'ILLEGAL');
        }

        return {
            type: Token.NumericLiteral,
            value: parseInt('0x' + number, 16),
            lineNumber: lineNumber,
            lineStart: lineStart,
            range: [start, index]
        };
    }

    function scanOctalLiteral(start) {
        var number = '0' + source[index++];
        while (index < length) {
            if (!isOctalDigit(source[index])) {
                break;
            }
            number += source[index++];
        }

        if (isIdentifierStart(source.charCodeAt(index)) || isDecimalDigit(source.charCodeAt(index))) {
            throwError({}, Messages.UnexpectedToken, 'ILLEGAL');
        }

        return {
            type: Token.NumericLiteral,
            value: parseInt(number, 8),
            octal: true,
            lineNumber: lineNumber,
            lineStart: lineStart,
            range: [start, index]
        };
    }

    function scanNumericLiteral() {
        var number, start, ch;

        ch = source[index];
        assert(isDecimalDigit(ch.charCodeAt(0)) || (ch === '.'),
            'Numeric literal must start with a decimal digit or a decimal point');

        start = index;
        number = '';
        if (ch !== '.') {
            number = source[index++];
            ch = source[index];

            // Hex number starts with '0x'.
            // Octal number starts with '0'.
            if (number === '0') {
                if (ch === 'x' || ch === 'X') {
                    ++index;
                    return scanHexLiteral(start);
                }
                if (isOctalDigit(ch)) {
                    return scanOctalLiteral(start);
                }

                // decimal number starts with '0' such as '09' is illegal.
                if (ch && isDecimalDigit(ch.charCodeAt(0))) {
                    throwError({}, Messages.UnexpectedToken, 'ILLEGAL');
                }
            }

            while (isDecimalDigit(source.charCodeAt(index))) {
                number += source[index++];
            }
            ch = source[index];
        }

        if (ch === '.') {
            number += source[index++];
            while (isDecimalDigit(source.charCodeAt(index))) {
                number += source[index++];
            }
            ch = source[index];
        }

        if (ch === 'e' || ch === 'E') {
            number += source[index++];

            ch = source[index];
            if (ch === '+' || ch === '-') {
                number += source[index++];
            }
            if (isDecimalDigit(source.charCodeAt(index))) {
                while (isDecimalDigit(source.charCodeAt(index))) {
                    number += source[index++];
                }
            } else {
                throwError({}, Messages.UnexpectedToken, 'ILLEGAL');
            }
        }

        if (isIdentifierStart(source.charCodeAt(index))) {
            throwError({}, Messages.UnexpectedToken, 'ILLEGAL');
        }

        return {
            type: Token.NumericLiteral,
            value: parseFloat(number),
            lineNumber: lineNumber,
            lineStart: lineStart,
            range: [start, index]
        };
    }

    // 7.8.4 String Literals

    function scanStringLiteral() {
        var str = '', quote, start, ch, code, unescaped, restore, octal = false;

        quote = source[index];
        assert((quote === '\'' || quote === '"'),
            'String literal must starts with a quote');

        start = index;
        ++index;

        while (index < length) {
            ch = source[index++];

            if (ch === quote) {
                quote = '';
                break;
            } else if (ch === '\\') {
                ch = source[index++];
                if (!ch || !isLineTerminator(ch.charCodeAt(0))) {
                    switch (ch) {
                    case 'n':
                        str += '\n';
                        break;
                    case 'r':
                        str += '\r';
                        break;
                    case 't':
                        str += '\t';
                        break;
                    case 'u':
                    case 'x':
                        restore = index;
                        unescaped = scanHexEscape(ch);
                        if (unescaped) {
                            str += unescaped;
                        } else {
                            index = restore;
                            str += ch;
                        }
                        break;
                    case 'b':
                        str += '\b';
                        break;
                    case 'f':
                        str += '\f';
                        break;
                    case 'v':
                        str += '\x0B';
                        break;

                    default:
                        if (isOctalDigit(ch)) {
                            code = '01234567'.indexOf(ch);

                            // \0 is not octal escape sequence
                            if (code !== 0) {
                                octal = true;
                            }

                            if (index < length && isOctalDigit(source[index])) {
                                octal = true;
                                code = code * 8 + '01234567'.indexOf(source[index++]);

                                // 3 digits are only allowed when string starts
                                // with 0, 1, 2, 3
                                if ('0123'.indexOf(ch) >= 0 &&
                                        index < length &&
                                        isOctalDigit(source[index])) {
                                    code = code * 8 + '01234567'.indexOf(source[index++]);
                                }
                            }
                            str += String.fromCharCode(code);
                        } else {
                            str += ch;
                        }
                        break;
                    }
                } else {
                    ++lineNumber;
                    if (ch ===  '\r' && source[index] === '\n') {
                        ++index;
                    }
                }
            } else if (isLineTerminator(ch.charCodeAt(0))) {
                break;
            } else {
                str += ch;
            }
        }

        if (quote !== '') {
            throwError({}, Messages.UnexpectedToken, 'ILLEGAL');
        }

        return {
            type: Token.StringLiteral,
            value: str,
            octal: octal,
            lineNumber: lineNumber,
            lineStart: lineStart,
            range: [start, index]
        };
    }

    function scanRegExp() {
        var str, ch, start, pattern, flags, value, classMarker = false, restore, terminated = false;

        lookahead = null;
        skipComment();

        start = index;
        ch = source[index];
        assert(ch === '/', 'Regular expression literal must start with a slash');
        str = source[index++];

        while (index < length) {
            ch = source[index++];
            str += ch;
            if (classMarker) {
                if (ch === ']') {
                    classMarker = false;
                }
            } else {
                if (ch === '\\') {
                    ch = source[index++];
                    // ECMA-262 7.8.5
                    if (isLineTerminator(ch.charCodeAt(0))) {
                        throwError({}, Messages.UnterminatedRegExp);
                    }
                    str += ch;
                } else if (ch === '/') {
                    terminated = true;
                    break;
                } else if (ch === '[') {
                    classMarker = true;
                } else if (isLineTerminator(ch.charCodeAt(0))) {
                    throwError({}, Messages.UnterminatedRegExp);
                }
            }
        }

        if (!terminated) {
            throwError({}, Messages.UnterminatedRegExp);
        }

        // Exclude leading and trailing slash.
        pattern = str.substr(1, str.length - 2);

        flags = '';
        while (index < length) {
            ch = source[index];
            if (!isIdentifierPart(ch.charCodeAt(0))) {
                break;
            }

            ++index;
            if (ch === '\\' && index < length) {
                ch = source[index];
                if (ch === 'u') {
                    ++index;
                    restore = index;
                    ch = scanHexEscape('u');
                    if (ch) {
                        flags += ch;
                        for (str += '\\u'; restore < index; ++restore) {
                            str += source[restore];
                        }
                    } else {
                        index = restore;
                        flags += 'u';
                        str += '\\u';
                    }
                } else {
                    str += '\\';
                }
            } else {
                flags += ch;
                str += ch;
            }
        }

        try {
            value = new RegExp(pattern, flags);
        } catch (e) {
            throwError({}, Messages.InvalidRegExp);
        }

        peek();


        if (extra.tokenize) {
            return {
                type: Token.RegularExpression,
                value: value,
                lineNumber: lineNumber,
                lineStart: lineStart,
                range: [start, index]
            };
        }
        return {
            literal: str,
            value: value,
            range: [start, index]
        };
    }

    function collectRegex() {
        var pos, loc, regex, token;

        skipComment();

        pos = index;
        loc = {
            start: {
                line: lineNumber,
                column: index - lineStart
            }
        };

        regex = scanRegExp();
        loc.end = {
            line: lineNumber,
            column: index - lineStart
        };

        if (!extra.tokenize) {
            // Pop the previous token, which is likely '/' or '/='
            if (extra.tokens.length > 0) {
                token = extra.tokens[extra.tokens.length - 1];
                if (token.range[0] === pos && token.type === 'Punctuator') {
                    if (token.value === '/' || token.value === '/=') {
                        extra.tokens.pop();
                    }
                }
            }

            extra.tokens.push({
                type: 'RegularExpression',
                value: regex.literal,
                range: [pos, index],
                loc: loc
            });
        }

        return regex;
    }

    function isIdentifierName(token) {
        return token.type === Token.Identifier ||
            token.type === Token.Keyword ||
            token.type === Token.BooleanLiteral ||
            token.type === Token.NullLiteral;
    }

    function advanceSlash() {
        var prevToken,
            checkToken;
        // Using the following algorithm:
        // https://github.com/mozilla/sweet.js/wiki/design
        prevToken = extra.tokens[extra.tokens.length - 1];
        if (!prevToken) {
            // Nothing before that: it cannot be a division.
            return collectRegex();
        }
        if (prevToken.type === 'Punctuator') {
            if (prevToken.value === ')') {
                checkToken = extra.tokens[extra.openParenToken - 1];
                if (checkToken &&
                        checkToken.type === 'Keyword' &&
                        (checkToken.value === 'if' ||
                         checkToken.value === 'while' ||
                         checkToken.value === 'for' ||
                         checkToken.value === 'with')) {
                    return collectRegex();
                }
                return scanPunctuator();
            }
            if (prevToken.value === '}') {
                // Dividing a function by anything makes little sense,
                // but we have to check for that.
                if (extra.tokens[extra.openCurlyToken - 3] &&
                        extra.tokens[extra.openCurlyToken - 3].type === 'Keyword') {
                    // Anonymous function.
                    checkToken = extra.tokens[extra.openCurlyToken - 4];
                    if (!checkToken) {
                        return scanPunctuator();
                    }
                } else if (extra.tokens[extra.openCurlyToken - 4] &&
                        extra.tokens[extra.openCurlyToken - 4].type === 'Keyword') {
                    // Named function.
                    checkToken = extra.tokens[extra.openCurlyToken - 5];
                    if (!checkToken) {
                        return collectRegex();
                    }
                } else {
                    return scanPunctuator();
                }
                // checkToken determines whether the function is
                // a declaration or an expression.
                if (FnExprTokens.indexOf(checkToken.value) >= 0) {
                    // It is an expression.
                    return scanPunctuator();
                }
                // It is a declaration.
                return collectRegex();
            }
            return collectRegex();
        }
        if (prevToken.type === 'Keyword') {
            return collectRegex();
        }
        return scanPunctuator();
    }

    function advance() {
        var ch;

        skipComment();

        if (index >= length) {
            return {
                type: Token.EOF,
                lineNumber: lineNumber,
                lineStart: lineStart,
                range: [index, index]
            };
        }

        ch = source.charCodeAt(index);

        // Very common: ( and ) and ;
        if (ch === 40 || ch === 41 || ch === 58) {
            return scanPunctuator();
        }

        // String literal starts with single quote (#39) or double quote (#34).
        if (ch === 39 || ch === 34) {
            return scanStringLiteral();
        }

        if (isIdentifierStart(ch)) {
            return scanIdentifier();
        }

        // Dot (.) char #46 can also start a floating-point number, hence the need
        // to check the next character.
        if (ch === 46) {
            if (isDecimalDigit(source.charCodeAt(index + 1))) {
                return scanNumericLiteral();
            }
            return scanPunctuator();
        }

        if (isDecimalDigit(ch)) {
            return scanNumericLiteral();
        }

        // Slash (/) char #47 can also start a regex.
        if (extra.tokenize && ch === 47) {
            return advanceSlash();
        }

        return scanPunctuator();
    }

    function collectToken() {
        var start, loc, token, range, value;

        skipComment();
        start = index;
        loc = {
            start: {
                line: lineNumber,
                column: index - lineStart
            }
        };

        token = advance();
        loc.end = {
            line: lineNumber,
            column: index - lineStart
        };

        if (token.type !== Token.EOF) {
            range = [token.range[0], token.range[1]];
            value = source.slice(token.range[0], token.range[1]);
            extra.tokens.push({
                type: TokenName[token.type],
                value: value,
                range: range,
                loc: loc
            });
        }

        return token;
    }

    function lex() {
        var token;

        token = lookahead;
        index = token.range[1];
        lineNumber = token.lineNumber;
        lineStart = token.lineStart;

        lookahead = (typeof extra.tokens !== 'undefined') ? collectToken() : advance();

        index = token.range[1];
        lineNumber = token.lineNumber;
        lineStart = token.lineStart;

        return token;
    }

    function peek() {
        var pos, line, start;

        pos = index;
        line = lineNumber;
        start = lineStart;
        lookahead = (typeof extra.tokens !== 'undefined') ? collectToken() : advance();
        index = pos;
        lineNumber = line;
        lineStart = start;
    }

    SyntaxTreeDelegate = {

        name: 'SyntaxTree',

        markStart: function () {
            if (extra.loc) {
                state.markerStack.push(index - lineStart);
                state.markerStack.push(lineNumber);
            }
            if (extra.range) {
                state.markerStack.push(index);
            }
        },

        markEnd: function (node) {
            if (extra.range) {
                node.range = [state.markerStack.pop(), index];
            }
            if (extra.loc) {
                node.loc = {
                    start: {
                        line: state.markerStack.pop(),
                        column: state.markerStack.pop()
                    },
                    end: {
                        line: lineNumber,
                        column: index - lineStart
                    }
                };
                this.postProcess(node);
            }
            return node;
        },

        markEndIf: function (node) {
            if (node.range || node.loc) {
                if (extra.loc) {
                    state.markerStack.pop();
                    state.markerStack.pop();
                }
                if (extra.range) {
                    state.markerStack.pop();
                }
            } else {
                this.markEnd(node);
            }
            return node;
        },

        postProcess: function (node) {
            if (extra.source) {
                node.loc.source = extra.source;
            }
            return node;
        },

        createArrayExpression: function (elements) {
            return {
                type: Syntax.ArrayExpression,
                elements: elements
            };
        },

        createAssignmentExpression: function (operator, left, right) {
            return {
                type: Syntax.AssignmentExpression,
                operator: operator,
                left: left,
                right: right
            };
        },

        createBinaryExpression: function (operator, left, right) {
            var type = (operator === '||' || operator === '&&') ? Syntax.LogicalExpression :
                        Syntax.BinaryExpression;
            return {
                type: type,
                operator: operator,
                left: left,
                right: right
            };
        },

        createBlockStatement: function (body) {
            return {
                type: Syntax.BlockStatement,
                body: body
            };
        },

        createBreakStatement: function (label) {
            return {
                type: Syntax.BreakStatement,
                label: label
            };
        },

        createCallExpression: function (callee, args) {
            return {
                type: Syntax.CallExpression,
                callee: callee,
                'arguments': args
            };
        },

        createCatchClause: function (param, body) {
            return {
                type: Syntax.CatchClause,
                param: param,
                body: body
            };
        },

        createConditionalExpression: function (test, consequent, alternate) {
            return {
                type: Syntax.ConditionalExpression,
                test: test,
                consequent: consequent,
                alternate: alternate
            };
        },

        createContinueStatement: function (label) {
            return {
                type: Syntax.ContinueStatement,
                label: label
            };
        },

        createDebuggerStatement: function () {
            return {
                type: Syntax.DebuggerStatement
            };
        },

        createDoWhileStatement: function (body, test) {
            return {
                type: Syntax.DoWhileStatement,
                body: body,
                test: test
            };
        },

        createEmptyStatement: function () {
            return {
                type: Syntax.EmptyStatement
            };
        },

        createExpressionStatement: function (expression) {
            return {
                type: Syntax.ExpressionStatement,
                expression: expression
            };
        },

        createForStatement: function (init, test, update, body) {
            return {
                type: Syntax.ForStatement,
                init: init,
                test: test,
                update: update,
                body: body
            };
        },

        createForInStatement: function (left, right, body) {
            return {
                type: Syntax.ForInStatement,
                left: left,
                right: right,
                body: body,
                each: false
            };
        },

        createFunctionDeclaration: function (id, params, defaults, body) {
            return {
                type: Syntax.FunctionDeclaration,
                id: id,
                params: params,
                defaults: defaults,
                body: body,
                rest: null,
                generator: false,
                expression: false
            };
        },

        createFunctionExpression: function (id, params, defaults, body) {
            return {
                type: Syntax.FunctionExpression,
                id: id,
                params: params,
                defaults: defaults,
                body: body,
                rest: null,
                generator: false,
                expression: false
            };
        },

        createIdentifier: function (name) {
            return {
                type: Syntax.Identifier,
                name: name
            };
        },

        createIfStatement: function (test, consequent, alternate) {
            return {
                type: Syntax.IfStatement,
                test: test,
                consequent: consequent,
                alternate: alternate
            };
        },

        createLabeledStatement: function (label, body) {
            return {
                type: Syntax.LabeledStatement,
                label: label,
                body: body
            };
        },

        createLiteral: function (token) {
            return {
                type: Syntax.Literal,
                value: token.value,
                raw: source.slice(token.range[0], token.range[1])
            };
        },

        createMemberExpression: function (accessor, object, property) {
            return {
                type: Syntax.MemberExpression,
                computed: accessor === '[',
                object: object,
                property: property
            };
        },

        createNewExpression: function (callee, args) {
            return {
                type: Syntax.NewExpression,
                callee: callee,
                'arguments': args
            };
        },

        createObjectExpression: function (properties) {
            return {
                type: Syntax.ObjectExpression,
                properties: properties
            };
        },

        createPostfixExpression: function (operator, argument) {
            return {
                type: Syntax.UpdateExpression,
                operator: operator,
                argument: argument,
                prefix: false
            };
        },

        createProgram: function (body) {
            return {
                type: Syntax.Program,
                body: body
            };
        },

        createProperty: function (kind, key, value) {
            return {
                type: Syntax.Property,
                key: key,
                value: value,
                kind: kind
            };
        },

        createReturnStatement: function (argument) {
            return {
                type: Syntax.ReturnStatement,
                argument: argument
            };
        },

        createSequenceExpression: function (expressions) {
            return {
                type: Syntax.SequenceExpression,
                expressions: expressions
            };
        },

        createSwitchCase: function (test, consequent) {
            return {
                type: Syntax.SwitchCase,
                test: test,
                consequent: consequent
            };
        },

        createSwitchStatement: function (discriminant, cases) {
            return {
                type: Syntax.SwitchStatement,
                discriminant: discriminant,
                cases: cases
            };
        },

        createThisExpression: function () {
            return {
                type: Syntax.ThisExpression
            };
        },

        createThrowStatement: function (argument) {
            return {
                type: Syntax.ThrowStatement,
                argument: argument
            };
        },

        createTryStatement: function (block, guardedHandlers, handlers, finalizer) {
            return {
                type: Syntax.TryStatement,
                block: block,
                guardedHandlers: guardedHandlers,
                handlers: handlers,
                finalizer: finalizer
            };
        },

        createUnaryExpression: function (operator, argument) {
            if (operator === '++' || operator === '--') {
                return {
                    type: Syntax.UpdateExpression,
                    operator: operator,
                    argument: argument,
                    prefix: true
                };
            }
            return {
                type: Syntax.UnaryExpression,
                operator: operator,
                argument: argument,
                prefix: true
            };
        },

        createVariableDeclaration: function (declarations, kind) {
            return {
                type: Syntax.VariableDeclaration,
                declarations: declarations,
                kind: kind
            };
        },

        createVariableDeclarator: function (id, init) {
            return {
                type: Syntax.VariableDeclarator,
                id: id,
                init: init
            };
        },

        createWhileStatement: function (test, body) {
            return {
                type: Syntax.WhileStatement,
                test: test,
                body: body
            };
        },

        createWithStatement: function (object, body) {
            return {
                type: Syntax.WithStatement,
                object: object,
                body: body
            };
        }
    };

    // Return true if there is a line terminator before the next token.

    function peekLineTerminator() {
        var pos, line, start, found;

        pos = index;
        line = lineNumber;
        start = lineStart;
        skipComment();
        found = lineNumber !== line;
        index = pos;
        lineNumber = line;
        lineStart = start;

        return found;
    }

    // Throw an exception

    function throwError(token, messageFormat) {
        var error,
            args = Array.prototype.slice.call(arguments, 2),
            msg = messageFormat.replace(
                /%(\d)/g,
                function (whole, index) {
                    assert(index < args.length, 'Message reference must be in range');
                    return args[index];
                }
            );

        if (typeof token.lineNumber === 'number') {
            error = new Error('Line ' + token.lineNumber + ': ' + msg);
            error.index = token.range[0];
            error.lineNumber = token.lineNumber;
            error.column = token.range[0] - lineStart + 1;
        } else {
            error = new Error('Line ' + lineNumber + ': ' + msg);
            error.index = index;
            error.lineNumber = lineNumber;
            error.column = index - lineStart + 1;
        }

        error.description = msg;
        throw error;
    }

    function throwErrorTolerant() {
        try {
            throwError.apply(null, arguments);
        } catch (e) {
            if (extra.errors) {
                extra.errors.push(e);
            } else {
                throw e;
            }
        }
    }


    // Throw an exception because of the token.

    function throwUnexpected(token) {
        if (token.type === Token.EOF) {
            throwError(token, Messages.UnexpectedEOS);
        }

        if (token.type === Token.NumericLiteral) {
            throwError(token, Messages.UnexpectedNumber);
        }

        if (token.type === Token.StringLiteral) {
            throwError(token, Messages.UnexpectedString);
        }

        if (token.type === Token.Identifier) {
            throwError(token, Messages.UnexpectedIdentifier);
        }

        if (token.type === Token.Keyword) {
            if (isFutureReservedWord(token.value)) {
                throwError(token, Messages.UnexpectedReserved);
            } else if (strict && isStrictModeReservedWord(token.value)) {
                throwErrorTolerant(token, Messages.StrictReservedWord);
                return;
            }
            throwError(token, Messages.UnexpectedToken, token.value);
        }

        // BooleanLiteral, NullLiteral, or Punctuator.
        throwError(token, Messages.UnexpectedToken, token.value);
    }

    // Expect the next token to match the specified punctuator.
    // If not, an exception will be thrown.

    function expect(value) {
        var token = lex();
        if (token.type !== Token.Punctuator || token.value !== value) {
            throwUnexpected(token);
        }
    }

    // Expect the next token to match the specified keyword.
    // If not, an exception will be thrown.

    function expectKeyword(keyword) {
        var token = lex();
        if (token.type !== Token.Keyword || token.value !== keyword) {
            throwUnexpected(token);
        }
    }

    // Return true if the next token matches the specified punctuator.

    function match(value) {
        return lookahead.type === Token.Punctuator && lookahead.value === value;
    }

    // Return true if the next token matches the specified keyword

    function matchKeyword(keyword) {
        return lookahead.type === Token.Keyword && lookahead.value === keyword;
    }

    // Return true if the next token is an assignment operator

    function matchAssign() {
        var op;

        if (lookahead.type !== Token.Punctuator) {
            return false;
        }
        op = lookahead.value;
        return op === '=' ||
            op === '*=' ||
            op === '/=' ||
            op === '%=' ||
            op === '+=' ||
            op === '-=' ||
            op === '<<=' ||
            op === '>>=' ||
            op === '>>>=' ||
            op === '&=' ||
            op === '^=' ||
            op === '|=';
    }

    function consumeSemicolon() {
        var line;

        // Catch the very common case first: immediately a semicolon (char #59).
        if (source.charCodeAt(index) === 59) {
            lex();
            return;
        }

        line = lineNumber;
        skipComment();
        if (lineNumber !== line) {
            return;
        }

        if (match(';')) {
            lex();
            return;
        }

        if (lookahead.type !== Token.EOF && !match('}')) {
            throwUnexpected(lookahead);
        }
    }

    // Return true if provided expression is LeftHandSideExpression

    function isLeftHandSide(expr) {
        return expr.type === Syntax.Identifier || expr.type === Syntax.MemberExpression;
    }

    // 11.1.4 Array Initialiser

    function parseArrayInitialiser() {
        var elements = [];

        expect('[');

        while (!match(']')) {
            if (match(',')) {
                lex();
                elements.push(null);
            } else {
                elements.push(parseAssignmentExpression());

                if (!match(']')) {
                    expect(',');
                }
            }
        }

        expect(']');

        return delegate.createArrayExpression(elements);
    }

    // 11.1.5 Object Initialiser

    function parsePropertyFunction(param, first) {
        var previousStrict, body;

        previousStrict = strict;
        skipComment();
        delegate.markStart();
        body = parseFunctionSourceElements();
        if (first && strict && isRestrictedWord(param[0].name)) {
            throwErrorTolerant(first, Messages.StrictParamName);
        }
        strict = previousStrict;
        return delegate.markEnd(delegate.createFunctionExpression(null, param, [], body));
    }

    function parseObjectPropertyKey() {
        var token;

        skipComment();
        delegate.markStart();
        token = lex();

        // Note: This function is called only from parseObjectProperty(), where
        // EOF and Punctuator tokens are already filtered out.

        if (token.type === Token.StringLiteral || token.type === Token.NumericLiteral) {
            if (strict && token.octal) {
                throwErrorTolerant(token, Messages.StrictOctalLiteral);
            }
            return delegate.markEnd(delegate.createLiteral(token));
        }

        return delegate.markEnd(delegate.createIdentifier(token.value));
    }

    function parseObjectProperty() {
        var token, key, id, value, param;

        token = lookahead;
        skipComment();
        delegate.markStart();

        if (token.type === Token.Identifier) {

            id = parseObjectPropertyKey();

            // Property Assignment: Getter and Setter.

            if (token.value === 'get' && !match(':')) {
                key = parseObjectPropertyKey();
                expect('(');
                expect(')');
                value = parsePropertyFunction([]);
                return delegate.markEnd(delegate.createProperty('get', key, value));
            }
            if (token.value === 'set' && !match(':')) {
                key = parseObjectPropertyKey();
                expect('(');
                token = lookahead;
                if (token.type !== Token.Identifier) {
                    expect(')');
                    throwErrorTolerant(token, Messages.UnexpectedToken, token.value);
                    value = parsePropertyFunction([]);
                } else {
                    param = [ parseVariableIdentifier() ];
                    expect(')');
                    value = parsePropertyFunction(param, token);
                }
                return delegate.markEnd(delegate.createProperty('set', key, value));
            }
            expect(':');
            value = parseAssignmentExpression();
            return delegate.markEnd(delegate.createProperty('init', id, value));
        }
        if (token.type === Token.EOF || token.type === Token.Punctuator) {
            throwUnexpected(token);
        } else {
            key = parseObjectPropertyKey();
            expect(':');
            value = parseAssignmentExpression();
            return delegate.markEnd(delegate.createProperty('init', key, value));
        }
    }

    function parseObjectInitialiser() {
        var properties = [], property, name, key, kind, map = {}, toString = String;

        expect('{');

        while (!match('}')) {
            property = parseObjectProperty();

            if (property.key.type === Syntax.Identifier) {
                name = property.key.name;
            } else {
                name = toString(property.key.value);
            }
            kind = (property.kind === 'init') ? PropertyKind.Data : (property.kind === 'get') ? PropertyKind.Get : PropertyKind.Set;

            key = '$' + name;
            if (Object.prototype.hasOwnProperty.call(map, key)) {
                if (map[key] === PropertyKind.Data) {
                    if (strict && kind === PropertyKind.Data) {
                        throwErrorTolerant({}, Messages.StrictDuplicateProperty);
                    } else if (kind !== PropertyKind.Data) {
                        throwErrorTolerant({}, Messages.AccessorDataProperty);
                    }
                } else {
                    if (kind === PropertyKind.Data) {
                        throwErrorTolerant({}, Messages.AccessorDataProperty);
                    } else if (map[key] & kind) {
                        throwErrorTolerant({}, Messages.AccessorGetSet);
                    }
                }
                map[key] |= kind;
            } else {
                map[key] = kind;
            }

            properties.push(property);

            if (!match('}')) {
                expect(',');
            }
        }

        expect('}');

        return delegate.createObjectExpression(properties);
    }

    // 11.1.6 The Grouping Operator

    function parseGroupExpression() {
        var expr;

        expect('(');

        expr = parseExpression();

        expect(')');

        return expr;
    }


    // 11.1 Primary Expressions

    function parsePrimaryExpression() {
        var type, token, expr;

        if (match('(')) {
            return parseGroupExpression();
        }

        type = lookahead.type;
        delegate.markStart();

        if (type === Token.Identifier) {
            expr =  delegate.createIdentifier(lex().value);
        } else if (type === Token.StringLiteral || type === Token.NumericLiteral) {
            if (strict && lookahead.octal) {
                throwErrorTolerant(lookahead, Messages.StrictOctalLiteral);
            }
            expr = delegate.createLiteral(lex());
        } else if (type === Token.Keyword) {
            if (matchKeyword('this')) {
                lex();
                expr = delegate.createThisExpression();
            } else if (matchKeyword('function')) {
                expr = parseFunctionExpression();
            }
        } else if (type === Token.BooleanLiteral) {
            token = lex();
            token.value = (token.value === 'true');
            expr = delegate.createLiteral(token);
        } else if (type === Token.NullLiteral) {
            token = lex();
            token.value = null;
            expr = delegate.createLiteral(token);
        } else if (match('[')) {
            expr = parseArrayInitialiser();
        } else if (match('{')) {
            expr = parseObjectInitialiser();
        } else if (match('/') || match('/=')) {
            if (typeof extra.tokens !== 'undefined') {
                expr = delegate.createLiteral(collectRegex());
            } else {
                expr = delegate.createLiteral(scanRegExp());
            }
        }

        if (expr) {
            return delegate.markEnd(expr);
        }

        throwUnexpected(lex());
    }

    // 11.2 Left-Hand-Side Expressions

    function parseArguments() {
        var args = [];

        expect('(');

        if (!match(')')) {
            while (index < length) {
                args.push(parseAssignmentExpression());
                if (match(')')) {
                    break;
                }
                expect(',');
            }
        }

        expect(')');

        return args;
    }

    function parseNonComputedProperty() {
        var token;

        delegate.markStart();
        token = lex();

        if (!isIdentifierName(token)) {
            throwUnexpected(token);
        }

        return delegate.markEnd(delegate.createIdentifier(token.value));
    }

    function parseNonComputedMember() {
        expect('.');

        return parseNonComputedProperty();
    }

    function parseComputedMember() {
        var expr;

        expect('[');

        expr = parseExpression();

        expect(']');

        return expr;
    }

    function parseNewExpression() {
        var callee, args;

        delegate.markStart();
        expectKeyword('new');
        callee = parseLeftHandSideExpression();
        args = match('(') ? parseArguments() : [];

        return delegate.markEnd(delegate.createNewExpression(callee, args));
    }

    function parseLeftHandSideExpressionAllowCall() {
        var marker, expr, args, property;

        marker = createLocationMarker();

        expr = matchKeyword('new') ? parseNewExpression() : parsePrimaryExpression();

        while (match('.') || match('[') || match('(')) {
            if (match('(')) {
                args = parseArguments();
                expr = delegate.createCallExpression(expr, args);
            } else if (match('[')) {
                property = parseComputedMember();
                expr = delegate.createMemberExpression('[', expr, property);
            } else {
                property = parseNonComputedMember();
                expr = delegate.createMemberExpression('.', expr, property);
            }
            if (marker) {
                marker.end();
                marker.apply(expr);
            }
        }

        return expr;
    }

    function parseLeftHandSideExpression() {
        var marker, expr, property;

        marker = createLocationMarker();

        expr = matchKeyword('new') ? parseNewExpression() : parsePrimaryExpression();

        while (match('.') || match('[')) {
            if (match('[')) {
                property = parseComputedMember();
                expr = delegate.createMemberExpression('[', expr, property);
            } else {
                property = parseNonComputedMember();
                expr = delegate.createMemberExpression('.', expr, property);
            }
            if (marker) {
                marker.end();
                marker.apply(expr);
            }
        }

        return expr;
    }

    // 11.3 Postfix Expressions

    function parsePostfixExpression() {
        var expr, token;

        delegate.markStart();
        expr = parseLeftHandSideExpressionAllowCall();

        if (lookahead.type === Token.Punctuator) {
            if ((match('++') || match('--')) && !peekLineTerminator()) {
                // 11.3.1, 11.3.2
                if (strict && expr.type === Syntax.Identifier && isRestrictedWord(expr.name)) {
                    throwErrorTolerant({}, Messages.StrictLHSPostfix);
                }

                if (!isLeftHandSide(expr)) {
                    throwError({}, Messages.InvalidLHSInAssignment);
                }

                token = lex();
                expr = delegate.createPostfixExpression(token.value, expr);
            }
        }

        return delegate.markEndIf(expr);
    }

    // 11.4 Unary Operators

    function parseUnaryExpression() {
        var token, expr;

        delegate.markStart();

        if (lookahead.type !== Token.Punctuator && lookahead.type !== Token.Keyword) {
            expr = parsePostfixExpression();
        } else if (match('++') || match('--')) {
            token = lex();
            expr = parseUnaryExpression();
            // 11.4.4, 11.4.5
            if (strict && expr.type === Syntax.Identifier && isRestrictedWord(expr.name)) {
                throwErrorTolerant({}, Messages.StrictLHSPrefix);
            }

            if (!isLeftHandSide(expr)) {
                throwError({}, Messages.InvalidLHSInAssignment);
            }

            expr = delegate.createUnaryExpression(token.value, expr);
        } else if (match('+') || match('-') || match('~') || match('!')) {
            token = lex();
            expr = parseUnaryExpression();
            expr = delegate.createUnaryExpression(token.value, expr);
        } else if (matchKeyword('delete') || matchKeyword('void') || matchKeyword('typeof')) {
            token = lex();
            expr = parseUnaryExpression();
            expr = delegate.createUnaryExpression(token.value, expr);
            if (strict && expr.operator === 'delete' && expr.argument.type === Syntax.Identifier) {
                throwErrorTolerant({}, Messages.StrictDelete);
            }
        } else {
            expr = parsePostfixExpression();
        }

        return delegate.markEndIf(expr);
    }

    function binaryPrecedence(token, allowIn) {
        var prec = 0;

        if (token.type !== Token.Punctuator && token.type !== Token.Keyword) {
            return 0;
        }

        switch (token.value) {
        case '||':
            prec = 1;
            break;

        case '&&':
            prec = 2;
            break;

        case '|':
            prec = 3;
            break;

        case '^':
            prec = 4;
            break;

        case '&':
            prec = 5;
            break;

        case '==':
        case '!=':
        case '===':
        case '!==':
            prec = 6;
            break;

        case '<':
        case '>':
        case '<=':
        case '>=':
        case 'instanceof':
            prec = 7;
            break;

        case 'in':
            prec = allowIn ? 7 : 0;
            break;

        case '<<':
        case '>>':
        case '>>>':
            prec = 8;
            break;

        case '+':
        case '-':
            prec = 9;
            break;

        case '*':
        case '/':
        case '%':
            prec = 11;
            break;

        default:
            break;
        }

        return prec;
    }

    // 11.5 Multiplicative Operators
    // 11.6 Additive Operators
    // 11.7 Bitwise Shift Operators
    // 11.8 Relational Operators
    // 11.9 Equality Operators
    // 11.10 Binary Bitwise Operators
    // 11.11 Binary Logical Operators

    function parseBinaryExpression() {
        var marker, markers, expr, token, prec, previousAllowIn, stack, right, operator, left, i;

        previousAllowIn = state.allowIn;
        state.allowIn = true;

        marker = createLocationMarker();
        left = parseUnaryExpression();

        token = lookahead;
        prec = binaryPrecedence(token, previousAllowIn);
        if (prec === 0) {
            return left;
        }
        token.prec = prec;
        lex();

        markers = [marker, createLocationMarker()];
        right = parseUnaryExpression();

        stack = [left, token, right];

        while ((prec = binaryPrecedence(lookahead, previousAllowIn)) > 0) {

            // Reduce: make a binary expression from the three topmost entries.
            while ((stack.length > 2) && (prec <= stack[stack.length - 2].prec)) {
                right = stack.pop();
                operator = stack.pop().value;
                left = stack.pop();
                expr = delegate.createBinaryExpression(operator, left, right);
                markers.pop();
                marker = markers.pop();
                if (marker) {
                    marker.end();
                    marker.apply(expr);
                }
                stack.push(expr);
                markers.push(marker);
            }

            // Shift.
            token = lex();
            token.prec = prec;
            stack.push(token);
            markers.push(createLocationMarker());
            expr = parseUnaryExpression();
            stack.push(expr);
        }

        state.allowIn = previousAllowIn;

        // Final reduce to clean-up the stack.
        i = stack.length - 1;
        expr = stack[i];
        markers.pop();
        while (i > 1) {
            expr = delegate.createBinaryExpression(stack[i - 1].value, stack[i - 2], expr);
            i -= 2;
            marker = markers.pop();
            if (marker) {
                marker.end();
                marker.apply(expr);
            }
        }

        return expr;
    }


    // 11.12 Conditional Operator

    function parseConditionalExpression() {
        var expr, previousAllowIn, consequent, alternate;

        delegate.markStart();
        expr = parseBinaryExpression();

        if (match('?')) {
            lex();
            previousAllowIn = state.allowIn;
            state.allowIn = true;
            consequent = parseAssignmentExpression();
            state.allowIn = previousAllowIn;
            expect(':');
            alternate = parseAssignmentExpression();

            expr = delegate.markEnd(delegate.createConditionalExpression(expr, consequent, alternate));
        } else {
            delegate.markEnd({});
        }

        return expr;
    }

    // 11.13 Assignment Operators

    function parseAssignmentExpression() {
        var token, left, right, node;

        token = lookahead;
        delegate.markStart();
        node = left = parseConditionalExpression();

        if (matchAssign()) {
            // LeftHandSideExpression
            if (!isLeftHandSide(left)) {
                throwError({}, Messages.InvalidLHSInAssignment);
            }

            // 11.13.1
            if (strict && left.type === Syntax.Identifier && isRestrictedWord(left.name)) {
                throwErrorTolerant(token, Messages.StrictLHSAssignment);
            }

            token = lex();
            right = parseAssignmentExpression();
            node = delegate.createAssignmentExpression(token.value, left, right);
        }

        return delegate.markEndIf(node);
    }

    // 11.14 Comma Operator

    function parseExpression() {
        var expr;

        delegate.markStart();
        expr = parseAssignmentExpression();

        if (match(',')) {
            expr = delegate.createSequenceExpression([ expr ]);

            while (index < length) {
                if (!match(',')) {
                    break;
                }
                lex();
                expr.expressions.push(parseAssignmentExpression());
            }
        }

        return delegate.markEndIf(expr);
    }

    // 12.1 Block

    function parseStatementList() {
        var list = [],
            statement;

        while (index < length) {
            if (match('}')) {
                break;
            }
            statement = parseSourceElement();
            if (typeof statement === 'undefined') {
                break;
            }
            list.push(statement);
        }

        return list;
    }

    function parseBlock() {
        var block;

        skipComment();
        delegate.markStart();
        expect('{');

        block = parseStatementList();

        expect('}');

        return delegate.markEnd(delegate.createBlockStatement(block));
    }

    // 12.2 Variable Statement

    function parseVariableIdentifier() {
        var token;

        skipComment();
        delegate.markStart();
        token = lex();

        if (token.type !== Token.Identifier) {
            throwUnexpected(token);
        }

        return delegate.markEnd(delegate.createIdentifier(token.value));
    }

    function parseVariableDeclaration(kind) {
        var init = null, id;

        skipComment();
        delegate.markStart();
        id = parseVariableIdentifier();

        // 12.2.1
        if (strict && isRestrictedWord(id.name)) {
            throwErrorTolerant({}, Messages.StrictVarName);
        }

        if (kind === 'const') {
            expect('=');
            init = parseAssignmentExpression();
        } else if (match('=')) {
            lex();
            init = parseAssignmentExpression();
        }

        return delegate.markEnd(delegate.createVariableDeclarator(id, init));
    }

    function parseVariableDeclarationList(kind) {
        var list = [];

        do {
            list.push(parseVariableDeclaration(kind));
            if (!match(',')) {
                break;
            }
            lex();
        } while (index < length);

        return list;
    }

    function parseVariableStatement() {
        var declarations;

        expectKeyword('var');

        declarations = parseVariableDeclarationList();

        consumeSemicolon();

        return delegate.createVariableDeclaration(declarations, 'var');
    }

    // kind may be `const` or `let`
    // Both are experimental and not in the specification yet.
    // see http://wiki.ecmascript.org/doku.php?id=harmony:const
    // and http://wiki.ecmascript.org/doku.php?id=harmony:let
    function parseConstLetDeclaration(kind) {
        var declarations;

        skipComment();
        delegate.markStart();

        expectKeyword(kind);

        declarations = parseVariableDeclarationList(kind);

        consumeSemicolon();

        return delegate.markEnd(delegate.createVariableDeclaration(declarations, kind));
    }

    // 12.3 Empty Statement

    function parseEmptyStatement() {
        expect(';');
        return delegate.createEmptyStatement();
    }

    // 12.4 Expression Statement

    function parseExpressionStatement() {
        var expr = parseExpression();
        consumeSemicolon();
        return delegate.createExpressionStatement(expr);
    }

    // 12.5 If statement

    function parseIfStatement() {
        var test, consequent, alternate;

        expectKeyword('if');

        expect('(');

        test = parseExpression();

        expect(')');

        consequent = parseStatement();

        if (matchKeyword('else')) {
            lex();
            alternate = parseStatement();
        } else {
            alternate = null;
        }

        return delegate.createIfStatement(test, consequent, alternate);
    }

    // 12.6 Iteration Statements

    function parseDoWhileStatement() {
        var body, test, oldInIteration;

        expectKeyword('do');

        oldInIteration = state.inIteration;
        state.inIteration = true;

        body = parseStatement();

        state.inIteration = oldInIteration;

        expectKeyword('while');

        expect('(');

        test = parseExpression();

        expect(')');

        if (match(';')) {
            lex();
        }

        return delegate.createDoWhileStatement(body, test);
    }

    function parseWhileStatement() {
        var test, body, oldInIteration;

        expectKeyword('while');

        expect('(');

        test = parseExpression();

        expect(')');

        oldInIteration = state.inIteration;
        state.inIteration = true;

        body = parseStatement();

        state.inIteration = oldInIteration;

        return delegate.createWhileStatement(test, body);
    }

    function parseForVariableDeclaration() {
        var token, declarations;

        delegate.markStart();
        token = lex();
        declarations = parseVariableDeclarationList();

        return delegate.markEnd(delegate.createVariableDeclaration(declarations, token.value));
    }

    function parseForStatement() {
        var init, test, update, left, right, body, oldInIteration;

        init = test = update = null;

        expectKeyword('for');

        expect('(');

        if (match(';')) {
            lex();
        } else {
            if (matchKeyword('var') || matchKeyword('let')) {
                state.allowIn = false;
                init = parseForVariableDeclaration();
                state.allowIn = true;

                if (init.declarations.length === 1 && matchKeyword('in')) {
                    lex();
                    left = init;
                    right = parseExpression();
                    init = null;
                }
            } else {
                state.allowIn = false;
                init = parseExpression();
                state.allowIn = true;

                if (matchKeyword('in')) {
                    // LeftHandSideExpression
                    if (!isLeftHandSide(init)) {
                        throwError({}, Messages.InvalidLHSInForIn);
                    }

                    lex();
                    left = init;
                    right = parseExpression();
                    init = null;
                }
            }

            if (typeof left === 'undefined') {
                expect(';');
            }
        }

        if (typeof left === 'undefined') {

            if (!match(';')) {
                test = parseExpression();
            }
            expect(';');

            if (!match(')')) {
                update = parseExpression();
            }
        }

        expect(')');

        oldInIteration = state.inIteration;
        state.inIteration = true;

        body = parseStatement();

        state.inIteration = oldInIteration;

        return (typeof left === 'undefined') ?
                delegate.createForStatement(init, test, update, body) :
                delegate.createForInStatement(left, right, body);
    }

    // 12.7 The continue statement

    function parseContinueStatement() {
        var label = null, key;

        expectKeyword('continue');

        // Optimize the most common form: 'continue;'.
        if (source.charCodeAt(index) === 59) {
            lex();

            if (!state.inIteration) {
                throwError({}, Messages.IllegalContinue);
            }

            return delegate.createContinueStatement(null);
        }

        if (peekLineTerminator()) {
            if (!state.inIteration) {
                throwError({}, Messages.IllegalContinue);
            }

            return delegate.createContinueStatement(null);
        }

        if (lookahead.type === Token.Identifier) {
            label = parseVariableIdentifier();

            key = '$' + label.name;
            if (!Object.prototype.hasOwnProperty.call(state.labelSet, key)) {
                throwError({}, Messages.UnknownLabel, label.name);
            }
        }

        consumeSemicolon();

        if (label === null && !state.inIteration) {
            throwError({}, Messages.IllegalContinue);
        }

        return delegate.createContinueStatement(label);
    }

    // 12.8 The break statement

    function parseBreakStatement() {
        var label = null, key;

        expectKeyword('break');

        // Catch the very common case first: immediately a semicolon (char #59).
        if (source.charCodeAt(index) === 59) {
            lex();

            if (!(state.inIteration || state.inSwitch)) {
                throwError({}, Messages.IllegalBreak);
            }

            return delegate.createBreakStatement(null);
        }

        if (peekLineTerminator()) {
            if (!(state.inIteration || state.inSwitch)) {
                throwError({}, Messages.IllegalBreak);
            }

            return delegate.createBreakStatement(null);
        }

        if (lookahead.type === Token.Identifier) {
            label = parseVariableIdentifier();

            key = '$' + label.name;
            if (!Object.prototype.hasOwnProperty.call(state.labelSet, key)) {
                throwError({}, Messages.UnknownLabel, label.name);
            }
        }

        consumeSemicolon();

        if (label === null && !(state.inIteration || state.inSwitch)) {
            throwError({}, Messages.IllegalBreak);
        }

        return delegate.createBreakStatement(label);
    }

    // 12.9 The return statement

    function parseReturnStatement() {
        var argument = null;

        expectKeyword('return');

        if (!state.inFunctionBody) {
            throwErrorTolerant({}, Messages.IllegalReturn);
        }

        // 'return' followed by a space and an identifier is very common.
        if (source.charCodeAt(index) === 32) {
            if (isIdentifierStart(source.charCodeAt(index + 1))) {
                argument = parseExpression();
                consumeSemicolon();
                return delegate.createReturnStatement(argument);
            }
        }

        if (peekLineTerminator()) {
            return delegate.createReturnStatement(null);
        }

        if (!match(';')) {
            if (!match('}') && lookahead.type !== Token.EOF) {
                argument = parseExpression();
            }
        }

        consumeSemicolon();

        return delegate.createReturnStatement(argument);
    }

    // 12.10 The with statement

    function parseWithStatement() {
        var object, body;

        if (strict) {
            throwErrorTolerant({}, Messages.StrictModeWith);
        }

        expectKeyword('with');

        expect('(');

        object = parseExpression();

        expect(')');

        body = parseStatement();

        return delegate.createWithStatement(object, body);
    }

    // 12.10 The swith statement

    function parseSwitchCase() {
        var test,
            consequent = [],
            statement;

        skipComment();
        delegate.markStart();
        if (matchKeyword('default')) {
            lex();
            test = null;
        } else {
            expectKeyword('case');
            test = parseExpression();
        }
        expect(':');

        while (index < length) {
            if (match('}') || matchKeyword('default') || matchKeyword('case')) {
                break;
            }
            statement = parseStatement();
            consequent.push(statement);
        }

        return delegate.markEnd(delegate.createSwitchCase(test, consequent));
    }

    function parseSwitchStatement() {
        var discriminant, cases, clause, oldInSwitch, defaultFound;

        expectKeyword('switch');

        expect('(');

        discriminant = parseExpression();

        expect(')');

        expect('{');

        if (match('}')) {
            lex();
            return delegate.createSwitchStatement(discriminant);
        }

        cases = [];

        oldInSwitch = state.inSwitch;
        state.inSwitch = true;
        defaultFound = false;

        while (index < length) {
            if (match('}')) {
                break;
            }
            clause = parseSwitchCase();
            if (clause.test === null) {
                if (defaultFound) {
                    throwError({}, Messages.MultipleDefaultsInSwitch);
                }
                defaultFound = true;
            }
            cases.push(clause);
        }

        state.inSwitch = oldInSwitch;

        expect('}');

        return delegate.createSwitchStatement(discriminant, cases);
    }

    // 12.13 The throw statement

    function parseThrowStatement() {
        var argument;

        expectKeyword('throw');

        if (peekLineTerminator()) {
            throwError({}, Messages.NewlineAfterThrow);
        }

        argument = parseExpression();

        consumeSemicolon();

        return delegate.createThrowStatement(argument);
    }

    // 12.14 The try statement

    function parseCatchClause() {
        var param, body;

        skipComment();
        delegate.markStart();
        expectKeyword('catch');

        expect('(');
        if (match(')')) {
            throwUnexpected(lookahead);
        }

        param = parseVariableIdentifier();
        // 12.14.1
        if (strict && isRestrictedWord(param.name)) {
            throwErrorTolerant({}, Messages.StrictCatchVariable);
        }

        expect(')');
        body = parseBlock();
        return delegate.markEnd(delegate.createCatchClause(param, body));
    }

    function parseTryStatement() {
        var block, handlers = [], finalizer = null;

        expectKeyword('try');

        block = parseBlock();

        if (matchKeyword('catch')) {
            handlers.push(parseCatchClause());
        }

        if (matchKeyword('finally')) {
            lex();
            finalizer = parseBlock();
        }

        if (handlers.length === 0 && !finalizer) {
            throwError({}, Messages.NoCatchOrFinally);
        }

        return delegate.createTryStatement(block, [], handlers, finalizer);
    }

    // 12.15 The debugger statement

    function parseDebuggerStatement() {
        expectKeyword('debugger');

        consumeSemicolon();

        return delegate.createDebuggerStatement();
    }

    // 12 Statements

    function parseStatement() {
        var type = lookahead.type,
            expr,
            labeledBody,
            key;

        if (type === Token.EOF) {
            throwUnexpected(lookahead);
        }

        skipComment();
        delegate.markStart();

        if (type === Token.Punctuator) {
            switch (lookahead.value) {
            case ';':
                return delegate.markEnd(parseEmptyStatement());
            case '{':
                return delegate.markEnd(parseBlock());
            case '(':
                return delegate.markEnd(parseExpressionStatement());
            default:
                break;
            }
        }

        if (type === Token.Keyword) {
            switch (lookahead.value) {
            case 'break':
                return delegate.markEnd(parseBreakStatement());
            case 'continue':
                return delegate.markEnd(parseContinueStatement());
            case 'debugger':
                return delegate.markEnd(parseDebuggerStatement());
            case 'do':
                return delegate.markEnd(parseDoWhileStatement());
            case 'for':
                return delegate.markEnd(parseForStatement());
            case 'function':
                return delegate.markEnd(parseFunctionDeclaration());
            case 'if':
                return delegate.markEnd(parseIfStatement());
            case 'return':
                return delegate.markEnd(parseReturnStatement());
            case 'switch':
                return delegate.markEnd(parseSwitchStatement());
            case 'throw':
                return delegate.markEnd(parseThrowStatement());
            case 'try':
                return delegate.markEnd(parseTryStatement());
            case 'var':
                return delegate.markEnd(parseVariableStatement());
            case 'while':
                return delegate.markEnd(parseWhileStatement());
            case 'with':
                return delegate.markEnd(parseWithStatement());
            default:
                break;
            }
        }

        expr = parseExpression();

        // 12.12 Labelled Statements
        if ((expr.type === Syntax.Identifier) && match(':')) {
            lex();

            key = '$' + expr.name;
            if (Object.prototype.hasOwnProperty.call(state.labelSet, key)) {
                throwError({}, Messages.Redeclaration, 'Label', expr.name);
            }

            state.labelSet[key] = true;
            labeledBody = parseStatement();
            delete state.labelSet[key];
            return delegate.markEnd(delegate.createLabeledStatement(expr, labeledBody));
        }

        consumeSemicolon();

        return delegate.markEnd(delegate.createExpressionStatement(expr));
    }

    // 13 Function Definition

    function parseFunctionSourceElements() {
        var sourceElement, sourceElements = [], token, directive, firstRestricted,
            oldLabelSet, oldInIteration, oldInSwitch, oldInFunctionBody;

        skipComment();
        delegate.markStart();
        expect('{');

        while (index < length) {
            if (lookahead.type !== Token.StringLiteral) {
                break;
            }
            token = lookahead;

            sourceElement = parseSourceElement();
            sourceElements.push(sourceElement);
            if (sourceElement.expression.type !== Syntax.Literal) {
                // this is not directive
                break;
            }
            directive = source.slice(token.range[0] + 1, token.range[1] - 1);
            if (directive === 'use strict') {
                strict = true;
                if (firstRestricted) {
                    throwErrorTolerant(firstRestricted, Messages.StrictOctalLiteral);
                }
            } else {
                if (!firstRestricted && token.octal) {
                    firstRestricted = token;
                }
            }
        }

        oldLabelSet = state.labelSet;
        oldInIteration = state.inIteration;
        oldInSwitch = state.inSwitch;
        oldInFunctionBody = state.inFunctionBody;

        state.labelSet = {};
        state.inIteration = false;
        state.inSwitch = false;
        state.inFunctionBody = true;

        while (index < length) {
            if (match('}')) {
                break;
            }
            sourceElement = parseSourceElement();
            if (typeof sourceElement === 'undefined') {
                break;
            }
            sourceElements.push(sourceElement);
        }

        expect('}');

        state.labelSet = oldLabelSet;
        state.inIteration = oldInIteration;
        state.inSwitch = oldInSwitch;
        state.inFunctionBody = oldInFunctionBody;

        return delegate.markEnd(delegate.createBlockStatement(sourceElements));
    }

    function parseParams(firstRestricted) {
        var param, params = [], token, stricted, paramSet, key, message;
        expect('(');

        if (!match(')')) {
            paramSet = {};
            while (index < length) {
                token = lookahead;
                param = parseVariableIdentifier();
                key = '$' + token.value;
                if (strict) {
                    if (isRestrictedWord(token.value)) {
                        stricted = token;
                        message = Messages.StrictParamName;
                    }
                    if (Object.prototype.hasOwnProperty.call(paramSet, key)) {
                        stricted = token;
                        message = Messages.StrictParamDupe;
                    }
                } else if (!firstRestricted) {
                    if (isRestrictedWord(token.value)) {
                        firstRestricted = token;
                        message = Messages.StrictParamName;
                    } else if (isStrictModeReservedWord(token.value)) {
                        firstRestricted = token;
                        message = Messages.StrictReservedWord;
                    } else if (Object.prototype.hasOwnProperty.call(paramSet, key)) {
                        firstRestricted = token;
                        message = Messages.StrictParamDupe;
                    }
                }
                params.push(param);
                paramSet[key] = true;
                if (match(')')) {
                    break;
                }
                expect(',');
            }
        }

        expect(')');

        return {
            params: params,
            stricted: stricted,
            firstRestricted: firstRestricted,
            message: message
        };
    }

    function parseFunctionDeclaration() {
        var id, params = [], body, token, stricted, tmp, firstRestricted, message, previousStrict;

        skipComment();
        delegate.markStart();

        expectKeyword('function');
        token = lookahead;
        id = parseVariableIdentifier();
        if (strict) {
            if (isRestrictedWord(token.value)) {
                throwErrorTolerant(token, Messages.StrictFunctionName);
            }
        } else {
            if (isRestrictedWord(token.value)) {
                firstRestricted = token;
                message = Messages.StrictFunctionName;
            } else if (isStrictModeReservedWord(token.value)) {
                firstRestricted = token;
                message = Messages.StrictReservedWord;
            }
        }

        tmp = parseParams(firstRestricted);
        params = tmp.params;
        stricted = tmp.stricted;
        firstRestricted = tmp.firstRestricted;
        if (tmp.message) {
            message = tmp.message;
        }

        previousStrict = strict;
        body = parseFunctionSourceElements();
        if (strict && firstRestricted) {
            throwError(firstRestricted, message);
        }
        if (strict && stricted) {
            throwErrorTolerant(stricted, message);
        }
        strict = previousStrict;

        return delegate.markEnd(delegate.createFunctionDeclaration(id, params, [], body));
    }

    function parseFunctionExpression() {
        var token, id = null, stricted, firstRestricted, message, tmp, params = [], body, previousStrict;

        delegate.markStart();
        expectKeyword('function');

        if (!match('(')) {
            token = lookahead;
            id = parseVariableIdentifier();
            if (strict) {
                if (isRestrictedWord(token.value)) {
                    throwErrorTolerant(token, Messages.StrictFunctionName);
                }
            } else {
                if (isRestrictedWord(token.value)) {
                    firstRestricted = token;
                    message = Messages.StrictFunctionName;
                } else if (isStrictModeReservedWord(token.value)) {
                    firstRestricted = token;
                    message = Messages.StrictReservedWord;
                }
            }
        }

        tmp = parseParams(firstRestricted);
        params = tmp.params;
        stricted = tmp.stricted;
        firstRestricted = tmp.firstRestricted;
        if (tmp.message) {
            message = tmp.message;
        }

        previousStrict = strict;
        body = parseFunctionSourceElements();
        if (strict && firstRestricted) {
            throwError(firstRestricted, message);
        }
        if (strict && stricted) {
            throwErrorTolerant(stricted, message);
        }
        strict = previousStrict;

        return delegate.markEnd(delegate.createFunctionExpression(id, params, [], body));
    }

    // 14 Program

    function parseSourceElement() {
        if (lookahead.type === Token.Keyword) {
            switch (lookahead.value) {
            case 'const':
            case 'let':
                return parseConstLetDeclaration(lookahead.value);
            case 'function':
                return parseFunctionDeclaration();
            default:
                return parseStatement();
            }
        }

        if (lookahead.type !== Token.EOF) {
            return parseStatement();
        }
    }

    function parseSourceElements() {
        var sourceElement, sourceElements = [], token, directive, firstRestricted;

        while (index < length) {
            token = lookahead;
            if (token.type !== Token.StringLiteral) {
                break;
            }

            sourceElement = parseSourceElement();
            sourceElements.push(sourceElement);
            if (sourceElement.expression.type !== Syntax.Literal) {
                // this is not directive
                break;
            }
            directive = source.slice(token.range[0] + 1, token.range[1] - 1);
            if (directive === 'use strict') {
                strict = true;
                if (firstRestricted) {
                    throwErrorTolerant(firstRestricted, Messages.StrictOctalLiteral);
                }
            } else {
                if (!firstRestricted && token.octal) {
                    firstRestricted = token;
                }
            }
        }

        while (index < length) {
            sourceElement = parseSourceElement();
            if (typeof sourceElement === 'undefined') {
                break;
            }
            sourceElements.push(sourceElement);
        }
        return sourceElements;
    }

    function parseProgram() {
        var body;

        skipComment();
        delegate.markStart();
        strict = false;
        peek();
        body = parseSourceElements();
        return delegate.markEnd(delegate.createProgram(body));
    }

    function filterTokenLocation() {
        var i, entry, token, tokens = [];

        for (i = 0; i < extra.tokens.length; ++i) {
            entry = extra.tokens[i];
            token = {
                type: entry.type,
                value: entry.value
            };
            if (extra.range) {
                token.range = entry.range;
            }
            if (extra.loc) {
                token.loc = entry.loc;
            }
            tokens.push(token);
        }

        extra.tokens = tokens;
    }

    function LocationMarker() {
        this.marker = [index, lineNumber, index - lineStart, 0, 0, 0];
    }

    LocationMarker.prototype = {
        constructor: LocationMarker,

        end: function () {
            this.marker[3] = index;
            this.marker[4] = lineNumber;
            this.marker[5] = index - lineStart;
        },

        apply: function (node) {
            if (extra.range) {
                node.range = [this.marker[0], this.marker[3]];
            }
            if (extra.loc) {
                node.loc = {
                    start: {
                        line: this.marker[1],
                        column: this.marker[2]
                    },
                    end: {
                        line: this.marker[4],
                        column: this.marker[5]
                    }
                };
            }
            node = delegate.postProcess(node);
        }
    };

    function createLocationMarker() {
        if (!extra.loc && !extra.range) {
            return null;
        }

        skipComment();

        return new LocationMarker();
    }

    function tokenize(code, options) {
        var toString,
            token,
            tokens;

        toString = String;
        if (typeof code !== 'string' && !(code instanceof String)) {
            code = toString(code);
        }

        delegate = SyntaxTreeDelegate;
        source = code;
        index = 0;
        lineNumber = (source.length > 0) ? 1 : 0;
        lineStart = 0;
        length = source.length;
        lookahead = null;
        state = {
            allowIn: true,
            labelSet: {},
            inFunctionBody: false,
            inIteration: false,
            inSwitch: false,
            lastCommentStart: -1,
        };

        extra = {};

        // Options matching.
        options = options || {};

        // Of course we collect tokens here.
        options.tokens = true;
        extra.tokens = [];
        extra.tokenize = true;
        // The following two fields are necessary to compute the Regex tokens.
        extra.openParenToken = -1;
        extra.openCurlyToken = -1;

        extra.range = (typeof options.range === 'boolean') && options.range;
        extra.loc = (typeof options.loc === 'boolean') && options.loc;

        if (typeof options.comment === 'boolean' && options.comment) {
            extra.comments = [];
        }
        if (typeof options.tolerant === 'boolean' && options.tolerant) {
            extra.errors = [];
        }

        if (length > 0) {
            if (typeof source[0] === 'undefined') {
                // Try first to convert to a string. This is good as fast path
                // for old IE which understands string indexing for string
                // literals only and not for string object.
                if (code instanceof String) {
                    source = code.valueOf();
                }
            }
        }

        try {
            peek();
            if (lookahead.type === Token.EOF) {
                return extra.tokens;
            }

            token = lex();
            while (lookahead.type !== Token.EOF) {
                try {
                    token = lex();
                } catch (lexError) {
                    token = lookahead;
                    if (extra.errors) {
                        extra.errors.push(lexError);
                        // We have to break on the first error
                        // to avoid infinite loops.
                        break;
                    } else {
                        throw lexError;
                    }
                }
            }

            filterTokenLocation();
            tokens = extra.tokens;
            if (typeof extra.comments !== 'undefined') {
                tokens.comments = extra.comments;
            }
            if (typeof extra.errors !== 'undefined') {
                tokens.errors = extra.errors;
            }
        } catch (e) {
            throw e;
        } finally {
            extra = {};
        }
        return tokens;
    }

    function parse(code, options) {
        var program, toString;

        toString = String;
        if (typeof code !== 'string' && !(code instanceof String)) {
            code = toString(code);
        }

        delegate = SyntaxTreeDelegate;
        source = code;
        index = 0;
        lineNumber = (source.length > 0) ? 1 : 0;
        lineStart = 0;
        length = source.length;
        lookahead = null;
        state = {
            allowIn: true,
            labelSet: {},
            inFunctionBody: false,
            inIteration: false,
            inSwitch: false,
            lastCommentStart: -1,
            markerStack: []
        };

        extra = {};
        if (typeof options !== 'undefined') {
            extra.range = (typeof options.range === 'boolean') && options.range;
            extra.loc = (typeof options.loc === 'boolean') && options.loc;

            if (extra.loc && options.source !== null && options.source !== undefined) {
                extra.source = toString(options.source);
            }

            if (typeof options.tokens === 'boolean' && options.tokens) {
                extra.tokens = [];
            }
            if (typeof options.comment === 'boolean' && options.comment) {
                extra.comments = [];
            }
            if (typeof options.tolerant === 'boolean' && options.tolerant) {
                extra.errors = [];
            }
        }

        if (length > 0) {
            if (typeof source[0] === 'undefined') {
                // Try first to convert to a string. This is good as fast path
                // for old IE which understands string indexing for string
                // literals only and not for string object.
                if (code instanceof String) {
                    source = code.valueOf();
                }
            }
        }

        try {
            program = parseProgram();
            if (typeof extra.comments !== 'undefined') {
                program.comments = extra.comments;
            }
            if (typeof extra.tokens !== 'undefined') {
                filterTokenLocation();
                program.tokens = extra.tokens;
            }
            if (typeof extra.errors !== 'undefined') {
                program.errors = extra.errors;
            }
        } catch (e) {
            throw e;
        } finally {
            extra = {};
        }

        return program;
    }

    // Sync with package.json and component.json.
    exports.version = '1.1.0-dev';

    exports.tokenize = tokenize;

    exports.parse = parse;

    // Deep copy.
    exports.Syntax = (function () {
        var name, types = {};

        if (typeof Object.create === 'function') {
            types = Object.create(null);
        }

        for (name in Syntax) {
            if (Syntax.hasOwnProperty(name)) {
                types[name] = Syntax[name];
            }
        }

        if (typeof Object.freeze === 'function') {
            Object.freeze(types);
        }

        return types;
    }());

}));
/* vim: set sw=4 ts=4 et tw=80 : */
/*
 * StructuredJS provides an API for static analysis of code based on an abstract
 * syntax tree generated by Esprima (compliant with the Mozilla Parser
 * API at https://developer.mozilla.org/en-US/docs/SpiderMonkey/Parser_API).
 *
 * Dependencies: esprima.js, underscore.js
 */
(function(global) {
    /* Detect npm versus browser usage */
    var exports;
    var esprima;
    var _;

    // Cache all the structure tests
    var structureCache = {};

    // Cache the most recently-parsed code and tree
    var cachedCode;
    var cachedCodeTree;

    if (typeof module !== "undefined" && module.exports) {
        exports = module.exports = {};
        esprima = require("esprima");
        _ = require("underscore");
    } else {
        exports = this.Structured = {};
        esprima = global.esprima;
        _ = global._;
    }

    if (!esprima || !_) {
        throw "Error: Both Esprima and UnderscoreJS are required dependencies.";
    }

    /*
     * Introspects a callback to determine it's parameters and then
     * produces a constraint that contains the appropriate variables and callbacks.
     *
     * This allows a much terser definition of callback function where you don't have to
     * explicitly state the parameters in a separate list
     */
    function makeConstraint(callback) {
        var paramText = /^function [^\(]*\(([^\)]*)\)/.exec(callback)[1];
        var params = paramText.match(/[$_a-zA-z0-9]+/g);

        for (var key in params) {
            if (params[key][0] !== "$") {
                console.warn("Invalid parameter in constraint (should begin with a '$'): ", params[key]);
                return null;
            }
        }
        return {
            variables: params,
            fn: callback
        };
    }

    /*
     * Returns true if the code (a string) matches the structure in rawStructure
     * Throws an exception if code is not parseable.
     *
     * Example:
     *     var code = "if (y > 30 && x > 13) {x += y;}";
     *     var rawStructure = function structure() { if (_) {} };
     *     match(code, rawStructure);
     *
     * options.varCallbacks is an object that maps user variable strings like
     *  "$myVar", "$a, $b, $c" etc to callbacks. These callbacks receive the
     *  potential Esprima structure values assigned to each of the user
     *  variables specified in the string, and can accept/reject that value
     *  by returning true/false. The callbacks can also specify a failure
     *  message instead by returning an object of the form
     *  {failure: "Your failure message"}, in which case the message will be
     *  returned as the property "failure" on the varCallbacks object if
     *  there is no valid match. A valid matching requires that every
     *  varCallback return true.
     *
     * Advanced Example:
     *   var varCallbacks = [
     *     function($foo) {
     *         return $foo.value > 92;
     *     },
     *     function($foo, $bar, $baz) {
     *         if ($foo.value > $bar.value) {
     *            return {failure: "Check the relationship between values."};
     *         }
     *         return $baz.value !== 48;
     *     }
     *   ];
     *   var code = "var a = 400; var b = 120; var c = 500; var d = 49;";
     *   var rawStructure = function structure() {
     *       var _ = $foo; var _ = $bar; var _ = $baz;
     *   };
     *   match(code, rawStructure, {varCallbacks: varCallbacks});
     */
    var originalVarCallbacks;
    function match(code, rawStructure, options) {
        options = options || {};
        // Many possible inputs formats are accepted for varCallbacks
        // Constraints can be:
        // 1. a function (from which we will extract the variables)  
        // 2. an objects (which already has separate .fn and .variables properties)
        //
        // It will also accept a list of either of the above (or a mix of the two).
        // Finally it can accept an object for which the keys are the variables and 
        // the values are the callbacks (This option is mainly for historical reasons)
        var varCallbacks = options.varCallbacks || [];
        // We need to keep a hold of the original varCallbacks object because 
        // When structured first came out it returned the failure message by 
        // changing the .failure property on the varCallbacks object and some uses rely on that.
        // We hope to get rid of this someday.
        // TODO: Change over the code so to have a better API
        originalVarCallbacks = varCallbacks;
        if (varCallbacks instanceof Function || (varCallbacks.fn && varCallbacks.variables)) {
            varCallbacks = [varCallbacks];
        }
        if (varCallbacks instanceof Array) {
            for (var key in varCallbacks) {
                if (varCallbacks[key] instanceof Function) {
                    varCallbacks[key] = makeConstraint(varCallbacks[key]);
                }
            }
        } else {
            var realCallbacks = [];
            for (var vars in varCallbacks) {
                if (varCallbacks.hasOwnProperty(vars) && vars !== "failure") {
                    realCallbacks.push({
                        variables: vars.match(/[$_a-zA-z0-9]+/g),
                        fn: varCallbacks[vars]
                    });
                }
            }
            varCallbacks = realCallbacks;
        }
        var wildcardVars = {
            order: [],
            skipData: {},
            values: {}
        };
        // Note: After the parse, structure contains object references into
        // wildcardVars[values] that must be maintained. So, beware of
        // JSON.parse(JSON.stringify), etc. as the tree is no longer static.
        var structure = parseStructureWithVars(rawStructure, wildcardVars);

        // Cache the parsed code tree, or pull from cache if it exists
        var codeTree = (cachedCode === code ?
            cachedCodeTree :
            typeof code === "object" ?
            deepClone(code) :
            esprima.parse(code));

        cachedCode = code;
        cachedCodeTree = codeTree;

        foldConstants(codeTree);
        var toFind = structure.body || structure;
        var peers = [];
        if (_.isArray(structure.body)) {
            toFind = structure.body[0];
            peers = structure.body.slice(1);
        }
        var result;
        var matchResult = {
            _: [],
            vars: {}
        };
        if (wildcardVars.order.length === 0 || options.single) {
            // With no vars to match, our normal greedy approach works great.
            result = checkMatchTree(codeTree, toFind, peers, wildcardVars, matchResult, options);
        } else {
            // If there are variables to match, we must do a potentially
            // exhaustive search across the possible ways to match the vars.
            result = anyPossible(0, wildcardVars, varCallbacks, matchResult, options);
        }
        return result;

        /*
         * Checks whether any possible valid variable assignment for this i
         *  results in a valid match.
         *
         * We orchestrate this check by building skipData, which specifies
         *  for each variable how many possible matches it should skip before
         *  it guesses a match. The iteration over the tree is the same
         *  every time -- if the first guess fails, the next run will skip the
         *  first guess and instead take the second appearance, and so on.
         *
         * When there are multiple variables, changing an earlier (smaller i)
         *  variable guess means that we must redo the guessing for the later
         *  variables (larger i).
         *
         * Returning false involves exhausting all possibilities. In the worst
         *  case, this will mean exponentially many possibilities -- variables
         *  are expensive for all but small tests.
         *
         * wildcardVars = wVars:
         *     .values[varName] contains the guessed node value of each
         *     variable, or the empty object if none.
         *     .skipData[varName] contains the number of potential matches of
         *          this var to skip before choosing a guess to assign to values
         *     .leftToSkip[varName] stores the number of skips left to do
         *         (used during the match algorithm)
         *     .order[i] is the name of the ith occurring variable.
         */
        function anyPossible(i, wVars, varCallbacks, matchResults, options) {
            var order = wVars.order; // Just for ease-of-notation.
            wVars.skipData[order[i]] = 0;
            do {
                // Reset the skip # for all later variables.
                for (var rest = i + 1; rest < order.length; rest += 1) {
                    wVars.skipData[order[rest]] = 0;
                }
                // Check for a match only if we have reached the last var in
                // order (and so set skipData for all vars). Otherwise,
                // recurse to check all possible values of the next var.
                if (i === order.length - 1) {
                    // Reset the wildcard vars' guesses. Delete the properties
                    // rather than setting to {} in order to maintain shared
                    // object references in the structure tree (toFind, peers)
                    _.each(wVars.values, function(value, key) {
                        _.each(wVars.values[key], function(v, k) {
                            delete wVars.values[key][k];
                        });
                    });
                    wVars.leftToSkip = _.extend({}, wVars.skipData);
                    // Use a copy of peers because peers is destructively
                    // modified in checkMatchTree (via checkNodeArray).
                    if (checkMatchTree(codeTree, toFind, peers.slice(), wVars, matchResults, options) &&
                        checkUserVarCallbacks(wVars, varCallbacks)) {
                        return matchResults;
                    }
                } else if (anyPossible(i + 1, wVars, varCallbacks, matchResults, options)) {
                    return matchResults;
                }
                // This guess didn't work out -- skip it and try the next.
                wVars.skipData[order[i]] += 1;
                // The termination condition is when we have run out of values
                // to skip and values is no longer defined for this var after
                // the match algorithm. That means that there is no valid
                // assignment for this and later vars given the assignments to
                // previous vars (set by skipData).
            } while (!_.isEmpty(wVars.values[order[i]]));
            return false;
        }
    }

    /*
     * Checks the user-defined variable callbacks and returns a boolean for
     *   whether or not the wVars assignment of the wildcard variables results
     *   in every varCallback returning true as required.
     *
     * If any varCallback returns false, this function also returns false.
     *
     * Format of varCallbacks: An object containing:
     *     keys of the form: "$someVar" or "$foo, $bar, $baz" to mimic an
     *        array (as JS keys must be strings).
     *     values containing function callbacks. These callbacks must return
     *        true/false. They may alternately return an object of the form
     *        {failure: "The failure message."}. If the callback returns the
     *        failure object, then the relevant failure message will be returned
     *        via varCallbacks.failure.
     *        These callbacks are passed a parameter list corresponding to
     *         the Esprima parse structures assigned to the variables in
     *         the key (see example).
     *
     * Example varCallbacks object:
     *    {
     *     "$foo": function(fooObj) {
     *         return fooObj.value > 92;
     *     },
     *     "$foo, $bar, $baz": function(fooObj, barObj, bazObj) {
     *         if (fooObj.value > barObj.value) {
     *            return {failure: "Check the relationship between values."}
     *         }
     *         return bazObj !== 48;
     *     }
     *   }
     */
    function checkUserVarCallbacks(wVars, varCallbacks) {
        // Clear old failure message if needed
        delete originalVarCallbacks.failure;
        for (var key in varCallbacks) {
            // Property strings may be "$foo, $bar, $baz" to mimic arrays.
            var varNames = varCallbacks[key].variables;
            var varValues = _.map(varNames, function(varName) {
                varName = stringLeftTrim(varName); // Trim whitespace
                // If the var name is in the structure, then it will always
                // exist in wVars.values after we find a match prior to
                // checking the var callbacks. So, if a variable name is not
                // defined here, it is because that var name does not exist in
                // the user-defined structure.
                if (!_.has(wVars.values, varName)) {
                    console.error("Callback var " + varName + " doesn't exist");
                    return undefined;
                }
                // Convert each var name to the Esprima structure it has
                // been assigned in the parse. Make a deep copy.
                return deepClone(wVars.values[varName]);
            });
            // Call the user-defined callback, passing in the var values as
            // parameters in the order that the vars were defined in the
            // property string.
            var result = varCallbacks[key].fn.apply(null, varValues);
            if (!result || _.has(result, "failure")) {
                // Set the failure message if the user callback provides one.
                if (_.has(result, "failure")) {
                    originalVarCallbacks.failure = result.failure;
                }
                return false;
            }
        }
        return true;

        /* Trim is only a string method in IE9+, so use a regex if needed. */
        function stringLeftTrim(str) {
            if (String.prototype.trim) {
                return str.trim();
            }
            return str.replace(/^\s+|\s+$/g, "");
        }
    }

    function parseStructure(structure) {
        if (typeof structure === "object") {
            return deepClone(structure);
        }

        if (structureCache[structure]) {
            return JSON.parse(structureCache[structure]);
        }

        // Wrapped in parentheses so function() {} becomes valid Javascript.
        var fullTree = esprima.parse("(" + structure + ")");

        if (fullTree.body[0].expression.type !== "FunctionExpression" ||
            !fullTree.body[0].expression.body) {
            throw "Poorly formatted structure code";
        }

        var tree = fullTree.body[0].expression.body;
        structureCache[structure] = JSON.stringify(tree);
        return tree;
    }

    /*
     * Returns a tree parsed out of the structure. The returned tree is an
     *    abstract syntax tree with wildcard properties set to undefined.
     *
     * structure is a specification looking something like:
     *        function structure() {if (_) { var _ = 3; }}
     *    where _ denotes a blank (anything can go there),
     *    and code can go before or after any statement (only the nesting and
     *        relative ordering matter).
     */
    function parseStructureWithVars(structure, wVars) {
        var tree = parseStructure(structure);
        foldConstants(tree);
        simplifyTree(tree, wVars);
        return tree;
    }

    /*
     * Constant folds the syntax tree
     */
    function foldConstants(tree) {
        for (var key in tree) {
            if (!tree.hasOwnProperty(key)) {
                continue; // Inherited property
            }

            var ast = tree[key];
            if (_.isObject(ast)) {
                foldConstants(ast);

                /*
                 * Currently, we only fold + and - applied to a number literal.
                 * This is easy to extend, but it means we lose the ability to match
                 * potentially useful expressions like 5 + 5 with a pattern like _ + _.
                 */
                if (ast.type == esprima.Syntax.UnaryExpression) {
                    var argument = ast.argument;
                    if (argument.type === esprima.Syntax.Literal &&
                        _.isNumber(argument.value)) {
                        if (ast.operator === "-") {
                            argument.value = -argument.value;
                            tree[key] = argument;
                        } else if (ast.operator === "+") {
                            argument.value = +argument.value;
                            tree[key] = argument;
                        }
                    }
                }
            }
        }
    }

    /*
     * Recursively traverses the tree and sets _ properties to undefined
     * and empty bodies to null.
     *
     *  Wildcards are explicitly set to undefined -- these undefined properties
     *  must exist and be non-null in order for code to match the structure.
     *
     *  Wildcard variables are set up such that the first occurrence of the
     *   variable in the structure tree is set to {wildcardVar: varName},
     *   and all later occurrences just refer to wVars.values[varName],
     *   which is an object assigned during the matching algorithm to have
     *   properties identical to our guess for the node matching the variable.
     *   (maintaining the reference). In effect, these later accesses
     *   to tree[key] mimic tree[key] simply being set to the variable value.
     *
     *  Empty statements are deleted from the tree -- they need not be matched.
     *
     *  If the subtree is an array, we just iterate over the array using
     *    for (var key in tree)
     *
     */
    function simplifyTree(tree, wVars) {
        for (var key in tree) {
            if (!tree.hasOwnProperty(key)) {
                continue; // Inherited property
            }
            if (_.isObject(tree[key])) {
                if (isWildcard(tree[key])) {
                    tree[key] = undefined;
                } else if (isWildcardVar(tree[key])) {
                    var varName = tree[key].name;
                    if (!wVars.values[varName]) {
                        // Perform setup for the first occurrence.
                        wVars.values[varName] = {}; // Filled in later.
                        tree[key] = {
                            wildcardVar: varName
                        };
                        wVars.order.push(varName);
                        wVars.skipData[varName] = 0;
                    } else {
                        tree[key] = wVars.values[varName]; // Reference.
                    }
                } else if (tree[key].type === esprima.Syntax.EmptyStatement) {
                    // Arrays are objects, but delete tree[key] does not
                    //  update the array length property -- so, use splice.
                    _.isArray(tree) ? tree.splice(key, 1) : delete tree[key];
                } else {
                    simplifyTree(tree[key], wVars);
                }
            }
        }
    }

    /*
     * Returns whether the structure node is intended as a wildcard node, which
     * can be filled in by anything in others' code.
     */
    function isWildcard(node) {
        return node.name && node.name === "_";
    }

    /* Returns whether the structure node is intended as a wildcard variable. */
    function isWildcardVar(node) {
        return (node.name && _.isString(node.name) && node.name.length >= 2 &&
            node.name[0] === "$");
    }

    /*
     *
     */
    function isGlob(node) {
        return node && node.name &&
            ((node.name === "glob_" && "_") ||
                (node.name.indexOf("glob$") === 0 && node.name.slice(5))) ||
            node && node.expression && isGlob(node.expression);
    }

    /*
     * Returns true if currTree matches the wildcard structure toFind.
     *
     * currTree: The syntax node tracking our current place in the user's code.
     * toFind: The syntax node from the structure that we wish to find.
     * peersToFind: The remaining ordered syntax nodes that we must find after
     *     toFind (and on the same level as toFind).
     */
    function checkMatchTree(currTree, toFind, peersToFind, wVars, matchResults, options) {
        if (_.isArray(toFind)) {
            console.error("toFind should never be an array.");
            console.error(toFind);
        }
        if (exactMatchNode(currTree, toFind, peersToFind, wVars, matchResults, options)) {
            return matchResults;
        }
        // Don't recurse if we're just checking a single node.
        if (options.single) {
            return false;
        }
        // Check children.
        for (var key in currTree) {
            if (!currTree.hasOwnProperty(key) || !_.isObject(currTree[key])) {
                continue; // Skip inherited properties
            }
            // Recursively check for matches
            if ((_.isArray(currTree[key]) &&
                    checkNodeArray(currTree[key], toFind, peersToFind, wVars, matchResults, options)) ||
                (!_.isArray(currTree[key]) &&
                    checkMatchTree(currTree[key], toFind, peersToFind, wVars, matchResults, options))) {
                return matchResults;
            }
        }
        return false;
    }

    /*
     * Returns true if this level of nodeArr matches the node in
     * toFind, and also matches all the nodes in peersToFind in order.
     */
    function checkNodeArray(nodeArr, toFind, peersToFind, wVars, matchResults, options) {
        var curGlob;

        for (var i = 0; i < nodeArr.length; i += 1) {
            if (isGlob(toFind)) {
                if (!curGlob) {
                    curGlob = [];
                    var globName = isGlob(toFind);
                    if (globName === "_") {
                        matchResults._.push(curGlob);
                    } else {
                        matchResults.vars[globName] = curGlob;
                    }
                }
                curGlob.push(nodeArr[i]);
            } else if (checkMatchTree(nodeArr[i], toFind, peersToFind, wVars, matchResults, options)) {
                if (!peersToFind || peersToFind.length === 0) {
                    return matchResults;
                    // Found everything needed on this level.
                } else {
                    // We matched this node, but we still have more nodes on
                    // this level we need to match on subsequent iterations
                    toFind = peersToFind.shift(); // Destructive.
                }
            }
        }

        if (curGlob) {
            return matchResults;
        } else if (isGlob(toFind)) {
            var globName = isGlob(toFind);
            if (globName === "_") {
                matchResults._.push([]);
            } else {
                matchResults.vars[globName] = [];
            }
            return matchResults;
        }

        return false;
    }


    /*
     * This discards all wildcard vars that were part of a failed match
     * this provides an important speedup by stopping anyPossible from having to increment
     * every match on a doomed set of arguments.
     * If the any argument set fails no amount of incrementing can save it.
     */
    function discardWVarsOnFailureDecorator(callback) {
        return function(currTree, toFind, peersToFind, wVars, matchResults, options) {
            var lastWVar;
            for (lastWVar=0; lastWVar<wVars.order.length; lastWVar++) {
                var candidate = wVars.values[wVars.order[lastWVar]];
                if (_.isEmpty(candidate)) {
                    break;
                }
            }
            var result = callback(currTree, toFind, peersToFind, wVars, matchResults, options);
            if (!result) {
                for (; lastWVar<wVars.order.length; lastWVar++) {
                    var candidate = wVars.values[wVars.order[lastWVar]];
                    if (!_.isEmpty(candidate)) {
                        // Reset the wildcard vars' guesses. Delete the properties
                        // rather than setting to {} in order to maintain shared
                        // object references in the structure tree (toFind, peers)
                        _.each(candidate, function(v, k) {
                            delete candidate[k];
                        });
                    } else {
                        break;
                    }
                }
                wVars._last = lastWVar;
            }
            return result;
        };
    }

    /*
     * Returns true if and only if all arguments from the pattern match the corresponding
     * argument in the test code
     */
    var checkArgumentsArray = discardWVarsOnFailureDecorator(function(nodeArr, toFind, peersToFind, wVars, matchResults, options) {
        var curGlob;

        for (var i = 0; i < nodeArr.length; i += 1) {
            if (isGlob(toFind)) {
                if (!curGlob) {
                    curGlob = [];
                    var globName = isGlob(toFind);
                    if (globName === "_") {
                        matchResults._.push(curGlob);
                    } else {
                        matchResults.vars[globName] = curGlob;
                    }
                }
                curGlob.push(nodeArr[i]);
            } else {
                if (checkMatchTree(nodeArr[i], toFind, peersToFind, wVars, matchResults, options)) {
                    if (!peersToFind || peersToFind.length === 0) {
                        return matchResults;
                    } else {
                        toFind = peersToFind.shift();
                    }
                } else {
                    return false;
                }
            }
        }

        if (curGlob) {
            return matchResults;
        } else if (isGlob(toFind)) {
            var globName = isGlob(toFind);
            if (globName === "_") {
                matchResults._.push([]);
            } else {
                matchResults.vars[globName] = [];
            }
            return matchResults;
        }

        return false;
    });

    /*
     * Checks whether the currNode exactly matches the node toFind.
     *
     * A match is exact if for every non-null property on toFind, that
     * property exists on currNode and:
     *     0. If the property is undefined on toFind, it must exist on currNode.
     *     1. Otherwise, the values have the same type (ie, they match).
     *     2. If the values are numbers or strings, they match.
     *     3. If the values are arrays, checkNodeArray on the arrays returns true.
     *     4. If the values are objects, checkMatchTree on those objects
     *         returns true (the objects recursively match to the extent we
     *         care about, though they may not match exactly).
     */
    function exactMatchNode(currNode, toFind, peersToFind, wVars, matchResults, options) {
        var rootToSet;

        if (!matchResults.root && currNode.type !== "Program") {
            rootToSet = currNode;
        }

        for (var key in toFind) {
            // Ignore inherited properties; also, null properties can be
            // anything and do not have to exist.
            if (!toFind.hasOwnProperty(key) || toFind[key] === null) {
                continue;
            }
            var subFind = toFind[key];
            var subCurr = currNode[key];
            // Undefined properties can be anything, but they must exist.
            if (subFind === undefined) {
                if (subCurr === null || subCurr === undefined) {
                    return false;
                } else {
                    matchResults._.push(subCurr);
                    continue;
                }
            }
            // currNode does not have the key, but toFind does
            if (subCurr === undefined || subCurr === null) {
                if (key === "wildcardVar") {
                    if (wVars.leftToSkip && wVars.leftToSkip[subFind] > 0) {
                        wVars.leftToSkip[subFind] -= 1;
                        return false; // Skip, this does not match our wildcard
                    }
                    // We have skipped the required number, so take this guess.
                    // Copy over all of currNode's properties into
                    //  wVars.values[subFind] so the var references set up in
                    //  simplifyTree behave like currNode. Shallow copy.
                    _.extend(wVars.values[subFind], currNode);
                    matchResults.vars[subFind.slice(1)] = currNode;
                    if (rootToSet) {
                        matchResults.root = rootToSet;
                    }
                    return matchResults; // This node is now our variable.
                }
                return false;
            }
            // Now handle arrays/objects/values
            if (_.isObject(subCurr) !== _.isObject(subFind) ||
                _.isArray(subCurr) !== _.isArray(subFind) ||
                (typeof(subCurr) !== typeof(subFind))) {
                console.error("Object/array/other type mismatch.");
                return false;
            } else if (_.isArray(subCurr)) {
                // Both are arrays, do a recursive compare.
                // (Arrays are objects so do this check before the object check)
                if (subFind.length === 0) {
                    continue; // Empty arrays can match any array.
                }
                var newToFind = subFind[0];
                var peers = subFind.slice(1);
                if (key === "params" || key === "arguments") {
                    if (!checkArgumentsArray(subCurr, newToFind, peers, wVars, matchResults, options)) {
                        return false;
                    }
                } else if (!checkNodeArray(subCurr, newToFind, peers, wVars, matchResults, options)) {
                    return false;
                }
            } else if (_.isObject(subCurr)) {
                // Both are objects, so do a recursive compare.
                if (!checkMatchTree(subCurr, subFind, peersToFind, wVars, matchResults, options)) {
                    return false;
                }
            } else if (!_.isObject(subCurr)) {
                // Check that the non-object (number/string) values match
                if (subCurr !== subFind) {
                    return false;
                }
            } else { // Logically impossible, but as a robustness catch.
                console.error("Some weird never-before-seen situation!");
                console.error(currNode);
                console.error(subCurr);
                throw "Error: logic inside of structure analysis code broke.";
            }
        }
        if (toFind === undefined) {
            matchResults._.push(currNode);
        }
        if (rootToSet) {
            matchResults.root = rootToSet;
        }
        return matchResults;
    }

    function deepClone(obj) {
        return JSON.parse(JSON.stringify(obj));
    }

    /*
     * Takes in a string for a structure and returns HTML for nice styling.
     * The blanks (_) are enclosed in span.structuredjs_blank, and the
     * structured.js variables ($someVar) are enclosed in span.structuredjs_var
     * for special styling.
     *
     * See pretty-display/index.html for a demo and sample stylesheet.
     *
     * Only works when RainbowJS (http://craig.is/making/rainbows) is
     * included on the page; if RainbowJS is not available, simply
     * returns the code string. RainbowJS is not available as an npm
     * module.
     */
    function prettyHtml(code, callback) {
        if (!Rainbow) {
            return code;
        }
        Rainbow.color(code, "javascript", function(formattedCode) {
            var output = ("<pre class='rainbowjs'>" +
                addStyling(formattedCode) + "</pre>");
            callback(output);
        });
    }

    /*
     * Helper function for prettyHtml that takes in a string (the formatted
     * output of RainbowJS) and inserts special StructuredJS spans for
     * blanks (_) and variables ($something).
     *
     * The optional parameter maintainStyles should be set to true if the
     * caller wishes to keep the class assignments from the previous call
     * to addStyling and continue where we left off. This parameter is
     * valuable for visual consistency across different structures that share
     * variables.
     */
    function addStyling(code, maintainStyles) {
        if (!maintainStyles) {
            addStyling.styleMap = {};
            addStyling.counter = 0;
        }
        // First replace underscores with empty structuredjs_blank spans
        // Regex: Match any underscore _ that is not preceded or followed by an
        // alphanumeric character.
        code = code.replace(/(^|[^A-Za-z0-9])_(?![A-Za-z0-9])/g,
            "$1<span class='structuredjs_blank'></span>");
        // Next replace variables with empty structuredjs_var spans numbered
        // with classes.
        // This regex is in two parts:
        //  Part 1, delimited by the non-capturing parentheses `(?: ...)`:
        //    (^|[^\w])\$(\w+)
        //    Match any $ that is preceded by either a 'start of line', or a
        //    non-alphanumeric character, and is followed by at least one
        //    alphanumeric character (the variable name).
        //  Part 2, also delimited by the non-capturing parentheses:
        //      ()\$<span class="function call">(\w+)<\/span>
        //      Match any function call immediately preceded by a dollar sign,
        //      where the Rainbow syntax highlighting separated a $foo()
        //      function call by placing the dollar sign outside.
        //      the function call span to create
        //      $<span class="function call">foo</span>.
        // We combine the two parts with an | (an OR) so that either matches.
        // The reason we do this all in one go rather than in two separate
        // calls to replace is so that we color the string in order,
        // rather than coloring all non-function calls and then going back
        // to do all function calls (a minor point, but otherwise the
        // interactive pretty display becomes jarring as previous
        // function call colors change when new variables are introduced.)
        // Finally, add the /g flag for global replacement.
        var regexVariables = /(?:(^|[^\w])\$(\w+))|(?:\$<span class="function call">(\w+)<\/span>)/g;
        return code.replace(regexVariables,
            function(m, prev, varName, fnVarName) {
                // Necessary to handle the fact we are essentially performing
                // two regexes at once as outlined above.
                prev = prev || "";
                varName = varName || fnVarName;
                var fn = addStyling;
                // Assign the next available class to this variable if it does
                // not yet exist in our style mapping.
                if (!(varName in fn.styleMap)) {
                    fn.styleMap[varName] = (fn.counter < fn.styles.length ?
                        fn.styles[fn.counter] : "extra");
                    fn.counter += 1;
                }
                return (prev + "<span class='structuredjs_var " +
                    fn.styleMap[varName] + "'>" + "</span>");
            }
        );
    }
    // Store some properties on the addStyling function to maintain the
    // styleMap between runs if desired.
    // Right now just support 7 different variables. Just add more if needed.
    addStyling.styles = ["one", "two", "three", "four", "five", "six",
        "seven"
    ];
    addStyling.styleMap = {};
    addStyling.counter = 0;

    function getSingleData(node, data) {
        if (!node || node.type !== "Identifier") {
            return;
        }

        if (node.name === "_") {
            if (!data._ || data._.length === 0) {
                throw "No _ data available.";
            }

            return data._.shift();
        } else if (node.name && node.name.indexOf("$") === 0) {
            var name = node.name.slice(1);

            if (!data.vars || !(name in data.vars)) {
                throw "No vars available.";
            }

            return data.vars[name];
        }
    }

    function getGlobData(node, data) {
        var check = node && node.expression || node;

        if (!check || check.type !== "Identifier") {
            return;
        }

        if (check.name === "glob_") {
            if (!data._ || data._.length === 0) {
                throw "No _ data available.";
            }

            return data._.shift();
        } else if (check.name && check.name.indexOf("glob$") === 0) {
            var name = check.name.slice(5);

            if (!data.vars || !(name in data.vars)) {
                throw "No vars available.";
            }

            return data.vars[name];
        }
    }

    function injectData(node, data) {
        if (!node) {
            return node;
        }

        for (var prop in node) {
            if (!node.hasOwnProperty(prop)) {
                continue;
            }

            if (node[prop] && typeof node[prop] === "object" && "length" in node[prop]) {
                for (var i = 0; i < node[prop].length; i++) {
                    var globData = getGlobData(node[prop][i], data);

                    if (globData) {
                        node[prop].splice.apply(node[prop],
                            [i, 1].concat(globData));
                        break;
                    } else if (typeof node[prop][i] === "object") {
                        var singleData = getSingleData(node[prop][i], data);

                        if (singleData) {
                            node[prop][i] = singleData;
                        } else if (typeof node[prop][i] === "object") {
                            injectData(node[prop][i], data);
                        }
                    }
                }
            } else {
                var singleData = getSingleData(node[prop], data);

                if (singleData) {
                    node[prop] = singleData;
                } else if (typeof node[prop] === "object") {
                    injectData(node[prop], data);
                }
            }
        }

        return node;
    }

    exports.match = match;
    exports.matchNode = function(code, rawStructure, options) {
        options = options || {};
        options.single = true;
        return match(code, rawStructure, options);
    };
    exports.injectData = function(node, data) {
        node = parseStructure(node);
        data = deepClone(data);
        return injectData(node, data);
    };
    exports.prettify = prettyHtml;
})(typeof window !== "undefined" ? window : global);
/*
 TraceKit - Cross brower stack traces - github.com/occ/TraceKit
 MIT license
*/

(function(window, undefined) {


var TraceKit = {};
var _oldTraceKit = window.TraceKit;

// global reference to slice
var _slice = [].slice;
var UNKNOWN_FUNCTION = '?';


/**
 * _has, a better form of hasOwnProperty
 * Example: _has(MainHostObject, property) === true/false
 *
 * @param {Object} host object to check property
 * @param {string} key to check
 */
function _has(object, key) {
    return Object.prototype.hasOwnProperty.call(object, key);
}

function _isUndefined(what) {
    return typeof what === 'undefined';
}

/**
 * TraceKit.noConflict: Export TraceKit out to another variable
 * Example: var TK = TraceKit.noConflict()
 */
TraceKit.noConflict = function noConflict() {
    window.TraceKit = _oldTraceKit;
    return TraceKit;
};

/**
 * TraceKit.wrap: Wrap any function in a TraceKit reporter
 * Example: func = TraceKit.wrap(func);
 *
 * @param {Function} func Function to be wrapped
 * @return {Function} The wrapped func
 */
TraceKit.wrap = function traceKitWrapper(func) {
    function wrapped() {
        try {
            return func.apply(this, arguments);
        } catch (e) {
            TraceKit.report(e);
            throw e;
        }
    }
    return wrapped;
};

/**
 * TraceKit.report: cross-browser processing of unhandled exceptions
 *
 * Syntax:
 *   TraceKit.report.subscribe(function(stackInfo) { ... })
 *   TraceKit.report.unsubscribe(function(stackInfo) { ... })
 *   TraceKit.report(exception)
 *   try { ...code... } catch(ex) { TraceKit.report(ex); }
 *
 * Supports:
 *   - Firefox: full stack trace with line numbers, plus column number
 *              on top frame; column number is not guaranteed
 *   - Opera:   full stack trace with line and column numbers
 *   - Chrome:  full stack trace with line and column numbers
 *   - Safari:  line and column number for the top frame only; some frames
 *              may be missing, and column number is not guaranteed
 *   - IE:      line and column number for the top frame only; some frames
 *              may be missing, and column number is not guaranteed
 *
 * In theory, TraceKit should work on all of the following versions:
 *   - IE5.5+ (only 8.0 tested)
 *   - Firefox 0.9+ (only 3.5+ tested)
 *   - Opera 7+ (only 10.50 tested; versions 9 and earlier may require
 *     Exceptions Have Stacktrace to be enabled in opera:config)
 *   - Safari 3+ (only 4+ tested)
 *   - Chrome 1+ (only 5+ tested)
 *   - Konqueror 3.5+ (untested)
 *
 * Requires TraceKit.computeStackTrace.
 *
 * Tries to catch all unhandled exceptions and report them to the
 * subscribed handlers. Please note that TraceKit.report will rethrow the
 * exception. This is REQUIRED in order to get a useful stack trace in IE.
 * If the exception does not reach the top of the browser, you will only
 * get a stack trace from the point where TraceKit.report was called.
 *
 * Handlers receive a stackInfo object as described in the
 * TraceKit.computeStackTrace docs.
 */
TraceKit.report = (function reportModuleWrapper() {
    var handlers = [],
        lastException = null,
        lastExceptionStack = null;

    /**
     * Add a crash handler.
     * @param {Function} handler
     */
    function subscribe(handler) {
        installGlobalHandler();
        handlers.push(handler);
    }

    /**
     * Remove a crash handler.
     * @param {Function} handler
     */
    function unsubscribe(handler) {
        for (var i = handlers.length - 1; i >= 0; --i) {
            if (handlers[i] === handler) {
                handlers.splice(i, 1);
            }
        }
    }

    /**
     * Dispatch stack information to all handlers.
     * @param {Object.<string, *>} stack
     */
    function notifyHandlers(stack, windowError) {
        var exception = null;
        if (windowError && !TraceKit.collectWindowErrors) {
          return;
        }
        for (var i in handlers) {
            if (_has(handlers, i)) {
                try {
                    handlers[i].apply(null, [stack].concat(_slice.call(arguments, 2)));
                } catch (inner) {
                    exception = inner;
                }
            }
        }

        if (exception) {
            throw exception;
        }
    }

    var _oldOnerrorHandler, _onErrorHandlerInstalled;

    /**
     * Ensures all global unhandled exceptions are recorded.
     * Supported by Gecko and IE.
     * @param {string} message Error message.
     * @param {string} url URL of script that generated the exception.
     * @param {(number|string)} lineNo The line number at which the error
     * occurred.
     */
    function traceKitWindowOnError(message, url, lineNo) {
        var stack = null;

        if (lastExceptionStack) {
            TraceKit.computeStackTrace.augmentStackTraceWithInitialElement(lastExceptionStack, url, lineNo, message);
            stack = lastExceptionStack;
            lastExceptionStack = null;
            lastException = null;
        } else {
            var location = {
                'url': url,
                'line': lineNo
            };
            location.func = TraceKit.computeStackTrace.guessFunctionName(location.url, location.line);
            location.context = TraceKit.computeStackTrace.gatherContext(location.url, location.line);
            stack = {
                'mode': 'onerror',
                'message': message,
                'url': document.location.href,
                'stack': [location],
                'useragent': navigator.userAgent
            };
        }

        notifyHandlers(stack, 'from window.onerror');

        if (_oldOnerrorHandler) {
            return _oldOnerrorHandler.apply(this, arguments);
        }

        return false;
    }

    function installGlobalHandler ()
    {
        if (_onErrorHandlerInstalled === true) {
            return;
        }
        _oldOnerrorHandler = window.onerror;
        window.onerror = traceKitWindowOnError;
        _onErrorHandlerInstalled = true;
    }

    /**
     * Reports an unhandled Error to TraceKit.
     * @param {Error} ex
     */
    function report(ex) {
        var args = _slice.call(arguments, 1);
        if (lastExceptionStack) {
            if (lastException === ex) {
                return; // already caught by an inner catch block, ignore
            } else {
                var s = lastExceptionStack;
                lastExceptionStack = null;
                lastException = null;
                notifyHandlers.apply(null, [s, null].concat(args));
            }
        }

        var stack = TraceKit.computeStackTrace(ex);
        lastExceptionStack = stack;
        lastException = ex;

        // If the stack trace is incomplete, wait for 2 seconds for
        // slow slow IE to see if onerror occurs or not before reporting
        // this exception; otherwise, we will end up with an incomplete
        // stack trace
        window.setTimeout(function () {
            if (lastException === ex) {
                lastExceptionStack = null;
                lastException = null;
                notifyHandlers.apply(null, [stack, null].concat(args));
            }
        }, (stack.incomplete ? 2000 : 0));

        throw ex; // re-throw to propagate to the top level (and cause window.onerror)
    }

    report.subscribe = subscribe;
    report.unsubscribe = unsubscribe;
    return report;
}());

/**
 * TraceKit.computeStackTrace: cross-browser stack traces in JavaScript
 *
 * Syntax:
 *   s = TraceKit.computeStackTrace.ofCaller([depth])
 *   s = TraceKit.computeStackTrace(exception) // consider using TraceKit.report instead (see below)
 * Returns:
 *   s.name              - exception name
 *   s.message           - exception message
 *   s.stack[i].url      - JavaScript or HTML file URL
 *   s.stack[i].func     - function name, or empty for anonymous functions (if guessing did not work)
 *   s.stack[i].args     - arguments passed to the function, if known
 *   s.stack[i].line     - line number, if known
 *   s.stack[i].column   - column number, if known
 *   s.stack[i].context  - an array of source code lines; the middle element corresponds to the correct line#
 *   s.mode              - 'stack', 'stacktrace', 'multiline', 'callers', 'onerror', or 'failed' -- method used to collect the stack trace
 *
 * Supports:
 *   - Firefox:  full stack trace with line numbers and unreliable column
 *               number on top frame
 *   - Opera 10: full stack trace with line and column numbers
 *   - Opera 9-: full stack trace with line numbers
 *   - Chrome:   full stack trace with line and column numbers
 *   - Safari:   line and column number for the topmost stacktrace element
 *               only
 *   - IE:       no line numbers whatsoever
 *
 * Tries to guess names of anonymous functions by looking for assignments
 * in the source code. In IE and Safari, we have to guess source file names
 * by searching for function bodies inside all page scripts. This will not
 * work for scripts that are loaded cross-domain.
 * Here be dragons: some function names may be guessed incorrectly, and
 * duplicate functions may be mismatched.
 *
 * TraceKit.computeStackTrace should only be used for tracing purposes.
 * Logging of unhandled exceptions should be done with TraceKit.report,
 * which builds on top of TraceKit.computeStackTrace and provides better
 * IE support by utilizing the window.onerror event to retrieve information
 * about the top of the stack.
 *
 * Note: In IE and Safari, no stack trace is recorded on the Error object,
 * so computeStackTrace instead walks its *own* chain of callers.
 * This means that:
 *  * in Safari, some methods may be missing from the stack trace;
 *  * in IE, the topmost function in the stack trace will always be the
 *    caller of computeStackTrace.
 *
 * This is okay for tracing (because you are likely to be calling
 * computeStackTrace from the function you want to be the topmost element
 * of the stack trace anyway), but not okay for logging unhandled
 * exceptions (because your catch block will likely be far away from the
 * inner function that actually caused the exception).
 *
 * Tracing example:
 *     function trace(message) {
 *         var stackInfo = TraceKit.computeStackTrace.ofCaller();
 *         var data = message + "\n";
 *         for(var i in stackInfo.stack) {
 *             var item = stackInfo.stack[i];
 *             data += (item.func || '[anonymous]') + "() in " + item.url + ":" + (item.line || '0') + "\n";
 *         }
 *         if (window.console)
 *             console.info(data);
 *         else
 *             alert(data);
 *     }
 */
TraceKit.computeStackTrace = (function computeStackTraceWrapper() {
    var debug = false,
        sourceCache = {};

    /**
     * Attempts to retrieve source code via XMLHttpRequest, which is used
     * to look up anonymous function names.
     * @param {string} url URL of source code.
     * @return {string} Source contents.
     */
    function loadSource(url) {
        if (!TraceKit.remoteFetching) { //Only attempt request if remoteFetching is on.
            return '';
        }
        try {
            var getXHR = function() {
                try {
                    return new window.XMLHttpRequest();
                } catch (e) {
                    // explicitly bubble up the exception if not found
                    return new window.ActiveXObject('Microsoft.XMLHTTP');
                }
            };

            var request = getXHR();
            request.open('GET', url, false);
            request.send('');
            return request.responseText;
        } catch (e) {
            return '';
        }
    }

    /**
     * Retrieves source code from the source code cache.
     * @param {string} url URL of source code.
     * @return {Array.<string>} Source contents.
     */
    function getSource(url) {
        if (!_has(sourceCache, url)) {
            // URL needs to be able to fetched within the acceptable domain.  Otherwise,
            // cross-domain errors will be triggered.
            var source = '';
            if (url.indexOf(document.domain) !== -1) {
                source = loadSource(url);
            }
            sourceCache[url] = source ? source.split('\n') : [];
        }

        return sourceCache[url];
    }

    /**
     * Tries to use an externally loaded copy of source code to determine
     * the name of a function by looking at the name of the variable it was
     * assigned to, if any.
     * @param {string} url URL of source code.
     * @param {(string|number)} lineNo Line number in source code.
     * @return {string} The function name, if discoverable.
     */
    function guessFunctionName(url, lineNo) {
        var reFunctionArgNames = /function ([^(]*)\(([^)]*)\)/,
            reGuessFunction = /['"]?([0-9A-Za-z$_]+)['"]?\s*[:=]\s*(function|eval|new Function)/,
            line = '',
            maxLines = 10,
            source = getSource(url),
            m;

        if (!source.length) {
            return UNKNOWN_FUNCTION;
        }

        // Walk backwards from the first line in the function until we find the line which
        // matches the pattern above, which is the function definition
        for (var i = 0; i < maxLines; ++i) {
            line = source[lineNo - i] + line;

            if (!_isUndefined(line)) {
                if ((m = reGuessFunction.exec(line))) {
                    return m[1];
                } else if ((m = reFunctionArgNames.exec(line))) {
                    return m[1];
                }
            }
        }

        return UNKNOWN_FUNCTION;
    }

    /**
     * Retrieves the surrounding lines from where an exception occurred.
     * @param {string} url URL of source code.
     * @param {(string|number)} line Line number in source code to centre
     * around for context.
     * @return {?Array.<string>} Lines of source code.
     */
    function gatherContext(url, line) {
        var source = getSource(url);

        if (!source.length) {
            return null;
        }

        var context = [],
            // linesBefore & linesAfter are inclusive with the offending line.
            // if linesOfContext is even, there will be one extra line
            //   *before* the offending line.
            linesBefore = Math.floor(TraceKit.linesOfContext / 2),
            // Add one extra line if linesOfContext is odd
            linesAfter = linesBefore + (TraceKit.linesOfContext % 2),
            start = Math.max(0, line - linesBefore - 1),
            end = Math.min(source.length, line + linesAfter - 1);

        line -= 1; // convert to 0-based index

        for (var i = start; i < end; ++i) {
            if (!_isUndefined(source[i])) {
                context.push(source[i]);
            }
        }

        return context.length > 0 ? context : null;
    }

    /**
     * Escapes special characters, except for whitespace, in a string to be
     * used inside a regular expression as a string literal.
     * @param {string} text The string.
     * @return {string} The escaped string literal.
     */
    function escapeRegExp(text) {
        return text.replace(/[\-\[\]{}()*+?.,\\\^$|#]/g, '\\$&');
    }

    /**
     * Escapes special characters in a string to be used inside a regular
     * expression as a string literal. Also ensures that HTML entities will
     * be matched the same as their literal friends.
     * @param {string} body The string.
     * @return {string} The escaped string.
     */
    function escapeCodeAsRegExpForMatchingInsideHTML(body) {
        return escapeRegExp(body).replace('<', '(?:<|&lt;)').replace('>', '(?:>|&gt;)').replace('&', '(?:&|&amp;)').replace('"', '(?:"|&quot;)').replace(/\s+/g, '\\s+');
    }

    /**
     * Determines where a code fragment occurs in the source code.
     * @param {RegExp} re The function definition.
     * @param {Array.<string>} urls A list of URLs to search.
     * @return {?Object.<string, (string|number)>} An object containing
     * the url, line, and column number of the defined function.
     */
    function findSourceInUrls(re, urls) {
        var source, m;
        for (var i = 0, j = urls.length; i < j; ++i) {
            // console.log('searching', urls[i]);
            if ((source = getSource(urls[i])).length) {
                source = source.join('\n');
                if ((m = re.exec(source))) {
                    // console.log('Found function in ' + urls[i]);

                    return {
                        'url': urls[i],
                        'line': source.substring(0, m.index).split('\n').length,
                        'column': m.index - source.lastIndexOf('\n', m.index) - 1
                    };
                }
            }
        }

        // console.log('no match');

        return null;
    }

    /**
     * Determines at which column a code fragment occurs on a line of the
     * source code.
     * @param {string} fragment The code fragment.
     * @param {string} url The URL to search.
     * @param {(string|number)} line The line number to examine.
     * @return {?number} The column number.
     */
    function findSourceInLine(fragment, url, line) {
        var source = getSource(url),
            re = new RegExp('\\b' + escapeRegExp(fragment) + '\\b'),
            m;

        line -= 1;

        if (source && source.length > line && (m = re.exec(source[line]))) {
            return m.index;
        }

        return null;
    }

    /**
     * Determines where a function was defined within the source code.
     * @param {(Function|string)} func A function reference or serialized
     * function definition.
     * @return {?Object.<string, (string|number)>} An object containing
     * the url, line, and column number of the defined function.
     */
    function findSourceByFunctionBody(func) {
        var urls = [window.location.href],
            scripts = document.getElementsByTagName('script'),
            body,
            code = '' + func,
            codeRE = /^function(?:\s+([\w$]+))?\s*\(([\w\s,]*)\)\s*\{\s*(\S[\s\S]*\S)\s*\}\s*$/,
            eventRE = /^function on([\w$]+)\s*\(event\)\s*\{\s*(\S[\s\S]*\S)\s*\}\s*$/,
            re,
            parts,
            result;

        for (var i = 0; i < scripts.length; ++i) {
            var script = scripts[i];
            if (script.src) {
                urls.push(script.src);
            }
        }

        if (!(parts = codeRE.exec(code))) {
            re = new RegExp(escapeRegExp(code).replace(/\s+/g, '\\s+'));
        }

        // not sure if this is really necessary, but I don’t have a test
        // corpus large enough to confirm that and it was in the original.
        else {
            var name = parts[1] ? '\\s+' + parts[1] : '',
                args = parts[2].split(',').join('\\s*,\\s*');

            body = escapeRegExp(parts[3]).replace(/;$/, ';?'); // semicolon is inserted if the function ends with a comment.replace(/\s+/g, '\\s+');
            re = new RegExp('function' + name + '\\s*\\(\\s*' + args + '\\s*\\)\\s*{\\s*' + body + '\\s*}');
        }

        // look for a normal function definition
        if ((result = findSourceInUrls(re, urls))) {
            return result;
        }

        // look for an old-school event handler function
        if ((parts = eventRE.exec(code))) {
            var event = parts[1];
            body = escapeCodeAsRegExpForMatchingInsideHTML(parts[2]);

            // look for a function defined in HTML as an onXXX handler
            re = new RegExp('on' + event + '=[\\\'"]\\s*' + body + '\\s*[\\\'"]', 'i');

            if ((result = findSourceInUrls(re, urls[0]))) {
                return result;
            }

            // look for ???
            re = new RegExp(body);

            if ((result = findSourceInUrls(re, urls))) {
                return result;
            }
        }

        return null;
    }

    // Contents of Exception in various browsers.
    //
    // SAFARI:
    // ex.message = Can't find variable: qq
    // ex.line = 59
    // ex.sourceId = 580238192
    // ex.sourceURL = http://...
    // ex.expressionBeginOffset = 96
    // ex.expressionCaretOffset = 98
    // ex.expressionEndOffset = 98
    // ex.name = ReferenceError
    //
    // FIREFOX:
    // ex.message = qq is not defined
    // ex.fileName = http://...
    // ex.lineNumber = 59
    // ex.stack = ...stack trace... (see the example below)
    // ex.name = ReferenceError
    //
    // CHROME:
    // ex.message = qq is not defined
    // ex.name = ReferenceError
    // ex.type = not_defined
    // ex.arguments = ['aa']
    // ex.stack = ...stack trace...
    //
    // INTERNET EXPLORER:
    // ex.message = ...
    // ex.name = ReferenceError
    //
    // OPERA:
    // ex.message = ...message... (see the example below)
    // ex.name = ReferenceError
    // ex.opera#sourceloc = 11  (pretty much useless, duplicates the info in ex.message)
    // ex.stacktrace = n/a; see 'opera:config#UserPrefs|Exceptions Have Stacktrace'

    /**
     * Computes stack trace information from the stack property.
     * Chrome and Gecko use this property.
     * @param {Error} ex
     * @return {?Object.<string, *>} Stack trace information.
     */
    function computeStackTraceFromStackProp(ex) {
        if (!ex.stack) {
            return null;
        }

        var url = "\\(?((?:file|http|https):.*?):(\\d+)(?::(\\d+))?\\)?";
        var chrome = new RegExp("^\\s*at (?:((?:\\[object object\\])?\\S+(?: \\[as \\S+\\])?) )?(?:\\(eval at \\S+ " + url + ", (.*?):(\\d+)(?::(\\d+))?\\)|" + url + ")\\s*$", i),
            gecko = /^\s*(\S*)(?:\((.*?)\))?@((?:file|http|https).*?):(\d+)(?::(\d+))?\s*$/i,
            lines = ex.stack.split('\n'),
            stack = [],
            parts,
            element,
            reference = /^(.*) is undefined$/.exec(ex.message);

        for (var i = 0, j = lines.length; i < j; ++i) {
            if ((parts = gecko.exec(lines[i]))) {
                element = {
                    'url': parts[3],
                    'func': parts[1] || UNKNOWN_FUNCTION,
                    'args': parts[2] ? parts[2].split(',') : '',
                    'line': +parts[4],
                    'column': parts[5] ? +parts[5] : null
                };
            } else if ((parts = chrome.exec(lines[i]))) {
               if(parts[5] !== undefined) {
                  element = {
                    'url': parts[5],
                    'func': parts[1] || 'unknown',
                    'line': +parts[6],
                    'column': parts[7] ? +parts[7] : null
                  };
                } else {
                  element = {
                    'url': parts[8],
                    'func': parts[1] || 'unknown',
                    'line': +parts[9],
                    'column': parts[10] ? +parts[10] : null
                  };
               }
            } else {
                continue;
            }

            if (!element.func && element.line) {
                element.func = guessFunctionName(element.url, element.line);
            }

            if (element.line) {
                element.context = gatherContext(element.url, element.line);
            }

            stack.push(element);
        }

        if (stack[0] && stack[0].line && !stack[0].column && reference) {
            stack[0].column = findSourceInLine(reference[1], stack[0].url, stack[0].line);
        }

        if (!stack.length) {
            return null;
        }

        return {
            'mode': 'stack',
            'name': ex.name,
            'message': ex.message,
            'url': document.location.href,
            'stack': stack,
            'useragent': navigator.userAgent
        };
    }

    /**
     * Computes stack trace information from the stacktrace property.
     * Opera 10 uses this property.
     * @param {Error} ex
     * @return {?Object.<string, *>} Stack trace information.
     */
    function computeStackTraceFromStacktraceProp(ex) {
        // Access and store the stacktrace property before doing ANYTHING
        // else to it because Opera is not very good at providing it
        // reliably in other circumstances.
        var stacktrace = ex.stacktrace;

        var testRE = / line (\d+), column (\d+) in (?:<anonymous function: ([^>]+)>|([^\)]+))\((.*)\) in (.*):\s*$/i,
            lines = stacktrace.split('\n'),
            stack = [],
            parts;

        for (var i = 0, j = lines.length; i < j; i += 2) {
            if ((parts = testRE.exec(lines[i]))) {
                var element = {
                    'line': +parts[1],
                    'column': +parts[2],
                    'func': parts[3] || parts[4],
                    'args': parts[5] ? parts[5].split(',') : [],
                    'url': parts[6]
                };

                if (!element.func && element.line) {
                    element.func = guessFunctionName(element.url, element.line);
                }
                if (element.line) {
                    try {
                        element.context = gatherContext(element.url, element.line);
                    } catch (exc) {}
                }

                if (!element.context) {
                    element.context = [lines[i + 1]];
                }

                stack.push(element);
            }
        }

        if (!stack.length) {
            return null;
        }

        return {
            'mode': 'stacktrace',
            'name': ex.name,
            'message': ex.message,
            'url': document.location.href,
            'stack': stack,
            'useragent': navigator.userAgent
        };
    }

    /**
     * NOT TESTED.
     * Computes stack trace information from an error message that includes
     * the stack trace.
     * Opera 9 and earlier use this method if the option to show stack
     * traces is turned on in opera:config.
     * @param {Error} ex
     * @return {?Object.<string, *>} Stack information.
     */
    function computeStackTraceFromOperaMultiLineMessage(ex) {
        // Opera includes a stack trace into the exception message. An example is:
        //
        // Statement on line 3: Undefined variable: undefinedFunc
        // Backtrace:
        //   Line 3 of linked script file://localhost/Users/andreyvit/Projects/TraceKit/javascript-client/sample.js: In function zzz
        //         undefinedFunc(a);
        //   Line 7 of inline#1 script in file://localhost/Users/andreyvit/Projects/TraceKit/javascript-client/sample.html: In function yyy
        //           zzz(x, y, z);
        //   Line 3 of inline#1 script in file://localhost/Users/andreyvit/Projects/TraceKit/javascript-client/sample.html: In function xxx
        //           yyy(a, a, a);
        //   Line 1 of function script
        //     try { xxx('hi'); return false; } catch(ex) { TraceKit.report(ex); }
        //   ...

        var lines = ex.message.split('\n');
        if (lines.length < 4) {
            return null;
        }

        var lineRE1 = /^\s*Line (\d+) of linked script ((?:file|http|https)\S+)(?:: in function (\S+))?\s*$/i,
            lineRE2 = /^\s*Line (\d+) of inline#(\d+) script in ((?:file|http|https)\S+)(?:: in function (\S+))?\s*$/i,
            lineRE3 = /^\s*Line (\d+) of function script\s*$/i,
            stack = [],
            scripts = document.getElementsByTagName('script'),
            inlineScriptBlocks = [],
            parts,
            i,
            len,
            source;

        for (i in scripts) {
            if (_has(scripts, i) && !scripts[i].src) {
                inlineScriptBlocks.push(scripts[i]);
            }
        }

        for (i = 2, len = lines.length; i < len; i += 2) {
            var item = null;
            if ((parts = lineRE1.exec(lines[i]))) {
                item = {
                    'url': parts[2],
                    'func': parts[3],
                    'line': +parts[1]
                };
            } else if ((parts = lineRE2.exec(lines[i]))) {
                item = {
                    'url': parts[3],
                    'func': parts[4]
                };
                var relativeLine = (+parts[1]); // relative to the start of the <SCRIPT> block
                var script = inlineScriptBlocks[parts[2] - 1];
                if (script) {
                    source = getSource(item.url);
                    if (source) {
                        source = source.join('\n');
                        var pos = source.indexOf(script.innerText);
                        if (pos >= 0) {
                            item.line = relativeLine + source.substring(0, pos).split('\n').length;
                        }
                    }
                }
            } else if ((parts = lineRE3.exec(lines[i]))) {
                var url = window.location.href.replace(/#.*$/, ''),
                    line = parts[1];
                var re = new RegExp(escapeCodeAsRegExpForMatchingInsideHTML(lines[i + 1]));
                source = findSourceInUrls(re, [url]);
                item = {
                    'url': url,
                    'line': source ? source.line : line,
                    'func': ''
                };
            }

            if (item) {
                if (!item.func) {
                    item.func = guessFunctionName(item.url, item.line);
                }
                var context = gatherContext(item.url, item.line);
                var midline = (context ? context[Math.floor(context.length / 2)] : null);
                if (context && midline.replace(/^\s*/, '') === lines[i + 1].replace(/^\s*/, '')) {
                    item.context = context;
                } else {
                    // if (context) alert("Context mismatch. Correct midline:\n" + lines[i+1] + "\n\nMidline:\n" + midline + "\n\nContext:\n" + context.join("\n") + "\n\nURL:\n" + item.url);
                    item.context = [lines[i + 1]];
                }
                stack.push(item);
            }
        }
        if (!stack.length) {
            return null; // could not parse multiline exception message as Opera stack trace
        }

        return {
            'mode': 'multiline',
            'name': ex.name,
            'message': lines[0],
            'url': document.location.href,
            'stack': stack,
            'useragent': navigator.userAgent
        };
    }

    /**
     * Adds information about the first frame to incomplete stack traces.
     * Safari and IE require this to get complete data on the first frame.
     * @param {Object.<string, *>} stackInfo Stack trace information from
     * one of the compute* methods.
     * @param {string} url The URL of the script that caused an error.
     * @param {(number|string)} lineNo The line number of the script that
     * caused an error.
     * @param {string=} message The error generated by the browser, which
     * hopefully contains the name of the object that caused the error.
     * @return {boolean} Whether or not the stack information was
     * augmented.
     */
    function augmentStackTraceWithInitialElement(stackInfo, url, lineNo, message) {
        var initial = {
            'url': url,
            'line': lineNo
        };

        if (initial.url && initial.line) {
            stackInfo.incomplete = false;

            if (!initial.func) {
                initial.func = guessFunctionName(initial.url, initial.line);
            }

            if (!initial.context) {
                initial.context = gatherContext(initial.url, initial.line);
            }

            var reference = / '([^']+)' /.exec(message);
            if (reference) {
                initial.column = findSourceInLine(reference[1], initial.url, initial.line);
            }

            if (stackInfo.stack.length > 0) {
                if (stackInfo.stack[0].url === initial.url) {
                    if (stackInfo.stack[0].line === initial.line) {
                        return false; // already in stack trace
                    } else if (!stackInfo.stack[0].line && stackInfo.stack[0].func === initial.func) {
                        stackInfo.stack[0].line = initial.line;
                        stackInfo.stack[0].context = initial.context;
                        return false;
                    }
                }
            }

            stackInfo.stack.unshift(initial);
            stackInfo.partial = true;
            return true;
        } else {
            stackInfo.incomplete = true;
        }

        return false;
    }

    /**
     * Computes stack trace information by walking the arguments.caller
     * chain at the time the exception occurred. This will cause earlier
     * frames to be missed but is the only way to get any stack trace in
     * Safari and IE. The top frame is restored by
     * {@link augmentStackTraceWithInitialElement}.
     * @param {Error} ex
     * @return {?Object.<string, *>} Stack trace information.
     */
    function computeStackTraceByWalkingCallerChain(ex, depth) {
        var functionName = /function\s+([_$a-zA-Z\xA0-\uFFFF][_$a-zA-Z0-9\xA0-\uFFFF]*)?\s*\(/i,
            stack = [],
            funcs = {},
            recursion = false,
            parts,
            item,
            source;

        for (var curr = computeStackTraceByWalkingCallerChain.caller; curr && !recursion; curr = curr.caller) {
            if (curr === computeStackTrace || curr === TraceKit.report) {
                // console.log('skipping internal function');
                continue;
            }

            item = {
                'url': null,
                'func': UNKNOWN_FUNCTION,
                'line': null,
                'column': null
            };

            if (curr.name) {
                item.func = curr.name;
            } else if ((parts = functionName.exec(curr.toString()))) {
                item.func = parts[1];
            }

            if ((source = findSourceByFunctionBody(curr))) {
                item.url = source.url;
                item.line = source.line;

                if (item.func === UNKNOWN_FUNCTION) {
                    item.func = guessFunctionName(item.url, item.line);
                }

                var reference = / '([^']+)' /.exec(ex.message || ex.description);
                if (reference) {
                    item.column = findSourceInLine(reference[1], source.url, source.line);
                }
            }

            if (funcs['' + curr]) {
                recursion = true;
            }else{
                funcs['' + curr] = true;
            }

            stack.push(item);
        }

        if (depth) {
            // console.log('depth is ' + depth);
            // console.log('stack is ' + stack.length);
            stack.splice(0, depth);
        }

        var result = {
            'mode': 'callers',
            'name': ex.name,
            'message': ex.message,
            'url': document.location.href,
            'stack': stack,
            'useragent': navigator.userAgent
        };
        augmentStackTraceWithInitialElement(result, ex.sourceURL || ex.fileName, ex.line || ex.lineNumber, ex.message || ex.description);
        return result;
    }

    /**
     * Computes a stack trace for an exception.
     * @param {Error} ex
     * @param {(string|number)=} depth
     */
    function computeStackTrace(ex, depth) {
        var stack = null;
        depth = (depth == null ? 0 : +depth);

        try {
            // This must be tried first because Opera 10 *destroys*
            // its stacktrace property if you try to access the stack
            // property first!!
            stack = computeStackTraceFromStacktraceProp(ex);
            if (stack) {
                return stack;
            }
        } catch (e) {
            if (debug) {
                throw e;
            }
        }

        try {
            stack = computeStackTraceFromStackProp(ex);
            if (stack) {
                return stack;
            }
        } catch (e) {
            if (debug) {
                throw e;
            }
        }

        try {
            stack = computeStackTraceFromOperaMultiLineMessage(ex);
            if (stack) {
                return stack;
            }
        } catch (e) {
            if (debug) {
                throw e;
            }
        }

        try {
            stack = computeStackTraceByWalkingCallerChain(ex, depth + 1);
            if (stack) {
                return stack;
            }
        } catch (e) {
            if (debug) {
                throw e;
            }
        }

        return {
            'mode': 'failed'
        };
    }

    /**
     * Logs a stacktrace starting from the previous call and working down.
     * @param {(number|string)=} depth How many frames deep to trace.
     * @return {Object.<string, *>} Stack trace information.
     */
    function computeStackTraceOfCaller(depth) {
        depth = (depth == null ? 0 : +depth) + 1; // "+ 1" because "ofCaller" should drop one frame
        try {
            throw new Error();
        } catch (ex) {
            return computeStackTrace(ex, depth + 1);
        }
    }

    computeStackTrace.augmentStackTraceWithInitialElement = augmentStackTraceWithInitialElement;
    computeStackTrace.guessFunctionName = guessFunctionName;
    computeStackTrace.gatherContext = gatherContext;
    computeStackTrace.ofCaller = computeStackTraceOfCaller;

    return computeStackTrace;
}());

/**
 * Extends support for global error handling for asynchronous browser
 * functions. Adopted from Closure Library's errorhandler.js
 */
(function extendToAsynchronousCallbacks() {
    var _helper = function _helper(fnName) {
        var originalFn = window[fnName];
        window[fnName] = function traceKitAsyncExtension() {
            // Make a copy of the arguments
            var args = _slice.call(arguments);
            var originalCallback = args[0];
            if (typeof (originalCallback) === 'function') {
                args[0] = TraceKit.wrap(originalCallback);
            }
            // IE < 9 doesn't support .call/.apply on setInterval/setTimeout, but it
            // also only supports 2 argument and doesn't care what "this" is, so we
            // can just call the original function directly.
            if (originalFn.apply) {
                return originalFn.apply(this, args);
            } else {
                return originalFn(args[0], args[1]);
            }
        };
    };

    _helper('setTimeout');
    _helper('setInterval');
}());

//Default options:
if (!TraceKit.remoteFetching) {
  TraceKit.remoteFetching = true;
}
if (!TraceKit.collectWindowErrors) {
  TraceKit.collectWindowErrors = true;
}
if (!TraceKit.linesOfContext || TraceKit.linesOfContext < 1) {
  // 5 lines before, the offending line, 5 lines after
  TraceKit.linesOfContext = 11;
}



// Export to global object
window.TraceKit = TraceKit;

}(window));
