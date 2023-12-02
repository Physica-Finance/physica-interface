"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = _default;

var _ramda = _interopRequireDefault(require("ramda"));

var _pseudolocale = _interopRequireDefault(require("pseudolocale"));

var delimiter = "%&&&%";
_pseudolocale.default.option.delimiter = delimiter; // We do not want prepending and appending because of Plurals structure

_pseudolocale.default.option.prepend = "";
_pseudolocale.default.option.append = "";
/**
 * Regex should match HTML tags
 * It was taken from https://haacked.com/archive/2004/10/25/usingregularexpressionstomatchhtml.aspx/
 * Example: https://regex101.com/r/bDHD9z/3
 */

var HTMLRegex = /<\/?\w+((\s+\w+(\s*=\s*(?:".*?"|'.*?'|[^'">\s]+))?)+\s*|\s*)\/?>/g;
/**
 * Regex should match js-lingui Plurals, Select and SelectOrdinal  components
 * Example:
 * Plurals https://regex101.com/r/VUJXg0/1
 * SelectOrdinal https://regex101.com/r/T7hSLU/2
 * Select https://regex101.com/r/9JnqB9/1
 */

var MacroRegex = /({\w*,\s*(plural|selectordinal|select),(.|\n)*?{)|(}\s*\w*\s*{)/gi;
/**
 * Regex should match js-lingui variables
 * Example: https://regex101.com/r/dw1QHb/2
 */

var VariableRegex = /({\s*[a-zA-Z_$][a-zA-Z_$0-9]*\s*})/g;

function addDelimitersHTMLTags(message) {
  return message.replace(HTMLRegex, function (matchedString) {
    return "".concat(delimiter).concat(matchedString).concat(delimiter);
  });
}

function addDelimitersMacro(message) {
  return message.replace(MacroRegex, function (matchedString) {
    return "".concat(delimiter).concat(matchedString).concat(delimiter);
  });
}

function addDelimitersVariables(message) {
  return message.replace(VariableRegex, function (matchedString) {
    return "".concat(delimiter).concat(matchedString).concat(delimiter);
  });
}

var addDelimiters = _ramda.default.compose(addDelimitersVariables, addDelimitersMacro, addDelimitersHTMLTags);

function removeDelimiters(message) {
  return message.replace(new RegExp(delimiter, "g"), "");
}

function _default(message) {
  message = addDelimiters(message);
  message = _pseudolocale.default.str(message);
  return removeDelimiters(message);
}