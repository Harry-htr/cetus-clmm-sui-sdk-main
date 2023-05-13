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
exports.RewarderModule = void 0;
/* eslint-disable no-bitwise */
/* eslint-disable no-plusplus */
/* eslint-disable no-await-in-loop */
/* eslint-disable camelcase */
const bn_js_1 = __importDefault(require("bn.js"));
const sui_js_1 = require("@mysten/sui.js");
const sui_1 = require("../types/sui");
const tick_1 = require("../utils/tick");
const utils_1 = require("../math/utils");
class RewarderModule {
    constructor(sdk) {
        this._sdk = sdk;
        this.growthGlobal = [utils_1.ZERO, utils_1.ZERO, utils_1.ZERO];
    }
    get sdk() {
        return this._sdk;
    }
    // `emissionsEveryDay` returns the number of emissions every day.
    emissionsEveryDay(poolObjectId) {
        return __awaiter(this, void 0, void 0, function* () {
            const currentPool = yield this.sdk.Resources.getPool(poolObjectId);
            const rewarderInfos = currentPool.rewarder_infos;
            if (!rewarderInfos) {
                return null;
            }
            const emissionsEveryDay = [];
            for (const rewarderInfo of rewarderInfos) {
                const emissionSeconds = utils_1.MathUtil.fromX64(new bn_js_1.default(rewarderInfo.emissions_per_second));
                emissionsEveryDay.push({
                    emissions: Math.floor(emissionSeconds.toNumber() * 60 * 60 * 24),
                    coin_address: rewarderInfo.coinAddress,
                });
            }
            return emissionsEveryDay;
        });
    }
    updatePoolRewarder(poolObjectId, currentTime) {
        return __awaiter(this, void 0, void 0, function* () {
            // refresh pool rewarder
            const currentPool = yield this.sdk.Resources.getPool(poolObjectId);
            const lastTime = currentPool.rewarder_last_updated_time;
            currentPool.rewarder_last_updated_time = currentTime.toString();
            if (Number(currentPool.liquidity) === 0 || currentTime.eq(new bn_js_1.default(lastTime))) {
                return currentPool;
            }
            const timeDelta = currentTime.div(new bn_js_1.default(1000)).sub(new bn_js_1.default(lastTime)).add(new bn_js_1.default(15));
            const rewarderInfos = currentPool.rewarder_infos;
            for (let i = 0; i < rewarderInfos.length; i += 1) {
                const rewarderInfo = rewarderInfos[i];
                const rewarderGrowthDelta = utils_1.MathUtil.checkMulDivFloor(timeDelta, new bn_js_1.default(rewarderInfo.emissions_per_second), new bn_js_1.default(currentPool.liquidity), 128);
                this.growthGlobal[i] = new bn_js_1.default(rewarderInfo.growth_global).add(new bn_js_1.default(rewarderGrowthDelta));
            }
            return currentPool;
        });
    }
    posRewardersAmount(poolObjectId, positionHandle, positionId) {
        return __awaiter(this, void 0, void 0, function* () {
            const currentTime = Date.parse(new Date().toString());
            const pool = yield this.updatePoolRewarder(poolObjectId, new bn_js_1.default(currentTime));
            const position = yield this.sdk.Resources.getPosition(positionHandle, positionId);
            if (position === undefined) {
                return [];
            }
            const ticksHandle = pool.ticks_handle;
            const tickLower = yield this.sdk.Pool.getTickDataByIndex(ticksHandle, position.tick_lower_index);
            const tickUpper = yield this.sdk.Pool.getTickDataByIndex(ticksHandle, position.tick_upper_index);
            const amountOwed = yield this.posRewardersAmountInternal(pool, position, tickLower, tickUpper);
            return amountOwed;
        });
    }
    poolRewardersAmount(account, poolObjectId) {
        return __awaiter(this, void 0, void 0, function* () {
            const currentTime = Date.parse(new Date().toString());
            const pool = yield this.updatePoolRewarder(poolObjectId, new bn_js_1.default(currentTime));
            const positions = yield this.sdk.Resources.getPositionList(account, [poolObjectId]);
            const tickDatas = yield this.getPoolLowerAndUpperTicks(pool.ticks_handle, positions);
            const rewarderAmount = [utils_1.ZERO, utils_1.ZERO, utils_1.ZERO];
            for (let i = 0; i < positions.length; i += 1) {
                // eslint-disable-next-line no-await-in-loop
                const posRewarderInfo = yield this.posRewardersAmountInternal(pool, positions[i], tickDatas[0][i], tickDatas[1][i]);
                for (let j = 0; j < 3; j += 1) {
                    rewarderAmount[j] = rewarderAmount[j].add(posRewarderInfo[j].amount_owed);
                }
            }
            return rewarderAmount;
        });
    }
    posRewardersAmountInternal(pool, position, tickLower, tickUpper) {
        const tickLowerIndex = position.tick_lower_index;
        const tickUpperIndex = position.tick_upper_index;
        const rewardersInside = (0, tick_1.getRewardInTickRange)(pool, tickLower, tickUpper, tickLowerIndex, tickUpperIndex, this.growthGlobal);
        const growthInside = [];
        const AmountOwed = [];
        if (rewardersInside.length > 0) {
            let growthDelta_0 = utils_1.MathUtil.subUnderflowU128(rewardersInside[0], new bn_js_1.default(position.reward_growth_inside_0));
            if (growthDelta_0.gt(new bn_js_1.default('3402823669209384634633745948738404'))) {
                growthDelta_0 = utils_1.ONE;
            }
            const amountOwed_0 = utils_1.MathUtil.checkMulShiftRight(new bn_js_1.default(position.liquidity), growthDelta_0, 64, 128);
            growthInside.push(rewardersInside[0]);
            AmountOwed.push({
                amount_owed: new bn_js_1.default(position.reward_amount_owed_0).add(amountOwed_0),
                coin_address: pool.rewarder_infos[0].coinAddress,
            });
        }
        if (rewardersInside.length > 1) {
            let growthDelta_1 = utils_1.MathUtil.subUnderflowU128(rewardersInside[1], new bn_js_1.default(position.reward_growth_inside_1));
            if (growthDelta_1.gt(new bn_js_1.default('3402823669209384634633745948738404'))) {
                growthDelta_1 = utils_1.ONE;
            }
            const amountOwed_1 = utils_1.MathUtil.checkMulShiftRight(new bn_js_1.default(position.liquidity), growthDelta_1, 64, 128);
            growthInside.push(rewardersInside[1]);
            AmountOwed.push({
                amount_owed: new bn_js_1.default(position.reward_amount_owed_1).add(amountOwed_1),
                coin_address: pool.rewarder_infos[1].coinAddress,
            });
        }
        if (rewardersInside.length > 2) {
            let growthDelta_2 = utils_1.MathUtil.subUnderflowU128(rewardersInside[2], new bn_js_1.default(position.reward_growth_inside_2));
            if (growthDelta_2.gt(new bn_js_1.default('3402823669209384634633745948738404'))) {
                growthDelta_2 = utils_1.ONE;
            }
            const amountOwed_2 = utils_1.MathUtil.checkMulShiftRight(new bn_js_1.default(position.liquidity), growthDelta_2, 64, 128);
            growthInside.push(rewardersInside[2]);
            AmountOwed.push({
                amount_owed: new bn_js_1.default(position.reward_amount_owed_2).add(amountOwed_2),
                coin_address: pool.rewarder_infos[2].coinAddress,
            });
        }
        return AmountOwed;
    }
    getPoolLowerAndUpperTicks(ticksHandle, positions) {
        return __awaiter(this, void 0, void 0, function* () {
            const lowerTicks = [];
            const upperTicks = [];
            for (const pos of positions) {
                const tickLower = yield this.sdk.Pool.getTickDataByIndex(ticksHandle, pos.tick_lower_index);
                const tickUpper = yield this.sdk.Pool.getTickDataByIndex(ticksHandle, pos.tick_upper_index);
                lowerTicks.push(tickLower);
                upperTicks.push(tickUpper);
            }
            return [lowerTicks, upperTicks];
        });
    }
    /**
     * Collect rewards from Position.
     * @param params
     * @param gasBudget
     * @returns
     */
    collectRewarderTransactionPayload(params) {
        const { clmm } = this.sdk.sdkOptions;
        const typeArguments = [params.coinTypeA, params.coinTypeB];
        const tx = new sui_js_1.TransactionBlock();
        tx.setGasBudget(this._sdk.gasConfig.GasBudgetLow);
        if (params.collect_fee) {
            tx.moveCall({
                target: `${clmm.clmm_router.cetus}::${sui_1.ClmmIntegratePoolModule}::collect_fee`,
                typeArguments,
                arguments: [tx.object(clmm.config.global_config_id), tx.object(params.pool_id), tx.object(params.pos_id)],
            });
        }
        params.rewarder_coin_types.forEach((type) => {
            tx.moveCall({
                target: `${clmm.clmm_router.cetus}::${sui_1.ClmmIntegratePoolModule}::collect_reward`,
                typeArguments: [...typeArguments, type],
                arguments: [
                    tx.object(clmm.config.global_config_id),
                    tx.object(params.pool_id),
                    tx.object(params.pos_id),
                    tx.object(clmm.config.global_vault_id),
                    tx.object(sui_1.CLOCK_ADDRESS),
                ],
            });
        });
        return tx;
    }
}
exports.RewarderModule = RewarderModule;
