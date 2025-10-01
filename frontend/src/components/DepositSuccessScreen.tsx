import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { useApp } from './AppProvider';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { ShareReceiptModal } from './ShareReceiptModal';
import { toast } from 'sonner@2.0.3';
import { 
  CheckCircle,
  Share,
  Download,
  ArrowRight,
  Wallet,
  TrendingUp,
  Star,
  Gift
} from 'lucide-react';

export const DepositSuccessScreen: React.FC = () => {
  const { setCurrentScreen, user } = useApp();
  const [showShareModal, setShowShareModal] = useState(false);

  // Transaction details (in a real app, this would come from context)
  const transactionDetails = {
    amount: 1000, // BRL
    usdcReceived: 192.31, // USDC
    exchangeRate: 5.2,
    transactionId: 'TXN_2024_001234',
    timestamp: new Date().toISOString(),
    fee: 0,
    method: 'Open Finance'
  };

  useEffect(() => {
    // Show success toast
    toast.success('Deposit completed successfully!');
  }, []);

  const handleShare = () => {
    setShowShareModal(true);
  };

  const handleDownloadReceipt = () => {
    toast.success('Receipt downloaded!');
  };

  const handleGoHome = () => {
    setCurrentScreen('home');
  };

  const handleStartInvesting = () => {
    setCurrentScreen('create-pool');
    toast.info('Let\'s create your first investment pool!');
  };

  // Prepare receipt data for sharing
  const receiptDataForShare = {
    transactionId: transactionDetails.transactionId,
    amount: transactionDetails.amount,
    currency: 'BRL',
    usdcReceived: transactionDetails.usdcReceived,
    exchangeRate: transactionDetails.exchangeRate,
    method: transactionDetails.method,
    timestamp: transactionDetails.timestamp,
    fee: transactionDetails.fee,
    userInfo: {
      name: user?.name || 'User',
      email: user?.email || 'user@example.com'
    },
    accountInfo: {
      bank: 'Nubank',
      type: 'Conta Corrente',
      number: '****-1234'
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Success Header */}
      <div className="bg-gradient-to-r from-[#00C853] to-[#007AFF] px-6 pt-12 pb-8">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
          className="text-center text-white"
        >
          <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-12 h-12" />
          </div>
          
          <h1 className="text-2xl mb-2">Deposit Successful!</h1>
          <p className="text-white/80 text-sm">
            Your funds are now available in your Swapin wallet
          </p>
        </motion.div>
      </div>

      {/* Transaction Summary */}
      <div className="px-6 mt-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="p-6 border-[#00C853]/20 bg-[#00C853]/5">
            <div className="text-center mb-6">
              <h2 className="text-3xl text-[#00C853] mb-2">
                +{transactionDetails.usdcReceived.toFixed(2)} USDC
              </h2>
              <p className="text-sm text-gray-600">
                Converted from R$ {transactionDetails.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
            </div>

            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Transaction ID:</span>
                <span className="font-mono text-xs">{transactionDetails.transactionId}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-600">Exchange Rate:</span>
                <span>1 USD = R$ {transactionDetails.exchangeRate}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-600">Processing Fee:</span>
                <span className="text-[#00C853]">Free</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-600">Method:</span>
                <span>{transactionDetails.method}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-600">Completed:</span>
                <span>{new Date(transactionDetails.timestamp).toLocaleString('pt-BR')}</span>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>

      {/* Updated Balance */}
      <div className="px-6 mt-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="p-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-[#007AFF] to-[#00C853] rounded-full flex items-center justify-center">
                <Wallet className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <h4 className="font-medium">Updated Wallet Balance</h4>
                <p className="text-2xl text-[#007AFF]">
                  {user?.balances.stablecoin.toFixed(2)} USDC
                </p>
                <p className="text-xs text-gray-600">
                  ≈ R$ {(user?.balances.stablecoin * 5.2).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>

      {/* Actions */}
      <div className="px-6 mt-6 space-y-3">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="grid grid-cols-2 gap-3"
        >
          <Button
            onClick={handleShare}
            variant="outline"
            className="h-12 bg-gradient-to-r from-[#007AFF]/10 to-[#00C853]/10 border-[#007AFF]/30 hover:border-[#007AFF]/50 hover:bg-gradient-to-r hover:from-[#007AFF]/20 hover:to-[#00C853]/20 transition-all duration-200"
          >
            <Share className="w-4 h-4 mr-2 text-[#007AFF]" />
            <span className="bg-gradient-to-r from-[#007AFF] to-[#00C853] bg-clip-text text-transparent">
              Share Receipt
            </span>
          </Button>
          
          <Button
            onClick={handleDownloadReceipt}
            variant="outline"
            className="h-12"
          >
            <Download className="w-4 h-4 mr-2" />
            Receipt
          </Button>
        </motion.div>
      </div>

      {/* Next Steps */}
      <div className="px-6 mt-8">
        <h3 className="text-sm text-gray-600 mb-4">What's next?</h3>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="space-y-3"
        >
          <Card 
            className="p-4 cursor-pointer hover:border-[#007AFF]/50 hover:bg-[#007AFF]/5 transition-all"
            onClick={handleStartInvesting}
          >
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-[#FFD700]/20 rounded-full flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-[#FFD700]" />
              </div>
              <div className="flex-1">
                <h4 className="font-medium">Start Investing</h4>
                <p className="text-sm text-gray-600">Create investment pools and earn returns</p>
              </div>
              <Badge className="bg-[#FFD700] text-black">
                <Star className="w-3 h-3 mr-1" />
                Popular
              </Badge>
              <ArrowRight className="w-5 h-5 text-gray-400" />
            </div>
          </Card>

          <Card className="p-4 cursor-pointer hover:border-[#00C853]/50 hover:bg-[#00C853]/5 transition-all">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-[#00C853]/20 rounded-full flex items-center justify-center">
                <Gift className="w-5 h-5 text-[#00C853]" />
              </div>
              <div className="flex-1">
                <h4 className="font-medium">Invite Friends</h4>
                <p className="text-sm text-gray-600">Earn R$ 25 for each friend who joins</p>
              </div>
              <Badge className="bg-[#00C853] text-white">
                Bonus
              </Badge>
              <ArrowRight className="w-5 h-5 text-gray-400" />
            </div>
          </Card>
        </motion.div>
      </div>

      {/* Main Action */}
      <div className="px-6 mt-8 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          <Button
            onClick={handleGoHome}
            className="w-full h-12 bg-[#007AFF] hover:bg-[#007AFF]/90"
          >
            Back to Home
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </motion.div>
      </div>

      {/* Share Receipt Modal */}
      <ShareReceiptModal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        receiptData={receiptDataForShare}
      />
    </div>
  );
};