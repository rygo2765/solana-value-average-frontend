"use client";
import React, { useEffect, useState } from "react";
import { useUnifiedWallet } from "@jup-ag/wallet-adapter";
import { PublicKey } from "@solana/web3.js";
import { TuiDateTimePicker } from "nextjs-tui-date-picker";
import {
  openValueAverage,
  validateAndConvertValues,
  getAllTokens,
  Token,
  findTokenByAddress,
} from "@/lib/helpers";
import { ValueAverageProgram } from "solana-value-average";
import { conn } from "@/lib/constants";
import OpenVAOverview from "./components/OpenVAOverview";
import TokenModal from "./components/TokenModal";

const programClient = new ValueAverageProgram(conn, "mainnet-beta");

const HomePage: React.FC = () => {
  const [selectedTimeframe, setSelectedTimeframe] = useState("minute");
  const [selectedTimeframeInSec, setSelectedTimeframeInSec] = useState(60);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedDateTime, setSelectedDateTime] = useState(new Date());
  const { wallet, connected } = useUnifiedWallet();
  const [userValueAvg, setUserValueAvg] = useState<any[] | null>(null);
  const [tokenList, setTokenList] = useState<any[] | null>(null);
  const [defaultInputToken, setDefaultInputToken] = useState<Token | null>(
    null
  );
  const [selectedInputToken, setSelectedInputToken] = useState<Token | null>(
    null
  );

  useEffect(() => {
    const fetchTokenList = async () => {
      try {
        setTokenList(await getAllTokens());
      } catch (error) {
        console.error("Error fetching token list: ", error);
      }
    };

    fetchTokenList();
  }, []);

  useEffect(() => {
    if (tokenList) {
      const defaultInputToken = findTokenByAddress(
        tokenList,
        "So11111111111111111111111111111111111111112"
      );

      // Ensure that defaultInputToken is not undefined before setting the state
      if (defaultInputToken) {
        setDefaultInputToken(defaultInputToken);
      } else {
        setDefaultInputToken(null); // Provide a default value in case the token is not found
      }
    }
  }, [tokenList]);

  useEffect(() => {
    const fetchUserValueAvg = async () => {
      if (connected && wallet) {
        try {
          const fetchedUserValueAvg = await programClient.getCurrentByUser(
            wallet.adapter.publicKey!
          );
          // console.log(fetchedUserValueAvg[0].account);
          setUserValueAvg(fetchedUserValueAvg);
          // console.log(userValueAvg)
          // await getAllTokens();
        } catch (error) {
          console.error("Error fetching user value average:", error);
        }
      }
    };

    fetchUserValueAvg();
  }, [connected, wallet]);

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
    const parsedDate = new Date(newDateTime);
    setSelectedDateTime(parsedDate);
  };

  const handleTokenSelect = (selectedToken: Token) => {
    setSelectedInputToken(selectedToken);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

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
      totalValueIncrementString
    );

    const valueAverageData = {
      userPublicKey: wallet?.adapter.publicKey as PublicKey,
      inputToken: new PublicKey(formData.get("inputToken")!),
      outputToken: new PublicKey(formData.get("outputToken")!),
      orderInterval: BigInt(
        conversionResult!.orderIntervalValue * selectedTimeframeInSec
      ),
      deposit: conversionResult!.deposit,
      usdcValueIncrement: conversionResult!.valueIncrement,
      startDateTime: BigInt(selectedDateTime.getTime()),
    };

    console.log(valueAverageData);

    await openValueAverage(valueAverageData, wallet!);
  };

  return (
    <div className="flex flex-col items-center justify-center bg-base-100 h-screen">
      <div className="flex flex-col justify-center items-center bg-neutral rounded-lg w-[460px] h-[568px] my-5 shadow-md">
        <form
          onSubmit={handleSubmit}
          className="form-control justify-center w-full h-full px-2"
        >
          {/* input token field */}
          <div className="form-control w-full">
            <label className="label" htmlFor="inputToken">
              <span className="label-text">Input Token</span>
            </label>
            {/* <input
              type="text"
              name="inputToken"
              placeholder=""
              className="input input-bordered w-full"
            /> */}
            {defaultInputToken !== null && tokenList && (
              <TokenModal
                tokenList={tokenList}
                onSelectToken={handleTokenSelect}
                defaultToken={defaultInputToken}
              />
            )}
          </div>

          {/*output token field */}
          <div className="form-control w-full mt-2">
            <label className="label-text">
              <span className="label-text">Output Token</span>
            </label>
            <input
              type="text"
              name="outputToken"
              placeholder=""
              className="input input-bordered w-full"
            />
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

      <div id="displayOpened" className="flex flex-col w-[460px]">
        <div className="flex flex-row justify-start ">
          <button className="btn btn-sm mx-2">Active Value Avgs</button>
          <button className="btn btn-sm mx-2">Past Value Avgs</button>
        </div>

        <div className="collapse bg-base-200 mt-5">
          <input type="checkbox" />
          <div className="collapse-title text-sm font-medium flex flex-row justify-between">
            <div>Symbol</div>
            <div>Value</div>
            <div>Progress</div>
          </div>
          <div className="collapse-content">
            <div role="tablist" className="tabs tabs-bordered w-full">
              <input
                type="radio"
                name="my_tabs_1"
                role="tab"
                className="tab"
                aria-label="Overview"
              />
              <div role="tabpanel" className="tab-content p-5 flex flex-col">
                <div className="flex flex-row justify-between">
                  {userValueAvg ? (
                    <OpenVAOverview fetchedUserValueAvg={userValueAvg} />
                  ) : (
                    <p>Loading overview data...</p>
                  )}
                </div>
              </div>

              <input
                type="radio"
                name="my_tabs_1"
                role="tab"
                className="tab"
                aria-label="Orders"
              />
              <div role="tabpanel" className="tab-content p-10"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
