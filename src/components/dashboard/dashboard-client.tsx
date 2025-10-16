
"use client";

import { useState, useMemo, useTransition } from "react";
import type { Asset, Category, Location } from "@/lib/types";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Download, PlusCircle, Loader2, Search, Settings, FileSpreadsheet, FileText, MapPin, Upload } from "lucide-react";
import { AssetTable } from "./asset-table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { AddEditAssetForm } from "./add-edit-asset-form";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { deactivateAsset } from "@/lib/mutations";
import { exportAssetsToCsv } from "@/lib/actions";
import { useToast } from "@/hooks/use-toast";
import { ManageCategoriesDialog } from "./manage-categories-dialog";
import { ManageLocationsDialog } from "./manage-locations-dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useCollection, useFirestore, useMemoFirebase, useUser } from "@/firebase";
import { collection, Timestamp } from "firebase/firestore";
import { exportAssetsToPdf } from "@/lib/pdf-export";
import { ImportAssetsDialog } from "./import-assets-dialog";

type DialogState =
  | { type: "add" }
  | { type: "edit"; asset: Asset }
  | { type: "delete"; asset: Asset }
  | { type: "manage-categories" }
  | { type: "manage-locations" }
  | { type: "import" }
  | null;

export type SortConfig = {
  key: keyof Asset;
  direction: 'asc' | 'desc';
};

export default function DashboardClient() {
  const [searchTerm, setSearchTerm] = useState("");
  const [cityFilter, setCityFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [dialogState, setDialogState] = useState<DialogState>(null);
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: 'updatedAt', direction: 'desc' });
  const [isPending, startTransition] = useTransition();
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  
  const assetsQuery = useMemoFirebase(() => (firestore ? collection(firestore, 'assets') : null), [firestore]);
  const categoriesQuery = useMemoFirebase(() => (firestore ? collection(firestore, 'categories') : null), [firestore]);
  const locationsQuery = useMemoFirebase(() => (firestore ? collection(firestore, 'locations') : null), [firestore]);

  const { data: assets, isLoading: isLoadingAssets, forceRefetch } = useCollection<Asset>(assetsQuery);
  const { data: categories, isLoading: isLoadingCategories } = useCollection<Category>(categoriesQuery);
  const { data: locations, isLoading: isLoadingLocations } = useCollection<Location>(locationsQuery);

  const uniqueCities = useMemo(() => {
    if (!locations) return [];
    const cityNames = locations.map((loc) => loc.name).sort();
    return ["all", ...cityNames];
  }, [locations]);

  const uniqueCategories = useMemo(() => {
    if (!categories) return [];
    const categoryNames = categories.map(c => c.name).sort();
    return ["all", ...categoryNames];
  }, [categories]);

  const requestSort = (key: keyof Asset) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const sortedAndFilteredAssets = useMemo(() => {
    if (!assets) return [];
    
    let filtered = assets.filter(asset => asset.status !== 'inativo');

    const locationMap = new Map((locations || []).map(loc => [loc.id, loc.name]));

    if (cityFilter !== "all") {
      const selectedLocation = locations?.find(loc => loc.name === cityFilter);
      if(selectedLocation) {
        filtered = filtered.filter((asset) => asset.city === selectedLocation.id);
      }
    }
    
    if (categoryFilter !== "all" && categories) {
      const selectedCategory = categories.find(c => c.name === categoryFilter);
      if (selectedCategory) {
        filtered = filtered.filter((asset) => asset.categoryId === selectedCategory.id);
      }
    }

    if (searchTerm) {
      const lowercasedTerm = searchTerm.toLowerCase();
      filtered = filtered.filter(asset => 
        asset.name.toLowerCase().includes(lowercasedTerm) ||
        asset.codeId.toLowerCase().includes(lowercasedTerm)
      );
    }
    
    if (sortConfig.key) {
      filtered.sort((a, b) => {
        const aValue = a[sortConfig.key];
        const bValue = b[sortConfig.key];

        let comparison = 0;
        if (sortConfig.key === 'updatedAt' || sortConfig.key === 'createdAt') {
           const timeA = aValue instanceof Timestamp ? aValue.toMillis() : (aValue ? new Date(aValue as any).getTime() : 0);
           const timeB = bValue instanceof Timestamp ? bValue.toMillis() : (bValue ? new Date(bValue as any).getTime() : 0);
           comparison = timeA > timeB ? 1 : -1;
        } else if (typeof aValue === 'number' && typeof bValue === 'number') {
            comparison = aValue - bValue;
        } else if (aValue && bValue) {
            comparison = String(aValue).localeCompare(String(bValue), 'pt-BR', { numeric: true });
        } else {
           comparison = aValue ? 1 : -1;
        }

        return sortConfig.direction === 'asc' ? comparison : -comparison;
      });
    }

    const categoryMap = new Map((categories || []).map(cat => [cat.id, cat.name]));
    return filtered.map(asset => ({
        ...asset,
        category: categoryMap.get(asset.categoryId) || "Sem Categoria",
        city: locationMap.get(asset.city) || 'Sem Localização'
    }));

  }, [assets, categories, locations, cityFilter, categoryFilter, searchTerm, sortConfig]);

  const handleFormSubmit = () => {
    setDialogState(null);
  };
  
  const handleCategoriesUpdate = () => {
     // Categories are updated in real-time by useCollection
  }

  const handleLocationsUpdate = () => {
    // Locations are updated in real-time by useCollection
  }

  const handleDelete = () => {
    if (dialogState?.type !== "delete" || !user || !firestore) return;

    const assetToDeactivate = dialogState.asset;
    setDialogState(null); 

    startTransition(async () => {
      try {
        await deactivateAsset(firestore, user.uid, user.displayName || "Usuário", assetToDeactivate.id);
        toast({ title: "Sucesso", description: "Item movido para a lixeira." });
      } catch (error: any) {
        console.error("Error deactivating asset:", error);
        toast({ 
            variant: "destructive", 
            title: "Erro ao Desativar", 
            description: error.message || "Não foi possível mover o item para a lixeira."
        });
      }
    });
  };

  const handleExportCsv = () => {
    startTransition(async () => {
        try {
            const csvString = await exportAssetsToCsv(sortedAndFilteredAssets);
            if (!csvString) {
                toast({ variant: "destructive", title: "Exportação Falhou", description: "Não há dados para exportar."});
                return;
            }
            const blob = new Blob([`\uFEFF${csvString}`], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement('a');
            const url = URL.createObjectURL(blob);
            link.setAttribute('href', url);
            link.setAttribute('download', 'patrimonio.csv');
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            toast({ title: "Exportação Iniciada", description: "O download do arquivo CSV começará em breve."});
        } catch (error) {
            toast({ variant: "destructive", title: "Exportação Falhou", description: "Não foi possível gerar o arquivo CSV." });
        }
    });
  }

  const handleExportPdf = () => {
    startTransition(() => {
      try {
        exportAssetsToPdf(sortedAndFilteredAssets);
        toast({
          title: "Exportação de PDF",
          description: "O arquivo PDF foi gerado e o download será iniciado.",
        });
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Exportação Falhou",
          description: "Não foi possível gerar o arquivo PDF.",
        });
      }
    });
  };

  if (isLoadingAssets || isLoadingCategories || isLoadingLocations) {
    return (
        <div className="flex h-[80vh] items-center justify-center">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
    );
  }

  return (
    <>
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:flex-wrap items-center gap-4">
            <div className="relative w-full sm:flex-1 sm:min-w-[250px]">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Pesquisar por nome ou código..."
                  className="w-full rounded-lg bg-background pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
             <Select value={cityFilter} onValueChange={setCityFilter}>
              <SelectTrigger className="w-full sm:w-auto sm:min-w-[180px]">
                <SelectValue placeholder="Filtrar por cidade" />
              </SelectTrigger>
              <SelectContent>
                {uniqueCities.map((city) => (
                  <SelectItem key={city} value={city}>
                    {city === "all" ? "Todas as Cidades" : city}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-full sm:w-auto sm:min-w-[180px]">
                <SelectValue placeholder="Filtrar por categoria" />
              </SelectTrigger>
              <SelectContent>
                {uniqueCategories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category === "all" ? "Todas as Categorias" : category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
        </div>
        <div className="flex flex-col sm:flex-row sm:flex-wrap items-center gap-2">
            <Button variant="outline" onClick={() => setDialogState({ type: "import" })} className="w-full sm:w-auto">
              <Upload className="h-4 w-4 mr-2" />
              <span>Importar</span>
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                 <Button variant="outline" disabled={isPending} className="w-full sm:w-auto">
                  <Download className="h-4 w-4 mr-2" />
                  <span>Exportar</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleExportCsv}>
                  <FileSpreadsheet className="mr-2 h-4 w-4" />
                  <span>Exportar para CSV</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleExportPdf}>
                  <FileText className="mr-2 h-4 w-4" />
                  <span>Exportar para PDF</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <div className="flex w-full sm:w-auto gap-2">
                <Button variant="outline" size="icon" onClick={() => setDialogState({ type: "manage-locations" })} aria-label="Gerenciar Locais" className="flex-1 sm:flex-none">
                    <MapPin className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="icon" onClick={() => setDialogState({ type: "manage-categories" })} aria-label="Gerenciar Categorias" className="flex-1 sm:flex-none">
                    <Settings className="h-4 w-4" />
                </Button>
            </div>
            <div className="w-full sm:w-auto sm:ml-auto">
                <Button onClick={() => setDialogState({ type: "add" })} className="w-full sm:w-auto">
                    <PlusCircle className="h-4 w-4 mr-2" />
                     <span>Adicionar Item</span>
                </Button>
            </div>
        </div>
      </div>

      <div className="mt-4 rounded-lg border shadow-sm">
        <AssetTable
            assets={sortedAndFilteredAssets}
            onEdit={(asset) => setDialogState({ type: "edit", asset })}
            onDelete={(asset) => setDialogState({ type: "delete", asset })}
            sortConfig={sortConfig}
            requestSort={requestSort}
            />
      </div>
      
      <Dialog
        open={dialogState?.type === "add" || dialogState?.type === "edit"}
        onOpenChange={(open) => !open && setDialogState(null)}
      >
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {dialogState?.type === "edit" ? "Editar Item" : "Adicionar Novo Item"}
            </DialogTitle>
            <DialogDescription>
              Preencha os detalhes do item. Clique em salvar quando terminar.
            </DialogDescription>
          </DialogHeader>
          <AddEditAssetForm
            asset={dialogState?.type === "edit" ? dialogState.asset : undefined}
            categories={categories || []}
            locations={locations || []}
            onSubmitSuccess={handleFormSubmit}
          />
        </DialogContent>
      </Dialog>
      
      <AlertDialog
        open={dialogState?.type === "delete"}
        onOpenChange={(open) => !open && setDialogState(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não excluirá o item permanentemente. Ele será movido para a lixeira e poderá ser reativado.
              O item a ser desativado é: <span className="font-semibold"> {dialogState?.type === 'delete' && dialogState.asset.name}</span>.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={isPending}>
                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Desativar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
      <ManageCategoriesDialog
        open={dialogState?.type === 'manage-categories'}
        onOpenChange={(open) => !open && setDialogState(null)}
        categories={categories || []}
        onCategoriesChange={handleCategoriesUpdate}
      />

      <ManageLocationsDialog
        open={dialogState?.type === 'manage-locations'}
        onOpenChange={(open) => !open && setDialogState(null)}
        locations={locations || []}
        onLocationsChange={handleLocationsUpdate}
      />

      <ImportAssetsDialog
        open={dialogState?.type === 'import'}
        onOpenChange={(open) => !open && setDialogState(null)}
        onImportSuccess={(count) => {
          toast({ title: "Importação Concluída", description: `${count} ${count === 1 ? 'item foi importado' : 'itens foram importados'} com sucesso.`});
          setDialogState(null);
          forceRefetch(); // Force a refetch of assets
        }}
      />
    </>
  );
}
