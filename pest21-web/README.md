# Ecolab Pest XXI - Painel Administrativo & Operacional Web

Interface web moderna, responsiva e completa construída para a gestão do sistema **Ecolab Pest XXI (Pest21)**. Desenvolvida para operar tanto de forma 100% autônoma (Modo Mock / Offline com persistência em `localStorage`) quanto conectada a uma API REST local (`http://localhost:8000/api/`).

---

## 🌟 Funcionalidades Implementadas

### 1. 📊 Dashboard Operacional & Métricas em Tempo Real
- **Cards de KPIs:** Ordens de Serviço hoje, Dispositivos inspecionados, Taxa de infestação (%) e Conformidade em auditorias (padrão AIB / BRCGS).
- **Gráficos Interativos (Chart.js):**
  - Evolução semanal de atendimentos e não conformidades.
  - Distribuição percentual de capturas de pragas por espécie (Moscas, Baratas, Roedores, Formigas).
- **Tabela de Destaques:** Visualização imediata dos últimos atendimentos realizados.

### 2. 📋 Gestão de Ordens de Serviço (OS)
- Tabela com paginação e busca dinâmica em tempo real (por cliente, número da OS ou técnico).
- Filtros por status: `Concluída`, `Em Andamento`, `Pendente`, `Não Atendimento`.
- Botão **"+ Nova Ordem de Serviço"** com modal de abertura rápida.
- **Modal de Detalhes Completos da OS:**
  - Informações cadastrais e dados do contrato.
  - Registro de contagem de pragas por espécie e setor de captura.
  - Produtos químicos aplicados com dosagem, lote e registro sanitário.
  - Apontamento de Não Conformidades (estruturais, higiênicas e operacionais).
  - Assinatura digital do técnico e do responsável na planta do cliente.
  - Função **"Imprimir Relatório"** com layout CSS otimizado para impressão/PDF.

### 3. 📅 Agenda & Calendário de Visitas Técnicas
- Visualização das rotas e agendamentos semanais dos especialistas.
- Planejamento de novas visitas com cálculo de data e horário.

### 4. 🏢 Clientes & Unidades Industriais
- Cadastro e visualização de clientes corporativos (Nestlé, Ambev, Hospital São Luiz, Rede Bourbon).
- Dados de CNPJ, cidade/UF, responsáveis e certificações ativas.

### 5. 🪤 Inventário de Dispositivos e Pontos de Controle (MIP)
- Grid de dispositivos instalados (Armadilhas luminosas ILT, porta-iscas de roedores CPI, placas adesivas).
- Badges de status: `Limpo`, `Com Captura`, `Obstruído`.

### 6. ⚙️ Alternância de API & Sincronização
- Seletor de modo no menu de configurações:
  - **Modo Mock Local:** Utiliza banco de dados simulado persistido no `localStorage`.
  - **API REST Personalizada:** Direciona requisições para `http://localhost:8000/api/` (ou endpoint customizado).
- Chave de telemetria App Center oficial incorporada: `16945dcf-3e44-4525-900f-e4a95757de37`.
- Botão para restauração instantânea do banco de dados de demonstração.

### 7. 🔐 Autenticação & Tela de Login
- Tela de login com design corporativo da Ecolab e logo oficial.
- Botão **"Preencher Usuário de Teste (1-Clique)"** (`juninhomarinho24@gmail.com`).
- Persistência de sessão do usuário no navegador.

---

## 🚀 Como Executar

O servidor já está ativo no ambiente local!

Para abrir a aplicação no seu navegador:
👉 Acesse: **[http://localhost:4000/](http://localhost:4000/)**

Caso precise reiniciar o servidor manualmente:
```bash
node pest21-web/server.js
```
*(ou se preferir com Bun: `bun pest21-web/server.js`)*

---

## 🎨 Design & Tecnologias
- **Frontend:** HTML5 Semântico, Vanilla JavaScript (ES6+ modular), Chart.js 4.4.
- **Estilização:** Vanilla CSS3 puro com variáveis de tema, suporte a **Modo Escuro / Claro**, glassmorphism e micro-animações.
- **Assets:** Imagens, logos oficiais em SVG e ícones originais extraídos do aplicativo Pest21.
