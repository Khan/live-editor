module.exports = function(arr, options) {
    return arr.map(function(item, index) {
        item.$index = index;
        item.$first = index === 0;
        item.$last = index === arr.length - 1;
        return options.fn(item);
    }).join("");
};