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
exports.TokenModule = exports.cacheTime24h = exports.cacheTime5min = void 0;
/* eslint-disable class-methods-use-this */
const js_base64_1 = require("js-base64");
const sui_js_1 = require("@mysten/sui.js");
const cachedContent_1 = require("../utils/cachedContent");
const contracts_1 = require("../utils/contracts");
const utils_1 = require("../utils");
exports.cacheTime5min = 5 * 60 * 1000;
exports.cacheTime24h = 24 * 60 * 60 * 1000;
function getFutureTime(interval) {
    return Date.parse(new Date().toString()) + interval;
}
class TokenModule {
    constructor(sdk) {
        this._cache = {};
        this._sdk = sdk;
    }
    get sdk() {
        return this._sdk;
    }
    getAllRegisteredTokenList(forceRefresh = false) {
        return __awaiter(this, void 0, void 0, function* () {
            const list = yield this.factchTokenList('', forceRefresh);
            return list;
        });
    }
    getOwnerTokenList(listOwnerAddr = '', forceRefresh = false) {
        return __awaiter(this, void 0, void 0, function* () {
            const list = yield this.factchTokenList(listOwnerAddr, forceRefresh);
            return list;
        });
    }
    getAllRegisteredPoolList(forceRefresh = false) {
        return __awaiter(this, void 0, void 0, function* () {
            const list = yield this.factchPoolList('', forceRefresh);
            return list;
        });
    }
    getOwnerPoolList(listOwnerAddr = '', forceRefresh = false) {
        return __awaiter(this, void 0, void 0, function* () {
            const list = yield this.factchPoolList(listOwnerAddr, forceRefresh);
            return list;
        });
    }
    getWarpPoolList(forceRefresh = false) {
        return __awaiter(this, void 0, void 0, function* () {
            const list = yield this.factchWarpPoolList('', '', forceRefresh);
            return list;
        });
    }
    getOwnerWarpPoolList(poolOwnerAddr = '', coinOwnerAddr = '', forceRefresh = false) {
        return __awaiter(this, void 0, void 0, function* () {
            const list = yield this.factchWarpPoolList(poolOwnerAddr, coinOwnerAddr, forceRefresh);
            return list;
        });
    }
    getTokenListByCoinTypes(coinTypes) {
        return __awaiter(this, void 0, void 0, function* () {
            const tokenMap = {};
            const cacheKey = `getAllRegisteredTokenList`;
            const cacheData = this.getCacheData(cacheKey);
            if (cacheData !== null) {
                const tokenList = cacheData;
                for (const coinType of coinTypes) {
                    for (const token of tokenList) {
                        if (coinType === token.address) {
                            tokenMap[coinType] = token;
                            continue;
                        }
                    }
                }
            }
            const unFindArray = coinTypes.filter((coinType) => {
                return tokenMap[coinType] === undefined;
            });
            for (const coinType of unFindArray) {
                const metadataKey = `${coinType}_metadata`;
                const metadata = this.getCacheData(metadataKey);
                if (metadata !== null) {
                    tokenMap[coinType] = metadata;
                }
                else {
                    // eslint-disable-next-line no-await-in-loop
                    const data = yield this._sdk.fullClient.getCoinMetadata({
                        coinType,
                    });
                    if (data) {
                        const token = {
                            id: data.id,
                            name: data.name,
                            symbol: data.symbol,
                            official_symbol: data.symbol,
                            coingecko_id: '',
                            decimals: data.decimals,
                            project_url: '',
                            logo_url: data.iconUrl,
                            address: coinType,
                        };
                        tokenMap[coinType] = token;
                        this.updateCache(metadataKey, token, exports.cacheTime24h);
                    }
                }
            }
            return tokenMap;
        });
    }
    factchTokenList(listOwnerAddr = '', forceRefresh = false) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            const { simulationAccount, token } = this.sdk.sdkOptions;
            const cacheKey = `getAllRegisteredTokenList`;
            if (!forceRefresh) {
                const cacheData = this.getCacheData(cacheKey);
                if (cacheData !== null) {
                    return cacheData;
                }
            }
            const isOwnerRequest = listOwnerAddr.length > 0;
            const tx = new sui_js_1.TransactionBlock();
            tx.moveCall({
                target: `${token.token_display}::coin_list::${isOwnerRequest ? 'fetch_full_list' : 'fetch_all_registered_coin_info'}`,
                arguments: isOwnerRequest
                    ? [tx.pure(token.config.coin_registry_id), tx.pure(listOwnerAddr)]
                    : [tx.pure(token.config.coin_registry_id)],
            });
            const simulateRes = yield this.sdk.fullClient.devInspectTransactionBlock({
                transactionBlock: tx,
                sender: simulationAccount.address,
            });
            const tokenList = [];
            (_a = simulateRes.events) === null || _a === void 0 ? void 0 : _a.forEach((item) => {
                const formatType = (0, contracts_1.extractStructTagFromType)(item.type);
                if (formatType.full_address === `${token.token_display}::coin_list::FetchCoinListEvent`) {
                    item.parsedJson.full_list.value_list.forEach((item) => {
                        tokenList.push(this.transformData(item, false));
                    });
                }
            });
            this.updateCache(cacheKey, tokenList, exports.cacheTime24h);
            return tokenList;
        });
    }
    factchPoolList(listOwnerAddr = '', forceRefresh = false) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            const { simulationAccount, token } = this.sdk.sdkOptions;
            const cacheKey = `getAllRegisteredPoolList`;
            if (!forceRefresh) {
                const cacheData = this.getCacheData(cacheKey);
                if (cacheData !== null) {
                    return cacheData;
                }
            }
            const isOwnerRequest = listOwnerAddr.length > 0;
            const typeArguments = [];
            const args = isOwnerRequest ? [token.config.pool_registry_id, listOwnerAddr] : [token.config.pool_registry_id];
            const payload = {
                packageObjectId: token.token_display,
                module: 'lp_list',
                function: isOwnerRequest ? 'fetch_full_list' : 'fetch_all_registered_coin_info',
                gasBudget: 10000,
                typeArguments,
                arguments: args,
            };
            console.log('payload: ', payload);
            const tx = new sui_js_1.TransactionBlock();
            tx.moveCall({
                target: `${token.token_display}::lp_list::${isOwnerRequest ? 'fetch_full_list' : 'fetch_all_registered_coin_info'}`,
                arguments: isOwnerRequest
                    ? [tx.pure(token.config.pool_registry_id), tx.pure(listOwnerAddr)]
                    : [tx.pure(token.config.pool_registry_id)],
            });
            const simulateRes = yield this.sdk.fullClient.devInspectTransactionBlock({
                transactionBlock: tx,
                sender: simulationAccount.address,
            });
            const tokenList = [];
            (_a = simulateRes.events) === null || _a === void 0 ? void 0 : _a.forEach((item) => {
                const formatType = (0, contracts_1.extractStructTagFromType)(item.type);
                if (formatType.full_address === `${token.token_display}::lp_list::FetchPoolListEvent`) {
                    item.parsedJson.full_list.value_list.forEach((item) => {
                        tokenList.push(this.transformData(item, true));
                    });
                }
            });
            this.updateCache(cacheKey, tokenList, exports.cacheTime24h);
            return tokenList;
        });
    }
    factchWarpPoolList(poolOwnerAddr = '', coinOwnerAddr = '', forceRefresh = false) {
        return __awaiter(this, void 0, void 0, function* () {
            const poolList = yield this.factchPoolList(poolOwnerAddr, forceRefresh);
            if (poolList.length === 0) {
                return [];
            }
            const tokenList = yield this.factchTokenList(coinOwnerAddr, forceRefresh);
            const lpPoolArray = [];
            for (const pool of poolList) {
                for (const token of tokenList) {
                    if (token.address === pool.coin_a_address) {
                        pool.coinA = token;
                    }
                    if (token.address === pool.coin_b_address) {
                        pool.coinB = token;
                    }
                    continue;
                }
                lpPoolArray.push(pool);
            }
            return lpPoolArray;
        });
    }
    getTokenConfigEvent(forceRefresh = false) {
        return __awaiter(this, void 0, void 0, function* () {
            const packageObjectId = this._sdk.sdkOptions.token.token_display;
            const cacheKey = `${packageObjectId}_getTokenConfigEvent`;
            const cacheData = this._cache[cacheKey];
            if (cacheData !== undefined && cacheData.getCacheData() && !forceRefresh) {
                return cacheData.value;
            }
            const packageObject = yield this._sdk.fullClient.getObject({
                id: packageObjectId,
                options: {
                    showPreviousTransaction: true,
                },
            });
            const previousTx = (0, sui_js_1.getObjectPreviousTransactionDigest)(packageObject);
            const objects = yield (0, utils_1.loopToGetAllQueryEvents)(this._sdk, {
                query: { Transaction: previousTx },
            });
            const tokenConfigEvent = {
                coin_registry_id: '',
                pool_registry_id: '',
                coin_list_owner: '',
                pool_list_owner: '',
            };
            // console.log(objects.data)
            if (objects.data.length > 0) {
                objects.data.forEach((item) => {
                    const formatType = (0, contracts_1.extractStructTagFromType)(item.type);
                    if (item.transactionModule === 'coin_list') {
                        switch (formatType.name) {
                            case `InitListEvent`:
                                tokenConfigEvent.coin_list_owner = item.parsedJson.list_id;
                                break;
                            case `InitRegistryEvent`:
                                tokenConfigEvent.coin_registry_id = item.parsedJson.registry_id;
                                break;
                            default:
                                break;
                        }
                    }
                    else if (item.transactionModule === 'lp_list') {
                        switch (formatType.name) {
                            case `InitListEvent<address>`:
                                tokenConfigEvent.pool_list_owner = item.parsedJson.list_id;
                                break;
                            case `InitRegistryEvent<address>`:
                                tokenConfigEvent.pool_registry_id = item.parsedJson.registry_id;
                                break;
                            default:
                                break;
                        }
                    }
                });
            }
            if (tokenConfigEvent.coin_registry_id.length > 0) {
                this.updateCache(cacheKey, tokenConfigEvent, exports.cacheTime24h);
            }
            return tokenConfigEvent;
        });
    }
    transformData(item, isPoolData) {
        const token = Object.assign({}, item);
        if (isPoolData) {
            try {
                token.coin_a_address = (0, contracts_1.extractStructTagFromType)(token.coin_a_address).full_address;
                token.coin_b_address = (0, contracts_1.extractStructTagFromType)(token.coin_b_address).full_address;
            }
            catch (error) {
                //
            }
        }
        else {
            token.address = (0, contracts_1.extractStructTagFromType)(token.address).full_address;
        }
        if (item.extensions) {
            const extensionsDataArray = item.extensions.contents;
            for (const item of extensionsDataArray) {
                const { key } = item;
                let { value } = item;
                if (key === 'labels') {
                    try {
                        value = JSON.parse(decodeURIComponent(js_base64_1.Base64.decode(value)));
                        // eslint-disable-next-line no-empty
                    }
                    catch (error) { }
                }
                token[key] = value;
            }
            delete token.extensions;
        }
        return token;
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
    getCacheData(cacheKey) {
        const cacheData = this._cache[cacheKey];
        if (cacheData !== undefined && cacheData.getCacheData()) {
            return cacheData.value;
        }
        return null;
    }
}
exports.TokenModule = TokenModule;
