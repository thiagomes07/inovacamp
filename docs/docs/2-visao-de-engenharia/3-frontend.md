
# Frontend

**Demo Live:** [http://swapin-inovacamp.s3-website-us-east-1.amazonaws.com/](http://swapin-inovacamp.s3-website-us-east-1.amazonaws.com/)

*Observação: A demonstração é um protótipo web publicado. Para uma experiência ideal, recomenda-se navegar utilizando as ferramentas de desenvolvedor do seu navegador para simular um dispositivo móvel.*



## **Funcionalidades e Fluxos da Plataforma**

A plataforma foi projetada para atender a dois perfis de usuários distintos, com jornadas e ferramentas específicas para cada necessidade.

### **1. Borrower (Tomador de Crédito)**

A jornada do tomador é projetada para ser ágil e intuitiva, iniciando com o cadastro e verificação de identidade (KYC), passando pela solicitação de crédito, recebimento e análise de ofertas, até o aceite, desembolso dos fundos e o posterior pagamento das parcelas.

**Funcionalidades Principais:**

  - **Dashboard Multi-moeda:** Visualização consolidada de saldos em BRL, USDT, USDC e EUR.
  - **Solicitação de Crédito Simplificada:** Um processo guiado com análise de risco automatizada por IA, que considera fontes de dados tradicionais e alternativas para compor um score de crédito mais justo.
  - **Gestão de Empréstimos:** Acompanhamento detalhado de parcelas, juros e histórico de pagamentos, com opções de pagamento antecipado e renegociação.
  - **Integração com PIX:** Funções nativas para enviar, receber e gerar QR codes, garantindo liquidez instantânea.
  - **Currency Swap:** Ferramenta para conversão entre moedas fiduciárias e stablecoins em tempo real, diretamente na plataforma.
  - **Múltiplos Canais de Depósito:** Flexibilidade para adicionar fundos via PIX, TED, Open Finance ou transferência de criptoativos.

### **2. Lender (Investidor)**

O investidor realiza seu cadastro e KYC, analisa as oportunidades de investimento disponíveis no marketplace, aloca seu capital e, por fim, monitora o desempenho de seu portfólio e recebe os retornos de forma automatizada.

**Funcionalidades Principais:**

  - **Dashboard de Investimentos:** Visão completa do portfólio, com analytics detalhados sobre rentabilidade, risco e diversificação.
  - **Análise Detalhada de Risco:** Ferramentas para avaliar o perfil de crédito dos tomadores com base em um score holístico, garantias registradas em blockchain e dados transparentes.
  - **Criação de Pools de Investimento:** Opção de criar ou participar de fundos coletivos para financiar empréstimos, permitindo a diversificação do capital e a mitigação de riscos.
  - **Gestão de Risco Automatizada:** Mecanismos para diversificação automática do investimento com base no score de crédito dos tomadores.
  - **Recebimento de Retornos Passivos:** Acompanhamento em tempo real e recebimento automático dos juros pagos pelos tomadores.

### **3. Fluxos Essenciais do Ecossistema**

  - **Onboarding Unificado e Automatizado:** Um fluxo único para ambos os perfis, que guia o usuário desde a criação da conta até a conclusão do processo de verificação (KYC), utilizando reconhecimento facial e validação de documentos por IA para agilidade e segurança.
  - **Matching Inteligente de Crédito:** O núcleo da plataforma conecta tomadores e investidores através de um algoritmo que considera o perfil de risco, a capacidade de pagamento e as condições do empréstimo. Múltiplos investidores podem financiar um único empréstimo através dos pools coletivos.
  - **Sistema Bancário Integrado:** A plataforma oferece funcionalidades financeiras completas, incluindo transações via PIX, depósitos multi-canal e conversão instantânea de moedas, proporcionando uma experiência bancária fluida e completa.

-----

## **Arquitetura de Código e Estrutura de Navegação**

A base de código é organizada por features, promovendo a modularidade e a escalabilidade do projeto.

```
src/
├── App.tsx                  # Roteador principal (40+ telas)
├── components/
│   ├── AppProvider.tsx      # Contexto global (734 linhas)
│   ├── [ONBOARDING]/        # 8 telas: Splash → KYC → Completo
│   ├── [HOME]/              # HomeTomador + HomeInvestidor
│   ├── [CREDITO]/           # FluxoSolicitacaoCredito + GestaoEmprestimos
│   ├── [SWAP]/              # SwapScreen + CurrencySwap
│   ├── [PIX]/               # 7 telas: Enviar, Receber, QR, Scanner
│   ├── [POOLS]/             # Wizard 4 passos: Criar → Financiar → Distribuir → Confirmar
│   ├── [PORTFOLIO]/         # Análises + Detalhes + Filtros
│   ├── [DEPOSITO]/          # 8 telas: Open Finance + Autenticação Bancária
│   ├── [CONFIG]/            # Perfil + Segurança + Configurações
│   ├── ui/                  # Design System ShadCN
│   └── utils/               # geradorRecibo + utilitariosCompartilhar
├── styles/globals.css       # Tokens de design + Glassmorphism
└── guidelines/Guidelines.md # Diretrizes de desenvolvimento
```

-----

## **Design System & Experiência do Usuário**

### **Identidade Visual**

  - **Paleta de Cores:** Um gradiente que transita entre azul-escuro e verde-esmeralda, estabelecendo uma identidade visual moderna e confiável.
    ```css
    --swapin-gradient-start: #1e3a8a;   /* Azul-900 */
    --swapin-gradient-middle: #0f172a;  /* Ardósia-900 */
    --swapin-gradient-end: #064e3b;     /* Esmeralda-900 */
    --swapin-green: #10b981;           /* Cor principal da marca */
    --background: #0a1628;             /* Azul profundo escuro */
    ```
  - **Glassmorphism:** Uso de cards translúcidos com efeito de desfoque para criar profundidade e hierarquia visual.
  - **Animações e Transições:** Movimentos suaves entre telas para uma experiência de navegação fluida.
  - **Responsividade:** Construído com a filosofia Mobile-First, garantindo perfeita adaptação a telas maiores.

### **Estados de Interface**

  - **Loading:** Utilização de *skeleton screens* e *spinners* para indicar processamento de dados.
  - **Empty States:** Ilustrações e chamadas para ação (CTAs) claras quando não há dados a serem exibidos.
  - **Error Handling:** Mensagens de erro contextualizadas com ações de recuperação para o usuário.
  - **Success Feedback:** Confirmações visuais e celebrações para ações bem-sucedidas.

### **Navegação**

  - **Bottom Navigation:** Acesso rápido às seções principais (Home, Swap, Config) de forma persistente.
  - **Screen-based Routing:** Gerenciamento centralizado de estado para mais de 40 telas.
  - **Breadcrumbs:** Indicadores de localização em fluxos complexos para orientar o usuário.

-----

## **Integração com Backend**

### **Consumo de APIs**

  - **Autenticação:** Gerenciamento de tokens JWT com mecanismo de atualização automática.
  - **Real-time:** Uso de WebSockets para notificações e atualizações de dados em tempo real.
  - **Offline-first:** Implementação de cache local com sincronização para garantir funcionalidade em cenários de conectividade limitada.
  - **Error Handling:** Estratégia de *retry* automático e *fallbacks* para requisições que falham.

### **Fluxos de Dados**

  - **Estado Global:** Utilização da Context API para dados compartilhados entre componentes.
  - **Cache:** Otimização de performance através do cache de requisições repetidas.
  - **Validação:** Validação dos dados no lado do cliente (client-side) antes do envio para a API.

### **API Client**

  - **Auth:** `/api/auth/*` (login, register, verify)
  - **KYC:** `/api/kyc/*` (facial, documents, validation)
  - **Credit:** `/api/credit/*` (request, approve, manage)
  - **PIX:** `/api/pix/*` (keys, send, receive, qr)
  - **Swap:** `/api/swap/*` (rates, execute, history)
  - **Portfolio:** `/api/portfolio/*` (analytics, loans, stats)

-----

## **Considerações de Implementação**

### **Performance**

  - **Code Splitting:** Divisão de código por rotas e features para carregar apenas o necessário.
  - **Lazy Loading:** Carregamento tardio de componentes pesados para otimizar o tempo de inicialização.
  - **Otimização de Imagens:** Compressão de imagens e uso de fallbacks.
  - **Bundle Size:** Análise e otimização do tamanho final do pacote para carregamento rápido em redes móveis.

### **Segurança**

  - **Sanitização de Inputs:** Tratamento de todas as entradas do usuário para prevenir ataques (XSS).
  - **Validação de Dados:** Verificação rigorosa dos dados antes de qualquer requisição à API.
  - **Gerenciamento de Tokens:** Armazenamento seguro e expiração automática de tokens de sessão.

### **Acessibilidade**

  - **Compatibilidade com Leitores de Tela:** Estrutura semântica do HTML para garantir a leitura correta.
  - **Navegação por Teclado:** Suporte completo para navegação sem o uso do mouse.
  - **Contraste de Cores:** Adesão às diretrizes de contraste para garantir a legibilidade.
  - **Escalabilidade de Fontes:** Fontes responsivas que se adaptam às preferências do usuário.

### **Escalabilidade**

  - **Arquitetura Modular:** Separação por features que permite o desenvolvimento e manutenção independentes.
  - **Componentes Reutilizáveis:** Criação de um sistema de componentes padronizados para consistência e agilidade.
  - **Abstração da API:** Centralização da lógica de comunicação com o backend para facilitar futuras manutenções.