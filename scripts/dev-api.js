/**
 * Servidor de desenvolvimento local para a API DeepSeek.
 * Roda na porta 3001 — o Vite faz proxy de /api para cá.
 *
 * Uso:
 *   node scripts/dev-api.js
 */

const http = require('http');
const { URL } = require('path');

// Carrega variáveis do .env
const fs = require('fs');
const path = require('path');
const envPath = path.resolve(__dirname, '..', '.env');
if (fs.existsSync(envPath)) {
  const lines = fs.readFileSync(envPath, 'utf-8').split('\n');
  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const eqIdx = trimmed.indexOf('=');
      if (eqIdx > 0) {
        const key = trimmed.slice(0, eqIdx).trim();
        const val = trimmed.slice(eqIdx + 1).trim();
        if (!process.env[key]) process.env[key] = val;
      }
    }
  }
  console.log('✅ .env carregado');
} else {
  console.warn('⚠️  Arquivo .env não encontrado');
  console.warn('   Crie um arquivo .env com DEEPSEEK_API_KEY=sua_chave');
}

const PORT = 3001;
const API_PATH = '/api/generate-report';

const server = http.createServer(async (req, res) => {
  const parsedUrl = new URL(req.url, `http://localhost:${PORT}`);

  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  if (parsedUrl.pathname !== API_PATH || req.method !== 'POST') {
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Use POST /api/generate-report' }));
    return;
  }

  let body = '';
  req.on('data', chunk => { body += chunk; });
  req.on('end', async () => {
    try {
      const data = JSON.parse(body);

      // Verifica se tem a chave configurada
      if (!process.env.DEEPSEEK_API_KEY) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          error: 'DEEPSEEK_API_KEY não configurada',
          hint: 'Adicione DEEPSEEK_API_KEY no arquivo .env',
        }));
        return;
      }

      // Importa o handler da API (usa import dinâmico para ESM)
      const apiPath = path.resolve(__dirname, '..', 'api', 'generate-report.js');
      const handlerModule = await import(apiPath);
      const handler = handlerModule.default;

      // Simula objetos req/res do Vercel
      const vercelReq = {
        method: 'POST',
        headers: req.headers,
        body: data,
      };

      const vercelRes = {
        _status: 200,
        _headers: {},
        _body: null,
        status(code) {
          this._status = code;
          return this;
        },
        json(payload) {
          this._body = JSON.stringify(payload);
          res.writeHead(this._status, { 'Content-Type': 'application/json', ...this._headers });
          res.end(this._body);
        },
        setHeader(name, value) {
          this._headers[name] = value;
          return this;
        },
        end(data) {
          res.writeHead(this._status, { 'Content-Type': 'application/json', ...this._headers });
          res.end(data);
        },
      };

      await handler(vercelReq, vercelRes);
    } catch (err) {
      console.error('❌ Erro:', err);
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: err.message }));
    }
  });
});

server.listen(PORT, () => {
  console.log(`
✅ API DeepSeek rodando em http://localhost:${PORT}${API_PATH}
📌 Mantenha este terminal aberto e em outro terminal rode:
   npm run dev
`);
});
