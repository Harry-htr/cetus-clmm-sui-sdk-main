"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.decimalsMultiplier = exports.d = void 0;
const decimal_js_1 = __importDefault(require("decimal.js"));
function d(value) {
    if (decimal_js_1.default.isDecimal(value)) {
        return value;
    }
    return new decimal_js_1.default(value === undefined ? 0 : value);
}
exports.d = d;
function decimalsMultiplier(decimals) {
    return d(10).pow(d(decimals).abs());
}
exports.decimalsMultiplier = decimalsMultiplier;
