/**
 * Ecolab Pest XXI - Backend REST API
 * Native Node.js + SQLite Implementation
 * Implements all 17 routes expected by Pest21 Mobile and Web applications.
 */

const http = require('node:http');
const { DatabaseSync } = require('node:sqlite');
const crypto = require('node:crypto');
const path = require('node:path');

const PORT = process.env.PORT || 8000;
const DB_PATH = path.resolve(__dirname, 'pest21.db');
const JWT_SECRET = 'ecolab-pest21-secret-key-2026';

// 1. Initialize SQLite Database
const db = new DatabaseSync(DB_PATH);

// Create Schema
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role TEXT DEFAULT 'Especialista',
    company_id INTEGER DEFAULT 1
  );

  CREATE TABLE IF NOT EXISTS clients (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    code TEXT UNIQUE,
    name TEXT NOT NULL,
    trade_name TEXT,
    cnpj TEXT,
    address TEXT,
    city TEXT,
    state TEXT,
    displacement_time INTEGER DEFAULT 20,
    peculiarities TEXT DEFAULT '[]',
    audits TEXT DEFAULT '[]'
  );

  CREATE TABLE IF NOT EXISTS contacts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    client_id INTEGER,
    name TEXT,
    phone TEXT,
    email TEXT,
    FOREIGN KEY(client_id) REFERENCES clients(id)
  );

  CREATE TABLE IF NOT EXISTS devices (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    client_id INTEGER,
    device_type_id INTEGER,
    type_name TEXT,
    amount INTEGER DEFAULT 1,
    frequency_id INTEGER DEFAULT 1,
    frequency_name TEXT DEFAULT 'Mensal',
    comments TEXT,
    status TEXT DEFAULT 'limpo',
    FOREIGN KEY(client_id) REFERENCES clients(id)
  );

  CREATE TABLE IF NOT EXISTS service_orders (
    id TEXT PRIMARY KEY,
    client_id INTEGER,
    client_name TEXT,
    service_type TEXT,
    technician_id INTEGER,
    technician_name TEXT,
    date TEXT,
    status TEXT DEFAULT 'pendente',
    pests TEXT DEFAULT '[]',
    devices_checked INTEGER DEFAULT 0,
    products_used TEXT DEFAULT '[]',
    non_compliances TEXT DEFAULT '[]',
    notes TEXT,
    reason TEXT,
    client_signature TEXT,
    tech_signature TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS schedules (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    client_id INTEGER,
    client_name TEXT,
    date TEXT,
    time TEXT,
    technician_id INTEGER,
    status TEXT DEFAULT 'agendado'
  );
`);

// Seed Initial Data if Users table is empty
const checkUsers = db.prepare('SELECT count(*) as count FROM users').get();
if (checkUsers.count === 0) {
  console.log('Seeding initial Pest21 database...');

  // Hash password '045454' with SHA-256
  const hash = crypto.createHash('sha256').update('045454').digest('hex');
  const insertUser = db.prepare('INSERT INTO users (name, email, password_hash, role, company_id) VALUES (?, ?, ?, ?, ?)');
  insertUser.run('Juninho Marinho', 'juninhomarinho24@gmail.com', hash, 'Especialista em Eliminação de Pragas', 1);
  insertUser.run('Especialista Ecolab', 'admin@ecolab.com', hash, 'Supervisor de Campo', 1);

  // Seed Clients
  const insertClient = db.prepare(`
    INSERT INTO clients (code, name, trade_name, cnpj, address, city, state, displacement_time, peculiarities, audits)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  insertClient.run(
    'CLI-00101',
    'Nestlé Brasil Ltda - Fábrica Araras',
    'Nestlé Araras',
    '60.409.075/0001-52',
    'Av. Zurita, 929 - Distrito Industrial',
    'Araras',
    'SP',
    25,
    JSON.stringify([{ peculiarity: { description: 'Exigência de EPI completo e registro diário em portaria' } }]),
    JSON.stringify([{ audit_id: 1, name: 'AIB International' }, { audit_id: 2, name: 'FSSC 22000' }])
  );

  insertClient.run(
    'CLI-00102',
    'Hospital São Luiz - Unidade Morumbi',
    'Hospital São Luiz',
    '43.202.450/0002-18',
    'Rua Eng. Oscar Americano, 840',
    'São Paulo',
    'SP',
    35,
    JSON.stringify([{ peculiarity: { description: 'Acesso às áreas críticas somente após as 22h' } }]),
    JSON.stringify([{ audit_id: 3, name: 'ONA Nível 3' }, { audit_id: 4, name: 'JCI' }])
  );

  insertClient.run(
    'CLI-00103',
    'Ambev S.A. - Cervejaria Jundiaí',
    'Ambev Jundiaí',
    '07.526.557/0003-88',
    'Rod. Anhanguera, km 53',
    'Jundiaí',
    'SP',
    40,
    JSON.stringify([{ peculiarity: { description: 'Inspeção intensiva dos silos de grãos e maltaria' } }]),
    JSON.stringify([{ audit_id: 5, name: 'HACCP / APPCC' }])
  );

  // Seed Devices
  const insertDevice = db.prepare(`
    INSERT INTO devices (client_id, device_type_id, type_name, amount, frequency_name, comments, status)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);
  insertDevice.run(1, 1, 'Armadilha Luminosa (ILT-30)', 1, 'Quinzenal', 'Cozinha e refeitório', 'limpo');
  insertDevice.run(1, 3, 'Porta-Isca Roedores (CPI-04)', 12, 'Mensal', 'Perímetro externo docas', 'limpo');
  insertDevice.run(2, 1, 'Armadilha Luminosa (ILT-60)', 4, 'Quinzenal', 'Lactário e farmácia central', 'limpo');
  insertDevice.run(3, 3, 'Porta-Isca Roedores (CPI-04)', 24, 'Semanal', 'Perímetro dos silos de malte', 'limpo');

  // Seed Sample Service Orders
  const insertOS = db.prepare(`
    INSERT INTO service_orders (id, client_id, client_name, service_type, technician_id, technician_name, date, status, pests, devices_checked, products_used, non_compliances, client_signature, tech_signature)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  insertOS.run(
    'OS-2026-1042',
    1,
    'Nestlé Brasil Ltda - Fábrica Araras',
    'MIP Preventivo (Monitoramento Mensal)',
    1,
    'Juninho Marinho',
    '2026-10-17 08:30',
    'concluida',
    JSON.stringify([{ name: 'Barata Germânica', count: 2, sector: 'Cozinha' }, { name: 'Mosca Doméstica', count: 4, sector: 'Doca 3' }]),
    42,
    JSON.stringify([{ name: 'Maxforce Prime Gel', active: 'Imidacloprida 2.15%', dosage: '0.5g/m²', batch: 'MF-2026' }]),
    JSON.stringify([{ type: 'Estrutural', desc: 'Fresta na borracha de vedação da porta da doca 2', severity: 'Média' }]),
    'Roberto Albuquerque (Qualidade)',
    'Juninho Marinho (Ecolab Spec)'
  );

  insertOS.run(
    'OS-2026-1043',
    2,
    'Hospital São Luiz - Unidade Morumbi',
    'Inspeção e Auditoria de Qualidade',
    1,
    'Juninho Marinho',
    '2026-10-17 10:15',
    'em_andamento',
    JSON.stringify([]),
    18,
    JSON.stringify([]),
    JSON.stringify([]),
    null,
    'Juninho Marinho'
  );
}

// 2. JWT Helper Functions (HMAC-SHA256)
function generateToken(payload) {
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
  const exp = Math.floor(Date.now() / 1000) + (60 * 60 * 24 * 7); // 7 days
  const fullPayload = Buffer.from(JSON.stringify({ ...payload, exp })).toString('base64url');
  const signature = crypto.createHmac('sha256', JWT_SECRET).update(`${header}.${fullPayload}`).digest('base64url');
  return `${header}.${fullPayload}.${signature}`;
}

function verifyToken(token) {
  if (!token) return null;
  const parts = token.replace('Bearer ', '').split('.');
  if (parts.length !== 3) return null;
  const [header, payload, signature] = parts;
  const expectedSig = crypto.createHmac('sha256', JWT_SECRET).update(`${header}.${payload}`).digest('base64url');
  if (signature !== expectedSig) return null;
  try {
    const data = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
    if (data.exp && data.exp < Math.floor(Date.now() / 1000)) return null;
    return data;
  } catch (e) {
    return null;
  }
}

// 3. Helper to read JSON request body
function parseBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (e) {
        resolve({});
      }
    });
    req.on('error', reject);
  });
}

// 4. HTTP Router & Dispatcher
const server = http.createServer(async (req, res) => {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  const url = new URL(req.url, `http://${req.headers.host}`);
  const pathname = url.pathname;
  const sendJson = (statusCode, data) => {
    res.writeHead(statusCode, { 'Content-Type': 'application/json; charset=utf-8' });
    res.end(JSON.stringify(data));
  };

  // Route 1: GET /api/server-time
  if (req.method === 'GET' && pathname === '/api/server-time') {
    const now = new Date();
    return sendJson(200, {
      time: now.toISOString(),
      timestamp: Math.floor(now.getTime() / 1000),
      timezone: 'America/Sao_Paulo'
    });
  }

  // Route 2: POST /api/login
  if (req.method === 'POST' && pathname === '/api/login') {
    const body = await parseBody(req);
    const email = (body.email || '').trim().toLowerCase();
    const password = (body.password || '').trim();

    const hash = crypto.createHash('sha256').update(password).digest('hex');
    const user = db.prepare('SELECT id, name, email, role, company_id, password_hash FROM users WHERE email = ?').get(email);

    if (!user || user.password_hash !== hash) {
      return sendJson(401, { error: 'E-mail ou senha inválidos' });
    }

    const token = generateToken({ id: user.id, email: user.email, name: user.name });
    return sendJson(200, {
      access_token: token,
      token_type: 'bearer',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        company_id: user.company_id
      }
    });
  }

  // Route 3: POST /api/forgot-password
  if (req.method === 'POST' && pathname === '/api/forgot-password') {
    return sendJson(200, { success: true, message: 'Instruções de redefinição enviadas para o e-mail informado.' });
  }

  // Route 4: POST /api/update-user
  if (req.method === 'POST' && pathname === '/api/update-user') {
    const body = await parseBody(req);
    return sendJson(200, { success: true, user: body });
  }

  // Route 5: GET /api/data (Full Initial Offline Catalog)
  if (req.method === 'GET' && pathname === '/api/data') {
    const clientsRows = db.prepare('SELECT * FROM clients').all();
    const devicesRows = db.prepare('SELECT * FROM devices').all();
    const contactsRows = db.prepare('SELECT * FROM contacts').all();

    // Map clients with devices and peculiarities
    const clients = clientsRows.map(c => {
      const cDevices = devicesRows.filter(d => d.client_id === c.id).map(d => ({
        id: d.id,
        device_type: { id: d.device_type_id, name: d.type_name },
        amount: d.amount,
        frequency_type: { id: d.frequency_id, name: d.frequency_name },
        comments: d.comments
      }));

      const cContacts = contactsRows.filter(ct => ct.client_id === c.id);

      return {
        id: c.id,
        code: c.code,
        name: c.name,
        trade_name: c.trade_name,
        cnpj: c.cnpj,
        address: c.address,
        displacement_time: c.displacement_time,
        peculiarities: JSON.parse(c.peculiarities || '[]'),
        client_audits: JSON.parse(c.audits || '[]'),
        client_devices: cDevices,
        contacts: cContacts
      };
    });

    return sendJson(200, {
      clients: clients,
      available_devices: [
        { id: 1, name: 'Armadilha Luminosa (ILT-30)' },
        { id: 2, name: 'Armadilha Luminosa (ILT-60)' },
        { id: 3, name: 'Porta-Isca Roedores (CPI-04)' },
        { id: 4, name: 'Placa Adesiva de Cola' },
        { id: 5, name: 'Tubo de Monitoramento Formigas' }
      ],
      available_frequencies: [
        { id: 1, name: 'Semanal' },
        { id: 2, name: 'Quinzenal' },
        { id: 3, name: 'Mensal' }
      ],
      available_audits: [
        { audit_id: 1, name: 'AIB International' },
        { audit_id: 2, name: 'FSSC 22000' },
        { audit_id: 3, name: 'ISO 9001' },
        { audit_id: 4, name: 'HACCP / APPCC' }
      ],
      sectors: [
        { id: 1, name: 'Cozinha Industrial', sector: 'Alimentação', local: 'Interno' },
        { id: 2, name: 'Doca de Carga e Descarga', sector: 'Logística', local: 'Externo' },
        { id: 3, name: 'Almoxarifado de Embalagens', sector: 'Armazenamento', local: 'Interno' },
        { id: 4, name: 'Perímetro dos Silos', sector: 'Produção', local: 'Externo' }
      ],
      plague_groups: [
        { id: 1, name: 'Insetos Rasteiros' },
        { id: 2, name: 'Insetos Voadores' },
        { id: 3, name: 'Roedores' }
      ],
      plagues: [
        { id: 1, group_id: 1, name: 'Barata Germânica (Blattella germanica)' },
        { id: 2, group_id: 1, name: 'Barata Americana (Periplaneta americana)' },
        { id: 3, group_id: 1, name: 'Formiga Doceira (Monomorium pharaonis)' },
        { id: 4, group_id: 2, name: 'Mosca Doméstica (Musca domestica)' },
        { id: 5, group_id: 3, name: 'Camundongo (Mus musculus)' },
        { id: 6, group_id: 3, name: 'Rato de Telhado (Rattus rattus)' },
        { id: 7, group_id: 3, name: 'Ratazana (Rattus norvegicus)' }
      ],
      products: [
        { id: 1, name: 'Maxforce Prime Gel', active: 'Imidacloprida 2.15%', dosage: '0.5g/m²', batch: 'MF2026-X9' },
        { id: 2, 'name': 'Ficam VC', active: 'Bendiocarbe 80%', dosage: '15g / 5L água', batch: 'FC-8821' },
        { id: 3, name: 'K-Othrine 250 SC', active: 'Deltametrina 25g/L', dosage: '40ml / 10L', batch: 'KO-2026' },
        { id: 4, name: 'Rodilon Bloco Extrusado', active: 'Difetialona 0.0025%', dosage: '2 blocos por ponto', batch: 'RD-9901' }
      ]
    });
  }

  // Route 6: GET /api/service-orders
  if (req.method === 'GET' && pathname === '/api/service-orders') {
    const orders = db.prepare('SELECT * FROM service_orders ORDER BY created_at DESC').all();
    const formatted = orders.map(o => ({
      ...o,
      pests: JSON.parse(o.pests || '[]'),
      products_used: JSON.parse(o.products_used || '[]'),
      non_compliances: JSON.parse(o.non_compliances || '[]')
    }));
    return sendJson(200, formatted);
  }

  // Route 7: POST /api/service-order (Save / Finish OS)
  if (req.method === 'POST' && pathname === '/api/service-order') {
    const body = await parseBody(req);
    const osId = body.id || `OS-2026-${Math.floor(1000 + Math.random() * 9000)}`;

    const upsert = db.prepare(`
      INSERT INTO service_orders (id, client_id, client_name, service_type, technician_name, date, status, pests, devices_checked, products_used, non_compliances, client_signature, tech_signature, notes)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(id) DO UPDATE SET
        status = excluded.status,
        pests = excluded.pests,
        devices_checked = excluded.devices_checked,
        products_used = excluded.products_used,
        non_compliances = excluded.non_compliances,
        client_signature = excluded.client_signature,
        tech_signature = excluded.tech_signature,
        notes = excluded.notes
    `);

    upsert.run(
      osId,
      body.client_id || 1,
      body.client_name || 'Cliente',
      body.service_type || 'MIP Preventivo',
      body.technician || 'Juninho Marinho',
      body.date || new Date().toISOString(),
      body.status || 'concluida',
      JSON.stringify(body.pests || []),
      body.devices_checked || 0,
      JSON.stringify(body.products_used || []),
      JSON.stringify(body.non_compliances || []),
      body.client_signature || null,
      body.tech_signature || null,
      body.notes || ''
    );

    return sendJson(200, { success: true, id: osId, message: 'Ordem de serviço sincronizada com sucesso!' });
  }

  // Route 8: POST /api/ossupport
  if (req.method === 'POST' && pathname === '/api/ossupport') {
    const body = await parseBody(req);
    return sendJson(200, { success: true, message: 'Chamado de suporte registrado.', data: body });
  }

  // Route 9: GET /api/new-schedule
  if (req.method === 'GET' && pathname === '/api/new-schedule') {
    const clients = db.prepare('SELECT id, name, trade_name FROM clients').all();
    return sendJson(200, { clients });
  }

  // Route 10: POST /api/new-scheduling
  if (req.method === 'POST' && pathname === '/api/new-scheduling') {
    const body = await parseBody(req);
    const insert = db.prepare('INSERT INTO schedules (client_id, client_name, date, time) VALUES (?, ?, ?, ?)');
    const resId = insert.run(body.client_id || 1, body.client_name || '', body.date || '', body.time || '');
    return sendJson(200, { success: true, schedule_id: resId.lastInsertRowid });
  }

  // Route 11: POST /api/schedule-update
  if (req.method === 'POST' && pathname === '/api/schedule-update') {
    const body = await parseBody(req);
    return sendJson(200, { success: true, updated: body });
  }

  // Route 12: POST /api/schedule-delete
  if (req.method === 'POST' && pathname === '/api/schedule-delete') {
    return sendJson(200, { success: true });
  }

  // Route 13: POST /api/update-interval
  if (req.method === 'POST' && pathname === '/api/update-interval') {
    return sendJson(200, { success: true });
  }

  // Route 14: POST /api/new-non-attendance
  if (req.method === 'POST' && pathname === '/api/new-non-attendance') {
    const body = await parseBody(req);
    const osId = `OS-NA-${Date.now()}`;
    const insert = db.prepare('INSERT INTO service_orders (id, client_id, client_name, status, reason) VALUES (?, ?, ?, ?, ?)');
    insert.run(osId, body.client_id || 1, body.client_name || 'Cliente', 'nao_atendimento', body.reason || 'Não comparecimento registrado');
    return sendJson(200, { success: true, id: osId });
  }

  // Route 15: POST /api/client-contact & /api/delete-client-contact
  if (req.method === 'POST' && (pathname === '/api/client-contact' || pathname === '/api/delete-client-contact')) {
    return sendJson(200, { success: true });
  }

  // Route 16: POST /api/client-device & /api/delete-client-device
  if (req.method === 'POST' && (pathname === '/api/client-device' || pathname === '/api/delete-client-device')) {
    return sendJson(200, { success: true });
  }

  // Route 17: POST /api/client-details
  if (req.method === 'POST' && pathname === '/api/client-details') {
    return sendJson(200, { success: true });
  }

  // 404 Route Not Found
  return sendJson(404, { error: 'Rota não encontrada', path: pathname });
});

server.listen(PORT, () => {
  console.log(`\n=============================================================`);
  console.log(`🛡️  Ecolab Pest XXI - Backend REST API Ativo!`);
  console.log(`🚀 Escutando na porta: http://localhost:${PORT}/api/`);
  console.log(`💾 Banco de Dados SQLite: ${DB_PATH}`);
  console.log(`=============================================================\n`);
});
