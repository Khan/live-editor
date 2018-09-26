/* global ellipse, getImage, image, background, loadImage, requestImage */
/* global text, color, textFont, fill, text, background, createFont, PVector */
/* global externals, exp, link, width, draw, mouseMoved, Program */
import PJSCodeInjector from "../../../js/output/pjs/pjs-code-injector.js";
import ScratchpadConfig from "../../../js/shared/config.js";

import {failingTest, supportsMpegAudio, runTest, test} from "./test_utils.js";

describe("Version test", function() {
    it("should use version 4 or greater", function() {
        var config = new ScratchpadConfig({});
        expect(config.latestVersion()).to.be(4);
    });
});

// Test the lower level functions in Output
describe("Scratchpad CanvasOutput functions", function() {
    it("stringifyArray", function() {
        var undefArray = PJSCodeInjector.stringifyArray([undefined, undefined]);
        expect(undefArray).to.be.equal("undefined, undefined");
        var primArray = PJSCodeInjector.stringifyArray([1, "A"]);
        expect(primArray).to.be.equal("1, \"A\"");
    });

});

// TODO(kevinb) split into smaller subsuites
describe("Scratchpad Output Exec", function() {
    test("Make sure instances are serialized properly", function() {
        var myObj = { innerObj: {} };
        myObj.innerObj.myConstructor = function() {};

        var myInstance = new myObj.innerObj.myConstructor();
    });

    test("Color modes", function() {
        color(255, 0, 0);
    });

    test("Draw Ellipse", function() {
        ellipse(100, 100, 100, 100);
    });

    test("getImage with single quotes or double quotes", function() {
        getImage('avatars/leaf-yellow');
        getImage("avatars/leaf-green");
    });

    // This test requires commercial codecs
    if (supportsMpegAudio()) {
        test("getSound with single quotes or double quotes", function() {
            getSound('rpg/giant-no');
            getSound("rpg/giant-no");
        });

        test("getSound with computed string", function() {
            getSound('rpg/' + 'giant-no');
        });
    }

    // Check the actual contents of error message
    failingTest("Use object as function", function() {
        var SmileyFace = function() {};
        var face = new SmileyFace();
        face("hi");
    },
    null,
    [{column: 0}]);

    failingTest("JSHint Error", "ellipse(x, 100, 100, 100);");

    failingTest(
        "KAInfiniteLoopCount is not allowed",
        "KAInfiniteLoopCount = 0;"
    );

    failingTest(
        "KAInfiniteLoopSetTimeout is not allowed",
        "KAInfiniteLoopSetTimeout(1000);"
    );

    failingTest(
        "KAInfiniteLoopProtect is not allowed",
        "KAInfiniteLoopProtect();"
    );

    failingTest(
        "props on __env__ cannot be accessed directly",
        "__env__.fill = function() { debug('foo'); }"
    );

    failingTest(
        "__env__ cannot be replaced",
        "__env__ = {};"
    );

    failingTest(
        "__env__ cannot be declared",
        "var __env__ = {};"
    );

    failingTest(
        "generates an error for numbers prefixed by a 0",
        "ellipse(09,10,11,12);"
    );

    test("Looping (with Processing.js Built-in Functions)", function() {
        var go = function() {
            while (true) {
                var p = exp(0);
                if (0 < p) {
                    return;
                }
            }
        };

        go();
        background(105, 171, 74);
    });

    test("Declaring an uninitialized variable in 1st expression of for loop", function() {
        for (var i = 0, j; i < 10; i++) {}
    });

    test("for loop with variable declaration", function() {
        for (var i = 0; i < 10; i++) {
            ellipse(25 * i, 200, 50, 50);
        }
    });

    test("try-catch", function() {
        try {
            throw "hello";
        } catch(e) {
            debug(e);
        }
    });

    test("arguments special object/array", function() {
        var foo = function() {
            var x = arguments[0];
            var y = arguments[1];
            ellipse(x,y,100,100);
        };

        foo(200,200);
    });

    runTest({
        title: "inner scope variables supercede global variables",
        code: function() {
            var foo = 5;
            var bar = function() {
                var foo = 10;
                Program.assertEqual(foo, 10);
            };
            bar();
        },
        errors: [],
        assertions: []
    });

    failingTest("Too Many Draw Operations", function() {
        for (var i = 0; i < 1000000; i++) {
            ellipse(100, 100, 100, 100);
        }
    });

    test("getImage with wonky spacing", function() {
        var img = getImage( "cute/Blank" );

        var draw = function() {
            image( img, 0, 0);
        };
    });

    test("getImage with Draw Loop", function() {
        var img = getImage("cute/Blank");

        var draw = function() {
            image(img, 0, 0);
        };
    });

    test("getImage Inside Sub-Object", function() {
        var enemies = [{
            test: getImage("cute/Blank")
        }];

        var draw = function() {
            var img = enemies[0].test;
            image(img, 100, 100);
        };
    });

    test("getImage Inside Object", function() {
        var imageMap = {
            0: getImage("cute/Blank")
        };

        var draw = function() {
            image(imageMap[0], 10, 10);
        };
    });

    test("getImage with computed string", function() {
        var img = getImage("cute/" + "Blank" );
        image(img, 0, 0);
    });

    test("for-in loop with variable declaration", function() {
        var obj = { a: 1, b: 2, c: 3 };
        for (var i in obj) {
            println(obj);
        }
    });

    failingTest("getImage with simple string", function () {
        var toolbox = getImage("toolbox");

        image(toolbox, 0, 0);
    });

    failingTest("getImage with data: URL", function() {
        var sal = getImage("data:image/gif;base64,R0lGODlhAQABAIAAAP///////yH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==");

        image(sal, 0, 0);
    });

    failingTest("loadImage with data: URL", function() {
        var sal = loadImage("data:image/gif;base64,R0lGODlhAQABAIAAAP///////yH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==");

        image(sal, 0, 0);
    });

    failingTest("requestImage with data: URL", function() {
        var sal = requestImage("data:image/gif;base64,R0lGODlhAQABAIAAAP///////yH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==");

        image(sal, 0, 0);
    });

    failingTest("getImage with a remote URL", function() {
        var rock = getImage("http://upload.wikimedia.org/wikipedia/commons/thumb/7/7e/Rock-paper-scissors_%28rock%29.png/100px-Rock-paper-scissors_%28rock%29.png");

        image(rock, 0, 0);
    });

    failingTest("loadImage with a remote URL", function() {
        var rock = getImage("http://upload.wikimedia.org/wikipedia/commons/thumb/7/7e/Rock-paper-scissors_%28rock%29.png/100px-Rock-paper-scissors_%28rock%29.png");

        image(rock, 0, 0);
    });

    failingTest("requestImage with a remote URL", function() {
        var rock = getImage("http://upload.wikimedia.org/wikipedia/commons/thumb/7/7e/Rock-paper-scissors_%28rock%29.png/100px-Rock-paper-scissors_%28rock%29.png");

        image(rock, 0, 0);
    });

    failingTest("getSound with no string", function () {
        var s = getSound("");

        playSound(s);
    });

    failingTest("link method disabled", function() {
        link("http://google.com/", "_blank");
    });

    failingTest(".location disabled", function() {
        var window = (function() { return this; })();
        window.location.href = "http://google.com/";
    });

    failingTest("top.location disabled", function() {
        var window = (function() { return this; })();
        window.top.location.href = "http://google.com/";
    });

    failingTest(".document disabled", function() {
        var window = (function() { return this; })();
        window.document.getElementsByTagName("div");
    });

    failingTest(".ownerDocument disabled", function() {
        var document = externals.processing.ownerDocument;
        document.getElementsByTagName("div");
    });

    failingTest(".createElement disabled", function() {
        externals.processing.ownerDocument.createElement("img");
    });

    failingTest("externals disabled", function() {
        var d = externals.processing.ownerDocument;
        var a = d.createElement("audio");
        a.src = "http://www.w3schools.com/html5/horse.ogg";
        a.autoplay = 'true';
    });


    test("createFont Inside Sub-Object", function() {
        var test = [{
            test: createFont("fantasy", 20)
        }];

        var draw = function() {
            background(255, 255, 255);
            ellipse(100,100,100,100);
            textFont(test[0].test, 20);
            fill(255, 0, 0);
            text("Hello", 208, 100);
        };
    });

    test("Object Insertion", function() {
        var obj = {
            test: {
                blah: true
            }
        };

        var draw = function() {
            if (obj.test.blah) {
                ellipse(100, 100, 100, 100);
            }
        };
    });

    test("Function Insertion", function() {
        var Class = function(a) {
            this.thing = a;
        };

        Class.test = function() {
            ellipse(100, 100, 100, 100);
        };

        Class.prototype.method = function() {
            ellipse(100, 100, 100, 100);
        };

        var draw = function() {
            var c = new Class("test");
            c.method();
            Class.test();
        };
    });

    test("Function Insertion with Global Instance", function() {
        var Class = function(a) {
            this.thing = a;
        };

        Class.test = function() {
            ellipse(100, 100, 100, 100);
        };

        Class.prototype.method = function() {
            ellipse(100, 100, 100, 100);
        };

        var c = new Class("test");

        var draw = function() {
            c.method();
            Class.test();
        };
    });

    test("Verify that toSting Works", function() {
        var num = 50;
        num = parseInt(num.toString(), 10);
    });

    test("Object.create Works", function() {
        var obj = Object.create({});
        obj.test = true;
    });

    test("new RegExp() Work", function() {
        var re = new RegExp("test");
        re.test("hello test");
    });

    test("PVector constructor works", function() {
        var Particle = function(x, y){
            this.pos = new PVector(x, y);
            this.v = new PVector(10, 10);
            this.a = new PVector(0, 0);
            this.b = new PVector();
        };
        var p = new Particle(10, 10);
    });

    test("PVector methods work", function() {
        var v1 = new PVector(40, 20);
        var v2 = new PVector(25, 50);

        v1.normalize();

        ellipse(v1.x, v1.y, 12, 12);
        ellipse(v2.x, v2.y, 66, 39);

        v2.add(v1);

        ellipse(v2.x, v2.y, 89, 118);

        // Make sure methods that use Processing methods also work
        PVector.angleBetween(v1, v2);
    });

    test("PVector passed as an argument", function() {
        var Particle = function(position) {
            var p = position.get();
        };

        var origin = new PVector(200, 40);
        var particle = new Particle(origin);

        var draw = function() {
            ellipse(100, 100, 100, 100);
        };
    });

    test("Array constructor works", function() {
        var arr = new Array(10);

        var pad = function(n, width, z) {
          z = z || '0';
          n = n + '';
          return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n;
        };
        pad(7, 3);
    });

    test("Math object works", function() {
        var newVal = (Math.abs(-5));
    });

    test("String object works", function() {
        var letter = String.fromCharCode(65);
    });

    test("Number object works", function() {
        var newVal = Number.isFinite(1/0);
    });

    test("Date object works", function() {
        var newDate = Date.now();
    });

    test("Processing's parseFloat, parseInt work", function() {
        var settings = {};
        var val = parseInt(settings.val, 10) || 13;

        settings.val = 10;
        var val2 = parseInt(settings.val, 10) || 13;
    });

    test("Strings aren't replaced", function() {
        if ("Happy new year" !== "Happy new" + " year") {
            throw new Error("Happy new" + " year");
        }

        if ("Happy new Year" !== "Happy new" + " Year") {
            throw new Error("Happy new" + " Year");
        }

        if ("Happy new year(" !== "Happy new" + " year(") {
            throw new Error("Happy new" + " year(");
        }

        if ("Happy new year()" !== "Happy new" + " year()") {
            throw new Error("Happy new" + " year()");
        }

        if ("Happynew Year()" !== "Happynew" + " Year()") {
            throw new Error("Happynew" + " Year()");
        }
    });

    test("Make sure instances are serialized properly", function() {
        var Tile = function(pic) {
            this.pic = pic;
        };

        Tile.prototype.drawFaceUp = function() {
            image(this.pic, 10, 10);
        };

        var tiles = [];
        tiles.push(new Tile(getImage("creatures/Winston")));

        var draw = function() {
            tiles[0].drawFaceUp();
        };
    }, function() {
        var Tile = function(pic) {
            this.pic = pic;
        };

        Tile.prototype.drawFaceUp = function() {
            image(this.pic, 10, 10);
        };

        var tiles = [];
        tiles.push(new Tile(getImage("creatures/Winston")));

        var draw = function() {
            background(0, 0, 255);
            tiles[0].drawFaceUp();
        };
    });

    test("Make sure object serialization works in injection", function() {
        var winston = {
          age: 19,
          birthdate: {
              month: 12
          }
        };
        text("Winston is " + winston + " years old", 10, 50);

    },
    function() {
        var winston = {
          age: 19,
          birthdate: {
              month: 12
          }
        };
        text("Winston is " + winston + " years old", 10, 50);

    });

    test("Make sure object with PImage works in injection", function() {
        var myObj = {
            x: 5,
            img: getImage("creatures/OhNoes")
        };
        var draw = function() {
            myObj.x += 2;
            image(myObj.img, myObj.x, 0); // <-- Remove this semicolon and add it back!
        };

    },
    function() {
        var myObj = {
            x: 5,
            img: getImage("creatures/OhNoes")
        };
        var draw = function() {
            myObj.x += 2;
            image(myObj.img, myObj.x, 0); // <-- Remove this semicolon and add it back!
        };

    });

    runTest({
        title: "Make sure methods on objects returned by createGraphics work",
        code: function() {
            var img = getImage("avatars/leafers-seedling");

            var gfx = createGraphics(400, 400, 1);
            gfx.image(img, 0, 0);

            var draw = function() {
                image(gfx, 10, 0);
            };
        }
    });

    // This test requires commercial codecs
    if (supportsMpegAudio()) {
        test("Make sure object with getSound works in injection", function () {
                var myObj = {
                    x: 5,
                    sound: getSound("rpg/giant-no")
                };
                var mousePressed = function () {
                    myObj.x += 2;
                    playSound(myObj.sound);
                };

            },
            function () {
                var myObj = {
                    x: 5,
                    sound: getSound("rpg/giant-no")
                };
                var mousePressed = function () {
                    myObj.x += 2;
                    playSound(myObj.sound);
                };
            });
    }

    test("Make sure externals works in injection", function() {
        var externals;
    },
    function() {
        var externals;
    });

    test("Make sure draw method is reset", function() {
        var count = 0;

        var draw = function() {
            count += 1;
        };
    }, function() {
        var count = 0;

        var xdraw = function() {
            count += 1;
        };

        if (typeof draw === "function") {
            draw();
            if (count > 0) {
                throw new Error("draw not replaced");
            }
        }
    });

    /* This test makes sure that we actually delete the mouseClicked
      definition after they've deleted it. We can't do the simple thing
      and call mouseClicked() directly, because doing so will register
      mouseClick as a global and replace it anyway. We have to simulate the
      actual path the code will take in this situation by simulating a click on
      the canvas outside of the program itself.*/
    runTest({
        title: "Make sure mouse events are reset",
        code: function() {
            var currentLocation = 0;

            var mouseClicked = function() {
                fill(255, 0, 0);
                rect(currentLocation, 0, 10, 10);
                currentLocation += 10;
                var fillC = get(20, 1);
                if (fillC < -1) {
                    throw new Error("mouseClicked not replaced");
                }
            };
        },
        code2: function() {
            var currentLocation = 0;

            var xmouseClicked = function() {

            };
        },
        simulateClick: true,
        errors: []
    });

    /**
     * This makes sure that when you have objects, the scope of
     * closures and with statements are not lost during the code
     * injection phase.
     */
    runTest({
        title: "Make sure prototype function scope is preserved",
        code: function() {
            var x = function() {
            };

            x.prototype = {
                d: function() {
                    println("ok2");
                },
                z: function() {
                    this.y = 3;
                },
                r: function() {
                    println("ok");
                }
            };

            var m = new x();
            var draw = function() {
                m.d();
            };

            m.r();
            m.z();

        },
        code2: function() {
            var x = function() {
            };

            x.prototype = {
                d: function() {
                    println("ok2");
                },
                z: function() {
                    this.y = 4;//changed
                },
                r: function() {
                    println("ok");
                }
            };

            var m = new x();
            var draw = function() {
                m.d();
            };

            m.r();
            m.z();
        },
        errors: []
    });



    /**
     * This makes sure that for injected function calls (in this case
     * textFont), if it has an object argument passed to it, then that
     * argument preserves its prototype chain (In this case PFont).
     */
    runTest({
        title: "Make sure function call arguments preserve prototype chain",
        code: function() {
            textFont(createFont("monospace"));
            var draw = function() {
                background(255, 255, 255);
                fill(255, 0, 0);
                textSize(16);
                textAlign(CENTER, CENTER);
                text("Hi!", 91, 200);
            };
        },
        code2: function() {
            textFont(createFont("monospace"));
            var draw = function() {
                background(255, 255, 255);
                fill(255, 0, 0);
                textSize(16);
                textAlign(CENTER, CENTER);
                text("Hi!", 9, 200);//changed
            };
        },
        errors: []
    });

    runTest({
        title: "Program functions exist",
        code: function() {
            Program.settings();
            Program.restart();
            Program.runTests(function() {});
            Program.restart();
        },
        errors: [],
        // p.Program methods weren't being stubbed and were causing some of the
        // test code to be run in an infinite loop after the it() block had
        // completed.
        setup: function(output) {
            var p = output.output.processing;
            sinon.stub(p.Program, "settings");
            sinon.stub(p.Program, "restart");
            sinon.stub(p.Program, "runTests");
        },
        teardown: function(output) {
            var p = output.output.processing;
            expect(p.Program.settings.calledWith()).to.be(true);
            expect(p.Program.restart.calledWith()).to.be(true);
            expect(p.Program.runTests.calledWith()).to.be(true);
        }
    });

    runTest({
        title: "Program.assertEqual() sets assertions",
        code: function() {
            Program.assertEqual(2, 4);
        },
        code2: function() {
            Program.assertEqual(2, 2);
        },
        errors: [],
        assertions: [{
            "row":0,"column":0,
            "text": "Assertion failed: 2 is not equal to 4."}],
        assertions2: []
    });

    runTest({
        title: "Program.assertEqual() returns correct line number inside functions",
        code: function() {
            var foo = function () {
                Program.assertEqual(2, 4);
            };
            foo();
        },
        code2: function() {
            var foo = function () {
                Program.assertEqual(2, 2);
            };
            foo();
        },
        errors: [],
        assertions: [{
            "row":2,"column":4,
            "text": "Assertion failed: 2 is not equal to 4."}],
        assertions2: []
    });

    // This test should not use a variable that is defined in another test
    // TODO(kevinb) prevent persistent state between tests
    runTest({
        title: "hoisting should work",
        code: function() {
            var foo = function() {
                var bar = function() {
                    return b;
                };
                var b = 5;
                return bar;
            };

            Program.assertEqual(foo()(), 5);
        },
        errors: [],
        assertions: []
    });

    runTest({
        title: "local variables in closure of global draw should update",
        code: function() {
            (function () {
                var radius = 100;
                draw = function() {
                    ellipse(200,200,2*radius,2*radius);
                };
            })();
        },
        code2: function() {
            (function () {
                var radius = 50;
                draw = function() {
                    ellipse(200,200,2*radius,2*radius);
                };
            })();
        }
    });

    /**
     * Some calls do not currently work within workers.
     * For example createGraphics creates a whole new Processing
     * env for the object which we don't support within a worker.
     */
    runTest({
        title: "Calls which do not work within workers run",
        code: function() {
            var osb = createGraphics(30, 30, JAVA2D);
            osb.beginDraw();
        },
        errors: []
    });

    runTest({
        title: "Modifying globals updates the draw loop",
        code: function() {
            var r = 100;
            var c = color(255,0,0);
            var draw = function() {
                background(255);
                fill(c);
                ellipse(200, 200, r, r);
            };
        },
        code2: function () {
            var r = 200;
            var c = color(255,255,0);
            var draw = function() {
                background(255);
                fill(c);
                ellipse(200, 200, r, r);
            };
        },
        setup: function(output) {
            var p = output.output.processing;
            sinon.stub(p, "fill");
            sinon.stub(p, "ellipse");
        },
        teardown: function(output) {
            var p = output.output.processing;
            var red = p.color(255,0,0);
            var yellow = p.color(255,255,0);
            expect(p.fill.calledWith(red)).to.be(true);
            expect(p.fill.calledWith(yellow)).to.be(true);
            expect(p.fill.calledWith(0)).to.be(false);
            expect(p.ellipse.calledWith(200,200,100,100)).to.be(true);
            expect(p.ellipse.calledWith(200,200,200,200)).to.be(true);
            p.fill.restore();
            p.ellipse.restore();
        },
        wait: 500
    });

    runTest({
        // https://github.com/Khan/live-editor/issues/235
        title: "Modifying properties of globals doesn't clobber color properties",
        code: function() {
            var foo = { c:color(255, 0, 0), r:100 };
            var draw = function() {
                background(255);
                fill(foo.c);
                ellipse(200, 200, foo.r, foo.r);
            };
        },
        code2: function () {
            var foo = { c:color(255, 0, 0), r:200 };
            var draw = function() {
                background(255);
                fill(foo.c);
                ellipse(200, 200, foo.r, foo.r);
            };
        },
        setup: function(output) {
            var p = output.output.processing;
            sinon.stub(p, "fill");
            sinon.stub(p, "ellipse");
        },
        teardown: function(output) {
            var p = output.output.processing;
            var red = p.color(255,0,0);
            expect(p.fill.calledWith(red)).to.be(true);
            expect(p.fill.calledWith(0)).to.be(false);
            expect(p.ellipse.calledWith(200,200,100,100)).to.be(true);
            expect(p.ellipse.calledWith(200,200,200,200)).to.be(true);
            p.fill.restore();
            p.ellipse.restore();
        },
        wait: 100
    });

    runTest({
        title: "Removing draw() sets it to the DUMMY function",
        code: function() {
            var foo = { c:color(255, 0, 0), r:100 };
            var draw = function() {
                background(255);
                fill(foo.c);
                ellipse(200, 200, foo.r, foo.r);
            };
        },
        code2: function () {
            var foo = { c:color(255, 0, 0), r:200 };
        },
        teardown: function(output) {
            var p = output.output.processing;
            expect(p.draw).to.be(output.output.DUMMY);
        },
        wait: 100
    });
});

describe("Output Methods", function() {
    runTest({
        title: "getScreenshot",
        code: "background(255, 255, 255);",
        test: function(output, errors, testResults, callback) {
            output.output.getScreenshot(200, function(data) {
                // Testing with a truncated base64 png
                expect(data).to.contain("data:image/png;base64,iVBOR");
                callback();
            });
        }
    });
});
