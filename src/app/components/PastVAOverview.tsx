"use client";
import { Token, getTokenData } from "@/lib/helpers";
import { PublicKey } from "@solana/web3.js";
import { useState } from "react";
import Orders from "./Orders";

interface PastUserValueAvg {
  user: PublicKey;
  inputMint: PublicKey;
  outputMint: PublicKey;
  inDeposited: BigInt;
  inLeft: BigInt;
  inUsed: BigInt;
  inWithdrawn: BigInt;
  incrementUsdcValue: BigInt;
  openTxHash: string;
  closeTxHash: string;
  orderInterval: BigInt;
  outReceived: BigInt;
  outWithdrawn: BigInt;
  status: number;
  supposedUsdcValue: BigInt;
}

interface FillEvent {
  userKey: PublicKey;
  valueAverageKey: PublicKey;
  inputMint: PublicKey;
  outputMint: PublicKey;
  inputAmount: string;
  outputAmount: string;
  value: string;
  feeMint: PublicKey;
  fee: string;
  supposedUsdcValue: string;
  newActualUsdcValue: string;
  txSignature: string;
  confirmedAt: Date;
}

interface ClosedVAOverviewProps {
  fetchedClosedValueAvg: {
    account: PastUserValueAvg;
    publicKey: PublicKey;
    fills: FillEvent[];
  }[];
  tokenList: Token[];
}

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

const PastVAOverview: React.FC<ClosedVAOverviewProps> = ({
  fetchedClosedValueAvg,
  tokenList,
}) => {
  const [activeTab, setActiveTab] = useState("Overview");

  const toggleTab = (tabName: string) => {
    setActiveTab(tabName);
  };

  return (
    <div className="w-full">
      {fetchedClosedValueAvg.map(
        (
          {
            account,
            publicKey,
            fills,
          }: {
            account: PastUserValueAvg;
            publicKey: PublicKey;
            fills: FillEvent[];
          },
          index: number
        ) => {
          const inputTokenData = getTokenData(tokenList, account.inputMint);
          const outputTokenData = getTokenData(tokenList, account.outputMint);

          console.log('index: ', index, 'fills: ', fills)
          return (
            <div className="collapse bg-base-200 mt-1" key={index}>
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

                  <a
                    target="_blank"
                    href={`https://solscan.io/account/${publicKey.toBase58()}`}
                    className="ml-2 relative z-10"
                  >
                    <svg
                      width="12"
                      height="20"
                      viewBox="0 0 10 10"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M4 2V3H1.5V8.5H7V6H8V9C8 9.13261 7.94732 9.25979 7.85355 9.35355C7.75979 9.44732 7.63261 9.5 7.5 9.5H1C0.867392 9.5 0.740215 9.44732 0.646447 9.35355C0.552678 9.25979 0.5 9.13261 0.5 9V2.5C0.5 2.36739 0.552678 2.24021 0.646447 2.14645C0.740215 2.05268 0.867392 2 1 2H4ZM9.5 0.5V4.5H8.5V2.2065L4.6035 6.1035L3.8965 5.3965L7.7925 1.5H5.5V0.5H9.5Z"
                        fill="currentColor"
                      ></path>
                    </svg>
                  </a>
                </div>
                <div className="flex flex- text-white font-bold">
                  <p>
                    {parseInt(account.inDeposited.toString()) /
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
                          <div className="flex flex-row justify-between mt-2">
                            <p>VA {inputTokenData!.symbol} balance </p>
                            <p>
                              {parseFloat(account.inLeft.toString()) /
                                10 ** inputTokenData!.decimals}{" "}
                              {inputTokenData!.symbol}
                            </p>
                          </div>
                          <div className="flex flex-row justify-between mt-2">
                            <p>VA {outputTokenData!.symbol} balance </p>
                            <p>
                              {parseFloat(account.outReceived.toString()) /
                                10 ** outputTokenData!.decimals}{" "}
                              {outputTokenData!.symbol}
                            </p>
                          </div>
                          <div className="flex flex-row justify-between mt-2">
                            <p>Amount withdrawn</p>
                            <div className="flex flex-col items-end">
                              <p>
                                {parseFloat(account.inWithdrawn.toString()) /
                                  10 ** inputTokenData!.decimals}{" "}
                                {inputTokenData!.symbol}
                              </p>
                              <p>
                                {parseFloat(account.outWithdrawn.toString()) /
                                  10 ** outputTokenData!.decimals}{" "}
                                {outputTokenData!.symbol}
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-row justify-between mt-2">
                          <p>Total Deposited</p>
                          <p>
                            {parseFloat(account.inDeposited.toString()) /
                              10 ** inputTokenData!.decimals}{" "}
                            {inputTokenData!.symbol}
                          </p>
                        </div>

                        <div className="flex flex-row justify-between mt-1">
                          <p>Total Spent</p>
                          <p>
                            {parseFloat(account.inUsed.toString()) /
                              10 ** inputTokenData!.decimals}{" "}
                            {inputTokenData!.symbol} (
                            {(
                              Number(account.inUsed) /
                              Number(account.inDeposited)
                            ).toFixed(0)}
                            %)
                          </p>
                        </div>

                        <div className="flex flex-row justify-between mt-1">
                          <p>Increment USDC Value</p>
                          <p>
                            {parseInt(account.incrementUsdcValue.toString()) /
                              10 ** 6}{" "}
                            USDC
                          </p>
                        </div>

                        <div className="flex flex-row justify-between mt-1">
                          <p>Supposed USDC Value</p>
                          <p>
                            {parseInt(account.supposedUsdcValue.toString()) /
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
                            Every{" "}
                            {formatTimeInterval(
                              parseInt(account.orderInterval.toString())
                            )}{" "}
                          </p>
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
                    <div role="tabpanel" className="tab-content pt-5">
                        <Orders inTokenData={inputTokenData!} outTokenData={outputTokenData!} fillEvents={fills}/>
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

export default PastVAOverview;
