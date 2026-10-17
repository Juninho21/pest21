# Ecolab Pest XXI (Pest21) - Código Fonte Reconstruído

Código fonte reconstruído a partir da engenharia reversa do pacote **Pest21.apks** (`br.com.advancing.ecolab`), utilizando a metodologia e ferramentas do ecossistema [REA (Reverse Engineer Anything)](https://github.com/morluto/rea).

---

## 📌 Visão Geral do Aplicativo

- **Identificador / Package ID:** `br.com.advancing.ecolab`
- **Nome da Aplicação:** Ecolab Pest XXI
- **Versão:** `1.7.4`
- **Desenvolvedor:** Advancing Sistemas / Jackson Wolff Team
- **Finalidade:** Sistema de Gerenciamento e Execução de Ordens de Serviço (OS) da área de *Pest Elimination* da **ECOLAB**, com suporte completo a operação offline e sincronização em lote.

---

## 🛠️ Stack Tecnológica

| Camada | Tecnologia | Versão |
|---|---|---|
| **Framework Mobile** | Ionic Framework | `3.9.2` |
| **Framework Web** | Angular | `5.2.11` |
| **Linguagem** | TypeScript | `~2.6.2` |
| **Container Híbrido** | Apache Cordova (Android) | Target SDK 35, Min SDK 22 |
| **Estado & Reatividade** | RxJS | `5.5.11` |
| **Armazenamento Local** | Ionic Storage (SQLite / IndexedDB) | `2.2.0` |
| **Autenticação** | JWT (`@auth0/angular-jwt`) | `^1.0.0` |
| **Internacionalização** | ngx-translate | `9.1.1` (pt-BR, es, en) |
| **Telemetria / Crash** | Microsoft App Center & Firebase | Analytics & Messaging |

---

## 🔍 Processo de Engenharia Reversa (REA Pipeline)

1. **Inspeção de Contêiner & Split APKs:**
   - O arquivo `Pest21.apks` foi descompactado revelando o APK base (`base.apk`) e splits de configuração (`es`, `pt`, `xxhdpi`).
2. **Análise de Aplicação via REA (`rea-agents`):**
   - Utilização das ferramentas do REA para análise estática e extração do grafo de dependências JavaScript (`analyze-javascript-application`).
   - Identificação do runtime híbrido Apache Cordova + Ionic 3.
3. **Reconstrução com Fidelidade Total dos Fontes:**
   - Extração do mapa de fontes (`main.js.map` e `vendor.js.map`), recuperando os 51 módulos TypeScript originais com comentários, tipagens e nomes originais.
   - Decodificação e reconstrução dos 35 templates HTML embutidos (`/*ion-inline-start*/` / `/*ion-inline-end*/`).
   - Descompactação e mapeamento de estilos SASS/CSS individuais para cada página (`page-*.scss`).
   - Reconstrução do `config.xml` a partir do binário Android AXML (recuperando todas as tags `<widget>`, `<feature>`, permissões e chaves).
   - Extração de todos os assets estáticos: fontes (`roboto`, `noto-sans`, `ionicons`), ícones SVG/PNG, imagens de branding e dicionários i18n.

---

## 📂 Estrutura do Projeto Clonado

```text
pest21-source/
├── config.xml                  # Configurações do Cordova e plugins
├── package.json                # Dependências npm
├── ionic.config.json           # Configuração da CLI do Ionic
├── tsconfig.json               # Configuração do TypeScript
├── resources/                  # Ícones e splash screens por densidade
│   └── android/
│       ├── icon/
│       └── splash/
├── scripts/
│   └── remove-media-permissions.js # Hook Cordova after_prepare
├── src/
│   ├── index.html              # Entrada HTML
│   ├── manifest.json           # Manifest PWA
│   ├── service-worker.js       # Cache offline PWA
│   ├── app/
│   │   ├── app.component.ts    # Componente raiz, verificação de rede e push
│   │   ├── app.html            # Menu lateral e container ion-nav
│   │   ├── app.module.ts       # Declarações, providers e JWT
│   │   ├── app.scss            # Estilos globais
│   │   └── main.ts             # Bootstrap da aplicação
│   ├── assets/
│   │   ├── fonts/              # Fontes ionicons, roboto, noto-sans
│   │   ├── i18n/               # Arquivos de tradução (pt-br, es, en)
│   │   ├── icon/               # Ícones de ações e login
│   │   ├── imgs/               # Logos da Ecolab e fundos
│   │   └── js/                 # Bibliotecas de terceiros (signature_pad)
│   ├── components/
│   │   ├── components.module.ts
│   │   ├── device-checker/     # Validação de dispositivos de monitoramento
│   │   └── pest-modal-selector/# Seletor modal de pragas
│   ├── pages/                  # Todas as 33 páginas do aplicativo
│   │   ├── login/              # Autenticação de usuários
│   │   ├── home/               # Painel principal e avisos de OS pendentes
│   │   ├── calendar/           # Agenda de visitas (diária, semanal, mensal)
│   │   ├── clients/            # Listagem e busca de clientes
│   │   ├── client-details/     # Detalhes, contatos e dispositivos instalados
│   │   ├── schedule-create/    # Criação de novo agendamento
│   │   ├── schedule-update/    # Edição de agendamento existente
│   │   ├── service-order/      # Lista e controle de Ordens de Serviço
│   │   ├── service-order-details/ # Detalhes da OS
│   │   ├── service-form/       # Formulário de execução da OS
│   │   ├── service-order-pest-counting/ # Contagem de pragas capturadas
│   │   ├── service-order-mip/  # Manejo Integrado de Pragas
│   │   ├── service-order-audit/# Itens de auditoria e conformidade
│   │   ├── service-order-vehicles/ # Inspeção de frota/veículos
│   │   ├── service-order-non-attendance/ # Registro de não comparecimento
│   │   ├── service-order-non-compliance/ # Registro de não conformidades
│   │   ├── service-order-resume/ # Resumo geral antes do encerramento
│   │   ├── service-order-finish/ # Coleta de assinatura e fechamento
│   │   ├── service-order-evaluation/ # Avaliação do cliente
│   │   ├── service-order-offline-pool/ # Fila de OS pendentes de envio
│   │   ├── documents/ & procedures/ # Manuais e documentações técnicas
│   │   ├── notifications/      # Mensagens e alertas recebidos
│   │   ├── pending-errors/     # Tratamento de falhas de envio
│   │   ├── profile/            # Perfil do especialista
│   │   └── about/              # Sobre a versão do app
│   ├── pipes/
│   │   ├── sanitize-html/
│   │   └── sanitize-url/
│   ├── providers/
│   │   ├── api/api.ts          # Cliente HTTP, rotas e regras de negócio
│   │   ├── offline-manager/    # Gerenciador de fila offline (`storedreq`)
│   │   ├── network-service/    # Monitoramento de conexão online/offline
│   │   ├── notification/       # Notificações locais e push
│   │   └── date-time-helper/   # Utilitários de data/hora
│   └── theme/
│       └── variables.scss      # Paleta de cores oficial Ecolab
```

---

## 🌐 Endpoints da API Descobertos

Base URL de Produção: `https://sistema.ecolabpest21.com.br/api/`  
Base URL de Homologação: `https://hml.ecolabpest21.com.br/api/`  
Base URL de Teste Local: `http://localhost:8000/api/`

| Método | Endpoint | Descrição |
|---|---|---|
| `GET` | `/server-time` | Obtém horário atual do servidor para validação de fuso |
| `POST` | `/login` | Autenticação por email/CPF e senha com retorno de JWT |
| `POST` | `/forgot-password` | Recuperação de acesso por email |
| `POST` | `/update-user` | Atualização cadastral do perfil do técnico |
| `GET` | `/data` | Carga inicial completa de clientes, dispositivos e serviços para operação offline |
| `GET` | `/service-orders` | Busca ordens de serviço ativas para o especialista |
| `POST` | `/service-order` | Envio de ordem de serviço concluída |
| `POST` | `/ossupport` | Envio de ordem de serviço de suporte |
| `GET` | `/new-schedule` | Dados para formulário de novo agendamento |
| `POST` | `/new-scheduling` | Criação de novo agendamento de visita |
| `POST` | `/schedule-update` | Atualização de visita agendada |
| `POST` | `/schedule-delete` | Cancelamento de agendamento |
| `POST` | `/update-interval` | Registro de deslocamento/intervalo do técnico |
| `POST` | `/new-non-attendance` | Justificativa de não atendimento no cliente |
| `POST` | `/client-details` | Atualização de dados cadastrais e observações do cliente |
| `POST` | `/client-contact` / `delete-client-contact` | Gerenciamento de contatos do cliente |
| `POST` | `/client-device` / `delete-client-device` | Gerenciamento de armadilhas/dispositivos do cliente |

---

## 💾 Mecanismo Offline & Sincronização

1. O app detecta status de rede através do plugin `@ionic-native/network`.
2. Se offline, qualquer chamada de mutação (`POST`) é enfileirada no `OfflineManagerProvider` dentro da chave `storedreq` no armazenamento local (`IonicStorage`).
3. Ao restabelecer a conexão com a internet, o evento `NetworkServiceProvider` dispara `checkForEvents()`, enviando em lote com `forkJoin` todas as requisições pendentes na ordem em que foram geradas.

---

## 🚀 Como Executar Localmente

### Pré-requisitos
- Node.js versão 10 a 14 recomendada para compilação legada do Angular 5 / Ionic 3 (ou utilize contêiner Docker fornecido abaixo).
- npm versão 6+.

### Instalação de Dependências
```bash
cd pest21-source
npm install
```

### Executar em Modo de Desenvolvimento (Navegador)
```bash
npm run start
# ou
npx ionic serve
```

### Compilar para Android
```bash
npx ionic cordova platform add android
npx ionic cordova build android --prod --release
```
