# Frontend

O frontend será uma Single Page Application (SPA) desenvolvida com foco em reusabilidade e experiência do usuário.

## 1. Arquitetura de Componentes

A interface será construída com base em um **Design System** de componentes reutilizáveis.

-   **Componentes Atômicos:** Elementos básicos como `Button`, `Input`, `Avatar`.
-   **Componentes de Molécula:** Combinações de átomos, como `SearchForm` (um `Input` + um `Button`).
-   **Componentes de Organismo:** Seções completas da UI, como `LoanCard` (que mostra os detalhes de um empréstimo) ou `Header`.
-   **Templates:** Estruturas de página que organizam os organismos.
-   **Páginas:** Instâncias dos templates com dados reais (ex: a página do Marketplace).

## 2. Estrutura de Pastas (Exemplo)

```
src/
├── components/   # Componentes reutilizáveis (átomos, moléculas)
├── features/     # Lógica e componentes de features específicas
│   ├── auth/
│   ├── wallet/
│   └── marketplace/
├── hooks/        # Hooks customizados (ex: useAuth, useApi)
├── pages/        # As páginas da aplicação
├── services/     # Lógica de chamada de API
├── store/        # Gerenciamento de estado global (Redux/Zustand)
└── styles/       # Estilos globais e tema
```

## 3. Gerenciamento de Estado

-   **Estado Global:** Usaremos uma biblioteca como **Zustand** ou **Redux Toolkit** para gerenciar dados que são compartilhados por toda a aplicação, como informações do usuário autenticado e saldo da carteira.
-   **Estado Local:** O estado de componentes individuais (ex: o que está digitado em um formulário) será gerenciado localmente com os hooks `useState` e `useReducer` do React.
-   **Estado de Servidor:** Usaremos **React Query** ou **SWR** para gerenciar o ciclo de vida de dados vindos da API (caching, revalidação, etc.), melhorando a performance e a experiência do usuário.