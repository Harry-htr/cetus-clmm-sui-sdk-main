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
const tx_block_1 = require("../src/utils/tx-block");
/*

+ 将 js 功能封装成函数
+ 在 js 中使用app对这些函数进行监听
+ 在 python 中对应函数

*/
// 在 js 内部进行封装，要求多个功能函数，函数名定义按照以下需求
const get_token_balance = (token_id) => __awaiter(void 0, void 0, void 0, function* () {
    /*  查询单个币种的余额
        owner : 不变
        coinType: token_id
        获取到的结果全部返回
    */
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
    /*  查询单个币种的余额
        owner : 不变
        get_all_balances
         获取到的结果全部返回
    */
    const sdk = (0, init_test_data_1.buildSdk)();
    const sendKeypair = (0, init_test_data_1.buildTestAccount)();
    const allBalance = yield sdk.fullClient.getAllBalances({
        owner: sendKeypair.getPublicKey().toSuiAddress()
    });
    return JSON.stringify(allBalance);
});
exports.get_token_balances = get_token_balances;
const transfer = (token_name, objectid, num, to_address) => __awaiter(void 0, void 0, void 0, function* () {
    /*  转账token 到 某个账户
    if token_name == 'SUI':
      do transferSui(to_address, num)
    else:
      transferCoin(to_address, num, [objectid])
    */
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
    //     // 反向
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
function test() {
    return __awaiter(this, void 0, void 0, function* () {
        // const allBalance = await get_token_balances()
        // console.log(allBalance)
        // token_name:string, objectid:string, num:number, to_address:string
        // const token_name = 'Z'
        // const objectid = '0x6864a6f921804860930db6ddbe2e16acdf8504495ea7481637a1c8b9a8fe54b'
        // const num = 1 * 1000000000
        // const to_address = '0x5252031ef2397cd9979216d7460219b91937445f51e0a0ac2b1c286b7ee2351a'
        // const tran = await transfer(token_name, objectid, num, to_address)
        // console.log(tran)
        //pool_id:string, decimalsA:number, decimalsB:number, numA:number, numB:number
        const pool_id = '0x2e041f3fd93646dcc877f783c1f2b7fa62d30271bdef1f21ef002cebf857bded';
        const decimalsA = 9;
        const decimalsB = 9;
        const numA = 2 * 1000000000;
        const numB = 3 * 1000000000;
        // const reuslt = await calculate_pnl_rates(pool_id, decimalsA, decimalsB, numA, numB)
        // console.log(reuslt)
        //pool_id:string, a2b:boolean, decimalsA:number, decimalsB:number, num:number, min_get:number
        const result = yield (0, exports.swap)(pool_id, false, decimalsA, decimalsB, numA, 0.02);
        console.log(result);
    });
}
test();
//   // 新建一份js 文件，在该文件中引入上面的函数名
//   var express = require('express')
//   // import express from 'express'
//   var app = express()
//   import {function_name} from 'path_dir'
//   // import {getBalance_acala, getLiquidity_acala, DataInit_acala, swapWithExactSupply_acala, swapWithExactTarget_acala, generalTokenTransfer_acala} from './src/dex-examples/funIntegration_acala'
//   var bodyParser = require('body-parser');  // 导入请求体解析器
//   // 调整参数大小限制，否则会提示参数过大。
//   app.use(bodyParser.urlencoded({limit: '50mb', extended: true}));
//   //下面的function_name 为python发http请求的name，调用的函数为下面的getBalance_karura 这个函数（该函数为前面的js里面定义）
//   app.post('/function_name', function(req, res) {
//     // 获取请求的真实IP
//     var ip = req.headers['x-real-ip'] ? req.headers['x-real-ip'] : req.ip.replace(/::ffff:/, '');
//     // 获取请求时间
//     var time = new Date().toString();
//     // 获取POST请求的formdata
//     let result = req.body;
//     // 调用cook模块中的get_cookie方法，该方法需要提前module.exports导出
//     getBalance_karura(result.address, result.key, result.token).then((response)=>{
//           res.set('Content-Type', 'application/json')
//           // 将JSON后的数据返回客户端
//           res.send(JSON.stringify({"result": response}));
//       }).catch((error) => {
//       console.error(error);
//       res.set('Content-Type', 'application/json')
//           // 将JSON后的数据返回客户端
//           res.send(JSON.stringify({"result": ''}));
//       });
//     // 设置响应头，如果不设置，通过asyncio_requests请求的res.json()会报错，因为它是根据响应头解析json数据
//     // 而requests可以直接使用res.json()解析，因为它是根据响应信息解析
//   });
