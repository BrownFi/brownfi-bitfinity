import { LoadingOutlined } from "@ant-design/icons";
import { Spin, Typography } from "antd";
import { Field, getTokenIcon } from "configs";
import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useWeb3Store } from "stores/web3";
import { twMerge } from "tailwind-merge";
import { ConfirmModalHeader } from "./components/ConfirmModalHeader";
import { ArrowDown, ArrowForward, CheckCircle, FailedCircle } from "./icons";

const ConfirmSwapModal = (props: any) => {
  const { txHash } = useWeb3Store();

  const [isShowMore, setIsShowMore] = useState<boolean>(false);
  const [isFailed, setIsFailed] = useState<boolean>(false);
  const {
    isShowing,
    hide,
    token0,
    token1,
    token0InputAmount,
    token1OutputAmount,
    trade,
    onSwapCallback,
    submitting,
    isSuccess,
    setIsSuccess,
    slippage,
    independentField,
    oraclePrice,
    tradePrice,
  } = props;

  const useOutsideAlerter = (ref: any) => {
    useEffect(() => {
      /**
       * Alert if clicked on outside of element
       */
      function handleClickOutside(event: any) {
        if (ref.current && !ref.current.contains(event.target)) {
          hide(false);
          setIsSuccess(false);
        }
      }
      // Bind the event listener
      document.addEventListener("mousedown", handleClickOutside);
      return () => {
        // Unbind the event listener on clean up
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }, []);
  };

  const wrapperRef = useRef(null);
  useOutsideAlerter(wrapperRef);

  return (
    <div>
      {isShowing && (
        <div className={`modal-overlay`}>
          <div
            ref={wrapperRef}
            className={twMerge(
              "flex flex-col items-center gap-5 modal-content-review",
              submitting && "gap-10",
              isSuccess && "gap-10",
              isFailed && "gap-10"
            )}
          >
            <ConfirmModalHeader
              close={() => {
                hide(false);
                setIsSuccess(false);
              }}
            />
            {!submitting && !isSuccess && !isFailed && (
              <>
                <div className="flex flex-col items-center self-stretch gap-1">
                  <div className="flex py-3 px-4 flex-col items-start gap-2 self-stretch bg-[#323038]">
                    <Typography className="text-sm font-medium text-[rgba(255,255,255,0.5)] leading-[20px]">
                      You Pay
                    </Typography>
                    <div className="flex flex-col items-start self-stretch gap-1">
                      <div className="flex items-center self-stretch justify-between">
                        <Typography className="text-[32px] font-semibold leading-[39px]">
                          {token0InputAmount} {token0.name}
                        </Typography>
                        <img
                          src={getTokenIcon(token0.address)}
                          alt=""
                          className="w-8 h-8"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="flex py-3 px-4 flex-col items-start gap-2 self-stretch bg-[#323038]">
                    <Typography className="text-sm font-medium text-[rgba(255,255,255,0.5)] leading-[20px]">
                      You Receive
                    </Typography>
                    <div className="flex flex-col items-start self-stretch gap-1">
                      <div className="flex items-center self-stretch justify-between">
                        <Typography className="text-[32px] font-semibold leading-[39px]">
                          {token1OutputAmount} {token1.name}
                        </Typography>
                        <img
                          src={getTokenIcon(token1.address)}
                          alt=""
                          className="w-8 h-8"
                        />
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex items-center self-stretch gap-3">
                  <div className="h-[1px] bg-[#323135] w-full"></div>
                  <div
                    className="flex items-center gap-1 min-w-[92px] cursor-pointer"
                    onClick={() => setIsShowMore(!isShowMore)}
                  >
                    <Typography className="text-xs font-bold text-[rgba(255,255,255,0.5)] whitespace-nowrap leading-[15px]">
                      Show more
                    </Typography>
                    <ArrowDown className="flex-1" isShowMore={isShowMore} />
                  </div>
                  <div className="h-[1px] bg-[#323135] w-full"></div>
                </div>
                <div className="flex flex-col items-start self-stretch gap-3 transition-all">
                  <div className="flex items-center self-stretch justify-between">
                    <Typography className="text-sm font-medium leading-[20px]">
                      Oracle price
                    </Typography>
                    <div className="flex justify-end items-center gap-1 text-sm font-medium leading-[20px]">
                      <Typography>
                        {oraclePrice
                          ? `1 ${token0?.symbol} =
															${oraclePrice.toFixed(6)}
															${token1.symbol}`
                          : "--"}
                      </Typography>
                    </div>
                  </div>
                  {/* <div className="flex items-center self-stretch justify-between">
                    <Typography className="text-sm font-medium leading-[20px]">
                      Trade price
                    </Typography>
                    <div className="flex justify-end items-center gap-1 text-sm font-medium leading-[20px]">
                      <Typography>
                        {tradePrice
                          ? `1 ${token0?.symbol} =
															${tradePrice.toFixed(6)}
															${token1.symbol}`
                          : "--"}
                      </Typography>
                    </div>
                  </div> */}
                  {isShowMore && (
                    <>
                      <div className="flex justify-between items-center self-stretch leading-[20px]">
                        <Typography className="text-sm font-medium">
                          Estimate slippage
                        </Typography>
                        <Typography className="text-sm font-medium">
                          {slippage
                            ? `${Math.abs(slippage).toFixed(3)}%`
                            : "--"}
                        </Typography>
                      </div>
                      {/* <div className="flex justify-between items-center self-stretch leading-[20px]">
                        <Typography className="text-sm font-medium">
                          Max. slippage
                        </Typography>
                        <Typography className="text-sm font-medium">
                          --
                        </Typography>
                      </div> */}
                      <div className="flex justify-between items-center self-stretch leading-[20px]">
                        <Typography className="text-sm font-medium">
                          Receive at least
                        </Typography>
                        <Typography className="text-sm font-medium">
                          {independentField === Field.OUTPUT
                            ? token0InputAmount -
                              (token0InputAmount * +slippage) / 100
                            : token1OutputAmount -
                              (token1OutputAmount * +slippage) / 100}
                        </Typography>
                      </div>
                    </>
                  )}
                  {/* <div className="flex justify-between items-center self-stretch leading-[20px]">
                    <Typography className="text-sm font-medium">Fee</Typography>
                    <Typography className="text-sm font-medium">--</Typography>
                  </div> */}
                  {/* <div className="flex justify-between items-center self-stretch leading-[20px]">
                    <Typography className="text-sm font-medium">
                      Network cost
                    </Typography>
                    <div className="flex items-center gap-2">
                      <img
                        src={getTokenIcon(token0.address)}
                        alt=""
                        className="w-5 h-5"
                      />
                      <Typography className="text-sm font-medium">
                        --
                      </Typography>
                    </div>
                  </div> */}
                </div>
                <div
                  className="flex items-center justify-center gap-2 self-stretch px-6 py-[18px] bg-[#773030] cursor-pointer"
                  onClick={() => onSwapCallback()}
                >
                  <span className="text-base font-bold leading-[20px]">
                    Confirm Swap
                  </span>
                </div>
              </>
            )}
            {submitting && (
              <>
                <div className="flex flex-col items-center gap-5">
                  <Spin
                    indicator={
                      <LoadingOutlined
                        style={{
                          fontSize: 100,
                          color: "rgba(39, 227, 171, 1)",
                        }}
                        spin
                      />
                    }
                  />
                  <div className="flex flex-col items-center gap-5">
                    <Typography className="text-[32px] font-semibold leading-[39px]">
                      Confirm Swap
                    </Typography>
                    <div className="flex justify-center items-center gap-3 text-sm font-medium leading-[20px]">
                      <div className="flex items-center gap-2">
                        <img
                          src={getTokenIcon(token0.address)}
                          alt=""
                          className="w-5 h-5"
                        />
                        <Typography>
                          {token0InputAmount} {token0.name}
                        </Typography>
                      </div>
                      <ArrowForward />
                      <div className="flex items-center gap-2">
                        <img
                          src={getTokenIcon(token1.address)}
                          alt=""
                          className="w-5 h-5"
                        />
                        <Typography>
                          {token1OutputAmount} {token1.name}
                        </Typography>
                      </div>
                    </div>
                  </div>
                </div>
                <Typography className="text-xs text-[rgba(255,255,255,0.5)] font-medium leading-[18px]">
                  Proceed in your wallet
                </Typography>
              </>
            )}
            {isSuccess && (
              <>
                <div className="flex flex-col items-center gap-5">
                  <CheckCircle />
                  <div className="flex flex-col items-center gap-5">
                    <Typography className="text-[32px] text-[#27E39F] font-semibold leading-[39px]">
                      Swap Success
                    </Typography>
                    {/* <div className="flex justify-center items-center gap-3 text-sm font-medium leading-[20px]">
                      <div className="flex items-center gap-2">
                        <img
                          src={getTokenIcon(token0.address)}
                          alt=""
                          className="w-5 h-5"
                        />
                        <Typography>
                          {token0InputAmount} {token0.name}
                        </Typography>
                      </div>
                      <ArrowForward />
                      <div className="flex items-center gap-2">
                        <img
                          src={getTokenIcon(token1.address)}
                          alt=""
                          className="w-5 h-5"
                        />
                        <Typography>
                          {token1OutputAmount} {token1.name}
                        </Typography>
                      </div>
                    </div> */}
                  </div>
                </div>
                <Link
                  to={`https://sepolia.starkscan.co/tx/${txHash}`}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="text-base text-[#27E3AB] font-bold leading-[20px] cursor-pointer hover:text-[#27E3AB]"
                >
                  View on Explorer
                </Link>
              </>
            )}
            {isFailed && (
              <>
                <div className="flex flex-col items-center gap-5">
                  <FailedCircle />
                  <div className="flex flex-col items-center gap-5">
                    <Typography className="text-[32px] text-[#FF3B6A] font-semibold leading-[39px]">
                      Swap Fail
                    </Typography>
                    <div className="flex justify-center items-center gap-3 text-sm font-medium leading-[20px]">
                      <div className="flex items-center gap-2">
                        <img src={token0.icon} alt="" className="w-5 h-5" />
                        <Typography>
                          {token0InputAmount} {token0.name}
                        </Typography>
                      </div>
                      <ArrowForward />
                      <div className="flex items-center gap-2">
                        <img src={token1.icon} alt="" className="w-5 h-5" />
                        <Typography>
                          {token1OutputAmount} {token1.name}
                        </Typography>
                      </div>
                    </div>
                  </div>
                </div>
                <Typography className="text-base text-[#FF3B6A] font-bold leading-[20px] cursor-pointer">
                  View on Explorer
                </Typography>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ConfirmSwapModal;
