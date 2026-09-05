"use client";

export default function ErrorPage({ reset }: { reset: () => void }) {
  return <main className="centered"><p className="eyebrow">ERROR / REPLAY STOPPED</p><h1>复盘中断了。</h1><button className="primary-button" onClick={reset}>重新加载</button></main>;
}
