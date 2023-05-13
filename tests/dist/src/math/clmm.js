"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClmmPoolUtil = exports.estimateLiquidityForCoinB = exports.estimateLiquidityForCoinA = exports.computeSwap = exports.computeSwapStep = exports.getDeltaDownFromOutput = exports.getDeltaUpFromInput = exports.getNextSqrtPriceFromOutput = exports.getNextSqrtPriceFromInput = exports.getNextSqrtPriceBDown = exports.getNextSqrtPriceAUp = exports.getDeltaB = exports.getDeltaA = exports.toCoinAmount = void 0;
const bn_js_1 = __importDefault(require("bn.js"));
const errors_1 = require("../errors/errors");
const constants_1 = require("../types/constants");
const decimal_1 = __importDefault(require("../utils/decimal"));
const swap_1 = require("./swap");
const tick_1 = require("./tick");
const utils_1 = require("./utils");
function toCoinAmount(a, b) {
    return {
        coinA: new bn_js_1.default(a.toString()),
        coinB: new bn_js_1.default(b.toString()),
    };
}
exports.toCoinAmount = toCoinAmount;
/**
 * Get the amount A delta about two prices, for give amount of liquidity.
 * `delta_a = (liquidity * delta_sqrt_price) / sqrt_price_upper * sqrt_price_lower)`
 *
 * @param sqrtPrice0 - A sqrt price
 * @param sqrtPrice1 - Another sqrt price
 * @param liquidity - The amount of usable liquidity
 * @param roundUp - Whether to round the amount up or down
 * @returns
 */
function getDeltaA(sqrtPrice0, sqrtPrice1, liquidity, roundUp) {
    const sqrtPriceDiff = sqrtPrice0.gt(sqrtPrice1) ? sqrtPrice0.sub(sqrtPrice1) : sqrtPrice1.sub(sqrtPrice0);
    const numberator = liquidity.mul(sqrtPriceDiff).shln(64);
    const denomminator = sqrtPrice0.mul(sqrtPrice1);
    const quotient = numberator.div(denomminator);
    const remainder = numberator.mod(denomminator);
    const result = roundUp && !remainder.eq(utils_1.ZERO) ? quotient.add(new bn_js_1.default(1)) : quotient;
    // if (MathUtil.isOverflow(result, 64)) {
    //   throw new ClmmpoolsError('Result large than u64 max', MathErrorCode.IntegerDowncastOverflow)
    // }
    return result;
}
exports.getDeltaA = getDeltaA;
/**
 * Get the amount B delta about two prices, for give amount of liquidity.
 * `delta_a = (liquidity * delta_sqrt_price) / sqrt_price_upper * sqrt_price_lower)`
 *
 * @param sqrtPrice0 - A sqrt price
 * @param sqrtPrice1 - Another sqrt price
 * @param liquidity - The amount of usable liquidity
 * @param roundUp - Whether to round the amount up or down
 * @returns
 */
function getDeltaB(sqrtPrice0, sqrtPrice1, liquidity, roundUp) {
    const sqrtPriceDiff = sqrtPrice0.gt(sqrtPrice1) ? sqrtPrice0.sub(sqrtPrice1) : sqrtPrice1.sub(sqrtPrice0);
    if (liquidity.eq(utils_1.ZERO) || sqrtPriceDiff.eq(utils_1.ZERO)) {
        return utils_1.ZERO;
    }
    const p = liquidity.mul(sqrtPriceDiff);
    const shoudRoundUp = roundUp && p.and(utils_1.U64_MAX).gt(utils_1.ZERO);
    const result = shoudRoundUp ? p.shrn(64).add(utils_1.ONE) : p.shrn(64);
    if (utils_1.MathUtil.isOverflow(result, 64)) {
        throw new errors_1.ClmmpoolsError('Result large than u64 max', errors_1.MathErrorCode.IntegerDowncastOverflow);
    }
    return result;
}
exports.getDeltaB = getDeltaB;
/**
 * Get the next sqrt price from give a delta of token_a.
 * `new_sqrt_price = (sqrt_price * liquidity) / (liquidity +/- amount * sqrt_price)`
 *
 * @param sqrtPrice - The start sqrt price
 * @param liquidity - The amount of usable liquidity
 * @param amount - The amount of token_a
 * @param byAmountIn - Weather to fixed input
 */
function getNextSqrtPriceAUp(sqrtPrice, liquidity, amount, byAmountIn) {
    if (amount.eq(utils_1.ZERO)) {
        return sqrtPrice;
    }
    const numberator = utils_1.MathUtil.checkMulShiftLeft(sqrtPrice, liquidity, 64, 256);
    const liquidityShl64 = liquidity.shln(64);
    const product = utils_1.MathUtil.checkMul(sqrtPrice, amount, 256);
    if (!byAmountIn && liquidityShl64.lte(product)) {
        throw new errors_1.ClmmpoolsError('getNextSqrtPriceAUp - Unable to divide liquidityShl64 by product', errors_1.MathErrorCode.DivideByZero);
    }
    const nextSqrtPrice = byAmountIn
        ? utils_1.MathUtil.checkDivRoundUpIf(numberator, liquidityShl64.add(product), true)
        : utils_1.MathUtil.checkDivRoundUpIf(numberator, liquidityShl64.sub(product), true);
    if (nextSqrtPrice.lt(new bn_js_1.default(constants_1.MIN_SQRT_PRICE))) {
        throw new errors_1.ClmmpoolsError('getNextSqrtPriceAUp - Next sqrt price less than min sqrt price', errors_1.CoinErrorCode.CoinAmountMinSubceeded);
    }
    if (nextSqrtPrice.gt(new bn_js_1.default(constants_1.MAX_SQRT_PRICE))) {
        throw new errors_1.ClmmpoolsError('getNextSqrtPriceAUp - Next sqrt price greater than max sqrt price', errors_1.CoinErrorCode.CoinAmountMaxExceeded);
    }
    return nextSqrtPrice;
}
exports.getNextSqrtPriceAUp = getNextSqrtPriceAUp;
/**
 * Get the next sqrt price from give a delta of token_b.
 * `new_sqrt_price = (sqrt_price +(delta_b / liquidity)`
 *
 * @param sqrtPrice - The start sqrt price
 * @param liquidity - The amount of usable liquidity
 * @param amount - The amount of token_a
 * @param byAmountIn - Weather to fixed input
 */
function getNextSqrtPriceBDown(sqrtPrice, liquidity, amount, byAmountIn) {
    const deltaSqrtPrice = utils_1.MathUtil.checkDivRoundUpIf(amount.shln(64), liquidity, !byAmountIn);
    const nextSqrtPrice = byAmountIn ? sqrtPrice.add(deltaSqrtPrice) : sqrtPrice.sub(deltaSqrtPrice);
    if (nextSqrtPrice.lt(new bn_js_1.default(constants_1.MIN_SQRT_PRICE)) || nextSqrtPrice.gt(new bn_js_1.default(constants_1.MAX_SQRT_PRICE))) {
        throw new errors_1.ClmmpoolsError('getNextSqrtPriceAUp - Next sqrt price out of bounds', errors_1.CoinErrorCode.SqrtPriceOutOfBounds);
    }
    return nextSqrtPrice;
}
exports.getNextSqrtPriceBDown = getNextSqrtPriceBDown;
/**
 * Get next sqrt price from input parameter.
 *
 * @param sqrtPrice
 * @param liquidity
 * @param amount
 * @param aToB
 * @returns
 */
function getNextSqrtPriceFromInput(sqrtPrice, liquidity, amount, aToB) {
    return aToB ? getNextSqrtPriceAUp(sqrtPrice, liquidity, amount, true) : getNextSqrtPriceBDown(sqrtPrice, liquidity, amount, true);
}
exports.getNextSqrtPriceFromInput = getNextSqrtPriceFromInput;
/**
 * Get the next sqrt price from output parameters.
 *
 * @param sqrtPrice
 * @param liquidity
 * @param amount
 * @param a2b
 * @returns
 */
function getNextSqrtPriceFromOutput(sqrtPrice, liquidity, amount, a2b) {
    return a2b ? getNextSqrtPriceBDown(sqrtPrice, liquidity, amount, false) : getNextSqrtPriceAUp(sqrtPrice, liquidity, amount, false);
}
exports.getNextSqrtPriceFromOutput = getNextSqrtPriceFromOutput;
/**
 * Get the amount of delta_a or delta_b from input parameters, and round up result.
 *
 * @param currentSqrtPrice
 * @param targetSqrtPrice
 * @param liquidity
 * @param a2b
 * @returns
 */
function getDeltaUpFromInput(currentSqrtPrice, targetSqrtPrice, liquidity, a2b) {
    const sqrtPriceDiff = currentSqrtPrice.gt(targetSqrtPrice) ? currentSqrtPrice.sub(targetSqrtPrice) : targetSqrtPrice.sub(currentSqrtPrice);
    if (liquidity.lte(utils_1.ZERO) || sqrtPriceDiff.eq(utils_1.ZERO)) {
        return utils_1.ZERO;
    }
    let result;
    if (a2b) {
        const numberator = new bn_js_1.default(liquidity).mul(new bn_js_1.default(sqrtPriceDiff)).shln(64);
        const denomminator = targetSqrtPrice.mul(currentSqrtPrice);
        const quotient = numberator.div(denomminator);
        const remainder = numberator.mod(denomminator);
        result = !remainder.eq(utils_1.ZERO) ? quotient.add(utils_1.ONE) : quotient;
    }
    else {
        const product = new bn_js_1.default(liquidity).mul(new bn_js_1.default(sqrtPriceDiff));
        const shoudRoundUp = product.and(utils_1.U64_MAX).gt(utils_1.ZERO);
        result = shoudRoundUp ? product.shrn(64).add(utils_1.ONE) : product.shrn(64);
    }
    return result;
}
exports.getDeltaUpFromInput = getDeltaUpFromInput;
/**
 * Get the amount of delta_a or delta_b from output parameters, and round down result.
 *
 * @param currentSqrtPrice
 * @param targetSqrtPrice
 * @param liquidity
 * @param a2b
 * @returns
 */
function getDeltaDownFromOutput(currentSqrtPrice, targetSqrtPrice, liquidity, a2b) {
    const sqrtPriceDiff = currentSqrtPrice.gt(targetSqrtPrice) ? currentSqrtPrice.sub(targetSqrtPrice) : targetSqrtPrice.sub(currentSqrtPrice);
    if (liquidity.lte(utils_1.ZERO) || sqrtPriceDiff.eq(utils_1.ZERO)) {
        return utils_1.ZERO;
    }
    let result;
    if (a2b) {
        const product = liquidity.mul(sqrtPriceDiff);
        // const shoudRoundUp = product.and(U64_MAX).gt(ZERO)
        // result = shoudRoundUp ? product.shrn(64).add(ONE) : product.shrn(64)
        result = product.shrn(64);
    }
    else {
        const numberator = liquidity.mul(sqrtPriceDiff).shln(64);
        const denomminator = targetSqrtPrice.mul(currentSqrtPrice);
        result = numberator.div(denomminator);
    }
    return result;
}
exports.getDeltaDownFromOutput = getDeltaDownFromOutput;
/**
 * Simulate per step of swap on every tick.
 *
 * @param currentSqrtPrice
 * @param targetSqrtPrice
 * @param liquidity
 * @param amount
 * @param feeRate
 * @param byAmountIn
 * @returns
 */
function computeSwapStep(currentSqrtPrice, targetSqrtPrice, liquidity, amount, feeRate, byAmountIn) {
    if (liquidity === utils_1.ZERO) {
        return {
            amountIn: utils_1.ZERO,
            amountOut: utils_1.ZERO,
            nextSqrtPrice: targetSqrtPrice,
            feeAmount: utils_1.ZERO,
        };
    }
    const a2b = currentSqrtPrice.gte(targetSqrtPrice);
    let amountIn;
    let amountOut;
    let nextSqrtPrice;
    let feeAmount;
    if (byAmountIn) {
        const amountRemain = utils_1.MathUtil.checkMulDivFloor(amount, utils_1.MathUtil.checkUnsignedSub(constants_1.FEE_RATE_DENOMINATOR, feeRate), constants_1.FEE_RATE_DENOMINATOR, 64);
        const maxAmountIn = getDeltaUpFromInput(currentSqrtPrice, targetSqrtPrice, liquidity, a2b);
        if (maxAmountIn.gt(amountRemain)) {
            amountIn = amountRemain;
            feeAmount = utils_1.MathUtil.checkUnsignedSub(amount, amountRemain);
            nextSqrtPrice = getNextSqrtPriceFromInput(currentSqrtPrice, liquidity, amountRemain, a2b);
        }
        else {
            amountIn = maxAmountIn;
            feeAmount = utils_1.MathUtil.checkMulDivCeil(amountIn, feeRate, constants_1.FEE_RATE_DENOMINATOR.sub(feeRate), 64);
            nextSqrtPrice = targetSqrtPrice;
        }
        amountOut = getDeltaDownFromOutput(currentSqrtPrice, nextSqrtPrice, liquidity, a2b);
    }
    else {
        const maxAmountOut = getDeltaDownFromOutput(currentSqrtPrice, targetSqrtPrice, liquidity, a2b);
        if (maxAmountOut.gt(amount)) {
            amountOut = amount;
            nextSqrtPrice = getNextSqrtPriceFromOutput(currentSqrtPrice, liquidity, amount, a2b);
        }
        else {
            amountOut = maxAmountOut;
            nextSqrtPrice = targetSqrtPrice;
        }
        amountIn = getDeltaUpFromInput(currentSqrtPrice, nextSqrtPrice, liquidity, a2b);
        feeAmount = utils_1.MathUtil.checkMulDivCeil(amountIn, feeRate, constants_1.FEE_RATE_DENOMINATOR.sub(feeRate), 64);
    }
    return {
        amountIn,
        amountOut,
        nextSqrtPrice,
        feeAmount,
    };
}
exports.computeSwapStep = computeSwapStep;
/**
 * Simulate swap by imput lots of ticks.
 * @param aToB
 * @param byAmountIn
 * @param amount
 * @param poolData
 * @param swapTicks
 * @returns
 */
function computeSwap(aToB, byAmountIn, amount, poolData, swapTicks) {
    let remainerAmount = amount;
    let currentLiquidity = poolData.liquidity;
    let { currentSqrtPrice } = poolData;
    const swapResult = {
        amountIn: utils_1.ZERO,
        amountOut: utils_1.ZERO,
        feeAmount: utils_1.ZERO,
        refAmount: utils_1.ZERO,
        nextSqrtPrice: utils_1.ZERO,
        crossTickNum: 0,
    };
    let targetSqrtPrice;
    let signedLiquidityChange;
    const sqrtPriceLimit = swap_1.SwapUtils.getDefaultSqrtPriceLimit(aToB);
    for (const tick of swapTicks) {
        if (aToB && poolData.currentTickIndex < tick.index) {
            continue;
        }
        if (!aToB && poolData.currentTickIndex > tick.index) {
            continue;
        }
        if (tick === null) {
            continue;
        }
        if ((aToB && sqrtPriceLimit.gt(tick.sqrtPrice)) || (!aToB && sqrtPriceLimit.lt(tick.sqrtPrice))) {
            targetSqrtPrice = sqrtPriceLimit;
        }
        else {
            targetSqrtPrice = tick.sqrtPrice;
        }
        const stepResult = computeSwapStep(currentSqrtPrice, targetSqrtPrice, currentLiquidity, remainerAmount, poolData.feeRate, byAmountIn);
        if (!stepResult.amountIn.eq(utils_1.ZERO)) {
            remainerAmount = byAmountIn
                ? remainerAmount.sub(stepResult.amountIn.add(stepResult.feeAmount))
                : remainerAmount.sub(stepResult.amountOut);
        }
        swapResult.amountIn = swapResult.amountIn.add(stepResult.amountIn);
        swapResult.amountOut = swapResult.amountOut.add(stepResult.amountOut);
        swapResult.feeAmount = swapResult.feeAmount.add(stepResult.feeAmount);
        if (stepResult.nextSqrtPrice.eq(tick.sqrtPrice)) {
            signedLiquidityChange = aToB ? tick.liquidityNet.mul(new bn_js_1.default(-1)) : tick.liquidityNet;
            currentLiquidity = signedLiquidityChange.gt(utils_1.ZERO)
                ? currentLiquidity.add(signedLiquidityChange)
                : currentLiquidity.sub(signedLiquidityChange.abs());
            currentSqrtPrice = tick.sqrtPrice;
        }
        else {
            currentSqrtPrice = stepResult.nextSqrtPrice;
        }
        swapResult.crossTickNum += 1;
        if (remainerAmount.eq(utils_1.ZERO)) {
            break;
        }
    }
    swapResult.amountIn = swapResult.amountIn.add(swapResult.feeAmount);
    swapResult.nextSqrtPrice = currentSqrtPrice;
    return swapResult;
}
exports.computeSwap = computeSwap;
/**
 * Estimate liquidity for coin A
 * @param sqrtPriceX - coin A sqrtprice
 * @param sqrtPriceY - coin B sqrtprice
 * @param coinAmount - token amount
 * @return
 */
function estimateLiquidityForCoinA(sqrtPriceX, sqrtPriceY, coinAmount) {
    const lowerSqrtPriceX64 = bn_js_1.default.min(sqrtPriceX, sqrtPriceY);
    const upperSqrtPriceX64 = bn_js_1.default.max(sqrtPriceX, sqrtPriceY);
    const num = utils_1.MathUtil.fromX64_BN(coinAmount.mul(upperSqrtPriceX64).mul(lowerSqrtPriceX64));
    const dem = upperSqrtPriceX64.sub(lowerSqrtPriceX64);
    return num.div(dem);
}
exports.estimateLiquidityForCoinA = estimateLiquidityForCoinA;
/**
 * Estimate liquidity for coin B
 * @param sqrtPriceX - coin A sqrtprice
 * @param sqrtPriceY - coin B sqrtprice
 * @param coinAmount - token amount
 * @return
 */
function estimateLiquidityForCoinB(sqrtPriceX, sqrtPriceY, coinAmount) {
    const lowerSqrtPriceX64 = bn_js_1.default.min(sqrtPriceX, sqrtPriceY);
    const upperSqrtPriceX64 = bn_js_1.default.max(sqrtPriceX, sqrtPriceY);
    const delta = upperSqrtPriceX64.sub(lowerSqrtPriceX64);
    return coinAmount.shln(64).div(delta);
}
exports.estimateLiquidityForCoinB = estimateLiquidityForCoinB;
class ClmmPoolUtil {
    /**
     * Update fee rate.
     * @param clmm - clmmpool data
     * @param feeAmount - fee Amount
     * @param refRate - ref rate
     * @param protocolFeeRate - protocol fee rate
     * @param iscoinA - is token A
     * @returns percentage
     */
    static updateFeeRate(clmm, feeAmount, refRate, protocolFeeRate, iscoinA) {
        const protocolFee = utils_1.MathUtil.checkMulDivCeil(feeAmount, new bn_js_1.default(protocolFeeRate), constants_1.FEE_RATE_DENOMINATOR, 64);
        const refFee = refRate === 0 ? utils_1.ZERO : utils_1.MathUtil.checkMulDivFloor(feeAmount, new bn_js_1.default(refRate), constants_1.FEE_RATE_DENOMINATOR, 64);
        const poolFee = feeAmount.mul(protocolFee).mul(refFee);
        if (iscoinA) {
            clmm.feeProtocolCoinA = clmm.feeProtocolCoinA.add(protocolFee);
        }
        else {
            clmm.feeProtocolCoinB = clmm.feeProtocolCoinB.add(protocolFee);
        }
        if (poolFee.eq(utils_1.ZERO) || clmm.liquidity.eq(utils_1.ZERO)) {
            return { refFee, clmm };
        }
        const growthFee = poolFee.shln(64).div(clmm.liquidity);
        if (iscoinA) {
            clmm.feeGrowthGlobalA = clmm.feeGrowthGlobalA.add(growthFee);
        }
        else {
            clmm.feeGrowthGlobalB = clmm.feeGrowthGlobalB.add(growthFee);
        }
        return { refFee, clmm };
    }
    /**
     * Get token amount fron liquidity.
     * @param liquidity - liquidity
     * @param curSqrtPrice - Pool current sqrt price
     * @param lowerPrice - lower price
     * @param upperPrice - upper price
     * @param roundUp - is round up
     * @returns
     */
    static getCoinAmountFromLiquidity(liquidity, curSqrtPrice, lowerPrice, upperPrice, roundUp) {
        const liq = new decimal_1.default(liquidity.toString());
        const curSqrtPriceStr = new decimal_1.default(curSqrtPrice.toString());
        const lowerPriceStr = new decimal_1.default(lowerPrice.toString());
        const upperPriceStr = new decimal_1.default(upperPrice.toString());
        let coinA;
        let coinB;
        if (curSqrtPrice.lt(lowerPrice)) {
            coinA = utils_1.MathUtil.toX64_Decimal(liq).mul(upperPriceStr.sub(lowerPriceStr)).div(lowerPriceStr.mul(upperPriceStr));
            coinB = new decimal_1.default(0);
        }
        else if (curSqrtPrice.lt(upperPrice)) {
            coinA = utils_1.MathUtil.toX64_Decimal(liq).mul(upperPriceStr.sub(curSqrtPriceStr)).div(curSqrtPriceStr.mul(upperPriceStr));
            coinB = utils_1.MathUtil.fromX64_Decimal(liq.mul(curSqrtPriceStr.sub(lowerPriceStr)));
        }
        else {
            coinA = new decimal_1.default(0);
            coinB = utils_1.MathUtil.fromX64_Decimal(liq.mul(upperPriceStr.sub(lowerPriceStr)));
        }
        if (roundUp) {
            return {
                coinA: new bn_js_1.default(coinA.ceil().toString()),
                coinB: new bn_js_1.default(coinB.ceil().toString()),
            };
        }
        return {
            coinA: new bn_js_1.default(coinA.floor().toString()),
            coinB: new bn_js_1.default(coinB.floor().toString()),
        };
    }
    /**
     * Estimate liquidity from token amounts
     * @param curSqrtPrice - current sqrt price.
     * @param lowerTick - lower tick
     * @param upperTick - upper tick
     * @param tokenAmount - token amount
     * @return
     */
    static estimateLiquidityFromcoinAmounts(curSqrtPrice, lowerTick, upperTick, tokenAmount) {
        if (lowerTick > upperTick) {
            throw new Error('lower tick cannot be greater than lower tick');
        }
        const currTick = tick_1.TickMath.sqrtPriceX64ToTickIndex(curSqrtPrice);
        const lowerSqrtPrice = tick_1.TickMath.tickIndexToSqrtPriceX64(lowerTick);
        const upperSqrtPrice = tick_1.TickMath.tickIndexToSqrtPriceX64(upperTick);
        if (currTick < lowerTick) {
            return estimateLiquidityForCoinA(lowerSqrtPrice, upperSqrtPrice, tokenAmount.coinA);
        }
        if (currTick >= upperTick) {
            return estimateLiquidityForCoinB(upperSqrtPrice, lowerSqrtPrice, tokenAmount.coinB);
        }
        const estimateLiquidityAmountA = estimateLiquidityForCoinA(curSqrtPrice, upperSqrtPrice, tokenAmount.coinA);
        const estimateLiquidityAmountB = estimateLiquidityForCoinB(curSqrtPrice, lowerSqrtPrice, tokenAmount.coinB);
        return bn_js_1.default.min(estimateLiquidityAmountA, estimateLiquidityAmountB);
    }
    /**
     * Estimate liquidity and token amount from one amounts
     * @param lowerTick - lower tick
     * @param upperTick - upper tick
     * @param coinAmount - token amount
     * @param iscoinA - is token A
     * @param roundUp - is round up
     * @param isIncrease - is increase
     * @param slippage - slippage percentage
     * @param curSqrtPrice - current sqrt price.
     * @return IncreaseLiquidityInput
     */
    static estLiquidityAndcoinAmountFromOneAmounts(lowerTick, upperTick, coinAmount, iscoinA, roundUp, slippage, curSqrtPrice) {
        const currentTick = tick_1.TickMath.sqrtPriceX64ToTickIndex(curSqrtPrice);
        const lowerSqrtPrice = tick_1.TickMath.tickIndexToSqrtPriceX64(lowerTick);
        const upperSqrtPrice = tick_1.TickMath.tickIndexToSqrtPriceX64(upperTick);
        let liquidity;
        if (currentTick <= lowerTick) {
            if (!iscoinA) {
                throw new Error('lower tick cannot calculate liquidity by coinB');
            }
            liquidity = estimateLiquidityForCoinA(lowerSqrtPrice, upperSqrtPrice, coinAmount);
        }
        else if (currentTick >= upperTick) {
            if (iscoinA) {
                throw new Error('upper tick cannot calculate liquidity by coinA');
            }
            liquidity = estimateLiquidityForCoinB(upperSqrtPrice, lowerSqrtPrice, coinAmount);
        }
        else if (iscoinA) {
            liquidity = estimateLiquidityForCoinA(curSqrtPrice, upperSqrtPrice, coinAmount);
        }
        else {
            liquidity = estimateLiquidityForCoinB(curSqrtPrice, lowerSqrtPrice, coinAmount);
        }
        const coinAmounts = ClmmPoolUtil.getCoinAmountFromLiquidity(liquidity, curSqrtPrice, lowerSqrtPrice, upperSqrtPrice, roundUp);
        const tokenMaxA = coinAmounts.coinA.mul(new bn_js_1.default(1 + slippage));
        const tokenMaxB = coinAmounts.coinB.mul(new bn_js_1.default(1 + slippage));
        return {
            tokenMaxA,
            tokenMaxB,
            liquidityAmount: liquidity,
        };
    }
}
exports.ClmmPoolUtil = ClmmPoolUtil;
