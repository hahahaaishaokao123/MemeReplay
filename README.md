# MemeReplay

MemeReplay is a minimal, bilingual wallet replay for meme-coin traders. It supports Solana, BSC, Base and Robinhood Chain address formats and turns a wallet into a public, shareable trading receipt.

MemeReplay 是一个最小化的中英双语土狗交易复盘网站。它支持 Solana、BSC、Base 和 Robinhood Chain 地址格式，把钱包变成一张可分享的交易小票。

> **Current data mode / 当前数据模式:** `v0.1.0` intentionally uses deterministic demo transactions. Every report is visibly marked “Demo data / 示例数据”. It does not claim that generated numbers came from chain history.

## Features / 功能

- Four-chain address selection and validation
- Read-only injected wallet connection (no approvals or transactions)
- Public replay permalink
- Interactive trade tape with token filters and a timeline scrubber
- PnL summary, token case files and explainable lessons
- Chinese/English UI, responsive layout and reduced-motion support
- Minimal `POST /api/analyses` and `GET /api/analyses/:id` API
- Tested FIFO cost-basis helper

## Run locally / 本地运行

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

```bash
npm test
npm run typecheck
npm run lint
npm run build
```

## API

Create a replay:

```bash
curl -X POST http://localhost:3000/api/analyses \
  -H "Content-Type: application/json" \
  -d '{"chain":"base","address":"0x71C7656EC7ab88b098defB751B7401B5f6d8976F"}'
```

The response contains an opaque `id`. Read the report at `/api/analyses/:id` or open `/replay/:id`.

## Live-data upgrade path / 真实数据升级路径

The app keeps its report format independent from providers. A production adapter can replace `createDemoReport()` without changing the UI:

- Solana: Helius address history with associated token-account balance changes
- BSC and Base: Etherscan V2 account history plus RPC receipts
- Robinhood Chain: Blockscout REST API plus mainnet RPC
- Market metadata: DEX Screener
- Risk data: RugCheck for Solana and GoPlus for EVM

The intended production calculation is FIFO, with gas and platform fees included. Transferred-in inventory with unknown cost must remain explicitly unpriced.

## Safety

MemeReplay is read-only and does not provide investment advice. Never enter a private key or seed phrase. The wallet button only asks an installed wallet to reveal the selected public account.

## License

MIT
