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
const sui_js_1 = require("@mysten/sui.js");
const bn_js_1 = __importDefault(require("bn.js"));
const init_test_data_1 = require("./data/init_test_data");
require("isomorphic-fetch");
const transaction_util_1 = require("../src/utils/transaction-util");
const src_1 = require("../src");
let sendKeypair;
describe('Swap calculate Module', () => {
    const sdk = (0, init_test_data_1.buildSdk)();
    test('calculateRates', () => __awaiter(void 0, void 0, void 0, function* () {
        const a2b = true;
        const byAmountIn = true;
        const amount = new bn_js_1.default('1000');
        const poolObjectId = init_test_data_1.TokensMapping.USDT_USDC_LP.poolObjectId[0];
        const currentPool = yield (0, init_test_data_1.buildTestPool)(sdk, poolObjectId);
        const tickdatas = yield sdk.Pool.fetchTicksByRpc(currentPool.ticks_handle);
        const res = yield sdk.Swap.calculateRates({
            decimalsA: 6,
            decimalsB: 6,
            a2b,
            byAmountIn,
            amount,
            swapTicks: tickdatas,
            currentPool,
        });
        console.log('calculateRates', {
            estimatedAmountIn: res.estimatedAmountIn.toString(),
            estimatedAmountOut: res.estimatedAmountOut.toString(),
            estimatedEndSqrtprice: res.estimatedEndSqrtPrice.toString(),
            estimatedFeeAmount: res.estimatedFeeAmount.toString(),
            isExceed: res.isExceed,
            a2b,
            byAmountIn,
        });
    }));
    test('fetchTicksByContract', () => __awaiter(void 0, void 0, void 0, function* () {
        const tickdatas = yield sdk.Pool.fetchTicks({
            pool_id: init_test_data_1.TokensMapping.USDT_USDC_LP.poolObjectId[0],
            coinTypeA: "0x473d520316e4ea5550657410669c9da6cde191e570d63d754cee353e11746751::usdt::USDT",
            coinTypeB: "0x473d520316e4ea5550657410669c9da6cde191e570d63d754cee353e11746751::usdc::USDC",
        });
        console.log('fetchTicks: ', tickdatas);
    }));
    test('fetchTicksByRpc', () => __awaiter(void 0, void 0, void 0, function* () {
        const tickdatas = yield sdk.Pool.fetchTicksByRpc('0x8d2ed466497914180b59fb3ad2cf036ac62f59c3761646caba51dfa92ca9c97a');
        console.log('fetchTicks: ', tickdatas);
    }));
    test('getTickDataByIndex', () => __awaiter(void 0, void 0, void 0, function* () {
        const tickdata = yield sdk.Pool.getTickDataByIndex('0x79696ca8bcdc45b9e15ef7da074a9c9a6f94739021590d7f57a3ed4055b93532', -443636);
        console.log('tickdata: ', tickdata);
    }));
    test('getTickDataByObjectId', () => __awaiter(void 0, void 0, void 0, function* () {
        const tickdata = yield sdk.fullClient.getDynamicFields({ parentId: "0x6bb10e21eb4cfbc023a7a5d30ecc07d3b67532ae18aab4369b60a42351ae4ab5" });
        console.log('tickdata: ', tickdata.data);
        //const tickdata = await sdk.Pool.getTickDataByObjectId("0x1365a01071ee4f9da231a37480924a5745386af8a17935ed1a4b6bdb7a732a36")
        // console.log('tickdata: ', tickdata)
    }));
    test('preSwapWithMultiPool', () => __awaiter(void 0, void 0, void 0, function* () {
        const a2b = true;
        const poolAddresses = [
            '0x018734f81283c5320fd322178f8d4aeafb6e0034959a890987b10705297b61e3',
            '0x684d8a994e695578e5e45ad3aa020a338c9d42879f7b1853a1cede6e317ba900',
            '0x525d2a587f56a42ea350072d61b0c00283f9587949764332c4c2bb0e6db9b9f8'
        ];
        const pool0 = yield (0, init_test_data_1.buildTestPool)(sdk, poolAddresses[0]);
        const pool1 = yield (0, init_test_data_1.buildTestPool)(sdk, poolAddresses[1]);
        const pool2 = yield (0, init_test_data_1.buildTestPool)(sdk, poolAddresses[2]);
        const byAmountIn = true;
        const amount = '10000000';
        const resWithMultiPool = yield sdk.Swap.preSwapWithMultiPool({
            poolAddresses: poolAddresses,
            coinTypeA: pool0.coinTypeA,
            coinTypeB: pool0.coinTypeB,
            decimalsA: 6,
            decimalsB: 6,
            a2b,
            byAmountIn,
            amount,
        });
        for (const pool of [pool0, pool1, pool2]) {
            const res = yield sdk.Swap.preswap({
                pool: pool,
                current_sqrt_price: pool.current_sqrt_price,
                coinTypeA: pool.coinTypeA,
                coinTypeB: pool.coinTypeB,
                decimalsA: 6,
                decimalsB: 6,
                a2b,
                by_amount_in: byAmountIn,
                amount,
            });
            console.log('preswap###res###', res);
        }
        console.log('preswap###res###', resWithMultiPool);
    }));
    test('preswap', () => __awaiter(void 0, void 0, void 0, function* () {
        const a2b = true;
        const pool = yield (0, init_test_data_1.buildTestPool)(sdk, init_test_data_1.TokensMapping.USDT_USDC_LP.poolObjectId[0]);
        const byAmountIn = true;
        const amount = '10000000';
        const res = yield sdk.Swap.preswap({
            pool: pool,
            current_sqrt_price: pool.current_sqrt_price,
            coinTypeA: pool.coinTypeA,
            coinTypeB: pool.coinTypeB,
            decimalsA: 6,
            decimalsB: 6,
            a2b,
            by_amount_in: byAmountIn,
            amount,
        });
        console.log('preswap###res###', res);
    }));
});
describe('Swap Module', () => {
    const sdk = (0, init_test_data_1.buildSdk)();
    beforeEach(() => __awaiter(void 0, void 0, void 0, function* () {
        sendKeypair = (0, init_test_data_1.buildTestAccount)();
        sdk.senderAddress = sendKeypair.getPublicKey().toSuiAddress();
    }));
    test('swap', () => __awaiter(void 0, void 0, void 0, function* () {
        const signer = new sui_js_1.RawSigner(sendKeypair, sdk.fullClient);
        const a2b = true;
        // 9667200
        const byAmountIn = true;
        const amount = new bn_js_1.default(10000);
        const slippage = src_1.Percentage.fromDecimal((0, src_1.d)(0.1));
        const poolObjectId = "0xcfa5914edd8ed9e60006e36dd01d880ffc65acdc13a67d2432b66855b3e1b6ba";
        const currentPool = yield (0, init_test_data_1.buildTestPool)(sdk, poolObjectId);
        const tickdatas = yield sdk.Pool.fetchTicksByRpc(currentPool.ticks_handle);
        const decimalsA = 6;
        const decimalsB = 9;
        const calculateRatesParams = {
            decimalsA,
            decimalsB,
            a2b,
            byAmountIn,
            amount,
            swapTicks: tickdatas,
            currentPool,
        };
        const res = yield sdk.Swap.calculateRates(calculateRatesParams);
        console.log('calculateRates', {
            estimatedAmountIn: res.estimatedAmountIn.toString(),
            estimatedAmountOut: res.estimatedAmountOut.toString(),
            estimatedEndSqrtprice: res.estimatedEndSqrtPrice.toString(),
            estimatedFeeAmount: res.estimatedFeeAmount.toString(),
            isExceed: res.isExceed,
            a2b,
            byAmountIn,
        });
        const toAmount = byAmountIn ? res.estimatedAmountOut : res.estimatedAmountIn;
        const amountLimit = (0, src_1.adjustForSlippage)(toAmount, slippage, !byAmountIn);
        // console.log('swap###params####', { amount: res.amount.toString(), amount_limit: amountLimit.toString() })
        const swapPayload = yield sdk.Swap.createSwapTransactionPayload({
            pool_id: currentPool.poolAddress,
            a2b,
            by_amount_in: byAmountIn,
            amount: amount.toString(),
            amount_limit: amountLimit.toString(),
            coinTypeA: currentPool.coinTypeA,
            coinTypeB: currentPool.coinTypeB,
        }, {
            byAmountIn,
            slippage,
            decimalsA,
            decimalsB,
            swapTicks: tickdatas,
            currentPool
        });
        (0, transaction_util_1.printTransaction)(swapPayload);
        const transferTxn = yield (0, transaction_util_1.sendTransaction)(signer, swapPayload);
        console.log('swap: ', transferTxn);
    }));
});
