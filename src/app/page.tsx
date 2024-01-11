"use client";
import React from "react";
import { ValueAverageProgram } from "solana-value-average";
import { useUnifiedWallet } from "@jup-ag/wallet-adapter";
import { conn } from "@/lib/constants";
import { PublicKey } from "@solana/web3.js";

const programClient = new ValueAverageProgram(conn, "mainnet-beta");

const HomePage: React.FC = () => {
  const { wallet, connected } = useUnifiedWallet();
  if (connected) {
    console.log(wallet?.adapter.publicKey?.toBase58());
  }

  const openValueAverage = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // console.log(e)

    const userPublicKey = wallet?.adapter.publicKey as PublicKey;
    const inputToken = new PublicKey(
      "So11111111111111111111111111111111111111112"
    );
    const outputToken = new PublicKey(
      "J1toso1uCk3RLmjorhTtrVwY9HJ7X8V9yYac6Y7kGCPn"
    );
    const orderInterval = BigInt(60 * 60 * 24);
    const deposit = BigInt(0.2 * 10 ** 9);
    const tokenValueIncrement = BigInt(0.01 * 10 ** 9);
    const startAtUnix = BigInt(1741340800);

    // const acc = await programClient.get(userPublicKey)
    // console.log(acc)

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
  };

  return (
    <div className="flex flex-col items-center justify-center bg-base-100 h-screen">
      <div className="flex flex-col justify-center items-center bg-neutral rounded-lg w-1/3 h-1/2">
        <form onSubmit={openValueAverage} className="form-control w-full px-2">
          
          {/* input token field */}
          <div className="form-control w-full">
            <label className="label" htmlFor="inputToken">
              <span className="label-text">Input Token</span>
            </label>
            <input type="text" name="inputToken" placeholder="" className="input input-bordered w-full"/>
          </div>

          <div className="form-control w-full">
            <label className="label-text">
              <span className="label-text">Output Token</span>
            </label>
            <input type='text' name='outputToken' placeholder="" className="input input-bordered w-full"/>
          </div>

          

          <button type="submit">Submit</button>
        </form>
      </div>
    </div>
  );
};

export default HomePage;
