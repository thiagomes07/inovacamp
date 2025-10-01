import React, { useState } from 'react';
import { motion } from 'motion/react';
import { useApp } from './AppProvider';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Input } from './ui/input';
import { toast } from 'sonner@2.0.3';
import { 
  ArrowLeft,
  Wallet,
  ArrowRight,
  Info,
  Calculator,
  Clock,
  Shield,
  DollarSign
} from 'lucide-react';

export const DepositConfirmationScreen: React.FC = () => {
  const { setCurrentScreen, user, updateUserBalance } = useApp();
  const [amount, setAmount] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [exchangeRate] = useState(5.2); // BRL to USD rate

  // Calculate values
  const brlAmount = parseFloat(amount) || 0;
  const usdcAmount = brlAmount / exchangeRate;
  const fee = 0; // Open Finance is free
  const totalBrlAmount = brlAmount + fee;

  const accountInfo = {
    type: 'Conta Corrente',
    number: '1234-5',
    bank: 'Nubank',
    balance: 15750.80
  };

  const handleAmountChange = (value: string) => {
    // Remove non-numeric characters except decimal point
    const cleanValue = value.replace(/[^\d.,]/g, '');
    setAmount(cleanValue);
  };

  const handleQuickAmount = (value: number) => {
    setAmount(value.toString());
  };

  const handleConfirmDeposit = async () => {
    if (!amount || brlAmount <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    if (brlAmount < 1) {
      toast.error('Minimum deposit amount is R$ 1.00');
      return;
    }

    if (brlAmount > 50000) {
      toast.error('Maximum deposit amount is R$ 50,000.00');
      return;
    }

    if (brlAmount > accountInfo.balance) {
      toast.error('Insufficient funds in your bank account');
      return;
    }

    setIsProcessing(true);
    
    // Simulate processing delay
    setTimeout(() => {
      // Update user balance
      updateUserBalance('stablecoin', usdcAmount);
      
      setCurrentScreen('deposit-processing');
    }, 1000);
  };

  const quickAmounts = [100, 500, 1000, 5000];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-white border-b border-border px-6 py-4">
        <div className="flex items-center justify-between">
          <button
            onClick={() => setCurrentScreen('account-selection')}
            className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          
          <div className="text-center">
            <h1 className="text-lg">Confirm Deposit</h1>
            <p className="text-sm text-gray-600">Review your transfer details</p>
          </div>
          
          <div className="w-10" />
        </div>
      </div>

      {/* From Account */}
      <div className="px-6 mt-6">
        <h3 className="text-sm text-gray-600 mb-3">From</h3>
        <Card className="p-4">
          <div className="flex items-center space-x-3">
            <div className="text-2xl">💜</div>
            <div className="flex-1">
              <h4 className="font-medium">{accountInfo.bank} - {accountInfo.type}</h4>
              <p className="text-sm text-gray-600">Account: {accountInfo.number}</p>
              <p className="text-sm text-gray-600">
                Available: R$ {accountInfo.balance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* To Account */}
      <div className="px-6 mt-4">
        <h3 className="text-sm text-gray-600 mb-3">To</h3>
        <Card className="p-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-[#007AFF] to-[#00C853] rounded-full flex items-center justify-center">
              <Wallet className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1">
              <h4 className="font-medium">Swapin Wallet</h4>
              <p className="text-sm text-gray-600">Your USDC balance</p>
              <p className="text-sm text-gray-600">
                Current: {user?.balances.stablecoin.toFixed(2)} USDC
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Amount Input */}
      <div className="px-6 mt-6">
        <h3 className="text-sm text-gray-600 mb-3">Amount to Deposit</h3>
        
        <div className="relative">
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
            R$
          </div>
          <Input
            type="text"
            placeholder="0.00"
            value={amount}
            onChange={(e) => handleAmountChange(e.target.value)}
            className="h-14 pl-10 pr-4 text-lg text-center"
          />
        </div>

        {/* Quick Amounts */}
        <div className="grid grid-cols-4 gap-2 mt-3">
          {quickAmounts.map((value) => (
            <Button
              key={value}
              variant="outline"
              size="sm"
              onClick={() => handleQuickAmount(value)}
              className="h-8 text-xs"
            >
              R$ {value}
            </Button>
          ))}
        </div>
      </div>

      {/* Exchange Rate & Summary */}
      {brlAmount > 0 && (
        <div className="px-6 mt-6">
          <Card className="p-4 space-y-3">
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <Calculator className="w-4 h-4" />
              <span>Exchange Rate: 1 USD = R$ {exchangeRate.toFixed(2)}</span>
            </div>
            
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Amount (BRL):</span>
                <span>R$ {brlAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
              </div>
              
              <div className="flex justify-between">
                <span>Exchange Fee:</span>
                <span className="text-[#00C853]">Free</span>
              </div>
              
              <div className="border-t pt-2 flex justify-between font-medium">
                <span>You'll receive:</span>
                <span>{usdcAmount.toFixed(6)} USDC</span>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Transfer Info */}
      <div className="px-6 mt-6">
        <Card className="p-4 bg-blue-50 border-blue-200">
          <div className="flex items-start space-x-3">
            <Info className="w-5 h-5 text-blue-600 mt-0.5" />
            <div className="space-y-2 text-sm text-blue-800">
              <div className="flex items-center space-x-2">
                <Clock className="w-4 h-4" />
                <span>Processing time: Instant</span>
              </div>
              <div className="flex items-center space-x-2">
                <Shield className="w-4 h-4" />
                <span>Protected by Open Finance Brasil</span>
              </div>
              <div className="flex items-center space-x-2">
                <DollarSign className="w-4 h-4" />
                <span>No fees for Open Finance transfers</span>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Security Notice */}
      <div className="px-6 mt-4">
        <Card className="p-3 bg-gray-50">
          <p className="text-xs text-gray-600 text-center">
            This transfer is secured by bank-level encryption and monitored 24/7 for fraud protection.
          </p>
        </Card>
      </div>

      {/* Confirm Button */}
      <div className="px-6 mt-8 mb-8">
        <Button
          onClick={handleConfirmDeposit}
          disabled={!amount || brlAmount <= 0 || isProcessing}
          className="w-full h-12 bg-[#007AFF] hover:bg-[#007AFF]/90 disabled:opacity-50"
        >
          {isProcessing ? 'Processing...' : (
            <>
              Confirm Deposit
              <ArrowRight className="w-4 h-4 ml-2" />
            </>
          )}
        </Button>
        
        {brlAmount > 0 && (
          <p className="text-xs text-gray-500 text-center mt-2">
            You're depositing R$ {brlAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} 
            to receive {usdcAmount.toFixed(6)} USDC
          </p>
        )}
      </div>
    </div>
  );
};