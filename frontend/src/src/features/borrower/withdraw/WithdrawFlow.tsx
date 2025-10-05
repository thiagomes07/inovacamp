import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, CreditCard, QrCode } from 'lucide-react';
import { Button } from '../../../../components/ui/button';
import { Card } from '../../../../components/ui/card';
import { PixWithdraw } from './PixWithdraw';
import { BankTransferWithdraw } from './BankTransferWithdraw';

type WithdrawMethod = 'select' | 'pix' | 'bank-transfer';

interface WithdrawFlowProps {
  balance: number;
  onBack: () => void;
  onComplete: () => void;
}

export const WithdrawFlow: React.FC<WithdrawFlowProps> = ({
  balance,
  onBack,
  onComplete
}) => {
  const [currentMethod, setCurrentMethod] = useState<WithdrawMethod>('select');

  const handleBack = () => {
    if (currentMethod === 'select') {
      onBack();
    } else {
      setCurrentMethod('select');
    }
  };

  return (
    <div className="flex-1">
      {/* Header */}
      <div className="p-6 border-b border-gray-700">
        <div className="flex items-center gap-3">
          <Button
            onClick={handleBack}
            variant="outline"
            size="sm"
            className="border-gray-600"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-white">
              {currentMethod === 'select' ? 'Enviar' : 
               currentMethod === 'pix' ? 'Pagar com PIX' : 
               'Transferência Bancária'}
            </h1>
            <p className="text-gray-400 text-sm">
              Disponível: R$ {balance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentMethod}
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -20, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="h-full"
          >
            {currentMethod === 'select' && (
              <div className="p-6 space-y-4">
                <Card className="backdrop-blur-md bg-white/10 border-white/20 p-6">
                  <h2 className="text-lg font-semibold text-white mb-4">
                    Como você quer enviar?
                  </h2>
                  
                  <div className="space-y-3">
                    {/* PIX Option */}
                    <button
                      onClick={() => setCurrentMethod('pix')}
                      className="w-full p-5 rounded-xl border border-gray-600 bg-gray-800/50 hover:border-green-500 hover:bg-green-500/10 transition-all text-left"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center">
                          <QrCode className="w-6 h-6 text-white" />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-white font-semibold mb-1">Pagar com PIX</h3>
                          <p className="text-gray-300 text-sm">
                            QR Code, Copia e Cola ou Chave PIX
                          </p>
                          <div className="flex gap-2 mt-2">
                            <span className="text-xs px-2 py-1 bg-green-500/20 text-green-400 rounded-full">
                              Instantâneo
                            </span>
                            <span className="text-xs px-2 py-1 bg-blue-500/20 text-blue-400 rounded-full">
                              Sem taxa
                            </span>
                          </div>
                        </div>
                      </div>
                    </button>

                    {/* Bank Transfer Option */}
                    <button
                      onClick={() => setCurrentMethod('bank-transfer')}
                      className="w-full p-5 rounded-xl border border-gray-600 bg-gray-800/50 hover:border-blue-500 hover:bg-blue-500/10 transition-all text-left"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center">
                          <CreditCard className="w-6 h-6 text-white" />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-white font-semibold mb-1">Transferência Bancária</h3>
                          <p className="text-gray-300 text-sm">
                            Para sua conta corrente ou poupança
                          </p>
                          <div className="flex gap-2 mt-2">
                            <span className="text-xs px-2 py-1 bg-yellow-500/20 text-yellow-400 rounded-full">
                              1-2 dias úteis
                            </span>
                            <span className="text-xs px-2 py-1 bg-blue-500/20 text-blue-400 rounded-full">
                              Sem taxa
                            </span>
                          </div>
                        </div>
                      </div>
                    </button>
                  </div>

                  <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 mt-6">
                    <h3 className="text-blue-400 font-semibold mb-2">ℹ️ Informações importantes</h3>
                    <ul className="text-gray-300 text-sm space-y-1">
                      <li>• Valor mínimo para envio: R$ 10,00</li>
                      <li>• Envios acima de R$ 500 exigem verificação biométrica</li>
                      <li>• Se seu saldo estiver em stablecoin, faremos a conversão automaticamente</li>
                    </ul>
                  </div>
                </Card>
              </div>
            )}

            {currentMethod === 'pix' && (
              <PixWithdraw
                balance={balance}
                onComplete={onComplete}
              />
            )}

            {currentMethod === 'bank-transfer' && (
              <BankTransferWithdraw
                balance={balance}
                onComplete={onComplete}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </div>
      

    </div>
  );
};