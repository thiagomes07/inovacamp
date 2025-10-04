"""
Script de Teste Simples - Validação de Documentos
==================================================

Este script envia documentos da pasta data/ para o backend
e mostra EXATAMENTE o que o backend retornou.

Uso:
    python simple_test.py

Objetivo:
    Verificar se a IA está analisando corretamente cada tipo de documento
    e dando scores apropriados (rigorosos).
"""

import base64
import json
import requests
from pathlib import Path
from typing import Dict
import time

# Configurações
API_BASE_URL = "http://localhost:8000/api/v1"
DATA_DIR = Path("data")

def encode_file_to_base64(file_path: Path) -> str:
    """Converte arquivo para base64."""
    with open(file_path, "rb") as file:
        return base64.b64encode(file.read()).decode('utf-8')

def get_mime_type(file_path: Path) -> str:
    """Detecta tipo MIME."""
    ext = file_path.suffix.lower()
    mime_map = {
        '.jpg': 'image/jpeg',
        '.jpeg': 'image/jpeg',
        '.png': 'image/png',
        '.pdf': 'application/pdf'
    }
    return mime_map.get(ext, 'application/octet-stream')

def detect_document_type(filename: str) -> str:
    """Detecta tipo pelo nome do arquivo."""
    filename_lower = filename.lower()
    
    if any(word in filename_lower for word in ['rg', 'cnh', 'identidade', 'carteira']):
        return 'verify_identity'
    elif any(word in filename_lower for word in ['holerite', 'salario', 'renda', 'contracheque']):
        return 'income_proof'
    elif any(word in filename_lower for word in ['ir', 'imposto', 'declaracao']):
        return 'tax_declaration'
    elif any(word in filename_lower for word in ['luz', 'agua', 'energia', 'conta']):
        return 'utility_bills'
    elif any(word in filename_lower for word in ['extrato', 'banco']):
        return 'bank_statement'
    else:
        return 'custom'

def test_document(file_path: Path) -> Dict:
    """Envia documento para o backend e retorna a resposta."""
    
    print(f"\n{'='*80}")
    print(f"📄 TESTANDO: {file_path.name}")
    print(f"{'='*80}")
    
    # Detectar tipo
    doc_type = detect_document_type(file_path.name)
    doc_names = {
        'verify_identity': 'Documento de Identidade (RG/CNH)',
        'income_proof': 'Comprovante de Renda',
        'tax_declaration': 'Declaração de IR',
        'utility_bills': 'Conta de Utilidades',
        'bank_statement': 'Extrato Bancário',
        'custom': 'Documento Adicional'
    }
    
    print(f"📋 Tipo Detectado: {doc_names.get(doc_type, doc_type)}")
    print(f"📦 Tamanho: {file_path.stat().st_size / 1024:.2f} KB")
    print(f"🔧 Formato: {file_path.suffix.upper()}")
    
    # Preparar payload (file_type e document_type serão inferidos automaticamente)
    base64_content = encode_file_to_base64(file_path)
    
    payload = {
        "user_id": "u1000000-0000-0000-0000-000000000001",  # ID de teste
        "file_content": base64_content,
        "file_name": file_path.name,
        # file_type: INFERIDO AUTOMATICAMENTE pelo backend
        # document_type: INFERIDO AUTOMATICAMENTE pelo backend
        "description": f"Teste de documento - {file_path.name}"
    }
    
    print(f"\n📤 Enviando para: {API_BASE_URL}/score/documents/validate-single")
    print(f"⏳ Aguardando resposta do backend...")
    
    start_time = time.time()
    
    try:
        response = requests.post(
            f"{API_BASE_URL}/score/documents/validate-single",
            json=payload,
            timeout=60
        )
        
        elapsed_time = time.time() - start_time
        
        print(f"✅ Resposta recebida em {elapsed_time:.2f}s")
        print(f"📊 Status HTTP: {response.status_code}")
        
        if response.status_code == 200:
            result = response.json()
            
            print(f"\n{'─'*80}")
            print("🤖 RESPOSTA DO BACKEND:")
            print(f"{'─'*80}")
            print(json.dumps(result, indent=2, ensure_ascii=False))
            print(f"{'─'*80}")
            
            # Análise resumida
            print(f"\n📈 RESUMO DA ANÁLISE:")
            print(f"  ✓ Válido: {'✅ SIM' if result.get('valid') else '❌ NÃO'}")
            print(f"  ✓ Quality Score: {result.get('quality_score', 0)}/100")
            print(f"  ✓ Confiança: {result.get('confidence', 0)}%")
            
            # Mostrar tipos inferidos
            if result.get('inferred_file_type') or result.get('inferred_document_type'):
                print(f"\n  🔍 TIPOS INFERIDOS AUTOMATICAMENTE:")
                if result.get('inferred_file_type'):
                    print(f"      • Tipo de Arquivo: {result['inferred_file_type']}")
                if result.get('inferred_document_type'):
                    print(f"      • Tipo de Documento: {result['inferred_document_type']}")
            
            # Mostrar atualização do score
            if result.get('score_update'):
                score_update = result['score_update']
                print(f"\n  💰 ATUALIZAÇÃO DO SCORE (Curva Logarítmica):")
                print(f"      • Score Anterior: {score_update.get('old_score', 0)}/1000")
                print(f"      • Score Novo: {score_update.get('new_score', 0)}/1000")
                print(f"      • Mudança: {score_update.get('score_change', 0):+d} pontos")
                print(f"\n  📊 PONTOS BRUTOS:")
                print(f"      • Pontos Ganhos Agora: +{score_update.get('raw_points_earned', 0)} pts brutos")
                print(f"      • Total Acumulado: {score_update.get('total_raw_points', 0)} pts brutos")
                
                if score_update.get('curve_info'):
                    curve = score_update['curve_info']
                    print(f"\n  📈 CURVA DE CRESCIMENTO:")
                    print(f"      • Dificuldade Atual: {curve.get('difficulty', 'N/A')}")
                    print(f"      • Fator: {curve.get('growth_factor', 'N/A')}")
            
            if result.get('issues'):
                print(f"\n  ⚠️  Problemas ({len(result['issues'])}):")
                for issue in result['issues']:
                    print(f"      - {issue}")
            
            if result.get('extracted_data'):
                print(f"\n  📊 Dados Extraídos:")
                for key, value in result['extracted_data'].items():
                    print(f"      • {key}: {value}")
            
            return result
        else:
            print(f"❌ Erro HTTP {response.status_code}")
            print(f"Resposta: {response.text}")
            return {"error": response.text}
            
    except requests.exceptions.Timeout:
        print(f"❌ TIMEOUT: Backend demorou mais de 60s")
        return {"error": "timeout"}
    except Exception as e:
        print(f"❌ ERRO: {e}")
        return {"error": str(e)}

def main():
    """Função principal."""
    print("\n" + "="*80)
    print(" "*25 + "🧪 TESTE SIMPLES DE DOCUMENTOS")
    print("="*80)
    print(f"\n📂 Pasta: {DATA_DIR.absolute()}")
    print(f"🌐 API: {API_BASE_URL}")
    
    # Buscar documentos
    valid_extensions = {'.jpg', '.jpeg', '.png', '.pdf'}
    documents = [
        f for f in DATA_DIR.iterdir()
        if f.is_file() and f.suffix.lower() in valid_extensions
    ]
    
    if not documents:
        print(f"\n⚠️  Nenhum documento encontrado em {DATA_DIR.absolute()}")
        print("\n💡 Coloque arquivos .jpg, .jpeg, .png ou .pdf na pasta data/")
        return
    
    documents = sorted(documents)
    print(f"\n✅ {len(documents)} documento(s) encontrado(s)")
    
    # Testar cada documento
    results = []
    
    for i, doc in enumerate(documents, 1):
        print(f"\n\n{'#'*80}")
        print(f"#{' '*30}DOCUMENTO {i}/{len(documents)}{' '*30}#")
        print(f"{'#'*80}")
        
        result = test_document(doc)
        
        results.append({
            'file': doc.name,
            'type': detect_document_type(doc.name),
            'valid': result.get('valid', False),
            'score': result.get('quality_score', 0),
            'confidence': result.get('confidence', 0),
            'issues_count': len(result.get('issues', []))
        })
        
        # Pausa entre documentos
        if i < len(documents):
            print(f"\n{'─'*80}")
            try:
                input("Pressione ENTER para continuar com o próximo documento...")
            except KeyboardInterrupt:
                print("\n\n👋 Teste interrompido")
                break
    
    # Resumo final
    print(f"\n\n{'='*80}")
    print(" "*30 + "📊 RESUMO FINAL")
    print(f"{'='*80}")
    
    print(f"\n📈 Estatísticas:")
    print(f"  • Total testado: {len(results)}")
    print(f"  • Válidos: {sum(1 for r in results if r['valid'])}")
    print(f"  • Inválidos: {sum(1 for r in results if not r['valid'])}")
    print(f"  • Score médio: {sum(r['score'] for r in results) / len(results):.1f}/100")
    
    print(f"\n📋 Resultados individuais:")
    print(f"{'─'*80}")
    print(f"{'Status':<8} {'Score':<8} {'Conf':<8} {'Issues':<8} {'Arquivo'}")
    print(f"{'─'*80}")
    
    for r in results:
        status = "✅ PASS" if r['valid'] else "❌ FAIL"
        print(f"{status:<8} {r['score']:>3}/100  {r['confidence']:>3}%     {r['issues_count']:<8} {r['file']}")
    
    print(f"{'─'*80}")
    
    print("\n✅ Teste concluído!")
    print("\n💡 Dica: Se os scores estão muito altos para documentos incorretos,")
    print("         a IA precisa ser ajustada para ser mais rigorosa.")
    print(f"\n{'='*80}\n")

if __name__ == "__main__":
    main()
