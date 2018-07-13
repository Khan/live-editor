const $ = require("jquery");
const Backbone = require("backbone");
Backbone.$ = require("jquery");
const React = require("react");
const ReactDOM = require("react-dom");

const MediaPickerTooltip = require("./media-picker-tooltip.jsx");
const TooltipBase = require("../../ui/tooltip-base.js");
const TooltipEngine = require("../../ui/tooltip-engine.js");

/* This file contains both the imageModal and soundModal tooltip, which share
 the same Modal() View, but have fairly different ways that they hook into
 the editor and replace the code.
 The imageModal is currently used only by webpages,
 and the soundModal is currently used only by programs.
 In the future, the imageModal might also be used by programs,
 as students seem to prefer that UI to the imagePicker UI.
 */
(function() {
    var Modal = Backbone.View.extend({
        initialize: function(options) {
            this.options = options;
            this.parent = options.parent;
            this.render();
            this.bind();
        },

        // There are more bindings below in events.
        // These are here because scroll events cannot be delegated
        bind: function() {
            // Handle the shadow which appears on scroll
            this.$(".mediapicker-modal-content").scroll(
                _.throttle(function(e) {
                    var $target = $(e.currentTarget);
                    if ($target.scrollTop() > 0) {
                        $target.addClass("top-shadow");
                    } else {
                        $target.removeClass("top-shadow");
                    }
                }, 100)
            );

            // Treat playing an audio file like a selection
            // The play event can't be delegated, so we do it here.
            this.$(".mediapicker-modal-file audio").on("play", function(e) {
                this.handleFileSelect(e);
            }.bind(this));
        },

        events: {
            // Highlight file when it is clicked
            "click .mediapicker-modal-file": "handleFileSelect",

            "hide.bs.modal": function() {
                this.scrollStart = undefined;
                $("body").css("overflow", "auto");
                this.logForRecording("hide");
            },

            // Update the url in ACE if someone clicks ok
            "click .mediapicker-modal-submit": function(e) {
                var $active = this.$(".mediapicker-modal-file.active");
                if ($active.length !== 1) {
                    return;
                }
                // The update and preview path are same for images,
                //  but differ for sound by the addition of quotation marks
                this.parent.updateText($active.attr("data-update-path"));
                this.parent.updateTooltip($active.attr("data-preview-path"));
            }
        },

        // Normally we could just listen to the show event on the modal,
        // but an indistinguishable "show" event also bubbles from the tab.
        // Instead we call this show() event ourselves when the button is clicked.
        show: function() {
            this.$el.modal();
            $("body").css("overflow", "hidden");
            this.$(".mediapicker-modal-file.active").removeClass("active");
            this.logForRecording("show");
        },

        handleFileSelect: function(e) {
            this.$(".mediapicker-modal-file.active").removeClass("active");
            var $file = $(e.currentTarget).closest(".mediapicker-modal-file");
            $file.addClass("active");
            this.logForRecording("selectImg", $file.attr("data-path"));
        },

        selectFile: function(dataPath) {
            var $file = this.$(".mediapicker-modal-file[data-path='"+dataPath+"']");
            var $pane = $file.closest(".tab-pane");
            var $tab = this.$("a[href='#"+$pane.attr("id")+"']");
            $tab.tab("show");
            $pane.find(".mediapicker-modal-content").scrollTop(
                $file.position().top - 100);
            return $file;
        },

        selectImg: function(dataPath) {
            var $file = this.selectFile(dataPath);
            $file.find("img").click();
        },

        logForRecording: function(action, value) {
            var logPrefix = this.options.logPrefix || "mediamodal";
            var logAction = logPrefix + "." + action;
            this.options.record && this.options.record.log(logAction, value);
        },

        renderMediaPickerGallery() {
            const props = {
                imagesDir: this.options.imagesDir,
                soundsDir: this.options.soundsDir,
                classes: this.options.files
            }
            ReactDOM.render(
                React.createElement(MediaPickerGallery, props, null),
                this.$el[0]);
        },

        render: function() {
            this.$el = $("<div class='media-gallery-wrapper'/>")
                .appendTo("body").hide();
            this.renderMediaPickerGallery();
        }
    });

    const ImageModal = TooltipBase.extend({
        initialize: function(options) {
            this.options = options;
            this.options.files = ExtendedOutputImages;
            this.parent = options.parent;
            this.autofill = true;
            this.render();
            this.bindToRequestTooltip();
            if (this.options.record) {
                Object.assign(this.options.record.handlers, {
                    "imagemodal.show": this.modal.show.bind(this.modal),
                    "imagemodal.hide": function(){
                        this.modal.$el.modal("hide");
                    }.bind(this),
                    "imagemodal.selectImg": this.modal.selectImg.bind(this.modal)
                });
            }

        },

        detector: function(event) {
            if (!/<img\s+[^>]*?\s*src\s*=\s*["']([^"']*)$/.test(event.pre)) {
                return;
            }
            var urlStart = event.col - RegExp.$1.length;
            var url = event.line.slice(urlStart).match(/^[^"']*/)[0];
            this.aceLocation = {
                start: urlStart,
                length: url.length,
                row: event.row
            };
            this.aceLocation.tooltipCursor = this.aceLocation.start + this.aceLocation.length + 1;

            this.updateTooltip(url);
            this.placeOnScreen();
            event.stopPropagation();
            ScratchpadAutosuggest.enableLiveCompletion(false);
        },

        updateTooltip: function(url) {
            if (url !== this.currentUrl) {
                this.currentUrl = url.trim();
                if (url === "") {
                    this.renderPreview({
                        errorMessage: i18n._("Enter an image URL."),
                        errorType: "notice"
                    });
                    return;
                }
                var allowedHosts = /(\.|^)?(khanacademy\.org|kastatic\.org|kasandbox\.org|ka-perseus-images\.s3\.amazonaws\.com|wikimedia\.org|localhost:\d+)$/i;
                var match = /\/\/([^\/]*)(?:\/|\?|#|$)/.exec(url);
                var host = match ? match[1] : "";
                if (!host || allowedHosts.test(host)) {
                    this.renderPreview({
                        imageSrc: url
                    });
                } else {
                    this.renderPreview({
                        errorMessage: i18n._("Sorry! That server is not permitted."),
                        errorType: "error"
                    });
                }
            }
        },

        renderPreview: function(props) {
            props = props || {};
            props.mediaType = "image";
            props.onBrowseClick = () => {
                this.modal.show();
            }
            props.imagesDir = this.options.imagesDir;
            props.soundsDir = this.options.soundsDir;
            props.mediaClasses = this.options.files;

            ReactDOM.render(
                React.createElement(MediaPickerTooltip, props, null),
                this.$el.find(".media-preview-wrapper")[0]);
        },

        render: function() {
            var self = this;

            this.$el = $("<div class='tooltip mediapicker-preview'>" +
                        "<div class='media-preview-wrapper'/>" +
                        "<div class='arrow'></div></div>")
                .addClass("mediapicker__image")
                .appendTo("body").hide();

            this.renderPreview();

            /*
            this.modal = new Modal(_.defaults({
                parent: this,
                TODO: logPrefix: "imagemodal"
            }, this.options));
            */
        },

        remove: function() {
            this.$el.remove();
            this.modal.remove();
            this.unbindFromRequestTooltip();
        }
    });

    const SoundModal = TooltipBase.extend({
        defaultFile: "\"rpg/metal-clink\"",
        initialize: function(options) {
            this.options = options;
            this.options.files = OutputSounds;
            this.parent = options.parent;
            this.autofill = true;
            this.render();
            this.bindToRequestTooltip();
        },

        detector: function(event) {
            if (!/(\bgetSound\s*\()[^\)]*$/.test(event.pre)) {
                return;
            }
            // This is quite similar to code in image-picker.js,
            //  but my attempts to abstract it were thwarted by
            //  PhantomJS's inability to pass around RegEx objects in tests.
            //  That should be fixed in PhantomJS2.0, so we are eagerly
            //  awaiting the upgrade of gulp-mocha-phantomjs to that.
            var functionStart = event.col - RegExp.lastMatch.length;
            var paramsStart = functionStart + RegExp.$1.length;

            var pieces = /^(\s*)(["']?[^\)]*?["']?)\s*(\);?|$)/.exec(event.line.slice(paramsStart));
            var leading = pieces[1];
            var pathStart = paramsStart + leading.length;
            var path = pieces[2];
            var closing = pieces[3];

            if (leading.length === 0 &&
                path.length === 0 &&
                closing.length === 0 &&
                event.source &&
                event.source.action === "insert" &&
                event.source.lines[0].length === 1 && this.autofill) {
                closing = ")" + (this.isInParenthesis(
                    event.pre.slice(0, functionStart)) ? "" : ";");
                this.insert({
                    row: event.row,
                    column: pathStart
                }, closing);

                path = this.defaultFile;
                this.updateText(path);
            }

            this.aceLocation = {
                start: pathStart,
                length: path.length,
                row: event.row
            };
            this.aceLocation.tooltipCursor = this.aceLocation.start +
                this.aceLocation.length + closing.length;

            this.updateTooltip(path);
            this.placeOnScreen();
            event.stopPropagation();
            ScratchpadAutosuggest.enableLiveCompletion(false);
        },

        updateTooltip: function(partialPath) {
            if (partialPath !== this.currentUrl) {
                partialPath = partialPath.replace(/\"/g, "");
                this.currentUrl = this.options.soundsDir + partialPath + ".mp3";
                if (partialPath === "") {
                    this.$(".thumb-error").text(i18n._("Invalid sound file.")).show();
                    return;
                } else {
                    this.$(".thumb-error").hide();
                }
            }
            this.$(".mediapicker-preview-file").attr("src", this.currentUrl);
        },

        render: function() {
            var self = this;
            this.$el = $(mediaPickerPreviewTemplate(
                            {isAudio: true}))
                            .appendTo("body").hide();

            this.$("button").on("click", function() {
                self.modal.show();
            });

            this.modal = new Modal(_.defaults({
                parent: this
            }, this.options));
        },

        remove: function() {
            this.$el.remove();
            this.modal.remove();
            this.unbindFromRequestTooltip();
        }
    });

    TooltipEngine.registerTooltip("imageModal", ImageModal);
    TooltipEngine.registerTooltip("soundModal", SoundModal);
})();
