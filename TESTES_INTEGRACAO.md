# Testes de Integração — InsightPro Agrícola

## O que são testes de integração?

Enquanto **testes unitários** verificam componentes isolados (uma função, um hook, um contexto), os **testes de integração** verificam **fluxos completos do usuário** envolvendo múltiplas camadas trabalhando juntas:

- UI (componentes React)
- Lógica de negócio (contextos)
- Persistência (localStorage)
- Roteamento (React Router)

---

## ⚠️ Importante: Integração com Banco de Dados

**Todos os testes de integração atuais simulam persistência com `localStorage`.**

Quando a aplicação for integrada com um banco de dados real (PostgreSQL, MySQL, MongoDB, etc.), os seguintes testes **devem ser atualizados**:

### Testes que precisam de atualização:

| Arquivo | Testes afetados | O que mudar |
|---------|-----------------|-------------|
| `login.test.tsx` | I-1.2, I-1.3 | Mockar chamada à API de autenticação (POST `/api/auth/login`) |
| `cadastroCliente.test.tsx` | I-2.1 a I-2.5 | Mockar endpoints CRUD: POST, PUT, DELETE `/api/clientes` |
| `importCSV.test.tsx` | I-3.1 a I-3.3 | Mockar endpoint de importação: POST `/api/clientes/import` |

### Exemplo de adaptação (após integração com API):

**Antes (localStorage):**
```typescript
await userEvent.click(screen.getByRole('button', { name: /salvar/i }))
const clientes = localDB.list<Cliente>(DB_KEYS.data)
expect(clientes[0].nome).toBe('João Silva')
```

**Depois (API mockada):**
```typescript
const mockPost = vi.fn().mockResolvedValue({ id: 'c1', nome: 'João Silva' })
global.fetch = mockPost

await userEvent.click(screen.getByRole('button', { name: /salvar/i }))
expect(mockPost).toHaveBeenCalledWith('/api/clientes', expect.objectContaining({
  method: 'POST',
  body: expect.stringContaining('João Silva')
}))
```

---

## Estrutura dos testes

```
src/integration/
├── login.test.tsx              # Fluxo de autenticação
├── cadastroCliente.test.tsx    # CRUD de clientes
└── importCSV.test.tsx          # Importação de dados
```

---

## Plano de Testes de Integração

### INTEGRAÇÃO 1 — Fluxo de Login
**Arquivo:** `src/integration/login.test.tsx`

| ID | Teste | O que valida |
|----|-------|-------------|
| I-1.1 | Usuário não autenticado vê formulário de login | Renderização inicial |
| I-1.2 | Credenciais erradas exibem mensagem de erro | AuthContext + LoginPage |
| I-1.3 | Credenciais corretas redirecionam para `/inicio` | AuthContext + Router + sessionStorage |
| I-1.4 | Usuário já autenticado não vê formulário | PublicRoute + AuthContext |

**Camadas envolvidas:** LoginPage → AuthContext → Router → sessionStorage

---

### INTEGRAÇÃO 2 — Cadastro de Cliente
**Arquivo:** `src/integration/cadastroCliente.test.tsx`

**Status:** ⚠️ **Não implementado** — requer refatoração do HTML para acessibilidade.

**Motivo:** A página `ClientesCadastroPage` não usa atributos `htmlFor` nos `<label>`, tornando impossível localizar campos por label com Testing Library. Implementar esses testes exigiria modificar o código de produção.

**Testes planejados (para implementação futura):**

| ID | Teste | O que valida |
|----|-------|-------------|
| I-2.1 | Formulário válido salva e exibe na tabela | ClientesCadastroPage + DataContext + UI |
| I-2.2 | Cliente salvo persiste no localStorage | DataContext + localDB |
| I-2.3 | Edição de cliente atualiza tabela | updateCliente + DataContext |
| I-2.4 | Exclusão remove cliente da tabela | removeCliente + DataContext |
| I-2.5 | CPF inválido bloqueia salvamento | validators + ClientesCadastroPage |

**Camadas envolvidas:** ClientesCadastroPage → DataContext → validators → localDB

---

### INTEGRAÇÃO 3 — Importação CSV
**Arquivo:** `src/integration/importCSV.test.tsx`

| ID | Teste | O que valida |
|----|-------|-------------|
| I-3.1 | CSV válido importa e exibe clientes | DataContext.importCSV + ClientesPage |
| I-3.2 | Dados importados persistem no localStorage | importCSV + localDB |
| I-3.3 | CSV incompleto não quebra, usa defaults | Parser CSV + DataContext |

**Camadas envolvidas:** DataContext.importCSV → PapaParse → localDB → ClientesPage

---

## Como executar

### Rodar todos os testes (unitários + integração)
```bash
npm test
```

### Rodar apenas testes de integração
```bash
npm test -- src/integration
```

### Modo watch (re-executa ao salvar)
```bash
npm run test:watch -- src/integration
```

---

## Diferença entre testes unitários e de integração

| Aspecto | Unitário | Integração |
|---------|----------|------------|
| **Escopo** | Uma função/componente isolado | Fluxo completo do usuário |
| **Mocks** | Muitos (isola dependências) | Poucos (usa implementações reais) |
| **Velocidade** | Rápido (< 50ms) | Mais lento (100-500ms) |
| **Objetivo** | Garantir que cada peça funciona | Garantir que as peças funcionam juntas |
| **Exemplo** | `validarCPF('123.456.789-00')` | Login → Dashboard → Cadastrar cliente |

---

## Cobertura atual

| Tipo | Arquivos | Testes | Status |
|------|----------|--------|--------|
| Unitários | 5 | 44 | ✅ |
| Integração — Login | 1 | 4 | ✅ |
| Integração — ImportCSV | 1 | 3 | ✅ |
| Integração — Cadastro | 1 | 5 | ⚠️ Pendente (requer htmlFor nos labels) |
| **Total implementado** | **7** | **51** | ✅ |

---

## Próximos passos (após integração com BD)

1. **Configurar MSW (Mock Service Worker)** para interceptar chamadas HTTP nos testes
2. **Atualizar testes de integração** para mockar endpoints da API
3. **Adicionar testes E2E** com Playwright/Cypress para validar fluxos no browser real
4. **Configurar testes de carga** para endpoints críticos (importação CSV, relatórios)

---

## Convenções

- IDs dos testes de integração começam com `I-` (ex: `I-1.1`, `I-2.3`)
- Cada teste limpa `localStorage` e `sessionStorage` no `beforeEach`
- Comentários `⚠️ ATENÇÃO` marcam pontos que precisam atualização após integração com BD
- Testes de integração renderizam a árvore completa de providers (AuthProvider, DataProvider, etc.)
