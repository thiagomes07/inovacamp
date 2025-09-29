# Infraestrutura, DevOps e Estimativa de Custos

## 1. Arquitetura de Nuvem (AWS)

O diagrama abaixo ilustra a infraestrutura proposta na AWS.

```mermaid
graph TD
    subgraph "Usuários"
        A[Navegador/App]
    end

    subgraph "AWS Cloud"
        B[Route 53] -- "DNS" --> C[CloudFront (CDN)];
        C -- "Distribui conteúdo estático de" --> D[(S3 Bucket)];
        C -- "Encaminha requisições para" --> E[Application Load Balancer];
        
        subgraph "VPC"
            E -- "Balanceia carga para" --> F[Cluster Kubernetes (EKS)];
            
            subgraph "EKS Cluster"
                G[Microsserviço Contas];
                H[Microsserviço Empréstimos];
                I[Microsserviço IA];
            end

            F -- "Acessam" --> J[(RDS - PostgreSQL)];
            F -- "Acessam" --> K[(ElastiCache - Redis)];
        end
    end

    A --> B;

    style D fill:#fca311
    style J fill:#14213d,color:#fff
    style K fill:#14213d,color:#fff
```

## 2. DevOps e CI/CD

-   **Repositório:** GitHub para versionamento do código.
-   **CI/CD:** GitHub Actions para automação de testes, build das imagens Docker e deploy no cluster Kubernetes.
-   **Fluxo de CI/CD:**
    1.  Desenvolvedor faz um push para uma branch.
    2.  GitHub Actions executa os testes unitários e de integração.
    3.  Se os testes passam, uma imagem Docker é construída e enviada para o ECR (Elastic Container Registry).
    4.  A Action atualiza o manifesto do Kubernetes para realizar o deploy da nova versão (usando estratégias como Blue/Green ou Canary para deploy sem downtime).
-   **Monitoramento:** Prometheus e Grafana para coletar métricas de performance dos serviços e da infraestrutura. Logs serão centralizados no CloudWatch.

## 3. Estimativa de Custo Mensal (T-Shirt Sizing)

Esta é uma estimativa de alto nível para o primeiro ano de operação.

| Serviço | Configuração Estimada | Custo Mensal (USD) |
| :--- | :--- | :--- |
| **AWS EKS (Kubernetes)** | 3 nós t3.medium | ~$150 |
| **AWS RDS (PostgreSQL)** | db.t3.medium Multi-AZ | ~$100 |
| **AWS ElastiCache (Redis)** | cache.t3.small | ~$30 |
| **Application Load Balancer** | Processamento de 100GB | ~$25 |
| **CloudFront, S3, Route 53** | Tráfego de dados | ~$20 |
| **Total Estimado** | | **~$325 / mês** |

**Observação:** Este custo pode variar significativamente com o volume de uso e não inclui custos de serviços de terceiros (ex: APIs de validação de documentos, gateways de pagamento).