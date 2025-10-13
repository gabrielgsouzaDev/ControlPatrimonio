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
import type { Location } from "@/lib/types";
import { Loader2, Plus, Trash2, Edit, Save, X } from "lucide-react";
import { useFirestore, useUser } from "@/firebase";
import { collection, addDoc, serverTimestamp, doc, updateDoc, writeBatch, query, where, getDocs } from "firebase/firestore";

interface ManageLocationsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  locations: Location[];
  onLocationsChange: () => void;
}

export function ManageLocationsDialog({ open, onOpenChange, locations: initialLocations, onLocationsChange }: ManageLocationsDialogProps) {
  const [isPending, startTransition] = useTransition();
  const [locations, setLocations] = useState(initialLocations);
  const [newLocationName, setNewLocationName] = useState("");
  const [editingLocationId, setEditingLocationId] = useState<string | null>(null);
  const [editingLocationName, setEditingLocationName] = useState("");
  const { toast } = useToast();
  const firestore = useFirestore();
  const { user } = useUser();

  React.useEffect(() => {
    setLocations(initialLocations);
  }, [initialLocations]);

  const handleAddLocation = () => {
    if (!user || !firestore) return;
    if (!newLocationName.trim()) {
      toast({ variant: "destructive", title: "Erro", description: "O nome do local não pode estar vazio." });
      return;
    }
    startTransition(async () => {
      try {
        const locationsRef = collection(firestore, 'locations');
        await addDoc(locationsRef, { name: newLocationName, userId: user.uid, createdAt: serverTimestamp() });
        setNewLocationName("");
        onLocationsChange();
        toast({ title: "Sucesso", description: "Local adicionado." });
      } catch (error: any) {
        toast({ variant: "destructive", title: "Erro", description: "Não foi possível adicionar o local." });
      }
    });
  };

  const handleUpdateLocation = (id: string) => {
    if (!user || !firestore) return;
    if (!editingLocationName.trim()) {
      toast({ variant: "destructive", title: "Erro", description: "O nome do local não pode estar vazio." });
      return;
    }
    startTransition(async () => {
      try {
        const locationRef = doc(firestore, 'locations', id);
        await updateDoc(locationRef, { name: editingLocationName, userId: user.uid });
        setEditingLocationId(null);
        setEditingLocationName("");
        onLocationsChange();
        toast({ title: "Sucesso", description: "Local atualizado." });
      } catch (error: any) {
        toast({ variant: "destructive", title: "Erro", description: "Não foi possível atualizar o local." });
      }
    });
  };
  
  const handleDeleteLocation = (id: string) => {
    if (!user || !firestore) return;
    startTransition(async () => {
        try {
            const batch = writeBatch(firestore);
            
            const assetsRef = collection(firestore, 'assets');
            const q = query(assetsRef, where("city", "==", id));
            const querySnapshot = await getDocs(q);
            querySnapshot.forEach((doc) => {
              batch.update(doc.ref, { city: "" });
            });

            const locationRef = doc(firestore, 'locations', id);
            batch.delete(locationRef);

            await batch.commit();

            onLocationsChange();
            toast({ title: "Sucesso", description: "Local excluído e itens desvinculados." });
        } catch (error: any) {
            console.error(error);
            toast({ variant: "destructive", title: "Erro", description: "Não foi possível excluir o local." });
        }
    });
  };

  const startEditing = (location: Location) => {
    setEditingLocationId(location.id);
    setEditingLocationName(location.name);
  };

  const cancelEditing = () => {
    setEditingLocationId(null);
    setEditingLocationName("");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Gerenciar Locais</DialogTitle>
          <DialogDescription>
            Adicione, edite ou remova os locais (cidades) dos itens.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
            <div className="flex items-center space-x-2">
                <Input
                    placeholder="Novo local..."
                    value={newLocationName}
                    onChange={(e) => setNewLocationName(e.target.value)}
                    disabled={isPending}
                    onKeyDown={(e) => e.key === 'Enter' && handleAddLocation()}
                />
                <Button onClick={handleAddLocation} disabled={isPending || !newLocationName.trim()} size="icon">
                    {isPending && !editingLocationId ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                </Button>
            </div>
            <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
                {locations.map((location) => (
                    <div key={location.id} className="flex items-center justify-between p-2 rounded-md bg-muted/50">
                        {editingLocationId === location.id ? (
                            <Input
                                value={editingLocationName}
                                onChange={(e) => setEditingLocationName(e.target.value)}
                                disabled={isPending}
                                className="h-8"
                                autoFocus
                                onKeyDown={(e) => e.key === 'Enter' && handleUpdateLocation(location.id)}
                            />
                        ) : (
                            <span className="text-sm font-medium">{location.name}</span>
                        )}
                        <div className="flex items-center space-x-1">
                            {editingLocationId === location.id ? (
                                <>
                                    <Button size="icon" variant="ghost" onClick={() => handleUpdateLocation(location.id)} disabled={isPending || !editingLocationName.trim()}>
                                        <Save className="h-4 w-4" />
                                    </Button>
                                    <Button size="icon" variant="ghost" onClick={cancelEditing} disabled={isPending}>
                                        <X className="h-4 w-4" />
                                    </Button>
                                </>
                            ) : (
                                <>
                                    <Button size="icon" variant="ghost" onClick={() => startEditing(location)} disabled={isPending}>
                                        <Edit className="h-4 w-4" />
                                    </Button>
                                    <Button size="icon" variant="ghost" onClick={() => handleDeleteLocation(location.id)} disabled={isPending}>
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
