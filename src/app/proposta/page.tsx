
'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, Star, FileCode, TrendingUp, X, Server, Palette, ShieldCheck, DollarSign, Smartphone, Unplug, PackageCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

export default function PropostaPage() {
  return (
    <div className="bg-background text-foreground min-h-screen p-4 sm:p-8">
      <div className="max-w-4xl mx-auto">
        
        {/* Header */}
        <header className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-headline font-bold text-primary tracking-tight">Proposta de Desenvolvimento</h1>
          <p className="mt-4 text-lg text-muted-foreground max-w-3xl mx-auto">Solução sob medida para gestão de patrimônio, transformando dados em decisões inteligentes.</p>
          <div className="flex justify-center mt-6">
            <Badge variant="secondary" className="text-base font-normal py-2 px-4 border-dashed border-primary/50 bg-primary/10 text-primary">
                <Star className="w-4 h-4 mr-2" />Status: O projeto já está concluído e pronto para apresentação, com possibilidade de ajustes finais.
            </Badge>
          </div>
        </header>
        
        {/* Planos */}
        <section className="space-y-8">
            {/* Plano Padrão */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-2xl font-headline">Plano Padrão</CardTitle>
                    <CardDescription>O essencial para começar a organizar seu patrimônio de forma digital e segura.</CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="text-2xl font-bold mb-4">R$ 1.000,00</p>
                    <h4 className="font-semibold mb-2">Funcionalidades Incluídas:</h4>
                    <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 text-sm text-muted-foreground">
                        <li className="flex items-center gap-2"><Check className="text-green-500 w-4 h-4"/>Sistema de autenticação completo</li>
                        <li className="flex items-center gap-2"><Check className="text-green-500 w-4 h-4"/>Tela de gestão de patrimônio (CRUD)</li>
                        <li className="flex items-center gap-2"><Check className="text-green-500 w-4 h-4"/>Responsividade total (mobile e tablet)</li>
                        <li className="flex items-center gap-2"><Check className="text-green-500 w-4 h-4"/>Painel de controle (dashboard)</li>
                        <li className="flex items-center gap-2"><Check className="text-green-500 w-4 h-4"/>Gráficos e relatórios visuais</li>
                        <li className="flex items-center gap-2"><Check className="text-green-500 w-4 h-4"/>Filtros avançados e busca</li>
                        <li className="flex items-center gap-2"><Check className="text-green-500 w-4 h-4"/>Múltiplas categorias e locais</li>
                        <li className="flex items-center gap-2"><Check className="text-green-500 w-4 h-4"/>Histórico detalhado de alterações</li>
                        <li className="flex items-center gap-2"><Check className="text-green-500 w-4 h-4"/>Exportação para PDF e CSV</li>
                        <li className="flex items-center gap-2"><Check className="text-green-500 w-4 h-4"/>Lixeira (recuperação de itens)</li>
                    </ul>
                    <Separator className="my-4"/>
                    <h4 className="font-semibold mb-2">Formas de Pagamento:</h4>
                     <ul className="text-sm space-y-1">
                        <li>À vista: <span className="font-semibold">R$ 1.000,00</span></li>
                        <li>3x de <span className="font-semibold">R$ 333,33</span></li>
                        <li>6x de <span className="font-semibold">R$ 166,67</span></li>
                    </ul>
                </CardContent>
                 <CardFooter className="bg-muted/30 p-4 rounded-b-lg border-t">
                    <p className="text-sm font-medium"><FileCode className="w-4 h-4 inline-block mr-2"/> <span className="font-bold">Opcional:</span> Código-fonte completo: <span className="font-bold">+ R$ 500,00</span></p>
                </CardFooter>
            </Card>

            {/* Plano Plus */}
            <Card className="border-primary ring-2 ring-primary">
                <CardHeader>
                    <CardTitle className="text-2xl font-headline">Plano Plus</CardTitle>
                    <CardDescription>Solução completa para análise, gestão e auditoria com recursos avançados.</CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="text-2xl font-bold mb-4">A partir de R$ 5.000,00</p>
                    <h4 className="font-semibold mb-2">Funcionalidades Incluídas:</h4>
                    <p className="text-sm text-muted-foreground">Todas as funcionalidades do Plano Padrão, mais a possibilidade de personalizações e integrações avançadas conforme a necessidade.</p>
                    <Separator className="my-4"/>
                    <h4 className="font-semibold mb-2">Formas de Pagamento:</h4>
                    <ul className="text-sm space-y-1">
                        <li className="text-primary font-bold text-base">À vista com 30% OFF: R$ 3.500,00</li>
                        <li>6x de R$ 833,33</li>
                        <li>10x de R$ 500,00</li>
                    </ul>
                </CardContent>
                <CardFooter className="bg-muted/30 p-4 rounded-b-lg border-t">
                    <p className="text-sm font-medium"><FileCode className="w-4 h-4 inline-block mr-2"/> <span className="font-bold">Opcional:</span> Código-fonte completo: <span className="font-bold">+ R$ 1.000,00</span></p>
                </CardFooter>
            </Card>
        </section>
        
        {/* Diferenciais */}
        <section className="mt-16">
            <h2 className="text-3xl font-headline font-bold text-center mb-8">Diferenciais Técnicos e Comerciais</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-3 text-lg"><Server className="text-primary"/>Tecnologia de Ponta</CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm text-muted-foreground">
                       Baseado em Next.js e Firebase, garante desempenho, segurança e escalabilidade, reduzindo custos futuros de manutenção.
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-3 text-lg"><Smartphone className="text-primary"/>Design Responsivo</CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm text-muted-foreground">
                        Experiência otimizada em desktop, tablet e celular, permitindo gestão de ativos de qualquer lugar.
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-3 text-lg"><Palette className="text-primary"/>Interface Profissional</CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm text-muted-foreground">
                       Design intuitivo com componentes de alta qualidade (ShadCN) que reduzem o tempo de treinamento da equipe.
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-3 text-lg"><ShieldCheck className="text-primary"/>Segurança e Auditoria</CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm text-muted-foreground">
                        Controle de acesso e histórico imutável de alterações garantem a integridade dos dados e a conformidade.
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-3 text-lg"><Unplug className="text-primary"/>Autonomia Total</CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm text-muted-foreground">
                        A opção de adquirir o código-fonte transforma o software em um ativo digital próprio, sem dependência de fornecedores.
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-3 text-lg"><TrendingUp className="text-primary"/>Valor de Mercado</CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm text-muted-foreground">
                        Uma solução de nível profissional por um valor de oportunidade único. Projetos similares custam entre R$ 25.000 e R$ 40.000.
                    </CardContent>
                </Card>
            </div>
        </section>

        {/* Entrega e Suporte */}
        <section className="mt-16">
            <h2 className="text-3xl font-headline font-bold text-center mb-8">Entrega e Suporte</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl mx-auto">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">Implantação e Homologação</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-muted-foreground">Após a confirmação do pagamento, o sistema é configurado e apresentado ao cliente para a validação final (homologação).</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">Manutenção Mensal (Opcional)</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-muted-foreground">Inclui suporte técnico, correções de bugs e pequenas atualizações para garantir a estabilidade do sistema.</p>
                        <div className="mt-2 text-sm">
                            <p>Plano Padrão: <span className="font-semibold">R$ 100/mês</span></p>
                            <p>Plano Plus: <span className="font-semibold">R$ 150/mês</span></p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </section>
      </div>
    </div>
  );
}
