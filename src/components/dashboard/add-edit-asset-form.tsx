"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { Asset, Category } from "@/lib/types";
import { addAsset, updateAsset } from "@/lib/mutations";
import { useToast } from "@/hooks/use-toast";
import { useTransition } from "react";
import { Loader2 } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useFirestore, useUser } from "@/firebase";

const assetFormSchema = z.object({
  name: z.string().min(1, { message: "O nome é obrigatório." }),
  codeId: z.string().min(1, { message: "O código ID é obrigatório." }),
  categoryId: z.string().min(1, { message: "A categoria é obrigatória." }),
  city: z.string().min(1, { message: "A cidade/local é obrigatória." }),
  value: z.coerce.number().positive({ message: "O valor deve ser um número positivo." }),
  observation: z.string().optional(),
});

export type AssetFormValues = z.infer<typeof assetFormSchema>;

interface AddEditAssetFormProps {
  asset?: Asset;
  categories: Category[];
  onSubmitSuccess: () => void;
}

export function AddEditAssetForm({ asset, categories, onSubmitSuccess }: AddEditAssetFormProps) {
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();
  const { user } = useUser();
  const firestore = useFirestore();
  
  const form = useForm<AssetFormValues>({
    resolver: zodResolver(assetFormSchema),
    defaultValues: asset ? { ...asset } : {
      name: "",
      codeId: "",
      categoryId: "",
      city: "",
      value: 0,
      observation: "",
    },
  });

  const onSubmit = (data: AssetFormValues) => {
    if (!user || !firestore) {
        toast({ variant: "destructive", title: "Erro de Autenticação", description: "Usuário não encontrado. Por favor, faça login novamente."});
        return;
    }

    startTransition(async () => {
        try {
            if (asset) {
                await updateAsset(firestore, user.uid, user.displayName || "Usuário", asset.id, data);
            } else {
                await addAsset(firestore, user.uid, user.displayName || "Usuário", data);
            }
            const successMessage = asset ? "Item atualizado com sucesso." : "Item adicionado com sucesso.";
            toast({ title: "Sucesso", description: successMessage });
            onSubmitSuccess();
        } catch (error: any) {
            console.error("Error submitting asset form:", error);
            toast({ variant: "destructive", title: "Erro ao Salvar", description: error.message || "Não foi possível salvar o item."});
        }
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nome</FormLabel>
              <FormControl>
                <Input placeholder="Ex: Notebook Dell" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="codeId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Código ID</FormLabel>
                <FormControl>
                  <Input placeholder="Ex: NTB-001" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
           <FormField
            control={form.control}
            name="categoryId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Categoria</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                        <SelectTrigger>
                            <SelectValue placeholder="Selecione uma categoria" />
                        </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                        {categories.map((category) => (
                            <SelectItem key={category.id} value={category.id}>{category.name}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
         <div className="grid grid-cols-2 gap-4">
            <FormField
                control={form.control}
                name="value"
                render={({ field }) => (
                <FormItem>
                    <FormLabel>Valor (R$)</FormLabel>
                    <FormControl>
                    <Input type="number" step="0.01" placeholder="Ex: 4500.00" {...field} />
                    </FormControl>
                    <FormMessage />
                </FormItem>
                )}
            />
            <FormField
            control={form.control}
            name="city"
            render={({ field }) => (
                <FormItem>
                <FormLabel>Cidade/Local</FormLabel>
                <FormControl>
                    <Input placeholder="Ex: São Paulo" {...field} />
                </FormControl>
                <FormMessage />
                </FormItem>
            )}
            />
        </div>
        <FormField
          control={form.control}
          name="observation"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Observação</FormLabel>
              <FormControl>
                <Textarea placeholder="Qualquer informação adicional..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full" disabled={isPending}>
          {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Salvar
        </Button>
      </form>
    </Form>
  );
}
