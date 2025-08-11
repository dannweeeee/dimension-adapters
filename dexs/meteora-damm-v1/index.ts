import { CHAIN } from "../../helpers/chains";
import { httpGet } from "../../utils/fetchURL";

const meteoraStatsEndpoint = "https://damm-api.meteora.ag/pools/search";

interface Pool {
  data: Array<{
    trading_volume: number;
    fee_volume: number;
  }>;
  page: number;
  total_count: number;
}

async function fetch() {
  let dailyVolume = 0;
  let dailyFees = 0;
  let page = 0;
  let hasMore = true;

  while (hasMore) {
    const url = `${meteoraStatsEndpoint}?page=${page}&size=300`;
    const response: Pool = await httpGet(url);

    response.data.forEach((pool) => {
      dailyVolume += pool.trading_volume;
      dailyFees += pool.fee_volume;
    });

    // check if there are more pages (paginate by 300)
    hasMore = response.data.length === 300 && page * 300 < response.total_count;
    page++;
  }

  if (isNaN(dailyVolume) || isNaN(dailyFees))
    throw new Error("Invalid daily volume");
  return {
    dailyVolume,
    dailyFees,
  };
}

export default {
  version: 2,
  adapter: {
    [CHAIN.SOLANA]: {
      fetch,
      runAtCurrTime: true,
      start: "2024-04-30", // Apr 30 2024 - 00:00:00 UTC
    },
  },
};
