import { ValueAverageProgram } from "solana-value-average";
import { conn } from "./constants";
import { PublicKey, Transaction } from "@solana/web3.js";
import { Wallet } from "@jup-ag/wallet-adapter";

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

export async function deposit(wallet: Wallet) {}

export async function withdrawAllAndClose(
  wallet: Wallet,
  valueAveragePubKey: PublicKey
) {
  try {
    const valueAverage = await programClient.get(valueAveragePubKey);

    const tx = new Transaction();

    if (valueAverage.inLeft > 0) {
      console.log(`Has input balance of ${valueAverage.inLeft.toString()}`);

      tx.add(
        await programClient.withdraw(
          valueAverage.user,
          valueAverage.user,
          valueAveragePubKey,
          valueAverage.inputMint
        )
      );
    }

    if (valueAverage.outReceived - valueAverage.outWithdrawn > 0) {
      console.log(
        `Has output balance of ${valueAverage.outReceived
          .sub(valueAverage.outWithdrawn)
          .toString()}`
      );

      tx.add(
        await programClient.withdraw(
          valueAverage.user,
          valueAverage.user,
          valueAveragePubKey,
          valueAverage.outputMint
        )
      );
    }

    tx.add(await programClient.close(valueAverage.user, valueAveragePubKey));

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
    const valueIncrement = BigInt(totalValueIncrement * 10 ** 9); //in USDC

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
