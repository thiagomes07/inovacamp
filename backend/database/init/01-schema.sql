-- ====================================
-- INOVACAMP DATABASE SCHEMA
-- ====================================
-- Criação do banco de dados e estrutura completa
-- Baseado no DER da documentação
-- ====================================

CREATE DATABASE IF NOT EXISTS inovacamp_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE inovacamp_db;

-- ====================================
-- TABELA: USERS (Tomadores de Crédito)
-- ====================================
CREATE TABLE IF NOT EXISTS users (
    user_id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    cpf_cnpj VARCHAR(14) NOT NULL UNIQUE,
    document_type ENUM('CPF', 'CNPJ') NOT NULL,
    date_of_birth DATE,
    credit_score INT DEFAULT 0,
    calculated_score INT,
    kyc_approved BOOLEAN DEFAULT FALSE,
    document_links JSON,
    financial_docs JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_cpf_cnpj (cpf_cnpj),
    INDEX idx_kyc_approved (kyc_approved)
) ENGINE=InnoDB;

-- ====================================
-- TABELA: INVESTORS (Investidores)
-- ====================================
CREATE TABLE IF NOT EXISTS investors (
    investor_id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    cpf_cnpj VARCHAR(14) NOT NULL UNIQUE,
    document_type ENUM('CPF', 'CNPJ') NOT NULL,
    date_of_birth DATE,
    kyc_approved BOOLEAN DEFAULT FALSE,
    document_links JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_investor_email (email),
    INDEX idx_investor_cpf_cnpj (cpf_cnpj),
    INDEX idx_investor_kyc (kyc_approved)
) ENGINE=InnoDB;

-- ====================================
-- TABELA: CREDIT_REQUESTS (Solicitações de Crédito)
-- ====================================
CREATE TABLE IF NOT EXISTS credit_requests (
    request_id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    user_id CHAR(36) NOT NULL,
    investor_id CHAR(36) NULL,
    amount_requested DECIMAL(15, 2) NOT NULL,
    duration_months INT NOT NULL,
    interest_rate DECIMAL(5, 2),
    status ENUM('PENDING', 'APPROVED', 'REJECTED', 'ACTIVE', 'COMPLETED') DEFAULT 'PENDING',
    collateral_docs JSON,
    collateral_type ENUM('VEHICLE', 'PROPERTY', 'INVESTMENT', 'NONE') DEFAULT 'NONE',
    collateral_description TEXT,
    requested_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    approved_at TIMESTAMP NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (investor_id) REFERENCES investors(investor_id) ON DELETE SET NULL,
    INDEX idx_credit_status (status, requested_at),
    INDEX idx_credit_user (user_id)
) ENGINE=InnoDB;

-- ====================================
-- TABELA: WALLETS (Carteiras)
-- ====================================
CREATE TABLE IF NOT EXISTS wallets (
    wallet_id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    owner_id CHAR(36) NOT NULL,
    owner_type ENUM('INVESTOR', 'USER') NOT NULL,
    currency ENUM('BRL', 'USDT', 'USDC', 'EUR') DEFAULT 'BRL',
    balance DECIMAL(15, 2) DEFAULT 0.00,
    blocked DECIMAL(15, 2) DEFAULT 0.00,
    wallet_address VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_wallet_owner (owner_id, owner_type),
    INDEX idx_wallet_currency (currency)
) ENGINE=InnoDB;

-- ====================================
-- TABELA: POOLS (Pools de Investimento)
-- ====================================
CREATE TABLE IF NOT EXISTS pools (
    pool_id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    investor_id CHAR(36) NOT NULL,
    name VARCHAR(255) NOT NULL,
    target_amount DECIMAL(15, 2) NOT NULL,
    raised_amount DECIMAL(15, 2) DEFAULT 0.00,
    risk_profile ENUM('LOW', 'MEDIUM', 'HIGH') DEFAULT 'MEDIUM',
    expected_return DECIMAL(5, 2),
    duration_months INT NOT NULL,
    status ENUM('FUNDING', 'ACTIVE', 'CLOSED') DEFAULT 'FUNDING',
    funding_deadline TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (investor_id) REFERENCES investors(investor_id) ON DELETE CASCADE,
    INDEX idx_pool_status (status),
    INDEX idx_pool_investor (investor_id)
) ENGINE=InnoDB;

-- ====================================
-- TABELA: POOL_INVESTMENTS (Investimentos em Pools)
-- ====================================
CREATE TABLE IF NOT EXISTS pool_investments (
    investment_id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    pool_id CHAR(36) NOT NULL,
    investor_id CHAR(36) NOT NULL,
    amount DECIMAL(15, 2) NOT NULL,
    share_percentage DECIMAL(5, 2),
    invested_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (pool_id) REFERENCES pools(pool_id) ON DELETE CASCADE,
    FOREIGN KEY (investor_id) REFERENCES investors(investor_id) ON DELETE CASCADE,
    INDEX idx_pool_inv_pool (pool_id),
    INDEX idx_pool_inv_investor (investor_id)
) ENGINE=InnoDB;

-- ====================================
-- TABELA: POOL_LOANS (Empréstimos via Pool)
-- ====================================
CREATE TABLE IF NOT EXISTS pool_loans (
    pool_loan_id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    pool_id CHAR(36) NOT NULL,
    credit_request_id CHAR(36) NOT NULL,
    allocated_amount DECIMAL(15, 2) NOT NULL,
    status ENUM('ACTIVE', 'PAID', 'DEFAULTED') DEFAULT 'ACTIVE',
    allocated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (pool_id) REFERENCES pools(pool_id) ON DELETE CASCADE,
    FOREIGN KEY (credit_request_id) REFERENCES credit_requests(request_id) ON DELETE CASCADE,
    INDEX idx_pool_loan_pool (pool_id),
    INDEX idx_pool_loan_request (credit_request_id)
) ENGINE=InnoDB;

-- ====================================
-- TABELA: LOANS (Empréstimos)
-- ====================================
CREATE TABLE IF NOT EXISTS loans (
    loan_id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    credit_request_id CHAR(36) NOT NULL,
    user_id CHAR(36) NOT NULL,
    investor_id CHAR(36) NULL,
    pool_id CHAR(36) NULL,
    principal DECIMAL(15, 2) NOT NULL,
    interest_rate DECIMAL(5, 2) NOT NULL,
    duration_months INT NOT NULL,
    status ENUM('ACTIVE', 'PAID', 'DEFAULTED') DEFAULT 'ACTIVE',
    disbursed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (credit_request_id) REFERENCES credit_requests(request_id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (investor_id) REFERENCES investors(investor_id) ON DELETE SET NULL,
    FOREIGN KEY (pool_id) REFERENCES pools(pool_id) ON DELETE SET NULL,
    INDEX idx_loans_status_user (user_id, status),
    INDEX idx_loans_investor (investor_id),
    INDEX idx_loans_pool (pool_id)
) ENGINE=InnoDB;

-- ====================================
-- TABELA: LOAN_PAYMENTS (Parcelas de Empréstimo)
-- ====================================
CREATE TABLE IF NOT EXISTS loan_payments (
    payment_id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    loan_id CHAR(36) NOT NULL,
    installment_number INT NOT NULL,
    amount_due DECIMAL(15, 2) NOT NULL,
    amount_paid DECIMAL(15, 2) DEFAULT 0.00,
    due_date DATE NOT NULL,
    paid_at TIMESTAMP NULL,
    status ENUM('PENDING', 'PAID', 'OVERDUE') DEFAULT 'PENDING',
    FOREIGN KEY (loan_id) REFERENCES loans(loan_id) ON DELETE CASCADE,
    INDEX idx_payment_loan (loan_id),
    INDEX idx_payment_status (status),
    INDEX idx_payment_due_date (due_date)
) ENGINE=InnoDB;

-- ====================================
-- TABELA: TRANSACTIONS (Transações)
-- ====================================
CREATE TABLE IF NOT EXISTS transactions (
    transaction_id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    sender_id CHAR(36),
    sender_type ENUM('INVESTOR', 'USER'),
    receiver_id CHAR(36),
    receiver_type ENUM('INVESTOR', 'USER'),
    wallet_id CHAR(36),
    amount DECIMAL(15, 2) NOT NULL,
    currency ENUM('BRL', 'USDT', 'USDC', 'EUR') DEFAULT 'BRL',
    type ENUM('PIX_SEND', 'PIX_RECEIVE', 'LOAN_PAYMENT', 'INVESTMENT', 'SWAP', 'POOL_CONTRIBUTION') NOT NULL,
    status ENUM('PENDING', 'COMPLETED', 'FAILED') DEFAULT 'PENDING',
    description TEXT,
    blockchain_tx_hash VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (wallet_id) REFERENCES wallets(wallet_id) ON DELETE SET NULL,
    INDEX idx_transactions_wallet_date (wallet_id, created_at DESC),
    INDEX idx_transactions_sender (sender_id, sender_type),
    INDEX idx_transactions_receiver (receiver_id, receiver_type),
    INDEX idx_transactions_status (status)
) ENGINE=InnoDB;

-- ====================================
-- TRIGGERS PARA AUDITORIA
-- ====================================

-- Trigger para atualizar raised_amount em pools
DELIMITER //
CREATE TRIGGER trg_pool_investment_insert
AFTER INSERT ON pool_investments
FOR EACH ROW
BEGIN
    UPDATE pools 
    SET raised_amount = raised_amount + NEW.amount
    WHERE pool_id = NEW.pool_id;
END//
DELIMITER ;

-- Trigger para calcular share_percentage em pool_investments
DELIMITER //
CREATE TRIGGER trg_pool_investment_share_calc
BEFORE INSERT ON pool_investments
FOR EACH ROW
BEGIN
    DECLARE total_raised DECIMAL(15, 2);
    DECLARE target DECIMAL(15, 2);
    
    SELECT raised_amount, target_amount INTO total_raised, target
    FROM pools WHERE pool_id = NEW.pool_id;
    
    SET NEW.share_percentage = (NEW.amount / (total_raised + NEW.amount)) * 100;
END//
DELIMITER ;

-- ====================================
-- VIEWS ÚTEIS
-- ====================================

-- View de portfolios de investidores
CREATE OR REPLACE VIEW investor_portfolio AS
SELECT 
    i.investor_id,
    i.full_name AS investor_name,
    COUNT(DISTINCT l.loan_id) AS total_loans,
    SUM(l.principal) AS total_invested,
    SUM(CASE WHEN l.status = 'active' THEN l.principal ELSE 0 END) AS active_loans_value,
    COUNT(DISTINCT p.pool_id) AS total_pools
FROM investors i
LEFT JOIN loans l ON i.investor_id = l.investor_id
LEFT JOIN pool_investments pi ON i.investor_id = pi.investor_id
LEFT JOIN pools p ON pi.pool_id = p.pool_id
GROUP BY i.investor_id, i.full_name;

-- View de status de crédito de usuários
CREATE OR REPLACE VIEW user_credit_status AS
SELECT 
    u.user_id,
    u.full_name,
    u.credit_score,
    u.kyc_approved,
    COUNT(cr.request_id) AS total_requests,
    COUNT(CASE WHEN cr.status = 'pending' THEN 1 END) AS pending_requests,
    COUNT(CASE WHEN cr.status = 'approved' THEN 1 END) AS approved_requests,
    COUNT(l.loan_id) AS active_loans,
    COALESCE(SUM(l.principal), 0) AS total_debt
FROM users u
LEFT JOIN credit_requests cr ON u.user_id = cr.user_id
LEFT JOIN loans l ON u.user_id = l.user_id AND l.status = 'active'
GROUP BY u.user_id, u.full_name, u.credit_score, u.kyc_approved;

-- ====================================
-- FIM DO SCRIPT DE INICIALIZAÇÃO
-- ====================================
