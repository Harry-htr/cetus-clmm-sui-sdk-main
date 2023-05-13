"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.newBits = exports.transClmmpoolDataWithoutTicks = void 0;
/* eslint-disable camelcase */
const bn_js_1 = __importDefault(require("bn.js"));
const utils_1 = require("../math/utils");
function transClmmpoolDataWithoutTicks(pool) {
    const poolData = {
        coinA: pool.coinTypeA,
        coinB: pool.coinTypeB,
        currentSqrtPrice: new bn_js_1.default(pool.current_sqrt_price),
        currentTickIndex: pool.current_tick_index,
        feeGrowthGlobalA: new bn_js_1.default(pool.fee_growth_global_a),
        feeGrowthGlobalB: new bn_js_1.default(pool.fee_growth_global_b),
        feeProtocolCoinA: new bn_js_1.default(pool.fee_protocol_coin_a),
        feeProtocolCoinB: new bn_js_1.default(pool.fee_protocol_coin_b),
        feeRate: new bn_js_1.default(pool.fee_rate),
        liquidity: new bn_js_1.default(pool.liquidity),
        tickIndexes: [],
        tickSpacing: Number(pool.tickSpacing),
        ticks: [],
        collection_name: '',
    };
    return poolData;
}
exports.transClmmpoolDataWithoutTicks = transClmmpoolDataWithoutTicks;
function newBits(index) {
    const index_BN = new bn_js_1.default(index);
    if (index_BN.lt(utils_1.ZERO)) {
        return {
            bits: index_BN
                .neg()
                .xor(new bn_js_1.default(2).pow(new bn_js_1.default(64)).sub(new bn_js_1.default(1)))
                .add(new bn_js_1.default(1))
                .toString(),
        };
    }
    return {
        bits: index_BN.toString(),
    };
}
exports.newBits = newBits;
