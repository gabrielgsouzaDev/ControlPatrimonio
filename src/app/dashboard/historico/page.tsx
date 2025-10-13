import HistoryClient from "@/components/dashboard/history-client";

export default async function HistoricoPage() {
  // A busca inicial de dados foi movida para o lado do cliente
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <HistoryClient initialHistory={[]} />
    </div>
  );
}
