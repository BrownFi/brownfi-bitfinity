import { LoadingOutlined } from "@ant-design/icons";
import { Spin, Typography } from "antd";
import { getTokenIcon } from "configs";
import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { useWeb3Store } from "stores/web3";
import { twMerge } from "tailwind-merge";
import { ConfirmModalHeader } from "./components/ConfirmModalHeader";
import { CheckCircle, FailedCircle } from "./icons";

const ConfirmAddLP = (props: any) => {
  const { txHash } = useWeb3Store();

  const {
    isShowing,
    hide,
    token0,
    token1,
    token0InputAmount,
    token1OutputAmount,
    onAddLiquidityCallback,
    data,
    submitting,
    isSuccess,
    isFailed,
  } = props;

  const useOutsideAlerter = (ref: any) => {
    useEffect(() => {
      /**
       * Alert if clicked on outside of element
       */
      function handleClickOutside(event: any) {
        if (ref.current && !ref.current.contains(event.target)) {
          hide(false);
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
            <ConfirmModalHeader close={() => hide(false)} />
            {!submitting && !isSuccess && !isFailed && (
              <>
                <div className="flex flex-col items-center self-stretch gap-1">
                  <div className="flex py-3 px-4 flex-col items-start gap-2 self-stretch bg-[#323038]">
                    <div className="flex flex-col items-start self-stretch gap-1">
                      <div className="flex items-center self-stretch justify-between">
                        <div className="flex items-center gap-3">
                          <img
                            src={getTokenIcon(token0.address)}
                            alt=""
                            className="w-8 h-8"
                          />
                          <Typography className="text-2xl font-semibold leading-[39px]">
                            {token0.name}
                          </Typography>
                        </div>
                        <Typography className="text-2xl font-semibold leading-[39px]">
                          {token0InputAmount}{" "}
                        </Typography>
                      </div>
                    </div>
                  </div>
                  <div className="flex py-3 px-4 flex-col items-start gap-2 self-stretch bg-[#323038]">
                    <div className="flex flex-col items-start self-stretch gap-1">
                      <div className="flex items-center self-stretch justify-between">
                        <div className="flex items-center gap-3">
                          <img
                            src={getTokenIcon(token1.address)}
                            alt=""
                            className="w-8 h-8"
                          />
                          <Typography className="text-2xl font-semibold leading-[39px]">
                            {token1.name}
                          </Typography>
                        </div>
                        <Typography className="text-2xl font-semibold leading-[39px]">
                          {Number(token1OutputAmount).toFixed(4)}{" "}
                        </Typography>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col items-start self-stretch gap-3 transition-all">
                  <div className="flex items-center self-stretch justify-between">
                    <Typography className="text-sm font-medium leading-[20px]">
                      Parameter
                    </Typography>
                    <Typography className="text-sm font-medium">
                      0.01
                    </Typography>
                  </div>
                  <div className="flex justify-between items-center self-stretch leading-[20px]">
                    <Typography className="text-sm font-medium">
                      LP Price
                    </Typography>
                    <Typography className="text-sm font-medium">
                      {data?.poolInfo?.pair?.token0Price.toFixed(2)}
                    </Typography>
                  </div>
                  {/* <div className="flex justify-between items-center self-stretch leading-[20px]">
                    <Typography className="text-sm font-medium">Fee</Typography>
                    <Typography className="text-sm font-medium">
                      0.3%
                    </Typography>
                  </div> */}
                </div>
                <div
                  className="flex items-center justify-center gap-2 self-stretch px-6 py-[18px] bg-[#773030] cursor-pointer"
                  onClick={() => onAddLiquidityCallback()}
                >
                  <span className="text-base font-bold leading-[20px]">
                    Confirm
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
                    <div className="flex flex-col items-center gap-2">
                      <Typography className="text-[32px] font-semibold leading-[39px]">
                        Waiting...
                      </Typography>
                      <Typography className="text-xl font-medium text-[rgba(255,255,255,0.5)]">
                        For confirmation
                      </Typography>
                    </div>
                    <Typography className="text-sm font-medium">
                      Supplying {token0InputAmount} {token0.name} and{" "}
                      {token1OutputAmount} {token1.name}
                    </Typography>
                  </div>
                </div>
                <Typography className="text-xs text-[rgba(255,255,255,0.5)] font-medium leading-[18px]">
                  Confirm this transaction in your wallet
                </Typography>
              </>
            )}
            {isSuccess && (
              <>
                <div className="flex flex-col items-center gap-5">
                  <CheckCircle />
                  <div className="flex flex-col items-center gap-5">
                    <Typography className="text-[32px] text-[#27E39F] font-semibold leading-[39px] whitespace-nowrap">
                      Transaction Submitted
                    </Typography>
                    <div
                      className="flex h-[56px] py-[18px] px-6 justify-center items-center gap-2 self-stretch bg-[#773030] cursor-pointer"
                      onClick={() => hide(false)}
                    >
                      <Typography className="text-base font-bold">
                        Close
                      </Typography>
                    </div>
                  </div>
                </div>
                <Link
                  to={`https://sepolia.starkscan.co/tx/${txHash}`}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="text-base text-[#27E3AB] font-bold leading-[20px] cursor-pointer hover:text-[#27E3AB]"
                >
                  View on Block Explorer
                </Link>
              </>
            )}
            {isFailed && (
              <>
                <div className="flex flex-col items-center gap-5">
                  <FailedCircle />
                  <div className="flex flex-col items-center gap-5">
                    <Typography className="text-[32px] text-[#FF3B6A] font-semibold leading-[39px]">
                      Transaction Failed
                    </Typography>
                    <div
                      className="flex h-[56px] py-[18px] px-6 justify-center items-center gap-2 self-stretch bg-[#773030] cursor-pointer"
                      onClick={() => hide(false)}
                    >
                      <Typography className="text-base font-bold">
                        Close
                      </Typography>
                    </div>
                  </div>
                </div>
                <Typography className="text-base text-[#FF3B6A] font-bold leading-[20px] cursor-pointer">
                  View on Block Explorer
                </Typography>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ConfirmAddLP;
