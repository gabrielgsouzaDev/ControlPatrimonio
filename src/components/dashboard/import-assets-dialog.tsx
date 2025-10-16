
"use client";

import { useState, useTransition, useCallback } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Loader2, UploadCloud, FileText, Download, X as CloseIcon } from "lucide-react";
import { useDropzone } from 'react-dropzone';
import { importAssetsFromCsv } from "@/lib/actions";
import { useUser } from "@/firebase";

interface ImportAssetsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onImportSuccess: (count: number) => void;
}

export function ImportAssetsDialog({ open, onOpenChange, onImportSuccess }: ImportAssetsDialogProps) {
  const [isPending, startTransition] = useTransition();
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<{ success: number, failed: number, errors: string[] } | null>(null);
  const { toast } = useToast();
  const { user } = useUser();

  const handleDownloadTemplate = () => {
    const headers = "name,codeId,categoryId,city,value,observation";
    const example = "Notebook Dell,NTB-001,Eletrônicos,São Paulo,4500.50,Comprado em 2023";
    const csvContent = `${headers}\n${example}`;
    const blob = new Blob([`\uFEFF${csvContent}`], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'modelo_importacao.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      setFile(acceptedFiles[0]);
      setResult(null);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'text/csv': ['.csv'] },
    multiple: false
  });

  const handleImport = async () => {
    if (!file) {
      toast({ variant: "destructive", title: "Erro", description: "Nenhum arquivo selecionado." });
      return;
    }
    if (!user) {
        toast({ variant: "destructive", title: "Erro", description: "Usuário não autenticado." });
        return;
    }
    
    startTransition(async () => {
        const reader = new FileReader();
        reader.onload = async (event) => {
            const csvContent = event.target?.result as string;
            try {
                const importResult = await importAssetsFromCsv(csvContent, user.uid, user.displayName || 'Usuário');
                setResult(importResult);
                if (importResult.success > 0) {
                    onImportSuccess(importResult.success);
                }
            } catch (error: any) {
                toast({ variant: "destructive", title: "Erro na Importação", description: error.message || "Não foi possível processar o arquivo." });
            }
        };
        reader.readAsText(file, 'UTF-8');
    });
  };

  const closeDialog = () => {
    setFile(null);
    setResult(null);
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={closeDialog}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Importar Ativos via CSV</DialogTitle>
          <DialogDescription>
            Faça o upload de um arquivo CSV para adicionar múltiplos itens de uma só vez.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4 space-y-4">
            <Button variant="outline" onClick={handleDownloadTemplate} className="w-full">
                <Download className="mr-2 h-4 w-4" />
                Baixar Modelo CSV
            </Button>
            
            <div {...getRootProps()} className={`p-6 border-2 border-dashed rounded-md text-center cursor-pointer transition-colors ${isDragActive ? 'border-primary bg-primary/10' : 'border-border'}`}>
                <input {...getInputProps()} />
                <UploadCloud className="mx-auto h-12 w-12 text-muted-foreground" />
                {isDragActive ? (
                    <p>Solte o arquivo aqui...</p>
                ) : (
                    <p>Arraste e solte o arquivo CSV aqui, ou clique para selecionar</p>
                )}
            </div>

            {file && !result && (
                <div className="flex items-center p-2 border rounded-md bg-muted/50">
                    <FileText className="h-5 w-5 mr-2 text-muted-foreground" />
                    <span className="text-sm font-medium flex-1 truncate">{file.name}</span>
                    <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setFile(null)}>
                        <CloseIcon className="h-4 w-4" />
                    </Button>
                </div>
            )}
            {result && (
                <div className="p-4 border rounded-md bg-muted/50">
                    <h4 className="font-semibold mb-2">Resultado da Importação</h4>
                    <p className="text-sm text-green-600">
                        {result.success} {result.success === 1 ? 'item importado' : 'itens importados'} com sucesso.
                    </p>
                    <p className="text-sm text-destructive">
                        {result.failed} {result.failed === 1 ? 'linha falhou' : 'linhas falharam'}.
                    </p>
                    {result.errors.length > 0 && (
                        <div className="mt-2 text-xs text-destructive max-h-24 overflow-y-auto">
                            <p className="font-medium">Erros:</p>
                            <ul className="list-disc pl-4 space-y-1">
                                {result.errors.map((error, index) => <li key={index}>{error}</li>)}
                            </ul>
                        </div>
                    )}
                </div>
            )}
        </div>
        <DialogFooter className="sm:justify-between gap-2">
            <Button variant="outline" onClick={closeDialog}>Fechar</Button>
            <Button onClick={handleImport} disabled={isPending || !file || !!result}>
                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Importar
            </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
