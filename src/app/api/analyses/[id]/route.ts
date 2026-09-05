import { createDemoReport, decodeReplayId } from "@/lib/replay";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const decoded = decodeReplayId(id);
  if (!decoded) return Response.json({ error: "Replay not found" }, { status: 404 });
  return Response.json(createDemoReport(decoded.chain, decoded.address, id), { headers: { "Cache-Control": "public, max-age=300" } });
}
