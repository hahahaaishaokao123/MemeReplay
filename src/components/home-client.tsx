"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { copy, type Locale } from "@/lib/i18n";
import { CHAINS, isValidAddress } from "@/lib/replay";
import type { ChainId } from "@/lib/types";
import { LanguageToggle } from "./language-toggle";

const EXAMPLE_IDS = {
  solana: "c29sYW5hOjdZdHRMa0hEbzRma1FYTk1jMVI4Z3pVRTdqTlh6Tm4zaFpXUTlHcWY5UDND",
  bsc: "YnNjOjB4NzFDNzY1NkVDN2FiODhiMDk4ZGVmQjc1MUI3NDAxQjVmNmQ4OTc2Rg",
  base: "YmFzZToweDcxQzc2NTZFQzdhYjg4YjA5OGRlZkI3NTFCNzQwMUI1ZjZkODk3NkY",
  robinhood: "cm9iaW5ob29kOjB4NzFDNzY1NkVDN2FiODhiMDk4ZGVmQjc1MUI3NDAxQjVmNmQ4OTc2Rg",
} as const;

declare global {
  interface Window {
    ethereum?: { request: (args: { method: string }) => Promise<string[]> };
    solana?: { connect: () => Promise<{ publicKey: { toString: () => string } }> };
  }
}

export function HomeClient() {
  const router = useRouter();
  const [locale, setLocale] = useState<Locale>("zh");
  const [chain, setChain] = useState<ChainId>("solana");
  const [address, setAddress] = useState("");
  const [error, setError] = useState("");
  const [connecting, setConnecting] = useState(false);
  const t = copy[locale];

  async function submit(event: FormEvent) {
    event.preventDefault();
    setError("");
    if (!isValidAddress(chain, address)) return setError(t.invalid);
    const response = await fetch("/api/analyses", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chain, address }),
    });
    const body = (await response.json()) as { id?: string; error?: string };
    if (!response.ok || !body.id) return setError(body.error ?? t.invalid);
    router.push(`/replay/${body.id}`);
  }

  async function connectWallet() {
    setConnecting(true);
    setError("");
    try {
      if (chain === "solana") {
        if (!window.solana) throw new Error("Solana wallet not found");
        const result = await window.solana.connect();
        setAddress(result.publicKey.toString());
      } else {
        if (!window.ethereum) throw new Error("EVM wallet not found");
        const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
        setAddress(accounts[0] ?? "");
      }
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : t.invalid);
    } finally {
      setConnecting(false);
    }
  }

  return (
    <main>
      <nav className="nav shell">
        <Link className="wordmark" href="/" aria-label="MemeReplay home"><span>MEME</span>REPLAY<i>●</i></Link>
        <div className="nav-actions"><a href="#method">{t.navAbout}</a><LanguageToggle locale={locale} setLocale={setLocale} /></div>
      </nav>

      <section className="hero shell">
        <div className="hero-copy">
          <p className="eyebrow"><span className="live-dot" />{t.eyebrow}</p>
          <h1>{t.titleA}<br /><em>{t.titleB}</em></h1>
          <p className="intro">{t.intro}</p>
        </div>

        <form className="analyze-card" onSubmit={submit}>
          <div className="card-stamp">90D<br /><span>REPLAY</span></div>
          <fieldset>
            <legend>{t.chain}</legend>
            <div className="chain-picker">
              {CHAINS.map((item) => (
                <button key={item.id} type="button" aria-pressed={chain === item.id} className={chain === item.id ? "active" : ""} onClick={() => { setChain(item.id); setAddress(""); setError(""); }}>
                  <span style={{ background: item.color }} />{item.name}
                </button>
              ))}
            </div>
          </fieldset>
          <label htmlFor="wallet">{t.address}</label>
          <div className="address-row">
            <input id="wallet" value={address} onChange={(event) => setAddress(event.target.value)} placeholder={chain === "solana" ? t.addressHintSol : t.addressHintEvm} autoComplete="off" spellCheck={false} />
            <button type="button" className="connect-button" onClick={connectWallet}>{connecting ? t.connecting : t.connect}</button>
          </div>
          {error && <p className="form-error" role="alert">{error}</p>}
          <button className="primary-button" type="submit">{t.analyze}<span>↗</span></button>
          <p className="public-note">{t.publicNote}</p>
          <Link className="example-link" href={`/replay/${EXAMPLE_IDS[chain]}`}>{t.example} →</Link>
        </form>
      </section>

      <section className="method shell" id="method">
        <div className="method-number">01 / REPLAY</div>
        <div><h2>{t.receiptTitle}</h2><p>{t.receiptBody}</p></div>
        <div className="mini-tape" aria-hidden="true">
          {["BUY", "BUY", "SELL", "BUY", "SELL"].map((label, index) => <span key={`${label}-${index}`} className={label === "SELL" ? "sell" : "buy"}>{label}<i /></span>)}
        </div>
      </section>

      <footer className="footer shell"><span>© 2026 MemeReplay</span><span>{t.footer}</span></footer>
    </main>
  );
}
