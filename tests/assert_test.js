/* global ellipse, getImage, image, background, loadImage, requestImage */
/* global text, color, textFont, fill, text, background, createFont */
/* global externals, exp, link */

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

    // Start an asynchronous test
    it(displayTitle, function(done) {
        var output = new LiveEditorOutput({
            outputType: "p5js",
            workersDir: "../build/workers/",
            externalsDir: "../build/external/",
            imagesDir: "../build/images/",
            jshintFile: "../build/external/jshint/jshint.js"
        });

        output.initTests(options.validate);

        // Switch to the Scratchpad's version
        output.config.switchVersion(options.version);
        
        // Run once to make sure that no errors are thrown
        // during execution
        output.runCode(code, function(errors, testResults) {
            if (!options.reason) {
                expect(errors.length).to.be.equal(0);
            } else {
                if (options.fromTests) {
                    expect(testResults).to.not.equal([]);
                    expect(testResults[0].state).to.be.equal("fail");
                    expect(testResults[0].results[0].meta.alsoMessage)
                        .to.be.equal(options.reason);
                } else {
                    expect(errors).to.not.equal([]);
                    if (options.jshint) {
                        expect(errors[0].lint).to.exist;
                        expect(errors[0].lint.reason)
                            .to.be.equal(options.reason);
                    } else {
                        var $html = $("<div>" + errors[0].text + "</div>");
                        expect($html.text()).to.be.equal(options.reason);
                    }
                }
            }
            done();
        });
    });
};


describe("Challenge Assertions", function() {

    var hopperTest = 'staticTest($._("Start the H!"),function(){var pattern=function(){rect(80,70,60,240);};var anyRectP=function(){rect(_,_,_,_);};var result=match(structure(pattern));if(fails(result)){if(matches(structure(anyRectP))){result=fail($._("Hmm, that rectangle\'s at a different location than the code we gave you. For step 1, your code should look exactly like the code on the right."));}}var descrip=$._("To draw an H using rectangles, we need two tall ones on the side and a short one connecting them in the middle. Start the first side by typing in exactly the code on the right →");assertMatch(result,descrip,pattern,"https://s3.amazonaws.com/ka-cs-challenge-images/h1.png");});';
    
    runTest({
        title: "Getting a challenge message",
        code: "rect(-10, 70, 60, 240);",
        validate: hopperTest,
        fromTests: true,
        reason: "Hmm, that rectangle's at a different location than the code we gave you. For step 1, your code should look exactly like the code on the right."
    });

    runTest({
        title: "Getting a BabyHint syntax error",
        code: "reect(20, 20, 10, 20);",
        validate: hopperTest,
        reason: "Did you mean to type rect instead of reect?",
        babyhint: true
    }); 

    runTest({
        title: "Getting a JSHint syntax error",
        code: "rect(80, 70, 60, 240,);",
        validate: hopperTest,
        reason: "I think you either have an extra comma or a missing argument?",
        jshint: true
    });

    runTest({
        title: "Doing the step with no errors",
        code: "rect(20, 20, 10, 20);",
        validate: hopperTest
    });    

    // This has assertMatch with syntaxChecks array as final argument
    var syntaxChecksTests = 'var syntaxChecks=[{re:/^\\((\\s*\\d+\\s*,){3}\\s*\\d+\\);*.*/,msg:$._("Make sure you specify the command name, rect! Check the hint code.")},{re:/rect\\s*\\((\\s*\\d+\\s*,\\s*){4}\\)/,msg:$._("You have an extra comma after your last parameter.")}]; staticTest($._("Start the H!"),function(){var pattern=function(){rect(80,70,60,240);};var anyRectP=function(){rect(_,_,_,_);};var result=match(structure(pattern));if(fails(result)){if(matches(structure(anyRectP))){result=fail($._("Hmm, that rectangle\'s at a different location than the code we gave you. For step 1, your code should look exactly like the code on the right."));}}var descrip=$._("To draw an H using rectangles, we need two tall ones on the side and a short one connecting them in the middle. Start the first side by typing in exactly the code on the right →");assertMatch(result,descrip,pattern,"https://s3.amazonaws.com/ka-cs-challenge-images/h1.png",syntaxChecks);});';

    runTest({
        title: "Showing special syntax error for extra comma",
        code: "rect(80, 70, 60, 240,);",
        validate: syntaxChecksTests,
        reason: "You have an extra comma after your last parameter."
    });

    runTest({
        title: "Not suppressing syntax warnings",
        code: "rect(80, 70, 60, 240)",
        validate: syntaxChecksTests,
        reason: "It looks like you're missing a semicolon.",
        jshint: true
    });


});
