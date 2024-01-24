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

  console.log(
    parseInt(fetchedUserValueAvg[0].account.inLeft.toString()) / 10 ** 9
  );

  return (
    <div className="w-full">
      {fetchedUserValueAvg.map(
        (userData: { account: UserValueAvg }, index: number) => (
          <div className="flex flex-col text-xs" key={index}>
            {/* Highlighted info */}
            <div className="flex flex-col bg-slate-600 w-full p-2 rounded">
              <div className="flex flex-row justify-between">
                <p>VA SOL balance </p>
                <p>
                  {parseInt(userData.account.inLeft.toString()) / 10 ** 9} SOL
                </p>
              </div>
              <div className="flex flex-row justify-between">
                <p>VA JITO-SOL balance </p>
                <p>
                  {parseInt(userData.account.outReceived.toString()) / 10 ** 9}{" "}
                  SOL
                </p>
              </div>
              <div className="flex flex-row justify-between">
                <p>Amount withdrawn</p>
                <p>
                  {parseInt(userData.account.outWithdrawn.toString()) / 10 ** 9}{" "}
                  SOL
                </p>
              </div>
            </div>

            <div className="flex flex-row justify-between mt-2">
              <p>Total Deposited</p>
              <p>
                {parseInt(userData.account.inDeposited.toString()) / 10 ** 9}{" "}
                SOL
              </p>
            </div>

            <div className="flex flex-row justify-between mt-1">
              <p>Total Spent</p>
              <p>
                {parseInt(userData.account.inUsed.toString()) / 10 ** 9} SOL
              </p>
            </div>

            <div className="flex flex-row justify-between mt-1">
              <p>Increment USDC Value</p>
              <p>
                {parseInt(userData.account.incrementUsdcValue.toString()) /
                  10 ** 6}{" "}
                USDC
              </p>
            </div>

            <div className="flex flex-row justify-between mt-1">
              <p>Supposed USDC Value</p>
              <p>
                {parseInt(userData.account.supposedUsdcValue.toString()) /
                  10 ** 6}{" "}
                USDC
              </p>
            </div>

            <div className="divider my-1"></div>

            <div className="flex flex-row justify-between mt-1">
              <p>Supposed USDC Value</p>
              <p>
                {parseInt(userData.account.supposedUsdcValue.toString()) /
                  10 ** 6}{" "}
                USDC
              </p>
            </div>

            <div className="flex flex-row justify-between mt-1">
              <p>Buying</p>
              <p>{userData.account.outputMint.toBase58()}</p>
            </div>

            <div className="flex flex-row justify-between mt-1">
              <p>Order Interval</p>
              <p>
                {parseInt(userData.account.orderInterval.toString()) /
                  (60 * 60 * 24)}{" "}
                day(s)
              </p>
            </div>

            <div className="flex flex-row justify-between mt-1">
              <p>Next Order</p>
              <p>
                {new Date(
                  Number(userData.account.nextOrderAt)
                ).toLocaleString()}
              </p>
            </div>

            <div className="flex flex-row justify-between mt-1">
              <p>Created At</p>
              <p>
                {new Date(Number(userData.account.createdAt)).toLocaleString()}
              </p>
            </div>
          </div>
        )
      )}
    </div>
  );
};

export default OpenVAOverview;
