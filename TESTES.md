# Testes — InsightPro Agrícola

## Stack utilizada

| Lib | Função |
|-----|--------|
| [Vitest](https://vitest.dev) | Runner de testes (integrado ao Vite) |
| [@testing-library/react](https://testing-library.com/react) | Renderização e interação com componentes React |
| [@testing-library/user-event](https://testing-library.com/user-event) | Simulação de ações do usuário (clique, digitação) |
| [@testing-library/jest-dom](https://github.com/testing-library/jest-dom) | Matchers extras (`toBeInTheDocument`, etc.) |
| jsdom | Simulação do DOM no Node.js |

---

## Como executar os testes

### Pré-requisito
```bash
npm install
```

### Rodar todos os testes (uma vez)
```bash
npm test
```

### Modo watch (re-executa ao salvar arquivos)
```bash
npm run test:watch
```

### Com relatório de cobertura
```bash
npm run test:coverage
```

---

## Estrutura dos arquivos de teste

```
src/
├── lib/
│   ├── validators.test.ts       # Fase 1 — Validações CPF/CNPJ/telefone/email
│   └── localDB.test.ts          # Fase 2 — Persistência localStorage
├── store/
│   ├── AuthContext.test.tsx     # Fase 3 — Autenticação
│   └── DataContext.test.tsx     # Fase 4 — CRUD de clientes
├── components/
│   └── ProtectedRoute.test.tsx  # Fase 5 — Rotas protegidas
└── test/
    └── setup.ts                 # Configuração global (jest-dom)
```

---

## Plano de testes por fase

### Fase 1 — Validadores (`validators.test.ts`)

| ID | Teste | Resultado esperado |
|----|-------|--------------------|
| 1.1 | CPF válido aceito | `valido: true` |
| 1.2 | CPF com dígito verificador errado | `valido: false` |
| 1.3 | CPF com todos os dígitos iguais | `valido: false` |
| 1.4 | CPF formatado corretamente | `"529.982.247-25"` |
| 1.5 | CNPJ válido aceito | `valido: true` |
| 1.6 | CNPJ com dígito verificador errado | `valido: false` |
| 1.7 | CNPJ com todos os dígitos iguais | `valido: false` |
| 1.8 | `validarCPFouCNPJ` detecta tipo CPF | `tipo: 'cpf'` |
| 1.9 | `validarCPFouCNPJ` detecta tipo CNPJ | `tipo: 'cnpj'` |
| 1.10 | Celular com 11 dígitos aceito | `valido: true`, formatado correto |
| 1.11 | Telefone fixo com 10 dígitos aceito | `valido: true`, formatado correto |
| 1.12 | DDD inválido (< 11) rejeitado | `valido: false` |
| 1.13 | Email válido aceito | `true` |
| 1.14 | Email inválido rejeitado | `false` |
| 1.15 | Email vazio aceito (campo opcional) | `true` |

---

### Fase 2 — LocalDB (`localDB.test.ts`)

| ID | Teste | Resultado esperado |
|----|-------|--------------------|
| 2.1 | `set` e `get` persistem dado | Objeto recuperado igual ao salvo |
| 2.2 | `get` com chave inexistente | Retorna `null` |
| 2.3 | `list` sem dados | Retorna `[]` |
| 2.4 | `add` insere item | Lista com 1 item |
| 2.5 | `update` altera só o item correto | Outros itens intactos |
| 2.6 | `delete` remove só o item correto | Lista reduz, outros permanecem |
| 2.7 | `clearAll` limpa tudo | Todas as chaves retornam `null` |

---

### Fase 3 — AuthContext (`AuthContext.test.tsx`)

| ID | Teste | Resultado esperado |
|----|-------|--------------------|
| 3.1 | Login com credenciais corretas | `isAuthenticated: true` |
| 3.2 | Login com senha errada | `isAuthenticated: false` |
| 3.4 | Estado após login | `isAuthenticated: true` |
| 3.5 | Estado após logout | `isAuthenticated: false` |
| 3.6 | Login persiste no sessionStorage | `insightpro_auth = "true"` |
| 3.7 | Logout limpa sessionStorage | Chave removida |
| 3.8 | `useAuth` fora do Provider | Lança erro descritivo |

---

### Fase 4 — DataContext (`DataContext.test.tsx`)

| ID | Teste | Resultado esperado |
|----|-------|--------------------|
| 4.1 | `addCliente` adiciona ao estado | `rawData.length` aumenta |
| 4.2 | `updateCliente` altera campos | Campo atualizado, outros intactos |
| 4.3 | `removeCliente` remove por id | Cliente não está mais em `rawData` |
| 4.4 | `applyFilters` filtra por cidade | `filteredData` retorna só os corretos |
| 4.5 | `clearFilters` restaura todos | `filteredData === rawData` |
| 4.6 | `importCSV` parseia e adiciona | Clientes aparecem em `rawData` |
| 4.7 | `importCSV` com CSV vazio | Não lança exceção |

---

### Fase 5 — Rotas protegidas (`ProtectedRoute.test.tsx`)

| ID | Teste | Resultado esperado |
|----|-------|--------------------|
| 5.1 | `AuthRoute` sem auth | Redireciona para `/login` |
| 5.2 | `AuthRoute` com auth | Renderiza o conteúdo filho |
| 5.3 | `PublicRoute` com auth | Redireciona para `/inicio` |
| 5.4 | `PublicRoute` sem auth | Renderiza o conteúdo filho |

---

## CI/CD — GitHub Actions

O arquivo `.github/workflows/tests.yml` executa automaticamente os testes em todo `push` ou `pull request` para as branches `main` e `develop`.

**O que o pipeline faz:**
1. Faz checkout do código
2. Instala as dependências com `npm ci`
3. Executa `npm test`
4. Executa `npm run build` para garantir que o build não quebrou

**Quando o pipeline falha**, o merge do PR é bloqueado — protegendo a branch principal de código quebrado.

---

## Convenções adotadas

- Cada arquivo de teste fica ao lado do arquivo que testa (`validators.ts` → `validators.test.ts`)
- IDs dos testes seguem o plano (1.1, 2.3, etc.) para rastreabilidade
- `beforeEach` limpa `localStorage`/`sessionStorage` para isolamento entre testes
- Componentes auxiliares de teste (ex: `LoginButton`) ficam dentro do próprio arquivo de teste
