"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getStats = getStats;
exports.printStats = printStats;

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _slicedToArray2 = _interopRequireDefault(require("@babel/runtime/helpers/slicedToArray"));

var _cliTable = _interopRequireDefault(require("cli-table"));

var _chalk = _interopRequireDefault(require("chalk"));

function getStats(catalog) {
  return [Object.keys(catalog).length, Object.keys(catalog).filter(function (key) {
    return !catalog[key].translation;
  }).length];
}

function printStats(config, catalogs) {
  var table = new _cliTable.default({
    head: ["Language", "Total count", "Missing"],
    colAligns: ["left", "middle", "middle"],
    style: {
      head: ["green"],
      border: [],
      compact: true
    }
  });
  Object.keys(catalogs).forEach(function (locale) {
    var catalog = catalogs[locale]; // catalog is null if no catalog exists on disk and the locale
    // was not extracted due to a `--locale` filter

    var _ref = catalog ? getStats(catalog) : ["-", "-"],
        _ref2 = (0, _slicedToArray2.default)(_ref, 2),
        all = _ref2[0],
        translated = _ref2[1];

    if (config.sourceLocale === locale) {
      table.push((0, _defineProperty2.default)({}, "".concat(_chalk.default.bold(locale), " (source)"), [all, "-"]));
    } else {
      table.push((0, _defineProperty2.default)({}, locale, [all, translated]));
    }
  });
  return table;
}