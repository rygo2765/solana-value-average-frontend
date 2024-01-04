"use client"
import React from 'react';
import {ValueAverageProgram} from 'solana-value-average'
import { useWallet, useUnifiedWallet} from '@jup-ag/wallet-adapter';

const HomePage: React.FC = () => {
  const {wallet, connected} = useUnifiedWallet()
  if (connected){
    console.log(wallet?.adapter.publicKey?.toBase58())
  }
  const openValueAverage = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log(e)
  }


  return (
    <div>
      <form onSubmit={openValueAverage} className='w-full'>
        <button type='submit'>Submit</button>
      </form>
    </div>
  );
};

export default HomePage;