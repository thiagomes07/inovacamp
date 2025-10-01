import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useApp } from './AppProvider';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { Progress } from './ui/progress';
import { toast } from 'sonner@2.0.3';
import { 
  ArrowLeft, 
  ArrowRight, 
  Upload, 
  Camera, 
  FileText,
  Check,
  X,
  User,
  DollarSign,
  Calendar,
  Shield
} from 'lucide-react';

interface CreditRequestData {
  personalInfo: {
    name: string;
    email: string;
    phone: string;
    rg: string;
    cpf: string;
  };
  amount: number;
  duration: number;
  purpose: string;
  documents: string[];
}

export const CreditRequestFlow: React.FC = () => {
  const { user, setCurrentScreen, addCreditRequest } = useApp();
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<CreditRequestData>({
    personalInfo: {
      name: user?.name || '',
      email: user?.email || '',
      phone: user?.phone || '',
      rg: '',
      cpf: ''
    },
    amount: 1000,
    duration: 12,
    purpose: '',
    documents: []
  });

  const steps = [
    { title: 'Personal Info', icon: User },
    { title: 'Loan Details', icon: DollarSign },
    { title: 'Documents', icon: FileText },
    { title: 'Review', icon: Check }
  ];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleSubmit();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    } else {
      setCurrentScreen('home');
    }
  };

  const handleSubmit = async () => {
    try {
      const newRequest = {
        id: Math.random().toString(36).substr(2, 9),
        borrowerId: user?.id || '',
        amount: formData.amount,
        currency: 'BRL',
        duration: formData.duration,
        riskScore: user?.creditScore || 650,
        status: 'pending' as const,
        documents: formData.documents,
        requestDate: new Date().toISOString()
      };

      addCreditRequest(newRequest);
      toast.success('Credit request submitted successfully!');
      setCurrentScreen('home');
    } catch (error) {
      toast.error('Failed to submit request. Please try again.');
    }
  };

  const progress = ((currentStep + 1) / steps.length) * 100;

  const renderPersonalInfo = () => (
    <div className="space-y-4">
      <h2 className="text-xl mb-4">Personal Information</h2>
      
      <div className="space-y-3">
        <div>
          <Label htmlFor="name">Full Name</Label>
          <Input
            id="name"
            value={formData.personalInfo.name}
            onChange={(e) => setFormData(prev => ({
              ...prev,
              personalInfo: { ...prev.personalInfo, name: e.target.value }
            }))}
            disabled={!!user?.name}
            className="mt-1"
          />
        </div>
        
        <div>
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={formData.personalInfo.email}
            onChange={(e) => setFormData(prev => ({
              ...prev,
              personalInfo: { ...prev.personalInfo, email: e.target.value }
            }))}
            disabled={!!user?.email}
            className="mt-1"
          />
        </div>
        
        <div>
          <Label htmlFor="phone">Phone</Label>
          <Input
            id="phone"
            value={formData.personalInfo.phone}
            onChange={(e) => setFormData(prev => ({
              ...prev,
              personalInfo: { ...prev.personalInfo, phone: e.target.value }
            }))}
            disabled={!!user?.phone}
            className="mt-1"
          />
        </div>
        
        <div>
          <Label htmlFor="rg">RG Number</Label>
          <Input
            id="rg"
            value={formData.personalInfo.rg}
            onChange={(e) => setFormData(prev => ({
              ...prev,
              personalInfo: { ...prev.personalInfo, rg: e.target.value }
            }))}
            placeholder="XX.XXX.XXX-X"
            className="mt-1"
          />
        </div>
        
        <div>
          <Label htmlFor="cpf">CPF Number</Label>
          <Input
            id="cpf"
            value={formData.personalInfo.cpf}
            onChange={(e) => setFormData(prev => ({
              ...prev,
              personalInfo: { ...prev.personalInfo, cpf: e.target.value }
            }))}
            placeholder="XXX.XXX.XXX-XX"
            className="mt-1"
          />
        </div>
      </div>
    </div>
  );

  const renderLoanDetails = () => (
    <div className="space-y-6">
      <h2 className="text-xl mb-4">Loan Details</h2>
      
      <div className="space-y-4">
        <div>
          <Label htmlFor="amount">Loan Amount (R$)</Label>
          <div className="mt-2">
            <Input
              id="amount"
              type="number"
              value={formData.amount}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                amount: Number(e.target.value)
              }))}
              min={500}
              max={10000}
              step={100}
            />
            <div className="flex justify-between text-xs text-muted-foreground mt-1">
              <span>Min: R$ 500</span>
              <span>Max: R$ 10,000</span>
            </div>
          </div>
        </div>
        
        <div>
          <Label htmlFor="duration">Duration (months)</Label>
          <div className="mt-2">
            <RadioGroup
              value={formData.duration.toString()}
              onValueChange={(value) => setFormData(prev => ({
                ...prev,
                duration: Number(value)
              }))}
              className="flex flex-wrap gap-4"
            >
              {[6, 12, 18, 24].map((months) => (
                <div key={months} className="flex items-center space-x-2">
                  <RadioGroupItem value={months.toString()} id={`duration-${months}`} />
                  <Label htmlFor={`duration-${months}`} className="text-sm">
                    {months} months
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>
        </div>
        
        <div>
          <Label htmlFor="purpose">Purpose of Loan</Label>
          <RadioGroup
            value={formData.purpose}
            onValueChange={(value) => setFormData(prev => ({ ...prev, purpose: value }))}
            className="mt-2 space-y-2"
          >
            {[
              'Business expansion',
              'Emergency expenses',
              'Debt consolidation',
              'Equipment purchase',
              'Working capital',
              'Other'
            ].map((purpose) => (
              <div key={purpose} className="flex items-center space-x-2">
                <RadioGroupItem value={purpose} id={purpose} />
                <Label htmlFor={purpose} className="text-sm">
                  {purpose}
                </Label>
              </div>
            ))}
          </RadioGroup>
        </div>
      </div>
      
      <Card className="p-4 bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800">
        <div className="flex items-start space-x-3">
          <Shield className="w-5 h-5 text-[#007AFF] mt-0.5" />
          <div>
            <h4 className="text-sm text-[#007AFF] mb-1">Estimated Terms</h4>
            <div className="text-xs text-muted-foreground space-y-1">
              <p>Interest Rate: ~15% APR</p>
              <p>Monthly Payment: ~R$ {Math.round((formData.amount * 1.15) / formData.duration)}</p>
              <p>Total Repayment: ~R$ {Math.round(formData.amount * 1.15)}</p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );

  const renderDocuments = () => {
    const requiredDocs = [
      'Income proof (payslip/bank statement)',
      'Identity document (RG/CNH)',
      'CPF document',
      'Address proof (utility bill)'
    ];

    return (
      <div className="space-y-6">
        <h2 className="text-xl mb-4">Upload Documents</h2>
        
        <p className="text-sm text-muted-foreground mb-4">
          Upload these documents to improve your approval chances and get better rates.
        </p>
        
        <div className="space-y-3">
          {requiredDocs.map((doc, index) => {
            const isUploaded = formData.documents.includes(doc);
            
            return (
              <Card key={doc} className={`p-4 transition-all ${
                isUploaded ? 'bg-[#00C853]/5 border-[#00C853]/20' : ''
              }`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      isUploaded ? 'bg-[#00C853] text-white' : 'bg-muted text-muted-foreground'
                    }`}>
                      {isUploaded ? (
                        <Check className="w-4 h-4" />
                      ) : (
                        <FileText className="w-4 h-4" />
                      )}
                    </div>
                    <div>
                      <p className="text-sm">{doc}</p>
                      <p className="text-xs text-muted-foreground">
                        {isUploaded ? 'Uploaded' : 'Required'}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex space-x-2">
                    {isUploaded ? (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setFormData(prev => ({
                          ...prev,
                          documents: prev.documents.filter(d => d !== doc)
                        }))}
                        className="text-destructive hover:text-destructive/80"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    ) : (
                      <>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            // Simulate camera capture
                            setTimeout(() => {
                              setFormData(prev => ({
                                ...prev,
                                documents: [...prev.documents, doc]
                              }));
                              toast.success('Document uploaded successfully');
                            }, 1000);
                          }}
                          className="text-[#007AFF]"
                        >
                          <Camera className="w-4 h-4" />
                        </Button>
                        
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            // Simulate file upload
                            setTimeout(() => {
                              setFormData(prev => ({
                                ...prev,
                                documents: [...prev.documents, doc]
                              }));
                              toast.success('Document uploaded successfully');
                            }, 1000);
                          }}
                          className="text-[#007AFF]"
                        >
                          <Upload className="w-4 h-4" />
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
        
        <Card className="p-4 bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800">
          <p className="text-sm text-amber-700 dark:text-amber-300">
            <strong>Tip:</strong> Uploading all documents increases your approval chances by 80% 
            and may qualify you for better interest rates.
          </p>
        </Card>
      </div>
    );
  };

  const renderReview = () => (
    <div className="space-y-6">
      <h2 className="text-xl mb-4">Review Your Request</h2>
      
      <div className="space-y-4">
        <Card className="p-4">
          <h3 className="mb-3">Personal Information</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Name:</span>
              <span>{formData.personalInfo.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Email:</span>
              <span>{formData.personalInfo.email}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Phone:</span>
              <span>{formData.personalInfo.phone}</span>
            </div>
          </div>
        </Card>
        
        <Card className="p-4">
          <h3 className="mb-3">Loan Details</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Amount:</span>
              <span className="text-[#007AFF]">R$ {formData.amount.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Duration:</span>
              <span>{formData.duration} months</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Purpose:</span>
              <span>{formData.purpose}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Est. Monthly Payment:</span>
              <span>R$ {Math.round((formData.amount * 1.15) / formData.duration)}</span>
            </div>
          </div>
        </Card>
        
        <Card className="p-4">
          <h3 className="mb-3">Documents ({formData.documents.length}/4)</h3>
          <div className="space-y-1">
            {formData.documents.map((doc) => (
              <div key={doc} className="flex items-center space-x-2 text-sm">
                <Check className="w-4 h-4 text-[#00C853]" />
                <span>{doc}</span>
              </div>
            ))}
          </div>
        </Card>
        
        <Card className="p-4 bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800">
          <div className="flex items-start space-x-3">
            <Check className="w-5 h-5 text-[#00C853] mt-0.5" />
            <div>
              <h4 className="text-sm text-[#00C853] mb-1">Ready to Submit</h4>
              <p className="text-xs text-muted-foreground">
                Your request will be reviewed by lenders. You'll receive notifications about approval status.
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 0: return renderPersonalInfo();
      case 1: return renderLoanDetails();
      case 2: return renderDocuments();
      case 3: return renderReview();
      default: return null;
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 0:
        return Object.values(formData.personalInfo).every(value => value.trim() !== '');
      case 1:
        return formData.amount >= 500 && formData.purpose !== '';
      case 2:
        return formData.documents.length >= 2; // Minimum 2 documents
      case 3:
        return true;
      default:
        return false;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-[#007AFF] px-6 pt-12 pb-6">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={handleBack}
            className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center"
          >
            <ArrowLeft className="w-5 h-5 text-white" />
          </button>
          
          <h1 className="text-white text-lg">Credit Request</h1>
          
          <button
            onClick={() => setCurrentScreen('home')}
            className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center"
          >
            <X className="w-5 h-5 text-white" />
          </button>
        </div>
        
        {/* Progress */}
        <div className="space-y-3">
          <div className="flex justify-between text-white/80 text-sm">
            <span>Step {currentStep + 1} of {steps.length}</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-2 bg-white/20" />
          
          <div className="flex justify-between">
            {steps.map((step, index) => {
              const StepIcon = step.icon;
              const isActive = index === currentStep;
              const isCompleted = index < currentStep;
              
              return (
                <div key={step.title} className="flex flex-col items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center mb-1 ${
                    isCompleted ? 'bg-white text-[#007AFF]' :
                    isActive ? 'bg-white/20 text-white border-2 border-white' :
                    'bg-white/10 text-white/60'
                  }`}>
                    {isCompleted ? (
                      <Check className="w-4 h-4" />
                    ) : (
                      <StepIcon className="w-4 h-4" />
                    )}
                  </div>
                  <span className={`text-xs ${
                    isActive ? 'text-white' : 'text-white/60'
                  }`}>
                    {step.title}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-6 py-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -20, opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            {renderCurrentStep()}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Footer */}
      <div className="fixed bottom-0 left-0 right-0 bg-background border-t border-border p-6">
        <div className="flex space-x-3">
          <Button
            variant="outline"
            onClick={handleBack}
            className="flex-1"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            {currentStep === 0 ? 'Cancel' : 'Back'}
          </Button>
          
          <Button
            onClick={handleNext}
            disabled={!canProceed()}
            className="flex-1 bg-[#007AFF] hover:bg-[#0056CC] text-white"
          >
            {currentStep === steps.length - 1 ? 'Submit Request' : 'Next'}
            {currentStep < steps.length - 1 && (
              <ArrowRight className="w-4 h-4 ml-2" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};