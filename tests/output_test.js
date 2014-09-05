/* global ellipse, getImage, image, background, loadImage, requestImage */
/* global text, color, textFont, fill, text, background, createFont, PVector */
/* global externals, exp, link, width, draw, mouseMoved */

var runTest = function(options) {
    if (options.version === undefined) {
        options.version = ScratchpadConfig.prototype.latestVersion();
    }

    var displayTitle = options.title +
        " (Version: " + options.version + ")";

    // Assume the code is a string, by default
    var code = options.code;

    // If not then we assume that it's a function so we need to
    // extract the code to run from the serialized function
    if (typeof code !== "string") {
        code = code.toString();
        code = code.substr(code.indexOf("{") + 1);
        code = code.substr(0, code.length - 1);
    }

    // Assume the code is a string, by default
    var code2 = options.code2;

    // If not then we assume that it's a function so we need to
    // extract the code to run from the serialized function
    if (code2 && typeof code2 !== "string") {
        code2 = code2.toString();
        code2 = code2.substr(code2.indexOf("{") + 1);
        code2 = code2.substr(0, code2.length - 1);
    }

    // Start an asynchronous test
    it(displayTitle, function(done) {
        var output = new LiveEditorOutput({
            outputType: "pjs",
            workersDir: "../build/workers/",
            externalsDir: "../build/external/",
            imagesDir: "../build/images/",
            jshintFile: "../build/external/jshint/jshint.js"
        });

        // Switch to the Scratchpad's version
        output.config.switchVersion(options.version);

        // Run once to make sure that no errors are thrown
        // during execution
        output.runCode(code, function(errors) {
            if (options.expected) {
                expect(errors).to.have.length(0);
            } else {
                expect(errors).to.not.equal([]);
                // In some cases, we actually verify number and line # of errors
                // We generally can't test the text as it varies per JS engine,
                // (changes depending on whether we run tests in browser vs. command-line
                // The column number is more consistent across the engines
                if (options.errors) {
                    expect(errors.length).to.be.equal(options.errors.length);
                    expect(errors[0].column)
                        .to.be.equal(options.errors[0].column);
                }
            }

            if (code2) {
                output.runCode(code2, function(errors) {
                    if (options.expected) {
                        expect(errors).to.have.length(0);
                    } else {
                        expect(errors).to.have.length.above(0);
                    }

                    done();
                });
            } else {
                done();
            }
        });
    });
};

var test = function(title, code, code2) {
    runTest({
        title: title,
        code: code,
        code2: code2,
        expected: true
    });
};

var failingTest = function(title, code, code2, errors) {
    runTest({
        title: title,
        code: code,
        code2: code2,
        expected: false, 
        errors: errors
    });
};

// Test the lower level functions in Output
describe("Scratchpad CanvasOutput functions", function() {
    it("stringifyArray", function() {
        var undefArray = PJSOutput.stringifyArray([undefined, undefined]);
        expect(undefArray).to.be.equal("undefined, undefined");
        var primArray = PJSOutput.stringifyArray([1, "A"]);
        expect(primArray).to.be.equal("1, \"A\"");
    });

});

describe("Scratchpad Output Exec", function() {
    test("Color modes", function() {
        color(255, 0, 0);
    });

    test("Draw Ellipse", function() {
        ellipse(100, 100, 100, 100);
    });

    // Check the actual contents of error message
    failingTest("Use object as function", function() {
        var SmileyFace = function() {};
        var face = new SmileyFace();
        face("hi");
    },
    null,
    [{column: 0}]);

    failingTest("JSHint Error", "ellipse(x, 100, 100, 100);");

    failingTest("Infinite Loop", function() {
        var x = 0;
        while (x < 400) {
            ellipse(100, 100, 100, x);
        }
    });

    failingTest("Infinite Loop Inside Draw Function", function() {
        var draw = function() {
            var y = 40;
            while (y < 300) {
                var message = "hello" + y;
                text(message, 30, y);
            }
        };
    });

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

    failingTest("Too Many Draw Operations", function() {
        for (var i = 0; i < 17000; i++) {
            ellipse(100, 100, 100, 100);
        }
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
        var document = externals.canvas.ownerDocument;
        document.getElementsByTagName("div");
    });

    failingTest(".createElement disabled", function() {
        externals.canvas.ownerDocument.createElement("img");
    });

    failingTest("externals disabled", function() {
        var d = externals.canvas.ownerDocument;
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

    test("Make sure mouse events are reset", function() {
        var count = 0;

        var mouseMoved = function() {
            count += 1;
        };
    }, function() {
        var count = 0;

        var xmouseMoved = function() {
            count += 1;
        };

        if (typeof mouseMoved === "function") {
            mouseMoved();
            if (count > 0) {
                throw new Error("mouseMoved not replaced");
            }
        }
    });
});
