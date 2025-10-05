import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';

interface SplashScreenProps {
  onComplete: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onComplete }) => {
  const [logoScale, setLogoScale] = useState(0);

  useEffect(() => {
    // Animate logo entrance
    setTimeout(() => setLogoScale(1), 100);
    
    // Complete splash after 2 seconds
    setTimeout(() => {
      onComplete();
    }, 2000);
  }, [onComplete]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: logoScale, opacity: 1 }}
        transition={{ 
          type: "spring", 
          stiffness: 300, 
          damping: 20,
          duration: 0.8
        }}
        className="text-center"
      >
        {/* Logo */}
        <div className="relative mb-8">
          <div className="w-24 h-24 mx-auto bg-gradient-to-r from-green-500 to-blue-500 rounded-3xl flex items-center justify-center shadow-2xl">
            <span className="text-3xl font-bold text-white">S</span>
          </div>
          
          {/* Animated ring */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1.2, opacity: 0 }}
            transition={{ 
              duration: 1.5, 
              repeat: Infinity, 
              ease: "easeOut" 
            }}
            className="absolute inset-0 w-24 h-24 mx-auto border-2 border-green-500 rounded-3xl"
          />
        </div>

        {/* Brand Name */}
        <motion.h1
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="text-4xl font-bold text-white mb-2"
        >
          Swapin
        </motion.h1>

        {/* Tagline */}
        <motion.p
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.6 }}
          className="text-gray-400 text-lg"
        >
          Modernos por natureza, invencíveis por opção
        </motion.p>

        {/* Loading dots */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 0.3 }}
          className="flex justify-center space-x-2 mt-8"
        >
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              animate={{ 
                y: [0, -10, 0],
                opacity: [0.3, 1, 0.3]
              }}
              transition={{
                duration: 1,
                repeat: Infinity,
                delay: i * 0.2
              }}
              className="w-2 h-2 bg-green-500 rounded-full"
            />
          ))}
        </motion.div>
      </motion.div>
    </div>
  );
};