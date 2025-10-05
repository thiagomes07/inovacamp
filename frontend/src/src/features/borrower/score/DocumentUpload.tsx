import React, { useState, useRef } from 'react';
import { motion } from 'motion/react';
import { Card } from '../../../../components/ui/card';
import { Button } from '../../../../components/ui/button';
import { Input } from '../../../../components/ui/input';
import { Textarea } from '../../../../components/ui/textarea';
import { Label } from '../../../../components/ui/label';
import { Progress } from '../../../../components/ui/progress';
import { 
  ArrowLeft, 
  Upload, 
  File, 
  Image as ImageIcon, 
  CheckCircle2,
  AlertCircle,
  X,
  Camera,
  FileText,
  Download
} from 'lucide-react';
import { toast } from 'sonner@2.0.3';

interface Mission {
  id: string;
  title: string;
  description: string;
  points: number;
  icon: React.ElementType;
  completed: boolean;
  type: 'verification' | 'document' | 'connection' | 'payment' | 'custom';
  category?: string;
}

interface DocumentUploadProps {
  mission: Mission;
  onBack: () => void;
  onSuccess: () => void;
}

interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  url: string;
  status: 'uploading' | 'uploaded' | 'error';
  progress: number;
}

interface ScoreUpdate {
  old_score: number;
  new_score: number;
  score_change: number;
}

interface ValidationResult {
  valid: boolean;
  quality_score: number;
  issues: string[];
  confidence: number;
  analysis: string;
  extracted_data: Record<string, any>;
  inferred_file_type?: string;
  inferred_document_type?: string;
  score_update?: ScoreUpdate;
}

export const DocumentUpload: React.FC<DocumentUploadProps> = ({
  mission,
  onBack,
  onSuccess,
}) => {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [description, setDescription] = useState('');
  const [customDocType, setCustomDocType] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const acceptedFileTypes = mission.id === 'verify_identity' 
    ? '.jpg,.jpeg,.png,.pdf'
    : '.pdf,.jpg,.jpeg,.png,.doc,.docx';

  const getDocumentInstructions = () => {
    switch (mission.id) {
      case 'verify_identity':
        return {
          title: 'Documento de Identidade',
          instructions: [
            '📱 Foto nítida do RG ou CNH (frente e verso)',
            '🔍 Todos os dados devem estar legíveis',
            '💡 Boa iluminação, sem reflexos ou sombras',
            '📄 Formato aceito: JPG, PNG ou PDF'
          ],
          examples: ['RG (frente e verso)', 'CNH (frente e verso)', 'RNE para estrangeiros']
        };

      case 'income_proof':
        return {
          title: 'Comprovante de Renda',
          instructions: [
            '📄 Últimos 3 meses de comprovação',
            '🏢 Para CLT: Holerites recentes',
            '💼 Para PJ: DECORE ou DRE',
            '📊 Para autônomos: Extratos bancários'
          ],
          examples: ['Holerite', 'DECORE', 'DRE', 'Extratos bancários', 'Declaração de autônomo']
        };

      case 'tax_declaration':
        return {
          title: 'Imposto de Renda',
          instructions: [
            '📋 Declaração completa do último ano',
            '🔐 Pode ser simplificada ou completa',
            '✅ Aceita versão PDF gerada no site da Receita',
            '📁 Incluir recibo de entrega se disponível'
          ],
          examples: ['Declaração IRPF', 'Recibo de entrega', 'Extrato da declaração']
        };

      case 'utility_bills':
        return {
          title: 'Contas de Utilidades',
          instructions: [
            '⚡ Conta de luz dos últimos 3 meses',
            '📞 Conta de telefone/internet',
            '💧 Conta de água (opcional)',
            '🏠 Deve estar no seu nome ou de familiar'
          ],
          examples: ['Conta de luz', 'Conta de telefone', 'Conta de internet', 'Conta de água']
        };

      default:
        return {
          title: 'Documento Personalizado',
          instructions: [
            '📄 Envie o documento solicitado',
            '🔍 Certifique-se que está legível',
            '📝 Adicione uma descrição do que está enviando',
            '✅ Formatos aceitos: PDF, JPG, PNG, DOC'
          ],
          examples: ['Documento solicitado', 'Comprovante específico']
        };
    }
  };

  const docInfo = getDocumentInstructions();

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []) as File[];
    
    if (files.length === 0) return;

    // Validate file size (max 10MB each)
    const oversizedFiles = files.filter((file: File) => file.size > 10 * 1024 * 1024);
    if (oversizedFiles.length > 0) {
      toast.error('Alguns arquivos excedem 10MB. Por favor, reduza o tamanho.');
      return;
    }

    // Create file objects
    const newFiles: UploadedFile[] = files.map((file: File) => ({
      id: Math.random().toString(36).substr(2, 9),
      name: file.name,
      size: file.size,
      type: file.type,
      url: URL.createObjectURL(file),
      status: 'uploading' as const,
      progress: 0
    }));

    setUploadedFiles((prev: UploadedFile[]) => [...prev, ...newFiles]);
    setIsUploading(true);

    // Simulate upload progress
    newFiles.forEach((file, index) => {
      simulateUpload(file.id, index * 500);
    });
  };

  const simulateUpload = (fileId: string, delay: number) => {
    setTimeout(() => {
      let progress = 0;
      const interval = setInterval(() => {
        progress += Math.random() * 30;
        
        setUploadedFiles((prev: UploadedFile[]) => prev.map((file: UploadedFile) => 
          file.id === fileId 
            ? { ...file, progress: Math.min(progress, 100) }
            : file
        ));

        if (progress >= 100) {
          clearInterval(interval);
          setUploadedFiles((prev: UploadedFile[]) => prev.map((file: UploadedFile) => 
            file.id === fileId 
              ? { ...file, status: 'uploaded' as const, progress: 100 }
              : file
          ));
          
          // Check if all files are uploaded
          setTimeout(() => {
            setUploadedFiles((prev: UploadedFile[]) => {
              const allUploaded = prev.every((f: UploadedFile) => f.status === 'uploaded');
              if (allUploaded) {
                setIsUploading(false);
              }
              return prev;
            });
          }, 100);
        }
      }, 200);
    }, delay);
  };

  const removeFile = (fileId: string) => {
    setUploadedFiles((prev: UploadedFile[]) => {
      const filtered = prev.filter((file: UploadedFile) => file.id !== fileId);
      if (filtered.length === 0) {
        setIsUploading(false);
      }
      return filtered;
    });
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const convertFileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const base64 = reader.result as string;
        // Remove o prefixo "data:image/jpeg;base64," ou similar
        const base64Content = base64.split(',')[1];
        resolve(base64Content);
      };
      reader.onerror = error => reject(error);
    });
  };

  /**
   * Submete documentos para validação via IA
   * 
   * Fluxo:
   * 1. Converte arquivo para Base64
   * 2. Envia para backend (infere file_type e document_type automaticamente)
   * 3. Backend valida com GPT-4 Vision/Text
   * 4. Retorna score de qualidade, análise e atualização do credit score
   * 5. Exibe feedback visual detalhado com toast
   */
  const handleSubmit = async () => {
    if (uploadedFiles.length === 0) {
      toast.error('Por favor, envie pelo menos um documento.');
      return;
    }

    if (uploadedFiles.some((file: UploadedFile) => file.status !== 'uploaded')) {
      toast.error('Aguarde o upload de todos os arquivos.');
      return;
    }

    if (mission.id === 'custom' && !customDocType.trim()) {
      toast.error('Por favor, descreva o tipo de documento enviado.');
      return;
    }

    setIsUploading(true);
    
    // Toast inicial
    toast.loading('🔍 Validando documentos com IA...', { 
      id: 'validating',
      duration: Infinity 
    });

    try {
      // Processar cada arquivo
      for (const uploadedFile of uploadedFiles) {
        // Buscar o arquivo original do input
        const fileInput = fileInputRef.current;
        if (!fileInput?.files) continue;

        const originalFile = Array.from(fileInput.files as FileList).find(
          (f: File) => f.name === uploadedFile.name
        );

        if (!originalFile) {
          console.warn(`Arquivo ${uploadedFile.name} não encontrado`);
          continue;
        }

        // Converter para Base64
        const base64Content = await convertFileToBase64(originalFile);

        // Preparar payload - backend infere file_type e document_type automaticamente
        const payload = {
          user_id: "u1000000-0000-0000-0000-000000000001", // TODO: Pegar do contexto do usuário
          file_content: base64Content,
          file_name: originalFile.name,
          description: description || `${mission.title} - ${originalFile.name}`
        };

        // Enviar para API
        const response = await fetch(
          `${import.meta.env.VITE_API_BASE_URL}/score/documents/validate-single`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
          }
        );

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result: ValidationResult = await response.json();

        console.log('📊 Resultado da validação:', result);

        // Fechar toast de loading
        toast.dismiss('validating');

        // Verificar se documento foi validado
        if (!result.valid) {
          setIsUploading(false);
          
          // Mostrar motivos da rejeição
          const issues = result.issues || [];
          const issuesText = issues.slice(0, 3).join(' • ');
          
          toast.error(
            `❌ Documento rejeitado\n\n${result.analysis || 'Documento não atende aos critérios.'}\n\n${issues.length > 0 ? `Problemas: ${issuesText}` : ''}`,
            { duration: 6000 }
          );
          return;
        }

        // Documento válido! Mostrar resultado
        const scoreUpdate = result.score_update;
        
        if (scoreUpdate) {
          // Mostrar atualização de score
          toast.success(
            `✅ Documento validado!\n\n` +
            `📊 Score: ${scoreUpdate.old_score} → ${scoreUpdate.new_score} (+${scoreUpdate.score_change} pontos)\n` +
            `⭐ Qualidade: ${result.quality_score}/100\n\n` +
            `${result.analysis?.substring(0, 100)}...`,
            { duration: 8000 }
          );
        } else {
          // Documento válido mas sem atualização de score
          toast.success(
            `✅ Documento validado!\n\n` +
            `⭐ Qualidade: ${result.quality_score}/100\n\n` +
            `${result.analysis?.substring(0, 100)}...`,
            { duration: 5000 }
          );
        }

        // Mostrar dados extraídos se disponíveis
        if (result.extracted_data && Object.keys(result.extracted_data).length > 0) {
          console.log('📊 Dados extraídos:', result.extracted_data);
        }
      }

      setIsUploading(false);
      
      // Aguardar um momento para o usuário ver os toasts
      setTimeout(() => {
        onSuccess();
      }, 2000);

    } catch (error) {
      setIsUploading(false);
      toast.dismiss('validating');
      console.error('Erro ao validar documentos:', error);
      
      toast.error(
        `❌ Erro ao validar documentos\n\n` +
        `${error instanceof Error ? error.message : 'Erro desconhecido'}\n\n` +
        `Verifique sua conexão e tente novamente.`,
        { duration: 5000 }
      );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 pb-20">
      {/* Header */}
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
          <div>
            <h1 className="text-xl font-bold text-white">{mission.title}</h1>
            <p className="text-sm text-gray-400">+{mission.points} pontos</p>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Instructions Card */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="backdrop-blur-md bg-blue-500/10 border-blue-500/30 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-blue-500/20 rounded-full flex items-center justify-center">
                <FileText className="w-5 h-5 text-blue-400" />
              </div>
              <h2 className="text-lg font-bold text-blue-400">{docInfo.title}</h2>
            </div>

            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-semibold text-white mb-2">📋 Instruções:</h3>
                <ul className="space-y-1">
                  {docInfo.instructions.map((instruction, index) => (
                    <li key={index} className="text-sm text-gray-300">
                      {instruction}
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-white mb-2">📄 Exemplos aceitos:</h3>
                <div className="flex flex-wrap gap-2">
                  {docInfo.examples.map((example, index) => (
                    <span 
                      key={index}
                      className="text-xs bg-blue-500/20 text-blue-300 px-2 py-1 rounded-lg"
                    >
                      {example}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Upload Area */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="backdrop-blur-md bg-white/10 border-white/20 p-6">
            <h2 className="text-lg font-bold text-white mb-4">Envio de Documentos</h2>

            {/* File Input */}
            <div 
              className="border-2 border-dashed border-gray-600 rounded-xl p-8 text-center hover:border-gray-500 transition-colors cursor-pointer"
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept={acceptedFileTypes}
                onChange={handleFileSelect}
                className="hidden"
              />
              
              <div className="space-y-3">
                <div className="w-16 h-16 bg-gray-700/50 rounded-full flex items-center justify-center mx-auto">
                  <Upload className="w-8 h-8 text-gray-400" />
                </div>
                <div>
                  <p className="text-white font-semibold">Clique para enviar arquivos</p>
                  <p className="text-gray-400 text-sm">
                    ou arraste e solte aqui
                  </p>
                  <p className="text-gray-500 text-xs mt-2">
                    Máximo 10MB por arquivo • Formatos: {acceptedFileTypes}
                  </p>
                </div>
              </div>
            </div>

            {/* Uploaded Files */}
            {uploadedFiles.length > 0 && (
              <div className="mt-6 space-y-3">
                <h3 className="text-sm font-semibold text-white">Arquivos enviados:</h3>
                
                {uploadedFiles.map((file) => (
                  <div 
                    key={file.id}
                    className="bg-gray-800/50 rounded-xl p-4 border border-gray-700"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gray-700/50 rounded-lg flex items-center justify-center">
                          {file.type.startsWith('image/') ? (
                            <ImageIcon className="w-4 h-4 text-gray-400" />
                          ) : (
                            <File className="w-4 h-4 text-gray-400" />
                          )}
                        </div>
                        <div>
                          <p className="text-white text-sm font-medium">{file.name}</p>
                          <p className="text-gray-400 text-xs">{formatFileSize(file.size)}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {file.status === 'uploaded' && (
                          <CheckCircle2 className="w-5 h-5 text-green-400" />
                        )}
                        {file.status === 'error' && (
                          <AlertCircle className="w-5 h-5 text-red-400" />
                        )}
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => removeFile(file.id)}
                          className="text-gray-400 hover:text-red-400 p-1"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>

                    {file.status === 'uploading' && (
                      <Progress value={file.progress} className="h-2 bg-gray-700" />
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Custom Document Type (for generic missions) */}
            {mission.id === 'custom' && (
              <div className="mt-6 space-y-3">
                <Label htmlFor="docType" className="text-white">
                  Tipo de documento *
                </Label>
                <Input
                  id="docType"
                  value={customDocType}
                  onChange={(e) => setCustomDocType(e.target.value)}
                  placeholder="Ex: Comprovante de residência, Contrato de trabalho..."
                  className="bg-gray-800/50 border-gray-600 text-white"
                />
              </div>
            )}

            {/* Description */}
            <div className="mt-6 space-y-3">
              <Label htmlFor="description" className="text-white">
                Descrição adicional (opcional)
              </Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Adicione qualquer informação relevante sobre os documentos enviados..."
                className="bg-gray-800/50 border-gray-600 text-white min-h-[80px]"
              />
            </div>

            {/* Submit Button */}
            <div className="mt-6 flex gap-3">
              <Button
                onClick={onBack}
                variant="outline"
                className="border-gray-600 text-gray-300"
              >
                Cancelar
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={uploadedFiles.length === 0 || isUploading}
                className="bg-green-600 hover:bg-green-700 flex-1"
              >
                {isUploading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin mr-2" />
                    Enviando...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4 mr-2" />
                    Validar documentos
                  </>
                )}
              </Button>
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};