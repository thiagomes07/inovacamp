from fastapi import APIRouter, Depends, Body, UploadFile, File, Form
from sqlalchemy.orm import Session
from typing import Dict, Any, List

from app.database import get_db
from .service import ScoreService

router = APIRouter(prefix="/score", tags=["Score & Documents"])


@router.get("/{user_id}")
def get_user_score(
    user_id: str,
    db: Session = Depends(get_db)
):
    """
    Obtém o score atual do usuário.
    
    Retorna:
    - credit_score: Score de crédito base
    - calculated_score: Score calculado com base em documentos
    - documents_uploaded: Quantidade de documentos enviados
    """
    service = ScoreService(db)
    result = service.get_user_score(user_id)
    return result


@router.get("/weights/info")
def get_document_weights():
    """
    Retorna informações sobre os pesos dos documentos no cálculo do score.
    
    Útil para o frontend exibir quanto cada documento vale.
    """
    return {
        "document_weights": ScoreService.DOCUMENT_WEIGHTS,
        "max_score": 1000,
        "description": "Pesos e pontuações de cada tipo de documento"
    }


@router.post("/documents/validate")
def validate_documents(
    data: Dict[str, Any] = Body(...),
    db: Session = Depends(get_db)
):
    """
    Valida documentos enviados e atualiza o calculated_score do usuário.
    
    **Pipeline de Validação:**
    1. Recebe documentos em base64 do frontend
    2. Valida cada documento usando LLM (GPT-4 Vision, Claude, etc.)
    3. Calcula pontuação baseada em qualidade e tipo
    4. Atualiza calculated_score no banco de dados
    
    **Payload esperado:**
    ```json
    {
        "user_id": "u1000000-0000-0000-0000-000000000001",
        "documents": [
            {
                "file_content": "base64_encoded_string",
                "file_name": "rg_frente.jpg",
                "file_type": "image/jpeg",
                "document_type": "verify_identity",
                "description": "RG frente e verso"
            },
            {
                "file_content": "base64_encoded_string",
                "file_name": "holerite.pdf",
                "file_type": "application/pdf",
                "document_type": "income_proof",
                "description": "Holerite Janeiro 2025"
            }
        ]
    }
    ```
    
    **Tipos de documentos aceitos:**
    - `verify_identity`: RG, CNH (20% do score, 150 pontos base)
    - `income_proof`: Holerite, DECORE, DRE (30% do score, 250 pontos base)
    - `tax_declaration`: IR, IRPF (25% do score, 200 pontos base)
    - `utility_bills`: Contas de luz, água, telefone (15% do score, 100 pontos base)
    - `bank_statement`: Extratos bancários (10% do score, 100 pontos base)
    - `custom`: Outros documentos (5% do score, 50 pontos base)
    
    **Resposta:**
    ```json
    {
        "success": true,
        "validated_documents": 2,
        "failed_documents": 0,
        "failures": [],
        "score_update": {
            "old_score": 750,
            "new_score": 820,
            "points_earned": 70,
            "documents_evaluated": 2,
            "breakdown": {
                "verify_identity": {
                    "description": "Documento de Identidade",
                    "quality_score": 95,
                    "points_earned": 142,
                    "max_points": 150
                }
            }
        }
    }
    ```
    
    **TODO: Integração com LLM**
    - Atualmente usa validação simulada
    - Integrar com OpenAI GPT-4 Vision para análise de imagens
    - Integrar com Claude 3 para análise de PDFs
    - Adicionar OCR para extração de texto
    """
    user_id = data.get("user_id")
    documents = data.get("documents", [])
    
    if not user_id:
        return {"error": "user_id is required"}
    
    if not documents or len(documents) == 0:
        return {"error": "No documents provided"}
    
    service = ScoreService(db)
    result = service.process_document_validation(user_id, documents)
    
    return result


@router.post("/documents/validate-single")
def validate_single_document(
    data: Dict[str, Any] = Body(...),
    db: Session = Depends(get_db)
):
    """
    Valida um único documento e opcionalmente atualiza o score.
    
    **Payload:**
    ```json
    {
        "user_id": "u1000000-0000-0000-0000-000000000001",  // OPCIONAL - se fornecido, atualiza score
        "file_content": "base64_encoded_string",
        "file_name": "documento.pdf",
        "file_type": "application/pdf",
        "document_type": "verify_identity",
        "description": "RG frente"
    }
    ```
    
    **Resposta (sem user_id):**
    ```json
    {
        "valid": true,
        "quality_score": 95,
        "issues": [],
        "confidence": 95,
        "analysis": "Documento válido e legível",
        "extracted_data": {
            "document_number": "123456789",
            "name": "João Silva"
        }
    }
    ```
    
    **Resposta (com user_id):**
    ```json
    {
        "valid": true,
        "quality_score": 95,
        "issues": [],
        "confidence": 95,
        "analysis": "Documento válido e legível",
        "extracted_data": {...},
        "score_update": {
            "old_score": 750,
            "new_score": 892,
            "points_earned": 142,
            "score_change": 142
        }
    }
    ```
    """
    service = ScoreService(db)
    result = service.validate_document_with_llm(data)
    
    # Se user_id foi fornecido E documento é válido, atualizar score
    user_id = data.get("user_id")
    if user_id and result.get("valid"):
        validated_docs = [{
            "document_type": data.get("document_type", "custom"),
            "quality_score": result.get("quality_score", 0),
            "confidence": result.get("confidence", 0),
            "file_name": data.get("file_name", "")
        }]
        
        score_result = service.calculate_score_from_documents(user_id, validated_docs)
        result["score_update"] = score_result
    
    return result


@router.post("/recalculate/{user_id}")
def recalculate_score(
    user_id: str,
    db: Session = Depends(get_db)
):
    """
    Recalcula o score do usuário baseado nos documentos já enviados.
    
    Útil para atualizar score após mudanças no algoritmo.
    
    **Ainda não implementado - Placeholder**
    """
    return {
        "message": "Score recalculation not yet implemented",
        "user_id": user_id
    }
