"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { copy, type Locale } from "@/lib/i18n";
import { CHAINS } from "@/lib/replay";
import type { ReplayReport } from "@/lib/types";
import { LanguageToggle } from "./language-toggle";

function shortAddress(value: string) { return `${value.slice(0, 6)}…${value.slice(-5)}`; }

export function ReportClient({ report }: { report: ReplayReport }) {
  const [locale, setLocale] = useState<Locale>("zh");
  const [token, setToken] = useState("all");
  const [cursor, setCursor] = useState(report.trades.length - 1);
  const [copied, setCopied] = useState(false);
  const t = copy[locale];
  const chain = CHAINS.find((item) => item.id === report.chain)!;
  const filtered = useMemo(() => report.trades.filter((trade) => token === "all" || trade.symbol === token), [report.trades, token]);
  const visible = filtered.slice(0, Math.max(1, Math.min(cursor + 1, filtered.length)));
  const current = visible.at(-1)!;
  const ticker = chain.ticker;

  async function share() {
    await navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1500);
  }

  return (
    <main>
      <nav className="nav shell"><Link className="wordmark" href="/"><span>MEME</span>REPLAY<i>●</i></Link><LanguageToggle locale={locale} setLocale={setLocale} /></nav>
      <section className="report-head shell">
        <div>
          <p className="eyebrow"><span style={{ background: chain.color }} />{chain.name} / {t.replay}</p>
          <h1>{shortAddress(report.address)}</h1>
          <p className="mono subtle">{report.address}</p>
        </div>
        <div className="report-actions"><span className="demo-badge">{t.demo}</span><button onClick={share}>{copied ? t.copied : t.share}</button><Link href="/">← {t.back}</Link></div>
      </section>

      <section className="metrics shell">
        <Metric label={t.invested} value={`${report.metrics.invested.toFixed(2)} ${ticker}`} />
        <Metric label={t.realized} value={`${report.metrics.realizedPnl > 0 ? "+" : ""}${report.metrics.realizedPnl.toFixed(2)} ${ticker}`} tone={report.metrics.realizedPnl >= 0 ? "profit" : "loss"} />
        <Metric label={t.unrealized} value={`${report.metrics.unrealizedPnl.toFixed(2)} ${ticker}`} tone="loss" />
        <Metric label={t.winRate} value={`${report.metrics.winRate}%`} />
        <Metric label={t.fees} value={`${report.metrics.fees.toFixed(3)} ${ticker}`} />
        <Metric label={t.avgHold} value={`${report.metrics.averageHoldHours} ${t.hours}`} />
      </section>

      <section className="tape-section shell">
        <div className="section-heading"><div><p className="section-index">01 / TIMELINE</p><h2>{t.tape}</h2></div><div className="token-filters"><button className={token === "all" ? "active" : ""} onClick={() => { setToken("all"); setCursor(report.trades.length - 1); }}>{t.all}</button>{report.positions.map((item) => <button key={item.symbol} className={token === item.symbol ? "active" : ""} onClick={() => { setToken(item.symbol); setCursor(report.trades.length - 1); }}>${item.symbol}</button>)}</div></div>
        <div className="tape-window">
          <div className="tape-summary"><span>{new Date(current.timestamp).toLocaleDateString(locale === "zh" ? "zh-CN" : "en-US")}</span><strong className={current.cumulativePnl >= 0 ? "profit-text" : "loss-text"}>{t.cumulative}: {current.cumulativePnl > 0 ? "+" : ""}{current.cumulativePnl.toFixed(2)} {ticker}</strong></div>
          <div className="trade-track">
            {filtered.map((trade, index) => {
              const active = index <= cursor;
              return <button key={trade.id} className={`${trade.side} ${active ? "revealed" : ""}`} onClick={() => setCursor(index)}><i /><span>{trade.side === "buy" ? t.buy : t.sell}</span><b>${trade.symbol}</b><small>{trade.pnl > 0 ? "+" : ""}{trade.pnl.toFixed(1)}</small></button>;
            })}
          </div>
          <input className="scrubber" type="range" min="0" max={Math.max(0, filtered.length - 1)} value={Math.min(cursor, filtered.length - 1)} onChange={(event) => setCursor(Number(event.target.value))} aria-label={t.tape} />
        </div>
      </section>

      <section className="case-grid shell">
        <div>
          <div className="section-heading"><div><p className="section-index">02 / TOKENS</p><h2>{t.positions}</h2></div></div>
          <div className="position-list">{report.positions.map((item) => <article key={item.symbol} className="position-row"><div className="token-mark">{item.symbol.slice(0, 2)}</div><div><strong>${item.symbol}</strong><small>{item.trades} {t.trades} · {item.status === "open" ? t.open : t.closed}</small></div><div className={item.realizedPnl >= 0 ? "profit-text" : "loss-text"}><strong>{item.realizedPnl > 0 ? "+" : ""}{item.realizedPnl.toFixed(1)} {ticker}</strong><small>{item.returnPct > 0 ? "+" : ""}{item.returnPct}%</small></div></article>)}</div>
        </div>
        <aside className="lessons"><p className="section-index">03 / LESSONS</p><h2>{t.lessons}</h2>{report.lessons.map((lesson, index) => <article key={lesson.code} className={lesson.tone}><span>0{index + 1}</span><p>{t[lesson.code as "chasing" | "cutLoss" | "concentration"]}</p></article>)}<div className="completeness"><span>{t.completeness}</span><strong>{report.completeness}%</strong><i><b style={{ width: `${report.completeness}%` }} /></i></div></aside>
      </section>
      <footer className="footer shell"><span>© 2026 MemeReplay</span><span>{t.footer}</span></footer>
    </main>
  );
}

function Metric({ label, value, tone }: { label: string; value: string; tone?: "profit" | "loss" }) {
  return <article><span>{label}</span><strong className={tone === "profit" ? "profit-text" : tone === "loss" ? "loss-text" : ""}>{value}</strong></article>;
}
