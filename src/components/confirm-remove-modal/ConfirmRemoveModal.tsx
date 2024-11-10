import { LoadingOutlined } from "@ant-design/icons";
import { Spin, Typography } from "antd";
import { getTokenIcon } from "configs";
import { PROCESS_REMOVE } from "pages/your-pool/component/YourPool";
import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { useWeb3Store } from "stores/web3";
import { twMerge } from "tailwind-merge";
import { ConfirmModalHeader } from "./components/ConfirmModalHeader";
import { ArrowForward, CheckCircle, FailedCircle } from "./components/icons";

const ConfirmRemoveModal = (props: any) => {
  // const [isShowMore, setIsShowMore] =
  // 	useState<boolean>(false);
  // const [isLoading, setIsLoading] =
  // 	useState<boolean>(true);
  // const [isSuccess, setIsSuccess] =
  // 	useState<boolean>(false);
  // const [isFailed, setIsFailed] =
  // 	useState<boolean>(false);
  const txHash = useWeb3Store();
  const {
    isShowing,
    processRemove,
    hide,
    token0,
    token1,
    token0InputAmount,
    token1OutputAmount,
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
              processRemove && "gap-10"
            )}
          >
            <ConfirmModalHeader close={() => hide(false)} />
            {/* {!isLoading &&
							!isSuccess &&
							!isFailed && (
								<>
									<div className="flex flex-col items-center self-stretch gap-1">
										<div className="flex py-3 px-4 flex-col items-start gap-2 self-stretch bg-[#323038]">
											<Typography className="text-sm font-medium text-[rgba(255,255,255,0.5)] leading-[20px]">
												You Pay
											</Typography>
											<div className="flex flex-col items-start self-stretch gap-1">
												<div className="flex items-center self-stretch justify-between">
													<Typography className="text-[32px] font-semibold leading-[39px]">
														{token0InputAmount}{" "}
														{token0.name}
													</Typography>
													<img
														src={token0.icon}
														alt=""
														className="w-8 h-8"
													/>
												</div>
												<Typography className="text-sm font-medium text-[rgba(255,255,255,0.5)] leading-[20px]">
													$0.53
												</Typography>
											</div>
										</div>
										<div className="flex py-3 px-4 flex-col items-start gap-2 self-stretch bg-[#323038]">
											<Typography className="text-sm font-medium text-[rgba(255,255,255,0.5)] leading-[20px]">
												You Receive
											</Typography>
											<div className="flex flex-col items-start self-stretch gap-1">
												<div className="flex items-center self-stretch justify-between">
													<Typography className="text-[32px] font-semibold leading-[39px]">
														{token1OutputAmount}{" "}
														{token1.name}
													</Typography>
													<img
														src={token1.icon}
														alt=""
														className="w-8 h-8"
													/>
												</div>
												<Typography className="text-sm font-medium text-[rgba(255,255,255,0.5)] leading-[20px]">
													$0.53
												</Typography>
											</div>
										</div>
									</div>
									<div className="flex items-center self-stretch gap-3">
										<div className="h-[1px] bg-[#323135] w-full"></div>
										<div
											className="flex items-center gap-1 min-w-[92px] cursor-pointer"
											onClick={() =>
												setIsShowMore(!isShowMore)
											}
										>
											<Typography className="text-xs font-bold text-[rgba(255,255,255,0.5)] whitespace-nowrap leading-[15px]">
												Show more
											</Typography>
											<ArrowDown
												className="flex-1"
												isShowMore={isShowMore}
											/>
										</div>
										<div className="h-[1px] bg-[#323135] w-full"></div>
									</div>
									<div className="flex flex-col items-start self-stretch gap-3 transition-all">
										<div className="flex items-center self-stretch justify-between">
											<Typography className="text-sm font-medium leading-[20px]">
												Rate
											</Typography>
											<div className="flex justify-end items-center gap-1 text-sm font-medium leading-[20px]">
												<Typography>
													1 {token0.name}
												</Typography>
												<Typography>=</Typography>
												<Typography>
													{token1OutputAmount /
														token0InputAmount}{" "}
													{token1.name}
												</Typography>
												<Typography className="text-xs text-[rgba(255,255,255,0.5)]">
													($1.00)
												</Typography>
											</div>
										</div>
										{isShowMore && (
											<>
												<div className="flex justify-between items-center self-stretch leading-[20px]">
													<Typography className="text-sm font-medium">
														Price impact
													</Typography>
													<Typography className="text-sm font-medium">
														~-0.036%
													</Typography>
												</div>
												<div className="flex justify-between items-center self-stretch leading-[20px]">
													<Typography className="text-sm font-medium">
														Max. slippage
													</Typography>
													<Typography className="text-sm font-medium">
														0.5%
													</Typography>
												</div>
												<div className="flex justify-between items-center self-stretch leading-[20px]">
													<Typography className="text-sm font-medium">
														Receive at least
													</Typography>
													<Typography className="text-sm font-medium">
														0.52671 USDT
													</Typography>
												</div>
											</>
										)}
										<div className="flex justify-between items-center self-stretch leading-[20px]">
											<Typography className="text-sm font-medium">
												Fee
											</Typography>
											<Typography className="text-sm font-medium">
												$0
											</Typography>
										</div>
										<div className="flex justify-between items-center self-stretch leading-[20px]">
											<Typography className="text-sm font-medium">
												Network cost
											</Typography>
											<div className="flex items-center gap-2">
												<img
													src={token0.icon}
													alt=""
													className="w-5 h-5"
												/>
												<Typography className="text-sm font-medium">
													$0.12
												</Typography>
											</div>
										</div>
									</div>
									<div
										className="flex items-center justify-center gap-2 self-stretch px-6 py-[18px] bg-[#773030] cursor-pointer"
										onClick={() =>
											setIsLoading(true)
										}
									>
										<span className="text-base font-bold leading-[20px]">
											Confirm Swap
										</span>
									</div>
								</>
							)} */}
            {processRemove === PROCESS_REMOVE.LOADING && (
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
                    <div className="flex justify-center items-center gap-3 text-sm font-medium leading-[20px]">
                      <Typography>
                        Remove {token0InputAmount} {token0.name} and{" "}
                        {token1OutputAmount} {token1.name}
                      </Typography>
                    </div>
                  </div>
                </div>
                <Typography className="text-xs text-[rgba(255,255,255,0.5)] font-medium leading-[18px]">
                  Confirm this transaction in your wallet
                </Typography>
              </>
            )}
            {processRemove === PROCESS_REMOVE.SUCCESS && (
              <>
                <div className="flex flex-col items-center gap-5">
                  <CheckCircle />
                  <div className="flex flex-col items-center gap-5">
                    <Typography className="text-[32px] text-[#27E39F] font-semibold leading-[39px]">
                      Remove Success
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
                <Link
                  to={`https://testnet.starkscan.co/tx/${txHash?.txHash}`}
                  target="_blank"
                  className="text-base text-[#27E3AB] font-bold leading-[20px] cursor-pointer hover:text-[#27E3AB]"
                >
                  View on Explorer
                </Link>
              </>
            )}
            {processRemove === PROCESS_REMOVE.FAIL && (
              <>
                <div className="flex flex-col items-center gap-5">
                  <FailedCircle />
                  <div className="flex flex-col items-center gap-5">
                    <Typography className="text-[32px] text-[#FF3B6A] font-semibold leading-[39px]">
                      Remove Fail
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
                {/* 							
								<Typography className="text-base text-[#FF3B6A] font-bold leading-[20px] cursor-pointer">
									View on Explorer
								</Typography> */}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ConfirmRemoveModal;
