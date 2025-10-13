"use client";

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
import { addCategory, updateCategory, deleteCategory } from "@/lib/actions";
import type { Category } from "@/lib/types";
import { Loader2, Plus, Trash2, Edit, Save, X } from "lucide-react";

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

  React.useEffect(() => {
    setCategories(initialCategories);
  }, [initialCategories]);

  const handleAddCategory = () => {
    if (!newCategoryName.trim()) {
      toast({ variant: "destructive", title: "Erro", description: "O nome da categoria não pode estar vazio." });
      return;
    }
    startTransition(async () => {
      try {
        await addCategory(newCategoryName);
        setNewCategoryName("");
        onCategoriesChange();
        toast({ title: "Sucesso", description: "Categoria adicionada." });
      } catch (error: any) {
        toast({ variant: "destructive", title: "Erro", description: error.message });
      }
    });
  };

  const handleUpdateCategory = (id: string) => {
    if (!editingCategoryName.trim()) {
      toast({ variant: "destructive", title: "Erro", description: "O nome da categoria não pode estar vazio." });
      return;
    }
    startTransition(async () => {
      try {
        await updateCategory(id, editingCategoryName);
        setEditingCategoryId(null);
        setEditingCategoryName("");
        onCategoriesChange();
        toast({ title: "Sucesso", description: "Categoria atualizada." });
      } catch (error: any) {
        toast({ variant: "destructive", title: "Erro", description: error.message });
      }
    });
  };
  
  const handleDeleteCategory = (id: string) => {
    startTransition(async () => {
        try {
            await deleteCategory(id);
            onCategoriesChange();
            toast({ title: "Sucesso", description: "Categoria excluída." });
        } catch (error: any) {
            toast({ variant: "destructive", title: "Erro", description: error.message });
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
                <Button onClick={handleAddCategory} disabled={isPending} size="icon">
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
                                    <Button size="icon" variant="ghost" onClick={() => handleUpdateCategory(category.id)} disabled={isPending}>
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
