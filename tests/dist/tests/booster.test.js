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
const sui_js_1 = require("@mysten/sui.js");
const init_test_data_1 = require("./data/init_test_data");
require("isomorphic-fetch");
const src_1 = require("../src");
let sendKeypair;
const boosterPoolId = "0x30074f3331fe0d4203d414ed09dc4e4f023f536591b9846a7b616ceb755c0d8a";
const clmm_position_id = "0x5ba3df70bf9664b9a39a4d81c20f45238e5b0d57c40a303877b6e50e4b474b88";
const venft_id = "0x98cc20cc6d2bd982cca9a1e2aeac343f1167582dd0fc2c9f52d7967f640e7294";
describe('booster Module', () => {
    const sdk = (0, init_test_data_1.buildSdk)();
    beforeEach(() => __awaiter(void 0, void 0, void 0, function* () {
        sendKeypair = (0, init_test_data_1.buildTestAccount)();
        console.log("env: ", sdk.sdkOptions.fullRpcUrl);
    }));
    test('get PoolImmutables', () => __awaiter(void 0, void 0, void 0, function* () {
        const poolImmutables = yield sdk.BoosterModule.getPoolImmutables();
        console.log("poolImmutables: ", poolImmutables);
    }));
    test('getPools', () => __awaiter(void 0, void 0, void 0, function* () {
        const pools = yield sdk.BoosterModule.getPools();
        console.log("pools: ", pools);
    }));
    test('getSinglePools', () => __awaiter(void 0, void 0, void 0, function* () {
        const pool = yield sdk.BoosterModule.getPool(boosterPoolId);
        console.log("pool: ", pool);
    }));
    test('getOwnerLockNfts', () => __awaiter(void 0, void 0, void 0, function* () {
        const nfts = yield sdk.BoosterModule.getOwnerLockNfts(sendKeypair.getPublicKey().toSuiAddress());
        console.log("nfts: ", nfts);
    }));
    test('getLockNftById', () => __awaiter(void 0, void 0, void 0, function* () {
        // from  getOwnerLockNfts
        const info = yield sdk.BoosterModule.getLockNftById("0xf23891529b0e725e578f6a9900934e6eae09616d922c0b39a8d570338493f738");
        console.log("info: ", info);
    }));
    test('1 getLockPositionInfos', () => __awaiter(void 0, void 0, void 0, function* () {
        // from getOwnerLockNfts
        const infos = yield sdk.BoosterModule.getLockPositionInfos("0xe420b4cd1fca40f032584608d5e31601fa4454e9df8d109b45c03ff6bb566bf8", ["0xf23891529b0e725e578f6a9900934e6eae09616d922c0b39a8d570338493f738"]);
        console.log("infos: ", infos);
    }));
    test('2 getLockPositionInfo', () => __awaiter(void 0, void 0, void 0, function* () {
        // from getOwnerLockNfts
        const info = yield sdk.BoosterModule.getLockPositionInfo("0xe420b4cd1fca40f032584608d5e31601fa4454e9df8d109b45c03ff6bb566bf8", "0xf23891529b0e725e578f6a9900934e6eae09616d922c0b39a8d570338493f738");
        console.log("info: ", info);
    }));
    test('getLockPositionInfoById', () => __awaiter(void 0, void 0, void 0, function* () {
        // from  getLockPositionInfo : id
        const info = yield sdk.BoosterModule.getLockPositionInfoById("0x119829aaa1e3fb6a388eed0b8b8ada10382b537282538419b0594ad93dbca77d");
        console.log("info: ", info);
    }));
    test('get clmm Rewarders  and xcetus Rewarder', () => __awaiter(void 0, void 0, void 0, function* () {
        const pool = yield sdk.Resources.getPool("0xf71b517fe0f57a4e3be5b00a90c40f461058f5ae7a4bb65fe1abf3bfdd20dcf7");
        console.log("pool", pool);
        const res = yield sdk.Rewarder.posRewardersAmount(pool.poolAddress, pool.positions_handle, "0xf23891529b0e725e578f6a9900934e6eae09616d922c0b39a8d570338493f738");
        console.log('res####', res);
        const booterPool = yield sdk.BoosterModule.getPool(boosterPoolId);
        console.log("booterPool: ", booterPool);
        const info = yield sdk.BoosterModule.getLockPositionInfoById("0x119829aaa1e3fb6a388eed0b8b8ada10382b537282538419b0594ad93dbca77d");
        console.log("info: ", info);
        const xcetus = sdk.BoosterModule.calculateXCetusRewarder(res, booterPool, info);
        console.log("xcetus: ", xcetus);
    }));
    test('lockPositionPayload', () => __awaiter(void 0, void 0, void 0, function* () {
        const signer = new sui_js_1.RawSigner(sendKeypair, sdk.fullClient);
        const boosterPool = yield sdk.BoosterModule.getPool(boosterPoolId);
        console.log("boosterPool: ", boosterPool);
        if (boosterPool) {
            const tx = sdk.BoosterModule.lockPositionPayload({
                clmm_position_id: clmm_position_id,
                booster_pool_id: boosterPool.pool_id,
                clmm_pool_id: boosterPool.clmm_pool_id,
                lock_day: boosterPool.config[0].lock_day,
                booster_type: boosterPool.booster_type,
                coinTypeA: boosterPool.coinTypeA,
                coinTypeB: boosterPool.coinTypeB
            });
            const txResult = yield (0, src_1.sendTransaction)(signer, tx);
            console.log("lockPositionPayload: ", txResult);
        }
    }));
    test('canceLockPositionPayload', () => __awaiter(void 0, void 0, void 0, function* () {
        const signer = new sui_js_1.RawSigner(sendKeypair, sdk.fullClient);
        const boosterPool = yield sdk.BoosterModule.getPool(boosterPoolId);
        console.log("boosterPool: ", boosterPool);
        if (boosterPool) {
            const nfts = yield sdk.BoosterModule.getOwnerLockNfts(sendKeypair.getPublicKey().toSuiAddress(), boosterPool === null || boosterPool === void 0 ? void 0 : boosterPool.clmm_pool_id);
            console.log("nfts: ", nfts);
            if (nfts.length > 0) {
                const nft = nfts[0];
                if (src_1.BoosterUtil.isLocked(nft)) {
                    const tx = sdk.BoosterModule.canceLockPositionPayload({
                        booster_pool_id: boosterPool.pool_id,
                        lock_nft_id: nfts[0].locked_nft_id,
                        booster_type: boosterPool.booster_type,
                    });
                    (0, src_1.printTransaction)(tx);
                    const txResult = yield (0, src_1.sendTransaction)(signer, tx);
                    console.log("canceLockPositionPayload: ", txResult);
                }
            }
        }
    }));
    test('redeemPayload', () => __awaiter(void 0, void 0, void 0, function* () {
        const signer = new sui_js_1.RawSigner(sendKeypair, sdk.fullClient);
        const boosterPool = yield sdk.BoosterModule.getPool(boosterPoolId);
        console.log("boosterPool: ", boosterPool);
        if (boosterPool) {
            const nfts = yield sdk.BoosterModule.getOwnerLockNfts(sendKeypair.getPublicKey().toSuiAddress(), boosterPool === null || boosterPool === void 0 ? void 0 : boosterPool.clmm_pool_id);
            console.log("nfts: ", nfts);
            if (nfts.length > 0) {
                const nft = nfts[0];
                if (!src_1.BoosterUtil.isLocked(nft)) {
                    const tx = sdk.BoosterModule.redeemPayload({
                        booster_pool_id: boosterPool.pool_id,
                        lock_nft_id: nft.locked_nft_id,
                        booster_type: boosterPool.booster_type,
                        clmm_pool_id: boosterPool.clmm_pool_id,
                        ve_nft_id: venft_id,
                        coinTypeA: boosterPool.coinTypeA,
                        coinTypeB: boosterPool.coinTypeB
                    });
                    (0, src_1.printTransaction)(tx);
                    const txResult = yield (0, src_1.sendTransaction)(signer, tx);
                    console.log("canceLockPositionPayload: ", txResult);
                }
            }
        }
    }));
});
