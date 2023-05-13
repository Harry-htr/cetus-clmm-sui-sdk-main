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
const xcetus_1 = require("../src/utils/xcetus");
const numbers_1 = require("../src/utils/numbers");
let sendKeypair;
const venft_id = "0x2c94a4dd607def65a56a35f0d206a8b6cbf66368b76f2373dac50ec7c3dcc84e";
describe('launch pad Module', () => {
    const sdk = (0, init_test_data_1.buildSdk)();
    beforeEach(() => __awaiter(void 0, void 0, void 0, function* () {
        sendKeypair = (0, init_test_data_1.buildTestAccount)();
        console.log("env: ", sdk.sdkOptions.fullRpcUrl);
    }));
    test('mint cetus', () => __awaiter(void 0, void 0, void 0, function* () {
        yield (0, init_test_data_1.mintAll)(sdk, sendKeypair, {
            faucet_display: sdk.sdkOptions.xcetus.cetus_faucet,
            faucet_router: sdk.sdkOptions.xcetus.cetus_faucet
        }, "cetus", "faucet");
    }));
    test('getLockUpManagerEvent', () => __awaiter(void 0, void 0, void 0, function* () {
        const lockUpManagerEvent = yield sdk.XCetusModule.getLockUpManagerEvent();
        console.log(lockUpManagerEvent);
    }));
    test('mintVeNFTPayload', () => __awaiter(void 0, void 0, void 0, function* () {
        const signer = new sui_js_1.RawSigner(sendKeypair, sdk.fullClient);
        const payload = sdk.XCetusModule.mintVeNFTPayload();
        const tx = yield (0, src_1.sendTransaction)(signer, payload);
        console.log("mintVeNFTPayload : ", tx);
    }));
    test('getOwnerVeNFT', () => __awaiter(void 0, void 0, void 0, function* () {
        const nfts = yield sdk.XCetusModule.getOwnerVeNFT(sendKeypair.getPublicKey().toSuiAddress());
        console.log("nfts: ", nfts);
    }));
    test('getOwnerCetusCoins', () => __awaiter(void 0, void 0, void 0, function* () {
        const coins = yield sdk.XCetusModule.getOwnerCetusCoins(sendKeypair.getPublicKey().toSuiAddress());
        console.log("coins: ", coins);
    }));
    test(' Convert Cetus to Xcetus', () => __awaiter(void 0, void 0, void 0, function* () {
        const signer = new sui_js_1.RawSigner(sendKeypair, sdk.fullClient);
        sdk.senderAddress = sendKeypair.getPublicKey().toSuiAddress();
        const payload = yield sdk.XCetusModule.convertPayload({
            amount: '30000',
            venft_id
        });
        (0, src_1.printTransaction)(payload);
        const tx = yield (0, src_1.sendTransaction)(signer, payload);
        console.log("convertPayload : ", tx);
    }));
    test('redeemNum', () => __awaiter(void 0, void 0, void 0, function* () {
        const n = 15;
        const amountInput = 20000;
        const amount = yield sdk.XCetusModule.redeemNum(amountInput, n);
        const rate = (0, numbers_1.d)(n).sub(15).div(165).mul(0.5).add(0.5);
        const amount1 = rate.mul(amountInput);
        console.log("amount : ", amount, amount1, rate);
    }));
    test('redeemLockPayload', () => __awaiter(void 0, void 0, void 0, function* () {
        const signer = new sui_js_1.RawSigner(sendKeypair, sdk.fullClient);
        const payload = sdk.XCetusModule.redeemLockPayload({
            venft_id: venft_id,
            amount: '100',
            lock_day: 15
        });
        const tx = yield (0, src_1.sendTransaction)(signer, payload);
        console.log("redeemLockPayload : ", tx);
    }));
    test('getOwnerLockCetuss', () => __awaiter(void 0, void 0, void 0, function* () {
        const lockCetuss = yield sdk.XCetusModule.getOwnerLockCetuss(sendKeypair.getPublicKey().toSuiAddress());
        console.log("lockCetuss: ", lockCetuss);
    }));
    test('getLockCetus', () => __awaiter(void 0, void 0, void 0, function* () {
        const lockCetus = yield sdk.XCetusModule.getLockCetus("0xe47a382ad73627e15f23f0bf49f078a3ada18090bad4411d381a2a891bb218e2");
        console.log("lockCetus: ", lockCetus);
    }));
    test('redeemPayload', () => __awaiter(void 0, void 0, void 0, function* () {
        const signer = new sui_js_1.RawSigner(sendKeypair, sdk.fullClient);
        const lock_id = "0x907a5c7523f7cc17cb43b75af3bbdfc15ffa65bc2b2b0ca0e3e5a5cd64e819de";
        const lockCetus = yield sdk.XCetusModule.getLockCetus(lock_id);
        console.log('lockCetus: ', lockCetus);
        if (lockCetus && !xcetus_1.XCetusUtil.isLocked(lockCetus)) {
            const payload = sdk.XCetusModule.redeemPayload({
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
        const lock_id = "0xe47a382ad73627e15f23f0bf49f078a3ada18090bad4411d381a2a891bb218e2";
        const lockCetus = yield sdk.XCetusModule.getLockCetus(lock_id);
        console.log('lockCetus: ', lockCetus);
        if (lockCetus && xcetus_1.XCetusUtil.isLocked(lockCetus)) {
            const payload = sdk.XCetusModule.cancelRedeemPayload({
                venft_id: venft_id,
                lock_id: lock_id
            });
            const tx = yield (0, src_1.sendTransaction)(signer, payload);
            console.log("cancelRedeemPayload : ", tx);
        }
    }));
    /**-------------------------------------xWHALE Holder Rewards--------------------------------------- */
    test('get my share', () => __awaiter(void 0, void 0, void 0, function* () {
        const nfts = yield sdk.XCetusModule.getOwnerVeNFT(sendKeypair.getPublicKey().toSuiAddress());
        console.log("nfts: ", nfts);
        if (nfts) {
            const xcetusManager = yield sdk.XCetusModule.getXcetusManager();
            console.log("xcetusManager: ", xcetusManager);
            const rate = (0, numbers_1.d)(nfts.xcetus_balance).div(xcetusManager.treasury);
            console.log("rate: ", rate);
        }
    }));
    test('getVeNFTDividendInfo', () => __awaiter(void 0, void 0, void 0, function* () {
        const dividendManager = yield sdk.XCetusModule.getDividendManager();
        console.log("dividendManager: ", dividendManager);
        const veNFTDividendInfo = yield sdk.XCetusModule.getVeNFTDividendInfo(dividendManager.venft_dividends.id, venft_id);
        console.log("veNFTDividendInfo: ", veNFTDividendInfo === null || veNFTDividendInfo === void 0 ? void 0 : veNFTDividendInfo.rewards);
    }));
    test('redeemDividendPayload', () => __awaiter(void 0, void 0, void 0, function* () {
        const dividendManager = yield sdk.XCetusModule.getDividendManager();
        console.log("dividendManager: ", dividendManager);
        if (dividendManager.bonus_types.length > 0) {
            const signer = new sui_js_1.RawSigner(sendKeypair, sdk.fullClient);
            const payload = sdk.XCetusModule.redeemDividendPayload(venft_id, dividendManager.bonus_types);
            (0, src_1.printTransaction)(payload);
            const result = yield (0, src_1.sendTransaction)(signer, payload);
            console.log("redeemDividendPayload: ", result);
        }
    }));
});
