# Mecanismos de Inovação

Esta seção aprofunda os três pilares tecnológicos que diferenciam nossa solução.

## 1. Mecanismo de Score de Crédito (IA)

O coração do nosso sistema de risco é um modelo de Machine Learning.

-   **Objetivo:** Prever a probabilidade de inadimplência de um solicitante de crédito.
-   **Fontes de Dados (Features):**
    -   **Dados Cadastrais:** Idade, região, etc.
    -   **Dados Financeiros:** Renda declarada, consulta a birôs de crédito (com consentimento).
    -   **Dados Alternativos:** Informações de uso da plataforma, dados de Open Finance (com consentimento).
-   **Modelo:** Um modelo de Gradient Boosting (como LightGBM ou XGBoost) será treinado para classificar os clientes.
-   **Output:** O modelo gera uma probabilidade (0 a 1) que é convertida em:
    -   **Score (0-1000):** Para visualização do usuário.
    -   **Rating (AAA a D):** Para simplificar a decisão do investidor.
-   **Monitoramento:** O modelo será constantemente monitorado para identificar *drift* (mudança de comportamento dos dados) e retreinado periodicamente.

## 2. Mecanismo Antifraude

A prevenção a fraudes ocorre em duas etapas:

-   **Onboarding:** Durante o cadastro, utilizamos serviços de validação de documentos (documentoscopia) e prova de vida (liveness check) para garantir que o usuário é quem diz ser.
-   **Transacional:** Um sistema de regras em tempo real monitora as transações. Se uma transação foge do padrão de uso do cliente (ex: um saque de valor muito alto em uma localização incomum), ela é bloqueada e exige uma segunda validação (2FA).

## 3. Interação P2P com Blockchain

A blockchain atua como um "cartório digital" para as operações de crédito.

-   **Fluxo de uma Transação:**
    1.  Quando um empréstimo é 100% financiado, o **Serviço de Empréstimos** chama a função `executeLoan` no Smart Contract.
    2.  O Smart Contract emite um evento `LoanExecuted`, registrando on-chain que o empréstimo entre as partes (representadas por seus endereços de carteira) foi iniciado.
    3.  Mensalmente, quando o tomador paga uma parcela, o backend chama a função `recordPayment`.
    4.  O Smart Contract emite um evento `PaymentRecorded`, criando um registro imutável do pagamento.
-   **Benefício:** Qualquer pessoa pode auditar o histórico de transações na blockchain, garantindo máxima transparência sobre o fluxo de capital.