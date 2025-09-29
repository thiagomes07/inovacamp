# Requisitos Não-Funcionais

Estes são os atributos de qualidade que definem o padrão de excelência da nossa plataforma.

## 1. Segurança

A segurança é o pilar central da nossa solução.
-   **Autenticação e Autorização:** Uso de JWT (JSON Web Tokens) para todas as sessões de API e autenticação de dois fatores (2FA) para operações sensíveis.
-   **Criptografia:** Criptografia de ponta-a-ponta (HTTPS/TLS 1.3) para dados em trânsito. Dados sensíveis em repouso (banco de dados) serão criptografados usando AES-256.
-   **Prevenção a Fraudes:** Integração com o motor de risco da QI Tech e validações em tempo real para identificar e bloquear atividades suspeitas.
-   **Imutabilidade:** Uso de blockchain para registrar todas as transações de empréstimo e pagamento, criando uma trilha de auditoria inviolável.

## 2. Escalabilidade

A arquitetura foi projetada para crescer de forma horizontal e sustentável.
-   **Arquitetura de Microsserviços:** O backend será dividido em serviços independentes (ex: Contas, Empréstimos, Notificações), permitindo que cada um escale de forma autônoma.
-   **Cloud Native:** A solução será implantada em nuvem (AWS/GCP/Azure), utilizando serviços gerenciados como Kubernetes (EKS/GKE) e bancos de dados (RDS/Cloud SQL) que suportam escalabilidade automática.
-   **Estimativa:** A plataforma deve suportar 100.000 usuários ativos no primeiro ano, com picos de 1.000 transações por minuto.

## 3. Performance

A experiência do usuário depende de uma plataforma ágil.
-   **Tempo de Resposta:** As APIs críticas (ex: consulta de saldo, simulação) devem responder em menos de 200ms.
-   **Processamento Assíncrono:** Operações demoradas (ex: geração de relatórios, processamento em lote) serão executadas em background usando filas de mensagens (RabbitMQ/SQS) para não travar a interface do usuário.

## 4. Usabilidade e Acessibilidade

-   **Interface Intuitiva:** O design será limpo e focado na simplicidade, seguindo a identidade visual da QI Tech.
-   **Acessibilidade:** O frontend seguirá as diretrizes do WCAG 2.1 para garantir que a plataforma possa ser usada por pessoas com diferentes necessidades.
-   **Chat com LLM:** O assistente virtual deve simplificar operações e tornar a plataforma mais acessível para usuários com menos familiaridade tecnológica.
