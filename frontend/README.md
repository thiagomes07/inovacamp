# 🚀 Swapin - Plataforma P2P de Crédito Descentralizado

**Tagline:** "Modernos por natureza, invencíveis por opção"

Swapin é uma plataforma fintech completa que conecta credores globais (via stablecoins) com tomadores de crédito brasileiros através de dois modelos: investimento direto (análise manual) e pools automatizadas (matching instantâneo).

## 🎯 Funcionalidades Implementadas

### 🔐 Sistema de Autenticação Completo
- **Splash Screen** com animações
- **Onboarding em 6 etapas:**
  1. Seleção de perfil (Tomador/Investidor)
  2. Tipo de usuário (Autônomo/CLT/Empresa)
  3. Dados básicos com validação em tempo real
  4. Verificação SMS com timer
  5. Upload de documentos (KYC)
  6. Verificação biométrica facial
  7. Tela de sucesso com confetti

### 💰 Área do Tomador de Crédito
- **Dashboard completo** com saldo, score e empréstimos ativos
- **Sistema de score gamificado** (Bronze/Silver/Gold/Platinum)
- **Solicitação de crédito** com múltiplas opções:
  - Aprovação automática via pools
  - Análise manual por investidores individuais
  - Híbrido (tenta pools primeiro, depois manual)
- **Gestão de pagamentos** integrada
- **Carteira digital** com PIX, TED e conversão de crypto

### 📈 Área do Investidor
- **Dashboard de investimentos** com portfolio completo
- **Investimentos diretos** via marketplace
- **Sistema de pools automatizadas:**
  - Criação com wizard de 4 etapas
  - Gestão completa (pausar, editar, aumentar capital)
  - Matching automático baseado em critérios
  - Monitoramento de performance em tempo real
- **Multi-moeda** (USDC, USDT, DAI, BTC, ETH, BRL)

### 🔄 Funcionalidade de Swap
- **Interface DEX** para conversão entre moedas
- **Taxas em tempo real** com simulação
- **Histórico de transações** com hash blockchain
- **Integração com carteira** automática

### 🎨 Design System
- **Dark mode** nativo com glassmorfismo
- **Paleta de cores:** Verde primário (#10B981), Azul (#3B82F6), Roxo (#A855F7)
- **Componentes UI reutilizáveis:**
  - Sistema de Toast (4 tipos, auto-dismiss)
  - Loading states (skeletons, spinners, progress bars)
  - Inputs com máscaras (CPF, celular, dinheiro, data)
  - Modais com blur e animações
  - Empty states com ilustrações

## 🛠 Stack Técnica

### Frontend
- **React 18** + TypeScript (strict mode)
- **Tailwind CSS v4** com design system customizado
- **Motion/React** para animações suaves
- **React Hook Form** + Zod para validação
- **Lucide React** para ícones
- **ShadCN/UI** para componentes base

### Arquitetura
```
src/
├── features/           # Módulos por funcionalidade
│   ├── auth/          # Autenticação e onboarding
│   ├── borrower/      # Área do tomador
│   ├── lender/        # Área do investidor
│   ├── pool/          # Sistema de pools
│   ├── wallet/        # Carteira digital
│   └── swap/          # Conversão de moedas
├── shared/            # Código compartilhado
│   ├── components/ui/ # Componentes reutilizáveis
│   ├── hooks/         # Hooks customizados
│   └── utils/         # Utilitários
└── api/               # Mocks de API
    └── endpoints/
```

### Hooks Customizados
- `useAuth` - Gerenciamento de autenticação
- `useWallet` - Carteira e transações
- `useCredit` - Solicitações e empréstimos
- `usePool` - Gestão de pools
- `useToast` - Sistema de notificações

## 🎯 Lógica de Matching (Pools)

O sistema de pools implementa um algoritmo de matching automático:

```typescript
// Quando tomador solicita crédito "Automático" ou "Ambos":
1. Recebe solicitação
2. Varre pools ativas (ordem: taxa mín decrescente)
3. Para cada pool verifica:
   ✓ valor ≤ valorMaxPorEmprestimo
   ✓ score ≥ scoreMinimo
   ✓ SE exige garantia: temGarantia = true
   ✓ taxaOferecida ≥ taxaMinima
   ✓ prazo ≤ prazoMaximo
   ✓ tem vagas disponíveis
4. Match: Aloca → Transfere → Notifica → Atualiza pool → PARA
5. Sem match: SE "Ambos"→marketplace | SE "Automático"→rejeitado
```

## 🚀 Como Executar

### Pré-requisitos
- Node.js 18+
- npm ou yarn

### Instalação
```bash
# Clone o repositório
git clone https://github.com/seu-usuario/swapin.git
cd swapin

# Instale as dependências
npm install

# Execute o projeto
npm run dev
```

### Variáveis de Ambiente
Crie um arquivo `.env.local`:

```env
# API URLs (mocks implementados)
VITE_API_URL=http://localhost:3001/api
VITE_BLOCKCHAIN_RPC=https://mainnet.infura.io/v3/YOUR_PROJECT_ID

# Integração FaceTec (futuro)
VITE_FACETEC_DEVICE_KEY=YOUR_DEVICE_KEY
VITE_FACETEC_PUBLIC_KEY=YOUR_PUBLIC_KEY

# Supabase (opcional)
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## 👤 Contas de Demonstração

### Tomador de Crédito
- **Email:** borrower@demo.com
- **Senha:** 123456
- **Score:** 750 (Gold)
- **Limite:** R$ 25.000

### Investidor
- **Email:** lender@demo.com  
- **Senha:** 123456
- **Patrimônio:** 10.520 USDC
- **Status:** Investidor Gold

## 🎮 Funcionalidades Demo

### Para Tomadores:
- ✅ Solicitar crédito com matching automático
- ✅ Ver aprovação instantânea via pools
- ✅ Gerenciar pagamentos
- ✅ Aumentar score com gamificação
- ✅ Receber/enviar via PIX e crypto

### Para Investidores:
- ✅ Criar pools com wizard completo
- ✅ Investir diretamente via marketplace
- ✅ Monitorar performance em tempo real
- ✅ Resgatar rendimentos
- ✅ Swap entre moedas

## 🔮 Próximos Passos

### Backend Integration
- [ ] API REST completa com Node.js/Express
- [ ] Integração com banco de dados (PostgreSQL)
- [ ] Sistema de autenticação JWT
- [ ] Processamento de pagamentos (PIX, Crypto)
- [ ] Integração blockchain para stablecoins

### Funcionalidades Avançadas
- [ ] Algoritmo de score com ML
- [ ] Chat entre investidores e tomadores
- [ ] Sistema de garantias digitais
- [ ] Dashboard analytics avançado
- [ ] App mobile React Native

### Integrações
- [ ] FaceTec para biometria real
- [ ] Open Finance para análise de renda
- [ ] Serasa/SPC para consulta de score
- [ ] Receita Federal para validação CPF
- [ ] Cartões de crédito internacionais

## 📊 Métricas de Desenvolvimento

- **Componentes criados:** 25+
- **Hooks customizados:** 6
- **Telas implementadas:** 15+
- **Estados gerenciados:** 8
- **Animações:** 20+
- **Responsividade:** Mobile-first

## 🤝 Contribuindo

1. Fork o projeto
2. Crie sua feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para detalhes.

## 👥 Equipe

- **Frontend:** React + TypeScript + Tailwind
- **Design:** Sistema próprio com glassmorfismo
- **Estado:** Context API + hooks customizados
- **Animações:** Motion/React

---

<div align="center">
  <p><strong>"Modernos por natureza, invencíveis por opção"</strong></p>
  <p>🚀 Construído com React, TypeScript e muita dedicação</p>
</div>