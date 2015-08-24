var cleanupCode = function(code) {
    var lines = code.split("\n").filter(function(line) {
        return line !== "";
    });

    var indent = lines[0].length - lines[0].trim().length;

    return lines.map(function(line) {
        return line.substring(indent);
    }).join("\n").trim();
};

var transformCode = function(code) {
    var ast = esprima.parse(code);
    var envName = "__env__";
    
    // The tests use ellipse(), console.log(), and print() so we need to make
    // sure they're defined in the context object otherwise the transform won't
    // prefix them when they're used inside of a function body.
    var context = {
        ellipse: function() {},
        console: {
            log: function() {}
        },
        print: function() {}
    };
    walkAST(ast, null, [ASTTransforms.rewriteContextVariables(envName, context)]);

    return escodegen.generate(ast);
};

describe("AST Transforms", function () {
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
    
    it("should handle event handlers declared inside 'draw'", function () {
        var transformedCode = transformCode(getCodeFromOptions(function() {
            var draw = function() {
                var mouseClicked = function() {
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

    it("should handle draw loop functions inside 'draw'", function () {
        var transformedCode = transformCode(getCodeFromOptions(function() {
            var draw = function() {
                var x = 5, mouseClicked = function () {}, y = 10;  
            };
        }));

        var expectedCode = cleanupCode(getCodeFromOptions(function() {
            __env__.draw = function () {
                var x = 5;
                __env__.mouseClicked = function () {
                };
                var y = 10;
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
});
