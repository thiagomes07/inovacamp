# Infraestrutura, DevOps e Estimativa de Custos

## Estratégia de Infraestrutura

A infraestrutura foi planejada considerando dois cenários: **PoC (Hackathon)** com foco em simplicidade e velocidade de deployment, e **MVP** preparado para produção com alta disponibilidade, escalabilidade e observabilidade.

---

## 1. DevOps e CI/CD

| Aspecto | PoC (Hackathon) | MVP (Produção) |
| :--- | :--- | :--- |
| **Repositório** | GitHub (github.com/thiagomes07/inovacamp) | GitHub + GitHub Packages (container registry) |
| **Branching** | `main` para deploys diretos | GitFlow: `main` (prod), `staging`, `develop`, feature branches |
| **CI/CD** | GitHub Actions com deploy manual | GitHub Actions + ArgoCD (GitOps) |
| **Testes** | Smoke tests básicos | Unit + Integration + E2E (Cypress) + Security scans (Snyk, Trivy) |
| **Build** | Docker build simples | Multi-stage builds otimizados, cache de layers, SBOM generation |
| **Deploy** | Push direto via AWS CLI/Console | Blue/Green deployments via ArgoCD, rollback automático |
| **IaC** | Não utilizado | Terraform para toda infraestrutura AWS + Helm Charts para K8s |
| **Secrets** | Variáveis de ambiente (.env) | AWS Secrets Manager + External Secrets Operator no K8s |
| **Ambientes** | 1 ambiente (produção) | 3 ambientes isolados (dev, staging, prod) |

---

## 2. Observabilidade e Monitoramento

| Ferramenta | PoC (Hackathon) | MVP (Produção) |
| :--- | :--- | :--- |
| **Logs** | stdout (console) | CloudWatch + Loki + estruturação JSON |
| **Métricas** | Não utilizado | Prometheus + Grafana |
| **APM** | Não utilizado | Datadog APM |
| **Erros** | Não utilizado | Sentry |
| **Uptime** | Manual | UptimeRobot + PagerDuty |
| **SLA** | N/A | 99.9% de uptime, RTO < 1h, RPO < 15min |

---

## 3. Segurança

| Camada | PoC (Hackathon) | MVP (Produção) |
| :--- | :--- | :--- |
| **Autenticação** | JWT simples | OAuth 2.0 + MFA |
| **Criptografia** | HTTPS | TLS 1.3, certificados ACM, criptografia at-rest (KMS) |
| **Firewall** | Security Groups básicos | AWS WAF com regras OWASP, rate limiting |
| **DDoS** | AWS Shield Standard | AWS Shield Advanced + CloudFront |
| **Compliance** | Não aplicável | LGPD: anonimização, direito ao esquecimento |
| **Auditoria** | Não aplicável | CloudTrail + GuardDuty |
| **Secrets** | `.env` file | AWS Secrets Manager com rotação automática |

---

## 4. Estimativa de Custos Mensais

### PoC (Hackathon)

**Arquitetura:** Aplicação completa (backend FastAPI, frontend React, banco MySQL) rodando como containers Docker em uma única instância EC2. Documentos (RG, extratos, holerites) armazenados no S3.

| Serviço | Configuração | Custo Mensal (USD) |
| :--- | :--- | :--- |
| **EC2** | 1x t3.medium (4GB RAM, 2 vCPUs) | $30 |
| **S3** | 50GB para documentos | $1.50 |
| **Elastic IP** | 1 IP fixo | $3.60 |
| **Data Transfer** | 50GB outbound | $4.50 |
| **Solana Devnet** | Gas fees gratuitos para testes | $0 |
| **Total Estimado** | | **~$40/mês** |

**Capacidade Estimada da PoC:**
- **Usuários simultâneos:** ~50-100
- **Usuários cadastrados:** ~500-1.000
- **Transações blockchain/dia:** ~200-500
- **Storage de documentos:** Até 50GB (~5.000 documentos de 10MB)

**Nota:** Para o período do hackathon (4 dias), o custo efetivo seria de aproximadamente **$5-8**.

---

### MVP (Produção)

Para projetar uma estimativa de custos precisa para o MVP, seria necessário definir a stack final escolhida (backend em Go/Spring Boot/.NET, PostgreSQL com particionamento, Redis Cluster, etc.), dimensionar recursos com base em projeções de carga real, e planejar integrações com serviços de terceiros (FaceTec, Open Finance, blockchain providers).

**Arquitetura MVP incluiria:** Kubernetes (EKS) com Auto Scaling, Aurora PostgreSQL Multi-AZ, ElastiCache Redis Cluster, CloudFront CDN, observabilidade completa (Prometheus, Grafana, Datadog, Sentry), e políticas robustas de backup e disaster recovery.

**Estimativa preliminar:** $2.000 a $5.000/mês, dependendo das escolhas tecnológicas e volume de operação inicial.