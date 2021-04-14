'use strict';

var setupEnv, requestAnimFrame, cancelAnimFrame, parsePositiveInt;

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
 *   type: 'delayed'|'sync'|'oneByOne'|'script' (to know if the items must be drawn synchronously or not, default: delayed)
 *   duration: <int> (in frames)
 *   start: 'inViewport'|'manual'|'autostart' (start automatically the animation, default: inViewport)
 *   delay: <int> (delay between the drawing of first and last path)
 *   dashGap <integer> whitespace extra margin between dashes
 *   pathTimingFunction <function> timing animation function for each path element of the SVG
 *   animTimingFunction <function> timing animation function for the complete SVG
 *   forceRender <boolean> force the browser to re-render all updated path items
 *   selfDestroy <boolean> removes all extra styling on the SVG, and leaves it as original
 *
 * The attribute 'type' is by default on 'delayed'.
 *  - 'delayed'
 *    all paths are draw at the same time but with a
 *    little delay between them before start
 *  - 'sync'
 *    all path are start and finish at the same time
 *  - 'oneByOne'
 *    only one path is draw at the time
 *    the end of the first one will trigger the draw
 *    of the next one
 *
 * All these values can be overwritten individually
 * for each path item in the SVG
 * The value of frames will always take the advantage of
 * the duration value.
 * If you fail somewhere, an error will be thrown.
 * Good luck.
 *
 * @constructor
 * @this {Vivus}
 * @param {DOM|String}   element  Dom element of the SVG or id of it
 * @param {Object}       options  Options about the animation
 * @param {Function}     callback Callback for the end of the animation
 */
function Vivus(element, options, callback) {
  setupEnv();

  // Setup
  this.isReady = false;
  this.setElement(element, options);
  this.setOptions(options);
  this.setCallback(callback);

  if (this.isReady) {
    this.init();
  }
}

/**
 * Timing functions
 **************************************
 *
 * Default functions to help developers.
 * It always take a number as parameter (between 0 to 1) then
 * return a number (between 0 and 1)
 */
Vivus.LINEAR = function(x) {
  return x;
};
Vivus.EASE = function(x) {
  return -Math.cos(x * Math.PI) / 2 + 0.5;
};
Vivus.EASE_OUT = function(x) {
  return 1 - Math.pow(1 - x, 3);
};
Vivus.EASE_IN = function(x) {
  return Math.pow(x, 3);
};
Vivus.EASE_OUT_BOUNCE = function(x) {
  var base = -Math.cos(x * (0.5 * Math.PI)) + 1,
    rate = Math.pow(base, 1.5),
    rateR = Math.pow(1 - x, 2),
    progress = -Math.abs(Math.cos(rate * (2.5 * Math.PI))) + 1;
  return 1 - rateR + progress * rateR;
};

/**
 * Setters
 **************************************
 */

/**
 * Check and set the element in the instance
 * The method will not return anything, but will throw an
 * error if the parameter is invalid
 *
 * @param {DOM|String}   element  SVG Dom element or id of it
 */
Vivus.prototype.setElement = function(element, options) {
  var onLoad, self;

  // Basic check
  if (typeof element === 'undefined') {
    throw new Error('Vivus [constructor]: "element" parameter is required');
  }

  // Set the element
  if (element.constructor === String) {
    element = document.getElementById(element);
    if (!element) {
      throw new Error(
        'Vivus [constructor]: "element" parameter is not related to an existing ID'
      );
    }
  }
  this.parentEl = element;

  // Load the SVG with XMLHttpRequest and extract the SVG
  if (options && options.file) {
    self = this;
    onLoad = function() {
      var domSandbox = document.createElement('div');
      domSandbox.innerHTML = this.responseText;

      var svgTag = domSandbox.querySelector('svg');
      if (!svgTag) {
        throw new Error(
          'Vivus [load]: Cannot find the SVG in the loaded file : ' +
            options.file
        );
      }

      self.el = svgTag;
      self.el.setAttribute('width', '100%');
      self.el.setAttribute('height', '100%');
      self.parentEl.appendChild(self.el);
      self.isReady = true;
      self.init();
      self = null;
    };

    var oReq = new window.XMLHttpRequest();
    oReq.addEventListener('load', onLoad);
    oReq.open('GET', options.file);
    oReq.send();
    return;
  }

  switch (element.constructor) {
    case window.SVGSVGElement:
    case window.SVGElement:
    case window.SVGGElement:
      this.el = element;
      this.isReady = true;
      break;

    case window.HTMLObjectElement:
      self = this;
      onLoad = function(e) {
        if (self.isReady) {
          return;
        }
        self.el =
          element.contentDocument &&
          element.contentDocument.querySelector('svg');
        if (!self.el && e) {
          throw new Error(
            'Vivus [constructor]: object loaded does not contain any SVG'
          );
        } else if (self.el) {
          if (element.getAttribute('built-by-vivus')) {
            self.parentEl.insertBefore(self.el, element);
            self.parentEl.removeChild(element);
            self.el.setAttribute('width', '100%');
            self.el.setAttribute('height', '100%');
          }
          self.isReady = true;
          self.init();
          self = null;
        }
      };

      if (!onLoad()) {
        element.addEventListener('load', onLoad);
      }
      break;

    default:
      throw new Error(
        'Vivus [constructor]: "element" parameter is not valid (or miss the "file" attribute)'
      );
  }
};

/**
 * Set up user option to the instance
 * The method will not return anything, but will throw an
 * error if the parameter is invalid
 *
 * @param  {object} options Object from the constructor
 */
Vivus.prototype.setOptions = function(options) {
  var allowedTypes = [
    'delayed',
    'sync',
    'async',
    'nsync',
    'oneByOne',
    'scenario',
    'scenario-sync'
  ];
  var allowedStarts = ['inViewport', 'manual', 'autostart'];

  // Basic check
  if (options !== undefined && options.constructor !== Object) {
    throw new Error(
      'Vivus [constructor]: "options" parameter must be an object'
    );
  } else {
    options = options || {};
  }

  // Set the animation type
  if (options.type && allowedTypes.indexOf(options.type) === -1) {
    throw new Error(
      'Vivus [constructor]: ' +
        options.type +
        ' is not an existing animation `type`'
    );
  } else {
    this.type = options.type || allowedTypes[0];
  }

  // Set the start type
  if (options.start && allowedStarts.indexOf(options.start) === -1) {
    throw new Error(
      'Vivus [constructor]: ' +
        options.start +
        ' is not an existing `start` option'
    );
  } else {
    this.start = options.start || allowedStarts[0];
  }

  this.isIE =
    window.navigator.userAgent.indexOf('MSIE') !== -1 ||
    window.navigator.userAgent.indexOf('Trident/') !== -1 ||
    window.navigator.userAgent.indexOf('Edge/') !== -1;
  this.duration = parsePositiveInt(options.duration, 120);
  this.delay = parsePositiveInt(options.delay, null);
  this.dashGap = parsePositiveInt(options.dashGap, 1);
  this.forceRender = options.hasOwnProperty('forceRender')
    ? !!options.forceRender
    : this.isIE;
  this.reverseStack = !!options.reverseStack;
  this.selfDestroy = !!options.selfDestroy;
  this.onReady = options.onReady;
  this.map = [];
  this.frameLength = this.currentFrame = this.delayUnit = this.speed = this.handle = null;

  this.ignoreInvisible = options.hasOwnProperty('ignoreInvisible')
    ? !!options.ignoreInvisible
    : false;

  this.animTimingFunction = options.animTimingFunction || Vivus.LINEAR;
  this.pathTimingFunction = options.pathTimingFunction || Vivus.LINEAR;

  if (this.delay >= this.duration) {
    throw new Error('Vivus [constructor]: delay must be shorter than duration');
  }
};

/**
 * Set up callback to the instance
 * The method will not return enything, but will throw an
 * error if the parameter is invalid
 *
 * @param  {Function} callback Callback for the animation end
 */
Vivus.prototype.setCallback = function(callback) {
  // Basic check
  if (!!callback && callback.constructor !== Function) {
    throw new Error(
      'Vivus [constructor]: "callback" parameter must be a function'
    );
  }
  this.callback = callback || function() {};
};

/**
 * Core
 **************************************
 */

/**
 * Map the svg, path by path.
 * The method return nothing, it just fill the
 * `map` array. Each item in this array represent
 * a path element from the SVG, with informations for
 * the animation.
 *
 * ```
 * [
 *   {
 *     el: <DOMobj> the path element
 *     length: <number> length of the path line
 *     startAt: <number> time start of the path animation (in frames)
 *     duration: <number> path animation duration (in frames)
 *   },
 *   ...
 * ]
 * ```
 *
 */
Vivus.prototype.mapping = function() {
  var i, paths, path, pAttrs, pathObj, totalLength, lengthMeter, timePoint, scale, hasNonScale;
  timePoint = totalLength = lengthMeter = 0;
  paths = this.el.querySelectorAll('path');
  hasNonScale = false;

  for (i = 0; i < paths.length; i++) {
    path = paths[i];
    if (this.isInvisible(path)) {
      continue;
    }

    pathObj = {
      el: path,
      length: 0,
      startAt: 0,
      duration: 0,
      isResizeSensitive: false
    };

    // If vector effect is non-scaling-stroke, the total length won't match the rendered length
    // so we need to calculate the scale and apply it
    if (path.getAttribute('vector-effect') === 'non-scaling-stroke') {
      var rect = path.getBoundingClientRect();
      var box = path.getBBox();
      scale = Math.max(rect.width / box.width, rect.height / box.height);
      pathObj.isResizeSensitive = true;
      hasNonScale = true;
    } else {
      scale = 1;
    }
    pathObj.length = Math.ceil(path.getTotalLength() * scale);

    // Test if the path length is correct
    if (isNaN(pathObj.length)) {
      if (window.console && console.warn) {
        console.warn(
          'Vivus [mapping]: cannot retrieve a path element length',
          path
        );
      }
      continue;
    }
    this.map.push(pathObj);
    path.style.strokeDasharray =
      pathObj.length + ' ' + (pathObj.length + this.dashGap * 2);
    path.style.strokeDashoffset = pathObj.length + this.dashGap;
    pathObj.length += this.dashGap;
    totalLength += pathObj.length;

    this.renderPath(i);
  }

  // Show a warning for non-scaling elements
  if (hasNonScale) {
    console.warn('Vivus: this SVG contains non-scaling-strokes. You should call instance.recalc() when the SVG is resized or you will encounter unwanted behaviour. See https://github.com/maxwellito/vivus#non-scaling for more info.');
  }

  totalLength = totalLength === 0 ? 1 : totalLength;
  this.delay = this.delay === null ? this.duration / 3 : this.delay;
  this.delayUnit = this.delay / (paths.length > 1 ? paths.length - 1 : 1);

  // Reverse stack if asked
  if (this.reverseStack) {
    this.map.reverse();
  }

  for (i = 0; i < this.map.length; i++) {
    pathObj = this.map[i];

    switch (this.type) {
      case 'delayed':
        pathObj.startAt = this.delayUnit * i;
        pathObj.duration = this.duration - this.delay;
        break;

      case 'oneByOne':
        pathObj.startAt = (lengthMeter / totalLength) * this.duration;
        pathObj.duration = (pathObj.length / totalLength) * this.duration;
        break;

      case 'sync':
      case 'async':
      case 'nsync':
        pathObj.startAt = 0;
        pathObj.duration = this.duration;
        break;

      case 'scenario-sync':
        path = pathObj.el;
        pAttrs = this.parseAttr(path);
        pathObj.startAt =
          timePoint +
          (parsePositiveInt(pAttrs['data-delay'], this.delayUnit) || 0);
        pathObj.duration = parsePositiveInt(
          pAttrs['data-duration'],
          this.duration
        );
        timePoint =
          pAttrs['data-async'] !== undefined
            ? pathObj.startAt
            : pathObj.startAt + pathObj.duration;
        this.frameLength = Math.max(
          this.frameLength,
          pathObj.startAt + pathObj.duration
        );
        break;

      case 'scenario':
        path = pathObj.el;
        pAttrs = this.parseAttr(path);
        pathObj.startAt =
          parsePositiveInt(pAttrs['data-start'], this.delayUnit) || 0;
        pathObj.duration = parsePositiveInt(
          pAttrs['data-duration'],
          this.duration
        );
        this.frameLength = Math.max(
          this.frameLength,
          pathObj.startAt + pathObj.duration
        );
        break;
    }
    lengthMeter += pathObj.length;
    this.frameLength = this.frameLength || this.duration;
  }
};

/**
 * Public method to re-evaluate line length for non-scaling lines
 * path elements.
 */
Vivus.prototype.recalc = function () {
  if (this.mustRecalcScale) {
    return;
  }
  this.mustRecalcScale = requestAnimFrame(function () {
    this.performLineRecalc();
  }.bind(this));
}

/**
 * Private method to re-evaluate line length on non-scaling
 * path elements. Then call for a trace to update the SVG. 
 */
Vivus.prototype.performLineRecalc = function () {
  var pathObj, path, rect, box, scale;
  for (var i = 0; i < this.map.length; i++) {
    pathObj = this.map[i];
    if (pathObj.isResizeSensitive) {
      path = pathObj.el;
      rect = path.getBoundingClientRect();
      box = path.getBBox();
      scale = Math.max(rect.width / box.width, rect.height / box.height);
      pathObj.length = Math.ceil(path.getTotalLength() * scale);
      path.style.strokeDasharray = pathObj.length + ' ' + (pathObj.length + this.dashGap * 2);
    }
  }
  this.trace();
  this.mustRecalcScale = null;
}

/**
 * Interval method to draw the SVG from current
 * position of the animation. It update the value of
 * `currentFrame` and re-trace the SVG.
 *
 * It use this.handle to store the requestAnimationFrame
 * and clear it one the animation is stopped. So this
 * attribute can be used to know if the animation is
 * playing.
 *
 * Once the animation at the end, this method will
 * trigger the Vivus callback.
 *
 */
Vivus.prototype.draw = function() {
  var self = this;
  this.currentFrame += this.speed;

  if (this.currentFrame <= 0) {
    this.stop();
    this.reset();
  } else if (this.currentFrame >= this.frameLength) {
    this.stop();
    this.currentFrame = this.frameLength;
    this.trace();
    if (this.selfDestroy) {
      this.destroy();
    }
  } else {
    this.trace();
    this.handle = requestAnimFrame(function() {
      self.draw();
    });
    return;
  }

  this.callback(this);
  if (this.instanceCallback) {
    this.instanceCallback(this);
    this.instanceCallback = null;
  }
};

/**
 * Draw the SVG at the current instant from the
 * `currentFrame` value. Here is where most of the magic is.
 * The trick is to use the `strokeDashoffset` style property.
 *
 * For optimisation reasons, a new property called `progress`
 * is added in each item of `map`. This one contain the current
 * progress of the path element. Only if the new value is different
 * the new value will be applied to the DOM element. This
 * method save a lot of resources to re-render the SVG. And could
 * be improved if the animation couldn't be played forward.
 *
 */
Vivus.prototype.trace = function() {
  var i, progress, path, currentFrame;
  currentFrame =
    this.animTimingFunction(this.currentFrame / this.frameLength) *
    this.frameLength;
  for (i = 0; i < this.map.length; i++) {
    path = this.map[i];
    progress = (currentFrame - path.startAt) / path.duration;
    progress = this.pathTimingFunction(Math.max(0, Math.min(1, progress)));
    if (path.progress !== progress) {
      path.progress = progress;
      path.el.style.strokeDashoffset = Math.floor(path.length * (1 - progress));
      this.renderPath(i);
    }
  }
};

/**
 * Method forcing the browser to re-render a path element
 * from it's index in the map. Depending on the `forceRender`
 * value.
 * The trick is to replace the path element by it's clone.
 * This practice is not recommended because it's asking more
 * ressources, too much DOM manupulation..
 * but it's the only way to let the magic happen on IE.
 * By default, this fallback is only applied on IE.
 *
 * @param  {Number} index Path index
 */
Vivus.prototype.renderPath = function(index) {
  if (this.forceRender && this.map && this.map[index]) {
    var pathObj = this.map[index],
      newPath = pathObj.el.cloneNode(true);
    pathObj.el.parentNode.replaceChild(newPath, pathObj.el);
    pathObj.el = newPath;
  }
};

/**
 * When the SVG object is loaded and ready,
 * this method will continue the initialisation.
 *
 * This this mainly due to the case of passing an
 * object tag in the constructor. It will wait
 * the end of the loading to initialise.
 *
 */
Vivus.prototype.init = function() {
  // Set object variables
  this.frameLength = 0;
  this.currentFrame = 0;
  this.map = [];

  // Start
  new Pathformer(this.el);
  this.mapping();
  this.starter();

  if (this.onReady) {
    this.onReady(this);
  }
};

/**
 * Trigger to start of the animation.
 * Depending on the `start` value, a different script
 * will be applied.
 *
 * If the `start` value is not valid, an error will be thrown.
 * Even if technically, this is impossible.
 *
 */
Vivus.prototype.starter = function() {
  switch (this.start) {
    case 'manual':
      return;

    case 'autostart':
      this.play();
      break;

    case 'inViewport':
      var self = this,
        listener = function() {
          if (self.isInViewport(self.parentEl, 1)) {
            self.play();
            window.removeEventListener('scroll', listener);
          }
        };
      window.addEventListener('scroll', listener);
      listener();
      break;
  }
};

/**
 * Controls
 **************************************
 */

/**
 * Get the current status of the animation between
 * three different states: 'start', 'progress', 'end'.
 * @return {string} Instance status
 */
Vivus.prototype.getStatus = function() {
  return this.currentFrame === 0
    ? 'start'
    : this.currentFrame === this.frameLength
    ? 'end'
    : 'progress';
};

/**
 * Reset the instance to the initial state : undraw
 * Be careful, it just reset the animation, if you're
 * playing the animation, this won't stop it. But just
 * make it start from start.
 *
 */
Vivus.prototype.reset = function() {
  return this.setFrameProgress(0);
};

/**
 * Set the instance to the final state : drawn
 * Be careful, it just set the animation, if you're
 * playing the animation on rewind, this won't stop it.
 * But just make it start from the end.
 *
 */
Vivus.prototype.finish = function() {
  return this.setFrameProgress(1);
};

/**
 * Set the level of progress of the drawing.
 *
 * @param {number} progress Level of progress to set
 */
Vivus.prototype.setFrameProgress = function(progress) {
  progress = Math.min(1, Math.max(0, progress));
  this.currentFrame = Math.round(this.frameLength * progress);
  this.trace();
  return this;
};

/**
 * Play the animation at the desired speed.
 * Speed must be a valid number (no zero).
 * By default, the speed value is 1.
 * But a negative value is accepted to go forward.
 *
 * And works with float too.
 * But don't forget we are in JavaScript, se be nice
 * with him and give him a 1/2^x value.
 *
 * @param  {number} speed Animation speed [optional]
 */
Vivus.prototype.play = function(speed, callback) {
  this.instanceCallback = null;

  if (speed && typeof speed === 'function') {
    this.instanceCallback = speed; // first parameter is actually the callback function
    speed = null;
  } else if (speed && typeof speed !== 'number') {
    throw new Error('Vivus [play]: invalid speed');
  }
  // if the first parameter wasn't the callback, check if the seconds was
  if (callback && typeof callback === 'function' && !this.instanceCallback) {
    this.instanceCallback = callback;
  }

  this.speed = speed || 1;
  if (!this.handle) {
    this.draw();
  }
  return this;
};

/**
 * Stop the current animation, if on progress.
 * Should not trigger any error.
 *
 */
Vivus.prototype.stop = function() {
  if (this.handle) {
    cancelAnimFrame(this.handle);
    this.handle = null;
  }
  return this;
};

/**
 * Destroy the instance.
 * Remove all bad styling attributes on all
 * path tags
 *
 */
Vivus.prototype.destroy = function() {
  this.stop();
  var i, path;
  for (i = 0; i < this.map.length; i++) {
    path = this.map[i];
    path.el.style.strokeDashoffset = null;
    path.el.style.strokeDasharray = null;
    this.renderPath(i);
  }
};

/**
 * Utils methods
 * include methods from Codrops
 **************************************
 */

/**
 * Method to best guess if a path should added into
 * the animation or not.
 *
 * 1. Use the `data-vivus-ignore` attribute if set
 * 2. Check if the instance must ignore invisible paths
 * 3. Check if the path is visible
 *
 * For now the visibility checking is unstable.
 * It will be used for a beta phase.
 *
 * Other improvments are planned. Like detecting
 * is the path got a stroke or a valid opacity.
 */
Vivus.prototype.isInvisible = function(el) {
  var rect,
    ignoreAttr = el.getAttribute('data-ignore');

  if (ignoreAttr !== null) {
    return ignoreAttr !== 'false';
  }

  if (this.ignoreInvisible) {
    rect = el.getBoundingClientRect();
    return !rect.width && !rect.height;
  } else {
    return false;
  }
};

/**
 * Parse attributes of a DOM element to
 * get an object of {attributeName => attributeValue}
 *
 * @param  {object} element DOM element to parse
 * @return {object}         Object of attributes
 */
Vivus.prototype.parseAttr = function(element) {
  var attr,
    output = {};
  if (element && element.attributes) {
    for (var i = 0; i < element.attributes.length; i++) {
      attr = element.attributes[i];
      output[attr.name] = attr.value;
    }
  }
  return output;
};

/**
 * Reply if an element is in the page viewport
 *
 * @param  {object} el Element to observe
 * @param  {number} h  Percentage of height
 * @return {boolean}
 */
Vivus.prototype.isInViewport = function(el, h) {
  var scrolled = this.scrollY(),
    viewed = scrolled + this.getViewportH(),
    elBCR = el.getBoundingClientRect(),
    elHeight = elBCR.height,
    elTop = scrolled + elBCR.top,
    elBottom = elTop + elHeight;

  // if 0, the element is considered in the viewport as soon as it enters.
  // if 1, the element is considered in the viewport only when it's fully inside
  // value in percentage (1 >= h >= 0)
  h = h || 0;

  return elTop + elHeight * h <= viewed && elBottom >= scrolled;
};

/**
 * Get the viewport height in pixels
 *
 * @return {integer} Viewport height
 */
Vivus.prototype.getViewportH = function() {
  var client = this.docElem.clientHeight,
    inner = window.innerHeight;

  if (client < inner) {
    return inner;
  } else {
    return client;
  }
};

/**
 * Get the page Y offset
 *
 * @return {integer} Page Y offset
 */
Vivus.prototype.scrollY = function() {
  return window.pageYOffset || this.docElem.scrollTop;
};

setupEnv = function() {
  if (Vivus.prototype.docElem) {
    return;
  }

  /**
   * Alias for document element
   *
   * @type {DOMelement}
   */
  Vivus.prototype.docElem = window.document.documentElement;

  /**
   * Alias for `requestAnimationFrame` or
   * `setTimeout` function for deprecated browsers.
   *
   */
  requestAnimFrame = (function() {
    return (
      window.requestAnimationFrame ||
      window.webkitRequestAnimationFrame ||
      window.mozRequestAnimationFrame ||
      window.oRequestAnimationFrame ||
      window.msRequestAnimationFrame ||
      function(/* function */ callback) {
        return window.setTimeout(callback, 1000 / 60);
      }
    );
  })();

  /**
   * Alias for `cancelAnimationFrame` or
   * `cancelTimeout` function for deprecated browsers.
   *
   */
  cancelAnimFrame = (function() {
    return (
      window.cancelAnimationFrame ||
      window.webkitCancelAnimationFrame ||
      window.mozCancelAnimationFrame ||
      window.oCancelAnimationFrame ||
      window.msCancelAnimationFrame ||
      function(id) {
        return window.clearTimeout(id);
      }
    );
  })();
};

/**
 * Parse string to integer.
 * If the number is not positive or null
 * the method will return the default value
 * or 0 if undefined
 *
 * @param {string} value String to parse
 * @param {*} defaultValue Value to return if the result parsed is invalid
 * @return {number}
 *
 */
parsePositiveInt = function(value, defaultValue) {
  var output = parseInt(value, 10);
  return output >= 0 ? output : defaultValue;
};
