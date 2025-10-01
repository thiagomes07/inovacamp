import React, { useState } from 'react';
import { motion } from 'motion/react';
import { useApp } from './AppProvider';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { toast } from 'sonner@2.0.3';
import { 
  ArrowLeft,
  Wallet,
  PiggyBank,
  CreditCard,
  CheckCircle,
  ArrowRight,
  Eye,
  EyeOff
} from 'lucide-react';

export const AccountSelectionScreen: React.FC = () => {
  const { setCurrentScreen } = useApp();
  const [selectedAccount, setSelectedAccount] = useState<string | null>(null);
  const [showBalance, setShowBalance] = useState(false);

  const accounts = [
    {
      id: 'checking',
      type: 'Conta Corrente',
      number: '1234-5',
      balance: 15750.80,
      icon: Wallet,
      color: '#007AFF',
      available: true,
      description: 'Available for instant transfers'
    },
    {
      id: 'savings',
      type: 'Conta Poupança',
      number: '1234-8',
      balance: 8320.45,
      icon: PiggyBank,
      color: '#00C853',
      available: true,
      description: 'Transfer from your savings'
    },
    {
      id: 'credit',
      type: 'Cartão de Crédito',
      number: '****-1234',
      balance: 2500.00,
      icon: CreditCard,
      color: '#FFD700',
      available: false,
      description: 'Available limit (cash advance not supported)'
    }
  ];

  const handleAccountSelect = (accountId: string) => {
    const account = accounts.find(acc => acc.id === accountId);
    
    if (!account?.available) {
      toast.error('This account type is not available for deposits');
      return;
    }

    setSelectedAccount(accountId);
  };

  const handleContinue = () => {
    if (!selectedAccount) {
      toast.error('Please select an account');
      return;
    }

    const account = accounts.find(acc => acc.id === selectedAccount);
    toast.success(`Selected ${account?.type} ending in ${account?.number}`);
    setCurrentScreen('deposit-confirmation');
  };

  const formatBalance = (balance: number) => {
    return showBalance ? 
      `R$ ${balance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : 
      'R$ ••••••';
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-white border-b border-border px-6 py-4">
        <div className="flex items-center justify-between">
          <button
            onClick={() => setCurrentScreen('bank-auth')}
            className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          
          <div className="text-center">
            <h1 className="text-lg">Select Account</h1>
            <p className="text-sm text-gray-600">Choose account to transfer from</p>
          </div>
          
          <button
            onClick={() => setShowBalance(!showBalance)}
            className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center"
          >
            {showBalance ? (
              <EyeOff className="w-5 h-5 text-gray-600" />
            ) : (
              <Eye className="w-5 h-5 text-gray-600" />
            )}
          </button>
        </div>
      </div>

      {/* Bank Info */}
      <div className="px-6 mt-6">
        <Card className="p-4 bg-purple-50 border-purple-200">
          <div className="flex items-center space-x-3">
            <div className="text-2xl">💜</div>
            <div>
              <h3 className="text-sm">Connected to Nubank</h3>
              <p className="text-xs text-gray-600">Select which account to use for the transfer</p>
            </div>
            <div className="ml-auto">
              <CheckCircle className="w-5 h-5 text-[#00C853]" />
            </div>
          </div>
        </Card>
      </div>

      {/* Accounts List */}
      <div className="px-6 mt-6 space-y-3">
        <h3 className="text-sm text-gray-600 mb-3">Available Accounts</h3>
        
        {accounts.map((account) => {
          const IconComponent = account.icon;
          const isSelected = selectedAccount === account.id;
          const isAvailable = account.available;
          
          return (
            <motion.div
              key={account.id}
              whileHover={{ scale: isAvailable ? 1.02 : 1 }}
              whileTap={{ scale: isAvailable ? 0.98 : 1 }}
            >
              <Card 
                className={`p-4 transition-all duration-200 ${
                  !isAvailable 
                    ? 'opacity-60 cursor-not-allowed bg-gray-50' 
                    : isSelected 
                      ? 'border-[#007AFF] bg-[#007AFF]/5 cursor-pointer' 
                      : 'border-gray-200 hover:border-gray-300 cursor-pointer'
                }`}
                onClick={() => handleAccountSelect(account.id)}
              >
                <div className="flex items-center space-x-4">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                    isSelected && isAvailable
                      ? 'bg-[#007AFF]/20' 
                      : 'bg-gray-100'
                  }`}>
                    <IconComponent 
                      className={`w-6 h-6 ${
                        isSelected && isAvailable
                          ? 'text-[#007AFF]' 
                          : 'text-gray-600'
                      }`} 
                      style={{ color: isAvailable ? account.color : undefined }}
                    />
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <h4 className="font-medium">{account.type}</h4>
                      {!isAvailable && (
                        <Badge variant="outline" className="text-xs px-2 py-0.5 border-gray-400 text-gray-500">
                          Unavailable
                        </Badge>
                      )}
                    </div>
                    
                    <p className="text-sm text-gray-600 mb-1">
                      Account: {account.number}
                    </p>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm">
                        Balance: {formatBalance(account.balance)}
                      </span>
                      <span className="text-xs text-gray-500">
                        {account.description}
                      </span>
                    </div>
                  </div>
                  
                  {isSelected && isAvailable && (
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

      {/* Transfer Limits Info */}
      <div className="px-6 mt-6">
        <Card className="p-4 bg-blue-50 border-blue-200">
          <h4 className="text-sm mb-2 text-blue-800">Transfer Limits</h4>
          <ul className="text-xs text-blue-700 space-y-1">
            <li>• Minimum: R$ 1.00</li>
            <li>• Maximum per transaction: R$ 50,000.00</li>
            <li>• Daily limit: R$ 50,000.00</li>
            <li>• Monthly limit: R$ 200,000.00</li>
          </ul>
        </Card>
      </div>

      {/* Continue Button */}
      <div className="px-6 mt-8 mb-8">
        <Button
          onClick={handleContinue}
          disabled={!selectedAccount}
          className="w-full h-12 bg-[#007AFF] hover:bg-[#007AFF]/90 disabled:opacity-50"
        >
          Continue
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  );
};