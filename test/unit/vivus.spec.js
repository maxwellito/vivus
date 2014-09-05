/**
 * Unit tests for Vivus
 *
 */
describe('Vivus', function () {

  var myVivus,
    svgTag,
    svgTagId = 'my-svg';

  beforeEach(function () {
    // Remove tag if existing
    svgTag = document.getElementById(svgTagId);
    if (svgTag) {
      svgTag.remove();
    }

    // Create the SVG
    svgTag = document.createElementNS('http://www.w3.org/2000/svg','svg');
    svgTag.id = 'my-svg';
    svgTag.innerHTML = '<circle fill="none" stroke="#f9f9f9" stroke-width="3" stroke-miterlimit="10" cx="100" cy="100" r="72.947"/>' +
      '<circle fill="none" stroke="#f9f9f9" stroke-width="3" stroke-miterlimit="10" cx="100" cy="100" r="39.74"/>' +
      '<line fill="none" stroke="#f9f9f9" stroke-width="3" stroke-miterlimit="10" x1="34.042" y1="131.189" x2="67.047" y2="77.781"/>' +
      '<line fill="none" stroke="#f9f9f9" stroke-width="3" stroke-miterlimit="10" x1="165.957" y1="68.809" x2="132.953" y2="122.219"/>' +
      '<line fill="none" stroke="#f9f9f9" stroke-width="3" stroke-miterlimit="10" x1="131.19" y1="165.957" x2="77.781" y2="132.953"/>' +
      '<line fill="none" stroke="#f9f9f9" stroke-width="3" stroke-miterlimit="10" x1="68.81" y1="34.042" x2="122.219" y2="67.046"/>';

    // Insert it to the body
    document.body.appendChild(svgTag);
  });

  describe('[basic tests]', function () {

    it('should the class be defined under Vivus name', function () {
      expect(Vivus).toBeDefined();
    });
  });

  describe('[param tests]', function () {

    // Tests about the SVG element
    it('should throw an error if the SVG is given in parameter', function () {
      expect(function () {
        new Vivus();
      }).toThrow(new Error('Vivus [contructor]: "element" parameter is required'));
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
      }).toThrow(new Error('Vivus [contructor]: "element" parameter is not related to an existing ID'));
    });

    it('should throw an error if the ID given is not related to a SVG element', function () {
      var divTag = document.createElementNS('http://www.w3.org/2000/div','div');
      divTag.id = 'my-div';
      document.body.appendChild(divTag);
      expect(function () {
        new Vivus('my-div');
      }).toThrow(new Error('Vivus [contructor]: "element" parameter must be a string or a SVGelement'));
    });

    it('should throw an error if the element is not a correct type (DOM object or string)', function () {
      expect(function () { new Vivus({}); }).toThrow(new Error('Vivus [contructor]: "element" parameter must be a string or a SVGelement'));
      expect(function () { new Vivus(42); }).toThrow(new Error('Vivus [contructor]: "element" parameter must be a string or a SVGelement'));
      expect(function () { new Vivus(false); }).toThrow(new Error('Vivus [contructor]: "element" parameter must be a string or a SVGelement'));
      expect(function () { new Vivus(new Date()); }).toThrow(new Error('Vivus [contructor]: "element" parameter must be a string or a SVGelement'));
      expect(function () { new Vivus(function () {}); }).toThrow(new Error('Vivus [contructor]: "element" parameter must be a string or a SVGelement'));
      expect(function () { new Vivus(document.createElementNS('http://www.w3.org/2000/svg','div')); }).toThrow(new Error('Vivus [contructor]: "element" parameter must be a string or a SVGelement'));
    });

    // Options
    it('should work without options', function () {
      expect(function () {
        new Vivus(svgTag);
      }).not.toThrow();
    });

    it('should throw an error if options is not an object', function () {
      expect(function () { new Vivus(svgTag, []); }).toThrow(new Error('Vivus [contructor]: "options" parameter must be an object'));
      expect(function () { new Vivus(svgTag, 42); }).toThrow(new Error('Vivus [contructor]: "options" parameter must be an object'));
      expect(function () { new Vivus(svgTag, false); }).toThrow(new Error('Vivus [contructor]: "options" parameter must be an object'));
      expect(function () { new Vivus(svgTag, new Date()); }).toThrow(new Error('Vivus [contructor]: "options" parameter must be an object'));
      expect(function () { new Vivus(svgTag, 'manual'); }).toThrow(new Error('Vivus [contructor]: "options" parameter must be an object'));
      expect(function () { new Vivus(svgTag, function () {}); }).toThrow(new Error('Vivus [contructor]: "options" parameter must be an object'));
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
      }).toThrow(new Error('Vivus [contructor]: by-unicorn is not an existing animation `type`'));
    });

    it('should throw an error if the `start` value given in options is not a string', function () {
      expect(function () {
        new Vivus(svgTag, {start: 'when-unicorn-ready'});
      }).toThrow(new Error('Vivus [contructor]: when-unicorn-ready is not an existing `start` option'));
    });

    it('should throw an error if the `delay` value is bigger (or equal) than `duration`', function () {
      expect(function () {
        new Vivus(svgTag, {duration: 200, delay: 199});
      }).not.toThrow();
      expect(function () {
        new Vivus(svgTag, {duration: 200, delay: 200});
      }).toThrow(new Error('Vivus [contructor]: delai must be shorter than duration'));
      expect(function () {
        new Vivus(svgTag, {duration: 200, delay: 201});
      }).toThrow(new Error('Vivus [contructor]: delai must be shorter than duration'));
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
      }).toThrow(new Error('Vivus [contructor]: "callback" parameter must be a function'));
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


    /**
     * Where are the tests about `util` methods?
     * Well....
     * to be honest, I've been struggling a bit for these kind of tests
     * which seems difficult to test from Karma.
     */
  });


});
