"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BoosterUtil = void 0;
/* eslint-disable camelcase */
const sui_js_1 = require("@mysten/sui.js");
const contracts_1 = require("./contracts");
const booster_type_1 = require("../types/booster_type");
const numbers_1 = require("./numbers");
const common_1 = require("./common");
class BoosterUtil {
    static buildPoolImmutables(data) {
        const { fields } = data.value.fields.value;
        const pool = {
            clmm_pool_id: (0, contracts_1.extractStructTagFromType)(fields.clmm_pool_id).address,
            booster_type: (0, contracts_1.extractStructTagFromType)(fields.booster_type.fields.name).source_address,
            pool_id: (0, contracts_1.extractStructTagFromType)(fields.pool_id).address,
            coinTypeA: (0, contracts_1.extractStructTagFromType)(fields.coin_type_a.fields.name).source_address,
            coinTypeB: (0, contracts_1.extractStructTagFromType)(fields.coin_type_b.fields.name).source_address,
        };
        return pool;
    }
    static buildPoolState(data) {
        const fields = (0, sui_js_1.getObjectFields)(data);
        const lockMultipliers = [];
        fields.config.fields.contents.forEach((item) => {
            lockMultipliers.push({
                lock_day: Number(item.fields.key),
                multiplier: Number((0, numbers_1.d)(item.fields.value).div(booster_type_1.CONFIG_PERCENT_MULTIPER)),
            });
        });
        const pool = {
            basic_percent: Number((0, numbers_1.d)(fields.basic_percent).div(booster_type_1.CONFIG_PERCENT_MULTIPER)),
            balance: fields.balance,
            config: lockMultipliers,
            lock_positions: {
                lock_positions_handle: fields.lock_positions.fields.id.id,
                size: fields.lock_positions.fields.size,
            },
            is_open: fields.is_open,
            index: Number(fields.index),
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
    static isLocked(lock) {
        return lock.end_lock_time > Date.parse(new Date().toString()) / 1000;
    }
}
exports.BoosterUtil = BoosterUtil;
