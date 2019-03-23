var fs = require('fs');
var pkg = require('../package.json');
var vivus = fs.readFileSync('src/vivus.js', { encoding: 'utf8' });
var pathformer = fs.readFileSync('src/pathformer.js', { encoding: 'utf8' });

var output = `/**
 * ${pkg.name} - ${pkg.description}
 * @version v${pkg.version}
 * @link ${pkg.homepage}
 * @license ${pkg.license}
 */

(function () {

  ${pathformer}
  ${vivus}

  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define([], function() {
      return Vivus;
    });
  } else if (typeof exports === 'object') {
    // Node. Does not work with strict CommonJS, but
    // only CommonJS-like environments that support module.exports,
    // like Node.
    module.exports = Vivus;
  } else {
    // Browser globals
    window.Vivus = Vivus;
  }

}());
`;

console.log(output);
