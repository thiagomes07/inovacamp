from sqlalchemy import Column, String, Integer, Boolean, Date, DateTime, JSON, Enum as SQLEnum, DECIMAL, Text
from sqlalchemy.sql import func
from app.database import Base
import enum
import uuid
from datetime import datetime


class DocumentType(str, enum.Enum):
    CPF = "cpf"
    CNPJ = "cnpj"


class ProfileType(str, enum.Enum):
    BORROWER = "BORROWER"
    INVESTOR = "INVESTOR"


class UserType(str, enum.Enum):
    INDIVIDUAL = "individual"
    COMPANY = "company"


class User(Base):
    __tablename__ = "users"

    user_id = Column(String(36), primary_key=True, default=str(uuid.uuid4()))
    email = Column(String(255), nullable=False, unique=True)
    password_hash = Column(String(255), nullable=False)
    full_name = Column(String(255), nullable=False)
    phone = Column(String(20))
    cpf_cnpj = Column(String(14), nullable=False, unique=True)
    document_type = Column(SQLEnum(DocumentType), nullable=False)
    date_of_birth = Column(Date)
    credit_score = Column(Integer, default=0)
    calculated_score = Column(Integer)
    kyc_approved = Column(Boolean, default=False, index=True)
    document_links = Column(JSON)
    financial_docs = Column(JSON)
    profile_type = Column(SQLEnum(ProfileType), default=ProfileType.BORROWER)
    user_type = Column(SQLEnum(UserType), default=UserType.INDIVIDUAL)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def to_dict(self):
        """Converte o objeto User em um dicionário."""
        return {
            "user_id": self.user_id,
            "email": self.email,
            "full_name": self.full_name,
            "phone": self.phone,
            "cpf_cnpj": self.cpf_cnpj,
            "document_type": self.document_type.value,
            "date_of_birth": self.date_of_birth,
            "credit_score": self.credit_score,
            "kyc_approved": self.kyc_approved,
            "document_links": self.document_links,
            "financial_docs": self.financial_docs,
            "profile_type": self.profile_type.value,
            "user_type": self.user_type.value,
            "created_at": self.created_at,
            "updated_at": self.updated_at,
        }


class Investor(Base):
    __tablename__ = "investors"
    
    investor_id = Column(String(36), primary_key=True, index=True)
    email = Column(String(255), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)
    full_name = Column(String(255), nullable=False)
    phone = Column(String(20))
    cpf_cnpj = Column(String(14), unique=True, nullable=False, index=True)
    document_type = Column(SQLEnum(DocumentType), nullable=False)
    date_of_birth = Column(Date)
    kyc_approved = Column(Boolean, default=False, index=True)
    document_links = Column(JSON)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())


class CreditRequestStatus(str, enum.Enum):
    PENDING = "pending"
    APPROVED = "approved"
    REJECTED = "rejected"
    ACTIVE = "active"
    COMPLETED = "completed"


class CollateralType(str, enum.Enum):
    VEHICLE = "vehicle"
    PROPERTY = "property"
    INVESTMENT = "investment"
    NONE = "none"


class CreditRequest(Base):
    __tablename__ = "credit_requests"
    
    request_id = Column(String(36), primary_key=True, index=True)
    user_id = Column(String(36), nullable=False, index=True)
    investor_id = Column(String(36), nullable=True)
    amount_requested = Column(DECIMAL(15, 2), nullable=False)
    duration_months = Column(Integer, nullable=False)
    interest_rate = Column(DECIMAL(5, 2))
    status = Column(SQLEnum(CreditRequestStatus), default=CreditRequestStatus.PENDING, index=True)
    collateral_docs = Column(JSON)
    collateral_type = Column(SQLEnum(CollateralType), default=CollateralType.NONE)
    collateral_description = Column(Text)
    requested_at = Column(DateTime, server_default=func.now())
    approved_at = Column(DateTime)
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())


class Currency(str, enum.Enum):
    BRL = "BRL"
    USDT = "USDT"
    USDC = "USDC"
    EUR = "EUR"


class OwnerType(str, enum.Enum):
    INVESTOR = "investor"
    USER = "user"


class Wallet(Base):
    __tablename__ = "wallets"
    
    wallet_id = Column(String(36), primary_key=True, index=True)
    owner_id = Column(String(36), nullable=False, index=True)
    owner_type = Column(SQLEnum(OwnerType), nullable=False)
    currency = Column(SQLEnum(Currency), default=Currency.BRL, index=True)
    balance = Column(DECIMAL(15, 2), default=0.00)
    blocked = Column(DECIMAL(15, 2), default=0.00)
    wallet_address = Column(String(255))
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())


class RiskProfile(str, enum.Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"


class PoolStatus(str, enum.Enum):
    FUNDING = "funding"
    ACTIVE = "active"
    CLOSED = "closed"


class Pool(Base):
    __tablename__ = "pools"
    
    pool_id = Column(String(36), primary_key=True, index=True)
    investor_id = Column(String(36), nullable=False, index=True)
    name = Column(String(255), nullable=False)
    target_amount = Column(DECIMAL(15, 2), nullable=False)
    raised_amount = Column(DECIMAL(15, 2), default=0.00)
    risk_profile = Column(SQLEnum(RiskProfile), default=RiskProfile.MEDIUM)
    expected_return = Column(DECIMAL(5, 2))
    duration_months = Column(Integer, nullable=False)
    status = Column(SQLEnum(PoolStatus), default=PoolStatus.FUNDING, index=True)
    funding_deadline = Column(DateTime)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())


class PoolInvestment(Base):
    __tablename__ = "pool_investments"
    
    investment_id = Column(String(36), primary_key=True, index=True)
    pool_id = Column(String(36), nullable=False, index=True)
    investor_id = Column(String(36), nullable=False, index=True)
    amount = Column(DECIMAL(15, 2), nullable=False)
    share_percentage = Column(DECIMAL(5, 2))
    invested_at = Column(DateTime, server_default=func.now())


class LoanStatus(str, enum.Enum):
    ACTIVE = "active"
    PAID = "paid"
    DEFAULTED = "defaulted"


class PoolLoan(Base):
    __tablename__ = "pool_loans"
    
    pool_loan_id = Column(String(36), primary_key=True, index=True)
    pool_id = Column(String(36), nullable=False, index=True)
    credit_request_id = Column(String(36), nullable=False, index=True)
    allocated_amount = Column(DECIMAL(15, 2), nullable=False)
    status = Column(SQLEnum(LoanStatus), default=LoanStatus.ACTIVE)
    allocated_at = Column(DateTime, server_default=func.now())


class Loan(Base):
    __tablename__ = "loans"
    
    loan_id = Column(String(36), primary_key=True, index=True)
    credit_request_id = Column(String(36), nullable=False)
    user_id = Column(String(36), nullable=False, index=True)
    investor_id = Column(String(36))
    pool_id = Column(String(36))
    principal = Column(DECIMAL(15, 2), nullable=False)
    interest_rate = Column(DECIMAL(5, 2), nullable=False)
    duration_months = Column(Integer, nullable=False)
    status = Column(SQLEnum(LoanStatus), default=LoanStatus.ACTIVE, index=True)
    disbursed_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())


class PaymentStatus(str, enum.Enum):
    PENDING = "pending"
    PAID = "paid"
    OVERDUE = "overdue"


class LoanPayment(Base):
    __tablename__ = "loan_payments"
    
    payment_id = Column(String(36), primary_key=True, index=True)
    loan_id = Column(String(36), nullable=False, index=True)
    installment_number = Column(Integer, nullable=False)
    amount_due = Column(DECIMAL(15, 2), nullable=False)
    amount_paid = Column(DECIMAL(15, 2), default=0.00)
    due_date = Column(Date, nullable=False, index=True)
    paid_at = Column(DateTime)
    status = Column(SQLEnum(PaymentStatus), default=PaymentStatus.PENDING, index=True)


class TransactionType(str, enum.Enum):
    PIX_SEND = "pix_send"
    PIX_RECEIVE = "pix_receive"
    LOAN_PAYMENT = "loan_payment"
    INVESTMENT = "investment"
    SWAP = "swap"
    POOL_CONTRIBUTION = "pool_contribution"


class TransactionStatus(str, enum.Enum):
    PENDING = "pending"
    COMPLETED = "completed"
    FAILED = "failed"


class Transaction(Base):
    __tablename__ = "transactions"
    
    transaction_id = Column(String(36), primary_key=True, index=True)
    sender_id = Column(String(36), index=True)
    sender_type = Column(SQLEnum(OwnerType))
    receiver_id = Column(String(36), index=True)
    receiver_type = Column(SQLEnum(OwnerType))
    wallet_id = Column(String(36))
    amount = Column(DECIMAL(15, 2), nullable=False)
    currency = Column(SQLEnum(Currency), default=Currency.BRL)
    type = Column(SQLEnum(TransactionType), nullable=False)
    status = Column(SQLEnum(TransactionStatus), default=TransactionStatus.PENDING, index=True)
    description = Column(Text)
    blockchain_tx_hash = Column(String(255))
    created_at = Column(DateTime, server_default=func.now(), index=True)
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())
