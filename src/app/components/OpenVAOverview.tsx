"use client";
import { PublicKey } from "@solana/web3.js";
import {
  Token,
  withdrawAllAndClose,
  getTokenData,
  depositToken,
  withdrawToken,
} from "@/lib/helpers";
import { useState, useEffect, ChangeEventHandler } from "react";
import { Wallet } from "@jup-ag/wallet-adapter";
import { programClient } from "@/lib/constants";
import Orders from "./Orders";

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
  fetchedUserValueAvg: { account: UserValueAvg; publicKey: PublicKey }[];
  tokenList: Token[];
  wallet: Wallet;
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

const OpenVAOverview: React.FC<OpenVAOverviewProps> = ({
  fetchedUserValueAvg,
  tokenList,
  wallet,
}) => {
  const [activeTab, setActiveTab] = useState("Overview");
  const [fillHistories, setFillHistories] = useState<any[]>([]);
  const [depositAmount, setDepositAmount] = useState<BigInt>(BigInt(0));
  const [withdrawalAmount, setWithdrawalAmount] = useState<BigInt>(BigInt(0));
  const [withdrawalToken, setWithdrawalToken] = useState<Token>();

  const toggleTab = (tabName: string) => {
    setActiveTab(tabName);
  };

  const submitWithdrawAndClose = async (valueAveragePubKey: PublicKey) => {
    try {
      console.log(wallet.adapter.publicKey?.toBase58());
      const res = await withdrawAllAndClose(wallet!, valueAveragePubKey);

      if (res) {
        console.log("withdraw and close successful");
      }
    } catch (error) {
      console.error("Error in withdrawing and closing: ", error);
    }
  };

  const handleDepositChange: ChangeEventHandler<HTMLInputElement> = (event) => {
    setDepositAmount(BigInt(event.target.value));
  };

  const submitDeposit = async (
    valueAveragePubKey: PublicKey,
    decimals: number
  ) => {
    const inTokenAmount = BigInt(Number(depositAmount) * 10 ** decimals);
    await depositToken(wallet, valueAveragePubKey, inTokenAmount);
  };

  const handleWithdrawalTokenToggle = (
    inputTokenData: Token,
    outputTokenData: Token
  ) => {
    setWithdrawalToken((prevToken) =>
      prevToken!.symbol === inputTokenData.symbol
        ? outputTokenData
        : inputTokenData
    );
  };

  const handleWithdrawalChange: ChangeEventHandler<HTMLInputElement> = (
    event
  ) => {
    setWithdrawalAmount(BigInt(event.target.value));
  };

  const submitWithdrawal = async (valueAveragePubKey: PublicKey) => {
    const withdrawTokenAmount = BigInt(
      Number(withdrawalAmount) * 10 ** withdrawalToken!.decimals
    );
    await withdrawToken(
      wallet,
      valueAveragePubKey,
      withdrawalToken!,
      withdrawTokenAmount
    );
  };

  useEffect(() => {
    const fetchFillHistories = async () => {
      const histories = await Promise.all(
        fetchedUserValueAvg.map(async ({ publicKey }) => {
          return await programClient.getFillHistory(publicKey);
        })
      );

      setFillHistories(histories);
    };

    fetchFillHistories();
  }, []);

  useEffect(() => {
    fetchedUserValueAvg.forEach(({ account }) => {
      const outputTokenData = getTokenData(tokenList, account.outputMint);
      if (outputTokenData) {
        setWithdrawalToken(outputTokenData);
        return;
      }
    });
  }, [fetchedUserValueAvg, tokenList]);

  if (fetchedUserValueAvg.length === 0) {
    return (
      <div className="w-full flex justify-center outline-dotted outline-gray-700 rounded items-center h-32">
        <p className="text-center text-gray-600">You have no active orders</p>
      </div>
    );
  }

  return (
    <div className="w-full">
      {fetchedUserValueAvg.map(
        (
          {
            account,
            publicKey,
          }: { account: UserValueAvg; publicKey: PublicKey },
          index: number
        ) => {
          const inputTokenData = getTokenData(tokenList, account.inputMint);
          const outputTokenData = getTokenData(tokenList, account.outputMint);

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
                            {inputTokenData!.symbol}
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
                            {formatTimeInterval(
                              parseInt(account.orderInterval.toString())
                            )}{" "}
                          </p>
                        </div>

                        <div className="flex flex-row justify-between mt-1">
                          <p>Next Order</p>
                          <p>
                            {new Date(
                              Number(account.nextOrderAt) * 1000
                            ).toLocaleString()}
                          </p>
                        </div>

                        <div className="flex flex-row justify-between mt-1">
                          <p>Created At</p>
                          <p>
                            {new Date(
                              Number(account.createdAt) * 1000
                            ).toLocaleString()}
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-col w-full">
                        <div className="flex flex-row justify-around mt-3 w-full">
                          <div className="flex flex-col w-1/2  mx-2">
                            <label className="label-text">
                              <span className="label-text text-xs">
                                Deposit More {inputTokenData?.symbol}
                              </span>
                            </label>
                            <input
                              type="number"
                              placeholder="Enter deposit amount"
                              value={depositAmount.toString()}
                              onChange={handleDepositChange}
                              className="w-full rounded h-8  pl-2"
                            />
                            <button
                              className="btn btn-sm bg-yellow-500 text-black w-full mt-2"
                              onClick={() =>
                                submitDeposit(
                                  publicKey,
                                  inputTokenData!.decimals
                                )
                              }
                            >
                              Deposit
                            </button>
                          </div>
                          <div className="divider divider-horizontal m-0" />
                          <div className="flex flex-col w-1/2 mx-2">
                            <label className="label-text">
                              <span className="label-text text-xs">
                                Withdraw {withdrawalToken?.symbol}
                              </span>
                            </label>
                            <div className="flex flex-row items-center">
                              <input
                                type="number"
                                placeholder="Enter withdrawal amount"
                                value={withdrawalAmount.toString()}
                                onChange={handleWithdrawalChange}
                                className="w-3/4 rounded h-8 pl-2"
                              />
                              <label className="swap swap-flip ml-3">
                                <input
                                  type="checkbox"
                                  onClick={() =>
                                    handleWithdrawalTokenToggle(
                                      inputTokenData!,
                                      outputTokenData!
                                    )
                                  }
                                />

                                <img
                                  className="swap-off w-8 h-8 rounded"
                                  src={outputTokenData?.logoURI}
                                />
                                <img
                                  className="swap-on w-8 h-8 rounded"
                                  src={inputTokenData?.logoURI}
                                />
                              </label>
                            </div>
                            <button
                              className="btn btn-sm bg-yellow-500 text-black w-full mt-2"
                              onClick={() => submitWithdrawal(publicKey)}
                            >
                              Withdraw
                            </button>
                          </div>
                        </div>

                        <button
                          className="btn bg-yellow-500 text-black w-full mt-3"
                          onClick={() => submitWithdrawAndClose(publicKey)}
                        >
                          Withdraw & Close
                        </button>
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
                      <Orders
                        inTokenData={inputTokenData!}
                        outTokenData={outputTokenData!}
                        fillEvents={fillHistories[index]}
                      />
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
