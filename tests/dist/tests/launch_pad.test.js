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
const sui_js_1 = require("@mysten/sui.js");
const luanchpa_type_1 = require("../src/types/luanchpa_type");
const init_test_data_1 = require("./data/init_test_data");
const launchpad_pool_data_1 = require("./data/launchpad_pool_data");
const resourcesModule_1 = require("../src/modules/resourcesModule");
const common_1 = require("../src/utils/common");
require("isomorphic-fetch");
const transaction_util_1 = require("../src/utils/transaction-util");
const launchpad_1 = require("../src/utils/launchpad");
const math_1 = require("../src/math");
const bn_js_1 = __importDefault(require("bn.js"));
let sendKeypair;
let launchPadKeypair;
const poolAddress = '0x07405eabb4ffd80f219e9689eb733e0176f71750ccea84f31a646f6c96272ffe';
describe('launch pad Module', () => {
    const sdk = (0, init_test_data_1.buildSdk)();
    beforeEach(() => __awaiter(void 0, void 0, void 0, function* () {
        sendKeypair = (0, init_test_data_1.buildTestAccount)();
        launchPadKeypair = (0, init_test_data_1.buildTestAccount)();
        sdk.Token.updateCache('getAllRegisteredTokenList', launchpad_pool_data_1.tokenList, resourcesModule_1.cacheTime24h);
    }));
    test('getPoolImmutables', () => __awaiter(void 0, void 0, void 0, function* () {
        const poolImmutables = yield sdk.Launchpad.getPoolImmutables();
        console.log('poolImmutables:', poolImmutables);
    }));
    test('getAllPools', () => __awaiter(void 0, void 0, void 0, function* () {
        const pools = yield sdk.Launchpad.getPools();
        console.log('pools:', pools);
    }));
    test('getJoinPools', () => __awaiter(void 0, void 0, void 0, function* () {
        const pools = yield sdk.Launchpad.getPools();
        const purchaseMarks = yield sdk.Launchpad.getPurchaseMarks(sendKeypair.getPublicKey().toSuiAddress());
        console.log('purchaseMarks ', purchaseMarks);
        const joinPools = [];
        pools.forEach((pool) => {
            for (const purchaseMark of purchaseMarks) {
                if (purchaseMark.pool_id === pool.pool_address) {
                    joinPools.push(pool);
                    break;
                }
            }
        });
        console.log('getJoinPools', joinPools);
    }));
    test('getOwnerPools', () => __awaiter(void 0, void 0, void 0, function* () {
        const ownerAddress = (0, sui_js_1.normalizeSuiAddress)(sendKeypair.getPublicKey().toSuiAddress());
        const pools = yield sdk.Launchpad.getPools();
        const joinPools = [];
        pools.forEach((pool) => {
            if (pool.recipient === ownerAddress) {
                joinPools.push(pool);
            }
        });
        console.log('getJoinPools', joinPools);
    }));
    test('getSignlePools', () => __awaiter(void 0, void 0, void 0, function* () {
        const pool = yield sdk.Launchpad.getPool(poolAddress);
        console.log('pool:', pool);
    }));
    test('create_launchpool', () => __awaiter(void 0, void 0, void 0, function* () {
        var _a;
        const signer = new sui_js_1.RawSigner(launchPadKeypair, sdk.fullClient);
        const pool = launchpad_pool_data_1.creatPoolList[0];
        sdk.senderAddress = yield signer.getAddress();
        const payload = yield sdk.Launchpad.creatPoolTransactionPayload({
            recipient: pool.recipient.length === 0 ? launchPadKeypair.getPublicKey().toSuiAddress() : pool.recipient,
            initialize_price: pool.initialize_price.toString(),
            sale_total: pool.sale_total.toString(),
            min_purchase: pool.min_purchase.toString(),
            max_purchase: pool.max_purchase.toString(),
            least_raise_amount: pool.least_raise_amount.toString(),
            hardcap: pool.hardcap.toString(),
            liquidity_rate: pool.liquidity_rate,
            start_time: pool.start_time,
            activity_duration: pool.activity_duration,
            settle_duration: pool.settle_duration,
            locked_duration: pool.locked_duration,
            sale_decimals: pool.sale_decimals,
            raise_decimals: pool.raise_decimals,
            coin_type_sale: pool.coin_type_sale,
            coin_type_raise: pool.coin_type_raise,
            tick_spacing: pool.tick_spacing,
        });
        (0, transaction_util_1.printTransaction)(payload);
        const transferTxn = yield (0, transaction_util_1.sendTransaction)(signer, payload);
        console.log('create_launchpool: ', transferTxn);
        if (((_a = transferTxn === null || transferTxn === void 0 ? void 0 : transferTxn.status) === null || _a === void 0 ? void 0 : _a.status) === 'success') {
            const poolImmutables = yield sdk.Launchpad.getPoolImmutables();
            console.log('poolImmutables:', poolImmutables);
        }
    }));
    test('purchase', () => __awaiter(void 0, void 0, void 0, function* () {
        const signer = new sui_js_1.RawSigner(sendKeypair, sdk.fullClient);
        const pool = yield sdk.Launchpad.getPool(poolAddress);
        sdk.senderAddress = yield signer.getAddress();
        console.log('pool: ', pool);
        let raise_amount_in = 0.1;
        if (pool.pool_status != luanchpa_type_1.LaunchpadPoolActivityState.Live) {
            throw new Error('The pool is not in live ');
        }
        const raiseCoin = yield sdk.Token.getTokenListByCoinTypes([pool.coin_type_raise]);
        console.log(raiseCoin);
        raise_amount_in = (0, common_1.toDecimalsAmount)(raise_amount_in, raiseCoin[pool.coin_type_raise].decimals);
        const payload = yield sdk.Launchpad.creatPurchasePayload({
            pool_address: pool.pool_address,
            purchase_amount: raise_amount_in.toString(),
            coin_type_sale: pool.coin_type_sale,
            coin_type_raise: pool.coin_type_raise,
        });
        (0, transaction_util_1.printTransaction)(payload);
        const transferTxn = yield (0, transaction_util_1.sendTransaction)(signer, payload);
        console.log('purchase: ', transferTxn);
    }));
    test('claim', () => __awaiter(void 0, void 0, void 0, function* () {
        const signer = new sui_js_1.RawSigner(sendKeypair, sdk.fullClient);
        sdk.senderAddress = yield signer.getAddress();
        const pool = yield sdk.Launchpad.getPool(poolAddress);
        console.log('pool: ', pool);
        if (pool.pool_status == luanchpa_type_1.LaunchpadPoolActivityState.Ended ||
            pool.pool_status == luanchpa_type_1.LaunchpadPoolActivityState.Failed ||
            pool.pool_status == luanchpa_type_1.LaunchpadPoolActivityState.Canceled) {
            const purchaseMark = (yield sdk.Launchpad.getPurchaseMarks(sendKeypair.getPublicKey().toSuiAddress(), [pool.pool_address]))[0];
            console.log('purchaseMark: ', purchaseMark);
            if (Number(purchaseMark.purchase_total) === 0) {
                throw Error('Insufficient balance');
            }
            const payload = yield sdk.Launchpad.creatClaimPayload({
                pool_address: pool.pool_address,
                coin_type_sale: pool.coin_type_sale,
                coin_type_raise: pool.coin_type_raise,
            });
            (0, transaction_util_1.printTransaction)(payload);
            const transferTxn = yield (0, transaction_util_1.sendTransaction)(signer, payload);
            console.log('claim: ', transferTxn);
        }
        else {
            throw new Error('The pool is not in Ended or Cancel ');
        }
    }));
    test('Settle ', () => __awaiter(void 0, void 0, void 0, function* () {
        const signer = new sui_js_1.RawSigner(sendKeypair, sdk.fullClient);
        sdk.senderAddress = yield signer.getAddress();
        const pool = yield sdk.Launchpad.getPool(poolAddress);
        console.log('pool: ', pool);
        if (pool.pool_status != luanchpa_type_1.LaunchpadPoolActivityState.Settle) {
            throw new Error('The pool is not in settle ');
        }
        // find clmm Pool
        let clmmPool = null;
        let isOppositeCoinType = false;
        const clmmImmutables = yield sdk.Resources.getPoolImmutables();
        for (const item of clmmImmutables) {
            if (item.coinTypeA === pool.coin_type_sale &&
                item.coinTypeB === pool.coin_type_raise &&
                Number(item.tickSpacing) === pool.tick_spacing) {
                clmmPool = yield sdk.Resources.getPool(item.poolAddress);
                console.log('clmmPool: ', clmmPool);
                break;
            }
            if (item.coinTypeA === pool.coin_type_raise &&
                item.coinTypeB === pool.coin_type_sale &&
                Number(item.tickSpacing) === pool.tick_spacing) {
                clmmPool = yield sdk.Resources.getPool(item.poolAddress);
                isOppositeCoinType = true;
                console.log('clmmPool: ', clmmPool);
                break;
            }
        }
        const coins = yield sdk.Token.getTokenListByCoinTypes([pool.coin_type_raise, pool.coin_type_sale]);
        const sale_decimals = coins[pool.coin_type_sale].decimals;
        const raise_decimals = coins[pool.coin_type_raise].decimals;
        if (pool.liquidity_rate > 0 && clmmPool === null) {
            throw new Error('not found clmmPool ');
        }
        let payload;
        if (clmmPool) {
            payload = yield sdk.Launchpad.creatSettlePayload({
                pool_address: pool.pool_address,
                coin_type_sale: pool.coin_type_sale,
                coin_type_raise: pool.coin_type_raise,
                clmm_args: {
                    current_price: pool.current_price,
                    clmm_pool_address: clmmPool.poolAddress,
                    clmm_sqrt_price: clmmPool.current_sqrt_price.toString(),
                    opposite: isOppositeCoinType,
                    sale_decimals,
                    raise_decimals,
                }
            });
        }
        else {
            payload = yield sdk.Launchpad.creatSettlePayload({
                pool_address: pool.pool_address,
                coin_type_sale: pool.coin_type_sale,
                coin_type_raise: pool.coin_type_raise,
            });
        }
        // const signer = new RawSigner(sendKeypair, sdk.fullClient)
        // sdk.senderAddress = await signer.getAddress()
        // const pool = await sdk.Launchpad.getPool('0x0cf17df95fe570b195629ee9ad0b5de530558b588575c93099f4b42a4511269e')
        // const clmmPool = await sdk.Resources.getPool('0x5b95ff6c8e523181b0439c4c74d83e3d220ccd7c554cfc09253d7f4612b5e4cf')
        // const isOppositeCoinType = false
        // const sale_decimals = 9
        // const raise_decimals = 9
        // const payload = await sdk.Launchpad.creatSettlePayload({
        //   pool_address: pool.pool_address,
        //   coin_type_sale: pool.coin_type_sale,
        //   coin_type_raise: pool.coin_type_raise,
        //   clmm_args: {
        //     current_price: pool.current_price,
        //     clmm_pool_address: clmmPool.poolAddress,
        //     clmm_sqrt_price: clmmPool.current_sqrt_price.toString(),
        //     opposite: isOppositeCoinType,
        //     sale_decimals,
        //     raise_decimals,
        //   }
        // })
        (0, transaction_util_1.printTransaction)(payload);
        const transferTxn = yield (0, transaction_util_1.sendTransaction)(signer, payload);
        console.log('settle: ', transferTxn);
    }));
    test('Withdraw', () => __awaiter(void 0, void 0, void 0, function* () {
        const signer = new sui_js_1.RawSigner(sendKeypair, sdk.fullClient);
        const pool = yield sdk.Launchpad.getPool(poolAddress);
        console.log('pool: ', pool);
        if (pool.pool_status == luanchpa_type_1.LaunchpadPoolActivityState.Ended ||
            pool.pool_status == luanchpa_type_1.LaunchpadPoolActivityState.Failed ||
            pool.pool_status == luanchpa_type_1.LaunchpadPoolActivityState.Canceled) {
            const saleAmount = yield launchpad_1.LauncpadUtil.getWithdrawSale(pool);
            const raiseAmount = yield launchpad_1.LauncpadUtil.getWithdrawRaise(pool);
            console.log('amount: ', saleAmount, raiseAmount);
            if (BigInt(saleAmount) > 0 || BigInt(raiseAmount) > 0) {
                const payload = sdk.Launchpad.creatWithdrawPayload({
                    pool_address: pool.pool_address,
                    coin_type_sale: pool.coin_type_sale,
                    coin_type_raise: pool.coin_type_raise,
                    sale_amount: BigInt(saleAmount),
                    raise_amount: BigInt(raiseAmount),
                });
                console.log('payload: ', payload.blockData.transactions[0]);
                const transferTxn = yield (0, transaction_util_1.sendTransaction)(signer, payload);
                console.log('Withdraw: ', transferTxn);
            }
        }
        else {
            throw new Error('The pool is not in Ended or Cancel ');
        }
    }));
    test('unlock_nft', () => __awaiter(void 0, void 0, void 0, function* () {
        const signer = new sui_js_1.RawSigner(sendKeypair, sdk.fullClient);
        const pool = yield sdk.Launchpad.getPool(poolAddress);
        console.log('pool: ', pool);
        if (pool.pool_status == luanchpa_type_1.LaunchpadPoolActivityState.Ended) {
            // const lockNftEvent = await sdk.Launchpad.getLockNFTEvent(pool.pool_type, pool.tick_spacing, pool.recipient)
            const lockNftInfo = {
                lock_nft_id: '0x71a80f33373cb7fb15819def2e6a5becef3442c3b223a296e18261a9df40e4a8',
                nft_type: '755bf5686c0c51f5ebc6893e4d6fb1a83e577bb10eaa3ed4b7b24407d9de7c6a::position::Position'
            };
            if (lockNftInfo) {
                const payload = sdk.Launchpad.creatUnlockNftPayload({
                    lock_nft: lockNftInfo.lock_nft_id,
                    nft_type: lockNftInfo.nft_type,
                });
                console.log('payload: ', payload.blockData.transactions[0]);
                const transferTxn = yield (0, transaction_util_1.sendTransaction)(signer, payload);
                console.log('unlock_nft: ', transferTxn);
            }
        }
        else {
            throw new Error('The pool is not in Ended  ');
        }
    }));
    test('getLockNFTList', () => __awaiter(void 0, void 0, void 0, function* () {
        const pool = yield sdk.Launchpad.getPool(poolAddress);
        if (pool.pool_status === luanchpa_type_1.LaunchpadPoolActivityState.Ended) {
            const result = yield sdk.Launchpad.getLockNFTList(pool.pool_type, pool.recipient);
            console.log('getLockNFTList: ', result);
        }
    }));
    test('addUserToWhitelisPayload', () => __awaiter(void 0, void 0, void 0, function* () {
        const signer = new sui_js_1.RawSigner(launchPadKeypair, sdk.fullClient);
        const pool = yield sdk.Launchpad.getPool(poolAddress);
        console.log('pool: ', pool);
        const localPool = launchpad_pool_data_1.creatPoolList.filter((item) => {
            return item.coin_type_sale === pool.coin_type_sale && item.coin_type_raise === pool.coin_type_raise;
        });
        const white_config = localPool[0].white_config;
        if (white_config) {
            const payload = sdk.Launchpad.addUserToWhitelisPayload({
                pool_address: poolAddress,
                coin_type_raise: pool.coin_type_raise,
                coin_type_sale: pool.coin_type_sale,
                user_addrs: white_config.user_addrs,
                safe_limit_amount: white_config.safe_limit_amount.toString()
            });
            (0, transaction_util_1.printTransaction)(payload);
            const transferTxn = yield (0, transaction_util_1.sendTransaction)(signer, payload);
            console.log('whitelist: ', transferTxn);
        }
    }));
    test('configWhitelistPayload', () => __awaiter(void 0, void 0, void 0, function* () {
        const signer = new sui_js_1.RawSigner(launchPadKeypair, sdk.fullClient);
        const pool = yield sdk.Launchpad.getPool(poolAddress);
        console.log('pool: ', pool);
        const localPool = launchpad_pool_data_1.creatPoolList.filter((item) => {
            return item.coin_type_sale === pool.coin_type_sale && item.coin_type_raise === pool.coin_type_raise;
        });
        const white_config = localPool[0].white_config;
        if (white_config) {
            const payload = sdk.Launchpad.updateWhitelistCaPayload({
                pool_address: poolAddress,
                coin_type_raise: pool.coin_type_raise,
                coin_type_sale: pool.coin_type_sale,
                hard_cap_total: white_config.hard_cap_total,
                white_list_member: '0xf751c72f6462d2c2f4434d085076c85c690a51b584d765bb8863669908835f41',
                safe_limit_amount: 10000000000
            });
            (0, transaction_util_1.printTransaction)(payload);
            const transferTxn = yield (0, transaction_util_1.sendTransaction)(signer, payload);
            console.log('whitelist: ', transferTxn);
        }
    }));
    test('creatRemoveWhitelistPayload', () => __awaiter(void 0, void 0, void 0, function* () {
        const signer = new sui_js_1.RawSigner(launchPadKeypair, sdk.fullClient);
        const pool = yield sdk.Launchpad.getPool(poolAddress);
        console.log('pool: ', pool);
        const payload = sdk.Launchpad.creatRemoveWhitelistPayload({
            pool_address: poolAddress,
            coin_type_raise: pool.coin_type_raise,
            coin_type_sale: pool.coin_type_sale,
            user_addrs: [sendKeypair.getPublicKey().toSuiAddress()],
        });
        (0, transaction_util_1.printTransaction)(payload);
        const transferTxn = yield (0, transaction_util_1.sendTransaction)(signer, payload);
        console.log('whitelist: ', transferTxn);
    }));
    test('isWhiteListUser', () => __awaiter(void 0, void 0, void 0, function* () {
        const pool = yield sdk.Launchpad.getPool(poolAddress);
        console.log('pool: ', pool);
        // const isWhiteListUser = await sdk.Launchpad.isWhiteListUser(pool.white_summary.white_handle, sendKeypair.getPublicKey().toSuiAddress())
        const isWhiteListUser = yield sdk.Launchpad.isWhiteListUser(pool.white_summary.white_handle, '0x66fb9f23e7a608317d91a036cb16b44363459fbfa2ab1595d4202ac4d95bb589  ');
        console.log('isWhiteListUser: ', isWhiteListUser);
    }));
    test('getPurchaseAmount', () => __awaiter(void 0, void 0, void 0, function* () {
        const pool = yield sdk.Launchpad.getPool(poolAddress);
        const purchaseAmount = yield sdk.Launchpad.getPurchaseAmount(
        // pool.white_summary.white_handle,
        '0xfa3b431f67ff07f4469fc9f56b36d07b8c98a696e60102f97bee919a977db658', '0x4b253f028ed137c76c66ce3e4d1d19c25227ba9f4c60674099bb19ee52f0bd39');
        console.log('purchaseAmount: ', purchaseAmount);
    }));
    test('getPurchaseMark', () => __awaiter(void 0, void 0, void 0, function* () {
        const purchaseMark = yield sdk.Launchpad.getPurchaseMarks("0xf751c72f6462d2c2f4434d085076c85c690a51b584d765bb8863669908835f41", [poolAddress]);
        console.log('purchaseMark: ', purchaseMark);
    }));
    test('getSettleEvent', () => __awaiter(void 0, void 0, void 0, function* () {
        const settleEvent = yield sdk.Launchpad.getSettleEvent(poolAddress);
        console.log('settleEvent: ', settleEvent);
    }));
    test('mint lauchpad token', () => __awaiter(void 0, void 0, void 0, function* () {
        yield (0, init_test_data_1.mintAll)(sdk, launchPadKeypair, {
            faucet_display: `0x8258af69b6d71e5f85670ec062a0ff7c5eb4323148e7fbc00950780f1b876ac7`,
            faucet_router: `0x8258af69b6d71e5f85670ec062a0ff7c5eb4323148e7fbc00950780f1b876ac7`,
        }, 'faucet', 'faucetAll');
    }));
    test('isAdminCap', () => __awaiter(void 0, void 0, void 0, function* () {
        //  const isAdminCap = await sdk.Launchpad.isAdminCap(launchPadKeypair.getPublicKey().toSuiAddress())
        //  console.log('isAdminCap: ', isAdminCap)
        //  console.log(TickMath.priceToSqrtPriceX64(d(1).div(2.2),6,6).toString());
        //  console.log(TickMath.sqrtPriceX64ToPrice(new BN("41248173712355948587"),6,9).toNumber());
        // const fixPrice = LauncpadUtil.priceFixToReal(1000000000/CONST_DENOMINATOR, 8, 9)
        // console.log(fixPrice);
        console.log(math_1.TickMath.sqrtPriceX64ToPrice(new bn_js_1.default("3689348814741910323"), 6, 9).toString());
        // console.log(TickMath.priceToSqrtPriceX64(new Decimal("1"),6,6).toString());
    }));
});
