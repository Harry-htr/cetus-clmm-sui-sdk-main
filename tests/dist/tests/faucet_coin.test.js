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
const CoinAssist_1 = require("../src/math/CoinAssist");
const init_test_data_1 = require("./data/init_test_data");
require("isomorphic-fetch");
const transaction_util_1 = require("../src/utils/transaction-util");
const config_1 = require("./data/config");
const sdk = (0, init_test_data_1.buildSdk)();
let sendKeypair;
describe('getFaucetEvent test', () => {
    test('getFaucetEvent', () => __awaiter(void 0, void 0, void 0, function* () {
        const faucetEvents = yield sdk.Resources.getFaucetEvent(config_1.sdkEnv.faucet.faucet_display, (0, init_test_data_1.buildTestAccount)().getPublicKey().toSuiAddress());
        console.log('getFaucetEvent', faucetEvents);
    }));
    /**
     * curl --location --request POST 'http://192.168.1.41:9000/gas' \
  --header 'Content-Type: application/json' \
  --data-raw '{
      "FixedAmountRequest": {
          "recipient": "0xd974f68de93ac3f47572bd053969bf2b078ed0524da4b486e1d5471f408f8605"
      }
  }'
     */
    test('requestSuiFromFaucet', () => __awaiter(void 0, void 0, void 0, function* () {
        const suiFromFaucet = yield sdk.fullClient.requestSuiFromFaucet((0, init_test_data_1.buildTestAccount)().getPublicKey().toSuiAddress());
        console.log('requestSuiFromFaucet', suiFromFaucet);
    }));
});
describe('faucet coin test', () => {
    beforeEach(() => __awaiter(void 0, void 0, void 0, function* () {
        sendKeypair = (0, init_test_data_1.buildTestAccount)();
    }));
    test(' get faucet Coins  ', () => __awaiter(void 0, void 0, void 0, function* () {
        const faucetObject = yield sdk.fullClient.getObject({ id: config_1.sdkEnv.faucet.faucet_display, options: { showPreviousTransaction: true } });
        const faucetTx = (0, sui_js_1.getObjectPreviousTransactionDigest)(faucetObject);
        console.log('faucetTx: ', faucetTx);
        if (faucetTx === undefined) {
            throw Error('fail to get faucetTx');
        }
        const suiTransactionResponse = (yield sdk.Resources.getSuiTransactionResponse(faucetTx));
        const faucetCoins = CoinAssist_1.CoinAssist.getFaucetCoins(suiTransactionResponse);
        console.log('faucetCoins', faucetCoins);
    }));
    test('faucetCoins', () => __awaiter(void 0, void 0, void 0, function* () {
        yield (0, init_test_data_1.mintAll)(sdk, sendKeypair, config_1.sdkEnv.faucet, 'faucet', 'faucetAll');
    }));
    test('faucetOneCoin', () => __awaiter(void 0, void 0, void 0, function* () {
        const coin = {
            transactionModule: 'btc',
            suplyID: '0xdf17a296e80416827b9bab70ca2f84a293fdf967815b365c6c7f7b12141703fb',
            decimals: 8,
        };
        const signer = new sui_js_1.RawSigner(sendKeypair, sdk.fullClient);
        const tx = new sui_js_1.TransactionBlock();
        tx.setGasBudget(20000000);
        tx.moveCall({
            target: `${config_1.sdkEnv.faucet.faucet_router}::${coin.transactionModule}::faucet`,
            typeArguments: [],
            arguments: [tx.pure(coin.suplyID)],
        });
        (0, transaction_util_1.printTransaction)(tx);
        const transferTxn = yield (0, transaction_util_1.sendTransaction)(signer, tx);
        console.log('faucetAll: ', transferTxn);
    }));
});
