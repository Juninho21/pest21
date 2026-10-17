# Histórico de Execução e Instruções Técnicas - Pest21

Este documento registra detalhadamente todas as etapas, engenharia reversa, desenvolvimentos e comandos executados no projeto **Pest21** (`br.com.advancing.ecolab`).

---

## 📑 Índice
1. [Visão Geral do Projeto](#1-visão-geral-do-projeto)
2. [Etapa 1: Engenharia Reversa do APK (Pest21.apks)](#2-etapa-1-engenharia-reversa-do-apk-pest21apks)
3. [Etapa 2: Reconstrução do Código-Fonte Mobile (`pest21-source`)](#3-etapa-2-reconstrução-do-código-fonte-mobile-pest21-source)
4. [Etapa 3: Desenvolvimento do Painel Web Administrativo (`pest21-web`)](#4-etapa-3-desenvolvimento-do-painel-web-administrativo-pest21-web)
5. [Etapa 4: Criação da API REST Backend Real (`pest21-api`)](#5-etapa-4-criação-da-api-rest-backend-real-pest21-api)
6. [Etapa 5: Geração do APK Universal Instalável (`Pest21.apk`)](#6-etapa-5-geração-do-apk-universal-instalável-pest21apk)
7. [Guia de Comandos e Execução Rápida](#7-guia-de-comandos-e-execução-rápida)

---

## 1. Visão Geral do Projeto

- **Nome da Aplicação:** Ecolab Pest XXI
- **Identificador (Package ID):** `br.com.advancing.ecolab`
- **Versão:** `1.7.4` (Target SDK 35, Min SDK 22)
- **Desenvolvedor Original:** Advancing Sistemas / Jackson Wolff Team
- **Finalidade:** Gestão operacional de ordens de serviço (OS) e Manejo Integrado de Pragas (MIP) para especialistas de campo da **ECOLAB**, com sincronização em lote e funcionamento offline.

---

## 2. Etapa 1: Engenharia Reversa do APK (`Pest21.apks`)

### Ações Executadas:
1. **Inspeção de Formato:**
   O arquivo `Pest21.apks` foi identificado como um arquivo ZIP contendo o APK base e splits da Google Play:
   - `base.apk` (15.3 MB - código executável DEX, assets web e recursos base).
   - `split_config.pt.apk` (24 KB - strings e traduções em português).
   - `split_config.es.apk` (24 KB - strings e traduções em espanhol).
   - `split_config.xxhdpi.apk` (75 KB - ícones e imagens em alta resolução).

2. **Análise de Estrutura com a Ferramenta REA (`morluto/rea`):**
   - Utilização do comando `npx -y rea-agents@latest analyze-javascript-application` para analisar a árvore de módulos e dependências do JavaScript empacotado.
   - Descoberta da arquitetura: aplicação híbrida Apache Cordova utilizando Ionic 3.9.2 e Angular 5.2.11.

3. **Recuperação dos Source Maps:**
   - Localizados dentro de `unpacked_base/assets/www/build/` os arquivos `main.js.map` e `vendor.js.map`.
   - O `main.js.map` continha o array `sourcesContent` com **100% do código-fonte original em TypeScript**.

---

## 3. Etapa 2: Reconstrução do Código-Fonte Mobile (`pest21-source`)

O script automatizado [reconstruct.py](file:///home/jair/PROJETOS/Pest21/reconstruct.py) realizou a recuperação completa dos seguintes itens:

1. **51 Módulos TypeScript:**
   - Extração de `main.ts`, `app.module.ts`, `app.component.ts`.
   - Todos os provedores (`api.ts`, `offline-manager.ts`, `network-service.ts`, `notification.ts`, `date-time-helper.ts`).
   - Todas as 33 páginas de telas operacionais (`home`, `login`, `calendar`, `clients`, `service-order`, `service-order-mip`, `service-order-pest-counting`, etc.).
   - Componentes e Pipes personalizados.

2. **35 Templates HTML:**
   - Decodificação dos templates embutidos no JavaScript com marcadores `/*ion-inline-start*/` e `/*ion-inline-end*/`, restaurando a formatação original e diretivas Angular.

3. **Estilos SASS / SCSS:**
   - Separação dos estilos individuais de cada tela em arquivos `page-*.scss`.
   - Reconstrução do tema oficial da Ecolab em `theme/variables.scss`.

4. **Decodificação do `config.xml`:**
   - Criação de um parser AXML em Python para decodificar o arquivo binário `res/xml/config.xml`, resgatando todas as permissões Android, plugins Cordova, preferências de tela e chaves de telemetria.

5. **Assets & Multimídia:**
   - Cópia dos dicionários de internacionalização (`pt-br.json`, `es.json`, `en.json`).
   - Fontes completas (`roboto`, `noto-sans`, `ionicons`).
   - Imagens e logos oficiais da Ecolab em SVG e PNG.

---

## 4. Etapa 3: Desenvolvimento do Painel Web Administrativo (`pest21-web`)

Para permitir a operação e visualização em navegadores desktop, criamos uma SPA completa:

- **Dashboard com Métricas (KPIs):** Resumo diário de ordens de serviço, dispositivos inspecionados, taxa de infestação e índice de conformidade em auditorias.
- **Gráficos com Chart.js:** Histórico semanal de atendimentos e incidência de pragas por espécie (baratas, moscas, roedores, formigas).
- **Gestão de Ordens de Serviço (OS):** Tabela pesquisável com filtros por status (`Concluída`, `Em Andamento`, `Pendente`, `Não Atendimento`) e modal com laudos químicos e assinatura digital.
- **Impressão de Relatórios:** Estilos CSS `@media print` para geração de laudos em PDF.
- **Autenticação:** Tela de login corporativa com botão de preenchimento em 1-clique (`juninhomarinho24@gmail.com` / `045454`).
- **Servidor HTTP:** Servidor Node.js embutido rodando na porta **4000** (`http://localhost:4000/`).

---

## 5. Etapa 4: Criação da API REST Backend Real (`pest21-api`)

Criamos um servidor de backend nativo em Node.js com banco de dados SQLite (`pest21.db`), implementando as 17 rotas oficiais consumidas pelo sistema:

| Método | Rota | Finalidade |
|---|---|---|
| `GET` | `/api/server-time` | Calibração de horário oficial do servidor |
| `POST` | `/api/login` | Autenticação por e-mail/senha com emissão de token JWT |
| `POST` | `/api/forgot-password` | Recuperação de senha |
| `POST` | `/api/update-user` | Atualização cadastral do perfil |
| `GET` | `/api/data` | **Carga offline principal:** Catálogo de clientes, dispositivos, pragas e produtos químicos |
| `GET` | `/api/service-orders` | Lista de ordens de serviço ativas |
| `POST` | `/api/service-order` | Conclusão e envio de OS com contagens e assinaturas |
| `POST` | `/api/ossupport` | Registro de suporte operacional |
| `GET` | `/api/new-schedule` | Dados auxiliares para criação de agendamento |
| `POST` | `/api/new-scheduling` | Criação de novo agendamento |
| `POST` | `/api/schedule-update` | Atualização de visita agendada |
| `POST` | `/api/schedule-delete` | Exclusão de agendamento |
| `POST` | `/api/update-interval` | Registro de tempo de deslocamento |
| `POST` | `/api/new-non-attendance` | Justificativa de não atendimento |
| `POST` | `/api/client-details` | Atualização de dados da planta do cliente |
| `POST` | `/api/client-contact` | Gerenciamento de contatos do cliente |
| `POST` | `/api/client-device` | Gerenciamento de armadilhas e porta-iscas |

- **Porta:** `http://localhost:8000/api/` *(porta padrão definida no código original)*.

---

## 6. Etapa 5: Geração do APK Universal Instalável (`Pest21.apk`)

Para permitir a instalação direta em qualquer smartphone Android sem depender de instaladores de Split APKs (SAI):

1. **Unificação dos Recursos:** Integração das pastas `drawable-xxhdpi` e `values-pt` dentro dos recursos do APK base.
2. **Desativação das Travas de Split:** Remoção de `requiredSplitTypes="base__density"` e `com.android.vending.splits.required` do `AndroidManifest.xml`.
3. **Recompilação:** Compilação com `apktool.jar`.
4. **Zipalign e Assinatura Digital:** Assinado com `uber-apk-signer.jar` gerando chaves válidas v1, v2 e v3.
5. **Download via Wi-Fi:** O arquivo foi disponibilizado em `http://192.168.3.4:4000/Pest21.apk` para download direto no navegador do celular.

---

## 7. Guia de Comandos e Execução Rápida

### Como Iniciar a API REST:
```bash
node pest21-api/server.js
# Roda em http://localhost:8000/api/
```

### Como Iniciar o Painel Web Administrativo:
```bash
node pest21-web/server.js
# Roda em http://localhost:4000/
```

### Como Instalar o APK no Celular via ADB:
```bash
adb install -r Pest21.apk
```
