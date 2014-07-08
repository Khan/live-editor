// TODO:
// - DOM strings
// - bind
// - ScratchpadConfig
// - Record

window.LiveEditor = Backbone.View.extend({
    dom: {
        DRAW_CANVAS: ".scratchpad-draw-canvas",
        DRAW_COLOR_BUTTONS: "#draw-widgets a.draw-color-button",
        EDITOR: ".scratchpad-editor",
        CANVAS_LOADING: ".scratchpad-canvas-loading"
    },

    initialize: function(options) {
        this.config = new ScratchpadConfig({
            version: options.version
        });

        // Set up the Canvas drawing area
        this.drawCanvas = new ScratchpadDrawCanvas({
            el: this.dom.DRAW_CANVAS
        });

        this.drawCanvas.on({
            // Drawing has started
            drawStarted: function() {
                // Activate the canvas
                $(this.dom.DRAW_CANVAS).show();
            },

            // Drawing has ended
            drawEnded: function() {
                // Hide the canvas
                $(this.dom.DRAW_CANVAS).hide();
            },

            // A color has been chosen
            colorSet: function(color) {
                // Deactivate all the color buttons
                $(this.dom.DRAW_COLOR_BUTTONS)
                    .removeClass("ui-state-active");

                // If a new color has actually been chosen
                if (color !== null) {
                    // Select that color and activate the button
                    $("#" + color).addClass("ui-state-active");
                }
            }
        });

        // Set up the editor
        this.editor = new ScratchpadEditor({
            el: this.dom.EDITOR,
            autoFocus: options.autoFocus,
            config: this.config
        });

        var codeOptions = { code: "" };

        this.trigger("initCode", codeOptions);
        //ScratchpadUI.stashedCode = codeOptions.code;

        var code = codeOptions.code;

        // If there is no user specific code, then we should grab the code out of
        // the revision
        //if (!this.blank && !queryString.code) {
        //    code = code || queryString.code || revision.get("code") || "";
        //}

        // Load the text into the editor
        if (code !== undefined) {
            this.editor.text(code);
            this.editor.originalCode = code;
        }

        // Focus on the editor
        this.editor.focus();

        if (options.cursor) {
            // Restore the cursor position
            this.editor.setCursor(options.cursor);

        } else {
            // Set an initial starting selection point
            this.editor.editor.selection.setSelectionRange({
                start: {row: 0, column: 0},
                end: {row: 0, column: 0}
            });
        }

        // Hide the overlay
        $("#page-overlay").hide();

        // TODO(jeresig): hotNumber initializes in the wrong position
        // this should be changed to wait until rendering of Ace is complete
        /*
        setTimeout(function() {
            this.editor.$el.hotNumber({
                reload: true,
                editor: this.editor.editor
            });
        }.bind(this), 100);
        */

        // Change the width and height of the output frame if it's been
        // changed by the user, via the query string, or in the settings
        this.updateCanvasSize(options.width, options.height);

        this.bind();
    },

    bind: function() {
        // Make sure that disabled buttons can't still be used
        this.$el.delegate(".simple-button.disabled, .ui-state-disabled", "click", function(e) {
            e.stopImmediatePropagation();
            return false;
        });

        // Handle the restart button
        this.$el.delegate("#restart-code", "click",
            this.restartCode.bind(this));

        $(window).on("message", this.listenMessages.bind(this));

        var toExec = false;

        // When the frame loads, execute the code
        $("#output-frame").on("load", function() {
            toExec = true;
            // TODO(leif): properly handle case where the user's code doesn't
            // initially compile. There is currently a race condition in which
            // the output frame is not ready for execution
        });

        // Whenever the user changes code, execute the code
        this.editor.editor.on("change", function() {
            toExec = true;
        });

        // Attempt to run the code every 100ms or so
        setInterval(function() {
            if (toExec !== null) {
                this.runCode(toExec === true ?
                    this.editor.text() :
                    toExec);

                toExec = null;
            }
        }.bind(this), 100);

        $(this.config).on("versionSwitched", function(e, version) {
            // Re-run the code after a version switch
            toExec = true;

            // Run the JSHint config
            this.config.runVersion(version, "jshint");
        }.bind(this));
    },

    listenMessages: function(e) {
        var event = e.originalEvent;
        var data;

        try {
            data = JSON.parse(event.data);

        } catch (err) {
            // Malformed JSON, we don't care about it
        }

        if (!data) {
            return;
        }

        this.trigger("update", data);

        // Hide loading overlay
        if (data.loaded) {
            this.$el.find(this.dom.CANVAS_LOADING).hide();
        }

        // Set the code in the editor
        if (data.code !== undefined) {
            this.editor.text(data.code);
            this.editor.originalCode = data.code;
            this.restartCode();
        }

        // Testing/validation code is being set
        if (data.validate != null) {
            validation = data.validate;
        }

        // Set the line visibility in the editor
        if (data.lines !== undefined) {
            this.editor.toggleGutter(data.lines);
        }

        // Restart the execution
        if (data.restart) {
            this.restartCode();
        }

        // Set the cursor in the editor
        if (data.cursor) {
            this.editor.setCursor(data.cursor);
            this.editor.setErrorHighlight(true);
        }

        // Set the focus back on the editor
        if (data.focus) {
            this.editor.focus();
        }
    },

    // Extract the origin from the embedded frame location
    postFrameOrigin: function() {
        var match = /^.*:\/\/[^\/]*/.exec(
            $("#output-frame").attr("data-src"));

        return match ?
            match[0] :
            window.location.protocol + "//" + window.location.host;
    },

    postFrame: function(data) {
        // Send the data to the frame using postMessage
        $("#output-frame")[0].contentWindow.postMessage(
            JSON.stringify(data), this.postFrameOrigin());
    },

    /*
     * Restart the code in the output frame.
     */
    restartCode: function() {
        this.postFrame({ restart: true });
    },

    /*
     * Execute some code in the output frame.
     */
    runCode: function(code) {
        var options = {
            code: code,
            version: this.config.curVersion(),
            settings: this.settings || {} // TODO: Figure this out
        };

        this.trigger("runCode", options);

        this.postFrame(options);
    },

    updateCanvasSize: function(width, height) {
        var canvasWidth = 400;
        var canvasHeight = 400;

        width = width || canvasWidth;
        height = height || canvasHeight;

        var $el = this.$el;
        var dom = this.dom;

        $el.find(dom.OUTPUT_FRAME).width(width);
        $el.find(dom.ALL_OUTPUT).height(height);

        // Set the editor height to be the same as the canvas height
        $el.find(dom.EDITOR).height(height);

        // We need to add 2 to handle the 1px border.
        var borderWidth = this.showButtons ? 2 : 0;

        // Position the canvas on the right-hand-side (floated)
        $el.find(dom.CANVAS_WRAP).width(width + borderWidth);

        var marginWidth = this.showOutput ? width + borderWidth : 0;
        var editorWrap = $el.find(dom.EDITOR_WRAP);
        editorWrap.css(this.rtl ? "margin-left" : "margin-right",
                marginWidth);

        // If the scratchpad page is being embedded then we need to set the
        // dimensions on the page, as well.
        if (this.embedded && !this.showEditor) {
            $("html").width(width + borderWidth).height(height);
        }

        var editor = this.editor.editor;

        // Force the editor to resize.
        editor.resize();

        // Set the font size. Scale the font size down when the size of the
        // editor is too small.
        editor.setFontSize(editorWrap.width() < 400 ? "12px" : "14px");

        this.trigger("canvasSizeUpdated", {
            width: width,
            height: height
        });
    }
});