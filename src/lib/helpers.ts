import { ValueAverageProgram } from "solana-value-average";
import { conn } from "./constants";
import { PublicKey, Transaction } from "@solana/web3.js";
import { Wallet, useUnifiedWallet } from "@jup-ag/wallet-adapter";

export interface ValueAverageData {
  userPublicKey: PublicKey;
  inputToken: PublicKey;
  outputToken: PublicKey;
  orderInterval: BigInt;
  deposit: BigInt;
  usdcValueIncrement: BigInt;
  startDateTime?: BigInt;
}

const programClient = new ValueAverageProgram(conn, "mainnet-beta");

export async function openValueAverage(
  valueAverageData: ValueAverageData,
  wallet: Wallet
) {
  try {
    const { ixs, pda } = await programClient.open(
      valueAverageData.userPublicKey,
      valueAverageData.userPublicKey,
      valueAverageData.inputToken,
      valueAverageData.outputToken,
      valueAverageData.orderInterval,
      valueAverageData.deposit,
      valueAverageData.usdcValueIncrement,
      undefined,
      valueAverageData.startDateTime
    );

    const tx = new Transaction();
    tx.add(...ixs);

    const txsig = await wallet?.adapter.sendTransaction(tx, conn, {
      skipPreflight: false,
    });

    if (txsig === undefined) {
      throw new Error("Transaction signature is undefined");
    }

    const latestBlockHash = await conn.getLatestBlockhash();

    await conn.confirmTransaction(
      {
        blockhash: latestBlockHash.blockhash,
        lastValidBlockHeight: latestBlockHash.lastValidBlockHeight,
        signature: txsig,
      },
      "confirmed"
    );

  } catch (error) {
    console.error("Confirmation failed: ", error);
  }
}

export function validateAndConvertValues(
  orderIntervalValueString: string,
  totalAmountDepositString: string,
  totalValueIncrementString: string
) {
  try {
    let totalAmountDeposit: number = 0;
    let orderIntervalValue: number = 0;
    let totalValueIncrement: number = 0;

    if (/^[1-9]\d*$|^$/.test(orderIntervalValueString)) {
      orderIntervalValue =
        orderIntervalValueString === ""
          ? 1
          : parseInt(orderIntervalValueString, 10);
    }

    if (/^\d*\.?\d+$/.test(totalAmountDepositString)) {
      totalAmountDeposit = parseFloat(totalAmountDepositString);
    }

    if (/^\d*\.?\d+$/.test(totalValueIncrementString)) {
      totalValueIncrement = parseFloat(totalValueIncrementString);
    }

    const deposit = BigInt(totalAmountDeposit * 10 ** 9); //to be changed
    const valueIncrement = BigInt(totalValueIncrement * 10 ** 6); //in USDC

    return {
      orderIntervalValue,
      deposit,
      valueIncrement,
    };
  } catch (error) {
    console.error("Invalid Input: ", error);
  }
}
