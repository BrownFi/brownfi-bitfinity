import { create } from "zustand";

export const useWeb3Store = create<{
  txHash: string | undefined;
}>((set) => ({
  txHash: undefined,
}));
