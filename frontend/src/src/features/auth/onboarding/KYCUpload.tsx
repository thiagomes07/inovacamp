import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Button } from '../../../../components/ui/button';
import { Camera, Upload, Check, X, RotateCcw } from 'lucide-react';

interface KYCUploadProps {
  documents: {
    frontDocument?: File;
    backDocument?: File;
  };
  onUpdate: (documents: { frontDocument?: File; backDocument?: File }) => void;
  onNext: () => void;
}

type DocumentSide = 'front' | 'back';

export const KYCUpload: React.FC<KYCUploadProps> = ({ documents, onUpdate, onNext }) => {
  const [currentStep, setCurrentStep] = useState<DocumentSide>('front');
  const [previews, setPreviews] = useState<{
    front?: string;
    back?: string;
  }>({});
  const [isUploading, setIsUploading] = useState(false);

  const handleFileSelect = (file: File, side: DocumentSide) => {
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviews(prev => ({
          ...prev,
          [side]: e.target?.result as string
        }));
      };
      reader.readAsDataURL(file);

      onUpdate({
        ...documents,
        [`${side}Document`]: file
      });
    }
  };

  const handleCameraCapture = async (side: DocumentSide) => {
    // TODO: Implement camera capture
    // For demo, we'll simulate file selection
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.capture = 'environment';
    
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        handleFileSelect(file, side);
      }
    };
    
    input.click();
  };

  const handleFileUpload = (side: DocumentSide) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        handleFileSelect(file, side);
      }
    };
    
    input.click();
  };

  const handleRetake = (side: DocumentSide) => {
    setPreviews(prev => ({
      ...prev,
      [side]: undefined
    }));
    
    onUpdate({
      ...documents,
      [`${side}Document`]: undefined
    });
  };

  const handleConfirm = async (side: DocumentSide) => {
    if (side === 'front' && !documents.backDocument) {
      setCurrentStep('back');
    } else {
      setIsUploading(true);
      
      // TODO: POST /api/kyc/upload
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setIsUploading(false);
      onNext();
    }
  };

  const getCurrentDocument = () => {
    return currentStep === 'front' ? documents.frontDocument : documents.backDocument;
  };

  const getCurrentPreview = () => {
    return currentStep === 'front' ? previews.front : previews.back;
  };

  const getDocumentTitle = () => {
    return currentStep === 'front' ? 'Frente do documento' : 'Verso do documento';
  };

  const getDocumentDescription = () => {
    return currentStep === 'front' 
      ? 'Posicione a frente do seu RG ou CNH dentro da moldura'
      : 'Agora posicione o verso do seu documento';
  };

  return (
    <div className="px-6 py-8 h-full flex flex-col">
      {/* Progress indicator */}
      <div className="flex items-center justify-center mb-8">
        <div className="flex items-center gap-2">
          <div className={`w-3 h-3 rounded-full ${
            documents.frontDocument ? 'bg-green-500' : 'bg-gray-600'
          }`} />
          <div className="w-8 h-0.5 bg-gray-600" />
          <div className={`w-3 h-3 rounded-full ${
            documents.backDocument ? 'bg-green-500' : 'bg-gray-600'
          }`} />
        </div>
      </div>

      {/* Title */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-white mb-4">
          {getDocumentTitle()}
        </h1>
        <p className="text-gray-400 text-lg">
          {getDocumentDescription()}
        </p>
      </div>

      {/* Camera preview area */}
      <motion.div
        key={currentStep}
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="flex-1 flex flex-col items-center justify-center mb-8"
      >
        {getCurrentPreview() ? (
          /* Document preview */
          <div className="relative">
            <img
              src={getCurrentPreview()}
              alt="Document preview"
              className="w-72 h-48 object-cover rounded-2xl border-2 border-green-500"
            />
            <div className="absolute inset-0 bg-black/20 rounded-2xl" />
            
            {/* Action buttons overlay */}
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-3">
              <button
                onClick={() => handleRetake(currentStep)}
                className="px-4 py-2 bg-gray-800/80 text-white rounded-xl flex items-center gap-2 hover:bg-gray-700/80 transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
                Refazer
              </button>
              <button
                onClick={() => handleConfirm(currentStep)}
                disabled={isUploading}
                className="px-4 py-2 bg-green-600 text-white rounded-xl flex items-center gap-2 hover:bg-green-700 disabled:bg-green-600/50 transition-colors"
              >
                <Check className="w-4 h-4" />
                {isUploading ? 'Enviando...' : 'Confirmar'}
              </button>
            </div>
          </div>
        ) : (
          /* Camera interface */
          <div className="relative">
            {/* Camera frame */}
            <div className="w-72 h-48 bg-gray-800 rounded-2xl border-2 border-dashed border-gray-600 flex items-center justify-center">
              <Camera className="w-12 h-12 text-gray-400" />
            </div>
            
            {/* Corner guides */}
            <div className="absolute top-2 left-2 w-6 h-6 border-l-2 border-t-2 border-green-400" />
            <div className="absolute top-2 right-2 w-6 h-6 border-r-2 border-t-2 border-green-400" />
            <div className="absolute bottom-2 left-2 w-6 h-6 border-l-2 border-b-2 border-green-400" />
            <div className="absolute bottom-2 right-2 w-6 h-6 border-r-2 border-b-2 border-green-400" />
          </div>
        )}

        {/* Instructions */}
        {!getCurrentPreview() && (
          <div className="mt-6 text-center">
            <p className="text-white mb-2">📱 Mantenha o documento dentro da moldura</p>
            <p className="text-gray-400 text-sm">Certifique-se de que as informações estão legíveis</p>
          </div>
        )}
      </motion.div>

      {/* Action buttons */}
      {!getCurrentPreview() && (
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="space-y-3"
        >
          <Button
            onClick={() => handleCameraCapture(currentStep)}
            className="w-full bg-green-600 hover:bg-green-700 text-white py-4 rounded-2xl font-semibold transition-colors flex items-center justify-center gap-2"
          >
            <Camera className="w-5 h-5" />
            Tirar foto
          </Button>
          
          <Button
            onClick={() => handleFileUpload(currentStep)}
            variant="outline"
            className="w-full border-gray-600 text-white bg-gray-800/50 hover:bg-gray-700 hover:text-white py-4 rounded-2xl font-semibold transition-colors flex items-center justify-center gap-2"
          >
            <Upload className="w-5 h-5" />
            Escolher da galeria
          </Button>
        </motion.div>
      )}

      {/* Upload progress */}
      {isUploading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
        >
          <div className="bg-gray-800 p-6 rounded-2xl text-center">
            <div className="w-8 h-8 border-2 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-white">Processando documento...</p>
            <p className="text-gray-400 text-sm mt-1">Isso pode levar alguns segundos</p>
          </div>
        </motion.div>
      )}
    </div>
  );
};