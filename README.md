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

### Acessar a Aplicação
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **MySQL**: localhost:3306

### Login
- **Email**: fcso.oliveira@gmail.com
- **Senha**: Castr0@2715

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

## 📖 Credenciais

Ver arquivo `CREDENCIAIS.md` para todas as credenciais de acesso.

## 🛠️ Comandos Úteis

```bash
# Parar todos os serviços
docker-compose down

# Ver logs
docker-compose logs -f

# Acessar o banco de dados
docker exec -it finansmart_mysql mysql -u finansmart_user -p

# Reconstruir tudo
docker-compose down -v
docker-compose up --build
```

## 📝 Notas de Desenvolvimento

- O backend roda na porta 5000
- O frontend roda na porta 3000
- Os dados são persistidos no volume Docker `mysql_data`
- Hot reload está habilitado no frontend

## ⚠️ Avisos de Segurança

> **IMPORTANTE**: Este projeto está configurado para desenvolvimento. Para produção:
> - Use bcrypt para hash de senhas
> - Configure HTTPS
> - Use variáveis de ambiente seguras
> - Configure firewall e restrições de rede

## 📄 Licença

Uso privado - Flávio Castro
