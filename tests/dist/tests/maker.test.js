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
const resourcesModule_1 = require("../src/modules/resourcesModule");
let sendKeypair;
const makerPoolId = '0xfe394df30f94cb7feef052e43c4b401e84ea2dd62291cbc1134f3d279565a056';
const clmm_position_id = '0x7b9a10639f19261edcdfbe3dcd9334d98270fc6f1196df27cae05fbaebd2b78c';
const venft_id = '0x552d7507d4cc36d4bdd7f4a107e7b49fb540db376ba1bdd73d042c7b99d25d73';
describe('Maker bonus Module', () => {
    const sdk = (0, init_test_data_1.buildSdk)();
    beforeEach(() => __awaiter(void 0, void 0, void 0, function* () {
        sendKeypair = (0, init_test_data_1.buildTestAccount)();
        sdk.senderAddress = sendKeypair.getPublicKey().toSuiAddress();
        console.log('env: ', sdk.sdkOptions.fullRpcUrl);
    }));
    test('get PoolImmutables', () => __awaiter(void 0, void 0, void 0, function* () {
        const poolImmutables = yield sdk.MakerModule.getPoolImmutables();
        console.log('poolImmutables: ', poolImmutables);
    }));
    test('getPools', () => __awaiter(void 0, void 0, void 0, function* () {
        const pools = yield sdk.MakerModule.getPools();
        console.log('pools: ', pools);
    }));
    test('getSinglePools', () => __awaiter(void 0, void 0, void 0, function* () {
        const pool = yield sdk.MakerModule.getPool(makerPoolId);
        console.log('pool: ', pool);
        const formatPeriods = yield sdk.MakerModule.getMakerPoolPeriods(pool);
        console.log('formatPeriods: ', formatPeriods);
    }));
    test('getPoolMarkerPositionList', () => __awaiter(void 0, void 0, void 0, function* () {
        const pool = yield sdk.MakerModule.getPool(makerPoolId);
        console.log('pool: ', pool);
        const formatPeriods = yield sdk.MakerModule.getMakerPoolPeriods(pool);
        console.log('formatPeriods: ', formatPeriods);
        const currPeriod = formatPeriods[0];
        if (formatPeriods.length > 0) {
            const positionList = yield sdk.MakerModule.getPoolMarkerPositionList(pool.whale_nfts.whale_nfts_handle, [currPeriod]);
            console.log('positionList: ', positionList[currPeriod.period]);
        }
    }));
    test('get my owenr position ', () => __awaiter(void 0, void 0, void 0, function* () {
        const pool = yield sdk.MakerModule.getPool(makerPoolId);
        console.log('pool: ', pool);
        const formatPeriods = yield sdk.MakerModule.getMakerPoolPeriods(pool);
        const positionList = yield sdk.MakerModule.getPoolMarkerPositionList(pool.whale_nfts.whale_nfts_handle, formatPeriods);
        console.log('positionList: ', positionList);
        const ownerAddress = sendKeypair.getPublicKey().toSuiAddress();
        const ownerList = positionList[formatPeriods[0].period].filter((item) => {
            var _a;
            return ((_a = item.clmm_position) === null || _a === void 0 ? void 0 : _a.owner) === ownerAddress;
        });
        console.log('ownerList: ', ownerList);
    }));
    test('getPoolBonusInfo ', () => __awaiter(void 0, void 0, void 0, function* () {
        const pool = yield sdk.MakerModule.getPool(makerPoolId);
        console.log('pool: ', pool);
        const poolBonusInfo = yield sdk.MakerModule.getPoolBonusInfo(pool.rewarders.rewarder_handle, 0);
        console.log('poolBonusInfo: ', poolBonusInfo);
    }));
    test('updateXCetusRewarderAndFee ', () => __awaiter(void 0, void 0, void 0, function* () {
        const pool = yield sdk.MakerModule.getPool(makerPoolId);
        console.log('pool: ', pool);
        const formatPeriods = yield sdk.MakerModule.getMakerPoolPeriods(pool);
        const positionList = yield sdk.MakerModule.getPoolMarkerPositionList(pool.whale_nfts.whale_nfts_handle, formatPeriods);
        console.log('positionList: ', positionList);
        const positionListIncludeRewarders = yield sdk.MakerModule.updateXCetusRewarderAndFee(pool, positionList[formatPeriods[0].period], formatPeriods[0]);
        console.log('positionListIncludeRewarders: ', positionListIncludeRewarders);
    }));
    test('calculateXCetusRewarder ', () => __awaiter(void 0, void 0, void 0, function* () {
        const pool = yield sdk.MakerModule.getPool(makerPoolId);
        console.log('pool: ', pool);
        const formatPeriods = yield sdk.MakerModule.getMakerPoolPeriods(pool);
        const positionList = yield sdk.MakerModule.getPoolMarkerPositionList(pool.whale_nfts.whale_nfts_handle, formatPeriods);
        console.log('positionList: ', positionList);
        const total_points_after_multiper = yield sdk.MakerModule.calculateTotalPointsAfterMultiper(pool, formatPeriods[0]);
        console.log('total_points_after_multiper: ', total_points_after_multiper);
        const rewarderAmount = yield sdk.MakerModule.calculateXCetusRewarder(pool, positionList[formatPeriods[0].period][0], formatPeriods[0].period, total_points_after_multiper);
        console.log('rewarderAmount: ', rewarderAmount);
    }));
    test('calculateFeeRate ', () => __awaiter(void 0, void 0, void 0, function* () {
        const pool = yield sdk.MakerModule.getPool(makerPoolId);
        console.log('pool: ', pool);
        const formatPeriods = yield sdk.MakerModule.getMakerPoolPeriods(pool);
        const positionList = yield sdk.MakerModule.getPoolMarkerPositionList(pool.whale_nfts.whale_nfts_handle, formatPeriods);
        console.log('positionList: ', positionList);
        const total_points_after_multiper = yield sdk.MakerModule.calculateTotalPointsAfterMultiper(pool, formatPeriods[0]);
        console.log('total_points_after_multiper: ', total_points_after_multiper);
        const feerate = sdk.MakerModule.calculateFeeShareRate(pool, positionList[formatPeriods[0].period][0], total_points_after_multiper);
        console.log('feerate: ', feerate);
    }));
    test('claimAllPayload ', () => __awaiter(void 0, void 0, void 0, function* () {
        const signer = new sui_js_1.RawSigner(sendKeypair, sdk.fullClient);
        const pools = yield sdk.MakerModule.getPools();
        console.log('pools: ', pools);
        const result = yield sdk.MakerModule.calculateAllXCetusRewarder(pools);
        console.log('result: ', result);
        if (result.claimtotal.greaterThan(0)) {
            const tx = sdk.MakerModule.claimAllPayload({
                ve_nft_id: venft_id,
                whale_nfts: result.claimRecord
            });
            (0, src_1.printTransaction)(tx);
            const txResult = yield (0, src_1.sendTransaction)(signer, tx);
            console.log('claimPayload: ', txResult);
        }
    }));
    test('claimPayload', () => __awaiter(void 0, void 0, void 0, function* () {
        const signer = new sui_js_1.RawSigner(sendKeypair, sdk.fullClient);
        const pool = yield sdk.MakerModule.getPool(makerPoolId);
        console.log('pool: ', pool);
        const formatPeriods = yield sdk.MakerModule.getMakerPoolPeriods(pool);
        const formatPeriod = formatPeriods[0];
        const positionList = yield sdk.MakerModule.getPoolMarkerPositionList(pool.whale_nfts.whale_nfts_handle, [formatPeriod]);
        console.log('positionList: ', positionList);
        const clmm_position = positionList[formatPeriod.period][1].clmm_position;
        if ((clmm_position === null || clmm_position === void 0 ? void 0 : clmm_position.position_status) === resourcesModule_1.PositionStatus.Exists) {
            const tx = sdk.MakerModule.claimPayload({
                market_pool_id: pool.pool_id,
                position_nft_id: clmm_position.pos_object_id,
                ve_nft_id: venft_id,
                bonus_type: pool.bonus_type,
                phase: formatPeriod.period,
            });
            (0, src_1.printTransaction)(tx);
            const txResult = yield (0, src_1.sendTransaction)(signer, tx);
            console.log('claimPayload: ', txResult);
        }
    }));
});
