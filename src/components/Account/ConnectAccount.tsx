import { useAccount } from "@starknet-react/core";
import { Typography } from "antd";
import React, { useCallback, useState } from "react";
import { wallet_avatar } from "../../assets";
import { metaMask } from "../../connectors/metaMask";
import { walletConnect } from "../../connectors/walletConnect";
import { useWindowWidthAndHeight } from "../../hooks";
import { getEllipsisTxt } from "../../utils/formatters";
import ModalWallet from "../modal-wallet";

interface WantedChain {
  chain?: number;
}

const ConnectAccount: React.FC<WantedChain> = () => {
  const { address } = useAccount();
  const { isMobile } = useWindowWidthAndHeight();
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);

  const disconnect = useCallback(async () => {
    const connector = metaMask || walletConnect;
    setIsModalVisible(false);
    setIsAuthModalOpen(false);
    localStorage.removeItem("connectorId");
    if (connector.deactivate) {
      connector.deactivate();
    } else {
      connector.resetState();
    }
    // @ts-expect-error close can be returned by wallet
    if (connector && connector.close) {
      // @ts-expect-error close can be returned by wallet
      await connector.close();
    }
  }, []);

  return (
    <div className="h-[56px]">
      {address === undefined ? (
        <div
          className="flex justify-center items-center gap-2 py-[18px] px-6 h-[56px] bg-[#773030] cursor-pointer"
          onClick={() => setIsAuthModalOpen(true)}
        >
          <WalletIcon />
          <Typography className="text-base font-medium leading-[24px] font-['Montserrat']">
            Connect Wallet
          </Typography>
          {isAuthModalOpen && (
            <ModalWallet
              isShowing={isAuthModalOpen}
              hide={setIsAuthModalOpen}
            />
          )}
          <br />
        </div>
      ) : (
        <>
          <div
            className="flex justify-center items-center gap-3 py-2 pl-2 pr-6 h-[56px] bg-[#1E1E1E]"
            onClick={() => setIsModalVisible(true)}
          >
            <img src={wallet_avatar} alt="" />
            <span className="text-base font-medium leading-[24px] text-white font-['Montserrat']">
              {address && typeof address === "string" && (
                <Typography className="mr-[5px]">
                  {getEllipsisTxt(address, isMobile ? 3 : 6)}
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

export default ConnectAccount;
