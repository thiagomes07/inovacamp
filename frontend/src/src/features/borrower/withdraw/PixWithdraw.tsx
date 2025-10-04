import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  QrCode, 
  Copy, 
  Keyboard, 
  Camera, 
  CheckCircle, 
  Share,
  DollarSign,
  Clock,
  Shield,
  X,
  AlertCircle
} from 'lucide-react';

// Declare jsQR global type
declare global {
  interface Window {
    jsQR: any;
  }
}

type PixMethod = 'select' | 'qr-code' | 'copy-paste' | 'manual-key' | 'confirm-amount' | 'biometric' | 'processing' | 'receipt';

interface PixWithdrawProps {
  balance: number;
  onComplete: () => void;
}

export const PixWithdraw: React.FC<PixWithdrawProps> = ({
  balance,
  onComplete
}) => {
  const [currentStep, setCurrentStep] = useState<PixMethod>('select');
  const [pixData, setPixData] = useState({
    method: '',
    code: '',
    key: '',
    amount: '',
    recipient: ''
  });
  const [isScanning, setIsScanning] = useState(false);
  const [scannedCode, setScannedCode] = useState('');
  const [cameraError, setCameraError] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [jsQRLoaded, setJsQRLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const scanIntervalRef = useRef<number | null>(null);

  // Load jsQR library
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/jsqr@1.4.0/dist/jsQR.js';
    script.async = true;
    script.onload = () => {
      console.log('jsQR library loaded successfully');
      setJsQRLoaded(true);
    };
    script.onerror = () => {
      console.error('Failed to load jsQR library');
      setCameraError('Erro ao carregar biblioteca de leitura de QR Code');
    };
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  // Cleanup camera on unmount or step change
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
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsScanning(false);
  };

  const startCamera = async () => {
    if (!jsQRLoaded) {
      setCameraError('Aguarde o carregamento da biblioteca...');
      return;
    }
    
    setCameraError('');
    setScannedCode('');
    
    try {
      const constraints = {
        video: { 
          facingMode: 'environment',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      };
      
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      
      streamRef.current = stream;
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        
        // Force video to play
        videoRef.current.onloadedmetadata = async () => {
          try {
            await videoRef.current?.play();
            console.log('Vídeo iniciado com sucesso');
            setIsScanning(true);
            
            // Start scanning for QR codes after video starts
            setTimeout(() => {
              console.log('Iniciando varredura de QR Code...');
              scanIntervalRef.current = window.setInterval(() => {
                scanQRCode();
              }, 300); // Scan every 300ms for better detection
            }, 1000);
          } catch (err) {
            console.error('Erro ao reproduzir vídeo:', err);
            setCameraError('Erro ao iniciar visualização da câmera');
          }
        };
      }
    } catch (error: any) {
      console.error('Erro ao acessar câmera:', error);
      let errorMessage = 'Não foi possível acessar a câmera.';
      
      if (error.name === 'NotAllowedError') {
        errorMessage = 'Permissão de câmera negada. Permita o acesso nas configurações.';
      } else if (error.name === 'NotFoundError') {
        errorMessage = 'Nenhuma câmera encontrada no dispositivo.';
      }
      
      setCameraError(errorMessage);
      setIsScanning(false);
    }
  };

  const scanQRCode = () => {
    if (!videoRef.current || !canvasRef.current || !window.jsQR) {
      console.log('Waiting for jsQR to load or video ready...');
      return;
    }
    
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d', { willReadFrequently: true });
    
    if (!context || video.readyState !== video.HAVE_ENOUGH_DATA) {
      return;
    }
    
    // Set canvas size to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    // Draw current video frame to canvas
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    // Get image data from canvas
    const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
    
    // Scan for QR code
    const code = window.jsQR(imageData.data, imageData.width, imageData.height, {
      inversionAttempts: 'dontInvert',
    });
    
    if (code && code.data) {
      console.log('QR Code detected:', code.data);
      handleQRCodeDetected(code.data);
    }
  };

  const handleQRCodeDetected = (data: string) => {
    stopCamera();
    setScannedCode(data);
    
    // Store full code without truncation
    setPixData(prev => ({
      ...prev,
      method: 'qr-code',
      code: data,
      amount: '',
      recipient: data.length > 50 ? data.substring(0, 50) + '...' : data
    }));
    
    setCurrentStep('confirm-amount');
  };

  const handleCopyPaste = () => {
    if (!pixData.code.trim()) {
      setErrorMessage('Cole o código PIX no campo acima');
      return;
    }
    
    setErrorMessage('');
    setPixData(prev => ({
      ...prev,
      method: 'copy-paste',
      amount: '',
      recipient: prev.code.length > 50 ? prev.code.substring(0, 50) + '...' : prev.code
    }));
    setCurrentStep('confirm-amount');
  };

  const handleManualKey = () => {
    if (!pixData.key.trim()) {
      setErrorMessage('Digite uma chave PIX válida');
      return;
    }
    
    setErrorMessage('');
    setPixData(prev => ({
      ...prev,
      method: 'manual-key',
      code: prev.key,
      recipient: prev.key.length > 50 ? prev.key.substring(0, 50) + '...' : prev.key
    }));
    setCurrentStep('confirm-amount');
  };

  const handleConfirmAmount = () => {
    const amount = parseFloat(pixData.amount.replace(',', '.'));
    
    if (!amount || amount <= 0) {
      setErrorMessage('Digite um valor válido');
      return;
    }
    
    if (amount > balance) {
      setErrorMessage('Valor excede o saldo disponível');
      return;
    }

    setErrorMessage('');

    if (amount > 500) {
      setCurrentStep('biometric');
    } else {
      processPixPayment();
    }
  };

  const handleBiometricVerification = () => {
    setTimeout(() => {
      processPixPayment();
    }, 2000);
  };

  const processPixPayment = async () => {
    setCurrentStep('processing');
    setIsLoading(true);
    setError(null);
    setSuccess(false);
    
    try {
      // Get user ID from localStorage
      const swapinUserData = localStorage.getItem('swapin_user');
      if (!swapinUserData) {
        throw new Error('Usuário não encontrado. Faça login novamente.');
      }
      
      const userData = JSON.parse(swapinUserData);
      const userId = userData.id;
      
      if (!userId) {
        throw new Error('ID do usuário não encontrado.');
      }

      // Prepare request body
      const requestBody = {
        pixCode: pixData.code,
        amount: parseFloat(pixData.amount.replace(',', '.')),
        userId: userId
      };

      // Make API call
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/pix/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Erro ao processar o pagamento PIX');
      }

      const responseData = await response.json();
      
      setIsLoading(false);
      setSuccess(true);
      
      // Wait a bit before showing receipt
      setTimeout(() => {
        setCurrentStep('receipt');
      }, 1500);
      
    } catch (err: any) {
      console.error('Erro ao processar PIX:', err);
      setIsLoading(false);
      setError(err.message || 'Ocorreu um erro ao enviar o PIX. Tente novamente.');
      setErrorMessage(err.message || 'Ocorreu um erro ao enviar o PIX. Tente novamente.');
    }
  };

  const handleShare = () => {
    const receiptText = `
🧾 Comprovante PIX - Swapin

💰 Valor: R$ ${parseFloat(pixData.amount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
👤 Para: ${pixData.recipient}
📅 Data: ${new Date().toLocaleString('pt-BR')}
🔢 ID: ${Math.random().toString(36).substr(2, 9).toUpperCase()}

✅ Transação realizada com sucesso
    `;
    
    if (navigator.share) {
      navigator.share({
        title: 'Comprovante PIX',
        text: receiptText
      }).catch(() => {
        navigator.clipboard.writeText(receiptText);
      });
    } else {
      navigator.clipboard.writeText(receiptText);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-6">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ x: 20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: -20, opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          {currentStep === 'select' && (
            <div className="backdrop-blur-md bg-white/10 border border-white/20 rounded-2xl p-6">
              <h2 className="text-lg font-semibold text-white mb-4">
                Como você quer pagar?
              </h2>
              
              <div className="space-y-3">
                <button
                  onClick={() => setCurrentStep('qr-code')}
                  className="w-full p-4 rounded-xl border border-gray-600 bg-gray-800/50 hover:border-green-500 hover:bg-green-500/10 transition-all text-left"
                >
                  <div className="flex items-center gap-3">
                    <QrCode className="w-6 h-6 text-green-400" />
                    <div>
                      <h3 className="text-white font-semibold">Ler QR Code</h3>
                      <p className="text-gray-400 text-sm">Aponte a câmera para o código</p>
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => setCurrentStep('copy-paste')}
                  className="w-full p-4 rounded-xl border border-gray-600 bg-gray-800/50 hover:border-blue-500 hover:bg-blue-500/10 transition-all text-left"
                >
                  <div className="flex items-center gap-3">
                    <Copy className="w-6 h-6 text-blue-400" />
                    <div>
                      <h3 className="text-white font-semibold">Copia e Cola</h3>
                      <p className="text-gray-400 text-sm">Cole o código PIX copiado</p>
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => setCurrentStep('manual-key')}
                  className="w-full p-4 rounded-xl border border-gray-600 bg-gray-800/50 hover:border-purple-500 hover:bg-purple-500/10 transition-all text-left"
                >
                  <div className="flex items-center gap-3">
                    <Keyboard className="w-6 h-6 text-purple-400" />
                    <div>
                      <h3 className="text-white font-semibold">Inserir Chave</h3>
                      <p className="text-gray-400 text-sm">CPF, email, celular ou chave aleatória</p>
                    </div>
                  </div>
                </button>
              </div>
            </div>
          )}

          {currentStep === 'qr-code' && (
            <div className="backdrop-blur-md bg-white/10 border border-white/20 rounded-2xl p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-white">
                  Escaneie o QR Code
                </h2>
                <button
                  onClick={() => {
                    stopCamera();
                    setCurrentStep('select');
                  }}
                  className="text-gray-400 hover:text-white"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              <div className="space-y-6">
                <div className="relative w-full max-w-md mx-auto">
                  <div className="relative bg-black rounded-2xl overflow-hidden" style={{ paddingBottom: '100%' }}>
                    {/* Video container */}
                    <div className="absolute inset-0">
                      <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        muted
                        className="w-full h-full object-cover"
                        style={{ 
                          display: isScanning ? 'block' : 'none',
                          transform: 'scaleX(-1)'
                        }}
                      />
                      <canvas ref={canvasRef} style={{ display: 'none' }} />
                    </div>
                    
                    {/* Placeholder when not scanning */}
                    {!isScanning && (
                      <div className="absolute inset-0 flex items-center justify-center bg-gray-800">
                        <div className="text-center">
                          <Camera className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                          <p className="text-gray-400 text-sm">Aponte a câmera para o QR Code</p>
                        </div>
                      </div>
                    )}
                    
                    {/* Scanning overlay - only show when scanning */}
                    {isScanning && (
                      <>
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                          <div className="w-48 h-48 border-2 border-green-500 rounded-xl relative">
                            <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-green-500 rounded-tl-lg" />
                            <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-green-500 rounded-tr-lg" />
                            <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-green-500 rounded-bl-lg" />
                            <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-green-500 rounded-br-lg" />
                            
                            {/* Scanning line animation */}
                            <div className="absolute inset-0 overflow-hidden rounded-xl">
                              <div 
                                className="w-full h-1 bg-green-400 shadow-lg shadow-green-400/50"
                                style={{
                                  animation: 'scan 2s ease-in-out infinite'
                                }}
                              />
                            </div>
                          </div>
                        </div>
                        
                        <div className="absolute bottom-4 left-0 right-0 text-center">
                          <p className="text-white text-sm bg-black/70 py-2 px-4 rounded-full inline-block">
                            🔍 Procurando QR Code...
                          </p>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {cameraError && (
                  <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4">
                    <p className="text-red-400 text-sm">{cameraError}</p>
                  </div>
                )}

                {scannedCode && (
                  <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4">
                    <p className="text-green-400 text-sm font-mono break-all">
                      {scannedCode.length > 100 ? scannedCode.substring(0, 100) + '...' : scannedCode}
                    </p>
                  </div>
                )}

                <button
                  onClick={isScanning ? stopCamera : startCamera}
                  disabled={!jsQRLoaded && !isScanning}
                  className={`w-full py-3 rounded-xl font-semibold transition-colors ${
                    isScanning
                      ? 'bg-red-600 hover:bg-red-700 text-white'
                      : 'bg-green-600 hover:bg-green-700 text-white disabled:opacity-50 disabled:cursor-not-allowed'
                  }`}
                >
                  {!jsQRLoaded && !isScanning ? 'Carregando...' : isScanning ? 'Parar Câmera' : 'Iniciar Câmera'}
                </button>
              </div>
            </div>
          )}

          {currentStep === 'copy-paste' && (
            <div className="backdrop-blur-md bg-white/10 border border-white/20 rounded-2xl p-6">
              <h2 className="text-lg font-semibold text-white mb-4">
                Cole o código PIX
              </h2>
              
              <div className="space-y-4">
                {errorMessage && (
                  <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4">
                    <p className="text-red-400 text-sm">{errorMessage}</p>
                  </div>
                )}
                
                <div>
                  <label className="text-white font-semibold mb-2 block">
                    Código PIX copiado
                  </label>
                  <textarea
                    value={pixData.code}
                    onChange={(e) => {
                      setPixData(prev => ({...prev, code: e.target.value}));
                      setErrorMessage('');
                    }}
                    placeholder="00020126580014BR.GOV.BCB.PIX..."
                    className="w-full h-24 bg-gray-800/50 border border-gray-600 rounded-xl p-3 text-white placeholder-gray-500 resize-none"
                  />
                </div>

                <button
                  onClick={handleCopyPaste}
                  disabled={!pixData.code.trim()}
                  className="w-full bg-blue-600 hover:bg-blue-700 py-3 rounded-xl text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Processar Código PIX
                </button>
              </div>
            </div>
          )}

          {currentStep === 'manual-key' && (
            <div className="backdrop-blur-md bg-white/10 border border-white/20 rounded-2xl p-6">
              <h2 className="text-lg font-semibold text-white mb-4">
                Digite a chave PIX
              </h2>
              
              <div className="space-y-4">
                {errorMessage && (
                  <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4">
                    <p className="text-red-400 text-sm">{errorMessage}</p>
                  </div>
                )}
                
                <div>
                  <label className="text-white font-semibold mb-2 block">
                    Chave PIX do destinatário
                  </label>
                  <input
                    value={pixData.key}
                    onChange={(e) => {
                      setPixData(prev => ({...prev, key: e.target.value}));
                      setErrorMessage('');
                    }}
                    placeholder="CPF, email, celular ou chave aleatória"
                    className="w-full bg-gray-800/50 border border-gray-600 rounded-xl p-3 text-white placeholder-gray-500"
                  />
                  <p className="text-gray-400 text-sm mt-1">
                    Ex: 000.000.000-00, email@exemplo.com, (11) 99999-9999
                  </p>
                </div>

                <button
                  onClick={handleManualKey}
                  disabled={!pixData.key.trim()}
                  className="w-full bg-purple-600 hover:bg-purple-700 py-3 rounded-xl text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Continuar
                </button>
              </div>
            </div>
          )}

          {currentStep === 'confirm-amount' && (
            <div className="backdrop-blur-md bg-white/10 border border-white/20 rounded-2xl p-6">
              <h2 className="text-lg font-semibold text-white mb-4">
                Confirme os dados
              </h2>
              
              <div className="space-y-4">
                {errorMessage && (
                  <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4">
                    <p className="text-red-400 text-sm">{errorMessage}</p>
                  </div>
                )}
                
                <div className="bg-gray-800/50 rounded-xl p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                      <QrCode className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-gray-400 text-sm">Código PIX</p>
                      <p className="text-white font-mono text-sm break-all">{pixData.recipient}</p>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="text-white font-semibold mb-2 block">
                    Valor a enviar
                  </label>
                  <input
                    type="text"
                    value={pixData.amount}
                    onChange={(e) => {
                      setPixData(prev => ({...prev, amount: e.target.value}));
                      setErrorMessage('');
                    }}
                    placeholder="R$ 0,00"
                    className="w-full bg-gray-800/50 border border-gray-600 rounded-xl p-3 text-white text-xl"
                  />
                  <p className="text-gray-400 text-sm mt-1">
                    Disponível: R$ {balance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </p>
                </div>

                {parseFloat(pixData.amount.replace(',', '.')) > 500 && (
                  <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Shield className="w-5 h-5 text-yellow-400" />
                      <span className="text-yellow-400 font-semibold">Verificação Necessária</span>
                    </div>
                    <p className="text-gray-300 text-sm">
                      Valores acima de R$ 500 requerem verificação biométrica para segurança
                    </p>
                  </div>
                )}

                <button
                  onClick={handleConfirmAmount}
                  disabled={!pixData.amount || parseFloat(pixData.amount.replace(',', '.')) <= 0}
                  className="w-full bg-green-600 hover:bg-green-700 py-3 rounded-xl text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Confirmar PIX
                </button>
              </div>
            </div>
          )}

          {currentStep === 'biometric' && (
            <div className="backdrop-blur-md bg-white/10 border border-white/20 rounded-2xl p-6 text-center">
              <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                <Shield className="w-10 h-10 text-white animate-pulse" />
              </div>
              
              <h2 className="text-2xl font-bold text-white mb-4">
                Verificação Biométrica
              </h2>
              
              <p className="text-gray-300 mb-6">
                Posicione seu rosto na câmera para confirmar a transação
              </p>
              
              <div className="w-32 h-32 mx-auto mb-6 border-4 border-blue-500 rounded-full relative">
                <div className="absolute inset-0 border-4 border-transparent border-t-blue-400 rounded-full animate-spin" />
                <div className="absolute inset-4 bg-blue-500/20 rounded-full flex items-center justify-center">
                  <div className="w-12 h-12 bg-blue-500/40 rounded-full" />
                </div>
              </div>
              
              <button
                onClick={handleBiometricVerification}
                className="w-full bg-blue-600 hover:bg-blue-700 py-3 rounded-xl text-white font-semibold"
              >
                Iniciar Verificação
              </button>
            </div>
          )}

          {currentStep === 'processing' && (
            <div className="backdrop-blur-md bg-white/10 border border-white/20 rounded-2xl p-6 text-center">
              <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center">
                <Clock className="w-10 h-10 text-white animate-pulse" />
              </div>
              
              <h2 className="text-2xl font-bold text-white mb-4">
                {isLoading ? 'Processando PIX...' : success ? 'PIX Enviado!' : 'Erro no Processamento'}
              </h2>
              
              <p className="text-gray-300 mb-6">
                {isLoading ? 'Sua transação está sendo processada' : success ? 'Transação concluída com sucesso' : 'Ocorreu um problema'}
              </p>
              
              {error && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 mb-6">
                  <div className="flex items-center gap-2 justify-center mb-2">
                    <AlertCircle className="w-5 h-5 text-red-400" />
                    <span className="text-red-400 font-semibold">Erro</span>
                  </div>
                  <p className="text-red-400 text-sm">{error}</p>
                  <button
                    onClick={() => setCurrentStep('confirm-amount')}
                    className="mt-4 w-full bg-red-600 hover:bg-red-700 py-2 rounded-xl text-white font-semibold"
                  >
                    Tentar Novamente
                  </button>
                </div>
              )}
              
              {isLoading && (
                <div className="space-y-4">
                  <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-gray-400">Convertendo saldo...</span>
                      <span className="text-blue-400">100%</span>
</div>
<div className="w-full bg-gray-700 rounded-full h-2">
<div className="bg-blue-500 h-2 rounded-full w-full transition-all duration-1000" />
</div>
</div>              <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-400">Enviando PIX...</span>
                  <span className="text-green-400">Processando</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div className="bg-green-500 h-2 rounded-full w-3/4 transition-all duration-2000" />
                </div>
              </div>
            </div>
          )}          {success && (
            <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4">
              <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-2" />
              <p className="text-green-400 font-semibold">Aguarde, redirecionando...</p>
            </div>
          )}
        </div>
      )}      {currentStep === 'receipt' && (
        <div className="backdrop-blur-md bg-white/10 border border-white/20 rounded-2xl p-6 text-center">
          <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center">
            <CheckCircle className="w-10 h-10 text-white" />
          </div>          <h2 className="text-2xl font-bold text-white mb-4">
            PIX enviado com sucesso! ✅
          </h2>          <div className="bg-gray-800/50 rounded-xl p-4 mb-6 text-left">
            <h3 className="text-white font-semibold mb-3">🧾 Comprovante</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">Valor:</span>
                <span className="text-white font-semibold">
                  R$ {parseFloat(pixData.amount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Para:</span>
                <span className="text-white">{pixData.recipient}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Data:</span>
                <span className="text-white">{new Date().toLocaleString('pt-BR')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">ID:</span>
                <span className="text-white">{Math.random().toString(36).substr(2, 9).toUpperCase()}</span>
              </div>
            </div>
          </div>          <div className="space-y-3">
            <button
              onClick={handleShare}
              className="w-full border border-gray-600 text-gray-300 py-3 rounded-xl font-semibold hover:bg-white/5"
            >
              <Share className="w-4 h-4 inline mr-2" />
              Compartilhar Comprovante
            </button>            <button
              onClick={onComplete}
              className="w-full bg-green-600 hover:bg-green-700 py-3 rounded-xl text-white font-semibold"
            >
              Concluir
            </button>
          </div>
        </div>
      )}
    </motion.div>
  </AnimatePresence>  <style>{`
    @keyframes scan {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(192px); }
    }
  `}</style>
</div>
);
}