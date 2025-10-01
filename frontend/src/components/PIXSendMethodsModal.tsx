import React from 'react';
import { motion } from 'motion/react';
import { useApp } from './AppProvider';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { 
  X,
  Smartphone,
  CreditCard,
  QrCode,
  Contact,
  Building2,
  Hash,
  Mail,
  Phone
} from 'lucide-react';

interface PIXSendMethodsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PIXSendMethodsModal: React.FC<PIXSendMethodsModalProps> = ({ isOpen, onClose }) => {
  const { setCurrentScreen } = useApp();

  const sendMethods = [
    {
      id: 'pix-key',
      icon: Hash,
      title: 'Chave PIX',
      description: 'CPF, Email, Telefone ou Chave Aleatória',
      action: () => {
        setCurrentScreen('pix-send');
        onClose();
      }
    },
    {
      id: 'qr-code',
      icon: QrCode,
      title: 'QR Code',
      description: 'Escaneie ou cole um código PIX',
      action: () => {
        setCurrentScreen('qr-scanner');
        onClose();
      }
    },
    {
      id: 'contacts',
      icon: Contact,
      title: 'Contatos',
      description: 'Envie para seus contatos salvos',
      action: () => {
        // TODO: Implement contacts screen
        onClose();
      }
    },
    {
      id: 'bank-transfer',
      icon: Building2,
      title: 'Transferência Bancária',
      description: 'TED/DOC para qualquer banco',
      action: () => {
        setCurrentScreen('wallet-send');
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
          <h2 className="text-white text-xl font-bold">Enviar Dinheiro</h2>
          <button onClick={onClose} className="text-white/60 hover:text-white">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="space-y-3">
          {sendMethods.map((method) => (
            <motion.button
              key={method.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={method.action}
              className="w-full p-4 bg-white/5 hover:bg-white/10 rounded-2xl border border-white/10 transition-all"
            >
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-emerald-500/20 rounded-xl flex items-center justify-center">
                  <method.icon className="w-6 h-6 text-emerald-400" />
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