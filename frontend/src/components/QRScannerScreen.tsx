import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'motion/react';
import { useApp } from './AppProvider';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { toast } from 'sonner@2.0.3';
import { 
  ArrowLeft,
  Camera,
  Flashlight,
  FlashlightOff,
  ImageIcon,
  RefreshCw,
  AlertCircle
} from 'lucide-react';

interface QRScannerScreenProps {}

export const QRScannerScreen: React.FC<QRScannerScreenProps> = () => {
  const { setCurrentScreen, setQRData } = useApp();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [isCheckingPermission, setIsCheckingPermission] = useState(true);
  const [flashEnabled, setFlashEnabled] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animationFrameRef = useRef<number>();

  // Start camera stream
  const startCamera = async () => {
    try {
      setError(null);
      setIsCheckingPermission(true);
      
      // Check if mediaDevices is supported
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera not supported');
      }

      // Try different camera configurations for better compatibility
      const constraints: MediaStreamConstraints = {
        video: {
          facingMode: 'environment', // Use back camera
          width: { ideal: 1280, min: 640 },
          height: { ideal: 720, min: 480 }
        }
      };

      let stream: MediaStream;
      
      try {
        // Try with environment camera first
        stream = await navigator.mediaDevices.getUserMedia(constraints);
      } catch (envError) {
        // Fallback to any available camera
        console.log('Environment camera failed, trying any camera:', envError);
        stream = await navigator.mediaDevices.getUserMedia({
          video: {
            width: { ideal: 1280, min: 640 },
            height: { ideal: 720, min: 480 }
          }
        });
      }
      
      streamRef.current = stream;
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      
      setHasPermission(true);
      setIsScanning(true);
      setIsCheckingPermission(false);
      startQRDetection();
    } catch (err: any) {
      console.error('Error accessing camera:', err);
      setHasPermission(false);
      setIsCheckingPermission(false);
      
      let errorMessage = 'Não foi possível acessar a câmera.';
      
      if (err.name === 'NotAllowedError') {
        errorMessage = 'Permissão de câmera negada. Clique no ícone de câmera na barra de endereço e selecione "Permitir".';
      } else if (err.name === 'NotFoundError') {
        errorMessage = 'Nenhuma câmera encontrada no dispositivo. Use a opção "Escolher da Galeria" abaixo.';
      } else if (err.name === 'NotSupportedError') {
        errorMessage = 'Câmera não suportada neste navegador. Tente usar Chrome, Firefox ou Safari.';
      } else if (err.name === 'NotReadableError') {
        errorMessage = 'Câmera está sendo usada por outro aplicativo. Feche outros apps que usam câmera.';
      } else if (err.name === 'OverconstrainedError') {
        errorMessage = 'Configuração de câmera não suportada. Tente uma câmera diferente.';
      } else if (err.message === 'Camera not supported') {
        errorMessage = 'Este navegador não suporta acesso à câmera. Use a opção "Escolher da Galeria".';
      }
      
      setError(errorMessage);
      // Don't show toast for permission denied, the UI handles it
      if (err.name !== 'NotAllowedError') {
        toast.error('Erro ao acessar câmera');
      }
    }
  };

  // Stop camera stream
  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    setIsScanning(false);
  };

  // QR Code detection simulation (in a real app, you'd use a QR detection library)
  const startQRDetection = () => {
    const detectQR = () => {
      if (videoRef.current && canvasRef.current && isScanning) {
        const video = videoRef.current;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        
        if (ctx && video.readyState === video.HAVE_ENOUGH_DATA) {
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          ctx.drawImage(video, 0, 0);
          
          // In a real implementation, you would analyze the image data here
          // For demo purposes, we'll simulate QR detection after 3 seconds
          if (!hasDetectedQR) {
            setTimeout(() => {
              if (isScanning) {
                simulateQRDetection();
              }
            }, 3000);
            setHasDetectedQR(true);
          }
        }
        
        if (isScanning) {
          animationFrameRef.current = requestAnimationFrame(detectQR);
        }
      }
    };
    
    detectQR();
  };

  const [hasDetectedQR, setHasDetectedQR] = useState(false);

  // Simulate QR code detection with mock PIX data
  const simulateQRDetection = () => {
    const mockQRData = {
      recipientName: 'Maria Santos',
      recipientDocument: '123.456.789-00',
      amount: 150.00,
      currency: 'BRL',
      pixKey: 'maria.santos@email.com',
      pixKeyType: 'email' as const,
      description: 'Pagamento de serviços',
      transactionId: `qr_${Date.now()}`,
      bank: 'Banco do Brasil',
      city: 'São Paulo'
    };

    stopCamera();
    setQRData(mockQRData);
    setCurrentScreen('qr-confirmation');
    toast.success('QR Code detectado!');
  };

  // Toggle flash (if supported)
  const toggleFlash = async () => {
    if (streamRef.current) {
      const track = streamRef.current.getVideoTracks()[0];
      const capabilities = track.getCapabilities();
      
      if (capabilities.torch) {
        try {
          await track.applyConstraints({
            advanced: [{ torch: !flashEnabled } as any]
          });
          setFlashEnabled(!flashEnabled);
        } catch (err) {
          toast.error('Flash não disponível');
        }
      } else {
        toast.error('Flash não suportado neste dispositivo');
      }
    }
  };

  // Initialize camera on component mount
  useEffect(() => {
    // Add a small delay to ensure component is mounted
    const timer = setTimeout(() => {
      startCamera();
    }, 100);
    
    return () => {
      clearTimeout(timer);
      stopCamera();
    };
  }, []);

  // Handle back navigation
  const handleBack = () => {
    stopCamera();
    setCurrentScreen('pix-send');
  };

  // Handle file upload as alternative
  const handleFileUpload = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        // In a real app, you would process the image to extract QR code
        toast.success('Processando imagem...');
        setTimeout(() => {
          simulateQRDetection();
        }, 1500);
      }
    };
    input.click();
  };

  // Handle manual PIX key input
  const handleManualInput = () => {
    stopCamera();
    setCurrentScreen('qr-fallback');
    toast.info('Use as opções manuais para continuar');
  };

  // Render loading state while checking permission
  if (isCheckingPermission) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleBack}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar
          </Button>
          <h1 className="text-lg">Escaneie o QR Code</h1>
          <div className="w-16" />
        </div>

        {/* Loading */}
        <div className="flex-1 flex items-center justify-center p-6">
          <Card className="w-full max-w-sm">
            <CardContent className="p-6 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-[#007AFF]/10 flex items-center justify-center mx-auto">
                <Camera className="w-8 h-8 text-[#007AFF] animate-pulse" />
              </div>
              <div className="space-y-2">
                <h3>Iniciando Câmera</h3>
                <p className="text-sm text-muted-foreground">
                  Aguarde enquanto verificamos o acesso à câmera...
                </p>
              </div>
              <div className="flex items-center justify-center gap-2">
                <div className="w-2 h-2 bg-[#007AFF] rounded-full animate-bounce" />
                <div className="w-2 h-2 bg-[#007AFF] rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                <div className="w-2 h-2 bg-[#007AFF] rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Render camera permission request
  if (hasPermission === false) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleBack}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar
          </Button>
          <h1 className="text-lg">Escaneie o QR Code</h1>
          <div className="w-16" />
        </div>

        {/* Permission Error */}
        <div className="flex-1 flex items-center justify-center p-6">
          <Card className="w-full max-w-sm">
            <CardContent className="p-6 space-y-6">
              <div className="text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mx-auto">
                  <AlertCircle className="w-8 h-8 text-destructive" />
                </div>
                <div className="space-y-2">
                  <h3>Permissão de Câmera</h3>
                  <p className="text-sm text-muted-foreground">
                    {error || 'É necessário permitir o acesso à câmera para escanear códigos QR do PIX.'}
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <Button onClick={startCamera} className="w-full">
                  <Camera className="w-4 h-4 mr-2" />
                  Tentar Novamente
                </Button>
                
                <div className="text-center">
                  <p className="text-xs text-muted-foreground mb-2">ou</p>
                </div>
                
                <Button 
                  variant="outline" 
                  onClick={handleFileUpload}
                  className="w-full"
                >
                  <ImageIcon className="w-4 h-4 mr-2" />
                  Escolher Imagem da Galeria
                </Button>

                <Button 
                  variant="secondary" 
                  onClick={handleManualInput}
                  className="w-full"
                >
                  Inserir Chave PIX Manualmente
                </Button>
              </div>

              {error?.includes('permissão') && (
                <div className="mt-4 p-3 rounded-lg bg-muted text-sm">
                  <p className="font-medium mb-1">Como permitir câmera:</p>
                  <ol className="list-decimal list-inside space-y-1 text-xs text-muted-foreground">
                    <li>Clique no ícone de câmera na barra de endereço</li>
                    <li>Selecione "Permitir"</li>
                    <li>Recarregue a página se necessário</li>
                  </ol>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-black/50 backdrop-blur-sm text-white z-10">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleBack}
          className="flex items-center gap-2 text-white hover:bg-white/20"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar
        </Button>
        <h1 className="text-lg">Escaneie o QR Code</h1>
        <Button
          variant="ghost"
          size="sm"
          onClick={toggleFlash}
          className="text-white hover:bg-white/20"
        >
          {flashEnabled ? (
            <Flashlight className="w-4 h-4" />
          ) : (
            <FlashlightOff className="w-4 h-4" />
          )}
        </Button>
      </div>

      {/* Camera View */}
      <div className="flex-1 relative">
        <video
          ref={videoRef}
          className="w-full h-full object-cover"
          playsInline
          muted
        />
        
        <canvas
          ref={canvasRef}
          className="hidden"
        />

        {/* Scanning Overlay */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="relative">
            {/* Scanning Frame */}
            <div className="w-64 h-64 border-2 border-white rounded-2xl relative">
              {/* Corner animations */}
              <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-[#00C853] rounded-tl-2xl" />
              <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-[#00C853] rounded-tr-2xl" />
              <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-[#00C853] rounded-bl-2xl" />
              <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-[#00C853] rounded-br-2xl" />
              
              {/* Scanning line animation */}
              {isScanning && (
                <motion.div
                  className="absolute left-0 right-0 h-0.5 bg-[#00C853] shadow-lg shadow-[#00C853]/50"
                  animate={{
                    y: [0, 256, 0]
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                />
              )}
            </div>
            
            {/* Instructions */}
            <div className="mt-8 text-center">
              <p className="text-white mb-2">
                Posicione o QR Code do PIX dentro da moldura
              </p>
              <div className="flex items-center justify-center gap-2 text-white/70">
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span className="text-sm">Escaneando...</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Actions */}
      <div className="p-6 bg-black/50 backdrop-blur-sm">
        <div className="space-y-4">
          <Button
            variant="outline"
            onClick={handleFileUpload}
            className="w-full bg-white/10 border-white/20 text-white hover:bg-white/20"
          >
            <ImageIcon className="w-4 h-4 mr-2" />
            Escolher da Galeria
          </Button>
          
          <p className="text-center text-white/70 text-sm">
            Certifique-se de que o código QR esteja bem iluminado e visível
          </p>
        </div>
      </div>

      {error && (
        <div className="absolute bottom-20 left-4 right-4">
          <Card className="bg-destructive/90 text-destructive-foreground">
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                <p className="text-sm">{error}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};