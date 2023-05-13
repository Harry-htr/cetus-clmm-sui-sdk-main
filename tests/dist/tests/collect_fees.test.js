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
const init_test_data_1 = require("./data/init_test_data");
const collect_fees_1 = require("../src/math/collect-fees");
require("isomorphic-fetch");
describe('collect fees', () => {
    const sdk = (0, init_test_data_1.buildSdk)();
    test('collect fees', () => __awaiter(void 0, void 0, void 0, function* () {
        //const poolObjectId = TokensMapping.USDT_USDC_LP.poolObjectId[0]
        const poolObjectId = "0x426e0572eb4aca5b50a4e2667a6f3b8c49fa42d631d6ca8ba7357fe5a85c5748";
        const position_object_id = "0x0138d476edcac45d2606f6d8c4b3c3cf775ceb15e01486e8ffbd7d3c561dd32c";
        const pool = yield (0, init_test_data_1.buildTestPool)(sdk, poolObjectId);
        const position = yield (0, init_test_data_1.buildTestPosition)(sdk, position_object_id);
        if (position === undefined) {
            return;
        }
        const ticksHandle = pool.ticks_handle;
        const tickLowerData = yield sdk.Pool.getTickDataByIndex(ticksHandle, position.tick_lower_index);
        const tickUpperData = yield sdk.Pool.getTickDataByIndex(ticksHandle, position.tick_upper_index);
        const param = {
            clmmpool: pool,
            position: position,
            tickLower: tickLowerData,
            tickUpper: tickUpperData,
        };
        // console.log('param: ', param)
        const fees = (0, collect_fees_1.collectFeesQuote)(param);
        console.log('collect fees: ', {
            feeOwedA: fees.feeOwedA.toNumber(),
            feeOwedB: fees.feeOwedB.toNumber(),
        });
    }));
});
