# 🚀 InovaCamp - Plataforma de Crédito P2P Global

Plataforma de crédito peer-to-peer que conecta tomadores de crédito a investidores de forma **inteligente, transparente e instantânea**, utilizando **Blockchain**, **IA** e **Open Finance**.

## 📋 Visão Geral

Esta solução democratiza o acesso ao crédito para autônomos, PMEs e freelancers invisíveis aos bancos tradicionais, conectando-os com investidores globais através de:

- **Score de Crédito Gamificado com IA** - Análise holística além do score tradicional
- **Transparência Blockchain** - Garantias e contratos imutáveis on-chain
- **Liquidez Instantânea** - Swap cripto↔fiat e PIX em tempo real
- **Marketplace de Investimentos** - Oportunidades transparentes e seguras

## 🏗️ Estrutura do Projeto

```
inovacamp/
├── backend/                    # ✅ IMPLEMENTADO
│   ├── app/                    # Código da aplicação FastAPI
│   │   ├── controllers/        # Rotas (endpoints)
│   │   ├── services/           # Lógica de negócio
│   │   ├── repositories/       # Acesso a dados
│   │   ├── models/             # Models ORM
│   │   ├── schemas/            # DTOs (Pydantic)
│   │   └── core/               # Configurações
│   ├── database/               # Scripts SQL
│   │   └── init/               # Schema + Seed data
│   ├── Dockerfile
│   ├── requirements.txt
│   ├── .env
│   └── README.md               # Documentação detalhada
│
├── nginx/                      # ✅ IMPLEMENTADO
│   ├── nginx.conf              # Configuração principal
│   └── conf.d/
│       └── default.conf        # Proxy reverso + Load balancer
│
├── frontend/                   # 🔄 TODO (documentado)
│   ├── src/
│   └── ...
│
├── docs/                       # ✅ Documentação completa
│   ├── docs/
│   │   ├── 1-visao-geral/
│   │   ├── 2-visao-de-engenharia/
│   │   └── 3-visao-de-tecnologia/
│   └── ...
│
├── docker-compose.yml          # ✅ Orquestração completa
└── README.md                   # Este arquivo
```

## 🚀 Quick Start

### Pré-requisitos

- Docker & Docker Compose
- Git

### 1. Clonar o repositório

```powershell
git clone https://github.com/thiagomes07/inovacamp.git
cd inovacamp
```

### 2. Iniciar todos os serviços

```powershell
docker-compose up -d
```

Isso irá iniciar:
- ✅ **MySQL** (porta 3306) - Banco de dados com schema e dados de teste
- ✅ **Backend FastAPI** (porta 8000) - API REST
- ✅ **Nginx** (porta 80) - Proxy reverso e load balancer

### 3. Verificar status

```powershell
docker-compose ps
```

### 4. Acessar a aplicação

- **API**: http://localhost
- **Documentação Swagger**: http://localhost/docs
- **Documentação ReDoc**: http://localhost/redoc
- **Health Check**: http://localhost/health

## 📡 API Endpoints

### ✅ Autenticação (IMPLEMENTADO)

```http
POST   /api/v1/auth/register     # Registrar usuário/investidor
POST   /api/v1/auth/login        # Login
POST   /api/v1/auth/refresh      # Renovar token
GET    /api/v1/auth/me           # Usuário atual
POST   /api/v1/auth/logout       # Logout
```

### 📋 Outros Endpoints (Estrutura Criada)

Todos os endpoints documentados foram criados com estrutura básica:

- ✅ `/api/v1/credit/*` - Solicitações de crédito
- ✅ `/api/v1/loans/*` - Gestão de empréstimos
- ✅ `/api/v1/credit-requests/*` - Marketplace
- ✅ `/api/v1/portfolio/*` - Portfólio do investidor
- ✅ `/api/v1/pools/*` - Pools de investimento
- ✅ `/api/v1/wallet/*` - Carteiras multi-moeda
- ✅ `/api/v1/currencies/*` - Exchange de moedas
- ✅ `/api/v1/pix/*` - Pagamentos PIX
- ✅ `/api/v1/transactions/*` - Histórico
- ✅ `/api/v1/deposits/*` - Depósitos
- ✅ `/api/v1/open-finance/*` - Open Finance
- ✅ `/api/v1/kyc/*` - KYC

## 🧪 Dados de Teste

### Usuários (Tomadores de Crédito)
| Email | Senha | Tipo | Score |
|-------|-------|------|-------|
| joao.silva@email.com | Password123! | CPF | 750 |
| maria.santos@email.com | Password123! | CPF | 680 |
| empresa.tech@email.com | Password123! | CNPJ | 720 |

### Investidores
| Email | Senha | Tipo |
|-------|-------|------|
| carlos.investor@email.com | Password123! | CPF |
| ana.capital@email.com | Password123! | CPF |

## 🏛️ Arquitetura

### Backend: Arquitetura MVCSR

```
Request → Controller (validation) → Service (business logic) → Repository (data access) → Database
                ↓                           ↓
              DTOs                      ORM Models
```

**Benefícios**:
- ✅ Separação de responsabilidades
- ✅ Testabilidade
- ✅ Manutenibilidade
- ✅ Proteção contra SQL Injection (ORM)

### Banco de Dados

11 tabelas principais implementando DER completo:

- `users` - Tomadores de crédito
- `investors` - Investidores
- `credit_requests` - Solicitações de crédito
- `wallets` - Carteiras multi-moeda
- `pools` - Pools de investimento
- `pool_investments` - Investimentos em pools
- `pool_loans` - Empréstimos via pool
- `loans` - Empréstimos ativos
- `loan_payments` - Parcelas
- `transactions` - Histórico de transações

**Features**:
- ✅ Triggers automáticos para auditoria
- ✅ Views otimizadas para analytics
- ✅ Índices compostos para performance
- ✅ Seed data automático

### Nginx: Proxy Reverso & Load Balancer

```
Internet → Nginx (port 80) → Backend FastAPI (port 8000) → MySQL (port 3306)
              ↓
      - Rate Limiting
      - Load Balancing
      - Compression
      - Security Headers
```

**Features**:
- ✅ Rate limiting (100 req/min por IP)
- ✅ Compressão Gzip
- ✅ Security headers
- ✅ Load balancing (configurável para múltiplas instâncias)
- ✅ Health checks

## 🔐 Segurança (PoC)

- ✅ Senhas hasheadas com **bcrypt**
- ✅ Autenticação **JWT** (access + refresh tokens)
- ✅ Validação de **CPF/CNPJ**
- ✅ Proteção **SQL Injection** (ORM SQLAlchemy)
- ✅ **CORS** configurado
- ✅ **Rate limiting** no Nginx
- ✅ **Security headers** automáticos

## 📚 Documentação Completa

Toda a documentação técnica está em `docs/`:

- **Visão Geral** (`docs/docs/1-visao-geral/`)
  - Problema, solução e modelo de negócios
  
- **Visão de Engenharia** (`docs/docs/2-visao-de-engenharia/`)
  - Arquitetura geral
  - Backend, banco de dados e blockchain
  - Frontend
  
- **Visão de Tecnologia** (`docs/docs/3-visao-de-tecnologia/`)
  - Stack tecnológico (PoC vs MVP)
  - Infraestrutura e custos

Para visualizar a documentação formatada:

```powershell
cd docs
npm install
npm start
```

## 🛠️ Scripts Úteis

### PowerShell Helper (Windows)

```powershell
cd backend
.\scripts.ps1
```

Menu interativo com opções para:
- Start/Stop/Restart serviços
- Ver logs
- Rebuild containers
- Reset database
- Enter container shell
- Check status

### Comandos Docker Compose

```powershell
# Iniciar serviços
docker-compose up -d

# Parar serviços
docker-compose down

# Ver logs
docker-compose logs -f

# Logs de um serviço específico
docker-compose logs -f backend
docker-compose logs -f db
docker-compose logs -f nginx

# Rebuild
docker-compose build --no-cache
docker-compose up -d

# Reset completo (apaga volumes)
docker-compose down -v
docker-compose up -d
```

## 🧪 Testando a API

### Exemplo: Registrar Usuário

```powershell
curl -X POST "http://localhost/api/v1/auth/register" `
  -H "Content-Type: application/json" `
  -d '{
    "email": "test@example.com",
    "password": "Password123!",
    "full_name": "Test User",
    "cpf_cnpj": "12345678901",
    "document_type": "cpf",
    "user_type": "user"
  }'
```

### Exemplo: Login

```powershell
curl -X POST "http://localhost/api/v1/auth/login" `
  -H "Content-Type: application/json" `
  -d '{
    "email": "joao.silva@email.com",
    "password": "Password123!"
  }'
```

### Exemplo: Obter Usuário Atual

```powershell
curl -X GET "http://localhost/api/v1/auth/me" `
  -H "Authorization: Bearer <seu-token-aqui>"
```

## 📈 Próximos Passos

### Backend

1. ✅ ~~Estrutura MVCSR completa~~
2. ✅ ~~Banco de dados com DER completo~~
3. ✅ ~~Autenticação JWT implementada~~
4. ✅ ~~Nginx como proxy reverso~~
5. 🔄 Implementar endpoints de crédito
6. 🔄 Implementar endpoints de investimento
7. 🔄 Implementar endpoints de pools
8. 🔄 Implementar endpoints de carteiras
9. 🔄 Implementar KYC
10. 🔄 Integração com blockchain (Solana Devnet)

### Frontend

1. 🔄 Setup React + TypeScript + Tailwind
2. 🔄 Integração com API backend
3. 🔄 Telas de onboarding
4. 🔄 Dashboard de tomador
5. 🔄 Dashboard de investidor
6. 🔄 Marketplace de crédito

## 🐛 Troubleshooting

### Backend não conecta ao banco

```powershell
# Verificar se o MySQL está rodando
docker-compose ps

# Ver logs do MySQL
docker-compose logs db

# Recriar containers
docker-compose down -v
docker-compose up -d
```

### Nginx retorna 502

```powershell
# Verificar se backend está rodando
docker ps

# Testar backend diretamente
curl http://localhost:8000/health
```

### Resetar tudo

```powershell
# Parar e remover tudo (incluindo volumes)
docker-compose down -v

# Rebuild e restart
docker-compose build --no-cache
docker-compose up -d
```

## 📄 Licença

Este projeto é parte do hackathon InovaCamp e é destinado apenas para fins educacionais e demonstração.

---

## 🤝 Contribuidores

Desenvolvido com ❤️ para o **InovaCamp Hackathon 2024**

- GitHub: [@thiagomes07](https://github.com/thiagomes07)

---

**Status do Projeto**: PoC (Proof of Concept) - Hackathon

**Última Atualização**: Outubro 2024
