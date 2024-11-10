import { useAccount } from "@starknet-react/core";
import { Input, notification, Skeleton, Typography } from "antd";
import BigInt from "big-integer";
import {
  APP_CHAIN_ID,
  Field,
  SN_RPC_PROVIDER,
  TOKEN_LIST,
  getTokenIcon,
} from "configs";
import { parseUnits } from "ethers/lib/utils";
import { Token, TokenAmount } from "l0k_swap-sdk";
import { useCallback, useEffect, useMemo, useState } from "react";
import { num } from "starknet";
import {
  getOraclePriceOf,
  swapCallback,
  useDerivedSwapInfo,
  useGetAmount,
} from "state/swap";
import { useWeb3Store } from "stores/web3";
import useSWR from "swr";
import { twMerge } from "tailwind-merge";
import ConfirmSwapModal from "../../../components/confirm-swap-modal/ConfirmSwapModal";
import SelectTokenModal from "../../../components/select-token-modal/SelectTokenModal";
import SettingChartModal from "../../../components/settings-modal/SettingModalChart";
import InvalidButton from "./InvalidButton";
import { SwapButton } from "./SwapButton";
import { bitfinity, icp } from "assets";

export const mocktoken = [
  {
    address: "",
    symbol: "BTF",
    decimal: 18,
    logo: bitfinity,
  },
  {
    address: "",
    symbol: "ICP",
    decimal: 18,
    logo: icp,
  },
];

declare const window: any;

const SwapPage = () => {
  const [isShowSettingModal, setIsShowSettingModal] = useState<boolean>(false);
  const [isShowTokenModal, setIsShowTokenModal] = useState<boolean>(false);
  const [isShowConfirmSwap, setIsShowConfirmSwap] = useState<boolean>(false);
  const [typeModal, setTypeModal] = useState<number>(1);

  const { account, address, isConnected } = useAccount();
  const web3State = useWeb3Store();
  const provider = SN_RPC_PROVIDER();

  const [tokens, setTokens] = useState<{
    [key in Field]: Token | undefined;
  }>({
    [Field.INPUT]: TOKEN_LIST[APP_CHAIN_ID][0],
    [Field.OUTPUT]: TOKEN_LIST[APP_CHAIN_ID][1],
  });

  const [typedValue, setTypedValue] = useState("");
  const [independentField, setIndependentField] = useState<Field>(Field.INPUT);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const [isMaxReserve, setIsMaxReserve] = useState(false);
  const [disabledMultihops, setDisabledMultihops] = useState<boolean>(false);

  const { data: balances } = useSWR<(TokenAmount | undefined)[]>(
    [address, tokens[Field.INPUT], tokens[Field.OUTPUT]],
    async () => {
      if (!address) return [];
      return Promise.all(
        [tokens[Field.INPUT], tokens[Field.OUTPUT]].map(async (t) => {
          if (!t) return undefined;
          const res = await provider.callContract({
            contractAddress: t.address,
            entrypoint: "balanceOf",
            calldata: [address],
          });
          return new TokenAmount(t, num.hexToDecimalString(res.result[0]));
        })
      );
    }
  );

  const { data: oraclePrice } = useSWR(
    [tokens[Field.INPUT], tokens[Field.OUTPUT]],
    async () => {
      const tokenA = tokens[Field.INPUT];
      const tokenB = tokens[Field.OUTPUT];
      if (!tokenA || !tokenB) {
        return;
      }
      try {
        const oraclePrice = await getOraclePriceOf(provider, [tokenA, tokenB]);
        return {
          oraclePriceTokenA:
            Number(
              num.hexToDecimalString(oraclePrice.oraclePriceTokenA.result[0])
            ) / 1e8,
          oraclePriceTokenB:
            Number(
              num.hexToDecimalString(oraclePrice.oraclePriceTokenB.result[0])
            ) / 1e8,
        };
      } catch (error) {
        console.log(error);
        throw error;
      }
    }
  );

  const [debouncedTypedValue, setDebouncedTypedValue] = useState("");
  const { data: trade, isLoading: isLoadingTrade } = useSWR(
    [
      account,
      tokens[Field.INPUT],
      tokens[Field.OUTPUT],
      debouncedTypedValue,
      independentField,
      disabledMultihops,
      web3State.txHash,
    ],
    () =>
      !account || balances === undefined
        ? undefined
        : useDerivedSwapInfo({
            library: account!,
            independentField,
            typedValue: debouncedTypedValue,
            tokens,
            singlehops: disabledMultihops,
          })
  );

  const [amount, setAmount] = useState<null | string>();

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedTypedValue(typedValue);
    }, 500);

    return () => {
      clearTimeout(handler);
    };
  }, [typedValue, 500]);

  useEffect(() => {
    (async () => {
      if (!account) return;
      try {
        const amount = await useGetAmount({
          library: account!,
          independentField,
          typedValue: debouncedTypedValue,
          tokens,
        });
        setAmount(amount);
        setIsMaxReserve(false);
      } catch (error: any) {
        const regex = /Failure reason:\s*(0x[a-fA-F0-9]+)\s*\(.*?\)/;
        const match = (error?.message ?? "").match(regex);
        if (match) {
          setIsMaxReserve(true);
          console.log(match[0]);
        } else {
          console.log(error);
        }
      }
    })();
  }, [
    account,
    tokens[Field.INPUT],
    tokens[Field.OUTPUT],
    debouncedTypedValue,
    independentField,
    web3State.txHash,
  ]);

  const handleChangeAmounts = (value: string, independentField: Field) => {
    if (isNaN(+value)) return;
    setTypedValue(value);
    setIndependentField(independentField);
  };

  useEffect(() => {
    (async () => {
      // Connect to the wallet
      await window.ic.infinityWallet.requestConnect({
        whitelist: [],
      });

      // Get the current wallet user's list of tokens
      const assets = await window.ic.infinityWallet.getUserAssets();
    })();
  }, []);

  let title = "Invalid amount!";
  const isDisableBtn: boolean = useMemo(() => {
    if (isMaxReserve) {
      title = "Max 90% reserve!";
      return true;
    }
    if (
      !trade ||
      !balances?.[0] ||
      !balances?.[1] ||
      !tokens[Field.INPUT] ||
      !typedValue
    ) {
      title = "Invalid amount!";
      return true;
    }
    const isExactIn = independentField === Field.INPUT;
    const input = isExactIn
      ? parseUnits(typedValue, tokens[Field.INPUT]?.decimals).toString()
      : parseUnits(typedValue, tokens[Field.OUTPUT]?.decimals).toString();
    const balance = isExactIn
      ? balances?.[0].raw.toString()
      : balances?.[1].raw.toString();
    if (BigInt(input) > BigInt(balance)) {
      title = "Insufficient balance!";
      return true;
    }
    return false;
  }, [trade, balances]);

  const tradePrice = useMemo(() => {
    if (!amount) {
      return;
    }
    return (
      Number(
        independentField === Field.OUTPUT
          ? typedValue
          : parseFloat(amount?.toString() ?? "")
      ) /
      Number(
        independentField === Field.INPUT
          ? typedValue
          : parseFloat(amount?.toString() ?? "")
      )
    );
  }, [amount]);

  const oraclePriceRate = useMemo(() => {
    if (!oraclePrice) {
      return;
    }
    return (
      Number(oraclePrice?.oraclePriceTokenA) /
      Number(oraclePrice?.oraclePriceTokenB)
    );
  }, [oraclePrice, tokens[Field.INPUT], tokens[Field.OUTPUT]]);

  const slippageEstimation = useMemo(() => {
    if (!tradePrice || !oraclePriceRate) {
      return;
    }
    return (tradePrice / oraclePriceRate - 1) * 100;
  }, [tradePrice, oraclePriceRate]);

  const onSwapCallback = useCallback(async () => {
    try {
      if (!slippageEstimation) {
        return;
      }
      setSubmitting(true);

      const tx = await swapCallback(
        account,
        address,
        trade,
        slippageEstimation,
        amount,
        independentField,
        typedValue
      );
      useWeb3Store.setState({
        ...web3State,
        txHash: tx?.transaction_hash,
      });
      setSubmitting(false);
      setIsSuccess(true);
      setTypedValue("");
      notification.success({
        description: tx?.transaction_hash,
        message: "Transactions successfully",
      });
    } catch (error) {
      console.error(error);
      setSubmitting(false);
    }
  }, [account, address, trade, slippageEstimation]);

  return (
    <div className="flex w-[500px] flex-col items-end justify-center bg-[#1D1C21] gap-8 p-8">
      <div className="flex items-center self-stretch justify-between">
        <span className="text-2xl font-normal text-white font-['Russo_One']">
          Swap Token
        </span>
        <div
          className="flex items-center p-2 bg-[#131216] cursor-pointer"
          onClick={() => setIsShowSettingModal(true)}
        >
          <SettingIcon />
        </div>
      </div>
      <div className="flex flex-col items-center w-full gap-2">
        <div className="flex flex-col items-start gap-5 self-stretch bg-[#131216] p-4">
          <div className="flex items-center self-stretch justify-between">
            <span className="text-lg font-normal text-white font-['Russo_One']">
              You Pay
            </span>
            {/* <div className="flex items-center gap-1 text-base font-normal">
              <Typography>Balance:</Typography>
              <Typography>{balances?.[0]?.toSignificant(3)}</Typography>
            </div> */}
          </div>
          <div className="flex flex-col items-start gap-[2px] self-stretch">
            <div className="flex items-center self-stretch justify-between">
              <div className="flex items-center self-stretch justify-between">
                <Input
                  placeholder="0.0"
                  className="border-none px-0 text-xl font-bold max-w-[150px] text-[#C6C6C6]"
                  value={
                    independentField === Field.INPUT ? typedValue : amount ?? ""
                  }
                  onChange={(e) =>
                    handleChangeAmounts(e.target.value, Field.INPUT)
                  }
                />
              </div>
              <div
                className="flex justify-between items-center bg-[#1D1C21] py-[7px] px-3 cursor-pointer shadow-[0_2px_12px_0px_rgba(11,14,25,0.12)] w-[153px]"
                onClick={() => {
                  setTypeModal(1);
                  setIsShowTokenModal(true);
                }}
              >
                <div className="flex items-center gap-2">
                  <img src={mocktoken[1].logo} alt="" className="w-5 h-5" />
                  <Typography className="text-sm font-medium">
                    {mocktoken[1].symbol}
                  </Typography>
                </div>
                <ArrowDown />
              </div>
            </div>
            {/* <div className="flex items-center gap-1 text-sm font-medium text-[rgba(255,255,255,0.50)]">
              <Typography>
                {!!trade
                  ? `~${
                      Number(trade?.inputAmount.toSignificant(2)) *
                      Number(trade?.executionPrice.toSignificant(2))
                    }`
                  : "--"}
              </Typography>
            </div> */}
          </div>
        </div>
        <SwapIcon
          handleChangeToken={() => {
            setTokens({
              [Field.INPUT]: tokens[Field.OUTPUT],
              [Field.OUTPUT]: tokens[Field.INPUT],
            });
          }}
        />
        {/* To */}
        <div className="flex flex-col items-start gap-5 self-stretch bg-[#131216] p-4">
          <div className="flex items-center self-stretch justify-between">
            <span className="text-lg font-normal text-white font-['Russo_One']">
              Your Receive
            </span>
            {/* <div className="flex items-center gap-1 text-base font-normal">
              <Typography>Balance:</Typography>
              <Typography>{balances?.[1]?.toSignificant(3)}</Typography>
            </div> */}
          </div>
          <div className="flex flex-col items-start gap-[2px] self-stretch">
            <div className="flex items-center self-stretch justify-between">
              <div className="flex items-center self-stretch justify-between">
                <Input
                  placeholder="0.0"
                  className={twMerge(
                    "border-none px-0 text-xl max-w-[150px] font-medium text-[#27E3AB]",
                    isLoadingTrade && "hidden"
                  )}
                  value={
                    independentField === Field.OUTPUT
                      ? typedValue
                      : amount ?? ""
                  }
                  onChange={(e) =>
                    handleChangeAmounts(e.target.value, Field.OUTPUT)
                  }
                />
                <Skeleton.Input
                  className={!isLoadingTrade ? "!hidden" : ""}
                  active
                  size="small"
                />
              </div>
              <div
                className="flex justify-between items-center bg-[#1D1C21] py-[7px] px-3 cursor-pointer shadow-[0_2px_12px_0px_rgba(11,14,25,0.12)] w-[153px]"
                // onClick={() => {
                //   setTypeModal(2);
                //   setIsShowTokenModal(true);
                // }}
              >
                <div className="flex items-center gap-2">
                  <img src={mocktoken[0].logo} alt="" className="w-5 h-5" />
                  <Typography className="text-sm font-medium">
                    {mocktoken[0].symbol}
                  </Typography>
                </div>
                <ArrowDown />
              </div>
            </div>
          </div>
        </div>
        {/* <Collapse
          expandIconPosition={"end"}
          bordered={false}
          className="rounded-none bg-[#131216]"
          items={[
            {
              key: "1",
              label: (
                <div className="flex items-center self-stretch justify-between text-sm font-medium">
                  <div className="flex items-center">
                    <Typography>
                      {!!trade
                        ? `1 ${tokens[Field.INPUT]?.symbol} =
							${trade.executionPrice.toSignificant(4)}
							${tokens[Field.OUTPUT]?.symbol}`
                        : "--"}
                    </Typography>
                  </div>
                  <div className="flex items-center gap-2">
                    <GasIcon />
                    <Typography>-</Typography>
                  </div>
                </div>
              ),
              children: (
                <div className="flex flex-col items-start self-stretch gap-3 text-sm font-medium">
                  <div className="flex items-center self-stretch justify-between">
                    <Typography>Price impact</Typography>
                    <Typography>
                      {trade?.priceImpact.toSignificant(2)}%
                    </Typography>
                  </div>
                  <div className="flex items-center self-stretch justify-between">
                    <Typography>Max. slippage</Typography>
                    <Typography>0.5%</Typography>
                  </div>
                  <div className="flex items-center self-stretch justify-between">
                    <Typography>Network cost</Typography>
                    <Typography>-</Typography>
                  </div>
                  <div className="flex items-center self-stretch justify-between">
                    <Typography>Route</Typography>
                    <Typography>{`${trade?.route.input.symbol} > ${trade?.route.output.symbol}`}</Typography>
                  </div>
                </div>
              ),
            },
          ]}
        /> */}
      </div>
      {isDisableBtn ? (
        <InvalidButton title={title} />
      ) : (
        <SwapButton setIsShowConfirmSwap={setIsShowConfirmSwap} />
      )}
      {isShowSettingModal && (
        <SettingChartModal
          isShowing={isShowSettingModal}
          hide={setIsShowSettingModal}
        />
      )}
      {isShowTokenModal && (
        <SelectTokenModal
          isShowing={isShowTokenModal}
          hide={setIsShowTokenModal}
          token0={tokens[Field.INPUT]}
          token1={tokens[Field.OUTPUT]}
          setToken={setTokens}
          typeModal={typeModal}
          balances={balances}
        />
      )}
      {isShowConfirmSwap && (
        <ConfirmSwapModal
          isShowing={isShowConfirmSwap}
          hide={setIsShowConfirmSwap}
          token0={tokens[Field.INPUT]}
          token1={tokens[Field.OUTPUT]}
          token0InputAmount={
            independentField === Field.INPUT
              ? typedValue
              : parseFloat(amount ?? "").toFixed(6)
          }
          token1OutputAmount={
            independentField === Field.OUTPUT
              ? typedValue
              : parseFloat(amount ?? "").toFixed(4)
          }
          trade={trade}
          onSwapCallback={onSwapCallback}
          submitting={submitting}
          isSuccess={isSuccess}
          setIsSuccess={setIsSuccess}
          slippage={slippageEstimation}
          independentField={independentField}
          oraclePrice={oraclePriceRate}
          tradePrice={tradePrice}
        />
      )}
    </div>
  );
};

export const SettingIcon = () => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
    >
      <path
        d="M19.1401 12.94C19.1801 12.64 19.2001 12.33 19.2001 12C19.2001 11.68 19.1801 11.36 19.1301 11.06L21.1601 9.48002C21.3401 9.34002 21.3901 9.07002 21.2801 8.87002L19.3601 5.55002C19.2401 5.33002 18.9901 5.26002 18.7701 5.33002L16.3801 6.29002C15.8801 5.91002 15.3501 5.59002 14.7601 5.35002L14.4001 2.81002C14.3601 2.57002 14.1601 2.40002 13.9201 2.40002H10.0801C9.84011 2.40002 9.65011 2.57002 9.61011 2.81002L9.25011 5.35002C8.66011 5.59002 8.12011 5.92002 7.63011 6.29002L5.24011 5.33002C5.02011 5.25002 4.77011 5.33002 4.65011 5.55002L2.74011 8.87002C2.62011 9.08002 2.66011 9.34002 2.86011 9.48002L4.89011 11.06C4.84011 11.36 4.80011 11.69 4.80011 12C4.80011 12.31 4.82011 12.64 4.87011 12.94L2.84011 14.52C2.66011 14.66 2.61011 14.93 2.72011 15.13L4.64011 18.45C4.76011 18.67 5.01011 18.74 5.23011 18.67L7.62011 17.71C8.12011 18.09 8.65011 18.41 9.24011 18.65L9.60011 21.19C9.65011 21.43 9.84011 21.6 10.0801 21.6H13.9201C14.1601 21.6 14.3601 21.43 14.3901 21.19L14.7501 18.65C15.3401 18.41 15.8801 18.09 16.3701 17.71L18.7601 18.67C18.9801 18.75 19.2301 18.67 19.3501 18.45L21.2701 15.13C21.3901 14.91 21.3401 14.66 21.1501 14.52L19.1401 12.94ZM12.0001 15.6C10.0201 15.6 8.40011 13.98 8.40011 12C8.40011 10.02 10.0201 8.40002 12.0001 8.40002C13.9801 8.40002 15.6001 10.02 15.6001 12C15.6001 13.98 13.9801 15.6 12.0001 15.6Z"
        fill="white"
      />
    </svg>
  );
};

export const ArrowDown = () => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
    >
      <g clipPath="url(#clip0_2238_561)">
        <path d="M7 10L12 15L17 10H7Z" fill="white" />
      </g>
      <defs>
        <clipPath id="clip0_2238_561">
          <rect width="24" height="24" fill="white" />
        </clipPath>
      </defs>
    </svg>
  );
};

export const SwapIcon = (props: any) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      className="cursor-pointer"
      onClick={() => props.handleChangeToken()}
    >
      <rect width="24" height="24" rx="6" fill="#2D313E" />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M15.995 17.8047C15.8637 17.9296 15.6857 17.9999 15.5001 17.9999C15.3145 17.9999 15.1364 17.9296 15.0052 17.8047L12.2051 15.138C12.1072 15.0448 12.0406 14.926 12.0136 14.7967C11.9866 14.6674 12.0005 14.5334 12.0534 14.4116C12.1064 14.2898 12.1961 14.1857 12.3112 14.1124C12.4263 14.0391 12.5616 14 12.7 14H14.8001V6.66667C14.8001 6.48986 14.8738 6.32029 15.0051 6.19526C15.1364 6.07024 15.3144 6 15.5001 6C15.6857 6 15.8638 6.07024 15.9951 6.19526C16.1263 6.32029 16.2001 6.48986 16.2001 6.66667V14H18.3001C18.4386 14 18.5739 14.0391 18.689 14.1124C18.8041 14.1857 18.8938 14.2898 18.9467 14.4116C18.9997 14.5334 19.0136 14.6674 18.9866 14.7967C18.9596 14.926 18.8929 15.0448 18.795 15.138L15.995 17.8047ZM8.99484 6.19533C8.86356 6.07035 8.68554 6.00014 8.49993 6.00014C8.31431 6.00014 8.13629 6.07035 8.00502 6.19533L5.20496 8.862C5.10709 8.95523 5.04044 9.07401 5.01344 9.20331C4.98644 9.33261 5.00031 9.46664 5.05328 9.58844C5.10625 9.71024 5.19595 9.81435 5.31104 9.8876C5.42613 9.96086 5.56144 9.99997 5.69987 10H7.79991V17.3333C7.79991 17.5101 7.87366 17.6797 8.00494 17.8047C8.13622 17.9298 8.31427 18 8.49993 18C8.68558 18 8.86363 17.9298 8.99491 17.8047C9.12619 17.6797 9.19994 17.5101 9.19994 17.3333V10H11.3C11.4384 9.99997 11.5737 9.96086 11.6888 9.8876C11.8039 9.81435 11.8936 9.71024 11.9466 9.58844C11.9995 9.46664 12.0134 9.33261 11.9864 9.20331C11.9594 9.07401 11.8928 8.95523 11.7949 8.862L8.99484 6.19533Z"
        fill="#C6C6C6"
      />
    </svg>
  );
};

export const GasIcon = () => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
    >
      <g clipPath="url(#clip0_227_3788)">
        <path
          d="M13.3668 3.43131L12.2358 4.56228L14.4038 6.73033L14.4081 10.4006C14.4081 10.8402 14.0496 11.203 13.61 11.203H10.4092V0H0.806615V14.3996H0V16H11.203V14.3996H10.4006V12.7991H13.6015C14.9202 12.7991 16 11.7194 16 10.3964V6.06455L13.3668 3.43131ZM8.80448 6.39744H2.40277V1.59616H8.80448V6.39744Z"
          fill="white"
        />
      </g>
      <defs>
        <clipPath id="clip0_227_3788">
          <rect width="16" height="16" fill="white" />
        </clipPath>
      </defs>
    </svg>
  );
};

export default SwapPage;
