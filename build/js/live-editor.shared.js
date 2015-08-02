if (!$._) {
    $._ = function (msg) {
        return msg;
    };
}

// The master list of acceptable images
// Build a list of all the available images
window.OutputImages = [{
    groupName: "avatars",
    images: "leaf-blue leaf-green leaf-grey leaf-orange leaf-red leaf-yellow leafers-seed leafers-seedling leafers-sapling leafers-tree leafers-ultimate marcimus mr-pants mr-pink piceratops-seed piceratops-seedling piceratops-sapling piceratops-tree piceratops-ultimate old-spice-man orange-juice-squid aqualine-seed aqualine-seedling aqualine-sapling aqualine-tree aqualine-ultimate purple-pi questionmark robot_female_1 robot_female_2 robot_female_3 robot_male_1 robot_male_2 robot_male_3 spunky-sam".split(" ")
}, {
    groupName: "creatures",
    images: "Hopper-Happy Hopper-Cool Hopper-Jumping OhNoes BabyWinston Winston".split(" ")
}, {
    groupName: "cute",
    images: "Blank BrownBlock CharacterBoy CharacterCatGirl CharacterHornGirl CharacterPinkGirl CharacterPrincessGirl ChestClosed ChestLid ChestOpen DirtBlock DoorTallClosed DoorTallOpen EnemyBug GemBlue GemGreen GemOrange GrassBlock Heart Key PlainBlock RampEast RampNorth RampSouth RampWest Rock RoofEast RoofNorth RoofNorthEast RoofNorthWest RoofSouth RoofSouthEast RoofSouthWest RoofWest Selector ShadowEast ShadowNorth ShadowNorthEast ShadowNorthWest ShadowSideWest ShadowSouth ShadowSouthEast ShadowSouthWest ShadowWest Star StoneBlock StoneBlockTall TreeShort TreeTall TreeUgly WallBlock WallBlockTall WaterBlock WindowTall WoodBlock".split(" "),
    cite: $._("'Planet Cute' art by Daniel Cook (Lostgarden.com)"),
    citeLink: "http://lostgarden.com/2007/05/dancs-miraculously-flexible-game.html"
}, {
    groupName: "space",
    images: "background beetleship collisioncircle girl1 girl2 girl3 girl4 girl5 healthheart minus octopus planet plus rocketship star 0 1 2 3 4 5 6 7 8 9".split(" "),
    cite: $._("'Space Cute' art by Daniel Cook (Lostgarden.com)"),
    citeLink: "http://lostgarden.com/2007/03/spacecute-prototyping-challenge.html"
}];

window.ExtendedOutputImages = [{
    className: "Clipart",
    groups: OutputImages
}, {
    className: "Photos",
    groups: [{
        groupName: "animals",
        thumbsDir: "/thumbs",
        images: "birds_rainbow-lorakeets butterfly butterfly_monarch cat cheetah crocodiles dog_sleeping-puppy dogs_collies fox horse kangaroos komodo-dragon penguins rabbit retriever shark snake_green-tree-boa spider".split(" ")
    }, {
        groupName: "landscapes",
        thumbsDir: "/thumbs",
        images: "beach-at-dusk beach-in-hawaii beach-sunset beach-waves-at-sunset beach-waves-daytime beach-with-palm-trees beach clouds-from-plane crop-circle fields-of-grain fields-of-wine lake lava lotus-garden mountain_matterhorn mountains-and-lake mountains-in-hawaii mountains-sunset sand-dunes waterfall_niagara-falls".split(" ")
    }, {
        groupName: "food",
        thumbsDir: "/thumbs",
        images: "bananas berries broccoli brussels-sprouts cake chocolates coffee-beans croissant dumplings fish_grilled-snapper fruits grapes hamburger ice-cream mushroom oysters pasta potato-chips potatoes shish-kebab strawberries sushi tomatoes".split(" ")
    }]
}, {
    className: "Holiday ☃",
    groups: [{
        groupName: "seasonal",
        thumbsDir: "/thumbs",
        images: "fireworks-2015 fireworks-in-sky fireworks-over-harbor fireworks-scattered gingerbread-family gingerbread-house gingerbread-houses gingerbread-man hannukah-dreidel hannukah-menorah house-with-lights reindeer snow-crystal1 snow-crystal2 snow-crystal3 snowy-slope-with-trees stocking-empty xmas-cookies xmas-ornament-boat xmas-ornament-on-tree xmas-ornaments xmas-presents xmas-scene-holly-border xmas-tree-with-presents xmas-tree xmas-wreath".split(" ")
    }]
}];
if (!$._) {
    $._ = function (msg) {
        return msg;
    };
}

// The master list of acceptable sounds
// Build a list of all the available sounds
// TODO(kevinb) add methods to help query for sounds
window.OutputSounds = [{
    className: "Sound effects",
    groups: [{
        groupName: "rpg",
        sounds: "battle-magic battle-spell battle-swing coin-jingle door-open giant-hyah giant-no giant-yah hit-clop hit-splat hit-thud hit-whack metal-chime metal-clink step-heavy water-bubble water-slosh".split(" "),
        cite: $._("'RPG Sound Effects' sounds by artisticdude"),
        citeLink: "http://opengameart.org/content/rpg-sound-pack"
    }, {
        groupName: "retro",
        sounds: "boom1 boom2 coin hit1 hit2 jump1 jump2 laser1 laser2 laser3 laser4 rumble thruster-short thruster-long whistle1 whistle2".split(" "),
        cite: $._("'Retro Game Sounds' sounds by spongejr"),
        citeLink: "https://www.khanacademy.org/profile/spongejr/"
    }]
}];
// Note: All time measurements are handled in milliseconds
window.ScratchpadRecord = Backbone.Model.extend({
    initialize: function initialize() {
        // Instance variables, not attributes.
        // Recording handlers, handle both recording and playback
        this.handlers = {
            // Used for continuing playback until the audio is done
            seek: function seek() {}
        };

        // Cache recording state for seeking
        this.seekCache = {};
        this.seekCacheInterval = 20;
        this.initData = {};

        // Collection of caching functionality implemented by content
        // producers (for example: ScratchpadCanvas and ScratchpadEditor)
        this.seekCachers = {};

        // Set up for recording in chunks
        // Array of command arrays for each chunk. Only holds chunks that
        // have been saved.
        this.allSavedCommands = [];
    },

    setActualInitData: function setActualInitData(actualData) {
        this.actualInitData = actualData;
    },

    hasNoChunks: function hasNoChunks() {
        return _.isEmpty(this.allSavedCommands);
    },

    numChunksSaved: function numChunksSaved() {
        return this.allSavedCommands.length;
    },

    startRecordChunk: function startRecordChunk(audioOffset) {
        // Set the audio offset to the audioOffset passed in, unless the
        // most recent command recorded (ie, in the previous chunk) has
        // a timestamp later than audioOffset (which really should not
        // usually happen) -- in that case, use the command's timestamp.
        audioOffset = Math.max(audioOffset, timeOfLastCommand());
        this._resetForNewChunk();
        this.record(audioOffset);

        function timeOfLastCommand() {
            var lastTime = 0;
            if (this.allSavedCommands && this.allSavedCommands.length > 0) {
                if (_.last(this.allSavedCommands).length > 0) {
                    lastTime = _.last(_.last(this.allSavedCommands))[0];
                }
            }
            return lastTime;
        }
    },

    stopRecordChunk: function stopRecordChunk() {
        this.stopRecord();
    },

    saveRecordChunk: function saveRecordChunk() {
        this.allSavedCommands.push(this.commands);
        // Set the offset as the time that the chunk we just recorded goes up
        // to, counting from the start of the full recording (full duration)
        this._resetForNewChunk();
    },

    discardRecordChunk: function discardRecordChunk() {
        // Reset the current stop time to be the same as the duration up to
        // the start of the chunk we just recorded (not the end since
        // we discard the chunk just recorded)
        this._resetForNewChunk();
    },

    _resetForNewChunk: function _resetForNewChunk() {
        this.commands = [];
        this.initData = {};
    },

    /*
     * Offset in milliseconds allows us to pause/resume recording at a certain
     *  offset into the program. See Record.log for how startTime is used
     *  to compute the current time in the recording for each command.
     */
    record: function record(offset) {
        offset = offset || 0;
        if (!this.recording) {
            this.commands = [];
            this.recording = true;
            this.startTime = new Date().getTime() - offset;
            this.trigger("recordStarted");
        }
    },

    stopRecord: function stopRecord() {
        if (this.recording) {
            this.recording = false;
            this.recorded = true;
            this.trigger("recordEnded");
        }
    },

    loadRecording: function loadRecording(commands) {
        var multiplier = 1;
        if (commands && commands.commands && commands.init) {
            this.initData = commands.init;
            multiplier = commands.multiplier;
            commands = commands.commands;
        }
        // Multiply the command timestamp by the multiplier
        if (multiplier !== 1) {
            for (var i = 0; i < commands.length; i++) {
                commands[i][0] = Math.floor(commands[i][0] * multiplier);
            }
        }
        this.commands = commands;
        // Make no more than 50 seek caches
        this.seekCacheInterval = Math.ceil(commands.length / 50);
    },

    dumpRecording: function dumpRecording() {
        if (this.actualInitData) {
            // Update for recording in chunks.
            this.initData = this.actualInitData;

            // Combine all of the command arrays into one array.
            this.commands = _.flatten(this.allSavedCommands, true);
        }

        return {
            init: this.initData,
            commands: this.commands
        };
    },

    getVersion: function getVersion() {
        return this.initData.configVersion || 0;
    },

    // Seek to a given position in the playback, executing all the
    // commands in the interim
    seekTo: function seekTo(time) {
        // Initialize and seek to the desired position
        this.pauseTime = new Date().getTime();
        this.playStart = this.pauseTime - time;

        // Set an initial cache before seeking
        this.cache(-1 * this.seekCacheInterval);

        var seekPos = this.commands.length - 1;

        // Locate the command that we're up to
        for (var i = 0; i < this.commands.length; i++) {
            if (this.commands[i][0] > time) {
                seekPos = i - 1;
                break;
            }
        }

        // The play position is always the next command time to check
        // (see the logic in playInterval)
        this.playPos = seekPos + 1;

        this.trigger("runSeek");

        // Attempt to locate the most recent seek cache
        var lastCache = Math.floor(seekPos / this.seekCacheInterval);
        var foundCache = null;
        var cacheOffset = 0;

        for (var i = lastCache; i >= 0; i--) {
            if (this.seekCache[i]) {
                foundCache = i;
                break;
            }
        }

        // Restore from the most recent cache
        if (foundCache !== null) {
            this.cacheRestore(foundCache);
            cacheOffset = foundCache * this.seekCacheInterval + 1;

            // Otherwise restore from the first cache state
            // The first cache is at -1 as the cache at position 0 is the
            // cache of running the first command
        } else {
            this.cacheRestore(-1 * this.seekCacheInterval);
        }

        // Execute commands and build cache, bringing state up to current
        for (var i = cacheOffset; i <= seekPos; i++) {
            this.runCommand(this.commands[i]);
            this.cache(i);
        }

        this.trigger("seekDone");
    },

    // Cache the result of the specified command
    // (Specified using the position of the command)
    cache: function cache(cmdPos) {
        // Start to build new caches, only if we should
        if (cmdPos % this.seekCacheInterval === 0) {
            var cachePos = Math.floor(cmdPos / this.seekCacheInterval);
            if (!this.seekCache[cachePos]) {
                this.seekCache[cachePos] = {};

                // Run all the seek cachers and cache the current data
                _.each(this.seekCachers, function (seekCacher, namespace) {
                    this.seekCache[cachePos][namespace] = seekCacher.getState();
                }, this);
            }
        }
    },

    // Restore the state from a seek cache
    // (specified using the seek cache number)
    cacheRestore: function cacheRestore(cachePos) {
        if (this.seekCache[cachePos]) {
            // Run all the seek cachers and restore the current data
            _.each(this.seekCachers, function (seekCacher, namespace) {
                var cacheData = this.seekCache[cachePos][namespace];

                if (cacheData) {
                    seekCacher.restoreState(cacheData);
                }
            }, this);
        }
    },

    play: function play() {
        // Don't play if we're already playing or recording
        if (this.recording || this.playing || !this.commands || this.commands.length === 0) {
            return;
        }

        // Initialize state before playback
        this.trigger("playInit");

        var startTime = this.playStart ? this.pauseTime - this.playStart : 0;

        this.playing = true;
        this.playPos = this.playPos || 0;
        this.playStart = new Date().getTime() - startTime;

        this.playInterval = setInterval(_.bind(function () {
            var evt = this.commands[this.playPos];

            while (evt && this.currentTime() >= evt[0]) {
                this.runCommand(evt);
                this.cache(this.playPos);

                this.playPos += 1;

                if (this.playPos === this.commands.length) {
                    this.stopPlayback(true);
                    this.trigger("playEnded");
                    return;
                }

                evt = this.commands[this.playPos];
            }
        }, this), 5);

        this.trigger("playStarted", startTime > 0);

        // Make sure everything is reset before playing
        this.seekTo(startTime);
    },

    pausePlayback: function pausePlayback(end) {
        clearInterval(this.playInterval);

        this.playing = false;
        this.playInterval = null;
        this.pauseTime = new Date().getTime();

        if (!end) {
            this.trigger("playPaused");
        }
    },

    stopPlayback: function stopPlayback(end) {
        this.pausePlayback(end);

        if (!end) {
            this.trigger("playStopped");
        }

        this.playPos = null;
        this.playStart = null;
        this.pauseTime = null;
    },

    reset: function reset() {
        this.initData = {};
        this.commands = [];
        this.seekCache = {};

        this.playPos = null;
        this.playStart = null;
        this.pauseTime = null;
        this.playing = false;
        this.recording = false;
        this.recorded = false;
    },

    currentTime: function currentTime() {
        return new Date().getTime() - this.playStart;
    },

    runCommand: function runCommand(evt) {
        // Commands are stored in the format:
        // [time, name, arguments...]
        var handler = this.handlers[evt[1]];

        if (handler) {
            return handler.apply(this.handlers, evt.slice(2));
        }

        console.error("Command not found:", evt[1]);
    },

    log: function log() {
        if (!this.playing && this.recording && this.commands) {
            // Commands are stored in the format:
            // [time, name, arguments...]

            // By only rechecking the time when asynchrynous code executes we guarantee that
            // all event which occured as part of the same action
            // (and therefore the same paint) have the same timestamp. Meaning they will be
            // together during playback and not allow paints of intermediate states.
            // Specifically this applies to replace (which is a remove and an insert back to back)
            if (this.synchronizedTime === undefined) {
                this.synchronizedTime = Math.floor(new Date().getTime() - this.startTime);
                setTimeout((function () {
                    this.synchronizedTime = undefined;
                }).bind(this), 0);
            }

            var args = Array.prototype.slice.call(arguments, 0);
            args.unshift(this.synchronizedTime);
            this.commands.push(args);
            return true;
        }
    },

    pauseLog: function pauseLog() {
        this.oldRecording = this.recording;
        this.recording = false;
    },

    resumeLog: function resumeLog() {
        this.recording = this.oldRecording;
    }
});
// Maintain all of the configuration options and settings for the site.
// Have them be versioned and attached to the ScratchpadRevision so that
// later config changes don't break old code.
/* jshint unused:false */
var ScratchpadConfig = Backbone.Model.extend({
    version: null,

    initialize: function initialize(options) {
        this.version = options.version;
        this.useDebugger = options.useDebugger;

        if (this.version != null) {
            this.version = this.latestVersion();
        }
    },

    // Run the configuration functions for a particular namespace
    // of functionality. Can optionally take any number of
    // additional arguments.
    runCurVersion: function runCurVersion(type) {
        var args = Array.prototype.slice.call(arguments, 0);
        args.unshift(this.curVersion());
        return this.runVersion.apply(this, args);
    },

    // Run the configuration functions for a particular namespace
    // of functionality, for a particular config version. Can optionally
    // take any number of additional arguments.
    runVersion: function runVersion(version, type) {
        var args = Array.prototype.slice.call(arguments, 2);

        for (var i = 0; i <= version; i++) {
            var configFn = this.versions[i][type];

            if (configFn) {
                configFn.apply(this, args);
            }
        }
    },

    switchVersion: function switchVersion(version) {
        // Make sure we're switching to a new version
        if (version !== this.curVersion()) {
            // Set the new version
            this.version = version;

            // Run the inits for all bound handlers
            this.trigger("versionSwitched", version);
        }
    },

    // Get the current config version
    curVersion: function curVersion() {
        if (this.version != null) {
            return this.version;
        }

        return this.latestVersion();
    },

    // Get the latest config version
    latestVersion: function latestVersion() {
        return this.versions.length - 1;
    },

    autoCompleteBehavior: {
        autoBrace: false,
        braceIndent: true,
        equalsInsert: true
    },

    bindAutoComplete: function bindAutoComplete(editor, autoCompleteBehavior) {
        autoCompleteBehavior = autoCompleteBehavior || this.autoCompleteBehavior;

        // When a { is typed, an endline, indentation, and another endline
        // are inserted. The cursor is set after the indentation.
        // Additionally make it so that if "var draw =" is typed then
        // the associated "function() { ... }; are inserted as well.
        var behavior = editor.getSession().getMode().$behaviour;

        // Reset auto-complete for parentheses and quotes
        // (matches earlier Ace behavior)
        behavior.add("parens", "insertion", function () {});
        behavior.add("parens", "deletion", function () {});
        behavior.add("brackets", "insertion", function () {});
        behavior.add("brackets", "deletion", function () {});
        behavior.add("string_dquotes", "insertion", function () {});
        behavior.add("string_dquotes", "deletion", function () {});

        // Auto-completion code based on code from
        // Ace Editor file: ace-mode-javascript.js
        behavior.add("braces", "insertion", function (state, action, editor, session, text) {
            var cursor = editor.getCursorPosition();
            var line = session.doc.getLine(cursor.row);

            if (text === "{") {
                var selection = editor.getSelectionRange();
                var selected = session.doc.getTextRange(selection);

                // Old auto-completion logic
                if (autoCompleteBehavior.autoBrace) {
                    if (selected !== "") {
                        return {
                            text: "{" + selected + "}",
                            selection: false
                        };
                    } else {
                        return {
                            text: "{}",
                            selection: [1, 1]
                        };
                    }
                } else if (autoCompleteBehavior.braceIndent) {
                    // This is the one section of the code that's been
                    // modified, everything else was left as-is.
                    // Endlines and indentation were added to brace
                    // autocompletion.

                    // Insert a semicolon after the brace if there's
                    // an assignment occurring on the same line
                    // (e.g. if you're doing var draw = function(){...})
                    var maybeSemicolon = /=\s*function/.test(line) ? ";" : "";

                    var indent = this.getNextLineIndent(state, line.substring(0, line.length - 1), session.getTabString());
                    var nextIndent = this.$getIndent(session.doc.getLine(cursor.row));

                    // The case of if (EXPR) { doesn't indent properly
                    // as the if (EXPR) line doesn't trigger an additional
                    // indentation level, so we force it to work.
                    if (indent === nextIndent) {
                        indent += session.getTabString();
                    }

                    return {
                        text: "{\n" + indent + selected + "\n" + nextIndent + "}" + maybeSemicolon,
                        // Format:
                        // [ rowStartSelection, colStartSelection,
                        //   rowEndSelection, colEndSelection ]
                        selection: [1, indent.length, 1, indent.length]
                    };
                }
            } else if (text === "}") {
                var rightChar = line.substring(cursor.column, cursor.column + 1);
                if (rightChar === "}") {
                    var matching = session.$findOpeningBracket("}", { column: cursor.column + 1, row: cursor.row });
                    if (matching !== null) {
                        return {
                            text: "",
                            selection: [1, 1]
                        };
                    }
                }
            } else if (text === "\n") {
                var rightChar = line.substring(cursor.column, cursor.column + 1);
                if (rightChar === "}") {
                    var openBracePos = session.findMatchingBracket({ row: cursor.row, column: cursor.column + 1 });
                    if (!openBracePos) {
                        return null;
                    }

                    var indent = this.getNextLineIndent(state, line.substring(0, line.length - 1), session.getTabString());
                    var nextIndent = this.$getIndent(session.doc.getLine(openBracePos.row));

                    return {
                        text: "\n" + indent + "\n" + nextIndent,
                        selection: [1, indent.length, 1, indent.length]
                    };
                }
            }
        });

        // Auto-completion code based on code from
        // Ace Editor file: ace-mode-javascript.js
        behavior.add("equals", "insertion", function (state, action, editor, session, text) {

            if (!autoCompleteBehavior.equalsInsert) {
                return;
            }

            var cursor = editor.getCursorPosition();
            var line = session.doc.getLine(cursor.row);

            if (text === "=" && /\bdraw\s*$/.test(line)) {
                var selection = editor.getSelectionRange();
                var selected = session.doc.getTextRange(selection);

                var indent = this.getNextLineIndent(state, line.substring(0, line.length - 1), session.getTabString());
                var nextIndent = this.$getIndent(session.doc.getLine(cursor.row));

                // The case of if (EXPR) { doesn't indent properly
                // as the if (EXPR) line doesn't trigger an additional
                // indentation level, so we force it to work.
                if (indent === nextIndent) {
                    indent += session.getTabString();
                }

                return {
                    text: "= function() {\n" + indent + selected + "\n" + nextIndent + "};",
                    selection: [1, indent.length, 1, indent.length]
                };
            }
        });
    },

    // The configuration options
    // All configuration options are namespaced and versioned
    versions: [{
        name: "Initial Configuration",

        // Ace pjs editor configuration
        ace_pjs_editor: function ace_pjs_editor(editor) {
            var aceEditor = editor.editor;

            aceEditor.session.setOption("useWorker", false);

            // Don't highlight the active line
            aceEditor.setHighlightActiveLine(false);

            // Stop bracket highlighting
            aceEditor.$highlightBrackets = function () {};

            // Make sure no horizontal scrollbars are shown
            aceEditor.renderer.setHScrollBarAlwaysVisible(false);

            var session = aceEditor.getSession();

            // Use word wrap
            session.setUseWrapMode(true);

            // Use soft tabs
            session.setUseSoftTabs(true);

            // Stop automatic JSHINT warnings
            session.setUseWorker(false);

            // Set the font size
            aceEditor.setFontSize("20px");

            // Disable highlighting the selected word
            aceEditor.setHighlightSelectedWord(false);

            // Show line numbers and enable code collapsing
            aceEditor.renderer.setShowGutter(true);

            // Don't show print margin
            aceEditor.renderer.setShowPrintMargin(false);

            // Use JavaScript Mode
            session.setMode("ace/mode/javascript");

            // Set the editor theme
            aceEditor.setTheme("ace/theme/textmate");

            // Attach the auto-complete for the editor
            // (must be re-done every time the mode is set)
            this.bindAutoComplete(editor.editor, {
                autoBrace: false,
                braceIndent: false,
                equalsInsert: true
            });
        },

        // Ace HTML editor configuration
        ace_webpage_editor: function ace_webpage_editor(editor) {
            var aceEditor = editor.editor;

            aceEditor.session.setOption("useWorker", false);

            // Don't highlight the active line
            aceEditor.setHighlightActiveLine(false);

            // Make sure no horizontal scrollbars are shown
            aceEditor.renderer.setHScrollBarAlwaysVisible(false);

            var session = aceEditor.getSession();

            // Use word wrap
            session.setUseWrapMode(true);

            // Use soft tabs
            session.setUseSoftTabs(true);

            // Set the font size
            aceEditor.setFontSize("20px");

            // Disable highlighting the selected word
            aceEditor.setHighlightSelectedWord(false);

            // Show line numbers and enable code collapsing
            aceEditor.renderer.setShowGutter(true);

            // Don't show print margin
            aceEditor.renderer.setShowPrintMargin(false);

            // Use HTML Mode
            session.setMode("ace/mode/html");

            // modify auto-complete to be less agressive.
            // Do not autoclose tags if there is other text after the cursor on the line.
            var behaviours = session.getMode().$behaviour.getBehaviours();
            var autoclosingFN = behaviours.autoclosing.insertion;
            behaviours.autoclosing.insertion = function (state, action, editor, session, text) {
                var pos = editor.getCursorPosition();
                var line = session.getLine(pos.row);
                if (line.slice(pos.column).trim() === "") {
                    return autoclosingFN.apply(this, arguments);
                }
            };

            // Set the editor theme
            aceEditor.setTheme("ace/theme/textmate");
        },

        // Ace SQL editor configuration
        ace_sql_editor: function ace_sql_editor(editor) {
            var aceEditor = editor.editor;

            // Don't highlight the active line
            aceEditor.setHighlightActiveLine(false);

            // Make sure no horizontal scrollbars are shown
            aceEditor.renderer.setHScrollBarAlwaysVisible(false);

            var session = aceEditor.getSession();

            // Use word wrap
            session.setUseWrapMode(true);

            // Use soft tabs
            session.setUseSoftTabs(true);

            // Set the font size
            aceEditor.setFontSize("14px");

            // Disable highlighting the selected word
            aceEditor.setHighlightSelectedWord(false);

            // Show line numbers and enable code collapsing
            aceEditor.renderer.setShowGutter(true);

            // Don't show print margin
            aceEditor.renderer.setShowPrintMargin(false);

            // Use SQL Mode
            session.setMode("ace/mode/sql");

            // Set the editor theme
            aceEditor.setTheme("ace/theme/textmate");
        },

        // JSHint configuration
        // See: http://www.jshint.com/options/
        jshint: function jshint(output) {
            output.JSHint = {
                // Prohibit explicitly undefined variables
                undef: true,

                // No empty code blocks
                noempty: true,

                // Prohibits the use of ++ and --
                plusplus: true,

                // Prohibits the use of arguments.callee and caller
                noarg: true,

                // Prohibit the use of variables before they were defined
                latedef: true,

                // Requires the use of === instead of ==
                eqeqeq: true,

                // Requires you to specify curly braces on loops
                // and conditionals
                curly: true,

                // Allow variable shadowing. Declaring a var multiple times
                // is allowed.
                shadow: true,

                // Allow mixing spaces and tabs. We can add a prettify one day
                // if we want to fix things up.
                smarttabs: true
            };
        },

        // Processing.js configuration
        processing: function processing(canvas) {
            canvas.size(400, 400);
            canvas.frameRate(30);
            canvas.angleMode = "radians";
        }
    }, {
        name: "Switch to Degress from Radians",

        processing: function processing(canvas) {
            canvas.angleMode = "degrees";
        }
    }, {
        name: "Brace Autocompletion Changes",

        ace_pjs_editor: function ace_pjs_editor(editor) {}
    }, {
        name: "Disable Un-needed JSHint Rules",

        jshint: function jshint(output) {
            // Re-allow empty braces
            delete output.JSHint.noempty;

            // Re-allow ++ and --
            delete output.JSHint.plusplus;
        }
    }, {
        name: "version 4 placeholder"

        // At one time live-editor.shared.js had a (version 4) entry that a
        // duplicate "Brace Autocompletion Changes" before it was disabled.
        // This duplicate was probably introduced by a merge. Unfortunately,
        // many of the revisions in the datastore are version 4.  This
        // placeholder version ensures that those revisions continue to work
        // without throwing exceptions.
    }

    // NOTE: update version test in output_test.js
    ]
});

// We no longer version editor changes,
// since we made talkie recording more robust.
// We still version jshint changes however,
// so we keep this one around as a null change.
/*!
 * visibly - v0.7 Page Visibility API Polyfill
 * http://github.com/addyosmani
 * Copyright (c) 2011-2014 Addy Osmani
 * Dual licensed under the MIT and GPL licenses.
 *
 * Methods supported:
 * visibly.onVisible(callback)
 * visibly.onHidden(callback)
 * visibly.hidden()
 * visibly.visibilityState()
 * visibly.visibilitychange(callback(state));
 */

;(function () {

    window.visibly = {
        q: document,
        p: undefined,
        prefixes: ['webkit', 'ms','o','moz','khtml'],
        props: ['VisibilityState', 'visibilitychange', 'Hidden'],
        m: ['focus', 'blur'],
        visibleCallbacks: [],
        hiddenCallbacks: [],
        genericCallbacks:[],
        _callbacks: [],
        cachedPrefix:"",
        fn:null,

        onVisible: function (_callback) {
            if(typeof _callback == 'function' ){
                this.visibleCallbacks.push(_callback);
            }
        },
        onHidden: function (_callback) {
            if(typeof _callback == 'function' ){
                this.hiddenCallbacks.push(_callback);
            }
        },
        getPrefix:function(){
            if(!this.cachedPrefix){
                for(var l=0;b=this.prefixes[l++];){
                    if(b + this.props[2] in this.q){
                        this.cachedPrefix =  b;
                        return this.cachedPrefix;
                    }
                }    
             }
        },

        visibilityState:function(){
            return  this._getProp(0);
        },
        hidden:function(){
            return this._getProp(2);
        },
        visibilitychange:function(fn){
            if(typeof fn == 'function' ){
                this.genericCallbacks.push(fn);
            }

            var n =  this.genericCallbacks.length;
            if(n){
                if(this.cachedPrefix){
                     while(n--){
                        this.genericCallbacks[n].call(this, this.visibilityState());
                    }
                }else{
                    while(n--){
                        this.genericCallbacks[n].call(this, arguments[0]);
                    }
                }
            }

        },
        isSupported: function (index) {
            return ((this._getPropName(2)) in this.q);
        },
        _getPropName:function(index) {
            return (this.cachedPrefix == "" ? this.props[index].substring(0, 1).toLowerCase() + this.props[index].substring(1) : this.cachedPrefix + this.props[index]);
        },
        _getProp:function(index){
            return this.q[this._getPropName(index)]; 
        },
        _execute: function (index) {
            if (index) {
                this._callbacks = (index == 1) ? this.visibleCallbacks : this.hiddenCallbacks;
                var n =  this._callbacks.length;
                while(n--){
                    this._callbacks[n]();
                }
            }
        },
        _visible: function () {
            window.visibly._execute(1);
            window.visibly.visibilitychange.call(window.visibly, 'visible');
        },
        _hidden: function () {
            window.visibly._execute(2);
            window.visibly.visibilitychange.call(window.visibly, 'hidden');
        },
        _nativeSwitch: function () {
            this[this._getProp(2) ? '_hidden' : '_visible']();
        },
        _listen: function () {
            try { /*if no native page visibility support found..*/
                if (!(this.isSupported())) {
                    if (this.q.addEventListener) { /*for browsers without focusin/out support eg. firefox, opera use focus/blur*/
                        window.addEventListener(this.m[0], this._visible, false);
                        window.addEventListener(this.m[1], this._hidden, false);
                    } else { /*IE <10s most reliable focus events are onfocusin/onfocusout*/
                        if (this.q.attachEvent) {
                            this.q.attachEvent('onfocusin', this._visible);
                            this.q.attachEvent('onfocusout', this._hidden);
                        }
                    }
                } else { /*switch support based on prefix detected earlier*/
                    this.q.addEventListener(this._getPropName(1), function () {
                        window.visibly._nativeSwitch.apply(window.visibly, arguments);
                    }, 1);
                }
            } catch (e) {}
        },
        init: function () {
            this.getPrefix();
            this._listen();
        }
    };

    this.visibly.init();
})();
