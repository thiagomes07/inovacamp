import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { useApp } from './AppProvider';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { Slider } from './ui/slider';
import { toast } from 'sonner@2.0.3';
import { 
  ArrowLeft, 
  PieChart,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Target,
  DollarSign,
  Percent,
  Info
} from 'lucide-react';

interface DistributionState {
  [key: string]: {
    percentage: number;
    interestRate: number;
    maxLoanAmount: number;
  };
}

export const PoolDistributionScreen: React.FC = () => {
  const { 
    setCurrentScreen, 
    poolCreation, 
    updatePoolCreationState,
    riskCategories
  } = useApp();

  const [distributions, setDistributions] = useState<DistributionState>(() => {
    const initial: DistributionState = {};
    riskCategories.forEach(category => {
      const existing = poolCreation.distributions.find(d => d.riskCategory === category.name);
      initial[category.name] = {
        percentage: existing?.percentage || 0,
        interestRate: existing?.interestRate || getDefaultInterestRate(category.name),
        maxLoanAmount: existing?.maxLoanAmount || getDefaultMaxLoan(category.name)
      };
    });
    return initial;
  });

  const [totalPercentage, setTotalPercentage] = useState(0);
  const [expectedReturn, setExpectedReturn] = useState(0);

  function getDefaultInterestRate(categoryName: string): number {
    switch (categoryName) {
      case 'excellent': return 8;
      case 'good': return 12;
      case 'poor': return 18;
      case 'terrible': return 25;
      default: return 10;
    }
  }

  function getDefaultMaxLoan(categoryName: string): number {
    const baseAmount = poolCreation.totalAmount;
    switch (categoryName) {
      case 'excellent': return Math.min(baseAmount * 0.3, 50000);
      case 'good': return Math.min(baseAmount * 0.2, 30000);
      case 'poor': return Math.min(baseAmount * 0.15, 20000);
      case 'terrible': return Math.min(baseAmount * 0.1, 10000);
      default: return 10000;
    }
  }

  useEffect(() => {
    const total = Object.values(distributions)
      .reduce((sum, dist) => sum + dist.percentage, 0);
    setTotalPercentage(total);

    // Calculate expected return based on distributions and interest rates
    const weightedReturn = Object.entries(distributions)
      .reduce((sum, [_, dist]) => {
        const weight = dist.percentage / 100;
        return sum + (weight * dist.interestRate);
      }, 0);
    
    setExpectedReturn(weightedReturn);
  }, [distributions]);

  const updateDistribution = (
    categoryName: string, 
    field: 'percentage' | 'interestRate' | 'maxLoanAmount', 
    value: number
  ) => {
    setDistributions(prev => ({
      ...prev,
      [categoryName]: {
        ...prev[categoryName],
        [field]: value
      }
    }));
  };

  const handleAutoDistribute = () => {
    const presets = {
      low: { excellent: 60, good: 40, poor: 0, terrible: 0 },
      medium: { excellent: 40, good: 35, poor: 20, terrible: 5 },
      high: { excellent: 25, good: 30, poor: 30, terrible: 15 }
    };

    const preset = presets[poolCreation.diversificationLevel];
    
    Object.entries(preset).forEach(([category, percentage]) => {
      updateDistribution(category, 'percentage', percentage);
    });

    toast.success(`Auto-distributed for ${poolCreation.diversificationLevel} diversification`);
  };

  const handleContinue = () => {
    if (Math.abs(totalPercentage - 100) > 0.1) {
      toast.error('Total percentage must equal 100%');
      return;
    }

    const distributionArray = Object.entries(distributions)
      .filter(([_, dist]) => dist.percentage > 0)
      .map(([categoryName, dist]) => ({
        riskCategory: categoryName,
        percentage: dist.percentage,
        interestRate: dist.interestRate,
        maxLoanAmount: dist.maxLoanAmount
      }));

    updatePoolCreationState({
      step: 'confirmation',
      distributions: distributionArray,
      expectedReturn
    });

    setCurrentScreen('pool-confirmation');
  };

  const getAmountForCategory = (percentage: number) => {
    return (poolCreation.totalAmount * percentage) / 100;
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background border-b border-border px-4 py-3">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setCurrentScreen(poolCreation.hasSufficientFunds ? 'create-pool' : 'pool-funding')}
            className="p-2"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="font-medium">Pool Distribution</h1>
            <p className="text-sm text-muted-foreground">Step 3 of 3</p>
          </div>
        </div>
      </div>

      <div className="px-4 py-6 space-y-6">
        {/* Progress */}
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-[#00C853] rounded-full"></div>
          <div className="flex-1 h-1 bg-muted rounded-full">
            <div className="w-full h-full bg-[#00C853] rounded-full"></div>
          </div>
        </div>

        {/* Summary */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#007AFF]/10 rounded-full flex items-center justify-center">
                <PieChart className="w-5 h-5 text-[#007AFF]" />
              </div>
              <div>
                <h3>Risk Distribution</h3>
                <p className="text-sm text-muted-foreground">
                  Total Pool: R$ {poolCreation.totalAmount.toLocaleString('pt-BR')}
                </p>
              </div>
            </div>
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleAutoDistribute}
              className="text-[#007AFF]"
            >
              Auto Distribute
            </Button>
          </div>

          {/* Progress Bar */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Allocation Progress</span>
              <span className={`text-sm font-medium ${
                Math.abs(totalPercentage - 100) < 0.1 ? 'text-[#00C853]' : 
                totalPercentage > 100 ? 'text-[#FF3B30]' : 'text-[#FF9500]'
              }`}>
                {totalPercentage.toFixed(1)}%
              </span>
            </div>
            <div className="w-full h-3 bg-muted rounded-full overflow-hidden">
              <motion.div 
                className={`h-full rounded-full transition-colors ${
                  Math.abs(totalPercentage - 100) < 0.1 ? 'bg-[#00C853]' : 
                  totalPercentage > 100 ? 'bg-[#FF3B30]' : 'bg-[#FF9500]'
                }`}
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(totalPercentage, 100)}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
            {Math.abs(totalPercentage - 100) > 0.1 && (
              <p className="text-sm text-muted-foreground">
                {totalPercentage < 100 
                  ? `${(100 - totalPercentage).toFixed(1)}% remaining to allocate`
                  : `${(totalPercentage - 100).toFixed(1)}% over allocation`
                }
              </p>
            )}
          </div>
        </Card>

        {/* Risk Categories */}
        <div className="space-y-4">
          {riskCategories.map((category) => {
            const dist = distributions[category.name];
            const amount = getAmountForCategory(dist.percentage);
            
            return (
              <Card key={category.name} className="p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: category.color }}
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium">{category.label}</h4>
                        <Badge variant="outline" className="text-xs">
                          Score {category.minScore}-{category.maxScore}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {category.description}
                      </p>
                    </div>
                  </div>
                  {dist.percentage > 0 && (
                    <div className="text-right">
                      <div className="font-medium">
                        R$ {amount.toLocaleString('pt-BR')}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {dist.percentage}%
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  {/* Percentage Slider */}
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <Label className="text-sm">Allocation Percentage</Label>
                      <span className="text-sm font-medium">{dist.percentage}%</span>
                    </div>
                    <Slider
                      value={[dist.percentage]}
                      onValueChange={([value]) => updateDistribution(category.name, 'percentage', value)}
                      max={100}
                      step={1}
                      className="w-full"
                    />
                  </div>

                  {dist.percentage > 0 && (
                    <>
                      {/* Interest Rate */}
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label className="text-sm">Interest Rate (%)</Label>
                          <div className="relative mt-1">
                            <Input
                              type="number"
                              value={dist.interestRate}
                              onChange={(e) => updateDistribution(category.name, 'interestRate', parseFloat(e.target.value) || 0)}
                              min="1"
                              max="50"
                              step="0.5"
                              className="pr-8"
                            />
                            <Percent className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                          </div>
                        </div>

                        <div>
                          <Label className="text-sm">Max Loan Amount</Label>
                          <div className="relative mt-1">
                            <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input
                              type="number"
                              value={dist.maxLoanAmount}
                              onChange={(e) => updateDistribution(category.name, 'maxLoanAmount', parseFloat(e.target.value) || 0)}
                              min="1000"
                              step="1000"
                              className="pl-10"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Expected Return */}
                      <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                        <span className="text-sm text-muted-foreground">
                          Expected annual return from this category
                        </span>
                        <span className="font-medium text-[#00C853]">
                          {((dist.percentage / 100) * dist.interestRate).toFixed(2)}%
                        </span>
                      </div>
                    </>
                  )}
                </div>
              </Card>
            );
          })}
        </div>

        {/* Expected Return Summary */}
        <Card className="p-6 bg-[#00C853]/5 border-[#00C853]/20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#00C853]/10 rounded-full flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-[#00C853]" />
            </div>
            <div className="flex-1">
              <h4 className="font-medium text-[#00C853]">Expected Portfolio Return</h4>
              <p className="text-sm text-muted-foreground mt-1">
                Based on your risk distribution and interest rates
              </p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-[#00C853]">
                {expectedReturn.toFixed(2)}%
              </div>
              <div className="text-sm text-muted-foreground">per year</div>
            </div>
          </div>
        </Card>

        {/* Info Card */}
        <Card className="p-4 bg-[#007AFF]/5 border-[#007AFF]/20">
          <div className="flex gap-3">
            <Info className="w-5 h-5 text-[#007AFF] mt-0.5 flex-shrink-0" />
            <div className="space-y-2">
              <h4 className="font-medium text-[#007AFF]">Distribution Tips</h4>
              <div className="text-sm text-muted-foreground space-y-1">
                <p>• Higher risk categories offer better returns but increase default risk</p>
                <p>• Diversification helps balance risk and return potential</p>
                <p>• Auto-invest will automatically fund matching loan requests</p>
                <p>• You can adjust these settings anytime after pool creation</p>
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
          disabled={Math.abs(totalPercentage - 100) > 0.1}
        >
          Continue to Review
        </Button>
      </div>
    </div>
  );
};