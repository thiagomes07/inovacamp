# InovaCamp - Backend API

Backend da plataforma de crédito P2P global desenvolvido em FastAPI com arquitetura MVCSR.

## 🏗️ Arquitetura

Este projeto segue a arquitetura **MVCSR** (Model-View-Controller-Service-Repository):

```
backend/
├── app/
│   ├── __init__.py
│   ├── main.py                    # Aplicação FastAPI principal
│   ├── database.py                # Configuração do banco de dados
│   │
│   ├── core/                      # Configurações e utilitários centrais
│   │   ├── config.py              # Variáveis de ambiente
│   │   └── security.py            # JWT, hashing, validações
│   │
│   ├── models/                    # Models (ORM SQLAlchemy)
│   │   └── models.py              # Entidades do banco de dados
│   │
│   ├── schemas/                   # DTOs (Pydantic Schemas)
│   │   └── auth_schemas.py        # Schemas de autenticação
│   │
│   ├── repositories/              # Repositories (Acesso a dados)
│   │   └── auth_repository.py     # Operações de banco de dados
│   │
│   ├── services/                  # Services (Lógica de negócio)
│   │   └── auth_service.py        # Regras de negócio
│   │
│   └── controllers/               # Controllers (Rotas FastAPI)
│       ├── auth_controller.py     # ✅ IMPLEMENTADO
│       ├── credit_controller.py   # TODO
│       ├── loan_controller.py     # TODO
│       ├── investment_controller.py # TODO
│       ├── portfolio_controller.py # TODO
│       ├── pool_controller.py     # TODO
│       ├── wallet_controller.py   # TODO
│       ├── currency_controller.py # TODO
│       ├── pix_controller.py      # TODO
│       ├── transaction_controller.py # TODO
│       ├── deposit_controller.py  # TODO
│       ├── open_finance_controller.py # TODO
│       └── kyc_controller.py      # TODO
│
├── database/
│   ├── Dockerfile
│   └── init/
│       ├── 01-schema.sql          # Schema do banco de dados
│       └── 02-seed.sql            # Dados fictícios
│
├── Dockerfile
├── requirements.txt
├── .env
└── .env.example
```

## 🚀 Tecnologias

- **Python 3.11**
- **FastAPI** - Framework web moderno e rápido
- **SQLAlchemy** - ORM para MySQL
- **Pydantic** - Validação de dados
- **PyMySQL** - Driver MySQL
- **python-jose** - JWT tokens
- **passlib[bcrypt]** - Hashing de senhas
- **MySQL 8.0** - Banco de dados relacional

## 📊 Banco de Dados

O banco de dados implementa o DER completo da documentação com 11 tabelas principais:

- **users** - Tomadores de crédito (pessoa física ou jurídica)
- **investors** - Investidores
- **credit_requests** - Solicitações de crédito
- **wallets** - Carteiras multi-moeda
- **pools** - Pools de investimento
- **pool_investments** - Investimentos em pools
- **pool_loans** - Empréstimos via pool
- **loans** - Empréstimos ativos
- **loan_payments** - Parcelas de empréstimos
- **transactions** - Histórico de transações

### Scripts de Inicialização

1. **01-schema.sql**: Cria todas as tabelas, índices, triggers e views
2. **02-seed.sql**: Popula com dados fictícios para testes (apenas se banco vazio)

## 🔧 Configuração

### 1. Clonar o repositório

```bash
git clone https://github.com/thiagomes07/inovacamp.git
cd inovacamp
```

### 2. Configurar variáveis de ambiente

Copie o arquivo `.env.example` para `.env` e ajuste as configurações:

```bash
cd backend
cp .env.example .env
```

Edite o `.env` com suas configurações (senhas, secrets, etc).

### 3. Subir com Docker Compose

Na raiz do projeto:

```bash
docker-compose up -d
```

Isso irá:
- ✅ Criar o container MySQL com o banco de dados
- ✅ Executar os scripts de inicialização (schema + seed)
- ✅ Criar o container do backend FastAPI
- ✅ Criar o container Nginx como proxy reverso

### 4. Verificar logs

```bash
# Logs do backend
docker-compose logs -f backend

# Logs do banco de dados
docker-compose logs -f db

# Logs do nginx
docker-compose logs -f nginx
```

## 📡 Endpoints

### ✅ Autenticação (IMPLEMENTADO)

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| POST | `/api/v1/auth/register` | Registrar novo usuário/investidor |
| POST | `/api/v1/auth/login` | Login e obter tokens |
| POST | `/api/v1/auth/refresh` | Renovar access token |
| GET | `/api/v1/auth/me` | Obter usuário autenticado |
| POST | `/api/v1/auth/logout` | Logout (remover tokens client-side) |

### 📋 Outros Endpoints (Estrutura Criada - TODO)

Todos os endpoints documentados foram criados com estrutura básica:

- `/api/v1/credit/*` - Solicitações de crédito
- `/api/v1/loans/*` - Empréstimos
- `/api/v1/credit-requests/*` - Marketplace de investimentos
- `/api/v1/portfolio/*` - Portfólio do investidor
- `/api/v1/pools/*` - Pools de investimento
- `/api/v1/wallet/*` - Carteiras
- `/api/v1/currencies/*` - Exchange de moedas
- `/api/v1/pix/*` - Pagamentos PIX
- `/api/v1/transactions/*` - Histórico de transações
- `/api/v1/deposits/*` - Depósitos
- `/api/v1/open-finance/*` - Open Finance
- `/api/v1/kyc/*` - KYC

## 📚 Documentação da API

Após subir os containers, acesse:

- **Swagger UI**: http://localhost/docs
- **ReDoc**: http://localhost/redoc
- **Health Check**: http://localhost/health

## 🔐 Segurança

- ✅ Senhas hasheadas com bcrypt
- ✅ Autenticação JWT (Bearer tokens)
- ✅ Validação de CPF/CNPJ
- ✅ Proteção SQL Injection (ORM)
- ✅ CORS configurado
- ✅ Rate limiting no Nginx (100 req/min)
- ✅ Security headers (X-Frame-Options, X-XSS-Protection, etc)

## 🧪 Dados de Teste

O banco é populado automaticamente com dados fictícios:

### Usuários (Tomadores)
- **Email**: `joao.silva@email.com` | **Senha**: `Password123!`
- **Email**: `maria.santos@email.com` | **Senha**: `Password123!`
- **Email**: `empresa.tech@email.com` | **Senha**: `Password123!`

### Investidores
- **Email**: `carlos.investor@email.com` | **Senha**: `Password123!`
- **Email**: `ana.capital@email.com` | **Senha**: `Password123!`

## 🌐 Nginx como Proxy Reverso

O Nginx atua como:
- **Proxy Reverso**: Roteia requisições para o backend
- **Load Balancer**: Distribui carga entre múltiplas instâncias (configurável)
- **Rate Limiter**: 100 requisições/minuto por IP
- **Security Headers**: Headers de segurança automáticos
- **Compressão Gzip**: Otimização de banda

### Escalar Horizontalmente

Para adicionar mais instâncias do backend, edite `nginx/nginx.conf`:

```nginx
upstream backend_servers {
    least_conn;
    server backend:8000;
    server backend2:8000;  # Adicione aqui
    server backend3:8000;  # E aqui
}
```

## 🛠️ Desenvolvimento Local (sem Docker)

```bash
cd backend

# Criar ambiente virtual
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Instalar dependências
pip install -r requirements.txt

# Configurar .env
cp .env.example .env
# Editar .env com configurações do MySQL local

# Rodar aplicação
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

## 📝 Próximos Passos

### Para implementar os endpoints restantes:

1. **Criar DTOs** em `app/schemas/` para cada feature
2. **Criar Repositories** em `app/repositories/` com queries
3. **Criar Services** em `app/services/` com lógica de negócio
4. **Implementar Controllers** substituindo `"Endpoint not implemented yet"`

### Exemplo de fluxo MVCSR:

```python
# 1. DTO (schemas/credit_schemas.py)
class CreditRequestCreate(BaseModel):
    amount_requested: Decimal
    duration_months: int
    collateral_type: str

# 2. Repository (repositories/credit_repository.py)
class CreditRepository:
    def create_request(self, data: dict) -> CreditRequest:
        request = CreditRequest(**data)
        self.db.add(request)
        self.db.commit()
        return request

# 3. Service (services/credit_service.py)
class CreditService:
    def create_credit_request(self, user_id: str, data: CreditRequestCreate):
        # Lógica de negócio
        credit_data = data.model_dump()
        credit_data['user_id'] = user_id
        credit_data['calculated_score'] = self.calculate_score(user_id)
        return self.repository.create_request(credit_data)

# 4. Controller (controllers/credit_controller.py)
@router.post("/request")
def create_credit_request(request: CreditRequestCreate, db: Session = Depends(get_db)):
    service = CreditService(db)
    return service.create_credit_request(current_user.id, request)
```

## 🐛 Troubleshooting

### Banco de dados não conecta
```bash
# Verificar se o container está rodando
docker ps

# Verificar logs do MySQL
docker-compose logs db

# Recriar containers
docker-compose down -v
docker-compose up -d
```

### Backend não inicia
```bash
# Verificar logs
docker-compose logs backend

# Entrar no container
docker exec -it inovacamp_backend bash
```

### Nginx retorna 502
```bash
# Verificar se backend está rodando
docker ps

# Testar conexão direta no backend
curl http://localhost:8000/health
```

## 📄 Licença

Este projeto é parte do hackathon InovaCamp e é destinado apenas para fins educacionais e demonstração.

---

**Desenvolvido com ❤️ para o InovaCamp Hackathon**
