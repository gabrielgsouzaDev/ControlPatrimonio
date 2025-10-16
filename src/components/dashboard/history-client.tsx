
"use client";

import { useState, useMemo, useTransition } from "react";
import type { HistoryLog } from "@/lib/types";
import { HistoryTable } from "@/components/dashboard/history-table";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Search, Download, FileSpreadsheet, FileText, Loader2 } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { exportHistoryToCsv } from "@/lib/actions";
import { useCollection, useFirestore, useMemoFirebase } from "@/firebase";
import { collection } from "firebase/firestore";
import { exportHistoryToPdf } from "@/lib/pdf-export";

export default function HistoryClient() {
  const [searchTerm, setSearchTerm] = useState("");
  const [actionFilter, setActionFilter] = useState("all");
  const [userFilter, setUserFilter] = useState("all");
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();
  const firestore = useFirestore();

  const historyQuery = useMemoFirebase(() => (firestore ? collection(firestore, 'history') : null), [firestore]);
  const { data: history, isLoading: isLoadingHistory } = useCollection<HistoryLog>(historyQuery);

  const uniqueActions = useMemo(() => {
    if (!history) return [];
    const actions = new Set(history.map((log) => log.action));
    return ["all", ...Array.from(actions).sort()];
  }, [history]);

  const uniqueUsers = useMemo(() => {
    if (!history) return [];
    const users = new Set(history.map((log) => log.userDisplayName));
    return ["all", ...Array.from(users).sort()];
  }, [history]);

  const filteredHistory = useMemo(() => {
    if (!history) return [];
    let filtered = history;

    if (actionFilter !== "all") {
      filtered = filtered.filter((log) => log.action === actionFilter);
    }

    if (userFilter !== "all") {
      filtered = filtered.filter((log) => log.userDisplayName === userFilter);
    }

    if (searchTerm) {
      const lowercasedTerm = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (log) =>
          log.assetName.toLowerCase().includes(lowercasedTerm) ||
          log.codeId.toLowerCase().includes(lowercasedTerm)
      );
    }

    return filtered;
  }, [history, actionFilter, userFilter, searchTerm]);

  const handleExportCsv = () => {
    startTransition(async () => {
        try {
            const csvString = await exportHistoryToCsv(filteredHistory);
            if (!csvString) {
                toast({ variant: "destructive", title: "Exportação Falhou", description: "Não há dados para exportar."});
                return;
            }
            const blob = new Blob([`\uFEFF${csvString}`], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement('a');
            const url = URL.createObjectURL(blob);
            link.setAttribute('href', url);
            link.setAttribute('download', 'historico_patrimonio.csv');
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
        exportHistoryToPdf(filteredHistory);
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

  if (isLoadingHistory) {
      return (
          <div className="flex h-[80vh] items-center justify-center">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
          </div>
      );
  }

  return (
    <>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
        <div>
          <h2 className="text-3xl font-headline tracking-tight">
            Histórico de Alterações
          </h2>
          <p className="text-muted-foreground">
            Veja o registro de todas as mudanças feitas no patrimônio.
          </p>
        </div>
      </div>
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:flex-wrap items-center gap-4">
            <div className="relative w-full sm:flex-1 sm:min-w-[250px]">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Pesquisar por item ou código..."
                className="w-full rounded-lg bg-background pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select value={actionFilter} onValueChange={setActionFilter}>
              <SelectTrigger className="w-full sm:w-auto sm:min-w-[180px]">
                <SelectValue placeholder="Filtrar por ação" />
              </SelectTrigger>
              <SelectContent>
                {uniqueActions.map((action) => (
                  <SelectItem key={action} value={action}>
                    {action === "all" ? "Todas as Ações" : action}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={userFilter} onValueChange={setUserFilter}>
              <SelectTrigger className="w-full sm:w-auto sm:min-w-[180px]">
                <SelectValue placeholder="Filtrar por usuário" />
              </SelectTrigger>
              <SelectContent>
                {uniqueUsers.map((user) => (
                  <SelectItem key={user} value={user}>
                    {user === "all" ? "Todos os Usuários" : user}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="w-full sm:w-auto sm:ml-auto">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" disabled={isPending} className="w-full sm:w-auto">
                       {isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Download className="h-4 w-4 mr-2" />}
                      Exportar
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
            </div>
        </div>
      </div>
      <div className="mt-4 rounded-lg border shadow-sm">
        <HistoryTable history={filteredHistory || []} />
      </div>
    </>
  );
}
