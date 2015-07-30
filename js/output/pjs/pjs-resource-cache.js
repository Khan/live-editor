function PJSResourceCache(options) {
    this.canvas = options.canvas;   // customized Processing instance
    this.output = options.output;   // LiveEditorOutput instance
    this.cache = {};
    this.imageHolder = null;
    
    this.queue = [];

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
}

/**
 * Load and cache all resources (images and sounds) referenced in the code.
 * 
 * All resources are loaded as we don't have more details on exactly which
 * images will be required.  Execution is delayed if a getImage/getSound call
 * is encountered in the source code and none of the resources have been loaded
 * yet.  Execution begins once all the resources have loaded.
 * 
 * @param ast: The root node of the AST for the code we want to cache resources 
 *             for.  The reason why we pass in an AST is because we'd like
 *             pjs-output.js to parse user code once and re-use the AST as many
 *             time as possible.
 * @returns {Promise}
 */
PJSResourceCache.prototype.cacheResources = function(ast) {
    estraverse.traverse(ast.program, {
        leave: (node) => {
            this.leave(node);
        }
    });
    this.queue = _.uniq(this.queue);
    var promises = this.queue.map((resource) => {
        return this.loadResource(resource);
    });
    this.queue = [];
    return $.when.apply($, promises);
};

PJSResourceCache.prototype.loadResource = function(resourceRecord) {
    var filename = resourceRecord.filename;
    switch (resourceRecord.type) {
        case "image":
            return this.loadImage(filename);
        case "sound":
            return this.loadSound(filename);
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
    var parts = filename.split("/");
    
    var group = _.findWhere(OutputSounds[0].groups, { groupName: parts[0] });
    if (!group || group.sounds.indexOf(parts[1]) === -1) {
        deferred.resolve();
        return deferred;
    }

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

// AST visitor method called by walkAST in pjs-output.js' exec method
PJSResourceCache.prototype.leave = function(node) {
    if (node.type === "Literal" && typeof(node.value) === "string") {

        OutputImages.forEach(group => {
            group.images.forEach(image => {
                if (node.value.indexOf(image) !== -1) {
                    this.queue.push({
                        filename: `${group.groupName}/${image}`,
                        type: "image"
                    });
                }
            });
        });

        OutputSounds.forEach(cls => {
            cls.groups.forEach(group => {
                group.sounds.forEach(sound => {
                    if (node.value.indexOf(sound) !== -1) {
                        this.queue.push({
                            filename: `${group.groupName}/${sound}`,
                            type: "sound"
                        });
                    }
                });
            });
        });
    }
};
