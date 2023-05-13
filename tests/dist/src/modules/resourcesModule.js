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
exports.ResourcesModule = exports.PositionStatus = exports.intervalFaucetTime = exports.cacheTime24h = exports.cacheTime5min = void 0;
/* eslint-disable no-constant-condition */
const sui_js_1 = require("@mysten/sui.js");
const cachedContent_1 = require("../utils/cachedContent");
const common_1 = require("../utils/common");
const contracts_1 = require("../utils/contracts");
const hex_1 = require("../utils/hex");
const CoinAssist_1 = require("../math/CoinAssist");
const utils_1 = require("../utils");
exports.cacheTime5min = 5 * 60 * 1000;
exports.cacheTime24h = 24 * 60 * 60 * 1000;
exports.intervalFaucetTime = 12 * 60 * 60 * 1000;
var PositionStatus;
(function (PositionStatus) {
    PositionStatus["Deleted"] = "Deleted";
    PositionStatus["Exists"] = "Exists";
    PositionStatus["NotExists"] = "NotExists";
})(PositionStatus = exports.PositionStatus || (exports.PositionStatus = {}));
function getFutureTime(interval) {
    return Date.parse(new Date().toString()) + interval;
}
class ResourcesModule {
    constructor(sdk) {
        this._cache = {};
        this._sdk = sdk;
    }
    get sdk() {
        return this._sdk;
    }
    getSuiTransactionResponse(digest, forceRefresh = false) {
        return __awaiter(this, void 0, void 0, function* () {
            const cacheKey = `${digest}_getSuiTransactionResponse`;
            const cacheData = this._cache[cacheKey];
            if (cacheData !== undefined && cacheData.getCacheData() && !forceRefresh) {
                return cacheData.value;
            }
            let objects;
            try {
                objects = (yield this._sdk.fullClient.getTransactionBlock({
                    digest,
                    options: {
                        showEvents: true,
                        showEffects: true,
                        showBalanceChanges: true,
                        showInput: true,
                        showObjectChanges: true,
                    },
                }));
            }
            catch (error) {
                objects = (yield this._sdk.fullClient.getTransactionBlock({
                    digest,
                    options: {
                        showEvents: true,
                        showEffects: true,
                    },
                }));
            }
            this.updateCache(cacheKey, objects, exports.cacheTime24h);
            return objects;
        });
    }
    getFaucetEvent(packageObjectId, walletAddress, forceRefresh = true) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            const cacheKey = `${packageObjectId}_${walletAddress}_getFaucetEvent`;
            const cacheData = this._cache[cacheKey];
            if (cacheData !== undefined && cacheData.getCacheData() && !forceRefresh) {
                return cacheData.value;
            }
            const objects = (_a = (yield (0, utils_1.loopToGetAllQueryEvents)(this._sdk, {
                query: { MoveEventType: `${packageObjectId}::faucet::FaucetEvent` },
            }))) === null || _a === void 0 ? void 0 : _a.data;
            let findFaucetEvent = {
                id: '',
                time: 0,
            };
            objects.forEach((eventObject) => {
                if ((0, hex_1.addHexPrefix)(walletAddress) === eventObject.sender) {
                    const fields = eventObject.parsedJson;
                    if (fields) {
                        const faucetEvent = {
                            id: fields.id,
                            time: Number(fields.time),
                        };
                        const findTime = findFaucetEvent.time;
                        if (findTime > 0) {
                            if (faucetEvent.time > findTime) {
                                findFaucetEvent = faucetEvent;
                            }
                        }
                        else {
                            findFaucetEvent = faucetEvent;
                        }
                    }
                }
            });
            if (findFaucetEvent.time > 0) {
                this.updateCache(cacheKey, findFaucetEvent, exports.cacheTime24h);
                return findFaucetEvent;
            }
            return null;
        });
    }
    getInitEvent(forceRefresh = false) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            const packageObjectId = this._sdk.sdkOptions.clmm.clmm_display;
            const cacheKey = `${packageObjectId}_getInitEvent`;
            const cacheData = this._cache[cacheKey];
            if (cacheData !== undefined && cacheData.getCacheData() && !forceRefresh) {
                return cacheData.value;
            }
            const packageObject = yield this._sdk.fullClient.getObject({
                id: packageObjectId,
                options: { showPreviousTransaction: true },
            });
            const previousTx = (0, sui_js_1.getObjectPreviousTransactionDigest)(packageObject);
            const objects = (_a = (yield (0, utils_1.loopToGetAllQueryEvents)(this._sdk, {
                query: { Transaction: previousTx },
            }))) === null || _a === void 0 ? void 0 : _a.data;
            // console.log('objects: ', objects)
            const initEvent = {
                pools_id: '',
                global_config_id: '',
                global_vault_id: '',
            };
            if (objects.length > 0) {
                objects.forEach((item) => {
                    const fields = item.parsedJson;
                    if (item.type) {
                        switch ((0, contracts_1.extractStructTagFromType)(item.type).full_address) {
                            case `${packageObjectId}::config::InitConfigEvent`:
                                initEvent.global_config_id = fields.global_config_id;
                                break;
                            case `${packageObjectId}::factory::InitFactoryEvent`:
                                initEvent.pools_id = fields.pools_id;
                                break;
                            case `${packageObjectId}::rewarder::RewarderInitEvent`:
                                initEvent.global_vault_id = fields.global_vault_id;
                                break;
                            default:
                                break;
                        }
                    }
                });
                this.updateCache(cacheKey, initEvent, exports.cacheTime24h);
                return initEvent;
            }
            return initEvent;
        });
    }
    getCreatePartnerEvent(forceRefresh = false) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            const packageObjectId = this._sdk.sdkOptions.clmm.clmm_display;
            const cacheKey = `${packageObjectId}_getInitEvent`;
            const cacheData = this._cache[cacheKey];
            if (cacheData !== undefined && cacheData.getCacheData() && !forceRefresh) {
                return cacheData.value;
            }
            const objects = (_a = (yield (0, utils_1.loopToGetAllQueryEvents)(this._sdk, {
                query: { MoveEventType: `${packageObjectId}::partner::CreatePartnerEvent` },
            }))) === null || _a === void 0 ? void 0 : _a.data;
            const events = [];
            if (objects.length > 0) {
                objects.forEach((item) => {
                    events.push(item.parsedJson);
                });
                this.updateCache(cacheKey, events, exports.cacheTime24h);
            }
            return events;
        });
    }
    getPoolImmutables(assignPools = [], offset = 0, limit = 100, forceRefresh = false) {
        return __awaiter(this, void 0, void 0, function* () {
            const clmmIntegrate = this._sdk.sdkOptions.clmm.clmm_display;
            const cacheKey = `${clmmIntegrate}_getInitPoolEvent`;
            const cacheData = this._cache[cacheKey];
            const allPools = [];
            const filterPools = [];
            if (cacheData !== undefined && cacheData.getCacheData() && !forceRefresh) {
                allPools.push(...cacheData.value);
            }
            if (allPools.length === 0) {
                try {
                    const objects = yield (0, utils_1.loopToGetAllQueryEvents)(this._sdk, {
                        query: { MoveEventType: `${clmmIntegrate}::factory::CreatePoolEvent` },
                    });
                    // console.log('objects: ', objects)
                    objects.data.forEach((object) => {
                        const fields = object.parsedJson;
                        if (fields) {
                            allPools.push({
                                poolAddress: fields.pool_id,
                                tickSpacing: fields.tick_spacing,
                                coinTypeA: (0, contracts_1.extractStructTagFromType)(fields.coin_type_a).full_address,
                                coinTypeB: (0, contracts_1.extractStructTagFromType)(fields.coin_type_b).full_address,
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
                if (hasassignPools && !assignPools.includes(item.poolAddress)) {
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
            // console.log(assignPools)
            const allPool = [];
            let poolObjectIds = [];
            if (assignPools.length > 0) {
                poolObjectIds = [...assignPools];
            }
            else {
                const poolImmutables = yield this.getPoolImmutables([], offset, limit, false);
                poolImmutables.forEach((item) => {
                    poolObjectIds.push(item.poolAddress);
                });
            }
            const objectDataResponses = yield (0, common_1.multiGetObjects)(this._sdk, poolObjectIds, {
                showContent: true,
                showType: true,
            });
            for (const suiObj of objectDataResponses) {
                const pool = (0, common_1.buildPool)(suiObj);
                allPool.push(pool);
                const cacheKey = `${pool.poolAddress}_getPoolObject`;
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
                return cacheData.value;
            }
            const objects = (yield this._sdk.fullClient.getObject({
                id: poolObjectId,
                options: {
                    showType: true,
                    showContent: true,
                },
            }));
            const pool = (0, common_1.buildPool)(objects);
            this.updateCache(cacheKey, pool);
            return pool;
        });
    }
    buildPositionType() {
        const cetusClmm = this._sdk.sdkOptions.clmm.clmm_display;
        return `${cetusClmm}::position::Position`;
    }
    getPositionList(accountAddress, assignPoolIds = []) {
        return __awaiter(this, void 0, void 0, function* () {
            const allPosition = [];
            let cursor = null;
            while (true) {
                // eslint-disable-next-line no-await-in-loop
                const ownerRes = yield this._sdk.fullClient.getOwnedObjects({
                    owner: accountAddress,
                    options: { showType: true, showContent: true, showDisplay: true, showOwner: true },
                    cursor,
                    // filter: { Package: cetusClmm },
                });
                const hasAssignPoolIds = assignPoolIds.length > 0;
                for (const item of ownerRes.data) {
                    const type = (0, contracts_1.extractStructTagFromType)(item.data.type);
                    if (type.full_address === this.buildPositionType()) {
                        const position = (0, common_1.buildPosition)(item);
                        const cacheKey = `${position.pos_object_id}_getPositionList`;
                        this.updateCache(cacheKey, position, exports.cacheTime24h);
                        if (hasAssignPoolIds) {
                            if (assignPoolIds.includes(position.pool)) {
                                allPosition.push(position);
                            }
                        }
                        else {
                            allPosition.push(position);
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
            return allPosition;
        });
    }
    getPosition(positionHandle, positionId) {
        return __awaiter(this, void 0, void 0, function* () {
            let position = yield this.getSipmlePosition(positionId);
            position = yield this.updatePositionRewarders(positionHandle, position);
            return position;
        });
    }
    getPositionById(positionId) {
        return __awaiter(this, void 0, void 0, function* () {
            const position = yield this.getSipmlePosition(positionId);
            console.log('position: ', position);
            const pool = yield this.getPool(position.pool, false);
            const result = yield this.updatePositionRewarders(pool.positions_handle, position);
            return result;
        });
    }
    getSipmlePosition(positionId) {
        return __awaiter(this, void 0, void 0, function* () {
            const cacheKey = `${positionId}_getPositionList`;
            let position = this.getSipmlePositionByCache(positionId);
            if (position === undefined) {
                const objectDataResponses = yield this.sdk.fullClient.getObject({
                    id: positionId,
                    options: { showContent: true, showType: true, showDisplay: true, showOwner: true },
                });
                position = (0, common_1.buildPosition)(objectDataResponses);
                this.updateCache(cacheKey, position, exports.cacheTime24h);
            }
            return position;
        });
    }
    getSipmlePositionByCache(positionId) {
        const cacheKey = `${positionId}_getPositionList`;
        const cacheData = this._cache[cacheKey];
        if (cacheData !== undefined && cacheData.getCacheData()) {
            return cacheData.value;
        }
        return undefined;
    }
    getSipmlePositionList(positionIds) {
        return __awaiter(this, void 0, void 0, function* () {
            const positionList = [];
            const notFoundIds = [];
            positionIds.forEach((id) => {
                const position = this.getSipmlePositionByCache(id);
                if (position) {
                    positionList.push(position);
                }
                else {
                    notFoundIds.push(id);
                }
            });
            if (notFoundIds.length > 0) {
                const objectDataResponses = yield (0, common_1.multiGetObjects)(this._sdk, notFoundIds, {
                    showOwner: true,
                    showContent: true,
                    showDisplay: true,
                    showType: true,
                });
                objectDataResponses.forEach((info) => {
                    const position = (0, common_1.buildPosition)(info);
                    positionList.push(position);
                    const cacheKey = `${position.pos_object_id}_getPositionList`;
                    this.updateCache(cacheKey, position, exports.cacheTime24h);
                });
            }
            return positionList;
        });
    }
    updatePositionRewarders(positionHandle, position) {
        return __awaiter(this, void 0, void 0, function* () {
            // const res = await sdk.fullClient.getDynamicFields({parentId: "0x70aca04c93afb16bbe8e7cf132aaa40186e4b3e8197aa239619f662e3eb46a3a"})
            const res = yield this._sdk.fullClient.getDynamicFieldObject({
                parentId: positionHandle,
                name: {
                    type: '0x2::object::ID',
                    value: position.pos_object_id,
                },
            });
            const { fields } = (0, sui_js_1.getObjectFields)(res.data).value.fields.value;
            const positionReward = (0, common_1.buildPositionReward)(fields);
            return Object.assign(Object.assign({}, position), positionReward);
        });
    }
    getOwnerCoinAssets(suiAddress, coinType) {
        return __awaiter(this, void 0, void 0, function* () {
            const allCoinAsset = [];
            let nextCursor = null;
            while (true) {
                // eslint-disable-next-line no-await-in-loop
                const allCoinObject = yield (coinType
                    ? this._sdk.fullClient.getCoins({
                        owner: suiAddress,
                        coinType,
                        cursor: nextCursor,
                    })
                    : this._sdk.fullClient.getAllCoins({
                        owner: suiAddress,
                        cursor: nextCursor,
                    }));
                // eslint-disable-next-line no-loop-func
                allCoinObject.data.forEach((coin) => {
                    if (BigInt(coin.balance) > 0) {
                        allCoinAsset.push({
                            coinAddress: (0, contracts_1.extractStructTagFromType)(coin.coinType).source_address,
                            coinObjectId: coin.coinObjectId,
                            balance: BigInt(coin.balance),
                        });
                    }
                });
                nextCursor = allCoinObject.nextCursor;
                if (!allCoinObject.hasNextPage) {
                    break;
                }
            }
            return allCoinAsset;
        });
    }
    getSuiObjectOwnedByAddress(suiAddress) {
        return __awaiter(this, void 0, void 0, function* () {
            const allSuiObjects = [];
            const allObjectRefs = yield this._sdk.fullClient.getOwnedObjects({
                owner: suiAddress,
            });
            const objectIDs = allObjectRefs.data.map((anObj) => anObj.objectId);
            const allObjRes = yield this._sdk.fullClient.multiGetObjects({
                ids: objectIDs,
            });
            allObjRes.forEach((objRes) => {
                const moveObject = (0, sui_js_1.getMoveObject)(objRes);
                if (moveObject) {
                    const coinAddress = CoinAssist_1.CoinAssist.getCoinTypeArg(moveObject);
                    const balance = sui_js_1.Coin.getBalance(moveObject);
                    const coinAsset = Object.assign({ coinAddress,
                        balance }, moveObject);
                    allSuiObjects.push(coinAsset);
                }
            });
            return allSuiObjects;
        });
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
exports.ResourcesModule = ResourcesModule;
function item(item) {
    throw new Error('Function not implemented.');
}
