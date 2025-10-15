
'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, Star, FileCode, TrendingUp, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

export default function PropostaPage() {

  const plans = [
    {
      name: "Padrão",
      price: "1.000",
      description: "O essencial para começar a organizar seu patrimônio de forma digital e segura.",
      paymentOptions: [
        "À vista: R$ 1.000,00",
        "3x de R$ 333,33",
        "6x de R$ 166,67"
      ],
      features: [
        { text: "Sistema de Autenticação Completo", included: true },
        { text: "Tela de Gestão de Patrimônio (CRUD)", included: true },
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
        "À vista com 30% OFF: R$ 3.500,00",
        "6x de R$ 833,33",
        "10x de R$ 500,00"
      ],
      features: [
        { text: "Sistema de Autenticação Completo", included: true },
        { text: "Tela de Gestão de Patrimônio (CRUD)", included: true },
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
                  </div>
                )}
                <CardTitle className="text-3xl font-headline">{plan.name}</CardTitle>
                <CardDescription className="px-4">{plan.description}</CardDescription>
              </CardHeader>
              <CardContent className="flex-grow">
                <div className="text-center mb-6">
                  <span className="text-4xl font-bold">R$ {plan.price}</span>
                  <span className="text-muted-foreground"> / projeto</span>
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
                           <li key={opt} className={`font-medium ${opt.includes('OFF') ? 'text-primary' : ''}`}>{opt}</li>
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
                        <p className="text-sm text-muted-foreground">(ou R$ 3.500 à vista)</p>
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
