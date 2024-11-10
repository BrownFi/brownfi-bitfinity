import { MouseEventHandler } from "react";

export const FilterIcon = ({ onClick }: { onClick?: MouseEventHandler }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      onClick={onClick}
      className="cursor-pointer"
    >
      <g clipPath="url(#clip0_289_5262)">
        <path
          d="M8.33333 15H11.6667V13.3333H8.33333V15ZM2.5 5V6.66667H17.5V5H2.5ZM5 10.8333H15V9.16667H5V10.8333Z"
          fill="white"
        />
      </g>
      <defs>
        <clipPath id="clip0_289_5262">
          <rect width="20" height="20" fill="white" />
        </clipPath>
      </defs>
    </svg>
  );
};
