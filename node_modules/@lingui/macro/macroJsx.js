"use strict";

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard");

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _toConsumableArray2 = _interopRequireDefault(require("@babel/runtime/helpers/toConsumableArray"));

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var R = _interopRequireWildcard(require("ramda"));

var _icu = _interopRequireDefault(require("./icu"));

var _utils = require("./utils");

var _constants = require("./constants");

function _createForOfIteratorHelper(o, allowArrayLike) { var it; if (typeof Symbol === "undefined" || o[Symbol.iterator] == null) { if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e) { throw _e; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = o[Symbol.iterator](); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e2) { didErr = true; err = _e2; }, f: function f() { try { if (!normalCompletion && it.return != null) it.return(); } finally { if (didErr) throw err; } } }; }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

var pluralRuleRe = /(_[\d\w]+|zero|one|two|few|many|other)/;

var jsx2icuExactChoice = function jsx2icuExactChoice(value) {
  return value.replace(/_(\d+)/, "=$1").replace(/_(\w+)/, "$1");
}; // replace whitespace before/after newline with single space


var keepSpaceRe = /\s*(?:\r\n|\r|\n)+\s*/g; // remove whitespace before/after tag or expression

var stripAroundTagsRe = /(?:([>}])(?:\r\n|\r|\n)+\s*|(?:\r\n|\r|\n)+\s*(?=[<{]))/g;

function maybeNodeValue(node) {
  if (!node) return null;
  if (node.type === "StringLiteral") return node.value;
  if (node.type === "JSXAttribute") return maybeNodeValue(node.value);
  if (node.type === "JSXExpressionContainer") return maybeNodeValue(node.expression);
  if (node.type === "TemplateLiteral" && node.expressions.length === 0) return node.quasis[0].value.raw;
  return null;
}

function normalizeWhitespace(text) {
  return text.replace(stripAroundTagsRe, "$1").replace(keepSpaceRe, " ") // keep escaped newlines
  .replace(/\\n/g, "\n").replace(/\\s/g, " ") // we remove trailing whitespace inside Plural
  .replace(/(\s+})/gm, "}").trim();
}

var MacroJSX = /*#__PURE__*/function () {
  function MacroJSX(_ref) {
    var _this = this;

    var types = _ref.types;
    (0, _classCallCheck2.default)(this, MacroJSX);
    (0, _defineProperty2.default)(this, "types", void 0);
    (0, _defineProperty2.default)(this, "expressionIndex", void 0);
    (0, _defineProperty2.default)(this, "elementIndex", void 0);
    (0, _defineProperty2.default)(this, "safeJsxAttribute", function (name, value) {
      // This handles quoted JSX attributes and html entities.
      return _this.types.jsxAttribute(_this.types.jsxIdentifier(name), _this.types.jsxExpressionContainer(_this.types.stringLiteral(value)));
    });
    (0, _defineProperty2.default)(this, "replacePath", function (path) {
      var tokens = _this.tokenizeNode(path.node);

      var messageFormat = new _icu.default();

      var _messageFormat$fromTo = messageFormat.fromTokens(tokens),
          messageRaw = _messageFormat$fromTo.message,
          values = _messageFormat$fromTo.values,
          jsxElements = _messageFormat$fromTo.jsxElements;

      var message = normalizeWhitespace(messageRaw);

      var _this$stripMacroAttri = _this.stripMacroAttributes(path.node),
          attributes = _this$stripMacroAttri.attributes,
          id = _this$stripMacroAttri.id,
          comment = _this$stripMacroAttri.comment,
          context = _this$stripMacroAttri.context;

      if (!id && !message) {
        return;
      } else if (id && id !== message) {
        // If `id` prop already exists and generated ID is different,
        // add it as a `default` prop
        attributes.push(_this.types.jsxAttribute(_this.types.jsxIdentifier(_constants.ID), _this.types.stringLiteral(id)));

        if (process.env.NODE_ENV !== "production") {
          if (message) {
            attributes.push(_this.safeJsxAttribute(_constants.MESSAGE, message));
          }
        }
      } else {
        attributes.push(_this.safeJsxAttribute(_constants.ID, message));
      }

      if (process.env.NODE_ENV !== "production") {
        if (comment) {
          attributes.push(_this.types.jsxAttribute(_this.types.jsxIdentifier(_constants.COMMENT), _this.types.stringLiteral(comment)));
        }
      }

      if (context) {
        attributes.push(_this.types.jsxAttribute(_this.types.jsxIdentifier(_constants.CONTEXT), _this.types.stringLiteral(context)));
      } // Parameters for variable substitution


      var valuesObject = Object.keys(values).map(function (key) {
        return _this.types.objectProperty(_this.types.identifier(key), values[key]);
      });

      if (valuesObject.length) {
        attributes.push(_this.types.jsxAttribute(_this.types.jsxIdentifier("values"), _this.types.jsxExpressionContainer(_this.types.objectExpression(valuesObject))));
      } // Inline elements


      if (Object.keys(jsxElements).length) {
        attributes.push(_this.types.jsxAttribute(_this.types.jsxIdentifier("components"), _this.types.jsxExpressionContainer(_this.types.objectExpression(Object.keys(jsxElements).map(function (key) {
          return _this.types.objectProperty(_this.types.identifier(key), jsxElements[key]);
        })))));
      }

      var newNode = _this.types.jsxElement(_this.types.jsxOpeningElement(_this.types.jsxIdentifier("Trans"), attributes,
      /*selfClosing*/
      true),
      /*closingElement*/
      null,
      /*children*/
      [],
      /*selfClosing*/
      true);

      newNode.loc = path.node.loc; // @ts-ignore

      path.replaceWith(newNode);
    });
    (0, _defineProperty2.default)(this, "attrName", function (names) {
      var exclude = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
      var namesRe = new RegExp("^(" + names.join("|") + ")$");
      return function (attr) {
        return exclude ? !namesRe.test(attr.name.name) : namesRe.test(attr.name.name);
      };
    });
    (0, _defineProperty2.default)(this, "stripMacroAttributes", function (node) {
      var attributes = node.openingElement.attributes;
      var id = attributes.filter(_this.attrName([_constants.ID]))[0];
      var message = attributes.filter(_this.attrName([_constants.MESSAGE]))[0];
      var comment = attributes.filter(_this.attrName([_constants.COMMENT]))[0];
      var context = attributes.filter(_this.attrName([_constants.CONTEXT]))[0];
      var reserved = [_constants.ID, _constants.MESSAGE, _constants.COMMENT, _constants.CONTEXT];

      if (_this.isI18nComponent(node)) {// no reserved prop names
      } else if (_this.isChoiceComponent(node)) {
        reserved = [].concat((0, _toConsumableArray2.default)(reserved), ["_\\w+", "_\\d+", "zero", "one", "two", "few", "many", "other", "value", "offset"]);
      }

      return {
        id: maybeNodeValue(id),
        message: maybeNodeValue(message),
        comment: maybeNodeValue(comment),
        context: maybeNodeValue(context),
        attributes: attributes.filter(_this.attrName(reserved, true))
      };
    });
    (0, _defineProperty2.default)(this, "tokenizeNode", function (node) {
      if (_this.isI18nComponent(node)) {
        // t
        return _this.tokenizeTrans(node);
      } else if (_this.isChoiceComponent(node)) {
        // plural, select and selectOrdinal
        return _this.tokenizeChoiceComponent(node);
      } else if (_this.types.isJSXElement(node)) {
        return _this.tokenizeElement(node);
      } else {
        return _this.tokenizeExpression(node);
      }
    });
    (0, _defineProperty2.default)(this, "tokenizeTrans", function (node) {
      return R.flatten(node.children.map(function (child) {
        return _this.tokenizeChildren(child);
      }).filter(Boolean));
    });
    (0, _defineProperty2.default)(this, "tokenizeChildren", function (node) {
      if (_this.types.isJSXExpressionContainer(node)) {
        var exp = node.expression;

        if (_this.types.isStringLiteral(exp)) {
          // Escape forced newlines to keep them in message.
          return {
            type: "text",
            value: exp.value.replace(/\n/g, "\\n")
          };
        } else if (_this.types.isTemplateLiteral(exp)) {
          var tokenize = R.pipe( // Don"t output tokens without text.
          R.evolve({
            quasis: R.map(function (text) {
              // if it's an unicode we keep the cooked value because it's the parsed value by babel (without unicode chars)
              // This regex will detect if a string contains unicode chars, when they're we should interpolate them
              // why? because platforms like react native doesn't parse them, just doing a JSON.parse makes them UTF-8 friendly
              var value = /\\u[a-fA-F0-9]{4}|\\x[a-fA-F0-9]{2}/g.test(text.value.raw) ? text.value.cooked : text.value.raw;
              if (value === "") return null;
              return _this.tokenizeText(_this.clearBackslashes(value));
            }),
            expressions: R.map(function (exp) {
              return _this.types.isCallExpression(exp) ? _this.tokenizeNode(exp) : _this.tokenizeExpression(exp);
            })
          }), function (exp) {
            return (0, _utils.zip)(exp.quasis, exp.expressions);
          }, // @ts-ignore
          R.flatten, R.filter(Boolean));
          return tokenize(exp);
        } else if (_this.types.isJSXElement(exp)) {
          return _this.tokenizeNode(exp);
        } else {
          return _this.tokenizeExpression(exp);
        }
      } else if (_this.types.isJSXElement(node)) {
        return _this.tokenizeNode(node);
      } else if (_this.types.isJSXSpreadChild(node)) {// just do nothing
      } else if (_this.types.isJSXText(node)) {
        return _this.tokenizeText(node.value);
      } else {
        return _this.tokenizeText(node.value);
      }
    });
    (0, _defineProperty2.default)(this, "tokenizeChoiceComponent", function (node) {
      var element = node.openingElement;
      var format = element.name.name.toLowerCase();
      var props = element.attributes.filter(_this.attrName([_constants.ID, _constants.COMMENT, _constants.MESSAGE, _constants.CONTEXT, "key", // we remove <Trans /> react props that are not useful for translation
      "render", "component", "components"], true));
      var token = {
        type: "arg",
        format: format,
        name: null,
        value: undefined,
        options: {
          offset: undefined
        }
      };

      var _iterator = _createForOfIteratorHelper(props),
          _step;

      try {
        for (_iterator.s(); !(_step = _iterator.n()).done;) {
          var attr = _step.value;
          var name = attr.name.name;

          if (name === "value") {
            var exp = _this.types.isLiteral(attr.value) ? attr.value : attr.value.expression;
            token.name = _this.expressionToArgument(exp);
            token.value = exp;
          } else if (format !== "select" && name === "offset") {
            // offset is static parameter, so it must be either string or number
            token.options.offset = _this.types.isStringLiteral(attr.value) ? attr.value.value : attr.value.expression.value;
          } else {
            var value = void 0;

            if (_this.types.isStringLiteral(attr.value)) {
              value = attr.value.extra.raw.replace(/(["'])(.*)\1/, "$2");
            } else {
              value = _this.tokenizeChildren(attr.value);
            }

            if (pluralRuleRe.test(name)) {
              token.options[jsx2icuExactChoice(name)] = value;
            } else {
              token.options[name] = value;
            }
          }
        }
      } catch (err) {
        _iterator.e(err);
      } finally {
        _iterator.f();
      }

      return token;
    });
    (0, _defineProperty2.default)(this, "tokenizeElement", function (node) {
      // !!! Important: Calculate element index before traversing children.
      // That way outside elements are numbered before inner elements. (...and it looks pretty).
      var name = _this.elementIndex();

      var children = node.children.map(function (child) {
        return _this.tokenizeChildren(child);
      }).filter(Boolean);
      node.children = [];
      node.openingElement.selfClosing = true;
      return {
        type: "element",
        name: name,
        value: node,
        children: children
      };
    });
    (0, _defineProperty2.default)(this, "tokenizeExpression", function (node) {
      return {
        type: "arg",
        name: _this.expressionToArgument(node),
        value: node
      };
    });
    (0, _defineProperty2.default)(this, "tokenizeText", function (value) {
      return {
        type: "text",
        value: value
      };
    });
    (0, _defineProperty2.default)(this, "expressionToArgument", function (exp) {
      return _this.types.isIdentifier(exp) ? exp.name : _this.expressionIndex();
    });
    (0, _defineProperty2.default)(this, "isIdentifier", function (node, name) {
      return _this.types.isIdentifier(node, {
        name: name
      });
    });
    (0, _defineProperty2.default)(this, "isI18nComponent", function (node) {
      var name = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : "Trans";
      return _this.types.isJSXElement(node) && _this.types.isJSXIdentifier(node.openingElement.name, {
        name: name
      });
    });
    (0, _defineProperty2.default)(this, "isChoiceComponent", function (node) {
      return _this.isI18nComponent(node, "Plural") || _this.isI18nComponent(node, "Select") || _this.isI18nComponent(node, "SelectOrdinal");
    });
    this.types = types;
    this.expressionIndex = (0, _utils.makeCounter)();
    this.elementIndex = (0, _utils.makeCounter)();
  }

  (0, _createClass2.default)(MacroJSX, [{
    key: "clearBackslashes",

    /**
     * We clean '//\` ' to just '`'
     * */
    value: function clearBackslashes(value) {
      // if not we replace the extra scaped literals
      return value.replace(/\\`/g, "`");
    }
    /**
     * Custom matchers
     */

  }]);
  return MacroJSX;
}();

exports.default = MacroJSX;