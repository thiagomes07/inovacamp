import React, { useEffect } from 'react';
import { AppProvider, useApp } from './components/AppProvider';
import { SplashScreen } from './components/SplashScreen';
import { WelcomeScreen } from './components/WelcomeScreen';
import { RoleSelection } from './components/RoleSelection';
import { AccountCreation } from './components/AccountCreation';
import { OTPVerification } from './components/OTPVerification';
import { KYCFacial } from './components/KYCFacial';
import { KYCDocuments } from './components/KYCDocuments';
import { OnboardingComplete } from './components/OnboardingComplete';
import { BorrowerHome } from './components/BorrowerHome';
import { LenderHome } from './components/LenderHome';
import { CreditRequestFlow } from './components/CreditRequestFlow';
import { SwapScreen } from './components/SwapScreen';
import { CurrencySwapScreen } from './components/CurrencySwapScreen';
import { PIXScreen } from './components/PIXScreen';
import { PIXSendScreen } from './components/PIXSendScreen';
import { PIXReceiveScreen } from './components/PIXReceiveScreen';
import { QRScannerScreen } from './components/QRScannerScreen';
import { QRFallbackScreen } from './components/QRFallbackScreen';
import { QRConfirmationScreen } from './components/QRConfirmationScreen';
import { CreatePoolScreen } from './components/CreatePoolScreen';
import { PoolFundingScreen } from './components/PoolFundingScreen';
import { PoolDistributionScreen } from './components/PoolDistributionScreen';
import { PoolConfirmationScreen } from './components/PoolConfirmationScreen';
import { DepositMethodScreen } from './components/DepositMethodScreen';
import { MultiCurrencyDepositScreen } from './components/MultiCurrencyDepositScreen';
import { OpenFinanceScreen } from './components/OpenFinanceScreen';
import { BankAuthScreen } from './components/BankAuthScreen';
import { AccountSelectionScreen } from './components/AccountSelectionScreen';
import { DepositConfirmationScreen } from './components/DepositConfirmationScreen';
import { DepositProcessingScreen } from './components/DepositProcessingScreen';
import { DepositSuccessScreen } from './components/DepositSuccessScreen';
import { PublicReceiptViewer } from './components/PublicReceiptViewer';
import { PortfolioScreen } from './components/PortfolioScreen';
import { PortfolioDetailScreen } from './components/PortfolioDetailScreen';
import { PortfolioAnalyticsScreen } from './components/PortfolioAnalyticsScreen';
import { LoansManagementScreen } from './components/LoansManagementScreen';
import { TransactionsHistoryScreen } from './components/TransactionsHistoryScreen';

import { ConfigScreen } from './components/ConfigScreen';
import { ProfileEditScreen } from './components/ProfileEditScreen';
import { SecuritySettingsScreen } from './components/SecuritySettingsScreen';
import { BottomNavigation } from './components/BottomNavigation';
import { Toaster } from './components/ui/sonner';

function AppContent() {
  const { currentScreen, user, setCurrentScreen } = useApp();

  // Initialize with mock data for demo purposes
  useEffect(() => {
    // Add some mock data for lenders to see credit requests
    const mockRequests = [
      {
        id: 'req_001',
        borrowerId: 'borrower_001',
        amount: 2500,
        currency: 'BRL',
        duration: 12,
        riskScore: 750,
        status: 'pending' as const,
        documents: ['payslip', 'rg', 'cpf'],
        requestDate: new Date(Date.now() - 86400000).toISOString()
      },
      {
        id: 'req_002',
        borrowerId: 'borrower_002',
        amount: 5000,
        currency: 'BRL',
        duration: 18,
        riskScore: 680,
        status: 'pending' as const,
        documents: ['payslip', 'rg'],
        requestDate: new Date(Date.now() - 172800000).toISOString()
      }
    ];

    // Only add mock data if we don't have any yet
    if (user?.role === 'lender') {
      // This would normally come from the context's addCreditRequest
      // but for demo purposes we'll add it directly
    }
  }, [user]);

  const renderScreen = () => {
    switch (currentScreen) {
      case 'splash':
        return <SplashScreen />;
      case 'welcome':
        return <WelcomeScreen />;
      case 'role-selection':
        return <RoleSelection />;
      case 'account-creation':
        return <AccountCreation />;
      case 'otp-verification':
        return <OTPVerification />;
      case 'kyc-facial':
        return <KYCFacial />;
      case 'kyc-documents':
        return <KYCDocuments />;
      case 'onboarding-complete':
        return <OnboardingComplete />;
      case 'home':
        return user?.role === 'borrower' ? <BorrowerHome /> : <LenderHome />;
      case 'credit-request':
        return <CreditRequestFlow />;
      case 'swap':
        return <SwapScreen />;
      case 'currency-swap':
        return <CurrencySwapScreen />;
      case 'pix':
        return <PIXScreen />;
      case 'pix-send':
        return <PIXSendScreen />;
      case 'pix-receive':
        return <PIXReceiveScreen />;
      case 'qr-scanner':
        return <QRScannerScreen />;
      case 'qr-fallback':
        return <QRFallbackScreen />;
      case 'qr-confirmation':
        return <QRConfirmationScreen />;
      case 'create-pool':
        return <CreatePoolScreen />;
      case 'pool-funding':
        return <PoolFundingScreen />;
      case 'pool-distribution':
        return <PoolDistributionScreen />;
      case 'pool-confirmation':
        return <PoolConfirmationScreen />;
      case 'deposit':
        return <MultiCurrencyDepositScreen />;
      case 'open-finance':
        return <OpenFinanceScreen />;
      case 'bank-auth':
        return <BankAuthScreen />;
      case 'account-selection':
        return <AccountSelectionScreen />;
      case 'deposit-confirmation':
        return <DepositConfirmationScreen />;
      case 'deposit-processing':
        return <DepositProcessingScreen />;
      case 'deposit-success':
        return <DepositSuccessScreen />;
      case 'public-receipt':
        // Extract receipt ID from URL or use a demo one
        const receiptId = 'DEMO-RECEIPT-123';
        return <PublicReceiptViewer receiptId={receiptId} onBack={() => setCurrentScreen('home')} />;
      case 'portfolio':
        return <PortfolioScreen />;
      case 'portfolio-detail':
        return <PortfolioDetailScreen />;
      case 'portfolio-analytics':
        return <PortfolioAnalyticsScreen />;
      case 'loans-management':
        return <LoansManagementScreen />;
      case 'transactions-history':
        return <TransactionsHistoryScreen />;

      case 'config':
        return <ConfigScreen />;
      case 'profile-edit':
        return <ProfileEditScreen />;
      case 'security-settings':
        return <SecuritySettingsScreen />;
      default:
        return <SplashScreen />;
    }
  };

  const showBottomNav = user && ['home', 'swap', 'currency-swap', 'config'].includes(currentScreen);

  return (
    <div className="min-h-screen swapin-gradient dark">
      {renderScreen()}
      {showBottomNav && <BottomNavigation />}
      <Toaster 
        position="top-center"
        richColors
        closeButton
        duration={3000}
      />
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}