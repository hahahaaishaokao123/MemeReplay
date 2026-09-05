import { ReportClient } from "@/components/report-client";
import { createDemoReport, decodeReplayId } from "@/lib/replay";
import { notFound } from "next/navigation";

export default async function ReplayPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const decoded = decodeReplayId(id);
  if (!decoded) notFound();
  return <ReportClient report={createDemoReport(decoded.chain, decoded.address, id)} />;
}
