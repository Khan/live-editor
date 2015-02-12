var PJSResourceCache = Backbone.Model.extend({

    initialize: function(options) {
        this.canvas = options.canvas;   // customized Processing instance
        this.output = options.output;   // LiveEditorOutput instance
        this.cache = {};
        this.imageHolder = null;
    },

    // Load and cache all resources (images and sounds) that could be used in 
    // the environment.  Right now all resources are loaded as we don't have 
    // more details on exactly which images will be required.
    //
    // Execution is delayed once a getImage/getSound appears in the source code
    // and none of the resources are cached. Execution begins once all the
    // resources have loaded.
    cacheResources: function(userCode, callback) {
        var getImageRegex = /getImage\s*\(['"](.*?)['"]\)/g;
        var images = this.getRegexMatches(userCode, getImageRegex, 1);
        var getSoundRegex = /getSound\s*\(['"](.*?)['"]\)/g;
        var sounds = this.getRegexMatches(userCode, getSoundRegex, 1);

        // Insert the images into a hidden div to cause them to load
        // but not be visible to the user
        if (!this.imageHolder) {
            this.imageHolder = $("<div>")
                .css({
                    height: 0,
                    width: 0,
                    overflow: "hidden",
                    position: "absolute"
                })
                .appendTo("body");
        }

        var promises = images.map(this.loadImage.bind(this));
        promises = promises.concat(sounds.map(this.loadSound.bind(this)));

        $.when.apply($, promises).then(callback);
    },

    // Helper method to return an array of regex subgroup matches
    getRegexMatches: function(userCode, regex, subgroupIndex) {
        var matches = [];
        var match = regex.exec(userCode);
        while (match) {
            matches.push(match[subgroupIndex]);
            match = regex.exec(userCode);
        }
        return matches;
    },

    loadImage: function(file) {
        var deferred = $.Deferred();
        var path = this.output.imagesDir + file + ".png";

        var img = document.createElement("img");
        img.onload = function() {
            var pImg = new this.canvas.PImage(img);
            pImg.__id = function() {
                return "getImage('" + file + "')";
            };
            this.cache[file + ".png"] = pImg;
            deferred.resolve();
        }.bind(this);
        img.onerror = function() {
            deferred.resolve(); // always resolve
        }.bind(this);

        img.src = path;
        this.imageHolder.append(img);

        return deferred;
    },

    loadSound: function(file) {
        var deferred = $.Deferred();
        var audio = document.createElement("audio");

        audio.preload = "auto";
        audio.oncanplaythrough = function() {
            this.cache[file + ".mp3"] = {
                audio: audio,
                __id: function () {
                    return "getSound('" + file + "')";
                }
            };
            deferred.resolve();
        }.bind(this);
        audio.onerror = function() {
            deferred.resolve();
        }.bind(this);

        audio.src = this.output.soundsDir + file + ".mp3";

        return deferred;
    },

    getImage: function(file) {
        var cachedFile = this.cache[file + ".png"];

        if (!cachedFile) {
            throw {message:
                $._("Image '%(file)s' was not found.", {file: file})};
        }

        return cachedFile;
    },

    getSound: function(filename) {
        var sound = this.cache[filename + ".mp3"];

        if (!sound) {
            throw {message:
                $._("Sound '%(file)s' was not found.", {file: filename})};
        }

        return sound;
    }
});
