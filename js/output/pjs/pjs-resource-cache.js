function PJSResourceCache(options) {
    this.canvas = options.canvas;   // customized Processing instance
    this.output = options.output;   // LiveEditorOutput instance
    this.cache = {};
    this.imageHolder = null;

    // Insert the images into a hidden div to cause them to load
    // but not be visible to the user
    if (!this.imageHolder) {
        this.imageHolder = document.createElement("div");
        this.imageHolder.style.height = 0;
        this.imageHolder.style.width = 0;
        this.imageHolder.style.overflow = "hidden";
        this.imageHolder.style.position = "absolute";
        document.body.appendChild(this.imageHolder);
    }
}

/**
 * Load and cache all resources (images and sounds) referenced in the code.
 *
 * All resources are loaded as we don't have more details on exactly which
 * images will be required.  Execution is delayed if a getImage/getSound call
 * is encountered in the source code and none of the resources have been loaded
 * yet.  Execution begins once all the resources have loaded.
 *
 * @param {Object} resources A object whose keys are filenames
 * @returns {Promise}
 */
PJSResourceCache.prototype.cacheResources = function(resources) {
    var promises = Object.keys(resources).map((filename) => {
        return this.loadResource(filename);
    });
    return Promise.all(promises);
};

PJSResourceCache.prototype.loadResource = function(filename) {
    if (filename.endsWith(".png")) {
        return this.loadImage(filename);
    } else if (filename.endsWith(".mp3")) {
        return this.loadSound(filename);
    }
};

PJSResourceCache.prototype.loadImage = function(filename) {
    return new Promise((resolve) => {
        var path = this.output.imagesDir + filename;
        var img = document.createElement("img");

        // Fixes a security error when we attempt to extract image data from this
        // canvas.
        // https://developer.mozilla.org/en-US/docs/Web/API/HTMLImageElement/crossOrigin
        img.crossOrigin = "anonymous";

        img.onload = () => {
            this.cache[filename] = img;
            resolve();
        };
        img.onerror = () => {
            resolve(); // always resolve
        };

        img.src = path;
        this.imageHolder.appendChild(img);
    });
};

PJSResourceCache.prototype.loadSound = function(filename) {
    return new Promise((resolve) => {
        var audio = document.createElement("audio");
        var parts = filename.split("/");

        var group = _.findWhere(OutputSounds[0].groups, { groupName: parts[0] });
        var hasSound = group && group.sounds.includes(parts[1].replace(".mp3", ""));
        if (!hasSound) {
            resolve();
            return;
        }

        audio.preload = "auto";
        audio.oncanplaythrough = () => {
            this.cache[filename] = {
                audio: audio,
                __id: function () {
                    return `getSound('${filename.replace(".mp3", "")}')`;
                }
            };
            resolve();
        };
        audio.onerror = () => {
            resolve();
        };

        audio.src = this.output.soundsDir + filename;
    });
};

PJSResourceCache.prototype.getResource = function(filename, type) {
    switch (type) {
        case "image":
            return this.getImage(filename);
        case "sound":
            return this.getSound(filename);
        default:
            throw "we can't load '" + type + "' resources yet";
    }
};

PJSResourceCache.prototype.getImage = function(filename) {
    var image = this.cache[filename + ".png"];

    if (!image) {
        throw {message:
            i18n._("Image '%(file)s' was not found.", {file: filename})};
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
            i18n._("Sound '%(file)s' was not found.", {file: filename})};
    }

    return sound;
};

/**
 * Searches for strings containing the name of any image or sound we providefor
 * users and adds them to `resources` as a key.
 *
 * @param {string} code
 * @returns {Object}
 */
PJSResourceCache.findResources = function(code) {
    let ast = esprima.parse(code, { loc: true });

    let resources = {};
    walkAST(ast, null,
        [ASTTransforms.findResources(resources)]);

    return resources;
};
