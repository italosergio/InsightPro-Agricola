// Sistema de Banco de Dados Local - InsightPro
class LocalDatabase {
  constructor() {
    this.dbName = 'InsightProDB';
    this.version = '1.0';
    this.init();
  }

  init() {
    // Criar estrutura inicial se não existir
    if (!localStorage.getItem(this.dbName)) {
      const initialDB = {
        version: this.version,
        rawData: [],
        produtos: [],
        gutData: [],
        swotData: {},
        contatosData: [],
        pestData: {},
        csData: [],
        mksData: [],
        vpmData: [],
        diagnosisData: [],
        lastUpdate: new Date().toISOString()
      };
      this.save(initialDB);
    }
  }

  save(data) {
    try {
      data.lastUpdate = new Date().toISOString();
      localStorage.setItem(this.dbName, JSON.stringify(data));
      return true;
    } catch (error) {
      console.error('Erro ao salvar dados:', error);
      return false;
    }
  }

  load() {
    try {
      const data = localStorage.getItem(this.dbName);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      return null;
    }
  }

  saveAll() {
    const data = {
      version: this.version,
      rawData: rawData || [],
      produtos: produtos || [],
      gutData: gutData || [],
      swotData: swotData || {},
      contatosData: contatosData || [],
      pestData: pestData || {},
      csData: csData || [],
      mksData: mksData || [],
      vpmData: vpmData || [],
      diagnosisData: diagnosisData || [],
      lastUpdate: new Date().toISOString()
    };
    return this.save(data);
  }

  loadAll() {
    const data = this.load();
    if (data) {
      rawData = data.rawData || [];
      produtos = data.produtos || [];
      gutData = data.gutData || [];
      swotData = data.swotData || {};
      contatosData = data.contatosData || [];
      pestData = data.pestData || {};
      csData = data.csData || [];
      mksData = data.mksData || [];
      vpmData = data.vpmData || [];
      diagnosisData = data.diagnosisData || [];
      
      // Atualizar dados filtrados
      filteredData = [...rawData];
      
      return true;
    }
    return false;
  }

  export() {
    const data = this.load();
    if (data) {
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `InsightPro_Backup_${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
    }
  }

  import(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = JSON.parse(e.target.result);
          if (data.version && data.rawData !== undefined) {
            this.save(data);
            this.loadAll();
            resolve(true);
          } else {
            reject('Arquivo de backup inválido');
          }
        } catch (error) {
          reject('Erro ao ler arquivo: ' + error.message);
        }
      };
      reader.readAsText(file);
    });
  }

  clear() {
    localStorage.removeItem(this.dbName);
    this.init();
  }

  getStats() {
    const data = this.load();
    if (data) {
      return {
        clientes: data.rawData?.length || 0,
        produtos: data.produtos?.length || 0,
        contatos: data.contatosData?.length || 0,
        diagnosticos: data.diagnosisData?.length || 0,
        lastUpdate: data.lastUpdate
      };
    }
    return null;
  }
}

// Instância global do banco
const db = new LocalDatabase();

// Auto-save a cada mudança
function autoSave() {
  db.saveAll();
}

// Carregar dados ao iniciar
function loadSavedData() {
  const loaded = db.loadAll();
  if (loaded && rawData.length > 0) {
    initializeFilters();
    updateAllAnalyses();
    updateContatosTable();
    updateGutAnalysis();
    updateSWOTStrategies();
    updatePESTTable();
    updateCSAnalysis();
    updateMksAnalysis();
    updateVpmAnalysis();
    updateDiagnosisHistory();
    console.log('Dados carregados do banco local');
  }
}