import { Token, TokenAmount, Trade, Pair } from "l0k_swap-sdk";
import {
  APP_CHAIN_ID,
  BASES_TO_CHECK_TRADES_AGAINST,
  CUSTOM_BASES,
  FACTORY_ADDRESS,
} from "../configs";
import { flatMap } from "lodash";
import { Abi, AccountInterface, Contract, RpcProvider, num } from "starknet";
import PairAbi from "../abis/Pair.json";

export enum PairState {
  LOADING,
  NOT_EXISTS,
  EXISTS,
  INVALID,
}

export async function usePairs(
  library: AccountInterface | RpcProvider,
  tokens: [Token | undefined, Token | undefined][]
): Promise<Array<[PairState, Pair | undefined | null]>> {
  const pairAddresses = await Promise.all(
    tokens.map(([tokenA, tokenB]) => {
      return tokenA && tokenB && !tokenA.equals(tokenB)
        ? library
            .callContract({
              contractAddress: FACTORY_ADDRESS[APP_CHAIN_ID],
              entrypoint: "get_pair",
              calldata: [tokenA.address, tokenB.address],
            })
            .then((res) => res.result[0])
        : undefined;
    })
  );

  const contracts = !pairAddresses
    ? undefined
    : pairAddresses.map((address) =>
        address ? new Contract(PairAbi as Abi, address, library) : undefined
      );

  const methods = contracts?.map(() => "getReserves");

  if (!contracts) return [];
  // const { states } = useStarknetCalls(contracts, methods)
  const states = await Promise.all(
    contracts.map((c) => {
      if (!c) return undefined;
      return library
        .callContract({
          contractAddress: c.address,
          entrypoint: "getReserves",
          calldata: [],
        })
        .then((res) => res.result);
    })
  );

  if (!states) {
    return [[PairState.LOADING, null]];
  }

  return states?.map((reserves, i) => {
    const tokenA = tokens[i]?.[0];
    const tokenB = tokens[i]?.[1];

    // if (states) return [PairState.LOADING, null]
    if (!tokenA || !tokenB || tokenA.equals(tokenB))
      return [PairState.INVALID, undefined];
    if (!reserves) return [PairState.NOT_EXISTS, undefined];
    const reserve0 = num.hexToDecimalString(reserves[0]);
    const reserve1 = num.hexToDecimalString(reserves[2]);
    const [token0, token1] = tokenA.sortsBefore(tokenB)
      ? [tokenA, tokenB]
      : [tokenB, tokenA];
    return [
      PairState.EXISTS,
      new Pair(
        new TokenAmount(token0, reserve0.toString()),
        new TokenAmount(token1, reserve1.toString())
      ),
    ];
  });
}

async function useAllCommonPairs(
  library: AccountInterface | RpcProvider,
  currencyA: Token | null | undefined,
  currencyB: Token | null | undefined
): Promise<[Pair[], boolean]> {
  // const {
  //   state: { chainId },
  // } = useStarknet()

  // Base tokens for building intermediary trading routes
  const bases = BASES_TO_CHECK_TRADES_AGAINST[APP_CHAIN_ID];

  // All pairs from base tokens
  const basePairs = flatMap(bases, (base): [Token, Token][] =>
    bases.map((otherBase) => [base, otherBase])
  ).filter(([t0, t1]) => t0.address !== t1.address);

  const tokens = [currencyA, currencyB];

  const allPairCombinations =
    !tokens[0] || !tokens[1]
      ? []
      : [
          // the direct pair
          [tokens[0], tokens[1]],
          // token A against all bases
          ...bases.map((base): [Token, Token] => [tokens[0] as Token, base]),
          // token B against all bases
          ...bases.map((base): [Token, Token] => [tokens[1] as Token, base]),
          // each base against all bases
          ...basePairs,
        ]
          .filter((tokens): tokens is [Token, Token] =>
            Boolean(tokens[0] && tokens[1])
          )
          .filter(([t0, t1]) => t0.address !== t1.address)
          // This filter will remove all the pairs that are not supported by the CUSTOM_BASES settings
          .filter(([t0, t1]) => {
            if (!APP_CHAIN_ID) return true;
            const customBases = CUSTOM_BASES[APP_CHAIN_ID];
            if (!customBases) return true;

            const customBasesA: Token[] | undefined = customBases[t0.address];
            const customBasesB: Token[] | undefined = customBases[t1.address];

            if (!customBasesA && !customBasesB) return true;
            if (customBasesA && !customBasesA.find((base) => t1.equals(base)))
              return false;
            if (customBasesB && !customBasesB.find((base) => t0.equals(base)))
              return false;

            return true;
          });

  const allPairs = await usePairs(library, allPairCombinations);

  // only pass along valid pairs, non-duplicated pairs
  return [
    Object.values(
      allPairs
        // filter out invalid pairs
        .filter((result): result is [PairState.EXISTS, Pair] =>
          Boolean(result[0] === PairState.EXISTS && result[1])
        )
        // filter out duplicated pairs
        .reduce<{ [pairAddress: string]: Pair }>((memo, [, curr]) => {
          memo[curr.liquidityToken.address] =
            memo[curr.liquidityToken.address] ?? curr;
          return memo;
        }, {})
    ),
    !!allPairs.some(([pairState]) => pairState === PairState.LOADING),
  ];
}

/**
 * Returns the best trade for the exact amount of tokens in to the given token out
 */
export async function useTradeExactIn(
  library: AccountInterface | RpcProvider,
  currencyAmountIn: TokenAmount | undefined,
  currencyOut: Token | null | undefined
): Promise<Trade | undefined | null> {
  const currencyIn = currencyAmountIn?.token;
  const allowedPairs = await useAllCommonPairs(
    library,
    currencyIn,
    currencyOut
  );

  if (allowedPairs[1]) {
    return null;
  }
  if (currencyAmountIn && currencyOut && allowedPairs[0].length > 0) {
    return (
      Trade.bestTradeExactIn(allowedPairs[0], currencyAmountIn, currencyOut, {
        maxHops: 3,
        maxNumResults: 1,
      })[0] ?? undefined
    );
  }
  return undefined;
}

/**
 * Returns the best trade for the token in to the exact amount of token out
 */
export async function useTradeExactOut(
  library: AccountInterface | RpcProvider,
  currencyIn: Token | null | undefined,
  currencyAmountOut: TokenAmount | undefined
): Promise<Trade | undefined | null> {
  const out = currencyAmountOut?.token;
  const allowedPairs = await useAllCommonPairs(library, currencyIn, out);

  if (allowedPairs[1]) {
    return null;
  }
  if (currencyIn && currencyAmountOut && allowedPairs[0].length > 0) {
    return (
      Trade.bestTradeExactOut(allowedPairs[0], currencyIn, currencyAmountOut, {
        maxHops: 3,
        maxNumResults: 1,
      })[0] ?? undefined
    );
  }
  return undefined;
}
