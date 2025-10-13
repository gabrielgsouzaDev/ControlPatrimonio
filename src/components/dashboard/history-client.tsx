"use client";

import { useState, useMemo } from "react";
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
import { Search } from "lucide-react";

export default function HistoryClient({
  initialHistory,
}: {
  initialHistory: HistoryLog[];
}) {
  const [history, setHistory] = useState<HistoryLog[]>(initialHistory);
  const [searchTerm, setSearchTerm] = useState("");
  const [actionFilter, setActionFilter] = useState("all");
  const [userFilter, setUserFilter] = useState("all");

  const uniqueActions = useMemo(() => {
    const actions = new Set(history.map((log) => log.action));
    return ["all", ...Array.from(actions)];
  }, [history]);

  const uniqueUsers = useMemo(() => {
    const users = new Set(history.map((log) => log.user));
    return ["all", ...Array.from(users)];
  }, [history]);

  const filteredHistory = useMemo(() => {
    let filtered = history;

    if (actionFilter !== "all") {
      filtered = filtered.filter((log) => log.action === actionFilter);
    }

    if (userFilter !== "all") {
      filtered = filtered.filter((log) => log.user === userFilter);
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
        </div>
      </div>
      <HistoryTable history={filteredHistory} />
    </>
  );
}
