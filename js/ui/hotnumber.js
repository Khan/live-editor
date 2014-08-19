(function(wndw) {

var defaultImage = "cute/Blank";

/**
 * Returns the number of decimal places shown in a string representation of
 * a number.
 */
var decimalCount = function(strNumber) {
    var decIndex = strNumber.indexOf(".");
    if (decIndex === -1) {
        return 0;
    } else {
        return strNumber.length - (decIndex + 1);
    }
};

// Returns true if we're inside an open parenthesis
var isInParenthesis = function(text) {
    var parenthesisDepth = 0;
    for (var i = 0; i < text.length; i++) {
        if (text[i] === '(') {
            parenthesisDepth++;
        } else if (text[i] === ')') {
            parenthesisDepth--;
        }
    }
    return parenthesisDepth > 0;
};


var HotNumberModule = function() {

    var aceEditor = {
        onInit: function() {
            // To store editor specific things
            var editor = this.options.editor;
            var record = this.options.record;

            var self = this;

            // A bit of a hack adding it to the editor object...
            editor.imagesDir = this.options.imagesDir;

            if (this.options.reload) {
                checkNumber(this.options);
            } else {
                var selection = editor.session.selection;
                selection.on("changeCursor", function() {
                    _private.checkNumber.call(self);
                });
                selection.on("changeSelection", function() {
                    _private.checkNumber.call(self);
                });

                editor.renderer.scrollBar.addEventListener("scroll", function() {
                    if (self.curPicker) {
                        _private.updatePos.call(self);
                    }
                });

                _private.attachScrubber.call(this);
                _private.attachColorPicker.call(this);
                _private.attachAutosuggest.call(this);
            }

            if (record) {
                record.handlers.hot = function(e) {
                    _private.checkNumber.call(self);
                    _private.updateEditor.call(self, e.hot);
                    _private.updatePos.call(self);
                };
            }
        },
        onNumberCheck: function() {
            var editor = this.options.editor;
            var record = this.options.record;

            var pos = editor.selection.getCursor();
            var line = editor.session.getDocument().getLine(pos.row);
            var prefix = line.slice(0, pos.column);
            var lineCleanedUp = line.trim();
            if (lineCleanedUp.length && (lineCleanedUp[0] === "/" ||
                    lineCleanedUp[0] === "*")) {
                // Comments typically start with a / or a * (for multiline C style)
                // Get rid of live autocomplete in that case.
                ScratchpadAutosuggest.enableLiveCompletion(false);
            } else if (this.curPicker !== this.autosuggest) {
                ScratchpadAutosuggest.enableLiveCompletion(true);
            }

            if (/\b(background|fill|stroke|color)(\s*)\(\s*([\s\d,]*)\s*$/.test(prefix)) {
                var paramsPos = pos.column - RegExp.$3.length;
                // -1 because the open parenthesis is not included in the capture
                var funcPos = paramsPos - RegExp.$1.length - RegExp.$2.length - 1;
                var beforeFunction = prefix.substring(0, funcPos);
                var needsSemicolon = RegExp.$1 !== "color" ||
                    !isInParenthesis(beforeFunction);
                // Test a match for:
                // Capture group 1: r, g, b
                // followed by an optional ,a for alpha
                // Capture group 2: ) or empty
                if (/^\s*((?:\s*\d+,){0,2}(?:\s*\d+)?)(?:,\s*\d+)?\s*(\)|$)/.test(line.slice(paramsPos))) {
                    var Range = ace.require("ace/range").Range;

                    this.oldValue = RegExp.$1;
                    this.range = new Range(pos.row, paramsPos, pos.row, paramsPos + this.oldValue.length);

                    // Insert a); if one doesn't exist
                    // Makes it easier to quickly insert a color
                    // TODO: Maybe we should do this for more methods?
                    if (RegExp.$2.length === 0) {
                        ignore = true;

                        if (record) {
                            record.pauseLog();
                        }

                        editor.session.getDocument().insertInLine({ row: pos.row, column: line.length },
                            (this.oldValue ? "" : (this.oldValue = "255, 0, 0")) + ")" +
                            (needsSemicolon ? ";" : ""));
                        editor.selection.setSelectionRange(this.range);
                        editor.selection.clearSelection();

                        if (record) {
                            record.resumeLog();
                        }

                        this.ignore = false;
                    }

                    this.handle = function(value) {
                        _private.updateColorSlider.call(this, value);
                    };

                    this.newPicker = this.colorPicker;
                }

            } else if (/(\bgetImage\s*\(\s*)([^\)]*)$/.test(prefix)) {
                var paramsPos = pos.column - RegExp.$2.length;
                var beforeGetImage = prefix.substring(0, paramsPos - RegExp.$1.length);

                if (/^([^\s]*?)\s*(\)|$)/.test(line.slice(paramsPos))) {
                    var Range = ace.require("ace/range").Range;

                    this.oldValue = RegExp.$1;
                    this.range = new Range(pos.row, paramsPos, pos.row, paramsPos + this.oldValue.length);

                    // Insert a); if one doesn't exist
                    if (RegExp.$2.length === 0) {
                        this.ignore = true;

                        if (record) {
                            record.pauseLog();
                        }

                        editor.session.getDocument().insertInLine({ row: pos.row, column: line.length },
                            (this.oldValue ? "" : (this.oldValue = '"' + defaultImage + '"')) + ")" +
                            (isInParenthesis(beforeGetImage) ? "" : ";"));
                        editor.selection.setSelectionRange(this.range);
                        editor.selection.clearSelection();

                        if (record) {
                            record.resumeLog();
                        }

                        this.ignore = false;
                    }

                    this.handle = function(value) {
                        _private.updateImagePicker.call(this, value);
                    };

                    _private.attachImagePicker.call(this);
                    _private.updateImagePicker.call(this, this.oldValue);
                    this.newPicker = this.imagePicker;
                }

            } else if (/([\d.-]+)$/.test(prefix)) {
                var before = pos.column - (/([\d.-]+)$/.test(prefix) ? RegExp.$1.length : 0);

                if (/^([\d.-]+)/.test(line.slice(before)) && !isNaN(parseFloat(RegExp.$1))) {
                    var Range = ace.require("ace/range").Range;

                    this.oldValue = RegExp.$1;
                    this.firstNumString = this.oldValue;
                    this.firstNum = parseFloat(this.oldValue);
                    this.range = new Range(pos.row, before, pos.row, before + this.oldValue.length);

                    // repeated
                    this.newPicker = this.scrubber;
                    this.handle = function(value) {
                        _private.updateNumberScrubber.call(this, value);
                    };
                }
            } else if (/(\b[^\d.-]+\s*\(\s*)([^\)]*)$/.test(prefix)) {
                var functionCall = RegExp.$1.substring(0, RegExp.$1.length - 1)
                                            .split(" ").pop().trim();
                var paramsPos = pos.column - RegExp.$2.length;
                var paramsToCursor = RegExp.$2;
                var lookupParams =
                    ScratchpadAutosuggest.lookupParamsSafeHTML(functionCall,
                        paramsToCursor);
                ScratchpadAutosuggest.enableLiveCompletion(false);

                if (lookupParams) {
                    this.autosuggest.find(".hotsuggest")
                                    .empty().append(lookupParams);
                    this.newPicker = this.autosuggest;
                }
            }
        },
        onUpdatePosition: function() {
            var editor = this.options.editor;

            var pos = editor.selection.getCursor();
            var editorBB = editor.renderer.scroller.getBoundingClientRect();
            var editorHeight = editorBB.height;
            var coords = editor.renderer.textToScreenCoordinates(pos.row,
                this.curPicker !== this.scrubber &&
                this.curPicker !== this.autosuggest ?
                editor.session.getDocument().getLine(pos.row).length : pos.column);
            var relativePos = coords.pageY - editorBB.top;
            // repeated
            this.curPicker
                .css({ top: $(window).scrollTop() + coords.pageY, left: coords.pageX })
                .toggle(!(relativePos < 0 || relativePos >= editorHeight));
        },
        onNewNumber: function(newValue) {
            var range = this.range;
            var editor = this.options.editor;
            var record = this.options.record;

            if (!range) {
                return;
            }

            this.ignore = true;

            if (record) {
                record.pauseLog();
            }

            // Insert the new number
            range.end.column = range.start.column + this.oldValue.length;
            editor.session.replace(range, newValue);

            // Select and focus the updated number
            if (this.curPicker !== this.imagePicker) {
                range.end.column = range.start.column + newValue.length;
                editor.selection.setSelectionRange(range);
            }

            if (record) {
                record.resumeLog();
                record.log({ hot: newValue });
            }

            this.ignore = false;
            this.oldValue = newValue;
        }
    };


    var blocklyEditor = {
        onInit: function() {
            var blockly = this.options.blockly;

            var self = this;

            // We can't listen to change listener due to endless loop
            // Ideally, Blockly would fire something like a FieldSelected listener

            // Listen to mouseenter on input so we can turn number scrubber on
            // Delegate, since the input can come and go
            $(blockly.WidgetDiv.DIV).on("mouseenter", "input", function(e) {
                _private.checkNumber.call(self);
            });

            // Listen to click on SVG so we can turn pickers on/off
            $(blockly.svg).on("click", function(e) {
                // To check when they click elsewhere
                _private.checkNumber.call(self);
            });

            _private.attachScrubber.call(this);
        },
        onNumberCheck: function() {
            var selected = this.options.blockly.selected;

            if (!selected) {
                return;
            }
            if (selected.type === "image_picker") {
                var imageField = selected.inputList[0].fieldRow[0];
                var imageUrl = selected.getPathlessUrl();

                this.handle = function(value) {
                    _private.updateImagePicker.call(this, value);
                };
                _private.attachImagePicker.call(this);
                _private.updateImagePicker.call(this, imageUrl);

                this.newPicker = this.imagePicker;
                this.selectedNode = imageField.getRootElement();

            } else if (selected.type === "math_number") {
                var textField = selected.inputList[0].fieldRow[0];
                this.firstNum = parseFloat(textField.getValue(), 10);
                this.firstNumString = String(this.firstNum);

                // Repeated later
                this.handle = function(value) {
                    _private.updateNumberScrubber.call(this, value);
                };
                this.newPicker = this.scrubber;
                this.selectedNode = textField.getRootElement();
            }
        },
        onUpdatePosition: function() {
            var container = this.options.blockly.svg;
            var selected = this.options.blockly.selected;

            var coords = selected.getRelativeToSurfaceXY();
            var realLeft = selected.workspace.getMetrics().absoluteLeft;
            var fieldSize = selected.getHeightWidth();
            var editorHeight = $(container).height();
            var isOnScreen = !(coords.y < 0 || coords.y >= editorHeight);
            this.curPicker
                .css({ top: $(window).scrollTop() + coords.y + 10,
                       left: realLeft + coords.x + fieldSize.width/2})
                .toggle(isOnScreen);
        },
        onNewNumber: function(newValue) {
            var selected = this.options.blockly.selected;

            var input = this.options.blockly.FieldTextInput.htmlInput_;
            if (selected && selected.type === "image_picker") {
                var imageField = selected.inputList[0].fieldRow[0];
                imageField.setValue(newValue);
                selected.workspace.fireChangeEvent();
            } else if (input) {
                $(input).val(newValue);
                this.options.blockly.fireUiEventNow(input, 'keypress');
            }
        }
    };

    var _private = {
        defaults: {
            type: "ace",  // 'blockly' or 'ace',
            imagesDir: "./"
            // container, editor, record, depending on whether ACE or Blockly
        },
        getOrMakeHotNumber: function(elem, options) {
            var hotNumber = elem.hotNumberObj;

            if (hotNumber && hotNumber.constructor == HotNumber.prototype.constructor) {
                if (options) _private.customizeHotNumber.call(marquee, options);
                return hotNumber;
            } else {
                hotNumber = new HotNumber(elem, options);
                elem.hotNumberObj = hotNumber;
                return hotNumber;
            }
        },
        customizeHotNumber: function(options) {
            this.options = options || {};
            for (var optKey in _private.defaults) {
                if (!this.options[optKey]) {
                    this.options[optKey] = _private.defaults[optKey];
                }
            }
            if (options.type === "ace") {
                this.editor = aceEditor;
            } else if (options.type === "blockly") {
                this.editor = blocklyEditor;
            } else {
                console.warn("Unknown editor type");
                return;
            }
        },
        attachAutosuggest: function() {
            if (this.autosuggest) {
                return;
            }
            var editor = this.options.editor;
            var over = false, down = false;
            var reposition = function($picker) {
                var pos = editor.selection.getCursor(),
                    coords = editor.renderer.textToScreenCoordinates(
                        pos.row, editor.session.getDocument().getLine(
                            pos.row).length);

                $picker.css({
                    top: $(window).scrollTop() + coords.pageY,
                    left: coords.pageX
                });
            };
            this.autosuggest = $("<div class='hotnumber autosuggest'><div class='hotsuggest'></div><div class='arrow'></div></div>")
                .appendTo("body")
                .mousedown(function() {
                    this.autosuggest.hide();
                    editor.focus();
                }.bind(this)).hide();
            $(document).keyup(function(e) {
                if (e.which === 27 && this.autosuggest) {
                    this.autosuggest.hide();
                }
            }.bind(this));
        },
        attachScrubber: function() {
            if (this.scrubber) {
                return;
            }

            var self = this;
            var scrubberHandle = $("<div class='scrubber-handle'/>")
                .text("◄ ◆ ►")
                .draggable({
                    axis: "x",
                    drag: function() {
                        self.scrubber.addClass("dragging");

                        var thisOffset = $(this).offset();
                        var parentOffset = $(this).parent().offset();
                        var dx = thisOffset.left - parentOffset.left;

                        // The interval of the scrubber is determined like so:
                        //
                        // If the original number contains no decimal point, the
                        // interval is 10^0 = 1.
                        //
                        // Otherwise, the interval corresponds to the least
                        // significant digit. So both 0.01 and 0.91 will operate
                        // on an interval of 10^-2 = 0.01.
                        var powerOfTen = -decimalCount(self.firstNumString);

                        if (powerOfTen < -5) {
                            powerOfTen = -5;
                        }

                        if (self.handle) {
                            self.handle(Math.round(dx / 2.0) * Math.pow(10, powerOfTen));
                        }
                    },
                    stop: function() {
                        self.scrubber.removeClass("dragging");

                        $(this).css({
                            left: 0,
                            top: 0
                        });
                        _private.checkNumber.call(self);
                    }
                });

            this.scrubber = $("<div class='hotnumber'><div class='scrubber'></div><div class='arrow'></div></div>")
                .appendTo("body")
                .find(".scrubber")
                    .append(scrubberHandle)
                    .end()
                .hide();
        },
        attachColorPicker: function() {
            if (this.colorPicker) {
                return;
            }

            var self = this;
            var editor = this.options.editor;
            var over = false, down = false;
            var reposition = function($picker) {
                var pos = editor.selection.getCursor(),
                    coords = editor.renderer.textToScreenCoordinates(
                        pos.row, editor.session.getDocument().getLine(
                            pos.row).length);

                $picker.css({
                    top: $(window).scrollTop() + coords.pageY,
                    left: coords.pageX
                });
            };

            this.colorPicker = $("<div class='hotnumber picker'><div id='hotpicker' class='picker'></div><div class='arrow'></div></div>")
                .appendTo("body")
                .find(".picker").ColorPicker({
                    flat: true,
                    onChange: function(hsb, hex, rgb) {
                        if (self.handle) {
                            self.handle(rgb);
                        }
                    }
                }).end()
                .bind("mouseenter", function() {
                    over = true;
                })
                .bind("mouseleave", function() {
                    over = false;
                    if (!down) {
                        reposition($(this));
                    }
                    editor.focus();
                })
                .mousedown(function() {
                    var $picker = $(this);
                    $picker.addClass("active");
                    down = true;

                    $(document).one("mouseup", function() {
                        $picker.removeClass("active");
                        down = false;
                        if (!over) {
                            reposition($picker);
                        }
                    });
                })
                .hide();
        },
        attachImagePicker: function() {
            if (!this.imagePicker) {
                var imagesDir = this.options.imagesDir;

                var tmpl = _public.getImagePickerTemplate();

                var results = tmpl({
                    imagesDir: imagesDir,
                    groups: _.map(OutputImages, function(data) {
                        data.imagesDir = imagesDir;
                        return data;
                    })
                });

                var self = this;
                this.imagePicker = $("<div class='hotnumber imagepicker'>" + results +
                        "<div class='arrow'></div></div>")
                    .appendTo("body")
                    .delegate(".image", "click", function() {
                        $(".imagepicker .active").removeClass("active");

                        if (self.handle) {
                            $(this).addClass("active");

                            self.handle($(this).attr("data-path"));
                        }
                    })
                    .bind("mouseleave", function() {
                        $(this).hide();

                        // This is to change the position with ACE
                        // TODO(pamela): move this out into ACE specific
                        var editor = self.options.editor;
                        if (editor) {
                            var pos = editor.selection.getCursor(),
                            coords = editor.renderer.textToScreenCoordinates(pos.row,
                                editor.session.getDocument().getLine(pos.row).length);

                            $(this).css({ top: $(window).scrollTop() + coords.pageY, left: coords.pageX });
                        }

                    })
                    .hide();
            }
        },
        checkNumber: function() {
            if (this.ignore) {
                return;
            }

            this.oldPicker = this.curPicker;
            this.newPicker = null;

            this.editor.onNumberCheck.call(this);

            if (this.oldPicker && this.oldPicker !== this.newPicker) {
                this.oldPicker.hide();
            }

            if (this.newPicker) {
                this.curPicker = this.newPicker;
                _private.updatePos.call(this);
            } else {
                this.curPicker = null;
            }
        },
        updatePos: function() {
            if (!this.curPicker) {
                return;
            }

            this.editor.onUpdatePosition.call(this);
        },
        updateColorSlider: function(rgb) {
            if (!this.range) {
                return;
            }

            // Replace the old color with the new one
            _private.updateEditor.call(this, rgb.r + ", " + rgb.g + ", " + rgb.b);
        },
        updateNumberScrubber: function(newNum) {
            if (this.firstNum === undefined) {
                return;
            }

            newNum = this.firstNum + newNum;

            var newNumString = newNum.toString();
            var fixed = newNum.toFixed(5);

            // Using a really small interval (1e-5), we start hitting float
            // precision issues during addition/subtraction, so cap the number of
            // digits after the decimal
            if (fixed.length < newNumString.length) {
                newNumString = fixed;
            }

            // Force the number of decimal places in the new number to match the
            // number of decimal places in the original number.
            var firstDecCount = decimalCount(this.firstNumString);
            var newDecCount = decimalCount(newNumString);

            if (newDecCount > firstDecCount) {
                // Truncate (assuming no rounding error, should first be removing
                // zeros)
                newNumString = newNumString.substr(0,
                    newNumString.length - (newDecCount - firstDecCount));
            } else if (newDecCount < firstDecCount) {
                // Pad with 0's, possibly preceded by a decimal place.
                if (newDecCount === 0) {
                    newNumString += ".";
                }
                newNumString += Array(1 + (firstDecCount - newDecCount)).join("0");
            }

            // Replace the old number with the new one
            _private.updateEditor.call(this, newNumString);
        },
        updateImagePicker: function(path) {
            // Remove old quotes
            path = path.replace(/"/g, "");

            var pathParts = path.split("/");
            var groupName = pathParts[0];
            var fileName = pathParts[1];
            var foundPath = defaultImage;

            _.each(OutputImages, function(group) {
                if (group.groupName === groupName) {
                    _.each(group.images, function(imageName) {
                        if (imageName === fileName) {
                            foundPath = path;
                        }
                    });
                }
            });

            path = foundPath;

            var fullPath = this.options.imagesDir + path + ".png";
            this.imagePicker.find(".current-image img")
                .attr("src", fullPath);

            // Update the old path with a new one
            _private.updateEditor.call(this, '"' + foundPath + '"');
        },
        updateEditor: function(newValue) {
            this.editor.onNewNumber.call(this, newValue);
        }
    };

    // The public constructor and methods
    var HotNumber = function(options) {
        _private.customizeHotNumber.call(this, options);
        this.editor.onInit.call(this, options);
    };

    var _public = function(el, options) {
        return _private.getOrMakeHotNumber(el, options);
    };

    _public.getImagePickerTemplate = function() {
        return Handlebars.templates.imagepicker;
    };

    return _public;
};

window.HotNumber = HotNumberModule();

})(window);
