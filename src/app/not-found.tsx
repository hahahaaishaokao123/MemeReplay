import Link from "next/link";

export default function NotFound() {
  return <main className="centered"><p className="eyebrow">404 / MISSING RECEIPT</p><h1>这张复盘小票不存在。</h1><Link className="primary-button" href="/">返回首页</Link></main>;
}
