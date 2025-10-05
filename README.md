# 🚀 InovaCamp - Plataforma P2P de Crédito Global

[![Status](https://img.shields.io/badge/status-PoC-blue)]()
[![Backend](https://img.shields.io/badge/backend-FastAPI-green)]()
[![Database](https://img.shields.io/badge/database-MySQL-orange)]()
[![Blockchain](https://img.shields.io/badge/blockchain-Solana-purple)]()

Plataforma de crédito peer-to-peer que conecta tomadores de crédito a investidores de forma **inteligente, transparente e instantânea**, utilizando **Blockchain**, **IA** e **Open Finance**.

Desenvolvido para a competição [**Inovacamp QI Tech**](https://www.inovacamp-qitech.com.br/).

---

## 📋 Visão Geral

Democratizamos o acesso ao crédito para autônomos, PMEs e freelancers invisíveis aos bancos tradicionais, conectando-os com investidores globais através de:

- 🎯 **Score de Crédito Gamificado com IA** - Análise holística além do score tradicional
- 🔗 **Transparência Blockchain** - Garantias e contratos imutáveis on-chain
- ⚡ **Liquidez Instantânea** - Swap cripto↔fiat e PIX em tempo real
- 💼 **Marketplace de Investimentos** - Oportunidades transparentes e seguras

---

## 🏗️ Estrutura do Projeto

```
inovacamp/
├── backend/                    # ✅ Backend FastAPI (IMPLEMENTADO)
│   ├── app/                    # Código da aplicação
│   │   ├── controllers/        # Rotas (Auth completo)
│   │   ├── services/           # Lógica de negócio
│   │   ├── repositories/       # Acesso a dados
│   │   ├── models/             # Models ORM (11 tabelas)
│   │   ├── schemas/            # DTOs (Pydantic)
│   │   └── core/               # Configurações & Segurança
│   ├── database/               # Scripts SQL
│   │   └── init/               # Schema + Seed data
│   └── README.md               # Documentação completa
│
├── nginx/                      # ✅ Proxy Reverso (IMPLEMENTADO)
│   ├── nginx.conf
│   └── conf.d/
│       └── default.conf
│
├── docs/                       # ✅ Documentação Técnica
│   ├── docs/
│   │   ├── 1-visao-geral/
│   │   ├── 2-visao-de-engenharia/
│   │   └── 3-visao-de-tecnologia/
│   └── ...
│
├── frontend/                   # 🔄 Frontend React (TODO)
│
├── docker-compose.yml          # ✅ Orquestração completa
├── QUICK_START.md             # ⚡ Deploy rápido
├── SUMARIO_BACKEND.md         # 📊 Sumário executivo
├── CHECKLIST.md               # ✅ Progresso detalhado
└── README.md                  # Este arquivo
```

---

## 🚀 Quick Start

### Pré-requisitos
- Docker & Docker Compose
- Git

### Deploy em 3 passos

```bash
# 1. Clone o repositório
git clone https://github.com/thiagomes07/inovacamp.git
cd inovacamp

# 2. Suba todos os serviços
docker-compose up -d

# 3. Acesse a API
# http://localhost        - API
# http://localhost/docs   - Documentação Swagger
# http://localhost/health - Health check
```

**Tempo estimado**: 2-5 minutos ⚡

📖 **Mais detalhes**: Consulte [QUICK_START.md](QUICK_START.md)

---

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
- ✅ `/api/v1/credit/*` - Solicitações de crédito
- ✅ `/api/v1/loans/*` - Gestão de empréstimos
- ✅ `/api/v1/portfolio/*` - Portfólio do investidor
- ✅ `/api/v1/pools/*` - Pools de investimento
- ✅ `/api/v1/wallet/*` - Carteiras multi-moeda
- ✅ `/api/v1/pix/*` - Pagamentos PIX
- ✅ `/api/v1/kyc/*` - KYC

**Total**: 29 endpoints estruturados | 5 funcionais

---

## 🎯 Status do Projeto

### ✅ Implementado (PoC Funcional)

- **Infraestrutura**: 100%
  - ✅ Docker Compose orquestrando 3 serviços
  - ✅ MySQL 8.0 com DER completo (11 tabelas)
  - ✅ Nginx como proxy reverso e load balancer
  
- **Backend FastAPI**: 85%
  - ✅ Arquitetura MVCSR completa
  - ✅ Autenticação JWT funcional
  - ✅ 29 endpoints estruturados (5 implementados)
  - ✅ ORM SQLAlchemy
  - ✅ Validação de CPF/CNPJ
  
- **Segurança**: 100% (PoC)
  - ✅ Bcrypt, JWT, SQL injection protection
  - ✅ Rate limiting, CORS, Security headers
  
- **Documentação**: 100%
  - ✅ Swagger automático
  - ✅ 4 READMEs detalhados
  - ✅ Scripts de teste e helper

### 🔄 Em Desenvolvimento

- Lógica de negócio dos endpoints
- Testes automatizados
- Integração blockchain (Solana)
- IA para score de crédito

### 📊 Progresso Geral: **60%**

---

## 🧪 Dados de Teste

| Email | Senha | Tipo | Score |
|-------|-------|------|-------|
| joao.silva@email.com | Password123! | Tomador | 750 |
| carlos.investor@email.com | Password123! | Investidor | - |

---

## 📚 Documentação

### 📖 Documentação Online
- [Documentação Completa](https://thiagomes07.github.io/inovacamp/)
- [Protótipo Frontend](http://swapin-inovacamp.s3-website-us-east-1.amazonaws.com/)

### 📄 Documentação Local
- [QUICK_START.md](QUICK_START.md) - Deploy rápido
- [backend/README.md](backend/README.md) - Documentação técnica do backend
- [SUMARIO_BACKEND.md](SUMARIO_BACKEND.md) - Sumário executivo
- [CHECKLIST.md](CHECKLIST.md) - Checklist detalhado de implementação

### 🔍 API Docs (após iniciar)
- http://localhost/docs - Swagger UI
- http://localhost/redoc - ReDoc

---

## 🛠️ Stack Tecnológico

### Backend (PoC)
- **Python 3.11** + **FastAPI**
- **MySQL 8.0** + **SQLAlchemy**
- **JWT** + **Bcrypt**
- **Pydantic** (validação)

### Infraestrutura
- **Docker** + **Docker Compose**
- **Nginx** (proxy reverso + load balancer)

### Planejado (MVP)
- **Blockchain**: Solana/Polygon
- **IA**: Python + LightGBM
- **Frontend**: React + TypeScript + Tailwind

---

## 🧪 Testando a API

### Exemplo: Login
```bash
curl -X POST "http://localhost/api/v1/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "joao.silva@email.com",
    "password": "Password123!"
  }'
```

### Exemplo: Registrar Usuário
```bash
curl -X POST "http://localhost/api/v1/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "novo@example.com",
    "password": "Password123!",
    "full_name": "Novo Usuario",
    "cpf_cnpj": "12345678901",
    "document_type": "cpf",
    "user_type": "user"
  }'
```

### Script de Teste Automatizado
```bash
python backend/test_api.py
```

---

## 🤝 Contribuindo

Este projeto foi desenvolvido para o hackathon **InovaCamp QI Tech 2024**.

### Próximos Passos
1. Implementar lógica de negócio dos endpoints
2. Adicionar testes unitários
3. Integrar blockchain (Solana Devnet)
4. Implementar IA para score de crédito
5. Desenvolver frontend completo

---

## 📄 Licença

Este projeto é parte do hackathon InovaCamp e é destinado apenas para fins educacionais e demonstração.

---

## 📞 Contato

- **GitHub**: [@thiagomes07](https://github.com/thiagomes07)
- **Repositório**: [github.com/thiagomes07/inovacamp](https://github.com/thiagomes07/inovacamp)

---

## 🌟 Highlights

- ✅ **Arquitetura MVCSR** bem estruturada
- ✅ **ORM SQLAlchemy** protegendo contra SQL injection
- ✅ **Nginx** preparado para escalar horizontalmente
- ✅ **11 tabelas** implementando DER completo
- ✅ **29 endpoints** estruturados
- ✅ **Documentação** completa com Swagger
- ✅ **Rate limiting** e security headers
- ✅ **Dados de teste** pré-populados

---

**Desenvolvido com ❤️ para o InovaCamp Hackathon 2024**

**Status**: ✅ PoC Funcional | 🔄 MVP em desenvolvimento

**Última Atualização**: Outubro 2025

