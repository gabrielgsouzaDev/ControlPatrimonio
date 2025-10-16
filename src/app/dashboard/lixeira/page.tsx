
'use client';

import { useState, useMemo, useTransition } from 'react';
import { useCollection, useFirestore, useMemoFirebase, useUser } from '@/firebase';
import { collection, doc, writeBatch, serverTimestamp } from 'firebase/firestore';
import type { Asset, Category } from '@/lib/types';
import { Loader2, History, Search, ArrowUp, ArrowDown } from 'lucide-react';
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
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

type SortDirection = 'asc' | 'desc';

export default function LixeiraPage() {
  const firestore = useFirestore();
  const { user } = useUser();
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();
  const [assetToReactivate, setAssetToReactivate] = useState<Asset | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [categoryFilter, setCategoryFilter] = useState("all");

  const assetsQuery = useMemoFirebase(
    () => (firestore ? collection(firestore, 'assets') : null),
    [firestore]
  );
  const categoriesQuery = useMemoFirebase(
    () => (firestore ? collection(firestore, 'categories') : null),
    [firestore]
  );

  const { data: assets, isLoading: isLoadingAssets } = useCollection<Asset>(assetsQuery);
  const { data: categories, isLoading: isLoadingCategories } = useCollection<Category>(categoriesQuery);

   const uniqueCategories = useMemo(() => {
    if (!categories) return [];
    const categoryNames = categories.map(c => c.name).sort();
    return ["all", ...categoryNames];
  }, [categories]);

  const processedAssets = useMemo(() => {
    if (!assets || !categories) return [];
    
    let inactiveAssets = assets.filter(asset => asset.status === 'inativo');

    const categoryMap = new Map(categories.map(cat => [cat.id, cat.name]));

    if (categoryFilter !== "all") {
      const selectedCategory = categories.find(c => c.name === categoryFilter);
      if (selectedCategory) {
        inactiveAssets = inactiveAssets.filter((asset) => asset.categoryId === selectedCategory.id);
      }
    }

    if (searchTerm) {
        const lowercasedTerm = searchTerm.toLowerCase();
        inactiveAssets = inactiveAssets.filter(asset => {
            const categoryName = categoryMap.get(asset.categoryId)?.toLowerCase() || '';
            return asset.name.toLowerCase().includes(lowercasedTerm) ||
                   asset.codeId.toLowerCase().includes(lowercasedTerm) ||
                   categoryName.includes(lowercasedTerm);
        });
    }
    
    inactiveAssets.sort((a, b) => {
        const timeA = a.updatedAt instanceof Timestamp ? a.updatedAt.toMillis() : new Date(a.updatedAt as any).getTime();
        const timeB = b.updatedAt instanceof Timestamp ? b.updatedAt.toMillis() : new Date(b.updatedAt as any).getTime();
        
        if (sortDirection === 'asc') {
            return timeA - timeB;
        } else {
            return timeB - timeA;
        }
    });

    return inactiveAssets.map(asset => ({
        ...asset,
        categoryName: categoryMap.get(asset.categoryId) || 'Sem Categoria'
    }));

  }, [assets, categories, searchTerm, categoryFilter, sortDirection]);
  
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

  const toggleSortDirection = () => {
    setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
  };

  const getSortIcon = () => {
    if (sortDirection === 'asc') {
      return <ArrowUp className="h-4 w-4 ml-2" />;
    }
    return <ArrowDown className="h-4 w-4 ml-2" />;
  };

  const formatDate = (date: any) => {
    if (!date) return '-';
    const d = date instanceof Timestamp ? date.toDate() : new Date(date);
    return format(d, 'dd/MM/yyyy HH:mm');
  };

  if (isLoadingAssets || isLoadingCategories) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <>
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-3xl font-headline tracking-tight">Lixeira</h2>
            <p className="text-muted-foreground">
              Itens desativados. Você pode reativá-los a qualquer momento.
            </p>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row sm:flex-wrap items-center gap-4">
           <div className="relative w-full sm:flex-1 sm:min-w-[250px]">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Buscar por nome, código ou categoria..."
                className="w-full rounded-lg bg-background pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
             <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-full sm:w-auto sm:min-w-[180px]">
                <SelectValue placeholder="Filtrar por categoria" />
              </SelectTrigger>
              <SelectContent>
                {uniqueCategories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category === "all" ? "Todas as Categorias" : category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
        </div>


        <div className="mt-4 rounded-lg border shadow-sm">
           <div className="overflow-x-auto">
                <Table>
                <TableHeader>
                    <TableRow>
                    <TableHead className="min-w-[150px]">Nome</TableHead>
                    <TableHead className="min-w-[120px]">Código ID</TableHead>
                    <TableHead className="min-w-[150px]">Categoria</TableHead>
                    <TableHead className="min-w-[200px]">
                        <Button variant="ghost" onClick={toggleSortDirection} className="-ml-4">
                           Última Modificação {getSortIcon()}
                        </Button>
                    </TableHead>
                    <TableHead className="text-right sticky right-0 bg-card z-10">Ações</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {processedAssets.length === 0 ? (
                    <TableRow>
                        <TableCell colSpan={5} className="h-24 text-center">
                          {searchTerm || categoryFilter !== 'all' ? 'Nenhum item encontrado.' : 'A lixeira está vazia.'}
                        </TableCell>
                    </TableRow>
                    ) : (
                    processedAssets.map(asset => (
                        <TableRow key={asset.id}>
                        <TableCell className="font-medium whitespace-nowrap">{asset.name}</TableCell>
                        <TableCell>
                            <Badge variant="outline">{asset.codeId}</Badge>
                        </TableCell>
                        <TableCell className="whitespace-nowrap">{asset.categoryName}</TableCell>
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
