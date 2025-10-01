import React, { useState } from 'react';
import { motion } from 'motion/react';
import { useApp } from './AppProvider';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { toast } from 'sonner@2.0.3';
import { 
  ArrowLeft,
  Search,
  Shield,
  CheckCircle,
  Clock,
  Star,
  Users
} from 'lucide-react';

export const OpenFinanceScreen: React.FC = () => {
  const { setCurrentScreen } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBank, setSelectedBank] = useState<string | null>(null);

  const banks = [
    {
      id: 'nubank',
      name: 'Nubank',
      logo: '💜',
      color: '#8A2BE2',
      rating: 4.8,
      users: '70M+',
      status: 'available',
      description: 'Digital bank with instant connection'
    },
    {
      id: 'itau',
      name: 'Itaú',
      logo: '🔶',
      color: '#FF6B00',
      rating: 4.5,
      users: '50M+',
      status: 'available',
      description: 'Traditional bank with Open Finance'
    },
    {
      id: 'bradesco',
      name: 'Bradesco',
      logo: '🔴',
      color: '#CC092F',
      rating: 4.3,
      users: '45M+',
      status: 'available',
      description: 'Secure connection via Open Finance'
    },
    {
      id: 'santander',
      name: 'Santander',
      logo: '🔥',
      color: '#EC0000',
      rating: 4.2,
      users: '30M+',
      status: 'available',
      description: 'Fast and secure transfers'
    },
    {
      id: 'bb',
      name: 'Banco do Brasil',
      logo: '💛',
      color: '#FFD700',
      rating: 4.1,
      users: '40M+',
      status: 'available',
      description: 'Government bank with Open Finance'
    },
    {
      id: 'caixa',
      name: 'Caixa Econômica',
      logo: '🏦',
      color: '#0066CC',
      rating: 4.0,
      users: '35M+',
      status: 'available',
      description: 'Federal savings bank'
    },
    {
      id: 'inter',
      name: 'Inter',
      logo: '🧡',
      color: '#FF7A00',
      rating: 4.6,
      users: '15M+',
      status: 'available',
      description: 'Digital bank with zero fees'
    },
    {
      id: 'c6',
      name: 'C6 Bank',
      logo: '⚫',
      color: '#000000',
      rating: 4.4,
      users: '10M+',
      status: 'available',
      description: 'Modern digital banking'
    }
  ];

  const filteredBanks = banks.filter(bank =>
    bank.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleBankSelect = (bankId: string) => {
    setSelectedBank(bankId);
    const bank = banks.find(b => b.id === bankId);
    
    setTimeout(() => {
      toast.success(`Connecting to ${bank?.name}...`);
      setCurrentScreen('bank-auth');
    }, 500);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-white border-b border-border px-6 py-4">
        <div className="flex items-center justify-between">
          <button
            onClick={() => setCurrentScreen('deposit')}
            className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          
          <div className="text-center">
            <h1 className="text-lg">Open Finance</h1>
            <p className="text-sm text-gray-600">Connect your bank account</p>
          </div>
          
          <div className="w-10" />
        </div>
      </div>

      {/* Security Info */}
      <div className="bg-gradient-to-r from-[#00C853]/10 to-[#007AFF]/10 mx-6 mt-6 p-4 rounded-2xl border border-[#00C853]/20">
        <div className="flex items-start space-x-3">
          <div className="w-10 h-10 bg-[#00C853]/20 rounded-full flex items-center justify-center mt-0.5">
            <Shield className="w-5 h-5 text-[#00C853]" />
          </div>
          <div>
            <h3 className="text-sm mb-1">Secure Connection</h3>
            <p className="text-xs text-gray-600 mb-2">
              Open Finance is regulated by the Central Bank of Brazil (BCB). Your data is encrypted and never stored.
            </p>
            <div className="flex items-center space-x-2 text-xs text-[#00C853]">
              <CheckCircle className="w-3 h-3" />
              <span>BCB Certified</span>
            </div>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="px-6 mt-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <Input
            type="text"
            placeholder="Search for your bank..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 h-12 rounded-xl border-gray-200"
          />
        </div>
      </div>

      {/* Popular Banks */}
      {searchTerm === '' && (
        <div className="px-6 mt-6">
          <h3 className="text-sm text-gray-600 mb-3">Popular Banks</h3>
          <div className="grid grid-cols-4 gap-3">
            {banks.slice(0, 4).map((bank) => (
              <motion.button
                key={bank.id}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleBankSelect(bank.id)}
                className="flex flex-col items-center space-y-2 p-3 rounded-xl bg-white border border-gray-200 hover:border-[#007AFF]/50 hover:bg-[#007AFF]/5 transition-all"
              >
                <div className="text-2xl">{bank.logo}</div>
                <span className="text-xs text-center leading-tight">{bank.name}</span>
              </motion.button>
            ))}
          </div>
        </div>
      )}

      {/* All Banks List */}
      <div className="px-6 mt-6 space-y-3">
        <h3 className="text-sm text-gray-600">
          {searchTerm ? `Results for "${searchTerm}"` : 'All Banks'}
        </h3>
        
        {filteredBanks.map((bank) => {
          const isSelected = selectedBank === bank.id;
          
          return (
            <motion.div
              key={bank.id}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
            >
              <Card 
                className={`p-4 cursor-pointer transition-all duration-200 ${
                  isSelected 
                    ? 'border-[#007AFF] bg-[#007AFF]/5' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => handleBankSelect(bank.id)}
              >
                <div className="flex items-center space-x-4">
                  <div className="text-3xl">{bank.logo}</div>
                  
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <h4 className="font-medium">{bank.name}</h4>
                      <Badge 
                        variant="outline" 
                        className="text-xs px-2 py-0.5 border-[#00C853] text-[#00C853]"
                      >
                        Available
                      </Badge>
                    </div>
                    
                    <p className="text-xs text-gray-600 mb-2">{bank.description}</p>
                    
                    <div className="flex items-center space-x-4 text-xs text-gray-500">
                      <div className="flex items-center space-x-1">
                        <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                        <span>{bank.rating}</span>
                      </div>
                      <span>•</span>
                      <div className="flex items-center space-x-1">
                        <Users className="w-3 h-3" />
                        <span>{bank.users} users</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Clock className="w-4 h-4 text-gray-400" />
                    <span className="text-xs text-gray-500">Instant</span>
                  </div>
                </div>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Info Footer */}
      <div className="px-6 mt-8 mb-8">
        <Card className="p-4 bg-blue-50 border-blue-200">
          <h4 className="text-sm mb-2 text-blue-800">How Open Finance works</h4>
          <ul className="text-xs text-blue-700 space-y-1">
            <li>• You'll be redirected to your bank's official app or website</li>
            <li>• Login with your regular banking credentials</li>
            <li>• Authorize the connection (you can revoke anytime)</li>
            <li>• Transfer money instantly to your Swapin wallet</li>
          </ul>
        </Card>
      </div>
    </div>
  );
};