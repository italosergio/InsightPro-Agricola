const pptxgen = require("pptxgenjs");
const React = require("react");
const ReactDOMServer = require("react-dom/server");
const sharp = require("sharp");
const {
  FaChartBar, FaUsers, FaMapMarkerAlt, FaSeedling,
  FaBullseye, FaChartPie, FaLightbulb, FaArrowRight
} = require("react-icons/fa");

// ── Helpers ──────────────────────────────────────────────────────────
function renderIconSvg(Icon, color = "#000000", size = 256) {
  return ReactDOMServer.renderToStaticMarkup(
    React.createElement(Icon, { color, size: String(size) })
  );
}

async function iconToBase64(Icon, color, size = 256) {
  const svg = renderIconSvg(Icon, color, size);
  const buf = await sharp(Buffer.from(svg)).png().toBuffer();
  return "image/png;base64," + buf.toString("base64");
}

function hex(n) {
  const s = n.toString(16).toUpperCase();
  return s.length === 1 ? "0" + s : s;
}

// ── Theme ─────────────────────────────────────────────────────────────
const C = {
  forest:     "1B512E",   // primary dark green
  moss:       "448542",   // secondary green
  leaf:       "6EBF47",   // accent green
  cream:      "F7F7F2",   // light cream
  charcoal:   "212121",   // dark text
  warmGray:   "5C5C5C",   // muted text
  white:      "FFFFFF",
  lightGreen: "E8F5E9",   // very light green bg
  cardBg:     "FFFFFF",
  goldAccent: "D4A017",
};

// ── Reusable icon factory ─────────────────────────────────────────────
const icons = {};
async function loadIcons() {
  icons.chart  = await iconToBase64(FaChartBar,   "#" + C.leaf, 256);
  icons.users  = await iconToBase64(FaUsers,       "#" + C.leaf, 256);
  icons.map    = await iconToBase64(FaMapMarkerAlt,"#" + C.moss, 256);
  icons.seed   = await iconToBase64(FaSeedling,    "#" + C.goldAccent, 256);
  icons.target = await iconToBase64(FaBullseye,    "#" + C.moss, 256);
  icons.pie    = await iconToBase64(FaChartPie,    "#" + C.leaf, 256);
  icons.idea   = await iconToBase64(FaLightbulb,   "#" + C.goldAccent, 256);
  icons.arrow  = await iconToBase64(FaArrowRight,  "#" + C.white, 256);
}

// ── Data ──────────────────────────────────────────────────────────────
const dados = {
  totalClientes: 45,
  clientesAtivos: 28,
  clientesProspect: 11,
  clientesInativos: 6,
  faturamentoTotal: "R$ 1.87 Bi",
  potencialTotal: "R$ 93.5 Mi",
  culturasTop: [
    { nome: "Soja", pct: 42 },
    { nome: "Milho", pct: 18 },
    { nome: "Cana-de-Açúcar", pct: 12 },
    { nome: "Pecuária", pct: 15 },
    { nome: "Outras", pct: 13 },
  ],
  penetracao: [
    { produto: "AminoPlus",         clientes: 18, pct: 64 },
    { produto: "Amiorgan",          clientes: 14, pct: 50 },
    { produto: "AminoFort",         clientes: 12, pct: 43 },
    { produto: "AjiPower",          clientes: 10, pct: 36 },
    { produto: "Ajifol Premium+",   clientes: 9,  pct: 32 },
    { produto: "AminoReten",        clientes: 7,  pct: 25 },
  ],
  regional: [
    { regiao: "Sul",           pct: 18, fat: "R$ 392 Mi" },
    { regiao: "Sudeste",       pct: 17, fat: "R$ 356 Mi" },
    { regiao: "Centro-Oeste",  pct: 35, fat: "R$ 655 Mi" },
    { regiao: "Nordeste",      pct: 20, fat: "R$ 326 Mi" },
    { regiao: "Norte",         pct: 10, fat: "R$ 141 Mi" },
  ],
  abcClasses: [
    { classe: "A", pct: 20, fat: "R$ 1,12 Bi", desc: "Top 20% clientes" },
    { classe: "B", pct: 35, fat: "R$ 0,56 Bi", desc: "Médio-alto potencial" },
    { classe: "C", pct: 45, fat: "R$ 0,19 Bi", desc: "Demais clientes" },
  ],
  swot: {
    strengths:    "Equipe técnica certificada • Relacionamento com fornecedores • Carteira diversificada • Know-how em agricultura de precisão • Infraestrutura própria",
    weaknesses:   "Dependência de poucos fornecedores • Baixa presença digital • Processos manuais • Limitação de crédito • Equipe enxuta",
    opportunities:"MATOPIBA em expansão • Agricultura de precisão • Crédito de carbono • Plano Safra 25/26 • Bioinsumos em alta",
    threats:      "Oscilação de commodities • Eventos climáticos extremos • Aumento de fretes • Concorrência multinacional",
  },
};

// ── Slide builders ────────────────────────────────────────────────────

function addFooter(slide, pageNum, total) {
  slide.addText(`InsightPro Agrícola  •  ${pageNum} / ${total}`, {
    x: 0.5, y: 5.2, w: 9, h: 0.35,
    fontSize: 8, fontFace: "Calibri", color: C.warmGray, align: "center"
  });
}

// Slide 1 — Capa
function slideCapa(pres) {
  const s = pres.addSlide();
  s.background = { color: C.forest };

  // Decorative shape
  s.addShape(pres.shapes.RECTANGLE, {
    x: 0, y: 0, w: 10, h: 0.12,
    fill: { color: C.leaf }
  });
  s.addShape(pres.shapes.RECTANGLE, {
    x: 0, y: 5.505, w: 10, h: 0.12,
    fill: { color: C.leaf }
  });

  s.addText("INSIGHTPRO AGRÍCOLA", {
    x: 0.8, y: 0.6, w: 8.4, h: 0.5,
    fontSize: 13, fontFace: "Calibri", color: C.leaf,
    charSpacing: 8, align: "left"
  });

  s.addText("Inteligência de Negócios\npara o Agronegócio", {
    x: 0.8, y: 1.5, w: 8, h: 1.8,
    fontSize: 38, fontFace: "Georgia", color: C.white,
    bold: true, align: "left", lineSpacingMultiple: 1.1
  });

  s.addText("Dashboard Executivo  •  Maio 2026", {
    x: 0.8, y: 3.6, w: 8, h: 0.4,
    fontSize: 14, fontFace: "Calibri", color: C.cream
  });

  // Decorative line
  s.addShape(pres.shapes.RECTANGLE, {
    x: 0.8, y: 3.3, w: 2.5, h: 0.04,
    fill: { color: C.leaf }
  });

  s.addText("Relatório da Carteira de Clientes", {
    x: 0.8, y: 4.15, w: 8, h: 0.35,
    fontSize: 11, fontFace: "Calibri", color: C.cream, italic: true
  });
}

// Slide 2 — Visão Geral (KPIs)
function slideVisaoGeral(pres) {
  const s = pres.addSlide();
  s.background = { color: C.cream };

  s.addText("Visão Geral da Carteira", {
    x: 0.5, y: 0.3, w: 9, h: 0.6,
    fontSize: 30, fontFace: "Georgia", color: C.forest, bold: true, margin: 0
  });

  // KPIs row
  const kpis = [
    { label: "CLIENTES ATIVOS", value: "28", sub: "de 45 totais", icon: icons.users },
    { label: "FATURAMENTO",      value: "R$ 1.87 Bi", sub: "carteira anual", icon: icons.chart },
    { label: "POTENCIAL",        value: "R$ 93.5 Mi", sub: "a ser explorado", icon: icons.target },
    { label: "CULTURAS",         value: "12", sub: "diferentes", icon: icons.seed },
  ];

  const cardW = 2.05, cardH = 1.5, startX = 0.5, gap = 0.2, yKpi = 1.2;
  kpis.forEach((k, i) => {
    const cx = startX + i * (cardW + gap);
    s.addShape(pres.shapes.RECTANGLE, {
      x: cx, y: yKpi, w: cardW, h: cardH,
      fill: { color: C.white },
      shadow: { type: "outer", blur: 4, offset: 1, color: "000000", opacity: 0.06 }
    });
    s.addImage({ data: k.icon, x: cx + 0.15, y: yKpi + 0.2, w: 0.35, h: 0.35 });
    s.addText(k.label, {
      x: cx + 0.6, y: yKpi + 0.15, w: 1.3, h: 0.25,
      fontSize: 8, fontFace: "Calibri", color: C.warmGray, charSpacing: 2
    });
    s.addText(k.value, {
      x: cx + 0.15, y: yKpi + 0.7, w: 1.75, h: 0.5,
      fontSize: 26, fontFace: "Georgia", color: C.forest, bold: true
    });
    s.addText(k.sub, {
      x: cx + 0.15, y: yKpi + 1.2, w: 1.75, h: 0.2,
      fontSize: 8, fontFace: "Calibri", color: C.warmGray
    });
  });

  // Cultura pie chart
  const chartData = [{
    name: "Culturas",
    labels: dados.culturasTop.map(c => c.nome),
    values: dados.culturasTop.map(c => c.pct),
  }];
  s.addChart(pres.charts.DOUGHNUT, chartData, {
    x: 0.5, y: 3.0, w: 3.2, h: 2.4,
    showPercent: true, showLegend: true, legendPos: "r",
    legendFontSize: 8, legendColor: C.charcoal,
    chartColors: ["1B512E", "448542", "6EBF47", "97BC62", "C5E1A5"],
    dataLabelColor: C.charcoal, dataLabelFontSize: 8,
    showTitle: true, title: "Distribuição por Cultura",
    titleColor: C.forest, titleFontSize: 10,
    holeSize: 55,
  });

  // Status bar chart
  s.addChart(pres.charts.BAR, [{
    name: "Status",
    labels: ["Ativos", "Prospects", "Inativos"],
    values: [28, 11, 6],
  }], {
    x: 4.2, y: 3.0, w: 5.3, h: 2.4,
    barDir: "bar",
    chartColors: ["1B512E", "D4A017", "BBBBBB"],
    showValue: true, dataLabelColor: C.charcoal, dataLabelFontSize: 9,
    showTitle: true, title: "Status dos Clientes",
    titleColor: C.forest, titleFontSize: 10,
    showLegend: false,
    chartArea: { fill: { color: C.white }, roundedCorners: true },
    catAxisLabelColor: C.warmGray, valAxisLabelColor: C.warmGray,
    valGridLine: { color: "E2E8F0", size: 0.5 },
    catGridLine: { style: "none" },
  });

  addFooter(s, 2, 8);
}

// Slide 3 — Análise ABC
function slideABC(pres) {
  const s = pres.addSlide();
  s.background = { color: C.white };

  s.addText("Análise ABC de Clientes", {
    x: 0.5, y: 0.3, w: 9, h: 0.6,
    fontSize: 30, fontFace: "Georgia", color: C.forest, bold: true, margin: 0
  });
  s.addText("Classificação por faturamento anual", {
    x: 0.5, y: 0.85, w: 9, h: 0.3,
    fontSize: 11, fontFace: "Calibri", color: C.warmGray
  });

  // ABC cards
  const abc = dados.abcClasses;
  const cardColors = [C.forest, C.moss, "888888"];
  const cardBgColors = ["E8F5E9", "F0F7ED", "F5F5F5"];

  abc.forEach((item, i) => {
    const cy = 1.4 + i * 1.35;
    // Card bg
    s.addShape(pres.shapes.RECTANGLE, {
      x: 0.5, y: cy, w: 4.0, h: 1.15,
      fill: { color: cardBgColors[i] },
      shadow: { type: "outer", blur: 3, offset: 1, color: "000000", opacity: 0.04 }
    });
    // Left accent
    s.addShape(pres.shapes.RECTANGLE, {
      x: 0.5, y: cy, w: 0.07, h: 1.15,
      fill: { color: cardColors[i] }
    });
    // Class letter
    s.addText(item.classe, {
      x: 0.8, y: cy + 0.1, w: 0.7, h: 0.95,
      fontSize: 42, fontFace: "Georgia", color: cardColors[i], bold: true, valign: "middle"
    });
    s.addText(item.desc, {
      x: 1.6, y: cy + 0.1, w: 2.5, h: 0.3,
      fontSize: 11, fontFace: "Calibri", color: C.charcoal, bold: true
    });
    s.addText(`${item.pct}% da base  •  ${item.fat}`, {
      x: 1.6, y: cy + 0.45, w: 2.5, h: 0.5,
      fontSize: 10, fontFace: "Calibri", color: C.warmGray
    });
  });

  // Pie chart
  s.addChart(pres.charts.PIE, [{
    name: "ABC",
    labels: ["Classe A", "Classe B", "Classe C"],
    values: [20, 35, 45],
  }], {
    x: 5.0, y: 1.3, w: 4.5, h: 3.6,
    showPercent: true, showLegend: true, legendPos: "b",
    legendFontSize: 9, legendColor: C.charcoal,
    chartColors: ["1B512E", "448542", "C5E1A5"],
    dataLabelColor: C.white, dataLabelFontSize: 10,
  });

  addFooter(s, 3, 8);
}

// Slide 4 — Penetração de Produtos
function slidePenetracao(pres) {
  const s = pres.addSlide();
  s.background = { color: C.cream };

  s.addText("Penetração de Produtos", {
    x: 0.5, y: 0.3, w: 9, h: 0.6,
    fontSize: 30, fontFace: "Georgia", color: C.forest, bold: true, margin: 0
  });
  s.addText("Produtos AJINOMOTO na base de clientes ativos", {
    x: 0.5, y: 0.85, w: 9, h: 0.3,
    fontSize: 11, fontFace: "Calibri", color: C.warmGray
  });

  // Bar chart
  s.addChart(pres.charts.BAR, [{
    name: "Penetração",
    labels: dados.penetracao.map(p => p.produto),
    values: dados.penetracao.map(p => p.pct),
  }], {
    x: 0.5, y: 1.3, w: 9, h: 3.0,
    barDir: "bar",
    chartColors: ["1B512E"],
    showValue: true, dataLabelColor: C.forest, dataLabelFontSize: 10,
    dataLabelPosition: "outEnd",
    showTitle: true, title: "% de Clientes Ativos que Compram Cada Produto",
    titleColor: C.forest, titleFontSize: 10,
    showLegend: false,
    chartArea: { fill: { color: C.white }, roundedCorners: true },
    catAxisLabelColor: C.warmGray, valAxisLabelColor: C.warmGray,
    catAxisLabelFontSize: 9,
    valGridLine: { color: "E2E8F0", size: 0.5 },
    catGridLine: { style: "none" },
    valAxisMaxVal: 80,
  });

  // Insight box
  s.addShape(pres.shapes.RECTANGLE, {
    x: 0.5, y: 4.5, w: 9, h: 0.6,
    fill: { color: C.lightGreen }
  });
  s.addImage({ data: icons.idea, x: 0.7, y: 4.6, w: 0.3, h: 0.3 });
  s.addText("Oportunidade: Apenas 2 produtos ultrapassam 50% de penetração. Há espaço significativo para cross-sell.", {
    x: 1.2, y: 4.55, w: 8, h: 0.5,
    fontSize: 10, fontFace: "Calibri", color: C.forest, italic: true
  });

  addFooter(s, 4, 8);
}

// Slide 5 — Análise Territorial
function slideTerritorial(pres) {
  const s = pres.addSlide();
  s.background = { color: C.white };

  s.addText("Análise Territorial", {
    x: 0.5, y: 0.3, w: 9, h: 0.6,
    fontSize: 30, fontFace: "Georgia", color: C.forest, bold: true, margin: 0
  });

  // Bar chart
  s.addChart(pres.charts.BAR, [{
    name: "Distribuição",
    labels: dados.regional.map(r => r.regiao),
    values: dados.regional.map(r => r.pct),
  }], {
    x: 0.5, y: 1.1, w: 5.0, h: 3.0,
    barDir: "col",
    chartColors: ["1B512E", "448542", "1B512E", "448542", "97BC62"],
    showValue: true, dataLabelColor: C.charcoal, dataLabelFontSize: 9,
    dataLabelPosition: "outEnd",
    showTitle: true, title: "% de Clientes por Região",
    titleColor: C.forest, titleFontSize: 10,
    showLegend: false,
    chartArea: { fill: { color: C.white }, roundedCorners: true },
    catAxisLabelColor: C.warmGray, valAxisLabelColor: C.warmGray,
    valGridLine: { color: "E2E8F0", size: 0.5 },
    catGridLine: { style: "none" },
  });

  // Regional cards
  const cardY = 1.1;
  dados.regional.forEach((r, i) => {
    const cy = cardY + i * 0.8;
    s.addShape(pres.shapes.RECTANGLE, {
      x: 6.0, y: cy, w: 3.5, h: 0.65,
      fill: { color: C.lightGreen },
      shadow: { type: "outer", blur: 2, offset: 1, color: "000000", opacity: 0.03 }
    });
    s.addImage({ data: icons.map, x: 6.15, y: cy + 0.15, w: 0.3, h: 0.3 });
    s.addText(r.regiao, {
      x: 6.55, y: cy + 0.05, w: 1.8, h: 0.25,
      fontSize: 11, fontFace: "Calibri", color: C.forest, bold: true
    });
    s.addText(`${r.pct}% dos clientes`, {
      x: 6.55, y: cy + 0.3, w: 1.8, h: 0.25,
      fontSize: 9, fontFace: "Calibri", color: C.warmGray
    });
    s.addText(r.fat, {
      x: 8.2, y: cy + 0.1, w: 1.2, h: 0.4,
      fontSize: 14, fontFace: "Georgia", color: C.forest, bold: true,
      align: "right", valign: "middle"
    });
  });

  addFooter(s, 5, 8);
}

// Slide 6 — SWOT
function slideSWOT(pres) {
  const s = pres.addSlide();
  s.background = { color: C.cream };

  s.addText("Análise SWOT", {
    x: 0.5, y: 0.3, w: 9, h: 0.6,
    fontSize: 30, fontFace: "Georgia", color: C.forest, bold: true, margin: 0
  });

  const quadrants = [
    { title: "FORÇAS",       color: C.forest,     bg: "E8F5E9", content: dados.swot.strengths,     x: 0.5,  y: 1.15 },
    { title: "FRAQUEZAS",    color: "C62828",      bg: "FFEBEE", content: dados.swot.weaknesses,    x: 5.0,  y: 1.15 },
    { title: "OPORTUNIDADES",color: "2E7D32",      bg: "E8F5E9", content: dados.swot.opportunities, x: 0.5,  y: 3.25 },
    { title: "AMEAÇAS",      color: "C62828",      bg: "FFEBEE", content: dados.swot.threats,       x: 5.0,  y: 3.25 },
  ];

  quadrants.forEach(q => {
    s.addShape(pres.shapes.RECTANGLE, {
      x: q.x, y: q.y, w: 4.5, h: 2.0,
      fill: { color: q.bg }
    });
    // Header
    s.addShape(pres.shapes.RECTANGLE, {
      x: q.x, y: q.y, w: 4.5, h: 0.35,
      fill: { color: q.color }
    });
    s.addText(q.title, {
      x: q.x + 0.2, y: q.y, w: 4.1, h: 0.35,
      fontSize: 11, fontFace: "Calibri", color: C.white, bold: true, charSpacing: 3, margin: 0
    });
    // Content
    s.addText(q.content, {
      x: q.x + 0.2, y: q.y + 0.5, w: 4.1, h: 1.4,
      fontSize: 9, fontFace: "Calibri", color: C.charcoal, lineSpacingMultiple: 1.4
    });
  });

  addFooter(s, 6, 8);
}

// Slide 7 — Oportunidades & Gaps
function slideOportunidades(pres) {
  const s = pres.addSlide();
  s.background = { color: C.white };

  s.addText("Oportunidades & Gaps", {
    x: 0.5, y: 0.3, w: 9, h: 0.6,
    fontSize: 30, fontFace: "Georgia", color: C.forest, bold: true, margin: 0
  });
  s.addText("Potencial não explorado na carteira", {
    x: 0.5, y: 0.85, w: 9, h: 0.3,
    fontSize: 11, fontFace: "Calibri", color: C.warmGray
  });

  // Cards
  const cards = [
    { title: "Cross-Sell", value: "43%", desc: "dos clientes compram\napenas 1 produto", icon: icons.pie },
    { title: "Prospects", value: "11", desc: "clientes potenciais\nsem compras ainda", icon: icons.users },
    { title: "Gap Financeiro", value: "R$ 93.5 Mi", desc: "potencial de compra\nnão realizado", icon: icons.target },
    { title: "Inativos", value: "6", desc: "clientes que podem\nser reativados", icon: icons.seed },
  ];

  const cardW = 2.05, cardH = 2.1, gap = 0.2, startX = 0.5;
  cards.forEach((c, i) => {
    const cx = startX + i * (cardW + gap);
    s.addShape(pres.shapes.RECTANGLE, {
      x: cx, y: 1.35, w: cardW, h: cardH,
      fill: { color: i === 2 ? C.forest : C.lightGreen },
      shadow: { type: "outer", blur: 4, offset: 1, color: "000000", opacity: 0.06 }
    });
    s.addImage({ data: c.icon, x: cx + 0.15, y: 1.55, w: 0.35, h: 0.35 });
    const textColor = i === 2 ? C.white : C.forest;
    const mutedColor = i === 2 ? C.cream : C.warmGray;
    s.addText(c.title, {
      x: cx + 0.6, y: 1.55, w: 1.3, h: 0.25,
      fontSize: 9, fontFace: "Calibri", color: mutedColor, charSpacing: 2
    });
    s.addText(c.value, {
      x: cx + 0.15, y: 2.15, w: 1.75, h: 0.5,
      fontSize: 22, fontFace: "Georgia", color: textColor, bold: true
    });
    s.addText(c.desc, {
      x: cx + 0.15, y: 2.75, w: 1.75, h: 0.5,
      fontSize: 9, fontFace: "Calibri", color: mutedColor, lineSpacingMultiple: 1.3
    });
  });

  // Bottom insight
  s.addShape(pres.shapes.RECTANGLE, {
    x: 0.5, y: 3.8, w: 9, h: 1.3,
    fill: { color: C.forest }
  });
  s.addText("AÇÕES RECOMENDADAS", {
    x: 0.8, y: 3.9, w: 8.4, h: 0.3,
    fontSize: 10, fontFace: "Calibri", color: C.leaf, bold: true, charSpacing: 3
  });
  const acoes = [
    "1. Implementar programa de cross-sell para clientes mono-produto",
    "2. Criar jornada de ativação para os 11 prospects da carteira",
    "3. Priorizar follow-up nos 6 clientes inativos dos últimos 6 meses",
    "4. Estruturar campanhas regionais focadas no Centro-Oeste (35% da base)",
  ];
  s.addText(acoes.map((a, i) => ({
    text: a,
    options: { breakLine: i < acoes.length - 1, fontSize: 10, fontFace: "Calibri", color: C.white }
  })), {
    x: 0.8, y: 4.25, w: 8.4, h: 0.8,
    lineSpacingMultiple: 1.3
  });

  addFooter(s, 7, 8);
}

// Slide 8 — Conclusão / Encerramento
function slideConclusao(pres) {
  const s = pres.addSlide();
  s.background = { color: C.forest };

  s.addShape(pres.shapes.RECTANGLE, {
    x: 0, y: 0, w: 10, h: 0.12, fill: { color: C.leaf }
  });
  s.addShape(pres.shapes.RECTANGLE, {
    x: 0, y: 5.505, w: 10, h: 0.12, fill: { color: C.leaf }
  });

  s.addText("PRÓXIMOS PASSOS", {
    x: 1, y: 0.6, w: 8, h: 0.4,
    fontSize: 12, fontFace: "Calibri", color: C.leaf, charSpacing: 6
  });

  s.addText("Crescendo juntos\nno campo.", {
    x: 1, y: 1.4, w: 8, h: 1.5,
    fontSize: 38, fontFace: "Georgia", color: C.white, bold: true, lineSpacingMultiple: 1.1
  });

  s.addShape(pres.shapes.RECTANGLE, {
    x: 1, y: 3.2, w: 2.5, h: 0.04, fill: { color: C.leaf }
  });

  s.addText([
    { text: "Plataforma InsightPro Agrícola", options: { fontSize: 14, color: C.cream, breakLine: true } },
    { text: "contato@insightproagricola.com.br", options: { fontSize: 11, color: C.cream } },
  ], {
    x: 1, y: 3.5, w: 8, h: 0.6, fontFace: "Calibri"
  });
}

// ── Main ──────────────────────────────────────────────────────────────
async function main() {
  await loadIcons();

  const pres = new pptxgen();
  pres.layout = "LAYOUT_16x9";
  pres.author = "InsightPro Agrícola";
  pres.title = "InsightPro Agrícola - Dashboard Executivo";
  pres.subject = "Relatório da Carteira de Clientes";

  slideCapa(pres);
  slideVisaoGeral(pres);
  slideABC(pres);
  slidePenetracao(pres);
  slideTerritorial(pres);
  slideSWOT(pres);
  slideOportunidades(pres);
  slideConclusao(pres);

  const fileName = "InsightPro-Agricola-Dashboard-Maio2026.pptx";
  await pres.writeFile({ fileName });
  console.log(`✅ Apresentação gerada: ${fileName}`);
}

main().catch(err => { console.error("❌ Erro:", err); process.exit(1); });
