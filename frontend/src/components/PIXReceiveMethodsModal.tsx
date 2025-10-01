import React from 'react';
import { motion } from 'motion/react';
import { useApp } from './AppProvider';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { 
  X,
  QrCode,
  Hash,
  Link,
  Share,
  Copy,
  Building2
} from 'lucide-react';

interface PIXReceiveMethodsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PIXReceiveMethodsModal: React.FC<PIXReceiveMethodsModalProps> = ({ isOpen, onClose }) => {
  const { setCurrentScreen } = useApp();

  const receiveMethods = [
    {
      id: 'qr-code',
      icon: QrCode,
      title: 'QR Code PIX',
      description: 'Gere um código para receber',
      action: () => {
        setCurrentScreen('pix-receive');
        onClose();
      }
    },
    {
      id: 'pix-key',
      icon: Hash,
      title: 'Compartilhar Chave',
      description: 'Envie sua chave PIX',
      action: () => {
        setCurrentScreen('wallet-receive');
        onClose();
      }
    },
    {
      id: 'payment-link',
      icon: Link,
      title: 'Link de Pagamento',
      description: 'Crie um link personalizado',
      action: () => {
        // TODO: Implement payment link generation
        onClose();
      }
    },
    {
      id: 'bank-details',
      icon: Building2,
      title: 'Dados Bancários',
      description: 'Agência, conta e dados para TED/DOC',
      action: () => {
        setCurrentScreen('wallet-receive');
        onClose();
      }
    }
  ];

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 flex items-end justify-center z-50 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md bg-slate-900/95 backdrop-blur-xl rounded-t-3xl p-6 border border-white/10"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-white text-xl font-bold">Receber Dinheiro</h2>
          <button onClick={onClose} className="text-white/60 hover:text-white">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="space-y-3">
          {receiveMethods.map((method) => (
            <motion.button
              key={method.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={method.action}
              className="w-full p-4 bg-white/5 hover:bg-white/10 rounded-2xl border border-white/10 transition-all"
            >
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center">
                  <method.icon className="w-6 h-6 text-blue-400" />
                </div>
                <div className="text-left flex-1">
                  <h3 className="text-white font-medium">{method.title}</h3>
                  <p className="text-white/60 text-sm">{method.description}</p>
                </div>
              </div>
            </motion.button>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
};