import { useRef, useEffect, useContext, useState, useCallback } from 'react';
import { useAtom, SECRET_INTERNAL_getScopeContext } from 'jotai';

function useAtomDevtools(anAtom, name, scope) {
  let extension;
  try {
    extension = window.__REDUX_DEVTOOLS_EXTENSION__;
  } catch {
  }
  if (!extension) {
    if (typeof process === "object" && process.env.NODE_ENV === "development" && typeof window !== "undefined") {
      console.warn("Please install/enable Redux devtools extension");
    }
  }
  const [value, setValue] = useAtom(anAtom, scope);
  const lastValue = useRef(value);
  const isTimeTraveling = useRef(false);
  const devtools = useRef();
  const atomName = name || anAtom.debugLabel || anAtom.toString();
  useEffect(() => {
    if (extension) {
      devtools.current = extension.connect({ name: atomName });
      const unsubscribe = devtools.current.subscribe((message) => {
        var _a, _b, _c, _d, _e, _f;
        if (message.type === "DISPATCH" && message.state) {
          if (((_a = message.payload) == null ? void 0 : _a.type) === "JUMP_TO_ACTION" || ((_b = message.payload) == null ? void 0 : _b.type) === "JUMP_TO_STATE") {
            isTimeTraveling.current = true;
          }
          setValue(JSON.parse(message.state));
        } else if (message.type === "DISPATCH" && ((_c = message.payload) == null ? void 0 : _c.type) === "COMMIT") {
          (_d = devtools.current) == null ? void 0 : _d.init(lastValue.current);
        } else if (message.type === "DISPATCH" && ((_e = message.payload) == null ? void 0 : _e.type) === "IMPORT_STATE") {
          const computedStates = ((_f = message.payload.nextLiftedState) == null ? void 0 : _f.computedStates) || [];
          computedStates.forEach(({ state }, index) => {
            var _a2;
            if (index === 0) {
              (_a2 = devtools.current) == null ? void 0 : _a2.init(state);
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
  useEffect(() => {
    if (devtools.current) {
      lastValue.current = value;
      if (devtools.current.shouldInit) {
        devtools.current.init(value);
        devtools.current.shouldInit = false;
      } else if (isTimeTraveling.current) {
        isTimeTraveling.current = false;
      } else {
        devtools.current.send(`${atomName} - ${new Date().toLocaleString()}`, value);
      }
    }
  }, [anAtom, extension, atomName, value]);
}

const RESTORE_ATOMS = "h";
const DEV_SUBSCRIBE_STATE = "n";
const DEV_GET_MOUNTED_ATOMS = "l";
const DEV_GET_ATOM_STATE = "a";

const createAtomsSnapshot = (store, atoms) => {
  const tuples = atoms.map((atom) => {
    var _a, _b;
    const atomState = (_b = (_a = store[DEV_GET_ATOM_STATE]) == null ? void 0 : _a.call(store, atom)) != null ? _b : {};
    return [atom, atomState.v];
  });
  return new Map(tuples);
};
function useAtomsSnapshot(scope) {
  const ScopeContext = SECRET_INTERNAL_getScopeContext(scope);
  const scopeContainer = useContext(ScopeContext);
  const store = scopeContainer.s;
  if (!store[DEV_SUBSCRIBE_STATE]) {
    throw new Error("useAtomsSnapshot can only be used in dev mode.");
  }
  const [atomsSnapshot, setAtomsSnapshot] = useState(() => new Map());
  useEffect(() => {
    var _a;
    const callback = (updatedAtom, isNewAtom) => {
      var _a2;
      const atoms = Array.from(((_a2 = store[DEV_GET_MOUNTED_ATOMS]) == null ? void 0 : _a2.call(store)) || []);
      if (updatedAtom && isNewAtom && !atoms.includes(updatedAtom)) {
        atoms.push(updatedAtom);
      }
      setAtomsSnapshot(createAtomsSnapshot(store, atoms));
    };
    const unsubscribe = (_a = store[DEV_SUBSCRIBE_STATE]) == null ? void 0 : _a.call(store, callback);
    callback();
    return unsubscribe;
  }, [store]);
  return atomsSnapshot;
}

function useGotoAtomsSnapshot(scope) {
  const ScopeContext = SECRET_INTERNAL_getScopeContext(scope);
  const scopeContainer = useContext(ScopeContext);
  const store = scopeContainer.s;
  if (!store[DEV_SUBSCRIBE_STATE]) {
    throw new Error("useGotoAtomsSnapshot can only be used in dev mode.");
  }
  return useCallback((values) => {
    store[RESTORE_ATOMS](values);
  }, [store]);
}

export { useAtomDevtools, useAtomsSnapshot, useGotoAtomsSnapshot };
