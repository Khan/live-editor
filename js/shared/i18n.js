// Stubs for i18n extraction.

Handlebars.registerHelper("_", function(options) {
    return options.fn(this);
});

jQuery._ = function(msg) {
    return msg;
};