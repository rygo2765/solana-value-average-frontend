import { Connection } from "@solana/web3.js";

const rpcUrl = process.env.NEXT_PUBLIC_RPC || 'https://api.mainnet-beta.solana.com'
export const conn = new Connection(rpcUrl);
