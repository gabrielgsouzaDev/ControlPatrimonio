'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, PieChart, Building2, Landmark, DollarSign, Loader2 } from 'lucide-react';
import {
  Bar,
  BarChart as RechartsBarChart,
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
import { useCollection, useFirestore, useMemoFirebase, useUser } from '@/firebase';
import { collection } from 'firebase/firestore';
import type { Asset, Category } from '@/lib/types';
import { useMemo } from 'react';

const COLORS = ['hsl(var(--chart-1))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))', 'hsl(var(--chart-4))'];

export default function DashboardPage() {
  const { user } = useUser();
  const firestore = useFirestore();

  const assetsQuery = useMemoFirebase(() => (user && firestore ? collection(firestore, 'users', user.uid, 'assets') : null), [firestore, user]);
  const categoriesQuery = useMemoFirebase(() => (user && firestore ? collection(firestore, 'users', user.uid, 'categories') : null), [firestore, user]);

  const { data: assets, isLoading: isLoadingAssets } = useCollection<Asset>(assetsQuery);
  const { data: categories, isLoading: isLoadingCategories } = useCollection<Category>(categoriesQuery);

  const dashboardData = useMemo(() => {
    if (!assets || !categories) {
      return {
        totalAssets: 0,
        totalValue: 0,
        totalCities: 0,
        barChartData: [],
        pieChartData: [],
      };
    }

    const totalAssets = assets.length;
    const totalValue = assets.reduce((sum, asset) => sum + asset.value, 0);
    const totalCities = new Set(assets.map(asset => asset.city)).size;

    const valueByCity = assets.reduce((acc, asset) => {
      acc[asset.city] = (acc[asset.city] || 0) + asset.value;
      return acc;
    }, {} as { [city: string]: number });

    const barChartData = Object.entries(valueByCity).map(([city, value]) => ({ city, value }));
    
    const categoryMap = new Map(categories.map(cat => [cat.id, cat.name]));
    const valueByCategory = assets.reduce((acc, asset) => {
      const categoryName = categoryMap.get(asset.categoryId) || 'Sem Categoria';
      acc[categoryName] = (acc[categoryName] || 0) + asset.value;
      return acc;
    }, {} as { [category: string]: number });
    
    const pieChartData = Object.entries(valueByCategory).map(([category, value]) => ({ category, value }));

    return {
      totalAssets,
      totalValue,
      totalCities,
      barChartData,
      pieChartData,
    };
  }, [assets, categories]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };
  
  if (isLoadingAssets || isLoadingCategories) {
    return (
        <div className="flex h-[80vh] items-center justify-center">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
    );
  }

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
            <div className="text-2xl font-bold">{dashboardData.totalAssets}</div>
            <p className="text-xs text-muted-foreground">Itens cadastrados no sistema.</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Valor Total do Patrimônio</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(dashboardData.totalValue)}</div>
            <p className="text-xs text-muted-foreground">Soma dos valores de todos os itens.</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Cidades</CardTitle>
            <Landmark className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardData.totalCities}</div>
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
                <RechartsBarChart data={dashboardData.barChartData}>
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
                ...dashboardData.pieChartData.reduce((acc, entry, index) => ({
                    ...acc,
                    [entry.category]: { label: entry.category, color: `hsl(var(--chart-${index + 1}))` }
                }), {})
             }} className="h-[350px] w-full">
                <ResponsiveContainer>
                    <RechartsPieChart>
                    <Tooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
                    <Pie data={dashboardData.pieChartData} dataKey="value" nameKey="category" cx="50%" cy="50%" innerRadius={60} outerRadius={80} labelLine={false} label={({
                        percent,
                      }) => `${(percent * 100).toFixed(0)}%`}>
                        {dashboardData.pieChartData.map((entry, index) => (
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
