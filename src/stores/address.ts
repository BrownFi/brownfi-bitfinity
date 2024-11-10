import { create } from "zustand";

export const useAccountState = create<{
  address: string | undefined;
}>((set) => ({
  address: undefined,
}));
