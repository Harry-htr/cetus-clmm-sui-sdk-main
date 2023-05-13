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
const tick_1 = require("../src/math/tick");
const numbers_1 = require("../src/utils/numbers");
const clmm_1 = require("../src/math/clmm");
require("isomorphic-fetch");
const transaction_util_1 = require("../src/utils/transaction-util");
const pool_data_1 = require("./data/pool_data");
describe('Pool Module', () => {
    const sdk = (0, init_test_data_1.buildSdk)();
    test('getPoolImmutables', () => __awaiter(void 0, void 0, void 0, function* () {
        const poolImmutables = yield sdk.Resources.getPoolImmutables();
        console.log('getPoolImmutables', poolImmutables, '###length###', poolImmutables.length);
    }));
    test('getAllPool', () => __awaiter(void 0, void 0, void 0, function* () {
        const allPool = yield sdk.Resources.getPools([]);
        console.log('getAllPool', allPool, '###length###', allPool.length);
    }));
    test('getSiginlePool', () => __awaiter(void 0, void 0, void 0, function* () {
        const pool = yield sdk.Resources.getPool(init_test_data_1.TokensMapping.USDT_USDC_LP.poolObjectId[0]);
        console.log('pool', pool);
    }));
    test('getPositionList', () => __awaiter(void 0, void 0, void 0, function* () {
        const res = yield sdk.Resources.getPositionList((0, init_test_data_1.buildTestAccount)().getPublicKey().toSuiAddress(), [init_test_data_1.TokensMapping.USDT_USDC_LP.poolObjectId[0]]);
        console.log('getPositionList####', res);
    }));
    test('getPositionById', () => __awaiter(void 0, void 0, void 0, function* () {
        const res = yield sdk.Resources.getPositionById('0x0e75bdb37804b049f40d43c8314a885d66a5a11755686555286dd62d38754f3b');
        console.log('getPositionById###', res);
    }));
    test('getSipmlePosition', () => __awaiter(void 0, void 0, void 0, function* () {
        const res = yield sdk.Resources.getSipmlePosition(init_test_data_1.position_object_id);
        console.log('getPositionList####', res);
    }));
    test('getPositionInfo', () => __awaiter(void 0, void 0, void 0, function* () {
        const pool = yield sdk.Resources.getPool(init_test_data_1.TokensMapping.USDT_USDC_LP.poolObjectId[0]);
        const res = yield sdk.Resources.getPosition(pool.positions_handle, "0x545d43936d9e8bad18fe4034b39cfbcf664fc79300358b5beedbb76936d3b7e8");
        console.log('getPosition####', res);
    }));
    test('fetchPositionRewardList', () => __awaiter(void 0, void 0, void 0, function* () {
        const pool = yield sdk.Resources.getPool("0xf71b517fe0f57a4e3be5b00a90c40f461058f5ae7a4bb65fe1abf3bfdd20dcf7");
        const res = yield sdk.Pool.fetchPositionRewardList({
            pool_id: pool.poolAddress,
            coinTypeA: pool.coinTypeA,
            coinTypeB: pool.coinTypeB
        });
        console.log('getPosition####', res);
    }));
    test('doCreatPools', () => __awaiter(void 0, void 0, void 0, function* () {
        const signer = new sui_js_1.RawSigner((0, init_test_data_1.buildTestAccount)(), sdk.fullClient);
        sdk.senderAddress = (0, init_test_data_1.buildTestAccount)().getPublicKey().toSuiAddress();
        const pools = pool_data_1.poolList;
        const paramss = [];
        for (const pool of pools) {
            if (!pool.hasCreat) {
                paramss.push({
                    tick_spacing: pool.tick_spacing,
                    initialize_sqrt_price: tick_1.TickMath.priceToSqrtPriceX64((0, numbers_1.d)(pool.initialize_price), pool.coin_a_decimals, pool.coin_b_decimals).toString(),
                    uri: pool.uri,
                    coinTypeA: pool.coin_type_a,
                    coinTypeB: pool.coin_type_b,
                });
            }
        }
        const creatPoolTransactionPayload = yield sdk.Pool.creatPoolsTransactionPayload(paramss);
        (0, transaction_util_1.printTransaction)(creatPoolTransactionPayload);
        const transferTxn = yield (0, transaction_util_1.sendTransaction)(signer, creatPoolTransactionPayload, true);
        console.log('doCreatPool: ', transferTxn);
    }));
    test('create_and_add_liquidity_fix_token', () => __awaiter(void 0, void 0, void 0, function* () {
        const signer = new sui_js_1.RawSigner((0, init_test_data_1.buildTestAccount)(), sdk.fullClient);
        sdk.senderAddress = (0, init_test_data_1.buildTestAccount)().getPublicKey().toSuiAddress();
        const initialize_sqrt_price = tick_1.TickMath.priceToSqrtPriceX64((0, numbers_1.d)(1), 6, 6).toString();
        const tick_spacing = 2;
        const current_tick_index = tick_1.TickMath.sqrtPriceX64ToTickIndex(new bn_js_1.default(initialize_sqrt_price));
        const lowerTick = tick_1.TickMath.getPrevInitializableTickIndex(new bn_js_1.default(current_tick_index).toNumber(), new bn_js_1.default(tick_spacing).toNumber());
        const upperTick = tick_1.TickMath.getNextInitializableTickIndex(new bn_js_1.default(current_tick_index).toNumber(), new bn_js_1.default(tick_spacing).toNumber());
        const fix_coin_amount = new bn_js_1.default(200);
        const fix_amount_a = true;
        const slippage = 0.05;
        const liquidityInput = clmm_1.ClmmPoolUtil.estLiquidityAndcoinAmountFromOneAmounts(lowerTick, upperTick, fix_coin_amount, fix_amount_a, true, slippage, new bn_js_1.default(initialize_sqrt_price));
        const amount_a = fix_amount_a ? fix_coin_amount.toNumber() : liquidityInput.tokenMaxA.toNumber();
        const amount_b = fix_amount_a ? liquidityInput.tokenMaxB.toNumber() : fix_coin_amount.toNumber();
        console.log('amount: ', { amount_a, amount_b });
        const creatPoolTransactionPayload = yield sdk.Pool.creatPoolTransactionPayload({
            tick_spacing: tick_spacing,
            initialize_sqrt_price: initialize_sqrt_price,
            uri: '',
            coinTypeA: init_test_data_1.TokensMapping.USDT.address,
            coinTypeB: init_test_data_1.TokensMapping.USDC.address,
            amount_a: amount_a,
            amount_b: amount_b,
            fix_amount_a: fix_amount_a,
            tick_lower: lowerTick,
            tick_upper: upperTick,
        });
        const transferTxn = yield (0, transaction_util_1.sendTransaction)(signer, creatPoolTransactionPayload, true);
        console.log('doCreatPool: ', transferTxn);
    }));
    test('add_fee_tier', () => __awaiter(void 0, void 0, void 0, function* () {
        const signer = new sui_js_1.RawSigner((0, init_test_data_1.buildWJLaunchPadAccount)(), sdk.fullClient);
        const tx = new sui_js_1.TransactionBlock();
        tx.setGasBudget(sdk.gasConfig.GasBudgetLow);
        const args = [tx.pure(sdk.sdkOptions.clmm.config.global_config_id), tx.pure('2'), tx.pure('1')];
        tx.moveCall({
            target: `${sdk.sdkOptions.clmm.clmm_router.cetus}::config_script::add_fee_tier`,
            typeArguments: [],
            arguments: args,
        });
        const transferTxn = yield (0, transaction_util_1.sendTransaction)(signer, tx);
        console.log('add_fee_tier: ', transferTxn);
    }));
    /** -----------------------helper function--------------------------- */
    test('getCreatePartnerEvent', () => __awaiter(void 0, void 0, void 0, function* () {
        const initEvent = yield sdk.Resources.getCreatePartnerEvent();
        console.log('getCreatePartnerEvent', initEvent);
    }));
});
