function PJSResourceCache(options) {
    this.canvas = options.canvas;   // customized Processing instance
    this.output = options.output;   // LiveEditorOutput instance
    this.cache = {};
    this.imageHolder = null;
}

// Load and cache all resources (images and sounds) that could be used in 
// the environment.  Right now all resources are loaded as we don't have 
// more details on exactly which images will be required.
//
// Execution is delayed once a getImage/getSound appears in the source code
// and none of the resources are cached. Execution begins once all the
// resources have loaded.
PJSResourceCache.prototype.cacheResources = function(userCode, callback) {
    var resourceRecords = this.getResourceRecords(userCode);

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

    var promises = resourceRecords.map(this.loadResource.bind(this));

    $.when.apply($, promises).then(callback);
};

PJSResourceCache.prototype.getResourceRecords = function(userCode) {
    var resourceRegex = /get(Image|Sound)\s*\(\s*['"](.*?)['"]\s*\)/g;

    var resources = [];
    var match = resourceRegex.exec(userCode);
    while (match) {
        resources.push({
            filename: match[2],
            type: match[1].toLowerCase()
        });
        match = resourceRegex.exec(userCode);
    }

    return resources;
};

PJSResourceCache.prototype.loadResource = function(resourceRecord) {
    var filename = resourceRecord.filename;
    switch (resourceRecord.type) {
        case "image":
            return this.loadImage(filename);
            break;
        case "sound":
            return this.loadSound(filename);
            break;
        default:
            break;
    }
};

PJSResourceCache.prototype.loadImage = function(filename) {
    var deferred = $.Deferred();
    var path = this.output.imagesDir + filename + ".png";
    var img = document.createElement("img");

    img.onload = function() {
        this.cache[filename + ".png"] = img;
        deferred.resolve();
    }.bind(this);
    img.onerror = function() {
        deferred.resolve(); // always resolve
    }.bind(this);

    img.src = path;
    this.imageHolder.append(img);

    return deferred;
};

PJSResourceCache.prototype.loadSound = function(filename) {
    var deferred = $.Deferred();
    var audio = document.createElement("audio");

    audio.preload = "auto";
    audio.oncanplaythrough = function() {
        this.cache[filename + ".mp3"] = {
            audio: audio,
            __id: function () {
                return "getSound('" + filename + "')";
            }
        };
        deferred.resolve();
    }.bind(this);
    audio.onerror = function() {
        deferred.resolve();
    }.bind(this);

    audio.src = this.output.soundsDir + filename + ".mp3";

    return deferred;
};

PJSResourceCache.prototype.getResource = function(filename, type) {
    switch (type) {
        case "image":
            return this.getImage(filename);
            break;
        case "sound":
            return this.getSound(filename);
            break;
        default:
            throw "we can't load '" + type + "' resources yet";
            break;
    }
};

PJSResourceCache.prototype.getImage = function(filename) {
    var image = this.cache[filename + ".png"];

    if (!image) {
        throw {message:
            $._("Image '%(file)s' was not found.", {file: filename})};
    }

    // cache <img> instead of PImage until we investigate how caching
    // PImage instances affects loadPixels(), pixels[], updatePixels()
    var pImage = new this.canvas.PImage(image);
    pImage.__id = function() {
        return "getImage('" + filename + "')";
    };

    return pImage;
};

PJSResourceCache.prototype.getSound = function(filename) {
    var sound = this.cache[filename + ".mp3"];

    if (!sound) {
        throw {message:
            $._("Sound '%(file)s' was not found.", {file: filename})};
    }

    return sound;
};
