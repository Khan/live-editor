/**
 * Removes the listener from the target after the first call.
 *
 * @param target
 * @param event
 * @param listener
 */
function listenOnce(target, event, listener) {
    var wrapper = function (e) {
        listener(e);
        target.removeEventListener(event, wrapper);
    };
    target.addEventListener(event, wrapper);
}
