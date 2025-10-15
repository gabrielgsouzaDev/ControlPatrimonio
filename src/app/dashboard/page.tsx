
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AreaChart, BarChart, PieChart, Building2, Landmark, DollarSign, Loader2, PlusSquare, PenSquare, MinusSquare, Download, FileSpreadsheet, FileText } from 'lucide-react';
import {
  Bar,
  BarChart as RechartsBarChart,
  Pie,
  PieChart as RechartsPieChart,
  Area,
  AreaChart as RechartsAreaChart,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { ChartContainer, ChartTooltipContent } from '@/components/ui/chart';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, Timestamp } from 'firebase/firestore';
import type { Asset, Category, Location, HistoryLog } from '@/lib/types';
import { useMemo, useState, useTransition } from 'react';
import { subDays, startOfDay, eachDayOfInterval, format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { exportDashboardToCsv } from '@/lib/actions';
import { exportDashboardToPdf } from '@/lib/pdf-export';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

const COLORS = ['hsl(var(--chart-1))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))', 'hsl(var(--chart-4))'];
type ActiveChart = 'totalAssets' | 'totalValue' | 'totalCities' | 'created' | 'updated' | 'deleted';


export default function DashboardPage() {
  const firestore = useFirestore();
  const [isPending, startTransition] = useTransition();
  const [activeChart, setActiveChart] = useState<ActiveChart>('totalValue');
  const { toast } = useToast();

  const assetsQuery = useMemoFirebase(() => (firestore ? collection(firestore, 'assets') : null), [firestore]);
  const categoriesQuery = useMemoFirebase(() => (firestore ? collection(firestore, 'categories') : null), [firestore]);
  const locationsQuery = useMemoFirebase(() => (firestore ? collection(firestore, 'locations') : null), [firestore]);
  const historyQuery = useMemoFirebase(() => (firestore ? collection(firestore, 'history') : null), [firestore]);

  const { data: assets, isLoading: isLoadingAssets } = useCollection<Asset>(assetsQuery);
  const { data: categories, isLoading: isLoadingCategories } = useCollection<Category>(categoriesQuery);
  const { data: locations, isLoading: isLoadingLocations } = useCollection<Location>(locationsQuery);
  const { data: history, isLoading: isLoadingHistory } = useCollection<HistoryLog>(historyQuery);

  const dashboardData = useMemo(() => {
    if (!assets || !categories || !locations || !history) {
      return {
        totalAssets: 0,
        totalValue: 0,
        totalCities: 0,
        createdLastMonth: 0,
        updatedLastMonth: 0,
        deletedLastMonth: 0,
        valueByCityChart: [],
        valueByCategoryChart: [],
        itemsByCategoryChart: [],
        itemsByCityChart: [],
        createdChart: [],
        updatedChart: [],
        deletedChart: [],
      };
    }
    
    const activeAssets = assets.filter(asset => asset.status !== 'inativo');

    const totalAssets = activeAssets.length;
    const totalValue = activeAssets.reduce((sum, asset) => sum + asset.value, 0);
    
    const locationMap = new Map((locations || []).map(loc => [loc.id, loc.name]));
    const activeAssetsWithCityName = activeAssets.map(a => ({...a, city: locationMap.get(a.city) || ''}));
    const totalCities = new Set(activeAssetsWithCityName.map(asset => asset.city).filter(Boolean)).size;
    
    // Date ranges
    const now = new Date();
    const oneMonthAgo = subDays(now, 30);
    const interval = eachDayOfInterval({ start: oneMonthAgo, end: now });

    const historyLastMonth = history.filter(log => {
        const logDate = log.timestamp instanceof Timestamp ? log.timestamp.toDate() : new Date(log.timestamp);
        return logDate >= oneMonthAgo && logDate <= now;
    });

    const createdLastMonth = historyLastMonth.filter(log => log.action === 'Criado').length;
    const updatedLastMonth = historyLastMonth.filter(log => log.action === 'Atualizado').length;
    const deletedLastMonth = historyLastMonth.filter(log => log.action === 'Desativado').length;
    
    // Chart data generation
    const valueByCity = activeAssets.reduce((acc, asset) => {
      const cityName = locationMap.get(asset.city) || 'Sem Localização';
      acc[cityName] = (acc[cityName] || 0) + asset.value;
      return acc;
    }, {} as { [city: string]: number });
    const valueByCityChart = Object.entries(valueByCity).map(([city, value]) => ({ name: city, value }));
    
    const categoryMap = new Map((categories || []).map(cat => [cat.id, cat.name]));
    const valueByCategory = activeAssets.reduce((acc, asset) => {
      const categoryName = categoryMap.get(asset.categoryId) || 'Sem Categoria';
      acc[categoryName] = (acc[categoryName] || 0) + asset.value;
      return acc;
    }, {} as { [category: string]: number });
    const valueByCategoryChart = Object.entries(valueByCategory).map(([name, value]) => ({ name, value }));

    const itemsByCategory = activeAssets.reduce((acc, asset) => {
        const categoryName = categoryMap.get(asset.categoryId) || 'Sem Categoria';
        acc[categoryName] = (acc[categoryName] || 0) + 1;
        return acc;
    }, {} as { [name: string]: number });
    const itemsByCategoryChart = Object.entries(itemsByCategory).map(([name, count]) => ({ name: name, count }));

    const itemsByCity = activeAssets.reduce((acc, asset) => {
        const cityName = locationMap.get(asset.city) || 'Sem Localização';
        acc[cityName] = (acc[cityName] || 0) + 1;
        return acc;
    }, {} as { [name: string]: number });
    const itemsByCityChart = Object.entries(itemsByCity).map(([name, count]) => ({ name: name, count }));
    
    const generateTimeSeries = (action: HistoryLog['action']) => {
        const dataByDay = interval.reduce((acc, date) => {
            acc[format(date, 'yyyy-MM-dd')] = 0;
            return acc;
        }, {} as { [key: string]: number });

        historyLastMonth
            .filter(log => log.action === action)
            .forEach(log => {
                const day = format(log.timestamp instanceof Timestamp ? log.timestamp.toDate() : new Date(log.timestamp), 'yyyy-MM-dd');
                if (dataByDay[day] !== undefined) {
                    dataByDay[day]++;
                }
            });
        
        let cumulative = 0;
        return interval.map(date => {
            const day = format(date, 'yyyy-MM-dd');
            cumulative += dataByDay[day] || 0;
            return { date: format(date, 'dd/MM'), value: cumulative };
        });
    };
    
    return {
      totalAssets,
      totalValue,
      totalCities,
      createdLastMonth,
      updatedLastMonth,
      deletedLastMonth,
      valueByCityChart,
      valueByCategoryChart,
      itemsByCategoryChart,
      itemsByCityChart,
      createdChart: generateTimeSeries('Criado'),
      updatedChart: generateTimeSeries('Atualizado'),
      deletedChart: generateTimeSeries('Desativado'),
    };
  }, [assets, categories, locations, history]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };
  
  const handleExportCsv = () => {
    startTransition(async () => {
        try {
            const csvString = await exportDashboardToCsv(dashboardData.valueByCityChart, dashboardData.valueByCategoryChart);
            if (!csvString) {
                toast({ variant: "destructive", title: "Exportação Falhou", description: "Não há dados para exportar."});
                return;
            }
            const blob = new Blob([`\uFEFF${csvString}`], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement('a');
            const url = URL.createObjectURL(blob);
            link.setAttribute('href', url);
            link.setAttribute('download', 'relatorio_dashboard.csv');
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            toast({ title: "Exportação Iniciada", description: "O download do arquivo CSV começará em breve."});
        } catch (error) {
            toast({ variant: "destructive", title: "Exportação Falhou", description: "Não foi possível gerar o arquivo CSV." });
        }
    });
  }

  const handleExportPdf = () => {
    startTransition(() => {
      try {
        exportDashboardToPdf(dashboardData.valueByCityChart, dashboardData.valueByCategoryChart);
        toast({
          title: "Exportação de PDF",
          description: "O arquivo PDF foi gerado e o download será iniciado.",
        });
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Exportação Falhou",
          description: "Não foi possível gerar o arquivo PDF.",
        });
      }
    });
  };

  const renderActiveChart = () => {
    switch (activeChart) {
      case 'totalValue':
        return (
          <Card className="col-span-1 xl:col-span-4">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart /> Valor por Cidade (Ativos)
              </CardTitle>
            </CardHeader>
            <CardContent className="pl-2">
              <ChartContainer config={{ value: { label: "Valor", color: "hsl(var(--chart-1))" } }} className="h-[350px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsBarChart data={dashboardData.valueByCityChart} margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
                    <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `R$${Number(value) / 1000}k`} />
                    <Tooltip cursor={false} content={<ChartTooltipContent indicator="dot" />} />
                    <Bar dataKey="value" fill="hsl(var(--chart-1))" radius={[4, 4, 0, 0]} />
                  </RechartsBarChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>
        );
      case 'totalAssets':
        return (
          <Card className="col-span-1 xl:col-span-4">
            <CardHeader><CardTitle className="flex items-center gap-2"><BarChart /> Quantidade de Itens por Categoria</CardTitle></CardHeader>
            <CardContent className="pl-2">
              <ChartContainer config={{ count: { label: "Quantidade" } }} className="h-[350px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsBarChart data={dashboardData.itemsByCategoryChart} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                    <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} />
                    <Tooltip content={<ChartTooltipContent indicator="dot" />} />
                    <Bar dataKey="count" fill="hsl(var(--chart-1))" radius={[4, 4, 0, 0]} />
                  </RechartsBarChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>
        );
      case 'totalCities':
        return (
          <Card className="col-span-1 xl:col-span-4">
            <CardHeader><CardTitle className="flex items-center gap-2"><BarChart /> Quantidade de Itens por Cidade</CardTitle></CardHeader>
            <CardContent className="pl-2">
              <ChartContainer config={{ count: { label: "Quantidade" } }} className="h-[350px] w-full">
                 <ResponsiveContainer width="100%" height="100%">
                    <RechartsBarChart data={dashboardData.itemsByCityChart} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                      <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                      <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} />
                      <Tooltip content={<ChartTooltipContent indicator="dot" />} />
                      <Bar dataKey="count" fill="hsl(var(--chart-1))" radius={[4, 4, 0, 0]} />
                    </RechartsBarChart>
                  </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>
        );
      case 'created':
        return (
          <Card className="col-span-1 xl:col-span-4">
            <CardHeader><CardTitle className="flex items-center gap-2"><AreaChart /> Itens Criados (Acumulado nos últimos 30 dias)</CardTitle></CardHeader>
            <CardContent><ChartContainer config={{ value: { label: "Criados" } }} className="h-[350px] w-full">
               <RechartsAreaChart data={dashboardData.createdChart} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                <XAxis dataKey="date" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} />
                <Tooltip content={<ChartTooltipContent indicator="dot" />} />
                <Area type="monotone" dataKey="value" stroke="hsl(var(--chart-1))" fill="hsl(var(--chart-1))" fillOpacity={0.3} />
              </RechartsAreaChart>
            </ChartContainer></CardContent>
          </Card>
        );
      case 'updated':
        return (
          <Card className="col-span-1 xl:col-span-4">
            <CardHeader><CardTitle className="flex items-center gap-2"><AreaChart /> Itens Atualizados (Acumulado nos últimos 30 dias)</CardTitle></CardHeader>
            <CardContent><ChartContainer config={{ value: { label: "Atualizados" } }} className="h-[350px] w-full">
               <RechartsAreaChart data={dashboardData.updatedChart} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                <XAxis dataKey="date" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} />
                <Tooltip content={<ChartTooltipContent indicator="dot" />} />
                <Area type="monotone" dataKey="value" stroke="hsl(var(--chart-1))" fill="hsl(var(--chart-1))" fillOpacity={0.3} />
              </RechartsAreaChart>
            </ChartContainer></CardContent>
          </Card>
        );
      case 'deleted':
        return (
          <Card className="col-span-1 xl:col-span-4">
            <CardHeader><CardTitle className="flex items-center gap-2"><AreaChart /> Itens Desativados (Acumulado nos últimos 30 dias)</CardTitle></CardHeader>
            <CardContent><ChartContainer config={{ value: { label: "Desativados" } }} className="h-[350px] w-full">
               <RechartsAreaChart data={dashboardData.deletedChart} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                <XAxis dataKey="date" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} />
                <Tooltip content={<ChartTooltipContent indicator="dot" />} />
                <Area type="monotone" dataKey="value" stroke="hsl(var(--chart-1))" fill="hsl(var(--chart-1))" fillOpacity={0.3} />
              </RechartsAreaChart>
            </ChartContainer></CardContent>
          </Card>
        );
      default:
         return (
          <Card className="col-span-1 xl:col-span-4">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart /> Valor por Cidade (Ativos)
              </CardTitle>
            </CardHeader>
            <CardContent className="pl-2">
              <ChartContainer config={{ value: { label: "Valor", color: "hsl(var(--chart-1))" } }} className="h-[350px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsBarChart data={dashboardData.valueByCityChart} margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
                    <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `R$${Number(value) / 1000}k`} />
                    <Tooltip cursor={false} content={<ChartTooltipContent indicator="dot" />} />
                    <Bar dataKey="value" fill="hsl(var(--chart-1))" radius={[4, 4, 0, 0]} />
                  </RechartsBarChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>
        );
    }
  };

  if (isLoadingAssets || isLoadingCategories || isLoadingLocations || isLoadingHistory) {
    return (
        <div className="flex h-[80vh] items-center justify-center">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
    );
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <h2 className="text-3xl font-headline tracking-tight">Dashboard</h2>
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="outline" disabled={isPending} className="w-full sm:w-auto">
                    {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />}
                    Exportar
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={handleExportCsv}>
                <FileSpreadsheet className="mr-2 h-4 w-4" />
                <span>Exportar para CSV</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleExportPdf}>
                <FileText className="mr-2 h-4 w-4" />
                <span>Exportar para PDF</span>
            </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        <Card onClick={() => setActiveChart('totalAssets')} className={cn("cursor-pointer transition-all", activeChart === 'totalAssets' && 'ring-2 ring-primary')}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Itens</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl md:text-2xl font-bold">{dashboardData.totalAssets}</div>
          </CardContent>
        </Card>
        <Card onClick={() => setActiveChart('totalValue')} className={cn("cursor-pointer transition-all", activeChart === 'totalValue' && 'ring-2 ring-primary')}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Valor Total do Patrimônio</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl md:text-2xl font-bold break-words">{formatCurrency(dashboardData.totalValue)}</div>
          </CardContent>
        </Card>
        <Card onClick={() => setActiveChart('totalCities')} className={cn("cursor-pointer transition-all", activeChart === 'totalCities' && 'ring-2 ring-primary')}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Cidades</CardTitle>
            <Landmark className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl md:text-2xl font-bold">{dashboardData.totalCities}</div>
          </CardContent>
        </Card>
        <Card onClick={() => setActiveChart('created')} className={cn("cursor-pointer transition-all", activeChart === 'created' && 'ring-2 ring-primary')}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Itens Criados (Mês)</CardTitle>
            <PlusSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl md:text-2xl font-bold">{dashboardData.createdLastMonth}</div>
          </CardContent>
        </Card>
        <Card onClick={() => setActiveChart('updated')} className={cn("cursor-pointer transition-all", activeChart === 'updated' && 'ring-2 ring-primary')}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Itens Atualizados (Mês)</CardTitle>
            <PenSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl md:text-2xl font-bold">{dashboardData.updatedLastMonth}</div>
          </CardContent>
        </Card>
        <Card onClick={() => setActiveChart('deleted')} className={cn("cursor-pointer transition-all", activeChart === 'deleted' && 'ring-2 ring-primary')}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Itens Desativados (Mês)</CardTitle>
            <MinusSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl md:text-2xl font-bold">{dashboardData.deletedLastMonth}</div>
          </CardContent>
        </Card>
      </div>
      <div className="grid gap-4 grid-cols-1 xl:grid-cols-7">
        
        {renderActiveChart()}
        
         <Card className="xl:col-span-3">
           <CardHeader>
            <CardTitle className="flex items-center gap-2">
                <PieChart /> Distribuição por Categoria (Ativos)
            </CardTitle>
          </CardHeader>
          <CardContent>
             <ChartContainer config={{
                value: { label: "Valor" },
                ...dashboardData.valueByCategoryChart.reduce((acc, entry, index) => ({
                    ...acc,
                    [entry.name]: { label: entry.name, color: `hsl(var(--chart-${index + 1}))` }
                }), {})
             }} className="h-[350px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <RechartsPieChart>
                    <Tooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
                    <Pie data={dashboardData.valueByCategoryChart} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={60} outerRadius={80} labelLine={false} label={({
                        percent,
                      }) => `${(percent * 100).toFixed(0)}%`}>
                        {dashboardData.valueByCategoryChart.map((entry, index) => (
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

    

    