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
import { Download, PlusCircle, Loader2, Search, Settings, FileSpreadsheet, FileText, MapPin } from "lucide-react";
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
import { deleteAsset } from "@/lib/mutations";
import { exportAssetsToCsv } from "@/lib/actions";
import { useToast } from "@/hooks/use-toast";
import { ManageCategoriesDialog } from "./manage-categories-dialog";
import { ManageLocationsDialog } from "./manage-locations-dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useCollection, useFirestore, useMemoFirebase, useUser } from "@/firebase";
import { collection } from "firebase/firestore";

type DialogState =
  | { type: "add" }
  | { type: "edit"; asset: Asset }
  | { type: "delete"; asset: Asset }
  | { type: "manage-categories" }
  | { type: "manage-locations" }
  | null;

export default function DashboardClient({ initialAssets, initialCategories }: { initialAssets: Asset[], initialCategories: Category[] }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [cityFilter, setCityFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [dialogState, setDialogState] = useState<DialogState>(null);
  const [isPending, startTransition] = useTransition();
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  
  const assetsQuery = useMemoFirebase(() => (firestore ? collection(firestore, 'assets') : null), [firestore]);
  const categoriesQuery = useMemoFirebase(() => (firestore ? collection(firestore, 'categories') : null), [firestore]);
  const locationsQuery = useMemoFirebase(() => (firestore ? collection(firestore, 'locations') : null), [firestore]);

  const { data: assets, isLoading: isLoadingAssets } = useCollection<Asset>(assetsQuery);
  const { data: categories, isLoading: isLoadingCategories } = useCollection<Category>(categoriesQuery);
  const { data: locations, isLoading: isLoadingLocations } = useCollection<Location>(locationsQuery);

  const uniqueCities = useMemo(() => {
    if (!locations) return ["all"];
    return ["all", ...locations.map((loc) => loc.name)];
  }, [locations]);

  const uniqueCategories = useMemo(() => {
    if (!categories) return ["all"];
    return ["all", ...categories.map(c => c.name)];
  }, [categories]);

  const filteredAssets = useMemo(() => {
    if (!assets) return [];
    
    let filtered = assets;

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
    
    const categoryMap = new Map((categories || []).map(cat => [cat.id, cat.name]));
    return filtered.map(asset => ({
        ...asset,
        category: categoryMap.get(asset.categoryId) || "Sem Categoria",
        city: locationMap.get(asset.city) || 'Sem Localização'
    }));

  }, [assets, categories, locations, cityFilter, categoryFilter, searchTerm]);

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
    if (dialogState?.type === "delete" && user && firestore) {
      startTransition(() => {
        deleteAsset(firestore, user.uid, user.displayName || "Usuário", dialogState.asset.id)
          .then(() => {
              setDialogState(null);
              toast({ title: "Sucesso", description: "Item excluído com sucesso." });
          })
          .catch((error: any) => {
              console.error("Error deleting asset:", error);
              toast({ variant: "destructive", title: "Erro ao Excluir", description: error.message || "Não foi possível excluir o item."});
          })
      });
    }
  };

  const handleExportCsv = () => {
    startTransition(async () => {
        try {
            const csvString = await exportAssetsToCsv(filteredAssets);
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
    toast({
      title: "Funcionalidade em breve",
      description: "A exportação para PDF ainda não está disponível.",
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
      <div className="flex flex-col md:flex-row items-center justify-between space-y-2 md:space-y-0 md:space-x-2 mb-4">
        <div className="relative w-full md:w-auto md:flex-grow">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Pesquisar por nome ou código..."
              className="w-full rounded-lg bg-background pl-8 md:w-[300px]"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
        </div>
        <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-2 w-full md:w-auto justify-end">
           <Select value={cityFilter} onValueChange={setCityFilter}>
            <SelectTrigger className="w-full sm:w-[180px]">
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
            <SelectTrigger className="w-full sm:w-[180px]">
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
          <div className="flex items-center space-x-2 w-full sm:w-auto">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" disabled={isPending} className="w-full sm:w-auto">
                  {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
                  <span className="hidden sm:inline ml-2">Exportar</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
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

            <Button variant="outline" size="icon" onClick={() => setDialogState({ type: "manage-locations" })}>
                <MapPin className="h-4 w-4" />
                <span className="sr-only">Gerenciar Locais</span>
            </Button>
            <Button variant="outline" size="icon" onClick={() => setDialogState({ type: "manage-categories" })}>
                <Settings className="h-4 w-4" />
                <span className="sr-only">Gerenciar Categorias</span>
            </Button>
            <Button onClick={() => setDialogState({ type: "add" })} className="w-full sm:w-auto">
                <PlusCircle className="h-4 w-4" />
                <span className="hidden sm:inline ml-2">Adicionar</span>
            </Button>
          </div>
        </div>
      </div>

      <AssetTable
        assets={filteredAssets}
        onEdit={(asset) => setDialogState({ type: "edit", asset })}
        onDelete={(asset) => setDialogState({ type: "delete", asset })}
      />
      
      {/* Add/Edit Dialog */}
      <Dialog
        open={dialogState?.type === "add" || dialogState?.type === "edit"}
        onOpenChange={(open) => !open && setDialogState(null)}
      >
        <DialogContent className="sm:max-w-[425px]">
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
      
      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={dialogState?.type === "delete"}
        onOpenChange={(open) => !open && setDialogState(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. Isso excluirá permanentemente o item
              <span className="font-semibold"> {dialogState?.type === 'delete' && dialogState.asset.name}</span>.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={isPending}>
                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
      {/* Manage Categories Dialog */}
      <ManageCategoriesDialog
        open={dialogState?.type === 'manage-categories'}
        onOpenChange={(open) => !open && setDialogState(null)}
        categories={categories || []}
        onCategoriesChange={handleCategoriesUpdate}
      />

       {/* Manage Locations Dialog */}
      <ManageLocationsDialog
        open={dialogState?.type === 'manage-locations'}
        onOpenChange={(open) => !open && setDialogState(null)}
        locations={locations || []}
        onLocationsChange={handleLocationsUpdate}
      />
    </>
  );
}
