import { Connection } from "@solana/web3.js";
import { ValueAverageProgram } from "@jup-ag/value-average";

const rpcUrl =
  process.env.NEXT_PUBLIC_RPC || "https://api.mainnet-beta.solana.com";

export const conn = new Connection(rpcUrl);

export const programClient = new ValueAverageProgram(
  conn,
  "mainnet-beta",
  "https://va.jup.ag"
);

export const usdcInfo = {
  address: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
  chainId: 101,
  decimals: 6,
  name: "USD Coin",
  symbol: "USDC",
  logoURI:
    "https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v/logo.png",
  tags: ["old-registry", "solana-fm"],
  extensions: { coingeckoId: "usd-coin" },
};

export const solInfo = {
  address: "So11111111111111111111111111111111111111112",
  chainId: 101,
  decimals: 9,
  name: "Wrapped SOL",
  symbol: "SOL",
  logoURI:
    "https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/So11111111111111111111111111111111111111112/logo.png",
  tags: ["old-registry"],
  extensions: { coingeckoId: "wrapped-solana" },
};
