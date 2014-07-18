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

  describe('Basic tests', function () {

    it('should the class be defined under Vivus name', function () {
      expect(Vivus).toBeDefined();
    });
  });

  describe('Param tests', function () {

    // Tests about the SVG element
    it('should throw an error if the SVG is given in parameter', function () {
      expect(function () {
        new Vivus();
      }).toThrow('Vivus [contructor]: "element" parameter is required');
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
      }).toThrow('Vivus [contructor]: "element" parameter is not related to an existing ID');
    });

    it('should throw an error if the ID given is not related to a SVG element', function () {
      var divTag = document.createElementNS('http://www.w3.org/2000/div','div');
      divTag.id = 'my-div';
      document.body.appendChild(divTag);
      expect(function () {
        new Vivus('my-div');
      }).toThrow('Vivus [contructor]: "element" parameter must be a string or a SVGelement');
    });

    it('should throw an error if the element is not a correct type (DOM object or string)', function () {
      expect(function () { new Vivus({}); }).toThrow('Vivus [contructor]: "element" parameter must be a string or a SVGelement');
      expect(function () { new Vivus(42); }).toThrow('Vivus [contructor]: "element" parameter must be a string or a SVGelement');
      expect(function () { new Vivus(false); }).toThrow('Vivus [contructor]: "element" parameter must be a string or a SVGelement');
      expect(function () { new Vivus(new Date()); }).toThrow('Vivus [contructor]: "element" parameter must be a string or a SVGelement');
      expect(function () { new Vivus(function () {}); }).toThrow('Vivus [contructor]: "element" parameter must be a string or a SVGelement');
      expect(function () { new Vivus(document.createElementNS('http://www.w3.org/2000/svg','div')); }).toThrow('Vivus [contructor]: "element" parameter must be a string or a SVGelement');
    });

    // Options
    it('should work without options', function () {
      expect(function () {
        new Vivus(svgTag);
      }).not.toThrow();
    });

    it('should throw an error if options is not an object', function () {
      expect(function () { new Vivus(svgTag, []); }).toThrow('Vivus [contructor]: "options" parameter must be an object');
      expect(function () { new Vivus(svgTag, 42); }).toThrow('Vivus [contructor]: "options" parameter must be an object');
      expect(function () { new Vivus(svgTag, false); }).toThrow('Vivus [contructor]: "options" parameter must be an object');
      expect(function () { new Vivus(svgTag, new Date()); }).toThrow('Vivus [contructor]: "options" parameter must be an object');
      expect(function () { new Vivus(svgTag, 'manual'); }).toThrow('Vivus [contructor]: "options" parameter must be an object');
      expect(function () { new Vivus(svgTag, function () {}); }).toThrow('Vivus [contructor]: "options" parameter must be an object');
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
      }).toThrow('Vivus [contructor]: by-unicorn is not an existing animation `type`');
    });

    it('should throw an error if the `start` value given in options is not a string', function () {
      expect(function () {
        new Vivus(svgTag, {start: 'when-unicorn-ready'});
      }).toThrow('Vivus [contructor]: when-unicorn-ready is not an existing `start` option');
    });

    it('should throw an error if the `delay` value is bigger (or equal) than `duration`', function () {
      expect(function () {
        new Vivus(svgTag, {duration: 200, delay: 199});
      }).not.toThrow();
      expect(function () {
        new Vivus(svgTag, {duration: 200, delay: 200});
      }).toThrow('Vivus [contructor]: delai must be shorter than duration');
      expect(function () {
        new Vivus(svgTag, {duration: 200, delay: 201});
      }).toThrow('Vivus [contructor]: delai must be shorter than duration');
    });

    it('should override `duration` if invalid', function () {
      myVivus = new Vivus(svgTag, {duration: -12});
      expect(myVivus.duration > 0).toBe(true);
    });

    it('should override `delay` if invalid', function () {
      myVivus = new Vivus(svgTag, {delay: -12});
      expect(!myVivus.delay).toBe(true);
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
      }).toThrow('Vivus [contructor]: "callback" parameter must be a function');
    });
  });



});
