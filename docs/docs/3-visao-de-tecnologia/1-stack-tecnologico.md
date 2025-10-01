# Tecnologia

As tecnologias foram selecionadas considerando dois cenários distintos: **PoC (Hackathon)** para validação rápida em menos de 4 dias, e **MVP** para uma aplicação produtizável com foco em performance, escalabilidade e maturidade.

| Categoria | PoC (Hackathon) | MVP (Produção) | Justificativa |
| :--- | :--- | :--- | :--- |
| **Frontend Web** | React com TypeScript + Tailwind CSS | Next.js com TypeScript + Tailwind CSS | **PoC:** React puro oferece setup rápido e flexibilidade máxima para prototipação. **MVP:** Next.js adiciona SSR/SSG para SEO, otimização automática de performance e segurança adicional com componentes server-side. |
| **Frontend Mobile** | Responsivo via web app | Flutter + Swift/Kotlin (apps nativos) | **PoC:** APP WEB permite reutilizar código web e deploy instantâneo. **MVP:** Apps nativos garantem melhor performance, acesso a APIs do sistema e experiência premium. |
| **Backend** | Python + FastAPI | Go / .NET Core / Spring Boot | **PoC:** Python com FastAPI oferece desenvolvimento rápido e integração natural com IA. **MVP:** Linguagens compiladas (Go, C#, Java) entregam performance superior e maior robustez para alto volume transacional. |
| **Banco de Dados** | MySQL | PostgreSQL + particionamento | **PoC:** MySQL atende requisitos básicos com configuração simples. **MVP:** PostgreSQL oferece tipos complexos, JSONB, full-text search e melhor handling de concorrência para escala. |
| **Cache** | Não utilizado | Redis Cluster | **PoC:** Não necessário para volume reduzido. **MVP:** Redis essencial para cache de sessões, rate limiting e redução de carga no banco. |
| **Blockchain** | Solana (Devnet) | Polygon PoS + Ethereum (Mainnet) | **PoC:** Solana oferece gas fees extremamente baixas (~$0.00025/tx) e alta velocidade, ideal para testes. **MVP:** Polygon para operações frequentes com baixo custo, Ethereum para ativos de maior valor e compatibilidade EVM ampla. |
| **Smart Contracts** | Rust (Solana Programs) | Solidity (EVM) | **PoC:** Rust para desenvolvimento Solana. **MVP:** Solidity como padrão de mercado para redes EVM, maior pool de auditores e ferramentas de segurança. |
| **Inteligência Artificial** | Python + Scikit-learn / LightGBM | Python + TensorFlow / PyTorch + MLflow | **PoC:** Modelos clássicos de ML são suficientes e rápidos de treinar. **MVP:** Deep Learning para análise mais sofisticada, MLflow para versionamento e governança de modelos. |
| **Validação de Identidade** | Upload de foto simples | FaceTec (liveness detection) | **PoC:** Validação visual básica para demonstração. **MVP:** FaceTec oferece detecção de vivacidade 3D e anti-spoofing certificado. |
| **Open Finance** | Dados mockados (JSON estático) | Integração com APIs oficiais (Pluggy, Belvo) | **PoC:** Mocks controlados aceleram desenvolvimento e evitam dependências externas. **MVP:** Integração real com agregadores de Open Finance para dados bancários autênticos. |
| **Gateway de Pagamento** | Mock de PIX | Integração QI Tech API + providers de PIX | **PoC:** Simulação de fluxo completo. **MVP:** Integração real com rails de pagamento e APIs da QI Tech para liquidação. |
| **Infraestrutura** | Docker + Docker Compose | Kubernetes (EKS) + Helm Charts | **PoC:** Docker Compose orquestra serviços localmente com simplicidade. **MVP:** K8s permite auto-scaling, self-healing e deployment declarativo. |
| **Cloud Provider** | AWS (ECS, RDS, S3) | Multi-cloud (AWS + GCP/Azure) | **PoC:** AWS com serviços gerenciados básicos (ECS para containers, RDS para banco, S3 para arquivos). **MVP:** Estratégia multi-cloud evita vendor lock-in, AWS EKS + CloudFront + RDS Aurora, GCP para serviços de IA (Vertex AI), failover geográfico. |
| **Observabilidade** | Logs básicos (stdout) | Prometheus + Grafana + Datadog + Sentry | **PoC:** Logs em console são suficientes. **MVP:** Stack completa de métricas, traces distribuídos e alertas para SLA. |
| **CI/CD** | GitHub Actions (deploy manual) | GitHub Actions + ArgoCD + Terraform | **PoC:** Pipeline simples de build e deploy. **MVP:** GitOps com ArgoCD, IaC com Terraform, ambientes isolados e blue-green deployments. |
