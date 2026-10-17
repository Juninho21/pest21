/**
 * Ecolab Pest XXI - Web Administrative & Operations Dashboard
 * Core Application Logic, State Management & Mock Database
 */

// Initial Seed Data for Ecolab Pest Elimination Operations
const DEFAULT_CLIENTS = [
  {
    id: 101,
    code: "CLI-00101",
    name: "Nestlé Brasil Ltda - Fábrica Araras",
    tradeName: "Nestlé Araras",
    cnpj: "60.409.075/0001-52",
    city: "Araras",
    state: "SP",
    contact: "Roberto Albuquerque (Gerente de Qualidade)",
    phone: "(19) 3543-1200",
    devicesCount: 42,
    audits: ["AIB International", "FSSC 22000", "ISO 9001"],
    notes: "Exigência rigorosa de EPI completo e registro diário no livro de portaria."
  },
  {
    id: 102,
    code: "CLI-00102",
    name: "Hospital São Luiz - Unidade Morumbi",
    tradeName: "Hospital São Luiz",
    cnpj: "43.202.450/0002-18",
    city: "São Paulo",
    state: "SP",
    contact: "Dra. Camila Nogueira (CCIH)",
    phone: "(11) 3093-1100",
    devicesCount: 28,
    audits: ["ONA Nível 3", "JCI (Joint Commission)"],
    notes: "Acesso a áreas críticas (UTI e Centro Cirúrgico) somente após as 22h."
  },
  {
    id: 103,
    code: "CLI-00103",
    name: "Ambev S.A. - Cervejaria Jundiaí",
    tradeName: "Ambev Jundiaí",
    cnpj: "07.526.557/0003-88",
    city: "Jundiaí",
    state: "SP",
    contact: "Eng. Marcos Zanin",
    phone: "(11) 4589-9000",
    devicesCount: 65,
    audits: ["ISO 14001", "HACCP / APPCC"],
    notes: "Monitoramento intensivo de perímetros externos e silos de malte."
  },
  {
    id: 104,
    code: "CLI-00104",
    name: "Rede Bourbon Hotéis & Resorts",
    tradeName: "Bourbon Ibirapuera",
    cnpj: "18.394.021/0001-90",
    city: "São Paulo",
    state: "SP",
    contact: "Patrícia Viana (Governança)",
    phone: "(11) 5091-2330",
    devicesCount: 22,
    audits: ["Vigilância Sanitária Estadual"],
    notes: "Inspeção discreta em áreas sociais e restaurantes fora de horários de refeição."
  }
];

const DEFAULT_ORDERS = [
  {
    id: "OS-2026-1042",
    client_id: 101,
    client_name: "Nestlé Brasil Ltda - Fábrica Araras",
    service_type: "MIP Preventivo (Monitoramento Mensal)",
    technician: "Juninho Marinho",
    date: "2026-10-17 08:30",
    status: "concluida",
    pests: [
      { name: "Barata Germânica (Blattella germanica)", count: 2, sector: "Cozinha dos Funcionários" },
      { name: "Mosca Doméstica (Musca domestica)", count: 5, sector: "Doca de Descarte" }
    ],
    devices_checked: 42,
    products_used: [
      { name: "Maxforce Prime Gel", active: "Imidacloprida 2.15%", dosage: "0.5g/m²", batch: "MF2026-X9" },
      { name: "Ficam VC", active: "Bendiocarbe 80%", dosage: "15g / 5L água", batch: "FC-8821" }
    ],
    non_compliances: [
      { type: "Estrutural", desc: "Fresta de 2cm na vedação inferior da porta da doca 2.", severity: "Média" }
    ],
    client_signature: "Roberto Albuquerque",
    tech_signature: "Juninho Marinho (Ecolab Spec #842)",
    eval_score: 5
  },
  {
    id: "OS-2026-1043",
    client_id: 102,
    client_name: "Hospital São Luiz - Unidade Morumbi",
    service_type: "Inspeção e Auditoria de Qualidade",
    technician: "Carlos Eduardo Santos",
    date: "2026-10-17 10:15",
    status: "em_andamento",
    pests: [],
    devices_checked: 18,
    products_used: [],
    non_compliances: [],
    client_signature: null,
    tech_signature: "Carlos Eduardo Santos",
    eval_score: null
  },
  {
    id: "OS-2026-1044",
    client_id: 103,
    client_name: "Ambev S.A. - Cervejaria Jundiaí",
    service_type: "Desratização Perimetral e Tratamento de Silos",
    technician: "Juninho Marinho",
    date: "2026-10-17 14:00",
    status: "pendente",
    pests: [],
    devices_checked: 0,
    products_used: [],
    non_compliances: [],
    client_signature: null,
    tech_signature: null,
    eval_score: null
  },
  {
    id: "OS-2026-1045",
    client_id: 104,
    client_name: "Rede Bourbon Hotéis & Resorts",
    service_type: "Desinsetização Corretiva - Cozinha Central",
    technician: "Lucas Ferreira",
    date: "2026-10-16 16:45",
    status: "nao_atendimento",
    reason: "Acesso não liberado pela administração devido a evento gastronômico privativo.",
    pests: [],
    devices_checked: 0,
    products_used: [],
    non_compliances: [],
    client_signature: null,
    tech_signature: "Lucas Ferreira",
    eval_score: null
  }
];

const DEFAULT_DEVICES = [
  { id: "DEV-01", type: "Armadilha Luminosa (ILT-30)", sector: "Cozinha Industrial", client: "Nestlé Araras", status: "limpo", lastCheck: "17/10/2026" },
  { id: "DEV-02", type: "Porta-Isca Roedores (CPI-04)", sector: "Doca Externa 03", client: "Nestlé Araras", status: "captura", count: 1, lastCheck: "17/10/2026" },
  { id: "DEV-03", type: "Placa Adesiva de Cola", sector: "Almoxarifado de Secos", client: "Nestlé Araras", status: "limpo", lastCheck: "17/10/2026" },
  { id: "DEV-04", type: "Porta-Isca Roedores (CPI-08)", sector: "Central de Resíduos", client: "Ambev Jundiaí", status: "obstruido", note: "Caixas de papelão sobre o ponto", lastCheck: "16/10/2026" },
  { id: "DEV-05", type: "Armadilha Luminosa (ILT-60)", sector: "Restaurante / Buffet", client: "Bourbon Ibirapuera", status: "limpo", lastCheck: "15/10/2026" },
  { id: "DEV-06", type: "Porta-Isca Perimetral", sector: "Muro Oeste - Estacionamento", client: "Hospital São Luiz", status: "limpo", lastCheck: "14/10/2026" },
  { id: "DEV-07", type: "Armadilha Luminosa (ILT-30)", sector: "Lactário e Farmácia", client: "Hospital São Luiz", status: "limpo", lastCheck: "14/10/2026" },
  { id: "DEV-08", type: "Tubo de Monitoramento Formigas", sector: "Jardim Interno", client: "Bourbon Ibirapuera", status: "captura", count: 15, lastCheck: "15/10/2026" }
];

// App Controller Class
class Pest21App {
  constructor() {
    this.currentView = 'dashboard';
    this.currentUser = JSON.parse(localStorage.getItem('pest21_user')) || {
      name: "Juninho Marinho",
      email: "juninhomarinho24@gmail.com",
      role: "Especialista em Eliminação de Pragas",
      token: "mock-jwt-token-ecolab-pest21"
    };

    this.clients = JSON.parse(localStorage.getItem('pest21_clients')) || DEFAULT_CLIENTS;
    this.orders = JSON.parse(localStorage.getItem('pest21_orders')) || DEFAULT_ORDERS;
    this.devices = JSON.parse(localStorage.getItem('pest21_devices')) || DEFAULT_DEVICES;

    this.chartWeekly = null;
    this.chartPests = null;

    this.init();
  }

  init() {
    this.bindEvents();
    this.renderUser();
    this.renderDashboard();
    this.renderOrdersTable();
    this.renderCalendar();
    this.renderClientsTable();
    this.renderDevices();
    this.initCharts();
    this.updateBadges();

    // Check auth
    if (!this.currentUser) {
      document.getElementById('login-modal').classList.remove('hidden');
    }
  }

  bindEvents() {
    // Navigation
    document.querySelectorAll('.sidebar-nav .nav-item').forEach(item => {
      item.addEventListener('click', (e) => {
        const target = item.dataset.target;
        this.navigate(target);
      });
    });

    // Theme Switcher
    const themeBtn = document.getElementById('btn-toggle-theme');
    if (themeBtn) {
      themeBtn.addEventListener('click', () => this.toggleTheme());
    }

    // New OS Header button
    const newOsBtn = document.getElementById('btn-header-new-os');
    if (newOsBtn) {
      newOsBtn.addEventListener('click', () => this.openNewOSModal());
    }

    // OS Filter events
    const filterStatus = document.getElementById('filter-os-status');
    if (filterStatus) {
      filterStatus.addEventListener('change', () => this.filterOrders());
    }
    const filterDate = document.getElementById('filter-os-date');
    if (filterDate) {
      filterDate.addEventListener('change', () => this.filterOrders());
    }

    // Global Search
    const searchInput = document.getElementById('global-search');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => this.handleGlobalSearch(e.target.value));
    }

    // New OS Form submit
    const osForm = document.getElementById('form-new-os');
    if (osForm) {
      osForm.addEventListener('submit', (e) => {
        e.preventDefault();
        this.handleCreateOS();
      });
    }

    // Settings actions
    const resetBtn = document.getElementById('btn-reset-mock');
    if (resetBtn) {
      resetBtn.addEventListener('click', () => this.resetMockData());
    }
    const saveSettingsBtn = document.getElementById('btn-save-settings');
    if (saveSettingsBtn) {
      saveSettingsBtn.addEventListener('click', () => {
        this.showToast('Configurações da API salvas com sucesso!');
      });
    }

    // Quick fill login
    const quickFillBtn = document.getElementById('btn-quick-fill');
    if (quickFillBtn) {
      quickFillBtn.addEventListener('click', () => {
        document.getElementById('login-email').value = "juninhomarinho24@gmail.com";
        document.getElementById('login-password').value = "045454";
      });
    }

    // Login submit
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
      loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        this.handleLogin();
      });
    }

    // Logout
    const logoutBtn = document.getElementById('btn-logout');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', () => this.handleLogout());
    }
  }

  navigate(viewName) {
    this.currentView = viewName;

    // Update active nav item
    document.querySelectorAll('.sidebar-nav .nav-item').forEach(item => {
      item.classList.toggle('active', item.dataset.target === viewName);
    });

    // Update active section
    document.querySelectorAll('.view-section').forEach(sec => {
      sec.classList.remove('active');
    });

    const targetSec = document.getElementById(`view-${viewName}`);
    if (targetSec) {
      targetSec.classList.add('active');
    }

    // Update Header
    const titles = {
      dashboard: { title: "Dashboard Operacional", desc: "Monitoramento em tempo real de atendimentos e pragas" },
      orders: { title: "Ordens de Serviço (OS)", desc: "Gestão, execução e auditoria de chamados de campo" },
      calendar: { title: "Agenda de Visitas", desc: "Rotas diárias e agendamentos periódicos dos especialistas" },
      clients: { title: "Clientes & Contratos", desc: "Plantas industriais e unidades atendidas pela Ecolab" },
      devices: { title: "Dispositivos & MIP", desc: "Inventário de armadilhas, iscas e pontos de monitoramento" },
      audits: { title: "Auditorias & Relatórios", desc: "Laudos técnicos, certificados sanitários e conformidade" },
      settings: { title: "API & Sincronização", desc: "Configurações de ambiente, endpoints e banco de dados" }
    };

    if (titles[viewName]) {
      document.getElementById('current-view-title').textContent = titles[viewName].title;
      document.getElementById('current-view-desc').textContent = titles[viewName].desc;
    }

    // Trigger charts resize if entering dashboard
    if (viewName === 'dashboard' && this.chartWeekly && this.chartPests) {
      setTimeout(() => {
        this.chartWeekly.resize();
        this.chartPests.resize();
      }, 50);
    }
  }

  toggleTheme() {
    const html = document.documentElement;
    const currentTheme = html.getAttribute('data-theme') || 'dark';
    const nextTheme = currentTheme === 'dark' ? 'light' : 'dark';
    html.setAttribute('data-theme', nextTheme);
    localStorage.setItem('pest21_theme', nextTheme);
    this.showToast(`Tema alterado para modo ${nextTheme === 'dark' ? 'escuro' : 'claro'}.`);
  }

  renderUser() {
    const nameEl = document.getElementById('user-display-name');
    const avatarEl = document.getElementById('avatar-initials');
    if (this.currentUser) {
      nameEl.textContent = this.currentUser.name;
      const initials = this.currentUser.name.split(' ').map(n => n[0]).slice(0, 2).join('');
      avatarEl.textContent = initials.toUpperCase();
    }
  }

  renderDashboard() {
    // KPI Counts
    const todayOrders = this.orders.filter(o => o.date.startsWith('2026-10-17'));
    document.getElementById('kpi-os-today').textContent = this.orders.length;
    
    let totalDevicesChecked = 0;
    this.orders.forEach(o => totalDevicesChecked += (o.devices_checked || 0));
    document.getElementById('kpi-devices-checked').textContent = totalDevicesChecked;

    // Recent OS list in Dashboard
    const tbody = document.getElementById('dashboard-os-tbody');
    if (!tbody) return;

    tbody.innerHTML = this.orders.slice(0, 4).map(o => `
      <tr>
        <td><strong>${o.id}</strong></td>
        <td>
          <div style="font-weight: 600; color: var(--text-primary);">${o.client_name}</div>
          <small style="color: var(--text-muted);">${o.service_type}</small>
        </td>
        <td>Setor Operacional</td>
        <td>${o.technician || 'A designar'}</td>
        <td>${o.date}</td>
        <td><span class="badge-status ${o.status}">${this.formatStatus(o.status)}</span></td>
        <td>
          <button class="btn-secondary" style="padding: 4px 10px; font-size: 0.8rem;" onclick="app.viewOrderDetails('${o.id}')">
            Ver Detalhes
          </button>
        </td>
      </tr>
    `).join('');
  }

  renderOrdersTable(filteredOrders = null) {
    const list = filteredOrders || this.orders;
    const tbody = document.getElementById('orders-full-tbody');
    if (!tbody) return;

    tbody.innerHTML = list.map(o => {
      const pestCount = o.pests ? o.pests.reduce((acc, p) => acc + p.count, 0) : 0;
      const pestBadge = pestCount > 0 
        ? `<span class="badge-status nao_atendimento">⚠️ ${pestCount} pragas</span>` 
        : `<span class="badge-status concluida">Zero capturas</span>`;

      return `
        <tr>
          <td><strong>${o.id}</strong></td>
          <td>
            <div style="font-weight: 600; color: var(--text-primary);">${o.client_name}</div>
            <small style="color: var(--text-muted);">${o.devices_checked || 0} dispositivos inspecionados</small>
          </td>
          <td>${o.service_type}</td>
          <td>${o.technician || '—'}</td>
          <td>${o.date}</td>
          <td>${pestBadge}</td>
          <td><span class="badge-status ${o.status}">${this.formatStatus(o.status)}</span></td>
          <td style="display: flex; gap: 6px;">
            <button class="btn-secondary" style="padding: 4px 10px; font-size: 0.8rem;" onclick="app.viewOrderDetails('${o.id}')">
              Visualizar
            </button>
          </td>
        </tr>
      `;
    }).join('');
  }

  renderCalendar() {
    const container = document.getElementById('calendar-days-container');
    if (!container) return;

    const days = [
      { day: "Segunda (12/10)", orders: ["OS-2026-1038 (Nestlé)", "OS-2026-1039 (Ambev)"] },
      { day: "Terça (13/10)", orders: ["OS-2026-1040 (Hospital São Luiz)"] },
      { day: "Quarta (14/10)", orders: ["OS-2026-1041 (Bourbon Hotel)"] },
      { day: "Quinta (15/10)", orders: ["OS-2026-1042 (Nestlé Araras)"] },
      { day: "Sexta (16/10)", orders: ["OS-2026-1045 (Bourbon Ibirapuera)"] },
      { day: "Hoje (17/10)", orders: ["OS-2026-1043 (Hospital Morumbi)", "OS-2026-1044 (Ambev Jundiaí)"], isToday: true },
      { day: "Sábado (18/10)", orders: ["Plantão de Emergência 24h"] }
    ];

    container.innerHTML = days.map(d => `
      <div class="panel-card" style="border-top: 3px solid ${d.isToday ? 'var(--primary)' : 'var(--border-subtle)'}; background: var(--bg-input);">
        <div style="font-weight: 700; font-size: 0.95rem; margin-bottom: 12px; color: ${d.isToday ? 'var(--primary)' : 'var(--text-primary)'};">
          ${d.day} ${d.isToday ? '★' : ''}
        </div>
        <div style="display: flex; flex-direction: column; gap: 8px;">
          ${d.orders.map(item => `
            <div style="padding: 8px; border-radius: var(--radius-sm); background: var(--bg-card); font-size: 0.82rem; border-left: 3px solid var(--secondary);">
              ${item}
            </div>
          `).join('')}
        </div>
      </div>
    `).join('');
  }

  renderClientsTable() {
    const tbody = document.getElementById('clients-tbody');
    if (!tbody) return;

    tbody.innerHTML = this.clients.map(c => `
      <tr>
        <td><strong>${c.code}</strong></td>
        <td>
          <div style="font-weight: 600; color: var(--text-primary);">${c.name}</div>
          <small style="color: var(--text-muted);">${c.tradeName}</small>
        </td>
        <td>${c.cnpj}</td>
        <td>${c.city}/${c.state}</td>
        <td>${c.contact}</td>
        <td><span class="badge-status concluida">${c.devicesCount} pontos</span></td>
        <td>
          <div style="display: flex; gap: 4px; flex-wrap: wrap;">
            ${c.audits.map(a => `<span style="font-size: 0.7rem; background: var(--primary-subtle); color: var(--primary); padding: 2px 6px; border-radius: 4px;">${a}</span>`).join('')}
          </div>
        </td>
      </tr>
    `).join('');

    // Populate New OS select
    const select = document.getElementById('new-os-client');
    if (select) {
      select.innerHTML = this.clients.map(c => `<option value="${c.id}">${c.name}</option>`).join('');
    }
  }

  renderDevices() {
    const container = document.getElementById('devices-container');
    if (!container) return;

    container.innerHTML = this.devices.map(d => {
      return `
        <div class="device-card">
          <div class="device-header">
            <span class="device-type">${d.type}</span>
            <span class="device-status-pill ${d.status}">${d.status.toUpperCase()}</span>
          </div>
          <div class="device-meta">
            <div><strong>Ponto:</strong> ${d.id} • ${d.sector}</div>
            <div><strong>Cliente:</strong> ${d.client}</div>
            <div><strong>Última Inspeção:</strong> ${d.lastCheck}</div>
            ${d.count ? `<div style="color: var(--danger); font-weight: 600; margin-top: 4px;">Capturas: ${d.count}</div>` : ''}
            ${d.note ? `<div style="color: var(--warning); font-size: 0.78rem; margin-top: 4px;">Obs: ${d.note}</div>` : ''}
          </div>
          <button class="btn-secondary" style="font-size: 0.78rem; padding: 6px; justify-content: center;" onclick="app.showToast('Ponto ${d.id} marcado para reinspeção!')">
            Registrar Leitura QR
          </button>
        </div>
      `;
    }).join('');
  }

  initCharts() {
    const weeklyCtx = document.getElementById('chart-weekly-os');
    const pestsCtx = document.getElementById('chart-pests-dist');

    if (weeklyCtx) {
      this.chartWeekly = new Chart(weeklyCtx, {
        type: 'line',
        data: {
          labels: ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Hoje'],
          datasets: [
            {
              label: 'OS Concluídas',
              data: [12, 19, 15, 17, 14, 6, 8],
              borderColor: '#008dcf',
              backgroundColor: 'rgba(0, 141, 207, 0.12)',
              fill: true,
              tension: 0.4,
              borderWidth: 3
            },
            {
              label: 'Não Conformidades',
              data: [2, 1, 3, 2, 0, 1, 1],
              borderColor: '#f59e0b',
              borderDash: [5, 5],
              tension: 0.3,
              borderWidth: 2
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { labels: { color: '#94a3b8' } }
          },
          scales: {
            x: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#94a3b8' } },
            y: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#94a3b8' } }
          }
        }
      });
    }

    if (pestsCtx) {
      this.chartPests = new Chart(pestsCtx, {
        type: 'doughnut',
        data: {
          labels: ['Moscas Domésticas', 'Baratas Germânicas', 'Roedores (Ratos)', 'Formigas Doceiras', 'Outros'],
          datasets: [{
            data: [45, 25, 12, 10, 8],
            backgroundColor: ['#008dcf', '#f59e0b', '#ef4444', '#10b981', '#8b5cf6'],
            borderWidth: 0
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { position: 'bottom', labels: { color: '#94a3b8', boxWidth: 12 } }
          }
        }
      });
    }
  }

  filterOrders() {
    const statusVal = document.getElementById('filter-os-status').value;
    const dateVal = document.getElementById('filter-os-date').value;

    let filtered = this.orders;
    if (statusVal !== 'ALL') {
      filtered = filtered.filter(o => o.status === statusVal);
    }
    if (dateVal) {
      filtered = filtered.filter(o => o.date.startsWith(dateVal));
    }
    this.renderOrdersTable(filtered);
  }

  handleGlobalSearch(query) {
    const q = query.toLowerCase().trim();
    if (!q) {
      this.renderOrdersTable();
      return;
    }
    const filtered = this.orders.filter(o => 
      o.id.toLowerCase().includes(q) ||
      o.client_name.toLowerCase().includes(q) ||
      (o.technician && o.technician.toLowerCase().includes(q))
    );
    this.renderOrdersTable(filtered);
  }

  viewOrderDetails(orderId) {
    const order = this.orders.find(o => o.id === orderId);
    if (!order) return;

    document.getElementById('modal-os-title').textContent = `Ordem de Serviço #${order.id}`;
    document.getElementById('modal-os-client').textContent = `${order.client_name} • ${order.service_type}`;

    const content = document.getElementById('modal-os-content');
    content.innerHTML = `
      <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 20px; margin-bottom: 24px;">
        <div class="panel-card" style="background: var(--bg-input);">
          <h4 style="margin-bottom: 12px; color: var(--primary);">📋 Informações do Atendimento</h4>
          <p><strong>Cliente:</strong> ${order.client_name}</p>
          <p><strong>Técnico Responsável:</strong> ${order.technician || 'Não informado'}</p>
          <p><strong>Data/Hora de Execução:</strong> ${order.date}</p>
          <p><strong>Status Operacional:</strong> <span class="badge-status ${order.status}">${this.formatStatus(order.status)}</span></p>
          ${order.reason ? `<p style="color: var(--danger); margin-top: 8px;"><strong>Justificativa de Não Atendimento:</strong> ${order.reason}</p>` : ''}
        </div>

        <div class="panel-card" style="background: var(--bg-input); text-align: center;">
          <h4 style="margin-bottom: 8px; color: var(--primary);">Avaliação do Cliente</h4>
          <div style="font-size: 2.2rem; color: #fecb09; margin: 10px 0;">
            ${order.eval_score ? '★'.repeat(order.eval_score) + '☆'.repeat(5 - order.eval_score) : '—'}
          </div>
          <small style="color: var(--text-muted);">${order.eval_score ? `Nota ${order.eval_score} de 5 estrelas` : 'Pendente de avaliação'}</small>
        </div>
      </div>

      <!-- Pragas & Dispositivos -->
      <div class="panel-card" style="background: var(--bg-input); margin-bottom: 20px;">
        <h4 style="margin-bottom: 12px; color: var(--primary);">🪤 Pragas Encontradas & Contagem (MIP)</h4>
        ${order.pests && order.pests.length > 0 ? `
          <table class="data-table">
            <thead>
              <tr><th>Espécie Identificada</th><th>Quantidade</th><th>Setor de Captura</th></tr>
            </thead>
            <tbody>
              ${order.pests.map(p => `<tr><td><strong>${p.name}</strong></td><td>${p.count}</td><td>${p.sector}</td></tr>`).join('')}
            </tbody>
          </table>
        ` : '<p style="color: var(--text-muted);">Nenhuma praga capturada durante esta inspeção.</p>'}
      </div>

      <!-- Produtos Químicos Aplicados -->
      <div class="panel-card" style="background: var(--bg-input); margin-bottom: 20px;">
        <h4 style="margin-bottom: 12px; color: var(--primary);">🧪 Produtos Químicos Utilizados (Reg. MS / ANVISA)</h4>
        ${order.products_used && order.products_used.length > 0 ? `
          <table class="data-table">
            <thead>
              <tr><th>Produto Comercial</th><th>Princípio Ativo</th><th>Dosagem Aplicada</th><th>Lote</th></tr>
            </thead>
            <tbody>
              ${order.products_used.map(pr => `<tr><td><strong>${pr.name}</strong></td><td>${pr.active}</td><td>${pr.dosage}</td><td>${pr.batch}</td></tr>`).join('')}
            </tbody>
          </table>
        ` : '<p style="color: var(--text-muted);">Nenhum defensivo químico aplicado nesta visita (apenas monitoramento mecânico).</p>'}
      </div>

      <!-- Assinatura Digital -->
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
        <div style="border: 1px dashed var(--border-subtle); padding: 18px; border-radius: var(--radius-md); text-align: center;">
          <small style="color: var(--text-muted); display: block; margin-bottom: 8px;">Assinatura do Técnico</small>
          <div style="font-family: 'Outfit'; font-style: italic; font-size: 1.2rem; color: var(--primary); padding: 10px 0;">
            ${order.tech_signature || 'Pendente de assinatura'}
          </div>
          <span style="font-size: 0.75rem; color: var(--text-muted);">Assinado digitalmente via Pest21 Mobile</span>
        </div>

        <div style="border: 1px dashed var(--border-subtle); padding: 18px; border-radius: var(--radius-md); text-align: center;">
          <small style="color: var(--text-muted); display: block; margin-bottom: 8px;">Assinatura do Responsável na Planta</small>
          <div style="font-family: 'Outfit'; font-style: italic; font-size: 1.2rem; color: var(--success); padding: 10px 0;">
            ${order.client_signature || 'Pendente de assinatura'}
          </div>
          <span style="font-size: 0.75rem; color: var(--text-muted);">Validado por Roberto Albuquerque (Qualidade)</span>
        </div>
      </div>
    `;

    this.openModal('modal-os-details');
  }

  handleCreateOS() {
    const clientId = parseInt(document.getElementById('new-os-client').value);
    const client = this.clients.find(c => c.id === clientId);
    const type = document.getElementById('new-os-type').value;
    const tech = document.getElementById('new-os-technician').value;
    const datetime = document.getElementById('new-os-datetime').value.replace('T', ' ');
    const notes = document.getElementById('new-os-notes').value;

    const newOS = {
      id: `OS-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      client_id: clientId,
      client_name: client ? client.name : "Cliente",
      service_type: type,
      technician: tech,
      date: datetime || "2026-10-17 15:00",
      status: "em_andamento",
      pests: [],
      devices_checked: 0,
      products_used: [],
      non_compliances: [],
      client_signature: null,
      tech_signature: tech,
      notes: notes
    };

    this.orders.unshift(newOS);
    this.saveState();

    this.closeModal('modal-new-os');
    this.renderDashboard();
    this.renderOrdersTable();
    this.updateBadges();
    this.showToast(`Ordem de Serviço ${newOS.id} aberta com sucesso!`);
  }

  handleLogin() {
    const email = document.getElementById('login-email').value;
    this.currentUser = {
      name: email.split('@')[0],
      email: email,
      role: "Especialista em Eliminação de Pragas",
      token: "jwt-token-" + Date.now()
    };
    localStorage.setItem('pest21_user', JSON.stringify(this.currentUser));
    document.getElementById('login-modal').classList.add('hidden');
    this.renderUser();
    this.showToast(`Bem-vindo ao Pest XXI, ${this.currentUser.name}!`);
  }

  handleLogout() {
    localStorage.removeItem('pest21_user');
    this.currentUser = null;
    document.getElementById('login-modal').classList.remove('hidden');
  }

  resetMockData() {
    localStorage.removeItem('pest21_orders');
    localStorage.removeItem('pest21_clients');
    localStorage.removeItem('pest21_devices');
    this.orders = DEFAULT_ORDERS;
    this.clients = DEFAULT_CLIENTS;
    this.devices = DEFAULT_DEVICES;
    this.renderDashboard();
    this.renderOrdersTable();
    this.renderClientsTable();
    this.renderDevices();
    this.updateBadges();
    this.showToast('Banco de dados de demonstração restaurado.');
  }

  generateSampleReport(title) {
    this.showToast(`Gerando relatório técnico: ${title}...`);
    setTimeout(() => {
      window.print();
    }, 600);
  }

  saveState() {
    localStorage.setItem('pest21_orders', JSON.stringify(this.orders));
    localStorage.setItem('pest21_clients', JSON.stringify(this.clients));
    localStorage.setItem('pest21_devices', JSON.stringify(this.devices));
  }

  updateBadges() {
    const badge = document.getElementById('badge-os-count');
    if (badge) badge.textContent = this.orders.length;
  }

  openModal(id) {
    const modal = document.getElementById(id);
    if (modal) modal.classList.add('active');
  }

  closeModal(id) {
    const modal = document.getElementById(id);
    if (modal) modal.classList.remove('active');
  }

  openNewOSModal() {
    // default datetime to now
    const now = new Date();
    const formatted = now.toISOString().slice(0, 16);
    const dtField = document.getElementById('new-os-datetime');
    if (dtField) dtField.value = formatted;
    this.openModal('modal-new-os');
  }

  openNewScheduleModal() {
    this.showToast('Abrindo assistente de novo agendamento...');
    this.openNewOSModal();
  }

  openNewClientModal() {
    this.showToast('Funcionalidade de cadastro rápido disponível no modo completo.');
  }

  formatStatus(status) {
    switch (status) {
      case 'concluida': return 'Concluída';
      case 'em_andamento': return 'Em Andamento';
      case 'pendente': return 'Pendente';
      case 'nao_atendimento': return 'Não Atendimento';
      default: return status;
    }
  }

  showToast(message) {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = `<span>ℹ️</span><span>${message}</span>`;
    container.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(10px)';
      setTimeout(() => toast.remove(), 300);
    }, 3500);
  }
}

// Global App Instance
let app;
document.addEventListener('DOMContentLoaded', () => {
  app = new Pest21App();
});
