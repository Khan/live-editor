(function() {
    var oldValue, range, firstNum, firstNumString,
        scrubber, colorPicker, curPicker, imagePicker,
        handle, ignore = false, defaultImage = "cute/Blank";

    $.fn.hotNumber = function(options) {
        var editor = options.editor;
        var selection = editor.session.selection;

        // A bit of a hack adding it to the editor object...
        editor.imagesDir = options.imagesDir;
        console.log("hotNumber", options.imagesDir)

        if (options.reload) {
            checkNumber(editor);

        } else {
            selection.on("changeCursor", function() {
                checkNumber(editor, options.record);
            });
            selection.on("changeSelection", function() {
                checkNumber(editor, options.record);
            });

            editor.renderer.scrollBar.addEventListener("scroll", function() {
                if (curPicker) {
                    updatePos(editor);
                }
            });

            attachPicker(editor, record);
            attachScrubber(editor, record);
        }

        if (options.record) {
            options.record.handlers.hot = function(e) {
                checkNumber(editor, options.record);
                update(editor, options.record, e.hot);
                updatePos(editor);
            };
        }

        return this;
    };

    /**
     * Returns the number of decimal places shown in a string representation of
     * a number.
     */
    function decimalCount(strNumber) {
        var decIndex = strNumber.indexOf(".");
        if (decIndex === -1) {
            return 0;
        } else {
            return strNumber.length - (decIndex + 1);
        }
    }

    function attachScrubber(editor, record) {
        if (scrubber) {
            return;
        }

        var scrubberHandle = $("<div class='scrubber-handle'/>")
            .text("◄ ◆ ►")
            .draggable({
                axis: "x",
                drag: function() {
                    scrubber.addClass("dragging");

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
                    var powerOfTen = -decimalCount(firstNumString);

                    if (powerOfTen < -5) {
                        powerOfTen = -5;
                    }

                    if (handle) {
                        handle(Math.round(dx / 2.0) * Math.pow(10, powerOfTen));
                    }
                },
                stop: function() {
                    scrubber.removeClass("dragging");

                    $(this).css({
                        left: 0,
                        top: 0
                    });
                    checkNumber(editor, record);
                }
            });

        scrubber = $("<div class='hotnumber'><div class='scrubber'></div><div class='arrow'></div></div>")
            .appendTo("body")
            .find(".scrubber")
                .append(scrubberHandle)
                .end()
            .hide();
    }

    function attachPicker(editor) {
        if (!colorPicker) {
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

            colorPicker = $("<div class='hotnumber picker'><div id='hotpicker' class='picker'></div><div class='arrow'></div></div>")
                .appendTo("body")
                .find(".picker").ColorPicker({
                    flat: true,
                    onChange: function(hsb, hex, rgb) {
                        if (handle) {
                            handle(rgb);
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
        }
    }

    function attachImagePicker(editor) {
        if (!imagePicker) {
            var tmpl = Handlebars.templates.imagepicker;
            console.log("attach", editor.imagesDir)
            var results = tmpl({
                imagesDir: editor.imagesDir,
                groups: _.map(OutputImages, function(data) {
                    data.imagesDir = editor.imagesDir;
                    return data;
                })
            });

            imagePicker = $("<div class='hotnumber imagepicker'>" + results +
                    "<div class='arrow'></div></div>")
                .appendTo("body")
                .delegate(".image", "click", function() {
                    $(".imagepicker .active").removeClass("active");

                    if (handle) {
                        $(this).addClass("active");

                        handle($(this).attr("data-path"));
                    }
                })
                .bind("mouseleave", function() {
                    var pos = editor.selection.getCursor(),
                        coords = editor.renderer.textToScreenCoordinates(pos.row,
                            editor.session.getDocument().getLine(pos.row).length);

                    $(this).css({ top: $(window).scrollTop() + coords.pageY, left: coords.pageX });
                })
                .hide();
        }
    }

    // Returns true if we're inside an open parenthesis
    function isInParenthesis(text) {
        var parenthesisDepth = 0;
        for (var i = 0; i < text.length; i++) {
            if (text[i] === '(') {
                parenthesisDepth++;
            } else if (text[i] === ')') {
                parenthesisDepth--;
            }
        }
        return parenthesisDepth > 0;
    }

    function checkNumber(editor, record) {
        if (ignore) {
            return;
        }

        range = null;

        var pos = editor.selection.getCursor(),
            line = editor.session.getDocument().getLine(pos.row),
            prefix = line.slice(0, pos.column),
            oldPicker = curPicker, newPicker;

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

                oldValue = RegExp.$1;
                range = new Range(pos.row, paramsPos, pos.row, paramsPos + oldValue.length);

                // Insert a); if one doesn't exist
                // Makes it easier to quickly insert a color
                // TODO: Maybe we should do this for more methods?
                if (RegExp.$2.length === 0) {
                    ignore = true;

                    if (record) {
                        record.pauseLog();
                    }

                    editor.session.getDocument().insertInLine({ row: pos.row, column: line.length },
                        (oldValue ? "" : (oldValue = "255, 0, 0")) + ")" +
                        (needsSemicolon ? ";" : ""));
                    editor.selection.setSelectionRange(range);
                    editor.selection.clearSelection();

                    if (record) {
                        record.resumeLog();
                    }

                    ignore = false;
                }

                handle = function(value) {
                    updateColorSlider(editor, record, value);
                };

                newPicker = colorPicker;
            }

        } else if (/(\bgetImage\s*\(\s*)([^\)]*)$/.test(prefix)) {
            var paramsPos = pos.column - RegExp.$2.length;
            var beforeGetImage = prefix.substring(0, paramsPos - RegExp.$1.length);

            if (/^([^\s]*?)\s*(\)|$)/.test(line.slice(paramsPos))) {
                var Range = ace.require("ace/range").Range;

                oldValue = RegExp.$1;
                range = new Range(pos.row, paramsPos, pos.row, paramsPos + oldValue.length);

                // Insert a); if one doesn't exist
                if (RegExp.$2.length === 0) {
                    ignore = true;

                    if (record) {
                        record.pauseLog();
                    }

                    editor.session.getDocument().insertInLine({ row: pos.row, column: line.length },
                        (oldValue ? "" : (oldValue = '"' + defaultImage + '"')) + ")" +
                        (isInParenthesis(beforeGetImage) ? "" : ";"));
                    editor.selection.setSelectionRange(range);
                    editor.selection.clearSelection();

                    if (record) {
                        record.resumeLog();
                    }

                    ignore = false;
                }

                handle = function(value) {
                    updateImagePicker(editor, record, value);
                };

                attachImagePicker(editor);
                updateImagePicker(editor, record, oldValue);
                newPicker = imagePicker;
            }

        } else {
            var before = pos.column - (/([\d.-]+)$/.test(prefix) ? RegExp.$1.length : 0);

            if (/^([\d.-]+)/.test(line.slice(before)) && !isNaN(parseFloat(RegExp.$1))) {
                var Range = ace.require("ace/range").Range;

                oldValue = RegExp.$1;
                firstNumString = oldValue;
                firstNum = parseFloat(oldValue);
                range = new Range(pos.row, before, pos.row, before + oldValue.length);

                handle = function(value) {
                    updateNumberScrubber(editor, record, value);
                };

                newPicker = scrubber;
            }
        }

        if (oldPicker && oldPicker !== newPicker) {
            oldPicker.hide();
        }

        if (newPicker) {
            curPicker = newPicker;
            updatePos(editor);
        } else {
            curPicker = null;
        }
    }

    function updatePos(editor) {
        if (!curPicker) {
            return;
        }

        var pos = editor.selection.getCursor(),
            offset = editor.renderer.scroller.getBoundingClientRect(),
            coords = editor.renderer.textToScreenCoordinates(pos.row,
                curPicker !== scrubber ? editor.session.getDocument().getLine(pos.row).length : pos.column),
            relativePos = coords.pageY - offset.top;

        curPicker
            .css({ top: $(window).scrollTop() + coords.pageY, left: coords.pageX })
            .toggle(!(relativePos < 0 || relativePos >= offset.height));

        if (curPicker === colorPicker) {
            var colors = oldValue.replace(/\s/, "").split(",");

            colorPicker.find(".picker").ColorPickerSetColor(colors.length === 3 ?
                { r: parseFloat(colors[0]), g: parseFloat(colors[1]), b: parseFloat(colors[2]) } :
                colors.length === 1 && !colors[0] ?
                    { r: 255, g: 0, b: 0 } :
                    { r: parseFloat(colors[0]), g: parseFloat(colors[0]), b: parseFloat(colors[0]) });
        }
    }

    function updateImagePicker(editor, record, path) {
        if (!range) {
            return;
        }

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

        $(".imagepicker .current-image img")
            .attr("src", editor.imagesDir + path + ".png");

        // Update the old path with a new one
        update(editor, record, '"' + path + '"');
    }

    function updateColorSlider(editor, record, rgb) {
        if (!range) {
            return;
        }

        // Replace the old color with the new one
        update(editor, record, rgb.r + ", " + rgb.g + ", " + rgb.b);
    }

    function updateNumberScrubber(editor, record, newNum) {
        if (!range) {
            return;
        }

        newNum = firstNum + newNum;

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
        var firstDecCount = decimalCount(firstNumString);
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
        update(editor, record, newNumString);
    }

    function update(editor, record, newValue) {
        if (!range) {
            return;
        }

        ignore = true;

        if (record) {
            record.pauseLog();
        }

        // Insert the new number
        range.end.column = range.start.column + oldValue.length;
        editor.session.replace(range, newValue);

        // Select and focus the updated number
        if (curPicker !== imagePicker) {
            range.end.column = range.start.column + newValue.length;
            editor.selection.setSelectionRange(range);
        }

        if (record) {
            record.resumeLog();
            record.log({ hot: newValue });
        }

        ignore = false;
        oldValue = newValue;
    }
})();
