import type { ChainId, Position, ReplayReport, TradeEvent } from "./types";

export const CHAINS: Array<{ id: ChainId; name: string; ticker: string; color: string }> = [
  { id: "solana", name: "Solana", ticker: "SOL", color: "#8B5CF6" },
  { id: "bsc", name: "BSC", ticker: "BNB", color: "#F0B90B" },
  { id: "base", name: "Base", ticker: "ETH", color: "#3B82F6" },
  { id: "robinhood", name: "Robinhood", ticker: "ETH", color: "#00C805" },
];

export function isChain(value: string): value is ChainId {
  return CHAINS.some((chain) => chain.id === value);
}

export function isValidAddress(chain: ChainId, address: string) {
  const clean = address.trim();
  if (chain === "solana") return /^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(clean);
  return /^0x[a-fA-F0-9]{40}$/.test(clean);
}

export function encodeReplayId(chain: ChainId, address: string) {
  return Buffer.from(`${chain}:${address.trim()}`).toString("base64url");
}

export function decodeReplayId(id: string): { chain: ChainId; address: string } | null {
  try {
    const [chain, address] = Buffer.from(id, "base64url").toString("utf8").split(":");
    if (!isChain(chain) || !isValidAddress(chain, address)) return null;
    return { chain, address };
  } catch {
    return null;
  }
}

function seedFrom(value: string) {
  let seed = 2166136261;
  for (const char of value) seed = Math.imul(seed ^ char.charCodeAt(0), 16777619);
  return Math.abs(seed >>> 0);
}

export type Lot = { amount: number; unitCost: number };

export function consumeFifo(lots: Lot[], amount: number, saleValue: number, fee = 0) {
  let remaining = amount;
  let cost = 0;
  const next = lots.map((lot) => ({ ...lot }));
  while (remaining > 0 && next.length) {
    const lot = next[0];
    const used = Math.min(remaining, lot.amount);
    cost += used * lot.unitCost;
    lot.amount -= used;
    remaining -= used;
    if (lot.amount < 1e-10) next.shift();
  }
  return { pnl: saleValue - cost - fee, cost, remaining, lots: next };
}

export function createDemoReport(chain: ChainId, address: string, id = encodeReplayId(chain, address)): ReplayReport {
  const seed = seedFrom(`${chain}:${address}`);
  const factor = 0.84 + (seed % 33) / 100;
  const now = Date.now();
  const raw = [
    ["MOCHI", "buy", 74, 1.8, -3.2],
    ["MOCHI", "buy", 68, 1.1, -1.9],
    ["MOCHI", "sell", 57, 4.1, 11.4],
    ["CHAD", "buy", 42, 2.2, -2.7],
    ["CHAD", "sell", 39, 1.4, -7.8],
    ["WIFHAT", "buy", 25, 1.5, -2.2],
    ["WIFHAT", "sell", 19, 3.6, 18.7],
    ["MOGGY", "buy", 9, 1.3, -1.6],
  ] as const;
  let cumulative = 0;
  const trades: TradeEvent[] = raw.map(([symbol, side, days, value, pnl], index) => {
    const adjustedPnl = Number((pnl * factor).toFixed(2));
    cumulative = Number((cumulative + adjustedPnl).toFixed(2));
    return {
      id: `${id}-${index}`,
      token: `${chain}-${symbol.toLowerCase()}`,
      symbol,
      side,
      timestamp: new Date(now - days * 86400000).toISOString(),
      amount: Number(((index + 2) * 102340 * factor).toFixed(0)),
      price: Number((value / ((index + 2) * 102340)).toPrecision(3)),
      value: Number((value * factor).toFixed(2)),
      fee: Number((0.01 + (index % 3) * 0.012).toFixed(3)),
      pnl: adjustedPnl,
      cumulativePnl: cumulative,
    };
  });
  const symbols = [...new Set(trades.map((trade) => trade.symbol))];
  const positions: Position[] = symbols.map((symbol) => {
    const tokenTrades = trades.filter((trade) => trade.symbol === symbol);
    const invested = tokenTrades.filter((trade) => trade.side === "buy").reduce((sum, trade) => sum + trade.value, 0);
    const realizedPnl = tokenTrades.reduce((sum, trade) => sum + trade.pnl, 0);
    return {
      token: tokenTrades[0].token,
      symbol,
      trades: tokenTrades.length,
      invested: Number(invested.toFixed(2)),
      realizedPnl: Number(realizedPnl.toFixed(2)),
      returnPct: Number(((realizedPnl / Math.max(invested, 1)) * 100).toFixed(1)),
      status: tokenTrades.at(-1)?.side === "sell" ? "closed" : "open",
    };
  });
  const fees = trades.reduce((sum, trade) => sum + trade.fee, 0);
  const realizedPnl = trades.reduce((sum, trade) => sum + trade.pnl, 0);
  return {
    id,
    chain,
    address,
    generatedAt: new Date().toISOString(),
    demo: true,
    metrics: {
      invested: Number(positions.reduce((sum, item) => sum + item.invested, 0).toFixed(2)),
      realizedPnl: Number(realizedPnl.toFixed(2)),
      unrealizedPnl: Number((-4.7 * factor).toFixed(2)),
      winRate: 50,
      fees: Number(fees.toFixed(3)),
      averageHoldHours: 37,
    },
    trades,
    positions,
    lessons: [
      { code: "chasing", tone: "bad" },
      { code: "cutLoss", tone: "good" },
      { code: "concentration", tone: "neutral" },
    ],
    completeness: 94,
  };
}
