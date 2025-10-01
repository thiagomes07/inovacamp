import React, { useState } from 'react';
import { motion } from 'motion/react';
import { useApp } from './AppProvider';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { toast } from 'sonner@2.0.3';
import { 
  ArrowLeft,
  Building2,
  CreditCard,
  Smartphone,
  Banknote,
  Shield,
  Zap,
  Clock,
  CheckCircle
} from 'lucide-react';

export const DepositMethodScreen: React.FC = () => {
  const { setCurrentScreen } = useApp();
  const [selectedMethod, setSelectedMethod] = useState<string | null>(null);

  const depositMethods = [
    {
      id: 'open-finance',
      title: 'Open Finance',
      subtitle: 'Connect your bank account',
      description: 'Instant transfer from any Brazilian bank',
      icon: Building2,
      badge: 'Recommended',
      badgeColor: '#00C853',
      fees: 'Free',
      time: 'Instant',
      limits: 'Up to R$ 50,000/day'
    },
    {
      id: 'pix',
      title: 'PIX',
      subtitle: 'Instant payment',
      description: 'Transfer using PIX QR code or key',
      icon: Zap,
      badge: 'Popular',
      badgeColor: '#007AFF',
      fees: 'Free',
      time: 'Instant',
      limits: 'Up to R$ 20,000/day'
    },
    {
      id: 'card',
      title: 'Credit/Debit Card',
      subtitle: 'Visa, Mastercard',
      description: 'Use your credit or debit card',
      icon: CreditCard,
      badge: null,
      badgeColor: '',
      fees: '2.5%',
      time: '5-10 min',
      limits: 'Up to R$ 10,000/day'
    },
    {
      id: 'bank-transfer',
      title: 'Bank Transfer',
      subtitle: 'Traditional TED/DOC',
      description: 'Transfer from your bank',
      icon: Banknote,
      badge: null,
      badgeColor: '',
      fees: 'R$ 5.00',
      time: '1-2 hours',
      limits: 'Up to R$ 100,000/day'
    }
  ];

  const handleMethodSelect = (methodId: string) => {
    setSelectedMethod(methodId);
    
    // Navigate based on selected method
    setTimeout(() => {
      switch (methodId) {
        case 'open-finance':
          setCurrentScreen('open-finance');
          break;
        case 'pix':
          setCurrentScreen('pix');
          break;
        case 'card':
          toast.info('Credit/Debit card deposit coming soon!');
          break;
        case 'bank-transfer':
          toast.info('Bank transfer deposit coming soon!');
          break;
        default:
          break;
      }
    }, 300);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-white border-b border-border px-6 py-4">
        <div className="flex items-center justify-between">
          <button
            onClick={() => setCurrentScreen('home')}
            className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          
          <div className="text-center">
            <h1 className="text-lg">Deposit Money</h1>
            <p className="text-sm text-gray-600">Choose your deposit method</p>
          </div>
          
          <div className="w-10" />
        </div>
      </div>

      {/* Security Banner */}
      <div className="bg-gradient-to-r from-[#007AFF]/10 to-[#00C853]/10 mx-6 mt-6 p-4 rounded-2xl border border-[#007AFF]/20">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-[#007AFF]/20 rounded-full flex items-center justify-center">
            <Shield className="w-5 h-5 text-[#007AFF]" />
          </div>
          <div>
            <h3 className="text-sm">Bank-level security</h3>
            <p className="text-xs text-gray-600">Your deposits are protected by 256-bit SSL encryption</p>
          </div>
        </div>
      </div>

      {/* Deposit Methods */}
      <div className="px-6 mt-6 space-y-3">
        {depositMethods.map((method) => {
          const IconComponent = method.icon;
          const isSelected = selectedMethod === method.id;
          
          return (
            <motion.div
              key={method.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Card 
                className={`p-4 cursor-pointer transition-all duration-200 ${
                  isSelected 
                    ? 'border-[#007AFF] bg-[#007AFF]/5' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => handleMethodSelect(method.id)}
              >
                <div className="flex items-center space-x-4">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                    isSelected ? 'bg-[#007AFF]/20' : 'bg-gray-100'
                  }`}>
                    <IconComponent className={`w-6 h-6 ${
                      isSelected ? 'text-[#007AFF]' : 'text-gray-600'
                    }`} />
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <h3 className="font-medium">{method.title}</h3>
                      {method.badge && (
                        <Badge 
                          style={{ backgroundColor: method.badgeColor }}
                          className="text-white text-xs px-2 py-0.5"
                        >
                          {method.badge}
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{method.description}</p>
                    
                    <div className="flex items-center space-x-4 text-xs text-gray-500">
                      <span>Fee: {method.fees}</span>
                      <span>•</span>
                      <span>Time: {method.time}</span>
                      <span>•</span>
                      <span>{method.limits}</span>
                    </div>
                  </div>
                  
                  {isSelected && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="w-6 h-6 bg-[#007AFF] rounded-full flex items-center justify-center"
                    >
                      <CheckCircle className="w-4 h-4 text-white" />
                    </motion.div>
                  )}
                </div>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Help Section */}
      <div className="px-6 mt-8 mb-8">
        <Card className="p-4 bg-gray-50">
          <h4 className="text-sm mb-2">Need help?</h4>
          <p className="text-xs text-gray-600 mb-3">
            Contact our support team for assistance with deposits or account verification.
          </p>
          <Button variant="outline" size="sm" className="w-full">
            Contact Support
          </Button>
        </Card>
      </div>
    </div>
  );
};