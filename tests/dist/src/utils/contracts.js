"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkAptosType = exports.extractStructTagFromType = exports.extractAddressFromType = exports.composeType = exports.isSortedSymbols = void 0;
const sui_js_1 = require("@mysten/sui.js");
const hex_1 = require("./hex");
const CoinAssist_1 = require("../math/CoinAssist");
const EQUAL = 0;
const LESS_THAN = 1;
const GREATER_THAN = 2;
function cmp(a, b) {
    if (a === b) {
        return EQUAL;
    }
    if (a < b) {
        return LESS_THAN;
    }
    return GREATER_THAN;
}
function compare(symbolX, symbolY) {
    let i = 0;
    const len = symbolX.length <= symbolY.length ? symbolX.length : symbolY.length;
    const lenCmp = cmp(symbolX.length, symbolY.length);
    while (i < len) {
        const elemCmp = cmp(symbolX.charCodeAt(i), symbolY.charCodeAt(i));
        i += 1;
        if (elemCmp !== 0) {
            return elemCmp;
        }
    }
    return lenCmp;
}
function isSortedSymbols(symbolX, symbolY) {
    return compare(symbolX, symbolY) === LESS_THAN;
}
exports.isSortedSymbols = isSortedSymbols;
function composeType(address, ...args) {
    const generics = Array.isArray(args[args.length - 1]) ? args.pop() : [];
    const chains = [address, ...args].filter(Boolean);
    let result = chains.join('::');
    if (generics && generics.length) {
        result += `<${generics.join(', ')}>`;
    }
    return result;
}
exports.composeType = composeType;
function extractAddressFromType(type) {
    return type.split('::')[0];
}
exports.extractAddressFromType = extractAddressFromType;
function extractStructTagFromType(type) {
    var _a;
    let _type = type.replace(/\s/g, '');
    const genericsString = _type.match(/(<.+>)$/);
    const generics = (_a = genericsString === null || genericsString === void 0 ? void 0 : genericsString[0]) === null || _a === void 0 ? void 0 : _a.match(/(\w+::\w+::\w+)(?:<.*?>(?!>))?/g);
    if (generics) {
        _type = _type.slice(0, _type.indexOf('<'));
        const tag = extractStructTagFromType(_type);
        const structTag = Object.assign(Object.assign({}, tag), { type_arguments: [...generics] });
        structTag.type_arguments = structTag.type_arguments.map((item) => {
            return CoinAssist_1.CoinAssist.isSuiCoin(item) ? item : extractStructTagFromType(item).source_address;
        });
        structTag.source_address = composeType(structTag.full_address, structTag.type_arguments);
        return structTag;
    }
    const parts = _type.split('::');
    const structTag = {
        full_address: _type,
        address: parts[2] === 'SUI' ? '0x2' : (0, sui_js_1.normalizeSuiObjectId)(parts[0]),
        module: parts[1],
        name: parts[2],
        type_arguments: [],
        source_address: '',
    };
    structTag.full_address = `${structTag.address}::${structTag.module}::${structTag.name}`;
    structTag.source_address = composeType(structTag.full_address, structTag.type_arguments);
    return structTag;
}
exports.extractStructTagFromType = extractStructTagFromType;
function checkAptosType(type, options = { leadingZero: true }) {
    var _a, _b, _c, _d, _e;
    if (typeof type !== 'string') {
        return false;
    }
    let _type = type.replace(/\s/g, '');
    const openBracketsCount = (_b = (_a = _type.match(/</g)) === null || _a === void 0 ? void 0 : _a.length) !== null && _b !== void 0 ? _b : 0;
    const closeBracketsCount = (_d = (_c = _type.match(/>/g)) === null || _c === void 0 ? void 0 : _c.length) !== null && _d !== void 0 ? _d : 0;
    if (openBracketsCount !== closeBracketsCount) {
        return false;
    }
    const genericsString = _type.match(/(<.+>)$/);
    const generics = (_e = genericsString === null || genericsString === void 0 ? void 0 : genericsString[1]) === null || _e === void 0 ? void 0 : _e.match(/(\w+::\w+::\w+)(?:<.*?>(?!>))?/g);
    if (generics) {
        _type = _type.slice(0, _type.indexOf('<'));
        const validGenerics = generics.every((g) => {
            var _a, _b, _c, _d;
            const gOpenCount = (_b = (_a = g.match(/</g)) === null || _a === void 0 ? void 0 : _a.length) !== null && _b !== void 0 ? _b : 0;
            const gCloseCount = (_d = (_c = g.match(/>/g)) === null || _c === void 0 ? void 0 : _c.length) !== null && _d !== void 0 ? _d : 0;
            let t = g;
            if (gOpenCount !== gCloseCount) {
                t = t.slice(0, -(gCloseCount - gOpenCount));
            }
            return checkAptosType(t, options);
        });
        if (!validGenerics) {
            return false;
        }
    }
    const parts = _type.split('::');
    if (parts.length !== 3) {
        return false;
    }
    return (0, hex_1.checkAddress)(parts[0], options) && parts[1].length >= 1 && parts[2].length >= 1;
}
exports.checkAptosType = checkAptosType;
