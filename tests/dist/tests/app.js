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
exports.swap = exports.calculate_pnl_rates = exports.transfer = exports.get_token_balances = exports.get_token_balance = void 0;
const sui_js_1 = require("@mysten/sui.js");
const bn_js_1 = __importDefault(require("bn.js"));
const init_test_data_1 = require("./data/init_test_data");
require("isomorphic-fetch");
const transaction_util_1 = require("../src/utils/transaction-util");
const src_1 = require("../src");
const express_1 = __importDefault(require("express"));
const tx_block_1 = require("../src/utils/tx-block");
const app = (0, express_1.default)();
app.use(express_1.default.json());
const get_token_balance = (token_id) => __awaiter(void 0, void 0, void 0, function* () {
    //获取账户余额
    const sdk = (0, init_test_data_1.buildSdk)();
    const sendKeypair = (0, init_test_data_1.buildTestAccount)();
    const allBalance = yield sdk.fullClient.getBalance({
        owner: sendKeypair.getPublicKey().toSuiAddress(),
        coinType: token_id
    });
    return JSON.stringify(allBalance);
});
exports.get_token_balance = get_token_balance;
const get_token_balances = () => __awaiter(void 0, void 0, void 0, function* () {
    const sdk = (0, init_test_data_1.buildSdk)();
    const sendKeypair = (0, init_test_data_1.buildTestAccount)();
    const allBalance = yield sdk.fullClient.getAllBalances({
        owner: sendKeypair.getPublicKey().toSuiAddress()
    });
    return JSON.stringify(allBalance);
});
exports.get_token_balances = get_token_balances;
// 转账
const transfer = (token_name, objectid, num, to_address) => __awaiter(void 0, void 0, void 0, function* () {
    //  转账token 到 某个账户
    const sdk = (0, init_test_data_1.buildSdk)();
    const sendKeypair = (0, init_test_data_1.buildTestAccount)();
    const signer = new sui_js_1.RawSigner(sendKeypair, sdk.fullClient);
    // 转账sui or other token
    const tx = new tx_block_1.TxBlock();
    const recipient = to_address;
    if (token_name == 'SUI') {
        tx.transferSui(recipient, num);
    }
    else {
        // transfer other coin 
        tx.transferCoin(recipient, num, [objectid]);
    }
    const resultTxn = yield (0, transaction_util_1.sendTransaction)(signer, tx.txBlock);
    return JSON.stringify(resultTxn);
});
exports.transfer = transfer;
const calculate_pnl_rates = (pool_id, decimalsA, decimalsB, numA, numB) => __awaiter(void 0, void 0, void 0, function* () {
    const sdk = (0, init_test_data_1.buildSdk)();
    //  Fetch pool data
    const pool = yield sdk.Resources.getPool(pool_id);
    //  Fetch ticks data
    const tickdatas = yield sdk.Pool.fetchTicksByRpc(pool.ticks_handle);
    const currentPool = yield (0, init_test_data_1.buildTestPool)(sdk, pool_id);
    var a2b = true;
    var byAmountIn = true;
    const numA_bn = new bn_js_1.default(numA);
    var res = yield sdk.Swap.calculateRates({
        decimalsA: decimalsA,
        decimalsB: decimalsB,
        a2b,
        byAmountIn,
        amount: numA_bn,
        swapTicks: tickdatas,
        currentPool
    });
    const res1 = {
        estimatedAmountIn: res.estimatedAmountIn.toString(),
        estimatedAmountOut: res.estimatedAmountOut.toString(),
        estimatedEndSqrtprice: res.estimatedEndSqrtPrice.toString(),
        estimatedFeeAmount: res.estimatedFeeAmount.toString(),
        isExceed: res.isExceed,
        a2b,
        byAmountIn
    };
    //反向
    a2b = false;
    byAmountIn = false;
    const numB_bn = new bn_js_1.default(numB);
    res = yield sdk.Swap.calculateRates({
        decimalsA: decimalsA,
        decimalsB: decimalsB,
        a2b,
        byAmountIn,
        amount: numB_bn,
        swapTicks: tickdatas,
        currentPool,
    });
    const res2 = {
        estimatedAmountIn: res.estimatedAmountIn.toString(),
        estimatedAmountOut: res.estimatedAmountOut.toString(),
        estimatedEndSqrtprice: res.estimatedEndSqrtPrice.toString(),
        estimatedFeeAmount: res.estimatedFeeAmount.toString(),
        isExceed: res.isExceed,
        a2b,
        byAmountIn,
    };
    const result = { 'pool_pos': res1, 'pool_neg': res2 };
    return JSON.stringify(result);
});
exports.calculate_pnl_rates = calculate_pnl_rates;
const swap = (pool_id, a2b, decimalsA, decimalsB, num, slippage_ratio) => __awaiter(void 0, void 0, void 0, function* () {
    // 实现兑换功能, Q1:是否coinAmount为amount+gas， Q2：滑点的设置还需要更明确一些，最好能验证配置 
    const sdk = (0, init_test_data_1.buildSdk)();
    const sendKeypair = (0, init_test_data_1.buildTestAccount)();
    sdk.senderAddress = sendKeypair.getPublicKey().toSuiAddress();
    const signer = new sui_js_1.RawSigner(sendKeypair, sdk.fullClient);
    const byAmountIn = true;
    const amount = new bn_js_1.default(num);
    const slippage = src_1.Percentage.fromDecimal((0, src_1.d)(slippage_ratio * 100));
    const currentPool = yield (0, init_test_data_1.buildTestPool)(sdk, pool_id);
    const tickdatas = yield sdk.Pool.fetchTicksByRpc(currentPool.ticks_handle);
    const calculateRatesParams = {
        decimalsA,
        decimalsB,
        a2b,
        byAmountIn,
        amount,
        swapTicks: tickdatas,
        currentPool
    };
    const res = yield sdk.Swap.calculateRates(calculateRatesParams);
    const toAmount = byAmountIn ? res.estimatedAmountOut : res.estimatedAmountIn;
    const amountLimit = (0, src_1.adjustForSlippage)(toAmount, slippage, !byAmountIn);
    // print amountLimit
    console.log("amountLimit", amountLimit.toString());
    const swapPayload = yield sdk.Swap.createSwapTransactionPayload({
        pool_id: currentPool.poolAddress,
        a2b,
        by_amount_in: byAmountIn,
        amount: amount.toString(),
        amount_limit: amountLimit.toString(),
        coinTypeA: currentPool.coinTypeA,
        coinTypeB: currentPool.coinTypeB,
    }, {
        byAmountIn,
        slippage,
        decimalsA,
        decimalsB,
        swapTicks: tickdatas,
        currentPool
    });
    (0, transaction_util_1.printTransaction)(swapPayload);
    const transferTxn = yield (0, transaction_util_1.sendTransaction)(signer, swapPayload);
    return JSON.stringify(transferTxn);
});
exports.swap = swap;
// ---------------------------------------
// 获取单个账户余额
app.get('/get_token_balance/:token_id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const token_id = req.params.token_id;
        const balance = yield (0, exports.get_token_balance)(token_id);
        res.json({ balance });
    }
    catch (error) {
        res.status(500).send(error.toString());
    }
}));
// 获取所有账户余额
app.get('/get_token_balances', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const balances = yield (0, exports.get_token_balances)();
        res.json({ balances });
    }
    catch (error) {
        res.status(500).send(error.toString());
    }
}));
// 转账到某个账户
app.post('/transfer', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { token_name, objectid, num, to_address } = req.body;
        const result = yield (0, exports.transfer)(token_name, objectid, num, to_address);
        res.json({ result });
    }
    catch (error) {
        res.status(500).send(error.toString());
    }
}));
app.post('/calculate_pnl_rates', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // pool_id: string, decimalsA: number, decimalsB: number, numA: number, numB: number
        const { pool_id, decimalsA, decimalsB, numA, numB } = req.body;
        const result = yield (0, exports.calculate_pnl_rates)(pool_id, decimalsA, decimalsB, numA, numB);
        res.json({ result });
    }
    catch (error) {
        res.status(500).send(error.toString());
    }
}));
app.post('/swap', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // pool_id: string, a2b: boolean, decimalsA: number, decimalsB: number, num: number, slippage_ratio: number
        const { pool_id, a2b, decimalsA, decimalsB, num, slippage_ratio } = req.body;
        const result = yield (0, exports.swap)(pool_id, a2b, decimalsA, decimalsB, num, slippage_ratio);
        res.json({ result });
    }
    catch (error) {
        res.status(500).send(error.toString());
    }
}));
const port = 3000;
app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});
