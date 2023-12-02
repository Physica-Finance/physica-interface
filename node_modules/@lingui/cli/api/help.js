"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.helpRun = helpRun;

var _slicedToArray2 = _interopRequireDefault(require("@babel/runtime/helpers/slicedToArray"));

var _path = require("path");

/**
 * Detect where's is the command lingui extract or lingui compile
 * and how is being run (npm, yarn) and construct help
 * for follow-up commands based on that.
 *
 * Example:
 * $ yarn extract
 * ...
 * (use "yarn compile" to compile catalogs for production)
 *
 * $ yarn lingui extract
 * ...
 * (use "yarn lingui compile" to compile catalogs for production)
 *
 * $ npm run extract
 * ...
 * (use "npm run compile" to compile catalogs for production)
 */
function helpRun(command) {
  var _findRootPkgJson;

  var findRootPkgJson;

  try {
    findRootPkgJson = require((0, _path.resolve)((0, _path.join)(process.cwd(), "package.json")));
  } catch (error) {}

  if ((_findRootPkgJson = findRootPkgJson) === null || _findRootPkgJson === void 0 ? void 0 : _findRootPkgJson.scripts) {
    var res = Object.entries(findRootPkgJson.scripts).find(function (_ref) {
      var _ref2 = (0, _slicedToArray2.default)(_ref, 2),
          _ = _ref2[0],
          value = _ref2[1];

      return value.includes("lingui ".concat(command));
    });

    if (res) {
      command = res[0];
    }
  }

  return "".concat(runCommand, " ").concat(command);
}

var isYarn = process.env.npm_config_user_agent && process.env.npm_config_user_agent.includes("yarn");
var runCommand = isYarn ? "yarn" : "npm run";