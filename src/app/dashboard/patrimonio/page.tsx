
import DashboardClient from "@/components/dashboard/dashboard-client";

export default async function PatrimonioPage() {
  // A busca inicial de dados foi movida para o lado do cliente
  // para usar o contexto de autenticação do Firebase.
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
       <div>
          <h2 className="text-3xl font-headline tracking-tight">Patrimônio</h2>
          <p className="text-muted-foreground">
            Gerencie os itens do seu inventário.
          </p>
        </div>
      <DashboardClient />
    </div>
  );
}
