import { encodeReplayId, isChain, isValidAddress } from "@/lib/replay";

export async function POST(request: Request) {
  let input: unknown;
  try { input = await request.json(); } catch { return Response.json({ error: "Invalid JSON" }, { status: 400 }); }
  if (!input || typeof input !== "object") return Response.json({ error: "Invalid payload" }, { status: 400 });
  const { chain, address } = input as { chain?: string; address?: string };
  if (!chain || !isChain(chain) || !address || !isValidAddress(chain, address)) return Response.json({ error: "Address does not match the selected chain" }, { status: 422 });
  return Response.json({ id: encodeReplayId(chain, address), status: "complete", demo: true }, { status: 201 });
}
