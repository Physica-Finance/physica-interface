"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = ICUMessageFormat;

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { (0, _defineProperty2.default)(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

var metaOptions = ["id", "comment", "props"];
var escapedMetaOptionsRe = new RegExp("^_(".concat(metaOptions.join("|"), ")$"));

function ICUMessageFormat() {}

ICUMessageFormat.prototype.fromTokens = function (tokens) {
  var _this = this;

  return (Array.isArray(tokens) ? tokens : [tokens]).map(function (token) {
    return _this.processToken(token);
  }).filter(Boolean).reduce(function (props, message) {
    return _objectSpread(_objectSpread({}, message), {}, {
      message: props.message + message.message,
      values: _objectSpread(_objectSpread({}, props.values), message.values),
      jsxElements: _objectSpread(_objectSpread({}, props.jsxElements), message.jsxElements)
    });
  }, {
    message: "",
    values: {},
    jsxElements: {}
  });
};

ICUMessageFormat.prototype.processToken = function (token) {
  var _this2 = this;

  var jsxElements = {};

  if (token.type === "text") {
    return {
      message: token.value
    };
  } else if (token.type === "arg") {
    if (token.value !== undefined && token.value.type === 'JSXEmptyExpression') {
      return null;
    }

    var values = token.value !== undefined ? (0, _defineProperty2.default)({}, token.name, token.value) : {};

    switch (token.format) {
      case "plural":
      case "select":
      case "selectordinal":
        var formatOptions = Object.keys(token.options).filter(function (key) {
          return token.options[key] != null;
        }).map(function (key) {
          var value = token.options[key];
          key = key.replace(escapedMetaOptionsRe, "$1");

          if (key === "offset") {
            // offset has special syntax `offset:number`
            return "offset:".concat(value);
          }

          if (typeof value !== "string") {
            // process tokens from nested formatters
            var _this2$fromTokens = _this2.fromTokens(value),
                message = _this2$fromTokens.message,
                childValues = _this2$fromTokens.values,
                childJsxElements = _this2$fromTokens.jsxElements;

            Object.assign(values, childValues);
            Object.assign(jsxElements, childJsxElements);
            value = message;
          }

          return "".concat(key, " {").concat(value, "}");
        }).join(" ");
        return {
          message: "{".concat(token.name, ", ").concat(token.format, ", ").concat(formatOptions, "}"),
          values: values,
          jsxElements: jsxElements
        };

      default:
        return {
          message: "{".concat(token.name, "}"),
          values: values
        };
    }
  } else if (token.type === "element") {
    var message = "";
    var elementValues = {};
    Object.assign(jsxElements, (0, _defineProperty2.default)({}, token.name, token.value));
    token.children.forEach(function (child) {
      var _this2$fromTokens2 = _this2.fromTokens(child),
          childMessage = _this2$fromTokens2.message,
          childValues = _this2$fromTokens2.values,
          childJsxElements = _this2$fromTokens2.jsxElements;

      message += childMessage;
      Object.assign(elementValues, childValues);
      Object.assign(jsxElements, childJsxElements);
    });
    return {
      message: token.children.length ? "<".concat(token.name, ">").concat(message, "</").concat(token.name, ">") : "<".concat(token.name, "/>"),
      values: elementValues,
      jsxElements: jsxElements
    };
  }

  throw new Error("Unknown token type ".concat(token.type));
};