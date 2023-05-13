"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.estPositionAPRWithMultiMethod = exports.estPositionAPRWithDeltaMethod = exports.estPoolAPR = void 0;
/* eslint-disable camelcase */
const bn_js_1 = __importDefault(require("bn.js"));
const decimal_js_1 = __importDefault(require("decimal.js"));
const tick_1 = require("./tick");
const utils_1 = require("./utils");
const D365 = new bn_js_1.default(365);
const H24 = new bn_js_1.default(24);
const S3600 = new bn_js_1.default(3600);
const B05 = new bn_js_1.default(0.5);
function estPoolAPR(preBlockReward, rewardPrice, totalTradingFee, totalLiquidityValue) {
    const annualRate = D365.mul(H24).mul(S3600).mul(B05);
    const APR = annualRate.mul(preBlockReward.mul(rewardPrice).add(totalTradingFee).div(totalLiquidityValue));
    return APR;
}
exports.estPoolAPR = estPoolAPR;
function calculatePoolValidTVL(amountA, amountB, decimalsA, decimalsB, coinAPrice, coinBPrice) {
    // console.log({
    //   coinAmountsA: amountA.toString(),
    //   coinAmountsB: amountB.toString(),
    // })
    const poolValidAmountA = new decimal_js_1.default(amountA.toString()).div(new decimal_js_1.default(Math.pow(10, decimalsA)));
    const poolValidAmountB = new decimal_js_1.default(amountB.toString()).div(new decimal_js_1.default(Math.pow(10, decimalsB)));
    // console.log(poolValidAmountA, poolValidAmountB)
    const TVL = poolValidAmountA.mul(coinAPrice).add(poolValidAmountB.mul(coinBPrice));
    return TVL;
}
function estPositionAPRWithDeltaMethod(currentTickIndex, lowerTickIndex, upperTickIndex, currentSqrtPriceX64, poolLiquidity, decimalsA, decimalsB, decimalsRewarder0, decimalsRewarder1, decimalsRewarder2, feeRate, amountA_str, amountB_str, poolAmountA, poolAmountB, swapVolume_str, poolRewarders0_str, poolRewarders1_str, poolRewarders2_str, coinAPrice_str, coinBPrice_str, rewarder0Price_str, rewarder1Price_str, rewarder2Price_str) {
    const amountA = new decimal_js_1.default(amountA_str);
    const amountB = new decimal_js_1.default(amountB_str);
    const swapVolume = new decimal_js_1.default(swapVolume_str);
    const poolRewarders0 = new decimal_js_1.default(poolRewarders0_str);
    const poolRewarders1 = new decimal_js_1.default(poolRewarders1_str);
    const poolRewarders2 = new decimal_js_1.default(poolRewarders2_str);
    const coinAPrice = new decimal_js_1.default(coinAPrice_str);
    const coinBPrice = new decimal_js_1.default(coinBPrice_str);
    const rewarder0Price = new decimal_js_1.default(rewarder0Price_str);
    const rewarder1Price = new decimal_js_1.default(rewarder1Price_str);
    const rewarder2Price = new decimal_js_1.default(rewarder2Price_str);
    const lowerSqrtPriceX64 = tick_1.TickMath.tickIndexToSqrtPriceX64(lowerTickIndex);
    const upperSqrtPriceX64 = tick_1.TickMath.tickIndexToSqrtPriceX64(upperTickIndex);
    const lowerSqrtPrice_d = utils_1.MathUtil.toX64_Decimal(utils_1.MathUtil.fromX64(lowerSqrtPriceX64)).round();
    const upperSqrtPrice_d = utils_1.MathUtil.toX64_Decimal(utils_1.MathUtil.fromX64(upperSqrtPriceX64)).round();
    const currentSqrtPrice_d = utils_1.MathUtil.toX64_Decimal(utils_1.MathUtil.fromX64(currentSqrtPriceX64)).round();
    let deltaLiquidity;
    const liquidityAmount0 = amountA
        .mul(new decimal_js_1.default(Math.pow(10, decimalsA)))
        .mul(upperSqrtPrice_d.mul(lowerSqrtPrice_d))
        .div(upperSqrtPrice_d.sub(lowerSqrtPrice_d))
        .round();
    const liquidityAmount1 = amountB
        .mul(new decimal_js_1.default(Math.pow(10, decimalsB)))
        .div(upperSqrtPrice_d.sub(lowerSqrtPrice_d))
        .round();
    if (currentTickIndex < lowerTickIndex) {
        deltaLiquidity = liquidityAmount0;
    }
    else if (currentTickIndex > upperTickIndex) {
        deltaLiquidity = liquidityAmount1;
    }
    else {
        deltaLiquidity = decimal_js_1.default.min(liquidityAmount0, liquidityAmount1);
    }
    const deltaY = deltaLiquidity.mul(currentSqrtPrice_d.sub(lowerSqrtPrice_d));
    const deltaX = deltaLiquidity.mul(upperSqrtPrice_d.sub(currentSqrtPrice_d)).div(currentSqrtPrice_d.mul(upperSqrtPrice_d));
    const posValidTVL = deltaX
        .div(new decimal_js_1.default(Math.pow(10, decimalsA)))
        .mul(coinAPrice)
        .add(deltaY.div(new decimal_js_1.default(Math.pow(10, decimalsB)).mul(coinBPrice)));
    const poolValidTVL = calculatePoolValidTVL(poolAmountA, poolAmountB, decimalsA, decimalsB, coinAPrice, coinBPrice);
    const posValidRate = posValidTVL.div(poolValidTVL);
    const feeAPR = deltaLiquidity.eq(new decimal_js_1.default(0))
        ? new decimal_js_1.default(0)
        : new decimal_js_1.default(feeRate / 10000)
            .mul(swapVolume)
            .mul(new decimal_js_1.default(deltaLiquidity.toString()).div(new decimal_js_1.default(poolLiquidity.toString()).add(new decimal_js_1.default(deltaLiquidity.toString()))))
            .div(posValidTVL);
    const aprCoe = posValidRate.eq(new decimal_js_1.default(0)) ? new decimal_js_1.default(0) : posValidRate.mul(new decimal_js_1.default(36500 / 7)).div(posValidTVL);
    const posRewarder0APR = poolRewarders0
        .div(new decimal_js_1.default(Math.pow(10, decimalsRewarder0)))
        .mul(rewarder0Price)
        .mul(aprCoe);
    const posRewarder1APR = poolRewarders1
        .div(new decimal_js_1.default(Math.pow(10, decimalsRewarder1)))
        .mul(rewarder1Price)
        .mul(aprCoe);
    const posRewarder2APR = poolRewarders2
        .div(new decimal_js_1.default(Math.pow(10, decimalsRewarder2)))
        .mul(rewarder2Price)
        .mul(aprCoe);
    return {
        feeAPR,
        posRewarder0APR,
        posRewarder1APR,
        posRewarder2APR,
    };
}
exports.estPositionAPRWithDeltaMethod = estPositionAPRWithDeltaMethod;
function estPositionAPRWithMultiMethod(lowerUserPrice, upperUserPrice, lowerHistPrice, upperHistPrice) {
    const retroLower = Math.max(lowerUserPrice, lowerHistPrice);
    const retroUpper = Math.min(upperUserPrice, upperHistPrice);
    const retroRange = retroUpper - retroLower;
    const userRange = upperUserPrice - lowerUserPrice;
    const histRange = upperHistPrice - lowerHistPrice;
    const userRange_d = new decimal_js_1.default(userRange.toString());
    const histRange_d = new decimal_js_1.default(histRange.toString());
    const retroRange_d = new decimal_js_1.default(retroRange.toString());
    let m = new decimal_js_1.default('0');
    if (retroRange < 0) {
        m = new decimal_js_1.default('0');
    }
    else if (userRange === retroRange) {
        m = histRange_d.div(retroRange_d);
    }
    else if (histRange === retroRange) {
        m = retroRange_d.div(userRange_d);
    }
    else {
        m = retroRange_d.mul(retroRange_d).div(histRange_d).div(userRange_d);
    }
    return m;
}
exports.estPositionAPRWithMultiMethod = estPositionAPRWithMultiMethod;
