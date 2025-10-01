import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { receiptGenerator, PublicReceipt } from './utils/receiptGenerator';
import { toast } from 'sonner@2.0.3';
import { 
  CheckCircle,
  Download,
  Share,
  Calendar,
  CreditCard,
  Building2,
  Shield,
  ExternalLink,
  QrCode,
  Copy,
  MessageCircle,
  ArrowLeft
} from 'lucide-react';

interface PublicReceiptViewerProps {
  receiptId: string;
  onBack?: () => void;
}

export const PublicReceiptViewer: React.FC<PublicReceiptViewerProps> = ({ 
  receiptId, 
  onBack 
}) => {
  const [receipt, setReceipt] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Simulate fetching receipt data (in production, this would be an API call)
    setTimeout(() => {
      const receiptData = receiptGenerator.getReceipt(receiptId);
      
      if (receiptData) {
        setReceipt(receiptData);
      } else {
        setError('Receipt not found or has expired');
      }
      setIsLoading(false);
    }, 1000);
  }, [receiptId]);

  const handleDownload = () => {
    // Generate PDF or save receipt
    toast.success('Receipt downloaded!');
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: 'Swapin Transaction Receipt',
        text: `Transaction receipt for ${receipt?.transactionId}`,
        url: window.location.href
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Receipt link copied to clipboard!');
    }
  };

  const handleWhatsAppShare = () => {
    const message = `🎉 Swapin Transaction Receipt\n\nView receipt: ${window.location.href}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-12 h-12 border-4 border-[#007AFF] border-t-transparent rounded-full mx-auto mb-4"
          />
          <p className="text-gray-600">Loading receipt...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="p-8 text-center max-w-md">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <ExternalLink className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-xl mb-2">Receipt Not Found</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          {onBack && (
            <Button onClick={onBack} variant="outline">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Go Back
            </Button>
          )}
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b px-4 py-4">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          {onBack && (
            <Button onClick={onBack} variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          )}
          <div className="text-center flex-1">
            <h1 className="text-lg">Transaction Receipt</h1>
            <p className="text-sm text-gray-600">Swapin Financial Services</p>
          </div>
          <div className="w-16" />
        </div>
      </div>

      <div className="max-w-2xl mx-auto p-4 space-y-6">
        {/* Success Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-8"
        >
          <div className="w-20 h-20 bg-[#00C853] rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-12 h-12 text-white" />
          </div>
          <h2 className="text-2xl mb-2">Transaction Successful</h2>
          <p className="text-gray-600">Your deposit has been processed successfully</p>
        </motion.div>

        {/* Amount Card */}
        <Card className="p-6 bg-gradient-to-r from-[#007AFF]/5 to-[#00C853]/5 border-[#007AFF]/20">
          <div className="text-center">
            <h3 className="text-3xl text-[#00C853] mb-2">
              +{receipt.usdcReceived.toFixed(6)} USDC
            </h3>
            <p className="text-gray-600">
              Converted from R$ {receipt.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
            <div className="flex items-center justify-center space-x-2 mt-2 text-sm text-gray-500">
              <span>Exchange Rate: 1 USD = R$ {receipt.exchangeRate}</span>
            </div>
          </div>
        </Card>

        {/* Transaction Details */}
        <Card className="p-6">
          <h4 className="text-lg mb-4">Transaction Details</h4>
          <div className="space-y-4">
            <div className="flex items-center justify-between py-2 border-b border-gray-100">
              <span className="text-gray-600">Transaction ID</span>
              <span className="font-mono text-sm">{receipt.transactionId}</span>
            </div>
            
            <div className="flex items-center justify-between py-2 border-b border-gray-100">
              <span className="text-gray-600">Date & Time</span>
              <span>{new Date(receipt.timestamp).toLocaleString('pt-BR')}</span>
            </div>
            
            <div className="flex items-center justify-between py-2 border-b border-gray-100">
              <span className="text-gray-600">Payment Method</span>
              <div className="flex items-center space-x-2">
                <Building2 className="w-4 h-4 text-purple-600" />
                <span>{receipt.method}</span>
              </div>
            </div>
            
            <div className="flex items-center justify-between py-2 border-b border-gray-100">
              <span className="text-gray-600">Processing Fee</span>
              <span className="text-[#00C853]">Free</span>
            </div>
            
            <div className="flex items-center justify-between py-2 border-b border-gray-100">
              <span className="text-gray-600">Status</span>
              <Badge className="bg-[#00C853] text-white">
                <CheckCircle className="w-3 h-3 mr-1" />
                Completed
              </Badge>
            </div>
          </div>
        </Card>

        {/* Account Information */}
        {receipt.accountInfo && (
          <Card className="p-6">
            <h4 className="text-lg mb-4">Account Information</h4>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <div className="text-2xl">💜</div>
                <div>
                  <h5 className="font-medium">{receipt.accountInfo.bank}</h5>
                  <p className="text-sm text-gray-600">
                    {receipt.accountInfo.type} - {receipt.accountInfo.number}
                  </p>
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* Security Information */}
        <Card className="p-6 bg-blue-50 border-blue-200">
          <div className="flex items-start space-x-3">
            <Shield className="w-6 h-6 text-blue-600 mt-1" />
            <div>
              <h4 className="text-blue-800 mb-2">Security & Compliance</h4>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• Transaction secured with 256-bit SSL encryption</li>
                <li>• Compliant with Open Finance Brasil regulations</li>
                <li>• Monitored 24/7 for fraud protection</li>
                <li>• Data processed in accordance with LGPD</li>
              </ul>
            </div>
          </div>
        </Card>

        {/* Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Button
            onClick={handleDownload}
            variant="outline"
            className="h-12"
          >
            <Download className="w-4 h-4 mr-2" />
            Download PDF
          </Button>
          
          <Button
            onClick={handleShare}
            variant="outline"
            className="h-12"
          >
            <Share className="w-4 h-4 mr-2" />
            Share Receipt
          </Button>
          
          <Button
            onClick={handleWhatsAppShare}
            className="h-12 bg-[#25D366] hover:bg-[#25D366]/90 text-white"
          >
            <MessageCircle className="w-4 h-4 mr-2" />
            Share on WhatsApp
          </Button>
        </div>

        {/* Footer */}
        <div className="text-center py-8 border-t">
          <div className="mb-4">
            <img 
              src="https://via.placeholder.com/120x40/007AFF/white?text=SWAPIN" 
              alt="Swapin Logo" 
              className="mx-auto h-8"
            />
          </div>
          <p className="text-sm text-gray-600 mb-2">
            "Modern by nature, invincible by choice. We are Swapin."
          </p>
          <p className="text-xs text-gray-500">
            For support, contact us at support@swapin.app
          </p>
        </div>
      </div>
    </div>
  );
};