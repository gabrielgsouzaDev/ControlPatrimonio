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
import { MoreVertical, Edit, Trash2 } from "lucide-react";
import type { Asset } from "@/lib/types";
import { Badge } from "@/components/ui/badge";

interface AssetTableProps {
  assets: Asset[];
  onEdit: (asset: Asset) => void;
  onDelete: (asset: Asset) => void;
}

export function AssetTable({ assets, onEdit, onDelete }: AssetTableProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };
  
  return (
    <div className="rounded-lg border shadow-sm w-full">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nome</TableHead>
            <TableHead>Código ID</TableHead>
            <TableHead>Categoria</TableHead>
            <TableHead>Cidade/Local</TableHead>
            <TableHead className="text-right">Valor</TableHead>
            <TableHead>Observação</TableHead>
            <TableHead className="w-16 text-center">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {assets.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="h-24 text-center">
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
                <TableCell className="max-w-[200px] truncate">{asset.observation || "-"}</TableCell>
                <TableCell className="text-center">
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
                      <DropdownMenuItem onClick={() => onDelete(asset)}>
                        <Trash2 className="mr-2 h-4 w-4" />
                        <span>Excluir</span>
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
