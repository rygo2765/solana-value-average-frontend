"use client"
import { UnifiedWalletProvider, UnifiedWalletButton } from "@jup-ag/wallet-adapter";
import { IWalletNotification } from "@jup-ag/wallet-adapter/dist/types/contexts/WalletConnectionProvider";

const App = () => {
  const WalletNotification = {
    onConnect: (props: IWalletNotification) => {
      // handle connect notification
      console.log('Received wallet notification:', props);
      return null;
    },
    onConnecting: (props: IWalletNotification) => {
      // handle connecting notification
      console.log('Received wallet notification:', props);
      return null;
    },
    onDisconnect: (props: IWalletNotification) => {
      // handle disconnect notification
      console.log('Received wallet notification:', props);
      return null;
    },
    onNotInstalled: (props: IWalletNotification) => {
      // handle not installed notification
      console.log('Received wallet notification:', props);
      return null;
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

export default App;