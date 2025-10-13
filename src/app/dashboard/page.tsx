'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, LineChart, PieChart, Building2, Landmark, DollarSign } from 'lucide-react';
import {
  Bar,
  BarChart as RechartsBarChart,
  Line,
  LineChart as RechartsLineChart,
  Pie,
  PieChart as RechartsPieChart,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { ChartContainer, ChartTooltipContent } from '@/components/ui/chart';

const barChartData = [
  { city: 'São Paulo', value: 32100 },
  { city: 'Rio de Janeiro', value: 30700 },
  { city: 'Belo Horizonte', value: 2500 },
  { city: 'Curitiba', value: 18200 },
];

const lineChartData = [
    { month: 'Jan', value: 20000 },
    { month: 'Fev', value: 25000 },
    { month: 'Mar', value: 22000 },
    { month: 'Abr', value: 30000 },
    { month: 'Mai', value: 35000 },
    { month: 'Jun', value: 45000 },
];

const pieChartData = [
  { category: 'Eletrônicos', value: 46200 },
  { category: 'Mobiliário', value: 2300 },
  { category: 'Servidores', value: 25000 },
  { category: 'Outros', value: 2500 },
];

const COLORS = ['hsl(var(--chart-1))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))', 'hsl(var(--chart-4))'];

export default function DashboardPage() {
  const totalAssets = 10;
  const totalValue = 83700;
  const totalCities = 4;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };
  
  return (
    <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
      <h2 className="text-3xl font-headline tracking-tight">Dashboard</h2>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Itens</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalAssets}</div>
            <p className="text-xs text-muted-foreground">Itens cadastrados no sistema.</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Valor Total do Patrimônio</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalValue)}</div>
            <p className="text-xs text-muted-foreground">Soma dos valores de todos os itens.</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Cidades</CardTitle>
            <Landmark className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalCities}</div>
            <p className="text-xs text-muted-foreground">Cidades com patrimônio alocado.</p>
          </CardContent>
        </Card>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="lg:col-span-4">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
                <BarChart /> Valor por Cidade
            </CardTitle>
          </CardHeader>
          <CardContent className="pl-2">
             <ChartContainer config={{
                value: {
                    label: "Valor",
                    color: "hsl(var(--chart-1))",
                },
             }} className="h-[350px] w-full">
              <ResponsiveContainer>
                <RechartsBarChart data={barChartData}>
                  <XAxis dataKey="city" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `R$${Number(value) / 1000}k`} />
                  <Tooltip cursor={false} content={<ChartTooltipContent indicator="dot" />} />
                  <Bar dataKey="value" fill="hsl(var(--chart-1))" radius={[4, 4, 0, 0]} />
                </RechartsBarChart>
              </ResponsiveContainer>
             </ChartContainer>
          </CardContent>
        </Card>
         <Card className="lg:col-span-3">
           <CardHeader>
            <CardTitle className="flex items-center gap-2">
                <PieChart /> Distribuição por Categoria
            </CardTitle>
          </CardHeader>
          <CardContent>
             <ChartContainer config={{
                value: { label: "Valor" },
                eletronicos: { label: "Eletrônicos", color: "hsl(var(--chart-1))" },
                mobiliario: { label: "Mobiliário", color: "hsl(var(--chart-2))" },
                servidores: { label: "Servidores", color: "hsl(var(--chart-3))" },
                outros: { label: "Outros", color: "hsl(var(--chart-4))" },
             }} className="h-[350px] w-full">
                <ResponsiveContainer>
                    <RechartsPieChart>
                    <Tooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
                    <Pie data={pieChartData} dataKey="value" nameKey="category" cx="50%" cy="50%" innerRadius={60} outerRadius={80} labelLine={false} label={({
                        percent,
                      }) => `${(percent * 100).toFixed(0)}%`}>
                        {pieChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                    </Pie>
                    <Legend/>
                    </RechartsPieChart>
                </ResponsiveContainer>
             </ChartContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
