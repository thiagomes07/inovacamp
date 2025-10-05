import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Car, Home, Wrench, Receipt, Upload, X, Plus, TrendingDown } from 'lucide-react';
import { Card } from '../../../../components/ui/card';
import { Button } from '../../../../components/ui/button';
import { Input } from '../../../../components/ui/input';
import { Textarea } from '../../../../components/ui/textarea';
import { MaskedInput } from '../../../shared/components/ui/MaskedInput';
import { CreditRequestData } from './CreditRequestFlow';

interface CollateralOfferProps {
  data: CreditRequestData;
  onUpdate: (data: Partial<CreditRequestData>) => void;
  onNext: () => void;
}

type CollateralType = 'vehicle' | 'property' | 'equipment' | 'receivables';

const collateralTypes = [
  {
    type: 'vehicle' as CollateralType,
    name: 'Veículo',
    icon: Car,
    description: 'Carro, moto, caminhão ou outro veículo',
    discount: '2-4%'
  },
  {
    type: 'property' as CollateralType,
    name: 'Imóvel',
    icon: Home,
    description: 'Casa, apartamento, terreno ou imóvel comercial',
    discount: '3-6%'
  },
  {
    type: 'equipment' as CollateralType,
    name: 'Equipamento',
    icon: Wrench,
    description: 'Máquinas, ferramentas ou equipamentos de trabalho',
    discount: '1-3%'
  },
  {
    type: 'receivables' as CollateralType,
    name: 'Recebíveis',
    icon: Receipt,
    description: 'Contratos, notas promissórias ou recebíveis',
    discount: '1-2%'
  }
];

export const CollateralOffer: React.FC<CollateralOfferProps> = ({
  data,
  onUpdate,
  onNext
}) => {
  const [hasCollateral, setHasCollateral] = useState(data.hasCollateral);
  const [selectedType, setSelectedType] = useState<CollateralType | null>(
    data.collateral?.type || null
  );
  const [description, setDescription] = useState(data.collateral?.description || '');
  const [estimatedValue, setEstimatedValue] = useState(data.collateral?.estimatedValue || 0);
  const [documents, setDocuments] = useState<File[]>(data.collateral?.documents || []);
  const [photos, setPhotos] = useState<File[]>(data.collateral?.photos || []);
  const [signedContract, setSignedContract] = useState<File | null>(null);

  const handleToggleCollateral = (value: boolean) => {
    setHasCollateral(value);
    if (!value) {
      // Clear collateral data when not using
      setSelectedType(null);
      setDescription('');
      setEstimatedValue(0);
      setDocuments([]);
      setPhotos([]);
      setSignedContract(null);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>, type: 'documents' | 'photos' | 'contract') => {
    const files = Array.from(event.target.files || []);
    if (type === 'documents') {
      setDocuments(prev => [...prev, ...files]);
    } else if (type === 'photos') {
      setPhotos(prev => [...prev, ...files]);
    } else if (type === 'contract') {
      // Only allow one contract file
      setSignedContract(files[0] || null);
    }
  };

  const removeFile = (index: number, type: 'documents' | 'photos') => {
    if (type === 'documents') {
      setDocuments(prev => prev.filter((_, i) => i !== index));
    } else {
      setPhotos(prev => prev.filter((_, i) => i !== index));
    }
  };

  const removeContract = () => {
    setSignedContract(null);
  };

  const downloadContractTemplate = () => {
    // Simular download do modelo de contrato
    const link = document.createElement('a');
    link.href = '#'; // TODO: Replace with actual contract template URL
    link.download = 'modelo-contrato-cessao-bem.pdf';
    link.click();
  };

  const handleNext = () => {
    onUpdate({
      hasCollateral,
      collateral: hasCollateral && selectedType ? {
        type: selectedType,
        description,
        estimatedValue,
        documents,
        photos
      } : undefined
    });
    onNext();
  };

  const isValid = !hasCollateral || (
    selectedType && 
    description.length >= 10 && 
    estimatedValue > 0 && 
    documents.length > 0 && 
    photos.length > 0 &&
    signedContract !== null
  );

  return (
    <div className="p-6 space-y-6">
      <Card className="backdrop-blur-md bg-white/10 border-white/20 p-6">
        <div className="mb-6">
          <h2 className="text-xl font-bold text-white mb-2">Oferecer Garantia</h2>
          <p className="text-gray-300">
            Adicione uma garantia para reduzir a taxa de juros do seu empréstimo
          </p>
        </div>

        {/* Toggle Collateral */}
        <div className="space-y-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <Button
              onClick={() => {
                handleToggleCollateral(false);
                handleNext();
              }}
              variant={!hasCollateral ? 'default' : 'outline'}
              className={`w-full sm:flex-1 py-4 ${
                !hasCollateral 
                  ? 'bg-blue-600 hover:bg-blue-700' 
                  : 'border-gray-600 text-gray-300'
              }`}
            >
              Pular esta etapa
            </Button>
            <Button
              onClick={() => handleToggleCollateral(true)}
              variant={hasCollateral ? 'default' : 'outline'}
              className={`w-full sm:flex-1 py-4 ${
                hasCollateral 
                  ? 'bg-green-600 hover:bg-green-700' 
                  : 'border-gray-600 text-slate-800 hover:text-white'
              }`}
            >
              <TrendingDown className="w-4 h-4 mr-2" />
              Adicionar Garantia
            </Button>
          </div>

          {hasCollateral && (
            <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <TrendingDown className="w-5 h-5 text-green-400" />
                <span className="text-green-400 font-semibold">Vantagem</span>
              </div>
              <p className="text-gray-300 text-sm">
                Com garantia, você pode reduzir a taxa de juros em até 6% ao ano!
              </p>
            </div>
          )}
        </div>

        {hasCollateral && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            {/* Collateral Type Selection */}
            <div className="space-y-4">
              <label className="text-white font-semibold">Tipo de garantia</label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {collateralTypes.map((type) => {
                  const Icon = type.icon;
                  return (
                    <button
                      key={type.type}
                      onClick={() => setSelectedType(type.type)}
                      className={`p-4 rounded-xl border text-left transition-all ${
                        selectedType === type.type
                          ? 'bg-blue-600/20 border-blue-500 text-white'
                          : 'bg-gray-800/50 border-gray-600 text-gray-300 hover:border-blue-500'
                      }`}
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <Icon className="w-5 h-5 text-blue-400" />
                        <span className="font-semibold">{type.name}</span>
                        <span className="text-green-400 text-sm ml-auto">-{type.discount}</span>
                      </div>
                      <p className="text-sm text-gray-400">{type.description}</p>
                    </button>
                  );
                })}
              </div>
            </div>

            {selectedType && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="space-y-4"
              >
                {/* Description */}
                <div>
                  <label className="text-white font-semibold mb-2 block">
                    Descrição detalhada
                  </label>
                  <Textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Ex: Honda Civic 2020, prata, 45.000 km, placa ABC-1234..."
                    className="bg-gray-800/50 border-gray-600 text-white min-h-[80px]"
                  />
                  <p className={`text-sm mt-1 ${description.length >= 10 ? 'text-green-400' : 'text-gray-400'}`}>
                    Mínimo 10 caracteres ({description.length}/10)
                  </p>
                </div>

                {/* Estimated Value */}
                <div>
                  <label className="text-white font-semibold mb-2 block">
                    Valor estimado
                  </label>
                  <MaskedInput
                    mask="money"
                    currency="BRL"
                    value={estimatedValue ? `R$ ${estimatedValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : ''}
                    onChange={(maskedValue) => {
                      // Remove "R$ " e converte de volta para número
                      const numericValue = maskedValue.replace(/[R$\s.,]/g, '');
                      setEstimatedValue(numericValue ? Number(numericValue) / 100 : 0);
                    }}
                    placeholder="R$ 0,00"
                    className="bg-gray-800/50 border-gray-600 text-white"
                  />
                  <p className="text-gray-400 text-sm mt-1">
                    Este valor será validado pela nossa IA
                  </p>
                </div>

                {/* Document Upload */}
                <div>
                  <label className="text-white font-semibold mb-2 block">
                    Documentos
                  </label>
                  <div className="space-y-2">
                    <div className="border-2 border-dashed border-gray-600 rounded-xl p-4 text-center">
                      <input
                        type="file"
                        multiple
                        accept=".pdf,.jpg,.jpeg,.png"
                        onChange={(e) => handleFileUpload(e, 'documents')}
                        className="hidden"
                        id="documents-upload"
                      />
                      <label htmlFor="documents-upload" className="cursor-pointer">
                        <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-gray-300">
                          Clique para adicionar documentos
                        </p>
                        <p className="text-gray-500 text-sm">
                          PDF, JPG ou PNG
                        </p>
                      </label>
                    </div>
                    
                    {documents.length > 0 && (
                      <div className="space-y-2">
                        {documents.map((file, index) => (
                          <div key={index} className="flex items-center justify-between bg-gray-800/50 p-2 rounded-lg">
                            <span className="text-white text-sm">{file.name}</span>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => removeFile(index, 'documents')}
                              className="border-gray-600 text-gray-300"
                            >
                              <X className="w-3 h-3" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Photo Upload */}
                <div>
                  <label className="text-white font-semibold mb-2 block">
                    Fotos
                  </label>
                  <div className="space-y-2">
                    <div className="border-2 border-dashed border-gray-600 rounded-xl p-4 text-center">
                      <input
                        type="file"
                        multiple
                        accept=".jpg,.jpeg,.png"
                        onChange={(e) => handleFileUpload(e, 'photos')}
                        className="hidden"
                        id="photos-upload"
                      />
                      <label htmlFor="photos-upload" className="cursor-pointer">
                        <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-gray-300">
                          Clique para adicionar fotos
                        </p>
                        <p className="text-gray-500 text-sm">
                          JPG ou PNG
                        </p>
                      </label>
                    </div>
                    
                    {photos.length > 0 && (
                      <div className="grid grid-cols-3 gap-2">
                        {photos.map((file, index) => (
                          <div key={index} className="relative">
                            <div className="aspect-square bg-gray-800/50 rounded-lg flex items-center justify-center">
                              <span className="text-white text-xs text-center px-1">
                                {file.name}
                              </span>
                            </div>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => removeFile(index, 'photos')}
                              className="absolute -top-2 -right-2 w-6 h-6 p-0 border-gray-600 bg-gray-800"
                            >
                              <X className="w-3 h-3" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Contract Cession Section */}
                <div className="space-y-4">
                  <label className="text-white font-semibold mb-2 block">
                    Contrato de Cessão de Bem
                  </label>
                  
                  <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4 mb-4">
                    <h3 className="text-yellow-400 font-semibold mb-2">📋 Documento Obrigatório</h3>
                    <p className="text-gray-300 text-sm mb-3">
                      Para formalizar a cessão do bem como garantia, é necessário assinar o contrato específico.
                    </p>
                    <Button
                      onClick={downloadContractTemplate}
                      variant="outline"
                      className="border-yellow-500 text-yellow-400 hover:bg-yellow-500/10"
                    >
                      📄 Baixar Modelo do Contrato
                    </Button>
                  </div>

                  <div className="space-y-2">
                    <div className="border-2 border-dashed border-gray-600 rounded-xl p-4 text-center">
                      <input
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png,.docx"
                        onChange={(e) => handleFileUpload(e, 'contract')}
                        className="hidden"
                        id="contract-upload"
                      />
                      <label htmlFor="contract-upload" className="cursor-pointer">
                        <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-gray-300">
                          Anexar Contrato Assinado
                        </p>
                        <p className="text-gray-500 text-sm">
                          PDF, JPG, PNG ou DOCX (máximo 1 arquivo)
                        </p>
                      </label>
                    </div>
                    
                    {signedContract && (
                      <div className="flex items-center justify-between bg-green-500/10 border border-green-500/20 p-3 rounded-lg">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                          <span className="text-white text-sm">{signedContract.name}</span>
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={removeContract}
                          className="border-gray-600 text-gray-300"
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      </div>
                    )}
                  </div>
                </div>

                <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
                  <h3 className="text-blue-400 font-semibold mb-2">🤖 Validação por IA</h3>
                  <p className="text-gray-300 text-sm">
                    Nossa inteligência artificial analisará automaticamente as informações, documentos e fotos para validar a garantia oferecida.
                  </p>
                </div>
              </motion.div>
            )}
          </motion.div>
        )}

        <Button
          onClick={handleNext}
          disabled={!isValid}
          className="w-full bg-blue-600 hover:bg-blue-700 py-3 mt-6"
        >
          Continuar
        </Button>
      </Card>
    </div>
  );
};