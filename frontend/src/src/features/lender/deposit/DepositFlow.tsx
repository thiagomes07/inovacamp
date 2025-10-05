import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import { Card } from "../../../../components/ui/card";
import { Button } from "../../../../components/ui/button";
import { Badge } from "../../../../components/ui/badge";
import { Input } from "../../../../components/ui/input";
import {
  ArrowLeft,
  DollarSign,
  Smartphone,
  Building2,
  CreditCard,
  Copy,
  QrCode,
  Clock,
  CheckCircle,
  AlertCircle,
  Zap,
  Globe,
  Shield,
} from "lucide-react";
import { MaskedInput } from "../../../shared/components/ui/MaskedInput";
import { BottomNavigation } from "../../../shared/components/ui/BottomNavigation";
import { toast } from "sonner@2.0.3";
import QRCode from "react-qr-code";

type DepositStep =
  | "method-selection"
  | "pix"
  | "crypto"
  | "wire"
  | "card"
  | "processing"
  | "success";
type DepositMethod = "pix" | "crypto" | "wire" | "card";

// NOVO COMPONENTE DE INPUT MONETÁRIO
// Adicione este bloco de código ANTES de 'export const DepositFlow...'

interface CurrencyInputProps {
  value: string;
  onChange: (value: string) => void;
  locale: "pt-BR" | "en-US";
  currency: "BRL" | "USD";
  placeholder?: string;
  className?: string;
}

const CurrencyInput: React.FC<CurrencyInputProps> = ({
  value,
  onChange,
  locale,
  currency,
  ...props
}) => {
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value;

    // 1. Limpa o valor, mantendo apenas os dígitos
    const digitsOnly = rawValue.replace(/\D/g, "");

    if (digitsOnly === "") {
      onChange("");
      return;
    }

    // 2. Converte os dígitos para um valor numérico (considerando centavos)
    const numericValue = parseInt(digitsOnly, 10) / 100;

    // 3. Formata o número usando a API nativa do navegador
    const formattedValue = new Intl.NumberFormat(locale, {
      style: "currency",
      currency: currency,
    }).format(numericValue);

    // 4. Envia o valor formatado de volta para o estado
    onChange(formattedValue);
  };

  return (
    <Input
      type="text" // Usamos 'text' para exibir a máscara
      inputMode="decimal" // Melhora a experiência em teclados mobile
      value={value}
      onChange={handleInputChange}
      {...props}
    />
  );
};

interface DepositFlowProps {
  onBack: () => void;
  onComplete: () => void;
}

export const DepositFlow: React.FC<DepositFlowProps> = ({
  onBack,
  onComplete,
}) => {
  const [currentStep, setCurrentStep] =
    useState<DepositStep>("method-selection");
  const [selectedMethod, setSelectedMethod] = useState<DepositMethod | null>(
    null
  );
  const [amount, setAmount] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [cardData, setCardData] = useState({
    number: "",
    expiry: "",
    cvv: "",
    name: "",
  });

  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    try {
      const userDataString = localStorage.getItem("swapin_user");
      if (userDataString) {
        const userData = JSON.parse(userDataString);
        setUserId(userData.id); // Pega o ID do usuário
      }
    } catch (error) {
      console.error("Erro ao ler dados do usuário do localStorage:", error);
      // Opcional: notificar o usuário sobre o erro
    }
  }, []);

  const depositMethods = [
    {
      id: "pix" as DepositMethod,
      title: "PIX (BRL)",
      subtitle: "Conversão automática para USDC",
      icon: Smartphone,
      time: "Instantâneo",
      fee: "Sem taxa",
      color: "from-green-500 to-emerald-500",
      popular: true,
    },
    {
      id: "crypto" as DepositMethod,
      title: "Stablecoins",
      subtitle: "USDC, USDT, DAI direto",
      icon: DollarSign,
      time: "5-10 minutos",
      fee: "Taxa da rede",
      color: "from-blue-500 to-cyan-500",
      popular: false,
    },
    {
      id: "wire" as DepositMethod,
      title: "Transferência Internacional",
      subtitle: "USD, EUR via SWIFT",
      icon: Building2,
      time: "1-3 dias úteis",
      fee: "Taxa bancária",
      color: "from-purple-500 to-violet-500",
      popular: false,
    },
    {
      id: "card" as DepositMethod,
      title: "Cartão Internacional",
      subtitle: "Compra direta de stablecoins",
      icon: CreditCard,
      time: "5-15 minutos",
      fee: "2.9% + spread",
      color: "from-orange-500 to-red-500",
      popular: false,
    },
  ];

  const handleMethodSelect = (method: DepositMethod) => {
    setSelectedMethod(method);
    setCurrentStep(method);
  };

  const handleProcessDeposit = async () => {
    // Remove currency symbols and format for validation
    const cleanAmount = amount.replace(/[^\d.,]/g, "").replace(",", ".");
    if (!amount || parseFloat(cleanAmount) <= 0) {
      toast.error("Digite um valor válido");
      return;
    }

    setIsProcessing(true);
    setCurrentStep("processing");

    // Simulate processing time based on method
    const processingTime =
      selectedMethod === "pix"
        ? 2000
        : selectedMethod === "crypto"
        ? 8000
        : selectedMethod === "wire"
        ? 3000
        : 4000;

    setTimeout(() => {
      setIsProcessing(false);
      setCurrentStep("success");
      toast.success("Depósito confirmado! Saldo atualizado");
    }, processingTime);
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copiado!`);
  };

  if (currentStep === "method-selection") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 pb-20">
        <div className="p-6 border-b border-gray-700">
          <div className="flex items-center gap-3">
            <Button
              onClick={onBack}
              variant="outline"
              size="sm"
              className="border-gray-600 bg-transparent text-white"
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <h1 className="text-2xl font-bold text-white">
              Escolha como receber
            </h1>
          </div>
        </div>

        <div className="p-6 space-y-4">
          {depositMethods.map((method) => (
            <motion.div
              key={method.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: depositMethods.indexOf(method) * 0.1 }}
            >
              <Card
                className="backdrop-blur-md bg-white/10 border-white/20 p-6 cursor-pointer hover:bg-white/15 transition-all duration-300"
                onClick={() => handleMethodSelect(method.id)}
              >
                <div className="flex items-center gap-4">
                  <div
                    className={`w-12 h-12 bg-gradient-to-r ${method.color} rounded-xl flex items-center justify-center`}
                  >
                    <method.icon className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-white font-semibold">
                        {method.title}
                      </h3>
                      {method.popular && (
                        <Badge className="bg-green-500/20 text-green-400 text-xs">
                          Mais usado
                        </Badge>
                      )}
                    </div>
                    <p className="text-gray-400 text-sm mb-2">
                      {method.subtitle}
                    </p>
                    <div className="flex gap-4 text-xs">
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-gray-500" />
                        <span className="text-gray-400">{method.time}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <DollarSign className="w-3 h-3 text-gray-500" />
                        <span className="text-gray-400">{method.fee}</span>
                      </div>
                    </div>
                  </div>
                  <ArrowLeft className="w-5 h-5 text-gray-400 rotate-180" />
                </div>
              </Card>
            </motion.div>
          ))}

          <Card className="backdrop-blur-md bg-blue-500/10 border-blue-500/20 p-4 mt-6">
            <div className="flex items-center gap-3">
              <Shield className="w-5 h-5 text-blue-400" />
              <div>
                <h4 className="text-blue-400 font-semibold text-sm">
                  100% Seguro
                </h4>
                <p className="text-gray-300 text-xs">
                  Todos os depósitos são protegidos por criptografia de ponta e
                  auditoria blockchain
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Bottom Navigation */}
        <BottomNavigation
          userType="lender"
          activeTab="deposit"
          onTabChange={() => {}}
        />
      </div>
    );
  }

  if (currentStep === "pix") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 pb-20">
        <div className="p-6 border-b border-gray-700">
          <div className="flex items-center gap-3">
            <Button
              onClick={() => setCurrentStep("method-selection")}
              variant="outline"
              size="sm"
              className="border-gray-600 bg-transparent text-white"
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <h1 className="text-2xl font-bold text-white">Depósito via PIX</h1>
          </div>
        </div>

        <div className="p-6 space-y-6">
          <Card className="backdrop-blur-md bg-white/10 border-white/20 p-6">
            <div className="space-y-4">
              <div>
                <label className="text-white font-semibold mb-2 block">
                  Valor em Reais (BRL)
                </label>
                <CurrencyInput
                  locale="pt-BR"
                  currency="BRL"
                  placeholder="R$ 0,00"
                  value={amount}
                  onChange={setAmount}
                  className="bg-gray-800/50 border-gray-600 text-white text-lg"
                />  
                <p className="text-gray-400 text-sm mt-1">
                  Será convertido automaticamente para USDC (1 USD ≈ R$ 5,015)
                </p>
              </div>

              <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Smartphone className="w-5 h-5 text-green-400" />
                  <span className="text-green-400 font-semibold">
                    Chave PIX
                  </span>
                </div>

                <div className="space-y-3">
                  <div>
                    <p className="text-gray-300 text-sm mb-1">CPF/CNPJ:</p>
                    <div className="flex items-center gap-2">
                      <code className="text-white bg-gray-800 px-3 py-2 rounded text-sm flex-1">
                        12.345.678/0001-90
                      </code>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() =>
                          copyToClipboard("12.345.678/0001-90", "Chave PIX")
                        }
                        className="border-gray-600 bg-transparent text-white"
                      >
                        <Copy className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>

                  <div>
                    <p className="text-gray-300 text-sm mb-1">Favorecido:</p>
                    <p className="text-white bg-gray-800 px-3 py-2 rounded text-sm">
                      Swapin Tecnologia Ltda
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <QrCode className="w-5 h-5 text-blue-400" />
                  <span className="text-blue-400 font-semibold">
                    QR Code PIX
                  </span>
                </div>
                <div className="bg-white rounded-lg p-4 mb-3">
                  {/* Contêiner com tamanho fixo (128x128 pixels) e centralizado */}
                  <div className="w-32 h-32 mx-auto">
                    {userId ? (
                      <QRCode
                        value={userId}
                        size={256} // Usamos um tamanho maior para melhor qualidade
                        style={{
                          height: "auto",
                          maxWidth: "100%",
                          width: "100%",
                        }}
                      />
                    ) : (
                      // Placeholder com o mesmo tamanho para evitar que o layout "pule"
                      <div className="w-full h-full flex items-center justify-center bg-gray-100 rounded-md">
                        <p className="text-sm text-gray-500">Carregando...</p>
                      </div>
                    )}
                  </div>
                </div>
                <Button
                  variant="outline"
                  className="w-full border-blue-500 text-blue-400 hover:bg-blue-500/10"
                  onClick={() =>
                    copyToClipboard("PIX_CODE_123456", "Código PIX")
                  }
                >
                  <Copy className="w-4 h-4 mr-2" />
                  Copiar código do QR
                </Button>
              </div>

              <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Zap className="w-5 h-5 text-yellow-400" />
                  <span className="text-yellow-400 font-semibold">
                    Processamento Instantâneo
                  </span>
                </div>
                <p className="text-gray-300 text-sm">
                  O valor será convertido e creditado na sua conta em USDC
                  automaticamente após confirmação do PIX
                </p>
              </div>

              <Button
                onClick={handleProcessDeposit}
                className="w-full bg-green-600 hover:bg-green-700 py-3"
                disabled={!amount}
              >
                Confirmar que enviei o PIX
              </Button>
            </div>
          </Card>
        </div>

        {/* Bottom Navigation */}
        <BottomNavigation
          userType="lender"
          activeTab="deposit"
          onTabChange={() => {}}
        />
      </div>
    );
  }

  if (currentStep === "crypto") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 pb-20">
        <div className="p-6 border-b border-gray-700">
          <div className="flex items-center gap-3">
            <Button
              onClick={() => setCurrentStep("method-selection")}
              variant="outline"
              size="sm"
              className="border-gray-600 bg-transparent text-white"
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <h1 className="text-2xl font-bold text-white">Depósito Crypto</h1>
          </div>
        </div>

        <div className="p-6 space-y-6">
          <Card className="backdrop-blur-md bg-white/10 border-white/20 p-6">
            <div className="space-y-4">
              <div>
                <label className="text-white font-semibold mb-2 block">
                  Valor (USDC)
                </label>
                <MaskedInput
                  mask="usd"
                  placeholder="$ 0.00"
                  value={amount}
                  onChange={setAmount}
                  className="bg-gray-800/50 border-gray-600 text-white text-lg"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                {["USDC", "USDT", "DAI"].map((token) => (
                  <Button
                    key={token}
                    variant="outline"
                    className="border-gray-600 bg-transparent text-white hover:bg-blue-500/20 hover:border-blue-500"
                  >
                    {token}
                  </Button>
                ))}
              </div>

              <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Globe className="w-5 h-5 text-blue-400" />
                  <span className="text-blue-400 font-semibold">
                    Rede Polygon (MATIC)
                  </span>
                </div>
                <p className="text-gray-300 text-sm mb-3">
                  Endereço da carteira:
                </p>
                <div className="flex items-center gap-2">
                  <code className="text-white bg-gray-800 px-3 py-2 rounded text-sm break-all flex-1">
                    0x742d35Cc6638C0532c34abA8f9d6eAD1F2C2a5ef
                  </code>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() =>
                      copyToClipboard(
                        "0x742d35Cc6638C0532c34abA8f9d6eAD1F2C2a5ef",
                        "Endereço"
                      )
                    }
                    className="border-gray-600 bg-transparent text-white"
                  >
                    <Copy className="w-3 h-3" />
                  </Button>
                </div>
              </div>

              <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="w-5 h-5 text-yellow-400" />
                  <span className="text-yellow-400 font-semibold">
                    Confirmações Blockchain
                  </span>
                </div>
                <p className="text-gray-300 text-sm">
                  Aguarde 12 confirmações na rede (5-10 minutos) para crédito
                  automático
                </p>
              </div>

              <Button
                onClick={handleProcessDeposit}
                className="w-full bg-blue-600 hover:bg-blue-700 py-3"
                disabled={!amount}
              >
                Confirmar que enviei crypto
              </Button>
            </div>
          </Card>
        </div>

        {/* Bottom Navigation */}
        <BottomNavigation
          userType="lender"
          activeTab="deposit"
          onTabChange={() => {}}
        />
      </div>
    );
  }

  if (currentStep === "wire") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 pb-20">
        <div className="p-6 border-b border-gray-700">
          <div className="flex items-center gap-3">
            <Button
              onClick={() => setCurrentStep("method-selection")}
              variant="outline"
              size="sm"
              className="border-gray-600 bg-transparent text-white"
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <h1 className="text-2xl font-bold text-white">Wire Transfer</h1>
          </div>
        </div>

        <div className="p-6 space-y-6">
          <Card className="backdrop-blur-md bg-white/10 border-white/20 p-6">
            <div className="space-y-4">
              <div>
                <label className="text-white font-semibold mb-2 block">
                  Valor (USD)
                </label>
                <MaskedInput
                  mask="usd"
                  placeholder="$ 0.00"
                  value={amount}
                  onChange={setAmount}
                  className="bg-gray-800/50 border-gray-600 text-white text-lg"
                />
              </div>

              <div className="bg-purple-500/10 border border-purple-500/20 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Building2 className="w-5 h-5 text-purple-400" />
                  <span className="text-purple-400 font-semibold">
                    Dados Bancários
                  </span>
                </div>

                <div className="space-y-2 text-sm">
                  <div>
                    <span className="text-gray-400">Banco:</span>
                    <span className="text-white ml-2">
                      J.P. Morgan Chase Bank
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-400">SWIFT:</span>
                    <span className="text-white ml-2">CHASUS33</span>
                  </div>
                  <div>
                    <span className="text-gray-400">Conta:</span>
                    <span className="text-white ml-2">123456789</span>
                  </div>
                  <div>
                    <span className="text-gray-400">Beneficiário:</span>
                    <span className="text-white ml-2">Swapin Inc.</span>
                  </div>
                  <div>
                    <span className="text-gray-400">Endereço:</span>
                    <span className="text-white ml-2">
                      270 Park Ave, New York, NY 10017
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="w-5 h-5 text-yellow-400" />
                  <span className="text-yellow-400 font-semibold">
                    Processamento Bancário
                  </span>
                </div>
                <p className="text-gray-300 text-sm">
                  Transferências internacionais levam 1-3 dias úteis + taxa do
                  banco intermediário
                </p>
              </div>

              <Button
                onClick={handleProcessDeposit}
                className="w-full bg-purple-600 hover:bg-purple-700 py-3"
                disabled={!amount}
              >
                Confirmar que enviei wire
              </Button>
            </div>
          </Card>
        </div>

        {/* Bottom Navigation */}
        <BottomNavigation
          userType="lender"
          activeTab="deposit"
          onTabChange={() => {}}
        />
      </div>
    );
  }

  if (currentStep === "card") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 pb-20">
        <div className="p-6 border-b border-gray-700">
          <div className="flex items-center gap-3">
            <Button
              onClick={() => setCurrentStep("method-selection")}
              variant="outline"
              size="sm"
              className="border-gray-600 bg-transparent text-white"
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <h1 className="text-2xl font-bold text-white">
              Cartão Internacional
            </h1>
          </div>
        </div>

        <div className="p-6 space-y-6">
          <Card className="backdrop-blur-md bg-white/10 border-white/20 p-6">
            <div className="space-y-4">
              <div>
                <label className="text-white font-semibold mb-2 block">
                  Valor (USD)
                </label>
                <MaskedInput
                  mask="usd"
                  placeholder="$ 0.00"
                  value={amount}
                  onChange={setAmount}
                  className="bg-gray-800/50 border-gray-600 text-white text-lg"
                />
              </div>

              <div className="bg-orange-500/10 border border-orange-500/20 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <CreditCard className="w-5 h-5 text-orange-400" />
                  <span className="text-orange-400 font-semibold">
                    Taxa de Processamento
                  </span>
                </div>
                <p className="text-gray-300 text-sm">
                  2.9% + spread cambial + possível IOF (brasileiro)
                </p>
              </div>

              <div className="space-y-3">
                <MaskedInput
                  mask="creditCard"
                  placeholder="0000 0000 0000 0000"
                  value={cardData.number}
                  onChange={(value) =>
                    setCardData((prev) => ({ ...prev, number: value }))
                  }
                  className="bg-gray-800/50 border-gray-600 text-white"
                />
                <div className="grid grid-cols-2 gap-3">
                  <MaskedInput
                    mask="expiryDate"
                    placeholder="MM/YY"
                    value={cardData.expiry}
                    onChange={(value) =>
                      setCardData((prev) => ({ ...prev, expiry: value }))
                    }
                    className="bg-gray-800/50 border-gray-600 text-white"
                  />
                  <MaskedInput
                    mask="cvv"
                    placeholder="000"
                    value={cardData.cvv}
                    onChange={(value) =>
                      setCardData((prev) => ({ ...prev, cvv: value }))
                    }
                    className="bg-gray-800/50 border-gray-600 text-white"
                  />
                </div>
                <Input
                  placeholder="Nome no cartão"
                  value={cardData.name}
                  onChange={(e) =>
                    setCardData((prev) => ({ ...prev, name: e.target.value }))
                  }
                  className="bg-gray-800/50 border-gray-600 text-white"
                />
              </div>

              <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="w-5 h-5 text-yellow-400" />
                  <span className="text-yellow-400 font-semibold">
                    Processamento Rápido
                  </span>
                </div>
                <p className="text-gray-300 text-sm">
                  Compra e crédito em 5-15 minutos após aprovação
                </p>
              </div>

              <Button
                onClick={handleProcessDeposit}
                className="w-full bg-orange-600 hover:bg-orange-700 py-3"
                disabled={!amount}
              >
                Processar compra de USDC
              </Button>
            </div>
          </Card>
        </div>

        {/* Bottom Navigation */}
        <BottomNavigation
          userType="lender"
          activeTab="deposit"
          onTabChange={() => {}}
        />
      </div>
    );
  }

  if (currentStep === "processing") {
    const method = depositMethods.find((m) => m.id === selectedMethod);

    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <Card className="backdrop-blur-md bg-white/10 border-white/20 p-8 text-center max-w-md mx-6">
          <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin" />
          </div>
          <h3 className="text-white font-semibold mb-2">
            Processando depósito...
          </h3>
          <p className="text-gray-400 text-sm mb-4">
            Aguarde a confirmação do seu depósito via {method?.title}
          </p>
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-3">
            <p className="text-blue-400 text-sm">
              ⏱️ Tempo estimado: {method?.time}
            </p>
          </div>
        </Card>
      </div>
    );
  }

  if (currentStep === "success") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <Card className="backdrop-blur-md bg-white/10 border-white/20 p-8 text-center max-w-md mx-6">
          <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center">
            <CheckCircle className="w-8 h-8 text-white" />
          </div>
          <h3 className="text-white font-semibold mb-2">
            Depósito confirmado!
          </h3>
          <p className="text-gray-400 text-sm mb-6">
            Seu saldo foi atualizado com sucesso
          </p>
          <Button
            onClick={onComplete}
            className="w-full bg-green-600 hover:bg-green-700"
          >
            Voltar ao dashboard
          </Button>
        </Card>
      </div>
    );
  }

  return null;
};
