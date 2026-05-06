# Relatórios com IA e Gráficos

## Visão Geral

Sistema de geração de relatórios PDF enriquecidos com:
- **Gráficos** — visualizações convertidas para imagens
- **Análise de IA** — insights contextualizados via DeepSeek
- **Formatação profissional** — layout consistente e responsivo

## Arquitetura

```
Botão "Baixar Relatório"
  ↓
1. Coleta dados da página
2. Gera gráficos Highcharts → base64
3. Chama IA com contexto
4. Monta HTML do relatório
5. Converte para PDF (html2pdf.js)
6. Download automático
```

## Serviços

### `reportService.ts`

Orquestra a geração de relatórios.

```typescript
import { generatePageReport, prepareDashboardReport } from '@/lib/reportService'

// Exemplo: Dashboard
const reportData = {
  ...prepareDashboardReport(clientes),
  charts: [
    {
      title: 'Faturamento por Status',
      options: chartOptions,
    },
  ],
}

await generatePageReport(reportData, (msg) => console.log(msg))
```

### `chartToImage.ts`

Converte gráficos Highcharts para imagens base64.

```typescript
import { chartToBase64 } from '@/lib/chartToImage'

const base64 = await chartToBase64(chartOptions, 800, 400)
// data:image/png;base64,iVBORw0KGgoAAAANS...
```

## Helpers por Página

| Função | Retorna |
|--------|---------|
| `prepareDashboardReport(clientes)` | Resumo + métricas do Dashboard |
| `prepareABCReport(clientes)` | Dados da Análise ABC |
| _(adicionar conforme implementação)_ | |

## Formato do Relatório

### Seções

1. **Header** — título, subtítulo, data de geração
2. **Resumo** — tabela com métricas principais
3. **Gráficos** — imagens com títulos
4. **Análise IA** — insights em destaque
5. **Footer** — copyright e informações

### Exemplo de Análise IA

```
📊 Resumo Executivo
Sua carteira possui 150 clientes com faturamento total de R$ 12.5M.
A concentração em clientes Classe A (80% do faturamento) indica
dependência de poucos grandes clientes.

🎯 Recomendações
- Diversificar base com foco em Classe B
- Implementar programa de fidelização para top 20
- Expandir presença em estados com baixa penetração
```

## Uso

### 1. Preparar dados

```typescript
const data: ReportData = {
  pageTitle: 'Dashboard',
  pageSubtitle: 'Visão geral da carteira',
  generatedAt: new Date().toLocaleString('pt-BR'),
  summary: {
    'Total de Clientes': 150,
    'Faturamento Total': 'R$ 12.5M',
  },
  charts: [
    { title: 'Gráfico 1', options: chart1Options },
    { title: 'Gráfico 2', options: chart2Options },
  ],
}
```

### 2. Gerar PDF

```typescript
await generatePageReport(data, (message) => {
  setLoadingMessage(message)
})
```

### 3. Loading States

```
"Gerando gráficos..." (1-2s)
"Gerando análise com IA..." (3-5s)
"Montando relatório..." (1s)
"Concluído!"
```

## Limitações

- **Gráficos complexos** — podem demorar para renderizar
- **IA** — 3-5s de latência (DeepSeek API)
- **Tamanho do PDF** — ~2-5MB dependendo do número de gráficos
- **Browser** — requer suporte a Canvas e Blob

## Próximos Passos

- [ ] Implementar relatório do Dashboard (piloto)
- [ ] Cache de análises IA (1h)
- [ ] Compressão de imagens
- [ ] Relatórios de todas as páginas
- [ ] Testes automatizados
