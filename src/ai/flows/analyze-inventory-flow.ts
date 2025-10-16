
'use server';

/**
 * @fileOverview Um fluxo de IA para analisar dados de inventário e gerar um resumo executivo.
 *
 * - analyzeInventory - Uma função que executa a análise de IA.
 * - AnalyzeInventoryInput - O tipo de entrada para a função analyzeInventory.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const ChartDataSchema = z.array(z.object({
    name: z.string(),
    value: z.number(),
}));

// Define o esquema de entrada para o fluxo de IA
const AnalyzeInventoryInputSchema = z.object({
  totalAssets: z.number().describe("Número total de ativos no inventário."),
  totalValue: z.number().describe("Valor monetário total de todos os ativos, em BRL."),
  totalCities: z.number().describe("Número total de cidades onde os ativos estão localizados."),
  createdLastMonth: z.number().describe("Número de ativos criados no último mês."),
  updatedLastMonth: z.number().describe("Número de ativos atualizados no último mês."),
  deletedLastMonth: z.number().describe("Número de ativos desativados (movidos para a lixeira) no último mês."),
  valueByCityChart: ChartDataSchema.describe("Dados do gráfico de valor por cidade. Cada item contém o nome da cidade e o valor total dos ativos nela."),
  valueByCategoryChart: ChartDataSchema.describe("Dados do gráfico de valor por categoria. Cada item contém o nome da categoria e o valor total dos ativos nela."),
});

export type AnalyzeInventoryInput = z.infer<typeof AnalyzeInventoryInputSchema>;

/**
 * Executa o fluxo de IA para analisar os dados do inventário e retorna um resumo.
 * @param input - Os dados do dashboard para análise.
 * @returns Uma string contendo o resumo executivo gerado pela IA.
 */
export async function analyzeInventory(input: AnalyzeInventoryInput): Promise<string> {
  const analysis = await analyzeInventoryFlow(input);
  return analysis;
}

// Define o prompt para a IA
const analysisPrompt = ai.definePrompt({
    name: 'inventoryAnalysisPrompt',
    input: { schema: AnalyzeInventoryInputSchema },
    output: { schema: z.string() },
    prompt: `
        Você é um analista de negócios sênior e especialista em gestão de inventário.
        Sua tarefa é analisar os dados de um painel de controle de patrimônio e fornecer um resumo executivo conciso e perspicaz em português do Brasil.
        Seja direto e foque nos pontos mais importantes. Use bullet points para destacar os insights.

        Dados do Painel:
        - Total de Ativos: {{totalAssets}}
        - Valor Total do Patrimônio: R$ {{totalValue}}
        - Total de Cidades: {{totalCities}}
        - Ativos Criados (Último Mês): {{createdLastMonth}}
        - Ativos Atualizados (Último Mês): {{updatedLastMonth}}
        - Ativos Desativados (Último Mês): {{deletedLastMonth}}

        Distribuição de Valor por Cidade:
        {{#each valueByCityChart}}
        - {{name}}: R$ {{value}}
        {{/each}}

        Distribuição de Valor por Categoria:
        {{#each valueByCategoryChart}}
        - {{name}}: R$ {{value}}
        {{/each}}

        Com base nesses dados, gere um resumo executivo. Destaque os seguintes pontos se forem relevantes:
        1.  Qual a saúde geral do inventário (crescendo, estável, encolhendo)?
        2.  Onde está concentrado o maior valor (cidade e categoria)?
        3.  Existem insights ou recomendações que você pode fornecer? (Ex: "A alta concentração de valor em uma única cidade pode ser um risco.")
        4.  Apresente a análise de forma clara e direta, usando bullet points. O formato da saída deve ser texto simples, não markdown.
    `,
});

// Define o fluxo principal que usa o prompt
const analyzeInventoryFlow = ai.defineFlow(
  {
    name: 'analyzeInventoryFlow',
    inputSchema: AnalyzeInventoryInputSchema,
    outputSchema: z.string(),
  },
  async (input) => {
    const { output } = await analysisPrompt(input);
    return output!;
  }
);
