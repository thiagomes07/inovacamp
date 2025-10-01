import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Input } from './ui/input';
import { toast } from 'sonner@2.0.3';
import { receiptGenerator, PublicReceipt } from './utils/receiptGenerator';
import { 
  X,
  MessageCircle,
  Mail,
  Twitter,
  Send,
  Copy,
  QrCode,
  ExternalLink,
  Phone,
  Share2,
  CheckCircle,
  Globe
} from 'lucide-react';

interface ShareReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  receiptData: any; // Transaction data
}

export const ShareReceiptModal: React.FC<ShareReceiptModalProps> = ({
  isOpen,
  onClose,
  receiptData
}) => {
  const [publicReceipt, setPublicReceipt] = useState<PublicReceipt | null>(null);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (isOpen && receiptData && !publicReceipt) {
      setIsGenerating(true);
      
      // Simulate generating public receipt (in production, this would be an API call)
      setTimeout(() => {
        const receipt = receiptGenerator.generatePublicReceipt(receiptData);
        setPublicReceipt(receipt);
        setIsGenerating(false);
      }, 1000);
    }
  }, [isOpen, receiptData, publicReceipt]);

  const handleWhatsAppShare = (phone?: string) => {
    if (!publicReceipt) return;
    
    const url = receiptGenerator.generateWhatsAppUrl(publicReceipt, phone);
    window.open(url, '_blank');
    toast.success('Opening WhatsApp...');
  };

  const handleTelegramShare = () => {
    if (!publicReceipt) return;
    
    const url = receiptGenerator.generateTelegramUrl(publicReceipt);
    window.open(url, '_blank');
    toast.success('Opening Telegram...');
  };

  const handleEmailShare = () => {
    if (!publicReceipt) return;
    
    const url = receiptGenerator.generateEmailUrl(publicReceipt);
    window.open(url, '_blank');
    toast.success('Opening email client...');
  };

  const handleTwitterShare = () => {
    if (!publicReceipt) return;
    
    const url = receiptGenerator.generateTwitterUrl(publicReceipt);
    window.open(url, '_blank');
    toast.success('Opening Twitter...');
  };

  const handleCopyLink = async () => {
    if (!publicReceipt) return;
    
    const success = await receiptGenerator.copyToClipboard(publicReceipt);
    if (success) {
      setCopied(true);
      toast.success('Receipt link copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    } else {
      toast.error('Failed to copy to clipboard');
    }
  };

  const handlePhoneSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneNumber.trim()) {
      toast.error('Please enter a phone number');
      return;
    }
    handleWhatsAppShare(phoneNumber);
  };

  const shareOptions = [
    {
      id: 'whatsapp',
      name: 'WhatsApp',
      icon: MessageCircle,
      color: '#25D366',
      action: () => handleWhatsAppShare(),
      description: 'Send to contact'
    },
    {
      id: 'telegram',
      name: 'Telegram',
      icon: Send,
      color: '#0088CC',
      action: handleTelegramShare,
      description: 'Share on Telegram'
    },
    {
      id: 'email',
      name: 'Email',
      icon: Mail,
      color: '#EA4335',
      action: handleEmailShare,
      description: 'Send via email'
    },
    {
      id: 'twitter',
      name: 'Twitter',
      icon: Twitter,
      color: '#1DA1F2',
      action: handleTwitterShare,
      description: 'Tweet receipt'
    }
  ];

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          onClick={onClose}
        />
        
        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-md mx-auto bg-white rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-[#007AFF] to-[#00C853] px-6 py-4 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                  <Share2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg">Share Receipt</h3>
                  <p className="text-white/80 text-sm">Share your transaction receipt</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {isGenerating ? (
              <div className="text-center py-8">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="w-12 h-12 border-4 border-[#007AFF] border-t-transparent rounded-full mx-auto mb-4"
                />
                <p className="text-gray-600">Generating public receipt...</p>
              </div>
            ) : publicReceipt ? (
              <>
                {/* Receipt Summary */}
                <Card className="p-4 bg-gray-50">
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="w-10 h-10 bg-[#00C853] rounded-full flex items-center justify-center">
                      <CheckCircle className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h4 className="font-medium">Transaction Successful</h4>
                      <p className="text-sm text-gray-600">
                        +{publicReceipt.usdcReceived.toFixed(2)} USDC
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Public URL:</span>
                    <div className="flex items-center space-x-2">
                      <Globe className="w-4 h-4 text-blue-500" />
                      <span className="text-blue-500 truncate max-w-32">
                        swapin.app/receipt/...
                      </span>
                    </div>
                  </div>
                </Card>

                {/* WhatsApp with Phone Number */}
                <div>
                  <h4 className="text-sm mb-3">Send to WhatsApp Contact</h4>
                  <form onSubmit={handlePhoneSubmit} className="flex space-x-2">
                    <Input
                      type="tel"
                      placeholder="+55 11 99999-9999"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      className="flex-1"
                    />
                    <Button
                      type="submit"
                      style={{ backgroundColor: '#25D366' }}
                      className="text-white hover:opacity-90"
                    >
                      <MessageCircle className="w-4 h-4" />
                    </Button>
                  </form>
                  <p className="text-xs text-gray-500 mt-1">
                    Enter phone number with country code
                  </p>
                </div>

                {/* Share Options */}
                <div>
                  <h4 className="text-sm mb-3">Share Options</h4>
                  <div className="grid grid-cols-2 gap-3">
                    {shareOptions.map((option) => {
                      const IconComponent = option.icon;
                      return (
                        <motion.button
                          key={option.id}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={option.action}
                          className="p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                        >
                          <div className="flex flex-col items-center space-y-2">
                            <div 
                              className="w-10 h-10 rounded-full flex items-center justify-center"
                              style={{ backgroundColor: `${option.color}20` }}
                            >
                              <IconComponent 
                                className="w-5 h-5" 
                                style={{ color: option.color }}
                              />
                            </div>
                            <div className="text-center">
                              <p className="text-sm font-medium">{option.name}</p>
                              <p className="text-xs text-gray-500">{option.description}</p>
                            </div>
                          </div>
                        </motion.button>
                      );
                    })}
                  </div>
                </div>

                {/* Copy Link */}
                <Button
                  onClick={handleCopyLink}
                  variant="outline"
                  className="w-full h-12"
                >
                  {copied ? (
                    <>
                      <CheckCircle className="w-4 h-4 mr-2 text-[#00C853]" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 mr-2" />
                      Copy Receipt Link
                    </>
                  )}
                </Button>

                {/* QR Code Option */}
                <Card className="p-4 bg-blue-50 border-blue-200">
                  <div className="flex items-center space-x-3">
                    <QrCode className="w-5 h-5 text-blue-600" />
                    <div className="flex-1">
                      <h4 className="text-sm text-blue-800">QR Code Available</h4>
                      <p className="text-xs text-blue-600">
                        QR code generated for easy sharing
                      </p>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => window.open(publicReceipt.qrCode, '_blank')}
                    >
                      <ExternalLink className="w-4 h-4" />
                    </Button>
                  </div>
                </Card>

                {/* Expiry Notice */}
                <div className="text-center">
                  <p className="text-xs text-gray-500">
                    This receipt link expires on{' '}
                    {new Date(publicReceipt.expiresAt).toLocaleDateString('pt-BR')}
                  </p>
                </div>
              </>
            ) : null}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};