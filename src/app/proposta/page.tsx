
'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, X, Star, FileCode, TrendingUp, Server, Palette, ShieldCheck, DollarSign, Smartphone, Unplug, PackageCheck, Briefcase, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

export default function PropostaPage() {
  return (
    <div className="bg-background text-foreground min-h-screen p-4 sm:p-8">
      <div className="max-w-6xl mx-auto">
        
        <header className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-headline font-bold text-primary tracking-tight">Proposta de Desenvolvimento</h1>
          <p className="mt-4 text-lg text-muted-foreground max-w-3xl mx-auto">Solução sob medida para gestão de patrimônio, transformando dados em decisões inteligentes.</p>
          <div className="flex justify-center mt-6">
             <Badge variant="secondary" className="border-dashed border-primary/50 bg-primary/10 text-primary text-base font-normal py-2 px-4">
                <Star className="w-4 h-4 mr-2" />
                O projeto já está concluído e pronto para apresentação.
            </Badge>
          </div>
        </header>
        
        <section className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
            <Card>
                <CardHeader>
                    <CardTitle className="text-2xl font-headline">Plano Padrão</CardTitle>
                    <CardDescription>O essencial para começar a organizar seu patrimônio de forma digital e segura.</CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="text-2xl font-bold mb-4">R$ 1.000,00</p>
                    <h4 className="font-semibold mb-3">Funcionalidades:</h4>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                        <li className="flex items-center gap-2"><Check className="text-green-500 w-4 h-4"/>Sistema de autenticação</li>
                        <li className="flex items-center gap-2"><Check className="text-green-500 w-4 h-4"/>Tela de gestão de patrimônio (CRUD)</li>
                        <li className="flex items-center gap-2"><X className="text-destructive w-4 h-4"/>Responsividade (Mobile e Tablet)</li>
                        <li className="flex items-center gap-2"><X className="text-destructive w-4 h-4"/>Painel de controle (dashboard)</li>
                        <li className="flex items-center gap-2"><X className="text-destructive w-4 h-4"/>Gráficos e relatórios visuais</li>
                        <li className="flex items-center gap-2"><X className="text-destructive w-4 h-4"/>Filtros e busca</li>
                        <li className="flex items-center gap-2"><X className="text-destructive w-4 h-4"/>Gestão de Categorias e Locais</li>
                        <li className="flex items-center gap-2"><X className="text-destructive w-4 h-4"/>Histórico detalhado de alterações</li>
                        <li className="flex items-center gap-2"><X className="text-destructive w-4 h-4"/>Exportação para PDF e CSV</li>
                        <li className="flex items-center gap-2"><X className="text-destructive w-4 h-4"/>Lixeira (recuperação de itens)</li>
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
                    <p className="text-sm font-medium"><FileCode className="w-4 h-4 inline-block mr-2"/> <span className="font-bold">Opcional:</span> Código-fonte: <span className="font-bold">+ R$ 500,00</span></p>
                </CardFooter>
            </Card>

            <Card className="border-primary ring-2 ring-primary">
                <CardHeader>
                    <CardTitle className="text-2xl font-headline">Plano Plus</CardTitle>
                    <CardDescription>Solução completa para análise, gestão e auditoria com recursos avançados.</CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="text-2xl font-bold mb-4">A partir de R$ 5.000,00</p>
                    <h4 className="font-semibold mb-3">Funcionalidades Incluídas:</h4>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                        <li className="flex items-center gap-2"><Check className="text-primary w-4 h-4"/>Sistema de autenticação</li>
                        <li className="flex items-center gap-2"><Check className="text-primary w-4 h-4"/>Tela de gestão de patrimônio (CRUD)</li>
                        <li className="flex items-center gap-2"><Check className="text-primary w-4 h-4"/>Responsividade (Mobile e Tablet)</li>
                        <li className="flex items-center gap-2"><Check className="text-primary w-4 h-4"/>Painel de controle (dashboard)</li>
                        <li className="flex items-center gap-2"><Check className="text-primary w-4 h-4"/>Gráficos e relatórios visuais</li>
                        <li className="flex items-center gap-2"><Check className="text-primary w-4 h-4"/>Filtros e busca</li>
                        <li className="flex items-center gap-2"><Check className="text-primary w-4 h-4"/>Gestão de Categorias e Locais</li>
                        <li className="flex items-center gap-2"><Check className="text-primary w-4 h-4"/>Histórico detalhado de alterações</li>
                        <li className="flex items-center gap-2"><Check className="text-primary w-4 h-4"/>Exportação para PDF e CSV</li>
                        <li className="flex items-center gap-2"><Check className="text-primary w-4 h-4"/>Lixeira (recuperação de itens)</li>
                    </ul>
                    <Separator className="my-4"/>
                    <h4 className="font-semibold mb-2">Formas de Pagamento:</h4>
                    <ul className="text-sm space-y-1">
                        <li className="text-primary font-bold text-base">À vista com 25% OFF: R$ 3.750,00</li>
                        <li>6x de R$ 833,33</li>
                        <li>10x de R$ 500,00</li>
                    </ul>
                </CardContent>
                <CardFooter className="bg-muted/30 p-4 rounded-b-lg border-t">
                    <p className="text-sm font-medium"><FileCode className="w-4 h-4 inline-block mr-2"/> <span className="font-bold">Opcional:</span> Código-fonte: <span className="font-bold">+ R$ 1.000,00</span></p>
                </CardFooter>
            </Card>
        </section>

        <section className="mt-16 text-center">
            <h2 className="text-3xl font-headline font-bold text-center mb-2">Análise de Investimento: Projeto Pronto vs. Contratação</h2>
            <p className="text-center text-muted-foreground mb-8 max-w-3xl mx-auto">
                Compare o custo de adquirir esta solução completa e testada com o custo de desenvolver um projeto similar internamente.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-0 max-w-4xl mx-auto bg-muted/30 rounded-lg border shadow-sm overflow-hidden">
                <div className="p-6 text-left">
                    <CardTitle className="flex items-center gap-3 text-lg mb-2"><PackageCheck className="text-primary"/>Seu Investimento (Plano Plus)</CardTitle>
                    <p className="text-sm text-muted-foreground mb-4">Valor para adquirir o projeto pronto e validado.</p>
                    <p className="text-4xl font-bold text-primary mb-4">R$ 3.750,00 <span className="text-base font-normal text-muted-foreground">(à vista)</span></p>
                    <ul className="space-y-2 text-sm">
                        <li className="flex items-start gap-2"><Check className="text-primary w-4 h-4 mt-0.5 shrink-0"/><div><span className="font-semibold">Entrega Imediata:</span> Sistema pronto para implantação e uso.</div></li>
                        <li className="flex items-start gap-2"><Check className="text-primary w-4 h-4 mt-0.5 shrink-0"/><div><span className="font-semibold">Escopo Definido:</span> Todas as funcionalidades já estão desenvolvidas e testadas.</div></li>
                        <li className="flex items-start gap-2"><Check className="text-primary w-4 h-4 mt-0.5 shrink-0"/><div><span className="font-semibold">Risco Zero:</span> Sem custos ocultos ou atrasos de desenvolvimento.</div></li>
                    </ul>
                </div>
                <div className="p-6 bg-card text-left border-l">
                     <CardTitle className="flex items-center gap-3 text-lg mb-2"><Briefcase className="text-destructive"/>Custo de Desenvolvimento (Equipe Interna)</CardTitle>
                    <p className="text-sm text-muted-foreground mb-4">Estimativa para contratar 1 dev. Sênior em SP (CLT).</p>
                    <p className="text-4xl font-bold text-destructive mb-4">~R$ 38.000,00</p>
                    <ul className="space-y-2 text-sm">
                        <li className="flex items-start gap-2"><Clock className="text-destructive w-4 h-4 mt-0.5 shrink-0"/><div><span className="font-semibold">Tempo de Projeto:</span> Mínimo de 2-3 meses para desenvolvimento e testes.</div></li>
                        <li className="flex items-start gap-2"><DollarSign className="text-destructive w-4 h-4 mt-0.5 shrink-0"/><div><span className="font-semibold">Custo Mensal:</span> Salário (R$12k) + Encargos (~70%) = <span className="font-bold">~R$ 19.000/mês</span>.</div></li>
                        <li className="flex items-start gap-2"><X className="text-destructive w-4 h-4 mt-0.5 shrink-0"/><div><span className="font-semibold">Riscos Associados:</span> Custos de recrutamento, gestão de projeto e possíveis atrasos.</div></li>
                    </ul>
                </div>
            </div>
             <div className="max-w-4xl mx-auto mt-4 p-4 bg-primary/10 border border-primary/20 rounded-lg text-primary-foreground">
                <p className="font-semibold text-center text-primary">Conclusão: Adquirir o projeto pronto representa uma economia de mais de 90% em comparação com o desenvolvimento interno, além de eliminar o tempo e o risco associados.</p>
            </div>
        </section>

        <section className="mt-16">
            <h2 className="text-3xl font-headline font-bold text-center mb-8">O que torna este projeto valioso?</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-3 text-lg"><Server className="text-primary"/>Tecnologia de Ponta</CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm text-muted-foreground">
                        Construído com Next.js e Firebase, o sistema oferece desempenho, atualizações em tempo real e dispensa servidores tradicionais, reduzindo custos de hospedagem e manutenção.
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-3 text-lg"><Palette className="text-primary"/>Interface Profissional</CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm text-muted-foreground">
                       A usabilidade intuitiva e os componentes de alta qualidade (ShadCN) reduzem a curva de aprendizado, economizando tempo de treinamento e aumentando a adesão da equipe.
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-3 text-lg"><Smartphone className="text-primary"/>Gestão de Qualquer Lugar</CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm text-muted-foreground">
                       O design responsivo permite gerenciar, auditar e visualizar o patrimônio de qualquer dispositivo — computador, tablet ou celular —, garantindo agilidade para a equipe.
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-3 text-lg"><ShieldCheck className="text-primary"/>Segurança e Auditoria</CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm text-muted-foreground">
                        Controle de acesso e um histórico de alterações imutável garantem a integridade dos dados, fornecendo uma trilha de auditoria completa para conformidade e gestão.
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-3 text-lg"><Unplug className="text-primary"/>Propriedade e Autonomia</CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm text-muted-foreground">
                        Diferente de um SaaS, a opção de adquirir o código-fonte transforma o software em um ativo digital da sua empresa, garantindo liberdade total para futuras customizações.
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-3 text-lg"><TrendingUp className="text-primary"/>Escalabilidade Futura</CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm text-muted-foreground">
                       A base de código moderna e a arquitetura em nuvem permitem que o sistema cresça junto com a empresa, facilitando a adição de novas funcionalidades no futuro.
                    </CardContent>
                </Card>
            </div>
        </section>
        
        <section className="mt-16">
            <h2 className="text-3xl font-headline font-bold text-center mb-8">Entrega e Próximos Passos</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                <Card>
                    <CardHeader>
                         <CardTitle className="flex items-center gap-3 text-lg"><PackageCheck className="text-primary"/>Implantação e Homologação</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-muted-foreground">Para dar início à implantação, é necessário o pagamento da primeira parcela ou o valor à vista. Após a confirmação, o sistema é configurado e apresentado para a validação final (homologação).</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-3 text-lg"><DollarSign className="text-primary"/>Manutenção Mensal (Opcional)</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-muted-foreground">Inclui suporte técnico, correções de bugs e pequenas atualizações para garantir a estabilidade e a segurança contínua do sistema.</p>
                        <div className="mt-2 text-sm space-y-1">
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

    