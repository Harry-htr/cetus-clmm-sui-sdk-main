"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FEE_RATE_DENOMINATOR = exports.MIN_SQRT_PRICE = exports.TICK_ARRAY_SIZE = exports.MAX_SQRT_PRICE = exports.MIN_TICK_INDEX = exports.MAX_TICK_INDEX = void 0;
const bn_js_1 = __importDefault(require("bn.js"));
/**
 * The maximum tick index supported by the clmmpool program.
 * @category Constants
 */
exports.MAX_TICK_INDEX = 443636;
/**
 * The minimum tick index supported by the clmmpool program.
 * @category Constants
 */
exports.MIN_TICK_INDEX = -443636;
/**
 * The maximum sqrt-price supported by the clmmpool program.
 * @category Constants
 */
exports.MAX_SQRT_PRICE = '79226673515401279992447579055';
/**
 * The number of initialized ticks that a tick-array account can hold.
 * @category Constants
 */
exports.TICK_ARRAY_SIZE = 64;
/**
 * The minimum sqrt-price supported by the clmmpool program.
 * @category Constants
 */
exports.MIN_SQRT_PRICE = '4295048016';
/**
 * The denominator which the fee rate is divided on.
 * @category Constants
 */
exports.FEE_RATE_DENOMINATOR = new bn_js_1.default(1000000);
