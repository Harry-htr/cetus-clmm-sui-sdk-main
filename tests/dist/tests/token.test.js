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
const init_test_data_1 = require("./data/init_test_data");
require("isomorphic-fetch");
describe('token Module', () => {
    const sdk = (0, init_test_data_1.buildSdk)();
    const tokenConfig = sdk.sdkOptions.token.config;
    test('getTokenListByCoinTypes', () => __awaiter(void 0, void 0, void 0, function* () {
        const tokenMap = yield sdk.Token.getTokenListByCoinTypes(["0xde093aecdfbce6e49461bc2a3f463611e4b90b580bc8ae83701d03e97afcc291::xcetus::XCETUS"]);
        console.log("tokenMap: ", tokenMap);
    }));
    test('getAllRegisteredTokenList', () => __awaiter(void 0, void 0, void 0, function* () {
        const tokenList = yield sdk.Token.getAllRegisteredTokenList();
        console.log("tokenList: ", tokenList);
    }));
    test('getOwnerTokenList', () => __awaiter(void 0, void 0, void 0, function* () {
        const tokenList = yield sdk.Token.getOwnerTokenList(tokenConfig.coin_list_owner);
        console.log("tokenList: ", tokenList);
    }));
    test('getAllRegisteredPoolList', () => __awaiter(void 0, void 0, void 0, function* () {
        const lp_list = yield sdk.Token.getAllRegisteredPoolList();
        console.log("lp_list: ", lp_list);
    }));
    test('getOwnerPoolList', () => __awaiter(void 0, void 0, void 0, function* () {
        const lp_list = yield sdk.Token.getOwnerPoolList(tokenConfig.pool_list_owner);
        console.log("lp_list: ", lp_list);
    }));
    test('getWarpPoolList', () => __awaiter(void 0, void 0, void 0, function* () {
        const lp_list = yield sdk.Token.getWarpPoolList();
        console.log("lp_list: ", lp_list);
    }));
    test('getOwnerWarpPoolList', () => __awaiter(void 0, void 0, void 0, function* () {
        const { pool_list_owner, coin_list_owner } = tokenConfig;
        const lp_list = yield sdk.Token.getOwnerWarpPoolList(pool_list_owner, coin_list_owner);
        console.log("lp_list: ", lp_list);
    }));
});
