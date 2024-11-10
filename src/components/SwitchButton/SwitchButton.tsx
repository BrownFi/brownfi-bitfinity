import { twMerge } from "tailwind-merge";

export const SwitchButton = (props: any) => {
  return (
    <div className="flex items-center justify-center w-full">
      <div className="inline-flex max-w-[240px] items-start rounded-2xl border-2 border-[#2D313E] bg-[#0D0E12]">
        <div
          className={twMerge(
            "flex w-[120px] items-center justify-center rounded-2xl px-4 py-2 transition-all cursor-pointer",
            props.tab === "swap" && "switch-linear"
          )}
          onClick={() => props.setTab("swap")}
        >
          <span
            className={twMerge(
              "text-base font-bold leading-normal text-[#C6C6C6]",
              props.tab === "swap" && "text-[#1A1C24]"
            )}
          >
            Swap
          </span>
        </div>
        <div
          className={twMerge(
            "flex w-[120px] items-center justify-center rounded-2xl px-4 py-2 transition-all cursor-pointer",
            props.tab === "liquidity" && "switch-linear"
          )}
          onClick={() => props.setTab("liquidity")}
        >
          <span
            className={twMerge(
              "text-base font-bold leading-normal text-[#C6C6C6]",
              props.tab === "liquidity" && "text-[#1A1C24]"
            )}
          >
            Liquidity
          </span>
        </div>
      </div>
    </div>
  );
};
