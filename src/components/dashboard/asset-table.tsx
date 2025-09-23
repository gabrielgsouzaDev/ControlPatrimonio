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
import { MoreVertical, Edit, Trash2, AlertCircle } from "lucide-react";
import type { Asset, Anomaly } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface AssetTableProps {
  assets: Asset[];
  anomalies: Anomaly[];
  onEdit: (asset: Asset) => void;
  onDelete: (asset: Asset) => void;
}

export function AssetTable({ assets, anomalies, onEdit, onDelete }: AssetTableProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };
  
  const anomalyMap = new Map(anomalies.map(a => [a.codeId, a]));

  return (
    <div className="rounded-lg border shadow-sm">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12"></TableHead>
            <TableHead>Nome</TableHead>
            <TableHead>Código ID</TableHead>
            <TableHead>Cidade/Local</TableHead>
            <TableHead className="text-right">Valor</TableHead>
            <TableHead>Observação</TableHead>
            <TableHead className="w-16">Ações</TableHead>
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
            assets.map((asset) => {
              const anomaly = anomalyMap.get(asset.codeId);
              return (
              <TableRow key={asset.id} className={anomaly ? "bg-destructive/10" : ""}>
                <TableCell>
                  {anomaly && (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger>
                          <AlertCircle className="h-5 w-5 text-destructive" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>{anomaly.description}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  )}
                </TableCell>
                <TableCell className="font-medium">{asset.name}</TableCell>
                <TableCell>
                  <Badge variant="outline">{asset.codeId}</Badge>
                </TableCell>
                <TableCell>{asset.city}</TableCell>
                <TableCell className="text-right">
                  {formatCurrency(asset.value)}
                </TableCell>
                <TableCell>{asset.observation || "-"}</TableCell>
                <TableCell>
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
            )})
          )}
        </TableBody>
      </Table>
    </div>
  );
}
