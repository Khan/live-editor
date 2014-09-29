describe("Test Playback", function() {
    $.getJSON("./recording-data.json", function(recordings) {
        Object.keys(recordings).forEach(function(id) {
            var data = recordings[id];

            describe("Testing #" + id, function() {
                this.timeout(5000);

                before(function(done) {
                    window.liveEditor = new LiveEditor({
                        el: $("<div>").appendTo("body"),
                        code: data.code,
                        version: data.version,
                        recordingCommands: data.commands,
                        recordingMP3: "test.mp3",
                        recordingInit: {
                            code: data.code,
                            version: data.version
                        },
                        width: 400,
                        height: 400,
                        autoFocus: true,
                        workersDir: "../../build/workers/",
                        externalsDir: "../../build/external/",
                        imagesDir: "../../build/images/",
                        execFile: "../../demos/simple/output.html",
                        jshintFile: "../../build/external/jshint/jshint.js"
                    });

                    liveEditor.on("update", function(data) {
                        if (data.loaded) {
                            done();
                        }
                    });
                });

                data.tests.forEach(function(test) {
                    it("Time: " + Math.floor(test.time / 1000), function() {
                        liveEditor.record.seekTo(test.time);
                        expect(liveEditor.editor.text()).to.be.equal(test.text);
                        // NOTE(jeresig): Disabled as selections appear to still
                        // be async. However code is not (and is the most
                        // imporant thing to verify).
                        //expect(liveEditor.editor.editor.selection.getRange())
                            //.to.be.eql(test.selection);
                    });
                });

                it("Verify final code runs", function(done) {
                    var resultFound = false;
                    liveEditor.on("update", function(data) {
                        if (data.results && !resultFound &&
                            data.results.code === liveEditor.editor.text()) {
                            expect(data.results.errors).to.be.eql([]);
                            resultFound = true;
                            done();
                        }
                    });
                });

                after(function() {
                    liveEditor.remove();
                    liveEditor.off("update");
                });
            });
        });

        if (window.mochaPhantomJS) {
            mochaPhantomJS.run();
        } else {
            mocha.run();
        }
    });
});
