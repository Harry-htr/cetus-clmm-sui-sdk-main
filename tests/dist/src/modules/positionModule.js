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
Object.defineProperty(exports, "__esModule", { value: true });
exports.PositionModule = void 0;
const sui_js_1 = require("@mysten/sui.js");
const utils_1 = require("../utils");
const transaction_util_1 = require("../utils/transaction-util");
const sui_1 = require("../types/sui");
class PositionModule {
    constructor(sdk) {
        this._sdk = sdk;
    }
    get sdk() {
        return this._sdk;
    }
    /**
     * create add liquidity transaction payload
     * @param params
     * @param gasEstimateArg : When the fix input amount is SUI, gasEstimateArg can control whether to recalculate the number of SUI to prevent insufficient gas.
     * If this parameter is not passed, gas estimation is not performed
     * @returns
     */
    createAddLiquidityTransactionPayload(params, gasEstimateArg) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this._sdk.senderAddress.length === 0) {
                throw Error('this config sdk senderAddress is empty');
            }
            const allCoinAsset = yield this._sdk.Resources.getOwnerCoinAssets(this._sdk.senderAddress);
            const isFixToken = !('delta_liquidity' in params);
            if (gasEstimateArg) {
                const { isAdjustCoinA, isAdjustCoinB } = (0, transaction_util_1.findAdjustCoin)(params);
                if (isFixToken) {
                    params = params;
                    if ((params.fix_amount_a && isAdjustCoinA) || (!params.fix_amount_a && isAdjustCoinB)) {
                        const tx = yield transaction_util_1.TransactionUtil.buildAddLiquidityTransactionForGas(this._sdk, allCoinAsset, params, gasEstimateArg);
                        return tx;
                    }
                }
            }
            return transaction_util_1.TransactionUtil.buildAddLiquidityTransaction(this._sdk, allCoinAsset, params);
        });
    }
    /**
     * Remove liquidity from a position.
     * @param params
     * @param gasBudget
     * @returns
     */
    removeLiquidityTransactionPayload(params) {
        const { clmm } = this.sdk.sdkOptions;
        const functionName = 'remove_liquidity';
        const tx = new sui_js_1.TransactionBlock();
        tx.setGasBudget(this._sdk.gasConfig.GasBudgetHigh2);
        const typeArguments = [params.coinTypeA, params.coinTypeB];
        if (params.collect_fee) {
            tx.moveCall({
                target: `${clmm.clmm_router.cetus}::${sui_1.ClmmIntegratePoolModule}::collect_fee`,
                typeArguments,
                arguments: [tx.object(clmm.config.global_config_id), tx.object(params.pool_id), tx.object(params.pos_id)],
            });
        }
        const args = [
            tx.object(clmm.config.global_config_id),
            tx.object(params.pool_id),
            tx.object(params.pos_id),
            tx.pure(params.delta_liquidity),
            tx.pure(params.min_amount_a),
            tx.pure(params.min_amount_b),
            tx.object(sui_1.CLOCK_ADDRESS),
        ];
        tx.moveCall({
            target: `${clmm.clmm_router.cetus}::${sui_1.ClmmIntegratePoolModule}::${functionName}`,
            typeArguments,
            arguments: args,
        });
        return tx;
    }
    /**
     * Close position and remove all liquidity and collect_reward
     * @param params
     * @param gasBudget
     * @returns
     */
    closePositionTransactionPayload(params) {
        const { clmm } = this.sdk.sdkOptions;
        const tx = new sui_js_1.TransactionBlock();
        tx.setGasBudget(this._sdk.gasConfig.GasBudgetHigh2);
        const typeArguments = [params.coinTypeA, params.coinTypeB];
        tx.moveCall({
            target: `${clmm.clmm_router.cetus}::${sui_1.ClmmIntegratePoolModule}::collect_fee`,
            typeArguments,
            arguments: [tx.object(clmm.config.global_config_id), tx.object(params.pool_id), tx.object(params.pos_id)],
        });
        params.rewarder_coin_types.forEach((type) => {
            tx.moveCall({
                target: `${clmm.clmm_router.cetus}::${sui_1.ClmmIntegratePoolModule}::collect_reward`,
                typeArguments: [...typeArguments, type],
                arguments: [
                    tx.object(clmm.config.global_config_id),
                    tx.object(params.pool_id),
                    tx.object(params.pos_id),
                    tx.object(clmm.config.global_vault_id),
                    tx.object(sui_1.CLOCK_ADDRESS),
                ],
            });
        });
        tx.moveCall({
            target: `${clmm.clmm_router.cetus}::${sui_1.ClmmIntegratePoolModule}::close_position`,
            typeArguments,
            arguments: [
                tx.object(clmm.config.global_config_id),
                tx.object(params.pool_id),
                tx.object(params.pos_id),
                tx.pure(params.min_amount_a),
                tx.pure(params.min_amount_b),
                tx.object(sui_1.CLOCK_ADDRESS),
            ],
        });
        return tx;
    }
    /**
     * Open position in clmmpool.
     * @param params
     * @returns
     */
    openPositionTransactionPayload(params) {
        const { clmm } = this.sdk.sdkOptions;
        const tx = new sui_js_1.TransactionBlock();
        tx.setGasBudget(this._sdk.gasConfig.GasBudgetHigh);
        const typeArguments = [params.coinTypeA, params.coinTypeB];
        const tick_lower = (0, utils_1.asUintN)(BigInt(params.tick_lower)).toString();
        const tick_upper = (0, utils_1.asUintN)(BigInt(params.tick_upper)).toString();
        const args = [tx.pure(clmm.config.global_config_id), tx.pure(params.pool_id), tx.pure(tick_lower), tx.pure(tick_upper)];
        tx.moveCall({
            target: `${clmm.clmm_router.cetus}::${sui_1.ClmmIntegratePoolModule}::open_position`,
            typeArguments,
            arguments: args,
        });
        return tx;
    }
    /**
     * Collect LP fee from Position.
     * @param params
     * @returns
     */
    collectFeeTransactionPayload(params) {
        const { clmm } = this.sdk.sdkOptions;
        const tx = new sui_js_1.TransactionBlock();
        tx.setGasBudget(this._sdk.gasConfig.GasBudgetLow);
        const typeArguments = [params.coinTypeA, params.coinTypeB];
        const args = [tx.object(clmm.config.global_config_id), tx.pure(params.pool_id), tx.pure(params.pos_id)];
        tx.moveCall({
            target: `${clmm.clmm_router.cetus}::${sui_1.ClmmIntegratePoolModule}::collect_fee`,
            typeArguments,
            arguments: args,
        });
        return tx;
    }
}
exports.PositionModule = PositionModule;
