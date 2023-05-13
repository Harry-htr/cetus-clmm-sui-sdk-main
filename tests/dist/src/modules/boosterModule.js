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
exports.BoosterModule = exports.intervalFaucetTime = exports.cacheTime24h = exports.cacheTime5min = void 0;
/* eslint-disable class-methods-use-this */
/* eslint-disable no-await-in-loop */
/* eslint-disable camelcase */
const sui_js_1 = require("@mysten/sui.js");
const bn_js_1 = __importDefault(require("bn.js"));
const utils_1 = require("../utils");
const booster_1 = require("../utils/booster");
const booster_type_1 = require("../types/booster_type");
const sui_1 = require("../types/sui");
const cachedContent_1 = require("../utils/cachedContent");
exports.cacheTime5min = 5 * 60 * 1000;
exports.cacheTime24h = 24 * 60 * 60 * 1000;
exports.intervalFaucetTime = 12 * 60 * 60 * 1000;
function getFutureTime(interval) {
    return Date.parse(new Date().toString()) + interval;
}
class BoosterModule {
    constructor(sdk) {
        this._cache = {};
        this._sdk = sdk;
    }
    get sdk() {
        return this._sdk;
    }
    getPoolImmutables(forceRefresh = false) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            const { booster } = this._sdk.sdkOptions;
            const cacheKey = `${booster.booster_display}_getPoolImmutables`;
            const cacheData = this._cache[cacheKey];
            const allPool = [];
            if (cacheData !== undefined && cacheData.getCacheData() && !forceRefresh) {
                allPool.push(...cacheData.value);
            }
            else {
                const simplePoolIds = [];
                const result = yield this._sdk.fullClient.getDynamicFields({ parentId: booster.config.booster_pool_handle });
                (_a = result.data) === null || _a === void 0 ? void 0 : _a.forEach((item) => {
                    simplePoolIds.push(item.objectId);
                });
                const simpleDatas = yield (0, utils_1.multiGetObjects)(this._sdk, simplePoolIds, {
                    showContent: true,
                });
                for (const item of simpleDatas) {
                    const fields = (0, sui_js_1.getObjectFields)(item);
                    if (fields) {
                        allPool.push(booster_1.BoosterUtil.buildPoolImmutables(fields));
                    }
                }
            }
            return allPool;
        });
    }
    getPoolImmutable(poolObjectId) {
        return __awaiter(this, void 0, void 0, function* () {
            const { booster } = this._sdk.sdkOptions;
            const cacheKey = `${booster}_getPoolImmutables`;
            const cacheData = this._cache[cacheKey];
            if (cacheData !== undefined && cacheData.getCacheData()) {
                const poolImmutableool = cacheData.value.filter((item) => {
                    return poolObjectId === item.pool_id;
                });
                if (poolImmutableool.length > 0) {
                    return poolImmutableool[0];
                }
            }
            const result = yield this._sdk.fullClient.getDynamicFieldObject({
                parentId: booster.config.booster_pool_handle,
                name: {
                    type: '0x2::object::ID',
                    value: poolObjectId,
                },
            });
            const fields = (0, sui_js_1.getObjectFields)(result);
            return booster_1.BoosterUtil.buildPoolImmutables(fields);
        });
    }
    getPools() {
        return __awaiter(this, void 0, void 0, function* () {
            const allPool = [];
            const poolImmutables = yield this.getPoolImmutables();
            const poolObjectIds = poolImmutables.map((item) => {
                return item.pool_id;
            });
            const objectDataResponses = yield (0, utils_1.multiGetObjects)(this._sdk, poolObjectIds, { showType: true, showContent: true });
            let index = 0;
            for (const suiObj of objectDataResponses) {
                const poolState = booster_1.BoosterUtil.buildPoolState(suiObj);
                if (poolState) {
                    const pool = Object.assign(Object.assign({}, poolImmutables[index]), poolState);
                    allPool.push(pool);
                    const cacheKey = `${pool.pool_id}_getPoolObject`;
                    this.updateCache(cacheKey, pool, exports.cacheTime24h);
                }
                index += 1;
            }
            return allPool;
        });
    }
    getPool(poolObjectId, forceRefresh = true) {
        return __awaiter(this, void 0, void 0, function* () {
            const cacheKey = `${poolObjectId}_getPoolObject`;
            const cacheData = this._cache[cacheKey];
            const poolImmutables = yield this.getPoolImmutable(poolObjectId);
            if (cacheData !== undefined && cacheData.getCacheData() && !forceRefresh) {
                const poolState = cacheData.value;
                return Object.assign(Object.assign({}, poolImmutables), poolState);
            }
            const objects = yield this._sdk.fullClient.getObject({
                id: poolObjectId,
                options: { showContent: true, showType: true },
            });
            const poolState = booster_1.BoosterUtil.buildPoolState(objects);
            const pool = Object.assign(Object.assign({}, poolImmutables), poolState);
            this.updateCache(cacheKey, pool, exports.cacheTime24h);
            return pool;
        });
    }
    getPoolHandleId(booster_config_id) {
        return __awaiter(this, void 0, void 0, function* () {
            const reault = yield this._sdk.fullClient.getObject({ id: booster_config_id, options: { showContent: true } });
            const fields = (0, sui_js_1.getObjectFields)(reault);
            if (fields) {
                return fields.list.fields.id.id;
            }
            return '';
        });
    }
    getInitFactoryEvent() {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            const { booster_display } = this.sdk.sdkOptions.booster;
            const initEventObjects = (_a = (yield (0, utils_1.loopToGetAllQueryEvents)(this._sdk, { query: { MoveEventType: `${booster_display}::config::InitEvent` } }))) === null || _a === void 0 ? void 0 : _a.data;
            const initEvent = {
                booster_config_id: '',
                booster_pool_handle: '',
            };
            if (initEventObjects.length > 0) {
                initEventObjects.forEach((item) => {
                    const fields = item.parsedJson;
                    if (fields) {
                        initEvent.booster_config_id = fields.config_id;
                    }
                });
            }
            initEvent.booster_pool_handle = yield this.getPoolHandleId(initEvent.booster_config_id);
            return initEvent;
        });
    }
    getOwnerLockNfts(accountAddress, clmm_pool_id) {
        return __awaiter(this, void 0, void 0, function* () {
            const { booster } = this.sdk.sdkOptions;
            const lockCetuss = [];
            const filterType = `${booster.booster_display}::lock_nft::LockNFT<${this._sdk.Resources.buildPositionType()}>`;
            const ownerRes = yield (0, utils_1.getOwnedObjects)(this._sdk, accountAddress, {
                options: { showType: true, showContent: true, showOwner: true },
                filter: { StructType: filterType },
            });
            for (const item of ownerRes.data) {
                const type = (0, utils_1.extractStructTagFromType)((0, sui_js_1.getMoveObjectType)(item)).source_address;
                if (type === filterType) {
                    if (item.data) {
                        const lockCetus = booster_1.BoosterUtil.buildLockNFT(item);
                        if (lockCetus) {
                            if (clmm_pool_id === undefined || clmm_pool_id === lockCetus.lock_clmm_position.pool) {
                                lockCetuss.push(lockCetus);
                            }
                        }
                    }
                }
            }
            return lockCetuss;
        });
    }
    getLockNftById(locked_nft_id) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield this._sdk.fullClient.getObject({
                id: locked_nft_id,
                options: { showContent: true, showOwner: true },
            });
            return booster_1.BoosterUtil.buildLockNFT(result);
        });
    }
    getLockPositionInfos(lock_positions_handle, lock_nft_ids = []) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield this._sdk.fullClient.getDynamicFields({
                parentId: lock_positions_handle,
            });
            // console.log(result.data)
            const objectIds = [];
            const positionList = [];
            (_a = result.data) === null || _a === void 0 ? void 0 : _a.forEach((item) => {
                if (lock_nft_ids.length > 0) {
                    if (lock_nft_ids.includes(item.name.value)) {
                        objectIds.push(item.objectId);
                    }
                }
                else {
                    objectIds.push(item.objectId);
                }
            });
            if (objectIds.length > 0) {
                const results = yield (0, utils_1.multiGetObjects)(this._sdk, objectIds, { showContent: true });
                results.forEach((data) => {
                    const position = booster_1.BoosterUtil.buildLockPositionInfo(data);
                    if (position) {
                        positionList.push(position);
                    }
                });
            }
            return positionList;
        });
    }
    getLockPositionInfo(lock_positions_handle, lock_nft_id) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield this._sdk.fullClient.getDynamicFieldObject({
                parentId: lock_positions_handle,
                name: {
                    type: '0x2::object::ID',
                    value: lock_nft_id,
                },
            });
            return booster_1.BoosterUtil.buildLockPositionInfo(result);
        });
    }
    getLockPositionInfoById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield this._sdk.fullClient.getObject({ id, options: { showContent: true } });
            return booster_1.BoosterUtil.buildLockPositionInfo(result);
        });
    }
    calculateXCetusRewarder(clmmRewarders, boosterPool, lockPositionInfo) {
        let multiplier = boosterPool.basic_percent;
        let rewarder_now = '0';
        clmmRewarders.forEach((item) => {
            if (item.coin_address === boosterPool.booster_type) {
                console.log('find ', boosterPool.booster_type);
                rewarder_now = item.amount_owed.toString();
            }
        });
        if (!lockPositionInfo.is_settled) {
            boosterPool.config.forEach((item) => {
                if (item.lock_day === lockPositionInfo.lock_period) {
                    multiplier = item.multiplier;
                }
            });
        }
        const xcetus_amount = (0, utils_1.d)(rewarder_now).sub(lockPositionInfo.growth_rewarder).mul(multiplier);
        const xcetus_reward_amount = (0, utils_1.d)(lockPositionInfo.xcetus_owned).add(xcetus_amount);
        return new bn_js_1.default(xcetus_reward_amount.toString());
    }
    /**
     * lock position
     * @param params
     * @returns
     */
    lockPositionPayload(params) {
        const { booster, clmm } = this.sdk.sdkOptions;
        const tx = new sui_js_1.TransactionBlock();
        tx.setGasBudget(this._sdk.gasConfig.GasBudgetMiddle);
        tx.moveCall({
            target: `${booster.booster_router}::${booster_type_1.BoosterRouterModule}::lock_position`,
            typeArguments: [params.booster_type, params.coinTypeA, params.coinTypeB],
            arguments: [
                tx.pure(booster.config.booster_config_id),
                tx.pure(clmm.config.global_config_id),
                tx.pure(params.booster_pool_id),
                tx.pure(params.clmm_pool_id),
                tx.pure(params.clmm_position_id),
                tx.pure(params.lock_day),
                tx.pure(sui_1.CLOCK_ADDRESS),
            ],
        });
        return tx;
    }
    /**
     * Cancel lock
     * @param params
     * @returns
     */
    canceLockPositionPayload(params) {
        const { booster } = this.sdk.sdkOptions;
        const tx = new sui_js_1.TransactionBlock();
        tx.setGasBudget(this._sdk.gasConfig.GasBudgetMiddle);
        tx.moveCall({
            target: `${booster.booster_router}::${booster_type_1.BoosterRouterModule}::cancel_lock`,
            typeArguments: [params.booster_type],
            arguments: [
                tx.pure(booster.config.booster_config_id),
                tx.pure(params.booster_pool_id),
                tx.pure(params.lock_nft_id),
                tx.pure(sui_1.CLOCK_ADDRESS),
            ],
        });
        return tx;
    }
    /**
     * Redeem the rewarder, get back the Clmm Position if the lock time ends.
     * @param params
     * @returns
     */
    redeemPayload(params) {
        const { booster, clmm, xcetus } = this.sdk.sdkOptions;
        const tx = new sui_js_1.TransactionBlock();
        tx.setGasBudget(this._sdk.gasConfig.GasBudgetMiddle);
        tx.moveCall({
            target: `${booster.booster_router}::${booster_type_1.BoosterRouterModule}::redeem`,
            typeArguments: [params.booster_type, params.coinTypeA, params.coinTypeB],
            arguments: [
                tx.pure(booster.config.booster_config_id),
                tx.pure(clmm.config.global_config_id),
                tx.pure(params.booster_pool_id),
                tx.pure(params.lock_nft_id),
                tx.pure(params.clmm_pool_id),
                tx.pure(xcetus.config.lock_manager_id),
                tx.pure(xcetus.config.xcetus_manager_id),
                tx.pure(params.ve_nft_id),
                tx.pure(sui_1.CLOCK_ADDRESS),
            ],
        });
        return tx;
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
exports.BoosterModule = BoosterModule;
