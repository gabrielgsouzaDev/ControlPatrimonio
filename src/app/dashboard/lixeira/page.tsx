
'use client';

import { useState, useMemo, useTransition } from 'react';
import { useCollection, useFirestore, useMemoFirebase, useUser } from '@/firebase';
import { collection, doc, writeBatch, serverTimestamp } from 'firebase/firestore';
import type { Asset } from '@/lib/types';
import { Loader2, Trash2, History } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { Timestamp } from 'firebase/firestore';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

export default function LixeiraPage() {
  const firestore = useFirestore();
  const { user } = useUser();
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();
  const [assetToReactivate, setAssetToReactivate] = useState<Asset | null>(null);

  const assetsQuery = useMemoFirebase(
    () => (firestore ? collection(firestore, 'assets') : null),
    [firestore]
  );
  const { data: assets, isLoading: isLoadingAssets } = useCollection<Asset>(assetsQuery);

  const inactiveAssets = useMemo(() => {
    return assets
      ? assets.filter(asset => asset.status === 'inativo')
      : [];
  }, [assets]);
  
  const handleReactivate = () => {
    if (!assetToReactivate || !firestore || !user) return;

    startTransition(async () => {
      const assetRef = doc(firestore, 'assets', assetToReactivate.id);
      const historyRef = doc(collection(firestore, 'history'));
      
      const batch = writeBatch(firestore);

      batch.update(assetRef, { status: 'ativo', updatedAt: serverTimestamp() });
      
      batch.set(historyRef, {
        assetId: assetToReactivate.id,
        assetName: assetToReactivate.name,
        codeId: assetToReactivate.codeId,
        action: 'Reativado',
        details: 'Item foi restaurado da lixeira.',
        userId: user.uid,
        userDisplayName: user.displayName || 'Usuário',
        timestamp: serverTimestamp(),
      });

      try {
        await batch.commit();
        toast({ title: 'Sucesso', description: `O item "${assetToReactivate.name}" foi reativado.` });
        setAssetToReactivate(null);
      } catch (error: any) {
        console.error('Error reactivating asset:', error);
        toast({ variant: 'destructive', title: 'Erro ao Reativar', description: 'Não foi possível reativar o item.' });
      }
    });
  };

  const formatDate = (date: any) => {
    if (!date) return '-';
    const d = date instanceof Timestamp ? date.toDate() : new Date(date);
    return format(d, 'dd/MM/yyyy HH:mm');
  };

  if (isLoadingAssets) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <>
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-headline tracking-tight">Lixeira</h2>
            <p className="text-muted-foreground">
              Itens desativados. Você pode reativá-los a qualquer momento.
            </p>
          </div>
        </div>

        <div className="rounded-lg border shadow-sm">
           <div className="overflow-x-auto">
                <Table>
                <TableHeader>
                    <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Código ID</TableHead>
                    <TableHead>Última Modificação</TableHead>
                    <TableHead className="text-right sticky right-0 bg-card z-10">Ações</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {inactiveAssets.length === 0 ? (
                    <TableRow>
                        <TableCell colSpan={4} className="h-24 text-center">
                        A lixeira está vazia.
                        </TableCell>
                    </TableRow>
                    ) : (
                    inactiveAssets.map(asset => (
                        <TableRow key={asset.id}>
                        <TableCell className="font-medium whitespace-nowrap">{asset.name}</TableCell>
                        <TableCell>
                            <Badge variant="outline">{asset.codeId}</Badge>
                        </TableCell>
                        <TableCell className="whitespace-nowrap">{formatDate(asset.updatedAt)}</TableCell>
                        <TableCell className="text-right sticky right-0 bg-card z-10">
                            <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setAssetToReactivate(asset)}
                            disabled={isPending}
                            >
                            <History className="mr-2 h-4 w-4" />
                            Reativar
                            </Button>
                        </TableCell>
                        </TableRow>
                    ))
                    )}
                </TableBody>
                </Table>
            </div>
        </div>
      </div>
      
      <AlertDialog
        open={!!assetToReactivate}
        onOpenChange={(open) => !open && setAssetToReactivate(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reativar Item?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação irá restaurar o item{' '}
              <span className="font-semibold">{assetToReactivate?.name}</span> para a lista de patrimônios ativos.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleReactivate} disabled={isPending}>
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Reativar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
