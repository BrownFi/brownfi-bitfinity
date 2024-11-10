import { useAccount } from "@starknet-react/core";
import { Typography } from "antd";
import { Token, TokenAmount } from "l0k_swap-sdk";
import { useState } from "react";
import { Link } from "react-router-dom";
import { num } from "starknet";
import { PoolState, getAllPairLength, getPoolInfo } from "state/liquidity";
import { useWeb3Store } from "stores/web3";
import useSWR from "swr";
import { twMerge } from "tailwind-merge";
import ConnectAccount from "../../../components/Account/ConnectAccount";
import {
  APP_CHAIN_ID,
  Field,
  SN_RPC_PROVIDER,
  TOKEN_LIST,
  getTokenIcon,
} from "../../../configs";
import { ActiveIcon, InboxIcon, PlusIcon, ShareIcon } from "./icons";
import { formatUnits, parseUnits } from "ethers/lib/utils";
import { useAccountState } from "stores/address";
import ConnectAccountICP from "components/Account/ConnectAccountICP";

const Pools = () => {
  const { address, isConnected } = useAccount();
  const web3State = useWeb3Store();
  const web3StateAccount = useAccountState();

  const [tokens, setTokens] = useState<{
    [key in Field]: Token | undefined;
  }>({
    [Field.INPUT]: TOKEN_LIST[APP_CHAIN_ID][0],
    [Field.OUTPUT]: TOKEN_LIST[APP_CHAIN_ID][1],
  });

  const [hide, setHide] = useState<boolean>(false);

  const data1 = hide
    ? mockPools().filter((item) => item.status !== "Close")
    : mockPools();

  const { data } = useSWR<{
    balances: (TokenAmount | undefined)[];
    poolInfo: PoolState | undefined;
    allPairLength: number | undefined;
  }>(
    [address, tokens[Field.INPUT], tokens[Field.OUTPUT], web3State.txHash],
    async () => {
      if (!address || !isConnected)
        return {
          balances: [],
          poolInfo: undefined,
          allPairLength: undefined,
        };
      const provider = SN_RPC_PROVIDER();
      const balances = await Promise.all(
        [tokens[Field.INPUT], tokens[Field.OUTPUT]].map(async (t) => {
          if (!address || !t) return undefined;
          const res = await provider.callContract({
            contractAddress: t.address,
            entrypoint: "balanceOf",
            calldata: [address],
          });
          return new TokenAmount(t, num.hexToDecimalString(res.result[0]));
        })
      );

      const poolInfo = await getPoolInfo(address, provider, [
        tokens[Field.INPUT],
        tokens[Field.OUTPUT],
      ]);

      const allPairLength = await getAllPairLength(provider);

      return {
        balances,
        poolInfo,
        allPairLength,
      };
    }
  );

  return (
    <>
      <div className="flex flex-col items-start w-[894px]">
        <div className="flex flex-col items-center self-stretch gap-6">
          <div className="flex items-center self-stretch">
            <span className="text-2xl font-['Russo_One'] leading-[29px]">
              Pools
            </span>
          </div>
          <div className="flex flex-col items-center gap-4">
            <InboxIcon />
            <Typography
              style={{
                textShadow:
                  "0px 4px 4px rgba(0, 0, 0, 0.25), 0px 4px 4px rgba(0, 0, 0, 0.25)",
              }}
              className="text-base text-[rgba(255,255,255,0.5)] font-medium leading-[24px] text-center max-w-[288px] font-['Montserrat']"
            >
              Your active liquidity position will appear here.
            </Typography>
          </div>
        </div>
        <div className="flex justify-center w-full my-[10px]">
          <Link
            to="/liquidity"
            className="flex py-[18px] px-6 justify-center items-center gap-2 bg-[#773030]"
          >
            <PlusIcon />
            <Typography className="text-base font-bold font-['Montserrat']">
              New Position
            </Typography>
          </Link>
        </div>
        {/* {!web3StateAccount.address ? (
          <ConnectAccountICP />
        ) : (
          <Link
            to="/liquidity"
            className="flex py-[18px] px-6 justify-center items-center gap-2 bg-[#773030]"
          >
            <PlusIcon />
            <Typography className="text-base font-bold font-['Montserrat']">
              New Position
            </Typography>
          </Link>
        )} */}
        <div className="flex flex-col justify-center items-center py-3 gap-[2px] self-stretch bg-[#323038]">
          <div className="flex items-center gap-1">
            <Typography className="text-sm font-medium font-['Montserrat']">
              Learn about providing liquidity
            </Typography>
            <ShareIcon />
          </div>
          <div className="flex items-center gap-1">
            <Typography className="text-xs font-medium text-[rgba(255,255,255,0.5)] font-['Montserrat']">
              Check out BrownFi parameter concept
            </Typography>
          </div>
        </div>
      </div>
    </>
  );
};

type Status = "Active" | "Close";

interface IPool {
  address: string;

  token0: any;

  token1: any;

  parameter: number;

  currentPrice: number;

  accruedFee: number;

  status: Status;
}

export const mockPools = (): IPool[] => [
  {
    address: "123456",
    token0: "0x49d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7",
    token1: "0x4718f5a0fc34cc1af16a1cdee98ffb20c31f5cd61d6ab07201858f4287c938d",
    parameter: 1.1,
    currentPrice: 0.05,
    accruedFee: 0.3,
    status: "Active",
  },
];

export default Pools;
