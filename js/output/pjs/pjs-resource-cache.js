/* eslint-disable prefer-spread, no-extra-bind, no-throw-literal */
/* TODO: Fix the lint errors */
const _ = require("lodash");
const esprima = require("esprima");
const i18n = require("i18n");

const ASTTransforms = require("./pjs-ast-transforms.js");
const OutputSounds = require("../../shared/sounds.js");
const walkAST = require("../shared/ast-walker.js");

const PJSResourceCache = function(options) {
    this.canvas = options.canvas;   // customized Processing instance
    this.imagesDir = options.imagesDir;
    this.soundsDir = options.soundsDir;
    this.cache = {};
    this.imageHolder = null;

    // Insert the images into a hidden div to cause them to load
    // but not be visible to the user
    if (!this.imageHolder) {
        this.imageHolder = document.createElement("div")
        this.imageHolder.style.height = 0;
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
    const promises = Object.keys(resources).map((filename) => {
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
        const path = this.imagesDir + filename;
        const img = document.createElement("img");

        img.onload = () => {
            this.cache[filename] = img;
            resolve();
        };
        img.onerror = () => {
            resolve(); // always resolve
        };
        img.src = path;
        this.imageHolder.append(img);
    });
};

PJSResourceCache.prototype.loadSound = function(filename) {
    return new Promise((resolve) => {
        const audio = document.createElement("audio");
        const parts = filename.split("/");

        const group = _.findWhere(OutputSounds[0].groups, { groupName: parts[0] });
        const hasSound = group && group.sounds.includes(parts[1].replace(".mp3", ""));
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

        audio.src = this.soundsDir + filename;
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
    const image = this.cache[filename + ".png"];

    if (!image) {
        throw {message:
            i18n._("Image '%(file)s' was not found.", {file: filename})};
    }

    // cache <img> instead of PImage until we investigate how caching
    // PImage instances affects loadPixels(), pixels[], updatePixels()
    const pImage = new this.canvas.PImage(image);
    pImage.__id = function() {
        return "getImage('" + filename + "')";
    };

    return pImage;
};

PJSResourceCache.prototype.getSound = function(filename) {
    const sound = this.cache[filename + ".mp3"];

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
    const ast = esprima.parse(code, { loc: true });

    const resources = {};
    walkAST(ast, null,
        [ASTTransforms.findResources(resources)]);

    return resources;
};

module.exports = PJSResourceCache;