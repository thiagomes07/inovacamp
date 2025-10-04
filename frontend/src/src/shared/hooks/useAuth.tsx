import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  profileType: "borrower" | "lender";
  userType?: "individual" | "company" | "employee";
  avatar?: string;
  isVerified: boolean;
  kycStatus: "pending" | "approved" | "rejected";
  score: number;
  scoreLevel: "Bronze" | "Silver" | "Gold" | "Platinum";
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: RegisterData) => Promise<void>;
  logout: () => void;
}

interface RegisterData {
  name: string;
  email: string;
  password: string;
  phone: string;
  profileType: "borrower" | "lender";
  userType?: "individual" | "company" | "employee";
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Check for stored user session
    const storedUser = localStorage.getItem("swapin_user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    console.log("[useAuth] Iniciando login...");

    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const error = await response.json();
        console.error("[useAuth] Erro no login:", error);
        throw new Error(error.detail || "Erro ao fazer login");
      }

      const data = await response.json();
      console.log("[useAuth] Login bem-sucedido:", data);

      // Armazena todos os dados no localStorage
      localStorage.setItem("user", JSON.stringify(data.user));
      localStorage.setItem("tokens", JSON.stringify(data.tokens));

      setUser(data.user);
    } catch (error) {
      console.error("[useAuth] Erro ao fazer login:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData: any) => {
    setIsLoading(true);
    console.log("[useAuth] Iniciando registro...");

    try {
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        const error = await response.json();
        console.error("[useAuth] Erro no registro:", error);
        throw new Error(error.detail || "Erro ao registrar usuário");
      }

      const data = await response.json();
      console.log("[useAuth] Registro bem-sucedido:", data);

      // Armazena todos os dados no localStorage
      localStorage.setItem("user", JSON.stringify(data.user));
      localStorage.setItem("tokens", JSON.stringify(data.tokens));

      setUser(data.user);
    } catch (error) {
      console.error("[useAuth] Erro ao registrar:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    console.log("[useAuth] Realizando logout...");
    setUser(null);
    localStorage.removeItem("swapin_user");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
