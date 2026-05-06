import { Link } from 'react-router-dom'
import {
  Sprout,
  BarChart3,
  Zap,
  Map,
  FileUp,
  Wheat,
  Bot,
  FolderOpen,
  Search,
  TrendingUp,
  Sun,
  Moon,
  Play,
  Check,
  Star,
  ArrowRight,
} from 'lucide-react'
import { useTheme } from '@/store/ThemeContext'
import '@/styles/landing.css'

/* ---- Data ---- */

const features = [
  {
    icon: <BarChart3 size={28} />,
    iconColor: '#22c55e',
    title: 'Análise ABC de Clientes',
    desc: 'Segmentação automática por faturamento, frequência e potencial. Identifique seus clientes A, B e C com precisão matemática e direcione esforços onde realmente importa.',
    accent: 'b-accent-green',
    col: 'b-col-7',
    visual: 'abc',
  },
  {
    icon: <Zap size={28} />,
    iconColor: '#10b981',
    title: 'Dashboard em Tempo Real',
    desc: 'KPIs dinâmicos, gráficos interativos e alertas inteligentes. Decisões baseadas em dados frescos, não em relatórios de ontem.',
    accent: 'b-accent-emerald',
    col: 'b-col-5',
    visual: null,
  },
  {
    icon: <Map size={28} />,
    iconColor: '#a3e635',
    title: 'Mapeamento Geográfico',
    desc: 'Visualize a distribuição de clientes por município, estado e região. Descubra lacunas de mercado e oportunidades de expansão em segundos.',
    accent: 'b-accent-lime',
    col: 'b-col-5',
    visual: null,
  },
  {
    icon: <FileUp size={28} />,
    iconColor: '#3b82f6',
    title: 'Exportação Profissional',
    desc: 'Relatórios prontos para apresentação em PDF, Excel, PowerPoint e CSV. Do dado bruto à apresentação executiva em poucos cliques.',
    accent: 'b-accent-blue',
    col: 'b-col-7',
    visual: 'export',
  },
  {
    icon: <Wheat size={28} />,
    iconColor: '#f59e0b',
    title: 'Gestão de Portfólio',
    desc: 'Controle de produtos, safras e campanhas. Analise o mix de vendas e otimize sua oferta por perfil de cliente e região.',
    accent: 'b-accent-amber',
    col: 'b-col-6',
    visual: null,
  },
  {
    icon: <Bot size={28} />,
    iconColor: '#22c55e',
    title: 'Inteligência de Mercado',
    desc: 'Tendências, previsões e análises comparativas geradas a partir dos seus dados históricos. Antecipe o mercado antes da concorrência.',
    accent: 'b-accent-green',
    col: 'b-col-6',
    visual: null,
  },
]

const abcData = [
  { label: 'A', color: '#22c55e', bgColor: 'rgba(34,197,94,0.12)',   width: '78%', count: '127 clientes · 72% receita' },
  { label: 'B', color: '#4ade80', bgColor: 'rgba(74,222,128,0.1)',   width: '52%', count: '284 clientes · 20% receita' },
  { label: 'C', color: '#86efac', bgColor: 'rgba(134,239,172,0.08)', width: '26%', count: '421 clientes · 8% receita' },
]

const exportFormats = [
  { ext: 'PDF',  color: '#ef4444' },
  { ext: 'XLSX', color: '#22c55e' },
  { ext: 'PPTX', color: '#f59e0b' },
  { ext: 'CSV',  color: '#3b82f6' },
]

const stats = [
  { value: '500+',   label: 'Clientes Ativos' },
  { value: 'R$2.8B', label: 'em Vendas Gerenciadas' },
  { value: '98%',    label: 'Taxa de Satisfação' },
  { value: '12',     label: 'Módulos Especializados' },
]

const steps = [
  {
    icon: <FolderOpen size={30} />,
    title: 'Importe seus Dados',
    desc: 'Carregue arquivos CSV, Excel ou conecte ao seu ERP. O sistema organiza e higieniza tudo automaticamente, sem esforço manual.',
  },
  {
    icon: <Search size={30} />,
    title: 'Analise com Inteligência',
    desc: 'Algoritmos de segmentação processam seus dados e entregam insights acionáveis em segundos. Sem configuração técnica necessária.',
  },
  {
    icon: <TrendingUp size={30} />,
    title: 'Tome Decisões Estratégicas',
    desc: 'Compartilhe relatórios, alinhe sua equipe e implemente estratégias com confiança total nos números por trás de cada decisão.',
  },
]

const testimonials = [
  {
    stars: 5,
    text: '"O InsightPro transformou nossa forma de gerenciar clientes. Em 3 meses, aumentamos retenção em 34% e descobrimos mercados que nem sabíamos que existiam."',
    name: 'Carlos Mendonça',
    role: 'Gerente Comercial — AgroForte Sul',
    initials: 'CM',
  },
  {
    stars: 5,
    text: '"Antes gastávamos dias preparando relatórios. Hoje geramos análises completas em minutos e apresentamos para a diretoria com confiança total nos dados."',
    name: 'Ana Paula Ribeiro',
    role: 'Diretora de Vendas — NutriCrop Agrícola',
    initials: 'AP',
  },
  {
    stars: 5,
    text: '"A análise ABC foi um divisor de águas. Focamos nos clientes certos e crescemos 41% no faturamento sem precisar aumentar o time comercial."',
    name: 'Roberto Figueiredo',
    role: 'CEO — Campo Verde Distribuidora',
    initials: 'RF',
  },
]

const barHeights = [42, 68, 54, 82, 70, 91, 60, 77]

const mockupABC = [
  { label: 'A', color: '#22c55e', width: '72%' },
  { label: 'B', color: '#4ade80', width: '48%' },
  { label: 'C', color: '#86efac', width: '22%' },
]

const trustItems = [
  'Sem custo inicial',
  'Dados 100% seguros',
  'Suporte dedicado',
]

const ctaTrustItems = [
  'Sem cartão de crédito',
  'Setup em 5 minutos',
  'Suporte em português',
  'LGPD compliance',
]

/* ---- Logo ---- */

function LogoIcon() {
  return (
    <div className="l-logo-icon">
      <Sprout size={20} color="#fff" strokeWidth={2.5} />
    </div>
  )
}

/* ---- Component ---- */

export function LandingPage() {
  const { theme, toggleTheme } = useTheme()
  const isDark = theme === 'dark'

  return (
    <div className={`landing-root ${isDark ? 'landing-dark' : 'landing-light'}`}>

      {/* ── NAVBAR ── */}
      <nav className="l-nav">
        <div className="l-logo">
          <LogoIcon />
          <div className="l-logo-text">
            <span className="l-logo-name">InsightPro</span>
            <span className="l-logo-sub">Agrícola</span>
          </div>
        </div>

        <div className="l-nav-right">
          <button onClick={toggleTheme} className="l-theme-btn" aria-label="Alternar tema">
            {isDark ? <Sun size={16} /> : <Moon size={16} />}
          </button>
          <Link to="/login" className="l-nav-cta">
            <span>Acessar Plataforma</span>
            <ArrowRight size={15} />
          </Link>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section className="l-hero">
        <div className="hero-blob hero-blob-1" />
        <div className="hero-blob hero-blob-2" />
        <div className="hero-blob hero-blob-3" />
        <div className="hero-grid" />

        <div className="l-hero-body">

          {/* Left */}
          <div className="hero-left">
            <div className="hero-badge">
              <span className="hero-badge-dot" />
              Plataforma AgTech nº 1 do Brasil
            </div>

            <h1 className="hero-h1">
              Inteligência que{' '}
              <span className="hero-h1-grad">transforma</span>{' '}
              o campo
            </h1>

            <p className="hero-sub">
              Plataforma completa de análise e gestão de clientes para o agronegócio.
              Segmentação ABC, dashboards em tempo real, mapas e relatórios profissionais
              — tudo integrado, tudo simples.
            </p>

            <div className="hero-actions">
              <Link to="/login" className="btn-hero-primary">
                Acessar Plataforma
                <ArrowRight size={18} />
              </Link>
              <Link to="/login" className="btn-hero-ghost">
                <Play size={14} fill="currentColor" />
                Ver demonstração
              </Link>
            </div>

            <div className="hero-trust">
              {trustItems.map(item => (
                <div key={item} className="hero-trust-item">
                  <span className="hero-trust-check">
                    <Check size={10} strokeWidth={3} />
                  </span>
                  {item}
                </div>
              ))}
            </div>
          </div>

          {/* Right: dashboard mockup */}
          <div className="hero-right">
            <div className="float-card float-card-1">
              <div className="float-card-val">R$ 12.4M</div>
              <div className="float-card-lbl">Receita Total</div>
              <div className="float-card-chg chg-up">
                <TrendingUp size={11} /> +14.3% vs mês anterior
              </div>
            </div>

            <div className="float-card float-card-2">
              <div className="float-card-val">2.847</div>
              <div className="float-card-lbl">Clientes Ativos</div>
              <div className="float-card-chg chg-up">
                <TrendingUp size={11} /> +8.2% esse trimestre
              </div>
            </div>

            <div className="float-card float-card-3">
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{
                  width: 8, height: 8, borderRadius: '50%',
                  background: '#22c55e', display: 'inline-block', flexShrink: 0,
                }} />
                <span className="float-card-lbl" style={{ margin: 0 }}>Dados atualizados</span>
              </div>
              <div className="float-card-val" style={{ fontSize: '0.9rem', marginTop: 4 }}>
                Há 3 minutos
              </div>
            </div>

            <div className="dash-mockup">
              <div className="dash-topbar">
                <div className="dash-dots">
                  <div className="dash-dot dash-dot-r" />
                  <div className="dash-dot dash-dot-y" />
                  <div className="dash-dot dash-dot-g" />
                </div>
                <div className="dash-tab">InsightPro Agrícola — Dashboard</div>
              </div>

              <div className="dash-body">
                <div className="dash-kpis">
                  <div className="dash-kpi">
                    <div className="dash-kpi-lbl">Receita</div>
                    <div className="dash-kpi-val">R$12.4M</div>
                    <div className="dash-kpi-chg">+14.3%</div>
                  </div>
                  <div className="dash-kpi">
                    <div className="dash-kpi-lbl">Clientes</div>
                    <div className="dash-kpi-val">2.847</div>
                    <div className="dash-kpi-chg">+8.2%</div>
                  </div>
                  <div className="dash-kpi">
                    <div className="dash-kpi-lbl">Ticket Médio</div>
                    <div className="dash-kpi-val">R$4.36K</div>
                    <div className="dash-kpi-chg">+5.1%</div>
                  </div>
                </div>

                <div className="dash-chart">
                  <div className="dash-chart-hdr">
                    <span className="dash-chart-title">Vendas Mensais (2024)</span>
                    <span className="dash-chart-pill">+23% YoY</span>
                  </div>
                  <div className="dash-bars">
                    {barHeights.map((h, i) => (
                      <div
                        key={i}
                        className="dash-bar"
                        style={{ height: `${h}%`, animationDelay: `${i * 0.09}s` }}
                      />
                    ))}
                  </div>
                </div>

                <div className="dash-bottom">
                  <div className="dash-mini-card">
                    <div className="dash-mini-title">Top Clientes</div>
                    {['Agro São Paulo', 'Fazenda Norte', 'Campo Verde'].map(n => (
                      <div key={n} className="dash-mini-row">
                        <span>{n}</span>
                        <span className="dash-mini-val">A</span>
                      </div>
                    ))}
                  </div>
                  <div className="dash-mini-card">
                    <div className="dash-mini-title">Análise ABC</div>
                    {mockupABC.map(({ label, color, width }) => (
                      <div key={label} className="dash-abc-row">
                        <span className="dash-abc-lbl" style={{ color }}>{label}</span>
                        <div className="dash-abc-track">
                          <div className="dash-abc-fill" style={{ width, background: color }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats bar */}
        <div className="l-stats-bar">
          <div className="l-stats-inner">
            {stats.map(({ value, label }) => (
              <div key={label} className="stat-item">
                <div className="stat-val">{value}</div>
                <div className="stat-lbl">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES BENTO ── */}
      <section className="l-section">
        <div className="l-inner">
          <div className="sec-header">
            <span className="sec-eyebrow">Recursos da Plataforma</span>
            <h2 className="sec-title">
              Tudo que seu agronegócio<br />precisa em um só lugar
            </h2>
            <p className="sec-sub">
              Do upload de dados à tomada de decisão estratégica — ferramentas
              especializadas construídas para o agronegócio moderno.
            </p>
          </div>

          <div className="bento">
            {features.map((f) => (
              <div key={f.title} className={`bento-card ${f.accent} ${f.col}`}>
                <span className="b-icon" style={{ color: f.iconColor }}>{f.icon}</span>
                <h3 className="b-title">{f.title}</h3>
                <p className="b-desc">{f.desc}</p>

                {f.visual === 'abc' && (
                  <div className="b-visual">
                    {abcData.map(({ label, color, bgColor, width, count }) => (
                      <div key={label} className="b-abc-row">
                        <span className="b-abc-label" style={{ color }}>{label}</span>
                        <div className="b-abc-track">
                          <div
                            className="b-abc-fill"
                            style={{ width, background: color, boxShadow: `0 0 8px ${bgColor}` }}
                          />
                        </div>
                        <span className="b-abc-count">{count}</span>
                      </div>
                    ))}
                  </div>
                )}

                {f.visual === 'export' && (
                  <div className="b-visual">
                    <div className="b-export-chips">
                      {exportFormats.map(({ ext, color }) => (
                        <div
                          key={ext}
                          className="b-chip"
                          style={{
                            background: `${color}14`,
                            border: `1px solid ${color}38`,
                            color,
                          }}
                        >
                          {ext}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="l-section-alt">
        <div className="l-inner">
          <div className="sec-header">
            <span className="sec-eyebrow">Como Funciona</span>
            <h2 className="sec-title">
              Do dado bruto à<br />decisão estratégica
            </h2>
            <p className="sec-sub">
              Três passos para transformar sua operação comercial com dados reais
              do campo.
            </p>
          </div>

          <div className="l-process-steps">
            <div className="l-process-line" />
            {steps.map((s, i) => (
              <div key={s.title} className="process-step">
                <div className="process-num" style={{ color: '#fff' }}>
                  {s.icon}
                </div>
                <h3 className="process-step-title">{`0${i + 1}. ${s.title}`}</h3>
                <p className="process-step-desc">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section className="l-section">
        <div className="l-inner">
          <div className="sec-header">
            <span className="sec-eyebrow">Quem usa, aprova</span>
            <h2 className="sec-title">
              Resultados reais de<br />quem já transformou o campo
            </h2>
            <p className="sec-sub">
              Veja como gestores e diretores de grandes operações agrícolas usam
              o InsightPro para crescer com consistência.
            </p>
          </div>

          <div className="testimonials-grid">
            {testimonials.map((t) => (
              <div key={t.name} className="t-card">
                <div style={{ display: 'flex', gap: 3, alignItems: 'center' }}>
                  {Array.from({ length: t.stars }, (_, i) => (
                    <Star key={i} size={14} fill="#f59e0b" stroke="none" />
                  ))}
                </div>
                <p className="t-text">{t.text}</p>
                <div className="t-author">
                  <div className="t-avatar">{t.initials}</div>
                  <div>
                    <div className="t-name">{t.name}</div>
                    <div className="t-role">{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ── */}
      <section className="l-cta-final">
        <div className="cta-bg" />
        <div className="cta-blob-a" />
        <div className="cta-blob-b" />
        <div className="cta-content">
          <h2 className="cta-final-title">
            Pronto para transformar<br />seus dados em lucro?
          </h2>
          <p className="cta-final-sub">
            Junte-se a centenas de gestores que já usam o InsightPro para tomar
            decisões mais rápidas, precisas e lucrativas no agronegócio.
          </p>
          <Link to="/login" className="btn-cta-white">
            Começar agora — é grátis
            <ArrowRight size={18} />
          </Link>
          <div className="cta-trust-row">
            {ctaTrustItems.map(item => (
              <div key={item} className="cta-trust-item">
                <Check size={13} className="cta-trust-icon" strokeWidth={2.5} />
                {item}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="l-footer">
        <div className="footer-inner">
          <div className="footer-top">
            <div>
              <div className="l-logo">
                <LogoIcon />
                <div className="l-logo-text">
                  <span style={{ fontWeight: 700, fontSize: '0.95rem', color: '#fff' }}>InsightPro</span>
                  <span style={{ fontSize: '0.6rem', color: '#22c55e', textTransform: 'uppercase', letterSpacing: '0.12em', fontWeight: 700 }}>Agrícola</span>
                </div>
              </div>
              <p className="footer-brand-desc">
                Plataforma de inteligência comercial especializada no agronegócio brasileiro.
                Dados que movem o campo.
              </p>
            </div>

            <div className="footer-links-wrap">
              <div>
                <div className="footer-col-title">Produto</div>
                <ul className="footer-link-list">
                  <li><Link to="/login" className="footer-link">Dashboard</Link></li>
                  <li><Link to="/login" className="footer-link">Análise ABC</Link></li>
                  <li><Link to="/login" className="footer-link">Relatórios</Link></li>
                  <li><Link to="/login" className="footer-link">Mapa de Clientes</Link></li>
                </ul>
              </div>
              <div>
                <div className="footer-col-title">Empresa</div>
                <ul className="footer-link-list">
                  <li><span className="footer-link">Sobre Nós</span></li>
                  <li><span className="footer-link">Blog</span></li>
                  <li><span className="footer-link">Contato</span></li>
                  <li><span className="footer-link">Carreiras</span></li>
                </ul>
              </div>
              <div>
                <div className="footer-col-title">Legal</div>
                <ul className="footer-link-list">
                  <li><span className="footer-link">Privacidade</span></li>
                  <li><span className="footer-link">Termos de Uso</span></li>
                  <li><span className="footer-link">LGPD</span></li>
                  <li><span className="footer-link">Segurança</span></li>
                </ul>
              </div>
            </div>
          </div>

          <div className="footer-bottom">
            <span className="footer-copy">
              © 2024 InsightPro Agrícola. Todos os direitos reservados.
            </span>
            <div className="footer-pills">
              <span className="footer-pill">LGPD</span>
              <span className="footer-pill">ISO 27001</span>
              <span className="footer-pill">99.9% Uptime</span>
            </div>
          </div>
        </div>
      </footer>

    </div>
  )
}
