
'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, Star, FileCode, TrendingUp, X, Server, Palette, ShieldCheck, DollarSign, Smartphone } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

export default function PropostaPage() {

  const plans = [
    {
      name: "Padrão",
      price: "1.000",
      description: "O essencial para começar a organizar seu patrimônio de forma digital e segura.",
       paymentOptions: [
        "À vista com 10% OFF: R$ 900,00",
        "2x de R$ 475,00 (5% OFF)",
        "4x de R$ 250,00",
      ],
      features: [
        { text: "Sistema de Autenticação Completo", included: true },
        { text: "Tela de Gestão de Patrimônio (CRUD)", included: true },
        { text: "Responsividade (Mobile & Tablet)", included: false },
        { text: "Painel de Controle (Dashboard)", included: false },
        { text: "Gráficos e Relatórios Visuais", included: false },
        { text: "Filtros Avançados e Busca", included: false },
        { text: "Múltiplas Categorias e Locais", included: false },
        { text: "Histórico Detalhado de Alterações", included: false },
        { text: "Exportação para PDF e CSV", included: false },
        { text: "Lixeira (Recuperação de Itens)", included: false },
      ],
      isFeatured: false,
      sourceCodePrice: "500",
    },
    {
      name: "Plus",
      price: "5.000",
      description: "A solução completa para análise, gestão e auditoria do seu inventário com inteligência.",
       paymentOptions: [
        "À vista com 25% OFF: R$ 3.750,00",
        "2x de R$ 2.250,00 (10% OFF)",
        "4x de R$ 1.187,50 (5% OFF)",
        "8x de R$ 625,00",
      ],
      features: [
        { text: "Sistema de Autenticação Completo", included: true },
        { text: "Tela de Gestão de Patrimônio (CRUD)", included: true },
        { text: "Responsividade (Mobile & Tablet)", included: true },
        { text: "Painel de Controle (Dashboard)", included: true },
        { text: "Gráficos e Relatórios Visuais", included: true },
        { text: "Filtros Avançados e Busca", included: true },
        { text: "Múltiplas Categorias e Locais", included: true },
        { text: "Histórico Detalhado de Alterações", included: true },
        { text: "Exportação para PDF e CSV", included: true },
        { text: "Lixeira (Recuperação de Itens)", included: true },
      ],
      isFeatured: true,
      sourceCodePrice: "1.000",
    }
  ];

  return (
    <div className="bg-background text-foreground min-h-screen p-4 sm:p-8">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <header className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-headline font-bold text-primary tracking-tight">Proposta de Desenvolvimento</h1>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">Uma solução sob medida para a gestão de patrimônio, transformando dados em decisões inteligentes.</p>
        </header>

        {/* Pricing Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          {plans.map((plan) => (
            <Card key={plan.name} className={`flex flex-col h-full ${plan.isFeatured ? 'border-primary ring-2 ring-primary shadow-lg' : ''}`}>
              <CardHeader className="text-center pb-4">
                {plan.isFeatured && (
                   <div className="flex justify-center">
                    <Badge variant="default" className="text-sm mb-2">Recomendado</Badge>
                   </div>
                )}
                <CardTitle className="text-3xl font-headline">{plan.name}</CardTitle>
                <CardDescription className="px-4">{plan.description}</CardDescription>
              </CardHeader>
              <CardContent className="flex-grow">
                <div className="text-center mb-6">
                  <span className="text-muted-foreground">A partir de</span>
                  <p className="text-4xl font-bold">R$ {plan.price}</p>
                </div>
                <Separator />
                <div className="my-6">
                  <h4 className="font-semibold mb-4 text-center">Funcionalidades Incluídas:</h4>
                  <ul className="space-y-3 text-sm">
                    {plan.features.map((feature) => (
                      <li key={feature.text} className="flex items-start">
                        {feature.included ? 
                          <Check className="w-4 h-4 mr-3 mt-0.5 text-green-500 shrink-0" /> :
                          <X className="w-4 h-4 mr-3 mt-0.5 text-destructive shrink-0" />
                        }
                        <span className={!feature.included ? 'text-muted-foreground line-through' : ''}>
                          {feature.text}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
                <Separator />
                 <div className="my-6">
                    <h4 className="font-semibold mb-4 text-center">Opções de Pagamento:</h4>
                    <ul className="space-y-2 text-sm text-center">
                        {plan.paymentOptions.map(opt => (
                           <li key={opt} className={`font-medium ${opt.includes('25% OFF') || opt.includes('10% OFF') ? 'text-primary' : ''} ${opt.includes('25% OFF') ? 'text-base font-bold' : ''}`}>{opt}</li>
                        ))}
                    </ul>
                </div>
              </CardContent>
              <CardFooter className="flex-col gap-4">
                 <div className="w-full bg-muted/50 p-4 rounded-lg text-center">
                    <div className="flex items-center justify-center gap-2">
                        <FileCode className="w-5 h-5 text-primary"/>
                        <h5 className="font-semibold">Opcional: Código-Fonte</h5>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">Receba o projeto completo para hospedar e modificar por conta própria.</p>
                    <p className="text-lg font-bold mt-2">+ R$ {plan.sourceCodePrice},00</p>
                </div>
                <Button className="w-full" variant={plan.isFeatured ? 'default' : 'outline'}>
                  Selecionar Plano {plan.name}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
        
        {/* Value Proposition Section */}
        <section className="mt-16 text-center">
          <h2 className="text-3xl font-headline font-bold mb-8">O que torna este projeto valioso?</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-left">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-3"><Server className="text-primary"/>Tecnologia de Ponta</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                Construído com Next.js e Firebase, o sistema é rápido, seguro e escalável, utilizando a mesma infraestrutura de gigantes da tecnologia, o que reduz custos futuros de manutenção.
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-3"><Smartphone className="text-primary"/>Design Responsivo</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                A gestão não fica presa ao escritório. O sistema se adapta a desktops, tablets e celulares, permitindo que sua equipe atualize o inventário em campo, no estoque ou em qualquer lugar.
              </CardContent>
            </Card>
             <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-3"><Palette className="text-primary"/>Design Profissional</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                Interface intuitiva e agradável que reduz o tempo de treinamento da equipe. Um sistema fácil de usar é um sistema que é, de fato, usado.
              </CardContent>
            </Card>
             <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-3"><ShieldCheck className="text-primary"/>Segurança e Auditoria</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                Controle de acesso, regras de segurança e um histórico imutável de alterações garantem a integridade dos seus dados, essencial para a conformidade e gestão de responsabilidades.
              </CardContent>
            </Card>
             <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-3"><DollarSign className="text-primary"/>Ferramenta de Negócio</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                Este não é só um software, é uma solução que gera valor real: organização, redução de perdas por descontrole de ativos e dados centralizados para decisões estratégicas mais rápidas.
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Market Value Section */}
        <section className="mt-16">
            <Card className="bg-muted/30 border-dashed">
                <CardHeader className="text-center">
                    <div className="flex items-center justify-center gap-2 text-primary">
                        <TrendingUp className="w-6 h-6" />
                        <CardTitle className="text-2xl">Posicionamento de Mercado</CardTitle>
                    </div>
                    <CardDescription>Para referência, veja o custo estimado para um projeto similar no mercado de São Paulo/SP.</CardDescription>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6 text-center">
                    <div className="bg-background/50 p-4 rounded-lg border">
                        <h4 className="font-semibold text-lg">Seu Preço (Plano Plus)</h4>
                        <p className="text-3xl font-bold text-green-600 mt-2">R$ 5.000</p>
                        <p className="text-sm text-muted-foreground">(ou R$ 3.750 à vista com 25% OFF)</p>
                    </div>
                    <div className="bg-background/50 p-4 rounded-lg border">
                        <h4 className="font-semibold text-lg">Estimativa de Mercado</h4>
                        <p className="text-3xl font-bold text-primary/80 mt-2">R$ 25.000 - R$ 40.000</p>
                        <p className="text-sm text-muted-foreground">(Contratando Freelancer Pleno/Sênior)</p>
                    </div>
                </CardContent>
                <CardFooter>
                    <p className="text-xs text-muted-foreground text-center w-full">Esta proposta oferece um valor excepcional como parte do início de nossa parceria, entregando qualidade de mercado a um custo de oportunidade único.</p>
                </CardFooter>
            </Card>
        </section>

        {/* Next Steps Section */}
        <section className="mt-16">
          <h2 className="text-3xl font-headline font-bold text-center mb-8">Próximos Passos e Termos</h2>
          <div className="max-w-3xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-card border rounded-lg p-6">
                <h4 className="font-semibold text-lg">Início do Projeto</h4>
                <p className="text-muted-foreground mt-2 text-sm">Para dar início ao desenvolvimento, é necessário o pagamento da primeira parcela (no caso de parcelamento) ou o pagamento integral (no caso de opção à vista).</p>
            </div>
             <div className="bg-card border rounded-lg p-6">
                <h4 className="font-semibold text-lg">Manutenção Mensal (Opcional)</h4>
                <p className="text-muted-foreground mt-2 text-sm">Garanta que seu sistema esteja sempre atualizado e funcionando. O plano inclui correções de bugs, suporte técnico e pequenas atualizações.</p>
                 <div className="mt-3">
                    <p><span className="font-semibold">Padrão:</span> R$ 100,00 / mês</p>
                    <p><span className="font-semibold">Plus:</span> R$ 150,00 / mês</p>
                 </div>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
}
