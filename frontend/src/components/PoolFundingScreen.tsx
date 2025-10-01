import React, { useState } from 'react';
import { motion } from 'motion/react';
import { useApp } from './AppProvider';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { toast } from 'sonner@2.0.3';
import { 
  ArrowLeft, 
  Wallet,
  DollarSign,
  AlertCircle,
  CheckCircle,
  Plus,
  CreditCard,
  Building2
} from 'lucide-react';

export const PoolFundingScreen: React.FC = () => {
  const { 
    setCurrentScreen, 
    user, 
    poolCreation, 
    updatePoolCreationState,
    depositFunds
  } = useApp();

  const [depositAmount, setDepositAmount] = useState('');
  const [selectedMethod, setSelectedMethod] = useState<'bank' | 'card'>('bank');
  const [isDepositing, setIsDepositing] = useState(false);

  const availableBalance = user?.balances.fiat || 0;
  const requiredAmount = poolCreation.totalAmount;
  const shortfall = requiredAmount - availableBalance;
  const hasSufficientFunds = availableBalance >= requiredAmount;

  const handleDeposit = async () => {
    const amount = parseFloat(depositAmount);
    
    if (!amount || amount <= 0) {
      toast.error('Please enter a valid deposit amount');
      return;
    }

    if (amount < shortfall) {
      toast.error(`Minimum deposit required: R$ ${shortfall.toLocaleString('pt-BR')}`);
      return;
    }

    setIsDepositing(true);
    
    // Simulate deposit processing
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    depositFunds(amount);
    toast.success(`R$ ${amount.toLocaleString('pt-BR')} deposited successfully`);
    
    updatePoolCreationState({
      hasSufficientFunds: true
    });

    setIsDepositing(false);
    setCurrentScreen('pool-distribution');
  };

  const handleContinue = () => {
    if (hasSufficientFunds) {
      setCurrentScreen('pool-distribution');
    } else {
      toast.error('Please deposit funds first');
    }
  };

  const handleSkipToDistribution = () => {
    if (hasSufficientFunds) {
      setCurrentScreen('pool-distribution');
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background border-b border-border px-4 py-3">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setCurrentScreen('create-pool')}
            className="p-2"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="font-medium">Fund Your Pool</h1>
            <p className="text-sm text-muted-foreground">Step 2 of 3</p>
          </div>
        </div>
      </div>

      <div className="px-4 py-6 space-y-6">
        {/* Progress */}
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-[#00C853] rounded-full"></div>
          <div className="flex-1 h-1 bg-muted rounded-full">
            <div className="w-2/3 h-full bg-[#00C853] rounded-full"></div>
          </div>
        </div>

        {/* Balance Status */}
        <Card className={`p-6 ${hasSufficientFunds ? 'bg-[#00C853]/5 border-[#00C853]/20' : 'bg-[#FF9500]/5 border-[#FF9500]/20'}`}>
          <div className="flex items-start gap-3">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
              hasSufficientFunds ? 'bg-[#00C853]/10' : 'bg-[#FF9500]/10'
            }`}>
              {hasSufficientFunds ? (
                <CheckCircle className="w-5 h-5 text-[#00C853]" />
              ) : (
                <AlertCircle className="w-5 h-5 text-[#FF9500]" />
              )}
            </div>
            <div className="flex-1">
              <h3 className={hasSufficientFunds ? 'text-[#00C853]' : 'text-[#FF9500]'}>
                {hasSufficientFunds ? 'Sufficient Funds Available' : 'Additional Funds Required'}
              </h3>
              <div className="mt-2 space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Available Balance:</span>
                  <span className="font-medium">R$ {availableBalance.toLocaleString('pt-BR')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Required Amount:</span>
                  <span className="font-medium">R$ {requiredAmount.toLocaleString('pt-BR')}</span>
                </div>
                {!hasSufficientFunds && (
                  <div className="flex justify-between border-t border-border pt-1">
                    <span className="text-muted-foreground">Amount Needed:</span>
                    <span className="font-medium text-[#FF9500]">R$ {shortfall.toLocaleString('pt-BR')}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </Card>

        {/* Deposit Section */}
        {!hasSufficientFunds && (
          <Card className="p-6 space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#007AFF]/10 rounded-full flex items-center justify-center">
                <Plus className="w-5 h-5 text-[#007AFF]" />
              </div>
              <div>
                <h3>Deposit Funds</h3>
                <p className="text-sm text-muted-foreground">
                  Add money to fund your investment pool
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="depositAmount">Deposit Amount</Label>
                <div className="relative mt-1">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="depositAmount"
                    type="number"
                    value={depositAmount}
                    onChange={(e) => setDepositAmount(e.target.value)}
                    placeholder={shortfall.toString()}
                    className="pl-10"
                    min="1"
                    step="100"
                  />
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  Minimum required: R$ {shortfall.toLocaleString('pt-BR')}
                </p>
              </div>

              {/* Payment Methods */}
              <div className="space-y-3">
                <Label>Payment Method</Label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setSelectedMethod('bank')}
                    className={`p-4 rounded-lg border-2 transition-colors ${
                      selectedMethod === 'bank'
                        ? 'border-[#007AFF] bg-[#007AFF]/5'
                        : 'border-border bg-background'
                    }`}
                  >
                    <Building2 className="w-6 h-6 mx-auto mb-2 text-[#007AFF]" />
                    <div className="text-sm font-medium">Bank Transfer</div>
                    <div className="text-xs text-muted-foreground">Instant • Free</div>
                  </button>
                  <button
                    onClick={() => setSelectedMethod('card')}
                    className={`p-4 rounded-lg border-2 transition-colors ${
                      selectedMethod === 'card'
                        ? 'border-[#007AFF] bg-[#007AFF]/5'
                        : 'border-border bg-background'
                    }`}
                  >
                    <CreditCard className="w-6 h-6 mx-auto mb-2 text-[#007AFF]" />
                    <div className="text-sm font-medium">Credit/Debit Card</div>
                    <div className="text-xs text-muted-foreground">Instant • 2.99% fee</div>
                  </button>
                </div>
              </div>

              <Button 
                onClick={handleDeposit}
                disabled={isDepositing || !depositAmount || parseFloat(depositAmount) < shortfall}
                className="w-full bg-[#007AFF] hover:bg-[#0056CC]"
              >
                {isDepositing ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Processing Deposit...
                  </div>
                ) : (
                  `Deposit R$ ${depositAmount ? parseFloat(depositAmount).toLocaleString('pt-BR') : '0'}`
                )}
              </Button>
            </div>
          </Card>
        )}

        {/* Current Balance */}
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <Wallet className="w-5 h-5 text-muted-foreground" />
            <div className="flex-1">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Current Balance</span>
                <span className="font-medium">R$ {availableBalance.toLocaleString('pt-BR')}</span>
              </div>
              <div className="w-full h-2 bg-muted rounded-full mt-2 overflow-hidden">
                <motion.div 
                  className="h-full bg-[#00C853] rounded-full"
                  initial={{ width: 0 }}
                  animate={{ 
                    width: `${Math.min((availableBalance / requiredAmount) * 100, 100)}%` 
                  }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                />
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Continue Button */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-background border-t border-border safe-area-pb">
        <Button 
          onClick={hasSufficientFunds ? handleSkipToDistribution : handleContinue}
          className="w-full bg-[#00C853] hover:bg-[#00A844]"
          disabled={!hasSufficientFunds}
        >
          {hasSufficientFunds ? 'Continue to Distribution' : 'Deposit Funds First'}
        </Button>
      </div>
    </div>
  );
};