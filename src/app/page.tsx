"use client";
import React, { useState, useEffect } from "react";
import { ValueAverageProgram } from "solana-value-average";
import { useUnifiedWallet } from "@jup-ag/wallet-adapter";
import { conn } from "@/lib/constants";
import { PublicKey } from "@solana/web3.js";
import { TuiDateTimePicker } from "nextjs-tui-date-picker";

const programClient = new ValueAverageProgram(conn, "mainnet-beta");

const HomePage: React.FC = () => {
  const [selectedTimeframe, setSelectedTimeframe] = useState("minute");
  const [selectedTimeframeInSec, setSelectedTimeframeInSec] = useState(60);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedDateTime, setSelectedDateTime] = useState(new Date());

  useEffect(() => {
    console.log("Selected time frame", selectedTimeframe);
  }, [selectedTimeframe]);

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
    console.log(typeof selectedDateTime);
    const parsedDate = new Date(newDateTime);
    console.log(typeof parsedDate);
    setSelectedDateTime(parsedDate);
    // setSelectedDateTime(newDateTime);
  };

  const { wallet, connected } = useUnifiedWallet();
  if (connected) {
    console.log(wallet?.adapter.publicKey?.toBase58());
  }

  const openValueAverage = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const formData = new FormData(e.target as HTMLFormElement);
   

    const orderIntervalValue = parseInt(formData.get("orderIntervalValue") as string);
    console.log(orderIntervalValue * selectedTimeframeInSec)

    // const valueAverageData = {
    //   userPublicKey: wallet?.adapter.publicKey as PublicKey,
    //   inputToken: new PublicKey(formData.get("inputToken")!),
    //   outputToken: new PublicKey(formData.get("outputToken")!),
    //   orderInterval: orderIntervalValue * selectedTimeframeInSec,
    // };



    // console.log("Selected time frame", selectedTimeframe);
    // console.log(typeof selectedDateTime)
    // const unix = selectedDateTime.getTime()
    // console.log(unix)

    // const userPublicKey = wallet?.adapter.publicKey as PublicKey;
    // const inputToken = new PublicKey(
    //   "So11111111111111111111111111111111111111112"
    // );
    // const outputToken = new PublicKey(
    //   "J1toso1uCk3RLmjorhTtrVwY9HJ7X8V9yYac6Y7kGCPn"
    // );
    // const orderInterval = BigInt(60 * 60 * 24);
    // const deposit = BigInt(0.2 * 10 ** 9);
    // const tokenValueIncrement = BigInt(0.01 * 10 ** 9);
    // const startAtUnix = BigInt(1741340800);

    // const {ix: ixs, pda} = await programClient.open(
    //   userPublicKey,
    //   userPublicKey,
    //   inputToken,
    //   outputToken,
    //   orderInterval,
    //   deposit,
    //   tokenValueIncrement,
    //   undefined,
    //   undefined
    // )

    // console.log(ixs)
    // console.log(pda)
  };

  return (
    <div className="flex flex-col items-center justify-center bg-base-100 h-screen">
      <div className="flex flex-col justify-center items-center bg-neutral rounded-lg w-1/3 h-full my-10 shadow-md">
        <form
          onSubmit={openValueAverage}
          className="form-control w-full h-full px-2"
        >
          {/* input token field */}
          <div className="form-control w-full">
            <label className="label" htmlFor="inputToken">
              <span className="label-text">Input Token</span>
            </label>
            <input
              type="text"
              name="inputToken"
              placeholder=""
              className="input input-bordered w-full"
            />
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
                value={1}
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
              type="number"
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
              type="number"
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
    </div>
  );
};

export default HomePage;
