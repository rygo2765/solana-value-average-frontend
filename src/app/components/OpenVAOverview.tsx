"use client";
import { PublicKey } from "@solana/web3.js";

interface UserValueAvg {
  idx: BigInt;
  bump: number;
  user: PublicKey;
  inputMint: PublicKey;
  outputMint: PublicKey;
  incrementUsdcValue: BigInt;
  orderInterval: BigInt;
  inputVault: PublicKey;
  outputVault: PublicKey;
  feeDataAccount: PublicKey;
  createdAt: BigInt;
  inDeposited: BigInt;
  inLeft: BigInt;
  inUsed: BigInt;
  inWithdrawn: BigInt;
  outReceived: BigInt;
  outWithdrawn: BigInt;
  supposedUsdcValue: BigInt;
  nextOrderAt: BigInt;
  outBalanceBeforeSwap: BigInt;
}

const OpenVAOverview: React.FC<{
  fetchedUserValueAvg: { account: UserValueAvg }[];
}> = ({ fetchedUserValueAvg }) => {
  if (!fetchedUserValueAvg) {
    return <p>Loading data...</p>;
  }
  return (
    <div>
      {fetchedUserValueAvg.map(
        (userData: { account: UserValueAvg }, index: number) => (
          <div key={index}>
            <p>User: {userData.account.user.toBase58()}</p>
            <p>Input Mint: {userData.account.inputMint.toBase58()}</p>
            <p>OutputMint: {userData.account.outputMint.toBase58()}</p>
          </div>
        )
      )}
    </div>
  );
};

export default OpenVAOverview;
