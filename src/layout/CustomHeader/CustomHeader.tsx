import { Layout } from "antd";
import { FC, useState } from "react";
import { Link, useMatch } from "react-router-dom";
import { twMerge } from "tailwind-merge";
import { logo } from "../../assets";
import ConnectAccount from "../../components/Account/ConnectAccount";
import ConnectAccountICP from "components/Account/ConnectAccountICP";
import ChainSelector from "../../components/ChainSelector";
import { useWindowWidthAndHeight } from "../../hooks";

const { Header } = Layout;

const styles = {
  header: {
    position: "fixed",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
    backgroundColor: "transparent",
    padding: "20px 44px",
    zIndex: 1,
  },
  headerRight: {
    display: "flex",
    gap: "10px",
    alignItems: "center",
    fontSize: "15px",
    fontWeight: "600",
  },
} as const;

type CustomHeaderProps = {
  isDarkMode: boolean;
  setIsDarkMode: React.Dispatch<React.SetStateAction<boolean>>;
};

const CustomHeader: FC<CustomHeaderProps> = ({ isDarkMode, setIsDarkMode }) => {
  const { isMobile } = useWindowWidthAndHeight();
  // const location = useNoti();
  const [isShowModalConnect, setIsShowModalConnect] = useState(false);
  // const toggleColorMode = () => {
  //   setIsDarkMode((previousValue) => !previousValue);
  // };

  return (
    <Header
      style={{
        ...styles.header,
        padding: isMobile ? "15px 5px 0 5px" : "20px 44px",
      }}
    >
      <div className="flex gap-[44px]">
        <img src={logo} alt="" />
        <div className="flex items-center gap-4">
          <Link to="/swap" className="flex h-10 px-4 py-2">
            <span
              className={twMerge(
                "text-base font-['Russo_One'] hover:text-[#27E3AB] transition-all",
                Boolean(useMatch("/swap"))
                  ? "text-[#27E3AB]"
                  : "text-[#ffffff80]"
              )}
            >
              Swap
            </span>
          </Link>
          <Link to="/pools" className="flex h-10 px-4 py-2">
            <span
              className={twMerge(
                "text-base font-['Russo_One'] hover:text-[#27E3AB] transition-all",
                Boolean(useMatch("/pools"))
                  ? "text-[#27E3AB]"
                  : "text-[#ffffff80]"
              )}
            >
              Pools
            </span>
          </Link>
        </div>
      </div>
      <div className="flex gap-4">
        {/* <ChainSelector /> */}
        {/* <ConnectAccount /> */}
        <ConnectAccountICP />
      </div>
    </Header>
  );
};

export default CustomHeader;

type LogoProps = {
  isDarkMode: boolean;
};

export const Logo: FC<LogoProps> = ({ isDarkMode }) => {
  const { isMobile } = useWindowWidthAndHeight();

  return (
    <div>
      <img src={logo} alt="web3Boilerplate_logo" />
    </div>
  );
};
