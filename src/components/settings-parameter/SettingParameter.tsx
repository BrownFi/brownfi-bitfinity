import { Slider, Typography } from "antd";
import { useEffect, useRef } from "react";
import { twMerge } from "tailwind-merge";
import { ModalSettingHeader } from "./components/SettingModalHeader";

export const Divider = ({ className }: { className?: string }) => {
  return (
    <div className={twMerge("h-[1px] w-full bg-[#2D313E]", className)}></div>
  );
};

const SettingParameter = ({
  isShowing,
  hide,
  k,
  onChangeK,
  disabled,
}: {
  isShowing?: boolean;
  hide?: any;
  k: number;
  onChangeK: (k: number) => void;
  disabled: boolean;
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
          <div className="flex items-center self-stretch gap-2">
            <Typography className="text-base font-medium leading-[24px] whitespace-nowrap">
              0.8
            </Typography>
            <Slider
              className="w-full"
              defaultValue={k}
              tooltip={{ open: true }}
              max={2}
              min={0.8}
              step={0.1}
              tooltipPlacement="bottom"
              onChange={onChangeK}
              disabled={disabled}
            />
            <Typography className="text-base font-medium leading-[24px]">
              2
            </Typography>
          </div>
          <div className="flex py-[18px] px-6 justify-center items-center gap-2 self-stretch bg-[#737373] cursor-pointer">
            <Typography className="text-base font-bold text-[rgba(255,255,255,0.5)]">
              Confirm
            </Typography>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingParameter;
