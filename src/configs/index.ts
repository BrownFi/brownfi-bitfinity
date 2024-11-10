import { eth, strk } from "../assets";
import { StarknetChainId, Token, Percent, JSBI } from "l0k_swap-sdk";
import { sample } from "lodash";
import { RpcProvider } from "starknet";

export const APP_CHAIN_ID = StarknetChainId.TESTNET;
// process.env.NODE_ENV === "production"
// 	? StarknetChainId.MAINNET
// 	: StarknetChainId.TESTNET;

export const NETWORKS_SUPPORTED = {
  [StarknetChainId.MAINNET]: {
    name: "Starknet Mainnet",
    rpc: ["https://starknet-mainnet.public.blastapi.io"],
  },
  [StarknetChainId.TESTNET]: {
    name: "Starknet Sepolia",
    rpc: ["https://starknet-sepolia.public.blastapi.io/rpc/v0_7"],
  },
};

export const WETH = {
  [StarknetChainId.MAINNET]: new Token(
    StarknetChainId.MAINNET,
    "0x49d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7",
    18,
    "ETH",
    "Ether"
  ),
  [StarknetChainId.TESTNET]: new Token(
    "SN_SEPOLIA" as any,
    "0x49d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7",
    18,
    "ETH",
    "Ether"
  ),
};

export const STRK = {
  [StarknetChainId.MAINNET]: new Token(
    StarknetChainId.MAINNET,
    "0x4718f5a0fc34cc1af16a1cdee98ffb20c31f5cd61d6ab07201858f4287c938d",
    18,
    "STRK",
    "STRK"
  ),
  [StarknetChainId.TESTNET]: new Token(
    "SN_SEPOLIA" as any,
    "0x4718f5a0fc34cc1af16a1cdee98ffb20c31f5cd61d6ab07201858f4287c938d",
    18,
    "STRK",
    "STRK"
  ),
};

export const OracleAddress = {
  ETH: "0x8ed94479864161b612f4d77555e3a71089b2bfcae2d544e09b617113932611",
  STRK: "0xa5db422ee7c28beead49303646e44ef9cbb8364eeba4d8af9ac06a3b556937",
};

// used to construct intermediary pairs for trading
export const BASES_TO_CHECK_TRADES_AGAINST = {
  [StarknetChainId.MAINNET]: [WETH[StarknetChainId.MAINNET]],
  [StarknetChainId.TESTNET]: [WETH[StarknetChainId.TESTNET]],
};

export const CUSTOM_BASES: {
  [key in StarknetChainId]: {
    [key: string]: Token[];
  };
} = {
  [StarknetChainId.MAINNET]: {},
  [StarknetChainId.TESTNET]: {},
};

export const TOKEN_LIST = {
  [StarknetChainId.MAINNET]: [WETH[StarknetChainId.MAINNET]],
  [StarknetChainId.TESTNET]: [
    WETH[StarknetChainId.TESTNET],
    STRK[StarknetChainId.TESTNET],
    // new Token(
    //   "SN_SEPOLIA" as any,
    //   "0x07e0a8b80a3d17ee281f2844acc03647398bb5464a7a34a97693e82bf3635196",
    //   18,
    //   "BrownFi",
    //   "BRFI"
    // ),
  ],
};

export const TOKEN_ICON_LIST = {
  [StarknetChainId.MAINNET]: {
    [WETH[StarknetChainId.MAINNET].address]: eth,
    [STRK[StarknetChainId.MAINNET].address]: strk,
  },
  [StarknetChainId.TESTNET]: {
    [WETH[StarknetChainId.TESTNET].address]: eth,
    [STRK[StarknetChainId.TESTNET].address]: strk,
  },
};

export const UNKNOWN_TOKEN_ICON =
  "https://icones.pro/wp-content/uploads/2021/05/icone-point-d-interrogation-question-noir.png";

// New contract
// export const FACTORY_ADDRESS = {
//   [StarknetChainId.MAINNET]: "",
//   [StarknetChainId.TESTNET]:
//     "0x053af37eceb29beb1bdcb5ea48da0d6589630817bf7b8fbe058cab2d58eabcc6",
// };

// export const ROUTER_ADDRESS = {
//   [StarknetChainId.MAINNET]: "",
//   [StarknetChainId.TESTNET]:
//     "0x0294c5510f49a0137d478446016f55f543df1b47daae154278fc01229d8a4cf7",
// };

export const FACTORY_ADDRESS = {
  [StarknetChainId.MAINNET]: "",
  [StarknetChainId.TESTNET]:
    "0x0496f2f7cb284830ed95d47198a5aa0ebc4342cc8ef76ba68f4ddef2b9f4bf84",
};

export const ROUTER_ADDRESS = {
  [StarknetChainId.MAINNET]: "",
  [StarknetChainId.TESTNET]:
    "0x046a4e721dddf1da843c227cf7a648b7a69f9b9b3d4076a03d65055374a69442",
};

export const PAIR_ADDRESS = {
  [StarknetChainId.MAINNET]: "",
  [StarknetChainId.TESTNET]:
    "0x52a5a784db07b16f6ce663677bfd6379559a0691c3ba2feb8d20889c2bacf39",
};

export enum Field {
  INPUT = "INPUT",
  OUTPUT = "OUTPUT",
}

export const MAX_TRADE_HOPS = 3;

export const BETTER_TRADE_LESS_HOPS_THRESHOLD = new Percent(
  JSBI.BigInt(50),
  JSBI.BigInt(10000)
);

export const ZERO_PERCENT = new Percent("0");
export const ONE_HUNDRED_PERCENT = new Percent("1");
export const FIVE_PERCENT = new Percent(JSBI.BigInt(5), JSBI.BigInt(100));
export const SWAP_FEE_PERCENT = new Percent(JSBI.BigInt(97), JSBI.BigInt(100));

export const BIPS_BASE = JSBI.BigInt(10000);

export const SN_RPC_PROVIDER = () =>
  new RpcProvider({
    nodeUrl: sample(NETWORKS_SUPPORTED[APP_CHAIN_ID].rpc)!,
  });

export const getTokenIcon = (address: string | undefined) => {
  return address
    ? TOKEN_ICON_LIST[APP_CHAIN_ID][address] ?? UNKNOWN_TOKEN_ICON
    : UNKNOWN_TOKEN_ICON;
};
