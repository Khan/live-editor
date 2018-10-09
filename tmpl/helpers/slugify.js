module.exports = function(text) {
    return text.toLowerCase().match(/[a-z0-9_]+/g).join("-");
};