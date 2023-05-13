import { Ed25519Keypair, getTransactionEffects, ObjectId, RawSigner } from '@mysten/sui.js'
import BN from 'bn.js'
import { buildSdk, buildTestAccount, buildTestPool, TokensMapping } from './data/init_test_data'
import { CoinAsset } from '../src/modules/resourcesModule'
import { CoinAssist } from '../src/math/CoinAssist'
import 'isomorphic-fetch';
import { printTransaction, sendTransaction, TransactionUtil } from '../src/utils/transaction-util'
import { adjustForSlippage, d, Percentage } from '../src'


const sdk = buildSdk()

const sendKeypair = buildTestAccount()
const signer = new RawSigner(sendKeypair, sdk.fullClient)
// Fetch coin assets of sendKeypair
const allCoinAsset = await sdk.Resources.getOwnerCoinAssets(sendKeypair.getPublicKey().toSuiAddress())

const poolAddress = '0x2e041f3fd93646dcc877f783c1f2b7fa62d30271bdef1f21ef002cebf857bded'
//  Fetch pool data
const pool = await sdk.Resources.getPool(poolAddress)
//  Fetch ticks data
const tickdatas = await sdk.Pool.fetchTicksByRpc(pool.ticks_handle)
// Whether the swap direction is token a to token b
const a2b = true

// fix input token amount
const coinAmount = new BN(5)

console.log('coinAmount',JSON.stringify(coinAmount))

// input token amount is token a
const by_amount_in = true
// slippage value
 const slippage = Percentage.fromDecimal(d(5))

 console.log('slippage',JSON.stringify(slippage))


const curSqrtPrice = new BN(pool.current_sqrt_price)
// Estimated amountIn amountOut fee

// const res = sdk.Swap.calculateRates({
//     decimalsA: gasEstimateArg.decimalsA,
//     decimalsB: gasEstimateArg.decimalsB,
//     a2b: params.a2b,
//     byAmountIn: params.by_amount_in,
//     amount: new BN(params.amount),
//     swapTicks: gasEstimateArg.swapTicks,
//     currentPool: gasEstimateArg.currentPool,
//   })


const res = await sdk.Swap.calculateRates({
      decimalsA: 6,
      decimalsB: 6,
      a2b:  a2b,
      byAmountIn: by_amount_in,
      amount: coinAmount,
      swapTicks: tickdatas,
      currentPool: pool,
    })
const toAmount = by_amount_in ? res.estimatedAmountOut : res.estimatedAmountIn
const amountLimit =  adjustForSlippage(toAmount,slippage,!by_amount_in)

// build swap Payload
const swapPayload = await sdk.Swap.createSwapTransactionPayload(
      {
        pool_id: pool.poolAddress,
        coinTypeA: pool.coinTypeA,
        coinTypeB: pool.coinTypeB,
        a2b: a2b,
        by_amount_in: by_amount_in,
        amount: res.amount.toString(),
        amount_limit: amountLimit.toString(),
      },
    )

 const transferTxn = await sendTransaction(signer,swapPayload)
 console.log('swap: ', transferTxn)


