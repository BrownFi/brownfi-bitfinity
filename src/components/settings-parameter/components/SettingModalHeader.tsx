import { MouseEventHandler } from "react";
import { CloseIcon } from "../../CloseIcon";

export const ModalSettingHeader = ({
  close,
}: {
  close?: MouseEventHandler;
}) => {
  return (
    <div className="flex flex-col w-full gap-3">
      <div className="flex items-center self-stretch justify-between gap-3">
        <span className="text-2xl font-['Russo_One'] leading-[29px]">
          Adjust Parameter
        </span>
        <div className="flex items-center justify-center">
          <CloseIcon onClick={close} />
        </div>
      </div>
    </div>
  );
};
