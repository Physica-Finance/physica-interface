"use strict";

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.zip = zip;
exports.makeCounter = void 0;

var R = _interopRequireWildcard(require("ramda"));

/**
 * Custom zip method which takes length of the larger array
 * (usually zip functions use the `smaller` length, discarding values in larger array)
 */
function zip(a, b) {
  return R.range(0, Math.max(a.length, b.length)).map(function (index) {
    return [a[index], b[index]];
  });
}

var makeCounter = function makeCounter() {
  var index = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;
  return function () {
    return index++;
  };
};

exports.makeCounter = makeCounter;