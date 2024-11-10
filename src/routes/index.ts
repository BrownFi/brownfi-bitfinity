import { Liquidity, Pool, Swap, YourPool } from "../pages";
import route from "./route";

const publicRoutes = [
  { path: route.home, element: Swap },
  { path: route.swap, element: Swap },
  { path: route.liquidity, element: Liquidity },
  { path: route.pool, element: Pool },
  { path: route.yourPool, element: YourPool },
];

export { publicRoutes };
