import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft } from 'lucide-react';
import { Button } from '../../../../components/ui/button';
import { FacialVerification } from './FacialVerification';
import { LoanConditions } from './LoanConditions';
import { CollateralOffer } from './CollateralOffer';
import { ApprovalTypeSelection } from './ApprovalTypeSelection';
import { LoanReview } from './LoanReview';
import { LoanProcessing } from './LoanProcessing';
import { useCredit } from '../../../shared/hooks/useCredit';
import { toast } from 'sonner';

export interface LocationData {
  latitude: number;
  longitude: number;
  timestamp: string;
  accuracy?: number;
}

export interface CreditRequestData {
  // Loan conditions
  amount: number;
  installments: number;
  interestRate: number;
  monthlyPayment: number;
  totalAmount: number;
  
  // Collateral (optional)
  hasCollateral: boolean;
  collateral?: {
    type: 'vehicle' | 'property' | 'equipment' | 'receivables';
    description: string;
    estimatedValue: number;
    documents: File[];
    photos: File[];
  };
  
  // Approval type
  approvalType: 'automatic' | 'manual' | 'both';
  
  // Location data
  location?: LocationData;
  
  // Processing status
  isProcessing: boolean;
  isApproved?: boolean;
  rejectionReason?: string;
}

type CreditRequestStep = 'facial' | 'conditions' | 'collateral' | 'approval-type' | 'review' | 'processing';

interface CreditRequestFlowProps {
  onBack: () => void;
  onComplete: () => void;
}

export const CreditRequestFlow: React.FC<CreditRequestFlowProps> = ({
  onBack,
  onComplete
}) => {
  const [currentStep, setCurrentStep] = useState<CreditRequestStep>('facial');
  const [requestData, setRequestData] = useState<CreditRequestData>({
    amount: 0,
    installments: 12,
    interestRate: 0,
    monthlyPayment: 0,
    totalAmount: 0,
    hasCollateral: false,
    approvalType: 'automatic',
    isProcessing: false
  });

  const { requestCredit, getAvailableCredit } = useCredit();
  const availableCredit = getAvailableCredit();

  const stepOrder: CreditRequestStep[] = ['facial', 'conditions', 'collateral', 'approval-type', 'review', 'processing'];
  const currentStepIndex = stepOrder.indexOf(currentStep);

  const handleNext = () => {
    if (currentStepIndex < stepOrder.length - 1) {
      setCurrentStep(stepOrder[currentStepIndex + 1]);
    }
  };

  const handlePrevious = () => {
    if (currentStepIndex > 0) {
      setCurrentStep(stepOrder[currentStepIndex - 1]);
    } else {
      onBack();
    }
  };

  const handleFacialVerificationComplete = (locationData: LocationData) => {
    setRequestData(prev => ({ 
      ...prev, 
      location: locationData 
    }));
    toast.success('Verificação de segurança concluída com sucesso!');
    handleNext();
  };

  const handleConditionsUpdate = (conditions: Partial<CreditRequestData>) => {
    setRequestData(prev => ({ ...prev, ...conditions }));
  };

  const handleCollateralUpdate = (collateralData: Partial<CreditRequestData>) => {
    setRequestData(prev => ({ ...prev, ...collateralData }));
  };

  const handleApprovalTypeUpdate = (approvalType: CreditRequestData['approvalType']) => {
    setRequestData(prev => ({ ...prev, approvalType }));
  };

  const handleSubmitRequest = async () => {
    try {
      setRequestData(prev => ({ ...prev, isProcessing: true }));
      setCurrentStep('processing');

      // Submit credit request with location data
      const result = await requestCredit({
        amount: requestData.amount,
        installments: requestData.installments,
        interestRate: requestData.interestRate,
        totalAmount: requestData.totalAmount,
        monthlyPayment: requestData.monthlyPayment,
        collateral: requestData.hasCollateral ? {
          type: requestData.collateral!.type,
          description: requestData.collateral!.description,
          value: requestData.collateral!.estimatedValue,
          documents: requestData.collateral!.documents
        } : undefined,
        approvalType: requestData.approvalType,
        location: requestData.location // Send location data to backend
      });

      // Check if was approved
      if (result && result.status === 'approved') {
        setRequestData(prev => ({ ...prev, isApproved: true }));
      }

      // Processing will be handled by the LoanProcessing component
    } catch (error) {
      toast.error('Erro ao processar solicitação');
      setRequestData(prev => ({ ...prev, isProcessing: false }));
      setCurrentStep('review');
    }
  };

  const handleProcessingComplete = (approved: boolean) => {
    setRequestData(prev => ({ 
      ...prev, 
      isProcessing: false, 
      isApproved: approved 
    }));
    
    if (approved) {
      toast.success('Crédito aprovado! Valor creditado na sua conta.');
      setTimeout(() => onComplete(), 2000);
    }
  };

  const getStepTitle = () => {
    switch (currentStep) {
      case 'facial': return 'Verificação de Segurança';
      case 'conditions': return 'Condições do Empréstimo';
      case 'collateral': return 'Garantia (Opcional)';
      case 'approval-type': return 'Tipo de Aprovação';
      case 'review': return 'Revisão da Solicitação';
      case 'processing': return 'Processando Solicitação';
      default: return '';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <div className="p-6 border-b border-gray-700">
        <div className="flex items-center gap-3">
          <Button
            onClick={handlePrevious}
            variant="outline"
            size="sm"
            className="border-gray-600"
            disabled={currentStep === 'processing'}
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-white">{getStepTitle()}</h1>
            <div className="flex items-center gap-2 mt-2">
              {stepOrder.map((step, index) => (
                <div
                  key={step}
                  className={`h-2 flex-1 rounded-full transition-colors ${
                    index <= currentStepIndex
                      ? 'bg-green-500'
                      : 'bg-gray-600'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Step Content */}
      <div className="flex-1">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -20, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="h-full"
          >
            {currentStep === 'facial' && (
              <FacialVerification
                onComplete={handleFacialVerificationComplete}
              />
            )}

            {currentStep === 'conditions' && (
              <LoanConditions
                data={requestData}
                availableCredit={availableCredit}
                onUpdate={handleConditionsUpdate}
                onNext={handleNext}
              />
            )}

            {currentStep === 'collateral' && (
              <CollateralOffer
                data={requestData}
                onUpdate={handleCollateralUpdate}
                onNext={handleNext}
              />
            )}

            {currentStep === 'approval-type' && (
              <ApprovalTypeSelection
                approvalType={requestData.approvalType}
                onUpdate={handleApprovalTypeUpdate}
                onNext={handleNext}
              />
            )}

            {currentStep === 'review' && (
              <LoanReview
                data={requestData}
                onSubmit={handleSubmitRequest}
                onEdit={(step) => setCurrentStep(step)}
              />
            )}

            {currentStep === 'processing' && (
              <LoanProcessing
                data={requestData}
                onComplete={handleProcessingComplete}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};