import { useAccount } from "@starknet-react/core";
import { Typography } from "antd";
import Input from "antd/es/input/Input";
import {
  APP_CHAIN_ID,
  Field,
  SN_RPC_PROVIDER,
  TOKEN_LIST,
  getTokenIcon,
} from "configs";
import { parseUnits } from "ethers/lib/utils";
import { Fraction, Token, TokenAmount } from "l0k_swap-sdk";
import { useCallback, useState } from "react";
import { Link } from "react-router-dom";
import { num } from "starknet";
import {
  PoolState,
  addLiquidityCallback,
  approveTokenCallback,
  getPoolInfo,
} from "state/liquidity";
import { getOraclePriceOf } from "state/swap";
import { useWeb3Store } from "stores/web3";
import useSWR from "swr";
import { twMerge } from "tailwind-merge";
import ConfirmAddLP from "../../../components/confirm-addliquidity-modal/ConfirmAddLPModal";
import SelectTokenModal from "../../../components/select-token-modal/SelectTokenModal";
import { ArrowDown, mocktoken } from "../../swap/components/SwapPage";
import { ArrowBack, PlusIcon } from "./icons";

const AddLiquidity = () => {
  const { account, address, isConnected } = useAccount();
  const provider = SN_RPC_PROVIDER();

  const [isShowReviewModal, setIsShowReviewModal] = useState<boolean>(false);
  const [isShowTokenModal, setIsShowTokenModal] = useState<boolean>(false);
  const [typeModal, setTypeModal] = useState<number>(1);
  const [isApprove, setIsApprove] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const [isFailed, setIsFailed] = useState<boolean>(false);
  const [approveTx, setApproveTx] = useState<string | undefined>(undefined);

  const [disabled, setDisabled] = useState(true);
  const [k, setK] = useState(1);

  const onChangeK = (newValue: number) => {
    setK(newValue);
  };

  const [tokens, setTokens] = useState<{
    [key in Field]: Token | undefined;
  }>({
    [Field.INPUT]: TOKEN_LIST[APP_CHAIN_ID][0],
    [Field.OUTPUT]: TOKEN_LIST[APP_CHAIN_ID][1],
  });

  const [tokenAmounts, setTokenAmounts] = useState<{ [key in Field]: string }>({
    [Field.INPUT]: "",
    [Field.OUTPUT]: "",
  });

  const [parsedTokenAmounts, setParsedTokenAmounts] = useState<{
    [key in Field]: TokenAmount | undefined;
  }>({
    [Field.INPUT]: undefined,
    [Field.OUTPUT]: undefined,
  });

  const [independentField, setIndependentField] = useState<Field>(Field.INPUT);
  const web3State = useWeb3Store();

  const { data, isLoading: isLoadingPool } = useSWR<{
    balances: (TokenAmount | undefined)[];
    poolInfo: PoolState | undefined;
  }>(
    [address, tokens[Field.INPUT], tokens[Field.OUTPUT], web3State.txHash],
    async () => {
      if (!address || !isConnected)
        return {
          balances: [],
          poolInfo: undefined,
        };
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

      return { balances, poolInfo };
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

  const handleChangeAmounts = useCallback(
    (value: string, independentField: Field) => {
      if (!data?.poolInfo) return;

      if (value === "") {
        data.poolInfo.noLiquidity
          ? setTokenAmounts((amounts) => ({
              ...amounts,
              [independentField]: "",
            }))
          : setTokenAmounts({
              [Field.INPUT]: "",
              [Field.OUTPUT]: "",
            });
        return;
      }

      setIndependentField(independentField);
      const remainField =
        independentField === Field.INPUT ? Field.OUTPUT : Field.INPUT;
      const decimalsIndependent = tokens?.[independentField]?.decimals ?? 18;
      const remainDecimals = tokens?.[remainField]?.decimals ?? 18;
      let parsedAmount: Fraction | undefined;
      if (data.poolInfo.noLiquidity) {
        setTokenAmounts((amounts) => ({
          ...amounts,
          [independentField]: value,
        }));
        try {
          parsedAmount = new Fraction(
            parseUnits(value, decimalsIndependent).toString()
          );

          tokens[independentField] &&
            setParsedTokenAmounts((amounts) => ({
              ...amounts,
              [independentField]: new TokenAmount(
                tokens[independentField] as any,
                parsedAmount?.quotient.toString() as any
              ),
            }));
        } catch (error) {
          console.error(error);
          return;
        }
      } else {
        try {
          parsedAmount = new Fraction(
            parseUnits(value, decimalsIndependent).toString()
          );
        } catch (error) {
          console.error(error);
          return;
        }
        if (!parsedAmount) return;
        const isTokenA0 = tokens[independentField]?.symbol === "ETH";
        let oraclePriceRateCalc;
        if (isTokenA0 && independentField === Field.INPUT) {
          oraclePriceRateCalc =
            Number(oraclePrice?.oraclePriceTokenA) /
            Number(oraclePrice?.oraclePriceTokenB);
        } else if (!isTokenA0 && independentField === Field.INPUT) {
          oraclePriceRateCalc =
            Number(oraclePrice?.oraclePriceTokenA) /
            Number(oraclePrice?.oraclePriceTokenB);
        } else if (isTokenA0 && independentField === Field.OUTPUT) {
          oraclePriceRateCalc =
            Number(oraclePrice?.oraclePriceTokenB) /
            Number(oraclePrice?.oraclePriceTokenA);
        } else {
          oraclePriceRateCalc =
            Number(oraclePrice?.oraclePriceTokenB) /
            Number(oraclePrice?.oraclePriceTokenA);
        }

        const remainParsedAmount = parsedAmount.multiply(
          data?.poolInfo?.prices[!isTokenA0 ? remainField : independentField]
            ?.raw ?? "1"
        );
        const remainParsedAmount0 = Number(value) * oraclePriceRateCalc;
        setParsedTokenAmounts({
          [independentField]: new TokenAmount(
            tokens[independentField] as any,
            parsedAmount.quotient.toString()
          ),
          [remainField]: new TokenAmount(
            tokens[remainField] as any,
            remainParsedAmount.quotient.toString()
          ),
        } as any);
        setTokenAmounts({
          [independentField]: value,
          [remainField]: remainParsedAmount0,
        } as any);
      }
    },
    [data?.poolInfo, tokens[Field.INPUT], tokens[Field.OUTPUT]]
  );

  const onApproveTokenCallback = useCallback(async () => {
    try {
      setIsApprove(true);
      const tx = await approveTokenCallback(
        address,
        account,
        tokens,
        parsedTokenAmounts
      );
      setApproveTx(tx);
      setIsApprove(false);
    } catch (error) {
      console.error(error);
      setIsApprove(false);
    }
  }, [address, account, tokens, parsedTokenAmounts]);

  const onAddLiquidityCallback = useCallback(async () => {
    try {
      setSubmitting(true);
      const tx = await addLiquidityCallback(
        address,
        account,
        tokens,
        parsedTokenAmounts
      );
      setSubmitting(false);
      setIsSuccess(true);
      setTokenAmounts({
        [Field.INPUT]: "",
        [Field.OUTPUT]: "",
      });
      setApproveTx("");
      useWeb3Store.setState({
        ...web3State,
        txHash: tx.transaction_hash,
      });
    } catch (error) {
      console.error(error);
      setSubmitting(false);
      setIsFailed(true);
    }
  }, [address, account, tokens, parsedTokenAmounts]);

  return (
    <div className="flex flex-col items-start">
      <div className="flex w-[500px] flex-col items-end justify-center bg-[#1D1C21] gap-8 p-8">
        <div className="flex flex-col items-start self-stretch gap-6">
          <div className="flex flex-col items-start gap-[10px] self-stretch">
            <Link
              to="/pools"
              className="flex items-center self-stretch gap-3 hover:text-white"
            >
              <ArrowBack />
              <span className="text-2xl !font-['Russo_One'] leading-[29px]">
                Add Liquidity
              </span>
            </Link>
            <div className="flex justify-center items-center gap-[10px] p-2 self-stretch bg-[rgba(39,227,171,0.10)]">
              <Typography className="text-xs text-[#27E3AB] flex-1 font-medium font-['Montserrat'] leading-[18px]">
                <b>Tip:</b> When you add liquidity, you will receive pool tokens
                representing your position.
                <br /> These tokens automatically earn fees proportional to your
                share of the pool, and can be redeemed at any time.
              </Typography>
            </div>
          </div>
          <div className="flex flex-col items-start self-stretch gap-4">
            <div className="flex flex-col items-start self-stretch gap-2">
              <div className="flex flex-col items-start gap-2 self-stretch bg-[#131216] p-4">
                <div className="flex flex-col items-start gap-[2px] self-stretch">
                  <div className="flex items-center self-stretch justify-between">
                    <div className="flex items-center self-stretch justify-between">
                      <Input
                        placeholder="0.0"
                        className="border-none px-0 text-xl font-bold text-[#C6C6C6]"
                        value={tokenAmounts[Field.INPUT]}
                        onChange={(e) =>
                          handleChangeAmounts(e.target.value, Field.INPUT)
                        }
                      />
                    </div>
                    <div
                      className="flex justify-between items-center bg-[#1D1C21] py-[7px] px-3 cursor-pointer shadow-[0_2px_12px_0px_rgba(11,14,25,0.12)] w-[153px]"
                      // onClick={() => {
                      //   setTypeModal(1);
                      //   setIsShowTokenModal(true);
                      // }}
                    >
                      <div className="flex items-center gap-2">
                        <img
                          src={mocktoken[1].logo}
                          alt=""
                          className="w-5 h-5"
                        />
                        <Typography className="text-sm font-medium">
                          {mocktoken[1].symbol}
                        </Typography>
                      </div>
                      <ArrowDown />
                    </div>
                  </div>
                </div>
                {/* <div className="flex items-center self-stretch justify-end">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1">
                      <Typography className="text-xs font-normal leading-[24px]">
                        Balance:
                      </Typography>
                      <Typography className="text-xs font-normal leading-[24px]">
                        {data?.balances?.[0]?.toSignificant(5)}
                      </Typography>
                    </div>
                  </div>
                </div> */}
              </div>
              <div className="flex items-center justify-center w-full">
                <PlusIcon />
              </div>
              <div className="flex flex-col items-start self-stretch bg-[#131216] p-4 gap-2">
                <div className="flex flex-col items-start gap-[2px] self-stretch">
                  <div className="flex items-center self-stretch justify-between">
                    <div className="flex items-center self-stretch justify-between">
                      <Input
                        placeholder="0.0"
                        className="border-none px-0 text-xl font-medium text-[#27E3AB]"
                        value={tokenAmounts[Field.OUTPUT]}
                        onChange={(e) =>
                          handleChangeAmounts(e.target.value, Field.OUTPUT)
                        }
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
                        <img
                          src={mocktoken[0].logo}
                          alt=""
                          className="w-5 h-5"
                        />
                        <Typography className="text-sm font-medium">
                          {mocktoken[0].symbol}
                        </Typography>
                      </div>
                      <ArrowDown />
                    </div>
                  </div>
                </div>
                {/* <div className="flex items-center self-stretch justify-end">
                  <div className="flex items-center gap-1">
                    <Typography className="text-xs font-normal">
                      Balance:
                    </Typography>
                    <Typography className="text-xs font-normal">
                      {data?.balances?.[1]?.toSignificant(5)}
                    </Typography>
                  </div>
                </div> */}
              </div>
            </div>
            <div className="flex flex-col items-start self-stretch gap-8">
              <div className="flex items-center self-stretch justify-between">
                <Typography className="text-base font-bold leading-[20px]">
                  Capital Efficiency
                </Typography>
                <div className="flex h-8 items-center justify-center gap-1 px-4 bg-[#323038]">
                  <Typography className="text-xs font-bold">100x</Typography>
                </div>
              </div>
            </div>
          </div>
        </div>
        {Number(tokenAmounts[Field.INPUT]) >
        Number(data?.balances?.[0]?.toFixed(3)) ? (
          <div className="flex justify-center items-center gap-2 self-stretch py-[18px] px-6 bg-[#737373] cursor-pointer">
            <Typography className="text-base font-bold">
              Insufficient Balance
            </Typography>
          </div>
        ) : (
          <div
            className={twMerge(
              "flex justify-center items-center gap-2 self-stretch py-[18px] px-6 bg-[#773030] cursor-pointer",
              approveTx && "hidden"
            )}
            // onClick={onApproveTokenCallback}
          >
            <Typography className="text-base font-bold">
              {isApprove ? "Approving..." : `Approve`}
            </Typography>
          </div>
        )}
        <div
          className={twMerge(
            "hidden justify-center items-center gap-2 self-stretch py-[18px] px-6 bg-[#773030] cursor-pointer",
            approveTx && "flex"
          )}
          onClick={() => setIsShowReviewModal(true)}
          // onClick={onAddLiquidityCallback}
        >
          <Typography className="text-base font-bold">Add</Typography>
        </div>
      </div>

      {isShowTokenModal && (
        <SelectTokenModal
          balances={data?.balances}
          isShowing={isShowTokenModal}
          hide={setIsShowTokenModal}
          token0={tokens[Field.INPUT]}
          token1={tokens[Field.OUTPUT]}
          setToken={setTokens}
          typeModal={typeModal}
        />
      )}
      {isShowReviewModal && (
        <ConfirmAddLP
          data={data}
          isShowing={isShowReviewModal}
          hide={setIsShowReviewModal}
          submitting={submitting}
          isSuccess={isSuccess}
          isFailed={isFailed}
          token0={tokens[Field.INPUT]}
          token1={tokens[Field.OUTPUT]}
          token0InputAmount={tokenAmounts[Field.INPUT]}
          token1OutputAmount={tokenAmounts[Field.OUTPUT]}
          onAddLiquidityCallback={onAddLiquidityCallback}
        />
      )}
    </div>
  );
};

export default AddLiquidity;
