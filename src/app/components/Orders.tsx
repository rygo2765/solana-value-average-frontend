"use client";
import { PublicKey } from "@solana/web3.js";
import { useState, useEffect } from "react";
import { programClient } from "@/lib/constants";
import { Token } from "@/lib/helpers";

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

interface OrdersProps {
  inTokenData: Token;
  outTokenData: Token;
  fillEvents: FillEvent[];
}

const Orders: React.FC<OrdersProps> = ({
  inTokenData,
  outTokenData,
  fillEvents,
}) => {
  console.log(fillEvents);

  return (
    <div className="flex flex-col w-full justify-start">
      <div className="flex flex-row justify-start text-xs text-white">
        <span className="w-[20%]">From</span>
        <span className="w-[18%]">Rate</span>
        <span className="w-[20%]">To</span>
        <span className="w-[42%]">Date/Time</span>
      </div>
      {fillEvents.map((fillEvent, index) => (
        <div
          key={index}
          className="flex flex-row justify-start w-full text-xs items-center mt-3"
        >
          <div className="flex flex-row items-center w-[20%]">
            <p className="w-1/2">
              {(
                Number(fillEvent.inputAmount) /
                10 ** inTokenData.decimals
              ).toFixed(4)}
            </p>
            <img
              className="w-5 h-5 rounded-full ml-1"
              src={inTokenData.logoURI}
              alt={inTokenData.symbol}
            />
          </div>

          <p className="w-[18%]">
            {(
              Number(fillEvent.outputAmount) /
              10 ** outTokenData.decimals /
              (Number(fillEvent.inputAmount) / 10 ** inTokenData.decimals)
            ).toFixed(2)}
          </p>

          <div className="flex flex-row items-center w-[20%]">
            <p className="w-1/2">
              {(
                Number(fillEvent.outputAmount) /
                10 ** outTokenData.decimals
              ).toFixed(4)}
            </p>
            <img
              className="w-5 h-5 rounded-full ml-1"
              src={outTokenData.logoURI}
              alt={outTokenData.symbol}
            />
          </div>

          <div className="flex flex-row items-center w-[42%]">
            <p>{fillEvent.confirmedAt.toLocaleString()}</p>
            <a
              target="_blank"
              href={`https://solscan.io/account/${fillEvent.txSignature}`}
              className=" ml-2 relative z-10"
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
        </div>
      ))}
    </div>
  );
};

export default Orders;
