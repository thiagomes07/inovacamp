# 🐳 DOCKER COMMANDS CHEATSHEET - INOVACAMP

## 📦 Comandos Básicos

### Iniciar todos os serviços
```powershell
docker-compose up -d
```

### Parar todos os serviços
```powershell
docker-compose down
```

### Parar e remover volumes (reset completo)
```powershell
docker-compose down -v
```

### Ver status dos containers
```powershell
docker-compose ps
```

### Ver logs de todos os serviços
```powershell
docker-compose logs -f
```

---

## 📝 Logs

### Backend
```powershell
docker-compose logs -f backend
```

### Banco de dados
```powershell
docker-compose logs -f db
```

### Nginx
```powershell
docker-compose logs -f nginx
```

### Últimas 100 linhas
```powershell
docker-compose logs --tail=100 backend
```

---

## 🔄 Rebuild & Restart

### Rebuild sem cache
```powershell
docker-compose build --no-cache
```

### Rebuild e subir
```powershell
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

### Restart de um serviço específico
```powershell
docker-compose restart backend
docker-compose restart db
docker-compose restart nginx
```

### Restart de todos
```powershell
docker-compose restart
```

---

## 🖥️ Acessar Containers

### Entrar no container do backend
```powershell
docker exec -it inovacamp_backend bash
```

### Entrar no container do MySQL
```powershell
docker exec -it inovacamp_db bash
```

### Entrar no container do Nginx
```powershell
docker exec -it inovacamp_nginx sh
```

---

## 💾 Banco de Dados

### Conectar ao MySQL via CLI
```powershell
docker exec -it inovacamp_db mysql -u root -pinovacamp_secure_password_2024 inovacamp_db
```

### Backup do banco de dados
```powershell
docker exec inovacamp_db mysqldump -u root -pinovacamp_secure_password_2024 inovacamp_db > backup.sql
```

### Restaurar backup
```powershell
Get-Content backup.sql | docker exec -i inovacamp_db mysql -u root -pinovacamp_secure_password_2024 inovacamp_db
```

### Executar script SQL
```powershell
Get-Content script.sql | docker exec -i inovacamp_db mysql -u root -pinovacamp_secure_password_2024 inovacamp_db
```

### Queries úteis no MySQL
```sql
-- Ver todas as tabelas
SHOW TABLES;

-- Ver estrutura de uma tabela
DESCRIBE users;

-- Ver usuários cadastrados
SELECT user_id, email, full_name, credit_score FROM users;

-- Ver investidores
SELECT investor_id, email, full_name FROM investors;

-- Ver solicitações de crédito
SELECT request_id, amount_requested, status FROM credit_requests;

-- Ver carteiras
SELECT wallet_id, owner_type, currency, balance FROM wallets;

-- Ver transações
SELECT transaction_id, type, amount, currency, status FROM transactions;

-- Limpar todas as tabelas (CUIDADO!)
SET FOREIGN_KEY_CHECKS = 0;
TRUNCATE TABLE transactions;
TRUNCATE TABLE loan_payments;
TRUNCATE TABLE loans;
TRUNCATE TABLE pool_loans;
TRUNCATE TABLE pool_investments;
TRUNCATE TABLE pools;
TRUNCATE TABLE wallets;
TRUNCATE TABLE credit_requests;
TRUNCATE TABLE investors;
TRUNCATE TABLE users;
SET FOREIGN_KEY_CHECKS = 1;
```

---

## 🔍 Inspeção e Debug

### Ver informações detalhadas de um container
```powershell
docker inspect inovacamp_backend
docker inspect inovacamp_db
docker inspect inovacamp_nginx
```

### Ver uso de recursos
```powershell
docker stats
```

### Ver processos rodando em um container
```powershell
docker top inovacamp_backend
```

### Ver networks
```powershell
docker network ls
docker network inspect inovacamp_inovacamp_network
```

### Ver volumes
```powershell
docker volume ls
docker volume inspect inovacamp_mysql_data
```

---

## 🗑️ Limpeza

### Remover containers parados
```powershell
docker container prune
```

### Remover imagens não utilizadas
```powershell
docker image prune
```

### Remover volumes não utilizados
```powershell
docker volume prune
```

### Remover tudo não utilizado
```powershell
docker system prune -a --volumes
```

### Limpeza específica do projeto
```powershell
docker-compose down -v --rmi all
```

---

## 🔧 Troubleshooting

### Container não inicia
```powershell
# Ver logs para identificar erro
docker-compose logs backend

# Remover e recriar
docker-compose down
docker-compose up -d
```

### Porta já em uso
```powershell
# Ver processos usando a porta
netstat -ano | findstr :80
netstat -ano | findstr :3306

# Matar processo (substitua PID)
taskkill /PID <PID> /F

# Ou mudar porta no docker-compose.yml
```

### Backend não conecta ao banco
```powershell
# Verificar se MySQL está healthy
docker-compose ps

# Ver logs do MySQL
docker-compose logs db

# Restart do backend
docker-compose restart backend

# Se necessário, reset completo
docker-compose down -v
docker-compose up -d
```

### Banco de dados corrompido
```powershell
# Reset completo (APAGA TODOS OS DADOS)
docker-compose down -v
docker-compose up -d
```

### Nginx retorna 502
```powershell
# Verificar se backend está rodando
docker-compose ps

# Ver logs do nginx
docker-compose logs nginx

# Ver logs do backend
docker-compose logs backend

# Testar backend diretamente
curl http://localhost:8000/health
```

### Problemas de permissão (Linux/Mac)
```bash
# Dar permissões corretas
sudo chown -R $USER:$USER .
```

---

## 🚀 Comandos Avançados

### Escalar serviço (múltiplas instâncias)
```powershell
docker-compose up -d --scale backend=3
```

### Ver configuração compilada do docker-compose
```powershell
docker-compose config
```

### Pausar e despausar containers
```powershell
docker-compose pause
docker-compose unpause
```

### Forçar recriação de containers
```powershell
docker-compose up -d --force-recreate
```

### Executar comando em container sem entrar
```powershell
docker exec inovacamp_backend python -c "print('Hello')"
```

### Copiar arquivos para/de container
```powershell
# Do host para container
docker cp arquivo.txt inovacamp_backend:/app/

# Do container para host
docker cp inovacamp_backend:/app/arquivo.txt .
```

---

## 📊 Monitoramento

### Ver logs em tempo real com filtro
```powershell
docker-compose logs -f | Select-String "ERROR"
docker-compose logs -f backend | Select-String "POST"
```

### Ver últimas N linhas de log
```powershell
docker-compose logs --tail=50 backend
```

### Ver logs com timestamp
```powershell
docker-compose logs -t backend
```

### Health check manual
```powershell
# API
curl http://localhost/health

# MySQL
docker exec inovacamp_db mysqladmin ping -h localhost -u root -pinovacamp_secure_password_2024

# Nginx
curl -I http://localhost
```

---

## 🔐 Segurança

### Ver portas expostas
```powershell
docker-compose ps
docker port inovacamp_backend
docker port inovacamp_db
docker port inovacamp_nginx
```

### Verificar vulnerabilidades da imagem
```powershell
docker scan inovacamp_backend
```

---

## 💡 Dicas Úteis

### Alias úteis (adicionar ao profile do PowerShell)
```powershell
# Criar arquivo de profile
New-Item -Path $PROFILE -ItemType File -Force

# Editar profile
notepad $PROFILE

# Adicionar aliases
function dcup { docker-compose up -d }
function dcdown { docker-compose down }
function dclogs { docker-compose logs -f }
function dcps { docker-compose ps }
function dcrestart { docker-compose restart }
```

### Comando único para reset completo e teste
```powershell
docker-compose down -v; docker-compose up -d; Start-Sleep -Seconds 15; python backend/test_api.py
```

### Verificação rápida de saúde
```powershell
docker-compose ps; curl http://localhost/health
```

---

## 📖 Documentação Oficial

- [Docker Docs](https://docs.docker.com/)
- [Docker Compose Docs](https://docs.docker.com/compose/)
- [Docker CLI Reference](https://docs.docker.com/engine/reference/commandline/cli/)

---

**Última atualização**: Outubro 2025
