# Relatórios PDF — InsightPro Agrícola

Guia técnico completo para geração de relatórios PDF executivos. Aplique este padrão ao criar relatórios para qualquer nova página da plataforma.

---

## Arquitetura de geração

```
Página React
    │
    ├─ prepareXxxReport(clientes)        → ReportData (summary + metadata)
    │
    └─ generatePageReport({ ...base, charts, clientes })
           │
           ├─ chartToBase64(options)     → base64 PNG por gráfico
           │
           ├─ generateAIReport({ clientes, produtos })
           │       └─ buildPrompt()      ← recebe os arrays reais
           │              └─ computa métricas da carteira
           │
           ├─ buildReportHTML()          → string HTML completo
           │
           └─ html2pdf().save()          → arquivo .pdf
```

> **Regra crítica:** sempre passe `clientes: rawData` (e `produtos` quando disponível) ao chamar `generatePageReport`. O `buildPrompt` em `aiService.ts` **ignora** o campo `summary` — ele recalcula tudo a partir dos arrays reais. Sem eles, a IA recebe uma carteira zerada e gera análise inválida.

### Arquivos envolvidos

| Arquivo | Função |
|---------|--------|
| `src/lib/reportService.ts` | Orquestrador + template HTML do PDF |
| `src/lib/chartToImage.ts` | Converte Highcharts options → base64 PNG |
| `src/lib/aiService.ts` | Gera texto de análise via IA |

---

## Adicionando um relatório a uma nova página

### Passo 1 — Criar o data preparer

Adicione uma função `prepareXxxReport` no final de `reportService.ts`:

```typescript
export function prepareXxxReport(
  clientes: Cliente[]  // ou o tipo de dado da sua página
): Omit<ReportData, 'charts' | 'aiAnalysis'> {

  // calcule suas métricas aqui
  const total = clientes.length
  const faturamento = clientes.reduce((s, c) => s + c.faturamento_anual, 0)

  return {
    pageTitle: 'Nome da Pagina',         // sem acento — vai para nome do arquivo
    pageSubtitle: 'Descricao curta',
    generatedAt: new Date().toLocaleString('pt-BR'),
    summary: {
      // Chave: valor — aparecem como KPI cards + tabela de detalhe
      'Total de Registros': total,
      'Faturamento':        `R$ ${(faturamento / 1_000_000).toFixed(2)}M`,
      'Outro Indicador':    'valor',
    },
  }
}
```

**Regras para `summary`:**
- Máximo recomendado: **6 chaves** (além disso os KPI cards ficam pequenos)
- Valores como `string` ou `number` — ambos são aceitos
- Valores monetários: use `R$ X.XXM` ou `R$ X.XXK` para manter compacto
- Percentuais: inclua o símbolo `%` no próprio valor

### Passo 2 — Preparar os gráficos

Na sua página, monte o array `ChartData[]`. Cada item é um objeto Highcharts.Options:

```typescript
import { type ChartData } from '@/lib/reportService'

const reportCharts: ChartData[] = [
  {
    title: 'Distribuicao por Status',
    options: {
      chart: { type: 'pie', width: 700, height: 360,
               backgroundColor: '#ffffff' },   // ← sempre branco
      title: { text: '' },                      // ← sem título (vai no card do PDF)
      colors: CHART_COLORS,                     // use a paleta padrão (ver abaixo)
      series: [{
        type: 'pie',
        name: 'Clientes',
        data: [
          { name: 'Ativos', y: 120 },
          { name: 'Inativos', y: 30 },
        ],
      }],
      credits: { enabled: false },
    },
  },
  {
    title: 'Faturamento por Estado',
    options: { /* ... */ },
  },
]
```

**Regras para options de gráficos em PDF:**
- `chart.backgroundColor` **sempre** `'#ffffff'` — o html2canvas usa fundo branco
- `chart.width` entre `650` e `750` — cabe em A4 com margens
- `chart.height` entre `300` e `420`
- `title.text: ''` — o título aparece no card do relatório, não no gráfico
- Retire animações: `chart.animation: false` (desnecessário no PNG estático)
- `credits: { enabled: false }` sempre

### Passo 3 — Disparar a geração na página

```typescript
import {
  generatePageReport,
  prepareXxxReport,
  type ChartData,
} from '@/lib/reportService'

// dentro do componente:
const { rawData, produtos } = useData()
const [loading, setLoading] = useState(false)
const [progress, setProgress] = useState('')

async function handleGerarRelatorio() {
  setLoading(true)
  try {
    const base = prepareXxxReport(rawData)

    const charts: ChartData[] = [
      { title: 'Titulo Grafico 1', options: opcoes1 },
      { title: 'Titulo Grafico 2', options: opcoes2 },
    ]

    await generatePageReport(
      {
        ...base,
        charts,
        clientes: rawData,   // ← OBRIGATÓRIO para a IA ver dados reais
        produtos,            // ← inclua se a página tem contexto de produtos
      },
      (msg) => setProgress(msg)
    )
  } catch (err) {
    alert('Erro ao gerar relatório. Tente novamente.')
    console.error(err)
  } finally {
    setLoading(false)
    setProgress('')
  }
}
```

Botão sugerido no JSX:

```tsx
<button
  onClick={handleGerarRelatorio}
  disabled={loading}
  className="btn btn-primary"
>
  {loading ? progress || 'Gerando...' : 'Exportar PDF'}
</button>
```

---

## Estrutura do PDF gerado

O PDF segue um layout fixo de 4 seções obrigatórias:

```
┌──────────────────────────────────────────────┐
│ CAPA (fundo verde #15803d)                   │
│   Marca  /  Título  /  Subtítulo  /  Meta    │
├──────────────────────────────────────────────┤
│ SEÇÃO 01 — Indicadores Principais            │
│   Cards KPI (verde claro, valor em destaque) │
├──────────────────────────────────────────────┤
│ SEÇÃO 02 — Resumo Detalhado                  │
│   Tabela linhas alternadas (branco/#f9fafb)  │
├──────────────────────────────────────────────┤
│ SEÇÃO 03 — Análise Visual (se charts > 0)    │
│   Card por gráfico (borda cinza, img 100%)   │
├──────────────────────────────────────────────┤
│ SEÇÃO 04 — Insights de IA                    │
│   Borda esquerda verde, fundo #f0fdf4        │
├──────────────────────────────────────────────┤
│ RODAPÉ                                        │
│   Marca + aviso de confidencialidade         │
└──────────────────────────────────────────────┘
```

---

## Paleta de cores do PDF

Todas as cores são **hex explícito** — nunca use CSS variables nem `currentColor` no template.

| Uso | Cor | Hex |
|-----|-----|-----|
| Fundo da capa | Verde primário | `#15803d` |
| Borda destaque | Verde primário | `#16a34a` |
| Badge do número de seção | Verde primário | `#16a34a` |
| KPI valor | Verde escuro | `#15803d` |
| KPI fundo | Verde muito claro | `#f0fdf4` |
| KPI borda | Verde claro | `#bbf7d0` |
| Título de seção | Quase preto | `#111827` |
| Texto de corpo | Cinza escuro | `#374151` |
| Label/meta | Cinza médio | `#4b5563` |
| Caption/rodapé | Cinza claro | `#9ca3af` |
| Linhas de tabela | Cinza sutil | `#e5e7eb` |
| Linhas alternadas | Cinza muito sutil | `#f9fafb` |
| Fundo IA | Verde muito claro | `#f0fdf4` |
| Fundo gráfico | Branco | `#ffffff` |
| Fundo documento | Branco | `#ffffff` |

---

## Regras CSS para PDF (html2canvas safe)

Estas regras evitam os problemas mais comuns de renderização:

### O que FAZER

```css
/* Cores explícitas sempre */
color: #111827;
background-color: #ffffff;

/* Layouts com table — mais confiável que flex/grid */
display: table;
display: table-cell;

/* Page breaks */
page-break-inside: avoid;   /* evita cortar um card no meio */
page-break-before: always;  /* força nova página */

/* Fontes seguras */
font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;

/* Print color */
-webkit-print-color-adjust: exact;
print-color-adjust: exact;
```

### O que EVITAR

| Propriedade | Motivo | Alternativa |
|-------------|--------|-------------|
| CSS Variables (`var(--x)`) | Herda dark-mode do documento | Hex hardcoded |
| `display: flex` | Suporte inconsistente no html2canvas | `display: table` |
| `display: grid` | Não suportado no html2canvas | `<table>` HTML |
| `backdrop-filter` | Ignorado | Solid background |
| `text-shadow` | Ignorado | Contraste direto |
| `box-shadow` complexo | Parcialmente ignorado | Border + background |
| `<table>` + `border-radius` + `overflow:hidden` | Corta bordas arredondadas | Usar `border-radius` no wrapper `<div>` |
| Emojis em texto | Renderizam como caixas brancas | Texto ASCII ou símbolo HTML (`&bull;`) |
| `background: linear-gradient(...)` em texto | Quebra no pdf | Cor sólida ou imagem |
| Fontes externas (@import) | Não carregam no contexto do html2canvas | Stack de sistema |

### Por que `display: table` no lugar de `flex`

html2canvas converte o DOM para canvas pixel a pixel. O suporte a Flexbox é parcial e pode produzir desalinhamentos. Tabelas HTML são 100% suportadas pois são renderizadas pelo layout engine do browser antes do html2canvas processar.

---

## Configuração do html2pdf

```typescript
const opt = {
  margin: 0,                            // margens no HTML, não aqui
  filename: `titulo_${date}.pdf`,
  image: { type: 'jpeg', quality: 0.97 },
  html2canvas: {
    scale: 2,                           // 2 = boa qualidade, mais rápido que 3
    useCORS: true,                      // para imagens de domínios externos
    letterRendering: true,
    logging: false,
    backgroundColor: '#ffffff',        // garante fundo branco
    allowTaint: false,
    scrollX: 0,
    scrollY: 0,
  },
  jsPDF: {
    unit: 'mm',
    format: 'a4',
    orientation: 'portrait',
    compress: true,
  },
  pagebreak: {
    mode: ['css', 'legacy'],
    before: '.pb-before',              // classe para forçar nova página
    avoid: '.pb-avoid',               // classe para evitar quebra interna
  },
}
```

---

## Convertendo gráficos Highcharts para PNG

O `chartToBase64` em `src/lib/chartToImage.ts` cria um container temporário no DOM, renderiza o gráfico e retorna um PNG base64. O gráfico é removido após a captura.

**Checklist antes de passar um gráfico:**
- [ ] `chart.backgroundColor: '#ffffff'` (não transparente)
- [ ] `chart.width: 700` (ou próximo — caberá no A4 com padding)
- [ ] `chart.height: 360` (proporcional, não muito alto)
- [ ] `title.text: ''` (título no card do PDF, não no gráfico)
- [ ] `credits.enabled: false`
- [ ] Cores nas series: use hex explícito, não CSS variables

---

## Análise com IA (opcional)

A IA é chamada automaticamente pelo `generatePageReport` se `aiAnalysis` não for fornecido. O texto retornado passa por `parseAIContent()` que converte:

| Formato no texto | Renderização no PDF |
|------------------|---------------------|
| `**Titulo**` (linha só com negrito) | Subtítulo escuro 14px |
| `- item` ou `• item` | Bullet verde com texto |
| `texto **negrito** texto` | Parágrafo com negrito inline |
| Linha normal | Parágrafo 13px, cinza escuro |

Para fornecer análise manual (sem IA):

```typescript
await generatePageReport({
  ...base,
  charts,
  aiAnalysis: `
**Principais Observações**

- A carteira apresenta concentração de 72% do faturamento na Classe A.
- Clientes inativos representam risco de R$ 1.2M em receita.

**Recomendações**

Priorize ações de retenção nos 15 maiores clientes da Classe A.
  `,
})
```

---

## Checklist para novos relatórios

Antes de considerar um relatório completo, verifique:

- [ ] `prepareXxxReport()` criado e exportado de `reportService.ts`
- [ ] `summary` com no máximo 6 chaves
- [ ] Todos os gráficos com `backgroundColor: '#ffffff'` e `title.text: ''`
- [ ] `clientes: rawData` passado na chamada de `generatePageReport` — **sem isso a IA gera análise zerada**
- [ ] Botão de exportar com estado de `loading` e mensagem de progresso
- [ ] Testado em modo claro **e** escuro (o PDF deve ser igual nos dois)
- [ ] Testado com carteira vazia (0 clientes) — sem divisão por zero
- [ ] Nome do arquivo sem acentos (`pageTitle` sem caracteres especiais)

---

## Problemas conhecidos e soluções

| Problema | Causa | Solução |
|----------|-------|---------|
| **IA analisa carteira zerada** | `clientes` não passado para `generatePageReport` | Inclua `clientes: rawData` na chamada — `buildPrompt` ignora `summary`, recalcula tudo dos arrays |
| Texto invisível no PDF | CSS variables herdadas do dark-mode | Use hex explícito em todas as cores |
| Tabela com bordas cortadas | `border-radius` + `overflow:hidden` | Remova `overflow:hidden` ou use `<div>` wrapper |
| Gráfico em branco no PDF | `backgroundColor: 'transparent'` | Defina `backgroundColor: '#ffffff'` |
| Layout desalinhado | `display: flex` não suportado | Use `display: table` / `table-cell` |
| Emojis como caixas brancas | Ausência de emoji font no pdf engine | Substitua por texto ou `&bull;` |
| PDF cortando card no meio | Sem `page-break-inside` | Adicione `class="pb-avoid"` no container |
| Múltiplas páginas em branco | `margin` duplicado (html + opções) | Use `margin: 0` nas opções, espaçamento só no HTML |
| Fonte diferente no PDF | Sistema sem a fonte especificada | Use `font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif` |
