/* Mostly functions to replace our previous use of jQuery/LoDash */

export function qualifyURL(url) {
    const a = document.createElement("a");
    a.href = url;
    return a.href;
}

export function getOffset(el) {
    const box = el.getBoundingClientRect();

    return {
        top:
            box.top + window.pageYOffset - document.documentElement.clientTop,
        left:
            box.left + window.pageXOffset - document.documentElement.clientLeft,
    };
}

export function getScrollTop() {
    return (
        (document.documentElement && document.documentElement.scrollTop) ||
        document.body.scrollTop
    );
}

// From https://github.com/nefe/You-Dont-Need-jQuery
export function isPlainObject(obj) {
    if (
        typeof obj !== "object" ||
        obj.nodeType ||
        (obj !== null && obj !== undefined && obj === obj.window)
    ) {
        return false;
    }

    if (
        obj.constructor &&
        !Object.prototype.hasOwnProperty.call(
            obj.constructor.prototype,
            "isPrototypeOf",
        )
    ) {
        return false;
    }

    return true;
}
