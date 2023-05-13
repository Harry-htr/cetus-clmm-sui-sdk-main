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
exports.LaunchpadModule = exports.intervalFaucetTime = exports.cacheTime24h = exports.cacheTime5min = void 0;
/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable camelcase */
const sui_js_1 = require("@mysten/sui.js");
const transaction_util_1 = require("../utils/transaction-util");
const math_1 = require("../math");
const utils_1 = require("../utils");
const launchpad_1 = require("../utils/launchpad");
const luanchpa_type_1 = require("../types/luanchpa_type");
const sui_1 = require("../types/sui");
const cachedContent_1 = require("../utils/cachedContent");
const contracts_1 = require("../utils/contracts");
const common_1 = require("../utils/common");
exports.cacheTime5min = 5 * 60 * 1000;
exports.cacheTime24h = 24 * 60 * 60 * 1000;
exports.intervalFaucetTime = 12 * 60 * 60 * 1000;
function getFutureTime(interval) {
    return Date.parse(new Date().toString()) + interval;
}
class LaunchpadModule {
    constructor(sdk) {
        this._cache = {};
        this._sdk = sdk;
    }
    get sdk() {
        return this._sdk;
    }
    getPoolImmutables(assignPools = [], offset = 0, limit = 100, forceRefresh = false) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            const { ido_display } = this._sdk.sdkOptions.launchpad;
            if (ido_display === undefined) {
                throw Error('sdk.sdkOptions.launchpad is undefined');
            }
            const cacheKey = `${ido_display}_getInitPoolEvent`;
            const cacheData = this._cache[cacheKey];
            const allPools = [];
            const filterPools = [];
            if (cacheData !== undefined && cacheData.getCacheData() && !forceRefresh) {
                allPools.push(...cacheData.value);
            }
            if (allPools.length === 0) {
                try {
                    const objects = (_a = (yield (0, utils_1.loopToGetAllQueryEvents)(this._sdk, {
                        query: { MoveEventType: `${ido_display}::factory::CreatePoolEvent` },
                    }))) === null || _a === void 0 ? void 0 : _a.data;
                    objects.forEach((object) => {
                        const fields = object.parsedJson;
                        if (fields) {
                            allPools.push({
                                pool_address: fields.pool_id,
                                coin_type_sale: (0, contracts_1.extractStructTagFromType)(fields.sale_coin.name).full_address,
                                coin_type_raise: (0, contracts_1.extractStructTagFromType)(fields.raise_coin.name).full_address,
                            });
                        }
                    });
                    this.updateCache(cacheKey, allPools, exports.cacheTime24h);
                }
                catch (error) {
                    console.log('getPoolImmutables', error);
                }
            }
            const hasassignPools = assignPools.length > 0;
            for (let index = 0; index < allPools.length; index += 1) {
                const item = allPools[index];
                if (hasassignPools && !assignPools.includes(item.pool_address)) {
                    continue;
                }
                if (!hasassignPools) {
                    const itemIndex = index;
                    if (itemIndex < offset || itemIndex >= offset + limit) {
                        continue;
                    }
                }
                filterPools.push(item);
            }
            return filterPools;
        });
    }
    getPools(assignPools = [], offset = 0, limit = 100) {
        return __awaiter(this, void 0, void 0, function* () {
            const allPool = [];
            let poolObjectIds = [];
            if (assignPools.length > 0) {
                poolObjectIds = [...assignPools];
            }
            else {
                const poolImmutables = yield this.getPoolImmutables([], offset, limit, false);
                poolImmutables.forEach((item) => {
                    poolObjectIds.push(item.pool_address);
                });
            }
            const objectDataResponses = yield (0, common_1.multiGetObjects)(this.sdk, poolObjectIds, { showType: true, showContent: true });
            // eslint-disable-next-line no-restricted-syntax
            for (const suiObj of objectDataResponses) {
                const pool = launchpad_1.LauncpadUtil.buildLaunchPadPool(suiObj);
                // eslint-disable-next-line no-await-in-loop
                yield launchpad_1.LauncpadUtil.calculatePoolPrice(this._sdk, pool);
                allPool.push(pool);
                const cacheKey = `${pool.pool_address}_getPoolObject`;
                this.updateCache(cacheKey, pool, exports.cacheTime24h);
            }
            return allPool;
        });
    }
    getPool(poolObjectId, forceRefresh = true) {
        return __awaiter(this, void 0, void 0, function* () {
            const cacheKey = `${poolObjectId}_getPoolObject`;
            const cacheData = this._cache[cacheKey];
            if (cacheData !== undefined && cacheData.getCacheData() && !forceRefresh) {
                const pool = cacheData.value;
                launchpad_1.LauncpadUtil.updatePoolStatus(pool);
                return pool;
            }
            const objects = (yield this._sdk.fullClient.getObject({
                id: poolObjectId,
                options: { showContent: true, showType: true },
            }));
            const pool = launchpad_1.LauncpadUtil.buildLaunchPadPool(objects);
            yield launchpad_1.LauncpadUtil.calculatePoolPrice(this._sdk, pool);
            this.updateCache(cacheKey, pool);
            return pool;
        });
    }
    getInitFactoryEvent(forceRefresh = false) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            const packageObjectId = this._sdk.sdkOptions.launchpad.ido_display;
            const cacheKey = `${packageObjectId}_getInitEvent`;
            const cacheData = this._cache[cacheKey];
            if (cacheData !== undefined && cacheData.getCacheData() && !forceRefresh) {
                return cacheData.value;
            }
            const packageObject = yield this._sdk.fullClient.getObject({ id: packageObjectId, options: { showPreviousTransaction: true } });
            const previousTx = (0, sui_js_1.getObjectPreviousTransactionDigest)(packageObject);
            const objects = (_a = (yield (0, utils_1.loopToGetAllQueryEvents)(this._sdk, { query: { Transaction: previousTx } }))) === null || _a === void 0 ? void 0 : _a.data;
            const initEvent = {
                pools_id: '',
                admin_cap_id: '',
                config_cap_id: '',
            };
            if (objects.length > 0) {
                objects.forEach((item) => {
                    const fields = item.parsedJson;
                    if (fields) {
                        switch ((0, contracts_1.extractStructTagFromType)(item.type).full_address) {
                            case `${packageObjectId}::config::InitConfigEvent`:
                                initEvent.admin_cap_id = fields.admin_cap_id;
                                initEvent.config_cap_id = fields.config_cap_id;
                                break;
                            case `${packageObjectId}::factory::InitFactoryEvent`:
                                initEvent.pools_id = fields.pools_id;
                                break;
                            default:
                                break;
                        }
                    }
                });
                this.updateCache(cacheKey, initEvent, exports.cacheTime24h);
            }
            return initEvent;
        });
    }
    // async getInitLockEvent(forceRefresh = false): Promise<LaunchpadInitLockEvent> {
    //   const { lock_display } = this._sdk.sdkOptions.launchpad
    //   const cacheKey = `${lock_display}_getInitLockEvent`
    //   const cacheData = this._cache[cacheKey]
    //   if (cacheData !== undefined && cacheData.getCacheData() && !forceRefresh) {
    //     return cacheData.value as LaunchpadInitLockEvent
    //   }
    //   const lockEvent: LaunchpadInitLockEvent = {
    //     lock_manager_id: '',
    //   }
    //   try {
    //     const objects = (await this._sdk.fullClient.queryEvents({ query: { MoveEventType: `${lock_display}::lock::InitManagerEvent` } })).data
    //     console.log(objects)
    //     objects.forEach((object) => {
    //       const fields = object.parsedJson
    //       if (fields) {
    //         lockEvent.lock_manager_id = fields.lock_manager_id
    //       }
    //     })
    //     this.updateCache(cacheKey, lockEvent, cacheTime24h)
    //   } catch (error) {
    //     console.log('getInitLockEvent', error)
    //   }
    //   return lockEvent
    // }
    getLockNFT(nft_id, forceRefresh = false) {
        return __awaiter(this, void 0, void 0, function* () {
            const cacheKey = `${nft_id}_getLockNFT`;
            const cacheData = this._cache[cacheKey];
            if (cacheData !== undefined && cacheData.getCacheData() && !forceRefresh) {
                return cacheData.value;
            }
            const objects = yield this._sdk.fullClient.getObject({
                id: nft_id,
                options: {
                    showType: true,
                    showContent: true,
                    showDisplay: true,
                    showOwner: true,
                },
            });
            if (objects.error) {
                return undefined;
            }
            return (0, common_1.buildPosition)(objects);
        });
    }
    getLockNFTList(poolType, recipient) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            const { sdkOptions } = this._sdk;
            const result = [];
            const poolTypeWarp = (0, contracts_1.extractStructTagFromType)(poolType);
            try {
                const objects = (_a = (yield (0, utils_1.loopToGetAllQueryEvents)(this._sdk, { query: { MoveEventType: `${sdkOptions.launchpad.ido_display}::lock::LockNFTEvent` } }))) === null || _a === void 0 ? void 0 : _a.data;
                for (const object of objects) {
                    const fields = object.parsedJson;
                    if (fields) {
                        const lockNFTEvent = {
                            locked_time: Number(fields.locked_time),
                            end_lock_time: Number(fields.end_lock_time),
                            nft_type: fields.nft_type_name.name,
                            lock_nft_id: fields.lock_nft_id,
                            recipient: fields.recipient,
                        };
                        if (recipient === lockNFTEvent.recipient &&
                            `${sdkOptions.clmm.clmm_display}` === (0, contracts_1.extractStructTagFromType)(lockNFTEvent.nft_type).address) {
                            // eslint-disable-next-line no-await-in-loop
                            const lockNftInfo = yield this.getLockNFT(lockNFTEvent.lock_nft_id);
                            if (lockNftInfo) {
                                const nftTypeA = (0, contracts_1.extractStructTagFromType)(lockNftInfo.coin_type_a).full_address;
                                const nftTypeB = (0, contracts_1.extractStructTagFromType)(lockNftInfo.coin_type_b).full_address;
                                if ((poolTypeWarp.type_arguments[0] === nftTypeA && poolTypeWarp.type_arguments[1] === nftTypeB) ||
                                    (poolTypeWarp.type_arguments[0] === nftTypeB && poolTypeWarp.type_arguments[1] === nftTypeA)) {
                                    result.push(Object.assign(Object.assign(Object.assign({}, lockNftInfo), { coin_type_a: nftTypeA, coin_type_b: nftTypeB }), lockNFTEvent));
                                }
                            }
                        }
                    }
                }
                return result;
            }
            catch (error) {
                console.log('getLockNFTList:', error);
                return [];
            }
        });
    }
    creatPoolTransactionPayload(params) {
        return __awaiter(this, void 0, void 0, function* () {
            const { launchpad, clmm } = this.sdk.sdkOptions;
            const launchpadEvent = launchpad.config;
            this.assertLuanchpadConfig();
            if (this._sdk.senderAddress.length === 0) {
                throw Error('this config sdk senderAddress is empty');
            }
            const fixPrice = launchpad_1.LauncpadUtil.priceRealToFix(Number(params.initialize_price), params.sale_decimals, params.raise_decimals);
            const tx = new sui_js_1.TransactionBlock();
            const min_sale_amount = (0, utils_1.d)(params.sale_total)
                .add((0, utils_1.d)(params.sale_total).mul((0, utils_1.d)(params.liquidity_rate)))
                .toNumber();
            const primaryCoinInputs = (yield transaction_util_1.TransactionUtil.syncBuildCoinInputForAmount(this._sdk, tx, BigInt(min_sale_amount), params.coin_type_sale));
            tx.setGasBudget(this._sdk.gasConfig.GasBudgetHigh2);
            const args = [
                tx.pure(launchpadEvent.admin_cap_id),
                tx.pure(launchpadEvent.config_cap_id),
                tx.pure(launchpadEvent.pools_id),
                tx.pure((0, sui_js_1.normalizeSuiAddress)(params.recipient)),
                tx.pure((fixPrice * luanchpa_type_1.CONST_DENOMINATOR).toString()),
                primaryCoinInputs,
                tx.pure(params.sale_total.toString()),
                tx.pure(params.min_purchase.toString()),
                tx.pure(params.max_purchase.toString()),
                tx.pure(params.least_raise_amount.toString()),
                tx.pure(params.hardcap.toString()),
                tx.pure((params.liquidity_rate * 1000).toString()),
                tx.pure(params.start_time.toString()),
                tx.pure(params.activity_duration.toString()),
                tx.pure(params.settle_duration.toString()),
                tx.pure(params.locked_duration.toString()),
                tx.pure(params.tick_spacing.toString()),
                tx.pure(sui_1.CLOCK_ADDRESS),
            ];
            const typeArguments = [params.coin_type_sale, params.coin_type_raise];
            tx.moveCall({
                target: `${launchpad.ido_router}::${luanchpa_type_1.LaunchpadRouterModule}::create_launch_pool`,
                typeArguments,
                arguments: args,
            });
            return tx;
        });
    }
    creatPurchasePayload(params) {
        return __awaiter(this, void 0, void 0, function* () {
            const { launchpad } = this.sdk.sdkOptions;
            if (this._sdk.senderAddress.length === 0) {
                throw Error('this config sdk senderAddress is empty');
            }
            const tx = new sui_js_1.TransactionBlock();
            tx.setGasBudget(this._sdk.gasConfig.GasBudgetHigh2);
            const primaryCoinInputs = (yield transaction_util_1.TransactionUtil.syncBuildCoinInputForAmount(this._sdk, tx, BigInt(params.purchase_amount), params.coin_type_raise));
            const purchaseMark = (yield this.getPurchaseMarks(this._sdk.senderAddress, [params.pool_address], false))[0];
            const typeArguments = [params.coin_type_sale, params.coin_type_raise];
            let args;
            if (purchaseMark) {
                args = [
                    tx.pure(params.pool_address),
                    tx.pure(launchpad.config.config_cap_id),
                    tx.pure(purchaseMark.id),
                    primaryCoinInputs,
                    tx.pure(params.purchase_amount.toString()),
                    tx.pure(sui_1.CLOCK_ADDRESS),
                ];
            }
            else {
                args = [
                    tx.pure(params.pool_address),
                    tx.pure(launchpad.config.config_cap_id),
                    primaryCoinInputs,
                    tx.pure(params.purchase_amount.toString()),
                    tx.pure(sui_1.CLOCK_ADDRESS),
                ];
            }
            tx.moveCall({
                target: `${launchpad.ido_router}::${luanchpa_type_1.LaunchpadRouterModule}::${purchaseMark === undefined ? 'create_and_purchase' : 'purchase'}`,
                typeArguments,
                arguments: args,
            });
            return tx;
        });
    }
    creatClaimPayload(params) {
        return __awaiter(this, void 0, void 0, function* () {
            const { launchpad } = this.sdk.sdkOptions;
            if (this._sdk.senderAddress.length === 0) {
                throw Error('this config sdk senderAddress is empty');
            }
            const purchaseMark = (yield this.getPurchaseMarks(this._sdk.senderAddress, [params.pool_address], false))[0];
            const tx = new sui_js_1.TransactionBlock();
            tx.setGasBudget(this._sdk.gasConfig.GasBudgetHigh2);
            const typeArguments = [params.coin_type_sale, params.coin_type_raise];
            const args = [tx.pure(params.pool_address), tx.pure(launchpad.config.config_cap_id), tx.pure(purchaseMark === null || purchaseMark === void 0 ? void 0 : purchaseMark.id), tx.pure(sui_1.CLOCK_ADDRESS)];
            tx.moveCall({
                target: `${launchpad.ido_router}::${luanchpa_type_1.LaunchpadRouterModule}::claim`,
                typeArguments,
                arguments: args,
            });
            return tx;
        });
    }
    creatSettlePayload(params) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            const { launchpad, clmm } = this.sdk.sdkOptions;
            if (this._sdk.senderAddress.length === 0) {
                throw Error('this config sdk senderAddress is empty');
            }
            this.assertLuanchpadConfig();
            const clmmEvent = clmm.config;
            const { clmm_args } = params;
            const tx = new sui_js_1.TransactionBlock();
            tx.setSender(this.sdk.senderAddress);
            const typeArguments = [params.coin_type_sale, params.coin_type_raise];
            if (clmm_args) {
                const initialize_sqrt_price = clmm_args.opposite
                    ? math_1.TickMath.priceToSqrtPriceX64((0, utils_1.d)(1).div(clmm_args.current_price), // 0.01
                    clmm_args.raise_decimals, clmm_args.sale_decimals).toString()
                    : math_1.TickMath.priceToSqrtPriceX64((0, utils_1.d)(clmm_args.current_price), // 0.01
                    clmm_args.sale_decimals, clmm_args.raise_decimals).toString();
                const a2b = BigInt(initialize_sqrt_price) < BigInt(clmm_args.clmm_sqrt_price);
                console.log('creatSettlePayload###initialize_sqrt_price###', initialize_sqrt_price);
                console.log('creatSettlePayload###clmm_args.clmm_sqrt_price###', clmm_args.clmm_sqrt_price);
                console.log('creatSettlePayload###a2b###', a2b);
                // eslint-disable-next-line no-nested-ternary
                const needCoinType = clmm_args.opposite
                    ? a2b
                        ? params.coin_type_raise
                        : params.coin_type_sale
                    : a2b
                        ? params.coin_type_sale
                        : params.coin_type_raise;
                const coinAssets = yield this._sdk.Resources.getOwnerCoinAssets(this._sdk.senderAddress, needCoinType);
                let needAmount = math_1.CoinAssist.calculateTotalBalance(coinAssets);
                tx.setGasBudget(this._sdk.gasConfig.GasBudgetHigh);
                if (math_1.CoinAssist.isSuiCoin(needCoinType)) {
                    needAmount -= BigInt(this._sdk.gasConfig.GasBudgetHigh);
                }
                console.log('creatSettlePayload###coinAssets###', coinAssets);
                console.log('creatSettlePayload###needAmount###', needAmount);
                console.log('creatSettlePayload###needCoinType###', needCoinType);
                const primaryCoinInputsR = (_a = transaction_util_1.TransactionUtil.buildCoinInputForAmount(tx, coinAssets, needAmount, needCoinType)) === null || _a === void 0 ? void 0 : _a.transactionArgument;
                const primaryCoinInputs = primaryCoinInputsR;
                // eslint-disable-next-line no-nested-ternary
                const funName = clmm_args.opposite
                    ? a2b
                        ? 'settle_with_reverse_clmm_only_with_a'
                        : 'settle_with_reverse_clmm_only_with_b'
                    : a2b
                        ? 'settle_only_with_a'
                        : 'settle_only_with_b';
                console.log('creatSettlePayload###funName###', funName);
                console.log('creatSettlePayload###primaryCoinInputs###', primaryCoinInputs);
                const args = [
                    tx.pure(params.pool_address),
                    tx.pure(launchpad.config.config_cap_id),
                    tx.pure(clmm_args.clmm_pool_address),
                    tx.pure(clmmEvent.global_config_id),
                    // tx.pure(launchpad.config!.lock_manager_id),
                    tx.pure(initialize_sqrt_price),
                    primaryCoinInputs,
                    tx.pure(sui_1.CLOCK_ADDRESS),
                ];
                console.log('creatSettlePayload###args###', args);
                tx.moveCall({
                    target: `${launchpad.ido_router}::${luanchpa_type_1.LaunchpadRouterModule}::${funName}`,
                    typeArguments,
                    arguments: args,
                });
            }
            else {
                tx.setGasBudget(this._sdk.gasConfig.GasBudgetMiddle2);
                tx.moveCall({
                    target: `${launchpad.ido_router}::${luanchpa_type_1.LaunchpadRouterModule}::settle`,
                    typeArguments,
                    arguments: [tx.pure(params.pool_address), tx.pure(launchpad.config.config_cap_id), tx.pure(sui_1.CLOCK_ADDRESS)],
                });
            }
            return tx;
        });
    }
    creatWithdrawPayload(params) {
        const { launchpad } = this.sdk.sdkOptions;
        const tx = new sui_js_1.TransactionBlock();
        tx.setGasBudget(this._sdk.gasConfig.GasBudgetMiddle);
        const typeArguments = [params.coin_type_sale, params.coin_type_raise];
        const args = [tx.object(params.pool_address), tx.object(launchpad.config.config_cap_id), tx.object(sui_1.CLOCK_ADDRESS)];
        if (params.sale_amount > BigInt(0)) {
            tx.moveCall({
                target: `${launchpad.ido_router}::${luanchpa_type_1.LaunchpadRouterModule}::withdraw_sale`,
                typeArguments,
                arguments: args,
            });
        }
        if (params.raise_amount > BigInt(0)) {
            tx.moveCall({
                target: `${launchpad.ido_router}::${luanchpa_type_1.LaunchpadRouterModule}::withdraw_raise`,
                typeArguments,
                arguments: args,
            });
        }
        return tx;
    }
    addUserToWhitelisPayload(params) {
        const { launchpad } = this.sdk.sdkOptions;
        this.assertLuanchpadConfig();
        const tx = new sui_js_1.TransactionBlock();
        tx.setGasBudget(this._sdk.gasConfig.GasBudgetHigh2);
        const typeArguments = [params.coin_type_sale, params.coin_type_raise];
        params.user_addrs.forEach((user_addr) => {
            const args = [
                tx.object(launchpad.config.admin_cap_id),
                tx.object(launchpad.config.config_cap_id),
                tx.object(params.pool_address),
                tx.object(user_addr),
                tx.pure(params.safe_limit_amount),
                tx.object(sui_1.CLOCK_ADDRESS),
            ];
            tx.moveCall({
                target: `${launchpad.ido_router}::${luanchpa_type_1.LaunchpadRouterModule}::add_user_to_whitelist`,
                typeArguments,
                arguments: args,
            });
        });
        return tx;
    }
    updateWhitelistCaPayload(params) {
        const { launchpad } = this.sdk.sdkOptions;
        this.assertLuanchpadConfig();
        const tx = new sui_js_1.TransactionBlock();
        tx.setGasBudget(this._sdk.gasConfig.GasBudgetHigh2);
        const typeArguments = [params.coin_type_sale, params.coin_type_raise];
        if (params.safe_limit_amount > 0) {
            tx.moveCall({
                target: `${launchpad.ido_router}::${luanchpa_type_1.LaunchpadRouterModule}::update_whitelist_member_safe_limit_amount`,
                typeArguments,
                arguments: [
                    tx.object(launchpad.config.admin_cap_id),
                    tx.object(launchpad.config.config_cap_id),
                    tx.object(params.pool_address),
                    tx.pure(params.white_list_member),
                    tx.pure(params.safe_limit_amount),
                    tx.object(sui_1.CLOCK_ADDRESS),
                ],
            });
        }
        if (params.hard_cap_total > 0) {
            tx.moveCall({
                target: `${launchpad.ido_router}::${luanchpa_type_1.LaunchpadRouterModule}::update_whitelist_hard_cap_total`,
                typeArguments,
                arguments: [
                    tx.object(launchpad.config.admin_cap_id),
                    tx.object(launchpad.config.config_cap_id),
                    tx.object(params.pool_address),
                    tx.pure(params.hard_cap_total),
                    tx.object(sui_1.CLOCK_ADDRESS),
                ],
            });
        }
        return tx;
    }
    creatRemoveWhitelistPayload(params) {
        const { launchpad } = this.sdk.sdkOptions;
        this.assertLuanchpadConfig();
        const tx = new sui_js_1.TransactionBlock();
        tx.setGasBudget(this._sdk.gasConfig.GasBudgetMiddle);
        const typeArguments = [params.coin_type_sale, params.coin_type_raise];
        params.user_addrs.forEach((user_addr) => {
            const args = [
                tx.pure(launchpad.config.admin_cap_id),
                tx.pure(launchpad.config.config_cap_id),
                tx.pure(params.pool_address),
                tx.pure(user_addr),
                tx.pure(sui_1.CLOCK_ADDRESS),
            ];
            tx.moveCall({
                target: `${launchpad.ido_router}::${luanchpa_type_1.LaunchpadRouterModule}::remove_user_from_whitelist`,
                typeArguments,
                arguments: args,
            });
        });
        return tx;
    }
    creatCancelPoolPayload(params) {
        const { launchpad } = this.sdk.sdkOptions;
        this.assertLuanchpadConfig();
        const tx = new sui_js_1.TransactionBlock();
        tx.setGasBudget(this._sdk.gasConfig.GasBudgetLow);
        const typeArguments = [params.coin_type_sale, params.coin_type_raise];
        const args = [
            tx.pure(launchpad.config.admin_cap_id),
            tx.pure(launchpad.config.config_cap_id),
            tx.pure(params.pool_address),
            tx.pure(sui_1.CLOCK_ADDRESS),
        ];
        tx.moveCall({
            target: `${launchpad.ido_router}::${luanchpa_type_1.LaunchpadRouterModule}::cancel`,
            typeArguments,
            arguments: args,
        });
        return tx;
    }
    updateRecipientPayload(params) {
        const { launchpad } = this.sdk.sdkOptions;
        this.assertLuanchpadConfig();
        const tx = new sui_js_1.TransactionBlock();
        tx.setGasBudget(this._sdk.gasConfig.GasBudgetLow);
        const typeArguments = [params.coin_type_sale, params.coin_type_raise];
        const args = [
            tx.pure(launchpad.config.admin_cap_id),
            tx.pure(launchpad.config.config_cap_id),
            tx.pure(params.pool_address),
            tx.pure(params.new_recipient),
            tx.pure(sui_1.CLOCK_ADDRESS),
        ];
        tx.moveCall({
            target: `${launchpad.ido_router}::${luanchpa_type_1.LaunchpadRouterModule}::update_recipient_address`,
            typeArguments,
            arguments: args,
        });
        return tx;
    }
    updatePoolDuractionPayload(params) {
        const { launchpad } = this.sdk.sdkOptions;
        this.assertLuanchpadConfig();
        const tx = new sui_js_1.TransactionBlock();
        tx.setGasBudget(this._sdk.gasConfig.GasBudgetLow);
        const typeArguments = [params.coin_type_sale, params.coin_type_raise];
        const args = [
            tx.pure(launchpad.config.admin_cap_id),
            tx.pure(launchpad.config.config_cap_id),
            tx.pure(params.pool_address),
            tx.pure(params.activity_duration),
            tx.pure(params.settle_duration),
            tx.pure(params.lock_duration),
            tx.pure(sui_1.CLOCK_ADDRESS),
        ];
        tx.moveCall({
            target: `${launchpad.ido_router}::${luanchpa_type_1.LaunchpadRouterModule}::update_pool_duration`,
            typeArguments,
            arguments: args,
        });
        return tx;
    }
    creatUnlockNftPayload(params) {
        const { launchpad } = this.sdk.sdkOptions;
        if (launchpad.config === undefined) {
            throw Error('launchpad.config  is null');
        }
        const tx = new sui_js_1.TransactionBlock();
        tx.setGasBudget(this._sdk.gasConfig.GasBudgetLow);
        const typeArguments = [params.nft_type];
        // const args = [tx.pure(launchpad.config.lock_manager_id), tx.pure(params.lock_nft), tx.pure(CLOCK_ADDRESS)]
        const args = [tx.pure(params.lock_nft), tx.pure(sui_1.CLOCK_ADDRESS)];
        tx.moveCall({
            target: `${launchpad.ido_router}::lock::unlock_nft`,
            typeArguments,
            arguments: args,
        });
        return tx;
    }
    isAdminCap(walletAddress) {
        return __awaiter(this, void 0, void 0, function* () {
            const { launchpad } = this._sdk.sdkOptions;
            if (launchpad.config === undefined) {
                throw Error('launchpad config is empty');
            }
            const object = yield this._sdk.fullClient.getObject({
                id: launchpad.config.admin_cap_id,
                options: { showType: true, showOwner: true },
            });
            console.log(object);
            const type = (0, sui_js_1.getObjectType)(object);
            const owner = (0, sui_js_1.getObjectOwner)(object);
            if (owner && type && (0, contracts_1.extractStructTagFromType)(type).source_address === `${launchpad.ido_display}::config::AdminCap`) {
                const addressOwner = owner;
                return (0, sui_js_1.normalizeSuiAddress)(addressOwner.AddressOwner) === (0, sui_js_1.normalizeSuiAddress)(walletAddress);
            }
            return false;
        });
    }
    isWhiteListUser(whitetHandle, walletAddress) {
        return __awaiter(this, void 0, void 0, function* () {
            const name = {
                type: 'address',
                value: walletAddress,
            };
            try {
                const res = yield this._sdk.fullClient.getDynamicFieldObject({ parentId: whitetHandle, name });
                if (res && res.data) {
                    return true;
                }
                return false;
            }
            catch (error) {
                return false;
            }
        });
    }
    getPurchaseAmount(purchaseHandle, walletAddress) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            const name = {
                type: 'address',
                value: walletAddress,
            };
            try {
                const result = yield this._sdk.fullClient.getDynamicFieldObject({ parentId: purchaseHandle, name });
                const fields = (0, sui_js_1.getObjectFields)(result);
                console.log(fields);
                if (fields) {
                    return (_a = fields === null || fields === void 0 ? void 0 : fields.value) === null || _a === void 0 ? void 0 : _a.fields;
                }
            }
            catch (error) {
                //
            }
            return { safe_limit_amount: '0', safe_purchased_amount: '0' };
        });
    }
    getPurchaseMarks(accountAddress, poolAddressArray = [], forceRefresh = true) {
        return __awaiter(this, void 0, void 0, function* () {
            const { launchpad } = this._sdk.sdkOptions;
            const cacheKey = `${poolAddressArray}_getPurchaseMark`;
            const cacheData = this._cache[cacheKey];
            if (!forceRefresh && cacheData !== undefined && cacheData.getCacheData()) {
                return cacheData.value;
            }
            let cursor = null;
            const purchaseMarks = [];
            while (true) {
                // eslint-disable-next-line no-await-in-loop
                const ownerRes = yield this._sdk.fullClient.getOwnedObjects({
                    owner: accountAddress,
                    options: { showType: true, showContent: true, showDisplay: true },
                    cursor,
                    // filter: { StructType: `${launchpad.ido_display}::pool::PurchaseMark` },
                });
                for (const item of ownerRes.data) {
                    const { fields } = item.data.content;
                    const type = (0, contracts_1.extractStructTagFromType)((0, sui_js_1.getMoveObjectType)(item)).source_address;
                    if (type === `${launchpad.ido_display}::pool::PurchaseMark`) {
                        console.log('fields: ', fields);
                        const purchaseMark = {
                            id: fields.id.id,
                            pool_id: (0, contracts_1.extractStructTagFromType)(fields.pool_id).address,
                            purchase_total: fields.purchase_total,
                            obtain_sale_amount: fields.obtain_sale_amount,
                            used_raise_amount: fields.used_raise_amount,
                        };
                        if (poolAddressArray.length > 0) {
                            if (poolAddressArray.includes(purchaseMark.pool_id)) {
                                purchaseMarks.push(purchaseMark);
                            }
                        }
                        else {
                            purchaseMarks.push(purchaseMark);
                        }
                    }
                }
                if (ownerRes.hasNextPage) {
                    cursor = ownerRes.nextCursor;
                }
                else {
                    break;
                }
            }
            this.updateCache(cacheKey, purchaseMarks, exports.cacheTime24h);
            return purchaseMarks;
        });
    }
    getSettleEvent(poolAddress) {
        return __awaiter(this, void 0, void 0, function* () {
            const { launchpad } = this._sdk.sdkOptions;
            const cacheKey = `${poolAddress}_getPurchaseMark`;
            const cacheData = this._cache[cacheKey];
            if (cacheData !== undefined && cacheData.getCacheData()) {
                return cacheData.value;
            }
            const ownerRes = yield (0, utils_1.loopToGetAllQueryEvents)(this._sdk, { query: { MoveEventType: `${launchpad.ido_display}::pool::SettleEvent` } });
            for (const item of ownerRes.data) {
                const parsedJson = item.parsedJson;
                if (poolAddress === (0, sui_js_1.normalizeSuiObjectId)(parsedJson.pool_id)) {
                    const settleEvent = {
                        pool_id: parsedJson.pool_id,
                        settle_price: parsedJson.settle_price,
                        unused_sale: parsedJson.unused_sale,
                        unused_raise: parsedJson.unused_raise,
                        white_purchase_total: parsedJson.white_purchase_total,
                    };
                    this.updateCache(cacheKey, settleEvent, exports.cacheTime24h);
                    return settleEvent;
                }
            }
            return undefined;
        });
    }
    buildLaunchpadCoinType(coin_type_sale, coin_type_raise) {
        return (0, contracts_1.composeType)(this._sdk.sdkOptions.launchpad.ido_display, 'pool', sui_1.PoolLiquidityCoinType, [coin_type_sale, coin_type_raise]);
    }
    assertLuanchpadConfig() {
        const { launchpad } = this.sdk.sdkOptions;
        if (launchpad.config === undefined) {
            throw Error('sdk launchpad.config is null');
        }
    }
    updateCache(key, data, time = exports.cacheTime5min) {
        let cacheData = this._cache[key];
        if (cacheData) {
            cacheData.overdueTime = getFutureTime(time);
            cacheData.value = data;
        }
        else {
            cacheData = new cachedContent_1.CachedContent(data, getFutureTime(time));
        }
        this._cache[key] = cacheData;
    }
}
exports.LaunchpadModule = LaunchpadModule;
