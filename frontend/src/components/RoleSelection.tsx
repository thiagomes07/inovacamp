import React, { useState } from 'react';
import { motion } from 'motion/react';
import { useApp, UserRole, BorrowerType } from './AppProvider';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { Label } from './ui/label';

export const RoleSelection: React.FC = () => {
  const { setCurrentScreen } = useApp();
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const [selectedBorrowerType, setSelectedBorrowerType] = useState<BorrowerType | null>(null);

  const handleContinue = () => {
    if (selectedRole) {
      // Store role selection in localStorage for account creation
      localStorage.setItem('selectedRole', selectedRole);
      if (selectedRole === 'borrower' && selectedBorrowerType) {
        localStorage.setItem('selectedBorrowerType', selectedBorrowerType);
      }
      setCurrentScreen('account-creation');
    }
  };

  return (
    <div className="min-h-screen swapin-gradient flex flex-col px-6 py-8 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute top-20 right-10 w-40 h-40 bg-emerald-500/5 rounded-full blur-3xl" />
      <div className="absolute bottom-40 left-10 w-32 h-32 bg-blue-500/5 rounded-full blur-3xl" />
      
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="mb-8 relative z-10"
      >
        <h1 className="text-3xl font-bold mb-4 text-white">Escolha seu Perfil</h1>
        <p className="text-white/80 text-lg">
          Selecione como você vai usar o Swapin para ter recursos personalizados
        </p>
      </motion.div>

      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        className="space-y-4 flex-1"
      >
        <RadioGroup
          value={selectedRole || ''}
          onValueChange={(value) => {
            setSelectedRole(value as UserRole);
            if (value !== 'borrower') {
              setSelectedBorrowerType(null);
            }
          }}
        >
          <div className={`swapin-glass p-8 cursor-pointer transition-all duration-300 rounded-3xl ${
            selectedRole === 'borrower' 
              ? 'ring-2 ring-emerald-400 bg-emerald-500/10' 
              : 'hover:bg-white/10'
          }`}>
            <div className="flex items-start space-x-4">
              <RadioGroupItem value="borrower" id="borrower" className="mt-1" />
              <div className="flex-1">
                <Label htmlFor="borrower" className="text-lg font-semibold cursor-pointer block mb-3 text-white">
                  Preciso de acesso ao crédito
                </Label>
                <p className="text-sm text-white/80 mb-4">
                  Acesse crédito justo, solicite empréstimos e gerencie suas necessidades financeiras
                </p>
                
                {selectedRole === 'borrower' && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-3 mt-4 pt-4 border-t border-border"
                  >
                    <p className="text-sm font-medium text-white">Tipo de perfil:</p>
                    <RadioGroup
                      value={selectedBorrowerType || ''}
                      onValueChange={(value) => setSelectedBorrowerType(value as BorrowerType)}
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="autonomous" id="autonomous" />
                        <Label htmlFor="autonomous" className="text-sm cursor-pointer text-white/90">
                          Trabalhador autônomo
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="clt" id="clt" />
                        <Label htmlFor="clt" className="text-sm cursor-pointer text-white/90">
                          CLT/Funcionário assalariado
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="company" id="company" />
                        <Label htmlFor="company" className="text-sm cursor-pointer text-white/90">
                          Empresa/Negócio
                        </Label>
                      </div>
                    </RadioGroup>
                  </motion.div>
                )}
              </div>
            </div>
          </div>

          <div className={`swapin-glass p-8 cursor-pointer transition-all duration-300 rounded-3xl ${
            selectedRole === 'lender' 
              ? 'ring-2 ring-emerald-400 bg-emerald-500/10' 
              : 'hover:bg-white/10'
          }`}>
            <div className="flex items-start space-x-4">
              <RadioGroupItem value="lender" id="lender" className="mt-1" />
              <div className="flex-1">
                <Label htmlFor="lender" className="text-lg font-semibold cursor-pointer block mb-3 text-white">
                  Quero investir e emprestar
                </Label>
                <p className="text-sm text-white/80">
                  Crie pools de investimento, aprove empréstimos e ganhe retornos com seu capital
                </p>
                
                <div className="mt-6 pt-4 border-t border-white/20">
                  <div className="grid grid-cols-2 gap-4 text-xs">
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-emerald-400 rounded-full" />
                      <span className="text-white/80">Pools de investimento</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-emerald-400 rounded-full" />
                      <span className="text-white/80">Avaliação de risco</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-emerald-400 rounded-full" />
                      <span className="text-white/80">Retornos automáticos</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-emerald-400 rounded-full" />
                      <span className="text-white/80">Tracking de portfolio</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </RadioGroup>
      </motion.div>

      <motion.div
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4, duration: 0.5 }}
        className="mt-8 relative z-10"
      >
        <Button
          onClick={handleContinue}
          disabled={!selectedRole || (selectedRole === 'borrower' && !selectedBorrowerType)}
          className="w-full py-6 rounded-2xl disabled:opacity-50 disabled:cursor-not-allowed bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white border-0 text-lg font-semibold shadow-lg shadow-emerald-500/25"
        >
          Continuar
        </Button>

        <Button
          variant="ghost"
          onClick={() => setCurrentScreen('welcome')}
          className="w-full mt-4 text-white/70 hover:text-white hover:bg-white/10"
        >
          Voltar
        </Button>
      </motion.div>
    </div>
  );
};