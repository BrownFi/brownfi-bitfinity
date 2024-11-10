import { Typography } from "antd";
import { useEffect, useRef } from "react";
import { twMerge } from "tailwind-merge";
import { ModalSettingHeader } from "./components/SettingModalHeader";

export const Divider = ({ className }: { className?: string }) => {
  return (
    <div className={twMerge("h-[1px] w-full bg-[#2D313E]", className)}></div>
  );
};

const SettingChartModal = ({
  isShowing,
  hide,
}: {
  isShowing?: boolean;
  hide?: any;
}) => {
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
      <div className={`modal-overlay`}>
        <div
          ref={wrapperRef}
          className={twMerge(
            "flex flex-col items-start gap-5 modal-content-setting !max-h-[413px]"
          )}
        >
          <ModalSettingHeader close={() => hide(false)} />
          <Divider />
          <div className="flex flex-col items-start self-stretch gap-3">
            <span className="text-[18px] font-['Russo_One'] leading-[22px]">
              Slippage Tolerance
            </span>
            <Typography className="text-sm font-medium leading-[20px]">
              Your transaction will revert if the settled price deviates by more
              than this percentage.
            </Typography>
            <div className="flex py-[7px] px-3 gap-4 bg-[#323038] shadow-[0_2px_12px_0_rgba(11,14,25,0.12)] cursor-pointer">
              <Typography className="text-sm font-medium leading-[20px]">
                10%
              </Typography>
            </div>
          </div>
          <Divider />
          <div className="flex flex-col items-start self-stretch gap-3">
            <span className="text-[18px] font-['Russo_One'] leading-[22px]">
              Transaction deadline
            </span>
            <Typography className="text-sm font-medium leading-[20px]">
              Your transaction will revert if it is pending for more than this
              period of time.
            </Typography>
            <div className="flex py-[7px] px-3 gap-4 bg-[#323038] shadow-[0_2px_12px_0_rgba(11,14,25,0.12)] cursor-pointer">
              <Typography className="text-sm font-medium leading-[20px]">
                10 mins
              </Typography>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingChartModal;
