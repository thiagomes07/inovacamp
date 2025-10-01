# Arquitetura

## Visão Arquitetural

A arquitetura foi projetada para resolver três desafios fundamentais do problema de democratização do crédito P2P global:

1. **Transparência e Imutabilidade:** Como garantir que investidores confiem nos dados de garantias e histórico de pagamentos?
2. **Análise de Risco Justa:** Como avaliar tomadores que não se encaixam nos modelos tradicionais de crédito?
3. **Liquidez Instantânea:** Como conectar investidores globais (com criptomoedas) a tomadores locais (que precisam de moeda fiduciária via transferências instantâneas)?

Nossa resposta é uma arquitetura **híbrida descentralizada** que combina blockchain para confiança, IA para inteligência de risco e uma camada de aplicação tradicional para performance.

> **Nota sobre a PoC:** Devido ao contexto de desenvolvimento acelerado (< 4 dias), a PoC será implementada como um **monólito modular em monorepo**. A arquitetura de microsserviços descrita neste documento representa a **visão final da solução** para produção e será adotada a partir do MVP. O design modular da PoC, no entanto, já seguirá os mesmos princípios de separação de responsabilidades, facilitando a futura migração para microsserviços.

---

## Arquitetura de Alto Nível

```
┌─────────────────────────────────────────────────────────────────────┐
│                        CAMADA DE APRESENTAÇÃO                        │
│  Frontend Web + Aplicações Mobile                                   │
│  • Interface unificada para Borrowers e Lenders                     │
│  • Progressive Web App para PoC / Apps nativos para MVP             │
└────────────────────────┬────────────────────────────────────────────┘
                         │ HTTPS/REST + WebSocket
┌────────────────────────┴────────────────────────────────────────────┐
│                      CAMADA DE APLICAÇÃO                             │
│  API Gateway                                                         │
│  • Rate limiting, autenticação, roteamento                          │
│                                                                      │
│  Microsserviços (Backend de Alta Performance)                       │
│  ├─ Auth & KYC Service                                              │
│  ├─ Credit Request Service                                          │
│  ├─ Wallet & Transaction Service                                    │
│  ├─ Pool Management Service                                         │
│  └─ Risk Scoring Service (IA)                                       │
│                                                                      │
│  [PoC: Módulos em monólito | MVP+: Microsserviços isolados]        │
└────────┬───────────────────┬───────────────────┬────────────────────┘
         │                   │                   │
         ▼                   ▼                   ▼
┌────────────────┐  ┌────────────────┐  ┌────────────────────────────┐
│ CAMADA DE      │  │ CAMADA DE      │  │ CAMADA BLOCKCHAIN          │
│ PERSISTÊNCIA   │  │ INTELIGÊNCIA   │  │                            │
│                │  │                │  │ Smart Contracts            │
│ Banco de Dados │  │ ML Models      │  │ • Registro de garantias    │
│ Relacional     │  │ • Credit Score │  │ • Tokenização de loans     │
│ • Users        │  │ • Fraud Detect │  │ • Distribuição automática  │
│ • Requests     │  │ • Doc Valid    │  │                            │
│ • Loans        │  │                │  │ Integrações:               │
│ • Transactions │  │ API Endpoint   │  │ • DEXs - Swap              │
│                │  │                │  │ • Oráculos de preço        │
│ Cache          │  │                │  │ • Storage descentralizado  │
│ (apenas MVP)   │  │                │  │   (hash de documentos)     │
└────────────────┘  └────────────────┘  └────────────────────────────┘
```

---

## Por Que Essa Arquitetura Resolve o Problema

### 1. Blockchain para Transparência e Confiança

**Problema:** Investidores não confiam em plataformas centralizadas que podem manipular dados de garantias ou histórico de pagamentos.

**Solução:** Smart contracts em blockchain criam uma camada de **transparência imutável**:
- Garantias são registradas on-chain com hash dos documentos validados por IA
- Cada empréstimo gera um token não-fungível que representa o contrato
- Pagamentos de parcelas são registrados de forma auditável e permanente
- Investidores podem verificar independentemente todo o histórico

**Por que funciona:** A blockchain elimina a necessidade de confiar na plataforma. O código é a lei (*code is law*), e qualquer pessoa pode auditar as transações. Isso é crítico para atrair capital internacional que não tem histórico com empresas brasileiras.

### 2. IA para Análise de Risco Holística

**Problema:** Autônomos, freelancers e PMEs possuem renda irregular e não se encaixam nos modelos de score tradicionais baseados apenas em histórico de crédito.

**Solução:** Modelo de Machine Learning que ingere **dados alternativos**:
- Extratos de plataformas de economia compartilhada → padrão de renda
- Contas de consumo (luz, telefone) → estabilidade de pagamentos
- Perfis profissionais + documentos de renda → capacidade profissional
- Open Finance → histórico bancário completo
- Demonstrativos financeiros → saúde financeira de empresas

**Por que funciona:** Modelos de ensemble learning conseguem encontrar padrões não lineares nesses dados que humanos não conseguiriam. Um motorista de aplicativo com 4 anos de histórico e alta avaliação é um bom pagador, mesmo sem carteira assinada. A IA enxerga isso através de algoritmos de classificação e árvores de decisão.

### 3. Microsserviços para Escalabilidade Independente

**Problema:** Um sistema monolítico não escala bem quando partes diferentes têm demandas diferentes.

**Solução (arquitetura final):** Arquitetura de microsserviços permite escalar componentes de forma **granular**:
- **Credit Request Service** processa muitas solicitações simultâneas → escala horizontalmente
- **Risk Scoring Service** é computacionalmente intensivo → usa instâncias otimizadas para processamento paralelo
- **Wallet Service** precisa ser ultrarrápido → tem cache agressivo
- **Pool Management** tem baixo throughput → roda em instâncias pequenas

**Implementação na PoC:** Para validar rapidamente a solução em < 4 dias, implementaremos um **monólito modular** onde cada "serviço" é um módulo isolado com suas próprias rotas, modelos e lógica de negócio. A estrutura do código já refletirá a separação de responsabilidades dos microsserviços, facilitando a migração futura.

**Por que funciona:** Em produção (MVP+), pagamos apenas pelos recursos que cada serviço precisa. Em horários de pico (ex: final do mês quando usuários pagam parcelas), escalamos apenas o serviço de pagamentos sem tocar nos outros. Isso reduz custos em 40-60% comparado a escalar tudo junto.

### 4. API Gateway como Ponto de Controle Único

**Problema:** Múltiplos microsserviços criam complexidade de autenticação, rate limiting e observabilidade.

**Solução:** API Gateway centraliza **concerns transversais**:
- Autenticação baseada em tokens validada uma vez no gateway
- Rate limiting por usuário/IP evita abuso
- Logs consolidados facilitam debugging
- Roteamento inteligente permite blue/green deploys

**Implementação na PoC:** Utilizaremos middlewares da camada de aplicação para simular as funcionalidades do API Gateway (autenticação, logging, rate limiting básico). A estrutura preparará o terreno para introdução de um gateway real no MVP.

**Por que funciona:** Evita duplicação de lógica de segurança em cada microsserviço. Um erro de segurança seria multiplicado por N serviços; centralizando, temos um ponto único de controle e auditoria.

### 5. Swap Cripto ↔ Fiat para Liquidez Global

**Problema:** Investidores globais têm stablecoins em USD, tomadores brasileiros precisam de BRL via transferências instantâneas.

**Solução:** Integração com exchanges descentralizadas + gateways de pagamento:
1. Investidor envia stablecoin para o smart contract
2. Plataforma executa swap stablecoin → BRL via DEX
3. BRL é enviado via transferência instantânea para conta do tomador em < 1 minuto

**Por que funciona:** DEXs garantem liquidez 24/7 sem intermediários bancários. Oráculos de preço protegem contra manipulação. O tomador recebe reais instantaneamente sem precisar entender de cripto, enquanto o investidor aporta em sua moeda preferida.

### 6. Banco de Dados Relacional como Fonte da Verdade Operacional

**Problema:** Blockchain é lenta e cara para dados operacionais de alta frequência.

**Solução:** **Arquitetura híbrida** onde:
- **Banco de dados relacional** armazena dados operacionais (saldos, requisições pendentes, KYC)
- **Blockchain** armazena apenas dados críticos de confiança (garantias, contratos, pagamentos finalizados)

**Por que funciona:** Melhor dos dois mundos. Queries rápidas no SQL para dashboards e analytics, imutabilidade e transparência na blockchain para dados sensíveis. Um query de "minhas solicitações de crédito" leva 50ms no banco relacional vs 5s+ na blockchain.

---

## Fluxo de Dados Crítico: Concessão de Crédito

```
1. TOMADOR solicita crédito via App
   → Frontend POST /credit/request
   → API Gateway valida autenticação + rate limit [PoC: middleware]
   → Credit Request Service salva no banco (status: pending) [PoC: módulo credit_requests]

2. IA ANALISA risco automaticamente
   → Risk Scoring Service consome documentos do storage [PoC: módulo risk_scoring]
   → Modelo ML processa features e retorna score
   → Credit Request atualizado (calculated_score: 780)

3. INVESTIDOR vê oportunidade no marketplace
   → Frontend GET /credit-requests/marketplace
   → Retorna requisições filtradas por score/risco

4. INVESTIDOR aceita e envia criptomoeda
   → Frontend POST /credit-requests/{id}/accept
   → Wallet Service recebe cripto no smart contract [PoC: módulo wallet]
   → Smart contract registra garantias on-chain (hash dos documentos)

5. SWAP automático cripto → BRL
   → Wallet Service chama DEX para swap
   → BRL resultante é enviado via transferência instantânea (gateway de pagamento)
   → Tomador recebe confirmação + saldo atualizado

6. LOAN é criado e token gerado
   → Credit Request vira Loan (status: active)
   → Smart contract emite token não-fungível do contrato de empréstimo
   → Investidor recebe NFT na wallet (prova de investimento)
```

---

## Escolhas Arquiteturais Chave e Suas Justificativas

| Desafio | Abordagem Escolhida | Por Que? |
|---------|---------------------|----------|
| **Transparência de dados** | Blockchain (rede de alta performance) | Imutabilidade, auditabilidade, descentralização eliminam necessidade de confiar na plataforma |
| **Análise de risco justa** | Machine Learning (modelos de ensemble) | Algoritmos de classificação são rápidos, interpretáveis e eficientes com dados tabulares alternativos |
| **Escalabilidade** | Microsserviços [MVP+] / Monólito Modular [PoC] | Permite escalar serviços independentemente conforme demanda específica de cada um; PoC usa estrutura modular para facilitar migração futura |
| **Liquidez global** | DEXs + Oráculos | Garantem conversão 24/7 sem intermediários, com preços justos protegidos por oráculos |
| **Performance operacional** | Banco de dados relacional | SQL é imbatível para queries complexas, joins e agregações de dados relacionais |
| **Controle de acesso** | API Gateway [MVP+] / Middlewares [PoC] | Centraliza autenticação, rate limiting e observabilidade em ponto único |
| **Validação de identidade** | IA de documentos + Biometria 3D | IA processa documentos de identidade, biometria facial previne spoofing com liveness detection 3D |

---

## Princípios Arquiteturais Fundamentais

**1. Separation of Concerns**
- Blockchain = confiança e imutabilidade
- SQL = performance operacional
- IA = inteligência de decisão
- Cada tecnologia faz o que faz melhor
- **PoC:** Separação mantida através de módulos isolados no monorepo

**2. Eventual Consistency**
- Dados críticos são sincronizados entre banco e blockchain de forma assíncrona
- Usuário não espera confirmação blockchain (50s) para ver saldo atualizado
- Reconciliação acontece em background

**3. Defense in Depth**
- Validação no frontend (UX)
- Validação no API Gateway (segurança) [PoC: middlewares]
- Validação nos microsserviços (lógica de negócio) [PoC: módulos]
- Validação nos smart contracts (regras imutáveis)

**4. Graceful Degradation**
- Se blockchain estiver lenta/offline, sistema continua funcionando
- Transações são enfileiradas e sincronizadas quando rede volta
- Usuário sempre tem resposta, mesmo que "pendente de confirmação on-chain"

---

## Estratégia de Evolução Arquitetural

### PoC (< 4 dias)
- **Monólito modular**
- Estrutura de pastas reflete microsserviços futuros
- Banco de dados relacional único
- Blockchain em rede de testes
- Deploy em servidor único

### MVP (2-4 semanas após PoC)
- **Migração gradual para microsserviços**
- Primeiro serviço extraído: Risk Scoring (alto uso de CPU)
- Segundo serviço: Wallet (alta criticidade)
- API Gateway dedicado
- Banco de dados separado por domínio
- Blockchain em rede principal

### Produção (3-6 meses)
- **Arquitetura completa de microsserviços**
- Auto-scaling por serviço
- Service mesh para observabilidade
- Multi-região para redundância
- Cache distribuído

---

## Alinhamento com o Problema de Negócio

Esta arquitetura resolve diretamente os três pontos de fricção identificados:

**Exclusão Financeira** → IA processa dados alternativos que bancos ignoram  
**Falta de Transparência** → Blockchain torna tudo auditável e imutável  
**Barreiras Geográficas** → Swap cripto/fiat + marketplace global elimina fronteiras

O resultado é uma plataforma que democratiza o acesso ao crédito de forma **escalável** (arquitetura preparada para microsserviços), **confiável** (blockchain) e **inteligente** (IA). A PoC em monólito modular permite validação rápida do conceito sem comprometer a visão arquitetural de longo prazo.