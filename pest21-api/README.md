# Ecolab Pest XXI - Backend REST API

Servidor de API REST completo, de alta performance e **sem dependências externas**, desenvolvido em **Node.js nativo (v22+) com SQLite embutido (`node:sqlite`)**.

Esta API implementa **todas as 17 rotas oficiais** consumidas pelo aplicativo mobile [Pest21 Mobile (Cordova/Ionic)](file:///home/jair/PROJETOS/Pest21/pest21-source) e pelo painel web [Pest21 Web](file:///home/jair/PROJETOS/Pest21/pest21-web).

---

## 🚀 Como Iniciar o Servidor

```bash
cd pest21-api
node server.js
```
*(ou se preferir com Bun: `bun server.js`)*

O servidor iniciará automaticamente em **`http://localhost:8000/api/`** e criará o arquivo de banco de dados SQLite `pest21.db` já com os dados iniciais semeados (usuários, clientes, armadilhas, pragas e produtos químicos).

---

## 📋 Catálogo Completo de Rotas Implementadas

### 1. Autenticação & Sessão
- **`POST /api/login`**
  - **Body:** `{ "email": "juninhomarinho24@gmail.com", "password": "045454" }`
  - **Retorno:** Token JWT assinado (`access_token`) e objeto do usuário.
- **`POST /api/forgot-password`**
  - Solicitação de redefinição de senha por email.
- **`POST /api/update-user`**
  - Atualização dos dados cadastrais do especialista.

### 2. Carga Inicial & Sincronização Offline
- **`GET /api/server-time`**
  - Retorna o timestamp UTC/ISO do servidor para calibração de horário.
- **`GET /api/data`**
  - **A rota mais importante do sistema.** Fornece todo o catálogo de clientes, dispositivos instalados, frequências, tipos de auditorias (AIB/BRCGS/ISO), pragas (com nomes científicos) e defensivos químicos registrados pela ANVISA para operação 100% offline.

### 3. Ordens de Serviço (OS) & Campo
- **`GET /api/service-orders`**
  - Retorna todas as ordens de serviço ativas atribuídas ao técnico.
- **`POST /api/service-order`**
  - Submissão de ordem de serviço concluída (com contagem de pragas em armadilhas, defensivos químicos aplicados, fotos, não conformidades e assinatura digital do cliente).
- **`POST /api/ossupport`**
  - Abertura de chamado de suporte técnico em campo.
- **`POST /api/new-non-attendance`**
  - Registro de justificativa quando o cliente não pode ser atendido.

### 4. Agendamentos & Rotas
- **`GET /api/new-schedule`**
  - Dados auxiliares para criação de nova visita.
- **`POST /api/new-scheduling`**
  - Agendamento de nova visita técnica.
- **`POST /api/schedule-update`**
  - Alteração de data ou horário de visita agendada.
- **`POST /api/schedule-delete`**
  - Cancelamento de agendamento (`{ "ids": [...] }`).
- **`POST /api/update-interval`**
  - Registro do tempo de deslocamento ou pausas operacionais.

### 5. Gestão de Clientes & Armadilhas
- **`POST /api/client-details`**
  - Atualização de observações e particularidades de acesso.
- **`POST /api/client-contact`** / **`POST /api/delete-client-contact`**
  - Gestão dos responsáveis pela planta no cliente.
- **`POST /api/client-device`** / **`POST /api/delete-client-device`**
  - Instalação, troca ou remoção de armadilhas luminosas ou porta-iscas.

---

## 🗄️ Modelo de Dados (SQLite)

O arquivo de banco de dados `pest21.db` possui as tabelas:
- **`users`**: Especialistas técnicos e administradores (com senha em hash SHA-256).
- **`clients`**: Razão Social, CNPJ, endereço, tempo médio de deslocamento, particularidades e normas de auditoria.
- **`contacts`**: Lista de contatos de cada unidade fabril/comercial.
- **`devices`**: Inventário de pontos de monitoramento por cliente (tipo, quantidade, frequência e setor).
- **`service_orders`**: Histórico completo de vistorias, capturas de pragas, defensivos químicos e laudos.
- **`schedules`**: Agenda de visitas periódicas.

---

## 🔗 Como Conectar os Clientes à API

### No Aplicativo Mobile (Ionic/Cordova):
No arquivo [api.ts](file:///home/jair/PROJETOS/Pest21/pest21-source/src/providers/api/api.ts#L28-L29), a URL já está configurada como:
```typescript
API_URL: string = 'http://localhost:8000/api/';
```
*(Para testar no celular via Wi-Fi, basta substituir `localhost` pelo IP da sua máquina na rede local, por exemplo: `http://192.168.1.100:8000/api/`).*

### No Painel Web:
No arquivo [app.js](file:///home/jair/PROJETOS/Pest21/pest21-web/app.js) ou na aba **"Configurações"**, alterne o modo para **"API REST Personalizada"** e aponte para `http://localhost:8000/api/`.
