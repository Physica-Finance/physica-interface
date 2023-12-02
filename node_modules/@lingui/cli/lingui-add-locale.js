"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _chalk = _interopRequireDefault(require("chalk"));

if (require.main === module) {
  var msg = "lingui add-locale command is deprecated. " + "Please set ".concat(_chalk.default.yellow("'locales'"), " in configuration. ") + _chalk.default.underline("https://lingui.js.org/ref/conf.html#locales");

  console.error(msg);
}