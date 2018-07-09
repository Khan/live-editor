module.exports = function(arr, options) {
    if(arr && arr.length > 1) {
        return options.fn(this);
    }
    return options.inverse(this);
};