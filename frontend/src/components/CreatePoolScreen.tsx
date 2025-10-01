import React, { useState } from 'react';
import { motion } from 'motion/react';
import { useApp } from './AppProvider';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Switch } from './ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { toast } from 'sonner@2.0.3';
import { 
  ArrowLeft, 
  DollarSign, 
  Target,
  Info,
  TrendingUp,
  Shield,
  Users
} from 'lucide-react';

export const CreatePoolScreen: React.FC = () => {
  const { 
    setCurrentScreen, 
    user, 
    poolCreation, 
    updatePoolCreationState 
  } = useApp();

  const [amount, setAmount] = useState(poolCreation.totalAmount.toString());
  const [poolName, setPoolName] = useState(poolCreation.name);
  const [autoInvest, setAutoInvest] = useState(poolCreation.autoInvest);
  const [diversificationLevel, setDiversificationLevel] = useState(poolCreation.diversificationLevel);

  const handleContinue = () => {
    const totalAmount = parseFloat(amount);
    
    if (!poolName.trim()) {
      toast.error('Please enter a pool name');
      return;
    }

    if (!totalAmount || totalAmount <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    if (totalAmount < 1000) {
      toast.error('Minimum pool amount is R$ 1,000');
      return;
    }

    const hasSufficientFunds = (user?.balances.fiat || 0) >= totalAmount;

    updatePoolCreationState({
      step: 'funding',
      totalAmount,
      name: poolName,
      hasSufficientFunds,
      autoInvest,
      diversificationLevel
    });

    if (hasSufficientFunds) {
      setCurrentScreen('pool-distribution');
    } else {
      setCurrentScreen('pool-funding');
    }
  };

  const getDiversificationDescription = (level: string) => {
    switch (level) {
      case 'low':
        return 'Focus on 1-2 risk categories';
      case 'medium':
        return 'Balanced across 2-3 risk categories';
      case 'high':
        return 'Spread across all risk categories';
      default:
        return '';
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
            onClick={() => setCurrentScreen('home')}
            className="p-2"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="font-medium">Create Investment Pool</h1>
            <p className="text-sm text-muted-foreground">Step 1 of 3</p>
          </div>
        </div>
      </div>

      <div className="px-4 py-6 space-y-6">
        {/* Progress */}
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-[#00C853] rounded-full"></div>
          <div className="flex-1 h-1 bg-muted rounded-full">
            <div className="w-1/3 h-full bg-[#00C853] rounded-full"></div>
          </div>
        </div>

        {/* Pool Setup */}
        <Card className="p-6 space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#00C853]/10 rounded-full flex items-center justify-center">
              <Target className="w-5 h-5 text-[#00C853]" />
            </div>
            <div>
              <h3>Pool Configuration</h3>
              <p className="text-sm text-muted-foreground">
                Set up your investment pool parameters
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <Label htmlFor="poolName">Pool Name</Label>
              <Input
                id="poolName"
                value={poolName}
                onChange={(e) => setPoolName(e.target.value)}
                placeholder="e.g., Conservative Growth Pool"
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="amount">Total Investment Amount</Label>
              <div className="relative mt-1">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="amount"
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="10000"
                  className="pl-10"
                  min="1000"
                  step="100"
                />
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                Minimum: R$ 1,000 • Available: R$ {user?.balances.fiat.toLocaleString('pt-BR') || '0'}
              </p>
            </div>

            <div>
              <Label>Diversification Level</Label>
              <Select 
                value={diversificationLevel} 
                onValueChange={(value: 'low' | 'medium' | 'high') => setDiversificationLevel(value)}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">
                    <div className="flex items-center gap-2">
                      <Shield className="w-4 h-4 text-[#FF9500]" />
                      <div>
                        <div>Low Risk, Low Diversification</div>
                        <div className="text-xs text-muted-foreground">Focus on 1-2 risk categories</div>
                      </div>
                    </div>
                  </SelectItem>
                  <SelectItem value="medium">
                    <div className="flex items-center gap-2">
                      <Target className="w-4 h-4 text-[#007AFF]" />
                      <div>
                        <div>Medium Risk, Balanced</div>
                        <div className="text-xs text-muted-foreground">Balanced across 2-3 risk categories</div>
                      </div>
                    </div>
                  </SelectItem>
                  <SelectItem value="high">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-[#00C853]" />
                      <div>
                        <div>High Risk, High Diversification</div>
                        <div className="text-xs text-muted-foreground">Spread across all risk categories</div>
                      </div>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
              <p className="text-sm text-muted-foreground mt-1">
                {getDiversificationDescription(diversificationLevel)}
              </p>
            </div>

            <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-3">
                <Users className="w-5 h-5 text-muted-foreground" />
                <div>
                  <div className="font-medium">Auto-invest</div>
                  <div className="text-sm text-muted-foreground">
                    Automatically allocate funds to matching borrowers
                  </div>
                </div>
              </div>
              <Switch
                checked={autoInvest}
                onCheckedChange={setAutoInvest}
              />
            </div>
          </div>
        </Card>

        {/* Information Card */}
        <Card className="p-4 bg-[#007AFF]/5 border-[#007AFF]/20">
          <div className="flex gap-3">
            <Info className="w-5 h-5 text-[#007AFF] mt-0.5 flex-shrink-0" />
            <div className="space-y-2">
              <h4 className="font-medium text-[#007AFF]">How Investment Pools Work</h4>
              <div className="text-sm text-muted-foreground space-y-1">
                <p>• Pool your money with different risk categories of borrowers</p>
                <p>• Set custom interest rates and loan limits for each category</p>
                <p>• Diversify risk across multiple borrowers automatically</p>
                <p>• Earn returns based on successful loan repayments</p>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Continue Button */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-background border-t border-border safe-area-pb">
        <Button 
          onClick={handleContinue}
          className="w-full bg-[#00C853] hover:bg-[#00A844]"
          disabled={!poolName.trim() || !amount || parseFloat(amount) < 1000}
        >
          Continue to Funding
        </Button>
      </div>
    </div>
  );
};