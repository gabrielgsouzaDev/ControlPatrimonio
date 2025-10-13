import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function SettingsPage() {
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
       <div>
          <h2 className="text-3xl font-headline tracking-tight">Configurações</h2>
          <p className="text-muted-foreground">
            Gerencie as configurações da sua conta e preferências do aplicativo.
          </p>
        </div>
      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Configurações da Conta</CardTitle>
            <CardDescription>
              Atualize as informações do seu perfil.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome</Label>
                <Input id="name" defaultValue="Usuário" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" defaultValue="usuario@email.com" />
              </div>
              <Button type="submit">Salvar Alterações</Button>
            </form>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Tema</CardTitle>
            <CardDescription>
              Escolha a aparência do aplicativo.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="theme">Tema</Label>
                    <Select defaultValue="light">
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Selecione o tema" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="light">Claro</SelectItem>
                            <SelectItem value="dark">Escuro</SelectItem>
                            <SelectItem value="system">Sistema</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                 <Button type="submit">Salvar Tema</Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
