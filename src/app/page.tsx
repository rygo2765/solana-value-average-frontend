"use client";
import React, { useEffect, useState } from "react";
import { useUnifiedWallet } from "@jup-ag/wallet-adapter";
import { PublicKey } from "@solana/web3.js";
import { TuiDateTimePicker } from "nextjs-tui-date-picker";
import DateTimePicker from "react-datetime-picker";
import {
  openValueAverage,
  validateAndConvertValues,
  getAllTokens,
  Token,
} from "@/lib/helpers";
// import { ValueAverageProgram } from "";
import { ValueAverageProgram } from "@jup-ag/value-average";
import { conn, usdcInfo, solInfo } from "@/lib/constants";
import OpenVAOverview from "./components/OpenVAOverview";
import TokenModal from "./components/TokenModal";
import PastVAOverview from "./components/PastVAOverview";

const programClient = new ValueAverageProgram(
  conn,
  "mainnet-beta",
  "https://solana-value-average.keepbuilding.work"
);
const defaultInToken = usdcInfo;
const defaultOutToken = solInfo;

const HomePage: React.FC = () => {
  const [selectedTimeframe, setSelectedTimeframe] = useState("minute");
  const [selectedTimeframeInSec, setSelectedTimeframeInSec] = useState(60);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedDateTime, setSelectedDateTime] = useState<Date>(new Date());
  const { wallet, connected } = useUnifiedWallet();
  const [userValueAvg, setUserValueAvg] = useState<any[] | null>(null);

  const [tokenList, setTokenList] = useState<any[] | null>(null);
  const [selectedInToken, setSelectedInToken] = useState<Token>(defaultInToken);
  const [selectedOutToken, setSelectedOutToken] =
    useState<Token>(defaultOutToken);
  const [currentVA, setCurrentVA] = useState(true);

  //Hooks
  useEffect(() => {
    const fetchTokenList = async () => {
      try {
        const tokens = await getAllTokens();
        setTokenList(tokens);
      } catch (error) {
        console.error("Error fetching token list: ", error);
      }
    };

    fetchTokenList();
  }, []);

  useEffect(() => {
    const fetchUserValueAvg = async () => {
      if (connected && wallet) {
        try {
          const fetchedUserValueAvg = await programClient.getCurrentByUser(
            wallet.adapter.publicKey!
          );
          console.log(fetchedUserValueAvg);

          const closedTest = await programClient.getClosedByUser(
            wallet.adapter.publicKey!
          );
          console.log(closedTest);

          // const fillTest = await programClient.getFillHistory(
          //   fetchedUserValueAvg[0].publicKey
          // );
          console.log(fillTest);

          setUserValueAvg(fetchedUserValueAvg);
        } catch (error) {
          console.error("Error fetching user value average:", error);
        }
      }
    };

    fetchUserValueAvg();
  }, [connected, wallet]);

  //Event Handlers
  const handleTimeframeSelect = (timeframe: string) => {
    switch (timeframe) {
      case "minute":
        setSelectedTimeframe(timeframe);
        setSelectedTimeframeInSec(60);
        break;
      case "hour":
        setSelectedTimeframe(timeframe);
        setSelectedTimeframeInSec(60 * 60);
        break;
      case "day":
        setSelectedTimeframe(timeframe);
        setSelectedTimeframeInSec(60 * 60 * 24);
        break;
      case "week":
        setSelectedTimeframe(timeframe);
        setSelectedTimeframeInSec(60 * 60 * 24 * 7);
        break;
      case "month":
        setSelectedTimeframe(timeframe);
        setSelectedTimeframeInSec(60 * 60 * 24 * 7 * 30);
        break;
    }
    setIsDropdownOpen(false);
  };

  const handleDateTimeSelect = (newDateTime: Date): void => {
    console.log(newDateTime);
    const parsedDate = new Date(newDateTime);
    console.log(parsedDate);
    setSelectedDateTime(parsedDate);
  };

  const handleInTokenSelect = (selectedToken: Token) => {
    setSelectedInToken(selectedToken);
  };

  const handleOutTokenSelect = (selectedToken: Token) => {
    setSelectedOutToken(selectedToken);
  };

  const handleActiveValueAvgsClick = () => {
    setCurrentVA(true);
  };

  const handlePastValueAvgsClick = () => {
    setCurrentVA(false);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    console.log(selectedInToken.decimals);
    console.log(selectedOutToken.decimals);

    if (!connected) {
      throw new Error("Wallet is not connected.");
    }

    const formData = new FormData(e.target as HTMLFormElement);

    const orderIntervalValueString = formData.get(
      "orderIntervalValue"
    ) as string;
    const totalAmountDepositString = formData.get(
      "totalAmountDeposit"
    ) as string;
    const totalValueIncrementString = formData.get(
      "totalValueIncrement"
    ) as string;

    const conversionResult = validateAndConvertValues(
      orderIntervalValueString,
      totalAmountDepositString,
      totalValueIncrementString,
      selectedInToken.decimals
    );

    const valueAverageData = {
      userPublicKey: wallet?.adapter.publicKey as PublicKey,
      inputToken: new PublicKey(selectedInToken.address),
      outputToken: new PublicKey(selectedOutToken.address),
      orderInterval: BigInt(
        conversionResult!.orderIntervalValue * selectedTimeframeInSec
      ),
      deposit: conversionResult!.deposit,
      usdcValueIncrement: conversionResult!.valueIncrement,
      startDateTime: BigInt(selectedDateTime.getTime() / 1000),
    };

    console.log(valueAverageData);

    await openValueAverage(valueAverageData, wallet!);
  };

  return (
    <div className="flex flex-col items-center justify-center bg-base-100 h-full">
      <div className="flex flex-col justify-center items-center bg-neutral rounded-lg w-[460px] h-[480px] my-5 shadow-md">
        <form
          onSubmit={handleSubmit}
          className="form-control justify-center w-full h-full px-2"
        >
          <div className="flex flex-row justify-between items-center">
            {/* input token field */}
            <div className="form-control w-full">
              <label className="label" htmlFor="inputToken">
                <span className="label-text">Input Token</span>
              </label>
              {tokenList && (
                <TokenModal
                  tokenList={tokenList}
                  onSelectToken={handleInTokenSelect}
                  defaultToken={defaultInToken}
                />
              )}
            </div>

            {/*output token field */}
            <div className="form-control w-full ml-2">
              <label className="label" htmlFor="outputToken">
                <span className="label-text">Output Token</span>
              </label>
              {tokenList && (
                <TokenModal
                  tokenList={tokenList}
                  onSelectToken={handleOutTokenSelect}
                  defaultToken={defaultOutToken}
                />
              )}
            </div>
          </div>

          {/* Order Interval Input */}
          <div className="flex flex-col w-full mt-2">
            <label className="label" htmlFor="orderIntervalValue">
              <span className="label-text">Every</span>
            </label>
            <div className="flex flex-row justify-end items-center">
              <input
                type="number"
                name="orderIntervalValue"
                placeholder="1"
                className="input input-bordered w-1/2"
              />
              <div className="dropdown w-1/2">
                <div
                  tabIndex={0}
                  role="button"
                  className="btn m-1 w-full"
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                >
                  {selectedTimeframe}
                </div>
                {isDropdownOpen && (
                  <ul className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-52">
                    <li>
                      <button
                        type="button"
                        onClick={() => handleTimeframeSelect("minute")}
                      >
                        minute
                      </button>
                    </li>
                    <li>
                      <button
                        type="button"
                        onClick={() => handleTimeframeSelect("hour")}
                      >
                        hour
                      </button>
                    </li>
                    <li>
                      <button
                        type="button"
                        onClick={() => handleTimeframeSelect("day")}
                      >
                        day
                      </button>
                    </li>
                    <li>
                      <button
                        type="button"
                        onClick={() => handleTimeframeSelect("week")}
                      >
                        week
                      </button>
                    </li>
                    <li>
                      <button
                        type="button"
                        onClick={() => handleTimeframeSelect("month")}
                      >
                        month
                      </button>
                    </li>
                  </ul>
                )}
              </div>
            </div>
          </div>

          {/* Total Amount Deposit Input */}
          <div className="form-control w-full mt-2">
            <label className="label-text">
              <span className="label-text">Total Amount Deposit</span>
            </label>
            <input
              type="text"
              name="totalAmountDeposit"
              placeholder=""
              className="input input-bordered w-full"
            />
          </div>

          {/* Total Value Increment */}
          <div className="form-control w-full mt-2">
            <label className="label-text">
              <span className="label-text">Total Value Increment</span>
            </label>
            <input
              type="text"
              name="totalValueIncrement"
              placeholder=""
              className="input input-bordered w-full"
            />
          </div>

          {/* Start Date & Time Selector */}
          <div className="flex flex-row w-full justify-end items-center">
            <p className="w-1/2">Start date & time: </p>
            <TuiDateTimePicker
              handleChange={handleDateTimeSelect}
              date={selectedDateTime}
              inputWidth={180}
              fontSize={16}
              timePicker={true}
              format="yyyy-MM-dd HH:mm"
            />
          </div>

          <button className="btn my-2" type="submit">
            Submit
          </button>
        </form>
      </div>

      {connected ? (
        <div id="displayOpened" className="flex flex-col w-[460px]">
          <div className="flex flex-row justify-start mb-4">
            <button
              className={`btn btn-sm mx-2 text-black ${
                currentVA ? "bg-blue-500" : "bg-gray-300"
              }`}
              onClick={handleActiveValueAvgsClick}
            >
              Active Value Avgs
            </button>
            <button
              className={`btn btn-sm mx-2 text-black ${
                !currentVA ? "bg-blue-500" : "bg-gray-300"
              }`}
              onClick={handlePastValueAvgsClick}
            >
              Past Value Avgs
            </button>
          </div>

          {currentVA && userValueAvg && tokenList ? (
            <OpenVAOverview
              fetchedUserValueAvg={userValueAvg}
              tokenList={tokenList}
              wallet={wallet!}
            />
          ) : !currentVA ? (
            <PastVAOverview />
          ) : null}
        </div>
      ) : null}
    </div>
  );
};

export default HomePage;
