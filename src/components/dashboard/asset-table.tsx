
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
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";

interface AssetTableProps {
  assets: Asset[];
  onEdit: (asset: Asset) => void;
  onDelete: (asset: Asset) => void;
  sortConfig: SortConfig | null;
  requestSort: (key: keyof Asset) => void;
  selectedAssets: Record<string, boolean>;
  setSelectedAssets: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
  isSelectionMode: boolean;
}

export function AssetTable({ assets, onEdit, onDelete, sortConfig, requestSort, selectedAssets, setSelectedAssets, isSelectionMode }: AssetTableProps) {
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

  const handleSelectAll = (checked: boolean) => {
    const newSelectedAssets: Record<string, boolean> = {};
    if (checked) {
      assets.forEach(asset => {
        newSelectedAssets[asset.id] = true;
      });
    }
    setSelectedAssets(newSelectedAssets);
  };

  const handleSelectOne = (id: string, checked: boolean) => {
    setSelectedAssets(prev => {
      const newSelected = { ...prev };
      if (checked) {
        newSelected[id] = true;
      } else {
        delete newSelected[id];
      }
      return newSelected;
    });
  };

  const isAllSelected = assets.length > 0 && assets.every(asset => selectedAssets[asset.id]);

  return (
    <div className="overflow-x-auto">
        <Table>
        <TableHeader>
            <TableRow>
            <TableHead className={cn("transition-all duration-300 sticky left-0 bg-card z-20", isSelectionMode ? "w-[60px] p-4" : "w-0 p-0")}>
              {isSelectionMode && (
                <Checkbox
                  checked={isAllSelected}
                  onCheckedChange={(checked) => handleSelectAll(Boolean(checked))}
                  aria-label="Selecionar todos"
                  className="translate-y-[2px]"
                />
              )}
            </TableHead>
            <TableHead className="min-w-[150px]">
                <Button variant="ghost" onClick={() => requestSort('name')} className="-ml-4">
                Nome {getSortIcon('name')}
                </Button>
            </TableHead>
            <TableHead className="min-w-[120px]">
                <Button variant="ghost" onClick={() => requestSort('codeId')} className="-ml-4">
                Código ID {getSortIcon('codeId')}
                </Button>
            </TableHead>
            <TableHead className="min-w-[150px]">Categoria</TableHead>
            <TableHead className="min-w-[150px]">Cidade/Local</TableHead>
            <TableHead className="text-right min-w-[150px]">
                <Button variant="ghost" onClick={() => requestSort('value')} className="justify-end w-full -mr-4">
                Valor {getSortIcon('value')}
                </Button>
            </TableHead>
            <TableHead className="min-w-[200px]">
                <Button variant="ghost" onClick={() => requestSort('updatedAt')} className="-ml-4">
                Última Modificação {getSortIcon('updatedAt')}
                </Button>
            </TableHead>
            <TableHead className="min-w-[200px]">Observação</TableHead>
            <TableHead className="sticky right-0 bg-card z-10 text-center">Ações</TableHead>
            </TableRow>
        </TableHeader>
        <TableBody>
            {assets.length === 0 ? (
            <TableRow>
                <TableCell colSpan={9} className="h-24 text-center">
                Nenhum item encontrado.
                </TableCell>
            </TableRow>
            ) : (
            assets.map((asset) => (
                <TableRow key={asset.id} data-state={selectedAssets[asset.id] ? 'selected' : undefined}>
                <TableCell className={cn("transition-all duration-300 sticky left-0 bg-card data-[state=selected]:bg-muted z-20", isSelectionMode ? "w-[60px] p-4" : "w-0 p-0")}>
                  {isSelectionMode && (
                    <Checkbox
                      checked={selectedAssets[asset.id] || false}
                      onCheckedChange={(checked) => handleSelectOne(asset.id, Boolean(checked))}
                      aria-label={`Selecionar ${asset.name}`}
                      className="translate-y-[2px]"
                    />
                  )}
                </TableCell>
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
                <TableCell className="sticky right-0 bg-card data-[state=selected]:bg-muted z-10 text-center">
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
                        <DropdownMenuItem
                        onClick={() => onDelete(asset)}
                        className="text-destructive focus:bg-destructive focus:text-destructive-foreground"
                        >
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
    </div>
  );
}
