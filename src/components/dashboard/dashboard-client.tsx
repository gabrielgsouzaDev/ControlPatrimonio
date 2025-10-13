"use client";

import { useState, useMemo, useTransition } from "react";
import type { Asset, Anomaly } from "@/lib/types";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Download, PlusCircle, Sparkles, Loader2, Search } from "lucide-react";
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
import { deleteAsset, runAnomalyDetection, exportAssetsToCsv } from "@/lib/actions";
import { useToast } from "@/hooks/use-toast";

type DialogState =
  | { type: "add" }
  | { type: "edit"; asset: Asset }
  | { type: "delete"; asset: Asset }
  | { type: "anomalies"; anomalies: Anomaly[] }
  | null;

export default function DashboardClient({ initialAssets }: { initialAssets: Asset[] }) {
  const [assets, setAssets] = useState<Asset[]>(initialAssets);
  const [searchTerm, setSearchTerm] = useState("");
  const [cityFilter, setCityFilter] = useState("all");
  const [dialogState, setDialogState] = useState<DialogState>(null);
  const [isPending, startTransition] = useTransition();
  const [isDetecting, startDetectingTransition] = useTransition();

  const { toast } = useToast();

  const uniqueCities = useMemo(() => {
    const cities = new Set(assets.map((asset) => asset.city));
    return ["all", ...Array.from(cities)];
  }, [assets]);

  const filteredAssets = useMemo(() => {
    let filtered = assets;

    if (cityFilter !== "all") {
      filtered = filtered.filter((asset) => asset.city === cityFilter);
    }

    if (searchTerm) {
      const lowercasedTerm = searchTerm.toLowerCase();
      filtered = filtered.filter(asset => 
        asset.name.toLowerCase().includes(lowercasedTerm) ||
        asset.codeId.toLowerCase().includes(lowercasedTerm)
      );
    }
    
    return filtered;
  }, [assets, cityFilter, searchTerm]);
  
  const anomalies = useMemo(() => {
    if (dialogState?.type === 'anomalies') {
        return dialogState.anomalies;
    }
    return [];
  }, [dialogState]);

  const handleFormSubmit = () => {
    // This is a mock refresh. In a real app, you might re-fetch or optimistically update.
    console.log("Form submitted, pretending to refresh data.");
    setDialogState(null);
  };

  const handleDelete = () => {
    if (dialogState?.type === "delete") {
      startTransition(async () => {
        await deleteAsset(dialogState.asset.id);
        setAssets(assets.filter(a => a.id !== dialogState.asset.id));
        setDialogState(null);
        toast({ title: "Sucesso", description: "Item excluído com sucesso." });
      });
    }
  };

  const handleDetectAnomalies = () => {
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
  
  const handleExport = () => {
    startTransition(async () => {
        try {
            const csvString = await exportAssetsToCsv(filteredAssets);
            if (!csvString) {
                toast({ variant: "destructive", title: "Exportação Falhou", description: "Não há dados para exportar."});
                return;
            }
            const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
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
        <div className="flex items-center space-x-2 w-full md:w-auto justify-end">
           <Select value={cityFilter} onValueChange={setCityFilter}>
            <SelectTrigger className="w-full md:w-[180px]">
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
          <Button variant="outline" onClick={handleExport} disabled={isPending}>
            {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download />}
            Exportar
          </Button>
          <Button variant="outline" onClick={handleDetectAnomalies} disabled={isDetecting}>
            {isDetecting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles />}
             Anomalias
          </Button>
          <Button onClick={() => setDialogState({ type: "add" })}>
            <PlusCircle />
            Adicionar
          </Button>
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
                    {dialogState?.type === 'anomalies' && dialogState.anomalies.map((anomaly) => (
                        <li key={anomaly.codeId} className="p-4 rounded-md border bg-card">
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
    </>
  );
}
