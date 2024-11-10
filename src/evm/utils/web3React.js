import { InjectedConnector } from "@web3-react/injected-connector";
import { StaticJsonRpcProvider } from "@ethersproject/providers";
import sample from "lodash/sample";

export const CHAIN_ID = {
  // ZETA_MAINNET: 7000,
  ZETA_TESTNET: 7001,
  // OPSIDE_MAINNET: 23118,
  STARKSPRT_OPSIDE_ROLLUP: 12029,
};

export const NETWORKS_SUPPORTED = {
  [CHAIN_ID.ZETA_TESTNET]: {
    name: "Zeta Testnet",
    chainId: CHAIN_ID.ZETA_TESTNET,
    rpc: ["https://zetachain-athens-evm.blockpi.network/v1/rpc/public"],
    explorer: "https://athens3.explorer.zetachain.com/",
    nativeCoin: {
      name: "Zeta",
      symbol: "ZETA",
      decimals: 18,
    },
  },
  [CHAIN_ID.STARKSPRT_OPSIDE_ROLLUP]: {
    name: "Opside Testnet",
    chainId: CHAIN_ID.STARKSPRT_OPSIDE_ROLLUP,
    rpc: ["https://pre-alpha-zkrollup-rpc.opside.network/starksport-rollup"],
    explorer: "https://starksport-rollup.zkevm.opside.info/",
    nativeCoin: {
      name: "SFN",
      symbol: "SFN",
      decimals: 18,
    },
  },
};

const rpcNode = sample(NETWORKS_SUPPORTED[CHAIN_ID.ZETA_TESTNET].rpc);

export const injected = new InjectedConnector({
  supportedChainIds: [...Object.values(CHAIN_ID)],
});

export const connectorByNames = {
  injected,
};

export const simpleRpcProvider = new StaticJsonRpcProvider(rpcNode);

export const getNetwork = (chainId) => {
  switch (chainId) {
    case CHAIN_ID.STARKSPRT_OPSIDE_ROLLUP:
      return NETWORKS_SUPPORTED[CHAIN_ID.STARKSPRT_OPSIDE_ROLLUP];

    default:
      return NETWORKS_SUPPORTED[CHAIN_ID.ZETA_TESTNET];
  }
};

export const setupDefaultNetwork = async (chainId) => {
  const network = getNetwork(chainId);
  const rpc = sample(network.rpc);
  const provider = window.ethereum;
  const _chainId = `0x${network.chainId.toString(16)}`;
  if (provider) {
    try {
      await provider.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: _chainId }],
      });
    } catch (switchError) {
      try {
        await provider.request({
          method: "wallet_addEthereumChain",
          params: [
            {
              chainId: _chainId,
              chainName: network.name,
              nativeCurrency: {
                name: network.nativeCoin.name,
                symbol: network.nativeCoin.symbol,
                decimals: network.nativeCoin.decimals,
              },
              rpcUrls: [rpc],
              blockExplorerUrls: [network.explorer],
            },
          ],
        });
        return true;
      } catch (error) {
        console.error("Failed to setup the network in Metamask:", error);
        return false;
      }
    }
  } else {
    console.error(
      "Can't setup the network on metamask because window.ethereum is undefined"
    );
    return false;
  }
};
