import React, { useState } from 'react';
import { motion } from 'motion/react';
import { useApp } from './AppProvider';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Progress } from './ui/progress';
import { toast } from 'sonner@2.0.3';
import { Upload, FileText, Camera, Check, X } from 'lucide-react';

interface DocumentType {
  id: string;
  name: string;
  description: string;
  required: boolean;
  uploaded: boolean;
  file?: File;
}

export const KYCDocuments: React.FC = () => {
  const { user, setUser, setCurrentScreen } = useApp();
  const [documents, setDocuments] = useState<DocumentType[]>([
    { id: 'rg', name: 'RG (Identity Card)', description: 'Government-issued ID', required: true, uploaded: false },
    { id: 'cpf', name: 'CPF Document', description: 'Tax ID document', required: true, uploaded: false },
    { id: 'payslip', name: 'Payslip/Income Proof', description: 'Last 3 months', required: true, uploaded: false },
    { id: 'uber', name: 'Uber Statement', description: 'Driver earnings (if applicable)', required: false, uploaded: false },
    { id: 'bill', name: 'Utility Bill', description: 'Address proof', required: true, uploaded: false },
    { id: 'bank', name: 'Bank Statement', description: 'Last 3 months', required: false, uploaded: false },
    { id: 'irpf', name: 'IRPF (Income Tax)', description: 'Tax declaration', required: false, uploaded: false },
  ]);

  const [uploadingDoc, setUploadingDoc] = useState<string | null>(null);

  const handleFileUpload = async (docId: string, file: File) => {
    setUploadingDoc(docId);

    try {
      // Simulate file upload
      await new Promise(resolve => setTimeout(resolve, 2000));

      setDocuments(prev => prev.map(doc => 
        doc.id === docId 
          ? { ...doc, uploaded: true, file }
          : doc
      ));

      toast.success(`${documents.find(d => d.id === docId)?.name} uploaded successfully!`);
    } catch (error) {
      toast.error('Upload failed. Please try again.');
    } finally {
      setUploadingDoc(null);
    }
  };

  const handleCameraCapture = (docId: string) => {
    // Simulate camera capture
    const mockFile = new File([''], `${docId}-photo.jpg`, { type: 'image/jpeg' });
    handleFileUpload(docId, mockFile);
  };

  const handleRemoveDocument = (docId: string) => {
    setDocuments(prev => prev.map(doc => 
      doc.id === docId 
        ? { ...doc, uploaded: false, file: undefined }
        : doc
    ));
    toast.success('Document removed');
  };

  const handleContinue = () => {
    const requiredDocs = documents.filter(doc => doc.required);
    const uploadedRequired = requiredDocs.filter(doc => doc.uploaded);

    if (uploadedRequired.length < 3) {
      toast.error('Please upload at least 3 required documents to continue');
      return;
    }

    // Update user KYC status
    if (user) {
      setUser({
        ...user,
        kycCompleted: true,
        creditScore: user.creditScore + Math.floor(Math.random() * 100) + 50
      });
    }

    toast.success('KYC verification completed!');
    setCurrentScreen('onboarding-complete');
  };

  const requiredDocs = documents.filter(doc => doc.required);
  const uploadedRequired = requiredDocs.filter(doc => doc.uploaded);
  const totalUploaded = documents.filter(doc => doc.uploaded).length;
  const progress = (uploadedRequired.length / requiredDocs.length) * 100;

  return (
    <div className="min-h-screen bg-background flex flex-col px-6 py-8">
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="mb-8"
      >
        <h1 className="text-2xl mb-2">Upload Documents</h1>
        <p className="text-muted-foreground">
          Upload your documents to verify your identity and improve your credit score
        </p>
        
        <div className="mt-4 space-y-2">
          <div className="flex justify-between text-sm">
            <span>Required documents ({uploadedRequired.length}/{requiredDocs.length})</span>
            <span className="text-[#007AFF]">{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
      </motion.div>

      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        className="flex-1 space-y-4"
      >
        {documents.map((doc, index) => (
          <motion.div
            key={doc.id}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 * index, duration: 0.3 }}
          >
            <Card className={`p-4 transition-all duration-200 ${
              doc.uploaded 
                ? 'bg-[#00C853]/5 border-[#00C853]/20' 
                : uploadingDoc === doc.id 
                  ? 'bg-[#007AFF]/5 border-[#007AFF]/20'
                  : 'hover:bg-muted/50'
            }`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4 flex-1">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    doc.uploaded 
                      ? 'bg-[#00C853] text-white' 
                      : uploadingDoc === doc.id
                        ? 'bg-[#007AFF] text-white'
                        : 'bg-muted text-muted-foreground'
                  }`}>
                    {uploadingDoc === doc.id ? (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : doc.uploaded ? (
                      <Check className="w-5 h-5" />
                    ) : (
                      <FileText className="w-5 h-5" />
                    )}
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <h3 className="text-sm">{doc.name}</h3>
                      {doc.required && (
                        <span className="text-xs bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400 px-2 py-0.5 rounded">
                          Required
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">{doc.description}</p>
                    {uploadingDoc === doc.id && (
                      <p className="text-xs text-[#007AFF] mt-1">Uploading...</p>
                    )}
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  {doc.uploaded ? (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveDocument(doc.id)}
                      className="text-destructive hover:text-destructive/80 px-2"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  ) : uploadingDoc !== doc.id ? (
                    <>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleCameraCapture(doc.id)}
                        className="text-[#007AFF] hover:text-[#007AFF]/80 px-2"
                      >
                        <Camera className="w-4 h-4" />
                      </Button>
                      
                      <label className="cursor-pointer">
                        <input
                          type="file"
                          accept="image/*,.pdf"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleFileUpload(doc.id, file);
                          }}
                        />
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-[#007AFF] hover:text-[#007AFF]/80 px-2"
                          asChild
                        >
                          <span>
                            <Upload className="w-4 h-4" />
                          </span>
                        </Button>
                      </label>
                    </>
                  ) : null}
                </div>
              </div>
            </Card>
          </motion.div>
        ))}

        <Card className="p-4 bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800">
          <div className="flex items-start space-x-3">
            <div className="w-5 h-5 bg-amber-500 rounded-full flex items-center justify-center mt-0.5">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" className="text-white">
                <path
                  d="M12 9v4"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
                <circle cx="12" cy="17" r="1" fill="currentColor" />
                <circle
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="2"
                  fill="none"
                />
              </svg>
            </div>
            <div className="flex-1">
              <p className="text-sm text-amber-700 dark:text-amber-300 mb-1">
                Credit Score Boost
              </p>
              <p className="text-xs text-amber-600 dark:text-amber-400">
                Each document uploaded improves your credit score. More documents = better loan terms!
              </p>
              <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">
                Documents uploaded: {totalUploaded} • Score boost: +{totalUploaded * 15} points
              </p>
            </div>
          </div>
        </Card>
      </motion.div>

      <motion.div
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4, duration: 0.5 }}
        className="mt-8 space-y-3"
      >
        <Button
          onClick={handleContinue}
          disabled={uploadedRequired.length < 3}
          className="w-full bg-[#007AFF] hover:bg-[#0056CC] text-white py-4 rounded-2xl disabled:opacity-50"
        >
          Continue ({uploadedRequired.length}/3 required)
        </Button>

        <Button
          variant="ghost"
          onClick={() => setCurrentScreen('kyc-facial')}
          className="w-full text-muted-foreground"
        >
          Back
        </Button>
      </motion.div>
    </div>
  );
};