'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var react = require('react');
var jotai = require('jotai');

function useAtomDevtools(anAtom, name, scope) {
  var extension;

  try {
    extension = window.__REDUX_DEVTOOLS_EXTENSION__;
  } catch (_unused) {}

  if (!extension) {
    if (typeof process === 'object' && process.env.NODE_ENV === 'development' && typeof window !== 'undefined') {
      console.warn('Please install/enable Redux devtools extension');
    }
  }

  var _useAtom = jotai.useAtom(anAtom, scope),
      value = _useAtom[0],
      setValue = _useAtom[1];

  var lastValue = react.useRef(value);
  var isTimeTraveling = react.useRef(false);
  var devtools = react.useRef();
  var atomName = name || anAtom.debugLabel || anAtom.toString();
  react.useEffect(function () {
    if (extension) {
      devtools.current = extension.connect({
        name: atomName
      });
      var unsubscribe = devtools.current.subscribe(function (message) {
        var _message$payload3, _message$payload4;

        if (message.type === 'DISPATCH' && message.state) {
          var _message$payload, _message$payload2;

          if (((_message$payload = message.payload) == null ? void 0 : _message$payload.type) === 'JUMP_TO_ACTION' || ((_message$payload2 = message.payload) == null ? void 0 : _message$payload2.type) === 'JUMP_TO_STATE') {
            isTimeTraveling.current = true;
          }

          setValue(JSON.parse(message.state));
        } else if (message.type === 'DISPATCH' && ((_message$payload3 = message.payload) == null ? void 0 : _message$payload3.type) === 'COMMIT') {
          var _devtools$current;

          (_devtools$current = devtools.current) == null ? void 0 : _devtools$current.init(lastValue.current);
        } else if (message.type === 'DISPATCH' && ((_message$payload4 = message.payload) == null ? void 0 : _message$payload4.type) === 'IMPORT_STATE') {
          var _message$payload$next;

          var computedStates = ((_message$payload$next = message.payload.nextLiftedState) == null ? void 0 : _message$payload$next.computedStates) || [];
          computedStates.forEach(function (_ref, index) {
            var state = _ref.state;

            if (index === 0) {
              var _devtools$current2;

              (_devtools$current2 = devtools.current) == null ? void 0 : _devtools$current2.init(state);
            } else {
              setValue(state);
            }
          });
        }
      });
      devtools.current.shouldInit = true;
      return unsubscribe;
    }
  }, [anAtom, extension, atomName, setValue]);
  react.useEffect(function () {
    if (devtools.current) {
      lastValue.current = value;

      if (devtools.current.shouldInit) {
        devtools.current.init(value);
        devtools.current.shouldInit = false;
      } else if (isTimeTraveling.current) {
        isTimeTraveling.current = false;
      } else {
        devtools.current.send(atomName + " - " + new Date().toLocaleString(), value);
      }
    }
  }, [anAtom, extension, atomName, value]);
}

var RESTORE_ATOMS = 'h';
var DEV_SUBSCRIBE_STATE = 'n';
var DEV_GET_MOUNTED_ATOMS = 'l';
var DEV_GET_ATOM_STATE = 'a';

var createAtomsSnapshot = function createAtomsSnapshot(store, atoms) {
  var tuples = atoms.map(function (atom) {
    var _store$DEV_GET_ATOM_S, _store$DEV_GET_ATOM_S2;

    var atomState = (_store$DEV_GET_ATOM_S = (_store$DEV_GET_ATOM_S2 = store[DEV_GET_ATOM_STATE]) == null ? void 0 : _store$DEV_GET_ATOM_S2.call(store, atom)) != null ? _store$DEV_GET_ATOM_S : {};
    return [atom, atomState.v];
  });
  return new Map(tuples);
};

function useAtomsSnapshot(scope) {
  var ScopeContext = jotai.SECRET_INTERNAL_getScopeContext(scope);
  var scopeContainer = react.useContext(ScopeContext);
  var store = scopeContainer.s;

  if (!store[DEV_SUBSCRIBE_STATE]) {
    throw new Error('useAtomsSnapshot can only be used in dev mode.');
  }

  var _useState = react.useState(function () {
    return new Map();
  }),
      atomsSnapshot = _useState[0],
      setAtomsSnapshot = _useState[1];

  react.useEffect(function () {
    var _store$DEV_SUBSCRIBE_;

    var callback = function callback(updatedAtom, isNewAtom) {
      var _store$DEV_GET_MOUNTE;

      var atoms = Array.from(((_store$DEV_GET_MOUNTE = store[DEV_GET_MOUNTED_ATOMS]) == null ? void 0 : _store$DEV_GET_MOUNTE.call(store)) || []);

      if (updatedAtom && isNewAtom && !atoms.includes(updatedAtom)) {
        atoms.push(updatedAtom);
      }

      setAtomsSnapshot(createAtomsSnapshot(store, atoms));
    };

    var unsubscribe = (_store$DEV_SUBSCRIBE_ = store[DEV_SUBSCRIBE_STATE]) == null ? void 0 : _store$DEV_SUBSCRIBE_.call(store, callback);
    callback();
    return unsubscribe;
  }, [store]);
  return atomsSnapshot;
}

function useGotoAtomsSnapshot(scope) {
  var ScopeContext = jotai.SECRET_INTERNAL_getScopeContext(scope);
  var scopeContainer = react.useContext(ScopeContext);
  var store = scopeContainer.s;

  if (!store[DEV_SUBSCRIBE_STATE]) {
    throw new Error('useGotoAtomsSnapshot can only be used in dev mode.');
  }

  return react.useCallback(function (values) {
    store[RESTORE_ATOMS](values);
  }, [store]);
}

exports.useAtomDevtools = useAtomDevtools;
exports.useAtomsSnapshot = useAtomsSnapshot;
exports.useGotoAtomsSnapshot = useGotoAtomsSnapshot;
