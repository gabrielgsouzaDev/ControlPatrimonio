import { getHistory } from "@/lib/actions";
import HistoryClient from "@/components/dashboard/history-client";

export default async function HistoricoPage() {
  const history = await getHistory();

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <HistoryClient initialHistory={history} />
    </div>
  );
}
