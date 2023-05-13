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
const xwhale_1 = require("../src/utils/xwhale");
const numbers_1 = require("../src/utils/numbers");
let sendKeypair;
const venft_id = "0x44d01dcaeb814a934aa8d684795983a475f6f3eda48a68ef3cad15068ce4c33a";
describe('launch pad Module', () => {
    const sdk = (0, init_test_data_1.buildSdk)();
    beforeEach(() => __awaiter(void 0, void 0, void 0, function* () {
        sendKeypair = (0, init_test_data_1.buildTestAccount)();
        console.log("env: ", sdk.sdkOptions.fullRpcUrl);
    }));
    test('mint whale', () => __awaiter(void 0, void 0, void 0, function* () {
        yield (0, init_test_data_1.mintAll)(sdk, sendKeypair, sdk.sdkOptions.xwhale.whale_faucet, "whale", "faucet");
    }));
    test('getLockUpManagerEvent', () => __awaiter(void 0, void 0, void 0, function* () {
        const lockUpManagerEvent = yield sdk.XWhaleModule.getLockUpManagerEvent();
        console.log(lockUpManagerEvent);
    }));
    test('mintVeNFTPayload', () => __awaiter(void 0, void 0, void 0, function* () {
        const signer = new sui_js_1.RawSigner(sendKeypair, sdk.fullClient);
        const payload = sdk.XWhaleModule.mintVeNFTPayload();
        const tx = yield (0, src_1.sendTransaction)(signer, payload);
        console.log("mintVeNFTPayload : ", tx);
    }));
    test('getOwnerVeNFT', () => __awaiter(void 0, void 0, void 0, function* () {
        const nfts = yield sdk.XWhaleModule.getOwnerVeNFT(sendKeypair.getPublicKey().toSuiAddress());
        console.log("nfts: ", nfts);
    }));
    test('getOwnerWhaleCoins', () => __awaiter(void 0, void 0, void 0, function* () {
        const coins = yield sdk.XWhaleModule.getOwnerWhaleCoins(sendKeypair.getPublicKey().toSuiAddress());
        console.log("coins: ", coins);
    }));
    test(' Convert Whale to Xwhale', () => __awaiter(void 0, void 0, void 0, function* () {
        const signer = new sui_js_1.RawSigner(sendKeypair, sdk.fullClient);
        sdk.senderAddress = sendKeypair.getPublicKey().toSuiAddress();
        const payload = yield sdk.XWhaleModule.convertPayload({
            amount: '13000',
            venft_id: venft_id
        });
        (0, src_1.printTransaction)(payload);
        const tx = yield (0, src_1.sendTransaction)(signer, payload);
        console.log("convertPayload : ", tx);
    }));
    test('redeemNum', () => __awaiter(void 0, void 0, void 0, function* () {
        const amount = yield sdk.XWhaleModule.redeemNum(400, 2);
        console.log("amount : ", amount);
    }));
    test('redeemLockPayload', () => __awaiter(void 0, void 0, void 0, function* () {
        const signer = new sui_js_1.RawSigner(sendKeypair, sdk.fullClient);
        const payload = sdk.XWhaleModule.redeemLockPayload({
            venft_id: venft_id,
            amount: '1100',
            lock_day: 1
        });
        const tx = yield (0, src_1.sendTransaction)(signer, payload);
        console.log("redeemLockPayload : ", tx);
    }));
    test('getOwnerLockWhales', () => __awaiter(void 0, void 0, void 0, function* () {
        const lockWhales = yield sdk.XWhaleModule.getOwnerLockWhales(sendKeypair.getPublicKey().toSuiAddress());
        console.log("lockWhales: ", lockWhales);
    }));
    test('getLockWhale', () => __awaiter(void 0, void 0, void 0, function* () {
        const lockWhale = yield sdk.XWhaleModule.getLockWhale("0xef8b97297390eb5d209438a1352d138cb056153f45f66a3384d12da82ade94a5");
        console.log("lockWhale: ", lockWhale);
    }));
    test('redeemPayload', () => __awaiter(void 0, void 0, void 0, function* () {
        const signer = new sui_js_1.RawSigner(sendKeypair, sdk.fullClient);
        const lock_id = "0xef8b97297390eb5d209438a1352d138cb056153f45f66a3384d12da82ade94a5";
        const lockWhale = yield sdk.XWhaleModule.getLockWhale(lock_id);
        console.log('lockWhale: ', lockWhale);
        if (lockWhale && !xwhale_1.XWhaleUtil.isLocked(lockWhale)) {
            const payload = sdk.XWhaleModule.redeemPayload({
                venft_id: venft_id,
                lock_id: lock_id
            });
            const tx = yield (0, src_1.sendTransaction)(signer, payload);
            console.log("redeemPayload : ", tx);
        }
        else {
            console.log(" not reach  lock time");
        }
    }));
    test('cancelRedeemPayload', () => __awaiter(void 0, void 0, void 0, function* () {
        const signer = new sui_js_1.RawSigner(sendKeypair, sdk.fullClient);
        const lock_id = "0xb67107d29c9e334623376e94a339aa78a9317f1dfc12aaebb2784327f5dcca25";
        const lockWhale = yield sdk.XWhaleModule.getLockWhale(lock_id);
        console.log('lockWhale: ', lockWhale);
        if (lockWhale && xwhale_1.XWhaleUtil.isLocked(lockWhale)) {
            const payload = sdk.XWhaleModule.cancelRedeemPayload({
                venft_id: venft_id,
                lock_id: "0xb67107d29c9e334623376e94a339aa78a9317f1dfc12aaebb2784327f5dcca25"
            });
            const tx = yield (0, src_1.sendTransaction)(signer, payload);
            console.log("cancelRedeemPayload : ", tx);
        }
    }));
    /**-------------------------------------xWHALE Holder Rewards--------------------------------------- */
    test('get my share', () => __awaiter(void 0, void 0, void 0, function* () {
        const nfts = yield sdk.XWhaleModule.getOwnerVeNFT(sendKeypair.getPublicKey().toSuiAddress());
        console.log("nfts: ", nfts);
        if (nfts) {
            const xwhaleManager = yield sdk.XWhaleModule.getXwhaleManager();
            console.log("xwhaleManager: ", xwhaleManager);
            const rate = (0, numbers_1.d)(nfts.xwhale_balance).div(xwhaleManager.treasury);
            console.log("rate: ", rate);
        }
    }));
    test('getVeNFTDividendInfo', () => __awaiter(void 0, void 0, void 0, function* () {
        const dividendManager = yield sdk.XWhaleModule.getDividendManager();
        console.log("dividendManager: ", dividendManager);
        const veNFTDividendInfo = yield sdk.XWhaleModule.getVeNFTDividendInfo(dividendManager.venft_dividends.id, venft_id);
        console.log("veNFTDividendInfo: ", veNFTDividendInfo === null || veNFTDividendInfo === void 0 ? void 0 : veNFTDividendInfo.rewards[0]);
        console.log("veNFTDividendInfo: ", veNFTDividendInfo === null || veNFTDividendInfo === void 0 ? void 0 : veNFTDividendInfo.rewards[1]);
    }));
    test('redeemDividendPayload', () => __awaiter(void 0, void 0, void 0, function* () {
        const dividendManager = yield sdk.XWhaleModule.getDividendManager();
        console.log("dividendManager: ", dividendManager);
        if (dividendManager.bonus_types.length > 0) {
            const signer = new sui_js_1.RawSigner(sendKeypair, sdk.fullClient);
            const payload = sdk.XWhaleModule.redeemDividendPayload(venft_id, dividendManager.bonus_types);
            (0, src_1.printTransaction)(payload);
            const result = yield (0, src_1.sendTransaction)(signer, payload);
            console.log("redeemDividendPayload: ", result);
        }
    }));
});
