module.exports = function(variable, options) {
    if (variable === null) {
        return options.fn(this);
    } else {
        return options.inverse(this);
    }
};