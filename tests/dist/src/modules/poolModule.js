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
exports.PoolModule = void 0;
const sui_js_1 = require("@mysten/sui.js");
const transaction_util_1 = require("../utils/transaction-util");
const math_1 = require("../math");
const common_1 = require("../utils/common");
const contracts_1 = require("../utils/contracts");
const sui_1 = require("../types/sui");
class PoolModule {
    constructor(sdk) {
        this._sdk = sdk;
    }
    get sdk() {
        return this._sdk;
    }
    creatPoolsTransactionPayload(paramss) {
        return __awaiter(this, void 0, void 0, function* () {
            for (const params of paramss) {
                if ((0, contracts_1.isSortedSymbols)((0, sui_js_1.normalizeSuiAddress)(params.coinTypeA), (0, sui_js_1.normalizeSuiAddress)(params.coinTypeB))) {
                    const swpaCoinTypeB = params.coinTypeB;
                    params.coinTypeB = params.coinTypeA;
                    params.coinTypeA = swpaCoinTypeB;
                }
            }
            return yield this.creatPool(paramss);
        });
    }
    /**
     * Create a pool of clmmpool protocol. The pool is identified by (CoinTypeA, CoinTypeB, tick_spacing).
     * @param params
     * @returns
     */
    creatPoolTransactionPayload(params) {
        return __awaiter(this, void 0, void 0, function* () {
            if ((0, contracts_1.isSortedSymbols)((0, sui_js_1.normalizeSuiAddress)(params.coinTypeA), (0, sui_js_1.normalizeSuiAddress)(params.coinTypeB))) {
                const swpaCoinTypeB = params.coinTypeB;
                params.coinTypeB = params.coinTypeA;
                params.coinTypeA = swpaCoinTypeB;
            }
            if ('fix_amount_a' in params) {
                return yield this.creatPoolAndAddLiquidity(params);
            }
            return yield this.creatPool([params]);
        });
    }
    creatPool(paramss) {
        return __awaiter(this, void 0, void 0, function* () {
            const tx = new sui_js_1.TransactionBlock();
            const { clmm } = this.sdk.sdkOptions;
            const eventConfig = clmm.config;
            if (eventConfig === undefined) {
                throw Error('eventConfig is null');
            }
            const globalPauseStatusObjectId = eventConfig.global_config_id;
            const poolsId = eventConfig.pools_id;
            tx.setGasBudget(this._sdk.gasConfig.GasBudgetHigh2);
            paramss.forEach((params) => {
                const args = [
                    tx.object(globalPauseStatusObjectId),
                    tx.object(poolsId),
                    tx.pure(params.tick_spacing.toString()),
                    tx.pure(params.initialize_sqrt_price),
                    tx.pure(params.uri),
                    tx.object(sui_1.CLOCK_ADDRESS),
                ];
                tx.moveCall({
                    target: `${clmm.clmm_router.cetus}::${sui_1.ClmmIntegratePoolModule}::create_pool`,
                    typeArguments: [params.coinTypeA, params.coinTypeB],
                    arguments: args,
                });
            });
            return tx;
        });
    }
    creatPoolAndAddLiquidity(params) {
        var _a, _b;
        return __awaiter(this, void 0, void 0, function* () {
            if (this._sdk.senderAddress.length === 0) {
                throw Error('this config sdk senderAddress is empty');
            }
            const tx = new sui_js_1.TransactionBlock();
            const { clmm } = this.sdk.sdkOptions;
            const eventConfig = clmm.config;
            if (eventConfig === undefined) {
                throw Error('eventConfig is null');
            }
            const globalPauseStatusObjectId = eventConfig.global_config_id;
            const poolsId = eventConfig.pools_id;
            const allCoinAsset = yield this._sdk.Resources.getOwnerCoinAssets(this._sdk.senderAddress);
            tx.setGasBudget(this._sdk.gasConfig.GasBudgetHigh2);
            const primaryCoinAInputsR = (_a = transaction_util_1.TransactionUtil.buildCoinInputForAmount(tx, allCoinAsset, BigInt(params.amount_a), params.coinTypeA)) === null || _a === void 0 ? void 0 : _a.transactionArgument;
            const primaryCoinBInputsR = (_b = transaction_util_1.TransactionUtil.buildCoinInputForAmount(tx, allCoinAsset, BigInt(params.amount_b), params.coinTypeB)) === null || _b === void 0 ? void 0 : _b.transactionArgument;
            const primaryCoinAInputs = primaryCoinAInputsR;
            const primaryCoinBInputs = primaryCoinBInputsR;
            const primaryCoinInputs = [];
            if (primaryCoinAInputs) {
                primaryCoinInputs.push({
                    coinInput: primaryCoinAInputs,
                    coinAmount: params.amount_a.toString(),
                });
            }
            if (primaryCoinBInputs) {
                primaryCoinInputs.push({
                    coinInput: primaryCoinBInputs,
                    coinAmount: params.amount_b.toString(),
                });
            }
            let addLiquidityName;
            if (primaryCoinInputs.length === 2) {
                addLiquidityName = 'create_pool_with_liquidity_with_all';
            }
            else {
                addLiquidityName = primaryCoinAInputs !== undefined ? 'create_pool_with_liquidity_only_a' : 'create_pool_with_liquidity_only_b';
            }
            const args = [
                tx.pure(globalPauseStatusObjectId),
                tx.pure(poolsId),
                tx.pure(params.tick_spacing.toString()),
                tx.pure(params.initialize_sqrt_price),
                tx.pure(params.uri),
                ...primaryCoinInputs.map((item) => item.coinInput),
                tx.pure((0, common_1.asUintN)(BigInt(params.tick_lower)).toString()),
                tx.pure((0, common_1.asUintN)(BigInt(params.tick_upper)).toString()),
                ...primaryCoinInputs.map((item) => tx.pure(item.coinAmount)),
                // tx.pure(params.fix_amount_a),
                // tx.pure(CLOCK_ADDRESS),
            ];
            if (addLiquidityName === 'create_pool_with_liquidity_with_all') {
                args.push(tx.pure(params.fix_amount_a));
            }
            args.push(tx.pure(sui_1.CLOCK_ADDRESS));
            tx.moveCall({
                target: `${clmm.clmm_router.cetus}::${sui_1.ClmmIntegratePoolModule}::${addLiquidityName}`,
                typeArguments: [params.coinTypeA, params.coinTypeB],
                arguments: args,
            });
            return tx;
        });
    }
    fetchTicks(params) {
        return __awaiter(this, void 0, void 0, function* () {
            let ticks = [];
            let start = [];
            const limit = 512;
            while (true) {
                // eslint-disable-next-line no-await-in-loop
                const data = yield this.getTicks({
                    pool_id: params.pool_id,
                    coinTypeA: params.coinTypeA,
                    coinTypeB: params.coinTypeB,
                    start,
                    limit,
                });
                // console.log('data: ', data)
                ticks = [...ticks, ...data];
                if (data.length < limit) {
                    break;
                }
                start = [data[data.length - 1].index];
            }
            return ticks;
        });
    }
    getTicks(params) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            const { clmm, simulationAccount } = this.sdk.sdkOptions;
            const ticks = [];
            const typeArguments = [params.coinTypeA, params.coinTypeB];
            const tx = new sui_js_1.TransactionBlock();
            const args = [tx.pure(params.pool_id), tx.pure(params.start), tx.pure(params.limit.toString())];
            tx.moveCall({
                target: `${clmm.clmm_router.cetus}::${sui_1.ClmmFetcherModule}::fetch_ticks`,
                arguments: args,
                typeArguments,
            });
            console.log('payload: ', tx.blockData.transactions[0]);
            const simulateRes = yield this.sdk.fullClient.devInspectTransactionBlock({
                transactionBlock: tx,
                sender: simulationAccount.address,
            });
            // console.log('simulateRes: ', simulateRes.events)
            (_a = simulateRes.events) === null || _a === void 0 ? void 0 : _a.forEach((item) => {
                if ((0, contracts_1.extractStructTagFromType)(item.type).name === `FetchTicksResultEvent`) {
                    item.parsedJson.ticks.forEach((tick) => {
                        ticks.push((0, common_1.buildTickDataByEvent)(tick));
                    });
                }
            });
            return ticks;
        });
    }
    fetchPositionRewardList(params) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            const { clmm, simulationAccount } = this.sdk.sdkOptions;
            const allPosition = [];
            let start = [];
            const limit = 512;
            while (true) {
                const typeArguments = [params.coinTypeA, params.coinTypeB];
                const tx = new sui_js_1.TransactionBlock();
                const args = [tx.pure(params.pool_id), tx.pure(start), tx.pure(limit.toString())];
                tx.moveCall({
                    target: `${clmm.clmm_router.cetus}::${sui_1.ClmmFetcherModule}::fetch_positions`,
                    arguments: args,
                    typeArguments,
                });
                const simulateRes = yield this.sdk.fullClient.devInspectTransactionBlock({
                    transactionBlock: tx,
                    sender: simulationAccount.address,
                });
                const positionRewards = [];
                (_a = simulateRes.events) === null || _a === void 0 ? void 0 : _a.forEach((item) => {
                    if ((0, contracts_1.extractStructTagFromType)(item.type).name === `FetchPositionsEvent`) {
                        item.parsedJson.positions.forEach((item) => {
                            const positionReward = (0, common_1.buildPositionReward)(item);
                            positionRewards.push(positionReward);
                        });
                    }
                });
                allPosition.push(...positionRewards);
                if (positionRewards.length < limit) {
                    break;
                }
                else {
                    start = [positionRewards[positionRewards.length - 1].pos_object_id];
                }
            }
            return allPosition;
        });
    }
    fetchTicksByRpc(tickHandle) {
        return __awaiter(this, void 0, void 0, function* () {
            let allTickData = [];
            let nextCursor = null;
            const limit = 512;
            while (true) {
                const allTickId = [];
                // eslint-disable-next-line no-await-in-loop
                const idRes = yield this.sdk.fullClient.getDynamicFields({
                    parentId: tickHandle,
                    cursor: nextCursor,
                    limit,
                });
                // console.log('idRes: ', idRes.data)
                nextCursor = idRes.nextCursor;
                // eslint-disable-next-line no-loop-func
                idRes.data.forEach((item) => {
                    if ((0, contracts_1.extractStructTagFromType)(item.objectType).module === 'skip_list') {
                        allTickId.push(item.objectId);
                    }
                });
                // eslint-disable-next-line no-await-in-loop
                allTickData = [...allTickData, ...(yield this.getTicksByRpc(allTickId))];
                if (nextCursor === null || idRes.data.length < limit) {
                    break;
                }
            }
            return allTickData;
        });
    }
    getTicksByRpc(tickObjectId) {
        return __awaiter(this, void 0, void 0, function* () {
            const ticks = [];
            const objectDataResponses = yield (0, common_1.multiGetObjects)(this.sdk, tickObjectId, { showContent: true, showType: true });
            // eslint-disable-next-line no-restricted-syntax
            for (const suiObj of objectDataResponses) {
                ticks.push((0, common_1.buildTickData)(suiObj));
            }
            return ticks;
        });
    }
    getTickDataByIndex(tickHandle, tickIndex) {
        return __awaiter(this, void 0, void 0, function* () {
            const name = { type: 'u64', value: (0, common_1.asUintN)(BigInt((0, math_1.tickScore)(tickIndex).toString())).toString() };
            const res = yield this.sdk.fullClient.getDynamicFieldObject({
                parentId: tickHandle,
                name,
            });
            return (0, common_1.buildTickData)(res);
        });
    }
    getTickDataByObjectId(tickId) {
        return __awaiter(this, void 0, void 0, function* () {
            const res = yield this.sdk.fullClient.getObject({
                id: tickId,
                options: { showContent: true },
            });
            return (0, common_1.buildTickData)(res);
        });
    }
}
exports.PoolModule = PoolModule;
