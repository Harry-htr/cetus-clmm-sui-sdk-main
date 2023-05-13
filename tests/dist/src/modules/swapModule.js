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
exports.SwapModule = exports.POOL_STRUCT = exports.AMM_SWAP_MODULE = void 0;
/* eslint-disable camelcase */
const bn_js_1 = __importDefault(require("bn.js"));
const sui_js_1 = require("@mysten/sui.js");
const math_1 = require("../math");
const transaction_util_1 = require("../utils/transaction-util");
const contracts_1 = require("../utils/contracts");
const sui_1 = require("../types/sui");
const clmmpool_1 = require("../types/clmmpool");
const swap_1 = require("../math/swap");
const clmm_1 = require("../math/clmm");
const tick_1 = require("../math/tick");
exports.AMM_SWAP_MODULE = 'amm_swap';
exports.POOL_STRUCT = 'Pool';
class SwapModule {
    constructor(sdk) {
        this._cache = {};
        this._sdk = sdk;
    }
    get sdk() {
        return this._sdk;
    }
    preSwapWithMultiPool(params) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            const { clmm, simulationAccount } = this.sdk.sdkOptions;
            const tx = new sui_js_1.TransactionBlock();
            const typeArguments = [params.coinTypeA, params.coinTypeB];
            for (let i = 0; i < params.poolAddresses.length; i += 1) {
                const args = [tx.pure(params.poolAddresses[i]), tx.pure(params.a2b), tx.pure(params.byAmountIn), tx.pure(params.amount)];
                tx.moveCall({
                    target: `${clmm.clmm_router.cetus}::${sui_1.ClmmFetcherModule}::calculate_swap_result`,
                    arguments: args,
                    typeArguments,
                });
            }
            const simulateRes = yield this.sdk.fullClient.devInspectTransactionBlock({
                transactionBlock: tx,
                sender: simulationAccount.address,
            });
            const valueData = (_a = simulateRes.events) === null || _a === void 0 ? void 0 : _a.filter((item) => {
                return (0, contracts_1.extractStructTagFromType)(item.type).name === `CalculatedSwapResultEvent`;
            });
            if (valueData.length === 0) {
                return null;
            }
            if (valueData.length !== params.poolAddresses.length) {
                throw new Error('valueData.length !== params.pools.length');
            }
            let tempMaxAmount = params.byAmountIn ? math_1.ZERO : math_1.U64_MAX;
            let tempIndex = 0;
            for (let i = 0; i < valueData.length; i += 1) {
                if (valueData[i].parsedJson.data.is_exceed) {
                    continue;
                }
                if (params.byAmountIn) {
                    const amount = new bn_js_1.default(valueData[i].parsedJson.data.amount_out);
                    if (amount.gt(tempMaxAmount)) {
                        tempIndex = i;
                        tempMaxAmount = amount;
                    }
                }
                else {
                    const amount = new bn_js_1.default(valueData[i].parsedJson.data.amount_out);
                    if (amount.lt(tempMaxAmount)) {
                        tempIndex = i;
                        tempMaxAmount = amount;
                    }
                }
            }
            return this.transformSwapWithMultiPoolData({
                poolAddress: params.poolAddresses[tempIndex],
                decimalsA: params.decimalsA,
                decimalsB: params.decimalsB,
                a2b: params.a2b,
                byAmountIn: params.byAmountIn,
                amount: params.amount,
                coinTypeA: params.coinTypeA,
                coinTypeB: params.coinTypeB,
            }, valueData[tempIndex].parsedJson.data);
        });
    }
    preswap(params) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            const { clmm, simulationAccount } = this.sdk.sdkOptions;
            const tx = new sui_js_1.TransactionBlock();
            const typeArguments = [params.coinTypeA, params.coinTypeB];
            const args = [tx.pure(params.pool.poolAddress), tx.pure(params.a2b), tx.pure(params.by_amount_in), tx.pure(params.amount)];
            tx.moveCall({
                target: `${clmm.clmm_router.cetus}::${sui_1.ClmmFetcherModule}::calculate_swap_result`,
                arguments: args,
                typeArguments,
            });
            const simulateRes = yield this.sdk.fullClient.devInspectTransactionBlock({
                transactionBlock: tx,
                sender: simulationAccount.address,
            });
            const valueData = (_a = simulateRes.events) === null || _a === void 0 ? void 0 : _a.filter((item) => {
                return (0, contracts_1.extractStructTagFromType)(item.type).name === `CalculatedSwapResultEvent`;
            });
            if (valueData.length === 0) {
                return null;
            }
            // console.log('preswap###simulateRes####', valueData[0])
            return this.transformSwapData(params, valueData[0].parsedJson.data);
        });
    }
    // eslint-disable-next-line class-methods-use-this
    transformSwapData(params, data) {
        const estimatedAmountIn = data.amount_in && data.fee_amount ? new bn_js_1.default(data.amount_in).add(new bn_js_1.default(data.fee_amount)).toString() : '';
        return {
            poolAddress: params.pool.poolAddress,
            currentSqrtPrice: params.current_sqrt_price,
            estimatedAmountIn,
            estimatedAmountOut: data.amount_out,
            estimatedEndSqrtPrice: data.after_sqrt_price,
            estimatedFeeAmount: data.fee_amount,
            isExceed: data.is_exceed,
            amount: params.amount,
            aToB: params.a2b,
            byAmountIn: params.by_amount_in,
        };
    }
    // eslint-disable-next-line class-methods-use-this
    transformSwapWithMultiPoolData(params, data) {
        const estimatedAmountIn = data.amount_in && data.fee_amount ? new bn_js_1.default(data.amount_in).add(new bn_js_1.default(data.fee_amount)).toString() : '';
        return {
            poolAddress: params.poolAddress,
            estimatedAmountIn,
            estimatedAmountOut: data.amount_out,
            estimatedEndSqrtPrice: data.after_sqrt_price,
            estimatedFeeAmount: data.fee_amount,
            isExceed: data.is_exceed,
            amount: params.amount,
            aToB: params.a2b,
            byAmountIn: params.byAmountIn,
        };
    }
    /* eslint-disable class-methods-use-this */
    calculateRates(params) {
        const { currentPool } = params;
        const poolData = (0, clmmpool_1.transClmmpoolDataWithoutTicks)(currentPool);
        let ticks;
        if (params.a2b) {
            ticks = params.swapTicks.sort((a, b) => {
                return b.index - a.index;
            });
        }
        else {
            ticks = params.swapTicks.sort((a, b) => {
                return a.index - b.index;
            });
        }
        const swapResult = (0, clmm_1.computeSwap)(params.a2b, params.byAmountIn, params.amount, poolData, ticks);
        let isExceed = false;
        if (params.byAmountIn) {
            console.log(swapResult.amountIn.toString(), params.amount.toString(), params.byAmountIn);
            isExceed = swapResult.amountIn.lt(params.amount);
        }
        else {
            console.log(swapResult.amountOut.toString(), params.amount.toString(), params.byAmountIn);
            isExceed = swapResult.amountOut.lt(params.amount);
        }
        const sqrtPriceLimit = swap_1.SwapUtils.getDefaultSqrtPriceLimit(params.a2b);
        if (params.a2b && swapResult.nextSqrtPrice.lt(sqrtPriceLimit)) {
            isExceed = true;
        }
        if (!params.a2b && swapResult.nextSqrtPrice.gt(sqrtPriceLimit)) {
            isExceed = true;
        }
        let extraComputeLimit = 0;
        if (swapResult.crossTickNum > 6 && swapResult.crossTickNum < 40) {
            extraComputeLimit = 22000 * (swapResult.crossTickNum - 6);
        }
        if (swapResult.crossTickNum > 40) {
            isExceed = true;
        }
        const prePrice = tick_1.TickMath.sqrtPriceX64ToPrice(poolData.currentSqrtPrice, params.decimalsA, params.decimalsB).toNumber();
        const afterPrice = tick_1.TickMath.sqrtPriceX64ToPrice(swapResult.nextSqrtPrice, params.decimalsA, params.decimalsB).toNumber();
        const priceImpactPct = (Math.abs(prePrice - afterPrice) / prePrice) * 100;
        return {
            estimatedAmountIn: swapResult.amountIn,
            estimatedAmountOut: swapResult.amountOut,
            estimatedEndSqrtPrice: swapResult.nextSqrtPrice,
            estimatedFeeAmount: swapResult.feeAmount,
            isExceed,
            extraComputeLimit,
            amount: params.amount,
            aToB: params.a2b,
            byAmountIn: params.byAmountIn,
            priceImpactPct,
        };
    }
    /**
     * create swap transaction payload
     * @param params
     * @param gasEstimateArg When the fix input amount is SUI, gasEstimateArg can control whether to recalculate the number of SUI to prevent insufficient gas.
     * If this parameter is not passed, gas estimation is not performed
     * @returns
     */
    createSwapTransactionPayload(params, gasEstimateArg) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this._sdk.senderAddress.length === 0) {
                throw Error('this config sdk senderAddress is empty');
            }
            const allCoinAsset = yield this._sdk.Resources.getOwnerCoinAssets(this._sdk.senderAddress);
            if (gasEstimateArg) {
                const { isAdjustCoinA, isAdjustCoinB } = (0, transaction_util_1.findAdjustCoin)(params);
                if ((params.a2b && isAdjustCoinA) || (!params.a2b && isAdjustCoinB)) {
                    const tx = yield transaction_util_1.TransactionUtil.buildSwapTransactionForGas(this._sdk, params, allCoinAsset, gasEstimateArg);
                    return tx;
                }
            }
            return transaction_util_1.TransactionUtil.buildSwapTransaction(this.sdk, params, allCoinAsset);
        });
    }
}
exports.SwapModule = SwapModule;
