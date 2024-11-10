import { FC, useEffect, useMemo, useState } from "react";
import { DownOutlined } from "@ant-design/icons";
import { Dropdown, Button, Typography } from "antd";
import type { MenuProps } from "antd";
import { ethereum_Logo } from "../assets";
import { useWindowWidthAndHeight } from "../hooks";
import { useAccount } from "@starknet-react/core";
import { goerli, mainnet, sepolia } from "@starknet-react/chains";

const styles = {
  item: {
    fontWeight: "500",
    fontFamily: "Roboto, sans-serif",
    fontSize: "14px",
  },
  button: {
    display: "flex",
    alignItems: "center",
    height: "56px",
    border: "none",
    boxShadow: "none",
    background: "#1E1E1E",
  },
};

type MenuItem = Required<MenuProps>["items"][number];

declare let window: any;

const ChainSelector: FC = () => {
  const { chainId } = useAccount();
  const { isMobile } = useWindowWidthAndHeight();
  const [selected, setSelected] = useState<MenuItem>();
  const [label, setLabel] = useState<JSX.Element>();

  const labelToShow = (logo: string, alt: string) => {
    return (
      <div
        style={{
          display: "inline-flex",
          alignItems: "center",
        }}
      >
        <img
          src={logo}
          alt={alt}
          style={{
            width: "25px",
            height: "25px",
            borderRadius: "10px",
            marginRight: "5px",
          }}
        />
      </div>
    );
  };

  const items: MenuProps["items"] = useMemo(
    () => [
      // {
      // 	label: goerli.network,
      // 	key: goerli.network,
      // 	icon: labelToShow(
      // 		ethereum_Logo,
      // 		goerli.name
      // 	),
      // },
      {
        label: sepolia.network,
        key: sepolia.network,
        icon: labelToShow(ethereum_Logo, sepolia.name),
      },
      // {
      // 	label: mainnet.network,
      // 	key: mainnet.network,
      // 	icon: labelToShow(
      // 		ethereum_Logo,
      // 		mainnet.name
      // 	),
      // },
    ],
    []
  );

  useEffect(() => {
    if (!chainId) return;

    let selectedLabel;
    let tempSelected = "";
    if (chainId?.toString() === "1536727068981429685321") {
      tempSelected = goerli.network;
      selectedLabel = labelToShow(ethereum_Logo, goerli.name);
    } else if (chainId?.toString() === "23448594291968334") {
      tempSelected = mainnet.network;
      selectedLabel = labelToShow(ethereum_Logo, mainnet.name);
    } else {
      tempSelected = sepolia.network;
      selectedLabel = labelToShow(ethereum_Logo, sepolia.name);
    }
    setLabel(selectedLabel);
    setSelected(items.find((item) => item?.key === tempSelected));
  }, [chainId]);

  const onClick: MenuProps["onClick"] = async ({ key }) => {
    if (!chainId) return;
    try {
      await window.starknet.request({
        type: "wallet_switchStarknetChain",
        params: {
          chainId:
            key === "mainnet"
              ? `SN_MAIN`
              : `SN_${key.toString().toUpperCase()}`,
        },
      });
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div>
      {/* <Dropdown menu={{ items, onClick }}> */}
      <Dropdown menu={{ items, onClick }}>
        <Button
          style={{
            ...styles.button,
            ...styles.item,
          }}
        >
          {!selected && (
            <Typography className="text-base font-medium text-white leading-[24px] font-['Montserrat']">
              Select Chain
            </Typography>
          )}
          {selected && isMobile && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                minWidth: "25px",
              }}
            >
              <Typography className="text-base font-medium text-white leading-[24px] font-['Montserrat'] pt-[5px]">
                {label}
              </Typography>
            </div>
          )}
          {selected && !isMobile && (
            <div className="flex items-center">
              <Typography className="text-base font-medium text-white leading-[24px] font-['Montserrat'] pt-[5px]">
                {label}
              </Typography>
              <Typography className="text-base font-medium text-white leading-[24px] font-['Montserrat'] mr-[10px]">
                {selected.key?.toString()}
              </Typography>
            </div>
          )}
          <DownOutlined />
        </Button>
      </Dropdown>
    </div>
  );
};

export default ChainSelector;
