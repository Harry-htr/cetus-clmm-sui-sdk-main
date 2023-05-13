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
exports.multiGetObjects = exports.getOwnedObjects = exports.loopToGetAllQueryEvents = exports.buildTickDataByEvent = exports.buildTickData = exports.buildNFT = exports.buildPositionReward = exports.buildPosition = exports.buildPool = exports.secretKeyToSecp256k1Keypair = exports.secretKeyToEd25519Keypair = exports.fromDecimalsAmount = exports.asIntN = exports.asUintN = exports.toDecimalsAmount = void 0;
/* eslint-disable @typescript-eslint/no-use-before-define */
/* eslint-disable camelcase */
const sui_js_1 = require("@mysten/sui.js");
const bn_js_1 = __importDefault(require("bn.js"));
const bcs_1 = require("@mysten/bcs");
const math_1 = require("../math");
const resourcesModule_1 = require("../modules/resourcesModule");
const contracts_1 = require("./contracts");
const numbers_1 = require("./numbers");
function toDecimalsAmount(amount, decimals) {
    const mul = (0, numbers_1.decimalsMultiplier)((0, numbers_1.d)(decimals));
    return Number((0, numbers_1.d)(amount).mul(mul));
}
exports.toDecimalsAmount = toDecimalsAmount;
function asUintN(int, bits = 32) {
    return BigInt.asUintN(bits, BigInt(int)).toString();
}
exports.asUintN = asUintN;
function asIntN(int, bits = 32) {
    return Number(BigInt.asIntN(bits, BigInt(int)));
}
exports.asIntN = asIntN;
function fromDecimalsAmount(amount, decimals) {
    const mul = (0, numbers_1.decimalsMultiplier)((0, numbers_1.d)(decimals));
    return Number((0, numbers_1.d)(amount).div(mul));
}
exports.fromDecimalsAmount = fromDecimalsAmount;
function secretKeyToEd25519Keypair(secretKey, ecode = 'hex') {
    if (secretKey instanceof Uint8Array) {
        const key = Buffer.from(secretKey);
        return sui_js_1.Ed25519Keypair.fromSecretKey(key);
    }
    const hexKey = ecode === 'hex' ? (0, bcs_1.fromHEX)(secretKey) : (0, bcs_1.fromB64)(secretKey);
    return sui_js_1.Ed25519Keypair.fromSecretKey(hexKey);
}
exports.secretKeyToEd25519Keypair = secretKeyToEd25519Keypair;
function secretKeyToSecp256k1Keypair(secretKey, ecode = 'hex') {
    if (secretKey instanceof Uint8Array) {
        const key = Buffer.from(secretKey);
        return sui_js_1.Secp256k1Keypair.fromSecretKey(key);
    }
    const hexKey = ecode === 'hex' ? (0, bcs_1.fromHEX)(secretKey) : (0, bcs_1.fromB64)(secretKey);
    return sui_js_1.Secp256k1Keypair.fromSecretKey(hexKey);
}
exports.secretKeyToSecp256k1Keypair = secretKeyToSecp256k1Keypair;
function buildPoolName(coin_type_a, coin_type_b, tick_spacing) {
    const coinNameA = (0, contracts_1.extractStructTagFromType)(coin_type_a).name;
    const coinNameB = (0, contracts_1.extractStructTagFromType)(coin_type_b).name;
    return `${coinNameA}-${coinNameB}[${tick_spacing}]`;
}
function buildPool(objects) {
    const type = (0, sui_js_1.getMoveObjectType)(objects);
    const formatType = (0, contracts_1.extractStructTagFromType)(type);
    const fields = (0, sui_js_1.getObjectFields)(objects);
    // console.log('fields: ', fields, type)
    const rewarders = [];
    fields.rewarder_manager.fields.rewarders.forEach((item) => {
        const { emissions_per_second } = item.fields;
        const emissionSeconds = math_1.MathUtil.fromX64(new bn_js_1.default(emissions_per_second));
        const emissionsEveryDay = Math.floor(emissionSeconds.toNumber() * 60 * 60 * 24);
        rewarders.push({
            emissions_per_second,
            coinAddress: (0, contracts_1.extractStructTagFromType)(item.fields.reward_coin.fields.name).source_address,
            growth_global: item.fields.growth_global,
            emissionsEveryDay,
        });
    });
    const pool = {
        poolAddress: (0, sui_js_1.getObjectId)(objects),
        poolType: type,
        coinTypeA: formatType.type_arguments[0],
        coinTypeB: formatType.type_arguments[1],
        coinAmountA: fields.coin_a,
        coinAmountB: fields.coin_b,
        current_sqrt_price: fields.current_sqrt_price,
        current_tick_index: asIntN(BigInt(fields.current_tick_index.fields.bits)),
        fee_growth_global_a: fields.fee_growth_global_a,
        fee_growth_global_b: fields.fee_growth_global_b,
        fee_protocol_coin_a: fields.fee_protocol_coin_a,
        fee_protocol_coin_b: fields.fee_protocol_coin_b,
        fee_rate: fields.fee_rate,
        is_pause: fields.is_pause,
        liquidity: fields.liquidity,
        positions_handle: fields.position_manager.fields.positions.fields.id.id,
        rewarder_infos: rewarders,
        rewarder_last_updated_time: fields.rewarder_manager.fields.last_updated_time,
        tickSpacing: fields.tick_spacing,
        ticks_handle: fields.tick_manager.fields.ticks.fields.id.id,
        uri: fields.url,
        index: Number(fields.index),
        name: '',
    };
    pool.name = buildPoolName(pool.coinTypeA, pool.coinTypeB, pool.tickSpacing);
    return pool;
}
exports.buildPool = buildPool;
function buildPosition(objects) {
    let nft = {
        creator: '',
        description: '',
        image_url: '',
        link: '',
        name: '',
        project_url: '',
    };
    let position = Object.assign(Object.assign({}, nft), { pos_object_id: '', owner: '', type: '', coin_type_a: '', coin_type_b: '', liquidity: '', tick_lower_index: 0, tick_upper_index: 0, index: 0, pool: '', reward_amount_owed_0: '0', reward_amount_owed_1: '0', reward_amount_owed_2: '0', reward_growth_inside_0: '0', reward_growth_inside_1: '0', reward_growth_inside_2: '0', fee_growth_inside_a: '0', fee_owed_a: '0', fee_growth_inside_b: '0', fee_owed_b: '0', position_status: resourcesModule_1.PositionStatus.Exists });
    let fields = (0, sui_js_1.getObjectFields)(objects);
    if (fields) {
        const type = (0, sui_js_1.getMoveObjectType)(objects);
        const ownerWarp = (0, sui_js_1.getObjectOwner)(objects);
        if ('nft' in fields) {
            fields = fields.nft.fields;
            nft.description = fields.description;
            nft.name = fields.name;
            nft.link = fields.url;
        }
        else {
            nft = buildNFT(objects);
        }
        position = Object.assign(Object.assign({}, nft), { pos_object_id: fields.id.id, owner: ownerWarp.AddressOwner, type, coin_type_a: fields.coin_type_a.fields.name, coin_type_b: fields.coin_type_b.fields.name, liquidity: fields.liquidity, tick_lower_index: asIntN(BigInt(fields.tick_lower_index.fields.bits)), tick_upper_index: asIntN(BigInt(fields.tick_upper_index.fields.bits)), index: fields.index, pool: fields.pool, reward_amount_owed_0: '0', reward_amount_owed_1: '0', reward_amount_owed_2: '0', reward_growth_inside_0: '0', reward_growth_inside_1: '0', reward_growth_inside_2: '0', fee_growth_inside_a: '0', fee_owed_a: '0', fee_growth_inside_b: '0', fee_owed_b: '0', position_status: resourcesModule_1.PositionStatus.Exists });
    }
    const deletedResponse = (0, sui_js_1.getObjectDeletedResponse)(objects);
    if (deletedResponse) {
        position.pos_object_id = deletedResponse.objectId;
        position.position_status = resourcesModule_1.PositionStatus.Deleted;
    }
    const objectNotExistsResponse = (0, sui_js_1.getObjectNotExistsResponse)(objects);
    if (objectNotExistsResponse) {
        position.pos_object_id = objectNotExistsResponse;
        position.position_status = resourcesModule_1.PositionStatus.NotExists;
    }
    return position;
}
exports.buildPosition = buildPosition;
function buildPositionReward(fields) {
    const rewarders = {
        reward_amount_owed_0: '0',
        reward_amount_owed_1: '0',
        reward_amount_owed_2: '0',
        reward_growth_inside_0: '0',
        reward_growth_inside_1: '0',
        reward_growth_inside_2: '0',
    };
    fields.rewards.forEach((item, index) => {
        const { amount_owned, growth_inside } = 'fields' in item ? item.fields : item;
        if (index === 0) {
            rewarders.reward_amount_owed_0 = amount_owned;
            rewarders.reward_growth_inside_0 = growth_inside;
        }
        else if (index === 1) {
            rewarders.reward_amount_owed_1 = amount_owned;
            rewarders.reward_growth_inside_1 = growth_inside;
        }
        else if (index === 2) {
            rewarders.reward_amount_owed_2 = amount_owned;
            rewarders.reward_growth_inside_2 = growth_inside;
        }
    });
    const possition = Object.assign(Object.assign({ liquidity: fields.liquidity, tick_lower_index: asIntN(BigInt(fields.tick_lower_index.fields.bits)), tick_upper_index: asIntN(BigInt(fields.tick_upper_index.fields.bits)) }, rewarders), { fee_growth_inside_a: fields.fee_growth_inside_a, fee_owed_a: fields.fee_owned_a, fee_growth_inside_b: fields.fee_growth_inside_b, fee_owed_b: fields.fee_owned_b, pos_object_id: fields.position_id });
    return possition;
}
exports.buildPositionReward = buildPositionReward;
function buildNFT(objects) {
    const fields = (0, sui_js_1.getObjectDisplay)(objects).data;
    const nft = {
        creator: '',
        description: '',
        image_url: '',
        link: '',
        name: '',
        project_url: '',
    };
    if (fields) {
        nft.creator = fields.creator;
        nft.description = fields.description;
        nft.image_url = fields.image_url;
        nft.link = fields.link;
        nft.name = fields.name;
        nft.project_url = fields.project_url;
    }
    return nft;
}
exports.buildNFT = buildNFT;
function buildTickData(objects) {
    const fields = (0, sui_js_1.getObjectFields)(objects);
    const valueItem = fields.value.fields.value.fields;
    const possition = {
        objectId: (0, sui_js_1.getObjectId)(objects),
        index: asIntN(BigInt(valueItem.index.fields.bits)),
        sqrtPrice: new bn_js_1.default(valueItem.sqrt_price),
        liquidityNet: new bn_js_1.default(valueItem.liquidity_net.fields.bits),
        liquidityGross: new bn_js_1.default(valueItem.liquidity_gross),
        feeGrowthOutsideA: new bn_js_1.default(valueItem.fee_growth_outside_a),
        feeGrowthOutsideB: new bn_js_1.default(valueItem.fee_growth_outside_b),
        rewardersGrowthOutside: valueItem.rewards_growth_outside,
    };
    return possition;
}
exports.buildTickData = buildTickData;
function buildTickDataByEvent(fields) {
    const tick = {
        objectId: '',
        index: asIntN(BigInt(fields.index.bits)),
        sqrtPrice: new bn_js_1.default(fields.sqrt_price),
        liquidityNet: new bn_js_1.default(fields.liquidity_net.bits),
        liquidityGross: new bn_js_1.default(fields.liquidity_gross),
        feeGrowthOutsideA: new bn_js_1.default(fields.fee_growth_outside_a),
        feeGrowthOutsideB: new bn_js_1.default(fields.fee_growth_outside_b),
        rewardersGrowthOutside: fields.rewards_growth_outside,
    };
    return tick;
}
exports.buildTickDataByEvent = buildTickDataByEvent;
function loopToGetAllQueryEvents(sdk, params) {
    return __awaiter(this, void 0, void 0, function* () {
        let result = [];
        let cursor = null;
        while (true) {
            // eslint-disable-next-line no-await-in-loop
            const res = yield sdk.fullClient.queryEvents(Object.assign(Object.assign({}, params), { cursor }));
            if (res.data) {
                result = [...result, ...res.data];
                if (res.hasNextPage) {
                    cursor = res.nextCursor;
                }
                else {
                    break;
                }
            }
            else {
                break;
            }
        }
        return { data: result };
    });
}
exports.loopToGetAllQueryEvents = loopToGetAllQueryEvents;
function getOwnedObjects(sdk, owner, params) {
    return __awaiter(this, void 0, void 0, function* () {
        let result = [];
        let cursor = null;
        while (true) {
            // eslint-disable-next-line no-await-in-loop
            const res = yield sdk.fullClient.getOwnedObjects(Object.assign(Object.assign({ owner }, params), { cursor }));
            if (res.data) {
                result = [...result, ...res.data];
                if (res.hasNextPage) {
                    cursor = res.nextCursor;
                }
                else {
                    break;
                }
            }
            else {
                break;
            }
        }
        return { data: result };
    });
}
exports.getOwnedObjects = getOwnedObjects;
function multiGetObjects(sdk, ids, options, limit = 50) {
    return __awaiter(this, void 0, void 0, function* () {
        let objectDataResponses = [];
        try {
            // eslint-disable-next-line no-plusplus
            for (let i = 0; i < Math.ceil(ids.length / limit); i++) {
                // eslint-disable-next-line no-await-in-loop
                const res = yield sdk.fullClient.multiGetObjects({
                    ids: ids.slice(i * limit, limit * (i + 1)),
                    options,
                });
                objectDataResponses = [...objectDataResponses, ...res];
            }
        }
        catch (error) {
            console.log(error);
        }
        return objectDataResponses;
    });
}
exports.multiGetObjects = multiGetObjects;
