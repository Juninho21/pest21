# Pest21 - Sistema Ecolab Pest XXI

[![Ecolab](https://img.shields.io/badge/Ecolab-Pest_XXI-008dcf?style=for-the-badge)](https://www.ecolab.com)
[![Version](https://img.shields.io/badge/Versão-1.7.4-brightgreen?style=for-the-badge)]()
[![Platform](https://img.shields.io/badge/Plataforma-Android_%7C_Web_%7C_API-blue?style=for-the-badge)]()

Repositório completo do ecossistema **Pest21** (`br.com.advancing.ecolab`), contendo o aplicativo mobile reconstruído via engenharia reversa, o painel web administrativo, a API REST backend em Node.js/SQLite e o APK universal instalável.

---

## 📁 Estrutura do Repositório

```text
Pest21/
├── HISTORICO_E_INSTRUCOES.md  # Relatório completo de engenharia reversa e histórico
├── Pest21.apk                 # APK Universal compilado e assinado (pronto para instalar)
├── Pest21.apks                # Pacote original de Split APKs
├── pest21-source/             # Código-fonte completo reconstruído do app mobile (Ionic/Angular)
│   ├── config.xml             # Configuração Cordova com permissões e plugins
│   ├── package.json           # Dependências npm
│   └── src/                   # Fontes TypeScript (51 arquivos), templates HTML (35) e SCSS
├── pest21-web/                # Painel web administrativo e operacional (SPA moderna)
│   ├── index.html             # Interface web
│   ├── styles.css             # Design system moderno com temas claro e escuro
│   ├── app.js                 # Lógica, gráficos Chart.js e banco simulado
│   └── server.js              # Servidor HTTP local (Porta 4000)
└── pest21-api/                # Backend REST API com SQLite embutido
    ├── server.js              # Servidor com as 17 rotas oficiais do sistema
    ├── pest21.db              # Banco de dados SQLite persistente
    └── package.json           # Scripts de inicialização
```

---

## 🚀 Como Executar

### 1. Iniciar a API REST (Backend)
```bash
node pest21-api/server.js
```
> Disponível em: `http://localhost:8000/api/`

### 2. Iniciar o Painel Web (Frontend)
```bash
node pest21-web/server.js
```
> Disponível em: `http://localhost:4000/`

### 3. Instalar o APK no Celular
- Baixe diretamente pelo navegador do smartphone conectado no mesmo Wi-Fi:  
  👉 `http://<IP-DA-SUA-MAQUINA>:4000/Pest21.apk`  
- Ou instale via cabo USB:
  ```bash
  adb install -r Pest21.apk
  ```

---

## 📖 Documentação Detalhada
Consulte o arquivo [HISTORICO_E_INSTRUCOES.md](HISTORICO_E_INSTRUCOES.md) para todos os detalhes técnicos, mapeamento de rotas e processo de compilação.
