# Jornada do Usuário

Ilustramos abaixo os fluxos de interação dos principais atores com a plataforma.

## 1. Fluxo de Onboarding (Cadastro)

Este fluxo descreve como um novo usuário se cadastra e tem sua identidade validada.

```mermaid
graph TD
    A[Acessa a plataforma] --> B{Já possui conta?};
    B -- Não --> C[Preenche formulário de cadastro];
    C --> D[Envia documentos para verificação (KYC)];
    D --> E[Sistema de Antifraude analisa os dados];
    E --> F{Verificação Aprovada?};
    F -- Sim --> G[Conta criada e carteira ativada];
    F -- Não --> H[Notifica usuário sobre o problema];
    B -- Sim --> I[Faz login];
```

## 2. Fluxo de Solicitação de Empréstimo (Tomador)

Este fluxo mostra a jornada de um usuário que precisa de crédito.

```mermaid
graph TD
    A[Usuário logado] --> B[Simula empréstimo no app ou via chat];
    B --> C[Solicita o empréstimo e fornece informações adicionais];
    C --> D[Motor de IA calcula o score de crédito];
    D --> E{Score Aprovado?};
    E -- Sim --> F[Oportunidade é listada no marketplace para investidores];
    F --> G{Empréstimo 100% financiado?};
    G -- Sim --> H[Valor é creditado na carteira do tomador];
    G -- Não --> I[Solicitação expira após X dias];
    E -- Não --> J[Notifica usuário sobre a recusa];
```

## 3. Fluxo de Investimento (Investidor)

Este fluxo descreve como um investidor aloca seu capital.

```mermaid
graph TD
    A[Investidor logado] --> B[Acessa o marketplace de empréstimos];
    B --> C[Filtra e seleciona uma oportunidade];
    C --> D[Analisa o perfil de risco do tomador];
    D --> E[Decide investir e informa o valor];
    E --> F{Saldo em carteira suficiente?};
    F -- Sim --> G[Valor é reservado e transferido quando o empréstimo é 100% financiado];
    G --> H[Começa a receber as parcelas mensalmente];
    F -- Não --> I[Solicita depósito em carteira];
```