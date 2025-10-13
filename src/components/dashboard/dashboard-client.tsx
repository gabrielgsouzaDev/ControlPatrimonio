"use client";

import { useState, useMemo, useTransition, useEffect } from "react";
import type { Asset, Anomaly, Category } from "@/lib/types";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Download, PlusCircle, Sparkles, Loader2, Search, Settings, FileSpreadsheet, FileText } from "lucide-react";
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
import { runAnomalyDetection, exportAssetsToCsv } from "@/lib/actions";
import { useToast } from "@/hooks/use-toast";
import { ManageCategoriesDialog } from "./manage-categories-dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useCollection, useFirestore, useMemoFirebase, useUser } from "@/firebase";
import { collection } from "firebase/firestore";

type DialogState =
  | { type: "add" }
  | { type: "edit"; asset: Asset }
  | { type: "delete"; asset: Asset }
  | { type: "anomalies"; anomalies: Anomaly[] }
  | { type: "manage-categories" }
  | null;

export default function DashboardClient({ initialAssets, initialCategories }: { initialAssets: Asset[], initialCategories: Category[] }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [cityFilter, setCityFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [dialogState, setDialogState] = useState<DialogState>(null);
  const [isPending, startTransition] = useTransition();
  const [isDetecting, startDetectingTransition] = useTransition();
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  
  const assetsQuery = useMemoFirebase(() => (firestore ? collection(firestore, 'assets') : null), [firestore]);
  const categoriesQuery = useMemoFirebase(() => (firestore ? collection(firestore, 'categories') : null), [firestore]);

  const { data: assets, isLoading: isLoadingAssets } = useCollection<Asset>(assetsQuery);
  const { data: categories, isLoading: isLoadingCategories } = useCollection<Category>(categoriesQuery);

  const uniqueCities = useMemo(() => {
    if (!assets) return ["all"];
    const cities = new Set(assets.map((asset) => asset.city));
    return ["all", ...Array.from(cities)];
  }, [assets]);

  const uniqueCategories = useMemo(() => {
    if (!categories) return ["all"];
    return ["all", ...categories.map(c => c.name)];
  }, [categories]);

  const filteredAssets = useMemo(() => {
    if (!assets) return [];
    
    let filtered = assets;

    if (cityFilter !== "all") {
      filtered = filtered.filter((asset) => asset.city === cityFilter);
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
    
    // Enrich with category name
    const categoryMap = new Map((categories || []).map(cat => [cat.id, cat.name]));
    return filtered.map(asset => ({
        ...asset,
        category: categoryMap.get(asset.categoryId) || "Sem Categoria"
    }));

  }, [assets, categories, cityFilter, categoryFilter, searchTerm]);
  
  const anomalies = useMemo(() => {
    if (dialogState?.type === 'anomalies') {
        return dialogState.anomalies;
    }
    return [];
  }, [dialogState]);

  const handleFormSubmit = () => {
    // Data is real-time, no need to manually refresh
    setDialogState(null);
  };
  
  const handleCategoriesUpdate = () => {
     // Data is real-time, no need to manually refresh
  }

  const handleDelete = () => {
    if (dialogState?.type === "delete" && user && firestore) {
      startTransition(async () => {
        try {
          await deleteAsset(firestore, user.uid, user.displayName || "Usuário", dialogState.asset.id);
          setDialogState(null);
          toast({ title: "Sucesso", description: "Item excluído com sucesso." });
        } catch(error: any) {
          console.error("Error deleting asset:", error);
          toast({ variant: "destructive", title: "Erro ao Excluir", description: error.message || "Não foi possível excluir o item."});
        }
      });
    }
  };

  const handleDetectAnomalies = () => {
    if (!assets || assets.length === 0) {
        toast({ title: "Sem Dados", description: "Não há itens de patrimônio para analisar." });
        return;
    }
    startDetectingTransition(async () => {
        try {
            const detectedAnomalies = await runAnomalyDetection(assets);
            if (detectedAnomalies.length > 0) {
                setDialogState({ type: 'anomalies', anomalies: detectedAnomalies });
            } else {
                toast({ title: "Nenhuma Anomalia Encontrada", description: "A análise foi concluída e nenhum item suspeito foi detectado." });
            }
        } catch (error) {
            toast({ variant: "destructive", title: "Erro na Análise", description: "Não foi possível concluir a detecção de anomalias." });
        }
    });
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

  if (isLoadingAssets || isLoadingCategories) {
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

            <Button variant="outline" onClick={handleDetectAnomalies} disabled={isDetecting} className="w-full sm:w-auto">
                {isDetecting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                <span className="hidden sm:inline ml-2">Analisar com IA</span>
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
        anomalies={anomalies}
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
      
      {/* Anomalies Found Dialog */}
      <Dialog
        open={dialogState?.type === "anomalies"}
        onOpenChange={(open) => !open && setDialogState(null)}
      >
        <DialogContent className="sm:max-w-lg">
           <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
                <Sparkles className="text-primary"/> Anomalias Detectadas
            </DialogTitle>
            <DialogDescription>
              A análise com IA identificou os seguintes itens que podem exigir sua atenção.
            </DialogDescription>
          </DialogHeader>
           <div className="max-h-[60vh] overflow-y-auto pr-4">
                <ul className="space-y-4">
                    {dialogState?.type === 'anomalies' && dialogState.anomalies.map((anomaly, index) => (
                        <li key={index} className="p-4 rounded-md border bg-card">
                            <p className="font-semibold text-foreground">
                                Item (ID): <span className="font-normal text-muted-foreground">{anomaly.codeId}</span>
                            </p>
                             <p className="font-semibold text-foreground capitalize">
                                Tipo: <span className="font-normal text-muted-foreground">{anomaly.anomalyType}</span>
                            </p>
                             <p className="font-semibold text-foreground">
                                Descrição: <span className="font-normal text-muted-foreground">{anomaly.description}</span>
                            </p>
                        </li>
                    ))}
                </ul>
           </div>
        </DialogContent>
      </Dialog>

      {/* Manage Categories Dialog */}
      <ManageCategoriesDialog
        open={dialogState?.type === 'manage-categories'}
        onOpenChange={(open) => !open && setDialogState(null)}
        categories={categories || []}
        onCategoriesChange={handleCategoriesUpdate}
      />
    </>
  );
}
