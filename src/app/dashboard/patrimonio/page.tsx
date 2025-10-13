import { getAssets, getCategories } from "@/lib/actions";
import DashboardClient from "@/components/dashboard/dashboard-client";

export default async function PatrimonioPage() {
  const assets = await getAssets();
  const categories = await getCategories();

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-3xl font-headline tracking-tight">Patrimônio</h2>
          <p className="text-muted-foreground">
            Gerencie os itens do seu inventário.
          </p>
        </div>
      </div>
      <DashboardClient initialAssets={assets} initialCategories={categories} />
    </div>
  );
}
