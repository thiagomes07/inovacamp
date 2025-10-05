import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Camera, CheckCircle, Shield, MapPin, AlertCircle } from 'lucide-react';
import { Card } from '../../../../components/ui/card';
import { Button } from '../../../../components/ui/button';
import { toast } from 'sonner';

interface FacialVerificationProps {
  onComplete: (locationData: LocationData) => void;
}

interface LocationData {
  latitude: number;
  longitude: number;
  timestamp: string;
  accuracy?: number;
}

type VerificationStage = 'initial' | 'requesting-location' | 'location-success' | 'facial-verifying' | 'completed';

export const FacialVerification: React.FC<FacialVerificationProps> = ({
  onComplete
}) => {
  const [stage, setStage] = useState<VerificationStage>('initial');
  const [locationData, setLocationData] = useState<LocationData | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);

  const requestLocation = async (): Promise<LocationData | null> => {
    return new Promise((resolve) => {
      if (!navigator.geolocation) {
        setLocationError('Seu navegador não suporta geolocalização');
        toast.error('Geolocalização não disponível');
        resolve(null);
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const data: LocationData = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            timestamp: new Date().toISOString(),
            accuracy: position.coords.accuracy
          };
          resolve(data);
        },
        (error) => {
          let errorMessage = 'Erro ao obter localização';
          
          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorMessage = 'Permissão de localização negada. Por favor, permita o acesso à localização.';
              break;
            case error.POSITION_UNAVAILABLE:
              errorMessage = 'Localização indisponível no momento';
              break;
            case error.TIMEOUT:
              errorMessage = 'Tempo limite para obter localização excedido';
              break;
          }
          
          setLocationError(errorMessage);
          toast.error(errorMessage);
          resolve(null);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        }
      );
    });
  };

  const handleStartVerification = async () => {
    // Stage 1: Request Location
    setStage('requesting-location');
    
    const location = await requestLocation();
    
    if (!location) {
      setStage('initial');
      return;
    }

    setLocationData(location);
    setStage('location-success');
    
    // Wait a bit to show success
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Stage 2: Facial Verification
    setStage('facial-verifying');
    
    // Simulate facial verification process
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Stage 3: Complete
    setStage('completed');
    toast.success('Verificação de segurança concluída com sucesso!');
    
    // Auto advance after showing success
    setTimeout(() => {
      onComplete(location);
    }, 1500);
  };

  return (
    <div className="p-6 flex items-center justify-center min-h-[calc(100vh-120px)]">
      <Card className="backdrop-blur-md bg-white/10 border-white/20 w-full max-w-md text-center px-[32px] py-[33px]">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          {stage === 'initial' && (
            <>
              <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                <Shield className="w-10 h-10 text-white" />
              </div>
              
              <h2 className="text-2xl font-bold text-white mb-4">
                Verificação de Segurança
              </h2>
              
              <p className="text-gray-300 mb-6">
                Para sua segurança, precisamos confirmar sua identidade e localização antes de processar a solicitação de crédito.
              </p>
              
              <div className="space-y-3 mb-6">
                <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <MapPin className="w-5 h-5 text-blue-400" />
                    <span className="text-blue-400 font-semibold">Verificação de Localização</span>
                  </div>
                  <p className="text-gray-300 text-sm text-left">
                    Sua localização será verificada para garantir conformidade com regulamentações locais.
                  </p>
                </div>

                <div className="bg-purple-500/10 border border-purple-500/20 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Camera className="w-5 h-5 text-purple-400" />
                    <span className="text-purple-400 font-semibold">Verificação Facial</span>
                  </div>
                  <p className="text-gray-300 text-sm text-left">
                    Seus dados biométricos são criptografados e não são armazenados.
                  </p>
                </div>
              </div>

              {locationError && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 mb-4">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-5 h-5 text-red-400" />
                    <p className="text-red-400 text-sm text-left">{locationError}</p>
                  </div>
                </div>
              )}
              
              <Button
                onClick={handleStartVerification}
                className="w-full bg-blue-600 hover:bg-blue-700 py-3"
              >
                Iniciar Verificação
              </Button>
            </>
          )}

          {stage === 'requesting-location' && (
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
            >
              <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center">
                <MapPin className="w-10 h-10 text-white animate-pulse" />
              </div>
              
              <h2 className="text-2xl font-bold text-white mb-4">
                Obtendo Localização...
              </h2>
              
              <p className="text-gray-300 mb-6">
                Por favor, permita o acesso à sua localização
              </p>
              
              <div className="w-32 h-32 mx-auto mb-6 border-4 border-blue-500 rounded-full relative">
                <div className="absolute inset-0 border-4 border-transparent border-t-blue-400 rounded-full animate-spin" />
                <div className="absolute inset-4 bg-blue-500/20 rounded-full flex items-center justify-center">
                  <MapPin className="w-12 h-12 text-blue-400" />
                </div>
              </div>
              
              <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
                <p className="text-blue-400 text-sm">
                  📍 Aguardando permissão de localização...
                </p>
              </div>
            </motion.div>
          )}

          {stage === 'location-success' && locationData && (
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
            >
              <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-r from-green-500 to-cyan-500 rounded-full flex items-center justify-center">
                <CheckCircle className="w-10 h-10 text-white" />
              </div>
              
              <h2 className="text-2xl font-bold text-white mb-4">
                Localização Confirmada
              </h2>
              
              <p className="text-gray-300 mb-6">
                Iniciando verificação facial...
              </p>
              
              <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4">
                <div className="flex items-center gap-2 justify-center">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                  <span className="text-green-400 font-semibold">
                    Precisão: {locationData.accuracy?.toFixed(0)}m
                  </span>
                </div>
              </div>
            </motion.div>
          )}

          {stage === 'facial-verifying' && (
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
            >
              <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                <Camera className="w-10 h-10 text-white animate-pulse" />
              </div>
              
              <h2 className="text-2xl font-bold text-white mb-4">
                Verificando Identidade...
              </h2>
              
              <p className="text-gray-300 mb-6">
                Mantenha seu rosto centralizado na câmera
              </p>
              
              <div className="w-32 h-32 mx-auto mb-6 border-4 border-purple-500 rounded-full relative">
                <div className="absolute inset-0 border-4 border-transparent border-t-purple-400 rounded-full animate-spin" />
                <div className="absolute inset-4 bg-purple-500/20 rounded-full flex items-center justify-center">
                  <div className="w-12 h-12 bg-purple-500/40 rounded-full" />
                </div>
              </div>
              
              <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4">
                <p className="text-yellow-400 text-sm">
                  ⏱️ Processando verificação biométrica...
                </p>
              </div>
            </motion.div>
          )}

          {stage === 'completed' && locationData && (
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center">
                <CheckCircle className="w-10 h-10 text-white" />
              </div>
              
              <h2 className="text-2xl font-bold text-white mb-4">
                Verificação Concluída!
              </h2>
              
              <p className="text-gray-300 mb-6">
                Identidade e localização confirmadas com sucesso. Prosseguindo para as condições do empréstimo...
              </p>
              
              <div className="space-y-3">
                <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4">
                  <div className="flex items-center gap-2 justify-center">
                    <CheckCircle className="w-5 h-5 text-green-400" />
                    <span className="text-green-400 font-semibold">Verificação facial aprovada</span>
                  </div>
                </div>

                <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4">
                  <div className="flex items-center gap-2 justify-center">
                    <MapPin className="w-5 h-5 text-green-400" />
                    <span className="text-green-400 font-semibold">Localização confirmada</span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </motion.div>
      </Card>
    </div>
  );
};