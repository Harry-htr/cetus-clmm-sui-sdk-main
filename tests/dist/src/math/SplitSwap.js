"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SplitSwap = exports.createSplitAmountArray = exports.createSplitArray = exports.SplitUnit = void 0;
const bn_js_1 = __importDefault(require("bn.js"));
const clmmpool_1 = require("../types/clmmpool");
const clmm_1 = require("./clmm");
const swap_1 = require("./swap");
const utils_1 = require("./utils");
var SplitUnit;
(function (SplitUnit) {
    SplitUnit[SplitUnit["FIVE"] = 5] = "FIVE";
    SplitUnit[SplitUnit["TEN"] = 10] = "TEN";
    SplitUnit[SplitUnit["TWENTY"] = 20] = "TWENTY";
    SplitUnit[SplitUnit["TWENTY_FIVE"] = 25] = "TWENTY_FIVE";
    SplitUnit[SplitUnit["FIVETY"] = 50] = "FIVETY";
    SplitUnit[SplitUnit["HUNDRED"] = 100] = "HUNDRED";
})(SplitUnit = exports.SplitUnit || (exports.SplitUnit = {}));
function createSplitArray(minSplitUnit) {
    let unit;
    switch (minSplitUnit) {
        case SplitUnit.FIVE:
            unit = 5;
            break;
        case SplitUnit.TEN:
            unit = 10;
            break;
        case SplitUnit.TWENTY:
            unit = 20;
            break;
        case SplitUnit.TWENTY_FIVE:
            unit = 25;
            break;
        case SplitUnit.FIVETY:
            unit = 50;
            break;
        case SplitUnit.HUNDRED:
            unit = 100;
            break;
        default:
            unit = 1;
    }
    const length = 100 / unit + 1;
    const splitArray = new Array(length);
    for (let i = 0; i < length; i += 1) {
        splitArray[i] = i * unit;
    }
    return splitArray;
}
exports.createSplitArray = createSplitArray;
function createSplitAmountArray(amount, minSplitUnit) {
    const splitArray = createSplitArray(minSplitUnit);
    const splitAmountArray = new Array(splitArray.length);
    for (let i = 0; i < splitArray.length; i += 1) {
        splitAmountArray[i] = amount.muln(splitArray[i]).divn(100);
    }
    return splitAmountArray;
}
exports.createSplitAmountArray = createSplitAmountArray;
function updateSplitSwapResult(maxIndex, currentIndex, splitSwapResult, stepResult) {
    for (let index = currentIndex; index < maxIndex; index += 1) {
        splitSwapResult.amountInArray[index] = splitSwapResult.amountInArray[index].add(stepResult.amountIn);
        splitSwapResult.amountOutArray[index] = splitSwapResult.amountOutArray[index].add(stepResult.amountOut);
        splitSwapResult.feeAmountArray[index] = splitSwapResult.feeAmountArray[index].add(stepResult.feeAmount);
    }
    return splitSwapResult;
}
function computeSplitSwap(a2b, byAmountIn, amounts, poolData, swapTicks) {
    let currentLiquidity = new bn_js_1.default(poolData.liquidity);
    let { currentSqrtPrice } = poolData;
    let splitSwapResult = {
        amountInArray: [],
        amountOutArray: [],
        feeAmountArray: [],
        nextSqrtPriceArray: [],
        isExceed: [],
    };
    amounts.forEach(() => {
        splitSwapResult.amountInArray.push(utils_1.ZERO);
        splitSwapResult.amountOutArray.push(utils_1.ZERO);
        splitSwapResult.feeAmountArray.push(utils_1.ZERO);
        splitSwapResult.nextSqrtPriceArray.push(utils_1.ZERO);
    });
    let targetSqrtPrice;
    let signedLiquidityChange;
    const sqrtPriceLimit = swap_1.SwapUtils.getDefaultSqrtPriceLimit(a2b);
    const maxIndex = amounts.length;
    let remainerAmount = amounts[1];
    let currentIndex = 1;
    let ticks;
    if (a2b) {
        ticks = swapTicks.sort((a, b) => {
            return b.index - a.index;
        });
    }
    else {
        ticks = swapTicks.sort((a, b) => {
            return a.index - b.index;
        });
    }
    for (const tick of ticks) {
        if (a2b) {
            if (poolData.currentTickIndex < tick.index) {
                continue;
            }
        }
        else if (poolData.currentTickIndex > tick.index) {
            continue;
        }
        if (tick === null) {
            continue;
        }
        if ((a2b && sqrtPriceLimit.gt(tick.sqrtPrice)) || (!a2b && sqrtPriceLimit.lt(tick.sqrtPrice))) {
            targetSqrtPrice = sqrtPriceLimit;
        }
        else {
            targetSqrtPrice = tick.sqrtPrice;
        }
        let tempStepResult = {
            amountIn: utils_1.ZERO,
            amountOut: utils_1.ZERO,
            nextSqrtPrice: utils_1.ZERO,
            feeAmount: utils_1.ZERO,
        };
        const tempSqrtPrice = currentSqrtPrice;
        const tempLiquidity = currentLiquidity;
        let tempRemainerAmount = remainerAmount;
        let currentTempIndex = currentIndex;
        for (let i = currentIndex; i < maxIndex; i += 1) {
            const stepResult = (0, clmm_1.computeSwapStep)(currentSqrtPrice, targetSqrtPrice, currentLiquidity, remainerAmount, new bn_js_1.default(poolData.feeRate), byAmountIn);
            tempStepResult = stepResult;
            if (!stepResult.amountIn.eq(utils_1.ZERO)) {
                remainerAmount = byAmountIn
                    ? remainerAmount.sub(stepResult.amountIn.add(stepResult.feeAmount))
                    : remainerAmount.sub(stepResult.amountOut);
            }
            // splitSwapResult = updateSplitSwapResult(maxIndex, currentIndex, splitSwapResult, stepResult)
            if (remainerAmount.eq(utils_1.ZERO)) {
                splitSwapResult.amountInArray[i] = splitSwapResult.amountInArray[i].add(stepResult.amountIn);
                splitSwapResult.amountOutArray[i] = splitSwapResult.amountOutArray[i].add(stepResult.amountOut);
                splitSwapResult.feeAmountArray[i] = splitSwapResult.feeAmountArray[i].add(stepResult.feeAmount);
                // When current index remainerAmount run out, we need to update the swapResult of current index amountIn
                if (stepResult.nextSqrtPrice.eq(tick.sqrtPrice)) {
                    signedLiquidityChange = a2b ? tick.liquidityNet.mul(new bn_js_1.default(-1)) : tick.liquidityNet;
                    currentLiquidity = signedLiquidityChange.gt(utils_1.ZERO)
                        ? currentLiquidity.add(signedLiquidityChange)
                        : currentLiquidity.sub(signedLiquidityChange.abs());
                    currentSqrtPrice = tick.sqrtPrice;
                }
                else {
                    currentSqrtPrice = stepResult.nextSqrtPrice;
                }
                splitSwapResult.amountInArray[i] = splitSwapResult.amountInArray[i].add(splitSwapResult.feeAmountArray[i]);
                splitSwapResult.nextSqrtPriceArray[i] = currentSqrtPrice;
                currentLiquidity = tempLiquidity;
                currentSqrtPrice = tempSqrtPrice;
                // remainerAmount = tempRemainerAmount.add(amounts[1].muln(i - currentTempIndex + 1))
                if (i !== maxIndex - 1) {
                    remainerAmount = tempRemainerAmount.add(amounts[i + 1].sub(amounts[currentTempIndex]));
                }
                currentIndex += 1;
            }
            else {
                splitSwapResult = updateSplitSwapResult(maxIndex, i, splitSwapResult, stepResult);
                tempRemainerAmount = remainerAmount;
                currentTempIndex = currentIndex;
                break;
            }
        }
        if (currentIndex === maxIndex) {
            break;
        }
        if (tempStepResult.nextSqrtPrice.eq(tick.sqrtPrice)) {
            signedLiquidityChange = a2b ? tick.liquidityNet.mul(new bn_js_1.default(-1)) : tick.liquidityNet;
            currentLiquidity = signedLiquidityChange.gt(utils_1.ZERO)
                ? currentLiquidity.add(signedLiquidityChange)
                : currentLiquidity.sub(signedLiquidityChange.abs());
            currentSqrtPrice = tick.sqrtPrice;
        }
        else {
            currentSqrtPrice = tempStepResult.nextSqrtPrice;
        }
    }
    if (byAmountIn) {
        amounts.forEach((a, i) => {
            splitSwapResult.isExceed.push(splitSwapResult.amountInArray[i].lt(a));
        });
    }
    else {
        amounts.forEach((a, i) => {
            splitSwapResult.isExceed.push(splitSwapResult.amountOutArray[i].lt(a));
        });
    }
    return splitSwapResult;
}
class SplitSwap {
    constructor(amount, unit, clmmpool, a2b, byAmountIn, tickData) {
        this.minSplitUnit = unit;
        this.a2b = a2b;
        this.byAmountIn = byAmountIn;
        this.clmmpool = clmmpool;
        this.ticks = tickData;
        this.amountArray = [];
        this.createSplitSwapParams = this.createSplitSwapParams.bind(this);
        this.createSplitSwapParams(amount, unit);
        this.splitSwapResult = {
            amountInArray: [],
            amountOutArray: [],
            feeAmountArray: [],
            nextSqrtPriceArray: [],
            isExceed: [],
        };
        this.computeSwap = this.computeSwap.bind(this);
    }
    createSplitSwapParams(amount, unit) {
        const amountArray = createSplitAmountArray(amount, unit);
        this.amountArray = amountArray;
    }
    computeSwap() {
        const pool = (0, clmmpool_1.transClmmpoolDataWithoutTicks)(this.clmmpool);
        this.splitSwapResult = computeSplitSwap(this.a2b, this.byAmountIn, this.amountArray, pool, this.ticks);
        return this.splitSwapResult;
    }
}
exports.SplitSwap = SplitSwap;
