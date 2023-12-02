import { UAParser } from '@amplitude/ua-parser-js';

var ApplicationContextProviderImpl = /** @class */ (function () {
    function ApplicationContextProviderImpl() {
        this.ua = new UAParser(typeof navigator !== 'undefined' ? navigator.userAgent : null).getResult();
    }
    ApplicationContextProviderImpl.prototype.getApplicationContext = function () {
        return {
            versionName: this.versionName,
            language: getLanguage(),
            platform: 'Web',
            os: getOs(this.ua),
            deviceModel: getDeviceModel(this.ua),
        };
    };
    return ApplicationContextProviderImpl;
}());
var getOs = function (ua) {
    var _a, _b;
    return [(_a = ua.browser) === null || _a === void 0 ? void 0 : _a.name, (_b = ua.browser) === null || _b === void 0 ? void 0 : _b.major]
        .filter(function (e) { return e !== null && e !== undefined; })
        .join(' ');
};
var getDeviceModel = function (ua) {
    var _a;
    return (_a = ua.os) === null || _a === void 0 ? void 0 : _a.name;
};
var getLanguage = function () {
    return ((typeof navigator !== 'undefined' &&
        ((navigator.languages && navigator.languages[0]) ||
            navigator.language)) ||
        '');
};

var EventBridgeImpl = /** @class */ (function () {
    function EventBridgeImpl() {
        this.queue = [];
    }
    EventBridgeImpl.prototype.logEvent = function (event) {
        if (!this.receiver) {
            if (this.queue.length < 512) {
                this.queue.push(event);
            }
        }
        else {
            this.receiver(event);
        }
    };
    EventBridgeImpl.prototype.setEventReceiver = function (receiver) {
        this.receiver = receiver;
        if (this.queue.length > 0) {
            this.queue.forEach(function (event) {
                receiver(event);
            });
            this.queue = [];
        }
    };
    return EventBridgeImpl;
}());

/*! *****************************************************************************
Copyright (c) Microsoft Corporation.

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
PERFORMANCE OF THIS SOFTWARE.
***************************************************************************** */
var __assign = function () {
  __assign = Object.assign || function __assign(t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
      s = arguments[i];

      for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
    }

    return t;
  };

  return __assign.apply(this, arguments);
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
var isEqual = function (obj1, obj2) {
    var primitive = ['string', 'number', 'boolean', 'undefined'];
    var typeA = typeof obj1;
    var typeB = typeof obj2;
    if (typeA !== typeB) {
        return false;
    }
    for (var _i = 0, primitive_1 = primitive; _i < primitive_1.length; _i++) {
        var p = primitive_1[_i];
        if (p === typeA) {
            return obj1 === obj2;
        }
    }
    // check null
    if (obj1 == null && obj2 == null) {
        return true;
    }
    else if (obj1 == null || obj2 == null) {
        return false;
    }
    // if got here - objects
    if (obj1.length !== obj2.length) {
        return false;
    }
    //check if arrays
    var isArrayA = Array.isArray(obj1);
    var isArrayB = Array.isArray(obj2);
    if (isArrayA !== isArrayB) {
        return false;
    }
    if (isArrayA && isArrayB) {
        //arrays
        for (var i = 0; i < obj1.length; i++) {
            if (!isEqual(obj1[i], obj2[i])) {
                return false;
            }
        }
    }
    else {
        //objects
        var sorted1 = Object.keys(obj1).sort();
        var sorted2 = Object.keys(obj2).sort();
        if (!isEqual(sorted1, sorted2)) {
            return false;
        }
        //compare object values
        var result_1 = true;
        Object.keys(obj1).forEach(function (key) {
            if (!isEqual(obj1[key], obj2[key])) {
                result_1 = false;
            }
        });
        return result_1;
    }
    return true;
};

var ID_OP_SET = '$set';
var ID_OP_UNSET = '$unset';
var ID_OP_CLEAR_ALL = '$clearAll';
// Polyfill for Object.entries
if (!Object.entries) {
    Object.entries = function (obj) {
        var ownProps = Object.keys(obj);
        var i = ownProps.length;
        var resArray = new Array(i);
        while (i--) {
            resArray[i] = [ownProps[i], obj[ownProps[i]]];
        }
        return resArray;
    };
}
var IdentityStoreImpl = /** @class */ (function () {
    function IdentityStoreImpl() {
        this.identity = { userProperties: {} };
        this.listeners = new Set();
    }
    IdentityStoreImpl.prototype.editIdentity = function () {
        // eslint-disable-next-line @typescript-eslint/no-this-alias
        var self = this;
        var actingUserProperties = __assign({}, this.identity.userProperties);
        var actingIdentity = __assign(__assign({}, this.identity), { userProperties: actingUserProperties });
        return {
            setUserId: function (userId) {
                actingIdentity.userId = userId;
                return this;
            },
            setDeviceId: function (deviceId) {
                actingIdentity.deviceId = deviceId;
                return this;
            },
            setUserProperties: function (userProperties) {
                actingIdentity.userProperties = userProperties;
                return this;
            },
            updateUserProperties: function (actions) {
                var actingProperties = actingIdentity.userProperties || {};
                for (var _i = 0, _a = Object.entries(actions); _i < _a.length; _i++) {
                    var _b = _a[_i], action = _b[0], properties = _b[1];
                    switch (action) {
                        case ID_OP_SET:
                            for (var _c = 0, _d = Object.entries(properties); _c < _d.length; _c++) {
                                var _e = _d[_c], key = _e[0], value = _e[1];
                                actingProperties[key] = value;
                            }
                            break;
                        case ID_OP_UNSET:
                            for (var _f = 0, _g = Object.keys(properties); _f < _g.length; _f++) {
                                var key = _g[_f];
                                delete actingProperties[key];
                            }
                            break;
                        case ID_OP_CLEAR_ALL:
                            actingProperties = {};
                            break;
                    }
                }
                actingIdentity.userProperties = actingProperties;
                return this;
            },
            commit: function () {
                self.setIdentity(actingIdentity);
                return this;
            },
        };
    };
    IdentityStoreImpl.prototype.getIdentity = function () {
        return __assign({}, this.identity);
    };
    IdentityStoreImpl.prototype.setIdentity = function (identity) {
        var originalIdentity = __assign({}, this.identity);
        this.identity = __assign({}, identity);
        if (!isEqual(originalIdentity, this.identity)) {
            this.listeners.forEach(function (listener) {
                listener(identity);
            });
        }
    };
    IdentityStoreImpl.prototype.addIdentityListener = function (listener) {
        this.listeners.add(listener);
    };
    IdentityStoreImpl.prototype.removeIdentityListener = function (listener) {
        this.listeners.delete(listener);
    };
    return IdentityStoreImpl;
}());

var safeGlobal = typeof globalThis !== 'undefined'
    ? globalThis
    : typeof global !== 'undefined'
        ? global
        : self;

var AnalyticsConnector = /** @class */ (function () {
    function AnalyticsConnector() {
        this.identityStore = new IdentityStoreImpl();
        this.eventBridge = new EventBridgeImpl();
        this.applicationContextProvider = new ApplicationContextProviderImpl();
    }
    AnalyticsConnector.getInstance = function (instanceName) {
        if (!safeGlobal['analyticsConnectorInstances']) {
            safeGlobal['analyticsConnectorInstances'] = {};
        }
        if (!safeGlobal['analyticsConnectorInstances'][instanceName]) {
            safeGlobal['analyticsConnectorInstances'][instanceName] =
                new AnalyticsConnector();
        }
        return safeGlobal['analyticsConnectorInstances'][instanceName];
    };
    return AnalyticsConnector;
}());

export { AnalyticsConnector };
