import { Typography } from "antd";
import { CloseIcon } from "../../CloseIcon";

export const ConfirmModalHeader = ({ close }: { close: any }) => {
  return (
    <div className="flex flex-col w-full gap-3">
      <div className="flex items-center self-stretch justify-end">
        {/* <span className="text-2xl font-['Russo_One'] leading-[29px]">
					Review Swap
				</span> */}
        <div className="flex items-center w-6 h-6 cursor-pointer">
          <CloseIcon onClick={close} />
        </div>
      </div>
    </div>
  );
};
