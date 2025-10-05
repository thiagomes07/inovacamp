import { useState, useCallback } from "react";
import { useAuth } from "./useAuth";

export interface LocationData {
  latitude: number;
  longitude: number;
  timestamp: string;
  accuracy?: number;
}

export interface CreditRequest {
  id: string;
  amount: number;
  installments: number;
  interestRate: number;
  totalAmount: number;
  monthlyPayment: number;
  purpose?: string;
  collateral?: {
    type: "vehicle" | "property" | "equipment" | "receivables";
    description: string;
    value: number;
    documents: File[];
  };
  approvalType: "automatic" | "manual" | "both";
  location?: LocationData;
  status: "pending" | "approved" | "rejected" | "analyzing";
  createdAt: string;
  approvedBy?: {
    type: "pool" | "individual";
    name: string;
    id: string;
  };
}

export interface Loan {
  id: string;
  creditRequestId: string;
  amount: number;
  installments: number;
  interestRate: number;
  monthlyPayment: number;
  paidInstallments: number;
  remainingAmount: number;
  nextPaymentDate: string;
  status: "active" | "completed" | "overdue";
  lender: {
    type: "pool" | "individual";
    name: string;
    id: string;
  };
  createdAt: string;
}

interface UseCreditReturn {
  creditRequests: CreditRequest[];
  activeLoans: Loan[];
  isLoading: boolean;
  requestCredit: (
    request: Omit<CreditRequest, "id" | "status" | "createdAt">
  ) => Promise<CreditRequest | undefined>;
  payInstallment: (loanId: string, amount: number) => Promise<void>;
  getCreditLimit: () => number;
  getAvailableCredit: () => number;
}

export const useCredit = (): UseCreditReturn => {
  const { user } = useAuth();
  const [creditRequests, setCreditRequests] = useState<CreditRequest[]>([
    {
      id: "1",
      amount: 5000,
      installments: 12,
      interestRate: 18.5,
      totalAmount: 5925,
      monthlyPayment: 493.75,
      approvalType: "automatic",
      status: "approved",
      createdAt: "2024-10-01T10:00:00Z",
      approvedBy: {
        type: "pool",
        name: "Pool Diversificação Brasil",
        id: "pool-1",
      },
    },
  ]);

  const [activeLoans, setActiveLoans] = useState<Loan[]>([
    {
      id: "1",
      creditRequestId: "1",
      amount: 5000,
      installments: 12,
      interestRate: 18.5,
      monthlyPayment: 493.75,
      paidInstallments: 1,
      remainingAmount: 4506.25,
      nextPaymentDate: "2024-11-01",
      status: "active",
      lender: {
        type: "pool",
        name: "Pool Diversificação Brasil",
        id: "pool-1",
      },
      createdAt: "2024-10-01T10:00:00Z",
    },
  ]);

  const [isLoading, setIsLoading] = useState(false);

  const requestCredit = useCallback(
    async (request: Omit<CreditRequest, "id" | "status" | "createdAt">) => {
      setIsLoading(true);

      try {
        if (!user?.id) {
          throw new Error("Usuário não autenticado");
        }

        if (!request.location) {
          throw new Error("Dados de localização são obrigatórios");
        }

        // Mapear collateral para formato do backend
        const collateralDocs =
          request.collateral?.documents.map((file) => file.name) || [];

        const payload = {
          user_id: user.id,
          amount_requested: request.amount,
          duration_months: request.installments,
          interest_rate: request.interestRate,
          approval_type: request.approvalType,
          collateral_type: request.collateral?.type.toUpperCase() || "NONE",
          collateral_description: request.collateral?.description,
          collateral_docs: collateralDocs,
          // Location data
          location: {
            latitude: request.location.latitude,
            longitude: request.location.longitude,
            timestamp: request.location.timestamp,
            accuracy: request.location.accuracy,
          },
        };

        console.log("Sending credit request with location:", payload);

        const response = await fetch(
          '${import.meta.env.VITE_API_BASE_URL}/credit/request',
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
          }
        );

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.detail || "Erro ao solicitar crédito");
        }

        const result = await response.json();
        const creditRequestData = result.data;

        const newRequest: CreditRequest = {
          id: creditRequestData.request_id,
          amount: request.amount,
          installments: request.installments,
          interestRate: request.interestRate,
          totalAmount: request.totalAmount,
          monthlyPayment: request.monthlyPayment,
          purpose: request.purpose,
          collateral: request.collateral,
          approvalType: request.approvalType,
          location: request.location,
          status:
            creditRequestData.status === "APPROVED"
              ? "approved"
              : creditRequestData.status === "REJECTED"
              ? "rejected"
              : "analyzing",
          createdAt: creditRequestData.requested_at,
        };

        setCreditRequests((prev) => [newRequest, ...prev]);

        // Se foi aprovado, criar o loan ativo
        if (result.approved) {
          const newLoan: Loan = {
            id: creditRequestData.request_id, // Será o loan_id criado no backend
            creditRequestId: creditRequestData.request_id,
            amount: request.amount,
            installments: request.installments,
            interestRate: request.interestRate,
            monthlyPayment: request.monthlyPayment,
            paidInstallments: 0,
            remainingAmount: request.totalAmount,
            nextPaymentDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
              .toISOString()
              .split("T")[0],
            status: "active",
            lender: {
              type: "pool",
              name: "Pool Automática",
              id: creditRequestData.pool_id || "pool-auto",
            },
            createdAt: new Date().toISOString(),
          };

          setActiveLoans((prev) => [newLoan, ...prev]);

          newRequest.status = "approved";
          newRequest.approvedBy = {
            type: "pool",
            name: "Pool Automática",
            id: creditRequestData.pool_id || "pool-auto",
          };
        }

        return newRequest;
      } finally {
        setIsLoading(false);
      }
    },
    [user]
  );

  const payInstallment = useCallback(async (loanId: string, amount: number) => {
    setIsLoading(true);

    try {
      // TODO: POST /api/credit/pay
      await new Promise((resolve) => setTimeout(resolve, 1500));

      setActiveLoans((prev) =>
        prev.map((loan) => {
          if (loan.id === loanId) {
            const newPaidInstallments = loan.paidInstallments + 1;
            const newRemainingAmount = loan.remainingAmount - amount;
            const isCompleted = newPaidInstallments >= loan.installments;

            return {
              ...loan,
              paidInstallments: newPaidInstallments,
              remainingAmount: Math.max(0, newRemainingAmount),
              status: isCompleted ? ("completed" as const) : loan.status,
              nextPaymentDate: isCompleted
                ? ""
                : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
                    .toISOString()
                    .split("T")[0],
            };
          }
          return loan;
        })
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getCreditLimit = useCallback(() => {
    // Mock credit limit calculation based on score
    const score = user?.score || 400;
    if (score >= 800) return 50000;
    if (score >= 700) return 25000;
    if (score >= 600) return 15000;
    if (score >= 500) return 10000;
    return 5000;
  }, [user?.score]);

  const getAvailableCredit = useCallback(() => {
    const totalLimit = getCreditLimit();
    const usedCredit = activeLoans
      .filter((loan) => loan.status === "active")
      .reduce((sum, loan) => sum + loan.remainingAmount, 0);

    return Math.max(0, totalLimit - usedCredit);
  }, [getCreditLimit, activeLoans]);

  return {
    creditRequests,
    activeLoans,
    isLoading,
    requestCredit,
    payInstallment,
    getCreditLimit,
    getAvailableCredit,
  };
};
