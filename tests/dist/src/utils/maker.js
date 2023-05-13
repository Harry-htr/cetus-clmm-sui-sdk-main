"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MakerUtil = void 0;
/* eslint-disable camelcase */
const sui_js_1 = require("@mysten/sui.js");
const contracts_1 = require("./contracts");
const booster_type_1 = require("../types/booster_type");
const numbers_1 = require("./numbers");
const common_1 = require("./common");
class MakerUtil {
    static buildPoolImmutables(data) {
        const { fields } = data.value.fields.value;
        const pool = {
            clmm_pool_id: (0, contracts_1.extractStructTagFromType)(fields.clmm_pool_id).address,
            bonus_type: (0, contracts_1.extractStructTagFromType)(fields.bonus_type.fields.name).source_address,
            pool_id: (0, contracts_1.extractStructTagFromType)(fields.pool_id).address,
            coinTypeA: (0, contracts_1.extractStructTagFromType)(fields.coin_type_a.fields.name).source_address,
            coinTypeB: (0, contracts_1.extractStructTagFromType)(fields.coin_type_b.fields.name).source_address,
        };
        return pool;
    }
    static buildPoolState(data) {
        const fields = (0, sui_js_1.getObjectFields)(data);
        const rewarderMultipliers = [];
        fields.config.fields.contents.forEach((item) => {
            rewarderMultipliers.push({
                rate: Number((0, numbers_1.d)(item.fields.key).div(booster_type_1.CONFIG_PERCENT_MULTIPER)),
                multiplier: Number((0, numbers_1.d)(item.fields.value).div(booster_type_1.CONFIG_PERCENT_MULTIPER)),
            });
        });
        const pool = {
            balance: fields.balance,
            config: rewarderMultipliers,
            is_open: fields.is_open,
            index: Number(fields.index),
            start_time: Number(fields.start_time),
            interval_day: Number(fields.interval_day),
            minimum_percent_to_reward: Number((0, numbers_1.d)(fields.minimum_percent_to_reward).div(booster_type_1.CONFIG_PERCENT_MULTIPER)),
            rewarders: {
                rewarder_handle: fields.rewarders.fields.id.id,
                size: Number(fields.rewarders.fields.size),
            },
            whale_nfts: {
                whale_nfts_handle: fields.whale_nfts.fields.id.id,
                size: Number(fields.whale_nfts.fields.size),
            },
            points: {
                point_handle: fields.points.fields.id.id,
                size: Number(fields.points.fields.size),
            },
        };
        return pool;
    }
    static buildLockNFT(data) {
        const locked_nft_id = (0, contracts_1.extractStructTagFromType)((0, sui_js_1.getObjectId)(data)).address;
        const fields = (0, sui_js_1.getObjectFields)(data);
        if (fields) {
            const lock_clmm_position = (0, common_1.buildPosition)(data);
            const lockNFT = {
                lock_clmm_position,
                locked_nft_id,
                locked_time: Number(fields.locked_time),
                end_lock_time: Number(fields.end_lock_time),
            };
            return lockNFT;
        }
        return undefined;
    }
    static buildLockPositionInfo(data) {
        const id = (0, contracts_1.extractStructTagFromType)((0, sui_js_1.getObjectId)(data)).address;
        const fields = (0, sui_js_1.getObjectFields)(data);
        if (fields) {
            const { value } = fields.value.fields;
            const lockNFT = {
                id,
                type: value.type,
                position_id: value.fields.position_id,
                start_time: Number(value.fields.start_time),
                lock_period: Number(value.fields.lock_period),
                end_time: Number(value.fields.end_time),
                growth_rewarder: value.fields.growth_rewarder,
                xcetus_owned: value.fields.xcetus_owned,
                is_settled: value.fields.is_settled,
            };
            return lockNFT;
        }
        return undefined;
    }
    static buildMarkerPositions(data) {
        const { contents } = data.value.fields.value.fields;
        const mList = [];
        const period_id = data.id.id;
        contents.forEach((item) => {
            const { key, value } = item.fields;
            const info = {
                id: key,
                period_id,
                bonus_num: value.fields.bonus_num,
                point: value.fields.point,
                is_burn: value.fields.is_burn,
                point_after_multiplier: value.fields.point_after_multiplier,
                percent: Number((0, numbers_1.d)(value.fields.percent).div(booster_type_1.CONFIG_PERCENT_MULTIPER)),
                fee_share_rate: 0,
                is_redeemed: value.fields.is_redeemed,
            };
            mList.push(info);
        });
        return mList;
    }
    static buildPoolBonusInfo(data) {
        const { fields, type } = data.value.fields.value;
        const bonusInfo = {
            type,
            time: Number(fields.time),
            settle_time: Number(fields.settle_time),
            settled_num: fields.settled_num,
            is_settled: fields.is_settled,
            basis_bonus: fields.basis_bonus,
            total_bonus: fields.total_bonus,
            is_vacant: fields.is_vacant,
            redeemed_num: fields.redeemed_num,
        };
        return bonusInfo;
    }
    static getBonusPercent(configs, percent) {
        let level_now = 0;
        for (const config of configs) {
            if (percent >= config.rate && config.rate > level_now) {
                level_now = config.multiplier;
            }
        }
        return level_now;
    }
}
exports.MakerUtil = MakerUtil;
