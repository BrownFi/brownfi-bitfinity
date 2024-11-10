export const SwapButton = (props: any) => {
  return (
    <div
      onClick={() => props.setIsShowConfirmSwap(true)}
      className="flex items-center justify-center gap-2 self-stretch px-6 py-[18px] bg-[#773030] cursor-pointer"
    >
      <span className="text-base font-bold">Swap</span>
    </div>
  );
};
