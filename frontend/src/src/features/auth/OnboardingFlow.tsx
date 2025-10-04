import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft } from 'lucide-react';
import { ProfileSelection } from './onboarding/ProfileSelection';
import { UserTypeSelection } from './onboarding/UserTypeSelection';
import { BasicInfo } from './onboarding/BasicInfo';
import { PhoneVerification } from './onboarding/PhoneVerification';
import { KYCUpload } from './onboarding/KYCUpload';
import { BiometricVerification } from './onboarding/BiometricVerification';
import { OnboardingSuccess } from './onboarding/OnboardingSuccess';

interface OnboardingFlowProps {
  onBack: () => void;
  onComplete: () => void;
}

export interface OnboardingData {
  profileType: 'borrower' | 'lender' | null;
  userType: 'individual' | 'company' | 'employee' | null;
  name: string;
  email: string;
  password: string;
  phone: string;
  verificationCode: string;
  kycDocuments: {
    frontDocument?: File;
    backDocument?: File;
  };
  biometricData?: any;
}

const STEPS = [
  'profile',
  'userType',
  'basicInfo',
  'phoneVerification',
  'kycUpload',
  'biometric',
  'success'
] as const;

export const OnboardingFlow: React.FC<OnboardingFlowProps> = ({ onBack, onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [data, setData] = useState<OnboardingData>({
    profileType: null,
    userType: null,
    name: '',
    email: '',
    password: '',
    phone: '',
    verificationCode: '',
    kycDocuments: {}
  });

  const updateData = (newData: Partial<OnboardingData>) => {
    setData(prev => ({ ...prev, ...newData }));
  };

  const nextStep = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleBack = () => {
    if (currentStep === 0) {
      onBack();
    } else {
      prevStep();
    }
  };

  const getStepComponent = () => {
    switch (STEPS[currentStep]) {
      case 'profile':
        return (
          <ProfileSelection
            selectedProfile={data.profileType}
            onSelect={(profile) => {
              updateData({ profileType: profile });
              nextStep();
            }}
          />
        );
      
      case 'userType':
        return (
          <UserTypeSelection
            profileType={data.profileType!}
            selectedType={data.userType}
            onSelect={(type) => {
              updateData({ userType: type });
              nextStep();
            }}
            onSkip={() => {
              updateData({ userType: 'individual' });
              nextStep();
            }}
          />
        );
      
      case 'basicInfo':
        return (
          <BasicInfo
            data={data}
            onUpdate={updateData}
            onNext={nextStep}
          />
        );
      
      case 'phoneVerification':
        return (
          <PhoneVerification
            phone={data.phone}
            verificationCode={data.verificationCode}
            onUpdate={updateData}
            onNext={nextStep}
          />
        );
      
      case 'kycUpload':
        return (
          <KYCUpload
            documents={data.kycDocuments}
            onUpdate={(docs) => updateData({ kycDocuments: docs })}
            onNext={nextStep}
          />
        );
      
      case 'biometric':
        return (
          <BiometricVerification
            onComplete={(biometricData) => {
              updateData({ biometricData });
              nextStep();
            }}
            onSkip={() => {
              updateData({ biometricData: { skipped: true, timestamp: new Date().toISOString() } });
              nextStep();
            }}
          />
        );
      
      case 'success':
        return (
          <OnboardingSuccess
            userData={data}
            onComplete={onComplete}
          />
        );
      
      default:
        return null;
    }
  };

  const shouldShowUserType = data.profileType === 'borrower';
  const progress = shouldShowUserType 
    ? ((currentStep + 1) / STEPS.length) * 100
    : (currentStep / (STEPS.length - 1)) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-6">
        <button
          onClick={handleBack}
          className="text-gray-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        
        <div className="flex-1 mx-4">
          <div className="bg-gray-700 rounded-full h-2">
            <motion.div
              className="bg-green-500 h-2 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>
        
        <span className="text-sm text-gray-400">
          {currentStep + 1}/{shouldShowUserType ? STEPS.length : STEPS.length - 1}
        </span>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ x: 300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -300, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="h-full"
          >
            {getStepComponent()}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};