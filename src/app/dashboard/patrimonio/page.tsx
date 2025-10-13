import { getAssets, getCategories } from "@/lib/actions";
import DashboardClient from "@/components/dashboard/dashboard-client";

export default async function PatrimonioPage() {
  const assets = await getAssets();
  const categories = await getCategories();

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <DashboardClient initialAssets={assets} initialCategories={categories} />
    </div>
  );
}

    