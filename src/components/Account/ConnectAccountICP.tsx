import { Typography } from "antd";
import React, { useEffect, useMemo, useState } from "react";
import { wallet_avatar } from "../../assets";
import { getEllipsisTxt } from "../../utils/formatters";
import { useWindowWidthAndHeight } from "hooks";
import { useAccountState } from "stores/address";

declare const window: any;

const ConnectAccountICP: React.FC = () => {
  const { isMobile } = useWindowWidthAndHeight();
  const web3State = useAccountState();
  const canisterId = [
    "bd3sg-teaaa-aaaaa-qaaba-cai",
    "ryjl3-tyaaa-aaaaa-aaaba-cai",
  ]; // canister IDs
  const whitelist = useMemo(() => canisterId, []);
  const [principal, setPrincipal] = useState("");
  const [account, setAccount] = useState("");
  const [isConnected, setIsConnected] = useState(false);
  const [useAssets, setUserAssets] = useState([]);

  // connect to wallet if not connected
  const connect = async () => {
    try {
      await window.ic.infinityWallet.requestConnect({
        whitelist,
      });
      const principalId = await window.ic.infinityWallet.getPrincipal();
      const accountId = await window.ic.infinityWallet.getAccountID();
      const assets = await window.ic.infinityWallet.getUserAssets();
      setPrincipal(`${principalId}`);
      setAccount(accountId);
      setUserAssets(assets);
      setIsConnected(true);
      useAccountState.setState({
        ...web3State,
        address: account,
      });
    } catch (error) {
      console.log("Failed to connect wallet.");
      console.error("Connection failed:", error);
      setIsConnected(false);
    }
  };

  useEffect(() => {
    // persist connection
    const verifyConnection = async () => {
      const connected = await window.ic.infinityWallet.isConnected();

      if (connected) {
        try {
          const principalId = await window.ic.infinityWallet.getPrincipal();
          const accountId = await window.ic.infinityWallet.getAccountID();
          const assets = await window.ic.infinityWallet.getUserAssets();
          setPrincipal(`${principalId}`);
          setAccount(accountId);
          setUserAssets(assets);
          setIsConnected(true);
          useAccountState.setState({
            ...web3State,
            address: account,
          });
        } catch (e) {
          console.error(e);
        }
      } else {
        setIsConnected(false);
      }
    };

    verifyConnection();
  }, [whitelist]);

  return (
    <div className="h-[56px]">
      {!account ? (
        <div
          className="flex justify-center items-center gap-2 py-[18px] px-6 h-[56px] bg-[#773030] cursor-pointer"
          onClick={() => {
            connect();
          }}
        >
          <WalletIcon />
          <Typography className="text-base font-medium leading-[24px] font-['Montserrat']">
            Connect Wallet
          </Typography>
          <br />
        </div>
      ) : (
        <>
          <div className="flex justify-center items-center gap-3 py-2 pl-2 pr-6 h-[56px] bg-[#1E1E1E]">
            <img src={wallet_avatar} alt="" />
            <span className="text-base font-medium leading-[24px] text-white font-['Montserrat']">
              {account && typeof account === "string" && (
                <Typography className="mr-[5px]">
                  {getEllipsisTxt(account, isMobile ? 3 : 6)}
                </Typography>
              )}
            </span>
          </div>
        </>
      )}
    </div>
  );
};

const WalletIcon = () => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
    >
      <g clipPath="url(#clip0_2243_760)">
        <path
          d="M21 18V19C21 20.1 20.1 21 19 21H5C3.89 21 3 20.1 3 19V5C3 3.9 3.89 3 5 3H19C20.1 3 21 3.9 21 5V6H12C10.89 6 10 6.9 10 8V16C10 17.1 10.89 18 12 18H21ZM12 16H22V8H12V16ZM16 13.5C15.17 13.5 14.5 12.83 14.5 12C14.5 11.17 15.17 10.5 16 10.5C16.83 10.5 17.5 11.17 17.5 12C17.5 12.83 16.83 13.5 16 13.5Z"
          fill="white"
        />
      </g>
      <defs>
        <clipPath id="clip0_2243_760">
          <rect width="24" height="24" fill="white" />
        </clipPath>
      </defs>
    </svg>
  );
};

export default ConnectAccountICP;
