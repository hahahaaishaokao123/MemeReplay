import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "MemeReplay — 多链土狗交易复盘",
  description: "Replay meme coin trades across Solana, BSC, Base and Robinhood Chain.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="zh-CN"><body>{children}</body></html>;
}
