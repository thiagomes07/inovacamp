import React, { useState } from 'react';
import { motion } from 'motion/react';
import { useApp } from './AppProvider';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Separator } from './ui/separator';
import { toast } from 'sonner@2.0.3';
import { 
  ArrowLeft,
  DollarSign,
  Calendar,
  Percent,
  Clock,
  AlertTriangle,
  CheckCircle,
  CreditCard,
  TrendingUp,
  FileText,
  Calculator
} from 'lucide-react';

interface LoanInstallment {
  id: string;
  loanId: string;
  amount: number;
  dueDate: string;
  status: 'pending' | 'paid' | 'overdue';
  principalAmount: number;
  interestAmount: number;
  fees?: number;
}

export const LoansManagementScreen: React.FC = () => {
  const { user, loans, setCurrentScreen } = useApp();
  const [selectedLoan, setSelectedLoan] = useState<string | null>(null);
  const [payingInstallment, setPayingInstallment] = useState<string | null>(null);

  if (!user) return null;

  const userLoans = loans.filter(loan => 
    loan.borrowerId === user.id && ['active', 'overdue', 'completed'].includes(loan.status)
  );

  // Mock installments data - in real app this would come from the backend
  const generateInstallments = (loan: any): LoanInstallment[] => {
    const installments: LoanInstallment[] = [];
    const monthlyAmount = loan.amount / loan.duration;
    const monthlyInterest = (loan.amount * (loan.interestRate / 100)) / loan.duration;
    
    for (let i = 0; i < loan.duration; i++) {
      const dueDate = new Date();
      dueDate.setMonth(dueDate.getMonth() + i + 1);
      
      const status = i < 2 ? 'paid' : 
                   i === 2 && loan.status === 'overdue' ? 'overdue' : 'pending';
      
      installments.push({
        id: `inst_${loan.id}_${i + 1}`,
        loanId: loan.id,
        amount: monthlyAmount + monthlyInterest,
        dueDate: dueDate.toISOString(),
        status,
        principalAmount: monthlyAmount,
        interestAmount: monthlyInterest,
        fees: status === 'overdue' ? 50 : 0
      });
    }
    
    return installments;
  };

  const handlePayInstallment = async (installment: LoanInstallment) => {
    setPayingInstallment(installment.id);
    
    // Simulate payment processing
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    toast.success(`Parcela paga com sucesso!`);
    setPayingInstallment(null);
  };

  const getTotalPaid = (loanId: string) => {
    const installments = generateInstallments(userLoans.find(l => l.id === loanId)!);
    return installments
      .filter(inst => inst.status === 'paid')
      .reduce((sum, inst) => sum + inst.amount, 0);
  };

  const getTotalRemaining = (loanId: string) => {
    const installments = generateInstallments(userLoans.find(l => l.id === loanId)!);
    return installments
      .filter(inst => inst.status !== 'paid')
      .reduce((sum, inst) => sum + inst.amount, 0);
  };

  const getPaymentProgress = (loanId: string) => {
    const loan = userLoans.find(l => l.id === loanId)!;
    const installments = generateInstallments(loan);
    const paidCount = installments.filter(inst => inst.status === 'paid').length;
    return (paidCount / loan.duration) * 100;
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-xl border-b border-border">
        <div className="flex items-center justify-between p-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setCurrentScreen('home')}
            className="flex items-center space-x-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Voltar</span>
          </Button>
          
          <h1 className="text-xl">Meus Empréstimos</h1>
          
          <div className="w-20"></div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-2 gap-4">
          <Card className="p-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-emerald-500/10 rounded-full flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-emerald-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Emprestado</p>
                <p className="text-lg">
                  R$ {userLoans.reduce((sum, loan) => sum + loan.amount, 0).toLocaleString()}
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-500/10 rounded-full flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-blue-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Empréstimos Ativos</p>
                <p className="text-lg">
                  {userLoans.filter(loan => ['active', 'overdue'].includes(loan.status)).length}
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Loans List */}
        {userLoans.length > 0 ? (
          <div className="space-y-4">
            {userLoans.map((loan) => {
              const installments = generateInstallments(loan);
              const overdueInstallments = installments.filter(inst => inst.status === 'overdue');
              const nextInstallment = installments.find(inst => inst.status === 'pending');
              const progress = getPaymentProgress(loan.id);
              const totalPaid = getTotalPaid(loan.id);
              const totalRemaining = getTotalRemaining(loan.id);

              return (
                <Card key={loan.id} className="overflow-hidden">
                  <div className="p-6">
                    {/* Loan Header */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center">
                          <CreditCard className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h3 className="text-lg">Empréstimo #{loan.id.slice(-4)}</h3>
                          <p className="text-sm text-muted-foreground">
                            {loan.duration} parcelas • {loan.interestRate}% ao mês
                          </p>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <p className="text-2xl">R$ {loan.amount.toLocaleString()}</p>
                        <Badge 
                          variant={
                            loan.status === 'overdue' ? 'destructive' : 
                            loan.status === 'active' ? 'default' : 'secondary'
                          }
                          className={loan.status === 'active' ? 'bg-emerald-500 text-white' : ''}
                        >
                          {loan.status === 'overdue' ? 'Em Atraso' : 
                           loan.status === 'active' ? 'Ativo' : 'Finalizado'}
                        </Badge>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="mb-4">
                      <div className="flex justify-between text-sm text-muted-foreground mb-2">
                        <span>Progresso do Pagamento</span>
                        <span>{Math.round(progress)}%</span>
                      </div>
                      <Progress value={progress} className="h-2" />
                    </div>

                    {/* Financial Summary */}
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Valor Pago</p>
                        <p className="text-emerald-500">R$ {totalPaid.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Valor Restante</p>
                        <p className="text-orange-500">R$ {totalRemaining.toLocaleString()}</p>
                      </div>
                    </div>

                    {/* Overdue Alert */}
                    {overdueInstallments.length > 0 && (
                      <div className="bg-destructive/10 border border-destructive/20 rounded-xl p-4 mb-4">
                        <div className="flex items-start space-x-3">
                          <AlertTriangle className="w-5 h-5 text-destructive mt-0.5" />
                          <div className="flex-1">
                            <h4 className="text-destructive">Parcela em Atraso</h4>
                            <p className="text-sm text-muted-foreground">
                              {overdueInstallments.length} parcela(s) em atraso. 
                              Pague agora para evitar juros adicionais.
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Quick Actions */}
                    <div className="flex space-x-3">
                      <Button
                        variant="outline"
                        className="flex-1"
                        onClick={() => setSelectedLoan(selectedLoan === loan.id ? null : loan.id)}
                      >
                        <FileText className="w-4 h-4 mr-2" />
                        {selectedLoan === loan.id ? 'Ocultar' : 'Ver'} Parcelas
                      </Button>
                      
                      {nextInstallment && (
                        <Button
                          className="flex-1 bg-emerald-500 hover:bg-emerald-600"
                          onClick={() => handlePayInstallment(nextInstallment)}
                          disabled={payingInstallment === nextInstallment.id}
                        >
                          {payingInstallment === nextInstallment.id ? (
                            <>
                              <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin mr-2" />
                              Processando...
                            </>
                          ) : (
                            <>
                              <DollarSign className="w-4 h-4 mr-2" />
                              Pagar Próxima
                            </>
                          )}
                        </Button>
                      )}
                    </div>

                    {/* Installments Details */}
                    {selectedLoan === loan.id && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mt-6 space-y-3"
                      >
                        <Separator />
                        <h4 className="flex items-center space-x-2">
                          <Calculator className="w-4 h-4" />
                          <span>Detalhes das Parcelas</span>
                        </h4>
                        
                        <div className="space-y-2 max-h-64 overflow-y-auto">
                          {installments.map((installment, index) => (
                            <div
                              key={installment.id}
                              className={`p-3 rounded-xl border ${
                                installment.status === 'paid' ? 'bg-emerald-50 border-emerald-200' :
                                installment.status === 'overdue' ? 'bg-red-50 border-red-200' :
                                'bg-muted border-border'
                              }`}
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                                    installment.status === 'paid' ? 'bg-emerald-500' :
                                    installment.status === 'overdue' ? 'bg-red-500' :
                                    'bg-muted-foreground'
                                  }`}>
                                    {installment.status === 'paid' ? (
                                      <CheckCircle className="w-4 h-4 text-white" />
                                    ) : (
                                      <span className="text-xs text-white">{index + 1}</span>
                                    )}
                                  </div>
                                  <div>
                                    <p className="text-sm">
                                      Parcela {index + 1}/{loan.duration}
                                    </p>
                                    <p className="text-xs text-muted-foreground flex items-center">
                                      <Calendar className="w-3 h-3 mr-1" />
                                      {new Date(installment.dueDate).toLocaleDateString()}
                                    </p>
                                  </div>
                                </div>
                                
                                <div className="text-right">
                                  <p className={`font-medium ${
                                    installment.status === 'paid' ? 'text-emerald-600' :
                                    installment.status === 'overdue' ? 'text-red-600' :
                                    'text-foreground'
                                  }`}>
                                    R$ {installment.amount.toLocaleString()}
                                  </p>
                                  {installment.fees && installment.fees > 0 && (
                                    <p className="text-xs text-red-500">
                                      +R$ {installment.fees} (multa)
                                    </p>
                                  )}
                                  
                                  {installment.status === 'pending' && (
                                    <Button
                                      size="sm"
                                      className="mt-1 h-6 text-xs bg-emerald-500 hover:bg-emerald-600"
                                      onClick={() => handlePayInstallment(installment)}
                                      disabled={payingInstallment === installment.id}
                                    >
                                      {payingInstallment === installment.id ? (
                                        <div className="w-3 h-3 border border-white/20 border-t-white rounded-full animate-spin" />
                                      ) : (
                                        'Pagar'
                                      )}
                                    </Button>
                                  )}
                                </div>
                              </div>
                              
                              {/* Breakdown */}
                              <div className="mt-2 grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                                <div>Principal: R$ {installment.principalAmount.toLocaleString()}</div>
                                <div>Juros: R$ {installment.interestAmount.toLocaleString()}</div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </div>
                </Card>
              );
            })}
          </div>
        ) : (
          <Card className="p-8 text-center">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <CreditCard className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="mb-2">Nenhum Empréstimo Encontrado</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Você ainda não possui empréstimos ativos ou histórico de empréstimos.
            </p>
            <Button 
              onClick={() => setCurrentScreen('credit-request')}
              className="bg-emerald-500 hover:bg-emerald-600"
            >
              Solicitar Empréstimo
            </Button>
          </Card>
        )}
      </div>
    </div>
  );
};