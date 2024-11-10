import { twMerge } from "tailwind-merge";

export const ArrowDown = ({
  className,
  isShowMore,
}: {
  className: string;
  isShowMore: boolean;
}) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      className={twMerge("transition-all", isShowMore && "rotate-180")}
    >
      <g clipPath="url(#clip0_227_4276)">
        <path
          d="M4.66602 6.66663L7.99935 9.99996L11.3327 6.66663H4.66602Z"
          fill="white"
          fillOpacity="0.5"
        />
      </g>
      <defs>
        <clipPath id="clip0_227_4276">
          <rect width="16" height="16" fill="white" />
        </clipPath>
      </defs>
    </svg>
  );
};
