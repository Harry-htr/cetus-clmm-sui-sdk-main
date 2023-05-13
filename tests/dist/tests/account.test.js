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
const transaction_util_1 = require("../src/utils/transaction-util");
const tx_block_1 = require("../src/utils/tx-block");
describe('account Module', () => {
    const sdk = (0, init_test_data_1.buildSdk)();
    let sendKeypair;
    beforeEach(() => __awaiter(void 0, void 0, void 0, function* () {
        sendKeypair = (0, init_test_data_1.buildTestAccount)();
    }));
    test('getObject', () => __awaiter(void 0, void 0, void 0, function* () {
        // const allCoinAsset = await sdk.fullClient.queryEvents({query : {
        //   All: [{
        //     MoveEventType :"0x97beea70a45eae73f1112bfced9014dc488b3df7076240e8ca4ea7ce31340762::factory::InitFactoryEvent"
        //   },
        //   {
        //     MoveEventType :"0x97beea70a45eae73f1112bfced9014dc488b3df7076240e8ca4ea7ce31340762::partner::InitPartnerEvent"
        //   },
        //   {
        //     MoveEventType :"0x97beea70a45eae73f1112bfced9014dc488b3df7076240e8ca4ea7ce31340762::config::InitConfigEvent"
        //   }]
        // }})
        // console.log('allCoinAsset: ', allCoinAsset.data)
    }));
    test('getOwnerCoinAssets', () => __awaiter(void 0, void 0, void 0, function* () {
        const allCoinAsset = yield sdk.Resources.getOwnerCoinAssets("0x5f9d2fb717ba2433f7723cf90bdbf90667001104915001d0af0cccb52b67c1e8");
        console.log('allCoinAsset: ', allCoinAsset);
    }));
    test('fetch coinAssets for coinType', () => __awaiter(void 0, void 0, void 0, function* () {
        const allCoinAsset = yield sdk.Resources.getOwnerCoinAssets(sendKeypair.getPublicKey().toSuiAddress(), '0x2::sui::SUI');
        console.log('allCoinAsset: ', allCoinAsset);
    }));
    test('getBalance', () => __awaiter(void 0, void 0, void 0, function* () {
        const allBalance = yield sdk.fullClient.getBalance({
            owner: sendKeypair.getPublicKey().toSuiAddress(),
            coinType: '0x2::sui::SUI'
        });
        console.log('allBalance: ', allBalance);
    }));
    test('transferSui', () => __awaiter(void 0, void 0, void 0, function* () {
        const signer = new sui_js_1.RawSigner(sendKeypair, sdk.fullClient);
        const tx = new tx_block_1.TxBlock();
        const recipient = "0xf751c72f6462d2c2f4434d085076c85c690a51b584d765bb8863669908835f41";
        tx.transferSui(recipient, 3 * 1000000000);
        const resultTxn = yield (0, transaction_util_1.sendTransaction)(signer, tx.txBlock);
        console.log(resultTxn);
    }));
    test('transferCoin', () => __awaiter(void 0, void 0, void 0, function* () {
        const signer = new sui_js_1.RawSigner(sendKeypair, sdk.fullClient);
        const tx = new tx_block_1.TxBlock();
        const recipient = "0x302b9f2417679def5f3665cfeeb48438d47bc54dd4f6250f803f79fb697bc31d";
        tx.transferCoin(recipient, 500 * 1000000000, ["0xb35c4a85849f33fc196de235ac0d285a5d93b196954b2fe505c6b0ccc48e747d"]);
        const resultTxn = yield (0, transaction_util_1.sendTransaction)(signer, tx.txBlock);
        console.log(resultTxn);
    }));
    test('transferObjects', () => __awaiter(void 0, void 0, void 0, function* () {
        const signer = new sui_js_1.RawSigner(sendKeypair, sdk.fullClient);
        const tx = new tx_block_1.TxBlock();
        const recipient = "0x660ea6bc10f2d6c2d40b829850ab746a6ad93c2674537c71e21809b0486254c6";
        tx.transferObjects(["0xf23891529b0e725e578f6a9900934e6eae09616d922c0b39a8d570338493f738"], recipient);
        const resultTxn = yield (0, transaction_util_1.sendTransaction)(signer, tx.txBlock);
        console.log(resultTxn);
    }));
});
