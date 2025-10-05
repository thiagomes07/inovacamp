"""
Script de teste para o sistema de matching automático de crédito.
"""
import requests
import json

BASE_URL = "http://localhost:8000/api/v1"

def test_credit_matching():
    print("=" * 60)
    print("TESTE: Sistema de Matching Automático de Crédito")
    print("=" * 60)
    
    # 1. Login como investidor para verificar a pool
    print("\n1️⃣  Fazendo login como investidor...")
    login_response = requests.post(
        f"{BASE_URL}/auth/login",
        json={
            "email": "carlos.investor@email.com",
            "password": "Password123!"
        }
    )
    
    if login_response.status_code != 200:
        print(f"❌ Erro no login: {login_response.text}")
        return
    
    investor_data = login_response.json()
    investor_id = investor_data['user']['user_id']
    print(f"✅ Login bem-sucedido! Investor ID: {investor_id}")
    
    # 2. Verificar pools do investidor
    print("\n2️⃣  Verificando pools existentes...")
    pools_response = requests.get(f"{BASE_URL}/pool/investor/{investor_id}")
    
    if pools_response.status_code == 200:
        pools = pools_response.json()
        print(f"✅ Pools encontradas: {len(pools)}")
        for pool in pools:
            available = pool.get('available', pool.get('raised_amount', 0))
            print(f"   - {pool['name']}: R$ {available:.2f} disponível")
            print(f"     Min Score: {pool.get('min_score', 'N/A')}, Max Term: {pool.get('max_term_months', 'N/A')} meses")
    else:
        print("⚠️  Nenhuma pool encontrada. Criando uma pool de teste...")
        
        # Criar pool de teste
        pool_data = {
            "investor_id": investor_id,
            "name": "Pool Teste Automático",
            "description": "Pool para testar matching automático",
            "target_amount": 50000.00,
            "duration_months": 24,
            "expected_return": 15.0,
            "min_score": 650,
            "requires_collateral": False,
            "min_interest_rate": 2.0,
            "max_term_months": 12
        }
        
        create_pool_response = requests.post(
            f"{BASE_URL}/pool",
            json=pool_data
        )
        
        if create_pool_response.status_code != 201:
            print(f"❌ Erro ao criar pool: {create_pool_response.text}")
            return
        
        pool = create_pool_response.json()
        print(f"✅ Pool criada: {pool['name']}")
    
    # 3. Login como tomador
    print("\n3️⃣  Fazendo login como tomador...")
    borrower_login = requests.post(
        f"{BASE_URL}/auth/login",
        json={
            "email": "joao.silva@email.com",
            "password": "Password123!"
        }
    )
    
    if borrower_login.status_code != 200:
        print(f"❌ Erro no login do tomador: {borrower_login.text}")
        return
    
    borrower_data = borrower_login.json()
    user_id = borrower_data['user']['user_id']
    user_score = borrower_data['user']['credit_score']
    print(f"✅ Login bem-sucedido! User ID: {user_id}, Score: {user_score}")
    
    # 4. Verificar pools compatíveis
    print("\n4️⃣  Verificando pools compatíveis...")
    compatible_response = requests.get(
        f"{BASE_URL}/credit/compatible-pools/{user_id}",
        params={
            "amount": 5000,
            "duration_months": 12
        }
    )
    
    if compatible_response.status_code == 200:
        compatible_data = compatible_response.json()
        print(f"✅ Pools compatíveis encontradas: {compatible_data['count']}")
        for pool in compatible_data['compatible_pools']:
            print(f"   - {pool['name']}: R$ {pool['available_amount']:.2f}")
            print(f"     Taxa min: {pool['min_interest_rate']}%, Retorno esperado: {pool['expected_return']}%")
    else:
        print(f"⚠️  Nenhuma pool compatível: {compatible_response.text}")
    
    # 5. Criar solicitação de crédito com matching automático
    print("\n5️⃣  Criando solicitação de crédito (matching automático)...")
    credit_request = {
        "user_id": user_id,
        "amount_requested": 5000.00,
        "duration_months": 12,
        "interest_rate": 2.5,
        "approval_type": "automatic",
        "collateral_type": "NONE"
    }
    
    credit_response = requests.post(
        f"{BASE_URL}/credit/request",
        json=credit_request
    )
    
    print(f"\nStatus Code: {credit_response.status_code}")
    
    if credit_response.status_code == 201:
        result = credit_response.json()
        print(f"\n{'='*60}")
        print("RESULTADO:")
        print(f"{'='*60}")
        print(f"✅ {result['message']}")
        print(f"\nStatus: {result['data']['status']}")
        print(f"Request ID: {result['data']['request_id']}")
        
        if result['approved']:
            print("\n🎉 CRÉDITO APROVADO AUTOMATICAMENTE!")
            print(f"Valor: R$ {result['data']['amount_requested']}")
            print(f"Prazo: {result['data']['duration_months']} meses")
            print(f"Taxa: {result['data']['interest_rate']}%")
        else:
            print("\n⚠️  Solicitação criada mas não aprovada automaticamente")
    else:
        print(f"❌ Erro: {credit_response.text}")
    
    # 6. Verificar dashboard do tomador
    print("\n6️⃣  Verificando dashboard do tomador...")
    dashboard_response = requests.get(f"{BASE_URL}/credit/dashboard/{user_id}")
    
    if dashboard_response.status_code == 200:
        dashboard = dashboard_response.json()
        print(f"✅ Dashboard carregado")
        print(f"   Empréstimos ativos: {dashboard['statistics']['active_loans_count']}")
        print(f"   Total emprestado: R$ {dashboard['statistics']['total_borrowed']:.2f}")
        print(f"   Total pago: R$ {dashboard['statistics']['total_paid']:.2f}")
        print(f"   Saldo devedor: R$ {dashboard['statistics']['total_remaining']:.2f}")
    
    print("\n" + "=" * 60)
    print("TESTE CONCLUÍDO!")
    print("=" * 60)

if __name__ == "__main__":
    test_credit_matching()
