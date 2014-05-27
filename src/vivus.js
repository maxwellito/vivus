'use strict';

/**
 * Vivus
 * Beta version
 *
 * Take any SVG and make the animation
 * to give give the impression of live drawing
 *
 * This in more than just inspired from codrops
 * At that point, it's a pure fork.
 */

/**
 * Class constructor
 * option structure
 *   type: 'delayed'|'async'|'oneByOne'|'script' (to know if the item must be drawn asynchronously or not, default: delayed)
 *   duration: <int> (in frames)
 *   start: 'inViewport'|'manual'|'autostart' (start automatically the animation, default: inViewport)
 *   delay: <int> (delay between the drawing of first and last path)
 *
 * The attribute 'type' is by default on 'delayed'.
 *  - 'delayed'
 *    all paths are draw at the same time but with a
 *    little delay between them before start
 *  - 'async'
 *    all path are start and finish at the same time
 *  - 'oneByOne'
 *    only one path is draw at the time
 *    the end of the first one will trigger the draw
 *    of the next one
 * 
 * All these values can be overritten individualy
 * for each path item in the SVG
 * The value of frames will always take the advantage of
 * the duration value.
 * If you fail somewhere, an error will be thrown.
 * Good luck.
 * 
 * @param {DOM|String}   element  Dom element of the SVG or id of it
 * @param {Object}       options  Options about the animation
 * @param {Function}     callback Callback for the end of the animation
 */
function Vivus(element, options, callback) {
  // Test params
  if (!element) {
    throw new Error('Vivus contructor: "element" parameter is required');
  }
  if (!!options && options.constructor !== Object) {
    throw new Error('Vivus contructor: "options" parameter must be an object');
  }
  if (!!callback && callback.constructor !== Function) {
    throw new Error('Vivus contructor: "callback" parameter must be a function');
  }

  // Set the element
  if (element.constructor === String) {
    element = document.getElementById(element);
    if (!element) {
      throw new Error('Vivus contructor: "element" parameter is not related to an existing ID');
    }
  }
  if (element.constructor === SVGSVGElement) {
    this.el = element;
  } else {
    throw new Error('Vivus contructor: "element" parameter must be a string or a SVGelement');
  }

  // Set the options
  this.initOptions(options);
  this.callback = callback || function () {};

  // Set object variables
  this.isDrawn = false;
  this.currentFrame = 0;
  this.map = [];

  // Start
  this.mapping();
  this.init();
}

/**
 * Set up user option to the object
 * 
 * @param  {object} options Object from the constructor
 */
Vivus.prototype.initOptions = function (options) {
  var allowedTypes = ['delayed', 'async', 'oneByOne', 'script'];
  var allowedStarts =  ['inViewport', 'manual', 'autostart'];
  
  this.type = allowedTypes.indexOf(options.type) === -1 ? allowedTypes[0] : options.type;
  this.start = allowedStarts.indexOf(options.start) === -1 ? allowedStarts[0] : options.start;
  this.duration = !!options.duration && options.duration > 0 ? options.duration : 120;
  this.delay = options.delay >= 0 ? parseInt(options.delay, 10) : null;

  if (this.delay > this.duration) {
    throw new Error('Vivus contructor: delai must be shorter than duration');
  }
};

/**
 * Map the svg, path by path
 * and create the scenario fo the animation
 * 
 * @return {[type]} [description]
 */
Vivus.prototype.mapping = function () {
  var i, paths, path, pAttrs, pathObj, totalLength, lengthMeter, timePoint;
  timePoint = totalLength = lengthMeter = 0;
  paths = this.el.querySelectorAll('path');
  
  for (i = 0; i < paths.length; i++) {
    path = paths[i];
    pathObj = {
      el: path,
      length: Math.ceil(path.getTotalLength())
    };
    totalLength += pathObj.length;
    this.map.push(pathObj);
    path.style.strokeDasharray = pathObj.length + ' ' + (pathObj.length + 10);
    path.style.strokeDashoffset = pathObj.length;
  }

  this.delay = this.delay === null ? this.duration / 3 : this.delay;
  this.delayUnit = this.delay / paths.length;

  for (i = 0; i < paths.length; i++) {
    pathObj = this.map[i];

    switch (this.type) {
    case 'delayed':
      pathObj.startAt = this.delayUnit * i;
      pathObj.duration = this.duration - this.delay;
      break;

    case 'oneByOne':
      pathObj.startAt = lengthMeter / totalLength * this.duration;
      pathObj.duration = pathObj.length / totalLength * this.duration;
      break;

    case 'async':
      pathObj.startAt = 0;
      pathObj.duration = this.duration;
      break;

    case 'script':
      path = paths[i];
      pAttrs = this.parseAttr(path.attributes);
      pathObj.startAt = timePoint + (parseInt(pAttrs['data-delay'], 10) || this.delayUnit || 0);
      pathObj.duration = (parseInt(pAttrs['data-duration'], 10) || this.duration);
      timePoint = pAttrs['data-async'] !== undefined ? timePoint + (parseInt(pAttrs['data-delay'], 10) || 0) : pathObj.startAt + pathObj.duration;
      break;
    }
    lengthMeter += pathObj.length;
  }
};

/**
 * Parse attributes of a DOM element to
 * get an object of attribute => value
 * 
 * @param  {object} element DOM element to parse
 * @return {object}         Object of attributes
 */
Vivus.prototype.parseAttr = function (element) {
  var attr, output = {};
  for (var i = 0; i < element.length; i++) {
    attr = element[i];
    output[attr.name] = attr.value;
  }
  return output;
};

/**
 * Trigger to start of the animation
 * 
 */
Vivus.prototype.init = function () {
  switch (this.start) {
  case 'manual':
    return;

  case 'autostart':
    this.draw();
    break;

  default:
    var self = this,
    listener = function (e) {
      if (self.isInViewport(self.el, 1)) {
        self.draw();
        window.removeEventListener('scroll', listener);
      }
    };
    window.addEventListener('scroll', listener);
  }
};


Vivus.prototype.reset = function() {
  if (this.isDrawn) {
    this.isDrawn = false;
    this.prepairPaths();
    this.draw();
  }
};

Vivus.prototype.draw = function() {
  if (this.isDrawn) {
    return;
  }
  this.drawer();
};

Vivus.prototype.drawer = function() {
  var i, progress, path;
  var self = this;

  if (!!this.map[this.map.length-1].done) {
    window.cancelAnimFrame(this.handle);
    this.callback(this);
  } else {
    for (i in this.map) {
      path = this.map[i];
      if (!path.done && path.startAt < this.currentFrame) {
        progress = (this.currentFrame - path.startAt) / path.duration;
        if (progress > 1) {
          path.done = true;
          progress = 1;
        }
        path.el.style.strokeDashoffset = Math.floor(path.length * (1 - progress));
      }
    }
    this.handle = window.requestAnimFrame(function() { self.drawer(); });
  }
  this.currentFrame++;
};

/**
 * Utils methods
 * from Codrops
 **************************************
 */

/**
 * Reply if an element is in the page viewport
 * 
 * @param  {object} el Element to observe
 * @param  {number} h  Percentage of height
 * @return {boolean}
 */
Vivus.prototype.isInViewport = function (el, h) {
  while (!el.offsetTop) {
    el = el.parentElement;
  }
  var elH = el.offsetHeight,
    scrolled = this.scrollY(),
    viewed = scrolled + this.getViewportH(),
    elTop = this.getOffset(el).top,
    elBottom = elTop + elH,
    // if 0, the element is considered in the viewport as soon as it enters.
    // if 1, the element is considered in the viewport only when it's fully inside
    // value in percentage (1 >= h >= 0)
    height = h || 0;

  return (elTop + elH * height) <= viewed && (elBottom) >= scrolled;
};

/**
 * Alias for document element
 * 
 * @type {DOMelement}
 */
Vivus.prototype.docElem = window.document.documentElement;

/**
 * Get the viewport height in pixels
 * 
 * @return {integer} Viewport height
 */
Vivus.prototype.getViewportH = function () {
  var client = this.docElem['clientHeight'],
    inner = window['innerHeight'];
   
  if( client < inner )
    return inner;
  else
    return client;
};

/**
 * Get the page Y offset
 *
 * @return {integer} Page Y offset
 */
Vivus.prototype.scrollY = function () {
  return window.pageYOffset || this.docElem.scrollTop;
};

/**
 * Get the offset position of an element
 * in the viewport. The returned object
 * contain `top` and `left` property.
 *
 * With help from:
 * http://stackoverflow.com/a/5598797/989439
 * 
 * @param  {DOMelement} el Element to observe
 * @return {object}        Offset position
 */
Vivus.prototype.getOffset = function (el) {
  var offsetTop = 0, offsetLeft = 0;
  do {
    if ( !isNaN( el.offsetTop ) ) {
      offsetTop += el.offsetTop;
    }
    if ( !isNaN( el.offsetLeft ) ) {
      offsetLeft += el.offsetLeft;
    }
  } while (el = el.offsetParent);

  return {
    top : offsetTop,
    left : offsetLeft
  };
};

/**
 * Alias for `requestAnimationFrame` or
 * `setTimeout` function for deprecated browsers.
 * 
 */
window.requestAnimFrame = function(){
  return (
    window.requestAnimationFrame       ||
    window.webkitRequestAnimationFrame ||
    window.mozRequestAnimationFrame    ||
    window.oRequestAnimationFrame      ||
    window.msRequestAnimationFrame     ||
    function(/* function */ callback){
      window.setTimeout(callback, 1000 / 60);
    }
  );
}();

/**
 * Alias for `cancelAnimationFrame` or
 * `cancelTimeout` function for deprecated browsers.
 * 
 */
window.cancelAnimFrame = function(){
  return (
    window.cancelAnimationFrame       ||
    window.webkitCancelAnimationFrame ||
    window.mozCancelAnimationFrame    ||
    window.oCancelAnimationFrame      ||
    window.msCancelAnimationFrame     ||
    function(id){
      window.clearTimeout(id);
    }
  );
}();