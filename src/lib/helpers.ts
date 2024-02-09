import { ValueAverageProgram } from "@jup-ag/value-average";
import { conn } from "./constants";
import { PublicKey, Transaction } from "@solana/web3.js";
import { Wallet } from "@jup-ag/wallet-adapter";
import { toast } from "sonner";

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
    const { ixs, pda } = await programClient.open({
      user: valueAverageData.userPublicKey,
      payer: valueAverageData.userPublicKey,
      inputMint: valueAverageData.inputToken,
      outputMint: valueAverageData.outputToken,
      orderInterval: valueAverageData.orderInterval,
      depositAmount: valueAverageData.deposit,
      incrementUSDCValue: valueAverageData.usdcValueIncrement,
      feeDataAccount: undefined,
      referralFeeAccount: undefined,
      userInputAccount: undefined,
      startAtUnix: valueAverageData.startDateTime,
      autoWithdraw: true,
    });

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
    toast.success("Transaction confirmed successfully!");
  } catch (error) {
    console.error("Confirmation failed: ", error);
    toast.error("Transaction confirmation failed. Please try again.");
  }
}

export async function depositToken(
  wallet: Wallet,
  valueAverage: PublicKey,
  amount: BigInt
) {
  try {
    const depositInstructions = await programClient.deposit(
      valueAverage,
      amount
    );

    const tx = new Transaction();

    tx.add(depositInstructions);

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
    toast.success("Deposit confirmed successfully!");
  } catch (error) {
    console.error("Error in deposit: ", error);
  }
}

export async function withdrawAllAndClose(
  wallet: Wallet,
  valueAveragePubKey: PublicKey
) {
  try {
    const valueAverage = await programClient.get(valueAveragePubKey);

    const tx = new Transaction();

    if (valueAverage.inLeft > 0) {
      console.log(`Has input balance of ${valueAverage.inLeft.toString()}`);

      const withdrawInTokenInstruction = await programClient.withdraw(
        valueAverage.user,
        valueAverage.user,
        valueAveragePubKey,
        valueAverage.inputMint,
        undefined,
        undefined,
        undefined
      );

      tx.add(...withdrawInTokenInstruction);
    }

    if (valueAverage.outReceived - valueAverage.outWithdrawn > 0) {
      console.log(
        `Has output balance of ${valueAverage.outReceived
          .sub(valueAverage.outWithdrawn)
          .toString()}`
      );

      const withdrawOutTokenInstruction = await programClient.withdraw(
        valueAverage.user,
        valueAverage.user,
        valueAveragePubKey,
        valueAverage.outputMint,
        undefined,
        undefined,
        undefined
      );

      tx.add(...withdrawOutTokenInstruction);
    }

    tx.add(
      await programClient.close(
        valueAverage.user,
        valueAveragePubKey,
        undefined
      )
    );

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
    return true;
  } catch (err) {
    console.error("Error in withdrawAllAndClose: ", err);
  }
}

export function validateAndConvertValues(
  orderIntervalValueString: string,
  totalAmountDepositString: string,
  totalValueIncrementString: string,
  inTokenDecimals: number
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

    const deposit = BigInt(totalAmountDeposit * 10 ** inTokenDecimals); //to be changed
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

//tokens
export interface Token {
  address: string;
  chainId: number;
  decimals: number;
  name: string;
  symbol: string;
  logoURI: string;
  tags: string[];
  extensions: {
    coingeckoId: string;
  };
}

export async function getAllTokens(): Promise<Token[]> {
  const res = await fetch("https://token.jup.ag/all");
  const tokens: Token[] = await res.json();

  let maxNameLength = 0;
  let tokenWithMaxLength: Token | null = null;

  // Iterate through the tokens
  tokens.forEach((token) => {
    const nameLength = token.name.length;

    // Check if the current token's name has a greater length
    if (nameLength > maxNameLength) {
      maxNameLength = nameLength;
      tokenWithMaxLength = token;
    }
  });

  console.log("Maximum Name Length:", maxNameLength);
  console.log("Token with Maximum Name:", tokenWithMaxLength);

  return tokens;
}

export const getTokenData = (
  tokenList: Token[],
  publicKey: PublicKey
): Token | undefined => {
  return tokenList.find((token) => token.address === publicKey.toBase58());
};

export function findTokenByAddress(
  tokens: Token[],
  address: string
): Token | undefined {
  return tokens.find((token) => token.address === address);
}

export function shortenAddress(address: string, length = 4) {
  if (!address) return "";
  const start = address.slice(0, length);
  const end = address.slice(-length);
  return `${start}...${end}`;
}
