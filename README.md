# InnoCore ERP System

Sistema ERP completo com Backend (NestJS), Frontend Web (React + Vite) e Mobile (React Native).

## 📋 Estrutura do Projeto

```
InnoCore/
├── server/          # Backend NestJS + Prisma + PostgreSQL
├── client/          # Frontend Web React + Vite + TailwindCSS
├── mobile/          # App Mobile React Native + Expo
└── .agent/          # Configurações de agentes e skills
```

## 🚀 Tecnologias

### Backend
- **NestJS** - Framework Node.js
- **Prisma** - ORM para PostgreSQL
- **PostgreSQL** - Banco de dados
- **JWT** - Autenticação
- **TypeScript** - Linguagem

### Frontend Web
- **React 18** - Biblioteca UI
- **Vite** - Build tool
- **TailwindCSS** - Framework CSS
- **React Router** - Roteamento
- **TypeScript** - Linguagem

### Mobile
- **React Native** - Framework mobile
- **Expo** - Plataforma de desenvolvimento
- **TypeScript** - Linguagem

## 📦 Instalação Local

### 1. Backend (Server)

```bash
cd server
npm install

# Configure o arquivo .env
cp .env.example .env
# Edite o .env com suas credenciais do PostgreSQL

# Execute as migrations
npx prisma migrate deploy

# Seed do banco (usuário admin padrão)
npx prisma db seed

# Inicie o servidor
npm run start:dev
```

O backend estará rodando em `http://localhost:3000`

### 2. Frontend Web (Client)

```bash
cd client
npm install

# Configure o arquivo .env
echo "VITE_API_URL=http://localhost:3000" > .env

# Inicie o servidor de desenvolvimento
npm run dev
```

O frontend estará rodando em `http://localhost:5173`

### 3. Mobile

```bash
cd mobile
npm install

# Inicie o Expo
npm start
```

## 🌐 Deploy no Easepanel

### Pré-requisitos
- Conta no Easepanel
- Servidor com Docker instalado
- PostgreSQL configurado

### Passo a Passo

1. **Criar Banco de Dados PostgreSQL**
   - No Easepanel, crie um serviço PostgreSQL
   - Anote as credenciais (host, porta, usuário, senha, database)

2. **Deploy do Backend**
   - Crie um novo serviço do tipo "GitHub"
   - Conecte ao repositório: `https://github.com/OverSoccerClub/InnoCoreSystem.git`
   - Configure o diretório: `server`
   - Adicione as variáveis de ambiente:
     ```
     DATABASE_URL=postgresql://user:password@host:5432/database
     JWT_SECRET=seu_secret_jwt_aqui
     PORT=3000
     ```
   - Build Command: `npm install && npx prisma generate && npx prisma migrate deploy`
   - Start Command: `npm run start:prod`
   - Porta: `3000`

3. **Deploy do Frontend**
   - Crie um novo serviço do tipo "GitHub"
   - Conecte ao repositório: `https://github.com/OverSoccerClub/InnoCoreSystem.git`
   - Configure o diretório: `client`
   - Adicione as variáveis de ambiente:
     ```
     VITE_API_URL=https://seu-backend.easepanel.host
     ```
   - Build Command: `npm install && npm run build`
   - Start Command: `npm run preview` ou use servidor estático
   - Porta: `4173`

4. **Seed do Banco de Dados**
   - Após o primeiro deploy do backend, execute:
   ```bash
   npx prisma db seed
   ```

## 👤 Usuário Padrão

Após o seed do banco:
- **Email:** admin@innocore.com
- **Senha:** admin123

⚠️ **Importante:** Altere a senha padrão após o primeiro login!

## 📱 Módulos do Sistema

- ✅ **Autenticação e Autorização** (JWT + Permissões)
- ✅ **Dashboard** (Métricas e indicadores)
- ✅ **Gestão de Usuários** (CRUD + Permissões)
- ✅ **Produtos** (Cadastro + Estoque)
- ✅ **Categorias** (Organização de produtos)
- ✅ **Parceiros** (Clientes e Fornecedores)
- ✅ **Vendas** (PDV + Histórico)
- ✅ **Compras** (Entrada de estoque)
- ✅ **Estoque** (Movimentações)
- ✅ **Financeiro** (Fluxo de caixa)
- ✅ **Contas a Pagar**
- ✅ **Contas a Receber**
- ✅ **Plano de Contas**
- ✅ **Fiscal** (Notas fiscais)
- ✅ **Configurações da Empresa**

## 🔐 Sistema de Permissões

O sistema possui controle granular de permissões por módulo:
- `VIEW` - Visualizar
- `CREATE` - Criar
- `EDIT` - Editar
- `DELETE` - Deletar

Permissões especiais:
- `MANAGE_USERS` - Gerenciar usuários
- `MANAGE_SETTINGS` - Gerenciar configurações
- `VIEW_REPORTS` - Visualizar relatórios

## 📄 Licença

Propriedade de OverSoccerClub

## 📧 Suporte

Email: suporte.inforcomputer@gmail.com
