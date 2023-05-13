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
exports.XCetusModule = exports.intervalFaucetTime = exports.cacheTime24h = exports.cacheTime5min = void 0;
/* eslint-disable no-await-in-loop */
/* eslint-disable camelcase */
const sui_js_1 = require("@mysten/sui.js");
const decimal_js_1 = __importDefault(require("decimal.js"));
const xcetus_1 = require("../utils/xcetus");
const xcetus_type_1 = require("../types/xcetus_type");
const utils_1 = require("../utils");
const sui_1 = require("../types/sui");
const cachedContent_1 = require("../utils/cachedContent");
const numbers_1 = require("../utils/numbers");
const contracts_1 = require("../utils/contracts");
exports.cacheTime5min = 5 * 60 * 1000;
exports.cacheTime24h = 24 * 60 * 60 * 1000;
exports.intervalFaucetTime = 12 * 60 * 60 * 1000;
function getFutureTime(interval) {
    return Date.parse(new Date().toString()) + interval;
}
class XCetusModule {
    constructor(sdk) {
        this._cache = {};
        this._sdk = sdk;
    }
    get sdk() {
        return this._sdk;
    }
    getOwnerVeNFT(accountAddress, forceRefresh = true) {
        return __awaiter(this, void 0, void 0, function* () {
            const { xcetus } = this.sdk.sdkOptions;
            const cacheKey = `${accountAddress}_getLockUpManagerEvent`;
            const cacheData = this._cache[cacheKey];
            if (!forceRefresh && cacheData !== undefined && cacheData.getCacheData()) {
                return cacheData.value;
            }
            let veNFT;
            const filterType = `${xcetus.xcetus_router}::xcetus::VeNFT`;
            // eslint-disable-next-line no-await-in-loop
            const ownerRes = yield (0, utils_1.getOwnedObjects)(this._sdk, accountAddress, {
                options: { showType: true, showContent: true, showDisplay: true },
                filter: { StructType: filterType },
            });
            // eslint-disable-next-line no-loop-func
            ownerRes.data.forEach((item) => {
                const type = (0, contracts_1.extractStructTagFromType)((0, sui_js_1.getMoveObjectType)(item)).source_address;
                if (type === filterType) {
                    if (item.data && item.data.content) {
                        const { fields } = item.data.content;
                        veNFT = Object.assign(Object.assign({}, (0, utils_1.buildNFT)(item)), { id: fields.id.id, index: fields.index, type, xcetus_balance: fields.xcetus_balance });
                        this.updateCache(cacheKey, veNFT, exports.cacheTime24h);
                    }
                }
            });
            return veNFT;
        });
    }
    getOwnerLockCetuss(accountAddress) {
        return __awaiter(this, void 0, void 0, function* () {
            const { xcetus } = this.sdk.sdkOptions;
            const lockCetuss = [];
            const filterType = `${xcetus.xcetus_router}::lock_coin::LockedCoin<${this.buileCetusCoinType()}>`;
            const ownerRes = yield (0, utils_1.getOwnedObjects)(this._sdk, accountAddress, {
                options: { showType: true, showContent: true },
                filter: { StructType: filterType },
            });
            for (const item of ownerRes.data) {
                const type = (0, contracts_1.extractStructTagFromType)((0, sui_js_1.getMoveObjectType)(item)).source_address;
                if (type === filterType) {
                    if (item.data) {
                        const lockCetus = xcetus_1.XCetusUtil.buildLockCetus(item.data.content);
                        lockCetus.xcetus_amount = yield this.getXCetusAmount(lockCetus.id);
                        lockCetuss.push(lockCetus);
                    }
                }
            }
            return lockCetuss;
        });
    }
    getLockCetus(lock_id) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield this._sdk.fullClient.getObject({ id: lock_id, options: { showType: true, showContent: true } });
            if ((_a = result.data) === null || _a === void 0 ? void 0 : _a.content) {
                const lockCetus = xcetus_1.XCetusUtil.buildLockCetus(result.data.content);
                lockCetus.xcetus_amount = yield this.getXCetusAmount(lockCetus.id);
                return lockCetus;
            }
            return undefined;
        });
    }
    getOwnerCetusCoins(accountAddress) {
        return __awaiter(this, void 0, void 0, function* () {
            const coins = yield this._sdk.Resources.getOwnerCoinAssets(accountAddress, this.buileCetusCoinType());
            return coins;
        });
    }
    /**
     * mint venft
     * @returns
     */
    mintVeNFTPayload() {
        const { xcetus } = this.sdk.sdkOptions;
        const tx = new sui_js_1.TransactionBlock();
        tx.setGasBudget(this._sdk.gasConfig.GasBudgetLow);
        tx.moveCall({
            target: `${xcetus.xcetus_router}::${xcetus_type_1.XcetusRouterModule}::mint_venft`,
            typeArguments: [],
            arguments: [tx.pure(xcetus.config.xcetus_manager_id)],
        });
        return tx;
    }
    /**
     * Convert Cetus to Xcetus.
     * @param params
     * @returns
     */
    convertPayload(params) {
        return __awaiter(this, void 0, void 0, function* () {
            const { xcetus } = this.sdk.sdkOptions;
            const tx = new sui_js_1.TransactionBlock();
            const coin_type = this.buileCetusCoinType();
            const primaryCoinInputs = (yield utils_1.TransactionUtil.syncBuildCoinInputForAmount(this._sdk, tx, BigInt(params.amount), coin_type));
            if (params.venft_id === undefined) {
                tx.setGasBudget(this._sdk.gasConfig.GasBudgetHigh);
                tx.moveCall({
                    target: `${xcetus.xcetus_router}::${xcetus_type_1.XcetusRouterModule}::mint_and_convert`,
                    typeArguments: [],
                    arguments: [
                        tx.object(xcetus.config.lock_manager_id),
                        tx.object(xcetus.config.xcetus_manager_id),
                        primaryCoinInputs,
                        tx.pure(params.amount),
                    ],
                });
            }
            else {
                tx.setGasBudget(this._sdk.gasConfig.GasBudgetLow);
                tx.moveCall({
                    target: `${xcetus.xcetus_router}::${xcetus_type_1.XcetusRouterModule}::convert`,
                    typeArguments: [],
                    arguments: [
                        tx.object(xcetus.config.lock_manager_id),
                        tx.object(xcetus.config.xcetus_manager_id),
                        primaryCoinInputs,
                        tx.pure(params.amount),
                        tx.pure(params.venft_id),
                    ],
                });
            }
            return tx;
        });
    }
    /**
     * Convert Xcetus to Cetus, first step is to lock the Cetus for a period.
     * When the time is reach, cetus can be redeem and xcetus will be burned.
     * @param params
     * @returns
     */
    redeemLockPayload(params) {
        const { xcetus } = this.sdk.sdkOptions;
        const tx = new sui_js_1.TransactionBlock();
        tx.setGasBudget(this._sdk.gasConfig.GasBudgetLow);
        tx.moveCall({
            target: `${xcetus.xcetus_router}::${xcetus_type_1.XcetusRouterModule}::redeem_lock`,
            typeArguments: [],
            arguments: [
                tx.pure(xcetus.config.lock_manager_id),
                tx.pure(xcetus.config.xcetus_manager_id),
                tx.pure(params.venft_id),
                tx.pure(params.amount),
                tx.pure(params.lock_day),
                tx.pure(sui_1.CLOCK_ADDRESS),
            ],
        });
        return tx;
    }
    /**
     * lock time is reach and the cetus can be redeemed, the xcetus will be burned.
     * @param params
     * @returns
     */
    redeemPayload(params) {
        const { xcetus } = this.sdk.sdkOptions;
        const tx = new sui_js_1.TransactionBlock();
        tx.setGasBudget(this._sdk.gasConfig.GasBudgetLow);
        tx.moveCall({
            target: `${xcetus.xcetus_router}::${xcetus_type_1.XcetusRouterModule}::redeem`,
            typeArguments: [],
            arguments: [
                tx.pure(xcetus.config.lock_manager_id),
                tx.pure(xcetus.config.xcetus_manager_id),
                tx.pure(params.venft_id),
                tx.pure(params.lock_id),
                tx.pure(sui_1.CLOCK_ADDRESS),
            ],
        });
        return tx;
    }
    redeemDividendPayload(venft_id, bonus_types) {
        const { xcetus } = this.sdk.sdkOptions;
        const tx = new sui_js_1.TransactionBlock();
        tx.setGasBudget(this._sdk.gasConfig.GasBudgetLow);
        bonus_types.forEach((coin) => {
            tx.moveCall({
                target: `${xcetus.dividends_router}::${xcetus_type_1.DividendsRouterModule}::redeem`,
                typeArguments: [coin],
                arguments: [tx.object(xcetus.config.dividend_manager_id), tx.object(venft_id)],
            });
        });
        return tx;
    }
    buileCetusCoinType() {
        return `${this.sdk.sdkOptions.xcetus.cetus_faucet}::cetus::CETUS`;
    }
    /**
     * Cancel the redeem lock, the cetus locked will be return back to the manager and the xcetus will be available again.
     * @param params
     * @returns
     */
    cancelRedeemPayload(params) {
        const { xcetus } = this.sdk.sdkOptions;
        const tx = new sui_js_1.TransactionBlock();
        tx.setGasBudget(this._sdk.gasConfig.GasBudgetLow);
        tx.moveCall({
            target: `${xcetus.xcetus_router}::${xcetus_type_1.XcetusRouterModule}::cancel_redeem_lock`,
            typeArguments: [],
            arguments: [
                tx.pure(xcetus.config.lock_manager_id),
                tx.pure(xcetus.config.xcetus_manager_id),
                tx.pure(params.venft_id),
                tx.pure(params.lock_id),
                tx.pure(sui_1.CLOCK_ADDRESS),
            ],
        });
        return tx;
    }
    getInitFactoryEvent() {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            const { xcetus_display } = this.sdk.sdkOptions.xcetus;
            const initEventObjects = (_a = (yield (0, utils_1.loopToGetAllQueryEvents)(this._sdk, { query: { MoveEventType: `${xcetus_display}::xcetus::InitEvent` } }))) === null || _a === void 0 ? void 0 : _a.data;
            const initEvent = {
                xcetus_manager_id: '',
            };
            if (initEventObjects.length > 0) {
                initEventObjects.forEach((item) => {
                    const fields = item.parsedJson;
                    if (fields) {
                        initEvent.xcetus_manager_id = fields.xcetus_manager;
                    }
                });
            }
            return initEvent;
        });
    }
    getLockUpManagerEvent() {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            const { xcetus_display } = this.sdk.sdkOptions.xcetus;
            const cacheKey = `${xcetus_display}_getLockUpManagerEvent`;
            const cacheData = this._cache[cacheKey];
            if (cacheData !== undefined && cacheData.getCacheData()) {
                return cacheData.value;
            }
            const lockEventObjects = (_a = (yield (0, utils_1.loopToGetAllQueryEvents)(this._sdk, { query: { MoveEventType: `${xcetus_display}::locking::InitializeEvent` } }))) === null || _a === void 0 ? void 0 : _a.data;
            const initEvent = {
                lock_manager_id: '',
                max_lock_day: 0,
                max_percent_numerator: 0,
                min_lock_day: 0,
                min_percent_numerator: 0,
                lock_handle_id: '',
            };
            if (lockEventObjects.length > 0) {
                lockEventObjects.forEach((item) => {
                    const fields = item.parsedJson;
                    if (fields) {
                        initEvent.lock_manager_id = fields.lock_manager;
                        initEvent.max_lock_day = Number(fields.max_lock_day);
                        initEvent.max_percent_numerator = Number(fields.max_percent_numerator);
                        initEvent.min_lock_day = Number(fields.min_lock_day);
                        initEvent.min_percent_numerator = Number(fields.min_percent_numerator);
                        this.updateCache(cacheKey, initEvent, exports.cacheTime24h);
                    }
                });
            }
            initEvent.lock_handle_id = yield this.getLockInfoHandle();
            return initEvent;
        });
    }
    getLockInfoHandle() {
        return __awaiter(this, void 0, void 0, function* () {
            const { lock_manager_id } = this.sdk.sdkOptions.xcetus.config;
            const cacheKey = `${lock_manager_id}_getLockInfoHandle`;
            const cacheData = this._cache[cacheKey];
            if (cacheData !== undefined && cacheData.getCacheData()) {
                return cacheData.value;
            }
            let lockInfoHandle = '';
            const lockObjects = yield this.sdk.fullClient.getObject({ id: lock_manager_id, options: { showContent: true } });
            const fields = (0, sui_js_1.getObjectFields)(lockObjects);
            if (fields) {
                lockInfoHandle = fields.lock_infos.fields.id.id;
                this.updateCache(cacheKey, lockInfoHandle, exports.cacheTime24h);
            }
            return lockInfoHandle;
        });
    }
    getDividendManagerEvent() {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            const { dividends_display } = this.sdk.sdkOptions.xcetus;
            const cacheKey = `${dividends_display}_getDividendManagerEvent`;
            const cacheData = this._cache[cacheKey];
            if (cacheData !== undefined && cacheData.getCacheData()) {
                return cacheData.value;
            }
            const lockEventObjects = (_a = (yield (0, utils_1.loopToGetAllQueryEvents)(this._sdk, { query: { MoveEventType: `${dividends_display}::dividend::InitEvent` } }))) === null || _a === void 0 ? void 0 : _a.data;
            const initEvent = {
                dividend_manager_id: '',
            };
            if (lockEventObjects.length > 0) {
                lockEventObjects.forEach((item) => {
                    const fields = item.parsedJson;
                    if (fields) {
                        initEvent.dividend_manager_id = fields.manager_id;
                        this.updateCache(cacheKey, initEvent, exports.cacheTime24h);
                    }
                });
            }
            return initEvent;
        });
    }
    getDividendManager(forceRefresh = false) {
        return __awaiter(this, void 0, void 0, function* () {
            const { dividend_manager_id } = this.sdk.sdkOptions.xcetus.config;
            const cacheKey = `${dividend_manager_id}_getDividendManager`;
            const cacheData = this._cache[cacheKey];
            if (!forceRefresh && cacheData !== undefined && cacheData.getCacheData()) {
                return cacheData.value;
            }
            const objects = yield this._sdk.fullClient.getObject({ id: dividend_manager_id, options: { showContent: true } });
            const fields = (0, sui_js_1.getObjectFields)(objects);
            const dividendManager = xcetus_1.XCetusUtil.buildDividendManager(fields);
            this.updateCache(cacheKey, dividendManager, exports.cacheTime24h);
            return dividendManager;
        });
    }
    getXcetusManager() {
        return __awaiter(this, void 0, void 0, function* () {
            const { xcetus } = this.sdk.sdkOptions;
            const result = yield this._sdk.fullClient.getObject({ id: xcetus.config.xcetus_manager_id, options: { showContent: true } });
            const fields = (0, sui_js_1.getObjectFields)(result);
            const xcetusManager = {
                id: fields.id.id,
                index: Number(fields.index),
                has_venft: {
                    handle: fields.has_venft.fields.id.id,
                    size: fields.has_venft.fields.size,
                },
                nfts: {
                    handle: fields.nfts.fields.id.id,
                    size: fields.nfts.fields.size,
                },
                total_locked: fields.total_locked,
                treasury: fields.treasury.fields.total_supply.fields.value,
            };
            return xcetusManager;
        });
    }
    getVeNFTDividendInfo(venft_dividends_handle, venft_id) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const venft_dividends = yield this._sdk.fullClient.getDynamicFieldObject({
                    parentId: venft_dividends_handle,
                    name: {
                        type: '0x2::object::ID',
                        value: venft_id,
                    },
                });
                const fields = (0, sui_js_1.getObjectFields)(venft_dividends);
                const veNFTDividendInfo = xcetus_1.XCetusUtil.buildVeNFTDividendInfo(fields);
                return veNFTDividendInfo;
            }
            catch (error) {
                return undefined;
            }
        });
    }
    redeemNum(redeemAmount, lock_day) {
        return __awaiter(this, void 0, void 0, function* () {
            if (BigInt(redeemAmount) === BigInt(0)) {
                return { amountOut: '0', percent: '0' };
            }
            const lockUpManager = yield this.getLockUpManagerEvent();
            console.log('lockUpManager', lockUpManager);
            const mid = (0, numbers_1.d)(xcetus_type_1.REDEEM_NUM_MULTIPER)
                .mul((0, numbers_1.d)(lockUpManager.max_lock_day).sub((0, numbers_1.d)(lock_day)))
                .mul((0, numbers_1.d)(lockUpManager.max_percent_numerator).sub((0, numbers_1.d)(lockUpManager.min_percent_numerator)))
                .div((0, numbers_1.d)(lockUpManager.max_lock_day).sub((0, numbers_1.d)(lockUpManager.min_lock_day)));
            const percent = (0, numbers_1.d)(xcetus_type_1.REDEEM_NUM_MULTIPER)
                .mul((0, numbers_1.d)(lockUpManager.max_percent_numerator))
                .sub(mid)
                .div((0, numbers_1.d)(xcetus_type_1.EXCHANGE_RATE_MULTIPER))
                .div(xcetus_type_1.REDEEM_NUM_MULTIPER);
            return { amountOut: (0, numbers_1.d)(percent).mul((0, numbers_1.d)(redeemAmount)).round().toString(), percent: percent.toString() };
        });
    }
    reverseRedeemNum(amount, lock_day) {
        return __awaiter(this, void 0, void 0, function* () {
            if (BigInt(amount) === BigInt(0)) {
                return { amountOut: '0', percent: '0' };
            }
            const lockUpManager = yield this.getLockUpManagerEvent();
            const mid = (0, numbers_1.d)(xcetus_type_1.REDEEM_NUM_MULTIPER)
                .mul((0, numbers_1.d)(lockUpManager.max_lock_day).sub((0, numbers_1.d)(lock_day)))
                .mul((0, numbers_1.d)(lockUpManager.max_percent_numerator).sub((0, numbers_1.d)(lockUpManager.min_percent_numerator)))
                .div((0, numbers_1.d)(lockUpManager.max_lock_day).sub((0, numbers_1.d)(lockUpManager.min_lock_day)));
            const percent = (0, numbers_1.d)(xcetus_type_1.REDEEM_NUM_MULTIPER)
                .mul((0, numbers_1.d)(lockUpManager.max_percent_numerator))
                .sub(mid)
                .div((0, numbers_1.d)(xcetus_type_1.EXCHANGE_RATE_MULTIPER))
                .div(xcetus_type_1.REDEEM_NUM_MULTIPER);
            return { amountOut: (0, numbers_1.d)(amount).div(percent).toFixed(0, decimal_js_1.default.ROUND_UP), percent: percent.toString() };
        });
    }
    getXCetusAmount(lock_id) {
        return __awaiter(this, void 0, void 0, function* () {
            const { lock_handle_id } = this._sdk.sdkOptions.xcetus.config;
            const cacheKey = `${lock_id}_getXCetusAmount`;
            const cacheData = this._cache[cacheKey];
            if (cacheData !== undefined && cacheData.getCacheData()) {
                return cacheData.value;
            }
            try {
                const response = yield this.sdk.fullClient.getDynamicFieldObject({
                    parentId: lock_handle_id,
                    name: {
                        type: '0x2::object::ID',
                        value: lock_id,
                    },
                });
                const fields = (0, sui_js_1.getObjectFields)(response);
                if (fields) {
                    const { xcetus_amount } = fields.value.fields.value.fields;
                    this.updateCache(cacheKey, xcetus_amount, exports.cacheTime24h);
                    return xcetus_amount;
                }
            }
            catch (error) {
                //
            }
            return '0';
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
exports.XCetusModule = XCetusModule;
