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
const init_test_data_1 = require("./data/init_test_data");
const sui_js_1 = require("@mysten/sui.js");
require("isomorphic-fetch");
const bn_js_1 = __importDefault(require("bn.js"));
const poolObjectId = init_test_data_1.TokensMapping.USDT_USDC_LP.poolObjectId[0];
describe('Rewarder Module', () => {
    const sdk = (0, init_test_data_1.buildSdk)();
    test('emissionsEveryDay', () => __awaiter(void 0, void 0, void 0, function* () {
        const emissionsEveryDay = yield sdk.Rewarder.emissionsEveryDay(poolObjectId);
        console.log(emissionsEveryDay);
    }));
    test('posRewardersAmount', () => __awaiter(void 0, void 0, void 0, function* () {
        const pool = yield sdk.Resources.getPool("0x7b9d0f7e1ba6de8eefaa259da9f992e00aa8c22310b71ffabf2784e5b018a173");
        console.log("pool", pool);
        const res = yield sdk.Rewarder.posRewardersAmount(pool.poolAddress, pool.positions_handle, "0x5a0a9317df9239a80c5d9623ea87f0ac36f1cec733dc767ba606a6316a078d04");
        console.log('res####', res[0].amount_owed.toString(), res[1].amount_owed.toString(), res[2].amount_owed.toString());
    }));
    test('poolRewardersAmount', () => __awaiter(void 0, void 0, void 0, function* () {
        const account = (0, init_test_data_1.buildTestAccount)().getPublicKey().toSuiAddress();
        const res = yield sdk.Rewarder.poolRewardersAmount(account, init_test_data_1.TokensMapping.USDT_USDC_LP.poolObjectId[0]);
        console.log('res####', res);
    }));
    test('test BN', () => __awaiter(void 0, void 0, void 0, function* () {
        const a = new bn_js_1.default('49606569301722253557813231039171');
        const a2 = a.mul(new bn_js_1.default(2));
        console.log(a2.toString());
        let a3 = a2.mul(new bn_js_1.default(2));
        console.log(a3.toString());
        for (let i = 0; i < 30; i += 1) {
            const a4 = a3.mul(new bn_js_1.default(2));
            console.log(a4.toString());
            a3 = a4;
        }
    }));
    test('collectPoolRewarderTransactionPayload', () => __awaiter(void 0, void 0, void 0, function* () {
        const account = (0, init_test_data_1.buildTestAccount)();
        const signer = new sui_js_1.RawSigner(account, sdk.fullClient);
        const pool = yield sdk.Resources.getPool(poolObjectId);
        const rewards = yield sdk.Rewarder.posRewardersAmount(pool.poolAddress, pool.positions_handle, init_test_data_1.position_object_id);
        const rewardCoinTypes = rewards.filter((item) => {
            if (Number(item.amount_owed) > 0) {
                return item.coin_address;
            }
        });
        const collectRewarderParams = {
            pool_id: pool.poolAddress,
            pos_id: init_test_data_1.position_object_id,
            rewarder_coin_types: [...rewardCoinTypes],
            coinTypeA: pool.coinTypeA,
            coinTypeB: pool.coinTypeB,
            collect_fee: false
        };
        const collectRewarderPayload = sdk.Rewarder.collectRewarderTransactionPayload(collectRewarderParams);
        console.log("collectRewarderPayload: ", collectRewarderPayload.blockData.transactions[0]);
        const transferTxn = (yield signer.signAndExecuteTransactionBlock({ transactionBlock: collectRewarderPayload }));
        console.log('result: ', (0, sui_js_1.getTransactionEffects)(transferTxn));
    }));
});
