import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { consumeFifo, decodeReplayId, encodeReplayId, isValidAddress } from "./replay.ts";

describe("wallet validation", () => {
  it("accepts EVM and Solana shapes", () => {
    assert.equal(isValidAddress("base", "0x71C7656EC7ab88b098defB751B7401B5f6d8976F"), true);
    assert.equal(isValidAddress("solana", "7YttLkHDo4fkQXNMc1R8gzUE7jNXzNn3hZWQ9Gqf9P3C"), true);
    assert.equal(isValidAddress("bsc", "bad"), false);
  });
  it("round trips public replay ids", () => {
    const address = "0x71C7656EC7ab88b098defB751B7401B5f6d8976F";
    assert.deepEqual(decodeReplayId(encodeReplayId("base", address)), { chain: "base", address });
  });
});

describe("FIFO", () => {
  it("uses oldest lots and includes fees", () => {
    const result = consumeFifo([{ amount: 10, unitCost: 2 }, { amount: 10, unitCost: 4 }], 15, 60, 1);
    assert.equal(result.cost, 40);
    assert.equal(result.pnl, 19);
    assert.deepEqual(result.lots, [{ amount: 5, unitCost: 4 }]);
  });
  it("reports missing transferred-in inventory", () => {
    const result = consumeFifo([{ amount: 2, unitCost: 3 }], 5, 20);
    assert.equal(result.remaining, 3);
  });
});
