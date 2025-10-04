import React from 'react';
import { motion } from 'motion/react';
import { 
  Home, 
  Send, 
  ArrowDownToLine,
  CreditCard,
  Target
} from 'lucide-react';

interface BottomNavigationProps {
  userType: 'borrower' | 'lender';
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export const BottomNavigation: React.FC<BottomNavigationProps> = ({
  userType,
  activeTab,
  onTabChange
}) => {
  const borrowerTabs = [
    {
      id: 'main',
      label: 'Home',
      icon: Home,
      color: 'text-blue-400'
    },
    {
      id: 'request-credit',
      label: 'Crédito',
      icon: CreditCard,
      color: 'text-purple-400'
    },
    {
      id: 'deposit',
      label: 'Receber',
      icon: ArrowDownToLine,
      color: 'text-yellow-400'
    },
    {
      id: 'withdraw',
      label: 'Enviar',
      icon: Send,
      color: 'text-green-400'
    }
  ];

  const lenderTabs = [
    {
      id: 'main',
      label: 'Home',
      icon: Home,
      color: 'text-blue-400'
    },
    {
      id: 'opportunities',
      label: 'Investir',
      icon: Target,
      color: 'text-purple-400'
    },
    {
      id: 'deposit',
      label: 'Receber',
      icon: ArrowDownToLine,
      color: 'text-yellow-400'
    },
    {
      id: 'withdraw',
      label: 'Enviar',
      icon: Send,
      color: 'text-green-400'
    }
  ];

  const tabs = userType === 'borrower' ? borrowerTabs : lenderTabs;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-gray-900/70 backdrop-blur-md border-t border-gray-700 z-50">
      <div className="flex items-center justify-around px-4 py-3 max-w-lg mx-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className="flex flex-col items-center gap-1 p-2 rounded-xl transition-all duration-200 min-w-[60px]"
            >
              <motion.div
                className={`relative p-2 rounded-xl transition-all duration-200 ${
                  isActive 
                    ? 'bg-white/10 scale-110' 
                    : 'hover:bg-white/5'
                }`}
                whileTap={{ scale: 0.95 }}
              >
                <Icon 
                  className={`w-5 h-5 transition-colors duration-200 ${
                    isActive 
                      ? tab.color 
                      : 'text-gray-400'
                  }`} 
                />
                
                {isActive && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute inset-0 rounded-xl border-2 border-white/20"
                    initial={false}
                    transition={{ 
                      type: "spring", 
                      stiffness: 500, 
                      damping: 30 
                    }}
                  />
                )}
              </motion.div>
              
              <span 
                className={`text-xs font-medium transition-colors duration-200 ${
                  isActive 
                    ? 'text-white' 
                    : 'text-gray-400'
                }`}
              >
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
      
      {/* Safe area for iOS devices */}
      <div className="h-safe-area-inset-bottom bg-gray-900/95" />
    </div>
  );
};