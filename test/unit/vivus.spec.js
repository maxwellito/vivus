'use strict';

/**
 * Unit tests for Vivus
 *
 */
describe('Vivus', function () {

  var ObjectElementMock,
    myVivus,
    objTag,
    wrapTag,
    svgTag,
    svgTagId = 'my-svg';

  // Mock ObjectElement and it's constructor via createElement
  ObjectElementMock = function () {
    this.loadCb = [];
    this.addEventListener = function (evtName, cb) {
      if (evtName === 'load') this.loadCb.push(cb);
    }
    this.loaded = function () {
      for (var i = 0; i < this.loadCb.length; i++) {
        this.loadCb[i]();
      }
    }
  };
  window.HTMLObjectElement = ObjectElementMock;

  beforeEach(function () {
    // Remove tag if existing
    svgTag = document.getElementById(svgTagId);

    // Create the SVG
    svgTag = document.createElementNS('http://www.w3.org/2000/svg','svg');
    svgTag.id = svgTagId;
    svgTag.innerHTML = '<circle fill="none" stroke="#f9f9f9" stroke-width="3" stroke-miterlimit="10" cx="100" cy="100" r="72.947"/>' +
      '<circle fill="none" stroke="#f9f9f9" stroke-width="3" stroke-miterlimit="10" cx="100" cy="100" r="39.74"/>' +
      '<line fill="none" stroke="#f9f9f9" stroke-width="3" stroke-miterlimit="10" x1="34.042" y1="131.189" x2="67.047" y2="77.781"/>' +
      '<line fill="none" stroke="#f9f9f9" stroke-width="3" stroke-miterlimit="10" x1="165.957" y1="68.809" x2="132.953" y2="122.219"/>' +
      '<line fill="none" stroke="#f9f9f9" stroke-width="3" stroke-miterlimit="10" x1="131.19" y1="165.957" x2="77.781" y2="132.953"/>' +
      '<line fill="none" stroke="#f9f9f9" stroke-width="3" stroke-miterlimit="10" x1="68.81" y1="34.042" x2="122.219" y2="67.046"/>';

    // Insert it to the body
    document.body.appendChild(svgTag);

    wrapTag = document.createElement('div');
    wrapTag.appendChild(svgTag);
  });

  afterEach(function () {
    // Remove tag
    svgTag.remove();
  });

  describe('[basic tests]', function () {

    it('should the class be defined under Vivus name', function () {
      expect(Vivus).toBeDefined();
    });

    it('should have timing functions set', function () {
      expect(Vivus.LINEAR).toBeDefined();
      expect(Vivus.EASE).toBeDefined();
      expect(Vivus.EASE_IN).toBeDefined();
      expect(Vivus.EASE_OUT).toBeDefined();
      expect(Vivus.EASE_OUT_BOUNCE).toBeDefined();
    });

    it('should have timing functions returning correct value on limits', function () {
      expect(Vivus.LINEAR(0)).toEqual(0);
      expect(Vivus.LINEAR(1)).toEqual(1);
      expect(Vivus.EASE(0)).toEqual(0);
      expect(Vivus.EASE(1)).toEqual(1);
      expect(Vivus.EASE_IN(0)).toEqual(0);
      expect(Vivus.EASE_IN(1)).toEqual(1);
      expect(Vivus.EASE_OUT(0)).toEqual(0);
      expect(Vivus.EASE_OUT(1)).toEqual(1);
      expect(Vivus.EASE_OUT_BOUNCE(0)).toEqual(0);
      expect(Vivus.EASE_OUT_BOUNCE(1)).toEqual(1);
    });
  });

  describe('[param tests]', function () {

    // Tests about the SVG element
    it('should throw an error if the SVG is given in parameter', function () {
      expect(function () {
        new Vivus();
      }).toThrow(new Error('Vivus [constructor]: "element" parameter is required'));
    });

    it('should work with only the SVG id', function () {
      expect(function () {
        new Vivus(svgTagId);
      }).not.toThrow();
    });

    it('should work with only the SVG object', function () {
      expect(function () {
        new Vivus(svgTag);
      }).not.toThrow();
    });

    it('should throw an error if the SVG ID given is invalid', function () {
      expect(function () {
        new Vivus('my-unexisting-svg');
      }).toThrow(new Error('Vivus [constructor]: "element" parameter is not related to an existing ID'));
    });

    it('should throw an error if the ID given is not related to a SVG element', function () {
      var divTag = document.createElement('div');
      divTag.id = 'my-div';
      document.body.appendChild(divTag);
      expect(function () {
        new Vivus('my-div');
      }).toThrow(new Error('Vivus [constructor]: "element" parameter is not valid (or miss the "file" attribute)'));
    });

    it('should accept any DOM element if `file` option is set', function () {
      var divTag = document.createElement('div');
      try {
        new Vivus(divTag, {file: 'opensource.svg'});
      }
      catch(err) {}

      expect(!!divTag.querySelector('object')).toBe(true);
    });

    it('should throw an error if the element is not a correct type (DOM object or string)', function () {
      expect(function () { new Vivus({}); }).toThrow(new Error('Vivus [constructor]: "element" parameter is not valid (or miss the "file" attribute)'));
      expect(function () { new Vivus(42); }).toThrow(new Error('Vivus [constructor]: "element" parameter is not valid (or miss the "file" attribute)'));
      expect(function () { new Vivus(false); }).toThrow(new Error('Vivus [constructor]: "element" parameter is not valid (or miss the "file" attribute)'));
      expect(function () { new Vivus(new Date()); }).toThrow(new Error('Vivus [constructor]: "element" parameter is not valid (or miss the "file" attribute)'));
      expect(function () { new Vivus(function () {}); }).toThrow(new Error('Vivus [constructor]: "element" parameter is not valid (or miss the "file" attribute)'));
      expect(function () { new Vivus(document.createElement('div')); }).toThrow(new Error('Vivus [constructor]: "element" parameter is not valid (or miss the "file" attribute)'));
    });

    it('should accept object element', function () {
      // Create a mock Object getElementById
      objTag = new ObjectElementMock();
      objTag.contentDocument = wrapTag;

      expect(function () {
        new Vivus(objTag);
      }).not.toThrow();
    });

    it('the vivus state should be ready if the SVG is already loaded', function () {
      objTag = new ObjectElementMock();
      objTag.contentDocument = wrapTag;
      objTag.loaded();
      var myVivus = new Vivus(objTag);
      expect(myVivus.isReady).toEqual(true);
    });

    it('should call `onReady` callback once the SVG is loaded', function () {
      objTag = new ObjectElementMock();
      objTag.contentDocument = document.createElement('div');
      var myVivus = new Vivus(objTag);
      objTag.contentDocument = wrapTag;
      objTag.loaded();
      expect(myVivus.isReady).toEqual(true);
    });

    it('should throw an error if the SVG file does not exists', function () {
      objTag = new ObjectElementMock();
      objTag.contentDocument = document.createElement('div');
      var myVivus = new Vivus(objTag);
      expect(function () {
        objTag.loaded();
      }).toThrow();
    });

    // Options
    it('should work without options', function () {
      expect(function () {
        new Vivus(svgTag);
      }).not.toThrow();
    });

    it('should throw an error if options is not an object', function () {
      expect(function () { new Vivus(svgTag, []); }).toThrow(new Error('Vivus [constructor]: "options" parameter must be an object'));
      expect(function () { new Vivus(svgTag, 42); }).toThrow(new Error('Vivus [constructor]: "options" parameter must be an object'));
      expect(function () { new Vivus(svgTag, false); }).toThrow(new Error('Vivus [constructor]: "options" parameter must be an object'));
      expect(function () { new Vivus(svgTag, new Date()); }).toThrow(new Error('Vivus [constructor]: "options" parameter must be an object'));
      expect(function () { new Vivus(svgTag, 'manual'); }).toThrow(new Error('Vivus [constructor]: "options" parameter must be an object'));
      expect(function () { new Vivus(svgTag, function () {}); }).toThrow(new Error('Vivus [constructor]: "options" parameter must be an object'));
    });

    // Options
    it('should work with empty option object', function () {
      expect(function () {
        new Vivus(svgTag, {});
      }).not.toThrow();
    });

    it('should throw an error if the `type` value given in options does not exists', function () {
      expect(function () {
        new Vivus(svgTag, {type: 'by-unicorn'});
      }).toThrow(new Error('Vivus [constructor]: by-unicorn is not an existing animation `type`'));
    });

    it('should throw an error if the `start` value given in options is not a string', function () {
      expect(function () {
        new Vivus(svgTag, {start: 'when-unicorn-ready'});
      }).toThrow(new Error('Vivus [constructor]: when-unicorn-ready is not an existing `start` option'));
    });

    it('should throw an error if the `delay` value is bigger (or equal) than `duration`', function () {
      expect(function () {
        new Vivus(svgTag, {duration: 200, delay: 199});
      }).not.toThrow();
      expect(function () {
        new Vivus(svgTag, {duration: 200, delay: 200});
      }).toThrow(new Error('Vivus [constructor]: delay must be shorter than duration'));
      expect(function () {
        new Vivus(svgTag, {duration: 200, delay: 201});
      }).toThrow(new Error('Vivus [constructor]: delay must be shorter than duration'));
    });

    it('should override `duration` if invalid', function () {
      myVivus = new Vivus(svgTag, {duration: -12});
      expect(myVivus.duration > 0).toBe(true);
    });

    it('should override `delay` if invalid, with a null value', function () {
      myVivus = new Vivus(svgTag, {delay: -12});
      expect(!myVivus.delay).toBe(false);
    });

    it('should set up default values', function () {
      myVivus = new Vivus(svgTag, {});
      expect(myVivus.type).toBeDefined();
      expect(myVivus.start).toBeDefined();
      expect(myVivus.duration).toBeDefined();
    });

    // Callback
    it('should throw an error if callback is non a function', function () {
      expect(function () {
        new Vivus(svgTag, {}, 42);
      }).toThrow(new Error('Vivus [constructor]: "callback" parameter must be a function'));
    });
  });

  describe('[engine]', function () {

    // Mapping
    describe('Mapping:', function () {

      it('shoud create a mapping of the SVG', function () {
        myVivus = new Vivus(svgTag, {});
        expect(myVivus.map && myVivus.map.length).toEqual(6);
      });

      it('should map with correct values for start and duration', function () {
        var i, typeIndex, types = ['delayed', 'async', 'oneByOne', 'scenario', 'scenario-sync'];
        for (typeIndex in types) {
          myVivus = new Vivus(svgTag, {type: types[typeIndex], duration: 200});
          for (i in myVivus.map) {
            expect(myVivus.map[i].startAt >= 0).toBe(true);
            expect(myVivus.map[i].duration >= 0).toBe(true);
          }
        }
      });

      // Tests for 'getTotalLength' method in case of awkward results
      describe('SVG parsing issue', function () {

        var getTotalLengthBkp = SVGPathElement.prototype.getTotalLength,
          warnBkp = console.warn;

        beforeEach(function () {
          SVGPathElement.prototype.getTotalLength = function () {
            return NaN;
          };
        });

        afterEach(function () {
          SVGPathElement.prototype.getTotalLength = getTotalLengthBkp;
          console.warn = warnBkp;
        });
        
        it('shoud call console.warn if a path length is NaN', function () {
          var warnSpy = jasmine.createSpy('spy');
          console.warn = warnSpy;
          myVivus = new Vivus(svgTag);
          expect(warnSpy.calls.count()).toEqual(6);
          expect(myVivus.map.length).toEqual(0);
        });

        it('shoudn\'t call console.warn if not defined a path length is NaN', function () {
          console.warn = null;
          myVivus = new Vivus(svgTag);
          expect(myVivus.map.length).toEqual(0);
        });
      });
    });

    // Drawing
    describe('Drawing:', function () {

      it('should call the callback once the animation is finished', function (done) {
        myVivus = new Vivus(svgTag, {
          type: 'oneByOne',
          duration: 2,
          start: 'autostart'
        }, function () {
          expect(true).toBe(true);
          done();
        });
      });

      it('should call the callback once the reverse animation is finished', function (done) {
        myVivus = new Vivus(svgTag, {
          type: 'oneByOne',
          duration: 2
        }, function () {
          expect(true).toBe(true);
          done();
        });

        myVivus.finish().play(-1);
      });

      it('should call destroy method once the animation is finished', function (done) {
        var destroySpy = jasmine.createSpy('spy');
        myVivus = new Vivus(svgTag, {
          type: 'oneByOne',
          duration: 2,
          start: 'manual',
          selfDestroy: true
        }, function () {
          expect(destroySpy.calls.count()).toEqual(1);
          done();
        });
        myVivus.destroy = destroySpy;
        myVivus.play();
      });

      it('should\' call destroy method if selfDestroy option is not present', function (done) {
        var destroySpy = jasmine.createSpy('spy');
        myVivus = new Vivus(svgTag, {
          type: 'oneByOne',
          duration: 2,
          start: 'manual'
        }, function () {
          expect(destroySpy.calls.count()).toEqual(0);
          done();
        });
        myVivus.destroy = destroySpy;
        myVivus.play();
      });

      it('should stop the animation once it reaches currentFrame == 0', function (done) {
        myVivus = new Vivus(svgTag, {
          type: 'oneByOne',
          duration: 2,
          start: 'manual'
        });
        myVivus.stop = function () {
          expect(true).toBe(true);
          done();
        };
        myVivus.play(-1);
      });

      it('should trace reasonably', function (done) {
        var callCount = 0;

        myVivus = new Vivus(svgTag, {
          type: 'oneByOne',
          duration: 2,
          start: 'manual'
        }, function () {
          expect(callCount).toEqual(4);
          done();
        });
        spyOn(myVivus, 'trace').and.callFake(function() {
          callCount++;
        });
        myVivus.play(0.5);
      });
    });

    describe('Force Render:', function () {

      it('should use renderPath if forceRender option is set to true', function () {
        myVivus = new Vivus(svgTag, { duration: 2, start: 'manual', forceRender: true });
        
        var originalFirstPath = myVivus.map[0].el;
        myVivus.renderPath(0);
        expect(myVivus.map[0].el).not.toBe(originalFirstPath);
      });

      it('should not use renderPath if forceRender option is set to false', function () {
        myVivus = new Vivus(svgTag, { duration: 2, start: 'manual', forceRender: false });
        
        var originalFirstPath = myVivus.map[0].el;
        myVivus.renderPath(0);
        expect(myVivus.map[0].el).toBe(originalFirstPath);
      });

      it('renderPath should not throw an error if the index doesn\'t exists', function () {
        myVivus = new Vivus(svgTag, { duration: 2, start: 'manual', forceRender: true });
        expect(function () {
          myVivus.renderPath(42);
        }).not.toThrow();
      });
    });

  });

  describe('[controls]', function () {

    beforeEach(function () {
      myVivus = new Vivus(svgTag, {
        type: 'oneByOne',
        duration: 2,
        start: 'manual'
      });
    });

    it('shouldn\'t play if the parameter in incorrect', function () {
      expect(function () {myVivus.play('a');}).toThrow(new Error('Vivus [play]: invalid speed'));
      expect(function () {myVivus.play({});}).toThrow(new Error('Vivus [play]: invalid speed'));
      expect(function () {myVivus.play([]);}).toThrow(new Error('Vivus [play]: invalid speed'));
      expect(function () {myVivus.play('1');}).toThrow(new Error('Vivus [play]: invalid speed'));
    });

    it('should return the correct status', function () {
      expect(myVivus.getStatus()).toEqual('start');
      myVivus.setFrameProgress(0.5);
      expect(myVivus.getStatus()).toEqual('progress');
      myVivus.finish();
      expect(myVivus.getStatus()).toEqual('end');
      myVivus.reset();
      expect(myVivus.getStatus()).toEqual('start');
    });

    it('should play with the normal speed by default', function () {
      myVivus.play();
      expect(myVivus.speed).toEqual(1);
    });

    it('shouldn\'t run another process of drawing if the animation is in progress', function (done) {
      var callCount = 0;

      myVivus = new Vivus(svgTag, {
        type: 'oneByOne',
        duration: 2,
        start: 'manual'
      }, function () {
        expect(callCount).toEqual(4);
        done();
      });

      spyOn(myVivus, 'trace').and.callFake(function() {
        callCount++;
      });

      myVivus.play(0.5);
      myVivus.play(0.5);
      myVivus.play(0.5);
      myVivus.play(0.5);
      myVivus.play(0.5);
    });

    it('should stop the animation only when the animation is running', function () {
      myVivus.play();
      expect(myVivus.handle).toBeDefined();
      myVivus.stop();
      expect(myVivus.handle).not.toBeDefined();
      myVivus.stop();
      expect(myVivus.handle).not.toBeDefined();
    });

    it('should remove all unecessary styling on every path element', function () {
      var i, paths;
      myVivus.destroy();

      paths = svgTag.querySelectorAll('path');
      for (i = 0; i < paths.length; i++) {
        expect(!!paths[i].style.strokeDashoffset).toEqual(false);
        expect(!!paths[i].style.strokeDasharray).toEqual(false);
      }
    });


    /**
     * Where are the tests about `util` methods?
     * Well....
     * to be honest, I've been struggling a bit for these kind of tests
     * which seems difficult to test from Karma.
     */
  });


});
