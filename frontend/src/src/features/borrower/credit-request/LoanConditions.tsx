import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Calculator, TrendingUp, Clock, DollarSign } from 'lucide-react';
import { Card } from '../../../../components/ui/card';
import { Button } from '../../../../components/ui/button';
import { Slider } from '../../../../components/ui/slider';
import { CreditRequestData } from './CreditRequestFlow';

interface LoanConditionsProps {
  data: CreditRequestData;
  availableCredit: number;
  onUpdate: (data: Partial<CreditRequestData>) => void;
  onNext: () => void;
}

export const LoanConditions: React.FC<LoanConditionsProps> = ({
  data,
  availableCredit,
  onUpdate,
  onNext
}) => {
  const [amount, setAmount] = useState(data.amount || 5000);
  const [installments, setInstallments] = useState(data.installments || 12);

  // Calculate loan conditions
  const calculateLoanConditions = (loanAmount: number, loanInstallments: number) => {
    // Base interest rate calculation (simplified)
    let baseRate = 18; // 18% per year base rate
    
    // Adjust rate based on installments
    if (loanInstallments <= 6) baseRate = 15;
    else if (loanInstallments <= 12) baseRate = 18;
    else if (loanInstallments <= 18) baseRate = 22;
    else baseRate = 25;

    // Adjust rate based on amount
    if (loanAmount >= 30000) baseRate -= 2;
    else if (loanAmount >= 15000) baseRate -= 1;
    else if (loanAmount >= 5000) baseRate -= 0.5;

    const monthlyRate = baseRate / 100 / 12;
    const monthlyPayment = (loanAmount * monthlyRate * Math.pow(1 + monthlyRate, loanInstallments)) / 
                          (Math.pow(1 + monthlyRate, loanInstallments) - 1);
    const totalAmount = monthlyPayment * loanInstallments;
    const totalInterest = totalAmount - loanAmount;
    const cet = ((totalAmount / loanAmount) ** (12 / loanInstallments) - 1) * 100;

    return {
      interestRate: baseRate,
      monthlyPayment: Math.round(monthlyPayment * 100) / 100,
      totalAmount: Math.round(totalAmount * 100) / 100,
      totalInterest: Math.round(totalInterest * 100) / 100,
      cet: Math.round(cet * 100) / 100
    };
  };

  const loanConditions = calculateLoanConditions(amount, installments);

  useEffect(() => {
    const conditions = calculateLoanConditions(amount, installments);
    onUpdate({
      amount,
      installments,
      interestRate: conditions.interestRate,
      monthlyPayment: conditions.monthlyPayment,
      totalAmount: conditions.totalAmount
    });
  }, [amount, installments]);

  const installmentOptions = [3, 6, 12, 18, 24];

  const handleNext = () => {
    if (amount >= 500) {
      onNext();
    }
  };

  return (
    <div className="p-6 space-y-6">
      <Card className="backdrop-blur-md bg-white/10 border-white/20 p-6">
        <div className="flex items-center gap-3 mb-6">
          <Calculator className="w-6 h-6 text-blue-400" />
          <h2 className="text-xl font-bold text-white">Defina as Condições</h2>
        </div>

        {/* Amount Input */}
        <div className="space-y-4 mb-6">
          <div className="flex justify-between items-center">
            <label className="text-white font-semibold">Valor desejado</label>
            <span className="text-xs text-gray-400">Você pode colar o valor aqui</span>
          </div>
          
          <div className="space-y-2">
            <div className="relative">
              <input
                type="text"
                value={(() => {
                  if (amount === 0) return '';
                  const formatted = amount.toLocaleString('pt-BR', {
                    style: 'currency',
                    currency: 'BRL',
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                  });
                  return formatted;
                })()}
                onChange={(e) => {
                  const value = e.target.value;
                  
                  // Extract only numbers from input (handles paste with currency symbols)
                  const numbersOnly = value.replace(/\D/g, '');
                  
                  if (numbersOnly === '') {
                    setAmount(0);
                    return;
                  }
                  
                  // Convert to number - handle both paste scenarios
                  let finalValue = 0;
                  
                  // If pasted value has more than 2 digits, treat as whole number
                  if (numbersOnly.length > 2) {
                    // Check if it looks like cents (ends with exactly 2 digits after decimal)
                    const possibleCents = parseInt(numbersOnly, 10);
                    if (possibleCents < 100 && value.includes(',')) {
                      // Small number with comma - treat as decimal
                      finalValue = possibleCents;
                    } else {
                      // Large number - treat last 2 digits as cents
                      const cents = parseInt(numbersOnly.slice(-2), 10);
                      const reais = parseInt(numbersOnly.slice(0, -2) || '0', 10);
                      finalValue = reais + (cents / 100);
                    }
                  } else {
                    // Small number - treat as cents
                    finalValue = parseInt(numbersOnly, 10) / 100;
                  }
                  
                  setAmount(finalValue);
                }}
                onPaste={(e) => {
                  // Handle paste event for better UX
                  const pastedText = e.clipboardData.getData('text');
                  const numbersOnly = pastedText.replace(/\D/g, '');
                  
                  if (numbersOnly) {
                    e.preventDefault();
                    
                    // If paste contains large number, treat as whole reais
                    if (numbersOnly.length >= 3) {
                      const value = parseInt(numbersOnly, 10);
                      // If the pasted value seems to be in cents format (like 150000 for 1500.00)
                      if (value > 10000) {
                        setAmount(value / 100);
                      } else {
                        setAmount(value);
                      }
                    } else {
                      setAmount(parseInt(numbersOnly, 10));
                    }
                  }
                }}
                placeholder="R$ 0,00"
                className={`w-full bg-gray-800/50 border-2 text-white placeholder-gray-400 focus:ring-2 focus:ring-green-500/20 rounded-2xl px-4 py-4 text-lg font-semibold text-center transition-all ${
                  amount < 500 && amount > 0 
                    ? 'border-red-500 focus:border-red-500' 
                    : amount >= 500 
                      ? 'border-green-500 focus:border-green-500' 
                      : 'border-gray-600 focus:border-green-500'
                }`}
              />
            </div>
            <div className="flex justify-center text-sm px-2">
              <span className="text-gray-400">Valor mínimo: R$ 500</span>
            </div>
            {amount > 0 && amount < 500 && (
              <p className="text-red-400 text-sm text-center animate-pulse">
                ⚠️ Valor mínimo é R$ 500
              </p>
            )}
          </div>
        </div>

        {/* Installments Selection */}
        <div className="space-y-4 mb-6">
          <div className="flex justify-between items-center">
            <label className="text-white font-semibold">Número de parcelas</label>
            <span className="text-xs text-gray-400">Escolha de 3 a 24 meses</span>
          </div>
          <div className="grid grid-cols-5 gap-2">
            {installmentOptions.map((option) => (
              <button
                key={option}
                onClick={() => setInstallments(option)}
                className={`p-3 rounded-xl border transition-all transform hover:scale-105 ${
                  installments === option
                    ? 'bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-500/25'
                    : 'bg-gray-800/50 border-gray-600 text-gray-300 hover:border-blue-500 hover:bg-gray-700/50'
                }`}
              >
                <div className="font-semibold">{option}x</div>
              </button>
            ))}
          </div>
        </div>

        {/* Loan Summary - Only show when amount is valid */}
        {amount >= 500 && (
          <div className="grid grid-cols-2 gap-4 mb-6 animate-in">
            <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <DollarSign className="w-5 h-5 text-green-400" />
                <span className="text-green-400 font-semibold">Parcela</span>
              </div>
              <p className="text-white text-lg font-bold">
                R$ {loanConditions.monthlyPayment.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
              <p className="text-gray-400 text-sm">{installments} parcelas</p>
            </div>

            <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-5 h-5 text-blue-400" />
                <span className="text-blue-400 font-semibold">Taxa</span>
              </div>
              <p className="text-white text-lg font-bold">
                {loanConditions.interestRate.toFixed(1)}% a.a.
              </p>
              <p className="text-gray-400 text-sm">CET: {loanConditions.cet.toFixed(1)}%</p>
            </div>

            <div className="bg-purple-500/10 border border-purple-500/20 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="w-5 h-5 text-purple-400" />
                <span className="text-purple-400 font-semibold">A pagar</span>
              </div>
              <p className="text-white text-lg font-bold">
                R$ {loanConditions.totalAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
              <p className="text-gray-400 text-sm">
                Juros: R$ {loanConditions.totalInterest.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
            </div>

            <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <Calculator className="w-5 h-5 text-yellow-400" />
                <span className="text-yellow-400 font-semibold">Economia</span>
              </div>
              <p className="text-white text-lg font-bold">
                {((30 - loanConditions.interestRate) / 30 * 100).toFixed(0)}%
              </p>
              <p className="text-gray-400 text-sm">vs. cartão de crédito</p>
            </div>
          </div>
        )}

        {/* Additional Info */}
        <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 mb-6">
          <h3 className="text-blue-400 font-semibold mb-2">ℹ️ Informações importantes</h3>
          <ul className="text-gray-300 text-sm space-y-1">
            <li>• Taxa calculada com base no seu score e histórico</li>
            <li>• Valor será creditado imediatamente na sua conta</li>
            <li>• Primeira parcela vence em 30 dias</li>
            <li>• Sem taxas de abertura ou manutenção</li>
          </ul>
        </div>

        {/* Continue Button with improved states */}
        <div className="space-y-3">
          {/* Progress indicator */}
          {amount >= 500 && (
            <div className="flex items-center justify-center gap-2 text-green-400 text-sm animate-in">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              Pronto para continuar
            </div>
          )}
          
          <Button
            onClick={handleNext}
            disabled={amount < 500}
            className={`w-full py-3 transition-all transform ${
              amount >= 500
                ? 'bg-green-600 hover:bg-green-700 hover:scale-105 shadow-lg shadow-green-500/25'
                : 'bg-gray-600 cursor-not-allowed opacity-50'
            }`}
          >
            {amount < 500 && amount > 0 
              ? 'Valor muito baixo' 
              : 'Continuar com a Solicitação'}
          </Button>
        </div>
      </Card>
    </div>
  );
};