import { Ed25519Keypair, getTransactionEffects, ObjectId, RawSigner } from '@mysten/sui.js'
import BN from 'bn.js'
import { buildSdk, buildTestAccount, buildTestPool, TokensMapping } from './data/init_test_data'
import { CoinAsset } from '../src/modules/resourcesModule'
import { CoinAssist } from '../src/math/CoinAssist'
import 'isomorphic-fetch';
import { printTransaction, sendTransaction, TransactionUtil } from '../src/utils/transaction-util'
import { adjustForSlippage, d, Percentage } from '../src'
import { TxBlock } from '../src/utils/tx-block';

async function test() {
    const sdk = buildSdk()

const sendKeypair = buildTestAccount()
sdk.senderAddress = sendKeypair.getPublicKey().toSuiAddress()
const signer = new RawSigner(sendKeypair, sdk.fullClient)
// Fetch coin assets of sendKeypair
const allCoinAsset = await sdk.Resources.getOwnerCoinAssets(sendKeypair.getPublicKey().toSuiAddress())

const poolAddress = '0x2e041f3fd93646dcc877f783c1f2b7fa62d30271bdef1f21ef002cebf857bded'
//  Fetch pool data
const pool = await sdk.Resources.getPool(poolAddress)
//  Fetch ticks data
const tickdatas = await sdk.Pool.fetchTicksByRpc(pool.ticks_handle)
// Whether the swap direction is token a to token b
const a2b = false

// fix input token amount
const coinAmount = new BN(700000000)

console.log('coinAmount',JSON.stringify(coinAmount))

// input token amount is token a
const by_amount_in = true
// slippage value
 const slippage = Percentage.fromDecimal(d(5))

 console.log('slippage',JSON.stringify(slippage))


const curSqrtPrice = new BN(pool.current_sqrt_price)
// Estimated amountIn amountOut fee


const res = await sdk.Swap.calculateRates({
      decimalsA: 9,
      decimalsB: 6,
      a2b:  a2b,
      byAmountIn: by_amount_in,
      amount: coinAmount,
      swapTicks: tickdatas,
      currentPool: pool,
    })



const calculateRates = {
    estimatedAmountIn: res.estimatedAmountIn.toString(),
    estimatedAmountOut: res.estimatedAmountOut.toString(),
    estimatedEndSqrtprice: res.estimatedEndSqrtPrice.toString(),
    estimatedFeeAmount: res.estimatedFeeAmount.toString(),
    isExceed: res.isExceed,
    a2b: a2b,
    byAmountIn : by_amount_in,
    }

console.log('calculateRates', JSON.stringify(calculateRates))


const toAmount = by_amount_in ? res.estimatedAmountOut : res.estimatedAmountIn
const amountLimit =  adjustForSlippage(toAmount,slippage,!by_amount_in)

console.log('toAmount: ', JSON.stringify(toAmount))
console.log('amountLimit: ', JSON.stringify(amountLimit))

// console.log('swap###params####', { amount: res.amount.toString(), amount_limit: amountLimit.toString() })


// const swapPayload = await sdk.Swap.createSwapTransactionPayload(
//     {
//       pool_id: pool.poolAddress,
//       coinTypeA: pool.coinTypeA,
//       coinTypeB: pool.coinTypeB,
//       a2b: a2b,
//       by_amount_in: by_amount_in,
//       amount: res.amount.toString(),
//       amount_limit: amountLimit.toString(),
//     },
//   )

const swapPayload = await sdk.Swap.createSwapTransactionPayload({
pool_id: pool.poolAddress,
a2b:a2b,
by_amount_in: by_amount_in,
amount: res.amount.toString(),
amount_limit: amountLimit.toString(),
coinTypeA: pool.coinTypeA,
coinTypeB: pool.coinTypeB,
},{
byAmountIn:by_amount_in,
slippage: slippage,
decimalsA:9,
decimalsB:9,
swapTicks: tickdatas,
currentPool:pool
})

printTransaction(swapPayload)
const transferTxn = await sendTransaction(signer,swapPayload)
console.log('swap: ', transferTxn)






//获取账户余额

// const allBalance = await sdk.fullClient.getBalance({
//     owner : sendKeypair.getPublicKey().toSuiAddress(),
//     coinType: '0x2::sui::SUI'
//     })
// console.log('allBalance: ', JSON.stringify(allBalance))

// 转账sui or other token 

// const tx = new TxBlock()
// const recipient = "0x5252031ef2397cd9979216d7460219b91937445f51e0a0ac2b1c286b7ee2351a"
// tx.transferSui(recipient,1 * 1_000_000_000)


//transfer other coin 
// tx.transferCoin(recipient,3 * 1_000_000_000,["0x6864a6f921804860930db6ddbe2e16acdf8504495ea7481637a1c8b9a8fe54b"])
// const resultTxn = await sendTransaction(signer,tx.txBlock)

// console.log(JSON.stringify(resultTxn));


// 查看 hash 结果, 不需要 resultTxn中就已经查询了
// 不过需要对resultTxn 进行判断，当异常or gas not enough 的时候，会是undefined, 其他情况正常字典


  



// build swap Payload
// const swapPayload = await sdk.Swap.createSwapTransactionPayload(
//       {
//         pool_id: pool.poolAddress,
//         coinTypeA: pool.coinTypeA,
//         coinTypeB: pool.coinTypeB,
//         a2b: a2b,
//         by_amount_in: by_amount_in,
//         amount: res.amount.toString(),
//         amount_limit: amountLimit.toString(),
//       },
//     )
//  const transferTxn = await sendTransaction(signer,swapPayload)
//  console.log('swap: ', transferTxn)




//暂时用作查询使用
/*
const tokens: CoinProvider = {
    coins: [
      {
        address: '0x2::sui::SUI',
        decimals: 9,
      },
      {
        address: '0xaf8cd5edc19c4512f4259f0bee101a40d41ebed738ade5874359610ef8eeced5::coin::COIN',
        decimals: 8,
      },
      {
        address: '',
        decimals:
      }

      {
        //usdc
        address: '0x5d4b302506645c37ff133b98c4b50a5ae14841659738d6d733d59d0d217a93bf::coin::COIN',
        decimals: 6,
      },
    ]
  }

*/

}

test()




