// ============================================
// InsightPro Agricola - Application Logic
// ============================================

// Global state
let rawData = [];
let filteredData = [];
let produtos = [];
let gutData = [];
let swotData = {};
let contatosData = [];
let pestData = {};
let csData = [];
let mksData = [];
let vpmData = [];
let diagnosisData = [];
let charts = {};

const CHART_COLORS = [
  '#22c55e', '#f59e0b', '#ef4444', '#3b82f6', '#a855f7',
  '#10b981', '#f97316', '#6366f1', '#ec4899', '#14b8a6'
];

// Page titles mapping
const PAGE_TITLES = {
  dashboard: { title: 'Dashboard', subtitle: 'Visao geral da carteira de clientes' },
  upload: { title: 'Importar Dados', subtitle: 'Carregue arquivos CSV ou Excel' },
  clientes: { title: 'Clientes', subtitle: 'Lista e gestao de clientes' },
  cadastro: { title: 'Novo Cliente', subtitle: 'Cadastre um novo cliente' },
  contatos: { title: 'Contatos', subtitle: 'Gestao de contatos e visitas' },
  penetracao: { title: 'Penetracao', subtitle: 'Analise de penetracao de produtos' },
  abc: { title: 'Classificacao ABC', subtitle: 'Priorizacao de clientes' },
  cultura: { title: 'Cultura', subtitle: 'Analise por tipo de cultura' },
  oportunidades: { title: 'Oportunidades', subtitle: 'Matriz de oportunidades' },
  territorial: { title: 'Territorial', subtitle: 'Analise por regiao' },
  gaps: { title: 'Gaps', subtitle: 'Oportunidades de crescimento' },
  fidelizacao: { title: 'Fidelizacao', subtitle: 'Analise de retencao' },
  swot: { title: 'Analise SWOT', subtitle: 'Forcas, fraquezas, oportunidades e ameacas' },
  gut: { title: 'Matriz GUT', subtitle: 'Gravidade, urgencia e tendencia' },
  pest: { title: 'Analise PEST', subtitle: 'Fatores macro-ambientais' },
  diagnostico: { title: 'Diagnostico', subtitle: 'Diagrama de Ishikawa' },
  produtos: { title: 'Produtos', subtitle: 'Catalogo de produtos' },
  relatorios: { title: 'Relatorios', subtitle: 'Exportacao e backup' }
};

// ============================================
// Initialization
// ============================================
document.addEventListener('DOMContentLoaded', () => {
  setupNavigation();
  setupSidebar();
  setupEventListeners();
  setupTheme();
  loadSavedData();
});

// ============================================
// Navigation
// ============================================
function setupNavigation() {
  const navItems = document.querySelectorAll('.nav-item');

  navItems.forEach(item => {
    item.addEventListener('click', () => {
      const section = item.dataset.section;
      if (!section) return;

      // Update active nav
      navItems.forEach(n => {
        n.classList.remove('active');
        n.removeAttribute('aria-current');
      });
      item.classList.add('active');
      item.setAttribute('aria-current', 'page');

      // Update active section
      document.querySelectorAll('.page-section').forEach(s => s.classList.remove('active'));
      const target = document.getElementById(section);
      if (target) target.classList.add('active');

      // Update header
      const pageInfo = PAGE_TITLES[section];
      if (pageInfo) {
        document.getElementById('pageTitle').textContent = pageInfo.title;
        document.getElementById('pageSubtitle').textContent = pageInfo.subtitle;
      }

      // Close sidebar on mobile
      document.getElementById('sidebar').classList.remove('open');
      document.getElementById('mobileMenuBtn').setAttribute('aria-expanded', 'false');

      // Refresh data for section
      if (rawData.length > 0) {
        setTimeout(() => refreshSection(section), 50);
      }
    });
  });
}

function refreshSection(section) {
  const refreshMap = {
    dashboard: updateOverview,
    clientes: () => {},
    penetracao: updatePenetracao,
    abc: updateABC,
    cultura: updateCultura,
    oportunidades: updateOportunidades,
    territorial: updateTerritorial,
    gaps: updateGaps,
    fidelizacao: updateFidelizacao,
    swot: updateSWOTStrategies,
    gut: updateGutAnalysis,
    pest: updatePESTTable,
    diagnostico: updateDiagnosisHistory,
    produtos: atualizarTabelaProdutos
  };
  if (refreshMap[section]) refreshMap[section]();
}

// ============================================
// Sidebar
// ============================================
function setupSidebar() {
  const sidebar = document.getElementById('sidebar');
  const closeBtn = document.getElementById('sidebarClose');
  const mobileBtn = document.getElementById('mobileMenuBtn');

  mobileBtn?.addEventListener('click', () => {
    sidebar.classList.toggle('open');
    mobileBtn.setAttribute('aria-expanded', sidebar.classList.contains('open'));
  });

  closeBtn?.addEventListener('click', () => {
    sidebar.classList.remove('open');
    mobileBtn?.setAttribute('aria-expanded', 'false');
  });

  // Close sidebar on outside click (mobile)
  document.addEventListener('click', (e) => {
    if (window.innerWidth <= 768 && sidebar.classList.contains('open')) {
      if (!sidebar.contains(e.target) && e.target !== mobileBtn) {
        sidebar.classList.remove('open');
        mobileBtn?.setAttribute('aria-expanded', 'false');
      }
    }
  });
}

// ============================================
// Theme
// ============================================
function setupTheme() {
  const toggle = document.getElementById('themeToggle');
  const savedTheme = localStorage.getItem('theme');

  if (savedTheme) {
    document.documentElement.setAttribute('data-theme', savedTheme);
  }

  toggle?.addEventListener('click', () => {
    const current = document.documentElement.getAttribute('data-theme');
    const next = current === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('theme', next);
  });
}

// ============================================
// Event Listeners
// ============================================
function setupEventListeners() {
  // File upload
  const fileInput = document.getElementById('fileInput');
  const uploadArea = document.getElementById('uploadArea');

  fileInput?.addEventListener('change', handleFileUpload);
  uploadArea?.addEventListener('click', () => fileInput?.click());
  uploadArea?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      fileInput?.click();
    }
  });
  uploadArea?.addEventListener('dragover', (e) => {
    e.preventDefault();
    uploadArea.classList.add('dragover');
  });
  uploadArea?.addEventListener('dragleave', () => uploadArea.classList.remove('dragover'));
  uploadArea?.addEventListener('drop', (e) => {
    e.preventDefault();
    uploadArea.classList.remove('dragover');
    const file = e.dataTransfer.files[0];
    if (file) processFile(file);
  });

  // Buttons
  document.getElementById('downloadTemplate')?.addEventListener('click', downloadTemplate);
  document.getElementById('applyFilters')?.addEventListener('click', applyFilters);
  document.getElementById('exportCarteira')?.addEventListener('click', exportCarteira);
  document.getElementById('exportABC')?.addEventListener('click', exportABC);
  document.getElementById('exportOportunidades')?.addEventListener('click', exportOportunidades);
  document.getElementById('addGutItem')?.addEventListener('click', addGutItem);
  document.getElementById('exportGut')?.addEventListener('click', exportGut);
  document.getElementById('saveSWOT')?.addEventListener('click', saveSWOT);
  document.getElementById('addContato')?.addEventListener('click', addContato);
  document.getElementById('exportContatos')?.addEventListener('click', exportContatos);
  document.getElementById('addClienteData')?.addEventListener('click', addNewItems);
  document.getElementById('resetCadastroForm')?.addEventListener('click', resetCadastroForm);
  document.getElementById('savePEST')?.addEventListener('click', savePEST);
  document.getElementById('addCSRecord')?.addEventListener('click', addCSRecord);
  document.getElementById('exportCS')?.addEventListener('click', exportCS);
  document.getElementById('addMksRecord')?.addEventListener('click', addMksRecord);
  document.getElementById('exportMks')?.addEventListener('click', exportMks);
  document.getElementById('addVpmData')?.addEventListener('click', addVpmData);
  document.getElementById('saveDiagnosis')?.addEventListener('click', saveDiagnosis);
  document.getElementById('exportDiagnosis')?.addEventListener('click', exportDiagnosis);
  document.getElementById('exportBackup')?.addEventListener('click', () => db.export());
  document.getElementById('importBackupBtn')?.addEventListener('click', () => document.getElementById('importBackup')?.click());
  document.getElementById('importBackup')?.addEventListener('change', handleBackupImport);
  document.getElementById('salvarProduto')?.addEventListener('click', salvarProduto);
  document.getElementById('limparProduto')?.addEventListener('click', limparFormularioProduto);
  document.getElementById('exportProdutos')?.addEventListener('click', exportarProdutos);
  document.getElementById('productSearch')?.addEventListener('input', filterProducts);
  document.getElementById('productSearch')?.addEventListener('focus', showProductList);
  document.getElementById('selectAllProducts')?.addEventListener('click', selectAllProducts);
  document.getElementById('clearAllProducts')?.addEventListener('click', clearAllProducts);
  document.addEventListener('click', hideProductListOnClickOutside);
  document.getElementById('logoutBtn')?.addEventListener('click', logout);

  // PDF buttons
  ['overview', 'penetracao', 'abc', 'cultura', 'territorial', 'gaps', 'swot', 'gut', 'fidelizacao'].forEach(tab => {
    const btn = document.getElementById(tab + 'PDF');
    btn?.addEventListener('click', () => generateTabPDF(tab));
  });
  document.getElementById('generatePDFReport')?.addEventListener('click', generatePDFReport);
  document.getElementById('generateQuickPDF')?.addEventListener('click', generateQuickPDF);

  // Set default dates
  setDefaultDates();
  updateDBStats();
}

// ============================================
// Toast Notifications
// ============================================
function showToast(message, type = 'info') {
  const container = document.getElementById('toastContainer');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `toast toast--${type}`;
  toast.setAttribute('role', 'status');
  toast.textContent = message;
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    setTimeout(() => toast.remove(), 200);
  }, 4000);
}

// ============================================
// File Processing
// ============================================
function handleFileUpload(event) {
  const file = event.target.files[0];
  if (file) processFile(file);
}

function processFile(file) {
  const fileStatus = document.getElementById('fileStatus');
  if (fileStatus) {
    fileStatus.style.display = 'block';
    fileStatus.style.padding = '0.75rem 1rem';
    fileStatus.style.borderRadius = 'var(--radius-md)';
    fileStatus.style.background = 'var(--color-info-bg)';
    fileStatus.style.color = 'var(--color-info)';
    fileStatus.style.fontSize = 'var(--text-sm)';
    fileStatus.textContent = 'Processando arquivo...';
  }

  const ext = file.name.split('.').pop().toLowerCase();

  if (ext === 'csv') {
    Papa.parse(file, {
      header: true,
      dynamicTyping: true,
      skipEmptyLines: true,
      complete: (results) => processData(results.data),
      error: (error) => showFileError('Erro ao ler CSV: ' + error.message)
    });
  } else if (ext === 'xlsx' || ext === 'xls') {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
        processData(XLSX.utils.sheet_to_json(firstSheet));
      } catch (error) {
        showFileError('Erro ao ler Excel: ' + error.message);
      }
    };
    reader.readAsArrayBuffer(file);
  } else {
    showFileError('Formato nao suportado. Use CSV ou Excel.');
  }
}

function showFileError(message) {
  const fileStatus = document.getElementById('fileStatus');
  if (fileStatus) {
    fileStatus.style.display = 'block';
    fileStatus.style.padding = '0.75rem 1rem';
    fileStatus.style.borderRadius = 'var(--radius-md)';
    fileStatus.style.background = 'var(--color-error-bg)';
    fileStatus.style.color = 'var(--color-error)';
    fileStatus.style.fontSize = 'var(--text-sm)';
    fileStatus.textContent = message;
  }
}

function processData(data) {
  const fileStatus = document.getElementById('fileStatus');

  if (!data || data.length === 0) {
    showFileError('Arquivo vazio ou sem dados validos.');
    return;
  }

  const columns = Object.keys(data[0]);
  const required = ['ID_Cliente', 'Nome_Cliente', 'Cultura', 'Area_Hectares'];
  const missing = required.filter(col => !columns.includes(col));
  if (missing.length > 0) {
    showFileError('Colunas obrigatorias faltando: ' + missing.join(', '));
    return;
  }

  // Product mapping
  const productMapping = {
    'Amino_Plus': 'AminoPlus', 'Amino_Arginine': 'Amino Arginine', 'Amino_Proline': 'Amino Proline',
    'Amino_Fort': 'AminoFort', 'Amino_Reten': 'AminoReten', 'Amiorgan': 'Amiorgan',
    'Ajipower': 'AjiPower', 'Ajifol_Kmg': 'Ajifol K-Mg', 'Ajifol_Premium_Plus': 'Ajifol Premium+',
    'Ajifol_SM_Boro': 'Ajifol SM-Boro', 'Algen_Max': 'AlgenMax', 'Bokashi': 'Bokashi'
  };

  produtos = [];
  Object.keys(productMapping).forEach(prodKey => {
    const found = columns.find(col =>
      col === prodKey || col === prodKey.replace(/_/g, ' ') || col === prodKey.replace(/_/g, '')
    );
    if (found) {
      produtos.push({ column: found, key: prodKey, display: productMapping[prodKey] });
    }
  });

  if (produtos.length === 0) {
    const genericProducts = columns.filter(col => col.startsWith('Produto_'));
    if (genericProducts.length > 0) {
      produtos = genericProducts.map(col => ({ column: col, key: col, display: col.replace('Produto_', 'Produto ') }));
    }
  }

  if (produtos.length === 0) {
    showFileError('Nenhuma coluna de produto encontrada.');
    return;
  }

  rawData = data.filter(row => row.ID_Cliente && row.Nome_Cliente && row.Cultura && row.Area_Hectares !== null)
    .map(row => {
      const cleanRow = {
        ID_Cliente: row.ID_Cliente,
        Nome_Cliente: String(row.Nome_Cliente).trim(),
        Cultura: String(row.Cultura).trim(),
        Area_Hectares: parseFloat(row.Area_Hectares),
        Status_Cliente: row.Status_Cliente || 'Ativo',
        Regiao: row.Regiao || 'Nao informado',
        produtos: {}
      };
      produtos.forEach(prod => {
        cleanRow.produtos[prod.key] = row[prod.column] === 1 || row[prod.column] === '1' ? 1 : 0;
      });
      return cleanRow;
    });

  if (rawData.length === 0) {
    showFileError('Nenhum dado valido encontrado.');
    return;
  }

  filteredData = [...rawData];

  if (fileStatus) {
    fileStatus.style.background = 'var(--color-success-bg)';
    fileStatus.style.color = 'var(--color-success)';
    fileStatus.textContent = rawData.length + ' clientes carregados com sucesso!';
  }

  showToast(rawData.length + ' clientes carregados com sucesso!', 'success');
  showDataPreview(rawData.slice(0, 10));
  initializeFilters();
  updateAllAnalyses();
}

function showDataPreview(data) {
  const preview = document.getElementById('dataPreview');
  if (data.length === 0) { if (preview) preview.style.display = 'none'; return; }
  if (preview) preview.style.display = 'block';

  let html = '<thead><tr><th>ID</th><th>Cliente</th><th>Cultura</th><th>Area (ha)</th><th>Status</th><th>Regiao</th><th>Produtos</th><th>Acoes</th></tr></thead><tbody>';

  data.forEach(row => {
    const qtd = produtos.filter(p => row.produtos[p.key] === 1).length;
    html += '<tr>';
    html += '<td>' + row.ID_Cliente + '</td>';
    html += '<td><strong>' + row.Nome_Cliente + '</strong></td>';
    html += '<td>' + row.Cultura + '</td>';
    html += '<td>' + row.Area_Hectares.toLocaleString('pt-BR') + '</td>';
    html += '<td><span class="badge ' + (row.Status_Cliente === 'Ativo' ? 'badge--success' : row.Status_Cliente === 'Potencial' ? 'badge--info' : 'badge--neutral') + '">' + row.Status_Cliente + '</span></td>';
    html += '<td>' + row.Regiao + '</td>';
    html += '<td>' + qtd + '/' + produtos.length + '</td>';
    html += '<td><button class="btn btn--ghost btn--sm" onclick="editClient(\'' + row.ID_Cliente + '\')">Editar</button><button class="btn btn--ghost btn--sm" onclick="removeClient(\'' + row.ID_Cliente + '\')" style="color: var(--color-error);">Remover</button></td>';
    html += '</tr>';
  });
  html += '</tbody>';

  const table = document.getElementById('previewTable');
  if (table) table.innerHTML = html;
}

// ============================================
// Client CRUD
// ============================================
function editClient(clientId) {
  const client = rawData.find(c => c.ID_Cliente == clientId);
  if (!client) return;

  document.getElementById('cadastroClienteId').value = client.ID_Cliente;
  document.getElementById('cadastroClienteNome').value = client.Nome_Cliente;
  document.getElementById('cadastroCulturaInput').value = client.Cultura;
  document.getElementById('cadastroRegiaoInput').value = client.Regiao;
  document.getElementById('cadastroStatusInput').value = client.Status_Cliente;
  document.getElementById('cadastroAreaInput').value = client.Area_Hectares;

  document.querySelectorAll('#cadastroProductFilters input[type="checkbox"]').forEach(cb => {
    cb.checked = client.produtos[cb.value] === 1;
  });

  const addBtn = document.getElementById('addClienteData');
  if (addBtn) {
    addBtn.textContent = 'Atualizar Cliente';
    addBtn.onclick = () => updateClient(clientId);
  }

  // Navigate to cadastro section
  navigateTo('cadastro');
}

function updateClient(clientId) {
  const idx = rawData.findIndex(c => c.ID_Cliente == clientId);
  if (idx === -1) return;

  const nome = document.getElementById('cadastroClienteNome').value.trim();
  const cultura = document.getElementById('cadastroCulturaInput').value.trim();
  const area = parseFloat(document.getElementById('cadastroAreaInput').value) || 0;

  if (!nome || !cultura || !area) {
    showToast('Preencha todos os campos obrigatorios.', 'error');
    return;
  }

  rawData[idx].Nome_Cliente = nome;
  rawData[idx].Cultura = cultura;
  rawData[idx].Regiao = document.getElementById('cadastroRegiaoInput').value.trim() || 'Nao informado';
  rawData[idx].Status_Cliente = document.getElementById('cadastroStatusInput').value.trim() || 'Ativo';
  rawData[idx].Area_Hectares = area;

  const selected = Array.from(document.querySelectorAll('#cadastroProductFilters input:checked')).map(cb => cb.value);
  produtos.forEach(prod => {
    rawData[idx].produtos[prod.key] = selected.includes(prod.key) ? 1 : 0;
  });

  filteredData = [...rawData];
  initializeFilters();
  updateSidebarSelects();
  updateAllAnalyses();
  autoSave();
  resetCadastroForm();
  showToast('Cliente atualizado com sucesso!', 'success');
}

function removeClient(clientId) {
  if (!confirm('Tem certeza que deseja remover este cliente?')) return;

  const idx = rawData.findIndex(c => c.ID_Cliente == clientId);
  if (idx === -1) return;

  const name = rawData[idx].Nome_Cliente;
  rawData.splice(idx, 1);
  filteredData = [...rawData];
  initializeFilters();
  updateSidebarSelects();
  updateAllAnalyses();
  autoSave();
  showToast('Cliente ' + name + ' removido.', 'info');
}

function generateUniqueClientId(name) {
  const clean = name.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-zA-Z\s]/g, '').toUpperCase();
  const words = clean.split(' ').filter(w => w.length > 0);
  const base = words.length >= 2 ? words.map(w => w.charAt(0)).join('').substring(0, 3) : words[0].substring(0, 3);

  let counter = 1;
  let id = base + counter.toString().padStart(3, '0');
  while (rawData.some(c => c.ID_Cliente === id)) {
    counter++;
    id = base + counter.toString().padStart(3, '0');
  }
  return id;
}

function resetCadastroForm() {
  const fields = ['cadastroClienteNome', 'cadastroCulturaInput', 'cadastroRegiaoInput', 'cadastroStatusInput', 'cadastroAreaInput'];
  fields.forEach(id => { const el = document.getElementById(id); if (el) el.value = ''; });
  document.getElementById('cadastroClienteId').value = 'Sera gerado automaticamente';
  document.querySelectorAll('#cadastroProductFilters input[type="checkbox"]').forEach(cb => cb.checked = false);

  const addBtn = document.getElementById('addClienteData');
  if (addBtn) { addBtn.textContent = 'Adicionar Cliente'; addBtn.onclick = addNewItems; }
}

function addNewItems() {
  const nome = document.getElementById('cadastroClienteNome').value.trim();
  const cultura = document.getElementById('cadastroCulturaInput').value.trim();
  const area = parseFloat(document.getElementById('cadastroAreaInput').value) || 0;

  if (!nome || !cultura || !area) {
    showToast('Preencha Nome, Cultura e Area.', 'error');
    return;
  }

  if (produtos.length === 0) {
    produtos = [
      { key: 'Amino_Plus', display: 'AminoPlus' }, { key: 'Amino_Arginine', display: 'Amino Arginine' },
      { key: 'Amino_Proline', display: 'Amino Proline' }, { key: 'Amino_Fort', display: 'AminoFort' },
      { key: 'Amino_Reten', display: 'AminoReten' }, { key: 'Amiorgan', display: 'Amiorgan' },
      { key: 'Ajipower', display: 'AjiPower' }, { key: 'Ajifol_Kmg', display: 'Ajifol K-Mg' },
      { key: 'Ajifol_Premium_Plus', display: 'Ajifol Premium+' }, { key: 'Ajifol_SM_Boro', display: 'Ajifol SM-Boro' },
      { key: 'Algen_Max', display: 'AlgenMax' }, { key: 'Bokashi', display: 'Bokashi' }
    ];
  }

  const newClient = {
    ID_Cliente: generateUniqueClientId(nome),
    Nome_Cliente: nome,
    Cultura: cultura,
    Area_Hectares: area,
    Status_Cliente: document.getElementById('cadastroStatusInput').value.trim() || 'Ativo',
    Regiao: document.getElementById('cadastroRegiaoInput').value.trim() || 'Nao informado',
    produtos: {}
  };

  produtos.forEach(prod => { newClient.produtos[prod.key] = 0; });
  const selected = Array.from(document.querySelectorAll('#cadastroProductFilters input:checked')).map(cb => cb.value);
  selected.forEach(key => { if (newClient.produtos.hasOwnProperty(key)) newClient.produtos[key] = 1; });

  rawData.push(newClient);
  filteredData = [...rawData];
  initializeFilters();
  updateSidebarSelects();
  updateAllAnalyses();
  autoSave();
  resetCadastroForm();
  showToast('Cliente ' + nome + ' adicionado!', 'success');
}

// ============================================
// Filters
// ============================================
function initializeFilters() {
  const culturas = [...new Set(rawData.map(d => d.Cultura))].sort();
  const regioes = [...new Set(rawData.map(d => d.Regiao))].sort();
  const statuses = [...new Set(rawData.map(d => d.Status_Cliente))].sort();
  const clientes = [...new Set(rawData.map(d => d.Nome_Cliente))].sort();

  updateSelect('clienteSelect', clientes);
  updateSelect('culturaSelect', culturas);
  updateSelect('regiaoSelect', regioes);
  updateSelect('statusSelect', statuses);
  updateSelect('productSelect', produtos.map(p => ({ value: p.key, text: p.display })));

  // Contact select
  const contatoCliente = document.getElementById('contatoCliente');
  if (contatoCliente) {
    contatoCliente.innerHTML = '<option value="">Selecione</option>';
    rawData.forEach(c => {
      contatoCliente.innerHTML += '<option value="' + c.ID_Cliente + '">' + c.Nome_Cliente + '</option>';
    });
  }

  // Product selects in forms
  ['affectedProduct', 'csProduct', 'vpmProduct'].forEach(id => {
    const sel = document.getElementById(id);
    if (sel && produtos.length > 0) {
      sel.innerHTML = '<option value="">Selecione</option>';
      produtos.forEach(p => { sel.innerHTML += '<option value="' + p.display + '">' + p.display + '</option>'; });
    }
  });

  // Cadastro product filters
  const cadastroFilters = document.getElementById('cadastroProductFilters');
  if (cadastroFilters) {
    cadastroFilters.innerHTML = '';
    produtos.forEach(prod => {
      cadastroFilters.innerHTML += '<label class="checkbox-item"><input type="checkbox" value="' + prod.key + '"><span>' + prod.display + '</span></label>';
    });
  }

  showDataPreview(rawData.slice(0, 10));
  atualizarTabelaProdutos();
  updateOverviewReport();
  updateDBStats();
}

function applyFilters() {
  const cliente = document.getElementById('clienteSelect')?.value || '';
  const cultura = document.getElementById('culturaSelect')?.value || '';
  const regiao = document.getElementById('regiaoSelect')?.value || '';
  const status = document.getElementById('statusSelect')?.value || '';
  const product = document.getElementById('productSelect')?.value || '';

  filteredData = rawData.filter(row => {
    return (!cliente || row.Nome_Cliente === cliente) &&
           (!cultura || row.Cultura === cultura) &&
           (!regiao || row.Regiao === regiao) &&
           (!status || row.Status_Cliente === status) &&
           (!product || row.produtos[product] === 1);
  });

  updateAllAnalyses();
  showToast(filteredData.length + ' clientes encontrados', 'info');
}

function updateAllAnalyses() {
  if (filteredData.length === 0) return;
  updateOverview();
  updatePenetracao();
  updateABC();
  updateCultura();
  updateOportunidades();
  updateTerritorial();
  updateGaps();
  updateFidelizacao();
  updateRelatorio();
}

// ============================================
// Analysis Functions
// ============================================
function updateOverview() {
  const total = filteredData.length;
  const culturas = new Set(filteredData.map(d => d.Cultura)).size;
  const areaTotal = filteredData.reduce((s, d) => s + d.Area_Hectares, 0);
  const mediaArea = areaTotal / total;

  const prodPen = {};
  produtos.forEach(p => { prodPen[p.key] = filteredData.filter(c => c.produtos[p.key] === 1).length; });
  const top = Object.entries(prodPen).sort((a, b) => b[1] - a[1])[0];
  const topProd = top ? produtos.find(p => p.key === top[0])?.display.split(' ')[0] || '-' : '-';

  document.getElementById('kpiTotalClientes').textContent = total;
  document.getElementById('kpiCulturas').textContent = culturas;
  document.getElementById('kpiAreaTotal').textContent = areaTotal.toLocaleString('pt-BR', { minimumFractionDigits: 0 });
  document.getElementById('kpiMediaArea').textContent = mediaArea.toFixed(1);
  document.getElementById('kpiProdutos').textContent = produtos.length;
  document.getElementById('kpiMaiorPenetracao').textContent = topProd;

  // Summary table
  const table = document.getElementById('clienteSummaryTable');
  if (table) {
    let html = '<thead><tr><th>Cliente</th><th>Cultura</th><th>Area (ha)</th><th>Produtos</th></tr></thead><tbody>';
    filteredData.slice(0, 50).forEach(row => {
      const qtd = produtos.filter(p => row.produtos[p.key] === 1).length;
      html += '<tr><td><strong>' + row.Nome_Cliente + '</strong></td><td>' + row.Cultura + '</td><td>' + row.Area_Hectares.toLocaleString('pt-BR') + '</td><td>' + qtd + '/' + produtos.length + '</td></tr>';
    });
    html += '</tbody>';
    table.innerHTML = html;
  }

  // Culture summary
  const culturaSummary = {};
  filteredData.forEach(row => {
    if (!culturaSummary[row.Cultura]) culturaSummary[row.Cultura] = { count: 0, area: 0 };
    culturaSummary[row.Cultura].count++;
    culturaSummary[row.Cultura].area += row.Area_Hectares;
  });

  const cTable = document.getElementById('culturaSummaryTable');
  if (cTable) {
    let html = '<thead><tr><th>Cultura</th><th>Clientes</th><th>Area Total</th><th>Media</th></tr></thead><tbody>';
    Object.entries(culturaSummary).forEach(([c, d]) => {
      html += '<tr><td><strong>' + c + '</strong></td><td>' + d.count + '</td><td>' + d.area.toLocaleString('pt-BR', { minimumFractionDigits: 0 }) + '</td><td>' + (d.area / d.count).toFixed(1) + '</td></tr>';
    });
    html += '</tbody>';
    cTable.innerHTML = html;
  }

  updateSalesPeriodChart();
  updateActiveFilters();
}

function updatePenetracao() {
  const pen = produtos.map(prod => {
    const clientes = filteredData.filter(c => c.produtos[prod.key] === 1).length;
    return { produto: prod.display, key: prod.key, clientes, percentual: (clientes / filteredData.length * 100) };
  }).sort((a, b) => b.percentual - a.percentual);

  destroyChart('penetracaoChart');
  const ctx = document.getElementById('penetracaoChart')?.getContext('2d');
  if (ctx) {
    charts.penetracao = new Chart(ctx, {
      type: 'bar',
      data: { labels: pen.map(p => p.produto), datasets: [{ label: 'Penetracao (%)', data: pen.map(p => p.percentual), backgroundColor: '#22c55e', borderRadius: 6 }] },
      options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true, max: 100 } } }
    });
  }

  const table = document.getElementById('penetracaoTable');
  if (table) {
    let html = '<thead><tr><th>Produto</th><th>Clientes</th><th>Penetracao %</th><th>Classificacao</th></tr></thead><tbody>';
    pen.forEach(p => {
      const cls = p.percentual >= 60 ? 'badge--success' : p.percentual >= 30 ? 'badge--warning' : 'badge--error';
      const label = p.percentual >= 60 ? 'TOP' : p.percentual >= 30 ? 'MEDIO' : 'GAP';
      html += '<tr><td><strong>' + p.produto + '</strong></td><td>' + p.clientes + '</td><td>' + p.percentual.toFixed(1) + '%</td><td><span class="badge ' + cls + '">' + label + '</span></td></tr>';
    });
    html += '</tbody>';
    table.innerHTML = html;
  }

  const opEl = document.getElementById('produtoOportunidades');
  const gaps = pen.filter(p => p.percentual < 30);
  if (opEl) {
    if (gaps.length > 0) {
      opEl.innerHTML = '<div style="color: var(--text-secondary);"><p style="margin-bottom: 0.75rem;">Oportunidades de crescimento:</p><ul style="list-style: none; padding: 0;">' +
        gaps.map(g => '<li style="padding: 0.5rem; background: var(--bg-tertiary); border-radius: var(--radius-sm); margin-bottom: 0.5rem;"><strong>' + g.produto + ':</strong> ' + (filteredData.length - g.clientes) + ' clientes potenciais</li>').join('') +
        '</ul></div>';
    } else {
      opEl.innerHTML = '<p>Todos os produtos tem boa penetracao!</p>';
    }
  }
}

function updateABC() {
  const score = filteredData.map(c => {
    const qtd = produtos.filter(p => c.produtos[p.key] === 1).length;
    return { ...c, qtd, score: qtd * c.Area_Hectares };
  }).sort((a, b) => b.score - a.score);

  const totalScore = score.reduce((s, c) => s + c.score, 0);
  let cum = 0;
  const abc = score.map(c => {
    cum += c.score;
    const perc = (cum / totalScore) * 100;
    const cls = perc <= 80 ? 'A' : perc <= 95 ? 'B' : 'C';
    return { ...c, cumulativePercent: perc, classification: cls };
  });

  destroyChart('abcParetoChart');
  const ctx = document.getElementById('abcParetoChart')?.getContext('2d');
  if (ctx) {
    charts.abcPareto = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: abc.slice(0, 20).map(c => c.Nome_Cliente),
        datasets: [
          { label: 'Score', data: abc.slice(0, 20).map(c => c.score), backgroundColor: '#22c55e', borderRadius: 4, yAxisID: 'y' },
          { label: '% Acumulado', data: abc.slice(0, 20).map(c => c.cumulativePercent), type: 'line', borderColor: '#f59e0b', backgroundColor: 'transparent', yAxisID: 'y1', tension: 0.4 }
        ]
      },
      options: { responsive: true, maintainAspectRatio: false, scales: { y: { beginAtZero: true }, y1: { position: 'right', beginAtZero: true, max: 100 } } }
    });
  }

  const table = document.getElementById('clienteAbcTable');
  if (table) {
    let html = '<thead><tr><th>Classe</th><th>Cliente</th><th>Cultura</th><th>Area</th><th>Produtos</th><th>Score</th></tr></thead><tbody>';
    abc.slice(0, 50).forEach(c => {
      const cls = c.classification === 'A' ? 'badge--success' : c.classification === 'B' ? 'badge--warning' : 'badge--error';
      html += '<tr><td><span class="badge ' + cls + '">' + c.classification + '</span></td><td><strong>' + c.Nome_Cliente + '</strong></td><td>' + c.Cultura + '</td><td>' + c.Area_Hectares.toLocaleString('pt-BR') + '</td><td>' + c.qtd + '</td><td>' + c.score.toFixed(0) + '</td></tr>';
    });
    html += '</tbody>';
    table.innerHTML = html;
  }

  destroyChart('matrizAreaProdutos');
  const ctx2 = document.getElementById('matrizAreaProdutos')?.getContext('2d');
  if (ctx2) {
    charts.matrizArea = new Chart(ctx2, {
      type: 'scatter',
      data: { datasets: [{ label: 'Clientes', data: score.map(c => ({ x: c.qtd, y: c.Area_Hectares })), backgroundColor: '#22c55e80' }] },
      options: { responsive: true, maintainAspectRatio: false, scales: { x: { title: { display: true, text: 'Qtd Produtos' } }, y: { title: { display: true, text: 'Area (ha)' } } } }
    });
  }
}

function updateCultura() {
  const data = {};
  filteredData.forEach(c => {
    if (!data[c.Cultura]) data[c.Cultura] = { clientes: 0, area: 0, produtos: {} };
    data[c.Cultura].clientes++;
    data[c.Cultura].area += c.Area_Hectares;
    produtos.forEach(p => {
      if (!data[c.Cultura].produtos[p.key]) data[c.Cultura].produtos[p.key] = 0;
      if (c.produtos[p.key] === 1) data[c.Cultura].produtos[p.key]++;
    });
  });

  const table = document.getElementById('culturaAnaliseTable');
  if (table) {
    let html = '<thead><tr><th>Cultura</th><th>Clientes</th><th>Area Total</th><th>Media</th><th>Produtos Medio</th></tr></thead><tbody>';
    Object.entries(data).forEach(([c, d]) => {
      const tp = Object.values(d.produtos).reduce((a, b) => a + b, 0);
      html += '<tr><td><strong>' + c + '</strong></td><td>' + d.clientes + '</td><td>' + d.area.toLocaleString('pt-BR', { minimumFractionDigits: 0 }) + '</td><td>' + (d.area / d.clientes).toFixed(1) + '</td><td>' + (tp / d.clientes).toFixed(1) + '</td></tr>';
    });
    html += '</tbody>';
    table.innerHTML = html;
  }

  destroyChart('culturaClientesChart');
  const ctx1 = document.getElementById('culturaClientesChart')?.getContext('2d');
  if (ctx1) charts.culturaClientes = new Chart(ctx1, { type: 'bar', data: { labels: Object.keys(data), datasets: [{ data: Object.values(data).map(d => d.clientes), backgroundColor: CHART_COLORS }] }, options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } } });

  destroyChart('culturaAreaChart');
  const ctx2 = document.getElementById('culturaAreaChart')?.getContext('2d');
  if (ctx2) charts.culturaArea = new Chart(ctx2, { type: 'doughnut', data: { labels: Object.keys(data), datasets: [{ data: Object.values(data).map(d => d.area), backgroundColor: CHART_COLORS }] }, options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom' } } } });

  // Heatmap
  const heatmap = document.getElementById('heatmapProdutoCultura');
  if (heatmap) {
    let html = '<div class="table-container"><table class="data-table"><thead><tr><th>Cultura</th>';
    produtos.forEach(p => { html += '<th>' + p.display.split(' ')[0] + '</th>'; });
    html += '</tr></thead><tbody>';
    Object.entries(data).forEach(([cultura, d]) => {
      html += '<tr><td><strong>' + cultura + '</strong></td>';
      produtos.forEach(p => {
        const pen = (d.produtos[p.key] / d.clientes * 100).toFixed(0);
        const cls = pen > 66 ? 'badge--success' : pen > 33 ? 'badge--warning' : 'badge--error';
        html += '<td><span class="badge ' + cls + '">' + pen + '%</span></td>';
      });
      html += '</tr>';
    });
    html += '</tbody></table></div>';
    heatmap.innerHTML = html;
  }
}

function updateOportunidades() {
  const mediaArea = filteredData.reduce((s, c) => s + c.Area_Hectares, 0) / filteredData.length;
  const mediaProd = produtos.map(p => filteredData.filter(c => c.produtos[p.key] === 1).length).reduce((a, b) => a + b, 0) / produtos.length;

  const quads = { estrelas: [], oportunidades: [], nicho: [], evitar: [] };
  filteredData.forEach(c => {
    const qtd = produtos.filter(p => c.produtos[p.key] === 1).length;
    const grande = c.Area_Hectares >= mediaArea;
    const alta = qtd >= mediaProd;
    if (grande && alta) quads.estrelas.push(c);
    else if (grande && !alta) quads.oportunidades.push(c);
    else if (!grande && alta) quads.nicho.push(c);
    else quads.evitar.push(c);
  });

  destroyChart('matrizOportunidadesChart');
  const ctx = document.getElementById('matrizOportunidadesChart')?.getContext('2d');
  if (ctx) {
    charts.matrizOp = new Chart(ctx, {
      type: 'bubble',
      data: {
        datasets: [
          { label: 'Estrelas', data: [{ x: 1, y: 1, r: Math.max(quads.estrelas.length * 3, 5) }], backgroundColor: '#22c55e80' },
          { label: 'Oportunidades', data: [{ x: 1, y: 0, r: Math.max(quads.oportunidades.length * 3, 5) }], backgroundColor: '#3b82f680' },
          { label: 'Nicho', data: [{ x: 0, y: 1, r: Math.max(quads.nicho.length * 3, 5) }], backgroundColor: '#f59e0b80' },
          { label: 'Avaliar', data: [{ x: 0, y: 0, r: Math.max(quads.evitar.length * 3, 5) }], backgroundColor: '#ef444480' }
        ]
      },
      options: { responsive: true, maintainAspectRatio: false, scales: { x: { min: -0.5, max: 1.5, ticks: { callback: v => v === 0 ? 'Pequeno' : 'Grande' } }, y: { min: -0.5, max: 1.5, ticks: { callback: v => v === 0 ? 'Baixa' : 'Alta' } } } }
    });
  }

  const setHtml = (id, count, text) => { const el = document.getElementById(id); if (el) el.innerHTML = '<p>' + count + ' clientes - ' + text + '</p>'; };
  setHtml('quadranteEstrelas', quads.estrelas.length, 'Proteger e expandir');
  setHtml('quadranteOportunidades', quads.oportunidades.length, 'Aumentar penetracao');
  setHtml('quadranteNicho', quads.nicho.length, 'Manter relacionamento');
  setHtml('quadranteEvitar', quads.evitar.length, 'Avaliar investimento');
}

function updateTerritorial() {
  const data = {};
  filteredData.forEach(c => {
    if (!data[c.Regiao]) data[c.Regiao] = { clientes: 0, area: 0 };
    data[c.Regiao].clientes++;
    data[c.Regiao].area += c.Area_Hectares;
  });

  const table = document.getElementById('territorialTable');
  if (table) {
    const totalC = filteredData.length;
    const totalA = filteredData.reduce((s, c) => s + c.Area_Hectares, 0);
    let html = '<thead><tr><th>Regiao</th><th>Clientes</th><th>Area Total</th><th>% Clientes</th><th>% Area</th></tr></thead><tbody>';
    Object.entries(data).forEach(([r, d]) => {
      html += '<tr><td><strong>' + r + '</strong></td><td>' + d.clientes + '</td><td>' + d.area.toLocaleString('pt-BR', { minimumFractionDigits: 0 }) + '</td><td>' + (d.clientes / totalC * 100).toFixed(1) + '%</td><td>' + (d.area / totalA * 100).toFixed(1) + '%</td></tr>';
    });
    html += '</tbody>';
    table.innerHTML = html;
  }

  destroyChart('regiaoClientesChart');
  const ctx1 = document.getElementById('regiaoClientesChart')?.getContext('2d');
  if (ctx1) charts.regiaoClientes = new Chart(ctx1, { type: 'bar', data: { labels: Object.keys(data), datasets: [{ data: Object.values(data).map(d => d.clientes), backgroundColor: '#22c55e' }] }, options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } } });

  destroyChart('regiaoAreaChart');
  const ctx2 = document.getElementById('regiaoAreaChart')?.getContext('2d');
  if (ctx2) charts.regiaoArea = new Chart(ctx2, { type: 'pie', data: { labels: Object.keys(data), datasets: [{ data: Object.values(data).map(d => d.area), backgroundColor: CHART_COLORS }] }, options: { responsive: true, maintainAspectRatio: false } });
}

function updateGaps() {
  const gaps = filteredData.map(c => {
    const usando = produtos.filter(p => c.produtos[p.key] === 1).length;
    const naoUsando = produtos.length - usando;
    return { ...c, usando, gap: naoUsando, potencial: naoUsando * (c.Area_Hectares / 100) };
  }).sort((a, b) => b.potencial - a.potencial);

  const table = document.getElementById('gapsTable');
  if (table) {
    let html = '<thead><tr><th>Cliente</th><th>Usando</th><th>Gap</th><th>Potencial</th></tr></thead><tbody>';
    gaps.slice(0, 30).forEach(c => {
      html += '<tr><td><strong>' + c.Nome_Cliente + '</strong></td><td>' + c.usando + '</td><td>' + c.gap + '</td><td><span class="badge badge--success">' + c.potencial.toFixed(0) + '</span></td></tr>';
    });
    html += '</tbody>';
    table.innerHTML = html;
  }

  destroyChart('potencialChart');
  const ctx = document.getElementById('potencialChart')?.getContext('2d');
  if (ctx) charts.potencial = new Chart(ctx, { type: 'bar', data: { labels: gaps.slice(0, 15).map(c => c.Nome_Cliente), datasets: [{ label: 'Potencial', data: gaps.slice(0, 15).map(c => c.potencial), backgroundColor: '#22c55e', borderRadius: 4 }] }, options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } } });
}

function updateFidelizacao() {
  const basket = filteredData.map(c => ({ ...c, basket: produtos.filter(p => c.produtos[p.key] === 1).length }));
  const media = basket.reduce((s, c) => s + c.basket, 0) / basket.length;
  const risco = basket.filter(c => c.basket === 1).length;
  const top = basket.filter(c => c.basket >= 5).length;

  const set = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
  set('kpiBasketMedio', media.toFixed(1));
  set('kpiClientesRisco', risco);
  set('kpiClientesTop', top);

  const dist = {};
  for (let i = 0; i <= produtos.length; i++) dist[i] = basket.filter(c => c.basket === i).length;

  destroyChart('basketDistChart');
  const ctx = document.getElementById('basketDistChart')?.getContext('2d');
  if (ctx) charts.basketDist = new Chart(ctx, { type: 'bar', data: { labels: Object.keys(dist), datasets: [{ label: 'Clientes', data: Object.values(dist), backgroundColor: '#22c55e', borderRadius: 4 }] }, options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } } });

  basket.sort((a, b) => b.basket - a.basket);
  const table = document.getElementById('basketTable');
  if (table) {
    let html = '<thead><tr><th>Cliente</th><th>Cultura</th><th>Area</th><th>Basket</th><th>Status</th></tr></thead><tbody>';
    basket.slice(0, 30).forEach(c => {
      const cls = c.basket >= 5 ? 'badge--success' : c.basket >= 3 ? 'badge--warning' : 'badge--error';
      const label = c.basket >= 5 ? 'TOP' : c.basket >= 3 ? 'MEDIO' : 'RISCO';
      html += '<tr><td><strong>' + c.Nome_Cliente + '</strong></td><td>' + c.Cultura + '</td><td>' + c.Area_Hectares.toLocaleString('pt-BR') + '</td><td>' + c.basket + '/' + produtos.length + '</td><td><span class="badge ' + cls + '">' + label + '</span></td></tr>';
    });
    html += '</tbody>';
    table.innerHTML = html;
  }
}

function updateRelatorio() {
  // Top 5 clients chart
  const score = filteredData.map(c => ({ ...c, qtd: produtos.filter(p => c.produtos[p.key] === 1).length, score: produtos.filter(p => c.produtos[p.key] === 1).length * c.Area_Hectares })).sort((a, b) => b.score - a.score);

  destroyChart('top5ClientesChart');
  // Note: these charts may not exist in new HTML, guard against missing elements
}

// ============================================
// GUT, SWOT, PEST, Contatos
// ============================================
function addGutItem() {
  const problem = document.getElementById('gutProblem').value.trim();
  const g = parseInt(document.getElementById('gutGravity').value);
  const u = parseInt(document.getElementById('gutUrgency').value);
  const t = parseInt(document.getElementById('gutTrend').value);

  if (!problem) { showToast('Descreva o problema.', 'error'); return; }

  gutData.push({ problem, gravity: g, urgency: u, trend: t, score: g * u * t, timestamp: new Date().toLocaleString('pt-BR') });
  document.getElementById('gutProblem').value = '';
  updateGutAnalysis();
  autoSave();
  showToast('Item adicionado a matriz GUT.', 'success');
}

function updateGutAnalysis() {
  const table = document.getElementById('gutTable');
  if (!table) return;

  if (gutData.length === 0) {
    table.innerHTML = '<tbody><tr><td colspan="7" style="text-align: center; color: var(--text-tertiary);">Nenhum item adicionado.</td></tr></tbody>';
    return;
  }

  const sorted = [...gutData].sort((a, b) => b.score - a.score);
  let html = '<thead><tr><th>#</th><th>Problema</th><th>G</th><th>U</th><th>T</th><th>Score</th><th>Prioridade</th></tr></thead><tbody>';
  sorted.forEach((item, i) => {
    const cls = item.score >= 64 ? 'badge--error' : item.score >= 27 ? 'badge--warning' : 'badge--success';
    const label = item.score >= 64 ? 'Alta' : item.score >= 27 ? 'Media' : 'Baixa';
    html += '<tr><td>' + (i + 1) + '</td><td><strong>' + item.problem + '</strong></td><td>' + item.gravity + '</td><td>' + item.urgency + '</td><td>' + item.trend + '</td><td><strong>' + item.score + '</strong></td><td><span class="badge ' + cls + '">' + label + '</span></td></tr>';
  });
  html += '</tbody>';
  table.innerHTML = html;

  destroyChart('gutChart');
  const ctx = document.getElementById('gutChart')?.getContext('2d');
  if (ctx) charts.gut = new Chart(ctx, { type: 'bubble', data: { datasets: [{ label: 'Problemas', data: gutData.map(i => ({ x: i.urgency, y: i.gravity, r: i.trend * 4 })), backgroundColor: '#ef444480' }] }, options: { responsive: true, maintainAspectRatio: false, scales: { x: { min: 0, max: 6, title: { display: true, text: 'Urgencia' } }, y: { min: 0, max: 6, title: { display: true, text: 'Gravidade' } } } } });
}

function exportGut() {
  if (gutData.length === 0) return;
  let csv = 'Problema,Gravidade,Urgencia,Tendencia,Score\n';
  gutData.forEach(i => csv += '"' + i.problem + '",' + i.gravity + ',' + i.urgency + ',' + i.trend + ',' + i.score + '\n');
  downloadCSV(csv, 'matriz_gut.csv');
}

function saveSWOT() {
  swotData = {
    strengths: document.getElementById('swotStrengths').value.trim(),
    weaknesses: document.getElementById('swotWeaknesses').value.trim(),
    opportunities: document.getElementById('swotOpportunities').value.trim(),
    threats: document.getElementById('swotThreats').value.trim()
  };
  if (!swotData.strengths && !swotData.weaknesses && !swotData.opportunities && !swotData.threats) {
    showToast('Preencha pelo menos um quadrante.', 'error');
    return;
  }
  updateSWOTStrategies();
  autoSave();
  showToast('Analise SWOT salva!', 'success');
}

function updateSWOTStrategies() {
  const set = (id, content) => { const el = document.getElementById(id); if (el) el.innerHTML = content; };
  set('swotFO', swotData.strengths && swotData.opportunities ? '<p>Use forcas para aproveitar oportunidades</p>' : '<p><em>Preencha Forcas e Oportunidades</em></p>');
  set('swotWO', swotData.weaknesses && swotData.opportunities ? '<p>Supere fraquezas para aproveitar oportunidades</p>' : '<p><em>Preencha Fraquezas e Oportunidades</em></p>');
  set('swotFT', swotData.strengths && swotData.threats ? '<p>Use forcas para mitigar ameacas</p>' : '<p><em>Preencha Forcas e Ameacas</em></p>');
  set('swotWT', swotData.weaknesses && swotData.threats ? '<p>Minimize fraquezas e evite ameacas</p>' : '<p><em>Preencha Fraquezas e Ameacas</em></p>');
}

function addContato() {
  const clienteId = document.getElementById('contatoCliente').value;
  const resp = document.getElementById('contatoResponsavel').value.trim();

  if (!clienteId || !resp) { showToast('Selecione cliente e informe responsavel.', 'error'); return; }

  const cliente = rawData.find(c => c.ID_Cliente == clienteId);
  const idx = contatosData.findIndex(c => c.clienteId == clienteId);
  const contato = { clienteId, clienteNome: cliente.Nome_Cliente, responsavel: resp, telefone: document.getElementById('contatoTelefone').value.trim(), email: document.getElementById('contatoEmail').value.trim(), visita: document.getElementById('contatoVisita').value, notas: document.getElementById('contatoNotas').value.trim() };

  if (idx >= 0) contatosData[idx] = contato;
  else contatosData.push(contato);

  ['contatoResponsavel', 'contatoTelefone', 'contatoEmail', 'contatoNotas'].forEach(id => { const el = document.getElementById(id); if (el) el.value = ''; });
  document.getElementById('contatoVisita').value = '';

  updateContatosTable();
  autoSave();
  showToast('Contato registrado!', 'success');
}

function updateContatosTable() {
  const table = document.getElementById('contatosTable');
  if (!table) return;

  if (contatosData.length === 0) {
    table.innerHTML = '<tbody><tr><td colspan="6" style="text-align: center; color: var(--text-tertiary);">Nenhum contato registrado.</td></tr></tbody>';
    return;
  }

  let html = '<thead><tr><th>Cliente</th><th>Responsavel</th><th>Telefone</th><th>Email</th><th>Visita</th><th>Notas</th></tr></thead><tbody>';
  contatosData.forEach(c => {
    html += '<tr><td><strong>' + c.clienteNome + '</strong></td><td>' + c.responsavel + '</td><td>' + (c.telefone || '-') + '</td><td>' + (c.email || '-') + '</td><td>' + (c.visita || '-') + '</td><td>' + (c.notas || '-') + '</td></tr>';
  });
  html += '</tbody>';
  table.innerHTML = html;
}

function exportContatos() {
  if (contatosData.length === 0) return;
  let csv = 'Cliente,Responsavel,Telefone,Email,Visita,Notas\n';
  contatosData.forEach(c => csv += '"' + c.clienteNome + '","' + c.responsavel + '","' + c.telefone + '","' + c.email + '","' + c.visita + '","' + c.notas + '"\n');
  downloadCSV(csv, 'contatos.csv');
}

// ============================================
// PEST, CS, MkS, VPM, Diagnosis
// ============================================
function savePEST() {
  pestData = {
    political: document.getElementById('pestPolitical')?.value?.trim() || '',
    economic: document.getElementById('pestEconomic')?.value?.trim() || '',
    social: document.getElementById('pestSocial')?.value?.trim() || '',
    technology: document.getElementById('pestTechnology')?.value?.trim() || ''
  };
  if (!pestData.political && !pestData.economic && !pestData.social && !pestData.technology) {
    showToast('Preencha pelo menos um fator PEST.', 'error'); return;
  }
  updatePESTTable();
  autoSave();
  showToast('Analise PEST salva!', 'success');
}

function updatePESTTable() {
  const table = document.getElementById('pestTable');
  if (!table) return;

  const factors = [
    { name: 'Politico', value: pestData.political },
    { name: 'Economico', value: pestData.economic },
    { name: 'Social', value: pestData.social },
    { name: 'Tecnologico', value: pestData.technology }
  ];

  let html = '<thead><tr><th>Fator</th><th>Descricao</th><th>Impacto</th></tr></thead><tbody>';
  factors.forEach(f => {
    if (f.value) {
      const impact = f.value.length > 50 ? 'Alto' : f.value.length > 20 ? 'Medio' : 'Baixo';
      const cls = impact === 'Alto' ? 'badge--error' : impact === 'Medio' ? 'badge--warning' : 'badge--success';
      html += '<tr><td><strong>' + f.name + '</strong></td><td>' + f.value.substring(0, 100) + (f.value.length > 100 ? '...' : '') + '</td><td><span class="badge ' + cls + '">' + impact + '</span></td></tr>';
    }
  });
  html += '</tbody>';
  table.innerHTML = html;
}

function addCSRecord() {
  const client = document.getElementById('csClient')?.value?.trim();
  const score = parseInt(document.getElementById('csScore')?.value);
  if (!client || !score || score < 1 || score > 10) { showToast('Preencha cliente e nota (1-10).', 'error'); return; }

  csData.push({ client, product: document.getElementById('csProduct')?.value || 'Geral', score, date: document.getElementById('csDate')?.value || new Date().toISOString().split('T')[0], comment: document.getElementById('csComment')?.value?.trim() || '' });
  ['csClient', 'csScore', 'csDate', 'csComment'].forEach(id => { const el = document.getElementById(id); if (el) el.value = ''; });
  updateCSAnalysis();
  autoSave();
  showToast('Avaliacao adicionada!', 'success');
}

function updateCSAnalysis() {
  if (csData.length === 0) return;
  const avg = (csData.reduce((s, i) => s + i.score, 0) / csData.length).toFixed(1);
  const satisfied = csData.filter(i => i.score >= 7).length;
  const detractors = csData.filter(i => i.score <= 6).length;

  const set = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
  set('csatAverage', avg);
  set('csatSatisfied', ((satisfied / csData.length) * 100).toFixed(1) + '%');
  set('csatDetractors', detractors);
  set('csatTotal', csData.length);
}

function exportCS() {
  if (csData.length === 0) return;
  let csv = 'Cliente,Produto,Nota,Data,Comentario\n';
  csData.forEach(i => csv += '"' + i.client + '","' + i.product + '",' + i.score + ',"' + i.date + '","' + i.comment + '"\n');
  downloadCSV(csv, 'avaliacoes_satisfacao.csv');
}

function addMksRecord() {
  const competitor = document.getElementById('mksCompetitor')?.value?.trim();
  const variable = document.getElementById('mksVariable')?.value;
  const score = parseInt(document.getElementById('mksScore')?.value);
  if (!competitor || !variable || !score) { showToast('Preencha todos os campos.', 'error'); return; }

  const idx = mksData.findIndex(i => i.competitor === competitor && i.variable === variable);
  if (idx >= 0) mksData[idx].score = score;
  else mksData.push({ competitor, variable, score });

  document.getElementById('mksCompetitor').value = '';
  document.getElementById('mksScore').value = '3';
  updateMksAnalysis();
  autoSave();
  showToast('Avaliacao competitiva adicionada!', 'success');
}

function updateMksAnalysis() {
  const table = document.getElementById('mksTable');
  if (!table || mksData.length === 0) return;

  const competitors = [...new Set(mksData.map(i => i.competitor))];
  const variables = [...new Set(mksData.map(i => i.variable))];

  let html = '<thead><tr><th>Concorrente</th>';
  variables.forEach(v => html += '<th>' + v + '</th>');
  html += '<th>Media</th></tr></thead><tbody>';

  competitors.forEach(comp => {
    html += '<tr><td><strong>' + comp + '</strong></td>';
    let total = 0, count = 0;
    variables.forEach(v => {
      const item = mksData.find(d => d.competitor === comp && d.variable === v);
      const score = item ? item.score : 0;
      if (score > 0) { total += score; count++; }
      const cls = score >= 4 ? 'badge--success' : score >= 3 ? 'badge--warning' : 'badge--error';
      html += '<td><span class="badge ' + cls + '">' + (score || '-') + '</span></td>';
    });
    html += '<td><strong>' + (count > 0 ? (total / count).toFixed(1) : '0') + '</strong></td></tr>';
  });
  html += '</tbody>';
  table.innerHTML = html;
}

function exportMks() {
  if (mksData.length === 0) return;
  let csv = 'Concorrente,Variavel,Score\n';
  mksData.forEach(i => csv += '"' + i.competitor + '","' + i.variable + '",' + i.score + '\n');
  downloadCSV(csv, 'analise_competitiva.csv');
}

function addVpmData() {
  const product = document.getElementById('vpmProduct')?.value;
  const price = parseFloat(document.getElementById('vpmPrice')?.value) || 0;
  const cost = parseFloat(document.getElementById('vpmCost')?.value) || 0;
  if (!product || price <= 0) { showToast('Selecione produto e informe preco.', 'error'); return; }

  const idx = vpmData.findIndex(i => i.product === product);
  if (idx >= 0) vpmData[idx] = { product, price, cost };
  else vpmData.push({ product, price, cost });

  ['vpmProduct', 'vpmPrice', 'vpmCost'].forEach(id => { const el = document.getElementById(id); if (el) el.value = ''; });
  updateVpmAnalysis();
  autoSave();
  showToast('Dados VPM adicionados!', 'success');
}

function updateVpmAnalysis() {
  if (vpmData.length === 0) return;
  const avgPrice = (vpmData.reduce((s, i) => s + i.price, 0) / vpmData.length).toFixed(2);
  const avgMargin = (vpmData.reduce((s, i) => s + ((i.price - i.cost) / i.price * 100), 0) / vpmData.length).toFixed(1);

  const set = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
  set('vpmVolume', filteredData.length);
  set('vpmAvgPrice', 'R$ ' + avgPrice);
  set('vpmAvgMargin', avgMargin + '%');
  set('vpmRevenue', 'R$ ' + (filteredData.length * parseFloat(avgPrice)).toLocaleString('pt-BR'));

  const table = document.getElementById('vpmTable');
  if (table) {
    let html = '<thead><tr><th>Produto</th><th>Preco</th><th>Custo</th><th>Margem %</th></tr></thead><tbody>';
    vpmData.forEach(i => {
      const margin = ((i.price - i.cost) / i.price * 100).toFixed(1);
      const cls = margin >= 30 ? 'badge--success' : margin >= 15 ? 'badge--warning' : 'badge--error';
      html += '<tr><td><strong>' + i.product + '</strong></td><td>R$ ' + i.price.toFixed(2) + '</td><td>R$ ' + i.cost.toFixed(2) + '</td><td><span class="badge ' + cls + '">' + margin + '%</span></td></tr>';
    });
    html += '</tbody>';
    table.innerHTML = html;
  }
}

function saveDiagnosis() {
  const problem = document.getElementById('problemDescription')?.value?.trim();
  if (!problem) { showToast('Descreva o problema.', 'error'); return; }

  const causes = {};
  document.querySelectorAll('.cause-input').forEach(input => {
    if (input.value.trim()) causes[input.dataset.category] = input.value.trim();
  });

  diagnosisData.push({
    problem,
    product: document.getElementById('affectedProduct')?.value || 'Geral',
    period: document.getElementById('affectedPeriod')?.value?.trim() || new Date().toLocaleDateString('pt-BR'),
    causes,
    timestamp: new Date().toLocaleString('pt-BR')
  });

  ['problemDescription', 'affectedProduct', 'affectedPeriod'].forEach(id => { const el = document.getElementById(id); if (el) el.value = ''; });
  document.querySelectorAll('.cause-input').forEach(i => i.value = '');
  updateDiagnosisHistory();
  autoSave();
  showToast('Diagnostico salvo!', 'success');
}

function updateDiagnosisHistory() {
  const history = document.getElementById('diagnosisHistory');
  if (!history) return;

  if (diagnosisData.length === 0) { history.innerHTML = '<p style="color: var(--text-tertiary);">Nenhum diagnostico registrado.</p>'; return; }

  history.innerHTML = diagnosisData.map((d, i) =>
    '<div style="padding: 1rem; background: var(--bg-tertiary); border-radius: var(--radius-lg); margin-bottom: 0.75rem; border-left: 4px solid var(--color-primary);">' +
    '<h4 style="margin-bottom: 0.25rem;">Diagnostico #' + (i + 1) + '</h4>' +
    '<p style="font-size: 0.75rem; color: var(--text-tertiary); margin-bottom: 0.5rem;">' + d.product + ' | ' + d.period + ' | ' + d.timestamp + '</p>' +
    '<p><strong>Problema:</strong> ' + d.problem + '</p>' +
    (Object.keys(d.causes).length > 0 ? '<div style="margin-top: 0.5rem; font-size: 0.875rem;">' + Object.entries(d.causes).map(([cat, cause]) => '<div style="padding: 0.25rem 0.5rem; background: var(--bg-secondary); border-radius: var(--radius-sm); margin-bottom: 0.25rem;"><strong>' + cat + ':</strong> ' + cause + '</div>').join('') + '</div>' : '') +
    '</div>'
  ).join('');
}

function exportDiagnosis() {
  if (diagnosisData.length === 0) return;
  let csv = 'Problema,Produto,Periodo,Causas\n';
  diagnosisData.forEach(d => csv += '"' + d.problem + '","' + d.product + '","' + d.period + '","' + Object.entries(d.causes).map(([k, v]) => k + ': ' + v).join('; ') + '"\n');
  downloadCSV(csv, 'diagnosticos.csv');
}

// ============================================
// Produtos
// ============================================
function salvarProduto() {
  const nome = document.getElementById('produtoNome').value.trim();
  const fornecedor = document.getElementById('produtoFornecedor').value.trim();
  const custo = parseFloat(document.getElementById('produtoCusto').value) || 0;
  const categoria = document.getElementById('produtoCategoria').value;
  const cultura = document.getElementById('produtoCultura').value;

  if (!nome || !fornecedor || !custo || !categoria || !cultura) {
    showToast('Preencha todos os campos obrigatorios.', 'error');
    return;
  }

  const produtosDB = db.load()?.produtos || [];
  produtosDB.push({
    id: Date.now(),
    nome, fornecedor, custo, categoria, cultura,
    modoAcao: document.getElementById('produtoModoAcao').value,
    ingrediente: document.getElementById('produtoIngrediente').value.trim(),
    finalidade: document.getElementById('produtoFinalidade').value.trim(),
    tipoAplicacao: document.getElementById('produtoTipoAplicacao').value,
    dose: document.getElementById('produtoDose').value.trim(),
    intervalo: parseInt(document.getElementById('produtoIntervalo').value) || 0,
    observacoes: document.getElementById('produtoObservacoes').value.trim(),
    data: new Date().toISOString()
  });

  db.save({ ...db.load(), produtos: produtosDB });
  limparFormularioProduto();
  atualizarTabelaProdutos();
  showToast('Produto salvo com sucesso!', 'success');
}

function limparFormularioProduto() {
  ['produtoNome', 'produtoFornecedor', 'produtoCusto', 'produtoIngrediente', 'produtoFinalidade', 'produtoDose', 'produtoIntervalo', 'produtoObservacoes'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = '';
  });
  ['produtoCategoria', 'produtoCultura', 'produtoModoAcao', 'produtoTipoAplicacao'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = '';
  });
}

function atualizarTabelaProdutos() {
  const produtosDB = db.load()?.produtos || [];
  const table = document.getElementById('produtosCadastradosTable');
  if (!table) return;

  if (produtosDB.length === 0) {
    table.innerHTML = '<tbody><tr><td colspan="6" style="text-align: center; color: var(--text-tertiary);">Nenhum produto cadastrado.</td></tr></tbody>';
    return;
  }

  let html = '<thead><tr><th>Nome</th><th>Categoria</th><th>Cultura</th><th>Dose</th><th>Custo</th><th>Acoes</th></tr></thead><tbody>';
  produtosDB.forEach(p => {
    html += '<tr><td><strong>' + p.nome + '</strong></td><td><span class="badge badge--info">' + p.categoria + '</span></td><td>' + p.cultura + '</td><td>' + (p.dose || '-') + '</td><td>R$ ' + p.custo.toFixed(2) + '</td><td><button class="btn btn--ghost btn--sm" onclick="removerProduto(' + p.id + ')" style="color: var(--color-error);">Remover</button></td></tr>';
  });
  html += '</tbody>';
  table.innerHTML = html;
}

function removerProduto(id) {
  if (!confirm('Remover este produto?')) return;
  const data = db.load();
  data.produtos = (data.produtos || []).filter(p => p.id !== id);
  db.save(data);
  atualizarTabelaProdutos();
  showToast('Produto removido.', 'info');
}

function exportarProdutos() {
  const produtosDB = db.load()?.produtos || [];
  if (produtosDB.length === 0) return;
  let csv = 'Nome,Fornecedor,Categoria,Cultura,Dose,Custo\n';
  produtosDB.forEach(p => csv += '"' + p.nome + '","' + p.fornecedor + '","' + p.categoria + '","' + p.cultura + '","' + (p.dose || '') + '",' + p.custo + '\n');
  downloadCSV(csv, 'produtos_cadastrados.csv');
}

// ============================================
// Utility Functions
// ============================================
function updateSelect(selectId, items) {
  const select = document.getElementById(selectId);
  if (!select) return;
  const current = select.value;
  select.innerHTML = '<option value="">Todos</option>';
  items.forEach(item => {
    const value = typeof item === 'object' ? item.value : item;
    const text = typeof item === 'object' ? item.text : item;
    const opt = document.createElement('option');
    opt.value = value;
    opt.textContent = text;
    if (value === current) opt.selected = true;
    select.appendChild(opt);
  });
}

function updateSidebarSelects() {
  if (!rawData.length) return;
  updateSelect('clienteSelect', [...new Set(rawData.map(d => d.Nome_Cliente))].sort());
  updateSelect('culturaSelect', [...new Set(rawData.map(d => d.Cultura))].sort());
  updateSelect('regiaoSelect', [...new Set(rawData.map(d => d.Regiao))].sort());
  updateSelect('statusSelect', [...new Set(rawData.map(d => d.Status_Cliente))].sort());
  updateSelect('productSelect', produtos.map(p => ({ value: p.key, text: p.display })));

  const count = document.getElementById('clienteCount');
  if (count) count.textContent = rawData.length;
}

function downloadTemplate() {
  const csv = 'ID_Cliente,Nome_Cliente,Cultura,Area_Hectares,Amino_Plus,Amino_Arginine,Amino_Proline,Amino_Fort,Amino_Reten,Amiorgan,Ajipower,Ajifol_Kmg,Ajifol_Premium_Plus,Ajifol_SM_Boro,Algen_Max,Bokashi,Status_Cliente,Regiao\n1,Fazenda ABC,Uva,50,1,1,0,1,0,1,0,1,1,0,0,1,Ativo,Sul\n2,Sitio XYZ,Manga,100,1,0,1,1,1,0,1,0,1,1,1,0,Ativo,Nordeste';
  downloadCSV(csv, 'template_carteira.csv');
}

function downloadCSV(csv, filename) {
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();
  URL.revokeObjectURL(link.href);
}

function destroyChart(chartId) {
  const key = chartId.replace('Chart', '');
  if (charts[key]) { charts[key].destroy(); delete charts[key]; }
}

function setDefaultDates() {
  const end = new Date();
  const start = new Date();
  start.setFullYear(start.getFullYear() - 1);
  const startDate = document.getElementById('startDate');
  const endDate = document.getElementById('endDate');
  if (startDate) startDate.value = start.toISOString().split('T')[0];
  if (endDate) endDate.value = end.toISOString().split('T')[0];
}

function updateActiveFilters() {
  // Simple active filter display
}

function updateSalesPeriodChart() {
  // Placeholder - would need date data from raw data
}

function updateOverviewReport() {
  const count = document.getElementById('kpiProdutosCadastrados');
  const prodDB = db.load()?.produtos || [];
  if (count) count.textContent = prodDB.length;

  const contatos = document.getElementById('kpiContatosRegistrados');
  if (contatos) contatos.textContent = contatosData.length;

  const diag = document.getElementById('kpiDiagnosticos');
  if (diag) diag.textContent = diagnosisData.length;
}

// ============================================
// Product List Search
// ============================================
function filterProducts() {
  const search = document.getElementById('productSearch').value.toLowerCase();
  const container = document.getElementById('cadastroProductFilters');
  if (!container) return;
  container.querySelectorAll('.checkbox-item').forEach(item => {
    const text = item.querySelector('span').textContent.toLowerCase();
    item.style.display = text.includes(search) ? 'flex' : 'none';
  });
}

function showProductList() {
  const container = document.getElementById('cadastroProductFilters');
  if (container) container.style.display = 'flex';
}

function hideProductListOnClickOutside(e) {
  const container = document.getElementById('cadastroProductFilters');
  const search = document.getElementById('productSearch');
  if (container && search && !container.contains(e.target) && e.target !== search) {
    container.style.display = 'none';
  }
}

function selectAllProducts() {
  document.querySelectorAll('#cadastroProductFilters input[type="checkbox"]').forEach(cb => cb.checked = true);
}

function clearAllProducts() {
  document.querySelectorAll('#cadastroProductFilters input[type="checkbox"]').forEach(cb => cb.checked = false);
}

// ============================================
// Export Functions
// ============================================
function exportCarteira() {
  if (filteredData.length === 0) { showToast('Nenhum dado para exportar.', 'error'); return; }
  let csv = 'ID,Cliente,Cultura,Area,Status,Regiao,Produtos\n';
  filteredData.forEach(c => {
    const qtd = produtos.filter(p => c.produtos[p.key] === 1).length;
    csv += c.ID_Cliente + ',"' + c.Nome_Cliente + '",' + c.Cultura + ',' + c.Area_Hectares + ',' + c.Status_Cliente + ',' + c.Regiao + ',' + qtd + '\n';
  });
  downloadCSV(csv, 'carteira_completa.csv');
}

function exportABC() {
  if (filteredData.length === 0) return;
  const score = filteredData.map(c => ({ ...c, qtd: produtos.filter(p => c.produtos[p.key] === 1).length, score: produtos.filter(p => c.produtos[p.key] === 1).length * c.Area_Hectares })).sort((a, b) => b.score - a.score);
  let csv = 'Cliente,Score,Classificacao\n';
  const totalScore = score.reduce((s, c) => s + c.score, 0);
  let cum = 0;
  score.forEach(c => {
    cum += c.score;
    const perc = (cum / totalScore) * 100;
    const cls = perc <= 80 ? 'A' : perc <= 95 ? 'B' : 'C';
    csv += '"' + c.Nome_Cliente + '",' + c.score.toFixed(0) + ',' + cls + '\n';
  });
  downloadCSV(csv, 'analise_abc.csv');
}

function exportOportunidades() {
  if (filteredData.length === 0) return;
  const gaps = filteredData.map(c => ({ nome: c.Nome_Cliente, gap: produtos.filter(p => c.produtos[p.key] === 0).length, potencial: produtos.filter(p => c.produtos[p.key] === 0).length * (c.Area_Hectares / 100) })).sort((a, b) => b.potencial - a.potencial);
  let csv = 'Cliente,Produtos_Gap,Potencial\n';
  gaps.forEach(g => csv += '"' + g.nome + '",' + g.gap + ',' + g.potencial.toFixed(0) + '\n');
  downloadCSV(csv, 'oportunidades.csv');
}

// ============================================
// PDF Generation
// ============================================
function generateTabPDF(tabName) {
  const names = { overview: 'Dashboard', penetracao: 'Penetracao', abc: 'ABC', cultura: 'Cultura', territorial: 'Territorial', gaps: 'Gaps', swot: 'SWOT', gut: 'GUT', fidelizacao: 'Fidelizacao' };
  showToast('Gerando PDF de ' + (names[tabName] || tabName) + '...', 'info');

  if (filteredData.length === 0) { showToast('Carregue dados antes de gerar PDF.', 'error'); return; }

  try {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text('InsightPro Agricola - ' + (names[tabName] || tabName), 20, 20);
    doc.setFontSize(10);
    doc.text('Gerado em: ' + new Date().toLocaleDateString('pt-BR'), 20, 30);
    doc.text('Total de clientes: ' + filteredData.length, 20, 40);
    doc.text('Area total: ' + filteredData.reduce((s, c) => s + c.Area_Hectares, 0).toLocaleString('pt-BR') + ' ha', 20, 50);
    doc.save('InsightPro_' + (names[tabName] || tabName) + '.pdf');
    showToast('PDF gerado com sucesso!', 'success');
  } catch (e) {
    showToast('Erro ao gerar PDF.', 'error');
  }
}

function generatePDFReport() {
  if (filteredData.length === 0) { showToast('Carregue dados antes.', 'error'); return; }
  showToast('Gerando relatorio completo...', 'info');

  try {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    doc.setFontSize(20);
    doc.text('InsightPro Agricola', 20, 25);
    doc.setFontSize(12);
    doc.text('Relatorio Completo', 20, 35);
    doc.text('Data: ' + new Date().toLocaleDateString('pt-BR'), 20, 45);

    doc.setFontSize(14);
    doc.text('Resumo Executivo', 20, 60);
    doc.setFontSize(10);
    const total = filteredData.length;
    const area = filteredData.reduce((s, c) => s + c.Area_Hectares, 0);
    doc.text('Clientes: ' + total, 20, 70);
    doc.text('Area Total: ' + area.toLocaleString('pt-BR') + ' ha', 20, 78);
    doc.text('Culturas: ' + new Set(filteredData.map(d => d.Cultura)).size, 20, 86);
    doc.text('Produtos: ' + produtos.length, 20, 94);

    doc.save('InsightPro_Relatorio_Completo.pdf');
    showToast('Relatorio completo gerado!', 'success');
  } catch (e) {
    showToast('Erro ao gerar PDF.', 'error');
  }
}

function generateQuickPDF() {
  if (filteredData.length === 0) { showToast('Carregue dados antes.', 'error'); return; }
  showToast('Gerando resumo rapido...', 'info');

  try {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text('InsightPro - Resumo Rapido', 20, 25);
    doc.setFontSize(10);
    doc.text('Clientes: ' + filteredData.length, 20, 40);
    doc.text('Area Total: ' + filteredData.reduce((s, c) => s + c.Area_Hectares, 0).toLocaleString('pt-BR') + ' ha', 20, 48);
    doc.save('InsightPro_Resumo.pdf');
    showToast('Resumo gerado!', 'success');
  } catch (e) {
    showToast('Erro ao gerar PDF.', 'error');
  }
}

// ============================================
// Backup / Restore
// ============================================
function handleBackupImport(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const data = JSON.parse(e.target.result);
      if (data.rawData) {
        db.save(data);
        loadSavedData();
        showToast('Backup restaurado com sucesso!', 'success');
      } else {
        showToast('Arquivo de backup invalido.', 'error');
      }
    } catch (err) {
      showToast('Erro ao ler arquivo de backup.', 'error');
    }
  };
  reader.readAsText(file);
}

function updateDBStats() {
  const stats = db.getStats();
  const el = document.getElementById('dbStats');
  if (el && stats) {
    el.textContent = 'Clientes: ' + stats.clientes + ' | Produtos: ' + stats.produtos + ' | Contatos: ' + stats.contatos + ' | Ultima atualizacao: ' + new Date(stats.lastUpdate).toLocaleString('pt-BR');
  }
}

// ============================================
// Navigation helper
// ============================================
function navigateTo(section) {
  const navItem = document.querySelector('.nav-item[data-section="' + section + '"]');
  if (navItem) navItem.click();
}

// ============================================
// Logout
// ============================================
function logout() {
  sessionStorage.removeItem('auth');
  window.location.href = 'login.html';
}
