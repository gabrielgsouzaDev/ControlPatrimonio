
"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { HistoryLog } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useState, useEffect } from "react";
import { Timestamp } from "firebase/firestore";

interface HistoryTableProps {
  history: HistoryLog[];
}

export function HistoryTable({ history }: HistoryTableProps) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const getActionBadgeVariant = (action: HistoryLog['action']) => {
    switch(action) {
        case 'Criado': return 'default';
        case 'Atualizado': return 'secondary';
        case 'Excluído': return 'destructive';
        case 'Desativado': return 'destructive';
        case 'Reativado': return 'default';
        default: return 'outline';
    }
  }

  const sortedHistory = [...history].sort((a, b) => {
    const timeA = a.timestamp instanceof Timestamp ? a.timestamp.toMillis() : new Date(a.timestamp).getTime();
    const timeB = b.timestamp instanceof Timestamp ? b.timestamp.toMillis() : new Date(b.timestamp).getTime();
    return timeB - timeA;
});

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Item</TableHead>
          <TableHead>Código ID</TableHead>
          <TableHead>Ação</TableHead>
          <TableHead>Usuário</TableHead>
          <TableHead>Detalhes</TableHead>
          <TableHead className="sticky right-0 bg-card z-10 text-right">Data e Hora</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {history.length === 0 ? (
          <TableRow>
            <TableCell colSpan={6} className="h-24 text-center">
              Nenhum registro de histórico encontrado.
            </TableCell>
          </TableRow>
        ) : (
          sortedHistory.map((log) => (
            <TableRow key={log.id}>
              <TableCell className="font-medium whitespace-nowrap">{log.assetName}</TableCell>
              <TableCell>
                <Badge variant="outline">{log.codeId}</Badge>
              </TableCell>
              <TableCell>
                  <Badge variant={getActionBadgeVariant(log.action)}>{log.action}</Badge>
              </TableCell>
              <TableCell className="whitespace-nowrap">{log.userDisplayName}</TableCell>
              <TableCell className="text-muted-foreground max-w-[250px] truncate">{log.details}</TableCell>
              <TableCell className="sticky right-0 bg-card z-10 text-right whitespace-nowrap">
                {isClient && log.timestamp ? format(log.timestamp instanceof Timestamp ? log.timestamp.toDate() : new Date(log.timestamp), "dd/MM/yyyy HH:mm:ss", { locale: ptBR }) : ''}
              </TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  );
}
