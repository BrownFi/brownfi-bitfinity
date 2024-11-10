import { UnsupportedChainIdError } from "@web3-react/core";
import { NoEthereumProviderError } from "@web3-react/injected-connector";
import { useCallback, useEffect, useState, useRef } from "react";
import { setupDefaultNetwork } from "../evm/utils/web3React";
import { useActiveWeb3React } from "./useActiveWeb3React";
import { CHAIN_ID } from "../evm/utils/web3React";

export const useWallet = () => {
  const { activate, deactivate, error, chainId } = useActiveWeb3React();

  const chainIdRef = useRef();
  const [currentConnector, setCurrentConnector] = useState();
  const [refresh, setRefresh] = useState(false);

  useEffect(() => {
    const catchError = async () => {
      if (chainId && chainIdRef.current && chainId != chainIdRef.current) {
        const hasSetup = await setupDefaultNetwork(chainIdRef.current);
        hasSetup && currentConnector && activate(currentConnector);
      }
      if (!error || !currentConnector || !activate || !chainIdRef.current)
        return;
      let errorMessage;
      if (error instanceof UnsupportedChainIdError) {
        const hasSetup = await setupDefaultNetwork(chainIdRef.current);
        hasSetup && currentConnector && activate(currentConnector);
      } else if (error instanceof NoEthereumProviderError) {
        errorMessage =
          "NoEthereumProviderError: Please install metamask extension or visit website in app which has ethereum provider.";
      } else {
        errorMessage = "Error connect";
      }
      errorMessage && alert(errorMessage);
    };

    catchError();
  }, [error, activate, currentConnector, chainId, refresh]);

  const connect = useCallback(
    async (connector, _chainId = CHAIN_ID.ZETA_TESTNET) => {
      chainIdRef.current = _chainId;
      setCurrentConnector(connector);
      setRefresh((pre) => !pre);
      activate(connector);
    },
    [activate, chainIdRef]
  );

  const disconnect = useCallback(() => {
    deactivate();
  }, [deactivate]);

  return {
    connect,
    disconnect,
    error,
  };
};
