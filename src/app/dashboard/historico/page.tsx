import { HistoryTable } from "@/components/dashboard/history-table";
import { getHistory } from "@/lib/actions";

export default async function HistoricoPage() {
  const history = await getHistory();

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-3xl font-headline tracking-tight">Histórico de Alterações</h2>
          <p className="text-muted-foreground">
            Veja o registro de todas as mudanças feitas no patrimônio.
          </p>
        </div>
      </div>
      <HistoryTable history={history} />
    </div>
  );
}
