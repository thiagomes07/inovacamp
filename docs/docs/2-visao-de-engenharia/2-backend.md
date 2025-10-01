# Backend e Blockchain

## 1. Microsserviços Principais

-   **Serviço de Contas:** Responsável pelo cadastro de usuários (KYC), gerenciamento de carteiras digitais (saldo, extrato) e autenticação.
-   **Serviço de Empréstimos:** Orquestra todo o ciclo de vida de um empréstimo: solicitação, listagem no marketplace, investimento, liberação de fundos e processamento de parcelas.
-   **Serviço de IA (Score):** Expõe um endpoint que recebe os dados de um usuário e retorna seu score de crédito e um rating de risco (A, B, C).
-   **Serviço de Notificações:** Envia e-mails, push notifications e mensagens de chat sobre o status das operações.

## 2. Contratos Inteligentes (Smart Contracts) na Blockchain

A interação com a blockchain será feita através de um conjunto de Smart Contracts.

-   **`LoanMarketplace.sol`:**
    -   `function createLoan(address borrower, uint256 amount, uint256 interestRate)`: Cria uma nova proposta de empréstimo no marketplace.
    -   `function invest(uint256 loanId, uint256 amount)`: Permite que um investidor financie parte ou o total de um empréstimo.
    -   `function executeLoan(uint256 loanId)`: Chamado quando o empréstimo é 100% financiado para liberar os fundos.

-   **`PaymentLedger.sol`:**
    -   `function recordPayment(uint256 loanId, uint256 installmentNumber)`: Registra o pagamento de uma parcela, criando uma prova imutável.

## 3. Exemplo de Endpoints da API (RESTful)

-   `POST /users`: Cria um novo usuário.
-   `POST /sessions`: Realiza o login.
-   `GET /wallet/balance`: Retorna o saldo da carteira do usuário autenticado.
-   `POST /loans/simulate`: Simula um empréstimo.
-   `POST /loans`: Cria uma nova solicitação de empréstimo.
-   `GET /marketplace/loans`: Lista as oportunidades de investimento.
-   `POST /marketplace/loans/{loanId}/invest`: Realiza um investimento.
```