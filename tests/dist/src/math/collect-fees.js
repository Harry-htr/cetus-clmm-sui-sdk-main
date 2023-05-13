"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.collectFeesQuote = void 0;
/* eslint-disable camelcase */
const bn_js_1 = __importDefault(require("bn.js"));
const utils_1 = require("./utils");
function getFeeInTickRange(clmmpool, tickLower, tickUpper) {
    let fee_growth_below_a = new bn_js_1.default(0);
    let fee_growth_below_b = new bn_js_1.default(0);
    if (clmmpool.current_tick_index < tickLower.index) {
        fee_growth_below_a = utils_1.MathUtil.subUnderflowU128(new bn_js_1.default(clmmpool.fee_growth_global_a), new bn_js_1.default(tickLower.feeGrowthOutsideA));
        fee_growth_below_b = utils_1.MathUtil.subUnderflowU128(new bn_js_1.default(clmmpool.fee_growth_global_b), new bn_js_1.default(tickLower.feeGrowthOutsideB));
    }
    else {
        fee_growth_below_a = new bn_js_1.default(tickLower.feeGrowthOutsideA);
        fee_growth_below_b = new bn_js_1.default(tickLower.feeGrowthOutsideB);
    }
    let fee_growth_above_a = new bn_js_1.default(0);
    let fee_growth_above_b = new bn_js_1.default(0);
    if (clmmpool.current_tick_index < tickUpper.index) {
        fee_growth_above_a = new bn_js_1.default(tickUpper.feeGrowthOutsideA);
        fee_growth_above_b = new bn_js_1.default(tickUpper.feeGrowthOutsideB);
    }
    else {
        fee_growth_above_a = utils_1.MathUtil.subUnderflowU128(new bn_js_1.default(clmmpool.fee_growth_global_a), new bn_js_1.default(tickUpper.feeGrowthOutsideA));
        fee_growth_above_b = utils_1.MathUtil.subUnderflowU128(new bn_js_1.default(clmmpool.fee_growth_global_b), new bn_js_1.default(tickUpper.feeGrowthOutsideB));
    }
    const fee_growth_inside_a = utils_1.MathUtil.subUnderflowU128(utils_1.MathUtil.subUnderflowU128(new bn_js_1.default(clmmpool.fee_growth_global_a), fee_growth_below_a), fee_growth_above_a);
    const fee_growth_inside_b = utils_1.MathUtil.subUnderflowU128(utils_1.MathUtil.subUnderflowU128(new bn_js_1.default(clmmpool.fee_growth_global_b), fee_growth_below_b), fee_growth_above_b);
    // console.log('fee_growth_inside_a: ', fee_growth_inside_a.toString())
    // console.log('fee_growth_inside_b: ', fee_growth_inside_b.toString())
    return { fee_growth_inside_a, fee_growth_inside_b };
}
function updateFees(position, fee_growth_inside_a, fee_growth_inside_b) {
    const growth_delta_a = utils_1.MathUtil.subUnderflowU128(fee_growth_inside_a, new bn_js_1.default(position.fee_growth_inside_a));
    const fee_delta_a = new bn_js_1.default(position.liquidity).mul(growth_delta_a).shrn(64);
    const growth_delta_b = utils_1.MathUtil.subUnderflowU128(fee_growth_inside_b, new bn_js_1.default(position.fee_growth_inside_b));
    const fee_delta_b = new bn_js_1.default(position.liquidity).mul(growth_delta_b).shrn(64);
    // console.log('updateFees: ', { fee_delta_a, fee_delta_b })
    const fee_owed_a = new bn_js_1.default(position.fee_owed_a).add(fee_delta_a);
    const fee_owed_b = new bn_js_1.default(position.fee_owed_b).add(fee_delta_b);
    return {
        feeOwedA: fee_owed_a,
        feeOwedB: fee_owed_b,
    };
}
/**
 * Get a fee quote on the outstanding fees owed to a position.
 *
 * @category CollectFeesQuoteParam
 * @param param A collection of fetched Clmmpool accounts to faciliate the quote.
 * @returns A quote object containing the fees owed for each token in the pool.
 */
function collectFeesQuote(param) {
    // Calculate the fee growths inside the position
    const { fee_growth_inside_a, fee_growth_inside_b } = getFeeInTickRange(param.clmmpool, param.tickLower, param.tickUpper);
    // Calculate the updated fees owed
    return updateFees(param.position, fee_growth_inside_a, fee_growth_inside_b);
}
exports.collectFeesQuote = collectFeesQuote;
