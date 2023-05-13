"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.XWhaleUtil = void 0;
const decimal_js_1 = __importDefault(require("decimal.js"));
const xwhale_type_1 = require("../types/xwhale_type");
const contracts_1 = require("./contracts");
const numbers_1 = require("./numbers");
class XWhaleUtil {
    static buildVeNFTDividendInfo(fields) {
        const veNFTDividendInfo = {
            id: fields.id.id,
            ve_nft_id: fields.name,
            rewards: [],
        };
        fields.value.fields.value.fields.dividends.fields.contents.forEach((item) => {
            const periodRewards = [];
            item.fields.value.fields.contents.forEach((reward) => {
                periodRewards.push({
                    coin_type: (0, contracts_1.extractStructTagFromType)(reward.fields.key.fields.name).source_address,
                    amount: reward.fields.value,
                });
            });
            veNFTDividendInfo.rewards.push({
                period: Number(item.fields.key),
                rewards: periodRewards,
            });
        });
        return veNFTDividendInfo;
    }
    static buildDividendManager(fields) {
        const dividendManager = {
            id: fields.id.id,
            dividends: {
                id: fields.dividends.fields.id.id,
                size: fields.dividends.fields.size,
            },
            venft_dividends: {
                id: fields.venft_dividends.fields.id.id,
                size: fields.venft_dividends.fields.size,
            },
            bonus_types: [],
            start_time: Number(fields.start_time),
            interval_day: Number(fields.interval_day),
            settled_phase: Number(fields.settled_phase),
            balances: {
                id: fields.balances.fields.id.id,
                size: fields.balances.fields.size,
            },
            is_open: true,
        };
        fields.bonus_types.forEach((item) => {
            dividendManager.bonus_types.push((0, contracts_1.extractStructTagFromType)(item.fields.name).source_address);
        });
        return dividendManager;
    }
    static buildLockWhale(data) {
        const fields = data.fields;
        const lockWhale = {
            id: fields.id.id,
            type: (0, contracts_1.extractStructTagFromType)(data.type).source_address,
            locked_start_time: Number(fields.locked_start_time),
            locked_until_time: Number(fields.locked_until_time),
            whale_amount: fields.balance,
            xwhale_amount: '0',
            lock_day: 0,
        };
        lockWhale.lock_day = (lockWhale.locked_until_time - lockWhale.locked_start_time) / xwhale_type_1.ONE_DAY_SECONDS;
        return lockWhale;
    }
    static getAvailableXWhale(veNTF, locks) {
        let lockAmount = (0, numbers_1.d)(0);
        locks.forEach((lock) => {
            lockAmount = lockAmount.add(lock.xwhale_amount);
        });
        return (0, numbers_1.d)(veNTF.xwhale_balance).sub(lockAmount).toString();
    }
    static getWaitUnLockWhales(locks) {
        return locks.filter((lock) => {
            return !XWhaleUtil.isLocked(lock);
        });
    }
    static getLockingWhales(locks) {
        return locks.filter((lock) => {
            return XWhaleUtil.isLocked(lock);
        });
    }
    static isLocked(lock) {
        return lock.locked_until_time > Date.parse(new Date().toString()) / 1000;
    }
    static getNextStartTime(dividendManager) {
        const currentTime = Date.parse(new Date().toString()) / 1000;
        const currentPeriod = (0, numbers_1.d)(currentTime)
            .sub(dividendManager.start_time)
            .mul((0, numbers_1.d)(dividendManager.interval_day).div(xwhale_type_1.ONE_DAY_SECONDS))
            .toFixed(0, decimal_js_1.default.ROUND_UP);
        const nextStartTime = (0, numbers_1.d)(dividendManager.start_time).add((0, numbers_1.d)(currentPeriod).add(1).mul(xwhale_type_1.ONE_DAY_SECONDS));
        return nextStartTime;
    }
}
exports.XWhaleUtil = XWhaleUtil;
