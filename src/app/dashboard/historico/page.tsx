import HistoryClient from "@/components/dashboard/history-client";

export default async function HistoricoPage() {
  // A busca de dados foi movida para o componente cliente (HistoryClient)
  // para utilizar o contexto de autenticação em tempo real.
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <HistoryClient />
    </div>
  );
}
