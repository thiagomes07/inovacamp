# 🚀 QUICK START - Deploy Backend InovaCamp

## Pré-requisitos

- ✅ Docker Desktop instalado e rodando
- ✅ Git instalado
- ✅ PowerShell (Windows) ou Bash (Linux/Mac)

## 🎯 Deploy em 3 Passos

### 1️⃣ Clone o repositório

```powershell
git clone https://github.com/thiagomes07/inovacamp.git
cd inovacamp
```

### 2️⃣ Configure variáveis de ambiente (OPCIONAL)

```powershell
# Copiar .env.example para .env (já tem valores padrão)
cd backend
cp .env.example .env

# Editar .env se necessário (senhas, secrets, etc)
notepad .env
```

**Nota**: O `.env` já vem configurado com valores padrão para PoC.

### 3️⃣ Subir todos os serviços

```powershell
# Voltar para raiz do projeto
cd ..

# Subir tudo com Docker Compose
docker-compose up -d
```

## ✅ Verificar se está funcionando

### Opção 1: Checar containers

```powershell
docker-compose ps
```

Deve mostrar 3 containers rodando:
- ✅ `inovacamp_db` (MySQL)
- ✅ `inovacamp_backend` (FastAPI)
- ✅ `inovacamp_nginx` (Nginx)

### Opção 2: Testar API

Abrir no navegador:
- http://localhost - Root da API
- http://localhost/docs - Documentação Swagger
- http://localhost/health - Health check

### Opção 3: Executar script de teste

```powershell
# Instalar requests (se necessário)
pip install requests

# Executar testes
python backend/test_api.py
```

## 🔐 Testar Autenticação

### Registrar novo usuário

```powershell
curl -X POST "http://localhost/api/v1/auth/register" `
  -H "Content-Type: application/json" `
  -d '{
    "email": "teste@example.com",
    "password": "Password123!",
    "full_name": "Usuário Teste",
    "cpf_cnpj": "12345678901",
    "document_type": "cpf",
    "user_type": "user"
  }'
```

### Login com usuário de teste

```powershell
curl -X POST "http://localhost/api/v1/auth/login" `
  -H "Content-Type: application/json" `
  -d '{
    "email": "joao.silva@email.com",
    "password": "Password123!"
  }'
```

**Resposta esperada**: JSON com `access_token`, `refresh_token` e dados do usuário.

## 📊 Usuários de Teste Pré-cadastrados

### Tomadores de Crédito
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

## 🛠️ Comandos Úteis

### Ver logs
```powershell
# Todos os serviços
docker-compose logs -f

# Apenas backend
docker-compose logs -f backend

# Apenas banco de dados
docker-compose logs -f db
```

### Parar serviços
```powershell
docker-compose down
```

### Parar e remover volumes (reset completo)
```powershell
docker-compose down -v
```

### Rebuild (após mudanças no código)
```powershell
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

### Menu interativo (Windows)
```powershell
cd backend
.\scripts.ps1
```

## 🐛 Problemas Comuns

### "Port 80 already in use"
```powershell
# Parar serviço usando a porta 80
# No Windows: parar IIS ou outros servidores web
# Ou mudar porta no docker-compose.yml:
#   nginx:
#     ports:
#       - "8080:80"  # Usar 8080 ao invés de 80
```

### "Port 3306 already in use"
```powershell
# Parar MySQL local
# Ou mudar porta no docker-compose.yml:
#   db:
#     ports:
#       - "3307:3306"  # Usar 3307 ao invés de 3306
```

### Backend não conecta ao banco
```powershell
# Verificar se MySQL está healthy
docker-compose ps

# Ver logs do banco
docker-compose logs db

# Aguardar alguns segundos e tentar novamente
docker-compose restart backend
```

### Banco de dados não popula dados
```powershell
# Reset completo
docker-compose down -v
docker-compose up -d

# Aguardar ~10 segundos para MySQL inicializar
# Verificar logs
docker-compose logs db | Select-String "seed"
```

## 📡 Endpoints Disponíveis

### ✅ Autenticação (FUNCIONANDO)
- `POST /api/v1/auth/register` - Registrar
- `POST /api/v1/auth/login` - Login
- `POST /api/v1/auth/refresh` - Renovar token
- `GET /api/v1/auth/me` - Usuário atual
- `POST /api/v1/auth/logout` - Logout

### 📋 Outros (Estrutura criada)
- `/api/v1/credit/*` - Solicitações de crédito
- `/api/v1/loans/*` - Empréstimos
- `/api/v1/portfolio/*` - Portfólio
- `/api/v1/pools/*` - Pools
- `/api/v1/wallet/*` - Carteiras
- `/api/v1/pix/*` - PIX
- ... (ver /docs para lista completa)

## 🔍 Verificar Banco de Dados

### Conectar ao MySQL
```powershell
docker exec -it inovacamp_db mysql -u root -pinovacamp_secure_password_2024 inovacamp_db
```

### Queries úteis
```sql
-- Ver usuários cadastrados
SELECT user_id, email, full_name, credit_score FROM users;

-- Ver investidores
SELECT investor_id, email, full_name FROM investors;

-- Ver solicitações de crédito
SELECT request_id, amount_requested, status FROM credit_requests;

-- Ver carteiras
SELECT wallet_id, owner_type, currency, balance FROM wallets;
```

## 📚 Próximos Passos

1. ✅ Testar autenticação na interface Swagger (http://localhost/docs)
2. ✅ Explorar banco de dados
3. ✅ Implementar lógica de negócio dos outros endpoints
4. ✅ Conectar frontend (quando estiver pronto)
5. ✅ Adicionar testes automatizados

## 🆘 Suporte

Em caso de problemas:

1. Verificar logs: `docker-compose logs -f`
2. Verificar containers: `docker-compose ps`
3. Reset completo: `docker-compose down -v && docker-compose up -d`
4. Consultar documentação: `backend/README.md`

## 📞 Contato

- GitHub: [@thiagomes07](https://github.com/thiagomes07)
- Repositório: https://github.com/thiagomes07/inovacamp

---

**Tempo estimado de setup**: 2-5 minutos ⚡

**Status**: ✅ Pronto para uso em PoC

**Última atualização**: Outubro 2025
