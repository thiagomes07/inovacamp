import React, { useState, useEffect } from 'react';
import { SplashScreen } from './src/features/auth/SplashScreen';
import { WelcomeScreen } from './src/features/auth/WelcomeScreen';
import { LoginScreen } from './src/features/auth/LoginScreen';
import { OnboardingFlow } from './src/features/auth/OnboardingFlow';
import { BorrowerDashboard } from './src/features/borrower/BorrowerDashboard';
import { LenderDashboard } from './src/features/lender/LenderDashboard';
import { AuthProvider, useAuth } from './src/shared/hooks/useAuth';
import { WalletProvider } from './src/shared/hooks/useWallet';
import { ToastProvider } from './src/shared/components/ui/Toast';
import { Toaster } from './components/ui/sonner';

type AppState = 'splash' | 'welcome' | 'login' | 'onboarding' | 'dashboard';

const AppContent: React.FC = () => {
  const [appState, setAppState] = useState<AppState>('splash');
  const { user, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading) {
      if (user) {
        setAppState('dashboard');
      } else if (appState === 'splash') {
        // Keep splash state until user interaction
      }
    }
  }, [user, isLoading, appState]);

  // Show loading while checking auth
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-white">Carregando...</p>
        </div>
      </div>
    );
  }

  // Render based on current state
  switch (appState) {
    case 'splash':
      return (
        <SplashScreen 
          onComplete={() => setAppState('welcome')} 
        />
      );

    case 'welcome':
      return (
        <WelcomeScreen
          onGetStarted={() => setAppState('onboarding')}
          onLogin={() => setAppState('login')}
        />
      );

    case 'login':
      return (
        <LoginScreen
          onBack={() => setAppState('welcome')}
          onSuccess={() => setAppState('dashboard')}
          onForgotPassword={() => {
            // TODO: Implement forgot password flow
            console.log('Forgot password flow');
          }}
        />
      );

    case 'onboarding':
      return (
        <OnboardingFlow
          onBack={() => setAppState('welcome')}
          onComplete={() => setAppState('dashboard')}
        />
      );

    case 'dashboard':
      if (!user) {
        setAppState('welcome');
        return null;
      }

      return (
        <WalletProvider>
          {user.profileType === 'borrower' ? (
            <BorrowerDashboard />
          ) : (
            <LenderDashboard />
          )}
        </WalletProvider>
      );

    default:
      return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-white mb-4">Estado inválido</h1>
            <button 
              onClick={() => setAppState('welcome')}
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl transition-colors"
            >
              Voltar ao início
            </button>
          </div>
        </div>
      );
  }
};

const App: React.FC = () => {
  return (
    <ToastProvider>
      <AuthProvider>
        <div className="font-sans antialiased">
          <AppContent />
          <Toaster 
            position="top-center"
            expand={true}
            richColors={true}
            closeButton={true}
          />
        </div>
      </AuthProvider>
    </ToastProvider>
  );
};

export default App;