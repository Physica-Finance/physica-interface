"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.isValid = isValid;
exports.parse = parse;

var plurals = _interopRequireWildcard(require("make-plural/plurals"));

var _bcp = _interopRequireDefault(require("bcp-47"));

/**
 * Check that locale is valid according to BCP47 and we have plurals for it
 * @param locale: string - Locale in BCP47 format
 * @return {boolean}
 */
function isValid(locale) {
  var localeData = parse(locale);
  return localeData !== null && localeData !== undefined && localeData.language in plurals;
}
/**
 * Parse locale in BCP47 format and
 * @param locale - Locale in BCP47 format
 * @return {LocaleInfo}
 */


function parse(locale) {
  if (typeof locale !== "string") return null;

  var schema = _bcp.default.parse(locale.replace("_", "-"));

  if (!schema.language) return null;
  return {
    locale: _bcp.default.stringify(schema),
    language: schema.language
  };
}