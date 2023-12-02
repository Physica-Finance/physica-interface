"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _slicedToArray2 = _interopRequireDefault(require("@babel/runtime/helpers/slicedToArray"));

var _babelPluginMacros = require("babel-plugin-macros");

var _conf = require("@lingui/conf");

var _macroJs = _interopRequireDefault(require("./macroJs"));

var _macroJsx = _interopRequireDefault(require("./macroJsx"));

var config = (0, _conf.getConfig)({
  configPath: process.env.LINGUI_CONFIG
});

var getSymbolSource = function getSymbolSource(name) {
  if (Array.isArray(config.runtimeConfigModule)) {
    if (name === "i18n") {
      return config.runtimeConfigModule;
    } else {
      return ["@lingui/react", name];
    }
  } else {
    if (Object.prototype.hasOwnProperty.call(config.runtimeConfigModule, name)) {
      return config.runtimeConfigModule[name];
    } else {
      return ["@lingui/react", name];
    }
  }
};

var _getSymbolSource = getSymbolSource("i18n"),
    _getSymbolSource2 = (0, _slicedToArray2.default)(_getSymbolSource, 2),
    i18nImportModule = _getSymbolSource2[0],
    _getSymbolSource2$ = _getSymbolSource2[1],
    i18nImportName = _getSymbolSource2$ === void 0 ? "i18n" : _getSymbolSource2$;

var _getSymbolSource3 = getSymbolSource("Trans"),
    _getSymbolSource4 = (0, _slicedToArray2.default)(_getSymbolSource3, 2),
    TransImportModule = _getSymbolSource4[0],
    _getSymbolSource4$ = _getSymbolSource4[1],
    TransImportName = _getSymbolSource4$ === void 0 ? "Trans" : _getSymbolSource4$;

function macro(_ref) {
  var references = _ref.references,
      state = _ref.state,
      babel = _ref.babel;
  var jsxNodes = [];
  var jsNodes = [];
  var needsI18nImport = false;
  Object.keys(references).forEach(function (tagName) {
    var nodes = references[tagName];
    var macroType = getMacroType(tagName);

    if (macroType == null) {
      throw nodes[0].buildCodeFrameError("Unknown macro ".concat(tagName));
    }

    if (macroType === "js") {
      nodes.forEach(function (node) {
        jsNodes.push(node.parentPath);
      });
    } else {
      nodes.forEach(function (node) {
        // identifier.openingElement.jsxElement
        jsxNodes.push(node.parentPath.parentPath);
      });
    }
  });
  jsNodes.filter(isRootPath(jsNodes)).forEach(function (path) {
    if (alreadyVisited(path)) return;
    var macro = new _macroJs.default(babel, {
      i18nImportName: i18nImportName
    });
    if (macro.replacePath(path)) needsI18nImport = true;
  });
  jsxNodes.filter(isRootPath(jsxNodes)).forEach(function (path) {
    if (alreadyVisited(path)) return;
    var macro = new _macroJsx.default(babel);
    macro.replacePath(path);
  });

  if (needsI18nImport) {
    addImport(babel, state, i18nImportModule, i18nImportName);
  }

  if (jsxNodes.length) {
    addImport(babel, state, TransImportModule, TransImportName);
  }

  if (process.env.LINGUI_EXTRACT === "1") {
    return {
      keepImports: true
    };
  }
}

function addImport(babel, state, module, importName) {
  var t = babel.types;
  var linguiImport = state.file.path.node.body.find(function (importNode) {
    return t.isImportDeclaration(importNode) && importNode.source.value === module && // https://github.com/lingui/js-lingui/issues/777
    importNode.importKind !== "type";
  });
  var tIdentifier = t.identifier(importName); // Handle adding the import or altering the existing import

  if (linguiImport) {
    if (linguiImport.specifiers.findIndex(function (specifier) {
      return specifier.imported && specifier.imported.name === importName;
    }) === -1) {
      linguiImport.specifiers.push(t.importSpecifier(tIdentifier, tIdentifier));
    }
  } else {
    state.file.path.node.body.unshift(t.importDeclaration([t.importSpecifier(tIdentifier, tIdentifier)], t.stringLiteral(module)));
  }
}

function isRootPath(allPath) {
  return function (node) {
    return function traverse(path) {
      if (!path.parentPath) {
        return true;
      } else {
        return !allPath.includes(path.parentPath) && traverse(path.parentPath);
      }
    }(node);
  };
}

var alreadyVisitedCache = [];

function alreadyVisited(path) {
  if (alreadyVisitedCache.includes(path)) {
    return true;
  } else {
    alreadyVisitedCache.push(path);
    return false;
  }
}

function getMacroType(tagName) {
  switch (tagName) {
    case "defineMessage":
    case "arg":
    case "t":
    case "plural":
    case "select":
    case "selectOrdinal":
      return "js";

    case "Trans":
    case "Plural":
    case "Select":
    case "SelectOrdinal":
      return "jsx";
  }
}

var _default = (0, _babelPluginMacros.createMacro)(macro);

exports.default = _default;