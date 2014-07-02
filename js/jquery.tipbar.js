/**
 * This is called tipbar for historical reasons.
 * Originally, it appeared as a red bar sliding up from the bottom of the
 * canvas. Now it just powers the error reporting mechanism, which no longer
 * looks like a bar
 */

$(document).delegate(".tipbar .tipnav a", "click", function() {
    if (!$(this).hasClass("ui-state-disabled")) {
        var box = $("#output"),
            tipData = box.data("tipData");

        tipData.pos += $(this).hasClass("next") ? 1 : -1;
        box.showTip();
    }

    postParent({ focus: true });

    return false;
});

$(document).delegate(".tipbar.error .text-wrap a", "click", function() {
    var box = $("#output"),
        tipData = box.data("tipData"),
        error = tipData.Error[tipData.pos];

    postParent({ cursor: error });

    return false;
});

$.fn.showTip = function(type, texts, callback) {
    var tipData = this.data("tipData");

    if (!tipData) {
        tipData = { pos: 0 };
        this.data("tipData", tipData);
        this.append($("#tipbar-tmpl").html());
    }

    type = type || tipData.cur;

    if (texts) {
        tipData.pos = 0;
        tipData[type] = texts;
        tipData.callback = callback;
    }

    tipData.cur = type;
    texts = texts || tipData[type];
    var pos = tipData.pos,
        bar = this.find(".tipbar")
        .attr("class", "tipbar " + type.toLowerCase())

        // Inject current text
        .find(".current-pos").text(texts.length > 1 ? (pos + 1) + "/" + texts.length : "").end()
        .find(".message").html(texts[pos].text || texts[pos] || "").end()
        .find("a.prev").toggleClass("ui-state-disabled", pos === 0).end()
        .find("a.next").toggleClass("ui-state-disabled", pos + 1 === texts.length).end();

    $(".show-me").toggle(texts[pos].row !== -1);

    bar.find(".tipnav").toggle(texts.length > 1);

    // Only animate the bar in if it's not visible
    if (!bar.is(":visible")) {
        bar
            .css({ top: 400, opacity: 0.1 })
            .show()
            .animate({ top: this.find(".toolbar").is(":visible") ? 33 : 100, opacity: 1.0 }, 300);
    }

    if (tipData.callback) {
        tipData.callback(texts[pos]);
    }

    return this;
};

$.fn.hideTip = function(type) {
    var tipData = this.data("tipData");

    if (tipData && (!type || type === tipData.cur)) {
        this.find(".tipbar").animate({ top: 400, opacity: 0.1 }, 300, function() {
            $(this).hide();
        });
    }

    return this;
};

$.fn.toggleTip = function(type, texts, callback) {
    var tipData = this.data("tipData");

    if (!tipData || !this.find(".tipbar").is(":visible") || tipData.cur !== type) {
        this.showTip(type, texts, callback);

    } else {
        this.hideTip();
    }

    return this;
};
