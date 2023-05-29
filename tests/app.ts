import { Ed25519Keypair, getTransactionEffects, ObjectId, RawSigner } from '@mysten/sui.js'
import BN from 'bn.js'
import { buildSdk, buildTestAccount, buildTestPool, TokensMapping } from './data/init_test_data'
import { CoinAsset } from '../src/modules/resourcesModule'
import { CoinAssist } from '../src/math/CoinAssist'
import 'isomorphic-fetch';
import { printTransaction, sendTransaction, TransactionUtil } from '../src/utils/transaction-util'
import { adjustForSlippage, d, Percentage } from '../src'
import express from 'express'
import { TxBlock } from '../src/utils/tx-block';

const app = express();
app.use(express.json());

export const get_token_balance = async (token_id: string) => {
    //获取账户余额
    const sdk = buildSdk()
    const sendKeypair = buildTestAccount()
    const allBalance = await sdk.fullClient.getBalance({
        owner: sendKeypair.getPublicKey().toSuiAddress(),
        coinType: token_id
    })
    return JSON.stringify(allBalance);
}

export const get_token_balances = async () => {
    const sdk = buildSdk()
    const sendKeypair = buildTestAccount()
    const allBalance = await sdk.fullClient.getAllBalances({
        owner: sendKeypair.getPublicKey().toSuiAddress()
    })
    return JSON.stringify(allBalance);
}

// 转账
export const transfer = async (token_name: string, objectid: string, num: number, to_address: string) => {
    //  转账token 到 某个账户
    const sdk = buildSdk()
    const sendKeypair = buildTestAccount()
    const signer = new RawSigner(sendKeypair, sdk.fullClient)

    // 转账sui or other token
    const tx = new TxBlock()
    const recipient = to_address
    if (token_name == 'SUI') {

        tx.transferSui(recipient, num)
    } else {
        // transfer other coin 
        tx.transferCoin(recipient, num, [objectid])
    }
    const resultTxn = await sendTransaction(signer, tx.txBlock)
    return JSON.stringify(resultTxn)
}

export const calculate_pnl_rates = async (pool_id: string, decimalsA: number, decimalsB: number, numA: number, numB: number) => {
    const sdk = buildSdk()

    //  Fetch pool data
    const pool = await sdk.Resources.getPool(pool_id)
    //  Fetch ticks data
    const tickdatas = await sdk.Pool.fetchTicksByRpc(pool.ticks_handle)
    const currentPool = await buildTestPool(sdk, pool_id)

    var a2b = true
    var byAmountIn = true
    const numA_bn = new BN(numA)


    var res = await sdk.Swap.calculateRates({
        decimalsA: decimalsA,
        decimalsB: decimalsB,
        a2b,
        byAmountIn,
        amount: numA_bn,
        swapTicks: tickdatas,
        currentPool
    })

    const res1 = {
        estimatedAmountIn: res.estimatedAmountIn.toString(),
        estimatedAmountOut: res.estimatedAmountOut.toString(),
        estimatedEndSqrtprice: res.estimatedEndSqrtPrice.toString(),
        estimatedFeeAmount: res.estimatedFeeAmount.toString(),
        isExceed: res.isExceed,
        a2b,
        byAmountIn
    }

    //反向
    a2b = false
    byAmountIn = false
    const numB_bn = new BN(numB)

    res = await sdk.Swap.calculateRates({
        decimalsA: decimalsA,
        decimalsB: decimalsB,
        a2b,
        byAmountIn,
        amount: numB_bn,
        swapTicks: tickdatas,
        currentPool,
    })

    const res2 = {
        estimatedAmountIn: res.estimatedAmountIn.toString(),
        estimatedAmountOut: res.estimatedAmountOut.toString(),
        estimatedEndSqrtprice: res.estimatedEndSqrtPrice.toString(),
        estimatedFeeAmount: res.estimatedFeeAmount.toString(),
        isExceed: res.isExceed,
        a2b,
        byAmountIn,
    }

    const result = { 'pool_pos': res1, 'pool_neg': res2 }
    return JSON.stringify(result)
}

export const swap = async (pool_id: string, a2b: boolean, decimalsA: number, decimalsB: number, num: number, slippage_ratio: number) => {
    // 实现兑换功能, Q1:是否coinAmount为amount+gas， Q2：滑点的设置还需要更明确一些，最好能验证配置 

    const sdk = buildSdk()
    const sendKeypair = buildTestAccount()

    sdk.senderAddress = sendKeypair.getPublicKey().toSuiAddress()

    const signer = new RawSigner(sendKeypair, sdk.fullClient)


    const byAmountIn = true
    const amount = new BN(num)
    const slippage = Percentage.fromDecimal(d(slippage_ratio * 100))

    const currentPool = await buildTestPool(sdk, pool_id)

    const tickdatas = await sdk.Pool.fetchTicksByRpc(currentPool.ticks_handle)

    const calculateRatesParams = {
        decimalsA,
        decimalsB,
        a2b,
        byAmountIn,
        amount,
        swapTicks: tickdatas,
        currentPool
    }
    const res = await sdk.Swap.calculateRates(calculateRatesParams)

    const toAmount = byAmountIn ? res.estimatedAmountOut : res.estimatedAmountIn

    const amountLimit = adjustForSlippage(toAmount, slippage, !byAmountIn)
    // print amountLimit
    console.log("amountLimit", amountLimit.toString())

    const swapPayload = await sdk.Swap.createSwapTransactionPayload({
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
    })

    printTransaction(swapPayload)
    const transferTxn = await sendTransaction(signer, swapPayload)
    return JSON.stringify(transferTxn)
}

// ---------------------------------------
// 获取单个账户余额
app.get('/get_token_balance/:token_id', async (req, res) => {
    try {
        const token_id = req.params.token_id;
        const balance = await get_token_balance(token_id);
        res.json({ balance });
    } catch (error: any) {
        res.status(500).send(error.toString());
    }
});

// 获取所有账户余额
app.get('/get_token_balances', async (req, res) => {
    try {
        const balances = await get_token_balances();
        res.json({ balances });
    } catch (error: any) {
        res.status(500).send(error.toString());
    }
});

// 转账到某个账户
app.post('/transfer', async (req, res) => {
    try {
        const { token_name, objectid, num, to_address } = req.body;
        const result = await transfer(token_name, objectid, num, to_address);
        res.json({ result });
    } catch (error: any) {
        res.status(500).send(error.toString());
    }
});


app.post('/calculate_pnl_rates', async (req, res) => {
    try {
        // pool_id: string, decimalsA: number, decimalsB: number, numA: number, numB: number
        const { pool_id, decimalsA, decimalsB, numA, numB } = req.body;
        const result = await calculate_pnl_rates(pool_id, decimalsA, decimalsB, numA, numB);
        res.json({ result });
    } catch (error: any) {
        res.status(500).send(error.toString());
    }
});

app.post('/swap', async (req, res) => {
    try {
        // pool_id: string, a2b: boolean, decimalsA: number, decimalsB: number, num: number, slippage_ratio: number
        const { pool_id, a2b, decimalsA, decimalsB, num, slippage_ratio } = req.body;
        const result = await swap(pool_id, a2b, decimalsA, decimalsB, num, slippage_ratio);
        res.json({ result });
    } catch (error: any) {
        res.status(500).send(error.toString());
    }
});

const port = 3000;
app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});

