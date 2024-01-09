"use client"
import React from 'react';
import {ValueAverageProgram} from 'solana-value-average'
import { useUnifiedWallet} from '@jup-ag/wallet-adapter';
import { conn } from '@/lib/constants';
import { PublicKey } from '@solana/web3.js';



const programClient = new ValueAverageProgram(conn, 'mainnet-beta');


const HomePage: React.FC = () => {
  const {wallet, connected} = useUnifiedWallet()
  if (connected){
    console.log(wallet?.adapter.publicKey?.toBase58())
  }

  const checkBufferModule = () => {
    if (typeof Buffer !== 'undefined') {
      console.log(Buffer)
      console.log('Buffer module is available in the bundle!');
    } else {
      console.log('Buffer module is NOT available in the bundle.');
    }
  };

  const openValueAverage = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // console.log(e)

    const userPublicKey = wallet?.adapter.publicKey as PublicKey;
    const inputToken = new PublicKey('So11111111111111111111111111111111111111112')
    const outputToken = new PublicKey('J1toso1uCk3RLmjorhTtrVwY9HJ7X8V9yYac6Y7kGCPn')
    const orderInterval = BigInt(60 * 60 * 24)
    const deposit = BigInt(0.2 * 10**9)
    const tokenValueIncrement = BigInt(0.01 * 10**9)
    const startAtUnix = BigInt(1741340800)


    const {ix: ixs, pda} = await programClient.open(
      userPublicKey,
      userPublicKey,
      inputToken,
      outputToken,
      orderInterval,
      deposit,
      tokenValueIncrement,
      undefined,
      undefined
    )

    console.log(ixs)
    console.log(pda)
  }


  return (
    <div>
      <form onSubmit={openValueAverage} className='w-full'>
        <button type='submit'>Submit</button>
      </form>
      <button onClick={checkBufferModule}>Check Buffer</button>
    </div>
  );
};

export default HomePage;
