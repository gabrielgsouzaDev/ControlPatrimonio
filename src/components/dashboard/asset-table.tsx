
"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { MoreVertical, Edit, Trash2, ArrowUp, ArrowDown } from "lucide-react";
import type { Asset } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { SortConfig } from "./dashboard-client";
import { format } from 'date-fns';
import { Timestamp } from "firebase/firestore";

interface AssetTableProps {
  assets: Asset[];
  onEdit: (asset: Asset) => void;
  onDelete: (asset: Asset) => void;
  sortConfig: SortConfig | null;
  requestSort: (key: keyof Asset) => void;
}

export function AssetTable({ assets, onEdit, onDelete, sortConfig, requestSort }: AssetTableProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const getSortIcon = (key: keyof Asset) => {
    if (!sortConfig || sortConfig.key !== key) {
      return null;
    }
    if (sortConfig.direction === 'asc') {
      return <ArrowUp className="h-4 w-4 ml-2" />;
    }
    return <ArrowDown className="h-4 w-4 ml-2" />;
  };

  const formatDate = (date: any) => {
    if (!date) return '-';
    const d = date instanceof Timestamp ? date.toDate() : new Date(date);
    return format(d, 'dd/MM/yyyy HH:mm');
  };
  
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>
            <Button variant="ghost" onClick={() => requestSort('name')}>
              Nome {getSortIcon('name')}
            </Button>
          </TableHead>
          <TableHead>
            <Button variant="ghost" onClick={() => requestSort('codeId')}>
              Código ID {getSortIcon('codeId')}
            </Button>
          </TableHead>
          <TableHead>Categoria</TableHead>
          <TableHead>Cidade/Local</TableHead>
          <TableHead className="text-right">
             <Button variant="ghost" onClick={() => requestSort('value')}>
              Valor {getSortIcon('value')}
            </Button>
          </TableHead>
          <TableHead>
            <Button variant="ghost" onClick={() => requestSort('updatedAt')}>
              Última Modificação {getSortIcon('updatedAt')}
            </Button>
          </TableHead>
          <TableHead>Observação</TableHead>
          <TableHead className="sticky right-0 bg-card z-10 text-center">Ações</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {assets.length === 0 ? (
          <TableRow>
            <TableCell colSpan={8} className="h-24 text-center">
              Nenhum item encontrado.
            </TableCell>
          </TableRow>
        ) : (
          assets.map((asset) => (
            <TableRow key={asset.id}>
              <TableCell className="font-medium whitespace-nowrap">{asset.name}</TableCell>
              <TableCell>
                <Badge variant="outline">{asset.codeId}</Badge>
              </TableCell>
              <TableCell className="whitespace-nowrap">{asset.category}</TableCell>
              <TableCell className="whitespace-nowrap">{asset.city}</TableCell>
              <TableCell className="text-right whitespace-nowrap">
                {formatCurrency(asset.value)}
              </TableCell>
              <TableCell className="whitespace-nowrap">{formatDate(asset.updatedAt)}</TableCell>
              <TableCell className="max-w-[200px] truncate">{asset.observation || "-"}</TableCell>
              <TableCell className="sticky right-0 bg-card z-10 text-center">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                      <span className="sr-only">Abrir menu</span>
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => onEdit(asset)}>
                      <Edit className="mr-2 h-4 w-4" />
                      <span>Editar</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onDelete(asset)} className="text-red-600">
                      <Trash2 className="mr-2 h-4 w-4" />
                      <span>Desativar</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  );
}
