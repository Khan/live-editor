(function() {
    // If no language is specified, or if an unknown language is specified,
    // then fall back to using "en" as the base language
    var defaultLang = "en";

    // The plural language strings for all the languages we have
    // listed in crowdin.  The values here need to match what crowdin
    // uses (sometimes different platforms use different plural forms,
    // for ambiguous languages like Turkish).  I got it by running
    //    deploy/download_i18n.py -s
    // and looking a the .po files in all.zip.  Each .po file has a
    // header line that say something like:
    //    "Plural-Forms: nplurals=2; plural=(n != 1);\n"
    // which I copied in here verbatim, except I replaced occurrences
    // of "or" with "||".
    var plural_forms = {
        "af": "nplurals=2; plural=(n != 1)",
        "ar": "nplurals=6; plural= n==0 ? 0 : n==1 ? 1 : n==2 ? 2 : n%100>=3 && n%100<=10 ? 3 : n%100>=11 && n%100<=99 ? 4 : 5",
        "az": "nplurals=2; plural=(n != 1)",
        "bg": "nplurals=2; plural=(n != 1)",
        "ca": "nplurals=2; plural=(n != 1)",
        "cs": "nplurals=3; plural=(n==1) ? 0 : (n>=2 && n<=4) ? 1 : 2",
        "da": "nplurals=2; plural=(n != 1)",
        "de": "nplurals=2; plural=(n != 1)",
        "el": "nplurals=2; plural=(n != 1)",
        "en": "nplurals=2; plural=(n != 1)",
        "es-ES": "nplurals=2; plural=(n != 1)",
        "fi": "nplurals=2; plural=(n != 1)",
        "fr": "nplurals=2; plural=(n > 1)",
        "he": "nplurals=2; plural=(n != 1)",
        "hi": "nplurals=2; plural=(n!=1)",
        "hu": "nplurals=2; plural=(n != 1)",
        "it": "nplurals=2; plural=(n != 1)",
        "ja": "nplurals=1; plural=0",
        "ko": "nplurals=1; plural=0",
        "nl": "nplurals=2; plural=(n != 1)",
        "no": "nplurals=2; plural=(n != 1)",
        "pl": "nplurals=3; plural=(n==1 ? 0 : n%10>=2 && n%10<=4 && (n%100<10 || n%100>=20) ? 1 : 2)",
        "pt-BR": "nplurals=2; plural=(n != 1)",
        "pt-PT": "nplurals=2; plural=(n != 1)",
        "ro": "nplurals=3; plural=(n==1 ? 0 : (n==0 || (n%100 > 0 && n%100 < 20)) ? 1 : 2)",
        "ru": "nplurals=3; plural=n%10==1 && n%100!=11 ? 0 : n%10>=2 && n%10<=4 && (n%100<10 || n%100>=20) ? 1 : 2",
        "si-LK": "nplurals=2; plural=(n != 1)",
        "sk": "nplurals=3; plural=(n==1) ? 0 : (n>=2 && n<=4) ? 1 : 2",
        "sr": "nplurals=4; plural=n==1? 3 : n%10==1 && n%100!=11 ? 0 : n%10>=2 && n%10<=4 && (n%100<10 || n%100>=20) ? 1 : 2",
        "sv-SE": "nplurals=2; plural=(n != 1) ",
        "tr": "nplurals=1; plural=0",
        "uk": "nplurals=3; plural=(n%10==1 && n%100!=11 ? 0 : n%10>=2 && n%10<=4 && (n%100<10 || n%100>=20) ? 1 : 2)",
        "ur-PK": "nplurals=2; plural=(n != 1)",
        "vi": "nplurals=1; plural=0",
        "xh": "nplurals=2; plural=(n != 1)",
        "zh-CN": "nplurals=1; plural=0",
        "zh-TW": "nplurals=1; plural=0"
    };

    var getPluralForm = function(lang) {
        return plural_forms[lang] || plural_forms[defaultLang];
    };

    // Create a global Jed instance named 'i18n'
    var i18n = new Jed({});

    // We will set the locale-data lazily, as we need it
    i18n.options.locale_data = {};

    /**
     * Performs sprintf-like %(name)s replacement on str, and returns an array
     * of the string interleaved with those replacements
     *
     * For example:
     *  interpolateStringToArray("test", {}) -> ["test"]
     *  interpolateStringToArray("test %(num)s", {num: 5}) -> ["test ", 5, ""]
     */
    var interpolateStringToArray = function(str, options) {
        options = options || {};

        // Split the string into its language fragments and substitutions
        var split = str.split(/%\(([\w_]+)\)s/g);

        // Replace the substitutions with the appropriate option
        for (var i = 1; i < split.length; i += 2) {
            var replaceWith = options[split[i]];
            split[i] = _.isUndefined(replaceWith) ?
                "%(" + split[i] + ")s" :
                replaceWith;
        }
        return split;
    };

    /**
     * Simple i18n method with sprintf-like %(name)s replacement
     * To be used like so:
     *   $._("Some string")
     *   $._("Hello %(name)s", {name: "John"})
     */
    jQuery._ = function(str, options) {
        // Sometimes we're given an argument that's meant for ngettext().  This
        // happens if the same string is used in both $._() and $.ngettext()
        // (.g. a = $._(foo); b = $.ngettext("foo", "bar", count);
        // In such cases, only the plural form ends up in the .po file, and
        // then it gets sent to us for the $._() case too.  No problem, though:
        // we'll just take the singular arg.
        if (typeof str === "object" && str.messages) {
            str = str.messages[0];
        }

        return interpolateStringToArray(str, options).join("");
    };

    /**
     * A simple i18n react component-like function to allow for string
     * interpolation destined for the output of a react render() function
     *
     * This function understands react components, or other things
     * renderable by react, passed in as props.
     *
     * Examples:
     *   <$_ first="Motoko" last="Kusanagi">
     *       Hello, %(first)s %(last)s!
     *   </$_>
     *
     * which react/jsx compiles to:
     *   $_({first: "Motoko", last: "Kusanagi"}, "Hello, %(first)s %(last)s!")
     *
     *
     *   <$_ textbox={<input type="text" />}>
     *       Please enter a number: %(textbox)s
     *   </$_>
     *
     * which react/jsx compiles to:
     *   $_({textbox: React.DOM.input({type: "text"}),
     *       "Please enter a number: %(textbox)s")
     *
     * Note: this is not a full react component to avoid complex handling of
     * other things added to props, such as this.props.ref and
     * this.props.children
     */
    window.$_ = function(options, str) {
        if (arguments.length !== 2 || !_.isString(str)) {
            return "<$_> must have exactly one child, which must be a string";
        }
        return interpolateStringToArray(str, options);
    };

    /**
     * Simple ngettext method with sprintf-like %(name)s replacement
     * To be used like so:
     *   $.ngettext("Singular", "Plural", 3)
     *   $.ngettext("1 Cat", "%(num)s Cats", 3)
     *   $.ngettext("1 %(type)s", "%(num)s %(type)s", 3, {type: "Cat"})
     * This method is also meant to be used when injecting for other
     * non-English languages, like so (taking an array of plural messages,
     * which varies based upon the language):
     *   $.ngettext({
     *     lang: "ja",
     *     messages: ["%(num)s 猫 %(username)s"]
     *   }, 3, {username: "John"});
     */
    jQuery.ngettext = function(singular, plural, num, options) {
        var message_info = singular;

        // Fall back to the default lang
        var lang = message_info.lang || defaultLang;

        // Make sure we have locale_data set for our language
        if (!i18n.options.locale_data[lang]) {
            i18n.options.locale_data[lang] = {
                "": {
                    domain: lang,
                    // Set the language
                    lang: lang,
                    // Initialize the plural forms to be used with
                    // any pluralization that occurs
                    plural_forms: getPluralForm(lang)
                }
            };
        }

        // If the first argument is an object then we're receiving a plural
        // configuration object
        if (typeof message_info === "object") {
            // We only have a messages object no plural string
            // thus we need to shift all the arguments over by one.
            options = num;
            num = plural;

            // Get the actual singular form of the string for lookups
            // We just ignore the plural form as it's generated automatically.
            singular = message_info.messages[0];

            // Add the messages into the Jed.js i18n object.
            // By default the first item in the array is ignored
            i18n.options.locale_data[lang][singular] =
                [null].concat(message_info.messages);
        }

        // Get the options to substitute into the string
        options = options || {};
        options.num = options.num || num;

        // Then pass into $._ for the actual substitution
        return jQuery._(i18n.dngettext(lang, singular, plural, num), options);
    };

    /*
     * Return the ngettext position that matches the given number and locale.
     *
     * Arguments:
     *  - num: The number upon which to toggle the plural forms.
     *  - lang: The language to use as the basis for the pluralization.
     */
    jQuery.ngetpos = function(num, lang) {
        lang = lang || "en";

        // Generate a function which will give the position of the message
        // which matches the correct plural form of the string
        return Jed.PF.compile(getPluralForm(lang))(num);
    };

    /*
     * Returns true if the given number matches the singular form, false
     * if it's some other form.
     *
     * Arguments:
     *  - num: The number upon which to toggle the plural forms.
     *  - lang: The language to use as the basis for the pluralization.
     */
    jQuery.isSingular = function(num, lang) {
        return jQuery.ngetpos(num, lang) === 0;
    };

    /*
     * A dummy identity function.  It's used as a signal to automatic
     * translation-identification tools that they shouldn't mark this
     * text up to be translated, even though it looks like
     * natural-language text.  (And likewise, a signal to linters that
     * they shouldn't complain that this text isn't translated.)
     * Use it like so: 'tag.author = i18n.i18nDoNotTranslate("Jim");'
     */
    jQuery.i18nDoNotTranslate = jQuery._;

    /**
     * Dummy Handlebars _ function. Is a noop.
     * Should be used as: {{#_}}...{{/_}}
     * The text is extracted, at compile-time, by server-side scripts.
     * This is just used for marking up those fragments that need translation.
     * The translated text is injected at deploy-time.
     */
    i18n.handlebars_underscore = function(options) {
        return options.fn(this);
    };

    /**
     *  Mark text as not needing translation.
     *
     * This function is used to let i18nize_templates.py know that
     * everything within it does not need to be translate.
     * Should be used as: {{#i18nDoNotTranslate}}...{{/i18nDoNotTranslate}}
     * It does not need to actually do anything and hence returns the contents
     * as is.
     */
    i18n.handlebars_do_not_translate = function(options) {
        return options.fn(this);
    };

    /**
     * Handlebars ngettext function.
     * Doesn't do any translation, is used for showing the correct string
     * based upon the specified number and language.
     * All strings are extracted (at compile-time) and injected (at
     * deploy-time). By default this should be used as:
     *   {{#ngettext NUM}}singular{{else}}plural{{/ngettext}}
     * After injecting the translated strings into the page it'll read as:
     *   {{#ngettext NUM "lang" 0}}singular{{else}}plural{{/ngettext}}
     * (May depend upon the language used and how many different plural
     * forms the language has.)
     *
     * Arguments:
     *  - num: The number upon which to toggle the plural forms.
     *  - lang: The language to use as the basis for the pluralization.
     *  - pos: The expected plural form (depends upon the language)
     */
    i18n.handlebars_ngettext = function(num, lang, pos, options) {
        // This method has two signatures:
        // (num) (the default for when the code is run in dev mode)
        // (num, lang, pos) (for when the code is run in prod mode)
        if (typeof lang !== "string") {
            options = lang;
            lang = "en";
            pos = 0;
        }

        // Add in 'num' as a magic variable.
        this.num = this.num || num;

        // If the result of the plural form function given the specified
        // number matches the expected position then we give the first
        // result, otherwise we give the inverse result.
        return jQuery.ngetpos(num) === pos ?
            options.fn(this) :
            options.inverse(this);
    };

    window.i18n = i18n;
})();

if (typeof Handlebars !== "undefined") {
    Handlebars.registerHelper("_", i18n.handlebars_underscore);

    Handlebars.registerHelper("i18nDoNotTranslate",
        i18n.handlebars_do_not_translate);

    Handlebars.registerHelper("ngettext",
        i18n.handlebars_ngettext);
}
if (!$._) {
    $._ = function(msg) {
        return msg;
    };
}

// The master list of acceptable images
// Build a list of all the available images
window.OutputImages = [
    {
        groupName: "creatures",
        images: "Hopper-Happy Hopper-Cool Hopper-Jumping OhNoes BabyWinston Winston".split(" ")
    },
    {
        groupName: "cute",
        images: "Blank BrownBlock CharacterBoy CharacterCatGirl CharacterHornGirl CharacterPinkGirl CharacterPrincessGirl ChestClosed ChestLid ChestOpen DirtBlock DoorTallClosed DoorTallOpen EnemyBug GemBlue GemGreen GemOrange GrassBlock Heart Key PlainBlock RampEast RampNorth RampSouth RampWest Rock RoofEast RoofNorth RoofNorthEast RoofNorthWest RoofSouth RoofSouthEast RoofSouthWest RoofWest Selector ShadowEast ShadowNorth ShadowNorthEast ShadowNorthWest ShadowSideWest ShadowSouth ShadowSouthEast ShadowSouthWest ShadowWest Star StoneBlock StoneBlockTall TreeShort TreeTall TreeUgly WallBlock WallBlockTall WaterBlock WindowTall WoodBlock".split(" "),
        cite: $._("'Planet Cute' art by Daniel Cook (Lostgarden.com)"),
        citeLink: "http://lostgarden.com/2007/05/dancs-miraculously-flexible-game.html"
    },
    {
        groupName: "space",
        images: "background beetleship collisioncircle girl1 girl2 girl3 girl4 girl5 healthheart minus octopus planet plus rocketship star 0 1 2 3 4 5 6 7 8 9".split(" "),
        cite: $._("'Space Cute' art by Daniel Cook (Lostgarden.com)"),
        citeLink: "http://lostgarden.com/2007/03/spacecute-prototyping-challenge.html"
    }
];

// Note: All time measurements are handled in milliseconds


/* The main consequence of this being a Model instead of a global object
 * is scope -- calling record.play as a method needs to still be bound such that
 * 'this' is the Backbone model. I.e.:
 *       setTimeout(model.record, 30) = BAD, will break
 *       setTimeout(function() {model.record;}, 30) = FINE, will work.
 * There may be other places that need to be updated so the scope is correct.
 */
window.ScratchpadRecord = Backbone.Model.extend({

    initialize: function() {
        // Instance variables, not attributes.
        // Recording handlers, handle both recording and playback
        this.handlers = {};
        // Cache recording state for seeking
        this.seekCache = {};
        this.seekCacheInterval = 20;
        this.initData = {};
        this.seekTime = null;
        // Collection of caching functionality implemented by content
        // producers (for example: ScratchpadCanvas and ScratchpadEditor)
        this.seekCachers = {};

        // Set up for recording in chunks
        // Array of command arrays for each chunk. Only holds chunks that
        // have been saved.
        this.allSavedCommands = [];
        this.actualInitData;  // The init data from the first chunk
    },

    setActualInitData: function(actualData) {
        this.actualInitData = actualData;
    },

    hasNoChunks: function() {
        return _.isEmpty(this.allSavedCommands);
    },

    numChunksSaved: function() {
        return this.allSavedCommands.length;
    },

    startRecordChunk: function(audioOffset) {
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
                    lastTime = _.last(_.last(this.allSavedCommands)).time;
                }
            }
            return lastTime;
        }
    },

    stopRecordChunk: function() {
        this.stopRecord();
    },

    saveRecordChunk: function() {
        this.allSavedCommands.push(this.commands);
        // Set the offset as the time that the chunk we just recorded goes up
        // to, counting from the start of the full recording (full duration)
        this._resetForNewChunk();
    },


    discardRecordChunk: function() {
        // Reset the current stop time to be the same as the duration up to
        // the start of the chunk we just recorded (not the end since
        // we discard the chunk just recorded)
        this._resetForNewChunk();
    },

    _resetForNewChunk: function() {
        this.commands = [];
        this.initData = {};
    },

    /*
     * Offset in milliseconds allows us to pause/resume recording at a certain
     *  offset into the program. See Record.log for how startTime is used
     *  to compute the current time in the recording for each command.
     */
    record: function(offset) {
        offset = offset || 0;
        if (!this.recording) {
            this.commands = [];
            this.recording = true;
            this.startTime = (new Date).getTime() - offset;
            this.trigger("recordStarted");
        }
    },

    stopRecord: function() {
        if (this.recording) {
            this.recording = false;
            this.recorded = true;
            this.trigger("recordEnded");
        }
    },

    loadRecording: function(commands) {
        if (commands && commands.commands && commands.init) {
            this.initData = commands.init;
            commands = commands.commands;
        }
        this.commands = commands;
    },

    dumpRecording: function() {
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

    getVersion: function() {
        return this.initData.configVersion || 0;
    },

    // Position the seek cursor and make sure that the seek render
    // occurs within the next 200ms
    seekTo: function(time) {
        if (this.seekRunning) {
            return false;
        }

        // Initialize and seek to the desired position
        this.seekRunning = true;
        this.seekTime = time;
        this.pauseTime = (new Date()).getTime();
        this.playStart = this.pauseTime - time;

        if (!this.seekInterval) {
            // Make sure that we don't attempt to seek too frequently
            this.seekInterval = setInterval(_.bind(function() {
                if (this.seekTime !== null) {
                    this.runSeek(this.seekTime);
                    this.seekTime = null;
                }
            }, this), 200);
        }
    },

    // Execute the actual seek commands
    runSeek: function(time) {
        this.trigger("runSeek", time);

        // Set an initial cache before seeking
        this.cache(-1 * this.seekCacheInterval);

        var seekPos = this.commands.length;

        // Locate the command that we're up to
        for (var i = 0; i < this.commands.length; i++) {
            if (this.commands[i].time > time) {
                seekPos = i - 1;
                break;
            }
        }

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
            cacheOffset = (foundCache * this.seekCacheInterval) + 1;

        // Otherwise restore from the first cache state
        // The first cache is at -1 as the cache at position 0 is the
        // cache of running the first command
        } else {
            this.cacheRestore(-1 * this.seekCacheInterval);
        }

        this.runSeekCommands(cacheOffset, seekPos);

        // The play position is always the next command time to check
        // (see the logic in playInterval)
        this.playPos = seekPos + 1;
    },

    runSeekCommands: function(offset, seekPos) {
        // Execute commands and build cache, bringing state up to current
        for (var i = offset; i <= seekPos; i++) {
            var async = (_.bind(function(i) {
                var cmd = this.commands[i];

                if (cmd) {
                    this.runCommand(cmd);

                    if (cmd.copy || cmd.cut || cmd.paste || cmd.key) {
                        setTimeout(_.bind(function() {
                            this.cache(i);
                            this.runSeekCommands(i + 1, seekPos);
                        }, this), 1);

                        return true;
                    }
                    
                    this.cache(i);
                }
            }, this))(i);

            // If we run an async command, the setTimeout takes care of all
            // remaining seek commands, so stop.
            if (async) {
                return;
            }
        }

        this.seekRunning = false;

        this.trigger("seekDone");
    },



    // Cache the result of the specified command
    // (Specified using the position of the command)
    cache: function(cmdPos) {
        // Start to build new caches, only if we should
        if (cmdPos % this.seekCacheInterval === 0) {
            var cachePos = Math.floor(cmdPos / this.seekCacheInterval);
            if (!this.seekCache[cachePos]) {
                this.seekCache[cachePos] = {};

                // Run all the seek cachers and cache the current data
                _.each(this.seekCachers, function(seekCacher, namespace) {
                    this.seekCache[cachePos][namespace] =
                        seekCacher.getState();
                }, this);
            }
        }
    },

    // Restore the state from a seek cache
    // (specified using the seek cache number)
    cacheRestore: function(cachePos) {
        if (this.seekCache[cachePos]) {
            // Run all the seek cachers and restore the current data
            _.each(this.seekCachers, function(seekCacher, namespace) {
                var cacheData = this.seekCache[cachePos][namespace];

                if (cacheData) {
                    seekCacher.restoreState(cacheData);
                }
            }, this);
        }
    },

    play: function() {
        // Don't play if we're already playing or recording
        if (this.recording || this.playing || !this.commands ||
                this.seekRunning || this.commands.length === 0) {
            return;
        }

        // Initialize state before playback
        this.trigger("playInit");

        var startTime = (this.playStart ? this.pauseTime - this.playStart : 0);

        // Make sure everything is reset before playing
        this.seekTo(startTime);

        this.playing = true;
        this.playPos = this.playPos || 0;
        this.playStart = (new Date).getTime() - startTime;

        this.playInterval = setInterval(_.bind(function() {
            if (this.seekRunning) {
                // Never run play commands while a seek is still running its
                // own commands, otherwise they'll stomp on each other.
                return;
            }

            var evt = this.commands[this.playPos];

            if (evt && this.currentTime() >= evt.time) {
                this.runCommand(evt);
                this.cache(this.playPos);

                if (++this.playPos === this.commands.length) {
                    this.stopPlayback(true);
                    this.trigger("playEnded");
                }
            }
        }, this), 1);

        this.trigger("playStarted", startTime > 0);
    },

    pausePlayback: function(end) {
        clearInterval(this.playInterval);

        this.playing = false;
        this.playInterval = null;
        this.pauseTime = (new Date).getTime();

        if (!end) {
            this.trigger("playPaused");
        }
    },

    stopPlayback: function(end) {
        this.pausePlayback(end);

        if (!end) {
            this.trigger("playStopped");
        }

        this.playPos = null;
        this.playStart = null;
        this.pauseTime = null;

        clearInterval(this.seekInterval);
        this.seekInterval = null;
    },

    reset: function() {
        this.initData = {};
        this.commands = [];
        this.seekCache = {};

        this.playPos = null;
        this.playStart = null;
        this.pauseTime = null;
        this.seekTime = null;
        this.playing = false;
        this.recording = false;
        this.recorded = false;

        clearInterval(this.seekInterval);
        this.seekInterval = null;
    },

    currentTime: function() {
        return (new Date).getTime() - this.playStart;
    },

    runCommand: function(evt) {
        if (evt) {
            for (var handler in this.handlers) {
                if (typeof evt[handler] !== "undefined") {
                    try {
                        return this.handlers[handler](evt);
                    } catch (e) {
                        // These errors sometimes happen if the Record
                        // playback state gets corrupted.
                        KAConsole.log("Scratchpad playback error: ");
                        KAConsole.log(e);
                    }
                }
            }
        }
    },

    log: function(e) {
        if (!this.playing && this.recording && this.commands) {
            e.time = (new Date).getTime() - this.startTime;
            this.commands.push(e);
            return true;
        }
    },

    pauseLog: function() {
        this.oldRecording = this.recording;
        this.recording = false;
    },

    resumeLog: function() {
        this.recording = this.oldRecording;
    },

    dump: function() {
        if (this.commands) {
            return this.commands.map(function(item) {
                var ret = [];

                for (var prop in item) {
                    if (prop !== "time") {
                        ret.push(prop + ":" + item[prop]);
                    }
                }

                return ret.join();
            }).join();
        }
    }
});
// Maintain all of the configuration options and settings for the site.
// Have them be versioned and attached to the ScratchpadRevision so that
// later config changes don't break old code.
var ScratchpadConfig = Backbone.Model.extend({
    version: null,

    initialize: function(options) {
        this.version = options.version;

        if (this.version != null) {
            this.version = this.latestVersion();
        }
    },

    // Run the configuration functions for a particular namespace
    // of functionality. Can optionally take any number of
    // additional arguments.
    runCurVersion: function(type) {
        var args = Array.prototype.slice.call(arguments, 0);
        args.unshift(this.curVersion());
        return this.runVersion.apply(this, args);
    },

    // Run the configuration functions for a particular namespace
    // of functionality, for a particular config version. Can optionally
    // take any number of additional arguments.
    runVersion: function(version, type) {
        var args = Array.prototype.slice.call(arguments, 2);

        for (var i = 0; i <= version; i++) {
            var configFn = this.versions[i][type];

            if (configFn) {
                configFn.apply(this, args);
            }
        }
    },

    switchVersion: function(version) {
        // Make sure we're switching to a new version
        if (version !== this.curVersion()) {
            // Set the new version
            this.version = version;

            // Run the inits for all bound handlers
            this.trigger("versionSwitched", version);
        }
    },

    // Get the current config version
    curVersion: function() {
        if (this.version != null) {
            return this.version;
        }

        return this.latestVersion();
    },

    // Get the latest config version
    latestVersion: function() {
        return this.versions.length - 1;
    },

    autoCompleteBehavior: {
        autoBrace: false,
        braceIndent: true,
        equalsInsert: true
    },

    bindAutoComplete: function(editor, autoCompleteBehavior) {
        var self = this;
        autoCompleteBehavior = autoCompleteBehavior ||
            this.autoCompleteBehavior;

        // When a { is typed, an endline, indentation, and another endline
        // are inserted. The cursor is set after the indentation.
        // Additionally make it so that if "var draw =" is typed then
        // the associated "function() { ... }; are inserted as well.
        var behavior = editor.getSession().getMode().$behaviour;

        // Reset auto-complete for parentheses and quotes
        // (matches earlier Ace behavior)
        behavior.add("parens", "insertion", function() {});
        behavior.add("parens", "deletion", function() {});
        behavior.add("brackets", "insertion", function() {});
        behavior.add("brackets", "deletion", function() {});
        behavior.add("string_dquotes", "insertion", function() {});
        behavior.add("string_dquotes", "deletion", function() {});

        // Auto-completion code based on code from
        // Ace Editor file: ace-mode-javascript.js
        behavior.add("braces", "insertion", function(state, action,
                editor, session, text) {
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

                    var indent = this.getNextLineIndent(state,
                        line.substring(0, line.length - 1),
                        session.getTabString());
                    var nextIndent = this.$getIndent(
                        session.doc.getLine(cursor.row));

                    // The case of if (EXPR) { doesn't indent properly
                    // as the if (EXPR) line doesn't trigger an additional
                    // indentation level, so we force it to work.
                    if (indent === nextIndent) {
                        indent += session.getTabString();
                    }

                    return {
                        text: "{\n" + indent + selected + "\n" +
                            nextIndent + "}" + maybeSemicolon,
                        // Format:
                        // [ rowStartSelection, colStartSelection,
                        //   rowEndSelection, colEndSelection ]
                        selection: [1, indent.length, 1, indent.length]
                    };
                }

            } else if (text === "}") {
                var rightChar = line.substring(cursor.column,
                    cursor.column + 1);
                if (rightChar === "}") {
                    var matching = session.$findOpeningBracket("}",
                        {column: cursor.column + 1, row: cursor.row});
                    if (matching !== null) {
                        return {
                            text: "",
                            selection: [1, 1]
                        };
                    }
                }
            } else if (text === "\n") {
                var rightChar = line.substring(cursor.column,
                    cursor.column + 1);
                if (rightChar === "}") {
                    var openBracePos = session.findMatchingBracket(
                        {row: cursor.row, column: cursor.column + 1});
                    if (!openBracePos) {
                        return null;
                    }

                    var indent = this.getNextLineIndent(state,
                        line.substring(0, line.length - 1),
                        session.getTabString());
                    var nextIndent = this.$getIndent(
                        session.doc.getLine(openBracePos.row));

                    return {
                        text: "\n" + indent + "\n" + nextIndent,
                        selection: [1, indent.length, 1, indent.length]
                    };
                }
            }
        });

        // Auto-completion code based on code from
        // Ace Editor file: ace-mode-javascript.js
        behavior.add("equals", "insertion", function(state, action,
                editor, session, text) {

            if (!autoCompleteBehavior.equalsInsert) {
                return;
            }

            var cursor = editor.getCursorPosition();
            var line = session.doc.getLine(cursor.row);

            if (text === "=" && /\bdraw\s*$/.test(line)) {
                var selection = editor.getSelectionRange();
                var selected = session.doc.getTextRange(selection);

                var indent = this.getNextLineIndent(state,
                    line.substring(0, line.length - 1),
                    session.getTabString());
                var nextIndent = this.$getIndent(
                    session.doc.getLine(cursor.row));

                // The case of if (EXPR) { doesn't indent properly
                // as the if (EXPR) line doesn't trigger an additional
                // indentation level, so we force it to work.
                if (indent === nextIndent) {
                    indent += session.getTabString();
                }

                return {
                    text: "= function() {\n" + indent + selected + "\n" +
                        nextIndent + "};",
                    selection: [1, indent.length, 1, indent.length]
                };
            }
        });
    },

    // The configuration options
    // All configuration options are namespaced and versioned
    versions: [
        {
            name: "Initial Configuration",

            // Ace editor configuration
            editor: function(editor) {
                // Don't highlight the active line
                editor.setHighlightActiveLine(false);

                // Stop bracket highlighting
                editor.$highlightBrackets = function() {};

                // Make sure no horizontal scrollbars are shown
                editor.renderer.setHScrollBarAlwaysVisible(false);

                var session = editor.getSession();

                // Use word wrap
                session.setUseWrapMode(true);

                // Use soft tabs
                session.setUseSoftTabs(true);

                // Stop automatic JSHINT warnings
                session.setUseWorker(false);

                // Set the font size
                editor.setFontSize("14px");

                // Disable highlighting the selected word
                editor.setHighlightSelectedWord(false);

                // Show line numbers and enable code collapsing
                editor.renderer.setShowGutter(true);

                // Don't show print margin
                editor.renderer.setShowPrintMargin(false);

                // Use JavaScript Mode
                session.setMode("ace/mode/javascript");

                // Set the editor theme
                editor.setTheme("ace/theme/textmate");

                // Attach the auto-complete for the editor
                // (must be re-done every time the mode is set)
                this.bindAutoComplete(editor, {
                    autoBrace: true
                });
            },

            // JSHint configuration
            // See: http://www.jshint.com/options/
            jshint: function() {
                // NOTE(joel) - Output is not in scope here
                if (typeof Output === "undefined") {
                    return;
                }

                Output.JSHint = {
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
                    shadow: true
                };
            },

            // Processing.js configuration
            processing: function(canvas) {
                canvas.size(400, 400);
                canvas.frameRate(30);
                canvas.angleMode = "radians";
            }
        },

        {
            name: "Switch to Degress from Radians",

            processing: function(canvas) {
                canvas.angleMode = "degrees";
            }
        },

        {
            name: "Brace Autocompletion Changes",

            editor: function(editor) {
                // Set the brace autocomplete behavior
                this.bindAutoComplete(editor, {
                    autoBrace: false,
                    braceIndent: true,
                    equalsInsert: true
                });
            }
        },

        {
            name: "Disable Un-needed JSHint Rules",

            jshint: function() {
                // NOTE(joel) - Output is not in scope here
                if (typeof Output === "undefined") {
                    return;
                }

                // Re-allow empty braces
                delete Output.JSHint.noempty;

                // Re-allow ++ and --
                delete Output.JSHint.plusplus;
            }
        }
    ]
});