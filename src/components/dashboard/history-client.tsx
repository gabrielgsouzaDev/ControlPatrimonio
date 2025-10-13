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
    if (!history) return ["all"];
    const actions = new Set(history.map((log) => log.action));
    return ["all", ...Array.from(actions)];
  }, [history]);

  const uniqueUsers = useMemo(() => {
    if (!history) return ["all"];
    const users = new Set(history.map((log) => log.userDisplayName));
    return ["all", ...Array.from(users)];
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
    toast({
      title: "Funcionalidade em breve",
      description: "A exportação para PDF ainda não está disponível.",
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
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-3xl font-headline tracking-tight">
            Histórico de Alterações
          </h2>
          <p className="text-muted-foreground">
            Veja o registro de todas as mudanças feitas no patrimônio.
          </p>
        </div>
      </div>
      <div className="flex flex-col md:flex-row items-center justify-between space-y-2 md:space-y-0 md:space-x-2 mb-4">
        <div className="relative w-full md:w-auto md:flex-grow">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Pesquisar por item ou código..."
            className="w-full rounded-lg bg-background pl-8 md:w-[300px]"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-2 w-full md:w-auto justify-end">
          <Select value={actionFilter} onValueChange={setActionFilter}>
            <SelectTrigger className="w-full sm:w-[180px]">
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
            <SelectTrigger className="w-full sm:w-[180px]">
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
          <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" disabled={isPending} className="w-full sm:w-auto">
                  {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
                  <span className="ml-2">Exportar</span>
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
        </div>
      </div>
      <HistoryTable history={filteredHistory || []} />
    </>
  );
}
