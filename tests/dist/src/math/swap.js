"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUpperSqrtPriceFromCoinB = exports.getLowerSqrtPriceFromCoinB = exports.getUpperSqrtPriceFromCoinA = exports.getLowerSqrtPriceFromCoinA = exports.SwapUtils = void 0;
const bn_js_1 = __importDefault(require("bn.js"));
const constants_1 = require("../types/constants");
const utils_1 = require("./utils");
class SwapUtils {
    /**
     * Get the default sqrt price limit for a swap.
     *
     * @param a2b - true if the swap is A to B, false if the swap is B to A.
     * @returns The default sqrt price limit for the swap.
     */
    static getDefaultSqrtPriceLimit(a2b) {
        return new bn_js_1.default(a2b ? constants_1.MIN_SQRT_PRICE : constants_1.MAX_SQRT_PRICE);
    }
    /**
     * Get the default values for the otherAmountThreshold in a swap.
     *
     * @param amountSpecifiedIsInput - The direction of a swap
     * @returns The default values for the otherAmountThreshold parameter in a swap.
     */
    static getDefaultOtherAmountThreshold(amountSpecifiedIsInput) {
        return amountSpecifiedIsInput ? utils_1.ZERO : utils_1.U64_MAX;
    }
}
exports.SwapUtils = SwapUtils;
/**
 * Get lower sqrt price from token A.
 *
 * @param amount - The amount of tokens the user wanted to swap from.
 * @param liquidity - The liquidity of the pool.
 * @param sqrtPriceX64 - The sqrt price of the pool.
 * @returns LowesqrtPriceX64
 */
function getLowerSqrtPriceFromCoinA(amount, liquidity, sqrtPriceX64) {
    const numerator = liquidity.mul(sqrtPriceX64).shln(64);
    const denominator = liquidity.shln(64).add(amount.mul(sqrtPriceX64));
    // always round up
    return utils_1.MathUtil.divRoundUp(numerator, denominator);
}
exports.getLowerSqrtPriceFromCoinA = getLowerSqrtPriceFromCoinA;
/**
 * Get upper sqrt price from token A.
 *
 * @param amount - The amount of tokens the user wanted to swap from.
 * @param liquidity - The liquidity of the pool.
 * @param sqrtPriceX64 - The sqrt price of the pool.
 * @returns LowesqrtPriceX64
 */
function getUpperSqrtPriceFromCoinA(amount, liquidity, sqrtPriceX64) {
    const numerator = liquidity.mul(sqrtPriceX64).shln(64);
    const denominator = liquidity.shln(64).sub(amount.mul(sqrtPriceX64));
    // always round up
    return utils_1.MathUtil.divRoundUp(numerator, denominator);
}
exports.getUpperSqrtPriceFromCoinA = getUpperSqrtPriceFromCoinA;
/**
 * Get lower sqrt price from coin B.
 *
 * @param amount - The amount of coins the user wanted to swap from.
 * @param liquidity - The liquidity of the pool.
 * @param sqrtPriceX64 - The sqrt price of the pool.
 * @returns LowesqrtPriceX64
 */
function getLowerSqrtPriceFromCoinB(amount, liquidity, sqrtPriceX64) {
    // always round down(rounding up a negative number)
    return sqrtPriceX64.sub(utils_1.MathUtil.divRoundUp(amount.shln(64), liquidity));
}
exports.getLowerSqrtPriceFromCoinB = getLowerSqrtPriceFromCoinB;
/**
 * Get upper sqrt price from coin B.
 *
 * @param amount - The amount of coins the user wanted to swap from.
 * @param liquidity - The liquidity of the pool.
 * @param sqrtPriceX64 - The sqrt price of the pool.
 * @returns LowesqrtPriceX64
 */
function getUpperSqrtPriceFromCoinB(amount, liquidity, sqrtPriceX64) {
    // always round down (rounding up a negative number)
    return sqrtPriceX64.add(amount.shln(64).div(liquidity));
}
exports.getUpperSqrtPriceFromCoinB = getUpperSqrtPriceFromCoinB;
