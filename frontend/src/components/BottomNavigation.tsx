import React from 'react';
import { motion } from 'motion/react';
import { useApp } from './AppProvider';
import { Home, ArrowLeftRight, Settings } from 'lucide-react';

export const BottomNavigation: React.FC = () => {
  const { currentScreen, setCurrentScreen } = useApp();

  const navItems = [
    { id: 'home', icon: Home, label: 'Home' },
    { id: 'swap', icon: ArrowLeftRight, label: 'Trocar' },
    { id: 'config', icon: Settings, label: 'Config' },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 swapin-glass border-t border-white/10 px-6 py-4 safe-area-pb backdrop-blur-xl">
      <div className="flex items-center justify-around max-w-md mx-auto">
        {navItems.map((item) => {
          const isActive = currentScreen === item.id;
          const IconComponent = item.icon;

          return (
            <motion.button
              key={item.id}
              whileTap={{ scale: 0.9 }}
              whileHover={{ scale: 1.05 }}
              onClick={() => setCurrentScreen(item.id)}
              className="flex flex-col items-center py-3 px-4 relative"
            >
              <div className={`p-3 rounded-2xl transition-all duration-300 ${
                isActive 
                  ? 'bg-gradient-to-br from-emerald-400 to-emerald-600 text-white shadow-lg shadow-emerald-500/25' 
                  : 'text-white/70 hover:text-white hover:bg-white/10'
              }`}>
                <IconComponent className="w-6 h-6" />
              </div>
              
              <span className={`text-xs mt-2 font-medium transition-colors duration-300 ${
                isActive ? 'text-emerald-400' : 'text-white/60'
              }`}>
                {item.label}
              </span>

              {isActive && (
                <motion.div
                  layoutId="activeIndicator"
                  className="absolute -bottom-1 w-2 h-2 bg-emerald-400 rounded-full shadow-lg shadow-emerald-400/50"
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
};