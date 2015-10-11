var _ = require("underscore");

var ScratchpadAutosuggest = require("../autosuggest.js");
var TooltipBase = require("../tooltip-base.js");
var TooltipEngine = require("../tooltip-engine.js");
var TooltipUtils = require("./tooltip-utils.js");

// A description of general tooltip flow can be found in tooltip-engine.js
TooltipEngine.classes.imagePicker = TooltipBase.extend({
    defaultImage: "cute/None",

    initialize: function(options) {
        this.options = options;
        this.parent = options.parent;
        this.autofill = true;
        this.render();
        this.bindToRequestTooltip();
    },

    detector: function(event) {
        if (!/(\bgetImage\s*\()[^\)]*$/.test(event.pre)) {
            return;
        }
        var functionStart = event.col - RegExp.lastMatch.length;
        var paramsStart = functionStart + RegExp.$1.length;

        var pieces = /^(\s*)(["']?[^\)]*?["']?)\s*(\);?|$)/.exec(event.line.slice(paramsStart));
        var leadingPadding = pieces[1];
        var pathStart = paramsStart + leadingPadding.length;
        var path = pieces[2];
        this.closing = pieces[3];

        this.aceLocation = {
            start: pathStart,
            length: path.length,
            row: event.row
        };
        this.aceLocation.tooltipCursor = this.aceLocation.start + this.aceLocation.length + this.closing.length;

        // TODO(kevinb) extract this into a method on TooltipBase
        if (leadingPadding.length === 0 && path.length === 0 && this.closing.length === 0 &&
            event.source && event.source.action === "insertText" && event.source.text.length === 1 && this.autofill) {

            this.closing = ")" + (this.isInParenthesis(event.pre.slice(0, functionStart)) ? "" : ";");
            this.insert({
                row: event.row,
                column: pathStart
            }, this.closing);

            path = this.defaultImage;
            this.updateText(path);
        }
        this.updateTooltip(path);
        this.placeOnScreen();
        event.stopPropagation();
        ScratchpadAutosuggest.enableLiveCompletion(false);
    },

    render: function() {
        var imagesDir = this.options.imagesDir;

        var results = Handlebars.templates["image-picker"]({
            imagesDir: imagesDir,
            groups: _.map(OutputImages, function(data) {
                data.imagesDir = imagesDir;
                return data;
            })
        });

        this.$el = $("<div class='tooltip mediapicker'>" + results +
            "<div class='arrow'></div></div>")
            .appendTo("body").hide();


        this.bind();
    },

    bind: function() {
        var self = this;

        this.$(".media-groups").scroll(_.throttle(function() {
            TooltipUtils.lazyLoadMedia(this);
        }, 200, {leading: false}));

        this.$el
            .on("mouseenter", function() {
                TooltipUtils.lazyLoadMedia($(this));
            })
            .on("click", ".image", function() {
                $(this).parents(".mediapicker").find(".active").removeClass("active");
                $(this).addClass("active");
                self.updateText($(this).attr("data-path"));
            })
            .on("mouseleave", function() {
                self.options.editor.clearSelection();
                self.options.editor.focus();
            });
    },

    remove: function() {
        this.$el.remove();
        this.unbindFromRequestTooltip();
    },

    updateTooltip: function(rawPath) {
        var foundPath = this.defaultImage;

        var path = /^["']?(.*?)["']?$/.exec(rawPath)[1];
        var pathParts = path.split("/");
        var groupName = pathParts[0];
        var fileName = pathParts[1];
        _.each(OutputImages, function(group) {
            if (group.groupName === groupName) {
                _.each(group.images, function(imageName) {
                    if (imageName === fileName) {
                        foundPath = groupName + "/" + fileName;
                    }
                });
            }
        });

        var fullPath = this.parent.options.imagesDir + foundPath + ".png";
        this.$el.find(".current-media img")
            .attr("src", fullPath);

        this.value = path;
    },

    updateText: function(newPath) {
        var newText = '"' + newPath + '"';
        TooltipBase.prototype.updateText.call(this, newText);
        this.aceLocation.tooltipCursor = this.aceLocation.start + this.aceLocation.length + this.closing.length;
    }
});
