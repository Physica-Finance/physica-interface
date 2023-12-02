"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.removeDirectory = removeDirectory;
exports.prettyOrigin = prettyOrigin;
exports.helpMisspelledCommand = helpMisspelledCommand;
exports.writeFileIfChanged = writeFileIfChanged;
exports.hasYarn = hasYarn;
exports.makeInstall = makeInstall;
exports.joinOrigin = exports.splitOrigin = void 0;

var _fs = _interopRequireDefault(require("fs"));

var _path = _interopRequireDefault(require("path"));

var _chalk = _interopRequireDefault(require("chalk"));

var _fuzzaldrin = require("fuzzaldrin");

function removeDirectory(dir) {
  var onlyContent = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
  if (!_fs.default.existsSync(dir)) return;

  var list = _fs.default.readdirSync(dir);

  for (var i = 0; i < list.length; i++) {
    var filename = _path.default.join(dir, list[i]);

    var stat = _fs.default.statSync(filename);

    if (filename === "." || filename === "..") {// pass these files
    } else if (stat.isDirectory()) {
      // rmdir recursively
      removeDirectory(filename);
    } else {
      _fs.default.unlinkSync(filename);
    }
  }

  if (!onlyContent) {
    _fs.default.rmdirSync(dir);
  }
}

function prettyOrigin(origins) {
  try {
    return origins.map(function (origin) {
      return origin.join(":");
    }).join(", ");
  } catch (e) {
    return "";
  }
}
/**
 * .. js:function:: helpMisspelledCommand(command [, availableCommands = []])
 *    :param: command - command passed to CLI
 *    :param: availableCommands - all commands defined in commander.js
 *
 *    If unknown commands is passed to CLI, check it agains all available commands
 *    for possible misspelled letter. Output help with suggestions to console.
 */


function helpMisspelledCommand(command) {
  var availableCommands = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [];
  var commandNames = availableCommands.map(function (command) {
    return command.name();
  }); // if no command is supplied, then commander.js shows help automatically

  if (!command || commandNames.includes(command)) {
    return;
  }

  var suggestions = commandNames.map(function (name) {
    return {
      name: name,
      score: (0, _fuzzaldrin.score)(name, command.slice(0, name.length))
    };
  }).filter(function (nameScore) {
    return nameScore.score > 0;
  }).slice(0, 3).map(function (commandScore) {
    return _chalk.default.inverse(commandScore.name);
  }).join(", ");
  console.log("lingui: command ".concat(command, " is not a lingui command. ") + "See 'lingui --help' for the list of available commands.");

  if (suggestions) {
    console.log();
    console.log("Did you mean: ".concat(suggestions, "?"));
  }
}

var splitOrigin = function splitOrigin(origin) {
  return origin.split(":");
};

exports.splitOrigin = splitOrigin;

var joinOrigin = function joinOrigin(origin) {
  return origin.join(":");
};

exports.joinOrigin = joinOrigin;

function writeFileIfChanged(filename, newContent) {
  if (_fs.default.existsSync(filename)) {
    var raw = _fs.default.readFileSync(filename).toString();

    if (newContent !== raw) {
      _fs.default.writeFileSync(filename, newContent);
    }
  } else {
    _fs.default.writeFileSync(filename, newContent);
  }
}

function hasYarn() {
  return _fs.default.existsSync(_path.default.resolve("yarn.lock"));
}

function makeInstall() {
  var withYarn = hasYarn();
  return function (packageName) {
    var dev = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
    return withYarn ? "yarn add ".concat(dev ? "--dev " : "").concat(packageName) : "npm install ".concat(dev ? "--save-dev" : "--save", " ").concat(packageName);
  };
}