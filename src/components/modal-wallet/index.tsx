import { useConnect } from "@starknet-react/core";
import { useEffect, useRef, useState } from "react";
import { argent, braavos, okx, switch_network } from "../../assets";
import { IconBack } from "../BackIcon";
import { CloseIcon } from "../CloseIcon";
import { Divider } from "../settings-modal";

const ModalWallet = ({
  isShowing,
  hide,
}: {
  isShowing: boolean;
  hide: any;
}) => {
  const { connect, connectors } = useConnect();
  const [showWallet, setShowWallet] = useState(false);
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

  const getConnectorName = (connectorName: string) => {
    switch (connectorName) {
      case "argentX":
        return "ArgentX";
      case "braavos":
        return "Braavos";
      default:
        return "OkxWallet";
    }
  };

  const getConnectorIcon = (connectorName: string) => {
    switch (connectorName) {
      case "argentX":
        return argent;
      case "braavos":
        return braavos;
      default:
        return okx;
    }
  };

  return (
    <>
      {isShowing && (
        <>
          <div className="modal-overlay-v1"></div>
          <div
            className="modal-wrapper-wallet"
            aria-modal
            aria-hidden
            tabIndex={-1}
            role="dialog"
          >
            <div
              ref={wrapperRef}
              className="relative z-[100] m-auto max-w-[480px] bg-[#1D1C21] pt-9"
            >
              <div className="flex flex-col items-start self-stretch gap-3 px-6">
                <div className="flex items-start self-stretch justify-between">
                  {showWallet ? (
                    <div className="flex items-center gap-[6px]">
                      <IconBack onClick={() => setShowWallet(false)} />
                      <span className="text-[#F1F1F1] text-2xl font-bold ">
                        Connect Wallet
                      </span>
                    </div>
                  ) : (
                    <span className="text-[#F1F1F1] text-2xl font-bold ">
                      Connect Wallet
                    </span>
                  )}
                  <CloseIcon onClick={() => hide(false)} />
                </div>
                <Divider />
              </div>
              {!showWallet ? (
                <div className="flex px-6 pt-6 pb-9 flex-col items-start gap-[10px]">
                  <div
                    className="flex h-12 py-3 pl-3 pr-6 items-center gap-3 self-stretch border-[1px] border-[#2D313E] hover:bg-[#2D313E] cursor-pointer"
                    onClick={() => setShowWallet(true)}
                  >
                    <img src={switch_network} alt="" className="w-6 h-6" />
                    <span className="text-base font-bold  text-[#F1F1F1]">
                      Starknet
                    </span>
                  </div>
                </div>
              ) : (
                <div className="flex px-6 pt-6 pb-9 flex-col items-start gap-[10px]">
                  {connectors.map((connector) => {
                    return (
                      <button
                        className="flex h-12 py-3 pl-3 pr-6 items-center gap-3 self-stretch border-[1px] border-[#2D313E] hover:bg-[#2D313E] cursor-pointer"
                        key={connector.id}
                        onClick={() => {
                          connect({ connector });
                        }}
                        disabled={status === "pending"}
                      >
                        <img
                          src={getConnectorIcon(connector.id)}
                          alt=""
                          className="w-6 h-6"
                        />
                        <span className="text-base font-bold text-[#F1F1F1]">
                          {getConnectorName(connector.id)}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default ModalWallet;
