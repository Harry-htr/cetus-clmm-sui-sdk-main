"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
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
exports.LauncpadUtil = void 0;
/* eslint-disable camelcase */
const sui_js_1 = require("@mysten/sui.js");
const bn_js_1 = __importStar(require("bn.js"));
const luanchpa_type_1 = require("../types/luanchpa_type");
const contracts_1 = require("./contracts");
const numbers_1 = require("./numbers");
class LauncpadUtil {
    static priceRealToFix(price, saleDecimals, raiseDecimals) {
        const subDecimals = (0, numbers_1.d)(saleDecimals - raiseDecimals).toNumber();
        return Number((0, numbers_1.d)(price)
            .div((0, numbers_1.d)(10).pow((0, numbers_1.d)(subDecimals)))
            .toString());
    }
    static priceFixToReal(price, saleDecimals, raiseDecimals) {
        const subDecimals = (0, numbers_1.d)(saleDecimals - raiseDecimals).toNumber();
        return Number((0, numbers_1.d)(price)
            .mul((0, numbers_1.d)(10).pow((0, numbers_1.d)(subDecimals)))
            .toString());
    }
    static raiseTotalAmount(pool, saleDecimals, raiseDecimals) {
        const subDecimals = (0, numbers_1.d)(saleDecimals - raiseDecimals)
            .abs()
            .toNumber();
        if (saleDecimals > raiseDecimals) {
            return Number((0, numbers_1.d)(pool.sale_total)
                .mul(pool.current_price)
                .div((0, numbers_1.d)(10).pow((0, numbers_1.d)(subDecimals)))
                .toString());
        }
        return Number((0, numbers_1.d)(pool.sale_total)
            .mul(pool.current_price)
            .mul((0, numbers_1.d)(10).pow((0, numbers_1.d)(subDecimals)))
            .toString());
    }
    static buildLaunchPadPool(objects) {
        const type = (0, sui_js_1.getMoveObjectType)(objects);
        const formatType = (0, contracts_1.extractStructTagFromType)(type);
        const fields = (0, sui_js_1.getObjectFields)(objects);
        // console.log('fields: ', fields)
        const pool = {
            coin_type_sale: formatType.type_arguments[0],
            coin_type_raise: formatType.type_arguments[1],
            pool_address: (0, sui_js_1.normalizeSuiObjectId)((0, sui_js_1.getObjectId)(objects)),
            pool_type: (0, contracts_1.composeType)(formatType.full_address, formatType.type_arguments),
            is_settle: fields.is_settle,
            current_price: (0, numbers_1.d)(fields.initialize_price).div((0, numbers_1.d)(luanchpa_type_1.CONST_DENOMINATOR)).toString(),
            min_price: '0',
            max_price: '0',
            sale_coin_amount: fields.sale_coin,
            raise_coin_amount: fields.raise_coin,
            reality_raise_total: fields.reality_raise_total,
            sale_total: fields.sale_total,
            min_purchase: fields.min_purchase,
            max_purchase: fields.max_purchase,
            least_raise_amount: fields.least_raise_amount,
            softcap: fields.softcap,
            hardcap: fields.hardcap,
            liquidity_rate: Number(fields.liquidity_rate) / 10000,
            activity_start_time: Number(fields.duration_manager.fields.start_time),
            activity_end_time: 0,
            settle_end_time: 0,
            activity_duration: Number(fields.duration_manager.fields.activity_duration),
            settle_duration: Number(fields.duration_manager.fields.settle_duration),
            locked_duration: Number(fields.duration_manager.fields.locked_duration),
            is_cancel: fields.is_cancel,
            white_summary: {
                white_handle: fields.white_list.fields.users.fields.id.id,
                white_hard_cap_total: fields.white_list.fields.hard_cap_total,
                white_purchase_total: fields.white_list.fields.purchase_total,
                size: Number(fields.white_list.fields.users.fields.size),
            },
            unused_sale: fields.unused_sale,
            harvest_raise: fields.harvest_raise,
            tick_spacing: Number(fields.tick_spacing),
            recipient: fields.recipient,
            purchase_summary: {
                purchase_handle: fields.purchase_list.fields.id.id,
                size: Number(fields.purchase_list.fields.size),
            },
            pool_status: luanchpa_type_1.LaunchpadPoolActivityState.Failed,
        };
        LauncpadUtil.updatePoolStatus(pool);
        return pool;
    }
    static updatePoolStatus(pool) {
        const now = Number((0, numbers_1.d)(Date.now() / 1000).toFixed(0));
        const end_activity_time = pool.activity_start_time + pool.activity_duration;
        const end_settle_time = end_activity_time + pool.settle_duration;
        pool.activity_end_time = end_activity_time;
        pool.settle_end_time = end_settle_time;
        if (pool.is_settle) {
            pool.pool_status = luanchpa_type_1.LaunchpadPoolActivityState.Ended;
        }
        else if (pool.is_cancel) {
            pool.pool_status = luanchpa_type_1.LaunchpadPoolActivityState.Canceled;
        }
        else if (now < pool.activity_start_time) {
            pool.pool_status = luanchpa_type_1.LaunchpadPoolActivityState.Upcoming;
        }
        else if (now > pool.activity_start_time && now < end_activity_time) {
            pool.pool_status = luanchpa_type_1.LaunchpadPoolActivityState.Live;
        }
        else if (now > end_activity_time && now < end_settle_time) {
            const raise_value = pool.raise_coin_amount;
            if (Number(raise_value) < Number(pool.least_raise_amount)) {
                pool.pool_status = luanchpa_type_1.LaunchpadPoolActivityState.Failed;
            }
            else {
                pool.pool_status = luanchpa_type_1.LaunchpadPoolActivityState.Settle;
            }
        }
        return pool;
    }
    /**
     * update Pool Current Price
     * @param pool
     * @param saleDecimals
     * @param raiseDecimals
     * @returns
     */
    static updatePoolCurrentPrice(pool, saleDecimals, raiseDecimals) {
        // const raise_value = BigInt(pool.reality_raise_total)
        // if (raise_value < BigInt(pool.softcap)) {
        //   pool.current_price = pool.min_price
        // } else if (raise_value <= BigInt(pool.hardcap)) {
        //   pool.current_price = this.priceFixToReal(
        //     d(raise_value.toString()).div(d(pool.sale_total)).toNumber(),
        //     saleDecimals,
        //     raiseDecimals
        //   ).toString()
        // } else if (raise_value > BigInt(pool.hardcap)) {
        //   pool.current_price = pool.max_price
        // }
        pool.current_price = this.priceFixToReal(Number(pool.current_price), saleDecimals, raiseDecimals).toString();
        return Number(pool.current_price);
    }
    /**
     * calculate Pool Price
     * @param sdk
     * @param pool
     */
    static calculatePoolPrice(sdk, pool) {
        return __awaiter(this, void 0, void 0, function* () {
            const coinInfos = yield sdk.Token.getTokenListByCoinTypes([pool.coin_type_sale, pool.coin_type_raise]);
            const saleDecimals = coinInfos[pool.coin_type_sale].decimals;
            const raiseDecimals = coinInfos[pool.coin_type_raise].decimals;
            pool.min_price = this.priceFixToReal(Number((0, numbers_1.d)(pool.softcap).div((0, numbers_1.d)(pool.sale_total))), saleDecimals, raiseDecimals).toString();
            pool.max_price = this.priceFixToReal(Number((0, numbers_1.d)(pool.hardcap).div((0, numbers_1.d)(pool.sale_total))), saleDecimals, raiseDecimals).toString();
            LauncpadUtil.updatePoolCurrentPrice(pool, saleDecimals, raiseDecimals);
        });
    }
    /**
     * https://git.cplus.link/cetus/cetus-launchpad/-/blob/whitelist/sui/IDO/sources/pool.move#L887
     * withdraw_sale_internal
     * @param pool
     * @returns
     */
    static getWithdrawRaise(pool) {
        return __awaiter(this, void 0, void 0, function* () {
            if (pool.pool_status === luanchpa_type_1.LaunchpadPoolActivityState.Ended) {
                return pool.harvest_raise;
            }
            return '0';
        });
    }
    /**
     * https://git.cplus.link/cetus/cetus-launchpad/-/blob/whitelist/sui/IDO/sources/pool.move#L906
     * withdraw_raise_internal
     * @param pool
     * @returns
     */
    static getWithdrawSale(pool) {
        return __awaiter(this, void 0, void 0, function* () {
            if (pool.pool_status === luanchpa_type_1.LaunchpadPoolActivityState.Ended) {
                return pool.unused_sale;
            }
            return pool.sale_coin_amount;
        });
    }
    /**
     * https://m8bj5905cd.larksuite.com/docx/V5AKdlbm3o3muFxh2dwu5C9RsTb
     * $$raiseAmount=min(totalRaised，hardcap)$$
     * @param sdk
     * @param pool
     * @returns
     */
    static getHistoryWithdrawRaise(sdk, pool) {
        return __awaiter(this, void 0, void 0, function* () {
            if (pool.pool_status === luanchpa_type_1.LaunchpadPoolActivityState.Ended) {
                if ((0, numbers_1.d)(pool.harvest_raise).equals((0, numbers_1.d)(0))) {
                    const settleEvent = yield sdk.Launchpad.getSettleEvent(pool.pool_address);
                    if (settleEvent) {
                        pool.harvest_raise = settleEvent.unused_raise;
                    }
                }
                const minAmount = (0, bn_js_1.min)(new bn_js_1.default(pool.reality_raise_total), new bn_js_1.default(pool.hardcap));
                return (0, numbers_1.d)(minAmount.toString()).mul(1 - pool.liquidity_rate);
            }
            return '0';
        });
    }
    static getHistoryWithdrawSale(sdk, pool) {
        return __awaiter(this, void 0, void 0, function* () {
            if (pool.pool_status === luanchpa_type_1.LaunchpadPoolActivityState.Ended) {
                const settleEvent = yield sdk.Launchpad.getSettleEvent(pool.pool_address);
                if (settleEvent) {
                    pool.unused_sale = settleEvent.unused_sale;
                }
                return pool.unused_sale;
            }
            return '0';
        });
    }
    /**
     * https://m8bj5905cd.larksuite.com/docx/V5AKdlbm3o3muFxh2dwu5C9RsTb
     * Returning the user's assets in excess
     * @param sdk
     * @param pool
     * @returns
     */
    static getOverrecruitReverseAmount(sdk, pool) {
        return __awaiter(this, void 0, void 0, function* () {
            const purchaseMarks = yield sdk.Launchpad.getPurchaseMarks(sdk.senderAddress, [pool.pool_address], false);
            if (purchaseMarks.length > 0) {
                const userStakeAmount = purchaseMarks[0].purchase_total;
                const userProtectAmount = (yield sdk.Launchpad.getPurchaseAmount(pool.white_summary.white_handle, sdk.senderAddress))
                    .safe_purchased_amount;
                const { white_purchase_total } = pool.white_summary;
                return (0, numbers_1.d)(userStakeAmount)
                    .sub(userProtectAmount)
                    .div((0, numbers_1.d)(pool.reality_raise_total).sub(white_purchase_total))
                    .mul((0, numbers_1.d)(pool.reality_raise_total).sub(pool.hardcap))
                    .toString();
            }
            return '0';
        });
    }
    /**
     * https://m8bj5905cd.larksuite.com/docx/V5AKdlbm3o3muFxh2dwu5C9RsTb
     * @param sdk
     * @param pool
     * @returns
     */
    static getCanPurchaseAmount(sdk, pool) {
        return __awaiter(this, void 0, void 0, function* () {
            const overrecruitReverseAmount = yield LauncpadUtil.getOverrecruitReverseAmount(sdk, pool);
            const purchaseMarks = yield sdk.Launchpad.getPurchaseMarks(sdk.senderAddress, [pool.pool_address], false);
            if (purchaseMarks) {
                const userStakeAmount = purchaseMarks[0].purchase_total;
                (0, numbers_1.d)(userStakeAmount).sub(overrecruitReverseAmount).div(pool.current_price);
            }
            return '0';
        });
    }
}
exports.LauncpadUtil = LauncpadUtil;
