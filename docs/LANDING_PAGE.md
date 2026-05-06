# Landing Page — InsightPro Agrícola

Documentação da página inicial pública (`/`), ponto de entrada da plataforma para novos usuários e visitantes.

---

## Arquivos envolvidos

| Arquivo | Função |
|---------|--------|
| `src/pages/LandingPage.tsx` | Componente principal — estrutura JSX de todas as seções |
| `src/styles/landing.css` | Sistema de design exclusivo da landing (animações, tokens, layout) |
| `src/store/ThemeContext.tsx` | Provedor de tema dark/light consumido via `useTheme()` |

---

## Seções da página

A landing é composta por **8 seções** em sequência vertical, cada uma com propósito de conversão definido.

| # | Seção | Classe raiz | Propósito |
|---|-------|-------------|-----------|
| 1 | [Navbar](#1-navbar) | `.l-nav` | Identidade da marca + acesso rápido à plataforma |
| 2 | [Hero](#2-hero) | `.l-hero` | Impacto visual e proposta de valor principal |
| 3 | [Stats Bar](#3-stats-bar) | `.l-stats-bar` | Prova social quantitativa |
| 4 | [Features Bento](#4-features-bento) | `.l-section` | Apresentação dos 6 módulos em grid editorial |
| 5 | [Como Funciona](#5-como-funciona) | `.l-section-alt` | Redução de fricção — 3 passos simples |
| 6 | [Depoimentos](#6-depoimentos) | `.l-section` | Prova social qualitativa |
| 7 | [CTA Final](#7-cta-final) | `.l-cta-final` | Conversão direta para cadastro/login |
| 8 | [Footer](#8-footer) | `.l-footer` | Links institucionais e conformidade |

---

## Detalhamento por seção

### 1. Navbar

**Posição:** `fixed`, `z-index: 100`, sempre visível durante o scroll.

**Destaques:**
- Glassmorphism com `backdrop-filter: blur(24px)` — fundo translúcido que revela o conteúdo por baixo
- Logo composto: ícone verde + nome "InsightPro" + subtítulo "AGRÍCOLA" em verde
- Botão de toggle de tema (dark ☀️ / light 🌙)
- Botão CTA "Acessar Plataforma →" com efeito shimmer ao hover

**Comportamento responsivo:** Em mobile, o texto do CTA se mantém; o botão de tema permanece visível.

---

### 2. Hero

**Altura:** `min-height: 100vh` — ocupa a tela inteira no primeiro acesso.

**Destaque visual principal:** Aurora background — três blobs circulares com `filter: blur(90px)` animados via `@keyframes aurora`. Cada blob tem tamanho, posição, cor e tempo de animação distintos para criar profundidade:

| Blob | Tamanho | Cor | Duração |
|------|---------|-----|---------|
| 1 | 700×700px | `rgba(34,197,94,0.18)` | 14s |
| 2 | 550×550px | `rgba(16,185,129,0.14)` | 17s reversed |
| 3 | 450×450px | `rgba(163,230,53,0.09)` | 20s + delay 3s |

**Grid de linhas:** Sobreposição com `background-image` usando linhas em `rgba(34,197,94,0.04)` em grade de 60×60px para profundidade tecnológica.

**Lado esquerdo (hero-left):**

| Elemento | Detalhe |
|----------|---------|
| Badge | "Plataforma AgTech nº 1 do Brasil" com dot verde pulsante |
| H1 | `clamp(2.75rem, 6vw, 5.25rem)`, `font-weight: 900`, `letter-spacing: -0.04em` |
| Gradient text | `"transforma"` com gradiente animado verde → lima (`gradient-shift`) |
| Subtítulo | Descrição da plataforma em `1.2rem`, `line-height: 1.75` |
| CTA primário | "Acessar Plataforma →" — gradiente verde + `glow-pulse` animado |
| CTA secundário | "▶ Ver demonstração" — glassmorphism ghost button |
| Trust indicators | 3 itens: "Sem custo inicial", "Dados 100% seguros", "Suporte dedicado" |

**Lado direito (hero-right) — Dashboard Mockup:**

Simulação visual da interface da plataforma construída inteiramente em HTML/CSS.

| Componente mockup | Conteúdo exibido |
|-------------------|-----------------|
| Topbar (browser dots) | Dots vermelho/amarelo/verde + label da aba |
| KPIs (3 cards) | Receita R$12.4M (+14.3%), Clientes 2.847 (+8.2%), Ticket Médio R$4.36K (+5.1%) |
| Gráfico de barras | 8 barras mensais com animação `bar-scale` escalonada por `animation-delay` |
| Mini-cards inferiores | "Top Clientes" (lista A/B/C) + "Análise ABC" (barras horizontais) |

**Cards flutuantes (floating):** 3 cards glassmorphism animados ao redor do mockup:

| Card | Posição | Conteúdo | Animação |
|------|---------|----------|----------|
| 1 | Topo direito | R$12.4M · Receita Total | `float-y` 4.5s |
| 2 | Centro esquerdo | 2.847 · Clientes Ativos | `float-y2` 5.5s delay 1.5s |
| 3 | Base direita | Dados atualizados há 3 min | `float-y` 3.8s delay 0.8s |

---

### 3. Stats Bar

Faixa horizontal ao final do hero com **4 métricas** de prova social.

| Métrica | Valor | Descrição |
|---------|-------|-----------|
| Clientes Ativos | **500+** | Base de clientes cadastrados |
| Vendas Gerenciadas | **R$2.8B** | Volume financeiro processado |
| Taxa de Satisfação | **98%** | NPS e pesquisas pós-uso |
| Módulos Especializados | **12** | Funcionalidades disponíveis |

**Visual:** Fundo `var(--stat-bg)`, borda superior `var(--stat-border)`. Valores em verde `#22c55e`, `font-size: 2.25rem`, `font-weight: 900`. Separadores verticais entre itens via `::after`.

---

### 4. Features Bento

**Layout:** CSS Grid de 12 colunas com cards de largura variável (sistema bento).

| Feature | Ícone | Colunas | Acento | Visual Extra |
|---------|-------|---------|--------|--------------|
| Análise ABC de Clientes | 📊 | 7 | Verde | Barras ABC horizontais |
| Dashboard em Tempo Real | ⚡ | 5 | Esmeralda | — |
| Mapeamento Geográfico | 🗺️ | 5 | Lima | — |
| Exportação Profissional | 📤 | 7 | Azul | Chips PDF/XLSX/PPTX/CSV |
| Gestão de Portfólio | 🌾 | 6 | Âmbar | — |
| Inteligência de Mercado | 🤖 | 6 | Verde | — |

**Comportamento dos cards:**
- `border-radius: 22px`, `backdrop-filter: blur(12px)`
- Hover: `translateY(-5px)` + `border-color` verde + `box-shadow` suave
- Linha gradiente no topo do card aparece ao hover via `::before`

**Visual ABC** (Feature 1): 3 linhas com label (A/B/C), barra de progresso colorida e contagem de clientes/percentual de receita.

**Visual Export** (Feature 4): 4 chips coloridos para cada formato — vermelho (PDF), verde (XLSX), âmbar (PPTX), azul (CSV) — com fundo e borda na cor do formato.

---

### 5. Como Funciona

**Seção com fundo alternado** (`var(--section-alt)`) para contraste visual.

**3 passos** conectados por linha gradiente horizontal animada:

| Passo | Ícone | Título | Descrição resumida |
|-------|-------|--------|-------------------|
| 01 | 📁 | Importe seus Dados | Upload CSV/Excel ou conexão ERP |
| 02 | 🔍 | Analise com Inteligência | Segmentação automática e insights |
| 03 | 🚀 | Tome Decisões Estratégicas | Exportação e alinhamento de equipe |

**Detalhe visual:** Cada número é um círculo com `background: linear-gradient(135deg, #22c55e, #15803d)` e borda pontilhada giratória (`spin-slow` 10s linear infinite).

**Linha conectora:** `position: absolute`, `top: 52px`, `left: 17%` a `right: 17%`, gradiente verde→lima animado via `gradient-shift`.

---

### 6. Depoimentos

**3 cards** em grid de 3 colunas com depoimentos de profissionais do agronegócio.

| Autor | Cargo | Empresa | Resultado citado |
|-------|-------|---------|-----------------|
| Carlos Mendonça | Gerente Comercial | AgroForte Sul | +34% retenção em 3 meses |
| Ana Paula Ribeiro | Diretora de Vendas | NutriCrop Agrícola | Relatórios em minutos (antes: dias) |
| Roberto Figueiredo | CEO | Campo Verde Distribuidora | +41% faturamento sem aumentar time |

**Visual dos cards:** 5 estrelas âmbar (`#f59e0b`), texto em itálico, avatar circular com gradiente verde e iniciais. Hover: `translateY(-5px)` + borda verde sutil.

---

### 7. CTA Final

**Propósito:** Conversão direta — sempre com fundo verde-escuro independente do tema, criando contraste forte e senso de conclusão.

**Fundo:** `linear-gradient(135deg, #052e16, #14532d, #0d2b18)` + 2 blobs aurora sobre ele.

**Elementos:**

| Elemento | Detalhe |
|----------|---------|
| Título | "Pronto para transformar seus dados em lucro?" — branco, `3.75rem` max |
| Subtítulo | Reforço de benefício em `rgba(255,255,255,0.72)` |
| Botão | Branco invertido "Começar agora — é grátis →" com shimmer ao hover |
| Trust row | 4 itens: Sem cartão · Setup 5min · Suporte PT · LGPD |

---

### 8. Footer

**Sempre com fundo `#052e16`** (verde-escuro) independente do tema.

**Estrutura:**

```
┌──────────────────────────────────────────────────────┐
│  Logo + Descrição da marca                           │
│                                  Produto | Empresa   │
│                                  Legal               │
├──────────────────────────────────────────────────────┤
│  © 2024 InsightPro Agrícola       [LGPD] [ISO 27001] │
│                                           [99.9% Up] │
└──────────────────────────────────────────────────────┘
```

---

## Suporte a temas

A landing implementa dois temas via CSS custom properties. A classe no elemento raiz muda conforme o tema ativo:

```tsx
<div className={`landing-root ${isDark ? 'landing-dark' : 'landing-light'}`}>
```

| Token CSS | Dark | Light |
|-----------|------|-------|
| `--hero-bg` | `#020906` | `#f0fdf4` |
| `--nav-bg` | `rgba(2,9,6,0.82)` | `rgba(240,253,244,0.88)` |
| `--text-h` | `#ffffff` | `#052e16` |
| `--text-s` | `rgba(255,255,255,0.72)` | `#166534` |
| `--card-bg` | `rgba(255,255,255,0.04)` | `rgba(255,255,255,0.82)` |
| `--card-border` | `rgba(255,255,255,0.09)` | `rgba(22,101,52,0.13)` |
| `--stat-bg` | `rgba(34,197,94,0.07)` | `rgba(22,163,74,0.07)` |
| `--footer-bg` | `#010604` | `#052e16` |

O CTA Final e o Footer **não mudam com o tema** — mantêm sempre fundo escuro para impacto visual consistente.

---

## Animações CSS

| Animação | Uso | Duração típica |
|----------|-----|----------------|
| `aurora` | Blobs do hero e CTA | 12–20s ease-in-out infinite |
| `float-y` / `float-y2` | Cards flutuantes | 3.8–5.5s ease-in-out infinite |
| `fade-in-up` | Hero left (entrada) | 0.85s cubic-bezier |
| `slide-in-right` | Hero right (entrada) | 0.9s cubic-bezier + delay 0.15s |
| `gradient-shift` | Texto gradiente, linha do processo | 4–8s ease infinite |
| `glow-pulse` | Botão primário, mockup | 3.5–4.5s ease-in-out infinite |
| `bar-scale` | Barras do gráfico no mockup | 1.2s cubic-bezier escalonado |
| `pulse-ring` | Dot do badge, anel do step | 1.8s ease-out infinite |
| `spin-slow` | Borda pontilhada dos steps | 10s linear infinite |
| `shimmer` | Efeito nos botões CTA ao hover | 0.4–0.5s transition |
| `blink-dot` | Dot do badge | 2s ease-in-out infinite |

---

## Responsividade

| Breakpoint | Mudanças principais |
|------------|---------------------|
| `≤ 1100px` | Hero vira coluna única; mockup + cards flutuantes somem; bento passa para 6 colunas; steps viram coluna única |
| `≤ 768px` | Stats bar vira 2×2; hero actions vira coluna; trust row vira coluna; nav com menos padding |
| `≤ 480px` | Bento vira 1 coluna; stats mantém 2×2 |

---

## Técnicas de design aplicadas

| Técnica | Onde é usada |
|---------|-------------|
| **Glassmorphism** | Navbar, cards flutuantes, mockup, bento cards, depoimentos |
| **Aurora / Mesh gradient** | Fundo do hero e CTA Final |
| **Gradient text** | Palavra "transforma" no H1 |
| **Bento grid** | Seção de features (12 colunas, larguras variadas) |
| **Grid layout overlay** | Hero — linhas diagonais em verde muito opaco |
| **CSS custom properties por tema** | Tokens `--hero-bg`, `--card-bg`, `--text-h` etc. |
| **Animação escalonada** | Barras do gráfico com `animation-delay` incremental |
| **Shimmer no hover** | Botões CTA (pseudo-elemento `::before` com `translateX`) |
| **Pseudo-elemento de linha** | Topo dos bento cards (aparece no hover) |
| **Transform-origin: bottom** | Animação de crescimento das barras do gráfico |

---

## Navegação

A landing não usa o `DashboardLayout`. É uma rota pública independente:

```tsx
// App.tsx
<Route path="/" element={<LandingPage />} />
<Route path="/login" element={<LoginPage />} />
```

Os botões CTA redirecionam todos para `/login` via `<Link to="/login">` do React Router.
