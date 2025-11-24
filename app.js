// Global variables for client portfolio management
let rawData = [];
let filteredData = [];
let produtos = [];
let gutData = [];
let swotData = {};
let contatosData = [];
let charts = {};

const CHART_COLORS = [
  '#1FB8CD', '#FFC185', '#B4413C', '#ECEBD5', '#5D878F',
  '#DB4545', '#D2BA4C', '#964325', '#944454', '#13343B'
];

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
  setupEventListeners();
  setupTabs();
  setupSidebar();
  loadSavedData();
});

function setupEventListeners() {
  const fileInput = document.getElementById('fileInput');
  fileInput.addEventListener('change', handleFileUpload);

  const uploadArea = document.getElementById('uploadArea');
  uploadArea.addEventListener('dragover', (e) => {
    e.preventDefault();
    uploadArea.style.borderColor = 'var(--color-primary)';
  });
  uploadArea.addEventListener('dragleave', () => {
    uploadArea.style.borderColor = 'var(--color-border)';
  });
  uploadArea.addEventListener('drop', (e) => {
    e.preventDefault();
    uploadArea.style.borderColor = 'var(--color-border)';
    const file = e.dataTransfer.files[0];
    if (file) processFile(file);
  });

  document.getElementById('downloadTemplate').addEventListener('click', downloadTemplate);
  document.getElementById('applyFilters').addEventListener('click', applyFilters);
  document.getElementById('exportCarteira')?.addEventListener('click', exportCarteira);
  document.getElementById('exportABC')?.addEventListener('click', exportABC);
  document.getElementById('exportOportunidades')?.addEventListener('click', exportOportunidades);
  document.getElementById('addGutItem').addEventListener('click', addGutItem);
  document.getElementById('exportGut').addEventListener('click', exportGut);
  document.getElementById('saveSWOT').addEventListener('click', saveSWOT);
  document.getElementById('addContato')?.addEventListener('click', addContato);
  document.getElementById('exportContatos')?.addEventListener('click', exportContatos);
  document.getElementById('cadastroApplyFilters')?.addEventListener('click', applyFilters);
  document.getElementById('resetCadastroForm')?.addEventListener('click', resetCadastroForm);
  document.getElementById('addNewItems')?.addEventListener('click', addNewItems);
  document.getElementById('addClienteData')?.addEventListener('click', addNewItems);
  
  // Additional event listeners for missing functionalities
  document.getElementById('savePEST')?.addEventListener('click', savePEST);
  document.getElementById('addCSRecord')?.addEventListener('click', addCSRecord);
  document.getElementById('exportCS')?.addEventListener('click', exportCS);
  document.getElementById('addMksRecord')?.addEventListener('click', addMksRecord);
  document.getElementById('exportMks')?.addEventListener('click', exportMks);
  document.getElementById('addVpmData')?.addEventListener('click', addVpmData);
  document.getElementById('saveDiagnosis')?.addEventListener('click', saveDiagnosis);
  document.getElementById('exportDiagnosis')?.addEventListener('click', exportDiagnosis);
  document.getElementById('exportData')?.addEventListener('click', exportCarteira);
  document.getElementById('exportReport')?.addEventListener('click', exportCarteira);
  
  // Backup/Restore event listeners
  document.getElementById('exportBackup')?.addEventListener('click', () => db.export());
  document.getElementById('importBackupBtn')?.addEventListener('click', () => document.getElementById('importBackup').click());
  document.getElementById('importBackup')?.addEventListener('change', handleBackupImport);
  
  // Cadastro produtos
  document.getElementById('salvarProduto')?.addEventListener('click', salvarProduto);
  document.getElementById('limparProduto')?.addEventListener('click', limparFormularioProduto);
  document.getElementById('exportProdutos')?.addEventListener('click', exportarProdutos);
  
  // Interactive products event listeners
  document.getElementById('productSearch')?.addEventListener('input', filterProducts);
  document.getElementById('productSearch')?.addEventListener('focus', showProductList);
  document.getElementById('selectAllProducts')?.addEventListener('click', selectAllProducts);
  document.getElementById('clearAllProducts')?.addEventListener('click', clearAllProducts);
  
  // Hide product list when clicking outside
  document.addEventListener('click', hideProductListOnClickOutside);
  
  // Period buttons event listeners
  document.getElementById('periodWeek')?.addEventListener('click', () => updateSalesPeriod('week'));
  document.getElementById('periodMonth')?.addEventListener('click', () => updateSalesPeriod('month'));
  document.getElementById('periodYear')?.addEventListener('click', () => updateSalesPeriod('year'));
  document.getElementById('applyDateRange')?.addEventListener('click', applyCustomDateRange);
  document.getElementById('logoutBtn')?.addEventListener('click', logout);
  
  // Set default dates
  setDefaultDates();
  
  // Update database stats
  updateDBStats();
  // PDF buttons for each tab
  document.getElementById('overviewPDF')?.addEventListener('click', () => generateTabPDF('overview'));
  document.getElementById('penetracaoPDF')?.addEventListener('click', () => generateTabPDF('penetracao'));
  document.getElementById('abcPDF')?.addEventListener('click', () => generateTabPDF('abc'));
  document.getElementById('culturaPDF')?.addEventListener('click', () => generateTabPDF('cultura'));
  document.getElementById('oportunidadesPDF')?.addEventListener('click', () => generateTabPDF('oportunidades'));
  document.getElementById('territorialPDF')?.addEventListener('click', () => generateTabPDF('territorial'));
  document.getElementById('gapsPDF')?.addEventListener('click', () => generateTabPDF('gaps'));
  document.getElementById('swotPDF')?.addEventListener('click', () => generateTabPDF('swot'));
  document.getElementById('gutPDF')?.addEventListener('click', () => generateTabPDF('gut'));
  document.getElementById('fidelizacaoPDF')?.addEventListener('click', () => generateTabPDF('fidelizacao'));
  document.getElementById('relatorioPDF')?.addEventListener('click', () => generateTabPDF('relatorio'));
  document.getElementById('generatePDFReport')?.addEventListener('click', generatePDFReport);
  document.getElementById('generateQuickPDF')?.addEventListener('click', generateQuickPDF);
}

function setupTabs() {
  const tabBtns = document.querySelectorAll('.tab-btn');
  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetTab = btn.dataset.tab;
      document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
      document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
      btn.classList.add('active');
      document.getElementById(targetTab).classList.add('active');
      if (rawData.length > 0 && targetTab !== 'upload') {
        setTimeout(() => updateAllAnalyses(), 100);
      }
      if (targetTab === 'produtos') {
        setTimeout(() => atualizarTabelaProdutos(), 100);
      }
    });
  });
}

function setupSidebar() {
  const sidebar = document.getElementById('sidebar');
  const sidebarToggle = document.getElementById('sidebarToggle');
  const mobileMenuBtn = document.getElementById('mobileMenuBtn');
  mobileMenuBtn.addEventListener('click', () => sidebar.classList.add('active'));
  sidebarToggle.addEventListener('click', () => sidebar.classList.remove('active'));
}

function handleFileUpload(event) {
  const file = event.target.files[0];
  if (file) processFile(file);
}

function processFile(file) {
  const fileStatus = document.getElementById('fileStatus');
  fileStatus.style.display = 'block';
  fileStatus.className = 'file-status';
  fileStatus.textContent = 'Processando arquivo...';

  const fileExtension = file.name.split('.').pop().toLowerCase();

  if (fileExtension === 'csv') {
    Papa.parse(file, {
      header: true,
      dynamicTyping: true,
      skipEmptyLines: true,
      complete: (results) => processData(results.data),
      error: (error) => showError('Erro ao ler arquivo CSV: ' + error.message)
    });
  } else if (fileExtension === 'xlsx' || fileExtension === 'xls') {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(firstSheet);
        processData(jsonData);
      } catch (error) {
        showError('Erro ao ler arquivo Excel: ' + error.message);
      }
    };
    reader.readAsArrayBuffer(file);
  } else {
    showError('Formato de arquivo não suportado. Use CSV ou Excel.');
  }
}

function processData(data) {
  const fileStatus = document.getElementById('fileStatus');
  
  if (!data || data.length === 0) {
    showError('Arquivo vazio ou sem dados válidos.');
    return;
  }

  const firstRow = data[0];
  const columns = Object.keys(firstRow);
  
  const requiredColumns = ['ID_Cliente', 'Nome_Cliente', 'Cultura', 'Area_Hectares'];
  const missingColumns = requiredColumns.filter(col => !columns.includes(col));
  if (missingColumns.length > 0) {
    showError(`Colunas obrigatórias faltando: ${missingColumns.join(', ')}`);
    return;
  }

  // Identify product columns - accept real product names or generic format
  const productMapping = {
    'Amino_Plus': 'AminoPlus® AJINOMOTO',
    'Amino_Arginine': 'Amino Arginine® AJINOMOTO',
    'Amino_Proline': 'Amino Proline® AJINOMOTO',
    'Amino_Fort': 'AminoFort® AJINOMOTO',
    'Amino_Reten': 'AminoReten® AJINOMOTO',
    'Amiorgan': 'Amiorgan® AJINOMOTO',
    'Ajipower': 'AjiPower® AJINOMOTO',
    'Ajifol_Kmg': 'Ajifol® K-Mg AJINOMOTO',
    'Ajifol_Premium_Plus': 'Ajifol® Premium+ AJINOMOTO',
    'Ajifol_SM_Boro': 'Ajifol® SM-Boro AJINOMOTO',
    'Algen_Max': 'AlgenMax® AJINOMOTO',
    'Bokashi': 'Bokashi® AJINOMOTO'
  };
  
  // Try to find real product columns
  produtos = [];
  Object.keys(productMapping).forEach(prodKey => {
    // Check for exact match or variations
    const found = columns.find(col => 
      col === prodKey || 
      col === prodKey.replace(/_/g, ' ') || 
      col === prodKey.replace(/_/g, '') ||
      col === productMapping[prodKey] ||
      col === productMapping[prodKey].replace(/ /g, '_') ||
      col === productMapping[prodKey].replace(/ /g, '')
    );
    if (found) {
      produtos.push({ column: found, key: prodKey, display: productMapping[prodKey] });
    }
  });
  
  // Fallback to generic Produto_1, Produto_2 format if no real products found
  if (produtos.length === 0) {
    const genericProducts = columns.filter(col => col.startsWith('Produto_'));
    if (genericProducts.length > 0) {
      produtos = genericProducts.map(col => ({
        column: col,
        key: col,
        display: col.replace('Produto_', 'Produto ')
      }));
    }
  }
  
  if (produtos.length === 0) {
    showError('Nenhuma coluna de produto encontrada. Use: Amino_Plus, Amino_Arginine, etc.');
    return;
  }

  rawData = data.filter(row => {
    return row.ID_Cliente && row.Nome_Cliente && row.Cultura && row.Area_Hectares !== null;
  }).map(row => {
    const cleanRow = {
      ID_Cliente: row.ID_Cliente,
      Nome_Cliente: String(row.Nome_Cliente).trim(),
      Cultura: String(row.Cultura).trim(),
      Area_Hectares: parseFloat(row.Area_Hectares),
      Status_Cliente: row.Status_Cliente || 'Ativo',
      Regiao: row.Regiao || 'Não informado',
      produtos: {}
    };
    produtos.forEach(prod => {
      const colName = prod.column || prod;
      const prodKey = prod.key || prod;
      cleanRow.produtos[prodKey] = row[colName] === 1 || row[colName] === '1' ? 1 : 0;
    });
    return cleanRow;
  });

  if (rawData.length === 0) {
    showError('Nenhum dado válido encontrado no arquivo.');
    return;
  }

  filteredData = [...rawData];

  fileStatus.className = 'file-status success';
  fileStatus.textContent = `✓ Arquivo carregado com sucesso! ${rawData.length} clientes encontrados.`;

  showDataPreview(rawData.slice(0, 10));
  initializeFilters();
  updateAllAnalyses();
}

function showError(message) {
  const fileStatus = document.getElementById('fileStatus');
  fileStatus.style.display = 'block';
  fileStatus.className = 'file-status error';
  fileStatus.textContent = '✗ ' + message;
}

function showDataPreview(data) {
  const preview = document.getElementById('dataPreview');
  const table = document.getElementById('previewTable');
  
  if (data.length === 0) {
    preview.style.display = 'none';
    return;
  }

  preview.style.display = 'block';

  const prodCount = produtos.length;
  let html = '<thead><tr><th>ID</th><th>Cliente</th><th>Cultura</th><th>Área (ha)</th><th>Status</th><th>Região</th><th>Produtos</th><th>Ações</th></tr></thead><tbody>';

  data.forEach(row => {
    const produtosUsando = produtos.filter(p => {
      const key = p.key || p;
      return row.produtos[key] === 1;
    }).length;
    html += '<tr>';
    html += `<td>${row.ID_Cliente}</td>`;
    html += `<td>${row.Nome_Cliente}</td>`;
    html += `<td>${row.Cultura}</td>`;
    html += `<td>${row.Area_Hectares.toLocaleString('pt-BR')}</td>`;
    html += `<td>${row.Status_Cliente}</td>`;
    html += `<td>${row.Regiao}</td>`;
    html += `<td>${produtosUsando}/${prodCount}</td>`;
    html += `<td><button class="btn btn--sm" onclick="editClient('${row.ID_Cliente}')">✏️</button> <button class="btn btn--sm" onclick="removeClient('${row.ID_Cliente}')">🗑️</button></td>`;
    html += '</tr>';
  });

  html += '</tbody>';
  table.innerHTML = html;
}

function editClient(clientId) {
  const client = rawData.find(c => c.ID_Cliente == clientId);
  if (!client) return;
  
  // Fill form with client data
  document.getElementById('cadastroClienteId').value = client.ID_Cliente;
  document.getElementById('cadastroClienteNome').value = client.Nome_Cliente;
  document.getElementById('cadastroCulturaInput').value = client.Cultura;
  document.getElementById('cadastroRegiaoInput').value = client.Regiao;
  document.getElementById('cadastroStatusInput').value = client.Status_Cliente;
  document.getElementById('cadastroAreaInput').value = client.Area_Hectares;
  
  // Set product checkboxes
  document.querySelectorAll('#cadastroProductFilters input[type="checkbox"]').forEach(cb => {
    cb.checked = client.produtos[cb.value] === 1;
  });
  
  // Change button to update mode
  const addBtn = document.getElementById('addClienteData');
  if (addBtn) {
    addBtn.textContent = 'Atualizar Cliente';
    addBtn.onclick = () => updateClient(clientId);
  }
}

function updateClient(clientId) {
  const clientIndex = rawData.findIndex(c => c.ID_Cliente == clientId);
  if (clientIndex === -1) return;
  
  const newClienteNome = document.getElementById('cadastroClienteNome')?.value?.trim();
  const newCultura = document.getElementById('cadastroCulturaInput')?.value?.trim();
  const newRegiao = document.getElementById('cadastroRegiaoInput')?.value?.trim();
  const newStatus = document.getElementById('cadastroStatusInput')?.value?.trim();
  const newArea = parseFloat(document.getElementById('cadastroAreaInput')?.value) || 0;
  
  if (!newClienteNome || !newCultura || !newArea) {
    alert('Preencha todos os campos obrigatórios.');
    return;
  }
  
  // Update client data
  rawData[clientIndex].Nome_Cliente = newClienteNome;
  rawData[clientIndex].Cultura = newCultura;
  rawData[clientIndex].Regiao = newRegiao || 'Não informado';
  rawData[clientIndex].Status_Cliente = newStatus || 'Ativo';
  rawData[clientIndex].Area_Hectares = newArea;
  
  // Update products
  const selectedProducts = Array.from(document.querySelectorAll('#cadastroProductFilters input:checked')).map(cb => cb.value);
  produtos.forEach(prod => {
    const prodKey = prod.key || prod;
    rawData[clientIndex].produtos[prodKey] = selectedProducts.includes(prodKey) ? 1 : 0;
  });
  
  // Update filtered data and refresh
  filteredData = [...rawData];
  initializeFilters();
  updateSidebarSelects();
  updateAllAnalyses();
  autoSave();
  
  // Reset form
  resetCadastroForm();
  
  alert(`Cliente ${newClienteNome} atualizado com sucesso!`);
}

function removeClient(clientId) {
  if (!confirm('Tem certeza que deseja remover este cliente?')) return;
  
  const clientIndex = rawData.findIndex(c => c.ID_Cliente == clientId);
  if (clientIndex === -1) return;
  
  const clientName = rawData[clientIndex].Nome_Cliente;
  rawData.splice(clientIndex, 1);
  
  // Update filtered data and refresh
  filteredData = [...rawData];
  initializeFilters();
  updateSidebarSelects();
  updateAllAnalyses();
  autoSave();
  
  alert(`Cliente ${clientName} removido com sucesso!`);
}

function generateUniqueClientId(clienteName) {
  // Remove accents and special characters
  const cleanName = clienteName
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z\s]/g, '')
    .toUpperCase();
  
  // Get initials or first 3 letters
  const words = cleanName.split(' ').filter(w => w.length > 0);
  let baseId;
  
  if (words.length >= 2) {
    // Use initials for multiple words (e.g., "João Silva" -> "JS")
    baseId = words.map(w => w.charAt(0)).join('').substring(0, 3);
  } else {
    // Use first 3 letters for single word (e.g., "Fazenda" -> "FAZ")
    baseId = words[0].substring(0, 3);
  }
  
  // Add sequential number
  let counter = 1;
  let finalId = `${baseId}${counter.toString().padStart(3, '0')}`;
  
  // Check for existing IDs and increment
  while (rawData.some(c => c.ID_Cliente === finalId)) {
    counter++;
    finalId = `${baseId}${counter.toString().padStart(3, '0')}`;
  }
  
  return finalId;
}

function resetCadastroForm() {
  document.getElementById('cadastroClienteNome').value = '';
  document.getElementById('cadastroClienteId').value = 'Será gerado automaticamente';
  document.getElementById('cadastroCulturaInput').value = '';
  document.getElementById('cadastroRegiaoInput').value = '';
  document.getElementById('cadastroStatusInput').value = '';
  document.getElementById('cadastroAreaInput').value = '';
  
  document.querySelectorAll('#cadastroProductFilters input[type="checkbox"]').forEach(cb => cb.checked = false);
  
  const addBtn = document.getElementById('addClienteData');
  if (addBtn) {
    addBtn.textContent = 'Adicionar Cliente';
    addBtn.onclick = addNewItems;
  }
}

function initializeFilters() {
  const culturas = [...new Set(rawData.map(d => d.Cultura))].sort();
  const regioes = [...new Set(rawData.map(d => d.Regiao))].sort();
  const statuses = [...new Set(rawData.map(d => d.Status_Cliente))].sort();
  const clientes = [...new Set(rawData.map(d => d.Nome_Cliente))].sort();

  // Initialize default products if none exist
  if (produtos.length === 0) {
    produtos = [
      { key: 'Amino_Plus', display: 'AminoPlus® AJINOMOTO' },
      { key: 'Amino_Arginine', display: 'Amino Arginine® AJINOMOTO' },
      { key: 'Amino_Proline', display: 'Amino Proline® AJINOMOTO' },
      { key: 'Amino_Fort', display: 'AminoFort® AJINOMOTO' },
      { key: 'Amino_Reten', display: 'AminoReten® AJINOMOTO' },
      { key: 'Amiorgan', display: 'Amiorgan® AJINOMOTO' },
      { key: 'Ajipower', display: 'AjiPower® AJINOMOTO' },
      { key: 'Ajifol_Kmg', display: 'Ajifol® K-Mg AJINOMOTO' },
      { key: 'Ajifol_Premium_Plus', display: 'Ajifol® Premium+ AJINOMOTO' },
      { key: 'Ajifol_SM_Boro', display: 'Ajifol® SM-Boro AJINOMOTO' },
      { key: 'Algen_Max', display: 'AlgenMax® AJINOMOTO' },
      { key: 'Bokashi', display: 'Bokashi® AJINOMOTO' },
      { key: 'Amino_Glycine', display: 'Amino Glycine® AJINOMOTO' },
      { key: 'Amino_Tryptophan', display: 'Amino Tryptophan® AJINOMOTO' },
      { key: 'Amino_Lysine', display: 'Amino Lysine® AJINOMOTO' },
      { key: 'Amino_Methionine', display: 'Amino Methionine® AJINOMOTO' },
      { key: 'Ajifol_Calcium', display: 'Ajifol® Calcium AJINOMOTO' },
      { key: 'Ajifol_Zinc', display: 'Ajifol® Zinc AJINOMOTO' },
      { key: 'Ajifol_Iron', display: 'Ajifol® Iron AJINOMOTO' },
      { key: 'AjiGreen', display: 'AjiGreen® AJINOMOTO' },
      { key: 'AjiRoot', display: 'AjiRoot® AJINOMOTO' },
      { key: 'AjiFlower', display: 'AjiFlower® AJINOMOTO' },
      { key: 'AjiFruit', display: 'AjiFruit® AJINOMOTO' },
      { key: 'AjiVeg', display: 'AjiVeg® AJINOMOTO' },
      { key: 'Umami_Plus', display: 'Umami Plus® AJINOMOTO' },
      { key: 'Bio_Stimulant', display: 'Bio Stimulant® AJINOMOTO' },
      { key: 'Nutri_Complex', display: 'Nutri Complex® AJINOMOTO' },
      { key: 'Growth_Enhancer', display: 'Growth Enhancer® AJINOMOTO' },
      { key: 'Soil_Conditioner', display: 'Soil Conditioner® AJINOMOTO' },
      { key: 'Plant_Activator', display: 'Plant Activator® AJINOMOTO' }
    ];
  }

  // Update sidebar selects - these are the main filters
  updateSelect('clienteSelect', clientes);
  updateSelect('culturaSelect', culturas);
  updateSelect('regiaoSelect', regioes);
  updateSelect('statusSelect', statuses);
  updateSelect('productSelect', produtos.map(p => ({ value: p.key || p, text: p.display || p.replace('Produto_', 'Produto ') })));

  // Update contact select
  const contatoCliente = document.getElementById('contatoCliente');
  if (contatoCliente) {
    contatoCliente.innerHTML = '<option value="">Selecione um cliente</option>';
    rawData.forEach(cliente => {
      contatoCliente.innerHTML += `<option value="${cliente.ID_Cliente}">${cliente.Nome_Cliente}</option>`;
    });
  }
  
  // Update other selects that depend on data
  const affectedProduct = document.getElementById('affectedProduct');
  if (affectedProduct && produtos.length > 0) {
    affectedProduct.innerHTML = '<option value="">Selecione um produto</option>';
    produtos.forEach(prod => {
      const prodDisplay = prod.display || prod.replace('Produto_', 'Produto ');
      affectedProduct.innerHTML += `<option value="${prodDisplay}">${prodDisplay}</option>`;
    });
  }
  
  const csProduct = document.getElementById('csProduct');
  if (csProduct && produtos.length > 0) {
    csProduct.innerHTML = '<option value="">Selecione um produto</option>';
    produtos.forEach(prod => {
      const prodDisplay = prod.display || prod.replace('Produto_', 'Produto ');
      csProduct.innerHTML += `<option value="${prodDisplay}">${prodDisplay}</option>`;
    });
  }
  
  const vpmProduct = document.getElementById('vpmProduct');
  if (vpmProduct && produtos.length > 0) {
    vpmProduct.innerHTML = '<option value="">Selecione um produto</option>';
    produtos.forEach(prod => {
      const prodDisplay = prod.display || prod.replace('Produto_', 'Produto ');
      vpmProduct.innerHTML += `<option value="${prodDisplay}">${prodDisplay}</option>`;
    });
  }

  // Populate cadastro filters for viewing existing data
  const cadastroCulturaFilters = document.getElementById('cadastroCulturaFilters');
  const cadastroRegiaoFilters = document.getElementById('cadastroRegiaoFilters');
  const cadastroStatusFilters = document.getElementById('cadastroStatusFilters');
  const cadastroProductFilters = document.getElementById('cadastroProductFilters');

  if (cadastroCulturaFilters) {
    cadastroCulturaFilters.innerHTML = '';
    culturas.forEach(cultura => {
      cadastroCulturaFilters.innerHTML += `<label class="checkbox-item"><input type="checkbox" value="${cultura}" checked><span>${cultura}</span></label>`;
    });
  }

  if (cadastroRegiaoFilters) {
    cadastroRegiaoFilters.innerHTML = '';
    regioes.forEach(regiao => {
      cadastroRegiaoFilters.innerHTML += `<label class="checkbox-item"><input type="checkbox" value="${regiao}" checked><span>${regiao}</span></label>`;
    });
  }

  if (cadastroStatusFilters) {
    cadastroStatusFilters.innerHTML = '';
    statuses.forEach(status => {
      cadastroStatusFilters.innerHTML += `<label class="checkbox-item"><input type="checkbox" value="${status}" checked><span>${status}</span></label>`;
    });
  }

  // Product selection for new clients (unchecked by default)
  if (cadastroProductFilters) {
    cadastroProductFilters.innerHTML = '';
    produtos.forEach(prod => {
      const prodKey = prod.key || prod;
      const prodDisplay = prod.display || prod.replace('Produto_', 'Produto ');
      cadastroProductFilters.innerHTML += `<label class="checkbox-item"><input type="checkbox" value="${prodKey}" onchange="updateProductCount()"><span>${prodDisplay}</span></label>`;
    });
    updateProductCount();
  }

  // Update data preview to show current data
  showDataPreview(rawData.slice(0, 10));
  
  // Update produtos table if on produtos tab
  setTimeout(() => atualizarTabelaProdutos(), 100);
  
  // Update overview report
  updateOverviewReport();
}

function applyFilters() {
  const selectedCliente = document.getElementById('clienteSelect')?.value || '';
  const selectedCultura = document.getElementById('culturaSelect')?.value || '';
  const selectedRegiao = document.getElementById('regiaoSelect')?.value || '';
  const selectedStatus = document.getElementById('statusSelect')?.value || '';
  const selectedProduct = document.getElementById('productSelect')?.value || '';

  filteredData = rawData.filter(row => {
    const matchesCliente = !selectedCliente || row.Nome_Cliente === selectedCliente;
    const matchesCultura = !selectedCultura || row.Cultura === selectedCultura;
    const matchesRegiao = !selectedRegiao || row.Regiao === selectedRegiao;
    const matchesStatus = !selectedStatus || row.Status_Cliente === selectedStatus;
    
    let matchesProduct = true;
    if (selectedProduct) {
      const prodKey = selectedProduct;
      matchesProduct = row.produtos[prodKey] === 1;
    }
    
    return matchesCliente && matchesCultura && matchesRegiao && matchesStatus && matchesProduct;
  });

  updateAllAnalyses();
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

function updateOverview() {
  updateActiveFilters();
  updateSalesPeriodChart();
  
  const totalClientes = filteredData.length;
  const culturas = new Set(filteredData.map(d => d.Cultura)).size;
  const areaTotal = filteredData.reduce((sum, d) => sum + d.Area_Hectares, 0);
  const mediaArea = areaTotal / totalClientes;
  const numProdutos = produtos.length;

  // Calculate penetration
  const prodPenetration = {};
  produtos.forEach(prod => {
    const prodKey = prod.key || prod;
    prodPenetration[prodKey] = filteredData.filter(c => c.produtos[prodKey] === 1).length;
  });
  const maxProd = Object.entries(prodPenetration).sort((a, b) => b[1] - a[1])[0];
  const maxProdObj = produtos.find(p => (p.key || p) === maxProd[0]);
  const maxProdName = maxProdObj ? (maxProdObj.display || maxProd[0]).split(' ')[0] : '-';

  document.getElementById('kpiTotalClientes').textContent = totalClientes;
  document.getElementById('kpiCulturas').textContent = culturas;
  document.getElementById('kpiAreaTotal').textContent = areaTotal.toLocaleString('pt-BR', { minimumFractionDigits: 0 });
  document.getElementById('kpiMediaArea').textContent = mediaArea.toFixed(1);
  document.getElementById('kpiProdutos').textContent = numProdutos;
  document.getElementById('kpiMaiorPenetracao').textContent = maxProdName;
  
  // Update overview report
  updateOverviewReport();

  // Client summary table
  const table = document.getElementById('clienteSummaryTable');
  let html = '<thead><tr><th>Cliente</th><th>Cultura</th><th>Área (ha)</th><th>Região</th><th>Status</th><th>Qtd Produtos</th><th>Participação %</th></tr></thead><tbody>';
  
  filteredData.slice(0, 50).forEach(row => {
    const qtdProdutos = produtos.filter(p => {
      const key = p.key || p;
      return row.produtos[key] === 1;
    }).length;
    const participacao = (qtdProdutos / numProdutos * 100).toFixed(1);
    html += '<tr>';
    html += `<td><strong>${row.Nome_Cliente}</strong></td>`;
    html += `<td>${row.Cultura}</td>`;
    html += `<td>${row.Area_Hectares.toLocaleString('pt-BR')}</td>`;
    html += `<td>${row.Regiao}</td>`;
    html += `<td>${row.Status_Cliente}</td>`;
    html += `<td>${qtdProdutos}/${numProdutos}</td>`;
    html += `<td>${participacao}%</td>`;
    html += '</tr>';
  });
  html += '</tbody>';
  table.innerHTML = html;

  // Culture summary
  const culturaSummary = {};
  filteredData.forEach(row => {
    if (!culturaSummary[row.Cultura]) {
      culturaSummary[row.Cultura] = { count: 0, area: 0, produtos: {} };
    }
    culturaSummary[row.Cultura].count++;
    culturaSummary[row.Cultura].area += row.Area_Hectares;
  });

  const culturaTable = document.getElementById('culturaSummaryTable');
  html = '<thead><tr><th>Cultura</th><th>Nº Clientes</th><th>Área Total (ha)</th><th>Área Média (ha)</th></tr></thead><tbody>';
  Object.entries(culturaSummary).forEach(([cultura, data]) => {
    html += '<tr>';
    html += `<td><strong>${cultura}</strong></td>`;
    html += `<td>${data.count}</td>`;
    html += `<td>${data.area.toLocaleString('pt-BR', { minimumFractionDigits: 0 })}</td>`;
    html += `<td>${(data.area / data.count).toFixed(1)}</td>`;
    html += '</tr>';
  });
  html += '</tbody>';
  culturaTable.innerHTML = html;
}

function updatePenetracao() {
  const penetracao = [];
  produtos.forEach(prod => {
    const prodKey = prod.key || prod;
    const prodDisplay = prod.display || prod.replace('Produto_', 'Produto ');
    const clientesUsando = filteredData.filter(c => c.produtos[prodKey] === 1).length;
    const percentual = (clientesUsando / filteredData.length * 100);
    penetracao.push({
      produto: prodDisplay,
      prodKey: prodKey,
      clientes: clientesUsando,
      percentual: percentual
    });
  });

  penetracao.sort((a, b) => b.percentual - a.percentual);

  // Chart
  destroyChart('penetracaoChart');
  const ctx = document.getElementById('penetracaoChart').getContext('2d');
  charts.penetracao = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: penetracao.map(p => p.produto),
      datasets: [{
        label: 'Penetração (%)',
        data: penetracao.map(p => p.percentual),
        backgroundColor: CHART_COLORS[0]
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: { y: { beginAtZero: true, max: 100 } },
      plugins: { legend: { display: false } }
    }
  });

  // Table
  const table = document.getElementById('penetracaoTable');
  let html = '<thead><tr><th>Produto</th><th>Clientes</th><th>Penetração %</th><th>Classificação</th></tr></thead><tbody>';
  penetracao.forEach(p => {
    let classif = 'GAP';
    if (p.percentual >= 60) classif = 'TOP';
    else if (p.percentual >= 30) classif = 'MÉDIO';
    const classifColor = classif === 'TOP' ? 'satisfaction-high' : (classif === 'MÉDIO' ? 'satisfaction-medium' : 'satisfaction-low');
    html += '<tr>';
    html += `<td><strong>${p.produto}</strong></td>`;
    html += `<td>${p.clientes}</td>`;
    html += `<td>${p.percentual.toFixed(1)}%</td>`;
    html += `<td><span class="${classifColor}">${classif}</span></td>`;
    html += '</tr>';
  });
  html += '</tbody>';
  table.innerHTML = html;

  // Opportunities
  const oportunidades = document.getElementById('produtoOportunidades');
  const gaps = penetracao.filter(p => p.percentual < 30);
  if (gaps.length > 0) {
    let opHtml = '<div class="diagnosis-item">';
    opHtml += '<h4>🎯 Produtos com Baixa Penetração</h4>';
    opHtml += '<p>Oportunidades de crescimento:</p><ul class="outlier-list">';
    gaps.forEach(g => {
      const potencial = filteredData.length - g.clientes;
      opHtml += `<li><strong>${g.produto}:</strong> ${potencial} clientes potenciais (${(100 - g.percentual).toFixed(1)}% do mercado)</li>`;
    });
    opHtml += '</ul></div>';
    oportunidades.innerHTML = opHtml;
  } else {
    oportunidades.innerHTML = '<p>Todos os produtos têm boa penetração!</p>';
  }
}

function updateABC() {
  const clienteScore = filteredData.map(cliente => {
    const qtdProdutos = produtos.filter(p => {
      const key = p.key || p;
      return cliente.produtos[key] === 1;
    }).length;
    const score = qtdProdutos * cliente.Area_Hectares;
    return { ...cliente, qtdProdutos, score };
  });

  clienteScore.sort((a, b) => b.score - a.score);

  const totalScore = clienteScore.reduce((sum, c) => sum + c.score, 0);
  let cumulative = 0;
  const abcData = clienteScore.map(cliente => {
    cumulative += cliente.score;
    const cumulativePercent = (cumulative / totalScore) * 100;
    let classification = 'C';
    if (cumulativePercent <= 80) classification = 'A';
    else if (cumulativePercent <= 95) classification = 'B';
    return { ...cliente, cumulativePercent, classification };
  });

  // Pareto Chart
  destroyChart('abcParetoChart');
  const ctx = document.getElementById('abcParetoChart').getContext('2d');
  charts.abcPareto = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: abcData.slice(0, 20).map(c => c.Nome_Cliente),
      datasets: [
        {
          label: 'Score',
          data: abcData.slice(0, 20).map(c => c.score),
          backgroundColor: CHART_COLORS[0],
          yAxisID: 'y'
        },
        {
          label: '% Acumulado',
          data: abcData.slice(0, 20).map(c => c.cumulativePercent),
          type: 'line',
          borderColor: CHART_COLORS[2],
          backgroundColor: 'transparent',
          yAxisID: 'y1',
          tension: 0.4
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: { type: 'linear', position: 'left', beginAtZero: true },
        y1: { type: 'linear', position: 'right', beginAtZero: true, max: 100, grid: { drawOnChartArea: false } }
      }
    }
  });

  // ABC Table
  const table = document.getElementById('clienteAbcTable');
  let html = '<thead><tr><th>Classe</th><th>Cliente</th><th>Cultura</th><th>Área</th><th>Produtos</th><th>Score</th><th>% Acum.</th></tr></thead><tbody>';
  abcData.slice(0, 50).forEach(c => {
    html += '<tr>';
    html += `<td><span class="abc-badge abc-${c.classification.toLowerCase()}">${c.classification}</span></td>`;
    html += `<td><strong>${c.Nome_Cliente}</strong></td>`;
    html += `<td>${c.Cultura}</td>`;
    html += `<td>${c.Area_Hectares.toLocaleString('pt-BR')}</td>`;
    html += `<td>${c.qtdProdutos}</td>`;
    html += `<td>${c.score.toFixed(0)}</td>`;
    html += `<td>${c.cumulativePercent.toFixed(1)}%</td>`;
    html += '</tr>';
  });
  html += '</tbody>';
  table.innerHTML = html;

  // Matrix Chart
  destroyChart('matrizAreaProdutos');
  const ctx2 = document.getElementById('matrizAreaProdutos').getContext('2d');
  charts.matrizArea = new Chart(ctx2, {
    type: 'scatter',
    data: {
      datasets: [{
        label: 'Clientes',
        data: clienteScore.map(c => ({ x: c.qtdProdutos, y: c.Area_Hectares })),
        backgroundColor: CHART_COLORS[1] + '80'
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: { title: { display: true, text: 'Quantidade de Produtos' } },
        y: { title: { display: true, text: 'Área (hectares)' } }
      }
    }
  });
}

function updateCultura() {
  const culturaData = {};
  filteredData.forEach(cliente => {
    if (!culturaData[cliente.Cultura]) {
      culturaData[cliente.Cultura] = { clientes: 0, area: 0, produtos: {} };
    }
    culturaData[cliente.Cultura].clientes++;
    culturaData[cliente.Cultura].area += cliente.Area_Hectares;
    produtos.forEach(prod => {
      const prodKey = prod.key || prod;
      if (!culturaData[cliente.Cultura].produtos[prodKey]) {
        culturaData[cliente.Cultura].produtos[prodKey] = 0;
      }
      if (cliente.produtos[prodKey] === 1) {
        culturaData[cliente.Cultura].produtos[prodKey]++;
      }
    });
  });

  // Table
  const table = document.getElementById('culturaAnaliseTable');
  let html = '<thead><tr><th>Cultura</th><th>Clientes</th><th>Área Total</th><th>Área Média</th><th>Produtos Médio</th></tr></thead><tbody>';
  Object.entries(culturaData).forEach(([cultura, data]) => {
    const totalProdutos = Object.values(data.produtos).reduce((a, b) => a + b, 0);
    const mediaProdutos = (totalProdutos / data.clientes).toFixed(1);
    html += '<tr>';
    html += `<td><strong>${cultura}</strong></td>`;
    html += `<td>${data.clientes}</td>`;
    html += `<td>${data.area.toLocaleString('pt-BR', { minimumFractionDigits: 0 })}</td>`;
    html += `<td>${(data.area / data.clientes).toFixed(1)}</td>`;
    html += `<td>${mediaProdutos}</td>`;
    html += '</tr>';
  });
  html += '</tbody>';
  table.innerHTML = html;

  // Charts
  destroyChart('culturaClientesChart');
  const ctx1 = document.getElementById('culturaClientesChart').getContext('2d');
  charts.culturaClientes = new Chart(ctx1, {
    type: 'bar',
    data: {
      labels: Object.keys(culturaData),
      datasets: [{ data: Object.values(culturaData).map(d => d.clientes), backgroundColor: CHART_COLORS[3] }]
    },
    options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } }
  });

  destroyChart('culturaAreaChart');
  const ctx2 = document.getElementById('culturaAreaChart').getContext('2d');
  charts.culturaArea = new Chart(ctx2, {
    type: 'doughnut',
    data: {
      labels: Object.keys(culturaData),
      datasets: [{ data: Object.values(culturaData).map(d => d.area), backgroundColor: CHART_COLORS }]
    },
    options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom' } } }
  });

  // Heatmap
  const heatmap = document.getElementById('heatmapProdutoCultura');
  let heatHtml = '<div class="table-container"><table class="data-table"><thead><tr><th>Cultura</th>';
  produtos.forEach(prod => {
    const prodDisplay = prod.display || prod.replace('Produto_', 'P');
    const shortName = prodDisplay.split(' ')[0];
    heatHtml += `<th>${shortName}</th>`;
  });
  heatHtml += '</tr></thead><tbody>';
  
  Object.entries(culturaData).forEach(([cultura, data]) => {
    heatHtml += '<tr>';
    heatHtml += `<td><strong>${cultura}</strong></td>`;
    produtos.forEach(prod => {
      const prodKey = prod.key || prod;
      const penetracao = (data.produtos[prodKey] / data.clientes * 100).toFixed(0);
      const intensity = penetracao > 66 ? 'satisfaction-high' : (penetracao > 33 ? 'satisfaction-medium' : 'satisfaction-low');
      heatHtml += `<td><span class="${intensity}">${penetracao}%</span></td>`;
    });
    heatHtml += '</tr>';
  });
  heatHtml += '</tbody></table></div>';
  heatmap.innerHTML = heatHtml;
}

function updateOportunidades() {
  const mediaArea = filteredData.reduce((sum, c) => sum + c.Area_Hectares, 0) / filteredData.length;
  const mediaProdutos = produtos.map(prod => {
    const prodKey = prod.key || prod;
    return filteredData.filter(c => c.produtos[prodKey] === 1).length;
  }).reduce((a, b) => a + b, 0) / produtos.length;

  const quadrantes = { estrelas: [], oportunidades: [], nicho: [], evitar: [] };

  filteredData.forEach(cliente => {
    const qtdProdutos = produtos.filter(p => {
      const key = p.key || p;
      return cliente.produtos[key] === 1;
    }).length;
    const isGrandeCliente = cliente.Area_Hectares >= mediaArea;
    const isAltaPenetracao = qtdProdutos >= mediaProdutos;

    if (isGrandeCliente && isAltaPenetracao) quadrantes.estrelas.push(cliente);
    else if (isGrandeCliente && !isAltaPenetracao) quadrantes.oportunidades.push(cliente);
    else if (!isGrandeCliente && isAltaPenetracao) quadrantes.nicho.push(cliente);
    else quadrantes.evitar.push(cliente);
  });

  // Matrix Chart
  destroyChart('matrizOportunidadesChart');
  const ctx = document.getElementById('matrizOportunidadesChart').getContext('2d');
  const scatterData = [
    { x: 1, y: 1, r: quadrantes.estrelas.length * 5, label: 'Estrelas' },
    { x: 1, y: 0, r: quadrantes.oportunidades.length * 5, label: 'Oportunidades' },
    { x: 0, y: 1, r: quadrantes.nicho.length * 5, label: 'Nicho' },
    { x: 0, y: 0, r: quadrantes.evitar.length * 5, label: 'Evitar' }
  ];

  charts.matrizOp = new Chart(ctx, {
    type: 'bubble',
    data: {
      datasets: scatterData.map((d, i) => ({
        label: d.label,
        data: [d],
        backgroundColor: CHART_COLORS[i] + '60'
      }))
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: { min: -0.5, max: 1.5, ticks: { callback: (v) => v === 0 ? 'Pequeno' : v === 1 ? 'Grande' : '' } },
        y: { min: -0.5, max: 1.5, ticks: { callback: (v) => v === 0 ? 'Baixa' : v === 1 ? 'Alta' : '' } }
      }
    }
  });

  // Quadrants
  document.getElementById('quadranteEstrelas').innerHTML = `<p>${quadrantes.estrelas.length} clientes - Proteger e expandir</p>`;
  document.getElementById('quadranteOportunidades').innerHTML = `<p>${quadrantes.oportunidades.length} clientes - Aumentar penetração</p>`;
  document.getElementById('quadranteNicho').innerHTML = `<p>${quadrantes.nicho.length} clientes - Manter relacionamento</p>`;
  document.getElementById('quadranteEvitar').innerHTML = `<p>${quadrantes.evitar.length} clientes - Avaliar investimento</p>`;
}

function updateTerritorial() {
  const regiaoData = {};
  filteredData.forEach(cliente => {
    if (!regiaoData[cliente.Regiao]) {
      regiaoData[cliente.Regiao] = { clientes: 0, area: 0, produtos: {} };
    }
    regiaoData[cliente.Regiao].clientes++;
    regiaoData[cliente.Regiao].area += cliente.Area_Hectares;
  });

  const table = document.getElementById('territorialTable');
  let html = '<thead><tr><th>Região</th><th>Clientes</th><th>Área Total</th><th>% Clientes</th><th>% Área</th></tr></thead><tbody>';
  const totalClientes = filteredData.length;
  const totalArea = filteredData.reduce((sum, c) => sum + c.Area_Hectares, 0);
  
  Object.entries(regiaoData).forEach(([regiao, data]) => {
    html += '<tr>';
    html += `<td><strong>${regiao}</strong></td>`;
    html += `<td>${data.clientes}</td>`;
    html += `<td>${data.area.toLocaleString('pt-BR', { minimumFractionDigits: 0 })}</td>`;
    html += `<td>${(data.clientes / totalClientes * 100).toFixed(1)}%</td>`;
    html += `<td>${(data.area / totalArea * 100).toFixed(1)}%</td>`;
    html += '</tr>';
  });
  html += '</tbody>';
  table.innerHTML = html;

  destroyChart('regiaoClientesChart');
  const ctx1 = document.getElementById('regiaoClientesChart').getContext('2d');
  charts.regiaoClientes = new Chart(ctx1, {
    type: 'bar',
    data: {
      labels: Object.keys(regiaoData),
      datasets: [{ data: Object.values(regiaoData).map(d => d.clientes), backgroundColor: CHART_COLORS[5] }]
    },
    options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } }
  });

  destroyChart('regiaoAreaChart');
  const ctx2 = document.getElementById('regiaoAreaChart').getContext('2d');
  charts.regiaoArea = new Chart(ctx2, {
    type: 'pie',
    data: {
      labels: Object.keys(regiaoData),
      datasets: [{ data: Object.values(regiaoData).map(d => d.area), backgroundColor: CHART_COLORS }]
    },
    options: { responsive: true, maintainAspectRatio: false }
  });
}

function updateGaps() {
  const gapsData = filteredData.map(cliente => {
    const produtosUsando = produtos.filter(p => {
      const key = p.key || p;
      return cliente.produtos[key] === 1;
    });
    const produtosNaoUsando = produtos.filter(p => {
      const key = p.key || p;
      return cliente.produtos[key] === 0;
    });
    const potencial = produtosNaoUsando.length * (cliente.Area_Hectares / 100);
    return { ...cliente, produtosUsando, produtosNaoUsando, potencial };
  });

  gapsData.sort((a, b) => b.potencial - a.potencial);

  const table = document.getElementById('gapsTable');
  let html = '<thead><tr><th>Cliente</th><th>Usando</th><th>Gap (não usando)</th><th>Potencial</th></tr></thead><tbody>';
  gapsData.slice(0, 30).forEach(cliente => {
    html += '<tr>';
    html += `<td><strong>${cliente.Nome_Cliente}</strong></td>`;
    html += `<td>${cliente.produtosUsando.length} produtos</td>`;
    html += `<td>${cliente.produtosNaoUsando.length} produtos</td>`;
    html += `<td class="satisfaction-high">${cliente.potencial.toFixed(0)}</td>`;
    html += '</tr>';
  });
  html += '</tbody>';
  table.innerHTML = html;

  destroyChart('potencialChart');
  const ctx = document.getElementById('potencialChart').getContext('2d');
  charts.potencial = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: gapsData.slice(0, 15).map(c => c.Nome_Cliente),
      datasets: [{
        label: 'Score de Potencial',
        data: gapsData.slice(0, 15).map(c => c.potencial),
        backgroundColor: CHART_COLORS[6]
      }]
    },
    options: { responsive: true, maintainAspectRatio: false }
  });
}

function updateFidelizacao() {
  const basketData = filteredData.map(cliente => {
    const basket = produtos.filter(p => {
      const key = p.key || p;
      return cliente.produtos[key] === 1;
    }).length;
    return { ...cliente, basket };
  });

  const basketMedio = basketData.reduce((sum, c) => sum + c.basket, 0) / basketData.length;
  const clientesRisco = basketData.filter(c => c.basket === 1).length;
  const clientesTop = basketData.filter(c => c.basket >= 5).length;

  document.getElementById('kpiBasketMedio').textContent = basketMedio.toFixed(1);
  document.getElementById('kpiClientesRisco').textContent = clientesRisco;
  document.getElementById('kpiClientesTop').textContent = clientesTop;

  // Distribution
  const distribution = {};
  for (let i = 0; i <= produtos.length; i++) {
    distribution[i] = basketData.filter(c => c.basket === i).length;
  }

  destroyChart('basketDistChart');
  const ctx = document.getElementById('basketDistChart').getContext('2d');
  charts.basketDist = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: Object.keys(distribution),
      datasets: [{
        label: 'Clientes',
        data: Object.values(distribution),
        backgroundColor: CHART_COLORS[7]
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: { x: { title: { display: true, text: 'Quantidade de Produtos' } } }
    }
  });

  // Table
  basketData.sort((a, b) => b.basket - a.basket);
  const table = document.getElementById('basketTable');
  let html = '<thead><tr><th>Cliente</th><th>Cultura</th><th>Área</th><th>Basket Size</th><th>Status</th></tr></thead><tbody>';
  basketData.slice(0, 30).forEach(cliente => {
    const status = cliente.basket >= 5 ? 'satisfaction-high' : (cliente.basket >= 3 ? 'satisfaction-medium' : 'satisfaction-low');
    const statusText = cliente.basket >= 5 ? 'TOP' : (cliente.basket >= 3 ? 'MÉDIO' : 'RISCO');
    html += '<tr>';
    html += `<td><strong>${cliente.Nome_Cliente}</strong></td>`;
    html += `<td>${cliente.Cultura}</td>`;
    html += `<td>${cliente.Area_Hectares.toLocaleString('pt-BR')}</td>`;
    html += `<td>${cliente.basket}/${produtos.length}</td>`;
    html += `<td><span class="${status}">${statusText}</span></td>`;
    html += '</tr>';
  });
  html += '</tbody>';
  table.innerHTML = html;
}

function updateRelatorio() {
  const totalClientes = filteredData.length;
  const areaTotal = filteredData.reduce((sum, c) => sum + c.Area_Hectares, 0);
  
  const clienteScore = filteredData.map(c => {
    const qtd = produtos.filter(p => {
      const key = p.key || p;
      return c.produtos[key] === 1;
    }).length;
    return { ...c, qtd, score: qtd * c.Area_Hectares };
  }).sort((a, b) => b.score - a.score);

  const penetracao = produtos.map(prod => {
    const prodKey = prod.key || prod;
    const prodDisplay = prod.display || prod.replace('Produto_', 'Produto ');
    const count = filteredData.filter(c => c.produtos[prodKey] === 1).length;
    return { produto: prodDisplay, count, perc: (count / totalClientes * 100) };
  }).sort((a, b) => b.perc - a.perc);

  const relatorio = document.getElementById('relatorioExecutivo');
  let html = '<div class="diagnosis-item">';
  html += '<h3>📊 Resumo Executivo</h3>';
  html += `<p><strong>Total de Clientes:</strong> ${totalClientes}</p>`;
  html += `<p><strong>Área Total:</strong> ${areaTotal.toLocaleString('pt-BR')} hectares</p>`;
  html += `<p><strong>Média de Produtos por Cliente:</strong> ${(filteredData.reduce((s, c) => s + produtos.filter(p => { const key = p.key || p; return c.produtos[key] === 1; }).length, 0) / totalClientes).toFixed(1)}</p>`;
  html += '</div>';
  relatorio.innerHTML = html;

  // Top 5 Clients
  destroyChart('top5ClientesChart');
  const ctx1 = document.getElementById('top5ClientesChart').getContext('2d');
  charts.top5Clientes = new Chart(ctx1, {
    type: 'doughnut',
    data: {
      labels: clienteScore.slice(0, 5).map(c => c.Nome_Cliente),
      datasets: [{ data: clienteScore.slice(0, 5).map(c => c.score), backgroundColor: CHART_COLORS }]
    },
    options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom' } } }
  });

  // Top 5 Products
  destroyChart('top5ProdutosChart');
  const ctx2 = document.getElementById('top5ProdutosChart').getContext('2d');
  charts.top5Produtos = new Chart(ctx2, {
    type: 'bar',
    data: {
      labels: penetracao.slice(0, 5).map(p => p.produto),
      datasets: [{ data: penetracao.slice(0, 5).map(p => p.perc), backgroundColor: CHART_COLORS[0] }]
    },
    options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } }
  });
}

function downloadTemplate() {
  const csv = `ID_Cliente,Nome_Cliente,Cultura,Area_Hectares,Amino_Plus,Amino_Arginine,Amino_Proline,Amino_Fort,Amino_Reten,Amiorgan,Ajipower,Ajifol_Kmg,Ajifol_Premium_Plus,Ajifol_SM_Boro,Algen_Max,Bokashi,Status_Cliente,Regiao
1,Fazenda ABC,Uva,50,1,1,0,1,0,1,0,1,1,0,0,1,Ativo,Norte
2,Sítio XYZ,Manga,100,1,0,1,1,1,0,1,0,1,1,1,0,Ativo,Sul
3,Agrícola Boa Vista,Café,75,0,1,1,0,1,1,1,1,0,0,1,1,Ativo,Sudeste
4,Fazenda Sol Nascente,Tomate,30,1,1,1,0,0,1,1,0,1,0,0,0,Potencial,Centro-Oeste
5,Rancho Alegre,Uva,120,1,1,1,1,1,1,0,1,1,1,1,1,Ativo,Sul`;
  downloadCSV(csv, 'template_carteira_clientes.csv');
}

function destroyChart(chartId) {
  const chartKey = chartId.replace('Chart', '');
  if (charts[chartKey]) {
    charts[chartKey].destroy();
    delete charts[chartKey];
  }
}

function downloadCSV(csvContent, filename) {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

function exportCarteira() {
  if (filteredData.length === 0) {
    alert('Nenhum dado para exportar.');
    return;
  }
  let csv = 'ID,Cliente,Cultura,Area,Status,Regiao,Produtos\n';
  filteredData.forEach(c => {
    const qtd = produtos.filter(p => {
      const key = p.key || p;
      return c.produtos[key] === 1;
    }).length;
    csv += `${c.ID_Cliente},"${c.Nome_Cliente}",${c.Cultura},${c.Area_Hectares},${c.Status_Cliente},${c.Regiao},${qtd}\n`;
  });
  downloadCSV(csv, 'carteira_completa.csv');
}

function exportABC() {
  if (filteredData.length === 0) return;
  const clienteScore = filteredData.map(c => {
    const qtd = produtos.filter(p => {
      const key = p.key || p;
      return c.produtos[key] === 1;
    }).length;
    return { ...c, qtd, score: qtd * c.Area_Hectares };
  }).sort((a, b) => b.score - a.score);
  
  let csv = 'Cliente,Score,Classificacao\n';
  const totalScore = clienteScore.reduce((s, c) => s + c.score, 0);
  let cum = 0;
  clienteScore.forEach(c => {
    cum += c.score;
    const perc = (cum / totalScore) * 100;
    const classif = perc <= 80 ? 'A' : (perc <= 95 ? 'B' : 'C');
    csv += `"${c.Nome_Cliente}",${c.score.toFixed(0)},${classif}\n`;
  });
  downloadCSV(csv, 'analise_abc.csv');
}

function exportOportunidades() {
  if (filteredData.length === 0) return;
  const gapsData = filteredData.map(c => {
    const gap = produtos.filter(p => {
      const key = p.key || p;
      return c.produtos[key] === 0;
    }).length;
    return { nome: c.Nome_Cliente, gap, potencial: gap * (c.Area_Hectares / 100) };
  }).sort((a, b) => b.potencial - a.potencial);
  
  let csv = 'Cliente,Produtos_Gap,Potencial\n';
  gapsData.forEach(g => {
    csv += `"${g.nome}",${g.gap},${g.potencial.toFixed(0)}\n`;
  });
  downloadCSV(csv, 'oportunidades.csv');
}

// GUT, SWOT, Contatos functions
function addGutItem() {
  const problem = document.getElementById('gutProblem').value.trim();
  const gravity = parseInt(document.getElementById('gutGravity').value);
  const urgency = parseInt(document.getElementById('gutUrgency').value);
  const trend = parseInt(document.getElementById('gutTrend').value);

  if (!problem) {
    alert('Por favor, descreva o problema.');
    return;
  }

  const score = gravity * urgency * trend;
  gutData.push({ problem, gravity, urgency, trend, score, timestamp: new Date().toLocaleString('pt-BR') });
  document.getElementById('gutProblem').value = '';
  updateGutAnalysis();
  autoSave();
  document.dispatchEvent(new Event('dataChanged'));
}

function updateGutAnalysis() {
  if (gutData.length === 0) {
    document.getElementById('gutTable').innerHTML = '<tbody><tr><td colspan="7">Nenhum item adicionado ainda.</td></tr></tbody>';
    return;
  }

  const sortedData = [...gutData].sort((a, b) => b.score - a.score);
  const table = document.getElementById('gutTable');
  let html = '<thead><tr><th>Prioridade</th><th>Problema</th><th>G</th><th>U</th><th>T</th><th>Score</th><th>Classificação</th></tr></thead><tbody>';
  
  sortedData.forEach((item, index) => {
    let priorityClass = 'priority-low';
    let priorityLabel = 'Baixa';
    if (item.score >= 64) {
      priorityClass = 'priority-high';
      priorityLabel = 'Alta';
    } else if (item.score >= 27) {
      priorityClass = 'priority-medium';
      priorityLabel = 'Média';
    }
    html += '<tr>';
    html += `<td>${index + 1}</td>`;
    html += `<td><strong>${item.problem}</strong></td>`;
    html += `<td>${item.gravity}</td>`;
    html += `<td>${item.urgency}</td>`;
    html += `<td>${item.trend}</td>`;
    html += `<td><strong>${item.score}</strong></td>`;
    html += `<td><span class="${priorityClass}">${priorityLabel}</span></td>`;
    html += '</tr>';
  });
  html += '</tbody>';
  table.innerHTML = html;

  destroyChart('gutChart');
  const ctx = document.getElementById('gutChart').getContext('2d');
  charts.gut = new Chart(ctx, {
    type: 'bubble',
    data: {
      datasets: [{
        label: 'Problemas',
        data: gutData.map(i => ({ x: i.urgency, y: i.gravity, r: i.trend * 4 })),
        backgroundColor: CHART_COLORS[2] + '60'
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: { x: { min: 0, max: 6 }, y: { min: 0, max: 6 } }
    }
  });
}

function exportGut() {
  if (gutData.length === 0) return;
  let csv = 'Problema,Gravidade,Urgencia,Tendencia,Score\n';
  gutData.forEach(i => csv += `"${i.problem}",${i.gravity},${i.urgency},${i.trend},${i.score}\n`);
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
    alert('Preencha pelo menos um quadrante.');
    return;
  }
  updateSWOTStrategies();
  autoSave();
  document.dispatchEvent(new Event('dataChanged'));
  alert('Análise SWOT salva!');
}

function updateSWOTStrategies() {
  document.getElementById('swotFO').innerHTML = swotData.strengths && swotData.opportunities ? '<p>Use forças para aproveitar oportunidades</p>' : '<p><em>Preencha Forças e Oportunidades</em></p>';
  document.getElementById('swotWO').innerHTML = swotData.weaknesses && swotData.opportunities ? '<p>Supere fraquezas para aproveitar oportunidades</p>' : '<p><em>Preencha Fraquezas e Oportunidades</em></p>';
  document.getElementById('swotFT').innerHTML = swotData.strengths && swotData.threats ? '<p>Use forças para mitigar ameaças</p>' : '<p><em>Preencha Forças e Ameaças</em></p>';
  document.getElementById('swotWT').innerHTML = swotData.weaknesses && swotData.threats ? '<p>Minimize fraquezas e evite ameaças</p>' : '<p><em>Preencha Fraquezas e Ameaças</em></p>';
}

function addContato() {
  const clienteId = document.getElementById('contatoCliente').value;
  const responsavel = document.getElementById('contatoResponsavel').value.trim();
  const telefone = document.getElementById('contatoTelefone').value.trim();
  const email = document.getElementById('contatoEmail').value.trim();
  const visita = document.getElementById('contatoVisita').value;
  const notas = document.getElementById('contatoNotas').value.trim();

  if (!clienteId || !responsavel) {
    alert('Selecione um cliente e informe o responsável.');
    return;
  }

  const cliente = rawData.find(c => c.ID_Cliente == clienteId);
  const existingIndex = contatosData.findIndex(c => c.clienteId == clienteId);
  
  const contato = { clienteId, clienteNome: cliente.Nome_Cliente, responsavel, telefone, email, visita, notas };
  
  if (existingIndex >= 0) {
    contatosData[existingIndex] = contato;
  } else {
    contatosData.push(contato);
  }

  document.getElementById('contatoResponsavel').value = '';
  document.getElementById('contatoTelefone').value = '';
  document.getElementById('contatoEmail').value = '';
  document.getElementById('contatoVisita').value = '';
  document.getElementById('contatoNotas').value = '';
  
  updateContatosTable();
  autoSave();
  document.dispatchEvent(new Event('dataChanged'));
}

function updateContatosTable() {
  const table = document.getElementById('contatosTable');
  if (contatosData.length === 0) {
    table.innerHTML = '<tbody><tr><td colspan="6">Nenhum contato registrado.</td></tr></tbody>';
    return;
  }

  let html = '<thead><tr><th>Cliente</th><th>Responsável</th><th>Telefone</th><th>Email</th><th>Última Visita</th><th>Notas</th></tr></thead><tbody>';
  contatosData.forEach(c => {
    html += '<tr>';
    html += `<td><strong>${c.clienteNome}</strong></td>`;
    html += `<td>${c.responsavel}</td>`;
    html += `<td>${c.telefone || '-'}</td>`;
    html += `<td>${c.email || '-'}</td>`;
    html += `<td>${c.visita || '-'}</td>`;
    html += `<td>${c.notas || '-'}</td>`;
    html += '</tr>';
  });
  html += '</tbody>';
  table.innerHTML = html;
}

function exportContatos() {
  if (contatosData.length === 0) return;
  let csv = 'Cliente,Responsavel,Telefone,Email,Visita,Notas\n';
  contatosData.forEach(c => csv += `"${c.clienteNome}","${c.responsavel}","${c.telefone}","${c.email}","${c.visita}","${c.notas}"\n`);
  downloadCSV(csv, 'contatos.csv');
}

function updateSelect(selectId, items) {
  const select = document.getElementById(selectId);
  if (!select) return;
  
  const currentValues = getSelectValues(selectId);
  select.innerHTML = '<option value="">Todos</option>';
  
  items.forEach(item => {
    const value = typeof item === 'object' ? item.value : item;
    const text = typeof item === 'object' ? item.text : item;
    const option = document.createElement('option');
    option.value = value;
    option.textContent = text;
    if (currentValues.includes(value)) option.selected = true;
    select.appendChild(option);
  });
}

function updateCheckboxGroup(groupId, items) {
  const group = document.getElementById(groupId);
  if (!group) return;
  
  group.innerHTML = '';
  items.forEach(item => {
    const value = typeof item === 'object' ? item.value : item;
    const text = typeof item === 'object' ? item.text : item;
    group.innerHTML += `<label class="checkbox-item"><input type="checkbox" value="${value}" checked><span>${text}</span></label>`;
  });
}

function getSelectValues(selectId) {
  const select = document.getElementById(selectId);
  if (!select) return [];
  const value = select.value;
  return value ? [value] : [];
}

function addNewItems() {
  const newClienteNome = document.getElementById('cadastroClienteNome')?.value?.trim();
  const newCultura = document.getElementById('cadastroCulturaInput')?.value?.trim();
  const newRegiao = document.getElementById('cadastroRegiaoInput')?.value?.trim();
  const newStatus = document.getElementById('cadastroStatusInput')?.value?.trim();
  const newArea = parseFloat(document.getElementById('cadastroAreaInput')?.value) || 0;
  
  if (!newClienteNome || !newCultura || !newArea) {
    alert('Preencha todos os campos obrigatórios: Nome, Cultura e Área.');
    return;
  }
  
  // Generate unique ID based on client name
  const newClienteId = generateUniqueClientId(newClienteNome);
  
  // Create new client object
  const newClient = {
    ID_Cliente: newClienteId,
    Nome_Cliente: newClienteNome,
    Cultura: newCultura,
    Area_Hectares: newArea,
    Status_Cliente: newStatus || 'Ativo',
    Regiao: newRegiao || 'Não informado',
    produtos: {}
  };
  
  // Initialize default products if none exist
  if (produtos.length === 0) {
    produtos = [
      { key: 'Amino_Plus', display: 'AminoPlus® AJINOMOTO' },
      { key: 'Amino_Arginine', display: 'Amino Arginine® AJINOMOTO' },
      { key: 'Amino_Proline', display: 'Amino Proline® AJINOMOTO' },
      { key: 'Amino_Fort', display: 'AminoFort® AJINOMOTO' },
      { key: 'Amino_Reten', display: 'AminoReten® AJINOMOTO' },
      { key: 'Amiorgan', display: 'Amiorgan® AJINOMOTO' },
      { key: 'Ajipower', display: 'AjiPower® AJINOMOTO' },
      { key: 'Ajifol_Kmg', display: 'Ajifol® K-Mg AJINOMOTO' },
      { key: 'Ajifol_Premium_Plus', display: 'Ajifol® Premium+ AJINOMOTO' },
      { key: 'Ajifol_SM_Boro', display: 'Ajifol® SM-Boro AJINOMOTO' },
      { key: 'Algen_Max', display: 'AlgenMax® AJINOMOTO' },
      { key: 'Bokashi', display: 'Bokashi® AJINOMOTO' }
    ];
  }
  
  // Initialize all products as 0 (not using)
  produtos.forEach(prod => {
    const prodKey = prod.key || prod;
    newClient.produtos[prodKey] = 0;
  });
  
  // Add selected products
  const selectedProducts = Array.from(document.querySelectorAll('#cadastroProductFilters input:checked')).map(cb => cb.value);
  selectedProducts.forEach(prodKey => {
    if (newClient.produtos.hasOwnProperty(prodKey)) {
      newClient.produtos[prodKey] = 1;
    }
  });
  
  // Add to rawData and update filteredData
  rawData.push(newClient);
  filteredData = [...rawData];
  
  // Update all filters and selects
  initializeFilters();
  
  // Force update sidebar selects with new data
  updateSidebarSelects();
  
  // Update all analyses
  updateAllAnalyses();
  autoSave();
  document.dispatchEvent(new Event('dataChanged'));
  
  // Clear form
  document.getElementById('cadastroClienteNome').value = '';
  document.getElementById('cadastroClienteId').value = 'Será gerado automaticamente';
  document.getElementById('cadastroCulturaInput').value = '';
  document.getElementById('cadastroRegiaoInput').value = '';
  document.getElementById('cadastroStatusInput').value = '';
  document.getElementById('cadastroAreaInput').value = '';
  
  // Uncheck all product checkboxes
  document.querySelectorAll('#cadastroProductFilters input[type="checkbox"]').forEach(cb => cb.checked = false);
  
  // Force immediate sidebar update
  updateSidebarSelects();
  
  alert(`Cliente ${newClienteNome} adicionado com sucesso! Dados atualizados em todas as análises.`);
}

function addToSelect(selectId, newValue) {
  const select = document.getElementById(selectId);
  if (!select) return;
  
  const exists = Array.from(select.options).some(option => option.value === newValue);
  if (exists) return;
  
  const option = document.createElement('option');
  option.value = newValue;
  option.textContent = newValue;
  select.appendChild(option);
}

function getSelectOptions(selectId) {
  const select = document.getElementById(selectId);
  if (!select) return [];
  return Array.from(select.options).filter(option => option.value !== '').map(option => option.value);
}

function updateSidebarSelects() {
  if (!rawData || rawData.length === 0) return;
  
  const culturas = [...new Set(rawData.map(d => d.Cultura))].filter(Boolean).sort();
  const regioes = [...new Set(rawData.map(d => d.Regiao))].filter(Boolean).sort();
  const statuses = [...new Set(rawData.map(d => d.Status_Cliente))].filter(Boolean).sort();
  const clientes = [...new Set(rawData.map(d => d.Nome_Cliente))].filter(Boolean).sort();

  updateSelectOptions('clienteSelect', clientes);
  updateSelectOptions('culturaSelect', culturas);
  updateSelectOptions('regiaoSelect', regioes);
  updateSelectOptions('statusSelect', statuses);
  updateSelectOptions('productSelect', produtos.map(p => ({ value: p.key || p, text: p.display || p.replace('Produto_', 'Produto ') })));
  
  // Update client count
  const clienteCount = document.getElementById('clienteCount');
  if (clienteCount) {
    clienteCount.textContent = `(${clientes.length})`;
  }
  
  // Add event listener to show client ID when selected
  const clienteSelect = document.getElementById('clienteSelect');
  if (clienteSelect) {
    clienteSelect.addEventListener('change', function() {
      const selectedClient = this.value;
      const clienteCountSpan = document.getElementById('clienteCount');
      
      if (selectedClient && clienteCountSpan) {
        const client = rawData.find(c => c.Nome_Cliente === selectedClient);
        if (client) {
          clienteCountSpan.textContent = `(${client.ID_Cliente})`;
        }
      } else if (clienteCountSpan) {
        clienteCountSpan.textContent = `(${clientes.length})`;
      }
    });
  }
}

function updateSelectOptions(selectId, newOptions) {
  const select = document.getElementById(selectId);
  if (!select) return;
  
  const currentValue = select.value;
  const fragment = document.createDocumentFragment();
  
  const defaultOption = document.createElement('option');
  defaultOption.value = '';
  defaultOption.textContent = selectId === 'clienteSelect' ? 'Todos os clientes' : 
                              selectId === 'culturaSelect' ? 'Todas as culturas' :
                              selectId === 'regiaoSelect' ? 'Todas as regiões' :
                              selectId === 'statusSelect' ? 'Todos os status' :
                              selectId === 'productSelect' ? 'Todos os produtos' : 'Todos';
  fragment.appendChild(defaultOption);
  
  newOptions.forEach(option => {
    const optionElement = document.createElement('option');
    if (typeof option === 'object') {
      optionElement.value = option.value;
      optionElement.textContent = option.text;
    } else {
      optionElement.value = option;
      optionElement.textContent = option;
    }
    if ((typeof option === 'object' ? option.value : option) === currentValue) {
      optionElement.selected = true;
    }
    fragment.appendChild(optionElement);
  });
  
  select.innerHTML = '';
  select.appendChild(fragment);
}

// Funções PDF por aba
function generateTabPDF(tabName) {
  const buttonId = `${tabName}PDF`;
  showPDFLoading(buttonId, 'Gerando PDF...');
  setTimeout(() => {
    pdfGenerator.generateTabReport(tabName).finally(() => {
      hidePDFLoading(buttonId, `📄 Gerar PDF - ${getTabDisplayName(tabName)}`);
    });
  }, 100);
}

function getTabDisplayName(tabName) {
  const names = {
    'overview': 'Visão Geral',
    'penetracao': 'Penetração',
    'abc': 'Análise ABC',
    'cultura': 'Cultura',
    'oportunidades': 'Oportunidades',
    'territorial': 'Territorial',
    'gaps': 'Gaps',
    'swot': 'SWOT',
    'gut': 'Matriz GUT',
    'fidelizacao': 'Fidelização',
    'relatorio': 'Relatório'
  };
  return names[tabName] || tabName;
}

function showPDFLoading(buttonId, message) {
  const button = document.getElementById(buttonId);
  if (button) {
    button.disabled = true;
    button.style.opacity = '0.7';
    button.innerHTML = `<span style="animation: spin 1s linear infinite; display: inline-block;">⏳</span> ${message}`;
  }
}

function hidePDFLoading(buttonId, originalText) {
  const button = document.getElementById(buttonId);
  if (button) {
    button.disabled = false;
    button.style.opacity = '1';
    button.innerHTML = originalText;
  }
}

// PDF Report Generator
class PDFReportGenerator {
  constructor() {
    this.doc = null;
    this.currentY = 20;
    this.pageHeight = 280;
    this.margin = 20;
    this.colors = {
      primary: '#1FB8CD',
      secondary: '#00d4ff',
      dark: '#13343B',
      text: '#333333',
      lightGray: '#f5f5f5'
    };
  }

  async generateTabReport(tabName) {
    if (filteredData.length === 0) {
      alert('Carregue dados antes de gerar o relatório.');
      return;
    }

    try {
      this.doc = new jspdf.jsPDF();
      this.currentY = 20;
      
      this.addStyledHeader(tabName);
      await this.addTabSpecificContent(tabName);
      this.addStyledFooter();
      
      const filename = `InsightPro_${getTabDisplayName(tabName)}_${new Date().toISOString().split('T')[0]}.pdf`;
      this.doc.save(filename);
      
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
      alert('Erro ao gerar relatório PDF. Tente novamente.');
    }
  }

  async addTabSpecificContent(tabName) {
    switch(tabName) {
      case 'overview':
        // KPIs principais
        this.addKPIs();
        
        // Layout em duas colunas
        const startY = this.currentY;
        
        // Coluna esquerda - Gráfico
        await this.addChart('salesPeriodChart', 'Vendas');
        
        // Coluna direita - Resumo executivo compacto
        this.currentY = startY;
        const rightColumnX = this.margin + 90;
        
        this.doc.setFillColor(30, 64, 175);
        this.doc.rect(rightColumnX, this.currentY, 80, 8, 'F');
        
        this.doc.setTextColor(255, 255, 255);
        this.doc.setFontSize(8);
        this.doc.setFont('helvetica', 'bold');
        this.doc.text('RESUMO EXECUTIVO', rightColumnX + 2, this.currentY + 5);
        this.currentY += 12;
        
        const totalArea = filteredData.reduce((sum, c) => sum + c.Area_Hectares, 0);
        const avgProducts = (filteredData.reduce((s, c) => s + produtos.filter(p => { const key = p.key || p; return c.produtos[key] === 1; }).length, 0) / filteredData.length).toFixed(1);
        
        this.doc.setTextColor(255, 255, 255);
        this.doc.setFontSize(6);
        this.doc.setFont('helvetica', 'normal');
        
        const summary = [
          `• ${filteredData.length} clientes`,
          `• ${totalArea.toLocaleString('pt-BR')} ha`,
          `• ${new Set(filteredData.map(d => d.Cultura)).size} culturas`,
          `• ${avgProducts} prod/cliente`,
          `• ${produtos.length} produtos total`
        ];
        
        summary.forEach((line, index) => {
          this.doc.text(line, rightColumnX + 2, this.currentY + (index * 6));
        });
        
        this.currentY = Math.max(this.currentY + 35, startY + 50);
        
        // Tabela compacta de clientes
        const clienteSummary = filteredData.slice(0, 5).map(c => {
          const qtdProdutos = produtos.filter(p => {
            const key = p.key || p;
            return c.produtos[key] === 1;
          }).length;
          return {
            'Cliente': c.Nome_Cliente,
            'Cultura': c.Cultura,
            'Área': c.Area_Hectares.toFixed(0),
            'Produtos': `${qtdProdutos}/${produtos.length}`
          };
        });
        this.addTable('TOP 5 CLIENTES', clienteSummary, 5);
        
        // Tabela compacta de culturas
        const culturaSummary = {};
        filteredData.forEach(row => {
          if (!culturaSummary[row.Cultura]) {
            culturaSummary[row.Cultura] = { count: 0, area: 0 };
          }
          culturaSummary[row.Cultura].count++;
          culturaSummary[row.Cultura].area += row.Area_Hectares;
        });
        
        const culturaData = Object.entries(culturaSummary).slice(0, 4).map(([cultura, data]) => ({
          'Cultura': cultura,
          'Clientes': data.count,
          'Área': data.area.toFixed(0),
          'Média': (data.area / data.count).toFixed(1)
        }));
        this.addTable('CULTURAS', culturaData, 4);
        break;
        
      case 'penetracao':
        await this.addChart('penetracaoChart', 'Penetração de Produtos');
        const penetracao = produtos.map(prod => {
          const prodKey = prod.key || prod;
          const count = filteredData.filter(c => c.produtos[prodKey] === 1).length;
          return {
            'Produto': (prod.display || prod).substring(0, 15),
            'Clientes': count,
            'Penetração': `${(count / filteredData.length * 100).toFixed(1)}%`
          };
        });
        this.addTable('Análise de Penetração', penetracao, 12);
        break;
        
      case 'abc':
        await this.addChart('abcParetoChart', 'Análise ABC - Pareto');
        await this.addChart('matrizAreaProdutos', 'Matriz Área vs Produtos');
        break;
        
      case 'cultura':
        await this.addChart('culturaClientesChart', 'Clientes por Cultura');
        await this.addChart('culturaAreaChart', 'Área por Cultura');
        break;
        
      case 'territorial':
        const regiaoData = {};
        filteredData.forEach(cliente => {
          if (!regiaoData[cliente.Regiao]) {
            regiaoData[cliente.Regiao] = { clientes: 0, area: 0 };
          }
          regiaoData[cliente.Regiao].clientes++;
          regiaoData[cliente.Regiao].area += cliente.Area_Hectares;
        });
        
        const territorialTable = Object.entries(regiaoData).map(([regiao, data]) => ({
          'Região': regiao.substring(0, 15),
          'Clientes': data.clientes,
          'Área Total': data.area.toFixed(0),
          '% Clientes': ((data.clientes / filteredData.length) * 100).toFixed(1) + '%'
        }));
        this.addTable('Análise Territorial', territorialTable);
        break;
        
      case 'gaps':
        const gapsData = filteredData.map(cliente => {
          const produtosUsando = produtos.filter(p => {
            const key = p.key || p;
            return cliente.produtos[key] === 1;
          }).length;
          const gap = produtos.length - produtosUsando;
          return {
            'Cliente': cliente.Nome_Cliente.substring(0, 18),
            'Usando': produtosUsando,
            'Gap': gap,
            'Potencial': (gap * (cliente.Area_Hectares / 100)).toFixed(0)
          };
        }).sort((a, b) => parseFloat(b.Potencial) - parseFloat(a.Potencial)).slice(0, 15);
        this.addTable('Top 15 Oportunidades de Crescimento', gapsData);
        break;
        
      case 'fidelizacao':
        const basketData = filteredData.map(cliente => {
          const basket = produtos.filter(p => {
            const key = p.key || p;
            return cliente.produtos[key] === 1;
          }).length;
          return { ...cliente, basket };
        }).sort((a, b) => b.basket - a.basket).slice(0, 15);
        
        const fidelizacaoTable = basketData.map(cliente => ({
          'Cliente': cliente.Nome_Cliente.substring(0, 18),
          'Cultura': cliente.Cultura,
          'Área': cliente.Area_Hectares.toFixed(0),
          'Basket Size': `${cliente.basket}/${produtos.length}`,
          'Status': cliente.basket >= 5 ? 'TOP' : (cliente.basket >= 3 ? 'MÉDIO' : 'RISCO')
        }));
        this.addTable('Análise de Fidelização - Top 15', fidelizacaoTable);
        break;
        
      default:
        this.addKPIs();
        this.doc.text(`Relatório específico da aba ${getTabDisplayName(tabName)}`, this.margin, this.currentY);
        this.currentY += 20;
    }
  }

  addStyledHeader(tabName) {
    // Dark background for entire page
    this.doc.setFillColor(26, 26, 46);
    this.doc.rect(0, 0, 210, 297, 'F');
    
    // Compact header
    this.doc.setFillColor(30, 64, 175);
    this.doc.rect(0, 0, 210, 25, 'F');
    
    this.doc.setFillColor(0, 212, 255);
    this.doc.rect(0, 22, 210, 2, 'F');
    
    // Compact title
    this.doc.setTextColor(255, 255, 255);
    this.doc.setFontSize(12);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('InsightPro Carteira', 10, 15);
    
    this.doc.setTextColor(0, 212, 255);
    this.doc.setFontSize(10);
    this.doc.text(getTabDisplayName(tabName), 80, 15);
    
    this.doc.setTextColor(255, 255, 255);
    this.doc.setFontSize(7);
    this.doc.text('AJINOMOTO', 170, 12);
    this.doc.text(new Date().toLocaleDateString('pt-BR'), 170, 18);
    
    this.doc.setTextColor(255, 255, 255);
    this.currentY = 30;
  }

  addStyledFooter() {
    const pageCount = this.doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      this.doc.setPage(i);
      
      // Dark background for entire page (if not first page)
      if (i > 1) {
        this.doc.setFillColor(26, 26, 46);
        this.doc.rect(0, 0, 210, 297, 'F');
      }
      
      // Modern footer with gradient
      this.doc.setFillColor(30, 64, 175);
      this.doc.rect(0, 280, 210, 17, 'F');
      
      // Footer accent line
      this.doc.setFillColor(0, 212, 255);
      this.doc.rect(0, 280, 210, 2, 'F');
      
      // Footer content
      this.doc.setTextColor(255, 255, 255);
      this.doc.setFontSize(9);
      this.doc.setFont('helvetica', 'bold');
      this.doc.text('InsightPro Carteira', this.margin, 290);
      
      this.doc.setFontSize(8);
      this.doc.setFont('helvetica', 'normal');
      this.doc.text('AJINOMOTO DO BRASIL', this.margin, 294);
      
      // Copyright
      this.doc.setFontSize(7);
      this.doc.text('Copyright © Narciso Neto', 90, 294);
      
      // Page number in modern style
      this.doc.setFillColor(0, 212, 255);
      this.doc.roundedRect(165, 285, 25, 8, 2, 2, 'F');
      
      this.doc.setTextColor(26, 26, 46);
      this.doc.setFontSize(8);
      this.doc.setFont('helvetica', 'bold');
      this.doc.text(`${i} / ${pageCount}`, 170, 290);
    }
  }

  checkPageBreak(height = 20) {
    // Disable page breaks - force single page
    return;
  }

  addKPIs() {
    // Compact KPI section
    this.doc.setFillColor(0, 212, 255);
    this.doc.rect(this.margin, this.currentY, 170, 12, 'F');
    
    this.doc.setTextColor(26, 26, 46);
    this.doc.setFontSize(10);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('KPIs PRINCIPAIS', this.margin + 5, this.currentY + 7);
    this.currentY += 15;

    const kpis = [
      ['Clientes', document.getElementById('kpiTotalClientes')?.textContent || '-'],
      ['Culturas', document.getElementById('kpiCulturas')?.textContent || '-'],
      ['Área Total', document.getElementById('kpiAreaTotal')?.textContent || '-'],
      ['Área Média', document.getElementById('kpiMediaArea')?.textContent || '-'],
      ['Produtos', document.getElementById('kpiProdutos')?.textContent || '-'],
      ['Top Produto', document.getElementById('kpiMaiorPenetracao')?.textContent || '-']
    ];

    // Compact KPI cards in single row
    kpis.forEach(([label, value], index) => {
      const x = this.margin + (index % 6) * 28;
      const y = this.currentY;
      
      this.doc.setFillColor(42, 42, 62);
      this.doc.rect(x, y, 26, 18, 'F');
      
      this.doc.setDrawColor(0, 212, 255);
      this.doc.setLineWidth(0.5);
      this.doc.rect(x, y, 26, 18, 'S');
      
      this.doc.setTextColor(0, 212, 255);
      this.doc.setFontSize(9);
      this.doc.setFont('helvetica', 'bold');
      const valueWidth = this.doc.getTextWidth(value);
      this.doc.text(value, x + (26 - valueWidth) / 2, y + 8);
      
      this.doc.setTextColor(255, 255, 255);
      this.doc.setFontSize(6);
      this.doc.setFont('helvetica', 'normal');
      const labelWidth = this.doc.getTextWidth(label);
      this.doc.text(label, x + (26 - labelWidth) / 2, y + 14);
    });

    this.doc.setTextColor(255, 255, 255);
    this.currentY += 25;
  }

  async addChart(chartId, title, width = 80, height = 40) {
    try {
      const canvas = document.getElementById(chartId);
      if (!canvas) return;

      // Compact chart title
      this.doc.setFillColor(30, 64, 175);
      this.doc.rect(this.margin, this.currentY, 80, 8, 'F');
      
      this.doc.setTextColor(255, 255, 255);
      this.doc.setFontSize(8);
      this.doc.setFont('helvetica', 'bold');
      this.doc.text(title, this.margin + 2, this.currentY + 5);
      this.currentY += 10;

      const chartImage = await html2canvas(canvas, {
        backgroundColor: '#1a1a2e',
        scale: 1
      });
      
      this.doc.setDrawColor(0, 212, 255);
      this.doc.setLineWidth(1);
      this.doc.rect(this.margin, this.currentY, width, height, 'S');
      
      const imgData = chartImage.toDataURL('image/png');
      this.doc.addImage(imgData, 'PNG', this.margin + 1, this.currentY + 1, width - 2, height - 2);
      this.currentY += height + 5;
      
    } catch (error) {
      this.doc.setFillColor(220, 38, 38);
      this.doc.rect(this.margin, this.currentY, 80, 15, 'F');
      
      this.doc.setTextColor(255, 255, 255);
      this.doc.setFontSize(7);
      this.doc.text(`Gráfico indisponível`, this.margin + 2, this.currentY + 8);
      
      this.currentY += 20;
    }
  }

  addTable(title, data, maxRows = 5) {
    if (!data || data.length === 0) return;
    
    // Compact table title
    this.doc.setFillColor(30, 64, 175);
    this.doc.rect(this.margin, this.currentY, 170, 10, 'F');
    
    this.doc.setTextColor(255, 255, 255);
    this.doc.setFontSize(9);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text(title, this.margin + 3, this.currentY + 6);
    this.currentY += 12;

    const headers = Object.keys(data[0]);
    const colWidth = 170 / headers.length;
    
    // Compact header
    this.doc.setFillColor(0, 212, 255);
    this.doc.rect(this.margin, this.currentY, 170, 8, 'F');
    
    this.doc.setTextColor(26, 26, 46);
    this.doc.setFontSize(6);
    this.doc.setFont('helvetica', 'bold');
    headers.forEach((header, i) => {
      const headerText = header.length > 10 ? header.substring(0, 10) : header;
      this.doc.text(headerText, this.margin + i * colWidth + 1, this.currentY + 5);
    });
    this.currentY += 10;
    
    // Compact data rows
    this.doc.setTextColor(255, 255, 255);
    this.doc.setFontSize(5);
    this.doc.setFont('helvetica', 'normal');
    
    data.slice(0, maxRows).forEach((row, rowIndex) => {
      if (rowIndex % 2 === 0) {
        this.doc.setFillColor(35, 35, 55);
        this.doc.rect(this.margin, this.currentY, 170, 6, 'F');
      }
      
      headers.forEach((header, i) => {
        let value = String(row[header] || '');
        const maxChars = Math.floor(colWidth / 1.5);
        if (value.length > maxChars) {
          value = value.substring(0, maxChars - 1) + '.';
        }
        this.doc.text(value, this.margin + i * colWidth + 1, this.currentY + 4);
      });
      this.currentY += 6;
    });
    
    this.doc.setDrawColor(0, 212, 255);
    this.doc.setLineWidth(0.5);
    this.doc.rect(this.margin, this.currentY - (maxRows * 6) - 10, 170, (maxRows * 6) + 18, 'S');
    
    this.currentY += 8;
  }

  async addCompleteReport() {
    // Executive Summary
    this.addExecutiveSummary();
    
    // KPIs
    this.addKPIs();
    
    // Gráfico de Penetração
    await this.addChart('penetracaoChart', 'Penetração de Produtos');
    
    // Tabela Top Clientes
    const topClientes = filteredData.slice(0, 10).map(c => ({
      'Cliente': c.Nome_Cliente.substring(0, 18),
      'Cultura': c.Cultura.substring(0, 12),
      'Área (ha)': c.Area_Hectares.toFixed(0),
      'Região': c.Regiao.substring(0, 12)
    }));
    this.addTable('🏆 Top 10 Clientes', topClientes);
    
    // Gráfico ABC
    await this.addChart('abcParetoChart', 'Análise ABC - Pareto');
    
    // Gráfico de Cultura
    await this.addChart('culturaClientesChart', 'Clientes por Cultura');
    
    // Análise de Penetração
    const penetracao = produtos.map(prod => {
      const prodKey = prod.key || prod;
      const count = filteredData.filter(c => c.produtos[prodKey] === 1).length;
      return {
        'Produto': (prod.display || prod).substring(0, 15),
        'Clientes': count,
        'Penetração': `${(count / filteredData.length * 100).toFixed(1)}%`
      };
    }).sort((a, b) => parseFloat(b['Penetração']) - parseFloat(a['Penetração']));
    
    this.addTable('📊 Penetração de Produtos', penetracao, 8);
  }

  async addQuickReport() {
    // Executive Summary
    this.addExecutiveSummary();
    
    // KPIs apenas
    this.addKPIs();
    
    // Quick insights
    this.addQuickInsights();
  }
  
  addExecutiveSummary() {
    this.checkPageBreak(60);
    
    // Modern executive summary header
    this.doc.setFillColor(0, 212, 255);
    this.doc.roundedRect(this.margin, this.currentY - 5, 170, 18, 2, 2, 'F');
    
    this.doc.setTextColor(26, 26, 46);
    this.doc.setFontSize(16);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('📋 RESUMO EXECUTIVO', this.margin + 8, this.currentY + 7);
    this.currentY += 25;
    
    // Summary content in modern box
    this.doc.setFillColor(42, 42, 62);
    this.doc.roundedRect(this.margin, this.currentY - 5, 170, 45, 3, 3, 'F');
    
    this.doc.setDrawColor(0, 212, 255);
    this.doc.setLineWidth(1);
    this.doc.roundedRect(this.margin, this.currentY - 5, 170, 45, 3, 3, 'S');
    
    this.doc.setTextColor(255, 255, 255);
    this.doc.setFontSize(11);
    this.doc.setFont('helvetica', 'normal');
    
    const totalArea = filteredData.reduce((sum, c) => sum + c.Area_Hectares, 0);
    const avgProducts = (filteredData.reduce((s, c) => s + produtos.filter(p => { const key = p.key || p; return c.produtos[key] === 1; }).length, 0) / filteredData.length).toFixed(1);
    
    const summary = [
      `• ${filteredData.length} clientes analisados`,
      `• ${totalArea.toLocaleString('pt-BR')} hectares de área total`,
      `• ${new Set(filteredData.map(d => d.Cultura)).size} culturas diferentes`,
      `• ${avgProducts} produtos AJINOMOTO por cliente (média)`,
      `• ${produtos.length} produtos disponíveis no portfólio`
    ];
    
    summary.forEach((line, index) => {
      this.doc.text(line, this.margin + 8, this.currentY + (index * 7));
    });
    
    this.currentY += 55;
  }
  
  addQuickInsights() {
    this.checkPageBreak(60);
    
    // Section header with dark background
    this.doc.setFillColor(42, 42, 62);
    this.doc.rect(this.margin, this.currentY - 5, 170, 15, 'F');
    
    this.doc.setTextColor(0, 212, 255);
    this.doc.setFontSize(14);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('Insights Principais', this.margin + 5, this.currentY + 5);
    this.currentY += 20;
    
    // Calculate insights
    const penetracao = produtos.map(prod => {
      const prodKey = prod.key || prod;
      const count = filteredData.filter(c => c.produtos[prodKey] === 1).length;
      return { produto: prod.display || prod, perc: (count / filteredData.length * 100) };
    }).sort((a, b) => b.perc - a.perc);
    
    const topProduct = penetracao[0];
    const lowProduct = penetracao[penetracao.length - 1];
    const avgArea = (filteredData.reduce((sum, c) => sum + c.Area_Hectares, 0) / filteredData.length).toFixed(0);
    
    this.doc.setTextColor(255, 255, 255);
    this.doc.setFontSize(10);
    this.doc.setFont('helvetica', 'normal');
    
    const insights = [
      `• Produto com maior penetração: ${topProduct.produto.split(' ')[0]} (${topProduct.perc.toFixed(1)}%)`,
      `• Oportunidade de crescimento: ${lowProduct.produto.split(' ')[0]} (${lowProduct.perc.toFixed(1)}%)`,
      `• Área média por cliente: ${avgArea} hectares`,
      `• Clientes com maior potencial: ${filteredData.filter(c => c.Area_Hectares > parseFloat(avgArea)).length} acima da média`
    ];
    
    insights.forEach(line => {
      this.doc.text(line, this.margin + 5, this.currentY);
      this.currentY += 10;
    });
  }
}

// Instância global do gerador
const pdfGenerator = new PDFReportGenerator();

// Funções de interface
function generatePDFReport() {
  if (filteredData.length === 0) {
    alert('Carregue dados antes de gerar o relatório.');
    return;
  }
  
  showPDFLoading('generatePDFReport', 'Gerando relatório completo...');
  setTimeout(async () => {
    try {
      const doc = new jspdf.jsPDF();
      const generator = new PDFReportGenerator();
      generator.doc = doc;
      generator.currentY = 20;
      
      generator.addStyledHeader('relatorio');
      await generator.addCompleteReport();
      generator.addStyledFooter();
      
      const filename = `InsightPro_Relatorio_Completo_${new Date().toISOString().split('T')[0]}.pdf`;
      doc.save(filename);
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
      alert('Erro ao gerar relatório PDF. Tente novamente.');
    } finally {
      hidePDFLoading('generatePDFReport', '📄 Gerar Relatório Completo');
    }
  }, 100);
}

function generateQuickPDF() {
  if (filteredData.length === 0) {
    alert('Carregue dados antes de gerar o relatório.');
    return;
  }
  
  showPDFLoading('generateQuickPDF', 'Gerando relatório rápido...');
  setTimeout(async () => {
    try {
      const doc = new jspdf.jsPDF();
      const generator = new PDFReportGenerator();
      generator.doc = doc;
      generator.currentY = 20;
      
      generator.addStyledHeader('resumo');
      await generator.addQuickReport();
      generator.addStyledFooter();
      
      const filename = `InsightPro_Resumo_Executivo_${new Date().toISOString().split('T')[0]}.pdf`;
      doc.save(filename);
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
      alert('Erro ao gerar relatório PDF. Tente novamente.');
    } finally {
      hidePDFLoading('generateQuickPDF', '⚡ Gerar Relatório Rápido');
    }
  }, 100);
}

// Additional functions for missing functionalities
let pestData = {};
let csData = [];
let mksData = [];
let vpmData = [];
let diagnosisData = [];

function savePEST() {
  pestData = {
    political: document.getElementById('pestPolitical')?.value?.trim() || '',
    economic: document.getElementById('pestEconomic')?.value?.trim() || '',
    social: document.getElementById('pestSocial')?.value?.trim() || '',
    technology: document.getElementById('pestTechnology')?.value?.trim() || ''
  };
  
  if (!pestData.political && !pestData.economic && !pestData.social && !pestData.technology) {
    alert('Preencha pelo menos um fator PEST.');
    return;
  }
  
  updatePESTTable();
  autoSave();
  alert('Análise PEST salva com sucesso!');
}

function updatePESTTable() {
  const table = document.getElementById('pestTable');
  if (!table) return;
  
  let html = '<thead><tr><th>Fator</th><th>Descrição</th><th>Impacto</th></tr></thead><tbody>';
  
  const factors = [
    { name: 'Político', value: pestData.political },
    { name: 'Econômico', value: pestData.economic },
    { name: 'Social', value: pestData.social },
    { name: 'Tecnológico', value: pestData.technology }
  ];
  
  factors.forEach(factor => {
    if (factor.value) {
      const impact = factor.value.length > 50 ? 'Alto' : factor.value.length > 20 ? 'Médio' : 'Baixo';
      html += '<tr>';
      html += `<td><strong>${factor.name}</strong></td>`;
      html += `<td>${factor.value.substring(0, 100)}${factor.value.length > 100 ? '...' : ''}</td>`;
      html += `<td><span class="${impact === 'Alto' ? 'priority-high' : impact === 'Médio' ? 'priority-medium' : 'priority-low'}">${impact}</span></td>`;
      html += '</tr>';
    }
  });
  
  html += '</tbody>';
  table.innerHTML = html;
}

function addCSRecord() {
  const client = document.getElementById('csClient')?.value?.trim();
  const product = document.getElementById('csProduct')?.value;
  const score = parseInt(document.getElementById('csScore')?.value);
  const date = document.getElementById('csDate')?.value;
  const comment = document.getElementById('csComment')?.value?.trim();
  
  if (!client || !score || score < 1 || score > 10) {
    alert('Preencha cliente e nota (1-10).');
    return;
  }
  
  csData.push({
    client,
    product: product || 'Geral',
    score,
    date: date || new Date().toISOString().split('T')[0],
    comment: comment || ''
  });
  
  // Clear form
  document.getElementById('csClient').value = '';
  document.getElementById('csProduct').value = '';
  document.getElementById('csScore').value = '';
  document.getElementById('csDate').value = '';
  document.getElementById('csComment').value = '';
  
  updateCSAnalysis();
  autoSave();
  alert('Avaliação adicionada com sucesso!');
}

function updateCSAnalysis() {
  if (csData.length === 0) return;
  
  const avgScore = (csData.reduce((sum, item) => sum + item.score, 0) / csData.length).toFixed(1);
  const satisfied = csData.filter(item => item.score >= 7).length;
  const detractors = csData.filter(item => item.score <= 6).length;
  const satisfactionRate = ((satisfied / csData.length) * 100).toFixed(1);
  
  document.getElementById('csatAverage').textContent = avgScore;
  document.getElementById('csatSatisfied').textContent = `${satisfactionRate}%`;
  document.getElementById('csatDetractors').textContent = detractors;
  document.getElementById('csatTotal').textContent = csData.length;
  
  // Update table
  const table = document.getElementById('csTable');
  if (table) {
    let html = '<thead><tr><th>Cliente</th><th>Produto</th><th>Nota</th><th>Data</th><th>Comentário</th></tr></thead><tbody>';
    csData.forEach(item => {
      html += '<tr>';
      html += `<td>${item.client}</td>`;
      html += `<td>${item.product}</td>`;
      html += `<td><span class="${item.score >= 8 ? 'satisfaction-high' : item.score >= 6 ? 'satisfaction-medium' : 'satisfaction-low'}">${item.score}</span></td>`;
      html += `<td>${item.date}</td>`;
      html += `<td>${item.comment.substring(0, 50)}${item.comment.length > 50 ? '...' : ''}</td>`;
      html += '</tr>';
    });
    html += '</tbody>';
    table.innerHTML = html;
  }
}

function exportCS() {
  if (csData.length === 0) return;
  let csv = 'Cliente,Produto,Nota,Data,Comentario\n';
  csData.forEach(item => {
    csv += `"${item.client}","${item.product}",${item.score},"${item.date}","${item.comment}"\n`;
  });
  downloadCSV(csv, 'avaliacoes_satisfacao.csv');
}

function addMksRecord() {
  const competitor = document.getElementById('mksCompetitor')?.value?.trim();
  const variable = document.getElementById('mksVariable')?.value;
  const score = parseInt(document.getElementById('mksScore')?.value);
  
  if (!competitor || !variable || !score) {
    alert('Preencha todos os campos.');
    return;
  }
  
  const existingIndex = mksData.findIndex(item => item.competitor === competitor && item.variable === variable);
  if (existingIndex >= 0) {
    mksData[existingIndex].score = score;
  } else {
    mksData.push({ competitor, variable, score });
  }
  
  // Clear form
  document.getElementById('mksCompetitor').value = '';
  document.getElementById('mksVariable').value = 'Preço';
  document.getElementById('mksScore').value = '3';
  
  updateMksAnalysis();
  autoSave();
  alert('Avaliação competitiva adicionada!');
}

function updateMksAnalysis() {
  const table = document.getElementById('mksTable');
  if (!table || mksData.length === 0) return;
  
  const competitors = [...new Set(mksData.map(item => item.competitor))];
  const variables = [...new Set(mksData.map(item => item.variable))];
  
  let html = '<thead><tr><th>Concorrente</th>';
  variables.forEach(variable => {
    html += `<th>${variable}</th>`;
  });
  html += '<th>Média</th></tr></thead><tbody>';
  
  competitors.forEach(competitor => {
    html += '<tr>';
    html += `<td><strong>${competitor}</strong></td>`;
    let total = 0;
    let count = 0;
    
    variables.forEach(variable => {
      const item = mksData.find(d => d.competitor === competitor && d.variable === variable);
      const score = item ? item.score : 0;
      if (score > 0) {
        total += score;
        count++;
      }
      const scoreClass = score >= 4 ? 'satisfaction-high' : score >= 3 ? 'satisfaction-medium' : 'satisfaction-low';
      html += `<td><span class="${scoreClass}">${score || '-'}</span></td>`;
    });
    
    const avg = count > 0 ? (total / count).toFixed(1) : '0';
    html += `<td><strong>${avg}</strong></td>`;
    html += '</tr>';
  });
  
  html += '</tbody>';
  table.innerHTML = html;
}

function exportMks() {
  if (mksData.length === 0) return;
  let csv = 'Concorrente,Variavel,Score\n';
  mksData.forEach(item => {
    csv += `"${item.competitor}","${item.variable}",${item.score}\n`;
  });
  downloadCSV(csv, 'analise_competitiva.csv');
}

function addVpmData() {
  const product = document.getElementById('vpmProduct')?.value;
  const price = parseFloat(document.getElementById('vpmPrice')?.value) || 0;
  const cost = parseFloat(document.getElementById('vpmCost')?.value) || 0;
  
  if (!product || price <= 0) {
    alert('Selecione um produto e informe o preço.');
    return;
  }
  
  const existingIndex = vpmData.findIndex(item => item.product === product);
  if (existingIndex >= 0) {
    vpmData[existingIndex] = { product, price, cost };
  } else {
    vpmData.push({ product, price, cost });
  }
  
  // Clear form
  document.getElementById('vpmProduct').value = '';
  document.getElementById('vpmPrice').value = '';
  document.getElementById('vpmCost').value = '';
  
  updateVpmAnalysis();
  autoSave();
  alert('Dados VPM adicionados!');
}

function updateVpmAnalysis() {
  if (vpmData.length === 0) return;
  
  const totalVolume = filteredData.length;
  const avgPrice = (vpmData.reduce((sum, item) => sum + item.price, 0) / vpmData.length).toFixed(2);
  const avgMargin = vpmData.length > 0 ? (vpmData.reduce((sum, item) => sum + ((item.price - item.cost) / item.price * 100), 0) / vpmData.length).toFixed(1) : '0';
  const revenue = (totalVolume * parseFloat(avgPrice)).toFixed(0);
  
  document.getElementById('vpmVolume').textContent = totalVolume;
  document.getElementById('vpmAvgPrice').textContent = `R$ ${avgPrice}`;
  document.getElementById('vpmAvgMargin').textContent = `${avgMargin}%`;
  document.getElementById('vpmRevenue').textContent = `R$ ${parseFloat(revenue).toLocaleString('pt-BR')}`;
  
  // Update table
  const table = document.getElementById('vpmTable');
  if (table) {
    let html = '<thead><tr><th>Produto</th><th>Preço</th><th>Custo</th><th>Margem %</th><th>Receita Est.</th></tr></thead><tbody>';
    vpmData.forEach(item => {
      const margin = ((item.price - item.cost) / item.price * 100).toFixed(1);
      const productVolume = filteredData.filter(c => {
        const prodKey = produtos.find(p => p.display === item.product)?.key;
        return prodKey && c.produtos[prodKey] === 1;
      }).length;
      const productRevenue = (productVolume * item.price).toFixed(0);
      
      html += '<tr>';
      html += `<td><strong>${item.product}</strong></td>`;
      html += `<td>R$ ${item.price.toFixed(2)}</td>`;
      html += `<td>R$ ${item.cost.toFixed(2)}</td>`;
      html += `<td><span class="${margin >= 30 ? 'satisfaction-high' : margin >= 15 ? 'satisfaction-medium' : 'satisfaction-low'}">${margin}%</span></td>`;
      html += `<td>R$ ${parseFloat(productRevenue).toLocaleString('pt-BR')}</td>`;
      html += '</tr>';
    });
    html += '</tbody>';
    table.innerHTML = html;
  }
}

function saveDiagnosis() {
  const problem = document.getElementById('problemDescription')?.value?.trim();
  const product = document.getElementById('affectedProduct')?.value;
  const period = document.getElementById('affectedPeriod')?.value?.trim();
  
  if (!problem) {
    alert('Descreva o problema identificado.');
    return;
  }
  
  const causes = {};
  document.querySelectorAll('.cause-input').forEach(input => {
    const category = input.dataset.category;
    const value = input.value.trim();
    if (value) {
      causes[category] = value;
    }
  });
  
  diagnosisData.push({
    problem,
    product: product || 'Geral',
    period: period || new Date().toLocaleDateString('pt-BR'),
    causes,
    timestamp: new Date().toLocaleString('pt-BR')
  });
  
  // Clear form
  document.getElementById('problemDescription').value = '';
  document.getElementById('affectedProduct').value = '';
  document.getElementById('affectedPeriod').value = '';
  document.querySelectorAll('.cause-input').forEach(input => input.value = '');
  
  updateDiagnosisHistory();
  autoSave();
  alert('Diagnóstico salvo com sucesso!');
}

function updateDiagnosisHistory() {
  const history = document.getElementById('diagnosisHistory');
  if (!history || diagnosisData.length === 0) {
    if (history) history.innerHTML = '<p>Nenhum diagnóstico registrado ainda.</p>';
    return;
  }
  
  let html = '';
  diagnosisData.forEach((diagnosis, index) => {
    html += '<div class="diagnosis-item">';
    html += `<h4>Diagnóstico #${index + 1}</h4>`;
    html += `<div class="diagnosis-meta">Produto: ${diagnosis.product} | Período: ${diagnosis.period} | ${diagnosis.timestamp}</div>`;
    html += `<p><strong>Problema:</strong> ${diagnosis.problem}</p>`;
    html += '<div class="diagnosis-causes">';
    Object.entries(diagnosis.causes).forEach(([category, cause]) => {
      html += `<div class="diagnosis-cause"><strong>${category}:</strong> ${cause}</div>`;
    });
    html += '</div></div>';
  });
  
  history.innerHTML = html;
}

function exportDiagnosis() {
  if (diagnosisData.length === 0) return;
  let csv = 'Problema,Produto,Periodo,Maquina,Metodo,Medida,Mao_de_obra,Meio_ambiente,Material,Timestamp\n';
  diagnosisData.forEach(item => {
    csv += `"${item.problem}","${item.product}","${item.period}","${item.causes['Máquina'] || ''}","${item.causes['Método'] || ''}","${item.causes['Medida'] || ''}","${item.causes['Mão de obra'] || ''}","${item.causes['Meio ambiente'] || ''}","${item.causes['Material'] || ''}","${item.timestamp}"\n`;
  });
  downloadCSV(csv, 'diagnosticos_ishikawa.csv');
}

function handleBackupImport(event) {
  const file = event.target.files[0];
  if (!file) return;
  
  const fileExtension = file.name.split('.').pop().toLowerCase();
  
  if (fileExtension === 'json') {
    if (!confirm('Isso substituirá todos os dados atuais. Continuar?')) {
      event.target.value = '';
      return;
    }
    
    db.import(file)
      .then(() => {
        alert('Backup restaurado com sucesso!');
        location.reload();
      })
      .catch(error => {
        alert('Erro ao restaurar backup: ' + error);
      })
      .finally(() => {
        event.target.value = '';
      });
  } else if (['csv', 'xlsx', 'xls'].includes(fileExtension)) {
    // Processar como dados de clientes
    processFile(file);
    event.target.value = '';
  } else {
    alert('Formato de arquivo não suportado. Use JSON, CSV ou Excel.');
    event.target.value = '';
  }
}

function updateDBStats() {
  const stats = db.getStats();
  const statsDiv = document.getElementById('dbStats');
  if (stats && statsDiv) {
    const lastUpdate = new Date(stats.lastUpdate).toLocaleString('pt-BR');
    statsDiv.innerHTML = `
      <strong>Estatísticas do Banco:</strong><br>
      • ${stats.clientes} clientes<br>
      • ${stats.produtos} produtos<br>
      • ${stats.contatos} contatos<br>
      • ${stats.diagnosticos} diagnósticos<br>
      <small>Última atualização: ${lastUpdate}</small>
    `;
  }
  
  // Atualizar a cada 30 segundos
  setTimeout(updateDBStats, 30000);
}

function salvarProduto() {
  const produto = {
    nome: document.getElementById('produtoNome')?.value?.trim(),
    fornecedor: document.getElementById('produtoFornecedor')?.value?.trim(),
    custo: document.getElementById('produtoCusto')?.value,
    categoria: document.getElementById('produtoCategoria')?.value,
    cultura: document.getElementById('produtoCultura')?.value,
    modoAcao: document.getElementById('produtoModoAcao')?.value,
    ingrediente: document.getElementById('produtoIngrediente')?.value?.trim(),
    finalidade: document.getElementById('produtoFinalidade')?.value?.trim(),
    tipoAplicacao: document.getElementById('produtoTipoAplicacao')?.value,
    dose: document.getElementById('produtoDose')?.value?.trim(),
    intervalo: document.getElementById('produtoIntervalo')?.value,
    epoca: document.getElementById('produtoEpoca')?.value,
    compatibilidade: document.getElementById('produtoCompatibilidade')?.value?.trim(),
    restricoes: document.getElementById('produtoRestricoes')?.value?.trim(),
    observacoes: document.getElementById('produtoObservacoes')?.value?.trim(),
    timestamp: new Date().toLocaleString('pt-BR')
  };
  
  const camposObrigatorios = ['nome', 'fornecedor', 'custo', 'categoria', 'cultura', 'ingrediente', 'finalidade', 'tipoAplicacao', 'dose', 'intervalo', 'epoca'];
  const camposFaltando = camposObrigatorios.filter(campo => !produto[campo]);
  
  if (camposFaltando.length > 0) {
    alert('Preencha todos os campos obrigatórios marcados com *');
    return;
  }
  
  let produtosCadastrados = JSON.parse(localStorage.getItem('produtosCadastrados') || '[]');
  produtosCadastrados.push(produto);
  localStorage.setItem('produtosCadastrados', JSON.stringify(produtosCadastrados));
  
  atualizarTabelaProdutos();
  limparFormularioProduto();
  
  alert(`Produto ${produto.nome} cadastrado com sucesso!`);
}

function limparFormularioProduto() {
  document.querySelectorAll('#produtos input, #produtos select, #produtos textarea').forEach(field => {
    field.value = '';
  });
}

function atualizarTabelaProdutos() {
  const produtosCadastrados = JSON.parse(localStorage.getItem('produtosCadastrados') || '[]');
  const tbody = document.querySelector('#produtosCadastradosTable tbody');
  
  if (!tbody) return;
  
  if (produtosCadastrados.length === 0) {
    tbody.innerHTML = '<tr><td colspan="7">Nenhum produto cadastrado ainda.</td></tr>';
    return;
  }
  
  tbody.innerHTML = produtosCadastrados.map((produto, index) => `
    <tr>
      <td><strong>${produto.nome}</strong></td>
      <td>${produto.categoria}</td>
      <td>${produto.cultura}</td>
      <td>${produto.dose}</td>
      <td>${produto.intervalo} dias</td>
      <td>R$ ${parseFloat(produto.custo || 0).toFixed(2)}</td>
      <td><button class="btn btn--sm" onclick="removerProduto(${index})">🗑️</button></td>
    </tr>
  `).join('');
}

function removerProduto(index) {
  if (!confirm('Tem certeza que deseja remover este produto?')) return;
  
  let produtosCadastrados = JSON.parse(localStorage.getItem('produtosCadastrados') || '[]');
  produtosCadastrados.splice(index, 1);
  localStorage.setItem('produtosCadastrados', JSON.stringify(produtosCadastrados));
  
  atualizarTabelaProdutos();
  alert('Produto removido com sucesso!');
}

function exportarProdutos() {
  const produtosCadastrados = JSON.parse(localStorage.getItem('produtosCadastrados') || '[]');
  
  if (produtosCadastrados.length === 0) {
    alert('Nenhum produto cadastrado para exportar.');
    return;
  }
  
  let csv = 'Nome,Fornecedor,Custo,Categoria,Cultura,ModoAcao,Ingrediente,Finalidade,TipoAplicacao,Dose,Intervalo,Epoca,Compatibilidade,Restricoes,Observacoes,Timestamp\n';
  produtosCadastrados.forEach(p => {
    csv += `"${p.nome}","${p.fornecedor}","${p.custo}","${p.categoria}","${p.cultura}","${p.modoAcao}","${p.ingrediente}","${p.finalidade}","${p.tipoAplicacao}","${p.dose}","${p.intervalo}","${p.epoca}","${p.compatibilidade}","${p.restricoes}","${p.observacoes}","${p.timestamp}"\n`;
  });
  
  downloadCSV(csv, 'produtos_agricolas_cadastrados.csv');
}

function updateOverviewReport() {
  const produtosCadastrados = JSON.parse(localStorage.getItem('produtosCadastrados') || '[]');
  const contatosData = JSON.parse(localStorage.getItem('contatosData') || '[]');
  const diagnosisData = JSON.parse(localStorage.getItem('diagnosisData') || '[]');
  
  // Update KPIs
  document.getElementById('kpiProdutosCadastrados').textContent = produtosCadastrados.length;
  document.getElementById('kpiContatosRegistrados').textContent = contatosData.length;
  document.getElementById('kpiDiagnosticos').textContent = diagnosisData.length;
  
  // Produtos por categoria
  const categorias = {};
  produtosCadastrados.forEach(p => {
    if (!categorias[p.categoria]) {
      categorias[p.categoria] = { count: 0, custoTotal: 0, culturas: {} };
    }
    categorias[p.categoria].count++;
    categorias[p.categoria].custoTotal += parseFloat(p.custo || 0);
    if (p.cultura) {
      categorias[p.categoria].culturas[p.cultura] = (categorias[p.categoria].culturas[p.cultura] || 0) + 1;
    }
  });
  
  const categoriasTable = document.getElementById('produtosCategoriaTable');
  if (categoriasTable) {
    const tbody = categoriasTable.querySelector('tbody');
    if (Object.keys(categorias).length === 0) {
      tbody.innerHTML = '<tr><td colspan="4">Nenhum produto cadastrado ainda.</td></tr>';
    } else {
      tbody.innerHTML = Object.entries(categorias).map(([cat, data]) => {
        const custoMedio = (data.custoTotal / data.count).toFixed(2);
        const culturaPrincipal = Object.entries(data.culturas).sort((a, b) => b[1] - a[1])[0]?.[0] || '-';
        return `
          <tr>
            <td><strong>${cat}</strong></td>
            <td>${data.count}</td>
            <td>R$ ${custoMedio}</td>
            <td>${culturaPrincipal}</td>
          </tr>
        `;
      }).join('');
    }
  }
  
  // Últimos produtos cadastrados
  const ultimosTable = document.getElementById('ultimosProdutosTable');
  if (ultimosTable) {
    const tbody = ultimosTable.querySelector('tbody');
    const ultimos = produtosCadastrados.slice(-5).reverse();
    if (ultimos.length === 0) {
      tbody.innerHTML = '<tr><td colspan="5">Nenhum produto cadastrado ainda.</td></tr>';
    } else {
      tbody.innerHTML = ultimos.map(p => `
        <tr>
          <td><strong>${p.nome}</strong></td>
          <td>${p.categoria}</td>
          <td>${p.cultura}</td>
          <td>R$ ${parseFloat(p.custo || 0).toFixed(2)}</td>
          <td>${p.timestamp}</td>
        </tr>
      `).join('');
    }
  }
}

function updateActiveFilters() {
  const activeFiltersDiv = document.getElementById('activeFilters');
  if (!activeFiltersDiv) return;
  
  const filters = [];
  
  const selectedCliente = document.getElementById('clienteSelect')?.value;
  const selectedCultura = document.getElementById('culturaSelect')?.value;
  const selectedRegiao = document.getElementById('regiaoSelect')?.value;
  const selectedStatus = document.getElementById('statusSelect')?.value;
  const selectedProduct = document.getElementById('productSelect')?.value;
  
  if (selectedCliente) filters.push(`Cliente: ${selectedCliente}`);
  if (selectedCultura) filters.push(`Cultura: ${selectedCultura}`);
  if (selectedRegiao) filters.push(`Região: ${selectedRegiao}`);
  if (selectedStatus) filters.push(`Status: ${selectedStatus}`);
  if (selectedProduct) {
    const prodObj = produtos.find(p => (p.key || p) === selectedProduct);
    const prodName = prodObj ? prodObj.display : selectedProduct;
    filters.push(`Produto: ${prodName}`);
  }
  
  if (filters.length === 0) {
    activeFiltersDiv.innerHTML = '<span class="status status--info">Todos os dados</span>';
  } else {
    activeFiltersDiv.innerHTML = filters.map(filter => 
      `<span class="status status--success">${filter}</span>`
    ).join('');
  }
}

let currentPeriod = 'year';

function updateSalesPeriod(period) {
  currentPeriod = period;
  
  // Update button states
  document.querySelectorAll('[id^="period"]').forEach(btn => {
    btn.className = 'btn btn--secondary';
  });
  document.getElementById(`period${period.charAt(0).toUpperCase() + period.slice(1)}`).className = 'btn btn--primary';
  
  updateSalesPeriodChart();
}

function updateSalesPeriodChart() {
  destroyChart('salesPeriodChart');
  
  const ctx = document.getElementById('salesPeriodChart')?.getContext('2d');
  if (!ctx || filteredData.length === 0) return;
  
  // Generate mock sales data based on current period and filtered data
  const data = generateSalesData(currentPeriod);
  
  charts.salesPeriod = new Chart(ctx, {
    type: 'line',
    data: {
      labels: data.labels,
      datasets: [{
        label: 'Vendas AJINOMOTO',
        data: data.values,
        borderColor: CHART_COLORS[0],
        backgroundColor: CHART_COLORS[0] + '20',
        tension: 0.4,
        fill: true
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false }
      },
      scales: {
        y: {
          beginAtZero: true,
          title: { display: true, text: 'Volume de Vendas' }
        },
        x: {
          title: { display: true, text: currentPeriod === 'week' ? 'Semanas' : currentPeriod === 'month' ? 'Meses' : 'Anos' }
        }
      }
    }
  });
}

function generateSalesData(period) {
  const baseValue = filteredData.length * 100; // Base value from filtered data
  
  if (period === 'custom') {
    const startDate = new Date(document.getElementById('startDate')?.value);
    const endDate = new Date(document.getElementById('endDate')?.value);
    
    if (startDate && endDate && startDate <= endDate) {
      const days = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));
      const labels = [];
      const values = [];
      
      for (let i = 0; i <= days; i += Math.max(1, Math.floor(days / 10))) {
        const date = new Date(startDate);
        date.setDate(startDate.getDate() + i);
        labels.push(date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }));
        values.push(baseValue + Math.random() * 200 - 100);
      }
      
      return { labels, values };
    }
  }
  
  if (period === 'week') {
    return {
      labels: ['Sem 1', 'Sem 2', 'Sem 3', 'Sem 4', 'Sem 5', 'Sem 6', 'Sem 7', 'Sem 8'],
      values: Array.from({length: 8}, (_, i) => baseValue + Math.random() * 200 - 100)
    };
  } else if (period === 'month') {
    return {
      labels: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'],
      values: Array.from({length: 12}, (_, i) => baseValue + Math.random() * 300 - 150)
    };
  } else {
    return {
      labels: ['2020', '2021', '2022', '2023', '2024'],
      values: Array.from({length: 5}, (_, i) => baseValue + i * 50 + Math.random() * 100 - 50)
    };
  }
}

function setDefaultDates() {
  const today = new Date();
  const lastMonth = new Date(today);
  lastMonth.setMonth(today.getMonth() - 1);
  
  const startDateInput = document.getElementById('startDate');
  const endDateInput = document.getElementById('endDate');
  
  if (startDateInput) startDateInput.value = lastMonth.toISOString().split('T')[0];
  if (endDateInput) endDateInput.value = today.toISOString().split('T')[0];
}

function applyCustomDateRange() {
  const startDate = document.getElementById('startDate')?.value;
  const endDate = document.getElementById('endDate')?.value;
  
  if (!startDate || !endDate) {
    alert('Selecione as datas de início e fim.');
    return;
  }
  
  if (new Date(startDate) > new Date(endDate)) {
    alert('Data de início deve ser anterior à data de fim.');
    return;
  }
  
  currentPeriod = 'custom';
  
  // Update button states
  document.querySelectorAll('[id^="period"]').forEach(btn => {
    btn.className = 'btn btn--secondary';
  });
  document.getElementById('applyDateRange').className = 'btn btn--primary';
  
  updateSalesPeriodChart();
}

function filterProducts() {
  const searchTerm = document.getElementById('productSearch')?.value?.toLowerCase() || '';
  const checkboxes = document.querySelectorAll('#cadastroProductFilters .checkbox-item');
  
  checkboxes.forEach(item => {
    const text = item.textContent.toLowerCase();
    item.style.display = text.includes(searchTerm) ? 'flex' : 'none';
  });
}

function selectAllProducts() {
  const visibleCheckboxes = document.querySelectorAll('#cadastroProductFilters .checkbox-item:not([style*="none"]) input[type="checkbox"]');
  visibleCheckboxes.forEach(cb => cb.checked = true);
  updateProductCount();
}

function clearAllProducts() {
  const checkboxes = document.querySelectorAll('#cadastroProductFilters input[type="checkbox"]');
  checkboxes.forEach(cb => cb.checked = false);
  updateProductCount();
}

function updateProductCount() {
  const total = document.querySelectorAll('#cadastroProductFilters input[type="checkbox"]').length;
  const selected = document.querySelectorAll('#cadastroProductFilters input[type="checkbox"]:checked').length;
  const countSpan = document.getElementById('selectedProductsCount');
  if (countSpan) {
    countSpan.textContent = `(${selected}/${total})`;
  }
}

function showProductList() {
  const productList = document.getElementById('cadastroProductFilters');
  if (productList) {
    productList.style.display = 'block';
  }
}

function hideProductList() {
  const productList = document.getElementById('cadastroProductFilters');
  if (productList) {
    productList.style.display = 'none';
  }
}

function hideProductListOnClickOutside(event) {
  const productSearch = document.getElementById('productSearch');
  const productList = document.getElementById('cadastroProductFilters');
  const selectAllBtn = document.getElementById('selectAllProducts');
  const clearAllBtn = document.getElementById('clearAllProducts');
  
  if (productSearch && productList && 
      !productSearch.contains(event.target) && 
      !productList.contains(event.target) && 
      !selectAllBtn?.contains(event.target) && 
      !clearAllBtn?.contains(event.target)) {
    hideProductList();
  }
}

// Adicionar elementos faltantes no DOM
function addMissingElements() {
  const missingElements = [
    { id: 'kpiTotal', defaultValue: '-' },
    { id: 'kpiAverage', defaultValue: '-' },
    { id: 'kpiProducts', defaultValue: '-' },
    { id: 'kpiPeriod', defaultValue: '-' }
  ];
  
  missingElements.forEach(elem => {
    if (!document.getElementById(elem.id)) {
      const element = document.createElement('div');
      element.id = elem.id;
      element.textContent = elem.defaultValue;
      element.style.display = 'none';
      document.body.appendChild(element);
    }
  });
}

// Executar ao carregar
document.addEventListener('DOMContentLoaded', () => {
  addMissingElements();
});

// Função de logout
function logout() {
  if (confirm('Deseja realmente sair do sistema?')) {
    sessionStorage.removeItem('auth');
    window.location.href = 'login.html';
  }
}
