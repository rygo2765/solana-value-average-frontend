"use client";
import { PublicKey } from "@solana/web3.js";
import { Token } from "@/lib/helpers";
import { useState } from "react";

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

interface OpenVAOverviewProps {
  fetchedUserValueAvg: { account: UserValueAvg }[];
  tokenList: Token[];
}

const getTokenData = (
  tokenList: Token[],
  publicKey: PublicKey
): Token | undefined => {
  return tokenList.find((token) => token.address === publicKey.toBase58());
};

const formatTimeInterval = (seconds: number) => {
  const minute = 60;
  const hour = 60 * minute;
  const day = 24 * hour;
  const week = 7 * day;
  const month = 30 * day;

  if (seconds < minute) {
    return `${seconds} second${seconds !== 1 ? "s" : ""}`;
  } else if (seconds < hour) {
    const minutes = Math.floor(seconds / minute);
    return `${minutes} minute${minutes !== 1 ? "s" : ""}`;
  } else if (seconds < day) {
    const hours = Math.floor(seconds / hour);
    return `${hours} hour${hours !== 1 ? "s" : ""}`;
  } else if (seconds < week) {
    const days = Math.floor(seconds / day);
    return `${days} day${days !== 1 ? "s" : ""}`;
  } else if (seconds < month) {
    const weeks = Math.floor(seconds / week);
    return `${weeks} week${weeks !== 1 ? "s" : ""}`;
  } else {
    const months = Math.floor(seconds / month);
    return `${months} month${months !== 1 ? "s" : ""}`;
  }
};

const OpenVAOverview: React.FC<OpenVAOverviewProps> = ({
  fetchedUserValueAvg,
  tokenList,
}) => {
  const [activeTab, setActiveTab] = useState("Overview");

  const toggleTab = (tabName: string) => {
    setActiveTab(tabName);
  };

  if (!fetchedUserValueAvg) {
    return <p>Loading data...</p>;
  }

  return (
    <div className="w-full">
      {fetchedUserValueAvg.map(
        (userData: { account: UserValueAvg }, index: number) => {
          const inputTokenData = getTokenData(
            tokenList,
            userData.account.inputMint
          );
          const outputTokenData = getTokenData(
            tokenList,
            userData.account.outputMint
          );

          return (
            <div className="collapse bg-base-200 mt-5" key={index}>
              <input type="checkbox" />
              <div className="collapse-title text-sm font-medium flex flex-row justify-between">
                <div className="flex flex-row ">
                  <img
                    className="w-5 h-5 rounded-full"
                    src={inputTokenData!.logoURI}
                    alt={inputTokenData!.symbol}
                  />
                  <img
                    className="w-5 h-5 rounded-full ml-[-5px]"
                    src={outputTokenData!.logoURI}
                    alt={outputTokenData!.symbol}
                  />

                  <p className="ml-3 font-bold text-white">
                    {inputTokenData!.symbol}
                  </p>
                  <svg
                    className="w-3 h-5 mx-2"
                    viewBox="0 0 25 21"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M23.9339 9.08485L16.0326 1.18357C15.6735 0.80576 15.1766 0.589184 14.6554 0.581696C14.1341 0.575134 13.6326 0.779509 13.2632 1.14795C12.8948 1.5164 12.6904 2.01795 12.696 2.53921C12.7026 3.0614 12.9191 3.55734 13.2969 3.91734L17.9676 8.58054H2.43406C1.36626 8.58054 0.5 9.44679 0.5 10.5146C0.5 11.5833 1.36626 12.4496 2.43406 12.4496H17.9244L13.2969 17.0838C12.5741 17.845 12.5891 19.0431 13.3316 19.7847C14.0741 20.5263 15.2732 20.5413 16.0326 19.8175L23.9339 11.9163C24.2976 11.5544 24.502 11.0622 24.5001 10.5484C24.5011 10.5325 24.5011 10.5166 24.5001 10.5006C24.5011 10.4847 24.5011 10.4688 24.5001 10.4528C24.5001 9.94001 24.2967 9.44782 23.9339 9.08501L23.9339 9.08485Z"
                      fill="white"
                    ></path>
                  </svg>

                  <p className="font-bold text-white">
                    {outputTokenData!.symbol}
                  </p>
                </div>
                <div className="flex flex- text-white font-bold">
                  <p>
                    {parseInt(userData.account.inDeposited.toString()) /
                      10 ** inputTokenData!.decimals}
                  </p>
                  <p className="ml-2">{inputTokenData!.symbol}</p>
                </div>
              </div>
              <div className="collapse-content">
                <div role="tablist" className="tabs tabs-bordered w-full">
                  <input
                    type="radio"
                    name={`user_tabs_${index}`}
                    role="tab"
                    className="tab"
                    aria-label="Overview"
                    checked={activeTab === "Overview"}
                    onChange={() => toggleTab("Overview")}
                  />
                  {activeTab === "Overview" && (
                    <div
                      role="tabpanel"
                      className="tab-content p-5 flex flex-col"
                    >
                      <div className="flex flex-col text-xs">
                        <div className="flex flex-col bg-slate-600 w-full p-2 rounded">
                          <div className="flex flex-row justify-between">
                            <p>VA {inputTokenData!.symbol} balance </p>
                            <p>
                              {parseFloat(userData.account.inLeft.toString()) /
                                10 ** inputTokenData!.decimals}{" "}
                              {inputTokenData!.symbol}
                            </p>
                          </div>
                          <div className="flex flex-row justify-between">
                            <p>VA {outputTokenData!.symbol} balance </p>
                            <p>
                              {parseFloat(
                                userData.account.outReceived.toString()
                              ) /
                                10 ** outputTokenData!.decimals}{" "}
                              {outputTokenData!.symbol}
                            </p>
                          </div>
                          <div className="flex flex-row justify-between">
                            <p>Amount withdrawn</p>
                            <p>
                              {parseFloat(
                                userData.account.outWithdrawn.toString()
                              ) /
                                10 ** outputTokenData!.decimals}{" "}
                              {outputTokenData!.symbol}
                            </p>
                          </div>
                        </div>

                        <div className="flex flex-row justify-between mt-2">
                          <p>Total Deposited</p>
                          <p>
                            {parseFloat(
                              userData.account.inDeposited.toString()
                            ) /
                              10 ** inputTokenData!.decimals}{" "}
                            {inputTokenData!.symbol}
                          </p>
                        </div>

                        <div className="flex flex-row justify-between mt-1">
                          <p>Total Spent</p>
                          <p>
                            {parseFloat(userData.account.inUsed.toString()) /
                              10 ** inputTokenData!.decimals}{" "}
                            {inputTokenData!.symbol}
                          </p>
                        </div>

                        <div className="flex flex-row justify-between mt-1">
                          <p>Increment USDC Value</p>
                          <p>
                            {parseInt(
                              userData.account.incrementUsdcValue.toString()
                            ) /
                              10 ** 6}{" "}
                            USDC
                          </p>
                        </div>

                        <div className="flex flex-row justify-between mt-1">
                          <p>Supposed USDC Value</p>
                          <p>
                            {parseInt(
                              userData.account.supposedUsdcValue.toString()
                            ) /
                              10 ** 6}{" "}
                            USDC
                          </p>
                        </div>

                        <div className="divider my-1"></div>

                        <div className="flex flex-row justify-between mt-1">
                          <p>Buying</p>
                          <div className="flex flex-row items-center">
                            <img
                              src={outputTokenData?.logoURI}
                              alt={outputTokenData?.symbol}
                              className="w-4 h-4 rounded-full"
                            />
                            <p className="ml-1">{outputTokenData?.symbol}</p>
                          </div>
                        </div>

                        <div className="flex flex-row justify-between mt-1">
                          <p>Order Interval</p>
                          <p>
                            {formatTimeInterval(
                              parseInt(
                                userData.account.orderInterval.toString()
                              )
                            )}{" "}
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
                            {new Date(
                              Number(userData.account.createdAt)
                            ).toLocaleString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex flex-col w-full">
                        <div className="flex flex-row justify-between mt-3 w-full">
                          <button className="btn bg-yellow-500 text-black w-1/2 mr-0.5">
                            Deposit
                          </button>
                          <button className="btn bg-yellow-500 text-black w-1/2 ml-0.5">
                            Withdraw
                          </button>
                        </div>
                        <div className="flex flex-row justify-between mt-1 w-full">
                          <button className="btn bg-yellow-500 text-black w-1/2 mr-0.5">
                            Withdraw & Close
                          </button>
                          <button className="btn bg-yellow-500 text-black w-1/2 ml-0.5">
                            Close
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  <input
                    type="radio"
                    name={`user_tabs_${index}`}
                    role="tab"
                    className="tab"
                    checked={activeTab === "Orders"}
                    aria-label="Orders"
                    onChange={() => toggleTab("Orders")}
                  />
                  {activeTab === "Orders" && (
                    <div role="tabpanel" className="tab-content p-10">
                      <p>No orders to show</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        }
      )}
    </div>
  );
};

export default OpenVAOverview;
