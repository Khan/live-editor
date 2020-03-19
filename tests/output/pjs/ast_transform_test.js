var cleanupCode = function(code) {
    var lines = code.split("\n").filter(function(line) {
        return line !== "";
    });

    var indent = lines[0].length - lines[0].trim().length;

    return lines.map(function(line) {
        return line.substring(indent);
    }).join("\n").trim();
};

describe("AST Transforms", function () {
    var transformCode = function(code) {
        var context = {
            ellipse: function() {},
            console: {
                log: function() {}
            },
            print: function() {},
            draw: function() {},
            mouseClicked: function() {}
        };

        var injector = new PJSCodeInjector({ processing: context });

        return injector.transformCode(code, context);
    };

    it("should handle 'for' loops with variable declarations", function () {
        var transformedCode = transformCode(getCodeFromOptions(function() {
            for (var i = 0; i < 10; i++) {
                ellipse(25 * i, 200, 50, 50);
            }
        }));

        var expectedCode = cleanupCode(getCodeFromOptions(function() {
            for (__env__.i = 0; __env__.i < 10; __env__.i++) {
                __env__.ellipse(25 * __env__.i, 200, 50, 50);
            }
        }));

        expect(transformedCode).to.equal(expectedCode);
    });

    it("should handle event handlers declared inside 'draw' properly", function () {
        var transformedCode = transformCode(getCodeFromOptions(function() {
            var draw = function() {
                var mouseClicked = function() {
                };
            };
        }));

        var expectedCode = cleanupCode(getCodeFromOptions(function() {
            __env__.draw = function () {
                var mouseClicked = function () {
                };
            };
        }));

        expect(transformedCode).to.equal(expectedCode);
    });

    it("should handle event handlers declared inside 'draw' (without var)", function () {
        var transformedCode = transformCode(getCodeFromOptions(function() {
            draw = function() {
                mouseClicked = function() {
                };
            };
        }));

        var expectedCode = cleanupCode(getCodeFromOptions(function() {
            __env__.draw = function () {
                __env__.mouseClicked = function () {
                };
            };
        }));

        expect(transformedCode).to.equal(expectedCode);
    });

    it("should handle built-in identifiers", function () {
        var transformedCode = transformCode(getCodeFromOptions(function() {
            var x = undefined;
            var y = Infinity;
            var z = NaN;
            var foo = function() {
                console.log(arguments);
            };
        }));

        var expectedCode = cleanupCode(getCodeFromOptions(function() {
            __env__.x = undefined;
            __env__.y = Infinity;
            __env__.z = NaN;
            __env__.foo = function () {
                __env__.console.log(arguments);
            };
        }));

        expect(transformedCode).to.equal(expectedCode);
    });

    it("should handle variable declarations with multiple declarators", function () {
        var transformedCode = transformCode(getCodeFromOptions(function() {
            print("hello");
            var x = 5, y = 10, z;
            print("goodbye");
        }));

        var expectedCode = cleanupCode(getCodeFromOptions(function() {
            __env__.print('hello');
            __env__.x = 5;
            __env__.y = 10;
            __env__.print('goodbye');
        }));

        expect(transformedCode).to.equal(expectedCode);
    });

    it("should handle multiple declarators in a 'for' statement", function () {
        var transformedCode = transformCode(getCodeFromOptions(function() {
            for (var i = 0, j = 0; i * j < 100; i++, j++) {
                print("i = " + i + ", j = " + j);
            }
        }));

        var expectedCode = cleanupCode(getCodeFromOptions(function() {
            for (__env__.i = 0, __env__.j = 0; __env__.i * __env__.j < 100; __env__.i++, __env__.j++) {
                __env__.print('i = ' + __env__.i + ', j = ' + __env__.j);
            }
        }));

        expect(transformedCode).to.equal(expectedCode);
    });

    it("should handle draw loop functions inside 'draw' properly", function () {
        var transformedCode = transformCode(getCodeFromOptions(function() {
            var draw = function() {
                var x = 5, mouseClicked = function () {}, y = 10;
            };
        }));

        var expectedCode = cleanupCode(getCodeFromOptions(function() {
            __env__.draw = function () {
                var x = 5;
                var mouseClicked = function () {
                };
                var y = 10;
            };
        }));

        expect(transformedCode).to.equal(expectedCode);
    });

    it("should handle methods in local scopes with the same names event handlers", function() {
        var transformedCode = transformCode(getCodeFromOptions(function() {
            var draw = function() {
                var mouseClicked = function() {

                };
                var test = function() {
                    mouseClicked = function() {
                        println('If this ever prints: Bad times!');
                    };
                };
            };
        }));

        var expectedCode = cleanupCode(getCodeFromOptions(function() {
            __env__.draw = function () {
                var mouseClicked = function () {
                };
                var test = function () {
                    mouseClicked = function () {
                        println('If this ever prints: Bad times!');
                    };
                };
            };
        }));

        expect(transformedCode).to.equal(expectedCode);
    });

    it("should handle variable declarations inside a 'for-in' statement", function () {
        var transformedCode = transformCode(getCodeFromOptions(function() {
            var obj = {
                a: 1,
                b: 2,
                c: 3
            };
            for (var i in obj) {
                print(i);
            }
        }));

        var expectedCode = cleanupCode(getCodeFromOptions(function() {
            __env__.obj = {
                a: 1,
                b: 2,
                c: 3
            };
            for (__env__.i in __env__.obj) {
                __env__.print(__env__.i);
            }
        }));

        expect(transformedCode).to.equal(expectedCode);
    });

    it("should prefix functions declared inside of 'switch/case' statements with '__env__'", function() {
        var transformedCode = transformCode(getCodeFromOptions(function() {
            var a = 0;
            switch (a) {
                case 0:
                    var myFunc = function () {
                        print('Hello, world!');
                    };

                    myFunc();
                    break;
                default:
                    break;
            }
        }));

        var expectedCode = cleanupCode(getCodeFromOptions(function() {
            __env__.a = 0;
            switch (__env__.a) {
            case 0:
                __env__.myFunc = function () {
                    __env__.print('Hello, world!');
                };

                __env__.myFunc();
                break;
            default:
                break;
            }
        }));

        expect(expectedCode).to.equal(transformedCode);
    });

    it("should substitute all 'NewExpression's with 'CallExpression's to '__env__.PJSCodeInjector.applyInstance'", function() {
        var transformedCode = transformCode(getCodeFromOptions(function() {
            var Obj = function (prop) {
                this.prop = prop;
            };

            var myInstance = new Obj(1);
        }));

        var expectedCode = cleanupCode(getCodeFromOptions(function() {
            __env__.Obj = function (prop) {
                this.prop = prop;
            };

            __env__.myInstance = __env__.PJSCodeInjector.applyInstance(__env__.Obj, 'Obj')(1);
        }));
    });

    it("should not prefix function parameters when substituting 'NewExpression's with 'CallExpression's", function() {
        var transformedCode = transformCode(getCodeFromOptions(function() {
            var myObj = function () {

            };

            var makeObj = function (obj) {
                return new obj();
            };

            var myInstance = makeObj(myObj);
        }));

        var expectedCode = cleanupCode(getCodeFromOptions(function() {
            __env__.myObj = function () {

            };

            __env__.makeObj = function (obj) {
                return __env__.PJSCodeInjector.applyInstance(obj, 'obj')();
            };

            __env__.myInstance = __env__.makeObj(__env__.myObj);
        }));
    });

    it("should handle function variables", function () {
        var transformedCode = transformCode(getCodeFromOptions(function() {
            var outerFunc = function(x, y) {
                var innerFunc = function (x, y) {
                    ellipse(x, y);
                };
                rect(x, y, 167, 137);
                innerFunc(10, y + 10);
            };
            outerFunc(5, 15);
        }));

        var expectedCode = cleanupCode(getCodeFromOptions(function() {
            __env__.outerFunc = function (x, y) {
                var innerFunc = function (x, y) {
                    __env__.ellipse(x, y);
                };
                rect(x, y, 167, 137);
                innerFunc(10, y + 10);
            };
            __env__.outerFunc(5, 15);
        }));

        expect(transformedCode).to.equal(expectedCode);
    });

    it("should rewrite function declarations", function () {
        var transformedCode = transformCode(getCodeFromOptions(function() {
            function outerFunc(x, y) {
                rect(x, y, 167, 137);
            }
            outerFunc(10, 20);
        }));

        var expectedCode = cleanupCode(getCodeFromOptions(function() {
            __env__.outerFunc = function (x, y) {
                rect(x, y, 167, 137);
            };
            __env__.outerFunc(10, 20);
        }));

        expect(transformedCode).to.equal(expectedCode);
    });

    it("should rewrite nested function declarations", function () {
        var transformedCode = transformCode(getCodeFromOptions(function() {
            function outerFunc(x, y) {
                function innerFunc(x, y) {
                    ellipse(x, y, 16, 13);
                }
                rect(x, y, 167, 137);
                innerFunc(102, 88);
            }
            outerFunc(10, 20);
        }));

        var expectedCode = cleanupCode(getCodeFromOptions(function() {
            __env__.outerFunc = function (x, y) {
                var innerFunc = function (x, y) {
                    __env__.ellipse(x, y, 16, 13);
                };
                rect(x, y, 167, 137);
                innerFunc(102, 88);
            };
            __env__.outerFunc(10, 20);
        }));

        expect(transformedCode).to.equal(expectedCode);
    });
});

describe("AST Transforms for exporting", function() {
    var transformCode = function(code) {
        var canvas = document.createElement('canvas');
        var processing = new Processing(canvas);
        var injector = new PJSCodeInjector({
            processing: processing,
            sandboxed: false });

        return injector.transformCode(code, processing);
    };

    var exportCode = function(code) {
        var canvas = document.createElement('canvas');
        var processing = new Processing(canvas);
        var injector = new PJSCodeInjector({
            processing: processing,
            sandboxed: false,
            envName: "p"  // TODO(kevinb) make this an option to transformCode
        });

        var imageDir = "../../../build/images/";
        var soundDir = "../../../sounds/";
        return injector.exportCode(code, imageDir, soundDir);
    };

    beforeEach(function() {
        sinon.spy(console, "log");
    });

    afterEach(function() {
        console.log.restore();
    });

    it("should not prefix built-in globals'", function() {
        var transformedCode = transformCode(getCodeFromOptions(function() {
            var x = Math.cos(30);
            var y = Math.sin(30);
            var obj = Object.create(null);
            var array = [];
            if (Array.isArray(array)) {
                array.push(obj);
            }
            var str = String.fromCharCode(65);
        }));

        var expectedCode = cleanupCode(getCodeFromOptions(function() {
            __env__.x = Math.cos(30);
            __env__.y = Math.sin(30);
            __env__.obj = Object.create(null);
            __env__.array = [];
            if (Array.isArray(__env__.array)) {
                __env__.array.push(__env__.obj);
            }
            __env__.str = String.fromCharCode(65);
        }));

        expect(expectedCode).to.equal(transformedCode);
    });

    it("should work with code that uses images", function() {
        var exportedCode = exportCode(getCodeFromOptions(function() {
            background(0,128,255);
            var img = getImage("avatars/leafers-seed");
            image(img, 100, 100);
        }));

        expect(function() {
            var func = new Function(exportedCode);
            func();
        }).to.not.throwException();
    });

    it("should work with code that uses sounds", function() {
        var exportedCode = exportCode(getCodeFromOptions(function() {
            var snd = getSound("rpg/metal-clink");
            playSound(snd);
        }));

        expect(function() {
            var func = new Function(exportedCode);
            func();
        }).to.not.throwException();
    });

    it("should automatically loop when a 'draw' method exists", function(done) {
        var exportedCode = exportCode(getCodeFromOptions(function() {
            var Dot = function(x,y) {
                this.x = x;
                this.y = y;
                this.color = color(random(255), random(255), random(255));
            };
            Dot.prototype.draw = function() {
                fill(this.color);
                ellipse(this.x, this.y, 100, 100);
            };
            Dot.prototype.update = function() {
                this.x += random(-1, 1);
                this.y += random(-1, 1);
            };
            var dots = [];
            for (var i = 0; i < 10; i++) {
                dots.push(new Dot(random(400), random(400)));
            }
            var drawCount = 0;
            draw = function() {
                background(255);
                for (var i = 0; i < dots.length; i++) {
                    dots[i].update();
                    dots[i].draw();
                }
                console.log('draw');
                drawCount++;
                if (drawCount > 5) {
                    noLoop();
                }
            };
        }));

        var func = new Function(exportedCode);
        func();

        setTimeout(function() {
            expect(console.log.callCount > 2).to.be(true);
            done();
        }, 1000);
    });
});
