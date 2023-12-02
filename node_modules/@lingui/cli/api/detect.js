"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.detect = detect;
exports.projectType = void 0;

var _fs = _interopRequireDefault(require("fs"));

var _pkgUp = _interopRequireDefault(require("pkg-up"));

var projectType = {
  CRA: "CRA",
  REACT: "REACT"
};
exports.projectType = projectType;

function getPackageJson() {
  var packageJsonPath = _pkgUp.default.sync();

  try {
    var json = _fs.default.readFileSync(packageJsonPath, "utf8");

    return JSON.parse(json);
  } catch (e) {
    console.error(e);
    return null;
  }
}

function hasDependency(pkg, name) {
  return pkg.dependencies && pkg.dependencies[name] || pkg.devDependencies && pkg.devDependencies[name];
}

function detectFramework(pkg) {
  if (hasDependency(pkg, "react-scripts")) {
    return projectType.CRA;
  }

  if (hasDependency(pkg, "react")) {
    return projectType.REACT;
  }

  return null;
}

function detect() {
  var pkg = getPackageJson();
  if (!pkg) return null;
  return detectFramework(pkg);
}