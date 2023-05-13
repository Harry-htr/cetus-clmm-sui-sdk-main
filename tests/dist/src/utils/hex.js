"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.utf8to16 = exports.hexToString = exports.hexToNumber = exports.bufferToHex = exports.toBuffer = exports.checkAddress = exports.shortAddress = exports.shortString = exports.removeHexPrefix = exports.addHexPrefix = void 0;
/* eslint-disable prefer-const */
/* eslint-disable no-bitwise */
/* eslint-disable default-case */
/* eslint-disable @typescript-eslint/no-use-before-define */
/* eslint-disable no-plusplus */
const HEX_REGEXP = /^[-+]?[0-9A-Fa-f]+\.?[0-9A-Fa-f]*?$/;
function addHexPrefix(hex) {
    return !hex.startsWith('0x') ? `0x${hex}` : hex;
}
exports.addHexPrefix = addHexPrefix;
function removeHexPrefix(hex) {
    return hex.startsWith('0x') ? `${hex.slice(2)}` : hex;
}
exports.removeHexPrefix = removeHexPrefix;
function shortString(str, start = 4, end = 4) {
    const slen = Math.max(start, 1);
    const elen = Math.max(end, 1);
    return `${str.slice(0, slen + 2)} ... ${str.slice(-elen)}`;
}
exports.shortString = shortString;
function shortAddress(address, start = 4, end = 4) {
    return shortString(addHexPrefix(address), start, end);
}
exports.shortAddress = shortAddress;
function checkAddress(address, options = { leadingZero: true }) {
    if (typeof address !== 'string') {
        return false;
    }
    let str = address;
    if (options.leadingZero) {
        if (!address.startsWith('0x')) {
            return false;
        }
        str = str.substring(2);
    }
    return HEX_REGEXP.test(str);
}
exports.checkAddress = checkAddress;
/**
 * Attempts to turn a value into a `Buffer`. As input it supports `Buffer`, `String`, `Number`, null/undefined, `BN` and other objects with a `toArray()` method.
 * @param v the value
 */
function toBuffer(v) {
    if (!Buffer.isBuffer(v)) {
        if (Array.isArray(v)) {
            v = Buffer.from(v);
        }
        else if (typeof v === 'string') {
            if (exports.isHexString(v)) {
                v = Buffer.from(exports.padToEven(exports.stripHexPrefix(v)), 'hex');
            }
            else {
                v = Buffer.from(v);
            }
        }
        else if (typeof v === 'number') {
            v = exports.intToBuffer(v);
        }
        else if (v === null || v === undefined) {
            v = Buffer.allocUnsafe(0);
        }
        else if (v.toArray) {
            // converts a BN to a Buffer
            v = Buffer.from(v.toArray());
        }
        else {
            throw new Error('invalid type');
        }
    }
    return v;
}
exports.toBuffer = toBuffer;
function bufferToHex(buffer) {
    return addHexPrefix(toBuffer(buffer).toString('hex'));
}
exports.bufferToHex = bufferToHex;
/**
 * '\x02\x00\x00\x00' to 2
 * @param binaryData
 */
function hexToNumber(binaryData) {
    const buffer = new ArrayBuffer(4);
    const view = new DataView(buffer);
    for (let i = 0; i < binaryData.length; i++) {
        view.setUint8(i, binaryData.charCodeAt(i));
    }
    const number = view.getUint32(0, true); //
    return number;
}
exports.hexToNumber = hexToNumber;
function hexToString(str) {
    let val = '';
    const newStr = removeHexPrefix(str);
    const len = newStr.length / 2;
    for (let i = 0; i < len; i++) {
        val += String.fromCharCode(parseInt(newStr.substr(i * 2, 2), 16));
    }
    return utf8to16(val);
}
exports.hexToString = hexToString;
function utf8to16(str) {
    let out;
    let i;
    let len;
    let c;
    let char2;
    let char3;
    out = '';
    len = str.length;
    i = 0;
    while (i < len) {
        c = str.charCodeAt(i++);
        switch (c >> 4) {
            case 0:
            case 1:
            case 2:
            case 3:
            case 4:
            case 5:
            case 6:
            case 7:
                out += str.charAt(i - 1);
                break;
            case 12:
            case 13:
                char2 = str.charCodeAt(i++);
                out += String.fromCharCode(((c & 0x1f) << 6) | (char2 & 0x3f));
                break;
            case 14:
                char2 = str.charCodeAt(i++);
                char3 = str.charCodeAt(i++);
                out += String.fromCharCode(((c & 0x0f) << 12) | ((char2 & 0x3f) << 6) | ((char3 & 0x3f) << 0));
                break;
        }
    }
    return out;
}
exports.utf8to16 = utf8to16;
