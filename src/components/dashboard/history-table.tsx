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

interface HistoryTableProps {
  history: HistoryLog[];
}

export function HistoryTable({ history }: HistoryTableProps) {

  const getActionBadgeVariant = (action: HistoryLog['action']) => {
    switch(action) {
        case 'Criado': return 'default';
        case 'Atualizado': return 'secondary';
        case 'Excluído': return 'destructive';
        default: return 'outline';
    }
  }

  return (
    <div className="rounded-lg border shadow-sm">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Item</TableHead>
            <TableHead>Código ID</TableHead>
            <TableHead>Ação</TableHead>
            <TableHead>Usuário</TableHead>
            <TableHead>Detalhes</TableHead>
            <TableHead className="text-right">Data e Hora</TableHead>
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
            history.sort((a,b) => b.timestamp.getTime() - a.timestamp.getTime()).map((log) => (
              <TableRow key={log.id}>
                <TableCell className="font-medium">{log.assetName}</TableCell>
                <TableCell>
                  <Badge variant="outline">{log.codeId}</Badge>
                </TableCell>
                <TableCell>
                    <Badge variant={getActionBadgeVariant(log.action)}>{log.action}</Badge>
                </TableCell>
                <TableCell>{log.user}</TableCell>
                <TableCell className="text-muted-foreground">{log.details}</TableCell>
                <TableCell className="text-right">
                  {format(log.timestamp, "dd/MM/yyyy HH:mm:ss", { locale: ptBR })}
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
