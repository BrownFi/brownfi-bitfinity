import { useEffect, useState } from "react";

import type { BigNumber } from "@ethersproject/bignumber";
import type { Web3ReactHooks } from "@web3-react/core";
import { num } from "starknet";

export const useNativeBalance = (
  provider?: ReturnType<Web3ReactHooks["useProvider"]>,
  account?: string
): BigNumber | undefined => {
  const [balance, setBalance] = useState<BigNumber | undefined>();

  useEffect(() => {
    if (provider && account?.length) {
      const fetchBalance = async (account: string) => {
        const res: BigNumber | undefined = await provider?.getBalance(account);
        setBalance(res);
      };

      fetchBalance(account);
    }
  }, [provider, account]);

  return balance;
};

export const useGetBalance = (
  provider: any,
  account: string | undefined,
  contractAddress: string | undefined
) => {
  const [balance, setBalance] = useState<any>();

  useEffect(() => {
    if (provider && account?.length && contractAddress) {
      const fetchBalance = async (account: string) => {
        const res =
        await provider.callContract({
          contractAddress: contractAddress,
          entrypoint: "balanceOf",
          calldata: [account],
        });
        const balance=  num.hexToDecimalString(
          res.result[0]
        )
        setBalance(balance);
      };

      fetchBalance(account);
    }
  }, [provider, account , contractAddress]);

  return balance;
};



