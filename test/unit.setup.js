/* Here is a cheap and bad implementation
 * of requestAnimationFrame and
 * cancelAnimationFrame mock.
 * But it's more than enough
 * for our tests.
 */
window.requestAnimFrameStack = [];
window.requestAnimationFrame = function (callback) {
  window.requestAnimFrameStack.push(callback);
  return true;
};
window.cancelAnimationFrame = function () {
  window.requestAnimFrameStack = [];
};
