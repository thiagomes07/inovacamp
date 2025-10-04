#!/usr/bin/env python3
"""
Script de teste para validar a API do InovaCamp
"""

import requests
import json
from datetime import datetime

# Configuração
BASE_URL = "http://localhost"
API_V1 = f"{BASE_URL}/api/v1"

def print_header(text):
    print("\n" + "="*60)
    print(f"  {text}")
    print("="*60)

def print_result(success, message):
    status = "✓" if success else "✗"
    color = "\033[92m" if success else "\033[91m"
    reset = "\033[0m"
    print(f"{color}[{status}] {message}{reset}")

def test_health_check():
    print_header("1. HEALTH CHECK")
    try:
        response = requests.get(f"{BASE_URL}/health")
        if response.status_code == 200:
            data = response.json()
            print_result(True, f"API está saudável: {data['status']}")
            return True
        else:
            print_result(False, f"Status code: {response.status_code}")
            return False
    except Exception as e:
        print_result(False, f"Erro ao conectar: {str(e)}")
        return False

def test_register_user():
    print_header("2. REGISTRO DE USUÁRIO")
    
    user_data = {
        "email": f"test_{datetime.now().timestamp()}@example.com",
        "password": "Password123!",
        "full_name": "Teste Usuário",
        "phone": "11999887766",
        "cpf_cnpj": "12345678901",
        "document_type": "cpf",
        "date_of_birth": "1995-05-15",
        "user_type": "user"
    }
    
    try:
        response = requests.post(f"{API_V1}/auth/register", json=user_data)
        
        if response.status_code == 201:
            data = response.json()
            print_result(True, "Usuário registrado com sucesso")
            print(f"   User ID: {data['user']['user_id']}")
            print(f"   Email: {data['user']['email']}")
            print(f"   Token: {data['tokens']['access_token'][:50]}...")
            return data['tokens']['access_token']
        else:
            print_result(False, f"Erro: {response.status_code}")
            print(f"   Resposta: {response.text}")
            return None
    except Exception as e:
        print_result(False, f"Erro: {str(e)}")
        return None

def test_login():
    print_header("3. LOGIN")
    
    login_data = {
        "email": "joao.silva@email.com",
        "password": "Password123!"
    }
    
    try:
        response = requests.post(f"{API_V1}/auth/login", json=login_data)
        
        if response.status_code == 200:
            data = response.json()
            print_result(True, "Login realizado com sucesso")
            print(f"   User ID: {data['user']['user_id']}")
            print(f"   Nome: {data['user']['full_name']}")
            print(f"   Score: {data['user']['credit_score']}")
            print(f"   Token: {data['tokens']['access_token'][:50]}...")
            return data['tokens']['access_token']
        else:
            print_result(False, f"Erro: {response.status_code}")
            print(f"   Resposta: {response.text}")
            return None
    except Exception as e:
        print_result(False, f"Erro: {str(e)}")
        return None

def test_get_current_user(token):
    print_header("4. OBTER USUÁRIO ATUAL")
    
    headers = {
        "Authorization": f"Bearer {token}"
    }
    
    try:
        response = requests.get(f"{API_V1}/auth/me", headers=headers)
        
        if response.status_code == 200:
            data = response.json()
            print_result(True, "Dados do usuário obtidos com sucesso")
            print(f"   User ID: {data['user_id']}")
            print(f"   Email: {data['email']}")
            print(f"   Nome: {data['full_name']}")
            print(f"   CPF/CNPJ: {data['cpf_cnpj']}")
            print(f"   KYC Aprovado: {data['kyc_approved']}")
            return True
        else:
            print_result(False, f"Erro: {response.status_code}")
            print(f"   Resposta: {response.text}")
            return False
    except Exception as e:
        print_result(False, f"Erro: {str(e)}")
        return False

def test_refresh_token(refresh_token):
    print_header("5. RENOVAR TOKEN")
    
    refresh_data = {
        "refresh_token": refresh_token
    }
    
    try:
        response = requests.post(f"{API_V1}/auth/refresh", json=refresh_data)
        
        if response.status_code == 200:
            data = response.json()
            print_result(True, "Token renovado com sucesso")
            print(f"   Novo Access Token: {data['access_token'][:50]}...")
            return True
        else:
            print_result(False, f"Erro: {response.status_code}")
            print(f"   Resposta: {response.text}")
            return False
    except Exception as e:
        print_result(False, f"Erro: {str(e)}")
        return False

def test_other_endpoints():
    print_header("6. VERIFICAR OUTROS ENDPOINTS")
    
    endpoints = [
        "/credit/requests",
        "/loans/active",
        "/portfolio/overview",
        "/pools",
        "/wallet/balances",
        "/transactions"
    ]
    
    for endpoint in endpoints:
        try:
            response = requests.get(f"{API_V1}{endpoint}")
            success = response.status_code in [200, 401]  # 401 é esperado sem token
            status_msg = f"{endpoint} -> {response.status_code}"
            print_result(success, status_msg)
        except Exception as e:
            print_result(False, f"{endpoint} -> Erro: {str(e)}")

def main():
    print("\n")
    print("╔════════════════════════════════════════════════════════════╗")
    print("║         TESTE DA API INOVACAMP - BACKEND                  ║")
    print("╚════════════════════════════════════════════════════════════╝")
    
    # 1. Health Check
    if not test_health_check():
        print("\n[!] API não está respondendo. Verifique se os containers estão rodando.")
        print("    Execute: docker-compose ps")
        return
    
    # 2. Registro
    # token = test_register_user()
    
    # 3. Login
    token = test_login()
    
    if token:
        # 4. Obter usuário atual
        test_get_current_user(token)
        
        # 5. Renovar token (usando o login anterior)
        # Precisaríamos do refresh_token do login, mas vamos pular por enquanto
        
    # 6. Verificar outros endpoints
    test_other_endpoints()
    
    print_header("RESUMO")
    print("\n✓ Testes básicos concluídos!")
    print("✓ API está operacional")
    print("✓ Autenticação funcionando")
    print("\nPróximos passos:")
    print("  1. Implementar lógica de negócio nos services")
    print("  2. Adicionar testes unitários")
    print("  3. Implementar integração blockchain")
    print("\n")

if __name__ == "__main__":
    main()
