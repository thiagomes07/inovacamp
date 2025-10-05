import React, { useState, useRef, useEffect } from "react";
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
  Wallet,
  Globe,
  Copy,
  Clock,
  CheckCircle,
  AlertCircle,
  Zap,
  Shield,
  Eye,
  EyeOff,
  Fingerprint,
  QrCode,
  Camera,
  X,
} from "lucide-react";
import { MaskedInput } from "../../../shared/components/ui/MaskedInput";
import { toast } from "sonner@2.0.3";

type WithdrawMethod = "pix" | "bank-transfer" | "stablecoin" | "wire-transfer";
type WithdrawStep =
  | "method-selection"
  | "amount"
  | "details"
  | "biometric"
  | "processing"
  | "success";

interface WithdrawFlowProps {
  onBack: () => void;
  onComplete: () => void;
  availableBalance: {
    usdc: number;
    brl: number;
  };
}

export const WithdrawFlow: React.FC<WithdrawFlowProps> = ({
  onBack,
  onComplete,
  availableBalance,
}) => {
  const [currentStep, setCurrentStep] =
    useState<WithdrawStep>("method-selection");
  const [selectedMethod, setSelectedMethod] = useState<WithdrawMethod | null>(
    null
  );
  const [amount, setAmount] = useState("");
  const [amountCurrency, setAmountCurrency] = useState<"BRL" | "USDC">("USDC");
  const [isProcessing, setIsProcessing] = useState(false);
  const [showBiometric, setShowBiometric] = useState(false);
  const [showQRCamera, setShowQRCamera] = useState(false);
  // Adicionar aos estados existentes:
  const [jsQRLoaded, setJsQRLoaded] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [cameraError, setCameraError] = useState("");
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const scanIntervalRef = useRef<number | null>(null);

  // Declarar o tipo global do jsQR
  declare global {
    interface Window {
      jsQR: any;
    }
  }

  // Adicionar este useEffect no componente
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://cdn.jsdelivr.net/npm/jsqr@1.4.0/dist/jsQR.js";
    script.async = true;
    script.onload = () => {
      console.log("jsQR library loaded successfully");
      setJsQRLoaded(true);
    };
    script.onerror = () => {
      console.error("Failed to load jsQR library");
      setCameraError("Erro ao carregar biblioteca de leitura de QR Code");
    };
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  // Cleanup da câmera
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  const stopCamera = () => {
    if (scanIntervalRef.current) {
      clearInterval(scanIntervalRef.current);
      scanIntervalRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsScanning(false);
  };

  const startCamera = async () => {
    if (!jsQRLoaded) {
      setCameraError("Aguarde o carregamento da biblioteca...");
      return;
    }

    setCameraError("");

    try {
      const constraints = {
        video: {
          facingMode: "environment",
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;

        videoRef.current.onloadedmetadata = async () => {
          try {
            await videoRef.current?.play();
            setIsScanning(true);

            setTimeout(() => {
              scanIntervalRef.current = window.setInterval(() => {
                scanQRCode();
              }, 300);
            }, 1000);
          } catch (err) {
            console.error("Erro ao reproduzir vídeo:", err);
            setCameraError("Erro ao iniciar visualização da câmera");
          }
        };
      }
    } catch (error: any) {
      console.error("Erro ao acessar câmera:", error);
      let errorMessage = "Não foi possível acessar a câmera.";

      if (error.name === "NotAllowedError") {
        errorMessage =
          "Permissão de câmera negada. Permita o acesso nas configurações.";
      } else if (error.name === "NotFoundError") {
        errorMessage = "Nenhuma câmera encontrada no dispositivo.";
      }

      setCameraError(errorMessage);
      setIsScanning(false);
    }
  };

  const scanQRCode = () => {
    if (!videoRef.current || !canvasRef.current || !window.jsQR) {
      return;
    }

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d", { willReadFrequently: true });

    if (!context || video.readyState !== video.HAVE_ENOUGH_DATA) {
      return;
    }

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
    const code = window.jsQR(
      imageData.data,
      imageData.width,
      imageData.height,
      {
        inversionAttempts: "dontInvert",
      }
    );

    if (code && code.data) {
      console.log("QR Code detected:", code.data);
      handleQRCodeDetected(code.data);
    }
  };

  const handleQRCodeDetected = (data: string) => {
    stopCamera();
    setShowQRCamera(false);

    // Preencher os dados do PIX
    setPixData({
      key: data,
      keyType: "random", // ou detectar o tipo baseado no formato
    });

    toast.success("QR Code escaneado com sucesso!");
  };

  // Form data for different methods
  const [pixData, setPixData] = useState({
    key: "",
    keyType: "cpf" as "cpf" | "email" | "phone" | "random",
  });

  const [bankData, setBankData] = useState({
    bank: "",
    agency: "",
    account: "",
    accountType: "checking" as "checking" | "savings",
    cpf: "",
    name: "",
  });

  const [stablecoinData, setStablecoinData] = useState({
    address: "",
    network: "polygon" as "ethereum" | "polygon" | "arbitrum",
  });

  const [wireData, setWireData] = useState({
    beneficiaryName: "",
    bankName: "",
    bankAddress: "",
    swiftCode: "",
    accountNumber: "",
    routingNumber: "",
  });

  const withdrawMethods = [
    {
      id: "pix" as WithdrawMethod,
      title: "PIX (BRL)",
      subtitle: "Conversão automática USDC → BRL",
      icon: Smartphone,
      time: "Instantâneo",
      fee: "Sem taxa",
      color: "from-green-500 to-emerald-500",
      popular: true,
      minAmount: { brl: 50, usdc: 10 },
    },
    {
      id: "bank-transfer" as WithdrawMethod,
      title: "Transferência Bancária",
      subtitle: "Receber em conta bancária brasileira",
      icon: Building2,
      time: "1-2 dias úteis",
      fee: "R$ 5,00",
      color: "from-blue-500 to-cyan-500",
      popular: false,
      minAmount: { brl: 50, usdc: 10 },
    },
    {
      id: "stablecoin" as WithdrawMethod,
      title: "Enviar Stablecoin",
      subtitle: "Para carteira externa (MetaMask, Ledger)",
      icon: Wallet,
      time: "5-15 minutos",
      fee: "≈ $2-5 (gas)",
      color: "from-purple-500 to-violet-500",
      popular: false,
      minAmount: { brl: 0, usdc: 10 },
    },
    {
      id: "wire-transfer" as WithdrawMethod,
      title: "Wire Transfer",
      subtitle: "Transferência internacional",
      icon: Globe,
      time: "3-5 dias úteis",
      fee: "$25",
      color: "from-orange-500 to-red-500",
      popular: false,
      minAmount: { brl: 0, usdc: 100 },
    },
  ];

  const exchangeRate = 5.015; // Mock BRL/USD rate

  // Helper function to extract numeric value from formatted string
  const parseNumericValue = (
    value: string,
    currency: "BRL" | "USDC"
  ): number => {
    if (!value) return 0;

    // Remove currency symbols and spaces
    let cleanValue = value.replace(/[R$\s]/g, "");

    if (currency === "BRL") {
      // Brazilian format: R$ 1.234,56 -> remove dots (thousands) and replace comma with dot
      cleanValue = cleanValue.replace(/\./g, "").replace(",", ".");
    } else {
      // US format: $ 1,234.56 -> remove commas (thousands)
      cleanValue = cleanValue.replace(/,/g, "");
    }

    return parseFloat(cleanValue) || 0;
  };

  const getAmountInOtherCurrency = (value: string, from: "BRL" | "USDC") => {
    const numValue = parseNumericValue(value, from);
    if (from === "BRL") {
      return (numValue / exchangeRate).toFixed(2);
    } else {
      return (numValue * exchangeRate).toFixed(2);
    }
  };

  const needsBiometric = () => {
    const numAmount = parseNumericValue(amount, amountCurrency);
    if (amountCurrency === "BRL") {
      return numAmount > 5000;
    } else {
      return numAmount > 1000;
    }
  };

  const validateAmount = () => {
    const numAmount = parseNumericValue(amount, amountCurrency);
    const method = withdrawMethods.find((m) => m.id === selectedMethod);

    if (!method) return false;
    if (numAmount <= 0) return false;

    if (amountCurrency === "BRL") {
      if (numAmount < method.minAmount.brl) return false;
      const usdcAmount = numAmount / exchangeRate;
      return usdcAmount <= availableBalance.usdc;
    } else {
      if (numAmount < method.minAmount.usdc) return false;
      return numAmount <= availableBalance.usdc;
    }
  };

  const handleMethodSelect = (methodId: WithdrawMethod) => {
    setSelectedMethod(methodId);
    setCurrentStep("amount");
  };

  const handleAmountNext = () => {
    if (!validateAmount()) {
      toast.error("Valor inválido ou insuficiente");
      return;
    }

    setCurrentStep("details");
  };

  const handleDetailsNext = () => {
    if (needsBiometric()) {
      setCurrentStep("biometric");
    } else {
      processWithdraw();
    }
  };

  const handleBiometricComplete = () => {
    processWithdraw();
  };

  const processWithdraw = async () => {
    setCurrentStep("processing");
    setIsProcessing(true);

    try {
      // Get user data from localStorage
      const swapinUserData = localStorage.getItem("swapin_user");
      if (!swapinUserData) {
        throw new Error("Usuário não encontrado. Faça login novamente.");
      }

      const userData = JSON.parse(swapinUserData);
      const userId = userData.id;
      const profileType = userData.profileType; // 'investor' or 'borrower'

      if (!userId) {
        throw new Error("ID do usuário não encontrado.");
      }

      // Prepare request body based on selected method
      let requestBody: any = {
        userId: userId,
        profileType: profileType,
        amount: parseNumericValue(amount, amountCurrency),
        currency: amountCurrency,
        method: selectedMethod,
      };

      // Add method-specific data
      if (selectedMethod === "pix") {
        requestBody = {
          ...requestBody,
          pixKey: pixData.key,
          pixKeyType: pixData.keyType,
        };
      } else if (selectedMethod === "bank-transfer") {
        requestBody = {
          ...requestBody,
          bankData: bankData,
        };
      } else if (selectedMethod === "stablecoin") {
        requestBody = {
          ...requestBody,
          walletAddress: stablecoinData.address,
          network: stablecoinData.network,
        };
      } else if (selectedMethod === "wire-transfer") {
        requestBody = {
          ...requestBody,
          wireData: wireData,
        };
      }

      // Make API call
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/pix/send`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(requestBody),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Erro ao processar o resgate");
      }

      const responseData = await response.json();
      console.log("Resgate processado:", responseData);

      setIsProcessing(false);
      setCurrentStep("success");
    } catch (err: any) {
      console.error("Erro ao processar resgate:", err);
      setIsProcessing(false);
      toast.error(
        err.message ||
          "Ocorreu um erro ao processar o resgate. Tente novamente."
      );
      setCurrentStep("details"); // Volta para a tela de detalhes em caso de erro
    }
  };

  const handleComplete = () => {
    onComplete();
    toast.success("Resgate processado com sucesso!");
  };

  const handleQRScan = () => {
    setShowQRCamera(true);
    // Iniciar câmera quando o modal abrir
    setTimeout(() => {
      startCamera();
    }, 100);
  };

  // Method Selection Step
  if (currentStep === "method-selection") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 pb-20">
        <div className="p-6 border-b border-gray-700">
          <div className="flex items-center gap-3">
            <Button
              onClick={onBack}
              variant="outline"
              size="sm"
              className="border-gray-600"
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <h1 className="text-2xl font-bold text-white">Resgatar Fundos</h1>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Available Balance */}
          <Card className="backdrop-blur-md bg-white/10 border-white/20 p-6">
            <div className="text-center">
              <p className="text-gray-400 text-sm mb-2">
                Saldo disponível para resgate
              </p>
              <p className="text-3xl font-bold text-white mb-1">
                {availableBalance.usdc.toLocaleString("pt-BR", {
                  minimumFractionDigits: 2,
                })}{" "}
                USDC
              </p>
              <p className="text-gray-400 text-sm">
                ≈ R${" "}
                {(availableBalance.usdc * exchangeRate).toLocaleString(
                  "pt-BR",
                  { minimumFractionDigits: 2 }
                )}
              </p>
            </div>
          </Card>

          {/* Warning */}
          <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-yellow-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-yellow-400 font-semibold text-sm mb-1">
                  Importante
                </p>
                <p className="text-gray-300 text-sm">
                  Você só pode resgatar o saldo disponível. Fundos investidos em
                  pools não podem ser resgatados até o vencimento dos
                  empréstimos.
                </p>
              </div>
            </div>
          </div>

          {/* Methods */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">
              Escolha o método de resgate
            </h3>

            {withdrawMethods.map((method) => (
              <motion.div
                key={method.id}
                whileTap={{ scale: 0.98 }}
                className="relative"
              >
                <Card
                  className="backdrop-blur-md bg-white/5 border-white/10 p-4 cursor-pointer transition-all duration-200 hover:bg-white/10 hover:border-white/20"
                  onClick={() => handleMethodSelect(method.id)}
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`w-12 h-12 rounded-xl bg-gradient-to-r ${method.color} flex items-center justify-center`}
                    >
                      <method.icon className="w-6 h-6 text-white" />
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold text-white">
                          {method.title}
                        </h4>
                        {method.popular && (
                          <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                            Popular
                          </Badge>
                        )}
                      </div>
                      <p className="text-gray-400 text-sm mb-2">
                        {method.subtitle}
                      </p>

                      <div className="flex items-center gap-4 text-xs">
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          <span className="text-gray-400">{method.time}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <DollarSign className="w-3 h-3" />
                          <span className="text-gray-400">{method.fee}</span>
                        </div>
                      </div>
                    </div>

                    <div className="text-gray-400">
                      <ArrowLeft className="w-5 h-5 rotate-180" />
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Amount Selection Step
  if (currentStep === "amount") {
    const method = withdrawMethods.find((m) => m.id === selectedMethod);

    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 pb-20">
        <div className="p-6 border-b border-gray-700">
          <div className="flex items-center gap-3">
            <Button
              onClick={() => setCurrentStep("method-selection")}
              variant="outline"
              size="sm"
              className="border-gray-600"
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <h1 className="text-2xl font-bold text-white">Valor do Resgate</h1>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Selected Method */}
          <Card className="backdrop-blur-md bg-white/10 border-white/20 p-4">
            <div className="flex items-center gap-3">
              <div
                className={`w-10 h-10 rounded-lg bg-gradient-to-r ${method?.color} flex items-center justify-center`}
              >
                {method?.icon && <method.icon className="w-5 h-5 text-white" />}
              </div>
              <div>
                <h4 className="font-semibold text-white">{method?.title}</h4>
                <p className="text-gray-400 text-sm">{method?.subtitle}</p>
              </div>
            </div>
          </Card>

          {/* Amount Input */}
          <Card className="backdrop-blur-md bg-white/10 border-white/20 p-6">
            <div className="space-y-4">
              <div>
                <label className="text-white font-semibold block mb-2">
                  Valor do resgate
                </label>

                {/* Currency Toggle */}
                <div className="flex bg-gray-800 rounded-lg p-1 mb-4">
                  <button
                    onClick={() => setAmountCurrency("USDC")}
                    className={`flex-1 py-2 px-4 rounded-md transition-all ${
                      amountCurrency === "USDC"
                        ? "bg-blue-600 text-white"
                        : "text-gray-400 hover:text-white"
                    }`}
                  >
                    USDC
                  </button>
                  <button
                    onClick={() => setAmountCurrency("BRL")}
                    className={`flex-1 py-2 px-4 rounded-md transition-all ${
                      amountCurrency === "BRL"
                        ? "bg-green-600 text-white"
                        : "text-gray-400 hover:text-white"
                    }`}
                  >
                    BRL
                  </button>
                </div>

                <Input
                  type="text"
                  value={amount}
                  onChange={(e) => {
                    const value = e.target.value;
                    // Remove tudo exceto números
                    const numbersOnly = value.replace(/\D/g, "");

                    if (numbersOnly === "") {
                      setAmount("");
                      return;
                    }

                    // Converte para número e formata
                    const numValue = parseInt(numbersOnly) / 100;

                    if (amountCurrency === "BRL") {
                      // Formato brasileiro: R$ 1.234,56
                      const formatted = numValue.toLocaleString("pt-BR", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      });
                      setAmount(`R$ ${formatted}`);
                    } else {
                      // Formato americano: $ 1,234.56
                      const formatted = numValue.toLocaleString("en-US", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      });
                      setAmount(`$ ${formatted}`);
                    }
                  }}
                  placeholder={amountCurrency === "BRL" ? "R$ 0,00" : "$ 0.00"}
                  className="bg-gray-800/50 border border-gray-600 rounded-lg text-white text-xl h-14 px-4"
                />

                {amount && (
                  <p className="text-gray-400 text-sm mt-2">
                    ≈ {amountCurrency === "BRL" ? "$" : "R$"}{" "}
                    {getAmountInOtherCurrency(amount, amountCurrency)}{" "}
                    {amountCurrency === "BRL" ? "USDC" : ""}
                  </p>
                )}
              </div>

              {/* Available Balance */}
              <div className="bg-gray-800/30 rounded-lg p-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Saldo disponível:</span>
                  <span className="text-white font-semibold">
                    {availableBalance.usdc.toLocaleString("pt-BR", {
                      minimumFractionDigits: 2,
                    })}{" "}
                    USDC
                  </span>
                </div>
                <div className="flex justify-between items-center mt-1">
                  <span className="text-gray-400">Em reais:</span>
                  <span className="text-gray-300">
                    R${" "}
                    {(availableBalance.usdc * exchangeRate).toLocaleString(
                      "pt-BR",
                      { minimumFractionDigits: 2 }
                    )}
                  </span>
                </div>
              </div>

              {/* Minimum Amount Info */}
              {method && (
                <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3">
                  <p className="text-blue-400 text-sm">
                    Valor mínimo:{" "}
                    {method.minAmount.brl > 0
                      ? `R$ ${method.minAmount.brl}`
                      : ""}
                    {method.minAmount.brl > 0 && method.minAmount.usdc > 0
                      ? " ou "
                      : ""}
                    {method.minAmount.usdc > 0
                      ? `$${method.minAmount.usdc} USDC`
                      : ""}
                  </p>
                </div>
              )}

              <Button
                onClick={handleAmountNext}
                disabled={!amount || !validateAmount()}
                className="w-full bg-green-600 hover:bg-green-700 py-3"
              >
                Continuar
              </Button>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  // Details Step - Different forms based on method
  if (currentStep === "details") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 pb-20">
        <div className="p-6 border-b border-gray-700">
          <div className="flex items-center gap-3">
            <Button
              onClick={() => setCurrentStep("amount")}
              variant="outline"
              size="sm"
              className="border-gray-600"
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <h1 className="text-2xl font-bold text-white">
              Dados para Resgate
            </h1>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* PIX Form */}
          {selectedMethod === "pix" && (
            <Card className="backdrop-blur-md bg-white/10 border-white/20 p-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white mb-4">
                  Dados do PIX
                </h3>

                {/* QR Code Scanner Option */}
                <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4 mb-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <QrCode className="w-6 h-6 text-blue-400" />
                      <div>
                        <p className="text-blue-400 font-medium">
                          Escanear QR Code
                        </p>
                        <p className="text-blue-300/70 text-sm">
                          Forma mais rápida de preencher os dados
                        </p>
                      </div>
                    </div>
                    <Button
                      onClick={handleQRScan} // Usar handleQRScan ao invés de simulateQRScan
                      disabled={showQRCamera}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2"
                    >
                      {showQRCamera ? (
                        <div className="flex items-center space-x-2">
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          <span>Escaneando...</span>
                        </div>
                      ) : (
                        <div className="flex items-center space-x-2">
                          <Camera className="w-4 h-4" />
                          <span>Escanear</span>
                        </div>
                      )}
                    </Button>
                  </div>
                </div>

                {/* QR Camera Modal */}
                {showQRCamera && (
                  <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center">
                    <div className="bg-gray-900 rounded-2xl p-6 w-full max-w-sm mx-4 relative">
                      <button
                        onClick={() => {
                          stopCamera();
                          setShowQRCamera(false);
                        }}
                        className="absolute top-4 right-4 text-gray-400 hover:text-white z-10"
                      >
                        <X className="w-6 h-6" />
                      </button>

                      <div className="text-center">
                        <h3 className="text-lg font-semibold text-white mb-4">
                          Escaneie o QR Code PIX
                        </h3>

                        {/* Container do vídeo */}
                        <div className="relative w-full max-w-md mx-auto mb-4">
                          <div
                            className="relative bg-black rounded-2xl overflow-hidden"
                            style={{ paddingBottom: "100%" }}
                          >
                            <div className="absolute inset-0">
                              <video
                                ref={videoRef}
                                autoPlay
                                playsInline
                                muted
                                className="w-full h-full object-cover"
                                style={{
                                  display: isScanning ? "block" : "none",
                                  transform: "scaleX(-1)",
                                }}
                              />
                              <canvas
                                ref={canvasRef}
                                style={{ display: "none" }}
                              />
                            </div>

                            {/* Overlay de scanning */}
                            {isScanning && (
                              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                <div className="w-48 h-48 border-2 border-blue-500 rounded-xl relative">
                                  <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-blue-500 rounded-tl-lg" />
                                  <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-blue-500 rounded-tr-lg" />
                                  <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-blue-500 rounded-bl-lg" />
                                  <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-blue-500 rounded-br-lg" />
                                </div>
                              </div>
                            )}

                            {/* Placeholder quando não está escaneando */}
                            {!isScanning && (
                              <div className="absolute inset-0 flex items-center justify-center bg-gray-800">
                                <div className="text-center">
                                  <Camera className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                                  <p className="text-gray-400 text-sm">
                                    Iniciando câmera...
                                  </p>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>

                        {cameraError && (
                          <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 mb-4">
                            <p className="text-red-400 text-sm">
                              {cameraError}
                            </p>
                          </div>
                        )}

                        <p className="text-sm text-gray-400">
                          {isScanning
                            ? "Posicione o QR Code na área marcada"
                            : "Aguarde..."}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                <style>{`
                @keyframes scan {
                  0%, 100% { transform: translateY(0); }
                  50% { transform: translateY(192px); }
                }
              `}</style>

                <div className="relative">
                  <div className="flex items-center mb-4">
                    <div className="flex-1 h-px bg-gray-600"></div>
                    <span className="px-3 text-gray-400 text-sm">
                      ou digite manualmente
                    </span>
                    <div className="flex-1 h-px bg-gray-600"></div>
                  </div>
                </div>

                <div>
                  <label className="text-white font-semibold block mb-2">
                    Tipo de chave PIX
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { value: "cpf", label: "CPF" },
                      { value: "email", label: "E-mail" },
                      { value: "phone", label: "Celular" },
                      { value: "random", label: "Aleatória" },
                    ].map((type) => (
                      <button
                        key={type.value}
                        onClick={() =>
                          setPixData({ ...pixData, keyType: type.value as any })
                        }
                        className={`p-3 rounded-lg border transition-all ${
                          pixData.keyType === type.value
                            ? "border-green-500 bg-green-500/10 text-green-400"
                            : "border-gray-600 bg-gray-800/30 text-gray-300 hover:border-gray-500"
                        }`}
                      >
                        {type.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-white font-semibold block mb-2">
                    Chave PIX
                  </label>
                  <MaskedInput
                    mask={
                      pixData.keyType === "cpf"
                        ? "cpf"
                        : pixData.keyType === "phone"
                        ? "phone"
                        : "none"
                    }
                    value={pixData.key}
                    onChange={(value) => setPixData({ ...pixData, key: value })}
                    placeholder={
                      pixData.keyType === "cpf"
                        ? "000.000.000-00"
                        : pixData.keyType === "email"
                        ? "seu@email.com"
                        : pixData.keyType === "phone"
                        ? "(11) 99999-9999"
                        : "Cole sua chave aleatória"
                    }
                    className="bg-gray-800/50 border-gray-600 text-white"
                  />
                </div>

                <Button
                  onClick={handleDetailsNext}
                  disabled={!pixData.key}
                  className="w-full bg-green-600 hover:bg-green-700 py-3"
                >
                  {needsBiometric()
                    ? "Continuar para Biometria"
                    : "Confirmar Resgate"}
                </Button>
              </div>
            </Card>
          )}

          {/* Bank Transfer Form */}
          {selectedMethod === "bank-transfer" && (
            <Card className="backdrop-blur-md bg-white/10 border-white/20 p-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white mb-4">
                  Dados Bancários
                </h3>

                <div>
                  <label className="text-white font-semibold block mb-2">
                    Nome do titular
                  </label>
                  <Input
                    value={bankData.name}
                    onChange={(e) =>
                      setBankData({ ...bankData, name: e.target.value })
                    }
                    placeholder="Nome completo"
                    className="bg-gray-800/50 border-gray-600 text-white"
                  />
                </div>

                <div>
                  <label className="text-white font-semibold block mb-2">
                    CPF
                  </label>
                  <MaskedInput
                    mask="cpf"
                    value={bankData.cpf}
                    onChange={(value) =>
                      setBankData({ ...bankData, cpf: value })
                    }
                    placeholder="000.000.000-00"
                    className="bg-gray-800/50 border-gray-600 text-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-white font-semibold block mb-2">
                      Banco
                    </label>
                    <Input
                      value={bankData.bank}
                      onChange={(e) =>
                        setBankData({ ...bankData, bank: e.target.value })
                      }
                      placeholder="Ex: 341 - Itaú"
                      className="bg-gray-800/50 border-gray-600 text-white"
                    />
                  </div>
                  <div>
                    <label className="text-white font-semibold block mb-2">
                      Agência
                    </label>
                    <Input
                      value={bankData.agency}
                      onChange={(e) =>
                        setBankData({ ...bankData, agency: e.target.value })
                      }
                      placeholder="0000"
                      className="bg-gray-800/50 border-gray-600 text-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-white font-semibold block mb-2">
                      Conta
                    </label>
                    <Input
                      value={bankData.account}
                      onChange={(e) =>
                        setBankData({ ...bankData, account: e.target.value })
                      }
                      placeholder="00000-0"
                      className="bg-gray-800/50 border-gray-600 text-white"
                    />
                  </div>
                  <div>
                    <label className="text-white font-semibold block mb-2">
                      Tipo
                    </label>
                    <select
                      value={bankData.accountType}
                      onChange={(e) =>
                        setBankData({
                          ...bankData,
                          accountType: e.target.value as any,
                        })
                      }
                      className="w-full p-3 rounded-lg bg-gray-800/50 border border-gray-600 text-white"
                    >
                      <option value="checking">Corrente</option>
                      <option value="savings">Poupança</option>
                    </select>
                  </div>
                </div>

                <Button
                  onClick={handleDetailsNext}
                  disabled={
                    !bankData.name ||
                    !bankData.cpf ||
                    !bankData.bank ||
                    !bankData.agency ||
                    !bankData.account
                  }
                  className="w-full bg-green-600 hover:bg-green-700 py-3"
                >
                  {needsBiometric()
                    ? "Continuar para Biometria"
                    : "Confirmar Resgate"}
                </Button>
              </div>
            </Card>
          )}

          {/* Stablecoin Form */}
          {selectedMethod === "stablecoin" && (
            <Card className="backdrop-blur-md bg-white/10 border-white/20 p-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white mb-4">
                  Carteira de Destino
                </h3>

                <div>
                  <label className="text-white font-semibold block mb-2">
                    Rede blockchain
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { value: "polygon", label: "Polygon", fee: "~$0.01" },
                      { value: "ethereum", label: "Ethereum", fee: "~$5-15" },
                      { value: "arbitrum", label: "Arbitrum", fee: "~$0.50" },
                    ].map((network) => (
                      <button
                        key={network.value}
                        onClick={() =>
                          setStablecoinData({
                            ...stablecoinData,
                            network: network.value as any,
                          })
                        }
                        className={`p-3 rounded-lg border transition-all text-center ${
                          stablecoinData.network === network.value
                            ? "border-purple-500 bg-purple-500/10 text-purple-400"
                            : "border-gray-600 bg-gray-800/30 text-gray-300 hover:border-gray-500"
                        }`}
                      >
                        <div className="font-semibold">{network.label}</div>
                        <div className="text-xs opacity-70">{network.fee}</div>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-white font-semibold block mb-2">
                    Endereço da carteira
                  </label>
                  <Input
                    value={stablecoinData.address}
                    onChange={(e) =>
                      setStablecoinData({
                        ...stablecoinData,
                        address: e.target.value,
                      })
                    }
                    placeholder="0x..."
                    className="bg-gray-800/50 border-gray-600 text-white font-mono text-sm"
                  />
                  <p className="text-gray-400 text-xs mt-1">
                    Certifique-se de que o endereço está correto. Transferências
                    não podem ser revertidas.
                  </p>
                </div>

                <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-amber-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-amber-400 font-semibold text-sm mb-1">
                        Atenção
                      </p>
                      <p className="text-gray-300 text-sm">
                        Verifique se sua carteira suporta USDC na rede{" "}
                        {stablecoinData.network === "polygon"
                          ? "Polygon"
                          : stablecoinData.network === "ethereum"
                          ? "Ethereum"
                          : "Arbitrum"}
                        .
                      </p>
                    </div>
                  </div>
                </div>

                <Button
                  onClick={handleDetailsNext}
                  disabled={!stablecoinData.address}
                  className="w-full bg-purple-600 hover:bg-purple-700 py-3"
                >
                  {needsBiometric()
                    ? "Continuar para Biometria"
                    : "Confirmar Resgate"}
                </Button>
              </div>
            </Card>
          )}

          {/* Wire Transfer Form */}
          {selectedMethod === "wire-transfer" && (
            <Card className="backdrop-blur-md bg-white/10 border-white/20 p-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white mb-4">
                  Dados Bancários Internacionais
                </h3>

                <div>
                  <label className="text-white font-semibold block mb-2">
                    Nome do beneficiário
                  </label>
                  <Input
                    value={wireData.beneficiaryName}
                    onChange={(e) =>
                      setWireData({
                        ...wireData,
                        beneficiaryName: e.target.value,
                      })
                    }
                    placeholder="Nome completo"
                    className="bg-gray-800/50 border-gray-600 text-white"
                  />
                </div>

                <div>
                  <label className="text-white font-semibold block mb-2">
                    Nome do banco
                  </label>
                  <Input
                    value={wireData.bankName}
                    onChange={(e) =>
                      setWireData({ ...wireData, bankName: e.target.value })
                    }
                    placeholder="Ex: Chase Bank"
                    className="bg-gray-800/50 border-gray-600 text-white"
                  />
                </div>

                <div>
                  <label className="text-white font-semibold block mb-2">
                    Endereço do banco
                  </label>
                  <Input
                    value={wireData.bankAddress}
                    onChange={(e) =>
                      setWireData({ ...wireData, bankAddress: e.target.value })
                    }
                    placeholder="Endereço completo"
                    className="bg-gray-800/50 border-gray-600 text-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-white font-semibold block mb-2">
                      Código SWIFT
                    </label>
                    <Input
                      value={wireData.swiftCode}
                      onChange={(e) =>
                        setWireData({ ...wireData, swiftCode: e.target.value })
                      }
                      placeholder="CHASUS33"
                      className="bg-gray-800/50 border-gray-600 text-white"
                    />
                  </div>
                  <div>
                    <label className="text-white font-semibold block mb-2">
                      Número da conta
                    </label>
                    <Input
                      value={wireData.accountNumber}
                      onChange={(e) =>
                        setWireData({
                          ...wireData,
                          accountNumber: e.target.value,
                        })
                      }
                      placeholder="123456789"
                      className="bg-gray-800/50 border-gray-600 text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-white font-semibold block mb-2">
                    Routing Number (se aplicável)
                  </label>
                  <Input
                    value={wireData.routingNumber}
                    onChange={(e) =>
                      setWireData({
                        ...wireData,
                        routingNumber: e.target.value,
                      })
                    }
                    placeholder="021000021"
                    className="bg-gray-800/50 border-gray-600 text-white"
                  />
                </div>

                <Button
                  onClick={handleDetailsNext}
                  disabled={
                    !wireData.beneficiaryName ||
                    !wireData.bankName ||
                    !wireData.swiftCode ||
                    !wireData.accountNumber
                  }
                  className="w-full bg-orange-600 hover:bg-orange-700 py-3"
                >
                  {needsBiometric()
                    ? "Continuar para Biometria"
                    : "Confirmar Resgate"}
                </Button>
              </div>
            </Card>
          )}
        </div>
      </div>
    );
  }

  // Biometric Verification Step
  if (currentStep === "biometric") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center px-6">
        <Card className="backdrop-blur-md bg-white/10 border-white/20 p-8 text-center max-w-md mx-auto">
          <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
            <Fingerprint className="w-10 h-10 text-white" />
          </div>

          <h2 className="text-2xl font-bold text-white mb-2">
            Verificação Biométrica
          </h2>
          <p className="text-gray-400 mb-6">
            Para resgates acima de{" "}
            {amountCurrency === "BRL" ? "R$ 5.000" : "1.000 USDC"}, precisamos
            confirmar sua identidade
          </p>

          <div className="space-y-4">
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
              <p className="text-blue-400 text-sm">
                Valor do resgate:{" "}
                <span className="font-semibold">
                  {amountCurrency === "BRL" ? "R$" : "$"} {amount}{" "}
                  {amountCurrency === "USDC" ? "USDC" : ""}
                </span>
              </p>
            </div>

            <Button
              onClick={handleBiometricComplete}
              className="w-full bg-blue-600 hover:bg-blue-700 py-3"
            >
              <Fingerprint className="w-5 h-5 mr-2" />
              Verificar Biometria
            </Button>

            <Button
              onClick={() => setCurrentStep("details")}
              variant="outline"
              className="w-full border-gray-600"
            >
              Voltar
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  // Processing Step
  if (currentStep === "processing") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center px-6">
        <Card className="backdrop-blur-md bg-white/10 border-white/20 p-8 text-center max-w-md mx-auto">
          <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin" />
          </div>

          <h2 className="text-2xl font-bold text-white mb-2">
            Processando Resgate
          </h2>
          <p className="text-gray-400 mb-6">
            Aguarde enquanto processamos sua solicitação de resgate...
          </p>

          <div className="space-y-3 text-left">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <span className="text-sm text-gray-300">Dados validados</span>
            </div>
            <div className="flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <span className="text-sm text-gray-300">
                Biometria confirmada
              </span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
              <span className="text-sm text-gray-300">
                Processando transferência...
              </span>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  // Success Step
  if (currentStep === "success") {
    const method = withdrawMethods.find((m) => m.id === selectedMethod);

    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center px-6">
        <Card className="backdrop-blur-md bg-white/10 border-white/20 p-8 text-center max-w-md mx-auto">
          <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center">
            <CheckCircle className="w-8 h-8 text-white" />
          </div>

          <h2 className="text-2xl font-bold text-white mb-2">
            Resgate Solicitado!
          </h2>
          <p className="text-gray-400 mb-6">
            Sua solicitação foi processada com sucesso
          </p>

          <div className="space-y-4 mb-8">
            <div className="bg-gray-800/50 rounded-lg p-4 text-left">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-400">Método:</span>
                  <span className="text-white">{method?.title}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Valor:</span>
                  <span className="text-white font-semibold">
                    {amountCurrency === "BRL" ? "R$" : "$"} {amount}{" "}
                    {amountCurrency === "USDC" ? "USDC" : ""}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Tempo esperado:</span>
                  <span className="text-white">{method?.time}</span>
                </div>
              </div>
            </div>

            <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
              <p className="text-blue-400 text-sm">
                Você receberá uma notificação quando o resgate for concluído
              </p>
            </div>
          </div>

          <Button
            onClick={handleComplete}
            className="w-full bg-green-600 hover:bg-green-700 py-3"
          >
            Concluir
          </Button>
        </Card>
      </div>
    );
  }

  return null;
};
