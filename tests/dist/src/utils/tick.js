"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRewardInTickRange = exports.getNearestTickByTick = exports.TickUtil = void 0;
/* eslint-disable camelcase */
const bn_js_1 = __importDefault(require("bn.js"));
const utils_1 = require("../math/utils");
const constants_1 = require("../types/constants");
class TickUtil {
    /**
     * Get min tick index.
     *
     * @param tick_spacing - tick spacing
     * @retruns min tick index
     */
    static getMinIndex(tickSpacing) {
        return constants_1.MIN_TICK_INDEX + (Math.abs(constants_1.MIN_TICK_INDEX) % tickSpacing);
    }
    /**
     * Get max tick index.
     * @param tick_spacing - tick spacing
     * @retruns max tick index
     */
    // eslint-disable-next-line camelcase
    static getMaxIndex(tickSpacing) {
        return constants_1.MAX_TICK_INDEX - (constants_1.MAX_TICK_INDEX % tickSpacing);
    }
}
exports.TickUtil = TickUtil;
/**
 * Get nearest tick by current tick.
 *
 * @param tickIndex
 * @param tickSpacing
 * @returns
 */
function getNearestTickByTick(tickIndex, tickSpacing) {
    const mod = Math.abs(tickIndex) % tickSpacing;
    if (tickIndex > 0) {
        if (mod > tickSpacing / 2) {
            return tickIndex + tickSpacing - mod;
        }
        return tickIndex - mod;
    }
    if (mod > tickSpacing / 2) {
        return tickIndex - tickSpacing + mod;
    }
    return tickIndex + mod;
}
exports.getNearestTickByTick = getNearestTickByTick;
function getRewardInTickRange(pool, tickLower, tickUpper, tickLowerIndex, tickUpperIndex, growthGlobal) {
    const rewarderInfos = pool.rewarder_infos;
    const rewarderGrowthInside = [];
    for (let i = 0; i < rewarderInfos.length; i += 1) {
        let rewarder_growth_below = growthGlobal[i];
        if (tickLower !== null) {
            if (pool.current_tick_index < tickLowerIndex) {
                rewarder_growth_below = growthGlobal[i].sub(new bn_js_1.default(tickLower.rewardersGrowthOutside[i]));
            }
            else {
                rewarder_growth_below = tickLower.rewardersGrowthOutside[i];
            }
        }
        let rewarder_growth_above = new bn_js_1.default(0);
        if (tickUpper !== null) {
            if (pool.current_tick_index >= tickUpperIndex) {
                rewarder_growth_above = growthGlobal[i].sub(new bn_js_1.default(tickUpper.rewardersGrowthOutside[i]));
            }
            else {
                rewarder_growth_above = tickUpper.rewardersGrowthOutside[i];
            }
        }
        const rewGrowthInside = utils_1.MathUtil.subUnderflowU128(utils_1.MathUtil.subUnderflowU128(new bn_js_1.default(growthGlobal[i]), new bn_js_1.default(rewarder_growth_below)), new bn_js_1.default(rewarder_growth_above));
        rewarderGrowthInside.push(rewGrowthInside);
    }
    return rewarderGrowthInside;
}
exports.getRewardInTickRange = getRewardInTickRange;
