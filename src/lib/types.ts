export type ChainId = "solana" | "bsc" | "base" | "robinhood";

export type TradeEvent = {
  id: string;
  token: string;
  symbol: string;
  side: "buy" | "sell";
  timestamp: string;
  amount: number;
  price: number;
  value: number;
  fee: number;
  pnl: number;
  cumulativePnl: number;
};

export type Position = {
  token: string;
  symbol: string;
  trades: number;
  invested: number;
  realizedPnl: number;
  returnPct: number;
  status: "closed" | "open";
};

export type ReplayReport = {
  id: string;
  chain: ChainId;
  address: string;
  generatedAt: string;
  demo: true;
  metrics: {
    invested: number;
    realizedPnl: number;
    unrealizedPnl: number;
    winRate: number;
    fees: number;
    averageHoldHours: number;
  };
  trades: TradeEvent[];
  positions: Position[];
  lessons: Array<{ code: string; tone: "good" | "bad" | "neutral" }>;
  completeness: number;
};
