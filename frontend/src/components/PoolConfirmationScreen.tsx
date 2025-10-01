import React, { useState } from 'react';
import { motion } from 'motion/react';
import { useApp } from './AppProvider';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { toast } from 'sonner@2.0.3';
import { 
  ArrowLeft, 
  CheckCircle,
  Target,
  TrendingUp,
  Users,
  DollarSign,
  PieChart,
  Calendar,
  Shield,
  Zap,
  Info,
  AlertTriangle
} from 'lucide-react';

export const PoolConfirmationScreen: React.FC = () => {
  const { 
    setCurrentScreen, 
    poolCreation, 
    riskCategories,
    createPool
  } = useApp();

  const [isCreating, setIsCreating] = useState(false);
  const [agreed, setAgreed] = useState(false);

  const handleCreatePool = async () => {
    if (!agreed) {
      toast.error('Please accept the terms and conditions');
      return;
    }

    setIsCreating(true);
    
    // Simulate pool creation
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    createPool();
    toast.success('Investment pool created successfully!');
    
    setIsCreating(false);
  };

  const getCategoryByName = (name: string) => {
    return riskCategories.find(cat => cat.name === name);
  };

  const totalAllocated = poolCreation.distributions.reduce((sum, dist) => sum + dist.percentage, 0);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background border-b border-border px-4 py-3">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setCurrentScreen('pool-distribution')}
            className="p-2"
            disabled={isCreating}
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="font-medium">Review & Confirm</h1>
            <p className="text-sm text-muted-foreground">Final step</p>
          </div>
        </div>
      </div>

      <div className="px-4 py-6 space-y-6">
        {/* Pool Summary */}
        <Card className="p-6 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#00C853]/10 rounded-full flex items-center justify-center">
              <Target className="w-5 h-5 text-[#00C853]" />
            </div>
            <div>
              <h3>Pool Summary</h3>
              <p className="text-sm text-muted-foreground">
                Review your investment pool configuration
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-2 mb-1">
                  <DollarSign className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Total Investment</span>
                </div>
                <div className="text-lg font-semibold">
                  R$ {poolCreation.totalAmount.toLocaleString('pt-BR')}
                </div>
              </div>

              <div className="p-4 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-2 mb-1">
                  <TrendingUp className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Expected Return</span>
                </div>
                <div className="text-lg font-semibold text-[#00C853]">
                  {poolCreation.expectedReturn.toFixed(2)}% p.a.
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Pool Name</span>
                <span className="font-medium">{poolCreation.name}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Diversification</span>
                <Badge variant="outline" className="capitalize">
                  {poolCreation.diversificationLevel}
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Auto-invest</span>
                <Badge variant={poolCreation.autoInvest ? "default" : "secondary"}>
                  {poolCreation.autoInvest ? 'Enabled' : 'Disabled'}
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Risk Categories</span>
                <span className="font-medium">{poolCreation.distributions.length} selected</span>
              </div>
            </div>
          </div>
        </Card>

        {/* Risk Distribution */}
        <Card className="p-6 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#007AFF]/10 rounded-full flex items-center justify-center">
              <PieChart className="w-5 h-5 text-[#007AFF]" />
            </div>
            <div>
              <h3>Risk Distribution</h3>
              <p className="text-sm text-muted-foreground">
                How your investment will be allocated
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {poolCreation.distributions.map((dist) => {
              const category = getCategoryByName(dist.riskCategory);
              const amount = (poolCreation.totalAmount * dist.percentage) / 100;
              
              return (
                <div key={dist.riskCategory} className="p-4 border border-border rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: category?.color }}
                      />
                      <div>
                        <div className="font-medium">{category?.label}</div>
                        <div className="text-sm text-muted-foreground">
                          Score {category?.minScore}-{category?.maxScore}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">
                        R$ {amount.toLocaleString('pt-BR')}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {dist.percentage}%
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Interest Rate:</span>
                      <span className="font-medium">{dist.interestRate}% p.a.</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Max Loan:</span>
                      <span className="font-medium">R$ {dist.maxLoanAmount.toLocaleString('pt-BR')}</span>
                    </div>
                  </div>

                  {/* Progress bar for this category */}
                  <div className="mt-3">
                    <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                      <motion.div 
                        className="h-full rounded-full"
                        style={{ backgroundColor: category?.color }}
                        initial={{ width: 0 }}
                        animate={{ width: `${dist.percentage}%` }}
                        transition={{ duration: 0.5, ease: "easeOut" }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Expected Performance */}
        <Card className="p-6 bg-[#00C853]/5 border-[#00C853]/20">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-[#00C853]/10 rounded-full flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-[#00C853]" />
            </div>
            <div>
              <h3 className="text-[#00C853]">Expected Performance</h3>
              <p className="text-sm text-muted-foreground">
                Projected returns based on your allocation
              </p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-lg font-semibold text-[#00C853]">
                R$ {(poolCreation.totalAmount * poolCreation.expectedReturn / 100 / 12).toLocaleString('pt-BR')}
              </div>
              <div className="text-sm text-muted-foreground">Monthly Est.</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-semibold text-[#00C853]">
                R$ {(poolCreation.totalAmount * poolCreation.expectedReturn / 100).toLocaleString('pt-BR')}
              </div>
              <div className="text-sm text-muted-foreground">Annual Est.</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-semibold text-[#00C853]">
                {poolCreation.expectedReturn.toFixed(2)}%
              </div>
              <div className="text-sm text-muted-foreground">APY</div>
            </div>
          </div>
        </Card>

        {/* Important Information */}
        <Card className="p-4 bg-[#FF9500]/5 border-[#FF9500]/20">
          <div className="flex gap-3">
            <AlertTriangle className="w-5 h-5 text-[#FF9500] mt-0.5 flex-shrink-0" />
            <div className="space-y-2">
              <h4 className="font-medium text-[#FF9500]">Important Information</h4>
              <div className="text-sm text-muted-foreground space-y-1">
                <p>• Returns are estimates based on interest rates and are not guaranteed</p>
                <p>• Investment pools carry risk of borrower default</p>
                <p>• Your capital is at risk and you may receive back less than invested</p>
                <p>• Pool settings can be modified after creation</p>
                <p>• Funds will be automatically invested based on your criteria</p>
              </div>
            </div>
          </div>
        </Card>

        {/* Terms and Conditions */}
        <Card className="p-4">
          <div className="flex items-start gap-3">
            <button
              onClick={() => setAgreed(!agreed)}
              className={`mt-1 w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                agreed 
                  ? 'bg-[#00C853] border-[#00C853]' 
                  : 'border-border hover:border-[#00C853]'
              }`}
            >
              {agreed && <CheckCircle className="w-3 h-3 text-white" />}
            </button>
            <div className="flex-1 text-sm">
              <p className="text-muted-foreground">
                I understand the risks involved and agree to the{' '}
                <span className="text-[#007AFF] underline cursor-pointer">Terms of Service</span> and{' '}
                <span className="text-[#007AFF] underline cursor-pointer">Investment Agreement</span>.
                I confirm that this investment amount does not exceed my risk tolerance.
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Create Button */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-background border-t border-border safe-area-pb">
        <Button 
          onClick={handleCreatePool}
          className="w-full bg-[#00C853] hover:bg-[#00A844]"
          disabled={isCreating || !agreed}
        >
          {isCreating ? (
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              Creating Your Pool...
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5" />
              Create Investment Pool
            </div>
          )}
        </Button>
      </div>
    </div>
  );
};