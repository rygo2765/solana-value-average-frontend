"use client"
import React from "react";
import { UnifiedWalletProvider, UnifiedWalletButton } from "@jup-ag/wallet-adapter";
import { IWalletNotification } from "@jup-ag/wallet-adapter/dist/types/contexts/WalletConnectionProvider";
import { toast } from "sonner";

const WalletAdapter: React.FC = () => {
  const WalletNotification = {
    onConnect: (props: IWalletNotification) => {
      toast.success(
        <div className="flex flex-col bg-green-100 w-full p-4">
          <span className="font-semibold">Wallet Connected</span>
          <span className="text-xs text-black">{`Connected to wallet ${props.shortAddress}`}</span>
        </div>,
         {
          style: {
            padding: 0,
            margin: 0,
          }
        });
    },
    onConnecting: (props: IWalletNotification) => {
      toast.message(
        <div className="flex flex-col p-4">
          <span className="font-semibold">Connecting to {props.walletName}</span>
        </div>,
         {
          style: {
            padding: 0,
            margin: 0,
          }
        });
    },
    onDisconnect: (props: IWalletNotification) => {
      toast.message(
        <div className="flex flex-col p-4">
          <span className="font-semibold">Disconnected from {props.walletName}</span>
          <span className="text-xs text-black">{`Disconnected from wallet ${props.shortAddress}`}</span>
        </div>,
         {
          style: {
            padding: 0,
            margin: 0,
          }
        });
    },
    onNotInstalled: (props: IWalletNotification) => {
      toast.error(
        <div className="flex flex-col bg-red-100 w-full p-4">
          <span className="font-semibold">{props.walletName} Wallet is not installed</span>
          <span>
            {`Please go to the provider`}{' '}
            <a target="_blank" rel="noopener noreferrer" className="underline font-bold" href={props.metadata.url}>
              {`website`}
            </a>{' '}
            {`to download`}
            </span>
        </div>,
        {
          style:{
            padding: 0,
            margin: 0,
          }
        }
      )
    },
  };

  return (
    <UnifiedWalletProvider
      wallets={[]}
      config={{
        autoConnect: false,
        env: "mainnet-beta",
        metadata: {
          name: "UnifiedWallet",
          description: "UnifiedWallet",
          url: "https://jup.ag",
          iconUrls: ["https://jup.ag/favicon.ico"],
        },
        notificationCallback: WalletNotification,
        walletlistExplanation: {
          href: "https://station.jup.ag/docs/additional-topics/wallet-list",
        },
        theme: "dark",
        lang: "en",
      }}
    >
      <UnifiedWalletButton />
    </UnifiedWalletProvider>
  );
};

export default WalletAdapter;