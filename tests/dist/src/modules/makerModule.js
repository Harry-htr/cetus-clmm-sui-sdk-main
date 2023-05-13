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
exports.MakerModule = exports.intervalFaucetTime = exports.cacheTime24h = exports.cacheTime5min = void 0;
/* eslint-disable guard-for-in */
/* eslint-disable class-methods-use-this */
/* eslint-disable no-await-in-loop */
/* eslint-disable camelcase */
const sui_js_1 = require("@mysten/sui.js");
const decimal_js_1 = __importDefault(require("decimal.js"));
const utils_1 = require("../utils");
const maker_1 = require("../utils/maker");
const maker_type_1 = require("../types/maker_type");
const cachedContent_1 = require("../utils/cachedContent");
const resourcesModule_1 = require("./resourcesModule");
exports.cacheTime5min = 5 * 60 * 1000;
exports.cacheTime24h = 24 * 60 * 60 * 1000;
exports.intervalFaucetTime = 12 * 60 * 60 * 1000;
function getFutureTime(interval) {
    return Date.parse(new Date().toString()) + interval;
}
class MakerModule {
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
            const { maker_bonus } = this._sdk.sdkOptions;
            const cacheKey = `${maker_bonus.maker_display}_getPoolImmutables`;
            const cacheData = this._cache[cacheKey];
            const allPool = [];
            if (cacheData !== undefined && cacheData.getCacheData() && !forceRefresh) {
                allPool.push(...cacheData.value);
            }
            else {
                const simplePoolIds = [];
                const result = yield this._sdk.fullClient.getDynamicFields({ parentId: maker_bonus.config.maker_pool_handle });
                (_a = result.data) === null || _a === void 0 ? void 0 : _a.forEach((item) => {
                    simplePoolIds.push(item.objectId);
                });
                const simpleDatas = yield (0, utils_1.multiGetObjects)(this._sdk, simplePoolIds, { showContent: true });
                for (const item of simpleDatas) {
                    const fields = (0, sui_js_1.getObjectFields)(item);
                    if (fields) {
                        allPool.push(maker_1.MakerUtil.buildPoolImmutables(fields));
                    }
                }
            }
            return allPool;
        });
    }
    getPoolImmutable(poolObjectId) {
        return __awaiter(this, void 0, void 0, function* () {
            const { maker_bonus } = this._sdk.sdkOptions;
            const cacheKey = `${maker_bonus.maker_display}_getPoolImmutables`;
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
                parentId: maker_bonus.config.maker_pool_handle,
                name: {
                    type: '0x2::object::ID',
                    value: poolObjectId,
                },
            });
            const fields = (0, sui_js_1.getObjectFields)(result);
            return maker_1.MakerUtil.buildPoolImmutables(fields);
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
                const poolState = maker_1.MakerUtil.buildPoolState(suiObj);
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
                return cacheData.value;
            }
            const objects = yield this._sdk.fullClient.getObject({
                id: poolObjectId,
                options: { showContent: true, showType: true },
            });
            const poolState = maker_1.MakerUtil.buildPoolState(objects);
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
    getMakerPoolPeriods(pool, forceRefresh = false) {
        return __awaiter(this, void 0, void 0, function* () {
            const periods = [];
            const cacheKey = `${pool.pool_id}_getMakerPoolPeriods`;
            const cacheData = this._cache[cacheKey];
            if (cacheData !== undefined && cacheData.getCacheData() && !forceRefresh) {
                return cacheData.value;
            }
            const results = yield this._sdk.fullClient.getDynamicFields({ parentId: pool.whale_nfts.whale_nfts_handle });
            results.data.forEach((item) => {
                const info = {
                    id: item.objectId,
                    start_time: 0,
                    end_time: 0,
                    period: Number(item.name.value),
                };
                info.start_time = Number((0, utils_1.d)(pool.start_time)
                    .add((0, utils_1.d)(pool.interval_day)
                    .mul(24 * 3600)
                    .mul(info.period))
                    .toFixed(0, decimal_js_1.default.ROUND_DOWN));
                info.end_time = Number((0, utils_1.d)(info.start_time)
                    .add((0, utils_1.d)(pool.interval_day).mul(24 * 3600))
                    .toFixed(0, decimal_js_1.default.ROUND_DOWN));
                periods.push(info);
            });
            this.updateCache(cacheKey, periods, exports.cacheTime24h);
            return periods;
        });
    }
    getInitFactoryEvent() {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            const { maker_display } = this.sdk.sdkOptions.maker_bonus;
            const initEventObjects = (_a = (yield (0, utils_1.loopToGetAllQueryEvents)(this._sdk, { query: { MoveEventType: `${maker_display}::config::InitEvent` } }))) === null || _a === void 0 ? void 0 : _a.data;
            const initEvent = {
                maker_config_id: '',
                maker_pool_handle: '',
            };
            if (initEventObjects.length > 0) {
                initEventObjects.forEach((item) => {
                    const fields = item.parsedJson;
                    if (fields) {
                        initEvent.maker_config_id = fields.config_id;
                    }
                });
            }
            initEvent.maker_pool_handle = yield this.getPoolHandleId(initEvent.maker_config_id);
            return initEvent;
        });
    }
    getPoolMarkerPositionList(whale_nfts_handle, makerPoolPeriods, forceRefresh = false) {
        return __awaiter(this, void 0, void 0, function* () {
            const recordMarkerPosition = {};
            const notFindMakerPoolPeriods = [];
            if (!forceRefresh) {
                makerPoolPeriods.forEach((item) => {
                    const cacheKey = `${whale_nfts_handle}_${item.period}_getPoolMarkerPositionList`;
                    const cacheData = this._cache[cacheKey];
                    if (cacheData !== undefined && cacheData.getCacheData() && !forceRefresh) {
                        recordMarkerPosition[item.period] = cacheData.value;
                    }
                    else {
                        recordMarkerPosition[item.period] = [];
                        notFindMakerPoolPeriods.push(item);
                    }
                });
            }
            try {
                if (notFindMakerPoolPeriods.length > 0) {
                    const results = yield (0, utils_1.multiGetObjects)(this._sdk, notFindMakerPoolPeriods.map((item) => item.id), { showContent: true });
                    results.forEach((item) => {
                        const fields = (0, sui_js_1.getObjectFields)(item);
                        const bonusInfoList = maker_1.MakerUtil.buildMarkerPositions(fields);
                        if (bonusInfoList.length > 0) {
                            const { period_id } = bonusInfoList[0];
                            const findPeriod = makerPoolPeriods.filter((item) => item.id === period_id)[0];
                            recordMarkerPosition[findPeriod.period] = bonusInfoList;
                        }
                    });
                }
                const allList = [];
                for (const key in recordMarkerPosition) {
                    const markerPosition = recordMarkerPosition[key];
                    markerPosition.forEach((position) => {
                        allList.push(position);
                    });
                }
                if (allList.length > 0) {
                    const positionList = yield this._sdk.Resources.getSipmlePositionList(allList.map((item) => {
                        return item.id;
                    }));
                    for (const bonusInfo of allList) {
                        for (const position of positionList) {
                            if (bonusInfo.id === position.pos_object_id) {
                                bonusInfo.clmm_position = position;
                                break;
                            }
                        }
                    }
                }
            }
            catch (error) {
                console.log(error);
            }
            for (const key in recordMarkerPosition) {
                const cacheKey = `${whale_nfts_handle}_${key}_getPoolMarkerPositionList`;
                this.updateCache(cacheKey, recordMarkerPosition[key], exports.cacheTime24h);
            }
            return recordMarkerPosition;
        });
    }
    updateXCetusRewarderAndFee(pool, positionList, makerPoolPeriod) {
        return __awaiter(this, void 0, void 0, function* () {
            const total_points_after_multiper = yield this.calculateTotalPointsAfterMultiper(pool, makerPoolPeriod);
            for (const position of positionList) {
                yield this.calculateXCetusRewarder(pool, position, makerPoolPeriod.period, total_points_after_multiper);
            }
            return positionList;
        });
    }
    calculateXCetusRewarder(pool, position, period, total_points_after_multiper) {
        return __awaiter(this, void 0, void 0, function* () {
            const rewarder_info = yield this.getPoolBonusInfo(pool.rewarders.rewarder_handle, period);
            const { fee_share_rate } = this.calculateFeeShareRate(pool, position, total_points_after_multiper);
            const bonus_num = (0, utils_1.d)(fee_share_rate).mul(rewarder_info.total_bonus);
            if (position.is_redeemed) {
                position.bonus_num = '0';
            }
            else {
                position.bonus_num = bonus_num.toString();
            }
            return position.bonus_num;
        });
    }
    calculateFeeShareRate(pool, position, total_points_after_multiper) {
        const bonus_percent = maker_1.MakerUtil.getBonusPercent(pool.config, position.percent);
        const points_after_multiper = (0, utils_1.d)(position.point).mul(bonus_percent);
        const fee_share_rate = (0, utils_1.d)(points_after_multiper).div(total_points_after_multiper);
        position.point_after_multiplier = points_after_multiper.toString();
        position.fee_share_rate = Number(fee_share_rate);
        return { fee_share_rate: Number(fee_share_rate), points_after_multiper: points_after_multiper.toString() };
    }
    calculateTotalPointsAfterMultiper(pool, makerPoolPeriod) {
        return __awaiter(this, void 0, void 0, function* () {
            const positionListMap = yield this.getPoolMarkerPositionList(pool.whale_nfts.whale_nfts_handle, [makerPoolPeriod]);
            let total_points_after_multiper = (0, utils_1.d)(0);
            const positionList = positionListMap[makerPoolPeriod.period];
            for (const position of positionList) {
                const bonus_percent = maker_1.MakerUtil.getBonusPercent(pool.config, position.percent);
                const points_after_multiper = (0, utils_1.d)(position.point).mul(bonus_percent);
                total_points_after_multiper = total_points_after_multiper.add(points_after_multiper);
            }
            return total_points_after_multiper.toString();
        });
    }
    calculateAllXCetusRewarder(pools) {
        return __awaiter(this, void 0, void 0, function* () {
            const ownerAddress = this._sdk.senderAddress;
            let claimtotal = (0, utils_1.d)(0);
            // key: pool_id value: nft_ids
            const claimRecord = [];
            for (const pool of pools) {
                const makerPoolPeriods = yield this._sdk.MakerModule.getMakerPoolPeriods(pool);
                const positionList = yield this._sdk.MakerModule.getPoolMarkerPositionList(pool.whale_nfts.whale_nfts_handle, makerPoolPeriods);
                const owner_position_ids = [];
                for (const makerPoolPeriod of makerPoolPeriods) {
                    const ownerList = positionList[makerPoolPeriod.period].filter((item) => {
                        var _a;
                        if (ownerAddress.length === 0) {
                            return false;
                        }
                        return ((_a = item.clmm_position) === null || _a === void 0 ? void 0 : _a.owner) === ownerAddress;
                    });
                    if (ownerList.length > 0) {
                        yield this._sdk.MakerModule.updateXCetusRewarderAndFee(pool, ownerList, makerPoolPeriod);
                        // eslint-disable-next-line no-loop-func
                        ownerList.forEach((item) => {
                            var _a;
                            if (((_a = item.clmm_position) === null || _a === void 0 ? void 0 : _a.position_status) === resourcesModule_1.PositionStatus.Exists && (0, utils_1.d)(item.bonus_num).greaterThan(0)) {
                                claimtotal = claimtotal.add(item.bonus_num);
                                if (!owner_position_ids.includes(item.clmm_position.pos_object_id)) {
                                    owner_position_ids.push(item.clmm_position.pos_object_id);
                                }
                            }
                        });
                    }
                }
                claimRecord.push({
                    bonus_type: pool.bonus_type,
                    pool_id: pool.pool_id,
                    nft_ids: owner_position_ids,
                });
            }
            return {
                claimtotal,
                claimRecord,
            };
        });
    }
    getPoolBonusInfo(rewarder_handle, period, forceRefresh = false) {
        return __awaiter(this, void 0, void 0, function* () {
            const cacheKey = `${rewarder_handle}_${period}_getPoolBonusInfo`;
            const cacheData = this._cache[cacheKey];
            if (cacheData !== undefined && cacheData.getCacheData() && !forceRefresh) {
                return cacheData.value;
            }
            const results = yield this.sdk.fullClient.getDynamicFieldObject({
                parentId: rewarder_handle,
                name: {
                    type: 'u64',
                    value: period.toString(),
                },
            });
            const fields = (0, sui_js_1.getObjectFields)(results);
            const bonusInfo = maker_1.MakerUtil.buildPoolBonusInfo(fields);
            this.updateCache(cacheKey, bonusInfo, exports.cacheTime5min);
            return bonusInfo;
        });
    }
    /**
     * Claim the bonus
     * @param params
     * @returns
     */
    claimPayload(params) {
        const { maker_bonus, xcetus } = this.sdk.sdkOptions;
        const tx = new sui_js_1.TransactionBlock();
        tx.setGasBudget(this._sdk.gasConfig.GasBudgetMiddle);
        tx.moveCall({
            target: `${maker_bonus.maker_router}::${maker_type_1.MakerRouterModule}::claim`,
            typeArguments: [params.bonus_type],
            arguments: [
                tx.pure(maker_bonus.config.maker_config_id),
                tx.pure(params.market_pool_id),
                tx.pure(params.position_nft_id),
                tx.pure(params.phase),
                tx.pure(xcetus.config.lock_manager_id),
                tx.pure(xcetus.config.xcetus_manager_id),
                tx.pure(params.ve_nft_id),
            ],
        });
        return tx;
    }
    claimAllPayload(params) {
        const { maker_bonus, xcetus } = this.sdk.sdkOptions;
        const tx = new sui_js_1.TransactionBlock();
        tx.setGasBudget(this._sdk.gasConfig.GasBudgetHigh3);
        params.whale_nfts.forEach((item) => {
            item.nft_ids.forEach((nft_id) => {
                tx.moveCall({
                    target: `${maker_bonus.maker_router}::${maker_type_1.MakerRouterModule}::claim_all`,
                    typeArguments: [item.bonus_type],
                    arguments: [
                        tx.object(maker_bonus.config.maker_config_id),
                        tx.object(item.pool_id),
                        tx.object(nft_id),
                        tx.object(xcetus.config.lock_manager_id),
                        tx.object(xcetus.config.xcetus_manager_id),
                        tx.object(params.ve_nft_id),
                    ],
                });
            });
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
exports.MakerModule = MakerModule;
