import React, { createContext, useContext, useState, useEffect } from 'react';

interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  profileType: 'borrower' | 'lender';
  userType?: 'individual' | 'company' | 'employee';
  avatar?: string;
  isVerified: boolean;
  kycStatus: 'pending' | 'approved' | 'rejected';
  score: number;
  scoreLevel: 'Bronze' | 'Silver' | 'Gold' | 'Platinum';
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: RegisterData) => Promise<void>;
  logout: () => void;
  updateUser: (userData: Partial<User>) => void;
  updateUserScore: (newScore: number) => void;
}

interface RegisterData {
  name: string;
  email: string;
  password: string;
  phone: string;
  profileType: 'borrower' | 'lender';
  userType?: 'individual' | 'company' | 'employee';
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for stored user session
    const storedUser = localStorage.getItem('swapin_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    
    // TODO: POST /api/auth/login
    // Mock login
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const mockUser: User = {
      id: '1',
      name: 'João Silva',
      email,
      phone: '(11) 99999-9999',
      profileType: email.includes('lender') ? 'lender' : 'borrower',
      userType: 'individual',
      isVerified: true,
      kycStatus: 'approved',
      score: 750,
      scoreLevel: 'Gold'
    };
    
    setUser(mockUser);
    localStorage.setItem('swapin_user', JSON.stringify(mockUser));
    setIsLoading(false);
  };

  const register = async (userData: RegisterData) => {
    setIsLoading(true);
    
    // TODO: POST /api/auth/register
    // Mock registration
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const newUser: User = {
      id: Math.random().toString(36).substr(2, 9),
      ...userData,
      isVerified: false,
      kycStatus: 'pending',
      score: 400,
      scoreLevel: 'Bronze'
    };
    
    setUser(newUser);
    localStorage.setItem('swapin_user', JSON.stringify(newUser));
    setIsLoading(false);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('swapin_user');
  };

  const updateUser = (userData: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...userData };
      setUser(updatedUser);
      localStorage.setItem('swapin_user', JSON.stringify(updatedUser));
    }
  };

  const updateUserScore = (newScore: number) => {
    if (user) {
      // Calculate score level based on new score
      let scoreLevel: 'Bronze' | 'Silver' | 'Gold' | 'Platinum';
      if (newScore >= 900) scoreLevel = 'Platinum';
      else if (newScore >= 750) scoreLevel = 'Gold';
      else if (newScore >= 600) scoreLevel = 'Silver';
      else scoreLevel = 'Bronze';

      const updatedUser = { 
        ...user, 
        score: newScore,
        scoreLevel 
      };
      setUser(updatedUser);
      localStorage.setItem('swapin_user', JSON.stringify(updatedUser));
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      isLoading,
      login,
      register,
      logout,
      updateUser,
      updateUserScore
    }}>
      {children}
    </AuthContext.Provider>
  );
};