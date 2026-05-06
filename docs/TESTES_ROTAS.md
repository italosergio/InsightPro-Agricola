# Testes de Rotas (Smoke Tests)

## Objetivo
Garantir que todas as 20 rotas protegidas do app renderizam sem erro.

## Estratégia
**Smoke test** — renderiza cada página com providers completos e verifica que o container não está vazio. Não testa comportamento, apenas que a página não quebra ao montar.

## Cobertura

| # | Rota | Página |
|---|------|--------|
| 1.1 | `/inicio` | HomePage |
| 1.2 | `/dashboard` | DashboardPage |
| 1.3 | `/clientes` | ClientesPage |
| 1.4 | `/cadastro-clientes` | ClientesCadastroPage |
| 1.5 | `/analise-abc` | AnaliseABCPage |
| 1.6 | `/penetracao` | PenetracaoPage |
| 1.7 | `/cultura` | CulturaPage |
| 1.8 | `/oportunidades` | OportunidadesPage |
| 1.9 | `/territorial` | TerritorialPage |
| 1.10 | `/gaps` | GapsPage |
| 1.11 | `/fidelizacao` | FidelizacaoPage |
| 1.12 | `/swot` | SWOTPage |
| 1.13 | `/gut` | GUTPage |
| 1.14 | `/pest` | PESTPage |
| 1.15 | `/metas` | MetasPage |
| 1.16 | `/campanhas` | CampanhasPage |
| 1.17 | `/pipeline` | PipelinePage |
| 1.18 | `/relatorios` | RelatoriosPage |
| 1.19 | `/exportar` | ExportarPage |
| 1.20 | `/produtos` | ProdutosPage |

## Mocks necessários

### IntersectionObserver
Páginas com `LazyChart` (Dashboard, ABC, Cultura, Territorial, Fidelização) usam `IntersectionObserver` para lazy loading. Mockado em `src/test/setup.ts`.

### Highcharts
Gráficos não renderizam em jsdom. Mockado em `src/test/setup.ts`.

## Executar

```bash
npm test -- src/test/routes.test.tsx
```

## Limitações
- Não testa navegação real (usa `MemoryRouter`)
- Não testa interação do usuário
- Não valida conteúdo específico (apenas que renderiza)
- Para testes E2E completos, usar Playwright
