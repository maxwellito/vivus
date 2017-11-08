'use strict';

/**
 * Unit tests for Pathformer
 *
 */
describe('Pathformer', function () {

  var svgTag,
    svgTagId = 'my-svg',
    svgGroupTag,
    svgGroupTagId = 'my-svg-group';

  beforeEach(function () {
    // Remove tag if existing
    svgTag = document.getElementById(svgTagId);
    if (svgTag) {
      svgTag.remove();
    }

    // Create the SVG
    svgTag = document.createElementNS('http://www.w3.org/2000/svg','svg');
    svgTag.id = svgTagId;
    svgTag.innerHTML = '<circle fill="none" stroke="#f9f9f9" stroke-width="3" stroke-miterlimit="10" cx="100" cy="100" r="72.947"/>' +
      '<circle fill="none" stroke="#f9f9f9" stroke-width="3" stroke-miterlimit="10" cx="100" cy="100" r="39.74"/>' +
      '<g id="' + svgGroupTagId + '">' +
      '<line fill="none" stroke="#f9f9f9" stroke-width="3" stroke-miterlimit="10" x1="34.042" y1="131.189" x2="67.047" y2="77.781"/>' +
      '<line fill="none" stroke="#f9f9f9" stroke-width="3" stroke-miterlimit="10" x1="165.957" y1="68.809" x2="132.953" y2="122.219"/>' +
      '<line fill="none" stroke="#f9f9f9" stroke-width="3" stroke-miterlimit="10" x1="131.19" y1="165.957" x2="77.781" y2="132.953"/>' +
      '<line fill="none" stroke="#f9f9f9" stroke-width="3" stroke-miterlimit="10" x1="68.81" y1="34.042" x2="122.219" y2="67.046"/>' +
      '</g>';

    svgGroupTag = svgTag.querySelector('#'+svgGroupTagId);

    // Insert it to the body
    document.body.appendChild(svgTag);
  });

  describe('[param tests]', function () {

    // Tests about the SVG element
    it('should throw an error if the SVG is given in parameter', function () {
      expect(function () {
        new Pathformer();
      }).toThrow(new Error('Pathformer [constructor]: "element" parameter is required'));
    });

    it('should work with only the SVG id', function () {
      expect(function () {
        new Pathformer(svgTagId);
      }).not.toThrow();
    });

    it('should work with only the SVG object', function () {
      expect(function () {
        new Pathformer(svgTag);
      }).not.toThrow();
    });

    it('should work with only the SVG group object', function () {
      expect(function () {
        new Pathformer(svgGroupTag);
      }).not.toThrow();
    });

    it('should throw an error if the SVG ID given is invalid', function () {
      expect(function () {
        new Pathformer('my-unexisting-svg');
      }).toThrow(new Error('Pathformer [constructor]: "element" parameter is not related to an existing ID'));
    });

    it('should throw an error if the ID given is not related to a SVG element', function () {
      var divTag = document.createElement('div');
      divTag.id = 'my-div';
      document.body.appendChild(divTag);
      expect(function () {
        new Pathformer('my-div');
      }).toThrow(new Error('Pathformer [constructor]: "element" parameter must be a string or a SVGelement'));
    });

    it('should throw an error if the element is not a correct type (DOM object or string)', function () {
      expect(function () { new Pathformer({}); }).toThrow(new Error('Pathformer [constructor]: "element" parameter must be a string or a SVGelement'));
      expect(function () { new Pathformer(42); }).toThrow(new Error('Pathformer [constructor]: "element" parameter must be a string or a SVGelement'));
      expect(function () { new Pathformer(false); }).toThrow(new Error('Pathformer [constructor]: "element" parameter must be a string or a SVGelement'));
      expect(function () { new Pathformer(new Date()); }).toThrow(new Error('Pathformer [constructor]: "element" parameter must be a string or a SVGelement'));
      expect(function () { new Pathformer(function () {}); }).toThrow(new Error('Pathformer [constructor]: "element" parameter must be a string or a SVGelement'));
      expect(function () { new Pathformer(document.createElement('div')); }).toThrow(new Error('Pathformer [constructor]: "element" parameter must be a string or a SVGelement'));
    });
  });

  describe('[translation]', function () {

    // Line object
    describe('line', function () {
      it('should return an object with a `d` attribute', function () {
        var output = Pathformer.prototype.lineToPath({});
        expect(output.d).toBeDefined();
      });

      it('should return an object with an unclosed shape', function () {
        var output = Pathformer.prototype.lineToPath({});
        expect(output.d.substr(-1)).not.toEqual('Z');
      });

      it('should set default positino attributes to zero', function () {
        var output = Pathformer.prototype.lineToPath({
          x1: '21', x2: '32', y1: '11'
        });
        expect(output.d.indexOf('0')).not.toEqual(-1);
        expect(output.d.indexOf('undefined')).toEqual(-1);
      });
    });

    // Rect object
    describe('rect', function () {
      it('should return an object with a `d` attribute', function () {
        var output = Pathformer.prototype.rectToPath({});
        expect(output.d).toBeDefined();
      });

      it('should return an object with a closed shape', function () {
        var output = Pathformer.prototype.rectToPath({});
        expect(output.d.substr(-1)).toEqual('Z');
      });

      it('should set default positino attributes to zero', function () {
        var output = Pathformer.prototype.rectToPath({
          x: '21', height: '32', width: '11'
        });
        expect(output.d.indexOf('0')).not.toEqual(-1);
        expect(output.d.indexOf('undefined')).toEqual(-1);
      });

      it('should apply rounded corners', function () {
        var result = 'M 50,10 ' +
          'L 50,10 A 40,20,0,0,1,90,30 ' +
          'L 90,50 A 40,20,0,0,1,50,70 ' +
          'L 50,70 A 40,20,0,0,1,10,50 ' +
          'L 10,30 A 40,20,0,0,1,50,10';

        var output = Pathformer.prototype.rectToPath({
          x:10, y:10, width:80, height:60, rx:100, ry:20
        });

        expect(output.d).toEqual(result);
      });

      it('should apply rounded corners even when a value is missing', function () {
        var result = 'M 30,10 ' +
          'L 70,10 A 20,20,0,0,1,90,30 ' +
          'L 90,50 A 20,20,0,0,1,70,70 ' +
          'L 30,70 A 20,20,0,0,1,10,50 ' +
          'L 10,30 A 20,20,0,0,1,30,10';

        var output = Pathformer.prototype.rectToPath({
          x:10, y:10, width:80, height:60,  ry:20
        });

        expect(output.d).toEqual(result);
      });
    });

    // Polyline object
    describe('polyline', function () {
      var polyline;
      beforeEach(function () {
        polyline = {
          points: '2,3 4,5 6,7'
        };
      });

      it('should return an object with a `d` attribute', function () {
        var output = Pathformer.prototype.polylineToPath(polyline);
        expect(output.d).toBeDefined();
      });

      it('should return an object with an unclosed shape', function () {
        var output = Pathformer.prototype.polylineToPath(polyline);
        expect(output.d.substr(-1)).not.toEqual('Z');
      });

      it('should ignore incorrect points', function () {
        var output;
        polyline.points += ' 43';
        output = Pathformer.prototype.polylineToPath(polyline);
        expect(output.d.indexOf('43')).toEqual(-1);
      });

      it('should accept points defined with and without commas', function () {
        var outputWithPoint = Pathformer.prototype.polylineToPath(polyline);
        var outputWithoutPoint = Pathformer.prototype.polylineToPath({points: '2 3 4 5 6 7'});
        expect(outputWithPoint).toEqual(outputWithoutPoint);
      });
    });

    // Polygon object
    describe('polygon', function () {
      var polygon;
      beforeEach(function () {
        polygon = {
          points: '2,3 4,5 6,7'
        };
      });

      it('should return an object with a `d` attribute', function () {
        var output = Pathformer.prototype.polygonToPath(polygon);
        expect(output.d).toBeDefined();
      });

      it('should return an object with a closed shape', function () {
        var output = Pathformer.prototype.polygonToPath(polygon);
        expect(output.d.substr(-1)).toEqual('Z');
      });
    });

    // Ellipse object
    describe('ellipse', function () {

      var ellipse;
      beforeEach(function () {
        ellipse = {
          cx: 2,
          cy: 3,
          rx: 3
        };
      });

      it('should return an object with a `d` attribute', function () {
        var output = Pathformer.prototype.ellipseToPath(ellipse);
        expect(output.d).toBeDefined();
      });

      it('should return an object with an unclosed shape', function () {
        var output = Pathformer.prototype.ellipseToPath(ellipse);
        expect(output.d.substr(-1)).not.toEqual('Z');
      });

      it('should set default positino attributes to zero', function () {
        delete ellipse.cy;
        var output = Pathformer.prototype.ellipseToPath(ellipse);
        expect(output.d.indexOf('0')).not.toEqual(-1);
        expect(output.d.indexOf('undefined')).toEqual(-1);
      });
    });

    // Circle object
    describe('circle', function () {

      var circle;
      beforeEach(function () {
        circle = {
          cx: 2,
          cy: 3,
          rx: 3,
          r: 1
        };
      });

      it('should return an object with a `d` attribute', function () {
        var output = Pathformer.prototype.circleToPath(circle);
        expect(output.d).toBeDefined();
      });

      it('should return an object with an unclosed shape', function () {
        var output = Pathformer.prototype.circleToPath(circle);
        expect(output.d.substr(-1)).not.toEqual('Z');
      });

      it('should set default positino attributes to zero', function () {
        delete circle.cy;
        var output = Pathformer.prototype.circleToPath(circle);
        expect(output.d.indexOf('0')).not.toEqual(-1);
        expect(output.d.indexOf('undefined')).toEqual(-1);
      });
    });
  });

  describe('[utils]', function () {

    describe('attribute parser', function () {
      it('should return an empty object if attributes length are undefined', function () {
        var output = Pathformer.prototype.parseAttr({});
        expect(output).toEqual({});
      });
    });

    describe('engine', function () {
      it('shouldn\'t throw an error if the SVG got a tag not taken in charge', function () {
        svgTag.innerHTML = '<polypentagoneofhell fill="none" stroke="#666666" stroke-width="6" stroke-miterlimit="666" cx="666" cy="666"/>';

        expect(function () {
          new Pathformer(svgTagId);
        }).not.toThrow();
      });

      it('should remove useless attributes during transformation', function () {
        new Pathformer(svgTagId);
        expect(svgTag.childNodes[0].getAttribute('cx')).toBe(null);
      });
    });

    describe('validity', function () {
      it('should throw error if the SVG contain shape with percentage value', function () {
        // Create the SVG
        var svgTagPrc = document.createElementNS('http://www.w3.org/2000/svg','svg');
        svgTagPrc.innerHTML = '<circle cx="100%" cy="100" r="10"/>';
        expect(function () {
          new Pathformer(svgTagPrc);
        }).toThrow(new Error('Pathformer [parseAttr]: a SVG shape got values in percentage. This cannot be transformed into \'path\' tags. Please use \'viewBox\'.'));
      });

      it('shouldn\'t throw error if the SVG contain shape with percentage value on a non-data attribute', function () {
        // Create the SVG
        var svgTagPrc = document.createElementNS('http://www.w3.org/2000/svg','svg');
        svgTagPrc.innerHTML = '<circle width="100%" cx="100" cy="100" r="10"/>';
        expect(function () {
          new Pathformer(svgTagPrc);
        }).not.toThrow();
      });
    });
  });
});
