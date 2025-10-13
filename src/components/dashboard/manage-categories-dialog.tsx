"use client";

import * as React from "react";
import { useState, useTransition } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import type { Category } from "@/lib/types";
import { Loader2, Plus, Trash2, Edit, Save, X } from "lucide-react";
import { useFirestore, useUser } from "@/firebase";
import { collection, addDoc, serverTimestamp, doc, updateDoc, deleteDoc, writeBatch, query, where, getDocs } from "firebase/firestore";

interface ManageCategoriesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  categories: Category[];
  onCategoriesChange: () => void;
}

export function ManageCategoriesDialog({ open, onOpenChange, categories: initialCategories, onCategoriesChange }: ManageCategoriesDialogProps) {
  const [isPending, startTransition] = useTransition();
  const [categories, setCategories] = useState(initialCategories);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
  const [editingCategoryName, setEditingCategoryName] = useState("");
  const { toast } = useToast();
  const firestore = useFirestore();
  const { user } = useUser();

  React.useEffect(() => {
    setCategories(initialCategories);
  }, [initialCategories]);

  const handleAddCategory = () => {
    if (!user || !firestore) return;
    if (!newCategoryName.trim()) {
      toast({ variant: "destructive", title: "Erro", description: "O nome da categoria não pode estar vazio." });
      return;
    }
    startTransition(async () => {
      try {
        const categoriesRef = collection(firestore, 'users', user.uid, 'categories');
        await addDoc(categoriesRef, { name: newCategoryName, userId: user.uid, createdAt: serverTimestamp() });
        setNewCategoryName("");
        onCategoriesChange();
        toast({ title: "Sucesso", description: "Categoria adicionada." });
      } catch (error: any) {
        toast({ variant: "destructive", title: "Erro", description: "Não foi possível adicionar a categoria." });
      }
    });
  };

  const handleUpdateCategory = (id: string) => {
    if (!user || !firestore) return;
    if (!editingCategoryName.trim()) {
      toast({ variant: "destructive", title: "Erro", description: "O nome da categoria não pode estar vazio." });
      return;
    }
    startTransition(async () => {
      try {
        const categoryRef = doc(firestore, 'users', user.uid, 'categories', id);
        await updateDoc(categoryRef, { name: editingCategoryName });
        setEditingCategoryId(null);
        setEditingCategoryName("");
        onCategoriesChange();
        toast({ title: "Sucesso", description: "Categoria atualizada." });
      } catch (error: any) {
        toast({ variant: "destructive", title: "Erro", description: "Não foi possível atualizar a categoria." });
      }
    });
  };
  
  const handleDeleteCategory = (id: string) => {
    if (!user || !firestore) return;
    startTransition(async () => {
        try {
            const batch = writeBatch(firestore);
            
            // 1. Unlink assets from the category
            const assetsRef = collection(firestore, 'users', user.uid, 'assets');
            const q = query(assetsRef, where("categoryId", "==", id));
            const querySnapshot = await getDocs(q);
            querySnapshot.forEach((doc) => {
              batch.update(doc.ref, { categoryId: "" }); // or set to null/undefined
            });

            // 2. Delete the category
            const categoryRef = doc(firestore, 'users', user.uid, 'categories', id);
            batch.delete(categoryRef);

            await batch.commit();

            onCategoriesChange();
            toast({ title: "Sucesso", description: "Categoria excluída e itens desvinculados." });
        } catch (error: any) {
            console.error(error);
            toast({ variant: "destructive", title: "Erro", description: "Não foi possível excluir a categoria." });
        }
    });
  };

  const startEditing = (category: Category) => {
    setEditingCategoryId(category.id);
    setEditingCategoryName(category.name);
  };

  const cancelEditing = () => {
    setEditingCategoryId(null);
    setEditingCategoryName("");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Gerenciar Categorias</DialogTitle>
          <DialogDescription>
            Adicione, edite ou remova as categorias de itens.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
            <div className="flex items-center space-x-2">
                <Input
                    placeholder="Nova categoria..."
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    disabled={isPending}
                    onKeyDown={(e) => e.key === 'Enter' && handleAddCategory()}
                />
                <Button onClick={handleAddCategory} disabled={isPending || !newCategoryName.trim()} size="icon">
                    {isPending && !editingCategoryId ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                </Button>
            </div>
            <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
                {categories.map((category) => (
                    <div key={category.id} className="flex items-center justify-between p-2 rounded-md bg-muted/50">
                        {editingCategoryId === category.id ? (
                            <Input
                                value={editingCategoryName}
                                onChange={(e) => setEditingCategoryName(e.target.value)}
                                disabled={isPending}
                                className="h-8"
                                autoFocus
                                onKeyDown={(e) => e.key === 'Enter' && handleUpdateCategory(category.id)}
                            />
                        ) : (
                            <span className="text-sm font-medium">{category.name}</span>
                        )}
                        <div className="flex items-center space-x-1">
                            {editingCategoryId === category.id ? (
                                <>
                                    <Button size="icon" variant="ghost" onClick={() => handleUpdateCategory(category.id)} disabled={isPending || !editingCategoryName.trim()}>
                                        <Save className="h-4 w-4" />
                                    </Button>
                                    <Button size="icon" variant="ghost" onClick={cancelEditing} disabled={isPending}>
                                        <X className="h-4 w-4" />
                                    </Button>
                                </>
                            ) : (
                                <>
                                    <Button size="icon" variant="ghost" onClick={() => startEditing(category)} disabled={isPending}>
                                        <Edit className="h-4 w-4" />
                                    </Button>
                                    <Button size="icon" variant="ghost" onClick={() => handleDeleteCategory(category.id)} disabled={isPending}>
                                        <Trash2 className="h-4 w-4 text-destructive" />
                                    </Button>
                                </>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
        <DialogFooter>
            <Button variant="outline" onClick={() => onOpenChange(false)}>Fechar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
