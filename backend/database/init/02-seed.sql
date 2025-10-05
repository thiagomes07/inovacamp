-- ====================================
-- SEED DATA - DADOS FICTÃCIOS
-- ====================================
-- Populate database with realistic test data
-- ====================================

USE inovacamp_db;

-- Garantir charset UTF-8
SET NAMES utf8mb4;
SET CHARACTER SET utf8mb4;

-- Verificar se jÃ¡ existem dados
SET @user_count = (SELECT COUNT(*) FROM users);
SET @investor_count = (SELECT COUNT(*) FROM investors);

-- SÃ³ popular se o banco estiver vazio
-- USERS (Tomadores de CrÃ©dito)
INSERT INTO users (user_id, email, password_hash, full_name, phone, cpf_cnpj, document_type, date_of_birth, credit_score, calculated_score, kyc_approved, document_links, financial_docs)
SELECT * FROM (
    SELECT 
        'u1000000-0000-0000-0000-000000000001' AS user_id,
        'joao.silva@email.com' AS email,
        '$2b$12$VK61/t9/8c0RwT2y0R7YNugdfC5DX7UKHblVZYNIedCc/Sdc2LK76' AS password_hash, -- senha: Password123!
        'Joao Silva' AS full_name,
        '11987654321' AS phone,
        '12345678901' AS cpf_cnpj,
        'CPF' AS document_type,
        '1990-05-15' AS date_of_birth,
        750 AS credit_score,
        750 AS calculated_score,
        TRUE AS kyc_approved,
        '["https://s3.amazonaws.com/docs/rg_joao.pdf", "https://s3.amazonaws.com/docs/cnh_joao.pdf"]' AS document_links,
        '["https://s3.amazonaws.com/docs/extrato_joao.pdf"]' AS financial_docs
) AS tmp
WHERE @user_count = 0;

INSERT INTO users (user_id, email, password_hash, full_name, phone, cpf_cnpj, document_type, date_of_birth, credit_score, calculated_score, kyc_approved, document_links, financial_docs)
SELECT * FROM (
    SELECT 
        'u1000000-0000-0000-0000-000000000002' AS user_id,
        'maria.santos@email.com' AS email,
        '$2b$12$VK61/t9/8c0RwT2y0R7YNugdfC5DX7UKHblVZYNIedCc/Sdc2LK76' AS password_hash,
        'Maria Santos' AS full_name,
        '11976543210' AS phone,
        '98765432109' AS cpf_cnpj,
        'CPF' AS document_type,
        '1985-08-22' AS date_of_birth,
        680 AS credit_score,
        680 AS calculated_score,
        TRUE AS kyc_approved,
        '["https://s3.amazonaws.com/docs/rg_maria.pdf"]' AS document_links,
        '["https://s3.amazonaws.com/docs/holerite_maria.pdf"]' AS financial_docs
) AS tmp
WHERE @user_count = 0;

INSERT INTO users (user_id, email, password_hash, full_name, phone, cpf_cnpj, document_type, date_of_birth, credit_score, calculated_score, kyc_approved, document_links, financial_docs)
SELECT * FROM (
    SELECT 
        'u1000000-0000-0000-0000-000000000003' AS user_id,
        'empresa.tech@email.com' AS email,
        '$2b$12$VK61/t9/8c0RwT2y0R7YNugdfC5DX7UKHblVZYNIedCc/Sdc2LK76' AS password_hash,
        'Tech Solutions LTDA' AS full_name,
        '1133334444' AS phone,
        '12345678000190' AS cpf_cnpj,
        'CNPJ' AS document_type,
        '2018-03-10' AS date_of_birth,
        720 AS credit_score,
        720 AS calculated_score,
        TRUE AS kyc_approved,
        '["https://s3.amazonaws.com/docs/contrato_social.pdf"]' AS document_links,
        '["https://s3.amazonaws.com/docs/dre_empresa.pdf", "https://s3.amazonaws.com/docs/balanco.pdf"]' AS financial_docs
) AS tmp
WHERE @user_count = 0;

-- INVESTORS (Investidores)
INSERT INTO investors (investor_id, email, password_hash, full_name, phone, cpf_cnpj, document_type, date_of_birth, kyc_approved, document_links)
SELECT * FROM (
    SELECT 
        'i1000000-0000-0000-0000-000000000001' AS investor_id,
        'carlos.investor@email.com' AS email,
        '$2b$12$VK61/t9/8c0RwT2y0R7YNugdfC5DX7UKHblVZYNIedCc/Sdc2LK76' AS password_hash,
        'Carlos Investidor' AS full_name,
        '11955556666' AS phone,
        '11122233344' AS cpf_cnpj,
        'CPF' AS document_type,
        '1975-12-05' AS date_of_birth,
        TRUE AS kyc_approved,
        '["https://s3.amazonaws.com/docs/rg_carlos.pdf"]' AS document_links
) AS tmp
WHERE @investor_count = 0;

INSERT INTO investors (investor_id, email, password_hash, full_name, phone, cpf_cnpj, document_type, date_of_birth, kyc_approved, document_links)
SELECT * FROM (
    SELECT 
        'i1000000-0000-0000-0000-000000000002' AS investor_id,
        'ana.capital@email.com' AS email,
        '$2b$12$VK61/t9/8c0RwT2y0R7YNugdfC5DX7UKHblVZYNIedCc/Sdc2LK76' AS password_hash,
        'Ana Paula Capital' AS full_name,
        '21988887777' AS phone,
        '55566677788' AS cpf_cnpj,
        'CPF' AS document_type,
        '1988-04-18' AS date_of_birth,
        TRUE AS kyc_approved,
        '["https://s3.amazonaws.com/docs/rg_ana.pdf"]' AS document_links
) AS tmp
WHERE @investor_count = 0;

-- WALLETS (Carteiras) - Apenas BRL
INSERT INTO wallets (wallet_id, owner_id, owner_type, currency, balance, blocked, wallet_address)
SELECT * FROM (
    SELECT 
        'w1000000-0000-0000-0000-000000000001' AS wallet_id,
        'u1000000-0000-0000-0000-000000000001' AS owner_id,
        'USER' AS owner_type,
        'BRL' AS currency,
        25750.00 AS balance,
        0.00 AS blocked,
        NULL AS wallet_address
) AS tmp
WHERE @user_count = 0;

INSERT INTO wallets (wallet_id, owner_id, owner_type, currency, balance, blocked, wallet_address)
SELECT * FROM (
    SELECT 
        'w1000000-0000-0000-0000-000000000002' AS wallet_id,
        'u1000000-0000-0000-0000-000000000002' AS owner_id,
        'USER' AS owner_type,
        'BRL' AS currency,
        12875.00 AS balance,
        0.00 AS blocked,
        NULL AS wallet_address
) AS tmp
WHERE @user_count = 0;

-- Carteiras dos novos usuários
INSERT INTO wallets (wallet_id, owner_id, owner_type, currency, balance, blocked, wallet_address)
SELECT * FROM (
    SELECT 
        'w1000000-0000-0000-0000-000000000005' AS wallet_id,
        'u1000000-0000-0000-0000-000000000004' AS owner_id,
        'USER' AS owner_type,
        'BRL' AS currency,
        6180.00 AS balance,
        0.00 AS blocked,
        NULL AS wallet_address
) AS tmp
WHERE @user_count = 0;

INSERT INTO wallets (wallet_id, owner_id, owner_type, currency, balance, blocked, wallet_address)
SELECT * FROM (
    SELECT 
        'w1000000-0000-0000-0000-000000000006' AS wallet_id,
        'u1000000-0000-0000-0000-000000000005' AS owner_id,
        'USER' AS owner_type,
        'BRL' AS currency,
        4120.00 AS balance,
        0.00 AS blocked,
        NULL AS wallet_address
) AS tmp
WHERE @user_count = 0;

INSERT INTO wallets (wallet_id, owner_id, owner_type, currency, balance, blocked, wallet_address)
SELECT * FROM (
    SELECT 
        'w1000000-0000-0000-0000-000000000007' AS wallet_id,
        'u1000000-0000-0000-0000-000000000006' AS owner_id,
        'USER' AS owner_type,
        'BRL' AS currency,
        18025.00 AS balance,
        0.00 AS blocked,
        NULL AS wallet_address
) AS tmp
WHERE @user_count = 0;

-- Carteiras BRL para investidores
INSERT INTO wallets (wallet_id, owner_id, owner_type, currency, balance, blocked, wallet_address)
SELECT * FROM (
    SELECT 
        'w1000000-0000-0000-0000-000000000011' AS wallet_id,
        'i1000000-0000-0000-0000-000000000001' AS owner_id,
        'INVESTOR' AS owner_type,
        'BRL' AS currency,
        2575000.00 AS balance,
        0.00 AS blocked,
        NULL AS wallet_address
) AS tmp
WHERE @investor_count = 0;

INSERT INTO wallets (wallet_id, owner_id, owner_type, currency, balance, blocked, wallet_address)
SELECT * FROM (
    SELECT 
        'w1000000-0000-0000-0000-000000000012' AS wallet_id,
        'i1000000-0000-0000-0000-000000000002' AS owner_id,
        'INVESTOR' AS owner_type,
        'BRL' AS currency,
        257500.00 AS balance,
        0.00 AS blocked,
        NULL AS wallet_address
) AS tmp
WHERE @investor_count = 0;

-- CREDIT_REQUESTS (SolicitaÃ§Ãµes de CrÃ©dito)
INSERT INTO credit_requests (request_id, user_id, investor_id, amount_requested, duration_months, interest_rate, status, collateral_type, collateral_description, collateral_docs)
SELECT * FROM (
    SELECT 
        'cr100000-0000-0000-0000-000000000001' AS request_id,
        'u1000000-0000-0000-0000-000000000001' AS user_id,
        NULL AS investor_id,
        15000.00 AS amount_requested,
        12 AS duration_months,
        2.5 AS interest_rate,
        'PENDING' AS status,
        'VEHICLE' AS collateral_type,
        'Honda Civic 2019, placa ABC1234' AS collateral_description,
        '["https://s3.amazonaws.com/docs/doc_veiculo.pdf"]' AS collateral_docs
) AS tmp
WHERE @user_count = 0;

INSERT INTO credit_requests (request_id, user_id, investor_id, amount_requested, duration_months, interest_rate, status, collateral_type, collateral_description, collateral_docs)
SELECT * FROM (
    SELECT 
        'cr100000-0000-0000-0000-000000000002' AS request_id,
        'u1000000-0000-0000-0000-000000000002' AS user_id,
        'i1000000-0000-0000-0000-000000000001' AS investor_id,
        8000.00 AS amount_requested,
        6 AS duration_months,
        2.8 AS interest_rate,
        'APPROVED' AS status,
        'NONE' AS collateral_type,
        NULL AS collateral_description,
        NULL AS collateral_docs
) AS tmp
WHERE @user_count = 0;

INSERT INTO credit_requests (request_id, user_id, investor_id, amount_requested, duration_months, interest_rate, status, collateral_type, collateral_description, collateral_docs)
SELECT * FROM (
    SELECT 
        'cr100000-0000-0000-0000-000000000003' AS request_id,
        'u1000000-0000-0000-0000-000000000003' AS user_id,
        NULL AS investor_id,
        50000.00 AS amount_requested,
        24 AS duration_months,
        3.2 AS interest_rate,
        'PENDING' AS status,
        'PROPERTY' AS collateral_type,
        'Equipamentos e maquinario industrial' AS collateral_description,
        '["https://s3.amazonaws.com/docs/nota_fiscal_equipamentos.pdf"]' AS collateral_docs
) AS tmp
WHERE @user_count = 0;

-- Mais oportunidades pendentes
INSERT INTO credit_requests (request_id, user_id, investor_id, amount_requested, duration_months, interest_rate, status, collateral_type, collateral_description, collateral_docs)
SELECT * FROM (
    SELECT 
        'cr100000-0000-0000-0000-000000000004' AS request_id,
        'u1000000-0000-0000-0000-000000000001' AS user_id,
        NULL AS investor_id,
        12000.00 AS amount_requested,
        18 AS duration_months,
        2.9 AS interest_rate,
        'PENDING' AS status,
        'VEHICLE' AS collateral_type,
        'Veiculo comercial para expansao de negocio' AS collateral_description,
        '["https://s3.amazonaws.com/docs/doc_veiculo2.pdf"]' AS collateral_docs
) AS tmp
WHERE @user_count = 0;

INSERT INTO credit_requests (request_id, user_id, investor_id, amount_requested, duration_months, interest_rate, status, collateral_type, collateral_description, collateral_docs)
SELECT * FROM (
    SELECT 
        'cr100000-0000-0000-0000-000000000005' AS request_id,
        'u1000000-0000-0000-0000-000000000002' AS user_id,
        NULL AS investor_id,
        5000.00 AS amount_requested,
        12 AS duration_months,
        3.5 AS interest_rate,
        'PENDING' AS status,
        'NONE' AS collateral_type,
        NULL AS collateral_description,
        NULL AS collateral_docs
) AS tmp
WHERE @user_count = 0;

-- Adicionar mais usuários para mais oportunidades
INSERT INTO users (user_id, email, password_hash, full_name, phone, cpf_cnpj, document_type, date_of_birth, credit_score, calculated_score, kyc_approved, document_links, financial_docs)
SELECT * FROM (
    SELECT 
        'u1000000-0000-0000-0000-000000000004' AS user_id,
        'ana.costa@email.com' AS email,
        '$2b$12$VK61/t9/8c0RwT2y0R7YNugdfC5DX7UKHblVZYNIedCc/Sdc2LK76' AS password_hash,
        'Ana Costa' AS full_name,
        '21987654321' AS phone,
        '11122233355' AS cpf_cnpj,
        'CPF' AS document_type,
        '1992-03-10' AS date_of_birth,
        650 AS credit_score,
        650 AS calculated_score,
        TRUE AS kyc_approved,
        '["https://s3.amazonaws.com/docs/rg_ana.pdf"]' AS document_links,
        '["https://s3.amazonaws.com/docs/holerite_ana.pdf"]' AS financial_docs
) AS tmp
WHERE @user_count = 0;

INSERT INTO users (user_id, email, password_hash, full_name, phone, cpf_cnpj, document_type, date_of_birth, credit_score, calculated_score, kyc_approved, document_links, financial_docs)
SELECT * FROM (
    SELECT 
        'u1000000-0000-0000-0000-000000000005' AS user_id,
        'pedro.souza@email.com' AS email,
        '$2b$12$VK61/t9/8c0RwT2y0R7YNugdfC5DX7UKHblVZYNIedCc/Sdc2LK76' AS password_hash,
        'Pedro Souza' AS full_name,
        '11966778899' AS phone,
        '22233344466' AS cpf_cnpj,
        'CPF' AS document_type,
        '1987-07-22' AS date_of_birth,
        580 AS credit_score,
        580 AS calculated_score,
        TRUE AS kyc_approved,
        '["https://s3.amazonaws.com/docs/rg_pedro.pdf"]' AS document_links,
        '["https://s3.amazonaws.com/docs/extrato_pedro.pdf"]' AS financial_docs
) AS tmp
WHERE @user_count = 0;

INSERT INTO users (user_id, email, password_hash, full_name, phone, cpf_cnpj, document_type, date_of_birth, credit_score, calculated_score, kyc_approved, document_links, financial_docs)
SELECT * FROM (
    SELECT 
        'u1000000-0000-0000-0000-000000000006' AS user_id,
        'restaurante.bom@email.com' AS email,
        '$2b$12$VK61/t9/8c0RwT2y0R7YNugdfC5DX7UKHblVZYNIedCc/Sdc2LK76' AS password_hash,
        'Restaurante Bom Sabor LTDA' AS full_name,
        '1133445566' AS phone,
        '33344455000188' AS cpf_cnpj,
        'CNPJ' AS document_type,
        '2015-05-20' AS date_of_birth,
        690 AS credit_score,
        690 AS calculated_score,
        TRUE AS kyc_approved,
        '["https://s3.amazonaws.com/docs/contrato_social_rest.pdf"]' AS document_links,
        '["https://s3.amazonaws.com/docs/balanco_rest.pdf"]' AS financial_docs
) AS tmp
WHERE @user_count = 0;

-- Mais oportunidades de investimento
INSERT INTO credit_requests (request_id, user_id, investor_id, amount_requested, duration_months, interest_rate, status, collateral_type, collateral_description, collateral_docs)
SELECT * FROM (
    SELECT 
        'cr100000-0000-0000-0000-000000000006' AS request_id,
        'u1000000-0000-0000-0000-000000000004' AS user_id,
        NULL AS investor_id,
        8000.00 AS amount_requested,
        12 AS duration_months,
        3.2 AS interest_rate,
        'PENDING' AS status,
        'NONE' AS collateral_type,
        'Capital de giro' AS collateral_description,
        NULL AS collateral_docs
) AS tmp
WHERE @user_count = 0;

INSERT INTO credit_requests (request_id, user_id, investor_id, amount_requested, duration_months, interest_rate, status, collateral_type, collateral_description, collateral_docs)
SELECT * FROM (
    SELECT 
        'cr100000-0000-0000-0000-000000000007' AS request_id,
        'u1000000-0000-0000-0000-000000000005' AS user_id,
        NULL AS investor_id,
        20000.00 AS amount_requested,
        24 AS duration_months,
        4.5 AS interest_rate,
        'PENDING' AS status,
        'VEHICLE' AS collateral_type,
        'Veiculo utilitario para trabalho' AS collateral_description,
        '["https://s3.amazonaws.com/docs/doc_veiculo_pedro.pdf"]' AS collateral_docs
) AS tmp
WHERE @user_count = 0;

INSERT INTO credit_requests (request_id, user_id, investor_id, amount_requested, duration_months, interest_rate, status, collateral_type, collateral_description, collateral_docs)
SELECT * FROM (
    SELECT 
        'cr100000-0000-0000-0000-000000000008' AS request_id,
        'u1000000-0000-0000-0000-000000000006' AS user_id,
        NULL AS investor_id,
        35000.00 AS amount_requested,
        18 AS duration_months,
        3.0 AS interest_rate,
        'PENDING' AS status,
        'PROPERTY' AS collateral_type,
        'Equipamentos de cozinha industrial' AS collateral_description,
        '["https://s3.amazonaws.com/docs/equipamentos_rest.pdf"]' AS collateral_docs
) AS tmp
WHERE @user_count = 0;

INSERT INTO credit_requests (request_id, user_id, investor_id, amount_requested, duration_months, interest_rate, status, collateral_type, collateral_description, collateral_docs)
SELECT * FROM (
    SELECT 
        'cr100000-0000-0000-0000-000000000009' AS request_id,
        'u1000000-0000-0000-0000-000000000001' AS user_id,
        NULL AS investor_id,
        7500.00 AS amount_requested,
        12 AS duration_months,
        2.7 AS interest_rate,
        'PENDING' AS status,
        'INVESTMENT' AS collateral_type,
        'Investimentos em acoes' AS collateral_description,
        '["https://s3.amazonaws.com/docs/extrato_inv.pdf"]' AS collateral_docs
) AS tmp
WHERE @user_count = 0;

INSERT INTO credit_requests (request_id, user_id, investor_id, amount_requested, duration_months, interest_rate, status, collateral_type, collateral_description, collateral_docs)
SELECT * FROM (
    SELECT 
        'cr100000-0000-0000-0000-000000000010' AS request_id,
        'u1000000-0000-0000-0000-000000000002' AS user_id,
        NULL AS investor_id,
        15000.00 AS amount_requested,
        18 AS duration_months,
        3.8 AS interest_rate,
        'PENDING' AS status,
        'NONE' AS collateral_type,
        'Reforma residencial' AS collateral_description,
        NULL AS collateral_docs
) AS tmp
WHERE @user_count = 0;

-- POOLS (Pools de Investimento)
INSERT INTO pools (pool_id, investor_id, name, target_amount, raised_amount, risk_profile, expected_return, duration_months, status, funding_deadline)
SELECT * FROM (
    SELECT 
        'p1000000-0000-0000-0000-000000000001' AS pool_id,
        'i1000000-0000-0000-0000-000000000001' AS investor_id,
        'Pool Credito Seguro' AS name,
        100000.00 AS target_amount,
        45000.00 AS raised_amount,
        'LOW' AS risk_profile,
        8.5 AS expected_return,
        12 AS duration_months,
        'FUNDING' AS status,
        DATE_ADD(NOW(), INTERVAL 30 DAY) AS funding_deadline
) AS tmp
WHERE @investor_count = 0;

INSERT INTO pools (pool_id, investor_id, name, target_amount, raised_amount, risk_profile, expected_return, duration_months, status, funding_deadline)
SELECT * FROM (
    SELECT 
        'p1000000-0000-0000-0000-000000000002' AS pool_id,
        'i1000000-0000-0000-0000-000000000002' AS investor_id,
        'Pool Alto Retorno' AS name,
        200000.00 AS target_amount,
        180000.00 AS raised_amount,
        'HIGH' AS risk_profile,
        15.0 AS expected_return,
        18 AS duration_months,
        'ACTIVE' AS status,
        DATE_SUB(NOW(), INTERVAL 10 DAY) AS funding_deadline
) AS tmp
WHERE @investor_count = 0;

-- POOL_INVESTMENTS
INSERT INTO pool_investments (investment_id, pool_id, investor_id, amount, share_percentage)
SELECT * FROM (
    SELECT 
        'pi100000-0000-0000-0000-000000000001' AS investment_id,
        'p1000000-0000-0000-0000-000000000001' AS pool_id,
        'i1000000-0000-0000-0000-000000000001' AS investor_id,
        45000.00 AS amount,
        100.0 AS share_percentage
) AS tmp
WHERE @investor_count = 0;

INSERT INTO pool_investments (investment_id, pool_id, investor_id, amount, share_percentage)
SELECT * FROM (
    SELECT 
        'pi100000-0000-0000-0000-000000000002' AS investment_id,
        'p1000000-0000-0000-0000-000000000002' AS pool_id,
        'i1000000-0000-0000-0000-000000000002' AS investor_id,
        120000.00 AS amount,
        66.67 AS share_percentage
) AS tmp
WHERE @investor_count = 0;

INSERT INTO pool_investments (investment_id, pool_id, investor_id, amount, share_percentage)
SELECT * FROM (
    SELECT 
        'pi100000-0000-0000-0000-000000000003' AS investment_id,
        'p1000000-0000-0000-0000-000000000002' AS pool_id,
        'i1000000-0000-0000-0000-000000000001' AS investor_id,
        60000.00 AS amount,
        33.33 AS share_percentage
) AS tmp
WHERE @investor_count = 0;

-- LOANS (EmprÃ©stimos Ativos)
INSERT INTO loans (loan_id, credit_request_id, user_id, investor_id, pool_id, principal, interest_rate, duration_months, status, disbursed_at)
SELECT * FROM (
    SELECT 
        'l1000000-0000-0000-0000-000000000001' AS loan_id,
        'cr100000-0000-0000-0000-000000000002' AS credit_request_id,
        'u1000000-0000-0000-0000-000000000002' AS user_id,
        'i1000000-0000-0000-0000-000000000001' AS investor_id,
        NULL AS pool_id,
        8000.00 AS principal,
        2.8 AS interest_rate,
        6 AS duration_months,
        'ACTIVE' AS status,
        DATE_SUB(NOW(), INTERVAL 60 DAY) AS disbursed_at
) AS tmp
WHERE @user_count = 0;

-- Mais loans para investidor i1000000-0000-0000-0000-000000000001
INSERT INTO loans (loan_id, credit_request_id, user_id, investor_id, pool_id, principal, interest_rate, duration_months, status, disbursed_at)
SELECT * FROM (
    SELECT 
        'l1000000-0000-0000-0000-000000000002' AS loan_id,
        'cr100000-0000-0000-0000-000000000001' AS credit_request_id,
        'u1000000-0000-0000-0000-000000000001' AS user_id,
        'i1000000-0000-0000-0000-000000000001' AS investor_id,
        NULL AS pool_id,
        15000.00 AS principal,
        2.5 AS interest_rate,
        12 AS duration_months,
        'ACTIVE' AS status,
        DATE_SUB(NOW(), INTERVAL 90 DAY) AS disbursed_at
) AS tmp
WHERE @user_count = 0;

INSERT INTO loans (loan_id, credit_request_id, user_id, investor_id, pool_id, principal, interest_rate, duration_months, status, disbursed_at)
SELECT * FROM (
    SELECT 
        'l1000000-0000-0000-0000-000000000003' AS loan_id,
        'cr100000-0000-0000-0000-000000000003' AS credit_request_id,
        'u1000000-0000-0000-0000-000000000003' AS user_id,
        NULL AS investor_id,
        'p1000000-0000-0000-0000-000000000001' AS pool_id,
        25000.00 AS principal,
        3.2 AS interest_rate,
        18 AS duration_months,
        'ACTIVE' AS status,
        DATE_SUB(NOW(), INTERVAL 45 DAY) AS disbursed_at
) AS tmp
WHERE @user_count = 0;

-- LOAN_PAYMENTS (Parcelas)
INSERT INTO loan_payments (payment_id, loan_id, installment_number, amount_due, amount_paid, due_date, paid_at, status)
SELECT * FROM (
    SELECT 
        'lp100000-0000-0000-0000-000000000001' AS payment_id,
        'l1000000-0000-0000-0000-000000000001' AS loan_id,
        1 AS installment_number,
        1370.00 AS amount_due,
        1370.00 AS amount_paid,
        DATE_SUB(NOW(), INTERVAL 30 DAY) AS due_date,
        DATE_SUB(NOW(), INTERVAL 28 DAY) AS paid_at,
        'PAID' AS status
) AS tmp
WHERE @user_count = 0;

INSERT INTO loan_payments (payment_id, loan_id, installment_number, amount_due, amount_paid, due_date, paid_at, status)
SELECT * FROM (
    SELECT 
        'lp100000-0000-0000-0000-000000000002' AS payment_id,
        'l1000000-0000-0000-0000-000000000001' AS loan_id,
        2 AS installment_number,
        1370.00 AS amount_due,
        0.00 AS amount_paid,
        NOW() AS due_date,
        NULL AS paid_at,
        'PENDING' AS status
) AS tmp
WHERE @user_count = 0;

-- Pagamentos do loan 2
INSERT INTO loan_payments (payment_id, loan_id, installment_number, amount_due, amount_paid, due_date, paid_at, status)
SELECT * FROM (
    SELECT 
        'lp100000-0000-0000-0000-000000000003' AS payment_id,
        'l1000000-0000-0000-0000-000000000002' AS loan_id,
        1 AS installment_number,
        1300.00 AS amount_due,
        1300.00 AS amount_paid,
        DATE_SUB(NOW(), INTERVAL 60 DAY) AS due_date,
        DATE_SUB(NOW(), INTERVAL 58 DAY) AS paid_at,
        'PAID' AS status
) AS tmp
WHERE @user_count = 0;

INSERT INTO loan_payments (payment_id, loan_id, installment_number, amount_due, amount_paid, due_date, paid_at, status)
SELECT * FROM (
    SELECT 
        'lp100000-0000-0000-0000-000000000004' AS payment_id,
        'l1000000-0000-0000-0000-000000000002' AS loan_id,
        2 AS installment_number,
        1300.00 AS amount_due,
        1300.00 AS amount_paid,
        DATE_SUB(NOW(), INTERVAL 30 DAY) AS due_date,
        DATE_SUB(NOW(), INTERVAL 29 DAY) AS paid_at,
        'PAID' AS status
) AS tmp
WHERE @user_count = 0;

INSERT INTO loan_payments (payment_id, loan_id, installment_number, amount_due, amount_paid, due_date, paid_at, status)
SELECT * FROM (
    SELECT 
        'lp100000-0000-0000-0000-000000000005' AS payment_id,
        'l1000000-0000-0000-0000-000000000002' AS loan_id,
        3 AS installment_number,
        1300.00 AS amount_due,
        0.00 AS amount_paid,
        DATE_ADD(NOW(), INTERVAL 5 DAY) AS due_date,
        NULL AS paid_at,
        'PENDING' AS status
) AS tmp
WHERE @user_count = 0;

-- Pagamentos do loan 3 (via pool)
INSERT INTO loan_payments (payment_id, loan_id, installment_number, amount_due, amount_paid, due_date, paid_at, status)
SELECT * FROM (
    SELECT 
        'lp100000-0000-0000-0000-000000000006' AS payment_id,
        'l1000000-0000-0000-0000-000000000003' AS loan_id,
        1 AS installment_number,
        1500.00 AS amount_due,
        1500.00 AS amount_paid,
        DATE_SUB(NOW(), INTERVAL 15 DAY) AS due_date,
        DATE_SUB(NOW(), INTERVAL 14 DAY) AS paid_at,
        'PAID' AS status
) AS tmp
WHERE @user_count = 0;

INSERT INTO loan_payments (payment_id, loan_id, installment_number, amount_due, amount_paid, due_date, paid_at, status)
SELECT * FROM (
    SELECT 
        'lp100000-0000-0000-0000-000000000007' AS payment_id,
        'l1000000-0000-0000-0000-000000000003' AS loan_id,
        2 AS installment_number,
        1500.00 AS amount_due,
        0.00 AS amount_paid,
        DATE_ADD(NOW(), INTERVAL 15 DAY) AS due_date,
        NULL AS paid_at,
        'PENDING' AS status
) AS tmp
WHERE @user_count = 0;

-- TRANSACTIONS
INSERT INTO transactions (transaction_id, sender_id, sender_type, receiver_id, receiver_type, wallet_id, amount, currency, type, status, description, blockchain_tx_hash)
SELECT * FROM (
    SELECT 
        't1000000-0000-0000-0000-000000000001' AS transaction_id,
        'u1000000-0000-0000-0000-000000000002' AS sender_id,
        'USER' AS sender_type,
        'i1000000-0000-0000-0000-000000000001' AS receiver_id,
        'INVESTOR' AS receiver_type,
        'w1000000-0000-0000-0000-000000000002' AS wallet_id,
        1370.00 AS amount,
        'BRL' AS currency,
        'LOAN_PAYMENT' AS type,
        'COMPLETED' AS status,
        'Pagamento da parcela 1/6 do emprÃ©stimo' AS description,
        NULL AS blockchain_tx_hash
) AS tmp
WHERE @user_count = 0;

INSERT INTO transactions (transaction_id, sender_id, sender_type, receiver_id, receiver_type, wallet_id, amount, currency, type, status, description, blockchain_tx_hash)
SELECT * FROM (
    SELECT 
        't1000000-0000-0000-0000-000000000002' AS transaction_id,
        'i1000000-0000-0000-0000-000000000001' AS sender_id,
        'INVESTOR' AS sender_type,
        'u1000000-0000-0000-0000-000000000002' AS receiver_id,
        'USER' AS receiver_type,
        'w1000000-0000-0000-0000-000000000011' AS wallet_id,
        8000.00 AS amount,
        'BRL' AS currency,
        'INVESTMENT' AS type,
        'COMPLETED' AS status,
        'Desembolso de emprÃ©stimo aprovado' AS description,
        NULL AS blockchain_tx_hash
) AS tmp
WHERE @user_count = 0;

-- ====================================
-- FIM DO SEED DATA
-- ====================================
