$(document).delegate("a.ui-button", {
    mouseenter: function() {
        if (!$(this).hasClass("ui-state-disabled")) {
            $(this).addClass("ui-state-hover");
        }
    },

    mouseleave: function() {
        $(this).removeClass("ui-state-hover");
    },

    click: function(e) {
        e.preventDefault();

        if (!$(this).hasClass("ui-state-disabled")) {
            $(this).trigger("buttonClick");
        }
    }
});

$.fn.buttonize = function() {
    return this.find(".ui-button")
        .addClass("ui-widget ui-state-default ui-corner-all")
        .find("span:first").addClass("ui-button-icon-primary ui-icon").end()
        .filter(":has(.ui-button-text)")
            .addClass("ui-button-text-icon-primary")
        .end()
        .not(":has(.ui-button-text)")
            .addClass("ui-button-icon-only")
            .append("<span class='ui-button-text'>&nbsp;</span>")
        .end()
    .end();
};