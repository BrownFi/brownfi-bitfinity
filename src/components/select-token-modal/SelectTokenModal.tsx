import { Input } from "antd";
import { APP_CHAIN_ID, Field, TOKEN_LIST, getTokenIcon } from "configs";
import { Token, TokenAmount } from "l0k_swap-sdk";
import { useEffect, useRef, useState } from "react";
import { twMerge } from "tailwind-merge";
import { eth, tether } from "../../assets";
import { SelectTokenModalHeader } from "./components/SelectTokenModalHeader";
import { SearchIcon } from "./icons";

interface ISelectTokenModal {
  isShowing: boolean;
  token0: Token | undefined;
  token1: Token | undefined;
  typeModal: number;
  balances: (TokenAmount | undefined)[] | undefined;
  setToken: (t: {
    INPUT: Token | undefined;
    OUTPUT: Token | undefined;
  }) => void;
  hide: (v: boolean) => void;
}

const SelectTokenModal: React.FC<ISelectTokenModal> = ({
  isShowing,
  token0,
  token1,
  typeModal,
  balances,
  setToken,
  hide,
}) => {
  const [searchValue, setSearchValue] = useState("");

  const handleInputChange = (event: any) => {
    let tokenAddress = event.target.value;
    setSearchValue(tokenAddress);
  };

  const handleSelectToken = (item: Token) => {
    if (token0 === undefined || token1 === undefined) {
      return;
    }
    if (typeModal === 1) {
      if (item.name === token0.name) return;
      if (item.name === token1.name) {
        setToken({
          [Field.INPUT]: token1,
          [Field.OUTPUT]: token0,
        });
      } else {
        setToken({
          [Field.INPUT]: item,
          [Field.OUTPUT]: token1,
        });
      }
    } else {
      if (item.name === token1.name) return;
      if (item.name === token0.name) {
        setToken({
          [Field.INPUT]: token1,
          [Field.OUTPUT]: token0,
        });
        return;
      } else {
        setToken({
          [Field.INPUT]: token0,
          [Field.OUTPUT]: item,
        });
      }
    }
    hide(false);
  };

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

  if (token0 === undefined || token1 === undefined || balances === undefined) {
    return <></>;
  }

  return (
    <div>
      <div className={`modal-overlay`}>
        <div
          ref={wrapperRef}
          className={twMerge(
            "flex flex-col items-center gap-3 modal-content-token"
          )}
        >
          <SelectTokenModalHeader close={() => hide(false)} />
          <Input
            prefix={<SearchIcon />}
            placeholder="Search"
            value={searchValue}
            onChange={handleInputChange}
            className="input-pl bg-[#131216] p-3 text-sm font-normal border-none text-[rgba(255,255,255,0.5)]"
          />
          <div className="flex flex-wrap items-start content-start self-stretch gap-3 cursor-pointer">
            {TOKEN_LIST[APP_CHAIN_ID].map((token, idx) => (
              <div
                key={idx}
                className="flex items-center gap-2 border-[1px] border-[#323135] bg-[#1D1C21] py-[7px] px-3 shadow-[0_2px_12px_0px_rgba(11,14,25,0.12)]"
              >
                <img
                  src={getTokenIcon(token.address)}
                  alt=""
                  className="w-5 h-5"
                />
                <span className="text-sm font-medium">{token.name}</span>
              </div>
            ))}
            {/* <div className="flex items-center gap-2 border-[1px] border-[#323135] bg-[#1D1C21] py-[7px] px-3 shadow-[0_2px_12px_0px_rgba(11,14,25,0.12)]">
              <img
                src={getTokenIcon(token0.address)}
                alt=""
                className="w-5 h-5"
              />
              <span className="text-sm font-medium">{token0.name}</span>
            </div>
            <div className="flex items-center gap-2 border-[1px] border-[#323135] bg-[#1D1C21] py-[7px] px-3 shadow-[0_2px_12px_0px_rgba(11,14,25,0.12)]">
              <img
                src={getTokenIcon(token1.address)}
                alt=""
                className="w-5 h-5"
              />
              <span className="text-sm font-medium">{token1.name}</span>
            </div> */}
          </div>
          <div className="flex flex-col items-center self-stretch gap-3">
            <div className="flex justify-between items-center self-stretch text-sm font-medium text-[rgba(255,255,255,0.5)]">
              <span>Asset</span>
              <span>Balance</span>
            </div>
          </div>
          <div className="flex flex-col items-start self-stretch gap-1">
            {searchValue === "" && (
              <>
                {TOKEN_LIST[APP_CHAIN_ID].map((token: Token, index: number) => {
                  return (
                    <div
                      key={index}
                      className="flex items-center justify-between self-stretch border-b-[1px] bg-[#131216] p-3 border-b-[#323135] shadow-[0_2px_12px_0px_rgba(11,14,25,0.12)] cursor-pointer hover:border-[#27E3AB] hover:border-[1px]"
                      onClick={() => {
                        handleSelectToken(token);
                      }}
                    >
                      <div className="flex items-center gap-2">
                        <img
                          src={getTokenIcon(token.address)}
                          alt={token.name}
                          className="h-7 w-7"
                        />
                        <div className="flex flex-col items-start justify-center gap-[1px]">
                          <span className="text-base font-medium">
                            {token.symbol}
                          </span>
                          <span className="text-xs font-medium text-[rgba(255,255,255,0.5)]">
                            {token.name}
                          </span>
                        </div>
                      </div>
                      <div className="flex flex-col items-start justify-center gap-[1px]">
                        <span className="text-base font-medium">
                          {balances
                            .find((b) => b?.token.name === token.name)
                            ?.toSignificant(3)}
                        </span>
                        <span className="text-xs font-medium text-[rgba(255,255,255,0.5)]">
                          --
                        </span>
                      </div>
                    </div>
                  );
                })}
              </>
            )}
            {/* {searchValue.length > 0 ? (
							searchToken(searchValue).length >
							0 ? (
								<>
									{searchToken(searchValue).map(
										(item: any, index: any) => {
											return (
												<div
													key={index}
													className="flex items-center justify-between self-stretch border-[1px] bg-[#131216] p-3 border-[#323135] shadow-[0_2px_12px_0px_rgba(11,14,25,0.12)] cursor-pointer hover:border-[#27E3AB] hover:border-[1px]"
													onClick={() => {
														handleSelectToken(
															item
														);
													}}
												>
													<div className="flex items-center gap-2">
														<img
															src={item.icon}
															alt={item.name}
															className="h-7 w-7"
														/>
														<div className="flex flex-col items-start justify-center gap-[1px]">
															<span className="text-base font-medium">
																{item.name}
															</span>
															<span className="text-xs font-medium text-[rgba(255,255,255,0.5)]">
																{checkSubName(
																	item.name
																)}
															</span>
														</div>
													</div>
													<div className="flex flex-col items-start justify-center gap-[1px]">
														<span className="text-base font-medium">
															0.00
														</span>
														<span className="text-xs font-medium text-[rgba(255,255,255,0.5)]">
															$0.00
														</span>
													</div>
												</div>
											);
										}
									)}
								</>
							) : (
								<>Token not found!</>
							)
						) : (
							<></>
						)} */}
          </div>
        </div>
      </div>
    </div>
  );
};

interface IToken {
  name: string;
  image: string;
}

const listToken = (): IToken[] => [
  {
    name: "ETH",
    image: eth,
  },
  {
    name: "Tether",
    image: tether,
  },
];

export default SelectTokenModal;
