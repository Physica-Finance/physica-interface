'use strict';

if (process.env.NODE_ENV === "production") {
  module.exports = require("./vanilla-extract-css-utils.cjs.prod.js");
} else {
  module.exports = require("./vanilla-extract-css-utils.cjs.dev.js");
}
