import { formatUnits, parseUnits } from "ethers/lib/utils";
import { useTradeExactIn, useTradeExactOut } from "hooks/trades";
import { JSBI, Token, TokenAmount, Trade } from "l0k_swap-sdk";
import { AccountInterface, cairo, Contract, num, RpcProvider } from "starknet";
import PairAbi from "../abis/Pair.json";
import RouterAbi from "../abis/Router.json";
import {
  APP_CHAIN_ID,
  FACTORY_ADDRESS,
  Field,
  PAIR_ADDRESS,
  ROUTER_ADDRESS,
} from "../configs";

// try to parse a user entered amount for a given token
export const tryParseAmount = (
  value: string,
  currency: Token | undefined
): TokenAmount | undefined => {
  if (!value || !currency) {
    return undefined;
  }
  try {
    const typedValueParsed = parseUnits(value, currency.decimals).toString();
    if (typedValueParsed !== "0") {
      return new TokenAmount(currency, JSBI.BigInt(typedValueParsed));
    }
  } catch (error) {
    // should fail if the user specifies too many decimal places of precision (or maybe exceed max uint?)
    console.debug(`Failed to parse input amount: "${value}"`, error);
  }
  // necessary for all paths to return a value
  return undefined;
};

// from the current swap inputs, compute the best trade and return it.
export const useDerivedSwapInfo = async ({
  library,
  independentField = Field.INPUT,
  typedValue,
  tokens,
  singlehops,
}: {
  library: AccountInterface | RpcProvider;
  independentField: Field;
  typedValue: string | BigInt;
  tokens: {
    [key in Field]: Token | undefined;
  };
  singlehops: boolean;
}): Promise<any> => {
  if (!library) return null;
  const { [Field.INPUT]: inputCurrency, [Field.OUTPUT]: outputCurrency } =
    tokens;
  if (!inputCurrency || !outputCurrency) return null;

  const isExactIn = independentField === Field.INPUT;
  const parsedAmount = tryParseAmount(
    typedValue.toString(),
    (isExactIn ? inputCurrency : outputCurrency) ?? undefined
  );
  // if (!parsedAmount) return null;

  const [bestTradeExactIn, bestTradeExactOut] = await Promise.all([
    useTradeExactIn(library, parsedAmount, outputCurrency),
    useTradeExactOut(library, inputCurrency, parsedAmount),
  ]);

  const trade = isExactIn ? bestTradeExactIn : bestTradeExactOut;

  return trade;
};

export const useGetAmount = async ({
  library,
  independentField = Field.INPUT,
  typedValue,
  tokens,
}: {
  library: AccountInterface | RpcProvider;
  independentField: Field;
  typedValue: string | BigInt;
  tokens: {
    [key in Field]: Token | undefined;
  };
}) => {
  if (!library) return null;
  const { [Field.INPUT]: inputCurrency, [Field.OUTPUT]: outputCurrency } =
    tokens;
  if (!inputCurrency || !outputCurrency) return null;
  const isExactIn = independentField === Field.INPUT;
  const parsedAmount = tryParseAmount(
    typedValue.toString(),
    (isExactIn ? inputCurrency : outputCurrency) ?? undefined
  );
  let bestAmount: any;
  if (isExactIn) {
    bestAmount = await getAmountOut(
      library,
      inputCurrency,
      parsedAmount?.raw.toString()
    );
  } else {
    bestAmount = await getAmountIn(
      library,
      outputCurrency,
      parsedAmount?.raw.toString()
    );
  }
  if (!bestAmount?.result[0]) return null;

  return formatUnits(
    num.hexToDecimalString(bestAmount?.result[0]),
    isExactIn ? outputCurrency.decimals : inputCurrency.decimals
  );
};

export const getOraclePriceOf = async (
  library: AccountInterface | RpcProvider,
  currencies: (Token | undefined)[]
): Promise<any> => {
  const [tokenA, tokenB] = currencies;
  if (!library || !tokenA || !tokenB) {
    return null;
  }
  try {
    const oraclePriceTokenA = await library.callContract({
      contractAddress: FACTORY_ADDRESS[APP_CHAIN_ID],
      entrypoint: "price_of",
      calldata: [tokenA.address],
    });

    const oraclePriceTokenB = await library.callContract({
      contractAddress: FACTORY_ADDRESS[APP_CHAIN_ID],
      entrypoint: "price_of",
      calldata: [tokenB.address],
    });

    return {
      oraclePriceTokenA,
      oraclePriceTokenB,
    };
  } catch (error) {
    console.log(error);
    throw error;
  }
};

export const getAmountIn = async (
  library: AccountInterface | RpcProvider,
  currencyOut: Token | null | undefined,
  currencyAmountOut: string | undefined
): Promise<any> => {
  if (!library || !currencyOut || !currencyAmountOut) {
    return;
  }
  try {
    const amount = await library.callContract({
      contractAddress: PAIR_ADDRESS[APP_CHAIN_ID],
      entrypoint: "get_amount_in",
      calldata: [currencyOut.address, cairo.uint256(currencyAmountOut)],
    });
    return amount;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

export const getAmountOut = async (
  library: AccountInterface | RpcProvider,
  currencyIn: Token | null | undefined,
  currencyAmountIn: string | undefined
): Promise<any> => {
  if (!library || !currencyIn || !currencyAmountIn) {
    return;
  }
  try {
    const amount = await library.callContract({
      contractAddress: PAIR_ADDRESS[APP_CHAIN_ID],
      entrypoint: "get_amount_out",
      calldata: [currencyIn.address, cairo.uint256(currencyAmountIn)],
    });
    return amount;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

export const swapCallback = async (
  library: AccountInterface | null | undefined,
  account: string | null | undefined, // the ENS name or address of the recipient of the trade, or null if swap should be returned to sender,
  trade: Trade | null | undefined, // trade to execute, required
  allowedSlippage: number,
  amount: string | null | undefined,
  independentField: Field,
  typedValue: string
) => {
  try {
    if (!library || !account || !trade || isNaN(allowedSlippage) || !amount)
      return;
    const deadline = Math.floor(Date.now() / 1000) + 30 * 60;
    const approveCall = new Contract(
      PairAbi,
      trade.inputAmount.token.address,
      library
    ).populate("approve", {
      spender: ROUTER_ADDRESS[APP_CHAIN_ID],
      amount: cairo.uint256(
        parseUnits(
          independentField === Field.INPUT ? typedValue : amount ?? "",
          18
        ).toString()
      ),
    });

    const swapCall = new Contract(
      RouterAbi,
      ROUTER_ADDRESS[APP_CHAIN_ID],
      library
    ).populate("swap_exact_tokens_for_tokens", {
      amountIn: cairo.uint256(
        parseUnits(
          independentField === Field.INPUT ? typedValue : amount ?? "",
          18
        ).toString()
      ),
      amountOutMin: "0",
      path: [
        {
          tokenIn: trade.route.path[0].address,
          tokenOut: trade.route.path[1].address,
        },
      ],
      to: library.address,
      deadline,
    });

    const tx = await library.execute([approveCall, swapCall]);
    await library.waitForTransaction(tx.transaction_hash);
    return tx;
  } catch (error) {
    console.error("user reject transaction", error);
    throw error;
  }
};
