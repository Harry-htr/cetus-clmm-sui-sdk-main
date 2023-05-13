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
const tick_1 = require("../src/math/tick");
const bn_js_1 = __importDefault(require("bn.js"));
const sui_js_1 = require("@mysten/sui.js");
const init_test_data_1 = require("./data/init_test_data");
const clmm_1 = require("../src/math/clmm");
const percentage_1 = require("../src/math/percentage");
const position_1 = require("../src/math/position");
require("isomorphic-fetch");
const transaction_util_1 = require("../src/utils/transaction-util");
const src_1 = require("../src");
let sendKeypair;
describe('Position add Liquidity Module', () => {
    const sdk = (0, init_test_data_1.buildSdk)();
    beforeEach(() => __awaiter(void 0, void 0, void 0, function* () {
        sendKeypair = (0, init_test_data_1.buildTestAccount)();
        sdk.senderAddress = sendKeypair.getPublicKey().toSuiAddress();
    }));
    test('open_and_add_liquidity_fix_token', () => __awaiter(void 0, void 0, void 0, function* () {
        const poolObjectId = init_test_data_1.TokensMapping.USDT_USDC_LP.poolObjectId[0];
        const signer = new sui_js_1.RawSigner(sendKeypair, sdk.fullClient);
        const pool = yield (0, init_test_data_1.buildTestPool)(sdk, poolObjectId);
        const lowerTick = tick_1.TickMath.getPrevInitializableTickIndex(new bn_js_1.default(pool.current_tick_index).toNumber(), new bn_js_1.default(pool.tickSpacing).toNumber());
        const upperTick = tick_1.TickMath.getNextInitializableTickIndex(new bn_js_1.default(pool.current_tick_index).toNumber(), new bn_js_1.default(pool.tickSpacing).toNumber());
        const coinAmount = new bn_js_1.default(100000000);
        const fix_amount_a = false;
        const slippage = 0.05;
        const curSqrtPrice = new bn_js_1.default(pool.current_sqrt_price);
        const liquidityInput = clmm_1.ClmmPoolUtil.estLiquidityAndcoinAmountFromOneAmounts(lowerTick, upperTick, coinAmount, fix_amount_a, true, slippage, curSqrtPrice);
        const amount_a = fix_amount_a ? coinAmount.toNumber() : liquidityInput.tokenMaxA.toNumber();
        const amount_b = fix_amount_a ? liquidityInput.tokenMaxB.toNumber() : coinAmount.toNumber();
        console.log('amount: ', { amount_a, amount_b });
        const addLiquidityPayloadParams = {
            coinTypeA: pool.coinTypeA,
            coinTypeB: pool.coinTypeB,
            pool_id: pool.poolAddress,
            tick_lower: lowerTick.toString(),
            tick_upper: upperTick.toString(),
            fix_amount_a,
            amount_a,
            amount_b,
            is_open: true,
            pos_id: '',
        };
        const createAddLiquidityTransactionPayload = yield sdk.Position.createAddLiquidityTransactionPayload(addLiquidityPayloadParams, {
            slippage: slippage,
            curSqrtPrice: curSqrtPrice
        });
        (0, transaction_util_1.printTransaction)(createAddLiquidityTransactionPayload);
        const transferTxn = yield (0, transaction_util_1.sendTransaction)(signer, createAddLiquidityTransactionPayload);
        console.log('open_and_add_liquidity_fix_token: ', transferTxn);
    }));
    test('add_liquidity_fix_token', () => __awaiter(void 0, void 0, void 0, function* () {
        const poolObjectId = init_test_data_1.TokensMapping.USDT_USDC_LP.poolObjectId[0];
        const signer = new sui_js_1.RawSigner(sendKeypair, sdk.fullClient);
        const pool = yield (0, init_test_data_1.buildTestPool)(sdk, poolObjectId);
        const position = (yield (0, init_test_data_1.buildTestPosition)(sdk, init_test_data_1.position_object_id));
        const lowerTick = position.tick_lower_index;
        const upperTick = position.tick_upper_index;
        const coinAmount = new bn_js_1.default(500);
        const fix_amount_a = true;
        const slippage = 0.05;
        const curSqrtPrice = new bn_js_1.default(pool.current_sqrt_price);
        const liquidityInput = clmm_1.ClmmPoolUtil.estLiquidityAndcoinAmountFromOneAmounts(lowerTick, upperTick, coinAmount, fix_amount_a, true, slippage, curSqrtPrice);
        const amount_a = fix_amount_a ? coinAmount.toNumber() : liquidityInput.tokenMaxA.toNumber();
        const amount_b = fix_amount_a ? liquidityInput.tokenMaxB.toNumber() : coinAmount.toNumber();
        console.log('amount: ', { amount_a, amount_b });
        const addLiquidityPayloadParams = {
            coinTypeA: pool.coinTypeA,
            coinTypeB: pool.coinTypeB,
            pool_id: pool.poolAddress,
            tick_lower: lowerTick.toString(),
            tick_upper: upperTick.toString(),
            fix_amount_a,
            amount_a,
            amount_b,
            is_open: false,
            pos_id: position.pos_object_id,
        };
        const createAddLiquidityTransactionPayload = yield sdk.Position.createAddLiquidityTransactionPayload(addLiquidityPayloadParams);
        (0, transaction_util_1.printTransaction)(createAddLiquidityTransactionPayload);
        const transferTxn = yield (0, transaction_util_1.sendTransaction)(signer, createAddLiquidityTransactionPayload);
        console.log('add_liquidity_fix_token: ', transferTxn);
    }));
});
describe('Position  Module', () => {
    const sdk = (0, init_test_data_1.buildSdk)();
    beforeEach(() => __awaiter(void 0, void 0, void 0, function* () {
        sendKeypair = (0, init_test_data_1.buildTestAccount)();
    }));
    test('getCoinAmountFromLiquidity', () => __awaiter(void 0, void 0, void 0, function* () {
        const poolObjectId = "0x7e279224f1dd455860d65fa975cce5208485fd98b8e9a0cb6bd087c6dc9f5e03"; // TokensMapping.USDT_USDC_LP.poolObjectId[0]
        const position_object_id = "0xf1b99f796fdd41ce3e7e9bbef7e3f840b44f4c9e5ca99b8df47e91037968452f";
        const pool = yield (0, init_test_data_1.buildTestPool)(sdk, poolObjectId);
        const position = (yield (0, init_test_data_1.buildTestPosition)(sdk, position_object_id));
        const curSqrtPrice = new bn_js_1.default(pool.current_sqrt_price);
        const lowerSqrtPrice = tick_1.TickMath.tickIndexToSqrtPriceX64(position.tick_lower_index);
        const upperSqrtPrice = tick_1.TickMath.tickIndexToSqrtPriceX64(position.tick_upper_index);
        const coinAmounts = clmm_1.ClmmPoolUtil.getCoinAmountFromLiquidity(new bn_js_1.default(Number((0, src_1.d)(position.liquidity).mul(0.25))), curSqrtPrice, lowerSqrtPrice, upperSqrtPrice, true);
        console.log('coinA: ', coinAmounts.coinA.toString());
        console.log('coinB: ', coinAmounts.coinB.toString());
    }));
    test('removeLiquidity', () => __awaiter(void 0, void 0, void 0, function* () {
        const poolObjectId = init_test_data_1.TokensMapping.USDT_USDC_LP.poolObjectId[0];
        const signer = new sui_js_1.RawSigner(sendKeypair, sdk.fullClient);
        const pool = yield (0, init_test_data_1.buildTestPool)(sdk, poolObjectId);
        const position = (yield (0, init_test_data_1.buildTestPosition)(sdk, init_test_data_1.position_object_id));
        const lowerTick = Number(position.tick_lower_index);
        const upperTick = Number(position.tick_upper_index);
        const lowerSqrtPrice = tick_1.TickMath.tickIndexToSqrtPriceX64(lowerTick);
        const upperSqrtPrice = tick_1.TickMath.tickIndexToSqrtPriceX64(upperTick);
        const liquidity = new bn_js_1.default(10);
        const slippageTolerance = new percentage_1.Percentage(new bn_js_1.default(5), new bn_js_1.default(100));
        const curSqrtPrice = new bn_js_1.default(pool.current_sqrt_price);
        const coinAmounts = clmm_1.ClmmPoolUtil.getCoinAmountFromLiquidity(liquidity, curSqrtPrice, lowerSqrtPrice, upperSqrtPrice, false);
        const { tokenMaxA, tokenMaxB } = (0, position_1.adjustForCoinSlippage)(coinAmounts, slippageTolerance, false);
        const removeLiquidityParams = {
            coinTypeA: pool.coinTypeA,
            coinTypeB: pool.coinTypeB,
            delta_liquidity: liquidity.toString(),
            min_amount_a: tokenMaxA.toString(),
            min_amount_b: tokenMaxB.toString(),
            pool_id: pool.poolAddress,
            pos_id: position.pos_object_id,
            collect_fee: true
        };
        const removeLiquidityTransactionPayload = sdk.Position.removeLiquidityTransactionPayload(removeLiquidityParams);
        (0, transaction_util_1.printTransaction)(removeLiquidityTransactionPayload);
        const transferTxn = yield (0, transaction_util_1.sendTransaction)(signer, removeLiquidityTransactionPayload);
        console.log('removeLiquidity: ', transferTxn);
    }));
    test('only open position', () => __awaiter(void 0, void 0, void 0, function* () {
        const signer = new sui_js_1.RawSigner(sendKeypair, sdk.fullClient);
        const pool = yield (0, init_test_data_1.buildTestPool)(sdk, init_test_data_1.TokensMapping.USDT_USDC_LP.poolObjectId[0]);
        const lowerTick = tick_1.TickMath.getPrevInitializableTickIndex(new bn_js_1.default(pool.current_tick_index).toNumber(), new bn_js_1.default(pool.tickSpacing).toNumber());
        const upperTick = tick_1.TickMath.getNextInitializableTickIndex(new bn_js_1.default(pool.current_tick_index).toNumber(), new bn_js_1.default(pool.tickSpacing).toNumber());
        const openPositionTransactionPayload = sdk.Position.openPositionTransactionPayload({
            coinTypeA: pool.coinTypeA,
            coinTypeB: pool.coinTypeB,
            tick_lower: lowerTick.toString(),
            tick_upper: upperTick.toString(),
            pool_id: pool.poolAddress,
        });
        const transferTxn = yield (0, transaction_util_1.sendTransaction)(signer, openPositionTransactionPayload);
        console.log('only open position: ', transferTxn);
    }));
    test('close position', () => __awaiter(void 0, void 0, void 0, function* () {
        const signer = new sui_js_1.RawSigner(sendKeypair, sdk.fullClient);
        const poolObjectId = init_test_data_1.TokensMapping.USDT_USDC_LP.poolObjectId[0];
        const pool = yield (0, init_test_data_1.buildTestPool)(sdk, poolObjectId);
        const position_object_id = "0x9fd7da6971c24f9ea5fdee4edaf31c3b27f7a02cc4873302f76ad53970bd6a07";
        const position = (yield (0, init_test_data_1.buildTestPosition)(sdk, position_object_id));
        const lowerTick = Number(position.tick_lower_index);
        const upperTick = Number(position.tick_upper_index);
        const lowerSqrtPrice = tick_1.TickMath.tickIndexToSqrtPriceX64(lowerTick);
        const upperSqrtPrice = tick_1.TickMath.tickIndexToSqrtPriceX64(upperTick);
        const liquidity = new bn_js_1.default(position.liquidity);
        const slippageTolerance = new percentage_1.Percentage(new bn_js_1.default(5), new bn_js_1.default(100));
        const curSqrtPrice = new bn_js_1.default(pool.current_sqrt_price);
        const coinAmounts = clmm_1.ClmmPoolUtil.getCoinAmountFromLiquidity(liquidity, curSqrtPrice, lowerSqrtPrice, upperSqrtPrice, false);
        const { tokenMaxA, tokenMaxB } = (0, position_1.adjustForCoinSlippage)(coinAmounts, slippageTolerance, false);
        const rewards = yield sdk.Rewarder.posRewardersAmount(poolObjectId, pool.positions_handle, position_object_id);
        console.log("rewards: ", rewards);
        const rewardCoinTypes = rewards.filter((item) => {
            if (Number(item.amount_owed) > 0) {
                return item.coin_address;
            }
        });
        const closePositionTransactionPayload = sdk.Position.closePositionTransactionPayload({
            coinTypeA: pool.coinTypeA,
            coinTypeB: pool.coinTypeB,
            min_amount_a: tokenMaxA.toString(),
            min_amount_b: tokenMaxB.toString(),
            rewarder_coin_types: [...rewardCoinTypes],
            pool_id: pool.poolAddress,
            pos_id: position_object_id,
        });
        (0, transaction_util_1.printTransaction)(closePositionTransactionPayload);
        const transferTxn = yield (0, transaction_util_1.sendTransaction)(signer, closePositionTransactionPayload);
        console.log('close position: ', transferTxn);
    }));
    test('collect_fee', () => __awaiter(void 0, void 0, void 0, function* () {
        const signer = new sui_js_1.RawSigner(sendKeypair, sdk.fullClient);
        const pool = yield (0, init_test_data_1.buildTestPool)(sdk, init_test_data_1.TokensMapping.USDT_USDC_LP.poolObjectId[0]);
        const collectFeeTransactionPayload = sdk.Position.collectFeeTransactionPayload({
            coinTypeA: pool.coinTypeA,
            coinTypeB: pool.coinTypeB,
            pool_id: pool.poolAddress,
            pos_id: init_test_data_1.position_object_id,
        });
        // console.log(await TransactionUtil.calculationTxGas(sdk,collectFeeTransactionPayload));
        const transferTxn = yield (0, transaction_util_1.sendTransaction)(signer, collectFeeTransactionPayload);
        console.log('collect_fee: ', transferTxn);
    }));
});
