# Swapin - Design System Guidelines

## Identidade Visual
- **Paleta de Cores:**
  - Verde primário: #10B981 (ações principais, sucesso)
  - Azul secundário: #3B82F6 (informações, links)
  - Roxo acento: #A855F7 (funcionalidades premium, pools)
  - Background escuro: #0F172A
  - Cards: #1E293B
  - Vermelho erro: #EF4444
  - Amarelo aviso: #F59E0B

- **Tipografia:**
  - Família: Inter ou DM Sans
  - Display: 32px, bold (títulos principais)
  - Heading: 24px, semibold (títulos de seção)
  - Body: 16px, regular (texto corrido)
  - Caption: 14px, medium (labels, informações secundárias)

## Princípios de Design
- **Dark Mode First:** Todos os componentes devem ser desenhados para fundo escuro
- **Glassmorfismo:** Cards devem usar `backdrop-blur-md` com `bg-white/10` para efeito de vidro fosco
- **Gradientes Sutis:** Backgrounds de cards e headers podem usar gradientes suaves (ex: `from-slate-900 to-slate-800`)
- **Bordas Arredondadas:** Usar `rounded-2xl` (16px) para cards principais, `rounded-xl` para cards secundários
- **Sombras Suaves:** `shadow-xl shadow-slate-900/50` para profundidade

## Componentes Obrigatórios

### Botões
- **Primary:** Background verde (#10B981), texto branco, hover: scale 1.02
- **Secondary:** Border azul (#3B82F6), background transparente, hover: background azul/10
- **Tertiary:** Texto verde, sem border, hover: background verde/10
- **Disabled:** Opacity 0.5, cursor not-allowed
- **Loading:** Substituir texto por spinner, manter tamanho

### Inputs
- **Máscaras automáticas:**
  - CPF: `000.000.000-00`
  - Celular: `(00) 00000-0000`
  - Dinheiro: `R$ 0.000,00`
  - Data: `DD/MM/AAAA`
- **Estados:**
  - Default: Border cinza (`border-slate-600`)
  - Focus: Border verde com ring (`focus:border-green-500 focus:ring-2 focus:ring-green-500/20`)
  - Error: Border vermelha (`border-red-500`)
  - Success: Border verde (`border-green-500`)
- **Validação:** Mostrar mensagem de erro abaixo do input em texto vermelho pequeno

### Cards
- **Estrutura:** `bg-slate-800/50 backdrop-blur-md rounded-2xl p-6 shadow-xl`
- **Hover:** `hover:shadow-2xl hover:-translate-y-1 transition-all duration-300`
- **Gradiente (opcional):** `bg-gradient-to-br from-slate-800 to-slate-900`

### Toasts
- **Success:** Background verde, ícone checkmark
- **Error:** Background vermelho, ícone X
- **Warning:** Background amarelo, ícone alerta
- **Info:** Background azul, ícone i
- **Posição:** Top-right
- **Duração:** 4 segundos
- **Animação:** Slide from top + bounce

### Modais
- **Overlay:** `bg-black/60 backdrop-blur-sm`
- **Container:** Centralizado, max-width 600px (desktop), 100% (mobile)
- **Animação entrada:** Fade + scale from 0.95
- **Botão fechar:** X no canto superior direito

## Regras de Layout

### Mobile-First
- Sempre começar com layout mobile (375px)
- Cards full-width no mobile
- Grid/flex no desktop (≥1024px)

### Bottom Navigation (Mobile)
- Fixo na base da tela
- Máximo 4 itens: Home, Extrato, Score, Perfil
- Ícones com label abaixo
- Item ativo: cor verde + ícone preenchido

### Sidebar (Desktop)
- Fixa à esquerda
- Largura: 280px
- Background: `bg-slate-900/95 backdrop-blur-md`
- Separada do conteúdo principal

### Espaçamentos
- Container padding: 16px (mobile), 24px (tablet), 32px (desktop)
- Gap entre cards: 16px (mobile), 24px (desktop)
- Seções: 32px de espaçamento vertical

## Comportamentos Específicos

### Animações
- **Transições:** 300ms com `cubic-bezier(0.4, 0, 0.2, 1)`
- **Count-up:** Valores monetários devem animar de 0 ao valor final
- **Confetti:** Ao completar missões de score ou criar primeira pool
- **Loading states:** Skeleton screens para listas, spinners para botões

### Máscaras e Validação
- **CPF:** Validar dígitos verificadores
- **Email:** Validar formato + domínio comum
- **Senha:** Min 8 chars, 1 maiúscula, 1 número + indicador visual de força
- **Valores monetários:** Não permitir negativos, formatar automaticamente

### Estados de Loading
- **Skeleton:** Para listas de empréstimos, oportunidades, pools
- **Spinner:** Para botões durante ações (substituir texto)
- **Progress Bar:** Para uploads de documentos

### Empty States
- Sempre incluir: ilustração relevante + mensagem + CTA
- Exemplos:
  - "Você ainda não tem empréstimos ativos" + botão "Solicitar meu primeiro empréstimo"
  - "Nenhuma oportunidade no momento" + "Ajuste os filtros"

## Componentes Específicos do Swapin

### Card de Saldo (Tomador)
```
Estrutura:
- Saldo em destaque (32px, bold, verde)
- Crédito aprovado (16px, regular, cinza)
- Limite total (14px, medium, cinza claro)
- 3 botões horizontais: [Receber] [Enviar] [Pedir Crédito]
```

### Card de Patrimônio (Investidor)
```
Estrutura:
- Valor em USDC (32px, bold, azul)
- Equivalente BRL abaixo (20px, cinza)
- Disponível vs Investido (14px, grid 2 colunas)
- 4 botões horizontais: [Depositar] [Resgatar] [Investir] [Criar Pool]
```

### Card de Score
```
Estrutura:
- Título: "Seu Score: XXX ⭐"
- Progress bar gradiente (verde-amarelo-vermelho baseado em valor)
- Nível atual + próximo nível
- Banner informativo sobre pools
- Link "Como aumentar"
```

### Card de Pool
```
Estrutura:
- Header: Nome da pool + Status (🟢/🟡/🔴)
- Valor total, alocado, disponível
- X/Y empréstimos preenchidos
- Seção de performance (retorno, taxa média, % em dia)
- 3 botões: [Ver Detalhes] [Editar] [Pausar]
```

### Card de Oportunidade (Investidor)
```
Estrutura:
- Score em destaque com cor de risco:
  - Verde: 800-1000
  - Amarelo: 600-799
  - Laranja: 400-599
  - Vermelho: <400
- Badge de garantia (se houver): 🛡️
- Valor, prazo, retorno estimado
- Perfil profissional
- Checklist de docs verificados
- 2 botões: [Analisar] [Ignorar]
```

## Regras Críticas

### O que NUNCA fazer:
- ❌ Usar localStorage ou sessionStorage (não funciona no Figma Make)
- ❌ Criar layouts muito complexos com absolute positioning
- ❌ Usar fontes customizadas que não sejam Inter ou DM Sans
- ❌ Criar componentes sem estados de loading/error/empty
- ❌ Esquecer máscaras em inputs de CPF/celular/dinheiro
- ❌ Omitir feedback visual em ações (toast, animações)

### O que SEMPRE fazer:
- ✅ Usar React state (useState, useReducer) para dados
- ✅ Criar componentes reutilizáveis
- ✅ Implementar validação de formulários com feedback visual
- ✅ Adicionar estados de loading, error e empty
- ✅ Usar Tailwind apenas com classes core (sem JIT)
- ✅ Mobile-first responsivo
- ✅ Acessibilidade (labels, aria-labels, contraste)

## Inspirações Visuais
- **Nubank:** Clareza nas informações, minimalismo
- **Stripe:** Sofisticação, gradientes sutis, espaçamento generoso
- **InfinitePay/Cloudwalk:** Modernidade, glassmorfismo, cards flutuantes
- **Binance:** Eficiência, dados densos mas organizados, dark mode elegante

## Observações Finais
- Priorizar funcionalidade sobre frescuras visuais
- Código limpo e organizado por features
- Componentes devem ser autocontidos e reutilizáveis
- Sempre preparar para integração com backend (mocks + TODOs)