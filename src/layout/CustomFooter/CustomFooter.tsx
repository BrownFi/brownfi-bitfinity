import { Image, Layout, Typography } from "antd";
import { FC } from "react";
import { discord, footer_logo, medium, twitter } from "../../assets";

const { Footer } = Layout;
const { Text } = Typography;

export const SOCIAL = [
  {
    link: "#",
    icon: twitter,
    text: "Twitter",
  },
  {
    link: "#",
    icon: medium,
    text: "Medium",
  },
  {
    link: "#",
    icon: discord,
    text: "Discord",
  },
];

const CustomFooter: FC = () => {
  return (
    <Footer className="fixed bottom-0 w-full flex py-4 px-[108px] justify-center items-center gap-6 bg-[#0E0D10]">
      <div className="flex flex-col items-start flex-1 gap-4">
        <img src={footer_logo} alt="" />
        <Text className="text-xs font-medium leading-[18px] font-['Montserrat'] text-white opacity-60">
          © 2024 BrownFi. All rights reserved.
        </Text>
      </div>
      <div className="flex items-start gap-10">
        {SOCIAL.map((item, idx) => (
          <a key={idx} href={item.link}>
            <Image src={item.icon} alt="" />
          </a>
        ))}
      </div>
    </Footer>
  );
};

export default CustomFooter;
