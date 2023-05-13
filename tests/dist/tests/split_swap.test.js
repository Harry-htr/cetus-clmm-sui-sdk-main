"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const bn_js_1 = __importDefault(require("bn.js"));
const init_test_data_1 = require("./data/init_test_data");
require("isomorphic-fetch");
const src_1 = require("../src");
describe('SplitSwap compute swap test', () => {
    const sdk = (0, init_test_data_1.buildSdk)();
    test('computeSwap vs calculateRates vs preSwap', () => __awaiter(void 0, void 0, void 0, function* () {
        const a2b = false;
        const byAmountIn = true;
        const amount = new bn_js_1.default('1000000000');
        const poolObjectId = "0xcfa5914edd8ed9e60006e36dd01d880ffc65acdc13a67d2432b66855b3e1b6ba";
        // const poolObjectId = "0x4ec79e658f4ce15371b8946a79c09c8fc46fcb948ccd87142ae3d02a195ac874"
        // const poolObjectId = "0xfb1c5433dade825b7cb2f39a48876000afcb64ab778937f6b68f0b6c38b6b0b5"
        const currentPool = yield (0, init_test_data_1.buildTestPool)(sdk, poolObjectId);
        const tickdatas = yield sdk.Pool.fetchTicksByRpc(currentPool.ticks_handle);
        const splitSwap = new src_1.SplitSwap(amount, src_1.SplitUnit.HUNDRED, currentPool, a2b, byAmountIn, tickdatas);
        const splitSwapResult = yield splitSwap.computeSwap();
        for (let i = 1; i < splitSwapResult.amountInArray.length; i += 1) {
            const calAmount = splitSwap.amountArray[i];
            const calculateResult = yield sdk.Swap.calculateRates({
                decimalsA: 8,
                decimalsB: 8,
                a2b,
                byAmountIn,
                amount: calAmount,
                swapTicks: tickdatas,
                currentPool,
            });
            const perSwapResult = yield sdk.Swap.preswap({
                pool: currentPool,
                current_sqrt_price: currentPool.current_sqrt_price,
                coinTypeA: currentPool.coinTypeA,
                coinTypeB: currentPool.coinTypeB,
                decimalsA: 8,
                decimalsB: 8,
                a2b,
                by_amount_in: byAmountIn,
                amount: calAmount.toString(),
            });
            console.log(`
        amountIn ${i}-> splitSwap:${splitSwapResult.amountInArray[i].toString()}, calculate: ${calculateResult.estimatedAmountIn.toString()}, preSwap: ${perSwapResult.estimatedAmountIn.toString()} \n
        amountOut ${i}-> splitSwap:${splitSwapResult.amountOutArray[i].toString()}, calculate: ${calculateResult.estimatedAmountOut.toString()}, preSwap: ${perSwapResult.estimatedAmountOut.toString()}\n
        isExceed ${i}-> splitSwap:${splitSwapResult.isExceed[i]}, calculate: ${calculateResult.isExceed}, preSwap: ${perSwapResult.isExceed}
      `);
        }
    }));
});
