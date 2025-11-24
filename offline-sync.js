// Offline Storage and Auto-Sync System
class OfflineSync {
  constructor() {
    this.isOnline = navigator.onLine;
    this.pendingData = this.loadPendingData();
    this.setupEventListeners();
    this.startAutoSave();
  }

  setupEventListeners() {
    // Monitor connection status
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.syncPendingData();
      this.showStatus('🟢 Conectado - Sincronizando dados...', 'success');
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
      this.showStatus('🔴 Offline - Dados serão salvos localmente', 'warning');
    });

    // Auto-save on form changes
    document.addEventListener('input', (e) => {
      if (e.target.matches('input, textarea, select')) {
        this.autoSave();
      }
    });

    // Auto-save on data changes
    document.addEventListener('dataChanged', () => {
      this.autoSave();
    });
  }

  startAutoSave() {
    // Auto-save every 30 seconds
    setInterval(() => {
      this.autoSave();
    }, 30000);
  }

  autoSave() {
    const currentData = this.collectAllData();
    
    // Save to localStorage immediately
    localStorage.setItem('insightpro_autosave', JSON.stringify({
      timestamp: Date.now(),
      data: currentData
    }));

    // If online, try to sync
    if (this.isOnline) {
      this.syncData(currentData);
    } else {
      // Store for later sync
      this.addToPendingSync(currentData);
    }
  }

  collectAllData() {
    return {
      // Main data
      rawData: window.rawData || [],
      filteredData: window.filteredData || [],
      produtos: window.produtos || [],
      
      // Analysis data
      gutData: window.gutData || [],
      swotData: window.swotData || {},
      contatosData: window.contatosData || [],
      
      // Form data
      formData: this.collectFormData(),
      
      // Filters
      filters: this.collectFilters(),
      
      timestamp: Date.now()
    };
  }

  collectFormData() {
    const forms = {};
    
    // Collect all form inputs
    document.querySelectorAll('input, textarea, select').forEach(element => {
      if (element.id) {
        forms[element.id] = {
          value: element.value,
          type: element.type,
          checked: element.checked
        };
      }
    });
    
    return forms;
  }

  collectFilters() {
    return {
      cliente: document.getElementById('clienteSelect')?.value || '',
      cultura: document.getElementById('culturaSelect')?.value || '',
      regiao: document.getElementById('regiaoSelect')?.value || '',
      status: document.getElementById('statusSelect')?.value || '',
      areaMin: document.getElementById('areaMin')?.value || 0,
      areaMax: document.getElementById('areaMax')?.value || 10000
    };
  }

  addToPendingSync(data) {
    this.pendingData.push({
      id: Date.now(),
      data: data,
      timestamp: Date.now()
    });
    
    localStorage.setItem('insightpro_pending', JSON.stringify(this.pendingData));
    this.showStatus(`📦 ${this.pendingData.length} alterações pendentes`, 'info');
  }

  loadPendingData() {
    try {
      return JSON.parse(localStorage.getItem('insightpro_pending') || '[]');
    } catch {
      return [];
    }
  }

  async syncData(data) {
    try {
      // Simulate API call - replace with your actual endpoint
      const response = await fetch('/api/sync-data', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });

      if (response.ok) {
        this.showStatus('✅ Dados sincronizados', 'success');
        return true;
      }
    } catch (error) {
      console.log('Falha na sincronização, tentará novamente:', error);
      this.addToPendingSync(data);
      return false;
    }
  }

  async syncPendingData() {
    if (this.pendingData.length === 0) return;

    const totalItems = this.pendingData.length;
    let syncedItems = 0;

    for (const item of this.pendingData) {
      const success = await this.syncData(item.data);
      if (success) {
        syncedItems++;
        // Remove synced item
        this.pendingData = this.pendingData.filter(p => p.id !== item.id);
      }
    }

    // Update localStorage
    localStorage.setItem('insightpro_pending', JSON.stringify(this.pendingData));

    if (syncedItems > 0) {
      this.showStatus(`✅ ${syncedItems}/${totalItems} itens sincronizados`, 'success');
    }

    if (this.pendingData.length > 0) {
      this.showStatus(`⚠️ ${this.pendingData.length} itens ainda pendentes`, 'warning');
    }
  }

  restoreAutoSave() {
    try {
      const saved = localStorage.getItem('insightpro_autosave');
      if (!saved) return false;

      const { timestamp, data } = JSON.parse(saved);
      const ageMinutes = (Date.now() - timestamp) / (1000 * 60);

      // Only restore if less than 24 hours old
      if (ageMinutes > 1440) return false;

      // Restore main data
      if (data.rawData?.length > 0) {
        window.rawData = data.rawData;
        window.filteredData = data.filteredData;
        window.produtos = data.produtos;
      }

      // Restore analysis data
      if (data.gutData) window.gutData = data.gutData;
      if (data.swotData) window.swotData = data.swotData;
      if (data.contatosData) window.contatosData = data.contatosData;

      // Restore form data
      if (data.formData) {
        Object.entries(data.formData).forEach(([id, fieldData]) => {
          const element = document.getElementById(id);
          if (element) {
            element.value = fieldData.value || '';
            if (fieldData.type === 'checkbox' || fieldData.type === 'radio') {
              element.checked = fieldData.checked || false;
            }
          }
        });
      }

      this.showStatus(`🔄 Dados restaurados (${Math.round(ageMinutes)}min atrás)`, 'info');
      return true;
    } catch (error) {
      console.error('Falha ao restaurar dados salvos:', error);
      return false;
    }
  }

  showStatus(message, type = 'info') {
    // Remove existing status
    const existing = document.getElementById('sync-status');
    if (existing) existing.remove();

    // Create status element
    const status = document.createElement('div');
    status.id = 'sync-status';
    status.textContent = message;
    status.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      padding: 12px 20px;
      border-radius: 8px;
      font-weight: 700;
      font-size: 14px;
      z-index: 10000;
      box-shadow: 0 4px 12px rgba(0,0,0,0.3);
      transition: all 0.3s ease;
      ${this.getStatusColors(type)}
    `;

    document.body.appendChild(status);

    // Auto-remove after 5 seconds
    setTimeout(() => {
      if (status.parentNode) {
        status.style.opacity = '0';
        setTimeout(() => status.remove(), 300);
      }
    }, 5000);
  }

  getStatusColors(type) {
    const colors = {
      success: 'background: linear-gradient(135deg, #10b981, #059669); color: white;',
      warning: 'background: linear-gradient(135deg, #f59e0b, #d97706); color: white;',
      error: 'background: linear-gradient(135deg, #ef4444, #dc2626); color: white;',
      info: 'background: linear-gradient(135deg, #3b82f6, #2563eb); color: white;'
    };
    return colors[type] || colors.info;
  }

  clearAllData() {
    if (confirm('Tem certeza que deseja limpar todos os dados salvos?')) {
      localStorage.removeItem('insightpro_autosave');
      localStorage.removeItem('insightpro_pending');
      this.pendingData = [];
      this.showStatus('🗑️ Dados locais removidos', 'info');
    }
  }

  exportPendingData() {
    if (this.pendingData.length === 0) {
      alert('Nenhum dado pendente para exportar.');
      return;
    }

    const dataStr = JSON.stringify(this.pendingData, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `insightpro_pending_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    
    URL.revokeObjectURL(url);
    this.showStatus('📥 Dados pendentes exportados', 'success');
  }
}

// Initialize offline sync system
const offlineSync = new OfflineSync();

// Restore data on page load
document.addEventListener('DOMContentLoaded', () => {
  setTimeout(() => {
    offlineSync.restoreAutoSave();
  }, 1000);
});

// Add sync controls to interface
document.addEventListener('DOMContentLoaded', () => {
  // Add sync status indicator to header
  const header = document.querySelector('.app-header .header-content');
  if (header) {
    const syncControls = document.createElement('div');
    syncControls.innerHTML = `
      <div style="display: flex; gap: 8px; align-items: center;">
        <button class="btn btn--sm" onclick="offlineSync.syncPendingData()" title="Sincronizar agora">
          🔄 Sincronizar
        </button>
        <button class="btn btn--sm" onclick="offlineSync.exportPendingData()" title="Exportar dados pendentes">
          📥 Exportar
        </button>
        <div id="connection-status" style="width: 12px; height: 12px; border-radius: 50%; background: ${navigator.onLine ? '#10b981' : '#ef4444'};"></div>
      </div>
    `;
    header.appendChild(syncControls);
  }
});

// Update connection indicator
window.addEventListener('online', () => {
  const indicator = document.getElementById('connection-status');
  if (indicator) indicator.style.background = '#10b981';
});

window.addEventListener('offline', () => {
  const indicator = document.getElementById('connection-status');
  if (indicator) indicator.style.background = '#ef4444';
});