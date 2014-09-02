function initProcessingStubs() {
    /*
     * Processing functions that return values should have implementations
     * here.
     */

    var context = {
        // Global variables that we want to expose, by default
        Object: this.Object,
        RegExp: this.RegExp,
        Math: this.Math,
        Array: this.Array,
        String: this.String
    };

    (function(p, undef) {    
      var nop = function() {};
      var
        curColorMode = 1,
        colorModeA = 255,
        colorModeX = 255,
        colorModeY = 255,
        colorModeZ = 255;
      var start = Date.now();

      p.name = "Processing.js Instance";

      p.PVector = (function() {
          function PVector(x, y, z) {
            this.x = x || 0;
            this.y = y || 0;
            this.z = z || 0;
          }

          PVector.fromAngle = function(angle, v) {
            if (v === undef || v === null) {
              v = new PVector();
            }
            // XXX(jeresig)
            v.x = p.cos(angle);
            v.y = p.sin(angle);
            return v;
          };

          PVector.random2D = function(v) {
            return PVector.fromAngle(Math.random() * 360, v);
          };

          PVector.random3D = function(v) {
            var angle = Math.random() * 360;
            var vz = Math.random() * 2 - 1;
            var mult = Math.sqrt(1 - vz * vz);
            // XXX(jeresig)
            var vx = mult * p.cos(angle);
            var vy = mult * p.sin(angle);
            if (v === undef || v === null) {
              v = new PVector(vx, vy, vz);
            } else {
              v.set(vx, vy, vz);
            }
            return v;
          };

          PVector.dist = function(v1, v2) {
            return v1.dist(v2);
          };

          PVector.dot = function(v1, v2) {
            return v1.dot(v2);
          };

          PVector.cross = function(v1, v2) {
            return v1.cross(v2);
          };

          PVector.sub = function(v1, v2) {
            return new PVector(v1.x - v2.x, v1.y - v2.y, v1.z - v2.z);
          };

          PVector.angleBetween = function(v1, v2) {
            // XXX(jeresig)
            return p.acos(v1.dot(v2) / (v1.mag() * v2.mag()));
          };

          PVector.lerp = function(v1, v2, amt) {
            // non-static lerp mutates object, but this version returns a new vector
            var retval = new PVector(v1.x, v1.y, v1.z);
            retval.lerp(v2, amt);
            return retval;
          };

          // Common vector operations for PVector
          PVector.prototype = {
            set: function(v, y, z) {
              if (arguments.length === 1) {
                this.set(v.x || v[0] || 0,
                         v.y || v[1] || 0,
                         v.z || v[2] || 0);
              } else {
                this.x = v;
                this.y = y;
                this.z = z;
              }
            },
            get: function() {
              return new PVector(this.x, this.y, this.z);
            },
            mag: function() {
              var x = this.x,
                  y = this.y,
                  z = this.z;
              return Math.sqrt(x * x + y * y + z * z);
            },
            magSq: function() {
              var x = this.x,
                  y = this.y,
                  z = this.z;
              return (x * x + y * y + z * z);
            },
            setMag: function(v_or_len, len) {
              if (len === undef) {
                len = v_or_len;
                this.normalize();
                this.mult(len);
              } else {
                var v = v_or_len;
                v.normalize();
                v.mult(len);
                return v;
              }
            },
            add: function(v, y, z) {
              if (arguments.length === 1) {
                this.x += v.x;
                this.y += v.y;
                this.z += v.z;
              } else {
                this.x += v;
                this.y += y;
                this.z += z;
              }
            },
            sub: function(v, y, z) {
              if (arguments.length === 1) {
                this.x -= v.x;
                this.y -= v.y;
                this.z -= v.z;
              } else {
                this.x -= v;
                this.y -= y;
                this.z -= z;
              }
            },
            mult: function(v) {
              if (typeof v === 'number') {
                this.x *= v;
                this.y *= v;
                this.z *= v;
              } else {
                this.x *= v.x;
                this.y *= v.y;
                this.z *= v.z;
              }
            },
            div: function(v) {
              if (typeof v === 'number') {
                this.x /= v;
                this.y /= v;
                this.z /= v;
              } else {
                this.x /= v.x;
                this.y /= v.y;
                this.z /= v.z;
              }
            },
            rotate: function(angle) {
              var prev_x = this.x;
              var c = p.cos(angle);
              var s = p.sin(angle);
              this.x = c * this.x - s * this.y;
              this.y = s * prev_x + c * this.y;
            },
            dist: function(v) {
              var dx = this.x - v.x,
                  dy = this.y - v.y,
                  dz = this.z - v.z;
              return Math.sqrt(dx * dx + dy * dy + dz * dz);
            },
            dot: function(v, y, z) {
              if (arguments.length === 1) {
                return (this.x * v.x + this.y * v.y + this.z * v.z);
              }
              return (this.x * v + this.y * y + this.z * z);
            },
            cross: function(v) {
              var x = this.x,
                  y = this.y,
                  z = this.z;
              return new PVector(y * v.z - v.y * z,
                                 z * v.x - v.z * x,
                                 x * v.y - v.x * y);
            },
            lerp: function(v_or_x, amt_or_y, z, amt) {
              var lerp_val = function(start, stop, amt) {
                return start + (stop - start) * amt;
              };
              var x, y;
              if (arguments.length === 2) {
                // given vector and amt
                amt = amt_or_y;
                x = v_or_x.x;
                y = v_or_x.y;
                z = v_or_x.z;
              } else {
                // given x, y, z and amt
                x = v_or_x;
                y = amt_or_y;
              }
              this.x = lerp_val(this.x, x, amt);
              this.y = lerp_val(this.y, y, amt);
              this.z = lerp_val(this.z, z, amt);
            },
            normalize: function() {
              var m = this.mag();
              if (m > 0) {
                this.div(m);
              }
            },
            limit: function(high) {
              if (this.mag() > high) {
                this.normalize();
                this.mult(high);
              }
            },
            heading: function() {
              // XXX(jeresig)
              return -p.atan2(-this.y, this.x);
            },
            heading2D: function() {
              return this.heading();
            },
            toString: function() {
              return "[" + this.x + ", " + this.y + ", " + this.z + "]";
            },
            array: function() {
              return [this.x, this.y, this.z];
            }
          };

          function createPVectorMethod(method) {
              return function(v1, v2) {
                  var v = v1.get();
                  v[method](v2);
                  return v;
              };
          }

          // Create the static methods of PVector automatically
          // We don't do toString because it causes a TypeError 
          //  when attempting to stringify PVector
          for (var method in PVector.prototype) {
              if (PVector.prototype.hasOwnProperty(method) && !PVector.hasOwnProperty(method) &&
                  method !== "toString") {
                PVector[method] = createPVectorMethod(method);
              }
          }

          return PVector;
      }());

      p.angleMode = "radians";
      p.convertToDegrees = function(angle) {
          return p.angleMode === "degrees" ?
              p.degrees(angle) :
              angle;
      };
      p.convertToRadians = function(angle) {
          return p.angleMode === "degrees" ?
              p.radians(angle) :
              angle;
      };
      p.compose = function() {
          var args = arguments;

          return function() {
              var ret = arguments;

              for (var i = 0; i < args.length; i++) {
                  ret = [ args[i].apply(args[i], ret) ];
              }

              return ret[0];
          };
      };

      p.acos = p.compose(Math.acos, p.convertToDegrees);
      p.asin = p.compose(Math.asin, p.convertToDegrees);
      p.atan = p.compose(Math.atan, p.convertToDegrees);
      p.atan2 = p.compose(Math.atan2, p.convertToDegrees);
      p.cos = p.compose(p.convertToRadians, Math.cos);
      p.sin = p.compose(p.convertToRadians, Math.sin);
      p.tan = p.compose(p.convertToRadians, Math.tan);

      p.abs = Math.abs;
      p.ceil = Math.ceil;
      p.constrain = function(aNumber, aMin, aMax) {
        return aNumber > aMax ? aMax : aNumber < aMin ? aMin : aNumber
      };
      p.dist = function() {
        var dx, dy, dz;
        if (arguments.length === 4) {
          dx = arguments[0] - arguments[2];
          dy = arguments[1] - arguments[3];
          return Math.sqrt(dx * dx + dy * dy)
        }
        if (arguments.length === 6) {
          dx = arguments[0] - arguments[3];
          dy = arguments[1] - arguments[4];
          dz = arguments[2] - arguments[5];
          return Math.sqrt(dx * dx + dy * dy + dz * dz)
        }
      };
      p.exp = Math.exp;
      p.floor = Math.floor;
      p.lerp = function(value1, value2, amt) {
        return (value2 - value1) * amt + value1
      };
      p.log = Math.log;
      p.mag = function(a, b, c) {
        if (c) return Math.sqrt(a * a + b * b + c * c);
        return Math.sqrt(a * a + b * b)
      };
      p.map = function(value, istart, istop, ostart, ostop) {
        return ostart + (ostop - ostart) * ((value - istart) / (istop - istart))
      };
      p.max = function() {
        if (arguments.length === 2) return arguments[0] < arguments[1] ? arguments[1] : arguments[0];
        var numbers = arguments.length === 1 ? arguments[0] : arguments;
        if (! ("length" in numbers && numbers.length > 0)) throw "Non-empty array is expected";
        var max = numbers[0],
          count = numbers.length;
        for (var i = 1; i < count; ++i) if (max < numbers[i]) max = numbers[i];
        return max
      };
      p.min = function() {
        if (arguments.length === 2) return arguments[0] < arguments[1] ? arguments[0] : arguments[1];
        var numbers = arguments.length === 1 ? arguments[0] : arguments;
        if (! ("length" in numbers && numbers.length > 0)) throw "Non-empty array is expected";
        var min = numbers[0],
          count = numbers.length;
        for (var i = 1; i < count; ++i) if (min > numbers[i]) min = numbers[i];
        return min
      };
      p.norm = function(aNumber, low, high) {
        return (aNumber - low) / (high - low)
      };
      p.pow = Math.pow;
      p.round = Math.round;
      p.sq = function(aNumber) {
        return aNumber * aNumber
      };
      p.sqrt = Math.sqrt;
      var currentRandom = Math.random;
      p.random = function() {
        if (arguments.length === 0) return currentRandom();
        if (arguments.length === 1) return currentRandom() * arguments[0];
        var aMin = arguments[0],
          aMax = arguments[1];
        return currentRandom() * (aMax - aMin) + aMin
      };

      function Marsaglia(i1, i2) {
        var z = i1 || 362436069,
          w = i2 || 521288629;
        var nextInt = function() {
          z = 36969 * (z & 65535) + (z >>> 16) & 4294967295;
          w = 18E3 * (w & 65535) + (w >>> 16) & 4294967295;
          return ((z & 65535) << 16 | w & 65535) & 4294967295
        };
        this.nextDouble = function() {
          var i = nextInt() / 4294967296;
          return i < 0 ? 1 + i : i
        };
        this.nextInt = nextInt
      }
      Marsaglia.createRandomized = function() {
        var now = new Date;
        return new Marsaglia(now / 6E4 & 4294967295, now & 4294967295)
      };
      p.randomSeed = function(seed) {
        currentRandom = (new Marsaglia(seed)).nextDouble
      };
      p.Random = function(seed) {
        var haveNextNextGaussian = false,
          nextNextGaussian, random;
        this.nextGaussian = function() {
          if (haveNextNextGaussian) {
            haveNextNextGaussian = false;
            return nextNextGaussian
          }
          var v1, v2, s;
          do {
            v1 = 2 * random() - 1;
            v2 = 2 * random() - 1;
            s = v1 * v1 + v2 * v2
          } while (s >= 1 || s === 0);
          var multiplier = Math.sqrt(-2 * Math.log(s) / s);
          nextNextGaussian = v2 * multiplier;
          haveNextNextGaussian = true;
          return v1 * multiplier
        };
        random = seed === undef ? Math.random : (new Marsaglia(seed)).nextDouble
      };

      function PerlinNoise(seed) {
        var rnd = seed !== undef ? new Marsaglia(seed) : Marsaglia.createRandomized();
        var i, j;
        var perm = new Uint8Array(512);
        for (i = 0; i < 256; ++i) perm[i] = i;
        for (i = 0; i < 256; ++i) {
          var t = perm[j = rnd.nextInt() & 255];
          perm[j] = perm[i];
          perm[i] = t
        }
        for (i = 0; i < 256; ++i) perm[i + 256] = perm[i];

        function grad3d(i, x, y, z) {
          var h = i & 15;
          var u = h < 8 ? x : y,
          v = h < 4 ? y : h === 12 || h === 14 ? x : z;
          return ((h & 1) === 0 ? u : -u) + ((h & 2) === 0 ? v : -v)
        }
        function grad2d(i, x, y) {
          var v = (i & 1) === 0 ? x : y;
          return (i & 2) === 0 ? -v : v
        }
        function grad1d(i, x) {
          return (i & 1) === 0 ? -x : x
        }
        function lerp(t, a, b) {
          return a + t * (b - a)
        }
        this.noise3d = function(x, y, z) {
          var X = Math.floor(x) & 255,
            Y = Math.floor(y) & 255,
            Z = Math.floor(z) & 255;
          x -= Math.floor(x);
          y -= Math.floor(y);
          z -= Math.floor(z);
          var fx = (3 - 2 * x) * x * x,
            fy = (3 - 2 * y) * y * y,
            fz = (3 - 2 * z) * z * z;
          var p0 = perm[X] + Y,
            p00 = perm[p0] + Z,
            p01 = perm[p0 + 1] + Z,
            p1 = perm[X + 1] + Y,
            p10 = perm[p1] + Z,
            p11 = perm[p1 + 1] + Z;
          return lerp(fz, lerp(fy, lerp(fx, grad3d(perm[p00], x, y, z), grad3d(perm[p10], x - 1, y, z)), lerp(fx, grad3d(perm[p01], x, y - 1, z), grad3d(perm[p11], x - 1, y - 1, z))), lerp(fy, lerp(fx, grad3d(perm[p00 + 1], x, y, z - 1), grad3d(perm[p10 + 1], x - 1, y, z - 1)), lerp(fx, grad3d(perm[p01 + 1], x, y - 1, z - 1), grad3d(perm[p11 + 1], x - 1, y - 1, z - 1))))
        };
        this.noise2d = function(x, y) {
          var X = Math.floor(x) & 255,
            Y = Math.floor(y) & 255;
          x -= Math.floor(x);
          y -= Math.floor(y);
          var fx = (3 - 2 * x) * x * x,
            fy = (3 - 2 * y) * y * y;
          var p0 = perm[X] + Y,
            p1 = perm[X + 1] + Y;
          return lerp(fy, lerp(fx, grad2d(perm[p0], x, y), grad2d(perm[p1], x - 1, y)), lerp(fx, grad2d(perm[p0 + 1], x, y - 1), grad2d(perm[p1 + 1], x - 1, y - 1)))
        };
        this.noise1d = function(x) {
          var X = Math.floor(x) & 255;
          x -= Math.floor(x);
          var fx = (3 - 2 * x) * x * x;
          return lerp(fx, grad1d(perm[X], x), grad1d(perm[X + 1], x - 1))
        }
      }
      var noiseProfile = {
        generator: undef,
        octaves: 4,
        fallout: 0.5,
        seed: undef
      };
      p.noise = function(x, y, z) {
        if (noiseProfile.generator === undef) noiseProfile.generator = new PerlinNoise(noiseProfile.seed);
        var generator = noiseProfile.generator;
        var effect = 1,
          k = 1,
          sum = 0;
        for (var i = 0; i < noiseProfile.octaves; ++i) {
          effect *= noiseProfile.fallout;
          switch (arguments.length) {
          case 1:
            sum += effect * (1 + generator.noise1d(k * x)) / 2;
            break;
          case 2:
            sum += effect * (1 + generator.noise2d(k * x, k * y)) / 2;
            break;
          case 3:
            sum += effect * (1 + generator.noise3d(k * x, k * y, k * z)) / 2;
            break
          }
          k *= 2
        }
        return sum
      };
      p.noiseDetail = function(octaves, fallout) {
        noiseProfile.octaves = octaves;
        if (fallout !== undef) noiseProfile.fallout = fallout
      };
      p.noiseSeed = function(seed) {
        noiseProfile.seed = seed;
        noiseProfile.generator = undef
      };

      p.split = function(str, delim) {
        return str.split(delim)
      };
      p.splitTokens = function(str, tokens) {
        if (arguments.length === 1) tokens = "\n\t\r\u000c ";
        tokens = "[" + tokens + "]";
        var ary = [];
        var index = 0;
        var pos = str.search(tokens);
        while (pos >= 0) {
          if (pos === 0) str = str.substring(1);
          else {
            ary[index] = str.substring(0, pos);
            index++;
            str = str.substring(pos)
          }
          pos = str.search(tokens)
        }
        if (str.length > 0) ary[index] = str;
        if (ary.length === 0) ary = undef;
        return ary
      };
      p.append = function(array, element) {
        array[array.length] = element;
        return array
      };
      p.concat = function(array1, array2) {
        return array1.concat(array2)
      };
      p.sort = function(array, numElem) {
        var ret = [];
        if (array.length > 0) {
          var elemsToCopy = numElem > 0 ? numElem : array.length;
          for (var i = 0; i < elemsToCopy; i++) ret.push(array[i]);
          if (typeof array[0] === "string") ret.sort();
          else ret.sort(function(a, b) {
            return a - b
          });
          if (numElem > 0) for (var j = ret.length; j < array.length; j++) ret.push(array[j])
        }
        return ret
      };
      p.splice = function(array, value, index) {
        if (value.length === 0) return array;
        if (value instanceof Array) for (var i = 0, j = index; i < value.length; j++, i++) array.splice(j, 0, value[i]);
        else array.splice(index, 0, value);
        return array
      };
      p.subset = function(array, offset, length) {
        var end = length !== undef ? offset + length : array.length;
        return array.slice(offset, end)
      };
      p.join = function(array, seperator) {
        return array.join(seperator)
      };
      p.shorten = function(ary) {
        var newary = [];
        var len = ary.length;
        for (var i = 0; i < len; i++) newary[i] = ary[i];
        newary.pop();
        return newary
      };
      p.expand = function(ary, targetSize) {
        var temp = ary.slice(0),
          newSize = targetSize || ary.length * 2;
        temp.length = newSize;
        return temp
      };
      p.arrayCopy = function() {
        var src, srcPos = 0,
          dest, destPos = 0,
          length;
        if (arguments.length === 2) {
          src = arguments[0];
          dest = arguments[1];
          length = src.length
        } else if (arguments.length === 3) {
          src = arguments[0];
          dest = arguments[1];
          length = arguments[2]
        } else if (arguments.length === 5) {
          src = arguments[0];
          srcPos = arguments[1];
          dest = arguments[2];
          destPos = arguments[3];
          length = arguments[4]
        }
        for (var i = srcPos, j = destPos; i < length + srcPos; i++, j++) if (dest[j] !== undef) dest[j] = src[i];
        else throw "array index out of bounds exception";
      };
      p.reverse = function(array) {
        return array.reverse()
      };
      p.mix = function(a, b, f) {
        return a + ((b - a) * f >> 8)
      };
      p.peg = function(n) {
        return n < 0 ? 0 : n > 255 ? 255 : n
      };
      p.modes = function() {
        var ALPHA_MASK = 4278190080,
          RED_MASK = 16711680,
          GREEN_MASK = 65280,
          BLUE_MASK = 255,
          min = Math.min,
          max = Math.max;

        function applyMode(c1, f, ar, ag, ab, br, bg, bb, cr, cg, cb) {
          var a = min(((c1 & 4278190080) >>> 24) + f, 255) << 24;
          var r = ar + ((cr - ar) * f >> 8);
          r = (r < 0 ? 0 : r > 255 ? 255 : r) << 16;
          var g = ag + ((cg - ag) * f >> 8);
          g = (g < 0 ? 0 : g > 255 ? 255 : g) << 8;
          var b = ab + ((cb - ab) * f >> 8);
          b = b < 0 ? 0 : b > 255 ? 255 : b;
          return a | r | g | b
        }
        return {
          replace: function(c1, c2) {
            return c2
          },
          blend: function(c1, c2) {
            var f = (c2 & ALPHA_MASK) >>> 24,
              ar = c1 & RED_MASK,
              ag = c1 & GREEN_MASK,
              ab = c1 & BLUE_MASK,
              br = c2 & RED_MASK,
              bg = c2 & GREEN_MASK,
              bb = c2 & BLUE_MASK;
            return min(((c1 & ALPHA_MASK) >>> 24) + f, 255) << 24 | ar + ((br - ar) * f >> 8) & RED_MASK | ag + ((bg - ag) * f >> 8) & GREEN_MASK | ab + ((bb - ab) * f >> 8) & BLUE_MASK
          },
          add: function(c1, c2) {
            var f = (c2 & ALPHA_MASK) >>> 24;
            return min(((c1 & ALPHA_MASK) >>> 24) + f, 255) << 24 | min((c1 & RED_MASK) + ((c2 & RED_MASK) >> 8) * f, RED_MASK) & RED_MASK | min((c1 & GREEN_MASK) + ((c2 & GREEN_MASK) >> 8) * f, GREEN_MASK) & GREEN_MASK | min((c1 & BLUE_MASK) + ((c2 & BLUE_MASK) * f >> 8), BLUE_MASK)
          },
          subtract: function(c1, c2) {
            var f = (c2 & ALPHA_MASK) >>> 24;
            return min(((c1 & ALPHA_MASK) >>> 24) + f, 255) << 24 | max((c1 & RED_MASK) - ((c2 & RED_MASK) >> 8) * f, GREEN_MASK) & RED_MASK | max((c1 & GREEN_MASK) - ((c2 & GREEN_MASK) >> 8) * f, BLUE_MASK) & GREEN_MASK | max((c1 & BLUE_MASK) - ((c2 & BLUE_MASK) * f >> 8), 0)
          },
          lightest: function(c1, c2) {
            var f = (c2 & ALPHA_MASK) >>> 24;
            return min(((c1 & ALPHA_MASK) >>> 24) + f, 255) << 24 | max(c1 & RED_MASK, ((c2 & RED_MASK) >> 8) * f) & RED_MASK | max(c1 & GREEN_MASK, ((c2 & GREEN_MASK) >> 8) * f) & GREEN_MASK | max(c1 & BLUE_MASK, (c2 & BLUE_MASK) * f >> 8)
          },
          darkest: function(c1, c2) {
            var f = (c2 & ALPHA_MASK) >>> 24,
              ar = c1 & RED_MASK,
              ag = c1 & GREEN_MASK,
              ab = c1 & BLUE_MASK,
              br = min(c1 & RED_MASK, ((c2 & RED_MASK) >> 8) * f),
              bg = min(c1 & GREEN_MASK, ((c2 & GREEN_MASK) >> 8) * f),
              bb = min(c1 & BLUE_MASK, (c2 & BLUE_MASK) * f >> 8);
            return min(((c1 & ALPHA_MASK) >>> 24) + f, 255) << 24 | ar + ((br - ar) * f >> 8) & RED_MASK | ag + ((bg - ag) * f >> 8) & GREEN_MASK | ab + ((bb - ab) * f >> 8) & BLUE_MASK
          },
          difference: function(c1, c2) {
            var f = (c2 & ALPHA_MASK) >>> 24,
              ar = (c1 & RED_MASK) >> 16,
              ag = (c1 & GREEN_MASK) >> 8,
              ab = c1 & BLUE_MASK,
              br = (c2 & RED_MASK) >> 16,
              bg = (c2 & GREEN_MASK) >> 8,
              bb = c2 & BLUE_MASK,
              cr = ar > br ? ar - br : br - ar,
            cg = ag > bg ? ag - bg : bg - ag,
            cb = ab > bb ? ab - bb : bb - ab;
            return applyMode(c1, f, ar, ag, ab, br, bg, bb, cr, cg, cb)
          },
          exclusion: function(c1, c2) {
            var f = (c2 & ALPHA_MASK) >>> 24,
              ar = (c1 & RED_MASK) >> 16,
              ag = (c1 & GREEN_MASK) >> 8,
              ab = c1 & BLUE_MASK,
              br = (c2 & RED_MASK) >> 16,
              bg = (c2 & GREEN_MASK) >> 8,
              bb = c2 & BLUE_MASK,
              cr = ar + br - (ar * br >> 7),
              cg = ag + bg - (ag * bg >> 7),
              cb = ab + bb - (ab * bb >> 7);
            return applyMode(c1, f, ar, ag, ab, br, bg, bb, cr, cg, cb)
          },
          multiply: function(c1, c2) {
            var f = (c2 & ALPHA_MASK) >>> 24,
              ar = (c1 & RED_MASK) >> 16,
              ag = (c1 & GREEN_MASK) >> 8,
              ab = c1 & BLUE_MASK,
              br = (c2 & RED_MASK) >> 16,
              bg = (c2 & GREEN_MASK) >> 8,
              bb = c2 & BLUE_MASK,
              cr = ar * br >> 8,
              cg = ag * bg >> 8,
              cb = ab * bb >> 8;
            return applyMode(c1, f, ar, ag, ab, br, bg, bb, cr, cg, cb)
          },
          screen: function(c1, c2) {
            var f = (c2 & ALPHA_MASK) >>> 24,
              ar = (c1 & RED_MASK) >> 16,
              ag = (c1 & GREEN_MASK) >> 8,
              ab = c1 & BLUE_MASK,
              br = (c2 & RED_MASK) >> 16,
              bg = (c2 & GREEN_MASK) >> 8,
              bb = c2 & BLUE_MASK,
              cr = 255 - ((255 - ar) * (255 - br) >> 8),
              cg = 255 - ((255 - ag) * (255 - bg) >> 8),
              cb = 255 - ((255 - ab) * (255 - bb) >> 8);
            return applyMode(c1, f, ar, ag, ab, br, bg, bb, cr, cg, cb)
          },
          hard_light: function(c1, c2) {
            var f = (c2 & ALPHA_MASK) >>> 24,
              ar = (c1 & RED_MASK) >> 16,
              ag = (c1 & GREEN_MASK) >> 8,
              ab = c1 & BLUE_MASK,
              br = (c2 & RED_MASK) >> 16,
              bg = (c2 & GREEN_MASK) >> 8,
              bb = c2 & BLUE_MASK,
              cr = br < 128 ? ar * br >> 7 : 255 - ((255 - ar) * (255 - br) >> 7),
            cg = bg < 128 ? ag * bg >> 7 : 255 - ((255 - ag) * (255 - bg) >> 7),
            cb = bb < 128 ? ab * bb >> 7 : 255 - ((255 - ab) * (255 - bb) >> 7);
            return applyMode(c1, f, ar, ag, ab, br, bg, bb, cr, cg, cb)
          },
          soft_light: function(c1, c2) {
            var f = (c2 & ALPHA_MASK) >>> 24,
              ar = (c1 & RED_MASK) >> 16,
              ag = (c1 & GREEN_MASK) >> 8,
              ab = c1 & BLUE_MASK,
              br = (c2 & RED_MASK) >> 16,
              bg = (c2 & GREEN_MASK) >> 8,
              bb = c2 & BLUE_MASK,
              cr = (ar * br >> 7) + (ar * ar >> 8) - (ar * ar * br >> 15),
              cg = (ag * bg >> 7) + (ag * ag >> 8) - (ag * ag * bg >> 15),
              cb = (ab * bb >> 7) + (ab * ab >> 8) - (ab * ab * bb >> 15);
            return applyMode(c1, f, ar, ag, ab, br, bg, bb, cr, cg, cb)
          },
          overlay: function(c1, c2) {
            var f = (c2 & ALPHA_MASK) >>> 24,
              ar = (c1 & RED_MASK) >> 16,
              ag = (c1 & GREEN_MASK) >> 8,
              ab = c1 & BLUE_MASK,
              br = (c2 & RED_MASK) >> 16,
              bg = (c2 & GREEN_MASK) >> 8,
              bb = c2 & BLUE_MASK,
              cr = ar < 128 ? ar * br >> 7 : 255 - ((255 - ar) * (255 - br) >> 7),
            cg = ag < 128 ? ag * bg >> 7 : 255 - ((255 - ag) * (255 - bg) >> 7),
            cb = ab < 128 ? ab * bb >> 7 : 255 - ((255 - ab) * (255 - bb) >> 7);
            return applyMode(c1, f, ar, ag, ab, br, bg, bb, cr, cg, cb)
          },
          dodge: function(c1, c2) {
            var f = (c2 & ALPHA_MASK) >>> 24,
              ar = (c1 & RED_MASK) >> 16,
              ag = (c1 & GREEN_MASK) >> 8,
              ab = c1 & BLUE_MASK,
              br = (c2 & RED_MASK) >> 16,
              bg = (c2 & GREEN_MASK) >> 8,
              bb = c2 & BLUE_MASK;
            var cr = 255;
            if (br !== 255) {
              cr = (ar << 8) / (255 - br);
              cr = cr < 0 ? 0 : cr > 255 ? 255 : cr
            }
            var cg = 255;
            if (bg !== 255) {
              cg = (ag << 8) / (255 - bg);
              cg = cg < 0 ? 0 : cg > 255 ? 255 : cg
            }
            var cb = 255;
            if (bb !== 255) {
              cb = (ab << 8) / (255 - bb);
              cb = cb < 0 ? 0 : cb > 255 ? 255 : cb
            }
            return applyMode(c1, f, ar, ag, ab, br, bg, bb, cr, cg, cb)
          },
          burn: function(c1, c2) {
            var f = (c2 & ALPHA_MASK) >>> 24,
              ar = (c1 & RED_MASK) >> 16,
              ag = (c1 & GREEN_MASK) >> 8,
              ab = c1 & BLUE_MASK,
              br = (c2 & RED_MASK) >> 16,
              bg = (c2 & GREEN_MASK) >> 8,
              bb = c2 & BLUE_MASK;
            var cr = 0;
            if (br !== 0) {
              cr = (255 - ar << 8) / br;
              cr = 255 - (cr < 0 ? 0 : cr > 255 ? 255 : cr)
            }
            var cg = 0;
            if (bg !== 0) {
              cg = (255 - ag << 8) / bg;
              cg = 255 - (cg < 0 ? 0 : cg > 255 ? 255 : cg)
            }
            var cb = 0;
            if (bb !== 0) {
              cb = (255 - ab << 8) / bb;
              cb = 255 - (cb < 0 ? 0 : cb > 255 ? 255 : cb)
            }
            return applyMode(c1, f, ar, ag, ab, br, bg, bb, cr, cg, cb)
          }
        }
      }();

      function color$4(aValue1, aValue2, aValue3, aValue4) {
        var r, g, b, a;
        if (curColorMode === 3) {
          var rgb = p.color.toRGB(aValue1, aValue2, aValue3);
          r = rgb[0];
          g = rgb[1];
          b = rgb[2]
        } else {
          r = Math.round(255 * (aValue1 / colorModeX));
          g = Math.round(255 * (aValue2 / colorModeY));
          b = Math.round(255 * (aValue3 / colorModeZ))
        }
        a = Math.round(255 * (aValue4 / colorModeA));
        r = r < 0 ? 0 : r;
        g = g < 0 ? 0 : g;
        b = b < 0 ? 0 : b;
        a = a < 0 ? 0 : a;
        r = r > 255 ? 255 : r;
        g = g > 255 ? 255 : g;
        b = b > 255 ? 255 : b;
        a = a > 255 ? 255 : a;
        return a << 24 & 4278190080 | r << 16 & 16711680 | g << 8 & 65280 | b & 255
      }
      function color$2(aValue1, aValue2) {
        var a;
        if (aValue1 & 4278190080) {
          a = Math.round(255 * (aValue2 / colorModeA));
          a = a > 255 ? 255 : a;
          a = a < 0 ? 0 : a;
          return aValue1 - (aValue1 & 4278190080) + (a << 24 & 4278190080)
        }
        if (curColorMode === 1) return color$4(aValue1, aValue1, aValue1, aValue2);
        if (curColorMode === 3) return color$4(0, 0, aValue1 / colorModeX * colorModeZ, aValue2)
      }
      function color$1(aValue1) {
        if (aValue1 <= colorModeX && aValue1 >= 0) {
          if (curColorMode === 1) return color$4(aValue1, aValue1, aValue1, colorModeA);
          if (curColorMode === 3) return color$4(0, 0, aValue1 / colorModeX * colorModeZ, colorModeA)
        }
        if (aValue1) {
          if (aValue1 > 2147483647) aValue1 -= 4294967296;
          return aValue1
        }
      }
      p.color = function(aValue1, aValue2, aValue3, aValue4) {
        if (aValue1 !== undef && aValue2 !== undef && aValue3 !== undef && aValue4 !== undef) return color$4(aValue1, aValue2, aValue3, aValue4);
        if (aValue1 !== undef && aValue2 !== undef && aValue3 !== undef) return color$4(aValue1, aValue2, aValue3, colorModeA);
        if (aValue1 !== undef && aValue2 !== undef) return color$2(aValue1, aValue2);
        if (typeof aValue1 === "number") return color$1(aValue1);
        return color$4(colorModeX, colorModeY, colorModeZ, colorModeA)
      };
      p.color.toString = function(colorInt) {
        return "rgba(" + ((colorInt >> 16) & 255) + "," + ((colorInt >> 8) & 255) + "," + (colorInt & 255) + "," + ((colorInt >> 24) & 255) / 255 + ")"
      };
      p.color.toInt = function(r, g, b, a) {
        return a << 24 & 4278190080 | r << 16 & 16711680 | g << 8 & 65280 | b & 255
      };
      p.color.toArray = function(colorInt) {
        return [(colorInt >> 16) & 255, (colorInt >> 8) & 255, colorInt & 255, (colorInt >> 24) & 255]
      };
      p.color.toGLArray = function(colorInt) {
        return [((colorInt >> 16) & 255) / 255, ((colorInt >> 8) & 255) / 255, (colorInt & 255) / 255, ((colorInt & 4278190080) >>> 24) / 255]
      };
      p.color.toRGB = function(h, s, b) {
        h = h > colorModeX ? colorModeX : h;
        s = s > colorModeY ? colorModeY : s;
        b = b > colorModeZ ? colorModeZ : b;
        h = h / colorModeX * 360;
        s = s / colorModeY * 100;
        b = b / colorModeZ * 100;
        var br = Math.round(b / 100 * 255);
        if (s === 0) return [br, br, br];
        var hue = h % 360;
        var f = hue % 60;
        var p = Math.round(b * (100 - s) / 1E4 * 255);
        var q = Math.round(b * (6E3 - s * f) / 6E5 * 255);
        var t = Math.round(b * (6E3 - s * (60 - f)) / 6E5 * 255);
        switch (Math.floor(hue / 60)) {
        case 0:
          return [br, t, p];
        case 1:
          return [q, br, p];
        case 2:
          return [p, br, t];
        case 3:
          return [p, q, br];
        case 4:
          return [t, p, br];
        case 5:
          return [br, p, q]
        }
      };

      function colorToHSB(colorInt) {
        var red, green, blue;
        red = ((colorInt >> 16) & 255) / 255;
        green = ((colorInt >> 8) & 255) / 255;
        blue = (colorInt & 255) / 255;
        var max = p.max(p.max(red, green), blue),
          min = p.min(p.min(red, green), blue),
          hue, saturation;
        if (min === max) return [0, 0, max * colorModeZ];
        saturation = (max - min) / max;
        if (red === max) hue = (green - blue) / (max - min);
        else if (green === max) hue = 2 + (blue - red) / (max - min);
        else hue = 4 + (red - green) / (max - min);
        hue /= 6;
        if (hue < 0) hue += 1;
        else if (hue > 1) hue -= 1;
        return [hue * colorModeX, saturation * colorModeY, max * colorModeZ]
      }
      p.brightness = function(colInt) {
        return colorToHSB(colInt)[2]
      };
      p.saturation = function(colInt) {
        return colorToHSB(colInt)[1]
      };
      p.hue = function(colInt) {
        return colorToHSB(colInt)[0]
      };
      p.red = function(aColor) {
        return ((aColor >> 16) & 255) / 255 * colorModeX
      };
      p.green = function(aColor) {
        return ((aColor >> 8) & 255) / 255 * colorModeY
      };
      p.blue = function(aColor) {
        return (aColor & 255) / 255 * colorModeZ
      };
      p.alpha = function(aColor) {
        return ((aColor >> 24) & 255) / 255 * colorModeA
      };
      p.lerpColor = function(c1, c2, amt) {
        var r, g, b, a, r1, g1, b1, a1, r2, g2, b2, a2;
        var hsb1, hsb2, rgb, h, s;
        var colorBits1 = p.color(c1);
        var colorBits2 = p.color(c2);
        if (curColorMode === 3) {
          hsb1 = colorToHSB(colorBits1);
          a1 = ((colorBits1 >> 24) & 255) / colorModeA;
          hsb2 = colorToHSB(colorBits2);
          a2 = ((colorBits2 >> 24) & 255) / colorModeA;
          h = p.lerp(hsb1[0], hsb2[0], amt);
          s = p.lerp(hsb1[1], hsb2[1], amt);
          b = p.lerp(hsb1[2], hsb2[2], amt);
          rgb = p.color.toRGB(h, s, b);
          a = p.lerp(a1, a2, amt) * colorModeA;
          return a << 24 & 4278190080 | (rgb[0] & 255) << 16 | (rgb[1] & 255) << 8 | rgb[2] & 255
        }
        r1 = (colorBits1 >> 16) & 255;
        g1 = (colorBits1 >> 8) & 255;
        b1 = colorBits1 & 255;
        a1 = ((colorBits1 >> 24) & 255) / colorModeA;
        r2 = (colorBits2 >> 16) & 255;
        g2 = (colorBits2 >> 8) & 255;
        b2 = colorBits2 & 255;
        a2 = ((colorBits2 & 4278190080) >>> 24) / colorModeA;
        r = p.lerp(r1, r2, amt) | 0;
        g = p.lerp(g1, g2, amt) | 0;
        b = p.lerp(b1, b2, amt) | 0;
        a = p.lerp(a1, a2, amt) * colorModeA;
        return a << 24 & 4278190080 | r << 16 & 16711680 | g << 8 & 65280 | b & 255
      };
      p.colorMode = function() {
        curColorMode = arguments[0];
        if (arguments.length > 1) {
          colorModeX = arguments[1];
          colorModeY = arguments[2] || arguments[1];
          colorModeZ = arguments[3] || arguments[1];
          colorModeA = arguments[4] || arguments[1]
        }
      };
      p.blendColor = function(c1, c2, mode) {
        if (mode === 0) return p.modes.replace(c1, c2);
        else if (mode === 1) return p.modes.blend(c1, c2);
        else if (mode === 2) return p.modes.add(c1, c2);
        else if (mode === 4) return p.modes.subtract(c1, c2);
        else if (mode === 8) return p.modes.lightest(c1, c2);
        else if (mode === 16) return p.modes.darkest(c1, c2);
        else if (mode === 32) return p.modes.difference(c1, c2);
        else if (mode === 64) return p.modes.exclusion(c1, c2);
        else if (mode === 128) return p.modes.multiply(c1, c2);
        else if (mode === 256) return p.modes.screen(c1, c2);
        else if (mode === 1024) return p.modes.hard_light(c1, c2);
        else if (mode === 2048) return p.modes.soft_light(c1, c2);
        else if (mode === 512) return p.modes.overlay(c1, c2);
        else if (mode === 4096) return p.modes.dodge(c1, c2);
        else if (mode === 8192) return p.modes.burn(c1, c2)
      };

      p.binary = function(num, numBits) {
        var bit;
        if (numBits > 0) bit = numBits;
        else if (num instanceof Char) {
          bit = 16;
          num |= 0
        } else {
          bit = 32;
          while (bit > 1 && !(num >>> bit - 1 & 1)) bit--
        }
        var result = "";
        while (bit > 0) result += num >>> --bit & 1 ? "1" : "0";
        return result
      };
      p.unbinary = function(binaryString) {
        var i = binaryString.length - 1,
          mask = 1,
          result = 0;
        while (i >= 0) {
          var ch = binaryString[i--];
          if (ch !== "0" && ch !== "1") throw "the value passed into unbinary was not an 8 bit binary number";
          if (ch === "1") result += mask;
          mask <<= 1
        }
        return result
      };

      function nfCoreScalar(value, plus, minus, leftDigits, rightDigits, group) {
        var sign = value < 0 ? minus : plus;
        var autoDetectDecimals = rightDigits === 0;
        var rightDigitsOfDefault = rightDigits === undef || rightDigits < 0 ? 0 : rightDigits;
        var absValue = Math.abs(value);
        if (autoDetectDecimals) {
          rightDigitsOfDefault = 1;
          absValue *= 10;
          while (Math.abs(Math.round(absValue) - absValue) > 1.0E-6 && rightDigitsOfDefault < 7) {
            ++rightDigitsOfDefault;
            absValue *= 10
          }
        } else if (rightDigitsOfDefault !== 0) absValue *= Math.pow(10, rightDigitsOfDefault);
        var number, doubled = absValue * 2;
        if (Math.floor(absValue) === absValue) number = absValue;
        else if (Math.floor(doubled) === doubled) {
          var floored = Math.floor(absValue);
          number = floored + floored % 2
        } else number = Math.round(absValue);
        var buffer = "";
        var totalDigits = leftDigits + rightDigitsOfDefault;
        while (totalDigits > 0 || number > 0) {
          totalDigits--;
          buffer = "" + number % 10 + buffer;
          number = Math.floor(number / 10)
        }
        if (group !== undef) {
          var i = buffer.length - 3 - rightDigitsOfDefault;
          while (i > 0) {
            buffer = buffer.substring(0, i) + group + buffer.substring(i);
            i -= 3
          }
        }
        if (rightDigitsOfDefault > 0) return sign + buffer.substring(0, buffer.length - rightDigitsOfDefault) + "." + buffer.substring(buffer.length - rightDigitsOfDefault, buffer.length);
        return sign + buffer
      }
      function nfCore(value, plus, minus, leftDigits, rightDigits, group) {
        if (value instanceof Array) {
          var arr = [];
          for (var i = 0, len = value.length; i < len; i++) arr.push(nfCoreScalar(value[i], plus, minus, leftDigits, rightDigits, group));
          return arr
        }
        return nfCoreScalar(value, plus, minus, leftDigits, rightDigits, group)
      }
      p.nf = function(value, leftDigits, rightDigits) {
        return nfCore(value, "", "-", leftDigits, rightDigits)
      };
      p.nfs = function(value, leftDigits, rightDigits) {
        return nfCore(value, " ", "-", leftDigits, rightDigits)
      };
      p.nfp = function(value, leftDigits, rightDigits) {
        return nfCore(value, "+", "-", leftDigits, rightDigits)
      };
      p.nfc = function(value, leftDigits, rightDigits) {
        return nfCore(value, "", "-", leftDigits, rightDigits, ",")
      };
      var decimalToHex = function(d, padding) {
        padding = padding === undef || padding === null ? padding = 8 : padding;
        if (d < 0) d = 4294967295 + d + 1;
        var hex = Number(d).toString(16).toUpperCase();
        while (hex.length < padding) hex = "0" + hex;
        if (hex.length >= padding) hex = hex.substring(hex.length - padding, hex.length);
        return hex
      };
      p.hex = function(value, len) {
        if (arguments.length === 1) if (value instanceof Char) len = 4;
        else len = 8;
        return decimalToHex(value, len)
      };

      function unhexScalar(hex) {
        var value = parseInt("0x" + hex, 16);
        if (value > 2147483647) value -= 4294967296;
        return value
      }
      p.unhex = function(hex) {
        if (hex instanceof Array) {
          var arr = [];
          for (var i = 0; i < hex.length; i++) arr.push(unhexScalar(hex[i]));
          return arr
        }
        return unhexScalar(hex)
      };
      p.matchAll = function(aString, aRegExp) {
        var results = [],
          latest;
        var regexp = new RegExp(aRegExp, "g");
        while ((latest = regexp.exec(aString)) !== null) {
          results.push(latest);
          if (latest[0].length === 0)++regexp.lastIndex
        }
        return results.length > 0 ? results : null
      };
      p.match = function(str, regexp) {
        return str.match(regexp)
      };
      p.str = function(val) {
        if (val instanceof Array) {
          var arr = [];
          for (var i = 0; i < val.length; i++) arr.push(val[i].toString() + "");
          return arr
        }
        return val.toString() + ""
      };
      p.trim = function(str) {
        if (str instanceof Array) {
          var arr = [];
          for (var i = 0; i < str.length; i++) arr.push(str[i].replace(/^\s*/, "").replace(/\s*$/, "").replace(/\r*$/, ""));
          return arr
        }
        return str.replace(/^\s*/, "").replace(/\s*$/, "").replace(/\r*$/, "")
      };
      function booleanScalar(val) {
        if (typeof val === "number") return val !== 0;
        if (typeof val === "boolean") return val;
        if (typeof val === "string") return val.toLowerCase() === "true";
        if (val instanceof Char) return val.code === 49 || val.code === 84 || val.code === 116
      }
      p.parseBoolean = function(val) {
        if (val instanceof Array) {
          var ret = [];
          for (var i = 0; i < val.length; i++) ret.push(booleanScalar(val[i]));
          return ret
        }
        return booleanScalar(val)
      };
      p.parseByte = function(what) {
        if (what instanceof
        Array) {
          var bytes = [];
          for (var i = 0; i < what.length; i++) bytes.push(0 - (what[i] & 128) | what[i] & 127);
          return bytes
        }
        return 0 - (what & 128) | what & 127
      };
      p.parseChar = function(key) {
        if (typeof key === "number") return new Char(String.fromCharCode(key & 65535));
        if (key instanceof Array) {
          var ret = [];
          for (var i = 0; i < key.length; i++) ret.push(new Char(String.fromCharCode(key[i] & 65535)));
          return ret
        }
        throw "char() may receive only one argument of type int, byte, int[], or byte[].";
      };

      function floatScalar(val) {
        if (typeof val === "number") return val;
        if (typeof val === "boolean") return val ? 1 : 0;
        if (typeof val === "string") return parseFloat(val);
        if (val instanceof Char) return val.code
      }
      p.parseFloat = function(val) {
        if (val instanceof Array) {
          var ret = [];
          for (var i = 0; i < val.length; i++) ret.push(floatScalar(val[i]));
          return ret
        }
        return floatScalar(val)
      };

      function intScalar(val, radix) {
        if (typeof val === "number") return val & 4294967295;
        if (typeof val === "boolean") return val ? 1 : 0;
        if (typeof val === "string") {
          var number = parseInt(val, radix || 10);
          return number & 4294967295
        }
        if (val instanceof
        Char) return val.code
      }
      p.parseInt = function(val, radix) {
        if (val instanceof Array) {
          var ret = [];
          for (var i = 0; i < val.length; i++) if (typeof val[i] === "string" && !/^\s*[+\-]?\d+\s*$/.test(val[i])) ret.push(0);
          else ret.push(intScalar(val[i], radix));
          return ret
        }
        return intScalar(val, radix)
      };
      p.bezierPoint = function(a, b, c, d, t) {
        return (1 - t) * (1 - t) * (1 - t) * a + 3 * (1 - t) * (1 - t) * t * b + 3 * (1 - t) * t * t * c + t * t * t * d
      };
      p.bezierTangent = function(a, b, c, d, t) {
        return 3 * t * t * (-a + 3 * b - 3 * c + d) + 6 * t * (a - 2 * b + c) + 3 * (-a + b)
      };
      p.curvePoint = function(a, b, c, d, t) {
        return 0.5 * (2 * b + (-a + c) * t + (2 * a - 5 * b + 4 * c - d) * t * t + (-a + 3 * b - 3 * c + d) * t * t * t)
      };
      p.curveTangent = function(a, b, c, d, t) {
        return 0.5 * (-a + c + 2 * (2 * a - 5 * b + 4 * c - d) * t + 3 * (-a + 3 * b - 3 * c + d) * t * t)
      };
      p.millis = function() {
        return Date.now() - start;
      };
    })(context);

    return context;
};
