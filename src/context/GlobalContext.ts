import { createContext, useContext } from "react";

import { WALLET_TYPES } from "./types";

// init state
export const initState = {
  walletType: WALLET_TYPES.STARKNET,
  wallet: undefined,
  walletAddress: "",
  setWalletConnected: (wallet: string, address: any, walletType: string) => {},
};

// create context
export const GlobalContext = createContext(initState);

export const useGlobalContext = () => useContext(GlobalContext);
