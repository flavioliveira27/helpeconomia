# HelpEconomia - Sistema de Controle Financeiro

Sistema completo de controle financeiro com frontend React, backend Node.js/Express e banco de dados MySQL.

## 🚀 Início Rápido

### Pré-requisitos
- Docker e Docker Compose instalados

### Executar o Sistema

```bash
# Clone o repositório (se aplicável)
cd "C:\Users\PC\Documents\Apps\Controle Financeiro"

# Inicie todos os serviços (MySQL, Backend, Frontend)
docker-compose up --build

# Aguarde alguns segundos para o MySQL inicializar...
```


## 📦 Estrutura do Projeto

```
Controle Financeiro/
├── backend/                  # API Node.js/Express
│   ├── src/
│   │   ├── config/          # Configuração do banco
│   │   ├── controllers/     # Lógica de negócio
│   │   ├── middleware/      # Autenticação JWT
│   │   ├── routes/          # Rotas da API
│   │   └── server.js        # Servidor principal
│   ├── init.sql             # Schema do banco
│   ├── Dockerfile
│   └── package.json
│
├── components/              # Componentes React
├── contexts/                # Context API (integração com backend)
├── pages/                   # Páginas da aplicação
├── services/                # Serviço de API
├── docker-compose.yml       # Orquestração dos serviços
└── README.md
```

## 🔧 Tecnologias

**Frontend:**
- React 19
- TypeScript
- Vite
- TailwindCSS (utility classes)
- React Router
- Recharts

**Backend:**
- Node.js
- Express
- MySQL 8.0
- JWT Authentication
- CORS

**DevOps:**
- Docker
- Docker Compose

## 📋 Funcionalidades

✅ Autenticação com JWT  
✅ Gestão de usuários (Admin)  
✅ Controle de transações (Entradas, Despesas Fixas, Gastos, Investimentos)  
✅ Relatórios e gráficos  
✅ Dashboard com resumo financeiro  
✅ Persistência de dados em MySQL  
✅ Multi-usuário  
✅ Categorização de gastos  
✅ Forma de pagamento (crédito parcelado, etc)  

## 🗄️ Banco de Dados

O sistema usa MySQL 8.0 com as seguintes tabelas:

- **users**: Gerenciamento de usuários e autenticação
- **transactions**: Todas as transações financeiras

Ver `backend/init.sql` para o schema completo.

## 📄 Licença

Uso privado - Flávio Castro
