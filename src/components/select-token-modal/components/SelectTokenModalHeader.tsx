const CloseIcon = () => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
    >
      <g clipPath="url(#clip0_226_743)">
        <path
          d="M19 6.41L17.59 5L12 10.59L6.41 5L5 6.41L10.59 12L5 17.59L6.41 19L12 13.41L17.59 19L19 17.59L13.41 12L19 6.41Z"
          fill="white"
        />
      </g>
      <defs>
        <clipPath id="clip0_226_743">
          <rect width="24" height="24" fill="white" />
        </clipPath>
      </defs>
    </svg>
  );
};

export const SelectTokenModalHeader = ({ close }: { close: any }) => {
  return (
    <div className="flex flex-col w-full gap-3">
      <div className="flex items-start self-stretch justify-between">
        <span className="text-2xl font-['Russo_One']">Select Asset</span>
        <div className="flex items-center w-6 h-6 cursor-pointer">
          <div onClick={close}>
            <CloseIcon />
          </div>
        </div>
      </div>
    </div>
  );
};
